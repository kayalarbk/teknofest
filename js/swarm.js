/* ═══════════════════════════════════════════════
   swarm.js — Hero Canvas: Reynolds flocking
   separation / alignment / cohesion + fare hedefi
   ═══════════════════════════════════════════════ */
(function () {
  "use strict";

  const canvas = document.getElementById("swarm-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  const CONFIG = {
    count: isMobile ? 25 : 50,
    neighborRadius: 60,
    separationRadius: 24,
    maxSpeed: 2.2,
    maxForce: 0.05,
    weights: { separation: 1.6, alignment: 1.0, cohesion: 0.9, mouse: 0.35 },
    color: "#22D3EE",
  };

  let width, height, boids = [];
  const mouse = { x: null, y: null };

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
      size: 1.5 + Math.random() * 1.5,
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
      let [fx, fy] = limit(sepX / sepCount, sepY / sepCount, CONFIG.maxForce);
      ax += fx * CONFIG.weights.separation;
      ay += fy * CONFIG.weights.separation;
    }
    if (neighborCount > 0) {
      // alignment: komşuların ortalama hızına yönel
      let [fx, fy] = limit(aliX / neighborCount - boid.vx, aliY / neighborCount - boid.vy, CONFIG.maxForce);
      ax += fx * CONFIG.weights.alignment;
      ay += fy * CONFIG.weights.alignment;
      // cohesion: komşuların merkezine yönel
      const cx = cohX / neighborCount - boid.x;
      const cy = cohY / neighborCount - boid.y;
      [fx, fy] = limit(cx * 0.01, cy * 0.01, CONFIG.maxForce);
      ax += fx * CONFIG.weights.cohesion;
      ay += fy * CONFIG.weights.cohesion;
    }
    // fare = hedef nokta
    if (mouse.x !== null) {
      const mx = mouse.x - boid.x;
      const my = mouse.y - boid.y;
      const [fx, fy] = limit(mx * 0.005, my * 0.005, CONFIG.maxForce);
      ax += fx * CONFIG.weights.mouse;
      ay += fy * CONFIG.weights.mouse;
    }

    boid.vx += ax; boid.vy += ay;
    [boid.vx, boid.vy] = limit(boid.vx, boid.vy, CONFIG.maxSpeed);
    boid.x += boid.vx; boid.y += boid.vy;

    // kenarlardan sarmal geçiş
    if (boid.x < -10) boid.x = width + 10;
    if (boid.x > width + 10) boid.x = -10;
    if (boid.y < -10) boid.y = height + 10;
    if (boid.y > height + 10) boid.y = -10;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = CONFIG.color;
    ctx.shadowColor = CONFIG.color;
    ctx.shadowBlur = 6;
    for (const b of boids) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function loop() {
    for (const b of boids) step(b);
    draw();
    requestAnimationFrame(loop);
  }

  /* reduced-motion: statik yıldız deseni */
  function drawStatic() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = CONFIG.color;
    for (let i = 0; i < CONFIG.count; i++) {
      ctx.globalAlpha = 0.3 + Math.random() * 0.7;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // dışarıdan dron ekleme (footer easter egg kullanır)
  window.addDronesToSwarm = function (n) {
    for (let i = 0; i < n; i++) boids.push(makeBoid());
  };

  resize();
  boids = Array.from({ length: CONFIG.count }, makeBoid);

  window.addEventListener("resize", () => {
    resize();
    if (reducedMotion) drawStatic();
  });

  if (reducedMotion) {
    drawStatic();
    return;
  }

  canvas.parentElement.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.parentElement.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  loop();
})();
