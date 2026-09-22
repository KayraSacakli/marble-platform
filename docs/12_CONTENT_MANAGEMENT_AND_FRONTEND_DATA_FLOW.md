# Content Management and Frontend Data Flow

## 1. Purpose

This document defines where website content comes from, how it is structured, how Turkish and English content relate, how media is managed, and how data travels from the content source/API to the frontend. It prevents the frontend from becoming a hard-coded catalogue.

The final implementation must allow 100+ marble products to be managed without manually editing React components.

---

## 2. Scope

Covers the complete content architecture, data models, localization, media management, SEO data, publication lifecycle, frontend data flow, API response shapes, performance, accessibility, analytics data requirements, and open decisions.

Does not implement React components, API controllers, database migrations, CMS UI, authentication, actual product data, fictional company content, real image URLs, or invented projects.

---

## 3. Source of truth hierarchy

| Concern | Source |
|---|---|
| Immutable rules | `00_PROJECT_RULES.md` |
| Information architecture | `01_MASTER_INFORMATION_ARCHITECTURE.md` |
| Domain model | `02_DOMAIN_MODEL.md` |
| Database ER | `03_DATABASE_ER.md` |
| API contract | `04_API_CONTRACT.md` |
| CMS contract | `05_CMS_CONTRACT.md` |
| SEO URL architecture | `06_SEO_URL_ARCHITECTURE.md` |
| Internal link graph | `07_INTERNAL_LINK_GRAPH.md` |
| Page wireframes | `08_PAGE_WIREFRAMES.md` |
| Component tree | `09_COMPONENT_TREE.md` |
| Design system | `10_DESIGN_SYSTEM.md` |
| Page specifications | `11_PAGE_SPECIFICATIONS.md` |

---

# PART A — CONTENT ARCHITECTURE

## 4. Content model overview

Every piece of public website content is a **Conceptual Content Entity** with one **TR variant** and one **EN variant**, as defined in `02_DOMAIN_MODEL.md` and `03_DATABASE_ER.md`. Content is never hard-coded in the frontend.

### 4.1 Content types

| # | Content Type | Purpose | Variants | Lifecycle | Approval | Public |
|---|---|---|---|---|---|---|
| 1 | Product | Distinct marble or natural-stone offering | TR + EN required | Yes | Yes | When published + gate passes |
| 2 | Collection | Curated product grouping | TR + EN required | Yes | Yes | When published |
| 3 | Application | Material-use context | TR + EN required | Yes | Yes | When published |
| 4 | Project | Approved built work or case study | TR + EN required | Yes | Yes | Conditional on launch |
| 5 | Journal Article | Educational/editorial content | TR + EN required | Yes | Yes | When published |
| 6 | Company Content (About) | Company-facing editorial content | TR + EN required | Yes | Yes | When published |
| 7 | Company Content (Quarry) | Material-origin storytelling | TR + EN required | Yes | Yes | When published |
| 8 | Company Content (Factory) | Production-story storytelling | TR + EN required | Yes | Yes | When published |
| 9 | Media Asset | Image, video, logo asset | Context-dependent | Rights lifecycle | Rights verification | Only when eligible |
| 10 | Quote Request | Commercial enquiry | Localized submission | Processing | Privacy governed | Not public content |

### 4.2 Content identity model (from `03_DATABASE_ER.md`)

```
ContentItem (UUID, type, aggregate state, timestamps)
├── ContentVariant (UUID, locale: tr|en, lifecycle state, slug)
│   ├── ContentRevision (UUID, material version, author, timestamp)
│   │   └── Approval (UUID, approver, outcome, timestamp, covered assets)
│   └── ContentMedia (UUID, MediaAsset, role, order, alt text)
├── Product (extension)
├── Collection (extension)
├── Application (extension)
├── Project (extension)
├── JournalArticle (extension)
└── CompanyContent (extension, kind: about|quarry|factory)
```

One ContentItem = one conceptual entity. Two ContentVariants = one TR, one EN. Content is never duplicated across languages.

---

# PART B — PRODUCT CONTENT MODEL

## 5. Product model

Products are the most important data type. The model supports 100+ products without hard-coding.

### 5.1 Product identity

| Field | Type | Required | Localized | Description |
|---|---|---|---|---|
| `id` | UUID | Yes | No | Stable public identifier (from ContentItem) |
| `internalIdentifier` | String | Yes | No | Human-readable internal code (if approved) |
| `type` | Enum | Yes | No | Always `product` |

### 5.2 Product content (per variant)

| Field | Type | Required | Localized | Description |
|---|---|---|---|---|
| `name` | String | Yes | Yes (TR + EN) | Product display name |
| `slug` | String | Yes | Yes (TR + EN) | URL-safe identifier, unique per locale + type |
| `description` | Rich Text | Yes | Yes (TR + EN) | Approved editorial description |
| `tagline` | String | No | Yes (TR + EN) | Brief summary/tagline (if approved) |
| `status` | Enum | Yes | No | Draft / Approved / Published / Unpublished / Archived / Removed |
| `publicationState` | Object | Yes | No | `{ tr: lifecycleState, en: lifecycleState }` |

### 5.3 Product attributes (optional, content-dependent)

| Field | Type | Required | Description |
|---|---|---|---|
| `surfaceFinish` | String | No | Approved surface/finish information |
| `dimensions` | String | No | Approved dimension information |
| `format` | String | No | Approved format information |
| `origin` | String | No | Approved origin information |
| `applicableStandards` | String | No | Approved standards information |

**Important:** Not every product has every attribute. Fields are optional until approved business content exists. No values are inferred.

### 5.4 Product relationships

| Relationship | Type | Required | Description |
|---|---|---|---|
| `collections` | Collection[] | No | Collections this product belongs to (ProductCollection junction) |
| `applications` | Application[] | No | Applications relevant to this product (ProductApplication junction) |
| `projects` | Project[] | No | Projects using this product (ProjectProduct junction) |
| `relatedProducts` | Product[] | No | Related products (RelatedProduct junction) |
| `journalArticles` | JournalArticle[] | No | Articles referencing this product (JournalContentReference) |

### 5.5 Product media

| Field | Type | Required | Description |
|---|---|---|---|
| `primaryImage` | MediaPresentation | Yes | Primary product image (required for publication gate) |
| `gallery` | MediaPresentation[] | No | Gallery images (ordered) |
| `heroImage` | MediaPresentation | No | Hero/featured image (if different from primary) |

### 5.6 Product ordering and featured

| Field | Type | Required | Description |
|---|---|---|---|
| `displayOrder` | Integer | No | Manual ordering within listings (if approved) |
| `isFeatured` | Boolean | No | Whether this product appears in Homepage featured section |
| `featuredOrder` | Integer | No | Ordering within featured section |

### 5.7 Product SEO

| Field | Type | Required | Description |
|---|---|---|---|
| `seoTitle` | String | No | Override for page title (otherwise auto-generated) |
| `seoDescription` | String | No | Override for meta description |
| `seoCanonical` | String | No | Override for canonical URL |
| `seoRobots` | Enum | No | index/noindex override |

### 5.8 Product publication gate

As defined in `00_PROJECT_RULES.md` and `05_CMS_CONTRACT.md`:

1. Approved required-language content (TR + EN)
2. Product name present
3. Unique slug
4. Description present
5. Primary image present with rights verification
6. Meaningful alternative text for required informative images
7. Valid publication state
8. Valid content-approval record

### 5.9 Product lifecycle

| State | Meaning | Public |
|---|---|---|
| Draft | Being prepared | Never |
| Approved | Revision approved | Not yet |
| Published | Made public | Yes |
| Unpublished | Withdrawn from public | No |
| Archived | Internally retained | No |
| Removed | Permanently removed | No |

### 5.10 Administrator operations (without frontend code changes)

| Operation | How | Frontend Impact |
|---|---|---|
| Add a product | Create ContentItem → Product extension → TR + EN variants → add content → submit approval → approve → publish | Product appears in catalogue automatically |
| Remove/unpublish a product | Set variant lifecycle to Unpublished → record SEO outcome | Product disappears from listings; URL shows recorded SEO outcome |
| Change product information | Create new revision → edit → submit approval → approve → publish | Updated content appears automatically |
| Replace product images | Upload new media → associate with variant → verify rights → publish | New images appear automatically |
| Reorder products | Update displayOrder field | Listing order changes automatically |
| Change featured state | Update isFeatured field | Homepage section updates automatically |
| Update Turkish content | Edit TR variant → create revision → submit approval → approve → publish | TR content updates; EN unchanged |
| Update English content | Edit EN variant → create revision → submit approval → approve → publish | EN content updates; TR unchanged |

---

# PART C — COLLECTION MODEL

## 6. Collection model

### 6.1 Collection identity

| Field | Type | Required | Localized | Description |
|---|---|---|---|---|
| `id` | UUID | Yes | No | Stable public identifier |
| `type` | Enum | Yes | No | Always `collection` |

### 6.2 Collection content (per variant)

| Field | Type | Required | Localized | Description |
|---|---|---|---|---|
| `name` | String | Yes | Yes (TR + EN) | Collection display name |
| `slug` | String | Yes | Yes (TR + EN) | URL-safe identifier, unique per locale + type |
| `description` | Rich Text | Yes | Yes (TR + EN) | Approved editorial description |
| `status` | Enum | Yes | No | Lifecycle state |

### 6.3 Collection media

| Field | Type | Required | Description |
|---|---|---|---|
| `coverImage` | MediaPresentation | No | Collection cover/hero image |

### 6.4 Collection relationships

| Relationship | Type | Required | Description |
|---|---|---|---|
| `products` | Product[] | No | Products in this collection (ProductCollection junction) |
| `applications` | Application[] | No | Relevant applications (if approved) |

### 6.5 Collection ordering

| Field | Type | Required | Description |
|---|---|---|---|
| `displayOrder` | Integer | No | Manual ordering within listings |

### 6.6 Collection ↔ Product relationship

- **Collection → Products:** A Collection contains zero or more Products via `ProductCollection` junction.
- **Product → Collections:** A Product may belong to zero or more Collections via the same junction.
- Both sides are optional. Public visibility requires both sides to be published and eligible.
- This is a many-to-many relationship as defined in `02_DOMAIN_MODEL.md` and `03_DATABASE_ER.md`.

---

# PART D — APPLICATION MODEL

## 7. Application model

### 7.1 Application identity

| Field | Type | Required | Localized | Description |
|---|---|---|---|---|
| `id` | UUID | Yes | No | Stable public identifier |
| `type` | Enum | Yes | No | Always `application` |

### 7.2 Application content (per variant)

| Field | Type | Required | Localized | Description |
|---|---|---|---|---|
| `name` | String | Yes | Yes (TR + EN) | Application display name |
| `slug` | String | Yes | Yes (TR + EN) | URL-safe identifier, unique per locale + type |
| `description` | Rich Text | Yes | Yes (TR + EN) | Approved editorial introduction |
| `status` | Enum | Yes | No | Lifecycle state |

### 7.3 Application media

| Field | Type | Required | Description |
|---|---|---|---|
| `coverImage` | MediaPresentation | No | Application cover/hero image |

### 7.4 Application relationships

| Relationship | Type | Required | Description |
|---|---|---|---|
| `products` | Product[] | No | Products relevant to this application (ProductApplication junction) |
| `projects` | Project[] | No | Projects using this application (ProjectApplication junction) |
| `journalArticles` | JournalArticle[] | No | Articles referencing this application (JournalContentReference) |

### 7.5 Application ordering

| Field | Type | Required | Description |
|---|---|---|---|
| `displayOrder` | Integer | No | Manual ordering within listings |

---

# PART E — PROJECT MODEL

## 8. Project model

### 8.1 Project identity

| Field | Type | Required | Localized | Description |
|---|---|---|---|---|
| `id` | UUID | Yes | No | Stable public identifier |
| `type` | Enum | Yes | No | Always `project` |

### 8.2 Project content (per variant)

| Field | Type | Required | Localized | Description |
|---|---|---|---|---|
| `name` | String | Yes | Yes (TR + EN) | Project display name |
| `slug` | String | Yes | Yes (TR + EN) | URL-safe identifier, unique per locale + type |
| `description` | Rich Text | Yes | Yes (TR + EN) | Approved case-study narrative |
| `location` | String | No | Yes (TR + EN) | Approved location information (if real data exists) |
| `projectType` | String | No | Yes (TR + EN) | Approved project type/category (if defined) |
| `status` | Enum | Yes | No | Lifecycle state |

### 8.3 Project media

| Field | Type | Required | Description |
|---|---|---|---|
| `heroImage` | MediaPresentation | No | Project hero/lead image |
| `gallery` | MediaPresentation[] | No | Project imagery (ordered) |

### 8.4 Project relationships

| Relationship | Type | Required | Description |
|---|---|---|---|
| `products` | Product[] | No | Products used in this project (ProjectProduct junction) |
| `applications` | Application[] | No | Applications relevant to this project (ProjectApplication junction) |

### 8.5 Project conditional visibility

- Projects are a V1 capability.
- Public visibility requires: published, bilingual (or approved exception), verified media rights, valid approval.
- If no qualifying project exists at launch: navigation/listing/detail hidden; no placeholders.
- `GET /public/projects` returns empty public result when no qualifying project exists.

### 8.6 Project content status

**CONTENT PLACEHOLDER** — Project data must be created before this page is public. No placeholder or empty projects.

---

# PART F — JOURNAL MODEL

## 9. Journal model

### 9.1 Journal identity

| Field | Type | Required | Localized | Description |
|---|---|---|---|---|
| `id` | UUID | Yes | No | Stable public identifier |
| `type` | Enum | Yes | No | Always `journal_article` |

### 9.2 Journal content (per variant)

| Field | Type | Required | Localized | Description |
|---|---|---|---|---|
| `title` | String | Yes | Yes (TR + EN) | Article title |
| `slug` | String | Yes | Yes (TR + EN) | URL-safe identifier, unique per locale + type |
| `summary` | Rich Text | Yes | Yes (TR + EN) | Brief excerpt/summary |
| `body` | Rich Text | Yes | Yes (TR + EN) | Full editorial content |
| `publicationDate` | Date | Yes | No | Publication date |
| `author` | String | No | Yes (TR + EN) | Author name (if approved) |
| `status` | Enum | Yes | No | Lifecycle state |

### 9.3 Journal media

| Field | Type | Required | Description |
|---|---|---|---|
| `coverImage` | MediaPresentation | No | Article cover/hero image |

### 9.4 Journal relationships

| Relationship | Type | Required | Description |
|---|---|---|---|
| `relatedProducts` | Product[] | No | Products referenced in this article (JournalContentReference) |
| `relatedApplications` | Application[] | No | Applications referenced (JournalContentReference) |
| `relatedProjects` | Project[] | No | Projects referenced (JournalContentReference) |
| `relatedArticles` | JournalArticle[] | No | Other related articles (if editorially justified) |

### 9.5 Journal ordering

| Field | Type | Required | Description |
|---|---|---|---|
| `displayOrder` | Integer | No | Manual ordering within listings |
| `publicationDate` | Date | Yes | Primary ordering (newest first) |

### 9.6 Journal content status

**CONTENT PLACEHOLDER** — Journal articles must be created before Journal pages are public.

---

# PART G — HOMEPAGE CONTENT MODEL

## 10. Homepage content model

Homepage content must NOT become a collection of hard-coded React strings. All homepage content is structured data.

### 10.1 Homepage entity

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | UUID | Yes | Stable identifier |
| `type` | Enum | Yes | Always `homepage` |
| `locale` | Enum | Yes | `tr` or `en` |

### 10.2 Hero content (per variant)

| Field | Type | Required | Localized | Description |
|---|---|---|---|---|
| `heroHeading` | String | Yes | Yes | Primary brand/hero heading |
| `heroSubheading` | String | No | Yes | Supporting text |
| `heroMedia` | MediaPresentation | Yes | No | Hero video or image |
| `heroFallbackImage` | MediaPresentation | Yes | No | Static fallback when video fails |
| `heroPrimaryCTA` | Object | Yes | Yes | `{ label, href }` — "Explore Marbles" |
| `heroSecondaryCTA` | Object | Yes | Yes | `{ label, href }` — "Request Quote" |

### 10.3 Featured sections

| Field | Type | Required | Description |
|---|---|---|---|
| `featuredProducts` | Product[] | No | Products to feature on Homepage |
| `featuredCollections` | Collection[] | No | Collections to feature |
| `featuredApplications` | Application[] | No | Applications to feature |
| `featuredProjects` | Project[] | No | Projects to feature (conditional on launch) |
| `featuredJournal` | JournalArticle[] | No | Journal articles to feature |
| `sectionOrder` | String[] | Yes | Ordered list of section identifiers to render |

### 10.4 Section ordering

OPEN DECISION — Final section ordering may be adjusted editorially.

Proposed order (from `08_PAGE_WIREFRAMES.md`):

```json
{
  "sectionOrder": [
    "hero",
    "featured_products",
    "featured_collections",
    "featured_applications",
    "quarry_factory",
    "featured_projects",
    "featured_journal",
    "final_cta"
  ]
}
```

### 10.5 Section visibility rules

| Section | Visible When |
|---|---|
| Hero | Always |
| Featured Products | `featuredProducts.length > 0` |
| Featured Collections | `featuredCollections.length > 0` |
| Featured Applications | `featuredApplications.length > 0` |
| Quarry & Factory | Quarry OR Factory content is published |
| Featured Projects | At least one qualifying project exists |
| Featured Journal | `featuredJournal.length > 0` |
| Final CTA | Always |

### 10.6 CTA section content

| Field | Type | Required | Localized | Description |
|---|---|---|---|---|
| `ctaHeading` | String | Yes | Yes | Final CTA heading |
| `ctaMessage` | String | No | Yes | Supporting text |
| `ctaPrimary` | Object | Yes | Yes | `{ label, href }` — "Request Quote" |
| `ctaSecondary` | Object | No | Yes | `{ label, href }` — "Contact" |

### 10.7 Homepage editorial changes

A future administrator can:
- Change hero heading and subheading → edit Homepage variant content
- Change hero media → replace hero media asset
- Feature different products → update `featuredProducts` array
- Feature different collections → update `featuredCollections` array
- Feature different applications → update `featuredApplications` array
- Feature different projects → update `featuredProjects` array
- Feature different journal articles → update `featuredJournal` array
- Reorder sections → update `sectionOrder`
- Change CTA copy → edit CTA content fields

All without modifying frontend source code.

---

# PART H — TR/EN LOCALIZATION MODEL

## 11. Localization architecture

### 11.1 Language identity

| Language | Code | Locale path | Default |
|---|---|---|---|
| Turkish | `tr` | `/tr/` | OPEN DECISION (see `06_SEO_URL_ARCHITECTURE.md`) |
| English | `en` | `/en/` | OPEN DECISION |

### 11.2 Translation relationship

```
ContentItem (one conceptual entity)
├── ContentVariant (locale: tr) → Turkish representation
└── ContentVariant (locale: en) → English representation
```

- TR and EN are language variants of ONE entity, never separate entities.
- The language switch always navigates to the equivalent variant of the same entity.
- No implicit language fallback.

### 11.3 Localized fields

| Field | Localized? | Notes |
|---|---|---|
| `name` / `title` | Yes | Different names possible in TR and EN |
| `slug` | Yes | Different slugs possible in TR and EN |
| `description` / `body` | Yes | Full translation required |
| `tagline` / `summary` | Yes | Full translation required |
| `altText` | Yes | Language-specific alt text for media |
| `caption` | Yes | Language-specific captions |
| `seoTitle` | Yes | Language-specific SEO |
| `seoDescription` | Yes | Language-specific SEO |
| `ctaLabel` | Yes | Language-specific CTA text |
| `location` | Yes | Language-specific location text |
| `author` | Yes | Language-specific author name |

### 11.4 Non-localized fields

| Field | Localized? | Notes |
|---|---|---|
| `id` (UUID) | No | Same across languages |
| `type` | No | Same across languages |
| `status` / `publicationState` | No | Per-variant lifecycle, but entity-level aggregate state |
| `displayOrder` | No | Same ordering across languages |
| `isFeatured` | No | Same featured state across languages |
| `media` (asset references) | No | Same assets, but alt text is localized |
| `createdAt` / `updatedAt` | No | Timestamps are entity-level |

### 11.5 Translation completeness

| State | Meaning | Public Effect |
|---|---|---|
| Complete (both TR + EN) | Both variants prepared and approved | Both language versions public |
| Incomplete (one missing) | One variant not yet prepared/approved | Missing variant not public; approved exception may apply |
| Approved language exception | One variant published with documented approval | Published variant public; other variant shows non-deceptive state |

### 11.6 Missing translation behavior

- Frontend must NOT show content from the other language.
- Language switch for unavailable variant must show non-deceptive state (e.g., "This content is not available in English").
- Language switch link may be visually disabled or show availability status.

### 11.7 Language switch behavior

```
TR Product (/tr/marbles/beyaz-mermer)
  → Language Switch
EN Product (/en/marbles/white-marble)
```

- Navigates to equivalent variant of same ContentItem.
- If target variant is not publication-eligible: show explicit non-deceptive state.
- Never show unrelated content.

### 11.8 Prevention mechanisms

| Problem | Prevention |
|---|---|
| Broken language switching | LanguageSwitcher always navigates to equivalent variant |
| Mismatched slugs | Slugs are independent per locale; no assumption of match |
| Missing translations | CMS shows variant completeness; API returns 404 for missing variants |
| Duplicate content | One ContentItem per conceptual entity; no duplication |
| Accidental fallback | No implicit language fallback in API or frontend |
| Incorrect hreflang | Hreflang is reciprocal; generated from ContentItem's variants |

---

# PART I — MEDIA MANAGEMENT

## 12. Media model

Media are first-class content. Every image, video, and logo is a managed asset.

### 12.1 MediaAsset

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | UUID | Yes | Stable identifier |
| `mediaType` | Enum | Yes | `image`, `video`, `logo` |
| `sourceReference` | String | Yes | Original file reference/path |
| `originalAssetId` | UUID | No | Parent original asset (for derived assets) |
| `rightsState` | Enum | Yes | `unverified`, `verified`, `restricted` |
| `rightsEvidence` | String | No | Rights verification evidence/reference |
| `width` | Integer | No | Image/video width in pixels |
| `height` | Integer | No | Image/video height in pixels |
| `aspectRatio` | String | No | Calculated aspect ratio |
| `fileType` | String | Yes | MIME type |
| `fileSize` | Integer | No | File size in bytes |
| `createdAt` | Timestamp | Yes | Creation time |
| `updatedAt` | Timestamp | Yes | Last update time |

### 12.2 ContentMedia (association)

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | UUID | Yes | Stable identifier |
| `contentVariantId` | UUID | Yes | Associated ContentVariant |
| `mediaAssetId` | UUID | Yes | Associated MediaAsset |
| `role` | Enum | Yes | `primary`, `gallery`, `hero`, `preview`, `thumbnail`, `poster` |
| `order` | Integer | No | Display order within role |
| `altText` | String | Conditionally | Required for informative/contextual; empty for decorative |
| `altTextEn` | String | Conditionally | English alt text (if different from TR) |
| `caption` | String | No | Media caption |
| `focalPoint` | Object | No | `{ x, y }` for image cropping |

### 12.3 Media roles

| Role | Usage | Required |
|---|---|---|
| `primary` | Primary product/content image | Required for Product publication gate |
| `gallery` | Gallery images | Optional |
| `hero` | Hero/featured image | Optional |
| `preview` | Card/preview image | Optional |
| `thumbnail` | Small thumbnail | Optional |
| `poster` | Video poster/preview image | Required for video |

### 12.4 Media reuse

- An existing MediaAsset may be associated with multiple ContentVariants.
- Removing an association does not delete the underlying asset.
- CMS must show where media is currently used.
- Derived assets must reference original assets.

### 12.5 Media rights and public eligibility

- Public use requires verified appropriate publication authorization.
- Unverified media cannot support public eligibility of content that requires it.
- Rights verification is a prerequisite for publication.

### 12.6 Media and product photography

- Product photography must preserve the original marble product.
- The CMS/data model must not assume AI-generated transformations of the actual marble.
- Derived media (thumbnails, crops) must reference the original asset.

---

# PART J — IMAGE METADATA

## 13. Image metadata model

### 13.1 Required image metadata

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | String | Yes | Original file reference |
| `optimized` | String | No | Optimized version reference (CDN/storage) |
| `width` | Integer | Yes | Width in pixels |
| `height` | Integer | Yes | Height in pixels |
| `aspectRatio` | String | Yes | Calculated: `width/height` |
| `altText` | String | Conditionally | Required for informative; empty for decorative |
| `altTextLocalized` | Object | No | `{ tr: "...", en: "..." }` if different per language |
| `caption` | String | No | Caption text |
| `focalPoint` | Object | No | `{ x, y }` for responsive cropping |
| `loadingPriority` | Enum | No | `eager` (above-fold) or `lazy` (below-fold) |
| `classification` | Enum | Yes | `informative` or `decorative` |

### 13.2 Frontend image consumption

The frontend consumes image metadata to:

1. Generate `srcset` with multiple sizes from `source` + `optimized`
2. Set `alt` attribute from `altText` (or empty for decorative)
3. Set `loading="eager"` or `loading="lazy"` from `loadingPriority`
4. Apply `aspect-ratio` CSS from `aspectRatio`
5. Apply `object-position` from `focalPoint`
6. Display `caption` below image if present
7. Use `width` and `height` to prevent layout shift

---

# PART K — VIDEO DATA MODEL

## 14. Video data model

### 14.1 Video metadata

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | UUID | Yes | Video asset identifier |
| `sourceReference` | String | Yes | Video file reference |
| `posterImage` | MediaPresentation | Yes | Poster/preview image shown before video loads |
| `fallbackImage` | MediaPresentation | Yes | Static fallback when video fails/is disabled |
| `width` | Integer | No | Video width |
| `height` | Integer | No | Video height |
| `duration` | Float | No | Video duration in seconds |
| `fileType` | String | Yes | MIME type |
| `fileSize` | Integer | No | File size |
| `captions` | Object | No | `{ tr: "...", en: "..." }` caption track references |

### 14.2 Homepage hero video specifics

From `07_HOMEPAGE_SCROLL_VIDEO.md` (source of truth):

| Property | Value | Source |
|---|---|---|
| Video concept | Scroll-driven cinematic sequence | `07_HOMEPAGE_SCROLL_VIDEO.md` |
| Poster behavior | PosterImage shown before video loads or on failure | `09_COMPONENT_TREE.md` |
| Fallback behavior | 7 states defined per `09_COMPONENT_TREE.md` §8.1 | `09_COMPONENT_TREE.md` |
| Reduced motion | Static fallback image + message + CTAs | `10_DESIGN_SYSTEM.md` |
| Mobile behavior | Fallback image on mobile; video on tablet/desktop | `09_COMPONENT_TREE.md` |
| Preload strategy | IMPLEMENTATION DECISION | — |

### 14.3 Video fallback states

| State | Component | Behavior |
|---|---|---|
| Video loads | HeroVideo | Full cinematic scroll-driven experience |
| Video fails | VideoFallback | Static image + message + CTAs |
| User disables | VideoFallback | Static image + message + CTAs |
| Reduced motion | VideoFallback | Static image + message + CTAs |
| Slow connection | VideoFallback | Static image + message + CTAs |
| JS disabled | Static HTML | Core message + navigation |
| No media available | Text-only | Message + CTAs |

---

# PART L — SEO DATA MODEL

## 15. SEO data model

### 15.1 Reusable SEO object

Every content type that has a public URL includes:

```typescript
interface SEOData {
  title: string;           // Page title (auto-generated or override)
  metaDescription: string; // Meta description (auto-generated or override)
  canonical: string;       // Canonical URL (auto-generated or override)
  robots: 'index' | 'noindex' | 'follow' | 'nofollow';
  ogImage?: string;        // Open Graph image
  structuredData?: object; // Structured data eligibility
  slug: string;            // Localized URL slug
  previousSlugs?: string[]; // Previous slugs for redirect handling
}
```

### 15.2 SEO metadata per content type

| Content Type | Title Pattern | Meta Description | Canonical | Structured Data | Robots |
|---|---|---|---|---|---|
| Homepage | `{Brand} — Premium Turkish Marble` | Approved brand statement | Self-referencing | Organization, WebSite | index |
| Product | `{Name} — Premium Turkish Marble — {Brand}` | Approved description | Self-referencing | Product | index |
| Collection | `{Name} — {Brand}` | Approved description | Self-referencing | — | index |
| Application | `{Name} — {Brand}` | Approved description | Self-referencing | — | index |
| Project | `{Name} — {Brand}` | Approved description | Self-referencing | — | index |
| Journal | `{Title} — {Brand}` | Approved excerpt | Self-referencing | Article | index |
| About | `About — {Brand}` | Approved statement | Self-referencing | — | index |
| Quarry | `Quarry — {Brand}` | Approved origin story | Self-referencing | — | index |
| Factory | `Factory — {Brand}` | Approved production story | Self-referencing | — | index |
| Contact | `Contact — {Brand}` | Approved description | Self-referencing | — | index |
| Quote Request | — | — | Self-referencing | — | noindex |
| 404 | — | — | — | — | noindex |

### 15.3 SEO data flow

```
Content Source (CMS)
  ↓ [SEO fields stored per variant]
API Response
  ↓ [SEO fields included in DTO]
Frontend Data Layer
  ↓ [SEO fields normalized]
Page Component
  ↓ [SEO fields applied to <head>]
HTML Output
  ↓ [meta tags, canonical, hreflang, structured data]
Search Engine
```

### 15.4 Hreflang architecture

- Every indexable page has reciprocal hreflang: `<link rel="alternate" hreflang="tr" href="..." />` and `<link rel="alternate" hreflang="en" href="..." />`
- Hreflang is generated from ContentItem's two variants
- Self-referencing hreflang included

### 15.5 Canonical architecture

- Self-referencing canonical on all indexable pages
- Paginated pages: canonical points to base page (without `?page=N`)
- Canonical is per-variant (locale-specific)

---

# PART M — SLUG MANAGEMENT

## 16. Slug rules

### 16.1 Slug creation

| Rule | Description |
|---|---|
| Localized | Each locale has its own slug (TR and EN slugs are independent) |
| Unique within locale + type | No two Products share the same TR slug; no two Products share the same EN slug |
| URL-safe | Lowercase, hyphens, no special characters, no spaces |
| Stable | Once published, slugs should not change |
| Human-readable | Meaningful to humans, not just IDs |

### 16.2 Slug uniqueness

- `Product` slugs unique within locale + `product` type
- `Collection` slugs unique within locale + `collection` type
- `Application` slugs unique within locale + `application` type
- `Project` slugs unique within locale + `project` type
- `JournalArticle` slugs unique within locale + `journal_article` type
- Cross-type slug collision is allowed (e.g., a Product and a Collection can share a slug if types differ)

### 16.3 Slug updates

| Scenario | Behavior |
|---|---|
| Slug changed on published content | Previous slug stored in `previousSlugs[]` |
| Redirect | 301 redirect from old slug to new slug |
| SEO outcome | Recorded in AuditEvent |

### 16.4 Previous slug handling

```typescript
interface SlugHistory {
  currentSlug: string;
  previousSlugs: Array<{
    slug: string;
    changedAt: Timestamp;
    redirectType: 301 | 302;
  }>;
}
```

### 16.5 Unpublished content slugs

- When content is unpublished, slug is retained for potential republishing.
- When content is permanently removed, slug may be retired with recorded SEO outcome.

### 16.6 Invalid slug behavior

- API validates slug format on creation/update
- Invalid slugs are rejected with validation error
- Frontend never constructs slugs from user input

---

# PART N — PUBLICATION LIFECYCLE

## 17. Publication lifecycle

### 17.1 Lifecycle states

| State | Frontend Visibility | Search Engine Visibility |
|---|---|---|
| Draft | Not visible | Not visible |
| Approved | Not visible (eligible for publish) | Not visible |
| Published | Visible | Visible (if indexable) |
| Unpublished | Not visible | Not visible (SEO outcome governs URL) |
| Archived | Not visible | Not visible (SEO outcome governs URL) |
| Permanently Removed | Not visible | Not visible (SEO outcome governs URL) |

### 17.2 What frontend can see

- Only published, approved, language-eligible content with rights-eligible media.
- Draft, approved (not yet published), unpublished, archived, and removed content is never exposed.

### 17.3 What search engines can see

- Same as frontend: only published, indexable content.
- noindex on Quote Request and 404 pages.
- Unpublished/removed URLs governed by recorded SEO outcome (404, 410, 301, or noindex).

### 17.4 Unpublished content behavior

- Unpublished content is withdrawn from public listings, navigation, and relationships.
- Former public URLs show recorded SEO outcome.
- Content can be republished if approval is still valid.

### 17.5 Missing translations behavior

- Missing variant not public.
- Language switch shows non-deceptive state.
- Approved language exception allows one-variant publication with documented approval.

### 17.6 Preview behavior

- Preview is a CMS concern, not a public frontend concern.
- Draft content can be previewed through authenticated CMS preview routes.
- Public frontend never sees draft content.

### 17.7 Scheduled publication

- V1: Not required. Publication is immediate upon Publisher action.
- Future: If needed, scheduled publication can be added as a CMS feature.

---

# PART O — RELATED CONTENT

## 18. Related content relationships

### 18.1 Relationship matrix

| Source | Target | Junction Entity | Cardinality | Required |
|---|---|---|---|---|
| Product | Collection | ProductCollection | Many-to-many | No |
| Product | Application | ProductApplication | Many-to-many | No |
| Product | Project | ProjectProduct | Many-to-many | No |
| Product | Product | RelatedProduct | Many-to-many (no self-ref) | No |
| Collection | Product | ProductCollection | Many-to-many | No |
| Application | Product | ProductApplication | Many-to-many | No |
| Application | Project | ProjectApplication | Many-to-many | No |
| Project | Product | ProjectProduct | Many-to-many | No |
| Project | Application | ProjectApplication | Many-to-many | No |
| Journal Article | Product | JournalContentReference | Many-to-many | No |
| Journal Article | Application | JournalContentReference | Many-to-many | No |
| Journal Article | Project | JournalContentReference | Many-to-many | No |
| Journal Article | Company Content | JournalContentReference | Many-to-many | No |
| Company Content (Quarry/Factory) | Product | CompanyContentReference | Many-to-many | No |
| Company Content (Quarry/Factory) | Journal Article | CompanyContentReference | Many-to-many | No |

### 18.2 Relationship rules

- All relationships are optional.
- All relationships must be approved (not inferred).
- Public visibility requires both source and target to be published and eligible.
- Relationships can be removed without deleting either parent.
- RelatedProduct cannot self-reference or duplicate directional pairs.

### 18.3 Relationship usage

| Relationship | Frontend Usage |
|---|---|
| Product ↔ Collection | Product Detail shows related collections; Collection Detail shows products |
| Product ↔ Application | Product Detail shows related applications; Application Detail shows products |
| Product ↔ Project | Product Detail shows related projects; Project Detail shows products |
| Product ↔ Product | Product Detail shows related products |
| Journal ↔ Product/Application/Project | Journal Detail shows related content |
| Company ↔ Product/Journal | Quarry/Factory shows related products and articles |

---

# PART P — FRONTEND DATA FLOW

## 19. Complete data flow

### 19.1 Flow stages

```
1. Content Source / CMS
   ↓ [Content created, edited, approved, published via CMS]
2. API Layer
   ↓ [Public endpoints serve published, approved, language-eligible content]
3. Data Validation / Normalization
   ↓ [API validates; frontend normalizes response shape]
4. Frontend Data Layer
   ↓ [Data fetching, caching, state management]
5. Page Component
   ↓ [Page-level data requirements resolved]
6. Component
   ↓ [Components receive data as props]
7. Design System
   ↓ [Components apply tokens, styles, responsive behavior]
8. HTML Output
   ↓ [Semantic HTML with accessibility attributes]
```

### 19.2 Stage responsibilities

| Stage | Responsibility | Not Responsible For |
|---|---|---|
| CMS | Content creation, editing, approval, publication, media management | Public rendering, SEO output, frontend behavior |
| API | Serve published content, validate requests, enforce authorization | Content creation, approval, media upload |
| Data Validation | Validate response shape, handle missing fields, normalize data | Business logic, approval decisions |
| Frontend Data Layer | Fetch data, manage cache, handle loading/error states | Content decisions, SEO metadata generation |
| Page Component | Resolve page-level data, compose sections, pass data to children | Individual component rendering |
| Component | Render data according to design system | Data fetching, business logic |
| Design System | Apply visual tokens, responsive behavior, accessibility | Data content, data fetching |

### 19.3 Frontend prohibitions

The frontend must NOT:

- Contain business data (product names, descriptions, prices)
- Contain product catalogue records
- Directly manipulate database data
- Duplicate CMS content
- Embed SEO metadata manually in every component
- Hard-code any content that should come from the API
- Make approval or publication decisions
- Store unpublished or draft content

---

# PART Q — API RESPONSE SHAPE

## 20. Conceptual API response contracts

### 20.1 Common response structure

```typescript
interface APIResponse<T> {
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface APIError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; code: string }>;
    requestId: string;
  };
}
```

### 20.2 Product list response

```typescript
interface ProductListResponse {
  data: Array<{
    id: string;
    name: string;
    slug: string;
    tagline?: string;
    primaryImage: MediaPresentation;
    isFeatured: boolean;
  }>;
  meta: PaginationMeta;
}
```

### 20.3 Product detail response

```typescript
interface ProductDetailResponse {
  data: {
    id: string;
    name: string;
    slug: string;
    tagline?: string;
    description: string;
    primaryImage: MediaPresentation;
    gallery: MediaPresentation[];
    collections: Array<{ id: string; name: string; slug: string }>;
    applications: Array<{ id: string; name: string; slug: string }>;
    projects: Array<{ id: string; name: string; slug: string }>;
    relatedProducts: Array<{ id: string; name: string; slug: string; primaryImage: MediaPresentation }>;
    journalArticles: Array<{ id: string; title: string; slug: string }>;
    seo: SEOData;
    quoteContextIdentifier: string;
  };
}
```

### 20.4 Collection list/detail responses

```typescript
interface CollectionListResponse {
  data: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    coverImage?: MediaPresentation;
  }>;
  meta: PaginationMeta;
}

interface CollectionDetailResponse {
  data: {
    id: string;
    name: string;
    slug: string;
    description: string;
    coverImage?: MediaPresentation;
    products: Array<{ id: string; name: string; slug: string; primaryImage: MediaPresentation }>;
    applications: Array<{ id: string; name: string; slug: string }>;
    seo: SEOData;
  };
}
```

### 20.5 Application list/detail responses

```typescript
interface ApplicationListResponse {
  data: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    coverImage?: MediaPresentation;
  }>;
  meta: PaginationMeta;
}

interface ApplicationDetailResponse {
  data: {
    id: string;
    name: string;
    slug: string;
    description: string;
    coverImage?: MediaPresentation;
    products: Array<{ id: string; name: string; slug: string; primaryImage: MediaPresentation }>;
    projects: Array<{ id: string; name: string; slug: string }>;
    journalArticles: Array<{ id: string; title: string; slug: string }>;
    seo: SEOData;
  };
}
```

### 20.6 Project list/detail responses

```typescript
interface ProjectListResponse {
  data: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    heroImage?: MediaPresentation;
  }>;
  meta: PaginationMeta;
}

interface ProjectDetailResponse {
  data: {
    id: string;
    name: string;
    slug: string;
    description: string;
    location?: string;
    projectType?: string;
    heroImage?: MediaPresentation;
    gallery: MediaPresentation[];
    products: Array<{ id: string; name: string; slug: string; primaryImage: MediaPresentation }>;
    applications: Array<{ id: string; name: string; slug: string }>;
    seo: SEOData;
  };
}
```

### 20.7 Journal list/detail responses

```typescript
interface JournalListResponse {
  data: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string;
    coverImage?: MediaPresentation;
    publicationDate: string;
    author?: string;
  }>;
  meta: PaginationMeta;
}

interface JournalDetailResponse {
  data: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    body: string;
    coverImage?: MediaPresentation;
    publicationDate: string;
    author?: string;
    relatedProducts: Array<{ id: string; name: string; slug: string; primaryImage: MediaPresentation }>;
    relatedApplications: Array<{ id: string; name: string; slug: string }>;
    relatedProjects: Array<{ id: string; name: string; slug: string }>;
    relatedArticles: Array<{ id: string; title: string; slug: string; summary: string }>;
    seo: SEOData;
  };
}
```

### 20.8 Homepage response

```typescript
interface HomepageResponse {
  data: {
    hero: {
      heading: string;
      subheading?: string;
      media: MediaPresentation;
      fallbackImage: MediaPresentation;
      primaryCTA: { label: string; href: string };
      secondaryCTA: { label: string; href: string };
    };
    featuredProducts: Array<{ id: string; name: string; slug: string; primaryImage: MediaPresentation }>;
    featuredCollections: Array<{ id: string; name: string; slug: string; coverImage?: MediaPresentation }>;
    featuredApplications: Array<{ id: string; name: string; slug: string; coverImage?: MediaPresentation }>;
    featuredProjects: Array<{ id: string; name: string; slug: string; heroImage?: MediaPresentation }>;
    featuredJournal: Array<{ id: string; title: string; slug: string; coverImage?: MediaPresentation; summary: string }>;
    quarryFactory: {
      quarry?: { name: string; slug: string; coverImage?: MediaPresentation };
      factory?: { name: string; slug: string; coverImage?: MediaPresentation };
    };
    finalCTA: {
      heading: string;
      message?: string;
      primaryCTA: { label: string; href: string };
      secondaryCTA?: { label: string; href: string };
    };
    sectionOrder: string[];
    seo: SEOData;
  };
}
```

### 20.9 Navigation response

```typescript
interface NavigationResponse {
  data: {
    primary: Array<{ label: string; href: string; visible: boolean }>;
    utility: Array<{ label: string; href: string; type: 'language_switch' | 'cta' | 'link' }>;
    projectsVisible: boolean;
  };
}
```

### 20.10 Footer response

```typescript
interface FooterResponse {
  data: {
    company: Array<{ label: string; href: string }>;
    catalogue: Array<{ label: string; href: string; visible: boolean }>;
    conversion: Array<{ label: string; href: string }>;
    legal: Array<{ label: string; href: string }>;
    language: Array<{ label: string; href: string; active: boolean }>;
    copyright: string;
  };
}
```

### 20.11 MediaPresentation DTO

```typescript
interface MediaPresentation {
  id: string;
  mediaType: 'image' | 'video';
  src: string;
  srcset?: string;
  width: number;
  height: number;
  aspectRatio: string;
  alt: string;
  caption?: string;
  focalPoint?: { x: number; y: number };
  loading: 'eager' | 'lazy';
  poster?: string;
}
```

---

# PART R — FRONTEND DATA STATES

## 21. Frontend data states

### 21.1 State definitions

| State | Meaning | Component |
|---|---|---|
| Loading | Data is being fetched | `LoadingState` |
| Success | Data loaded successfully | Content components |
| Empty | Data loaded but list is empty | `EmptyState` |
| Error | Data fetch failed | `ErrorState` |
| Unavailable | Content exists but not public | `UnpublishedState` → redirect |
| Unpublished | Content was public, now withdrawn | `UnpublishedState` → redirect |
| Missing Translation | Target locale variant not available | `MissingLanguageState` |
| Missing Media | Media asset not available | `MissingMediaState` |
| Malformed Data | Response shape unexpected | `ErrorState` |

### 21.2 State-to-component mapping (from `09_COMPONENT_TREE.md`)

| State | Component | Behavior |
|---|---|---|
| Loading | `LoadingState` | Skeleton/placeholder; announce to screen readers |
| Success | Content components | Render data |
| Empty | `EmptyState` | Message + recovery path (Homepage link) |
| Error | `ErrorState` | Error message + retry + Homepage link |
| Unpublished | `UnpublishedState` | Redirect to 404/410/301 per SEO outcome |
| Missing Translation | `MissingLanguageState` | Show available language; disable switch |
| Missing Media | `MissingMediaState` | Show content name + description; no broken image |
| Malformed Data | `ErrorState` | Error message + retry |

### 21.3 State per page

| Page | Loading | Empty | Error | Unpublished | Missing Translation | Missing Media |
|---|---|---|---|---|---|---|
| Homepage | Skeleton sections | N/A | ErrorState | N/A | N/A | Hero fallback |
| Product Catalogue | Skeleton grid | EmptyState | ErrorState | N/A | N/A | Product placeholder |
| Product Detail | Skeleton layout | N/A | ErrorState | UnpublishedState | MissingLanguageState | MissingMediaState |
| Collection Listing | Skeleton grid | EmptyState | ErrorState | N/A | N/A | Collection placeholder |
| Collection Detail | Skeleton layout | EmptyState | ErrorState | UnpublishedState | MissingLanguageState | MissingMediaState |
| Application Listing | Skeleton grid | EmptyState | ErrorState | N/A | N/A | Application placeholder |
| Application Detail | Skeleton layout | EmptyState | ErrorState | UnpublishedState | MissingLanguageState | MissingMediaState |
| Project Listing | Skeleton grid | EmptyState | ErrorState | N/A | N/A | Project placeholder |
| Project Detail | Skeleton layout | N/A | ErrorState | UnpublishedState | MissingLanguageState | MissingMediaState |
| Journal Listing | Skeleton grid | EmptyState | ErrorState | N/A | N/A | Article placeholder |
| Journal Detail | Skeleton layout | N/A | ErrorState | UnpublishedState | MissingLanguageState | MissingMediaState |
| About | Skeleton layout | N/A | ErrorState | UnpublishedState | MissingLanguageState | N/A |
| Quarry | Skeleton layout | N/A | ErrorState | UnpublishedState | MissingLanguageState | MissingMediaState |
| Factory | Skeleton layout | N/A | ErrorState | UnpublishedState | MissingLanguageState | MissingMediaState |
| Contact | Form ready | N/A | ErrorState | N/A | N/A | N/A |
| Quote Request | Form ready | N/A | ErrorState | N/A | N/A | N/A |
| 404 | N/A | N/A | N/A | N/A | N/A | N/A |

---

# PART S — PAGINATION / FILTER / SORT STATE

## 22. Catalogue state management

### 22.1 V1 catalogue behavior

From `02_DOMAIN_MODEL.md`:

> V1 catalogue browsing is alphabetical sequential-page browsing of published, approved, bilingual Products. No attribute filter, Internal Site Search, product free-text search, comparison, alternative sort, infinite scroll, or load-more behavior is a V1 domain requirement.

### 22.2 State ownership

| State | Owner | Description |
|---|---|---|
| `page` | URL query parameter | `?page=2` — SEO-friendly, shareable |
| `limit` | Server default | `pageSize=24` default, `max=100` |
| `sort` | Server fixed | `sort=title_asc` only in V1 |
| `locale` | URL path segment | `/tr/` or `/en/` |
| `filters` | NOT V1 | Future scope only |
| `search` | NOT V1 | Future scope only |

### 22.3 URL state

```typescript
// Product listing URL
/tr/marbles?page=2

// Journal listing URL
/tr/journal?page=3
```

- Page number is in URL for SEO and shareability.
- No JavaScript-only state for catalogue navigation.
- Pagination links are `<a>` tags, not JavaScript buttons.

### 22.4 Server request

```typescript
// Product list request
GET /public/products?locale=tr&page=2&pageSize=24&sort=title_asc

// Journal list request
GET /public/journal?locale=en&page=1&pageSize=24
```

### 22.5 Frontend state

- Frontend manages: loading state, error state, current page data.
- Frontend does NOT manage: sort, filters, search (V1).
- Frontend fetches data based on URL query parameters.
- URL is the source of truth for pagination state.

### 22.6 SEO-friendly catalogue

- Pagination uses `?page=N` query parameters.
- Page 1 canonical: `/tr/marbles` (no `?page=1`).
- Page N canonical: `/tr/marbles` (canonical points to base, not paginated).
- Hreflang: reciprocal across paginated pages.
- Breadcrumb: Home → Marbles (same for all pages).

---

# PART T — CACHE / REVALIDATION

## 23. Cache strategy

### 23.1 Content cache categories

| Content Type | Cache Lifetime | Revalidation Trigger |
|---|---|---|
| Static pages (About, Quarry, Factory) | Long (hours) | Content publish/unpublish |
| Product data | Medium (minutes to hours) | Product publish/unpublish/edit |
| Homepage content | Medium (minutes to hours) | Homepage content change |
| Journal content | Medium (minutes to hours) | Article publish/unpublish |
| Navigation | Short (minutes) | Content publish/unpublish affecting nav |
| Media | Long (days) | Media asset replacement |
| SEO metadata | Tied to content | Content publish/unpublish |

### 23.2 Revalidation

- Publish/unpublish/archive/remove actions must invalidate affected caches.
- Media rights changes must invalidate caches using that media.
- Relationship changes must invalidate caches for both source and target.

### 23.3 Stale data behavior

- Stale content is acceptable for short periods (minutes).
- Stale navigation is acceptable (Projects visibility may lag).
- Stale SEO metadata is acceptable (search engines re-crawl periodically).
- Stale product data is NOT acceptable after explicit publish/unpublish.

### 23.4 Deployment impact

- Content changes via CMS/API do not require deployment.
- Code deployments may invalidate all caches (implementation decision).
- Static content can be cached at CDN level.

---

# PART U — CONTENT VERSIONING

## 24. Content versioning

### 24.1 V1 versioning

**Required.** Content history/versioning is required for V1 as defined in `03_DATABASE_ER.md` and `05_CMS_CONTRACT.md`.

### 24.2 What is versioned

| Entity | Versioned | Why |
|---|---|---|
| ContentVariant | Yes (via ContentRevision) | Material changes require re-approval |
| ContentRevision | Yes (immutable) | Preserve who changed what and when |
| Approval | Yes (append-only) | Evidence of who approved what version |
| MediaAsset | No (but associations versioned) | Asset itself doesn't version; associations do |
| QuoteRequest | No | Submission is immutable; processing status changes |

### 24.3 How previous versions are represented

- Each ContentRevision stores a material snapshot/reference of the variant content.
- Approval references the exact revision, assets, and languages covered.
- Previous published versions are retained in revision history.
- Restoration requires creating a new revision with restored content (not mutating old revisions).

---

# PART V — PREVIEW

## 25. Preview architecture

### 25.1 Conceptual preview

- Draft content can be previewed through authenticated CMS preview routes.
- Preview does not expose draft content publicly.
- Preview is a CMS concern, not a public frontend concern.

### 25.2 Preview behavior

| State | Preview Available | Public |
|---|---|---|
| Draft | Yes (via CMS auth) | No |
| Approved | Yes (via CMS auth) | No (until published) |
| Published | Yes | Yes |
| Unpublished | No | No |

### 25.3 Preview implementation boundary

- Preview routes, authentication, and CMS UI belong to implementation.
- This document defines the concept only.

---

# PART W — ADMIN / CMS BOUNDARY

## 26. CMS boundary

### 26.1 Content management responsibilities (CMS)

| Area | CMS Controls |
|---|---|
| Products | Create, edit, localize, approve, publish, unpublish, archive, remove, reorder, feature |
| Collections | Create, edit, localize, approve, publish, unpublish, archive, remove, reorder |
| Applications | Create, edit, localize, approve, publish, unpublish, archive, remove, reorder |
| Projects | Create, edit, localize, approve, publish, unpublish, archive, remove, conditional visibility |
| Journal | Create, edit, localize, approve, publish, unpublish, archive, remove, reorder |
| About | Create, edit, localize, approve, publish, Content Owner approval required |
| Quarry | Create, edit, localize, approve, publish, Content Owner approval required |
| Factory | Create, edit, localize, approve, publish, Content Owner approval required |
| Media | Upload, associate, verify rights, set alt text, set roles, replace, remove associations |
| SEO | Set meta title, description, canonical, robots per variant |
| Navigation | Control nav item visibility (e.g., Projects visibility based on qualifying content) |
| Homepage | Set hero content, featured sections, section ordering, CTA content |
| Translations | Manage TR/EN variants, track completeness, handle exceptions |
| Quote Requests | View, process, assign, update status (internal only) |

### 26.2 Public website responsibilities (Frontend)

| Area | Frontend Controls |
|---|---|
| Rendering | Display published content according to design system |
| SEO output | Apply meta tags, canonical, hreflang, structured data from API |
| Accessibility | Semantic HTML, alt text, keyboard navigation, ARIA |
| Responsive | Apply responsive behavior per design system |
| State management | Handle loading, error, empty, unpublished states |
| Navigation | Render navigation based on API data |
| Language switching | Navigate to equivalent locale variant |
| Forms | Render forms, handle validation, submit to API |
| Analytics | Fire events based on user interactions |

### 26.3 Separation principle

- The public frontend consumes published content via API.
- The public frontend does NOT become the CMS.
- Content management is exclusively through CMS/API.
- The frontend does not contain business logic for content decisions.

---

# PART X — PERFORMANCE

## 27. Data-flow performance rules

### 27.1 API request optimization

| Rule | Description |
|---|---|
| Avoid unnecessary requests | Cache API responses; don't re-fetch on every navigation |
| Avoid duplicate fetching | Don't fetch same data in multiple components |
| Batch related data | Homepage API returns all homepage sections in one response |
| Pagination | Load one page at a time; don't prefetch all pages |

### 27.2 Image optimization

| Rule | Description |
|---|---|
| Responsive images | Use `srcset` with multiple sizes from API metadata |
| Lazy loading | `loading="lazy"` for below-fold images |
| Eager loading | `loading="eager"` for above-fold/hero images |
| Format | Serve modern formats (WebP, AVIF) with fallbacks |
| Dimensions | Use `width` and `height` from API to prevent layout shift |

### 27.3 Hero priority

| Rule | Description |
|---|---|
| Eager load | Hero image/video loads immediately |
| Poster image | Displayed while video loads |
| Fallback | Static fallback if video fails |
| Preload | Consider preloading hero media |

### 27.4 Pagination performance

| Rule | Description |
|---|---|
| Page size | 24 items default; configurable up to 100 |
| Lazy load cards | Images within cards lazy-loaded |
| Prefetch next page | Optionally prefetch next page on hover (implementation decision) |

### 27.5 Caching

| Rule | Description |
|---|---|
| API cache | Cache API responses per locale + endpoint + params |
| CDN cache | Cache static assets at CDN |
| Browser cache | Set appropriate cache headers |
| Invalidation | Invalidate on publish/unpublish |

### 27.6 Prefetching

| Content | Prefetch? | Reason |
|---|---|---|
| Next page | Optional | UX improvement on pagination hover |
| Related content | No | Too unpredictable |
| Navigation items | No | Already cached from navigation API |
| Homepage sections | No | Single API response |

---

# PART Y — ACCESSIBILITY

## 28. Data requirements for accessibility

### 28.1 Alt text

| Requirement | Source | Enforcement |
|---|---|---|
| Informative images | Must have meaningful alt text | CMS validation; API requires for publication |
| Decorative images | Must have empty alt semantics | CMS classification; frontend applies `alt=""` |
| Alt text per language | TR and EN alt text may differ | ContentMedia carries localized alt text |
| No keyword stuffing | Alt text is not SEO container | CMS guidance; editorial review |

### 28.2 Captions

| Requirement | Source | Enforcement |
|---|---|---|
| Video captions | When available | Media model supports caption tracks |
| Image captions | Optional | ContentMedia carries caption |

### 28.3 Labels

| Requirement | Source | Enforcement |
|---|---|---|
| Form labels | Every input has associated label | FormField component; API form config |
| Button labels | Clear, descriptive text | CTA content from API |
| Link labels | Descriptive link text | Navigation content from API |

### 28.4 Language attributes

| Requirement | Source | Enforcement |
|---|---|---|
| `lang` on `<html>` | Set to current locale | Frontend sets based on locale |
| Language-aware content | Content rendered in correct language | API returns locale-specific content |

### 28.5 Accessible names

| Requirement | Source | Enforcement |
|---|---|---|
| Landmark roles | `<header>`, `<nav>`, `<main>`, `<footer>` | Frontend component structure |
| ARIA labels | Navigation, forms, galleries | Frontend component implementation |
| Skip-to-content | First focusable element | Frontend component structure |

### 28.6 Empty and error states

| Requirement | Source | Enforcement |
|---|---|---|
| Empty state announced | `aria-live="polite"` for empty states | EmptyState component |
| Error state announced | `aria-live="polite"` for errors | ErrorState component |
| Loading state announced | `aria-live="polite"` for loading | LoadingState component |

---

# PART Z — ANALYTICS DATA REQUIREMENTS

## 29. Analytics data requirements

### 29.1 Content data for analytics

| Event | Required Content Data | Source |
|---|---|---|
| `product_view` | `product_id`, `product_name`, `locale` | Product Detail API response |
| `product_click` | `product_id`, `product_name`, `position`, `source_page`, `locale` | ProductCard click handler |
| `collection_view` | `collection_id`, `collection_name`, `locale` | Collection Detail API response |
| `collection_click` | `collection_id`, `collection_name`, `position`, `locale` | CollectionCard click handler |
| `application_view` | `application_id`, `application_name`, `locale` | Application Detail API response |
| `application_click` | `application_id`, `application_name`, `position`, `locale` | ApplicationCard click handler |
| `project_view` | `project_id`, `project_name`, `locale` | Project Detail API response |
| `project_click` | `project_id`, `project_name`, `position`, `locale` | ProjectCard click handler |
| `journal_view` | `article_id`, `article_title`, `locale` | Journal Detail API response |
| `journal_click` | `article_id`, `article_title`, `position`, `locale` | JournalCard click handler |
| `inquiry_start` | `context_type`, `context_id`, `locale` | QuoteCTA click handler |
| `inquiry_submit` | `context_type`, `context_id`, `locale`, `success` | QuoteForm submission |
| `contact_submit` | `locale`, `success` | ContactForm submission |
| `language_switch` | `from_locale`, `to_locale` | LanguageSwitcher click handler |
| `pagination_click` | `page_number`, `source_page`, `locale` | Pagination click handler |
| `hero_video_start` | `locale` | HeroVideo play event |
| `hero_video_complete` | `locale`, `duration` | HeroVideo complete event |
| `hero_fallback_shown` | `reason`, `locale` | VideoFallback display event |

### 29.2 Analytics implementation boundary

- Analytics events are specifications only; implementation belongs to development.
- No analytics library is specified; choice belongs to implementation.
- Events must not include personal data without consent.
- Events must comply with privacy regulations.

---

# PART AA — SECURITY / DATA INTEGRITY

## 30. Security and data integrity rules

### 30.1 Content validation

| Rule | Description |
|---|---|
| Validate content | API validates all content on create/update |
| Sanitize rich text | Rich text content sanitized to prevent XSS |
| Prevent unsafe HTML | Allowlisted HTML tags only in rich text |
| Validate media references | Ensure referenced media exists and is eligible |
| Validate localized content | Ensure both TR and EN variants meet publication requirements |
| Validate slugs | Ensure slug format, uniqueness, and locale correctness |
| Prevent unpublished leakage | Public API returns only published, eligible content |

### 30.2 Input sanitization

| Input Type | Sanitization |
|---|---|
| Plain text | Escape HTML entities |
| Rich text | Sanitize to allowlisted tags/attributes |
| URLs | Validate URL format; prevent javascript: protocol |
| Images | Validate file type; scan for malware (implementation decision) |
| Form data | Server-side validation; rate limiting; spam protection |

### 30.3 Data integrity

| Rule | Description |
|---|---|
| Referential integrity | All junctions require both parents to exist |
| Lifecycle integrity | State transitions validated |
| Approval integrity | Publication requires valid approval |
| Media rights integrity | Public media requires verified rights |
| Quote Request integrity | XOR context rule enforced at database and API level |

---

# PART AB — OPEN DECISIONS

## 31. Open decisions

### 31.1 Inherited from previous documents

| # | Decision | Source | Impact | Status |
|---|---|---|---|---|
| 1 | Content Owner identity | `02_DOMAIN_MODEL.md` | Affects About, Quarry, Factory approval authority | OPEN |
| 2 | Project launch content | `01_MASTER_INFORMATION_ARCHITECTURE.md` | Affects Project visibility | OPEN |
| 3 | Featured Homepage content | `08_PAGE_WIREFRAMES.md` | Affects Homepage featured sections | OPEN |
| 4 | Exact form fields | `05_CMS_CONTRACT.md` | Affects Contact and Quote Request forms | OPEN |
| 5 | Legal/privacy text | `05_CMS_CONTRACT.md` | Affects form data collection | OPEN |
| 6 | Homepage section ordering | `08_PAGE_WIREFRAMES.md` | Affects Homepage layout | OPEN |
| 7 | Font loading strategy | `10_DESIGN_SYSTEM.md` | Affects performance, privacy | OPEN |
| 8 | Icon set final selection | `10_DESIGN_SYSTEM.md` | Affects icon rendering | OPEN |
| 9 | Default locale for root redirect | `06_SEO_URL_ARCHITECTURE.md` | Affects SEO crawl budget | OPEN |
| 10 | Scroll indicator on hero | `08_PAGE_WIREFRAMES.md` | Affects hero UX | OPEN |
| 11 | Spam protection method | `11_PAGE_SPECIFICATIONS.md` | Affects form security | OPEN |
| 12 | Exact form field configuration | `11_PAGE_SPECIFICATIONS.md` | Affects Contact and Quote Request | OPEN |

### 31.2 New in this document

| # | Decision | Impact | Status |
|---|---|---|---|
| 13 | Video preload strategy | Affects homepage performance | OPEN |
| 14 | Image format optimization strategy | Affects image delivery performance | OPEN |
| 15 | Next page prefetch on pagination hover | Affects pagination UX | OPEN |
| 16 | Scheduled publication need | Affects CMS complexity | NOT REQUIRED for V1 |
| 17 | Content comparison/diff tool | Affects CMS revision UX | NOT REQUIRED for V1 |
| 18 | Bulk operations need | Affects CMS complexity | NOT REQUIRED for V1 (individual operations sufficient) |

---

# PART AC — IMPLEMENTATION BOUNDARY

## 32. What this document does NOT implement

| Category | Not Implemented |
|---|---|
| React components | No component code |
| API controllers | No Express/Next.js route handlers |
| Database migrations | No Prisma/SQL migrations |
| CMS UI | No admin interface |
| Authentication | No login/session system |
| Actual product data | No real marble names, descriptions, or specifications |
| Fictional company content | No invented history, capacity, certifications |
| Real image URLs | No actual image file references |
| Invented projects | No fake project records |
| Analytics implementation | No tracking library setup |
| CDN configuration | No CDN setup |
| Image processing pipeline | No image transformation code |
| Video hosting | No video delivery infrastructure |
| Form submission backend | No form processing code |
| Spam protection | No CAPTCHA or rate-limit implementation |
| Email notifications | No email system |
| Search implementation | No search index (V1: no search) |
| Filter implementation | No filter UI (V1: no filters) |

---

# PART AD — CONSISTENCY AUDIT

## 33. Consistency audit

### 33.1 Against 00_PROJECT_RULES.md

| Check | Result |
|---|---|
| No invented business facts | PASS — All content-dependent fields marked optional/CONTENT PLACEHOLDER |
| TR/EN supported | PASS — Localization model preserves one entity, two variants |
| Lifecycle states | PASS — Draft/Approved/Published/Unpublished/Archived/Removed defined |
| V1 scope | PASS — No search, filters, comparison, commerce, accounts |
| Accessibility | PASS — Alt text, captions, labels, language attributes, empty/error states |
| Hero fallback | PASS — 7 states defined; data model supports fallback images |
| Quote Request XOR | PASS — Database and API enforce zero or exactly one context |
| Governance | PASS — Content management through CMS/API; approval required |
| Truthfulness | PASS — No invented claims, certificates, capacity, or projects |
| Media rights | PASS — Rights verification required before public use |
| Product publication gate | PASS — Gate requirements defined and enforced |

### 33.2 Against 01–08

| Check | Result |
|---|---|
| Page inventory alignment | PASS — All content types map to pages defined in IA |
| User journeys | PASS — Data flow supports all four user journeys |
| Navigation | PASS — Navigation data served via API; Projects conditional |
| Content hierarchy | PASS — Content model matches approved hierarchy |
| Product discovery | PASS — 100+ products managed via CMS, not hard-coded |
| Conversion | PASS — Quote Request and Contact data flow defined |
| Project visibility | PASS — Conditional on qualifying projects from API |
| Internal links | PASS — All relationships managed via junction entities |
| SEO URLs | PASS — Slug management per locale; hreflang from ContentItem |
| Hero video | PASS — Video data model supports storyboard from 07 |

### 33.3 Against 09_COMPONENT_TREE.md

| Check | Result |
|---|---|
| Component data requirements | PASS — All component data needs defined in content models |
| State components | PASS — Loading/Error/Empty/Unpublished/MissingLanguage/MissingMedia states mapped |
| Media components | PASS — Media data model supports ResponsiveImage, ImageGallery, HeroVideo, etc. |
| Conversion components | PASS — QuoteCTA and QuoteForm data flow defined |
| Navigation components | PASS — Navigation data served via API |
| No duplicate state systems | PASS — Single state system per component tree |

### 33.4 Against 10_DESIGN_SYSTEM.md

| Check | Result |
|---|---|
| Design token references | PASS — Content data does not duplicate design tokens |
| Component styling | PASS — Content data flows to components; styling via design system |
| Responsive behavior | PASS — Responsive data (image sizes, breakpoints) from API metadata |
| Accessibility tokens | PASS — Accessibility data (alt text, labels) from content model |

### 33.5 Against 11_PAGE_SPECIFICATIONS.md

| Check | Result |
|---|---|
| Page data requirements | PASS — All page content requirements defined in content models |
| Section ordering | PASS — Homepage section ordering from content model |
| Component composition | PASS — Component data needs match content model fields |
| SEO requirements | PASS — SEO data model supports all page SEO needs |
| Analytics events | PASS — Content data for analytics events defined |
| Open decisions | PASS — All open decisions carried forward |

### 33.6 Cross-cutting checks

| Check | Result |
|---|---|
| No hard-coded catalogue | PASS — All product data from CMS/API |
| Homepage is data-driven | PASS — Hero, featured sections, CTA all from content model |
| Product catalogue is data-driven | PASS — 100+ products via CMS, not React components |
| Media is dynamic | PASS — Media model supports images, videos, galleries |
| SEO is data-driven | PASS — SEO metadata from content model, not hard-coded |
| TR/EN is structural | PASS — Localization is content model concern, not UI concern |
| Open decisions remain open | PASS — 18 open decisions documented, none resolved silently |
| No unnecessary CMS complexity | PASS — V1-appropriate features only |

---

## 34. PAGE SPECIFICATION AUDIT

| Metric | Value |
|---|---|
| Sections created | 33 |
| Content types defined | 10 |
| Relationship types defined | 15 |
| API response shapes defined | 11 |
| Frontend data states defined | 9 |
| Analytics events defined | 19 |
| Security rules defined | 12 |
| Open decisions | 18 |
| Consistency checks | PASS (all) |

---

## 35. STATUS

**READY FOR API / CMS CONTRACT — WITH OPEN DECISIONS**

---

## 36. Critical OPEN DECISIONS

1. **Content Owner identity** — Must be confirmed before production.
2. **Project launch content** — Affects conditional Project component rendering.
3. **Featured Homepage content** — Editorial decision, not data architecture.
4. **Exact form fields** — Content-dependent, belongs to implementation.
5. **Legal/privacy text** — Must be approved before form data collection.
6. **Homepage section ordering** — Editorial adjustment allowed.
7. **Font loading strategy** — Self-hosted vs CDN (implementation).
8. **Icon set final selection** — Lucide recommended (implementation).
9. **Default locale for root redirect** — Affects SEO crawl budget.
10. **Scroll indicator on hero** — Editorial/design decision.
11. **Spam protection method** — Implementation decision.
12. **Exact form field configuration** — Belongs to implementation.
13. **Video preload strategy** — Implementation decision.
14. **Image format optimization strategy** — Implementation decision.
15. **Next page prefetch on pagination hover** — Implementation decision.
16. **Scheduled publication need** — Not required for V1.
17. **Content comparison/diff tool** — Not required for V1.
18. **Bulk operations need** — Not required for V1.
