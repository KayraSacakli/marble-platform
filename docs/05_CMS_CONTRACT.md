# CMS Contract Architecture

## 1. Purpose and scope

This document defines how authorized internal users create, edit, localize, review, approve, publish, unpublish, archive, and manage content through the CMS. It describes behavior and responsibilities, not UI implementation, component design, CSS, database schema, Prisma, SQL, migrations, or backend code.

The CMS exists to manage Product, Collection, Application, Project, Journal, Company Content (About/Quarry/Factory), Media, Quote Requests, localization, revisions, approval, publication, and lifecycle. The CMS is not a general-purpose enterprise ERP, CRM, or commerce platform. It does not expand the V1 scope defined in `00_PROJECT_RULES.md`.

The CMS operates through the approved API/service architecture defined in `04_API_CONTRACT.md`. It does not bypass domain rules, approval rules, publication rules, authorization, or database integrity. Direct database access from the CMS frontend is prohibited.

---

## 2. CMS actors and responsibilities

### 2.1 Conceptual roles

The governance model uses four distinct conceptual responsibilities as defined in `00_PROJECT_RULES.md`, `01_MASTER_INFORMATION_ARCHITECTURE.md`, and `02_DOMAIN_MODEL.md`:

| Role | Responsibility | Boundary |
|---|---|---|
| **Author / Editor** | Prepares or updates content and associated language variants. Creates revisions. Uploads and associates media as draft. Submits revisions for approval. | Cannot approve content. Cannot publish content. Cannot make content publicly visible. |
| **Approver** | Approves or rejects exact content revision, associated assets, and language variant(s). Creates valid approval evidence. | Cannot publish content alone (unless also holding Publisher responsibility). Cannot prepare content alone (unless also holding Author/Editor responsibility). |
| **Publisher** | Makes eligible approved content publicly visible. Publishes, unpublishes, archives, or permanently removes content where authorized. Requires recorded SEO outcome for public URL changes. | Cannot approve content alone (unless also holding Approver responsibility). Cannot publish unapproved, incomplete-language, or rights-unverified content. |
| **Content Owner / Authorized Company Representative** | The sole approval authority for company-specific public content. Owns content quality and resolves content disputes. Has final responsibility for what becomes public. | This is an Approver responsibility with specific authority. The real named individual remains an OPEN DECISION per `00_PROJECT_RULES.md`. |

### 2.2 Role assignment rules

One internal actor may carry more than one responsibility. Each material action must remain attributable to the actor identity. Server-side authorization is required for every mutation. No public endpoint can execute governance actions.

The organizational assignment of real people to these responsibilities is an implementation decision. The responsibilities themselves are fixed and may not be silently altered.

### 2.3 Prohibited actions by role

| Actor | Prohibited |
|---|---|
| Author / Editor | Approving own work without separate Approver. Publishing any content. Making unapproved content publicly accessible. |
| Approver | Publishing without Publisher responsibility. Preparing content without Author/Editor responsibility (unless separate). |
| Publisher | Publishing unapproved content. Publishing content with missing language variants (without approved exception). Publishing content with unverified media rights. Publishing content that fails publication gate. |

---

## 3. Content identity and language variants

### 3.1 One conceptual identity

Every governed content item is one conceptual ContentItem with one TR variant and one EN variant as defined in `01_MASTER_INFORMATION_ARCHITECTURE.md`, `02_DOMAIN_MODEL.md`, and `03_DATABASE_ER.md`. TR and EN are never independent conceptual content entities.

The CMS must present this model clearly: one item, two language variants, not two separate items.

### 3.2 Language selector and variant management

The CMS must provide a language selector that:

- Shows the current editing locale (TR or EN)
- Allows switching between TR and EN variants of the same ContentItem
- Never creates a duplicate ContentItem for the same conceptual entity
- Never silently displays content from the other language
- Shows variant completeness status (complete in TR, complete in EN, complete in both, incomplete)

### 3.3 Missing language state

If one language variant is missing or incomplete, the CMS must clearly indicate this state. The missing variant must not be automatically filled with content from the other language. If an approved language exception exists, it must be explicitly recorded and visible in the CMS.

### 3.4 Language-specific editing

Each language variant is edited independently. Changes to one variant do not affect the other. Editing a published variant changes the affected version and requires re-approval of that changed variant.

### 3.5 No implicit fallback

The CMS must not implement or allow implicit language fallback. If a user requests content in a language that is not available, the CMS must not silently substitute content from another language. The API contract in `04_API_CONTRACT.md` enforces this at the service level.

---

## 4. Revision management

### 4.1 Revision lifecycle

The CMS must support:

| Action | Actor | Result |
|---|---|---|
| Create revision | Author / Editor | New revision created for a specific language variant |
| Edit draft revision | Author / Editor | Material content changes recorded in revision |
| Submit for approval | Author / Editor | Revision marked as submitted; approval workflow triggered |
| Approve revision | Approver | Approval evidence created; variant becomes eligible for publication |
| Reject revision | Approver | Revision returned to author with status |
| Publish approved revision | Publisher | Variant made publicly visible |
| Create new revision after publish | Author / Editor | New revision created; previous published version retained in history |

### 4.2 Revision history

The CMS must preserve revision history for each language variant. Users must be able to see:

- All revisions created for a variant
- Which revision is currently approved
- Which revision is currently published
- Approval history for each revision (who approved, when, outcome)
- Author of each revision

### 4.3 Material change and re-approval

When a published variant receives a material revision, the CMS must:

1. Create a new revision with the changes
2. Mark the variant as requiring re-approval
3. Prevent the changed variant from remaining public until re-approval
4. Preserve the previous approved version as the current published version until re-approval

### 4.4 Revision comparison

The CMS may provide revision comparison capability, but this is an implementation decision. The contract requires that revision history is preserved and accessible.

### 4.5 Revision restoration

If a previous revision needs to be restored, the CMS must create a new revision containing the restored content. Previous revisions must not be mutated. Restoration requires the same approval workflow as any material change.

---

## 5. Approval workflow

### 5.1 Approval states

| State | Meaning | Public effect |
|---|---|---|
| Draft | Not yet submitted for approval | Never public |
| Submitted | Author/Editor submitted revision for approval | Not public; awaiting review |
| Approved | Approver approved exact revision, assets, language | Eligible for publication; remains non-public until published |
| Rejected | Approver rejected revision | Not public; returned to author |
| Re-approval required | Material change to previously approved variant | Previously approved version may remain published; changed version not eligible |

### 5.2 Approval evidence

Each approval must record:

- Who approved (actor identity)
- When approved (timestamp)
- Which revision was approved
- Which language variant(s) were approved
- Which assets/media were covered
- Approval outcome (approved/rejected)

This evidence is durable and auditable. A simple boolean flag is insufficient.

### 5.3 Language-specific approval

Approval is attached to a specific language variant. Approving the TR variant does not approve the EN variant. Each variant requires its own approval for its own revision.

### 5.4 Rejection and revision

When a revision is rejected:

1. The rejection reason must be recorded
2. The revision returns to author status
3. The author may create a new revision addressing the feedback
4. The new revision enters the approval workflow

### 5.5 Content Owner approval

For company-specific public content (About, Quarry, Factory, and any content making factual company claims), the Content Owner / Authorized Company Representative must be the approving authority. The CMS must distinguish between general approval authority and Content Owner-specific approval authority.

---

## 6. Publication workflow

### 6.1 Pre-publication eligibility

Before publication, the CMS must verify:

1. **Approval exists**: The current revision has valid approval
2. **Language completeness**: Required language variants are prepared and approved (or approved exception exists)
3. **Media rights verified**: All public media assets have verified publication authorization
4. **Required alt text**: Informative/contextual images have meaningful alternative text
5. **Publication gate**: Content-type-specific requirements are met (e.g., Product publication gate from `00_PROJECT_RULES.md`)
6. **Lifecycle valid**: Content is in a publishable state

If any check fails, publication must not proceed. The CMS must show which requirement failed.

### 6.2 Publish action

When a Publisher publishes an eligible variant:

1. The variant becomes publicly accessible through public API endpoints
2. The publication is recorded with actor, timestamp, and revision reference
3. Public caches are invalidated
4. The variant appears in public navigation, listings, and relationships

### 6.3 Unpublish action

When a Publisher unpublishes a variant:

1. The variant is withdrawn from public access
2. A recorded SEO outcome must be specified (404, 410, 301 to relevant replacement, or noindex)
3. The variant is no longer shown in navigation, listings, or public relationships
4. The unpublish is recorded with actor, timestamp, and SEO outcome

The CMS must not allow unpublishing without a recorded SEO outcome for previously public URLs.

### 6.4 Archive action

When a Publisher archives content:

1. The content is retained internally but no longer active
2. If it had a public URL, the recorded SEO outcome governs visitor result
3. The archive is recorded with reason, actor, and timestamp

### 6.5 Permanent removal

When a Publisher permanently removes content:

1. The content is removed as an active public resource
2. A recorded SEO outcome (404, 410, 301, or noindex) governs public behavior
4. Minimal lifecycle/URL-decision/audit trace is retained
5. The removal is recorded with actor, timestamp, and SEO outcome

The CMS must not allow blanket homepage redirects without explicit justification and approval.

### 6.6 Editing published content

When published content is edited:

1. A new revision is created
2. The previous published version remains public until re-approval
3. The changed variant requires re-approval before the new version can become public
4. The CMS must clearly show which version is currently published versus which is in draft

### 6.7 One language published, another not

If one language variant is published and the other is not:

1. The published variant remains public
2. The language switch for the unpublished variant must not show unrelated content
3. The CMS must clearly indicate the incomplete language state
4. Public behavior follows the approved language exception rules from `00_PROJECT_RULES.md`

### 6.8 Media rights become invalid

If media rights become invalid after publication:

1. The affected media must be flagged
2. Content using that media becomes ineligible for public display
3. The CMS must alert users to the rights issue
4. Publication eligibility is re-evaluated

### 6.9 Content becomes incomplete

If content becomes incomplete (e.g., required field removed):

1. The variant may lose publication eligibility
2. The CMS must clearly indicate the incompleteness
3. The content may need to be unpublished until resolved

---

## 7. Content lifecycle

### 7.1 Lifecycle states

| State | Meaning | Approval | Public | Recoverable |
|---|---|---|---|---|
| Draft | Prepared or imported, not yet approved | Not eligible | Never public or indexable | Yes; can be edited and submitted |
| Approved | Exact revision/assets/languages have valid approval | Eligible | Non-public until published | Yes; can be published |
| Published | Intentionally made public | Requires valid approval | Publicly accessible | Yes; can be unpublished |
| Unpublished | Withdrawn from active public use | Retained | Not in listings/navigation | Yes; can be republished |
| Archived | Internally retained, not active | Retained | Non-public | Yes; can be restored |
| Permanently Removed | Deleted under approved process | N/A | No active resource | No; trace retained |

### 7.2 Lifecycle transitions

| From | To | Trigger | Actor | Prerequisite |
|---|---|---|---|---|
| — | Draft | Create content | Author / Editor | None |
| Draft | Submitted | Submit for approval | Author / Editor | Revision exists |
| Submitted | Approved | Approve revision | Approver | Valid review |
| Submitted | Rejected | Reject revision | Approver | Feedback recorded |
| Rejected | Submitted | Resubmit after changes | Author / Editor | New revision |
| Approved | Published | Publish | Publisher | All eligibility checks pass |
| Published | Unpublished | Unpublish | Publisher | SEO outcome recorded |
| Unpublished | Published | Republish | Publisher | Approval still valid |
| Draft/Approved | Archived | Archive | Publisher | Archive reason recorded |
| Any active | Permanently Removed | Remove | Publisher | SEO outcome recorded; authorized process |

### 7.3 Aggregate vs variant lifecycle

ContentItem retains an aggregate management state. ContentVariant owns the localized lifecycle. An aggregate cannot be publicly active when its required published variants are not eligible. Archiving or removing at aggregate level affects all variants.

---

## 8. Content type management

### 8.1 Product

| Aspect | Requirement |
|---|---|
| Identity | One ContentItem with type-specific Product extension |
| Localization | Required TR and EN variants |
| Media | Primary image required; gallery optional; all media requires rights verification |
| Relationships | Collections, Applications, Projects, related Products, Journal Articles |
| Publication gate | As defined in `00_PROJECT_RULES.md`: approved content, name, unique slug, description, primary image, meaningful alt text, valid state, valid approval |
| Lifecycle | Full lifecycle with publication gate enforcement |
| Scale | Must support 100+ products |

The CMS must not add advanced public catalogue filtering or search requirements. Admin-side usability may require internal search/filtering for management purposes, but this is distinct from public V1 discovery.

### 8.2 Collection

| Aspect | Requirement |
|---|---|
| Identity | One ContentItem with type-specific Collection extension |
| Localization | Required TR and EN variants |
| Media | Optional; rights-verified if used |
| Relationships | Products (optional); Applications; Journal Articles |
| Lifecycle | Standard lifecycle |

A Collection may contain zero or more Products while being prepared. Public usefulness depends on published relevant Product links.

### 8.3 Application

| Aspect | Requirement |
|---|---|
| Identity | One ContentItem with type-specific Application extension |
| Localization | Required TR and EN variants |
| Media | Optional; rights-verified if used |
| Relationships | Products; Projects; Journal Articles |
| Lifecycle | Standard lifecycle |

An Application is a conceptual material-use context. It does not assert product suitability without approved content.

### 8.4 Project

| Aspect | Requirement |
|---|---|
| Identity | One ContentItem with type-specific Project extension |
| Localization | Required TR and EN variants |
| Media | Optional; rights-verified if used |
| Relationships | Products; Applications; Journal Articles |
| Lifecycle | Standard lifecycle |
| Public visibility | Conditional: requires approved bilingual content, verified media rights, valid publication record |

The CMS must support Projects as a V1 capability. If no qualifying approved public Project exists, the public Projects area remains hidden. The CMS must not force publication merely because a Project exists. No placeholders or fictional projects are permitted.

### 8.5 Journal Article

| Aspect | Requirement |
|---|---|
| Identity | One ContentItem with type-specific JournalArticle extension |
| Localization | Required TR and EN variants |
| Media | Optional; rights-verified if used |
| Relationships | Products; Applications; Projects; Company Content (Quarry/Factory) |
| Lifecycle | Standard lifecycle |

The Journal is educational/editorial content, not a content-volume mechanism. Categories/tags are not modeled unless later approved.

### 8.6 Company Content (About / Quarry / Factory)

| Aspect | Requirement |
|---|---|
| Identity | One ContentItem with type-specific CompanyContent extension |
| Localization | Required TR and EN variants |
| Media | Optional; rights-verified if used |
| Relationships | Products; Journal Articles |
| Lifecycle | Standard lifecycle |
| Content kind | Constrained to About, Quarry, or Factory |

The CMS must preserve truthfulness rules. No invented capacity, certifications, production statistics, clients, logistics, machinery claims, or other unapproved company facts. Content Owner approval is required for company-specific public content.

### 8.7 Content type matrix

| Content Type | TR | EN | Revision | Approval | Media | Publication | Archive |
|---|---|---|---|---|---|---|---|
| Product | Required | Required | Required | Required | Primary required; gallery optional | With publication gate | Full lifecycle |
| Collection | Required | Required | Required | Required | Optional | Standard | Full lifecycle |
| Application | Required | Required | Required | Required | Optional | Standard | Full lifecycle |
| Project | Required | Required | Required | Required | Optional; rights-verified | Conditional visibility | Full lifecycle |
| Journal Article | Required | Required | Required | Required | Optional | Standard | Full lifecycle |
| Company Content | Required | Required | Required | Required | Optional | Standard; Content Owner approval | Full lifecycle |

---

## 9. Media management

### 9.1 Media lifecycle

The CMS must support:

| Action | Actor | Result |
|---|---|---|
| Upload media | Author / Editor | Draft media asset created |
| Update rights metadata | Author / Editor; rights verification requires authorized workflow | Rights state updated |
| Associate media with variant | Author / Editor | ContentMedia relationship created |
| Set presentation role | Author / Editor | Role assigned (primary, gallery, hero, preview) |
| Set display order | Author / Editor | Order within gallery assigned |
| Set localized alt text | Author / Editor | Language-specific alternative text |
| Remove association | Author / Editor | ContentMedia removed; underlying asset retained |
| Replace media | Author / Editor | New asset associated; old association removed |

### 9.2 Media reuse

The CMS must support media reuse:

- An existing MediaAsset may be associated with multiple ContentVariants where relevant and authorized
- Removing an association does not delete the underlying asset
- The CMS must show where media is currently used
- Derived media must reference an original asset

### 9.3 Media rights

The CMS must clearly display:

- Rights verification state for each media asset
- Whether the asset is eligible for public use
- Which content items currently use the asset
- Rights verification evidence/reference

Public use requires verified appropriate publication authorization. Unverified media cannot support public eligibility of content that requires it.

### 9.4 Alternative text

The CMS must support:

- Language-specific alternative text for informative/contextual images
- Empty-alt semantics for decorative images
- Repetitive text avoidance when context conveys same information
- Prevention of alternative text as SEO keyword container

### 9.5 Derived media

The CMS must support:

- Original and derived asset relationships
- Derived assets reference original assets
- Original marble/product appearance may not be silently altered by AI transformation
- Derived media inherits rights context from original

### 9.6 Media association validation

When associating media, the CMS must validate:

- Asset exists
- Presentation role is allowed
- Ordering is valid
- Variant locale is correct
- Alt text rule is satisfied
- Rights eligibility confirmed
- Actor has authority

---

## 10. Quote Request management

### 10.1 Internal view

The CMS must allow authorized users to:

- View submitted Quote Requests
- See request type (General or contextual: Product, Project, Application)
- See contact information and message
- See submission timestamp
- See processing status
- See processing responsibility where assigned
- Update processing status where supported

### 10.2 Context integrity

The CMS must enforce the XOR context rule from `01_MASTER_INFORMATION_ARCHITECTURE.md` and `02_DOMAIN_MODEL.md`:

- General Quote Request: no content context
- Contextual Quote Request: exactly one of Product, Project, or Application
- Multiple contexts (Product + Project, two Products, etc.) are not permitted
- The CMS must not allow manual context manipulation that violates this rule

### 10.3 Access control

Quote Requests are private internal data. The CMS must:

- Restrict access to explicitly authorized actors
- Never expose Quote Requests publicly
- Log access as security-relevant events
- Prevent cross-user data access

### 10.4 Privacy and retention

Quote Request data collection requires:

- Data minimization
- Purpose limitation
- Access control
- Server-side validation
- Spam protection
- Rate limiting
- Accessible privacy notice before submission

Legal basis, authorized data recipients, retention period, deletion process, and jurisdiction-specific privacy requirements are OPEN DECISIONS per `00_PROJECT_RULES.md`. They must be approved before production data collection.

### 10.5 Processing workflow

Quote Request processing is an internal workflow. The CMS must support:

- Viewing requests
- Assigning processing responsibility
- Updating processing status
- Recording actions taken
- Maintaining audit trail

The CMS must not expose processing details publicly.

---

## 11. Publication gates

### 11.1 General publication requirements

Before any content can be published:

1. Valid approval record exists for the exact revision
2. Required language variants are complete (TR and EN prepared and approved, or approved exception)
3. All public media assets have verified publication rights
4. Informative/contextual images have meaningful alternative text
5. Content is in a publishable lifecycle state
6. Publication gate for content type is satisfied

### 11.2 Product publication gate

As defined in `00_PROJECT_RULES.md`:

- Approved required-language content
- Product name present
- Unique slug
- Description present
- Primary image present with rights verification
- Meaningful alternative text for required informative images
- Valid publication state
- Valid content-approval record

Technical, origin, availability, format, dimension, or suitability information is optional until approved business content exists.

### 11.3 Language completeness gate

Content is language-complete when:

- Both TR and EN variants are prepared and approved
- Each variant has valid approval for its exact revision and assets

An approved language exception may allow publication with one variant, but this must be explicitly recorded and visible.

### 11.4 Media rights gate

Content cannot be published if:

- Required media assets lack rights verification
- Informative images lack meaningful alternative text
- Media associations are incomplete

### 11.5 Gate enforcement

The CMS must check all applicable gates before allowing publication. If any gate fails:

- Publication is blocked
- The specific failing requirement is displayed
- The user is guided to resolve the issue

---

## 12. Auditability

### 12.1 Auditable actions

The CMS must record audit events for:

| Action | Actor | Timestamp | Affected entity | Details |
|---|---|---|---|---|
| Content created | Author / Editor | Yes | ContentItem | Type, initial variant |
| Revision created | Author / Editor | Yes | ContentRevision | Variant, locale |
| Revision submitted | Author / Editor | Yes | ContentRevision | Submission state |
| Revision approved | Approver | Yes | Approval | Revision, assets, languages |
| Revision rejected | Approver | Yes | ContentRevision | Rejection reason |
| Content published | Publisher | Yes | ContentVariant | Revision, publication state |
| Content unpublished | Publisher | Yes | ContentVariant | SEO outcome |
| Content archived | Publisher | Yes | ContentItem | Archive reason |
| Content removed | Publisher | Yes | ContentItem | SEO outcome |
| Media uploaded | Author / Editor | Yes | MediaAsset | Asset details |
| Media rights changed | Authorized actor | Yes | MediaAsset | Rights state |
| Media associated | Author / Editor | Yes | ContentMedia | Variant, asset, role |
| Quote Request accessed | Authorized actor | Yes | QuoteRequest | Access type |
| Quote Request status changed | Authorized actor | Yes | QuoteRequest | Status change |

### 12.2 Audit record requirements

Each audit event must record:

- Actor identity (InternalUser UUID)
- Action type
- Timestamp
- Affected entity/variant/revision where relevant
- Safe change reference (no sensitive data exposure)

### 12.3 Audit retention

Audit records are retained independently from public content lifecycle, subject to future legal policy. They must not be deleted casually.

### 12.4 Audit access

Audit history must be accessible to authorized governance actors (Approver, Publisher, Content Owner). The CMS must provide audit history viewing for content items.

---

## 13. Authorization

### 13.1 Authentication

All CMS access requires authenticated users. Unauthenticated access is prohibited.

### 13.2 Role-based authorization

Authorization is based on assigned responsibilities:

- Author / Editor: can create, edit, submit
- Approver: can approve/reject
- Publisher: can publish/unpublish/archive/remove
- Content Owner: sole approval authority for company-specific content

### 13.3 Least privilege

Each actor receives only the minimum permissions necessary for their assigned responsibilities. The CMS must not grant blanket permissions.

### 13.4 Server-side checks

All mutations require server-side authorization checks. Client-side checks are insufficient.

### 13.5 Prohibited patterns

The CMS must prevent:

- Self-approval without separate Approver
- Unauthorized publication
- Cross-user data access
- IDOR (Insecure Direct Object Reference) on identifiers
- Mass assignment of unintended fields
- CSRF attacks where applicable

---

## 14. Bulk operations

### 14.1 Evaluation

Bulk operations (bulk publish, bulk unpublish, bulk archive, bulk media association, bulk localization) are evaluated for V1 necessity.

### 14.2 Current assessment

V1 content management can be performed through individual item operations. Bulk operations introduce additional complexity:

- Risk of accidental mass publication/unpublication
- Requires additional authorization controls
- May bypass individual item publication gates
- Increases audit complexity

### 14.3 Decision

Bulk operations are not required for V1. They remain outside V1 scope unless an approved scope change documents:

- Specific business need
- Risk assessment
- Required authorization controls
- Audit requirements

This is an OPEN DECISION per the project rules.

---

## 15. Draft preview

### 15.1 Requirement

Authorized users may need to preview draft content before publication.

### 15.2 Constraints

Preview must:

- Be restricted to authenticated, authorized users
- Not expose drafts to public indexing
- Not make drafts accessible through public endpoints
- Not affect canonical URL behavior
- Not create public records

### 15.3 Current assessment

Draft preview is a valuable CMS capability but its exact implementation depends on:

- Authentication mechanism
- Caching strategy
- SEO canonical behavior
- Indexing controls

### 15.4 Decision

Draft preview behavior is an OPEN DECISION. The CMS must not implement preview in a way that exposes drafts publicly. The exact preview mechanism belongs to implementation decisions.

---

## 16. Validation responsibilities

### 16.1 Field validation

Basic field validation occurs at the CMS/API boundary:

- Required fields present
- Length constraints
- Type/format validation
- Allowed values

### 16.2 Domain validation

Business rules are validated at the service/domain level:

- Valid relationships
- Publication eligibility
- Language completeness
- Approval requirements
- Content-type-specific rules

### 16.3 Database integrity

Structural integrity is enforced at the database level:

- Uniqueness constraints
- Foreign key integrity
- Referential integrity
- Quote Request context XOR

### 16.4 Responsibility separation

The CMS must not duplicate validation responsibility unnecessarily:

- Field validation: API boundary
- Business rules: service/domain
- Structural integrity: database

The CMS frontend may provide client-side validation for UX, but server-side validation is authoritative.

---

## 17. CMS/API boundary

### 17.1 CMS as API consumer

The CMS operates through the approved API contract defined in `04_API_CONTRACT.md`. It does not access the database directly.

### 17.2 API endpoints used

The CMS consumes:

- `POST /admin/{resource}` - Create draft
- `POST /admin/{resource}/{id}/variants/{locale}/revisions` - Create revision
- `POST /admin/{resource}/{id}/variants/{locale}/submit-approval` - Submit for approval
- `POST /admin/revisions/{id}/approvals` - Approve/reject
- `POST /admin/{resource}/{id}/variants/{locale}/publish` - Publish
- `POST /admin/{resource}/{id}/variants/{locale}/unpublish` - Unpublish
- `POST /admin/{resource}/{id}/archive` - Archive
- `POST /admin/{resource}/{id}/remove` - Remove
- `GET /admin/{resource}/{id}` - Read management detail
- `GET /admin/{resource}/{id}/audit` - Audit history
- `POST /admin/media` - Upload media
- `PATCH /admin/media/{id}` - Update media
- `POST /admin/{resource}/{id}/variants/{locale}/media` - Associate media
- `GET/PATCH /admin/quote-requests/{id}` - Quote Request management

### 17.3 No bypass

The CMS must not bypass:

- Domain rules
- Approval rules
- Publication rules
- Authorization
- Database integrity

All mutations flow through the API and its validation layers.

---

## 18. CMS dashboard scope

### 18.1 Conceptual areas

The CMS must expose conceptual management areas for:

| Area | Content |
|---|---|
| Products | Product CRUD, media, relationships, publication |
| Collections | Collection CRUD, product relationships |
| Applications | Application CRUD, product/project relationships |
| Projects | Project CRUD, media, relationships, conditional visibility |
| Journal | Article CRUD, media, relationships |
| Company Content | About/Quarry/Factory content, media |
| Media | Asset library, rights management, associations |
| Quote Requests | View, process, status updates |
| Approvals | Pending approvals, approval history |
| Audit | Governance audit trail |

### 18.2 Dashboard design

The visual dashboard design is an implementation decision. This contract defines the functional areas, not the UI layout.

---

## 19. Functional matrix

| Capability | Author / Editor | Approver | Publisher | Content Owner |
|---|---|---|---|---|
| Create content | Allowed | Allowed if also editor | Allowed if also editor | Allowed if also editor |
| Edit draft | Allowed | Allowed if also editor | Allowed if also editor | Allowed if also editor |
| Create revision | Allowed | Allowed if also editor | Allowed if also editor | Allowed if also editor |
| Submit for approval | Allowed | Allowed | Allowed | Allowed |
| Approve revision | Not allowed | Allowed | Not allowed unless also Approver | Allowed |
| Reject revision | Not allowed | Allowed | Not allowed unless also Approver | Allowed |
| Publish | Not allowed | Not allowed unless also Publisher | Allowed | Not allowed unless also Publisher |
| Unpublish | Not allowed | Not allowed unless also Publisher | Allowed | Not allowed unless also Publisher |
| Archive | Not allowed | Not allowed unless also Publisher | Allowed | Not allowed unless also Publisher |
| Remove | Not allowed | Not allowed unless also Publisher | Allowed | Not allowed unless also Publisher |
| Upload media | Allowed | Allowed | Allowed | Allowed |
| Associate media | Allowed | Allowed | Allowed | Allowed |
| Update media rights | Allowed; rights verification requires authorized workflow | Allowed | Allowed | Allowed |
| View audit history | Authorized according to least privilege | Allowed | Allowed | Allowed |
| View Quote Requests | Explicitly authorized only | As authorized | As authorized | As authorized |
| Process Quote Requests | Explicitly authorized only | As authorized | As authorized | As authorized |

---

## 20. Workflow matrix

| Current State | Action | Actor | Prerequisite | Result | Public? |
|---|---|---|---|---|---|
| — | Create draft | Author / Editor | None | Draft | No |
| Draft | Edit | Author / Editor | Draft exists | Draft updated | No |
| Draft | Submit for approval | Author / Editor | Revision exists | Submitted | No |
| Submitted | Approve | Approver | Valid review | Approved | No |
| Submitted | Reject | Approver | Valid review | Rejected | No |
| Rejected | Resubmit | Author / Editor | New revision | Submitted | No |
| Approved | Publish | Publisher | All gates pass | Published | Yes |
| Published | Edit | Author / Editor | Published exists | New draft created; previous remains published | Yes (previous) |
| Published | Unpublish | Publisher | SEO outcome recorded | Unpublished | No |
| Unpublished | Republish | Publisher | Approval still valid | Published | Yes |
| Any active | Archive | Publisher | Archive reason | Archived | No |
| Any active | Permanently remove | Publisher | SEO outcome recorded; authorized process | Removed | No |

---

## 21. Traceability

| CMS Capability | Source |
|---|---|
| Product Management | `01_MASTER_INFORMATION_ARCHITECTURE.md` — Product discovery architecture; `02_DOMAIN_MODEL.md` — Catalog domain; `03_DATABASE_ER.md` — Product entity; `04_API_CONTRACT.md` — Product endpoints |
| Collection/Application Management | `01` — Content relationships; `02` — Catalog domain; `03` — Typed junctions; `04` — Collection/Application endpoints |
| Project Management | `01` — Project availability at launch; `02` — Editorial domain; `03` — Project entity; `04` — Project endpoints |
| Journal Management | `01` — Journal architecture; `02` — Editorial domain; `03` — JournalArticle entity; `04` — Journal endpoints |
| Company Content Management | `01` — Quarry/Factory architecture; `02` — Editorial domain; `03` — CompanyContent entity; `04` — Company endpoints |
| Multilingual | `00` — Language rules; `01` — Multilingual architecture; `02` — Localization; `03` — ContentVariant model; `04` — Locale requirements |
| Revision/Approval | `00` — Governance rules; `01` — Governance flow; `02` — Governance domain; `03` — ContentRevision/Approval; `04` — Approval endpoints |
| Publication | `00` — Lifecycle rules; `01` — Lifecycle states; `02` — Lifecycle domain; `03` — Lifecycle model; `04` — Publication endpoints |
| Media | `00` — Media/alt-text rules; `01` — Media management; `02` — Media domain; `03` — MediaAsset/ContentMedia; `04` — Media endpoints |
| Quote Requests | `00` — Privacy/security; `01` — Quote context rule; `02` — Inquiry domain; `03` — QuoteRequest XOR; `04` — Quote endpoints |
| Audit | `00` — Security baseline; `01` — Governance; `02` — Governance domain; `03` — AuditEvent; `04` — Audit endpoints |
| Authorization | `00` — Security rules; `01` — Conceptual responsibilities; `02` — Actor responsibilities; `03` — InternalUser/Role; `04` — Authorization matrix |

---

## 22. Open decisions

### CMS-contract blocking

None. The CMS contract supports all approved V1 behavior without choosing unresolved company facts or implementation technology.

### CMS-contract non-blocking

1. **Identity of the Content Owner / Authorized Company Representative.** The role and authority are fixed; the named individual must be confirmed before public content is published.
2. **Legal/privacy requirements, authorized data recipients, retention periods, and deletion process for Quote Request data.** These must be approved before production data collection but do not change the V1 conceptual Quote Request management.
3. **Whether qualifying approved public Project content will exist at launch.** This affects public visibility, not the V1 Projects CMS capability.
4. **Approved business content.** The company must supply and approve any origin, format, availability, technical, logistics, quarry/factory, or project content before publication.

### Later implementation

1. CMS framework, component library, admin UI layout, rich text editor.
2. File storage vendor, upload protocol, CDN technology.
3. Authentication provider, session management.
4. Draft preview implementation, caching strategy.
5. Bulk operation need assessment, risk evaluation.
6. Internal search/filtering for admin-side content management.

---

## 23. Consistency audit

### Content

| Check | Result |
|---|---|
| Product | Pass: CMS supports Product CRUD, localization, media, relationships, publication gate |
| Collection | Pass: CMS supports Collection CRUD, localization, product relationships |
| Application | Pass: CMS supports Application CRUD, localization, product/project relationships |
| Project | Pass: CMS supports Project CRUD, localization, media, conditional visibility |
| Journal | Pass: CMS supports Journal CRUD, localization, media |
| Company Content | Pass: CMS supports About/Quarry/Factory, truthfulness rules preserved |

### Multilingual

| Check | Result |
|---|---|
| One conceptual identity | Pass: CMS presents one ContentItem with TR/EN variants |
| Language-specific revision | Pass: Each variant has independent revision history |
| Language-specific approval | Pass: Each variant requires own approval |
| No implicit fallback | Pass: CMS does not silently substitute language content |

### Governance

| Check | Result |
|---|---|
| Author/Editor | Pass: Create, edit, submit responsibilities defined |
| Approver | Pass: Approve/reject responsibilities defined |
| Publisher | Pass: Publish/unpublish/archive/remove responsibilities defined |
| Content Owner | Pass: Sole approval authority for company-specific content defined |

### Lifecycle

| Check | Result |
|---|---|
| Draft | Pass: Non-public, editable state |
| Approved | Pass: Eligible but non-public |
| Published | Pass: Publicly accessible |
| Unpublished | Pass: Withdrawn with SEO outcome |
| Archived | Pass: Retained internally |
| Permanently Removed | Pass: Deleted with trace |

### Media

| Check | Result |
|---|---|
| Rights | Pass: Rights verification required before public use |
| Alt text | Pass: Language-specific alternative text supported |
| Reuse | Pass: Media reuse across variants supported |
| Publication eligibility | Pass: Unverified media blocks publication |

### Quote Request

| Check | Result |
|---|---|
| General OR exactly one context | Pass: XOR context enforced |
| Internal-only access | Pass: Restricted to authorized actors |
| Privacy/legal open decisions | Pass: OPEN DECISIONs preserved |

### V1 scope

| Check | Result |
|---|---|
| No public advanced search | Pass: Not introduced |
| No advanced filtering | Pass: Not introduced |
| No comparison | Pass: Not introduced |
| No sample requests | Pass: Not introduced |
| No architect downloads | Pass: Not introduced |
| No commerce | Pass: Not introduced |
| No accounts | Pass: Not introduced |
| No portals | Pass: Not introduced |
| No integrations | Pass: Not introduced |

---

CMS CONTRACT STATUS [READY FOR SEO URL ARCHITECTURE]

---

## Critical OPEN DECISIONS

1. **Content Owner identity** — The real named individual must be confirmed before any public content is published.
2. **Quote Request legal/privacy** — Legal basis, recipients, retention period, deletion process, and jurisdiction-specific requirements must be approved before production data collection.
3. **Bulk operations** — Need assessment, risk evaluation, and authorization requirements must be documented if bulk operations are added to V1 scope.
4. **Draft preview** — Exact implementation behavior (visibility, indexing controls, authentication requirements) belongs to implementation decisions.
5. **Project launch content** — Whether at least one qualifying approved bilingual Project exists at launch must be confirmed before launch.