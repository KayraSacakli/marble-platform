import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { JsonLd, escapeJsonLd } from '@/components/seo/JsonLd';

const MALICIOUS = {
  name: 'Evil </script><script>alert(1)</script> Product',
  description: 'Line one</script><img src=x onerror=alert(2)>',
};

function renderJsonLd(data: Record<string, unknown>): { markup: string; content: string } {
  const markup = renderToStaticMarkup(<JsonLd data={data} />);
  const match = markup.match(/<script[^>]*>([\s\S]*)<\/script>/);
  return { markup, content: match?.[1] ?? '' };
}

describe('JsonLd script escaping (Phase 18D-4)', () => {
  it('never emits a literal </script> inside the JSON payload', () => {
    const { markup, content } = renderJsonLd(MALICIOUS);
    expect(content).not.toContain('</script>');
    expect(content).toContain('\\u003c');
    // exactly one script element: the wrapper itself
    expect(markup.match(/<script/g)).toHaveLength(1);
    expect(markup.match(/<\/script>/g)).toHaveLength(1);
  });

  it('round-trips through JSON.parse with identical data', () => {
    const { content } = renderJsonLd(MALICIOUS);
    const parsed = JSON.parse(content) as typeof MALICIOUS;
    expect(parsed).toEqual(MALICIOUS);
  });

  it('escapeJsonLd escapes every < and leaves other JSON untouched', () => {
    const json = JSON.stringify({ a: '</script>', b: 'plain & > chars', n: 42 });
    const escaped = escapeJsonLd(json);
    expect(escaped).not.toContain('<');
    expect(JSON.parse(escaped)).toEqual(JSON.parse(json));
  });
});
