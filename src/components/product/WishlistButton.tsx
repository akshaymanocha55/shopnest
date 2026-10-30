'use client';

import { Heart } from 'lucide-react';
import { memo } from 'react';
import { useHydrated } from '@/hooks/useHydrated';
import { useToggleWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { selectIsWishlisted } from '@/store/slices/wishlist.slice';
import type { Product } from '@/types/product';

interface WishlistButtonProps {
  product: Product;
  variant?: 'floating' | 'outline';
  className?: string;
}

/** Heart toggle. Subscribes to a boolean for its own product only. */
export const WishlistButton = memo(function WishlistButton({
  product,
  variant = 'floating',
  className,
}: WishlistButtonProps) {
  const toggle = useToggleWishlist();
  const hydrated = useHydrated();
  const savedInStore = useAppSelector((state) => selectIsWishlisted(state, product.id));
  const saved = hydrated && savedInStore;

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      onClick={(event) => {
        event.preventDefault();
        toggle(product);
      }}
      className={cn(
        'grid place-items-center rounded-full transition active:scale-90',
        variant === 'floating'
          ? 'size-9 bg-white/90 shadow-lift backdrop-blur hover:bg-white'
          : 'size-13 bg-white ring-1 ring-mist ring-inset hover:ring-ink-300',
        className,
      )}
    >
      <Heart
        key={saved ? 'on' : 'off'}
        className={cn(
          'size-5 animate-pop-in',
          saved ? 'fill-rose-500 text-rose-500' : 'text-ink-600',
        )}
      />
    </button>
  );
});
