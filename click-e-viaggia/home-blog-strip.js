'use strict';

(() => {
  const section = document.querySelector('#blog.home-blog-strip');
  const track = section?.querySelector('#home-blog-track');
  const toggle = section?.querySelector('#blog-strip-toggle');
  if (!section || !track || !toggle) return;

  const articles = [...track.querySelectorAll('a.blog-strip-item:not([data-strip-clone])')];
  if (articles.length < 2) return;

  const status = section.querySelector('#blog-strip-status');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 3000;
  let positions = [];
  let cycleWidth = 0;
  let index = 0;
  let timer = 0;
  let settleTimer = 0;
  let resizeFrame = 0;
  let measuredWidth = 0;
  let userPaused = motion.matches;
  let hovered = section.matches(':hover');
  let focused = section.contains(document.activeElement);
  let visible = false;
  let interacting = false;
  let paused = true;
  let rebuilding = false;

  function setIndex(next) {
    index = (next + articles.length) % articles.length;
    section.dataset.index = String(index + 1);
    if (status) status.textContent = `Articolo ${index + 1} di ${articles.length}`;
  }

  function nearestIndex(left = track.scrollLeft) {
    if (!cycleWidth) return index;
    const relative = ((left % cycleWidth) + cycleWidth) % cycleWidth;
    let nearest = 0;
    let distance = Infinity;
    positions.forEach((position, articleIndex) => {
      const difference = Math.abs(position - relative);
      const circularDistance = Math.min(difference, cycleWidth - difference);
      if (circularDistance < distance) {
        nearest = articleIndex;
        distance = circularDistance;
      }
    });
    return nearest;
  }

  function stopTimer() {
    clearTimeout(timer);
    timer = 0;
  }

  function schedule() {
    stopTimer();
    if (!paused && cycleWidth) timer = window.setTimeout(advance, interval);
  }

  function updateState() {
    const nextPaused = userPaused || hovered || focused || document.hidden || !visible || interacting;
    if (nextPaused && !paused) {
      // Stop an in-progress smooth scroll without moving the item beneath the pointer.
      track.scrollTo({ left: track.scrollLeft, behavior: 'instant' });
    }
    paused = nextPaused;
    section.dataset.paused = String(paused);
    section.dataset.playing = String(!userPaused);
    toggle.dataset.playing = String(!userPaused);
    toggle.setAttribute('aria-pressed', String(userPaused));
    const label = userPaused ? 'Riprendi le anteprime' : 'Metti in pausa le anteprime';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    schedule();
  }

  function settle() {
    clearTimeout(settleTimer);
    if (rebuilding || !cycleWidth) return;
    setIndex(nearestIndex());
    // Repeated visual items have identical geometry, so resetting by a complete
    // group is invisible. Avoid moving a link while it has keyboard focus.
    if (!focused && !interacting && track.scrollLeft >= cycleWidth - 1) {
      const remainder = Math.max(0, track.scrollLeft % cycleWidth);
      const left = remainder >= cycleWidth - 1 ? 0 : remainder;
      track.scrollTo({ left, behavior: 'instant' });
    }
  }

  function advance() {
    timer = 0;
    if (paused || !cycleWidth) return;
    const current = nearestIndex();
    const next = (current + 1) % articles.length;
    const group = Math.round((track.scrollLeft - positions[current]) / cycleWidth);
    const target = group * cycleWidth + positions[next] + (next === 0 ? cycleWidth : 0);
    setIndex(next);
    track.scrollTo({ left: target, behavior: motion.matches ? 'instant' : 'smooth' });
    schedule();
  }

  function cloneArticle(article, articleIndex) {
    const clone = article.cloneNode(true);
    clone.dataset.stripClone = String(articleIndex);
    clone.setAttribute('aria-hidden', 'true');
    clone.tabIndex = -1;
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    clone.querySelectorAll('a,button,input,select,textarea,[tabindex]').forEach(element => { element.tabIndex = -1; });
    clone.querySelectorAll('img').forEach(image => { image.alt = ''; });
    return clone;
  }

  function measure() {
    const width = track.clientWidth;
    if (!width) return;
    rebuilding = true;
    measuredWidth = width;
    track.querySelectorAll('[data-strip-clone]').forEach(clone => clone.remove());
    const first = articles[0].getBoundingClientRect();
    positions = articles.map(article => article.getBoundingClientRect().left - first.left);
    const last = articles[articles.length - 1].getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    cycleWidth = last.right - first.left + gap;

    if (cycleWidth > 0) {
      // Enough repeated items to fill even a wide rail during the final transition.
      const groups = Math.max(1, Math.ceil(width / cycleWidth));
      const fragment = document.createDocumentFragment();
      for (let group = 0; group < groups; group += 1) {
        articles.forEach((article, articleIndex) => fragment.append(cloneArticle(article, articleIndex)));
      }
      track.append(fragment);
      track.scrollTo({ left: positions[index], behavior: 'instant' });
    }
    rebuilding = false;
    updateState();
  }

  toggle.hidden = false;
  track.setAttribute('aria-live', 'off');
  if (status) status.setAttribute('aria-live', 'off');
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    updateState();
  });
  section.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    updateState();
  });
  section.addEventListener('pointerleave', event => {
    if (event.pointerType === 'touch') return;
    hovered = false;
    updateState();
  });
  section.addEventListener('focusin', () => {
    focused = true;
    updateState();
  });
  section.addEventListener('focusout', () => {
    queueMicrotask(() => {
      focused = section.contains(document.activeElement);
      updateState();
    });
  });
  track.addEventListener('pointerdown', () => {
    interacting = true;
    updateState();
  }, { passive: true });
  function endInteraction() {
    if (!interacting) return;
    interacting = false;
    updateState();
  }
  window.addEventListener('pointerup', endInteraction, { passive: true });
  window.addEventListener('pointercancel', endInteraction, { passive: true });
  track.addEventListener('wheel', schedule, { passive: true });
  track.addEventListener('scroll', () => {
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settle, 140);
  }, { passive: true });
  track.addEventListener('scrollend', settle);
  document.addEventListener('visibilitychange', updateState);
  motion.addEventListener('change', () => {
    userPaused = motion.matches;
    updateState();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      updateState();
    }).observe(section);
  } else {
    const updateVisibility = () => {
      const bounds = section.getBoundingClientRect();
      const nextVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;
      if (visible !== nextVisible) {
        visible = nextVisible;
        updateState();
      }
    };
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility, { passive: true });
    updateVisibility();
  }
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (Math.abs(track.clientWidth - measuredWidth) < 1) return;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(measure);
    }).observe(track);
  } else window.addEventListener('resize', measure);

  setIndex(0);
  measure();
})();
