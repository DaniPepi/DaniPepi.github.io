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
const title = document.querySelector('.liquid-title');
const displacement = document.querySelector('#displacement');
const noise = document.querySelector('feTurbulence');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let target = 0;
let amplitude = 0;
let frame = 0;
let phase = 0;
let touchTimer;
function animateWater() {
  amplitude += (target - amplitude) * 0.085;
  phase += 0.018;
  displacement.setAttribute('scale', amplitude.toFixed(2));
  noise.setAttribute('baseFrequency', `${(0.009 + Math.sin(phase) * 0.003).toFixed(4)} 0.035`);
  if (!motionPreference.matches && (target > 0 || amplitude > 0.15)) {
    frame = requestAnimationFrame(animateWater);
  } else {
    displacement.setAttribute('scale', '0');
    amplitude = 0;
    frame = 0;
  }
}
function startWater(strength) {
  if (motionPreference.matches) return;
  target = strength;
  if (!frame) frame = requestAnimationFrame(animateWater);
}
title.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch') return;
  const bounds = title.getBoundingClientRect();
  const position = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
  startWater(14 + position * 24);
});
title.addEventListener('pointerleave', () => { target = 0; });
title.addEventListener('pointerdown', () => {
  clearTimeout(touchTimer);
  startWater(32);
  touchTimer = setTimeout(() => { target = 0; }, 900);
});
motionPreference.addEventListener('change', () => { target = 0; });
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
const dialog = document.querySelector('#detail');
dialog.setAttribute('aria-labelledby', 'detail-title');
function openDetail(record) {
  document.querySelector('#detail-label').textContent = record.label;
  document.querySelector('#detail-title').textContent = record.title;
  const body = document.querySelector('#detail-body');
  body.replaceChildren(...record.paragraphs.map((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  }));
  dialog.showModal();
}
document.querySelectorAll('[data-article]').forEach((button) => button.addEventListener('click', () => openDetail(articles[button.dataset.article])));
document.querySelectorAll('[data-trip]').forEach((button) => button.addEventListener('click', () => openDetail(trips[button.dataset.trip])));
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
});
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
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Modalità offline non disponibile:', error.message));
  });
}

