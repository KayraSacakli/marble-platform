import type { ApplicationSummary } from '@/types/api';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface ApplicationsSectionProps {
  heading?: string;
  applications: ApplicationSummary[];
  locale: string;
}

export function ApplicationsSection({ heading, applications, locale }: ApplicationsSectionProps) {
  if (applications.length === 0) return null;

  const displayHeading = heading || 'Applications';

  return (
    <section className="homepage-section">
      <Container size="lg">
        <SectionHeader
          eyebrow="Architecture"
          title={displayHeading}
        />
        <div className="applications-grid">
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} locale={locale} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ApplicationCard({ application, locale }: { application: ApplicationSummary; locale: string }) {
  const href = locale ? `/${locale}/applications/${application.slug}` : `/applications/${application.slug}`;

  return (
    <article className="application-card">
      <a href={href} className="card-link-overlay" aria-label={application.name}>
        <span className="sr-only">{application.name}</span>
      </a>
      <div className="application-card__image-wrap">
        {application.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={application.coverImage.src}
            alt={application.coverImage.alt}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-bg-tertiary)' }} />
        )}
      </div>
      <div className="application-card__body">
        <h3 className="application-card__name">{application.name}</h3>
        {application.description && (
          <p className="application-card__desc">{application.description}</p>
        )}
      </div>
    </article>
  );
}
