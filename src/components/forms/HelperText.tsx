interface HelperTextProps {
  children: React.ReactNode;
  className?: string;
}

export function HelperText({ children, className = '' }: HelperTextProps) {
  return (
    <p className={`text-caption ${className}`} style={{ color: 'var(--color-text-tertiary)', marginTop: 'var(--space-1)' }}>
      {children}
    </p>
  );
}
