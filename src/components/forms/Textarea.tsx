import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ error = false, className = '', ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={className}
        aria-invalid={error || undefined}
        style={{
          display: 'block',
          width: '100%',
          minHeight: '120px',
          padding: 'var(--input-padding)',
          backgroundColor: 'var(--color-bg-white)',
          border: error ? '1px solid var(--color-error)' : 'var(--input-border)',
          borderRadius: 'var(--input-radius)',
          fontSize: 'var(--text-body)',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-primary)',
          outline: 'none',
          resize: 'vertical',
          transition: 'border-color var(--duration-fast) var(--easing-default)',
        }}
        {...rest}
      />
    );
  },
);
