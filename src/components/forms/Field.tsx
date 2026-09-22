import type { ReactNode } from 'react';
import { Label } from './Label';
import { HelperText } from './HelperText';
import { ErrorMessage } from './ErrorMessage';

interface FieldProps {
  children: ReactNode;
  label?: string;
  name: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
}

export function Field({
  children,
  label,
  name,
  required = false,
  helperText,
  error,
  className = '',
}: FieldProps) {
  const errorId = `${name}-error`;
  const hasError = Boolean(error);

  return (
    <div className={className} style={{ marginBottom: 'var(--space-4)' }}>
      {label && (
        <Label htmlFor={name} required={required}>
          {label}
        </Label>
      )}
      {children}
      {helperText && !hasError && <HelperText>{helperText}</HelperText>}
      {hasError && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
    </div>
  );
}
