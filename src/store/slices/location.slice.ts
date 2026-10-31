import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export interface DeliveryLocation {
  country: string;
  city: string;
  /** Indian pincode (empty for international locations). */
  pincode: string;
  /** Area name from the pincode lookup, e.g. "Laxmi Nagar". */
  area: string;
}

const initialState: DeliveryLocation = { country: 'India', city: '', pincode: '', area: '' };

/** Where the shopper wants delivery; drives the delivery estimate in the cart. */
const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setDeliveryLocation: (state, action: PayloadAction<Partial<DeliveryLocation>>) => ({
      ...state,
      ...action.payload,
    }),
  },
});

export const { setDeliveryLocation } = locationSlice.actions;
export default locationSlice.reducer;

export const selectDeliveryLocation = (state: RootState) => state.location;
