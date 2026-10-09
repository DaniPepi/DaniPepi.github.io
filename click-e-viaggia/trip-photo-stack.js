'use strict';
(() => {
  const INTERVAL = 6000;
  const DURATION = 1150;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const localPhoto = /^assets\/[a-zA-Z0-9._-]+\.(?:jpe?g|png|webp)$/i;

  document.querySelectorAll('[data-photo-stack]').forEach((visual, instance) => {
    const figure = visual.querySelector('.trip-main-photo');
    const original = figure?.querySelector('img');
    const caption = figure?.querySelector('figcaption');
    const thumbnails = [...visual.querySelectorAll('[data-trip-photo]')];
    const photos = thumbnails.map(button => ({
      button,
      src: button.dataset.tripPhoto || '',
      alt: button.dataset.tripAlt || document.body.dataset.destination || 'Fotografia del viaggio',
      caption: button.dataset.tripCaption || ''
    })).filter(photo => localPhoto.test(photo.src));
    if (!figure || !original || !caption || photos.length < 3 || visual.classList.contains('photo-stack-ready')) return;

    const stage = document.createElement('div');
    stage.className = 'photo-stack-stage';
    stage.style.setProperty('--photo-stack-duration', `${DURATION}ms`);
    stage.id = `trip-photo-stack-${instance + 1}`;
    stage.tabIndex = 0;
    stage.setAttribute('role', 'group');
    stage.setAttribute('aria-roledescription', 'carosello di fotografie');
    stage.setAttribute('aria-label', `Fotografie di ${document.body.dataset.destination || 'questo viaggio'}. Usa le frecce per sfogliare.`);
    const toolbar = document.createElement('div');
    toolbar.className = 'photo-stack-toolbar';
    const counter = document.createElement('span');
    counter.className = 'photo-stack-count';
    counter.setAttribute('aria-live', 'polite');
    counter.setAttribute('aria-atomic', 'true');
    const previous = control('photo-stack-prev', 'Foto precedente', '‹');
    const next = control('photo-stack-next', 'Foto successiva', '›');
    toolbar.append(counter, previous, next);

    let active = Math.max(0, photos.findIndex(photo => photo.button.getAttribute('aria-pressed') === 'true'));
    let timer = 0;
    let finishTimer = 0;
    let isAnimating = false;
    let pending = null;
    let intersecting = true;
    let pointer = null;
    const cards = photos.map((photo, index) => {
      const card = document.createElement('div');
      card.className = 'photo-stack-card';
      card.dataset.depth = 'parked';
      card.setAttribute('aria-hidden', 'true');
      const image = index === 0 ? original : document.createElement('img');
      image.removeAttribute('id');
      image.draggable = false;
      image.decoding = 'async';
      image.alt = '';
      image.width = 1200;
      image.height = 900;
      image.loading = 'eager';
      image.addEventListener('error', () => {
        card.classList.add('is-unavailable');
        if (index === active) image.alt = 'Fotografia non disponibile';
      });
      image.addEventListener('load', () => card.classList.remove('is-unavailable'));
      card.append(image);
      stage.append(card);
      return card;
    });

    function control(className, label, symbol) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = className;
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-controls', stage.id);
      const icon = document.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = symbol;
      button.append(icon);
      return button;
    }

    function loadPhoto(index) {
      const image = cards[index].firstElementChild;
      if (image.getAttribute('src') !== photos[index].src) image.src = photos[index].src;
      else if (image.complete && !image.naturalWidth) cards[index].classList.add('is-unavailable');
    }

    function render() {
      cards.forEach((card, index) => {
        const depth = (index - active + photos.length) % photos.length;
        card.dataset.depth = depth < 3 ? String(depth) : 'parked';
        const current = index === active;
        const image = card.firstElementChild;
        card.setAttribute('aria-hidden', String(!current));
        image.removeAttribute('id');
        image.alt = current ? (card.classList.contains('is-unavailable') ? 'Fotografia non disponibile' : photos[index].alt) : '';
        photos[index].button.setAttribute('aria-pressed', String(current));
        photos[index].button.setAttribute('aria-controls', stage.id);
        if (depth < 3) loadPhoto(index);
      });
      cards[active].firstElementChild.id = original.id || 'trip-photo';
      caption.textContent = photos[active].caption;
      counter.textContent = `${String(active + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
      counter.setAttribute('aria-label', `Foto ${active + 1} di ${photos.length}`);
    }

    function hasModal() {
      return Boolean(document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]:not([hidden])'));
    }

    function canAdvance() {
      return !reducedMotion.matches && !document.hidden && intersecting && !isAnimating && !visual.matches(':hover') && !visual.contains(document.activeElement) && !hasModal();
    }

    function schedule() {
      window.clearTimeout(timer);
      timer = 0;
      if (canAdvance()) timer = window.setTimeout(() => {
        timer = 0;
        if (canAdvance()) move(active + 1, 1);
      }, INTERVAL);
    }

    function move(target, direction = 1) {
      const normalized = (target % photos.length + photos.length) % photos.length;
      window.clearTimeout(timer);
      if (isAnimating) { pending = { target: normalized, direction }; return; }
      if (normalized === active) { schedule(); return; }
      const outgoing = cards[active];
      active = normalized;
      stage.dataset.direction = direction < 0 ? 'previous' : 'next';
      if (reducedMotion.matches) { render(); schedule(); return; }
      isAnimating = true;
      stage.classList.add('is-animating');
      render();
      // A returning card enters above the stack; a retiring front card settles
      // into its exact parked transform before the animation class is removed.
      if (direction < 0 || outgoing.dataset.depth !== 'parked') cards[active].classList.add('is-entering');
      else outgoing.classList.add('is-leaving');
      // A fixed fallback also completes when the page hides mid-animation.
      finishTimer = window.setTimeout(finish, DURATION + 35);
    }

    function step(direction) {
      // Repeated clicks accumulate a destination while the current move finishes.
      move((pending?.target ?? active) + direction, direction);
    }

    function finish() {
      if (!isAnimating) return;
      window.clearTimeout(finishTimer);
      cards.forEach(card => card.classList.remove('is-leaving', 'is-entering'));
      stage.classList.remove('is-animating');
      isAnimating = false;
      const queued = pending;
      pending = null;
      if (queued) move(queued.target, queued.direction);
      else schedule();
    }

    figure.prepend(stage);
    figure.append(toolbar);
    // Warm the small local deck before manual navigation, including backwards.
    photos.forEach((photo, index) => loadPhoto(index));
    render();
    visual.classList.add('photo-stack-ready');
    const strip = visual.querySelector('.trip-thumbnails');
    if (strip) strip.hidden = true;
    previous.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    stage.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      if (event.key === 'Home') move(0, -1);
      else if (event.key === 'End') move(photos.length - 1, 1);
      else step(event.key === 'ArrowLeft' ? -1 : 1);
    });
    stage.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' || !event.isPrimary) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    });
    stage.addEventListener('pointerup', event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      pointer = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      step(dx < 0 ? 1 : -1);
    });
    stage.addEventListener('pointercancel', () => { pointer = null; });
    visual.addEventListener('pointerenter', schedule);
    visual.addEventListener('pointerleave', schedule);
    visual.addEventListener('focusin', schedule);
    visual.addEventListener('focusout', () => window.setTimeout(schedule, 0));
    document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); schedule(); });
    reducedMotion.addEventListener('change', () => { finish(); schedule(); });
    window.addEventListener('pageshow', schedule);
    window.addEventListener('pagehide', () => { window.clearTimeout(timer); finish(); window.clearTimeout(timer); });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        intersecting = entries[0].isIntersecting && entries[0].intersectionRatio >= .15;
        schedule();
      }, { threshold: [0, .15] });
      observer.observe(stage);
    }
    const modalObserver = new MutationObserver(records => {
      if (records.some(record => (record.target instanceof Element && record.target.matches('dialog, [role="dialog"]')) || [...record.addedNodes].some(node => node instanceof Element && (node.matches('dialog, [role="dialog"]') || node.querySelector('dialog, [role="dialog"]'))))) schedule();
    });
    modalObserver.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open', 'hidden', 'aria-modal'] });
    schedule();
  });
})();
