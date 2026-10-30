export type CouponType = 'percent' | 'flat' | 'shipping';

export interface Coupon {
  code: string;
  type: CouponType;
  /** Percent (for 'percent') or rupees (for 'flat'). Ignored for 'shipping'. */
  value: number;
  /** Maximum discount in rupees for percent coupons. */
  maxDiscount?: number;
  minOrder: number;
  description: string;
}

/** Demo coupons. A real store would validate these on the server. */
export const COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    maxDiscount: 1000,
    minOrder: 499,
    description: '10% off, up to ₹1,000',
  },
  {
    code: 'FLAT200',
    type: 'flat',
    value: 200,
    minOrder: 1499,
    description: '₹200 off on orders over ₹1,499',
  },
  {
    code: 'FREESHIP',
    type: 'shipping',
    value: 0,
    minOrder: 0,
    description: 'Free delivery on any order',
  },
];

export const COUPON_BY_CODE: Record<string, Coupon> = Object.fromEntries(
  COUPONS.map((c) => [c.code, c]),
);
