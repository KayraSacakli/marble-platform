---
description: typecheck + lint + test çalıştır ve RAPORLA (düzeltme, onay bekle)
agent: plan
---

Doğrulama sırasını çalıştır ve sonuçları raporla. **Hiçbir kodu değiştirme.**

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test`

Her adım için raporla:
- Durum: PASS / FAIL
- Hata varsa: dosya/satır, kısa kök neden analizi, önerilen çözüm (madde madde numaralı)

İzinli tek otomatik aksiyon: lint/format auto-fix (`eslint --fix`, `prettier --write`). Onun dışındaki hiçbir düzeltmeyi uygulama; onayımı bekle.

Sonuç yoklaması:!`npm run typecheck`!`npm run lint`!`npm run test`
