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
const motionButton = document.querySelector('.motion-toggle');
const heroVideo = document.querySelector('.hero-video');
let backgroundPaused = false;
heroVideo.muted = true;
heroVideo.playbackRate = 0.55;
function updateBackground() {
  const paused = backgroundPaused || reducedMotion.matches;
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Riprendi il movimento dello sfondo' : 'Metti in pausa lo sfondo';
  if (paused || document.hidden) {
    heroVideo.pause();
    if (reducedMotion.matches) heroVideo.hidden = true;
  } else {
    heroVideo.hidden = false;
    heroVideo.play().catch(() => { heroVideo.hidden = true; });
  }
}
motionButton.addEventListener('click', () => {
  backgroundPaused = !backgroundPaused;
  updateBackground();
});
heroVideo.addEventListener('error', () => { heroVideo.hidden = true; });
heroVideo.querySelector('source').addEventListener('error', () => { heroVideo.hidden = true; });
reducedMotion.addEventListener('change', updateBackground);
document.addEventListener('visibilitychange', updateBackground);
updateBackground();
const articles = {
  slow: { label: 'DIARIO · LETTURA DI ESEMPIO', title: 'Il bello di partire senza correre.', paragraphs: ['A volte il miglior itinerario è quello che lascia spazio. Una passeggiata senza una meta precisa, un mercato di quartiere, una conversazione davanti a un caffè: piccoli momenti che danno forma al ricordo di un luogo.', 'Scegli poche tappe e concediti il tempo di viverle. Prima di aggiungere una nuova destinazione, chiediti cosa vorresti scoprire davvero: un paesaggio, una cucina, una storia.', 'Questo è un testo dimostrativo del diario di CLICK&VIAGGIA. I racconti originali arriveranno con il lancio del progetto.'] },
  bag: { label: 'DIARIO · GUIDA DI ESEMPIO', title: 'Meno bagagli. Più libertà.', paragraphs: ['Parti dalla durata del viaggio, dal clima e dalle attività previste. Scegli capi che puoi abbinare tra loro e controlla la possibilità di lavarli durante il percorso.', 'Tieni documenti, eventuali medicinali personali e oggetti essenziali facilmente accessibili. Prima della partenza, verifica dimensioni e peso consentiti direttamente con il vettore.', 'Una lista breve aiuta: documenti, abbigliamento, igiene personale, caricabatterie e ciò che serve per il tuo itinerario. Questa guida è un esempio editoriale.'] },
  weekend: { label: 'DIARIO · ISPIRAZIONE DI ESEMPIO', title: 'Un weekend, un’altra prospettiva.', paragraphs: ['Apri una mappa e cerca un luogo vicino che non hai mai visitato. Un borgo, un sentiero, un museo: due giorni possono bastare per cambiare ritmo.', 'Scegli una sola esperienza centrale e costruisci il resto intorno. Lascia tempo per camminare, fermarti e scoprire qualcosa che non avevi programmato.', 'Questa lettura dimostrativa anticipa lo stile del blog. Gli articoli definitivi saranno accompagnati da luoghi, fotografie e informazioni verificate.'] }
};
const trips = {
  portogallo: { label: 'ITINERARIO DIMOSTRATIVO · 7 GIORNI', title: 'Portogallo, verso l’oceano', paragraphs: ['Un’idea di percorso tra città, paesaggi costieri e piccoli borghi.', 'Giorni 1–2: Lisbona e i suoi quartieri. Giorni 3–4: Sintra e la costa atlantica. Giorni 5–7: un soggiorno lungo la costa, con tempo per passeggiate e soste.', 'La durata e le tappe sono una proposta illustrativa. Date, prezzi, servizi inclusi, organizzatore e condizioni saranno definiti prima della vendita. Non è possibile prenotare questo itinerario.'] },
  islanda: { label: 'ITINERARIO DIMOSTRATIVO · 8 GIORNI', title: 'Islanda, fuori dall’ordinario', paragraphs: ['Un’idea di viaggio dedicata a paesaggi vulcanici, cascate e costa meridionale.', 'Giorni 1–2: Reykjavík e dintorni. Giorni 3–5: un percorso sulla costa sud. Giorni 6–8: esplorazione con tappe e tempi da adattare alla stagione.', 'Questa proposta non è in vendita. Percorso, accessibilità, trasporti e attività richiederanno una verifica in base al periodo. Date, prezzi e condizioni non sono ancora disponibili.'] },
  marocco: { label: 'ITINERARIO DIMOSTRATIVO · 6 GIORNI', title: 'Marocco, mille sfumature', paragraphs: ['Un’idea di itinerario tra medine, artigianato e paesaggi dell’Atlante.', 'Giorni 1–3: Marrakech, con tempo per quartieri e mercati. Giorni 4–5: un’escursione nei dintorni da definire. Giorno 6: rientro.', 'La proposta è illustrativa e non prenotabile. Organizzatore, accompagnamento, alloggi, inclusioni e condizioni saranno pubblicati quando il viaggio sarà confermato.'] }
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
function showSection(section, category = 'Tutti') {
  currentSection = section;
  const blog = section === 'blog';
  setDialog(blog ? 'IL DIARIO' : 'PARTIRE INSIEME', blog ? 'Scegli la tua prossima lettura.' : 'Esplora gli itinerari.');
  backButton.hidden = true;
  dialogBody.append(paragraph(blog ? 'Articoli dimostrativi. Il cerchietto rosso indica le novità degli ultimi 14 giorni; le date mostrate sono di esempio.' : 'Scegli una destinazione, scopri il percorso e condividi la sua scheda. Gli itinerari sono proposte dimostrative da definire con il team.', 'collection-note'));
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
  list.className = 'collection-grid';
  Object.entries(blog ? articles : trips).forEach(([id, record], index) => {
    if (blog && category !== 'Tutti' && categories[id] !== category) return;
    const card = document.createElement(blog ? 'button' : 'a');
    card.className = blog ? 'collection-card' : 'collection-card travel-poster';
    if (!blog) {
      card.href = 'viaggio-' + id + '.html';
      const image = document.createElement('img');
      image.src = 'assets/' + id + '.jpg';
      image.alt = '';
      image.loading = 'lazy';
      image.className = 'poster-image';
      const tag = document.createElement('span');
      tag.className = 'poster-tag';
      tag.textContent = '0' + (index + 1) + ' / CLICK&VIAGGIA';
      card.append(image, tag);
    }
    const meta = document.createElement('span');
    meta.className = 'card-meta';
    meta.textContent = blog ? categories[id] : ['7 GIORNI', '8 GIORNI', '6 GIORNI'][index];
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
    action.textContent = blog ? 'Leggi articolo' : 'Scopri l’itinerario';
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
    const partner = document.createElement('section');
    partner.className = 'partner-links';
    const heading = document.createElement('h3');
    heading.textContent = 'Travel Advantage';
    partner.append(heading, paragraph('Collegamenti alla piattaforma esterna. Gli itinerari dimostrativi sopra non rappresentano offerte di Travel Advantage. Condizioni e disponibilità si verificano sul sito di destinazione.'));
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

