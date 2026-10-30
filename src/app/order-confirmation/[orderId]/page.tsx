import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { CartSkeleton } from '@/components/cart/CartSkeleton';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';

export const metadata: Metadata = {
  title: 'Order confirmed',
  robots: { index: false, follow: false },
};

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <div className="container-page py-10 lg:py-14">
      <Suspense fallback={<CartSkeleton />}>
        {params.then(({ orderId }) => (
          <RequireAuth fallback={<CartSkeleton />}>
            <OrderConfirmation orderId={decodeURIComponent(orderId)} />
          </RequireAuth>
        ))}
      </Suspense>
    </div>
  );
}
