'use client';

import { FileQuestion } from 'lucide-react';
import { ROUTES } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import { selectOrderById } from '@/store/slices/orders.slice';
import { OrderDetails } from '../orders/OrderDetails';
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

/** "Order placed" hero + full order details with tracking. */
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

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col items-center text-center">
        <AnimatedCheck />
        <h1 className="mt-6 animate-rise text-4xl font-extrabold text-ink-900">Order placed</h1>
        <p className="mt-2 animate-rise text-ink-500 [animation-delay:100ms]">
          Order <span className="font-semibold text-ink-800">#{order.id}</span>. A confirmation has
          been sent to your email.
        </p>
      </div>

      <div className="mt-10">
        <OrderDetails
          order={order}
          actions={
            <>
              <ButtonLink href={ROUTES.products}>Continue shopping</ButtonLink>
              <ButtonLink href={ROUTES.accountOrders} variant="secondary">
                View all orders
              </ButtonLink>
            </>
          }
        />
      </div>
    </div>
  );
}
