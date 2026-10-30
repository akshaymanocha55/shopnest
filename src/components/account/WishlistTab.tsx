'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useMemo } from 'react';
import { ROUTES } from '@/constants';
import { productQueries } from '@/services/queries/product.queries';
import { useAppSelector } from '@/store/hooks';
import { selectWishlistIds } from '@/store/slices/wishlist.slice';
import { ProductGrid } from '../product/ProductGrid';
import { ProductGridSkeleton } from '../product/ProductCardSkeleton';
import { ButtonLink } from '../ui/ButtonLink';
import { EmptyState } from '../ui/EmptyState';

/** Saved products, shown with live prices from the shared product cache. */
export function WishlistTab() {
  const ids = useAppSelector(selectWishlistIds);
  const { data: products, isPending } = useQuery(productQueries.list());

  const saved = useMemo(() => {
    const order = new Map(ids.map((id, index) => [id, index]));
    return (products ?? [])
      .filter((p) => order.has(p.id))
      .sort((a, b) => order.get(a.id)! - order.get(b.id)!);
  }, [products, ids]);

  if (ids.length === 0) {
    return (
      <EmptyState
        icon={<Heart />}
        title="Your wishlist is empty"
        description="Tap the heart on any product to save it for later."
        action={<ButtonLink href={ROUTES.products}>Browse products</ButtonLink>}
        className="rounded-[var(--radius-card)] bg-white ring-1 ring-mist"
      />
    );
  }

  if (isPending) return <ProductGridSkeleton count={Math.min(ids.length, 4)} />;
  return <ProductGrid products={saved} />;
}
