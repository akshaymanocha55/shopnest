'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { CATEGORY_BY_SLUG, MEGA_MENU, ROUTES } from '@/constants';
import { formatPrice } from '@/lib/format';
import { productQueries } from '@/services/queries/product.queries';
import type { CategorySlug } from '@/types/product';
import { categoryHref } from './megaMenuLinks';

interface MegaMenuPanelProps {
  category: CategorySlug;
  onNavigate: () => void;
}

/** Loaded with next/dynamic the first time someone opens the menu (keeps the header bundle small). */
export default function MegaMenuPanel({ category, onNavigate }: MegaMenuPanelProps) {
  const section = MEGA_MENU.find((s) => s.category === category)!;
  const meta = CATEGORY_BY_SLUG[category];
  const { data: products } = useQuery(productQueries.list());
  const featured = products?.find((p) => p.id === section.featuredProductId);

  return (
    <div className="container-page grid animate-fade-in grid-cols-1 gap-8 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
      {section.columns.map((column) => (
        <div key={column.heading}>
          <p className="mb-3 text-sm font-semibold text-ink-400">{column.heading}</p>
          <ul className="space-y-2.5">
            {column.links.map((link) => (
              <li key={link.label}>
                <Link
                  href={categoryHref(category, { sub: link.sub, sort: link.sort })}
                  onClick={onNavigate}
                  className="text-[15px] font-medium text-ink-700 transition hover:text-ink-900 hover:underline hover:decoration-marigold-400 hover:decoration-2 hover:underline-offset-4"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {section.columns.length < 3 && <div aria-hidden />}

      <div className="flex flex-col gap-3">
        {featured ? (
          <Link
            href={ROUTES.product(featured.slug)}
            onClick={onNavigate}
            className="group flex items-center gap-4 rounded-2xl bg-paper p-4 ring-1 ring-mist transition hover:ring-ink-200"
          >
            <span className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-white">
              <Image
                src={featured.image}
                alt=""
                fill
                sizes="96px"
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-110"
              />
            </span>
            <span className="min-w-0">
              <span className="text-xs font-semibold text-marigold-600">Customer favourite</span>
              <span className="mt-1 line-clamp-2 text-sm font-semibold text-ink-800">
                {featured.title}
              </span>
              <span className="mt-1 block text-sm font-bold text-ink-900">
                {formatPrice(featured.price)}
              </span>
            </span>
          </Link>
        ) : (
          <div className="skeleton-shimmer h-32 animate-shimmer rounded-2xl" />
        )}
        <Link
          href={categoryHref(category)}
          onClick={onNavigate}
          className="text-sm font-semibold text-ink-700 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:text-ink-900"
        >
          Shop all {meta.label.toLowerCase()}
        </Link>
      </div>
    </div>
  );
}
