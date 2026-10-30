import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { productService } from '@/services/product.service';
import type { CategorySlug, Product } from '@/types/product';

/**
 * Server-side cached product data ("use cache" + cacheLife).
 * Pages are pre-rendered with this data and revalidated every hour.
 */
export async function getProducts(): Promise<Product[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('products');
  return productService.getAll();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  'use cache';
  cacheLife('hours');
  cacheTag('products', `product-${slug}`);
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts();
  return [...products]
    .sort((a, b) => b.rating * Math.log(b.ratingCount) - a.rating * Math.log(a.ratingCount))
    .slice(0, limit);
}

export async function getDeals(limit = 4): Promise<Product[]> {
  const products = await getProducts();
  return [...products].sort((a, b) => b.discountPercent - a.discountPercent).slice(0, limit);
}

export async function getCategoryCovers(): Promise<Record<CategorySlug, Product | undefined>> {
  const products = await getProducts();
  const covers = {} as Record<CategorySlug, Product | undefined>;
  for (const product of products) {
    if (!covers[product.category] || product.rating > covers[product.category]!.rating) {
      covers[product.category] = product;
    }
  }
  return covers;
}
