import type { Metadata } from 'next';
import Link from 'next/link';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { DealsBand } from '@/components/home/DealsBand';
import { Hero } from '@/components/home/Hero';
import { ServiceStrip } from '@/components/home/ServiceStrip';
import { ProductGrid } from '@/components/product/ProductGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { APP, ROUTES } from '@/constants';
import { getCategoryCovers, getDeals, getFeaturedProducts } from '@/lib/server/products';
import { buildMetadata, itemListJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: `${APP.name} | ${APP.tagline}`,
    description: APP.description,
    path: ROUTES.home,
  }),
  title: { absolute: `${APP.name} | ${APP.tagline}` },
};

/** Fully static: data comes from the hourly "use cache" product fetch. */
export default async function HomePage() {
  const [featured, deals, covers] = await Promise.all([
    getFeaturedProducts(8),
    getDeals(4),
    getCategoryCovers(),
  ]);
  const heroPicks = [
    covers.jewellery,
    covers['womens-clothing'],
    covers.electronics,
    covers['mens-clothing'],
  ].filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <Hero products={heroPicks} />
      <CategoryTiles covers={covers} />

      <section aria-labelledby="favourites-heading" className="container-page mt-20">
        <div className="flex items-end justify-between gap-4">
          <h2 id="favourites-heading" className="text-3xl font-bold text-ink-900">
            Customer favourites
          </h2>
          <Link
            href={`${ROUTES.products}?sort=rating`}
            className="text-sm font-semibold text-ink-700 underline decoration-marigold-400 decoration-2 underline-offset-4"
          >
            View all
          </Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={featured} />
        </div>
      </section>

      <DealsBand products={deals} />
      <ServiceStrip />
      <JsonLd data={itemListJsonLd(featured, 'Customer favourites')} />
    </>
  );
}
