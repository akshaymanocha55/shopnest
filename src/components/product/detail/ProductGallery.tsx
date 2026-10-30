'use client';

import Image from 'next/image';
import { useCallback, useRef, useState, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';

interface GalleryView {
  label: string;
  /** CSS transform used to frame the image for this view. */
  scale: number;
  origin: string;
}

// FakeStore provides one photo per product, so extra views are close-up framings of it.
const VIEWS: GalleryView[] = [
  { label: 'Full view', scale: 1, origin: '50% 50%' },
  { label: 'Close-up, top', scale: 1.8, origin: '50% 20%' },
  { label: 'Close-up, detail', scale: 2.2, origin: '50% 75%' },
];

/** Image gallery with thumbnails and hover-to-zoom on desktop. */
export function ProductGallery({ image, title }: { image: string; title: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const view = VIEWS[active];

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    setZoom({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      <div className="flex gap-3 md:flex-col" role="tablist" aria-label="Product images">
        {VIEWS.map((v, index) => (
          <button
            key={v.label}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-label={v.label}
            onClick={() => setActive(index)}
            className={cn(
              'relative size-18 overflow-hidden rounded-xl bg-white ring-2 transition md:size-20',
              active === index ? 'ring-ink-800' : 'ring-transparent hover:ring-ink-200',
            )}
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="80px"
              className="object-contain p-2"
              style={{ transform: `scale(${v.scale})`, transformOrigin: v.origin }}
            />
          </button>
        ))}
      </div>

      <div
        ref={frameRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setZoom(null)}
        className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-mist"
      >
        <Image
          key={active}
          src={image}
          alt={title}
          fill
          preload
          sizes="(min-width: 1024px) 560px, 100vw"
          className="animate-fade-in object-contain p-10 transition-transform duration-300 ease-out"
          style={
            zoom
              ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` }
              : { transform: `scale(${view.scale})`, transformOrigin: view.origin }
          }
        />
        <span className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-full bg-ink-900/70 px-3 py-1 text-xs font-medium text-white md:block">
          Hover to zoom
        </span>
      </div>
    </div>
  );
}
