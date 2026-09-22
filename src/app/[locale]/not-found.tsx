'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isLocale, DEFAULT_LOCALE } from '@/types/locale';

export default function NotFound() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const locale = isLocale(segments[1]) ? segments[1] : DEFAULT_LOCALE;

  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Page not found</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href={`/${locale}`}
        style={{
          display: 'inline-block',
          padding: '8px 24px',
          fontSize: '14px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      >
        Go to homepage
      </Link>
    </div>
  );
}
