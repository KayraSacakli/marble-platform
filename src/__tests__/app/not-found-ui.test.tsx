// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  usePathname: () => '/tr/products/missing-product',
}));

afterEach(() => {
  cleanup();
});

describe('Branded not-found UI (src/app/[locale]/not-found.tsx)', () => {
  it('renders the branded heading and copy', async () => {
    const NotFound = (await import('@/app/[locale]/not-found')).default;
    render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(
      screen.getByText('The page you are looking for does not exist or has been moved.'),
    ).toBeInTheDocument();
  });

  it('renders the branded homepage CTA', async () => {
    const NotFound = (await import('@/app/[locale]/not-found')).default;
    render(<NotFound />);
    expect(screen.getByRole('link', { name: 'Go to homepage' })).toHaveAttribute('href', '/tr');
  });
});
