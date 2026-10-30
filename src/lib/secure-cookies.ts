/**
 * Encrypted cookie storage for sensitive values (tokens, user id, profile).
 * Every value is AES-GCM encrypted before it is written and decrypted when read.
 */
import Cookies from 'js-cookie';
import { COOKIE_KEYS, TOKEN_TTL } from '@/constants';
import type { AuthTokens, User } from '@/types/auth';
import { decrypt, encrypt } from './crypto';

const baseOptions = (): Cookies.CookieAttributes => ({
  path: '/',
  sameSite: 'strict',
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
});

const refreshDays = TOKEN_TTL.refreshSeconds / 86_400;

async function setEncrypted(name: string, value: unknown, expiresDays: number) {
  Cookies.set(name, await encrypt(value), { ...baseOptions(), expires: expiresDays });
}

async function getDecrypted<T>(name: string): Promise<T | null> {
  return decrypt<T>(Cookies.get(name));
}

export const secureCookies = {
  async saveSession(user: User, tokens: AuthTokens) {
    await Promise.all([
      setEncrypted(COOKIE_KEYS.accessToken, tokens.accessToken, refreshDays),
      setEncrypted(COOKIE_KEYS.refreshToken, tokens.refreshToken, refreshDays),
      setEncrypted(COOKIE_KEYS.userId, user.id, refreshDays),
      setEncrypted(COOKIE_KEYS.user, user, refreshDays),
    ]);
  },

  async saveTokens(tokens: AuthTokens) {
    await Promise.all([
      setEncrypted(COOKIE_KEYS.accessToken, tokens.accessToken, refreshDays),
      setEncrypted(COOKIE_KEYS.refreshToken, tokens.refreshToken, refreshDays),
    ]);
  },

  saveUser: (user: User) => setEncrypted(COOKIE_KEYS.user, user, refreshDays),

  getAccessToken: () => getDecrypted<string>(COOKIE_KEYS.accessToken),
  getRefreshToken: () => getDecrypted<string>(COOKIE_KEYS.refreshToken),
  getUserId: () => getDecrypted<string>(COOKIE_KEYS.userId),
  getUser: () => getDecrypted<User>(COOKIE_KEYS.user),

  clear() {
    Object.values(COOKIE_KEYS).forEach((name) => Cookies.remove(name, { path: '/' }));
  },
};
