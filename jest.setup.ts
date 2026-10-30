import '@testing-library/jest-dom';
import { webcrypto } from 'node:crypto';
import { TextDecoder, TextEncoder } from 'node:util';

// jsdom ships without SubtleCrypto; use Node's Web Crypto implementation in tests.
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
Object.assign(globalThis, { TextEncoder, TextDecoder });

process.env.NEXT_PUBLIC_API_BASE_URL = 'https://fakestoreapi.com';
process.env.NEXT_PUBLIC_LOCATION_API_BASE_URL = 'https://countriesnow.space/api/v0.1';
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_ENCRYPTION_KEY = 'test-encryption-key-please-change';
process.env.NEXT_PUBLIC_TOKEN_SECRET = 'test-token-secret-please-change';
