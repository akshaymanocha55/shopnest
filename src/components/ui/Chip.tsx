import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** Toggle chip for filters and variant options. */
export function Chip({ selected, className, children, type = 'button', ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap ring-1 transition-[background-color,color,box-shadow,transform] duration-150 ring-inset active:scale-95 disabled:cursor-not-allowed disabled:text-ink-300 disabled:line-through disabled:ring-mist',
        selected
          ? 'bg-ink-800 text-white ring-ink-800'
          : 'bg-white text-ink-700 ring-mist hover:ring-ink-300',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
