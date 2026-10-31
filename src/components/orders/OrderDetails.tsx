'use client';

import { useMutation } from '@tanstack/react-query';
import { CreditCard, MapPin, ReceiptText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { PAYMENT_METHODS, ROUTES, TOAST } from '@/constants';
import { formatAddress, formatPrice } from '@/lib/format';
import { discountPercent } from '@/lib/pricing';
import { orderService } from '@/services/order.service';
import { useAppDispatch } from '@/store/hooks';
import { cancelOrder } from '@/store/slices/orders.slice';
import type { Order } from '@/types/order';
import { OrderSummary } from '../cart/OrderSummary';
import { Button } from '../ui/Button';
import { OrderTracking } from './OrderTracking';

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-mist">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <span className="text-ink-400">{icon}</span> {title}
      </p>
      <div className="mt-2 text-sm text-ink-600">{children}</div>
    </div>
  );
}

interface OrderDetailsProps {
  order: Order;
  /** Extra actions under the payment summary (e.g. "Continue shopping"). */
  actions?: ReactNode;
}

/** Everything about one order: tracking, items, addresses, payment and price breakdown. */
export function OrderDetails({ order, actions }: OrderDetailsProps) {
  const dispatch = useAppDispatch();
  const payment = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label;
  const sameBilling = formatAddress(order.billingAddress) === formatAddress(order.shippingAddress);

  const cancel = useMutation({
    mutationFn: () => orderService.cancelOrder(order.id),
    onSuccess: () => {
      dispatch(cancelOrder(order.id));
      toast.success(TOAST.orderCancelled);
    },
  });

  return (
    <div className="space-y-6">
      <OrderTracking order={order} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <section
            aria-label="Items"
            className="rounded-[var(--radius-card)] bg-white px-5 ring-1 ring-mist"
          >
            <ul className="divide-y divide-mist">
              {order.items.map((item) => {
                const off = discountPercent(item.unitPrice, item.unitMrp);
                return (
                  <li key={item.lineId} className="flex items-center gap-4 py-4">
                    <Link
                      href={ROUTES.product(item.slug)}
                      className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-paper"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="64px"
                        className="object-contain p-2 mix-blend-multiply"
                      />
                    </Link>
                    <span className="min-w-0 flex-1">
                      <Link
                        href={ROUTES.product(item.slug)}
                        className="line-clamp-1 font-medium text-ink-800 hover:underline"
                      >
                        {item.title}
                      </Link>
                      <span className="text-sm text-ink-500">
                        Qty {item.quantity}
                        {item.variantLabel && `, ${item.variantLabel}`}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block leading-6 font-semibold tabular-nums">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                      {off > 0 && (
                        <span className="text-xs font-semibold text-leaf-600">{off}% off</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={<MapPin className="size-4" />}
              title={`Shipping to ${order.shippingAddress.fullName}`}
            >
              <p>{formatAddress(order.shippingAddress)}</p>
              <p className="mt-1 text-ink-400">{order.shippingAddress.mobile}</p>
            </InfoCard>
            <InfoCard icon={<ReceiptText className="size-4" />} title="Billing address">
              {sameBilling ? (
                <p>Same as shipping address</p>
              ) : (
                <>
                  <p className="font-medium text-ink-800">{order.billingAddress.fullName}</p>
                  <p>{formatAddress(order.billingAddress)}</p>
                </>
              )}
            </InfoCard>
            <InfoCard icon={<CreditCard className="size-4" />} title="Payment">
              <p>{payment}</p>
              {order.couponCode && (
                <p className="mt-1 text-leaf-600">Coupon {order.couponCode} applied</p>
              )}
            </InfoCard>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <OrderSummary summary={order.summary} title="Payment summary">
            <div className="flex flex-col gap-3">
              {actions}
              {order.status === 'confirmed' && (
                <Button
                  variant="ghost"
                  loading={cancel.isPending}
                  onClick={() => cancel.mutate()}
                  className="text-rose-600 hover:bg-rose-50"
                >
                  Cancel order
                </Button>
              )}
            </div>
          </OrderSummary>
        </aside>
      </div>
    </div>
  );
}
