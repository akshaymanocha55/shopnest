'use client';

import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { LIMITS, ROUTES, TOAST } from '@/constants';
import { formatPrice } from '@/lib/format';
import { discountPercent } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem, removeItem, selectCartItemById, updateQuantity } from '@/store/slices/cart.slice';
import { QuantityStepper } from '../ui/QuantityStepper';

/**
 * One cart row. It subscribes to its own line by id, so changing another line's
 * quantity does not re-render this one.
 */
export const CartLine = memo(function CartLine({ lineId }: { lineId: string }) {
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) => selectCartItemById(state, lineId));
  const [removing, setRemoving] = useState(false);

  const onQuantity = useCallback(
    (quantity: number) => dispatch(updateQuantity({ lineId, quantity })),
    [dispatch, lineId],
  );

  const onRemove = useCallback(() => {
    if (!item) return;
    setRemoving(true);
    // Let the exit animation play before the row leaves the list.
    setTimeout(() => {
      dispatch(removeItem(lineId));
      toast(TOAST.removedFromCart, {
        description: item.title.slice(0, 50),
        action: { label: 'Undo', onClick: () => dispatch(addItem(item)) },
      });
    }, 220);
  }, [dispatch, item, lineId]);

  if (!item) return null;
  const off = discountPercent(item.unitPrice, item.unitMrp);

  return (
    <li
      className={cn(
        'flex gap-4 py-5 transition-[opacity,transform] duration-200 sm:gap-5',
        removing && 'translate-x-4 opacity-0',
      )}
    >
      <Link
        href={ROUTES.product(item.slug)}
        className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-paper sm:size-28"
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="112px"
          className="object-contain p-3 mix-blend-multiply"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={ROUTES.product(item.slug)}
              className="line-clamp-2 font-semibold text-ink-800 hover:text-ink-900 hover:underline"
            >
              {item.title}
            </Link>
            {item.variantLabel && <p className="mt-1 text-sm text-ink-500">{item.variantLabel}</p>}
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-lg leading-7 font-bold text-ink-900 tabular-nums">
              {formatPrice(item.unitPrice * item.quantity)}
            </p>
            {off > 0 && (
              <p className="text-sm leading-6">
                <span className="text-ink-400 tabular-nums line-through">
                  {formatPrice(item.unitMrp * item.quantity)}
                </span>
                <span className="ml-1.5 font-semibold text-leaf-600">{off}% off</span>
              </p>
            )}
            {item.quantity > 1 && (
              <p className="text-xs text-ink-400">{formatPrice(item.unitPrice)} each</p>
            )}
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <QuantityStepper
            value={item.quantity}
            max={LIMITS.maxQuantityPerItem}
            onChange={onQuantity}
            size="sm"
            label={`Quantity for ${item.title}`}
          />
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink-500 transition hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          >
            <Trash2 className="size-4" />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
});
