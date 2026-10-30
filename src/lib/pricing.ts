import { PRICING } from '@/constants';
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

export function calculateSummary(items: CartItem[]): PriceSummary {
  let itemCount = 0;
  let subtotal = 0;
  let mrpTotal = 0;
  for (const item of items) {
    itemCount += item.quantity;
    subtotal += item.unitPrice * item.quantity;
    mrpTotal += item.unitMrp * item.quantity;
  }
  const deliveryFee =
    itemCount === 0 || subtotal >= PRICING.freeDeliveryThreshold ? 0 : PRICING.deliveryFee;
  return {
    itemCount,
    subtotal,
    mrpTotal,
    discount: mrpTotal - subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
}
