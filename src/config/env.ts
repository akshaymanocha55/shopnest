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
  locationApiBaseUrl: required(
    'NEXT_PUBLIC_LOCATION_API_BASE_URL',
    process.env.NEXT_PUBLIC_LOCATION_API_BASE_URL,
  ),
  /** India Post pincode lookup. Optional: has a public default. */
  pincodeApiBaseUrl: process.env.NEXT_PUBLIC_PINCODE_API_BASE_URL || 'https://api.postalpincode.in',
  /**
   * Canonical site URL. On Vercel it falls back to the project's production
   * domain (a system variable Vercel exposes to Next.js builds).
   */
  siteUrl: required(
    'NEXT_PUBLIC_SITE_URL',
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
        : undefined),
  ).replace(/\/$/, ''),
  encryptionKey: required('NEXT_PUBLIC_ENCRYPTION_KEY', process.env.NEXT_PUBLIC_ENCRYPTION_KEY),
  tokenSecret: required('NEXT_PUBLIC_TOKEN_SECRET', process.env.NEXT_PUBLIC_TOKEN_SECRET),
  isProd: process.env.NODE_ENV === 'production',
} as const;
