'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useCallback } from 'react';
import { toast } from 'sonner';
import { ROUTES, TOAST } from '@/constants';
import { buildCartItem, getDefaultVariants } from '@/hooks/useAddToCart';
import { formatPrice } from '@/lib/format';
import { discountPercent } from '@/lib/pricing';
import { productQueries } from '@/services/queries/product.queries';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem } from '@/store/slices/cart.slice';
import { removeFromWishlist, selectWishlistItems } from '@/store/slices/wishlist.slice';
import type { WishlistItem } from '@/types/wishlist';
import { Button } from '../ui/Button';

const WishlistRow = memo(function WishlistRow({
  item,
  onMove,
}: {
  item: WishlistItem;
  onMove: (item: WishlistItem) => void;
}) {
  const off = discountPercent(item.price, item.mrp);
  return (
    <li className="flex w-[260px] shrink-0 snap-start items-center gap-3 rounded-2xl bg-paper p-3 sm:w-auto">
      <Link
        href={ROUTES.product(item.slug)}
        className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white"
      >
        <Image src={item.image} alt={item.title} fill sizes="64px" className="object-contain p-2" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium text-ink-800">{item.title}</p>
        <p className="text-sm leading-6">
          <span className="font-bold text-ink-900">{formatPrice(item.price)}</span>
          {off > 0 && (
            <span className="ml-1.5 text-xs font-semibold text-leaf-600">{off}% off</span>
          )}
        </p>
      </div>
      <Button size="sm" variant="secondary" onClick={() => onMove(item)}>
        Add
      </Button>
    </li>
  );
});

/**
 * "Add from your wishlist" on the cart page. Moving an item adds it with its default variant
 * (current price from the product cache) and removes it from the wishlist.
 */
export function WishlistToCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);
  const { data: products } = useQuery(productQueries.list());

  const move = useCallback(
    (item: WishlistItem) => {
      const product = products?.find((p) => p.id === item.productId);
      if (!product) {
        toast.error(TOAST.genericError);
        return;
      }
      dispatch(addItem(buildCartItem(product, getDefaultVariants(product), 1)));
      dispatch(removeFromWishlist(item.productId));
      toast.success(TOAST.movedToCart(item.title.slice(0, 40)));
    },
    [dispatch, products],
  );

  return (
    <section
      aria-labelledby="wishlist-cart-heading"
      className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-mist sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="wishlist-cart-heading"
          className="flex items-center gap-2 text-lg font-bold text-ink-900"
        >
          <Heart className="size-5 fill-rose-500 text-rose-500" /> Add from your wishlist
        </h2>
        {items.length > 0 && (
          <Link
            href={`${ROUTES.account}?tab=wishlist`}
            className="text-sm font-semibold text-ink-600 underline underline-offset-4"
          >
            View all ({items.length})
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-ink-500">
          Tap the heart on any product to save it here, then add it to your cart in one click.
        </p>
      ) : (
        <ul className="no-scrollbar -mx-1 mt-4 flex snap-x gap-3 overflow-x-auto px-1 pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible">
          {items.slice(0, 4).map((item) => (
            <WishlistRow key={item.productId} item={item} onMove={move} />
          ))}
        </ul>
      )}
    </section>
  );
}
