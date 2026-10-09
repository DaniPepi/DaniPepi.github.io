'use strict';

(() => {
  if (!document.body.classList.contains('metallic-site')) return;
  if (!('IntersectionObserver' in window)) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isHome = document.body.classList.contains('site-home');
  // The homepage already owns its carousel, process, team and contact motion.
  // Reading paragraphs stay still; photographs and structural panels arrive once.
  const selector = isHome
    ? '.app-callout'
    : '.team-story > div, .member-card, .team-cta, .journal-story, .journal-contact, .article-cover, .article-related-inner, .trip-sheet, .legal-notice';
  const elements = [...document.querySelectorAll(selector)];
  const shown = new WeakSet();
  const running = new Map();
  let observer = null;

  function finish(element) {
    const state = running.get(element);
    if (!state) return;
    clearTimeout(state.timer);
    element.removeEventListener('animationend', state.onEnd);
    element.classList.remove('metal-finish-enter');
    running.delete(element);
    observer?.unobserve(element);
  }

  function reveal(element) {
    shown.add(element);
    if (reduced.matches || document.hidden) return;
    const onEnd = event => {
      if (event.target === element && event.animationName === 'metal-finish-arrive') finish(element);
    };
    element.addEventListener('animationend', onEnd);
    // Cleanup also works if a stylesheet does not load or animation is cancelled.
    const timer = setTimeout(() => finish(element), 850);
    running.set(element, { timer, onEnd });
    element.classList.add('metal-finish-enter');
  }

  function disconnect() {
    observer?.disconnect();
    observer = null;
    [...running.keys()].forEach(finish);
  }

  function observe() {
    disconnect();
    if (reduced.matches || document.hidden) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          if (running.has(entry.target)) finish(entry.target);
          return;
        }
        if (!shown.has(entry.target)) reveal(entry.target);
        else if (!running.has(entry.target)) observer?.unobserve(entry.target);
      });
    }, { threshold: .12 });
    elements.forEach(element => {
      if (!shown.has(element) && !element.closest('[hidden], [inert]')) observer.observe(element);
    });
  }

  reduced.addEventListener('change', observe);
  document.addEventListener('visibilitychange', observe);
  window.addEventListener('pagehide', disconnect, { passive: true });
  window.addEventListener('pageshow', observe, { passive: true });
  observe();
})();
