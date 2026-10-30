'use client';

import { FileQuestion, MapPin, PackageCheck } from 'lucide-react';
import Image from 'next/image';
import { PAYMENT_METHODS, ROUTES } from '@/constants';
import { formatAddress, formatDay, formatPrice } from '@/lib/format';
import { useAppSelector } from '@/store/hooks';
import { selectOrderById } from '@/store/slices/orders.slice';
import { OrderSummary } from '../cart/OrderSummary';
import { ButtonLink } from '../ui/ButtonLink';
import { EmptyState } from '../ui/EmptyState';

function AnimatedCheck() {
  return (
    <svg viewBox="0 0 52 52" className="size-20" aria-hidden>
      <circle cx="26" cy="26" r="25" className="fill-leaf-500 motion-safe:animate-pop-in" />
      <path
        d="M15 27l7 7 15-15"
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="48"
        className="animate-draw"
      />
    </svg>
  );
}

export function OrderConfirmation({ orderId }: { orderId: string }) {
  const order = useAppSelector((state) => selectOrderById(state, orderId));

  if (!order) {
    return (
      <EmptyState
        icon={<FileQuestion />}
        title="We couldn’t find this order"
        description="It may belong to a different account. Your recent orders are listed in My account."
        action={<ButtonLink href={ROUTES.accountOrders}>View my orders</ButtonLink>}
      />
    );
  }

  const payment = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col items-center text-center">
        <AnimatedCheck />
        <h1 className="mt-6 animate-rise text-4xl font-extrabold text-ink-900">Order placed</h1>
        <p className="mt-2 animate-rise text-ink-500 [animation-delay:100ms]">
          Order <span className="font-semibold text-ink-800">#{order.id}</span>. A confirmation has
          been sent to your email.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-[var(--radius-card)] bg-leaf-50 p-5">
            <PackageCheck className="size-8 shrink-0 text-leaf-600" />
            <div>
              <p className="font-semibold text-ink-900">
                Arriving by {formatDay(order.estimatedDelivery)}
              </p>
              <p className="text-sm text-ink-600">
                Paid with {payment}
                {order.couponCode && `, coupon ${order.couponCode} applied`}
              </p>
            </div>
          </div>
          <div className="grid gap-4 rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-mist sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 font-semibold text-ink-900">
                <MapPin className="size-4" /> Shipping to {order.shippingAddress.fullName}
              </p>
              <p className="mt-1 text-sm text-ink-600">{formatAddress(order.shippingAddress)}</p>
            </div>
            <div>
              <p className="font-semibold text-ink-900">Billing address</p>
              <p className="mt-1 text-sm text-ink-600">
                {formatAddress(order.billingAddress) === formatAddress(order.shippingAddress)
                  ? 'Same as shipping address'
                  : `${order.billingAddress.fullName}, ${formatAddress(order.billingAddress)}`}
              </p>
            </div>
          </div>
          <ul className="divide-y divide-mist rounded-[var(--radius-card)] bg-white px-5 ring-1 ring-mist">
            {order.items.map((item) => (
              <li key={item.lineId} className="flex items-center gap-4 py-4">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-paper">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain p-2 mix-blend-multiply"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 font-medium text-ink-800">{item.title}</span>
                  <span className="text-sm text-ink-500">
                    Qty {item.quantity}
                    {item.variantLabel && `, ${item.variantLabel}`}
                  </span>
                </span>
                <span className="font-semibold tabular-nums">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <OrderSummary summary={order.summary} title="Payment summary">
          <div className="flex flex-col gap-3">
            <ButtonLink href={ROUTES.products}>Continue shopping</ButtonLink>
            <ButtonLink href={ROUTES.accountOrders} variant="secondary">
              View all orders
            </ButtonLink>
          </div>
        </OrderSummary>
      </div>
    </div>
  );
}
