import {enableMapNavigation} from './map-navigation.js?v=9';
import {connectAccount} from './map-auth.js';
const $ = id => document.getElementById(id);
const key = 'click-viaggia-visited-v1';
let countries = [], visited = new Set(), guest = [], selected, account, user = null, busy = false;
let stories = {}, photos = {}, imageRequest = 0;
const nodes = new Map();
const map = $('world-map');
enableMapNavigation(map, $('map-camera'), openCountry);
function readGuest() { try { const data = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(data) ? data.filter(x => typeof x === 'string') : []; } catch { return []; } }
guest = readGuest(); visited = new Set(guest);
function refresh() {
  const only = $('show-visited').getAttribute('aria-pressed') === 'true';
  nodes.forEach((node, code) => { node.classList.toggle('visited', visited.has(code)); const layer=visited.has(code)?$('visited-layer'):$('map-layer'); if(node.parentNode!==layer) layer.append(node); node.classList.toggle('dimmed', only && !visited.has(code)); node.setAttribute('aria-label', `${countries.find(c => c.code === code).name}, ${visited.has(code) ? 'visitato' : 'da scoprire'}`); });
  $('visited-count').textContent = visited.size;
  if (selected) { $('toggle-visited').textContent = visited.has(selected.code) ? 'Rimuovi dai visitati' : 'Segna come visitato'; $('country-state').textContent = visited.has(selected.code) ? 'Questo paese è nel tuo diario.' : 'Un nuovo ricordo da aggiungere.'; }
}
function openCountry(code) {
  selected = countries.find(c => c.code === code); if (!selected) return;
  const story = stories[code];
  $('country-name').textContent = selected.name;
  $('country-region').textContent = selected.region;
  $('country-headline').textContent = story?.headline || selected.name;
  $('country-description').textContent = story?.description || selected.description;
  $('country-capital').textContent = selected.capital ? `Capitale: ${selected.capital}` : '';
  $('country-flag-use').setAttribute('href',`assets/flags.svg#flag-${selected.code}`);
  $('preview-flag-use').setAttribute('href',`assets/flags.svg#flag-${selected.code}`);
  $('preview-name').textContent=selected.name;
  $('preview-description').textContent=story?.description || selected.description;
  $('preview-region').textContent=selected.region;
  $('preview-flag').removeAttribute('hidden'); $('preview-open').hidden=false;
  $('country-select').value=selected.code;
  nodes.forEach((node,code)=>node.classList.toggle('selected',code===selected.code));
  loadCountryPhoto(code);
  refresh();
  const show=()=>{if (!$('country-dialog').open) $('country-dialog').showModal();};
  if(document.fullscreenElement) document.exitFullscreen().then(show).catch(show); else show();
}
function safePhotoUrl(value, source = false) {
  try { const url = new URL(value); return url.protocol === 'https:' && (source ? ['commons.wikimedia.org','creativecommons.org','en.wikivoyage.org'].includes(url.hostname) : url.hostname === 'upload.wikimedia.org') ? url.href : ''; } catch { return ''; }
}
function loadCountryPhoto(code) {
  const photo=photos[code], request=++imageRequest, image=document.createElement('img');
  image.id='country-photo';image.decoding='async';image.referrerPolicy='no-referrer';image.hidden=true;
  $('country-photo').replaceWith(image);
  $('photo-loading').hidden=false; $('photo-loading').textContent='Un primo sguardo alla destinazione…';
  $('photo-credit').hidden=true; $('country-photo-caption').textContent='';
  if (!photo || !safePhotoUrl(photo.url)) { $('photo-loading').textContent='Fotografia non disponibile al momento.'; return; }
  image.onload=async()=>{
    try { await image.decode(); } catch { if(request===imageRequest) $('photo-loading').textContent='La foto non è disponibile. Puoi aprire la fonte fotografica qui sotto.'; return; }
    if(request!==imageRequest)return;image.hidden=false;$('photo-loading').hidden=true;
  };
  image.onerror=()=>{if(request!==imageRequest)return;image.hidden=true;$('photo-loading').textContent='La foto non è disponibile. Puoi aprire la fonte fotografica qui sotto.';};
  image.alt=photo.caption || `Paesaggio rappresentativo di ${selected.name}`;
  $('country-photo-caption').textContent=photo.caption || '';
  $('photo-author').textContent=photo.author;
  const sourceUrl=safePhotoUrl(photo.sourceUrl,true), licenseUrl=safePhotoUrl(photo.licenseUrl,true);
  $('photo-source').href=sourceUrl || '#'; $('photo-license').textContent=photo.license;
  $('photo-license').href=licenseUrl || sourceUrl || '#'; $('photo-credit').hidden=false;
  image.src=safePhotoUrl(photo.url);
}
async function save(next) {
  if (busy) return; busy = true; $('toggle-visited').disabled = true;
  const savingUid = user?.uid;
  try {
    if (user) { if (!account) throw Error(); await account.save([...next]); }
    else { localStorage.setItem(key, JSON.stringify([...next])); guest = [...next]; }
    if (savingUid !== user?.uid) return;
    visited = next; refresh(); $('storage-status').textContent = user ? 'Diario personale salvato nel tuo account.' : 'Diario personale salvato su questo browser.';
  } catch { $('storage-status').textContent = 'Salvataggio non riuscito. Verifica la connessione o consenti il salvataggio del browser e riprova.'; }
  finally { busy = false; $('toggle-visited').disabled = false; }
}
document.querySelectorAll('dialog .close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$('account-open').onclick = () => $('account-dialog').showModal();
$('country-select').onchange = event => openCountry(event.target.value);
$('preview-open').onclick=()=>{if(selected) openCountry(selected.code);};
$('flag-mode').onclick=()=>{const button=$('flag-mode'); const active=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(active));map.classList.toggle('show-flags',active);};
$('toggle-visited').onclick = () => { const next = new Set(visited); next.has(selected.code) ? next.delete(selected.code) : next.add(selected.code); save(next); };
$('show-visited').onclick = () => { const button = $('show-visited'); button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true')); refresh(); };
$('clear-local').onclick = () => $('reset-dialog').showModal();
$('cancel-reset').onclick = () => $('reset-dialog').close();
$('confirm-reset').onclick = () => { $('reset-dialog').close(); save(new Set()); };
window.addEventListener('storage', event => { if (event.key === key && !user) { guest = readGuest(); visited = new Set(guest.filter(code => countries.some(c => c.code === code))); refresh(); } });
const ns = 'http://www.w3.org/2000/svg';
function svg(tag, attrs) { const element = document.createElementNS(ns, tag); Object.entries(attrs).forEach(([k,v]) => element.setAttribute(k, String(v))); return element; }
try {
  const [response, editorial, photography] = await Promise.all([fetch('data/map.json'), fetch('data/country-editorial.json'), fetch('data/country-photos.json')]);
  if (!response.ok) throw Error();
  const data=await response.json();countries=data.countries;
  if(editorial.ok) stories=await editorial.json();
  if(photography.ok) photos=await photography.json();
  if(data.graticule) $('map-graticule').setAttribute('d',data.graticule);
  visited = new Set(guest.filter(code => countries.some(c => c.code === code)));
  [...countries].sort((a,b) => a.name.localeCompare(b.name, 'it')).forEach(c => { const option = document.createElement('option'); option.value = c.code; option.textContent = c.name; $('country-select').append(option); });
  countries.filter(c => c.path).forEach(c => {
    const [[x,y],[right,bottom]] = c.bounds, width = Math.max(1,right-x), height = Math.max(1,bottom-y);
    const pattern = svg('pattern', {id: `flag-${c.code}`, patternUnits: 'userSpaceOnUse', x, y, width, height});
    pattern.append(svg('use', {href:`assets/flags.svg#flag-${c.code}`,width,height})); $('map-defs').append(pattern);
    const path = svg('path', {d:c.path,fill:`url(#flag-${c.code})`,class:'map-country',tabindex:0,role:'button','data-code':c.code,'vector-effect':'non-scaling-stroke'});
    path.style.setProperty('--country-flag',`url(#flag-${c.code})`);
    const title=svg('title',{});title.textContent=c.name;path.append(title);
    path.onclick = event => { if(event.detail===0) openCountry(c.code); };
    path.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openCountry(c.code); } };
    path.onpointerenter = () => { $('tooltip-name').textContent=c.name; $('tooltip-flag').setAttribute('href',`assets/flags.svg#flag-${c.code}`); $('map-tooltip').hidden = false; };
    path.onpointerleave = () => { $('map-tooltip').hidden = true; };
    nodes.set(c.code,path); $('map-layer').append(path);
  });
  refresh(); $('map-loading').hidden = true;
} catch { $('map-loading').textContent = 'La mappa non è disponibile. Ricarica la pagina per riprovare.'; }
try {
  account = await connectAccount({
    user(value) { user = value; $('logout').hidden = !user; $('account-info').textContent = user ? `Account: ${user.displayName || user.email || 'viaggiatore'}` : 'Accedi per ritrovare il tuo diario su più dispositivi.'; if (!user) { visited = new Set(guest); refresh(); } else { visited = new Set(); refresh(); $('storage-status').textContent = 'Caricamento del tuo diario personale…'; } },
    data(values) { visited = new Set((Array.isArray(values) ? values : []).filter(code => countries.some(c => c.code === code))); refresh(); $('storage-status').textContent = 'Diario sincronizzato con il tuo account. Le scelte senza accesso restano separate su questo browser.'; },
    error(message) { $('auth-status').textContent = message; }
  });
  if (account) {
    const canSignIn = ['google', 'apple'].some(provider => account.providers?.[provider]);
    $('remember-account-option').hidden = !canSignIn;
    if (!user) $('account-info').textContent = canSignIn ? 'Accedi per ritrovare il tuo diario su più dispositivi.' : 'Puoi già esplorare la mappa e salvare i paesi visitati su questo browser.';
    $('auth-status').textContent = canSignIn ? 'Scegli come accedere al tuo diario personale.' : 'L’accesso con Google e Apple non è ancora disponibile.';
    for (const provider of ['google','apple']) {
      const button = $(`login-${provider}`); button.disabled = !account.providers?.[provider];
      button.onclick = async () => { button.disabled = true; try { await account.login(provider,$('remember-account').checked); $('account-dialog').close(); } catch { $('auth-status').textContent = 'Accesso non completato. Riprova e verifica che il browser consenta la finestra di accesso.'; } finally { button.disabled = false; } };
    }
    $('logout').onclick = async () => { try { await account.logout(); } catch { $('auth-status').textContent = 'Uscita non riuscita. Riprova.'; } };
  }
} catch { $('auth-status').textContent = 'L’accesso account non è disponibile in questo momento. Puoi continuare a usare il diario su questo browser.'; }
