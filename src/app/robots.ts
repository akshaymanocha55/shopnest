import type { MetadataRoute } from 'next';
import { PROTECTED_ROUTES } from '@/constants';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private, per-user pages have no value in search results.
        disallow: [...PROTECTED_ROUTES, '/login', '/signup'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
