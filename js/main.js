/* ═══════════════════════════════════════════════
   main.js — scroll reveal, nav, marquee, logbook,
   3D tilt, form fallback, easter egg
   ═══════════════════════════════════════════════ */
(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Scroll reveal (IntersectionObserver) ───── */
  const reveals = document.querySelectorAll(".reveal");
  if (reducedMotion) {
    reveals.forEach((el) => el.classList.add("visible"));
  } else {
    // kardeş .reveal'lar arası 100ms stagger
    const groups = new Map();
    reveals.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, 0);
      el.style.setProperty("--stagger", groups.get(parent) * 100 + "ms");
      groups.set(parent, groups.get(parent) + 1);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* ── Mobil nav ──────────────────────────────── */
  const navToggle = document.querySelector(".nav__toggle");
  const navLinks = document.querySelector(".nav__links");
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open);
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ── Teknoloji marquee ──────────────────────── */
  const TECH = [
    ["ROS 2", "Robot işletim sistemi — düğümler arası haberleşme"],
    ["Gazebo", "3D fizik simülasyon ortamı"],
    ["PX4", "Açık kaynak uçuş kontrol yazılımı"],
    ["Pixhawk 6C", "Uçuş kontrol kartı (donanım)"],
    ["Raspberry Pi 4", "Dron üstü yardımcı bilgisayar"],
    ["MAVLink", "Dron haberleşme protokolü"],
    ["OpenCV", "Görüntü işleme kütüphanesi"],
    ["Python", "Algoritma prototipleme dili"],
    ["C++", "Gerçek zamanlı uçuş kodu"],
    ["STM32", "Gömülü mikrodenetleyici"],
  ];
  const track = document.getElementById("marquee-track");
  if (track) {
    // sonsuz döngü için içerik iki kez basılır
    for (let pass = 0; pass < 2; pass++) {
      TECH.forEach(([name, tip]) => {
        const tag = document.createElement("span");
        tag.className = "tech-tag";
        tag.textContent = name;
        tag.setAttribute("data-tip", tip);
        if (pass === 1) tag.setAttribute("aria-hidden", "true");
        track.appendChild(tag);
      });
    }
  }

  /* ── Uçuş kayıt defteri (logs.json) ─────────── */
  const FALLBACK_LOGS = [
    { date: "2026-07-10", title: "Ekip kuruldu", desc: "3 kişilik çekirdek kadro tamam. Hedef: Teknofest 2027 Sürü İHA." },
    { date: "2026-07-12", title: "Web sitesi yayında", desc: "Bu sayfanın arka planındaki sürü bile bizim flocking kodumuzla uçuyor." },
  ];
  const logBody = document.getElementById("logbook-body");
  function renderLogs(logs) {
    logBody.innerHTML = "";
    logs
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((log) => {
        const entry = document.createElement("div");
        entry.className = "log-entry";
        entry.innerHTML =
          '<p class="log-entry__line"><span class="log-entry__date">' +
          log.date + "</span>" + log.title + "</p>" +
          '<p class="log-entry__desc">' + log.desc + "</p>";
        logBody.appendChild(entry);
      });
    const cursorLine = document.createElement("p");
    cursorLine.className = "log-entry__line";
    cursorLine.innerHTML = '<span class="log-cursor"></span>';
    logBody.appendChild(cursorLine);
  }
  if (logBody) {
    fetch("data/logs.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(renderLogs)
      .catch(() => renderLogs(FALLBACK_LOGS)); // file:// veya fetch hatasında
  }

  /* ── Ekip kartları 3D tilt ──────────────────── */
  if (!reducedMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(600px) rotateX(" + (-py * 8) + "deg) rotateY(" + (px * 8) + "deg)";
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ── Form: Formspree ayarlanmadıysa mailto ──── */
  const form = document.getElementById("join-form");
  if (form && form.action.includes("YOUR_FORM_ID")) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const body =
        "İsim: " + data.get("name") +
        "\nBölüm/Sınıf: " + data.get("department") +
        "\nİlgi Alanı: " + data.get("interest") +
        "\n\n" + data.get("message");
      location.href =
        "mailto:kayalarbk2004@gmail.com?subject=" +
        encodeURIComponent("SwarmTech Ekibe Katılım — " + data.get("name")) +
        "&body=" + encodeURIComponent(body);
    });
  }

  /* ── Easter egg 🥚: footer dronu → sürüye +5 ── */
  const egg = document.getElementById("easter-egg");
  egg.addEventListener("click", () => {
    if (typeof window.addDronesToSwarm === "function") {
      window.addDronesToSwarm(5);
      egg.style.transform = "translateY(-6px) rotate(-15deg) scale(1.2)";
      setTimeout(() => (egg.style.transform = ""), 300);
    }
  });

  /* ── Footer yılı ────────────────────────────── */
  document.getElementById("footer-year").textContent = new Date().getFullYear();
})();
