/* ═══════════════════════════════════════════════
   app.js — Konu Haritası
   curriculum.json → dikey yol haritası:
   fazlar, milestone çapaları, doneWhen ilerlemesi,
   filtreler, arama, haftalık ritim paneli, tema.
   Tüm içerik JSON'dan gelir; hiçbir şey koda gömülmez.
   ═══════════════════════════════════════════════ */
(function () {
  "use strict";

  var PROGRESS_KEY = "swarm-map-progress";   // yeni: doneWhen + milestone anahtarları
  var LEGACY_KEY = "swarm-progress";         // eski: madde-bazlı işaretler (göç için)
  var THEME_KEY = "swarm-theme";

  var curriculum = null;
  var done = new Set();                      // "dw:faz0.linux", "ms:m0" gibi anahtarlar
  var filter = { q: "", owner: "", status: "all" };

  /* ── Yardımcılar ────────────────────────────── */
  function esc(s) {
    var div = document.createElement("div");
    div.textContent = s == null ? "" : String(s);
    return div.innerHTML;
  }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function $(id) { return document.getElementById(id); }

  function loadDone() {
    try { return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY)) || []); }
    catch (e) { return new Set(); }
  }
  function saveDone() {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(done)));
  }

  /* ── Tema ───────────────────────────────────── */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    window.dispatchEvent(new CustomEvent("themechange"));
  }
  function initTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
    $("theme-toggle").addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  /* ── İlerleme birimleri ─────────────────────────
     Bir "birim" = işaretlenebilir bir doneWhen.
     Konularda: dw:<fazId>.<konuId>
     Faz 2 kollarında (konularda doneWhen yoksa kolunki esas): dw:<fazId>.<kolId> */
  function phaseUnits(phase) {
    var units = [];
    arr(phase.topics).forEach(function (t) {
      if (t.doneWhen) units.push({ key: "dw:" + phase.id + "." + t.id, topic: t });
    });
    arr(phase.tracks).forEach(function (tr) {
      if (tr.doneWhen) units.push({ key: "dw:" + phase.id + "." + tr.id, track: tr });
      arr(tr.topics).forEach(function (t) {
        if (t.doneWhen) units.push({ key: "dw:" + phase.id + "." + t.id, topic: t, track: tr });
      });
    });
    return units;
  }

  function computeStats() {
    var total = 0, doneCount = 0, perPhase = {};
    arr(curriculum.phases).forEach(function (phase) {
      var units = phaseUnits(phase);
      var d = units.filter(function (u) { return done.has(u.key); }).length;
      perPhase[phase.id] = {
        total: units.length,
        done: d,
        pct: units.length ? Math.round((d / units.length) * 100) : 0
      };
      total += units.length;
      doneCount += d;
    });
    return {
      total: total,
      done: doneCount,
      pct: total ? Math.round((doneCount / total) * 100) : 0,
      perPhase: perPhase
    };
  }

  /* ── Eski madde-bazlı ilerlemeden göç ─────────
     Eski sitede her madde ayrı işaretleniyordu ("faz0.linux.2").
     Bir konunun TÜM maddeleri işaretliyse doneWhen'ini işaretli say. */
  function migrateLegacy() {
    if (localStorage.getItem(PROGRESS_KEY)) return; // yeni kayıt varsa dokunma
    var legacy;
    try { legacy = new Set(JSON.parse(localStorage.getItem(LEGACY_KEY)) || []); }
    catch (e) { return; }
    if (!legacy.size) return;

    function allItemsChecked(phaseId, topic) {
      var items = arr(topic.items);
      if (!items.length) return false;
      return items.every(function (_, i) { return legacy.has(phaseId + "." + topic.id + "." + i); });
    }

    arr(curriculum.phases).forEach(function (phase) {
      arr(phase.topics).forEach(function (t) {
        if (t.doneWhen && allItemsChecked(phase.id, t)) done.add("dw:" + phase.id + "." + t.id);
      });
      arr(phase.tracks).forEach(function (tr) {
        var topics = arr(tr.topics);
        if (tr.doneWhen && topics.length &&
            topics.every(function (t) { return allItemsChecked(phase.id, t); })) {
          done.add("dw:" + phase.id + "." + tr.id);
        }
      });
    });
    if (done.size) saveDone();
  }

  /* ── Hero: felsefe + faz çipleri ────────────── */
  function renderHero() {
    var meta = curriculum.meta || {};
    if (meta.philosophy) $("hero-philosophy").textContent = meta.philosophy;

    $("phase-chips").innerHTML = arr(curriculum.phases).map(function (phase, i) {
      var short = (phase.title || "").split("—")[1];
      short = short ? short.trim() : phase.title;
      return '<button class="phase-chip" data-target="' + esc(phase.id) + '">' +
        '<span class="phase-chip__pct" data-phase-pct="' + esc(phase.id) + '">%0</span>' +
        '<span class="phase-chip__name">Faz ' + i + ' · ' + esc(short) + '</span>' +
        '</button>';
    }).join("");

    document.querySelectorAll(".phase-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var el = document.getElementById("phase-" + chip.dataset.target);
        if (el) {
          setPhaseOpen(el, true);
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  /* ── Konu kartı ─────────────────────────────── */
  function topicCard(phase, topic, track) {
    var key = "dw:" + phase.id + "." + topic.id;
    var hasUnit = !!topic.doneWhen;
    var isDone = done.has(key);

    var ownerHTML = topic.owner
      ? '<span class="owner-badge" title="Sorumlu">👤 ' + esc(topic.owner) + '</span>'
      : "";

    var doneWhenHTML = hasUnit
      ? '<label class="donewhen' + (isDone ? " donewhen--checked" : "") + '">' +
        '<input type="checkbox" data-unit="' + esc(key) + '"' + (isDone ? " checked" : "") + '>' +
        '<span class="donewhen__label"><strong>Bitti sayılır:</strong> ' + esc(topic.doneWhen) + '</span>' +
        '</label>'
      : "";

    var itemsHTML = arr(topic.items).length
      ? '<ul class="topic__items">' +
        arr(topic.items).map(function (it) { return "<li>" + esc(it) + "</li>"; }).join("") +
        "</ul>"
      : "";

    var resourcesHTML = arr(topic.resources).length
      ? '<p class="topic__resources">📚 ' +
        arr(topic.resources).map(function (r) {
          return '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.name) + "</a>";
        }).join(" · ") + "</p>"
      : "";

    return '<article class="topic' + (isDone ? " topic--done" : "") + '"' +
      ' data-unit="' + esc(key) + '" data-owner="' + esc(topic.owner || (track ? track.title : "")) + '"' +
      ' data-search="' + esc([topic.title].concat(arr(topic.items)).concat([topic.doneWhen || ""]).join(" ").toLowerCase()) + '">' +
      '<div class="topic__head"><h4 class="topic__name">' + esc(topic.title) + '</h4>' + ownerHTML + '</div>' +
      doneWhenHTML + itemsHTML + resourcesHTML +
      '</article>';
  }

  /* ── Faz 2 kolları ──────────────────────────── */
  function trackColumn(phase, track) {
    var key = "dw:" + phase.id + "." + track.id;
    var isDone = done.has(key);
    var doneWhenHTML = track.doneWhen
      ? '<label class="donewhen donewhen--track' + (isDone ? " donewhen--checked" : "") + '">' +
        '<input type="checkbox" data-unit="' + esc(key) + '"' + (isDone ? " checked" : "") + '>' +
        '<span class="donewhen__label"><strong>Kol biter:</strong> ' + esc(track.doneWhen) + '</span>' +
        '</label>'
      : "";

    return '<div class="track" data-unit="' + esc(key) + '">' +
      '<h3 class="track__title">' + esc(track.icon || "") + " " + esc(track.title) + '</h3>' +
      doneWhenHTML +
      arr(track.topics).map(function (t) { return topicCard(phase, t, track); }).join("") +
      '</div>';
  }

  /* ── Milestone çapası ───────────────────────── */
  function milestoneHTML(ms) {
    var key = "ms:" + ms.id;
    var reached = done.has(key);
    return '<div class="milestone' + (reached ? " milestone--reached" : "") + '" data-ms="' + esc(key) + '">' +
      '<div class="milestone__marker" aria-hidden="true">' + (reached ? "🏁" : "◆") + '</div>' +
      '<div class="milestone__card">' +
      '<div class="milestone__top"><strong>' + esc(ms.label) + '</strong>' +
      '<span class="milestone__target">🎯 ' + esc(ms.target) + '</span></div>' +
      '<p class="milestone__criteria">' + esc(ms.criteria) + '</p>' +
      '<button class="milestone__btn" data-unit="' + esc(key) + '" aria-pressed="' + reached + '">' +
      (reached ? "✓ Ulaşıldı" : "Ulaşıldı işaretle") + '</button>' +
      '</div></div>';
  }

  /* ── Yol haritası ───────────────────────────── */
  function renderRoadmap() {
    var milestonesByPhase = {};
    arr(curriculum.milestones).forEach(function (ms) {
      (milestonesByPhase[ms.phase] = milestonesByPhase[ms.phase] || []).push(ms);
    });

    var html = "";
    arr(curriculum.phases).forEach(function (phase) {
      html += '<section class="station" id="phase-' + esc(phase.id) + '">';
      html += '<div class="station__marker" aria-hidden="true"><span class="station__dot"></span></div>';
      html += '<div class="phase-card">';
      html += '<button class="phase-card__head" aria-expanded="false">';
      html += '<div class="phase-card__titles"><h2>' + esc(phase.title) + '</h2>';
      html += '<p class="phase-card__meta">' + esc(phase.subtitle || "") +
              (phase.duration ? " · " + esc(phase.duration) : "") + '</p></div>';
      html += '<div class="phase-card__progress"><div class="pbar"><div class="pbar__fill" data-phase-bar="' + esc(phase.id) + '"></div></div>' +
              '<span class="pbar__label" data-phase-label="' + esc(phase.id) + '">0/0</span></div>';
      html += '<span class="phase-card__chevron" aria-hidden="true">▾</span>';
      html += '</button>';

      html += '<div class="phase-card__body"><div class="phase-card__inner">';
      if (phase.motto) html += '<p class="phase-card__motto">"' + esc(phase.motto) + '"</p>';
      if (phase.goal) html += '<p class="phase-card__goal">' + esc(phase.goal) + '</p>';
      if (phase.roleSeeding) html += '<div class="note-box">🌱 ' + esc(phase.roleSeeding) + '</div>';

      if (arr(phase.tracks).length) {
        if (phase.syncRule) html += '<div class="note-box note-box--sync">🔗 ' + esc(phase.syncRule) + '</div>';
        html += '<div class="tracks">' +
          arr(phase.tracks).map(function (tr) { return trackColumn(phase, tr); }).join("") +
          '</div>';
      } else {
        html += arr(phase.topics).map(function (t) { return topicCard(phase, t); }).join("");
      }

      if (phase.project) html += '<div class="phase-card__project">' + esc(phase.project) + '</div>';
      html += '</div></div>'; // body
      html += '</div></section>';

      arr(milestonesByPhase[phase.id]).forEach(function (ms) { html += milestoneHTML(ms); });
    });

    $("roadmap").innerHTML = html;
    bindPhaseAccordions();
    bindUnits();
  }

  /* ── İlkeler & sürekli işler ────────────────── */
  function renderPrinciples() {
    var principles = arr(curriculum.meta && curriculum.meta.principles);
    if (!principles.length) return;
    $("principles-section").hidden = false;
    $("principles").innerHTML = principles.map(function (p) {
      return '<div class="principle"><h3>' + esc(p.name) + '</h3><p>' + esc(p.detail) + '</p></div>';
    }).join("");
  }

  function renderContinuous() {
    var c = curriculum.continuous;
    if (!c) return;
    $("continuous-section").hidden = false;
    $("continuous").innerHTML =
      "<h3>" + esc(c.title || "Sürekli Devam Edenler") + "</h3>" +
      (c.note ? '<p class="continuous__note">' + esc(c.note) + "</p>" : "") +
      "<ul>" + arr(c.items).map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
  }

  /* ── Bu Hafta paneli ────────────────────────── */
  function renderWeekPanel() {
    var cadence = (curriculum.meta && curriculum.meta.cadence) || {};
    if (cadence.title) $("week-title").textContent = cadence.title;

    var stepsHTML = arr(cadence.steps).length
      ? '<ol class="week-steps">' +
        arr(cadence.steps).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>"
      : "";
    var noteHTML = cadence.note ? '<p class="week-note">' + esc(cadence.note) + "</p>" : "";

    // Seçili kişinin (owner filtresi) açık konuları
    var openHTML = "";
    var openTopics = [];
    arr(curriculum.phases).forEach(function (phase) {
      phaseUnits(phase).forEach(function (u) {
        if (done.has(u.key)) return;
        var owner = u.topic ? u.topic.owner : "";
        var title = u.topic ? u.topic.title : (u.track ? (u.track.icon || "") + " " + u.track.title : "");
        if (filter.owner && (!owner || owner.toLowerCase().indexOf(filter.owner.toLowerCase()) === -1)) return;
        openTopics.push({ phase: phase, title: title, owner: owner });
      });
    });
    var heading = filter.owner ? esc(filter.owner) + " — açık konular" : "Açık konular";
    openHTML = '<h4 class="week-open__title">' + heading + " (" + openTopics.length + ")</h4>";
    openHTML += openTopics.length
      ? '<ul class="week-open">' + openTopics.map(function (t) {
          return '<li><button class="week-open__link" data-target="' + esc(t.phase.id) + '">' +
            esc(t.title) + '</button>' +
            (t.owner ? ' <span class="owner-badge">👤 ' + esc(t.owner) + '</span>' : "") + "</li>";
        }).join("") + "</ul>"
      : '<p class="week-empty">' + (filter.owner
          ? "Bu kişiye atanmış açık konu yok. JSON'da konulara <code>owner</code> ekleyince burada listelenir."
          : "Tüm konular tamamlandı! 🏁") + "</p>";

    $("week-body").innerHTML = noteHTML + stepsHTML + openHTML;
    $("week-body").querySelectorAll(".week-open__link").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var el = document.getElementById("phase-" + btn.dataset.target);
        if (el) {
          toggleWeekPanel(false);
          setPhaseOpen(el, true);
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function toggleWeekPanel(open) {
    var panel = $("week-panel"), fab = $("week-fab");
    var show = typeof open === "boolean" ? open : panel.hidden;
    panel.hidden = !show;
    fab.setAttribute("aria-expanded", String(show));
    if (show) renderWeekPanel();
  }

  /* ── Filtreler ──────────────────────────────── */
  function renderOwnerFilter() {
    var members = arr(curriculum.meta && curriculum.meta.members);
    var select = $("filter-owner");
    members.forEach(function (m) {
      var opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      select.appendChild(opt);
    });
  }

  function applyFilters() {
    var q = filter.q.trim().toLowerCase();
    var searching = q.length > 0 || filter.owner || filter.status !== "all";

    document.querySelectorAll(".topic").forEach(function (card) {
      var visible = true;
      if (q && card.dataset.search.indexOf(q) === -1) visible = false;
      if (filter.owner &&
          card.dataset.owner.toLowerCase().indexOf(filter.owner.toLowerCase()) === -1) visible = false;
      var isDone = card.classList.contains("topic--done");
      if (filter.status === "open" && isDone) visible = false;
      if (filter.status === "done" && !isDone) visible = false;
      card.classList.toggle("hidden", !visible);
    });

    // Kol sütunları: görünür konusu yoksa (ve kol doneWhen'i durum filtresine uymuyorsa) gizle
    document.querySelectorAll(".track").forEach(function (track) {
      var anyTopic = track.querySelectorAll(".topic:not(.hidden)").length > 0;
      var trackDone = done.has(track.dataset.unit || "");
      var trackMatches = !q || (track.textContent || "").toLowerCase().indexOf(q) !== -1;
      var statusOk = filter.status === "all" || (filter.status === "done") === trackDone;
      track.classList.toggle("hidden", !(anyTopic || (trackMatches && statusOk && !filter.owner)));
    });

    // Fazlar: görünür içerik yoksa sölükleştir; arama varken otomatik aç
    document.querySelectorAll(".station").forEach(function (station) {
      var any = station.querySelectorAll(".topic:not(.hidden), .track:not(.hidden)").length > 0;
      station.classList.toggle("station--muted", searching && !any);
      if (searching && any) setPhaseOpen(station, true);
    });

    document.querySelectorAll(".milestone").forEach(function (ms) {
      ms.classList.toggle("hidden", !!q || !!filter.owner);
    });
  }

  function bindFilters() {
    $("search").addEventListener("input", function (e) {
      filter.q = e.target.value;
      applyFilters();
    });
    $("filter-owner").addEventListener("change", function (e) {
      filter.owner = e.target.value;
      applyFilters();
      if (!$("week-panel").hidden) renderWeekPanel();
    });
    document.querySelectorAll(".seg-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".seg-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        filter.status = btn.dataset.status;
        applyFilters();
      });
    });
    $("week-fab").addEventListener("click", function () { toggleWeekPanel(); });
    $("week-close").addEventListener("click", function () { toggleWeekPanel(false); });
  }

  /* ── Faz akordeonu ──────────────────────────── */
  function setPhaseOpen(stationEl, open) {
    var card = stationEl.querySelector(".phase-card");
    var head = stationEl.querySelector(".phase-card__head");
    var body = stationEl.querySelector(".phase-card__body");
    if (!card || !body) return;
    card.classList.toggle("open", open);
    head.setAttribute("aria-expanded", String(open));
    body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
  }

  function bindPhaseAccordions() {
    document.querySelectorAll(".phase-card__head").forEach(function (head) {
      head.addEventListener("click", function () {
        var station = head.closest(".station");
        setPhaseOpen(station, !station.querySelector(".phase-card").classList.contains("open"));
      });
    });
  }

  // Akordeon açıkken içerik değişirse yüksekliği tazele
  function refreshOpenHeights() {
    document.querySelectorAll(".phase-card.open .phase-card__body").forEach(function (body) {
      body.style.maxHeight = body.scrollHeight + "px";
    });
  }

  /* ── doneWhen & milestone işaretleme ────────── */
  function setUnit(key, checked) {
    if (checked) done.add(key); else done.delete(key);
    saveDone();

    // İlgili kart görünümleri
    document.querySelectorAll('[data-unit="' + key + '"]').forEach(function (el) {
      if (el.classList.contains("topic")) el.classList.toggle("topic--done", checked);
      if (el.classList.contains("milestone__btn")) {
        el.textContent = checked ? "✓ Ulaşıldı" : "Ulaşıldı işaretle";
        el.setAttribute("aria-pressed", String(checked));
        var ms = el.closest(".milestone");
        ms.classList.toggle("milestone--reached", checked);
        ms.querySelector(".milestone__marker").textContent = checked ? "🏁" : "◆";
      }
      var label = el.closest ? el.closest(".donewhen") : null;
      if (label) label.classList.toggle("donewhen--checked", checked);
    });

    updateProgressUI();
    applyFilters();
    refreshOpenHeights();
    if (!$("week-panel").hidden) renderWeekPanel();
  }

  function bindUnits() {
    document.querySelectorAll('input[type="checkbox"][data-unit]').forEach(function (box) {
      box.addEventListener("change", function () { setUnit(box.dataset.unit, box.checked); });
    });
    document.querySelectorAll(".milestone__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setUnit(btn.dataset.unit, !done.has(btn.dataset.unit));
      });
    });
  }

  /* ── İlerleme göstergeleri ──────────────────── */
  function updateProgressUI() {
    var stats = computeStats();
    $("topbar-fill").style.width = stats.pct + "%";
    $("topbar-pct").textContent = "%" + stats.pct;
    $("topbar-progress").setAttribute("aria-valuenow", stats.pct);

    Object.keys(stats.perPhase).forEach(function (phaseId) {
      var p = stats.perPhase[phaseId];
      var bar = document.querySelector('[data-phase-bar="' + phaseId + '"]');
      var label = document.querySelector('[data-phase-label="' + phaseId + '"]');
      var chip = document.querySelector('[data-phase-pct="' + phaseId + '"]');
      if (bar) bar.style.width = p.pct + "%";
      if (label) label.textContent = p.done + "/" + p.total;
      if (chip) {
        chip.textContent = "%" + p.pct;
        chip.classList.toggle("done", p.pct === 100);
      }
    });
  }

  /* ── Geri sayım + footer ────────────────────── */
  var TARGET = new Date("2027-09-01T09:00:00+03:00");
  function tickCountdown() {
    var days = Math.max(0, Math.floor((TARGET - new Date()) / 86400000));
    $("countdown-days").textContent = days;
  }

  /* ── Günlük ─────────────────────────────────── */
  function renderLogs(logs) {
    var months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    function formatDate(iso) {
      var parts = iso.split("-");
      return parseInt(parts[2], 10) + " " + months[parseInt(parts[1], 10) - 1];
    }
    $("logbook-body").innerHTML =
      '<p class="log-line"><span class="log-cursor"></span></p>' +
      arr(logs).slice().sort(function (a, b) { return b.date.localeCompare(a.date); })
        .map(function (log) {
          return '<p class="log-line"><span class="log-line__date">[' + formatDate(log.date) + "]</span> " +
            '<span class="log-line__author">' + esc(log.author) + ":</span> " + esc(log.text) + "</p>";
        }).join("");
  }

  /* ── Başlatma ───────────────────────────────── */
  initTheme();
  tickCountdown();
  setInterval(tickCountdown, 3600000);
  $("footer-year").textContent = new Date().getFullYear();

  fetch("data/curriculum.json")
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      curriculum = data;
      done = loadDone();
      migrateLegacy();
      $("loading-msg").remove();
      renderHero();
      renderOwnerFilter();
      renderRoadmap();
      renderPrinciples();
      renderContinuous();
      bindFilters();
      updateProgressUI();
      // İlk tamamlanmamış faz açık başlasın
      var stats = computeStats();
      var opened = false;
      arr(curriculum.phases).forEach(function (phase) {
        var station = document.getElementById("phase-" + phase.id);
        if (!station) return;
        if (!opened && stats.perPhase[phase.id].pct < 100) {
          setPhaseOpen(station, true);
          opened = true;
        }
      });
      if (!opened) {
        var first = document.querySelector(".station");
        if (first) setPhaseOpen(first, true);
      }
    })
    .catch(function () {
      $("loading-msg").textContent =
        "Müfredat yüklenemedi. Sayfayı bir web sunucusu üzerinden açın (örn. python -m http.server) — file:// ile fetch çalışmaz.";
    });

  fetch("data/logs.json")
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(renderLogs)
    .catch(function () {
      $("logbook-body").innerHTML = '<p class="log-line">Günlük yüklenemedi.</p>';
    });
})();
