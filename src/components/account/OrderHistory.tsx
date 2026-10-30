'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { PackageOpen } from 'lucide-react';
import { useRef } from 'react';
import { ROUTES } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import { selectOrderIds } from '@/store/slices/orders.slice';
import { ButtonLink } from '../ui/ButtonLink';
import { EmptyState } from '../ui/EmptyState';
import { OrderRow } from './OrderRow';

const ROW_GAP = 12;

/**
 * Virtualized order history: only the rows in view are mounted, so a customer with
 * hundreds of orders scrolls as smoothly as one with three.
 */
export function OrderHistory() {
  const orderIds = useAppSelector(selectOrderIds);
  const scrollRef = useRef<HTMLDivElement>(null);

  // TanStack Virtual manages its own memoisation, so the React Compiler lint skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: orderIds.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 140,
    overscan: 4,
    gap: ROW_GAP,
  });

  if (orderIds.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen />}
        title="No orders yet"
        description="When you place an order, you can track it here."
        action={<ButtonLink href={ROUTES.products}>Start shopping</ButtonLink>}
        className="rounded-[var(--radius-card)] bg-white ring-1 ring-mist"
      />
    );
  }

  return (
    <div ref={scrollRef} className="max-h-[70vh] overflow-y-auto pr-1" aria-label="Your orders">
      <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((row) => (
          <div
            key={row.key}
            data-index={row.index}
            ref={virtualizer.measureElement}
            className="absolute inset-x-0 top-0"
            style={{ transform: `translateY(${row.start}px)` }}
          >
            <OrderRow orderId={orderIds[row.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
