// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { HeaderInteractive } from '@/components/navigation/HeaderInteractive';

const mockPrimaryItems = [
  { label: 'Mermerler', href: '/tr/products', visible: true },
  { label: 'Koleksiyonlar', href: '/tr/collections', visible: true },
];

const mockUtilityItems = [
  { label: 'Teklif Talebi', href: '/tr/quote', visible: true, type: 'cta' },
  { label: 'TR', href: '/tr/products', visible: true, type: 'language_switch' },
  { label: 'EN', href: '/en/products', visible: true, type: 'language_switch' },
];

describe('HeaderInteractive', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders brand logo', () => {
    render(
      <HeaderInteractive
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"
        currentPath="/tr"
      />,
    );
    expect(screen.getByText('Mermer')).toBeInTheDocument();
  });

  it('renders desktop navigation', () => {
    render(
      <HeaderInteractive
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"
        currentPath="/tr"
      />,
    );
    expect(screen.getByText('Mermerler')).toBeInTheDocument();
  });

  it('renders CTA link', () => {
    render(
      <HeaderInteractive
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"
        currentPath="/tr"
      />,
    );
    expect(screen.getByText('Teklif Talebi')).toBeInTheDocument();
  });

  it('renders hamburger button', () => {
    render(
      <HeaderInteractive
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"
        currentPath="/tr"
      />,
    );
    expect(screen.getByRole('button', { name: /menüyü aç/i })).toBeInTheDocument();
  });

  it('opens mobile menu on hamburger click', async () => {
    render(
      <HeaderInteractive
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"
        currentPath="/tr"
      />,
    );
    const trigger = screen.getByRole('button', { name: /menüyü aç/i });
    await act(async () => {
      trigger.click();
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders language switcher', () => {
    render(
      <HeaderInteractive
        primaryItems={mockPrimaryItems}
        utilityItems={mockUtilityItems}
        locale="tr"
        currentPath="/tr"
      />,
    );
    expect(screen.getByText('tr')).toBeInTheDocument();
    expect(screen.getByText('en')).toBeInTheDocument();
  });
});
