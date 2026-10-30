import type { PaymentMethod } from '@/types/order';

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; description: string }[] = [
  { id: 'upi', label: 'UPI', description: 'Pay using any UPI app' },
  { id: 'card', label: 'Credit / Debit card', description: 'Visa, Mastercard, RuPay' },
  { id: 'cod', label: 'Cash on delivery', description: 'Pay when your order arrives' },
];

export const CHECKOUT_STEPS = ['Address', 'Payment', 'Review'] as const;
