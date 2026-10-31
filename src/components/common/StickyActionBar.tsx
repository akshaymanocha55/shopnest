import type { ReactNode } from 'react';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface StickyActionBarProps {
  children: ReactNode;
  /** Shown on the left of the bar on mobile. */
  total?: number;
  caption?: string;
  /**
   * 'inline': on desktop the button renders in place (normal flow).
   * 'hidden': the bar is mobile-only (desktop has the button elsewhere, e.g. the summary card).
   */
  desktop?: 'inline' | 'hidden';
}

/**
 * Primary action fixed to the bottom of the screen on mobile (thumb reach), with the order
 * total next to it. Pages using it add bottom padding on mobile so content is not covered.
 */
export function StickyActionBar({
  children,
  total,
  caption = 'Total',
  desktop = 'inline',
}: StickyActionBarProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-mist bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgb(27_31_59/0.3)] backdrop-blur',
        desktop === 'inline'
          ? 'lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none'
          : 'lg:hidden',
      )}
    >
      {total != null && (
        <div className={cn('shrink-0', desktop === 'inline' && 'lg:hidden')}>
          <p className="text-xs text-ink-400">{caption}</p>
          <p className="font-display text-lg leading-6 font-bold text-ink-900 tabular-nums">
            {formatPrice(total)}
          </p>
        </div>
      )}
      <div className="flex min-w-0 flex-1 [&>*]:w-full lg:[&>*]:w-auto">{children}</div>
    </div>
  );
}
