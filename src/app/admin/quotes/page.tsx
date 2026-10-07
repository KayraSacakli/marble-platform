import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/session';
import { listAdminQuoteRequests } from '@/services/adminQuotes';
import {
  QUOTE_REQUEST_STATES,
  quoteStateLabel,
  type QuoteRequestState,
} from '@/lib/admin/quote-state';

export const dynamic = 'force-dynamic';

const cell: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid #e5e5e5',
  textAlign: 'left',
};

function pageHref(page: number, q: string, state: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q) params.set('q', q);
  if (state) params.set('state', state);
  const qs = params.toString();
  return `/admin/quotes${qs ? `?${qs}` : ''}`;
}

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; state?: string }>;
}) {
  try {
    await requireAdminSession();
  } catch {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const q = params.q?.trim() || undefined;
  const state =
    params.state && (QUOTE_REQUEST_STATES as readonly string[]).includes(params.state)
      ? params.state
      : undefined;

  let result;
  try {
    result = await listAdminQuoteRequests({ page, pageSize: 20, q, state });
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
        <h1>Quote requests</h1>
        <p role="alert" style={{ color: '#b00020' }}>
          Failed to load quote requests.
        </p>
      </main>
    );
  }

  const { meta } = result;

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
      <h1>Quote requests ({meta.total})</h1>
      <form
        method="get"
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          margin: '1rem 0',
          flexWrap: 'wrap',
        }}
      >
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search name or company…"
          style={{ padding: '0.5rem' }}
        />
        <select name="state" defaultValue={state ?? ''} style={{ padding: '0.5rem' }}>
          <option value="">All statuses</option>
          {QUOTE_REQUEST_STATES.map((s) => (
            <option key={s} value={s}>
              {quoteStateLabel(s as QuoteRequestState)}
            </option>
          ))}
        </select>
        <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Filter
        </button>
      </form>
      {result.data.length === 0 ? (
        <p>No quote requests found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={cell}>Name</th>
              <th style={cell}>Company</th>
              <th style={cell}>Status</th>
              <th style={cell}>Locale</th>
              <th style={cell}>Submitted</th>
              <th style={cell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((row) => (
              <tr key={row.id}>
                <td style={cell}>{row.contactName}</td>
                <td style={cell}>{row.company ?? '—'}</td>
                <td style={cell}>
                  <code>{quoteStateLabel(row.state)}</code>
                </td>
                <td style={cell}>{row.locale.toUpperCase()}</td>
                <td style={cell}>{new Date(row.submittedAt).toLocaleString('en-GB')}</td>
                <td style={cell}>
                  <Link href={`/admin/quotes/${row.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {meta.totalPages > 1 && (
        <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {meta.page > 1 ? (
            <Link href={pageHref(meta.page - 1, q ?? '', state ?? '')}>← Previous</Link>
          ) : (
            <span style={{ opacity: 0.5 }}>← Previous</span>
          )}
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          {meta.page < meta.totalPages ? (
            <Link href={pageHref(meta.page + 1, q ?? '', state ?? '')}>Next →</Link>
          ) : (
            <span style={{ opacity: 0.5 }}>Next →</span>
          )}
        </nav>
      )}
    </main>
  );
}
