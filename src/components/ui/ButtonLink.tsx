import Link, { type LinkProps } from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'bg-ink-800 text-white hover:bg-ink-700 shadow-lift',
  accent: 'bg-marigold-400 text-ink-900 hover:bg-marigold-300 shadow-lift',
  secondary: 'bg-white text-ink-800 ring-1 ring-inset ring-mist hover:ring-ink-200 hover:bg-ink-50',
  ghost: 'text-ink-700 hover:bg-ink-50',
};

interface ButtonLinkProps extends LinkProps {
  children: ReactNode;
  variant?: Variant;
  size?: 'md' | 'lg';
  className?: string;
}

/** A Next.js Link styled like a Button, for navigation CTAs. */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,background-color] duration-150 active:scale-[0.96]',
        size === 'md' ? 'h-11 px-5 text-sm' : 'h-13 px-7 text-base',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
