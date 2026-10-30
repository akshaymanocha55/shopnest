import type { Metadata } from 'next';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { CartSkeleton } from '@/components/cart/CartSkeleton';
import { CartView } from '@/components/cart/CartView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ROUTES } from '@/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Your cart',
  description: 'Review the items in your ShopNest cart.',
  path: ROUTES.cart,
  noIndex: true,
});

export default function CartPage() {
  return (
    <div className="container-page py-8 lg:py-10">
      <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">Your cart</h1>
      <div className="mt-6">
        <ErrorBoundary title="Your cart could not be displayed">
          <RequireAuth fallback={<CartSkeleton />}>
            <CartView />
          </RequireAuth>
        </ErrorBoundary>
      </div>
    </div>
  );
}
