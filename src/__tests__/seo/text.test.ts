import { describe, expect, it } from 'vitest';
import { htmlToPlainText } from '@/lib/seo/text';

describe('htmlToPlainText', () => {
  it('strips paragraph tags and collapses whitespace', () => {
    expect(htmlToPlainText('<p>Merhaba</p><p>Dünya</p>')).toBe('Merhaba Dünya');
  });

  it('keeps plain text unchanged', () => {
    expect(htmlToPlainText('Düz metin açıklama.')).toBe('Düz metin açıklama.');
  });

  it('does not leak entity-free tag characters', () => {
    expect(htmlToPlainText('<p>4.000 m² kapalı alan &amp; more</p>')).toBe(
      '4.000 m² kapalı alan &amp; more',
    );
  });
});
