import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface Crumb {
  label: string;
  href?: string;
}

/** Always one line: earlier crumbs keep their size, the last one shrinks and ends with "…". */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-sm whitespace-nowrap text-ink-400">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li
              key={item.label}
              className={
                last ? 'flex min-w-0 items-center gap-1' : 'flex shrink-0 items-center gap-1'
              }
            >
              {index > 0 && <ChevronRight className="size-3.5 shrink-0" aria-hidden />}
              {item.href && !last ? (
                <Link href={item.href} className="transition hover:text-ink-800">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" title={item.label} className="truncate text-ink-600">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
