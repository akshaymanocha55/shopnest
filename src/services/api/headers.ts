/**
 * The single place where request headers are built.
 * The API client calls this once per request, so no individual API call sets headers itself.
 */
import { APP } from '@/constants';
import { isBrowser } from '@/lib/utils';
import { tokenManager } from '../auth/token-manager';

export interface HeaderOptions {
  /** Attach the bearer token (default: true). Public endpoints can pass false. */
  auth?: boolean;
  /** Set JSON content type when a body is sent. */
  hasBody?: boolean;
  /** Extra per-request headers, merged last. */
  extra?: HeadersInit;
  /**
   * Third-party APIs only get standard headers: a custom header would trigger a CORS
   * preflight that those servers may not allow.
   */
  thirdParty?: boolean;
}

const DEFAULT_HEADERS: Record<string, string> = { Accept: 'application/json' };
const CLIENT_HEADER = ['X-Client-App', `${APP.name.toLowerCase()}-web`] as const;

export async function buildHeaders({
  auth = true,
  hasBody = false,
  extra,
  thirdParty = false,
}: HeaderOptions = {}): Promise<Headers> {
  const headers = new Headers(DEFAULT_HEADERS);
  if (!thirdParty) headers.set(...CLIENT_HEADER);

  if (hasBody) headers.set('Content-Type', 'application/json');

  // Tokens live in browser cookies; server-side requests only hit public endpoints.
  if (auth && isBrowser()) {
    const token = await tokenManager.getValidAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  if (extra) new Headers(extra).forEach((value, key) => headers.set(key, value));

  return headers;
}
