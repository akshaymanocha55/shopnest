import { memo } from 'react';
import { formatPrice } from '@/lib/format';
import { discountPercent } from '@/lib/pricing';
import { cn } from '@/lib/utils';

interface PriceProps {
  price: number;
  mrp?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Explicit line-heights: the display font has tall glyphs (₹ and digits) that get clipped
// by tight default leading inside flex rows.
const sizes = {
  sm: { price: 'text-base leading-6', mrp: 'text-xs leading-5', off: 'text-xs leading-5' },
  md: { price: 'text-lg leading-7', mrp: 'text-sm leading-6', off: 'text-sm leading-6' },
  lg: { price: 'text-3xl leading-[1.25]', mrp: 'text-base leading-7', off: 'text-base leading-7' },
};

/** Selling price, struck-through MRP and % off. Visible to guests and logged-in users alike. */
export const Price = memo(function Price({ price, mrp, size = 'md', className }: PriceProps) {
  const off = mrp ? discountPercent(price, mrp) : 0;
  const s = sizes[size];

  return (
    <div
      className={cn(
        'flex flex-wrap items-baseline gap-x-2 gap-y-0.5 overflow-visible py-0.5',
        className,
      )}
    >
      <span className={cn('font-display font-bold text-ink-900 tabular-nums', s.price)}>
        {formatPrice(price)}
      </span>
      {off > 0 && (
        <>
          <span className={cn('text-ink-400 tabular-nums line-through', s.mrp)}>
            <span className="sr-only">Original price </span>
            {formatPrice(mrp!)}
          </span>
          <span className={cn('font-semibold text-leaf-600', s.off)}>{off}% off</span>
        </>
      )}
    </div>
  );
});
