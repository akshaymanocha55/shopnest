export const ROUTES = {
  home: '/',
  products: '/products',
  product: (slug: string) => `/products/${slug}`,
  login: '/login',
  signup: '/signup',
  cart: '/cart',
  checkout: '/checkout',
  orderConfirmation: (orderId: string) => `/order-confirmation/${orderId}`,
  account: '/account',
  accountOrders: '/account?tab=orders',
} as const;

/** Routes only logged-in users may open. Enforced in src/proxy.ts. */
export const PROTECTED_ROUTES = ['/cart', '/checkout', '/order-confirmation', '/account'] as const;

/** Routes logged-in users should not see (they get sent home). */
export const AUTH_ROUTES = ['/login', '/signup'] as const;

export const REDIRECT_PARAM = 'redirect';
