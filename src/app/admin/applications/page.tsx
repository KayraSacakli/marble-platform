import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/session';
import { listAdminTaxonomy } from '@/services/adminTaxonomy';
import { TaxonomyDeleteButton } from '../_components/TaxonomyDeleteButton';

export const dynamic = 'force-dynamic';

const cell: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #e5e5e5',
  textAlign: 'left',
};

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  try {
    await requireAdminSession();
  } catch {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const q = params.q?.trim() || undefined;

  let result;
  try {
    result = await listAdminTaxonomy('APPLICATION', { page, pageSize: 20, q });
  } catch {
    return (
      <main
        style={{
          maxWidth: 960,
          margin: '2rem auto',
          padding: '0 1.5rem',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h1>Applications</h1>
        <p role="alert" style={{ color: '#b00020' }}>
          Failed to load applications.
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 960,
        margin: '2rem auto',
        padding: '0 1.5rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <p>
        <Link href="/admin">← Dashboard</Link>
      </p>
      <h1>Applications ({result.meta.total})</h1>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '1rem 0' }}>
        <form method="get" style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search name or slug…"
            style={{ padding: '0.5rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Search
          </button>
        </form>
        <Link
          href="/admin/applications/new"
          style={{ padding: '0.5rem 1rem', border: '1px solid', textDecoration: 'none' }}
        >
          + New application
        </Link>
      </div>
      {result.data.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={cell}>TR name</th>
              <th style={cell}>TR slug</th>
              <th style={cell}>Featured</th>
              <th style={cell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((c) => (
              <tr key={c.id}>
                <td style={cell}>{c.tr?.name ?? c.en?.name ?? '—'}</td>
                <td style={cell}>
                  <code>{c.tr?.slug ?? c.en?.slug ?? '—'}</code>
                </td>
                <td style={cell}>{c.tr?.isFeatured || c.en?.isFeatured ? '★' : ''}</td>
                <td style={cell}>
                  <Link href={`/admin/applications/${c.id}`}>Edit</Link> ·{' '}
                  <TaxonomyDeleteButton
                    base="/api/v1/admin/applications"
                    id={c.id}
                    name={c.tr?.name ?? c.en?.name ?? c.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
