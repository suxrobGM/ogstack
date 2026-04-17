import { isPlanAtLeast, Plan } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { BadRequestError, ForbiddenError, NotFoundError } from "@/common/errors";
import { PrismaClient } from "@/generated/prisma";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function isLocalHostname(hostname: string): boolean {
  if (LOCAL_HOSTS.has(hostname)) return true;
  if (hostname.endsWith(".localhost")) return true;
  return false;
}

function hostMatchesDomain(hostname: string, domain: string): boolean {
  const normalized = domain.toLowerCase();
  return hostname === normalized || hostname.endsWith(`.${normalized}`);
}

@singleton()
export class PublicProjectResolver {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Resolves a project by public ID and enforces domain allowlist on the
   * requested URL. Domains are mandatory; an empty list means something went
   * wrong at project creation. In development, localhost URLs bypass the check.
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
      throw new ForbiddenError(
        "Project has no allowed domains configured. Add at least one domain to serve images.",
      );
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
