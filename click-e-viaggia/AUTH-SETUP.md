# Attivazione account personali

Il login è predisposto ma disattivato finché non viene configurato il progetto reale.

1. Firebase → Impostazioni progetto → Le tue app: registra un'app web e copia la configurazione pubblica in `data/auth-config.json`.
2. Authentication → Metodo di accesso: abilita Google e aggiungi `danipepi.github.io` ai domini autorizzati. Abilita Apple solo dopo aver configurato Service ID, team Apple e chiave nel pannello Firebase, seguendo https://firebase.google.com/docs/auth/web/apple. Le chiavi private devono restare nel servizio, mai nel repository.
3. Crea Firestore, preferibilmente in una regione europea. Pubblica le regole del file `firestore.rules`: ogni persona può leggere e modificare solo `travelDiaries/{proprioUid}`. Non usare regole aperte.
4. Imposta `enabled: true` e abilita solo i provider effettivamente configurati. Verifica il login e la sincronizzazione con due account differenti prima del lancio.

“Resta connesso” conserva la sessione tramite Firebase, senza salvare password. Il diario senza accesso resta separato nel browser; dopo il login vengono mostrati i paesi dell'account. La sincronizzazione richiede connessione. Non è previsto un calendario.

Prima dell'attivazione completa l'informativa con titolare, recapiti, finalità, basi giuridiche, tempi di conservazione, fornitori e modalità di cancellazione account e dati. Il file legale esistente è ancora provvisorio.

