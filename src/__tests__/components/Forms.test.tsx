// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/forms/Label';
import { HelperText } from '@/components/forms/HelperText';
import { ErrorMessage } from '@/components/forms/ErrorMessage';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';

describe('Label', () => {
  it('renders text', () => {
    render(<Label>Name</Label>);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('shows required asterisk when required', () => {
    render(<Label required>Name</Label>);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('hides asterisk when not required', () => {
    render(<Label>Name</Label>);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('applies text-label class', () => {
    render(<Label>Name</Label>);
    expect(screen.getByText('Name').className).toContain('text-label');
  });
});

describe('HelperText', () => {
  it('renders text', () => {
    render(<HelperText>Help text</HelperText>);
    expect(screen.getByText('Help text')).toBeInTheDocument();
  });

  it('applies text-caption class', () => {
    render(<HelperText>Help</HelperText>);
    expect(screen.getByText('Help').className).toContain('text-caption');
  });
});

describe('ErrorMessage', () => {
  it('renders text', () => {
    render(<ErrorMessage>Error occurred</ErrorMessage>);
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    render(<ErrorMessage>Error occurred</ErrorMessage>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has aria-live="polite"', () => {
    render(<ErrorMessage>Error occurred</ErrorMessage>);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('applies error color', () => {
    render(<ErrorMessage>Error</ErrorMessage>);
    expect(screen.getByText('Error')).toHaveStyle({ color: 'var(--color-error)' });
  });
});

describe('Field', () => {
  it('renders children', () => {
    render(<Field name="test"><input /></Field>);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Field name="test" label="Email"><input /></Field>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders helper text when provided', () => {
    render(<Field name="test" helperText="Enter email"><input /></Field>);
    expect(screen.getByText('Enter email')).toBeInTheDocument();
  });

  it('renders error when provided', () => {
    render(<Field name="test" error="Required"><input /></Field>);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('hides helper text when error is shown', () => {
    render(<Field name="test" helperText="Help" error="Error"><input /></Field>);
    expect(screen.queryByText('Help')).not.toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});

describe('Input', () => {
  it('renders as text input', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('sets aria-invalid when error is true', () => {
    render(<Input error />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when error is false', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('applies full width', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toHaveStyle({ width: '100%' });
  });
});

describe('Textarea', () => {
  it('renders as textarea', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('sets aria-invalid when error is true', () => {
    render(<Textarea error />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Select', () => {
  it('renders as combobox', () => {
    render(<Select><option>A</option></Select>);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('sets aria-invalid when error is true', () => {
    render(<Select error><option>A</option></Select>);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });
});
