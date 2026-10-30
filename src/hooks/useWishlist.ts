'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { TOAST } from '@/constants';
import { useAppDispatch, useAppStore } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/auth.slice';
import { openLoginPrompt } from '@/store/slices/ui.slice';
import {
  addToWishlist,
  removeFromWishlist,
  selectIsWishlisted,
} from '@/store/slices/wishlist.slice';
import type { Product } from '@/types/product';

/** Toggle a product in the wishlist. Guests get the login popup. */
export function useToggleWishlist() {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  return useCallback(
    (product: Product) => {
      const state = store.getState();
      if (!selectIsAuthenticated(state)) {
        dispatch(openLoginPrompt());
        return;
      }
      if (selectIsWishlisted(state, product.id)) {
        dispatch(removeFromWishlist(product.id));
        toast(TOAST.removedFromWishlist);
      } else {
        dispatch(
          addToWishlist({
            productId: product.id,
            slug: product.slug,
            title: product.title,
            image: product.image,
            price: product.price,
            mrp: product.mrp,
            addedAt: new Date().toISOString(),
          }),
        );
        toast.success(TOAST.addedToWishlist);
      }
    },
    [dispatch, store],
  );
}
