'use client';

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { LIMITS } from '@/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

const GRID = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4';
const PRIORITY_COUNT = 4;

/**
 * Small lists render normally (fully server-rendered, best for SEO).
 * Long lists switch to a row-virtualized grid so only visible rows are in the DOM.
 */
export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length > LIMITS.virtualizeThreshold) {
    return <VirtualProductGrid products={products} />;
  }
  return (
    <div className={GRID}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < PRIORITY_COUNT}
          // First-row cards are not faded in, so the LCP image paints immediately.
          className={index < PRIORITY_COUNT ? undefined : 'animate-rise'}
          style={
            index < PRIORITY_COUNT ? undefined : { animationDelay: `${Math.min(index, 8) * 40}ms` }
          }
        />
      ))}
    </div>
  );
}

function useColumnCount() {
  const xl = useMediaQuery('(min-width: 1280px)', true);
  const md = useMediaQuery('(min-width: 768px)', true);
  return xl ? 4 : md ? 3 : 2;
}

function VirtualProductGrid({ products }: { products: Product[] }) {
  const columns = useColumnCount();
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    // Distance from the top of the page, needed by the window virtualizer.
    setScrollMargin(listRef.current?.offsetTop ?? 0);
  }, []);

  const rows = useMemo(() => {
    const result: Product[][] = [];
    for (let i = 0; i < products.length; i += columns) result.push(products.slice(i, i + columns));
    return result;
  }, [products, columns]);

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 460,
    overscan: 3,
    scrollMargin,
    // Render the first rows during SSR so the page is not empty before hydration.
    initialRect: { width: 1280, height: 1400 },
  });

  return (
    <div ref={listRef} className="relative" style={{ height: virtualizer.getTotalSize() }}>
      {virtualizer.getVirtualItems().map((row) => (
        <div
          key={row.key}
          data-index={row.index}
          ref={virtualizer.measureElement}
          className={`${GRID} absolute inset-x-0 pb-5`}
          style={{ transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)` }}
        >
          {rows[row.index].map((product) => (
            <ProductCard key={product.id} product={product} priority={row.index === 0} />
          ))}
        </div>
      ))}
    </div>
  );
}
