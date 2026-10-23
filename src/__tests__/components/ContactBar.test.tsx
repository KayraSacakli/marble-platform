// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContactBar } from '@/components/contact/ContactBar';

const contact = {
  telHref: 'tel:+905321234567',
  display: '+90 532 123 45 67',
  whatsappDigits: '905321234567',
  instagramHref: 'https://www.instagram.com/marbleplatform',
};

const noContact = {
  telHref: null,
  display: null,
  whatsappDigits: null,
  instagramHref: null,
};

describe('ContactBar', () => {
  it('keeps every shortcut visible without any fake links when nothing is configured', () => {
    const { container } = render(<ContactBar locale="tr" contact={null} />);
    expect(screen.getByText('Ara')).toBeTruthy();
    expect(screen.getByText('WhatsApp')).toBeTruthy();
    expect(screen.getByText('Instagram')).toBeTruthy();
    expect(container.querySelectorAll('a')).toHaveLength(0);
  });

  it('renders a call link and a whatsapp link with accessible names', () => {
    const { container } = render(<ContactBar locale="tr" contact={contact} />);
    const call = screen.getByRole('link', { name: /Ara/ });
    expect(call.getAttribute('href')).toBe('tel:+905321234567');
    const whatsapp = screen.getByRole('link', { name: /WhatsApp/ });
    expect(whatsapp.getAttribute('href')).toContain('https://wa.me/905321234567?text=');
    expect(whatsapp.getAttribute('target')).toBe('_blank');
    const instagram = screen.getByRole('link', { name: /Instagram/ });
    expect(instagram.getAttribute('href')).toBe('https://www.instagram.com/marbleplatform');
    expect(instagram.getAttribute('target')).toBe('_blank');
    expect(container.querySelectorAll('a')).toHaveLength(3);
  });

  it('uses English labels for the en locale', () => {
    render(<ContactBar locale="en" contact={contact} />);
    expect(screen.getByRole('link', { name: /Call/ })).toBeTruthy();
    expect(screen.getByText('Instagram')).toBeTruthy();
  });

  it('renders the whatsapp shortcut without a link when no usable whatsapp digits exist', () => {
    const { container } = render(
      <ContactBar locale="tr" contact={{ ...contact, whatsappDigits: null }} />,
    );
    expect(screen.getByRole('link', { name: /Ara/ })).toBeTruthy();
    expect(screen.queryByRole('link', { name: /WhatsApp/ })).toBeNull();
    expect(screen.getByText('WhatsApp')).toBeTruthy();
    expect(container.querySelectorAll('a')).toHaveLength(2);
  });

  it('renders the call shortcut without a link when no phone is configured', () => {
    const { container } = render(
      <ContactBar locale="tr" contact={{ ...noContact, instagramHref: contact.instagramHref }} />,
    );
    expect(screen.queryByRole('link', { name: /Ara/ })).toBeNull();
    expect(screen.getByText('Ara')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Instagram/ })).toBeTruthy();
    expect(container.querySelectorAll('a')).toHaveLength(1);
  });
});
