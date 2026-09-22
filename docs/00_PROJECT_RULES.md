# Project Rules

## 1. Immutable rules and authority

This document is the binding governing document for the premium international marble platform until an explicit approved amendment replaces a named rule. Approved blueprint documents must follow it; code, generated output, preferences, and assumptions may not redefine it.

AI and implementation agents must not silently decide or change information architecture, domain/data model, public claims, SEO or URL architecture, user flows, security, privacy, content governance, media rights, or scope. If a required decision is undefined or conflicts with an approved document, it must be recorded as an **OPEN DECISION**, its impact explained, and implementation paused. No business fact or behavior-changing default may be invented.

### 1.1 Glossary

- **Product:** A distinct marble or natural-stone offering.
- **Collection:** A curated grouping of products.
- **Application:** A material-use context, for example a bathroom, facade, floor, kitchen, hotel, or staircase.
- **Project:** A real, approved built work or case study.
- **Journal Article:** Approved editorial or technical content.
- **Quote Request / Sample Request:** A user-submitted commercial or sample enquiry, where enabled in V1 scope.

Different terms for these concepts require an approved glossary amendment.

## 2. Governance and truthful content

The **Content Owner / Authorized Company Representative** is the sole approval authority for company-specific public content. The individual identity is an **OPEN DECISION** and must be recorded before any public content is published.

Valid approval is a durable record in the approved content workflow that identifies: the approver role and identity, approval timestamp, the exact content/version or asset reference, and the approved publication language(s). Approval is mandatory before publication. AI-generated, imported, draft, placeholder, and unverified content are automatically unapproved until this record exists.

Unapproved content must remain non-public and non-indexable. It must not be represented as factual in prototypes, metadata, structured data, images, captions, or public copy.

Never invent, infer, exaggerate, or publish without approval: company history, ownership, team, locations; quarry, factory, machinery, capacity, production, origin, technical, availability, suitability, or commercial claims; certifications, standards, awards, test results, sustainability claims; export, logistics, lead-time, pricing, legal, contact, partnership, customer, architect, or project information.

## 3. Content, media, and publication governance

Product, collection, application, project, journal, media, and SEO content must originate through an approved ingestion process: manual CMS entry, controlled import, approved API integration, or approved structured-data import. No method may bypass validation, language, approval, media-rights, or publication requirements.

Public frontend source code must not hardcode product records, specifications, availability, image metadata, SEO metadata, or company-specific content. Static interface labels, design tokens, and approved functional fallbacks are allowed.

Real-world existence does not establish publication rights. Product, quarry, factory, project, customer, architect, employee/person imagery, logos, and video require verified appropriate publication authorization before public use. Unverified media is unapproved media.

### 3.1 Image alternative text

Informative product and contextual images require meaningful alternative text that describes the image or its function. Decorative images may use correct empty-alt semantics. Repeated images may avoid repetitive text when context already conveys the same information. Alternative text must never be used as an SEO keyword container.

### 3.2 Content and URL lifecycle

Content states are: **Draft** (not approved, non-public), **Approved** (approved but non-public), **Published** (public), **Unpublished** (previously public, now non-public), **Archived** (retained internally, non-public), and **Permanently Removed** (deleted under an approved retention/deletion process).

Every removal or unpublication of a public URL requires an explicit, recorded SEO outcome: `404`, `410`, `301` to a genuinely relevant replacement, or `noindex` where appropriate. AI and developers may not choose this silently. Redirecting removed URLs to the homepage is prohibited unless specifically justified and approved.

### 3.3 Product publication gate

A product may be published only when it has approved required-language content, product name, unique slug, description, primary image, meaningful alternative text for required informative images, a valid publication state, and a valid content-approval record. The detailed validation mechanism belongs to later specifications; this gate is mandatory.

## 4. Languages and public SEO integrity

All public navigation, homepage, product, collection, application, project, journal, about/company, quarry, factory, contact, quote/sample-request form, user-facing validation/error text, SEO metadata, and applicable public structured metadata must be available in Turkish (`tr`) and English (`en`).

A content-type, page, or individual-item language exception requires a documented reason and explicit Content Owner approval before publication. Translating only header or footer content does not satisfy this rule. Localized routes, canonical URLs, and `hreflang` rules must be defined in the approved SEO URL architecture.

SEO must be useful, accurate, accessible, and contextually relevant. Keyword stuffing, hidden text, deceptive redirects, thin or duplicated location pages, fabricated structured data, and automated low-value content are prohibited. Search terms may be used only naturally and meaningfully. Metadata, sitemaps, canonical URLs, image data, and video data must reflect approved real content.

## 5. Mandatory V1 scope

`00_PROJECT_RULES.md` is authoritative for V1 scope. Other documents may detail or decompose this scope but may not silently expand, reduce, or contradict it.

V1 must include:

- bilingual public platform and localized content structure;
- product catalogue and product detail pages;
- collection, application, project, quarry, factory, journal, about, contact, and quote-request experiences;
- CMS-based management of approved public content, media, and SEO metadata;
- responsive image delivery and technical SEO foundations;
- accessible, responsive public and admin interfaces;
- a scroll-driven homepage hero with functional non-video and reduced-motion fallbacks.

V1 excludes online payment, cart, checkout, customer accounts, ERP/inventory/pricing/CRM/shipping/accounting integrations, live stock or automated pricing, portals, unapproved AI-published content, mass-generated SEO pages, and unapproved personal-data collection or third-party sharing.

Any scope change requires a documented change record identifying the affected rule/documents, rationale, dependencies, explicit approver, and approval timestamp. It must be approved before implementation.

## 6. Accessibility, device support, and performance

Mobile, tablet, and desktop are first-class V1 experiences. V1 must define its supported major browser families and device/connection test matrix in `12_PERFORMANCE_ACCESSIBILITY.md`.

All public and admin workflows must support keyboard use, semantic HTML, visible focus, screen-reader-accessible names and feedback, adequate contrast, accessible forms, and reduced-motion preferences. Essential content, navigation, and conversion paths may not depend solely on animation, hover, video, color, or pointer precision.

Performance and accessibility are release requirements, not optimization targets. `12_PERFORMANCE_ACCESSIBILITY.md` must define measurable V1 acceptance criteria, the test method, and supported browser/device matrix. V1 is incomplete if any mandatory criterion fails.

Critical content and conversion paths must remain usable if JavaScript is delayed, video or media fails, or motion is reduced. Major interactions require defined loading, success, error, empty, and retry states where relevant.

## 7. Personal data and quote requests

Quote and sample-request data may be collected only when necessary for the stated request purpose. The platform must apply data minimization, purpose limitation, access control, least-privilege access, server-side validation, malicious-input protection, spam protection, rate limiting, storage limitation, and an accessible privacy notice before submission.

The legal basis, authorized data recipients, retention period, deletion process, and jurisdiction-specific privacy requirements are **OPEN DECISIONS**. They must be approved before form data is collected in production. No retention period may be invented.

## 8. Security baseline

Production admin access requires authenticated users, role-based authorization, least privilege, server-side authorization checks, and auditable records of important content and administrative changes. Admin routes must never be publicly writable without authorization.

All external input, including form data and uploads, requires server-side validation. File uploads require secure validation appropriate to the allowed media types. Secrets must not be committed to source code; sensitive configuration must use approved secret/configuration mechanisms.

## 9. Blueprint boundary and change control

Before the blueprint is complete, permitted work is documentation, diagrams, conceptual models, wireframes, architecture analysis, and clearly labeled non-production prototypes. A prototype must not use production credentials, deployment configuration, migrations, production APIs, production CMS workflows, or be represented as production implementation.

Until all required blueprint documents are complete, internally consistent, and approved, prohibited work includes production application implementation, database migrations, API implementation, CMS implementation, public-route implementation, visual production implementation, and production deployment configuration.

Required blueprint order:

1. `00_PROJECT_RULES.md`
2. `01_MASTER_INFORMATION_ARCHITECTURE.md`
3. `02_DOMAIN_MODEL.md`
4. `03_DATABASE_ER.md`
5. `04_API_CONTRACT.md`
6. `05_CMS_CONTRACT.md`
7. `06_SEO_URL_ARCHITECTURE.md`
8. `07_INTERNAL_LINK_GRAPH.md`
9. `08_PAGE_WIREFRAMES.md`
10. `09_COMPONENT_TREE.md`
11. `10_DESIGN_SYSTEM.md`
12. `11_HERO_VIDEO_STORYBOARD.md`
13. `12_PERFORMANCE_ACCESSIBILITY.md`
14. `13_VALIDATION_MATRIX.md`

When approved documents conflict, work must pause until an approved change record explicitly identifies the superseded decision.

## 10. Open decisions

- Identity of the Content Owner / Authorized Company Representative.
- Production legal/privacy requirements, authorized data recipients, retention periods, and deletion process for form data.
- Exact V1 browser/device/connection support matrix and measurable performance/accessibility acceptance criteria.
