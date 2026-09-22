# Master Information Architecture

## 1. Purpose and architectural goals

This document defines who the platform serves, what information each audience needs, how public content is organized, how users move through it, and which content must be manageable. It is a business and information-architecture blueprint, not a technical, database, API, CMS-interface, or implementation specification.

The platform must function as a premium digital showroom, a bilingual marble catalogue, and a credible enquiry destination for architects, international buyers, project companies, and local customers. It must support organic discovery through useful, connected content; guide visitors from discovery to evaluation and a quote request; and grow without restructuring its public content model.

It must not promise rankings, production capacity, export coverage, logistics capability, certifications, availability, or any other unapproved company fact.

### Architectural terminology

- **Conceptual content entity:** One business/content identity, such as one particular Product, Collection, Application, Project, Journal Article, About item, Quarry item, or Factory item.
- **Language variant:** The Turkish or English representation of one conceptual content entity. It is not a separate business entity.
- **External Search Entry:** Arrival from Google, Bing, another external search engine, or another indexed external source.
- **Internal Site Search:** A visitor-operated search feature within the platform. It is not V1 scope unless a documented scope change approves it.
- **General Quote Request:** A Request Quote with no originating Product, Project, or Application context.
- **Contextual Quote Request:** A Request Quote initiated from exactly one Product, Project, or Application.

## 2. Primary users

| User | Primary goals | Information needs | Discovery behavior and decision factors | Preferred content | Conversion |
|---|---|---|---|---|---|
| Architect | Find visually appropriate materials; assess suitability; shortlist options. | Finish, visual detail, approved technical/product information, applications, related projects where approved. | Often enters through an External Search Entry, imagery, applications, or product pages; judges visual fit, material context, usable information, and confidence. | Product galleries, close-ups, application pages, related products, approved projects, downloadable information only if approved. | Request Quote; Contact. Sample Request is not V1 unless scope changes. |
| Importer / international buyer | Identify potential material/supplier options and make a commercial enquiry. | English product information, origin/availability only where approved, product formats only where approved, company/quarry/factory narrative, enquiry path. | Often enters through an English External Search Entry or a direct product page; evaluates clarity, credibility, product relevance, and response route. | English product pages, collection pages, approved quarry/factory content, related material options. | Request Quote; Contact. |
| Project company | Find materials suitable for a project and initiate a commercial discussion. | Product range, applications, approved project references, relevant material information, contact path. | Enters through product, application, project, or journal content; evaluates fit, confidence, and enquiry clarity. | Application pages, product pages, approved projects, related content. | Request Quote; Contact. |
| Local customer | Discover material options and ask for guidance or a quotation. | Product appearance, applications, approved basic product details, contact route. | Often starts from homepage, product listing, a Turkish External Search Entry, or referral; evaluates clarity and visual relevance. | Turkish catalogue, product pages, applications, contact/quote path. | Request Quote; Contact. |

No demographic assumptions are made.

## 3. User journeys

Every journey supports both homepage entry and direct entry from an External Search Entry, shared links, or external referrals.

| User | Entry | Discovery | Evaluation | Trust | Conversion | Primary / secondary CTA |
|---|---|---|---|---|---|---|
| Architect | Homepage, product, application, journal, project, or External Search Entry | Catalogue, collections, applications, related products | Gallery, approved material data, application fit, comparison only if later approved | Approved projects; quarry/factory story; clear content provenance | Product-linked or general enquiry | Request Quote / Contact |
| International buyer | English homepage, product, collection, journal, quarry, factory, or External Search Entry | Product listing, collections, related products | Approved origin, formats, availability and commercial information | Approved company, quarry, factory, and project content | Product-aware or general commercial enquiry | Request Quote / Contact |
| Project company | Product, application, project, homepage, or External Search Entry | Relevant application and materials | Product suitability and approved references | Project content and production-story content | Project-aware or general enquiry | Request Quote / Contact |
| Local customer | Turkish homepage, product listing, product, application, referral, or External Search Entry | Browse catalogue and applications | Visual material fit and approved basic information | Clear company/contact content and related examples | General or product-aware enquiry | Request Quote / Contact |

Direct-entry pages must expose a clear next step: related content for evaluation, credibility content for trust, and a visible conversion route. The homepage is an orientation and discovery layer, not a required gateway.

## 4. Conversion architecture

### Mandatory V1 conversions

| Conversion | Target user | Trigger context | Required context presented to user | Destination | CTA role |
|---|---|---|---|---|---|
| Request Quote | All primary users | Product evaluation, catalogue browsing, relevant project/application content, or global navigation | The subject being enquired about where applicable; purpose of request; privacy notice before submission | Quote-request experience | Primary |
| Contact | All primary users | Need for a general question or a route not tied to a product | Clear reason for contact and privacy notice | Contact experience | Secondary; primary on Contact |

### V1 quote-context rule

A V1 Quote Request is either a General Quote Request with no content context, or a Contextual Quote Request referencing exactly one originating Product, Project, or Application. A visitor may submit separate requests for separate subjects; one V1 request must not reference multiple contextual objects. A multi-material selection/inquiry model is Future scope and requires an approved scope change.

The originating context is presented to the visitor where it exists and must remain distinguishable from a general request. This is a conceptual business rule; it does not prescribe form fields or technical storage. No payment, customer account, live stock, or automated pricing is implied.

### Future / not included in V1

- Sample Request is not a mandatory V1 experience. It may not be exposed publicly without an approved V1 scope change and the required data/privacy and operational decisions.
- Product Inquiry and Project Inquiry may be labels or contextual variants of Request Quote, but are not separate V1 features unless later approved.

## 5. Global navigation and wayfinding

### Primary public navigation

1. **Marbles** — primary catalogue discovery.
2. **Collections** — curated product discovery.
3. **Applications** — discovery by architectural/material-use context.
4. **Projects** — approved real-world reference content.
5. **Quarry & Factory** — two distinct destinations grouped under one navigation disclosure for the material/production story.
6. **Journal** — education and organic-discovery content.
7. **About** — approved company context.

Persistent utilities: language switcher (`TR` / `EN`), visible **Request Quote** action, and access to Contact through navigation/footer. The exact navigation labels are subject to localized content approval but must preserve these information destinations.

### Secondary and footer navigation

Secondary navigation is contextual: breadcrumbs on hierarchical public pages; in-page section navigation only when a long page requires it; and related-content links. The footer provides a compact route to primary content areas, Contact, Request Quote, language access, and required legal/privacy destinations once approved.

### Internal Site Search

Internal Site Search is a **Future / Open Decision**, not mandatory V1 scope. Navigation must remain usable without it. External Search Entry remains a required discovery path for indexable public content.

## 6. Complete page inventory

Legend: **High/Medium/Low** SEO importance; **P** = public; **A** = authenticated administration; **Y** = required; **—** = not applicable. All public pages require both TR and EN under Project Rules; an exception requires documented approval.

| Page | Purpose | Primary / secondary users | Primary / secondary CTA | Required content | Related content | SEO | Access | Auth | Admin managed | TR | EN | Entry points | Exit / next actions |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Homepage | Brand orientation and high-level discovery | All / — | Explore Marbles / Request Quote | Hero story with fallbacks; featured approved discovery content; paths to catalogue and trust content | Products, collections, applications, quarry, factory, projects, journal | High | P | — | Y | Y | Y | Direct, External Search Entry, referral | Catalogue, content areas, quote |
| Marble listing | Discover the catalogue | Architect, buyer / local, project | View Product / Request Quote | Product results; approved discovery controls; clear empty state | Collections, applications, products | High | P | — | Y | Y | Y | Nav, homepage, External Search Entry | Product, collection, application, quote |
| Product detail | Evaluate one material | Architect, buyer / all | Request Quote / Related Material | Approved name, description, gallery, required-language content, product information; product publication gate | Collections, applications, projects, journal, related products | High | P | — | Y | Y | Y | Listing, collection, application, External Search Entry | Related content, quote, contact |
| Collections listing | Discover curated groupings | Architect / buyer, local | Explore Collection / View Marbles | Approved collections and introduction | Products, applications | High | P | — | Y | Y | Y | Nav, homepage, internal links | Collection detail, product listing |
| Collection detail | Evaluate a curated group | Architect / buyer, local | View Products / Request Quote | Approved collection narrative and included material discovery | Products, applications, journal | High | P | — | Y | Y | Y | Listing, External Search Entry, product links | Product, application, quote |
| Applications listing | Discover by use context | Architect, project / local, buyer | Explore Application / View Marbles | Approved application topics | Products, projects, journal | High | P | — | Y | Y | Y | Nav, homepage, External Search Entry | Application detail, products |
| Application detail | Connect a use context to relevant material discovery | Architect, project / local | Explore Suitable Marbles / Request Quote | Approved application guidance and linked products | Products, projects, journal | High | P | — | Y | Y | Y | Listing, product, journal, External Search Entry | Product, project, quote |
| Projects listing | Present approved references when launch-content condition is met | Architect, project / buyer, local | View Project / Explore Marbles | Approved project cards and discovery paths | Products, applications | Medium | P when populated | — | Y | Y | Y | Nav, homepage, product links | Project detail, product, quote |
| Project detail | Provide an approved reference case | Architect, project / buyer | Explore Related Marbles / Request Quote | Approved case-study narrative, permitted media, related materials | Products, applications, journal | Medium | P | — | Y | Y | Y | Listing, product, External Search Entry | Product, application, quote |
| Quarry | Explain approved material-origin story | Buyer, architect / all | Explore Marbles / Request Quote | Approved quarry narrative and authorized media only | Factory, products, journal | Medium | P | — | Y | Y | Y | Nav, homepage, External Search Entry | Factory, catalogue, quote |
| Factory | Explain approved production-story content | Buyer, project / architect, local | Explore Marbles / Request Quote | Approved factory narrative and authorized media only | Quarry, products, journal | Medium | P | — | Y | Y | Y | Nav, homepage, External Search Entry | Quarry, catalogue, quote |
| Journal listing | Discover educational/editorial content | Architect, buyer / all | Read Article / Explore Marbles | Approved article index and categories | Products, applications, quarry, factory | High | P | — | Y | Y | Y | Nav, homepage, External Search Entry | Article, product, application |
| Journal article | Inform and connect topical content | Architect, buyer / all | Explore Related Materials / Request Quote | Approved article content and contextual links | Products, applications, projects, quarry/factory | High | P | — | Y | Y | Y | Listing, External Search Entry, internal links | Related content, quote |
| About | Present approved company context | Buyer, project / all | Contact / Request Quote | Approved company content only | Quarry, factory, contact | Medium | P | — | Y | Y | Y | Nav, homepage, External Search Entry | Contact, quote, trust content |
| Contact | Provide general contact route | All / — | Contact / Request Quote | Approved contact information and privacy notice | Quote, about | Medium | P | — | Y | Y | Y | Nav, footer, direct | Quote, relevant content |
| Request Quote | Collect a contextual commercial enquiry | All / — | Submit Request / Contact | Purpose, contextual subject where present, privacy notice, accessible states | Product, project, application, contact | Low | P | — | Y | Y | Y | CTA, direct, contextual links | Confirmation or recoverable error state |
| Internal Site Search results | Present public-site search results when Future scope is approved | All / — | Open Result / Browse Marbles | Query context, grouped results, zero-result path | All public content | Medium | P | — | Y if V1-approved | Y | Y | Internal Site Search only | Result, listing, contact |
| 404 / not found | Recover from unavailable routes | All / — | Browse Marbles / Homepage | Clear non-deceptive unavailable-page message | Listing, homepage, contact | Low | P | — | Configured content | Y | Y | Invalid/removed URL | Catalogue, homepage, contact |
| Admin content areas | Manage approved content and governance | Authorized staff / — | Save Draft / Submit for Approval | Content, translation, status, approval, media-rights management conceptually | All managed content | — | A | Y | N/A | N/A | Authorized admin entry | Approved workflow actions |

The Internal Site Search results row is conceptual only: Internal Site Search is not mandatory V1. All other listed public content areas are mandatory V1 under `00_PROJECT_RULES.md`.

## 7. Public content hierarchy

```text
Platform
├── Marbles
│   └── Product
├── Collections
│   └── Collection detail
├── Applications
│   └── Application detail
├── Projects
│   └── Project detail
├── Journal
│   └── Journal article
├── Company
│   ├── About
│   ├── Quarry
│   └── Factory
└── Conversion
    ├── Request Quote
    └── Contact
```

| Content area | Purpose and discovery | SEO and conversion contribution |
|---|---|---|
| Marbles / Products | Core material catalogue; found through navigation, related links, collections, applications, projects, journal, and External Search Entry. | Creates product-specific landing pages and directs evaluation to a contextual quote request. |
| Collections | Curated material groupings; discovered from navigation, products, and editorial links. | Provides useful thematic discovery, not duplicate product pages. |
| Applications | Material exploration by use context; found from navigation, products, journal, and External Search Entry. | Connects user intent to relevant materials and project content. |
| Projects | Approved reference content; found from navigation when populated, products, applications, and External Search Entry. | Supports trust only with real approved information and links back to materials. |
| Journal | Educational and editorial discovery; found through navigation, External Search Entry, and contextual links. | Builds topical authority through useful articles that lead naturally to relevant content. |
| About / Quarry / Factory | Approved company and production-story content; found through navigation, homepage, and internal links. | Supports credibility and visual storytelling without unapproved claims. |
| Conversion | Quote and contact paths available from appropriate decision points. | Turns content evaluation into a clear, privacy-aware enquiry action. |

## 8. Conceptual content relationships

```text
Product
├── may appear in one or more Collections
├── may be relevant to one or more Applications
├── may be connected to approved Projects
├── may link to related Products
└── may be referenced by relevant Journal Articles

Application ── suitable Products / approved Projects / relevant Journal
Project ─────── related Products / relevant Applications
Journal ─────── relevant Products / Applications / approved Company-story content
Quarry/Factory ─ related approved Products / Journal / conversion routes
```

These are information needs, not database instructions. Every public relationship must be relevant, approved, and presented as user-helpful discovery rather than an artificial SEO link.

## 9. Product discovery architecture

### Confirmed requirements

- A scalable product listing and individual product-detail experience for 100+ products.
- Discovery through products, collections, applications, related products, approved projects, and journal content.
- Product detail pages with related-content routes and quote access.
- Product information is dynamic, approved, bilingual, and never hardcoded in public frontend source.
- The V1 catalogue begins with one neutral all-products browse view containing only published, approved, bilingual products. Products are presented in deterministic alphabetical order by the active language's approved display title.
- The all-products browse view must divide a long catalogue into explicit sequential result pages. Pagination is required conceptually; infinite scroll and load-more behavior are not V1 requirements.
- Collections and Applications provide additional V1 browse routes. No product attribute filter is required until an approved attribute is available.

### Potential / open decisions

- Which approved attributes can be used as discovery filters. Candidate concepts include color, finish, thickness, origin, availability, and material type, but no attribute is confirmed until the business supplies approved data requirements.
- Whether Internal Site Search, product-specific free-text search, advanced filtering, alternative sorting, and product comparison are part of V1. They are valuable catalogue capabilities but are not mandatory in `00_PROJECT_RULES.md`; they require an approved scope change if added to V1.
- The business meaning and publication rules for availability, dimensions, technical characteristics, and origin values.

Until these decisions are approved, V1 provides browse pages, alphabetical pagination, Collections, Applications, and related-content paths without unsupported filters or attribute claims.

## 10. Architect experience

Architects should be able to begin with a material, a visual cue, an application, an approved project, or an educational article; move to product evaluation; see relevant alternatives; and submit a contextual Request Quote.

The architecture supports visual galleries, application-based discovery, approved product characteristics, finishes only where approved, related materials, and approved project references. Downloadable specifications, CAD/BIM files, high-resolution asset libraries, and samples are **Future / Open Decisions** and must not appear until their content, rights, operational process, and V1 scope are approved.

## 11. International buyer experience

International buyers receive the same mandatory public architecture in English, including localized navigation, product/collection/application content, quote route, and applicable metadata. Quarry/factory and About content may support credibility only when claims and media are approved.

The architecture creates places for approved origin, availability, formats, logistics, and production information where legitimately supplied. It does not assert export countries, shipping capability, capacity, certifications, logistics arrangements, or customer references. Those are content requirements requiring approval, not assumed content.

## 12. Search and filter architecture

The catalogue must provide a clear browse path and a useful empty-state path. If approved discovery controls are introduced, they must explain the active selection, allow clearing it, return relevant results, and provide a no-results state with a route back to broad catalogue browsing or Contact.

Internal Site Search, its result ranking, and any search-result taxonomy are **Future / Open Decisions**. Product free-text search, advanced filters, alternative sorting, and comparison are also **Potential / Open Decisions** unless they receive a V1 scope change. No Internal Site Search result or filter must create unsupported public claims or uncontrolled low-value indexable pages.

## 13. Multilingual architecture

Turkish and English are language variants of one underlying conceptual content entity, not independent Products, Collections, Applications, Projects, Journal Articles, About items, Quarry items, or Factory items. The same conceptual entity owns its cross-language relationships; each language variant supplies its own public title, description/body, navigation-visible text, URL identifier, SEO metadata, and applicable structured public metadata.

Each required public page and its required content must have Turkish and English variants. A conceptual entity is language-complete only when both required variants are prepared and approved. Each language variant is approved against its exact version, assets, and language; changing one language's public content requires re-approval of that changed variant. A relationship must not appear publicly in a language variant unless the relevant content and relationship presentation are approved for that public language.

A language switch must take users to the equivalent variant of the same conceptual entity. It must never send users to a different product/content item or silently display untranslated content. If an equivalent variant is missing, the entity cannot be public unless a documented, Content Owner-approved language exception exists. In that exception state, the public behavior must be explicit and non-deceptive; it cannot imply a complete equivalent exists.

Localized navigation, forms, validation/error text, metadata, and applicable structured public metadata are required. The conceptual hierarchy is locale-first, for example:

```text
/{locale}/marbles
/{locale}/marbles/{localized-product-identifier}
/{locale}/collections/{localized-collection-identifier}
/{locale}/applications/{localized-application-identifier}
/{locale}/projects/{localized-project-identifier}
/{locale}/journal/{localized-article-identifier}
```

This example defines hierarchy only. Each language variant has a corresponding localized public URL. Final route patterns, slug policy, canonical behavior, redirect behavior, and `hreflang` are reserved for `06_SEO_URL_ARCHITECTURE.md`; this document does not finalize them.

## 14. SEO information architecture

Organic discovery is supported by approved, bilingual product landing pages; useful collection and application pages; genuine project references; educational journal articles; breadcrumbs; and contextual internal links. Each page should answer a distinct user need and lead to relevant next content or conversion action.

Content clusters conceptually connect material discovery, application intent, approved reference content, and education. Visitors arriving through an External Search Entry can therefore land directly on a product, application, project, or article and continue coherently. This supports discoverability; it does not guarantee rankings and must never rely on keyword stuffing, thin pages, or fabricated metadata.

## 15. Internal discovery model

Primary routes:

```text
Homepage → Marbles → Product → Related Collection/Application/Project/Journal → Request Quote
Homepage → Applications → Application → Suitable Products → Request Quote
Homepage → Projects → Project → Related Products / Applications → Request Quote
Journal → Relevant Product / Application / Company-story content → Request Quote
Quarry or Factory → Catalogue / relevant Journal → Request Quote
```

Reverse discovery is equally required where relevant:

```text
Collection → Products
Application → Suitable Products and approved Projects
Project → Related Products and Applications
Product → Related Collections, Applications, Projects, Journal
```

Relationship links must be contextual and useful; they cannot be used to manufacture irrelevant linking volume.

## 16. Journal architecture

The Journal is an approved educational and editorial area, not a content-volume mechanism. Potential themes are material knowledge, architecture, applications, care/maintenance, production, quarry/factory context, and design inspiration. No article is presumed to exist.

Articles may be organized conceptually by approved theme and connected to relevant products, applications, projects, or approved quarry/factory content. Discovery paths include the Journal index, External Search Entry, related links from product/application pages, and links from articles to the next relevant material or enquiry action.

## 17. Quarry and factory architecture

Quarry and Factory are distinct public content areas that support material-origin storytelling, visual storytelling, and credibility. They may contain only approved text, media, and relationships to relevant products or journal content.

They must not state or imply unapproved capacity, machinery inventory, certifications, production numbers, customers, project claims, logistics capabilities, ownership, or extraction claims. Their role is trust and context, not unverified proof.

### 17.1 Project availability at launch

The Projects capability is mandatory V1 scope, but public project population is not assumed. The V1 CMS/governance capability for Projects must exist regardless of launch content.

At launch, the public Projects navigation, listing, and detail routes may be exposed only if at least one Project has approved bilingual content, verified media rights, and a valid publication record. If no such Project exists, the Projects capability remains available to authorized administrators, while the public Projects navigation/listing is hidden rather than populated with placeholders, fictional cases, or a misleading empty page. No Project detail route is public without a published Project.

This is a launch-content rule, not a claim that any approved project exists. The business must confirm before launch whether the minimum public project-content condition is met; the platform launch itself is not blocked solely by the absence of public Project content.

## 18. Admin and CMS content areas

The following must be manageable conceptually because they are dynamic, governed, bilingual, or subject to approval:

| Managed content | Why it must be manageable |
|---|---|
| Products and product media | Catalogue changes, approved descriptions, visual updates, publication gate, and related discovery. |
| Collections and applications | Curated and contextual discovery must evolve without source-code changes. |
| Projects and project media | References require approval, media-rights control, updates, and removal handling. |
| Journal and article relationships | Editorial content requires bilingual approval, contextual links, and revision control. |
| About, quarry, and factory content | Company claims and media require controlled approval and updates. |
| SEO/public metadata | Approved localized discovery information must stay aligned with public content. |
| Translations | TR/EN completeness, version-aware approval, and approved exceptions must be managed. |
| Publication, approval, and lifecycle state | Public visibility, approval evidence, archiving, and URL decisions are governed requirements. |
| Media rights | Every public asset needs verified authorization before publication. |
| Quote-request content context | Enquiries need a manageable General or exactly one Product/Project/Application context, purpose, and privacy-aware public messaging. |

No CMS interface, data structure, role schema, or technical workflow is decided here.

## 19. Content governance flow

### 19.1 Conceptual responsibilities

**Author / Editor**, **Approver**, and **Publisher** are distinct conceptual responsibilities. One authorized person may hold more than one responsibility, but every important action must remain auditable under the actor's identity.

- Author / Editor prepares or updates content and associated language variants; this does not grant publication.
- Approver is the Content Owner / Authorized Company Representative defined by Project Rules and approves the exact version, assets, and language variant(s).
- Publisher makes an approved item publicly visible; a Publisher must not publish an unapproved, incomplete-language, or rights-unverified item.

Approval is distinct from publication. Editing published public content changes the affected version and requires re-approval before the changed variant can remain or become public. Organizational assignment of real people to these responsibilities remains an Open Decision; the responsibilities themselves are fixed.

Conceptual flow for every governed public item:

```text
Draft
  ↓
Prepared in all required languages and with verified media rights
  ↓
Content Owner approval record for exact version/assets/languages
  ↓
Approved
  ↓
Published
  ↓
Update → re-approval of affected version/content → Published
  ↓
Unpublished / Archived / Permanently Removed with recorded SEO outcome
```

Unapproved, incomplete-language, rights-unverified, or product-gate-incomplete items cannot become public. Permanent removal and public URL changes require the governance and SEO decision prescribed in `00_PROJECT_RULES.md`.

### 19.2 Lifecycle and public experience

| State | Public-user behavior |
|---|---|
| Draft | Never public, indexable, or reachable as a public content page. |
| Approved | Eligible for publication but remains non-public until explicitly published. |
| Published | Publicly accessible in both required approved language variants, unless an approved exception exists. |
| Unpublished | Previously public content is no longer shown in navigation, listings, or public relationships. Its recorded SEO outcome determines the public URL behavior; it is not treated as an active public page. |
| Archived | Not part of active public inventory or navigation. It remains internally retained only; if it had a public URL, its recorded SEO outcome governs the visitor result. |
| Permanently Removed | No active public content page remains. The explicitly recorded `404`, `410`, `301` to a genuinely relevant replacement, or `noindex` outcome from Project Rules governs the visitor result. |

An unavailable public page, an intentionally non-public item, and a genuinely relevant replacement are distinct states. The information architecture does not select the SEO outcome; it requires the approved lifecycle decision from `00_PROJECT_RULES.md`.

## 20. V1 versus future

### Mandatory V1

- All public content areas and quote/contact experiences enumerated as mandatory in `00_PROJECT_RULES.md`.
- TR/EN public architecture, dynamic governed content, responsive images, technical SEO foundations, accessibility/responsiveness, and homepage hero fallbacks.
- Contextual discovery among products, collections, applications, projects, journal, quarry/factory, and conversions.

### Future / post-V1

- Sample-request experience.
- Internal Site Search.
- Product-specific free-text search, advanced filters, alternative sorting, and comparison.
- Downloadable architect asset libraries, CAD/BIM, and technical-document libraries.
- Payment, cart, accounts, portals, live stock/pricing, and named third-party operational integrations.

### Scope guard

Future items must not be implemented or publicly implied in V1 without the documented, approved scope change required by `00_PROJECT_RULES.md`.

## 21. Open decisions

### A. Domain-model blocking

None. The conceptual identity of language variants, V1 quote context, governance responsibilities, product browsing, and public Project availability are explicitly defined in this document.

### B. Architecture-independent business or launch decisions

1. **Identity of the Content Owner / Authorized Company Representative.** The role and authority are fixed; the named individual must be confirmed before public publication.
2. **Legal/privacy requirements, data recipients, retention, and deletion for Quote Requests.** These must be approved before production data collection but do not change the V1 conceptual distinction between General and Contextual Quote Requests.
3. **Approved business content.** The company must supply and approve any origin, format, availability, technical, logistics, quarry/factory, or project content before publication. Absence of approved project content keeps the public Projects area hidden under the launch rule.
4. **Launch confirmation for public Projects.** Confirm whether at least one qualifying approved bilingual Project exists at launch. This affects public navigation/content availability, not the V1 Projects capability.

### C. Implementation-stage decisions

1. **Exact browser/device/connection matrix and measurable V1 performance/accessibility acceptance criteria.** These belong in `12_PERFORMANCE_ACCESSIBILITY.md`.
2. **Approved product attributes for future discovery controls.** No filter is needed for V1 browsing; any approved filter design belongs to later scope/implementation work.
3. **Future-scope approvals.** Internal Site Search, product free-text search, advanced filters, alternative sorting, comparison, Sample Request, and downloadable architect assets require an approved V1 scope change before implementation.
4. **Final localized URL, slug, canonical, redirect, and `hreflang` rules.** These belong in `06_SEO_URL_ARCHITECTURE.md` and must preserve the language-variant identity rule defined here.

## 22. Consistency check

| Check | Result |
|---|---|
| Rules consistency | Pass: follows approval, truthfulness, bilingual, scope, lifecycle, privacy, security, and blueprint-boundary rules. |
| User consistency | Pass: each primary user has entry, discovery, evaluation, trust, and either a General or single-context Request Quote/Contact path. |
| Content consistency | Pass: every mandatory public area has discovery and related-content paths. |
| Conversion consistency | Pass: every primary journey reaches Request Quote or Contact. |
| Language consistency | Pass: every public item is one conceptual entity with TR/EN language variants, language-specific approval, and equivalent-page switching unless an approved exception exists. |
| SEO consistency | Pass: distinct useful content and contextual linking are defined without rank guarantees or keyword spam. |
| CMS consistency | Pass: all governed dynamic content is identified conceptually. |
| Scope consistency | Pass: Internal Site Search, advanced discovery, sample, downloads, and commerce are classified future/open, not added to V1. |
| Truthfulness | Pass: no company facts, capacity, certifications, customers, projects, or export claims are asserted. |
