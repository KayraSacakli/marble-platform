interface HeroPosterProps {
  src: string;
  alt: string;
  hasVideo: boolean;
  isReady: boolean;
}

export function HeroPoster({ src, alt, hasVideo, isReady }: HeroPosterProps) {
  const isHidden = hasVideo && isReady;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`hero__poster ${isHidden ? 'hero__poster--hidden' : ''}`}
      loading="eager"
      decoding="async"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  );
}
