'use client';

import { useCallback, useEffect, useState } from 'react';

interface MediaRow {
  rowId: string;
  variant: 'tr' | 'en';
  assetId: string;
  src: string;
  role: 'PRIMARY' | 'GALLERY' | 'HERO';
  displayOrder: number;
  altText: string | null;
  width: number | null;
  height: number | null;
}

interface LibraryAsset {
  id: string;
  src: string;
  mime: string;
  usageCount: number;
}

interface RowEdit {
  displayOrder: string;
  altTr: string;
  altEn: string;
}

const box: React.CSSProperties = { border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' };

export function ProductMediaManager({ base }: { base: string }) {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [library, setLibrary] = useState<LibraryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [edits, setEdits] = useState<Record<string, RowEdit>>({});
  const [attachId, setAttachId] = useState('');
  const [uploadRole, setUploadRole] = useState<'PRIMARY' | 'GALLERY' | 'HERO'>('GALLERY');

  const fetchMedia = useCallback(async () => {
    const [mediaRes, libRes] = await Promise.all([
      fetch(`${base}/media`),
      fetch('/api/v1/admin/media?pageSize=50'),
    ]);
    if (mediaRes.status === 401 || libRes.status === 401) {
      throw new Error('auth');
    }
    if (!mediaRes.ok || !libRes.ok) {
      throw new Error('load');
    }
    const mediaJson = await mediaRes.json();
    const libJson = await libRes.json();
    return { rows: mediaJson.data.media as MediaRow[], library: libJson.data.data as LibraryAsset[] };
  }, [base]);

  const applyRows = useCallback((list: MediaRow[], lib: LibraryAsset[]) => {
    setRows(list);
    setLibrary(lib);
    const next: Record<string, RowEdit> = {};
    for (const row of list) {
      if (!next[row.assetId]) {
        next[row.assetId] = {
          displayOrder: String(row.displayOrder),
          altTr: row.variant === 'tr' ? row.altText ?? '' : '',
          altEn: row.variant === 'en' ? row.altText ?? '' : '',
        };
      } else {
        if (row.variant === 'tr') next[row.assetId].altTr = row.altText ?? '';
        if (row.variant === 'en') next[row.assetId].altEn = row.altText ?? '';
      }
    }
    setEdits(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchMedia().then(
      ({ rows, library }) => {
        if (!cancelled) {
          applyRows(rows, library);
          setLoading(false);
        }
      },
      (err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error && err.message === 'auth' ? 'Session expired. Please sign in again.' : 'Failed to load media.');
          setLoading(false);
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [fetchMedia, applyRows]);

  async function refresh() {
    setError(null);
    try {
      const { rows, library } = await fetchMedia();
      applyRows(rows, library);
    } catch {
      setError('Failed to load media.');
    }
  }

  async function onUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem('file') as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setError('Choose a file first.');
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const up = await fetch('/api/v1/admin/media', { method: 'POST', body: formData });
      const upJson = await up.json().catch(() => null);
      if (up.status === 401) {
        setError('Session expired. Please sign in again.');
        return;
      }
      if (!up.ok) {
        setError(upJson?.error?.message ?? 'Upload failed.');
        return;
      }
      const assetId: string = upJson.data.id;
      const at = await fetch(`${base}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, role: uploadRole }),
      });
      if (!at.ok) {
        const atJson = await at.json().catch(() => null);
        setError(atJson?.error?.message ?? 'Uploaded, but attach failed. Attach it from the library below.');
        await refresh();
        return;
      }
      setNotice('Uploaded and attached.');
      form.reset();
      await refresh();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function onAttachExisting() {
    if (!attachId) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`${base}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: attachId, role: 'GALLERY' }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error?.message ?? 'Attach failed.');
        return;
      }
      setNotice('Attached.');
      setAttachId('');
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onDetach(assetId: string) {
    if (!window.confirm('Remove this media from the product? (The file itself is kept.)')) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}/media?assetId=${assetId}`, { method: 'DELETE' });
      if (!res.ok) {
        setError('Detach failed.');
        return;
      }
      setNotice('Detached.');
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onSaveOrder() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const items = Object.entries(edits).map(([assetId, e]) => ({
        assetId,
        displayOrder: e.displayOrder.trim() === '' ? undefined : Number(e.displayOrder),
        altTr: e.altTr,
        altEn: e.altEn,
      }));
      const res = await fetch(`${base}/media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error?.message ?? 'Save failed.');
        return;
      }
      setNotice('Order and alt text saved.');
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const attachedIds = new Set(rows.map((r) => r.assetId));
  const unattached = library.filter((a) => !attachedIds.has(a.id));
  const primaryRows = rows.filter((r) => r.variant === 'tr');

  return (
    <section style={box}>
      <h2>Product media</h2>
      {loading && <p>Loading media…</p>}
      {error && <p role="alert" style={{ color: '#b00020' }}>{error}</p>}
      {notice && <p role="status" style={{ color: '#0a7d2c' }}>{notice}</p>}

      {!loading && primaryRows.length === 0 && <p>No media attached yet.</p>}
      {primaryRows.map((row) => {
        const edit = edits[row.assetId] ?? { displayOrder: String(row.displayOrder), altTr: '', altEn: '' };
        const setEdit = (patch: Partial<RowEdit>) =>
          setEdits((prev) => ({ ...prev, [row.assetId]: { ...edit, ...patch } }));
        return (
          <div key={row.assetId} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderTop: '1px solid #eee', padding: '0.75rem 0' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row.src} alt="" width={120} style={{ objectFit: 'cover', background: '#f0f0f0' }} />
            <div style={{ display: 'grid', gap: '0.5rem', flex: 1 }}>
              <span>
                <code>{row.role}</code> · order{' '}
                <input
                  inputMode="numeric"
                  value={edit.displayOrder}
                  onChange={(e) => setEdit({ displayOrder: e.target.value })}
                  style={{ width: 64, padding: '0.25rem' }}
                />
              </span>
              <label>Alt TR <input value={edit.altTr} onChange={(e) => setEdit({ altTr: e.target.value })} style={{ width: '100%', padding: '0.25rem' }} /></label>
              <label>Alt EN <input value={edit.altEn} onChange={(e) => setEdit({ altEn: e.target.value })} style={{ width: '100%', padding: '0.25rem' }} /></label>
              <span>
                <button type="button" onClick={() => onDetach(row.assetId)} disabled={busy} style={{ cursor: 'pointer' }}>
                  Detach
                </button>
              </span>
            </div>
          </div>
        );
      })}
      {primaryRows.length > 0 && (
        <button type="button" onClick={onSaveOrder} disabled={busy} style={{ padding: '0.5rem 1rem', cursor: 'pointer', marginTop: '0.5rem' }}>
          {busy ? 'Saving…' : 'Save order + alt text'}
        </button>
      )}

      <h3>Upload new image</h3>
      <form onSubmit={onUpload} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="file" name="file" accept="image/png,image/jpeg,image/gif,image/webp,image/avif" />
        <select value={uploadRole} onChange={(e) => setUploadRole(e.target.value as 'PRIMARY' | 'GALLERY' | 'HERO')} style={{ padding: '0.5rem' }}>
          <option value="GALLERY">GALLERY</option>
          <option value="PRIMARY">PRIMARY</option>
          <option value="HERO">HERO</option>
        </select>
        <button type="submit" disabled={busy} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          {busy ? 'Uploading…' : 'Upload + attach'}
        </button>
      </form>
      <p style={{ opacity: 0.7, fontSize: '0.875rem' }}>PNG, JPEG, GIF, WebP or AVIF, max 5 MB. SVG is not accepted.</p>

      {unattached.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Attach existing upload</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select value={attachId} onChange={(e) => setAttachId(e.target.value)} style={{ padding: '0.5rem' }}>
              <option value="">Select…</option>
              {unattached.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.src.split('/').pop()} ({a.mime})
                </option>
              ))}
            </select>
            <button type="button" onClick={onAttachExisting} disabled={busy || !attachId} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
              Attach as gallery
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
