import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/session';
import { TaxonomyForm } from '../../_components/TaxonomyForm';

export const dynamic = 'force-dynamic';

export default async function NewAdminProjectPage() {
  try {
    await requireAdminSession();
  } catch {
    redirect('/admin/login');
  }
  return (
    <main
      style={{
        maxWidth: 760,
        margin: '2rem auto',
        padding: '0 1.5rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <p>
        <Link href="/admin/projects">← Projects</Link>
      </p>
      <h1>New project</h1>
      <TaxonomyForm
        base="/api/v1/admin/projects"
        backHref="/admin/projects"
        mode="create"
        extFields={[
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'projectType', label: 'Project type', type: 'text' },
        ]}
      />
    </main>
  );
}
