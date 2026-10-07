'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ALLOWED_QUOTE_TRANSITIONS,
  ADMIN_ONLY_QUOTE_TARGETS,
  quoteStateLabel,
  type QuoteRequestState,
} from '@/lib/admin/quote-state';

const box: React.CSSProperties = { border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' };

export function QuoteStatusControl({
  quoteId,
  state,
}: {
  quoteId: string;
  state: QuoteRequestState;
}) {
  const router = useRouter();
  const [roles, setRoles] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/admin/auth/me');
        if (!cancelled && res.ok) {
          const json = await res.json();
          setRoles(json.data?.user?.roles ?? []);
        } else if (!cancelled) {
          setRoles([]);
        }
      } catch {
        if (!cancelled) setRoles([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isAdmin = roles?.includes('ADMIN') ?? false;

  const nextStates = ALLOWED_QUOTE_TRANSITIONS[state].filter(
    (target) => !ADMIN_ONLY_QUOTE_TARGETS.includes(target) || isAdmin,
  );

  const transition = useCallback(
    async (next: QuoteRequestState) => {
      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        const res = await fetch(`/api/v1/admin/quotes/${quoteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: next }),
        });
        const json = await res.json().catch(() => null);
        if (res.status === 401) {
          setError('Session expired. Please sign in again.');
          return;
        }
        if (res.status === 403) {
          setError(json?.error?.message ?? 'You do not have permission for this change.');
          return;
        }
        if (!res.ok) {
          setError(json?.error?.message ?? 'Status update failed.');
          return;
        }
        setNotice(`Status updated to “${quoteStateLabel(next)}”.`);
        router.refresh();
      } catch {
        setError('Status update failed.');
      } finally {
        setBusy(false);
      }
    },
    [quoteId, router],
  );

  return (
    <section style={box}>
      <h2>Status</h2>
      <p>
        Current: <code>{quoteStateLabel(state)}</code>
      </p>
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
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {roles === null ? (
          <span>Loading…</span>
        ) : nextStates.length === 0 ? (
          <span style={{ opacity: 0.7 }}>
            {state === 'CLOSED'
              ? 'Closed — no further changes.'
              : 'No further transitions available for your role.'}
          </span>
        ) : (
          nextStates.map((next) => (
            <button
              key={next}
              type="button"
              disabled={busy}
              onClick={() => transition(next)}
              style={{ cursor: 'pointer' }}
            >
              Mark as {quoteStateLabel(next)}
            </button>
          ))
        )}
      </div>
    </section>
  );
}
