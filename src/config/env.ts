/**
 * Typed access to environment variables.
 * NEXT_PUBLIC_* values must be referenced statically so Next.js can inline them.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}. Copy .env.example to .env.local.`);
  }
  return value;
}

export const env = {
  apiBaseUrl: required('NEXT_PUBLIC_API_BASE_URL', process.env.NEXT_PUBLIC_API_BASE_URL),
  siteUrl: required('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL).replace(/\/$/, ''),
  encryptionKey: required('NEXT_PUBLIC_ENCRYPTION_KEY', process.env.NEXT_PUBLIC_ENCRYPTION_KEY),
  tokenSecret: required('NEXT_PUBLIC_TOKEN_SECRET', process.env.NEXT_PUBLIC_TOKEN_SECRET),
  isProd: process.env.NODE_ENV === 'production',
} as const;
