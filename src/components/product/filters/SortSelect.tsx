'use client';

import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  BadgePercent,
  Check,
  ChevronDown,
  Clock3,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { memo, useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { SORT_OPTIONS } from '@/constants';
import { cn } from '@/lib/utils';
import type { SortOption } from '@/types/product';

const ICONS: Record<SortOption, LucideIcon> = {
  featured: Sparkles,
  'price-asc': ArrowUpNarrowWide,
  'price-desc': ArrowDownWideNarrow,
  rating: Star,
  discount: BadgePercent,
  newest: Clock3,
};

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

/**
 * Custom sort dropdown (listbox pattern): icons, a check on the current option,
 * full keyboard support (arrows, Home/End, Enter, Escape) and click-outside to close.
 */
export const SortSelect = memo(function SortSelect({ value, onChange }: SortSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
  const CurrentIcon = ICONS[current.value];

  const close = useCallback((refocus = false) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }, []);

  const openMenu = () => {
    setActiveIndex(SORT_OPTIONS.findIndex((o) => o.value === value));
    setOpen(true);
  };

  // Move focus into the listbox when it opens (screen readers follow aria-activedescendant).
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [open, close]);

  const select = (option: SortOption) => {
    onChange(option);
    close(true);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    const last = SORT_OPTIONS.length - 1;
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActiveIndex((i) => (i >= last ? 0 : i + 1)),
      ArrowUp: () => setActiveIndex((i) => (i <= 0 ? last : i - 1)),
      Home: () => setActiveIndex(0),
      End: () => setActiveIndex(last),
      Enter: () => select(SORT_OPTIONS[activeIndex].value),
      ' ': () => select(SORT_OPTIONS[activeIndex].value),
      Escape: () => close(true),
      Tab: () => close(),
    };
    if (keys[event.key]) {
      if (event.key !== 'Tab') event.preventDefault();
      keys[event.key]();
    }
  };

  return (
    <div ref={rootRef} className="relative min-w-0" onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? close() : openMenu())}
        aria-label={`Sort by: ${current.label}`}
        className={cn(
          'flex h-10 w-full items-center gap-1.5 rounded-full bg-white pr-2.5 pl-3.5 text-sm whitespace-nowrap ring-1 transition ring-inset sm:gap-2 sm:pr-3 sm:pl-4',
          open ? 'ring-2 ring-ink-800' : 'ring-mist hover:ring-ink-300',
        )}
      >
        <CurrentIcon className="size-4 shrink-0 text-ink-500" aria-hidden />
        <span className="hidden text-ink-400 sm:inline">Sort:</span>
        {/* Short label on phones keeps the button on one line. */}
        <span className="min-w-0 flex-1 truncate text-left font-semibold text-ink-900 sm:hidden">
          {current.shortLabel}
        </span>
        <span className="hidden font-semibold text-ink-900 sm:inline">{current.label}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-500 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={`${listId}-${activeIndex}`}
          aria-label="Sort products"
          className="absolute top-[calc(100%+8px)] right-0 z-40 w-64 animate-pop-in rounded-2xl bg-white p-1.5 shadow-pop ring-1 ring-mist outline-none"
        >
          {SORT_OPTIONS.map((option, index) => {
            const Icon = ICONS[option.value];
            const selected = option.value === value;
            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={selected}
                onClick={() => select(option.value)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  index === activeIndex && 'bg-paper',
                  selected ? 'font-semibold text-ink-900' : 'text-ink-600',
                )}
              >
                <span
                  className={cn(
                    'grid size-8 place-items-center rounded-lg',
                    selected ? 'bg-ink-800 text-white' : 'bg-paper text-ink-500',
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="flex-1">{option.label}</span>
                {selected && <Check className="size-4 text-leaf-600" strokeWidth={3} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
