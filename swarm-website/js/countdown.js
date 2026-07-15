/* ═══════════════════════════════════════════════
   countdown.js — Teknofest 2027 geri sayımı
   (gün : saat : dakika, flip mikro animasyonlu)
   ═══════════════════════════════════════════════ */
(function () {
  "use strict";

  // Kesin tarih açıklanınca güncellenecek — şimdilik 1 Eylül 2027
  const TARGET = new Date("2027-09-01T09:00:00+03:00");

  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
  };
  if (!els.days) return;

  function setValue(el, value) {
    const text = String(value).padStart(2, "0");
    if (el.textContent === text) return;
    el.classList.add("flip");
    setTimeout(() => {
      el.textContent = text;
      el.classList.remove("flip");
    }, 150);
  }

  function tick() {
    let diff = TARGET - new Date();
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000) % 24;
    const mins = Math.floor(diff / 60000) % 60;

    setValue(els.days, days);
    setValue(els.hours, hours);
    setValue(els.mins, mins);
  }

  tick();
  setInterval(tick, 1000);
})();
