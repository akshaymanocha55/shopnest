import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export interface DeliveryLocation {
  country: string;
  city: string;
}

const initialState: DeliveryLocation = { country: 'India', city: '' };

/** Where the shopper wants delivery; drives the delivery estimate in the cart. */
const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setDeliveryLocation: (_state, action: PayloadAction<DeliveryLocation>) => action.payload,
  },
});

export const { setDeliveryLocation } = locationSlice.actions;
export default locationSlice.reducer;

export const selectDeliveryLocation = (state: RootState) => state.location;
