import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildWhatsappHref, getSiteContact } from '@/lib/site-contact';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getSiteContact', () => {
  it('returns link-free contact data when no phone is configured', () => {
    vi.stubEnv('SITE_CONTACT_PHONE', '');
    vi.stubEnv('SITE_INSTAGRAM_URL', '');
    const contact = getSiteContact();
    expect(contact.telHref).toBeNull();
    expect(contact.display).toBeNull();
    expect(contact.whatsappDigits).toBeNull();
    expect(contact.instagramHref).toBeNull();
  });

  it('returns link-free contact data for too-short numbers', () => {
    vi.stubEnv('SITE_CONTACT_PHONE', '+90 12');
    const contact = getSiteContact();
    expect(contact.telHref).toBeNull();
    expect(contact.display).toBeNull();
    expect(contact.whatsappDigits).toBeNull();
  });

  it('builds tel and whatsapp data from a configured number', () => {
    vi.stubEnv('SITE_CONTACT_PHONE', '+90 532 123 45 67');
    const contact = getSiteContact();
    expect(contact.telHref).toBe('tel:+905321234567');
    expect(contact.display).toBe('+90 532 123 45 67');
    expect(contact.whatsappDigits).toBe('905321234567');
  });

  it('prefers a dedicated whatsapp number and strips 00 prefix', () => {
    vi.stubEnv('SITE_CONTACT_PHONE', '+90 532 123 45 67');
    vi.stubEnv('SITE_WHATSAPP_PHONE', '0090 532 999 88 77');
    const contact = getSiteContact();
    expect(contact.whatsappDigits).toBe('905329998877');
    expect(contact.telHref).toBe('tel:+905321234567');
  });

  it('accepts a valid https instagram profile URL', () => {
    vi.stubEnv('SITE_INSTAGRAM_URL', 'https://www.instagram.com/marbleplatform');
    expect(getSiteContact().instagramHref).toBe('https://www.instagram.com/marbleplatform');
  });

  it('rejects non-https or non-instagram URLs instead of producing fake links', () => {
    vi.stubEnv('SITE_INSTAGRAM_URL', 'http://www.instagram.com/marbleplatform');
    expect(getSiteContact().instagramHref).toBeNull();
    vi.stubEnv('SITE_INSTAGRAM_URL', 'https://example.com/fake');
    expect(getSiteContact().instagramHref).toBeNull();
    vi.stubEnv('SITE_INSTAGRAM_URL', 'javascript:alert(1)');
    expect(getSiteContact().instagramHref).toBeNull();
  });
});

describe('buildWhatsappHref', () => {
  it('url-encodes the prefilled message', () => {
    const href = buildWhatsappHref('905321234567', 'Merhaba, bilgi almak istiyorum.');
    expect(href).toBe(
      `https://wa.me/905321234567?text=${encodeURIComponent('Merhaba, bilgi almak istiyorum.')}`,
    );
  });
});
