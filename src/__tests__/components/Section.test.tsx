// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Eyebrow } from '@/components/ui/Eyebrow';

describe('Section', () => {
  it('renders children', () => {
    render(<Section>Content</Section>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders as section element by default', () => {
    const { container } = render(<Section>Content</Section>);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('applies primary background by default', () => {
    const { container } = render(<Section>Content</Section>);
    const section = container.querySelector('section');
    expect(section).toHaveStyle({
      backgroundColor: 'var(--color-bg-primary)',
    });
  });

  it('applies dark background', () => {
    const { container } = render(<Section background="dark">Content</Section>);
    const section = container.querySelector('section');
    expect(section).toHaveStyle({
      backgroundColor: 'var(--color-bg-dark)',
      color: 'var(--color-text-inverse)',
    });
  });

  it('applies secondary background', () => {
    const { container } = render(<Section background="secondary">Content</Section>);
    const section = container.querySelector('section');
    expect(section).toHaveStyle({
      backgroundColor: 'var(--color-bg-secondary)',
    });
  });

  it('applies custom className', () => {
    const { container } = render(<Section className="custom">Content</Section>);
    const section = container.querySelector('section');
    expect(section?.className).toContain('custom');
  });
});

describe('SectionHeader', () => {
  it('renders title', () => {
    render(<SectionHeader title="Heading" />);
    expect(screen.getByRole('heading', { name: 'Heading' })).toBeInTheDocument();
  });

  it('renders eyebrow when provided', () => {
    render(<SectionHeader eyebrow="Label" title="Heading" />);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<SectionHeader title="Heading" description="Description text" />);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('centers text when align is center', () => {
    render(<SectionHeader title="Heading" align="center" />);
    expect(screen.getByText('Heading').closest('div')).toHaveStyle({ textAlign: 'center' });
  });

  it('left-aligns text by default', () => {
    render(<SectionHeader title="Heading" />);
    expect(screen.getByText('Heading').closest('div')).toHaveStyle({ textAlign: 'left' });
  });
});

describe('Eyebrow', () => {
  it('renders text', () => {
    render(<Eyebrow>Label</Eyebrow>);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('applies text-label class', () => {
    render(<Eyebrow>Label</Eyebrow>);
    expect(screen.getByText('Label').className).toContain('text-label');
  });

  it('applies custom className', () => {
    render(<Eyebrow className="custom">Label</Eyebrow>);
    expect(screen.getByText('Label').className).toContain('custom');
  });
});
