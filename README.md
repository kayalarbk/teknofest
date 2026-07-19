# 🛸 SwarmTech — Konu Haritası

Teknofest 2027 dron sürüsü ekibinin (Barış, Salih, Furkan) interaktif öğrenme yol haritası.
Vanilla HTML/CSS/JS; GitHub Pages'te sunucusuz çalışır.

## Nasıl güncellenir?

**Tek doğruluk kaynağı `data/curriculum.json`.** Siteye içerik eklemek için kod değiştirmeye gerek yok:

- **Yeni konu:** İlgili fazın `topics[]` (veya Faz 2'de `tracks[].topics[]`) dizisine
  `{ "id", "title", "items", "doneWhen", "resources" }` ekle. Sayfa yenilenince görünür.
- **`doneWhen` zorunlu sayılır** — ilerleme yüzdesi işaretlenen `doneWhen` sayısından hesaplanır;
  `doneWhen`'i olmayan konu ilerlemeye katılmaz.
- **Sorumlu atamak:** Konuya `"owner": "Barış"` ekle → kartta rozet çıkar, kişi filtresi ve
  "Bu Hafta" paneli onu listeler. Ekip listesi `meta.members` dizisinde.
- **Milestone:** `milestones[]` dizisine `{ "id", "phase", "label", "target", "criteria" }` ekle;
  ilgili fazın altına çapa olarak yerleşir.
- **Haftalık günlük:** `data/logs.json`'a `{ "date", "author", "text" }` ekle.

## İlerleme kaydı

İlerleme tarayıcıda `localStorage`'da tutulur (kişisel, cihaza özel). Anahtarlar:
`swarm-map-progress` (doneWhen + milestone işaretleri), `swarm-theme` (tema).

## Yerelde çalıştırma

`fetch` yüzünden `file://` ile açılmaz; bir sunucu gerekir:

```
python -m http.server
# http://localhost:8000
```
