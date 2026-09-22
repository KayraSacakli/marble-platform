'use client';

import type { HeroContent as HeroContentType } from '@/types/api';
import { useScrollVideo } from '@/hooks/useScrollVideo';
import { HeroVideo } from './HeroVideo';
import { HeroPoster } from './HeroPoster';
import { HeroContent } from './HeroContent';
import { HeroFallback } from './HeroFallback';

interface HeroScrollStageProps {
  hero: HeroContentType;
}

export function HeroScrollStage({ hero }: HeroScrollStageProps) {
  const {
    videoRef,
    isReady,
    hasError,
    isReducedMotion,
  } = useScrollVideo();

  const hasVideo = hero.media?.mediaType === 'video' && Boolean(hero.media.src);
  const hasPoster = Boolean(hero.fallbackImage?.src || hero.media?.poster);
  const showVideo = hasVideo && !hasError && !isReducedMotion;

  if (!showVideo && !hasPoster) {
    return <HeroFallback hero={hero} />;
  }

  return (
    <div className="hero__scroll-stage">
      <div className="hero__sticky-visual">
        {showVideo && (
          <div className="hero__media">
            <HeroVideo
              ref={videoRef}
              media={hero.media!}
              isReady={isReady}
            />
          </div>
        )}

        {hasPoster && (
          <HeroPoster
            src={hero.fallbackImage?.src || hero.media?.poster || ''}
            alt={hero.fallbackImage?.alt || hero.heading}
            hasVideo={showVideo}
            isReady={isReady}
          />
        )}

        <div className="hero__overlay" aria-hidden="true" />

        <HeroContent hero={hero} />

        {showVideo && isReady && (
          <div
            className="hero__scroll-progress"
            aria-hidden="true"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
