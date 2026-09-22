# API Contract Architecture

## 1. Contract principles

The API is REST-oriented, versioned under `/api/v1`, and exposes domain DTOs rather than database rows. Resource names are plural; details use stable public identifiers. A breaking contract change requires a new API version; additive compatible changes may remain in v1.

Public endpoints return only published, approved, language-eligible content with rights-eligible media. They never expose drafts, revisions, approvals, actors, audit data, archived/removed records, or private Quote Requests. Admin endpoints require authenticated, authorized internal actors.

All localized public content requests require `locale=tr|en` or a locale path segment. There is no implicit fallback to another language. Missing/ineligible variants return `404`; an approved language exception is handled only through the approved public behavior, never by returning unrelated content.

## 2. Response, validation, and errors

Success responses return `{ data, meta? }`. Errors return:

```json
{"error":{"code":"VALIDATION_ERROR","message":"Localized safe message","details":[{"field":"context","code":"EXACTLY_ONE_CONTEXT_REQUIRED"}],"requestId":"..."}}
```

`details` is supplied only for actionable validation errors. Messages follow the request locale when available. Stack traces, database messages, approval internals, and security-sensitive details are never returned.

| Status | Use |
|---|---|
| 200 | Successful read or action with response body. |
| 201 | Created resource, revision, upload record, or Quote Request. |
| 204 | Successful no-body action. |
| 400 | Malformed syntax or invalid request envelope. |
| 401 | Missing/invalid authentication for an admin endpoint. |
| 403 | Authenticated actor lacks required responsibility. |
| 404 | Publicly unavailable/not found resource or invalid target. |
| 409 | Valid request conflicts with lifecycle/revision/current-state conflict. |
| 422 | Well-formed request violates business/validation rules. |
| 429 | Rate limit or abuse protection triggered. |
| 500 | Unexpected server failure; opaque response only. |

Validation occurs at three layers: API boundary checks shape, locale, required values, request size and allowed values; service/domain checks lifecycle, approval, relevance, roles and publication eligibility; database enforces identity, relations, uniqueness and Quote Request context integrity.

## 3. Authorization matrix

| Operation | Author/Editor | Approver / Content Owner | Publisher |
|---|---|---|---|
| Create/edit draft and localized revision | Allowed | Allowed if also editor | Allowed if also editor |
| Upload/associate media as draft | Allowed | Allowed | Allowed |
| Submit revision for approval | Allowed | Allowed | Allowed |
| Approve/reject exact revision | No | Allowed | No unless also Approver |
| Publish/unpublish/archive/remove eligible content | No | No unless also Publisher | Allowed |
| View approval/audit history | Authorized according to least privilege; Approver/Publisher required for governance actions | Allowed | Allowed |
| Read/process Quote Requests | Explicitly authorized internal actors only; role assignment is a CMS/security policy | As authorized | As authorized |

One actor may hold multiple responsibilities, but server-side authorization is required for every mutation. No public endpoint can execute governance actions.

## 4. Public resource contracts

All collection responses are paginated with `page` and `pageSize`; default `24`, maximum `100`, and meta `{ page, pageSize, total, totalPages }`. V1 Product sorting is only `sort=title_asc` in the active locale. Public advanced filters, free-text search, comparison, Sample Request, commerce, accounts, portals, and integrations do not exist in V1.

| Method | Endpoint | Audience | Purpose | Auth | Language | Request | Response | Main errors |
|---|---|---|---|---|---|---|---|---|
| GET | `/public/products` | Public | Alphabetical published catalogue | No | Required | locale, page, pageSize, `title_asc` only | ProductSummary list + pagination | 400, 422 |
| GET | `/public/products/{identifier}` | Public | Published Product detail | No | Required | locale | ProductDetail | 404 |
| GET | `/public/collections` | Public | Published Collections | No | Required | page controls | CollectionSummary list | 400 |
| GET | `/public/collections/{identifier}` | Public | Collection and eligible Products | No | Required | locale, page controls | CollectionDetail | 404 |
| GET | `/public/applications` | Public | Published Applications | No | Required | page controls | ApplicationSummary list | 400 |
| GET | `/public/applications/{identifier}` | Public | Application and eligible Products/Projects | No | Required | locale, page controls | ApplicationDetail | 404 |
| GET | `/public/projects` | Public | Qualifying published Projects | No | Required | page controls | Project list or empty public result | 400 |
| GET | `/public/projects/{identifier}` | Public | Published Project detail | No | Required | locale | ProjectDetail | 404 |
| GET | `/public/journal` | Public | Published Journal Articles | No | Required | page controls | JournalSummary list | 400 |
| GET | `/public/journal/{identifier}` | Public | Published article detail | No | Required | locale | JournalDetail | 404 |
| GET | `/public/company/about` | Public | Approved About content | No | Required | locale | CompanyContent | 404 |
| GET | `/public/company/quarry` | Public | Approved Quarry content | No | Required | locale | CompanyContent | 404 |
| GET | `/public/company/factory` | Public | Approved Factory content | No | Required | locale | CompanyContent | 404 |
| POST | `/public/quote-requests` | Public | Submit General or single-context Quote Request | No | Request locale | contact/message, privacy acknowledgement, optional exactly-one context | Receipt only: request reference + accepted status | 400, 422, 429 |

`/public/projects` returns an empty public result when no qualifying Project exists; the public website uses that state to hide Projects navigation/listing. It never reveals the existence or status of internal Projects.

### Public DTOs

- **ProductSummary:** public identifier, localized title, primary rights-eligible media presentation, limited approved summary.
- **ProductDetail:** ProductSummary plus approved localized description, eligible gallery, approved related Products/Collections/Applications/Projects/Journal references and quote context identifier.
- **CollectionDetail / ApplicationDetail:** localized public content, eligible linked Products and relevant eligible related content.
- **ProjectDetail / JournalDetail / CompanyContent:** approved localized body, eligible media, approved contextual links only.
- **MediaPresentation:** public delivery reference, media type, localized alternative text/caption when applicable, role/order; no private storage or rights evidence.
- **QuoteRequestReceipt:** opaque request reference, accepted state, localized next-step message; no personal data echo.

## 5. Quote Request contract

Request body conceptually contains contact information and message needed for the stated purpose, privacy acknowledgement, and either no context or `{ contextType, contextIdentifier }` where type is `product`, `project`, or `application`.

The endpoint rejects absent/partial context pairs, unsupported type, more than one context representation, nonexistent/ineligible contextual target, malformed contact data, missing privacy acknowledgement, oversized payloads, and abuse/rate-limit failures. Context is optional; when provided it must be exactly one valid target. API validation and service checks must agree with database XOR integrity; no client-supplied state can bypass it.

Submission uses an idempotency key for a short defined replay window to prevent duplicate enquiries caused by retries. Public requests are rate limited, spam-protected, size-limited, validated server-side, logged as security-relevant events where appropriate, and never publicly readable. Final retention/deletion/legal policy is not defined by this contract.

## 6. Admin/CMS contract

Admin endpoints are under `/admin` and return domain management DTOs, not raw relational rows. They include internal lifecycle, revision, approval, rights, and audit information only for authorized actors.

| Method | Endpoint | Purpose | Required responsibility | Request / response |
|---|---|---|---|---|
| GET | `/admin/{resource}` | List managed resources; admin filtering permitted | Authorized actor | lifecycle/locale/type filters; management summaries |
| POST | `/admin/{resource}` | Create draft conceptual item | Author/Editor | type-valid draft input; management detail |
| GET | `/admin/{resource}/{id}` | Read management detail | Authorized actor | variants, current revision, lifecycle, rights summary |
| POST | `/admin/{resource}/{id}/variants/{locale}/revisions` | Create localized revision | Author/Editor | localized draft content; revision detail |
| POST | `/admin/{resource}/{id}/variants/{locale}/submit-approval` | Submit exact revision | Author/Editor | revision reference; submission state |
| POST | `/admin/revisions/{id}/approvals` | Approve or reject exact revision | Approver | outcome; approval evidence/history |
| POST | `/admin/{resource}/{id}/variants/{locale}/publish` | Publish eligible localized variant | Publisher | current approved revision; publication state |
| POST | `/admin/{resource}/{id}/variants/{locale}/unpublish` | Withdraw public variant | Publisher | required recorded URL/SEO outcome reference; state |
| POST | `/admin/{resource}/{id}/archive` | Archive aggregate content | Publisher | archive reason; state |
| POST | `/admin/{resource}/{id}/remove` | Permanently remove where permitted | Publisher | required recorded URL/SEO outcome reference; state |
| GET | `/admin/{resource}/{id}/audit` | Authorized audit history | Authorized governance actor | paginated audit records |
| POST | `/admin/media` | Register/upload media workflow | Author/Editor | asset metadata; draft asset detail |
| PATCH | `/admin/media/{id}` | Update rights/metadata | Author/Editor; rights verification requires authorized workflow | asset management detail |
| POST | `/admin/{resource}/{id}/variants/{locale}/media` | Associate/present media | Author/Editor | asset, role, order, localized alt/caption |
| GET/PATCH | `/admin/quote-requests/{id}` | Read/process private request | Explicitly authorized actor | private management DTO / processing update |

`{resource}` is restricted to products, collections, applications, projects, journal-articles, and company-content; it is not arbitrary table exposure. Type-specific relationship operations are nested management operations and validate allowed source/target types. The API does not offer admin routes for unsupported machinery, certifications, capacity, customer, logistics, or invented product fields.

Publication flow is fixed: `Revision → Approval → eligibility checks → Publish`. Publishing must return `409`/`422` when approval, language completeness/exception, primary media, alt text, rights, lifecycle, or Product publication-gate requirements fail.

## 7. Media contract

Media upload transport/storage is implementation-stage. The contract requires an authorized draft-media creation flow and must not reveal private storage topology. Admin media DTOs include type, source reference, original/derived relationship, rights state/evidence reference, and current eligible associations. Public DTOs expose only eligible MediaPresentations.

Media association validates existence, allowed role, ordering, variant locale, contextual alt-text rule, rights eligibility, and authority. Derived media must reference an original; original marble/product appearance may not be silently altered by an assumed AI transformation workflow.

## 8. Caching, security, and observability

Published public reads are cacheable by locale and public identifier; list caches also vary by pagination/sort. Publish, unpublish, archive, removal, revision publication, media-rights changes, and eligible relationship changes must invalidate affected public detail/list/related-content caches. Admin and Quote Request endpoints are not publicly cacheable.

Security requires authenticated admin access, server-side authorization, least privilege, CSRF protection where cookie/session auth applies, request-size limits, allowlisted mutation input (no mass assignment), IDOR protection on every identifier, safe security headers, rate limits, and structured security/error logging. Each response/loggable mutation has a correlation/request ID. Important mutations create domain audit records; logs must not expose private Quote Request data or secrets.

## 9. Traceability

| Endpoint group | Origin |
|---|---|
| Public catalog/content APIs | `01` page inventory/content hierarchy; `02` catalog/editorial domain; `03` entities and lifecycle. |
| Localization/revision/approval/publication APIs | `00` governance/language rules; `01` multilingual/governance; `02` localization/governance; `03` variant/revision/approval model. |
| Media APIs | `00` media/alt-text rules; `02` media domain; `03` MediaAsset/ContentMedia. |
| Quote Request APIs | `00` privacy/security; `01` V1 quote-context rule; `02` inquiry domain; `03` XOR context strategy. |
| Security/audit | `00` security baseline; `02` governance; `03` actors/audit. |

## 10. Open decisions

### API-contract blocking

None. The contract supports all approved V1 behavior without choosing unresolved company facts or implementation technology.

### API-contract non-blocking

1. Actual Content Owner assignment and final authorized Quote Request processing actors.
2. Legal/privacy retention, recipients, and deletion policy for Quote Requests.
3. Approved technical/commercial Product fields and future discovery attributes.
4. Whether qualifying public Project content exists at launch.

### Implementation-stage

1. Route-handler framework, authentication mechanism, validation library, storage upload protocol, CDN/cache technology, logging vendor, and exact rate-limit thresholds.
2. SQL/Prisma/migration syntax, transactional implementation, DTO serialization library, and error-message translation mechanism.
3. Final SEO URL/canonical/redirect/`hreflang` implementation.

## 11. Consistency audit

| Check | Result |
|---|---|
| Public boundary | Pass: only eligible published localized content is returned; no governance/private data leaks. |
| Admin boundary | Pass: revisions, approvals, lifecycle, media rights, quotes, and audit are authorized management concerns. |
| Multilingual | Pass: one identity, locale-specific variant/revision/approval, no implicit fallback. |
| Quote Request | Pass: API rejects all context combinations other than zero or exactly one allowed context. |
| V1 scope | Pass: no internal search, advanced filters, comparison, sample request, commerce, account, portal, or integration endpoint exists. |
| Implementation boundary | Pass: this document contains contracts only, not code, ORM, SQL, or storage design. |
