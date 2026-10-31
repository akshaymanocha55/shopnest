'use client';

import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import { Price } from '../ui/Price';
import { Rating } from '../ui/Rating';
import { AddToCartButton } from './AddToCartButton';
import { NotifyMeButton } from './NotifyMeButton';
import { WishlistButton } from './WishlistButton';

interface ProductCardProps {
  product: Product;
  /** Load eagerly for cards in the first viewport (helps LCP). */
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Memoised: re-renders only when its product changes, not when sibling cards or filters do. */
export const ProductCard = memo(function ProductCard({
  product,
  priority,
  className,
  style,
}: ProductCardProps) {
  return (
    <article
      style={style}
      className={cn(
        'group relative flex flex-col rounded-[var(--radius-card)] bg-white p-3 ring-1 ring-mist transition-shadow duration-300 hover:shadow-lift',
        className,
      )}
    >
      <div className="relative">
        <Link
          href={ROUTES.product(product.slug)}
          className="relative block aspect-square overflow-hidden rounded-2xl bg-paper"
          aria-label={product.title}
        >
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(min-width: 1280px) 280px, (min-width: 768px) 30vw, 50vw"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            className={cn(
              'object-contain p-6 mix-blend-multiply transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105',
              !product.inStock && 'opacity-50 grayscale',
            )}
          />
          {!product.inStock ? (
            <span className="absolute inset-x-3 bottom-3 rounded-full bg-ink-900/85 py-1.5 text-center text-xs font-semibold text-white backdrop-blur">
              Out of stock
            </span>
          ) : null}
          {product.inStock && product.discountPercent >= 30 && (
            <span className="absolute top-3 left-3 rounded-full bg-marigold-400 px-2.5 py-1 text-xs font-bold text-ink-900">
              {product.discountPercent}% off
            </span>
          )}
        </Link>
        <WishlistButton product={product} className="absolute top-3 right-3 z-10" />
      </div>

      <div className="flex flex-1 flex-col gap-2 px-1 pt-3">
        <p className="text-xs font-medium text-ink-400">{product.subcategory}</p>
        <h3 className="line-clamp-2 min-h-[2.75rem] font-sans text-[15px] leading-snug font-semibold text-ink-800">
          <Link
            href={ROUTES.product(product.slug)}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {product.title}
          </Link>
        </h3>
        <Rating value={product.rating} count={product.ratingCount} />
        <Price price={product.price} mrp={product.mrp} size="sm" className="mt-auto pt-1" />
        {/* z-10 keeps the button clickable above the stretched card link */}
        {product.inStock ? (
          <AddToCartButton product={product} size="sm" fullWidth className="relative z-10 mt-1" />
        ) : (
          <NotifyMeButton size="sm" fullWidth className="relative z-10 mt-1" />
        )}
      </div>
    </article>
  );
});
