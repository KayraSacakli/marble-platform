import Link from 'next/link';
import type { NavigationItem } from '@/types/api';

interface DesktopNavigationProps {
  items: NavigationItem[];
  locale: string;
  currentPath: string;
  className?: string;
}

export function DesktopNavigation({
  items,
  locale,
  currentPath,
  className = '',
}: DesktopNavigationProps) {
  const visibleItems = items.filter((item) => item.visible);

  return (
    <nav aria-label={locale === 'tr' ? 'Ana navigasyon' : 'Main navigation'} className={className}>
      <ul style={{ display: 'flex', gap: 'var(--space-6)', listStyle: 'none', margin: 0, padding: 0 }}>
        {visibleItems.map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body-small)',
                  fontWeight: 'var(--weight-medium)',
                  letterSpacing: 'var(--tracking-wide)',
                  textDecoration: 'none',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)',
                  transition: 'color var(--duration-fast) var(--easing-default)',
                  padding: 'var(--space-2) 0',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
