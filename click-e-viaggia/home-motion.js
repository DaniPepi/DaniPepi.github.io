'use strict';

(() => {
  if (!document.body.classList.contains('globe-home')) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const track = document.querySelector('#trip-deck-track');
  const cards = [...document.querySelectorAll('#trip-deck-track .deck-card')];
  const dialogs = new Set(document.querySelectorAll('dialog'));
  let current = null;
  let bounds = null;
  let frame = 0;
  let point = null;
  let dragging = false;

  function canTilt() {
    return !reduced.matches && finePointer.matches && !document.hidden && !dragging && !track?.classList.contains('is-dragging') && ![...dialogs].some(dialog => dialog.isConnected && dialog.open);
  }

  function reset() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (current) {
      current.classList.remove('has-pointer-depth');
      current.style.removeProperty('--card-tilt-x');
      current.style.removeProperty('--card-tilt-y');
    }
    current = null;
    bounds = null;
    point = null;
  }

  function paint() {
    frame = 0;
    if (!current || !bounds || !point || !canTilt() || current.dataset.selected !== 'true') {
      reset();
      return;
    }
    const clamp = value => Math.max(-1, Math.min(1, value));
    const x = clamp((point.x - bounds.left) / bounds.width * 2 - 1);
    const y = clamp((point.y - bounds.top) / bounds.height * 2 - 1);
    current.style.setProperty('--card-tilt-x', `${(-y * 4).toFixed(2)}deg`);
    current.style.setProperty('--card-tilt-y', `${(x * 5).toFixed(2)}deg`);
  }

  cards.forEach(card => {
    card.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || event.buttons || card.dataset.selected !== 'true' || !canTilt()) return;
      if (current !== card) {
        reset();
        current = card;
        bounds = card.getBoundingClientRect();
        if (!bounds.width || !bounds.height) { reset(); return; }
        card.classList.add('has-pointer-depth');
      }
      point = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(paint);
    }, { passive: true });
    card.addEventListener('pointerleave', () => { if (current === card) reset(); }, { passive: true });
    card.addEventListener('pointercancel', reset, { passive: true });
  });

  track?.addEventListener('pointerdown', () => { dragging = true; reset(); }, { passive: true });
  window.addEventListener('pointerup', () => { dragging = false; }, { passive: true });
  window.addEventListener('pointercancel', () => { dragging = false; reset(); }, { passive: true });
  window.addEventListener('resize', reset, { passive: true });
  window.addEventListener('blur', () => { dragging = false; reset(); });
  window.addEventListener('pagehide', reset);
  document.addEventListener('visibilitychange', reset);
  finePointer.addEventListener('change', reset);

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const additions = node.matches('dialog') ? [node] : [...node.querySelectorAll('dialog')];
        additions.forEach(dialog => {
          if (dialogs.has(dialog)) return;
          dialogs.add(dialog);
          observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
        });
      });
    });
    if (current && (current.dataset.selected !== 'true' || !canTilt())) reset();
  });
  cards.forEach(card => observer.observe(card, { attributes: true, attributeFilter: ['data-selected'] }));
  if (track) observer.observe(track, { attributes: true, attributeFilter: ['class'] });
  dialogs.forEach(dialog => observer.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  observer.observe(document.body, { childList: true });

  // Content is always visible. The class is added only as a section enters view,
  // then removed; there is no hidden pre-animation state or recurring timer.
  let entranceObserver = null;
  const entrances = [...document.querySelectorAll('.home-trip-band .glass-panel, .home-blog-strip, .process, .about, .contact')];
  const revealed = new WeakSet();
  const finishers = new Map();
  function reveal(element) {
    revealed.add(element);
    if (reduced.matches) return;
    element.classList.add('home-motion-enter');
    const finish = event => {
      if (event.target !== element || event.animationName !== 'globe-section-arrive') return;
      element.classList.remove('home-motion-enter');
      element.removeEventListener('animationend', finish);
      finishers.delete(element);
    };
    finishers.set(element, finish);
    element.addEventListener('animationend', finish);
  }
  function observeEntrances() {
    entranceObserver?.disconnect();
    entranceObserver = null;
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    entranceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        entranceObserver.unobserve(entry.target);
      });
    }, { threshold: .12 });
    entrances.forEach(element => { if (!revealed.has(element)) entranceObserver.observe(element); });
  }
  reduced.addEventListener('change', () => {
    reset();
    entrances.forEach(element => {
      element.classList.remove('home-motion-enter');
      const finish = finishers.get(element);
      if (finish) element.removeEventListener('animationend', finish);
    });
    finishers.clear();
    observeEntrances();
  });
  observeEntrances();
})();
