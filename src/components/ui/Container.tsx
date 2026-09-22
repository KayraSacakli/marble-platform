interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'main';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeMap: Record<NonNullable<ContainerProps['size']>, string> = {
  sm: 'var(--container-sm)',
  md: 'var(--container-md)',
  lg: 'var(--container-lg)',
  xl: 'var(--container-xl)',
  full: '100%',
};

export function Container({
  children,
  className,
  as: Tag = 'div',
  size = 'lg',
}: ContainerProps) {
  return (
    <Tag
      className={className}
      style={{
        width: '100%',
        maxWidth: sizeMap[size],
        margin: '0 auto',
        paddingLeft: 'var(--grid-margin)',
        paddingRight: 'var(--grid-margin)',
      }}
    >
      {children}
    </Tag>
  );
}
