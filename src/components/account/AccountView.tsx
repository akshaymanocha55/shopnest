'use client';

import { Heart, LogOut, MapPinned, Package, UserRound } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/auth.slice';
import { selectAddressCount } from '@/store/slices/addresses.slice';
import { selectOrderCount } from '@/store/slices/orders.slice';
import { selectWishlistCount } from '@/store/slices/wishlist.slice';
import { openLogoutConfirm } from '@/store/slices/ui.slice';
import { Button } from '../ui/Button';
import { AddressBook } from './AddressBook';
import { OrderHistory } from './OrderHistory';
import { ProfileCard } from './ProfileCard';
import { WishlistTab } from './WishlistTab';

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPinned },
] as const;

const TAB_IDS = new Set<string>(TABS.map((t) => t.id));

type TabId = (typeof TABS)[number]['id'];

export function AccountView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const user = useAppSelector(selectUser);
  const orderCount = useAppSelector(selectOrderCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const addressCount = useAppSelector(selectAddressCount);
  const requested = searchParams.get('tab') ?? '';
  const tab: TabId = TAB_IDS.has(requested) ? (requested as TabId) : 'profile';
  const counts: Partial<Record<TabId, number>> = {
    orders: orderCount,
    wishlist: wishlistCount,
    addresses: addressCount,
  };

  const selectTab = useCallback(
    (id: TabId) =>
      router.replace(id === 'profile' ? ROUTES.account : `${ROUTES.account}?tab=${id}`, {
        scroll: false,
      }),
    [router],
  );

  const logout = useCallback(() => dispatch(openLogoutConfirm()), [dispatch]);

  if (!user) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <nav
        aria-label="Account sections"
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => selectTab(id)}
            aria-current={tab === id ? 'page' : undefined}
            className={cn(
              'flex h-12 shrink-0 items-center gap-3 rounded-2xl px-4 text-left font-semibold whitespace-nowrap transition lg:shrink',
              tab === id
                ? 'bg-ink-800 text-white'
                : 'bg-white text-ink-600 ring-1 ring-mist hover:text-ink-900',
            )}
          >
            <Icon className="size-4.5" />
            {label}
            {(counts[id] ?? 0) > 0 && (
              <span
                className={cn(
                  'ml-auto rounded-full px-2 text-xs',
                  tab === id ? 'bg-white/20' : 'bg-ink-50',
                )}
              >
                {counts[id]}
              </span>
            )}
          </button>
        ))}
        <Button
          variant="ghost"
          onClick={logout}
          className="hidden h-12 justify-start rounded-2xl px-4 text-rose-600 hover:bg-rose-50 lg:flex"
        >
          <LogOut className="size-4.5" /> Log out
        </Button>
      </nav>

      <div key={tab} className="animate-fade-in">
        {tab === 'profile' && <ProfileCard user={user} />}
        {tab === 'orders' && <OrderHistory />}
        {tab === 'wishlist' && <WishlistTab />}
        {tab === 'addresses' && <AddressBook />}
        <Button
          variant="secondary"
          onClick={logout}
          fullWidth
          className="mt-6 text-rose-600 lg:hidden"
        >
          <LogOut className="size-4" /> Log out
        </Button>
      </div>
    </div>
  );
}
