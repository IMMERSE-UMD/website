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

  // ===== Executive Board — Splide carousel =====
  if (document.getElementById('exec-board-splide')) {
    new Splide('#exec-board-splide', {
      type: 'loop',
      perPage: 4,
      perMove: 1,
      gap: '1.5rem',
      pagination: false,
      arrows: true,
      autoplay: false,
      breakpoints: {
        1024: { perPage: 3 },
        768: { perPage: 2 },
        480: { perPage: 1 },
      },
    }).mount();
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