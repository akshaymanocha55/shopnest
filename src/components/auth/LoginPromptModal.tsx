'use client';

import { LockKeyhole } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { REDIRECT_PARAM, ROUTES } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  closeLoginPrompt,
  selectLoginPromptOpen,
  selectPendingCartItem,
} from '@/store/slices/ui.slice';
import { ButtonLink } from '../ui/ButtonLink';
import { Modal } from '../ui/Modal';

/**
 * Shown when a guest taps "Add to cart" (or the cart icon).
 * The item they picked is remembered and added automatically once they log in.
 */
export default function LoginPromptModal() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const open = useAppSelector(selectLoginPromptOpen);
  const pendingItem = useAppSelector(selectPendingCartItem);
  const close = useCallback(() => dispatch(closeLoginPrompt()), [dispatch]);

  const redirect = `?${REDIRECT_PARAM}=${encodeURIComponent(pathname)}`;

  return (
    <Modal open={open} onClose={close} title="Log in to continue">
      <div className="flex flex-col items-center text-center">
        <span className="mb-5 grid size-16 place-items-center rounded-2xl bg-marigold-100 text-ink-800">
          <LockKeyhole className="size-7" />
        </span>
        <h2 className="text-2xl font-bold text-ink-900">Log in to add to your cart</h2>
        <p className="mt-2 text-ink-500">
          {pendingItem
            ? `We’ll keep “${pendingItem.title.slice(0, 48)}” ready and add it as soon as you log in.`
            : 'Log in or create a free account to see your cart and check out.'}
        </p>
        <div className="mt-7 flex w-full flex-col gap-3">
          <ButtonLink
            href={`${ROUTES.login}${redirect}`}
            size="lg"
            onClick={() => dispatch(closeLoginPrompt())}
          >
            Log in
          </ButtonLink>
          <ButtonLink
            href={`${ROUTES.signup}${redirect}`}
            variant="secondary"
            size="lg"
            onClick={() => dispatch(closeLoginPrompt())}
          >
            Create an account
          </ButtonLink>
        </div>
      </div>
    </Modal>
  );
}
