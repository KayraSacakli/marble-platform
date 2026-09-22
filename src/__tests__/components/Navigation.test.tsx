// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipNavigation } from '@/components/navigation/SkipNavigation';
import { BrandLogo } from '@/components/navigation/BrandLogo';

describe('SkipNavigation', () => {
  it('renders skip link', () => {
    render(<SkipNavigation />);
    expect(screen.getByText('Skip to content')).toBeInTheDocument();
  });

  it('links to main-content', () => {
    render(<SkipNavigation />);
    const link = screen.getByText('Skip to content');
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('has skip-to-content class', () => {
    render(<SkipNavigation />);
    expect(screen.getByText('Skip to content').className).toContain('skip-to-content');
  });
});

describe('BrandLogo', () => {
  it('renders TR brand', () => {
    render(<BrandLogo locale="tr" />);
    expect(screen.getByText('Mermer')).toBeInTheDocument();
  });

  it('renders EN brand', () => {
    render(<BrandLogo locale="en" />);
    expect(screen.getByText('Marble')).toBeInTheDocument();
  });

  it('links to homepage', () => {
    render(<BrandLogo locale="tr" />);
    const link = screen.getByText('Mermer').closest('a');
    expect(link).toHaveAttribute('href', '/tr');
  });

  it('has accessible aria-label for TR', () => {
    render(<BrandLogo locale="tr" />);
    const link = screen.getByText('Mermer').closest('a');
    expect(link).toHaveAttribute('aria-label', 'Mermer Platformu — Ana sayfa');
  });

  it('has accessible aria-label for EN', () => {
    render(<BrandLogo locale="en" />);
    const link = screen.getByText('Marble').closest('a');
    expect(link).toHaveAttribute('aria-label', 'Marble Platform — Homepage');
  });

  it('applies custom className', () => {
    render(<BrandLogo locale="tr" className="custom" />);
    const link = screen.getByText('Mermer').closest('a');
    expect(link?.className).toContain('custom');
  });
});
