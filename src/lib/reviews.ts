import { REVIEW_CITIES, REVIEW_DATES, REVIEW_TEMPLATES, REVIEWER_NAMES } from '@/constants';
import type { Product } from '@/types/product';
import type { RatingBreakdown, Review } from '@/types/review';

/**
 * Star distribution that matches the product's average rating and count.
 * Deterministic, so server and client render the same numbers.
 */
export function getRatingBreakdown(
  product: Pick<Product, 'rating' | 'ratingCount'>,
): RatingBreakdown {
  const { rating, ratingCount } = product;
  // Weight each star level by how close it is to the average.
  const weights = [5, 4, 3, 2, 1].map((star) => Math.exp(-Math.abs(star - rating) * 1.6));
  const sum = weights.reduce((a, b) => a + b, 0);
  const counts = weights.map((w) => Math.round((w / sum) * ratingCount));
  // Fix rounding so the counts add up exactly.
  counts[0] += ratingCount - counts.reduce((a, b) => a + b, 0);
  return { average: rating, total: ratingCount, counts: counts as RatingBreakdown['counts'] };
}

/** Seeded reviews for a product, picked so their ratings sit around the product's average. */
export function getSeedReviews(product: Product, count = 6): Review[] {
  const templates = [...REVIEW_TEMPLATES[product.category]].sort(
    (a, b) => Math.abs(a.rating - product.rating) - Math.abs(b.rating - product.rating),
  );

  return templates.slice(0, count).map((template, index) => {
    const seed = product.id * 7 + index * 3;
    return {
      id: `seed-${product.id}-${index}`,
      productId: product.id,
      author: REVIEWER_NAMES[seed % REVIEWER_NAMES.length],
      city: REVIEW_CITIES[seed % REVIEW_CITIES.length],
      rating: template.rating,
      title: template.title,
      body: template.body,
      date: REVIEW_DATES[index % REVIEW_DATES.length],
      verified: index % 3 !== 2,
    };
  });
}
