import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';
import type { Review } from '@/types/review';
import type { RootState } from '../store';

/** Reviews written in this browser. Seeded reviews are generated, not stored. */
const reviewsAdapter = createEntityAdapter<Review, string>({
  selectId: (review) => review.id,
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: reviewsAdapter.getInitialState(),
  reducers: {
    addReview: reviewsAdapter.addOne,
    deleteReview: reviewsAdapter.removeOne,
    hydrateReviews: reviewsAdapter.setAll,
  },
});

export const { addReview, deleteReview, hydrateReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;

const selectAllReviews = reviewsAdapter.getSelectors<RootState>((state) => state.reviews).selectAll;

/** Memoised per product id. */
export const makeSelectProductReviews = () =>
  createSelector(
    [selectAllReviews, (_: RootState, productId: number) => productId],
    (reviews, productId) => reviews.filter((r) => r.productId === productId),
  );
