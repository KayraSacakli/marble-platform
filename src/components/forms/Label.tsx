import type { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required = false, children, className = '', ...rest }: LabelProps) {
  return (
    <label className={`text-label ${className}`} style={{ display: 'block', marginBottom: 'var(--space-1)', color: 'var(--color-text-primary)' }} {...rest}>
      {children}
      {required && (
        <span style={{ color: 'var(--color-error)', marginLeft: 'var(--space-1)' }} aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
