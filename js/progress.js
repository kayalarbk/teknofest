/* ═══════════════════════════════════════════════
   progress.js — ilerleme hesaplama, topbar/donut
   güncelleme, eşik kutlamaları
   ═══════════════════════════════════════════════ */
(function () {
  "use strict";

  const THRESHOLDS = [
    { pct: 25, msg: "Sürünün çeyreği havada! 🛸" },
    { pct: 50, msg: "Yarı yoldayız — formasyon bozulmadı! 🛸🛸" },
    { pct: 75, msg: "%75! Gökyüzü yaklaşıyor... 🚀" },
    { pct: 100, msg: "MÜFREDAT TAMAM. Gökyüzü bizim. 🏁🛸" },
  ];

  const CELEBRATED_KEY = "swarm-celebrated";

  // Bir fazın tüm konularını (tracks dahil) düz liste olarak döner
  function phaseTopics(phase) {
    if (phase.tracks) {
      return phase.tracks.flatMap((t) => t.topics);
    }
    return phase.topics || [];
  }

  function compute(curriculum, checkedSet) {
    let total = 0, done = 0;
    const perPhase = {};
    for (const phase of curriculum.phases) {
      let pTotal = 0, pDone = 0;
      for (const topic of phaseTopics(phase)) {
        topic.items.forEach((_, i) => {
          pTotal++;
          if (checkedSet.has(phase.id + "." + topic.id + "." + i)) pDone++;
        });
      }
      total += pTotal;
      done += pDone;
      perPhase[phase.id] = {
        total: pTotal,
        done: pDone,
        pct: pTotal ? Math.round((pDone / pTotal) * 100) : 0,
      };
    }
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0, perPhase };
  }

  function updateTopbar(pct) {
    document.getElementById("topbar-fill").style.width = pct + "%";
    document.getElementById("topbar-pct").textContent = "%" + pct;
    document.getElementById("topbar-progress").setAttribute("aria-valuenow", pct);
  }

  function updateDonuts(perPhase) {
    for (const [phaseId, stats] of Object.entries(perPhase)) {
      const fill = document.querySelector('.donut__fill[data-phase="' + phaseId + '"]');
      const label = document.querySelector('.phase-card__pct[data-phase="' + phaseId + '"]');
      if (!fill) continue;
      const circumference = parseFloat(fill.getAttribute("data-circumference"));
      fill.style.strokeDashoffset = circumference * (1 - stats.pct / 100);
      fill.classList.toggle("done", stats.pct === 100);
      if (label) label.textContent = "%" + stats.pct;
    }
  }

  function maybeCelebrate(pct) {
    let celebrated;
    try {
      celebrated = JSON.parse(localStorage.getItem(CELEBRATED_KEY)) || [];
    } catch (e) {
      celebrated = [];
    }
    for (const t of THRESHOLDS) {
      if (pct >= t.pct && !celebrated.includes(t.pct)) {
        celebrated.push(t.pct);
        localStorage.setItem(CELEBRATED_KEY, JSON.stringify(celebrated));
        showOverlay(t.msg);
        break; // aynı anda tek kutlama
      }
    }
  }

  function showOverlay(msg) {
    const overlay = document.getElementById("celebration");
    document.getElementById("celebration-text").textContent = msg;
    overlay.classList.add("show");
    setTimeout(() => overlay.classList.remove("show"), 2000);
  }

  window.SwarmProgress = {
    phaseTopics: phaseTopics,
    compute: compute,
    /* render sonrası ve her checkbox değişiminde çağrılır */
    refresh: function (curriculum, checkedSet, celebrate) {
      const stats = compute(curriculum, checkedSet);
      updateTopbar(stats.pct);
      updateDonuts(stats.perPhase);
      if (celebrate) maybeCelebrate(stats.pct);
      return stats;
    },
  };
})();
