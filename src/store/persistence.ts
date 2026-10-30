/**
 * Saves each user's cart and orders to localStorage whenever they change.
 * Uses RTK listener middleware with a short debounce so rapid +/- clicks write once.
 */
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/constants';
import type { CartItem } from '@/types/cart';
import type { Order } from '@/types/order';
import { addItem, clearCart, removeItem, updateQuantity } from './slices/cart.slice';
import { addOrder, cancelOrder } from './slices/orders.slice';
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

startListening({
  matcher: isAnyOf(addItem, updateQuantity, removeItem, clearCart),
  effect: async (_action, api) => {
    api.cancelActiveListeners();
    await api.delay(250);
    const { auth, cart } = api.getState();
    if (auth.user) save(STORAGE_KEYS.cart(auth.user.id), Object.values(cart.entities));
  },
});

startListening({
  matcher: isAnyOf(addOrder, cancelOrder),
  effect: (_action, api) => {
    const { auth, orders } = api.getState();
    if (auth.user) save(STORAGE_KEYS.orders(auth.user.id), Object.values(orders.entities));
  },
});

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export const loadUserCart = (userId: string) => load<CartItem>(STORAGE_KEYS.cart(userId));
export const loadUserOrders = (userId: string) => load<Order>(STORAGE_KEYS.orders(userId));
