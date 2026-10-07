const SDK_BASE = 'https://www.gstatic.com/firebasejs/10.14.1/';
let configurationPromise;
let accountPromise;

export function loadAccountConfig() {
  if (!configurationPromise) configurationPromise = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(new URL('data/auth-config.json', import.meta.url), {cache: 'no-store', signal: controller.signal});
      if (!response.ok) throw Error('Configurazione account non disponibile.');
      const source = await response.json();
      const fields = ['apiKey', 'authDomain', 'projectId', 'appId'];
      const firebase = Object.fromEntries(fields.map(key => [key, typeof source[key] === 'string' ? source[key].trim() : '']));
      const providers = {google: source.providers?.google === true, apple: source.providers?.apple === true};
      const enabled = source.enabled === true && fields.every(key => firebase[key]) && Object.values(providers).some(Boolean);
      return {enabled, firebase, providers: enabled ? providers : {google: false, apple: false}};
    } finally { clearTimeout(timeout); }
  })();
  return configurationPromise;
}

export function accountErrorMessage(error) {
  const messages = {
    'auth/popup-closed-by-user': 'Hai chiuso la finestra di accesso. Puoi riprovare oppure continuare senza account.',
    'auth/cancelled-popup-request': 'È già aperta una finestra di accesso. Completa quella richiesta oppure riprova.',
    'auth/popup-blocked': 'Il browser ha bloccato la finestra di accesso. Consenti i popup per questo sito e riprova.',
    'auth/network-request-failed': 'La connessione non è disponibile. Controlla la rete e riprova.',
    'auth/operation-not-allowed': 'Questo metodo di accesso non è ancora attivo. Puoi continuare senza account.',
    'auth/unauthorized-domain': 'L’accesso non è ancora attivo su questo indirizzo. Puoi continuare senza account.',
    'auth/account-exists-with-different-credential': 'Hai già un account con un altro metodo di accesso. Usa il metodo scelto in precedenza.',
    'auth/web-storage-unsupported': 'Il browser non consente il salvataggio della sessione. Verifica le impostazioni del browser.',
    'auth/too-many-requests': 'Ci sono stati troppi tentativi. Attendi qualche minuto e riprova.'
  };
  return messages[error?.code] || 'Accesso non completato. Riprova oppure continua a esplorare senza account.';
}

export function getAccountService() {
  if (!accountPromise) accountPromise = (async () => {
    const config = await loadAccountConfig();
    if (!config.enabled) return null;
    const [appSDK, authSDK] = await Promise.all([import(SDK_BASE + 'firebase-app.js'), import(SDK_BASE + 'firebase-auth.js')]);
    const existing = appSDK.getApps().find(app => app.name === '[DEFAULT]');
    if (existing && existing.options.projectId !== config.firebase.projectId) throw Error('Il progetto account non corrisponde alla configurazione del sito.');
    const app = existing ? appSDK.getApp() : appSDK.initializeApp(config.firebase);
    const auth = authSDK.getAuth(app);
    await new Promise((resolve, reject) => {
      let stop = () => {};
      stop = authSDK.onAuthStateChanged(auth, () => { queueMicrotask(() => stop()); resolve(); }, error => { queueMicrotask(() => stop()); reject(error); });
    });
    return {
      app, providers: config.providers,
      get currentUser() { return auth.currentUser; },
      observe(callback, errorCallback) { return authSDK.onAuthStateChanged(auth, callback, errorCallback); },
      async login(provider, remember = false) {
        if (!['google', 'apple'].includes(provider) || !config.providers[provider]) throw Object.assign(Error('Metodo di accesso non disponibile.'), {code: 'auth/operation-not-allowed'});
        await authSDK.setPersistence(auth, remember ? authSDK.browserLocalPersistence : authSDK.browserSessionPersistence);
        const identity = provider === 'google' ? new authSDK.GoogleAuthProvider() : new authSDK.OAuthProvider('apple.com');
        if (provider === 'apple') { identity.addScope('email'); identity.addScope('name'); identity.setCustomParameters({locale: 'it'}); }
        return authSDK.signInWithPopup(auth, identity);
      },
      logout() { return authSDK.signOut(auth); }
    };
  })();
  return accountPromise;
}
