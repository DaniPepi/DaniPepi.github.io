# CLICK&VIAGGIA

Sito statico responsive, modificabile in Visual Studio Code, senza dipendenze di compilazione. Home a tutto schermo, titolo serif con movimento morbido al passaggio del mouse, sfondo con panoramica lenta e pausa, pannelli vetrificati, finestre per articoli e itinerari, PWA.

## Sito pubblicato e gestione dei link

## Schede viaggio condivisibili

Ogni tessera apre una pagina dedicata: viaggio-portogallo.html, viaggio-islanda.html, viaggio-marocco.html. Il pulsante Condividi usa il menu nativo del dispositivo o copia il link. Le schede non contengono prezzi o campi tariffari, neppure nei metadati. I percorsi restano illustrativi fino alla conferma dei dati reali.

Per attivare gli appuntamenti modificare `data/contact.json` impostando `appointmentUrl` con un URL HTTPS di prenotazione o WhatsApp (`https://wa.me/NUMERO_INTERNAZIONALE_SENZA_PIU`), oppure un indirizzo `mailto:`. Un calendario condiviso richiede che l’accesso dei membri sia configurato presso il fornitore del calendario. Il sito non conserva prenotazioni. Con URL vuoto il pulsante spiega come ricontattare il membro che ha condiviso la scheda, senza fingere di inviare richieste.

Foto: Portogallo https://unsplash.com/photos/cliffs-meet-the-ocean-with-waves-crashing-eDss0p0kX-M ; Islanda https://unsplash.com/s/photos/iceland-waterfall ; Marocco (Sander Traa) https://unsplash.com/photos/a-tall-tower-with-a-clock-on-top-of-it-wuEWArCIP28 . Risorse ospitate localmente, secondo licenza Unsplash.

## Collegamenti Travel Advantage

Sito: https://danipepi.github.io/click-e-viaggia/

Gestione: https://danipepi.github.io/click-e-viaggia/admin.html

La pagina di gestione prepara una bozza dei link. Copiare la configurazione, aprire l’editor GitHub tramite il pulsante dedicato, sostituire il contenuto di `click-e-viaggia/data/travel-links.json` e confermare con Commit changes. La scrittura è autorizzata da GitHub; la pagina pubblica non contiene credenziali e non può pubblicare da sola. Sono consentiti URL HTTPS su traveladvantage.com e sottodomini. Indicare correttamente se il collegamento è affiliato. Le modifiche alla bozza non persistono dopo la chiusura della pagina.

Gli indicatori rossi del blog si mostrano per 14 giorni dalla data in `publicationDates` in app.js. Le date attuali sono dimostrative.

## Informazioni legali ancora da completare

## Foto e biografie del team

La pagina `chi-siamo.html` legge i membri da `data/team.json`. Per aggiungere un membro inserire un oggetto nell’array `members` con `name`, `role`, `bio` e `photo` (esempio percorso: `assets/nome-membro.jpg`). Caricare la fotografia corrispondente nella cartella assets tramite GitHub o Visual Studio Code. Sono accettate foto locali JPG, JPEG, PNG e WebP; usare fotografie autorizzate dalla persona ritratta. Nessun nome o profilo dimostrativo è stato pubblicato.

Il file può essere modificato su https://github.com/DaniPepi/DaniPepi.github.io/edit/main/click-e-viaggia/data/team.json . La modifica viene resa pubblica dopo il commit.

## Completamento delle informazioni legali

`legal.html` descrive il funzionamento tecnico attuale; non è un’informativa GDPR definitiva. Mancano identità e recapiti del titolare, dati dell’attività e dettagli verificati del rapporto con Travel Advantage. Nessun cookie, analytics o font esterno è introdotto dal codice. Gli IP possono essere registrati dal fornitore dell’hosting.

GitHub Pages non è destinato a ospitare attività principalmente orientate a transazioni commerciali. Prima di pubblicare una versione commerciale con link affiliati o vendita di viaggi valutare un hosting conforme, mantenendo il codice su GitHub. https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features

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

Foto di xandro Vandewalle: https://unsplash.com/photos/aerial-photography-of-body-of-water-S2wLuk_Ac2I . Fonte Unsplash. Font di sistema: nessuna richiesta a Google Fonts.

