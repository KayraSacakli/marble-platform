import { redirect } from 'next/navigation';
import { getAdminSessionUser } from '@/lib/auth/session';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const admin = await getAdminSessionUser();
  if (admin) {
    redirect('/admin');
  }

  return (
    <main style={{ maxWidth: 720, margin: '4rem auto', padding: '0 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Marble Platform — Admin</p>
      <h1 style={{ fontSize: '1.75rem', margin: '0.5rem 0 1.5rem' }}>Sign in</h1>
      <LoginForm />
    </main>
  );
}
