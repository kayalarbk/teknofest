# 🛸 SwarmTech — Teknofest 2027 Sürü Dron Ekibi Web Sitesi Tasarım Dokümanı

> Bu doküman, ekibimizin yol haritasını sergileyen, mühendis ruhumuzu yansıtan ve
> ziyaretçiyi (ve bizi!) motive eden animasyonlu bir web sitesinin tam tasarım
> spesifikasyonudur. Bir geliştiriciye veya yapay zekaya verildiğinde siteyi
> baştan sona inşa edebilecek detay seviyesindedir.

---

## 1. Vizyon ve Amaç

- **Ne:** Teknofest 2027 Sürü İHA yarışmasına hazırlanan 3 kişilik çekirdek ekibin resmi web sitesi.
- **Neden:**
  - Yol haritamızı ve ilerlememizi şeffaf şekilde takip etmek (kendi motivasyonumuz için).
  - Ekibe yeni üye çekmek (2027 öncesi ekip genişlemesi planlanıyor).
  - Sponsor ve danışman hocalara profesyonel bir vitrin sunmak.
- **His / Ton:** Mühendislik + uzay teknolojisi estetiği. Ciddi ama heyecan verici. "Biz bunu yapıyoruz ve yapacağız" enerjisi.

---

## 2. Teknik Altyapı

| Konu | Karar |
|---|---|
| Yapı | Tek sayfalık (single-page) site, vanilla **HTML + CSS + JS** (mevcut ekip becerisiyle uyumlu) |
| Barındırma | GitHub Pages (ücretsiz, ekip zaten kullanıyor) |
| Animasyon | CSS animasyonları + `IntersectionObserver` ile scroll-tetiklemeli animasyonlar + Canvas API (hero'daki sürü animasyonu için) |
| Font | Google Fonts: **Space Grotesk** (başlıklar) + **Inter** (gövde) |
| Dil | Türkçe (isteğe bağlı EN toggle, v2'ye bırakılabilir) |
| Responsive | Mobile-first, kırılım noktaları: 480px / 768px / 1200px |

---

## 3. Renk Paleti ve Tasarım Dili

```css
:root {
  --bg-dark: #0A0E1A;        /* Gece göğü — ana zemin */
  --bg-card: #111827;        /* Kart zeminleri */
  --accent-cyan: #22D3EE;    /* Telemetri/HUD hissi — ana vurgu */
  --accent-orange: #F97316;  /* Teknofest enerjisi — CTA butonları */
  --text-primary: #F1F5F9;
  --text-muted: #94A3B8;
  --grid-line: rgba(34, 211, 238, 0.08); /* arka plan ızgara çizgileri */
  --success: #4ADE80;        /* tamamlanan yol haritası adımları */
}
```

- **Estetik:** Koyu zemin üzerinde ince neon çizgiler, hafif "uçuş kontrol istasyonu / HUD" havası.
- Arka planda sabit, çok soluk bir **mühendislik ızgarası** (grid) deseni.
- Köşeleri hafif yuvarlatılmış kartlar (`border-radius: 16px`), üzerlerinde ince cyan kenar ışıması (`box-shadow: 0 0 20px rgba(34,211,238,0.1)`).

---

## 4. Sayfa Yapısı (Bölüm Bölüm)

### 4.1 Hero — "Sürü Uyanıyor" 🎯

**En kritik bölüm. İlk 3 saniyede etkilemeli.**

- **Arka plan animasyonu (Canvas):** 40–60 adet küçük parlak nokta (dronlar), **Reynolds flocking algoritmasıyla** (separation / alignment / cohesion) gerçek zamanlı hareket eder. Bu hem görsel şölen hem de projenin özünün canlı demosu — "sitemizin arka planı bile bizim algoritmamızla uçuyor" mesajı.
  - Fare imleci bir "hedef nokta" gibi davranır; sürü imlece doğru hafifçe yönelir (etkileşim!).
  - Mobilde parçacık sayısı 25'e düşürülür (performans).
- **Başlık:** `TEKNOFEST 2027` (küçük, turuncu, harf aralıklı) → altında büyük: **"Gökyüzünü Birlikte Kodluyoruz"**
- **Alt metin:** "3 mühendis adayı. 1 sürü. Otonom dron sürüsüyle Teknofest 2027 yolculuğumuz."
- **CTA butonları:** `Yol Haritamız ↓` (cyan, ghost) ve `Ekibe Katıl` (turuncu, dolu).
- **Alt köşede** canlı sayaç: **Teknofest 2027'ye geri sayım** (gün : saat : dakika — JS ile).

### 4.2 Misyon — "Neden Bu Proje?"

- 3 kart yan yana (mobilde alt alta), scroll ile sırayla fade-up animasyonu:
  1. 🧠 **Otonomi** — "İnsan müdahalesi olmadan karar veren dronlar"
  2. 🐦 **Sürü Zekası** — "Tek tek basit, birlikte akıllı"
  3. 🏆 **Teknofest** — "Türkiye'nin en büyük teknoloji sahnesinde"
- Her kartta hover'da ikon hafifçe yükselir + cyan glow artar.

### 4.3 Yol Haritası — Sitenin Kalbi 🗺️

**Dikey zaman çizelgesi (timeline).** Ortadan geçen dikey bir çizgi; adımlar sağ-sol zigzag (mobilde tek kolon). Scroll ettikçe çizgi **cyan renkle dolarak ilerler** (SVG `stroke-dashoffset` animasyonu) — "yol katediyoruz" hissi.

Her adım kartında: durum rozeti (`✅ Tamamlandı` / `🔄 Devam ediyor` / `🔒 Sırada`), tarih aralığı, başlık, 2-3 maddelik özet.

| # | Aşama | Dönem | İçerik |
|---|---|---|---|
| 1 | **Temel Eğitim** | 2026 Q3 | C/C++, Python, Git, Linux temelleri · ROS 2 kavramları |
| 2 | **Simülasyon Dünyası** | 2026 Q3–Q4 | Gazebo + PX4-SITL kurulumu · Tek dron offboard kontrol · MAVLink |
| 3 | **Sanal Sürü** | 2026 Q4 | Çoklu dron spawn · Reynolds flocking implementasyonu · Formasyon uçuşu (sim) |
| 4 | **İlk Gerçek Uçuş** | 2027 Q1 | Pixhawk 6C + RPi4 entegrasyonu · Failsafe & güvenlik protokolleri · Saha testi |
| 5 | **Görü Sistemi** | 2027 Q1–Q2 | OpenCV nesne tespiti · GPS + görüntü füzyonu ile konumlandırma |
| 6 | **Mini Sürü (2-3 dron)** | 2027 Q2 | Dronlar arası haberleşme · Gerçek ortamda koordinasyon testleri |
| 7 | **Teknofest Provası** | 2027 Q2–Q3 | Şartname görev senaryoları · Tam sürü saha provaları · Rapor & sunum |
| 8 | **🏁 TEKNOFEST 2027** | 2027 | Yarışma günü. Gökyüzü bizim. |

> Son adımın kartı özel: turuncu kenarlık + hafif "pulse" animasyonu.

### 4.4 Ekip — "Sürünün Beyinleri" 👥

- 3 üye kartı + 1 adet **"Sen?"** kartı (kesikli kenarlıklı, tıklanınca Ekibe Katıl formuna kayar).
- Her kartta: fotoğraf/avatar, isim, rol (ör. *Uçuş Yazılımı & Gömülü Sistemler*, *Simülasyon & Algoritma*, *Görü Sistemleri & Haberleşme*), 1 satır motto, GitHub/LinkedIn ikonları.
- Hover: kart hafif 3D tilt efekti (JS ile `transform: rotateX/rotateY`, mouse pozisyonuna göre).

### 4.5 Teknoloji Yığını 🔧

- Yatay kayan (marquee) logo/etiket şeridi, sonsuz döngü animasyonu:
  `ROS 2 · Gazebo · PX4 · Pixhawk 6C · Raspberry Pi 4 · MAVLink · OpenCV · Python · C++ · STM32`
- Her etiket hover'da durur ve tooltip'te kısa açıklama gösterir.

### 4.6 İlerleme Günlüğü (Log) 📓

- "Uçuş kayıt defteri" konseptli mini blog listesi: tarih + kısa başlık + 1-2 cümle.
- Terminal estetiği: monospace font, satır başında `>` işareti, yeni girişte yanıp sönen imleç animasyonu.
- Başta statik JSON dosyasından beslenebilir (`logs.json`), CMS gerekmez.

### 4.7 Ekibe Katıl / İletişim 📡

- Kısa ve net form: İsim · Bölüm/Sınıf · İlgi alanı (dropdown: Gömülü / Yazılım / Görü / Mekanik) · Mesaj.
- Form gönderimi: **Formspree** veya `mailto:` fallback (backend yazmadan).
- Yanında motive edici metin: *"Kod yazmayı bilmiyorsan bile öğrenme azmin varsa yerin hazır."*

### 4.8 Footer

- Küçük sürü ikonu, "Marmara Üniversitesi · İstanbul", GitHub org linki, © yılı.
- Easter egg 🥚: Footer'daki dron ikonuna tıklayınca hero'daki sürüye 5 dron daha eklenir.

---

## 5. Animasyon Spesifikasyonları

| Animasyon | Teknik | Detay |
|---|---|---|
| Hero sürü | Canvas + rAF | Reynolds kuralları; her dron: pozisyon, hız vektörü; komşuluk yarıçapı ~60px; max hız sınırı |
| Scroll reveal | IntersectionObserver | `opacity 0→1` + `translateY(24px→0)`, `0.6s ease-out`, kartlar arası 100ms stagger |
| Timeline çizgisi | SVG stroke-dashoffset | Scroll yüzdesine bağlı dolum |
| Sayaç | JS setInterval | Rakam değişiminde flip/fade mikro animasyon |
| Buton hover | CSS | `transform: translateY(-2px)` + glow artışı, `0.2s` |
| Marquee | CSS keyframes | `translateX` sonsuz döngü, `prefers-reduced-motion` desteği ⚠️ |

**Erişilebilirlik:** `prefers-reduced-motion: reduce` medya sorgusunda tüm dekoratif animasyonlar kapatılır; Canvas sürüsü statik bir yıldız desenine döner.

**Performans hedefleri:** Lighthouse ≥ 90 · Canvas rAF ile 60fps · görseller lazy-load · toplam sayfa < 1MB.

---

## 6. Dosya Yapısı

```
swarm-website/
├── index.html
├── css/
│   └── style.css          (tek dosya yeterli; bölüm yorumlarıyla ayrılmış)
├── js/
│   ├── swarm.js           (Canvas flocking animasyonu)
│   ├── timeline.js        (scroll + çizgi dolumu)
│   ├── countdown.js       (Teknofest geri sayımı)
│   └── main.js            (observer'lar, form, easter egg)
├── data/
│   └── logs.json          (ilerleme günlüğü girişleri)
└── assets/
    └── img/               (ekip fotoğrafları, favicon, og-image)
```

---

## 7. Yapılacaklar Sırası (Geliştirme Planı)

1. ☐ İskelet HTML + renk sistemi + fontlar (1 gün)
2. ☐ Hero + Canvas sürü animasyonu (2-3 gün — en eğlenceli kısım, önce bunu yapın, motivasyon 🚀)
3. ☐ Yol haritası timeline + scroll animasyonları (2 gün)
4. ☐ Ekip, teknoloji şeridi, log bölümü (1-2 gün)
5. ☐ Form + responsive düzeltmeler + erişilebilirlik (1 gün)
6. ☐ GitHub Pages deploy + og-image + favicon (yarım gün)

---

## 8. İçerik Yazım Tonu Rehberi

- Kısa cümleler. Aktif dil. "Yapacağız" değil → "Yapıyoruz".
- Teknik terimleri saklamayın ama ilk geçtiği yerde 1 kelimelik parantez açıklaması verin.
- Her bölümde en az bir "insan" dokunuşu: espri, motto veya saha anısı.

> **Sürünün ilk kuralı:** Tek başına hiçbirimiz bir dron kadar hızlı değiliz.
> Birlikte, gökyüzünü yeniden yazıyoruz. 🛸
