'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const LABELS = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

/** Radio-group based star picker: keyboard accessible, with hover preview. */
export function StarRatingInput({ value, onChange, error }: StarRatingInputProps) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Your rating"
        className="flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} onMouseEnter={() => setHover(star)} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              className="peer sr-only"
              aria-label={`${star} star${star > 1 ? 's' : ''}, ${LABELS[star - 1]}`}
            />
            <Star
              className={cn(
                'size-8 transition-transform duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-marigold-400 hover:scale-110',
                star <= shown ? 'fill-marigold-400 text-marigold-400' : 'text-ink-200',
              )}
              strokeWidth={1.5}
            />
          </label>
        ))}
        <span className="ml-2 text-sm font-medium text-ink-600">
          {shown ? LABELS[shown - 1] : 'Tap to rate'}
        </span>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
