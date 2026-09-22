// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AspectRatio } from '@/components/media/AspectRatio';
import { Skeleton } from '@/components/feedback/Skeleton';

describe('AspectRatio', () => {
  it('renders children', () => {
    render(
      <AspectRatio>
        <div>Content</div>
      </AspectRatio>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies 16/9 ratio by default', () => {
    render(
      <AspectRatio>
        <div>Content</div>
      </AspectRatio>,
    );
    expect(screen.getByText('Content').parentElement).toHaveStyle({
      aspectRatio: '16 / 9',
    });
  });

  it('applies 4/3 ratio', () => {
    render(
      <AspectRatio ratio="4/3">
        <div>Content</div>
      </AspectRatio>,
    );
    expect(screen.getByText('Content').parentElement).toHaveStyle({
      aspectRatio: '4 / 3',
    });
  });

  it('applies overflow hidden', () => {
    render(
      <AspectRatio>
        <div>Content</div>
      </AspectRatio>,
    );
    expect(screen.getByText('Content').parentElement).toHaveStyle({
      overflow: 'hidden',
    });
  });
});

describe('Skeleton', () => {
  it('renders', () => {
    render(<Skeleton />);
    const skeleton = document.querySelector('.skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('has aria-hidden', () => {
    render(<Skeleton />);
    const skeleton = document.querySelector('.skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies default dimensions', () => {
    render(<Skeleton />);
    const skeleton = document.querySelector('.skeleton');
    expect(skeleton).toHaveStyle({ width: '100%' });
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies custom width and height', () => {
    render(<Skeleton width="200px" height="40px" />);
    const skeleton = document.querySelector('.skeleton');
    expect(skeleton).toHaveStyle({ width: '200px', height: '40px' });
  });
});
