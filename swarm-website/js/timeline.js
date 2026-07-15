/* ═══════════════════════════════════════════════
   timeline.js — Yol haritası çizgisinin scroll'a
   bağlı cyan dolumu (SVG stroke-dashoffset)
   ═══════════════════════════════════════════════ */
(function () {
  "use strict";

  const timeline = document.getElementById("timeline");
  const progress = document.getElementById("timeline-progress");
  if (!timeline || !progress) return;

  let lineLength = 0;

  function measure() {
    lineLength = timeline.offsetHeight;
    progress.style.strokeDasharray = lineLength;
    progress.style.strokeDashoffset = lineLength;
  }

  function update() {
    const rect = timeline.getBoundingClientRect();
    const viewH = window.innerHeight;
    // çizgi, timeline'ın üstü ekran ortasına gelince dolmaya başlar
    const total = rect.height;
    const passed = Math.min(Math.max(viewH * 0.6 - rect.top, 0), total);
    progress.style.strokeDashoffset = lineLength * (1 - passed / total);
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    measure();
    progress.style.strokeDashoffset = 0; // tamamen dolu, animasyonsuz
    return;
  }

  measure();
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", () => { measure(); update(); });
})();
