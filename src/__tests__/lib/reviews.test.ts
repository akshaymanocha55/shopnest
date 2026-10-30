import { getRatingBreakdown, getSeedReviews } from '@/lib/reviews';
import { jacket, products } from '@/test-utils/fixtures';

describe('reviews', () => {
  it.each(products.map((p) => [p.id, p] as const))(
    'breakdown for #%i adds up to the rating count',
    (_id, product) => {
      const { counts, total } = getRatingBreakdown(product);
      expect(counts.reduce((a, b) => a + b, 0)).toBe(total);
      expect(counts.every((c) => c >= 0)).toBe(true);
    },
  );

  it('weights the distribution toward the average rating', () => {
    const high = getRatingBreakdown({ rating: 4.7, ratingCount: 500 });
    expect(high.counts[0]).toBeGreaterThan(high.counts[4]);
    const low = getRatingBreakdown({ rating: 1.9, ratingCount: 100 });
    expect(low.counts[4]).toBeGreaterThan(low.counts[0]);
  });

  it('generates deterministic seed reviews', () => {
    expect(getSeedReviews(jacket)).toEqual(getSeedReviews(jacket));
    expect(getSeedReviews(jacket, 3)).toHaveLength(3);
    expect(getSeedReviews(jacket).every((r) => r.productId === jacket.id)).toBe(true);
  });
});
