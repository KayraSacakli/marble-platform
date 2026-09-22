import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/v1/public/[locale]/homepage/route';
import { GET as GET_NAV } from '@/app/api/v1/public/[locale]/navigation/route';
import { GET as GET_FOOTER } from '@/app/api/v1/public/[locale]/footer/route';
import { callHandler, mockHomepage, mockNavigation, mockFooter } from './helpers';

vi.mock('@/services/content', () => ({
  contentService: {
    getHomepage: vi.fn(),
    getNavigation: vi.fn(),
    getFooter: vi.fn(),
  },
}));

const { contentService } = await import('@/services/content');

describe('GET /api/v1/public/[locale]/homepage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns homepage with correct structure', async () => {
    (contentService.getHomepage as ReturnType<typeof vi.fn>).mockResolvedValue(mockHomepage);

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/homepage', { locale: 'tr' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.data.hero).toBeDefined();
    expect(json.data.sections).toBeDefined();
    expect(json.data.sectionOrder).toBeDefined();
    expect(json.data.seo).toBeDefined();
  });

  it('returns hero content with CTAs', async () => {
    (contentService.getHomepage as ReturnType<typeof vi.fn>).mockResolvedValue(mockHomepage);

    const res = await callHandler(GET, 'http://localhost/api/v1/public/en/homepage', { locale: 'en' });
    const json = await res.json();

    expect(json.data.hero.heading).toBeDefined();
    expect(json.data.hero.subheading).toBeDefined();
    expect(json.data.hero.primaryCTA).toBeDefined();
    expect(json.data.hero.primaryCTA.label).toBeDefined();
    expect(json.data.hero.primaryCTA.href).toBeDefined();
    expect(json.data.hero.secondaryCTA).toBeDefined();
  });

  it('returns sections array with type field', async () => {
    (contentService.getHomepage as ReturnType<typeof vi.fn>).mockResolvedValue(mockHomepage);

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/homepage', { locale: 'tr' });
    const json = await res.json();

    expect(Array.isArray(json.data.sections)).toBe(true);
    json.data.sections.forEach((section: { type: string }) => {
      expect(section.type).toBeDefined();
      expect(typeof section.type).toBe('string');
    });
  });

  it('returns sectionOrder matching sections count', async () => {
    (contentService.getHomepage as ReturnType<typeof vi.fn>).mockResolvedValue(mockHomepage);

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/homepage', { locale: 'tr' });
    const json = await res.json();

    expect(Array.isArray(json.data.sectionOrder)).toBe(true);
    expect(json.data.sectionOrder.length).toBe(json.data.sections.length);
  });

  it('includes final_cta section', async () => {
    (contentService.getHomepage as ReturnType<typeof vi.fn>).mockResolvedValue(mockHomepage);

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/homepage', { locale: 'tr' });
    const json = await res.json();

    const ctaSection = json.data.sections.find((s: { type: string }) => s.type === 'final_cta');
    expect(ctaSection).toBeDefined();
    expect(ctaSection.heading).toBeDefined();
    expect(ctaSection.primaryCTA).toBeDefined();
    expect(ctaSection.secondaryCTA).toBeDefined();
  });

  it('returns minimal homepage when no content exists', async () => {
    const emptyHomepage = {
      hero: mockHomepage.hero,
      sections: [mockHomepage.sections[2]],
      sectionOrder: ['hero', 'final_cta'],
      seo: mockHomepage.seo,
    };
    (contentService.getHomepage as ReturnType<typeof vi.fn>).mockResolvedValue(emptyHomepage);

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/homepage', { locale: 'tr' });
    const json = await res.json();

    expect(json.data.sections.length).toBe(1);
    expect(json.data.sections[0].type).toBe('final_cta');
  });

  it('returns 400 for invalid locale', async () => {
    const res = await callHandler(GET, 'http://localhost/api/v1/public/xx/homepage', { locale: 'xx' });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe('BAD_REQUEST');
  });

  it('includes SEO data with hreflang', async () => {
    (contentService.getHomepage as ReturnType<typeof vi.fn>).mockResolvedValue(mockHomepage);

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/homepage', { locale: 'tr' });
    const json = await res.json();

    expect(json.data.seo.hreflang).toBeDefined();
    expect(Array.isArray(json.data.seo.hreflang)).toBe(true);
    expect(json.data.seo.hreflang.length).toBeGreaterThanOrEqual(2);
  });

  it('does not expose internal fields', async () => {
    (contentService.getHomepage as ReturnType<typeof vi.fn>).mockResolvedValue(mockHomepage);

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/homepage', { locale: 'tr' });
    const str = JSON.stringify(await res.json());

    expect(str).not.toContain('internalUser');
    expect(str).not.toContain('approval');
    expect(str).not.toContain('revision');
    expect(str).not.toContain('auditEvent');
  });
});

describe('GET /api/v1/public/[locale]/navigation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns navigation with primary and utility arrays', async () => {
    (contentService.getNavigation as ReturnType<typeof vi.fn>).mockResolvedValue(mockNavigation);

    const res = await callHandler(GET_NAV, 'http://localhost/api/v1/public/tr/navigation', { locale: 'tr' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.primary).toBeDefined();
    expect(Array.isArray(json.data.primary)).toBe(true);
    expect(json.data.utility).toBeDefined();
    expect(Array.isArray(json.data.utility)).toBe(true);
  });

  it('returns TR navigation with correct labels', async () => {
    (contentService.getNavigation as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockNavigation,
      primary: [{ label: 'Mermerler', href: '/tr/products', visible: true }],
    });

    const res = await callHandler(GET_NAV, 'http://localhost/api/v1/public/tr/navigation', { locale: 'tr' });
    const json = await res.json();

    expect(json.data.primary[0].label).toBe('Mermerler');
    expect(contentService.getNavigation).toHaveBeenCalledWith('tr');
  });

  it('returns EN navigation with correct labels', async () => {
    (contentService.getNavigation as ReturnType<typeof vi.fn>).mockResolvedValue(mockNavigation);

    const res = await callHandler(GET_NAV, 'http://localhost/api/v1/public/en/navigation', { locale: 'en' });
    const json = await res.json();

    expect(json.data.primary[0].label).toBe('Marbles');
    expect(contentService.getNavigation).toHaveBeenCalledWith('en');
  });

  it('each nav item has label, href, visible', async () => {
    (contentService.getNavigation as ReturnType<typeof vi.fn>).mockResolvedValue(mockNavigation);

    const res = await callHandler(GET_NAV, 'http://localhost/api/v1/public/tr/navigation', { locale: 'tr' });
    const json = await res.json();

    json.data.primary.forEach((item: { label: string; href: string; visible: boolean }) => {
      expect(item.label).toBeDefined();
      expect(item.href).toBeDefined();
      expect(typeof item.visible).toBe('boolean');
    });
  });

  it('includes language switch in utility', async () => {
    (contentService.getNavigation as ReturnType<typeof vi.fn>).mockResolvedValue(mockNavigation);

    const res = await callHandler(GET_NAV, 'http://localhost/api/v1/public/tr/navigation', { locale: 'tr' });
    const json = await res.json();

    const langSwitch = json.data.utility.find((u: { type: string }) => u.type === 'language_switch');
    expect(langSwitch).toBeDefined();
    expect(langSwitch.href).toBeDefined();
  });

  it('returns 400 for invalid locale', async () => {
    const res = await callHandler(GET_NAV, 'http://localhost/api/v1/public/xx/navigation', { locale: 'xx' });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe('BAD_REQUEST');
  });
});

describe('GET /api/v1/public/[locale]/footer', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns footer with all link groups', async () => {
    (contentService.getFooter as ReturnType<typeof vi.fn>).mockResolvedValue(mockFooter);

    const res = await callHandler(GET_FOOTER, 'http://localhost/api/v1/public/tr/footer', { locale: 'tr' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.company).toBeDefined();
    expect(json.data.catalogue).toBeDefined();
    expect(json.data.conversion).toBeDefined();
    expect(json.data.legal).toBeDefined();
    expect(json.data.language).toBeDefined();
    expect(json.data.copyright).toBeDefined();
  });

  it('returns TR footer with correct labels', async () => {
    (contentService.getFooter as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockFooter,
      company: [{ label: 'Hakkinda', href: '/tr/about', visible: true }],
    });

    const res = await callHandler(GET_FOOTER, 'http://localhost/api/v1/public/tr/footer', { locale: 'tr' });
    const json = await res.json();

    expect(json.data.company[0].label).toBe('Hakkinda');
    expect(contentService.getFooter).toHaveBeenCalledWith('tr');
  });

  it('returns EN footer with correct labels', async () => {
    (contentService.getFooter as ReturnType<typeof vi.fn>).mockResolvedValue(mockFooter);

    const res = await callHandler(GET_FOOTER, 'http://localhost/api/v1/public/en/footer', { locale: 'en' });
    const json = await res.json();

    expect(json.data.company[0].label).toBe('About');
    expect(contentService.getFooter).toHaveBeenCalledWith('en');
  });

  it('returns language links with active flag', async () => {
    (contentService.getFooter as ReturnType<typeof vi.fn>).mockResolvedValue(mockFooter);

    const res = await callHandler(GET_FOOTER, 'http://localhost/api/v1/public/en/footer', { locale: 'en' });
    const json = await res.json();

    expect(json.data.language).toBeDefined();
    expect(Array.isArray(json.data.language)).toBe(true);
    expect(json.data.language.length).toBeGreaterThanOrEqual(2);

    const enLang = json.data.language.find((l: { label: string }) => l.label === 'English');
    expect(enLang).toBeDefined();
    expect(enLang.active).toBe(true);
  });

  it('each link group has label, href, visible', async () => {
    (contentService.getFooter as ReturnType<typeof vi.fn>).mockResolvedValue(mockFooter);

    const res = await callHandler(GET_FOOTER, 'http://localhost/api/v1/public/tr/footer', { locale: 'tr' });
    const json = await res.json();

    [...json.data.company, ...json.data.catalogue, ...json.data.conversion].forEach(
      (item: { label: string; href: string; visible: boolean }) => {
        expect(item.label).toBeDefined();
        expect(item.href).toBeDefined();
        expect(typeof item.visible).toBe('boolean');
      }
    );
  });

  it('returns 400 for invalid locale', async () => {
    const res = await callHandler(GET_FOOTER, 'http://localhost/api/v1/public/xx/footer', { locale: 'xx' });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe('BAD_REQUEST');
  });
});
