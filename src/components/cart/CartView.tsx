'use client';

import { ShieldCheck, ShoppingBag } from 'lucide-react';
import { ROUTES } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import { selectCartLineIds, selectCartSummary } from '@/store/slices/cart.slice';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { StickyActionBar } from '../common/StickyActionBar';
import { ButtonLink } from '../ui/ButtonLink';
import { EmptyState } from '../ui/EmptyState';
import { CartLine } from './CartLine';
import { CartRecommendations } from './CartRecommendations';
import { CouponBox } from './CouponBox';
import { DeliveryEstimate } from './DeliveryEstimate';
import { OrderSummary } from './OrderSummary';
import { WishlistToCart } from './WishlistToCart';

export function CartView() {
  // Subscribes to the list of ids (changes only on add/remove) and the memoised summary.
  const lineIds = useAppSelector(selectCartLineIds);
  const summary = useAppSelector(selectCartSummary);

  return (
    <div className="space-y-14 pb-24 lg:pb-0">
      {lineIds.length === 0 ? (
        <div className="space-y-6">
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
          <WishlistToCart />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <DeliveryEstimate />
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
            <WishlistToCart />
          </div>
          <aside className="space-y-5 lg:sticky lg:top-36 lg:self-start">
            <CouponBox />
            <OrderSummary summary={summary}>
              <ButtonLink href={ROUTES.checkout} size="lg" className="hidden w-full lg:flex">
                Go to checkout
              </ButtonLink>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
                <ShieldCheck className="size-3.5" /> Secure checkout
              </p>
            </OrderSummary>
          </aside>
          <StickyActionBar total={summary.total} desktop="hidden">
            <ButtonLink href={ROUTES.checkout} size="lg">
              Go to checkout
            </ButtonLink>
          </StickyActionBar>
        </div>
      )}

      <ErrorBoundary compact title="Recommendations are unavailable">
        <CartRecommendations />
      </ErrorBoundary>
    </div>
  );
}
