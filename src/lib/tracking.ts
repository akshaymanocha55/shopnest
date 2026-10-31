import type { Order } from '@/types/order';

export type TrackingStepKey = 'ordered' | 'packed' | 'shipped' | 'out-for-delivery' | 'delivered';

export interface TrackingStep {
  key: TrackingStepKey;
  label: string;
  description: string;
  /** When the step happened, or is expected to. */
  at: Date;
  done: boolean;
  current: boolean;
}

/** How far through the delivery window (0 → 1) each step happens. */
const STEPS: { key: TrackingStepKey; label: string; description: string; at: number }[] = [
  { key: 'ordered', label: 'Order placed', description: 'We’ve received your order', at: 0 },
  {
    key: 'packed',
    label: 'Packed',
    description: 'Your items are packed and ready to ship',
    at: 0.15,
  },
  { key: 'shipped', label: 'Shipped', description: 'On the way to your city', at: 0.4 },
  { key: 'out-for-delivery', label: 'Out for delivery', description: 'Arriving today', at: 0.85 },
  { key: 'delivered', label: 'Delivered', description: 'Enjoy your purchase!', at: 1 },
];

/**
 * Tracking timeline for an order. FakeStore has no shipment data, so progress is simulated
 * from the time between "placed" and "estimated delivery".
 */
export function getTrackingSteps(
  order: Pick<Order, 'placedAt' | 'estimatedDelivery'>,
  now: number,
): TrackingStep[] {
  const start = new Date(order.placedAt).getTime();
  const end = new Date(order.estimatedDelivery).getTime();
  // Clamped at 0 so "Order placed" is always done, even if the clock is a few seconds behind.
  const progress = end > start ? Math.max(0, (now - start) / (end - start)) : 1;

  const doneCount = STEPS.filter((s) => progress >= s.at).length;
  return STEPS.map((step, index) => ({
    key: step.key,
    label: step.label,
    description: step.description,
    at: new Date(start + (end - start) * step.at),
    done: index < doneCount,
    current: index === doneCount - 1,
  }));
}

/** Tracking number shown to the customer, derived from the order id. */
export const trackingNumber = (orderId: string) =>
  `SNX${orderId.replace(/\W/g, '').slice(-8).padStart(8, '0')}`;
