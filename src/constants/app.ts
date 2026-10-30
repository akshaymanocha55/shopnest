export const APP = {
  name: 'ShopNest',
  tagline: 'Everyday essentials, beautifully delivered',
  description:
    'Shop fashion, jewellery and electronics at ShopNest. Great prices, fast delivery across India and easy returns.',
  locale: 'en_IN',
  currency: 'INR',
  supportEmail: 'support@shopnest.example',
  twitter: '@shopnest',
} as const;

/** FakeStore prices are in USD; converted once at mapping time. */
export const USD_TO_INR = 84;

export const PRICING = {
  freeDeliveryThreshold: 999,
  deliveryFee: 49,
  /** Domestic (India) delivery time. */
  deliveryDays: 2,
  internationalDeliveryDays: 7,
} as const;

export const TIMING = {
  searchDebounceMs: 300,
  priceFilterDebounceMs: 500,
  scrollThrottleMs: 150,
  actionThrottleMs: 800,
  mockNetworkDelayMs: 600,
} as const;

export const CACHE = {
  /** TanStack Query: how long data is considered fresh. */
  productsStaleTime: 5 * 60 * 1000,
  /** TanStack Query: how long unused data stays in memory. */
  productsGcTime: 30 * 60 * 1000,
} as const;

export const LIMITS = {
  maxQuantityPerItem: 10,
  searchSuggestions: 6,
  relatedProducts: 8,
  /** Lists longer than this switch to a virtualized renderer. */
  virtualizeThreshold: 40,
} as const;
