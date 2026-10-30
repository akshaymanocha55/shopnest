'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { reviewSchema, type ReviewForm as ReviewValues } from '@/lib/validation';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { StarRatingInput } from '../../ui/StarRatingInput';

interface ReviewFormProps {
  onSubmit: (values: ReviewValues) => void;
  onCancel: () => void;
}

export function ReviewForm({ onSubmit, onCancel }: ReviewFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: '', body: '' },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="animate-fade-in space-y-5 rounded-2xl bg-paper p-5"
    >
      <Controller
        control={control}
        name="rating"
        render={({ field }) => (
          <StarRatingInput
            value={field.value}
            onChange={field.onChange}
            error={errors.rating?.message}
          />
        )}
      />
      <Input
        label="Title"
        placeholder="Sum it up in a few words"
        error={errors.title?.message}
        {...register('title')}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-body" className="text-sm font-medium text-ink-700">
          Your review
        </label>
        <textarea
          id="review-body"
          rows={4}
          placeholder="What did you like or dislike? How was the fit, quality or delivery?"
          aria-invalid={Boolean(errors.body) || undefined}
          className={cn(
            'rounded-xl bg-white p-4 text-[15px] ring-1 ring-mist outline-none ring-inset placeholder:text-ink-300 focus:ring-2 focus:ring-ink-700',
            errors.body && 'ring-rose-500',
          )}
          {...register('body')}
        />
        {errors.body && (
          <p role="alert" className="text-sm text-rose-600">
            {errors.body.message}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button type="submit">Post review</Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
