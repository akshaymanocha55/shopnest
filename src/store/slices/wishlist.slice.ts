import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import type { WishlistItem } from '@/types/wishlist';
import type { RootState } from '../store';

const wishlistAdapter = createEntityAdapter<WishlistItem, number>({
  selectId: (item) => item.productId,
  sortComparer: (a, b) => b.addedAt.localeCompare(a.addedAt),
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: wishlistAdapter.getInitialState(),
  reducers: {
    addToWishlist: wishlistAdapter.upsertOne,
    removeFromWishlist: wishlistAdapter.removeOne,
    hydrateWishlist: wishlistAdapter.setAll,
    clearWishlist: wishlistAdapter.removeAll,
  },
});

export const { addToWishlist, removeFromWishlist, hydrateWishlist, clearWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;

const selectors = wishlistAdapter.getSelectors<RootState>((state) => state.wishlist);
export const selectWishlistItems = selectors.selectAll;
export const selectWishlistIds = selectors.selectIds;
export const selectWishlistCount = selectors.selectTotal;
/** Boolean selector: a heart button re-renders only when its own product toggles. */
export const selectIsWishlisted = (state: RootState, productId: number) =>
  Boolean(state.wishlist.entities[productId]);
