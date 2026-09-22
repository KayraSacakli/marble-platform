'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './BrandLogo';
import { DesktopNavigation } from './DesktopNavigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import type { NavigationItem, UtilityNavigationItem } from '@/types/api';

interface HeaderInteractiveProps {
  primaryItems: NavigationItem[];
  utilityItems: UtilityNavigationItem[];
  locale: string;
  currentPath: string;
}

export function HeaderInteractive({
  primaryItems,
  utilityItems,
  locale,
  currentPath,
}: HeaderInteractiveProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const prevPathRef = useRef(currentPath);
  const pathname = usePathname();

  const isHomepage = pathname === `/${locale}` || pathname === `/${locale}/`;

  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 20;
    document.documentElement.style.setProperty(
      '--header-scrolled',
      scrolled ? '1' : '0',
    );
    if (isHomepage) {
      const header = document.querySelector('.header');
      if (header) {
        if (scrolled) {
          header.classList.remove('header--transparent');
        } else {
          header.classList.add('header--transparent');
        }
      }
    }
  }, [isHomepage]);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (!isHomepage) {
      const header = document.querySelector('.header');
      if (header) {
        header.classList.remove('header--transparent');
      }
    }
  }, [isHomepage]);

  useEffect(() => {
    if (prevPathRef.current !== currentPath) {
      prevPathRef.current = currentPath;
      setMobileOpen(false);
    }
  }, [currentPath]);

  const ctaItem = utilityItems.find((item) => item.type === 'cta' && item.visible);

  return (
    <>
      <BrandLogo locale={locale} className="header__brand" />
      <DesktopNavigation
        items={primaryItems}
        locale={locale}
        currentPath={currentPath}
        className="header__nav"
      />
      <div className="header__utility">
        <LanguageSwitcher items={utilityItems} locale={locale} className="header__lang" />
        {ctaItem && (
          <a
            href={ctaItem.href}
            className="header__cta"
            aria-label={ctaItem.label}
          >
            {ctaItem.label}
          </a>
        )}
        <button
          ref={triggerRef}
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
          className="header__menu-trigger"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen
            ? (locale === 'tr' ? 'Menüyü kapat' : 'Close menu')
            : (locale === 'tr' ? 'Menüyü aç' : 'Open menu')
          }
        >
          <span className={`header__hamburger ${mobileOpen ? 'header__hamburger--open' : ''}`}>
            <span />
            <span />
          </span>
        </button>
      </div>
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        primaryItems={primaryItems}
        utilityItems={utilityItems}
        locale={locale}
      />
    </>
  );
}
