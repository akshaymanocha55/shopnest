'use client';

import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import { PAYMENT_METHODS } from '@/constants';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types/order';

const ICONS: Record<PaymentMethod, typeof Smartphone> = {
  upi: Smartphone,
  card: CreditCard,
  cod: Banknote,
};

interface PaymentOptionsProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
}

export function PaymentOptions({ value, onChange }: PaymentOptionsProps) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid gap-3">
      {PAYMENT_METHODS.map((method) => {
        const Icon = ICONS[method.id];
        const selected = value === method.id;
        return (
          <label
            key={method.id}
            className={cn(
              'flex cursor-pointer items-center gap-4 rounded-2xl bg-white p-4 ring-1 transition ring-inset has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-marigold-400',
              selected ? 'ring-2 ring-ink-800' : 'ring-mist hover:ring-ink-200',
            )}
          >
            <input
              type="radio"
              name="payment"
              value={method.id}
              checked={selected}
              onChange={() => onChange(method.id)}
              className="sr-only"
            />
            <span
              className={cn(
                'grid size-11 place-items-center rounded-xl',
                selected ? 'bg-ink-800 text-white' : 'bg-paper text-ink-600',
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-ink-900">{method.label}</span>
              <span className="text-sm text-ink-500">{method.description}</span>
            </span>
            <span
              className={cn(
                'grid size-5 place-items-center rounded-full border-2',
                selected ? 'border-ink-800' : 'border-ink-200',
              )}
            >
              {selected && <span className="size-2.5 animate-pop-in rounded-full bg-ink-800" />}
            </span>
          </label>
        );
      })}
      <p className="text-sm text-ink-400">This is a demo store. No real payment is taken.</p>
    </div>
  );
}
