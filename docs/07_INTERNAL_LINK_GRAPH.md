# Internal Link Graph Architecture

## 1. Purpose

This document defines how internal links connect content across the public website: which content types link to which, in what direction, with what priority, and under what lifecycle, multilingual, and governance constraints. It governs link creation, maintenance, orphan prevention, and the separation of responsibility between CMS, database, URL, and application layers.

The internal link graph serves the approved Information Architecture from `01_MASTER_INFORMATION_ARCHITECTURE.md`. It does not invent links for SEO volume, fabricate content relationships, or bypass lifecycle/approval rules.

---

## 2. Scope

This document covers:

- Node types and link semantics
- Full link graph by content type
- Navigation links vs contextual/editorial links
- Link priority and density rules
- Orphan prevention strategy
- Multilingual link rules
- Lifecycle-aware link behavior
- CMS, database, URL, and application responsibilities
- Breadcrumb architecture
- Footer and persistent navigation links
- Quote Request conversion links
- Open decisions
- Traceability

---

## 3. Link principles

### 3.1 Foundational rules

- Every internal link must connect two approved, published, language-eligible content nodes.
- Links are language-aware: a TR page links to TR variants; an EN page links to EN variants.
- No implicit language fallback in link targets.
- Links must reflect approved editorial relationships, not manufactured SEO connections.
- Unpublished, archived, draft, or permanently removed content must not appear as link targets.
- A link to content whose publication eligibility changes (media rights revoked, re-approval required) must not remain publicly active.
- Blanket or indiscriminate cross-linking is prohibited; each link must serve a discoverability or navigation purpose.

### 3.2 Truthfulness constraint

Links amplify real approved content relationships. No internal link may fabricate a connection that does not exist in approved content (e.g., linking a product to a project it was not used in, or linking a journal article to a product it does not reference).

---

## 4. Node types

A **node** is any publicly accessible content entity identified by its localized URL. Nodes are the endpoints of internal links.

| Node Type | URL Pattern | Localized? | Lifecycle-gated? |
|---|---|---|---|
| Homepage | `/{locale}/` | Yes | Published |
| Product | `/{locale}/marbles/{slug}` | Yes | Published + product gate |
| Product Listing | `/{locale}/marbles` | Yes | At least one eligible product |
| Collection | `/{locale}/collections/{slug}` | Yes | Published |
| Collection Listing | `/{locale}/collections` | Yes | At least one eligible collection |
| Application | `/{locale}/applications/{slug}` | Yes | Published |
| Application Listing | `/{locale}/applications` | Yes | At least one eligible application |
| Project | `/{locale}/projects/{slug}` | Yes | Published + conditional visibility |
| Project Listing | `/{locale}/projects` | Yes | At least one qualifying project |
| Journal Article | `/{locale}/journal/{slug}` | Yes | Published |
| Journal Listing | `/{locale}/journal` | Yes | At least one eligible article |
| About | `/{locale}/about` | Yes | Published |
| Quarry | `/{locale}/quarry` | Yes | Published |
| Factory | `/{locale}/factory` | Yes | Published |
| Contact | `/{locale}/contact` | Yes | Published |
| Quote | `/{locale}/quote` | Yes | Published (noindex) |

---

## 5. Link graph

### 5.1 Product link graph

A Product node may link to:

| Target | Link Type | Direction | Required/Optional |
|---|---|---|---|
| Homepage | Navigation (breadcrumb) | Product → Homepage | Required |
| Product Listing | Navigation (breadcrumb) | Product → Listing | Required |
| Collection (parent) | Contextual | Product → Collection | Optional (per ProductCollection junction) |
| Application (relevant) | Contextual | Product → Application | Optional (per ProductApplication junction) |
| Project (referencing) | Contextual | Product → Project | Optional (per ProjectProduct junction; conditional on qualifying project) |
| Journal Article (referencing) | Contextual | Product → Journal Article | Optional (per JournalContentReference) |
| Related Product | Contextual | Product → Product | Optional (per RelatedProduct junction) |
| Quote | Conversion | Product → Quote | Required (quote context available) |
| Language variant | Multilingual | TR Product ↔ EN Product | Required (reciprocal) |

A Product may receive links from:

| Source | Link Type | Notes |
|---|---|---|
| Product Listing | Discovery | Alphabetical listing |
| Collection Detail | Discovery | Products within collection |
| Application Detail | Discovery | Products relevant to application |
| Project Detail | Reference | Products used in project |
| Journal Article | Editorial | Products referenced in article |
| Related Product | Contextual | Bidirectional discovery |
| Homepage | Promotional | Featured/highlighted products |
| Company Content (Quarry/Factory) | Editorial | Products mentioned in origin/production stories |

### 5.2 Collection link graph

A Collection node may link to:

| Target | Link Type | Direction | Required/Optional |
|---|---|---|---|
| Homepage | Navigation (breadcrumb) | Collection → Homepage | Required |
| Collection Listing | Navigation (breadcrumb) | Collection → Listing | Required |
| Product (member) | Discovery | Collection → Product | Optional (products in collection) |
| Language variant | Multilingual | TR Collection ↔ EN Collection | Required |

A Collection may receive links from:

| Source | Link Type | Notes |
|---|---|---|
| Collection Listing | Discovery | All collections |
| Product Detail | Contextual | Collections a product belongs to |
| Homepage | Promotional | Featured collections |

### 5.3 Application link graph

An Application node may link to:

| Target | Link Type | Direction | Required/Optional |
|---|---|---|---|
| Homepage | Navigation (breadcrumb) | Application → Homepage | Required |
| Application Listing | Navigation (breadcrumb) | Application → Listing | Required |
| Product (relevant) | Discovery | Application → Product | Optional |
| Project (referencing) | Contextual | Application → Project | Optional (per ProjectApplication junction; conditional on qualifying project) |
| Journal Article (referencing) | Contextual | Application → Journal Article | Optional |
| Language variant | Multilingual | TR Application ↔ EN Application | Required |

An Application may receive links from:

| Source | Link Type | Notes |
|---|---|---|
| Application Listing | Discovery | All applications |
| Product Detail | Contextual | Applications relevant to product |
| Project Detail | Contextual | Applications used in project |
| Journal Article | Editorial | Applications referenced in article |
| Homepage | Promotional | Featured applications |

### 5.4 Project link graph

A Project node may link to:

| Target | Link Type | Direction | Required/Optional |
|---|---|---|---|
| Homepage | Navigation (breadcrumb) | Project → Homepage | Required |
| Project Listing | Navigation (breadcrumb) | Project → Listing | Required |
| Product (referenced) | Contextual | Project → Product | Optional |
| Application (referenced) | Contextual | Project → Application | Optional |
| Language variant | Multilingual | TR Project ↔ EN Project | Required |

A Project may receive links from:

| Source | Link Type | Notes |
|---|---|---|
| Project Listing | Discovery | All qualifying projects |
| Product Detail | Contextual | Projects using this product (conditional) |
| Application Detail | Contextual | Projects using this application (conditional) |
| Journal Article | Editorial | Projects referenced in article |
| Homepage | Promotional | Featured projects (conditional) |

### 5.5 Journal Article link graph

A Journal Article node may link to:

| Target | Link Type | Direction | Required/Optional |
|---|---|---|---|
| Homepage | Navigation (breadcrumb) | Article → Homepage | Required |
| Journal Listing | Navigation (breadcrumb) | Article → Listing | Required |
| Product (referenced) | Contextual | Article → Product | Optional |
| Application (referenced) | Contextual | Article → Application | Optional |
| Project (referenced) | Contextual | Article → Project | Optional (conditional) |
| Company Content (Quarry/Factory) | Editorial | Article → Quarry/Factory | Optional |
| Language variant | Multilingual | TR Article ↔ EN Article | Required |

A Journal Article may receive links from:

| Source | Link Type | Notes |
|---|---|---|
| Journal Listing | Discovery | All articles |
| Product Detail | Contextual | Articles referencing this product |
| Application Detail | Contextual | Articles referencing this application |
| Company Content | Editorial | Articles referenced in origin/production stories |
| Homepage | Promotional | Featured articles |

### 5.6 Company Content link graph

Company Content (About, Quarry, Factory) may link to:

| Target | Link Type | Direction | Required/Optional |
|---|---|---|---|
| Homepage | Navigation (breadcrumb) | Company → Homepage | Required |
| Product (mentioned) | Editorial | Company → Product | Optional (Quarry/Factory) |
| Journal Article (referencing) | Editorial | Company → Journal Article | Optional |
| Contact | Navigation | Company → Contact | Optional |
| Language variant | Multilingual | TR Company ↔ EN Company | Required |

Company Content may receive links from:

| Source | Link Type | Notes |
|---|---|---|
| Footer | Persistent | About, Quarry, Factory, Contact links |
| Journal Article | Editorial | Articles referencing Quarry/Factory |
| Homepage | Promotional | Links to company stories |

---

## 6. Navigation links vs contextual/editorial links

### 6.1 Navigation links

Navigation links are structural, persistent, and derive from the site hierarchy. They appear on every page of their scope and are not editorial decisions.

| Link | Source | Target | Scope |
|---|---|---|---|
| Main navigation | All pages | Homepage, Products, Collections, Applications, Projects (conditional), Journal, About, Contact, Quote | Global header |
| Breadcrumbs | Detail pages | Homepage → Parent listing → Current page | Hierarchical |
| Footer | All pages | About, Quarry, Factory, Contact, Privacy, (future legal pages) | Global footer |
| Language switch | All pages | Equivalent locale variant of current page | Global |

Navigation links are:

- **System-derived:** Generated from content hierarchy and URL patterns, not manual editorial choices.
- **Lifecycle-aware:** A navigation link to a content area appears only when qualifying published content exists (e.g., Projects in main nav only when qualifying projects exist).
- **Locale-consistent:** TR navigation leads to TR content; EN navigation leads to EN content.

### 6.2 Contextual/editorial links

Contextual links are editorial decisions within content body or related-content sections. They connect one content entity to another based on approved relationships.

| Link | Source | Target | Basis |
|---|---|---|---|
| Product → Collection | Product detail | Collection detail | ProductCollection junction |
| Product → Application | Product detail | Application detail | ProductApplication junction |
| Product → Project | Product detail | Project detail | ProjectProduct junction (conditional) |
| Product → Journal | Product detail | Journal Article | JournalContentReference |
| Product → Related Product | Product detail | Related Product | RelatedProduct junction |
| Collection → Products | Collection detail | Product detail | ProductCollection junction |
| Application → Products | Application detail | Product detail | ProductApplication junction |
| Application → Projects | Application detail | Project detail | ProjectApplication junction (conditional) |
| Project → Products | Project detail | Product detail | ProjectProduct junction |
| Project → Applications | Project detail | Application detail | ProjectApplication junction |
| Journal → Products/Apps/Projects/Company | Journal detail | Various | JournalContentReference |
| Quarry/Factory → Products/Journal | Company detail | Various | CompanyContentReference |

Contextual links are:

- **Editorial:** Created by Author/Editor, approved through governance workflow.
- **Relationship-driven:** Stem from approved junction entities in the database.
- **Lifecycle-sensitive:** A link target must be published and eligible; if target becomes ineligible, the link must not remain publicly active.

### 6.3 Conversion links

Conversion links direct visitors toward the Quote Request form.

| Source | Target | Context |
|---|---|---|
| Product detail | `/{locale}/quote?context=product&id={uuid}` | General or product-context quote |
| Project detail | `/{locale}/quote?context=project&id={uuid}` | Project-context quote |
| Application detail | `/{locale}/quote?context=application&id={uuid}` | Application-context quote |
| Any page | `/{locale}/quote` | General quote (no context) |

Conversion links are:

- **Conversion-oriented:** Placed where visitor intent may lead to enquiry.
- **Context-preserving:** Carry exactly one context or none, per Quote Request XOR rule.
- **Not editorial:** Do not represent content relationships; represent business conversion paths.

---

## 7. Link priority matrix

### 7.1 Link density by content type

| Content Type | Max Outbound Editorial Links | Rationale |
|---|---|---|
| Product | 8–12 | Core discovery; collections, applications, projects, journal, related products, quote |
| Collection | 3–6 | Products within collection; limited outbound |
| Application | 4–8 | Products, projects, journal; moderate discovery |
| Project | 3–5 | Products, applications; reference-focused |
| Journal Article | 3–6 | Products, applications, projects, company content; editorial |
| Company Content | 2–4 | Products, journal; origin/production stories |
| Homepage | 6–10 | Featured content across all types; curated |
| Listing pages | 2–4 | Pagination; limited outbound |

### 7.2 Link priority ordering

When a content page has multiple outbound editorial links, priority ordering is:

1. **Direct parent** (breadcrumb: Homepage → Listing → Detail)
2. **Primary relationship** (e.g., Product → its Collections)
3. **Secondary relationship** (e.g., Product → its Applications)
4. **Tertiary relationship** (e.g., Product → its Projects, Journal Articles)
5. **Related content** (e.g., Related Products)
6. **Conversion** (Quote Request link)

### 7.3 Internal link nofollow policy

- All internal links use `dofollow` by default.
- `nofollow` is applied only to:
  - Quote form links (conversion, not editorial)
  - Pagination links where implementation requires it
  - Any paid/sponsored content (not applicable in V1)
- No internal editorial link uses `nofollow`.

---

## 8. Orphan prevention strategy

### 8.1 Definition

An **orphan page** is a published, indexable page with no internal links pointing to it from other published pages. Orphan pages are unreachable by visitors and crawlers through normal navigation.

### 8.2 Orphan prevention rules

| Rule | Description |
|---|---|
| Every published content node must receive at least one inbound link from a published node. | No content exists in isolation. |
| Every published content node must appear in its type's listing page (if applicable). | Listings serve as discovery indexes. |
| Every published content node must have a breadcrumb path from homepage. | Breadcrumbs guarantee hierarchical reachability. |
| No content may be published without at least one approved relationship or listing membership. | Prevention at publication gate. |

### 8.3 Orphan detection

The application layer must validate at publication time that:

1. The content node has at least one inbound link (from listing, parent, or editorial relationship).
2. The content node appears in at least one indexable listing or sitemap entry.
3. The content node is reachable through breadcrumb navigation.

### 8.4 Orphan recovery

If orphan risk is detected:

1. CMS alerts Author/Editor at publication time.
2. Publisher must establish at least one inbound link before publication.
3. Audit event records orphan prevention action.

---

## 9. Multilingual link rules

### 9.1 Language-aware linking

- A TR page links only to TR targets.
- An EN page links only to EN targets.
- No cross-language linking within page content (e.g., a TR product page does not link to an EN journal article).
- Language switch provides the equivalent variant, not a cross-language content link.

### 9.2 Language switch as a link type

Language switch is a distinct link type:

- Always targets the equivalent variant of the same conceptual entity.
- Never targets unrelated content.
- If target variant is not publication-eligible, the language switch link shows appropriate non-deceptive state (disabled, visual indicator).
- Language switch is reciprocal: if TR → EN exists, EN → TR must exist.

### 9.3 Bilingual link consistency

If a TR product links to a TR collection, the corresponding EN product must link to the corresponding EN collection (assuming both variants are published). Link relationships are conceptual (via ContentItem) and must be consistent across locales.

### 9.4 Missing language variant behavior

If one language variant is unpublished:
- The published variant's links remain active for that locale.
- The language switch for the missing variant is disabled or shows unavailability.
- No link from the published variant points to the missing variant's URL.

---

## 10. Lifecycle-aware link behavior

### 10.1 Link eligibility matrix

| Source State | Target State | Link Visible? | Link Followable? |
|---|---|---|---|
| Published | Published | Yes | Yes |
| Published | Unpublished | No | No |
| Published | Archived | No | No |
| Published | Draft | No | No |
| Published | Permanently Removed | No | No |
| Unpublished | Any | N/A (source not public) | N/A |

### 10.2 Target lifecycle changes

When a link target's lifecycle changes:

| Event | Effect on Inbound Links |
|---|---|
| Content unpublished | All inbound editorial links must be removed or replaced. Breadcrumb/listing links are automatically suppressed. |
| Content archived | Same as unpublished; inbound links must not remain active. |
| Content permanently removed | All inbound links must be removed; redirect may preserve URL equity but editorial links must be cleaned. |
| Media rights revoked | Content may lose publication eligibility; inbound links treated as unpublished target. |
| Re-approval required | Content may temporarily lose eligibility; links must not remain active until re-approved and republished. |

### 10.3 CMS responsibility for lifecycle links

The CMS must:

- Show which content items link to a given content item (backlink view).
- Alert when unpublishing/archiving/removing content that has inbound editorial links.
- Require Publisher to resolve inbound links before or during lifecycle transition.
- Record audit event for link cleanup actions.

### 10.4 Application-layer link validation

The application layer must:

- Filter outbound links to exclude ineligible targets at render time.
- Not cache pages with links to targets whose eligibility has changed.
- Invalidate page caches when a target's lifecycle state changes.

---

## 11. CMS, database, URL, and application responsibilities

### 11.1 CMS responsibilities

| Responsibility | Description |
|---|---|
| Link creation | Author/Editor creates editorial links through approved relationship management UI. |
| Link approval | Editorial links follow content approval workflow; links are part of approved content. |
| Backlink visibility | CMS shows inbound links for any content item. |
| Orphan alert | CMS warns at publication time if content has no inbound links. |
| Lifecycle link cleanup | CMS alerts when unpublishing/removing content with inbound links. |
| Relationship management | CMS manages junction entities (ProductCollection, ProductApplication, etc.). |

### 11.2 Database responsibilities

| Responsibility | Description |
|---|---|
| Junction integrity | Database enforces referential integrity for all typed junctions. |
| Lifecycle gating | Database query filters exclude ineligible targets from link resolution. |
| Uniqueness | RelatedProduct prevents self-reference and duplicate directional pairs. |
| Slug uniqueness | Ensures no URL collision across locales and content types. |

### 11.3 URL responsibilities

| Responsibility | Description |
|---|---|
| URL resolution | Application maps slug + locale to content node. |
| Redirect management | Old slugs redirect to new slugs; 301 for permanent changes. |
| Canonical integrity | Each page has self-referencing canonical; no cross-language canonical. |
| Hreflang consistency | Language variants linked via hreflang; consistent with internal links. |

### 11.4 Application responsibilities

| Responsibility | Description |
|---|---|
| Link rendering | Application resolves relationships to URLs at render time, filtering by lifecycle. |
| Breadcrumb generation | Application generates breadcrumbs from content hierarchy. |
| Cache invalidation | Outbound link targets' lifecycle changes trigger cache invalidation of source pages. |
| Link validation | Application validates that all rendered links point to eligible targets. |

---

## 12. Breadcrumb architecture

### 12.1 Breadcrumb hierarchy

```
Homepage
├── Marbles (listing)
│   └── {Product}
├── Collections (listing)
│   └── {Collection}
├── Applications (listing)
│   └── {Application}
├── Projects (listing) [conditional]
│   └── {Project}
├── Journal (listing)
│   └── {Article}
├── About
├── Quarry
├── Factory
├── Contact
└── Quote
```

### 12.2 Breadcrumb rules

| Rule | Description |
|---|---|
| Every detail page has a breadcrumb from homepage. | Guarantees hierarchical reachability. |
| Breadcrumbs are locale-specific. | TR breadcrumb leads to TR pages; EN to EN. |
| Breadcrumbs are system-derived. | Generated from URL hierarchy, not editorial. |
| No cross-locale breadcrumbs. | Breadcrumb does not cross language boundaries. |
| Homepage is always the root. | No deeper root. |
| Listing page is always the parent of its detail pages. | Product detail breadcrumb: Home → Marbles → Product. |
| Projects breadcrumb is conditional. | Only visible when qualifying projects exist. |

### 12.3 Breadcrumb structured data

BreadcrumbList structured data is recommended for all hierarchical pages. Implementation follows `06_SEO_URL_ARCHITECTURE.md` structured data governance.

---

## 13. Footer and persistent navigation links

### 13.1 Footer link set

| Link | Target (TR) | Target (EN) | Notes |
|---|---|---|---|
| About | `/tr/about` | `/en/about` | Company content |
| Quarry | `/tr/quarry` | `/en/quarry` | Origin story |
| Factory | `/tr/factory` | `/en/factory` | Production story |
| Contact | `/tr/contact` | `/en/contact` | Contact page |
| Quote | `/tr/quote` | `/en/quote` | Conversion |
| (Future: Privacy Policy, Terms) | TBD | TBD | Legal pages (future scope) |

### 13.2 Footer link governance

- Footer links are persistent across all pages.
- Footer links must point to published, eligible content.
- If a footer target becomes ineligible (unpublished, removed), the link must be removed or suppressed.
- Footer links are locale-aware: TR footer links to TR pages; EN footer links to EN pages.

### 13.3 Main navigation link set

| Link | Target (TR) | Target (EN) | Conditional? |
|---|---|---|---|
| Homepage | `/tr/` | `/en/` | No |
| Marbles | `/tr/marbles` | `/en/marbles` | No |
| Collections | `/tr/collections` | `/en/collections` | No |
| Applications | `/tr/applications` | `/en/applications` | No |
| Projects | `/tr/projects` | `/en/projects` | Yes (qualifying projects exist) |
| Journal | `/tr/journal` | `/en/journal` | No |
| About | `/tr/about` | `/en/about` | No |
| Contact | `/tr/contact` | `/en/contact` | No |
| Quote | `/tr/quote` | `/en/quote` | No |

### 13.4 Navigation visibility rules

| Content Area | Navigation Visible When |
|---|---|
| Products | Always (100+ products assumed) |
| Collections | Always (at least one published collection) |
| Applications | Always (at least one published application) |
| Projects | Only when at least one qualifying published bilingual project exists |
| Journal | Always (at least one published article) |
| About | Always (published about content) |
| Contact | Always (published contact content) |
| Quote | Always |

---

## 14. Quote Request conversion links

### 14.1 Context-aware quote links

Conversion links carry context to the Quote Request form:

| Source Page | Link Target | Context |
|---|---|---|
| Product detail | `/{locale}/quote?context=product&id={product-uuid}` | Product-context quote |
| Project detail | `/{locale}/quote?context=project&id={project-uuid}` | Project-context quote |
| Application detail | `/{locale}/quote?context=application&id={application-uuid}` | Application-context quote |
| Any page | `/{locale}/quote` | General quote (no context) |

### 14.2 Context integrity

- The context parameter must reference a published, eligible content entity.
- If the target content becomes ineligible, the context link must not be rendered.
- The Quote Request form validates context server-side; client-side display is secondary.
- Multiple contexts are never permitted (XOR rule).

---

## 15. Link graph maintenance

### 15.1 When relationships change

When an editorial relationship is added or removed:

1. Author/Editor modifies the relationship through CMS.
2. Change follows approval workflow.
3. On publication, affected pages are re-rendered and caches invalidated.
4. Orphan check runs for the target if the relationship was the sole inbound link.

### 15.2 When content is unpublished/removed

When content is unpublished, archived, or permanently removed:

1. CMS shows all inbound editorial links.
2. Publisher must resolve each inbound link (remove, replace, or redirect).
3. Application layer suppresses listing/breadcrumb links automatically.
4. Audit event records all link cleanup actions.

### 15.3 Periodic link integrity

**OPEN DECISION:** Whether to implement automated link integrity checks (e.g., scheduled crawl or database query to detect orphaned or broken links). The conceptual requirement is that links must remain valid; the monitoring mechanism is an implementation decision.

---

## 16. Open decisions

### Link-graph blocking

None. The link graph architecture supports all approved V1 behavior without choosing unresolved company facts or implementation technology.

### Link-graph non-blocking

1. **Content Owner identity** — The real named individual must be confirmed before company-specific content (and its links) is published.
2. **Project launch content** — Whether at least one qualifying approved bilingual Project exists at launch determines whether Project links appear in navigation and editorial content.
3. **Featured/highlighted content on Homepage** — Which specific products, collections, applications, projects, or articles are featured on the Homepage is an editorial decision, not an architecture decision. The architecture supports featured links; the selection is CMS content.

### Later implementation

1. Automated orphan detection mechanism and frequency.
2. Automated link integrity checking (scheduled crawl, database validation, or CMS tooling).
3. Link analytics (tracking which internal links are clicked) — future scope, not V1.
4. Dynamic related-content algorithms — not V1; V1 uses explicit approved relationships.

---

## 17. Traceability

| Link-graph Decision | Source |
|---|---|
| Node types and URL patterns | `06_SEO_URL_ARCHITECTURE.md` — URL pattern matrix; `01_MASTER_INFORMATION_ARCHITECTURE.md` — page inventory |
| Product relationships | `02_DOMAIN_MODEL.md` — Catalog domain relationships; `03_DATABASE_ER.md` — ProductCollection, ProductApplication, ProjectProduct, RelatedProduct junctions |
| Collection/Application/Project relationships | `02` — Domain relationship analysis; `03` — Typed junction entities |
| Journal/Company relationships | `02` — Editorial domain; `03` — JournalContentReference, CompanyContentReference |
| Multilingual linking | `00_PROJECT_RULES.md` — Language rules; `01` — Multilingual architecture; `02` — Language variant identity |
| Lifecycle-aware linking | `00` — Content lifecycle; `02` — Lifecycle domain; `05_CMS_CONTRACT.md` — Lifecycle management |
| Orphan prevention | `01` — Content hierarchy; `03` — Referential integrity; `05` — Publication gates |
| Navigation structure | `01` — Navigation architecture; `06` — URL hierarchy |
| Conversion links | `01` — Quote architecture; `02` — Inquiry domain; `04_API_CONTRACT.md` — Quote Request endpoints |
| Breadcrumbs | `06` — URL hierarchy; `01` — Page hierarchy |
| Footer links | `01` — Company content areas; `06` — Company page URLs |

---

## 18. Consistency audit

### Against 00_PROJECT_RULES.md

| Check | Result |
|---|---|
| Truthfulness | Pass: no fabricated relationships; links reflect approved content connections |
| No silent decisions | Pass: all link rules traced; OPEN DECISIONs marked |
| Bilingual scope | Pass: links are language-aware; no cross-language linking |
| Lifecycle | Pass: link eligibility gated by content lifecycle |
| V1 scope | Pass: no advanced features (dynamic recommendations, link analytics) |
| Governance | Pass: editorial links follow approval workflow |

### Against 01_MASTER_INFORMATION_ARCHITECTURE.md

| Check | Result |
|---|---|
| User journeys | Pass: link graph supports all primary discovery journeys |
| Navigation | Pass: main nav, footer, breadcrumbs match navigation architecture |
| Content hierarchy | Pass: link hierarchy matches approved content hierarchy |
| Project visibility | Pass: project links conditional on qualifying content |
| Product discovery | Pass: product links support collection/application/project/journal discovery |

### Against 02_DOMAIN_MODEL.md

| Check | Result |
|---|---|
| Entity relationships | Pass: link graph mirrors approved domain relationships |
| Language variants | Pass: links connect same conceptual entity across locales |
| Lifecycle states | Pass: link eligibility mapped to lifecycle states |
| Quote Request | Pass: conversion links carry exactly one context or none |

### Against 03_DATABASE_ER.md

| Check | Result |
|---|---|
| Junction entities | Pass: link graph uses approved typed junctions |
| Referential integrity | Pass: orphan prevention aligns with database integrity rules |
| Media relationships | Pass: media links follow ContentMedia junction |
| Slug uniqueness | Pass: link targets use unique localized slugs |

### Against 04_API_CONTRACT.md

| Check | Result |
|---|---|
| Public endpoints | Pass: link targets correspond to public API resources |
| Locale handling | Pass: links are locale-aware; no cross-language API calls |
| Publication gate | Pass: link targets must be published and eligible |

### Against 05_CMS_CONTRACT.md

| Check | Result |
|---|---|
| Relationship management | Pass: editorial links managed through CMS relationship UI |
| Approval workflow | Pass: editorial links follow content approval |
| Lifecycle management | Pass: CMS alerts for link cleanup on lifecycle transitions |
| Role model | Pass: link creation/editing follows Author/Editor responsibilities |
| Backlink visibility | Pass: CMS shows inbound links for content items |

### Against 06_SEO_URL_ARCHITECTURE.md

| Check | Result |
|---|---|
| URL patterns | Pass: link targets match defined URL patterns |
| Canonical integrity | Pass: links use canonical URLs |
| Hreflang consistency | Pass: language switch links align with hreflang |
| Sitemap coverage | Pass: all link targets included in sitemap when published |
| Indexability | Pass: link targets are indexable when published |

---

INTERNAL LINK GRAPH STATUS [READY FOR PAGE WIREFRAMES]

---

## Critical OPEN DECISIONS

1. **Content Owner identity** — The real named individual must be confirmed before company-specific content (and its outbound links) is published.
2. **Project launch content** — Whether at least one qualifying approved bilingual Project exists at launch determines whether Project links appear in navigation and editorial content.
3. **Featured content on Homepage** — Which specific items are featured is an editorial decision; the architecture supports featured links without prescribing selection.
4. **Automated link integrity monitoring** — The conceptual requirement is that links must remain valid; the monitoring mechanism (scheduled crawl, database validation, CMS tooling) belongs to implementation.
