import { describe, it, expect, vi } from 'vitest';
import { SUPPORTED_LOCALES, getLocaleNativeName } from '@/types/locale';

vi.mock('@/repositories/content', () => ({
  contentRepository: {
    hasPublishedProjects: vi.fn().mockResolvedValue(false),
    findCompanyContent: vi.fn().mockResolvedValue(null),
  },
}));

const { contentService } = await import('@/services/content');

describe('contentService.getFooter', () => {
  it('advertises every supported locale with its native name', async () => {
    const footer = await contentService.getFooter('en');

    expect(footer.language).toHaveLength(SUPPORTED_LOCALES.length);
    expect(footer.language.map((entry) => entry.href)).toEqual(SUPPORTED_LOCALES.map((code) => `/${code}`));
    expect(footer.language.map((entry) => entry.label)).toEqual(SUPPORTED_LOCALES.map(getLocaleNativeName));
    expect(footer.language.filter((entry) => entry.active).map((entry) => entry.href)).toEqual(['/en']);
    expect(footer.language.every((entry) => entry.available)).toBe(true);
  });
});
