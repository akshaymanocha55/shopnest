import { addAddress, deleteAddress, selectAddresses } from '@/store/slices/addresses.slice';
import { applyCoupon, removeCoupon, selectCartSummary, addItem } from '@/store/slices/cart.slice';
import {
  addToWishlist,
  removeFromWishlist,
  selectIsWishlisted,
  selectWishlistCount,
} from '@/store/slices/wishlist.slice';
import { makeStore } from '@/store/store';
import { buildCartItem } from '@/hooks/useAddToCart';
import { jacket, ssd } from '@/test-utils/fixtures';

const wish = (id: number, addedAt: string) => ({
  productId: id,
  slug: `p-${id}`,
  title: `P${id}`,
  image: '',
  price: 100,
  mrp: 150,
  addedAt,
});

describe('wishlist slice', () => {
  it('toggles items and keeps one entry per product', () => {
    const store = makeStore();
    store.dispatch(addToWishlist(wish(1, '2026-01-01')));
    store.dispatch(addToWishlist(wish(1, '2026-01-02')));
    expect(selectWishlistCount(store.getState())).toBe(1);
    expect(selectIsWishlisted(store.getState(), 1)).toBe(true);
    store.dispatch(removeFromWishlist(1));
    expect(selectIsWishlisted(store.getState(), 1)).toBe(false);
  });
});

describe('addresses slice', () => {
  it('adds newest first and deletes', () => {
    const store = makeStore();
    const base = {
      fullName: 'A',
      mobile: '9876543210',
      addressLine: 'x'.repeat(12),
      country: 'India',
      state: 'Delhi',
      city: 'Delhi',
      postalCode: '110092',
    };
    store.dispatch(addAddress({ ...base, id: 'a1', createdAt: '2026-01-01' }));
    store.dispatch(addAddress({ ...base, id: 'a2', createdAt: '2026-02-01' }));
    expect(selectAddresses(store.getState()).map((a) => a.id)).toEqual(['a2', 'a1']);
    store.dispatch(deleteAddress('a2'));
    expect(selectAddresses(store.getState()).map((a) => a.id)).toEqual(['a1']);
  });
});

describe('cart coupons', () => {
  it('applies and removes a coupon through the store', () => {
    const store = makeStore();
    store.dispatch(addItem(buildCartItem(ssd, { warranty: '1y' }, 1)));
    store.dispatch(addItem(buildCartItem(jacket, { size: 'm' }, 1)));
    store.dispatch(applyCoupon('flat200'));
    expect(selectCartSummary(store.getState())).toMatchObject({
      couponCode: 'FLAT200',
      couponDiscount: 200,
    });
    store.dispatch(removeCoupon());
    expect(selectCartSummary(store.getState()).couponDiscount).toBe(0);
  });
});
