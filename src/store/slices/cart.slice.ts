import {
  createEntityAdapter,
  createSelector,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { LIMITS } from '@/constants';
import { calculateSummary } from '@/lib/pricing';
import { clamp } from '@/lib/utils';
import type { CartItem } from '@/types/cart';
import type { RootState } from '../store';

/**
 * Normalised cart (ids + entities). A component that renders one line subscribes to that line
 * only, so changing the quantity of item A does not re-render item B.
 */
const cartAdapter = createEntityAdapter<CartItem, string>({ selectId: (item) => item.lineId });

const cartSlice = createSlice({
  name: 'cart',
  initialState: cartAdapter.getInitialState<{ couponCode: string | null }>({ couponCode: null }),
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const incoming = action.payload;
      const existing = state.entities[incoming.lineId];
      const quantity = clamp(
        (existing?.quantity ?? 0) + incoming.quantity,
        1,
        LIMITS.maxQuantityPerItem,
      );
      cartAdapter.upsertOne(state, { ...incoming, quantity });
    },
    updateQuantity(state, action: PayloadAction<{ lineId: string; quantity: number }>) {
      const { lineId, quantity } = action.payload;
      if (!state.entities[lineId]) return;
      cartAdapter.updateOne(state, {
        id: lineId,
        changes: { quantity: clamp(quantity, 1, LIMITS.maxQuantityPerItem) },
      });
    },
    removeItem: cartAdapter.removeOne,
    clearCart(state) {
      cartAdapter.removeAll(state);
      state.couponCode = null;
    },
    hydrateCart(state, action: PayloadAction<{ items: CartItem[]; couponCode?: string | null }>) {
      cartAdapter.setAll(state, action.payload.items);
      state.couponCode = action.payload.couponCode ?? null;
    },
    applyCoupon(state, action: PayloadAction<string>) {
      state.couponCode = action.payload.trim().toUpperCase();
    },
    removeCoupon(state) {
      state.couponCode = null;
    },
  },
});

export const {
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  hydrateCart,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;
export default cartSlice.reducer;

const adapterSelectors = cartAdapter.getSelectors<RootState>((state) => state.cart);

export const selectCartLineIds = adapterSelectors.selectIds;
export const selectCartItems = adapterSelectors.selectAll;
export const selectCartItemById = adapterSelectors.selectById;

/** Memoised: recomputed only when cart items change. */
export const selectCouponCode = (state: RootState) => state.cart.couponCode;
export const selectCartSummary = createSelector(
  [selectCartItems, selectCouponCode],
  calculateSummary,
);
export const selectCartCount = createSelector([selectCartSummary], (summary) => summary.itemCount);
export const selectQuantityInCart = (state: RootState, lineId: string) =>
  state.cart.entities[lineId]?.quantity ?? 0;
