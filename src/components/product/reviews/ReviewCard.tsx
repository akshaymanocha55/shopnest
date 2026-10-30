import { BadgeCheck, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { formatDate } from '@/lib/format';
import type { Review } from '@/types/review';
import { Rating } from '../../ui/Rating';

interface ReviewCardProps {
  review: Review;
  onDelete?: (id: string) => void;
}

export const ReviewCard = memo(function ReviewCard({ review, onDelete }: ReviewCardProps) {
  return (
    <article className="animate-fade-in py-5">
      <div className="flex items-center gap-3">
        <Rating value={review.rating} />
        <h3 className="font-sans text-[15px] font-semibold text-ink-900">{review.title}</h3>
      </div>
      <p className="mt-2 max-w-[70ch] text-ink-600">{review.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-400">
        <span className="font-medium text-ink-600">{review.author}</span>
        {review.city && <span>{review.city}</span>}
        <span>{formatDate(review.date)}</span>
        {review.verified && (
          <span className="inline-flex items-center gap-1 text-leaf-600">
            <BadgeCheck className="size-4" /> Verified buyer
          </span>
        )}
        {review.mine && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(review.id)}
            className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-ink-500 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="size-3.5" /> Delete
          </button>
        )}
      </div>
    </article>
  );
});
