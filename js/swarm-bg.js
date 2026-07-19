/* ═══════════════════════════════════════════════
   swarm-bg.js — Hero arka planı: soluk, yavaş,
   dikkat dağıtmayan flocking (15-20 boid)
   ═══════════════════════════════════════════════ */
(function () {
  "use strict";

  const canvas = document.getElementById("swarm-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CONFIG = {
    count: 18,
    neighborRadius: 70,
    separationRadius: 26,
    maxSpeed: 0.8,
    maxForce: 0.02,
    color: "rgba(0, 113, 227, 0.35)",
  };

  // Boid rengi temadan gelir (--boid); tema değişince tazelenir
  function readColor() {
    const c = getComputedStyle(document.documentElement).getPropertyValue("--boid").trim();
    if (c) CONFIG.color = c;
  }
  readColor();
  window.addEventListener("themechange", () => {
    readColor();
    if (reducedMotion) drawStatic();
  });

  let width, height, boids = [];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
  }

  function makeBoid() {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * CONFIG.maxSpeed * 0.5,
      vy: Math.sin(angle) * CONFIG.maxSpeed * 0.5,
      size: 1.2 + Math.random() * 1.3,
    };
  }

  function limit(vx, vy, max) {
    const mag = Math.hypot(vx, vy);
    if (mag > max) return [vx / mag * max, vy / mag * max];
    return [vx, vy];
  }

  function step(boid) {
    let sepX = 0, sepY = 0, sepCount = 0;
    let aliX = 0, aliY = 0;
    let cohX = 0, cohY = 0, neighborCount = 0;

    for (const other of boids) {
      if (other === boid) continue;
      const dx = other.x - boid.x;
      const dy = other.y - boid.y;
      const d = Math.hypot(dx, dy);
      if (d > 0 && d < CONFIG.neighborRadius) {
        neighborCount++;
        aliX += other.vx; aliY += other.vy;
        cohX += other.x;  cohY += other.y;
        if (d < CONFIG.separationRadius) {
          sepX -= dx / d; sepY -= dy / d; sepCount++;
        }
      }
    }

    let ax = 0, ay = 0;
    if (sepCount > 0) {
      const [fx, fy] = limit(sepX / sepCount, sepY / sepCount, CONFIG.maxForce);
      ax += fx * 1.5; ay += fy * 1.5;
    }
    if (neighborCount > 0) {
      let [fx, fy] = limit(aliX / neighborCount - boid.vx, aliY / neighborCount - boid.vy, CONFIG.maxForce);
      ax += fx; ay += fy;
      [fx, fy] = limit((cohX / neighborCount - boid.x) * 0.01, (cohY / neighborCount - boid.y) * 0.01, CONFIG.maxForce);
      ax += fx * 0.9; ay += fy * 0.9;
    }

    boid.vx += ax; boid.vy += ay;
    [boid.vx, boid.vy] = limit(boid.vx, boid.vy, CONFIG.maxSpeed);
    boid.x += boid.vx; boid.y += boid.vy;

    if (boid.x < -10) boid.x = width + 10;
    if (boid.x > width + 10) boid.x = -10;
    if (boid.y < -10) boid.y = height + 10;
    if (boid.y > height + 10) boid.y = -10;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = CONFIG.color;
    for (const b of boids) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    for (const b of boids) step(b);
    draw();
    requestAnimationFrame(loop);
  }

  function drawStatic() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = CONFIG.color;
    for (let i = 0; i < CONFIG.count; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  resize();
  boids = Array.from({ length: CONFIG.count }, makeBoid);

  window.addEventListener("resize", () => {
    resize();
    if (reducedMotion) drawStatic();
  });

  if (reducedMotion) {
    drawStatic();
  } else {
    loop();
  }
})();
