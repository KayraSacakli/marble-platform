import type { ProjectSummary } from '@/types/api';

interface ProjectCardProps {
  project: ProjectSummary;
  priority?: boolean;
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  return (
    <article className="project-card">
      <a
        href={`/projects/${project.slug}`}
        className="card-link-overlay"
        aria-label={project.name}
      >
        <span className="sr-only">{project.name}</span>
      </a>
      <div className="project-card__image-wrap">
        {project.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.heroImage.src}
            alt={project.heroImage.alt}
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
              {project.name}
            </span>
          </div>
        )}
      </div>
      <div className="project-card__body">
        <h3 className="project-card__name">{project.name}</h3>
        {project.description && (
          <p className="project-card__desc">{project.description}</p>
        )}
      </div>
    </article>
  );
}
