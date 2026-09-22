import type { ApplicationSummary } from '@/types/api';
import { ApplicationCard } from './ApplicationCard';

interface ApplicationGridProps {
  applications: ApplicationSummary[];
}

export function ApplicationGrid({ applications }: ApplicationGridProps) {
  if (applications.length === 0) return null;

  return (
    <div className="application-grid">
      {applications.map((application, index) => (
        <ApplicationCard
          key={application.id}
          application={application}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
