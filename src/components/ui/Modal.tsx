'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Accessible modal built on the native <dialog> element: focus trapping, Escape to close
 * and an inert background come from the browser, so no extra library is needed.
 */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop targets the dialog element itself.
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        // Mobile: bottom sheet. Desktop: centred card.
        'mx-auto mt-auto mb-0 w-full max-w-none overflow-visible rounded-t-[1.75rem] bg-white p-0 pb-[env(safe-area-inset-bottom)] text-ink-800 shadow-pop backdrop:bg-ink-900/50 backdrop:backdrop-blur-sm open:animate-[rise_0.35s_var(--ease-out-expo)_both]',
        'sm:m-auto sm:w-[calc(100%-2rem)] sm:max-w-md sm:rounded-[1.75rem] sm:pb-0 sm:open:animate-pop-in',
        className,
      )}
    >
      {open && (
        <div className="relative p-6 sm:p-7">
          <span
            className="mx-auto mb-4 block h-1.5 w-10 rounded-full bg-mist sm:hidden"
            aria-hidden
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-ink-400 transition hover:bg-ink-50 hover:text-ink-800 active:scale-90"
          >
            <X className="size-5" />
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}
