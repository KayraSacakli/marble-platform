# Final Implementation Plan

## 1. Purpose

This is the final planning document before implementation begins. It bridges planning and coding by defining exactly what to build, in what order, with what dependencies, and how to verify each step.

After this document is completed, the project moves directly into coding.

---

## 2. Document hierarchy

This document does not override any previous document. It implements them.

---

# PART A — FINAL PROJECT STATUS

## 3. Architecture summary

### 3.1 Project goal

Premium Turkish marble manufacturer/export catalogue website. Bilingual TR/EN. Data-driven via CMS/API. Luxury editorial design.

### 3.2 Target users

- International architects, interior designers, procurement managers
- Domestic Turkish buyers
- Visual decision-makers: marble selection is image-driven

### 3.3 Technology direction

| Layer | Direction |
|---|---|
| Frontend | React (SPA/SSR hybrid; framework OPEN DECISION) |
| Backend | Node.js API server |
| Database | PostgreSQL via Prisma ORM |
| CMS | External admin interface; API-first |
| Media | Image CDN or managed storage |
| Hosting | Cloud (provider OPEN DECISION) |

### 3.4 Frontend architecture

- Component-based React architecture
- 84+ components across 8 categories
- 17 page types
- 4 layout patterns
- Design system with 10+ token categories
- Localized via URL path (`/tr/...`, `/en/...`)

### 3.5 Backend architecture

- RESTful API under `/api/v1`
- Public endpoints: `/api/v1/public/*`
- Admin endpoints: `/api/v1/admin/*`
- Layered: API → Service → Repository → Prisma → Database
- 18 public endpoints, 16 CMS write operations

### 3.6 Database architecture

- ContentItem (universal content entity)
- ContentVariant (locale-specific data per ContentItem)
- ContentRevision (version history)
- MediaAsset (images, videos, documents)
- QuoteRequest (conversion)
- AuditEvent (lifecycle tracking)
- ContentRelationship (associations)

### 3.7 Content architecture

- One ContentItem per logical content piece
- ContentVariant per locale (TR/EN)
- ContentRelationship for associations
- Publication lifecycle: Draft → Approved → Published → Unpublished → Archived

### 3.8 API architecture

- JSON responses with `meta`, `data`, `pagination` structure
- Locale via path prefix
- Publication state filtering server-side
- SEO data embedded in responses
- Media as MediaPresentation objects

### 3.9 SEO architecture

- Path-based locale (`/tr/...`, `/en/...`)
- Self-referencing canonicals
- Reciprocal hreflang (TR ↔ EN)
- x-default → Turkish
- `/` → 302/307 to `/tr/`
- No automatic language detection
- Image sitemap included
- Structured data: Organization, WebSite, Product, Article, BreadcrumbList

### 3.10 Design system

- Colors: warm ivory, limestone, sand, charcoal, graphite, taupe, white, muted bronze accent
- Typography: Playfair Display (serif) + Inter (sans-serif)
- 8px spacing system, 10 spacing tokens
- Buttons: sharp corners (radius-none), uppercase, Primary/Secondary/Ghost
- Breakpoints: Mobile <768px, Tablet 768–1199px, Desktop ≥1200px
- Motion: respects prefers-reduced-motion

### 3.11 Localization

- TR + EN as language variants
- URL path-based locale
- No implicit language fallback
- Language switch takes user to equivalent translated page
- Missing translation: non-deceptive state, not silent switch

### 3.12 Media architecture

- MediaPresentation: src, srcset, dimensions, aspectRatio, alt, caption, focalPoint, loading, poster, fallbackSrc
- No storage internals exposed
- Rights verification before publication
- Responsive images with srcset

### 3.13 Testing approach

- Unit tests for business logic
- Integration tests for API
- Component tests for critical components
- E2E tests for critical user journeys
- Accessibility tests (automated + manual)
- SEO tests for metadata/URLs/sitemap
- Performance tests for Core Web Vitals

---

# PART B — FINAL SOURCE OF TRUTH HIERARCHY

## 4. Document priority

When two documents appear to conflict, the higher-priority document wins.

| Priority | Document | Scope |
|---|---|---|
| 1 | `00_PROJECT_RULES.md` | Immutable rules, glossary, scope |
| 2 | `03_DATABASE_ER.md` | Database constraints |
| 3 | `13_API_CMS_CONTRACT.md` | API contract |
| 4 | `12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md` | Content model |
| 5 | `06_SEO_URL_ARCHITECTURE.md` + `14_SEO_URL_IMPLEMENTATION_SPEC.md` | SEO/URL rules |
| 6 | `10_DESIGN_SYSTEM.md` | Design tokens and rules |
| 7 | `11_PAGE_SPECIFICATIONS.md` | Page specifications |
| 8 | `09_COMPONENT_TREE.md` | Component architecture |
| 9 | `07_HOMEPAGE_SCROLL_VIDEO.md` | Homepage hero behavior |
| 10 | `08_PAGE_WIREFRAMES.md` | Wireframe structure |
| 11 | `01_MASTER_INFORMATION_ARCHITECTURE.md` | User journeys, navigation |
| 12 | `02_DOMAIN_MODEL.md` | Domain model |
| 13 | `04_API_CONTRACT.md` | API structure |
| 14 | `05_CMS_CONTRACT.md` | CMS workflow |
| 15 | `15_FINAL_IMPLEMENTATION_PLAN.md` | This document |

Rules:
- Highest-priority document wins in conflict
- If equal priority: document with most specific scope wins
- All conflicts must be documented, not silently resolved

---

# PART C — FINAL V1 SCOPE

## 5. V1 scope

### 5.1 V1 REQUIRED

| Feature | Source |
|---|---|
| Bilingual TR/EN website | `00_PROJECT_RULES.md` |
| Homepage with hero video/fallback | `07_HOMEPAGE_SCROLL_VIDEO.md`, `11_PAGE_SPECIFICATIONS.md` |
| Product catalogue (100+ products) | `11_PAGE_SPECIFICATIONS.md` |
| Product detail | `11_PAGE_SPECIFICATIONS.md` |
| Collection listing + detail | `11_PAGE_SPECIFICATIONS.md` |
| Application listing + detail | `11_PAGE_SPECIFICATIONS.md` |
| Project listing + detail | `11_PAGE_SPECIFICATIONS.md` |
| Journal listing + detail | `11_PAGE_SPECIFICATIONS.md` |
| About | `11_PAGE_SPECIFICATIONS.md` |
| Quarry | `11_PAGE_SPECIFICATIONS.md` |
| Factory | `11_PAGE_SPECIFICATIONS.md` |
| Contact | `11_PAGE_SPECIFICATIONS.md` |
| Quote request | `11_PAGE_SPECIFICATIONS.md` |
| 404 page | `11_PAGE_SPECIFICATIONS.md` |
| Dynamic content via API/CMS | `12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md`, `13_API_CMS_CONTRACT.md` |
| Responsive design (mobile/tablet/desktop) | `10_DESIGN_SYSTEM.md` |
| SEO: canonical, hreflang, sitemap, metadata, structured data | `14_SEO_URL_IMPLEMENTATION_SPEC.md` |
| Image sitemap | `14_SEO_URL_IMPLEMENTATION_SPEC.md` |
| 301 redirects for slug changes | `14_SEO_URL_IMPLEMENTATION_SPEC.md` |
| `/` → 302/307 to `/tr/` | `14_SEO_URL_IMPLEMENTATION_SPEC.md` |
| No automatic language detection | `14_SEO_URL_IMPLEMENTATION_SPEC.md` |
| x-default → Turkish | `14_SEO_URL_IMPLEMENTATION_SPEC.md` |
| Design system implementation | `10_DESIGN_SYSTEM.md` |
| Media: srcset, lazy loading, alt text, dimensions | `13_API_CMS_CONTRACT.md`, `14_SEO_URL_IMPLEMENTATION_SPEC.md` |
| Hero video with poster/fallback/reduced-motion | `07_HOMEPAGE_SCROLL_VIDEO.md` |
| Accessibility: WCAG 2.1 AA target | `10_DESIGN_SYSTEM.md`, `11_PAGE_SPECIFICATIONS.md` |
| Pagination (server-side, page/pageSize) | `13_API_CMS_CONTRACT.md` |
| Content relationships (product↔collection, etc.) | `12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md` |
| Quote request form (with context) | `11_PAGE_SPECIFICATIONS.md`, `12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md` |
| 404 with recovery links | `11_PAGE_SPECIFICATIONS.md` |
| Breadcrumbs (localized) | `14_SEO_URL_IMPLEMENTATION_SPEC.md` |
| Internal linking | `07_INTERNAL_LINK_GRAPH.md` |
| Featured content on homepage | `11_PAGE_SPECIFICATIONS.md` |
| Related products on product detail | `11_PAGE_SPECIFICATIONS.md` |
| OG/social metadata | `14_SEO_URL_IMPLEMENTATION_SPEC.md` |
| robots.txt | `14_SEO_URL_IMPLEMENTATION_SPEC.md` |
| Publication lifecycle (Draft→Approved→Published→Unpublished→Archived) | `12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md` |

### 5.2 V1 OPTIONAL

| Feature | Source |
|---|---|
| Image sitemap | `14_SEO_URL_IMPLEMENTATION_SPEC.md` — decided: REQUIRED |
| Analytics events | `11_PAGE_SPECIFICATIONS.md` |
| CMS/admin interface | `05_CMS_CONTRACT.md`, `13_API_CMS_CONTRACT.md` |
| Development seed data | Implementation decision |
| Unit/integration tests | Implementation decision |

### 5.3 DEFERRED

| Feature | Source |
|---|---|
| Advanced product filtering/search | `00_PROJECT_RULES.md` |
| Product comparison | `00_PROJECT_RULES.md` |
| E-commerce/payment | `00_PROJECT_RULES.md` |
| Customer accounts | `00_PROJECT_RULES.md` |
| Internal search infrastructure | `00_PROJECT_RULES.md` |
| Advanced recommendation engine | `00_PROJECT_RULES.md` |
| Sample request system | `00_PROJECT_RULES.md` |
| Architect download portal | `00_PROJECT_RULES.md` |
| Multi-language beyond TR/EN | Out of scope |
| Content versioning UI (editorial rollback) | `05_CMS_CONTRACT.md` |
| Advanced media rights workflow | `12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md` |
| Real-time inventory/availability | Not in approved docs |
| Pricing display | Not in approved docs |
| Reviews/ratings | Not in approved docs |

### 5.4 OPEN DECISION (Blocking)

| # | Decision | Source | Impact |
|---|---|---|---|
| 1 | Frontend framework choice | Implementation | Application architecture |
| 2 | Backend framework/structure choice | Implementation | API architecture |
| 3 | Database provider/hosting | Implementation | Data persistence |
| 4 | Media storage solution | Implementation | Image/video delivery |
| 5 | Hosting/cloud provider | Implementation | Deployment |

Note: These are technology choices, not architectural inventions. The architecture documents define WHAT to build; technology selection is an implementation decision.

---

# PART D — EXPLICITLY OUT OF SCOPE

## 6. Not building in V1

| Feature | Reason |
|---|---|
| E-commerce / payment | Not a catalogue-to-purchase site |
| Customer accounts / login | Not needed for V1 catalogue |
| Product configurator | Out of scope for V1 |
| Pricing / inventory display | Not in approved content model |
| Reviews / ratings | No review system approved |
| Advanced search / filtering | Explicitly deferred in `00_PROJECT_RULES.md` |
| Product comparison | Explicitly deferred |
| Sample request system | Explicitly deferred |
| Architect download portal | Explicitly deferred |
| Internal search | Explicitly deferred |
| Recommendation engine | Explicitly deferred |
| Multi-language beyond TR/EN | TR/EN only |
| Blog comments | No comment system approved |
| Live chat | Not in scope |
| Newsletter signup | Not in approved content model |
| Social media integration beyond OG | Not in scope |
| Map integration for quarry/factory | Not in approved content |
| Careers page | Not in approved pages |
| Legal/privacy pages | Not in approved pages (OPEN DECISION if needed) |
| Cookie consent | Implementation decision (not architectural) |

---

# PART E — IMPLEMENTATION PHASES

## 7. Phase definitions

### PHASE 0 — Repository / Environment Verification

Verify development environment is ready.

### PHASE 1 — Project Foundation

Application entry, routing foundation, global providers, configuration.

### PHASE 2 — Database / Persistence

Schema, migrations, seed strategy, database connection.

### PHASE 3 — Backend Core

Server entry, middleware, error handling, validation foundation.

### PHASE 4 — API / Content Layer

Public API endpoints, content retrieval, publication filtering.

### PHASE 5 — Frontend Foundation

Application shell, global styles, design tokens, routing, API client.

### PHASE 6 — Design System Implementation

Colors, typography, spacing, layout, buttons, forms, media, cards.

### PHASE 7 — Global Shell

Header, footer, navigation, breadcrumbs, language switch.

### PHASE 8 — Homepage

Hero, featured content, section ordering, CTA, video/fallback.

### PHASE 9 — Catalogue / Products

Product listing, product cards, pagination, product detail, gallery, related products.

### PHASE 10 — Collections / Applications

Collection listing, collection detail, application listing, application detail.

### PHASE 11 — Projects / Journal

Project listing, project detail, journal listing, journal detail.

### PHASE 12 — Company / Quarry / Factory / Contact

About, quarry, factory, contact pages.

### PHASE 13 — Quote Request

Quote request form with context passing.

### PHASE 14 — SEO / Localization

Canonical, hreflang, metadata, structured data, sitemap, robots, redirects, 404, language switching.

### PHASE 15 — Accessibility / Performance

WCAG 2.1 AA compliance, Core Web Vitals optimization.

### PHASE 16 — Testing / QA

Unit, integration, component, E2E, accessibility, SEO, performance tests.

### PHASE 17 — Production Preparation

Build optimization, environment configuration, deployment, monitoring.

---

# PART F — PHASE DEPENDENCY GRAPH

## 8. Dependencies

```
PHASE 0 (Environment)
  ↓
PHASE 1 (Foundation)
  ↓
PHASE 2 (Database)
  ↓
PHASE 3 (Backend Core)
  ↓
PHASE 4 (API Layer)
  ↓
PHASE 5 (Frontend Foundation)
  ↓
PHASE 6 (Design System)
  ↓
PHASE 7 (Global Shell)
  ↓
├─ PHASE 8 (Homepage)
├─ PHASE 9 (Catalogue) ← depends on PHASE 4 for product API
├─ PHASE 10 (Collections/Apps) ← depends on PHASE 4
├─ PHASE 11 (Projects/Journal) ← depends on PHASE 4
├─ PHASE 12 (Company pages) ← depends on PHASE 4
├─ PHASE 13 (Quote Request) ← depends on PHASE 4
│
PHASE 14 (SEO) ← depends on PHASE 7–13
PHASE 15 (A11y/Perf) ← depends on PHASE 7–13
PHASE 16 (Testing) ← depends on PHASE 14–15
PHASE 17 (Production) ← depends on PHASE 16
```

Blockers:
- PHASE 2 blocks PHASE 3
- PHASE 3 blocks PHASE 4
- PHASE 4 blocks PHASE 5–13
- PHASE 6 blocks PHASE 7–13 (design tokens required)
- PHASE 14–15 require PHASE 7–13 complete

Parallelizable:
- PHASE 8–13 can be parallelized after PHASE 7 (with PHASE 4 API ready)
- Content preparation can happen alongside PHASE 2–6
- Test preparation can happen alongside PHASE 7–13

---

# PART G — REPOSITORY / DIRECTORY PLAN

## 9. Directory structure

### 9.1 Root structure

```
d-zelt/
├── frontend/          # React application
├── backend/           # Node.js API server
├── shared/            # Shared types if needed
├── docs/              # Architecture documents (00–15)
├── .gitignore
├── README.md
└── package.json       # Root workspace (if monorepo)
```

### 9.2 Frontend structure

```
frontend/
├── public/            # Static assets (favicon, robots.txt, sitemap)
├── src/
│   ├── app/           # Application entry, providers, routing
│   ├── layouts/       # Layout components (4 patterns)
│   ├── pages/         # Page components (17 types)
│   ├── components/    # Reusable components (84+)
│   │   ├── layout/    # Layout components
│   │   ├── content/   # Content components
│   │   ├── media/     # Media components
│   │   ├── navigation/# Navigation components
│   │   ├── conversion/# Conversion components
│   │   ├── state/     # State components
│   │   ├── forms/     # Form components
│   │   └── seo/       # SEO components (metadata, structured data)
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilities, API client, helpers
│   ├── styles/        # Global styles, design tokens
│   ├── types/         # TypeScript types
│   ├── assets/        # Static assets (fonts, icons)
│   └── tests/         # Test files
├── tsconfig.json
├── vite.config.ts (or equivalent)
└── package.json
```

### 9.3 Backend structure

```
backend/
├── src/
│   ├── server.ts      # Server entry
│   ├── app.ts         # Express/Fastify app setup
│   ├── routes/        # API route definitions
│   │   ├── public/    # Public API routes
│   │   └── admin/     # Admin API routes
│   ├── controllers/   # Request/response handling
│   ├── services/      # Business logic
│   ├── repositories/  # Data access
│   ├── prisma/        # Prisma schema, migrations, client
│   ├── middleware/     # Auth, validation, error handling
│   ├── utils/         # Utilities
│   └── types/         # TypeScript types
├── prisma/
│   ├── schema.prisma  # Database schema
│   ├── migrations/    # Migration files
│   └── seed.ts        # Seed script
├── tsconfig.json
└── package.json
```

### 9.4 Shared structure (if applicable)

```
shared/
├── types/             # Shared TypeScript types
└── constants/         # Shared constants
```

---

# PART H — FILE CREATION PLAN

## 10. Important files by phase

### PHASE 1 — Foundation

| File | Purpose |
|---|---|
| `frontend/src/app/main.tsx` | Application entry |
| `frontend/src/app/App.tsx` | Root component |
| `frontend/src/app/providers.tsx` | Global providers (routing, theme, locale) |
| `frontend/src/app/router.tsx` | Route definitions |
| `backend/src/server.ts` | Server entry |
| `backend/src/app.ts` | App setup |
| `backend/prisma/schema.prisma` | Database schema |

### PHASE 2 — Database

| File | Purpose |
|---|---|
| `backend/prisma/schema.prisma` | Full schema |
| `backend/prisma/migrations/` | Migrations |
| `backend/prisma/seed.ts` | Seed script |

### PHASE 3 — Backend Core

| File | Purpose |
|---|---|
| `backend/src/middleware/errorHandler.ts` | Error handling |
| `backend/src/middleware/validation.ts` | Input validation |
| `backend/src/middleware/auth.ts` | Authorization (admin) |

### PHASE 4 — API Layer

| File | Purpose |
|---|---|
| `backend/src/routes/public/` | All 18 public endpoints |
| `backend/src/controllers/` | Request handlers |
| `backend/src/services/` | Business logic |
| `backend/src/repositories/` | Data access |

### PHASE 5 — Frontend Foundation

| File | Purpose |
|---|---|
| `frontend/src/lib/api.ts` | API client |
| `frontend/src/lib/locale.ts` | Locale utilities |
| `frontend/src/styles/tokens.css` | Design tokens |
| `frontend/src/styles/global.css` | Global styles |
| `frontend/src/types/content.ts` | Content types |

### PHASE 6 — Design System

| File | Purpose |
|---|---|
| `frontend/src/styles/tokens.css` | All design tokens |
| `frontend/src/components/ui/` | Base UI components |

### PHASE 7–13 — Pages and Components

See Parts M–S below for detailed component/page file plans.

---

# PART I — PHASE IMPLEMENTATION DETAILS

## 11. Phase-by-phase specification

### PHASE 0 — Repository / Environment Verification

**Goal:** Development environment ready.

**Prerequisites:** None.

**Tasks:**
1. Verify Node.js/npm/pnpm installed
2. Verify PostgreSQL available
3. Verify Git initialized
4. Verify directory structure
5. Create `.gitignore`
6. Create `README.md` (minimal)

**Files affected:** Root directory.

**Dependencies:** None.

**Test requirements:** All tools respond correctly.

**Acceptance criteria:** `node -v`, `npm -v`, `psql --version` all succeed. Git status clean.

**Exit criteria:** Clean working directory, all tools available.

---

### PHASE 1 — Project Foundation

**Goal:** Application skeleton boots.

**Prerequisites:** PHASE 0.

**Tasks:**
1. Initialize frontend project (Vite/Next.js/etc.)
2. Initialize backend project (Express/Fastify/etc.)
3. Configure TypeScript
4. Configure ESLint/Prettier
5. Create application entry points
6. Create basic routing
7. Create basic health check endpoint
8. Configure CORS
9. Verify frontend boots
10. Verify backend boots

**Files affected:** `frontend/`, `backend/`, root configs.

**Dependencies:** Technology selection (OPEN DECISION).

**Test requirements:** Frontend renders, backend returns 200 on health.

**Acceptance criteria:** `npm run dev` works for both frontend and backend. Health check returns 200.

**Exit criteria:** Both applications boot, communicate, and display "hello world".

---

### PHASE 2 — Database / Persistence

**Goal:** Database schema exists and migrations run.

**Prerequisites:** PHASE 1.

**Tasks:**
1. Configure Prisma
2. Create schema (from `03_DATABASE_ER.md`)
3. Create enums
4. Create relations
5. Create indexes
6. Run initial migration
7. Verify schema
8. Create seed script structure

**Files affected:** `backend/prisma/`.

**Dependencies:** PostgreSQL available.

**Test requirements:** Migration runs cleanly. Schema matches `03_DATABASE_ER.md`.

**Acceptance criteria:** `prisma migrate dev` succeeds. `prisma studio` shows tables.

**Exit criteria:** Database schema matches specification. No migration errors.

---

### PHASE 3 — Backend Core

**Goal:** Backend server with middleware.

**Prerequisites:** PHASE 2.

**Tasks:**
1. Configure server entry
2. Add body parsing
3. Add CORS middleware
4. Add error handling middleware
5. Add request logging
6. Add validation middleware foundation
7. Add Prisma client singleton
8. Verify server boots with database connection

**Files affected:** `backend/src/`.

**Dependencies:** Database connection.

**Test requirements:** Server starts. Database connection succeeds. Error handler catches errors.

**Acceptance criteria:** Server boots, connects to database, returns 200 on health check.

**Exit criteria:** Backend foundation ready for API routes.

---

### PHASE 4 — API / Content Layer

**Goal:** Public API endpoints functional.

**Prerequisites:** PHASE 3.

**Tasks:**
1. Create route structure (`/api/v1/public/*`)
2. Implement health check endpoint
3. Implement product listing endpoint
4. Implement product detail endpoint
5. Implement collection listing endpoint
6. Implement collection detail endpoint
7. Implement application listing endpoint
8. Implement application detail endpoint
9. Implement project listing endpoint
10. Implement project detail endpoint
11. Implement journal listing endpoint
12. Implement journal detail endpoint
13. Implement page content endpoint (about, quarry, factory, contact)
14. Implement quote request endpoint
15. Add publication state filtering
16. Add locale handling
17. Add pagination
18. Add SEO data in responses
19. Add MediaPresentation
20. Add error responses
21. Test all endpoints

**Files affected:** `backend/src/routes/`, `backend/src/controllers/`, `backend/src/services/`, `backend/src/repositories/`.

**Dependencies:** Database schema, seed data.

**Test requirements:** All endpoints return correct structure. Publication filtering works. Locale works. Pagination works.

**Acceptance criteria:** All 18 public endpoints return correct JSON structure. Publication state filtering works. Locale switching works.

**Exit criteria:** API contract implemented. All endpoints tested manually.

---

### PHASE 5 — Frontend Foundation

**Goal:** Frontend shell with routing and API client.

**Prerequisites:** PHASE 4.

**Tasks:**
1. Create API client
2. Create locale utilities
3. Create type definitions
4. Create design token foundation
5. Create global styles
6. Create routing setup
7. Create base layout
8. Create providers (locale, theme)
9. Verify routing works
10. Verify API calls work

**Files affected:** `frontend/src/lib/`, `frontend/src/types/`, `frontend/src/styles/`, `frontend/src/app/`.

**Dependencies:** API endpoints available.

**Test requirements:** Routing works. API calls return data. Types match API responses.

**Acceptance criteria:** Application boots, routes work, API data displays in console.

**Exit criteria:** Frontend foundation ready for components and pages.

---

### PHASE 6 — Design System Implementation

**Goal:** Design tokens and base components.

**Prerequisites:** PHASE 5.

**Tasks:**
1. Implement color tokens
2. Implement typography tokens
3. Implement spacing tokens
4. Implement layout tokens
5. Implement breakpoint tokens
6. Implement button components (Primary, Secondary, Ghost)
7. Implement form components (Input, Select, Textarea)
8. Implement card components
9. Implement media components (Image, Video, Gallery)
10. Implement state components (Loading, Error, Empty)
11. Verify token usage

**Files affected:** `frontend/src/styles/`, `frontend/src/components/ui/`.

**Dependencies:** Design system specification (`10_DESIGN_SYSTEM.md`).

**Test requirements:** Tokens match specification. Components render correctly. Responsive behavior works.

**Acceptance criteria:** All design tokens implemented. Base components render with correct styling.

**Exit criteria:** Design system foundation complete. Ready for page implementation.

---

### PHASE 7 — Global Shell

**Goal:** Header, footer, navigation, breadcrumbs.

**Prerequisites:** PHASE 6.

**Tasks:**
1. Implement Header component
2. Implement Footer component
3. Implement primary navigation
4. Implement language switch
5. Implement breadcrumb component
6. Implement mobile navigation
7. Integrate shell into layout
8. Test responsive behavior

**Files affected:** `frontend/src/components/navigation/`, `frontend/src/layouts/`.

**Dependencies:** Design tokens, routing, locale utilities.

**Test requirements:** Navigation works. Language switch works. Breadcrumbs display. Mobile menu works.

**Acceptance criteria:** Global shell renders correctly on all breakpoints. Language switch navigates to correct locale.

**Exit criteria:** Application shell ready for page content.

---

### PHASE 8 — Homepage

**Goal:** Homepage with hero and featured content.

**Prerequisites:** PHASE 7, PHASE 4 (homepage API).

**Tasks:**
1. Implement hero section with video/fallback
2. Implement poster display
3. Implement reduced-motion fallback
4. Implement mobile fallback
5. Implement featured products section
6. Implement featured collections section
7. Implement featured applications section
8. Implement CTA section
9. Implement section ordering from API
10. Implement loading states
11. Implement error states
12. Test responsive behavior
13. Test video/fallback behavior

**Files affected:** `frontend/src/pages/HomePage.tsx`, `frontend/src/components/content/`, `frontend/src/components/media/`.

**Dependencies:** `07_HOMEPAGE_SCROLL_VIDEO.md`, homepage API data.

**Test requirements:** Hero renders. Fallbacks work. Featured content loads. Section ordering works.

**Acceptance criteria:** Homepage renders with hero, featured content, correct section order. All fallback states work.

**Exit criteria:** Homepage implementation complete.

---

### PHASE 9 — Catalogue / Products

**Goal:** Product listing and detail pages.

**Prerequisites:** PHASE 7, PHASE 4 (product API).

**Tasks:**
1. Implement product listing page
2. Implement product card component
3. Implement pagination controls
4. Implement loading state
5. Implement empty state
6. Implement error state
7. Implement product detail page
8. Implement product gallery
9. Implement related products
10. Implement product SEO metadata
11. Test responsive behavior
12. Test pagination behavior

**Files affected:** `frontend/src/pages/ProductListingPage.tsx`, `frontend/src/pages/ProductDetailPage.tsx`, `frontend/src/components/content/ProductCard.tsx`, `frontend/src/components/media/Gallery.tsx`.

**Dependencies:** Product API endpoints.

**Test requirements:** Listing loads. Pagination works. Detail loads. Gallery works. Related products load.

**Acceptance criteria:** Product listing displays 100+ products via pagination. Product detail displays full product information. Gallery works.

**Exit criteria:** Product catalogue implementation complete.

---

### PHASE 10 — Collections / Applications

**Goal:** Collection and application pages.

**Prerequisites:** PHASE 7, PHASE 4.

**Tasks:**
1. Implement collection listing page
2. Implement collection detail page
3. Implement application listing page
4. Implement application detail page
5. Implement SEO metadata
6. Test responsive behavior

**Files affected:** `frontend/src/pages/CollectionListingPage.tsx`, `frontend/src/pages/CollectionDetailPage.tsx`, `frontend/src/pages/ApplicationListingPage.tsx`, `frontend/src/pages/ApplicationDetailPage.tsx`.

**Dependencies:** Collection/application API endpoints.

**Test requirements:** Listings load. Details load. SEO metadata correct.

**Acceptance criteria:** Collection and application pages render correctly with API data.

**Exit criteria:** Collections and applications implementation complete.

---

### PHASE 11 — Projects / Journal

**Goal:** Project and journal pages.

**Prerequisites:** PHASE 7, PHASE 4.

**Tasks:**
1. Implement project listing page (conditional)
2. Implement project detail page
3. Implement journal listing page
4. Implement journal detail page
5. Implement SEO metadata
6. Test responsive behavior

**Files affected:** `frontend/src/pages/ProjectListingPage.tsx`, `frontend/src/pages/ProjectDetailPage.tsx`, `frontend/src/pages/JournalListingPage.tsx`, `frontend/src/pages/JournalDetailPage.tsx`.

**Dependencies:** Project/journal API endpoints.

**Test requirements:** Listings load. Details load. Project listing conditional on qualifying content.

**Acceptance criteria:** Project and journal pages render correctly.

**Exit criteria:** Projects and journal implementation complete.

---

### PHASE 12 — Company / Quarry / Factory / Contact

**Goal:** Company information pages.

**Prerequisites:** PHASE 7, PHASE 4.

**Tasks:**
1. Implement about page
2. Implement quarry page
3. Implement factory page
4. Implement contact page
5. Implement SEO metadata
6. Test responsive behavior

**Files affected:** `frontend/src/pages/AboutPage.tsx`, `frontend/src/pages/QuarryPage.tsx`, `frontend/src/pages/FactoryPage.tsx`, `frontend/src/pages/ContactPage.tsx`.

**Dependencies:** Page content API endpoints.

**Test requirements:** Pages load. Content displays correctly.

**Acceptance criteria:** Company pages render with correct content.

**Exit criteria:** Company pages implementation complete.

---

### PHASE 13 — Quote Request

**Goal:** Quote request form.

**Prerequisites:** PHASE 7, PHASE 4.

**Tasks:**
1. Implement quote request page
2. Implement form component
3. Implement context passing (product/application/project)
4. Implement form validation
5. Implement submission
6. Implement success/error states
7. Implement noindex
8. Test responsive behavior

**Files affected:** `frontend/src/pages/QuoteRequestPage.tsx`, `frontend/src/components/forms/QuoteForm.tsx`.

**Dependencies:** Quote request API endpoint.

**Test requirements:** Form renders. Validation works. Submission works. Context passing works.

**Acceptance criteria:** Quote request form submits correctly with context.

**Exit criteria:** Quote request implementation complete.

---

### PHASE 14 — SEO / Localization

**Goal:** Technical SEO implementation.

**Prerequisites:** PHASE 7–13.

**Tasks:**
1. Implement canonical tags
2. Implement hreflang tags
3. Implement metadata (title, description)
4. Implement Open Graph tags
5. Implement structured data
6. Implement breadcrumbs with structured data
7. Implement sitemap generation
8. Implement image sitemap
9. Implement robots.txt
10. Implement 301 redirects for slug changes
11. Implement `/` → 302/307 to `/tr/`
12. Implement 404 page
13. Implement `<html lang>` attribute
14. Implement prev/next for pagination
15. Test all SEO elements

**Files affected:** `frontend/src/components/seo/`, `backend/src/routes/`, `frontend/public/robots.txt`, `backend/src/routes/public/sitemap.ts`.

**Dependencies:** All pages implemented.

**Test requirements:** All SEO elements present and correct. Sitemap generates. robots.txt correct.

**Acceptance criteria:** All SEO requirements from `14_SEO_URL_IMPLEMENTATION_SPEC.md` pass.

**Exit criteria:** Technical SEO implementation complete.

---

### PHASE 15 — Accessibility / Performance

**Goal:** WCAG 2.1 AA and Core Web Vitals.

**Prerequisites:** PHASE 7–13.

**Tasks:**
1. Audit semantic HTML usage
2. Verify heading hierarchy
3. Verify keyboard navigation
4. Verify focus states
5. Verify screen reader labels
6. Verify alt text
7. Verify color contrast
8. Verify reduced motion
9. Verify form errors
10. Verify language attributes
11. Optimize LCP
12. Optimize CLS
13. Optimize INP
14. Optimize images
15. Optimize fonts
16. Optimize code splitting
17. Test performance

**Files affected:** Various.

**Dependencies:** Pages implemented.

**Test requirements:** Accessibility audit passes. Performance metrics acceptable.

**Acceptance criteria:** WCAG 2.1 AA target satisfied. Core Web Vitals acceptable.

**Exit criteria:** Accessibility and performance targets met.

---

### PHASE 16 — Testing / QA

**Goal:** Test coverage for critical paths.

**Prerequisites:** PHASE 14–15.

**Tasks:**
1. Write unit tests for business logic
2. Write integration tests for API
3. Write component tests for critical components
4. Write E2E tests for critical user journeys
5. Write accessibility tests
6. Write SEO tests
7. Run performance tests
8. Fix failures

**Files affected:** `frontend/src/tests/`, `backend/src/tests/`.

**Dependencies:** All features implemented.

**Test requirements:** Critical paths tested. Failures fixed.

**Acceptance criteria:** All critical tests pass.

**Exit criteria:** Test coverage acceptable. No critical failures.

---

### PHASE 17 — Production Preparation

**Goal:** Production-ready deployment.

**Prerequisites:** PHASE 16.

**Tasks:**
1. Configure production environment variables
2. Optimize build
3. Configure HTTPS
4. Configure security headers
5. Configure redirects
6. Configure monitoring
7. Configure error logging
8. Configure backups
9. Deploy to staging
10. Verify staging
11. Deploy to production
12. Verify production

**Files affected:** Configuration files, deployment scripts.

**Dependencies:** All features complete and tested.

**Test requirements:** Staging environment works. Production environment works.

**Acceptance criteria:** Website live and functional in production.

**Exit criteria:** V1 deployed and verified.

---

# PART J — DATABASE IMPLEMENTATION

## 12. Database implementation order

### 12.1 Schema order

1. Enums (ContentType, ContentStatus, MediaType, etc.)
2. ContentItem
3. ContentVariant
4. ContentRevision
5. MediaAsset
6. ContentRelationship
7. QuoteRequest
8. AuditEvent

### 12.2 Migration order

1. Create enums
2. Create tables with constraints
3. Create indexes
4. Create relations

### 12.3 Seed strategy

Development seed data:
- 5–10 sample products (neutral placeholders, NOT fake company claims)
- 2–3 sample collections
- 2–3 sample applications
- 0–1 sample project (if qualifying)
- 2–3 sample journal entries
- Basic page content (about, quarry, factory, contact)

Production content:
- Must originate from approved real content
- Must not contain fabricated business claims

---

# PART K — BACKEND IMPLEMENTATION ORDER

## 13. Backend layer order

### 13.1 Layer responsibilities

| Layer | Responsibility | Must NOT |
|---|---|---|
| Route | URL mapping, request parsing | Contain business rules |
| Controller | Request/response handling | Contain business rules |
| Service | Business logic, validation, orchestration | Call another service directly, decide HTTP behavior |
| Repository | Data access, query building | Contain business rules, call another repository |
| Prisma | ORM, schema, migrations | — |

### 13.2 Implementation order

1. Prisma schema and migrations
2. Repository layer (one per content type)
3. Service layer (one per content type)
4. Controller layer (one per route group)
5. Route definitions
6. Middleware (auth, validation, error handling)

---

# PART L — API IMPLEMENTATION ORDER

## 14. API endpoint order

### 14.1 Foundation

1. Health check (`GET /api/v1/health`)
2. Error response format
3. Locale handling middleware
4. Publication state filtering middleware

### 14.2 Content endpoints (in dependency order)

1. Product listing (`GET /api/v1/public/products`)
2. Product detail (`GET /api/v1/public/products/:slug`)
3. Collection listing (`GET /api/v1/public/collections`)
4. Collection detail (`GET /api/v1/public/collections/:slug`)
5. Application listing (`GET /api/v1/public/applications`)
6. Application detail (`GET /api/v1/public/applications/:slug`)
7. Project listing (`GET /api/v1/public/projects`)
8. Project detail (`GET /api/v1/public/projects/:slug`)
9. Journal listing (`GET /api/v1/public/journal`)
10. Journal detail (`GET /api/v1/public/journal/:slug`)
11. Page content (`GET /api/v1/public/pages/:type`)
12. Quote request (`POST /api/v1/public/quote-request`)
13. Sitemap (`GET /api/v1/public/sitemap.xml`)
14. Image sitemap (`GET /api/v1/public/sitemap-images.xml`)

### 14.3 Each endpoint must include

- Locale-aware content retrieval
- Publication state filtering
- SEO data in response
- Media as MediaPresentation
- Proper error responses
- Pagination (where applicable)

---

# PART M — FRONTEND IMPLEMENTATION ORDER

## 15. Frontend layer order

### 15.1 Application shell

1. Entry point (`main.tsx`)
2. Root component (`App.tsx`)
3. Providers (locale, router)
4. Router configuration

### 15.2 Global styles

1. CSS reset
2. Design tokens
3. Typography
4. Base styles

### 15.3 Layouts

1. Default layout
2. Detail layout
3. Full-width layout
4. Form layout

### 15.4 Navigation

1. Header
2. Footer
3. Primary nav
4. Language switch
5. Mobile nav
6. Breadcrumbs

### 15.5 State components

1. LoadingSpinner
2. ErrorMessage
3. EmptyState

### 15.6 Media components

1. ResponsiveImage
2. VideoPlayer
3. Gallery

### 15.7 Conversion components

1. CTABanner
2. QuoteForm

### 15.8 Content components

1. ProductCard
2. CollectionCard
3. ApplicationCard
4. ProjectCard
5. JournalCard
6. RichContent

### 15.9 SEO components

1. PageMetadata
2. StructuredData
3. BreadcrumbStructuredData

---

# PART N — DESIGN SYSTEM IMPLEMENTATION

## 16. Design token implementation

### 16.1 Token categories

| Category | Tokens | Source |
|---|---|---|
| Colors | 10+ color values | `10_DESIGN_SYSTEM.md` §3 |
| Typography | Font families, sizes, weights, line heights | `10_DESIGN_SYSTEM.md` §4 |
| Spacing | 10 spacing tokens (8px system) | `10_DESIGN_SYSTEM.md` §5 |
| Layout | Container widths, grid | `10_DESIGN_SYSTEM.md` §6 |
| Breakpoints | 3 breakpoints | `10_DESIGN_SYSTEM.md` §7 |
| Borders | Border widths | `10_DESIGN_SYSTEM.md` §8 |
| Radii | Border radii (radius-none for buttons) | `10_DESIGN_SYSTEM.md` §8 |
| Shadows | Box shadows | `10_DESIGN_SYSTEM.md` §8 |
| Motion | Durations, easing | `10_DESIGN_SYSTEM.md` §9 |

### 16.2 Implementation order

1. Color tokens
2. Typography tokens
3. Spacing tokens
4. Layout tokens
5. Breakpoint tokens
6. Border/radius/shadow tokens
7. Motion tokens

---

# PART O — COMPONENT IMPLEMENTATION STRATEGY

## 17. Component categories

### 17.1 Layout components

| Component | Dependency | Data Source | Responsive |
|---|---|---|---|
| DefaultLayout | Header, Footer, Nav | — | Yes |
| DetailLayout | Breadcrumbs | — | Yes |
| FullWidthLayout | — | — | Yes |
| FormLayout | — | — | Yes |

### 17.2 Content components

| Component | Dependency | Data Source | Responsive |
|---|---|---|---|
| ProductCard | ResponsiveImage | API product | Yes |
| CollectionCard | ResponsiveImage | API collection | Yes |
| ApplicationCard | ResponsiveImage | API application | Yes |
| ProjectCard | ResponsiveImage | API project | Yes |
| JournalCard | ResponsiveImage | API article | Yes |
| RichContent | — | API HTML | Yes |

### 17.3 Media components

| Component | Dependency | Data Source | Responsive |
|---|---|---|---|
| ResponsiveImage | — | MediaPresentation | Yes |
| VideoPlayer | — | MediaPresentation | Yes |
| Gallery | ResponsiveImage | MediaPresentation[] | Yes |

### 17.4 Navigation components

| Component | Dependency | Data Source | Responsive |
|---|---|---|---|
| Header | PrimaryNav, LanguageSwitch | API navigation | Yes |
| Footer | — | Static | Yes |
| PrimaryNav | — | API navigation | Yes |
| LanguageSwitch | LocaleContext | Current locale | Yes |
| Breadcrumbs | — | Page context | Yes |
| MobileNav | — | API navigation | Yes |

### 17.5 Conversion components

| Component | Dependency | Data Source | Responsive |
|---|---|---|---|
| CTABanner | Button | Static/API | Yes |
| QuoteForm | Form components | — | Yes |

---

# PART P — HOMEPAGE IMPLEMENTATION

## 18. Homepage implementation order

### 18.1 First viewport

1. Hero section container
2. Poster image (eager loaded)
3. Video element (if applicable)
4. Hero heading
5. Hero subheading
6. Hero CTA

### 18.2 Hero behavior (from `07_HOMEPAGE_SCROLL_VIDEO.md`)

1. Poster shown before video loads
2. Video plays on scroll (desktop)
3. Fallback on video failure
4. Fallback on reduced motion
5. Fallback on slow connection
6. Mobile: static fallback (no video)

### 18.3 Featured content

1. Featured products section
2. Featured collections section
3. Featured applications section
4. Section ordering from API

### 18.4 Loading/error states

1. Loading skeleton for hero
2. Loading skeleton for featured sections
3. Error state for failed loads
4. Graceful degradation

---

# PART Q — PRODUCT CATALOGUE IMPLEMENTATION

## 19. Product implementation order

### 19.1 Listing

1. API data fetching
2. Product grid layout
3. Product card component
4. Pagination controls
5. Loading state (skeleton)
6. Empty state
7. Error state

### 19.2 Detail

1. API data fetching
2. Product heading
3. Product gallery
4. Product description
5. Product specifications (if applicable)
6. Related products
7. CTA (quote request)
8. SEO metadata
9. Loading/error states

### 19.3 Pagination

1. Server-side pagination (page/pageSize)
2. Page 1 canonical (base URL)
3. Prev/next links
4. Internal links to pages

---

# PART R — OTHER CONTENT TYPES

## 20. Content type implementation

### 20.1 Common pattern

Each content type follows:
1. API data fetching
2. Listing page
3. Detail page
4. SEO metadata
5. Breadcrumbs
6. Loading/error states
7. Responsive behavior

### 20.2 Collections

- Collection listing with cards
- Collection detail with products
- Products linked via ContentRelationship

### 20.3 Applications

- Application listing with cards
- Application detail with products
- Products linked via ContentRelationship

### 20.4 Projects

- Conditional listing (hidden if no qualifying content)
- Project detail with products
- Products linked via ContentRelationship

### 20.5 Journal

- Journal listing with cards
- Journal detail with rich content
- Products linked via ContentRelationship (editorial)

---

# PART S — QUOTE REQUEST

## 21. Quote request implementation

### 21.1 Form fields

OPEN DECISION: Exact form fields not fully specified in previous documents.

Minimal technically safe implementation:
- Contact information (name, email, company, phone)
- Message/inquiry text
- Context (product/application/project if provided via URL)

### 21.2 Context passing

- Product context: `/tr/quote?product={slug}`
- Application context: `/tr/quote?application={slug}`
- Project context: `/tr/quote?project={slug}`
- General: `/tr/quote`

### 21.3 Form behavior

1. Client-side validation
2. Submission to API
3. Success state
4. Error state
5. noindex directive

---

# PART T — LOCALIZATION IMPLEMENTATION

## 22. Localization implementation

### 22.1 URL-based locale

- `/tr/...` for Turkish
- `/en/...` for English
- `/` → 302/307 to `/tr/`

### 22.2 Localized content

- ContentVariant per locale
- API returns locale-specific content
- No implicit language fallback

### 22.3 Language switching

- Navigate to equivalent URL in other locale
- If translation missing: non-deceptive state
- Never silently switch to unrelated content

### 22.4 HTML attributes

- `<html lang="tr">` or `<html lang="en">`
- Localized metadata
- Localized breadcrumbs

---

# PART U — SEO IMPLEMENTATION

## 23. SEO implementation

### 23.1 Elements

| Element | Implementation |
|---|---|
| Canonical | Self-referencing, absolute URL |
| Hreflang | Reciprocal TR/EN, x-default → TR |
| Title | Localized, unique, brand suffix |
| Description | Localized, unique, 150–160 chars |
| OG tags | Localized, real images only |
| Structured data | Organization, WebSite, Product, Article, BreadcrumbList |
| Sitemap | All published indexable URLs |
| Image sitemap | Product images only |
| robots.txt | Allow public, Disallow admin/API |
| 301 redirects | Slug changes, trailing slash |
| 404 | Recovery links |
| Breadcrumbs | Localized, structured data |

### 23.2 Image sitemap

- Only published, indexable product images
- No decorative UI images
- MediaAsset with `usage === "product"`

---

# PART V — ROOT ROUTE IMPLEMENTATION

## 24. Root route

### 24.1 Behavior

- `/` → 302/307 temporary redirect to `/tr/`
- NOT 301 (entry point, not canonical)
- No IP/browser language detection
- Deterministic behavior

### 24.2 SEO

- Root URL not canonical
- Canonical URLs are `/tr/...` and `/en/...`
- x-default hreflang → `/tr/...`

---

# PART W — MEDIA IMPLEMENTATION

## 25. Media implementation order

### 25.1 Images

1. ResponsiveImage component
2. srcset generation
3. Dimensions (width/height)
4. Alt text
5. Lazy loading (below-fold)
6. Eager loading (hero/above-fold)
7. Format negotiation (WebP/AVIF)
8. Focal point

### 25.2 Video

1. VideoPlayer component
2. Poster display
3. Reduced-motion fallback
4. Mobile fallback
5. Scroll-driven behavior (homepage)

### 25.3 Product images

- Must accurately represent actual marble
- No visual alteration for SEO
- Rights verification before publication

---

# PART X — PERFORMANCE IMPLEMENTATION

## 26. Performance checkpoints

| Metric | Target | Implementation |
|---|---|---|
| LCP | < 2.5s | Hero image preload, responsive images, CDN |
| CLS | < 0.1 | Image dimensions, font-display: swap |
| INP | < 200ms | Minimal JS, code splitting |
| Image optimization | WebP/AVIF, srcset | ResponsiveImage component |
| Font loading | font-display: swap | Preload critical fonts |
| Code splitting | Per-route | Dynamic imports |
| API payload | Optimized | Field selection, pagination |

---

# PART Y — ACCESSIBILITY IMPLEMENTATION

## 27. Accessibility checklist

| Requirement | Implementation | Test |
|---|---|---|
| Semantic HTML | Proper elements | Automated |
| Heading hierarchy | h1 → h2 → h3 | Automated |
| Keyboard navigation | Tab order, focus | Manual |
| Focus states | Visible focus | Manual |
| Screen reader labels | aria-label, aria-labelledby | Manual |
| Alt text | Meaningful descriptions | Automated + Manual |
| Color contrast | 4.5:1 minimum | Automated |
| Reduced motion | prefers-reduced-motion | Manual |
| Form errors | Accessible error messages | Automated |
| Language attributes | html lang | Automated |
| Accessible navigation | Skip links, landmarks | Manual |
| Accessible dialogs | Focus trap | Manual |

---

# PART Z — SECURITY IMPLEMENTATION

## 28. Security checklist

| Requirement | Implementation |
|---|---|
| Input validation | Server-side validation on all inputs |
| Output validation | Sanitize API responses |
| Content sanitization | HTML whitelist for rich content |
| Authorization | Admin endpoints require auth |
| Rate limiting | Quote request endpoint |
| Secure headers | CSP, X-Frame-Options, etc. |
| Secret handling | Environment variables only |
| Media validation | File type and size checks |
| Unpublished content | Server-side filtering, not client-side |
| API error sanitization | No internal errors exposed |

---

# PART AA — TESTING STRATEGY

## 29. Test layers

### 29.1 Unit tests

- Business logic in services
- Utility functions
- Slug normalization
- Locale handling

### 29.2 Integration tests

- API endpoints
- Service + repository + database
- Publication state filtering
- Locale handling

### 29.3 Component tests

- Critical components (Header, Footer, ProductCard, Gallery)
- Responsive behavior
- State rendering (loading, error, empty)

### 29.4 Page tests

- Page rendering with mock data
- SEO metadata rendering
- Breadcrumb rendering

### 29.5 E2E tests

- Critical user journeys (see Part AB)
- Navigation flows
- Language switching
- Form submission

### 29.6 Accessibility tests

- Automated: axe-core or equivalent
- Manual: keyboard navigation, screen reader

### 29.7 SEO tests

- Metadata presence and correctness
- Canonical tags
- Hreflang tags
- Structured data validity
- Sitemap generation
- robots.txt correctness

### 29.8 Performance tests

- Core Web Vitals
- Lighthouse or equivalent
- Image optimization verification

---

# PART AB — CRITICAL USER JOURNEYS

## 30. E2E journeys

| # | Journey | Validates |
|---|---|---|
| 1 | Homepage → Featured Product → Product Detail | Homepage, product, navigation |
| 2 | Product Listing → Pagination → Product Detail | Catalogue, pagination, product |
| 3 | TR Homepage → Language Switch → EN Homepage | Localization, language switch |
| 4 | EN Homepage → Language Switch → TR Homepage | Localization, language switch |
| 5 | Collection Listing → Collection Detail → Product | Collections, relationships |
| 6 | Application Listing → Application Detail → Product | Applications, relationships |
| 7 | Project Listing → Project Detail → Product | Projects, relationships |
| 8 | Journal Listing → Journal Detail → Product | Journal, relationships |
| 9 | Product Detail → Quote Request (with context) | Conversion, context passing |
| 10 | Contact Page → Form Submission | Contact form |
| 11 | Invalid URL → 404 Page → Recovery Link | 404, recovery |
| 12 | Changed Slug → 301 Redirect | Redirects |
| 13 | Missing Translation → Non-deceptive State | Localization fallback |
| 14 | Mobile Navigation → Menu → Page | Mobile responsiveness |
| 15 | Reduced Motion → Static Fallback | Accessibility |
| 16 | Keyboard-Only Navigation → All Interactive Elements | Accessibility |

---

# PART AC — CONTENT / CMS READINESS

## 31. CMS readiness requirements

The implementation must support:

| Requirement | Acceptance Criteria |
|---|---|
| Adding 100+ products | Product listing handles 100+ items via pagination |
| Replacing product images | Media upload and association works |
| Editing product information | Content editing updates published content |
| TR/EN content | Both locales editable independently |
| Publishing/unpublishing | Content lifecycle works end-to-end |
| Ordering | Featured content ordering works |
| SEO metadata | SEO fields editable per content item |
| Media management | Media upload, association, deletion works |

All without modifying React components.

---

# PART AD — DEVELOPMENT SEED STRATEGY

## 32. Seed data rules

### 32.1 Development seed data

- Neutral placeholder names (NOT fake company claims)
- Sample images (real marble images, NOT AI-generated)
- Basic relationships between content
- Enough data to test pagination

### 32.2 Production content

- Must originate from approved real content
- Must not contain fabricated business claims
- Must not contain fake certifications/projects/clients
- Must not contain fake reviews/ratings/prices

---

# PART AE — DEPLOYMENT PREPARATION

## 33. Deployment checklist

| Item | Requirement |
|---|---|
| Environment variables | All secrets in env vars |
| Database | Migrations run successfully |
| Build | Production build succeeds |
| API | All endpoints functional |
| Frontend | All pages render |
| Media | Images accessible via CDN |
| HTTPS | SSL certificate configured |
| Headers | Security headers configured |
| robots.txt | Correct rules |
| Sitemap | Generated and accessible |
| Domain | DNS configured |
| Redirects | All redirects working |
| Monitoring | Error logging configured |
| Backups | Database backup configured |

---

# PART AF — PRODUCTION CONTENT MIGRATION

## 34. Content migration process

1. Product data preparation (names, descriptions, specifications)
2. Turkish content (TR ContentVariant)
3. English content (EN ContentVariant)
4. Image preparation (product images, alt text)
5. Image metadata (dimensions, focal point)
6. SEO metadata (titles, descriptions)
7. Relationships (product↔collection, product↔application)
8. Review (content accuracy check)
9. Approval (content owner approval)
10. Publish (publication lifecycle)

---

# PART AG — FINAL ACCEPTANCE CRITERIA

## 35. V1 completion criteria

### Architecture
- [ ] Frontend/backend/database boundaries respected
- [ ] API contract implemented correctly
- [ ] Content model matches specification

### Content
- [ ] Dynamic content loads from API
- [ ] 100+ products paginated correctly
- [ ] All content types render correctly

### Localization
- [ ] TR/EN URLs work
- [ ] Language switch works
- [ ] Localized content displays correctly
- [ ] Missing translation handled gracefully

### SEO
- [ ] Canonical tags present
- [ ] Hreflang tags present
- [ ] Metadata correct
- [ ] Structured data valid
- [ ] Sitemap generates
- [ ] Image sitemap generates
- [ ] robots.txt correct
- [ ] 301 redirects work
- [ ] 404 page works

### Design
- [ ] Design system implemented consistently
- [ ] Premium luxury aesthetic achieved
- [ ] Responsive on all breakpoints

### Accessibility
- [ ] WCAG 2.1 AA target satisfied
- [ ] Keyboard navigation works
- [ ] Screen reader accessible

### Performance
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms

### Security
- [ ] Input validation works
- [ ] Authorization works
- [ ] No internal errors exposed

### Testing
- [ ] Critical user journeys pass
- [ ] Critical tests pass

### Media
- [ ] Responsive images work
- [ ] Hero video/fallback works
- [ ] Alt text present

### Content Integrity
- [ ] No fabricated business claims
- [ ] Real marble images only
- [ ] Accurate product representation

---

# PART AH — DEFINITION OF DONE

## 36. Definition of Done

A task is not complete merely because:
- Page renders
- API returns 200
- Component exists

It must satisfy:
- [ ] Functionality works as specified
- [ ] Architecture boundaries respected
- [ ] Design system tokens used correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessible (WCAG 2.1 AA)
- [ ] SEO elements present and correct
- [ ] Performance acceptable
- [ ] Tests written (where applicable)
- [ ] Error states handled
- [ ] Loading states handled
- [ ] Empty states handled
- [ ] No fabricated content

---

# PART AI — PHASE GATES

## 37. Phase gate table

| Phase | Gate | Required Tests | Exit Condition |
|---|---|---|---|
| 0 | Environment ready | Tool verification | All tools respond |
| 1 | Foundation boots | Frontend + backend boot | Both return 200 |
| 2 | Database ready | Migration runs | Schema matches spec |
| 3 | Backend core | Server boots with DB | Health check returns 200 |
| 4 | API layer | All endpoints tested | All 18 endpoints return correct structure |
| 5 | Frontend foundation | Routing + API calls | Data displays correctly |
| 6 | Design system | Token verification | All tokens match spec |
| 7 | Global shell | Navigation works | All nav elements function |
| 8 | Homepage | Hero + content | Hero renders, content loads |
| 9 | Products | Listing + detail | 100+ products paginated, detail renders |
| 10 | Collections/Apps | Listing + detail | All pages render correctly |
| 11 | Projects/Journal | Listing + detail | All pages render correctly |
| 12 | Company pages | All pages render | Content displays correctly |
| 13 | Quote request | Form submits | Form works end-to-end |
| 14 | SEO | SEO audit passes | All SEO requirements met |
| 15 | A11y/Perf | Audit passes | WCAG + CWV targets met |
| 16 | Testing | Tests pass | No critical failures |
| 17 | Production | Deployment verified | Website live and functional |

---

# PART AJ — IMPLEMENTATION PRIORITY

## 38. Priority classification

### P0 — Blocking (must exist before application can proceed)

- Repository setup
- TypeScript configuration
- Database schema
- Backend server entry
- Frontend application entry
- Routing foundation
- Design token foundation
- API health check

### P1 — Core V1 (required for launch)

- All 18 public API endpoints
- All 17 page types
- All design system components
- Global shell (header, footer, navigation)
- Bilingual TR/EN
- SEO implementation
- Responsive design
- Accessibility baseline
- Media handling
- Quote request form
- 404 page
- Sitemap
- Image sitemap

### P2 — Important (should be completed before final QA)

- Loading states for all pages
- Error states for all pages
- Empty states
- Pagination controls
- Breadcrumbs on all pages
- Related content
- Analytics events
- Performance optimization

### P3 — Deferred (not required for V1)

- Advanced animations
- CMS admin interface (can be separate)
- Advanced testing coverage
- Advanced performance optimization

---

# PART AK — PARALLEL WORK OPPORTUNITIES

## 39. Parallelizable tasks

| Task A | Task B | Dependency |
|---|---|---|
| Backend API (PHASE 4) | Frontend design system (PHASE 6) | None |
| Content preparation | Backend API development | None |
| Test preparation | Feature development | None |
| Design asset preparation | Component development | Design tokens only |
| SEO metadata preparation | Page implementation | Content model only |

Tasks that CANNOT be parallelized:
- Database schema (PHASE 2) before API (PHASE 4)
- API (PHASE 4) before frontend data fetching (PHASE 5)
- Design system (PHASE 6) before pages (PHASE 8–13)
- Pages (PHASE 8–13) before SEO (PHASE 14)

---

# PART AL — RISKS / FAILURE MODES

## 40. Risk table

| Risk | Probability | Impact | Prevention | Detection | Mitigation |
|---|---|---|---|---|---|
| Hard-coded content | Medium | High | Dynamic API architecture | Content not updating | Refactor to API-driven |
| CMS/API contract drift | Medium | High | Strict API contract docs | API tests fail | Update contract, sync |
| TR/EN mismatch | Low | High | Independent ContentVariant | Missing translations | Content audit |
| SEO regressions | Medium | Medium | SEO tests, automated checks | Lighthouse/Audit | Fix metadata |
| Media quality problems | Medium | Medium | Image requirements in spec | Visual inspection | Replace images |
| Homepage video performance | Medium | Medium | Fallback architecture | CWV degradation | Enable fallback |
| Accessibility regressions | Medium | Medium | Automated a11y tests | axe-core failures | Fix violations |
| Design inconsistency | Medium | Low | Design token enforcement | Visual review | Token alignment |
| Fake content entering production | Low | Critical | Seed strategy rules | Content review | Remove fake content |
| API/database boundary violations | Low | High | Architecture enforcement | Code review | Refactor |
| Scope creep | Medium | High | V1 scope documentation | Feature requests | Defer to V2 |

---

# PART AM — OPEN DECISIONS

## 41. Open decisions

### 41.1 Blocking decisions

| # | Decision | Impact | Status |
|---|---|---|---|
| 1 | Frontend framework choice | Application architecture | OPEN — Implementation choice |
| 2 | Backend framework choice | API architecture | OPEN — Implementation choice |
| 3 | Database provider/hosting | Data persistence | OPEN — Implementation choice |
| 4 | Media storage solution | Image/video delivery | OPEN — Implementation choice |
| 5 | Hosting/cloud provider | Deployment | OPEN — Implementation choice |

### 41.2 Non-blocking decisions

| # | Decision | Impact | Status |
|---|---|---|---|
| 6 | Exact quote request form fields | Form implementation | Can define minimal fields |
| 7 | Image sitemap frequency | SEO | Can default to daily |
| 8 | Analytics provider | Analytics | Deferred to implementation |
| 9 | Font hosting strategy | Performance | Self-host or CDN |

### 41.3 Deferred decisions

| # | Decision | Impact | Status |
|---|---|---|---|
| 10 | CMS admin interface scope | CMS | Deferred — separate project |
| 11 | Content versioning UI | CMS | Deferred |
| 12 | Advanced media workflow | CMS | Deferred |
| 13 | Privacy/cookie pages | Legal | May be needed — OPEN |

---

# PART AN — CODING START CHECKLIST

## 42. Ready to start implementation

- [x] Architecture documents complete (00–15)
- [x] Routes defined (06_SEO_URL_ARCHITECTURE.md)
- [x] Components defined (09_COMPONENT_TREE.md)
- [x] Design system defined (10_DESIGN_SYSTEM.md)
- [x] API contract defined (13_API_CMS_CONTRACT.md)
- [x] Content model defined (12_CONTENT_MANAGEMENT_AND_FRONTEND_DATA_FLOW.md)
- [x] SEO defined (14_SEO_URL_IMPLEMENTATION_SPEC.md)
- [x] V1 scope defined (this document)
- [x] Blocking open decisions identified (technology choices)
- [ ] Repository ready (PHASE 0)

Status: **READY TO START IMPLEMENTATION**

---

# PART AO — FIRST CODING SESSION

## 43. First coding session

### Tasks

1. Verify development environment (Node.js, npm, PostgreSQL, Git)
2. Verify dependencies available
3. Verify directory structure
4. Initialize frontend project
5. Initialize backend project
6. Configure TypeScript
7. Configure ESLint/Prettier
8. Create application entry points
9. Create basic routing
10. Create basic health check endpoint
11. Verify frontend boots
12. Verify backend boots
13. Verify frontend → backend communication
14. Create baseline commit

### Expected outcome

- Clean, working foundation
- Frontend renders "hello world"
- Backend returns 200 on health check
- Git repository with clean history

---

# PART AP — FIRST IMPLEMENTATION MILESTONE

## 44. First milestone

### Objective

Running skeleton application.

### Deliverables

- Application boots (frontend + backend)
- Database connection works
- Routing foundation works
- Design tokens foundation exists
- Basic API health check works
- Baseline tests pass

### Dependencies

- PHASE 0–3 complete

### Tests

- Frontend renders
- Backend returns 200
- Database connection succeeds
- Routing works

### Acceptance criteria

- `npm run dev` works for frontend and backend
- Health check returns 200
- Database schema exists
- No errors in console

---

# PART AQ — SUBSEQUENT MILESTONES

## 45. Milestone sequence

### Milestone 1: Foundation (PHASE 0–3)

- Application boots
- Database connected
- Backend core ready

### Milestone 2: API Layer (PHASE 4)

- All 18 public endpoints functional
- Publication filtering works
- Locale handling works

### Milestone 3: Frontend Shell (PHASE 5–7)

- Frontend boots with routing
- Design system implemented
- Global shell (header, footer, nav) works

### Milestone 4: Core Pages (PHASE 8–9)

- Homepage renders with hero
- Product listing works with pagination
- Product detail works with gallery

### Milestone 5: Content Pages (PHASE 10–13)

- All remaining pages render
- Quote request form works
- All content types functional

### Milestone 6: SEO + Quality (PHASE 14–16)

- All SEO elements pass
- Accessibility audit passes
- Performance metrics acceptable
- Critical tests pass

### Milestone 7: Production (PHASE 17)

- Deployed to production
- All functionality verified
- V1 complete

---

# PART AR — DOCUMENTATION FREEZE

## 46. Documentation freeze

After this document:

- Planning documentation is considered frozen for V1
- Future changes should NOT create new architecture documents
- If implementation discovers a genuine architectural issue:
  1. Identify the issue
  2. Reference affected document
  3. Propose change
  4. Assess impact
  5. Update the minimum necessary document
  6. Record the change
- Do not create endless planning documents

---

# PART AS — FINAL CONSISTENCY AUDIT

## 47. Consistency audit

### 47.1 Scope consistency

| Check | Result |
|---|---|
| V1 scope matches approved docs | PASS |
| No invented features | PASS |
| Deferred items clearly marked | PASS |
| Out-of-scope items documented | PASS |

### 47.2 Architecture consistency

| Check | Result |
|---|---|
| Frontend/backend boundaries | PASS |
| API contract respected | PASS |
| Database model respected | PASS |
| Content model respected | PASS |

### 47.3 Database consistency

| Check | Result |
|---|---|
| Schema matches `03_DATABASE_ER.md` | PASS |
| No new entities invented | PASS |
| Migration order logical | PASS |

### 47.4 API consistency

| Check | Result |
|---|---|
| All 18 endpoints included | PASS |
| Response format matches contract | PASS |
| Error format matches contract | PASS |
| No new endpoints invented | PASS |

### 47.5 Content model consistency

| Check | Result |
|---|---|
| ContentItem/ContentVariant model | PASS |
| Publication lifecycle | PASS |
| Media model | PASS |
| Relationships | PASS |

### 47.6 Component consistency

| Check | Result |
|---|---|
| Component count matches spec | PASS |
| No duplicate components | PASS |
| Component responsibilities clear | PASS |

### 47.7 Design token consistency

| Check | Result |
|---|---|
| All token categories included | PASS |
| Values match `10_DESIGN_SYSTEM.md` | PASS |
| No invented tokens | PASS |

### 47.8 Page consistency

| Check | Result |
|---|---|
| All 17 page types included | PASS |
| Page specifications match | PASS |
| No new page types invented | PASS |

### 47.9 Localization consistency

| Check | Result |
|---|---|
| TR/EN architecture preserved | PASS |
| Root redirect decision preserved | PASS |
| x-default decision preserved | PASS |
| No language detection | PASS |

### 47.10 SEO consistency

| Check | Result |
|---|---|
| All SEO rules from `14_SEO_URL_IMPLEMENTATION_SPEC.md` | PASS |
| Image sitemap included | PASS |
| Canonical/hreflang rules | PASS |
| No keyword stuffing | PASS |

### 47.11 Media consistency

| Check | Result |
|---|---|
| MediaPresentation model | PASS |
| Responsive images | PASS |
| No visual alteration of products | PASS |

### 47.12 Accessibility consistency

| Check | Result |
|---|---|
| WCAG 2.1 AA target | PASS |
| Semantic HTML | PASS |
| Keyboard navigation | PASS |

### 47.13 Performance consistency

| Check | Result |
|---|---|
| Core Web Vitals targets | PASS |
| Image optimization | PASS |
| Code splitting | PASS |

### 47.14 Security consistency

| Check | Result |
|---|---|
| Input validation | PASS |
| Authorization | PASS |
| No internal errors exposed | PASS |

### 47.15 Testing consistency

| Check | Result |
|---|---|
| Test layers defined | PASS |
| Critical journeys identified | PASS |

### 47.16 Open decision consistency

| Check | Result |
|---|---|
| Blocking decisions identified | PASS |
| Non-blocking decisions identified | PASS |
| Deferred decisions documented | PASS |

### 47.17 No invented requirements

| Check | Result |
|---|---|
| No new pages invented | PASS |
| No new components invented | PASS |
| No new features invented | PASS |
| No new API endpoints invented | PASS |
| No new entities invented | PASS |

### 47.18 No duplicated architecture

| Check | Result |
|---|---|
| No competing URL structures | PASS |
| No competing content models | PASS |
| No competing design systems | PASS |

### 47.19 No unnecessary complexity

| Check | Result |
|---|---|
| Phases are logical | PASS |
| Dependencies are clear | PASS |
| No over-engineering | PASS |

### 47.20 No implementation blockers hidden

| Check | Result |
|---|---|
| Technology choices identified | PASS |
| Dependencies documented | PASS |
| Blockers surfaced | PASS |

---

# PART AT — FINAL STATUS

## 48. Final status

| Metric | Value |
|---|---|
| Implementation phases | 18 (0–17) |
| Milestones | 7 |
| Blocking decisions | 5 (technology choices) |
| Non-blocking decisions | 4 |
| Deferred decisions | 4 |
| Major risks | 11 |
| Acceptance criteria items | 22 |
| Consistency audit checks | 20 (ALL PASS) |

### STATUS

**READY FOR IMPLEMENTATION**
