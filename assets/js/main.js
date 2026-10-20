(() => {
  document.documentElement.classList.add('js');

  // declanseaza animatiile de intrare cand fonturile sunt gata (max 900ms)
  const markLoaded = () => document.body.classList.add('loaded');
  if (document.fonts?.ready) {
    document.fonts.ready.then(markLoaded);
  }
  setTimeout(markLoaded, 900);

  // Header: fundal la scroll
  const header = document.getElementById('site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Meniu mobil
  const toggle = document.getElementById('nav-toggle');
  toggle?.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  header.querySelectorAll('.main-nav a, .nav-cta').forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('nav-open');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  });

  // Reveal la scroll — doar pe ecrane mari
  const revealEls = document.querySelectorAll('.reveal');
  const smallScreen = window.matchMedia('(max-width: 760px)').matches;
  if (!smallScreen && 'IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 160px 0px' });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // FAQ: acordeon animat, inchide celelalte cand deschizi unul
  const faqItems = document.querySelectorAll('.faq-list details');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  faqItems.forEach(d => {
    const content = d.querySelector('p');
    const summary = d.querySelector('summary');
    summary.addEventListener('click', (e) => {
      if (reducedMotion) return; // comportament nativ
      e.preventDefault();
      if (d.open) {
        const anim = content.animate(
          [{ height: content.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
          { duration: 240, easing: 'ease' });
        anim.onfinish = () => { d.open = false; };
      } else {
        faqItems.forEach(o => {
          if (o !== d && o.open) {
            const c = o.querySelector('p');
            const a = c.animate(
              [{ height: c.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
              { duration: 200, easing: 'ease' });
            a.onfinish = () => { o.open = false; };
          }
        });
        d.open = true;
        content.animate(
          [{ height: '0px', opacity: 0 }, { height: content.scrollHeight + 'px', opacity: 1 }],
          { duration: 280, easing: 'cubic-bezier(.22,1,.3,1)' });
      }
    });
  });

  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const bigScreen = window.matchMedia('(min-width: 761px)').matches;

  // Screenshot-ul din hero se indreapta pe masura ce derulezi
  const shot = document.getElementById('shot-frame');
  if (shot && bigScreen && !reducedMotion) {
    let ticking = false;
    const updateShot = () => {
      ticking = false;
      const r = shot.getBoundingClientRect();
      // progres: 0 cand rama e jos in viewport, 1 cand a urcat spre centru
      const p = Math.min(1, Math.max(0, 1 - (r.top - window.innerHeight * 0.18) / (window.innerHeight * 0.6)));
      shot.style.setProperty('--shot-tilt', (9 * (1 - p)).toFixed(2));
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateShot); }
    }, { passive: true });
    updateShot();
  }

  // Butoane magnetice
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
        const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
        btn.style.transform = `translate(${(x * 4).toFixed(1)}px, ${(y * 3 - 2).toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    // Tilt 3D discret pe cardurile demo
    document.querySelectorAll('.d-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateY(${(x * 4).toFixed(2)}deg) rotateX(${(-y * 4).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  // Pretul creste pana la 999 cand intra in ecran
  const suma = document.getElementById('pret-suma');
  if (suma && 'IntersectionObserver' in window && !reducedMotion) {
    const target = parseInt(suma.dataset.target, 10) || 999;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const dur = 900;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        suma.textContent = `${Math.round(target * eased)}\u00A0\u20AC`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(suma);
  }

  // Testimoniale: slider cu sageti si puncte
  const track = document.getElementById('t-track');
  if (track) {
    const cards = [...track.children];
    const dotsWrap = document.getElementById('t-dots');
    const dots = cards.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Testimonialul ${i + 1}`);
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
      return b;
    });

    let current = 0;
    const setActive = (i) => {
      current = i;
      dots.forEach((d, j) => d.classList.toggle('active', j === i));
    };
    const goTo = (i) => {
      const n = (i + cards.length) % cards.length;
      track.scrollTo({ left: cards[n].offsetLeft - track.offsetLeft, behavior: 'smooth' });
      setActive(n);
    };
    document.getElementById('t-prev')?.addEventListener('click', () => goTo(current - 1));
    document.getElementById('t-next')?.addEventListener('click', () => goTo(current + 1));

    // sincronizeaza punctele cand utilizatorul da swipe
    let scrollTimer;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        setActive(Math.min(cards.length - 1, Math.max(0, i)));
      }, 80);
    }, { passive: true });

    setActive(0);
  }

  // Formular demo -> FormSubmit, cu fallback pe mailto
  const form = document.getElementById('demo-form');
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/victorprodan17@gmail.com';
  const FORM_FALLBACK_EMAIL = 'victorprodan17@gmail.com';

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const phone = (data.get('phone') || '').toString().trim();
    const firm = (data.get('firm') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();
    const subject = `Cerere demo — ${name}${firm ? ` (${firm})` : ''}`;

    const submitBtn = document.getElementById('form-submit');
    const status = document.getElementById('form-status');
    const btnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Se trimite…';
    status.hidden = true;
    status.classList.remove('is-error');

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: subject,
          _template: 'table',
          _captcha: 'false',
          Nume: name,
          Telefon: phone,
          Firma: firm || '—',
          Mesaj: message || '—',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      form.reset();
      status.textContent = 'Mulțumim! Te sunăm în aceeași zi lucrătoare ca să stabilim ora.';
      status.hidden = false;
    } catch (err) {
      status.textContent = 'Nu am putut trimite cererea automat. Se deschide emailul…';
      status.classList.add('is-error');
      status.hidden = false;

      const body = [
        `Nume: ${name}`,
        `Telefon: ${phone}`,
        firm ? `Firma: ${firm}` : null,
        message ? `\nMesaj:\n${message}` : null,
      ].filter(Boolean).join('\n');
      window.location.href =
        `mailto:${FORM_FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } finally {
      submitBtn.innerHTML = btnHtml;
      submitBtn.disabled = false;
    }
  });
})();
