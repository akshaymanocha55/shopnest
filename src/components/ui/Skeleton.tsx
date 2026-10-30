import { cn } from '@/lib/utils';

/** Shimmering placeholder. Give it the same size as the real content to avoid layout shift. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'skeleton-shimmer animate-shimmer rounded-lg motion-reduce:animate-none',
        className,
      )}
    />
  );
}
