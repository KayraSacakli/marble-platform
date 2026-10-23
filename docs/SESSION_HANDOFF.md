# SESSION HANDOFF — marble-platform

Generated: 2026-10-01. Last updated: 2026-10-23 (Phase 21 close). Source of truth: repository + live git/server state at generation time.

---

## 1. PROJECT STATE

- **Purpose**: Marble/stone manufacturer showcase site with a full CMS administration layer. Public marketing pages (products, collections, applications, projects, journal, company pages) backed by a public JSON API (`/api/v1/public/{locale}/...`), plus authenticated admin CRUD (`/admin`, `/api/v1/admin/...`).
- **Stack**: Next.js 16.3.5 (App Router, Turbopack), React 19.2.8, TypeScript ~5, Prisma 6.19.3 + PostgreSQL (`localhost:5432/marble_platform_dev`), Vitest 5.0.1, ESLint. Note: this Next.js version has breaking changes vs training data — read `node_modules/next/dist/docs/` before writing Next-specific code (see `AGENTS.md`).
- **Branch**: `master` (only branch worked on).
- **HEAD**: `6f56a88` — `chore: remove accidentally committed format log` (pre-close state; the Phase 19A closing commit is `git log -1` after this docs update).
- **Phase status**: Phase 17 CLOSED (`f383108`). Phase 18 CLOSED / PASS (§4, §10–§14). **PHASE 19A: CLOSED / PASS** — 7-locale SEO gates, content-gated sitemap/hreflang, list pagination, admin 7-locale validation + `seoRobots`, locale-prefixed internal links and the detail canonical double-locale fix (§15). Next: **Phase 19B (not yet defined).**

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

Updated at the 18D-6 final sweep (2026-10-06):

| Server | Command | Port | Status |
|---|---|---|---|
| Temp API data source | `next dev` (`%TEMP%\opencode\marble-api-copy`) | 3000 | **CLOSED after 18D-6** |
| 18D-6 smoke | `next start --port 3100` | 3100 | **CLOSED after 18D-6** |

- Ports 3000/3100 verified FREE; both trees killed with `taskkill /T /F`.
- Temp logs live in `%TEMP%\opencode\` (`api-copy-dev.log`, `p18-final-3100.log`, `p18-final2-3100.log`).
- Remaining node processes (if any) belong to an unrelated project (`D:\20tl-akimi`, expo) — untouched.
- Restart the temp API copy from `%TEMP%\opencode\marble-api-copy` if a later phase needs a build-time data source.

---

## 8. GIT STATE

Superseded at the 18D-6 close — current state lives in §14. Historical: at the 18D-5 checkpoint all 18A–18D-5 changes were committed as ONE checkpoint commit (`d0b432c`) and pushed to `origin/master`. Only untracked leftovers are the excluded tool dirs `.agents/ .claude/ .cursor/ .devin/` (§6 commit hygiene).

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

## 13. PHASE 18D-5 — next/image + LOGIN LOGGING (CLOSED — PASS, completed 2026-10-06)

Scope: §9 SHOULD #4 (`<img>` → `next/image`), SHOULD #5 (ProductGallery lazy/thumbnail sizing), §3/§9 note (login attempt logging + session token entropy/rotation). Code committed at the 18D-5 checkpoint (`d0b432c`, commit + push authorized by user); the two open runtime HTML checks below were finished during the 18D-6 sweep (§14). 18A–18D-4 are CLOSED (PASS) — see §4, §10, §11, §12 (18B/18C/18D-1 changes are in the tree: soft-404 `page-errors.ts`, `SEO_LOCALES`, `rate-limit.ts`, success-path `x-request-id`).

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

### Remaining to finish 18D-5 — RESOLVED in §14 (18D-6)

1. ✅ Gallery-thumb runtime HTML check — **PASS** (temporary 2nd media row → clean rebuild → served HTML; see §14.1). Demo data has exactly 1 media per product variant, so a temp `ContentMedia` (role `GALLERY`) row was attached to `tr/demo-dark-stone`, the page was rebuilt, the HTML verified, and the row **deleted again** (baseline restored: 1 media for that variant).
2. ✅ Hero `priority`/preload HTML check on `/tr` — **PASS** (see §14.1).
3. ✅ Phase 18D-6 final sweep — **PASS** (see §14).

### Process state at checkpoint

- **All temp servers CLOSED** (ports 3000/3100 free; trees 40672/55548 killed; refs 60072/47496 gone); `dev-*.log` deleted. Other node processes = unrelated project (`D:\20tl-akimi`), untouched.

---

## 14. PHASE 18D-6 — FINAL SWEEP (CLOSED — PASS, 2026-10-06)

Scope: finish 18D-5's two open runtime HTML checks, then sweep §9 MUST/SHOULD, the Phase 18 exit criteria and the 18A–18D-5 regressions. **No source code changed in this step** — only `docs/SESSION_HANDOFF.md` (this file) and one operational note in `docs/DEPLOY_RUNBOOK.md`.

### 14.1 18D-5 leftover HTML checks — both PASS

**ProductGallery thumbnails** (`src/components/product/ProductGallery.tsx:57`): demo data has exactly 1 media row per product variant, so the `allImages.length > 1` branch never renders. Procedure: attached a temporary `ContentMedia` row (`id b7062d56-1d29-4c57-aa0a-d1e894f07bfb`, role `GALLERY`, asset `demo-marble-ivory.svg`, variant `tr/demo-dark-stone`) → clean `npm run build` → `next start :3100` → verified served HTML → **row deleted again** and baseline confirmed (that variant back to 1 media).

Served `/tr/products/demo-dark-stone` HTML: `product-hero__thumbnails` container present; **2 thumbnails, each `<img … sizes="4rem" loading="lazy">`**; srcSet starts at `w=32` (thumb-sized, no full-size download); primary image carries **no** `loading` attribute (eager/`priority`). Baseline re-check after the delete: 0 thumbnail containers, exactly 1 `<img>`, and that `<img>` is served through `/_next/image` (0 raw images).

**Hero `priority`/preload on `/tr`**: `<head>` contains `<link rel="preload" as="image" imageSrcSet="…demo-hero-poster.svg…" imageSizes="…">` (verified index-inside-`<head>`), and the hero `<img class="hero__poster">` has **no** `loading="lazy"`. Note (documented, no change made): Next 16 `next/image` emits `fetchpriority="high"` only when the `fetchPriority` prop is passed explicitly — `priority` maps to the preload link + eager loading (`node_modules/next/dist/shared/lib/get-img-props.js:271` `isLazy`, `:587` `preload: preload || priority`). Framework behaviour, not a defect; no scope creep taken.

### 14.2 §9 MUST FIX sweep — 4/4 PASS

| # | MUST | Status | Evidence (2026-10-06) |
|---|---|---|---|
| 1 | Rate limiting on login + quote-requests | **PASS** | Runtime: 6th `POST /api/v1/admin/auth/login` → **429 `retry-after: 60`** (limit 5/60s); 11th `POST /api/v1/public/tr/quote-requests` → **429 `retry-after: 60`** (limit 10/60s). Payloads were invalid → 422 on the allowed attempts, so no rows written (`QuoteRequest` count still 1). Unit: `src/__tests__/api/v1/rate-limit.test.ts` + `src/lib/__tests__/rate-limit.test.ts` green. |
| 2 | Startup/build env validation + `NEXT_PUBLIC_SITE_URL` | **PASS** | `next start` **without** prod env → **EXIT=1** with aggregated `Production environment validation failed: - NEXT_PUBLIC_SITE_URL is required… - NEXTAUTH_SECRET is a documented placeholder…`; `next dev` without those envs → runs (no-op gate). Canonical/hreflang/sitemap reflect the configured `NEXT_PUBLIC_SITE_URL` (never `example.com`). |
| 3 | Backup/restore + `migrate:deploy` + runbook | **PASS** | See §14.4 — `npm run backup`, `npm run migrate:deploy`, full restore rehearsal, destructive guard, `docs/DEPLOY_RUNBOOK.md`. |
| 4 | Build cannot bake a 404/stale page | **PASS** | Re-run this sweep: clean `.next` + unreachable prerender base (`NEXT_PUBLIC_SITE_URL=http://localhost:3100`, port dead) → **`npm run build` EXIT=1** with `Error [ApiClientError]: Network error` propagated from `page.tsx` — the old behaviour (EXIT=0 baking `404: This page could not be found.`) is gone. Healthy build → **EXIT=0, 94/94 pages**, `NEXT_HTTP_ERROR_FALLBACK` absent from built HTML. |

### 14.3 §9 SHOULD FIX sweep — 8/8 PASS

| # | SHOULD | Status | Evidence |
|---|---|---|---|
| 1 | `x-request-id` on success AND error | **PASS** | Runtime: 200 `GET /api/v1/public/tr/journal` → `x-request-id: req_…`; 404 detail → `req_…`; 400 invalid locale → `req_…`. |
| 2 | CSP without `unsafe-eval` in prod | **PASS** | Runtime header on `/tr`: `script-src 'self' 'unsafe-inline';` — no `'unsafe-eval'`; unit tests `security-headers.test.ts` / `next-config-headers.test.ts` green. |
| 3 | `revalidate` forwarded to `fetch` | **PASS** | `src/lib/api/client.ts` `fetchInit.next = { revalidate }` + 3 assertions in `api-client.test.ts`. |
| 4 | `<img>` → `next/image` | **PASS** | Product detail HTML: every `<img>` resolves through `/_next/image` (0 raw); SVG optimizer `/_next/image?…demo-marble-charcoal.svg&w=640&q=75` → **200 image/svg+xml**. |
| 5 | ProductGallery lazy/thumbnail sizing | **PASS** | §14.1. |
| 6 | JSON-LD escaping | **PASS** | `escapeJsonLd()` + `jsonld-escape.test.tsx`. |
| 7 | Production admin provisioning documented | **PASS** | `docs/DEPLOY_RUNBOOK.md` §6 (+ §1 env table, §5 rollback). |
| 8 | Login attempt logging + session entropy/rotation | **PASS** | Runtime log lines emitted during the rate-limit check: `[req_…] admin.login.failure email=unknown ip=::1 reason=ValidationError` (correlated by request id); `session.test.ts` asserts 64-hex token, unique per login, hash-only persistence. |

### 14.4 Exit criteria — 10/10 PASS

| Criterion | Status |
|---|---|
| Rate limiting active (429 + `Retry-After`) on login **and** quote-requests, verified by test | **PASS** (runtime 429s above + unit tests) |
| Fail-fast on missing/invalid `DATABASE_URL` / `NEXT_PUBLIC_SITE_URL`; set correctly in prod env | **PASS** (EXIT=1 fail-fast; `.env.example` + runbook §1) |
| Canonical/sitemap/hreflang use the configured real domain | **PASS** — `<link rel="canonical" href="http://localhost:3000/tr">`, `hreflang="tr"/"en"/"x-default"` present, `robots.txt Sitemap:` + sitemap entries from `NEXT_PUBLIC_SITE_URL`; `https://example.com` gone |
| Build cannot bake 404/stale page | **PASS** (EXIT=1 on prerender fetch failure) |
| Backup restorable, restore rehearsed, `migrate:deploy` in path, runbook committed | **PASS** — `backups\marble-20261006-203502.dump` (90,821 B) → `RESTORE_OK` → identical row counts (`Product 8, JournalArticle 3, InternalUser 3, MediaAsset 16, ContentMedia 43, QuoteRequest 1`) → `dropdb` EXIT=0; guard re-checked: no `-Force` → **EXIT 1**; `migrate:deploy` EXIT=0 (3 migrations, none pending) |
| `x-request-id` on success AND error | **PASS** |
| CSP without `unsafe-eval` + unit test | **PASS** |
| `/api/health` 200 only when DB reachable, used as deploy probe | **PASS** (`200` in smoke; runbook §2 step 5) |
| No committed secrets | **PASS** — `git ls-files` → 0 `.env` files; `.gitignore` `.env*` + `/backups/` |
| Full test/typecheck/lint/build green; 18A/18B/18C regressions unchanged | **PASS** — see §14.5 |

### 14.5 Verification results (all PASS, 2026-10-06)

| Check | Result |
|---|---|
| `npm test` | **818/818 PASS (60 files)** |
| `npm run typecheck` | **PASS** (0 errors) |
| `npm run lint` | **PASS** (0 errors, 2 pre-existing `_locale` warnings in `src/repositories/content.ts:250,463`) |
| `npm run build` (clean `.next`, valid env, API copy on :3000) | **EXIT=0**, 94/94 static pages (run twice: once for the gallery check, once final after baseline restore) |
| Build negative test (dead prerender base) | **EXIT=1**, no baked 404 |
| `npm run migrate:deploy` | **EXIT=0** — 3 migrations, none pending |
| `npm run backup` | **PASS** — `backups\marble-20261006-203502.dump` 90,821 bytes |
| Restore rehearsal (exit #5, 2nd time) | **PASS** — createdb → `RESTORE_OK` → 6/6 table counts identical → `dropdb` EXIT=0 |
| Restore destructive guard | **PASS** — no `-Force` → exit 1 |
| Runtime smoke (`next start :3100`) | health **200**; `/tr` `/en` `/tr/about` `/tr/products` `/tr/products/demo-dark-stone` `/tr/journal` `/tr/journal/ocaktan-bitis-yuzeyine` `/en/products/demo-dark-stone` `/tr/projects` `/sitemap.xml` `/robots.txt` → **200**; missing product/journal slugs → **404** |
| Regressions (18A/18B/18C) | soft-404 404s ✓; sitemap **58 URLs = 22 static + 36 detail, 0 unsupported locales** ✓; TR/EN + `x-default` hreflang ✓; CSP ✓; SVG optimizer ✓ |

### 14.6 Operational note (documented, no code change)

`NEXT_PUBLIC_SITE_URL` is **inlined at build time** into prerendered output (`sitemap.xml`, `robots.txt`, canonical/hreflang) *and* used as the server-side API base URL. Local smoke therefore shows `http://localhost:3000` (the value the build ran with) even when `next start` is given a different runtime value — production must set the real origin **before** `npm run build` (runbook §1). Verified directly: building with a dead `:3100` base fails the build instead of baking pages.

### 14.7 Git state at 18D-6 close

- Checkpoint commit `d0b432c` (18A–18D-5) already on `origin/master`.
- 18D-6 changes are **docs only**: `docs/SESSION_HANDOFF.md` (this file) + `docs/DEPLOY_RUNBOOK.md` (rehearsal re-run + build-time env note).
- Committed and pushed as the Phase 18 closing commit; verify with `git log -1` / `git status`.
- Working tree afterwards must show only the excluded untracked tool dirs `.agents/ .claude/ .cursor/ .devin/`.

---

## 15. PHASE 19A — 7-LOCALE SEO GATES + CANONICAL FIX (CLOSED / PASS, 2026-10-07)

Scope: content-driven locale SEO (index/hreflang/sitemap per locale), list pagination, admin 7-locale + `seoRobots` plumbing, locale-prefixed internal links, and the detail-page canonical double-locale fix. No feature work, no 404/fallback contract change.

### 15.1 What changed

- **7-locale SEO gate**: `SEO_LOCALES = SUPPORTED_LOCALES` (`src/lib/seo/constants.ts`); `buildPageAlternates(locale, path, contentLocales)` + `preferredContentLocale()`; new `src/types/seo.ts` (`SeoAvailability`), `src/lib/seo/gates.ts` (`getSeoAvailability`, `gatedMetadata`, `metadataFromSeoData`, `sectionLocales`, `companyLocales`, `anyContentLocales`), new public endpoint `GET /api/v1/public/{locale}/seo/availability` served from `ContentRepository.seoAvailability()` (single pass over ACTIVE published variants).
- **Gates wired**: 16 public pages use `gatedMetadata()`; the 5 detail pages use `metadataFromSeoData()`; `src/app/sitemap.ts` builds static + detail URLs only for locales that actually have content; `/quote` is `noindex` in every locale.
- **List pagination**: `parsePagination()` in `src/lib/api/validation.ts`, `DEFAULT_PAGINATION` in the content service, `Pagination` UI on the 5 list pages; public list routes accept `page`/`pageSize` (invalid values → 400 instead of silent coercion).
- **Admin 7-locale + `seoRobots`**: create/update schemas accept es/fr/de/it/ar (tr/en required on create), `localeSchema` replaces hardcoded `tr|en` enums in unpublish/revisions/taxonomy routes, workflow services typed on `Locale`, admin forms gained a SEO robots select. `seoRobots` already exists in `prisma/schema.prisma` (init migration) — **no migration**.
- **Locale-prefixed internal links**: Card/Grid components take a `locale` prop; product → quote links use `/{locale}/quote`; footer language switcher lists every supported locale.
- **Docs**: 8 spec files corrected (`marbles` → `products` URL segment, link graph, API/CMS contract tables).

### 15.2 Canonical double-locale fix (the one post-smoke bug)

- **Symptom**: detail canonical/hreflang rendered `/tr/tr/products/{slug}` and `/en/en/products/{slug}`; homepage API canonical `/en/en`.
- **Root cause**: `buildCanonical(locale, path)` = `SITE_URL/{locale}{path}` while callers already passed locale-prefixed paths (`src/services/content.ts:410,463,522,583,648` → `/${locale}/products/${slug}`; `:778,787-789` → `/${locale}`), so the locale was applied twice. Phase 19A's switch of detail pages from `buildPageAlternates()` to `metadataFromSeoData()` (which reads `seo.canonical`) made the pre-existing bug visible in HTML.
- **Fix** (`src/lib/api/seo.ts` only): `buildCanonical()` strips a leading `/{locale}` (exact match or `/{locale}/…` prefix) before prepending the locale, so it is added **exactly once** for every caller. No other file touched.
- **Verified**: `/tr/products/demo-dark-stone` canonical `…/tr/products/demo-dark-stone`, hreflang `tr/en/x-default` correct; `/en/...` likewise; API `seo.canonical` and homepage API canonical correct; no `/tr/tr`, `/en/en`, `/es/es` anywhere in HTML or sitemap.

### 15.3 Behaviour matrix (unchanged contracts, verified on the final build)

| Class | Locales | Status | robots | canonical | hreflang / sitemap |
|---|---|---|---|---|---|
| Home + 5 list pages + contact | tr, en | 200, real content | index (no robots meta) | self | advertised, in sitemap |
| Home + 5 list pages + contact | es, fr, de, it, ar | 200, **English shell + empty state, 0 cards** (fallback body, no content substitution) | **`noindex, follow`** | falls back to a locale that has content (`/tr`, `/tr/products`, …) | **excluded** from hreflang and sitemap |
| Company pages `about/factory/quarry` + detail `[slug]` | es, fr, de, it, ar | **404** | `noindex` (404 page) | n/a | **excluded** |
| `/quote` | all | 200 | **`noindex, follow`** | self | never in sitemap |

404 for content-less company/detail locales is the **expected, contract-compliant** behaviour — `docs/04_API_CONTRACT.md:9,164`, `docs/05_CMS_CONTRACT.md:68-70`, `docs/06_SEO_URL_ARCHITECTURE.md:42` all mandate "no implicit fallback"; the EN-fallback+noindex treatment applies only to list/home (no content substitution, English UI shell, empty sections).

### 15.4 Verification (all PASS, 2026-10-07)

| Check | Result |
|---|---|
| `npm test` | **845/845 PASS (62 files)** — run on the final HEAD |
| `npm run typecheck` | **EXIT=0** |
| `npm run lint` | **EXIT=0** — 0 errors, 2 pre-existing `_locale` warnings (`src/repositories/content.ts:328,541`) |
| `npm run build` (clean `.next`, API copy on :3000, `NEXT_PUBLIC_SITE_URL=http://localhost:3000` + valid `NEXTAUTH_SECRET`) | **EXIT=0**, `BUILD_ID=rFNAy7NoIQg_qAmX21pRQ` |
| Runtime smoke (`next start` :3000, `curl --max-time 8`) | `/tr/products/demo-dark-stone` 200 canonical exact ✓; `/en/products/demo-dark-stone` 200 canonical exact ✓; `/es/products/demo-dark-stone` **404** ✓; `/es/about` `/es/factory` `/es/quarry` **404** ✓; `/es` 200 `noindex, follow` canonical `/tr` ✓; `/es/products` 200 `noindex, follow` canonical `/tr/products` ✓; `/tr/quote` `noindex, follow` ✓; **no double-locale** in any page |
| Sitemap | **56 URLs = tr 28 + en 28**, duplicate **0**, double-locale **0**, es/fr/de/it/ar **0**, `/quote` absent |
| Pagination | API `pageSize=4`: page1 first slug `demo-dark-stone`, page2 first slug `demo-navy-stone`, `totalPages=2` ✓; default `pageSize=24` → `totalPages=1` → `?page=2` renders the empty state |
| Internal links | only locale-less internal hrefs are `/favicon.ico` + `/apple-touch-icon.png`; `/marbles` occurrences = 0 |

### 15.5 Git state at 19A close

- Phase 19A code landed in `7551e50` (wip checkpoint) + `3f34fdb` (prettier baseline, carries the `buildCanonical` fix) + `107efd9` + `6f56a88`, all pushed.
- This docs update is the Phase 19A closing commit: `feat(seo): complete phase 19A locale seo and canonical fixes` (hash = `git log -1`); `HEAD == origin/master`, working tree clean.
- At close the production `next start` server was left running on `:3000` (log `%TEMP%\opencode\p19a-close-3000.log`); temp API copy for builds lives at `%TEMP%\opencode\marble-api-copy`.

---

## 16. 2026-10-15 — ONAYLI İÇERİK TEMİZLİĞİ + DEMO ÜRÜN SİLME (CLOSED / PASS, uncommitted)

Onaylı paketler: Paket 1 (visne→Rosso Levanto + 5 ürün tr/en açıklama/SEO + 2 TR SEO kısaltma + 65 TR alt metni) ve Paket 3 (8 demo ürünün ilişkilerle silinmesi) uygulandı. Paket 2 (taslağa alma) UYGULANMADI — ayrı etki analizi bekleniyor.

### Yapılanlar (hepsi psql, `C:\Users\Kayra\AppData\Local\Temp\opencode\*.sql`)

- **visne → Rosso Levanto**: `ContentVariant.name` tr `Rosso Levanto Mermer` / en `Rosso Levanto Marble`; slug `visne` KORUNDU (URL yaşam döngüsü); 9/10 maddede alt metin adı da `Rosso Levanto …` yapıldı. Açıklama/SEO içerikleri görsel kanıtla (bordo-kırmızı breçia) yeniden yazıldı.
- **5 ürün tr+en alanları**: `afyonfire`, `visne` (görsel kanıtla yeni metin), `akhisarbej`, `pietragrey`, `alexander-black` (`content-import/enrichment.full.json` + `enrichment.pending.json` metinleriyle; ad alanına DOKUNULMADI — enrichment'ın "Alexander Black Marble" ad önerisi uygulanmadı). **afyonfire/visne enrichment metinleri görselle çeliştiği için kullanılmadı.**
- **TR SEO kısaltma**: `thunderblack` 165→121, `neuropicasso` 170→129 karakter; neuropicasso zemin/renk ifadesi görselle uyumlu hale getirildi (koyu zemin + altın/krem/beyaz damar).
- **65 TR alt metni**: `% mermer urun gorseli`→`% ürün görseli` (37) + `% mermer render gorseli`→`% galeri görseli` (28); kalan ASCII desen 0 (EN ve demo alt metinleri etkilenmedi — yan etki 0).
- **8 demo ürün silindi**: `ContentItem` type=PRODUCT, slug `demo-%` → CASCADE (8 ürün, 16 varyant, 16 ContentMedia, 9 ProductCollection, 13 ProductApplication, 14 RelatedProduct, 6 JournalContentReference, 6 CompanyContentReference, 2 ProjectProduct). **81 MediaAsset ve fiziksel dosyalar KORUNDU.** `QuoteRequestContext=0`, `AuditEvent` SET NULL.
- **Kalan `demo-%` varyant = 2**: `demo-mimari-projesi` + `demo-architectural-project` (PROJECT) — bilinçli olarak silinmedi (demo proje taslağa alma BEKLETİLDİ).
- **İkonlar** (`src/lib/site-contact.ts`, `src/components/contact/ContactBar.tsx`, `src/styles/components/contact-bar.css`): ContactBar artık HER ZAMAN görünür; `SITE_CONTACT_PHONE`/`SITE_WHATSAPP_PHONE`/`SITE_INSTAGRAM_URL` yoksa öğeler `<span aria-disabled>` (sahte `tel:`/`wa.me`/profil href'i ASLA üretilmez). `getSiteContact()` artık asla null dönmez; Instagram URL'i yalnız `https://…instagram.com…` kabul.

### Doğrulama (2026-10-15, hepsi PASS)

| Check | Result |
|---|---|
| `npm run typecheck` | EXIT=0 |
| `npm run lint` | EXIT=0 (0 hata, 2 eski `_locale` warning) |
| `npm run test` | **934/934 PASS (68 files)** (+3 yeni ContactBar/site-contact testi) |
| Yedekler (silme ÖNCESİ) | `backups\marble-20261015-123402.dump` (163.471→163434 B, içerik öncesi) + `marble-20261015-125647.dump` (165.471 B, silme öncesi) |
| Canlı smoke (:3000 dev) | `/tr` 200 + `contact-bar` görünür + wa.me/instagram/tel href=**0**; `/tr/products/visne` 200 "Rosso Levanto" ✓ / "Visne Mermer" 0; `/tr\|/en/products/demo-*` → **404**; `/sitemap.xml` demo slug **0**, `products/visne` 2 ✓; products API **37 ürün, demo 0** |
| Alt metin canlı | `/tr/products/afyonfire` HTML'de `Afyon Fire ürün görseli` ✓, eski ASCII desen 0 |
| Homepage API | `featured_products` bölümü YOK (servis boşken zaten atlıyor — tutarlı davranış) |

### ASKIDA / SONRAKİ ADIMLAR

1. **Featured üçlüsü (1. Rosso Levanto, 2. Teos Green, 3. Afyon Fire) YAPILMADI**: DB'de Teos Green'e ait HİÇBİR kayıt/medya yok (yalnız `C:\Users\Kayra\Desktop\Marble Content\Products\teos green\` altında 2 .jfif, projeye import edilmemiş). `isFeatured=true` ürün şu an 0. Karar kullanıcıya soruldu (Teos bekle / 2'li geç).
2. **Ertelenen işler ayrı etki analizi bekliyor**: 12 gerçek ürün taslağa alma + ilişkilendirme + iletişim/alan adı bilgileri.
3. ~~Kapsam dışı bırakılanlar~~ → **§17 ile kapatıldı**: sahte iletişim/`example.com`/`OrganizationJsonLd`/hero poster/demo proje temizlendi.

### Git state

- **Commit YOK, push YOK.** HEAD çalışma oturumu başında `3849732`; working tree'deki 14 modified + 21 untracked KORUNDU (önceki oturum işleri), bu oturumun yeni değişiklikleri: `src/lib/site-contact.ts`, `src/components/contact/ContactBar.tsx`, `src/styles/components/contact-bar.css`, `src/__tests__/components/ContactBar.test.tsx`, `src/__tests__/lib/site-contact.test.ts`, bu docs dosyası + veritabanı değişiklikleri.
- `next dev` :3000 canlı — DURDURULMADI/YENİDEN BAŞLATILMADI.

### 16.1 — Teos Green import + featured sırası + premium ikon barı (2026-10-15, CLOSED/PASS)

- **Teos Green oluşturuldu** (`slug teos-green`, tr+en): `content-import/name-registry.json`'a `approvedBy: "Content Owner"` (rol etiketi — kimlik OPEN DECISION) + `approvedAt: 2026-10-15` girişi; yeni şablon `content-import/teos-green.json` (yalnız görsel kanıtlı metin; extension alanları/internalIdentifier boş — uydurma yok); `npm run import:content` **dry-run OK → --execute: PUBLISHED** (admin API: medya upload → create → attach → revision submit→approve→publish). Görseller: `product/teos green.jfif` → PRIMARY, `renders/teos green.jfif` → GALLERY (`.jfif` magic-byte ile `image/jpeg` olarak kabul — `sniffImageMime`); orijinal dosyalara dokunulmadı.
- **Featured sırası**: visne=1, teos-green=2, afyonfire=3 (tr+en, `isFeatured`+`featuredOrder`), admin PATCH + revision publish üzerinden. Homepage `featured_products` bölümü geri geldi: **Rosso Levanto → Teos Green → Afyon Fire**, üç kart gerçek `/api/media/*.jpg` görselleriyle (3×200 image/jpeg).
- **KÖK NEDEN + ONARIM (önemli operasyon notu)**: `afyonfire` tr/en varyantlarında **8 Ekim'den beri açıkta duran eski DRAFT revision** vardı; featured PATCH'i bu eski draft'a yazıldı; publish eski `materialSnapshot`'ı apply etti → 15 Ekim'de onaylanan açıklama ve name alanları bozuldu (`AFYON MERMERİ`/boş, `AFYON FİRE`/`afyonfire`). Onarım: aynı PATCH+submit→approve→publish akışıyla doğru metin/name geri yüklendi (notes alanına gerekçe yazıldı). **Ders**: published varyant PATCH'i her zaman DRAFT revision açmaz — *açıkta eski draft varsa* ona yazar; publish öncesi workflow'daki `openRevision` yaşını/snapshot'ını kontrol et.
- **İkon barı premium pill**: `contact-bar.css` — 999px pill, uppercase label, `--shadow-md`, hover `translateY(-1px)`, WhatsApp sadece ikon/label `#128c7e` vurgusu (zemin üçü de aynı nötr), `--pending` soluk (opacity .55) + `cursor: default`; sahte link üretilmiyor (`SITE_CONTACT_PHONE`/`SITE_WHATSAPP_PHONE`/`SITE_INSTAGRAM_URL` yoksa üçü de `<span aria-disabled>`).
- **Doğrulama (hepsi PASS)**: typecheck 0 · lint 0 hata (2 eski warning) · **934/934 test** (`enrich-content.test.ts` checked-in registry beklentisi 1 girişe güncellendi) · smoke: `/tr` 200 + featured 3 isim + 3 media URL 200; teos/afyonfire/visne detay tr/en 200 + H1 doğru + 2'şer medya; demo ürün 404; sitemap `teos-green`×2, demo 0.
- Ek yedek: `backups\marble-20261015-141158.dump` (158.718 B, import öncesi).
- Yeni dosyalar: `content-import/teos-green.json` (+ `.report.json`), registry girişi; onarımda değişen kod YOK (yalnızca içerik/DB).

### 17 — Site geneli sahte/demo/boş içerik temizliği (2026-10-15, CLOSED/PASS)

- **Marka iddiasızlaşturma (menşei claim yasağı, md §2)**: `SITE_NAME` "Premium Turkish Marble" → **"Marble Platform"**, `SITE_NAME_TR` "Premium Türk Mermeri" → **"Mermer Platformu"** (`src/lib/seo/constants.ts`, `services/content.ts` yerel sabiti, `app/layout.tsx` title/description, `lib/api/seo.ts` siteName fallback'leri, `ProductJsonLd`/`ArticleJsonLd` brand/publisher). Header `BrandLogo` zaten "Mermer/Marble" kullanıyordu — tutarlı. Homepage hero: "Premium Doğal Mermer"/"Premium Natural Marble" + iddiasız metaDescription ("Turkish marble" cümleleri kaldırıldı). Test fixture'ları `__tests__/api/v1/public/helpers.ts` eşgüdümlü güncellendi.
- **Sahte iletişim verisi kaldırıldı**: `contact/page.tsx` sahte e-posta/telefon/adres/çalışma saatleri bloğu → tek "İletişim Kanalı" bölümü (teklif formu yönlendirmesi); `quote/page.tsx` sahte `mailto:info@marbleplatform.com` → form-destek metni. Gerçek değer yoksa ContactBar gibi sahte link ÜRETİLMİYOR.
- **OrganizationJsonLd**: kırık `logo.png` + `hello@example.invalid` + boş `sameAs` çıkarıldı (name+url kaldı).
- **`example.com`/placeholder fallback'leri** `constants.ts`+`lib/api/seo.ts`+`robots.ts` → `http://localhost:3000` (production'da `env.ts` fail-fast zaten example.com'u reddediyor); 5 liste sayfası (products/collections/applications/projects/journal) inline fallback → tek `SITE_URL` importu.
- **Hero**: `/videos/scrollroll2.mp4` GERÇEK (kullanıcı asset'i, korundu); demo poster `/demo/images/demo-hero-poster.svg` → **onaylı yayınlanmış Teos Green GALLERY görseli** `/api/media/18b81507-….jpg` (1200×896, anlamlı alt: "Teos Green mermer yüzeyi"/"Teos Green marble surface").
- **Demo proje yayından kaldırıldı**: ContentItem `d51c2dc0-4711-4de5-8251-0fb1c413b47a` (demo-mimari-projesi/demo-architectural-project) admin workflow `POST /admin/projects/[id]/unpublish {locale}` ile tr+en **PUBLISHED→UNPUBLISHED** (silinmedi; nav'daki Projeler linki `hasPublishedProjects` ile otomatik gizlendi; sitemap'ten düştü; detay 404).
- **Koleksiyon/uygulama ilişkilendirmesi (junction=0)**: **uydurulmadı** — mevcut mimari "boş bölümü gizle" (`products.length > 0 &&`, `projectsVisible &&`) ile detay sayfaları hero+açıklama+CTA olarak anlamlı; gerçek ilişki verisi olduğunda CMS'ten bağlanmalı (OPEN: ilişki iş verisi).
- **Doğrulama (hepsi PASS)**: typecheck 0 · lint 0 hata (2 eski warning) · **934/934 test** · canlı smoke: 26 public sayfa 200 (EN koleksiyon slug'ları farklı dilli: classic-stones/hospitality vb. — 404 değil tasarım), hero/poster/marka/JSON-LD/sitemap/robots/İletişim/quote/empty-collection/demo-404 kontrolleri 22/22.
- **Kalan gerçek veri eksikleri (uydurma yok, OPEN)**: iletişim kanalları (telefon/WhatsApp/e-posta/adres/sosyal), kurumsal onaylı Company Owner kimliği, koleksiyon↔ürün & uygulama↔ürün ilişkileri, gerçek proje case study'leri, ortam/domain (`NEXT_PUBLIC_SITE_URL`) bilgisi.
- DB yedeği: öncesi `backups\marble-20261015-153237.dump` (166.444 B). Değişen kod dosyaları: `seo/constants.ts`, `api/seo.ts`, `robots.ts`, `app/layout.tsx`, `services/content.ts`, `seo/{Organization,Product,Article}JsonLd.tsx`, `[locale]/{contact,quote,products,collections,applications,projects,journal}/page.tsx`, `__tests__/api/v1/public/helpers.ts`.
- **Git: commit/push YOK**; önceki oturum working tree değişiklikleri korundu. `next dev` :3000 canlı — durdurulmadı.

### 18 — Marble Content 16 yeni ürün + gerçek kapaklar (2026-10-15, OPEN/PASS-VERIFY, uncommitted)

**18.1 — 16 yeni ürün import edildi (kapandı, 16/16 PUBLISHED)**

- Taze yedek: `backups\marble-20261015-165228.dump` (166.752 B) — import ÖNCESİ.
- `Marble Content\Products` = 54 klasör; DB'de 38 ürün vardı → 16 yeni tespit+görüntülendi: aegean-rose, bumblebee, calacatta-green (yalnız render PRIMARY), cappuccino, ege-kahve (`kahve` ile FARKLI — doğrulandı), glacier-gray, hermes-gray (dup klasör `hermesgray` aynı product → TEK ürün, 2 render GALLERY), kirmizi-traverten, light-emparador, nero-ceppo, sunrise-montana, titanyum-traverten, vanilla-beige, volakas (2 render), white-royal, yellow-iceberg (yalnız facade render PRIMARY, `iceberg` ile farklı; `ıceberg` klasörü mevcut iceberg ile aynı → yeni değil).
- `content-import/name-registry.json` +17 girişi (`approvedBy: "Content Owner"` rol etiketi, `approvedAt: 2026-10-15`); `content-import/new-products.json` yalnız görsel kanıtlı TR/EN metin (menşei/teknik/ölçü YOK; koleksiyon/uygulama ilişkisi YOK; travertenlerde "Mermer/Marble" eki YOK). Dry-run OK → `--execute` **16/16 PUBLISHED**. DB: 54 ürün, 54/54 TR PUBLISHED, açık draft 0.

**18.2 — Demo kapaklar gerçek görsellerle değiştirildi (6 içerik, kod değişikliği YOK)**

- Yöntem: admin API (service-level `attachProductMedia`/`detachProductMedia` — audit yazar, revision'a dokunmaz). Geçici betik `.tmp-swap-covers.ts` (proje kökü, çalıştıktan SİLİNMELİ — shell silme izni yok).
- **Uygulamalar**: konut/residential → `calacatta green/renders/calacattagreen.jfif` (3 panelli mutfak/şömine/banyo); otel-ve-konaklama/hospitality → `volakas/renders/volakas1.jfif` (kavisli merdiven); ticari/commercial → `yellowıceberg/renders/yellowıceberg.jfif` (dış cephe+havuz). 6 varyant (tr+en) demo SVG detach → yeni asset PRIMARY + dürüst alt metin (tr/en).
- **Dergi**: ocaktan-bitis-yuzeyine/from-quarry → `volakas/product/volakas.jfif` (plaka); cagdas-mimarlikta/stone-in-contemporary → `sunrise montana/renders/sunrise montana1.jfif` (şömine duvarı); dogal-tas-secimi/understanding-selection → `lightemparador/product/lightemparador.jfif` (depo plakaları). Aynı attach akışı, 6 varyant.
- Sonuç: 6/6 swap `ALL SWAPS OK`; 12 detay sayfasının tamamı `og:image` = gerçek `/api/media/*.jpg` (demo 0).

**18.3 — Doğrulama (2026-10-15, hepsi PASS)**

| Check | Result |
|---|---|
| `npm run typecheck` | EXIT=0 |
| `npm run lint` | EXIT=0 (0 hata, 2 eski `_locale` warning) |
| `npm run test` | **934/934 PASS (68 files)** |
| Canlı tarama (80 URL) | hepsi **200 + H1**; applications/journal 12 detay **gerçek og:image**; ürünler/iletişim/teklif/projeler'de demo/example **0** |

**18.4 — Kalan demo/placeholder (ONAY BEKLİYOR — bu oturumda dokunulmadı)**

1. **Koleksiyon kapakları** (6 varyant + koleksiyon listeleri + homepage kartları, `demo-collection-*.svg`): gerçek kategori görseli YOK, tekil ürün seçmek kurasyon uydurmak olur → **korundu (OPEN)**.
2. **Şirket sayfaları about/factory/quarry** (tr+en): `demo-collection-*`/`demo-journal-quarry` kapakları + "Bu sayfa geliştirme amaçlı oluşturulmuş example … bilgisi içermektedir" placeholder metni. `company-content` için **medya attach/detach rotası CMS'te YOK** — kapaklar admin API ile değiştirilemiyor (SQL detach = audit'siz, md §8'e aykırı → yapılmadı).
3. **Uygulama açıklamaları** (3×tr+en, list+detail+homepage): "uygulama exampleları"/"application examples" seed kelimesi görünür — minimal düzeltme (tek kelime silme, iddia UYDURULMAZ) teklif edilir, onay beklenir.
4. **Koleksiyon açıklamaları** (3×tr+en): TR "zamansız tasarım exampleları"; EN "design examples" — aynı minimal düzeltme teklifi.
5. **Dergi 3 makale ×tr+en**: `authorName="Development Author"`, summary+body "development example makalesi" placeholder. Gerçek editoryal içerik uydurulamaz (md §2) → seçenekler: (a) 3 makaleyi unpublish (onaysız içerik halka kapalı olur, dergi boşalır), (b) Content Owner onaylı gerçek makale beklemek.

**Git: commit/push YOK**; önceki working tree değişiklikleri korundu. `next dev` :3000 canlı — durdurulmadı. Geçici dosyalar (kullanıcı silmeli): proje kökü `.tmp-swap-covers.ts`, `.tmp-discover.ts`, `.tmp-verify.ts`, `.tmp-scan.ts`.

---

## 19. 2026-10-15 — OTURUM DURUM KAYDI (handoff; §18 korunmuştur, bu bölüm yeni)

Bu bölüm, mevcut oturumun güvenli durum kaydıdır. Önceki bölümler (§1–§18) silinmedi/yeniden yazılmadı. Bu oturumda SADECE bu handoff dosyası güncellendi; başka kod veya veritabanı değişikliği YAPILMADI.

### 19.1 Tamamlanan işler

- `Marble Content\Products` altındaki 54 ürün klasörü tarandı (DB başlangıçta 38 ürün).
- **16 yeni ürün import edildi ve PUBLISHED**: aegean-rose, bumblebee, calacatta-green, cappuccino, ege-kahve, glacier-gray, hermes-gray, kirmizi-traverten, light-emparador, nero-ceppo, sunrise-montana, titanyum-traverten, vanilla-beige, volakas, white-royal, yellow-iceberg.
- Veritabanında **54/54 ürün TR PUBLISHED**; açık draft revision **0**.
- `content-import/name-registry.json`'ye **17 onaylı ad girişi** eklendi (`approvedBy: "Content Owner"` rol etiketi, `approvedAt: 2026-10-15`).
- **Uygulamalar ve dergi sayfalarındaki 6 demo kapak gerçek görsellerle değiştirildi** (3 uygulama + 3 makale, tr+en 6 varyant); **admin API ve audit** kullanıldı (service-level attach/detach, revision'a dokunulmadı): konut→calacatta-green render, otel→volakas merdiven render, ticari→yellow-iceberg cephe render, ocaktan→volakas plaka, çağdaş mimari→sunrise-montana render, taş seçimi→lightemparador plaka. Her birine dürüst tr/en alt metin bağlandı; demo SVG attach'ları detach edildi.
- **12 detay sayfasının `og:image` alanı gerçek medya görsellerine bağlandı** (applications+journal × tr/en, 12/12 REAL `/api/media/*.jpg`).
- **Typecheck PASS** (0 hata), **lint 0 hata** (2 eski `_locale` warning), **test 934/934 PASS** (68 dosya).
- **80 canlı URL kontrol edildi: 200 + H1** (anasayfa, hakkında/fabrika/ocak, 54 ürün detayı, koleksiyon/uygulama/dergi listeleri+detayları, tr/en).
- Ürün/iletişim/teklif/projeler alanlarında demo/example kontrolü **PASS (0)**.
- Yedek (import öncesi): **`backups\marble-20261015-165228.dump`** (166.752 B).
- `next dev` sunucusu `localhost:3000` üzerinde **çalışıyor** (durdurulmadı/yeniden başlatılmadı).
- **Commit/push yapılmadı**; mevcut working-tree değişiklikleri korunuyor.
- Önceki handoff bölümü **§18 korunmuştur**.

### 19.2 Karar bekleyen konular — HİÇBİRİ UYGULANMADI

1. **Koleksiyon açıklamalarındaki seed/example ifadeleri** (3×tr+en; TR "zamansız tasarım exampleları", EN "design examples") — minimal düzeltme teklifi (tek kelime/id ifadesi silme, iddia uydurulmaz), ONAY BEKLİYOR.
2. **Uygulama açıklamalarındaki example ifadeleri** (3×tr+en; "uygulama exampleları"/"application examples") — aynı minimal düzeltme teklifi, ONAY BEKLİYOR.
3. **Üç dergi makalesi** (tr+en): `authorName="Development Author"`, summary+body "development example makalesi" placeholder. Seçenekler: **(a)** unpublish, **(b)** gerçek içerik onayı bekle, **(c)** mevcut hâliyle bırak. **Karar verilmedi.**
4. **Hakkında/Fabrika/Ocağı placeholder metinleri ve demo kapakları** (tr+en): Company-content için **audit'li CMS medya akışı bulunmuyor** (medya attach/detach rotası yok); **doğrudan SQL ile değişiklik yapılmadı** (md §8 audit kuralı). Karar: CMS'e medya rotası ekle (kod) mi, bırak mı.
5. **Koleksiyon kapakları** (6 varyant + liste + homepage kartları, `demo-collection-*.svg`): gerçek kategori görseli bulunmadığından **korunuyor**; karar bekliyor.

### 19.3 Diğer açık işler

- Koleksiyon↔ürün ve uygulama↔ürün ilişkileri için **doğrulanmış eşleştirmeler** (junction=0; uydurulmadı, OPEN).
- **Gerçek proje case study'leri** (demo proje §17'de unpublish edildi; yeni gerçek proje yok).
- **Gerçek iletişim bilgileri** (telefon/WhatsApp/e-posta/adres/sosyal — sahte değer üretilmiyor).
- **Content Owner kimliği** (approvedBy yalnız rol etiketi).
- **Production domain** (`NEXT_PUBLIC_SITE_URL`).
- Proje kökündeki geçici dosyalar: `.tmp-swap-covers.ts`, `.tmp-discover.ts`, `.tmp-verify.ts`, `.tmp-scan.ts` — **silme izni verilmediğinden SİLİNMEDİ** (kullanıcı silmeli veya izin vermeli).

### 19.4 Güvenlik notu (bu oturumda uyulan)

Başka kod/DB değişikliği yok; içerik publish/unpublish yok; geçici dosya silme yok; commit/push yok; `git reset/restore/clean` yok; geliştirme sunucusu kapatılmadı; mevcut dosya değişiklikleri korundu.

---

## NEXT

**Phase 19A = CLOSED / PASS.** 7-locale SEO gates, content-gated sitemap/hreflang, pagination, admin 7-locale plumbing, canonical fix and the 404/fallback matrix are all verified; see §15.

RESUME POINT for a future session (Phase 19B):
1. Read this file top-to-bottom (§1 source of truth, §15 for 19A) and `git log -1`.
2. **Phase 19B is not yet defined.** Candidates parked in §9 DEFER (distributed rate limiting, structured logging, HTML sanitizer, ISR/CDN strategy, `middleware`→`proxy` rename, CORS) plus Playwright MCP (§ TOOLING NOTE) need an explicit scope decision before work starts.
3. Build-time data source: restart the temp API copy from `%TEMP%\opencode\marble-api-copy` on `:3000` before `npm run build`, and set `NEXT_PUBLIC_SITE_URL` + a non-placeholder `NEXTAUTH_SECRET` (18D-2 fail-fast).

---

## TOOLING NOTE - Playwright MCP (deferred, not run yet)

- `opencode.json` (project root) defines `mcp.playwright` (`npx -y @playwright/mcp`) with **`enabled: false`**. Keep it disabled until seed data is ready.
- Before enabling, run once: `npx playwright install chromium` (downloads Chromium; not executed yet, deferred by decision).
- Also pending a decision: adding `"formatter": true` and `"lsp": true` to `opencode.json` after inspecting `opencode debug config` defaults.

---

## CONTINUATION POINT

NEXT: Yeni terminalde SESSION_HANDOFF.md oku; kullanıcıya mevcut durumu ve karar bekleyen 1–5 maddelerini kısa özetle. Hiçbir açık maddeyi kullanıcı kararı olmadan uygulama. Önce talimat bekle.

---

## PHASE 20 — CMS İÇERİK YENİDEN ADLANDIRMA & PLACEHOLDER REWRITE (bu oturum)

Generated: 2026-10-22. Kullanıcı onaylı kapsam:3 koleksiyon adı, ürün adı, uygulama kart metinleri, About/Factory/Quarry placeholder'ları; journal yalnız rapor. **Commit/PUSH YOK** (kullanıcı açıkça istemedi).

### 20.1 Yapılan CMS içerik mutasyonları (admin API + revision flow: PATCH → draft → submit → approve → publish; doğrudan SQL içerik mutasyonu YOK — sadece read-only Prisma sorguları)

- **Koleksiyon adları** (slug'lar KORUNDU):
  - `klasik-taslar`/`classic-stones` → tr **Mermer** / en **Marble**
  - `cagdas-taslar`/`contemporary-stones` → tr **Traverten** / en **Travertine**
  - `mimari-taslar`/`architectural-stones` → tr **Onyx** / en **Onyx**
  - Koleksiyon kartı + detay hero **görsel alt metinleri** de güncellendi (`PATCH /api/v1/admin/collections/{id}/media`): "Klasik Taşlar"→"Mermer koleksiyonu"/"Marble collection", "Çağdaş Taşlar"→"Traverten koleksiyonu"/"Travertine collection", "Mimari Taşlar"→"Onyx koleksiyonu"/"Onyx collection".
- **Marble koleksiyonuna 52 ürün attach** (`POST /collections/{id}/products` ×52, 0 hata; 54 üründen 2'si travertine — bkz. 20.4-2).
- **Ürün `ege-kahve` → "Aegean Coffee"**: tr+en name/seoTitle (slug korundu), media alt'ları "Aegean Coffee ürün görseli" / "Aegean Coffee marble product image" (`PATCH /products/{id}/media`).
- **Uygulama kart metinleri** (tr+en; konut/konut, otel, ticari): render görselini tarif eden, gerçek proje iddiası İÇERMEYEN açıklamalar + seoTitle/seoDescription. Yeni uygulama veya ProductApplication junction EKLENMEDİ.
- **Company content** (`company-content` revision akışı ayrı — draft ID'leri read-only Prisma ile bulundu): ABOUT/FACTORY → KASHA marka metni (açıklama HTML `<p>` paragraflar olarak saklanıyor; meta description `htmlToPlainText` ile tag-free), QUARRY → nötr "Ocağımızla ilgili bilgiler hazırlanmaktadır." / "Information about our quarry is being prepared." (uydurma maden/ocak verisi YOK). Hepsi PUBLISHED.

### 20.2 Kod değişiklikleri (working tree'de, UNCOMMITTED)

- `src/lib/seo/text.ts` (yeni, untracked): `htmlToPlainText()` helper.
- `src/__tests__/seo/text.test.ts` (yeni, untracked): 3 unit test.
- `src/app/[locale]/about/page.tsx`, `factory/page.tsx`, `quarry/page.tsx`: metadata description `htmlToPlainText(...)`; intro bloğu (`company-page__intro`) yalnızca description HTML içermiyorsa render ediliyor (HTML varsa meta'ya sızmasın diye).
- Kritik prosedür: kaynak dosyalara PowerShell metin rewrite ile MÜDAHALE YOK (UTF-8 mojibake kazası yaşandı ve `git checkout --` + edit tool ile düzeltildi); payload metinleri UTF-8 JSON dosyalarında, `.ps1` scriptler ASCII.

### 20.3 Doğrulama (üçü PASS)

- `npm run typecheck` ✓ · `npm run lint` 0 hata / 2 uyarı (`repositories/content.ts` `_locale` unused — önceden var, bu oturumun dosyaları değil) · `npm run test` 69 dosya / **937/937 PASS** (yeni text.test.ts dahil).
- Canlı (`localhost:3000`, 15 URL tr/en + sitemap): hepsi 200 (`/sitemap.xml` locale altı değil — `/tr/sitemap.xml` 404 normal). **70+ içerik kontrolü PASS**: eski koleksiyon adları sayfalarda/alt'larda YOK, detay sayfasında 52 ürün linki, "Aegean Coffee" + eski "Ege Kahve" YOK, uygulama kartları render metinli, about/factory meta tag-free + intro gizli, sitemap 144 `<loc>` eski slug'larla korunmuş.

### 20.4 Açık kararlar / rapor edilenler (onay bekliyor)

1. **Slug–ad uyuşmazlığı**: `klasik-taslar`→Mermer, `classic-stones`→Marble vb. Slug değişimi = SEO URL yaşam döngüsü kararı (301 gerekir; onaysız değiştirilmedi).
2. **Traverten/Onyx koleksiyonları boş (0 ürün)** — bilinçli olarak dokunulmadı. Ancak DB'de **`kirmizi-traverten` ve `titanyum-traverten` adlı 2 ürün var, her birinde 2 medya mevcut** ("taş yok" öncülüğüyle çelişiyor) ve şu an Marble (52) içindeler — Traverten'e taşınabilir; onay bekliyor.
3. **`ege-kahve` slug'ı** `aegean-coffee` yapılmadı (redirect kararı gerekli).
4. **`seoTitle` public sayfalarda KULLANILMIYOR**: `<title>` = `{name} | {site}`, og:title = `{name}` (seoDescription ise meta description'da kullanılıyor). "Mermer Koleksiyonu" title'da görünmüyor. Kod davranışı tespiti — değişiklik kapsam dışı.
5. **Journal 3 makale** (tr+en, PUBLISHED): `authorName="Development Author"`, açıklamalarda "development example" ibaresi — DOKUNULMADI, raporlandı.
6. **2 "Demo" proje** (`Demo Mimari Projesi`/`Demo Architectural Project`, PUBLISHED) — kapsam dışı, dokunulmadı.
7. **ProductApplication junction** (uygulama↔ürün ilişkisi) eklenmedi — onay bekliyor.
8. Daha fazla **render tabanlı uygulama kategorisi** eklenebilir (onayla).
9. **Koleksiyon kapak görselleri** `demo-collection-*.svg` olarak kaldı (gerçek görsel yok; §19 açık maddesiyle aynı).

### 20.5 Geçici dosyalar

Bu oturum: `.tmp-admin-run*.ps1`, `.tmp-*-drafts/verify/leftover/summ/live-check*.cjs`, `.tmp-payloads/`, `.tmp-live/`, `.tmp-debug.ps1` — kullanıcı onayıyla SİLİNEBİLİR (silme izni gelmedi, duruyor). Önceki oturumların `.tmp-swap-covers.ts`, `.tmp-discover.ts`, `.tmp-verify.ts`, `.tmp-scan.ts`, `.tmp-snap*`, `.tmp-check-*` dosyaları da duruyor (§19.3).

## PHASE 21 — JOURNAL REWRITE + QUARRY NEUTRAL CONTENT (2026-10-23, CLOSED / PASS, uncommitted)

### 21.1 Kod değişiklikleri (working tree'de, UNCOMMITTED)

- `src/services/content.ts`: journal mapping düzeltmesi — `summary` artık HTML gövdeden `htmlToPlainText()` ile türetiliyor (ilk 320 karakter + `...`); `body` eskisi gibi HTML `description`. Mapping değişikliği 3 yerde: liste özeti (~satır 308), detay özeti (~satır 722), ilgili makale listesi özeti (~satır 761). Yeni helper `journalSummaryText()` + `htmlToPlainText` import'u eklendi. API şekli değişmedi. Sebep: `description` alanı hem özet hem gövde olarak render ediliyordu (iki kat tekrar); HTML gövde yazabilmek için özetin düz metin türetilmesi gerekti.

### 21.2 CMS içerik mutasyonları (admin API + revision flow; doğrudan SQL içerik yazımı YOK)

- **3 journal makalesi** (slug'lar/isimler korundu, `publicationDate` BILINÇLI olarak null bırakıldı → public `<time>` gerçek `createdAt` (2026-01-15) gösteriyor, uydurma tarih YOK):
  - `a9b12f70-4cf4-40ad-b991-df0a51256902` — dogal-tas-secimi-hakkinda / understanding-natural-stone-selection: yeni TR+EN HTML gövde (renk/damar, yüzey bitişi, kullanım alanı, bakım, numune), tagline, seoTitle/seoDescription.
  - `cce7b9b4-7c9f-4c3e-b807-2221cb07cf76` — cagdas-mimarlikta-tas-kullanimi / stone-in-contemporary-architecture: zemin/duvar/merdiven/mobilya; konut/otel/ticari öncelikleri; tasarım önerileri.
  - `09d602b9-0208-47d6-af7a-a82478b7cfb3` — ocaktan-bitis-yuzeyine / from-quarry-block-to-finished-surface: blok çıkarma, blok kesimi, plaka üretimi, yüzey işleme, kalite kontrol, sevkiyat.
  - `authorName` = **KASHA** (kullanıcı onaylı; uydurma kişi adı YOK). İçeriklerde KASHA'ya ait sahte proje/kapasite/sertifika iddiası YOK. Hepsi PUBLISHED tr+en, açık revision = 0.
- **QUARRY company content** (`9c6e1b2c-3466-4f0c-ac6a-156266b70a99`): "bilgiler hazırlanmaktadır" placeholder'ı yerine neutral profesyonel TR+EN HTML (kaynak/ocak değerlendirmesi kriterleri, üretim zinciri genel bilgisi, kalite ve izlenebilirlik). KASHA'nın ocak sahibi olduğu iddiası YOK. `name`/`slug`/`seoTitle` ("Ocağımız"/"Our Quarry") korundu; `seoDescription` placeholder'dan gerçek özetle değiştirildi. PUBLISHED tr+en, açık revision = 0. Publish akışı: `PATCH /api/v1/admin/company-content/QUARRY` → draft ID'leri read-only Prisma (`.tmp-company-drafts.cjs`) → universal submit/approve/publish.
- **Koleksiyonlar/uygulamalar DEĞİŞTİRİLMEDİ** (doğrulama amaçlı sayım): Marble=52, Traverten=2 (`kirmizi-traverten`, `titanyum-traverten`), Onyx=0 — bilinen ve beklenen durum. Demo proje (`d51c2dc0-...`) UNPUBLISHED bırakıldı, her yerde görünmez (detail 404, sitemap'te yok).

### 21.3 Doğrulama (üçü PASS + 96/102 canlı kontrol PASS, 6 FAIL kusurlu test kriteri)

- `npm run typecheck` ✓ (boş çıktı) — `npm run lint` 0 hata / 2 önceden bilinen `_locale` uyarısı (`repositories/content.ts:328,541`) — `npm run test` 69 dosya / **937/937 PASS** (mapping değişikliği testleri bozmadı).
- Prisma (read-only): 3 makale author=KASHA, publishedAt=null, PUBLISHED tr+en, tagline var, placeholder regex false (journal-3 EN'deki `ph=true` SAHTE POZİTİF — "samples are prepared" ifadesi). QUARRY tr+en placeholder-free. Sayımlar: 52/2/0.
- Canlı (`localhost:3000`, `.tmp-live-final.cjs`, 102 kontrol / 96 PASS): journal list tr/en (3 kart, KASHA, placeholder yok), 6 detail sayfası (200, KASHA, `<h2>` gövde, noindex yok), quarry tr/en (intro gizli, body `<h2>`, placeholder yok), about/factory tr/en hâlâ temiz, sweep 14 URL tr/en (/, collections, applications, projects, contact, quote, products) placeholder-free, public journal API tr/en (author=KASHA, Development Author/Example yok), sitemap 144 `<loc>` + journal slug'ları yerinde + demo proje yok, demo proje detail 404. 6 FAIL = test kontrolündeki `>6 h2` eşiği kusuru (sayfa kendi başına 4 ek h2 render ediyor); manuel doğrulamada özet düz metin 323 karakter (`journal-article__summary` içinde, HTML'siz) — düzgün.
- Journal detail meta description (`generateMetadata`) artık kısa özet kullanıyor (eski: tek cümle description).

### 21.4 Kalan gerçek veri boşlukları / engeller

1. Journal'da gerçek yazar adı yok — KASHA marka adı kullanılıyor (kullanıcı onayıyla); gerçek kişi/kurum yazarı eklenmeli.
2. `publicationDate` (journalArticle) hâlâ null — gerçek yayın tarihi bilgisi eklenmeli (uydurma tarih yazılmadı).
3. Proje sayfası: tek demo proje UNPUBLISHED — gerçek, onaylı proje içeriği bekleniyor.
4. Onyx koleksiyonu 0 ürün; gerçek ürün yoksa koleksiyon sayfası boş kalır.
5. Demo proje + koleksiyon demo kapakları (`demo-collection-*.svg`) hâlâ duruyor — gerçek medya onayı bekliyor.
6. Slug-ad uyuşmazlıkları (`klasik-taslar`→Mermer vb.), `ege-kahve` slug'ı, seoTitle'ın `<title>`'ta kullanılmaması — Phase 20.4 açık maddeleri aynen geçerli.

### 21.5 Geçici dosyalar (bu oturum)

`.tmp-journal-run.ps1` (login + PATCH/publish akışı), `.tmp-journal-ids.cjs`, `.tmp-final-state.cjs`, `.tmp-quarry-read.cjs`, `.tmp-live-final.cjs`, `.tmp-payloads/journal-1.json`–`journal-3.json`, `quarry.json` — kullanıcı onayıyla silinebilir (§20.5 listesine ek).

## PHASE 22 — FINAL QUALITY & SEO AUDIT (2026-10-23, CLOSED / PASS, uncommitted)

### 22.1 Phase 21'in 6 FAIL kontrolü — tek tek sonuç (6/6 = hatalı test kriteri, gerçek hata YOK)

Eski kriter: `totalH2 > 6` → her journal detail sayfasında FAIL. Kanıt (`.tmp-audit-h2.cjs`): sayfa toplam h2 = gövde editoryal h2 (5-6) + sayfa kromozom h2'leri (CTA + ilgili makale başlığı = 2) = 7-8 → kriter hep yanlış. Doğru kriter (`.tmp-live-final.cjs` düzeltildi): summary ≤323 karakter + HTML'siz (`journal-article__summary` regex `[^<]*`) + body ayrı div'de h2 içeriyor → **6/6 PASS**; tüm set **102/102 PASS**.

### 22.2 seoTitle artık kullanılıyor (5 detail sayfası)

- `src/app/[locale]/{products,collections,applications,projects,journal}/[slug]/page.tsx`: `const title = X.seo?.title || X.name` (OG title aynı `title`'ı kullanır). Eski davranış: `<title>` = `{name} | site` (seoTitle tamamen görmezden geliniyordu; `metadataFromSeoData` sadece alternates+robots döndürür). Doğrulama canlı: koleksiyon → "Mermer Koleksiyonu | Mermer Platformu", journal → seoTitle başlıkları, ürün → "Aegean Coffee - ..." başlıkları. seoTitle null olan içeriklerde `name` fallback — backward-compatible. Company sayfalarına dokunulmadı (seoTitle = name zaten).
- Apple touch icon: root `src/app/layout.tsx` `icons.apple: '/apple-touch-icon.png'` → dosya YOK → 404 (gerçek bozuk link). Kaldırıldı (`icons.icon: '/favicon.ico'` korundu; `src/app/favicon.ico` var). Üretilmiş ikon kullanılmadı (sahte marka görseli yasak).

### 22.3 Slug kararları (DEĞİŞTİRİLMEDİ — gerekçeli)

- Koleksiyon slug'ları (`klasik-taslar`/`classic-stones` → Mermer/Marble) ve `ege-kahve` slug'ı (ad: Aegean Coffee): URL yaşam döngüsü yönlendirme altyapısı YOK (`next.config.ts` redirects/rewrites yok; middleware sadece locale 308). Yeniden adlandırma = 301 gerektirir; mevcut URL'ler sitemap'te, canonical'lı ve indekslenebilir — SEO faydası yok, kırık URL riski var. **Karar: değiştirme.** Slug–ad uyumsuzluğu URL mimari tercihi, kural ihlali değil.

### 22.4 SEO denetimi (`.tmp-seo-audit.cjs`: 330 PASS / 2 "FAIL" = 1 sahte kriter + 1 gerçek hata düzeltildi)

- Liste + detail tüm TR/EN sayfalar: 200, canonical self-referencing, hreflang tr+en+x-default (React camelCase `hrefLang` formatında basılıyor — küçük-harf regex sahte 0 veriyordu), meta description, og:title, tek h1.
- **Bilinçli noindex (doğru davranış)**: `/projects` (availability gate: `projects: []` → yayınlanmış proje yok → noindex; içerik gelince otomatik indexlenir) ve `/quote` (sabit form noindex, `page.tsx` satır 35).
- Sitemap: 144 `<loc>`, 12 spot-check 200, demo proje yok.
- Beklenen 404'ler doğrulandı (bilinmeyen slug'lar, demo proje, `/tr/sitemap.xml`, geçersiz locale → 308→/tr/xx/... zinciri sonu 404, döngü yok). 5xx: 0.
- Internal link crawl: 108 benzersiz link → tek kırık `/apple-touch-icon.png` (düzeltildi).
- img alt: 6 kritik sayfada 0 eksik/boş alt.
- Public API: 10 endpoint (5 bölüm × tr/en) 200 + geçerli JSON.

### 22.5 İçerik doğrulama (dokunma yok)

Prisma read-only: Marble=52, Traverten=2, Onyx=0 (korunmuş). Journal author=KASHA, publicationDate=null, placeholder-free. QUARRY neutral PUBLISHED. Ürün fotoğrafları/uygulama renderları/koleksiyon kapakları DEĞİŞTİRİLMEDİ. Proje uydurulmadı; bilinmeyen telefon/adres/sertifika/kişi/tarih eklenmedi.

### 22.6 Teknik doğrulama (hepsi PASS)

`npm run typecheck` ✓ · `npm run lint` 0 hata / 2 önceden bilinen `_locale` uyarısı · `npm run test` 69 dosya / **937/937 PASS** · **`npm run build` BAŞARILI** (Next 16.3.5 Turbopack) — `.next-audit` ayrık dizininde (çalışan dev sunucusu `.next` kullanıyor, etkilenmedi); geçici `distDir` env satırı build sonrası `next.config.ts`'ten kaldırıldı (kalan diff yalnızca çift→tek tırnak Prettier normalizasyonu, semantik yok); geçici `$env:` NEXT_PUBLIC_SITE_URL/NEXTAUTH_SECRET sadece build ortamında, `.env`'e yazılmadı. Dev sunucusu tüm süreç boyunca UP.

### 22.7 Bu oturumun dosyaları

Kod: `src/app/[locale]/{products,collections,applications,projects,journal}/[slug]/page.tsx` (seoTitle→title), `src/app/layout.tsx` (apple kaldırıldı), `next.config.ts` (yalnız tırnak normalizasyonu). Geçici: `.tmp-audit-h2.cjs`, `.tmp-seo-audit.cjs`, `.tmp-live-final.cjs` (kriter düzeltmesi). COMMIT/PUSH YOK; çalışma ağacı korundu; sunucu durdurulmadı; SQL içerik mutasyonu YOK.

### 22.8 Kalan gerçek veri boşlukları (değişmedi)

1. Gerçek yazar adı (KASHA marka adı kullanılıyor) 2. `publicationDate` null 3. Gerçek onaylı proje içeriği 4. Onyx ürünleri 5. Koleksiyon demo kapakları (`demo-collection-*.svg`) + demo proje kaydı (UNPUBLISHED) 6. Slug–ad uyuşmazlıkları + `ege-kahve` (karar: değiştirme) 7. `/apple-touch-icon.png` yerine gerçek ikon üretimi (marka görseli onayıyla).

## PHASE 23 — PRODUCTION READINESS AUDIT (2026-10-23, CLOSED, uncommitted)

### 23.1 Ortam & konfigürasyon

- `.env` (değerler gizli): `DATABASE_URL` ✓, `NEXTAUTH_URL` ✓, `NEXTAUTH_SECRET` ✓ (18 karakter — production'da yeniden üretilecek); **`NEXT_PUBLIC_SITE_URL` YOK** → production build/start `validateEnv` ile reddeder (bilinçli fail-fast). `.env.example` eksiksiz (SITE_URL satırı dahil, placeholder host reddi dokümante). Zorunlu production env seti: `DATABASE_URL` (gerçek prod DB), `NEXT_PUBLIC_SITE_URL` (gerçek domain — uydurulamaz), `NEXTAUTH_SECRET` (`openssl rand -hex 32`); opsiyonel: `SITE_CONTACT_PHONE`/`SITE_WHATSAPP_PHONE`/`SITE_INSTAGRAM_URL`, `ADMIN_COOKIE_SECURE`, `MEDIA_*`, `SEED_ADMIN_PASSWORD` (ilk admin provisioning). Commit edilmiş secret yok (`.env*` gitignored).

### 23.2 Veritabanı operasyonları (Phase 18D-3 altyapısı güncel, doğrulandı)

- `scripts/backup.ps1` (`pg_dump -Fc` → `backups\marble-*.dump`, gitignored) + `scripts/restore.ps1` (`-Force` zorunlu guard) + `package.json`: `backup`/`restore`/`migrate:deploy` ✓. `docs/DEPLOY_RUNBOOK.md` mevcut (build → migrate → start → `/api/health` gate → backup/restore/rollback → admin provisioning). `npx prisma migrate status`: **3 migrations, up to date, pending yok**. Canlı `/api/health` 200 + `database: connected`.

### 23.3 Güvenlik (kod + test kanıtlı)

- **Headers** (`security/headers.ts` + `next-config-headers.test.ts`): CSP prod'da `unsafe-eval` yok (dev'de HMR için var — smoke bunu dev'de bekler), HSTS preload, XFO DENY, nosniff, frame-ancestors none, Referrer-Policy, Permissions-Policy. Canlı: hepsi 200 başlığı olarak görüldü.
- **Admin auth** (`withAdminAuth` + `session.test.ts`/`auth.test.ts`): canlı kanıt — korumasız `GET/POST /api/v1/admin/*` → **401**. Opaque token (random32, SHA-256 hash DB), TTL 12s, server-side rol (DB), inactive user block.
- **Oturum cookiesi**: HttpOnly + SameSite=Lax + Secure (prod default, `ADMIN_COOKIE_SECURE` override).
- **Rate limit** (`rate-limit.ts` + 2 test dosyası): login 5/60s, quote 10/60s, bellek 10k bucket cap, x-forwarded-for last-entry (fail-closed, dokümante trust varsayımı).
- **CSRF**: admin mutasyonlar SameSite=Lax cookie ile korumalı; public quote anonim → rate-limit + zod sunucu tarafı validasyon (canlı: geçersiz/boş payload → **422**, kayıt oluşmaz).
- **Hata yanıtları** (`createApiHandler` + `errors.test`): AppError/Prisma map, beklenmeyen → `InternalError` (stack sadece console.error; canlı 404 yanıtında stack yok, `requestId` var).

### 23.4 Build & UI kapsam

- **Build: BAŞARILI** (Next 16.3.5 Turbopack, `.next-audit` ayrık dizin; geçici `distDir` satırı sonrası kaldırıldı — `next.config.ts` diff'i yalnız tırnak normalizasyonu). `typecheck` ✓ `lint` 0 hata / 2 önceden bilinen uyarı `test` **937/937**.
- **Canlı prod-smoke** (`.tmp-prod-smoke.cjs`): **37/37 PASS** — health, güvenlik başlıkları, admin 401 (GET+POST), quote 422 validasyon, stack-sızıntısız 404, TR/EN akışları (ana sayfa, katalog, ürün detay, koleksiyon list+detay, uygulama, journal list+detay, iletişim, teklif), mobil nav markup.
- **UI kapsamı**: vitest bileşen testleri ana sayfa (Homepage), katalog (Product/Collection/Application), journal, QuoteForm, ContactBar, Forms, MobileMenu, Layout/Shell, Media kapsıyor. Mobil davranış testleri (MobileMenu.test) + breakpoint CSS mevcut; **görsel mobil doğrulama ve gerçek cihaz matrisi otomasyon dışı** (Playwright kurulmadı — Phase 19 kararı ertelenmiş). Phase 22 SEO audit'i (330 PASS) bu oturumda da geçerli.

### 23.5 Eksikler (operatör/gerçek veri — kod tarafı hazır, uydurulmadı)

1. Gerçek production domain (`NEXT_PUBLIC_SITE_URL`) 2. Gerçek `NEXTAUTH_SECRET` + prod DB URL 3. Marka ikonları (favicon var; apple-touch/logo paketi yok) 4. İletişim bilgileri (`SITE_CONTACT_PHONE`/WhatsApp/Instagram unset → bar non-link, bilinçli) 5. Onyx ürünleri (0) 6. Koleksiyon gerçek kapakları (`demo-collection-*.svg`) 7. Gerçek proje içerikleri (proje bölümü noindex) 8. Gerçek yazar + `publicationDate` 9. İlk prod admin (`SEED_ADMIN_PASSWORD` akışı runbook §5).

### 23.6 Düzeltme yapılan yer

Kod düzeltmesi YOK (smoke FAIL'lerinin 4'ü de hatalı test beklentisi: dev'de `unsafe-eval` HMR için bilinçli; ValidationError = 422 tasarım; `/en/applications/otel` → doğru EN slug'ları residential/hospitality/commercial). Geçici dosyalar: `.tmp-prod-smoke.cjs` eklendi; `.next-audit/` build çıktısı duruyor (silinmedi). COMMIT/PUSH YOK; dev sunucusu tüm süreç boyunca UP; SQL içerik mutasyonu YOK.

### 23.7 KARAR: **READY WITH BLOCKERS**

Kod/altyapı production'a hazır (build, güvenlik, SEO, sağlık, yedek/geri yükleme, migration, runbook). Yayına çıkış için operatör tamamlamaları şart: (1) gerçek domain + secret + prod DB env, (2) gerçek işletme verisi (iletişim, ikon, Onyx, kapaklar, proje, yazar/tarih), (3) ilk admin provisioning, (4) gerçek cihaz/QA onayı. Engeller ve çözümleri §23.5'te somut adımlarla listelendi.

## PHASE 24 — FINALIZE, DOCUMENT & PUSH (2026-10-23, CLOSED, PUSHED)

### 24.1 Yapılan işlemler

1. Durum doğrulama: HEAD `3849732`, branch `master`, origin `https://github.com/KayraSacakli/marble-platform.git`; worktree40 modified + ~70 untracked (Phase 18-22 artıkları) sınıflandırıldı.
2. `.gitignore` güncellendi: `.tmp-*` ve `/.next-audit/` kalıpları eklendi (session audit geçici dosyaları — commit dışı, çalışma ağacında silinmedi).
3. **Kalite kapısı (güncel kod üzerinde, hepsi PASS)**: `typecheck` ✓ · `lint` 0 hata / 2 önceden bilinen uyarı (`repositories/content.ts:328,541`) · `test` **937/937** (69 dosya) · **build BAŞARILI** (Next 16.3.5 Turbopack, `.next-audit` ayrık dizin; geçici `distDir` satırı sonra kaldırıldı) · canlı prod-smoke **37/37 PASS** (`.tmp-prod-smoke.cjs`) · `/api/health` 200.
4. Staging: **55 dosya** — Phase 18-22 modified kodu (SEO, locale sayfaları, journal, JsonLd, ProductGallery, useScrollVideo, contact-bar/site-contact/seo-text yeni modülleri + testleri), `scripts/enrich-content.ts`, `content-import/name-registry.json` (onay kayıtları) + `teos-green.json` (onaylı içerik kaynağı), `public/videos/scrollroll2.mp4` (kullanılan hero asset, 2,52 MB), docs (SESSION_HANDOFF, HANDOFF_CURRENT, SESSION_HANDOFF_2026-10-10), `.gitignore`.
5. **Secret taraması: temiz** (staged diff'te DB credential/private key/token/API key deseni 0; `.env` staged değil; `.env*` gitignored).

### 24.2 Commit & push

- **Commit: `26f7511` — `chore: finalize project state and deployment handoff`** (55 dosya, +2981/−151).
- `git fetch origin` → remote'ta localde olmayan commit **yok** (fast-forward güvenli) → `git push origin master` → **`3849732..26f7511 master -> master`**.
- Doğrulama: `master...origin/master` eşit (ahead/behind0), `origin/master` = `26f7511`. **PUSH BAŞARILI.**
- Takip docs commit'i: **`3fa1982` — `docs: add phase 24 finalize and push handoff`** (bu bölüm) → push `26f7511..3fa1982`; nihai `origin/master` = **`3fa1982`**, master eşit.

### 24.3 Commit dışı bırakılanlar (çalışma ağacında duruyor, silinmedi)

| Dosya/lar | Neden |
|---|---|
| `.tmp-*` (40+ audit script/çıktı) | Geçici denetim dosyaları; `.gitignore`'a eklendi |
| `.next-audit/` | Ayrık build çıktısı (dev `.next`'ü korumak için); gitignore'landı |
| `content-import/` enrichment/import/pilot/new-products `*.json` + `*.report.json` (14 dosya, ~610 KB) | Import/zenginleştirme çalışma çıktıları (yeniden üretilebilir); Phase 19B'de bilinçli olarak commit edilmemişti |
| `public/videos/scrollroll.mp4` (2,85 MB) | Kullanılmayan eski asset (kodda yalnız `scrollroll2.mp4` referanslı) |
| `backups/`, `storage/`, `.env` | Zaten gitignored (dump/medya/secret) |

### 24.4 Doküman durumu

- `docs/SESSION_HANDOFF.md`: Phase 19B→24 tümü mevcut (bu bölüm eklendi). UTF-8 dosyada eski bölümlerin bir kısmı terminalde bozuk görünüyor (Phase 20-22 yazımlarının escape karakterleri) — GitHub'daki render doğru; dosya yeniden yazılmadı (içerik kaybı riski yok, git diff'inde temiz).
- `docs/DEPLOY_RUNBOOK.md`: güncel (Phase 18D-3) — Phase 24'te değişen operasyon yok; çoğaltma yapılmadı.

### 24.5 Dev sunucusu & kapanış

- `localhost:3000` **tüm oturum boyunca UP** (health 200); durdurulmadı. Bilgisayar kapatılınca süreç doğal sonlanır — yeni oturumda `npm run dev` yeniden başlatılır.
- Geçici dosyalar (`.tmp-*`, `.next-audit/`, content-import çıktıları, `scrollroll.mp4`) çalışma ağacında bırakıldı — bilerek silinmedi.

### 24.6 Production engelleri (Phase 23.5 — sahibi: operatör/Content Owner)

1. Gerçek domain → `NEXT_PUBLIC_SITE_URL` (build öncesi; runbook §1) 2. Prod `DATABASE_URL` + güçlü `NEXTAUTH_SECRET` 3. `SITE_CONTACT_PHONE`/`SITE_WHATSAPP_PHONE`/`SITE_INSTAGRAM_URL` 4. Marka ikonları 5. Onyx ürünleri + gerçek koleksiyon kapakları 6. Onaylı proje/yazar/`publicationDate` 7. İlk admin (`SEED_ADMIN_PASSWORD` ≥12, runbook §5). Bunların hiçbiri depoya yazılmadı/yazılmayacak.

### 24.7 Kapanış öncesi (bilgisayar kapatılmadan)

1. Bu oturumdaki opencode/terminal oturumları kapatılabilir; commit `26f7511` GitHub'da ✓. 2. Dev sunucusu süreç olarak ölebilir — sorun değil. 3. `.tmp-*` / `.next-audit/` / content-import çıktıları silmek istenirse elle; disk alanı ~7 MB + ~610 KB.

### 24.8 CONTINUATION POINT (yeni terminalde)

Depo `origin/master` = `26f7511`, temiz başlangıç noktası. Dev sunucusu yoksa: `npm run dev` (sonra `node .tmp-prod-smoke.cjs` ile37 kontrol). Sıradaki işler için hazır backlog: (a) production engel kapatma (§24.6 değerleri geldiğinde: `.env` + runbook §1-§5 adımları), (b) gerçek cihaz/QA matrisi (Playwright kurulumu — Phase 19 ertelenmiş kararı), (c) gerçek içerik enrichment'i (content-import çıktıları `scripts/enrich-content.ts` ile). İlk komut: `git pull origin master && npm install && npm run dev`.
