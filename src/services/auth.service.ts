/**
 * Auth API used by the UI. Orchestrates the mock auth server, encrypted cookies and
 * FakeStore user endpoints (POST /users on signup, PUT /users/:id on profile update).
 */
import { API_ENDPOINTS } from '@/constants';
import { secureCookies } from '@/lib/secure-cookies';
import { isTokenExpiring } from '@/lib/token';
import type { Session, SignupInput, User } from '@/types/auth';
import { apiClient } from './api/client';
import { mockAuthServer } from './auth/mock-auth-server';
import { tokenManager } from './auth/token-manager';

/** FakeStore calls are best-effort: their data is not persisted, so failures must not block auth. */
async function mirrorToFakeStore(task: () => Promise<unknown>) {
  try {
    await task();
  } catch (error) {
    console.warn('[auth] FakeStore sync skipped:', error);
  }
}

export const authService = {
  requestLoginOtp: (mobile: string) => mockAuthServer.requestLoginOtp(mobile),
  requestSignupOtp: (input: SignupInput) => mockAuthServer.requestSignupOtp(input),

  async login(mobile: string, otp: string): Promise<User> {
    const session = await mockAuthServer.verifyLogin(mobile, otp);
    await secureCookies.saveSession(session.user, session.tokens);
    return session.user;
  },

  async signup(input: SignupInput, otp: string): Promise<User> {
    const session: Session = await mockAuthServer.verifySignup(input, otp);
    await secureCookies.saveSession(session.user, session.tokens);
    void mirrorToFakeStore(() =>
      apiClient.post(API_ENDPOINTS.users, {
        email: session.user.email,
        username: session.user.mobile,
        password: 'otp-login',
      }),
    );
    return session.user;
  },

  /** Restore the user from encrypted cookies on app start. Refreshes an expired access token. */
  async restoreSession(): Promise<User | null> {
    const [user, accessToken] = await Promise.all([
      secureCookies.getUser(),
      secureCookies.getAccessToken(),
    ]);
    if (!user) return null;
    if (isTokenExpiring(accessToken)) {
      const refreshed = await tokenManager.refresh();
      if (!refreshed) {
        secureCookies.clear();
        return null;
      }
    }
    return user;
  },

  async updateProfile(userId: string, changes: Pick<User, 'name' | 'email'>): Promise<User> {
    const user = await mockAuthServer.updateUser(userId, changes);
    await secureCookies.saveUser(user);
    await mirrorToFakeStore(() => apiClient.put(API_ENDPOINTS.user(1), changes));
    return user;
  },

  logout() {
    secureCookies.clear();
  },
};
