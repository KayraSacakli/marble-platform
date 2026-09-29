import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/session';
import { TaxonomyForm } from '../../_components/TaxonomyForm';

export const dynamic = 'force-dynamic';

export default async function NewAdminCollectionPage() {
  try {
    await requireAdminSession();
  } catch {
    redirect('/admin/login');
  }
  return (
    <main style={{ maxWidth: 760, margin: '2rem auto', padding: '0 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <p>
        <Link href="/admin/collections">← Collections</Link>
      </p>
      <h1>New collection</h1>
      <TaxonomyForm base="/api/v1/admin/collections" backHref="/admin/collections" mode="create" />
    </main>
  );
}
