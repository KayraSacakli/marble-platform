'use client';

import { useCallback, useEffect, useState } from 'react';

interface JournalRef {
  id: string;
  referenceId: string;
  targetKind: 'product' | 'application' | 'project';
  targetId: string;
  trName: string | null;
  trSlug: string | null;
  enName: string | null;
  attachedAt: string;
}

interface TargetOption {
  id: string;
  name: string;
}

const KIND_OPTIONS: Array<{ kind: 'product' | 'application' | 'project'; listUrl: string; label: string }> = [
  { kind: 'product', listUrl: '/api/v1/admin/products', label: 'Product' },
  { kind: 'application', listUrl: '/api/v1/admin/applications', label: 'Application' },
  { kind: 'project', listUrl: '/api/v1/admin/projects', label: 'Project' },
];

const box: React.CSSProperties = { border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' };

function unwrapList(json: { data?: { data?: unknown[] } | unknown[] }): TargetOption[] {
  const raw = (json.data as { data?: unknown[] } | undefined)?.data ?? json.data ?? [];
  const items = (Array.isArray(raw) ? raw : []) as Array<{ id: string; tr?: { name?: string }; en?: { name?: string } }>;
  return items.map((p) => ({ id: p.id, name: p.tr?.name ?? p.en?.name ?? p.id }));
}

export function JournalReferenceManager({ base }: { base: string }) {
  const [refs, setRefs] = useState<JournalRef[]>([]);
  const [targetKind, setTargetKind] = useState<'product' | 'application' | 'project'>('product');
  const [options, setOptions] = useState<TargetOption[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [refRes, optRes] = await Promise.all([
        fetch(`${base}/references`),
        fetch(`${KIND_OPTIONS.find((k) => k.kind === targetKind)?.listUrl}?pageSize=100`),
      ]);
      if (refRes.status === 401 || optRes.status === 401) {
        setError('Session expired. Please sign in again.');
        return;
      }
      if (!refRes.ok || !optRes.ok) {
        setError('Failed to load references.');
        return;
      }
      setRefs(((await refRes.json()).data.references ?? []) as JournalRef[]);
      setOptions(unwrapList(await optRes.json()));
    } catch {
      setError('Failed to load references.');
    }
  }, [base, targetKind]);

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
      const res = await fetch(`${base}/references`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetKind, targetId: selected }),
      });
      const json = await res.json().catch(() => null);
      if (res.status === 409) {
        setError('This reference already exists.');
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

  async function onDetach(referenceId: string, name: string) {
    if (!window.confirm(`Remove reference to "${name}"?`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}/references?referenceId=${referenceId}`, { method: 'DELETE' });
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

  const attachedIds = new Set(refs.map((r) => `${r.targetKind}:${r.targetId}`));
  const available = options.filter((o) => !attachedIds.has(`${targetKind}:${o.id}`));

  return (
    <section style={box}>
      <h2>Referenced content</h2>
      {loading && <p>Loading…</p>}
      {error && <p role="alert" style={{ color: '#b00020' }}>{error}</p>}
      {notice && <p role="status" style={{ color: '#0a7d2c' }}>{notice}</p>}
      {!loading && refs.length === 0 && <p>No references yet.</p>}
      {refs.length > 0 && (
        <ul>
          {refs.map((r) => (
            <li key={r.id}>
              [{r.targetKind}] {r.trName ?? r.enName ?? r.targetId}{' '}
              <button type="button" onClick={() => onDetach(r.referenceId, r.trName ?? r.enName ?? r.targetId)} disabled={busy} style={{ cursor: 'pointer' }}>
                Detach
              </button>
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
        <select value={targetKind} onChange={(e) => { setTargetKind(e.target.value as 'product' | 'application' | 'project'); setSelected(''); }} style={{ padding: '0.5rem' }}>
          {KIND_OPTIONS.map((k) => (
            <option key={k.kind} value={k.kind}>{k.label}</option>
          ))}
        </select>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{ padding: '0.5rem' }}>
          <option value="">Select…</option>
          {available.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        <button type="button" onClick={onAttach} disabled={busy || !selected} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Attach
        </button>
      </div>
    </section>
  );
}
