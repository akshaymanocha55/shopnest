import { Star } from 'lucide-react';
import { formatCount } from '@/lib/format';
import type { RatingBreakdown } from '@/types/review';

/** Average rating and a 5 → 1 star distribution bar chart. */
export function RatingSummary({ breakdown }: { breakdown: RatingBreakdown }) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center lg:flex-col lg:items-start">
      <div>
        <p className="flex items-baseline gap-2">
          <span className="font-display text-5xl leading-tight font-extrabold text-ink-900">
            {breakdown.average.toFixed(1)}
          </span>
          <Star className="size-7 fill-marigold-400 text-marigold-400" aria-hidden />
        </p>
        <p className="text-sm text-ink-500">Based on {formatCount(breakdown.total)} ratings</p>
      </div>
      <ul className="w-full max-w-sm space-y-2" aria-label="Rating distribution">
        {breakdown.counts.map((count, index) => {
          const stars = 5 - index;
          const percent = breakdown.total ? Math.round((count / breakdown.total) * 100) : 0;
          return (
            <li key={stars} className="flex items-center gap-3 text-sm">
              <span className="w-8 shrink-0 font-medium text-ink-600">{stars}★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-50">
                <span
                  className={`block h-full rounded-full ${stars >= 4 ? 'bg-leaf-500' : stars === 3 ? 'bg-marigold-400' : 'bg-rose-500'}`}
                  style={{ width: `${percent}%` }}
                />
              </span>
              <span className="w-10 shrink-0 text-right text-ink-400 tabular-nums">{percent}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
