(() => {
  const pill = document.getElementById('nav-pill');
  const toggle = document.getElementById('nav-toggle');

  toggle?.addEventListener('click', () => {
    const isOpen = pill.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  pill?.querySelectorAll('.main-nav a, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      pill.classList.remove('nav-open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Subtle parallax on the hero stage (desktop, no reduced-motion)
  const stage = document.getElementById('hero-stage');
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (stage && finePointer && !reducedMotion) {
    const hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 .. 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      stage.style.setProperty('--tilt-x', (x * -4).toFixed(2));
      stage.style.setProperty('--tilt-y', (y * 8).toFixed(2));
    });
    hero.addEventListener('mouseleave', () => {
      stage.style.setProperty('--tilt-x', '0');
      stage.style.setProperty('--tilt-y', '0');
    });
  }
})();
