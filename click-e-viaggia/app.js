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
function showTrips(options = {}) {
  const section = document.querySelector('#viaggi');
  section.scrollIntoView({behavior: options.instant || reducedMotion.matches ? 'auto' : 'smooth', block: 'start'});
}
document.querySelectorAll('[data-section="viaggi"]').forEach(button => button.addEventListener('click', showTrips));
navigation.querySelectorAll('a[href="#viaggi"]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault(); showTrips();
}));
function validTravelUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && (url.hostname === 'traveladvantage.com' || url.hostname.endsWith('.traveladvantage.com')); } catch { return false; }
}
fetch('./data/travel-links.json', {cache:'no-store'}).then(response => {
  if (!response.ok) throw Error('Links unavailable'); return response.json();
}).then(data => {
  if (!Array.isArray(data.links)) return;
  const links = data.links.filter(link => typeof link.title === 'string' && link.title.trim() && validTravelUrl(link.url) && typeof link.affiliate === 'boolean');
  const panel = document.querySelector('#travel-partner-links');
  if (!panel || !links.length) return;
  const heading = document.createElement('h3'); heading.textContent = 'Travel Advantage';
  const note = document.createElement('p'); note.textContent = 'Collegamenti alla piattaforma esterna. Le proposte sopra non rappresentano offerte di Travel Advantage. Condizioni e disponibilità si verificano sul sito di destinazione.';
  panel.replaceChildren(heading, note);
  links.forEach(link => {
    const item = document.createElement('div'); item.className = 'partner-item';
    const disclosure = document.createElement('p'); disclosure.className = 'collection-note'; disclosure.textContent = link.affiliate ? 'Link affiliato: il suo utilizzo può generare una commissione per chi lo pubblica.' : 'Collegamento esterno a Travel Advantage.';
    const anchor = document.createElement('a'); anchor.href = link.url; anchor.textContent = link.title + ' · Sito esterno'; anchor.className = 'button secondary'; anchor.target = '_blank'; anchor.rel = link.affiliate ? 'sponsored noopener noreferrer' : 'noopener noreferrer';
    item.append(disclosure, anchor); panel.append(item);
  });
  panel.hidden = false;
}).catch(() => {});
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
else if (requestedSection === 'viaggi') requestAnimationFrame(() => showTrips({instant:true}));
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Modalità offline non disponibile:', error.message));
  });
}
