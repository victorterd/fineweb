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

  // Contact form -> opens the user's email client with a prefilled message
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const phone = (data.get('phone') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const service = (data.get('service') || '').toString();
    const message = (data.get('message') || '').toString().trim();

    const subject = `Cerere ofertă — ${name}${service ? ` (${service})` : ''}`;
    const body = [
      `Nume: ${name}`,
      `Email: ${email}`,
      phone ? `Telefon: ${phone}` : null,
      `Serviciu: ${service}`,
      '',
      'Despre proiect:',
      message,
    ].filter(Boolean).join('\n');

    window.location.href =
      `mailto:contact@fineweb.ro?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  // Cookie consent banner (cheia si durata de 6 luni conform Politicii de Cookies)
  const cookieBanner = document.getElementById('cookie-banner');
  const CONSENT_KEY = 'fw_cookie_consent';
  const CONSENT_MAX_AGE = 6 * 30 * 24 * 60 * 60 * 1000; // ~6 luni

  const readConsent = () => {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data.ts || Date.now() - data.ts > CONSENT_MAX_AGE) return null; // consimtamant expirat
      return data.choice || null;
    } catch (e) {
      return null;
    }
  };

  const openCookieBanner = () => {
    cookieBanner.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      cookieBanner.classList.add('is-open');
    }));
  };

  const closeCookieBanner = (choice) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ choice, ts: Date.now() }));
    } catch (e) { /* navigare privata */ }
    cookieBanner.classList.remove('is-open');
    cookieBanner.addEventListener('transitionend', () => {
      cookieBanner.hidden = true;
    }, { once: true });
  };

  if (cookieBanner) {
    document.getElementById('cookie-accept')?.addEventListener('click', () => closeCookieBanner('all'));
    document.getElementById('cookie-necessary')?.addEventListener('click', () => closeCookieBanner('necessary'));

    if (!readConsent()) {
      setTimeout(openCookieBanner, 1200);
    }

    // linkul permanent "Setari cookie-uri" din footer redeschide bannerul
    document.getElementById('cookie-settings')?.addEventListener('click', () => {
      openCookieBanner();
      cookieBanner.querySelector('.btn')?.focus();
    });
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
