import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { normalizeSlug, preflightTemplate, type MediaEntry } from '../../../scripts/import-content';

const CONTENT_IMPORT_DIR = path.resolve(process.cwd(), 'content-import');
const PLACEHOLDER: MediaEntry = {
  file: 'media/ornek-gorsel.png',
  role: 'PRIMARY',
  altTr: 'Örnek alt metin',
  altEn: 'Sample alt text',
};

function product(overrides: Record<string, unknown> = {}) {
  return {
    tr: { slug: 'ornek-urun', name: 'Örnek Ürün' },
    en: { slug: 'sample-product', name: 'Sample Product' },
    media: [PLACEHOLDER],
    ...overrides,
  };
}

function minimalTemplate(products: unknown[]) {
  return { products };
}

describe('normalizeSlug', () => {
  it('folds Turkish characters and lowercases', () => {
    expect(normalizeSlug('Çimstone İstanbul')).toBe('cimstone-istanbul');
    expect(normalizeSlug('Şıkışık Öğüş')).toBe('sikisik-ogus');
  });

  it('replaces invalid runs with a single hyphen and trims ends', () => {
    expect(normalizeSlug('  Hello   World!!  ')).toBe('hello-world');
    expect(normalizeSlug('--already--slug--')).toBe('already-slug');
  });

  it('returns an empty string when nothing usable remains', () => {
    expect(normalizeSlug('!!!')).toBe('');
    expect(normalizeSlug('   ')).toBe('');
  });

  it('keeps ascii slugs untouched', () => {
    expect(normalizeSlug('already-valid-slug')).toBe('already-valid-slug');
  });
});

describe('preflightTemplate', () => {
  it('accepts a structurally valid template', () => {
    const result = preflightTemplate(minimalTemplate([product()]), CONTENT_IMPORT_DIR);
    expect(result.template).not.toBeNull();
    expect(result.errors).toEqual([]);
    expect(result.entries.every((e) => e.errors.length === 0)).toBe(true);
  });

  it('records slug normalizations without altering validity', () => {
    const result = preflightTemplate(
      minimalTemplate([product({ tr: { slug: 'Örnek Ürün', name: 'Örnek Ürün' } })]),
      CONTENT_IMPORT_DIR,
    );
    expect(result.template?.products[0].tr.slug).toBe('ornek-urun');
    expect(result.normalizations).toEqual([
      { scope: 'products[0]', locale: 'tr', from: 'Örnek Ürün', to: 'ornek-urun' },
    ]);
    expect(result.entries.every((e) => e.errors.length === 0)).toBe(true);
  });

  it('reports slug collisions explicitly instead of resolving them', () => {
    const result = preflightTemplate(
      minimalTemplate([product(), product({ en: { slug: 'other-product', name: 'Other' } })]),
      CONTENT_IMPORT_DIR,
    );
    const collision = result.entries.flatMap((e) => e.errors).find((e) => e.includes('collision'));
    expect(collision).toBeDefined();
    expect(collision).toContain('ornek-urun');
    // The second entry keeps its own slug — nothing was renamed.
    expect(result.template?.products[1].tr.slug).toBe('ornek-urun');
  });

  it('requires a PRIMARY media entry with TR and EN alt text for products', () => {
    const noPrimary = preflightTemplate(
      minimalTemplate([
        product({
          media: [{ ...PLACEHOLDER, role: 'GALLERY' }],
        }),
      ]),
      CONTENT_IMPORT_DIR,
    );
    expect(noPrimary.entries.flatMap((e) => e.errors).some((e) => e.includes('PRIMARY'))).toBe(
      true,
    );

    const missingAlt = preflightTemplate(
      {
        products: [
          {
            tr: { slug: 'ornek-urun', name: 'Örnek Ürün' },
            en: { slug: 'sample-product', name: 'Sample Product' },
            media: [{ file: 'media/ornek-gorsel.png', role: 'PRIMARY', altTr: 'var' }],
          },
        ],
      },
      CONTENT_IMPORT_DIR,
    );
    expect(missingAlt.template).toBeNull();
    expect(missingAlt.errors.some((e) => e.includes('altEn'))).toBe(true);
  });

  it('fails when a referenced media file does not exist', () => {
    const result = preflightTemplate(
      minimalTemplate([
        product({
          media: [{ ...PLACEHOLDER, file: 'media/does-not-exist.png' }],
        }),
      ]),
      CONTENT_IMPORT_DIR,
    );
    expect(result.entries.flatMap((e) => e.errors).some((e) => e.includes('not found'))).toBe(true);
  });

  it('rejects unknown keys instead of silently stripping them', () => {
    const result = preflightTemplate(
      minimalTemplate([product({ price: 100 })]),
      CONTENT_IMPORT_DIR,
    );
    expect(result.template).toBeNull();
    expect(result.errors.some((e) => e.includes('price'))).toBe(true);
  });

  it('warns about relation references that are not defined in the file', () => {
    const result = preflightTemplate(
      minimalTemplate([product({ collections: ['unknown-collection'] })]),
      CONTENT_IMPORT_DIR,
    );
    expect(result.entries[0].errors).toEqual([]);
    expect(result.entries[0].warnings.some((w) => w.includes('unknown-collection'))).toBe(true);
  });
});
