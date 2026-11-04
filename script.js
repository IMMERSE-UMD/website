// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const carousels = {}; // kept so the arrow keys can drive them

  // ===== Hero — Mascot carousel =====
  // One pose at a time, simple crossfade. Add more slides in index.html
  // + drop more PNGs in assets/ to grow the gallery. Guarded so that
  // commenting this section out in index.html can't break the exec
  // board carousel below.
  if (document.getElementById('mascot-splide')) {
    new Splide('#mascot-splide', {
      type: 'fade',
      rewind: true,
      pagination: true,
      arrows: true,
      autoplay: !reducedMotion,
      interval: 4000,
      pauseOnHover: true,
    }).mount();
  }

  // ===== About — event recap galleries =====
  // Two independent carousels, same crossfade pattern as the hero
  // mascot carousel above. Add more the same way (new id in
  // index.html + matching block here) if you add a third gallery.
  ['about-gallery-1', 'about-gallery-2'].forEach((id) => {
    if (document.getElementById(id)) {
      new Splide(`#${id}`, {
        type: 'fade',
        rewind: true,
        pagination: true,
        arrows: true,
        autoplay: !reducedMotion,
        interval: 4000,
        pauseOnHover: true,
      }).mount();
    }
  });

  // ===== Event flyer gallery =====
  // Several flyers visible side by side (perPage), not one at a time.
  // type: 'slide' (not 'loop') since loop mode misbehaves when there
  // are fewer slides than perPage -- fine for any flyer count.
  // No autoplay on purpose -- flyers have text people need time to
  // read, so navigation is left entirely to arrows, not a timer.
  if (document.getElementById('flyer-splide')) {
    carousels.flyer = new Splide('#flyer-splide', {
      type: 'loop',
      perPage: 2,
      perMove: 1,
      gap: '1rem',
      padding: { right: '18%' },   // peek at the next flyer, like the reference
      pagination: true,
      arrows: true,
      autoplay: false,
      breakpoints: {
        640: { perPage: 1, padding: { right: '22%' } },
      },
    }).mount();
  }

  // ===== Executive Board — Splide carousel =====
  if (document.getElementById('exec-board-splide')) {
    carousels.exec = new Splide('#exec-board-splide', {
      type: 'loop',
      perPage: 4,
      perMove: 1,
      gap: '2.5rem',
      pagination: true,
      arrows: true,
      autoplay: false,
      breakpoints: {
        1100: { perPage: 3, gap: '2rem' },
        760:  { perPage: 2, gap: '1.25rem' },
        460:  { perPage: 1, padding: '2.5rem' },
      },
    }).mount();
  }

  // ===== Arrow keys for the board and flyer carousels =====
  // Left/Right moves whichever of the two carousels is most on screen.
  // Ignored while typing in a field or while a popup is open.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (document.querySelector('dialog[open]')) return;

    let best = null;
    let bestVisible = 0;
    Object.values(carousels).forEach((splide) => {
      const r = splide.root.getBoundingClientRect();
      const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      if (visible > bestVisible) { bestVisible = visible; best = splide; }
    });
    if (!best || bestVisible < 120) return;

    e.preventDefault();
    best.go(e.key === 'ArrowRight' ? '>' : '<');
  });

  // ===== Executive Board — bio popup =====
  // One shared <dialog>, filled from whichever card was clicked.
  // Each card can carry two optional attributes:
  //   data-role-desc="What this position does"  -> makes the role expandable
  //   data-linkedin="https://linkedin.com/in/..." -> shows a LinkedIn link
  const modal = document.getElementById('bioModal');
  if (modal) {
    const nameEl = modal.querySelector('.bio-modal__name');
    const roleBtn = modal.querySelector('.bio-modal__role');
    const roleText = modal.querySelector('.bio-modal__role-text');
    const roleDesc = modal.querySelector('.bio-modal__role-desc');
    const bioEl = modal.querySelector('.bio-modal__bio');
    const linkEl = modal.querySelector('.bio-modal__linkedin');
    const photoEl = modal.querySelector('.bio-modal__photo img');

    const openBio = (card) => {
      const name = card.querySelector('.exec-card__name').textContent.trim();
      nameEl.textContent = name;
      // Personal photo from board_pics shows in the popup; the card itself shows the flyer
      photoEl.src = card.dataset.photo || '';
      photoEl.alt = name;
      modal.classList.toggle('bio-modal--no-photo', !card.dataset.photo);
      roleText.textContent = card.querySelector('.exec-card__position').textContent.trim();
      bioEl.textContent = card.querySelector('.exec-card__bio').textContent.replace(/\s+/g, ' ').trim();

      const desc = (card.dataset.roleDesc || '').trim();
      roleDesc.textContent = desc;
      roleDesc.hidden = true;
      roleBtn.setAttribute('aria-expanded', 'false');
      roleBtn.disabled = !desc;

      const link = (card.dataset.linkedin || '').trim();
      linkEl.hidden = !link;
      if (link) linkEl.href = link;

      modal.showModal();
      modal.scrollTop = 0;
      modal.querySelector('.bio-modal__content').scrollTop = 0;
    };

    document.querySelectorAll('.exec-card__photo-wrap').forEach((wrap) => {
      wrap.addEventListener('click', () => openBio(wrap.closest('.exec-card')));
    });

    roleBtn.addEventListener('click', () => {
      const open = roleBtn.getAttribute('aria-expanded') === 'true';
      roleBtn.setAttribute('aria-expanded', String(!open));
      roleDesc.hidden = open;
    });

    modal.querySelector('.bio-modal__close').addEventListener('click', () => modal.close());
    // Click on the dimmed backdrop closes it (Esc works natively)
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
  }
  // ===== Event type popups (Academic / Social / Professional) =====
  // Each .event-card holds its popup content: data-img for the picture and a
  // hidden .event-card__details block with the description and a |-separated
  // list of example events.
  const eventModal = document.getElementById('eventModal');
  if (eventModal) {
    const img = eventModal.querySelector('.event-modal__photo img');
    const label = eventModal.querySelector('.event-modal__label');
    const title = eventModal.querySelector('.bio-modal__name');
    const desc = eventModal.querySelector('.event-modal__desc');
    const list = eventModal.querySelector('.event-modal__list');

    document.querySelectorAll('.event-card').forEach((card) => {
      card.addEventListener('click', () => {
        img.src = card.dataset.img || '';
        img.alt = card.dataset.imgAlt || '';
        label.textContent = card.querySelector('.event-card__label').textContent.trim();
        title.textContent = card.querySelector('.event-card__title').textContent.trim();
        const details = card.querySelector('.event-card__details');
        desc.textContent = details.querySelector('[data-part="desc"]').textContent.replace(/\s+/g, ' ').trim();
        list.innerHTML = '';
        details.querySelector('[data-part="list"]').textContent.split('|').forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item.trim();
          list.appendChild(li);
        });
        eventModal.showModal();
        eventModal.scrollTop = 0;
        eventModal.querySelector('.bio-modal__content').scrollTop = 0;
      });
    });

    eventModal.querySelector('.event-modal__close').addEventListener('click', () => eventModal.close());
    eventModal.addEventListener('click', (e) => { if (e.target === eventModal) eventModal.close(); });
  }
});

// ===== Newsletter form (placeholder handler — wire up to your provider) =====
const newsletterForm = document.getElementById('newsletter');
newsletterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // TODO: connect to Mailchimp / Google Form / backend of your choice
  alert('Thanks for signing up! (Hook this form up to your newsletter provider.)');
  newsletterForm.reset();
});

// =====================================================================
// Hero logo — draws itself on page load
// Loads the SVG version of the logo, swaps it in for the PNG, then each
// shape traces its outline and fills in with its own color. Works with any
// SVG export. If the SVG can't load (or motion is reduced), the PNG stays.
// =====================================================================
(async () => {
  const img = document.querySelector('.hero__logo[data-svg]');
  if (!img || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let text;
  try {
    const res = await fetch(encodeURI(img.dataset.svg));
    if (!res.ok) return;
    text = await res.text();
  } catch (err) {
    return; // e.g. opened as a local file: keep the PNG
  }

  const parsed = new DOMParser().parseFromString(text, 'image/svg+xml');
  const source = parsed.documentElement;
  if (!source || source.nodeName.toLowerCase() !== 'svg' || parsed.querySelector('parsererror')) return;
  if (source.querySelector('image')) return; // the "SVG" just wraps a picture: nothing to draw

  if (!source.getAttribute('viewBox')) {
    const w = parseFloat(source.getAttribute('width'));
    const h = parseFloat(source.getAttribute('height'));
    if (!w || !h) return;
    source.setAttribute('viewBox', `0 0 ${w} ${h}`);
  }
  source.removeAttribute('width');
  source.removeAttribute('height');

  const svg = document.importNode(source, true);
  svg.setAttribute('class', 'hero__logo hero__logo--svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', img.alt);
  img.replaceWith(svg);

  // Trim the SVG's canvas to the artwork itself. Exported files often carry
  // uneven empty space around the art, which pushes the logo off-center.
  try {
    const bb = svg.getBBox();
    if (bb.width && bb.height) {
      const pad = Math.max(bb.width, bb.height) * 0.01;
      svg.setAttribute('viewBox', `${bb.x - pad} ${bb.y - pad} ${bb.width + pad * 2} ${bb.height + pad * 2}`);
    }
  } catch (_) { /* keep the file's own viewBox */ }

  const shapes = [...svg.querySelectorAll('path, circle, ellipse, rect, polygon, polyline, line')]
    .filter((el) => !el.closest('defs, clipPath, mask, pattern, marker, symbol'));
  if (!shapes.length) return;

  // Outline thickness in SVG units that looks like ~1.6px on screen
  const unitsPerPx = svg.viewBox.baseVal.width / svg.getBoundingClientRect().width;
  const stagger = Math.min(70, 1400 / shapes.length); // whole draw lands around 2–2.5s

  shapes.forEach((el, i) => {
    // Snapshot the shape's real colors first (computed styles are live and
    // would otherwise reflect the temporary animation styles set below)
    const cs = getComputedStyle(el);
    const fill = cs.fill;
    const stroke = cs.stroke;
    const fillOpacity = cs.fillOpacity;
    const len = typeof el.getTotalLength === 'function' ? el.getTotalLength() : 0;
    const hasStroke = stroke !== 'none';
    const originalStyle = el.getAttribute('style');
    const delay = i * stagger;

    el.style.stroke = hasStroke ? stroke : fill;
    if (!hasStroke) el.style.strokeWidth = String(1.6 * unitsPerPx);
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    el.style.fillOpacity = '0';

    const anims = [
      el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        { duration: 1000, delay, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'forwards' }),
      el.animate([{ fillOpacity: 0 }, { fillOpacity }],
        { duration: 500, delay: delay + 750, easing: 'ease-out', fill: 'forwards' }),
    ];
    if (!hasStroke) {
      anims.push(el.animate([{ strokeOpacity: 1 }, { strokeOpacity: 0 }],
        { duration: 400, delay: delay + 950, fill: 'forwards' }));
    }

    // When done, put the shape back exactly as the SVG defined it
    Promise.all(anims.map((a) => a.finished)).then(() => {
      anims.forEach((a) => a.cancel());
      if (originalStyle === null) el.removeAttribute('style');
      else el.setAttribute('style', originalStyle);
    });
  });

  svg.querySelectorAll('text').forEach((t) => {
    t.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 1200, fill: 'backwards' });
  });
})();

// =====================================================================
// Circuit line down the page
// A trace in the logo's purple-to-blue runs through the left margin,
// connecting each section heading marked with data-circuit-node. It draws
// itself as you scroll, and each node lights up gold when the line reaches
// it. Hidden when the margin is too narrow to hold it.
// =====================================================================
(() => {
  const headings = [...document.querySelectorAll('[data-circuit-node]')];
  if (!headings.length) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'circuit');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `
    <defs>
      <linearGradient id="circuitGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
        <stop offset="0" stop-color="#a960e3"/>
        <stop offset="0.5" stop-color="#1e8ff0"/>
        <stop offset="1" stop-color="#a960e3"/>
      </linearGradient>
    </defs>
    <path class="circuit__track"/>
    <path class="circuit__line" stroke="url(#circuitGrad)"/>
    <g class="circuit__nodes"></g>`;
  document.body.appendChild(svg);

  const track = svg.querySelector('.circuit__track');
  const line = svg.querySelector('.circuit__line');
  const nodesGroup = svg.querySelector('.circuit__nodes');
  const grad = svg.querySelector('#circuitGrad');

  let total = 0;
  let lookup = []; // [length, y] samples, used to find how much line to show
  let nodes = [];
  let active = false;

  // The widest content blocks decide how much margin there is
  const wideBlocks = '.hero__inner, .about__inner, .exec-board, .events__inner, .calendar__inner, .contact__inner';

  function build() {
    const vw = document.documentElement.clientWidth;
    const contentLeft = Math.min(...[...document.querySelectorAll(wideBlocks)]
      .map((el) => el.getBoundingClientRect().left));
    const x0 = contentLeft - 34;
    active = x0 >= 16;
    svg.style.display = active ? '' : 'none';
    if (!active) return;

    const ys = headings.map((h) => {
      const r = h.getBoundingClientRect();
      return r.top + window.scrollY + Math.min(r.height, 44) / 2;
    });

    // Only as tall as the line itself (down to the last node). Sizing it to
    // the whole page made it count its own height and leave a gap under
    // the footer whenever the page got shorter.
    const lineH = Math.ceil(ys[ys.length - 1] + 24);
    svg.setAttribute('width', vw);
    svg.setAttribute('height', lineH);
    svg.setAttribute('viewBox', `0 0 ${vw} ${lineH}`);
    grad.setAttribute('y2', lineH);

    // Vertical trace with a 45° jog in each long span, like a circuit board trace
    const jog = 14;
    let d = `M ${x0} ${Math.max(0, ys[0] - 90)} L ${x0} ${ys[0]}`;
    for (let i = 1; i < ys.length; i++) {
      const y1 = ys[i - 1];
      const y2 = ys[i];
      const span = y2 - y1;
      if (span > 260) {
        const a = y1 + span * 0.32;
        const b = y1 + span * 0.68;
        d += ` L ${x0} ${a} L ${x0 + jog} ${a + jog} L ${x0 + jog} ${b - jog} L ${x0} ${b}`;
      }
      d += ` L ${x0} ${y2}`;
    }
    track.setAttribute('d', d);
    line.setAttribute('d', d);

    total = line.getTotalLength();
    line.style.strokeDasharray = String(total);
    lookup = [];
    for (let s = 0; s <= total; s += 6) lookup.push([s, line.getPointAtLength(s).y]);
    lookup.push([total, line.getPointAtLength(total).y]);

    // Nodes: a gold ring (like the logo's dots) plus a short stub toward the content
    nodesGroup.innerHTML = '';
    const stubLen = Math.max(0, Math.min(22, contentLeft - x0 - 18));
    nodes = ys.map((y) => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'circuit__node');
      g.innerHTML = `
        <line class="circuit__stub" x1="${x0 + 8}" y1="${y}" x2="${x0 + 8 + stubLen}" y2="${y}"
          style="stroke-dasharray:${stubLen};stroke-dashoffset:${stubLen}"/>
        <circle class="circuit__tip" cx="${x0 + 8 + stubLen + 3}" cy="${y}" r="3"/>
        <circle class="circuit__ring" cx="${x0}" cy="${y}" r="7"/>`;
      nodesGroup.appendChild(g);
      return { y, g };
    });
    update();
  }

  // How much of the line reaches down to page position y
  function lengthAt(y) {
    if (y <= lookup[0][1]) return 0;
    let lo = 0;
    let hi = lookup.length - 1;
    if (y >= lookup[hi][1]) return total;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (lookup[mid][1] < y) lo = mid; else hi = mid;
    }
    const [l1, y1] = lookup[lo];
    const [l2, y2] = lookup[hi];
    return y2 === y1 ? l2 : l1 + ((y - y1) / (y2 - y1)) * (l2 - l1);
  }

  function update() {
    if (!active) return;
    const tipY = reduceMotion ? Infinity : window.scrollY + window.innerHeight * 0.55;
    line.style.strokeDashoffset = String(total - lengthAt(tipY));
    nodes.forEach((n) => n.g.classList.toggle('is-lit', n.y <= tipY));
  }

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Rebuild when layout changes (resizing, images loading, carousels mounting)
  let rebuildTimer;
  const rebuild = () => { clearTimeout(rebuildTimer); rebuildTimer = setTimeout(build, 120); };
  window.addEventListener('resize', rebuild);
  window.addEventListener('load', rebuild);
  if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(document.body);
  build();
})();

// =====================================================================
// Navbar — gold underline slides to the section you're in
// Hovering a link previews it; leaving snaps back to the current section.
// The calendar counts as "Events" (it sits right after that section).
// =====================================================================
(() => {
  const nav = document.getElementById('navLinks');
  const indicator = nav && nav.querySelector('.navbar__indicator');
  if (!indicator) return;

  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  let current = links[0];

  const moveTo = (link) => {
    if (!link) return;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
    indicator.classList.add('is-ready');
  };

  const findCurrent = () => {
    const line = window.scrollY + window.innerHeight * 0.35;
    let idx = 0;
    sections.forEach((sec, i) => {
      if (sec.getBoundingClientRect().top + window.scrollY <= line) idx = i;
    });
    // At the very bottom, the last link (Contact) is current
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) idx = links.length - 1;
    return links[idx];
  };

  const refresh = () => {
    const next = findCurrent();
    if (next !== current) {
      current.classList.remove('is-current');
      current.removeAttribute('aria-current');
    }
    current = next;
    current.classList.add('is-current');
    current.setAttribute('aria-current', 'true');
    if (!nav.matches(':hover')) moveTo(current);
  };

  links.forEach((a) => a.addEventListener('mouseenter', () => moveTo(a)));
  nav.addEventListener('mouseleave', () => moveTo(current));

  let queued = false;
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; refresh(); });
  }, { passive: true });
  window.addEventListener('resize', refresh);
  document.fonts && document.fonts.ready.then(refresh);
  refresh();
})();

// =====================================================================
// Calendar — "Next up" card with a live countdown
// Reads the next event from the public IMMERSE Google Calendar.
// Paste your Google API key below (see setup steps). Until then, or if
// there are no upcoming events, the card simply stays hidden.
// =====================================================================
(() => {
  const GOOGLE_API_KEY = 'AIzaSyCl8nINOFJZBC3SJ7Zz50YrNYLI9u-TyjA';
  const CALENDAR_ID = 'c_b4fb6e3e45ee03be749c026cfe70262e74b34394fc7dcd6b22368919a9de9f08@group.calendar.google.com';
  const TIME_ZONE = 'America/New_York';

  // Every element marked data-next-up gets filled: the card in the Calendar
  // section and the compact one in the hero. One request feeds both.
  const cards = [...document.querySelectorAll('[data-next-up]')].map((el) => ({
    el,
    title: el.querySelector('.next-up__title'),
    when: el.querySelector('.next-up__when'),
    where: el.querySelector('.next-up__where'),
    countdown: el.querySelector('.next-up__countdown'),
    now: el.querySelector('.next-up__now'),
    units: {
      days: el.querySelector('[data-unit="days"]'),
      hours: el.querySelector('[data-unit="hours"]'),
      minutes: el.querySelector('[data-unit="minutes"]'),
      seconds: el.querySelector('[data-unit="seconds"]'),
    },
  }));
  if (!cards.length || !GOOGLE_API_KEY || GOOGLE_API_KEY.startsWith('PASTE_')) return;
  let timer = null;

  // All-day events come back as a plain date ("2026-11-18"): treat as local midnight
  const parseWhen = (w) => (w.dateTime ? new Date(w.dateTime) : new Date(`${w.date}T00:00:00`));

  const formatWhen = (start, allDay) => {
    const date = start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: TIME_ZONE });
    if (allDay) return date;
    const time = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: TIME_ZONE });
    return `${date} · ${time}`;
  };

  const hideAll = () => cards.forEach((c) => { c.el.hidden = true; });

  async function loadNext() {
    const params = new URLSearchParams({
      key: GOOGLE_API_KEY,
      timeMin: new Date().toISOString(), // includes an event that's in progress right now
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '1',
    });
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`;

    let data;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Calendar request failed (${res.status})`);
      data = await res.json();
    } catch (err) {
      console.warn('[IMMERSE] Could not load the next event:', err.message);
      hideAll();
      return;
    }

    const event = data.items && data.items[0];
    if (!event) { hideAll(); return; }

    const start = parseWhen(event.start);
    const end = parseWhen(event.end);
    cards.forEach((c) => {
      if (c.title) c.title.textContent = event.summary || 'IMMERSE event';
      if (c.when) c.when.textContent = formatWhen(start, !event.start.dateTime);
      if (c.where) {
        c.where.textContent = event.location || '';
        c.where.hidden = !event.location;
      }
      c.el.hidden = false;
    });
    // let other parts of the page react to the event (e.g. the Duck-a-palooza ducks)
    document.dispatchEvent(new CustomEvent('immerse:next-event', { detail: { name: event.summary || '' } }));

    clearInterval(timer);
    const tick = () => {
      const now = Date.now();
      if (now >= end.getTime()) { clearInterval(timer); loadNext(); return; }
      const live = now >= start.getTime();

      let s = Math.max(0, Math.floor((start.getTime() - now) / 1000));
      const d = Math.floor(s / 86400); s -= d * 86400;
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;

      cards.forEach((c) => {
        if (c.countdown) c.countdown.hidden = live;
        if (c.now) c.now.hidden = !live;
        c.el.classList.toggle('is-live', live);
        if (live) return;
        if (c.units.days) {
          c.units.days.textContent = d;
          // the hero line drops "0d" so it just reads "in 2h 05m 10s"
          const wrap = c.units.days.closest('[data-hide-zero]');
          if (wrap) wrap.hidden = d === 0;
        }
        if (c.units.hours) c.units.hours.textContent = String(h).padStart(2, '0');
        if (c.units.minutes) c.units.minutes.textContent = String(m).padStart(2, '0');
        if (c.units.seconds) c.units.seconds.textContent = String(s).padStart(2, '0');
      });
    };
    tick();
    timer = setInterval(tick, 1000);
  }

  loadNext();
})();

/* ---------- Background stars (hero) and ducks (events) ----------
   Scatters decorations into the empty space of a section: random spots are
   tried and kept only if they don't overlap text, pictures or each other.
   A fixed seed keeps the layout the same on every visit. Re-run on resize. */
(() => {
  const STAR = 'polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)';
  const DUCK = `<svg viewBox="0 0 64 54" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 30c0-4 3-6 7-5 4 1 9 3 15 3 3 0 4-2 4-5 0-8 6-14 14-14s13 6 13 13c0 4-2 7-5 9 6 2 9 6 8 11-2 7-12 10-26 10C14 52 4 44 4 30Z" fill="#f5ce45"/>
    <path d="M57 19l7 2-7 4c-1-2-1-4 0-6Z" fill="#f39237"/>
    <circle cx="48" cy="17" r="2.4" fill="#1a1240"/>
    <path d="M18 35c6 5 16 6 23 1-2 6-8 9-14 8-5-1-8-4-9-9Z" fill="#e8b92e"/>
  </svg>`;

  // small seeded random-number generator
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const between = (r, a, b) => a + r() * (b - a);
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function scatter({ section, layer, avoid, pad, gap, perArea, max, size, seed, make }) {
    layer.innerHTML = '';
    const box = section.getBoundingClientRect();
    const W = box.width, H = box.height;
    // Headings and paragraphs are measured line by line, so the empty space to
    // the right of a short line (like "Welcome to") stays available
    const rectsOf = (el) => {
      if (/^(H1|H2|H3|P)$/.test(el.tagName)) {
        const range = document.createRange();
        range.selectNodeContents(el);
        return [...range.getClientRects()];
      }
      return [el.getBoundingClientRect()];
    };
    const blocked = [...section.querySelectorAll(avoid)]
      .flatMap(rectsOf)
      .filter((r) => r.width && r.height)
      .map((r) => ({ x: r.left - box.left - pad, y: r.top - box.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 }));
    // keep clear of the circuit line running down the left side
    const line = document.querySelector('.circuit__line, .circuit__track');
    if (line) {
      const lx = line.getBoundingClientRect().left - box.left;
      blocked.push({ x: lx - 30, y: 0, w: 80, h: H });
    }
    const r = rng(seed);
    const want = Math.min(max, Math.round((W * H) / perArea));
    const placed = [];
    for (let tries = 0; placed.length < want && tries < want * 60; tries++) {
      const s = between(r, size[0], size[1]);
      const spot = { x: between(r, 8, W - s - 8), y: between(r, 8, H - s - 8), w: s, h: s };
      const roomy = { x: spot.x - gap, y: spot.y - gap, w: s + gap * 2, h: s + gap * 2 };
      if (blocked.some((b) => hit(spot, b)) || placed.some((p) => hit(roomy, p))) continue;
      placed.push(spot);
      const el = make(r, s);
      el.style.left = `${spot.x}px`;
      el.style.top = `${spot.y}px`;
      layer.appendChild(el);
    }
  }

  const hero = document.querySelector('.hero');
  const stars = document.querySelector('.hero__sparkles');
  const calendar = document.querySelector('.calendar');
  const ducks = document.querySelector('.calendar__ducks');
  let duckTime = false; // true when the next event is a Duck-a-palooza

  document.addEventListener('immerse:next-event', (e) => {
    duckTime = /duck[\s-]*a[\s-]*palooza/i.test(e.detail.name);
    build();
  });

  function build() {
    if (hero && stars) {
      scatter({
        section: hero, layer: stars, seed: 7,
        // text, buttons, pictures and the countdown (stars drift ~35px, hence the padding)
        avoid: '.hero__copy h1, .hero__tagline, .hero__actions a, .hero__pillars a, .hero__stage, .hero-next',
        pad: 36, gap: 70, perArea: 22000, max: 40, size: [9, 22],
        make: (r, s) => {
          const el = document.createElement('span');
          const colors = ['var(--gold)', 'var(--gold)', 'var(--purple)', 'var(--blue)'];
          el.style.width = `${s}px`;
          el.style.background = colors[Math.floor(r() * colors.length)];
          el.style.setProperty('--twinkle', `${between(r, 5, 9).toFixed(1)}s`);
          el.style.setProperty('--drift', `${between(r, 15, 24).toFixed(1)}s`);
          el.style.setProperty('--delay', `${-between(r, 0, 14).toFixed(1)}s`);
          return el;
        },
      });
    }
    if (calendar && ducks) {
      if (!duckTime) { ducks.innerHTML = ''; return; }
      scatter({
        section: calendar, layer: ducks, seed: 42,
        avoid: '.calendar__copy > *, .calendar__embed',
        pad: 18, gap: 60, perArea: 70000, max: 14, size: [30, 54],
        make: (r, s) => {
          const el = document.createElement('span');
          el.style.width = `${s}px`;
          el.innerHTML = DUCK;
          if (r() < 0.5) el.classList.add('is-flipped');
          el.style.setProperty('--bob', `${between(r, 4, 7).toFixed(1)}s`);
          el.style.setProperty('--delay', `${-between(r, 0, 7).toFixed(1)}s`);
          return el;
        },
      });
    }
  }

  let t;
  const later = () => { clearTimeout(t); t = setTimeout(build, 150); };
  requestAnimationFrame(build); // after the circuit line has been drawn
  window.addEventListener('load', build);
  window.addEventListener('resize', later);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(later);
    [hero, calendar].forEach((el) => el && ro.observe(el));
  }
})();