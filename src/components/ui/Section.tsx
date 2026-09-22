interface SectionProps {
  children: React.ReactNode;
  as?: 'section' | 'div' | 'article';
  background?: 'primary' | 'secondary' | 'tertiary' | 'dark' | 'darker';
  className?: string;
  style?: React.CSSProperties;
}

const bgMap: Record<NonNullable<SectionProps['background']>, string> = {
  primary: 'var(--color-bg-primary)',
  secondary: 'var(--color-bg-secondary)',
  tertiary: 'var(--color-bg-tertiary)',
  dark: 'var(--color-bg-dark)',
  darker: 'var(--color-bg-darker)',
};

const textColorMap: Record<NonNullable<SectionProps['background']>, string> = {
  primary: 'var(--color-text-primary)',
  secondary: 'var(--color-text-primary)',
  tertiary: 'var(--color-text-primary)',
  dark: 'var(--color-text-inverse)',
  darker: 'var(--color-text-inverse)',
};

export function Section({
  children,
  as: Tag = 'section',
  background = 'primary',
  className = '',
  style,
}: SectionProps) {
  return (
    <Tag
      className={className}
      style={{
        backgroundColor: bgMap[background],
        color: textColorMap[background],
        paddingTop: 'var(--space-8)',
        paddingBottom: 'var(--space-8)',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
