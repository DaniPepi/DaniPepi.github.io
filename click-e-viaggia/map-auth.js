import {getAccountService} from './account-core.js?v=1';

export async function connectAccount(callbacks) {
  const account = await getAccountService();
  if (!account) return null;
  const dbSDK = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
  const db = dbSDK.getFirestore(account.app);
  let stopDiary = () => {}, ready = false, currentUid = null;
  const stopAccount = account.observe(user => {
    stopDiary(); ready = false; currentUid = user?.uid || null; callbacks.user(user);
    if (!user) return;
    const uid = user.uid;
    stopDiary = dbSDK.onSnapshot(dbSDK.doc(db, 'travelDiaries', uid), snapshot => {
      if (currentUid !== uid) return;
      ready = true; callbacks.data(snapshot.exists() ? snapshot.data().visited : []);
    }, () => {
      if (currentUid !== uid) return;
      ready = false; callbacks.error('Non è possibile caricare il tuo diario in questo momento. Controlla la connessione e riprova.');
    });
  }, () => callbacks.error('Non è possibile verificare il tuo account in questo momento.'));
  const dispose = () => { stopDiary(); stopAccount(); ready = false; currentUid = null; };
  window.addEventListener('pagehide', event => { if (!event.persisted) dispose(); });
  return {
    providers: account.providers,
    login: (provider, remember) => account.login(provider, remember),
    logout: () => account.logout(),
    dispose,
    async save(visited) {
      if (!account.currentUser || !ready || account.currentUser.uid !== currentUid) throw Error('Attendi il caricamento del diario.');
      await dbSDK.setDoc(dbSDK.doc(db, 'travelDiaries', currentUid), {visited, updatedAt: dbSDK.serverTimestamp()});
    }
  };
}
