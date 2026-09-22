import Link from 'next/link';

interface BrandLogoProps {
  locale: string;
  className?: string;
}

export function BrandLogo({ locale, className = '' }: BrandLogoProps) {
  return (
    <Link
      href={`/${locale}`}
      className={className}
      aria-label={locale === 'tr' ? 'Mermer Platformu — Ana sayfa' : 'Marble Platform — Homepage'}
      style={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-h4)',
          fontWeight: 'var(--weight-bold)',
          letterSpacing: 'var(--tracking-tight)',
          lineHeight: 1,
        }}
      >
        {locale === 'tr' ? 'Mermer' : 'Marble'}
      </span>
    </Link>
  );
}
