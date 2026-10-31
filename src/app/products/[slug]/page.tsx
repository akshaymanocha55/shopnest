import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { categoryHref } from '@/components/layout/megaMenuLinks';
import { ProductGallery } from '@/components/product/detail/ProductGallery';
import { PurchasePanel } from '@/components/product/detail/PurchasePanel';
import { ProductDetailSkeleton } from '@/components/product/detail/ProductDetailSkeleton';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { ReviewsSection } from '@/components/product/reviews/ReviewsSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Rating } from '@/components/ui/Rating';
import { LIMITS, ROUTES } from '@/constants';
import { formatPrice } from '@/lib/format';
import { getProductBySlug, getProducts } from '@/lib/server/products';
import { breadcrumbJsonLd, buildMetadata, productJsonLd } from '@/lib/seo';
import { truncate } from '@/lib/utils';

type Params = Promise<{ slug: string }>;

/** Every product page is pre-rendered at build time (static HTML, fastest LCP). */
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found', robots: { index: false } };

  return buildMetadata({
    title: product.title,
    description: truncate(`${formatPrice(product.price)}. ${product.description}`, 158),
    path: ROUTES.product(product.slug),
    image: product.image,
  });
}

async function ProductDetail({ slug }: { slug: string }) {
  const [product, products] = await Promise.all([getProductBySlug(slug), getProducts()]);
  if (!product) notFound();

  // Same category first (closest price first), then top-rated items from other categories.
  const related = [
    ...products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price)),
    ...products.filter((p) => p.category !== product.category).sort((a, b) => b.rating - a.rating),
  ].slice(0, LIMITS.relatedProducts);

  const crumbs = [
    { label: 'Home', href: ROUTES.home },
    { label: product.categoryLabel, href: categoryHref(product.category) },
    { label: product.title },
  ];

  return (
    <div className="container-page pt-6 pb-28 md:pb-10">
      <Breadcrumbs items={crumbs} />

      <div className="mt-5 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        {/* The gallery stays in view while the buying options scroll (desktop). */}
        <div className="lg:sticky-below-header">
          <ProductGallery image={product.image} title={product.title} inStock={product.inStock} />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-marigold-50 px-2.5 py-1 text-xs font-semibold text-marigold-600">
                {product.subcategory}
              </span>
              <span className="text-xs text-ink-400">{product.categoryLabel}</span>
            </div>
            <h1 className="mt-3 text-2xl leading-tight font-bold text-ink-900 sm:text-3xl xl:text-4xl">
              {product.title}
            </h1>
            <a href="#reviews-heading" className="mt-3 inline-flex hover:opacity-80">
              <Rating value={product.rating} count={product.ratingCount} size="md" />
            </a>
          </div>
          <PurchasePanel product={product} />
        </div>
      </div>

      <section
        aria-labelledby="details-heading"
        className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14"
      >
        <div>
          <h2 id="details-heading" className="text-2xl font-bold text-ink-900">
            About this product
          </h2>
          <p className="mt-4 max-w-[68ch] leading-relaxed text-ink-600">{product.description}</p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 self-start rounded-[var(--radius-card)] bg-white p-6 text-sm ring-1 ring-mist">
          <dt className="text-ink-400">Category</dt>
          <dd className="font-medium">{product.categoryLabel}</dd>
          <dt className="text-ink-400">Type</dt>
          <dd className="font-medium">{product.subcategory}</dd>
          <dt className="text-ink-400">Product code</dt>
          <dd className="font-medium">SN-{product.id.toString().padStart(5, '0')}</dd>
          {product.variantGroups.map((g) => (
            <div key={g.id} className="contents">
              <dt className="text-ink-400">{g.name} options</dt>
              <dd className="font-medium">{g.options.map((o) => o.label).join(', ')}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-16">
        <ErrorBoundary compact title="Related products are unavailable">
          <ProductCarousel id="related-heading" title="Related products" products={related} />
        </ErrorBoundary>
      </div>

      <div className="mt-16 border-t border-mist pt-14">
        <ErrorBoundary compact title="Reviews could not be loaded">
          <ReviewsSection product={product} />
        </ErrorBoundary>
      </div>

      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: ROUTES.home },
          { name: product.categoryLabel, path: categoryHref(product.category) },
          { name: product.title, path: ROUTES.product(product.slug) },
        ])}
      />
    </div>
  );
}

export default function ProductPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      {params.then(({ slug }) => (
        <ProductDetail slug={slug} />
      ))}
    </Suspense>
  );
}
