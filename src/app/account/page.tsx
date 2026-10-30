import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountView } from '@/components/account/AccountView';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { CartSkeleton } from '@/components/cart/CartSkeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ROUTES } from '@/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'My account',
  description: 'Manage your profile and orders.',
  path: ROUTES.account,
  noIndex: true,
});

export default function AccountPage() {
  return (
    <div className="container-page py-8 lg:py-10">
      <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">My account</h1>
      <div className="mt-6">
        <ErrorBoundary title="Your account could not be displayed">
          <Suspense fallback={<CartSkeleton />}>
            <RequireAuth fallback={<CartSkeleton />}>
              <AccountView />
            </RequireAuth>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
