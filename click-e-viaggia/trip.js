'use strict';
(() => {
  const find = selector => document.querySelector(selector);
  const shareButton = find('#share-trip'), shareStatus = find('#share-status'), shareLink = find('#share-link');
  const contact = find('#appointment-button');
  const canonical = find('link[rel="canonical"]')?.href || location.href;
  const destination = document.body.dataset.destination || 'QUESTO VIAGGIO';
  const message = `Ciao team Click&Viaggia, vorrei prendere un appuntamento per informazioni sul VIAGGIO “${destination.toUpperCase()}”. Mi interessa partecipare senza impegno. Quando possiamo sentirci?`;
  shareButton?.addEventListener('click', async () => {
    const data = {title: document.title, text: find('h1')?.textContent.trim() || destination, url: canonical};
    shareButton.disabled = true;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share(data);
        if (shareStatus) shareStatus.textContent = 'Scheda condivisa.';
      } else {
        await navigator.clipboard.writeText(canonical);
        if (shareStatus) shareStatus.textContent = 'Link copiato. Puoi inviarlo a chi desideri.';
      }
    } catch (error) {
      if (error?.name !== 'AbortError' && shareLink) {
        shareLink.hidden = false; shareLink.value = canonical; shareLink.focus(); shareLink.select();
        if (shareStatus) shareStatus.textContent = 'Copia questo link per condividere la scheda.';
      }
    } finally { shareButton.disabled = false; }
  });
  const photo = find('#trip-photo'), caption = find('#trip-photo-caption');
  const thumbnails = [...document.querySelectorAll('[data-trip-photo]')];
  thumbnails.forEach(button => button.addEventListener('click', () => {
    const source = button.dataset.tripPhoto || '';
    if (!photo || !/^assets\/[a-zA-Z0-9._-]+\.(?:jpe?g|png|webp)$/i.test(source)) return;
    photo.src = source; photo.alt = button.dataset.tripAlt || destination;
    if (caption) caption.textContent = button.dataset.tripCaption || '';
    thumbnails.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  function contactUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value);
      if (url.username || url.password) return '';
      if (url.protocol === 'mailto:' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url.pathname)) return url.href;
      if (url.protocol !== 'https:') return '';
      if (url.hostname === 'wa.me') url.searchParams.set('text', message);
      return url.href;
    } catch { return ''; }
  }
  fetch('./data/contact.json', {cache: 'no-store'}).then(response => {
    if (!response.ok) throw Error('Contatti non disponibili.'); return response.json();
  }).then(data => { const url = contactUrl(data.appointmentUrl); if (contact && url) contact.href = url; }).catch(() => {});
  function text(value) { return typeof value === 'string' ? value.trim() : ''; }
  function groupUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'chat.whatsapp.com' && !url.username && !url.password && /^\/[A-Za-z0-9_-]{6,128}\/?$/.test(url.pathname) ? url.href : '';
    } catch { return ''; }
  }
  function renderProgramme(rows) {
    const list = find('#trip-programme-list'); if (!list || !Array.isArray(rows)) return;
    const valid = rows.filter(row => row && text(row.day) && text(row.title) && typeof row.description === 'string').slice(0, 30);
    if (!valid.length) return;
    const items = valid.map(row => {
      const item = document.createElement('li'); item.className = 'trip-day';
      const label = document.createElement('span'); label.className = 'trip-day-label'; label.textContent = text(row.day);
      const content = document.createElement('div'), title = document.createElement('h3'), description = document.createElement('p');
      title.textContent = text(row.title); description.textContent = text(row.description);
      content.append(title, description); item.append(label, content); return item;
    });
    list.replaceChildren(...items); list.hidden = false;
    const empty = find('#trip-programme-empty'); if (empty) empty.hidden = true;
    const status = find('#trip-programme-status'); if (status) status.textContent = 'Programma del viaggio';
  }
  function renderInclusions(values) {
    const list = find('#trip-inclusions-list'); if (!list || !Array.isArray(values)) return;
    const items = values.map(text).filter(Boolean).slice(0, 20).map(value => { const item = document.createElement('li'); item.textContent = value; return item; });
    if (!items.length) return;
    list.replaceChildren(...items); list.hidden = false;
    const empty = find('#trip-inclusions-empty'); if (empty) empty.hidden = true;
  }
  fetch('./data/group-trips.json', {cache: 'no-store'}).then(response => {
    if (!response.ok) throw Error('Programma non disponibile.'); return response.json();
  }).then(data => {
    const record = data[document.body.dataset.tripId]; if (!record || typeof record !== 'object') return;
    for (const [id, value] of [['#trip-date', record.dates], ['#trip-duration', record.duration]]) {
      const element = find(id); if (element && text(value)) element.textContent = text(value);
    }
    renderProgramme(record.programme); renderInclusions(record.inclusions);
    const group = find('#trip-group'), url = groupUrl(record.whatsappGroupUrl);
    if (group && url) { group.href = url; group.hidden = false; }
  }).catch(() => {});
})();
