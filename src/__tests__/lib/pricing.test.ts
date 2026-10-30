import { PRICING } from '@/constants';
import { buildLineId, calculateSummary, getUnitPrice, getVariantLabel } from '@/lib/pricing';
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
      deliveryFee: 0,
      total: 0,
    });
  });
});
