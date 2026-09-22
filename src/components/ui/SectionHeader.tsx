interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}: SectionHeaderProps) {
  const textAlign = align === 'center' ? 'center' : 'left';

  return (
    <div className={className} style={{ textAlign, maxWidth: 'var(--text-measure)' }}>
      {eyebrow && (
        <span
          className="text-label"
          style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-3)' }}
        >
          {eyebrow}
        </span>
      )}
      <h2 className="text-h2" style={{ marginBottom: description ? 'var(--space-4)' : undefined }}>
        {title}
      </h2>
      {description && (
        <p className="text-body-large" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      )}
    </div>
  );
}
