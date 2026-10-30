/**
 * Product API. Works on both server and client.
 * If FakeStore is unreachable we fall back to a bundled snapshot so the store never goes blank.
 */
import { API_ENDPOINTS } from '@/constants';
import fallbackProducts from '@/data/products.fallback.json';
import { mapProduct, mapProducts } from '@/lib/product-mapper';
import { productIdFromSlug } from '@/lib/utils';
import type { ApiProduct, Product } from '@/types/product';
import { apiClient } from './api/client';

const fallback = fallbackProducts as ApiProduct[];

export const productService = {
  async getAll(options: { signal?: AbortSignal; useFallback?: boolean } = {}): Promise<Product[]> {
    const { signal, useFallback = true } = options;
    try {
      const data = await apiClient.get<ApiProduct[]>(API_ENDPOINTS.products, {
        auth: false,
        signal,
      });
      if (!Array.isArray(data) || data.length === 0) throw new Error('Empty product list');
      return mapProducts(data);
    } catch (error) {
      if (!useFallback) throw error;
      console.warn('[products] API unavailable, using bundled snapshot:', error);
      return mapProducts(fallback);
    }
  },

  async getById(id: number, options: { signal?: AbortSignal } = {}): Promise<Product | null> {
    try {
      const data = await apiClient.get<ApiProduct | null>(API_ENDPOINTS.product(id), {
        auth: false,
        signal: options.signal,
      });
      // FakeStore returns an empty body for unknown ids.
      if (data?.id) return mapProduct(data);
    } catch (error) {
      console.warn(`[products] API unavailable for #${id}, using snapshot:`, error);
    }
    const local = fallback.find((p) => p.id === id);
    return local ? mapProduct(local) : null;
  },

  async getBySlug(slug: string): Promise<Product | null> {
    const id = productIdFromSlug(slug);
    if (!id) return null;
    const product = await this.getById(id);
    return product?.slug === slug ? product : null;
  },
};
