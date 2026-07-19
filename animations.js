// ═════════════════════════════════════════════════════════════
// Luxury animation layer — shared by index.html and admin.html.
// Everything here respects prefers-reduced-motion: if the visitor's
// system asks for reduced motion, content simply appears instantly.
// ═════════════════════════════════════════════════════════════
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Scroll reveal (fade + rise) ---------- */
const revealObserver = ('IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }) : null;

function initReveal(root = document) {
  const els = root.querySelectorAll('.reveal:not(.revealed)');
  els.forEach((el, i) => {
    if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', i % 12);
    if (prefersReducedMotion || !revealObserver) el.classList.add('revealed');
    else revealObserver.observe(el);
  });
}

/* ---------- Count-up stat numbers (GPA, years, cert count...) ---------- */
function animateCount(el, target) {
  const isNumeric = /^-?\d+(\.\d+)?$/.test(String(target).trim());
  if (prefersReducedMotion || !isNumeric) { el.textContent = target; return; }
  const end = parseFloat(target);
  const decimals = (String(target).split('.')[1] || '').length;
  const duration = 1100;
  const start = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (end * eased).toFixed(decimals);
    if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
  }
  requestAnimationFrame(tick);
}
function initStatCounters() {
  const box = document.querySelector('.hero-stats');
  if (!box) return;
  const run = () => document.querySelectorAll('.stat-box .stat-num').forEach(el => {
    const t = el.textContent.trim();
    if (t && t !== '—') animateCount(el, t);
  });
  if (!('IntersectionObserver' in window)) { run(); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { run(); obs.disconnect(); } });
  }, { threshold: 0.4 });
  obs.observe(box);
}

/* ---------- Language proficiency bars fill on scroll ---------- */
function initLangBars(root = document) {
  const bars = root.querySelectorAll('.lang-fill[data-pct]');
  if (!bars.length) return;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    bars.forEach(b => b.style.width = b.dataset.pct + '%');
    return;
  }
  bars.forEach(b => { if (!b.style.width || b.style.width === '0%') b.style.width = '0%'; });
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.pct + '%';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  bars.forEach(b => obs.observe(b));
}

/* ---------- Timeline line draws in once visible ---------- */
function initTimelineDraw() {
  const tl = document.querySelector('.timeline');
  if (!tl || tl.classList.contains('in-view')) return;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) { tl.classList.add('in-view'); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { tl.classList.add('in-view'); obs.disconnect(); } });
  }, { threshold: 0.1 });
  obs.observe(tl);
}

/* ---------- Nav: shrink shadow on scroll + active-section highlight ---------- */
function initNavEffects() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;
  const sections = [...links].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (!link) return;
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* ---------- Magnetic buttons: gently follow the cursor ---------- */
function initMagnetic(selector = '.btn-primary, .btn-outline') {
  if (prefersReducedMotion) return;
  document.querySelectorAll(selector).forEach(btn => {
    if (btn._magnetic) return;
    btn._magnetic = true;
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.22;
      const y = (e.clientY - r.top - r.height / 2) * 0.32;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ---------- Tilt effect on grid cards ---------- */
function initTilt(selector = '.cert-card, .skill-cat-card') {
  if (prefersReducedMotion) return;
  document.querySelectorAll(selector).forEach(card => {
    if (card._tilt) return;
    card._tilt = true;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ---------- Cursor-follow spotlight glow in the hero ---------- */
function initSpotlight() {
  const hero = document.querySelector('.hero');
  if (!hero || prefersReducedMotion) return;
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  });
}

/* ---------- Ambient drifting gold particles behind the hero ---------- */
function initParticles() {
  if (prefersReducedMotion) return;
  const hero = document.querySelector('.hero');
  if (!hero || hero.querySelector('.hero-particles')) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-particles';
  canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(canvas, hero.firstChild);
  const ctx = canvas.getContext('2d');
  let w, h, particles, running = true;

  function resize() { w = canvas.width = hero.clientWidth; h = canvas.height = hero.clientHeight; }
  function makeParticles() {
    const count = Math.min(46, Math.floor(w / 28));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.35 + 0.08,
      drift: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.15
    }));
  }
  resize(); makeParticles();
  window.addEventListener('resize', () => { resize(); makeParticles(); });
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) requestAnimationFrame(frame); });

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.y -= p.speed; p.x += p.drift;
      if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  frame();
}

/** Call this once after every render pass (initial load + every Firestore update). */
function initAllAnimations(root = document) {
  initReveal(root);
  initLangBars(root);
  initTimelineDraw();
  initTilt();
  initMagnetic();
}

/** Call this once, on first page load. */
function initPageAnimations() {
  initNavEffects();
  initSpotlight();
  initParticles();
  initStatCounters();
}

document.addEventListener('DOMContentLoaded', initPageAnimations);
