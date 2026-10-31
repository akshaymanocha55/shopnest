'use client';

import { PenLine } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { REVIEWS_PER_PAGE, TOAST } from '@/constants';
import { useHydrated } from '@/hooks/useHydrated';
import { getRatingBreakdown, getSeedReviews } from '@/lib/reviews';
import { generateId } from '@/lib/utils';
import type { ReviewForm as ReviewValues } from '@/lib/validation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/auth.slice';
import { addReview, deleteReview, makeSelectProductReviews } from '@/store/slices/reviews.slice';
import { openLoginPrompt } from '@/store/slices/ui.slice';
import type { Product } from '@/types/product';
import { Button } from '../../ui/Button';
import { RatingSummary } from './RatingSummary';
import { ReviewCard } from './ReviewCard';

// The form is only needed when someone chooses to write a review.
const ReviewForm = dynamic(() => import('./ReviewForm').then((m) => m.ReviewForm), { ssr: false });

type SortKey = 'recent' | 'highest' | 'lowest';

export function ReviewsSection({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const selectProductReviews = useMemo(() => makeSelectProductReviews(), []);
  const hydrated = useHydrated();
  const storedReviews = useAppSelector((state) => selectProductReviews(state, product.id));
  const myReviews = useMemo(() => (hydrated ? storedReviews : []), [hydrated, storedReviews]);

  const [writing, setWriting] = useState(false);
  const [sort, setSort] = useState<SortKey>('recent');
  const [visible, setVisible] = useState(REVIEWS_PER_PAGE);

  const seeded = useMemo(() => getSeedReviews(product), [product]);
  const breakdown = useMemo(() => getRatingBreakdown(product), [product]);

  const reviews = useMemo(() => {
    const all = [...myReviews.map((r) => ({ ...r, mine: true })), ...seeded];
    if (sort === 'highest') return all.sort((a, b) => b.rating - a.rating);
    if (sort === 'lowest') return all.sort((a, b) => a.rating - b.rating);
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }, [myReviews, seeded, sort]);

  const startWriting = () => {
    if (!user) dispatch(openLoginPrompt());
    else setWriting(true);
  };

  const submit = useCallback(
    (values: ReviewValues) => {
      if (!user) return;
      dispatch(
        addReview({
          id: generateId('R'),
          productId: product.id,
          author: user.name,
          rating: values.rating,
          title: values.title,
          body: values.body,
          date: new Date().toISOString().slice(0, 10),
          verified: false,
        }),
      );
      setWriting(false);
      setSort('recent');
      toast.success(TOAST.reviewAdded);
    },
    [dispatch, product.id, user],
  );

  const remove = useCallback(
    (id: string) => {
      dispatch(deleteReview(id));
      toast(TOAST.reviewDeleted);
    },
    [dispatch],
  );

  return (
    <section
      aria-labelledby="reviews-heading"
      className="grid grid-cols-1 gap-10 lg:grid-cols-[320px_minmax(0,1fr)]"
    >
      <div>
        <h2 id="reviews-heading" className="text-2xl font-bold text-ink-900">
          Ratings and reviews
        </h2>
        <div className="mt-6">
          <RatingSummary breakdown={breakdown} />
        </div>
        {!writing && (
          <Button variant="secondary" className="mt-6" onClick={startWriting}>
            <PenLine className="size-4" /> Write a review
          </Button>
        )}
      </div>

      <div>
        {writing && <ReviewForm onSubmit={submit} onCancel={() => setWriting(false)} />}

        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-sm text-ink-500">{reviews.length} reviews</p>
          <label className="text-sm text-ink-500">
            Sort by{' '}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="cursor-pointer rounded-lg bg-transparent font-semibold text-ink-800 outline-none"
            >
              <option value="recent">Most recent</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
            </select>
          </label>
        </div>

        <div className="divide-y divide-mist">
          {reviews.slice(0, visible).map((review) => (
            <ReviewCard key={review.id} review={review} onDelete={remove} />
          ))}
        </div>

        {visible < reviews.length && (
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => setVisible((v) => v + REVIEWS_PER_PAGE)}
          >
            Show more reviews
          </Button>
        )}
      </div>
    </section>
  );
}
