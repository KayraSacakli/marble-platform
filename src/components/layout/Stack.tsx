import type { ReactNode } from 'react';

type StackSpacing = 'sm' | 'md' | 'lg' | 'none';

interface StackProps {
  children: ReactNode;
  spacing?: StackSpacing;
  as?: 'div' | 'ul' | 'ol' | 'nav';
  className?: string;
  style?: React.CSSProperties;
}

const spacingMap: Record<StackSpacing, string> = {
  none: '0',
  sm: 'var(--space-4)',
  md: 'var(--space-6)',
  lg: 'var(--space-8)',
};

export function Stack({
  children,
  spacing = 'md',
  as: Tag = 'div',
  className = '',
  style,
}: StackProps) {
  return (
    <Tag
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacingMap[spacing],
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
