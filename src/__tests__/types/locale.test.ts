import { describe, it, expect } from 'vitest';
import {
  isLocale,
  assertLocale,
  getAlternateLocale,
  getAlternateLocales,
  getLocaleDirection,
  getLocaleMetadata,
  getLocaleNativeName,
  getOpenGraphLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  RTL_LOCALES,
  LOCALE_METADATA,
} from '@/types/locale';

describe('Locale types', () => {
  describe('isLocale', () => {
    it('returns true for valid tr', () => {
      expect(isLocale('tr')).toBe(true);
    });

    it('returns true for valid en', () => {
      expect(isLocale('en')).toBe(true);
    });

    it('returns true for valid es', () => {
      expect(isLocale('es')).toBe(true);
    });

    it('returns true for valid fr', () => {
      expect(isLocale('fr')).toBe(true);
    });

    it('returns true for valid de', () => {
      expect(isLocale('de')).toBe(true);
    });

    it('returns true for valid it', () => {
      expect(isLocale('it')).toBe(true);
    });

    it('returns true for valid ar', () => {
      expect(isLocale('ar')).toBe(true);
    });

    it('returns false for invalid locale xx', () => {
      expect(isLocale('xx')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isLocale('')).toBe(false);
    });

    it('returns false for uppercase TR', () => {
      expect(isLocale('TR')).toBe(false);
    });

    it('returns false for english', () => {
      expect(isLocale('english')).toBe(false);
    });

    it('returns false for turkish', () => {
      expect(isLocale('turkish')).toBe(false);
    });
  });

  describe('assertLocale', () => {
    it('returns tr for valid tr', () => {
      expect(assertLocale('tr')).toBe('tr');
    });

    it('returns en for valid en', () => {
      expect(assertLocale('en')).toBe('en');
    });

    it('returns es for valid es', () => {
      expect(assertLocale('es')).toBe('es');
    });

    it('returns fr for valid fr', () => {
      expect(assertLocale('fr')).toBe('fr');
    });

    it('returns de for valid de', () => {
      expect(assertLocale('de')).toBe('de');
    });

    it('returns it for valid it', () => {
      expect(assertLocale('it')).toBe('it');
    });

    it('returns ar for valid ar', () => {
      expect(assertLocale('ar')).toBe('ar');
    });

    it('throws for invalid locale', () => {
      expect(() => assertLocale('xx')).toThrow('Invalid locale');
    });

    it('throws for empty string', () => {
      expect(() => assertLocale('')).toThrow('Invalid locale');
    });
  });

  describe('getAlternateLocale', () => {
    it('returns en when given tr', () => {
      expect(getAlternateLocale('tr')).toBe('en');
    });

    it('returns tr when given en', () => {
      expect(getAlternateLocale('en')).toBe('tr');
    });
  });

  describe('getAlternateLocales', () => {
    it('returns all except tr when given tr', () => {
      const result = getAlternateLocales('tr');
      expect(result).not.toContain('tr');
      expect(result).toContain('en');
      expect(result).toContain('es');
      expect(result).toContain('fr');
      expect(result).toContain('de');
      expect(result).toContain('it');
      expect(result).toContain('ar');
    });

    it('returns all except en when given en', () => {
      const result = getAlternateLocales('en');
      expect(result).not.toContain('en');
      expect(result).toContain('tr');
      expect(result).toContain('es');
      expect(result).toContain('fr');
      expect(result).toContain('de');
      expect(result).toContain('it');
      expect(result).toContain('ar');
    });

    it('returns 6 locales for any input', () => {
      expect(getAlternateLocales('tr')).toHaveLength(6);
      expect(getAlternateLocales('ar')).toHaveLength(6);
    });
  });

  describe('getLocaleDirection', () => {
    it('returns rtl for Arabic', () => {
      expect(getLocaleDirection('ar')).toBe('rtl');
    });

    it('returns ltr for Turkish', () => {
      expect(getLocaleDirection('tr')).toBe('ltr');
    });

    it('returns ltr for English', () => {
      expect(getLocaleDirection('en')).toBe('ltr');
    });

    it('returns ltr for Spanish', () => {
      expect(getLocaleDirection('es')).toBe('ltr');
    });

    it('returns ltr for French', () => {
      expect(getLocaleDirection('fr')).toBe('ltr');
    });

    it('returns ltr for German', () => {
      expect(getLocaleDirection('de')).toBe('ltr');
    });

    it('returns ltr for Italian', () => {
      expect(getLocaleDirection('it')).toBe('ltr');
    });
  });

  describe('getLocaleMetadata', () => {
    it('returns correct metadata for tr', () => {
      const meta = getLocaleMetadata('tr');
      expect(meta.code).toBe('tr');
      expect(meta.name).toBe('Turkish');
      expect(meta.nativeName).toBe('Türkçe');
      expect(meta.direction).toBe('ltr');
    });

    it('returns correct metadata for ar', () => {
      const meta = getLocaleMetadata('ar');
      expect(meta.code).toBe('ar');
      expect(meta.name).toBe('Arabic');
      expect(meta.nativeName).toBe('العربية');
      expect(meta.direction).toBe('rtl');
    });

    it('returns correct metadata for en', () => {
      const meta = getLocaleMetadata('en');
      expect(meta.code).toBe('en');
      expect(meta.name).toBe('English');
      expect(meta.nativeName).toBe('English');
      expect(meta.direction).toBe('ltr');
    });

    it('returns correct metadata for es', () => {
      const meta = getLocaleMetadata('es');
      expect(meta.nativeName).toBe('Español');
    });

    it('returns correct metadata for fr', () => {
      const meta = getLocaleMetadata('fr');
      expect(meta.nativeName).toBe('Français');
    });

    it('returns correct metadata for de', () => {
      const meta = getLocaleMetadata('de');
      expect(meta.nativeName).toBe('Deutsch');
    });

    it('returns correct metadata for it', () => {
      const meta = getLocaleMetadata('it');
      expect(meta.nativeName).toBe('Italiano');
    });
  });

  describe('getLocaleNativeName', () => {
    it('returns native name for each locale', () => {
      expect(getLocaleNativeName('tr')).toBe('Türkçe');
      expect(getLocaleNativeName('en')).toBe('English');
      expect(getLocaleNativeName('es')).toBe('Español');
      expect(getLocaleNativeName('fr')).toBe('Français');
      expect(getLocaleNativeName('de')).toBe('Deutsch');
      expect(getLocaleNativeName('it')).toBe('Italiano');
      expect(getLocaleNativeName('ar')).toBe('العربية');
    });
  });

  describe('getOpenGraphLocale', () => {
    it('returns correct OG locale for each locale', () => {
      expect(getOpenGraphLocale('tr')).toBe('tr_TR');
      expect(getOpenGraphLocale('en')).toBe('en_US');
      expect(getOpenGraphLocale('es')).toBe('es_ES');
      expect(getOpenGraphLocale('fr')).toBe('fr_FR');
      expect(getOpenGraphLocale('de')).toBe('de_DE');
      expect(getOpenGraphLocale('it')).toBe('it_IT');
      expect(getOpenGraphLocale('ar')).toBe('ar_SA');
    });
  });

  describe('constants', () => {
    it('SUPPORTED_LOCALES contains all 7 locales', () => {
      expect(SUPPORTED_LOCALES).toEqual(['tr', 'en', 'es', 'fr', 'de', 'it', 'ar']);
    });

    it('SUPPORTED_LOCALES has 7 entries', () => {
      expect(SUPPORTED_LOCALES).toHaveLength(7);
    });

    it('DEFAULT_LOCALE is tr', () => {
      expect(DEFAULT_LOCALE).toBe('tr');
    });

    it('RTL_LOCALES contains only ar', () => {
      expect(RTL_LOCALES).toEqual(['ar']);
    });

    it('LOCALE_METADATA has entries for all locales', () => {
      expect(Object.keys(LOCALE_METADATA)).toHaveLength(7);
      for (const locale of SUPPORTED_LOCALES) {
        expect(LOCALE_METADATA[locale]).toBeDefined();
      }
    });
  });
});
