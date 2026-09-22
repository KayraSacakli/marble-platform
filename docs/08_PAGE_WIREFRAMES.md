# Page Wireframes Architecture

## 1. Purpose

This document defines the structural wireframes of the public website: page hierarchy, section order, content priority, CTA placement, navigation, contextual links, conversion points, responsive structural behavior, accessibility considerations, and content dependencies.

It is not visual UI design. It answers: What information appears where, in what order, and why?

---

## 2. Scope

Covers all approved public page types from `01_MASTER_INFORMATION_ARCHITECTURE.md` page inventory. Does not define colors, typography, spacing, CSS, components, animations, design tokens, or code architecture.

---

## 3. Page priority matrix

| Page | Business Importance | User Journey Role | SEO Importance | Primary CTA |
|---|---|---|---|---|
| Homepage | Critical | Orientation, discovery, trust | High | Explore Marbles |
| Product Catalogue | Critical | Core catalogue discovery | High | View Product |
| Product Detail | Critical | Material evaluation, conversion | High | Request Quote |
| Collection Detail | High | Curated discovery | High | View Products |
| Application Detail | High | Use-context discovery | High | Explore Marbles |
| Project Detail | Medium | Reference, trust | Medium | Explore Related Marbles |
| Journal Listing | High | Editorial discovery | High | Read Article |
| Journal Detail | High | Education, trust | High | Explore Related Materials |
| About | Medium | Company credibility | Medium | Contact |
| Quarry | Medium | Origin storytelling | Medium | Explore Marbles |
| Factory | Medium | Production storytelling | Medium | Explore Marbles |
| Contact | Medium | General contact | Medium | Contact |
| Quote Request | Critical | Conversion | Low | Submit Request |
| 404 | Low | Recovery | Low | Browse Marbles |

---

## 4. Section inventory matrix

| Page | Section | Required/Conditional | Content Source | Primary Purpose |
|---|---|---|---|---|
| Homepage | Hero | Required | CMS hero content + media | Brand orientation, primary message |
| Homepage | Featured Products | Conditional | Product data (featured selection) | Product discovery |
| Homepage | Collections Overview | Conditional | Collection data | Curated discovery |
| Homepage | Applications Overview | Conditional | Application data | Use-context discovery |
| Homepage | Quarry & Factory Story | Conditional | Company content | Credibility, origin story |
| Homepage | Projects Preview | Conditional | Project data (if qualifying projects exist) | Reference, trust |
| Homepage | Journal Preview | Conditional | Journal data | Editorial discovery |
| Homepage | Final CTA | Required | CMS content | Conversion |
| Product Catalogue | Page Title & Intro | Required | CMS content | Orientation |
| Product Catalogue | Product Grid | Required | Product data | Discovery |
| Product Catalogue | Pagination | Required | Product data | Navigation |
| Product Detail | Product Identity | Required | Product data | Evaluation |
| Product Detail | Product Gallery | Required | Media assets | Visual evaluation |
| Product Detail | Product Description | Required | Product data | Information |
| Product Detail | Related Collections | Conditional | Collection relationships | Discovery |
| Product Detail | Related Applications | Conditional | Application relationships | Discovery |
| Product Detail | Related Projects | Conditional | Project relationships (conditional visibility) | Trust |
| Product Detail | Related Journal | Conditional | Journal relationships | Education |
| Product Detail | Related Products | Conditional | Product relationships | Discovery |
| Product Detail | Quote CTA | Required | Conversion path | Conversion |
| Collection Detail | Collection Identity | Required | Collection data | Orientation |
| Collection Detail | Products in Collection | Required | Product data (via junction) | Discovery |
| Collection Detail | Related Applications | Conditional | Application relationships | Discovery |
| Collection Detail | Quote CTA | Required | Conversion path | Conversion |
| Application Detail | Application Identity | Required | Application data | Orientation |
| Application Detail | Products | Required | Product data (via junction) | Discovery |
| Application Detail | Projects | Conditional | Project relationships (conditional visibility) | Trust |
| Application Detail | Journal | Conditional | Journal relationships | Education |
| Application Detail | Quote CTA | Required | Conversion path | Conversion |
| Project Detail | Project Identity | Required | Project data | Orientation |
| Project Detail | Project Imagery | Conditional | Media assets | Visual evaluation |
| Project Detail | Project Description | Required | Project data | Information |
| Project Detail | Related Products | Required | Product relationships | Discovery |
| Project Detail | Related Applications | Conditional | Application relationships | Discovery |
| Project Detail | Quote CTA | Required | Conversion path | Conversion |
| Journal Listing | Editorial Introduction | Required | CMS content | Orientation |
| Journal Listing | Article Grid | Required | Journal data | Discovery |
| Journal Listing | Pagination | Required | Journal data | Navigation |
| Journal Detail | Article Title & Metadata | Required | Journal data | Identification |
| Journal Detail | Hero Media | Conditional | Media assets | Visual context |
| Journal Detail | Article Content | Required | Journal data | Education |
| Journal Detail | Related Products | Conditional | Product relationships | Discovery |
| Journal Detail | Related Applications | Conditional | Application relationships | Discovery |
| Journal Detail | Related Projects | Conditional | Project relationships (conditional visibility) | Trust |
| Journal Detail | Related Articles | Conditional | Journal relationships | Education |
| About | Company Identity | Required | Company content | Orientation |
| About | Company Story | Required | Company content | Credibility |
| About | Contact Path | Required | Conversion path | Conversion |
| Quarry | Quarry Identity | Required | Company content | Orientation |
| Quarry | Origin Story | Required | Company content | Credibility |
| Quarry | Related Products | Conditional | Product relationships | Discovery |
| Quarry | Quote CTA | Required | Conversion path | Conversion |
| Factory | Factory Identity | Required | Company content | Orientation |
| Factory | Production Story | Required | Company content | Credibility |
| Factory | Related Products | Conditional | Product relationships | Discovery |
| Factory | Quote CTA | Required | Conversion path | Conversion |
| Contact | Contact Information | Required | Company content | Contact |
| Contact | Contact Form | Conditional (if approved) | Form data | Contact |
| Quote Request | Context Display | Required | URL context parameter | Orientation |
| Quote Request | Request Form | Required | Form data | Conversion |
| Quote Request | Privacy Notice | Required | Legal content | Compliance |
| Quote Request | Submission Confirmation | Required | System response | Confirmation |

---

## 5. Homepage wireframe

### Structural order

```text
PAGE: Homepage

Purpose: Brand orientation, high-level discovery, trust establishment, conversion initiation
Primary User: All (Architect, Buyer, Project Company, Local Customer)
Primary CTA: Explore Marbles
Secondary CTA: Request Quote

SECTION 1: HERO
- Content: Cinematic hero with scroll-driven sequence (quarry → factory → water/drops → showroom → brand/CTA reveal)
- Fallback: Static hero image with primary message and CTA when video/animation fails, is disabled, is reduced-motion, or is unavailable
- Primary Message: Approved brand statement (content-dependent)
- Primary CTA: Explore Marbles
- Secondary CTA: Request Quote
- Priority: Critical
- Data dependency: CMS hero content, hero media assets, brand content
- Accessibility: Meaningful heading, alt text for fallback image, keyboard-accessible CTAs, reduced-motion fallback shows static content

SECTION 2: FEATURED PRODUCTS
- Content: Curated selection of featured/approved products
- Card structure: Product image, product name, brief description
- CTA: View Product → product detail
- Priority: High
- Data dependency: Product data (featured selection via CMS)
- Conditional: Only shown if featured products are approved
- Accessibility: Product grid with semantic markup, alt text for images

SECTION 3: COLLECTIONS OVERVIEW
- Content: Approved collection groupings
- Card structure: Collection image, collection name, brief description
- CTA: Explore Collection → collection detail
- Priority: High
- Data dependency: Collection data
- Conditional: Only shown if collections exist
- Accessibility: Semantic grid, alt text

SECTION 4: APPLICATIONS OVERVIEW
- Content: Approved application contexts
- Card structure: Application image, application name, brief description
- CTA: Explore Application → application detail
- Priority: High
- Data dependency: Application data
- Conditional: Only shown if applications exist
- Accessibility: Semantic grid, alt text

SECTION 5: QUARRY & FACTORY STORY
- Content: Material-origin and production-story content
- Structure: Two-column or stacked layout with imagery and brief narrative
- CTA: Explore Quarry → quarry detail; Explore Factory → factory detail
- Priority: Medium
- Data dependency: Company content (Quarry, Factory)
- Conditional: Only shown if Quarry/Factory content is published
- Accessibility: Heading hierarchy, alt text, meaningful link labels

SECTION 6: PROJECTS PREVIEW
- Content: Approved project references
- Card structure: Project image, project name, brief description
- CTA: View Project → project detail
- Priority: Medium
- Data dependency: Project data (conditional on qualifying projects existing)
- Conditional: Only shown when at least one qualifying published bilingual project exists
- Accessibility: Semantic grid, alt text

SECTION 7: JOURNAL PREVIEW
- Content: Recent/approved journal articles
- Card structure: Article image, article title, brief excerpt
- CTA: Read Article → journal detail
- Priority: Medium
- Data dependency: Journal data
- Conditional: Only shown if journal articles exist
- Accessibility: Semantic grid, alt text

SECTION 8: FINAL CTA
- Content: Conversion-focused message
- Primary CTA: Request Quote
- Secondary CTA: Contact
- Priority: High
- Data dependency: CMS content
- Accessibility: Clear heading, accessible button labels

RESPONSIVE BEHAVIOR
Desktop: Full-width sections, multi-column grids, hero video background
Tablet: Stacked sections, adjusted grids, hero video background
Mobile: Single-column stacking, hero fallback image, sticky CTA if appropriate
Accessibility: Logical reading order, focus management, reduced-motion fallback

INTERNAL LINKS
- Navigation: All primary nav items
- Breadcrumbs: None (homepage is root)
- Contextual: Featured products, collections, applications, projects, journal, quarry, factory
- Conversion: Request Quote, Contact

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/
- Canonical: self-referencing
- Hreflang: reciprocal TR/EN
- Indexable: Yes
- Structured data: Organization, WebSite recommended
```

### Hero fallback strategy

The homepage hero is the highest-risk area for accessibility and failure states. The wireframe must ensure:

| State | Behavior |
|---|---|
| Video loads and plays | Full cinematic scroll-driven experience |
| Video fails to load | Static hero image with primary message and CTA |
| Video disabled by user | Static hero image with primary message and CTA |
| Reduced motion preference | Static hero image with primary message and CTA |
| Slow connection | Static hero image with primary message and CTA |
| JavaScript delayed/disabled | Core message and navigation remain functional |
| No media available | Text-based hero with primary message and CTA |

The hero fallback must convey the same primary message and provide the same CTAs as the full cinematic version. Essential information must not depend solely on video/animation.

---

## 6. Product Catalogue wireframe

### Structural order

```text
PAGE: Product Catalogue

Purpose: Browse the full catalogue of approved products in alphabetical order
Primary User: Architect, Buyer
Primary CTA: View Product
Secondary CTA: Request Quote

SECTION 1: PAGE TITLE & INTRO
- Content: Page title, brief introductory text
- Priority: High
- Data dependency: CMS content
- Accessibility: Page heading (h1)

SECTION 2: PRODUCT GRID
- Content: Published, approved, bilingual products in alphabetical order by active locale title
- Card structure: Product image, product name, brief description (if available)
- Grid: Responsive grid (4 columns desktop, 2 columns tablet, 1-2 columns mobile)
- CTA: View Product → product detail
- Priority: Critical
- Data dependency: Product data (via public API, paginated)
- Accessibility: Semantic grid, alt text for images, keyboard navigation

SECTION 3: PAGINATION
- Content: Page navigation (1, 2, 3... next, previous)
- Structure: Sequential pagination with page numbers
- Default page size: 24 (per 04_API_CONTRACT.md)
- Priority: High
- Data dependency: Product data (pagination metadata)
- Accessibility: Semantic pagination, aria labels, keyboard navigation

SECTION 4: RELATED DISCOVERY (optional)
- Content: Links to Collections and Applications for additional discovery
- Priority: Low
- Data dependency: Collection and Application data
- Accessibility: Clear link labels

RESPONSIVE BEHAVIOR
Desktop: 4-column product grid, full pagination
Tablet: 2-column product grid, full pagination
Mobile: 1-2 column product grid, simplified pagination
Accessibility: Logical reading order, focus management

LOADING STATE
- Show skeleton/placeholder grid while products load
- Announce loading state to screen readers

EMPTY STATE
- If no products are available: clear message, link to homepage or contact
- Do not show empty grid

ERROR STATE
- If products fail to load: error message, retry option, link to homepage

INTERNAL LINKS
- Breadcrumbs: Home → Marbles
- Contextual: Each product card links to product detail
- Navigation: Collections, Applications for additional discovery
- Conversion: Request Quote accessible from navigation

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/marbles
- Canonical: self-referencing (with ?page=N for paginated pages)
- Hreflang: reciprocal TR/EN
- Indexable: Yes
- Structured data: ItemList recommended
```

---

## 7. Product Detail wireframe

### Structural order

```text
PAGE: Product Detail

Purpose: Evaluate one material in depth; initiate conversion
Primary User: Architect, Buyer, Project Company, Local Customer
Primary CTA: Request Quote
Secondary CTA: Contact

SECTION 1: BREADCRUMB
- Content: Home → Marbles → Product Name
- Priority: Required
- Data dependency: URL hierarchy
- Accessibility: Semantic breadcrumb, aria-label

SECTION 2: PRODUCT IDENTITY
- Content: Product name, brief tagline/summary (if available)
- Priority: Critical
- Data dependency: Product data
- Accessibility: Page heading (h1)

SECTION 3: PRODUCT GALLERY
- Content: Primary product image, additional gallery images
- Structure: Primary image with gallery thumbnails/carousel
- Priority: Critical
- Data dependency: Media assets (via ContentMedia junction)
- Accessibility: Alt text for all images, keyboard-navigable gallery, focus management

SECTION 4: PRODUCT DESCRIPTION
- Content: Approved product description, editorial content
- Priority: High
- Data dependency: Product data (localized description)
- Accessibility: Semantic content structure

SECTION 5: PRODUCT INFORMATION (if available)
- Content: Approved technical/commercial information (only where actual data exists)
- Structure: Structured data display (dimensions, format, origin, etc. if approved)
- Priority: Medium
- Data dependency: Product data (content-dependent; mark unavailable fields as OPEN DECISION)
- Accessibility: Structured data with proper labels

SECTION 6: RELATED COLLECTIONS
- Content: Collections this product belongs to
- Card structure: Collection name, brief description
- CTA: View Collection → collection detail
- Priority: High
- Data dependency: ProductCollection junction
- Conditional: Only shown if product belongs to collections
- Accessibility: Semantic list, clear link labels

SECTION 7: RELATED APPLICATIONS
- Content: Applications relevant to this product
- Card structure: Application name, brief description
- CTA: View Application → application detail
- Priority: High
- Data dependency: ProductApplication junction
- Conditional: Only shown if product has application relationships
- Accessibility: Semantic list, clear link labels

SECTION 8: RELATED PROJECTS
- Content: Projects using this product
- Card structure: Project name, brief description, project image
- CTA: View Project → project detail
- Priority: Medium
- Data dependency: ProjectProduct junction
- Conditional: Only shown if qualifying projects exist and product has project relationships
- Accessibility: Semantic list, alt text

SECTION 9: RELATED JOURNAL
- Content: Journal articles referencing this product
- Card structure: Article title, brief excerpt
- CTA: Read Article → journal detail
- Priority: Medium
- Data dependency: JournalContentReference
- Conditional: Only shown if journal articles reference this product
- Accessibility: Semantic list, clear link labels

SECTION 10: RELATED PRODUCTS
- Content: Other products related to this product
- Card structure: Product image, product name
- CTA: View Product → product detail
- Priority: Medium
- Data dependency: RelatedProduct junction
- Conditional: Only shown if related products exist
- Accessibility: Semantic grid, alt text

SECTION 11: QUOTE CTA
- Content: Conversion-focused message
- Primary CTA: Request Quote (with product context)
- Secondary CTA: Contact
- Priority: Critical
- Data dependency: Conversion path
- Accessibility: Clear heading, accessible button labels

RESPONSIVE BEHAVIOR
Desktop: Two-column layout (gallery left, identity/info right), full related content sections
Tablet: Stacked layout, gallery full-width, content below
Mobile: Single-column stacking, gallery full-width, content below, sticky CTA if appropriate
Accessibility: Logical reading order, focus management, gallery keyboard navigation

MISSING MEDIA STATE
- If product has no media: show placeholder with product name and description
- Do not show broken image
- Accessibility: Announce missing media

MISSING LANGUAGE STATE
- If product exists in one language but not the other: show available language with language switch disabled/unavailable indicator
- Do not show unrelated content
- Accessibility: Announce language availability

INTERNAL LINKS
- Breadcrumbs: Home → Marbles → Product
- Language switch: Equivalent variant of same product
- Contextual: Collections, Applications, Projects, Journal, Related Products
- Conversion: Request Quote (with product context), Contact

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/marbles/{slug}
- Canonical: self-referencing
- Hreflang: reciprocal TR/EN
- Indexable: Yes
- Structured data: Product recommended
```

---

## 8. Collection Detail wireframe

### Structural order

```text
PAGE: Collection Detail

Purpose: Explore a curated product grouping; discover relevant materials
Primary User: Architect, Buyer, Local Customer
Primary CTA: View Products
Secondary CTA: Request Quote

SECTION 1: BREADCRUMB
- Content: Home → Collections → Collection Name
- Priority: Required
- Data dependency: URL hierarchy
- Accessibility: Semantic breadcrumb

SECTION 2: COLLECTION IDENTITY
- Content: Collection name, approved description/narrative
- Priority: Critical
- Data dependency: Collection data
- Accessibility: Page heading (h1)

SECTION 3: PRODUCTS IN COLLECTION
- Content: Products belonging to this collection
- Card structure: Product image, product name, brief description
- CTA: View Product → product detail
- Priority: Critical
- Data dependency: ProductCollection junction
- Accessibility: Semantic grid, alt text

SECTION 4: RELATED APPLICATIONS
- Content: Applications relevant to this collection
- Card structure: Application name, brief description
- CTA: View Application → application detail
- Priority: Medium
- Data dependency: Application relationships (if approved)
- Conditional: Only shown if collection has application relationships
- Accessibility: Semantic list

SECTION 5: QUOTE CTA
- Content: Conversion-focused message
- Primary CTA: Request Quote
- Secondary CTA: Contact
- Priority: High
- Data dependency: Conversion path
- Accessibility: Clear heading, accessible button labels

RESPONSIVE BEHAVIOR
Desktop: Full-width layout, product grid
Tablet: Adjusted grid
Mobile: Single-column stacking
Accessibility: Logical reading order

INTERNAL LINKS
- Breadcrumbs: Home → Collections → Collection
- Language switch: Equivalent variant
- Contextual: Products, Applications
- Conversion: Request Quote, Contact

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/collections/{slug}
- Canonical: self-referencing
- Hreflang: reciprocal TR/EN
- Indexable: Yes
```

---

## 9. Application Detail wireframe

### Structural order

```text
PAGE: Application Detail

Purpose: Connect a material-use context to relevant materials and references
Primary User: Architect, Project Company
Primary CTA: Explore Suitable Marbles
Secondary CTA: Request Quote

SECTION 1: BREADCRUMB
- Content: Home → Applications → Application Name
- Priority: Required
- Data dependency: URL hierarchy
- Accessibility: Semantic breadcrumb

SECTION 2: APPLICATION IDENTITY
- Content: Application name, approved editorial introduction
- Priority: Critical
- Data dependency: Application data
- Accessibility: Page heading (h1)

SECTION 3: PRODUCTS
- Content: Products relevant to this application
- Card structure: Product image, product name, brief description
- CTA: View Product → product detail
- Priority: Critical
- Data dependency: ProductApplication junction
- Accessibility: Semantic grid, alt text

SECTION 4: PROJECTS
- Content: Projects using materials in this application context
- Card structure: Project image, project name, brief description
- CTA: View Project → project detail
- Priority: Medium
- Data dependency: ProjectApplication junction
- Conditional: Only shown if qualifying projects exist and application has project relationships
- Accessibility: Semantic grid, alt text

SECTION 5: JOURNAL
- Content: Journal articles relevant to this application
- Card structure: Article title, brief excerpt
- CTA: Read Article → journal detail
- Priority: Medium
- Data dependency: JournalContentReference
- Conditional: Only shown if journal articles reference this application
- Accessibility: Semantic list

SECTION 6: QUOTE CTA
- Content: Conversion-focused message
- Primary CTA: Request Quote (with application context)
- Secondary CTA: Contact
- Priority: High
- Data dependency: Conversion path
- Accessibility: Clear heading, accessible button labels

RESPONSIVE BEHAVIOR
Desktop: Full-width layout, product grid, related sections
Tablet: Adjusted grid, stacked sections
Mobile: Single-column stacking
Accessibility: Logical reading order

INTERNAL LINKS
- Breadcrumbs: Home → Applications → Application
- Language switch: Equivalent variant
- Contextual: Products, Projects, Journal
- Conversion: Request Quote (with application context), Contact

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/applications/{slug}
- Canonical: self-referencing
- Hreflang: reciprocal TR/EN
- Indexable: Yes
```

---

## 10. Project Detail wireframe

### Structural order

```text
PAGE: Project Detail

Purpose: Present an approved reference case; support trust and material discovery
Primary User: Architect, Project Company
Primary CTA: Explore Related Marbles
Secondary CTA: Request Quote

SECTION 1: BREADCRUMB
- Content: Home → Projects → Project Name
- Priority: Required
- Data dependency: URL hierarchy
- Conditional: Only shown when projects area is visible
- Accessibility: Semantic breadcrumb

SECTION 2: PROJECT IDENTITY
- Content: Project name, approved case-study narrative
- Priority: Critical
- Data dependency: Project data
- Accessibility: Page heading (h1)

SECTION 3: PROJECT IMAGERY
- Content: Approved project images
- Structure: Image gallery or hero image
- Priority: High
- Data dependency: Media assets
- Conditional: Only shown if project has approved media
- Accessibility: Alt text for all images

SECTION 4: PROJECT DESCRIPTION
- Content: Approved editorial content
- Priority: High
- Data dependency: Project data
- Accessibility: Semantic content structure

SECTION 5: RELATED PRODUCTS
- Content: Products used in this project
- Card structure: Product image, product name
- CTA: View Product → product detail
- Priority: Critical
- Data dependency: ProjectProduct junction
- Accessibility: Semantic grid, alt text

SECTION 6: RELATED APPLICATIONS
- Content: Applications relevant to this project
- Card structure: Application name, brief description
- CTA: View Application → application detail
- Priority: Medium
- Data dependency: ProjectApplication junction
- Conditional: Only shown if project has application relationships
- Accessibility: Semantic list

SECTION 7: QUOTE CTA
- Content: Conversion-focused message
- Primary CTA: Request Quote (with project context)
- Secondary CTA: Contact
- Priority: High
- Data dependency: Conversion path
- Accessibility: Clear heading, accessible button labels

RESPONSIVE BEHAVIOR
Desktop: Full-width layout, imagery prominent, related content sections
Tablet: Stacked layout, imagery full-width
Mobile: Single-column stacking
Accessibility: Logical reading order

CONDITIONAL VISIBILITY
- This page is only accessible when at least one qualifying published bilingual project exists
- If no qualifying projects exist: this page is not public
- No empty state or placeholder projects

INTERNAL LINKS
- Breadcrumbs: Home → Projects → Project
- Language switch: Equivalent variant
- Contextual: Products, Applications
- Conversion: Request Quote (with project context), Contact

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/projects/{slug}
- Canonical: self-referencing
- Hreflang: reciprocal TR/EN
- Indexable: Yes (conditional on project existence)
```

---

## 11. Journal Listing wireframe

### Structural order

```text
PAGE: Journal Listing

Purpose: Discover educational and editorial content
Primary User: Architect, Buyer
Primary CTA: Read Article
Secondary CTA: Explore Marbles

SECTION 1: BREADCRUMB
- Content: Home → Journal
- Priority: Required
- Data dependency: URL hierarchy
- Accessibility: Semantic breadcrumb

SECTION 2: EDITORIAL INTRODUCTION
- Content: Page title, brief editorial introduction
- Priority: High
- Data dependency: CMS content
- Accessibility: Page heading (h1)

SECTION 3: ARTICLE GRID
- Content: Published journal articles
- Card structure: Article image, article title, brief excerpt, publication date
- CTA: Read Article → journal detail
- Priority: Critical
- Data dependency: Journal data (via public API, paginated)
- Accessibility: Semantic grid, alt text, date metadata

SECTION 4: PAGINATION
- Content: Page navigation
- Priority: High
- Data dependency: Journal data (pagination metadata)
- Accessibility: Semantic pagination

SECTION 5: RELATED DISCOVERY (optional)
- Content: Links to relevant Products or Applications
- Priority: Low
- Data dependency: Content relationships
- Accessibility: Clear link labels

RESPONSIVE BEHAVIOR
Desktop: Multi-column article grid, full pagination
Tablet: Adjusted grid
Mobile: Single-column stacking
Accessibility: Logical reading order

EMPTY STATE
- If no articles exist: clear message, link to homepage or contact
- Accessibility: Announce empty state

INTERNAL LINKS
- Breadcrumbs: Home → Journal
- Contextual: Each article card links to journal detail
- Navigation: Products, Applications for additional discovery
- Conversion: Request Quote accessible from navigation

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/journal
- Canonical: self-referencing (with ?page=N for paginated pages)
- Hreflang: reciprocal TR/EN
- Indexable: Yes
```

---

## 12. Journal Detail wireframe

### Structural order

```text
PAGE: Journal Detail

Purpose: Inform with approved editorial content; connect to relevant materials
Primary User: Architect, Buyer
Primary CTA: Explore Related Materials
Secondary CTA: Request Quote (when appropriate)

SECTION 1: BREADCRUMB
- Content: Home → Journal → Article Title
- Priority: Required
- Data dependency: URL hierarchy
- Accessibility: Semantic breadcrumb

SECTION 2: ARTICLE TITLE & METADATA
- Content: Article title, publication date, author (if approved)
- Priority: Critical
- Data dependency: Journal data
- Accessibility: Page heading (h1), date metadata

SECTION 3: HERO MEDIA
- Content: Lead/hero image for article
- Priority: High
- Data dependency: Media assets
- Conditional: Only shown if article has approved media
- Accessibility: Alt text

SECTION 4: ARTICLE CONTENT
- Content: Approved editorial content
- Priority: Critical
- Data dependency: Journal data (localized body)
- Accessibility: Semantic content structure, proper heading hierarchy

SECTION 5: RELATED PRODUCTS
- Content: Products referenced in this article
- Card structure: Product image, product name
- CTA: View Product → product detail
- Priority: Medium
- Data dependency: JournalContentReference
- Conditional: Only shown if article references products
- Accessibility: Semantic grid, alt text

SECTION 6: RELATED APPLICATIONS
- Content: Applications referenced in this article
- Card structure: Application name, brief description
- CTA: View Application → application detail
- Priority: Medium
- Data dependency: JournalContentReference
- Conditional: Only shown if article references applications
- Accessibility: Semantic list

SECTION 7: RELATED PROJECTS
- Content: Projects referenced in this article
- Card structure: Project image, project name
- CTA: View Project → project detail
- Priority: Medium
- Data dependency: JournalContentReference
- Conditional: Only shown if article references qualifying projects
- Accessibility: Semantic list, alt text

SECTION 8: RELATED ARTICLES
- Content: Other journal articles
- Card structure: Article title, brief excerpt
- CTA: Read Article → journal detail
- Priority: Medium
- Data dependency: Journal relationships
- Conditional: Only shown if related articles exist
- Accessibility: Semantic list

SECTION 9: QUOTE CTA (when appropriate)
- Content: Conversion-focused message (only if editorially justified)
- Primary CTA: Request Quote
- Secondary CTA: Contact
- Priority: Low-Medium
- Data dependency: Conversion path
- Conditional: Not forced into every article; only when contextually relevant
- Accessibility: Clear heading, accessible button labels

RESPONSIVE BEHAVIOR
Desktop: Full-width article content, related content sections
Tablet: Stacked layout
Mobile: Single-column stacking
Accessibility: Logical reading order, proper heading hierarchy

INTERNAL LINKS
- Breadcrumbs: Home → Journal → Article
- Language switch: Equivalent variant
- Contextual: Products, Applications, Projects, Related Articles
- Conversion: Request Quote (when appropriate), Contact

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/journal/{slug}
- Canonical: self-referencing
- Hreflang: reciprocal TR/EN
- Indexable: Yes
- Structured data: Article recommended
```

---

## 13. About wireframe

### Structural order

```text
PAGE: About

Purpose: Present approved company context and credibility
Primary User: Buyer, Project Company
Primary CTA: Contact
Secondary CTA: Request Quote

SECTION 1: BREADCRUMB
- Content: Home → About
- Priority: Required
- Data dependency: URL hierarchy
- Accessibility: Semantic breadcrumb

SECTION 2: COMPANY IDENTITY
- Content: Company name, approved brand statement
- Priority: Critical
- Data dependency: Company content
- Accessibility: Page heading (h1)

SECTION 3: COMPANY STORY
- Content: Approved company narrative, factual content only
- Priority: High
- Data dependency: Company content
- Accessibility: Semantic content structure

SECTION 4: QUARRY & FACTORY LINKS
- Content: Links to Quarry and Factory content
- CTA: Explore Quarry → quarry detail; Explore Factory → factory detail
- Priority: Medium
- Data dependency: Company content
- Conditional: Only shown if Quarry/Factory content is published
- Accessibility: Clear link labels

SECTION 5: CONTACT PATH
- Content: Contact information (if approved)
- CTA: Contact → contact page; Request Quote
- Priority: High
- Data dependency: Company content, conversion path
- Accessibility: Clear heading, accessible button labels

RESPONSIVE BEHAVIOR
Desktop: Full-width content
Tablet: Stacked layout
Mobile: Single-column stacking
Accessibility: Logical reading order

TRUTHFULNESS CONSTRAINT
- No invented company history, ownership, team, locations, capacity, certifications, or claims
- Content must be approved and factual
- If content is not approved: section is not shown

INTERNAL LINKS
- Breadcrumbs: Home → About
- Language switch: Equivalent variant
- Contextual: Quarry, Factory
- Conversion: Contact, Request Quote

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/about
- Canonical: self-referencing
- Hreflang: reciprocal TR/EN
- Indexable: Yes
```

---

## 14. Quarry wireframe

### Structural order

```text
PAGE: Quarry

Purpose: Present approved material-origin story and visual storytelling
Primary User: Buyer, Architect
Primary CTA: Explore Marbles
Secondary CTA: Request Quote

SECTION 1: BREADCRUMB
- Content: Home → Quarry
- Priority: Required
- Data dependency: URL hierarchy
- Accessibility: Semantic breadcrumb

SECTION 2: QUARRY IDENTITY
- Content: Quarry name, approved origin narrative
- Priority: Critical
- Data dependency: Company content (Quarry)
- Accessibility: Page heading (h1)

SECTION 3: ORIGIN STORY
- Content: Approved material-origin narrative, imagery
- Priority: High
- Data dependency: Company content, media assets
- Accessibility: Semantic content structure, alt text

SECTION 4: RELATED PRODUCTS
- Content: Products from this origin (if approved)
- Card structure: Product image, product name
- CTA: View Product → product detail
- Priority: High
- Data dependency: CompanyContentReference
- Conditional: Only shown if quarry content references products
- Accessibility: Semantic grid, alt text

SECTION 5: QUOTE CTA
- Content: Conversion-focused message
- Primary CTA: Request Quote
- Secondary CTA: Contact
- Priority: High
- Data dependency: Conversion path
- Accessibility: Clear heading, accessible button labels

RESPONSIVE BEHAVIOR
Desktop: Full-width imagery, content sections
Tablet: Stacked layout
Mobile: Single-column stacking
Accessibility: Logical reading order

TRUTHFULNESS CONSTRAINT
- No invented quarry ownership, reserves, extraction capacity, certifications, or geographic claims
- Content must be approved and factual
- If content is not approved: section is not shown

INTERNAL LINKS
- Breadcrumbs: Home → Quarry
- Language switch: Equivalent variant
- Contextual: Products
- Conversion: Request Quote, Contact

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/quarry
- Canonical: self-referencing
- Hreflang: reciprocal TR/EN
- Indexable: Yes
```

---

## 15. Factory wireframe

### Structural order

```text
PAGE: Factory

Purpose: Present approved production-story content and visual storytelling
Primary User: Buyer, Project Company
Primary CTA: Explore Marbles
Secondary CTA: Request Quote

SECTION 1: BREADCRUMB
- Content: Home → Factory
- Priority: Required
- Data dependency: URL hierarchy
- Accessibility: Semantic breadcrumb

SECTION 2: FACTORY IDENTITY
- Content: Factory name, approved production narrative
- Priority: Critical
- Data dependency: Company content (Factory)
- Accessibility: Page heading (h1)

SECTION 3: PRODUCTION STORY
- Content: Approved production narrative, machinery/process storytelling (if approved), imagery
- Priority: High
- Data dependency: Company content, media assets
- Accessibility: Semantic content structure, alt text

SECTION 4: RELATED PRODUCTS
- Content: Products produced/processed here (if approved)
- Card structure: Product image, product name
- CTA: View Product → product detail
- Priority: High
- Data dependency: CompanyContentReference
- Conditional: Only shown if factory content references products
- Accessibility: Semantic grid, alt text

SECTION 5: QUOTE CTA
- Content: Conversion-focused message
- Primary CTA: Request Quote
- Secondary CTA: Contact
- Priority: High
- Data dependency: Conversion path
- Accessibility: Clear heading, accessible button labels

RESPONSIVE BEHAVIOR
Desktop: Full-width imagery, content sections
Tablet: Stacked layout
Mobile: Single-column stacking
Accessibility: Logical reading order

TRUTHFULNESS CONSTRAINT
- No invented machinery inventory, production statistics, certifications, or capacity claims
- Content must be approved and factual
- SIMEC / factory cinematic concept can be represented structurally, but implementation belongs later
- If content is not approved: section is not shown

INTERNAL LINKS
- Breadcrumbs: Home → Factory
- Language switch: Equivalent variant
- Contextual: Products
- Conversion: Request Quote, Contact

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/factory
- Canonical: self-referencing
- Hreflang: reciprocal TR/EN
- Indexable: Yes
```

---

## 16. Contact wireframe

### Structural order

```text
PAGE: Contact

Purpose: Provide general contact route; support enquiries not tied to specific content
Primary User: All
Primary CTA: Contact (submit form)
Secondary CTA: Request Quote

SECTION 1: BREADCRUMB
- Content: Home → Contact
- Priority: Required
- Data dependency: URL hierarchy
- Accessibility: Semantic breadcrumb

SECTION 2: CONTACT INFORMATION
- Content: Approved contact information (address, phone, email, working hours — only if approved)
- Priority: Critical
- Data dependency: Company content
- Accessibility: Page heading (h1), structured contact data

SECTION 3: CONTACT FORM (if approved)
- Content: Contact form with required fields
- Fields: Name, email, subject, message (content-dependent)
- Privacy notice: Required before submission (legal text content-dependent)
- Priority: High
- Data dependency: Form configuration, legal content
- Conditional: Only shown if contact form is approved
- Accessibility: Form labels, error messages, required field indicators, aria-describedby for privacy notice

SECTION 4: QUOTE REQUEST LINK
- Content: Link to Quote Request for commercial enquiries
- CTA: Request Quote → quote page
- Priority: Medium
- Data dependency: Conversion path
- Accessibility: Clear link label

RESPONSIVE BEHAVIOR
Desktop: Two-column layout (contact info left, form right)
Tablet: Stacked layout
Mobile: Single-column stacking
Accessibility: Logical form order, error placement, focus management

FORM VALIDATION
- Client-side validation for UX
- Server-side validation is authoritative
- Error messages placed near relevant fields
- Errors announced to screen readers
- Form remains submittable after errors (not disabled)

SUCCESS STATE
- Confirmation message after successful submission
- Clear next-step information
- Do not echo personal data back
- Accessibility: Announce success state

CONTENT DEPENDENCIES
- Contact information: Company content (must be approved)
- Form fields: Form configuration (content-dependent)
- Privacy notice: Legal content (OPEN DECISION — legal text not yet approved)

INTERNAL LINKS
- Breadcrumbs: Home → Contact
- Language switch: Equivalent variant
- Conversion: Request Quote

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/contact
- Canonical: self-referencing
- Hreflang: reciprocal TR/EN
- Indexable: Yes
```

---

## 17. Quote Request wireframe

### Structural order

```text
PAGE: Quote Request

Purpose: Collect a contextual commercial enquiry
Primary User: All
Primary CTA: Submit Request

SECTION 1: BREADCRUMB
- Content: Home → Request Quote
- Priority: Required
- Data dependency: URL hierarchy
- Accessibility: Semantic breadcrumb

SECTION 2: CONTEXT DISPLAY
- Content: If contextual (Product/Project/Application): show the subject being enquired about
- Structure: Product name/image, Project name/image, or Application name
- Priority: Critical
- Data dependency: URL context parameter (context type + identifier)
- Conditional: Only shown for contextual quote requests
- Accessibility: Announce context to screen readers

SECTION 3: REQUEST FORM
- Content: Quote request form
- Required fields: Contact information necessary for stated purpose, message/request, privacy acknowledgement
- Optional fields: Content-dependent
- Priority: Critical
- Data dependency: Form configuration, legal content
- Accessibility: Form labels, error messages, required field indicators, aria-describedby for privacy notice

SECTION 4: PRIVACY NOTICE
- Content: Privacy notice before submission
- Priority: Required
- Data dependency: Legal content (OPEN DECISION — legal text not yet approved)
- Accessibility: Accessible before submission, linked or inline

SECTION 5: SUBMISSION BUTTON
- Content: Submit Request button
- Priority: Critical
- Data dependency: Form state
- Accessibility: Clear button label, disabled state during submission

RESPONSIVE BEHAVIOR
Desktop: Centered form, clear context display
Tablet: Centered form, adjusted layout
Mobile: Full-width form, stacked fields
Accessibility: Logical form order, error placement, focus management

FORM STATES

Loading:
- Show loading indicator during submission
- Disable form during submission
- Announce loading state to screen readers

Validation Error:
- Show errors near relevant fields
- Announce errors to screen readers
- Allow correction and resubmission

Success:
- Show confirmation message
- Include request reference (opaque)
- Do not echo personal data
- Include localized next-step message
- Accessibility: Announce success state

Rate Limit / Spam:
- Show appropriate error message
- Allow retry after appropriate delay
- Accessibility: Announce error state

XOR CONTEXT RULE
- General Quote Request: no content context displayed
- Product-context: exactly one Product displayed
- Project-context: exactly one Project displayed
- Application-context: exactly one Application displayed
- Multiple contexts never permitted
- Context validated server-side

CONTENT DEPENDENCIES
- Form fields: Form configuration (content-dependent)
- Privacy notice: Legal content (OPEN DECISION — legal text not yet approved)
- Context display: Published, eligible content entity (if contextual)

INTERNAL LINKS
- Breadcrumbs: Home → Request Quote
- Language switch: Equivalent variant (form is localized)
- Contextual: If contextual, link back to originating content

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/quote
- Canonical: self-referencing
- Hreflang: reciprocal TR/EN
- Indexable: No (noindex or limited indexability — form page not valuable for search)
```

---

## 18. 404 / Not Found wireframe

### Structural order

```text
PAGE: 404 / Not Found

Purpose: Recover from unavailable routes; guide visitor to valid content
Primary User: All
Primary CTA: Browse Marbles

SECTION 1: ERROR MESSAGE
- Content: Clear, non-deceptive unavailable-page message
- Priority: Critical
- Data dependency: System/configured content
- Accessibility: Page heading (h1), clear message

SECTION 2: RECOVERY OPTIONS
- Content: Links to valid content areas
- Primary CTA: Browse Marbles → product catalogue
- Secondary CTAs: Homepage, Contact
- Priority: High
- Data dependency: Navigation structure
- Accessibility: Clear link labels

RESPONSIVE BEHAVIOR
Desktop: Centered content
Tablet: Centered content
Mobile: Centered content
Accessibility: Clear heading, focus management

SEO / CONTENT DEPENDENCIES
- URL: /{locale}/404
- Indexable: No (noindex)
```

---

## 19. Global header wireframe

### Structural behavior

```text
GLOBAL HEADER

Content:
- Brand/logo → homepage
- Primary navigation: Marbles, Collections, Applications, Projects (conditional), Journal, About
- Language switch: TR / EN
- Request Quote CTA
- Contact link (in navigation or as utility)

Structure:
- Fixed/sticky header on scroll
- Brand left, navigation center/right, language switch and CTA right

Navigation Groups:
- Primary: Marbles, Collections, Applications, Projects (conditional), Journal, About
- Utility: Language switch, Request Quote, Contact

Projects Visibility:
- Projects appears in navigation only when at least one qualifying published bilingual project exists

RESPONSIVE BEHAVIOR
Desktop: Full horizontal navigation
Tablet: Hamburger menu or condensed navigation
Mobile: Hamburger menu, full-screen overlay or slide-out panel
Accessibility: Keyboard navigation, focus management, aria labels, skip-to-content link

ACCESSIBILITY
- Skip-to-content link as first focusable element
- Keyboard navigable
- Focus visible
- ARIA labels for navigation landmarks
- Language switch announces current language
```

---

## 20. Global footer wireframe

### Structural behavior

```text
GLOBAL FOOTER

Content Groups:
- Company: About, Quarry, Factory, Contact
- Catalogue: Marbles, Collections, Applications, Projects (conditional), Journal
- Conversion: Request Quote
- Legal: Privacy Policy, Terms (future — only when approved)
- Language: TR / EN switch

Structure:
- Multi-column layout (desktop)
- Stacked columns (mobile)

RESPONSIVE BEHAVIOR
Desktop: Multi-column footer
Tablet: Adjusted columns
Mobile: Stacked columns
Accessibility: Semantic footer landmark, keyboard navigable, clear link labels

CONTENT DEPENDENCIES
- Legal links: Only when legal content is approved (OPEN DECISION)
- Projects link: Only when qualifying projects exist

TRUTHFULNESS CONSTRAINT
- No invented legal pages or company information
- Footer links must point to published, eligible content
```

---

## 21. CTA architecture

### CTA hierarchy

| CTA Level | Definition | Example |
|---|---|---|
| Primary CTA | Most important action for the page | Request Quote (Product Detail), Explore Marbles (Homepage) |
| Secondary CTA | Useful alternative | Contact (Product Detail), Request Quote (Homepage) |
| Contextual CTA | Triggered by relevant content | Request Quote with product context (from Product Detail) |

### CTA placement rules

| Page | Primary CTA | Secondary CTA | Contextual CTA |
|---|---|---|---|
| Homepage | Explore Marbles | Request Quote | — |
| Product Catalogue | View Product | — | — |
| Product Detail | Request Quote | Contact | Request Quote with product context |
| Collection Detail | View Products | Request Quote | — |
| Application Detail | Explore Marbles | Request Quote | Request Quote with application context |
| Project Detail | Explore Related Marbles | Request Quote | Request Quote with project context |
| Journal Listing | Read Article | — | — |
| Journal Detail | Explore Related Materials | Request Quote (when appropriate) | — |
| About | Contact | Request Quote | — |
| Quarry | Explore Marbles | Request Quote | — |
| Factory | Explore Marbles | Request Quote | — |
| Contact | Contact (submit) | Request Quote | — |
| Quote Request | Submit Request | — | — |

### CTA overload prevention

- Quote Request and Contact must not compete unnecessarily on pages where both appear
- Primary CTA is visually and structurally dominant
- Secondary CTA is available but not competing
- Contextual CTAs appear only when contextually relevant
- No more than 2-3 CTAs per page section

---

## 22. Responsive behavior matrix

| Page/Region | Desktop | Tablet | Mobile | Accessibility Concern |
|---|---|---|---|---|
| Homepage Hero | Full-width video background | Full-width video background | Fallback image, stacked content | Reduced-motion fallback, video failure fallback |
| Homepage Sections | Multi-column grids | Adjusted grids | Single-column stacking | Logical reading order |
| Product Grid | 4-column grid | 2-column grid | 1-2 column grid | Keyboard navigation, alt text |
| Product Detail | Two-column (gallery + info) | Stacked | Single-column stacking | Gallery keyboard navigation |
| Related Content | Multi-column grids | Adjusted grids | Single-column stacking | Semantic markup |
| Navigation | Full horizontal nav | Hamburger/condensed | Hamburger/overlay | Keyboard navigation, focus management |
| Footer | Multi-column | Adjusted columns | Stacked columns | Semantic footer, keyboard nav |
| Forms | Centered, multi-column fields | Centered, stacked fields | Full-width stacked fields | Error placement, focus management |

---

## 23. Accessibility structure

### Heading hierarchy

- Every page has exactly one h1 (page title)
- Sections use h2
- Subsections use h3
- No skipped heading levels

### Semantic content order

- Content order matches visual order
- Reading order is logical without CSS
- Landmark regions: header, nav, main, footer

### Keyboard navigation

- All interactive elements focusable
- Focus visible
- Skip-to-content link
- Logical tab order
- Focus management on state changes

### Form accessibility

- Labels associated with inputs
- Required fields indicated
- Error messages near relevant fields
- Errors announced to screen readers
- Privacy notice accessible before submission

### Image accessibility

- Informative images: meaningful alt text
- Decorative images: empty alt semantics
- No alt text as SEO keyword container

### Media fallback

- Video/animation fallback for essential content
- Reduced-motion preference respected
- Core message not dependent on media

---

## 24. Content dependencies summary

| Page | CMS Content | Product Data | Collection Data | Application Data | Project Data | Journal Data | Company Content | Media Assets | Legal Content |
|---|---|---|---|---|---|---|---|---|---|
| Homepage | Yes | Featured | Yes | Yes | Conditional | Yes | Quarry/Factory | Hero media | No |
| Product Catalogue | Intro | Yes | No | No | No | No | No | Product images | No |
| Product Detail | No | Yes | Relationships | Relationships | Conditional | Relationships | No | Product images | No |
| Collection Detail | No | Via junction | Yes | Relationships | No | No | No | Collection images | No |
| Application Detail | No | Via junction | No | Yes | Conditional | Relationships | No | Application images | No |
| Project Detail | No | Relationships | No | Relationships | Yes | No | No | Project images | No |
| Journal Listing | Intro | No | No | No | No | Yes | No | Article images | No |
| Journal Detail | No | Relationships | No | Relationships | Conditional | Yes | No | Article images | No |
| About | No | No | No | No | No | No | Yes | Company images | No |
| Quarry | No | Relationships | No | No | No | Relationships | Yes | Quarry images | No |
| Factory | No | Relationships | No | No | No | Relationships | Yes | Factory images | No |
| Contact | Form config | No | No | No | No | No | Contact info | No | Privacy notice |
| Quote Request | Form config | Context display | No | Context display | Context display | No | No | Context images | Privacy notice |

---

## 25. States matrix

| Page | Loading | Empty | Error | Unpublished | Missing Language | Missing Media |
|---|---|---|---|---|---|---|
| Homepage | Skeleton sections | N/A (always has content) | Fallback content | N/A | N/A | Hero fallback |
| Product Catalogue | Skeleton grid | "No products available" message | Error message, retry | N/A | N/A | Product placeholder |
| Product Detail | Skeleton layout | N/A | Error message, retry | Redirect to 404/410 | Language switch disabled | Product name + description |
| Collection Detail | Skeleton layout | "No products in collection" | Error message, retry | Redirect to 404/410 | Language switch disabled | Collection name + description |
| Application Detail | Skeleton layout | "No products available" | Error message, retry | Redirect to 404/410 | Language switch disabled | Application name + description |
| Project Detail | Skeleton layout | N/A (conditional visibility) | Error message, retry | Redirect to 404/410 | Language switch disabled | Project name + description |
| Journal Listing | Skeleton grid | "No articles available" | Error message, retry | N/A | N/A | Article placeholder |
| Journal Detail | Skeleton layout | N/A | Error message, retry | Redirect to 404/410 | Language switch disabled | Article title + metadata |
| Contact | Form ready | N/A | Error message, retry | N/A | N/A | N/A |
| Quote Request | Form ready | N/A | Error message, retry | N/A | N/A | N/A |

---

## 26. Conversion flow

```text
Discovery (Homepage, Catalogue, External Search Entry)
  ↓
Relevant Content (Product, Collection, Application, Project, Journal, Quarry, Factory)
  ↓
Evaluation (Gallery, Description, Related Content, Trust Content)
  ↓
Conversion Intent
  ↓
Quote Request (with context: Product/Project/Application or General)
  ↓
Form Completion (contact information, message, privacy acknowledgement)
  ↓
Submission
  ↓
Confirmation (request reference, next steps)
```

### Conversion points

| Content Area | Conversion Path | Context |
|---|---|---|
| Product Detail | Request Quote | Product context |
| Collection Detail | Request Quote | General or no context |
| Application Detail | Request Quote | Application context |
| Project Detail | Request Quote | Project context |
| Journal Detail | Request Quote | General (when appropriate) |
| Quarry | Request Quote | General |
| Factory | Request Quote | General |
| About | Contact | General |
| Contact | Contact form | General |
| Homepage | Request Quote | General |
| Navigation | Request Quote | General |

---

## 27. Open decisions

### Page-wireframe blocking

None. The wireframe architecture supports all approved V1 behavior without choosing unresolved company facts or implementation technology.

### Page-wireframe non-blocking

1. **Content Owner identity** — The real named individual must be confirmed before company-specific content (About, Quarry, Factory) is published.
2. **Project launch content** — Whether at least one qualifying approved bilingual Project exists at launch determines whether Project sections appear in navigation and content.
3. **Featured content on Homepage** — Which specific products, collections, applications, projects, or articles are featured on the Homepage is an editorial decision, not an architecture decision. The wireframe supports featured sections; the selection is CMS content.
4. **Exact form fields for Contact and Quote Request** — The wireframe defines required vs optional fields conceptually; exact field configuration is content-dependent.
5. **Legal/privacy text for Contact and Quote Request forms** — Privacy notice and legal content must be approved before production data collection.
6. **Homepage section ordering** — The wireframe proposes an order based on user journeys; final section ordering may be adjusted editorially within the approved architecture.

---

## 28. Traceability

| Wireframe Decision | Source |
|---|---|
| Page inventory | `01_MASTER_INFORMATION_ARCHITECTURE.md` — Complete page inventory |
| User journeys | `01_MASTER_INFORMATION_ARCHITECTURE.md` — User journeys |
| Product discovery | `01` — Product discovery architecture; `07_INTERNAL_LINK_GRAPH.md` — Product link graph |
| Collection/Application/Project relationships | `02_DOMAIN_MODEL.md` — Domain relationships; `03_DATABASE_ER.md` — Typed junctions |
| Quote Request XOR rule | `01` — V1 quote-context rule; `02` — Inquiry domain; `04_API_CONTRACT.md` — Quote endpoints |
| Project conditional visibility | `01` — Project availability at launch; `02` — Project launch rule |
| Multilingual behavior | `00_PROJECT_RULES.md` — Language rules; `01` — Multilingual architecture |
| Lifecycle states | `00` — Content lifecycle; `05_CMS_CONTRACT.md` — Lifecycle management |
| URL patterns | `06_SEO_URL_ARCHITECTURE.md` — URL pattern matrix |
| Internal links | `07_INTERNAL_LINK_GRAPH.md` — Link graph, breadcrumbs, conversion links |
| Hero fallback | `00` — Hero video fallback requirement; `01` — Homepage hero concept |
| Accessibility | `00` — Accessibility requirements; `06` — SEO accessibility |
| Truthfulness | `00` — Truthfulness rules; `01` — No invented claims |

---

## 29. Consistency audit

### Against 00_PROJECT_RULES.md

| Check | Result |
|---|---|
| Truthfulness | Pass: no invented company claims, certificates, capacity, or projects |
| Bilingual scope | Pass: all pages require TR/EN; language switch on all pages |
| Lifecycle | Pass: states mapped to page behavior (loading, empty, error, unpublished) |
| V1 scope | Pass: no advanced features (search, filters, comparison, commerce) |
| Accessibility | Pass: heading hierarchy, keyboard navigation, form accessibility, media fallback |
| Hero fallback | Pass: static fallback defined for video failure, reduced-motion, slow connection |
| Quote Request | Pass: XOR rule preserved; general or exactly one context |
| Governance | Pass: content sections depend on approved CMS content |

### Against 01_MASTER_INFORMATION_ARCHITECTURE.md

| Check | Result |
|---|---|
| Page inventory | Pass: all mandatory public pages covered |
| User journeys | Pass: all four user journeys supported |
| Navigation | Pass: primary nav matches approved structure; Projects conditional |
| Content hierarchy | Pass: wireframe hierarchy matches approved content hierarchy |
| Product discovery | Pass: catalogue supports 100+ products, alphabetical browsing, pagination |
| Conversion | Pass: Request Quote and Contact as primary/secondary CTAs |
| Project visibility | Pass: Projects section conditional on qualifying content |

### Against 02_DOMAIN_MODEL.md

| Check | Result |
|---|---|
| Entity relationships | Pass: wireframe sections mirror approved domain relationships |
| Language variants | Pass: language switch targets equivalent variant |
| Lifecycle states | Pass: page behavior mapped to lifecycle states |
| Quote Request | Pass: XOR context rule preserved |

### Against 03_DATABASE_ER.md

| Check | Result |
|---|---|
| Data dependencies | Pass: wireframe sections reference approved junction entities |
| Media relationships | Pass: gallery and imagery sections reference ContentMedia |
| Slug uniqueness | Pass: URL patterns use localized slugs |

### Against 04_API_CONTRACT.md

| Check | Result |
|---|---|
| Public endpoints | Pass: wireframe sections correspond to public API resources |
| Locale handling | Pass: pages require locale; no implicit fallback |
| Publication gate | Pass: content sections depend on published, eligible content |
| Pagination | Pass: catalogue and listing pages include pagination |

### Against 05_CMS_CONTRACT.md

| Check | Result |
|---|---|
| Content management | Pass: all wireframed sections are CMS-manageable |
| Lifecycle | Pass: page states align with CMS lifecycle management |
| Revision/approval | Pass: content sections depend on approved content |
| Media | Pass: gallery and imagery depend on rights-verified media |
| Quote Request | Pass: form and context management aligns with CMS capabilities |

### Against 06_SEO_URL_ARCHITECTURE.md

| Check | Result |
|---|---|
| URL patterns | Pass: wireframe URLs match SEO URL architecture |
| Canonical | Pass: self-referencing canonicals defined |
| Hreflang | Pass: reciprocal TR/EN hreflang defined |
| Indexability | Pass: indexable pages match SEO indexability matrix |
| Sitemap | Pass: all indexable pages included in sitemap architecture |

### Against 07_INTERNAL_LINK_GRAPH.md

| Check | Result |
|---|---|
| Internal links | Pass: contextual links match approved link graph |
| Breadcrumbs | Pass: breadcrumb hierarchy matches link graph architecture |
| Conversion links | Pass: conversion paths match link graph conversion architecture |
| Navigation | Pass: navigation links match link graph navigation section |

---

PAGE WIREFRAMES STATUS [READY FOR COMPONENT TREE]

---

## Critical OPEN DECISIONS

1. **Content Owner identity** — The real named individual must be confirmed before company-specific content (About, Quarry, Factory) is published.
2. **Project launch content** — Whether at least one qualifying approved bilingual Project exists at launch determines whether Project sections appear in navigation and content.
3. **Featured content on Homepage** — Which specific items are featured is an editorial decision; the wireframe supports featured sections without prescribing selection.
4. **Exact form fields** — Contact and Quote Request form fields are content-dependent; exact configuration belongs to implementation.
5. **Legal/privacy text** — Privacy notice and legal content for forms must be approved before production data collection.
6. **Homepage section ordering** — Final section ordering may be adjusted editorially within the approved architecture.
