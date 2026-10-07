import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/session';
import { ProductForm } from '../ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewAdminProductPage() {
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
        <Link href="/admin/products">← Products</Link>
      </p>
      <h1>New product</h1>
      <ProductForm mode="create" />
    </main>
  );
}
