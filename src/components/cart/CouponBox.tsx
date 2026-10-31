'use client';

import { BadgePercent, Check, ChevronDown, Lock, Tag, Truck, X } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { COUPONS, PRICING, TOAST, type Coupon } from '@/constants';
import { formatPrice } from '@/lib/format';
import { calculateSummary, validateCoupon } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  applyCoupon,
  removeCoupon,
  selectCartItems,
  selectCartSummary,
  selectCouponCode,
} from '@/store/slices/cart.slice';

interface CouponOption {
  coupon: Coupon;
  eligible: boolean;
  saving: number;
  reason?: string;
}

/** What each coupon would save on the current cart (or why it can't be used yet). */
function useCouponOptions(): CouponOption[] {
  const items = useAppSelector(selectCartItems);
  return useMemo(() => {
    const base = calculateSummary(items);
    return COUPONS.map((coupon) => {
      const check = validateCoupon(coupon.code, base.subtotal);
      if (!check.valid) return { coupon, eligible: false, saving: 0, reason: check.reason };
      const withCoupon = calculateSummary(items, coupon.code);
      return { coupon, eligible: true, saving: base.total - withCoupon.total };
    }).sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.saving - a.saving);
  }, [items]);
}

const ICONS = { percent: BadgePercent, flat: Tag, shipping: Truck } as const;

function CouponTicket({
  option,
  best,
  onApply,
}: {
  option: CouponOption;
  best: boolean;
  onApply: () => void;
}) {
  const { coupon, eligible, saving, reason } = option;
  const Icon = ICONS[coupon.type];
  return (
    <li
      className={cn(
        'relative flex overflow-hidden rounded-2xl ring-1 transition',
        eligible ? 'bg-white ring-mist hover:ring-ink-300' : 'bg-paper ring-mist',
      )}
    >
      {/* Ticket stub */}
      <div
        className={cn(
          'grid w-14 shrink-0 place-items-center border-r-2 border-dashed border-white',
          eligible ? 'bg-marigold-400 text-ink-900' : 'bg-ink-100 text-ink-400',
        )}
      >
        <Icon className="size-5" />
      </div>
      {/* Notches where the stub meets the body */}
      <span
        aria-hidden
        className="absolute top-0 left-[3.1rem] size-3 -translate-y-1/2 rounded-full bg-paper ring-1 ring-mist"
      />
      <span
        aria-hidden
        className="absolute bottom-0 left-[3.1rem] size-3 translate-y-1/2 rounded-full bg-paper ring-1 ring-mist"
      />

      <div className="flex min-w-0 flex-1 items-center gap-3 p-3 pl-4">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span
              className={cn('font-bold tracking-wide', eligible ? 'text-ink-900' : 'text-ink-400')}
            >
              {coupon.code}
            </span>
            {best && (
              <span className="rounded-full bg-leaf-50 px-2 py-0.5 text-[11px] font-bold text-leaf-600">
                Best offer
              </span>
            )}
          </p>
          <p className="truncate text-xs text-ink-500">{coupon.description}</p>
          {eligible ? (
            <p className="mt-0.5 text-xs font-semibold text-leaf-600">
              {saving > 0 ? `You save ${formatPrice(saving)}` : 'Delivery is already free'}
            </p>
          ) : (
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-ink-400">
              <Lock className="size-3" /> {reason}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={!eligible}
          onClick={onApply}
          className="shrink-0 rounded-full px-3 py-1.5 text-sm font-bold text-ink-800 ring-1 ring-ink-800 transition ring-inset hover:bg-ink-800 hover:text-white active:scale-95 disabled:text-ink-300 disabled:ring-mist disabled:hover:bg-transparent"
        >
          Apply
        </button>
      </div>
    </li>
  );
}

/** Coupons for the cart and checkout pages: type a code or tap one from the list. */
export function CouponBox() {
  const dispatch = useAppDispatch();
  const summary = useAppSelector(selectCartSummary);
  const appliedCode = useAppSelector(selectCouponCode);
  const options = useCouponOptions();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [showAll, setShowAll] = useState(false);

  const best = options.find((o) => o.eligible && o.saving > 0);

  const apply = (value: string) => {
    const check = validateCoupon(value, summary.subtotal);
    if (!check.valid) {
      setError(check.reason);
      return;
    }
    dispatch(applyCoupon(check.coupon.code));
    setCode('');
    setError(undefined);
    setShowAll(false);
    toast.success(TOAST.couponApplied(check.coupon.code));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (code.trim()) apply(code);
  };

  const appliedCheck = appliedCode ? validateCoupon(appliedCode, summary.subtotal) : null;
  const inactiveReason = appliedCheck && !appliedCheck.valid ? appliedCheck.reason : null;
  const visibleOptions = showAll ? options : options.slice(0, 2);

  return (
    <div className="rounded-[var(--radius-card)] bg-white p-4 ring-1 ring-mist sm:p-5">
      <p className="flex items-center gap-2 font-semibold text-ink-900">
        <span className="grid size-9 place-items-center rounded-xl bg-marigold-50 text-marigold-500">
          <BadgePercent className="size-4.5" />
        </span>
        Coupons and offers
      </p>

      {appliedCode ? (
        <div
          className={cn(
            'mt-4 flex animate-pop-in items-center gap-3 rounded-2xl p-3.5',
            inactiveReason
              ? 'bg-marigold-50 ring-1 ring-marigold-300'
              : 'bg-leaf-50 ring-1 ring-leaf-500/40',
          )}
        >
          <span
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-full text-white',
              inactiveReason ? 'bg-marigold-400' : 'bg-leaf-500',
            )}
          >
            {inactiveReason ? (
              <Lock className="size-4" />
            ) : (
              <Check className="size-4.5" strokeWidth={3} />
            )}
          </span>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-bold text-ink-900">
              {appliedCode} {inactiveReason ? 'is on hold' : 'applied'}
            </p>
            <p className={inactiveReason ? 'text-marigold-600' : 'text-leaf-600'}>
              {inactiveReason ??
                (summary.couponDiscount > 0
                  ? `You save ${formatPrice(summary.couponDiscount)}`
                  : `Free delivery (saves ${formatPrice(PRICING.deliveryFee)} on small orders)`)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              dispatch(removeCoupon());
              toast(TOAST.couponRemoved);
            }}
            className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-semibold text-ink-600 transition hover:bg-white hover:text-ink-900"
          >
            <X className="size-3.5" /> Remove
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={onSubmit} className="mt-4">
            <label htmlFor="coupon" className="sr-only">
              Coupon code
            </label>
            <div
              className={cn(
                'flex h-12 items-center rounded-full bg-paper pl-4 ring-1 ring-mist transition ring-inset focus-within:bg-white focus-within:ring-2 focus-within:ring-ink-700',
                error && 'ring-rose-500',
              )}
            >
              <Tag className="size-4 shrink-0 text-ink-400" />
              <input
                id="coupon"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().replace(/\s/g, ''));
                  setError(undefined);
                }}
                placeholder="Enter coupon code"
                autoComplete="off"
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={error ? 'coupon-error' : undefined}
                className="h-full min-w-0 flex-1 bg-transparent px-2.5 text-sm font-bold tracking-wider uppercase outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-300 placeholder:normal-case"
              />
              <button
                type="submit"
                disabled={!code.trim()}
                className="mr-1.5 h-9 rounded-full bg-ink-800 px-5 text-sm font-bold text-white transition hover:bg-ink-700 active:scale-95 disabled:bg-ink-200"
              >
                Apply
              </button>
            </div>
            {error && (
              <p id="coupon-error" role="alert" className="mt-2 px-1 text-sm text-rose-600">
                {error}
              </p>
            )}
          </form>

          <ul className="mt-4 space-y-3" aria-label="Available coupons">
            {visibleOptions.map((option) => (
              <CouponTicket
                key={option.coupon.code}
                option={option}
                best={option === best}
                onApply={() => apply(option.coupon.code)}
              />
            ))}
          </ul>
          {options.length > 2 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-full py-2 text-sm font-semibold text-ink-600 transition hover:bg-paper hover:text-ink-900"
            >
              {showAll ? 'Show fewer' : `View all ${options.length} coupons`}
              <ChevronDown className={cn('size-4 transition-transform', showAll && 'rotate-180')} />
            </button>
          )}
        </>
      )}
    </div>
  );
}
