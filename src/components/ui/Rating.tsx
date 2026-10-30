import { Star } from 'lucide-react';
import { memo } from 'react';
import { formatCount } from '@/lib/format';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  className?: string;
}

/** Compact rating pill: green for 4+, amber for 3+, rose below. */
export const Rating = memo(function Rating({ value, count, size = 'sm', className }: RatingProps) {
  const tone =
    value >= 4
      ? 'bg-leaf-500 text-white'
      : value >= 3
        ? 'bg-marigold-400 text-ink-900'
        : 'bg-rose-500 text-white';

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-md font-semibold',
          size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm',
          tone,
        )}
        aria-label={`Rated ${value.toFixed(1)} out of 5`}
      >
        {value.toFixed(1)}
        <Star
          className={size === 'sm' ? 'size-3' : 'size-3.5'}
          fill="currentColor"
          strokeWidth={0}
        />
      </span>
      {count != null && (
        <span className={cn('text-ink-400', size === 'sm' ? 'text-xs' : 'text-sm')}>
          ({formatCount(count)} ratings)
        </span>
      )}
    </span>
  );
});
