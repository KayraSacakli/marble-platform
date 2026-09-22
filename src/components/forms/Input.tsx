import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ error = false, className = '', ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={className}
        aria-invalid={error || undefined}
        style={{
          display: 'block',
          width: '100%',
          height: 'var(--input-height)',
          padding: '0 var(--input-padding)',
          backgroundColor: 'var(--color-bg-white)',
          border: error ? '1px solid var(--color-error)' : 'var(--input-border)',
          borderRadius: 'var(--input-radius)',
          fontSize: 'var(--text-body)',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-primary)',
          outline: 'none',
          transition: 'border-color var(--duration-fast) var(--easing-default)',
        }}
        {...rest}
      />
    );
  },
);
