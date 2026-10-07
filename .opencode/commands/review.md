---
description: git diff incelemesi — plan agent'ı, edit kapalı
agent: plan
---

Depodaki commit edilmemiş değişiklikleri incele (edit/yazma iznin yok, salt-okunur analiz):

1. `git status` ve `git diff` çalıştır (izinli)
2. Her değişiklik için:
   - Ne değişmiş, neden
   - Kök neden sorunu var mı (belirti yaması mı, gerçek fix mi)
   - `docs/00_PROJECT_RULES.md` ihlali var mı (uydurma veri, tr+en eksikliği, kapsam dışı)
   - Test/typecheck etkisi
3. Riskli bulguları önem sırasına göre numaralı listele, sonra öneriler.

Sonuç yoklaması:!`git status --porcelain`!`git diff --stat`
