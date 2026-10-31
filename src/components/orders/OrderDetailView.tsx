'use client';

import { ArrowLeft, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { selectOrderById } from '@/store/slices/orders.slice';
import { ButtonLink } from '../ui/ButtonLink';
import { EmptyState } from '../ui/EmptyState';
import { OrderDetails } from './OrderDetails';

/** Order details page from My account → Orders (no "Order placed" hero). */
export function OrderDetailView({ orderId }: { orderId: string }) {
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

  const cancelled = order.status === 'cancelled';

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href={ROUTES.accountOrders}
        className="inline-flex items-center gap-1.5 rounded-full py-1 text-sm font-semibold text-ink-600 transition hover:text-ink-900"
      >
        <ArrowLeft className="size-4" /> My orders
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">Order #{order.id}</h1>
          <p className="mt-1 text-ink-500">
            Placed on {formatDate(order.placedAt)}, {order.summary.itemCount}{' '}
            {order.summary.itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1.5 text-sm font-semibold',
            cancelled ? 'bg-rose-50 text-rose-600' : 'bg-leaf-50 text-leaf-600',
          )}
        >
          {cancelled ? 'Cancelled' : 'Confirmed'}
        </span>
      </div>
      <OrderDetails
        order={order}
        actions={
          <ButtonLink href={ROUTES.products} variant="secondary">
            Shop again
          </ButtonLink>
        }
      />
    </div>
  );
}
