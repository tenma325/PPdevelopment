(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     Reveal on scroll
  -------------------------------------------------------------------------- */
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('revealed'));
  }

  /* --------------------------------------------------------------------------
     Header scroll state
  -------------------------------------------------------------------------- */
  const header = document.querySelector('.site-header');
  let lastScroll = 0;
  function updateHeader() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    lastScroll = y;
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* --------------------------------------------------------------------------
     Background: the gold 3D constellation (dots + proximity lines) is
     rendered into #flow-canvas by constellation3d.js (Three.js module).
  -------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------
     Mouse parallax for satellite cards (subtle)
  -------------------------------------------------------------------------- */
  if (!prefersReducedMotion) {
    const surface = document.querySelector('.neural-surface');
    const satellites = document.querySelectorAll('.satellite-card');
    if (surface && satellites.length && window.matchMedia('(pointer: fine)').matches) {
      let rafId;
      let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

      window.addEventListener('mousemove', (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetX = (e.clientX - cx) / cx;
        targetY = (e.clientY - cy) / cy;
      }, { passive: true });

      function animate() {
        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;

        satellites.forEach((card, i) => {
          const depth = (i + 1) * 4;
          const offsetX = currentX * depth * -1;
          const offsetY = currentY * depth * -1;
          const baseTransform = card.classList.contains('revealed')
            ? getBaseTransform(card)
            : '';
          card.style.transform = `${baseTransform} translate(${offsetX}px, ${offsetY}px)`;
        });

        rafId = requestAnimationFrame(animate);
      }

      // Keep original hover scaling working by resetting on mouseleave
      surface.addEventListener('mouseleave', () => {
        satellites.forEach(card => card.style.transform = '');
      });

      function getBaseTransform(card) {
        if (card.classList.contains('satellite-card--left')) return 'translateY(-50%) translateX(0)';
        if (card.classList.contains('satellite-card--right')) return 'translateY(-50%) translateX(0)';
        if (card.classList.contains('satellite-card--bottom')) return 'translateX(-50%)';
        return '';
      }

      animate();
    }
  }

  /* --------------------------------------------------------------------------
     Live time updates (just for demo feel)
  -------------------------------------------------------------------------- */
  const livePills = document.querySelectorAll('.live-pill span:last-child');
  function updatePill() {
    const now = new Date();
    const time = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    livePills.forEach(el => el.textContent = `稼働中 · ${time}`);
  }
  updatePill();
  setInterval(updatePill, 60000);
})();
