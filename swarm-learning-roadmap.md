# 🛸 Sürü Dron Ekibi — Öğrenme Yol Haritası Sitesi

> Bu doküman iki şey içerir:
> **A)** Ekibin proje boyunca öğrenmesi gereken her şeyin aşama aşama müfredatı (sitenin içeriği)
> **B)** Bu müfredatı gösteren, animasyonlu ve motive edici web sayfasının tasarım spesifikasyonu
>
> Amaç: Ekipteki herkesin "şu an ne öğrenmeliyim, sırada ne var, ne kadar ilerledim?"
> sorularına tek bakışta cevap bulabileceği bir sayfa.

---

# BÖLÜM A — ÖĞRENME MÜFREDATI (Sitenin İçeriği)

## Faz 0 — Ortak Temel (Herkes) · ~4-6 hafta

Ekipteki **herkesin** rolünden bağımsız bilmesi gerekenler.

### 0.1 Linux & Terminal
- [ ] Ubuntu kurulumu (dual boot veya WSL2) — ROS 2 için şart
- [ ] Temel komutlar: `cd, ls, mkdir, cp, mv, rm, chmod, grep, nano`
- [ ] Paket yönetimi: `apt install`, PATH kavramı, `.bashrc`
- 📚 Kaynak: The Linux Command Line (ücretsiz PDF) · Ubuntu resmi dökümanları

### 0.2 Git & GitHub (Ekip Çalışması)
- [ ] `clone, add, commit, push, pull` döngüsü
- [ ] Branch açma, merge, çakışma (conflict) çözme
- [ ] Pull Request akışı — **ekip içinde kod incelemesi kültürü**
- 📚 Kaynak: learngitbranching.js.org (interaktif, Türkçe destekli)
- ✅ **Çıkış kriteri:** Ekip ortak bir repo'da branch'lerle çakışmasız çalışabiliyor.

### 0.3 Python Temelleri
- [ ] Veri tipleri, fonksiyonlar, listeler/sözlükler, dosya okuma
- [ ] Sınıflar (OOP) — ROS 2 node'ları sınıf tabanlı yazılır
- [ ] `pip`, sanal ortamlar (`venv`)
- 📚 Kaynak: Python.org resmi tutorial · Otomatikleştirilmiş Sıkıcı İşler (Automate the Boring Stuff)

### 0.4 Dron ve Uçuş Temelleri (Teori)
- [ ] Quadcopter nasıl uçar: itki, tork, PID kontrolün sezgisel mantığı
- [ ] Uçuş modları: Stabilize, Position Hold, Offboard, RTL
- [ ] Temel bileşenler: uçuş kontrolcüsü (FC), ESC, motor, batarya (LiPo güvenliği!), GPS, IMU
- [ ] **SHGM dron mevzuatı ve güvenlik kuralları** (Türkiye'de yasal uçuş)
- 📚 Kaynak: PX4 User Guide "Basic Concepts" · Andrew Gibiansky "Quadcopter Dynamics" yazısı

> 🎯 **Faz 0 mezuniyet projesi:** Herkes Python ile basit bir 2D sürü simülasyonu yazar
> (pygame'de 20 nokta, Reynolds kurallarıyla hareket etsin). Hem Python pratiği hem
> projenin kalbindeki algoritmayla ilk tanışma.

---

## Faz 1 — Simülasyon Dünyası · ~6-8 hafta

### 1.1 ROS 2 (Humble/Jazzy)
- [ ] Node, Topic, Publisher/Subscriber kavramları
- [ ] Service, Action, Parameter
- [ ] `colcon` ile workspace ve paket oluşturma
- [ ] Launch dosyaları, `rqt_graph`, `ros2 topic echo` ile debug
- 📚 Kaynak: ROS 2 resmi tutorials (docs.ros.org) — sırayla hepsi · Articulated Robotics YouTube serisi

### 1.2 Gazebo + PX4-SITL
- [ ] PX4 kaynak koddan derleme, SITL başlatma
- [ ] Gazebo'da tek dron spawn etme, QGroundControl bağlantısı
- [ ] Dünya (world) dosyaları düzenleme
- 📚 Kaynak: PX4 Dev Guide "Simulation" bölümü

### 1.3 MAVLink & Offboard Kontrol
- [ ] MAVLink protokolünün mantığı: mesajlar, heartbeat, komutlar
- [ ] MAVSDK-Python veya MAVROS ile: arm → takeoff → waypoint → land
- [ ] Offboard modda hız/pozisyon setpoint gönderme
- ✅ **Çıkış kriteri:** Simülasyondaki dron, yazdığınız Python script ile kare çizerek uçuyor.

### 1.4 Çoklu Dron Simülasyonu
- [ ] PX4-SITL'de birden fazla instance (farklı MAVLink portları)
- [ ] ROS 2 namespace'leri ile dronları ayırma
- [ ] Reynolds flocking'i (Faz 0'daki 2D sim) 3D'ye ve gerçek dron modeline taşıma
- ✅ **Çıkış kriteri:** 3 sanal dron simülasyonda çarpışmadan formasyon uçuşu yapıyor.

---

## Faz 2 — Rol Bazlı Uzmanlaşma · ~8-10 hafta

Bu fazda ekip 3 kola ayrılır. Herkes kendi kolonuna derinlemesine dalar,
haftalık toplantılarda birbirine öğretir (**öğreterek öğrenme**).

### 🔧 Kol 1: Gömülü Sistemler & Donanım
- [ ] Pixhawk 6C: portlar, güç modülü, sensör kalibrasyonu, parametre ayarları
- [ ] Raspberry Pi 4: headless kurulum, SSH, seri port üzerinden Pixhawk bağlantısı
- [ ] ESC kalibrasyonu, motor test, pervane güvenliği
- [ ] Batarya yönetimi, güç bütçesi hesabı, failsafe konfigürasyonu
- [ ] Lehimleme ve temel elektronik montaj (XT60, JST konnektörler)
- 📚 Kaynak: PX4 Hardware docs · Painless360 YouTube kanalı

### 🧠 Kol 2: Otonomi & Sürü Algoritmaları
- [ ] Reynolds flocking'in ötesi: lider-takipçi, sanal yapı, konsensüs tabanlı formasyon
- [ ] Yol planlama temelleri: A*, RRT (kavramsal + basit implementasyon)
- [ ] Durum makineleri ile görev yönetimi (mission state machine)
- [ ] Kalman filtresi temelleri — sensör füzyonunun mantığı
- [ ] Çarpışma önleme: potansiyel alan yöntemi
- 📚 Kaynak: "Distributed Multi-Robot Systems" ders notları (çevrimiçi) · Vijay Kumar'ın sürü robotiği dersleri (Coursera/YouTube)

### 👁️ Kol 3: Görü Sistemleri & Haberleşme
- [ ] OpenCV: görüntü okuma, renk uzayları, eşikleme, kontur bulma
- [ ] Nesne tespiti: önce klasik yöntemler (renk+şekil), sonra YOLO (hazır model kullanımı)
- [ ] Kamera kalibrasyonu, piksel → dünya koordinatı dönüşümü
- [ ] Dronlar arası haberleşme: WiFi mesh / telemetri modülleri, gecikme ve menzil testleri
- [ ] ROS 2 üzerinden görüntü akışı (`image_transport`)
- 📚 Kaynak: OpenCV resmi Python tutorial · PyImageSearch blog

---

## Faz 3 — Gerçek Donanım & Entegrasyon · Teknofest sezonuna kadar

- [ ] Tek dronla ilk gerçek uçuş: önce manuel, sonra Position Hold, en son Offboard
- [ ] **Güvenlik protokolü yazılı hale getirilir:** uçuş öncesi kontrol listesi, acil durum prosedürü, test alanı kuralları
- [ ] RPi4 üzerinde kod dağıtımı: SSH ile deploy, otomatik başlatma (systemd)
- [ ] Loglama ve uçuş sonrası analiz: PX4 log dosyaları, Flight Review aracı
- [ ] 2-3 dronla saha koordinasyon testleri
- [ ] Teknofest şartnamesi çıkınca: görev senaryolarına özel eğitim sprintleri
- ✅ **Nihai çıkış kriteri:** Şartname görevini simülasyonda %100, sahada güvenle tekrarlayabilmek.

---

## Sürekli Devam Edenler (Her Faz Boyunca)
- 📝 Haftalık öğrenme günlüğü — herkes o hafta öğrendiği 1 şeyi siteye ekler
- 🗣️ Haftalık 30 dk "öğret-öğren" toplantısı — dönüşümlü sunum
- 🇬🇧 Teknik İngilizce: dökümanların çoğu İngilizce; okudukça gelişir, ayrıca çalışmaya gerek yok
- 📄 Rapor yazımı: Teknofest ÖTR/KTR raporları için IEEE formatı alışkanlığı

---

# BÖLÜM B — WEB SAYFASI TASARIM SPESİFİKASYONU

## Amaç ve Kullanıcı
Bu sayfanın **asıl kullanıcısı ekibin kendisi.** Bir vitrin değil, bir **kokpit**:
"Bugün ne çalışmalıyım?" sorusuna 5 saniyede cevap vermeli, ilerlemeyi görünür
kılarak motive etmeli.

## Teknik
- Tek sayfa, vanilla **HTML + CSS + JS**, GitHub Pages'te barındırma
- İlerleme (checkbox durumları) **localStorage**'da tutulur — herkes kendi ilerlemesini işaretler
- Müfredat verisi ayrı bir `curriculum.json` dosyasından yüklenir → içerik güncellemek için HTML'e dokunmak gerekmez
- Fontlar: Space Grotesk (başlık) + Inter (gövde) · Koyu tema

## Renkler
```css
:root {
  --bg: #0A0E1A;             /* koyu zemin */
  --card: #131A2B;
  --cyan: #22D3EE;           /* aktif faz, ilerleme çubukları */
  --orange: #F97316;         /* vurgular, motivasyon öğeleri */
  --green: #4ADE80;          /* tamamlanan konular */
  --text: #F1F5F9;
  --muted: #94A3B8;
}
```

## Sayfa Yapısı

### 1) Üst Bar — "Görev Durumu"
- Sol: ekip adı + küçük dron ikonu
- Orta: **genel ilerleme çubuğu** (tüm checkbox'ların yüzdesi) — dolarken cyan→turuncu gradyan
- Sağ: Teknofest 2027 geri sayımı (gün)
- Sticky (kaydırınca üstte kalır)

### 2) Hero (kısa tutulur)
- Başlık: **"Ne Öğrenmeliyiz?"** · Alt: "Sürü dron projemizin tam öğrenme haritası. İşaretle, ilerle, uç."
- Arka planda çok hafif, yavaş süzülen 15-20 noktalı flocking animasyonu (Canvas) — dikkat dağıtmayacak kadar soluk
- Altında 4 faz kartı (Faz 0-3): her kartta faz adı, süre, o fazın kendi ilerleme yüzdesi halkası (SVG donut). Karta tıklayınca ilgili bölüme yumuşak kaydırma.

### 3) Faz Bölümleri (sitenin gövdesi)
Her faz bir bölüm; içinde konu grupları **akordeon kartlar** halinde:
- Kart başlığı: konu adı + o konunun ilerleme sayısı (örn. `3/5`)
- Açılınca: checkbox'lı madde listesi + 📚 kaynak linkleri + varsa ✅ çıkış kriteri kutusu (yeşil kenarlıklı)
- **Checkbox işaretlenince:** madde üstü çizilir, minik konfeti/parıltı mikro-animasyonu (200ms), üst bardaki genel ilerleme anında güncellenir
- Bir konunun **tüm** maddeleri bitince kart başlığına ✅ rozeti gelir + kart kenarı yeşile döner
- **Faz kilidi görseli:** sonraki fazlar soluk + 🔒 ikonuyla gösterilir ama tıklanabilir kalır (kimseyi engellemeyiz, sadece sırayı hatırlatırız)

### 4) Rol Seçici (Faz 2 için)
- Faz 2'nin başında 3 sekme: 🔧 Donanım · 🧠 Otonomi · 👁️ Görü
- Kullanıcı rolünü seçer, seçim localStorage'a kaydedilir; sonraki girişte kendi kolu otomatik açık gelir
- Diğer kollar gizlenmez, sadece daraltılır ("arkadaşın ne öğreniyor" merakı için)

### 5) Haftalık Günlük Şeridi
- `logs.json`'dan beslenen, terminal görünümlü kısa liste: `> [12 Tem] Barış: MAVSDK ile ilk takeoff scripti çalıştı 🎉`
- En üstte yanıp sönen imleç animasyonu

### 6) Motivasyon Öğeleri (abartısız)
- Genel ilerleme %25/%50/%75/%100 eşiklerini geçince tam ekran 2 saniyelik kutlama overlay'i ("Sürünün çeyreği havada! 🛸")
- Her fazın sonunda tek satır motto (örn. Faz 1 sonu: *"Simülasyonda uçan, sahada düşmez... daha az düşer."*)
- Footer'da: *"Tek başına hiçbirimiz bir dron kadar hızlı değiliz. Birlikte, gökyüzünü yeniden yazıyoruz."*

## Animasyon Özeti
| Öğe | Teknik |
|---|---|
| Hero flocking arka planı | Canvas + requestAnimationFrame, düşük opaklık |
| İlerleme çubuğu/halkaları | CSS transition + SVG stroke-dashoffset |
| Checkbox tamamlama | CSS keyframe parıltı, üstü çizme animasyonu |
| Akordeon aç/kapa | max-height + opacity transition |
| Bölüm girişleri | IntersectionObserver ile fade-up |
| Eşik kutlamaları | Tam ekran overlay, 2sn, otomatik kapanır |

`prefers-reduced-motion` desteklenir: dekoratif animasyonlar kapanır, işlev bozulmaz.

## Dosya Yapısı
```
learning-roadmap/
├── index.html
├── css/style.css
├── js/
│   ├── app.js           (render, checkbox, localStorage)
│   ├── swarm-bg.js      (hero canvas animasyonu)
│   └── progress.js      (ilerleme hesaplama, kutlamalar)
└── data/
    ├── curriculum.json  (tüm müfredat — Bölüm A'nın JSON hali)
    └── logs.json        (haftalık günlük)
```

## curriculum.json Şeması (örnek)
```json
{
  "phases": [
    {
      "id": "faz0",
      "title": "Ortak Temel",
      "duration": "4-6 hafta",
      "topics": [
        {
          "title": "Git & GitHub",
          "items": [
            "clone, add, commit, push, pull döngüsü",
            "Branch açma, merge, conflict çözme"
          ],
          "resources": [
            {"name": "learngitbranching.js.org", "url": "https://learngitbranching.js.org"}
          ],
          "exitCriteria": "Ekip ortak repoda çakışmasız çalışabiliyor."
        }
      ]
    }
  ]
}
```

## Geliştirme Sırası
1. ☐ `curriculum.json`'u Bölüm A'dan doldur (en önemli iş — içerik önce!)
2. ☐ JSON'dan akordeon + checkbox render eden `app.js`
3. ☐ localStorage ilerleme + üst bar yüzdesi
4. ☐ Faz kartları + donut halkalar + rol seçici
5. ☐ Hero canvas animasyonu + mikro animasyonlar + kutlamalar
6. ☐ GitHub Pages deploy
