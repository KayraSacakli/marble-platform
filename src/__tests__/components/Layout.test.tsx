// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from '@/components/layout/Grid';
import { Stack } from '@/components/layout/Stack';
import { Cluster } from '@/components/layout/Cluster';

describe('Grid', () => {
  it('renders children', () => {
    render(
      <Grid columns={12}>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('applies 12-column grid by default', () => {
    render(<Grid><div>Item</div></Grid>);
    expect(screen.getByText('Item').parentElement).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
    });
  });

  it('applies custom column count', () => {
    render(<Grid columns={4}><div>Item</div></Grid>);
    expect(screen.getByText('Item').parentElement).toHaveStyle({
      gridTemplateColumns: 'repeat(4, 1fr)',
    });
  });

  it('applies md gap by default', () => {
    render(<Grid><div>Item</div></Grid>);
    expect(screen.getByText('Item').parentElement).toHaveStyle({
      gap: 'var(--grid-gutter)',
    });
  });

  it('applies sm gap', () => {
    render(<Grid gap="sm"><div>Item</div></Grid>);
    expect(screen.getByText('Item').parentElement).toHaveStyle({
      gap: 'var(--space-4)',
    });
  });
});

describe('Stack', () => {
  it('renders children', () => {
    render(
      <Stack>
        <div>A</div>
        <div>B</div>
      </Stack>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('applies flex column layout', () => {
    render(<Stack><div>Item</div></Stack>);
    expect(screen.getByText('Item').parentElement).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
    });
  });

  it('applies md spacing by default', () => {
    render(<Stack><div>Item</div></Stack>);
    expect(screen.getByText('Item').parentElement).toHaveStyle({
      gap: 'var(--space-6)',
    });
  });

  it('applies sm spacing', () => {
    render(<Stack spacing="sm"><div>Item</div></Stack>);
    expect(screen.getByText('Item').parentElement).toHaveStyle({
      gap: 'var(--space-4)',
    });
  });
});

describe('Cluster', () => {
  it('renders children', () => {
    render(
      <Cluster>
        <span>A</span>
        <span>B</span>
      </Cluster>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('applies flex wrap layout', () => {
    render(<Cluster><span>Item</span></Cluster>);
    expect(screen.getByText('Item').parentElement).toHaveStyle({
      display: 'flex',
      flexWrap: 'wrap',
    });
  });

  it('applies md gap by default', () => {
    render(<Cluster><span>Item</span></Cluster>);
    expect(screen.getByText('Item').parentElement).toHaveStyle({
      gap: 'var(--space-4)',
    });
  });
});
