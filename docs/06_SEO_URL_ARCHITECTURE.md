# SEO URL Architecture

## 1. Purpose

This document defines how the public website's URLs and search-engine-facing architecture work across Turkish (TR) and English (EN) for all approved public content areas. It establishes stable, understandable, multilingual-consistent, crawlable, indexable, canonicalized URL patterns with controlled lifecycle behavior.

The SEO URL architecture serves the already-approved Information Architecture from `01_MASTER_INFORMATION_ARCHITECTURE.md`. It does not redesign navigation, create artificial landing pages, introduce keyword-stuffed URLs, invent content types, or fabricate claims for SEO purposes.

---

## 2. Scope

This document covers:

- Multilingual URL strategy (TR/EN)
- URL patterns for all approved public content types
- Product URL architecture for 100+ products
- Slug management policy
- URL lifecycle aligned with content lifecycle
- Redirect governance
- Canonical architecture
- Hreflang architecture
- Indexability rules
- Sitemap architecture
- Robots/crawler governance
- Pagination SEO behavior
- Query parameter handling
- Internal search indexability
- Structured data evaluation
- Metadata responsibility boundaries
- URL ownership and change control

---

## 3. SEO principles

### 3.1 Foundational rules

- SEO architecture serves the approved Information Architecture, not the reverse.
- URLs must be stable, human-readable, and language-aware.
- Every public content item must have localized URLs for both TR and EN (or approved exception).
- No implicit language fallback in URLs or content delivery.
- No fabricated structured data, keyword stuffing, thin pages, or deceptive redirects.
- Content must pass through Revision → Approval → Eligibility → Publish before URL becomes public.
- Removed/unpublished URLs require explicit recorded SEO outcome (404, 410, 301 to relevant replacement, or noindex).
- Blanket homepage redirects are prohibited unless explicitly justified and approved.

### 3.2 Truthfulness constraint

SEO must amplify real approved content, not manufacture claims. No SEO pages based on invented marble origins, quarry ownership, certifications, technical properties, projects, customers, production capacity, export markets, logistics, or awards.

---

## 4. Multilingual URL architecture

### 4.1 Locale strategy

**Decision:** Locale is path-based using ISO 639-1 language codes.

```
/tr/...
/en/...
```

This aligns with:
- `01_MASTER_INFORMATION_ARCHITECTURE.md` — locale-first hierarchy example
- `02_DOMAIN_MODEL.md` — one conceptual entity with TR/EN variants
- `03_DATABASE_ER.md` — ContentVariant with locale uniqueness per ContentItem
- `04_API_CONTRACT.md` — locale path segment or query parameter

### 4.2 Root URL behavior

**Decision:** Root URL (`/`) performs a language detection and redirects to the appropriate locale.

| Condition | Behavior |
|---|---|
| No locale preference detected | Redirect to `/{default-locale}/` |
| Browser language preference detected | Redirect to matching locale if available |
| User explicit selection | Respect selection |

**OPEN DECISION:** Default locale for root redirect. Options:
- `/tr/` (primary market is Turkey)
- `/en/` (international audience priority)
- Language detection with no permanent default

Impact: Affects root URL indexing and crawl budget allocation.

### 4.3 Language switch behavior

Language switch navigates to the equivalent variant of the same conceptual entity:

```
/tr/marbles/{tr-slug} → /en/marbles/{en-slug}
/en/marbles/{en-slug} → /tr/marbles/{tr-slug}
```

If the target variant is not publication-eligible:
- Do not show unrelated content
- Show explicit non-deceptive state (e.g., "This content is not available in English")
- Language switch link may be visually disabled or show availability status

### 4.4 Localized URL paths

Each language variant has its own localized URL path. TR and EN slugs are independent and may differ.

```
/tr/marbles/beyaz-mermer
/en/marbles/white-marble
```

The same ContentItem UUID underlies both URLs, but the public URL identifiers are language-specific.

### 4.5 Every public item must have both localized URLs

Per `00_PROJECT_RULES.md` and `01_MASTER_INFORMATION_ARCHITECTURE.md`, all public content requires TR and EN variants. A content entity is language-complete only when both variants are prepared and approved.

An approved language exception may allow publication with one variant, but:
- This must be explicitly recorded
- The URL for the missing language must not show unrelated content
- The public behavior must be non-deceptive

---

## 5. Public URL architecture

### 5.1 URL pattern matrix

| Page | URL Pattern | Indexable | Notes |
|---|---|---|---|
| Homepage | `/{locale}/` | Yes | Language-specific homepage |
| Product listing | `/{locale}/marbles` | Yes | Paginated: `?page=2` |
| Product detail | `/{locale}/marbles/{slug}` | Yes | Localized slug per variant |
| Collections listing | `/{locale}/collections` | Yes | Paginated |
| Collection detail | `/{locale}/collections/{slug}` | Yes | Localized slug per variant |
| Applications listing | `/{locale}/applications` | Yes | Paginated |
| Application detail | `/{locale}/applications/{slug}` | Yes | Localized slug per variant |
| Projects listing | `/{locale}/projects` | Conditional | Only when qualifying projects exist |
| Project detail | `/{locale}/projects/{slug}` | Conditional | Only when published |
| Journal listing | `/{locale}/journal` | Yes | Paginated |
| Journal article | `/{locale}/journal/{slug}` | Yes | Localized slug per variant |
| About | `/{locale}/about` | Yes | Single page per locale |
| Quarry | `/{locale}/quarry` | Yes | Single page per locale |
| Factory | `/{locale}/factory` | Yes | Single page per locale |
| Contact | `/{locale}/contact` | Yes | Single page per locale |
| Request Quote | `/{locale}/quote` | No (or noindex) | Form page; not valuable for search discovery |
| 404 | `/{locale}/404` | No | Error page |

### 5.2 URL hierarchy

```
/{locale}/
├── marbles
│   └── {product-slug}
├── collections
│   └── {collection-slug}
├── applications
│   └── {application-slug}
├── projects
│   └── {project-slug}
├── journal
│   └── {article-slug}
├── about
├── quarry
├── factory
├── contact
└── quote
```

### 5.3 URL segment naming

| Segment | TR | EN | Notes |
|---|---|---|---|
| Product listing | marbles | marbles | Consistent across locales |
| Collections | collections | collections | Consistent |
| Applications | applications | applications | Consistent |
| Projects | projects | projects | Consistent |
| Journal | journal | journal | Consistent |
| About | about | about | Consistent |
| Quarry | quarry | quarry | Consistent |
| Factory | factory | factory | Consistent |
| Contact | contact | contact | Consistent |
| Quote | quote | quote | Consistent |

**Decision:** Top-level path segments are consistent across locales (not translated). This simplifies URL management and avoids segment collision. Only slugs are localized.

Rationale:
- Consistent segments reduce redirect complexity
- Easier sitemap management
- Aligns with `04_API_CONTRACT.md` endpoint patterns
- Reduces user confusion when switching languages

---

## 6. Content-type URL patterns

### 6.1 Homepage

```
/tr/
/en/
```

- Single page per locale
- High SEO importance
- Contains hero content with fallback
- Breadcrumbs: none (root)

### 6.2 Product listing

```
/tr/marbles
/en/marbles
```

- Paginated: `?page=2`, `?page=3`, etc.
- Default page size: 24 (per `04_API_CONTRACT.md`)
- Alphabetical ordering by active locale title
- High SEO importance
- Breadcrumbs: Home → Marbles

### 6.3 Product detail

```
/tr/marbles/{tr-product-slug}
/en/marbles/{en-product-slug}
```

- Localized slug per variant
- High SEO importance
- Breadcrumbs: Home → Marbles → Product
- Related content links to collections, applications, projects, journal
- Quote request context available

### 6.4 Collections listing

```
/tr/collections
/en/collections
```

- Paginated
- High SEO importance
- Breadcrumbs: Home → Collections

### 6.5 Collection detail

```
/tr/collections/{tr-collection-slug}
/en/collections/{en-collection-slug}
```

- Localized slug per variant
- High SEO importance
- Contains linked products
- Breadcrumbs: Home → Collections → Collection

### 6.6 Applications listing

```
/tr/applications
/en/applications
```

- Paginated
- High SEO importance
- Breadcrumbs: Home → Applications

### 6.7 Application detail

```
/tr/applications/{tr-application-slug}
/en/applications/{en-application-slug}
```

- Localized slug per variant
- High SEO importance
- Contains linked products and projects
- Breadcrumbs: Home → Applications → Application

### 6.8 Projects listing

```
/tr/projects
/en/projects
```

- Conditional visibility: only when at least one qualifying project exists
- Paginated
- Medium SEO importance
- If no qualifying projects: not exposed in public navigation; URL returns appropriate state (empty listing or hidden)
- Breadcrumbs: Home → Projects

### 6.9 Project detail

```
/tr/projects/{tr-project-slug}
/en/projects/{en-project-slug}
```

- Conditional: only when published project exists
- Medium SEO importance
- Contains linked products and applications
- Breadcrumbs: Home → Projects → Project

### 6.10 Journal listing

```
/tr/journal
/en/journal
```

- Paginated
- High SEO importance
- Breadcrumbs: Home → Journal

### 6.11 Journal article

```
/tr/journal/{tr-article-slug}
/en/journal/{en-article-slug}
```

- Localized slug per variant
- High SEO importance
- Contains contextual links to products, applications, projects
- Breadcrumbs: Home → Journal → Article

### 6.12 Company pages

```
/tr/about        /en/about
/tr/quarry       /en/quarry
/tr/factory      /en/factory
/tr/contact      /en/contact
```

- Single page per locale per type
- Medium SEO importance
- Content Owner approval required for company-specific content
- Breadcrumbs: Home → About/Quarry/Factory/Contact

### 6.13 Quote request

```
/tr/quote        /en/quote
```

- Form page; not intended for search discovery
- Noindex or limited indexability
- Not a content entity; no slug management

---

## 7. Product URL architecture

### 7.1 Requirements

Product URLs must be:
- Stable across content updates
- Human-readable and meaningful
- Scalable for 100+ products
- Language-aware (localized slugs)
- Independent from database IDs
- Resistant to unnecessary changes

### 7.2 Slug ownership

Each ContentVariant owns its localized slug. The slug is:
- Stored in ContentVariant (per `03_DATABASE_ER.md`)
- Unique within its locale and content type
- Editable by Author/Editor
- Subject to approval workflow

### 7.3 Uniqueness constraint

```
UNIQUE(slug, locale, content_type)
```

- `beyaz-mermer` in `/tr/marbles/` is unique among TR product slugs
- `white-marble` in `/en/marbles/` is unique among EN product slugs
- Same slug may exist in different content types (e.g., collection slug vs product slug)
- Same slug may exist in different locales

### 7.4 Collision handling

When a slug collision occurs:
1. CMS detects collision before save
2. Author/Editor must choose alternative slug
3. CMS suggests variations (append suffix, modify)
4. Collision prevention is API-level validation

### 7.5 Slug changes

When a product slug changes:
1. Previous slug is stored in slug history
2. Old URL receives redirect to new URL
3. Redirect is permanent (301)
4. Audit event recorded
5. Sitemap updated

### 7.6 Historical URL handling

The system maintains slug history:
- Previous slugs mapped to current content
- Redirects from old slugs to current URL
- No slug reuse for active content
- Slug reuse only after permanent removal + cooling period

### 7.7 Deleted products

When a product is permanently removed:
- Recorded SEO outcome governs URL behavior (404, 410, or 301 to relevant replacement)
- Slug enters cooldown period before potential reuse
- Minimal trace retained

### 7.8 Archived products

When a product is archived:
- URL behavior follows recorded SEO outcome
- May become noindex or receive redirect
- Content retained internally

### 7.9 Unpublished products

When a product is unpublished:
- URL withdrawn from public access
- Recorded SEO outcome governs visitor result
- Content may be republished

---

## 8. Slug management

### 8.1 Slug generation

**Decision:** Slugs are generated during content creation by Author/Editor, with CMS normalization assistance.

| Aspect | Policy |
|---|---|
| Generator | CMS normalizes input; Author/Editor may override |
| Editable | Yes, by Author/Editor, subject to approval |
| Independent TR/EN | Yes, each variant has its own slug |
| Uniqueness scope | Per locale + content type |
| Normalization | Lowercase, hyphenated, ASCII-safe |
| Allowed characters | `a-z`, `0-9`, `-` (hyphen) |
| Transliteration | Turkish characters transliterated (ı→i, ö→o, ü→u, ç→c, ş→s, ğ→g) |
| Reserved words | `admin`, `api`, `public`, `auth`, `login`, `quote`, `contact`, `about`, `quarry`, `factory`, `journal`, `projects`, `applications`, `collections`, `marbles` (top-level segments) |
| Collision handling | CMS detects and prevents; Author/Editor must resolve |
| Case sensitivity | Case-insensitive (lowercase canonical) |
| Trailing slash | No trailing slash (consistent normalization) |

### 8.2 Slug normalization

Input normalization:
- Convert to lowercase
- Replace spaces with hyphens
- Remove consecutive hyphens
- Transliterate Turkish characters
- Remove non-allowed characters
- Trim leading/trailing hyphens

Examples:
```
Input: "Beyaz Mermer"
Output: "beyaz-mermer"

Input: "Çimstone Bianco"
Output: "cimstone-bianco"

Input: "Ürün Detayı"
Output: "urun-detayi"
```

### 8.3 Slug history

When a slug changes:
1. New slug validated for uniqueness
2. Previous slug stored in redirect mapping
3. 301 redirect from old to new
4. Audit event recorded
5. Sitemap updated

### 8.4 Redirect chain prevention

- Maximum redirect chain depth: 1
- If a redirect target itself has a redirect, update the original redirect to point to final destination
- No redirect loops permitted

### 8.5 Slug reuse

Slug reuse policy:
- Active content: no reuse
- Permanently removed content: cooling period before reuse
- Cooling period duration: OPEN DECISION (implementation decision)
- Archived content: slug remains reserved

---

## 9. URL lifecycle

URL lifecycle must align with content lifecycle from `05_CMS_CONTRACT.md`.

### 9.1 State-to-URL mapping

| Content State | URL Behavior | Indexable | Crawlable | Notes |
|---|---|---|---|---|
| Draft | Not accessible | No | No | 404 or access denied |
| Approved | Not accessible | No | No | Approval alone does not create public URL |
| Published | Public URL active | Yes | Yes | Full SEO treatment |
| Unpublished | URL withdrawn | No | No | Recorded SEO outcome governs |
| Archived | URL withdrawn | No | No | Recorded SEO outcome governs |
| Permanently Removed | URL removed | No | No | Recorded SEO outcome governs |

### 9.2 Draft content

- Not publicly accessible
- Not indexable
- Not crawlable
- robots.txt or meta robots noindex for any preview mechanism
- Draft preview restricted to authenticated users only

### 9.3 Approved content

- Approval does not automatically create public URL
- Content must be explicitly published by Publisher
- Approved state is eligibility, not publication

### 9.4 Published content

- Public URL active and indexable
- Crawlable by search engines
- Included in sitemap
- Full SEO treatment (canonical, hreflang, structured data)

### 9.5 Unpublished content

When content is unpublished:
1. Publisher records SEO outcome
2. URL behavior follows recorded outcome:
   - 404: page not found
   - 410: gone permanently
   - 301: redirect to relevant replacement
   - noindex: remain accessible but not indexed
3. URL removed from sitemap
4. Navigation and listings updated

### 9.6 Archived content

When content is archived:
1. Publisher records archive reason and SEO outcome
2. URL behavior follows recorded outcome
3. Content retained internally
4. URL removed from active inventory

### 9.7 Permanently removed content

When content is permanently removed:
1. Publisher records SEO outcome
2. Minimal trace retained (URL decision, audit)
3. Slug enters cooldown period
4. Content no longer exists as active public resource

---

## 10. Redirect architecture

### 10.1 Redirect governance

| Redirect Type | Owner | Approval Required |
|---|---|---|
| Slug change | CMS (automatic on slug update) | Publisher records change |
| URL structure change | Infrastructure + SEO governance | Documented change record |
| Content removal | Publisher | SEO outcome recorded |
| Content merge | Publisher | 301 to surviving content; documented |
| Language exception | Content Owner | Approved exception recorded |

### 10.2 Redirect types

| Type | Use | HTTP Status |
|---|---|---|
| Permanent redirect | Slug change, content moved permanently | 301 |
| Temporary redirect | Content temporarily unavailable | 302 (use sparingly) |

**Decision:** V1 uses 301 redirects for permanent changes. 302 redirects are avoided unless temporary behavior is genuinely required.

### 10.3 Redirect rules

- No blanket homepage redirects (prohibited per `00_PROJECT_RULES.md`)
- Redirects must point to genuinely relevant replacement content
- Maximum redirect chain: 1 hop
- No redirect loops
- Redirect mappings maintained in redirect table (database)
- Redirects included in sitemap maintenance

### 10.4 Redirect retention

**OPEN DECISION:** How long redirects are retained after permanent removal.

Options:
- Indefinite (until slug reused)
- Fixed period (e.g., 2 years)
- Based on crawl frequency

Impact: Affects link equity preservation and user experience for old URLs.

### 10.5 Localized slug changes

When a localized slug changes:
1. Old URL (e.g., `/tr/marbles/eski-slug`) receives 301 to new URL (`/tr/marbles/yeni-slug`)
2. Other locale URL unchanged unless also modified
3. Hreflang updated to reflect new URLs

---

## 11. Canonical architecture

### 11.1 Canonical URL rules

Every public page has a canonical URL pointing to itself:

```
/tr/marbles/beyaz-mermer → canonical: /tr/marbles/beyaz-mermer
/en/marbles/white-marble → canonical: /en/marbles/white-marble
```

### 11.2 Language-specific canonicals

TR and EN variants have independent canonical URLs. They are not canonical duplicates of each other.

```
/tr/marbles/beyaz-mermer → canonical: /tr/marbles/beyaz-mermer
/en/marbles/white-marble → canonical: /en/marbles/white-marble
```

The hreflang relationship connects them, not canonical.

### 11.3 Duplicate URL handling

Duplicate URLs may arise from:
- Trailing slash variation
- Case variation
- Query parameters
- Protocol variation (http vs https)

**Resolution:**
- Trailing slash: normalized to no trailing slash
- Case: normalized to lowercase
- Query parameters: canonical points to clean URL without tracking parameters
- Protocol: HTTPS preferred; HTTP redirects to HTTPS

### 11.4 Query parameters

| Parameter | Canonical Treatment | Notes |
|---|---|---|
| `page` | Included in canonical for pagination | Each page has own canonical |
| `sort` | Not included (V1 only alphabetical) | Not applicable in V1 |
| `utm_*` | Stripped from canonical | Tracking parameters not canonical |
| `locale` | Not used (locale is path-based) | N/A |
| `preview` | Noindex; not canonical | Draft preview only |

### 11.5 Pagination canonical

Each paginated page has its own canonical URL:

```
/tr/marbles?page=1 → canonical: /tr/marbles?page=1
/tr/marbles?page=2 → canonical: /tr/marbles?page=2
```

Paginated pages are indexable and contain rel="prev" and rel="next" links where supported.

---

## 12. Hreflang architecture

### 12.1 Reciprocal hreflang

Every published public page with TR and EN variants must include reciprocal hreflang tags:

```html
<!-- On /tr/marbles/beyaz-mermer -->
<link rel="alternate" hreflang="tr" href="https://example.com/tr/marbles/beyaz-mermer" />
<link rel="alternate" hreflang="en" href="https://example.com/en/marbles/white-marble" />
<link rel="alternate" hreflang="x-default" href="https://example.com/tr/marbles/beyaz-mermer" />

<!-- On /en/marbles/white-marble -->
<link rel="alternate" hreflang="tr" href="https://example.com/tr/marbles/beyaz-mermer" />
<link rel="alternate" hreflang="en" href="https://example.com/en/marbles/white-marble" />
<link rel="alternate" hreflang="x-default" href="https://example.com/tr/marbles/beyaz-mermer" />
```

### 12.2 Language-region codes

**Decision:** Use language-only codes (`tr`, `en`) without region subtags.

Rationale:
- Platform is international, not region-specific
- Turkish content is for Turkish-speaking audience globally
- English content is for international audience
- Simplifies hreflang implementation

### 12.3 Self-reference

Every hreflang set must include self-reference:
- `/tr/...` page references itself as `hreflang="tr"`
- `/en/...` page references itself as `hreflang="en"`

### 12.4 Missing language variant

If one language variant is not publication-eligible:
- Do not include hreflang for missing variant
- Do not fabricate URL for missing content
- The page with available variant is still indexable
- Hreflang set is incomplete but honest

### 12.5 Unpublished language variant

If one variant is unpublished:
- Remove hreflang for unpublished variant from published variant
- Published variant remains indexable with reduced hreflang set

### 12.6 Hreflang and canonical interaction

- Hreflang references canonical URLs
- If canonical is redirected, hreflang should reference final canonical
- Hreflang is independent from canonical but uses canonical URLs

### 12.7 x-default behavior

**OPEN DECISION:** x-default URL behavior.

Options:
- Point to TR homepage (primary market)
- Point to EN homepage (international default)
- Point to language detection page

Impact: Affects which version search engines serve to users with no language preference.

---

## 13. Indexability rules

### 13.1 Indexability matrix

| Page | Indexable | Meta Robots | Notes |
|---|---|---|---|
| Homepage | Yes | index, follow | High SEO importance |
| Product listing | Yes | index, follow | Paginated pages indexable |
| Product detail | Yes | index, follow | High SEO importance |
| Collections listing | Yes | index, follow | |
| Collection detail | Yes | index, follow | |
| Applications listing | Yes | index, follow | |
| Application detail | Yes | index, follow | |
| Projects listing | Conditional | index, follow (when populated) | Hidden if no qualifying projects |
| Project detail | Conditional | index, follow (when published) | |
| Journal listing | Yes | index, follow | |
| Journal article | Yes | index, follow | High SEO importance |
| About | Yes | index, follow | |
| Quarry | Yes | index, follow | |
| Factory | Yes | index, follow | |
| Contact | Yes | index, follow | |
| Quote request | No | noindex | Form page; not valuable for search |
| 404 page | No | noindex | Error page |
| Draft content | No | noindex (if accessible) | Not publicly accessible |
| CMS/admin | No | noindex, nofollow | Not public |
| Preview | No | noindex, nofollow | Draft preview; authenticated only |

### 13.2 Projects conditional visibility

Per `01_MASTER_INFORMATION_ARCHITECTURE.md` and `02_DOMAIN_MODEL.md`:

- Projects listing and detail URLs are indexable only when at least one qualifying published project exists
- If no qualifying project exists at launch:
  - Projects navigation hidden
  - Projects listing not exposed
  - No indexable empty projects page
  - SEO does not create placeholder content

### 13.3 Draft content

- Not publicly accessible
- Not indexable
- Preview mechanism (if implemented) must not expose drafts to search engines
- robots.txt or meta robots must block indexing

### 13.4 Unpublished/archived content

- Removed from index over time
- URL behavior follows recorded SEO outcome
- Sitemap updated to exclude

---

## 14. Sitemap architecture

### 14.1 Sitemap structure

```
/sitemap.xml (index)
├── /sitemap-products-tr.xml
├── /sitemap-products-en.xml
├── /sitemap-collections-tr.xml
├── /sitemap-collections-en.xml
├── /sitemap-applications-tr.xml
├── /sitemap-applications-en.xml
├── /sitemap-projects-tr.xml
├── /sitemap-projects-en.xml
├── /sitemap-journal-tr.xml
├── /sitemap-journal-en.xml
├── /sitemap-pages-tr.xml
├── /sitemap-pages-en.xml
```

### 14.2 Sitemap content

Each sitemap includes:
- Published, indexable URLs only
- Last modification date
- Change frequency hint (not binding for crawlers)
- Priority hint (not binding for crawlers)

### 14.3 Exclusions

Sitemaps must NOT include:
- Draft content
- Unpublished content
- Archived content
- Non-indexable pages (quote, 404, admin)
- Redirect URLs (only final destination)
- Content with language exception (only if the available variant is published)

### 14.4 Language-specific sitemaps

TR and EN have separate sitemaps:
- Enables language-specific crawl budget allocation
- Simplifies sitemap maintenance
- Aligns with hreflang strategy

### 14.5 Sitemap scaling

- Maximum 50,000 URLs per sitemap file
- Maximum 50MB uncompressed per sitemap file
- For 100+ products: single product sitemap per locale is sufficient
- If scale increases: sitemap index with segmented files

### 14.6 Image sitemap

**Decision:** Image sitemap is recommended but not mandatory for V1.

Rationale:
- Product pages contain significant imagery
- Image search can drive traffic
- But implementation complexity may be deferred

**OPEN DECISION:** Whether to include image sitemap in V1 scope.

### 14.7 Sitemap updates

Sitemap must be updated when:
- Content published
- Content unpublished/removed
- Slug changed
- New content created

Sitemap is regenerated or incrementally updated based on implementation choice.

---

## 15. Robots / crawler governance

### 15.1 robots.txt

```
User-agent: *
Allow: /tr/
Allow: /en/
Disallow: /admin/
Disallow: /api/
Disallow: /*?preview=

Sitemap: https://example.com/sitemap.xml
```

### 15.2 Crawler governance rules

| Area | Robots Behavior | Rationale |
|---|---|---|
| Public content | Allow | Indexable content |
| CMS/admin | Disallow | Not public |
| API endpoints | Disallow | Not public |
| Preview URLs | Disallow | Draft content; authenticated |
| Quote request form | Allow (page) but noindex | Page accessible but not indexed |

### 15.3 Draft preview

Per `05_CMS_CONTRACT.md` (OPEN DECISION on preview implementation):
- Preview must not be accessible to search engines
- robots.txt or meta robots must block indexing
- Preview URLs must not be crawlable
- Authentication required for preview access

### 15.4 CMS/admin protection

- All `/admin/` paths blocked from crawlers
- Authentication required
- No public exposure of admin URLs

---

## 16. Pagination

### 16.1 V1 pagination requirements

Per `01_MASTER_INFORMATION_ARCHITECTURE.md`:
- Alphabetical browsing with explicit sequential pages
- Pagination required conceptually
- Infinite scroll and load-more not V1

### 16.2 Pagination URL pattern

```
/tr/marbles          (page 1)
/tr/marbles?page=2   (page 2)
/tr/marbles?page=3   (page 3)
```

### 16.3 Pagination indexability

- All paginated pages are indexable
- Each page has unique canonical URL
- Page 1 canonical: `/tr/marbles?page=1` (or `/tr/marbles` without query)
- Subsequent pages: `/tr/marbles?page=N`

**OPEN DECISION:** Whether page 1 canonical should include `?page=1` or be clean URL.

Options:
- `/tr/marbles` (clean) — avoids duplicate with `/tr/marbles?page=1`
- `/tr/marbles?page=1` (explicit) — consistent with other pages

Impact: Minor; affects crawl efficiency and duplicate detection.

### 16.4 Pagination links

- rel="prev" and rel="next" where supported (being deprecated but still useful for some crawlers)
- Internal pagination links use nofollow? **No** — pagination links should be followed to ensure crawlability

### 16.5 Alphabetical ordering

Pagination preserves alphabetical ordering by active locale's approved display title. Order is deterministic and stable.

---

## 17. Query parameters

### 17.1 V1 query parameters

| Parameter | Use | Canonical | Indexable |
|---|---|---|---|
| `page` | Pagination | Included | Yes |
| `sort` | Sorting (not V1) | N/A | N/A |
| `filter` | Filtering (not V1) | N/A | N/A |
| `utm_*` | Tracking | Excluded | Yes (but not canonical) |
| `preview` | Draft preview | Excluded | No (noindex) |
| `ref` | Referral tracking | Excluded | Yes |

### 17.2 Query parameter policy

- Only `page` is a significant parameter in V1
- Tracking parameters (`utm_*`, `ref`) are excluded from canonical
- Preview parameters trigger noindex
- Future filtering/sorting parameters: implement only with approved scope change

### 17.3 Parameter handling in sitemap

Sitemaps include canonical URLs with significant parameters (e.g., `?page=2`).
Tracking parameters are excluded from sitemap URLs.

---

## 18. Internal search

### 18.1 External Search Entry vs Internal Site Search

Per `01_MASTER_INFORMATION_ARCHITECTURE.md`:
- **External Search Entry:** Arrival from search engines; this is the SEO concern
- **Internal Site Search:** Visitor-operated search feature; not V1 scope

### 18.2 Internal search indexability

Internal Site Search is not V1 scope. If implemented in future:
- Search result URLs should not be indexable
- Search results are dynamic, low-quality for indexing
- Use noindex on search result pages
- Do not create artificial landing pages from search

### 18.3 Future implementation

If Internal Site Search is added:
- robots.txt: `Disallow: /search`
- Meta robots: noindex on search results
- Do not expose search URLs in sitemap

---

## 19. Structured data

### 19.1 Evaluation criteria

Structured data must be:
- Truthful (based on approved content)
- Supported by actual page content
- Appropriate to page type
- Consistent with search engine guidelines
- Not fabricated or exaggerated

### 19.2 Structured data candidates

| Type | Page | Required | Rationale |
|---|---|---|---|
| Organization | Homepage, About | Recommended | Company identity; supports knowledge panel |
| WebSite | Homepage | Recommended | Site identity; supports sitelinks search box |
| BreadcrumbList | All hierarchical pages | Recommended | Navigation context; supports rich snippets |
| Product | Product detail | Recommended | Product information; supports rich results |
| Article | Journal article | Recommended | Editorial content; supports article rich results |
| ImageObject | Product detail | Optional | Image metadata; supports image search |
| LocalBusiness | About/Contact | Optional | If real business address approved |
| FAQ | Product/Article | Optional | If FAQ content approved |

### 19.3 Structured data NOT included

| Type | Reason |
|---|---|
| Review/Rating | No review system in V1 |
| Event | No events in V1 |
| JobPosting | No job listings |
| Recipe | Not applicable |
| Video | Hero video implementation deferred |
| Product availability/price | Not modeled in V1 |

### 19.4 Product structured data

Product structured data must reflect approved content only:
- Name: approved product name
- Description: approved product description
- Image: approved primary image
- Brand: company name (only if approved)
- Material: marble/natural stone (only if approved)

No fabricated:
- Price
- Availability
- Reviews
- Ratings
- SKU
- Weight/dimensions (unless approved)

### 19.5 Article structured data

Journal articles:
- Headline: approved article title
- Image: approved article image
- Author: approved author name (if approved)
- DatePublished: approved publication date
- DateModified: last modification date

### 19.6 Structured data governance

Structured data is part of the page content, managed through CMS:
- Title, description, image: managed by Author/Editor
- Structured data type: determined by content type
- Approval: follows content approval workflow
- Validation: before publication, structured data validated against content

**OPEN DECISION:** Exact structured data scope for V1. The above represents recommended types; final selection depends on approved content availability.

---

## 20. Metadata responsibility boundary

### 20.1 CMS responsibilities

| Metadata | Owner | Notes |
|---|---|---|
| Page title | Author/Editor | Localized per variant |
| Meta description | Author/Editor | Localized per variant |
| Slug | Author/Editor | Localized per variant; normalized |
| Content body | Author/Editor | Localized per variant |
| Media/alt text | Author/Editor | Localized per variant |
| Breadcrumbs | System (derived) | From content hierarchy |
| Structured data | System (derived) | From content type and fields |

### 20.2 SEO architecture responsibilities

| Aspect | Owner | Notes |
|---|---|---|
| Canonical strategy | SEO architecture | Defined in this document |
| Hreflang | SEO architecture | Defined in this document |
| Indexability | SEO architecture | Defined in this document |
| URL patterns | SEO architecture | Defined in this document |
| Sitemap behavior | SEO architecture | Defined in this document |
| Redirect governance | SEO architecture + Publisher | Defined in this document |

### 20.3 Application/API responsibilities

| Aspect | Owner | Notes |
|---|---|---|
| Validation | API layer | Field, domain, integrity |
| Publication eligibility | Service layer | Gate checks |
| URL resolution | Application layer | Slug to content mapping |
| Cache invalidation | Application layer | On publish/unpublish |
| Hreflang generation | Application layer | From content data |

### 20.4 Database responsibilities

| Aspect | Owner | Notes |
|---|---|---|
| Slug uniqueness | Database constraint | Per locale + content type |
| Slug history | Database storage | For redirects |
| Lifecycle state | Database constraint | Valid state transitions |
| Referential integrity | Database constraint | Foreign keys |

### 20.5 Responsibility separation

- CMS manages content and metadata; SEO architecture defines behavior
- API validates; SEO architecture defines rules
- Database enforces uniqueness; SEO architecture defines slug policy
- Application generates hreflang; SEO architecture defines format

---

## 21. URL ownership & change control

### 21.1 Role-based URL control

| Role | URL Authority |
|---|---|
| Author / Editor | Create content with slug; edit slug (subject to approval) |
| Approver | Approve content including slug and URL |
| Publisher | Publish/unpublish with recorded SEO outcome; manage redirects |
| Content Owner | Approve company-specific content and URLs |

### 21.2 URL change control

URL changes require:
1. Author/Editor proposes slug change
2. Approver reviews and approves
3. Publisher executes with redirect creation
4. Audit event recorded
5. Sitemap updated

### 21.3 No new "SEO Manager" role

**Decision:** No additional SEO-specific role is created. URL governance is handled through existing Publisher responsibility with SEO outcome recording.

Rationale:
- SEO decisions are architectural, not operational
- Publisher already controls publication lifecycle
- Adding role creates unnecessary complexity
- SEO governance is document-driven, not role-driven

### 21.4 SEO outcome ownership

When content is unpublished or removed, the Publisher is responsible for recording the SEO outcome. This is not delegated to a separate SEO role.

---

## 22. SEO content governance

### 22.1 Publication workflow

SEO URLs follow the standard publication workflow:

```
Revision → Approval → Eligibility checks → Publish
```

A page cannot become public merely because:
- It has a slug
- It has metadata
- It has structured data
- It exists in the database

### 22.2 SEO cannot bypass governance

- No SEO-optimized pages created outside content workflow
- No automated page generation without approval
- No thin content pages for keyword targeting
- No duplicate content for location/keyword variations
- No fabricated structured data

### 22.3 Content quality gate

Before publication, content must pass:
- Approval gate (per `05_CMS_CONTRACT.md`)
- Language completeness gate
- Media rights gate
- Publication gate (content-type specific)
- SEO minimum quality (meaningful content, not thin)

---

## 23. Performance / hero video SEO boundary

### 23.1 SEO dependencies on performance

- Crawlability requires server-rendered or indexable content
- Stable HTML content for indexing
- Image optimization for Core Web Vitals and image search
- Lazy loading boundaries: below-fold images may lazy load; hero images should not
- Video behavior: deferred to `12_PERFORMANCE_ACCESSIBILITY.md`

### 23.2 Hero video SEO requirements

Per `01_MASTER_INFORMATION_ARCHITECTURE.md`, homepage contains scroll-driven hero sequence. SEO requirements:

- Accessible fallback (non-video content path)
- Crawlable textual content (headings, descriptions)
- No dependency on video for understanding core content
- Meaningful headings and text independent of video
- Performance implications deferred to `12_PERFORMANCE_ACCESSIBILITY.md`

### 23.3 Content independence

Core page content must be available without:
- JavaScript execution
- Video playback
- Animation completion
- Media loading

This ensures crawlability and accessibility.

---

## 24. Open decisions

### SEO-contract blocking

None. The SEO URL architecture supports all approved V1 behavior.

### SEO-contract non-blocking

1. **Default locale for root redirect.** Whether `/` redirects to `/tr/` or `/en/` based on detection or fixed default. Impact: root URL indexing and crawl budget.

2. **x-default hreflang behavior.** Whether x-default points to TR homepage, EN homepage, or language detection page. Impact: search engine language preference handling.

3. **Page 1 canonical URL format.** Whether `/tr/marbles` or `/tr/marbles?page=1` is canonical. Impact: minor duplicate detection.

4. **Redirect retention period.** How long redirects are maintained after permanent removal. Impact: link equity preservation.

5. **Slug cooldown period.** How long before a slug from permanently removed content can be reused. Impact: URL stability.

6. **Image sitemap inclusion in V1.** Whether image sitemap is implemented in V1 scope. Impact: image search visibility.

7. **Structured data final scope.** Exact structured data types implemented in V1 based on approved content availability. Impact: rich result eligibility.

### Later implementation

1. Sitemap generation mechanism (static build vs dynamic)
2. Redirect storage and management implementation
3. Hreflang generation implementation
4. Canonical tag implementation
5. Structured data templating
6. Performance optimization for crawl efficiency

---

## 25. Traceability

| SEO/URL Decision | Source |
|---|---|
| Locale path-based strategy | `01_MASTER_INFORMATION_ARCHITECTURE.md` — locale-first hierarchy; `04_API_CONTRACT.md` — locale path segment |
| No implicit fallback | `00_PROJECT_RULES.md` — language rules; `01` — multilingual architecture; `02` — domain model |
| URL patterns | `01` — content hierarchy; `02` — content types; `03` — ContentVariant slug |
| Product URL architecture | `01` — product discovery; `02` — catalog domain; `03` — Product entity; `04` — product endpoints |
| Slug management | `03_DATABASE_ER.md` — slug uniqueness; `05_CMS_CONTRACT.md` — slug creation |
| URL lifecycle | `00` — content lifecycle; `01` — lifecycle states; `02` — lifecycle domain; `05` — lifecycle management |
| Redirect governance | `00` — SEO outcome requirement; `05` — unpublish/remove with SEO outcome |
| Canonical architecture | `04_API_CONTRACT.md` — locale-specific responses; `02` — language variants |
| Hreflang architecture | `01` — multilingual architecture; `02` — language variant identity; `04` — locale requirements |
| Indexability | `01` — page inventory SEO importance; `02` — project conditional visibility; `05` — publication gates |
| Sitemap | `01` — content hierarchy; `04` — public endpoints; `05` — publication lifecycle |
| Robots/crawler | `00` — security baseline; `05` — CMS/API boundary; draft preview |
| Pagination | `01` — pagination requirement; `02` — V1 catalogue browsing; `04` — pagination parameters |
| Structured data | `00` — truthfulness; `01` — SEO information architecture; content-type specific |
| URL ownership | `01` — conceptual responsibilities; `05` — role model; `00` — governance |

---

## 26. Consistency audit

### Against 00_PROJECT_RULES.md

| Check | Result |
|---|---|
| Truthfulness | Pass: no fabricated claims, no keyword stuffing, no thin pages |
| No silent decisions | Pass: all decisions traced or marked OPEN |
| Bilingual scope | Pass: TR/EN URLs for all public content |
| Security | Pass: CMS/admin blocked from crawlers |
| Lifecycle | Pass: URL lifecycle aligned with content lifecycle |
| V1 scope | Pass: no advanced features added |
| SEO outcome requirement | Pass: unpublish/remove requires recorded SEO outcome |
| No blanket redirects | Pass: homepage redirects prohibited |

### Against 01_MASTER_INFORMATION_ARCHITECTURE.md

| Check | Result |
|---|---|
| User journeys | Pass: URL patterns support all primary user journeys |
| Navigation | Pass: URL hierarchy matches navigation structure |
| Content hierarchy | Pass: URL patterns reflect content hierarchy |
| Project visibility | Pass: conditional indexability respects launch rule |
| Multilingual | Pass: one entity, TR/EN URLs, no implicit fallback |
| Product discovery | Pass: product URLs support 100+ catalogue |
| Pagination | Pass: paginated catalogue URLs defined |

### Against 02_DOMAIN_MODEL.md

| Check | Result |
|---|---|
| Entity identity | Pass: URLs reference conceptual entities via slugs |
| Content lifecycle | Pass: URL behavior maps to lifecycle states |
| Language variants | Pass: each variant has independent URL |
| Content relationships | Pass: URL patterns support relationship discovery |
| Quote Request | Pass: quote URL not indexable; context preserved |
| Project launch | Pass: conditional visibility respected |

### Against 03_DATABASE_ER.md

| Check | Result |
|---|---|
| Database identity | Pass: URLs use slugs, not UUIDs |
| Slug persistence | Pass: slug stored in ContentVariant |
| Lifecycle persistence | Pass: lifecycle state persisted; URL behavior derived |
| Media relationships | Pass: media URLs follow content URLs |
| No contradiction | Pass: URL architecture aligns with ER model |

### Against 04_API_CONTRACT.md

| Check | Result |
|---|---|
| Public boundary | Pass: only published content URL accessible |
| Locale handling | Pass: path-based locale aligns with API locale requirement |
| Publication workflow | Pass: URLs created on publish, removed on unpublish |
| Caching | Pass: URL-based caching aligned |
| Pagination | Pass: page parameter handling defined |

### Against 05_CMS_CONTRACT.md

| Check | Result |
|---|---|
| CMS workflow | Pass: slug creation through CMS workflow |
| Revision/approval | Pass: slug changes follow approval workflow |
| Publication eligibility | Pass: URLs published only when eligible |
| Media | Pass: media URLs follow content lifecycle |
| Role model | Pass: URL control aligned with role responsibilities |
| Draft preview | Pass: preview URLs blocked from indexing |
| Lifecycle | Pass: URL lifecycle aligned with CMS lifecycle |

---

SEO URL ARCHITECTURE STATUS [READY FOR INTERNAL LINK GRAPH]

---

## Critical OPEN DECISIONS

1. **Default locale for root redirect** — Whether `/` redirects to `/tr/` or `/en/` affects root URL indexing.
2. **x-default hreflang** — Whether x-default points to TR, EN, or language detection affects search engine language handling.
3. **Page 1 canonical format** — Whether `/tr/marbles` or `/tr/marbles?page=1` is canonical.
4. **Redirect retention period** — How long redirects are maintained after permanent removal.
5. **Slug cooldown period** — How long before removed slugs can be reused.
6. **Image sitemap in V1** — Whether image sitemap is included in V1 scope.
7. **Structured data final scope** — Exact types implemented based on approved content availability.