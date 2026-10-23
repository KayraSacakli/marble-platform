# HANDOFF_CURRENT — marble-platform

Generated: 2026-10-10. Bu dosya mevcut oturumun devir kaydıdır. Kaynak: repository çalışma ağacı + bu oturumda çalıştırılan komutların çıktıları. Faz geçmişi için `docs/SESSION_HANDOFF.md` (2026-10-07, Phase 19A) ve tarihli kapanış için `docs/SESSION_HANDOFF_2026-10-10.md` (Phase 20C kapanışı) ayrıca okunmalı.

---

## 1. PROJE DURUMU VE MİMARİ

- **Stack**: Next.js 16.3.5 (App Router, Turbopack) + React 19 + TypeScript strict + Prisma 6.19.3/PostgreSQL (`localhost:5432/marble_platform_dev`) + Zod v4. Vitest 5, ESLint 9.
- **Dal**: `master`. Son commit: `3849732 feat(content): add phase 19B content import foundation`.
- **Faz durumu**: Phase 17/18/19A/19B kapalı. Phase 20A (scroll-roll videosu hero'ya entegre) ve **Phase 20C (scroll easing + hover zoom + ContactBar) tamamlandı** — kod yazıldı, doğrulandı ama **hiçbiri commit edilmedi**. Phase 20B (42 ürün enrichment/import) hazır ve dry-run'lı; DB'ye **aktarılmadı**, `--execute` onayı bekliyor.
- **Mimari**: route → service → repository → Prisma. `src/app/api/v1/admin/` (authenticated CRUD), `src/app/api/v1/public/` (locale public), `src/admin/` (admin UI), `src/app/[locale]/` (public UI).
- **Doğrulama sırası**: `npm run typecheck` → `npm run lint` → `npm run test`. Üçü de PASS olmadan iş bitmiş sayılmaz. CI yok.
- **Çalışan süreç**: Kullanıcıya ait `next dev` **port 3000'de** çalışıyor (log: `%TEMP%\opencode\dev3000.log`). **Durdurmayın/yeniden başlatmayın.** Hot reload ile değişiklikler canlıya yansır.
- **Kurallar**: `AGENTS.md` (repo kökü) + `docs/00_PROJECT_RULES.md` bağlayıcı. Kod değiştirmeden önce numaralı teşhis raporu + onay. Commit/push yalnız açık istekle. `.opencode/` altında `commands/` + kendi `package.json`'ı var (opencode yapılandırması, proje koduyla ilgisi yok).
- **CLAUDE.md**: `@AGENTS.md` include — aynı kurallar geçerli.

---

## 2. SON TAMAMLANAN AŞAMA: PHASE 20C (2026-10-10)

### 2.1 Scroll video easing (`src/hooks/useScrollVideo.ts`)
- Ham scroll oranı doğrudan `currentTime`'a yazılmıyor; **lerp tabanlı easing** (katsayı **0.14**, settle epsilon **0.0004**, time-write epsilon **1/48**) hedefe yumuşak ilerliyor.
- RAF döngüsü **olay tetikli** (scroll/resize/metadata); hedefe ulaşınca duruyor → boşta CPU ~0 (eskisi sürekli döngüydü).
- Metadata geldiğinde mevcut scroll konumuna snap; `prefers-reduced-motion`, hata ve poster fallback davranışları aynen korundu; `HeroScrollStage`'e dokunulmadı.

### 2.2 Aktif hero videosu
- **Aktif: `public/videos/scrollroll2.mp4`** (2 523 217 B, 1028×768, ~5.9s, sessiz H.264) — `src/services/content.ts:910` içinde `/videos/scrollroll2.mp4`.
- `public/videos/scrollroll.mp4` (2 852 302 B) de korunuyor.
- `showroom.mp4` karşılaştırma sayfası repoda **yok** (silinecek bir şey oluşmadı; istenirse sonraki fazda).

### 2.3 Ana sayfa bölüm akışı (doğrulandı)
`hero → featured_products (3 gerçek DB ürünü) → featured_collections → featured_applications → quarry_factory → featured_projects → featured_journal → final_cta`. Tüm bölümler canlı veriyle dolu; boşta bölüm servis katmanında zaten atlanıyor.

### 2.4 Ürün kartı hover zoom (`src/styles/components/product.css:87-92`)
- `scale(1.02)` → **`scale(1.04)`**, **260ms ease-out** (istemelenen 1.03–1.05 / 200–300ms aralığında). Hem ana sayfada hem ürünler listesinde geçerli.
- `translateY(-2px)` hafif kaldırma korundu (layout kayması yok). `.card-link-overlay:focus-visible` durumunda da aynı zoom; `prefers-reduced-motion` altında tamamen kapanıyor.

### 2.5 Call / WhatsApp ContactBar
- **Yeni**: `src/lib/site-contact.ts` (sunucu tarafı env okuma, `getSiteContact()`), `src/components/contact/ContactBar.tsx` (client, sunucudan prop alır, tr/en etiket ve mesaj), `src/styles/components/contact-bar.css` (mobil alt bar + safe-area, masaüstü köşe pill'leri, `z-index: var(--z-index-sticky)`=50, `body:has()` padding).
- `src/app/[locale]/layout.tsx:87` — Footer'dan sonra `<ContactBar locale={locale} contact={getSiteContact()} />`. Admin layout'u etkilenmiyor.
- **Uydurma numara YOK.** Bar ancak gerçek numara env'e girilince görünür (aşağıya bak).

### 2.6 Doğrulama (bu oturumda)
- `npm run typecheck` → **0 hata**.
- `npm run lint` → **0 hata**, 2 eski warning: `src/repositories/content.ts` 328/541 `_locale` unused (baseline).
- `npm run test` → **931 test PASS** (9'u yeni: `site-contact` + `ContactBar`).
- Canlı (port 3000, sunucu yeniden başlatılmadı): `/tr`, `/en`, `/api/v1/public/tr/products`, `/videos/scrollroll2.mp4`, `/videos/scrollroll.mp4` → **hepsi 200**; TR sayfasında `scrollroll2` hero'da mevcut; `contact-bar` markup'ı env yokken **gizli** (doğrulandı).

---

## 3. YAPILANDIRILMASI BEKLEYEN İLETİŞİM BİLGİLERİ

`SITE_CONTACT_PHONE` ve `SITE_WHATSAPP_PHONE` `.env`'de **tanımlı değil** (bu oturumda kontrol edildi). Bar bu yüzden henüz görünmüyor.

- `SITE_CONTACT_PHONE`: gerçek telefon numarası verilmedi → `getSiteContact()` null döner, ContactBar render edilmez.
- `SITE_WHATSAPP_PHONE`: farklı numara kullanılacaksa opsiyonel; verilmezse `SITE_CONTACT_PHONE`'a düşer.
- **Numara uydurma veya örnek numara `.env`'e YAZMA.** Yalnızca kullanıcının sağladığı gerçek numara girilir.
- Numara geldiğinde yapılacak iş: `.env`'e `SITE_CONTACT_PHONE=+90 5XX XXX XX XX` ekle (sunucu tarafı, `NEXT_PUBLIC_` gerekmez), gerekirse `SITE_WHATSAPP_PHONE` ekle, dev sunucu hot-reload ile algılar, `/tr` ve `/en`'de Ara/WhatsApp butonlarının göründüğünü ve tel:/wa.me linklerinin doğru olduğunu doğrula, typecheck/lint/test tekrarla.

---

## 4. PHASE 20B İÇİN BEKLEYEN KARARLAR

Bu kararların **hiçbiri verilmedi**. Ürün içe aktarma ve veritabanına toplu yazma **yapılmadı**.

1. **`visne` ↔ `rosso levanto` eşleştirmesi** — klasör adı ("vısne", U+0131) ile mevcut DB slug'ı/registry eşleşmesi tutarsız; kullanıcı onayı gerekiyor.
2. **`hermes gray` ve `hermesgray` kayıtlarının birleştirilip birleştirilmeyeceği** — ana görsel hash'leri aynı olsa da render dosyaları farklı; kullanıcı onayı olmadan birleştirme.
3. **Review gerektiren 9 ürünün incelenmesi** — enrichment dry-run'da `REVIEW_REQUIRED` (yalnız imageProfile/DB kanıtı, ad kanıtsız). Content Owner onayı + name-registry doldurulması bekleniyor.
4. **Ürün aktarımı için açık `import --execute` onayı** — `content-import/import.full.json` (32 ürün, 56 medya) dry-run geçti (`DRY RUN OK`), DB'ye aktarılmadı.

Ek durum: `content-import/enrichment.pending.json` (akhisarbej + visne) slug/folder mismatch hatalarıyla **kasıtlı olarak bloklu** (korumа mekanizması). `content-import/import.full.json` yalnızca mevcut 5 slug'ı (`alexander-black`, `pietragrey`, `visne`, `akhisarbej`, `afyonfire`) değiştirmeden üzerine yazmayı hedefliyor.

---

## 5. DEĞİŞTİRİLEN VE OLUŞTURULAN DOSYALAR (tümü commit edilmemiş)

**Değiştirilmiş (git `M` — 14 dosya):**
| Dosya | Değişiklik |
|---|---|
| `package.json` | +`enrich:content` script (19B) |
| `src/services/content.ts` | 5 liste metodu → satır `v` (primaryImage fix) + hero media (`scrollroll2.mp4`) |
| `src/components/product/ProductGallery.tsx` | contain + sizes 50vw |
| `src/styles/components/product.css` | hero contain fix + **hover zoom 1.04/260ms** |
| `src/app/[locale]/globals.css` | +contact-bar.css import |
| `src/app/[locale]/layout.tsx` | +ContactBar render |
| `src/hooks/useScrollVideo.ts` | **lerp easing + event-driven RAF (20C)** |
| `src/__tests__/services/content-public-gates.test.ts` | +124 satır |
| `src/__tests__/components/Product.test.tsx` | +11 (gallery contain/sizes) |
| `src/__tests__/api/v1/public/{products,collections,applications,projects,journal}.test.ts` | primaryImage/cover/hero assertion |

**Oluşturulmuş (git `??` — 21 kayıt, bazıları dizin):**
| Dosya | İçerik |
|---|---|
| `scripts/enrich-content.ts` | PHASE 19B dry-run validator |
| `src/__tests__/scripts/enrich-content.test.ts` | 34 test |
| `content-import/enrichment.pilot.json` (+ `.report.json`, `.pre-seo.json`) | 5 pilot ürün (19B) |
| `content-import/enrichment.full.json` (+ `.report.json`) | **42 ürün** enrichment (20B dry-run) |
| `content-import/import.full.json` (+ `.report.json`) | 32 ürün import şablonu (20B dry-run) |
| `content-import/enrichment.pending.json` (+ `.report.json`) | akhisarbej + visne bloklu |
| `content-import/name-registry.json` | boş onaylı ad registry |
| `content-import/pilot.json` + `pilot.report.json` | 19B şablon (ÖRNEK/placeholder — gerçek içerik DEĞİL) |
| `content-import/products.json` + `products.report.json` | eskiden kalan placeholder ("Örnek Mermer") |
| `content-import/media/ornek-gorsel.png` | 70 byte placeholder (eski) |
| `public/videos/scrollroll.mp4` (2 852 302 B) + `scrollroll2.mp4` (2 523 217 B) | hero videoları |
| `src/lib/site-contact.ts` | env'den telefon okuma (20C) |
| `src/components/contact/ContactBar.tsx` | Ara/WhatsApp bar (20C) |
| `src/styles/components/contact-bar.css` | bar stilleri (20C) |
| `src/__tests__/lib/site-contact.test.ts` | 5 test |
| `src/__tests__/components/ContactBar.test.tsx` | 4 test (jsdom) |
| `docs/HANDOFF_CURRENT.md` | bu dosya |

**Kaynak dosyalara/DB'ye write: YOK.** Hiçbir kaynak görsel/video silinmedi, taşınmadı, düzenlenmedi. Import yalnız `dry-run`; DB'ye hiçbir write yapılmadı.

---

## 6. ÇALIŞTIRILAN KOMUTLAR VE GERÇEK SONUÇLAR (20C oturumu)

| Komut | Sonuç |
|---|---|
| `git status --short` / `git log -1 --oneline` | 14 M + 21 ?? (yukarıdaki); hiçbir şey staged değil; son commit `3849732` |
| `npm run typecheck` | **0 hata** |
| `npm run lint` | **0 hata**, 2 eski warning (`content.ts` 328/541 `_locale`) |
| `npm run test` | **931/931 PASS** (922 → 931; +9 ContactBar/site-contact) |
| `npx vitest run ContactBar + site-contact` | 9/9 PASS (ContactBar için `// @vitest-environment jsdom` gerekli) |
| HTTP HEAD `/tr` `/en` `/api/v1/public/tr/products` `/videos/scrollroll2.mp4` `/videos/scrollroll.mp4` | **hepsi 200** |
| `Select-String .env -Pattern 'SITE_CONTACT\|SITE_WHATSAPP'` | **eşleşme yok** (numara tanımlı değil) |
| `npm run build` | **Bu oturumda ÇALIŞTIRILMADI.** Bilinen eski blocker: `.env` prod validation (`NEXT_PUBLIC_SITE_URL` boş + `NEXTAUTH_SECRET` placeholder) → üretim rebuild mümkün değil; dev sunucu `next dev` ile çalışıyor. |

Bilinen sahte LSP hataları: `@/...` alias çözümü olmadığı için test dosyalarında "Cannot find module" — typecheck geçiyorsa gerçek değil. `toHaveTextContent` Hatası da sahte.

---

## 7. PHASE 20B ARAŞTIRMA BULGULARI (önceki oturumdan, hâlâ geçerli)

- **Ürün klasörleri**: `C:\Users\Kayra\Desktop\Marble Content\Products\` → 45 klasör (afyonfire … ıceberg). `productshot-result` bir ürün klasörü olmayabilir; `calacatta green`/`yellowıceberg`'in önceki engeli: product görseli yoktu (PRIMARY gate).
- **Video kaynağı**: `C:\Users\Kayra\Desktop\Scroll Roll\` — `scrollroll.mp4`, `scrollroll2.mp4`, `fabrika.mp4`, `showroom.mp4`. İlk ikisi `public/videos/`'a kopyalandı (hash doğrulandı); kaynak değiştirilmedi.
- **DB durumu**: enrichment.full (42) ve import.full (32) dry-run'lı; pilot 5 ürünün DB'deki varlığı `import.full.report.json` içinde doğrulandı (existing-5 update planı). 8 demo ürün (seed) varlığı da doğrulanmalı.
- **ffprobe/ffmpeg yok** → video codec/süre bilgisi `npx ffprobe-static` ile alındı (izinli); sistem-wide araç kurulu değil.

---

## 8. TANIMLANMIŞ RİSKLER / AÇIK KONULAR

1. **Commit edilmemiş 14 M + 21 ??** — dört ayrı iş paketi var (liste fix, galeri fix, enrichment sistemi, 20C UI). İstenirse ayrı commit'lerle ayrılabilir. **Onaysız commit/push YOK.**
2. **`npm run build` doğrulanmadı** — bilinen env blocker (`NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_SECRET` placeholder) gerçek kod hatasından ayrılmalı. Hassas değer rapora yazılmamalı.
3. **Bej boşluk kaynağı bilinmiyor** — kaynak görselde gömülü mü, CSS/container oranı mı, teşhis edilmedi. Görsel değişikliği için "çözünürlük/oran korunarak türev üret, orijinali sakla" kuralı geçerli.
4. **ContactBar canlıda görünmüyor** — gerçek numara yok; uydurma yasak. Kullanıcıdan numara bekleniyor.
5. **name-registry boş** — tüm adlar klasör kanıtıyla (FOLDER_DERIVED). Content Owner onayı için registry doldurulmalı.
6. **Rate limit**: admin login 5/60sn — import execute toplu istekte bunu aşabilir (import-content.ts mevcut davranışına bakılmalı).
7. `content-import/products.json`, `pilot.json` ve `*.report.json` geçici/yedek dosyalar — temizlenebilir ama önce kullanıcıya sor.

---

## 9. YARIN İÇİN AÇIK DEVAM TALİMATI

1. Yeni terminalde `D:\marble-platform` dizinine geç.
2. `docs/HANDOFF_CURRENT.md` ve `docs/SESSION_HANDOFF_2026-10-10.md` dosyalarını oku.
3. `git status --short` ile çalışma ağacını yeniden kontrol et.
4. Kullanıcıya kısa bir özet ver: son tamamlanan aşama (Phase 20C), mevcut durum (14 M + 21 ?? commit'siz) ve bekleyen kararlar (visne eşleşmesi, hermes merge, 9 REVIEW ürün, import --execute, telefon numarası).
5. Kullanıcının onayını almadan ürün importu, veritabanı toplu güncellemesi, commit veya push yapma.
6. İlk olarak kullanıcıyla hangi bekleyen işten devam edileceğini netleştir.

---

## 10. DUYARLI BİLGİLER

Bu dosyaya şifre, API anahtarı, token veya `.env` değerleri **yazılmamıştır**. Admin giriş bilgileri seed/`.env` içindedir; değerleri burada tekrarlama. Raporlarda gizli bilgi paylaşma. Gerçek telefon numarası da henüz hiçbir yere yazılmadı (env tanımsız).
