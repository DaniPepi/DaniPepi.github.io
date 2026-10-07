'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
const hero = document.querySelector('.hero');
const heroTitle = document.querySelector('.flow-title');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const letters = [];
heroTitle.querySelectorAll('.title-word, .amp').forEach(word => {
  const text = word.textContent;
  word.replaceChildren(...Array.from(text).map(character => {
    const letter = document.createElement('span');
    letter.className = 'magnetic-letter';
    letter.textContent = character;
    letters.push(letter);
    return letter;
  }));
});
let pointerFrame = 0;
let cursor = null;
function resetMagnet() {
  cursor = null;
  if (pointerFrame) cancelAnimationFrame(pointerFrame);
  pointerFrame = 0;
  hero.classList.remove('pointer-active');
  letters.forEach(letter => { letter.style.transform = ''; letter.style.color = ''; });
}
hero.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' || reducedMotion.matches) return;
  cursor = { x: event.clientX, y: event.clientY };
  if (pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    pointerFrame = 0;
    if (!cursor) return;
    hero.classList.add('pointer-active');
    letters.forEach(letter => {
      const rect = letter.getBoundingClientRect();
      const dx = cursor.x - (rect.left + rect.width / 2);
      const dy = cursor.y - (rect.top + rect.height / 2);
      const influence = Math.max(0, 1 - Math.hypot(dx, dy) / 230);
      const x = Math.max(-4, Math.min(4, dx * influence * 0.05));
      const y = Math.max(-22, Math.min(22, dy * influence * 0.2));
      letter.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${(x * 0.24).toFixed(2)}deg)`;
      letter.style.color = influence > 0.6 ? '#d8f36b' : '';
    });
  });
});
hero.addEventListener('pointerleave', resetMagnet);
reducedMotion.addEventListener('change', resetMagnet);
const motionToggle = document.querySelector('#motion-toggle');
motionToggle.addEventListener('click', () => {
  const paused = hero.classList.toggle('motion-paused');
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.textContent = paused ? 'Riprendi lo sfondo' : 'Metti in pausa lo sfondo';
});
const trips = {
  fatima: {
    name: 'Fátima', country: 'Portogallo', title: 'Un cammino da condividere.',
    image: 'fatima.jpg', summary: 'Un luogo che invita a fermarsi e ritrovare ciò che conta. Spiritualità, tempo per sé e il piacere di partire insieme.',
    tags: ['Raccoglimento', 'Condivisione']
  },
  disney: {
    name: 'Disneyland Paris', country: 'Francia', title: 'La meraviglia, insieme.',
    image: 'disney-panorama.jpg', summary: 'Lascia spazio alla fantasia con le persone che ami. Un’idea da immaginare in famiglia, in coppia o con gli amici.',
    tags: ['Fantasia', 'Ricordi insieme']
  }
};
let travelLinks = [];
function validTravelUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && (url.hostname === 'traveladvantage.com' || url.hostname.endsWith('.traveladvantage.com'));
  } catch { return false; }
}
const dialog = document.querySelector('#detail');
const dialogTitle = document.querySelector('#detail-title');
const dialogBody = document.querySelector('#detail-body');
function paragraph(text, className = '') {
  const element = document.createElement('p');
  element.textContent = text;
  element.className = className;
  return element;
}
function setDialog(label, title) {
  document.querySelector('#detail-label').textContent = label;
  dialogTitle.textContent = title;
  dialogBody.replaceChildren();
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('dialog-open');
  dialog.scrollTop = 0;
}
function tripCard(id, record) {
  const card = document.createElement('a');
  card.className = 'trip-card';
  card.href = 'viaggio-' + id + '.html';
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label', record.name + '. Apri la scheda del viaggio in una nuova scheda.');
  const media = document.createElement('div');
  media.className = 'trip-card-media';
  const image = document.createElement('img');
  image.src = 'assets/' + record.image;
  image.alt = '';
  image.width = 1600;
  image.height = id === 'fatima' ? 900 : 1067;
  image.decoding = 'async';
  const country = document.createElement('span');
  country.className = 'trip-country';
  country.textContent = record.country;
  media.append(image, country);
  const body = document.createElement('div');
  body.className = 'trip-card-body';
  const heading = document.createElement('h3');
  heading.textContent = record.name;
  const title = paragraph(record.title, 'trip-card-story');
  const summary = paragraph(record.summary, 'trip-card-summary');
  const tags = document.createElement('ul');
  tags.className = 'trip-tags';
  record.tags.forEach(text => {
    const item = document.createElement('li');
    item.textContent = text;
    tags.append(item);
  });
  const action = document.createElement('span');
  action.className = 'trip-card-action';
  action.textContent = 'Programma e dettagli';
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  action.append(arrow);
  body.append(heading, title, summary, tags, action);
  card.append(media, body);
  return card;
}
function showTrips() {
  setDialog('VIAGGI DI GRUPPO', 'Scegli la tua prossima meta.');
  dialog.classList.add('trips-dialog');
  dialogBody.append(paragraph('Fátima o Disneyland Paris? Apri la scheda per vedere le immagini, conoscere la proposta e parlare con il team.', 'collection-note'));
  const list = document.createElement('div');
  list.className = 'collection-grid trip-collection';
  Object.entries(trips).forEach(([id, record]) => list.append(tripCard(id, record)));
  dialogBody.append(list);
  dialogBody.append(paragraph('Proposte in preparazione. Date, programma e servizi saranno comunicati quando definiti.', 'trip-preparation'));
  if (travelLinks.length) {
    const partner = document.createElement('section');
    partner.className = 'partner-links';
    const heading = document.createElement('h3');
    heading.textContent = 'Travel Advantage';
    partner.append(heading, paragraph('Collegamenti alla piattaforma esterna. Le proposte sopra non rappresentano offerte di Travel Advantage. Condizioni e disponibilità si verificano sul sito di destinazione.'));
    travelLinks.forEach(link => {
      const item = document.createElement('div');
      item.className = 'partner-item';
      item.append(paragraph(link.affiliate ? 'Link affiliato: il suo utilizzo può generare una commissione per chi lo pubblica.' : 'Collegamento esterno a Travel Advantage.', 'collection-note'));
      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.textContent = link.title + ' · Sito esterno';
      anchor.className = 'button secondary';
      anchor.target = '_blank';
      anchor.rel = link.affiliate ? 'sponsored noopener noreferrer' : 'noopener noreferrer';
      item.append(anchor);
      partner.append(item);
    });
    dialogBody.append(partner);
  }
}
document.querySelectorAll('[data-section="viaggi"]').forEach(button => button.addEventListener('click', showTrips));
navigation.querySelectorAll('a[href="#viaggi"]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  showTrips();
}));
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
});
fetch('./data/travel-links.json', { cache: 'no-store' }).then(response => {
  if (!response.ok) throw new Error('Links unavailable');
  return response.json();
}).then(data => {
  if (!Array.isArray(data.links)) throw new Error('Invalid configuration');
  travelLinks = data.links.filter(link => typeof link.title === 'string' && link.title.trim() && validTravelUrl(link.url) && typeof link.affiliate === 'boolean');
  if (dialog.open) showTrips();
}).catch(() => { travelLinks = []; });
let installPrompt;
const installButton = document.querySelector('#install');
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  await installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = undefined;
  installButton.hidden = true;
});
window.addEventListener('appinstalled', () => { installButton.hidden = true; });
const requestedSection = new URLSearchParams(window.location.search).get('section');
if (requestedSection === 'blog') window.location.replace('blog.html');
else if (requestedSection === 'viaggi') showTrips();
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Modalità offline non disponibile:', error.message));
  });
}
