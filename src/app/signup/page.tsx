import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthFormSkeleton } from '@/components/auth/AuthFormSkeleton';
import { SignupForm } from '@/components/auth/SignupForm';
import { ROUTES } from '@/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Create an account',
  description: 'Create a free ShopNest account to save your cart and track orders.',
  path: ROUTES.signup,
  noIndex: true,
});

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" subtitle="It takes under a minute. No password needed.">
      <Suspense fallback={<AuthFormSkeleton fields={3} />}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
