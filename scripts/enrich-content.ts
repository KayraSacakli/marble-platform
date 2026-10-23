/**
 * Phase 19B — AI product content enrichment (DRY-RUN ONLY).
 *
 * Validates an AI-generated enrichment template against the source folders
 * and writes a review report. It NEVER talks to the API and NEVER writes to
 * the database — the existing import workflow (import-content.ts) is the
 * only path that may create content, and only after explicit approval.
 *
 * Checks per product:
 *   - Zod structure (strict: unknown keys are rejected)
 *   - slug must equal normalizeSlug(sourceFolder) (existing import slugs —
 *     renames NEVER change slugs)
 *   - evidence-based name resolution (see nameEvidence below):
 *     folder evidence, image profile, existing DB name, and the Content
 *     Owner approved registry (content-import/name-registry.json) — the
 *     folder is a starting hint, not the single source of truth
 *   - confidence != high implies reviewRequired (uncertain = reviewed)
 *   - banned commercial/technical claims (certificates, quarry/origin,
 *     capacity, stock, price, lead time, guarantees, awards, and unverified
 *     "Turkish marble" product-level origin claims)
 *   - SEO revision: seoTitle / seoDescription / altText must contain the
 *     product name; the description must mention the full name at least once
 *     and the base (suffix-free) name at least twice — natural but evident
 *   - SEO revision warnings: related stone/interior vocabulary present,
 *     seoTitle length (SERP truncation risk)
 *   - keyword stuffing limits for descriptions and meta descriptions
 *   - TR and EN descriptions must differ
 *   - optional source folder existence + image counts
 *
 * Name evidence model (enrichmentProductSchema.nameEvidence, optional):
 *   - sources: which evidence types are claimed for the proposed name
 *   - imageProfile: recorded visual attributes (colour/veining/texture) —
 *     NEVER sufficient on its own to validate a commercial stone name
 *   - registryMatch: the approved registry entry this name relies on
 *   - rejectedCandidates: candidates considered and rejected, with reasons
 *   - rationale: why the name was accepted / held for review / rejected
 *
 * Decision outcomes (reported per product as nameDecision):
 *   - FOLDER_DERIVED    names derived from the source folder (hint check)
 *   - REGISTRY_ACCEPTED not folder-derived but matches an approved entry
 *   - REVIEW_REQUIRED   only image/DB evidence — Content Owner must review
 *   - REJECTED          no supporting evidence — invented names are blocked
 *
 * Usage:
 *   npm run enrich:content
 *   npm run enrich:content -- --file content-import/enrichment.pilot.json
 *   npm run enrich:content -- --source "C:/Users/.../Marble Content/Products"
 *   npm run enrich:content -- --registry content-import/name-registry.json
 *   npm run enrich:content -- --out content-import/enrichment.pilot.report.json
 *
 * A JSON report is written next to the template (<name>.report.json) unless
 * --out is provided.
 */
import 'dotenv/config';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { normalizeSlug } from './import-content';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================
// Schema
// ============================================================

const localeContentSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters.').max(500),
    slug: z.string().min(1, 'Slug is required.').max(500),
    description: z
      .string()
      .min(80, 'Description must be at least 80 characters.')
      .max(3000, 'Description must be 3000 characters or fewer.'),
    seoTitle: z
      .string()
      .min(10, 'SEO title must be at least 10 characters.')
      .max(500, 'SEO title must be 500 characters or fewer.'),
    seoDescription: z
      .string()
      .min(50, 'SEO meta description must be at least 50 characters.')
      .max(300, 'SEO meta description must be 300 characters or fewer.'),
    altText: z
      .string()
      .min(10, 'Alt text must be at least 10 characters.')
      .max(500, 'Alt text must be 500 characters or fewer.'),
  })
  .strict();

const applicationsSchema = z
  .object({
    tr: z.array(z.string().min(1)).min(1, 'At least one TR application is required.'),
    en: z.array(z.string().min(1)).min(1, 'At least one EN application is required.'),
  })
  .strict();

const stoneCharacterSchema = z
  .object({
    color: z.string().min(3),
    character: z.string().min(3),
    veining: z.string().min(3),
  })
  .strict();

// ============================================================
// Name evidence + registry
// ============================================================

const evidenceSourceSchema = z.enum(['folder', 'imageProfile', 'existingDb', 'trustedRegistry']);
export type EvidenceSource = z.infer<typeof evidenceSourceSchema>;

const nameEvidenceSchema = z
  .object({
    sources: z.array(evidenceSourceSchema).min(1, 'At least one evidence source must be declared.'),
    imageProfile: z
      .string()
      .min(3, 'imageProfile must describe the observed visual attributes.')
      .max(1000)
      .optional(),
    registryMatch: z.string().max(500).optional(),
    rejectedCandidates: z
      .array(
        z
          .object({
            name: z.string().min(1).max(300),
            reason: z.string().min(1).max(1000),
          })
          .strict(),
      )
      .default([]),
    rationale: z.string().min(1).max(2000).optional(),
  })
  .strict();

export const nameRegistryEntrySchema = z
  .object({
    folder: z.string().min(1).optional(),
    names: z
      .object({
        tr: z.string().min(2),
        en: z.string().min(2),
        canonical: z.string().min(2),
      })
      .strict(),
    slug: z.string().min(1).optional(),
    approvedBy: z.string().min(1, 'approvedBy is required (approval record).'),
    approvedAt: z.string().min(4, 'approvedAt is required (approval record).'),
    notes: z.string().max(2000).optional(),
  })
  .strict();

export const nameRegistrySchema = z
  .object({
    _instructions: z.string().optional(),
    entries: z.array(nameRegistryEntrySchema).default([]),
  })
  .strict();

export type NameEvidence = z.infer<typeof nameEvidenceSchema>;
export type NameRegistryEntry = z.infer<typeof nameRegistryEntrySchema>;
export type NameRegistry = z.infer<typeof nameRegistrySchema>;

export const enrichmentProductSchema = z
  .object({
    sourceFolder: z.string().min(1, 'sourceFolder is required.'),
    detectedName: z.string().min(1, 'detectedName is required.'),
    canonicalName: z.string().min(2).max(500),
    confidence: z.enum(['high', 'medium', 'low']),
    reviewRequired: z.boolean(),
    tr: localeContentSchema,
    en: localeContentSchema,
    applications: applicationsSchema,
    stoneCharacter: z
      .object({
        tr: stoneCharacterSchema,
        en: stoneCharacterSchema,
      })
      .strict(),
    detectedAmbiguities: z.array(z.string().min(1)).default([]),
    nameEvidence: nameEvidenceSchema.optional(),
  })
  .strict();

export const enrichmentSchema = z
  .object({
    _instructions: z.string().optional(),
    products: z.array(enrichmentProductSchema).min(1, 'At least one product is required.'),
  })
  .strict();

export type EnrichmentProduct = z.infer<typeof enrichmentProductSchema>;
export type EnrichmentTemplate = z.infer<typeof enrichmentSchema>;

// ============================================================
// Guards
// ============================================================

/**
 * ASCII letters of a string using the same folding as the import pipeline
 * (Turkish characters folded, everything non-alphanumeric removed).
 */
export function lettersOnly(input: string): string {
  return normalizeSlug(input).replace(/-/g, '');
}

/**
 * Whether a proposed name still contains the source folder letters — the
 * "folder evidence" check. Pure casing/spacing normalizations pass
 * ("pietragrey" -> "Pietra Grey Mermer"); unrelated names fail. Since
 * PHASE 19B this is ONE evidence type, not the whole decision: a failing
 * name can still be accepted via the approved registry (see
 * evaluateNameEvidence), and image evidence alone never validates a name.
 */
export function nameMatchesFolder(folder: string, name: string): boolean {
  const folderLetters = lettersOnly(folder);
  if (folderLetters.length === 0) return false;
  return lettersOnly(name).includes(folderLetters);
}

/**
 * Claims that must never be generated for pilot content (governance rules:
 * no invented certificates, origin/quarry, capacity, stock, price, project
 * or guarantee information).
 *
 * Word-start lookbehind anchors English matches (so "uncertified"-style
 * substrings do not trip the check) while the trailing side stays open so
 * Turkish suffixes ("ocağından", "sertifikalı") are still caught — JS `\b`
 * only understands ASCII word characters.
 */
export const BANNED_CLAIM_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  {
    pattern: /(?<![a-zçğıöşü])(certified|certificate|certification|sertifika)/i,
    label: 'certificate claim',
  },
  { pattern: /(?<![a-zçğıöşü])iso[\s-]?\d{4,9}/i, label: 'ISO standard claim' },
  { pattern: /(?<![a-zçğıöşü])(ocak|ocağ|quarry|quarries|mines)/i, label: 'quarry/origin claim' },
  {
    pattern:
      /(?<![a-zçğıöşü])(menşei|mensei|kökenli|kokenli|made in|originated in|originated from|turkish marble|turkish natural stone|türk mermeri|türk doğal taşı)/i,
    label: 'origin claim',
  },
  {
    pattern: /(?<![a-zçğıöşü])(kapasite|capacity|stok|stock|availability|uygunluk)/i,
    label: 'capacity/stock claim',
  },
  { pattern: /(?<![a-zçğıöşü])(fiyat|price|indirim|discount)/i, label: 'pricing claim' },
  {
    pattern:
      /(?<![a-zçğıöşü])(lead time|teslim süresi|teslim suresi|garantili|guaranteed|ödül|odul|award)/i,
    label: 'guarantee/lead time/award claim',
  },
  {
    pattern:
      /(?<![a-zçğıöşü])(antibakteriyel|antibacterial|sağlığa zararsız|sagliga zararsiz|health safe)/i,
    label: 'unverified technical claim',
  },
];

export function findBannedClaims(text: string): string[] {
  return BANNED_CLAIM_PATTERNS.filter((entry) => entry.pattern.test(text)).map(
    (entry) => entry.label,
  );
}

function wordCounts(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  const words = text
    .toLowerCase()
    .split(/[^a-zçğıöşü0-9]+/i)
    .filter((w) => w.length >= 4);
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return counts;
}

/**
 * Returns [word, count] pairs above the given limit — used to detect keyword
 * stuffing in generated copy.
 */
export function findKeywordStuffing(text: string, limit: number): Array<[string, number]> {
  return [...wordCounts(text).entries()].filter(([, count]) => count > limit);
}

/**
 * Removes the trailing stone-category word from a localized product name
 * ("Akhisar Bej Mermer" -> "Akhisar Bej", "Akhisar Beige Marble" ->
 * "Akhisar Beige"). The base name is what descriptions must repeat.
 */
export function stripStoneSuffix(name: string): string {
  return name.replace(/\s+(mermer|marble)$/i, '').trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Case-insensitive occurrence count of a phrase with letter boundaries —
 * "Visne" does not match inside longer words, Turkish letters are respected.
 */
export function countPhrase(text: string, phrase: string): number {
  const trimmed = phrase.trim();
  if (trimmed.length === 0) return 0;
  const pattern = escapeRegExp(trimmed).replace(/\s+/g, '\\s+');
  const regex = new RegExp(`(?<![a-zçğıöşü])${pattern}(?![a-zçğıöşü])`, 'giu');
  return (text.match(regex) ?? []).length;
}

/** Related vocabulary that product copy should touch on naturally. */
const RELATED_TERMS_TR = /doğal taş|iç mimari|mimari proje|tezgah|zemin|duvar|slab/i;
const RELATED_TERMS_EN = /natural stone|natural marble|marble slab|interior design|architectural/i;

function countImages(dir: string): number {
  if (!existsSync(dir)) return 0;
  try {
    if (!statSync(dir).isDirectory()) return 0;
    return readdirSync(dir).filter((f) => statSync(path.join(dir, f)).isFile()).length;
  } catch {
    return 0;
  }
}

// ============================================================
// Name evidence evaluation
// ============================================================

export type NameOutcome = 'FOLDER_DERIVED' | 'REGISTRY_ACCEPTED' | 'REVIEW_REQUIRED' | 'REJECTED';

export interface NameDecision {
  outcome: NameOutcome;
  sources: EvidenceSource[];
  folderDerived: boolean;
  registryMatch: {
    tr: string;
    en: string;
    canonical: string;
    approvedBy: string;
    approvedAt: string;
  } | null;
  imageProfile: string | null;
  candidates: Array<{ name: string; supportedBy: EvidenceSource[]; accepted: boolean }>;
  rejectedCandidates: Array<{ name: string; reason: string }>;
  rationale: string;
}

/** Loads the Content Owner approved name registry; a missing file means empty. */
export function loadRegistry(filePath: string): NameRegistry {
  if (!existsSync(filePath)) return { entries: [] };
  const raw = JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
  const parsed = nameRegistrySchema.safeParse(raw);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid name registry at ${filePath}: ${detail}`);
  }
  return parsed.data;
}

/** Finds the approved registry entry for a product (by name or by folder hint). */
export function findRegistryEntry(
  registry: NameRegistry,
  product: EnrichmentProduct,
): NameRegistryEntry | null {
  const folderSlug = normalizeSlug(product.sourceFolder);
  return (
    registry.entries.find(
      (entry) =>
        entry.names.tr === product.tr.name ||
        entry.names.en === product.en.name ||
        entry.names.canonical === product.canonicalName ||
        (entry.folder !== undefined && normalizeSlug(entry.folder) === folderSlug),
    ) ?? null
  );
}

/**
 * Evidence-based name decision. The folder is a starting hint: folder-
 * derived names pass as before, non-derived names need an approved registry
 * entry (Content Owner) to be accepted, image/DB evidence alone only ever
 * keeps the name under review, and names with no evidence at all are
 * rejected as invented.
 */
export function evaluateNameEvidence(
  product: EnrichmentProduct,
  registry: NameRegistry = { entries: [] },
): { errors: string[]; warnings: string[]; decision: NameDecision } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const evidence = product.nameEvidence;
  const claimed = evidence?.sources ?? [];

  const trFirstWordLetters = lettersOnly(product.tr.name.split(/\s+/)[0] ?? '');
  const trDerived = nameMatchesFolder(product.sourceFolder, product.tr.name);
  const enDerived =
    trFirstWordLetters.length > 0 && lettersOnly(product.en.name).includes(trFirstWordLetters);
  const folderDerived = trDerived && enDerived;

  const entry = findRegistryEntry(registry, product);
  const hasVisualOrDbEvidence =
    claimed.includes('imageProfile') ||
    claimed.includes('existingDb') ||
    evidence?.imageProfile !== undefined;

  // Claimed evidence must be real — a trustedRegistry/imageProfile claim
  // that does not hold is a validation error, not a soft note.
  if (claimed.includes('folder') && !folderDerived) {
    errors.push(
      'nameEvidence claims folder evidence but the proposed TR/EN names are not derived from the source folder / TR name.',
    );
  }
  if (claimed.includes('trustedRegistry') && !entry) {
    errors.push(
      'nameEvidence claims trustedRegistry evidence but no approved registry entry matches this product.',
    );
  }
  if (claimed.includes('imageProfile') && evidence?.imageProfile === undefined) {
    errors.push('nameEvidence claims imageProfile evidence but imageProfile is missing.');
  }

  let outcome: NameOutcome;
  if (folderDerived) outcome = 'FOLDER_DERIVED';
  else if (entry) outcome = 'REGISTRY_ACCEPTED';
  else if (hasVisualOrDbEvidence) outcome = 'REVIEW_REQUIRED';
  else outcome = 'REJECTED';

  if (outcome === 'REJECTED') {
    if (!trDerived) {
      errors.push(
        `TR name "${product.tr.name}" is not derived from the source folder / TR name — invented names are not allowed.`,
      );
    }
    if (!enDerived) {
      errors.push(
        `EN name "${product.en.name}" is not derived from the source folder / TR name — invented names are not allowed.`,
      );
    }
  } else if (outcome === 'REVIEW_REQUIRED') {
    if (!product.reviewRequired) {
      errors.push(
        `Name "${product.tr.name}" has only image/database evidence — image alone cannot validate a commercial name; invented names are not accepted and uncertain matches require reviewRequired=true.`,
      );
    }
    if (!trDerived) {
      warnings.push(
        `TR name "${product.tr.name}" is not folder-derived — held for Content Owner review until a registry entry approves it.`,
      );
    }
    if (!enDerived) {
      warnings.push(
        `EN name "${product.en.name}" is not derived from the approved TR name — held for review.`,
      );
    }
  } else if (outcome === 'REGISTRY_ACCEPTED') {
    warnings.push(
      `Name accepted from the approved registry (approved by ${entry?.approvedBy}); slugs never change with renames.`,
    );
  }

  const sources: EvidenceSource[] = [...claimed];
  if (folderDerived && !sources.includes('folder')) sources.push('folder');
  if (entry && !sources.includes('trustedRegistry')) sources.push('trustedRegistry');

  const autoRationale =
    outcome === 'FOLDER_DERIVED'
      ? 'Proposed names are derived from the source folder hint; image/db evidence is recorded for review and never validates a commercial name on its own.'
      : outcome === 'REGISTRY_ACCEPTED'
        ? `Proposed name is not folder-derived but matches an approved registry entry (approved by ${entry?.approvedBy} at ${entry?.approvedAt}).`
        : outcome === 'REVIEW_REQUIRED'
          ? 'Proposed name is not folder-derived; image/db evidence alone cannot validate a commercial name and no approved registry entry exists — Content Owner review required.'
          : 'Proposed name matches neither the source folder nor the approved registry and has no supporting evidence — invented names are not allowed.';

  const candidates: NameDecision['candidates'] = [
    { name: product.sourceFolder, supportedBy: ['folder'], accepted: folderDerived },
    { name: product.tr.name, supportedBy: sources, accepted: outcome !== 'REJECTED' },
  ];
  if (entry) {
    candidates.push({
      name: entry.names.tr,
      supportedBy: ['trustedRegistry'],
      accepted: outcome === 'REGISTRY_ACCEPTED',
    });
  }

  const decision: NameDecision = {
    outcome,
    sources,
    folderDerived,
    registryMatch: entry
      ? {
          tr: entry.names.tr,
          en: entry.names.en,
          canonical: entry.names.canonical,
          approvedBy: entry.approvedBy,
          approvedAt: entry.approvedAt,
        }
      : null,
    imageProfile: evidence?.imageProfile ?? null,
    candidates,
    rejectedCandidates: evidence?.rejectedCandidates ?? [],
    rationale: evidence?.rationale ?? autoRationale,
  };

  return { errors, warnings, decision };
}

// ============================================================
// Per-product validation
// ============================================================

export interface ProductCheckResult {
  errors: string[];
  warnings: string[];
  nameDecision: NameDecision;
}

export function checkProduct(
  product: EnrichmentProduct,
  options: { sourceRoot?: string; registry?: NameRegistry } = {},
): ProductCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const folderSlug = normalizeSlug(product.sourceFolder);

  for (const locale of ['tr', 'en'] as const) {
    const content = product[locale];
    if (content.slug !== folderSlug) {
      errors.push(
        `${locale}.slug "${content.slug}" does not match source folder slug "${folderSlug}".`,
      );
    }
    for (const claim of findBannedClaims(content.description)) {
      errors.push(`${locale}.description contains a banned ${claim}.`);
    }
    for (const claim of findBannedClaims(content.seoTitle)) {
      errors.push(`${locale}.seoTitle contains a banned ${claim}.`);
    }
    for (const claim of findBannedClaims(content.seoDescription)) {
      errors.push(`${locale}.seoDescription contains a banned ${claim}.`);
    }
    for (const claim of findBannedClaims(content.altText)) {
      errors.push(`${locale}.altText contains a banned ${claim}.`);
    }
    for (const [word, count] of findKeywordStuffing(content.description, 5)) {
      errors.push(`${locale}.description keyword stuffing: "${word}" appears ${count} times.`);
    }
    for (const [word, count] of findKeywordStuffing(content.seoDescription, 3)) {
      errors.push(`${locale}.seoDescription keyword stuffing: "${word}" appears ${count} times.`);
    }

    // SEO revision: the product name must be present in every SEO field and
    // repeated naturally (but evidently) in the description.
    const baseName = stripStoneSuffix(content.name);
    if (countPhrase(content.seoTitle, content.name) < 1) {
      errors.push(`${locale}.seoTitle must contain the product name "${content.name}".`);
    }
    if (countPhrase(content.seoDescription, content.name) < 1) {
      errors.push(`${locale}.seoDescription must contain the product name "${content.name}".`);
    }
    if (countPhrase(content.altText, content.name) < 1) {
      errors.push(`${locale}.altText must contain the product name "${content.name}".`);
    }
    if (countPhrase(content.description, content.name) < 1) {
      errors.push(
        `${locale}.description must mention the full product name "${content.name}" at least once.`,
      );
    }
    if (countPhrase(content.description, baseName) < 2) {
      errors.push(
        `${locale}.description must mention the product base name "${baseName}" at least twice (natural but evident frequency).`,
      );
    }
    if (content.seoTitle.length > 60) {
      warnings.push(
        `${locale}.seoTitle is ${content.seoTitle.length} characters — search results may truncate it after ~60.`,
      );
    }
    const relatedPattern = locale === 'tr' ? RELATED_TERMS_TR : RELATED_TERMS_EN;
    if (!relatedPattern.test(content.description)) {
      warnings.push(
        `${locale}.description should naturally include related stone/interior vocabulary.`,
      );
    }
  }

  if (product.tr.slug !== product.en.slug) {
    warnings.push('TR and EN slugs differ — locale-specific slugs are allowed but rare.');
  }
  if (product.tr.description === product.en.description) {
    errors.push('TR and EN descriptions must differ (bilingual requirement).');
  }
  if (product.tr.name === product.en.name && normalizeSlug(product.tr.name).includes('mermer')) {
    warnings.push('EN name repeats the TR name — verify the English product name.');
  }

  if (product.confidence !== 'high' && !product.reviewRequired) {
    errors.push(
      `confidence "${product.confidence}" requires reviewRequired=true (uncertain matches must be reviewed).`,
    );
  }
  if (product.confidence === 'high' && product.reviewRequired) {
    warnings.push('high confidence with reviewRequired=true — double-check the reason.');
  }
  if (product.confidence === 'high' && product.detectedAmbiguities.length > 0) {
    warnings.push(
      'high confidence with detected ambiguities — verify they are informational only.',
    );
  }

  if (options.sourceRoot) {
    const folderPath = path.join(options.sourceRoot, product.sourceFolder);
    if (!existsSync(folderPath) || !statSync(folderPath).isDirectory()) {
      errors.push(`source folder not found: ${folderPath}`);
    }
  }

  const nameEvaluation = evaluateNameEvidence(product, options.registry ?? { entries: [] });
  errors.push(...nameEvaluation.errors);
  warnings.push(...nameEvaluation.warnings);

  return { errors, warnings, nameDecision: nameEvaluation.decision };
}

// ============================================================
// Report
// ============================================================

export interface EnrichmentReportProduct {
  sourceFolder: string;
  detectedName: string;
  proposedTrName: string;
  proposedEnName: string;
  canonicalName: string;
  slug: string;
  confidence: 'high' | 'medium' | 'low';
  reviewRequired: boolean;
  status: 'VALID' | 'REVIEW_REQUIRED' | 'INVALID';
  generatedTrDescription: string;
  generatedEnDescription: string;
  seoTitleTr: string;
  seoTitleEn: string;
  seoMetaTr: string;
  seoMetaEn: string;
  altTextTr: string;
  altTextEn: string;
  applicationsTr: string[];
  applicationsEn: string[];
  stoneCharacterTr: { color: string; character: string; veining: string };
  stoneCharacterEn: { color: string; character: string; veining: string };
  sourceImages?: { product: number; renders: number };
  detectedAmbiguities: string[];
  nameDecision: NameDecision;
  errors: string[];
  warnings: string[];
}

export interface EnrichmentReport {
  generatedAt: string;
  mode: 'dry-run';
  dbWrite: false;
  source: string;
  sourceRoot?: string;
  registrySource?: string;
  summary: {
    total: number;
    valid: number;
    reviewRequired: number;
    invalid: number;
  };
  products: EnrichmentReportProduct[];
  schemaErrors: string[];
}

export function buildReport(
  raw: unknown,
  options: {
    source: string;
    sourceRoot?: string;
    registry?: NameRegistry;
    registrySource?: string;
  },
): EnrichmentReport {
  const parsed = enrichmentSchema.safeParse(raw);
  const schemaErrors: string[] = parsed.success
    ? []
    : parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);

  if (!parsed.success) {
    return {
      generatedAt: new Date().toISOString(),
      mode: 'dry-run',
      dbWrite: false,
      source: options.source,
      ...(options.sourceRoot ? { sourceRoot: options.sourceRoot } : {}),
      ...(options.registrySource ? { registrySource: options.registrySource } : {}),
      summary: { total: 0, valid: 0, reviewRequired: 0, invalid: 0 },
      products: [],
      schemaErrors,
    };
  }

  const products: EnrichmentReportProduct[] = parsed.data.products.map((product) => {
    const { errors, warnings, nameDecision } = checkProduct(product, {
      ...(options.sourceRoot ? { sourceRoot: options.sourceRoot } : {}),
      ...(options.registry ? { registry: options.registry } : {}),
    });

    const folderPath = options.sourceRoot
      ? path.join(options.sourceRoot, product.sourceFolder)
      : undefined;
    const sourceImages = folderPath
      ? {
          product: countImages(path.join(folderPath, 'product')),
          renders: countImages(path.join(folderPath, 'renders')),
        }
      : undefined;

    const status: EnrichmentReportProduct['status'] =
      errors.length > 0 ? 'INVALID' : product.reviewRequired ? 'REVIEW_REQUIRED' : 'VALID';

    return {
      sourceFolder: product.sourceFolder,
      detectedName: product.detectedName,
      proposedTrName: product.tr.name,
      proposedEnName: product.en.name,
      canonicalName: product.canonicalName,
      slug: product.tr.slug,
      confidence: product.confidence,
      reviewRequired: product.reviewRequired,
      status,
      generatedTrDescription: product.tr.description,
      generatedEnDescription: product.en.description,
      seoTitleTr: product.tr.seoTitle,
      seoTitleEn: product.en.seoTitle,
      seoMetaTr: product.tr.seoDescription,
      seoMetaEn: product.en.seoDescription,
      altTextTr: product.tr.altText,
      altTextEn: product.en.altText,
      applicationsTr: product.applications.tr,
      applicationsEn: product.applications.en,
      stoneCharacterTr: product.stoneCharacter.tr,
      stoneCharacterEn: product.stoneCharacter.en,
      ...(sourceImages ? { sourceImages } : {}),
      detectedAmbiguities: product.detectedAmbiguities,
      nameDecision,
      errors,
      warnings,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    mode: 'dry-run',
    dbWrite: false,
    source: options.source,
    ...(options.sourceRoot ? { sourceRoot: options.sourceRoot } : {}),
    ...(options.registrySource ? { registrySource: options.registrySource } : {}),
    summary: {
      total: products.length,
      valid: products.filter((p) => p.status === 'VALID').length,
      reviewRequired: products.filter((p) => p.status === 'REVIEW_REQUIRED').length,
      invalid: products.filter((p) => p.status === 'INVALID').length,
    },
    products,
    schemaErrors,
  };
}

// ============================================================
// CLI
// ============================================================

export interface EnrichArgs {
  file: string;
  source?: string;
  registry?: string;
  out?: string;
}

export function parseArgs(argv: string[]): EnrichArgs {
  const args: EnrichArgs = { file: 'content-import/enrichment.pilot.json' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--file' && argv[i + 1]) {
      args.file = argv[i + 1];
      i += 1;
    } else if (arg === '--source' && argv[i + 1]) {
      args.source = argv[i + 1];
      i += 1;
    } else if (arg === '--registry' && argv[i + 1]) {
      args.registry = argv[i + 1];
      i += 1;
    } else if (arg === '--out' && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--file=')) {
      args.file = arg.slice('--file='.length);
    } else if (arg.startsWith('--source=')) {
      args.source = arg.slice('--source='.length);
    } else if (arg.startsWith('--registry=')) {
      args.registry = arg.slice('--registry='.length);
    } else if (arg.startsWith('--out=')) {
      args.out = arg.slice('--out='.length);
    }
  }
  return args;
}

function defaultSourceRoot(): string {
  const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
  return home ? path.join(home, 'Desktop', 'Marble Content', 'Products') : '';
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = path.resolve(__dirname, '..');
  const filePath = path.isAbsolute(args.file) ? args.file : path.join(repoRoot, args.file);

  if (!existsSync(filePath)) {
    console.error(`Enrichment template not found: ${filePath}`);
    process.exit(1);
  }

  const registryPath = path.isAbsolute(args.registry ?? '')
    ? (args.registry as string)
    : path.join(repoRoot, args.registry ?? 'content-import/name-registry.json');
  let registry: NameRegistry;
  try {
    registry = loadRegistry(registryPath);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
  const sourceRoot = args.source ?? defaultSourceRoot();
  const report = buildReport(raw, {
    source: path.relative(repoRoot, filePath).replace(/\\/g, '/'),
    ...(sourceRoot && existsSync(sourceRoot) ? { sourceRoot } : {}),
    registry,
    registrySource: path.relative(repoRoot, registryPath).replace(/\\/g, '/'),
  });

  const outPath =
    args.out !== undefined
      ? path.isAbsolute(args.out)
        ? args.out
        : path.join(repoRoot, args.out)
      : `${filePath}.report.json`;
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`Phase 19B enrichment — dry-run (dbWrite: false)`);
  console.log(`  template : ${report.source}`);
  console.log(
    `  registry : ${report.registrySource ?? 'none'} (${registry.entries.length} entries)`,
  );
  console.log(`  report   : ${path.relative(repoRoot, outPath).replace(/\\/g, '/')}`);
  console.log(
    `  total=${report.summary.total} valid=${report.summary.valid} reviewRequired=${report.summary.reviewRequired} invalid=${report.summary.invalid}`,
  );
  for (const issue of report.schemaErrors) {
    console.error(`  schema: ${issue}`);
  }
  for (const product of report.products) {
    const flag = product.status === 'INVALID' ? 'ERROR' : product.status;
    console.log(
      `  [${flag}] ${product.sourceFolder} -> "${product.proposedTrName}" (confidence: ${product.confidence}, name: ${product.nameDecision.outcome})`,
    );
    for (const error of product.errors) console.error(`      - ${error}`);
    for (const warning of product.warnings) console.log(`      ~ ${warning}`);
  }

  if (report.schemaErrors.length > 0 || report.summary.invalid > 0) {
    process.exit(1);
  }
}

const isMain =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main();
}
