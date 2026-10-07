'use strict';

(() => {
  const section = document.querySelector('#blog.home-blog-strip');
  const track = section?.querySelector('#home-blog-track');
  const toggle = section?.querySelector('#blog-strip-toggle');
  if (!section || !track || !toggle) return;
  const slides = [...track.querySelectorAll('.blog-strip-item')];
  if (slides.length < 2) return;
  const previous = section.querySelector('#blog-strip-prev');
  const next = section.querySelector('#blog-strip-next');
  const dots = [...section.querySelectorAll('[data-blog-slide]')];
  const status = section.querySelector('#blog-strip-status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 3000;
  let index = 0;
  let timer = 0;
  let progress = null;
  let userPaused = motion.matches;
  let hovered = section.matches(':hover');
  let focused = section.contains(document.activeElement);
  let visible = false;
  let paused = true;
  let gesture = null;
  let suppressClickUntil = 0;

  function schedule() {
    clearTimeout(timer);
    progress?.cancel();
    progress = null;
    if (paused) return;
    const bar = slides[index].querySelector('.blog-progress>span');
    if (bar?.animate && !motion.matches) {
      progress = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: interval, fill: 'forwards' });
    }
    timer = setTimeout(() => show(index + 1), interval);
  }

  function show(target) {
    index = (target + slides.length) % slides.length;
    slides.forEach((slide, number) => {
      const active = number === index;
      slide.hidden = !active;
      slide.inert = !active;
      slide.setAttribute('aria-hidden', String(!active));
      slide.classList.toggle('is-active', active);
    });
    dots.forEach((dot, number) => dot.setAttribute('aria-current', String(number === index)));
    section.dataset.index = String(index + 1);
    if (status) status.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    schedule();
  }

  function updateState() {
    paused = userPaused || hovered || focused || !visible || document.hidden || !!gesture;
    section.dataset.paused = String(paused);
    section.dataset.playing = String(!userPaused);
    toggle.dataset.playing = String(!userPaused);
    toggle.setAttribute('aria-pressed', String(userPaused));
    const label = userPaused ? 'Riprendi le anteprime' : 'Metti in pausa le anteprime';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    schedule();
  }

  previous?.addEventListener('click', () => show(index - 1));
  next?.addEventListener('click', () => show(index + 1));
  dots.forEach(dot => dot.addEventListener('click', () => show(Number(dot.dataset.blogSlide))));
  toggle.addEventListener('click', () => { userPaused = !userPaused; updateState(); });
  section.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') { hovered = true; updateState(); }
  });
  section.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') { hovered = false; updateState(); }
  });
  section.addEventListener('focusin', () => { focused = true; updateState(); });
  section.addEventListener('focusout', () => queueMicrotask(() => {
    focused = section.contains(document.activeElement);
    updateState();
  }));
  track.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    gesture = { x: event.clientX, y: event.clientY, id: event.pointerId };
    updateState();
  }, { passive: true });
  track.addEventListener('pointerup', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      suppressClickUntil = Date.now() + 350;
      show(index + (dx < 0 ? 1 : -1));
      event.preventDefault();
    }
    updateState();
  });
  function cancelGesture() {
    if (!gesture) return;
    gesture = null;
    updateState();
  }
  track.addEventListener('pointercancel', cancelGesture);
  window.addEventListener('pointerup', cancelGesture);
  track.addEventListener('click', event => {
    if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  document.addEventListener('visibilitychange', updateState);
  motion.addEventListener('change', () => { userPaused = motion.matches; updateState(); });

  section.classList.add('blog-ready');
  [previous, next, toggle, status, section.querySelector('#blog-strip-dots')].forEach(element => { if (element) element.hidden = false; });
  show(0);
  updateState();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      updateState();
    }).observe(section);
  } else {
    const checkVisibility = () => {
      const bounds = section.getBoundingClientRect();
      const nextVisible = bounds.bottom > 0 && bounds.top < innerHeight;
      if (visible !== nextVisible) { visible = nextVisible; updateState(); }
    };
    addEventListener('scroll', checkVisibility, { passive: true });
    addEventListener('resize', checkVisibility, { passive: true });
    checkVisibility();
  }
})();
