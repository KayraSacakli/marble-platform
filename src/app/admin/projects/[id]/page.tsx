import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/session';
import { getAdminEditorial } from '@/services/adminEditorial';
import { TaxonomyForm, type TaxonomyFormValues } from '../../_components/TaxonomyForm';
import { TaxonomyDeleteButton } from '../../_components/TaxonomyDeleteButton';
import { RelationManager } from '../../_components/RelationManager';
import { WorkflowPanel } from '../../_components/WorkflowPanel';
import { ProductMediaManager } from '../../products/[id]/ProductMediaManager';

export const dynamic = 'force-dynamic';

function toFormValues(p: Awaited<ReturnType<typeof getAdminEditorial>>): TaxonomyFormValues {
  const pick = (
    v: {
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
    } | null,
  ) => ({
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
  return { tr: pick(p.tr), en: pick(p.en) };
}

export default async function EditAdminProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    await requireAdminSession();
  } catch {
    redirect('/admin/login');
  }
  const { id } = await params;
  let project;
  try {
    project = await getAdminEditorial('PROJECT', id);
  } catch {
    notFound();
  }
  const title = project.tr?.name ?? project.en?.name ?? id;
  const apiBase = `/api/v1/admin/projects/${project.id}`;
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
      <h1>Edit: {title}</h1>
      <p>
        <TaxonomyDeleteButton base="/api/v1/admin/projects" id={project.id} name={title} />
      </p>
      <TaxonomyForm
        base="/api/v1/admin/projects"
        backHref="/admin/projects"
        mode="edit"
        contentId={project.id}
        initial={toFormValues(project)}
        extFields={[
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'projectType', label: 'Project type', type: 'text' },
        ]}
        extInitial={{
          location: project.location ?? '',
          projectType: project.projectType ?? '',
        }}
      />
      <RelationManager
        base={apiBase}
        title="Attached products"
        relationPath="products"
        idField="productId"
        optionsUrl="/api/v1/admin/products"
      />
      <RelationManager
        base={apiBase}
        title="Attached applications"
        relationPath="applications"
        idField="applicationId"
        optionsUrl="/api/v1/admin/applications"
      />
      <ProductMediaManager base={`${apiBase}/media`} />
      <WorkflowPanel kind="projects" contentId={project.id} />
    </main>
  );
}
