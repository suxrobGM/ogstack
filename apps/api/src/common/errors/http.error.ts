import { ERROR_CODES, type ErrorCode } from "@ogstack/shared";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ErrorCode | string,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad request") {
    super(400, ERROR_CODES.BAD_REQUEST, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, ERROR_CODES.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(403, ERROR_CODES.FORBIDDEN, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not found") {
    super(404, ERROR_CODES.NOT_FOUND, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflict") {
    super(409, ERROR_CODES.CONFLICT, message);
  }
}

export class PlanLimitError extends HttpError {
  constructor(message: string) {
    super(403, ERROR_CODES.PLAN_LIMIT_EXCEEDED, message);
  }
}

export class ImageConflictError extends HttpError {
  constructor(
    message: string,
    public readonly existingId: string,
  ) {
    super(409, ERROR_CODES.IMAGE_EXISTS, message);
  }
}

export class TierLockedError extends HttpError {
  constructor(message = "Image is locked — current plan tier is lower than generation tier") {
    super(402, ERROR_CODES.TIER_LOCKED, message);
  }
}
