import { MOCK_OTP } from '@/constants';
import { verifyToken } from '@/lib/token';
import { mockAuthServer } from '@/services/auth/mock-auth-server';

jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  sleep: () => Promise.resolve(),
}));

const input = { name: 'Akshay', mobile: '9876543210', email: 'akshay@example.com' };

describe('mock auth server', () => {
  beforeEach(() => localStorage.clear());

  it('signs up with the correct OTP and issues valid tokens', async () => {
    await mockAuthServer.requestSignupOtp(input);
    const session = await mockAuthServer.verifySignup(input, MOCK_OTP);
    expect(session.user).toMatchObject({ name: 'Akshay', mobile: '9876543210' });
    await expect(verifyToken(session.tokens.refreshToken, 'refresh')).resolves.toMatchObject({
      sub: session.user.id,
    });
  });

  it('stores users encrypted, not as plain text', async () => {
    await mockAuthServer.verifySignup(input, MOCK_OTP);
    expect(JSON.stringify(localStorage)).not.toContain('akshay@example.com');
  });

  it('rejects a wrong OTP', async () => {
    await expect(mockAuthServer.verifySignup(input, '123456')).rejects.toThrow(/Incorrect OTP/);
  });

  it('blocks duplicate signups and unknown logins', async () => {
    await mockAuthServer.verifySignup(input, MOCK_OTP);
    await expect(mockAuthServer.requestSignupOtp(input)).rejects.toThrow(/already exists/);
    await expect(mockAuthServer.requestLoginOtp('9999999999')).rejects.toThrow(/No account/);
  });

  it('logs in an existing user and refreshes tokens', async () => {
    const { user } = await mockAuthServer.verifySignup(input, MOCK_OTP);
    const session = await mockAuthServer.verifyLogin(input.mobile, MOCK_OTP);
    expect(session.user.id).toBe(user.id);
    const refreshed = await mockAuthServer.refresh(session.tokens.refreshToken);
    await expect(verifyToken(refreshed.accessToken, 'access')).resolves.toMatchObject({
      sub: user.id,
    });
  });

  it('refuses to refresh with an access token', async () => {
    const { tokens } = await mockAuthServer.verifySignup(input, MOCK_OTP);
    await expect(mockAuthServer.refresh(tokens.accessToken)).rejects.toThrow();
  });
});
