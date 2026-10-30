import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  leading?: ReactNode;
  hideLabel?: boolean;
  ref?: Ref<HTMLInputElement>;
}

/** Labelled text input with error + hint messaging wired up for screen readers. */
export function Input({
  label,
  error,
  hint,
  leading,
  hideLabel,
  id,
  className,
  ref,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={inputId}
        className={cn('text-sm font-medium text-ink-700', hideLabel && 'sr-only')}
      >
        {label}
      </label>
      <div
        className={cn(
          'flex h-12 items-center rounded-xl bg-white ring-1 ring-mist transition-shadow ring-inset focus-within:ring-2 focus-within:ring-ink-700',
          error && 'ring-rose-500 focus-within:ring-rose-500',
        )}
      >
        {leading && <span className="pl-4 text-sm font-medium text-ink-400">{leading}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className="h-full w-full min-w-0 rounded-xl bg-transparent px-4 text-[15px] text-ink-800 outline-none placeholder:text-ink-300"
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="animate-fade-in text-sm text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-sm text-ink-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
