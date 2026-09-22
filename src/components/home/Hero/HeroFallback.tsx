import type { HeroContent as HeroContentType } from '@/types/api';

interface HeroFallbackProps {
  hero: HeroContentType;
}

export function HeroFallback({ hero }: HeroFallbackProps) {
  return (
    <div className="hero__fallback">
      {hero.heading && (
        <h1 className="hero__fallback-heading">{hero.heading}</h1>
      )}
      {hero.subheading && (
        <p className="hero__fallback-sub">{hero.subheading}</p>
      )}
      <div className="hero__ctas">
        {hero.primaryCTA && (
          <a
            href={hero.primaryCTA.href}
            className="button button--primary button--lg"
          >
            {hero.primaryCTA.label}
          </a>
        )}
        {hero.secondaryCTA && (
          <a
            href={hero.secondaryCTA.href}
            className="button button--secondary button--lg"
          >
            {hero.secondaryCTA.label}
          </a>
        )}
      </div>
    </div>
  );
}
