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
const articles = {
  slow: { label: 'DIARIO · LETTURA DI ESEMPIO', title: 'Il bello di partire senza correre.', paragraphs: ['A volte il miglior itinerario è quello che lascia spazio. Una passeggiata senza una meta precisa, un mercato di quartiere, una conversazione davanti a un caffè: piccoli momenti che danno forma al ricordo di un luogo.', 'Scegli poche tappe e concediti il tempo di viverle. Prima di aggiungere una nuova destinazione, chiediti cosa vorresti scoprire davvero: un paesaggio, una cucina, una storia.', 'Questo è un testo dimostrativo del diario di CLICK&VIAGGIA. I racconti originali arriveranno con il lancio del progetto.'] },
  bag: { label: 'DIARIO · GUIDA DI ESEMPIO', title: 'Meno bagagli. Più libertà.', paragraphs: ['Parti dalla durata del viaggio, dal clima e dalle attività previste. Scegli capi che puoi abbinare tra loro e controlla la possibilità di lavarli durante il percorso.', 'Tieni documenti, eventuali medicinali personali e oggetti essenziali facilmente accessibili. Prima della partenza, verifica dimensioni e peso consentiti direttamente con il vettore.', 'Una lista breve aiuta: documenti, abbigliamento, igiene personale, caricabatterie e ciò che serve per il tuo itinerario. Questa guida è un esempio editoriale.'] },
  weekend: { label: 'DIARIO · ISPIRAZIONE DI ESEMPIO', title: 'Un weekend, un’altra prospettiva.', paragraphs: ['Apri una mappa e cerca un luogo vicino che non hai mai visitato. Un borgo, un sentiero, un museo: due giorni possono bastare per cambiare ritmo.', 'Scegli una sola esperienza centrale e costruisci il resto intorno. Lascia tempo per camminare, fermarti e scoprire qualcosa che non avevi programmato.', 'Questa lettura dimostrativa anticipa lo stile del blog. Gli articoli definitivi saranno accompagnati da luoghi, fotografie e informazioni verificate.'] }
};
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
const publicationDates = { slow: '2026-10-04', bag: '2026-09-10', weekend: '2026-10-03' };
const categories = { slow: 'Ispirazioni', bag: 'Consigli', weekend: 'Idee' };
let travelLinks = [];
let linksUnavailable = false;
function validTravelUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && (url.hostname === 'traveladvantage.com' || url.hostname.endsWith('.traveladvantage.com'));
  } catch { return false; }
}
const dialog = document.querySelector('#detail');
const backButton = dialog.querySelector('.back-button');
const dialogTitle = document.querySelector('#detail-title');
const dialogBody = document.querySelector('#detail-body');
let currentSection = 'blog';
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
function isNew(date) {
  const published = new Date(date + 'T00:00:00');
  const age = Date.now() - published.getTime();
  return age >= 0 && age < 14 * 86400000;
}
function openDetail(record) {
  setDialog(record.label, record.title);
  backButton.hidden = false;
  dialogBody.append(...record.paragraphs.map(text => paragraph(text)));
  dialogTitle.focus();
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
  action.textContent = 'Apri la scheda';
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  action.append(arrow);
  body.append(heading, title, summary, tags, action);
  card.append(media, body);
  return card;
}
function showSection(section, category = 'Tutti') {
  currentSection = section;
  const blog = section === 'blog';
  setDialog(blog ? 'IL DIARIO' : 'VIAGGI CON CLICK&VIAGGIA', blog ? 'Scegli la tua prossima lettura.' : 'Da quale sogno partiamo?');
  dialog.classList.toggle('trips-dialog', !blog);
  backButton.hidden = true;
  dialogBody.append(paragraph(blog ? 'Articoli dimostrativi. Il cerchietto rosso indica le novità degli ultimi 14 giorni; le date mostrate sono di esempio.' : 'Due mete, due modi di emozionarsi. Scegli il viaggio che ti ispira: la sua pagina si apre in una nuova scheda, pronta da esplorare e condividere.', 'collection-note'));
  if (blog) {
    const filters = document.createElement('div');
    filters.className = 'category-filters';
    filters.setAttribute('role', 'group');
    filters.setAttribute('aria-label', 'Filtra gli articoli per categoria');
    ['Tutti', 'Ispirazioni', 'Consigli', 'Idee'].forEach(name => {
      const button = document.createElement('button');
      button.className = 'category-filter';
      button.textContent = name;
      button.setAttribute('aria-pressed', String(category === name));
      button.addEventListener('click', () => {
        showSection('blog', name);
        [...dialogBody.querySelectorAll('.category-filter')].find(item => item.textContent === name).focus();
      });
      filters.append(button);
    });
    dialogBody.append(filters);
  }
  const list = document.createElement('div');
  list.className = blog ? 'collection-grid' : 'collection-grid trip-collection';
  Object.entries(blog ? articles : trips).forEach(([id, record]) => {
    if (!blog) {
      list.append(tripCard(id, record));
      return;
    }
    if (blog && category !== 'Tutti' && categories[id] !== category) return;
    const card = document.createElement('button');
    card.className = 'collection-card';
    const meta = document.createElement('span');
    meta.className = 'card-meta';
    meta.textContent = categories[id];
    if (blog && isNew(publicationDates[id])) {
      const badge = document.createElement('span');
      badge.className = 'new-badge';
      badge.textContent = 'Nuovo';
      card.append(badge);
    }
    const heading = document.createElement('span');
    heading.className = 'card-title';
    heading.textContent = record.title;
    const summary = document.createElement('span');
    summary.className = 'card-summary';
    summary.textContent = record.paragraphs[0];
    const action = document.createElement('span');
    action.className = 'card-action';
    action.textContent = 'Leggi articolo';
    card.append(meta, heading, summary);
    if (blog) {
      const date = document.createElement('time');
      date.dateTime = publicationDates[id];
      date.textContent = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(publicationDates[id] + 'T00:00:00'));
      card.append(date);
    }
    card.append(action);
    if (blog) card.addEventListener('click', () => openDetail(record));
    list.append(card);
  });
  dialogBody.append(list);
  if (!blog) {
    dialogBody.append(paragraph('Proposte in preparazione. Date, programma e servizi saranno comunicati quando definiti.', 'trip-preparation'));
    const guide = document.createElement('ol');
    guide.className = 'trip-guide';
    [
      ['Scegli la tua meta', 'Fátima o Disneyland Paris: segui ciò che ti ispira.'],
      ['Esplora la scheda', 'Foto e descrizione ti aiutano a conoscere il viaggio.'],
      ['Parliamone su WhatsApp', 'Richiedi un appuntamento al team dalla pagina del viaggio.']
    ].forEach(([title, text]) => {
      const item = document.createElement('li');
      const heading = document.createElement('h3');
      heading.textContent = title;
      item.append(heading, paragraph(text));
      guide.append(item);
    });
    dialogBody.append(guide);
  }
  if (!blog && travelLinks.length) {
    const partner = document.createElement('section');
    partner.className = 'partner-links';
    const heading = document.createElement('h3');
    heading.textContent = 'Travel Advantage';
    partner.append(heading, paragraph('Collegamenti alla piattaforma esterna. Le proposte sopra non rappresentano offerte di Travel Advantage. Condizioni e disponibilità si verificano sul sito di destinazione.'));
    if (!travelLinks.length) partner.append(paragraph(linksUnavailable ? 'Collegamenti temporaneamente non disponibili. Riprova con una connessione attiva.' : 'I link personali saranno disponibili quando pubblicati dal titolare.'));
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
document.querySelectorAll('[data-section]').forEach(button => button.addEventListener('click', () => showSection(button.dataset.section)));
navigation.querySelectorAll('a[href="#blog"], a[href="#viaggi"]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  showSection(link.getAttribute('href').slice(1));
}));
backButton.addEventListener('click', () => { showSection(currentSection); dialogTitle.focus(); });
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
  if (dialog.open && currentSection === 'viaggi' && backButton.hidden) showSection('viaggi');
}).catch(() => { linksUnavailable = true; });
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
if (requestedSection === 'blog' || requestedSection === 'viaggi') showSection(requestedSection);
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Modalità offline non disponibile:', error.message));
  });
}
