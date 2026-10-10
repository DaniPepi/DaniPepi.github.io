# Account personali con Firebase

Configurazione del 10 ottobre 2026: progetto `click-e-viaggia`, nome “Click e Viaggia”, app “CLICK&VIAGGIA web”, piano Spark. Google è abilitato, dominio `danipepi.github.io` autorizzato e Firestore `(default)` creato a Milano (`europe-west8`). Le regole sono compilate e pubblicate nella console. Apple rimane disabilitato.

Il sito usa Firebase Authentication per l'accesso facoltativo con Google e Firestore per il diario personale. Il funzionamento effettivo dipende dalla configurazione pubblica in `data/auth-config.json` e dai servizi attivati nella console. Apple rimane disabilitato finché non sono disponibili account Apple Developer, Service ID e configurazione del provider; non viene simulato un accesso.

Il pannello account si chiude con X, Esc o “Continua senza account”; “Accedi” nel menu lo riapre. La chiusura è ricordata nella sessione della scheda. Nessuna finestra del provider si apre automaticamente. Con configurazione incompleta i pulsanti restano disabilitati e non vengono caricati gli SDK esterni di Firebase.

1. Nelle impostazioni del progetto Firebase registra un'app web e copia `apiKey`, `authDomain`, `projectId` e `appId` in `data/auth-config.json`. Questi sono dati pubblici dell'app, non password o chiavi di servizio.
2. In Authentication abilita Google e inserisci `danipepi.github.io` tra i domini autorizzati. Il dominio è senza percorso `/click-e-viaggia/`. Quando si aggiunge un dominio proprio, autorizzalo prima di usarlo per l'accesso.
3. Crea il database Firestore e pubblica `firestore.rules`. Non usare regole aperte o in modalità test.
4. Imposta `enabled: true`, `providers.google: true` e `providers.apple: false` quando Google è realmente configurato. Abilita Apple solo dopo aver completato la [configurazione ufficiale](https://firebase.google.com/docs/auth/web/apple). Le chiavi private Apple restano nel servizio, mai nel repository.

Il login usa il popup Firebase, aperto dal clic dell'utente. Questa modalità evita i problemi del redirect causati dal blocco dello storage di terze parti su hosting esterni. Un passaggio futuro al redirect richiede una delle configurazioni descritte nelle [indicazioni Firebase](https://firebase.google.com/docs/auth/web/redirect-best-practices); non basta sostituire il metodo JavaScript.

“Resta connesso” è deselezionato sia nel pannello pubblico sia nella mappa. Senza selezione, Firebase mantiene l'accesso nella sessione della singola scheda: una scheda nuova può richiedere un nuovo accesso. Con selezione, la sessione locale può restare disponibile dopo la chiusura del browser e viene condivisa fra le schede dello stesso dominio fino all'uscita. I collegamenti usati durante il percorso account devono mantenere la scheda corrente. [Persistenza Firebase](https://firebase.google.com/docs/auth/web/auth-state-persistence)

L'accesso non conserva le password Google o Apple nel codice del sito. `account-core.js?v=2` inizializza una sola app Firebase; `SDK_BASE` centralizza la versione degli SDK usati anche da `map-auth.js`. Il sito rimane leggibile senza account.

Il diario guest usa `localStorage["click-viaggia-visited-v1"]`. Quello dell'account usa esclusivamente `travelDiaries/{uid}` in Firestore. I due diari rimangono separati: non vengono importati o uniti automaticamente. Al cambio account, la mappa svuota la selezione precedente e attende il nuovo snapshot; durante caricamento ed errore le modifiche sono disabilitate. Alla disconnessione viene riletto il diario guest corrente.

Le regole consentono lettura, cancellazione e scrittura solo al proprietario autenticato. Le scritture richiedono esattamente `visited` e `updatedAt`: una lista di massimo 250 codici distinti consentiti da `data/map.json` e un timestamp server. Se la lista della mappa cambia, aggiornare anche `allowedCountryCodes()` nelle regole. `hasOnly()` controlla i valori ammessi e il confronto con `toSet().size()` respinge i duplicati. [API List](https://firebase.google.com/docs/reference/rules/rules.List), [timestamp della richiesta](https://firebase.google.com/docs/reference/rules/rules.firestore.Request#time)

`work/verify-map-auth-bridge.cjs` verifica caricamento, callback obsolete, separazione degli UID, errori e smaltimento dei listener con SDK controllati. Sono prove del codice client, non una verifica del login reale o dell'enforcement delle regole. Per il progetto reale verificare popup, annullamento, uscita, entrambe le persistenze, sincronizzazione su due dispositivi e isolamento fra due account. Le regole vanno compilate e provate nella console o nell'emulatore Firestore, anche con valori non ammessi, duplicati, timestamp client e campi aggiuntivi.

L'informativa deve descrivere i provider effettivamente attivati, il titolare, i recapiti, le finalità, la conservazione e le modalità di cancellazione di account e diario. Le statistiche Analytics mantengono la propria configurazione separata.
