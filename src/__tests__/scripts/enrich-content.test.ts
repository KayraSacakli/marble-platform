import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import {
  lettersOnly,
  nameMatchesFolder,
  findBannedClaims,
  findKeywordStuffing,
  stripStoneSuffix,
  countPhrase,
  evaluateNameEvidence,
  loadRegistry,
  nameRegistrySchema,
  checkProduct,
  buildReport,
  enrichmentSchema,
  type EnrichmentProduct,
  type NameRegistry,
} from '../../../scripts/enrich-content';

const pilotTemplate = JSON.parse(
  readFileSync(path.join(__dirname, '../../../content-import/enrichment.pilot.json'), 'utf8'),
) as unknown;

function makeProduct(overrides: Partial<EnrichmentProduct> = {}): EnrichmentProduct {
  const base = (JSON.parse(JSON.stringify(pilotTemplate)) as { products: EnrichmentProduct[] })
    .products[0];
  return { ...base, ...overrides };
}

describe('lettersOnly / nameMatchesFolder', () => {
  it('folds Turkish characters like the import pipeline', () => {
    expect(lettersOnly('vısne')).toBe('visne');
    expect(lettersOnly('Afyon Fire Mermer')).toBe('afyonfiremermer');
  });

  it('accepts casing and spacing normalizations', () => {
    expect(nameMatchesFolder('pietragrey', 'Pietra Grey Mermer')).toBe(true);
    expect(nameMatchesFolder('Alexander Black', 'Alexander Black Mermer')).toBe(true);
    expect(nameMatchesFolder('akhisarbej', 'Akhisar Bej Mermer')).toBe(true);
  });

  it('blocks invented commercial names', () => {
    expect(nameMatchesFolder('vısne', 'Rosso Levanto Marble')).toBe(false);
    expect(nameMatchesFolder('afyonfire', 'Nero Marquina')).toBe(false);
  });
});

describe('claim and stuffing checks', () => {
  it('flags certificate, quarry, origin, stock and price claims', () => {
    expect(findBannedClaims('sertifikalı doğal mermer')).toContain('certificate claim');
    expect(findBannedClaims('Afyon ocağından çıkarılmıştır')).toContain('quarry/origin claim');
    expect(findBannedClaims('made in Turkey')).toContain('origin claim');
    expect(findBannedClaims('geniş stok mevcuttur')).toContain('capacity/stock claim');
    expect(findBannedClaims('metrekare fiyatı')).toContain('pricing claim');
  });

  it('flags unverified product-level Turkish origin claims', () => {
    expect(findBannedClaims('a Turkish marble with fine veining')).toContain('origin claim');
    expect(findBannedClaims('Türk doğal taşı seçeneği')).toContain('origin claim');
    expect(findBannedClaims('Turkish natural stone supplier')).toContain('origin claim');
  });

  it('accepts clean copy', () => {
    expect(findBannedClaims('koyu siyah zeminli, ince açık damarlı doğal mermer')).toEqual([]);
  });

  it('detects repeated keywords above the limit', () => {
    const stuffed = Array.from({ length: 7 }, () => 'mermer').join(' ');
    expect(findKeywordStuffing(stuffed, 5)).toEqual([['mermer', 7]]);
    expect(findKeywordStuffing('sakin ve doğal bir yüzey', 5)).toEqual([]);
  });
});

describe('SEO revision helpers', () => {
  it('strips the trailing stone-category word', () => {
    expect(stripStoneSuffix('Akhisar Bej Mermer')).toBe('Akhisar Bej');
    expect(stripStoneSuffix('Akhisar Beige Marble')).toBe('Akhisar Beige');
    expect(stripStoneSuffix('Alexander Black')).toBe('Alexander Black');
  });

  it('counts phrase occurrences with letter boundaries', () => {
    expect(countPhrase('Visne Mermer, Visne tabanı ve Visne Mermer slab', 'Visne Mermer')).toBe(2);
    expect(countPhrase('Visne Mermer', 'Visne')).toBe(1);
    expect(countPhrase('Afyon Fire Marbles', 'Afyon Fire Marble')).toBe(0);
    expect(countPhrase('', 'Alexander Black')).toBe(0);
  });
});

describe('SEO revision checks', () => {
  it('requires the product name in seoTitle, seoDescription and altText', () => {
    const product = makeProduct();
    product.tr.seoTitle = 'Koyu Zeminli Doğal Mermer Seçenekleri';
    product.tr.seoDescription = 'Koyu zeminli, ince açık damarlı doğal mermer seçenekleri.';
    product.tr.altText = 'Koyu zeminli, ince açık damarlı slab görseli';
    const result = checkProduct(product);
    expect(result.errors.some((e) => e.includes('seoTitle must contain'))).toBe(true);
    expect(result.errors.some((e) => e.includes('seoDescription must contain'))).toBe(true);
    expect(result.errors.some((e) => e.includes('altText must contain'))).toBe(true);
  });

  it('requires the full name once and the base name twice in descriptions', () => {
    const product = makeProduct();
    product.en.description =
      'A dark natural marble with fine pale veining, suited to countertops and wall cladding. The near-solid base creates contrast in modern rooms.';
    const result = checkProduct(product);
    expect(result.errors.some((e) => e.includes('full product name'))).toBe(true);
    expect(result.errors.some((e) => e.includes('base name'))).toBe(true);
  });

  it('accepts the pilot copy as written under the revision rules', () => {
    const result = checkProduct(makeProduct());
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('warns about long seo titles and missing related vocabulary', () => {
    const product = makeProduct();
    product.tr.seoTitle = `${product.tr.seoTitle} — Ek Uzun Ek Uzun Ek`;
    product.en.description =
      'Alexander Black Marble is a dark stone with pale veining. Alexander Black suits counters and walls, and Alexander Black keeps its character over time in busy rooms.';
    const result = checkProduct(product);
    expect(result.warnings.some((w) => w.includes('truncate'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('vocabulary'))).toBe(true);
  });
});

describe('name evidence (PHASE 19B)', () => {
  function withName(overrides: {
    tr?: { name?: string };
    en?: { name?: string };
    confidence?: EnrichmentProduct['confidence'];
    reviewRequired?: boolean;
    nameEvidence?: EnrichmentProduct['nameEvidence'];
  }): EnrichmentProduct {
    const base = makeProduct();
    return {
      ...base,
      confidence: overrides.confidence ?? base.confidence,
      reviewRequired: overrides.reviewRequired ?? base.reviewRequired,
      tr: { ...base.tr, ...(overrides.tr ?? {}) },
      en: { ...base.en, ...(overrides.en ?? {}) },
      nameEvidence: overrides.nameEvidence,
    };
  }

  const rossoNames = {
    tr: { name: 'Rosso Levanto Mermer' },
    en: { name: 'Rosso Levanto Marble' },
  };

  it('accepts folder-derived names even without explicit nameEvidence', () => {
    const { errors, decision } = evaluateNameEvidence(withName({ nameEvidence: undefined }));
    expect(errors).toEqual([]);
    expect(decision.outcome).toBe('FOLDER_DERIVED');
    expect(decision.sources).toContain('folder');
  });

  it('keeps image-only non-derived matches under review instead of rejecting them', () => {
    const { errors, warnings, decision } = evaluateNameEvidence(
      withName({
        ...rossoNames,
        confidence: 'low',
        reviewRequired: true,
        nameEvidence: {
          sources: ['imageProfile'],
          imageProfile: 'Koyu gri zemin, ince beyaz damarlar.',
          rejectedCandidates: [],
        },
      }),
    );
    expect(errors).toEqual([]);
    expect(decision.outcome).toBe('REVIEW_REQUIRED');
    expect(warnings.some((w) => w.includes('Content Owner review'))).toBe(true);
    expect(decision.imageProfile).toContain('Koyu gri');
  });

  it('requires reviewRequired=true when only image evidence supports a non-derived name', () => {
    const { errors } = evaluateNameEvidence(
      withName({
        ...rossoNames,
        confidence: 'high',
        reviewRequired: false,
        nameEvidence: {
          sources: ['imageProfile'],
          imageProfile: 'Koyu gri zemin.',
          rejectedCandidates: [],
        },
      }),
    );
    expect(errors.some((e) => e.includes('reviewRequired=true'))).toBe(true);
    expect(errors.some((e) => e.includes('invented names'))).toBe(true);
  });

  it('accepts a non-derived name only through an approved registry entry', () => {
    const registry: NameRegistry = {
      entries: [
        {
          folder: 'vısne',
          names: {
            tr: 'Rosso Levanto Mermer',
            en: 'Rosso Levanto Marble',
            canonical: 'Rosso Levanto Marble',
          },
          slug: 'visne',
          approvedBy: 'Content Owner',
          approvedAt: '2026-10-09T00:00:00.000Z',
        },
      ],
    };
    const { errors, decision } = evaluateNameEvidence(
      withName({
        ...rossoNames,
        confidence: 'medium',
        reviewRequired: true,
        nameEvidence: {
          sources: ['trustedRegistry'],
          registryMatch: 'Rosso Levanto Mermer',
          rejectedCandidates: [],
        },
      }),
      registry,
    );
    expect(errors).toEqual([]);
    expect(decision.outcome).toBe('REGISTRY_ACCEPTED');
    expect(decision.registryMatch?.approvedBy).toBe('Content Owner');
    expect(decision.sources).toContain('trustedRegistry');
  });

  it('rejects non-derived names that have no evidence at all', () => {
    const { errors, decision } = evaluateNameEvidence(
      withName({ ...rossoNames, nameEvidence: undefined }),
    );
    expect(decision.outcome).toBe('REJECTED');
    expect(errors.some((e) => e.includes('invented names'))).toBe(true);
  });

  it('flags a trustedRegistry claim that no approved entry supports', () => {
    const { errors } = evaluateNameEvidence(
      withName({
        nameEvidence: {
          sources: ['trustedRegistry'],
          registryMatch: 'Ghost Entry',
          rejectedCandidates: [],
        },
      }),
    );
    expect(errors.some((e) => e.includes('no approved registry entry'))).toBe(true);
  });

  it('keeps the folder slug guard even when a registry entry approves a rename', () => {
    const registry: NameRegistry = {
      entries: [
        {
          folder: 'Alexander Black',
          names: {
            tr: 'Alexander Black Mermer',
            en: 'Alexander Black Marble',
            canonical: 'Alexander Black Marble',
          },
          slug: 'a-completely-different-slug',
          approvedBy: 'Content Owner',
          approvedAt: '2026-10-09T00:00:00.000Z',
        },
      ],
    };
    const product = makeProduct();
    product.tr.slug = 'not-the-folder-slug';
    product.en.slug = 'not-the-folder-slug';
    const result = checkProduct(product, { registry });
    expect(result.errors.some((e) => e.includes('does not match source folder slug'))).toBe(true);
  });

  it('loads a missing registry as empty and validates the checked-in file', () => {
    expect(loadRegistry('content-import/does-not-exist.json')).toEqual({ entries: [] });
    const checkedIn = loadRegistry('content-import/name-registry.json');
    expect(nameRegistrySchema.safeParse(checkedIn).success).toBe(true);
    const teos = checkedIn.entries.find((entry) => entry.slug === 'teos-green');
    expect(teos).toBeDefined();
    expect(teos?.approvedBy).toBe('Content Owner');
    expect(teos?.names.canonical).toBe('Teos Green');
  });
});

describe('checkProduct', () => {
  it('accepts a valid high-confidence product', () => {
    const result = checkProduct(makeProduct());
    expect(result.errors).toEqual([]);
  });

  it('rejects a proposed name that is not derived from the folder', () => {
    const product = makeProduct();
    product.tr.name = 'Rosso Levanto Mermer';
    product.en.name = 'Rosso Levanto Marble';
    const result = checkProduct(product);
    expect(result.errors.some((e) => e.includes('invented names'))).toBe(true);
  });

  it('allows EN localizations that keep the TR first word', () => {
    const base = makeProduct();
    const product = makeProduct({
      sourceFolder: 'akhisarbej',
      detectedName: 'akhisarbej',
      confidence: 'low',
      reviewRequired: true,
      tr: { ...base.tr, name: 'Akhisar Bej Mermer', slug: 'akhisarbej' },
      en: { ...base.en, name: 'Akhisar Beige Marble', slug: 'akhisarbej' },
    });
    const result = checkProduct(product);
    expect(result.errors.some((e) => e.includes('invented names'))).toBe(false);
  });

  it('rejects EN names that drop the TR identity', () => {
    const product = makeProduct();
    product.en.name = 'Rosso Levanto Marble';
    const result = checkProduct(product);
    expect(result.errors.some((e) => e.includes('invented names'))).toBe(true);
  });

  it('rejects a slug that differs from the source folder slug', () => {
    const product = makeProduct();
    product.tr.slug = 'alexander-black-2';
    const result = checkProduct(product);
    expect(result.errors.some((e) => e.includes('does not match source folder slug'))).toBe(true);
  });

  it('requires reviewRequired for medium confidence', () => {
    const product = makeProduct({ confidence: 'medium', reviewRequired: false });
    const result = checkProduct(product);
    expect(result.errors.some((e) => e.includes('reviewRequired=true'))).toBe(true);
  });

  it('rejects banned claims in descriptions', () => {
    const product = makeProduct();
    product.en.description = `${product.en.description} Certified and ISO 9001 guaranteed.`;
    const result = checkProduct(product);
    expect(result.errors.some((e) => e.includes('banned'))).toBe(true);
  });

  it('rejects identical TR and EN descriptions', () => {
    const product = makeProduct();
    product.en.description = product.tr.description;
    const result = checkProduct(product);
    expect(result.errors.some((e) => e.includes('must differ'))).toBe(true);
  });

  it('reports a missing source folder when sourceRoot is provided', () => {
    const result = checkProduct(makeProduct(), { sourceRoot: '/nonexistent-root' });
    expect(result.errors.some((e) => e.includes('source folder not found'))).toBe(true);
  });
});

describe('enrichmentSchema', () => {
  it('rejects unknown keys instead of stripping them', () => {
    const raw = JSON.parse(JSON.stringify(pilotTemplate)) as Record<string, unknown>;
    raw.extraKey = true;
    expect(enrichmentSchema.safeParse(raw).success).toBe(false);
  });
});

describe('buildReport', () => {
  it('builds a dry-run report for the 5 pilot products without writing to the DB', () => {
    const report = buildReport(pilotTemplate, { source: 'content-import/enrichment.pilot.json' });

    expect(report.mode).toBe('dry-run');
    expect(report.dbWrite).toBe(false);
    expect(report.schemaErrors).toEqual([]);
    expect(report.summary.total).toBe(5);
    expect(report.summary.invalid).toBe(0);
    // Only the fully verified product is VALID; ambiguous matches must be reviewed.
    expect(report.summary.valid).toBe(1);
    expect(report.summary.reviewRequired).toBe(4);

    const alexander = report.products.find((p) => p.sourceFolder === 'Alexander Black');
    expect(alexander?.status).toBe('VALID');
    expect(alexander?.proposedTrName).toBe('Alexander Black Mermer');
    expect(alexander?.slug).toBe('alexander-black');
    expect(alexander?.altTextTr.length).toBeGreaterThan(10);
    expect(alexander?.generatedEnDescription.length).toBeGreaterThan(80);
    expect(alexander?.nameDecision.outcome).toBe('FOLDER_DERIVED');
    expect(alexander?.nameDecision.rationale.length).toBeGreaterThan(10);

    const visne = report.products.find((p) => p.sourceFolder === 'vısne');
    expect(visne?.status).toBe('REVIEW_REQUIRED');
    expect(visne?.confidence).toBe('low');
    expect(visne?.detectedAmbiguities.length).toBeGreaterThan(0);
    expect(visne?.nameDecision.outcome).toBe('FOLDER_DERIVED');
    expect(visne?.nameDecision.imageProfile).toContain('kızıl');
    expect(visne?.nameDecision.rejectedCandidates[0]?.name).toBe('Rosso Levanto');
    expect(visne?.nameDecision.rejectedCandidates[0]?.reason.length).toBeGreaterThan(10);
  });

  it('reports schema errors for malformed templates', () => {
    const report = buildReport({ products: [] }, { source: 'x.json' });
    expect(report.schemaErrors.length).toBeGreaterThan(0);
    expect(report.summary.total).toBe(0);
  });

  it('keeps source folder image counts in the report', () => {
    const sourceRoot = path.join(
      process.env.USERPROFILE ?? '',
      'Desktop',
      'Marble Content',
      'Products',
    );
    const report = buildReport(pilotTemplate, {
      source: 'content-import/enrichment.pilot.json',
      sourceRoot,
    });
    const alexander = report.products.find((p) => p.sourceFolder === 'Alexander Black');
    expect(alexander?.sourceImages?.product).toBe(1);
    expect(alexander?.sourceImages?.renders).toBe(1);
  });
});
