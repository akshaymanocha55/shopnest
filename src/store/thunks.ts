import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import type { User } from '@/types/auth';
import {
  loadDeliveryLocation,
  loadReviews,
  loadUserAddresses,
  loadUserCart,
  loadUserOrders,
  loadUserWishlist,
} from './persistence';
import { clearAddresses, hydrateAddresses } from './slices/addresses.slice';
import { authenticated, signedOut } from './slices/auth.slice';
import { addItem, clearCart, hydrateCart } from './slices/cart.slice';
import { setDeliveryLocation } from './slices/location.slice';
import { clearOrders, hydrateOrders } from './slices/orders.slice';
import { hydrateReviews } from './slices/reviews.slice';
import { clearPendingCartItem, closeLoginPrompt } from './slices/ui.slice';
import { clearWishlist, hydrateWishlist } from './slices/wishlist.slice';
import type { AppDispatch, RootState } from './store';

const createAppThunk = createAsyncThunk.withTypes<{ state: RootState; dispatch: AppDispatch }>();

/** Load the user's saved data and finish any "add to cart" a guest started. */
export const startUserSession = createAppThunk(
  'session/start',
  async (user: User, { dispatch, getState }) => {
    dispatch(hydrateCart(loadUserCart(user.id)));
    dispatch(hydrateOrders(loadUserOrders(user.id)));
    dispatch(hydrateWishlist(loadUserWishlist(user.id)));
    dispatch(hydrateAddresses(loadUserAddresses(user.id)));
    dispatch(authenticated(user));
    dispatch(closeLoginPrompt());

    const pending = getState().ui.pendingCartItem;
    if (pending) {
      dispatch(addItem(pending));
      dispatch(clearPendingCartItem());
      return { addedPendingItem: pending.title };
    }
    return { addedPendingItem: null };
  },
);

/** Shared (non-user) data that guests can see too. */
function loadSharedData(dispatch: AppDispatch) {
  dispatch(hydrateReviews(loadReviews()));
  const location = loadDeliveryLocation();
  if (location) dispatch(setDeliveryLocation(location));
}

export const restoreSession = createAppThunk('session/restore', async (_, { dispatch }) => {
  loadSharedData(dispatch);
  try {
    const user = await authService.restoreSession();
    if (user) await dispatch(startUserSession(user));
    else dispatch(signedOut());
  } catch {
    dispatch(signedOut());
  }
});

export const endUserSession = createAppThunk('session/end', async (_, { dispatch }) => {
  authService.logout();
  dispatch(clearCart());
  dispatch(clearOrders());
  dispatch(clearWishlist());
  dispatch(clearAddresses());
  dispatch(signedOut());
});
