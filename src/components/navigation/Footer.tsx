import Link from 'next/link';
import type { Locale } from '@/types/locale';
import { getFooter } from '@/lib/data/footer';

interface FooterProps {
  locale: Locale;
}

export async function Footer({ locale }: FooterProps) {
  let footerData: {
    company: Array<{ label: string; href: string; visible: boolean }>;
    catalogue: Array<{ label: string; href: string; visible: boolean }>;
    conversion: Array<{ label: string; href: string; visible: boolean }>;
    legal: Array<{ label: string; href: string; visible: boolean }>;
    language: Array<{ label: string; href: string; active: boolean; available: boolean }>;
    copyright: string;
  } | null = null;

  try {
    footerData = await getFooter(locale);
  } catch {
    footerData = null;
  }

  if (!footerData) {
    return (
      <footer className="footer" role="contentinfo">
        <div className="footer__inner">
          <p className="footer__copyright">&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    );
  }

  const visibleCompany = footerData.company.filter((l) => l.visible);
  const visibleCatalogue = footerData.catalogue.filter((l) => l.visible);
  const visibleConversion = footerData.conversion.filter((l) => l.visible);
  const visibleLegal = footerData.legal.filter((l) => l.visible);

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <div className="footer__grid">
          {visibleCompany.length > 0 && (
            <div className="footer__group">
              <h3 className="footer__heading">
                {locale === 'tr' ? 'Şirket' : 'Company'}
              </h3>
              <ul className="footer__list">
                {visibleCompany.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {visibleCatalogue.length > 0 && (
            <div className="footer__group">
              <h3 className="footer__heading">
                {locale === 'tr' ? 'Katalog' : 'Catalogue'}
              </h3>
              <ul className="footer__list">
                {visibleCatalogue.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {visibleConversion.length > 0 && (
            <div className="footer__group">
              <h3 className="footer__heading">
                {locale === 'tr' ? 'İletişim' : 'Contact'}
              </h3>
              <ul className="footer__list">
                {visibleConversion.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {visibleLegal.length > 0 && (
            <div className="footer__group">
              <h3 className="footer__heading">
                {locale === 'tr' ? 'Yasal' : 'Legal'}
              </h3>
              <ul className="footer__list">
                {visibleLegal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">{footerData.copyright}</p>
          {footerData.language.length > 0 && (
            <nav aria-label={locale === 'tr' ? 'Dil seçimi' : 'Language switch'}>
              <ul className="footer__lang">
                {footerData.language.map((lang) => (
                  <li key={lang.href}>
                    <Link
                      href={lang.href}
                      className={`footer__lang-link ${lang.active ? 'footer__lang-link--active' : ''}`}
                      aria-current={lang.active ? 'page' : undefined}
                    >
                      {lang.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
