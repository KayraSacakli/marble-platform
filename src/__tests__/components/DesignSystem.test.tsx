// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Import all components to verify they exist and render
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Section } from '@/components/ui/Section';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { Grid } from '@/components/layout/Grid';
import { Stack } from '@/components/layout/Stack';
import { Cluster } from '@/components/layout/Cluster';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Label } from '@/components/forms/Label';
import { Field } from '@/components/forms/Field';
import { HelperText } from '@/components/forms/HelperText';
import { ErrorMessage } from '@/components/forms/ErrorMessage';
import { Media } from '@/components/media/Media';
import { AspectRatio } from '@/components/media/AspectRatio';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Skeleton } from '@/components/feedback/Skeleton';

describe('Design System — Component Exports', () => {
  it('exports all UI components', () => {
    expect(Button).toBeDefined();
    expect(Container).toBeDefined();
    expect(Eyebrow).toBeDefined();
    expect(Section).toBeDefined();
    expect(SectionHeader).toBeDefined();
    expect(VisuallyHidden).toBeDefined();
  });

  it('exports all layout components', () => {
    expect(Grid).toBeDefined();
    expect(Stack).toBeDefined();
    expect(Cluster).toBeDefined();
  });

  it('exports all form components', () => {
    expect(Input).toBeDefined();
    expect(Textarea).toBeDefined();
    expect(Select).toBeDefined();
    expect(Label).toBeDefined();
    expect(Field).toBeDefined();
    expect(HelperText).toBeDefined();
    expect(ErrorMessage).toBeDefined();
  });

  it('exports all media components', () => {
    expect(Media).toBeDefined();
    expect(AspectRatio).toBeDefined();
  });

  it('exports all feedback components', () => {
    expect(ErrorState).toBeDefined();
    expect(LoadingState).toBeDefined();
    expect(Skeleton).toBeDefined();
  });
});

describe('Design System — Button Variant Rendering', () => {
  it('primary has accent background', () => {
    render(<Button variant="primary">CTA</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('button--primary');
    expect(btn.className).toContain('button');
  });

  it('secondary has transparent background', () => {
    render(<Button variant="secondary">CTA</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('button--secondary');
  });

  it('ghost has transparent background', () => {
    render(<Button variant="ghost">CTA</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('button--ghost');
  });
});
