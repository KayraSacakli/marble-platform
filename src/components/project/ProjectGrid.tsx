import type { ProjectSummary } from '@/types/api';
import { ProjectCard } from './ProjectCard';

interface ProjectGridProps {
  projects: ProjectSummary[];
  locale: string;
}

export function ProjectGrid({ projects, locale }: ProjectGridProps) {
  if (projects.length === 0) return null;

  return (
    <div className="project-listing-grid">
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} locale={locale} priority={index < 3} />
      ))}
    </div>
  );
}
