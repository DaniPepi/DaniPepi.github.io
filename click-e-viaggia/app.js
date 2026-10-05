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
const articles = {
  "slow": {
    "label": "IL DIARIO · ISPIRAZIONI",
    "title": "Viaggiare con più tempo: un itinerario da vivere",
    "paragraphs": [
      "Il ritmo di un viaggio si decide spesso prima della partenza. Riempire ogni giornata di appuntamenti può rendere difficile apprezzare ciò che accade tra una visita e l’altra. Un itinerario ben costruito lascia spazio alla curiosità, alle pause e alle scoperte inattese.",
      "Comincia dalle tue priorità. Scegli i luoghi che desideri davvero conoscere e chiediti cosa ti attira: un paesaggio, una storia, una cucina, un’atmosfera. Questa scelta aiuta a dare un senso al percorso e a distinguere le tappe essenziali da quelle che puoi valutare sul momento.",
      "Organizza poi le giornate per zone, considerando anche gli spostamenti. La distanza sulla carta racconta soltanto una parte dell’esperienza: raggiungere una stazione, trovare un ingresso o orientarsi in un quartiere richiede tempo. Prevedere questi passaggi rende il programma più semplice da seguire.",
      "Lascia un intervallo libero tra le attività principali. Potrai usarlo per sederti in una piazza, entrare in una bottega o prolungare una passeggiata. Se viaggi in compagnia, confronta prima interessi e ritmi: una pausa condivisa può diventare un momento piacevole per tutti.",
      "Prima di partire, verifica le informazioni utili alle visite che hai scelto e prepara un’alternativa per le attività all’aperto. Mantieni il programma facile da consultare, con indirizzi e riferimenti raccolti nello stesso posto. Una buona preparazione ti permette di adattarti con maggiore serenità.",
      "Al ritorno, prova a ricordare quali momenti ti hanno coinvolto di più. Saranno un’indicazione preziosa per il viaggio successivo. Esplora le nostre mete e racconta al team che tipo di esperienza desideri vivere: il punto di partenza è proprio questo."
    ]
  },
  "bag": {
    "label": "IL DIARIO · CONSIGLI",
    "title": "Bagaglio essenziale: scegliere ciò che serve al tuo viaggio",
    "paragraphs": [
      "Preparare un bagaglio essenziale significa collegare ogni oggetto al viaggio che stai organizzando. La durata del soggiorno conta, insieme alle attività previste, agli spostamenti e alle tue abitudini. Partire da queste esigenze rende la scelta più chiara e aiuta a gestire meglio ciò che porterai.",
      "Scrivi una lista divisa per situazioni: giornate fuori, momenti di riposo, eventuali occasioni particolari. Consulta le previsioni vicino alla partenza e valuta gli ambienti che frequenterai. Potrai così scegliere capi adatti, evitando di aggiungere indumenti sulla base di possibilità troppo vaghe.",
      "Costruisci gli abbinamenti prima di mettere tutto in valigia. Colori coordinabili e capi che puoi usare in occasioni diverse semplificano il guardaroba. Per le calzature, considera le attività e preferisci quelle con cui ti trovi già bene, soprattutto quando prevedi di camminare a lungo.",
      "Raccogli gli accessori in piccoli gruppi facili da riconoscere. Tieni a portata di mano ciò che utilizzerai durante gli spostamenti e verifica quali dotazioni sono disponibili nella sistemazione scelta. Un elenco delle cose già presenti ti aiuterà a evitare doppioni e a organizzare gli spazi.",
      "Se viaggi in aereo, controlla le regole della compagnia relative al tuo biglietto e ai bagagli, insieme alle indicazioni aggiornate per ciò che puoi trasportare. Fai poi una prova completa: chiudi il bagaglio, sollevalo e verifica che gli oggetti più utili siano facilmente raggiungibili.",
      "Conserva la lista e aggiornala al ritorno, segnando ciò che hai usato davvero. Diventerà una base personale per le prossime partenze. Quando esplori una meta, pensa anche al modo in cui vorresti viverla: parlarne con il team può aiutarti a mettere a fuoco le tue esigenze."
    ]
  },
  "weekend": {
    "label": "IL DIARIO · IDEE",
    "title": "Un weekend vicino: dare spazio a una piccola partenza",
    "paragraphs": [
      "Una pausa di pochi giorni può cominciare da un luogo vicino che hai sempre rimandato. Un borgo, una città o un tratto di costa diventano una buona occasione per cambiare ritmo. Il primo passo è scegliere l’esperienza che cerchi: passeggiare, scoprire una cucina, visitare o semplicemente riposare.",
      "Valuta la meta a partire dal tempo che hai realmente a disposizione. Considera l’orario di partenza, il rientro e gli spostamenti necessari una volta arrivato. Una destinazione comoda da raggiungere ti permette di dedicare una parte maggiore del weekend a ciò che desideri fare.",
      "Scegli una base coerente con il programma. Se vuoi muoverti a piedi, osserva la posizione della sistemazione rispetto ai luoghi che ti interessano. Se preferisci esplorare i dintorni, valuta i collegamenti e le modalità di spostamento. Questi dettagli influenzano la semplicità delle giornate.",
      "Dai al weekend un punto di riferimento: una visita che ti incuriosisce, un percorso panoramico o un’esperienza gastronomica. Costruisci il resto intorno a questa scelta, lasciando spazio per fermarti dove ti trovi bene. Anche un programma breve beneficia di un’alternativa in caso di cambiamenti.",
      "Prima di prenotare, raccogli le informazioni aggiornate sulle attività scelte e valuta il costo complessivo della partenza, includendo gli spostamenti e le esigenze quotidiane. Confronta il programma con chi viaggia con te: interessi condivisi e aspettative chiare rendono più facile godersi il tempo insieme.",
      "Durante il soggiorno, presta attenzione ai dettagli che danno carattere al luogo: una strada tranquilla, una piazza animata, una conversazione. Sono spesso questi momenti a rendere personale una piccola partenza. Cerca nuove idee nel blog e condividi con il team la meta che ti incuriosisce."
    ]
  }
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
const publicationDates = { slow: '2026-10-05', bag: '2026-10-05', weekend: '2026-10-05' };
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
  dialog.classList.remove('trips-dialog');
  backButton.hidden = false;
  dialogBody.append(...record.paragraphs.map(text => paragraph(text)));
  const actions = document.createElement('div');
  actions.className = 'article-cta';
  const explore = document.createElement('button');
  explore.className = 'button primary';
  explore.textContent = 'Esplora le mete';
  explore.addEventListener('click', () => showSection('viaggi'));
  const talk = document.createElement('a');
  talk.className = 'button secondary';
  talk.href = 'https://wa.me/393892962059?text=' + encodeURIComponent('Ciao team Click&Viaggia, vorrei concordare un appuntamento per informazioni sulle vostre proposte di viaggio. Quando possiamo sentirci?');
  talk.target = '_blank';
  talk.rel = 'noopener noreferrer';
  talk.textContent = 'Parla con il team';
  actions.append(explore, talk);
  dialogBody.append(actions);
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
  dialogBody.append(paragraph(blog ? 'Guide originali per dare forma alle tue prossime partenze. Il cerchietto rosso indica gli articoli pubblicati negli ultimi 14 giorni.' : 'Due mete, due modi di emozionarsi. Scegli il viaggio che ti ispira: la sua pagina si apre in una nuova scheda, pronta da esplorare e condividere.', 'collection-note'));
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
document.querySelectorAll('[data-article]').forEach(button => button.addEventListener('click', () => {
  const record = articles[button.dataset.article];
  if (!record) return;
  currentSection = 'blog';
  openDetail(record);
}));
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
