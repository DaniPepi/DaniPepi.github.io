/* Aggregate Cloudflare Web Analytics: no visitor identifier or consent banner. */
(() => {
  'use strict';
  const base = new URL('.', document.currentScript?.src || document.baseURI);
  const pages = new Set(['', 'index.html', 'blog.html', 'blog-fatima-nazare.html', 'blog-nosy-be.html', 'blog-marsa-alam.html', 'chi-siamo.html', 'i-miei-viaggi.html', 'viaggio-fatima.html', 'viaggio-disney.html', 'legal.html', "blog-curiosita-giappone-ise.html", "blog-curiosita-turchia-gobekli-tepe.html", "blog-curiosita-islanda-thingvellir.html", "blog-curiosita-oman-aflaj.html", "blog-curiosita-peru-qeswachaka.html", "blog-curiosita-messico-chinampas.html", "blog-curiosita-etiopia-lalibela.html", "blog-curiosita-norvegia-urnes.html", "blog-curiosita-india-rani-ki-vav.html", "blog-curiosita-georgia-qvevri.html","blog-matera-acqua.html","blog-corea-kimjang.html","blog-tenerife-teide.html","blog-scozia-forth-bridge.html","blog-finlandia-sauna.html"]);
  const page = location.pathname.startsWith(base.pathname) ? location.pathname.slice(base.pathname.length) : null;
  if (base.origin !== location.origin || !pages.has(page) || window.__cvaAggregateAnalytics) return;
  window.__cvaAggregateAnalytics = true;

  // Remove only the previous statistics preference/cookies; account and diary stay intact.
  window['ga-disable-G-6LYQJCJEZY'] = true;
  try { localStorage.removeItem('cva-statistics-v1:' + base.pathname); } catch {}
  try {
    const paths = new Set(['/', base.pathname, base.pathname.replace(/\/$/, '')]);
    const domains = ['', location.hostname, '.' + location.hostname];
    for (const item of document.cookie.split(';')) {
      const name = item.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const cookiePath of paths) for (const domain of domains) {
        document.cookie = name + '=; Max-Age=0; path=' + cookiePath + (domain ? '; domain=' + domain : '') + '; SameSite=Lax; Secure';
      }
    }
  } catch {}

  async function initialize() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(new URL('data/analytics-config.json', base), {cache:'no-store', signal:controller.signal});
      if (!response.ok) return;
      const config = await response.json();
      if (config.enabled !== true || config.provider !== 'cloudflare' || typeof config.token !== 'string' || !/^[a-f0-9]{32}$/.test(config.token) || location.hostname !== config.hostname) return;
      if (document.querySelector('script[data-cf-beacon]')) return;
      const beacon = document.createElement('script');
      beacon.type = 'module';
      beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      beacon.dataset.cfBeacon = JSON.stringify({token:config.token, spa:false});
      document.body.append(beacon);
    } catch { /* Missing configuration, offline or blocked analytics never affects the site. */ }
    finally { clearTimeout(timeout); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once:true});
  else initialize();
})();
