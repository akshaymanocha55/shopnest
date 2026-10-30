'use client';

import {
  memo,
  useCallback,
  useState,
  type ButtonHTMLAttributes,
  type PointerEvent,
  type Ref,
} from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'link';
type Size = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

const variants: Record<Variant, string> = {
  primary: 'bg-ink-800 text-white hover:bg-ink-700 shadow-lift',
  accent: 'bg-marigold-400 text-ink-900 hover:bg-marigold-300 shadow-lift',
  secondary: 'bg-white text-ink-800 ring-1 ring-inset ring-mist hover:ring-ink-200 hover:bg-ink-50',
  ghost: 'text-ink-700 hover:bg-ink-50',
  danger: 'bg-rose-500 text-white hover:bg-rose-600',
  link: 'text-ink-700 underline-offset-4 hover:underline px-0! h-auto!',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-base gap-2',
  icon: 'h-10 w-10',
};

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

/** Button with press-scale + ripple feedback, loading state and variants. */
function ButtonBase({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  onPointerDown,
  type = 'button',
  ref,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      onPointerDown?.(event);
      if (variant === 'link') return;
      const rect = event.currentTarget.getBoundingClientRect();
      const rippleSize = Math.max(rect.width, rect.height) / 2;
      setRipples((prev) => [
        ...prev,
        {
          id: event.timeStamp,
          x: event.clientX - rect.left - rippleSize / 2,
          y: event.clientY - rect.top - rippleSize / 2,
          size: rippleSize,
        },
      ]);
    },
    [onPointerDown, variant],
  );

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onPointerDown={handlePointerDown}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full font-semibold whitespace-nowrap transition-[transform,background-color,box-shadow,color] duration-150 select-none active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden
          onAnimationEnd={() => removeRipple(r.id)}
          className="pointer-events-none absolute animate-ripple rounded-full bg-current"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </button>
  );
}

export const Button = memo(ButtonBase);
