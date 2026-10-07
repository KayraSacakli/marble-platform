import type { ApplicationSummary } from '@/types/api';
import { ApplicationCard } from './ApplicationCard';

interface ApplicationGridProps {
  applications: ApplicationSummary[];
  locale: string;
}

export function ApplicationGrid({ applications, locale }: ApplicationGridProps) {
  if (applications.length === 0) return null;

  return (
    <div className="application-grid">
      {applications.map((application, index) => (
        <ApplicationCard
          key={application.id}
          application={application}
          locale={locale}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
