import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthFormSkeleton } from '@/components/auth/AuthFormSkeleton';
import { LoginForm } from '@/components/auth/LoginForm';
import { ROUTES } from '@/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Log in',
  description: 'Log in to ShopNest with your mobile number and a one-time password.',
  path: ROUTES.login,
  noIndex: true,
});

export default function LoginPage() {
  return (
    <AuthShell title="Log in" subtitle="We’ll text a one-time code to your mobile number.">
      <Suspense fallback={<AuthFormSkeleton fields={1} />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
