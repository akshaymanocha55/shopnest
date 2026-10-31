'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { ROUTES, TOAST } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCartCount } from '@/store/slices/cart.slice';
import { closeLogoutConfirm, selectLogoutConfirmOpen } from '@/store/slices/ui.slice';
import { endUserSession } from '@/store/thunks';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

/** "Log out?" confirmation. Bottom sheet on mobile, centred dialog on desktop. */
export default function LogoutConfirmModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const open = useAppSelector(selectLogoutConfirmOpen);
  const cartCount = useAppSelector(selectCartCount);
  const [loading, setLoading] = useState(false);

  const close = useCallback(() => dispatch(closeLogoutConfirm()), [dispatch]);

  const confirm = async () => {
    setLoading(true);
    await dispatch(endUserSession());
    dispatch(closeLogoutConfirm());
    setLoading(false);
    toast.success(TOAST.logout);
    router.replace(ROUTES.home);
  };

  return (
    <Modal open={open} onClose={close} title="Log out">
      <div className="flex flex-col items-center text-center">
        <span className="mb-5 grid size-16 place-items-center rounded-2xl bg-rose-50 text-rose-500">
          <LogOut className="size-7" />
        </span>
        <h2 className="text-2xl font-bold text-ink-900">Log out of ShopNest?</h2>
        <p className="mt-2 text-ink-500">
          {cartCount > 0
            ? `Your cart (${cartCount} ${cartCount === 1 ? 'item' : 'items'}), wishlist and orders are saved. They’ll be here when you log back in.`
            : 'Your wishlist and orders are saved. They’ll be here when you log back in.'}
        </p>
        <div className="mt-7 flex w-full flex-col-reverse gap-3 sm:flex-row">
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto sm:flex-1"
            onClick={close}
          >
            Stay logged in
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="w-full sm:w-auto sm:flex-1"
            loading={loading}
            onClick={confirm}
          >
            Log out
          </Button>
        </div>
      </div>
    </Modal>
  );
}
