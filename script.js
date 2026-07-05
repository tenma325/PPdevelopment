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
     Organic flow canvas
     Draws a subtle, slowly moving field of gold particles connected by
     proximity lines. Reinforces the neural / organic feeling.
  -------------------------------------------------------------------------- */
  const canvas = document.getElementById('flow-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 58;
    const maxDist = 140;
    const maxConnections = 3;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.5 + 0.6,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    resize();
    createParticles();
    window.addEventListener('resize', () => { resize(); createParticles(); });

    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Update
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.01;
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      });

      // Draw connections first
      for (let i = 0; i < particles.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < particles.length && connections < maxConnections; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.hypot(dx, dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201, 184, 160, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            connections++;
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        const alpha = 0.35 + Math.sin(p.phase) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 213, 183, ${alpha})`;
        ctx.fill();
      });

      frame++;
      if (frame % 2 === 0) {
        requestAnimationFrame(draw);
      } else {
        requestAnimationFrame(draw);
      }
    }

    requestAnimationFrame(draw);
  }

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
