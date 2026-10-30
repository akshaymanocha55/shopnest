import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import type { Address } from '@/types/order';
import type { RootState } from '../store';

const addressAdapter = createEntityAdapter<Address, string>({
  selectId: (address) => address.id,
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

const addressesSlice = createSlice({
  name: 'addresses',
  initialState: addressAdapter.getInitialState(),
  reducers: {
    addAddress: addressAdapter.addOne,
    updateAddress: addressAdapter.updateOne,
    deleteAddress: addressAdapter.removeOne,
    hydrateAddresses: addressAdapter.setAll,
    clearAddresses: addressAdapter.removeAll,
  },
});

export const { addAddress, updateAddress, deleteAddress, hydrateAddresses, clearAddresses } =
  addressesSlice.actions;
export default addressesSlice.reducer;

const selectors = addressAdapter.getSelectors<RootState>((state) => state.addresses);
export const selectAddresses = selectors.selectAll;
export const selectAddressById = selectors.selectById;
export const selectAddressCount = selectors.selectTotal;
