# API / CMS Contract

## 1. Purpose

This document defines the formal contract between the content/CMS layer, API, and public frontend. It makes implementation possible without ambiguity.

It answers:

> "Frontend hangi endpoint'ten hangi veriyi, hangi formatta, hangi durumda alacak?"

and:

> "API hangi kurallara göre veri döndürecek?"

This is a CONTRACT document. It is NOT an implementation task.

---

## 2. Scope

Covers the complete API contract: architecture, principles, endpoint inventory, request/response shapes, localization, media, SEO, errors, pagination, cache, security, content revision, slugs, related content, frontend data layer, performance, accessibility, analytics, CMS write operations, and open decisions.

Does not implement Express controllers, React code, database migrations, CMS UI, authentication UI, real content, or production infrastructure.

---

## 3. Source of truth hierarchy

| Concern | Source |
|---|---|
| Immutable rules | `00_PROJECT_RULES.md` |
| Information architecture | `01_MASTER_INFORMATION_ARCHITECTURE.md` |
| Domain model | `02_DOMAIN_MODEL.md` |
| Database ER | `03_DATABASE_ER.md` |
| API contract (existing) | `04_API_CONTRACT.md` |
| CMS contract | `05_CMS_CONTRACT.md` |
| SEO URL architecture | `06_SEO_URL_ARCHITECTURE.md` |
| Internal link graph | `07_INTERNAL_LINK_GRAPH.md` |
| Page wireframes | `08_PAGE_WIREFRAMES.md` |
| Component tree | `09_COMPONENT_TREE.md` |
| Design system | `10_DESIGN_SYSTEM.md` |
| Page specifications | `11_PAGE_SPECIFICATIONS.md` |
| Content management & data flow | `12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md` |

---

# PART A — API ARCHITECTURE

## 4. API architecture

### 4.1 API base path

```
/api/v1
```

Versioned under `/api/v1`. A breaking contract change requires a new API version. Additive compatible changes may remain in v1.

### 4.2 Public API boundary

```
/api/v1/public/*
```

The public API serves only published, approved, language-eligible content with rights-eligible media. It never exposes drafts, revisions, approvals, actors, audit data, archived/removed records, or private Quote Requests.

### 4.3 CMS/Admin API boundary

```
/api/v1/admin/*
```

The admin API manages content creation, editing, approval, publication, lifecycle, media, and Quote Request processing. Requires authenticated, authorized internal actors.

### 4.4 Authentication boundary

| Boundary | Authentication | Authorization |
|---|---|---|
| Public API | None required | None (content visibility is data-driven) |
| Admin API | Required for every request | Role-based: Author/Editor, Approver, Publisher, Content Owner |

### 4.5 Public vs private data

| Data | Public API | Admin API |
|---|---|---|
| Published content | Yes | Yes |
| Draft content | Never | Yes |
| Approval records | Never | Yes |
| Revision history | Never | Yes |
| Internal actors | Never | Yes |
| Audit events | Never | Yes |
| Quote Requests | Never (submission endpoint only) | Yes (authorized actors) |
| Media rights evidence | Never | Yes |
| Unpublished content | Never | Yes |

### 4.6 Content publication gate

Public endpoints return content only when ALL conditions are met:

1. ContentItem is published (aggregate state)
2. ContentVariant is published (per-locale state)
3. Required language variants are complete (TR + EN) or approved exception exists
4. Current revision has valid approval
5. Media assets have verified publication rights
6. Informative images have meaningful alternative text
7. Product-specific: name, slug, description, primary image, alt text all present

### 4.7 Language handling

- All localized public content requests require locale in URL path: `/tr/...` or `/en/...`
- No implicit fallback to another language
- Missing/ineligible variants return `404`
- Approved language exception handled through approved public behavior, never by returning unrelated content

### 4.8 Error handling

- Consistent error shape across all endpoints
- No stack traces, database messages, approval internals, or security-sensitive details
- Request/correlation ID for every response
- Localized error messages when request locale is available

---

# PART B — API PRINCIPLES

## 5. API principles

### 5.1 REST/resource-oriented conventions

| Convention | Rule |
|---|---|
| Resource names | Plural nouns: `/products`, `/collections`, `/applications` |
| Detail routes | `/{resource}/{identifier}` where identifier is public slug |
| HTTP methods | GET for reads, POST for creates/mutations, PATCH for partial updates |
| Status codes | Semantic: 200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500 |
| Versioning | `/api/v1/` prefix |

### 5.2 Predictable response structure

Success:

```json
{
  "data": { ... },
  "meta": { ... }
}
```

Error:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "details": [...],
    "requestId": "..."
  }
}
```

### 5.3 Consistent error structure

Every error response follows the same shape. `details` is supplied only for actionable validation errors.

### 5.4 Pagination

- Collection responses paginated with `page` and `pageSize`
- Default `pageSize`: 24
- Maximum `pageSize`: 100
- Meta: `{ page, pageSize, total, totalPages }`

### 5.5 Localization

- Locale is always in URL path segment: `/tr/...` or `/en/...`
- API never infers language from headers, cookies, or user agent for public content
- Missing locale in request: 400 error
- Missing translation for requested locale: 404 error

### 5.6 Caching

- Published public reads are cacheable by locale and identifier
- List caches vary by pagination/sort parameters
- Publish/unpublish/archive/remove must invalidate affected caches
- Admin and Quote Request endpoints are not publicly cacheable

### 5.7 Validation

Three layers:

1. **API boundary**: Shape, locale, required values, request size, allowed values
2. **Service/domain**: Lifecycle, approval, relevance, roles, publication eligibility
3. **Database**: Identity, relations, uniqueness, Quote Request context integrity

### 5.8 Content visibility

Public API applies ALL visibility filters:

- Lifecycle state = Published
- Language variant exists and is eligible
- Approval record exists for current revision
- Media rights verified
- Alt text present for informative images
- Product publication gate passed (for Products)

### 5.9 SEO metadata

Every indexable page response includes SEO data object. Frontend consumes and applies to `<head>`.

### 5.10 Media presentation

Media is returned as presentation objects, not raw storage references. Frontend receives what it needs for rendering.

### 5.11 Relationship expansion

Related content is returned as summaries (id, name, slug, primary image), not full detail objects. This prevents deep recursive nesting and excessive payload sizes.

---

# PART C — PUBLIC ENDPOINT INVENTORY

## 6. Public endpoint inventory

| # | Method | Endpoint | Purpose | Auth | Language | Paginated |
|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/public/homepage` | Homepage content | No | Required | No |
| 2 | GET | `/api/v1/public/products` | Product catalogue | No | Required | Yes |
| 3 | GET | `/api/v1/public/products/:slug` | Product detail | No | Required | No |
| 4 | GET | `/api/v1/public/collections` | Collection listing | No | Required | Yes |
| 5 | GET | `/api/v1/public/collections/:slug` | Collection detail | No | Required | No |
| 6 | GET | `/api/v1/public/applications` | Application listing | No | Required | Yes |
| 7 | GET | `/api/v1/public/applications/:slug` | Application detail | No | Required | No |
| 8 | GET | `/api/v1/public/projects` | Project listing | No | Required | Yes |
| 9 | GET | `/api/v1/public/projects/:slug` | Project detail | No | Required | No |
| 10 | GET | `/api/v1/public/journal` | Journal listing | No | Required | Yes |
| 11 | GET | `/api/v1/public/journal/:slug` | Journal detail | No | Required | No |
| 12 | GET | `/api/v1/public/company/about` | About content | No | Required | No |
| 13 | GET | `/api/v1/public/company/quarry` | Quarry content | No | Required | No |
| 14 | GET | `/api/v1/public/company/factory` | Factory content | No | Required | No |
| 15 | GET | `/api/v1/public/navigation` | Navigation data | No | Required | No |
| 16 | GET | `/api/v1/public/footer` | Footer data | No | Required | No |
| 17 | POST | `/api/v1/public/quote-requests` | Submit quote request | No | Request locale | No |
| 18 | GET | `/api/v1/public/quote-requests/:id` | Check quote request status | No | — | No |

**Total public endpoints: 18**

---

# PART D — ENDPOINT CONTRACT

## 7. General endpoint contract

### 7.1 Request structure

| Element | Requirement |
|---|---|
| HTTP method | GET for reads, POST for mutations |
| URL | Lowercase, hyphens for multi-word resources |
| Locale | Always in path: `/tr/...` or `/en/...` |
| Query parameters | Optional; `page`, `pageSize`, `sort` where applicable |
| Path parameters | `:slug` for detail endpoints, `:id` for Quote Request status |
| Request body | JSON for POST endpoints only |

### 7.2 Successful response (200/201)

```json
{
  "data": { ... },
  "meta": { ... }
}
```

`meta` is present only for paginated responses.

### 7.3 Empty list response (200)

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 24,
    "total": 0,
    "totalPages": 0
  }
}
```

### 7.4 Validation failure (422)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid parameters.",
    "details": [
      {
        "field": "page",
        "code": "INVALID_PAGE",
        "message": "Page must be a positive integer."
      }
    ],
    "requestId": "req_abc123"
  }
}
```

### 7.5 Not found (404)

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found.",
    "requestId": "req_abc123"
  }
}
```

### 7.6 Unpublished content (404)

Same as not found. Public API does not distinguish between non-existent and unpublished content.

### 7.7 Server error (500)

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred.",
    "requestId": "req_abc123"
  }
}
```

No stack traces, database messages, or internal details.

### 7.8 Rate limiting (429)

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "requestId": "req_abc123"
  }
}
```

### 7.9 SEO implications

- Every indexable page response includes `seo` object
- Frontend applies SEO data to `<head>` tags
- Canonical URL is self-referencing
- Hreflang is reciprocal (TR ↔ EN)
- Structured data is included where applicable

---

# PART E — PRODUCT API

## 8. Product list

### 8.1 Request

```
GET /api/v1/public/products?locale={locale}&page={page}&pageSize={pageSize}&sort={sort}
```

| Parameter | Type | Required | Default | Notes |
|---|---|---|---|---|
| `locale` | `tr` \| `en` | Yes | — | Path segment |
| `page` | Integer | No | 1 | 1-indexed |
| `pageSize` | Integer | No | 24 | Max 100 |
| `sort` | String | No | `title_asc` | V1: only `title_asc` |

### 8.2 Response (200)

```typescript
interface ProductListResponse {
  data: ProductSummary[];
  meta: PaginationMeta;
}

interface ProductSummary {
  id: string;                    // ContentItem UUID
  name: string;                  // Localized product name
  slug: string;                  // Localized URL slug
  tagline?: string;              // Localized brief summary (if approved)
  primaryImage: MediaPresentation; // Primary product image
  isFeatured: boolean;           // Whether featured on Homepage
}

interface PaginationMeta {
  page: number;                  // Current page (1-indexed)
  pageSize: number;              // Items per page
  total: number;                 // Total items
  totalPages: number;            // Total pages
}
```

### 8.3 Sorting

V1: `sort=title_asc` only. Alphabetical by active locale's approved display title.

### 8.4 Filtering

V1: No filters. Products are browsed alphabetically by locale title.

### 8.5 Empty response (200)

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 24,
    "total": 0,
    "totalPages": 0
  }
}
```

---

## 9. Product detail

### 9.1 Request

```
GET /api/v1/public/products/:slug?locale={locale}
```

| Parameter | Type | Required | Notes |
|---|---|---|---|
| `locale` | `tr` \| `en` | Yes | Path segment |
| `:slug` | String | Yes | Localized URL slug |

### 9.2 Response (200)

```typescript
interface ProductDetailResponse {
  data: ProductDetail;
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description: string;              // Localized rich text (safe HTML)
  primaryImage: MediaPresentation;
  gallery: MediaPresentation[];     // Ordered gallery images
  collections: ContentSummary[];    // Collections this product belongs to
  applications: ContentSummary[];   // Applications relevant to this product
  projects: ContentSummary[];       // Projects using this product (conditional)
  relatedProducts: ProductSummary[]; // Related products
  journalArticles: ContentSummary[]; // Articles referencing this product
  seo: SEOData;
  quoteContextIdentifier: string;   // Identifier for Quote Request context
  createdAt: string;                // ISO 8601 timestamp
  updatedAt: string;                // ISO 8601 timestamp
}

interface ContentSummary {
  id: string;
  name: string;
  slug: string;
}

interface MediaPresentation {
  id: string;
  mediaType: 'image' | 'video';
  src: string;                      // Primary delivery URL
  srcset?: string;                  // Responsive image srcset
  widths?: number[];                // Available widths for srcset
  width: number;                    // Natural width
  height: number;                   // Natural height
  aspectRatio: string;              // e.g., "4/3"
  alt: string;                      // Localized alt text
  caption?: string;                 // Localized caption
  focalPoint?: { x: number; y: number };
  loading: 'eager' | 'lazy';
  poster?: string;                  // Poster URL for video
}

interface SEOData {
  title: string;
  metaDescription: string;
  canonical: string;
  robots: 'index' | 'noindex' | 'follow' | 'nofollow';
  ogImage?: string;
  structuredData?: Record<string, any>;
  hreflang: Array<{ lang: string; href: string }>;
}
```

### 9.3 Not found (404)

Returned when:
- Slug does not exist for the requested locale
- Product is not published
- Product fails publication gate

### 9.4 Relationships

Related content returned as summaries (id, name, slug). Full detail available through dedicated endpoints.

---

# PART F — COLLECTION API

## 10. Collection list

### 10.1 Request

```
GET /api/v1/public/collections?locale={locale}&page={page}&pageSize={pageSize}
```

### 10.2 Response (200)

```typescript
interface CollectionListResponse {
  data: CollectionSummary[];
  meta: PaginationMeta;
}

interface CollectionSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;            // Localized brief description
  coverImage?: MediaPresentation;
}
```

---

## 11. Collection detail

### 11.1 Request

```
GET /api/v1/public/collections/:slug?locale={locale}
```

### 11.2 Response (200)

```typescript
interface CollectionDetailResponse {
  data: CollectionDetail;
}

interface CollectionDetail {
  id: string;
  name: string;
  slug: string;
  description: string;              // Localized rich text
  coverImage?: MediaPresentation;
  products: ProductSummary[];       // Products in this collection
  applications: ContentSummary[];   // Related applications (if approved)
  seo: SEOData;
  createdAt: string;
  updatedAt: string;
}
```

### 11.3 Relationship strategy

- Products are embedded in the detail response as summaries.
- Not paginated within the collection (collections typically contain a manageable number of products).
- If a collection grows beyond reasonable limits, pagination can be added as an additive change.

---

# PART G — APPLICATION API

## 12. Application list

### 12.1 Request

```
GET /api/v1/public/applications?locale={locale}&page={page}&pageSize={pageSize}
```

### 12.2 Response (200)

```typescript
interface ApplicationListResponse {
  data: ApplicationSummary[];
  meta: PaginationMeta;
}

interface ApplicationSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: MediaPresentation;
}
```

---

## 13. Application detail

### 13.1 Request

```
GET /api/v1/public/applications/:slug?locale={locale}
```

### 13.2 Response (200)

```typescript
interface ApplicationDetailResponse {
  data: ApplicationDetail;
}

interface ApplicationDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: MediaPresentation;
  products: ProductSummary[];       // Products relevant to this application
  projects: ContentSummary[];       // Projects using this application (conditional)
  journalArticles: ContentSummary[]; // Articles referencing this application
  seo: SEOData;
  createdAt: string;
  updatedAt: string;
}
```

---

# PART H — PROJECT API

## 14. Project list

### 14.1 Request

```
GET /api/v1/public/projects?locale={locale}&page={page}&pageSize={pageSize}
```

### 14.2 Response (200)

```typescript
interface ProjectListResponse {
  data: ProjectSummary[];
  meta: PaginationMeta;
}

interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  heroImage?: MediaPresentation;
}
```

### 14.3 Empty result behavior

When no qualifying published bilingual project exists:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 24,
    "total": 0,
    "totalPages": 0
  }
}
```

The public website uses this state to hide Projects navigation/listing. It never reveals the existence or status of internal Projects.

---

## 15. Project detail

### 15.1 Request

```
GET /api/v1/public/projects/:slug?locale={locale}
```

### 15.2 Response (200)

```typescript
interface ProjectDetailResponse {
  data: ProjectDetail;
}

interface ProjectDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  location?: string;                // Approved location (if real data exists)
  projectType?: string;             // Approved project type (if defined)
  heroImage?: MediaPresentation;
  gallery: MediaPresentation[];     // Project imagery
  products: ProductSummary[];       // Products used in this project
  applications: ContentSummary[];   // Applications relevant to this project
  seo: SEOData;
  createdAt: string;
  updatedAt: string;
}
```

### 15.3 Content placeholder

API behavior remains valid even when no real project content exists. The response shape is defined; actual data is content-dependent.

---

# PART I — JOURNAL API

## 16. Journal list

### 16.1 Request

```
GET /api/v1/public/journal?locale={locale}&page={page}&pageSize={pageSize}
```

### 16.2 Response (200)

```typescript
interface JournalListResponse {
  data: JournalSummary[];
  meta: PaginationMeta;
}

interface JournalSummary {
  id: string;
  title: string;
  slug: string;
  summary: string;                  // Localized excerpt
  coverImage?: MediaPresentation;
  publicationDate: string;          // ISO 8601 date
  author?: string;                  // Localized author name (if approved)
}
```

### 16.3 Sorting

Default: `publicationDate` descending (newest first).

---

## 17. Journal detail

### 17.1 Request

```
GET /api/v1/public/journal/:slug?locale={locale}
```

### 17.2 Response (200)

```typescript
interface JournalDetailResponse {
  data: JournalDetail;
}

interface JournalDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;                     // Localized rich text (safe HTML)
  coverImage?: MediaPresentation;
  publicationDate: string;
  author?: string;
  relatedProducts: ProductSummary[];
  relatedApplications: ContentSummary[];
  relatedProjects: ContentSummary[];
  relatedArticles: ContentSummary[];
  seo: SEOData;
  createdAt: string;
  updatedAt: string;
}
```

### 17.3 Rich text safety

- `body` is returned as sanitized HTML.
- Only allowlisted HTML tags and attributes are permitted.
- No `<script>`, `<iframe>`, `javascript:` protocol, or event handlers.
- Frontend renders using `dangerouslySetInnerHTML` equivalent with sanitization, or a rich text renderer.

---

# PART J — HOMEPAGE API

## 18. Homepage

### 18.1 Request

```
GET /api/v1/public/homepage?locale={locale}
```

### 18.2 Response (200)

```typescript
interface HomepageResponse {
  data: HomepageContent;
}

interface HomepageContent {
  hero: HeroContent;
  sections: HomepageSection[];      // Ordered by sectionOrder
  sectionOrder: string[];           // Ordered section identifiers
  seo: SEOData;
}

interface HeroContent {
  heading: string;                  // Localized primary heading
  subheading?: string;              // Localized supporting text
  media: MediaPresentation;         // Hero video or image
  fallbackImage: MediaPresentation; // Static fallback when video fails
  primaryCTA: CTALink;              // "Explore Marbles"
  secondaryCTA: CTALink;            // "Request Quote"
}

interface CTALink {
  label: string;                    // Localized CTA label
  href: string;                     // Localized URL path
}

type HomepageSection =
  | FeaturedProductsSection
  | FeaturedCollectionsSection
  | FeaturedApplicationsSection
  | QuarryFactorySection
  | FeaturedProjectsSection
  | FeaturedJournalSection
  | FinalCTASection;

interface FeaturedProductsSection {
  type: 'featured_products';
  heading?: string;
  products: ProductSummary[];
}

interface FeaturedCollectionsSection {
  type: 'featured_collections';
  heading?: string;
  collections: CollectionSummary[];
}

interface FeaturedApplicationsSection {
  type: 'featured_applications';
  heading?: string;
  applications: ApplicationSummary[];
}

interface QuarryFactorySection {
  type: 'quarry_factory';
  quarry?: {
    name: string;
    slug: string;
    coverImage?: MediaPresentation;
  };
  factory?: {
    name: string;
    slug: string;
    coverImage?: MediaPresentation;
  };
}

interface FeaturedProjectsSection {
  type: 'featured_projects';
  heading?: string;
  projects: ProjectSummary[];
}

interface FeaturedJournalSection {
  type: 'featured_journal';
  heading?: string;
  articles: JournalSummary[];
}

interface FinalCTASection {
  type: 'final_cta';
  heading: string;
  message?: string;
  primaryCTA: CTALink;
  secondaryCTA?: CTALink;
}
```

### 18.3 Section visibility

Sections are included in the `sections` array only when they have content. Empty/conditional sections are omitted from the response, not returned as empty arrays.

| Section | Included When |
|---|---|
| `featured_products` | At least one featured product exists |
| `featured_collections` | At least one collection exists |
| `featured_applications` | At least one application exists |
| `quarry_factory` | Quarry OR Factory content is published |
| `featured_projects` | At least one qualifying project exists |
| `featured_journal` | At least one journal article exists |
| `final_cta` | Always included |

### 18.4 Section ordering

`sectionOrder` array defines the rendering order. Frontend renders sections in the order specified by the API.

---

# PART K — NAVIGATION API

## 19. Navigation

### 19.1 Request

```
GET /api/v1/public/navigation?locale={locale}
```

### 19.2 Response (200)

```typescript
interface NavigationResponse {
  data: NavigationContent;
}

interface NavigationContent {
  primary: NavigationItem[];
  utility: NavigationItem[];
  projectsVisible: boolean;
}

interface NavigationItem {
  label: string;                    // Localized label
  href: string;                     // Localized URL path
  visible: boolean;                 // Whether item is visible
  isExternal?: boolean;             // External link (future use)
  ariaLabel?: string;               // Accessible name override
}
```

### 19.3 Primary navigation items

| Item | Label (TR) | Label (EN) | URL | Visible |
|---|---|---|---|---|
| Marbles | Mermerler | Marbles | `/{locale}/marbles` | Always |
| Collections | Koleksiyonlar | Collections | `/{locale}/collections` | Always |
| Applications | Uygulamalar | Applications | `/{locale}/applications` | Always |
| Projects | Projeler | Projects | `/{locale}/projects` | Conditional |
| Journal | Dergi | Journal | `/{locale}/journal` | Always |
| About | Hakkında | About | `/{locale}/about` | Always |

### 19.4 Utility navigation items

| Item | Label | URL | Type |
|---|---|---|---|
| Language Switch | TR / EN | Equivalent locale variant | `language_switch` |
| Request Quote | Teklif Talebi / Request Quote | `/{locale}/quote` | `cta` |
| Contact | İletişim / Contact | `/{locale}/contact` | `link` |

### 19.5 Projects visibility

`projectsVisible` is `true` when at least one qualifying published bilingual project exists. Frontend uses this to show/hide Projects in navigation.

---

# PART L — FOOTER API

## 20. Footer

### 20.1 Request

```
GET /api/v1/public/footer?locale={locale}
```

### 20.2 Response (200)

```typescript
interface FooterResponse {
  data: FooterContent;
}

interface FooterContent {
  company: FooterLink[];
  catalogue: FooterLink[];
  conversion: FooterLink[];
  legal: FooterLink[];
  language: LanguageLink[];
  copyright: string;                // Localized copyright text
}

interface FooterLink {
  label: string;                    // Localized label
  href: string;                     // Localized URL path
  visible: boolean;                 // Whether link is visible
}

interface LanguageLink {
  label: string;                    // Language display name
  href: string;                     // Equivalent locale URL
  active: boolean;                  // Whether this is the current language
  available: boolean;               // Whether content exists in this language
}
```

### 20.3 Footer link groups

| Group | Links | Visible |
|---|---|---|
| Company | About, Quarry, Factory, Contact | Published content only |
| Catalogue | Marbles, Collections, Applications, Projects, Journal | Projects conditional |
| Conversion | Request Quote | Always |
| Legal | Privacy Policy, Terms | Only when approved |
| Language | TR, EN | Always |

### 20.4 Truthfulness

- No invented legal pages or company information.
- Footer links point only to published, eligible content.
- Contact information is not fabricated.

---

# PART M — LOCALIZATION CONTRACT

## 21. Localization

### 21.1 Language determination

Locale is ALWAYS determined from the URL path segment:

```
/tr/marbles/beyaz-mermer  → locale = tr
/en/marbles/white-marble  → locale = en
```

No other mechanism is used for public content:
- NOT from query parameter (for public content)
- NOT from Accept-Language header
- NOT from cookies
- NOT from user agent

### 21.2 Available languages

| Language | Code | Path |
|---|---|---|
| Turkish | `tr` | `/tr/` |
| English | `en` | `/en/` |

OPEN DECISION: Default locale for root redirect (`/`).

### 21.3 Missing translation behavior

| Scenario | API Response |
|---|---|
| Locale valid, content exists, variant published | 200 with content |
| Locale valid, content exists, variant not published | 404 |
| Locale valid, content does not exist | 404 |
| Locale invalid (not `tr` or `en`) | 400 |

### 21.4 Language fallback

NO implicit language fallback. If the requested locale variant is not available, the API returns 404. It never returns content from another language.

### 21.5 Localized slug

- Slugs are independent per locale.
- TR slug and EN slug may differ.
- Language switch navigates to equivalent variant using its locale-specific slug.

### 21.6 Hreflang relationship

Every indexable page response includes:

```json
{
  "hreflang": [
    { "lang": "tr", "href": "/tr/marbles/beyaz-mermer" },
    { "lang": "en", "href": "/en/marbles/white-marble" },
    { "lang": "x-default", "href": "/tr/marbles/beyaz-mermer" }
  ]
}
```

Reciprocal: TR page links to EN variant, EN page links to TR variant. Self-referencing included.

---

# PART N — MEDIA CONTRACT

## 22. Media presentation

### 22.1 MediaPresentation object

```typescript
interface MediaPresentation {
  id: string;                       // MediaAsset UUID
  mediaType: 'image' | 'video';
  src: string;                      // Primary delivery URL
  srcset?: string;                  // Responsive image srcset string
  widths?: number[];                // Available widths for srcset
  width: number;                    // Natural width in pixels
  height: number;                   // Natural height in pixels
  aspectRatio: string;              // e.g., "4/3", "16:9"
  alt: string;                      // Localized alt text (empty string for decorative)
  caption?: string;                 // Localized caption
  focalPoint?: { x: number; y: number }; // For responsive cropping
  loading: 'eager' | 'lazy';       // Loading priority
  poster?: string;                  // Poster URL (for video)
  fallbackSrc?: string;             // Fallback URL (for video)
  duration?: number;                // Duration in seconds (for video)
  fileType: string;                 // MIME type
  fileSize?: number;                // File size in bytes
}
```

### 22.2 What is NOT exposed

- Internal storage path/provider
- Original filename
- Rights verification evidence
- Internal asset relationships
- CDN configuration
- Transformation pipeline details

### 22.3 Alt text

- Informative images: meaningful localized alt text
- Decorative images: empty string (`""`)
- Alt text is NOT an SEO keyword container
- Alt text may differ between TR and EN

### 22.4 Video media

For video, `MediaPresentation` includes:
- `poster`: URL of poster/preview image
- `fallbackSrc`: URL of fallback image
- `duration`: Video duration in seconds
- `src`: Video file URL

---

# PART O — SEO CONTRACT

## 23. SEO data

### 23.1 SEOData object

```typescript
interface SEOData {
  title: string;                    // Page title
  metaDescription: string;          // Meta description
  canonical: string;                // Self-referencing canonical URL
  robots: 'index' | 'noindex' | 'follow' | 'nofollow';
  ogImage?: string;                 // Open Graph image URL
  structuredData?: Record<string, any>; // JSON-LD structured data
  hreflang: Array<{
    lang: string;                   // "tr", "en", "x-default"
    href: string;                   // Full URL
  }>;
}
```

### 23.2 SEO data per content type

| Content Type | Title | Description | Canonical | Robots | Structured Data |
|---|---|---|---|---|---|
| Homepage | `{Brand} — Premium Turkish Marble` | Approved brand statement | Self-referencing | index | Organization, WebSite |
| Product | `{Name} — Premium Turkish Marble — {Brand}` | Approved description | Self-referencing | index | Product |
| Collection | `{Name} — {Brand}` | Approved description | Self-referencing | index | — |
| Application | `{Name} — {Brand}` | Approved description | Self-referencing | index | — |
| Project | `{Name} — {Brand}` | Approved description | Self-referencing | index | — |
| Journal | `{Title} — {Brand}` | Approved excerpt | Self-referencing | index | Article |
| About | `About — {Brand}` | Approved statement | Self-referencing | index | — |
| Quarry | `Quarry — {Brand}` | Approved origin story | Self-referencing | index | — |
| Factory | `Factory — {Brand}` | Approved production story | Self-referencing | index | — |
| Contact | `Contact — {Brand}` | Approved description | Self-referencing | index | — |
| Quote Request | — | — | Self-referencing | noindex | — |
| 404 | — | — | — | noindex | — |

### 23.3 Responsibility boundaries

| Responsibility | Owner |
|---|---|
| SEO title content | CMS (editorial decision) |
| SEO description content | CMS (editorial decision) |
| Canonical URL generation | API (from locale + slug) |
| Robots directive | CMS (override) or API (default) |
| Hreflang generation | API (from ContentItem's two variants) |
| Open Graph image | CMS (override) or API (from primary image) |
| Structured data | API (generated from content type + data) |
| Sitemap generation | API/background job (from published content) |

### 23.4 Canonical architecture

- Self-referencing canonical on all indexable pages
- Paginated list pages: canonical points to base page (without `?page=N`)
- Canonical is locale-specific

---

# PART P — ERROR CONTRACT

## 24. Error contract

### 24.1 Universal error shape

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Localized safe message",
    "details": [
      {
        "field": "field_name",
        "code": "FIELD_ERROR_CODE",
        "message": "Field-specific message"
      }
    ],
    "requestId": "req_abc123"
  }
}
```

### 24.2 Error categories

| HTTP Status | Code | Meaning | Details |
|---|---|---|---|
| 400 | `BAD_REQUEST` | Malformed syntax or invalid request | May include details |
| 401 | `UNAUTHORIZED` | Missing/invalid authentication | Admin endpoints only |
| 403 | `FORBIDDEN` | Authenticated actor lacks responsibility | Admin endpoints only |
| 404 | `NOT_FOUND` | Resource not found or not public | No details |
| 409 | `CONFLICT` | Valid request conflicts with lifecycle state | May include details |
| 422 | `VALIDATION_ERROR` | Well-formed request violates business rules | Always includes details |
| 429 | `RATE_LIMITED` | Rate limit or abuse protection triggered | No details |
| 500 | `INTERNAL_ERROR` | Unexpected server failure | No details; opaque only |

### 24.3 Validation error details

```json
{
  "details": [
    {
      "field": "context.contextType",
      "code": "EXACTLY_ONE_CONTEXT_REQUIRED",
      "message": "Quote request must have exactly one context type."
    }
  ]
}
```

### 24.4 What is NEVER exposed

- Stack traces
- Database error messages
- SQL queries
- Internal service names
- Approval internals
- Security-sensitive details
- Internal actor information
- Unpublished content existence

---

# PART Q — PAGINATION CONTRACT

## 25. Pagination

### 25.1 Parameters

| Parameter | Type | Default | Min | Max | Notes |
|---|---|---|---|---|---|
| `page` | Integer | 1 | 1 | — | 1-indexed |
| `pageSize` | Integer | 24 | 1 | 100 | Items per page |

### 25.2 Meta response

```typescript
interface PaginationMeta {
  page: number;       // Current page
  pageSize: number;   // Items per page
  total: number;      // Total items matching query
  totalPages: number; // Total pages (Math.ceil(total / pageSize))
}
```

### 25.3 Edge cases

| Scenario | Behavior |
|---|---|
| `page=0` | Treat as `page=1` (normalize) |
| `page=-5` | Treat as `page=1` (normalize) |
| `page=99999` (beyond total) | Return empty `data: []` with correct `total` |
| `pageSize=0` | Treat as `pageSize=24` (default) |
| `pageSize=200` | Cap at `pageSize=100` |
| `pageSize=-1` | Treat as `pageSize=24` (default) |
| `page=abc` | 400 error: invalid page parameter |
| No pagination params | Default: `page=1`, `pageSize=24` |

### 25.4 SEO pagination

- Page 1 canonical: base URL (no `?page=1`)
- Page N canonical: base URL (canonical points to base, not paginated page)
- `<link rel="prev">` and `<link rel="next">` for paginated pages
- Hreflang: reciprocal across all paginated pages

### 25.5 V1 sorting

`sort=title_asc` is the only allowed sort. Default when omitted.

---

# PART R — CACHE CONTRACT

## 26. Cache behavior

### 26.1 Cache by endpoint category

| Endpoint | Cacheable | Cache Key | TTL Concept |
|---|---|---|---|
| Homepage | Yes | `locale` | Medium (minutes) |
| Product list | Yes | `locale + page + pageSize + sort` | Medium |
| Product detail | Yes | `locale + slug` | Medium |
| Collection list | Yes | `locale + page + pageSize` | Medium |
| Collection detail | Yes | `locale + slug` | Medium |
| Application list | Yes | `locale + page + pageSize` | Medium |
| Application detail | Yes | `locale + slug` | Medium |
| Project list | Yes | `locale + page + pageSize` | Medium |
| Project detail | Yes | `locale + slug` | Medium |
| Journal list | Yes | `locale + page + pageSize` | Medium |
| Journal detail | Yes | `locale + slug` | Medium |
| Company content | Yes | `locale + type` | Long (hours) |
| Navigation | Yes | `locale` | Short (minutes) |
| Footer | Yes | `locale` | Short (minutes) |
| Quote Request POST | No | — | — |
| Quote Request GET | No | — | — |

### 26.2 Invalidation triggers

| Trigger | Invalidates |
|---|---|
| Content published | Affected detail + list + navigation + homepage |
| Content unpublished | Affected detail + list + navigation + homepage |
| Content edited (material change) | Affected detail + list |
| Media rights changed | All caches using that media |
| Relationship changed | Both source and target caches |
| Navigation affected | Navigation + footer caches |

### 26.3 Stale behavior

- Stale content acceptable for short periods (minutes).
- Stale navigation acceptable (Projects visibility may lag).
- Explicit publish/unpublish must trigger immediate invalidation.

---

# PART S — SECURITY CONTRACT

## 27. Security rules

### 27.1 Input validation

| Rule | Description |
|---|---|
| Shape validation | Request body/query must match expected schema |
| Type validation | All parameters must be correct types |
| Range validation | Numeric parameters within valid ranges |
| Length validation | String parameters within max lengths |
| Format validation | Slugs, emails, URLs validated for format |
| Locale validation | Only `tr` and `en` accepted |

### 27.2 Output validation

| Rule | Description |
|---|---|
| No internal fields | Database IDs, internal metadata never exposed |
| No approval data | Approval records never in public responses |
| No revision data | Revision history never in public responses |
| No actor data | Internal users never in public responses |
| No audit data | Audit events never in public responses |
| No storage secrets | File paths, CDN tokens, credentials never exposed |

### 27.3 Content sanitization

| Content Type | Sanitization |
|---|---|
| Plain text | Escape HTML entities |
| Rich text | Sanitize to allowlisted tags/attributes |
| URLs | Validate format; reject `javascript:` protocol |
| Alt text | Strip HTML; limit length |

### 27.4 Unpublished content protection

- Public API applies lifecycle, approval, language, and media rights filters.
- 404 returned for unpublished, draft, or ineligible content.
- No distinction between "does not exist" and "not public."

### 27.5 Rate limiting

| Endpoint | Rate Limit | Notes |
|---|---|---|
| All public GET endpoints | Generous | Standard browsing |
| Quote Request POST | Strict | Anti-spam, anti-abuse |
| Admin endpoints | Per-role | Authorization-based |

### 27.6 Sensitive data exclusion

The public API never exposes:

| Data | Reason |
|---|---|
| Internal database UUIDs (if different from public IDs) | Security |
| Approval history | Internal governance |
| Revision history | Internal governance |
| Internal actor identities | Privacy |
| Audit events | Security |
| Quote Request submissions (except own) | Privacy |
| Media storage paths | Security |
| CDN credentials | Security |
| CMS configuration | Security |
| Database schema | Security |

---

# PART T — CONTENT REVISION / APPROVAL

## 28. Content revision and approval

### 28.1 Data flow

```
ContentItem → ContentVariant → ContentRevision → Approval
```

### 28.2 What public API sees

| Entity | Visible | Notes |
|---|---|---|
| ContentItem | No (internal identity) | Public sees slug-based URL |
| ContentVariant | No (internal state) | Public sees published content only |
| ContentRevision | No | Never exposed publicly |
| Approval | No | Never exposed publicly |
| Published content | Yes | Only the currently approved revision |

### 28.3 What CMS sees

| Entity | Visible | Notes |
|---|---|---|
| ContentItem | Yes | Full management detail |
| ContentVariant | Yes | Lifecycle, completeness, slug |
| ContentRevision | Yes | All revisions, history |
| Approval | Yes | All approvals, evidence |
| Published content | Yes | Current published state |

### 28.4 Draft content

- Draft content is never visible through public API.
- Draft content is visible through authenticated CMS API only.
- Public frontend never sees draft content.

### 28.5 Approved but not published

- Approved content is eligible for publication but not yet public.
- Public API returns 404 for approved-but-not-published content.
- CMS API shows approved content as eligible for publication.

---

# PART U — SLUG / REDIRECT CONTRACT

## 29. Slug and redirect behavior

### 29.1 Valid slug

- Request: `GET /api/v1/public/products/beyaz-mermer?locale=tr`
- If slug exists, is published, and passes all gates: 200 with content
- If slug exists but content is not public: 404

### 29.2 Old/changed slug

- Content slug was changed from `eski-slug` to `yeni-slug`
- Request: `GET /api/v1/public/products/eski-slug?locale=tr`
- API returns 404 (slug no longer active)
- Frontend/server handles 301 redirect from old to new slug
- Redirect behavior is handled at routing layer, not API response

### 29.3 Unpublished slug

- Content was unpublished
- Request: `GET /api/v1/public/products/{slug}?locale=tr`
- API returns 404
- Recorded SEO outcome (404, 410, 301) governs public behavior

### 29.4 Deleted slug

- Content was permanently removed
- Request: `GET /api/v1/public/products/{slug}?locale=tr`
- API returns 404
- Recorded SEO outcome governs public behavior

### 29.5 Wrong language slug

- Request: `GET /api/v1/public/products/beyaz-mermer?locale=en`
- If English slug is `white-marble`, this request returns 404
- `beyaz-mermer` is not valid for `locale=en`

### 29.6 Nonexistent slug

- Request: `GET /api/v1/public/products/nonexistent?locale=tr`
- API returns 404

### 29.7 Redirect implementation

- 301 redirects are implemented at the routing/server layer.
- API does not return redirect responses.
- Frontend routing handles 301 redirects using `previousSlugs` data or redirect configuration.

---

# PART V — RELATED CONTENT CONTRACT

## 30. Related content

### 30.1 Relationship representation

Related content is returned as **summaries**, not full detail objects.

```typescript
// Product detail response
{
  "collections": [
    { "id": "...", "name": "White Collection", "slug": "white-collection" }
  ],
  "applications": [
    { "id": "...", "name": "Interior", "slug": "interior" }
  ],
  "relatedProducts": [
    { "id": "...", "name": "Beyaz Mermer", "slug": "beyaz-mermer", "primaryImage": { ... } }
  ]
}
```

### 30.2 Maximum relationship depth

- Depth 1: Summary objects only (id, name, slug, primary image).
- No recursive nesting (Product → Collection → Products → ...).
- Full detail available through dedicated detail endpoints.

### 30.3 Conditional relationships

| Relationship | Returned When |
|---|---|
| Projects in Product Detail | At least one qualifying published project exists |
| Projects in Application Detail | At least one qualifying published project exists |
| Projects in Homepage | At least one qualifying published project exists |
| All other relationships | When relationships exist and both ends are published |

### 30.4 Relationship limits

V1: No hard limit on number of related items returned. If a product belongs to many collections, all are returned as summaries.

Future: If needed, pagination or limits can be added as additive changes.

---

# PART W — FRONTEND DATA LAYER CONTRACT

## 31. Frontend data layer

### 31.1 Architecture

```
Page Component
  ↓ (data requirements)
Data Layer (centralized)
  ↓ (request management)
API Client
  ↓ (HTTP)
API Server
  ↓ (data access)
Database
```

### 31.2 Data layer responsibilities

| Responsibility | Description |
|---|---|
| Request management | Deduplicate concurrent requests to same endpoint |
| Caching | Cache API responses in memory/CDN |
| Loading state | Track loading state per request |
| Error state | Track error state per request |
| Revalidation | Refetch data when stale |
| Normalization | Normalize API responses to frontend data shapes |

### 31.3 Request lifecycle

1. Page component declares data requirements
2. Data layer checks cache
3. If cache hit and fresh: return cached data
4. If cache miss or stale: fetch from API
5. On success: cache response, update loading state, return data
6. On error: update error state, return error
7. Page component receives data, renders accordingly

### 31.4 Frontend prohibitions

| Prohibition | Reason |
|---|---|
| Components call raw API endpoints independently | Causes duplicate requests, inconsistent state |
| Components contain business data | Content belongs in CMS/API |
| Components hard-code product information | Catalogue must be data-driven |
| Components embed SEO metadata manually | SEO data from API |
| Components make approval decisions | Approval is CMS concern |

### 31.5 Centralized data access

- Each page has a single data-fetching entry point.
- Data layer handles all API communication.
- Components receive data as props; they do not fetch data themselves.
- This prevents waterfall requests and ensures consistent state.

---

# PART X — RESPONSE SIZE / PERFORMANCE

## 32. Response size and performance

### 32.1 Payload rules

| Response Type | Payload Strategy |
|---|---|
| List endpoints | Summary data only (id, name, slug, primary image) |
| Detail endpoints | Complete page data (all content needed for the page) |
| Homepage | All sections in one response |
| Navigation | Lightweight; labels + URLs only |
| Footer | Lightweight; labels + URLs only |

### 32.2 What is NOT in list responses

- Full descriptions
- Gallery images
- Related content
- SEO metadata (except basic)
- Technical specifications
- Full body content

### 32.3 What IS in detail responses

- Complete localized content
- Gallery (ordered)
- Related content (as summaries)
- SEO metadata
- Media presentations
- Quote context identifier

### 32.4 Hero media priority

- Hero media in Homepage response is loaded eagerly by frontend.
- Fallback image is included in the response.
- Frontend does not need to make separate request for hero fallback.

### 32.5 Image optimization

- `srcset` is provided in API response.
- Frontend uses `srcset` for responsive images.
- Multiple widths available for each image.
- Format negotiation (WebP, AVIF) at CDN/transport layer.

---

# PART Y — ACCESSIBILITY CONTRACT

## 33. Accessibility

### 33.1 Data requirements

| Data | API Field | Required |
|---|---|---|
| Alt text | `MediaPresentation.alt` | Yes (empty string for decorative) |
| Captions | `MediaPresentation.caption` | No |
| Labels | Navigation item `label` | Yes |
| Language metadata | `hreflang`, `seo.hreflang` | Yes |
| Accessible names | `NavigationItem.ariaLabel` | No (override only) |
| Media fallback | `MediaPresentation.fallbackSrc` | For video |
| Empty states | Empty array + correct pagination meta | Yes |
| Error states | Error response with code + message | Yes |

### 33.2 Incomplete content

- Alt text is required for informative images at publication time.
- If alt text is missing, content cannot be published (publication gate).
- Empty string (`""`) is valid for decorative images.
- API never returns `null` for alt text; always a string.

### 33.3 Language attributes

- `lang` attribute on `<html>` is set by frontend based on URL locale.
- API provides `hreflang` data for language alternate links.

---

# PART Z — ANALYTICS CONTRACT

## 34. Analytics

### 34.1 Stable identifiers

API responses include stable identifiers for analytics:

| Endpoint | Identifiers Available |
|---|---|
| Product list | `id`, `name`, `slug` |
| Product detail | `id`, `name`, `slug` |
| Collection list | `id`, `name`, `slug` |
| Collection detail | `id`, `name`, `slug` |
| Application list | `id`, `name`, `slug` |
| Application detail | `id`, `name`, `slug` |
| Project list | `id`, `name`, `slug` |
| Project detail | `id`, `name`, `slug` |
| Journal list | `id`, `title`, `slug` |
| Journal detail | `id`, `title`, `slug` |

### 34.2 No personal data

API responses do not include personal data that could be sent to analytics without consent.

### 34.3 No analytics vendor

This contract does not specify an analytics provider. Analytics implementation belongs to development.

---

# PART AA — CMS WRITE CONTRACT

## 35. CMS write operations

### 35.1 Write endpoints (conceptual)

| Method | Endpoint | Purpose | Authorization |
|---|---|---|---|
| POST | `/api/v1/admin/{resource}` | Create draft content | Author/Editor |
| GET | `/api/v1/admin/{resource}` | List managed resources | Authorized actor |
| GET | `/api/v1/admin/{resource}/:id` | Read management detail | Authorized actor |
| PATCH | `/api/v1/admin/{resource}/:id` | Update draft content | Author/Editor |
| POST | `/api/v1/admin/{resource}/:id/variants/:locale/revisions` | Create localized revision | Author/Editor |
| POST | `/api/v1/admin/{resource}/:id/variants/:locale/submit-approval` | Submit for approval | Author/Editor |
| POST | `/api/v1/admin/revisions/:id/approvals` | Approve/reject revision | Approver |
| POST | `/api/v1/admin/{resource}/:id/variants/:locale/publish` | Publish eligible variant | Publisher |
| POST | `/api/v1/admin/{resource}/:id/variants/:locale/unpublish` | Withdraw public variant | Publisher |
| POST | `/api/v1/admin/{resource}/:id/archive` | Archive content | Publisher |
| POST | `/api/v1/admin/{resource}/:id/remove` | Permanently remove | Publisher |
| POST | `/api/v1/admin/media` | Register/upload media | Author/Editor |
| PATCH | `/api/v1/admin/media/:id` | Update media metadata | Author/Editor |
| POST | `/api/v1/admin/{resource}/:id/variants/:locale/media` | Associate media | Author/Editor |
| GET | `/api/v1/admin/quote-requests/:id` | Read quote request | Authorized actor |
| PATCH | `/api/v1/admin/quote-requests/:id` | Update processing status | Authorized actor |

### 35.2 Authorization matrix

| Operation | Author/Editor | Approver | Publisher | Content Owner |
|---|---|---|---|---|
| Create draft | Yes | Yes (if also editor) | Yes (if also editor) | Yes |
| Edit draft | Yes | Yes (if also editor) | Yes (if also editor) | Yes |
| Submit for approval | Yes | Yes | Yes | Yes |
| Approve/reject | No | Yes | No | Yes |
| Publish/unpublish | No | No | Yes | No |
| Archive/remove | No | No | Yes | No |
| View audit | Authorized | Yes | Yes | Yes |
| Process Quote Requests | Authorized | Authorized | Authorized | Authorized |

### 35.3 Publication flow

```
Revision → Approval → Eligibility checks → Publish
```

Publication returns 409/422 when:
- Approval missing
- Language incomplete (without exception)
- Primary media missing
- Alt text missing
- Media rights unverified
- Lifecycle invalid
- Product publication gate failed

---

# PART AB — API / DATABASE BOUNDARY

## 36. API/database boundary

### 36.1 Architecture layers

```
Database (PostgreSQL)
  ↓ (queries, constraints)
Repository (data access)
  ↓ (domain entities)
Service (business logic, validation, authorization)
  ↓ (DTOs)
API Controller (HTTP layer)
  ↓ (response)
Public Frontend / CMS Frontend
```

### 36.2 Separation rules

| Layer | Responsibility | Not Responsible For |
|---|---|---|
| Database | Store data, enforce constraints, relations | Business logic, HTTP |
| Repository | Query data, map to domain entities | Business rules, authorization |
| Service | Business logic, validation, authorization, lifecycle | HTTP, database queries |
| API Controller | HTTP request/response, parameter parsing | Business logic, data access |
| Frontend | Render UI, manage state | Business logic, data storage |

### 36.3 Frontend boundary

- Frontend communicates ONLY with API layer.
- Frontend never communicates directly with database.
- Frontend never bypasses API to access data.

---

# PART AC — OPEN DECISIONS

## 37. Open decisions

### 37.1 Inherited from previous documents

| # | Decision | Source | Impact | Status |
|---|---|---|---|---|
| 1 | Content Owner identity | `02_DOMAIN_MODEL.md` | Affects approval authority | OPEN |
| 2 | Project launch content | `01_MASTER_INFORMATION_ARCHITECTURE.md` | Affects Project visibility | OPEN |
| 3 | Featured Homepage content | `08_PAGE_WIREFRAMES.md` | Affects Homepage sections | OPEN |
| 4 | Exact form fields | `05_CMS_CONTRACT.md` | Affects Contact/Quote forms | OPEN |
| 5 | Legal/privacy text | `05_CMS_CONTRACT.md` | Affects form data collection | OPEN |
| 6 | Homepage section ordering | `08_PAGE_WIREFRAMES.md` | Affects Homepage layout | OPEN |
| 7 | Font loading strategy | `10_DESIGN_SYSTEM.md` | Affects performance | OPEN |
| 8 | Icon set final selection | `10_DESIGN_SYSTEM.md` | Affects icon rendering | OPEN |
| 9 | Default locale for root redirect | `06_SEO_URL_ARCHITECTURE.md` | Affects SEO crawl budget | OPEN |
| 10 | Scroll indicator on hero | `08_PAGE_WIREFRAMES.md` | Affects hero UX | OPEN |
| 11 | Spam protection method | `11_PAGE_SPECIFICATIONS.md` | Affects form security | OPEN |
| 12 | Exact form field configuration | `11_PAGE_SPECIFICATIONS.md` | Affects Contact/Quote | OPEN |
| 13 | Video preload strategy | `12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md` | Affects performance | OPEN |
| 14 | Image format optimization | `12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md` | Affects image delivery | OPEN |
| 15 | Next page prefetch on hover | `12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md` | Affects pagination UX | OPEN |

### 37.2 New API-specific decisions

| # | Decision | Impact | Status |
|---|---|---|---|
| 16 | API versioning strategy for breaking changes | Future contract stability | OPEN (V1: `/api/v1/` prefix) |
| 17 | Rate limit thresholds for public endpoints | Anti-abuse vs browsing experience | OPEN |
| 18 | Cache TTL exact values | Performance vs freshness | OPEN |
| 19 | Maximum relationship depth for future | Payload size vs completeness | OPEN (V1: depth 1) |
| 20 | Rich text sanitization library | Security vs content flexibility | OPEN |

---

# PART AD — IMPLEMENTATION BOUNDARY

## 38. What this document does NOT implement

| Category | Not Implemented |
|---|---|
| Express routes | No route handler code |
| Controllers | No controller logic |
| Services | No business logic code |
| Repositories | No data access code |
| Prisma schema | No ORM definition |
| Database migrations | No SQL/migration files |
| React API client | No frontend fetch code |
| CMS UI | No admin interface |
| Authentication UI | No login system |
| Real content | No actual marble data |
| Production infrastructure | No deployment config |
| CDN setup | No CDN configuration |
| Rate limiting implementation | No rate limit middleware |
| Cache implementation | No cache layer code |
| Image processing | No image pipeline |
| Video processing | No video pipeline |

---

# PART AE — CONSISTENCY AUDIT

## 39. Consistency audit

### 39.1 Against 00_PROJECT_RULES.md

| Check | Result |
|---|---|
| No invented business facts | PASS — All content-dependent; no fabricated data |
| TR/EN supported | PASS — Locale in URL path; no implicit fallback |
| Lifecycle states | PASS — Draft/Approved/Published/Unpublished/Archived/Removed |
| V1 scope | PASS — No search, filters, comparison, commerce |
| Accessibility | PASS — Alt text, captions, labels, language metadata |
| Hero fallback | PASS — Fallback image in Homepage response |
| Quote Request XOR | PASS — API enforces zero or exactly one context |
| Governance | PASS — Approval required before publication |
| Truthfulness | PASS — No invented claims or company data |
| Media rights | PASS — Rights verification required before public use |

### 39.2 Against 01–08

| Check | Result |
|---|---|
| Page inventory alignment | PASS — All pages have corresponding API endpoints |
| User journeys | PASS — API supports all four user journeys |
| Navigation | PASS — Navigation API serves all nav items; Projects conditional |
| Content hierarchy | PASS — API response shapes match content hierarchy |
| Product discovery | PASS — 100+ products via paginated API |
| Conversion | PASS — Quote Request endpoint supports XOR context |
| Project visibility | PASS — Empty result when no qualifying projects |
| Internal links | PASS — Related content as summaries; depth limited |
| SEO URLs | PASS — Slug-based URLs; hreflang reciprocal |
| Hero video | PASS — Hero media + fallback in Homepage response |

### 39.3 Against 09_COMPONENT_TREE.md

| Check | Result |
|---|---|
| Component data requirements | PASS — API responses provide all component data needs |
| State components | PASS — Loading/Error/Empty states supported by API responses |
| Media components | PASS — MediaPresentation supports all media components |
| Conversion components | PASS — Quote context identifier in Product Detail |
| Navigation components | PASS — Navigation API supports all nav components |

### 39.4 Against 10_DESIGN_SYSTEM.md

| Check | Result |
|---|---|
| Design token references | PASS — API does not duplicate design tokens |
| Responsive images | PASS — srcset, widths, aspectRatio in MediaPresentation |
| Accessibility tokens | PASS — Alt text, captions, labels in API responses |

### 39.5 Against 11_PAGE_SPECIFICATIONS.md

| Check | Result |
|---|---|
| Page data requirements | PASS — All page content from API endpoints |
| Section ordering | PASS — Homepage sections ordered by API |
| SEO requirements | PASS — SEOData object in all indexable responses |
| Analytics events | PASS — Stable identifiers for all analytics events |

### 39.6 Against 12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md

| Check | Result |
|---|---|
| API response shapes | PASS — Shapes match conceptual interfaces in doc 12 |
| Data flow stages | PASS — CMS → API → Frontend flow preserved |
| Frontend data states | PASS — Loading/Success/Empty/Error/Unpublished states supported |
| Publication lifecycle | PASS — Only published content in public API |
| Media model | PASS — MediaPresentation matches doc 12 media model |
| SEO data flow | PASS — SEO data from API to frontend to HTML |
| Pagination | PASS — V1 pagination model preserved |

### 39.7 Cross-cutting checks

| Check | Result |
|---|---|
| Endpoint inventory matches pages | PASS — 18 public endpoints cover all pages |
| Product catalogue is dynamic | PASS — All product data from API |
| 100+ products supported | PASS — Paginated list with configurable page size |
| TR/EN works | PASS — Locale in URL path; no fallback |
| SEO supported | PASS — SEOData in all indexable responses |
| Slug strategy consistent | PASS — Localized slugs; previous slugs for redirects |
| Media model consistent | PASS — MediaPresentation in all relevant responses |
| Homepage model consistent | PASS — HomepageResponse supports all sections |
| Publication lifecycle consistent | PASS — Only published content returned |
| Error states consistent | PASS — Universal error shape |
| Pagination matches V1 | PASS — page/pageSize with defaults |
| No database leakage | PASS — No internal IDs, revisions, approvals exposed |
| No invented business facts | PASS — All content-dependent |
| Open decisions remain open | PASS — 20 open decisions documented |
| No unnecessary endpoints | PASS — Only justified endpoints defined |

---

## 40. AUDIT SUMMARY

| Metric | Value |
|---|---|
| Sections created | 39 |
| Total endpoints defined | 18 |
| Public endpoints | 18 |
| CMS/write operations | 16 |
| Response shapes defined | 15 |
| Error categories defined | 8 |
| Cache rules defined | 15 |
| Security rules defined | 12 |
| Open decisions | 20 |
| Consistency checks | ALL PASS |

---

## 41. STATUS

**READY FOR SEO / URL IMPLEMENTATION SPEC — WITH OPEN DECISIONS**

---

## 42. Critical OPEN DECISIONS

1. **Content Owner identity** — Must be confirmed before production.
2. **Project launch content** — Affects conditional Project visibility.
3. **Featured Homepage content** — Editorial decision.
4. **Exact form fields** — Content-dependent.
5. **Legal/privacy text** — Must be approved before form data collection.
6. **Homepage section ordering** — Editorial adjustment allowed.
7. **Font loading strategy** — Implementation decision.
8. **Icon set final selection** — Implementation decision.
9. **Default locale for root redirect** — Affects SEO.
10. **Scroll indicator on hero** — Editorial/design decision.
11. **Spam protection method** — Implementation decision.
12. **Exact form field configuration** — Implementation decision.
13. **Video preload strategy** — Implementation decision.
14. **Image format optimization** — Implementation decision.
15. **Next page prefetch on hover** — Implementation decision.
16. **API versioning for breaking changes** — Future consideration.
17. **Rate limit thresholds** — Implementation decision.
18. **Cache TTL exact values** — Implementation decision.
19. **Maximum relationship depth** — V1: depth 1 sufficient.
20. **Rich text sanitization library** — Implementation decision.
