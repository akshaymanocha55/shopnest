'use client';

import { ShoppingBag, UserRound } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { ROUTES } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthStatus, selectUserFirstName } from '@/store/slices/auth.slice';
import { selectCartCount } from '@/store/slices/cart.slice';
import { openLoginPrompt } from '@/store/slices/ui.slice';
import { ButtonLink } from '../ui/ButtonLink';
import { Skeleton } from '../ui/Skeleton';

/** Subscribes only to the cart count, so cart line edits elsewhere do not re-render it. */
const CartLink = memo(function CartLink() {
  const count = useAppSelector(selectCartCount);
  return (
    <Link
      href={ROUTES.cart}
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
      className="relative grid size-11 place-items-center rounded-full text-ink-800 transition hover:bg-ink-50 active:scale-90"
    >
      <ShoppingBag className="size-5.5" />
      {count > 0 && (
        <span
          key={count}
          className="absolute top-1 right-0.5 grid h-5 min-w-5 animate-bump place-items-center rounded-full bg-marigold-400 px-1 text-[11px] font-bold text-ink-900 tabular-nums"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
});

/** Guests see the cart icon too, but tapping it opens the login popup instead. */
function GuestCartButton() {
  const dispatch = useAppDispatch();
  return (
    <button
      type="button"
      aria-label="Cart"
      onClick={() => dispatch(openLoginPrompt())}
      className="grid size-11 place-items-center rounded-full text-ink-800 transition hover:bg-ink-50 active:scale-90"
    >
      <ShoppingBag className="size-5.5" />
    </button>
  );
}

export function HeaderActions() {
  const status = useAppSelector(selectAuthStatus);
  const firstName = useAppSelector(selectUserFirstName);

  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2" aria-hidden>
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="size-10 rounded-full" />
      </div>
    );
  }

  if (status === 'guest') {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <ButtonLink href={ROUTES.login} variant="ghost" className="hidden h-10 sm:inline-flex">
          Log in
        </ButtonLink>
        <ButtonLink href={ROUTES.signup} variant="primary" className="h-10 px-4">
          Sign up
        </ButtonLink>
        <GuestCartButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Link
        href={ROUTES.account}
        className="flex h-11 items-center gap-2 rounded-full pr-3 pl-1.5 text-sm font-semibold text-ink-800 transition hover:bg-ink-50"
      >
        <span className="grid size-8 place-items-center rounded-full bg-marigold-100 text-ink-800">
          <UserRound className="size-4.5" />
        </span>
        <span className="hidden max-w-24 truncate sm:inline">{firstName}</span>
      </Link>
      <CartLink />
    </div>
  );
}
