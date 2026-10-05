export async function connectAccount(callbacks) {
  const config = await fetch('data/auth-config.json', {cache: 'no-store'}).then(r => { if (!r.ok) throw Error(); return r.json(); });
  if (!config.enabled) return null;
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) throw Error('L’accesso account non è disponibile in questo momento.');
  const base = 'https://www.gstatic.com/firebasejs/10.14.1/';
  const [appSDK, authSDK, dbSDK] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]);
  const app = appSDK.initializeApp({apiKey: config.apiKey, authDomain: config.authDomain, projectId: config.projectId, appId: config.appId});
  const auth = authSDK.getAuth(app), db = dbSDK.getFirestore(app);
  let unsubscribe = () => {}, ready = false;
  authSDK.onAuthStateChanged(auth, user => {
    unsubscribe(); ready = false; callbacks.user(user);
    if (!user) return;
    unsubscribe = dbSDK.onSnapshot(dbSDK.doc(db, 'travelDiaries', user.uid), snapshot => {
      ready = true; callbacks.data(snapshot.exists() ? snapshot.data().visited : []);
    }, () => callbacks.error('Non è possibile caricare il tuo diario in questo momento. Controlla la connessione e riprova.'));
  });
  return {
    providers: config.providers,
    async login(provider, remember) {
      await authSDK.setPersistence(auth, remember ? authSDK.browserLocalPersistence : authSDK.browserSessionPersistence);
      await authSDK.signInWithPopup(auth, provider === 'google' ? new authSDK.GoogleAuthProvider() : new authSDK.OAuthProvider('apple.com'));
    },
    logout: () => authSDK.signOut(auth),
    async save(visited) {
      if (!auth.currentUser || !ready) throw Error('Attendi il caricamento del diario.');
      await dbSDK.setDoc(dbSDK.doc(db, 'travelDiaries', auth.currentUser.uid), {visited, updatedAt: dbSDK.serverTimestamp()});
    }
  };
}
