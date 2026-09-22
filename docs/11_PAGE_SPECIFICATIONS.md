# Page Specifications

## 1. Purpose

This document defines every page of the public website as an actionable frontend specification. It translates the structural wireframes from `08_PAGE_WIREFRAMES.md`, the component architecture from `09_COMPONENT_TREE.md`, and the design system from `10_DESIGN_SYSTEM.md` into per-page implementation guidance.

It answers: "What does the frontend developer need to know to build each page correctly?"

---

## 2. Scope

Covers all approved public page types. For each page: purpose, audience, content hierarchy, section order, component composition, design tokens, responsive behavior, SEO, accessibility, conversion, states, internal linking, and analytics events.

Does not define code, framework, build system, API implementation, or CMS backend.

---

## 3. Source of truth hierarchy

| Concern | Source |
|---|---|
| Page inventory & journeys | `01_MASTER_INFORMATION_ARCHITECTURE.md` |
| Content relationships | `02_DOMAIN_MODEL.md` |
| Data model | `03_DATABASE_ER.md` |
| API endpoints | `04_API_CONTRACT.md` |
| URL patterns | `06_SEO_URL_ARCHITECTURE.md` |
| Internal links | `07_INTERNAL_LINK_GRAPH.md` |
| Section order & wireframes | `08_PAGE_WIREFRAMES.md` |
| Component architecture | `09_COMPONENT_TREE.md` |
| Visual design & tokens | `10_DESIGN_SYSTEM.md` |

---

# PART A — PAGE INVENTORY

## 4. Complete page inventory

| # | Route | Page Name | TR Name | EN Name | Page Type | Primary Purpose | Primary Audience | Primary CTA | Secondary CTA | SEO Importance | Indexability | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `/{locale}/` | Homepage | Ana Sayfa | Home | Landing | Brand orientation, discovery, trust | All | Explore Marbles | Request Quote | High | Yes | Defined |
| 2 | `/{locale}/marbles` | Product Catalogue | Mermer Kataloğu | Marble Catalogue | Listing | Browse full product catalogue | Architect, Buyer | View Product | Request Quote | High | Yes | Defined |
| 3 | `/{locale}/marbles/{slug}` | Product Detail | Ürün Detayı | Product Detail | Detail | Evaluate one material in depth | Architect, Buyer, Project Company, Local Customer | Request Quote | Contact | High | Yes | Defined |
| 4 | `/{locale}/collections` | Collection Listing | Koleksiyonlar | Collections | Listing | Browse curated product groupings | Architect, Buyer, Local Customer | View Collection | Request Quote | High | Yes | Defined |
| 5 | `/{locale}/collections/{slug}` | Collection Detail | Koleksiyon Detayı | Collection Detail | Detail | Explore curated product grouping | Architect, Buyer, Local Customer | View Products | Request Quote | High | Yes | Defined |
| 6 | `/{locale}/applications` | Application Listing | Uygulamalar | Applications | Listing | Browse material-use contexts | Architect, Project Company | View Application | Request Quote | High | Yes | Defined |
| 7 | `/{locale}/applications/{slug}` | Application Detail | Uygulama Detayı | Application Detail | Detail | Connect use-context to materials | Architect, Project Company | Explore Suitable Marbles | Request Quote | High | Yes | Defined |
| 8 | `/{locale}/projects` | Project Listing | Projeler | Projects | Listing | Browse reference cases | Architect, Project Company | View Project | Request Quote | Medium | Conditional | Defined |
| 9 | `/{locale}/projects/{slug}` | Project Detail | Proje Detayı | Project Detail | Detail | Present reference case; trust | Architect, Project Company | Explore Related Marbles | Request Quote | Medium | Conditional | Defined |
| 10 | `/{locale}/journal` | Journal Listing | Dergi | Journal | Listing | Discover editorial content | Architect, Buyer | Read Article | Explore Marbles | High | Yes | Defined |
| 11 | `/{locale}/journal/{slug}` | Journal Detail | Makale Detayı | Article Detail | Detail | Inform with editorial content | Architect, Buyer | Explore Related Materials | Request Quote (when appropriate) | High | Yes | Defined |
| 12 | `/{locale}/about` | About | Hakkında | About | Static | Company credibility | Buyer, Project Company | Contact | Request Quote | Medium | Yes | Defined |
| 13 | `/{locale}/quarry` | Quarry | Ocak | Quarry | Static | Material-origin storytelling | Buyer, Architect | Explore Marbles | Request Quote | Medium | Yes | Defined |
| 14 | `/{locale}/factory` | Factory | Fabrika | Factory | Static | Production-story storytelling | Buyer, Project Company | Explore Marbles | Request Quote | Medium | Yes | Defined |
| 15 | `/{locale}/contact` | Contact | İletişim | Contact | Static | General contact route | All | Contact (submit) | Request Quote | Medium | Yes | Defined |
| 16 | `/{locale}/quote` | Quote Request | Teklif Talebi | Request Quote | Form | Collect commercial enquiry | All | Submit Request | — | Low | No (noindex) | Defined |
| 17 | `/{locale}/404` | Not Found | Bulunamadı | Not Found | Error | Recovery from unavailable routes | All | Browse Marbles | — | Low | No (noindex) | Defined |

---

# PART B — PAGE SPECIFICATIONS

---

## 5. Homepage

### 5.1 Purpose

Brand orientation, high-level discovery, trust establishment, conversion initiation. The homepage is the entry point for all four user journeys (Architect, Buyer, Project Company, Local Customer).

### 5.2 Target Audience

All user types. Primary: Architect, Buyer. Secondary: Project Company, Local Customer.

### 5.3 User Intent

"Am I in the right place? What does this company offer? Can I find what I need?"

### 5.4 Primary Conversion

Explore Marbles → Product Catalogue

### 5.5 Secondary Conversion

Request Quote → Quote Request (general context)

### 5.6 Route

`/{locale}/`

### 5.7 Breadcrumb

None. Homepage is root.

### 5.8 SEO Role

High. Primary landing page for brand queries. Self-referencing canonical, reciprocal hreflang, Organization + WebSite structured data.

### 5.9 Section Order

OPEN DECISION — Final section ordering may be adjusted editorially. Proposed order based on `08_PAGE_WIREFRAMES.md`:

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Global Header | Required | SiteHeader |
| 2 | Hero / Scroll Video | Required | HeroVideo / VideoFallback |
| 3 | Featured Products | Conditional | ProductGrid → ProductCard |
| 4 | Featured Collections | Conditional | CollectionGrid → CollectionCard |
| 5 | Architectural Applications | Conditional | ApplicationGrid → ApplicationCard |
| 6 | Quarry & Factory Story | Conditional | MediaContentLayout → QuarryHero / FactoryHero |
| 7 | Featured Projects | Conditional | ProjectGrid → ProjectCard |
| 8 | Featured Journal | Conditional | JournalGrid → JournalCard |
| 9 | Final CTA | Required | QuoteCTA |
| 10 | Global Footer | Required | SiteFooter |

**Conditional rules:**
- Featured Products: only if approved featured products exist
- Featured Collections: only if collections exist
- Architectural Applications: only if applications exist
- Quarry & Factory: only if Quarry/Factory content is published
- Featured Projects: only when at least one qualifying published bilingual project exists
- Featured Journal: only if journal articles exist

### 5.10 Component Composition

```
AppShell
├── SiteHeader
│   ├── BrandLogo
│   ├── DesktopNavigation
│   ├── MobileNavigation
│   ├── LanguageSwitcher
│   └── GlobalCTA (Request Quote)
├── MainContent
│   ├── HeroVideo
│   │   ├── VideoFallback (fallback state)
│   │   │   ├── PosterImage
│   │   │   ├── Hero message (h1 heading + subheading)
│   │   │   └── CTA links (Explore Marbles, Request Quote)
│   │   └── Video (cinematic state)
│   │       ├── Scroll-driven sequence
│   │       └── CTA links
│   ├── FullWidthSection (Featured Products)
│   │   └── ContentContainer
│   │       └── ProductGrid
│   │           └── ProductCard (multiple)
│   ├── FullWidthSection (Collections)
│   │   └── ContentContainer
│   │       └── CollectionGrid
│   │           └── CollectionCard (multiple)
│   ├── FullWidthSection (Applications)
│   │   └── ContentContainer
│   │       └── ApplicationGrid
│   │           └── ApplicationCard (multiple)
│   ├── FullWidthSection (Quarry & Factory)
│   │   └── MediaContentLayout
│   │       ├── QuarryHero
│   │       └── FactoryHero
│   ├── FullWidthSection (Projects)
│   │   └── ContentContainer
│   │       └── ProjectGrid
│   │           └── ProjectCard (multiple)
│   ├── FullWidthSection (Journal)
│   │   └── ContentContainer
│   │       └── JournalGrid
│   │           └── JournalCard (multiple)
│   └── FullWidthSection (Final CTA)
│       └── QuoteCTA
└── SiteFooter
```

### 5.11 Content Requirements

| Section | Content | Source |
|---|---|---|
| Hero | Primary brand message, subheading, CTA labels | CMS hero content |
| Featured Products | Product image, name, brief description | Product data (featured selection) |
| Collections | Collection image, name, brief description | Collection data |
| Applications | Application image, name, brief description | Application data |
| Quarry & Factory | Narrative text, imagery | Company content |
| Projects | Project image, name, brief description | Project data |
| Journal | Article image, title, excerpt | Journal data |
| Final CTA | Conversion message, CTA labels | CMS content |

### 5.12 Media Requirements

| Media | Type | Aspect Ratio | Priority | Fallback |
|---|---|---|---|---|
| Hero video | Video (scroll-driven) | 16:9 | Critical | Static hero image (PosterImage) |
| Hero fallback | Image | 16:9 | Critical | Text-only hero |
| Product cards | Images | Per `10_DESIGN_SYSTEM.md` | High | Product name + description |
| Collection cards | Images | Per `10_DESIGN_SYSTEM.md` | High | Collection name + description |
| Application cards | Images | Per `10_DESIGN_SYSTEM.md` | High | Application name + description |
| Quarry/Factory | Images | Per `10_DESIGN_SYSTEM.md` | Medium | Text narrative |
| Project cards | Images | Per `10_DESIGN_SYSTEM.md` | Medium | Project name + description |
| Journal cards | Images | Per `10_DESIGN_SYSTEM.md` | Medium | Article title + excerpt |

### 5.13 Homepage-specific hero specifications

| Property | Value | Source |
|---|---|---|
| First viewport | Hero fills 100vh (desktop), 80vh (tablet), 70vh (mobile) | `10_DESIGN_SYSTEM.md` |
| Hero height desktop | `--hero-height-desktop: 100vh` / min `--hero-min-height-desktop: 600px` | `10_DESIGN_SYSTEM.md` |
| Hero height tablet | `--hero-height-tablet: 80vh` / min `--hero-min-height-tablet: 480px` | `10_DESIGN_SYSTEM.md` |
| Hero height mobile | `--hero-height-mobile: 70vh` / min `--hero-min-height-mobile: 400px` | `10_DESIGN_SYSTEM.md` |
| Hero content placement | Centered overlay on video/image; heading + subheading + CTAs | `08_PAGE_WIREFRAMES.md` |
| Navigation behavior | Transparent over hero, becomes opaque on scroll | `10_DESIGN_SYSTEM.md` |
| Scroll indicator | Minimal scroll-down indicator (optional, editorial decision) | OPEN DECISION |
| Video fallback | 7 states defined per `09_COMPONENT_TREE.md` §8.1 | `09_COMPONENT_TREE.md` |
| Reduced motion | Static fallback image + message + CTAs; no animation | `10_DESIGN_SYSTEM.md` |
| Mobile video behavior | Fallback image on mobile; video only on tablet/desktop | `09_COMPONENT_TREE.md` |
| Poster behavior | PosterImage displayed before video loads or on failure | `09_COMPONENT_TREE.md` |
| CTA placement | Within hero overlay, below heading; Primary + Secondary | `08_PAGE_WIREFRAMES.md` |
| Content density | Minimal: 1 heading, 1 subheading, 2 CTAs max | `08_PAGE_WIREFRAMES.md` |
| Image loading priority | Hero image: `loading="eager"`, above-fold; all below-fold: `loading="lazy"` | `10_DESIGN_SYSTEM.md` |

### 5.14 Responsive Behavior

| Breakpoint | Grid | Hero | Sections | Navigation |
|---|---|---|---|---|
| Desktop (≥1200px) | 12-column, `--container-lg` | 100vh, video background | Multi-column grids (4-col products, 3-col cards) | Full horizontal nav |
| Tablet (768–1199px) | 12-column, adjusted | 80vh, video background | Adjusted grids (2-col) | Hamburger/condensed |
| Mobile (<768px) | 12-column, full-width | 70vh, fallback image | Single-column stacking | Hamburger/overlay |

### 5.15 Accessibility

| Requirement | Implementation |
|---|---|
| Heading hierarchy | h1 = hero/brand heading; h2 = section headings; no skipped levels |
| Landmark structure | `<header>`, `<nav>`, `<main>`, `<footer>` |
| Skip-to-content | First focusable element → MainContent |
| Keyboard | All CTAs and nav items focusable; logical tab order |
| Focus visible | `--color-accent` outline, 2px, 2px offset |
| Alt text | All card images: meaningful alt; hero fallback: meaningful alt |
| Video controls | VideoFallback always accessible; video has pause/mute controls |
| Reduced motion | HeroVideo falls back to VideoFallback; no animation |
| Touch targets | Minimum 44px × 44px on mobile |
| Contrast | All text meets 4.5:1 (AA) |

### 5.16 Loading State

- Skeleton sections while hero and featured content load
- Announce loading state to screen readers (`aria-live="polite"`)
- Hero: poster image shown immediately; video loads asynchronously

### 5.17 Error State

- Hero: VideoFallback with static image + message + CTAs
- Featured sections: if data fails to load, section hidden (not shown with error)
- Global error: `ErrorState` component with retry option

### 5.18 Empty State

- N/A for Homepage (always has structural content)
- If no featured products: section hidden, not shown empty
- If no collections: section hidden
- If no applications: section hidden
- If no projects: section hidden (Projects area not in navigation)
- If no journal articles: section hidden

### 5.19 Internal Links

| Target | Link Type | Condition |
|---|---|---|
| Product Catalogue | Primary CTA ("Explore Marbles") | Always |
| Product Detail | ProductCard links | When featured products shown |
| Collection Detail | CollectionCard links | When collections shown |
| Application Detail | ApplicationCard links | When applications shown |
| Project Detail | ProjectCard links | When projects shown |
| Journal Detail | JournalCard links | When journal shown |
| Quarry | Quarry section CTA | When quarry content published |
| Factory | Factory section CTA | When factory content published |
| Quote Request | Secondary CTA, Final CTA | Always |

### 5.20 Related Pages

All pages link back to Homepage via BrandLogo.

### 5.21 Analytics Events

| Event | Trigger | Properties |
|---|---|---|
| `page_view` | Page load | `page: "home"`, `locale` |
| `hero_video_start` | Video begins playing | `locale` |
| `hero_video_complete` | Video finishes | `locale`, `duration` |
| `hero_fallback_shown` | Fallback displayed | `reason`, `locale` |
| `section_view` | Section enters viewport | `section_name`, `locale` |
| `product_click` | ProductCard clicked | `product_id`, `product_name`, `locale` |
| `collection_click` | CollectionCard clicked | `collection_id`, `collection_name`, `locale` |
| `application_click` | ApplicationCard clicked | `application_id`, `application_name`, `locale` |
| `project_click` | ProjectCard clicked | `project_id`, `project_name`, `locale` |
| `journal_click` | JournalCard clicked | `article_id`, `article_title`, `locale` |
| `cta_click` | CTA clicked | `cta_type: "primary"|"secondary"`, `target`, `locale` |
| `language_switch` | LanguageSwitcher clicked | `from_locale`, `to_locale` |

### 5.22 Open Decisions

1. **Homepage section ordering** — Final section order may be adjusted editorially.
2. **Featured content selection** — Which specific products, collections, applications, projects, articles are featured is an editorial decision.
3. **Scroll indicator** — Whether a scroll-down indicator appears on the hero is an editorial/design decision.
4. **Hero video storyboard details** — Exact video scenes and timing belong to `docs/11_HERO_VIDEO_STORYBOARD.md`.

---

## 6. Product Catalogue

### 6.1 Purpose

Browse the full catalogue of approved products. Support discovery through alphabetical browsing.

### 6.2 Target Audience

Architect, Buyer.

### 6.3 User Intent

"I want to see all available marble materials."

### 6.4 Primary Conversion

View Product → Product Detail

### 6.5 Secondary Conversion

Request Quote → Quote Request (general)

### 6.6 Route

`/{locale}/marbles`

### 6.7 Breadcrumb

Home → Marbles

### 6.8 SEO Role

High. Primary catalogue page for material queries. Self-referencing canonical, ItemList structured data, paginated.

### 6.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Page Title & Intro | Required | ContentContainer → h1 + editorial text |
| 2 | Product Grid | Required | ProductGrid → ProductCard |
| 3 | Pagination | Required | Pagination |
| 4 | Related Discovery | Optional | Links to Collections, Applications |

### 6.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Marbles)
├── MainContent
│   ├── ListingLayout
│   │   ├── ContentContainer
│   │   │   ├── Page title (h1)
│   │   │   └── Introductory text
│   │   ├── ContentContainer
│   │   │   └── ProductGrid
│   │   │       └── ProductCard (multiple, paginated)
│   │   └── PaginationLayout
│   │       └── Pagination
│   └── FullWidthSection (Related Discovery, optional)
│       └── ContentContainer
│           └── Links to Collections, Applications
└── SiteFooter
```

### 6.11 Content Requirements

| Content | Source |
|---|---|
| Page title | CMS content |
| Introductory text | CMS content |
| Product cards (image, name, description) | Product data (published, approved, bilingual, alphabetical by locale title) |
| Pagination metadata | API response |

### 6.12 Media Requirements

| Media | Type | Fallback |
|---|---|---|
| Product card images | Image | Product name + description (MissingMediaState) |

### 6.13 Responsive Behavior

| Breakpoint | Grid | Pagination | Cards |
|---|---|---|---|
| Desktop | 4-column ProductGrid | Full sequential pagination | Full card |
| Tablet | 2-column ProductGrid | Full pagination | Full card |
| Mobile | 1–2 column ProductGrid | Simplified pagination | Full card |

### 6.14 Accessibility

| Requirement | Implementation |
|---|---|
| Heading | h1 = page title |
| Grid | Semantic `<ul>` or `<div role="list">` for product grid |
| Keyboard | Tab through cards; Enter/Space to activate |
| Alt text | All product images: meaningful alt |
| Pagination | `aria-label="Pagination"`, current page announced |
| Skip-to-content | Jumps past header to page title |

### 6.15 Loading State

- Skeleton grid (placeholder ProductCards) while products load
- Announce loading to screen readers

### 6.16 Error State

- `ErrorState` component: error message + retry button + link to Homepage

### 6.17 Empty State

- `EmptyState` component: "No products available" message + link to Homepage or Contact
- Do not show empty grid

### 6.18 Internal Links

| Target | Link Type |
|---|---|
| Product Detail | ProductCard links |
| Homepage | Breadcrumb (Home) |
| Collections | Related Discovery link |
| Applications | Related Discovery link |
| Quote Request | Navigation CTA |

### 6.19 Related Pages

Product Detail, Collection Detail, Application Detail.

### 6.20 Analytics Events

| Event | Trigger | Properties |
|---|---|---|
| `page_view` | Page load | `page: "product_catalogue"`, `locale`, `page_number` |
| `product_click` | ProductCard clicked | `product_id`, `product_name`, `position`, `locale` |
| `pagination_click` | Page number clicked | `page_number`, `locale` |

### 6.21 Open Decisions

None.

---

## 7. Product Detail

### 7.1 Purpose

Evaluate one material in depth. Initiate conversion.

### 7.2 Target Audience

Architect, Buyer, Project Company, Local Customer.

### 7.3 User Intent

"Tell me everything about this material. Is it right for my project?"

### 7.4 Primary Conversion

Request Quote (with product context)

### 7.5 Secondary Conversion

Contact

### 7.6 Route

`/{locale}/marbles/{slug}`

### 7.7 Breadcrumb

Home → Marbles → Product Name

### 7.8 SEO Role

High. Product-specific queries. Self-referencing canonical, Product structured data, localized slug.

### 7.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Breadcrumb | Required | Breadcrumbs |
| 2 | Product Identity | Required | ProductHero (h1 = product name) |
| 3 | Product Gallery | Required | ProductGallery → ImageGallery |
| 4 | Product Description | Required | EditorialLayout (body text) |
| 5 | Product Information | Conditional | ProductInfo (technical data if available) |
| 6 | Related Collections | Conditional | CollectionCard links |
| 7 | Related Applications | Conditional | ApplicationCard links |
| 8 | Related Projects | Conditional | ProjectCard links |
| 9 | Related Journal | Conditional | JournalCard links |
| 10 | Related Products | Conditional | ProductCard links |
| 11 | Quote CTA | Required | ProductQuoteCTA |

### 7.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Marbles → Product)
├── MainContent
│   ├── DetailLayout
│   │   ├── SplitLayout
│   │   │   ├── ProductGallery
│   │   │   │   └── ImageGallery
│   │   │   └── ProductHero
│   │   │       └── Product name (h1), tagline
│   │   ├── EditorialLayout
│   │   │   └── Product description
│   │   ├── ProductInfo (conditional)
│   │   │   └── Technical/commercial data
│   │   ├── ContentContainer (Related Collections, conditional)
│   │   │   └── CollectionCard (multiple)
│   │   ├── ContentContainer (Related Applications, conditional)
│   │   │   └── ApplicationCard (multiple)
│   │   ├── ContentContainer (Related Projects, conditional)
│   │   │   └── ProjectCard (multiple)
│   │   ├── ContentContainer (Related Journal, conditional)
│   │   │   └── JournalCard (multiple)
│   │   ├── ContentContainer (Related Products, conditional)
│   │   │   └── ProductCard (multiple)
│   │   └── ProductQuoteCTA
│   │       └── QuoteCTA (with product context)
└── SiteFooter
```

### 7.11 Content Requirements

| Content | Source |
|---|---|
| Product name | Product data (locale variant) |
| Tagline/summary | Product data (if available) |
| Gallery images | Media assets (ContentMedia junction) |
| Description | Product data (localized body) |
| Technical information | Product data (content-dependent; fields with approved data only) |
| Related collections | ProductCollection junction |
| Related applications | ProductApplication junction |
| Related projects | ProjectProduct junction (conditional on project visibility) |
| Related journal | JournalContentReference |
| Related products | RelatedProduct junction |

### 7.12 Media Requirements

| Media | Type | Fallback |
|---|---|---|
| Primary product image | Image (srcset) | MissingMediaState: product name + description |
| Gallery images | Images (srcset) | MissingMediaState |
| Related card images | Images | Card name + description |

### 7.13 Responsive Behavior

| Breakpoint | Gallery | Info | Related Content | CTA |
|---|---|---|---|---|
| Desktop | Two-column (gallery left, identity/info right) | Right column | Multi-column grids | Inline |
| Tablet | Stacked (gallery full-width, content below) | Below gallery | Adjusted grids | Inline |
| Mobile | Stacked (gallery full-width, content below) | Below gallery | Single-column | Sticky (optional) |

### 7.14 Accessibility

| Requirement | Implementation |
|---|---|
| Heading | h1 = product name; h2 = section headings |
| Gallery | Keyboard-navigable; arrow keys for carousel; focus management |
| Lightbox | Focus trapped; Escape to close; aria-labels |
| Alt text | All product images: meaningful alt describing material |
| Related content | Semantic lists; clear link labels |
| Form (quote) | Labels, required fields, error messages, aria-describedby |

### 7.15 Loading State

- Skeleton layout (gallery placeholder + text placeholders)
- Announce loading to screen readers

### 7.16 Error State

- `ErrorState` component: error message + retry + link to Product Catalogue

### 7.17 Empty State

- N/A (product detail always has product data if page exists)
- If product is unpublished: `UnpublishedState` → redirect to 404/410
- If language variant missing: `MissingLanguageState` → show available language, disable switch

### 7.18 Internal Links

| Target | Link Type |
|---|---|
| Product Catalogue | Breadcrumb |
| Collection Detail | Related Collections |
| Application Detail | Related Applications |
| Project Detail | Related Projects |
| Journal Detail | Related Journal |
| Product Detail | Related Products |
| Quote Request | ProductQuoteCTA (product context) |
| Contact | Secondary CTA |

### 7.19 Related Pages

Product Catalogue, Collection Detail, Application Detail, Project Detail, Journal Detail.

### 7.20 Analytics Events

| Event | Trigger | Properties |
|---|---|---|
| `page_view` | Page load | `page: "product_detail"`, `locale`, `product_id`, `product_name` |
| `product_gallery_view` | Gallery image viewed | `product_id`, `image_index`, `locale` |
| `related_content_click` | Related card clicked | `related_type`, `related_id`, `locale` |
| `inquiry_start` | QuoteCTA clicked | `product_id`, `locale` |

### 7.21 Open Decisions

1. **ProductInfo fields** — Exact technical/commercial fields are content-dependent; only approved fields shown.

---

## 8. Collection Listing

### 8.1 Purpose

Browse curated product groupings.

### 8.2 Target Audience

Architect, Buyer, Local Customer.

### 8.3 User Intent

"I want to explore curated collections of marble."

### 8.4 Primary Conversion

View Collection → Collection Detail

### 8.5 Secondary Conversion

Request Quote

### 8.6 Route

`/{locale}/collections`

### 8.7 Breadcrumb

Home → Collections

### 8.8 SEO Role

High. Self-referencing canonical, paginated.

### 8.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Page Title & Intro | Required | ContentContainer → h1 + editorial text |
| 2 | Collection Grid | Required | CollectionGrid → CollectionCard |
| 3 | Pagination | Required | Pagination |

### 8.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Collections)
├── MainContent
│   ├── ListingLayout
│   │   ├── ContentContainer
│   │   │   ├── Page title (h1)
│   │   │   └── Introductory text
│   │   ├── ContentContainer
│   │   │   └── CollectionGrid
│   │   │       └── CollectionCard (multiple)
│   │   └── PaginationLayout
│   │       └── Pagination
└── SiteFooter
```

### 8.11 Content Requirements

| Content | Source |
|---|---|
| Page title | CMS content |
| Intro text | CMS content |
| Collection cards (image, name, description) | Collection data |

### 8.12 Media Requirements

| Media | Type | Fallback |
|---|---|---|
| Collection card images | Image | Collection name + description |

### 8.13 Responsive Behavior

| Breakpoint | Grid | Pagination |
|---|---|---|
| Desktop | 3-column CollectionGrid | Full pagination |
| Tablet | 2-column CollectionGrid | Full pagination |
| Mobile | 1-column CollectionGrid | Simplified pagination |

### 8.14 Accessibility

Same pattern as Product Catalogue: heading, semantic grid, keyboard navigation, alt text, pagination aria labels.

### 8.15 Loading State

Skeleton grid while collections load.

### 8.16 Error State

`ErrorState` component with retry and Homepage link.

### 8.17 Empty State

"No collections available" message + Homepage link.

### 8.18 Internal Links

CollectionDetail cards, Homepage breadcrumb, QuoteRequest via navigation.

### 8.19 Related Pages

Collection Detail, Product Catalogue.

### 8.20 Analytics Events

| Event | Trigger | Properties |
|---|---|---|
| `page_view` | Page load | `page: "collection_listing"`, `locale` |
| `collection_click` | CollectionCard clicked | `collection_id`, `collection_name`, `position`, `locale` |

### 8.21 Open Decisions

None.

---

## 9. Collection Detail

### 9.1 Purpose

Explore a curated product grouping; discover relevant materials.

### 9.2 Target Audience

Architect, Buyer, Local Customer.

### 9.3 User Intent

"What products are in this collection? Are they relevant to my project?"

### 9.4 Primary Conversion

View Products (within collection)

### 9.5 Secondary Conversion

Request Quote

### 9.6 Route

`/{locale}/collections/{slug}`

### 9.7 Breadcrumb

Home → Collections → Collection Name

### 9.8 SEO Role

High. Self-referencing canonical, localized slug.

### 9.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Breadcrumb | Required | Breadcrumbs |
| 2 | Collection Identity | Required | CollectionHero (h1 = collection name) |
| 3 | Products in Collection | Required | CollectionProducts → ProductCard |
| 4 | Related Applications | Conditional | ApplicationCard links |
| 5 | Quote CTA | Required | QuoteCTA |

### 9.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Collections → Collection)
├── MainContent
│   ├── DetailLayout
│   │   ├── CollectionHero
│   │   │   └── Collection name (h1), description
│   │   ├── ContentContainer
│   │   │   └── CollectionProducts
│   │   │       └── ProductGrid → ProductCard (multiple)
│   │   ├── ContentContainer (Related Applications, conditional)
│   │   │   └── ApplicationCard (multiple)
│   │   └── QuoteCTA
└── SiteFooter
```

### 9.11 Content Requirements

| Content | Source |
|---|---|
| Collection name | Collection data (locale variant) |
| Description | Collection data (localized) |
| Products | ProductCollection junction |
| Related applications | Application relationships (if approved) |

### 9.12 Media Requirements

| Media | Type | Fallback |
|---|---|---|
| Collection hero image | Image | Collection name + description |
| Product card images | Image | Product name + description |

### 9.13 Responsive Behavior

| Breakpoint | Layout | Products |
|---|---|---|
| Desktop | Full-width, hero prominent | 4-column ProductGrid |
| Tablet | Stacked | 2-column ProductGrid |
| Mobile | Single-column | 1–2 column ProductGrid |

### 9.14 Accessibility

Same pattern as Product Detail: heading, semantic grid, keyboard, alt text.

### 9.15 Loading State

Skeleton layout.

### 9.16 Error State

`ErrorState` with retry.

### 9.17 Empty State

"No products in collection" message with link to Product Catalogue.

### 9.18 Internal Links

Product Detail (via ProductCard), Application Detail (related), QuoteRequest.

### 9.19 Related Pages

Product Catalogue, Application Detail.

### 9.20 Analytics Events

| Event | Trigger | Properties |
|---|---|---|
| `page_view` | Page load | `page: "collection_detail"`, `locale`, `collection_id` |
| `product_click` | ProductCard clicked | `product_id`, `collection_id`, `locale` |

### 9.21 Open Decisions

None.

---

## 10. Application Listing

### 10.1 Purpose

Browse material-use contexts.

### 10.2 Target Audience

Architect, Project Company.

### 10.3 User Intent

"I want to explore how marble is used in different contexts."

### 10.4 Primary Conversion

View Application → Application Detail

### 10.5 Secondary Conversion

Request Quote

### 10.6 Route

`/{locale}/applications`

### 10.7 Breadcrumb

Home → Applications

### 10.8 SEO Role

High. Self-referencing canonical, paginated.

### 10.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Page Title & Intro | Required | ContentContainer → h1 + editorial text |
| 2 | Application Grid | Required | ApplicationGrid → ApplicationCard |
| 3 | Pagination | Required | Pagination |

### 10.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Applications)
├── MainContent
│   ├── ListingLayout
│   │   ├── ContentContainer
│   │   │   ├── Page title (h1)
│   │   │   └── Introductory text
│   │   ├── ContentContainer
│   │   │   └── ApplicationGrid
│   │   │       └── ApplicationCard (multiple)
│   │   └── PaginationLayout
│   │       └── Pagination
└── SiteFooter
```

### 10.11 Content Requirements

| Content | Source |
|---|---|
| Page title | CMS content |
| Intro text | CMS content |
| Application cards (image, name, description) | Application data |

### 10.12 Media Requirements

| Media | Type | Fallback |
|---|---|---|
| Application card images | Image | Application name + description |

### 10.13 Responsive Behavior

| Breakpoint | Grid |
|---|---|
| Desktop | 3-column ApplicationGrid |
| Tablet | 2-column ApplicationGrid |
| Mobile | 1-column ApplicationGrid |

### 10.14 Accessibility

Same pattern as Product Catalogue.

### 10.15–10.20

Same patterns as Collection Listing (loading, error, empty, internal links, analytics, open decisions).

---

## 11. Application Detail

### 11.1 Purpose

Connect a material-use context to relevant materials and references.

### 11.2 Target Audience

Architect, Project Company.

### 11.3 User Intent

"What marble materials are suitable for this application?"

### 11.4 Primary Conversion

Explore Suitable Marbles → Product Detail

### 11.5 Secondary Conversion

Request Quote (with application context)

### 11.6 Route

`/{locale}/applications/{slug}`

### 11.7 Breadcrumb

Home → Applications → Application Name

### 11.8 SEO Role

High. Self-referencing canonical, localized slug.

### 11.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Breadcrumb | Required | Breadcrumbs |
| 2 | Application Identity | Required | ApplicationHero (h1 = application name) |
| 3 | Products | Required | ApplicationProducts → ProductCard |
| 4 | Projects | Conditional | ApplicationProjects → ProjectCard |
| 5 | Journal | Conditional | JournalCard links |
| 6 | Quote CTA | Required | QuoteCTA (with application context) |

### 11.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Applications → Application)
├── MainContent
│   ├── DetailLayout
│   │   ├── ApplicationHero
│   │   │   └── Application name (h1), editorial intro
│   │   ├── ContentContainer
│   │   │   └── ApplicationProducts
│   │   │       └── ProductGrid → ProductCard (multiple)
│   │   ├── ContentContainer (Projects, conditional)
│   │   │   └── ApplicationProjects
│   │   │       └── ProjectGrid → ProjectCard (multiple)
│   │   ├── ContentContainer (Journal, conditional)
│   │   │   └── JournalCard (multiple)
│   │   └── QuoteCTA (with application context)
└── SiteFooter
```

### 11.11 Content Requirements

| Content | Source |
|---|---|
| Application name | Application data (locale variant) |
| Editorial introduction | Application data (localized) |
| Products | ProductApplication junction |
| Projects | ProjectApplication junction (conditional on project visibility) |
| Journal | JournalContentReference |

### 11.12 Media Requirements

| Media | Type | Fallback |
|---|---|---|
| Application hero image | Image | Application name + description |
| Product card images | Image | Product name + description |
| Project card images | Image | Project name + description |

### 11.13 Responsive Behavior

| Breakpoint | Layout | Products |
|---|---|---|
| Desktop | Full-width, hero prominent | 4-column ProductGrid |
| Tablet | Stacked | 2-column ProductGrid |
| Mobile | Single-column | 1–2 column ProductGrid |

### 11.14 Accessibility

Same pattern as Product Detail.

### 11.15–11.20

Same patterns as Product Detail (loading, error, empty, internal links, analytics, open decisions).

---

## 12. Project Listing

### 12.1 Purpose

Browse approved reference cases.

### 12.2 Target Audience

Architect, Project Company.

### 12.3 User Intent

"I want to see real projects using this company's marble."

### 12.4 Primary Conversion

View Project → Project Detail

### 12.5 Secondary Conversion

Request Quote

### 12.6 Route

`/{locale}/projects`

### 12.7 Breadcrumb

Home → Projects

### 12.8 SEO Role

Medium. Conditional on project existence. Self-referencing canonical.

### 12.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Page Title & Intro | Required | ContentContainer → h1 + editorial text |
| 2 | Project Grid | Required | ProjectGrid → ProjectCard |
| 3 | Pagination | Required | Pagination |

### 12.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Projects)
├── MainContent
│   ├── ListingLayout
│   │   ├── ContentContainer
│   │   │   ├── Page title (h1)
│   │   │   └── Introductory text
│   │   ├── ContentContainer
│   │   │   └── ProjectGrid
│   │   │       └── ProjectCard (multiple)
│   │   └── PaginationLayout
│   │       └── Pagination
└── SiteFooter
```

### 12.11 Content Requirements

| Content | Source |
|---|---|
| Page title | CMS content |
| Intro text | CMS content |
| Project cards (image, name, description) | Project data |

### 12.12 Content status

**CONTENT REQUIRED** — Project listing content (page title, intro text) must be created before launch. Project data itself is conditional on qualifying projects existing.

### 12.13–12.20

Same patterns as Collection Listing (media, responsive, accessibility, states, links, analytics, open decisions).

---

## 13. Project Detail

### 13.1 Purpose

Present an approved reference case; support trust and material discovery.

### 13.2 Target Audience

Architect, Project Company.

### 13.3 User Intent

"Tell me about this project. What marble was used?"

### 13.4 Primary Conversion

Explore Related Marbles → Product Detail

### 13.5 Secondary Conversion

Request Quote (with project context)

### 13.6 Route

`/{locale}/projects/{slug}`

### 13.7 Breadcrumb

Home → Projects → Project Name

### 13.8 SEO Role

Medium. Conditional on project existence. Self-referencing canonical, localized slug.

### 13.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Breadcrumb | Required | Breadcrumbs |
| 2 | Project Identity | Required | ProjectHero (h1 = project name) |
| 3 | Project Imagery | Conditional | ProjectGallery → ImageGallery |
| 4 | Project Description | Required | ProjectInfo (editorial content) |
| 5 | Related Products | Required | ProductCard links |
| 6 | Related Applications | Conditional | ApplicationCard links |
| 7 | Quote CTA | Required | ProjectQuoteCTA |

### 13.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Projects → Project)
├── MainContent
│   ├── DetailLayout
│   │   ├── ProjectHero
│   │   │   └── Project name (h1), case-study narrative
│   │   ├── ProjectGallery (conditional)
│   │   │   └── ImageGallery
│   │   ├── EditorialLayout
│   │   │   └── ProjectInfo
│   │   ├── ContentContainer
│   │   │   └── ProductGrid → ProductCard (multiple)
│   │   ├── ContentContainer (Related Applications, conditional)
│   │   │   └── ApplicationCard (multiple)
│   │   └── ProjectQuoteCTA
│   │       └── QuoteCTA (with project context)
└── SiteFooter
```

### 13.11 Content Requirements

| Content | Source |
|---|---|
| Project name | Project data (locale variant) |
| Case-study narrative | Project data (localized) |
| Project images | Media assets |
| Related products | ProjectProduct junction |
| Related applications | ProjectApplication junction |

### 13.12 Content status

**CONTENT REQUIRED** — Project data must be created before this page is public. No placeholder or empty projects.

### 13.13 Conditional visibility

- This page is only accessible when at least one qualifying published bilingual project exists.
- If no qualifying projects exist: page is not public, not in navigation, not in sitemap.
- No empty state or placeholder projects.

### 13.14–13.20

Same patterns as Product Detail (media, responsive, accessibility, states, links, analytics, open decisions).

---

## 14. Journal Listing

### 14.1 Purpose

Discover educational and editorial content.

### 14.2 Target Audience

Architect, Buyer.

### 14.3 User Intent

"I want to read about marble, design, architecture."

### 14.4 Primary Conversion

Read Article → Journal Detail

### 14.5 Secondary Conversion

Explore Marbles → Product Catalogue

### 14.6 Route

`/{locale}/journal`

### 14.7 Breadcrumb

Home → Journal

### 14.8 SEO Role

High. Self-referencing canonical, paginated.

### 14.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Breadcrumb | Required | Breadcrumbs |
| 2 | Editorial Introduction | Required | ContentContainer → h1 + editorial text |
| 3 | Article Grid | Required | JournalGrid → JournalCard |
| 4 | Pagination | Required | Pagination |
| 5 | Related Discovery | Optional | Links to Products, Applications |

### 14.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Journal)
├── MainContent
│   ├── ListingLayout
│   │   ├── ContentContainer
│   │   │   ├── Page title (h1)
│   │   │   └── Introductory text
│   │   ├── ContentContainer
│   │   │   └── JournalGrid
│   │   │       └── JournalCard (multiple)
│   │   └── PaginationLayout
│   │       └── Pagination
└── SiteFooter
```

### 14.11 Content Requirements

| Content | Source |
|---|---|
| Page title | CMS content |
| Intro text | CMS content |
| Article cards (image, title, excerpt, date) | Journal data |

### 14.12 Media Requirements

| Media | Type | Fallback |
|---|---|---|
| Article card images | Image | Article title + excerpt |

### 14.13 Responsive Behavior

| Breakpoint | Grid |
|---|---|
| Desktop | 3-column JournalGrid |
| Tablet | 2-column JournalGrid |
| Mobile | 1-column JournalGrid |

### 14.14–14.20

Same patterns as Product Catalogue (accessibility, states, links, analytics, open decisions).

---

## 15. Journal Detail

### 15.1 Purpose

Inform with approved editorial content; connect to relevant materials.

### 15.2 Target Audience

Architect, Buyer.

### 15.3 User Intent

"I want to read this article and find related products."

### 15.4 Primary Conversion

Explore Related Materials → Product Detail

### 15.5 Secondary Conversion

Request Quote (when contextually appropriate)

### 15.6 Route

`/{locale}/journal/{slug}`

### 15.7 Breadcrumb

Home → Journal → Article Title

### 15.8 SEO Role

High. Self-referencing canonical, Article structured data, localized slug.

### 15.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Breadcrumb | Required | Breadcrumbs |
| 2 | Article Title & Metadata | Required | JournalHero + JournalMetadata (h1 = title) |
| 3 | Hero Media | Conditional | ResponsiveImage |
| 4 | Article Content | Required | JournalContent (editorial body) |
| 5 | Related Products | Conditional | ProductCard links |
| 6 | Related Applications | Conditional | ApplicationCard links |
| 7 | Related Projects | Conditional | ProjectCard links |
| 8 | Related Articles | Conditional | RelatedJournalContent |
| 9 | Quote CTA | Conditional | QuoteCTA (when editorially justified) |

### 15.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Journal → Article)
├── MainContent
│   ├── EditorialLayout
│   │   ├── JournalHero
│   │   │   └── Article title (h1)
│   │   ├── JournalMetadata
│   │   │   └── Publication date, author (if approved)
│   │   ├── ResponsiveImage (hero media, conditional)
│   │   ├── JournalContent
│   │   │   └── Editorial body
│   │   ├── ContentContainer (Related Products, conditional)
│   │   │   └── ProductCard (multiple)
│   │   ├── ContentContainer (Related Applications, conditional)
│   │   │   └── ApplicationCard (multiple)
│   │   ├── ContentContainer (Related Projects, conditional)
│   │   │   └── ProjectCard (multiple)
│   │   ├── ContentContainer (Related Articles, conditional)
│   │   │   └── RelatedJournalContent
│   │   └── QuoteCTA (conditional, editorially justified)
└── SiteFooter
```

### 15.11 Content Requirements

| Content | Source |
|---|---|
| Article title | Journal data (locale variant) |
| Publication date | Journal data |
| Author | Journal data (if approved) |
| Hero media | Media assets |
| Editorial body | Journal data (localized) |
| Related products | JournalContentReference |
| Related applications | JournalContentReference |
| Related projects | JournalContentReference (conditional) |
| Related articles | Journal relationships |

### 15.12 Media Requirements

| Media | Type | Fallback |
|---|---|---|
| Hero image | Image | Article title + metadata only |
| Content images | Images | Alt text |

### 15.13 Responsive Behavior

| Breakpoint | Layout | Related Content |
|---|---|---|
| Desktop | Full-width article content, optimal measure | Multi-column grids |
| Tablet | Stacked layout | Adjusted grids |
| Mobile | Single-column stacking | Single-column |

### 15.14 Accessibility

| Requirement | Implementation |
|---|---|
| Heading | h1 = article title; h2 = content sections; proper hierarchy |
| Content | Semantic HTML for editorial content |
| Alt text | All content images: meaningful alt |
| Metadata | Date announced to screen readers |
| Quote CTA | Only when editorially appropriate; not forced |

### 15.15–15.20

Same patterns as Product Detail (states, links, analytics, open decisions).

---

## 16. About

### 16.1 Purpose

Present approved company context and credibility.

### 16.2 Target Audience

Buyer, Project Company.

### 16.3 User Intent

"Who is this company? Can I trust them?"

### 16.4 Primary Conversion

Contact

### 16.5 Secondary Conversion

Request Quote

### 16.6 Route

`/{locale}/about`

### 16.7 Breadcrumb

Home → About

### 16.8 SEO Role

Medium. Self-referencing canonical.

### 16.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Breadcrumb | Required | Breadcrumbs |
| 2 | Company Identity | Required | CompanyIntro (h1 = company name) |
| 3 | Company Story | Required | CompanyStory (editorial narrative) |
| 4 | Quarry & Factory Links | Conditional | Links to Quarry, Factory |
| 5 | Contact Path | Required | CompanyCTA |

### 16.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → About)
├── MainContent
│   ├── EditorialLayout
│   │   ├── CompanyIntro
│   │   │   └── Company name (h1), brand statement
│   │   ├── CompanyStory
│   │   │   └── Approved company narrative
│   │   ├── ContentContainer (Quarry & Factory links, conditional)
│   │   │   └── Links to Quarry, Factory
│   │   └── CompanyCTA
│   │       └── Contact + Request Quote
└── SiteFooter
```

### 16.11 Content Requirements

| Content | Source |
|---|---|
| Company name | Company content |
| Brand statement | Company content |
| Company narrative | Company content |
| Quarry/Factory links | Company content |

### 16.12 Content status

**CONTENT REQUIRED** — Company story, brand statement, and factual company content must be created. No invented history, ownership, team, locations, capacity, certifications, or claims.

### 16.13 Truthfulness constraint

- No invented company history, ownership, team, locations, capacity, certifications, or claims.
- Content must be approved and factual.
- If content is not approved: section is not shown.

### 16.14–16.20

Same patterns as Collection Detail (media, responsive, accessibility, states, links, analytics, open decisions).

---

## 17. Quarry

### 17.1 Purpose

Present approved material-origin story and visual storytelling.

### 17.2 Target Audience

Buyer, Architect.

### 17.3 User Intent

"Where does this marble come from? What is the origin story?"

### 17.4 Primary Conversion

Explore Marbles → Product Catalogue

### 17.5 Secondary Conversion

Request Quote

### 17.6 Route

`/{locale}/quarry`

### 17.7 Breadcrumb

Home → Quarry

### 17.8 SEO Role

Medium. Self-referencing canonical.

### 17.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Breadcrumb | Required | Breadcrumbs |
| 2 | Quarry Identity | Required | QuarryHero (h1 = quarry name) |
| 3 | Origin Story | Required | QuarryInfo + QuarryMedia |
| 4 | Related Products | Conditional | ProductCard links |
| 5 | Quote CTA | Required | QuarryCTA |

### 17.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Quarry)
├── MainContent
│   ├── MediaContentLayout
│   │   ├── QuarryHero
│   │   │   └── Quarry name (h1), origin narrative
│   │   ├── QuarryInfo
│   │   │   └── Approved origin story content
│   │   └── QuarryMedia
│   │       └── Approved quarry images
│   ├── ContentContainer (Related Products, conditional)
│   │   └── ProductCard (multiple)
│   └── QuarryCTA
└── SiteFooter
```

### 17.11 Content Requirements

| Content | Source |
|---|---|
| Quarry name | Company content |
| Origin narrative | Company content |
| Quarry images | Media assets |
| Related products | CompanyContentReference |

### 17.12 Content status

**CONTENT REQUIRED** — Quarry name, origin story, and approved imagery must be created. No invented quarry ownership, reserves, extraction capacity, certifications, or geographic claims.

### 17.13 Truthfulness constraint

- No invented quarry ownership, reserves, extraction capacity, certifications, or geographic claims.
- Content must be approved and factual.
- If content is not approved: section is not shown.

### 17.14–17.20

Same patterns as Product Detail (media, responsive, accessibility, states, links, analytics, open decisions).

---

## 18. Factory

### 18.1 Purpose

Present approved production-story content and visual storytelling.

### 18.2 Target Audience

Buyer, Project Company.

### 18.3 User Intent

"How is this marble processed? What is the production quality?"

### 18.4 Primary Conversion

Explore Marbles → Product Catalogue

### 18.5 Secondary Conversion

Request Quote

### 18.6 Route

`/{locale}/factory`

### 18.7 Breadcrumb

Home → Factory

### 18.8 SEO Role

Medium. Self-referencing canonical.

### 18.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Breadcrumb | Required | Breadcrumbs |
| 2 | Factory Identity | Required | FactoryHero (h1 = factory name) |
| 3 | Production Story | Required | FactoryInfo + FactoryMedia |
| 4 | Related Products | Conditional | ProductCard links |
| 5 | Quote CTA | Required | FactoryCTA |

### 18.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Factory)
├── MainContent
│   ├── MediaContentLayout
│   │   ├── FactoryHero
│   │   │   └── Factory name (h1), production narrative
│   │   ├── FactoryInfo
│   │   │   └── Approved production story content
│   │   └── FactoryMedia
│   │       └── Approved factory images
│   ├── ContentContainer (Related Products, conditional)
│   │   └── ProductCard (multiple)
│   └── FactoryCTA
└── SiteFooter
```

### 18.11 Content Requirements

| Content | Source |
|---|---|
| Factory name | Company content |
| Production narrative | Company content |
| Factory images | Media assets |
| Related products | CompanyContentReference |

### 18.12 Content status

**CONTENT REQUIRED** — Factory name, production story, and approved imagery must be created. No invented machinery inventory, production statistics, or capacity claims. SIMEC / katrak cinematic concept can be represented structurally, but implementation belongs later.

### 18.13 Truthfulness constraint

- No invented machinery inventory, production statistics, certifications, or capacity.
- Content must be approved and factual.
- If content is not approved: section is not shown.

### 18.14–18.20

Same patterns as Product Detail (media, responsive, accessibility, states, links, analytics, open decisions).

---

## 19. Contact

### 19.1 Purpose

Provide general contact route; support enquiries not tied to specific content.

### 19.2 Target Audience

All.

### 19.3 User Intent

"I need to get in touch with this company."

### 19.4 Primary Conversion

Contact (submit form)

### 19.5 Secondary Conversion

Request Quote

### 19.6 Route

`/{locale}/contact`

### 19.7 Breadcrumb

Home → Contact

### 19.8 SEO Role

Medium. Self-referencing canonical.

### 19.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Breadcrumb | Required | Breadcrumbs |
| 2 | Contact Information | Required | Company contact data (h1 = page title) |
| 3 | Contact Form | Conditional (if approved) | ContactForm |
| 4 | Quote Request Link | Required | Link to Quote Request |

### 19.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Contact)
├── MainContent
│   ├── SplitLayout
│   │   ├── Contact info (address, phone, email, hours — if approved)
│   │   └── ContactForm (conditional)
│   │       ├── FormField (Name)
│   │       ├── FormField (Email)
│   │       ├── FormField (Subject)
│   │       ├── FormField (Message)
│   │       ├── ValidationMessage
│   │       └── Submit button
│   └── Link to Quote Request
└── SiteFooter
```

### 19.11 Content Requirements

| Content | Source |
|---|---|
| Contact information | Company content (must be approved) |
| Form fields | Form configuration (content-dependent) |
| Privacy notice | Legal content |

### 19.12 Form specification

**OPEN DECISION** — Exact form fields are content-dependent.

Required behaviors:
- Client-side validation for UX
- Server-side validation is authoritative
- Error messages placed near relevant fields
- Errors announced to screen readers (`aria-live="polite"`)
- Form remains submittable after errors
- Privacy notice accessible before submission (OPEN DECISION — legal text not yet approved)

### 19.13 Success state

- Confirmation message after successful submission
- Clear next-step information
- Do not echo personal data back
- `FormSuccessState` component

### 19.14 Spam protection

OPEN DECISION — Spam protection method to be determined at implementation.

### 19.15 Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop | Two-column (contact info left, form right) |
| Tablet | Stacked (info above, form below) |
| Mobile | Single-column stacking |

### 19.16 Accessibility

| Requirement | Implementation |
|---|---|
| Heading | h1 = page title |
| Form labels | Every input has associated `<label>` |
| Required fields | Visual indicator + `aria-required` |
| Error messages | `aria-describedby` linking error to field |
| Error announcement | `aria-live="polite"` for error summary |
| Privacy notice | Accessible before submission; linked or inline |
| Focus management | Focus on first error field after validation |

### 19.17–19.20

Same patterns as other pages (states, links, analytics, open decisions).

---

## 20. Quote Request

### 20.1 Purpose

Collect a contextual commercial enquiry.

### 20.2 Target Audience

All.

### 20.3 User Intent

"I want to request a quote for a specific product/project/application or in general."

### 20.4 Primary Conversion

Submit Request

### 20.5 Secondary Conversion

None (single-purpose page).

### 20.6 Route

`/{locale}/quote`

### 20.7 Breadcrumb

Home → Request Quote

### 20.8 SEO Role

Low. noindex or limited indexability (form page not valuable for search).

### 20.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Breadcrumb | Required | Breadcrumbs |
| 2 | Context Display | Conditional | QuoteContextSummary |
| 3 | Request Form | Required | QuoteForm |
| 4 | Privacy Notice | Required | Legal content |
| 5 | Submission Button | Required | Submit button |

### 20.10 Component Composition

```
AppShell
├── SiteHeader
├── Breadcrumbs (Home → Request Quote)
├── MainContent
│   ├── ContentContainer
│   │   ├── QuoteContextSummary (conditional)
│   │   │   └── Entity being enquired about (product/project/application)
│   │   ├── QuoteForm
│   │   │   ├── FormField (Name)
│   │   │   ├── FormField (Email)
│   │   │   ├── FormField (Phone, if applicable)
│   │   │   ├── FormField (Company, if applicable)
│   │   │   ├── FormField (Message/Request)
│   │   │   ├── FormField (Privacy acknowledgement checkbox)
│   │   │   ├── ValidationMessage
│   │   │   └── Submit button
│   │   └── Privacy Notice (inline or linked)
└── SiteFooter
```

### 20.11 Content Requirements

| Content | Source |
|---|---|
| Form fields | Form configuration (content-dependent) |
| Context display | URL context parameter (context type + identifier) |
| Privacy notice | Legal content |

### 20.12 Quote Request XOR rule

- General Quote Request: no content context displayed
- Product-context: exactly one Product displayed
- Project-context: exactly one Project displayed
- Application-context: exactly one Application displayed
- Multiple contexts never permitted
- Context validated server-side

### 20.13 Form states

| State | Behavior |
|---|---|
| Loading | Show loading indicator; disable form; announce to screen readers |
| Validation error | Show errors near relevant fields; announce to screen readers; allow correction |
| Success | Show confirmation message; include opaque request reference; do not echo personal data; localized next-step message; `FormSuccessState` |
| Rate limit / spam | Show appropriate error message; allow retry after delay; `FormErrorState` |

### 20.14 Content status

**CONTENT REQUIRED** — Form fields, privacy notice text, and success messages must be created.

### 20.15 Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop | Centered form, clear context display |
| Tablet | Centered form, adjusted layout |
| Mobile | Full-width form, stacked fields |

### 20.16 Accessibility

Same pattern as Contact form: labels, required fields, errors, aria-describedby, privacy notice, focus management.

### 20.17–20.20

Same patterns as other pages (states, links, analytics, open decisions).

---

## 21. 404 / Not Found

### 21.1 Purpose

Recover from unavailable routes; guide visitor to valid content.

### 21.2 Target Audience

All.

### 21.3 User Intent

"This page doesn't exist. Where should I go?"

### 21.4 Primary Conversion

Browse Marbles → Product Catalogue

### 21.5 Secondary Conversion

Homepage, Contact

### 21.6 Route

`/{locale}/404`

### 21.7 Breadcrumb

None.

### 21.8 SEO Role

Low. noindex.

### 21.9 Section Order

| Order | Section | Required/Conditional | Component |
|---|---|---|---|
| 1 | Error Message | Required | NotFound404 (h1 = error message) |
| 2 | Recovery Options | Required | Links to Product Catalogue, Homepage, Contact |

### 21.10 Component Composition

```
AppShell
├── SiteHeader
├── MainContent
│   ├── NotFound404
│   │   ├── Error message (h1)
│   │   └── Recovery links (Browse Marbles, Homepage, Contact)
└── SiteFooter
```

### 21.11 Responsive Behavior

Centered content on all breakpoints.

### 21.12 Accessibility

- h1 = clear error message
- Recovery links with clear labels
- Focus on error message on page load

---

# PART C — GLOBAL COMPONENTS

---

## 22. Global Header

### 22.1 Purpose

Persistent top navigation bar. Contains brand, navigation, language switch, global CTA.

### 22.2 Component Composition

```
SiteHeader
├── BrandLogo → Homepage
├── DesktopNavigation
│   ├── Marbles → /{locale}/marbles
│   ├── Collections → /{locale}/collections
│   ├── Applications → /{locale}/applications
│   ├── Projects → /{locale}/projects (conditional)
│   ├── Journal → /{locale}/journal
│   └── About → /{locale}/about
├── MobileNavigation (hamburger)
│   └── Same items as DesktopNavigation
├── LanguageSwitcher (TR/EN)
└── GlobalCTA (Request Quote → /{locale}/quote)
```

### 22.3 Desktop behavior

- Full horizontal navigation
- Brand left, navigation center/right, language switch + CTA right
- Fixed/sticky on scroll
- Transparent over hero (Homepage), opaque on other pages or on scroll
- Height: `--header-height-desktop: 4.5rem`

### 22.4 Tablet behavior

- Condensed/hamburger navigation
- Height: `--header-height-tablet: 4rem`
- Language switch and CTA remain visible

### 22.5 Mobile behavior

- Hamburger menu
- Full-screen overlay or slide-out panel when open
- Height: `--header-height-mobile: 3.75rem`
- Focus trapped when menu is open
- Escape to close

### 22.6 Navigation visibility rules

| Item | Visible When |
|---|---|
| Projects | Only when at least one qualifying published bilingual project exists |
| All other items | Always |

### 22.7 Accessibility

| Requirement | Implementation |
|---|---|
| Landmark | `<header>` with `role="banner"` |
| Skip-to-content | First focusable element before header |
| Keyboard | Tab through nav items; Enter/Space to activate |
| Focus visible | `--color-accent` outline |
| ARIA labels | `aria-label="Main navigation"`, `aria-label="Language switch"`, `aria-label="Request quote"` |
| Language switch | Announces current language |
| Mobile nav | Focus trapped when open; escape to close |

---

## 23. Global Footer

### 23.1 Purpose

Persistent bottom navigation bar. Contains company links, catalogue links, conversion links, legal links.

### 23.2 Component Composition

```
SiteFooter
├── FooterNavigation
│   ├── FooterCompanyLinks
│   │   ├── About → /{locale}/about
│   │   ├── Quarry → /{locale}/quarry
│   │   ├── Factory → /{locale}/factory
│   │   └── Contact → /{locale}/contact
│   ├── FooterCatalogueLinks
│   │   ├── Marbles → /{locale}/marbles
│   │   ├── Collections → /{locale}/collections
│   │   ├── Applications → /{locale}/applications
│   │   ├── Projects → /{locale}/projects (conditional)
│   │   └── Journal → /{locale}/journal
│   ├── FooterConversionLinks
│   │   └── Request Quote → /{locale}/quote
│   ├── FooterLegalLinks (conditional)
│   │   ├── Privacy Policy (when approved)
│   │   └── Terms (when approved)
│   └── LanguageSwitcher (TR/EN)
└── Copyright notice
```

### 23.3 Content dependencies

- Legal links: Only when legal content is approved (OPEN DECISION)
- Projects link: Only when qualifying projects exist

### 23.4 Truthfulness constraint

- No invented legal pages or company information
- Footer links must point to published, eligible content

### 23.5 Responsive Behavior

| Breakpoint | Layout |
|---|---|
| Desktop | Multi-column footer (4 columns) |
| Tablet | Adjusted columns |
| Mobile | Stacked columns |

### 23.6 Accessibility

| Requirement | Implementation |
|---|---|
| Landmark | `<footer>` with `role="contentinfo"` |
| Keyboard | Tab through all links |
| Focus visible | Visible focus indicator |
| Link labels | Clear, descriptive link text |

---

# PART D — CROSS-CUTTING CONCERNS

---

## 24. Responsive page behavior matrix

### 24.1 Grid behavior

| Page/Region | Desktop (≥1200px) | Tablet (768–1199px) | Mobile (<768px) |
|---|---|---|---|
| Homepage Hero | 100vh, video | 80vh, video | 70vh, fallback image |
| Homepage Sections | Multi-column grids | Adjusted grids | Single-column stacking |
| Product Grid | 4-column | 2-column | 1–2 column |
| Card Grids (Collection, Application, Project, Journal) | 3-column | 2-column | 1-column |
| Product Detail | Two-column (gallery + info) | Stacked | Single-column stacking |
| Related Content | Multi-column grids | Adjusted grids | Single-column stacking |
| Forms | Centered, multi-column fields | Centered, stacked fields | Full-width stacked fields |
| Footer | Multi-column | Adjusted columns | Stacked columns |

### 24.2 Typography behavior

| Context | Desktop | Tablet | Mobile |
|---|---|---|---|
| Display heading | `--text-display` (72px) | Scaled down | Scaled down |
| h1 | `--text-h1` (48px) | Scaled down | Scaled down |
| h2 | `--text-h2` (36px) | Scaled down | Scaled down |
| Body | `--text-body` (16px) | 16px | 16px |
| Navigation | `--text-body-small` (14px) | 14px | 14px |

### 24.3 Spacing behavior

- Section spacing: `--space-9` (96px) between major sections on desktop; `--space-7` (48px) on mobile
- Content padding: `--grid-margin` (48px) on desktop; reduced on mobile
- Card padding: `--space-5` (24px) consistently

### 24.4 Image ratio behavior

- Product cards: consistent aspect ratio across breakpoints
- Hero images: 16:9 across breakpoints
- Gallery images: original ratio with responsive container

### 24.5 Navigation behavior

- Desktop: full horizontal nav
- Tablet: hamburger/condensed
- Mobile: hamburger/overlay with focus trap

### 24.6 CTA behavior

- Desktop: inline buttons
- Tablet: inline buttons
- Mobile: full-width or sticky CTA

---

## 25. Accessibility page matrix

### 25.1 Heading hierarchy per page

| Page | h1 | h2 | h3 |
|---|---|---|---|
| Homepage | Brand/hero heading | Section headings (Featured Products, Collections, etc.) | — |
| Product Catalogue | Page title | — | — |
| Product Detail | Product name | Section headings (Description, Related, etc.) | — |
| Collection Listing | Page title | — | — |
| Collection Detail | Collection name | Section headings | — |
| Application Listing | Page title | — | — |
| Application Detail | Application name | Section headings | — |
| Project Listing | Page title | — | — |
| Project Detail | Project name | Section headings | — |
| Journal Listing | Page title | — | — |
| Journal Detail | Article title | Content sections | Subsections |
| About | Company name | Section headings | — |
| Quarry | Quarry name | Section headings | — |
| Factory | Factory name | Section headings | — |
| Contact | Page title | — | — |
| Quote Request | Page title | — | — |
| 404 | Error message | — | — |

### 25.2 Landmark structure per page

| Page | `<header>` | `<nav>` | `<main>` | `<footer>` | Breadcrumbs `<nav>` |
|---|---|---|---|---|---|
| Homepage | Yes | Yes | Yes | Yes | No |
| All other pages | Yes | Yes | Yes | Yes | Yes |

### 25.3 Keyboard navigation per page

| Page | Special keyboard requirements |
|---|---|
| Homepage | Hero CTA focusable; section links focusable |
| Product Catalogue | Card grid keyboard navigation; pagination keyboard |
| Product Detail | Gallery keyboard navigation; lightbox focus trap |
| Collection Detail | Product grid keyboard navigation |
| Application Detail | Product grid keyboard navigation |
| Project Detail | Gallery keyboard navigation (if gallery exists) |
| Journal Detail | Content reading order |
| Contact | Form keyboard navigation; error focus management |
| Quote Request | Form keyboard navigation; error focus management; context announcement |

### 25.4 Focus management per page

| Page | Focus behavior |
|---|---|
| All pages | Skip-to-content link as first focusable element |
| Product Detail | Focus on gallery when navigating |
| Contact | Focus on first error field after validation |
| Quote Request | Focus on first error field after validation; focus on success message |
| 404 | Focus on error message |

### 25.5 Reduced motion per page

| Page | Reduced motion behavior |
|---|---|
| Homepage | HeroVideo → VideoFallback (static image) |
| All pages | No carousel animation; no page transitions; skeleton pulse animation only |

---

## 26. SEO page matrix

### 26.1 SEO metadata per page

| Page | URL | Title pattern | Meta description pattern | H1 | Canonical | Hreflang | Structured data |
|---|---|---|---|---|---|---|---|
| Homepage | `/{locale}/` | `{Brand} — Premium Turkish Marble` | Approved brand statement | Brand/hero heading | Self-referencing | Reciprocal TR/EN | Organization, WebSite |
| Product Catalogue | `/{locale}/marbles` | `Marble Collection — {Brand}` | Approved intro text | Page title | Self-referencing | Reciprocal TR/EN | ItemList |
| Product Detail | `/{locale}/marbles/{slug}` | `{Product Name} — Premium Turkish Marble — {Brand}` | Approved product description | Product name | Self-referencing | Reciprocal TR/EN | Product |
| Collection Listing | `/{locale}/collections` | `Collections — {Brand}` | Approved intro text | Page title | Self-referencing | Reciprocal TR/EN | — |
| Collection Detail | `/{locale}/collections/{slug}` | `{Collection Name} — {Brand}` | Approved description | Collection name | Self-referencing | Reciprocal TR/EN | — |
| Application Listing | `/{locale}/applications` | `Applications — {Brand}` | Approved intro text | Page title | Self-referencing | Reciprocal TR/EN | — |
| Application Detail | `/{locale}/applications/{slug}` | `{Application Name} — {Brand}` | Approved description | Application name | Self-referencing | Reciprocal TR/EN | — |
| Project Listing | `/{locale}/projects` | `Projects — {Brand}` | Approved intro text | Page title | Self-referencing | Reciprocal TR/EN | — |
| Project Detail | `/{locale}/projects/{slug}` | `{Project Name} — {Brand}` | Approved description | Project name | Self-referencing | Reciprocal TR/EN | — |
| Journal Listing | `/{locale}/journal` | `Journal — {Brand}` | Approved intro text | Page title | Self-referencing | Reciprocal TR/EN | — |
| Journal Detail | `/{locale}/journal/{slug}` | `{Article Title} — {Brand}` | Approved excerpt | Article title | Self-referencing | Reciprocal TR/EN | Article |
| About | `/{locale}/about` | `About — {Brand}` | Approved statement | Company name | Self-referencing | Reciprocal TR/EN | — |
| Quarry | `/{locale}/quarry` | `Quarry — {Brand}` | Approved origin story | Quarry name | Self-referencing | Reciprocal TR/EN | — |
| Factory | `/{locale}/factory` | `Factory — {Brand}` | Approved production story | Factory name | Self-referencing | Reciprocal TR/EN | — |
| Contact | `/{locale}/contact` | `Contact — {Brand}` | Approved contact description | Page title | Self-referencing | Reciprocal TR/EN | — |
| Quote Request | `/{locale}/quote` | — | — | Page title | Self-referencing | Reciprocal TR/EN | — |
| 404 | `/{locale}/404` | — | — | Error message | noindex | — | — |

### 26.2 Image alt strategy

| Context | Alt text strategy |
|---|---|
| Product images | Meaningful description of material (e.g., "Beyaz Mermer — white marble with grey veining") |
| Collection images | Collection name + brief visual description |
| Application images | Application context + visual description |
| Project images | Project name + visual context |
| Journal images | Article-relevant description |
| Decorative images | Empty alt (`alt=""`) |

### 26.3 Internal linking per page (SEO)

| Page | Internal links out |
|---|---|
| Homepage | All primary nav items, featured content |
| Product Catalogue | Product details, Collections, Applications |
| Product Detail | Collections, Applications, Projects, Journal, Related Products |
| Collection Detail | Products, Applications |
| Application Detail | Products, Projects, Journal |
| Project Detail | Products, Applications |
| Journal Listing | Article details |
| Journal Detail | Products, Applications, Projects, Related Articles |
| About | Quarry, Factory, Contact |
| Quarry | Products, Contact |
| Factory | Products, Contact |
| Contact | Quote Request |
| Quote Request | Originating content (if contextual) |

---

## 27. Conversion page matrix

### 27.1 Conversion points per page

| Page | Primary conversion | Secondary conversion | Contextual conversion | Conversion component |
|---|---|---|---|---|
| Homepage | Explore Marbles | Request Quote | — | QuoteCTA (general) |
| Product Catalogue | View Product | — | — | — |
| Product Detail | Request Quote | Contact | Request Quote (product context) | ProductQuoteCTA |
| Collection Listing | View Collection | — | — | — |
| Collection Detail | View Products | Request Quote | — | QuoteCTA (general) |
| Application Listing | View Application | — | — | — |
| Application Detail | Explore Marbles | Request Quote | Request Quote (application context) | QuoteCTA (application context) |
| Project Listing | View Project | — | — | — |
| Project Detail | Explore Related Marbles | Request Quote | Request Quote (project context) | ProjectQuoteCTA |
| Journal Listing | Read Article | — | — | — |
| Journal Detail | Explore Related Materials | Request Quote (when appropriate) | — | QuoteCTA (general, conditional) |
| About | Contact | Request Quote | — | CompanyCTA |
| Quarry | Explore Marbles | Request Quote | — | QuarryCTA |
| Factory | Explore Marbles | Request Quote | — | FactoryCTA |
| Contact | Contact (submit) | Request Quote | — | ContactForm |
| Quote Request | Submit Request | — | — | QuoteForm |

### 27.2 CTA design rules

- Primary CTA: `--button-variant-primary`, visually dominant
- Secondary CTA: `--button-variant-secondary`, available but not competing
- Contextual CTA: carries context parameter to Quote Request
- Maximum 2–3 CTAs per page section
- Quote Request and Contact must not compete unnecessarily

---

## 28. States page matrix

### 28.1 Loading states per page

| Page | Loading behavior | Component |
|---|---|---|
| Homepage | Skeleton sections | LoadingState |
| Product Catalogue | Skeleton grid | LoadingState |
| Product Detail | Skeleton layout | LoadingState |
| Collection Listing | Skeleton grid | LoadingState |
| Collection Detail | Skeleton layout | LoadingState |
| Application Listing | Skeleton grid | LoadingState |
| Application Detail | Skeleton layout | LoadingState |
| Project Listing | Skeleton grid | LoadingState |
| Project Detail | Skeleton layout | LoadingState |
| Journal Listing | Skeleton grid | LoadingState |
| Journal Detail | Skeleton layout | LoadingState |
| Contact | Form ready immediately | — |
| Quote Request | Form ready immediately | — |

### 28.2 Empty states per page

| Page | Empty behavior | Component |
|---|---|---|
| Homepage | N/A (always has structural content; sections hidden if no data) | — |
| Product Catalogue | "No products available" + Homepage link | EmptyState |
| Product Detail | N/A (page exists only if product exists) | — |
| Collection Listing | "No collections available" + Homepage link | EmptyState |
| Collection Detail | "No products in collection" + Product Catalogue link | EmptyState |
| Application Listing | "No applications available" + Homepage link | EmptyState |
| Application Detail | "No products available" + Homepage link | EmptyState |
| Project Listing | "No projects available" + Homepage link | EmptyState |
| Project Detail | N/A (conditional visibility) | — |
| Journal Listing | "No articles available" + Homepage link | EmptyState |
| Journal Detail | N/A (page exists only if article exists) | — |

### 28.3 Error states per page

| Page | Error behavior | Component |
|---|---|---|
| All pages | Error message + retry + Homepage link | ErrorState |
| Product Detail | Error + retry + Product Catalogue link | ErrorState |
| Collection Detail | Error + retry + Collection Listing link | ErrorState |
| Application Detail | Error + retry + Application Listing link | ErrorState |
| Project Detail | Error + retry + Project Listing link | ErrorState |
| Journal Detail | Error + retry + Journal Listing link | ErrorState |

### 28.4 Unpublished states per page

| Page | Behavior |
|---|---|
| Any detail page | `UnpublishedState` → redirect to 404/410/301 (per SEO outcome) |
| Any page with missing language variant | `MissingLanguageState` → show available language, disable switch indicator |

### 28.5 Missing media states per page

| Page | Behavior | Component |
|---|---|---|
| Product Detail | Product name + description, no image | MissingMediaState |
| Project Detail | Project name + description, no image | MissingMediaState |
| Journal Detail | Article title + metadata, no hero image | MissingMediaState |
| Any card | Card name + description, no image | MissingMediaState |

---

## 29. Internal linking matrix

### 29.1 Semantic link graph per page

| Page | Links to | Link type |
|---|---|---|
| Homepage | Product Catalogue, Collection Detail, Application Detail, Project Detail, Journal Detail, Quarry, Factory, Quote Request | Primary/Secondary CTAs, card links |
| Product Catalogue | Product Detail, Homepage, Collections, Applications | Card links, breadcrumb, related |
| Product Detail | Product Catalogue, Collection Detail, Application Detail, Project Detail, Journal Detail, Product Detail (related), Quote Request | Breadcrumb, related content, conversion |
| Collection Listing | Collection Detail, Homepage | Card links, breadcrumb |
| Collection Detail | Product Catalogue, Product Detail, Application Detail, Quote Request | Product links, related, conversion |
| Application Listing | Application Detail, Homepage | Card links, breadcrumb |
| Application Detail | Product Catalogue, Product Detail, Project Detail, Journal Detail, Quote Request | Product links, related, conversion |
| Project Listing | Project Detail, Homepage | Card links, breadcrumb |
| Project Detail | Product Catalogue, Product Detail, Application Detail, Quote Request | Product links, related, conversion |
| Journal Listing | Journal Detail, Homepage | Card links, breadcrumb |
| Journal Detail | Product Catalogue, Product Detail, Application Detail, Project Detail, Journal Detail (related), Quote Request | Related content, conversion |
| About | Quarry, Factory, Contact, Quote Request | Links, conversion |
| Quarry | Product Catalogue, Product Detail, Quote Request | Product links, conversion |
| Factory | Product Catalogue, Product Detail, Quote Request | Product links, conversion |
| Contact | Quote Request | Conversion link |
| Quote Request | Originating content (if contextual) | Back link |

### 29.2 Breadcrumb rules

| Page | Breadcrumb |
|---|---|
| Homepage | None |
| All listing pages | Home → {Section} |
| All detail pages | Home → {Section} → {Item Name} |

### 29.3 Conversion link rules

- Every detail page has a Quote CTA (general or contextual)
- Navigation always includes Request Quote CTA
- Footer always includes Request Quote link
- Contact page links to Quote Request
- Quote Request links back to originating content (if contextual)

---

## 30. Analytics event specification

### 30.1 Event taxonomy

| Event Name | Trigger | Properties |
|---|---|---|
| `page_view` | Page load | `page`, `locale`, `url`, `page_number` (if paginated) |
| `hero_video_start` | Video begins playing | `locale` |
| `hero_video_complete` | Video finishes | `locale`, `duration` |
| `hero_fallback_shown` | Fallback displayed | `reason`, `locale` |
| `section_view` | Section enters viewport | `section_name`, `locale` |
| `product_view` | Product Detail page viewed | `product_id`, `product_name`, `locale` |
| `product_click` | ProductCard clicked | `product_id`, `product_name`, `position`, `source_page`, `locale` |
| `collection_view` | Collection Detail page viewed | `collection_id`, `collection_name`, `locale` |
| `collection_click` | CollectionCard clicked | `collection_id`, `collection_name`, `position`, `locale` |
| `application_view` | Application Detail page viewed | `application_id`, `application_name`, `locale` |
| `application_click` | ApplicationCard clicked | `application_id`, `application_name`, `position`, `locale` |
| `project_view` | Project Detail page viewed | `project_id`, `project_name`, `locale` |
| `project_click` | ProjectCard clicked | `project_id`, `project_name`, `position`, `locale` |
| `journal_view` | Journal Detail page viewed | `article_id`, `article_title`, `locale` |
| `journal_click` | JournalCard clicked | `article_id`, `article_title`, `position`, `locale` |
| `inquiry_start` | QuoteCTA clicked | `context_type`, `context_id`, `locale` |
| `inquiry_submit` | Quote form submitted | `context_type`, `context_id`, `locale`, `success` |
| `contact_submit` | Contact form submitted | `locale`, `success` |
| `product_filter` | Filter applied (if implemented) | `filter_type`, `filter_value`, `locale` |
| `language_switch` | LanguageSwitcher clicked | `from_locale`, `to_locale` |
| `pagination_click` | Page number clicked | `page_number`, `source_page`, `locale` |
| `cta_click` | CTA clicked | `cta_type`, `target`, `locale` |
| `error` | Error occurs | `error_type`, `page`, `locale` |

### 30.2 Event implementation boundary

- Analytics events are specifications only; implementation belongs to development
- No analytics library is specified; choice belongs to implementation
- Events must not include personal data without consent
- Events must comply with privacy regulations

---

# PART E — OPEN DECISIONS

---

## 31. Open decisions

### 31.1 Carried from previous documents

| # | Decision | Source | Why it matters | Required input | Impact |
|---|---|---|---|---|---|
| 1 | **Content Owner identity** | `02_DOMAIN_MODEL.md` | The real named individual must be confirmed before company-specific content (About, Quarry, Factory) is published | Named individual confirmation | Affects About, Quarry, Factory page content |
| 2 | **Project launch content** | `01_MASTER_INFORMATION_ARCHITECTURE.md` | Whether at least one qualifying approved bilingual Project exists at launch determines whether Project sections appear | At least one qualifying project | Affects Project listing/detail visibility, navigation, Homepage section |
| 3 | **Featured Homepage content** | `08_PAGE_WIREFRAMES.md` | Which specific products, collections, applications, projects, articles are featured is an editorial decision | Editorial selection | Affects Homepage content sections |
| 4 | **Exact form fields** | `05_CMS_CONTRACT.md` | Contact and Quote Request form fields are content-dependent; exact configuration belongs to implementation | Form field configuration | Affects Contact and Quote Request pages |
| 5 | **Legal/privacy text** | `05_CMS_CONTRACT.md` | Privacy notice and legal content for forms must be approved before production data collection | Approved legal text | Affects Contact and Quote Request forms |
| 6 | **Homepage section ordering** | `08_PAGE_WIREFRAMES.md` | Final section ordering may be adjusted editorially within the approved architecture | Editorial decision | Affects Homepage layout |
| 7 | **Font loading strategy** | `10_DESIGN_SYSTEM.md` | Self-hosted vs CDN is an implementation decision | Implementation decision | Affects performance, privacy |
| 8 | **Icon set final selection** | `10_DESIGN_SYSTEM.md` | Lucide Icons is recommended; final selection belongs to implementation | Implementation decision | Affects icon rendering |
| 9 | **Default locale for root redirect** | `06_SEO_URL_ARCHITECTURE.md` | Root URL (`/`) performs language detection; default locale affects root URL indexing | Decision: `/tr/`, `/en/`, or detection | Affects SEO, crawl budget |
| 10 | **Scroll indicator on hero** | `08_PAGE_WIREFRAMES.md` | Whether a scroll-down indicator appears on the hero | Editorial/design decision | Affects hero UX |
| 11 | **Spam protection method** | This document | Contact and Quote Request forms need spam protection | Implementation decision | Affects form security |
| 12 | **Exact form field configuration** | This document | Form fields belong to implementation; spec defines required behaviors only | Implementation decision | Affects Contact and Quote Request |

### 31.2 Page-specification blocking

None. All pages can be implemented with approved V1 behavior without choosing unresolved company facts or implementation technology.

---

# PART F — MATRICES

---

## 32. Page → Component matrix

| Page | AppShell | SiteHeader | Breadcrumbs | MainContent | Content Components | Media Components | Conversion Components | State Components | SiteFooter |
|---|---|---|---|---|---|---|---|---|---|
| Homepage | ✓ | ✓ | — | ✓ | ProductGrid, ProductCard, CollectionGrid, CollectionCard, ApplicationGrid, ApplicationCard, QuarryHero, FactoryHero, ProjectGrid, ProjectCard, JournalGrid, JournalCard | HeroVideo, VideoFallback, PosterImage, ResponsiveImage | QuoteCTA | LoadingState, ErrorState | ✓ |
| Product Catalogue | ✓ | ✓ | ✓ | ✓ | ProductGrid, ProductCard | ResponsiveImage | — | LoadingState, EmptyState, ErrorState | ✓ |
| Product Detail | ✓ | ✓ | ✓ | ✓ | ProductHero, ProductInfo, ProductQuoteCTA, CollectionCard, ApplicationCard, ProjectCard, JournalCard, ProductCard | ProductGallery, ImageGallery, GalleryViewer, ResponsiveImage | ProductQuoteCTA | LoadingState, ErrorState, MissingLanguageState, MissingMediaState | ✓ |
| Collection Listing | ✓ | ✓ | ✓ | ✓ | CollectionGrid, CollectionCard | ResponsiveImage | — | LoadingState, EmptyState, ErrorState | ✓ |
| Collection Detail | ✓ | ✓ | ✓ | ✓ | CollectionHero, CollectionProducts, ProductCard, ApplicationCard | ResponsiveImage | QuoteCTA | LoadingState, EmptyState, ErrorState | ✓ |
| Application Listing | ✓ | ✓ | ✓ | ✓ | ApplicationGrid, ApplicationCard | ResponsiveImage | — | LoadingState, EmptyState, ErrorState | ✓ |
| Application Detail | ✓ | ✓ | ✓ | ✓ | ApplicationHero, ApplicationProducts, ProductCard, ApplicationProjects, ProjectCard, JournalCard | ResponsiveImage | QuoteCTA | LoadingState, EmptyState, ErrorState | ✓ |
| Project Listing | ✓ | ✓ | ✓ | ✓ | ProjectGrid, ProjectCard | ResponsiveImage | — | LoadingState, EmptyState, ErrorState | ✓ |
| Project Detail | ✓ | ✓ | ✓ | ✓ | ProjectHero, ProjectInfo, ProductCard, ApplicationCard | ProjectGallery, ImageGallery, ResponsiveImage | ProjectQuoteCTA | LoadingState, ErrorState, MissingLanguageState, MissingMediaState | ✓ |
| Journal Listing | ✓ | ✓ | ✓ | ✓ | JournalGrid, JournalCard | ResponsiveImage | — | LoadingState, EmptyState, ErrorState | ✓ |
| Journal Detail | ✓ | ✓ | ✓ | ✓ | JournalHero, JournalMetadata, JournalContent, ProductCard, ApplicationCard, ProjectCard, RelatedJournalContent | ResponsiveImage | QuoteCTA (conditional) | LoadingState, ErrorState, MissingLanguageState, MissingMediaState | ✓ |
| About | ✓ | ✓ | ✓ | ✓ | CompanyIntro, CompanyStory, CompanyCTA | ResponsiveImage | CompanyCTA | LoadingState, ErrorState | ✓ |
| Quarry | ✓ | ✓ | ✓ | ✓ | QuarryHero, QuarryInfo, QuarryMedia, ProductCard, QuarryCTA | ResponsiveImage | QuarryCTA | LoadingState, ErrorState | ✓ |
| Factory | ✓ | ✓ | ✓ | ✓ | FactoryHero, FactoryInfo, FactoryMedia, ProductCard, FactoryCTA | ResponsiveImage | FactoryCTA | LoadingState, ErrorState | ✓ |
| Contact | ✓ | ✓ | ✓ | ✓ | ContactForm, FormField, ValidationMessage | — | ContactForm | ErrorState | ✓ |
| Quote Request | ✓ | ✓ | ✓ | ✓ | QuoteContextSummary, QuoteForm, FormField, ValidationMessage | ResponsiveImage (context) | QuoteForm | FormSuccessState, FormErrorState, ErrorState | ✓ |
| 404 | ✓ | ✓ | — | ✓ | NotFound404 | — | — | — | ✓ |

---

## 33. Page → Design Token matrix

| Page | Typography | Colors | Spacing | Layout/Grid | Radius | Shadow | Motion | Media |
|---|---|---|---|---|---|---|---|---|
| Homepage | Display, H1, H2, H4, Body, Button | `--color-bg-primary`, `--color-bg-dark`, `--color-text-inverse`, `--color-accent` | `--space-7`–`--space-9` sections | 12-col, container-lg | `--radius-none` | `--shadow-none` | `--duration-slower` (hero) | Hero video, responsive images |
| Product Catalogue | H1, H4, Body, Caption | `--color-bg-primary`, `--color-text-primary` | `--space-5` cards, `--space-7` sections | 12-col, 4/2/1-col grid | `--radius-none` | `--shadow-none` | `--duration-fast` (hover) | Product images |
| Product Detail | H1, H2, H4, Body, Caption, Button | `--color-bg-white`, `--color-text-primary`, `--color-accent` | `--space-5` gallery, `--space-7` sections | SplitLayout, 12-col | `--radius-none` | `--shadow-none` | `--duration-fast` (hover), `--duration-normal` (gallery) | Product gallery, responsive images |
| Collection Detail | H1, H2, H4, Body, Button | `--color-bg-primary`, `--color-text-primary` | `--space-5` cards, `--space-7` sections | 12-col, 4/2/1-col grid | `--radius-none` | `--shadow-none` | `--duration-fast` (hover) | Collection images |
| Application Detail | H1, H2, H4, Body, Button | `--color-bg-primary`, `--color-text-primary` | `--space-5` cards, `--space-7` sections | 12-col, 4/2/1-col grid | `--radius-none` | `--shadow-none` | `--duration-fast` (hover) | Application images |
| Project Detail | H1, H2, H4, Body, Button | `--color-bg-white`, `--color-text-primary` | `--space-5` gallery, `--space-7` sections | SplitLayout, 12-col | `--radius-none` | `--shadow-none` | `--duration-fast` (hover) | Project gallery |
| Journal Listing | H1, H4, Body, Caption | `--color-bg-primary`, `--color-text-primary` | `--space-5` cards, `--space-7` sections | 12-col, 3/2/1-col grid | `--radius-none` | `--shadow-none` | `--duration-fast` (hover) | Article images |
| Journal Detail | H1, H2, H3, Body, Caption | `--color-bg-white`, `--color-text-primary` | `--space-5` content, `--space-7` sections | EditorialLayout, text-measure | `--radius-none` | `--shadow-none` | — | Article images |
| About | H1, H2, Body, Button | `--color-bg-primary`, `--color-text-primary` | `--space-7` sections | EditorialLayout | `--radius-none` | `--shadow-none` | — | Company images |
| Quarry | H1, H2, Body, Button | `--color-bg-primary`, `--color-text-primary` | `--space-7` sections | MediaContentLayout | `--radius-none` | `--shadow-none` | — | Quarry images |
| Factory | H1, H2, Body, Button | `--color-bg-primary`, `--color-text-primary` | `--space-7` sections | MediaContentLayout | `--radius-none` | `--shadow-none` | — | Factory images |
| Contact | H1, Body, Label, Button | `--color-bg-white`, `--color-text-primary`, `--color-border-medium` | `--space-4` fields, `--space-7` sections | SplitLayout | `--radius-sm` (forms) | `--shadow-none` | `--duration-fast` | — |
| Quote Request | H1, Body, Label, Button | `--color-bg-white`, `--color-text-primary`, `--color-border-medium` | `--space-4` fields, `--space-7` sections | ContentContainer | `--radius-sm` (forms) | `--shadow-none` | `--duration-fast` | Context images |
| 404 | H1, Body, Button | `--color-bg-primary`, `--color-text-primary` | `--space-7` | ContentContainer | `--radius-none` | `--shadow-none` | — | — |

---

# PART G — AUDIT

---

## 34. Final consistency audit

### 34.1 Against 00_PROJECT_RULES.md

| Check | Result |
|---|---|
| Truthfulness | PASS — No invented company claims, certificates, capacity, or projects; all content-dependent sections render only approved content |
| Bilingual scope | PASS — All pages require TR/EN; LanguageSwitcher on all pages |
| Lifecycle | PASS — States mapped to page behavior (loading, empty, error, unpublished) |
| V1 scope | PASS — No advanced features (search, filters, comparison, commerce, accounts) |
| Accessibility | PASS — Heading hierarchy, keyboard navigation, form accessibility, media fallback, reduced motion |
| Hero fallback | PASS — 7 states defined per `09_COMPONENT_TREE.md` |
| Quote Request | PASS — XOR rule preserved; general or exactly one context |
| Governance | PASS — Content sections depend on approved CMS content |

### 34.2 Against 01_MASTER_INFORMATION_ARCHITECTURE.md

| Check | Result |
|---|---|
| Page inventory | PASS — All 15+ mandatory public pages covered with routes |
| User journeys | PASS — All four user journeys supported by page specifications |
| Navigation | PASS — Primary nav matches approved structure; Projects conditional |
| Content hierarchy | PASS — Page section hierarchy matches approved content hierarchy |
| Product discovery | PASS — Catalogue supports 100+ products, alphabetical browsing, pagination |
| Conversion | PASS — Request Quote and Contact as primary/secondary CTAs |
| Project visibility | PASS — Project pages conditional on qualifying content |

### 34.3 Against 02_DOMAIN_MODEL.md

| Check | Result |
|---|---|
| Entity relationships | PASS — Page sections mirror approved domain relationships |
| Language variants | PASS — LanguageSwitcher targets equivalent variant |
| Lifecycle states | PASS — Page states mapped to lifecycle states |
| Quote Request | PASS — XOR context rule preserved |

### 34.4 Against 03_DATABASE_ER.md

| Check | Result |
|---|---|
| Data dependencies | PASS — Page sections reference approved junction entities |
| Media relationships | PASS — Gallery and imagery sections reference ContentMedia |
| Slug uniqueness | PASS — URL patterns use localized slugs |

### 34.5 Against 04_API_CONTRACT.md

| Check | Result |
|---|---|
| Public endpoints | PASS — Page sections correspond to public API resources |
| Locale handling | PASS — Pages require locale; no implicit fallback |
| Publication gate | PASS — Content sections depend on published, eligible content |
| Pagination | PASS — Catalogue and listing pages include pagination |

### 34.6 Against 05_CMS_CONTRACT.md

| Check | Result |
|---|---|
| Content management | PASS — All page sections are CMS-manageable |
| Lifecycle | PASS — Page states align with CMS lifecycle management |
| Revision/approval | PASS — Content sections depend on approved content |
| Media | PASS — Gallery and imagery depend on rights-verified media |
| Quote Request | PASS — Form and context management aligns with CMS capabilities |

### 34.7 Against 06_SEO_URL_ARCHITECTURE.md

| Check | Result |
|---|---|
| URL patterns | PASS — All page routes match SEO URL architecture matrix |
| Canonical | PASS — Self-referencing canonicals defined for all indexable pages |
| Hreflang | PASS — Reciprocal TR/EN hreflang defined |
| Indexability | PASS — Indexable pages match SEO indexability matrix |
| Sitemap | PASS — All indexable pages included in sitemap architecture |

### 34.8 Against 07_INTERNAL_LINK_GRAPH.md

| Check | Result |
|---|---|
| Internal links | PASS — Contextual links match approved link graph |
| Breadcrumbs | PASS — Breadcrumb hierarchy matches link graph architecture |
| Conversion links | PASS — Conversion paths match link graph conversion architecture |
| Navigation | PASS — Navigation links match link graph navigation section |

### 34.9 Against 08_PAGE_WIREFRAMES.md

| Check | Result |
|---|---|
| Section order | PASS — Page section orders match wireframe structural orders |
| CTA placement | PASS — CTA hierarchy and placement match wireframe CTA architecture |
| Responsive behavior | PASS — Responsive behavior matches wireframe responsive matrix |
| Accessibility | PASS — Accessibility requirements match wireframe accessibility structure |
| States | PASS — States match wireframe states matrix |
| Content dependencies | PASS — Content requirements match wireframe content dependencies |

### 34.10 Against 09_COMPONENT_TREE.md

| Check | Result |
|---|---|
| Component usage | PASS — All component compositions match page → component matrix |
| Component responsibility | PASS — Components used within their defined responsibility |
| State components | PASS — State components match wireframe states |
| Conversion components | PASS — Conversion components match wireframe conversion architecture |
| Media components | PASS — Media components match wireframe media requirements |
| Navigation components | PASS — Navigation components match wireframe navigation behavior |

### 34.11 Against 10_DESIGN_SYSTEM.md

| Check | Result |
|---|---|
| Typography tokens | PASS — All typography references use defined tokens |
| Color tokens | PASS — All color references use defined tokens |
| Spacing tokens | PASS — All spacing references use defined tokens |
| Layout tokens | PASS — All layout references use defined tokens |
| Button variants | PASS — All button references use defined variants |
| Form styling | PASS — All form references use defined tokens |
| Motion tokens | PASS — All motion references use defined tokens |
| Responsive tokens | PASS — All breakpoint references use defined tokens |
| Accessibility tokens | PASS — All accessibility references use defined tokens |
| Anti-patterns | PASS — No anti-patterns from design system present |

---

## 35. PAGE SPECIFICATION AUDIT

| Check | Result |
|---|---|
| All pages from IA covered | PASS — 17 page types defined |
| All page routes consistent with SEO URLs | PASS — Routes match `06_SEO_URL_ARCHITECTURE.md` |
| All component compositions consistent with component tree | PASS — Compositions match `09_COMPONENT_TREE.md` page → component matrix |
| All design token references consistent with design system | PASS — Tokens match `10_DESIGN_SYSTEM.md` |
| All section orders consistent with wireframes | PASS — Orders match `08_PAGE_WIREFRAMES.md` |
| All state behaviors defined | PASS — Loading, empty, error, unpublished, missing language, missing media |
| All conversion points defined | PASS — Primary, secondary, contextual CTAs per page |
| All accessibility requirements defined | PASS — Heading, landmark, keyboard, focus, forms, media, reduced motion |
| All SEO requirements defined | PASS — Title, meta description, canonical, hreflang, structured data, alt text |
| All internal links defined | PASS — Semantic link graph per page |
| All analytics events defined | PASS — Event taxonomy with properties |
| All open decisions documented | PASS — 12 open decisions carried forward |
| No invented company data | PASS — Content-dependent sections marked CONTENT REQUIRED where needed |
| No new components invented | PASS — All components from `09_COMPONENT_TREE.md` only |
| No new design tokens invented | PASS — All tokens from `10_DESIGN_SYSTEM.md` only |
| No new routes invented | PASS — All routes from `06_SEO_URL_ARCHITECTURE.md` only |
| Truthfulness constraint preserved | PASS — No invented claims, certificates, capacity, or projects |

---

## 36. STATUS

**READY FOR IMPLEMENTATION — WITH OPEN DECISIONS**

---

## 37. Critical OPEN DECISIONS

1. **Content Owner identity** — Must be confirmed before production.
2. **Project launch content** — Affects conditional Project component rendering.
3. **Featured Homepage content** — Editorial decision, not page specification.
4. **Exact form fields** — Content-dependent, belongs to implementation.
5. **Legal/privacy text** — Must be approved before form data collection.
6. **Homepage section ordering** — Editorial adjustment allowed.
7. **Font loading strategy** — Self-hosted vs CDN (implementation).
8. **Icon set final selection** — Lucide recommended (implementation).
9. **Default locale for root redirect** — Affects SEO crawl budget.
10. **Scroll indicator on hero** — Editorial/design decision.
11. **Spam protection method** — Implementation decision.
12. **Exact form field configuration** — Belongs to implementation.
