'use client';

import { LogOut, Package, UserRound } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { ROUTES, TOAST } from '@/constants';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/auth.slice';
import { selectOrderCount } from '@/store/slices/orders.slice';
import { endUserSession } from '@/store/thunks';
import { Button } from '../ui/Button';
import { OrderHistory } from './OrderHistory';
import { ProfileCard } from './ProfileCard';

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'orders', label: 'Orders', icon: Package },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function AccountView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const user = useAppSelector(selectUser);
  const orderCount = useAppSelector(selectOrderCount);
  const tab: TabId = searchParams.get('tab') === 'orders' ? 'orders' : 'profile';

  const selectTab = useCallback(
    (id: TabId) =>
      router.replace(id === 'profile' ? ROUTES.account : `${ROUTES.account}?tab=${id}`, {
        scroll: false,
      }),
    [router],
  );

  const logout = useCallback(async () => {
    await dispatch(endUserSession());
    toast.success(TOAST.logout);
    router.replace(ROUTES.home);
  }, [dispatch, router]);

  if (!user) return null;

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <nav aria-label="Account sections" className="flex gap-2 lg:flex-col">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => selectTab(id)}
            aria-current={tab === id ? 'page' : undefined}
            className={cn(
              'flex h-12 flex-1 items-center gap-3 rounded-2xl px-4 text-left font-semibold transition lg:flex-none',
              tab === id
                ? 'bg-ink-800 text-white'
                : 'bg-white text-ink-600 ring-1 ring-mist hover:text-ink-900',
            )}
          >
            <Icon className="size-4.5" />
            {label}
            {id === 'orders' && orderCount > 0 && (
              <span
                className={cn(
                  'ml-auto rounded-full px-2 text-xs',
                  tab === id ? 'bg-white/20' : 'bg-ink-50',
                )}
              >
                {orderCount}
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
        {tab === 'profile' ? <ProfileCard user={user} /> : <OrderHistory />}
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
