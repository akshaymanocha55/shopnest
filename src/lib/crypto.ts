/**
 * AES-GCM encryption using the Web Crypto API (works in the browser, Node and the Next.js proxy).
 *
 * Note: without a backend the key ships in the client bundle, so this protects against casual
 * inspection and tampering of cookies, not a determined attacker. See README "Security notes".
 */
import { env } from '@/config/env';

const IV_LENGTH = 12;
const SALT = 'shopnest-static-salt-v1';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

let keyPromise: Promise<CryptoKey> | null = null;

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Derive (once) a 256-bit AES key from the configured secret with PBKDF2. */
function getKey(): Promise<CryptoKey> {
  keyPromise ??= (async () => {
    const material = await crypto.subtle.importKey(
      'raw',
      encoder.encode(env.encryptionKey),
      'PBKDF2',
      false,
      ['deriveKey'],
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: encoder.encode(SALT), iterations: 100_000, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
  })();
  return keyPromise;
}

/** Encrypt any JSON-serialisable value into a URL-safe string: base64url(iv + ciphertext). */
export async function encrypt(value: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const data = encoder.encode(JSON.stringify(value));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await getKey(), data),
  );
  const out = new Uint8Array(iv.length + cipher.length);
  out.set(iv);
  out.set(cipher, iv.length);
  return toBase64Url(out);
}

/** Decrypt a value produced by `encrypt`. Returns null if it was tampered with or is invalid. */
export async function decrypt<T>(payload: string | undefined | null): Promise<T | null> {
  if (!payload) return null;
  try {
    const bytes = fromBase64Url(payload);
    const iv = bytes.slice(0, IV_LENGTH);
    const cipher = bytes.slice(IV_LENGTH);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, await getKey(), cipher);
    return JSON.parse(decoder.decode(plain)) as T;
  } catch {
    return null;
  }
}

/** HMAC-SHA256 signature, used to sign mock JWTs. */
export async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return toBase64Url(new Uint8Array(signature));
}

export const base64Url = {
  encode: (text: string) => toBase64Url(encoder.encode(text)),
  decode: (value: string) => decoder.decode(fromBase64Url(value)),
};
