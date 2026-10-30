import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES } from '@/constants';
import type { CategorySlug, Product } from '@/types/product';
import { categoryHref } from '../layout/megaMenuLinks';

export function CategoryTiles({ covers }: { covers: Record<CategorySlug, Product | undefined> }) {
  return (
    <section aria-labelledby="categories-heading" className="container-page mt-16">
      <h2 id="categories-heading" className="text-3xl font-bold text-ink-900">
        Shop by category
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {CATEGORIES.map((category) => {
          const cover = covers[category.slug];
          return (
            <Link
              key={category.slug}
              href={categoryHref(category.slug)}
              className={`group relative flex aspect-[4/5] flex-col overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-b p-5 ring-1 ring-mist sm:aspect-[4/4.5] ${category.accent}`}
            >
              <span className="font-display text-xl font-bold text-ink-900 sm:text-2xl">
                {category.shortLabel}
              </span>
              <span className="mt-1 text-sm text-ink-500">{category.description}</span>
              {cover && (
                <span className="relative mt-auto h-[58%] w-full">
                  <Image
                    src={cover.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-contain mix-blend-multiply transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1 group-hover:scale-105"
                  />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
