'use client';

import { RouteError } from '@/components/common/RouteError';

export default function RootError(props: { error: unknown; retry: () => void }) {
  return <RouteError {...props} />;
}
