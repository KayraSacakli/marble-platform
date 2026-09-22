import { describe, it, expect } from 'vitest';
import {
  localeSchema,
  slugSchema,
  paginationSchema,
  parseLocale,
  normalizePagination,
  buildPaginationMeta,
  parseQueryInt,
} from '../api/validation';

describe('localeSchema', () => {
  it('accepts valid locales', () => {
    expect(localeSchema.safeParse('tr').success).toBe(true);
    expect(localeSchema.safeParse('en').success).toBe(true);
    expect(localeSchema.safeParse('es').success).toBe(true);
    expect(localeSchema.safeParse('fr').success).toBe(true);
    expect(localeSchema.safeParse('de').success).toBe(true);
    expect(localeSchema.safeParse('it').success).toBe(true);
    expect(localeSchema.safeParse('ar').success).toBe(true);
  });

  it('rejects invalid locales', () => {
    expect(localeSchema.safeParse('xx').success).toBe(false);
    expect(localeSchema.safeParse('zz').success).toBe(false);
    expect(localeSchema.safeParse('').success).toBe(false);
  });
});

describe('parseLocale', () => {
  it('returns parsed locale for valid input', () => {
    expect(parseLocale('tr')).toBe('tr');
    expect(parseLocale('en')).toBe('en');
    expect(parseLocale('es')).toBe('es');
    expect(parseLocale('fr')).toBe('fr');
    expect(parseLocale('de')).toBe('de');
    expect(parseLocale('it')).toBe('it');
    expect(parseLocale('ar')).toBe('ar');
  });

  it('throws BadRequestError for invalid input', () => {
    expect(() => parseLocale('xx')).toThrow('Invalid locale');
    expect(() => parseLocale(undefined)).toThrow('Invalid locale');
    expect(() => parseLocale('')).toThrow('Invalid locale');
  });
});

describe('slugSchema', () => {
  it('accepts valid slugs', () => {
    expect(slugSchema.safeParse('beyaz-mermer').success).toBe(true);
    expect(slugSchema.safeParse('white-marble-2024').success).toBe(true);
    expect(slugSchema.safeParse('abc').success).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(slugSchema.safeParse('').success).toBe(false);
    expect(slugSchema.safeParse('Beyaz-Mermer').success).toBe(false);
    expect(slugSchema.safeParse('beyaz mermer').success).toBe(false);
    expect(slugSchema.safeParse('beyaz_mermer').success).toBe(false);
    expect(slugSchema.safeParse('.beyaz').success).toBe(false);
  });
});

describe('paginationSchema', () => {
  it('applies defaults for missing values', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(24);
    }
  });

  it('parses valid pagination params', () => {
    const result = paginationSchema.safeParse({ page: '3', pageSize: '48' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.pageSize).toBe(48);
    }
  });

  it('rejects invalid page values', () => {
    expect(paginationSchema.safeParse({ page: '0' }).success).toBe(false);
    expect(paginationSchema.safeParse({ page: '-1' }).success).toBe(false);
    expect(paginationSchema.safeParse({ page: 'abc' }).success).toBe(false);
  });

  it('rejects page size > 100', () => {
    expect(paginationSchema.safeParse({ pageSize: '101' }).success).toBe(false);
  });
});

describe('normalizePagination', () => {
  it('normalizes page < 1 to 1', () => {
    expect(normalizePagination({ page: 0, pageSize: 24 })).toEqual({
      page: 1,
      pageSize: 24,
      skip: 0,
    });
  });

  it('caps pageSize at 100', () => {
    expect(normalizePagination({ page: 1, pageSize: 200 })).toEqual({
      page: 1,
      pageSize: 100,
      skip: 0,
    });
  });

  it('calculates skip correctly', () => {
    expect(normalizePagination({ page: 3, pageSize: 24 })).toEqual({
      page: 3,
      pageSize: 24,
      skip: 48,
    });
  });
});

describe('buildPaginationMeta', () => {
  it('calculates total pages correctly', () => {
    const meta = buildPaginationMeta(1, 24, 100);
    expect(meta.totalPages).toBe(5);
    expect(meta.total).toBe(100);
    expect(meta.page).toBe(1);
    expect(meta.pageSize).toBe(24);
  });

  it('handles empty results', () => {
    const meta = buildPaginationMeta(1, 24, 0);
    expect(meta.totalPages).toBe(0);
    expect(meta.total).toBe(0);
  });
});

describe('parseQueryInt', () => {
  it('returns parsed integer for valid input', () => {
    expect(parseQueryInt('5', 10)).toBe(5);
  });

  it('returns default for undefined', () => {
    expect(parseQueryInt(undefined, 10)).toBe(10);
  });

  it('returns default for non-integer', () => {
    expect(parseQueryInt('abc', 10)).toBe(10);
  });

  it('returns default for negative', () => {
    expect(parseQueryInt('-1', 10)).toBe(10);
  });
});
