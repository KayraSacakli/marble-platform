'use client';

import { forwardRef } from 'react';
import type { MediaPresentation } from '@/types/api';

interface HeroVideoProps {
  media: MediaPresentation;
  isReady: boolean;
}

export const HeroVideo = forwardRef<HTMLVideoElement, HeroVideoProps>(
  function HeroVideo({ media, isReady }, ref) {
    return (
      <video
        ref={ref}
        className="hero__video"
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        style={{ opacity: isReady ? 1 : 0, transition: 'opacity var(--duration-slow) var(--easing-default)' }}
      >
        <source src={media.src} type="video/mp4" />
      </video>
    );
  },
);
