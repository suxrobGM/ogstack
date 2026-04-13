import { singleton } from "tsyringe";
import { NotFoundError } from "@/common/errors";
import { ScraperService } from "@/common/services/scraper.service";
import { PrismaClient } from "@/generated/prisma";
import { extractAuditMetadata, probeOgImage } from "./audit.extractor";
import type {
  AuditHistoryItem,
  AuditHistoryQuery,
  AuditHistoryResponse,
  AuditIssue,
  AuditPreviewMetadata,
  AuditReport as AuditReportDto,
} from "./audit.schema";
import { computeScore, runChecks } from "./audit.scoring";

type CategoryScores = { og: number; twitter: number; seo: number };

@singleton()
export class AuditService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly scraper: ScraperService,
  ) {}

  async create(rawUrl: string, userId: string | null): Promise<AuditReportDto> {
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

    const saved = await this.prisma.auditReport.create({
      data: {
        userId,
        url: meta.url,
        overallScore: scores.overall,
        letterGrade: scores.letterGrade,
        metadata: metadata as unknown as AuditPreviewMetadata,
        issues: issues as unknown as AuditIssue[],
        categoryScores: scores.byCategory as unknown as CategoryScores,
      },
    });

    return {
      id: saved.id,
      url: saved.url,
      overallScore: saved.overallScore,
      letterGrade: saved.letterGrade,
      createdAt: saved.createdAt,
      metadata,
      issues,
      categoryScores: scores.byCategory,
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
}
