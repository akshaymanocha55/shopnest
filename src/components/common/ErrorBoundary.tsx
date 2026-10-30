'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { catchError, type ErrorInfo } from 'next/error';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';

interface FallbackProps {
  title?: string;
  compact?: boolean;
  className?: string;
}

function ErrorFallback({ title, compact, className }: FallbackProps, { error, retry }: ErrorInfo) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center rounded-[var(--radius-card)] bg-rose-50 text-center',
        compact ? 'gap-2 p-5' : 'gap-3 p-10',
        className,
      )}
    >
      <AlertTriangle className="size-7 text-rose-500" aria-hidden />
      <p className="font-semibold text-ink-900">{title ?? 'This section could not load'}</p>
      {!compact && <p className="max-w-sm text-sm text-ink-500">{getErrorMessage(error)}</p>}
      <button
        type="button"
        onClick={() => retry()}
        className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-800 ring-1 ring-mist transition ring-inset hover:ring-ink-300 active:scale-95"
      >
        <RotateCcw className="size-4" /> Try again
      </button>
    </div>
  );
}

/**
 * Functional error boundary for any section of the UI, built with Next.js `catchError`
 * (no class component needed). A failing section shows a retry card while the rest of the
 * page keeps working.
 */
export const ErrorBoundary = catchError(ErrorFallback);
