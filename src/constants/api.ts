export const API_ENDPOINTS = {
  products: '/products',
  product: (id: number | string) => `/products/${id}`,
  categories: '/products/categories',
  users: '/users',
  user: (id: number | string) => `/users/${id}`,
  carts: '/carts',
  cart: (id: number | string) => `/carts/${id}`,
} as const;

/** countriesnow.space endpoints (relative to NEXT_PUBLIC_LOCATION_API_BASE_URL). */
export const LOCATION_ENDPOINTS = {
  countries: '/countries/iso',
  states: '/countries/states',
  cities: '/countries/cities',
} as const;

export const HTTP_STATUS = {
  unauthorized: 401,
  notFound: 404,
  tooManyRequests: 429,
  serverError: 500,
} as const;

export const REQUEST_TIMEOUT_MS = 10_000;
