interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function Eyebrow({ children, className = '' }: EyebrowProps) {
  return (
    <span className={`text-label ${className}`} style={{ color: 'var(--color-text-secondary)' }}>
      {children}
    </span>
  );
}
