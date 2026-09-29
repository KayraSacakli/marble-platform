// ============================================================
// Quote request state machine (client-safe, no server imports).
// Shared by the admin service, validation schema and UI so the
// lifecycle is defined exactly once.
//
// Existing enum QuoteRequestState: PENDING → IN_REVIEW →
// RESPONDED → CLOSED (task's NEW→…→CLOSED adapted to schema).
// ============================================================

export const QUOTE_REQUEST_STATES = ['PENDING', 'IN_REVIEW', 'RESPONDED', 'CLOSED'] as const;

export type QuoteRequestState = (typeof QUOTE_REQUEST_STATES)[number];

/** Forward-only lifecycle. Invalid jumps are rejected server-side. */
export const ALLOWED_QUOTE_TRANSITIONS: Record<QuoteRequestState, QuoteRequestState[]> = {
  PENDING: ['IN_REVIEW'],
  IN_REVIEW: ['RESPONDED'],
  RESPONDED: ['CLOSED'],
  CLOSED: [],
};

/** Closing a request is terminal — ADMIN only (mirrors CMS delete/publish). */
export const ADMIN_ONLY_QUOTE_TARGETS: readonly QuoteRequestState[] = ['CLOSED'];

export function quoteStateLabel(state: QuoteRequestState): string {
  switch (state) {
    case 'PENDING':
      return 'New';
    case 'IN_REVIEW':
      return 'In review';
    case 'RESPONDED':
      return 'Responded';
    case 'CLOSED':
      return 'Closed';
  }
}
