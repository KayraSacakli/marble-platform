'use client';

import type { HeroContent as HeroContentType } from '@/types/api';
import { HeroScrollStage } from './HeroScrollStage';

interface HeroSectionProps {
  hero: HeroContentType;
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section className="hero" aria-label="Hero">
      <HeroScrollStage hero={hero} />
    </section>
  );
}
