'use client';

import { useQuery } from '@tanstack/react-query';
import { Search, SearchX, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { FILTER_PARAMS, LIMITS, ROUTES, TIMING } from '@/constants';
import { useDebounce } from '@/hooks/useDebounce';
import { formatPrice } from '@/lib/format';
import { matchesQuery } from '@/lib/product-filters';
import { cn } from '@/lib/utils';
import { productQueries } from '@/services/queries/product.queries';

const POPULAR = ['Jacket', 'SSD', 'Gold ring', 'T-shirt', 'Monitor'];

/**
 * Header search with live suggestions.
 * - Input is debounced (300 ms) before filtering.
 * - Products come from the shared TanStack Query cache (fetched only when search is focused).
 * - Full keyboard support: arrows, Enter, Escape.
 */
export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounced = useDebounce(value.trim(), TIMING.searchDebounceMs);

  const { data: products = [], isFetching } = useQuery({ ...productQueries.list(), enabled: open });

  const suggestions = useMemo(
    () =>
      debounced
        ? products.filter((p) => matchesQuery(p, debounced)).slice(0, LIMITS.searchSuggestions)
        : [],
    [products, debounced],
  );

  const goToResults = useCallback(
    (query: string) => {
      setOpen(false);
      inputRef.current?.blur();
      const params = new URLSearchParams(query ? { [FILTER_PARAMS.q]: query } : {});
      router.push(`${ROUTES.products}${query ? `?${params}` : ''}`);
    },
    [router],
  );

  const goToProduct = useCallback(
    (slug: string) => {
      setOpen(false);
      setValue('');
      router.push(ROUTES.product(slug));
    },
    [router],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) goToProduct(suggestions[activeIndex].slug);
    else goToResults(value.trim());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showPanel = open && (debounced.length > 0 || value.length === 0);
  const waiting = value.trim() !== debounced || (isFetching && products.length === 0);

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={cn('relative', className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search products
      </label>
      <div className="flex h-11 items-center gap-2 rounded-full bg-paper px-4 ring-1 ring-mist transition-shadow ring-inset focus-within:bg-white focus-within:ring-2 focus-within:ring-ink-700">
        <Search className="size-4.5 shrink-0 text-ink-400" aria-hidden />
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          value={value}
          placeholder="Search jackets, rings, SSDs…"
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setValue(event.target.value);
            setActiveIndex(-1);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-ink-300 [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setValue('');
              inputRef.current?.focus();
            }}
            className="grid size-6 place-items-center rounded-full text-ink-400 hover:bg-ink-100"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 animate-pop-in overflow-hidden rounded-2xl bg-white shadow-pop ring-1 ring-mist">
          {!debounced ? (
            <div className="p-4">
              <p className="mb-3 text-sm font-medium text-ink-500">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => goToResults(term)}
                    className="rounded-full bg-paper px-3 py-1.5 text-sm text-ink-700 transition hover:bg-ink-100"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : waiting && suggestions.length === 0 ? (
            <ul className="divide-y divide-mist" aria-busy>
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-3 p-3">
                  <span className="skeleton-shimmer size-12 animate-shimmer rounded-lg" />
                  <span className="skeleton-shimmer h-4 flex-1 animate-shimmer rounded" />
                </li>
              ))}
            </ul>
          ) : suggestions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <SearchX className="size-8 text-ink-300" />
              <p className="font-semibold text-ink-800">No matches for “{debounced}”</p>
              <p className="text-sm text-ink-400">
                Check the spelling or try a broader word like “jacket”.
              </p>
            </div>
          ) : (
            <>
              <ul id={listId} role="listbox" className="max-h-96 overflow-y-auto py-1">
                {suggestions.map((product, index) => (
                  <li
                    key={product.id}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => goToProduct(product.slug)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors',
                      index === activeIndex && 'bg-paper',
                    )}
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-paper">
                      <Image
                        src={product.image}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-contain p-1.5 mix-blend-multiply"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm font-medium text-ink-800">
                        {product.title}
                      </span>
                      <span className="text-xs text-ink-400">{product.subcategory}</span>
                    </span>
                    <span className="text-sm font-semibold text-ink-900 tabular-nums">
                      {formatPrice(product.price)}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="submit"
                className="w-full border-t border-mist px-4 py-3 text-left text-sm font-semibold text-ink-700 transition hover:bg-paper"
              >
                See all results for “{debounced}”
              </button>
            </>
          )}
        </div>
      )}
    </form>
  );
}
