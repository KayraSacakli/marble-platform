'use client';

import { useCallback, useEffect, useState } from 'react';

interface AttachedProduct {
  id: string;
  trName: string | null;
  trSlug: string | null;
  enName: string | null;
  attachedAt: string;
}

interface ProductOption {
  id: string;
  name: string;
}

const box: React.CSSProperties = { border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' };

export function RelationManager({
  base,
  title,
  relationPath = 'products',
  idField = 'productId',
  optionsUrl = '/api/v1/admin/products',
}: {
  base: string;
  title: string;
  relationPath?: string;
  idField?: string;
  optionsUrl?: string;
}) {
  const [attached, setAttached] = useState<AttachedProduct[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [relRes, prodRes] = await Promise.all([
        fetch(`${base}/${relationPath}`),
        fetch(`${optionsUrl}?pageSize=100`),
      ]);
      if (relRes.status === 401 || prodRes.status === 401) {
        setError('Session expired. Please sign in again.');
        return;
      }
      if (!relRes.ok || !prodRes.ok) {
        setError('Failed to load products.');
        return;
      }
      const relJson = await relRes.json();
      const prodJson = await prodRes.json();
      // Admin lists may be double-wrapped ({ data: { data, meta } }).
      const rawList = prodJson.data?.data ?? prodJson.data ?? [];
      const items = Array.isArray(rawList) ? rawList : [];
      setAttached(relJson.data.products ?? relJson.data.items ?? []);
      setOptions(
        items.map((p: { id: string; tr?: { name?: string }; en?: { name?: string } }) => ({
          id: p.id,
          name: p.tr?.name ?? p.en?.name ?? p.id,
        })),
      );
    } catch {
      setError('Failed to load products.');
    }
  }, [base, relationPath, optionsUrl]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function onAttach() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`${base}/${relationPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [idField]: selected }),
      });
      const json = await res.json().catch(() => null);
      if (res.status === 409) {
        setError('Product is already attached.');
        return;
      }
      if (!res.ok) {
        setError(json?.error?.message ?? 'Attach failed.');
        return;
      }
      setNotice('Attached.');
      setSelected('');
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function onDetach(productId: string, name: string) {
    if (!window.confirm(`Detach "${name}"? The product itself is kept.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}/${relationPath}?${idField}=${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setError('Detach failed.');
        return;
      }
      setNotice('Detached.');
      await load();
    } finally {
      setBusy(false);
    }
  }

  const attachedIds = new Set(attached.map((a) => a.id));
  const available = options.filter((o) => !attachedIds.has(o.id));

  return (
    <section style={box}>
      <h2>{title}</h2>
      {loading && <p>Loading…</p>}
      {error && (
        <p role="alert" style={{ color: '#b00020' }}>
          {error}
        </p>
      )}
      {notice && (
        <p role="status" style={{ color: '#0a7d2c' }}>
          {notice}
        </p>
      )}
      {!loading && attached.length === 0 && <p>No products attached.</p>}
      {attached.length > 0 && (
        <ul>
          {attached.map((a) => (
            <li key={a.id}>
              {a.trName ?? a.enName ?? a.id} {a.trSlug && <code>{a.trSlug}</code>}{' '}
              <button
                type="button"
                onClick={() => onDetach(a.id, a.trName ?? a.enName ?? a.id)}
                disabled={busy}
                style={{ cursor: 'pointer' }}
              >
                Detach
              </button>
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{ padding: '0.5rem' }}
        >
          <option value="">Select a product…</option>
          {available.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onAttach}
          disabled={busy || !selected}
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Attach
        </button>
      </div>
    </section>
  );
}
