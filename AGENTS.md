<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# marble-platform

Next.js 16 (App Router, Turbopack) + React 19 + TypeScript (strict) + Prisma 6/PostgreSQL + Zod. Vitest 5, ESLint 9, Prettier. Public bilingual (tr/en) marble showcase + authenticated admin CMS.

## Doğrulama sırası (CI yok — commit öncesi son savunma hattı)

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test`

Üçü de PASS olmadan iş tamamlanmış sayılmaz.

## Mimari

- `src/app/api/v1/admin/` — authenticated admin CRUD
- `src/app/api/v1/public/` — public locale endpointleri
- `src/app/admin/` — admin UI, `src/app/[locale]/` — public UI
- `src/lib/` — `auth`, `seo`, `validation`, `api`, `security`, `media`, `data`, `env.ts`, `prisma.ts`
- Katman düzeni: route → service → repository → Prisma. Frontend'de hardcoded ürün verisi yasak.
- `prisma/` — schema + seed; `docs/` — proje bilgisi (aşağıya bak)

## Zorunlu okuma

Kod değiştirmeden önce `docs/00_PROJECT_RULES.md` oku. Bağlayıcı kurallar orada: uydurma iş/veri yok, tr+en lokalizasyon zorunlu, içerik onay akışı (Draft→Approved→Published), SEO/URL yaşam döngüsü kuralları, V1 kapsamı (e-ticaret yok).

## Çalışma düzeni

1. Kod değiştirmeden ÖNCE numaralı teşhis raporu ver. Her madde için: kök neden, dosya/satır, önerilen çözüm, kapsam dışı bırakılanlar.
2. Onayımı bekle.
3. Onaydan sonra uygula.
4. Düzeltmeden önce `npm run typecheck && npm run lint && npm run test` ile doğrula.
