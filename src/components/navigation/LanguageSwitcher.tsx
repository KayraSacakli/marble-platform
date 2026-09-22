import Link from 'next/link';
import type { UtilityNavigationItem } from '@/types/api';
import { isLocale, getLocaleNativeName } from '@/types/locale';

interface LanguageSwitcherProps {
  items: UtilityNavigationItem[];
  locale: string;
  className?: string;
}

export function LanguageSwitcher({ items, locale, className = '' }: LanguageSwitcherProps) {
  const languageItems = items.filter((item) => item.type === 'language_switch' && item.visible);

  if (languageItems.length === 0) return null;

  function extractLocaleFromHref(href: string): string | null {
    const segments = href.split('/').filter(Boolean);
    if (segments.length > 0 && isLocale(segments[0])) {
      return segments[0];
    }
    return null;
  }

  return (
    <nav aria-label={locale === 'tr' ? 'Dil seçimi' : 'Language switch'} className={className}>
      <ul style={{ display: 'flex', gap: 'var(--space-2)', listStyle: 'none', margin: 0, padding: 0 }}>
        {languageItems.map((item) => {
          const itemLocale = extractLocaleFromHref(item.href);
          if (!itemLocale) return null;
          const isCurrent = itemLocale === locale;
          const nativeName = getLocaleNativeName(itemLocale as 'tr' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'ar');
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={nativeName}
                aria-current={isCurrent ? 'true' : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 'var(--weight-medium)',
                  letterSpacing: 'var(--tracking-wider)',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  padding: 'var(--space-1) var(--space-2)',
                  lineHeight: 1,
                  transition: 'color var(--duration-fast) var(--easing-default)',
                }}
              >
                {itemLocale}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
