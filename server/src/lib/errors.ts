export class AppError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { code?: number | string; message?: string; details?: string };
    const message = maybeError.message ?? 'Unexpected translation failure.';

    if (maybeError.code === 3) {
      return new AppError(message, 'INVALID_INPUT', 400);
    }
    if (maybeError.code === 7) {
      return new AppError(message, 'FORBIDDEN', 403);
    }
    if (maybeError.code === 8) {
      return new AppError(message, 'RATE_LIMITED', 429);
    }
    if (maybeError.code === 16) {
      return new AppError(message, 'UNAUTHENTICATED', 401);
    }
  }

  return new AppError('Unexpected translation failure.', 'UPSTREAM_ERROR', 502);
}
