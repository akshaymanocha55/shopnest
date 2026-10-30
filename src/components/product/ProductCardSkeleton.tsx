import { Skeleton } from '../ui/Skeleton';

/** Matches ProductCard's dimensions so swapping it for real content causes no layout shift. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-[var(--radius-card)] bg-white p-3 ring-1 ring-mist">
      <Skeleton className="aspect-square rounded-2xl" />
      <div className="flex flex-col gap-2 px-1 pt-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-[2.75rem] w-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-1 h-6 w-28" />
        <Skeleton className="mt-1 h-9 w-full rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4"
      aria-busy
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
