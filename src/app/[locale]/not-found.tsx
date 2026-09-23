'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isLocale, DEFAULT_LOCALE } from '@/types/locale';

export default function NotFound() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const locale = isLocale(segments[1]) ? segments[1] : DEFAULT_LOCALE;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: 'var(--space-8) var(--grid-margin)',
        textAlign: 'center',
      }}
    >
      <h1 className="text-h2" style={{ marginBottom: 'var(--space-4)' }}>
        Page not found
      </h1>
      <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', maxWidth: '40ch' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href={`/${locale}`}
        className="button button--primary button--md"
      >
        Go to homepage
      </Link>
    </div>
  );
}
