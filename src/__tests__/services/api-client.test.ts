/**
 * @jest-environment node
 */
import { apiClient } from '@/services/api/client';
import { tokenManager } from '@/services/auth/token-manager';

jest.mock('@/services/auth/token-manager', () => ({
  tokenManager: {
    getValidAccessToken: jest.fn(),
    refresh: jest.fn(),
    notifySessionExpired: jest.fn(),
  },
}));

const mockedTokens = tokenManager as jest.Mocked<typeof tokenManager>;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('apiClient', () => {
  const fetchMock = jest.fn();

  // Simulate the browser so the client attaches the token (tokens only exist client-side).
  beforeAll(() => {
    Object.defineProperty(globalThis, 'window', { value: globalThis, configurable: true });
  });
  afterAll(() => {
    Reflect.deleteProperty(globalThis, 'window');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
    mockedTokens.getValidAccessToken.mockResolvedValue('token-123');
  });

  it('builds the URL from the env base URL and query params', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json([])));
    await apiClient.get('/products', { params: { limit: 5, empty: '' } });
    expect(fetchMock.mock.calls[0][0]).toBe('https://fakestoreapi.com/products?limit=5');
  });

  it('attaches shared headers and the bearer token once, centrally', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json({ id: 1 })));
    await apiClient.post('/carts', { a: 1 });
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer token-123');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('Accept')).toBe('application/json');
    expect(fetchMock.mock.calls[0][1].body).toBe('{"a":1}');
  });

  it('skips the token for public requests', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json([])));
    await apiClient.get('/products', { auth: false });
    expect((fetchMock.mock.calls[0][1].headers as Headers).has('Authorization')).toBe(false);
    expect(mockedTokens.getValidAccessToken).not.toHaveBeenCalled();
  });

  it('uses the right HTTP method for put and delete', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json({})));
    await apiClient.put('/users/1', { name: 'A' });
    await apiClient.delete('/carts/1');
    expect(fetchMock.mock.calls.map((c) => c[1].method)).toEqual(['PUT', 'DELETE']);
  });

  it('refreshes the token on 401 and replays the request once', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json({ ok: true }));
    mockedTokens.refresh.mockResolvedValue('new-token');
    await expect(apiClient.get('/users/1')).resolves.toEqual({ ok: true });
    expect(mockedTokens.refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('ends the session when the refresh fails', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json({}, 401)));
    mockedTokens.refresh.mockResolvedValue(null);
    await expect(apiClient.post('/carts', {})).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(mockedTokens.notifySessionExpired).toHaveBeenCalled();
  });

  it('maps HTTP errors to ApiError', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(json({}, 404)));
    await expect(apiClient.post('/missing', {})).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'NOT_FOUND',
    });
  });

  it('retries GET once on network failure, then succeeds', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(json([1]));
    await expect(apiClient.get('/products')).resolves.toEqual([1]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry POST on network failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(apiClient.post('/carts', {})).rejects.toMatchObject({ code: 'NETWORK' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
