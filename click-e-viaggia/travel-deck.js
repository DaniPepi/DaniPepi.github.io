'use strict';

(() => {
  const deck = document.querySelector('#trip-deck');
  const track = document.querySelector('#trip-deck-track');
  const cards = [...document.querySelectorAll('#trip-deck-track .deck-card[data-deck-id]')];
  const preview = document.querySelector('#travel-preview');
  if (!deck || !track || !cards.length || !preview) return;

  const previous = document.querySelector('#deck-prev');
  const next = document.querySelector('#deck-next');
  const position = document.querySelector('#deck-position');
  const controls = document.querySelector('#deck-controls');
  const openCurrent = document.querySelector('#deck-open-current');
  const front = preview.querySelector('.deck-face-front');
  const back = preview.querySelector('.deck-face-back');
  const flipFront = preview.querySelector('#deck-flip-front');
  const flipBack = preview.querySelector('#deck-flip-back');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let opener = null;
  let selectedCard = null;
  let scrollFrame = 0;
  let resizeFrame = 0;
  let drag = null;
  let suppressClick = false;
  let suppressTimer = 0;
  let configuration = null;
  let measuredWidth = 0;
  let measuring = false;
  let measureToken = 0;

  function setActive(index) {
    active = Math.max(0, Math.min(cards.length - 1, index));
    cards.forEach((card, cardIndex) => {
      const selected = cardIndex === active;
      card.dataset.selected = String(selected);
      card.setAttribute('aria-current', String(selected));
    });
    if (previous) previous.disabled = active === 0;
    if (next) next.disabled = active === cards.length - 1;
    if (position) position.textContent = `${active + 1} / ${cards.length} · ${cards[active].querySelector('h3').textContent.trim()}`;
  }

  function distanceFromCenter(card) {
    const item = card.getBoundingClientRect();
    const viewport = track.getBoundingClientRect();
    return item.left + item.width / 2 - (viewport.left + track.clientLeft + track.clientWidth / 2);
  }

  function center(index, animate = true) {
    const target = Math.max(0, Math.min(cards.length - 1, index));
    setActive(target);
    const left = track.scrollLeft + distanceFromCenter(cards[target]);
    track.scrollTo({ left, behavior: animate && !motion.matches ? 'smooth' : 'instant' });
  }

  function measure() {
    const width = track.clientWidth;
    if (!width) return;
    const selection = active, token = ++measureToken;
    measuring = true;
    measuredWidth = width;
    track.style.scrollSnapType = 'none';
    const cardWidth = Math.max(160, Math.min(260, width * 0.7));
    track.style.setProperty('--deck-card-width', `${cardWidth}px`);
    track.style.setProperty('--deck-edge', `${Math.max(0, (width - cardWidth) / 2)}px`);
    center(selection, false);
    requestAnimationFrame(() => {
      if (token !== measureToken) return;
      center(selection, false);
      track.style.scrollSnapType = '';
      requestAnimationFrame(() => {
        if (token !== measureToken) return;
        center(selection, false);
        measuring = false;
      });
    });
  }

  track.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      if (measuring || track.clientWidth !== measuredWidth) return;
      let closest = 0;
      let distance = Infinity;
      cards.forEach((card, index) => {
        const difference = Math.abs(distanceFromCenter(card));
        if (difference < distance) { closest = index; distance = difference; }
      });
      setActive(closest);
    });
  }, { passive: true });

  previous?.addEventListener('click', () => center(active - 1));
  next?.addEventListener('click', () => center(active + 1));
  track.addEventListener('keydown', event => {
    if (preview.open || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target !== track && !cards.includes(event.target)) return;
    const indexes = { ArrowLeft: active - 1, ArrowRight: active + 1, Home: 0, End: cards.length - 1 };
    if (!Object.hasOwn(indexes, event.key)) return;
    event.preventDefault();
    center(indexes[event.key]);
    if (cards.includes(event.target)) cards[active].focus({ preventScroll: true });
  });

  // Touch uses the browser's native scrolling. Mouse dragging does not turn a swipe into a click.
  track.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    drag = { pointer: event.pointerId, start: event.clientX, left: track.scrollLeft, moved: false };
  });
  window.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const difference = event.clientX - drag.start;
    if (!drag.moved && Math.abs(difference) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      track.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    track.scrollLeft = drag.left - difference;
  }, { passive: false });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.pointer) return;
    const moved = drag.moved;
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    drag = null;
    track.classList.remove('is-dragging');
    if (moved) {
      suppressClick = true;
      clearTimeout(suppressTimer);
      suppressTimer = setTimeout(() => { suppressClick = false; }, 350);
    }
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  track.addEventListener('dragstart', event => event.preventDefault());
  track.addEventListener('click', event => {
    if (!suppressClick) return;
    suppressClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  function text(selector, value) {
    const element = preview.querySelector(selector);
    if (element) element.textContent = value;
  }

  function fillBasicDetails(card) {
    const record = configuration?.[card.dataset.deckId];
    const value = key => typeof record?.[key] === 'string' && record[key].trim() ? record[key].trim() : 'Da definire';
    text('#deck-back-date', value('dates'));
    text('#deck-back-duration', value('duration'));
    text('#deck-back-status', typeof record?.status === 'string' && record.status.trim() ? record.status.trim() : 'Proposta in preparazione');
  }

  function flip(flipped, focus = true) {
    preview.classList.toggle('is-flipped', flipped);
    preview.setAttribute('aria-labelledby', flipped ? 'deck-back-title' : 'deck-preview-title');
    front.inert = flipped;
    back.inert = !flipped;
    front.setAttribute('aria-hidden', String(flipped));
    back.setAttribute('aria-hidden', String(!flipped));
    if (focus) (flipped ? flipBack : flipFront).focus({ preventScroll: true });
  }

  function open(card, trigger = card) {
    const name = card.querySelector('h3').textContent.trim();
    const image = card.querySelector('img');
    const photo = preview.querySelector('#deck-preview-photo');
    opener = trigger;
    selectedCard = card;
    text('#deck-preview-title', name);
    text('#deck-back-title', name);
    text('#deck-preview-country', card.dataset.country || '');
    text('#deck-back-country', card.dataset.country || '');
    text('#deck-preview-tagline', card.dataset.tagline || '');
    text('#deck-back-summary', card.dataset.summary || '');
    photo.src = image.currentSrc || image.src;
    photo.alt = image.alt;
    const details = preview.querySelector('#deck-details-link');
    details.href = card.href;
    details.target = '_blank';
    details.rel = 'noopener noreferrer';
    details.setAttribute('aria-label', `Maggiori dettagli sul viaggio a ${name}. Si apre in una nuova scheda.`);
    fillBasicDetails(card);
    flip(false, false);
    if (!preview.open) preview.showModal();
    document.body.classList.add('deck-open');
    preview.scrollTop = 0;
    flipFront.focus({ preventScroll: true });
  }

  cards.forEach(card => {
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-controls', preview.id);
    card.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      open(card);
    });
  });
  if (openCurrent) {
    openCurrent.hidden = false;
    openCurrent.setAttribute('aria-haspopup', 'dialog');
    openCurrent.setAttribute('aria-controls', preview.id);
    openCurrent.addEventListener('click', () => open(cards[active], openCurrent));
  }
  flipFront.addEventListener('click', () => flip(true));
  flipBack.addEventListener('click', () => flip(false));
  preview.querySelector('.deck-preview-close').addEventListener('click', () => preview.close());
  preview.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const available = [...preview.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]')].filter(element => !element.closest('[inert]') && element.getClientRects().length);
    if (!available.length) return;
    const first = available[0], last = available[available.length - 1];
    if (event.shiftKey && (document.activeElement === first || !preview.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !preview.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  });
  let backdropPress = false;
  function outside(event) {
    const bounds = preview.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  }
  preview.addEventListener('pointerdown', event => { backdropPress = event.target === preview && outside(event); });
  preview.addEventListener('click', event => {
    if (backdropPress && event.target === preview && outside(event)) preview.close();
    backdropPress = false;
  });
  preview.addEventListener('close', () => {
    document.body.classList.remove('deck-open');
    selectedCard = null;
    flip(false, false);
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });

  fetch('./data/group-trips.json', { cache: 'no-store' }).then(response => {
    if (!response.ok) throw new Error('Travel details unavailable');
    return response.json();
  }).then(data => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return;
    configuration = data;
    if (selectedCard && preview.open) fillBasicDetails(selectedCard);
  }).catch(() => { /* The visible preparation state remains available offline. */ });

  if (controls) controls.hidden = false;
  deck.classList.add('deck-ready');
  setActive(0);
  measure();
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; measure(); });
    }).observe(track, { box: 'border-box' });
  } else window.addEventListener('resize', measure);
  motion.addEventListener('change', () => center(active, false));
})();
