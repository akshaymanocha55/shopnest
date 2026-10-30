import type { Metadata } from 'next';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { CartSkeleton } from '@/components/cart/CartSkeleton';
import { CheckoutView } from '@/components/checkout/CheckoutView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ROUTES } from '@/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Checkout',
  description: 'Enter your delivery details and place your order.',
  path: ROUTES.checkout,
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <div className="container-page py-8 lg:py-10">
      <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">Checkout</h1>
      <div className="mt-6">
        <ErrorBoundary title="Checkout could not be displayed">
          <RequireAuth fallback={<CartSkeleton />}>
            <CheckoutView />
          </RequireAuth>
        </ErrorBoundary>
      </div>
    </div>
  );
}
