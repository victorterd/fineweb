(() => {
  document.documentElement.classList.add('js');

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

  // FAQ: inchide celelalte cand deschizi unul
  const faqItems = document.querySelectorAll('.faq-list details');
  faqItems.forEach(d => {
    d.addEventListener('toggle', () => {
      if (d.open) faqItems.forEach(o => { if (o !== d) o.open = false; });
    });
  });

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
