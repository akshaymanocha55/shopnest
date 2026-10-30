import type { CategorySlug } from '@/types/product';

/** FakeStore has no reviews; these seed a realistic review list per product. */
export const REVIEWER_NAMES = [
  'Priya S.',
  'Rahul M.',
  'Ananya K.',
  'Vikram R.',
  'Sneha P.',
  'Arjun T.',
  'Neha G.',
  'Karan D.',
  'Meera J.',
  'Rohit B.',
];

export const REVIEW_CITIES = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Pune',
  'Jaipur',
  'Kolkata',
  'Chennai',
];

/** Fixed dates keep pre-rendered pages deterministic. */
export const REVIEW_DATES = [
  '2026-10-12',
  '2026-09-28',
  '2026-09-03',
  '2026-08-17',
  '2026-07-30',
  '2026-07-02',
];

interface ReviewTemplate {
  rating: number;
  title: string;
  body: string;
}

const COMMON: ReviewTemplate[] = [
  {
    rating: 5,
    title: 'Worth every rupee',
    body: 'Arrived in two days and was packed well. Exactly as shown in the photos.',
  },
  {
    rating: 4,
    title: 'Good value',
    body: 'Quality is better than I expected at this price. Would buy again.',
  },
  {
    rating: 3,
    title: 'Decent, not perfect',
    body: 'Does the job, but I expected a little more for the price.',
  },
  {
    rating: 2,
    title: 'Average',
    body: 'Not bad, but I had to return my first one. The replacement was fine.',
  },
];

export const REVIEW_TEMPLATES: Record<CategorySlug, ReviewTemplate[]> = {
  'mens-clothing': [
    {
      rating: 5,
      title: 'Fits perfectly',
      body: 'True to size. The fabric feels soft and has held up after several washes.',
    },
    {
      rating: 4,
      title: 'Nice everyday wear',
      body: 'Comfortable for office and weekends. The colour is slightly darker than the photo.',
    },
    ...COMMON,
  ],
  'womens-clothing': [
    {
      rating: 5,
      title: 'Love it',
      body: 'Flattering fit and very comfortable. I ordered a second colour.',
    },
    {
      rating: 4,
      title: 'Comfortable and light',
      body: 'Breathable fabric, great for Indian summers. Runs a little long.',
    },
    ...COMMON,
  ],
  jewellery: [
    {
      rating: 5,
      title: 'Looks premium',
      body: 'Got compliments the first day I wore it. The finish has not faded.',
    },
    {
      rating: 4,
      title: 'Lovely gift',
      body: 'Bought this as a gift and it came in a nice box. Slightly smaller than expected.',
    },
    ...COMMON,
  ],
  electronics: [
    {
      rating: 5,
      title: 'Fast and reliable',
      body: 'Set up in minutes and transfer speeds are as advertised.',
    },
    {
      rating: 4,
      title: 'Does what it says',
      body: 'Works well with my laptop. Gets a little warm under heavy use.',
    },
    ...COMMON,
  ],
};

export const REVIEWS_PER_PAGE = 4;
