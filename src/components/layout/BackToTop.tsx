'use client';

import { ArrowUp } from 'lucide-react';
import { useScrollState } from '@/hooks/useScrollState';
import { cn } from '@/lib/utils';

export function BackToTop() {
  const { showBackToTop } = useScrollState();
  return (
    <button
      type="button"
      aria-label="Back to top"
      tabIndex={showBackToTop ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={cn(
        'fixed right-5 bottom-5 z-40 grid size-12 place-items-center rounded-full bg-ink-800 text-white shadow-pop transition-all duration-300 hover:bg-ink-700 active:scale-90',
        showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
