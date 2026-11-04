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
    new Splide('#flyer-splide', {
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
    new Splide('#exec-board-splide', {
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