import type { CSSProperties } from 'react';

type AspectRatioValue = '4/3' | '16/9' | '3/2' | '16/10' | '1';

interface AspectRatioProps {
  ratio?: AspectRatioValue;
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

const ratioMap: Record<AspectRatioValue, string> = {
  '4/3': '4 / 3',
  '16/9': '16 / 9',
  '3/2': '3 / 2',
  '16/10': '16 / 10',
  '1': '1 / 1',
};

export function AspectRatio({
  ratio = '16/9',
  children,
  className = '',
  style,
}: AspectRatioProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        aspectRatio: ratioMap[ratio],
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
