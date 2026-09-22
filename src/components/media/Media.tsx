import NextImage, { type ImageProps } from 'next/image';

type MediaFit = 'cover' | 'contain';

interface MediaProps extends Omit<ImageProps, 'fill'> {
  fit?: MediaFit;
  fullWidth?: boolean;
}

export function Media({
  fit = 'cover',
  fullWidth = false,
  className = '',
  style,
  alt,
  ...rest
}: MediaProps) {
  return (
    <NextImage
      className={className}
      alt={alt}
      fill
      sizes={fullWidth ? '100vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      style={{
        objectFit: fit,
        ...style,
      }}
      {...rest}
    />
  );
}
