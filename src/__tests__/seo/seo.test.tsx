// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

function getLatestJsonLd(): Record<string, unknown> {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const last = scripts[scripts.length - 1];
  return JSON.parse(last!.textContent!);
}

describe('JSON-LD Components', () => {
  it('ProductJsonLd renders valid JSON', async () => {
    const { render } = await import('@testing-library/react');
    const { ProductJsonLd } = await import('@/components/seo/ProductJsonLd');

    render(<ProductJsonLd name="Test Product" url="/tr/products/test" />);
    const data = getLatestJsonLd();

    expect(data['@type']).toBe('Product');
    expect(data.name).toBe('Test Product');
    expect(data.url).toContain('/tr/products/test');
  });

  it('ArticleJsonLd renders valid JSON', async () => {
    const { render } = await import('@testing-library/react');
    const { ArticleJsonLd } = await import('@/components/seo/ArticleJsonLd');

    render(
      <ArticleJsonLd
        headline="Test Article"
        url="/tr/journal/test"
        datePublished="2026-01-15T00:00:00.000Z"
      />
    );
    const data = getLatestJsonLd();

    expect(data['@type']).toBe('Article');
    expect(data.headline).toBe('Test Article');
    expect(data.datePublished).toBe('2026-01-15T00:00:00.000Z');
  });

  it('BreadcrumbJsonLd renders valid JSON', async () => {
    const { render } = await import('@testing-library/react');
    const { BreadcrumbJsonLd } = await import('@/components/seo/BreadcrumbJsonLd');

    render(
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/tr' },
          { name: 'Products', href: '/tr/products' },
          { name: 'Test' },
        ]}
      />
    );
    const data = getLatestJsonLd();

    expect(data['@type']).toBe('BreadcrumbList');
    expect((data.itemListElement as unknown[])).toHaveLength(3);
  });

  it('OrganizationJsonLd renders valid JSON', async () => {
    const { render } = await import('@testing-library/react');
    const { OrganizationJsonLd } = await import('@/components/seo/OrganizationJsonLd');

    render(<OrganizationJsonLd />);
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    const orgScript = Array.from(scripts).find((s) => {
      try {
        return JSON.parse(s.textContent!)['@type'] === 'Organization';
      } catch {
        return false;
      }
    });
    expect(orgScript).toBeDefined();

    const data = JSON.parse(orgScript!.textContent!);
    expect(data.name).toBeDefined();
    expect(data.url).toBeDefined();
  });

  it('WebSiteJsonLd renders valid JSON', async () => {
    const { render } = await import('@testing-library/react');
    const { WebSiteJsonLd } = await import('@/components/seo/OrganizationJsonLd');

    render(<WebSiteJsonLd locale="tr" />);
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');

    const siteScript = Array.from(scripts).find((s) => {
      try {
        return JSON.parse(s.textContent!)['@type'] === 'WebSite';
      } catch {
        return false;
      }
    });
    expect(siteScript).toBeDefined();

    const data = JSON.parse(siteScript!.textContent!);
    expect(data['@type']).toBe('WebSite');
    expect(data.inLanguage).toBe('tr');
  });
});
