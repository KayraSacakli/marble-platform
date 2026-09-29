'use client';

import { useCallback, useEffect, useState } from 'react';

interface ApprovalView {
  outcome: string;
  approverEmail: string | null;
  notes: string | null;
  coveredLocale: string;
  createdAt: string;
}

interface RevisionView {
  id: string;
  revisionNumber: number;
  status: string;
  authorEmail: string | null;
  createdAt: string;
  approvals: ApprovalView[];
  locale?: string;
}

interface LocaleWorkflowView {
  locale: string;
  lifecycleState: string;
  openRevision: RevisionView | null;
  publishedRevisionNumber: number | null;
}

const box: React.CSSProperties = { border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' };

export type WorkflowKind = 'products' | 'collections' | 'applications' | 'projects' | 'journal';

export function WorkflowPanel({ kind, contentId }: { kind: WorkflowKind; contentId: string }) {
  const [workflow, setWorkflow] = useState<Record<string, LocaleWorkflowView> | null>(null);
  const [history, setHistory] = useState<RevisionView[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');

  const isAdmin = roles.includes('ADMIN');

  const base = `/api/v1/admin/${kind}/${contentId}`;

  const load = useCallback(async () => {
    try {
      const [wfRes, meRes] = await Promise.all([
        fetch(`${base}/workflow`),
        fetch('/api/v1/admin/auth/me'),
      ]);
      if (wfRes.status === 401) {
        setError('Session expired. Please sign in again.');
        return;
      }
      if (!wfRes.ok) {
        setError('Failed to load workflow status.');
        return;
      }
      const wfJson = await wfRes.json();
      setWorkflow(wfJson.data.locales);
      if (meRes.ok) {
        const meJson = await meRes.json();
        setRoles(meJson.data.user.roles ?? []);
      }
      const histRes = await fetch(`${base}/revisions`);
      if (histRes.ok) {
        const histJson = await histRes.json();
        setHistory(histJson.data.revisions);
      }
    } catch {
      setError('Failed to load workflow status.');
    }
  }, [base]);

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

  async function act(path: string, method: string, body?: unknown) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json().catch(() => null);
      if (res.status === 401) {
        setError('Session expired. Please sign in again.');
        return;
      }
      if (res.status === 403) {
        setError('Only ADMIN users can perform this action.');
        return;
      }
      if (res.status === 409) {
        setError(json?.error?.message ?? 'Conflict. Refreshing…');
        await load();
        return;
      }
      if (!res.ok) {
        setError(json?.error?.message ?? 'Action failed.');
        return;
      }
      setNotice('Done.');
      setReason('');
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <section style={box}>
        <h2>Publishing workflow</h2>
        <p>Loading…</p>
      </section>
    );
  }

  return (
    <section style={box}>
      <h2>Publishing workflow</h2>
      {error && <p role="alert" style={{ color: '#b00020' }}>{error}</p>}
      {notice && <p role="status" style={{ color: '#0a7d2c' }}>{notice}</p>}
      {workflow &&
        (['tr', 'en'] as const).map((locale) => {
          const w = workflow[locale];
          if (!w) return null;
          const open = w.openRevision;
          return (
            <div key={locale} style={{ borderTop: '1px solid #eee', padding: '0.75rem 0' }}>
              <h3>{locale.toUpperCase()}</h3>
              <p>
                Variant: <code>{w.lifecycleState}</code>
                {w.publishedRevisionNumber != null && <> · published rev #{w.publishedRevisionNumber}</>}
                {open && <> · open rev #{open.revisionNumber} (<code>{open.status}</code>)</>}
                {!open && w.publishedRevisionNumber == null && <> · no revisions yet</>}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(!open || open.status === 'REJECTED') && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => act(`${base}/revisions`, 'POST', { locale })}
                    style={{ cursor: 'pointer' }}
                  >
                    {open ? 'New draft from rejected' : w.publishedRevisionNumber != null ? 'New draft' : 'Create draft'}
                  </button>
                )}
                {open?.status === 'DRAFT' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => act(`/api/v1/admin/revisions/${open.id}/submit`, 'POST')}
                    style={{ cursor: 'pointer' }}
                  >
                    Submit for review
                  </button>
                )}
                {open?.status === 'IN_REVIEW' && isAdmin && (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => act(`/api/v1/admin/revisions/${open.id}/approve`, 'POST')}
                      style={{ cursor: 'pointer' }}
                    >
                      Approve
                    </button>
                    <input
                      placeholder="Rejection reason…"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      style={{ padding: '0.25rem' }}
                    />
                    <button
                      type="button"
                      disabled={busy || reason.trim() === ''}
                      onClick={() => act(`/api/v1/admin/revisions/${open.id}/reject`, 'POST', { reason })}
                      style={{ cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  </>
                )}
                {open?.status === 'IN_REVIEW' && !isAdmin && <span>Waiting for admin review.</span>}
                {open?.status === 'APPROVED' && isAdmin && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => act(`/api/v1/admin/revisions/${open.id}/publish`, 'POST')}
                    style={{ cursor: 'pointer' }}
                  >
                    Publish rev #{open.revisionNumber}
                  </button>
                )}
                {open?.status === 'APPROVED' && !isAdmin && <span>Approved — waiting for admin to publish.</span>}
                {w.lifecycleState === 'PUBLISHED' && isAdmin && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => act(`${base}/unpublish`, 'POST', { locale })}
                    style={{ cursor: 'pointer' }}
                  >
                    Unpublish
                  </button>
                )}
              </div>
            </div>
          );
        })}
      {history.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Revision history</h3>
          <ul>
            {history.map((r) => (
              <li key={r.id}>
                #{r.revisionNumber} [{r.locale ?? '?'}] <code>{r.status}</code> by {r.authorEmail ?? '—'}{' '}
                {r.approvals.map((a, i) => (
                  <span key={i}>
                    · {a.outcome} by {a.approverEmail ?? '—'}
                    {a.notes ? ` (“${a.notes}”)` : ''}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
