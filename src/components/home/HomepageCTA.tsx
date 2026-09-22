import type { CTALink } from '@/types/api';
import { Container } from '@/components/ui/Container';

interface HomepageCTAProps {
  heading: string;
  message?: string;
  primaryCTA: CTALink;
  secondaryCTA?: CTALink;
}

export function HomepageCTA({ heading, message, primaryCTA, secondaryCTA }: HomepageCTAProps) {
  return (
    <section className="homepage-cta" aria-labelledby="cta-heading">
      <Container size="md">
        <h2 id="cta-heading" className="homepage-cta__heading">{heading}</h2>
        {message && (
          <p className="homepage-cta__message">{message}</p>
        )}
        <div className="homepage-cta__actions">
          {primaryCTA && (
            <a href={primaryCTA.href} className="button button--primary button--lg">
              {primaryCTA.label}
            </a>
          )}
          {secondaryCTA && (
            <a href={secondaryCTA.href} className="button button--secondary button--lg">
              {secondaryCTA.label}
            </a>
          )}
        </div>
      </Container>
    </section>
  );
}
