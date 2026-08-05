export abstract class AppError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}