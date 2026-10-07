import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/session';
import { getAdminProduct } from '@/services/adminProducts';
import { ProductForm, type ProductFormValues } from '../ProductForm';
import { DeleteProductButton } from '../DeleteProductButton';
import { ProductMediaManager } from './ProductMediaManager';
import { WorkflowPanel } from '../../_components/WorkflowPanel';

export const dynamic = 'force-dynamic';

function toFormValues(p: Awaited<ReturnType<typeof getAdminProduct>>): ProductFormValues {
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
  return {
    internalIdentifier: p.internalIdentifier ?? '',
    surfaceFinish: p.surfaceFinish ?? '',
    dimensions: p.dimensions ?? '',
    format: p.format ?? '',
    origin: p.origin ?? '',
    applicableStandards: p.applicableStandards ?? '',
    tr: pick(p.tr),
    en: pick(p.en),
  };
}

export default async function EditAdminProductPage({
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
  let product;
  try {
    product = await getAdminProduct(id);
  } catch {
    notFound();
  }
  const title = product.tr?.name ?? product.en?.name ?? id;
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
        <Link href="/admin/products">← Products</Link>
      </p>
      <h1>Edit: {title}</h1>
      <p>
        <DeleteProductButton id={product.id} name={title} />
      </p>
      <ProductForm mode="edit" productId={product.id} initial={toFormValues(product)} />
      <WorkflowPanel kind="products" contentId={product.id} />
      <ProductMediaManager base={`/api/v1/admin/products/${product.id}`} />
    </main>
  );
}
