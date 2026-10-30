export type SelectedVariants = Record<string, string>;

export interface CartItem {
  /** Unique per product + variant combination. */
  lineId: string;
  productId: number;
  slug: string;
  title: string;
  image: string;
  /** Unit price in INR including variant deltas. */
  unitPrice: number;
  unitMrp: number;
  quantity: number;
  variants: SelectedVariants;
  variantLabel: string;
}

export interface PriceSummary {
  itemCount: number;
  subtotal: number;
  mrpTotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}
