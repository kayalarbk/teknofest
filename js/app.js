/* ═══════════════════════════════════════════════
   app.js — müfredat render, checkbox + localStorage,
   akordeon, rol seçici, faz kilidi, günlük
   ═══════════════════════════════════════════════ */
(function () {
  "use strict";

  const PROGRESS_KEY = "swarm-progress";
  const ROLE_KEY = "swarm-role";
  const DONUT_R = 26;
  const CIRCUMFERENCE = 2 * Math.PI * DONUT_R;

  let curriculum = null;
  let checked = new Set();

  /* ── Yardımcılar ────────────────────────────── */
  function esc(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function loadChecked() {
    try {
      return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY)) || []);
    } catch (e) {
      return new Set();
    }
  }
  function saveChecked() {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...checked]));
  }

  /* ── Topbar: geri sayım + footer yılı ───────── */
  const TARGET = new Date("2027-09-01T09:00:00+03:00");
  function tickCountdown() {
    const days = Math.max(0, Math.floor((TARGET - new Date()) / 86400000));
    document.getElementById("countdown-days").textContent = days;
  }
  tickCountdown();
  setInterval(tickCountdown, 3600000);
  document.getElementById("footer-year").textContent = new Date().getFullYear();

  /* ── Hero faz kartları (donut halkalı) ──────── */
  function renderPhaseCards() {
    const wrap = document.getElementById("phase-cards");
    wrap.innerHTML = curriculum.phases
      .map((phase, i) => {
        const shortName = phase.title.split("—")[1] ? phase.title.split("—")[1].trim() : phase.title;
        return (
          '<button class="phase-card" data-target="' + phase.id + '">' +
          '<div class="phase-card__donut">' +
          '<svg width="64" height="64" viewBox="0 0 64 64">' +
          '<circle class="donut__track" cx="32" cy="32" r="' + DONUT_R + '"></circle>' +
          '<circle class="donut__fill" data-phase="' + phase.id + '" data-circumference="' + CIRCUMFERENCE + '" cx="32" cy="32" r="' + DONUT_R + '" ' +
          'stroke-dasharray="' + CIRCUMFERENCE + '" stroke-dashoffset="' + CIRCUMFERENCE + '"></circle>' +
          "</svg>" +
          '<span class="phase-card__pct" data-phase="' + phase.id + '">%0</span>' +
          "</div>" +
          '<div class="phase-card__name">Faz ' + i + " · " + esc(shortName) + "</div>" +
          '<div class="phase-card__duration">' + esc(phase.duration) + "</div>" +
          "</button>"
        );
      })
      .join("");

    wrap.querySelectorAll(".phase-card").forEach((card) => {
      card.addEventListener("click", () => {
        const el = document.getElementById(card.dataset.target);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ── Konu (akordeon) kartı ──────────────────── */
  function topicHTML(phase, topic) {
    const itemsHTML = topic.items
      .map((item, i) => {
        const key = phase.id + "." + topic.id + "." + i;
        const isChecked = checked.has(key) ? " checked" : "";
        return (
          '<li class="item"><label>' +
          '<input type="checkbox" data-key="' + key + '"' + isChecked + ">" +
          '<span class="item__text">' + esc(item) + "</span>" +
          "</label></li>"
        );
      })
      .join("");

    const resourcesHTML = topic.resources && topic.resources.length
      ? '<p class="topic__resources">📚 ' +
        topic.resources
          .map((r) => '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.name) + "</a>")
          .join(" · ") +
        "</p>"
      : "";

    const exitHTML = topic.exitCriteria
      ? '<div class="topic__exit">✅ <strong>Çıkış kriteri:</strong> ' + esc(topic.exitCriteria) + "</div>"
      : "";

    return (
      '<div class="topic" data-phase="' + phase.id + '" data-topic="' + topic.id + '">' +
      '<button class="topic__head" aria-expanded="false">' +
      '<span class="topic__chevron">▶</span>' +
      '<span class="topic__name">' + esc(topic.title) + "</span>" +
      '<span class="topic__badge">✅</span>' +
      '<span class="topic__count"></span>' +
      "</button>" +
      '<div class="topic__body"><div class="topic__body-inner">' +
      '<ul class="topic__items">' + itemsHTML + "</ul>" +
      resourcesHTML + exitHTML +
      "</div></div></div>"
    );
  }

  /* ── Faz bölümleri ──────────────────────────── */
  function renderPhases() {
    const main = document.getElementById("phases");
    let html = "";

    for (const phase of curriculum.phases) {
      html += '<section class="phase" id="' + phase.id + '">';
      html += '<div class="phase__head"><h2 class="phase__title">' + esc(phase.title) +
              '<span class="phase__lock" hidden>🔒</span></h2></div>';
      html += '<p class="phase__meta">' + esc(phase.subtitle) + " · " + esc(phase.duration) + "</p>";

      if (phase.tracks) {
        // Faz 2: rol sekmeleri + kollar
        html += '<div class="role-tabs" role="tablist">';
        for (const track of phase.tracks) {
          html += '<button class="role-tab" role="tab" data-track="' + track.id + '">' +
                  track.icon + " " + esc(track.title) + "</button>";
        }
        html += "</div>";
        for (const track of phase.tracks) {
          html += '<div class="track" data-track="' + track.id + '">';
          html += '<h3 class="track__title">' + track.icon + " " + esc(track.title) + "</h3>";
          for (const topic of track.topics) html += topicHTML(phase, topic);
          html += "</div>";
        }
      } else {
        for (const topic of phase.topics) html += topicHTML(phase, topic);
      }

      if (phase.project) html += '<div class="phase__project">' + esc(phase.project) + "</div>";
      if (phase.motto) html += '<p class="phase__motto">"' + esc(phase.motto) + '"</p>';
      html += "</section>";
    }

    // Sürekli devam edenler
    if (curriculum.continuous) {
      html += '<section class="phase"><div class="continuous">' +
              "<h3>" + esc(curriculum.continuous.title) + "</h3><ul>" +
              curriculum.continuous.items.map((i) => "<li>" + esc(i) + "</li>").join("") +
              "</ul></div></section>";
    }

    main.innerHTML = html;
    bindAccordions();
    bindCheckboxes();
    bindRoleTabs();
  }

  /* ── Akordeon ───────────────────────────────── */
  function setOpen(topicEl, open) {
    const body = topicEl.querySelector(".topic__body");
    const head = topicEl.querySelector(".topic__head");
    topicEl.classList.toggle("open", open);
    head.setAttribute("aria-expanded", open);
    body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
  }

  function bindAccordions() {
    document.querySelectorAll(".topic__head").forEach((head) => {
      head.addEventListener("click", () => {
        const topicEl = head.closest(".topic");
        setOpen(topicEl, !topicEl.classList.contains("open"));
      });
    });
  }

  /* ── Checkbox + parıltı + rozet + sayaç ─────── */
  function updateTopicState(topicEl) {
    const boxes = topicEl.querySelectorAll('input[type="checkbox"]');
    const done = [...boxes].filter((b) => b.checked).length;
    topicEl.querySelector(".topic__count").textContent = done + "/" + boxes.length;
    topicEl.classList.toggle("topic--done", done === boxes.length);
  }

  function updatePhaseLocks(stats) {
    // ilk tamamlanmamış fazdan sonrakiler kilitli görünür (ama tıklanabilir)
    let firstIncompleteSeen = false;
    for (const phase of curriculum.phases) {
      const section = document.getElementById(phase.id);
      if (!section) continue;
      const locked = firstIncompleteSeen;
      section.classList.toggle("phase--locked", locked);
      section.querySelector(".phase__lock").hidden = !locked;
      if (stats.perPhase[phase.id].pct < 100) firstIncompleteSeen = true;
    }
  }

  function refreshAll(celebrate) {
    const stats = window.SwarmProgress.refresh(curriculum, checked, celebrate);
    updatePhaseLocks(stats);
  }

  function bindCheckboxes() {
    document.querySelectorAll('input[type="checkbox"][data-key]').forEach((box) => {
      box.addEventListener("change", () => {
        if (box.checked) {
          checked.add(box.dataset.key);
          // 200ms parıltı mikro animasyonu
          const sparkle = document.createElement("span");
          sparkle.className = "sparkle";
          sparkle.textContent = "✨";
          box.parentElement.appendChild(sparkle);
          setTimeout(() => sparkle.remove(), 500);
        } else {
          checked.delete(box.dataset.key);
        }
        saveChecked();
        updateTopicState(box.closest(".topic"));
        refreshAll(box.checked);
      });
    });
    document.querySelectorAll(".topic").forEach(updateTopicState);
  }

  /* ── Rol seçici (Faz 2) ─────────────────────── */
  function applyRole(trackId) {
    document.querySelectorAll(".role-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.track === trackId);
    });
    document.querySelectorAll(".track").forEach((track) => {
      const mine = track.dataset.track === trackId;
      track.classList.toggle("track--collapsed", !mine);
      // seçili kolun konuları açılır, diğerleri daraltılır
      track.querySelectorAll(".topic").forEach((t) => setOpen(t, mine));
    });
  }

  function bindRoleTabs() {
    document.querySelectorAll(".role-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        localStorage.setItem(ROLE_KEY, tab.dataset.track);
        applyRole(tab.dataset.track);
      });
    });
    const saved = localStorage.getItem(ROLE_KEY);
    if (saved && document.querySelector('.role-tab[data-track="' + saved + '"]')) {
      applyRole(saved);
    }
  }

  /* ── Haftalık günlük ────────────────────────── */
  function renderLogs(logs) {
    const body = document.getElementById("logbook-body");
    const formatDate = (iso) => {
      const [, m, d] = iso.split("-");
      const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
      return parseInt(d, 10) + " " + months[parseInt(m, 10) - 1];
    };
    body.innerHTML =
      '<p class="log-line"><span class="log-cursor"></span></p>' +
      logs
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map(
          (log) =>
            '<p class="log-line"><span class="log-line__date">[' + formatDate(log.date) + "]</span> " +
            '<span class="log-line__author">' + esc(log.author) + ":</span> " + esc(log.text) + "</p>"
        )
        .join("");
  }

  /* ── Başlatma ───────────────────────────────── */
  checked = loadChecked();

  fetch("data/curriculum.json")
    .then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then((data) => {
      curriculum = data;
      document.getElementById("loading-msg").remove();
      renderPhaseCards();
      renderPhases();
      refreshAll(false); // sayfa açılışında kutlama yok
    })
    .catch(() => {
      document.getElementById("loading-msg").textContent =
        "Müfredat yüklenemedi. Sayfayı bir web sunucusu üzerinden açın (örn. python -m http.server) — file:// ile fetch çalışmaz.";
    });

  fetch("data/logs.json")
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then(renderLogs)
    .catch(() => {
      document.getElementById("logbook-body").innerHTML =
        '<p class="log-line">Günlük yüklenemedi.</p>';
    });
})();
