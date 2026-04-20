import { hostMatchesDomain, isPlanAtLeast, Plan } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/common/errors";
import { PrismaClient } from "@/generated/prisma";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function isLocalHostname(hostname: string): boolean {
  if (LOCAL_HOSTS.has(hostname)) return true;
  if (hostname.endsWith(".localhost")) return true;
  return false;
}

@singleton()
export class PublicProjectResolver {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Resolves a project by public ID and optionally enforces a domain allowlist
   * on the requested URL. Rules:
   *   - Empty `domains` → allow any URL (no allowlist configured).
   *   - Non-empty `domains` → URL hostname must match one entry or be a subdomain.
   * In development, localhost URLs bypass the check.
   */
  async resolveAndValidate(publicId: string, url: string) {
    const project = await this.prisma.project.findUnique({
      where: { publicId },
      include: { user: { select: { id: true, plan: true } } },
    });

    if (!project) {
      throw new NotFoundError("Project not found");
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new BadRequestError("Invalid URL");
    }
    const hostname = parsed.hostname.toLowerCase();

    if (process.env.NODE_ENV === "development" && isLocalHostname(hostname)) {
      return project;
    }

    if (project.domains.length === 0) {
      return project;
    }

    const allowed = project.domains.some((d) => hostMatchesDomain(hostname, d));
    if (!allowed) {
      throw new ForbiddenError(`Domain ${hostname} is not allowed for this project.`);
    }

    return project;
  }

  canServeImage(currentPlan: Plan, generatedOnPlan: Plan): boolean {
    return isPlanAtLeast(currentPlan, generatedOnPlan);
  }
}
