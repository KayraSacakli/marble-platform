# SESSION HANDOFF — marble-platform

Generated: 2026-10-01. Source of truth: repository + live git/server state at generation time.

---

## 1. PROJECT STATE

- **Purpose**: Marble/stone manufacturer showcase site with a full CMS administration layer. Public marketing pages (products, collections, applications, projects, journal, company pages) backed by a public JSON API (`/api/v1/public/{locale}/...`), plus authenticated admin CRUD (`/admin`, `/api/v1/admin/...`).
- **Stack**: Next.js 16.3.5 (App Router, Turbopack), React 19.2.8, TypeScript ~5, Prisma 6.19.3 + PostgreSQL (`localhost:5432/marble_platform_dev`), Vitest 5.0.1, ESLint. Note: this Next.js version has breaking changes vs training data — read `node_modules/next/dist/docs/` before writing Next-specific code (see `AGENTS.md`).
- **Branch**: `master` (only branch worked on).
- **HEAD**: `f3831084245293b59bc83a83ed64712a08b87321` — `feat(admin): complete CMS administration and publishing workflow`.
- **Phase status**: Phase 17 CLOSED (`f383108`). **Phases 18A, 18B, 18C, 18D-1, 18D-2, 18D-3, 18D-4: all CLOSED (PASS)**. **Phase 18D-5: code complete, verification partial — CHECKPOINT taken (see §13)**. All 18A–18D-5 changes **committed as one checkpoint commit and pushed to `origin/master`**. Next: **finish 18D-5 verification → 18D-6 final sweep**.

---

## 2. PHASE 17 — CLOSED

- Commit: `f3831084245293b59bc83a83ed64712a08b87321` (99 files, +10,106/−22).
- 666/666 tests PASS at that commit (now 667 with the 18A regression test).
- typecheck / lint / build / prisma validate all PASS.
- `master` == `origin/master` (verified: `git rev-parse HEAD` == `git rev-parse origin/master`, push `ed5777c..f383108` already done).
- Preceding commits: `ed5777c` (17A auth foundation), `d36be8b` (16 demo content).

---

## 3. PHASE 18 RECONNAISSANCE (read-only, completed)

Ranked findings from production inspection:

- **BLOCKER**: Journal list API 500 — invalid multi-field Prisma `orderBy` object form in `src/repositories/content.ts` (`{ name: 'asc', createdAt: 'desc' }`; Prisma 6 requires `[{ name: 'asc' }, { createdAt: 'desc' }]`). → **Being fixed in 18A.**
- **HIGH**: soft-404 — missing product/journal slugs return HTTP 200 instead of 404 on the production build.
- **HIGH**: unsupported locales advertised in sitemap/hreflang (7 locales, `SUPPORTED_LOCALES = ['tr','en','es','fr','de','it','ar']`, `DEFAULT_LOCALE = 'tr'`, but no content for es/fr/de/it/ar — `/es/products` renders 0 cards).
- **HIGH**: missing rate limiting (public write endpoints e.g. quote-requests, media upload).
- **HIGH**: no production admin provisioning (seed couples admin account with demo content; `SEED_ADMIN_PASSWORD` dev default handled in `src/lib/auth/seed-password.ts` from 17H).
- **MEDIUM**: JSON-LD `<`/`</script>` escaping in `src/components/seo/JsonLd.tsx` (raw `JSON.stringify`).
- **MEDIUM**: SITE_URL validation — `NEXT_PUBLIC_SITE_URL` is NOT set in `.env` (only in `.env.example` as `https://example.com`); server-side `apiClient` then falls back to `http://localhost:${PORT ?? 3000}` (`src/lib/api/client.ts` `resolveDefaultBaseUrl`), metadata falls back to `https://example.com`.
- **MEDIUM**: no backup/recovery, no caching strategy (`revalidate` option in `src/lib/api/client.ts` never forwarded to `fetch`), no startup env validation.
- **SHOULD**: success-path `x-request-id` header, CSP `'unsafe-eval'` tightening in prod (`src/lib/security/headers.ts`), dynamic sitemap detail URLs, request-id already exists only on error paths (`src/lib/api/request-id.ts`).
- **DEFER/V2**: media rightsState linkage, HTML sanitizer (trusted-editor model), middleware→proxy rename (Next 16.3.5 deprecation), distributed rate-limit, next/image/CDN/ISR, structured logging.

---

## 4. PHASE 18A — CLOSED (details below are historical)

### Required change (APPLIED, uncommitted)

`src/repositories/content.ts`:
- Line 80: `orderBy?: Record<string, string>;` → `orderBy?: Record<string, string> | Array<Record<string, string>>;`
- Line ~139-145 `listJournalArticles`: `orderBy: { name: 'asc', createdAt: 'desc' }` → `orderBy: [{ name: 'asc' }, { createdAt: 'desc' }]` (multi-key object → array of single-key objects; Prisma 6 rejects the object form with `PrismaClientValidationError ... Expected ContentVariantOrderByWithRelationInput[], provided Object`).

`src/__tests__/repositories/content-public-gates.test.ts` (+24 lines):
- New `describe('journal list orderBy shape')` asserting `findMany` receives `orderBy` as an **array** equal to `[{ name: 'asc' }, { createdAt: 'desc' }]`. Fails on old object form, passes now. Reuses the file's existing `vi.mock('@/lib/prisma')` `findMany`/`count` mocks (note: `listPublished` runs `Promise.all([findMany, count])`, so `count` is stubbed to resolve).

Root cause context: bug present since initial commit `76ded27`; missed because tests mock the service/repository Prisma layer.

### Validation completed (all PASS)

| Check | Result |
|---|---|
| Focused `npx vitest run src/__tests__/repositories/content-public-gates.test.ts` | 9/9 PASS |
| Full `npm test` | 667/667 (50 files) PASS |
| `npm run typecheck` | 0 errors |
| `npm run lint` | 0 errors, 2 pre-existing warnings (`_locale` unused, `src/repositories/content.ts:250,463`) |
| `npm run build` | PASS |

### Production smoke (port 3100, `NEXT_PUBLIC_SITE_URL=http://localhost:3100`)

- `GET /api/v1/public/en/journal` → **200, 3 articles** (`from-quarry-block-to-finished-surface`, `stone-in-contemporary-architecture`, `understanding-natural-stone-selection`).
- `GET /api/v1/public/tr/journal` → **200, 3 articles** (`cagdas-mimarlikta-tas-kullanimi`, `dogal-tas-secimi-hakkinda`, `ocaktan-bitis-yuzeyine`).
- `GET /en/journal/from-quarry-block-to-finished-surface` (detail) → **200 with content**.
- **OPEN ISSUE — journal LIST pages**: `GET /en/journal` and `GET /tr/journal` return HTTP 200 but the body is **stale build-time prerendered HTML** containing `NEXT_HTTP_ERROR_FALLBACK;404` + a Loading spinner (no `journal-page__header`, no cards). Verified via headers (`x-nextjs-prerender: 1`, `x-nextjs-cache: HIT`, `s-maxage=31536000`) and on-disk `.next/server/app/{en,tr}/journal.html`. Root cause: `/{locale}/journal` is **statically prerendered at build**; during `npm run build` the page's server-side `apiClient` fetch (no `NEXT_PUBLIC_SITE_URL` during build → base `http://localhost:3000`) hit the **broken dev server** → `getJournal` threw → `catch { notFound() }` baked 404 into the static HTML. Homepage `/en` prerendered WITH data; product/company pages prerender fine (single-key orderBy works); only journal list pages are affected.

### Remaining steps to finish 18A

1. Fix/restart the dev server on :3000 (see §7 — it currently 500s on every route with a Turbopack `next/font/google` module error), OR otherwise ensure a healthy data source is reachable at `http://localhost:3000` during prerender.
2. `npm run build` again (default base URL already targets localhost:3000), restart the :3100 `next start` server.
3. Re-verify `/en/journal` and `/tr/journal` HTML contain the seeded articles (and 200 status), plus API endpoints again.
4. Stop test servers (see §7 for PIDs), then emit the **18A FINAL REPORT only**: RESULT / ROOT CAUSE / CHANGE / TESTS / PRODUCTION SMOKE / REGRESSION / GIT (confirm no commit, no push).

---

## 5. STRICT SCOPE — Phase 18A ONLY

Do **NOT** implement in this task: soft-404, locale SEO/sitemap, rate limiting, JSON-LD escaping, env validation, admin provisioning, caching/revalidate, backup/runbook, CSP changes, request-id on success paths. Those are later Phase 18 steps. Also do not touch: `.next/`, untracked dev logs, `.agents/ .claude/ .cursor/ .devin/`.

---

## 6. WORKFLOW RULES

- Inspect before modifying; smallest possible change; no unnecessary refactors; no new dependencies.
- Test after change: focused → full suite → typecheck → lint → build → production smoke.
- **No commit / no push unless explicitly requested.**
- Final structured report when done.
- Windows PowerShell 5.1 quirks: no `head`/`grep`/`sed` (use `Select-String`); `>` re-encodes to UTF-16 (use `curl.exe -o` for HTML); bracket paths (`[id]`, `[locale]`) need `-LiteralPath`; `src\**\*.ts` globs unreliable (use `Get-ChildItem -Recurse -File -Include`); `$HOME` is read-only (do not assign).
- Read `node_modules/next/dist/docs/` before Next.js-specific code (Next 16 breaking changes; proxy/middleware deprecation).
- Commit hygiene: never `git add .`; exclude `.agents/ .claude/ .cursor/ .devin/ dev-check*.log dev-server*.log`.

---

## 7. CURRENT TERMINAL / SERVER STATE

Updated at the 18D-5 checkpoint (2026-10-06):

| Server | Command | Port | PID(s) | Status |
|---|---|---|---|---|
| Temp API data source | `next dev --port 3000` (`%TEMP%\opencode\marble-api-copy`) | 3000 | tree killed (listener 40672; earlier refs 60072 gone) | **CLOSED at checkpoint** |
| 18D-4/18D-5 smoke | `next start --port 3100` | 3100 | tree killed (listener 55548; wrappers 47496 gone) | **CLOSED at checkpoint** |

- Ports 3000/3100 verified FREE. Temp `dev-*.log` files deleted.
- Remaining node processes belong to an unrelated project (`D:\20tl-akimi`, expo) — untouched.
- Restart the temp API copy from `%TEMP%\opencode\marble-api-copy` if 18D-6 needs a build-time data source.

---

## 8. GIT STATE

Superseded at the 18D-5 checkpoint — current state lives in §13. Historical (18A era, HEAD `f383108`): 2 modified files, everything uncommitted.

At the checkpoint: **all 18A–18D-5 changes committed as ONE checkpoint commit and pushed to `origin/master`** (verify with `git log -1` / `git status`). Only untracked leftovers are the excluded tool dirs `.agents/ .claude/ .cursor/ .devin/` (§6 commit hygiene).

---

## 9. PHASE 18D — PRODUCTION HARDENING AUDIT (read-only, completed)

Audit scope: rate limiting, env validation, request tracing, caching, CSP, backup/restore, deployment readiness, performance, security. No code changes, no commits. Working tree (18A/18B/18C) untouched.

### # MUST FIX BEFORE PRODUCTION

1. **No rate limiting anywhere.**
   - Issue: zero throttling implementation. `RateLimitError` (`src/lib/api/errors.ts:97`) exists but is never thrown; no in-memory/redis limiter; `src/middleware.ts` only does locale redirect + admin cookie presence check (and skips `/api/*` entirely via matcher). Unlimited credential attempts on `src/app/api/v1/admin/auth/login/route.ts` and unlimited public writes on `src/app/api/v1/public/[locale]/quote-requests/route.ts`.
   - Impact: admin login is brute-forceable; quote-requests and login are spam/DoS vectors; no `Retry-After`/`X-RateLimit-*` responses.
   - Effort: M (in-memory sliding-window in `createApiHandler` + dedicated login bucket; single-instance is enough for launch).
   - Exact files: `src/middleware.ts`, `src/lib/api/handler.ts`, `src/lib/api/errors.ts:97`, `src/app/api/v1/admin/auth/login/route.ts`, `src/app/api/v1/public/[locale]/quote-requests/route.ts`.

2. **No startup environment validation; `NEXT_PUBLIC_SITE_URL` is unset in `.env`.**
   - Issue: no `env.ts`/zod bootstrap; `.env` keys are only `DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, CMS_API_URL, CMS_API_KEY, SEED_ADMIN_PASSWORD` — no `NEXT_PUBLIC_SITE_URL`. Fallbacks: `src/lib/api/client.ts:19-27` → `http://localhost:${PORT ?? 3000}`, `src/lib/api/seo.ts:4` + `src/lib/seo/constants.ts:4` → `https://example.com`.
   - Impact: production canonical URLs/sitemap/`metadataBase` render as `example.com`; worse, `next build` prerenders public pages by fetching the absolute base URL — wrong/missing SITE_URL bakes stale or 404 HTML into the build (root cause of the 18A journal-list incident). No fail-fast on missing `DATABASE_URL` in the app (seed aborts at `prisma/seed.ts:619`, the app does not).
   - Effort: S–M (zod-parsed `src/lib/env.ts` imported by `next.config.ts` or `instrumentation.ts`, throw on unset/invalid in production).
   - Exact files: new `src/lib/env.ts`; readers: `src/lib/api/client.ts:19`, `src/lib/api/seo.ts:4`, `src/lib/seo/constants.ts:4`, `src/app/robots.ts:4`, `src/app/[locale]/{products,collections,applications,projects,journal}/page.tsx` (~line 30 each), `.env` / `.env.example`.

3. **No backup/restore capability or deploy runbook.**
   - Issue: no backup script, no `prisma migrate deploy` npm script, no `Dockerfile`/CI/`.github`, no restore procedure. Migrations exist (`prisma/migrations/` × 3) but deployment relies on undocumented manual steps; `package.json` has no `deploy`/`migrate:deploy`/`backup` scripts.
   - Impact: data loss with no tested recovery path; unrepeatable production deploys; schema drift between environments.
   - Effort: M (pg_dump/restore script + `prisma migrate deploy` script + a one-page runbook: build → migrate → start → health check → rollback).
   - Exact files: `package.json` (scripts), new `scripts/backup.ps1` + `scripts/restore.ps1` (or `.sh`), new `docs/DEPLOY_RUNBOOK.md`.

4. **Build-time dependency on a live server for public page prerender, guarded by nothing.**
   - Issue: all public `[locale]` pages are statically prerendered with no `dynamic`/`revalidate` exports (only admin pages set `force-dynamic`) and the apiClient has no build-safe fallback; a dead/wrong base URL during `next build` silently bakes `notFound()` results into HTML.
   - Impact: production ships pages serving stale/404 prerendered HTML that looks "healthy" (200 + cache headers) — exactly what happened with `/en|/tr/journal` in 18A.
   - Effort: M (either make content pages `revalidate`-based/ISR, or fail the build when prerender fetch fails instead of swallowing it via `catch { notFound() }`).
   - Exact files: `src/app/[locale]/**/page.tsx` (16 pages), `src/lib/api/client.ts`, `src/lib/seo/constants.ts`.

### # SHOULD FIX

1. **Success-path request tracing incomplete** — `createApiHandler` generates `requestId` but only sets `x-request-id` when the handler returns a `Response` instance; the common `NextResponse.json({ data: result })` success path (`src/lib/api/handler.ts:55`) omits it. Middleware sets no request id; no structured logger (console only). Effort: S. Files: `src/lib/api/handler.ts:49-55`, `src/middleware.ts`.
2. **CSP `script-src` allows `'unsafe-inline' 'unsafe-eval'`** (`src/lib/security/headers.ts:21`, applied via `next.config.ts:14-21`). Tighten: drop `unsafe-eval` in production, add nonces for Next inline scripts; also consider `connect-src`/`form-src` explicitness. Effort: M. Files: `src/lib/security/headers.ts`, `next.config.ts`, `src/lib/security/headers.test` (if present).
3. **`revalidate` never forwarded to `fetch`** — `RequestOptions.revalidate` declared (`src/lib/api/client.ts:40`) but `fetchInit` only forwards `cache` (`:98`); no caller can opt into ISR, so every dynamic render refetches. Effort: S. File: `src/lib/api/client.ts:90-105`.
4. **22 raw `<img>` tags in 20 files while `src/components/media/Media.tsx` (next/image wrapper) has zero production usages; no `images.remotePatterns` in `next.config.ts`.** Impact: no optimization, CLS risk from inline `width:100%;height:100%` styles, extra bytes. Key files: `src/components/product/ProductCard.tsx:24`, `ProductGallery.tsx:43,64`, `src/app/[locale]/home/*.tsx`, `src/app/[locale]/{quarry,about,factory}/page.tsx:94`, `src/app/[locale]/{projects,journal,applications,collections}/[slug]/page.tsx:86-117`. Effort: M.
5. **ProductGallery loads all images at once** — no lazy loading/IntersectionObserver/virtualization. Effort: S. File: `src/components/product/ProductGallery.tsx`.
6. **JSON-LD not escaped** — `JSON.stringify` injected raw via `dangerouslySetInnerHTML` (`src/components/seo/JsonLd.tsx:9`); a `</script>` in CMS content breaks out of the script tag. Escape `<` as `<`. Effort: S. File: `src/components/seo/JsonLd.tsx`.
7. **No production admin provisioning path documented** — seed skips admin creation in production when `SEED_ADMIN_PASSWORD` unset (`prisma/seed.ts:666`), which is safe but means a fresh production DB has **no admin account** and no documented way to create one. Effort: S. Files: `prisma/seed.ts:656-680`, docs runbook (item 3 above).
8. **Login rate-limit adjacent hardening** — confirm session token entropy/rotation on login and add login attempt logging (currently only uniform `UnauthorizedError`, `src/services/adminAuth.ts:55,60`, no audit trail). Effort: S. Files: `src/services/adminAuth.ts`, `src/lib/auth/session.ts`.

### # DEFER

1. **Distributed (Redis/Upstash) rate limiting** — single-instance in-memory limiter is sufficient until horizontal scaling is planned; reason: no Redis dependency in stack yet.
2. **Structured logging (pino/winston) + log aggregation** — console output with `[requestId]` prefixes is adequate for single-instance launch; reason: adds dependency + ops surface with no consumer yet.
3. **HTML sanitizer (DOMPurify-style)** — trusted-editor model (admin/EDITOR only, validated input via zod); reason: revisit if multi-tenant or public comments ever land.
4. **Full ISR/CDN caching strategy + `unstable_cache`** — depends on MUST #4 decision (static vs revalidate); reason: implement together rather than twice.
5. **`middleware` → `proxy` rename (Next 16 deprecation)** — cosmetic/compat; reason: works today, rename in a dedicated housekeeping pass with docs check (`node_modules/next/dist/docs/`).
6. **Unbounded junction `findMany`s in repositories** — filtered by FK to a single entity (bounded by real content volume, e.g. `src/repositories/content.ts:200,229,251`); reason: no pagination issue until content grows ~10×; list queries already paginate (`take/skip` at `:94-97`).
7. **CORS configuration** — none set, which is correct (same-origin only, cookies not readable cross-origin); reason: nothing to do until an external API consumer appears.

### # EXIT CRITERIA

- [ ] Rate limiting active on `POST /api/v1/admin/auth/login` and `POST /api/v1/public/{locale}/quote-requests` (429 + `Retry-After` after N attempts; verified by test).
- [ ] App fails fast at startup in production when required env (`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`) is missing/invalid; `NEXT_PUBLIC_SITE_URL` set correctly in prod env.
- [ ] Production canonical/sitemap/hreflang URLs use the real domain (spot-check `robots.ts`, `sitemap.xml`, one page's canonical + `metadataBase`).
- [ ] `npm run build` cannot bake a 404/stale page: prerender fetch failure fails the build (or pages moved to ISR with revalidate).
- [ ] Backup script produces a restorable dump; restore procedure rehearsed once; `prisma migrate deploy` in the deploy path; runbook committed.
- [ ] `x-request-id` present on success AND error API responses; every log line correlates.
- [ ] CSP without `unsafe-eval` in production; unit test updated.
- [ ] `/api/health` returns 200 only when DB reachable (already implemented, `src/app/api/health/route.ts`) and is used as the deploy health probe.
- [ ] No committed secrets: `.env` gitignored (`.env*` pattern confirmed) and `git ls-files` shows no `.env` file.
- [ ] Full `npm test` + `typecheck` + `lint` + `build` green after each remediation item; existing 18A/18B/18C behavior (404s, sitemap 22 URLs, TR/EN hreflang) unchanged.

---

## 10. PHASE 18D-2 — ENV VALIDATION + PRERENDER SAFETY (CLOSED — FINAL: PASS, uncommitted)

Scope lock: ONLY the two production blockers (env validation, prerender 404 safety). No CSP, JSON-LD, caching, admin provisioning, backup/deployment, media, SEO, locale, or rate-limit changes. No commits. All 18A/18B/18C/18D-1 changes preserved.

### Root cause (both blockers reproduced)

1. **No production env validation anywhere.** `.env` has no `NEXT_PUBLIC_SITE_URL`; `NEXTAUTH_SECRET="your-secret-here"` is a placeholder; code falls back to `https://example.com` (`src/lib/seo/constants.ts:4`, `src/lib/api/seo.ts:4`, `src/app/robots.ts:4`, 5 list pages) and `client.ts:19` falls back to `localhost`. No fail-fast existed for build or startup.
2. **Silently baked fake 404s.** All 14 public pages wrapped apiClient fetches in `catch { notFound(); }` → cold `npm run build` with API down (port 3000 free) exited **EXIT=0** while baking `.next/server/app/tr.html` = 10,786 B of `404: This page could not be found.` (real content = 53,370 B). Warm builds masked it via `.next/cache/fetch-cache` replay.

### Changes applied (uncommitted)

- **`src/lib/env.ts` (NEW)** — `collectProductionEnvIssues()` / `validateProductionEnv()` / `validateEnv()`; production requires: `DATABASE_URL` (postgres URL), `NEXT_PUBLIC_SITE_URL` (absolute http(s), non-placeholder host; localhost allowed), `NEXTAUTH_SECRET` (not placeholder, ≥16 chars). All issues reported in one aggregated error. **No-op in `next dev`** (NODE_ENV gate → dev workflow preserved).
- **`next.config.ts`** — `validateEnv()` call → fail-fast at `next build` AND `next start`.
- **`src/lib/api/page-errors.ts` (NEW)** — `notFoundOnlyWhenMissing(error): never`: real upstream 404 (`ApiClientError.isNotFound`) → `notFound()`; everything else **rethrown** (build fails loudly instead of baking a fake 404; runtime 500 instead of fake 404).
- **14 pages edited** (home + about/factory/quarry + applications/collections/journal/products/projects list & `[slug]`): `catch { notFound(); }` → `catch (error) { notFoundOnlyWhenMissing(error); }`. Verified: 28 occurrences, zero `catch → notFound()` on data fetches left. Untouched (by design): quote page (no fake 404 there), layout locale check, generateMetadata `return {}` catches, admin pages.

### Verification status

| Check | Result |
|---|---|
| New tests (`env.test.ts`, `page-errors.test.ts`, `fetch-failure-propagates.test.ts`) + existing `detail-slugs-404.test.ts` | **40/40 PASS** |
| `npm test` | **800/800 tests PASS (58 files) — PASS** |
| `npm run typecheck` | **PASS** |
| `npm run lint` | **PASS** (0 errors; only 2 pre-existing 18A warnings in `content.ts`) |
| Build A: `npm run build` without valid env | **PASS** — EXIT=1, fails in seconds: `Production environment validation failed: - NEXT_PUBLIC_SITE_URL is required… - NEXTAUTH_SECRET is a documented placeholder…` |
| Build B: cold `.next` + API down + valid env (sahte 404) | **PASS** — build **FAILS (EXIT=1)** with `Error [ApiClientError]: Network error` propagated from `page.tsx:49`; fake 404 no longer baked (was EXIT=0 before) |
| Build C: positive build (API up at :3000 + valid env) | **PASS** — clean `.next` (deleted first, no fetch-cache replay) + `NEXT_PUBLIC_SITE_URL=http://localhost:3000` + valid inline `NEXTAUTH_SECRET` (`.env` value is the `your-secret-here` placeholder) → `npm run build` **EXIT=0**, 94 static pages. Output check: `tr.html` 53,402 B / `en.html` 53,595 B with real content (`Demo Dark Stone`, nav); `tr/journal.html` 31,302 B / `en/journal.html` 31,387 B with `journal-page__header` + real articles; `NEXT_HTTP_ERROR_FALLBACK` absent everywhere (the `404: This page could not be found.` string only appears inside Next's flight payload `notFound` template, present on every healthy page) |
| Runtime verification (`next start` :3100, TR/EN 200, missing slug 404, startup fail-fast, dev no-op) | **PASS** — `/tr` `/en` `/tr|/en/journal` `/tr|/en/products` → **200**; real slugs (`/tr|/en/products/demo-dark-stone`, `/tr/journal/ocaktan-bitis-yuzeyine`, `/en/journal/from-quarry-block-to-finished-surface`) → **200**; missing slugs (`/en/products/does-not-exist-xyz-123`, `/tr/journal/olmayan-yazi-xyz-123`, `/tr/projects/does-not-exist-xyz-123`) → **404**; `next start` without prod env (:3199) → **EXIT=1 fail-fast** listing both issues (`NEXT_PUBLIC_SITE_URL missing` + `NEXTAUTH_SECRET placeholder`); `next dev` without prod env (:3201) → **Ready + `/tr` 200**, dev workflow intact |

### 18D-2 FINAL (2026-10-06) — PASS

- **Env validation: COMPLETE** — `src/lib/env.ts` + `next.config.ts` fail-fast at `next build` AND `next start`; no-op in `next dev`.
- **Prerender fake-404 blocker: COMPLETE** — `src/lib/api/page-errors.ts` `notFoundOnlyWhenMissing` wired into 14 public pages; upstream 404 → 404, any other error → loud build/runtime failure.
- **Build A PASS** (invalid env → EXIT=1), **Build B PASS** (API down → EXIT=1, no baked 404), **Build C PASS** (clean build, EXIT=0, real content in `/tr` + `/en` output, no static 404).
- **Runtime PASS** — TR/EN public pages 200, real product/journal slugs 200, missing slugs 404, env-less `next start` fail-fast, env-less `next dev` workflow unbroken.
- `npm test` **800/800 PASS** (58 files); `npm run typecheck` **PASS**; `npm run lint` **PASS** (0 errors, 2 pre-existing 18A warnings in `content.ts`).
- **Temp servers/processes cleaned**: :3100 (PID 34692), :3201 dev (PID 74172), :3199 (self-exited), :3000 temp API-copy (PID 70060, `%TEMP%\opencode\marble-api-copy`) — ports 3000/3100/3199/3201 all closed.
- **Git**: HEAD `f383108` == `origin/master`; **no commit, no push**; 18A–18D-2 changes all uncommitted in the working tree; stash empty.

### Git state

- **No commit, no push.** HEAD `f383108` == `origin/master` (unchanged since Phase 17).
- Working tree = 18A + 18B + 18C + 18D-1 + 18D-2 changes (all **preserved**, nothing reverted).
- 18D-2 new files: `src/lib/env.ts`, `src/lib/api/page-errors.ts`, 3 test files. Modified for 18D-2: `next.config.ts` + 14 `page.tsx` files.

---

## 11. PHASE 18D-3 — BACKUP/RESTORE + DEPLOY RUNBOOK (CLOSED — PASS, uncommitted)

Scope: §9 MUST #3 (+ SHOULD #7 admin provisioning docs, exit #5, exit #2 `.env.example` remainder). No other changes. No commits.

### Changes applied (uncommitted)

- **`scripts/backup.ps1` (NEW)** — `pg_dump -Fc` → timestamped `backups\marble-YYYYMMDD-HHmmss.dump`; resolves `pg_dump` from PATH or `C:\Program Files\PostgreSQL\*\bin`; reads `DATABASE_URL` from env or `.env`; strips Prisma-only `?schema=` query param (libpq rejects it: `invalid URI query parameter: "schema"`); fails loudly (non-zero) on any error/empty dump.
- **`scripts/restore.ps1` (NEW)** — `pg_restore --clean --if-exists --no-owner --no-privileges`; **`-Force` mandatory** (destructive-guard, verified: without `-Force` → exit 1); `-TargetDatabaseUrl` for restoring into a separate DB; same libpq URL fix + tool resolution.
- **`package.json`** — new scripts: `migrate:deploy` (`prisma migrate deploy`), `backup`, `restore` (PowerShell `-NoProfile -ExecutionPolicy Bypass`).
- **`docs/DEPLOY_RUNBOOK.md` (NEW)** — one page: required prod env (fail-fast table), deploy procedure (ci → migrate:deploy → build → start → `/api/health` gate), backup, restore, rollback (migrations forward-only → restore path), **production admin provisioning** (`SEED_ADMIN_PASSWORD` ≥12 chars + `npx prisma db seed`; seed URL guard aborts on `prod`/`production` substring; dev default never used in prod), post-deploy checklist.
- **`.gitignore`** — added `/backups/`.
- **`.env.example`** — `NEXT_PUBLIC_SITE_URL`: `https://example.com` (rejected as placeholder by 18D-2 validation) → `http://localhost:3000` + comment requiring the real public origin in production.

### Verification (all PASS, 2026-10-06)

| Check | Result |
|---|---|
| `npm run backup` | **PASS** — `backups\marble-20261006-152447.dump`, 90,760 bytes |
| `npm run migrate:deploy` | **PASS** — EXIT=0, "No pending migrations to apply" (3 migrations found) |
| Restore rehearsal (exit #5) | **PASS** — `createdb marble_platform_restore_test` → `npm run restore -- --File <dump> -Force -TargetDatabaseUrl <temp>` → `RESTORE_OK` → row counts **identical** source vs restored (`Product 8, JournalArticle 3, InternalUser 3, MediaAsset 16, QuoteRequest 1`) → `dropdb` EXIT=0 |
| Restore safety guard | **PASS** — no `-Force` → exit 1 "Restore is destructive…" |
| `npm test` | **800/800 PASS (58 files)** |
| `npm run typecheck` | **PASS** |
| `npm run lint` | **PASS** (0 errors, 2 pre-existing 18A warnings) |

### Git state

- **No commit, no push.** HEAD `f383108` == `origin/master`. Working tree = 18A–18D-3 changes, all uncommitted. New files: `scripts/backup.ps1`, `scripts/restore.ps1`, `docs/DEPLOY_RUNBOOK.md` (+ 18D-2 files). `backups/` gitignored.

---

## 12. PHASE 18D-4 — CSP / JSON-LD / REVALIDATE / SITEMAP DETAIL (CLOSED — PASS, uncommitted)

Scope: §9 SHOULD #2 + #3 + #6, §3 SHOULD "dynamic sitemap detail URLs", exit #7. No other changes. No commits.

### Changes applied (uncommitted)

- **`src/lib/security/headers.ts`** — CSP now built per call (`buildContentSecurityPolicy()`); production (`NODE_ENV=production`) `script-src 'self' 'unsafe-inline';` **without `'unsafe-eval'`**; non-production keeps `'unsafe-eval'` (HMR/tooling). `applySecurityHeaders`/`getSecurityHeaders` take optional config (signature backward compatible).
- **`src/components/seo/JsonLd.tsx`** — exported `escapeJsonLd()`: every `<` → `<` before injection (blocks `</script>` breakout from CMS content; `JSON.parse` round-trip unchanged). Covers Product/Article/Breadcrumb/Organization JSON-LD via the shared component.
- **`src/lib/api/client.ts`** — `RequestOptions.revalidate` now forwarded to Next's fetch extension `fetchInit.next = { revalidate }` (verified against `node_modules/next/types/global.d.ts` `RequestInit.next` + `patch-fetch.js` reading `init.next[field]`). Omitted when unset.
- **`src/app/sitemap.ts`** — now async: static 22 entries (unchanged) **+ detail URLs** for products/collections/applications/projects/journal × SEO locales, paginated with `pageSize=MAX_PAGE_SIZE (100)` via `@/lib/data/*`; journal `lastModified` = `publicationDate`; no catch → dead API fails the build loudly (18D-2 philosophy).
- Tests: `security-headers.test.ts` (+3 prod/dev CSP), `next-config-headers.test.ts` (+1 prod wiring via `vi.resetModules` + env stubs), **new** `jsonld-escape.test.tsx` (+3), `api-client.test.ts` (+3 revalidate), **new** `sitemap-details.test.ts` (+5 incl. pagination), `locale-seo.test.ts` (sync → `await sitemap()`; 22 static count guard kept green).

### Verification (all PASS, 2026-10-06)

| Check | Result |
|---|---|
| Focused vitest (7 files) | **PASS** (96 tests) |
| `npm test` | **815/815 PASS (60 files)** (+15 from 18D-4) |
| `npm run typecheck` / `npm run lint` | **PASS** / **PASS** (0 errors, 2 pre-existing warnings) |
| Clean `npm run build` (valid env + API copy :3000) | **EXIT=0**, `/sitemap.xml` static |
| Runtime `next start` :3100 — CSP | `Content-Security-Policy` served **without `'unsafe-eval'`** on `/tr` (exit #7 ✓) |
| Runtime sitemap.xml | **58 URLs = 22 static (unchanged) + 36 detail** (16 product = 8×2 locales, 6 journal = 3×2, + collections/applications/projects); TR+EN real slugs; **0 unsupported locales** |
| Page regression | `/tr` `/en` `/tr|/en/journal` `/tr|/en/products` + real product/journal slugs → **200**; missing slug → **404** |
| Built HTML | `tr.html` 53,402 B real content, `tr/journal.html` header present, no `NEXT_HTTP_ERROR_FALLBACK` |

### Git state

- **No commit, no push.** HEAD `f383108` == `origin/master`. Working tree = 18A–18D-4, all uncommitted.
- Temp API copy server kept running on :3000 (PID 60072, `%TEMP%\opencode\marble-api-copy`) for 18D-5/6 build verification — clean up at final sweep.

---

## 13. PHASE 18D-5 — next/image + LOGIN LOGGING (CHECKPOINT — CODE COMPLETE, VERIFICATION PARTIAL)

Scope: §9 SHOULD #4 (`<img>` → `next/image`), SHOULD #5 (ProductGallery lazy/thumbnail sizing), §3/§9 note (login attempt logging + session token entropy/rotation). Checkpoint requested by user (PC resource pressure); commit + push explicitly authorized for this checkpoint. 18A–18D-4 are CLOSED (PASS) — see §4, §10, §11, §12 (18B/18C/18D-1 changes are in the tree: soft-404 `page-errors.ts`, `SEO_LOCALES`, `rate-limit.ts`, success-path `x-request-id`).

### Changes applied (committed at checkpoint)

- **22 raw `<img>` → `<Media>` across 20 files**: cards (Product/Card, Collection, Application, Project, Journal), `HeroPoster` (`priority` — LCP), 5 home sections, 7 pages (about/factory/quarry/applications/collections/journal/projects `[slug]`), `ProductGallery`, admin `ProductMediaManager` (explicit 120×computed height — parent is a flex row). All `@next/next/no-img-element` disables removed.
- **`ProductGallery`**: primary `priority`; thumbs `sizes="4rem"` + `loading="lazy"` (SHOULD #5: no full-size downloads for 4rem thumbs).
- **`src/styles/components/product.css`**: `.product-hero__thumbnail` + `position: relative` (fill child needs positioned ancestor; all other wrappers verified relative — CSS or inline added by section sweep).
- **`next.config.ts` `images`**: `dangerouslyAllowSVG: true` + `contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"` (demo assets are **local SVGs** — optimizer rejects SVG without this) + `remotePatterns`: localhost/127.0.0.1 + `NEXT_PUBLIC_SITE_URL` origin (same-origin only).
- **Login attempt logging** (`src/app/api/v1/admin/auth/login/route.ts`): success `console.log`, failure `console.warn` — `[requestId] admin.login.success|failure email=… ip=… reason=<ErrorName>`; ip from `x-forwarded-for`/`x-real-ip`, email captured post-validation.
- **Session token entropy/rotation tests** (`session.test.ts`): `createAdminSession` → 64-hex (256-bit) token, unique per login (rotation), only sha256 hash persisted (raw token never reaches the DB row).
- **New tests**: login logging (`auth.test.ts`), gallery lazy/sizes (`Product.test.tsx`).
- **Test updates for next/image semantics**: optimized src asserted via `decodeURIComponent`; priority images carry NO `loading` attribute (Next omits it; non-priority keeps `loading="lazy"`) — Application/Collection/Product test files.

### Verification (as of checkpoint, 2026-10-06)

| Check | Result |
|---|---|
| `npm test` | **818/818 PASS (60 files)** (+3 from 18D-5) |
| `npm run typecheck` | PASS (0 errors) |
| `npm run lint` | PASS (0 errors, 2 pre-existing `_locale` warnings) |
| `npm run build` (valid env) | **EXIT=0** |
| Runtime :3100 smoke | health 200; `/tr` `/en` `/tr/about` `/tr/products` `/tr/products/demo-dark-stone` `/sitemap.xml` → **200**; SVG optimizer `/_next/image?url=%2Fdemo%2Fimages%2Fdemo-marble-charcoal.svg&w=640&q=75` → **200 image/svg+xml** (`dangerouslyAllowSVG` works); product HTML has **21 optimized `<img>`**; CSP **without `'unsafe-eval'`** (18D-4 regression ✓) |

### Remaining to finish 18D-5 (RESUME POINT)

1. Gallery-thumb runtime HTML check (`sizes="4rem"` + `loading="lazy"`): **no demo product currently has >1 ContentMedia row** — the unit test already asserts both attributes; optionally attach a 2nd media (admin or SQL) and re-check served HTML.
2. Hero `priority`/preload HTML check on `/tr` (earlier attempt aborted; PowerShell trap: `$HOME` is read-only — use another variable name).
3. → **Phase 18D-6**: final §9 MUST/SHOULD + exit-criteria sweep, restart temp API copy (`%TEMP%\opencode\marble-api-copy`) only if a build is needed, final `git status` report.

### Process state at checkpoint

- **All temp servers CLOSED** (ports 3000/3100 free; trees 40672/55548 killed; refs 60072/47496 gone); `dev-*.log` deleted. Other node processes = unrelated project (`D:\20tl-akimi`), untouched.

---

NEXT: Phase 18D-5 — resume at §13 verification step 1 (gallery thumb HTML), then Phase 18D-6 final sweep
