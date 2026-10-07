import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/session';
import { getAdminTaxonomy } from '@/services/adminTaxonomy';
import { TaxonomyForm, type TaxonomyFormValues } from '../../_components/TaxonomyForm';
import { TaxonomyDeleteButton } from '../../_components/TaxonomyDeleteButton';
import { RelationManager } from '../../_components/RelationManager';
import { WorkflowPanel } from '../../_components/WorkflowPanel';

export const dynamic = 'force-dynamic';

function toFormValues(c: Awaited<ReturnType<typeof getAdminTaxonomy>>): TaxonomyFormValues {
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
  return { tr: pick(c.tr), en: pick(c.en) };
}

export default async function EditAdminApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch {
    redirect('/admin/login');
  }
  const { id } = await params;
  let application;
  try {
    application = await getAdminTaxonomy('APPLICATION', id);
  } catch {
    notFound();
  }
  const title = application.tr?.name ?? application.en?.name ?? id;
  return (
    <main style={{ maxWidth: 760, margin: '2rem auto', padding: '0 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <p>
        <Link href="/admin/applications">← Applications</Link>
      </p>
      <h1>Edit: {title}</h1>
      <p>
        <TaxonomyDeleteButton base="/api/v1/admin/applications" id={application.id} name={title} />
      </p>
      <TaxonomyForm
        base="/api/v1/admin/applications"
        backHref="/admin/applications"
        mode="edit"
        contentId={application.id}
        initial={toFormValues(application)}
      />
      <RelationManager base={`/api/v1/admin/applications/${application.id}`} title="Attached products" />
      <WorkflowPanel kind="applications" contentId={application.id} />
    </main>
  );
}
