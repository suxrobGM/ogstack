import { describe, expect, it } from "bun:test";
import { Elysia, t } from "elysia";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/common/errors";
import { errorMiddleware } from "./error.middleware";

function createTestApp() {
  return new Elysia()
    .use(errorMiddleware)
    .post("/validate", () => "ok", { body: t.Object({ name: t.String() }) })
    .get("/bad", () => {
      throw new BadRequestError("Bad input");
    })
    .get("/unauth", () => {
      throw new UnauthorizedError("Missing token");
    })
    .get("/forbidden", () => {
      throw new ForbiddenError("Insufficient permissions");
    })
    .get("/notfound", () => {
      throw new NotFoundError("Missing");
    })
    .get("/conflict", () => {
      throw new ConflictError("Already exists");
    })
    .get("/boom", () => {
      throw new Error("Kaboom");
    });
}

describe("errorMiddleware", () => {
  it("maps BadRequestError to 400 with json body", async () => {
    const app = createTestApp();
    const res = await app.handle(new Request("http://localhost/bad"));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string; message: string };
    expect(body.code).toBeDefined();
    expect(body.message).toBe("Bad input");
  });

  it("maps UnauthorizedError to 401", async () => {
    const app = createTestApp();
    const res = await app.handle(new Request("http://localhost/unauth"));
    expect(res.status).toBe(401);
  });

  it("maps ForbiddenError to 403", async () => {
    const app = createTestApp();
    const res = await app.handle(new Request("http://localhost/forbidden"));
    expect(res.status).toBe(403);
  });

  it("maps NotFoundError to 404", async () => {
    const app = createTestApp();
    const res = await app.handle(new Request("http://localhost/notfound"));
    expect(res.status).toBe(404);
  });

  it("maps ConflictError to 409", async () => {
    const app = createTestApp();
    const res = await app.handle(new Request("http://localhost/conflict"));
    expect(res.status).toBe(409);
  });

  it("maps unknown errors to 500", async () => {
    const app = createTestApp();
    const res = await app.handle(new Request("http://localhost/boom"));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { code: string; message: string };
    expect(body.message).toBe("Internal server error");
  });

  it("maps elysia VALIDATION error to 400", async () => {
    const app = createTestApp();
    const res = await app.handle(
      new Request("http://localhost/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wrong: "field" }),
      }),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBeDefined();
  });

  it("maps elysia PARSE error to 400 malformed body", async () => {
    const app = createTestApp();
    const res = await app.handle(
      new Request("http://localhost/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not json",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown routes (NOT_FOUND code)", async () => {
    const app = createTestApp();
    const res = await app.handle(new Request("http://localhost/no-such-route"));
    expect(res.status).toBe(404);
  });
});
