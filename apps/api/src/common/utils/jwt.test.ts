import { describe, expect, it } from "bun:test";
import { buildAuthResponse, generateAccessToken, generateRefreshToken, verifyToken } from "./jwt";

const testUser = {
  id: "user-1",
  role: "USER",
  email: "test@example.com",
  plan: "FREE",
  name: "Test User",
};

describe("generateAccessToken", () => {
  it("should return a JWT string", async () => {
    const token = await generateAccessToken(testUser);
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("should contain the correct claims", async () => {
    const token = await generateAccessToken(testUser);
    const payload = await verifyToken(token);
    expect(payload.sub).toBe("user-1");
    expect(payload.role).toBe("USER");
    expect(payload.email).toBe("test@example.com");
    expect(payload.plan).toBe("FREE");
    expect(payload.type).toBe("access");
  });
});

describe("generateRefreshToken", () => {
  it("should return a JWT string", async () => {
    const token = await generateRefreshToken("user-1");
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
  });

  it("should contain refresh type claim", async () => {
    const token = await generateRefreshToken("user-1");
    const payload = await verifyToken(token);
    expect(payload.sub).toBe("user-1");
    expect(payload.type).toBe("refresh");
  });
});

describe("verifyToken", () => {
  it("should verify a valid token", async () => {
    const token = await generateAccessToken(testUser);
    const payload = await verifyToken(token);
    expect(payload.sub).toBe("user-1");
  });

  it("should reject an invalid token", () => {
    expect(verifyToken("invalid.token.here")).rejects.toThrow();
  });

  it("should reject a tampered token", async () => {
    const token = await generateAccessToken(testUser);
    const tampered = token.slice(0, -5) + "XXXXX";
    expect(verifyToken(tampered)).rejects.toThrow();
  });
});

describe("buildAuthResponse", () => {
  it("should return user, accessToken, and refreshToken", async () => {
    const result = await buildAuthResponse(testUser);
    expect(result.user).toEqual({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
    });
    expect(typeof result.accessToken).toBe("string");
    expect(typeof result.refreshToken).toBe("string");
  });

  it("should produce valid tokens", async () => {
    const result = await buildAuthResponse(testUser);
    const access = await verifyToken(result.accessToken);
    expect(access.type).toBe("access");
    const refresh = await verifyToken(result.refreshToken);
    expect(refresh.type).toBe("refresh");
  });
});
