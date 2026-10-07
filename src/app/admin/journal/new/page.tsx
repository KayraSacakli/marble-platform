import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/session';
import { TaxonomyForm } from '../../_components/TaxonomyForm';

export const dynamic = 'force-dynamic';

export default async function NewAdminJournalPage() {
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
        <Link href="/admin/journal">← Journal</Link>
      </p>
      <h1>New article</h1>
      <TaxonomyForm
        base="/api/v1/admin/journal"
        backHref="/admin/journal"
        mode="create"
        extFields={[
          { key: 'publicationDate', label: 'Publication date *', type: 'date' },
          { key: 'authorName', label: 'Author name', type: 'text' },
        ]}
        extInitial={{ publicationDate: new Date().toISOString().slice(0, 10) }}
      />
    </main>
  );
}
