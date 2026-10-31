'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { LIMITS, ROUTES, TOAST } from '@/constants';
import { buildLineId, getUnitPrice, getVariantLabel } from '@/lib/pricing';
import { useAppDispatch, useAppStore } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/auth.slice';
import { addItem, selectQuantityInCart } from '@/store/slices/cart.slice';
import { openLoginPrompt } from '@/store/slices/ui.slice';
import type { CartItem, SelectedVariants } from '@/types/cart';
import type { Product } from '@/types/product';

export function buildCartItem(
  product: Product,
  variants: SelectedVariants,
  quantity: number,
): CartItem {
  const { price, mrp } = getUnitPrice(product, variants);
  return {
    lineId: buildLineId(product.id, variants),
    productId: product.id,
    slug: product.slug,
    title: product.title,
    image: product.image,
    unitPrice: price,
    unitMrp: mrp,
    quantity,
    variants,
    variantLabel: getVariantLabel(product, variants),
  };
}

/**
 * Add-to-cart flow shared by product cards and the PDP.
 * Reads auth/cart state from the store at click time (useAppStore) instead of subscribing,
 * so the buttons do not re-render whenever the cart changes.
 * Guests get the login popup; the item is kept and added right after login.
 */
export function useAddToCart() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const router = useRouter();

  return useCallback(
    (product: Product, variants: SelectedVariants, quantity = 1): boolean => {
      if (!product.inStock) {
        toast.error(TOAST.productOutOfStock);
        return false;
      }
      const item = buildCartItem(product, variants, quantity);
      const state = store.getState();

      if (!selectIsAuthenticated(state)) {
        dispatch(openLoginPrompt(item));
        return false;
      }

      const inCart = selectQuantityInCart(state, item.lineId);
      if (inCart >= LIMITS.maxQuantityPerItem) {
        toast.warning(TOAST.maxQuantity(LIMITS.maxQuantityPerItem));
        return false;
      }

      dispatch(addItem(item));
      toast.success(TOAST.addedToCart(product.title.slice(0, 40)), {
        description: item.variantLabel || undefined,
        action: { label: 'View cart', onClick: () => router.push(ROUTES.cart) },
      });
      return true;
    },
    [dispatch, store, router],
  );
}

/** Default selection: first in-stock option of each variant group. */
export function getDefaultVariants(product: Product): SelectedVariants {
  return Object.fromEntries(
    product.variantGroups.map((group) => [
      group.id,
      (group.options.find((o) => o.inStock) ?? group.options[0]).id,
    ]),
  );
}
