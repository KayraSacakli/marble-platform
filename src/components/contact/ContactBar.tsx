'use client';

import type { SiteContact } from '@/lib/site-contact';
import { buildWhatsappHref } from '@/lib/site-contact';

interface ContactBarProps {
  locale: string;
  contact: SiteContact | null;
}

const MESSAGES: Record<string, string> = {
  tr: 'Mermer ürünleriniz ve teklif hakkında bilgi almak istiyorum.',
  en: 'I would like to learn more about your marble products and request a quote.',
};

const LABELS: Record<string, { call: string; whatsapp: string; instagram: string; group: string }> =
  {
    tr: {
      call: 'Ara',
      whatsapp: 'WhatsApp',
      instagram: 'Instagram',
      group: 'İletişim kısayolları',
    },
    en: { call: 'Call', whatsapp: 'WhatsApp', instagram: 'Instagram', group: 'Contact shortcuts' },
  };

const EMPTY_CONTACT: SiteContact = {
  telHref: null,
  display: null,
  whatsappDigits: null,
  instagramHref: null,
};

function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/**
 * Persistent call / WhatsApp / Instagram shortcuts. Every shortcut stays
 * visible, but renders as a plain (non-link) element until the operator
 * configures a real value — no fake tel:, wa.me or profile URLs are ever
 * produced. Mobile: compact bottom bar with safe-area padding. Desktop: small
 * corner pills that never cover the content.
 */
export function ContactBar({ locale, contact }: ContactBarProps) {
  const active = contact ?? EMPTY_CONTACT;
  const labels = LABELS[locale] ?? LABELS.en;
  const message = MESSAGES[locale] ?? MESSAGES.en;

  const showCall = active.telHref !== null && active.display !== null;
  const showWhatsapp = active.whatsappDigits !== null;
  const showInstagram = active.instagramHref !== null;

  return (
    <div className="contact-bar" role="group" aria-label={labels.group}>
      {showCall ? (
        <a
          className="contact-bar__btn contact-bar__btn--call"
          href={active.telHref!}
          aria-label={`${labels.call} — ${active.display}`}
        >
          <PhoneIcon />
          <span className="contact-bar__label">{labels.call}</span>
        </a>
      ) : (
        <span
          className="contact-bar__btn contact-bar__btn--call contact-bar__btn--pending"
          aria-disabled="true"
        >
          <PhoneIcon />
          <span className="contact-bar__label">{labels.call}</span>
        </span>
      )}

      {showWhatsapp ? (
        <a
          className="contact-bar__btn contact-bar__btn--whatsapp"
          href={buildWhatsappHref(active.whatsappDigits!, message)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${labels.whatsapp} — ${active.display ?? ''}`.trim()}
        >
          <WhatsAppIcon />
          <span className="contact-bar__label">{labels.whatsapp}</span>
        </a>
      ) : (
        <span
          className="contact-bar__btn contact-bar__btn--whatsapp contact-bar__btn--pending"
          aria-disabled="true"
        >
          <WhatsAppIcon />
          <span className="contact-bar__label">{labels.whatsapp}</span>
        </span>
      )}

      {showInstagram ? (
        <a
          className="contact-bar__btn contact-bar__btn--instagram"
          href={active.instagramHref!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labels.instagram}
        >
          <InstagramIcon />
          <span className="contact-bar__label">{labels.instagram}</span>
        </a>
      ) : (
        <span
          className="contact-bar__btn contact-bar__btn--instagram contact-bar__btn--pending"
          aria-disabled="true"
        >
          <InstagramIcon />
          <span className="contact-bar__label">{labels.instagram}</span>
        </span>
      )}
    </div>
  );
}
