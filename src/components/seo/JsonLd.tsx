interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * `<script>` content is raw-text: a literal `</script>` inside any string
 * value (e.g. CMS content) would terminate the tag early and allow script
 * injection. Escaping every `<` to the JSON unicode escape `<
 * keeps the JSON semantically identical (`JSON.parse` round-trips) while
 * making breakout impossible.
 */
export function escapeJsonLd(json: string): string {
  return json.replace(/</g, '\\u003c');
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escapeJsonLd(JSON.stringify(data)) }}
    />
  );
}
