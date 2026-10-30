'use client';

import { Menu } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { useScrollState } from '@/hooks/useScrollState';
import { cn } from '@/lib/utils';
import { HeaderActions } from './HeaderActions';
import { Logo } from './Logo';
import { NavBar } from './NavBar';
import { SearchBar } from './SearchBar';

const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false });

/** Sticky header that tucks away while scrolling down and returns when scrolling up. */
export function Header() {
  const { scrolled, hidden } = useScrollState();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 bg-white/90 backdrop-blur-xl transition-[transform,box-shadow] duration-300',
          scrolled && 'shadow-[0_1px_0_var(--color-mist),0_8px_24px_-16px_rgb(27_31_59/0.25)]',
          hidden && '-translate-y-full',
        )}
      >
        <div className="container-page flex h-16 items-center gap-3 lg:h-[4.5rem] lg:gap-8">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="-ml-2 grid size-10 place-items-center rounded-full text-ink-800 hover:bg-ink-50 lg:hidden"
          >
            <Menu className="size-5.5" />
          </button>
          <Logo />
          <SearchBar className="hidden max-w-xl flex-1 md:block" />
          <div className="ml-auto">
            <HeaderActions />
          </div>
        </div>
        <div className="container-page pb-3 md:hidden">
          <SearchBar />
        </div>
        <NavBar />
      </header>
      {menuOpen && <MobileMenu onClose={closeMenu} />}
    </>
  );
}
