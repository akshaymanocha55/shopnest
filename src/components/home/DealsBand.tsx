import Image from 'next/image';
import Link from 'next/link';
import { FILTER_PARAMS, ROUTES } from '@/constants';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/product';

export function DealsBand({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="deals-heading" className="mt-20 bg-ink-800 py-14 text-white">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="deals-heading" className="text-3xl font-bold">
              Biggest savings this week
            </h2>
            <p className="mt-2 text-ink-200">
              Prices already include the discount. No coupon needed.
            </p>
          </div>
          <Link
            href={`${ROUTES.products}?${FILTER_PARAMS.sort}=discount`}
            className="text-sm font-semibold text-marigold-300 underline decoration-2 underline-offset-4 hover:text-marigold-200"
          >
            See all deals
          </Link>
        </div>
        <ul className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0">
          {products.map((product) => (
            <li key={product.id} className="w-[72%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
              <Link
                href={ROUTES.product(product.slug)}
                className="group flex h-full flex-col rounded-[var(--radius-card)] bg-ink-700 p-3 ring-1 ring-ink-600 transition hover:ring-marigold-400"
              >
                <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-white">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(min-width: 1024px) 22vw, 70vw"
                    className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-marigold-400 px-2.5 py-1 text-xs font-bold text-ink-900">
                    {product.discountPercent}% off
                  </span>
                </span>
                <span className="mt-3 line-clamp-1 px-1 text-sm font-semibold">
                  {product.title}
                </span>
                <span className="mt-1 flex items-baseline gap-2 px-1 pb-1">
                  <span className="font-display text-lg font-bold">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-ink-300 line-through">
                    {formatPrice(product.mrp)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
