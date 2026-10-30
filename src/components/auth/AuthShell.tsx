import { BadgeCheck, Gift, Truck } from 'lucide-react';
import type { ReactNode } from 'react';

const PERKS = [
  { icon: Truck, text: 'Track every order in one place' },
  { icon: Gift, text: 'Your cart is saved across devices' },
  { icon: BadgeCheck, text: 'Log in with a one-time password, no passwords to remember' },
];

/** Two-column layout for login and signup: brand panel + form card. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="container-page grid min-h-[calc(100dvh-12rem)] items-center gap-10 py-10 lg:grid-cols-2">
      <div className="hidden lg:block">
        <h2 className="max-w-md text-5xl leading-[1.02] font-extrabold text-ink-900">
          Your nest for everyday shopping.
        </h2>
        <ul className="mt-10 space-y-5">
          {PERKS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-4 text-ink-600">
              <span className="grid size-11 place-items-center rounded-2xl bg-marigold-100 text-ink-800">
                <Icon className="size-5" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
      <div className="mx-auto w-full max-w-md animate-rise rounded-[1.75rem] bg-white p-7 shadow-lift ring-1 ring-mist sm:p-9">
        <h1 className="text-3xl font-bold text-ink-900">{title}</h1>
        <p className="mt-2 text-ink-500">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
