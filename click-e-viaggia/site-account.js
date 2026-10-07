import {getAccountService, accountErrorMessage} from './account-core.js?v=1';

const dismissedKey = 'click-viaggia-account-dismissed-v1';
const unavailable = 'Google e Apple saranno disponibili dopo l’attivazione degli accessi. Il diario resta salvato su questo browser.';
function dismissed() { try { return sessionStorage.getItem(dismissedKey) === '1'; } catch { return false; } }
function rememberDismissal() { try { sessionStorage.setItem(dismissedKey, '1'); } catch { /* Browsing remains available without storage. */ } }

function initializeAccountPanel() {
  if (document.querySelector('.cva-account-panel') || document.body.classList.contains('map-page')) return;
  const panel = document.createElement('dialog');
  panel.className = 'cva-account-panel'; panel.id = 'cva-account-panel';
  panel.setAttribute('aria-labelledby', 'cva-account-title'); panel.setAttribute('aria-describedby', 'cva-account-intro');
  panel.innerHTML = `
    <button type="button" class="cva-account-close" aria-label="Chiudi il pannello account">×</button>
    <p class="cva-account-eyebrow">IL TUO MONDO, CON CLICK&amp;VIAGGIA</p>
    <h2 id="cva-account-title" class="cva-account-title">Un account, il tuo diario.</h2>
    <p id="cva-account-intro" class="cva-account-intro">Accedere è una scelta: puoi visitare il sito e contattarci anche senza registrarti.</p>
    <ul class="cva-account-benefits">
      <li>Raccogli i paesi visitati nel tuo diario personale.</li>
      <li class="cva-account-sync">Con gli accessi attivi, ritrovi il diario su più dispositivi.</li>
      <li>Usa Google o Apple, senza creare una nuova password.</li>
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
    <p class="cva-account-privacy">Non chiediamo né conserviamo le password Google o Apple. <a href="legal.html">Privacy</a></p>`;
  document.body.append(panel);
  const find = selector => panel.querySelector(selector);
  const close = find('.cva-account-close'), continueButton = find('.cva-account-continue'), status = find('.cva-account-status');
  const providerButtons = [...panel.querySelectorAll('[data-provider]')], remember = find('.cva-account-remember'), logout = find('.cva-account-logout');
  const navigation = document.querySelector('#navigation, .team-nav');
  let account = null, currentUser = null, busy = false, previousFocus = null;
  const opener = document.createElement('button');
  opener.type = 'button'; opener.className = 'cva-account-nav'; opener.textContent = 'Accedi';
  opener.setAttribute('aria-haspopup', 'dialog'); opener.setAttribute('aria-controls', panel.id);
  if (navigation) navigation.append(opener);
  function open(manual = false) {
    if (panel.open) return;
    previousFocus = manual ? document.activeElement : null;
    const active = document.activeElement;
    panel.show();
    if (manual) close.focus({preventScroll: true});
    else if (active instanceof HTMLElement && active !== document.body && active !== document.documentElement) active.focus({preventScroll: true});
    else if (panel.contains(document.activeElement)) document.activeElement.blur();
  }
  function dismiss() {
    rememberDismissal(); const restore = panel.contains(document.activeElement); panel.close();
    if (restore && previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({preventScroll: true});
  }
  function refresh() {
    opener.textContent = currentUser ? 'Il mio account' : 'Accedi';
    find('.cva-account-title').textContent = currentUser ? 'Il tuo diario ti aspetta.' : 'Un account, il tuo diario.';
    find('.cva-account-intro').textContent = currentUser
      ? `Hai effettuato l’accesso${currentUser.displayName ? ` come ${currentUser.displayName}` : ''}. Le scelte salvate senza accesso restano separate su questo browser.`
      : 'Accedere è una scelta: puoi visitare il sito e contattarci anche senza registrarti.';
    find('.cva-account-benefits').hidden = Boolean(currentUser);
    find('.cva-account-providers').hidden = Boolean(currentUser);
    find('.cva-account-signed-in').hidden = !currentUser;
    remember.hidden = !account || Boolean(currentUser);
    continueButton.textContent = currentUser ? 'Continua a esplorare' : 'Continua senza account';
    find('.cva-account-sync').textContent = account ? 'Ritrova il tuo diario sui tuoi dispositivi.' : 'Con gli accessi attivi, ritrovi il diario su più dispositivi.';
    providerButtons.forEach(button => { button.disabled = busy || !account?.providers[button.dataset.provider]; });
    logout.disabled = busy; panel.setAttribute('aria-busy', String(busy));
  }
  opener.addEventListener('click', () => open(true));
  close.addEventListener('click', dismiss); continueButton.addEventListener('click', dismiss);
  panel.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.open && !document.querySelector('dialog:modal')) { event.preventDefault(); dismiss(); }
  });
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
      status.textContent = account ? (currentUser ? 'Il tuo account è connesso.' : 'Scegli come accedere. La registrazione resta facoltativa.') : unavailable;
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
