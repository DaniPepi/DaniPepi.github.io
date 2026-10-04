import {connectAccount} from './map-auth.js';
const $ = id => document.getElementById(id);
const key = 'click-viaggia-visited-v1';
let countries = [], visited = new Set(), guest = [], selected, account, user = null, busy = false;
const nodes = new Map();
const map = $('world-map');
let view = {x:0,y:0,w:1200,h:620};
function updateView() {
  view.x=Math.max(0,Math.min(1200-view.w,view.x)); view.y=Math.max(0,Math.min(620-view.h,view.y));
  map.setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`); $('zoom-level').textContent = `${Math.round(1200 / view.w * 100)}%`;
}
function zoom(factor) {
  const width = Math.max(150,Math.min(1200,view.w * factor)), height = width * 620 / 1200;
  view.x += (view.w-width)/2; view.y += (view.h-height)/2; view.w=width;view.h=height; updateView();
}
$('zoom-in').onclick = () => zoom(.7);
$('zoom-out').onclick = () => zoom(1/.7);
$('zoom-reset').onclick = () => {view={x:0,y:0,w:1200,h:620}; updateView();};
let drag = null, moved = false;
map.addEventListener('pointerdown',event => {
  if (event.button !== 0) return;
  const matrix=map.getScreenCTM();
  drag={x:event.clientX,y:event.clientY,startX:view.x,startY:view.y,id:event.pointerId,scaleX:matrix.a,scaleY:matrix.d}; moved=false;
  map.setPointerCapture(event.pointerId);
});
map.addEventListener('pointermove',event => {
  if (!drag || event.pointerId !== drag.id) return;
  if (Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>6) moved=true;
  if (!moved) return;
  view.x=drag.startX-(event.clientX-drag.x)/drag.scaleX;
  view.y=drag.startY-(event.clientY-drag.y)/drag.scaleY; updateView();
});
map.addEventListener('pointerup',event => {
  if (!drag || event.pointerId !== drag.id) return;
  map.releasePointerCapture(event.pointerId); drag=null;
  if (!moved) { const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-code]'); if(target) openCountry(target.dataset.code); }
});
map.addEventListener('pointercancel',()=>{drag=null;});
map.addEventListener('keydown',event=>{
  if (event.target !== map) return;
  const offsets={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  if(offsets[event.key]) {event.preventDefault();view.x+=offsets[event.key][0]*view.w*.1;view.y+=offsets[event.key][1]*view.h*.1;updateView();}
  if(event.key==='+'||event.key==='=') zoom(.7);
  if(event.key==='-') zoom(1/.7);
});
function readGuest() { try { const data = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(data) ? data.filter(x => typeof x === 'string') : []; } catch { return []; } }
guest = readGuest(); visited = new Set(guest);
function refresh() {
  const only = $('show-visited').getAttribute('aria-pressed') === 'true';
  nodes.forEach((node, code) => { node.classList.toggle('visited', visited.has(code)); node.classList.toggle('dimmed', only && !visited.has(code)); node.setAttribute('aria-label', `${countries.find(c => c.code === code).name}, ${visited.has(code) ? 'visitato' : 'da scoprire'}`); });
  $('visited-count').textContent = visited.size;
  if (selected) { $('toggle-visited').textContent = visited.has(selected.code) ? 'Rimuovi dai visitati' : 'Segna come visitato'; $('country-state').textContent = visited.has(selected.code) ? 'Questo paese è nel tuo diario.' : 'Un nuovo ricordo da aggiungere.'; }
}
function openCountry(code) {
  selected = countries.find(c => c.code === code); if (!selected) return;
  $('country-name').textContent = selected.name;
  $('country-region').textContent = selected.subregion || selected.region;
  $('country-description').textContent = selected.description;
  $('country-capital').textContent = selected.capital ? `Capitale: ${selected.capital}` : '';
  $('country-flag-use').setAttribute('href',`assets/flags.svg#flag-${selected.code}`);
  $('preview-flag-use').setAttribute('href',`assets/flags.svg#flag-${selected.code}`);
  $('preview-name').textContent=selected.name;
  $('preview-description').textContent=selected.description;
  $('preview-region').textContent=selected.region;
  $('preview-flag').removeAttribute('hidden'); $('preview-open').hidden=false;
  $('country-select').value=selected.code;
  nodes.forEach((node,code)=>node.classList.toggle('selected',code===selected.code));
  refresh(); if (!$('country-dialog').open) $('country-dialog').showModal();
}
async function save(next) {
  if (busy) return; busy = true; $('toggle-visited').disabled = true;
  const savingUid = user?.uid;
  try {
    if (user) { if (!account) throw Error(); await account.save([...next]); }
    else { localStorage.setItem(key, JSON.stringify([...next])); guest = [...next]; }
    if (savingUid !== user?.uid) return;
    visited = next; refresh(); $('storage-status').textContent = user ? 'Diario personale salvato nel tuo account.' : 'Diario personale salvato su questo browser. Accedi per sincronizzarlo quando l’accesso sarà attivo.';
  } catch { $('storage-status').textContent = 'Salvataggio non riuscito. Verifica la connessione o consenti il salvataggio del browser e riprova.'; }
  finally { busy = false; $('toggle-visited').disabled = false; }
}
document.querySelectorAll('dialog .close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$('account-open').onclick = () => $('account-dialog').showModal();
$('country-select').onchange = event => openCountry(event.target.value);
$('preview-open').onclick=()=>{if(selected) openCountry(selected.code);};
$('toggle-visited').onclick = () => { const next = new Set(visited); next.has(selected.code) ? next.delete(selected.code) : next.add(selected.code); save(next); };
$('show-visited').onclick = () => { const button = $('show-visited'); button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true')); refresh(); };
$('clear-local').onclick = () => $('reset-dialog').showModal();
$('cancel-reset').onclick = () => $('reset-dialog').close();
$('confirm-reset').onclick = () => { $('reset-dialog').close(); save(new Set()); };
window.addEventListener('storage', event => { if (event.key === key && !user) { guest = readGuest(); visited = new Set(guest.filter(code => countries.some(c => c.code === code))); refresh(); } });
const ns = 'http://www.w3.org/2000/svg';
function svg(tag, attrs) { const element = document.createElementNS(ns, tag); Object.entries(attrs).forEach(([k,v]) => element.setAttribute(k, String(v))); return element; }
try {
  const response = await fetch('data/map.json'); if (!response.ok) throw Error();
  countries = (await response.json()).countries;
  visited = new Set(guest.filter(code => countries.some(c => c.code === code)));
  [...countries].sort((a,b) => a.name.localeCompare(b.name, 'it')).forEach(c => { const option = document.createElement('option'); option.value = c.code; option.textContent = c.name; $('country-select').append(option); });
  countries.filter(c => c.path).forEach(c => {
    const [[x,y],[right,bottom]] = c.bounds, width = Math.max(1,right-x), height = Math.max(1,bottom-y);
    const pattern = svg('pattern', {id: `flag-${c.code}`, patternUnits: 'userSpaceOnUse', x, y, width, height});
    pattern.append(svg('use', {href:`assets/flags.svg#flag-${c.code}`,width,height})); $('map-defs').append(pattern);
    const path = svg('path', {d:c.path,fill:`url(#flag-${c.code})`,class:'map-country',tabindex:0,role:'button','data-code':c.code,'vector-effect':'non-scaling-stroke'});
    const title=svg('title',{});title.textContent=c.name;path.append(title);
    path.onclick = event => { if(event.detail===0) openCountry(c.code); };
    path.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openCountry(c.code); } };
    path.onpointerenter = () => { $('map-tooltip').textContent = c.name; $('map-tooltip').hidden = false; };
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
    $('auth-status').textContent = 'Scegli come accedere al tuo diario personale.';
    for (const provider of ['google','apple']) {
      const button = $(`login-${provider}`); button.disabled = !account.providers?.[provider];
      button.onclick = async () => { button.disabled = true; try { await account.login(provider,$('remember-account').checked); $('account-dialog').close(); } catch { $('auth-status').textContent = 'Accesso non completato. Riprova e verifica che il browser consenta la finestra di accesso.'; } finally { button.disabled = false; } };
    }
    $('logout').onclick = async () => { try { await account.logout(); } catch { $('auth-status').textContent = 'Uscita non riuscita. Riprova.'; } };
  }
} catch { $('auth-status').textContent = 'Accesso account non disponibile. La mappa resta utilizzabile su questo browser.'; }

