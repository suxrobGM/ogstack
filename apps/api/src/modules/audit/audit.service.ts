import { singleton } from "tsyringe";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/common/errors";
import { logger } from "@/common/logger";
import { ScraperService } from "@/common/services/scraper.service";
import { AuditAiStatus, Plan, PrismaClient } from "@/generated/prisma";
import { UsageService } from "@/modules/usage";
import { AuditAnalysisService } from "./audit-analysis.service";
import { extractAuditMetadata, probeOgImage, type AuditMetadata } from "./audit.extractor";
import type {
  AuditAiInsights,
  AuditHistoryItem,
  AuditHistoryQuery,
  AuditHistoryResponse,
  AuditIssue,
  AuditPreviewMetadata,
  AuditReport as AuditReportDto,
} from "./audit.schema";
import { computeScore, runChecks } from "./audit.scoring";

type CategoryScores = { og: number; twitter: number; seo: number };

interface CreateAuditParams {
  url: string;
  userId: string | null;
  includeAi?: boolean;
}

@singleton()
export class AuditService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly scraper: ScraperService,
    private readonly auditAnalysis: AuditAnalysisService,
    private readonly usageService: UsageService,
  ) {}

  async create(params: CreateAuditParams): Promise<AuditReportDto> {
    const { url: rawUrl, userId, includeAi } = params;

    const shouldEnrich = await this.checkAiEligibility(userId, includeAi);

    const { url, html } = await this.scraper.fetchValidatedHtml(rawUrl);
    const meta = await extractAuditMetadata(url, html);

    if (meta.ogImage) {
      const probe = await probeOgImage(meta.ogImage);
      meta.ogImageBytes = probe.bytes;
    }

    const issues = runChecks(meta);
    const scores = computeScore(issues);

    const metadata: AuditPreviewMetadata = {
      title: meta.ogTitle ?? meta.twitterTitle ?? meta.title,
      description: meta.ogDescription ?? meta.twitterDescription ?? meta.description,
      image: meta.ogImage ?? meta.twitterImage,
      siteName: meta.ogSiteName,
      url: meta.url,
      favicon: meta.favicon,
      twitterCardType: meta.twitterCard,
    };

    const aiStatus: AuditAiStatus = shouldEnrich ? AuditAiStatus.PENDING : AuditAiStatus.SKIPPED;

    const saved = await this.prisma.auditReport.create({
      data: {
        userId,
        url: meta.url,
        overallScore: scores.overall,
        letterGrade: scores.letterGrade,
        metadata: metadata as unknown as AuditPreviewMetadata,
        issues: issues as unknown as AuditIssue[],
        categoryScores: scores.byCategory as unknown as CategoryScores,
        aiStatus,
      },
    });

    if (shouldEnrich && userId) {
      void this.enrichWithAi(saved.id, userId, meta, issues);
    }

    return {
      id: saved.id,
      url: saved.url,
      overallScore: saved.overallScore,
      letterGrade: saved.letterGrade,
      createdAt: saved.createdAt,
      metadata,
      issues,
      categoryScores: scores.byCategory,
      aiStatus,
      aiAnalysis: null,
      aiError: null,
    };
  }

  /** Reports are publicly readable by UUID — the ID is unguessable and the
   *  whole point is shareable links. Ownership is enforced only on `listForUser`. */
  async getById(id: string): Promise<AuditReportDto> {
    const row = await this.prisma.auditReport.findUnique({ where: { id } });
    if (!row) throw new NotFoundError("Audit report not found");

    return {
      id: row.id,
      url: row.url,
      overallScore: row.overallScore,
      letterGrade: row.letterGrade,
      createdAt: row.createdAt,
      metadata: row.metadata as unknown as AuditPreviewMetadata,
      issues: row.issues as unknown as AuditIssue[],
      categoryScores: row.categoryScores as unknown as CategoryScores,
      aiStatus: row.aiStatus ?? null,
      aiAnalysis: (row.aiAnalysis as AuditAiInsights | null) ?? null,
      aiError: row.aiError ?? null,
    };
  }

  async listForUser(userId: string, query: AuditHistoryQuery): Promise<AuditHistoryResponse> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    const where = { userId };

    const [items, total] = await Promise.all([
      this.prisma.auditReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          overallScore: true,
          letterGrade: true,
          createdAt: true,
        },
      }),
      this.prisma.auditReport.count({ where }),
    ]);

    return {
      items: items.map(
        (row): AuditHistoryItem => ({
          id: row.id,
          url: row.url,
          overallScore: row.overallScore,
          letterGrade: row.letterGrade,
          createdAt: row.createdAt,
        }),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Delete anonymous reports older than the retention window. Authenticated
   *  users' history is preserved regardless of age. */
  async deleteStaleAnonymous(olderThanDays = 30): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const { count } = await this.prisma.auditReport.deleteMany({
      where: { userId: null, createdAt: { lt: cutoff } },
    });
    return count;
  }

  /**
   * Checks whether the requester may enrich this audit with AI. Anonymous
   * requests silently fall through to `skipped`. FREE users get a 403 so the UI
   * can surface the upgrade path. Paid users additionally hit the monthly audit
   * quota — throws PlanLimitError when exhausted.
   */
  private async checkAiEligibility(userId: string | null, includeAi = false): Promise<boolean> {
    if (!includeAi) return false;
    if (!userId) return false;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    if (!user || user.plan === Plan.FREE) {
      throw new ForbiddenError("AI audit recommendations require a Plus plan or higher.");
    }

    await this.usageService.enforceAiAuditQuota(userId);
    return true;
  }

  private async enrichWithAi(
    reportId: string,
    userId: string,
    metadata: AuditMetadata,
    issues: AuditIssue[],
  ): Promise<void> {
    try {
      if (!this.auditAnalysis.isEnabled()) {
        throw new BadRequestError(
          "No AI provider configured — set PROMPT_PROVIDER and related env vars.",
        );
      }

      const insights = await this.auditAnalysis.analyze({ metadata, issues });
      await this.prisma.auditReport.update({
        where: { id: reportId },
        data: {
          aiStatus: AuditAiStatus.READY,
          aiAnalysis: insights as unknown as object,
          aiError: null,
        },
      });
      await this.usageService.recordUsage(userId, null, { isAudit: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn({ reportId, message }, "Audit AI enrichment failed");

      await this.prisma.auditReport.update({
        where: { id: reportId },
        data: { aiStatus: AuditAiStatus.FAILED, aiError: message },
      });
    }
  }
}
