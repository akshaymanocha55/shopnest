import { Skeleton } from '../../ui/Skeleton';

export function ProductDetailSkeleton() {
  return (
    <div className="container-page pt-6 pb-10" aria-busy aria-label="Loading product">
      <Skeleton className="h-5 w-72" />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="flex flex-col-reverse gap-3 md:flex-row">
          <div className="flex gap-3 md:flex-col">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="size-18 rounded-xl md:size-20" />
            ))}
          </div>
          <Skeleton className="aspect-square flex-1 rounded-[1.75rem]" />
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-52" />
          <Skeleton className="h-10 w-72 rounded-full" />
          <Skeleton className="h-12 w-36 rounded-full" />
          <div className="flex gap-3">
            <Skeleton className="h-13 flex-1 rounded-full" />
            <Skeleton className="h-13 flex-1 rounded-full" />
          </div>
          <Skeleton className="h-36 w-full rounded-[var(--radius-card)]" />
        </div>
      </div>
    </div>
  );
}
