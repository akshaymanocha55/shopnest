import type { CategorySlug, SortOption, VariantGroup } from '@/types/product';

export interface CategoryMeta {
  slug: CategorySlug;
  apiName: string;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: 'mens-clothing',
    apiName: "men's clothing",
    label: "Men's Clothing",
    shortLabel: 'Men',
    description: 'Jackets, tees and everyday carry',
    accent: 'from-sky-100 to-indigo-100',
  },
  {
    slug: 'womens-clothing',
    apiName: "women's clothing",
    label: "Women's Clothing",
    shortLabel: 'Women',
    description: 'Tops, tees and all-weather jackets',
    accent: 'from-rose-100 to-orange-100',
  },
  {
    slug: 'jewellery',
    apiName: 'jewelery',
    label: 'Jewellery',
    shortLabel: 'Jewellery',
    description: 'Rings, bracelets and earrings',
    accent: 'from-amber-100 to-yellow-50',
  },
  {
    slug: 'electronics',
    apiName: 'electronics',
    label: 'Electronics',
    shortLabel: 'Electronics',
    description: 'Storage drives and monitors',
    accent: 'from-emerald-100 to-teal-50',
  },
];

export const CATEGORY_BY_API_NAME: Record<string, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.apiName, c]),
);

export const CATEGORY_BY_SLUG: Record<CategorySlug, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<CategorySlug, CategoryMeta>;

/** FakeStore has no sub-categories, so we assign them by product id. */
export const SUBCATEGORY_BY_PRODUCT_ID: Record<number, string> = {
  1: 'Bags & Backpacks',
  2: 'T-Shirts',
  3: 'Jackets',
  4: 'Casual Wear',
  5: 'Bracelets',
  6: 'Rings',
  7: 'Rings',
  8: 'Earrings',
  9: 'External Drives',
  10: 'SSDs',
  11: 'SSDs',
  12: 'External Drives',
  13: 'Monitors',
  14: 'Monitors',
  15: 'Jackets',
  16: 'Jackets',
  17: 'Jackets',
  18: 'Tops & Tees',
  19: 'Tops & Tees',
  20: 'Tops & Tees',
};

/** Deterministic discount per product so MRP/strike-through prices look realistic. */
export const DISCOUNT_STEPS = [10, 15, 20, 25, 30, 35, 40] as const;

const SIZE_GROUP: VariantGroup = {
  id: 'size',
  name: 'Size',
  options: ['S', 'M', 'L', 'XL', 'XXL'].map((s) => ({
    id: s.toLowerCase(),
    label: s,
    priceDelta: 0,
    inStock: true,
  })),
};

export const VARIANT_TEMPLATES: Record<CategorySlug, VariantGroup[]> = {
  'mens-clothing': [SIZE_GROUP],
  'womens-clothing': [SIZE_GROUP],
  jewellery: [
    {
      id: 'finish',
      name: 'Finish',
      options: [
        { id: 'gold', label: 'Gold', priceDelta: 0, inStock: true },
        { id: 'rose-gold', label: 'Rose Gold', priceDelta: 250, inStock: true },
        { id: 'silver', label: 'Silver', priceDelta: -200, inStock: true },
      ],
    },
  ],
  electronics: [
    {
      id: 'warranty',
      name: 'Warranty',
      options: [
        { id: '1y', label: '1 Year', priceDelta: 0, inStock: true },
        { id: '2y', label: '2 Years', priceDelta: 799, inStock: true },
        { id: '3y', label: '3 Years', priceDelta: 1299, inStock: true },
      ],
    },
  ],
};

/** Product-specific variant overrides (e.g. a backpack has colours, not sizes). */
export const VARIANT_OVERRIDES: Record<number, VariantGroup[]> = {
  1: [
    {
      id: 'colour',
      name: 'Colour',
      options: [
        { id: 'forest', label: 'Forest Green', priceDelta: 0, inStock: true },
        { id: 'black', label: 'Black', priceDelta: 0, inStock: true },
        { id: 'navy', label: 'Navy', priceDelta: 0, inStock: true },
      ],
    },
  ],
};

/** "productId:optionId" pairs that are out of stock, to show disabled states. */
export const OUT_OF_STOCK = new Set(['2:xxl', '3:s', '15:xl', '17:xxl', '5:silver', '14:3y']);

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'newest', label: 'Newest First' },
];

export const RATING_FILTERS = [4, 3, 2] as const;

export const PRICE_PRESETS: { label: string; min: number | null; max: number | null }[] = [
  { label: 'Under ₹1,000', min: null, max: 1000 },
  { label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 – ₹20,000', min: 5000, max: 20000 },
  { label: 'Over ₹20,000', min: 20000, max: null },
];

/** URL query keys used by the product listing page. */
export const FILTER_PARAMS = {
  q: 'q',
  category: 'category',
  sub: 'sub',
  minPrice: 'min',
  maxPrice: 'max',
  rating: 'rating',
  sort: 'sort',
} as const;

export interface MegaMenuSection {
  category: CategorySlug;
  columns: { heading: string; links: { label: string; sub?: string; sort?: SortOption }[] }[];
  featuredProductId: number;
}

export const MEGA_MENU: MegaMenuSection[] = [
  {
    category: 'mens-clothing',
    featuredProductId: 3,
    columns: [
      {
        heading: 'Clothing',
        links: [
          { label: 'T-Shirts', sub: 'T-Shirts' },
          { label: 'Jackets', sub: 'Jackets' },
          { label: 'Casual Wear', sub: 'Casual Wear' },
        ],
      },
      {
        heading: 'Accessories',
        links: [{ label: 'Bags & Backpacks', sub: 'Bags & Backpacks' }],
      },
      {
        heading: 'Discover',
        links: [
          { label: 'Top Rated', sort: 'rating' },
          { label: 'Best Deals', sort: 'discount' },
        ],
      },
    ],
  },
  {
    category: 'womens-clothing',
    featuredProductId: 15,
    columns: [
      {
        heading: 'Clothing',
        links: [
          { label: 'Tops & Tees', sub: 'Tops & Tees' },
          { label: 'Jackets', sub: 'Jackets' },
        ],
      },
      {
        heading: 'Discover',
        links: [
          { label: 'Top Rated', sort: 'rating' },
          { label: 'Price: Low to High', sort: 'price-asc' },
        ],
      },
    ],
  },
  {
    category: 'jewellery',
    featuredProductId: 5,
    columns: [
      {
        heading: 'Shop by type',
        links: [
          { label: 'Rings', sub: 'Rings' },
          { label: 'Bracelets', sub: 'Bracelets' },
          { label: 'Earrings', sub: 'Earrings' },
        ],
      },
      {
        heading: 'Discover',
        links: [
          { label: 'Best Deals', sort: 'discount' },
          { label: 'Premium Picks', sort: 'price-desc' },
        ],
      },
    ],
  },
  {
    category: 'electronics',
    featuredProductId: 14,
    columns: [
      {
        heading: 'Storage',
        links: [
          { label: 'SSDs', sub: 'SSDs' },
          { label: 'External Drives', sub: 'External Drives' },
        ],
      },
      {
        heading: 'Displays',
        links: [{ label: 'Monitors', sub: 'Monitors' }],
      },
      {
        heading: 'Discover',
        links: [
          { label: 'Top Rated', sort: 'rating' },
          { label: 'Best Deals', sort: 'discount' },
        ],
      },
    ],
  },
];
