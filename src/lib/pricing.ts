import { COUPON_BY_CODE, PRICING, type Coupon } from '@/constants';
import { formatPrice } from './format';
import type { CartItem, PriceSummary, SelectedVariants } from '@/types/cart';
import type { Product } from '@/types/product';

export function getVariantPriceDelta(product: Product, selected: SelectedVariants): number {
  return product.variantGroups.reduce((sum, group) => {
    const option = group.options.find((o) => o.id === selected[group.id]);
    return sum + (option?.priceDelta ?? 0);
  }, 0);
}

export function getUnitPrice(product: Product, selected: SelectedVariants) {
  const delta = getVariantPriceDelta(product, selected);
  return { price: product.price + delta, mrp: product.mrp + delta };
}

export function getVariantLabel(product: Product, selected: SelectedVariants): string {
  return product.variantGroups
    .map((group) => {
      const option = group.options.find((o) => o.id === selected[group.id]);
      return option ? `${group.name}: ${option.label}` : null;
    })
    .filter(Boolean)
    .join(', ');
}

/** Same product + same variants => same cart line. */
export function buildLineId(productId: number, selected: SelectedVariants): string {
  const variantKey = Object.keys(selected)
    .sort()
    .map((key) => `${key}=${selected[key]}`)
    .join('&');
  return variantKey ? `${productId}?${variantKey}` : String(productId);
}

export type CouponCheck = { valid: true; coupon: Coupon } | { valid: false; reason: string };

/** Check a coupon code against the current subtotal. */
export function validateCoupon(code: string, subtotal: number): CouponCheck {
  const coupon = COUPON_BY_CODE[code.trim().toUpperCase()];
  if (!coupon) return { valid: false, reason: 'This coupon code is not valid' };
  if (subtotal < coupon.minOrder) {
    return {
      valid: false,
      reason: `Add ${formatPrice(coupon.minOrder - subtotal)} more to use ${coupon.code}`,
    };
  }
  return { valid: true, coupon };
}

function couponDiscountFor(coupon: Coupon, subtotal: number): number {
  if (coupon.type === 'percent') {
    const amount = Math.round((subtotal * coupon.value) / 100);
    return Math.min(amount, coupon.maxDiscount ?? amount);
  }
  if (coupon.type === 'flat') return Math.min(coupon.value, subtotal);
  return 0;
}

/**
 * Order totals. A coupon that no longer qualifies (e.g. the cart dropped below its minimum)
 * is ignored rather than applied.
 */
export function calculateSummary(
  items: CartItem[],
  couponCode: string | null = null,
): PriceSummary {
  let itemCount = 0;
  let subtotal = 0;
  let mrpTotal = 0;
  for (const item of items) {
    itemCount += item.quantity;
    subtotal += item.unitPrice * item.quantity;
    mrpTotal += item.unitMrp * item.quantity;
  }

  const check = couponCode && itemCount > 0 ? validateCoupon(couponCode, subtotal) : null;
  const coupon = check?.valid ? check.coupon : null;
  const couponDiscount = coupon ? couponDiscountFor(coupon, subtotal) : 0;

  const freeDelivery =
    itemCount === 0 || subtotal >= PRICING.freeDeliveryThreshold || coupon?.type === 'shipping';
  const deliveryFee = freeDelivery ? 0 : PRICING.deliveryFee;

  return {
    itemCount,
    subtotal,
    mrpTotal,
    discount: mrpTotal - subtotal,
    couponCode: coupon?.code ?? null,
    couponDiscount,
    deliveryFee,
    total: subtotal - couponDiscount + deliveryFee,
  };
}

export const discountPercent = (price: number, mrp: number) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
