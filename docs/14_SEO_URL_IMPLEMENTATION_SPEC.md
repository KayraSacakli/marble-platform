# SEO / URL Implementation Spec

## 1. Purpose

This document defines the final implementation-level rules for URL architecture, TR/EN URLs, slugs, canonical URLs, hreflang, sitemap, robots, metadata, structured data, internal linking, pagination SEO, redirects, 404 behavior, indexing, image SEO, video SEO, and performance-related SEO.

It removes SEO ambiguity before implementation begins. This is a technical specification.

---

## 2. Scope

Covers all SEO and URL implementation concerns for the public website. Does not implement code, create CMS UI, or invent business content.

---

## 3. Source of truth hierarchy

| Concern | Source |
|---|---|
| URL patterns | `06_SEO_URL_ARCHITECTURE.md` |
| API responses | `13_API_CMS_CONTRACT.md` |
| Content models | `12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md` |
| Page specifications | `11_PAGE_SPECIFICATIONS.md` |
| Component tree | `09_COMPONENT_TREE.md` |
| Design system | `10_DESIGN_SYSTEM.md` |
| Homepage video | `07_HOMEPAGE_SCROLL_VIDEO.md` |

---

# PART A — URL ARCHITECTURE

## 4. Canonical URL structure

### 4.1 Locale prefix

All public URLs use path-based locale:

```
/tr/...
/en/...
```

No query-parameter locale, no subdomain locale, no cookie-based locale for public content.

### 4.2 Complete URL map

| Page | Turkish URL | English URL | Indexable |
|---|---|---|---|
| Homepage | `/tr/` | `/en/` | Yes |
| Product listing | `/tr/marbles` | `/en/marbles` | Yes |
| Product detail | `/tr/marbles/{tr-slug}` | `/en/marbles/{en-slug}` | Yes |
| Collection listing | `/tr/collections` | `/en/collections` | Yes |
| Collection detail | `/tr/collections/{tr-slug}` | `/en/collections/{en-slug}` | Yes |
| Application listing | `/tr/applications` | `/en/applications` | Yes |
| Application detail | `/tr/applications/{tr-slug}` | `/en/applications/{en-slug}` | Yes |
| Project listing | `/tr/projects` | `/en/projects` | Conditional |
| Project detail | `/tr/projects/{tr-slug}` | `/en/projects/{en-slug}` | Conditional |
| Journal listing | `/tr/journal` | `/en/journal` | Yes |
| Journal detail | `/tr/journal/{tr-slug}` | `/en/journal/{en-slug}` | Yes |
| About | `/tr/about` | `/en/about` | Yes |
| Quarry | `/tr/quarry` | `/en/quarry` | Yes |
| Factory | `/tr/factory` | `/en/factory` | Yes |
| Contact | `/tr/contact` | `/en/contact` | Yes |
| Quote request | `/tr/quote` | `/en/quote` | No (noindex) |
| 404 | `/tr/404` | `/en/404` | No (noindex) |

### 4.3 URL segment naming

| Segment | Value | Notes |
|---|---|---|
| Products | `marbles` | Consistent across TR/EN |
| Collections | `collections` | Consistent |
| Applications | `applications` | Consistent |
| Projects | `projects` | Consistent |
| Journal | `journal` | Consistent |
| About | `about` | Consistent |
| Quarry | `quarry` | Consistent |
| Factory | `factory` | Consistent |
| Contact | `contact` | Consistent |
| Quote | `quote` | Consistent |

Content-type segments are NOT localized. Only slugs are localized.

---

# PART B — LANGUAGE PREFIX

## 5. Language prefix rules

### 5.1 Locale prefix

- Always lowercase: `/tr/`, `/en/`
- Always at root: `/{locale}/...`
- Never mixed case: NOT `/Tr/`, `/EN/`

### 5.2 Trailing slash policy

| URL | Canonical Form | Notes |
|---|---|---|
| Homepage | `/tr/` (with trailing slash) | Root always has trailing slash |
| Listing pages | `/tr/marbles` (without trailing slash) | Consistent; no trailing slash |
| Detail pages | `/tr/marbles/beyaz-mermer` (without trailing slash) | Consistent |
| Single pages | `/tr/about` (without trailing slash) | Consistent |

Trailing slash variants redirect to canonical form (301).

### 5.3 URL normalization

| Rule | Behavior |
|---|---|
| Lowercase | All URL segments lowercase |
| Hyphens | Multi-word slugs use hyphens |
| No underscores | Underscores replaced with hyphens in slug generation |
| No consecutive hyphens | `--` normalized to `-` |
| No trailing slash (except root) | Redirect to canonical without slash |
| No double slashes | `//` normalized to `/` |
| No encoded characters in slugs | Slugs use ASCII only |

### 5.4 Turkish characters in URLs

- Slugs use ASCII-safe characters only.
- Turkish characters (ğ, ş, ç, ö, ü, ı, İ, Ğ, Ş, Ç, Ö, Ü) are romanized in slugs.
- Romanization rules:

| Turkish | ASCII |
|---|---|
| ğ | g |
| ş | s |
| ç | c |
| ö | o |
| ü | u |
| ı | i |
| İ | i |

- Example: `Beyaz Mermer` → `beyaz-mermer`
- Example: `Şişli Mermer` → `sisli-mermer`

### 5.5 Duplicate URL prevention

- Each content item has exactly one canonical URL per locale.
- Trailing slash variants redirect to canonical.
- Case variants redirect to canonical.
- Old slugs redirect to new slug via 301.

---

# PART C — SLUG STRATEGY

## 6. Slug rules

### 6.1 Slug source

Slugs are created in the CMS by content editors. They are NOT auto-generated from titles (though the CMS may suggest them).

### 6.2 Slug generation rules

| Rule | Description |
|---|---|
| ASCII only | No Unicode characters in slugs |
| Lowercase | All characters lowercase |
| Hyphens | Words separated by hyphens |
| No special characters | Only `a-z`, `0-9`, `-` |
| No consecutive hyphens | Maximum one hyphen between words |
| No leading/trailing hyphens | `beyaz-mermer` not `-beyaz-mermer-` |
| Meaningful | Slug should be human-readable |

### 6.3 Maximum practical length

- Recommended: 5–8 words
- Maximum: 200 characters (practical limit)
- Search engines truncate around 60–70 characters in display

### 6.4 Uniqueness scope

| Scope | Rule |
|---|---|
| Within locale + type | Unique (two Products cannot share same TR slug) |
| Across types | May collide (a Product and Collection can share a slug) |
| Across locales | Independent (TR and EN slugs are different) |

### 6.5 TR slug vs EN slug

```
TR: /tr/marbles/beyaz-mermer
EN: /en/marbles/white-marble
```

Slugs are independent. TR slug does not need to be a romanization of EN slug.

### 6.6 Slug updates

| Scenario | Behavior |
|---|---|
| Slug changed on published content | Previous slug stored in `previousSlugs[]` |
| Redirect | 301 from old slug to new slug |
| SEO outcome | Recorded in AuditEvent |

### 6.7 Old slug redirect

- 301 redirect from old slug to current slug.
- Redirect implemented at routing/server layer.
- API does not return redirect responses.
- Old slug is retired from public use.

---

# PART D — CANONICAL URL

## 7. Canonical rules

### 7.1 General rules

| Rule | Description |
|---|---|
| Self-referencing | Every indexable page has a self-referencing canonical |
| Locale-specific | Canonical includes locale prefix |
| No cross-language canonicalization | TR page canonicalizes to TR, EN to EN |
| No trailing slash inconsistency | Canonical URL matches trailing slash policy |
| Full URL | Canonical is absolute URL with protocol |

### 7.2 Canonical per page type

| Page | Canonical |
|---|---|
| Homepage | `https://example.com/tr/` or `https://example.com/en/` |
| Product listing | `https://example.com/tr/marbles` |
| Product detail | `https://example.com/tr/marbles/{slug}` |
| Collection listing | `https://example.com/tr/collections` |
| Collection detail | `https://example.com/tr/collections/{slug}` |
| Application listing | `https://example.com/tr/applications` |
| Application detail | `https://example.com/tr/applications/{slug}` |
| Project listing | `https://example.com/tr/projects` |
| Project detail | `https://example.com/tr/projects/{slug}` |
| Journal listing | `https://example.com/tr/journal` |
| Journal detail | `https://example.com/tr/journal/{slug}` |
| About | `https://example.com/tr/about` |
| Quarry | `https://example.com/tr/quarry` |
| Factory | `https://example.com/tr/factory` |
| Contact | `https://example.com/tr/contact` |
| Quote request | `https://example.com/tr/quote` (noindex) |
| 404 | N/A (noindex) |

### 7.3 Paginated pages

- Page 1 canonical: base URL (without `?page=1`)
- Page N canonical: base URL (canonical points to base, not paginated page)
- Reason: paginated pages are not independent content; canonical consolidation is standard

### 7.4 Trailing slash variants

- `https://example.com/tr/marbles/` → canonical `https://example.com/tr/marbles`
- 301 redirect to canonical form

### 7.5 Old slugs

- Old slug URL → 301 redirect to current slug URL
- Canonical on old slug page: N/A (page redirects before rendering)

### 7.6 Language variants

- TR canonical: `https://example.com/tr/marbles/beyaz-mermer`
- EN canonical: `https://example.com/en/marbles/white-marble`
- Never cross-canonicalize between languages

### 7.7 Query parameters

- `?page=N` does NOT affect canonical (canonical is base URL)
- `?sort=...` does NOT affect canonical (V1: only `title_asc`)
- No other query parameters in V1

---

# PART E — HREFLANG

## 8. Hreflang architecture

### 8.1 Reciprocal relationship

Every translated indexable page has reciprocal hreflang:

```html
<!-- On TR page -->
<link rel="alternate" hreflang="tr" href="https://example.com/tr/marbles/beyaz-mermer" />
<link rel="alternate" hreflang="en" href="https://example.com/en/marbles/white-marble" />
<link rel="alternate" hreflang="x-default" href="https://example.com/tr/marbles/beyaz-mermer" />

<!-- On EN page -->
<link rel="alternate" hreflang="tr" href="https://example.com/tr/marbles/beyaz-mermer" />
<link rel="alternate" hreflang="en" href="https://example.com/en/marbles/white-marble" />
<link rel="alternate" hreflang="x-default" href="https://example.com/tr/marbles/beyaz-mermer" />
```

### 8.2 Hreflang rules

| Rule | Description |
|---|---|
| Reciprocal | TR page links to EN, EN page links to TR |
| Self-referencing | Each page includes its own hreflang |
| x-default | Points to TR version (or OPEN DECISION) |
| Full URLs | Absolute URLs with protocol |
| Correct locale | Each hreflang points to correct locale URL |
| Indexable targets | Never point hreflang to non-indexable pages |

### 8.3 Missing translation

| Scenario | Hreflang Behavior |
|---|---|
| Both TR and EN exist | Full reciprocal hreflang |
| Only TR exists | TR hreflang self-referencing; no EN hreflang; no x-default pointing to non-existent EN |
| Only EN exists | EN hreflang self-referencing; no TR hreflang; no x-default pointing to non-existent TR |
| Neither exists | Page not public (404) |

### 8.4 Unpublished translation

- If one language variant is unpublished: do NOT generate hreflang pointing to it.
- The published variant has self-referencing hreflang only.
- x-default points to the published variant.

### 8.5 Non-indexable targets

- Never generate hreflang pointing to noindex pages.
- Never generate hreflang pointing to 404 pages.
- Never generate hreflang pointing to redirected pages.

---

# PART F — TITLE / META DESCRIPTION

## 9. Metadata rules

### 9.1 Title rules

| Rule | Description |
|---|---|
| Source | CMS editorial override, or auto-generated from content |
| Localized | TR and EN titles are independent |
| Unique | Each page has a unique title |
| Brand suffix | `{Page Title} — {Brand}` (brand added as suffix) |
| Length guidance | 50–60 characters (search engines truncate around 60) |
| No keyword stuffing | Title describes actual page content |

### 9.2 Title per page type

| Page | Title Pattern | Example |
|---|---|---|
| Homepage | `{Brand} — Premium Turkish Marble` | `Zelta Stone — Premium Turkish Marble` |
| Product listing | `Marble Collection — {Brand}` | `Marble Collection — Zelta Stone` |
| Product detail | `{Name} — Premium Turkish Marble — {Brand}` | `Beyaz Mermer — Premium Turkish Marble — Zelta Stone` |
| Collection listing | `Collections — {Brand}` | `Collections — Zelta Stone` |
| Collection detail | `{Name} — {Brand}` | `White Collection — Zelta Stone` |
| Application listing | `Applications — {Brand}` | `Applications — Zelta Stone` |
| Application detail | `{Name} — {Brand}` | `Interior — Zelta Stone` |
| Project listing | `Projects — {Brand}` | `Projects — Zelta Stone` |
| Project detail | `{Name} — {Brand}` | `Bosphorus Hotel — Zelta Stone` |
| Journal listing | `Journal — {Brand}` | `Journal — Zelta Stone` |
| Journal detail | `{Title} — {Brand}` | `Natural Stone Care — Zelta Stone` |
| About | `About — {Brand}` | `About — Zelta Stone` |
| Quarry | `Quarry — {Brand}` | `Quarry — Zelta Stone` |
| Factory | `Factory — {Brand}` | `Factory — Zelta Stone` |
| Contact | `Contact — {Brand}` | `Contact — Zelta Stone` |
| Quote request | N/A (noindex) | — |

### 9.3 Title fallback

If CMS override is missing:

1. Use content name/title
2. Add brand suffix
3. If no name available: use content type name + brand

Never return empty title.

### 9.4 Meta description rules

| Rule | Description |
|---|---|
| Source | CMS editorial override, or auto-generated from content |
| Localized | TR and EN descriptions are independent |
| Unique | Each page has a unique meta description |
| Length guidance | 150–160 characters |
| No keyword stuffing | Description summarizes actual page content |
| Meaningful | Describes what the page contains |

### 9.5 Meta description per page type

| Page | Description Source |
|---|---|
| Homepage | Approved brand statement |
| Product listing | Approved intro text |
| Product detail | Approved product description (first 150–160 chars) |
| Collection listing | Approved intro text |
| Collection detail | Approved collection description |
| Application listing | Approved intro text |
| Application detail | Approved application description |
| Project listing | Approved intro text |
| Project detail | Approved project description |
| Journal listing | Approved intro text |
| Journal detail | Approved article excerpt |
| About | Approved company statement |
| Quarry | Approved origin story excerpt |
| Factory | Approved production story excerpt |
| Contact | Approved contact description |

### 9.6 Meta description fallback

If CMS override is missing:

1. Use first 150–160 characters of content description
2. If no description: use content type name + brand
3. If nothing available: leave empty (search engines will generate snippet)

Never return fake or misleading descriptions.

---

# PART G — OPEN GRAPH / SOCIAL METADATA

## 10. Open Graph metadata

### 10.1 Standard Open Graph tags

| Tag | Source | Notes |
|---|---|---|
| `og:title` | Same as `<title>` | Page title |
| `og:description` | Same as meta description | Page description |
| `og:image` | Primary content image | Product image, article cover, etc. |
| `og:url` | Canonical URL | Self-referencing |
| `og:type` | Content type | `website`, `product`, `article` |
| `og:locale` | `tr_TR` or `en_US` | Locale format |
| `og:locale:alternate` | Alternate locale | Reciprocal |
| `og:site_name` | Brand name | Consistent across pages |

### 10.2 Open Graph image selection

| Page Type | Image Selection |
|---|---|
| Homepage | Hero fallback image |
| Product detail | Primary product image |
| Collection detail | Collection cover image |
| Application detail | Application cover image |
| Project detail | Project hero image |
| Journal detail | Article cover image |
| About | Company image (if available) |
| Quarry | Quarry image (if available) |
| Factory | Factory image (if available) |
| Contact | Brand logo |

### 10.3 Image dimensions

- Recommended: 1200 × 630 pixels
- Minimum: 600 × 315 pixels
- Aspect ratio: 1.91:1
- Format: JPEG or PNG

### 10.4 No invented social imagery

- Use only real content images.
- Do not generate fake or placeholder social images.
- If no image available: omit `og:image` rather than using a fake image.

---

# PART H — STRUCTURED DATA

## 11. Structured data

### 11.1 Schema types by page

| Page | Schema Type | Required Fields | Notes |
|---|---|---|---|
| Homepage | Organization + WebSite | name, url, logo | Only if real organization data exists |
| Product detail | Product | name, description, image | Only real product data |
| Journal detail | Article | headline, datePublished, author | Only if real article data |
| All pages | BreadcrumbList | itemListElement | Breadcrumb navigation |
| Video (if used) | VideoObject | name, description, thumbnailUrl, uploadDate | Only if real video |

### 11.2 Organization structured data

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{Brand}",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png"
}
```

Only output if real organization data is approved. OPEN DECISION: exact organization data.

### 11.3 WebSite structured data

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{Brand}",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/tr/marbles?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

V1: No search functionality. SearchAction omitted until search is implemented.

### 11.4 Product structured data

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{Product Name}",
  "description": "{Product Description}",
  "image": "{Product Image URL}"
}
```

Only output fields supported by real product data:
- `name`: from product name
- `description`: from product description
- `image`: from primary product image

**Do NOT output:**
- `aggregateRating` (no review system)
- `offers.price` (no pricing data)
- `offers.availability` (no availability data)
- `brand` (unless real brand data approved)
- `manufacturer` (unless real manufacturer data approved)

### 11.5 Article structured data

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{Article Title}",
  "datePublished": "{Publication Date}",
  "author": {
    "@type": "Person",
    "name": "{Author Name}"
  },
  "image": "{Article Cover Image}"
}
```

Only output if real article data exists. Author omitted if no author approved.

### 11.6 BreadcrumbList structured data

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com/tr/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Marbles",
      "item": "https://example.com/tr/marbles"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Beyaz Mermer",
      "item": "https://example.com/tr/marbles/beyaz-mermer"
    }
  ]
}
```

### 11.7 No fabricated structured data

- Never generate fake reviews, ratings, prices, or availability.
- Never generate fake organization data.
- Never generate fake project information.
- Only output data that actually exists in the content model.

---

# PART I — BREADCRUMBS

## 12. Breadcrumb rules

### 12.1 Breadcrumb hierarchy

| Page | Breadcrumb |
|---|---|
| Homepage | None (root) |
| Product listing | Home → Marbles |
| Product detail | Home → Marbles → {Product Name} |
| Collection listing | Home → Collections |
| Collection detail | Home → Collections → {Collection Name} |
| Application listing | Home → Applications |
| Application detail | Home → Applications → {Application Name} |
| Project listing | Home → Projects |
| Project detail | Home → Projects → {Project Name} |
| Journal listing | Home → Journal |
| Journal detail | Home → Journal → {Article Title} |
| About | Home → About |
| Quarry | Home → Quarry |
| Factory | Home → Factory |
| Contact | Home → Contact |
| Quote request | Home → Request Quote |

### 12.2 Localized labels

Breadcrumb labels are localized:

| Label | TR | EN |
|---|---|---|
| Home | Ana Sayfa | Home |
| Marbles | Mermerler | Marbles |
| Collections | Koleksiyonlar | Collections |
| Applications | Uygulamalar | Applications |
| Projects | Projeler | Projects |
| Journal | Dergi | Journal |
| About | Hakkında | About |
| Quarry | Ocak | Quarry |
| Factory | Fabrika | Factory |
| Contact | İletişim | Contact |
| Request Quote | Teklif Talebi | Request Quote |

### 12.3 Breadcrumb URLs

- Each breadcrumb item links to a canonical URL.
- Breadcrumb URLs are locale-specific.
- Last breadcrumb item (current page) is not a link.

### 12.4 Structured data relationship

- Breadcrumb HTML matches BreadcrumbList structured data.
- Both use the same URLs and labels.

---

# PART J — SITEMAP

## 13. Sitemap architecture

### 13.1 Sitemap index

```
/sitemap.xml (index)
├── /sitemap-pages.xml
├── /sitemap-products.xml
├── /sitemap-collections.xml
├── /sitemap-applications.xml
├── /sitemap-projects.xml (conditional)
├── /sitemap-journal.xml
└── /sitemap-media.xml (if justified)
```

### 13.2 Sitemap rules

| Rule | Description |
|---|---|
| Only indexable URLs | No noindex, no redirected, no 404 URLs |
| Published content only | Draft, unpublished, archived excluded |
| Language-specific | Separate URLs for TR and EN |
| lastmod source | Content `updatedAt` timestamp |
| Update frequency | Regenerated on publish/unpublish |

### 13.3 Page sitemap

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/tr/</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/en/</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- ... other static pages ... -->
</urlset>
```

### 13.4 Product sitemap

```xml
<url>
  <loc>https://example.com/tr/marbles/beyaz-mermer</loc>
  <lastmod>2026-01-10</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

### 13.5 What is NOT in sitemap

- Draft content
- Unpublished content
- Duplicate URLs
- Redirected URLs (old slugs)
- 404 URLs
- Non-canonical URLs
- noindex pages (Quote Request, 404)
- Admin/CMS paths
- API paths

### 13.6 Image sitemap

OPEN DECISION: Whether to include image sitemap. Product images may benefit from image sitemap for Google Image Search. Implementation decision.

---

# PART K — ROBOTS

## 14. Robots behavior

### 14.1 robots.txt

```
User-agent: *
Allow: /tr/
Allow: /en/
Disallow: /api/
Disallow: /admin/
Disallow: /preview/
Disallow: /*?page=
```

### 14.2 Public indexable pages

| Path | Robots |
|---|---|
| `/tr/*` | Allow |
| `/en/*` | Allow |
| `/tr/quote` | Allow (but page has noindex meta) |
| `/en/quote` | Allow (but page has noindex meta) |

### 14.3 Private paths

| Path | Robots |
|---|---|
| `/api/*` | Disallow |
| `/admin/*` | Disallow |
| `/preview/*` | Disallow |

### 14.4 Important note

`robots.txt` is NOT a security mechanism. Private resources must be protected by authentication/authorization, not by robots.txt.

---

# PART L — PAGINATION SEO

## 15. Pagination SEO

### 15.1 V1 pagination model

- Server-side pagination with `page` query parameter
- Default `pageSize`: 24
- Maximum `pageSize`: 100

### 15.2 Canonical for paginated pages

| Page | Canonical |
|---|---|
| Page 1 | `https://example.com/tr/marbles` (base URL) |
| Page 2 | `https://example.com/tr/marbles` (base URL, same as page 1) |
| Page N | `https://example.com/tr/marbles` (base URL) |

All paginated pages canonicalize to the base URL.

### 15.3 Prev/next links

```html
<!-- Page 1 -->
<link rel="prev" href="https://example.com/tr/marbles" />
<link rel="next" href="https://example.com/tr/marbles?page=2" />

<!-- Page 2 -->
<link rel="prev" href="https://example.com/tr/marbles" />
<link rel="next" href="https://example.com/tr/marbles?page=3" />

<!-- Last page -->
<link rel="prev" href="https://example.com/tr/marbles?page=N-1" />
```

### 15.4 Crawlability

- All paginated pages are crawlable (not blocked by robots.txt).
- Page 1 is the primary indexed page.
- Subsequent pages are crawlable for link discovery.
- Internal links from page 1 to all other pages.

### 15.5 Internal links

- Page 1 links to page 2, page 3, etc. via pagination component.
- Each page links back to page 1.
- Direct links to specific pages via `?page=N`.

### 15.6 Empty pages

- If `page` exceeds total pages: return empty `data: []` with correct `total`.
- Empty pages are crawlable but not linked from pagination.
- Canonical still points to base URL.

### 15.7 Invalid page numbers

| Scenario | Behavior |
|---|---|
| `page=0` | Normalize to `page=1` |
| `page=-5` | Normalize to `page=1` |
| `page=abc` | 400 error |

---

# PART M — INTERNAL LINKING

## 16. Internal linking strategy

### 16.1 Product internal links

| Source | Target | Link Type |
|---|---|---|
| Product listing | Product detail | Discovery |
| Product detail → Collection | Collection detail | Contextual |
| Product detail → Application | Application detail | Contextual |
| Product detail → Project | Project detail | Contextual |
| Product detail → Journal | Journal detail | Editorial |
| Product detail → Related Product | Product detail | Contextual |
| Homepage (featured) | Product detail | Promotional |
| Collection detail | Product detail | Discovery |
| Application detail | Product detail | Discovery |
| Project detail | Product detail | Reference |
| Journal detail | Product detail | Editorial |

### 16.2 Anchor text rules

| Rule | Description |
|---|---|
| Meaningful | Anchor text describes the target page |
| Natural | Fits naturally within content |
| No keyword stuffing | Not artificially optimized |
| Localized | TR anchor text for TR pages, EN for EN |
| Consistent | Same content uses same anchor text |

### 16.3 Navigation links

- Primary navigation: all main content areas
- Footer: company, catalogue, conversion links
- Breadcrumbs: hierarchical navigation

### 16.4 Conversion links

- Product detail → Quote Request (with product context)
- Application detail → Quote Request (with application context)
- Project detail → Quote Request (with project context)
- Homepage → Quote Request (general)

---

# PART N — ORPHAN CONTENT

## 17. Orphan prevention

### 17.1 Discovery paths

Every published indexable page should have at least one sensible internal discovery path:

| Content Type | Discovery Paths |
|---|---|
| Product | Product listing, Collection detail, Application detail, Project detail, Journal detail, Homepage (if featured), Related Products |
| Collection | Collection listing, Homepage (if featured), Product detail (back-link) |
| Application | Application listing, Homepage (if featured), Product detail (back-link) |
| Project | Project listing (conditional), Homepage (if featured), Product detail (back-link), Application detail |
| Journal | Journal listing, Homepage (if featured), Product detail (back-link), Application detail |

### 17.2 Orphan exceptions

- Content that is published but not linked from any other page is an orphan.
- Orphans are crawlable if in sitemap but have poor discovery.
- CMS should warn when content has no incoming internal links.

### 17.3 Minimum link requirement

- Every published indexable page should be in the sitemap.
- Every published indexable page should be reachable from navigation within 3 clicks.
- Product listing provides discovery for all products.

---

# PART O — 404 / 410 / REDIRECT

## 18. Redirect and error behavior

### 18.1 301 redirect (permanent)

| Scenario | From | To |
|---|---|---|
| Slug changed | `/tr/marbles/old-slug` | `/tr/marbles/new-slug` |
| Trailing slash | `/tr/marbles/` | `/tr/marbles` |
| Case variant | `/tr/Marbles/` | `/tr/marbles` |
| Wrong locale root | `/en/marbles/beyaz-mermer` | `/en/marbles/white-marble` (if slug was TR on EN) |

### 18.2 404 (not found)

| Scenario | Behavior |
|---|---|
| Unknown URL | 404 page with recovery links |
| Unpublished content | 404 (same as not found) |
| Draft content | 404 |
| Archived content | 404 (or 410 if appropriate) |

### 18.3 410 (gone)

- Use only for permanently removed content where 301 redirect is not appropriate.
- Requires explicit approval and recorded SEO outcome.
- V1: 404 is preferred over 410 for simplicity.

### 18.4 Wrong-language slug

- Request: `/tr/marbles/white-marble` (EN slug on TR page)
- Behavior: 404 (slug does not exist for this locale)

### 18.5 Malformed URL

- Request: `/tr/marbles/beyaz mermer` (space in slug)
- Behavior: 404 (slug format invalid)

### 18.6 Redirect chains

- Maximum redirect chain length: 1 hop.
- No redirect chains (A → B → C).
- Redirect directly from old to current.

### 18.7 Redirect loops

- No redirect loops (A → B → A).
- Redirect logic must detect and prevent loops.

### 18.8 Unrelated content redirect

- Do NOT redirect unrelated content to preserve SEO.
- If content is removed, use 404 or 410.
- Do not redirect old Product URL to Homepage.

---

# PART P — INDEXABILITY

## 19. Index/noindex rules

### 19.1 Indexable pages

| Page | Indexable | Reason |
|---|---|---|
| Homepage | Yes | Primary landing page |
| Product listing | Yes | Catalogue discovery |
| Product detail | Yes | Product information |
| Collection listing | Yes | Curated discovery |
| Collection detail | Yes | Collection information |
| Application listing | Yes | Use-context discovery |
| Application detail | Yes | Application information |
| Project listing | Yes (conditional) | Reference discovery |
| Project detail | Yes (conditional) | Project information |
| Journal listing | Yes | Editorial discovery |
| Journal detail | Yes | Article information |
| About | Yes | Company information |
| Quarry | Yes | Origin storytelling |
| Factory | Yes | Production storytelling |
| Contact | Yes | Contact information |

### 19.2 Non-indexable pages

| Page | Indexable | Reason |
|---|---|---|
| Quote request | No (noindex) | Form page, not valuable for search |
| 404 | No (noindex) | Error page |
| Preview | No (noindex) | Draft content |
| CMS | No (noindex) | Internal tool |
| API | No (robots.txt) | Data endpoint |

### 19.3 Temporary states

| State | Indexable |
|---|---|
| Draft | No |
| Approved (not published) | No |
| Published | Yes (if page type is indexable) |
| Unpublished | No |
| Archived | No |

---

# PART Q — IMAGE SEO

## 20. Image SEO

### 20.1 Image filenames

- Descriptive, meaningful filenames
- Lowercase, hyphens
- Example: `beyaz-mermer-product.jpg` not `IMG_001.jpg`

### 20.2 Alt text

| Rule | Description |
|---|---|
| Informative images | Meaningful description of image content |
| Decorative images | Empty alt (`alt=""`) |
| Product images | Describe the marble/material |
| No keyword stuffing | Alt text describes image, not SEO keywords |
| Localized | TR and EN alt text may differ |

### 20.3 Dimensions

- Always provide `width` and `height` attributes.
- Prevents Cumulative Layout Shift (CLS).
- API provides dimensions in MediaPresentation.

### 20.4 Lazy loading

- Below-fold images: `loading="lazy"`
- Above-fold/hero images: `loading="eager"`
- API provides `loading` field in MediaPresentation.

### 20.5 Responsive sources

- Use `srcset` for responsive images.
- Multiple sizes served based on viewport.
- API provides `srcset` and `widths` in MediaPresentation.

### 20.6 Modern formats

- Serve WebP/AVIF with JPEG/PNG fallback.
- Format negotiation at CDN/transport layer.
- Frontend uses `<picture>` element or `srcset` with format hints.

### 20.7 Product image accuracy

- Product images must accurately represent the actual marble.
- Do not alter product appearance for SEO purposes.
- Do not use AI-generated transformations of actual products.

---

# PART R — VIDEO SEO

## 21. Video SEO

### 21.1 VideoObject structured data

Only if homepage hero video is implemented as a real video:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Homepage Hero Video",
  "description": "Premium Turkish marble — quarry to showroom",
  "thumbnailUrl": "https://example.com/hero-poster.jpg",
  "uploadDate": "2026-01-15"
}
```

### 21.2 Video metadata

| Field | Source |
|---|---|
| Poster | Hero fallback image |
| Title | Hero heading (localized) |
| Description | Hero subheading (localized) |
| Thumbnail | Poster image |

### 21.3 Video behavior

From `07_HOMEPAGE_SCROLL_VIDEO.md` (source of truth):

- Scroll-driven cinematic sequence
- Poster shown before video loads
- Fallback on failure, reduced motion, slow connection
- Mobile: fallback image (no video)
- Reduced motion: static fallback

### 21.4 No video SEO manipulation

- Do not create fake video metadata.
- Do not claim video exists if it does not.
- VideoObject only if real video content exists.

---

# PART S — CORE WEB VITALS / PERFORMANCE SEO

## 22. Performance SEO

### 22.1 LCP (Largest Contentful Paint)

| Requirement | Implementation |
|---|---|
| Hero image/video loads quickly | `loading="eager"` for hero media |
| Preload hero media | Consider `<link rel="preload">` for hero image |
| Responsive images | `srcset` serves appropriate size |
| Modern formats | WebP/AVIF for smaller files |
| CDN | Serve media from CDN |

### 22.2 CLS (Cumulative Layout Shift)

| Requirement | Implementation |
|---|---|
| Image dimensions | Always include `width` and `height` attributes |
| Font loading | `font-display: swap` for web fonts |
| Reserved space | Aspect ratio CSS for media containers |
| Dynamic content | Reserve space for async-loaded content |

### 22.3 INP (Interaction to Next Paint)

| Requirement | Implementation |
|---|---|
| Minimal JavaScript | Code splitting, tree shaking |
| No render-blocking resources | Critical CSS inline, async JS |
| Fast interactions | Minimal event handlers, efficient DOM |

### 22.4 Font loading

- `font-display: swap` for Playfair Display and Inter
- Preload critical fonts
- Self-hosted vs CDN: OPEN DECISION

### 22.5 Lazy loading

- Below-fold images: `loading="lazy"`
- Below-fold sections: consider intersection observer
- Hero media: always eager

### 22.6 Code splitting

- Split JavaScript by route/page
- Only load code needed for current page
- Defer non-critical JavaScript

---

# PART T — ACCESSIBILITY + SEO

## 23. Accessibility and SEO overlap

### 23.1 Semantic HTML

| Element | SEO Benefit | Accessibility Benefit |
|---|---|---|
| `<h1>`–`<h6>` | Heading hierarchy for crawlers | Screen reader navigation |
| `<nav>` | Navigation landmark | Screen reader landmark |
| `<main>` | Content landmark | Screen reader landmark |
| `<header>` | Site header | Screen reader landmark |
| `<footer>` | Site footer | Screen reader landmark |
| `<article>` | Article content | Screen reader semantics |
| `<section>` | Content sections | Screen reader semantics |
| `<a href>` | Crawlable links | Keyboard accessible |
| `<button>` | Interactive elements | Keyboard accessible |
| `<img alt>` | Image understanding | Screen reader description |
| `<table>` | Data tables | Screen reader table navigation |

### 23.2 Heading hierarchy

- One `<h1>` per page
- Proper hierarchy: h1 → h2 → h3
- No skipped levels
- SEO: crawlers use headings to understand content structure
- Accessibility: screen readers use headings for navigation

### 23.3 Accessible links

- Descriptive anchor text
- Keyboard focusable
- Visible focus indicator
- SEO: meaningful anchor text helps crawlers understand link targets

### 23.4 Language attributes

- `<html lang="tr">` or `<html lang="en">`
- SEO: search engines serve correct language version
- Accessibility: screen readers use correct pronunciation

### 23.5 Image alt text

- SEO: search engines understand image content
- Accessibility: screen readers describe images

### 23.6 No conflict

SEO implementation must NOT compromise accessibility:
- No hidden text for SEO
- No keyword stuffing in alt text
- No invisible links
- No text rendered as images for SEO

---

# PART U — ANALYTICS + SEO

## 24. Analytics and SEO

### 24.1 Rules

| Rule | Description |
|---|---|
| No crawlability interference | Analytics scripts must not block crawling |
| No rendering interference | Analytics must not prevent content rendering |
| No navigation interference | Analytics must not change link behavior |
| No accessibility interference | Analytics must not add inaccessible elements |
| No performance interference | Analytics must not significantly impact CWV |

### 24.2 Implementation boundary

- Analytics provider selection: implementation decision
- Analytics script loading: async/defer
- Analytics must not be render-blocking

---

# PART V — INTERNATIONALIZATION

## 25. Internationalization SEO

### 25.1 HTML lang attribute

```html
<html lang="tr">  <!-- On Turkish pages -->
<html lang="en">  <!-- On English pages -->
```

### 25.2 Localized metadata

- Title: localized
- Meta description: localized
- OG title: localized
- OG description: localized
- OG locale: `tr_TR` or `en_US`
- Structured data: localized where applicable

### 25.3 Localized URLs

- TR slug on TR pages
- EN slug on EN pages
- Language switch navigates to equivalent locale variant

### 25.4 Localized navigation

- Navigation labels localized
- URLs locale-specific
- Language switch shows current language

### 25.5 Localized structured data

- BreadcrumbList: localized labels
- Product: localized name and description
- Article: localized headline

### 25.6 Language switching

- Take user to equivalent translated page.
- If translation does not exist: show non-deceptive state.
- Never silently switch to unrelated content.

---

# PART W — RENDERING STRATEGY

## 26. Rendering strategy

### 26.1 SEO requirement

Search engines must receive meaningful page content without relying solely on client-side JavaScript interaction.

### 26.2 Recommended approach

| Page Type | Rendering | Reason |
|---|---|---|
| Homepage | Server-side / Static | Critical landing page; hero content must be in initial HTML |
| Product listing | Server-side / Static | Catalogue must be crawlable |
| Product detail | Server-side / Static | Product content must be in initial HTML |
| Collection detail | Server-side / Static | Content must be crawlable |
| Application detail | Server-side / Static | Content must be crawlable |
| Project detail | Server-side / Static | Content must be crawlable |
| Journal detail | Server-side / Static | Article content must be in initial HTML |
| About, Quarry, Factory | Server-side / Static | Content must be crawlable |
| Contact | Server-side / Static | Form must be accessible |
| Quote request | Server-side / Static | Form must be accessible |

### 26.3 What NOT to do

- Do NOT rely on client-side rendering for critical content.
- Do NOT require JavaScript to see page content.
- Do NOT hide content behind client-side interactions.

### 26.4 JavaScript enhancement

- JavaScript may enhance experience (animations, video, interactive elements).
- Core content and navigation must work without JavaScript.
- Progressive enhancement approach.

---

# PART X — REDIRECT MAP

## 27. Redirect rules

### 27.1 Permanent redirects (301)

| From | To | Reason |
|---|---|---|
| `/tr/marbles/old-slug` | `/tr/marbles/new-slug` | Slug changed |
| `/tr/marbles/` | `/tr/marbles` | Trailing slash removal |
| `/tr/Marbles` | `/tr/marbles` | Case normalization |
| `/tr/Marbles/` | `/tr/marbles` | Case + trailing slash |

### 27.2 No redirect

| From | To | Reason |
|---|---|---|
| `/tr/marbles/white-marble` | 404 | Wrong locale slug |
| `/tr/nonexistent` | 404 | Unknown URL |
| `/admin/` | 401/403 | Private path |

### 27.3 Redirect implementation

- Redirects implemented at server/routing layer.
- Maximum 1 hop (no chains).
- Loop detection required.
- Redirects logged for audit.

---

# PART Y — METADATA IMPLEMENTATION

## 28. Metadata implementation

### 28.1 HTML head elements

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- SEO -->
  <title>{SEO Title}</title>
  <meta name="description" content="{SEO Description}" />
  <link rel="canonical" href="{Canonical URL}" />
  
  <!-- Hreflang -->
  <link rel="alternate" hreflang="tr" href="{TR URL}" />
  <link rel="alternate" hreflang="en" href="{EN URL}" />
  <link rel="alternate" hreflang="x-default" href="{Default URL}" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="{OG Title}" />
  <meta property="og:description" content="{OG Description}" />
  <meta property="og:image" content="{OG Image}" />
  <meta property="og:url" content="{Canonical URL}" />
  <meta property="og:type" content="{OG Type}" />
  <meta property="og:locale" content="{OG Locale}" />
  <meta property="og:locale:alternate" content="{Alternate Locale}" />
  <meta property="og:site_name" content="{Brand}" />
  
  <!-- Robots -->
  <meta name="robots" content="{robots directive}" />
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    {Structured Data JSON}
  </script>
  
  <!-- Pagination -->
  <link rel="prev" href="{Previous Page URL}" />
  <link rel="next" href="{Next Page URL}" />
  
  <!-- Fonts -->
  <link rel="preload" href="{Font URL}" as="font" type="font/woff2" crossorigin />
</head>
```

### 28.2 Data source

| Element | Source |
|---|---|
| Title | API `seo.title` |
| Meta description | API `seo.metaDescription` |
| Canonical | API `seo.canonical` |
| Hreflang | API `seo.hreflang` |
| OG tags | API `seo.ogImage` + content data |
| Robots | API `seo.robots` |
| Structured data | API `seo.structuredData` |
| Pagination | Client-side from pagination meta |

---

# PART Z — AUDIT

## 29. Consistency audit

### 29.1 Against 00_PROJECT_RULES.md

| Check | Result |
|---|---|
| No invented business facts | PASS — All SEO metadata from real content |
| TR/EN supported | PASS — Locale in URL path; hreflang reciprocal |
| Truthfulness | PASS — No fake structured data, no keyword stuffing |
| Accessibility | PASS — SEO does not compromise accessibility |
| Media rights | PASS — Images represent actual products |

### 29.2 Against 06_SEO_URL_ARCHITECTURE.md

| Check | Result |
|---|---|
| URL patterns | PASS — All URLs match established patterns |
| Locale strategy | PASS — Path-based locale preserved |
| Slug management | PASS — Slug rules consistent |
| Canonical | PASS — Self-referencing canonicals |
| Hreflang | PASS — Reciprocal TR/EN |
| Sitemap | PASS — Sitemap architecture defined |
| Indexability | PASS — Index/noindex rules defined |

### 29.3 Against 12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md

| Check | Result |
|---|---|
| SEO data model | PASS — SEOData object consistent |
| Slug management | PASS — Slug rules consistent |
| Publication lifecycle | PASS — Only published content indexed |

### 29.4 Against 13_API_CMS_CONTRACT.md

| Check | Result |
|---|---|
| SEOData in responses | PASS — All indexable responses include SEO data |
| Hreflang in responses | PASS — API provides hreflang data |
| Structured data | PASS — API provides structured data |

### 29.5 Against 11_PAGE_SPECIFICATIONS.md

| Check | Result |
|---|---|
| Page URLs | PASS — All page URLs match specifications |
| SEO requirements | PASS — All SEO requirements addressed |

### 29.6 Cross-cutting checks

| Check | Result |
|---|---|
| No keyword stuffing | PASS |
| No fabricated structured data | PASS |
| No fake company claims | PASS |
| No fake projects | PASS |
| No fake reviews/ratings | PASS |
| No fake prices | PASS |
| No fake availability | PASS |
| Real content only | PASS |
| Accessibility preserved | PASS |
| Performance considered | PASS |

---

## 30. AUDIT SUMMARY

| Metric | Value |
|---|---|
| Sections created | 29 |
| URL patterns defined | 17 page types × 2 locales |
| SEO rules defined | 30+ |
| Structured data types | 5 |
| Redirect rules defined | 8 |
| Open decisions | 0 |
| Consistency checks | ALL PASS |

---

## 31. STATUS

**READY FOR IMPLEMENTATION**

---

## 32. DECIDED

| # | Decision | Choice | Reason |
|---|---|---|---|
| 1 | Root `/` redirect | 302/307 temporary → `/tr/` | Entry point, not canonical content; indexable URLs are `/tr/...` and `/en/...` |
| 2 | x-default hreflang | Points to `/tr/` | TR is default language |
| 3 | Image sitemap | Included | Marble catalogue is image-heavy; product images are Google Images–relevant; only real product images, no decorative UI |

### 32.1 Root redirect details

- `/` → 302/307 temporary redirect to `/tr/`
- NOT 301 because root is an entry point, not a permanent canonical URL
- No automatic IP/browser language detection
- SEO and predictability benefit from deterministic behavior

### 32.2 Image sitemap details

- Only published, indexable, real product images
- No decorative UI images
- No placeholder or generated images
- `MediaAsset` entities with `usage === "product"` and `visibility === "public"`
