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

  // la prima navigare interna randam tot, ca ancorele sa aterizeze exact
  document.querySelectorAll('a[href*="#"]').forEach(a => {
    a.addEventListener('click', () => document.body.classList.add('cv-off'));
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

  }

  // Exemple: comutator intre cele trei tipuri de firma
  const dx = document.getElementById('dx');
  if (dx) {
    const tabs = [...dx.querySelectorAll('.dx-tab')];
    const panels = [...dx.querySelectorAll('.dx-panel')];
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const ex = tab.dataset.ex;
        if (dx.dataset.ex === ex) return;
        dx.dataset.ex = ex;
        tabs.forEach(t => {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', String(t === tab));
        });
        panels.forEach(p => {
          if (p.dataset.ex === ex) {
            p.classList.add('active');
            p.classList.remove('play');
            void p.offsetWidth; // reporneste intrarea chips-urilor
            p.classList.add('play');
          } else {
            p.classList.remove('active', 'play');
          }
        });
      });
    });
  }

  // Sectiunea de nise: lista tipografica cu card care urmareste cursorul / acordeon pe mobil
  const niseBig = document.getElementById('nise-big');
  if (niseBig) {
    const rows = [...niseBig.querySelectorAll('.nb-row')];
    const card = document.getElementById('nise-card');
    const ncIcon = document.getElementById('nc-icon');
    const ncDesc = document.getElementById('nc-desc');
    const niseSection = niseBig.closest('.nise');
    const isMobileList = () => window.matchMedia('(max-width: 900px)').matches;

    // cursorul-card (doar desktop, mouse)
    if (card && finePointer && !reducedMotion) {
      let tx = 0, ty = 0, cx = 0, cy = 0, raf = null, visible = false;

      const loop = () => {
        cx += (tx - cx) * 0.16;
        cy += (ty - cy) * 0.16;
        const tilt = Math.max(-5, Math.min(5, (tx - cx) * 0.06));
        card.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${tilt.toFixed(2)}deg)`;
        if (visible || Math.abs(tx - cx) > 0.5) {
          raf = requestAnimationFrame(loop);
        } else {
          raf = null;
        }
      };

      niseBig.addEventListener('mousemove', (e) => {
        if (isMobileList()) return;
        const sr = niseSection.getBoundingClientRect();
        tx = e.clientX - sr.left + 26;
        ty = e.clientY - sr.top - 40;
        // nu lasa cardul sa iasa din dreapta
        tx = Math.min(tx, sr.width - 310);
        if (!raf) { cx = tx; cy = ty; raf = requestAnimationFrame(loop); }
      });

      rows.forEach(row => {
        row.addEventListener('mouseenter', () => {
          if (isMobileList()) return;
          const cs = getComputedStyle(row);
          card.style.setProperty('--pc', cs.getPropertyValue('--pc'));
          card.style.setProperty('--pc-soft', cs.getPropertyValue('--pc-soft'));
          ncIcon.innerHTML = row.querySelector('.nb-ico').innerHTML;
          ncDesc.textContent = row.querySelector('.nb-desc').textContent;
          card.classList.add('on');
          visible = true;
          if (!raf) raf = requestAnimationFrame(loop);
        });
      });
      niseBig.addEventListener('mouseleave', () => {
        card.classList.remove('on');
        visible = false;
      });
    }

    // acordeon pe mobil
    rows.forEach(row => {
      row.addEventListener('click', () => {
        if (!isMobileList()) return;
        const wasOpen = row.classList.contains('open');
        rows.forEach(r => { r.classList.remove('open'); r.setAttribute('aria-expanded', 'false'); });
        if (!wasOpen) {
          row.classList.add('open');
          row.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // Functionalitati: scena scrollytelling (desktop) / stiva (mobil)
  const show = document.getElementById('feats-show');
  if (show) {
    const items = [...show.querySelectorAll('.fs-item')];
    const slides = [...show.querySelectorAll('.fs-slide')];
    const bar = document.getElementById('fs-bar');
    const tag = document.getElementById('fs-tag');
    const staticFeats = window.matchMedia('(max-width: 900px)').matches || reducedMotion;

    if (staticFeats) {
      // mobil: fiecare slide se muta sub titlul lui si ruleaza animatiile la vedere
      items.forEach((item, i) => {
        if (slides[i]) {
          item.after(slides[i]);
          slides[i].setAttribute('aria-hidden', 'false');
        }
      });
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('active', 'play'); io.unobserve(e.target); }
          });
        }, { threshold: 0.3 });
        slides.forEach(s => io.observe(s));
      } else {
        slides.forEach(s => s.classList.add('active', 'play'));
      }
    } else {
      let current = 0, ticking = false;

      const setStep = (step) => {
        if (step === current) return;
        current = step;
        show.dataset.step = String(step);
        items.forEach((it, i) => it.classList.toggle('active', i === step));
        slides.forEach((sl, i) => {
          sl.classList.toggle('leaving', i < step);
          if (i === step) {
            sl.classList.add('active');
            sl.classList.remove('play');
            void sl.offsetWidth; // reporneste animatiile interne
            sl.classList.add('play');
            sl.setAttribute('aria-hidden', 'false');
          } else {
            sl.classList.remove('active');
            sl.setAttribute('aria-hidden', 'true');
          }
        });
        if (tag) tag.textContent = slides[step].dataset.tag;
      };

      const update = () => {
        ticking = false;
        const rect = show.getBoundingClientRect();
        const total = show.offsetHeight - window.innerHeight;
        const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
        if (bar) bar.style.height = `${(p * 100).toFixed(1)}%`;
        setStep(Math.min(slides.length - 1, Math.floor(p * slides.length)));
      };
      window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      update();

      // click pe un titlu -> sare la pasul respectiv
      items.forEach((item, i) => {
        item.addEventListener('click', () => {
          const total = show.offsetHeight - window.innerHeight;
          const top = window.scrollY + show.getBoundingClientRect().top;
          window.scrollTo({ top: top + total * ((i + 0.55) / slides.length), behavior: 'smooth' });
        });
      });
    }
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

  /* ===== CTA sticky in josul ecranului ===== */
  const stickyCta = document.getElementById('sticky-cta');
  if (stickyCta) {
    // se ascunde cand sectiunea de programare sau footerul sunt pe ecran
    const hidingZones = new Set();
    const updateSticky = () => {
      const show = window.scrollY > window.innerHeight * 0.85 && hidingZones.size === 0;
      stickyCta.classList.toggle('show', show);
    };
    const zoneObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) hidingZones.add(e.target);
        else hidingZones.delete(e.target);
      });
      updateSticky();
    }, { rootMargin: '0px 0px -10% 0px' });
    const progSection = document.getElementById('programeaza');
    const footer = document.querySelector('.site-footer');
    if (progSection) zoneObs.observe(progSection);
    if (footer) zoneObs.observe(footer);
    window.addEventListener('scroll', updateSticky, { passive: true });
    updateSticky();
  }
})();
