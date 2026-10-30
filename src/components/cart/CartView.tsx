'use client';

import { ShieldCheck, ShoppingBag } from 'lucide-react';
import { ROUTES } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import { selectCartLineIds, selectCartSummary } from '@/store/slices/cart.slice';
import { ButtonLink } from '../ui/ButtonLink';
import { EmptyState } from '../ui/EmptyState';
import { CartLine } from './CartLine';
import { OrderSummary } from './OrderSummary';

export function CartView() {
  // Subscribes to the list of ids (changes only on add/remove) and the memoised summary.
  const lineIds = useAppSelector(selectCartLineIds);
  const summary = useAppSelector(selectCartSummary);

  if (lineIds.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag />}
        title="Your cart is empty"
        description="Items you add will show up here. Start with today’s best sellers."
        action={
          <>
            <ButtonLink href={ROUTES.products}>Start shopping</ButtonLink>
            <ButtonLink href={ROUTES.accountOrders} variant="secondary">
              View past orders
            </ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section
        aria-label="Cart items"
        className="rounded-[var(--radius-card)] bg-white px-5 ring-1 ring-mist sm:px-6"
      >
        <ul className="divide-y divide-mist">
          {lineIds.map((id) => (
            <CartLine key={id} lineId={id} />
          ))}
        </ul>
      </section>
      <aside className="lg:sticky lg:top-36 lg:self-start">
        <OrderSummary summary={summary}>
          <ButtonLink href={ROUTES.checkout} size="lg" className="w-full">
            Go to checkout
          </ButtonLink>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
            <ShieldCheck className="size-3.5" /> Secure checkout
          </p>
        </OrderSummary>
      </aside>
    </div>
  );
}
