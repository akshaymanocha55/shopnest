/**
 * Saves per-user data (cart, orders, wishlist, addresses) and shared data (reviews,
 * delivery location) to localStorage when it changes. Uses RTK listener middleware with a
 * short debounce so rapid +/- clicks write once.
 */
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants';
import type { CartItem } from '@/types/cart';
import type { Address, Order } from '@/types/order';
import type { Review } from '@/types/review';
import type { WishlistItem } from '@/types/wishlist';
import { addAddress, deleteAddress, updateAddress } from './slices/addresses.slice';
import {
  addItem,
  applyCoupon,
  clearCart,
  removeCoupon,
  removeItem,
  updateQuantity,
} from './slices/cart.slice';
import { setDeliveryLocation, type DeliveryLocation } from './slices/location.slice';
import { addOrder, cancelOrder } from './slices/orders.slice';
import { addReview, deleteReview } from './slices/reviews.slice';
import { addToWishlist, removeFromWishlist } from './slices/wishlist.slice';
import type { AppDispatch, RootState } from './store';

export const persistenceMiddleware = createListenerMiddleware();

const startListening = persistenceMiddleware.startListening.withTypes<RootState, AppDispatch>();

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('[persist] could not save', key, error);
  }
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

startListening({
  matcher: isAnyOf(addItem, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon),
  effect: async (_action, api) => {
    api.cancelActiveListeners();
    await api.delay(250);
    const { auth, cart } = api.getState();
    if (auth.user) {
      save(STORAGE_KEYS.cart(auth.user.id), {
        items: Object.values(cart.entities),
        couponCode: cart.couponCode,
      });
    }
  },
});

startListening({
  matcher: isAnyOf(addOrder, cancelOrder),
  effect: (_action, api) => {
    const { auth, orders } = api.getState();
    if (auth.user) save(STORAGE_KEYS.orders(auth.user.id), Object.values(orders.entities));
  },
});

startListening({
  matcher: isAnyOf(addToWishlist, removeFromWishlist),
  effect: (_action, api) => {
    const { auth, wishlist } = api.getState();
    if (auth.user) save(STORAGE_KEYS.wishlist(auth.user.id), Object.values(wishlist.entities));
  },
});

startListening({
  matcher: isAnyOf(addAddress, updateAddress, deleteAddress),
  effect: (_action, api) => {
    const { auth, addresses } = api.getState();
    if (auth.user) save(STORAGE_KEYS.addresses(auth.user.id), Object.values(addresses.entities));
  },
});

startListening({
  matcher: isAnyOf(addReview, deleteReview),
  effect: (_action, api) =>
    save(STORAGE_KEYS.reviews, Object.values(api.getState().reviews.entities)),
});

startListening({
  actionCreator: setDeliveryLocation,
  effect: (action) => save(STORAGE_KEYS.deliveryLocation, action.payload),
});

export function loadUserCart(userId: string): { items: CartItem[]; couponCode: string | null } {
  const stored = load<unknown>(STORAGE_KEYS.cart(userId), null);
  // Older saves were a plain array of items.
  if (Array.isArray(stored)) return { items: stored as CartItem[], couponCode: null };
  return (
    (stored as { items: CartItem[]; couponCode: string | null }) ?? { items: [], couponCode: null }
  );
}

export const loadUserOrders = (userId: string) => load<Order[]>(STORAGE_KEYS.orders(userId), []);
export const loadUserWishlist = (userId: string) =>
  load<WishlistItem[]>(STORAGE_KEYS.wishlist(userId), []);
export const loadUserAddresses = (userId: string) =>
  load<Address[]>(STORAGE_KEYS.addresses(userId), []);
export const loadReviews = () => load<Review[]>(STORAGE_KEYS.reviews, []);
export const loadDeliveryLocation = () =>
  load<DeliveryLocation | null>(STORAGE_KEYS.deliveryLocation, null);
