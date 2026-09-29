import { prisma } from '@/lib/prisma';
import { NotFoundError, ConflictError, ForbiddenError, BadRequestError } from '@/lib/api/errors';
import { normalizePagination, buildPaginationMeta } from '@/lib/api/validation';
import { writeAudit } from '@/services/adminAudit';
import {
  ALLOWED_QUOTE_TRANSITIONS,
  ADMIN_ONLY_QUOTE_TARGETS,
  QUOTE_REQUEST_STATES,
  type QuoteRequestState,
} from '@/lib/admin/quote-state';

// ============================================================
// Admin Quote Request management (server-side, session-guarded
// callers only). Read-only for submitted customer data: the only
// mutable field is `state` (plus server-side processor tracking).
// No deletion endpoint — submitted requests are historical records.
// ============================================================

/** List projection: identification + lifecycle only. No email/phone/message. */
const LIST_SELECT = {
  id: true,
  contactName: true,
  company: true,
  state: true,
  locale: true,
  submittedAt: true,
} as const;

export interface AdminQuoteListItem {
  id: string;
  contactName: string;
  company: string | null;
  state: QuoteRequestState;
  locale: string;
  submittedAt: string;
}

export interface AdminQuoteContext {
  contextKind: string;
  productId: string | null;
  projectId: string | null;
  applicationId: string | null;
  product: { id: string; trName: string | null; trSlug: string | null } | null;
  project: { id: string; trName: string | null; trSlug: string | null } | null;
  application: { id: string; trName: string | null; trSlug: string | null } | null;
}

export interface AdminQuoteDetail extends AdminQuoteListItem {
  contactEmail: string;
  contactPhone: string | null;
  message: string;
  processedAt: string | null;
  processedById: string | null;
  processorEmail: string | null;
  context: AdminQuoteContext | null;
}

function assertQuoteState(value: string): QuoteRequestState {
  if (!(QUOTE_REQUEST_STATES as readonly string[]).includes(value)) {
    throw new BadRequestError('Invalid quote request state.');
  }
  return value as QuoteRequestState;
}

export async function listAdminQuoteRequests(options: {
  page?: number;
  pageSize?: number;
  state?: string;
  q?: string;
}) {
  const state = options.state ? assertQuoteState(options.state) : undefined;
  const q = options.q?.trim();

  const { page, pageSize, skip } = normalizePagination({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
  });

  const where = {
    ...(state ? { state } : {}),
    ...(q
      ? {
          OR: [
            { contactName: { contains: q, mode: 'insensitive' as const } },
            { company: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.quoteRequest.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip,
      take: pageSize,
      select: LIST_SELECT,
    }),
    prisma.quoteRequest.count({ where }),
  ]);

  return {
    data: rows.map((row) => ({ ...row, state: row.state as QuoteRequestState, submittedAt: row.submittedAt.toISOString() })),
    meta: buildPaginationMeta(page, pageSize, total),
  };
}

type VariantRow = { locale: string; slug: string; name: string | null };

type ContextTargetRow = { contentItem?: { variants: VariantRow[] } } | null | undefined;

function contextTarget(
  id: string | null,
  target: ContextTargetRow
): { id: string; trName: string | null; trSlug: string | null } | null {
  if (!id || !target?.contentItem) return null;
  const tr = target.contentItem.variants.find((v) => v.locale === 'tr');
  return { id, trName: tr?.name ?? null, trSlug: tr?.slug ?? null };
}

export async function getAdminQuoteRequest(id: string): Promise<AdminQuoteDetail> {
  const row = await prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      processor: { select: { id: true, email: true } },
      context: {
        include: {
          product: { include: { contentItem: { include: { variants: true } } } },
          project: { include: { contentItem: { include: { variants: true } } } },
          application: { include: { contentItem: { include: { variants: true } } } },
        },
      },
    },
  });

  // Missing id → 404 through the authenticated admin API (IDOR guard).
  if (!row) {
    throw new NotFoundError('Quote request not found.');
  }

  return {
    id: row.id,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    company: row.company,
    message: row.message,
    locale: row.locale,
    state: row.state as QuoteRequestState,
    submittedAt: row.submittedAt.toISOString(),
    processedAt: row.processedAt ? row.processedAt.toISOString() : null,
    processedById: row.processedById,
    processorEmail: row.processor?.email ?? null,
    context: row.context
      ? {
          contextKind: row.context.contextKind,
          productId: row.context.productId,
          projectId: row.context.projectId,
          applicationId: row.context.applicationId,
          product: contextTarget(row.context.productId, row.context.product),
          project: contextTarget(row.context.projectId, row.context.project),
          application: contextTarget(row.context.applicationId, row.context.application),
        }
      : null,
  };
}

export interface QuoteActor {
  id: string;
  roles: string[];
}

/**
 * Change the status of a quote request. Only `state` is written —
 * submitted customer data is never modified. Records an audit event
 * with the transition (no PII) and stamps the acting processor.
 */
export async function setAdminQuoteState(id: string, nextState: string, actor: QuoteActor): Promise<AdminQuoteDetail> {
  const target = assertQuoteState(nextState);

  const row = await prisma.quoteRequest.findUnique({
    where: { id },
    select: { id: true, state: true },
  });
  if (!row) {
    throw new NotFoundError('Quote request not found.');
  }

  const current = row.state as QuoteRequestState;
  if (current === target) {
    throw new ConflictError(`Quote request is already in state "${target}".`);
  }
  if (!ALLOWED_QUOTE_TRANSITIONS[current].includes(target)) {
    throw new ConflictError(`Invalid status transition: ${current} → ${target}.`);
  }

  if (ADMIN_ONLY_QUOTE_TARGETS.includes(target)) {
    const owned = actor.roles.map((role) => role.toUpperCase());
    if (!owned.includes('ADMIN')) {
      throw new ForbiddenError('Only ADMIN users can close quote requests.');
    }
  }

  await prisma.quoteRequest.update({
    where: { id },
    data: {
      state: target,
      processedById: actor.id,
      processedAt: new Date(),
    },
  });

  await writeAudit(actor.id, 'QUOTE_STATE_UPDATE', null, { quoteId: id, from: current, to: target });

  return getAdminQuoteRequest(id);
}
