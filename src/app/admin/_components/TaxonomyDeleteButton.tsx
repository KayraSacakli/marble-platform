'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function TaxonomyDeleteButton({
  base,
  id,
  name,
}: {
  base: string;
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!window.confirm(`Delete "${name}"? This cannot be undone. Products are kept.`)) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`${base}/${id}`, { method: 'DELETE' });
      if (res.status === 403) {
        setError('Only ADMIN users can delete.');
        return;
      }
      if (!res.ok) {
        setError('Delete failed. Please try again.');
        return;
      }
      router.push(base.replace('/api/v1/admin', '/admin'));
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
        style={{
          color: '#b00020',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
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
