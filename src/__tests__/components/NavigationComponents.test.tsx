// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DesktopNavigation } from '@/components/navigation/DesktopNavigation';
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher';

const mockPrimaryItems = [
  { label: 'Mermerler', href: '/tr/products', visible: true },
  { label: 'Koleksiyonlar', href: '/tr/collections', visible: true },
  { label: 'Uygulamalar', href: '/tr/applications', visible: true },
  { label: 'Projeler', href: '/tr/projects', visible: false },
  { label: 'Dergi', href: '/tr/journal', visible: true },
  { label: 'Hakkında', href: '/tr/about', visible: true },
];

const mockUtilityItems = [
  { label: 'TR', href: '/tr/products', visible: true, type: 'language_switch' },
  { label: 'EN', href: '/en/products', visible: true, type: 'language_switch' },
  { label: 'Teklif Talebi', href: '/tr/quote', visible: true, type: 'cta' },
  { label: 'İletişim', href: '/tr/contact', visible: true, type: 'link' },
];

describe('DesktopNavigation', () => {
  it('renders visible items only', () => {
    render(<DesktopNavigation items={mockPrimaryItems} locale="tr" currentPath="/tr" />);
    expect(screen.getByText('Mermerler')).toBeInTheDocument();
    expect(screen.getByText('Koleksiyonlar')).toBeInTheDocument();
    expect(screen.queryByText('Projeler')).not.toBeInTheDocument();
  });

  it('renders correct links', () => {
    render(<DesktopNavigation items={mockPrimaryItems} locale="tr" currentPath="/tr" />);
    const link = screen.getByText('Mermerler');
    expect(link).toHaveAttribute('href', '/tr/products');
  });

  it('has correct aria-label', () => {
    render(<DesktopNavigation items={mockPrimaryItems} locale="tr" currentPath="/tr" />);
    expect(screen.getByRole('navigation', { name: 'Ana navigasyon' })).toBeInTheDocument();
  });

  it('has correct aria-label for EN', () => {
    render(<DesktopNavigation items={mockPrimaryItems} locale="en" currentPath="/en" />);
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('marks active page', () => {
    render(<DesktopNavigation items={mockPrimaryItems} locale="tr" currentPath="/tr/products" />);
    const activeLink = screen.getByText('Mermerler');
    expect(activeLink).toHaveAttribute('aria-current', 'page');
  });

  it('renders all 5 visible items', () => {
    render(<DesktopNavigation items={mockPrimaryItems} locale="tr" currentPath="/tr" />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(5);
  });
});

describe('LanguageSwitcher', () => {
  it('renders language items', () => {
    render(<LanguageSwitcher items={mockUtilityItems} locale="tr" />);
    expect(screen.getByText('tr')).toBeInTheDocument();
    expect(screen.getByText('en')).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<LanguageSwitcher items={mockUtilityItems} locale="tr" />);
    expect(screen.getByRole('navigation', { name: 'Dil seçimi' })).toBeInTheDocument();
  });

  it('marks current language', () => {
    render(<LanguageSwitcher items={mockUtilityItems} locale="tr" />);
    const trLink = screen.getByText('tr');
    expect(trLink).toHaveAttribute('aria-current', 'true');
  });

  it('does not mark non-current language', () => {
    render(<LanguageSwitcher items={mockUtilityItems} locale="tr" />);
    const enLink = screen.getByText('en');
    expect(enLink).not.toHaveAttribute('aria-current');
  });

  it('links to correct locale', () => {
    render(<LanguageSwitcher items={mockUtilityItems} locale="tr" />);
    const enLink = screen.getByText('en');
    expect(enLink).toHaveAttribute('href', '/en/products');
  });

  it('returns null when no language items', () => {
    const { container } = render(<LanguageSwitcher items={[]} locale="tr" />);
    expect(container.firstChild).toBeNull();
  });
});
