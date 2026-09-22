import type { HeroContent as HeroContentType, CTALink } from '@/types/api';

interface HeroContentProps {
  hero: HeroContentType;
}

function CTALinkButton({ cta }: { cta: CTALink }) {
  return (
    <a
      href={cta.href}
      className="button button--primary button--lg"
    >
      {cta.label}
    </a>
  );
}

function CTASecondaryLink({ cta }: { cta: CTALink }) {
  return (
    <a
      href={cta.href}
      className="button button--secondary button--lg"
    >
      {cta.label}
    </a>
  );
}

export function HeroContent({ hero }: HeroContentProps) {
  return (
    <div className="hero__content">
      {hero.heading && (
        <h1 className="hero__heading">{hero.heading}</h1>
      )}
      {hero.subheading && (
        <p className="hero__subheading">{hero.subheading}</p>
      )}
      <div className="hero__ctas">
        {hero.primaryCTA && (
          <CTALinkButton cta={hero.primaryCTA} />
        )}
        {hero.secondaryCTA && (
          <CTASecondaryLink cta={hero.secondaryCTA} />
        )}
      </div>
    </div>
  );
}
