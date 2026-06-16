export class AppError extends Error {
  public readonly statusCode: number;
  public readonly success: false;
  public readonly isOperational: boolean;
  public readonly errors?: unknown;

  constructor(
    message: string,
    statusCode: number,
    errors?: unknown,
    isOperational = true
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.isOperational = isOperational;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
