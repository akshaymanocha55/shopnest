import Link from 'next/link';
import { APP, CATEGORIES, ROUTES } from '@/constants';
import { categoryHref } from './megaMenuLinks';
import { Logo } from './Logo';

const HELP_LINKS = [
  { label: 'My account', href: ROUTES.account },
  { label: 'Track orders', href: ROUTES.accountOrders },
  { label: 'Cart', href: ROUTES.cart },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-ink-800 text-ink-200">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <div className="[&_rect]:fill-ink-700! [&_span]:text-white!">
            <Logo />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-300">{APP.description}</p>
        </div>
        <div>
          <p className="mb-4 font-semibold text-white">Shop</p>
          <ul className="space-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={categoryHref(c.slug)} className="transition hover:text-white">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 font-semibold text-white">Help</p>
          <ul className="space-y-2.5 text-sm">
            {HELP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${APP.supportEmail}`} className="transition hover:text-white">
                {APP.supportEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-700">
        <p className="container-page py-5 text-xs text-ink-400">
          {APP.name} is a demo store built for a frontend assignment. Product data from FakeStore
          API.
        </p>
      </div>
    </footer>
  );
}
