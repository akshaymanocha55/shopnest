/**
 * Mock authentication "backend".
 * FakeStore API has no OTP, signup persistence or refresh tokens, so this module plays the
 * server's role: it stores users (encrypted) in localStorage, checks OTPs and issues signed
 * JWT access/refresh tokens. It is async and can fail, just like a real API.
 */
import { MOCK_OTP, STORAGE_KEYS, TIMING, VALIDATION } from '@/constants';
import { decrypt, encrypt } from '@/lib/crypto';
import { ApiError } from '@/lib/errors';
import { issueTokens, verifyToken } from '@/lib/token';
import { generateId, sleep } from '@/lib/utils';
import type { AuthTokens, Session, SignupInput, User } from '@/types/auth';

async function readUsers(): Promise<User[]> {
  if (typeof window === 'undefined') return [];
  return (await decrypt<User[]>(localStorage.getItem(STORAGE_KEYS.users))) ?? [];
}

async function writeUsers(users: User[]): Promise<void> {
  localStorage.setItem(STORAGE_KEYS.users, await encrypt(users));
}

const delay = () => sleep(TIMING.mockNetworkDelayMs);

function assertOtp(otp: string) {
  if (otp !== MOCK_OTP) throw new ApiError(VALIDATION.otpInvalid, 400, 'VALIDATION');
}

export const mockAuthServer = {
  async requestLoginOtp(mobile: string): Promise<void> {
    await delay();
    const users = await readUsers();
    if (!users.some((u) => u.mobile === mobile)) {
      throw new ApiError(VALIDATION.userNotFound, 404, 'NOT_FOUND');
    }
  },

  async requestSignupOtp(input: SignupInput): Promise<void> {
    await delay();
    const users = await readUsers();
    if (users.some((u) => u.mobile === input.mobile)) {
      throw new ApiError(VALIDATION.userExists, 409, 'VALIDATION');
    }
  },

  async verifyLogin(mobile: string, otp: string): Promise<Session> {
    await delay();
    assertOtp(otp);
    const user = (await readUsers()).find((u) => u.mobile === mobile);
    if (!user) throw new ApiError(VALIDATION.userNotFound, 404, 'NOT_FOUND');
    return { user, tokens: await issueTokens(user.id) };
  },

  async verifySignup(input: SignupInput, otp: string): Promise<Session> {
    await delay();
    assertOtp(otp);
    const users = await readUsers();
    if (users.some((u) => u.mobile === input.mobile)) {
      throw new ApiError(VALIDATION.userExists, 409, 'VALIDATION');
    }
    const user: User = {
      id: generateId('U'),
      name: input.name.trim(),
      mobile: input.mobile,
      email: input.email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    await writeUsers([...users, user]);
    return { user, tokens: await issueTokens(user.id) };
  },

  /** Exchange a valid refresh token for a new token pair (refresh-token rotation). */
  async refresh(refreshToken: string | null): Promise<AuthTokens> {
    await sleep(150);
    const payload = await verifyToken(refreshToken, 'refresh');
    if (!payload) throw new ApiError('Refresh token expired', 401, 'UNAUTHORIZED');
    return issueTokens(payload.sub);
  },

  async updateUser(userId: string, changes: Pick<User, 'name' | 'email'>): Promise<User> {
    await delay();
    const users = await readUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new ApiError(VALIDATION.userNotFound, 404, 'NOT_FOUND');
    const updated = { ...users[index], ...changes };
    users[index] = updated;
    await writeUsers(users);
    return updated;
  },
};
