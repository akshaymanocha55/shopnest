import { RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { PRICING } from '@/constants';
import { formatPrice } from '@/lib/format';

const ITEMS = [
  {
    icon: Truck,
    title: 'Free delivery',
    text: `On orders over ${formatPrice(PRICING.freeDeliveryThreshold)}`,
  },
  { icon: RotateCcw, title: '30-day returns', text: 'Return or exchange anything, no questions' },
  { icon: ShieldCheck, title: 'Secure checkout', text: 'UPI, cards and cash on delivery' },
];

export function ServiceStrip() {
  return (
    <section aria-label="Why shop with us" className="container-page mt-16">
      <ul className="grid gap-6 border-y border-mist py-8 sm:grid-cols-3">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-4">
            <Icon className="size-7 shrink-0 text-marigold-500" strokeWidth={1.75} aria-hidden />
            <span>
              <span className="block font-semibold text-ink-900">{title}</span>
              <span className="text-sm text-ink-500">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
