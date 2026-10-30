/**
 * The single HTTP client. GET, POST, PUT and DELETE all go through `request()`,
 * which builds headers once (see headers.ts), applies a timeout, retries safe requests,
 * refreshes the token on 401 and normalises every failure into an ApiError.
 */
import { env } from '@/config/env';
import { ERROR_MESSAGES, HTTP_STATUS, REQUEST_TIMEOUT_MS } from '@/constants';
import { ApiError } from '@/lib/errors';
import { sleep } from '@/lib/utils';
import { tokenManager } from '../auth/token-manager';
import { buildHeaders } from './headers';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  params?: Record<string, QueryValue>;
  body?: unknown;
  headers?: HeadersInit;
  /** Send the auth token (default true). */
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Retries for network/5xx errors. Defaults to 1 for GET, 0 otherwise. */
  retries?: number;
  /** Passed through to Next.js fetch on the server. */
  cache?: RequestCache;
}

function buildUrl(endpoint: string, params?: RequestOptions['params']): string {
  const url = new URL(endpoint.replace(/^\//, ''), `${env.apiBaseUrl}/`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

function withTimeout(timeoutMs: number, signal?: AbortSignal): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
}

async function parseBody<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(ERROR_MESSAGES.server, response.status, 'SERVER');
  }
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return new ApiError(ERROR_MESSAGES.timeout, 0, 'TIMEOUT');
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError('Request was cancelled', 0, 'UNKNOWN');
  }
  return new ApiError(ERROR_MESSAGES.network, 0, 'NETWORK');
}

const isRetryable = (error: ApiError) =>
  error.code === 'NETWORK' || error.code === 'TIMEOUT' || error.status >= HTTP_STATUS.serverError;

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  options: RequestOptions = {},
  attempt = 0,
  hasRefreshed = false,
): Promise<T> {
  const {
    params,
    body,
    headers,
    auth = true,
    signal,
    timeoutMs = REQUEST_TIMEOUT_MS,
    cache,
  } = options;
  const maxRetries = options.retries ?? (method === 'GET' ? 1 : 0);

  try {
    const response = await fetch(buildUrl(endpoint, params), {
      method,
      headers: await buildHeaders({ auth, hasBody: body !== undefined, extra: headers }),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: withTimeout(timeoutMs, signal),
      cache,
    });

    if (response.status === HTTP_STATUS.unauthorized && auth && !hasRefreshed) {
      // Access token rejected: refresh once, then replay the original request.
      const refreshed = await tokenManager.refresh();
      if (refreshed) return request<T>(method, endpoint, options, attempt, true);
      tokenManager.notifySessionExpired();
    }

    if (!response.ok) throw ApiError.fromStatus(response.status);

    return await parseBody<T>(response);
  } catch (error) {
    const apiError = toApiError(error);
    if (attempt < maxRetries && isRetryable(apiError)) {
      await sleep(300 * 2 ** attempt); // exponential backoff
      return request<T>(method, endpoint, options, attempt + 1, hasRefreshed);
    }
    throw apiError;
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('GET', endpoint, options),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', endpoint, { ...options, body }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', endpoint, { ...options, body }),
  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('DELETE', endpoint, options),
};
