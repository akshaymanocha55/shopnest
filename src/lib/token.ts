/**
 * Minimal JWT (HS256) implementation for the mock auth service.
 * A real backend would issue and verify these; here the browser plays that role.
 */
import { env } from '@/config/env';
import { TOKEN_TTL } from '@/constants';
import type { AuthTokens, TokenPayload } from '@/types/auth';
import { base64Url, sign } from './crypto';
import { generateId } from './utils';

const HEADER = base64Url.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const nowSeconds = () => Math.floor(Date.now() / 1000);

export async function createToken(
  sub: string,
  type: TokenPayload['type'],
  ttlSeconds: number,
): Promise<string> {
  const iat = nowSeconds();
  const payload: TokenPayload = { sub, type, iat, exp: iat + ttlSeconds, jti: generateId() };
  const body = base64Url.encode(JSON.stringify(payload));
  const signature = await sign(`${HEADER}.${body}`, env.tokenSecret);
  return `${HEADER}.${body}.${signature}`;
}

export async function issueTokens(userId: string): Promise<AuthTokens> {
  const [accessToken, refreshToken] = await Promise.all([
    createToken(userId, 'access', TOKEN_TTL.accessSeconds),
    createToken(userId, 'refresh', TOKEN_TTL.refreshSeconds),
  ]);
  return { accessToken, refreshToken };
}

/** Read the payload without verifying the signature (for expiry checks only). */
export function decodeToken(token: string | null | undefined): TokenPayload | null {
  if (!token) return null;
  try {
    const [, body] = token.split('.');
    return JSON.parse(base64Url.decode(body)) as TokenPayload;
  } catch {
    return null;
  }
}

/** Verify signature, expected type and expiry. Returns the payload or null. */
export async function verifyToken(
  token: string | null | undefined,
  expectedType: TokenPayload['type'],
): Promise<TokenPayload | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const expected = await sign(`${parts[0]}.${parts[1]}`, env.tokenSecret);
  if (expected !== parts[2]) return null;
  const payload = decodeToken(token);
  if (!payload || payload.type !== expectedType || payload.exp <= nowSeconds()) return null;
  return payload;
}

/** True when the token is missing, invalid or expires within the leeway window. */
export function isTokenExpiring(
  token: string | null | undefined,
  leewaySeconds: number = TOKEN_TTL.refreshLeewaySeconds,
): boolean {
  const payload = decodeToken(token);
  return !payload || payload.exp - leewaySeconds <= nowSeconds();
}
