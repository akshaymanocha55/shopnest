import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { CartSkeleton } from '@/components/cart/CartSkeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OrderDetailView } from '@/components/orders/OrderDetailView';

export const metadata: Metadata = {
  title: 'Order details',
  robots: { index: false, follow: false },
};

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  return (
    <div className="container-page py-8 lg:py-10">
      <ErrorBoundary title="This order could not be displayed">
        <Suspense fallback={<CartSkeleton />}>
          {params.then(({ orderId }) => (
            <RequireAuth fallback={<CartSkeleton />}>
              <OrderDetailView orderId={decodeURIComponent(orderId)} />
            </RequireAuth>
          ))}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
