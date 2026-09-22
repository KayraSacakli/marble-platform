// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileMenu } from '@/components/navigation/MobileMenu';

const mockPrimaryItems = [
  { label: 'Mermerler', href: '/tr/products', visible: true },
  { label: 'Koleksiyonlar', href: '/tr/collections', visible: true },
];

const mockUtilityItems = [
  { label: 'Teklif Talebi', href: '/tr/quote', visible: true, type: 'cta' },
  { label: 'TR / EN', href: '/en/products', visible: true, type: 'language_switch' },
];

describe('MobileMenu', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders when open', () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    expect(screen.getByText('Mermerler')).toBeInTheDocument();
    expect(screen.getByText('Koleksiyonlar')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <MobileMenu
        isOpen={false}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    expect(screen.queryByText('Mermerler')).not.toBeInTheDocument();
  });

  it('has role="dialog"', () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('has correct aria-label for TR', () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    expect(screen.getByRole('dialog', { name: 'Menü' })).toBeInTheDocument();
  });

  it('has correct aria-label for EN', () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="en"

      />,
    );
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument();
  });

  it('locks body scroll when open', () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('unlocks body scroll when closed', () => {
    const { rerender } = render(
      <MobileMenu
        isOpen={true}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <MobileMenu
        isOpen={false}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <MobileMenu
        isOpen={true}
        onClose={onClose}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders CTA link', () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    expect(screen.getByText('Teklif Talebi')).toBeInTheDocument();
  });

  it('renders language link', () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    expect(screen.getByText('TR / EN')).toBeInTheDocument();
  });

  it('renders nav landmark', () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    expect(screen.getByRole('navigation', { name: 'Ana navigasyon' })).toBeInTheDocument();
  });

  it('has close button with aria-label', () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={vi.fn()}
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"

      />,
    );
    expect(screen.getByRole('button', { name: 'Menüyü kapat' })).toBeInTheDocument();
  });
});
