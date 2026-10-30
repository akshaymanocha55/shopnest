import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthStatus, User } from '@/types/auth';
import type { RootState } from '../store';

interface AuthState {
  status: AuthStatus;
  user: User | null;
}

const initialState: AuthState = { status: 'checking', user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authenticated(state, action: PayloadAction<User>) {
      state.status = 'authenticated';
      state.user = action.payload;
    },
    signedOut(state) {
      state.status = 'guest';
      state.user = null;
    },
    userUpdated(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
});

export const { authenticated, signedOut, userUpdated } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthenticated = (state: RootState) => state.auth.status === 'authenticated';
export const selectUser = (state: RootState) => state.auth.user;
export const selectUserId = (state: RootState) => state.auth.user?.id ?? null;
export const selectUserFirstName = (state: RootState) =>
  state.auth.user?.name.split(' ')[0] ?? null;
