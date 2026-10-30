'use client';

import type { Product } from '@/types/product';
import { Carousel } from '../ui/Carousel';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  id: string;
}

/** Titled product carousel used for "Related products" and "You may also like". */
export function ProductCarousel({ title, products, id }: ProductCarouselProps) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-2xl font-bold text-ink-900">
        {title}
      </h2>
      <div className="mt-6">
        <Carousel label={title}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} className="h-full" />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
