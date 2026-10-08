/**
 * Phase 19B — content import (products, collections, applications,
 * company content) driven entirely through the existing admin API.
 *
 * The script NEVER bypasses validation, workflow, approval, or audit:
 * every step goes through the same endpoints the admin UI uses.
 *
 * Flow per product:
 *   media upload → product create → media attach → PRIMARY/alt preflight
 *   → revision submit → approve → publish → collection/application relations
 *
 * Usage:
 *   npm run import:content                      # dry-run (offline validation only)
 *   npm run import:content -- --execute         # real import (admin API required)
 *   npm run import:content -- --file content-import/products.json
 *   npm run import:content -- --base http://localhost:3000
 *
 * Environment (execute mode):
 *   IMPORT_ADMIN_EMAIL      admin login (must hold the ADMIN role to publish)
 *   IMPORT_ADMIN_PASSWORD   admin password
 *   IMPORT_BASE_URL         base URL of the running app (default http://localhost:3000)
 *
 * Dry-run never talks to the API. Execute mode requires `npm run dev` to be
 * running. A JSON report is written next to the template file
 * (<name>.report.json) after every run.
 */
import 'dotenv/config';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  adminProductCreateSchema,
  adminCollectionCreateSchema,
  adminApplicationCreateSchema,
  adminCompanyContentCreateSchema,
  companyContentKindSchema,
} from '../src/lib/api/validation';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOCALES = ['tr', 'en'] as const;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // mirrors MEDIA_MAX_UPLOAD_BYTES default
// Must match ADMIN_SESSION_COOKIE in src/lib/auth/session.ts (not imported:
// that module pulls in prisma + next/headers, which a standalone script
// must not load).
const ADMIN_SESSION_COOKIE = 'mp_admin_session';

// ============================================================
// Slug normalization
// ============================================================

const CHAR_FOLD: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  İ: 'i',
  I: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
  â: 'a',
  Â: 'a',
  î: 'i',
  Í: 'i',
  ï: 'i',
  û: 'u',
  Û: 'u',
  ñ: 'n',
  Ñ: 'n',
  á: 'a',
  à: 'a',
  ä: 'a',
  ã: 'a',
  å: 'a',
  é: 'e',
  è: 'e',
  ê: 'e',
  ë: 'e',
  í: 'i',
  ì: 'i',
  ó: 'o',
  ò: 'o',
  ô: 'o',
  õ: 'o',
  ú: 'u',
  ù: 'u',
  ý: 'y',
  ÿ: 'y',
};

/**
 * Fold to ASCII, lowercase, and replace every run of disallowed characters
 * with a single hyphen. Collisions are NOT resolved here — the caller
 * detects duplicates and reports them as explicit errors.
 */
export function normalizeSlug(input: string): string {
  const folded = [...input.trim()].map((ch) => CHAR_FOLD[ch] ?? ch).join('');
  return folded
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 500);
}

// ============================================================
// Template schema
// ============================================================

const mediaEntrySchema = z.object({
  file: z.string().min(1, 'Media file path is required.'),
  role: z.enum(['PRIMARY', 'GALLERY', 'HERO']),
  altTr: z.string().min(1, 'TR alt text is required.').max(500),
  altEn: z.string().min(1, 'EN alt text is required.').max(500),
});

export type MediaEntry = z.infer<typeof mediaEntrySchema>;

const productEntrySchema = adminProductCreateSchema
  .extend({
    media: z.array(mediaEntrySchema).default([]),
    collections: z.array(z.string().min(1)).default([]),
    applications: z.array(z.string().min(1)).default([]),
  })
  .strict();

const taxonomyEntrySchema = adminCollectionCreateSchema
  .extend({ media: z.array(mediaEntrySchema).default([]) })
  .strict();

const applicationEntrySchema = adminApplicationCreateSchema
  .extend({ media: z.array(mediaEntrySchema).default([]) })
  .strict();

const companyEntrySchema = adminCompanyContentCreateSchema
  .extend({ kind: companyContentKindSchema })
  .strict();

export const templateSchema = z
  .object({
    _instructions: z.string().optional(),
    companyContent: z.array(companyEntrySchema).default([]),
    collections: z.array(taxonomyEntrySchema).default([]),
    applications: z.array(applicationEntrySchema).default([]),
    products: z.array(productEntrySchema).default([]),
  })
  .strict();

export type Template = z.infer<typeof templateSchema>;
export type ProductEntry = z.infer<typeof productEntrySchema>;
export type TaxonomyEntry = z.infer<typeof taxonomyEntrySchema>;
export type CompanyEntry = z.infer<typeof companyEntrySchema>;

// ============================================================
// Preflight (offline validation, no API calls)
// ============================================================

export interface SlugNormalization {
  scope: string;
  locale: string;
  from: string;
  to: string;
}

export interface PreflightEntryResult {
  type: 'product' | 'collection' | 'application' | 'companyContent';
  key: string;
  errors: string[];
  warnings: string[];
}

export interface PreflightResult {
  template: Template | null;
  errors: string[];
  normalizations: SlugNormalization[];
  entries: PreflightEntryResult[];
}

interface RawEntryContext {
  type: PreflightEntryResult['type'];
  scope: string;
  key: string;
  entry: Record<string, unknown>;
}

function iterRawEntries(raw: unknown): RawEntryContext[] {
  const out: RawEntryContext[] = [];
  if (!raw || typeof raw !== 'object') return out;
  const root = raw as Record<string, unknown>;
  const groups: Array<[string, PreflightEntryResult['type']]> = [
    ['products', 'product'],
    ['collections', 'collection'],
    ['applications', 'application'],
    ['companyContent', 'companyContent'],
  ];
  for (const [group, type] of groups) {
    const arr = root[group];
    if (!Array.isArray(arr)) continue;
    arr.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') return;
      const e = entry as Record<string, unknown>;
      const tr = e.tr as Record<string, unknown> | undefined;
      const key =
        type === 'companyContent'
          ? String(e.kind ?? `#${index}`)
          : typeof tr?.slug === 'string'
            ? tr.slug
            : `#${index}`;
      out.push({ type, scope: `${group}[${index}]`, key, entry: e });
    });
  }
  return out;
}

function normalizeRawSlugs(raw: unknown): {
  prepared: unknown;
  normalizations: SlugNormalization[];
} {
  const normalizations: SlugNormalization[] = [];
  if (!raw || typeof raw !== 'object') return { prepared: raw, normalizations };
  const prepared = JSON.parse(JSON.stringify(raw)) as Record<string, unknown>;
  for (const ctx of iterRawEntries(prepared)) {
    for (const locale of LOCALES) {
      const variant = ctx.entry[locale] as Record<string, unknown> | undefined;
      if (!variant || typeof variant.slug !== 'string') continue;
      const from = variant.slug;
      const to = normalizeSlug(from);
      variant.slug = to;
      if (from !== to) {
        normalizations.push({ scope: ctx.scope, locale, from, to });
      }
    }
  }
  return { prepared, normalizations };
}

/**
 * Validate the template fully offline:
 *  - Zod shape (strict — unknown keys are errors)
 *  - slug normalization + cross-entry slug collisions (explicit errors)
 *  - media files exist and respect the upload size limit
 *  - products declare a PRIMARY media entry with TR and EN alt text
 *  - kind duplicates for company content
 *  - relation references that cannot be resolved offline become warnings
 *    (they are resolved against the API in execute mode)
 */
export function preflightTemplate(raw: unknown, baseDir: string): PreflightResult {
  const { prepared, normalizations } = normalizeRawSlugs(raw);
  const parsed = templateSchema.safeParse(prepared);
  if (!parsed.success) {
    const errors = parsed.error.issues.map(
      (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
    );
    return { template: null, errors, normalizations, entries: [] };
  }
  const template = parsed.data;
  const errors: string[] = [];
  const entries: PreflightEntryResult[] = [];

  // Slug registry across every entry and locale — mirrors the DB rule
  // (one slug per locale across all content types).
  const slugRegistry = new Map<string, string>();
  const registerSlug = (
    entry: PreflightEntryResult,
    scope: string,
    locale: 'tr' | 'en',
    slug: string,
  ) => {
    if (!slug) {
      entry.errors.push(`${locale}: slug is empty after normalization.`);
      return;
    }
    const key = `${locale}:${slug}`;
    const owner = slugRegistry.get(key);
    if (owner) {
      entry.errors.push(
        `Slug collision (${locale}): "${slug}" is already used by ${owner} in this file. Collisions are never resolved silently — rename one of the entries.`,
      );
      errors.push(`Slug collision (${locale}): "${slug}" (${scope} conflicts with ${owner}).`);
      return;
    }
    slugRegistry.set(key, scope);
  };

  const mediaOk = (
    entry: PreflightEntryResult,
    scope: string,
    media: MediaEntry[],
    requirePrimary: boolean,
  ) => {
    if (requirePrimary && !media.some((m) => m.role === 'PRIMARY')) {
      entry.errors.push(
        'At least one PRIMARY media entry with TR and EN alt text is required before publish.',
      );
    }
    for (const m of media) {
      const abs = path.resolve(baseDir, m.file);
      if (!existsSync(abs)) {
        entry.errors.push(`Media file not found: ${m.file} (resolved: ${abs}).`);
        continue;
      }
      const size = statSync(abs).size;
      if (size === 0) {
        entry.errors.push(`Media file is empty: ${m.file}.`);
      } else if (size > MAX_UPLOAD_BYTES) {
        entry.errors.push(`Media file exceeds the 5 MB upload limit: ${m.file} (${size} bytes).`);
      }
      void scope;
    }
  };

  const collectionSlugs = new Set(
    template.collections.map((c) => c.tr.slug).filter((s) => s.length > 0),
  );
  const applicationSlugs = new Set(
    template.applications.map((a) => a.tr.slug).filter((s) => s.length > 0),
  );

  const kindSeen = new Set<string>();
  template.companyContent.forEach((entry, i) => {
    const scope = `companyContent[${i}]`;
    const result: PreflightEntryResult = {
      type: 'companyContent',
      key: entry.kind,
      errors: [],
      warnings: [],
    };
    if (kindSeen.has(entry.kind)) {
      result.errors.push(`Duplicate company content kind: ${entry.kind}.`);
    }
    kindSeen.add(entry.kind);
    for (const locale of LOCALES) {
      registerSlug(result, scope, locale, entry[locale].slug);
    }
    entries.push(result);
  });

  const taxonomyEntries: Array<[TaxonomyEntry, PreflightEntryResult, string]> = [];
  template.collections.forEach((entry, i) => {
    const scope = `collections[${i}]`;
    const result: PreflightEntryResult = {
      type: 'collection',
      key: entry.tr.slug,
      errors: [],
      warnings: [],
    };
    for (const locale of LOCALES) {
      registerSlug(result, scope, locale, entry[locale].slug);
    }
    mediaOk(result, scope, entry.media, entry.media.length > 0);
    taxonomyEntries.push([entry, result, scope]);
  });
  template.applications.forEach((entry, i) => {
    const scope = `applications[${i}]`;
    const result: PreflightEntryResult = {
      type: 'application',
      key: entry.tr.slug,
      errors: [],
      warnings: [],
    };
    for (const locale of LOCALES) {
      registerSlug(result, scope, locale, entry[locale].slug);
    }
    mediaOk(result, scope, entry.media, entry.media.length > 0);
    taxonomyEntries.push([entry, result, scope]);
  });
  for (const [, result] of taxonomyEntries) entries.push(result);

  template.products.forEach((entry, i) => {
    const scope = `products[${i}]`;
    const result: PreflightEntryResult = {
      type: 'product',
      key: entry.tr.slug,
      errors: [],
      warnings: [],
    };
    for (const locale of LOCALES) {
      registerSlug(result, scope, locale, entry[locale].slug);
    }
    mediaOk(result, scope, entry.media, true);
    for (const ref of entry.collections) {
      if (!collectionSlugs.has(ref)) {
        result.warnings.push(
          `Collection "${ref}" is not defined in this file — it will be resolved against the API at execute time.`,
        );
      }
    }
    for (const ref of entry.applications) {
      if (!applicationSlugs.has(ref)) {
        result.warnings.push(
          `Application "${ref}" is not defined in this file — it will be resolved against the API at execute time.`,
        );
      }
    }
    entries.push(result);
  });

  if (template.products.length === 0 && template.companyContent.length === 0) {
    errors.push('Template contains no products and no company content.');
  }

  return { template, errors, normalizations, entries };
}

// ============================================================
// Admin API client
// ============================================================

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface Session {
  base: string;
  cookie: string;
  email: string;
  roles: string[];
}

function stripSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function extractCookie(res: Response): string {
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  const list =
    typeof headers.getSetCookie === 'function'
      ? headers.getSetCookie()
      : res.headers.get('set-cookie')
        ? [res.headers.get('set-cookie') as string]
        : [];
  const match = list.find((c) => c.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  if (!match) {
    throw new ApiError('Login response did not set the admin session cookie.', 401, 'NO_SESSION');
  }
  const value = match.split(';', 1)[0];
  return value;
}

async function api<T = unknown>(
  session: Session,
  method: string,
  apiPath: string,
  body?: unknown,
  rawInit?: { body?: BodyInit; headers?: Record<string, string> },
): Promise<T> {
  const headers: Record<string, string> = { cookie: session.cookie, ...(rawInit?.headers ?? {}) };
  let payload: BodyInit | undefined;
  if (rawInit?.body !== undefined) {
    payload = rawInit.body;
  } else if (body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res: Response;
  try {
    res = await fetch(`${session.base}${apiPath}`, {
      method,
      headers,
      body: payload,
    });
  } catch (error) {
    throw new ApiError(
      `Cannot reach ${session.base}${apiPath}: ${error instanceof Error ? error.message : String(error)}`,
      0,
      'NETWORK_ERROR',
    );
  }
  const json = (await res.json().catch(() => null)) as {
    data?: T;
    error?: { message?: string; code?: string };
  } | null;
  if (!res.ok) {
    throw new ApiError(
      json?.error?.message ?? `HTTP ${res.status} ${res.statusText}`,
      res.status,
      json?.error?.code ?? `HTTP_${res.status}`,
    );
  }
  return json?.data as T;
}

async function login(base: string, email: string, password: string): Promise<Session> {
  const res = await fetch(`${base}/api/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = (await res.json().catch(() => null)) as {
    data?: { user?: { email?: string; roles?: string[] } };
    error?: { message?: string; code?: string };
  } | null;
  if (!res.ok) {
    throw new ApiError(
      json?.error?.message ?? `Login failed (HTTP ${res.status}).`,
      res.status,
      json?.error?.code ?? 'LOGIN_FAILED',
    );
  }
  return {
    base,
    cookie: extractCookie(res),
    email: json?.data?.user?.email ?? email,
    roles: json?.data?.user?.roles ?? [],
  };
}

// ============================================================
// Report
// ============================================================

type EntryStatus = 'PUBLISHED' | 'FAILED' | 'SKIPPED';

interface StepLog {
  step: string;
  ok: boolean;
  detail?: string;
}

interface EntryReport {
  type: PreflightEntryResult['type'];
  key: string;
  status: EntryStatus;
  id?: string;
  slugs?: { tr: string; en: string };
  errors: string[];
  warnings: string[];
  steps: StepLog[];
}

interface ImportReport {
  mode: 'dry-run' | 'execute';
  file: string;
  base?: string;
  startedAt: string;
  finishedAt: string;
  counts: Record<string, number>;
  globalErrors: string[];
  entries: EntryReport[];
}

function step(steps: StepLog[], name: string, ok: boolean, detail?: string): void {
  steps.push({ step: name, ok, ...(detail ? { detail } : {}) });
}

// ============================================================
// Execute helpers
// ============================================================

interface WorkflowRevisionRef {
  id: string;
  status: string;
}

interface WorkflowResponse {
  productId: string;
  locales: Record<
    string,
    {
      locale: string;
      lifecycleState: string;
      openRevision: WorkflowRevisionRef | null;
      publishedRevisionNumber: number | null;
    }
  >;
}

interface MediaRow {
  rowId: string;
  variant: 'tr' | 'en';
  assetId: string;
  src: string;
  role: 'PRIMARY' | 'GALLERY' | 'HERO';
  displayOrder: number;
  altText: string | null;
}

function detailOf(error: unknown): string {
  if (error instanceof ApiError) return `${error.code}: ${error.message}`;
  return error instanceof Error ? error.message : String(error);
}

async function uploadMediaFile(session: Session, absPath: string): Promise<string> {
  const bytes = readFileSync(absPath);
  if (bytes.length > MAX_UPLOAD_BYTES) {
    throw new ApiError(
      `File exceeds the 5 MB upload limit: ${path.basename(absPath)}`,
      422,
      'TOO_LARGE',
    );
  }
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(bytes)]), path.basename(absPath));
  const asset = await api<{ id: string }>(session, 'POST', '/api/v1/admin/media', undefined, {
    body: form,
  });
  return asset.id;
}

async function publishFromWorkflow(
  session: Session,
  workflow: WorkflowResponse,
  steps: StepLog[],
): Promise<string[]> {
  const errors: string[] = [];
  for (const locale of LOCALES) {
    const open = workflow.locales[locale]?.openRevision ?? null;
    if (!open) {
      errors.push(`${locale}: no open revision found — nothing can be published.`);
      continue;
    }
    try {
      if (open.status === 'DRAFT') {
        await api(session, 'POST', `/api/v1/admin/revisions/${open.id}/submit`);
        step(steps, `submit:${locale}`, true);
      }
      const afterSubmit = open.status === 'DRAFT' ? 'IN_REVIEW' : open.status;
      if (afterSubmit === 'IN_REVIEW') {
        await api(session, 'POST', `/api/v1/admin/revisions/${open.id}/approve`, {
          notes: 'Phase 19B import (scripts/import-content.ts)',
        });
        step(steps, `approve:${locale}`, true);
      }
      const afterApprove = afterSubmit === 'IN_REVIEW' ? 'APPROVED' : afterSubmit;
      if (afterApprove === 'APPROVED') {
        await api(session, 'POST', `/api/v1/admin/revisions/${open.id}/publish`);
        step(steps, `publish:${locale}`, true);
      }
    } catch (error) {
      step(steps, `publish:${locale}`, false, detailOf(error));
      errors.push(`${locale}: publish failed — ${detailOf(error)}`);
    }
  }
  return errors;
}

async function publishLocales(
  session: Session,
  contentPath: string,
  contentId: string,
  steps: StepLog[],
): Promise<string[]> {
  let workflow: WorkflowResponse;
  try {
    workflow = await api<WorkflowResponse>(session, 'GET', `${contentPath}/${contentId}/workflow`);
  } catch (error) {
    return [`workflow lookup failed — ${detailOf(error)}`];
  }
  return publishFromWorkflow(session, workflow, steps);
}

async function verifyPrimaryMedia(
  session: Session,
  contentPath: string,
  contentId: string,
): Promise<string[]> {
  const rows = await api<{ media: MediaRow[] }>(
    session,
    'GET',
    `${contentPath}/${contentId}/media`,
  );
  const errors: string[] = [];
  for (const locale of LOCALES) {
    const ok = rows.media.some(
      (r) => r.role === 'PRIMARY' && r.variant === locale && (r.altText ?? '').trim() !== '',
    );
    if (!ok) {
      errors.push(
        `${locale}: PRIMARY media with ${locale.toUpperCase()} alt text is missing — publish blocked.`,
      );
    }
  }
  return errors;
}

async function verifyAttachedMedia(
  session: Session,
  contentPath: string,
  contentId: string,
  expected: Array<{ assetId: string }>,
): Promise<string[]> {
  const rows = await api<{ media: MediaRow[] }>(
    session,
    'GET',
    `${contentPath}/${contentId}/media`,
  );
  const errors: string[] = [];
  for (const want of expected) {
    for (const locale of LOCALES) {
      const row = rows.media.find((r) => r.assetId === want.assetId && r.variant === locale);
      if (!row) {
        errors.push(`${locale}: attached media ${want.assetId} not found on ${contentPath}.`);
      } else if ((row.altText ?? '').trim() === '') {
        errors.push(`${locale}: attached media ${want.assetId} has no alt text.`);
      }
    }
  }
  return errors;
}

function resolveMedia(
  entry: { media: MediaEntry[] },
  baseDir: string,
  uploaded: Map<string, string>,
): string[] {
  const errors: string[] = [];
  for (const m of entry.media) {
    const abs = path.resolve(baseDir, m.file);
    if (!uploaded.has(abs) && !existsSync(abs)) {
      errors.push(`Media file not found: ${m.file}`);
    }
  }
  return errors;
}

async function ensureTaxonomy(
  session: Session,
  kind: 'collections' | 'applications',
  entry: TaxonomyEntry,
  registry: Map<string, string>,
  steps: StepLog[],
): Promise<string> {
  const slug = entry.tr.slug;
  const cached = registry.get(
    kind === 'collections' ? `collection:${slug}` : `application:${slug}`,
  );
  if (cached) return cached;

  // Look for an existing item with the same TR slug.
  const list = await api<{ data: Array<{ id: string; tr: { slug: string } | null }> }>(
    session,
    'GET',
    `/api/v1/admin/${kind}?q=${encodeURIComponent(slug)}&pageSize=50`,
  );
  const found = list.data.find((item) => item.tr?.slug === slug);
  if (found) {
    step(steps, `ensure:${kind}:${slug}`, true, 'already exists — reused');
    registry.set(kind === 'collections' ? `collection:${slug}` : `application:${slug}`, found.id);
    return found.id;
  }

  const { media: _media, ...body } = entry;
  const created = await api<{ id: string }>(session, 'POST', `/api/v1/admin/${kind}`, body);
  step(steps, `ensure:${kind}:${slug}`, true, 'created');
  registry.set(kind === 'collections' ? `collection:${slug}` : `application:${slug}`, created.id);
  return created.id;
}

async function attachMediaEntries(
  session: Session,
  contentPath: string,
  contentId: string,
  entry: { media: MediaEntry[] },
  baseDir: string,
  uploaded: Map<string, string>,
  steps: StepLog[],
): Promise<Array<{ assetId: string }>> {
  const attached: Array<{ assetId: string }> = [];
  for (const m of entry.media) {
    const abs = path.resolve(baseDir, m.file);
    let assetId = uploaded.get(abs);
    if (!assetId) {
      assetId = await uploadMediaFile(session, abs);
      uploaded.set(abs, assetId);
      step(steps, `upload:${path.basename(m.file)}`, true, assetId);
    }
    await api(session, 'POST', `${contentPath}/${contentId}/media`, {
      assetId,
      role: m.role,
      altTr: m.altTr,
      altEn: m.altEn,
    });
    step(steps, `attach:${m.role}:${path.basename(m.file)}`, true);
    attached.push({ assetId });
  }
  return attached;
}

// ============================================================
// Execute
// ============================================================

async function executeImport(
  template: Template,
  preflight: PreflightResult,
  baseDir: string,
  base: string,
): Promise<EntryReport[]> {
  const email = process.env.IMPORT_ADMIN_EMAIL;
  const password = process.env.IMPORT_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('IMPORT_ADMIN_EMAIL and IMPORT_ADMIN_PASSWORD are required in --execute mode.');
  }

  const session = await login(base, email, password);
  console.log(`[auth] logged in as ${session.email} (roles: ${session.roles.join(', ')})`);
  if (!session.roles.includes('ADMIN')) {
    console.warn(
      '[auth] WARNING: the account does not hold the ADMIN role — approve/publish will fail.',
    );
  }

  const reports: EntryReport[] = [];
  const uploaded = new Map<string, string>();
  const registry = new Map<string, string>();

  const reportEntry = (
    type: PreflightEntryResult['type'],
    key: string,
    status: EntryStatus,
    errors: string[],
    warnings: string[],
    stepsDone: StepLog[],
    extra?: { id?: string; slugs?: { tr: string; en: string } },
  ): EntryReport => {
    const entryReport: EntryReport = {
      type,
      key,
      status,
      errors,
      warnings,
      steps: stepsDone,
      ...(extra?.id ? { id: extra.id } : {}),
      ...(extra?.slugs ? { slugs: extra.slugs } : {}),
    };
    reports.push(entryReport);
    const marker = status === 'PUBLISHED' ? 'ok' : status.toLowerCase();
    console.log(
      `[${marker}] ${type} "${key}" — ${status}` +
        (errors.length ? ` — ${errors.length} error(s)` : ''),
    );
    for (const err of errors) console.log(`    ERROR: ${err}`);
    for (const warn of warnings) console.log(`    warn: ${warn}`);
    return entryReport;
  };

  // Preflight lookup helper keyed by (type, key) in declaration order.
  const remaining = [...preflight.entries];
  const take = (type: PreflightEntryResult['type'], key: string): PreflightEntryResult => {
    const idx = remaining.findIndex((e) => e.type === type && e.key === key);
    if (idx >= 0) return remaining.splice(idx, 1)[0];
    return { type, key, errors: [], warnings: [] };
  };

  // 1) Collections / applications referenced or defined in the template.
  for (const entry of template.collections) {
    const pf = take('collection', entry.tr.slug);
    if (pf.errors.length > 0) {
      reportEntry('collection', entry.tr.slug, 'SKIPPED', pf.errors, pf.warnings, []);
      continue;
    }
    const warnings = [...pf.warnings];
    const steps: StepLog[] = [];
    try {
      const id = await ensureTaxonomy(session, 'collections', entry, registry, steps);
      const errors: string[] = [];
      if (entry.media.length > 0) {
        const mediaErrors = resolveMedia(entry, baseDir, uploaded);
        if (mediaErrors.length === 0) {
          const attached = await attachMediaEntries(
            session,
            '/api/v1/admin/collections',
            id,
            entry,
            baseDir,
            uploaded,
            steps,
          );
          errors.push(
            ...(await verifyAttachedMedia(session, '/api/v1/admin/collections', id, attached)),
          );
        } else {
          errors.push(...mediaErrors);
        }
      }
      if (errors.length === 0) {
        errors.push(...(await publishLocales(session, '/api/v1/admin/collections', id, steps)));
      }
      reportEntry(
        'collection',
        entry.tr.slug,
        errors.length ? 'FAILED' : 'PUBLISHED',
        errors,
        warnings,
        steps,
        { id, slugs: { tr: entry.tr.slug, en: entry.en.slug } },
      );
    } catch (error) {
      reportEntry('collection', entry.tr.slug, 'FAILED', [detailOf(error)], warnings, steps);
    }
  }

  for (const entry of template.applications) {
    const pf = take('application', entry.tr.slug);
    if (pf.errors.length > 0) {
      reportEntry('application', entry.tr.slug, 'SKIPPED', pf.errors, pf.warnings, []);
      continue;
    }
    const warnings = [...pf.warnings];
    const steps: StepLog[] = [];
    try {
      const id = await ensureTaxonomy(session, 'applications', entry, registry, steps);
      const errors: string[] = [];
      if (entry.media.length > 0) {
        const mediaErrors = resolveMedia(entry, baseDir, uploaded);
        if (mediaErrors.length === 0) {
          const attached = await attachMediaEntries(
            session,
            '/api/v1/admin/applications',
            id,
            entry,
            baseDir,
            uploaded,
            steps,
          );
          errors.push(
            ...(await verifyAttachedMedia(session, '/api/v1/admin/applications', id, attached)),
          );
        } else {
          errors.push(...mediaErrors);
        }
      }
      if (errors.length === 0) {
        errors.push(...(await publishLocales(session, '/api/v1/admin/applications', id, steps)));
      }
      reportEntry(
        'application',
        entry.tr.slug,
        errors.length ? 'FAILED' : 'PUBLISHED',
        errors,
        warnings,
        steps,
        { id, slugs: { tr: entry.tr.slug, en: entry.en.slug } },
      );
    } catch (error) {
      reportEntry('application', entry.tr.slug, 'FAILED', [detailOf(error)], warnings, steps);
    }
  }

  // 2) Company content.
  for (const entry of template.companyContent) {
    const pf = take('companyContent', entry.kind);
    if (pf.errors.length > 0) {
      reportEntry('companyContent', entry.kind, 'SKIPPED', pf.errors, pf.warnings, []);
      continue;
    }
    const warnings = [...pf.warnings];
    const steps: StepLog[] = [];
    const { kind, ...body } = entry;
    try {
      let contentId: string;
      let workflow: WorkflowResponse;
      try {
        const existing = await api<{ content: { id: string }; workflow: WorkflowResponse }>(
          session,
          'GET',
          `/api/v1/admin/company-content/${kind}`,
        );
        contentId = existing.content.id;
        step(steps, 'lookup', true, 'already exists — updating');
        const updated = await api<{ content: { id: string }; workflow: WorkflowResponse }>(
          session,
          'PATCH',
          `/api/v1/admin/company-content/${kind}`,
          body,
        );
        workflow = updated.workflow;
        step(steps, 'update', true);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          const created = await api<{ content: { id: string }; workflow: WorkflowResponse }>(
            session,
            'POST',
            `/api/v1/admin/company-content/${kind}`,
            body,
          );
          contentId = created.content.id;
          workflow = created.workflow;
          step(steps, 'create', true);
        } else {
          throw error;
        }
      }
      const errors = await publishFromWorkflow(session, workflow, steps);
      reportEntry(
        'companyContent',
        kind,
        errors.length ? 'FAILED' : 'PUBLISHED',
        errors,
        warnings,
        steps,
        { id: contentId },
      );
    } catch (error) {
      reportEntry('companyContent', kind, 'FAILED', [detailOf(error)], warnings, steps);
    }
  }

  // 3) Products: media upload → create → attach → verify → publish → relations.
  for (const entry of template.products) {
    const pf = take('product', entry.tr.slug);
    const warnings = [...pf.warnings];
    if (pf.errors.length > 0) {
      reportEntry('product', entry.tr.slug, 'SKIPPED', pf.errors, warnings, []);
      continue;
    }
    const steps: StepLog[] = [];
    const errors: string[] = [];
    const { media, collections, applications, ...productBody } = entry;
    let productId: string | undefined;

    try {
      // Media upload first so a broken file never creates a product.
      const mediaErrors = resolveMedia(entry, baseDir, uploaded);
      if (mediaErrors.length > 0) {
        reportEntry('product', entry.tr.slug, 'SKIPPED', mediaErrors, warnings, steps);
        continue;
      }

      const created = await api<{ id: string }>(
        session,
        'POST',
        '/api/v1/admin/products',
        productBody,
      );
      productId = created.id;
      step(steps, 'create', true, productId);

      await attachMediaEntries(
        session,
        '/api/v1/admin/products',
        productId,
        { media },
        baseDir,
        uploaded,
        steps,
      );

      // PRIMARY + TR/EN alt text gate — never publish without it.
      const mediaGate = await verifyPrimaryMedia(session, '/api/v1/admin/products', productId);
      step(steps, 'media-gate', mediaGate.length === 0);
      if (mediaGate.length > 0) {
        errors.push(...mediaGate);
        reportEntry('product', entry.tr.slug, 'FAILED', errors, warnings, steps, {
          id: productId,
          slugs: { tr: entry.tr.slug, en: entry.en.slug },
        });
        continue;
      }

      errors.push(...(await publishLocales(session, '/api/v1/admin/products', productId, steps)));

      if (errors.length === 0) {
        for (const ref of entry.collections) {
          try {
            const id = await resolveTaxonomyId(session, 'collections', ref, registry);
            await api(session, 'POST', `/api/v1/admin/collections/${id}/products`, {
              productId,
            });
            step(steps, `relation:collection:${ref}`, true);
          } catch (error) {
            step(steps, `relation:collection:${ref}`, false, detailOf(error));
            errors.push(`Collection relation "${ref}" failed — ${detailOf(error)}`);
          }
        }
        for (const ref of entry.applications) {
          try {
            const id = await resolveTaxonomyId(session, 'applications', ref, registry);
            await api(session, 'POST', `/api/v1/admin/applications/${id}/products`, {
              productId,
            });
            step(steps, `relation:application:${ref}`, true);
          } catch (error) {
            step(steps, `relation:application:${ref}`, false, detailOf(error));
            errors.push(`Application relation "${ref}" failed — ${detailOf(error)}`);
          }
        }
      }

      reportEntry(
        'product',
        entry.tr.slug,
        errors.length ? 'FAILED' : 'PUBLISHED',
        errors,
        warnings,
        steps,
        { id: productId, slugs: { tr: entry.tr.slug, en: entry.en.slug } },
      );
    } catch (error) {
      errors.push(detailOf(error));
      step(steps, 'create', false, detailOf(error));
      reportEntry('product', entry.tr.slug, 'FAILED', errors, warnings, steps, {
        ...(productId ? { id: productId } : {}),
        slugs: { tr: entry.tr.slug, en: entry.en.slug },
      });
    }
  }

  try {
    await api(session, 'POST', '/api/v1/admin/auth/logout');
  } catch {
    // Best effort — the session expires on its own.
  }

  return reports;
}

async function resolveTaxonomyId(
  session: Session,
  kind: 'collections' | 'applications',
  slug: string,
  registry: Map<string, string>,
): Promise<string> {
  const registryKey = kind === 'collections' ? `collection:${slug}` : `application:${slug}`;
  const cached = registry.get(registryKey);
  if (cached) return cached;
  const list = await api<{ data: Array<{ id: string; tr: { slug: string } | null }> }>(
    session,
    'GET',
    `/api/v1/admin/${kind}?q=${encodeURIComponent(slug)}&pageSize=50`,
  );
  const found = list.data.find((item) => item.tr?.slug === slug);
  if (!found) {
    throw new ApiError(
      `No ${kind.slice(0, -1)} with TR slug "${slug}" exists in the template or the API.`,
      404,
      'REFERENCE_NOT_FOUND',
    );
  }
  registry.set(registryKey, found.id);
  return found.id;
}

// ============================================================
// CLI
// ============================================================

interface CliArgs {
  file: string;
  base: string;
  execute: boolean;
  help: boolean;
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    file: 'content-import/products.json',
    base: stripSlash(process.env.IMPORT_BASE_URL || 'http://localhost:3000'),
    execute: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--execute') args.execute = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--file') {
      const value = argv[i + 1];
      if (!value) throw new Error('--file requires a path.');
      args.file = value;
      i += 1;
    } else if (arg === '--base') {
      const value = argv[i + 1];
      if (!value) throw new Error('--base requires a URL.');
      args.base = stripSlash(value);
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

const HELP = `Phase 19B content import

Usage:
  npm run import:content [-- options]

Options:
  --file <path>   Template JSON (default: content-import/products.json)
  --base <url>    Admin API base URL (default: $IMPORT_BASE_URL or http://localhost:3000)
  --execute       Perform the real import (default is an offline dry-run)
  --help          Show this help

Environment for --execute:
  IMPORT_ADMIN_EMAIL, IMPORT_ADMIN_PASSWORD (required)
  IMPORT_BASE_URL (optional)
`;

function buildReport(
  mode: 'dry-run' | 'execute',
  file: string,
  base: string | undefined,
  startedAt: Date,
  globalErrors: string[],
  entries: EntryReport[],
): ImportReport {
  const counts: Record<string, number> = { total: entries.length };
  for (const e of entries) {
    counts[e.status.toLowerCase()] = (counts[e.status.toLowerCase()] ?? 0) + 1;
  }
  return {
    mode,
    file,
    ...(base ? { base } : {}),
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    counts,
    globalErrors,
    entries,
  };
}

function writeReport(file: string, report: ImportReport): string {
  const dir = path.dirname(file);
  const name = path.basename(file, path.extname(file));
  const reportPath = path.join(dir, `${name}.report.json`);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return reportPath;
}

function printSummary(report: ImportReport, reportPath: string): void {
  console.log('');
  console.log('== Summary ==');
  console.log(`mode: ${report.mode}`);
  for (const [key, value] of Object.entries(report.counts)) {
    console.log(`${key}: ${value}`);
  }
  if (report.globalErrors.length > 0) {
    console.log('global errors:');
    for (const err of report.globalErrors) console.log(`  ERROR: ${err}`);
  }
  const failed = report.entries.filter((e) => e.status !== 'PUBLISHED');
  if (failed.length > 0) {
    console.log('non-published entries:');
    for (const entry of failed) {
      console.log(`  ${entry.status} ${entry.type} "${entry.key}"`);
      for (const err of entry.errors) console.log(`    - ${err}`);
    }
  }
  console.log(`report: ${reportPath}`);
}

async function main(): Promise<void> {
  const startedAt = new Date();
  let args: CliArgs;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.log(HELP);
    process.exit(2);
    return;
  }
  if (args.help) {
    console.log(HELP);
    return;
  }

  const file = path.resolve(process.cwd(), args.file);
  if (!existsSync(file)) {
    console.error(`Template not found: ${file}`);
    process.exit(2);
    return;
  }
  const baseDir = path.dirname(file);

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(
      `Cannot parse ${file}: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(2);
    return;
  }

  console.log(`[preflight] file: ${file}`);
  const preflight = preflightTemplate(raw, baseDir);
  for (const n of preflight.normalizations) {
    console.log(`[preflight] slug normalized: ${n.scope} ${n.locale} "${n.from}" -> "${n.to}"`);
  }
  for (const entry of preflight.entries) {
    for (const err of entry.errors) {
      console.log(`[preflight] ERROR ${entry.type} "${entry.key}": ${err}`);
    }
    for (const warn of entry.warnings) {
      console.log(`[preflight] warn ${entry.type} "${entry.key}": ${warn}`);
    }
  }
  for (const err of preflight.errors) {
    console.log(`[preflight] ERROR: ${err}`);
  }

  const structuralOk =
    preflight.template !== null &&
    preflight.errors.length === 0 &&
    preflight.entries.every((e) => e.errors.length === 0);

  if (!args.execute) {
    const entries: EntryReport[] = preflight.entries.map((e) => ({
      type: e.type,
      key: e.key,
      status: e.errors.length > 0 ? 'SKIPPED' : 'PUBLISHED',
      errors: e.errors,
      warnings: e.warnings,
      steps: [],
    }));
    const report = buildReport(
      'dry-run',
      file,
      undefined,
      startedAt,
      preflight.template === null ? preflight.errors : [],
      entries,
    );
    const reportPath = writeReport(file, report);
    printSummary(report, reportPath);
    if (structuralOk) {
      console.log('DRY RUN OK — no API calls were made. Re-run with --execute to import.');
    } else {
      console.error('DRY RUN FAILED — fix the errors above before --execute.');
    }
    process.exit(structuralOk ? 0 : 1);
    return;
  }

  if (!structuralOk || !preflight.template) {
    console.error('Cannot execute: preflight failed. Fix the errors above first.');
    process.exit(1);
    return;
  }

  let entries: EntryReport[];
  try {
    entries = await executeImport(preflight.template, preflight, baseDir, args.base);
  } catch (error) {
    console.error(`[fatal] ${error instanceof Error ? error.message : String(error)}`);
    const report = buildReport('execute', file, args.base, startedAt, [String(error)], []);
    const reportPath = writeReport(file, report);
    console.log(`report: ${reportPath}`);
    process.exit(1);
    return;
  }

  const report = buildReport('execute', file, args.base, startedAt, [], entries);
  const reportPath = writeReport(file, report);
  printSummary(report, reportPath);
  const ok = entries.every((e) => e.status === 'PUBLISHED');
  process.exit(ok ? 0 : 1);
}

const isMain =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
    process.exit(1);
  });
}
