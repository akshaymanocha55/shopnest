import { Skeleton } from '../ui/Skeleton';

export function AuthFormSkeleton({ fields }: { fields: number }) {
  return (
    <div className="space-y-5" aria-busy>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}
      <Skeleton className="h-13 w-full rounded-full" />
    </div>
  );
}
