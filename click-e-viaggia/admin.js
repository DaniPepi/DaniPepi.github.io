'use strict';
const statusMessage = document.querySelector('#admin-status');
const output = document.querySelector('#configuration');
const list = document.querySelector('#admin-links');
const form = document.querySelector('#link-form');
let links = [];
let loaded = false;
function validUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && (url.hostname === 'traveladvantage.com' || url.hostname.endsWith('.traveladvantage.com'));
  } catch { return false; }
}
function render() {
  output.value = JSON.stringify({ links }, null, 2);
  list.replaceChildren();
  links.forEach((link, index) => {
    const item = document.createElement('li');
    const title = document.createElement('span');
    title.textContent = link.title;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Rimuovi dalla bozza';
    remove.setAttribute('aria-label', 'Rimuovi dalla bozza: ' + link.title);
    remove.addEventListener('click', () => {
      links.splice(index, 1);
      render();
      statusMessage.textContent = 'Bozza modificata. Non ancora pubblicata.';
    });
    item.append(title, remove);
    list.append(item);
  });
}
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!loaded) {
    statusMessage.textContent = 'Configurazione non caricata: ricarica la pagina prima di modificare i link.';
    return;
  }
  const title = document.querySelector('#link-title').value.trim();
  const url = document.querySelector('#link-url').value.trim();
  if (!title || !validUrl(url)) {
    statusMessage.textContent = 'Inserisci un titolo e un URL HTTPS sul dominio traveladvantage.com o un suo sottodominio.';
    return;
  }
  if (links.some(link => link.url === url)) {
    statusMessage.textContent = 'Questo collegamento è già nella bozza.';
    return;
  }
  links.push({ title, url, affiliate: document.querySelector('#link-affiliate').checked });
  render();
  form.reset();
  statusMessage.textContent = 'Link aggiunto alla bozza. Copia la configurazione e confermala su GitHub per pubblicarla.';
});
document.querySelector('#copy-config').addEventListener('click', async () => {
  if (!loaded) return;
  try {
    await navigator.clipboard.writeText(output.value);
    statusMessage.textContent = 'Configurazione copiata. Apri l’editor GitHub per pubblicarla.';
  } catch {
    output.focus();
    output.select();
    statusMessage.textContent = 'Selezione pronta: copia il testo manualmente e incollalo nell’editor GitHub.';
  }
});
fetch('./data/travel-links.json', { cache: 'no-store' }).then(response => {
  if (!response.ok) throw new Error('Configurazione non disponibile');
  return response.json();
}).then(data => {
  if (!Array.isArray(data.links) || data.links.some(link => typeof link.title !== 'string' || !link.title.trim() || !validUrl(link.url) || typeof link.affiliate !== 'boolean')) throw new Error('Configurazione non valida');
  links = data.links;
  loaded = true;
  render();
  statusMessage.textContent = links.length ? 'Collegamenti pubblicati caricati. Le modifiche successive rimangono in bozza.' : 'Nessun link pubblicato. Aggiungi il tuo primo collegamento.';
}).catch(() => {
  statusMessage.textContent = 'Impossibile caricare i link esistenti. Ricarica la pagina o controlla il file su GitHub; le modifiche sono disabilitate per evitare di sovrascriverli.';
  form.querySelector('button').disabled = true;
  document.querySelector('#copy-config').disabled = true;
});

