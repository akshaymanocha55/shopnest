import type { MetadataRoute } from 'next';
import { CATEGORIES, ROUTES } from '@/constants';
import { categoryHref } from '@/components/layout/megaMenuLinks';
import { getProducts } from '@/lib/server/products';
import { absoluteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  return [
    { url: absoluteUrl(ROUTES.home), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl(ROUTES.products), changeFrequency: 'daily', priority: 0.9 },
    ...CATEGORIES.map((category) => ({
      url: absoluteUrl(categoryHref(category.slug)),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(ROUTES.product(product.slug)),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      images: [product.image],
    })),
  ];
}
