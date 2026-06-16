import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import logger from "../../common/utils/logger";
import configs from "../../configs/env.config";

function normalizeError(err: unknown): AppError {
  if (err instanceof AppError) {
    return err;
  }

  const appError = new AppError("Internal Server Error", 500, null, false);

  if (err instanceof Error) {
    appError.stack = err.stack;
  }

  return appError;
}

function buildErrorResponse(err: AppError) {
  const response: {
    success: false;
    statusCode: number;
    message: string;
    errors: unknown;
  } = {
    success: false,
    statusCode: err.statusCode,
    message: err.message,
    errors: null,
  };

  if (configs.app.env === "development") {
    response.errors = err.errors ?? err.stack ?? null;
  }

  return response;
}

export default function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const normalizedError = normalizeError(err);

  logger.error({
    message: normalizedError.message,
    statusCode: normalizedError.statusCode,
    path: req.originalUrl,
    method: req.method,
    stack:
      configs.app.env === "development" ? normalizedError.stack : undefined,
  });

  const responseBody = buildErrorResponse(normalizedError);

  res.status(normalizedError.statusCode).json(responseBody);
}
