'use client';

import { BadgePercent, PackageX, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { COUPONS, LIMITS, ROUTES, TOAST } from '@/constants';
import { getDefaultVariants, useAddToCart } from '@/hooks/useAddToCart';
import { formatPrice } from '@/lib/format';
import { discountPercent, getUnitPrice } from '@/lib/pricing';
import type { SelectedVariants } from '@/types/cart';
import type { Product } from '@/types/product';
import { PincodeCheck } from '../../delivery/PincodeCheck';
import { Button } from '../../ui/Button';
import { Price } from '../../ui/Price';
import { QuantityStepper } from '../../ui/QuantityStepper';
import { AddToCartButton } from '../AddToCartButton';
import { NotifyMeButton } from '../NotifyMeButton';
import { WishlistButton } from '../WishlistButton';
import { VariantSelector } from './VariantSelector';

const bestCoupon = COUPONS.find((c) => c.code === 'WELCOME10')!;

/** Price, variants, quantity, Add to cart / Buy now and delivery check for the PDP. */
export function PurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const addToCart = useAddToCart();
  const [variants, setVariants] = useState<SelectedVariants>(() => getDefaultVariants(product));
  const [quantity, setQuantity] = useState(1);

  const { price, mrp } = useMemo(() => getUnitPrice(product, variants), [product, variants]);
  const off = discountPercent(price, mrp);

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
      {/* Price */}
      <div className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-mist">
        {product.inStock ? (
          <span className="mb-2 inline-flex rounded-full bg-leaf-50 px-2.5 py-1 text-xs font-bold text-leaf-600">
            In stock
          </span>
        ) : (
          <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">
            <PackageX className="size-3.5" /> Out of stock
          </span>
        )}
        <Price price={price} mrp={mrp} size="lg" />
        <p className="mt-1 text-sm text-ink-500">
          {off > 0 && (
            <span className="mr-2 font-semibold text-leaf-600">
              You save {formatPrice(mrp - price)} ({off}% off)
            </span>
          )}
          Inclusive of all taxes
        </p>
        {product.inStock && price >= bestCoupon.minOrder && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-marigold-400 bg-marigold-50 px-3 py-2 text-sm text-ink-700">
            <BadgePercent className="size-4 shrink-0 text-marigold-500" />
            <span>
              Extra {bestCoupon.value}% off with code{' '}
              <span className="font-bold text-ink-900">{bestCoupon.code}</span> at checkout
            </span>
          </p>
        )}
      </div>

      {product.variantGroups.length > 0 && (
        <VariantSelector groups={product.variantGroups} selected={variants} onSelect={onSelect} />
      )}

      {product.inStock && (
        <div>
          <p className="mb-2.5 text-sm text-ink-500">Quantity</p>
          <QuantityStepper
            value={quantity}
            max={LIMITS.maxQuantityPerItem}
            onChange={setQuantity}
          />
        </div>
      )}

      {/* Actions. On mobile they stick to the bottom of the screen. */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-mist bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:border-0 md:bg-transparent md:p-0">
        {product.inStock ? (
          <>
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
          </>
        ) : (
          <NotifyMeButton size="lg" className="flex-1" />
        )}
        <WishlistButton product={product} variant="outline" className="shrink-0" />
      </div>

      {/* Delivery */}
      <div className="divide-y divide-mist rounded-[var(--radius-card)] bg-white ring-1 ring-mist">
        <PincodeCheck orderValue={price * quantity} className="p-5" />
        <ul className="space-y-3 p-5 text-sm">
          <li className="flex items-center gap-3 text-ink-600">
            <RotateCcw className="size-4.5 shrink-0 text-ink-400" aria-hidden /> 30-day returns and
            exchanges
          </li>
          <li className="flex items-center gap-3 text-ink-600">
            <ShieldCheck className="size-4.5 shrink-0 text-ink-400" aria-hidden /> Pay by UPI, card
            or cash on delivery
          </li>
        </ul>
      </div>
    </div>
  );
}
