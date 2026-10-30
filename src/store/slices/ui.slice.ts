import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '@/types/cart';
import type { RootState } from '../store';

interface UiState {
  loginPromptOpen: boolean;
  /** Item a guest tried to add; it is added automatically after they log in. */
  pendingCartItem: CartItem | null;
}

const initialState: UiState = { loginPromptOpen: false, pendingCartItem: null };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openLoginPrompt(state, action: PayloadAction<CartItem | undefined>) {
      state.loginPromptOpen = true;
      state.pendingCartItem = action.payload ?? null;
    },
    closeLoginPrompt(state) {
      state.loginPromptOpen = false;
    },
    clearPendingCartItem(state) {
      state.pendingCartItem = null;
    },
  },
});

export const { openLoginPrompt, closeLoginPrompt, clearPendingCartItem } = uiSlice.actions;
export default uiSlice.reducer;

export const selectLoginPromptOpen = (state: RootState) => state.ui.loginPromptOpen;
export const selectPendingCartItem = (state: RootState) => state.ui.pendingCartItem;
