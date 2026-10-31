/** Raw product shape returned by FakeStore API. */
export interface ApiProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

export type CategorySlug = 'mens-clothing' | 'womens-clothing' | 'jewellery' | 'electronics';

export interface VariantOption {
  id: string;
  label: string;
  /** Extra amount (INR) added to the base price for this option. */
  priceDelta: number;
  inStock: boolean;
}

export interface VariantGroup {
  id: string;
  name: string;
  options: VariantOption[];
}

/** Normalised product used across the app. Prices are whole rupees. */
export interface Product {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: CategorySlug;
  categoryLabel: string;
  subcategory: string;
  image: string;
  price: number;
  mrp: number;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  inStock: boolean;
  variantGroups: VariantGroup[];
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount' | 'newest';

export interface ProductFilters {
  q: string;
  categories: CategorySlug[];
  sub: string;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  inStockOnly: boolean;
  sort: SortOption;
}
