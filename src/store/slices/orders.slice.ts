import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '@/types/order';
import type { RootState } from '../store';

const ordersAdapter = createEntityAdapter<Order, string>({
  selectId: (order) => order.id,
  sortComparer: (a, b) => b.placedAt.localeCompare(a.placedAt),
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: ordersAdapter.getInitialState(),
  reducers: {
    addOrder: ordersAdapter.addOne,
    cancelOrder(state, action: PayloadAction<string>) {
      ordersAdapter.updateOne(state, { id: action.payload, changes: { status: 'cancelled' } });
    },
    hydrateOrders: ordersAdapter.setAll,
    clearOrders: ordersAdapter.removeAll,
  },
});

export const { addOrder, cancelOrder, hydrateOrders, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;

const selectors = ordersAdapter.getSelectors<RootState>((state) => state.orders);
export const selectOrderIds = selectors.selectIds;
export const selectAllOrders = selectors.selectAll;
export const selectOrderById = selectors.selectById;
export const selectOrderCount = selectors.selectTotal;
