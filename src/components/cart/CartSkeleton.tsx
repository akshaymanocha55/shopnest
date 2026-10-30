import { Skeleton } from '../ui/Skeleton';

export function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]" aria-busy aria-label="Loading">
      <div className="space-y-5 rounded-[var(--radius-card)] bg-white p-6 ring-1 ring-mist">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-5">
            <Skeleton className="size-28 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-80 rounded-[var(--radius-card)]" />
    </div>
  );
}
