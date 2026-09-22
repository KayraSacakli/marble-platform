import type { ProjectSummary } from '@/types/api';
import { ProjectCard } from './ProjectCard';

interface ProjectGridProps {
  projects: ProjectSummary[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) return null;

  return (
    <div className="project-listing-grid">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
