import type { ApplicationSummary } from '@/types/api';

interface ApplicationCardProps {
  application: ApplicationSummary;
  priority?: boolean;
}

export function ApplicationCard({ application, priority = false }: ApplicationCardProps) {
  return (
    <article className="application-card">
      <a
        href={`/applications/${application.slug}`}
        className="card-link-overlay"
        aria-label={application.name}
      >
        <span className="sr-only">{application.name}</span>
      </a>
      <div className="application-card__image-wrap">
        {application.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={application.coverImage.src}
            alt={application.coverImage.alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--color-bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="text-body-small" style={{ color: 'var(--color-text-tertiary)' }}>
              {application.name}
            </span>
          </div>
        )}
      </div>
      <div className="application-card__body">
        <h3 className="application-card__name">{application.name}</h3>
        {application.description && (
          <p className="application-card__description">{application.description}</p>
        )}
      </div>
    </article>
  );
}
