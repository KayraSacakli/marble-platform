'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!window.confirm(`Delete product "${name}"? This cannot be undone.`)) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/products/${id}`, { method: 'DELETE' });
      if (res.status === 403) {
        setError('Only ADMIN users can delete products.');
        return;
      }
      if (!res.ok) {
        setError('Delete failed. Please try again.');
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <span>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        style={{ color: '#b00020', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        {pending ? 'Deleting…' : 'Delete'}
      </button>
      {error && (
        <span role="alert" style={{ color: '#b00020', marginLeft: '0.5rem' }}>
          {error}
        </span>
      )}
    </span>
  );
}
