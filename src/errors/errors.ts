export abstract class AppError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}