'use client';

import { ChevronDown, Heart, LogOut, MapPinned, Package, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUserFirstName } from '@/store/slices/auth.slice';
import { openLogoutConfirm } from '@/store/slices/ui.slice';

const LINKS = [
  { href: ROUTES.account, label: 'My profile', icon: UserRound },
  { href: `${ROUTES.account}?tab=orders`, label: 'My orders', icon: Package },
  { href: `${ROUTES.account}?tab=wishlist`, label: 'Wishlist', icon: Heart },
  { href: `${ROUTES.account}?tab=addresses`, label: 'Saved addresses', icon: MapPinned },
];

/** Logged-in user's dropdown in the header. Opens on hover (desktop) or click (touch/keyboard). */
export function AccountMenu() {
  const dispatch = useAppDispatch();
  const firstName = useAppSelector(selectUserFirstName);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerType = useRef<string>('');

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const logout = () => {
    close();
    dispatch(openLogoutConfirm());
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return;
        if (timer.current) clearTimeout(timer.current);
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return;
        timer.current = setTimeout(close, 150);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onPointerDown={(e) => (pointerType.current = e.pointerType)}
        // Mouse users already opened it by hovering, so a click keeps it open; touch and
        // keyboard users toggle it.
        onClick={() => (pointerType.current === 'mouse' ? setOpen(true) : setOpen((v) => !v))}
        className="flex h-11 items-center gap-2 rounded-full pr-2 pl-1.5 text-sm font-semibold text-ink-800 transition hover:bg-ink-50"
      >
        <span className="grid size-8 place-items-center rounded-full bg-marigold-100 text-ink-800">
          <UserRound className="size-4.5" />
        </span>
        <span className="hidden max-w-24 truncate sm:inline">{firstName}</span>
        <ChevronDown
          className={cn('hidden size-4 transition-transform sm:block', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div role="menu" className="absolute top-full right-0 z-50 w-56 animate-pop-in pt-2">
          <div className="overflow-hidden rounded-2xl bg-white p-1.5 shadow-pop ring-1 ring-mist">
            <p className="px-3 py-2 text-xs text-ink-400">Signed in as {firstName}</p>
            {LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={close}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-paper hover:text-ink-900"
              >
                <Icon className="size-4 text-ink-400" /> {label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="mt-1 flex w-full items-center gap-3 rounded-xl border-t border-mist px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
