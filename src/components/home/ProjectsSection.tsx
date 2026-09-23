import type { ProjectSummary } from '@/types/api';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface ProjectsSectionProps {
  heading?: string;
  projects: ProjectSummary[];
  locale: string;
}

export function ProjectsSection({ heading, projects, locale }: ProjectsSectionProps) {
  if (projects.length === 0) return null;

  const displayHeading = heading || 'Projects';

  const editorial = projects.length >= 3;

  return (
    <section className="homepage-section">
      <Container size="lg">
        <SectionHeader
          eyebrow="Portfolio"
          title={displayHeading}
        />
        <div className={`projects-grid ${editorial ? 'projects-grid--editorial' : ''}`}>
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} featured={editorial && index === 0} locale={locale} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProjectCard({ project, featured, locale }: { project: ProjectSummary; featured: boolean; locale: string }) {
  const href = locale ? `/${locale}/projects/${project.slug}` : `/projects/${project.slug}`;

  return (
    <article className={`project-card ${featured ? 'project-card--featured' : ''}`}>
      <a href={href} className="card-link-overlay" aria-label={project.name}>
        <span className="sr-only">{project.name}</span>
      </a>
      <div className="project-card__image-wrap">
        {project.heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.heroImage.src}
            alt={project.heroImage.alt}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-bg-tertiary)' }} />
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
