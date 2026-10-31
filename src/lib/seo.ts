import type { Metadata } from 'next';
import { env } from '@/config/env';
import { APP, ROUTES } from '@/constants';
import type { Product } from '@/types/product';
import { getSeedReviews } from './reviews';

export const absoluteUrl = (path = '/') =>
  `${env.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

/** Builds title, description, canonical, Open Graph and Twitter tags for a page. */
export function buildMetadata({
  title,
  description,
  path,
  image,
  noIndex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: APP.name,
      locale: APP.locale,
      type: 'website',
      ...(image && { images: [{ url: image, alt: title }] }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      site: APP.twitter,
      ...(image && { images: [image] }),
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

/** Escape "<" so product text can never break out of the JSON-LD <script> tag. */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': absoluteUrl('/#organization'),
        name: APP.name,
        url: absoluteUrl('/'),
        logo: absoluteUrl('/icon.svg'),
        email: APP.supportEmail,
      },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        name: APP.name,
        url: absoluteUrl('/'),
        publisher: { '@id': absoluteUrl('/#organization') },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${absoluteUrl(ROUTES.products)}?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export function productJsonLd(product: Product) {
  const url = absoluteUrl(ROUTES.product(product.slug));
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.title,
    description: product.description,
    image: [product.image],
    sku: `SN-${product.id}`,
    category: product.categoryLabel,
    brand: { '@type': 'Brand', name: APP.name },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: getSeedReviews(product, 3).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      datePublished: r.date,
      name: r.title,
      reviewBody: r.body,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    })),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: APP.currency,
      price: product.price,
      // Static date: reading the clock during prerender would make the page dynamic.
      priceValidUntil: '2027-12-31',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': absoluteUrl('/#organization') },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListJsonLd(products: Product[], name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(ROUTES.product(product.slug)),
      name: product.title,
    })),
  };
}
