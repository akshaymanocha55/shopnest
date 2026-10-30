import { PRICING } from '@/constants';
import {
  buildLineId,
  calculateSummary,
  discountPercent,
  getUnitPrice,
  getVariantLabel,
  validateCoupon,
} from '@/lib/pricing';
import type { CartItem } from '@/types/cart';
import { ssd } from '@/test-utils/fixtures';

const item = (overrides: Partial<CartItem>): CartItem => ({
  lineId: '1',
  productId: 1,
  slug: 'x-1',
  title: 'X',
  image: '',
  unitPrice: 500,
  unitMrp: 700,
  quantity: 1,
  variants: {},
  variantLabel: '',
  ...overrides,
});

describe('pricing', () => {
  it('adds the variant price delta', () => {
    const { price, mrp } = getUnitPrice(ssd, { warranty: '2y' });
    expect(price).toBe(ssd.price + 799);
    expect(mrp).toBe(ssd.mrp + 799);
  });

  it('builds a readable variant label', () => {
    expect(getVariantLabel(ssd, { warranty: '3y' })).toBe('Warranty: 3 Years');
  });

  it('builds the same line id regardless of key order', () => {
    expect(buildLineId(1, { a: '1', b: '2' })).toBe(buildLineId(1, { b: '2', a: '1' }));
    expect(buildLineId(1, {})).toBe('1');
  });

  it('charges delivery below the free threshold', () => {
    const summary = calculateSummary([item({ quantity: 1 })]);
    expect(summary).toMatchObject({
      itemCount: 1,
      subtotal: 500,
      discount: 200,
      deliveryFee: PRICING.deliveryFee,
    });
    expect(summary.total).toBe(500 + PRICING.deliveryFee);
  });

  it('gives free delivery at or above the threshold', () => {
    const summary = calculateSummary([item({ quantity: 2 })]);
    expect(summary.deliveryFee).toBe(0);
    expect(summary.total).toBe(1000);
  });

  it('returns zeros for an empty cart', () => {
    expect(calculateSummary([])).toEqual({
      itemCount: 0,
      subtotal: 0,
      mrpTotal: 0,
      discount: 0,
      couponCode: null,
      couponDiscount: 0,
      deliveryFee: 0,
      total: 0,
    });
  });

  it('calculates the discount percentage', () => {
    expect(discountPercent(750, 1000)).toBe(25);
    expect(discountPercent(1000, 1000)).toBe(0);
  });
});

describe('coupons', () => {
  it('rejects unknown codes and orders below the minimum', () => {
    expect(validateCoupon('NOPE', 5000)).toEqual({
      valid: false,
      reason: 'This coupon code is not valid',
    });
    const check = validateCoupon('FLAT200', 1000);
    expect(check.valid).toBe(false);
    expect(!check.valid && check.reason).toMatch(/Add ₹499 more/);
  });

  it('is case-insensitive', () => {
    expect(validateCoupon('welcome10', 1000).valid).toBe(true);
  });

  it('applies a capped percentage discount', () => {
    const summary = calculateSummary([item({ unitPrice: 20000, unitMrp: 25000 })], 'WELCOME10');
    expect(summary.couponDiscount).toBe(1000); // 10% would be 2000, capped at 1000
    expect(summary.total).toBe(19000);
  });

  it('applies a flat discount', () => {
    const summary = calculateSummary([item({ unitPrice: 2000, unitMrp: 2500 })], 'FLAT200');
    expect(summary).toMatchObject({ couponCode: 'FLAT200', couponDiscount: 200, total: 1800 });
  });

  it('makes delivery free with FREESHIP', () => {
    const summary = calculateSummary([item({ unitPrice: 300, unitMrp: 400 })], 'FREESHIP');
    expect(summary.deliveryFee).toBe(0);
    expect(summary.total).toBe(300);
  });

  it('ignores a coupon the cart no longer qualifies for', () => {
    const summary = calculateSummary([item({ unitPrice: 500, unitMrp: 700 })], 'FLAT200');
    expect(summary).toMatchObject({ couponCode: null, couponDiscount: 0 });
  });
});
