export interface Review {
  id: string;
  productId: number;
  author: string;
  city?: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  /** Written by the current user in this browser (shown first, can be deleted). */
  mine?: boolean;
}

export interface RatingBreakdown {
  average: number;
  total: number;
  /** Count per star, index 0 = 5 stars ... index 4 = 1 star. */
  counts: [number, number, number, number, number];
}
