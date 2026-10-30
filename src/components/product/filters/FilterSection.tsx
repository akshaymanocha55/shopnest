import type { ReactNode } from 'react';

export function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-mist py-5 first:pt-0 last:border-0">
      <legend className="mb-3 text-sm font-semibold text-ink-900">{title}</legend>
      {children}
    </fieldset>
  );
}
