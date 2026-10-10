import {getAccountService, SDK_BASE} from './account-core.js?v=2';

export async function connectAccount(callbacks) {
  const account = await getAccountService();
  if (!account) return null;
  const dbSDK = await import(SDK_BASE + 'firebase-firestore.js');
  const db = dbSDK.getFirestore(account.app);
  let stopDiary = () => {}, ready = false, currentUid = null, generation = 0;
  function setReady(value) { ready = value; callbacks.ready?.(value); }
  const stopAccount = account.observe(user => {
    const request = ++generation;
    stopDiary(); stopDiary = () => {}; setReady(false);
    currentUid = user?.uid || null; callbacks.user(user);
    if (!user) return;
    const uid = user.uid;
    stopDiary = dbSDK.onSnapshot(dbSDK.doc(db, 'travelDiaries', uid), snapshot => {
      if (currentUid !== uid || generation !== request) return;
      callbacks.data(snapshot.exists() ? snapshot.data().visited : []); setReady(true);
    }, () => {
      if (currentUid !== uid || generation !== request) return;
      setReady(false); callbacks.error('Non è possibile caricare il tuo diario in questo momento. Controlla la connessione e riprova.');
    });
  }, () => {
    ++generation; stopDiary(); stopDiary = () => {}; currentUid = null; setReady(false);
    callbacks.error('Non è possibile verificare il tuo account in questo momento.');
  });
  const dispose = () => { ++generation; stopDiary(); stopAccount(); ready = false; currentUid = null; };
  window.addEventListener('pagehide', event => { if (!event.persisted) dispose(); });
  return {
    providers: account.providers,
    get ready() { return ready; },
    login: (provider, remember) => account.login(provider, remember),
    logout: () => account.logout(),
    dispose,
    async save(visited) {
      if (!account.currentUser || !ready || account.currentUser.uid !== currentUid) throw Error('Attendi il caricamento del diario.');
      const uid = currentUid;
      await dbSDK.setDoc(dbSDK.doc(db, 'travelDiaries', uid), {visited, updatedAt: dbSDK.serverTimestamp()});
    }
  };
}
