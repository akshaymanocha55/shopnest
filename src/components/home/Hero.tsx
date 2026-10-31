import Image from 'next/image';
import { FILTER_PARAMS, PRICING, ROUTES } from '@/constants';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/product';
import { ButtonLink } from '../ui/ButtonLink';

const TILES = [
  { tilt: '-6deg', className: 'left-[4%] top-[8%] w-[46%] bg-marigold-100', delay: '120ms' },
  { tilt: '5deg', className: 'right-[2%] top-[0%] w-[40%] bg-white', delay: '260ms' },
  { tilt: '3deg', className: 'left-[14%] bottom-[2%] w-[38%] bg-white', delay: '400ms' },
  { tilt: '-4deg', className: 'right-[8%] bottom-[8%] w-[42%] bg-ink-100', delay: '540ms' },
];

/**
 * The one orchestrated load moment: the headline rises, then four real products drop into a
 * loose "nest". The headline (text) is the LCP element, so it paints without waiting on images.
 */
export function Hero({ products }: { products: Product[] }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container-page grid grid-cols-1 items-center gap-10 py-12 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:py-20">
        <div>
          <h1 className="animate-rise text-[clamp(2.6rem,6vw,4.75rem)] leading-[0.98] font-extrabold text-ink-900">
            Everyday finds, fairly priced.
          </h1>
          <p className="mt-6 max-w-[46ch] animate-rise text-lg text-ink-500 [animation-delay:120ms]">
            Jackets, jewellery and storage drives, delivered across India in {PRICING.deliveryDays}{' '}
            days. Delivery is free on orders over {formatPrice(PRICING.freeDeliveryThreshold)}.
          </p>
          {/* Up to tablet: two equal buttons side by side with short labels. Laptop+: full labels. */}
          <div className="mt-9 grid animate-rise grid-cols-2 gap-3 [animation-delay:220ms] lg:flex lg:flex-wrap">
            <ButtonLink href={ROUTES.products} size="lg" className="px-4 lg:px-7">
              <span className="lg:hidden">Shop all</span>
              <span className="hidden lg:inline">Shop all products</span>
            </ButtonLink>
            <ButtonLink
              href={`${ROUTES.products}?${FILTER_PARAMS.sort}=discount`}
              size="lg"
              variant="secondary"
              className="px-4 lg:px-7"
            >
              <span className="lg:hidden">Today’s deals</span>
              <span className="hidden lg:inline">See today’s deals</span>
            </ButtonLink>
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden>
          <div className="absolute inset-[12%] rounded-full bg-paper" />
          {products.slice(0, 4).map((product, index) => (
            <div
              key={product.id}
              className={`absolute aspect-square animate-nest-drop rounded-[2rem] p-5 shadow-lift ring-1 ring-mist ${TILES[index].className}`}
              style={
                {
                  '--tilt': TILES[index].tilt,
                  animationDelay: TILES[index].delay,
                } as React.CSSProperties
              }
            >
              <div className="relative size-full">
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 240px, 45vw"
                  loading={index < 2 ? 'eager' : 'lazy'}
                  className="object-contain mix-blend-multiply"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
