import type { CartItem, PriceSummary } from './cart';

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  pincode: string;
  addressLine: string;
  city: string;
  state: string;
}

export type PaymentMethod = 'cod' | 'upi' | 'card';

export type OrderStatus = 'confirmed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  summary: PriceSummary;
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  placedAt: string;
  estimatedDelivery: string;
}
