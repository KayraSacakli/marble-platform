/**
 * Central configuration for the public call / WhatsApp / Instagram contact
 * options.
 *
 * No phone number or social handle is invented here: every shortcut renders
 * as a visible, non-link element until the operator provides a real value via
 * environment configuration. Add to `.env`:
 *
 *   SITE_CONTACT_PHONE=+90 5XX XXX XX XX
 *   SITE_WHATSAPP_PHONE=+90 5XX XXX XX XX   (optional; falls back to SITE_CONTACT_PHONE)
 *   SITE_INSTAGRAM_URL=https://www.instagram.com/your-handle
 *
 * All values are read server-side (locale layout) and passed to the client
 * bar as props — they never need a NEXT_PUBLIC_ prefix.
 */

const nonDigits = /[^0-9]/g;

export interface SiteContact {
  /** tel: href with a +CC number; null until a real number is configured. */
  telHref: string | null;
  /** Raw configured number for accessible labels / visible text; null when unset. */
  display: string | null;
  /** Digits (no +, no leading 00) for wa.me links; null when unusable. */
  whatsappDigits: string | null;
  /** Valid https Instagram profile URL; null when unset or invalid. */
  instagramHref: string | null;
}

function readInstagramHref(): string | null {
  const raw = process.env.SITE_INSTAGRAM_URL?.trim();
  if (!raw || !raw.startsWith('https://')) return null;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (
      host === 'instagram.com' ||
      host === 'www.instagram.com' ||
      host.endsWith('.instagram.com')
    ) {
      return url.toString();
    }
  } catch {
    return null;
  }
  return null;
}

export function getSiteContact(): SiteContact {
  const rawPhone = process.env.SITE_CONTACT_PHONE?.trim();
  const digits = rawPhone ? rawPhone.replace(nonDigits, '').replace(/^00/, '') : '';

  let telHref: string | null = null;
  let whatsappDigits: string | null = null;
  if (rawPhone && digits.length >= 7) {
    telHref = `tel:+${digits}`;
    const rawWhatsapp = process.env.SITE_WHATSAPP_PHONE?.trim() || rawPhone;
    const whatsapp = rawWhatsapp.replace(nonDigits, '').replace(/^00/, '');
    whatsappDigits = whatsapp.length >= 7 ? whatsapp : null;
  }

  return {
    telHref,
    display: rawPhone && telHref ? rawPhone : null,
    whatsappDigits,
    instagramHref: readInstagramHref(),
  };
}

export function buildWhatsappHref(digits: string, message: string): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
