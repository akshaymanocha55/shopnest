'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useThrottledCallback } from '@/hooks/useThrottledCallback';

interface CarouselProps {
  label: string;
  children: ReactNode;
  /** Tailwind width classes for each slide. */
  itemClassName?: string;
}

/**
 * Horizontal scroll-snap carousel. Native scrolling (touch, trackpad, keyboard) plus
 * previous/next buttons on larger screens. No JS animation library needed.
 */
export function Carousel({
  label,
  children,
  itemClassName = 'w-[46%] sm:w-[31%] lg:w-[23.5%]',
}: CarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useThrottledCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const next = {
      start: el.scrollLeft < 8,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
    };
    setEdges((prev) => (prev.start === next.start && prev.end === next.end ? prev : next));
  }, 100);

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [updateEdges]);

  const scrollBy = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  }, []);

  const arrow =
    'absolute top-1/3 z-10 hidden size-11 place-items-center rounded-full bg-white text-ink-800 shadow-pop ring-1 ring-mist transition hover:bg-ink-50 active:scale-90 disabled:pointer-events-none disabled:opacity-0 md:grid';

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <button
        type="button"
        aria-label="Previous"
        disabled={edges.start}
        onClick={() => scrollBy(-1)}
        className={cn(arrow, '-left-4')}
      >
        <ChevronLeft className="size-5" />
      </button>
      <ul
        ref={trackRef}
        onScroll={updateEdges}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:gap-5 lg:mx-0 lg:px-0"
      >
        {Children.map(children, (child) => (
          <li className={cn('shrink-0 snap-start', itemClassName)}>{child}</li>
        ))}
      </ul>
      <button
        type="button"
        aria-label="Next"
        disabled={edges.end}
        onClick={() => scrollBy(1)}
        className={cn(arrow, '-right-4')}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
