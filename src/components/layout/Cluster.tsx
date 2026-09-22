import type { ReactNode } from 'react';

type ClusterSpacing = 'sm' | 'md' | 'lg';

interface ClusterProps {
  children: ReactNode;
  spacing?: ClusterSpacing;
  align?: 'start' | 'center' | 'end';
  wrap?: boolean;
  as?: 'div' | 'ul' | 'nav';
  className?: string;
}

const spacingMap: Record<ClusterSpacing, string> = {
  sm: 'var(--space-3)',
  md: 'var(--space-4)',
  lg: 'var(--space-6)',
};

export function Cluster({
  children,
  spacing = 'md',
  align = 'center',
  wrap = true,
  as: Tag = 'div',
  className = '',
}: ClusterProps) {
  return (
    <Tag
      className={className}
      style={{
        display: 'flex',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        alignItems: align,
        gap: spacingMap[spacing],
      }}
    >
      {children}
    </Tag>
  );
}
