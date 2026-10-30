import type { ReactNode } from 'react';
import { PRICING } from '@/constants';
import { formatPrice } from '@/lib/format';
import type { PriceSummary } from '@/types/cart';

interface OrderSummaryProps {
  summary: PriceSummary;
  children?: ReactNode;
  title?: string;
}

/** Price breakdown used by cart, checkout and order confirmation. */
export function OrderSummary({ summary, children, title = 'Order summary' }: OrderSummaryProps) {
  const remaining = PRICING.freeDeliveryThreshold - summary.subtotal;
  const progress = Math.min(100, (summary.subtotal / PRICING.freeDeliveryThreshold) * 100);

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-mist">
      <h2 className="text-xl font-bold text-ink-900">{title}</h2>

      {summary.deliveryFee > 0 && remaining > 0 && (
        <div className="mt-4 rounded-xl bg-marigold-50 p-3">
          <p className="text-sm text-ink-700">
            Add <span className="font-semibold">{formatPrice(remaining)}</span> more for free
            delivery
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-marigold-100">
            <div
              className="h-full rounded-full bg-marigold-400 transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <dl className="mt-5 space-y-3 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-ink-500">
            MRP ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})
          </dt>
          <dd className="tabular-nums">{formatPrice(summary.mrpTotal)}</dd>
        </div>
        {summary.discount > 0 && (
          <div className="flex justify-between text-leaf-600">
            <dt>Discount ({Math.round((summary.discount / summary.mrpTotal) * 100)}% off)</dt>
            <dd className="tabular-nums">−{formatPrice(summary.discount)}</dd>
          </div>
        )}
        {summary.couponDiscount > 0 && (
          <div className="flex justify-between text-leaf-600">
            <dt>Coupon ({summary.couponCode})</dt>
            <dd className="tabular-nums">−{formatPrice(summary.couponDiscount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-ink-500">Delivery</dt>
          <dd className="tabular-nums">
            {summary.deliveryFee === 0 ? (
              <span className="font-medium text-leaf-600">Free</span>
            ) : (
              formatPrice(summary.deliveryFee)
            )}
          </dd>
        </div>
        <div className="flex justify-between border-t border-dashed border-mist pt-4 text-lg font-bold text-ink-900">
          <dt>Total</dt>
          <dd className="font-display tabular-nums">{formatPrice(summary.total)}</dd>
        </div>
      </dl>

      {summary.discount > 0 && (
        <p className="mt-3 text-sm font-medium text-leaf-600">
          You save {formatPrice(summary.discount)} on this order
        </p>
      )}

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
