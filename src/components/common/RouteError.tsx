'use client';

import { CloudOff } from 'lucide-react';
import { useEffect } from 'react';
import { ROUTES } from '@/constants';
import { getErrorMessage } from '@/lib/errors';
import { Button } from '../ui/Button';
import { ButtonLink } from '../ui/ButtonLink';
import { EmptyState } from '../ui/EmptyState';

interface RouteErrorProps {
  error: unknown;
  retry: () => void;
  title?: string;
}

/** Shared UI for route-level error.tsx boundaries. */
export function RouteError({ error, retry, title = 'Something went wrong' }: RouteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-10">
      <EmptyState
        icon={<CloudOff />}
        title={title}
        description={`${getErrorMessage(error)} Try again, or head back to the home page.`}
        action={
          <>
            <Button onClick={() => retry()}>Try again</Button>
            <ButtonLink href={ROUTES.home} variant="secondary">
              Go to home page
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
