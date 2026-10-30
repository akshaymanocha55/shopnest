'use client';

import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { toast } from 'sonner';
import { ROUTES, TOAST } from '@/constants';
import { formatDate, formatDay, formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { orderService } from '@/services/order.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { cancelOrder, selectOrderById } from '@/store/slices/orders.slice';
import { Button } from '../ui/Button';

export const OrderRow = memo(function OrderRow({ orderId }: { orderId: string }) {
  const dispatch = useAppDispatch();
  const order = useAppSelector((state) => selectOrderById(state, orderId));

  // DELETE /carts/:id via the API client, then mark the order cancelled locally.
  const cancel = useMutation({
    mutationFn: () => orderService.cancelOrder(orderId),
    onSuccess: () => {
      dispatch(cancelOrder(orderId));
      toast.success(TOAST.orderCancelled);
    },
  });

  if (!order) return null;
  const cancelled = order.status === 'cancelled';

  return (
    <article className="rounded-2xl bg-white p-5 ring-1 ring-mist">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={ROUTES.orderConfirmation(order.id)}
            className="font-semibold text-ink-900 hover:underline"
          >
            Order #{order.id}
          </Link>
          <p className="text-sm text-ink-400">Placed {formatDate(order.placedAt)}</p>
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold',
            cancelled ? 'bg-rose-50 text-rose-600' : 'bg-leaf-50 text-leaf-600',
          )}
        >
          {cancelled ? 'Cancelled' : `Arriving ${formatDay(order.estimatedDelivery)}`}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex -space-x-3">
          {order.items.slice(0, 4).map((item) => (
            <span
              key={item.lineId}
              className="relative size-12 overflow-hidden rounded-xl bg-paper ring-2 ring-white"
            >
              <Image
                src={item.image}
                alt=""
                fill
                sizes="48px"
                className="object-contain p-1.5 mix-blend-multiply"
              />
            </span>
          ))}
          {order.items.length > 4 && (
            <span className="grid size-12 place-items-center rounded-xl bg-ink-50 text-sm font-semibold ring-2 ring-white">
              +{order.items.length - 4}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-bold tabular-nums">
            {formatPrice(order.summary.total)}
          </span>
          {!cancelled && (
            <Button
              variant="ghost"
              size="sm"
              loading={cancel.isPending}
              onClick={() => cancel.mutate()}
              className="text-rose-600 hover:bg-rose-50"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </article>
  );
});
