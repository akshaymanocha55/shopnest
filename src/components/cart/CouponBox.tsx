'use client';

import { BadgePercent, Check, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { COUPONS, TOAST } from '@/constants';
import { formatPrice } from '@/lib/format';
import { validateCoupon } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  applyCoupon,
  removeCoupon,
  selectCartSummary,
  selectCouponCode,
} from '@/store/slices/cart.slice';
import { Button } from '../ui/Button';

/** Apply / remove a coupon. Used on the cart and checkout pages. */
export function CouponBox() {
  const dispatch = useAppDispatch();
  const summary = useAppSelector(selectCartSummary);
  const appliedCode = useAppSelector(selectCouponCode);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();

  const apply = (value: string) => {
    const check = validateCoupon(value, summary.subtotal);
    if (!check.valid) {
      setError(check.reason);
      return;
    }
    dispatch(applyCoupon(check.coupon.code));
    setCode('');
    setError(undefined);
    toast.success(TOAST.couponApplied(check.coupon.code));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (code.trim()) apply(code);
  };

  // Applied, but the cart has since dropped below the coupon's minimum.
  const appliedCheck = appliedCode ? validateCoupon(appliedCode, summary.subtotal) : null;
  const inactiveReason = appliedCheck && !appliedCheck.valid ? appliedCheck.reason : null;
  const inactive = Boolean(inactiveReason);

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-5 ring-1 ring-mist">
      <p className="flex items-center gap-2 font-semibold text-ink-900">
        <BadgePercent className="size-5 text-marigold-500" /> Apply coupon
      </p>

      {appliedCode ? (
        <div
          className={cn(
            'mt-3 flex animate-pop-in items-center justify-between gap-3 rounded-xl border border-dashed p-3',
            inactive ? 'border-marigold-400 bg-marigold-50' : 'border-leaf-500 bg-leaf-50',
          )}
        >
          <div className="text-sm">
            <p className="flex items-center gap-1.5 font-bold text-ink-900">
              {!inactive && <Check className="size-4 text-leaf-600" strokeWidth={3} />}
              {appliedCode}
            </p>
            <p className={inactive ? 'text-marigold-600' : 'text-leaf-600'}>
              {inactiveReason
                ? inactiveReason
                : summary.couponDiscount > 0
                  ? `You save ${formatPrice(summary.couponDiscount)}`
                  : 'Free delivery applied'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Remove coupon"
            onClick={() => {
              dispatch(removeCoupon());
              toast(TOAST.couponRemoved);
            }}
            className="grid size-8 place-items-center rounded-full text-ink-500 hover:bg-white hover:text-ink-900"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} className="mt-3 flex gap-2">
            <label htmlFor="coupon" className="sr-only">
              Coupon code
            </label>
            <input
              id="coupon"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(undefined);
              }}
              placeholder="Enter coupon code"
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? 'coupon-error' : undefined}
              className={cn(
                'h-11 min-w-0 flex-1 rounded-xl bg-white px-4 text-sm font-semibold tracking-wide uppercase ring-1 ring-mist outline-none ring-inset placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-300 placeholder:normal-case focus:ring-2 focus:ring-ink-700',
                error && 'ring-rose-500',
              )}
            />
            <Button type="submit" variant="secondary" className="h-11" disabled={!code.trim()}>
              Apply
            </Button>
          </form>
          {error && (
            <p id="coupon-error" role="alert" className="mt-2 text-sm text-rose-600">
              {error}
            </p>
          )}
          <ul className="mt-3 space-y-2">
            {COUPONS.map((coupon) => (
              <li key={coupon.code} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="rounded-md border border-dashed border-ink-300 px-1.5 py-0.5 font-bold text-ink-800">
                    {coupon.code}
                  </span>
                  <span className="ml-2 text-ink-500">{coupon.description}</span>
                </span>
                <button
                  type="button"
                  onClick={() => apply(coupon.code)}
                  className="shrink-0 font-semibold text-ink-700 underline underline-offset-2 hover:text-ink-900"
                >
                  Apply
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
