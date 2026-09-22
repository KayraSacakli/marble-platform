interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({ width, height, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      aria-hidden="true"
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-none)',
      }}
    />
  );
}
