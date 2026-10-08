import {getAccountService, accountErrorMessage} from './account-core.js?v=1';

const dismissedKey = 'click-viaggia-account-dismissed-v1';
const unavailable = 'Accessi in preparazione. Per ora il diario resta salvato su questo browser.';
function dismissed() { try { return sessionStorage.getItem(dismissedKey) === '1'; } catch { return false; } }
function rememberDismissal() { try { sessionStorage.setItem(dismissedKey, '1'); } catch { /* Browsing remains available without storage. */ } }

function initializeAccountPanel() {
  if (document.querySelector('.cva-account-panel') || document.body.classList.contains('map-page')) return;
  const panel = document.createElement('dialog');
  panel.className = 'cva-account-panel'; panel.id = 'cva-account-panel';
  panel.setAttribute('aria-labelledby', 'cva-account-title'); panel.setAttribute('aria-describedby', 'cva-account-intro');
  panel.innerHTML = `
    <button type="button" class="cva-account-close" aria-label="Chiudi il pannello account" autofocus>×</button>
    <p class="cva-account-eyebrow">IL TUO ACCOUNT</p>
    <h2 id="cva-account-title" class="cva-account-title">Accedi a Click&amp;Viaggia</h2>
    <p id="cva-account-intro" class="cva-account-intro">Il tuo diario, sempre con te. L’accesso è facoltativo.</p>
    <ul class="cva-account-benefits">
      <li>Raccogli i paesi che hai visitato.</li>
      <li class="cva-account-sync">Con gli accessi attivi, sincronizzi il diario.</li>
    </ul>
    <p class="cva-account-status" role="status" aria-live="polite">Verifica della disponibilità degli accessi…</p>
    <label class="cva-account-remember" hidden><input type="checkbox" name="cva-account-remember"> Resta connesso su questo dispositivo</label>
    <div class="cva-account-providers">
      <button type="button" class="cva-account-provider" data-provider="google" disabled>Continua con Google</button>
      <button type="button" class="cva-account-provider cva-account-provider-apple" data-provider="apple" disabled>Continua con Apple</button>
    </div>
    <div class="cva-account-signed-in" hidden>
      <a class="cva-account-diary" href="i-miei-viaggi.html">Apri il mio diario ↗</a>
      <button type="button" class="cva-account-logout">Esci dall’account</button>
    </div>
    <button type="button" class="cva-account-continue">Continua senza account</button>
    <p class="cva-account-privacy">Le password restano a Google e Apple. <a href="legal.html">Privacy</a></p>`;
  document.body.append(panel);
  const find = selector => panel.querySelector(selector);
  const close = find('.cva-account-close'), continueButton = find('.cva-account-continue'), status = find('.cva-account-status');
  const providerButtons = [...panel.querySelectorAll('[data-provider]')], remember = find('.cva-account-remember'), logout = find('.cva-account-logout');
  const navigation = document.querySelector('#navigation, .team-nav');
  let account = null, currentUser = null, busy = false, previousFocus = null, backdropPressed = false;
  const opener = document.createElement('button');
  opener.type = 'button'; opener.className = 'cva-account-nav'; opener.textContent = 'Accedi';
  opener.setAttribute('aria-haspopup', 'dialog'); opener.setAttribute('aria-controls', panel.id);
  if (navigation) navigation.append(opener);
  function open(manual = false) {
    if (panel.open || document.querySelector('dialog:modal')) return;
    previousFocus = document.activeElement;
    if (manual) {
      navigation?.classList.remove('open');
      document.querySelector('.menu-toggle')?.setAttribute('aria-expanded', 'false');
    }
    panel.showModal();
    document.body.classList.add('cva-account-open');
    close.focus({preventScroll: true});
  }
  function dismiss() {
    rememberDismissal(); panel.close();
  }
  function refresh() {
    opener.textContent = currentUser ? 'Il mio account' : 'Accedi';
    find('.cva-account-title').textContent = currentUser ? 'Bentornato nel tuo diario' : 'Accedi a Click&Viaggia';
    find('.cva-account-intro').textContent = currentUser
      ? `Accesso effettuato${currentUser.displayName ? ` come ${currentUser.displayName}` : ''}. Il diario locale resta separato.`
      : 'Il tuo diario, sempre con te. L’accesso è facoltativo.';
    find('.cva-account-benefits').hidden = Boolean(currentUser);
    find('.cva-account-providers').hidden = Boolean(currentUser);
    find('.cva-account-signed-in').hidden = !currentUser;
    remember.hidden = !account || Boolean(currentUser);
    continueButton.textContent = currentUser ? 'Continua a esplorare' : 'Continua senza account';
    find('.cva-account-sync').textContent = account ? 'Ritrova il diario sui tuoi dispositivi.' : 'Con gli accessi attivi, sincronizzi il diario.';
    providerButtons.forEach(button => { button.disabled = busy || !account?.providers[button.dataset.provider]; });
    logout.disabled = busy; panel.setAttribute('aria-busy', String(busy));
  }
  opener.addEventListener('click', () => open(true));
  close.addEventListener('click', dismiss); continueButton.addEventListener('click', dismiss);
  panel.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  panel.addEventListener('close', () => {
    document.body.classList.remove('cva-account-open');
    backdropPressed = false;
    const menu = document.querySelector('.menu-toggle');
    const focusTarget = previousFocus instanceof HTMLElement && previousFocus.isConnected && previousFocus.getClientRects().length
      ? previousFocus : menu?.getClientRects().length ? menu : opener.getClientRects().length ? opener : null;
    focusTarget?.focus({preventScroll: true});
  });
  function outsidePanel(event) {
    const bounds = panel.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  }
  panel.addEventListener('pointerdown', event => { backdropPressed = event.target === panel && outsidePanel(event); });
  panel.addEventListener('pointerup', event => {
    if (backdropPressed && event.target === panel && outsidePanel(event)) dismiss();
    backdropPressed = false;
  });
  panel.addEventListener('pointercancel', () => { backdropPressed = false; });
  providerButtons.forEach(button => button.addEventListener('click', async () => {
    if (busy || !account?.providers[button.dataset.provider]) return;
    busy = true; status.textContent = 'Completa l’accesso nella finestra di Google o Apple.'; refresh();
    try {
      await account.login(button.dataset.provider, find('input').checked);
      status.textContent = 'Accesso effettuato. Puoi aprire il tuo diario personale.'; rememberDismissal();
    } catch (error) { status.textContent = accountErrorMessage(error); }
    finally { busy = false; refresh(); }
  }));
  logout.addEventListener('click', async () => {
    if (busy || !account) return;
    busy = true; refresh();
    try { await account.logout(); status.textContent = 'Hai effettuato l’uscita. Puoi continuare a esplorare senza account.'; }
    catch { status.textContent = 'Non è stato possibile uscire dall’account. Verifica la connessione e riprova.'; }
    finally { busy = false; refresh(); }
  });
  (async () => {
    try {
      account = await getAccountService(); currentUser = account?.currentUser || null;
      status.textContent = account ? (currentUser ? 'Il tuo account è connesso.' : 'Scegli Google o Apple per continuare.') : unavailable;
      if (account) {
        const unsubscribe = account.observe(user => { currentUser = user; refresh(); }, () => { status.textContent = 'Non è possibile verificare l’account ora. Puoi continuare senza accedere.'; });
        window.addEventListener('pagehide', event => { if (!event.persisted) unsubscribe(); });
      }
    } catch { status.textContent = 'L’accesso non è disponibile in questo momento. Puoi esplorare il sito e usare il diario su questo browser.'; }
    refresh(); if (!currentUser && !dismissed()) open();
  })();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeAccountPanel, {once: true});
else initializeAccountPanel();
