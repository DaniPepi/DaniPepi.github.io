# CLICK&VIAGGIA

Sito statico responsive, modificabile in Visual Studio Code, senza dipendenze di compilazione. Home a tutto schermo, titolo moderno con movimento morbido al passaggio del mouse, sfondo con panoramica lenta e pausa, pannelli vetrificati, finestre per articoli e itinerari, PWA.

## Sito pubblicato e gestione dei link

## Sfondo della home

Fotografia originale delle onde con panoramica lenta di 48 secondi, pulsante pausa/ripresa e rispetto della preferenza di riduzione del movimento. La fotografia è locale e disponibile offline.

## Schede viaggio condivisibili

La sezione Viaggi organizzati presenta solo **Fátima** e **Disneyland Paris**. Ogni tessera è un collegamento che apre la pagina dedicata in una nuova scheda del browser: `viaggio-fatima.html` e `viaggio-disney.html`. Le schede hanno fotografie, descrizioni della destinazione e un contatto chiaro con il team. Il pulsante Condividi usa il menu nativo del dispositivo o copia il link; Scarica la grafica salva la copertina PNG.

Entrambi i viaggi sono **proposte in preparazione**. Le schede non contengono prezzi o campi tariffari, neppure nei metadati. Date, programma, servizi e organizzatore saranno comunicati quando definiti. Le fotografie illustrano i luoghi e non attestano servizi inclusi. Le tre vecchie pagine Portogallo, Islanda e Marocco rimandano al catalogo aggiornato.

`data/contact.json` configura il contatto WhatsApp `https://wa.me/393892962059`, corrispondente a +39 389 296 2059. Il pulsante Richiedi un appuntamento apre WhatsApp con un messaggio precompilato che cita la destinazione; l’invio resta a scelta del visitatore. Il sito non conserva richieste né prenotazioni e non gestisce un calendario.

Le fotografie sono ospitate localmente. Autori, fonti, licenze e modifiche sono elencati in `TRIP-GRAPHICS-SOURCES.md` e nelle schede pubbliche. La copertina Disney fotografica è disponibile in `assets/grafica-disney-v2.svg` e `assets/grafica-disney-v2.png`; la copertina Fátima in `assets/grafica-fatima.svg` e `assets/grafica-fatima.png`.

## Collegamenti Travel Advantage

Sito: https://danipepi.github.io/click-e-viaggia/

Gestione: https://danipepi.github.io/click-e-viaggia/admin.html

La pagina di gestione prepara una bozza dei link. Copiare la configurazione, aprire l’editor GitHub tramite il pulsante dedicato, sostituire il contenuto di `click-e-viaggia/data/travel-links.json` e confermare con Commit changes. La scrittura è autorizzata da GitHub; la pagina pubblica non contiene credenziali e non può pubblicare da sola. Sono consentiti URL HTTPS su traveladvantage.com e sottodomini. Indicare correttamente se il collegamento è affiliato. Le modifiche alla bozza non persistono dopo la chiusura della pagina.

Gli indicatori rossi del blog si mostrano per 14 giorni dalla data `data-published` del badge in `blog.html`, gestita da `journal.js`. Mantenere la stessa data nei metadati e negli elementi `time` dell’articolo. I tre racconti originali sono stati pubblicati il 6 ottobre 2026; le date non si aggiornano automaticamente. Il blog comprende soltanto Fátima/Nazaré, Nosy Be e Marsa Alam.

## Informazioni legali ancora da completare

## Foto e biografie del team

La pagina `chi-siamo.html` legge i membri da `data/team.json`. Per aggiungere un membro inserire un oggetto nell’array `members` con `name`, `role`, `bio` e `photo` (esempio percorso: `assets/nome-membro.jpg`). Caricare la fotografia corrispondente nella cartella assets tramite GitHub o Visual Studio Code. Sono accettate foto locali JPG, JPEG, PNG e WebP; usare fotografie autorizzate dalla persona ritratta. Nessun nome o profilo dimostrativo è stato pubblicato. La sezione persone e il relativo collegamento restano nascosti finché non vengono inseriti profili validi.

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

Il blog contiene tre racconti originali sulle esperienze indicate dal team; le proposte Fátima e Disneyland Paris sono in preparazione. Prima del lancio commerciale completare i dettagli dei viaggi, l’identità dell’organizzatore, le condizioni e le informazioni richieste per l’attività. Non sono presenti prenotazioni o pagamenti.

## Applicazione

Manifest e service worker consentono l’installazione dove supportata e la lettura offline dopo la prima visita. Non è un’app pubblicata negli store. Il pulsante di installazione compare quando il browser offre questa possibilità; su iPhone si usa il menu di condivisione di Safari.

## Modifiche

- `index.html`: struttura e testi principali.
- `style.css`: grafica di base e responsive.
- `presentation.css`: presentazione, percorsi e CTA della home e della pagina team.
- `brand.css`: logo su una riga e navigazione adattiva.
- `trips.css`: vetrina dei due viaggi, tessere fotografiche e gallerie delle schede.
- `trip-layout.css`: impaginazione delle schede su desktop e dispositivi mobili.
- `app.js`: menu e catalogo viaggi; riferimento pubblico aggiornato a `app.js?v=17`.
- `trip.js`: condivisione delle schede e contatto WhatsApp con destinazione.
- `sw.js`: cache `click-viaggia-v18` con fotografie, copertine e nuovo marchio; le vecchie proposte non sono più precaricate. Aumentare la versione della cache quando si aggiornano risorse per gli utenti offline.

## Logo del sito e dell’app

Il marchio vettoriale originale raffigura una bussola essenziale. La scritta CLICK&VIAGGIA occupa una sola riga. `assets/brand-logo-v3.svg` contiene simbolo e scritta, `assets/brand-mark-v3.svg` il solo simbolo. `brand.css` regola la misura del logo e mantiene la navigazione leggibile su schermi piccoli.

`manifest.webmanifest` usa le icone PNG 192 e 512, più una versione maskable con sfondo pieno; Apple Touch Icon 180 e favicon 32 sono collegate nelle pagine. Tutti gli asset sono locali e modificabili. Le icone precedenti mantengono URL compatibili e mostrano lo stesso marchio. Le app già installate possono richiedere una riapertura o una nuova installazione per mostrare l’icona aggiornata, secondo il browser e il sistema operativo.

Il sito è pubblico all’indirizzo sopra, senza login per le pagine di presentazione e le schede viaggio. `sitemap.xml` elenca le pagine principali; i canonical indicano gli URL pubblici. La presenza nei risultati di ricerca dipende dall’indicizzazione del motore di ricerca.

Per una verifica locale opzionale aprire con un server di VS Code (es. Live Server). La destinazione finale è il sito online.

## Immagine

Foto di xandro Vandewalle: https://unsplash.com/photos/aerial-photography-of-body-of-water-S2wLuk_Ac2I . Fonte Unsplash. Font di sistema: nessuna richiesta a Google Fonts.

## Diario personale
La home usa di nuovo la fotografia originale. La sezione I miei viaggi si apre in una nuova scheda: mappa con bandiere, descrizioni e salvataggio personale sul browser. Per Google, Apple e sincronizzazione account seguire AUTH-SETUP.md. I provider sono disattivati finché non si configura il progetto reale e si pubblicano le regole Firestore.


## Atlante fotografico
Grafica vettoriale dell'atlante, modalità Bandiere e schede fotografiche per paesi e territori. Testi: data/country-editorial.json. Fotografie e attribuzioni: data/country-photos.json; licenze e fonti descritte in PHOTO-SOURCES.md. La foto viene richiesta quando si apre una scheda e richiede connessione.


## Articoli fotografici

Le pagine `blog-fatima-nazare.html`, `blog-nosy-be.html` e `blog-marsa-alam.html` contengono i racconti completi e possono essere condivise con il proprio URL. La pagina dedicata `blog.html` presenta il racconto di Fátima e Nazaré in evidenza e le altre due storie, con filtri per paese. La home rimanda al diario. I vecchi link `?section=blog` portano alla nuova pagina. Le vecchie tre guide generiche non sono più pubblicate.

I testi editoriali sono conservati anche in `data/blog-articles.json`; le fotografie e le relative attribuzioni in `data/blog-photos.json`. Le pagine HTML sono statiche: modificare testo e metadati in Visual Studio Code, aggiornando anche le anteprime in `blog.html` e `index.html` quando cambia un titolo. `journal.css` e `journal.js` gestiscono la selezione; `blog.css` gestisce la lettura, `article.js` condivisione e copia del link. Le fotografie sono illustrative, con crediti visibili, e non sono immagini dei viaggi personali. Fonti: `BLOG-EDITORIAL-SOURCES.md` e `BLOG-PHOTO-SOURCES.md`. I nuovi articoli e le fotografie sono inclusi nella cache offline v18.


Il diario ha un’impaginazione editoriale con copertine fotografiche. I box delle esperienze di Daniele riportano esclusivamente le due durate fornite dal team e collegano i relativi racconti.


I due pannelli della home usano titoli diretti, maiuscoli e in grassetto: VIAGGI ORGANIZZATI e IL BLOG. Le misure del testo si adattano allo spazio disponibile mantenendo i titoli su una riga. Le introduzioni e i pulsanti hanno allineamenti comuni; su tablet e telefono i pannelli si dispongono in colonna. `presentation.css?v=2` e la cache offline v18 pubblicano queste rifiniture.
