/**
 * Keeps the access token fresh. Before each authenticated request the API layer asks for a
 * valid token; if it is about to expire we refresh it first. Concurrent callers share one
 * in-flight refresh (single-flight) so we never fire several refresh calls at once.
 */
import { secureCookies } from '@/lib/secure-cookies';
import { isTokenExpiring } from '@/lib/token';
import { mockAuthServer } from './mock-auth-server';

type Listener = () => void;

let refreshPromise: Promise<string | null> | null = null;
const sessionExpiredListeners = new Set<Listener>();

async function doRefresh(): Promise<string | null> {
  try {
    const tokens = await mockAuthServer.refresh(await secureCookies.getRefreshToken());
    await secureCookies.saveTokens(tokens);
    return tokens.accessToken;
  } catch {
    return null;
  }
}

export const tokenManager = {
  /** Returns a usable access token, refreshing it when needed, or null for guests. */
  async getValidAccessToken(): Promise<string | null> {
    const accessToken = await secureCookies.getAccessToken();
    if (!accessToken) return null;
    if (!isTokenExpiring(accessToken)) return accessToken;
    return this.refresh();
  },

  refresh(): Promise<string | null> {
    refreshPromise ??= doRefresh().finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  },

  onSessionExpired(listener: Listener): () => void {
    sessionExpiredListeners.add(listener);
    return () => sessionExpiredListeners.delete(listener);
  },

  notifySessionExpired() {
    secureCookies.clear();
    sessionExpiredListeners.forEach((listener) => listener());
  },
};
