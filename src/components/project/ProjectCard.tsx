import { Media } from '@/components/media/Media';
import type { ProjectSummary } from '@/types/api';

interface ProjectCardProps {
  project: ProjectSummary;
  locale: string;
  priority?: boolean;
}

export function ProjectCard({ project, locale, priority = false }: ProjectCardProps) {
  return (
    <article className="project-card">
      <a
        href={`/${locale}/projects/${project.slug}`}
        className="card-link-overlay"
        aria-label={project.name}
      >
        <span className="sr-only">{project.name}</span>
      </a>
      <div className="project-card__image-wrap">
        {project.heroImage ? (
          <Media src={project.heroImage.src} alt={project.heroImage.alt} priority={priority} />
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
        {project.description && <p className="project-card__desc">{project.description}</p>}
      </div>
    </article>
  );
}
