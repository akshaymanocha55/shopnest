import { ERROR_MESSAGES, HTTP_STATUS } from '@/constants';

export type ApiErrorCode =
  'TIMEOUT' | 'NETWORK' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'SERVER' | 'VALIDATION' | 'UNKNOWN';

/** Single error type thrown by the API layer, so the UI handles errors consistently. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(message: string, status = 0, code: ApiErrorCode = 'UNKNOWN') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }

  static fromStatus(status: number, message?: string): ApiError {
    if (status === HTTP_STATUS.unauthorized)
      return new ApiError(message ?? ERROR_MESSAGES.unauthorized, status, 'UNAUTHORIZED');
    if (status === HTTP_STATUS.notFound)
      return new ApiError(message ?? ERROR_MESSAGES.notFound, status, 'NOT_FOUND');
    if (status >= HTTP_STATUS.serverError)
      return new ApiError(message ?? ERROR_MESSAGES.server, status, 'SERVER');
    return new ApiError(message ?? ERROR_MESSAGES.unknown, status, 'UNKNOWN');
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

/** Turn anything thrown into a message that is safe to show the user. */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return ERROR_MESSAGES.unknown;
}
