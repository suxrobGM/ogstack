import { singleton } from "tsyringe";
import { BadRequestError, NotFoundError } from "@/common/errors";
import { logger } from "@/common/logger";
import { ScraperService, type UrlMetadata } from "@/common/services/scraper";
import { AuditAiStatus, PrismaClient } from "@/generated/prisma";
import { PageAnalysisService } from "@/modules/page-analysis";
import { UsageService } from "@/modules/usage";
import { PageAuditAnalysisService } from "./page-audit-analysis.service";
import type {
  PageAuditAi,
  PageAuditAiInsights,
  PageAuditHistoryItem,
  PageAuditHistoryQuery,
  PageAuditHistoryResponse,
  PageAuditIssue,
  PageAuditPreviewMetadata,
  PageAuditReport as PageAuditReportDto,
} from "./page-audit.schema";
import { computeScore, runChecks } from "./page-audit.scoring";

type CategoryScores = { og: number; twitter: number; seo: number };

interface CreateAuditParams {
  url: string;
  userId: string | null;
  includeAi?: boolean;
}

@singleton()
export class PageAuditService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly scraper: ScraperService,
    private readonly auditAnalysis: PageAuditAnalysisService,
    private readonly pageAnalysis: PageAnalysisService,
    private readonly usageService: UsageService,
  ) {}

  async create(params: CreateAuditParams): Promise<PageAuditReportDto> {
    const { url: rawUrl, userId, includeAi } = params;

    const shouldEnrich = await this.checkAiEligibility(userId, includeAi);

    const meta = await this.scraper.extractMetadata(rawUrl);

    const issues = runChecks(meta);
    const scores = computeScore(issues);

    const metadata: PageAuditPreviewMetadata = {
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
        metadata: metadata as unknown as PageAuditPreviewMetadata,
        issues: issues as unknown as PageAuditIssue[],
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
      ai: { status: aiStatus, analysis: null, error: null },
    };
  }

  /** Reports are publicly readable by UUID — the ID is unguessable and the
   *  whole point is shareable links. Ownership is enforced only on `listForUser`. */
  async getById(id: string): Promise<PageAuditReportDto> {
    const row = await this.prisma.auditReport.findUnique({ where: { id } });
    if (!row) throw new NotFoundError("Audit report not found");

    const ai: PageAuditAi | null = row.aiStatus
      ? {
          status: row.aiStatus,
          analysis: (row.aiAnalysis as PageAuditAiInsights | null) ?? null,
          error: row.aiError ?? null,
        }
      : null;

    return {
      id: row.id,
      url: row.url,
      overallScore: row.overallScore,
      letterGrade: row.letterGrade,
      createdAt: row.createdAt,
      metadata: row.metadata as unknown as PageAuditPreviewMetadata,
      issues: row.issues as unknown as PageAuditIssue[],
      categoryScores: row.categoryScores as unknown as CategoryScores,
      ai,
    };
  }

  async listForUser(
    userId: string,
    query: PageAuditHistoryQuery,
  ): Promise<PageAuditHistoryResponse> {
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
        (row): PageAuditHistoryItem => ({
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
   * requests silently fall through to `skipped`. All authenticated users share
   * a per-plan monthly audit quota — throws PlanLimitError when
   * exhausted so the UI can surface the upgrade path.
   */
  private async checkAiEligibility(userId: string | null, includeAi = false): Promise<boolean> {
    if (!includeAi) return false;
    if (!userId) return false;

    await this.usageService.enforceAiAuditQuota(userId);
    return true;
  }

  private async enrichWithAi(
    reportId: string,
    userId: string,
    metadata: UrlMetadata,
    issues: PageAuditIssue[],
  ): Promise<void> {
    try {
      if (!this.auditAnalysis.isEnabled()) {
        throw new BadRequestError(
          "No AI provider configured — set PROMPT_PROVIDER and related env vars.",
        );
      }

      const { ai: pageAnalysis } = await this.pageAnalysis.getPageContext({
        url: metadata.url,
        userId,
        cacheOnly: true,
      });
      const insights = await this.auditAnalysis.analyze({ metadata, issues, pageAnalysis });
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
