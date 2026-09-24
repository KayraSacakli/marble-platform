'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await fetch('/api/v1/admin/auth/logout', { method: 'POST' });
    } finally {
      router.push('/admin/login');
      router.refresh();
      setPending(false);
    }
  }

  return (
    <button type="button" onClick={onClick} disabled={pending} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
      {pending ? 'Signing out…' : 'Log out'}
    </button>
  );
}
