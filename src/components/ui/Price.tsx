import { memo } from 'react';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface PriceProps {
  price: number;
  mrp?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { price: 'text-base', mrp: 'text-xs', off: 'text-xs' },
  md: { price: 'text-lg', mrp: 'text-sm', off: 'text-sm' },
  lg: { price: 'text-3xl', mrp: 'text-base', off: 'text-base' },
};

/** Selling price, struck-through MRP and % off. Visible to guests and logged-in users alike. */
export const Price = memo(function Price({ price, mrp, size = 'md', className }: PriceProps) {
  const off = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const s = sizes[size];

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span className={cn('font-display font-bold text-ink-900 tabular-nums', s.price)}>
        {formatPrice(price)}
      </span>
      {off > 0 && (
        <>
          <span className={cn('text-ink-400 tabular-nums line-through', s.mrp)}>
            <span className="sr-only">Original price </span>
            {formatPrice(mrp!)}
          </span>
          <span className={cn('font-semibold text-leaf-500', s.off)}>{off}% off</span>
        </>
      )}
    </div>
  );
});
