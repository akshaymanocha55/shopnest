import fallback from '@/data/products.fallback.json';
import { mapProducts } from '@/lib/product-mapper';
import type { ApiProduct } from '@/types/product';

export const products = mapProducts(fallback as ApiProduct[]);
export const jacket = products.find((p) => p.id === 3)!;
export const ssd = products.find((p) => p.id === 11)!;
