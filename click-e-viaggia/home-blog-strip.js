'use strict';

(() => {
  const section = document.querySelector('#blog.home-blog-strip');
  const track = section?.querySelector('#home-blog-track');
  if (!section || !track) return;
  const slides = [...track.querySelectorAll('.blog-strip-item')];
  if (slides.length < 2) return;
  const previous = section.querySelector('#blog-strip-prev');
  const next = section.querySelector('#blog-strip-next');
  const dots = [...section.querySelectorAll('[data-blog-slide]')];
  const status = section.querySelector('#blog-strip-status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 8000;
  const transition = 1000;
  let index = 0;
  let timer = 0;
  let progress = null;
  let cleanup = 0;
  let hovered = section.matches(':hover');
  let focused = section.contains(document.activeElement);
  let visible = false;
  let paused = true;
  let gesture = null;
  let suppressClickUntil = 0;
  let imagesPrimed = false;
  slides.forEach(slide => {
    const visual = slide.querySelector('.blog-strip-visual');
    if (!visual) return;
    const hint = document.createElement('span');
    hint.className = 'blog-photo-invitation'; hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = 'ENTRA NEL RACCONTO <b>↑</b>';
    visual.append(hint);
  });
  let tiltFrame = 0, tiltPoint = null;
  function resetTilt() {
    cancelAnimationFrame(tiltFrame); tiltFrame = 0; tiltPoint = null;
    slides.forEach(slide => ['--blog-rx','--blog-ry','--photo-x','--photo-y','--copy-x'].forEach(name => slide.style.removeProperty(name)));
  }
  track.addEventListener('pointermove', event => {
    if (motion.matches || event.pointerType !== 'mouse' || !matchMedia('(hover:hover)').matches) return;
    const card = event.target.closest?.('.blog-strip-item.is-active');
    if (!card) { resetTilt(); return; }
    tiltPoint = {card, x:event.clientX, y:event.clientY};
    if (tiltFrame) return;
    tiltFrame = requestAnimationFrame(() => {
      tiltFrame = 0;
      if (!tiltPoint) return;
      const {card,x,y} = tiltPoint, rect = card.getBoundingClientRect();
      const dx = Math.max(-1,Math.min(1,(x-rect.left)/rect.width*2-1));
      const dy = Math.max(-1,Math.min(1,(y-rect.top)/rect.height*2-1));
      card.style.setProperty('--blog-rx',(-dy*2.5)+'deg'); card.style.setProperty('--blog-ry',(dx*3.5)+'deg');
      card.style.setProperty('--photo-x',(dx*5)+'px'); card.style.setProperty('--photo-y',(dy*4)+'px');
      card.style.setProperty('--copy-x',(-dx*3)+'px');
    });
  }, {passive:true});
  track.addEventListener('pointerleave', resetTilt);
  track.addEventListener('pointercancel', resetTilt);

  function primeImages() {
    if (imagesPrimed) return;
    imagesPrimed = true;
    slides.forEach(slide => {
      const image = slide.querySelector('img');
      if (image) image.loading = 'eager';
    });
  }

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

  function finishTransition() {
    clearTimeout(cleanup);
    slides.forEach(slide => {
      if (!slide.classList.contains('is-leaving')) return;
      slide.classList.remove('is-leaving');
    });
  }

  function show(target) {
    resetTilt();
    finishTransition();
    const outgoing = slides[index];
    const newIndex = (target + slides.length) % slides.length;
    const animate = newIndex !== index && !motion.matches && outgoing.classList.contains('is-active');
    section.style.setProperty('--blog-direction', target < index ? '-1' : '1');
    index = newIndex;
    slides.forEach((slide, number) => {
      const position = (number - index + slides.length) % slides.length;
      const active = position === 0;
      const leaving = animate && slide === outgoing;
      slide.hidden = false;
      slide.inert = !active;
      slide.setAttribute('aria-hidden', String(!active));
      slide.classList.toggle('is-active', active);
      slide.classList.toggle('is-next', position === 1);
      slide.classList.toggle('is-last', position > 1);
      slide.classList.toggle('is-leaving', leaving);
    });
    if (animate) cleanup = setTimeout(finishTransition, transition);
    dots.forEach((dot, number) => dot.setAttribute('aria-current', String(number === index)));
    section.dataset.index = String(index + 1);
    if (status) status.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    schedule();
  }

  function updateState() {
    paused = motion.matches || hovered || focused || !visible || document.hidden || !!gesture;
    section.dataset.paused = String(paused);
    section.dataset.playing = String(!motion.matches);
    schedule();
  }

  previous?.addEventListener('click', () => show(index - 1));
  next?.addEventListener('click', () => show(index + 1));
  dots.forEach(dot => dot.addEventListener('click', () => show(Number(dot.dataset.blogSlide))));
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
  motion.addEventListener('change', () => { resetTilt(); finishTransition(); updateState(); });

  section.classList.add('blog-ready');
  section.style.setProperty('--blog-interval', interval + 'ms');
  [previous, next, status, section.querySelector('#blog-strip-dots')].forEach(element => { if (element) element.hidden = false; });
  show(0);
  updateState();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) primeImages();
      updateState();
    }).observe(section);
  } else {
    const checkVisibility = () => {
      const bounds = section.getBoundingClientRect();
      const nextVisible = bounds.bottom > 0 && bounds.top < innerHeight;
      if (nextVisible) primeImages();
      if (visible !== nextVisible) { visible = nextVisible; updateState(); }
    };
    addEventListener('scroll', checkVisibility, { passive: true });
    addEventListener('resize', checkVisibility, { passive: true });
    checkVisibility();
  }
})();
