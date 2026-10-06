# DEPLOY RUNBOOK — marble-platform

Phase 18D-3. One-page operational runbook: build → migrate → start → health check →
backup/restore → rollback → admin provisioning. Target: single-instance production
deployment of the Next.js 16 (App Router) app with a PostgreSQL database.

---

## 1. Required production environment

The app **fails fast at `next build` and `next start`** when production env is invalid
(`src/lib/env.ts`, wired in `next.config.ts`). All problems are reported in one
aggregated error. In `next dev` validation is a no-op, so the local workflow is
untouched.

| Variable | Requirement |
|---|---|
| `DATABASE_URL` | `postgres://` or `postgresql://` URL, reachable from the host |
| `NEXT_PUBLIC_SITE_URL` | Absolute `http(s)` origin of the deployment (e.g. `https://www.yourdomain.com`). Placeholder hosts (`example.com`, …) are rejected. Used for canonical URLs, sitemap, hreflang, metadataBase and build-time prerender fetches. Local builds may use `http://localhost:3000`. |
| `NEXTAUTH_SECRET` | Not a documented placeholder, ≥ 16 characters (generate: `openssl rand -hex 32`) |
| `SEED_ADMIN_PASSWORD` | Only for admin provisioning (Section 6); ≥ 12 characters |

Never commit `.env` (gitignored via `.env*`). Copy `.env.example` on the server and
fill real values.

> **Set `NEXT_PUBLIC_SITE_URL` before `npm run build`.** It is inlined at build time
> into the prerendered output (`sitemap.xml`, `robots.txt`, canonical/hreflang) *and*
> used as the server-side API base URL for prerender fetches. Changing it only at
> `npm start` does not correct URLs already baked into the build.

## 2. Deploy procedure

```powershell
# 1. Install dependencies (postinstall runs `prisma generate`)
npm ci

# 2. Apply database migrations (prisma/migrations/*)
npm run migrate:deploy

# 3. Build (NODE_ENV=production → env validation runs and must pass)
npm run build

# 4. Start
npm start           # listens on PORT (default 3000)

# 5. Health check (deploy gate)
curl -f http://localhost:3000/api/health
# 200 {"status":"ok",...,"database":"connected"}  → healthy
# 503 {"status":"error",...,"database":"disconnected"} → NOT healthy, roll back
```

`GET /api/health` returns **200 only when the database is reachable** and 503
otherwise — use it as the deployment probe and for the platform's restart policy.

## 3. Backup

```powershell
npm run backup
# → backups\marble-YYYYMMDD-HHmmss.dump   (pg_dump custom format, -Fc)
```

- Script: `scripts/backup.ps1` (resolves `pg_dump` from PATH or
  `C:\Program Files\PostgreSQL\*\bin`, reads `DATABASE_URL` from env or `.env`).
- The `backups/` directory is gitignored — never commit dumps.
- Recommended: schedule `npm run backup` before every deploy and daily in
  production. Keep copies off-box.

## 4. Restore (destructive)

```powershell
# Restore over the DATABASE_URL database (overwrites current data!):
npm run restore -- -File backups\marble-YYYYMMDD-HHmmss.dump -Force

# Restore into a separate database (verification / rehearsal):
createdb marble_platform_restore_test
npm run restore -- -File backups\marble-YYYYMMDD-HHmmss.dump -Force `
  -TargetDatabaseUrl "postgresql://USER:PASS@localhost:5432/marble_platform_restore_test"
dropdb marble_platform_restore_test
```

- Script: `scripts/restore.ps1`. `-Force` is mandatory (restore is destructive);
  existing objects in the target are dropped (`--clean --if-exists`).
- The target database must already exist.
- **Rehearsal status: performed twice** — Phase 18D-3 and again during the Phase 18D-6
  final sweep (2026-10-06): fresh dump → restore into `marble_platform_restore_test`
  → row-count verification (6/6 tables identical) → `dropdb`. The destructive guard
  (`-Force` required) is re-verified each time.

## 5. Rollback

1. Stop the app (`Ctrl+C` / service stop).
2. Deploy the previous known-good build artifact and restart it.
3. Schema: `prisma migrate deploy` is forward-only. To revert a bad migration,
   restore the pre-deploy backup (Section 4) — this is why Section 3 runs before
   every deploy. Never hand-edit production tables.
4. Re-run the health check (Section 2 step 5) before announcing success.

## 6. Production admin provisioning

- Development: seed creates `admin@marble-platform.local` /
  `editor@marble-platform.local` with `SEED_ADMIN_PASSWORD` (min 12 chars) or the
  documented dev default.
- **Production**: the dev default is **never** used. With `SEED_ADMIN_PASSWORD`
  unset or shorter than 12 chars, seed **skips** admin creation entirely (no known
  credential can ever be created or silently reset) — a fresh production database
  then has no admin account.
- To provision the admin/editor accounts deliberately:

  ```powershell
  $env:SEED_ADMIN_PASSWORD = "<strong random password, min 12 chars>"
  npm run migrate:deploy
  npx prisma db seed
  ```

- Safety guard: seed **aborts** when `DATABASE_URL` contains `prod` or
  `production` (substring check, `prisma/seed.ts checkEnvironment`) — it refuses to
  seed content into anything that looks like a production database. If your
  production connection string matches this heuristic, seed will not run by design;
  choose the connection URL/name accordingly or provision content through the admin
  API instead. Login afterwards at `/admin/login`.

## 7. Post-deploy verification checklist

- [ ] `GET /api/health` → 200, `database: connected`
- [ ] `/tr`, `/en` public pages → 200 with real content (not a baked 404)
- [ ] A missing slug (e.g. `/en/products/does-not-exist`) → 404
- [ ] `sitemap.xml` and page canonical/hreflang URLs use the real
      `NEXT_PUBLIC_SITE_URL` domain (not `example.com`)
- [ ] Backup from Section 3 exists for this deploy
- [ ] `git ls-files` contains no `.env` file (no committed secrets)
