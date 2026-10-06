import { Media } from '@/components/media/Media';

interface HeroPosterProps {
  src: string;
  alt: string;
  hasVideo: boolean;
  isReady: boolean;
}

export function HeroPoster({ src, alt, hasVideo, isReady }: HeroPosterProps) {
  const isHidden = hasVideo && isReady;

  return (
    <Media
      src={src}
      alt={alt}
      className={`hero__poster ${isHidden ? 'hero__poster--hidden' : ''}`}
      priority
    />
  );
}
