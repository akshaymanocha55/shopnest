import { Check } from 'lucide-react';
import { CHECKOUT_STEPS } from '@/constants';
import { cn } from '@/lib/utils';

/** Progress indicator. Checkout is a real sequence, so numbered steps fit here. */
export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3" aria-label="Checkout progress">
      {CHECKOUT_STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={label}
            className="flex items-center gap-2 sm:gap-3"
            aria-current={active ? 'step' : undefined}
          >
            <span
              className={cn(
                'grid size-8 place-items-center rounded-full text-sm font-bold transition-colors duration-300',
                done && 'bg-leaf-500 text-white',
                active && 'bg-ink-800 text-white',
                !done && !active && 'bg-white text-ink-400 ring-1 ring-mist',
              )}
            >
              {done ? <Check className="size-4 animate-pop-in" strokeWidth={3} /> : index + 1}
            </span>
            <span
              className={cn(
                'text-sm font-semibold',
                active ? 'text-ink-900' : 'text-ink-400',
                'hidden sm:inline',
              )}
            >
              {label}
            </span>
            {index < CHECKOUT_STEPS.length - 1 && (
              <span
                className={cn('h-0.5 w-6 rounded-full sm:w-12', done ? 'bg-leaf-500' : 'bg-mist')}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
