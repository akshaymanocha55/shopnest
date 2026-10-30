import Link from 'next/link';
import { APP, ROUTES } from '@/constants';
import { cn } from '@/lib/utils';

/** Wordmark with a small "nest" mark: three stacked arcs. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.home}
      aria-label={`${APP.name} home`}
      className={cn('group flex items-center gap-2', className)}
    >
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="10" className="fill-ink-800" />
        <path
          d="M8 13c2.5 5 13.5 5 16 0"
          className="fill-none stroke-marigold-400 transition-transform duration-500 group-hover:-translate-y-0.5"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M9.5 18.5c2.2 3.6 10.8 3.6 13 0"
          className="fill-none stroke-white"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <circle cx="16" cy="10" r="2.2" className="fill-marigold-400" />
      </svg>
      <span className="font-display text-xl font-extrabold tracking-tight text-ink-900">
        Shop<span className="text-ink-500">Nest</span>
      </span>
    </Link>
  );
}
