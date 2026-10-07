import '@testing-library/jest-dom/vitest';

// ============================================================
// Public SEO availability endpoint (per-locale content gates)
//
// Page/sitemap metadata resolves `alternates` + `robots` from
// `/api/v1/public/[locale]/seo/availability`. Stub it globally with TR/EN
// content so metadata tests run without a live API; tests that need a
// different availability can still `vi.mock('@/lib/seo/gates')` or stub
// `fetch` themselves (both run after this setup file).
// ============================================================

const SEO_AVAILABILITY = {
  sections: {
    products: ['tr', 'en'],
    collections: ['tr', 'en'],
    applications: ['tr', 'en'],
    projects: ['tr', 'en'],
    journal: ['tr', 'en'],
  },
  company: { about: ['tr', 'en'], quarry: ['tr', 'en'], factory: ['tr', 'en'] },
};

const nativeFetch = globalThis.fetch;

globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url =
    typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  if (url.includes('/seo/availability')) {
    return Promise.resolve(
      new Response(JSON.stringify({ data: SEO_AVAILABILITY }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }

  return nativeFetch(input, init);
}) as typeof globalThis.fetch;
