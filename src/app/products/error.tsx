'use client';

import { RouteError } from '@/components/common/RouteError';

export default function ProductsError(props: { error: unknown; retry: () => void }) {
  return <RouteError {...props} title="We could not load products" />;
}
