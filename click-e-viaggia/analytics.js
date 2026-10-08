/* Optional statistics: no Google tag or request is created before consent. */
(() => {
  'use strict';

  const ownScript = document.currentScript;
  const base = new URL('.', ownScript?.src || document.baseURI);
  const pages = new Map([
    ['', 'Click&Viaggia'], ['index.html', 'Click&Viaggia'],
    ['blog.html', 'Il giornale di Click&Viaggia'],
    ['blog-fatima-nazare.html', 'Fátima e Nazaré'],
    ['blog-nosy-be.html', 'Otto mesi a Nosy Be'],
    ['blog-marsa-alam.html', 'Un mese a Marsa Alam'],
    ['chi-siamo.html', 'Il team Click&Viaggia'],
    ['i-miei-viaggi.html', 'I miei viaggi'],
    ['viaggio-fatima.html', 'Viaggio a Fátima'],
    ['viaggio-disney.html', 'Viaggio a Disneyland Paris'],
    ['legal.html', 'Privacy e informazioni legali']
  ]);
  const file = location.pathname.startsWith(base.pathname) ? location.pathname.slice(base.pathname.length) : null;
  // Never initialise on the administrator page or an unknown/private route.
  if (base.origin !== location.origin || !pages.has(file) || window.__cvaAnalyticsLoaded) return;
  window.__cvaAnalyticsLoaded = true;

  const VERSION = 1;
  const LIFETIME = 180 * 24 * 60 * 60 * 1000;
  const key = `cva-statistics-v${VERSION}:${base.pathname}`;
  const trip = file === 'viaggio-fatima.html' ? 'fatima' : file === 'viaggio-disney.html' ? 'disney' : 'team';
  const sections = new Set(['#home', '#viaggi', '#blog', '#contatti']);
  let measurementId = '', preference = null, banner, reopen, status;
  let tag = null, started = false, lastPage = '', tripSent = false, expiryTimer;
  let returnFocus = null, wantBanner = false, observer;

  function validPreference(raw) {
    try {
      const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const now = Date.now();
      return value?.version === VERSION && value.measurementId === measurementId &&
        ['accepted', 'rejected'].includes(value.choice) && Number.isFinite(value.updatedAt) &&
        Number.isFinite(value.expiresAt) && value.updatedAt <= now &&
        value.expiresAt > now && value.expiresAt <= value.updatedAt + LIFETIME ? value : null;
    } catch { return null; }
  }

  function readPreference() {
    try { return validPreference(localStorage.getItem(key)); } catch { return null; }
  }

  function remember(choice) {
    const now = Date.now();
    preference = {version: VERSION, measurementId, choice, updatedAt: now, expiresAt: now + LIFETIME};
    try { localStorage.setItem(key, JSON.stringify(preference)); } catch { /* This page still honours the choice. */ }
    scheduleExpiry();
  }

  function scheduleExpiry() {
    clearTimeout(expiryTimer);
    if (!preference) return;
    expiryTimer = setTimeout(() => {
      if (preference.expiresAt > Date.now()) { scheduleExpiry(); return; }
      preference = null;
      try { localStorage.removeItem(key); } catch { /* Storage may be unavailable. */ }
      const hadTag = started;
      stopStatistics();
      if (hadTag) location.reload();
      else showBanner();
    }, Math.min(Math.max(1, preference.expiresAt - Date.now()), 2147483647));
  }

  function clearAnalyticsCookies() {
    const names = new Set(['_ga', `_ga_${measurementId.slice(2)}`]);
    try {
      for (const item of document.cookie.split(';')) {
        const name = item.trim().split('=')[0];
        if (/^_ga(?:_|$)/.test(name)) names.add(name);
      }
      const paths = new Set(['/']);
      let path = '';
      for (const segment of location.pathname.split('/').filter(Boolean).slice(0, -1)) {
        path += `/${segment}`;
        paths.add(path); paths.add(`${path}/`);
      }
      paths.add(base.pathname); paths.add(base.pathname.replace(/\/$/, '') || '/');
      const domains = new Set(['']);
      const parts = location.hostname.split('.');
      while (parts.length > 1) {
        domains.add(parts.join('.')); domains.add(`.${parts.join('.')}`); parts.shift();
      }
      for (const name of names) for (const cookiePath of paths) for (const domain of domains) {
        document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${cookiePath}${domain ? `; domain=${domain}` : ''}; SameSite=Lax`;
      }
    } catch { /* Browsers may block cookie access. */ }
  }

  function safePage() {
    const url = new URL(file === 'index.html' ? '' : file, base);
    // Only this site's deliberately shared Instagram campaign is retained.
    const incoming = new URL(location.href);
    if (incoming.searchParams.get('utm_source') === 'instagram' &&
        incoming.searchParams.get('utm_medium') === 'social' && incoming.searchParams.get('utm_campaign') === 'bio') {
      url.search = 'utm_source=instagram&utm_medium=social&utm_campaign=bio';
    }
    if ((file === '' || file === 'index.html') && sections.has(location.hash)) url.hash = location.hash;
    return {page_location: url.href, page_path: url.pathname + url.hash, page_title: pages.get(file), page_referrer: ''};
  }

  function sendPage() {
    if (!started || preference?.choice !== 'accepted' || !validPreference(preference)) return;
    const page = safePage();
    if (page.page_location === lastPage) return;
    lastPage = page.page_location;
    window.gtag('set', page);
    window.gtag('event', 'page_view', {...page, send_to: measurementId});
    if (!tripSent && trip !== 'team') {
      tripSent = true;
      window.gtag('event', 'trip_details', {...page, destination: trip, send_to: measurementId});
    }
  }

  function outboundClick(event) {
    if (!started || preference?.choice !== 'accepted' || !validPreference(preference)) return;
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!anchor) return;
    let url;
    try { url = new URL(anchor.href); } catch { return; }
    if (url.protocol !== 'https:' || !['wa.me', 'api.whatsapp.com', 'chat.whatsapp.com'].includes(url.hostname)) return;
    // Never send the phone number, invitation code, link URL or prepared message.
    window.gtag('event', 'whatsapp_contact', {...safePage(), destination: trip, contact_channel: 'whatsapp', send_to: measurementId});
  }

  function startStatistics() {
    if (started || preference?.choice !== 'accepted' || !validPreference(preference)) return;
    started = true;
    window[`ga-disable-${measurementId}`] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    // This is basic consent mode: even the Google library is withheld until acceptance.
    window.gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', {
      analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('set', 'ads_data_redaction', true);
    window.gtag('set', 'url_passthrough', false);
    window.gtag('set', safePage());
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      ...safePage(), send_page_view: false, allow_google_signals: false,
      allow_ad_personalization_signals: false, ignore_referrer: true,
      cookie_domain: location.hostname, cookie_path: base.pathname,
      cookie_expires: LIFETIME / 1000, cookie_update: false,
      cookie_flags: 'SameSite=Lax;Secure'
    });
    tag = document.createElement('script');
    tag.async = true;
    tag.referrerPolicy = 'no-referrer';
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    tag.onerror = () => {
      stopStatistics();
      if (status) status.textContent = 'Statistiche temporaneamente non disponibili. Il sito resta utilizzabile.';
    };
    document.head.append(tag);
    window.addEventListener('hashchange', sendPage);
    document.addEventListener('click', outboundClick, true);
    sendPage();
  }

  function stopStatistics() {
    window[`ga-disable-${measurementId}`] = true;
    window.removeEventListener('hashchange', sendPage);
    document.removeEventListener('click', outboundClick, true);
    if (tag) { tag.onerror = null; tag.remove(); tag = null; }
    if (started) {
      window.gtag = () => {};
      if (Array.isArray(window.dataLayer)) window.dataLayer.length = 0;
    }
    started = false; lastPage = ''; tripSent = false;
    clearAnalyticsCookies();
  }

  function syncBanner() {
    const anotherPanel = document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]:not([hidden])');
    const hidden = !wantBanner || Boolean(anotherPanel);
    if (banner.hidden !== hidden) banner.hidden = hidden;
  }

  function showBanner(focus = false) {
    wantBanner = true;
    status.textContent = preference?.choice === 'accepted'
      ? 'Statistiche attive. Se le rifiuti, la pagina verrà ricaricata per completare la revoca.'
      : preference?.choice === 'rejected'
        ? 'Statistiche disattivate. Puoi mantenere la scelta oppure attivarle.'
        : 'La scelta viene ricordata per 180 giorni e puoi modificarla da “Privacy statistiche”.';
    syncBanner();
    if (focus && !banner.hidden) banner.querySelector('button[data-choice="rejected"]').focus();
  }

  function hideBanner() {
    wantBanner = false;
    banner.hidden = true;
    if (banner.contains(document.activeElement)) (returnFocus?.isConnected ? returnFocus : reopen).focus();
  }

  function choose(choice) {
    const hadTag = started;
    remember(choice);
    hideBanner();
    if (choice === 'accepted') startStatistics();
    else {
      stopStatistics();
      // Removing a script cannot unload already executed Google code. A fresh page can.
      if (hadTag) location.reload();
    }
  }

  function createControls() {
    banner = document.createElement('section');
    banner.className = 'cva-analytics-banner'; banner.hidden = true;
    banner.setAttribute('role', 'region'); banner.setAttribute('aria-labelledby', 'cva-analytics-title');
    banner.innerHTML = `<button type="button" class="cva-analytics-close" data-choice="rejected" aria-label="Rifiuta le statistiche e chiudi">×</button>
      <div class="cva-analytics-copy"><h2 id="cva-analytics-title">Statistiche facoltative</h2>
      <p>Con il tuo consenso, Google Analytics misura le pagine visitate e i clic su WhatsApp. Puoi navigare anche rifiutando. <a href="${new URL('legal.html#statistiche', base).href}">Come usiamo le statistiche</a></p></div>
      <div class="cva-analytics-actions"><button type="button" data-choice="accepted">Accetta statistiche</button><button type="button" data-choice="rejected">Rifiuta statistiche</button></div>
      <p class="cva-analytics-status" role="status"></p>`;
    status = banner.querySelector('.cva-analytics-status');
    for (const button of banner.querySelectorAll('[data-choice]')) button.addEventListener('click', () => choose(button.dataset.choice));
    banner.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); choose('rejected'); }
    });
    document.body.append(banner);
    let footer = document.querySelector('footer');
    if (!footer) {
      footer = document.createElement('footer'); footer.className = 'cva-analytics-footer'; document.body.append(footer);
    }
    reopen = document.createElement('button');
    reopen.type = 'button'; reopen.className = 'cva-analytics-reopen'; reopen.textContent = 'Privacy statistiche';
    reopen.addEventListener('click', () => { returnFocus = reopen; showBanner(true); });
    footer.append(reopen);
    observer = new MutationObserver(syncBanner);
    observer.observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['open', 'aria-modal', 'hidden']});
    window.addEventListener('storage', event => {
      if (event.key !== key && event.key !== null) return;
      const latest = readPreference();
      const hadTag = started;
      preference = latest; scheduleExpiry();
      if (preference?.choice === 'accepted') { startStatistics(); hideBanner(); }
      else {
        stopStatistics();
        if (hadTag) location.reload();
        else if (preference) hideBanner();
        else showBanner();
      }
    });
  }

  async function initialise() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(new URL('data/analytics-config.json', base), {cache: 'no-store', credentials: 'same-origin', signal: controller.signal});
      if (!response.ok) return;
      const config = await response.json();
      if (config?.enabled !== true || typeof config.measurementId !== 'string' || !/^G-[A-Z0-9]{4,32}$/.test(config.measurementId)) return;
      measurementId = config.measurementId;
      createControls();
      preference = readPreference(); scheduleExpiry();
      if (preference?.choice === 'accepted') startStatistics();
      else { stopStatistics(); if (!preference) showBanner(); }
    } catch { /* Offline, missing or invalid configuration never prevents navigation. */ }
    finally { clearTimeout(timeout); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise, {once: true});
  else initialise();
})();
