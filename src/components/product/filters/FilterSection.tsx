'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FilterSectionProps {
  title: string;
  /** Small summary shown next to the title, e.g. how many options are selected. */
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** Collapsible filter group with an animated height transition. */
export function FilterSection({ title, badge, defaultOpen = true, children }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <section className="border-b border-mist py-4 last:border-0 last:pb-0">
      <h3 className="font-sans">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-lg py-1 text-left text-sm font-semibold text-ink-900"
        >
          <span className="flex items-center gap-2">
            {title}
            {badge}
          </span>
          <ChevronDown
            className={cn(
              'size-4 text-ink-400 transition-transform duration-300',
              open && 'rotate-180',
            )}
          />
        </button>
      </h3>
      <div
        id={id}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out-expo)]',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
