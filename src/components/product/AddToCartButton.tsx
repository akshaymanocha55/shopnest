'use client';

import { Check, ShoppingBag } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import { TIMING } from '@/constants';
import { getDefaultVariants, useAddToCart } from '@/hooks/useAddToCart';
import { useThrottledCallback } from '@/hooks/useThrottledCallback';
import { cn } from '@/lib/utils';
import type { SelectedVariants } from '@/types/cart';
import type { Product } from '@/types/product';
import { Button, type ButtonProps } from '../ui/Button';

interface AddToCartButtonProps extends Pick<ButtonProps, 'size' | 'fullWidth' | 'className'> {
  product: Product;
  variants?: SelectedVariants;
  quantity?: number;
  disabled?: boolean;
  /** Called before adding; return false to block (e.g. a variant is not selected). */
  validate?: () => boolean;
}

/**
 * Shown to everyone. Guests get the login popup; logged-in users add to cart.
 * Throttled so double-taps do not add the item twice, and confirms with a check animation.
 */
export const AddToCartButton = memo(function AddToCartButton({
  product,
  variants,
  quantity = 1,
  disabled,
  validate,
  size = 'md',
  fullWidth,
  className,
}: AddToCartButtonProps) {
  const addToCart = useAddToCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1400);
    return () => clearTimeout(timer);
  }, [added]);

  const handleAdd = useCallback(() => {
    if (validate && !validate()) return;
    if (addToCart(product, variants ?? getDefaultVariants(product), quantity)) setAdded(true);
  }, [addToCart, product, variants, quantity, validate]);

  const throttledAdd = useThrottledCallback(handleAdd, TIMING.actionThrottleMs);

  return (
    <Button
      variant={added ? 'secondary' : 'primary'}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={throttledAdd}
      className={cn(added && 'text-leaf-600 ring-leaf-500', className)}
      aria-live="polite"
    >
      <span
        key={added ? 'added' : 'idle'}
        className="inline-flex animate-pop-in items-center gap-2"
      >
        {added ? <Check className="size-4" strokeWidth={3} /> : <ShoppingBag className="size-4" />}
        {added ? 'Added' : 'Add to cart'}
      </span>
    </Button>
  );
});
