import { redirect } from 'next/navigation';
import { getAdminSessionUser } from '@/lib/auth/session';
import { LogoutButton } from './LogoutButton';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const admin = await getAdminSessionUser();
  if (!admin) {
    redirect('/admin/login');
  }

  return (
    <main style={{ maxWidth: 720, margin: '4rem auto', padding: '0 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Marble Platform — Admin</p>
      <h1 style={{ fontSize: '1.75rem', margin: '0.5rem 0 1rem' }}>Dashboard</h1>
      <p>
        Signed in as <strong>{admin.email}</strong>
      </p>
      <p>Roles: {admin.roles.length > 0 ? admin.roles.join(', ') : '—'}</p>
      <p style={{ opacity: 0.7 }}>
        Content management (products, media, publishing) lands in the next phase. This page only verifies
        authentication and role resolution.
      </p>
      <LogoutButton />
    </main>
  );
}
