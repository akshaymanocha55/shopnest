'use client';

import { ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CATEGORIES, FILTER_PARAMS, MEGA_MENU, ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import type { CategorySlug } from '@/types/product';
import { categoryHref } from './megaMenuLinks';

/** Slide-in drawer with an accordion version of the mega menu. Loaded with next/dynamic. */
export default function MobileMenu({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState<CategorySlug | null>(null);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 animate-fade-in bg-ink-900/50"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 flex w-[min(86vw,360px)] animate-[slide-in-left_0.35s_var(--ease-out-expo)_both] flex-col bg-white shadow-pop">
        <div className="flex h-16 items-center justify-between border-b border-mist px-5">
          <span className="font-display text-lg font-bold">Shop by category</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-10 place-items-center rounded-full hover:bg-ink-50"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <Link
            href={ROUTES.products}
            onClick={onClose}
            className="block rounded-xl px-3 py-3 font-semibold hover:bg-paper"
          >
            All products
          </Link>
          {CATEGORIES.map((category) => {
            const open = expanded === category.slug;
            const section = MEGA_MENU.find((s) => s.category === category.slug)!;
            return (
              <div key={category.slug}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setExpanded(open ? null : category.slug)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left font-semibold hover:bg-paper"
                >
                  {category.label}
                  <ChevronDown
                    className={cn('size-4 transition-transform', open && 'rotate-180')}
                  />
                </button>
                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300',
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <ul className="overflow-hidden pl-3">
                    <li>
                      <Link
                        href={categoryHref(category.slug)}
                        onClick={onClose}
                        className="block px-3 py-2 text-sm font-semibold text-ink-700"
                      >
                        Shop all
                      </Link>
                    </li>
                    {section.columns
                      .flatMap((c) => c.links)
                      .map((link) => (
                        <li key={link.label}>
                          <Link
                            href={categoryHref(category.slug, { sub: link.sub, sort: link.sort })}
                            onClick={onClose}
                            className="block px-3 py-2 text-sm text-ink-600 hover:text-ink-900"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            );
          })}
          <Link
            href={`${ROUTES.products}?${FILTER_PARAMS.sort}=discount`}
            onClick={onClose}
            className="mt-2 block rounded-xl bg-marigold-50 px-3 py-3 font-semibold text-marigold-600"
          >
            Today’s deals
          </Link>
        </nav>
      </div>
    </div>
  );
}
