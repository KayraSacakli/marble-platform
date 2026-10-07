import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/session';
import { getAdminEditorial } from '@/services/adminEditorial';
import { TaxonomyForm, type TaxonomyFormValues } from '../../_components/TaxonomyForm';
import { TaxonomyDeleteButton } from '../../_components/TaxonomyDeleteButton';
import { JournalReferenceManager } from './JournalReferenceManager';
import { WorkflowPanel } from '../../_components/WorkflowPanel';
import { ProductMediaManager } from '../../products/[id]/ProductMediaManager';

export const dynamic = 'force-dynamic';

function toFormValues(a: Awaited<ReturnType<typeof getAdminEditorial>>): TaxonomyFormValues {
  const pick = (v: {
    slug: string;
    name: string | null;
    description: string | null;
    tagline: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoCanonical: string | null;
    seoRobots: string | null;
    isFeatured: boolean;
    featuredOrder: number | null;
    displayOrder: number | null;
  } | null) => ({
    slug: v?.slug ?? '',
    name: v?.name ?? '',
    description: v?.description ?? '',
    tagline: v?.tagline ?? '',
    seoTitle: v?.seoTitle ?? '',
    seoDescription: v?.seoDescription ?? '',
    seoCanonical: v?.seoCanonical ?? '',
    seoRobots: v?.seoRobots ?? '',
    isFeatured: v?.isFeatured ?? false,
    featuredOrder: v?.featuredOrder != null ? String(v.featuredOrder) : '',
    displayOrder: v?.displayOrder != null ? String(v.displayOrder) : '',
  });
  return { tr: pick(a.tr), en: pick(a.en) };
}

export default async function EditAdminJournalPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch {
    redirect('/admin/login');
  }
  const { id } = await params;
  let article;
  try {
    article = await getAdminEditorial('JOURNAL_ARTICLE', id);
  } catch {
    notFound();
  }
  const title = article.tr?.name ?? article.en?.name ?? id;
  const apiBase = `/api/v1/admin/journal/${article.id}`;
  return (
    <main style={{ maxWidth: 760, margin: '2rem auto', padding: '0 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <p>
        <Link href="/admin/journal">← Journal</Link>
      </p>
      <h1>Edit: {title}</h1>
      <p>
        <TaxonomyDeleteButton base="/api/v1/admin/journal" id={article.id} name={title} />
      </p>
      <TaxonomyForm
        base="/api/v1/admin/journal"
        backHref="/admin/journal"
        mode="edit"
        contentId={article.id}
        initial={toFormValues(article)}
        extFields={[
          { key: 'publicationDate', label: 'Publication date *', type: 'date' },
          { key: 'authorName', label: 'Author name', type: 'text' },
        ]}
        extInitial={{
          publicationDate: (article.publicationDate ?? '').slice(0, 10),
          authorName: article.authorName ?? '',
        }}
      />
      <JournalReferenceManager base={apiBase} />
      <ProductMediaManager base={`${apiBase}/media`} />
      <WorkflowPanel kind="journal" contentId={article.id} />
    </main>
  );
}
