import type { CartItem, PriceSummary } from './cart';

export interface AddressFields {
  fullName: string;
  mobile: string;
  addressLine: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
}

/** A saved address in the user's address book. */
export interface Address extends AddressFields {
  id: string;
  createdAt: string;
}

/** Kept for readability where an address is used for delivery. */
export type ShippingAddress = AddressFields;

export type PaymentMethod = 'cod' | 'upi' | 'card';

export type OrderStatus = 'confirmed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  summary: PriceSummary;
  shippingAddress: AddressFields;
  billingAddress: AddressFields;
  couponCode: string | null;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  placedAt: string;
  estimatedDelivery: string;
}
