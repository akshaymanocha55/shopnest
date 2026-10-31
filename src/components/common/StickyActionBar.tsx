'use client';

import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { useHydrated } from '@/hooks/useHydrated';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface StickyActionBarProps {
  children: ReactNode;
  /** Shown on the left of the bar on mobile. */
  total?: number;
  caption?: string;
  /**
   * 'inline': on desktop the children render in place (normal flow).
   * 'hidden': mobile-only (desktop has the action elsewhere, e.g. the summary card).
   */
  desktop?: 'inline' | 'hidden';
  /** Width at which the desktop behaviour starts. */
  breakpoint?: 'md' | 'lg';
  /** Layout of the children inside the bar. */
  className?: string;
}

const QUERIES = { md: '(min-width: 768px)', lg: '(min-width: 1024px)' } as const;

/**
 * Primary action fixed to the bottom of the screen on mobile (thumb reach), optionally with
 * the order total. It is rendered into <body> with a portal, so no ancestor's stacking context
 * (animations, transforms, z-index) can paint content on top of it.
 * Pages using it add bottom padding on mobile so their content is not covered.
 */
export function StickyActionBar({
  children,
  total,
  caption = 'Total',
  desktop = 'inline',
  breakpoint = 'lg',
  className,
}: StickyActionBarProps) {
  const hydrated = useHydrated();
  // Server and hydration render the desktop version; mobile switches right after.
  const isDesktop = useMediaQuery(QUERIES[breakpoint], true);

  if (isDesktop || !hydrated) {
    return desktop === 'inline' ? <div className={className}>{children}</div> : null;
  }

  return createPortal(
    <div
      role="region"
      aria-label="Actions"
      className="fixed inset-x-0 bottom-0 z-40 flex animate-[rise_0.3s_var(--ease-out-expo)_both] items-center gap-3 border-t border-mist bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(27_31_59/0.25)]"
    >
      {total != null && (
        <div className="shrink-0">
          <p className="text-xs text-ink-400">{caption}</p>
          <p className="font-display text-lg leading-6 font-bold text-ink-900 tabular-nums">
            {formatPrice(total)}
          </p>
        </div>
      )}
      <div
        className={cn(
          'flex min-w-0 flex-1 items-center gap-3 [&>a]:flex-1 [&>button]:flex-1',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
