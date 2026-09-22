'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { NavigationItem, UtilityNavigationItem } from '@/types/api';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  primaryItems: NavigationItem[];
  utilityItems: UtilityNavigationItem[];
  locale: string;
}

export function MobileMenu({
  isOpen,
  onClose,
  primaryItems,
  utilityItems,
  locale,
}: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const visiblePrimary = primaryItems.filter((item) => item.visible);
  const ctaItem = utilityItems.find((item) => item.type === 'cta' && item.visible);
  const langItem = utilityItems.find((item) => item.type === 'language_switch' && item.visible);

  const getFocusableElements = useCallback(() => {
    if (!menuRef.current) return [];
    return Array.from(
      menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
  }, []);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        const firstFocusable = getFocusableElements()[0];
        firstFocusable?.focus();
      }, 50);

      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen, getFocusableElements]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, getFocusableElements]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label={locale === 'tr' ? 'Menü' : 'Menu'}
      className="mobile-menu"
    >
      <div className="mobile-menu__overlay" onClick={onClose} aria-hidden="true" />
      <div className="mobile-menu__panel">
        <div className="mobile-menu__header">
          <button
            onClick={onClose}
            type="button"
            className="mobile-menu__close"
            aria-label={locale === 'tr' ? 'Menüyü kapat' : 'Close menu'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav aria-label={locale === 'tr' ? 'Ana navigasyon' : 'Main navigation'}>
          <ul className="mobile-menu__list">
            {visiblePrimary.map((item) => {
              const isActive = false;
              return (
                <li key={item.href} className="mobile-menu__item">
                  <Link
                    href={item.href}
                    className={`mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mobile-menu__footer">
          {ctaItem && (
            <Link href={ctaItem.href} className="mobile-menu__cta">
              {ctaItem.label}
            </Link>
          )}

          {langItem && (
            <Link href={langItem.href} className="mobile-menu__lang">
              {langItem.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
