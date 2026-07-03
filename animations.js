/* ════════════════════════════════════════════════════════════════
   REFINED ANIMATION ENGINE
   - No preloader, no custom cursor, no particles, no 3D tilt
   - Just: scroll reveals, nav progress, count-up, smooth scroll
   - Everything else is pure CSS
   ════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const CvAnimations = {};
  window.CvAnimations = CvAnimations;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────── SCROLL PROGRESS + NAV STATE ─────────── */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    const navFill = document.getElementById('nav-progress');
    const nav = document.getElementById('main-nav');
    let ticking = false;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      if (bar) bar.style.width = progress + '%';
      if (navFill) navFill.style.width = progress + '%';

      if (nav) {
        if (scrollTop > 40) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
      }

      updateActiveNav();
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id], #hero');
    const navLinks = document.querySelectorAll('[data-nav-link]');
    let current = '';
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos && sec.offsetTop + sec.offsetHeight > scrollPos) {
        current = sec.id;
      }
    });
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' + current) link.classList.add('active');
      else link.classList.remove('active');
    });
  }

  /* ─────────── SCROLL REVEAL ─────────── */
  let revealObserver;
  function observeReveals() {
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-revealed'));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
            entry.target.style.setProperty('--reveal-delay', delay + 'ms');
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach(el => {
      revealObserver.observe(el);
    });
  }
  CvAnimations.observeReveals = observeReveals;
  CvAnimations.startCountUp = startCountUp;
  CvAnimations.initLangBars = initLangBars;

  /* ─────────── COUNT-UP STATS ─────────── */
  function startCountUp() {
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-count-up][data-count]').forEach(el => {
        const target = parseFloat(el.getAttribute('data-count'));
        const isDecimal = String(el.getAttribute('data-count')).includes('.');
        el.textContent = isDecimal ? target.toFixed(2) : target;
      });
      return;
    }
    document.querySelectorAll('[data-count-up][data-count]').forEach(el => {
      const target = parseFloat(el.getAttribute('data-count'));
      const isDecimal = String(el.getAttribute('data-count')).includes('.');
      const duration = 900;
      const start = performance.now();

      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = target * eased;
        el.textContent = isDecimal ? val.toFixed(2) : Math.floor(val);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = isDecimal ? target.toFixed(2) : target;
      }
      // Use IntersectionObserver to start when visible
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            requestAnimationFrame(tick);
            io.unobserve(el);
          }
        });
      }, { threshold: 0.5 });
      io.observe(el);
    });
  }

  /* ─────────── LANGUAGE BARS ─────────── */
  function initLangBars() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.lang-fill[data-width]').forEach(el => {
        el.style.width = el.getAttribute('data-width');
      });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          setTimeout(() => {
            el.style.width = el.getAttribute('data-width');
          }, 150);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.lang-fill[data-width]').forEach(el => io.observe(el));
  }

  /* ─────────── SMOOTH ANCHOR SCROLL ─────────── */
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ─────────── RIPPLE ON CLICK (subtle, only on primary buttons) ─────────── */
  function initRipples() {
    if (prefersReducedMotion) return;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-primary');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute;border-radius:50%;background:rgba(255,255,255,0.35);
        width:${size}px;height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
        pointer-events:none;transform:scale(0);opacity:1;
        transition:transform .55s ease-out, opacity .55s ease-out;
      `;
      btn.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(2.2)';
        ripple.style.opacity = '0';
      });
      setTimeout(() => ripple.remove(), 600);
    });
  }

  /* ─────────── INIT ALL ─────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initSmoothScroll();
    initRipples();
    // Run reveals after a tiny delay so dynamically rendered content is in the DOM
    setTimeout(() => {
      observeReveals();
      startCountUp();
      initLangBars();
    }, 100);
  });

})();
