# CLICK&VIAGGIA

Sito statico responsive, modificabile in Visual Studio Code, senza dipendenze di compilazione. Home a tutto schermo, titolo con deformazione liquida, diario, itinerari dimostrativi e predisposizione PWA.

## Pubblicazione su GitHub

1. Crea un repository e carica tutto il contenuto di questa cartella, inclusa `.github`.
2. Usa `main` come branch principale.
3. In Settings → Pages → Build and deployment scegli **GitHub Actions**.
4. Avvia il workflow Publish GitHub Pages o effettua un nuovo commit. Il workflow restituisce il link pubblico.

Il sito usa percorsi relativi e funziona anche sotto `/nome-repository/`. Un dominio può essere collegato successivamente dalle impostazioni Pages e tramite DNS presso il registrar.

## Contenuti prima del lancio commerciale

I racconti e gli itinerari sono dimostrativi. Sostituire la presentazione del team e inserire contatti reali, dettagli dei viaggi, organizzatore, condizioni e informazioni richieste per l’attività. Non sono presenti prenotazioni o pagamenti.

## Applicazione

Manifest e service worker consentono l’installazione dove supportata e la lettura offline dopo la prima visita. Non è un’app pubblicata negli store. Il pulsante di installazione compare quando il browser offre questa possibilità; su iPhone si usa il menu di condivisione di Safari.

## Modifiche

- `index.html`: struttura e testi principali.
- `style.css`: grafica e responsive.
- `app.js`: effetto acqua, menu e contenuti dei dettagli.
- `sw.js`: aumentare la versione del cache quando si aggiornano risorse per gli utenti offline.

Per una verifica locale opzionale aprire con un server di VS Code (es. Live Server). La destinazione finale è il sito online.

## Immagine

Foto di xandro Vandewalle: https://unsplash.com/photos/aerial-photography-of-body-of-water-S2wLuk_Ac2I . Fonte Unsplash. Font DM Sans e Manrope da Google Fonts; sono previsti font di sistema in assenza di rete.

