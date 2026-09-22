interface ErrorMessageProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function ErrorMessage({ children, id, className = '' }: ErrorMessageProps) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={`text-caption ${className}`}
      style={{ color: 'var(--color-error)', marginTop: 'var(--space-1)' }}
    >
      {children}
    </p>
  );
}
