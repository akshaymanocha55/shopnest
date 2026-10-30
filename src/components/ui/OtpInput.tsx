'use client';

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { OTP_LENGTH } from '@/constants';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

/** Six boxes that auto-advance, support backspace/arrow keys and accept a pasted code. */
export function OtpInput({ value, onChange, error, disabled, autoFocus }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');

  const focus = (index: number) =>
    refs.current[Math.max(0, Math.min(index, OTP_LENGTH - 1))]?.focus();

  const setDigit = (index: number, digit: string) => {
    const next = [...digits];
    next[index] = digit;
    onChange(next.join('').slice(0, OTP_LENGTH));
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index]) {
      event.preventDefault();
      setDigit(index - 1, '');
      focus(index - 1);
    } else if (event.key === 'ArrowLeft') focus(index - 1);
    else if (event.key === 'ArrowRight') focus(index + 1);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    focus(pasted.length);
  };

  return (
    <div>
      <div className="flex justify-between gap-2" role="group" aria-label="One-time password">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            value={digit}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            aria-label={`Digit ${index + 1}`}
            aria-invalid={Boolean(error) || undefined}
            onPaste={handlePaste}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onChange={(event) => {
              const d = event.target.value.replace(/\D/g, '').slice(-1);
              setDigit(index, d);
              if (d) focus(index + 1);
            }}
            className={cn(
              'size-12 rounded-xl bg-white text-center font-display text-xl font-bold text-ink-900 ring-1 ring-mist transition outline-none ring-inset focus:ring-2 focus:ring-ink-700 sm:size-13',
              digit && 'bg-ink-50 ring-ink-200',
              error && 'ring-rose-500',
            )}
          />
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 animate-fade-in text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
