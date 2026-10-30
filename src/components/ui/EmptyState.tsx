import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

/** Used for "no results", empty cart, no orders and similar screens. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex animate-pop-in flex-col items-center px-6 py-16 text-center', className)}
    >
      <div className="relative mb-6 grid size-28 place-items-center">
        <span className="absolute inset-0 rounded-full bg-marigold-100" />
        <span className="absolute inset-3 rounded-full bg-marigold-50" />
        <span className="relative text-ink-700 [&>svg]:size-11 [&>svg]:stroke-[1.5]">{icon}</span>
      </div>
      <h2 className="text-2xl font-bold text-ink-900">{title}</h2>
      <p className="mt-2 max-w-sm text-ink-500">{description}</p>
      {action && <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
