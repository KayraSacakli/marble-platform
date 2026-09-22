# Domain Model

## 1. Purpose and boundary

This document defines the business/content concepts, their meanings, conceptual relationships, lifecycle, and governing invariants for the marble platform. It is the bridge between approved information architecture and future database design.

It deliberately does not define tables, fields, identifiers, keys, storage, API shapes, CMS screens, authentication mechanisms, or implementation frameworks.

## 2. Domain boundaries

| Domain | Responsibility |
|---|---|
| Catalog | Products and the discovery groupings that make a growing material catalogue usable. |
| Content and Editorial | Collections, Applications, Projects, Journal Articles, and Company/About, Quarry, and Factory content. |
| Localization | One conceptual content identity and its required TR/EN language variants. |
| Media | Media assets, their contextual presentation, alternative text, and verified publication rights. |
| Governance | Preparation, approval, publication, lifecycle, and auditability of governed public content. |
| Inquiry / Conversion | General and single-context Quote Requests, their processing purpose, and privacy-aware handling. |
| Company Information | Approved factual and editorial company-facing content, including approved contact information. |

## 3. Conceptual content identity and localization

### 3.1 Conceptual Content Entity

A **Conceptual Content Entity** is one business/content identity independent of language. A Product, Collection, Application, Project, Journal Article, About item, Quarry item, or Factory item is one such entity. It is not duplicated merely because it is presented in Turkish and English.

### 3.2 Language Variant

A **Language Variant** is the Turkish (`tr`) or English (`en`) public representation of a single Conceptual Content Entity. It carries language-specific public expression, including title, body/description, navigation-visible text, localized URL identifier, SEO metadata, and applicable structured public metadata.

Language variants share the same conceptual identity and its cross-content relationships. They are not separate Products, Articles, Projects, or commercial offerings.

### 3.3 Completeness, approval, and visibility

An entity is language-complete when its required TR and EN variants are prepared and approved. Approval is attached conceptually to the exact content version, associated assets, and language variant(s) approved. A changed public language variant requires re-approval of that changed variant.

A public relationship may appear in a language variant only when its presentation is approved for that language. The language switch always leads to the equivalent variant of the same conceptual entity. If an equivalent variant is missing, the entity is not publicly eligible unless a documented Content Owner-approved exception exists; it must never silently display unrelated or untranslated content.

## 4. Domain concept catalogue

| Concept | Purpose | Type | Language Variant? | Lifecycle? | Approval Required? | Public? | Key relationships |
|---|---|---|---|---|---|---|---|
| Product | A distinct marble or natural-stone offering. | Catalog content | Yes | Yes | Yes | When published | Collection, Application, Project, Journal Article, Media Asset, Quote Request |
| Collection | A curated grouping for Product discovery. | Catalog/editorial content | Yes | Yes | Yes | When published | Products, Applications, Journal Articles, Media Assets |
| Application | A material-use context that leads visitors to suitable Products and approved Projects. | Editorial/discovery content | Yes | Yes | Yes | When published | Products, Projects, Journal Articles, Media Assets, Quote Request |
| Project | A real, approved built work or case study. | Editorial/reference content | Yes | Yes | Yes | When published and launch condition is met | Products, Applications, Media Assets, Journal Articles, Quote Request |
| Journal Article | Approved educational or editorial material. | Editorial content | Yes | Yes | Yes | When published | Products, Applications, Projects, Quarry/Factory content, Media Assets |
| Company/About Content | Approved company-facing factual or editorial content. | Company content | Yes | Yes | Yes | When published | Contact information, Media Assets, Quarry/Factory content |
| Quarry Content | Approved material-origin storytelling content. | Company/editorial content | Yes | Yes | Yes | When published | Products, Journal Articles, Media Assets |
| Factory Content | Approved production-story content. | Company/editorial content | Yes | Yes | Yes | When published | Products, Journal Articles, Media Assets |
| Media Asset | Original or derived visual/video asset with use rights and contextual presentation. | Media | Context-dependent | Rights/lifecycle relevant | Yes for public use | Only when eligible | Content entities, language variants, media presentations |
| Quote Request | Commercial enquiry from a visitor. | Inquiry | Public messages are localized | Processing lifecycle | Not content-approved; privacy rules apply | Submitted through public form | Zero or exactly one Product, Project, or Application context |
| Approval | Evidence that a specific content version/assets/languages were approved. | Governance record | Yes, where language-specific | Outcome/history | Created by Approver | Never public as content | Content variant/version, assets, Approver, Publisher eligibility |
| Internal Actor | Authorized internal person acting as Author/Editor, Approver, Publisher, Content Owner, or Authorized Company Representative. | Governance responsibility | No | Account/role implementation deferred | N/A | Not public by default | Content actions, approvals, audit trail |
| Content Lifecycle State | Business state governing public eligibility. | Governance state | Entity and variant aware | Yes | State transitions governed | Only Published is normally public | Approval, media rights, public URL outcome |

## 5. Catalog domain

### 5.1 Product

A Product represents one distinct marble or natural-stone offering. It must support the existing 100+ catalogue and future growth without public frontend hardcoding.

Conceptually, a Product includes its one conceptual identity; required TR/EN variants; approved product name and description; approved product media; approved technical/commercial information only where supplied; lifecycle and publication eligibility; and discovery links to Collections, Applications, Projects, Journal Articles, and related Products.

Product publication requires the rules already established: required-language approved content, name, unique public URL identity, description, primary image, meaningful alternative text for required informative images, valid publication state, and valid approval evidence. Technical, origin, availability, format, dimension, or suitability information is optional in the domain until approved business content exists; no value is inferred.

### 5.2 Collection

A Collection is a curated grouping of Products used for discovery, not a duplicate Product catalogue or an unsupported claim. A Product may appear in one or more Collections, as explicitly required by the information architecture. A Collection may contain zero or more Products while being prepared; its public usefulness depends on approved, published relevant Product links.

### 5.3 Application

An Application is a conceptual material-use context. It is not automatically a fixed production taxonomy and does not assert product suitability without approved content. An Application may connect to relevant Products, approved Projects, and Journal Articles to support discovery. A Product may be relevant to one or more Applications.

### 5.4 Related Product

A Related Product is not an independent content type. It is an approved, relevant discovery relationship from one Product to another Product. It is optional and must not create irrelevant internal links merely for SEO.

### 5.5 V1 catalogue browsing

The V1 catalogue contains only published, approved, bilingual Products. Its primary browse route is an all-products view in deterministic alphabetical order by the active language's approved display title, divided into explicit sequential result pages. Collections and Applications are additional browse routes.

No attribute filter, Internal Site Search, product free-text search, comparison, alternative sort, infinite scroll, or load-more behavior is a V1 domain requirement. These may be introduced only through an approved future scope change. The exact mechanics of pagination are an implementation decision, not a domain rule.

## 6. Editorial and company-content domain

### 6.1 Project

A Project is a real, approved built work or case study. It can contain approved bilingual editorial content, authorized media, and relevant relationships to Products and Applications. It must never be used to invent clients, architects, locations, certifications, statistics, or outcomes.

Projects capability is mandatory V1. Public Project visibility is conditional: a Project can be public only when it is published, bilingual or has an approved language exception, has verified media rights, and has valid approval evidence. The public Projects navigation/listing/detail experience is exposed only when at least one qualifying Project exists. If none exists at launch, the capability remains manageable internally but public Project navigation/listing is hidden; no placeholders or fictional projects are permitted.

### 6.2 Journal Article

A Journal Article is approved educational/editorial content, not a content-volume mechanism. It may relate contextually to Products, Applications, Projects, Quarry Content, or Factory Content. Themes such as material knowledge, architecture, applications, care/maintenance, production, quarry/factory context, and design inspiration are editorial directions, not mandatory taxonomy concepts. Categories/tags are not modeled unless later approved as a genuine requirement.

### 6.3 Company/About Content

Company/About Content represents approved company-facing editorial or factual content. The domain does not require a complex enterprise-company concept. Approved contact information may be presented through this content area or the Contact experience, but no company fact is assumed.

### 6.4 Quarry Content and Factory Content

Quarry Content and Factory Content are separate conceptual content areas for approved material-origin and production-storytelling. They may relate to Products, Journal Articles, and authorized Media Assets. Capacity, reserves, machinery inventory, locations, extraction, production statistics, certifications, export volume, customers, and technical claims are not modeled as facts unless later approved as real content requirements.

If machinery is later shown, it is approved factual editorial content/media; the current architecture does not require a dedicated machinery domain concept.

## 7. Media domain

### 7.1 Media Asset

A Media Asset represents an original image, video, logo, or other visual asset, plus any derived/display representation needed to present it. Derived/display media is conceptually tied to an original asset; it does not change the actual marble/product appearance.

Media can be used as product photography, product gallery material, close-up/contextual imagery, project imagery, quarry/factory imagery, hero media, video, preview, or thumbnail. A Media Asset may be associated with one or more approved content entities where that reuse is relevant and authorized.

### 7.2 Media presentation and accessibility

An informative or contextual media presentation requires meaningful alternative text describing the image or its function. Decorative media may have empty-alt semantics. Repeated media may avoid duplicated alternative text when the context already expresses the same meaning. Alternative text is not an SEO keyword container.

### 7.3 Rights and public eligibility

Public use requires verified appropriate publication authorization. The existence of product photography, quarry footage, factory footage, project photography, logos, architect imagery, employee/person imagery, or video does not establish public-use rights. An unverified asset cannot support public eligibility of content that requires it.

The media domain does not prescribe storage, transformations, CDN, upload mechanism, or image-processing implementation.

## 8. Governance domain

### 8.1 Internal actors and responsibilities

The governance domain uses distinct conceptual responsibilities:

- **Author / Editor:** Prepares or updates content and language variants. This responsibility alone cannot approve or publish content.
- **Approver:** The Content Owner / Authorized Company Representative who approves exact content version(s), associated assets, and language variant(s).
- **Publisher:** Makes an eligible approved item publicly visible. A Publisher cannot publish unapproved, incomplete-language, or rights-unverified content.
- **Content Owner / Authorized Company Representative:** The sole approval authority for company-specific public content. The real named individual is not known yet and remains an Open Decision.

One internal actor may carry more than one responsibility, but each material action must remain attributable to the actor identity. Role/account implementation is outside this document.

### 8.2 Approval

An Approval is the conceptual evidence that a specific version of governed content is approved for specified language variant(s) and associated assets. It records who approved, when, what version/assets/languages were approved, and the outcome. Only a valid approving outcome makes the covered language variant eligible for publication.

Approval is distinct from publication. Editing a published language variant or changing its material associated assets invalidates public eligibility for the affected changed version until re-approval. Approval does not by itself make content public.

### 8.3 Lifecycle

| State | Meaning | Approval / publication / public visibility |
|---|---|---|
| Draft | Prepared or imported content not yet approved. | Not eligible for publication; never public or indexable. |
| Approved | Exact version/assets/languages have valid approval. | Eligible for publication; remains non-public until published. |
| Published | Eligible content intentionally made public. | Requires valid approval, required language condition, and eligible media; publicly accessible. |
| Unpublished | Previously public content intentionally withdrawn from active public use. | Not in public listings/navigation/relationships; a recorded SEO outcome governs former public URLs. |
| Archived | Internally retained but no longer active public inventory. | Non-public; former public URL behavior follows its recorded SEO outcome. |
| Permanently Removed | Content no longer exists as an active public resource. | Non-public; recorded `404`, `410`, relevant `301`, or `noindex` outcome governs public behavior. |

The Author/Editor prepares changes; the Approver creates valid approval; the Publisher publishes only eligible content. The precise workflow mechanism is deferred, but these conceptual transition responsibilities are fixed.

## 9. Inquiry and conversion domain

### 9.1 Quote Request

A Quote Request is a commercial enquiry submitted for the stated request purpose. It carries the submitted contact information and message/request information necessary for that purpose, the submission time, a processing status, processing responsibility, and applicable privacy/consent information where required by approved law/policy.

It is exactly one of the following:

```text
General Quote Request
OR Product-context Quote Request
OR Project-context Quote Request
OR Application-context Quote Request
```

A General Quote Request has no catalog/editorial content context. A contextual Quote Request references exactly one originating Product, Project, or Application. A Quote Request may not reference Product + Project + Application, two Products, or multiple contextual objects simultaneously. Visitors needing multiple subjects submit separate V1 requests. Multi-material inquiry is future scope.

Quote Request content context is a business/discovery reference, not proof of live availability, price, lead time, or a commercial commitment.

### 9.2 Inquiry processing and privacy

Quote Requests require purpose limitation, data minimization, access control, least privilege, server-side validation, malicious-input protection, spam protection, rate limiting, storage limitation, and an accessible privacy notice before submission. Legal basis, recipients, retention period, deletion process, and jurisdiction-specific duties remain open business/legal decisions. They must be approved before production collection, but do not block conceptual modelling of the General-versus-single-context rule.

Sample Request, dedicated Product Inquiry, dedicated Project Inquiry, payment, cart, customer accounts, and automated pricing are not V1 domain concepts. A contextual Quote Request supplies the allowed V1 product/project/application enquiry behavior.

## 10. Relationship analysis

| Relationship | Meaning and conceptual cardinality | Optionality and effect |
|---|---|---|
| Conceptual Content Entity → Language Variant | One entity has one required TR and one required EN variant for normal public eligibility; approved exception is possible. | Required for ordinary public visibility; governs language switch and approval. |
| Product → Collection | A Product may appear in one or more curated Collections; a Collection may contain zero or more Products while prepared. | Optional; drives discovery when both sides are public. |
| Product → Application | A Product may be relevant to one or more Applications; an Application may point to zero or more Products. | Optional; supports use-context discovery only with approved claims/content. |
| Product → Project | A Product may be connected to approved Projects; a Project may reference relevant Products. | Optional; supports reference discovery only for qualifying public Projects. |
| Product → Product | One Product may recommend zero or more related Products. | Optional; relationship must be relevant and approved. |
| Product / Collection / Application / Project / Journal / Company Content → Media Asset | A content entity may have zero or more relevant Media Assets; an authorized asset may be reused where relevant. | Media rights and contextual eligibility affect publication. |
| Journal Article → Product / Application / Project / Quarry / Factory Content | An article may connect to zero or more relevant public content entities. | Optional; supports useful editorial discovery, not link-volume manufacture. |
| Quarry Content / Factory Content → Product / Journal Article | Storytelling content may connect to relevant Products and Journal Articles. | Optional; only approved factual/editorial association. |
| Quote Request → Context | A request has either no context or exactly one Product, Project, or Application context. | Required invariant; contextual reference guides processing but makes no commercial claim. |
| Approval → Language Variant / assets | An approval covers exact governed variant/version and associated assets. | Required before public eligibility; changed material invalidates the coverage for that changed version. |
| Internal Actor → Governance action | An actor may author/edit, approve, publish, archive, or otherwise make auditable governed actions within their responsibility. | Required for accountability; authorization implementation is deferred. |

## 11. Domain invariants

1. TR and EN are language variants of one conceptual content identity, never unrelated business entities.
2. Required public content is normally language-complete: both variants are prepared and approved; any exception is documented and Content Owner-approved.
3. A language switch always targets the equivalent variant of the same entity and never unrelated/untranslated content.
4. Approval is language/version/assets specific and is required before publication.
5. A Publisher cannot publish unapproved, incomplete-language, or rights-unverified content.
6. Informative media needs meaningful alternative text; alternative text cannot be keyword stuffing.
7. Unverified media rights prevent public use of that asset and can prevent publication eligibility of dependent content.
8. A Product cannot rely on hardcoded public frontend product data.
9. A Product is public only when it meets the approved product publication gate.
10. A Quote Request is either general or associated with exactly one allowed context: Product, Project, or Application.
11. A contextual Quote Request does not imply price, live stock, availability, or commercial commitment.
12. Draft, Approved, Published, Unpublished, Archived, and Permanently Removed are distinct business states.
13. Unpublished and Archived content has no active public listing/navigation/relationship path; Permanently Removed content is not an active public resource.
14. Removed/unpublished public URLs require an explicit recorded SEO outcome; blanket homepage redirects are prohibited unless explicitly justified and approved.
15. Projects capability exists in V1 even when no approved public Project exists; public Project navigation/listing remains hidden in that circumstance.
16. V1 catalogue browsing is alphabetical sequential-page browsing of published, approved, bilingual Products; advanced discovery features are not implied.
17. No public fact, technical claim, project claim, certification, capacity, export/logistics claim, or media usage right may be fabricated or inferred.

## 12. Traceability

| Concept | Approved source |
|---|---|
| Product, Collections, Applications, catalogue browsing | `01_MASTER_INFORMATION_ARCHITECTURE.md` — Product discovery architecture; Content relationships; V1 scope. |
| Project and launch visibility | `01_MASTER_INFORMATION_ARCHITECTURE.md` — Project availability at launch; Content governance flow. |
| Journal, Company/About, Quarry, Factory | `01_MASTER_INFORMATION_ARCHITECTURE.md` — Journal architecture; Quarry and factory architecture; Admin/CMS content areas. |
| Conceptual identity and language variants | `01_MASTER_INFORMATION_ARCHITECTURE.md` — Multilingual architecture. |
| Media rights and alternative text | `00_PROJECT_RULES.md` — Content, media, and publication governance; Image alternative text. |
| Approval, roles, lifecycle | `00_PROJECT_RULES.md` — Governance and truthful content; Content lifecycle; Security baseline; and `01_MASTER_INFORMATION_ARCHITECTURE.md` — Conceptual responsibilities and lifecycle. |
| Quote Request and exactly-one-context rule | `00_PROJECT_RULES.md` — Personal data and quote requests; `01_MASTER_INFORMATION_ARCHITECTURE.md` — Conversion architecture and V1 quote-context rule. |
| V1 / future boundaries | `00_PROJECT_RULES.md` — Mandatory V1 scope; `01_MASTER_INFORMATION_ARCHITECTURE.md` — V1 versus future. |

## 13. Open decisions

### Domain-model blocking

None. The approved architecture supplies the required conceptual identity, language, lifecycle, governance, media, catalog, inquiry-context, and Project launch rules.

### Domain-model non-blocking

1. The real identity of the Content Owner / Authorized Company Representative.
2. Legal/privacy basis, recipients, retention, deletion, and jurisdiction-specific duties for Quote Request data.
3. Whether qualifying approved public Project content will exist at launch.
4. Which real product attributes/content the company will approve for publication, including whether any support future discovery controls.

### Later implementation decisions

1. Database representation of content identities, language variants, relationships, lifecycle, approval, media, actors, and inquiries.
2. API contracts, CMS interaction design, authentication/authorization mechanisms, audit-log implementation, and storage/CDN behavior.
3. Final localized URL, slug, canonical, redirect, and `hreflang` policy.
4. Browser/device/performance criteria and the implementation of pagination, accessibility, media delivery, forms, spam protection, and rate limiting.
5. Any future-scope Internal Site Search, advanced filtering, comparison, Sample Request, downloadable assets, commerce, accounts, portals, or integrations.

## 14. Consistency and quality check

| Check | Result |
|---|---|
| Content concepts | Pass: all mandatory catalog, editorial, company, media, inquiry, and governance concepts are modeled. |
| Multilingual identity | Pass: one conceptual entity with TR/EN variants, language-specific approval, and missing-language behavior is explicit. |
| Governance | Pass: Author/Editor, Approver, Publisher, Content Owner, approval evidence, re-approval, and lifecycle are distinct. |
| Media | Pass: rights, alternative text, contextual association, and public eligibility are modeled without storage assumptions or product-altering AI transformations. |
| Conversion | Pass: General and exactly-one-context Product/Project/Application Quote Requests are explicit; non-V1 inquiry features are excluded. |
| Lifecycle | Pass: Draft, Approved, Published, Unpublished, Archived, and Permanently Removed are distinct. |
| Project launch | Pass: capability versus public visibility is explicit; no project fact is invented. |
| Product scalability | Pass: 100+ current and future Products are supported conceptually without hardcoding. |
| Truthfulness and scope | Pass: no unapproved company, technical, capacity, certification, customer, project, logistics, or export claim is introduced; no excluded V1 feature is added. |
| Implementation leakage | Pass: no database, ORM, API, storage, UI, or framework implementation is prescribed. |
