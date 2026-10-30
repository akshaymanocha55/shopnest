import { Compass } from 'lucide-react';
import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { EmptyState } from '@/components/ui/EmptyState';
import { ROUTES } from '@/constants';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <div className="container-page py-10">
      <EmptyState
        icon={<Compass />}
        title="This page does not exist"
        description="The link may be old or mistyped. Search for what you need, or browse all products."
        action={
          <>
            <ButtonLink href={ROUTES.products}>Browse all products</ButtonLink>
            <ButtonLink href={ROUTES.home} variant="secondary">
              Go to home page
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
