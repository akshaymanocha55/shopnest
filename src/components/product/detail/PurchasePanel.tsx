'use client';

import { RotateCcw, ShieldCheck, Truck, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { LIMITS, PRICING, ROUTES, TOAST } from '@/constants';
import { getDefaultVariants, useAddToCart } from '@/hooks/useAddToCart';
import { formatDay, formatPrice } from '@/lib/format';
import { getUnitPrice } from '@/lib/pricing';
import type { SelectedVariants } from '@/types/cart';
import type { Product } from '@/types/product';
import { Button } from '../../ui/Button';
import { Price } from '../../ui/Price';
import { QuantityStepper } from '../../ui/QuantityStepper';
import { AddToCartButton } from '../AddToCartButton';
import { VariantSelector } from './VariantSelector';

const subscribeNoop = () => () => {};

/** Delivery date depends on "today", so it is computed on the client only (no hydration mismatch). */
function useDeliveryDate() {
  return useSyncExternalStore(
    subscribeNoop,
    () => {
      const date = new Date();
      date.setDate(date.getDate() + PRICING.deliveryDays);
      return formatDay(date.toISOString());
    },
    () => null,
  );
}

/** Variant + quantity selection, live price, Add to cart and Buy now. */
export function PurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const addToCart = useAddToCart();
  const [variants, setVariants] = useState<SelectedVariants>(() => getDefaultVariants(product));
  const [quantity, setQuantity] = useState(1);
  const deliveryDate = useDeliveryDate();

  const { price, mrp } = useMemo(() => getUnitPrice(product, variants), [product, variants]);

  const onSelect = useCallback((groupId: string, optionId: string) => {
    setVariants((prev) => ({ ...prev, [groupId]: optionId }));
  }, []);

  const validate = useCallback(() => {
    const missing = product.variantGroups.find((g) => !variants[g.id]);
    if (missing) {
      toast.warning(TOAST.selectVariant(missing.name));
      return false;
    }
    return true;
  }, [product.variantGroups, variants]);

  const buyNow = useCallback(() => {
    if (validate() && addToCart(product, variants, quantity)) router.push(ROUTES.checkout);
  }, [validate, addToCart, product, variants, quantity, router]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Price price={price} mrp={mrp} size="lg" />
        <p className="mt-1 text-sm text-ink-400">Inclusive of all taxes</p>
      </div>

      {product.variantGroups.length > 0 && (
        <VariantSelector groups={product.variantGroups} selected={variants} onSelect={onSelect} />
      )}

      <div>
        <p className="mb-2.5 text-sm text-ink-500">Quantity</p>
        <QuantityStepper value={quantity} max={LIMITS.maxQuantityPerItem} onChange={setQuantity} />
      </div>

      {/* On mobile these stick to the bottom of the screen. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-mist bg-white/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        <AddToCartButton
          product={product}
          variants={variants}
          quantity={quantity}
          validate={validate}
          size="lg"
          className="flex-1"
        />
        <Button variant="accent" size="lg" onClick={buyNow} className="flex-1">
          <Zap className="size-4" fill="currentColor" />
          Buy now
        </Button>
      </div>

      <ul className="space-y-3 rounded-[var(--radius-card)] bg-white p-5 text-sm ring-1 ring-mist">
        <li className="flex gap-3">
          <Truck className="size-5 shrink-0 text-leaf-500" aria-hidden />
          <span>
            <span className="font-semibold text-ink-900">
              {deliveryDate
                ? `Delivery by ${deliveryDate}`
                : `Delivery in ${PRICING.deliveryDays} days`}
            </span>
            <span className="block text-ink-500">
              {price * quantity >= PRICING.freeDeliveryThreshold
                ? 'Free delivery on this order'
                : `Free delivery on orders over ${formatPrice(PRICING.freeDeliveryThreshold)}`}
            </span>
          </span>
        </li>
        <li className="flex gap-3">
          <RotateCcw className="size-5 shrink-0 text-ink-500" aria-hidden />
          <span className="text-ink-600">30-day returns and exchanges</span>
        </li>
        <li className="flex gap-3">
          <ShieldCheck className="size-5 shrink-0 text-ink-500" aria-hidden />
          <span className="text-ink-600">Pay by UPI, card or cash on delivery</span>
        </li>
      </ul>
    </div>
  );
}
