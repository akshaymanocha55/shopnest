import { decrypt, encrypt } from '@/lib/crypto';
import { createToken, isTokenExpiring, issueTokens, verifyToken } from '@/lib/token';

describe('AES-GCM encryption', () => {
  it('round-trips objects', async () => {
    const value = { id: 'U1', name: 'Akshay' };
    const cipher = await encrypt(value);
    expect(cipher).not.toContain('Akshay');
    await expect(decrypt(cipher)).resolves.toEqual(value);
  });

  it('uses a random IV, so the same value encrypts differently each time', async () => {
    expect(await encrypt('same')).not.toBe(await encrypt('same'));
  });

  it('returns null for tampered or empty input', async () => {
    const cipher = await encrypt('secret');
    const tampered = cipher.slice(0, -2) + (cipher.endsWith('A') ? 'BB' : 'AA');
    await expect(decrypt(tampered)).resolves.toBeNull();
    await expect(decrypt(undefined)).resolves.toBeNull();
  });
});

describe('JWT tokens', () => {
  it('issues an access and refresh pair that verify', async () => {
    const { accessToken, refreshToken } = await issueTokens('U1');
    await expect(verifyToken(accessToken, 'access')).resolves.toMatchObject({
      sub: 'U1',
      type: 'access',
    });
    await expect(verifyToken(refreshToken, 'refresh')).resolves.toMatchObject({
      sub: 'U1',
      type: 'refresh',
    });
  });

  it('rejects a token of the wrong type', async () => {
    const { accessToken } = await issueTokens('U1');
    await expect(verifyToken(accessToken, 'refresh')).resolves.toBeNull();
  });

  it('rejects an expired token', async () => {
    const token = await createToken('U1', 'access', -10);
    await expect(verifyToken(token, 'access')).resolves.toBeNull();
    expect(isTokenExpiring(token)).toBe(true);
  });

  it('rejects a token with a modified payload', async () => {
    const token = await createToken('U1', 'access', 60);
    const [header, , signature] = token.split('.');
    const forged = btoa(
      JSON.stringify({ sub: 'ADMIN', type: 'access', iat: 0, exp: 9999999999 }),
    ).replace(/=+$/, '');
    await expect(verifyToken(`${header}.${forged}.${signature}`, 'access')).resolves.toBeNull();
  });

  it('flags tokens that expire within the leeway window', async () => {
    expect(isTokenExpiring(await createToken('U1', 'access', 10), 30)).toBe(true);
    expect(isTokenExpiring(await createToken('U1', 'access', 600), 30)).toBe(false);
  });
});
