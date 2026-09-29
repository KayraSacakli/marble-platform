import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/session';
import { getAdminQuoteRequest } from '@/services/adminQuotes';
import { quoteStateLabel, type QuoteRequestState } from '@/lib/admin/quote-state';
import { QuoteStatusControl } from '../../_components/QuoteStatusControl';

export const dynamic = 'force-dynamic';

const row: React.CSSProperties = { padding: '0.4rem 0', borderBottom: '1px solid #eee' };

function contextLink(kind: string, id: string | null, name: string | null, slug: string | null) {
  if (!id) return null;
  const base = kind === 'PRODUCT' ? '/admin/products' : kind === 'PROJECT' ? '/admin/projects' : '/admin/applications';
  return (
    <p key={kind} style={row}>
      <strong>{kind}</strong>: <Link href={`${base}/${id}`}>{name ?? slug ?? id}</Link>
    </p>
  );
}

export default async function AdminQuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch {
    redirect('/admin/login');
  }

  const { id } = await params;
  let quote;
  try {
    quote = await getAdminQuoteRequest(id);
  } catch {
    notFound();
  }

  return (
    <main style={{ maxWidth: 760, margin: '2rem auto', padding: '0 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <p>
        <Link href="/admin/quotes">← Quote requests</Link>
      </p>
      <h1>{quote.contactName}</h1>

      <section style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <h2>Request</h2>
        <p style={row}>
          <strong>Status:</strong> <code>{quoteStateLabel(quote.state as QuoteRequestState)}</code>
        </p>
        <p style={row}>
          <strong>Submitted:</strong> {new Date(quote.submittedAt).toLocaleString('en-GB')} ·{' '}
          {quote.locale.toUpperCase()}
        </p>
        <p style={row}>
          <strong>Name:</strong> {quote.contactName}
        </p>
        <p style={row}>
          <strong>Email:</strong> {quote.contactEmail}
        </p>
        <p style={row}>
          <strong>Phone:</strong> {quote.contactPhone ?? '—'}
        </p>
        <p style={row}>
          <strong>Company:</strong> {quote.company ?? '—'}
        </p>
        <p style={row}>
          <strong>Message:</strong>
        </p>
        <p style={{ ...row, whiteSpace: 'pre-wrap' }}>{quote.message}</p>
        {quote.context && (
          <div style={row}>
            <strong>Requested context ({quote.context.contextKind}):</strong>
            {quote.context.contextKind === 'PRODUCT' && contextLink('PRODUCT', quote.context.productId, quote.context.product?.trName ?? null, quote.context.product?.trSlug ?? null)}
            {quote.context.contextKind === 'PROJECT' && contextLink('PROJECT', quote.context.projectId, quote.context.project?.trName ?? null, quote.context.project?.trSlug ?? null)}
            {quote.context.contextKind === 'APPLICATION' && contextLink('APPLICATION', quote.context.applicationId, quote.context.application?.trName ?? null, quote.context.application?.trSlug ?? null)}
          </div>
        )}
        <p style={row}>
          <strong>Last processed:</strong>{' '}
          {quote.processedAt ? `${new Date(quote.processedAt).toLocaleString('en-GB')} by ${quote.processorEmail ?? '—'}` : '—'}
        </p>
      </section>

      <QuoteStatusControl quoteId={quote.id} state={quote.state} />
    </main>
  );
}
