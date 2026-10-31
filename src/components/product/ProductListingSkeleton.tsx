import { Skeleton } from '../ui/Skeleton';
import { ProductGridSkeleton } from './ProductCardSkeleton';

export function ProductListingSkeleton() {
  return (
    <div className="container-page py-8 lg:py-10" aria-busy aria-label="Loading products">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-2 h-5 w-24" />
        </div>
        <Skeleton className="h-10 w-48 rounded-full" />
      </div>
      <div className="mt-11 grid grid-cols-1 gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <Skeleton className="hidden h-[540px] rounded-[var(--radius-card)] lg:block" />
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
