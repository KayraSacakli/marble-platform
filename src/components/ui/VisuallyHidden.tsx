interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: 'span' | 'div';
}

export function VisuallyHidden({ children, as: Tag = 'span' }: VisuallyHiddenProps) {
  return <Tag className="sr-only">{children}</Tag>;
}
