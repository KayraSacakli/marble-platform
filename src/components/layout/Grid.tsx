import type { ReactNode } from 'react';

type GridColumns = 2 | 3 | 4 | 6 | 12;

interface GridProps {
  children: ReactNode;
  columns?: GridColumns;
  gap?: 'sm' | 'md' | 'lg';
  as?: 'div' | 'ul' | 'ol';
  className?: string;
}

const gapMap = {
  sm: 'var(--space-4)',
  md: 'var(--grid-gutter)',
  lg: 'var(--space-6)',
};

export function Grid({
  children,
  columns = 12,
  gap = 'md',
  as: Tag = 'div',
  className = '',
}: GridProps) {
  return (
    <Tag
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gapMap[gap],
      }}
    >
      {children}
    </Tag>
  );
}
