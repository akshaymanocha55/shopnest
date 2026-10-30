import { LIMITS } from '@/constants';
import { buildCartItem } from '@/hooks/useAddToCart';
import {
  addItem,
  clearCart,
  removeItem,
  selectCartCount,
  selectCartLineIds,
  selectCartSummary,
  updateQuantity,
} from '@/store/slices/cart.slice';
import { makeStore } from '@/store/store';
import { jacket, ssd } from '@/test-utils/fixtures';

describe('cart slice', () => {
  const setup = () => makeStore();

  it('adds items and merges the same product + variant into one line', () => {
    const store = setup();
    store.dispatch(addItem(buildCartItem(jacket, { size: 'm' }, 1)));
    store.dispatch(addItem(buildCartItem(jacket, { size: 'm' }, 2)));
    store.dispatch(addItem(buildCartItem(jacket, { size: 'l' }, 1)));

    expect(selectCartLineIds(store.getState())).toHaveLength(2);
    expect(selectCartCount(store.getState())).toBe(4);
  });

  it('caps quantity at the per-item limit', () => {
    const store = setup();
    store.dispatch(addItem(buildCartItem(ssd, { warranty: '1y' }, 50)));
    expect(selectCartCount(store.getState())).toBe(LIMITS.maxQuantityPerItem);
  });

  it('updates quantity and never goes below 1', () => {
    const store = setup();
    const item = buildCartItem(ssd, { warranty: '1y' }, 1);
    store.dispatch(addItem(item));
    store.dispatch(updateQuantity({ lineId: item.lineId, quantity: 3 }));
    expect(selectCartCount(store.getState())).toBe(3);
    store.dispatch(updateQuantity({ lineId: item.lineId, quantity: 0 }));
    expect(selectCartCount(store.getState())).toBe(1);
  });

  it('removes and clears items', () => {
    const store = setup();
    const a = buildCartItem(ssd, { warranty: '1y' }, 1);
    const b = buildCartItem(jacket, { size: 'm' }, 1);
    store.dispatch(addItem(a));
    store.dispatch(addItem(b));
    store.dispatch(removeItem(a.lineId));
    expect(selectCartLineIds(store.getState())).toEqual([b.lineId]);
    store.dispatch(clearCart());
    expect(selectCartLineIds(store.getState())).toEqual([]);
  });

  it('calculates totals including variant price', () => {
    const store = setup();
    store.dispatch(addItem(buildCartItem(ssd, { warranty: '2y' }, 2)));
    expect(selectCartSummary(store.getState()).subtotal).toBe((ssd.price + 799) * 2);
  });

  it('memoises the summary selector', () => {
    const store = setup();
    store.dispatch(addItem(buildCartItem(ssd, { warranty: '1y' }, 1)));
    const first = selectCartSummary(store.getState());
    expect(selectCartSummary(store.getState())).toBe(first);
  });
});
