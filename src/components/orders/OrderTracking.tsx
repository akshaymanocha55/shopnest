'use client';

import {
  Check,
  CircleX,
  Copy,
  Home,
  Package,
  PackageCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNow } from '@/hooks/useNow';
import { formatDay } from '@/lib/format';
import { getTrackingSteps, trackingNumber, type TrackingStepKey } from '@/lib/tracking';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/order';

const ICONS: Record<TrackingStepKey, typeof Truck> = {
  ordered: ShoppingBag,
  packed: Package,
  shipped: Truck,
  'out-for-delivery': PackageCheck,
  delivered: Home,
};

const timeFormat = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' });

/** Shipment timeline (vertical on mobile, horizontal on desktop) with a tracking number. */
export function OrderTracking({ order }: { order: Order }) {
  const now = useNow();
  const awb = trackingNumber(order.id);

  if (order.status === 'cancelled') {
    return (
      <section
        className="flex items-center gap-4 rounded-[var(--radius-card)] bg-rose-50 p-5"
        aria-label="Order status"
      >
        <CircleX className="size-8 shrink-0 text-rose-500" />
        <div>
          <p className="font-semibold text-ink-900">This order was cancelled</p>
          <p className="text-sm text-ink-600">
            Any amount paid will be refunded to the original payment method in 3–5 days.
          </p>
        </div>
      </section>
    );
  }

  const steps = getTrackingSteps(order, now || new Date(order.placedAt).getTime());
  const current = steps.find((s) => s.current) ?? steps[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(awb);
      toast.success('Tracking number copied');
    } catch {
      toast.error('Could not copy the tracking number');
    }
  };

  return (
    <section
      aria-labelledby="tracking-heading"
      className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-mist sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="tracking-heading" className="text-xl font-bold text-ink-900">
            Track your order
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            {current.key === 'delivered'
              ? 'Delivered'
              : `Arriving by ${formatDay(order.estimatedDelivery)}`}
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2 text-left text-xs transition hover:bg-ink-50"
          aria-label={`Copy tracking number ${awb}`}
        >
          <span>
            <span className="block text-ink-400">ShopNest Express</span>
            <span className="font-bold tracking-wide text-ink-800">{awb}</span>
          </span>
          <Copy className="size-3.5 text-ink-400" />
        </button>
      </div>

      <ol className="mt-6 grid gap-0 md:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = ICONS[step.key];
          const isLast = index === steps.length - 1;
          return (
            <li
              key={step.key}
              className="relative flex gap-4 pb-6 md:flex-col md:items-center md:gap-3 md:pb-0 md:text-center"
            >
              {/* Connector line: vertical on mobile, horizontal on desktop */}
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute top-10 left-5 h-[calc(100%-2.5rem)] w-0.5 md:top-5 md:left-[calc(50%+1.5rem)] md:h-0.5 md:w-[calc(100%-3rem)]',
                    steps[index + 1].done ? 'bg-leaf-500' : 'bg-mist',
                  )}
                />
              )}
              <span
                className={cn(
                  'relative z-10 grid size-10 shrink-0 place-items-center rounded-full transition-colors',
                  step.done ? 'bg-leaf-500 text-white' : 'bg-paper text-ink-300 ring-1 ring-mist',
                  step.current && 'ring-leaf-100 ring-4',
                )}
              >
                {step.done && !step.current ? (
                  <Check className="size-4.5" strokeWidth={3} />
                ) : (
                  <Icon className="size-4.5" />
                )}
                {step.current && step.key !== 'delivered' && (
                  <span
                    className="absolute inset-0 animate-ping rounded-full bg-leaf-500/30 motion-reduce:hidden"
                    aria-hidden
                  />
                )}
              </span>
              <span className="min-w-0 pt-1 md:pt-0">
                <span
                  className={cn(
                    'block text-sm font-semibold',
                    step.done ? 'text-ink-900' : 'text-ink-400',
                  )}
                >
                  {step.label}
                  {step.current && <span className="sr-only"> (current status)</span>}
                </span>
                <span className="block text-xs text-ink-400">
                  {step.done
                    ? `${formatDay(step.at.toISOString())}, ${timeFormat.format(step.at)}`
                    : `Expected ${formatDay(step.at.toISOString())}`}
                </span>
                {step.current && (
                  <span className="mt-0.5 block text-xs text-leaf-600">{step.description}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
