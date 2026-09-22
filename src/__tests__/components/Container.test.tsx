// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from '@/components/ui/Container';

describe('Container', () => {
  it('renders children', () => {
    render(<Container>Content</Container>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('defaults to lg max-width', () => {
    render(<Container>Content</Container>);
    const el = screen.getByText('Content');
    expect(el).toHaveStyle({ maxWidth: 'var(--container-lg)' });
  });

  it('applies sm size', () => {
    render(<Container size="sm">Content</Container>);
    expect(screen.getByText('Content')).toHaveStyle({ maxWidth: 'var(--container-sm)' });
  });

  it('applies xl size', () => {
    render(<Container size="xl">Content</Container>);
    expect(screen.getByText('Content')).toHaveStyle({ maxWidth: 'var(--container-xl)' });
  });

  it('renders as section element', () => {
    const { container } = render(<Container as="section">Content</Container>);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveTextContent('Content');
  });

  it('applies custom className', () => {
    render(<Container className="custom">Content</Container>);
    expect(screen.getByText('Content').className).toContain('custom');
  });

  it('applies horizontal padding', () => {
    render(<Container>Content</Container>);
    expect(screen.getByText('Content')).toHaveStyle({
      paddingLeft: 'var(--grid-margin)',
      paddingRight: 'var(--grid-margin)',
    });
  });
});
