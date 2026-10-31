import { Check } from 'lucide-react';
import { Fragment } from 'react';
import { CHECKOUT_STEPS } from '@/constants';
import { cn } from '@/lib/utils';

/** Full-width progress indicator. Checkout is a real sequence, so numbered steps fit here. */
export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol
      className="flex w-full items-start rounded-[var(--radius-card)] bg-white px-4 py-4 ring-1 ring-mist sm:px-6"
      aria-label="Checkout progress"
    >
      {CHECKOUT_STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <Fragment key={label}>
            <li
              className="flex shrink-0 flex-col items-center gap-1.5"
              aria-current={active ? 'step' : undefined}
            >
              <span
                className={cn(
                  'grid size-9 place-items-center rounded-full text-sm font-bold transition-colors duration-300',
                  done && 'bg-leaf-500 text-white',
                  active && 'bg-ink-800 text-white ring-4 ring-ink-100',
                  !done && !active && 'bg-paper text-ink-400 ring-1 ring-mist',
                )}
              >
                {done ? <Check className="size-4 animate-pop-in" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-xs font-semibold sm:text-sm',
                  active || done ? 'text-ink-900' : 'text-ink-400',
                )}
              >
                {label}
              </span>
            </li>
            {index < CHECKOUT_STEPS.length - 1 && (
              // Connector grows to fill the row, so the stepper spans the full width on every screen.
              <li
                aria-hidden
                className="mx-2 mt-[18px] h-0.5 flex-1 overflow-hidden rounded-full bg-mist sm:mx-4"
              >
                <span
                  className={cn(
                    'block h-full bg-leaf-500 transition-[width] duration-500',
                    done ? 'w-full' : 'w-0',
                  )}
                />
              </li>
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}
