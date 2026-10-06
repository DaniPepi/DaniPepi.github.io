/* Destination links work without JavaScript; this adds in-page filtering. */
(() => {
  'use strict';
  const filters = [...document.querySelectorAll('[data-journal-filter]')];
  const stories = [...document.querySelectorAll('.journal-story[data-category]')];
  const grid = document.querySelector('.journal-stories');
  const status = document.getElementById('journal-filter-status');
  const allowed = new Set(filters.map(link => link.dataset.journalFilter));
  const labels = { tutti: 'Tutte le destinazioni', portogallo: 'Portogallo', madagascar: 'Madagascar', egitto: 'Egitto' };

  function selectedCountry() {
    const country = new URL(window.location.href).searchParams.get('paese') || 'tutti';
    return allowed.has(country) ? country : 'tutti';
  }

  function selectCountry(country) {
    if (!grid || !allowed.has(country)) return;
    let count = 0;
    stories.forEach(story => {
      story.hidden = country !== 'tutti' && story.dataset.category !== country;
      if (!story.hidden) count += 1;
    });
    grid.dataset.filter = country;
    filters.forEach(link => {
      if (link.dataset.journalFilter === country) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (status) status.textContent = `${count} ${count === 1 ? 'storia' : 'storie'}${country === 'tutti' ? '' : ` · ${labels[country]}`}`;
  }

  filters.forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const country = link.dataset.journalFilter;
    const url = new URL(window.location.href);
    if (country === 'tutti') url.searchParams.delete('paese');
    else url.searchParams.set('paese', country);
    url.hash = '';
    if (url.href !== window.location.href) window.history.pushState(null, '', url);
    selectCountry(country);
  }));
  window.addEventListener('popstate', () => selectCountry(selectedCountry()));
  selectCountry(selectedCountry());

  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  document.querySelectorAll('[data-published]').forEach(badge => {
    const published = Date.parse(`${badge.dataset.published}T00:00:00Z`);
    const age = (today - published) / 86400000;
    badge.hidden = !Number.isFinite(age) || age < 0 || age >= 14;
  });
  const year = document.getElementById('year');
  if (year) year.textContent = String(now.getFullYear());
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
