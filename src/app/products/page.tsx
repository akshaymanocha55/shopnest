import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductListing } from '@/components/product/ProductListing';
import { ProductListingSkeleton } from '@/components/product/ProductListingSkeleton';
import { JsonLd } from '@/components/seo/JsonLd';
import { APP, CATEGORY_BY_SLUG, FILTER_PARAMS, ROUTES } from '@/constants';
import { applyFilters, parseFilters } from '@/lib/product-filters';
import { getProducts } from '@/lib/server/products';
import { breadcrumbJsonLd, buildMetadata, itemListJsonLd } from '@/lib/seo';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toURLSearchParams(params: Awaited<SearchParams>) {
  const result = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string') result.set(key, value);
    else if (Array.isArray(value) && value[0]) result.set(key, value[0]);
  });
  return result;
}

/**
 * Canonical URL: a single-category listing is its own indexable page;
 * every other combination (search, price, sort, rating) points back to /products.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const filters = parseFilters(toURLSearchParams(await searchParams));
  const category = filters.categories.length === 1 ? CATEGORY_BY_SLUG[filters.categories[0]] : null;
  const onlyCategory =
    category && !filters.q && !filters.sub && filters.minPrice == null && filters.maxPrice == null;

  const title = filters.q
    ? `Search results for “${filters.q}”`
    : category
      ? `${category.label}`
      : 'All products';
  const description = category
    ? `Shop ${category.label.toLowerCase()} at ${APP.name}: ${category.description.toLowerCase()}. Free delivery over ₹999.`
    : `Browse every product at ${APP.name}. Filter by category, price and rating.`;

  return buildMetadata({
    title,
    description,
    path: onlyCategory
      ? `${ROUTES.products}?${FILTER_PARAMS.category}=${category.slug}`
      : ROUTES.products,
    // Search result pages are thin duplicates; keep them out of the index.
    noIndex: Boolean(filters.q),
  });
}

async function Listing({ searchParams }: { searchParams: SearchParams }) {
  const [params, products] = await Promise.all([searchParams, getProducts()]);
  const visible = applyFilters(products, parseFilters(toURLSearchParams(params)));

  return (
    <>
      <ProductListing initialProducts={products} />
      <JsonLd data={itemListJsonLd(visible, 'Products')} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: ROUTES.home },
          { name: 'Products', path: ROUTES.products },
        ])}
      />
    </>
  );
}

export default function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <Listing searchParams={searchParams} />
    </Suspense>
  );
}
