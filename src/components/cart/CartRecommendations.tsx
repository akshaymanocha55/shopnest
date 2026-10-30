'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { productQueries } from '@/services/queries/product.queries';
import { useAppSelector } from '@/store/hooks';
import { selectCartItems } from '@/store/slices/cart.slice';
import { ProductCardSkeleton } from '../product/ProductCardSkeleton';
import { ProductCarousel } from '../product/ProductCarousel';

/**
 * "You may also like" under the cart: products from the same categories as the cart items
 * (top rated first), excluding what is already in the cart. Uses the shared product cache.
 */
export function CartRecommendations() {
  const { data: products, isPending } = useQuery(productQueries.list());
  const cartItems = useAppSelector(selectCartItems);

  const picks = useMemo(() => {
    if (!products) return [];
    const inCart = new Set(cartItems.map((i) => i.productId));
    const categories = new Set(products.filter((p) => inCart.has(p.id)).map((p) => p.category));
    return products
      .filter((p) => !inCart.has(p.id))
      .sort(
        (a, b) =>
          Number(categories.has(b.category)) - Number(categories.has(a.category)) ||
          b.rating - a.rating,
      )
      .slice(0, 10);
  }, [products, cartItems]);

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4" aria-busy>
        {[0, 1, 2, 3].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return <ProductCarousel id="cart-recommendations" title="You may also like" products={picks} />;
}
