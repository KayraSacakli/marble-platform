import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ error = false, className = '', children, ...rest }, ref) {
    return (
      <select
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
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%235A5A5A' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '36px',
          transition: 'border-color var(--duration-fast) var(--easing-default)',
        }}
        {...rest}
      >
        {children}
      </select>
    );
  },
);
