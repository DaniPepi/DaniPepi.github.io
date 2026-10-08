# CLICK&VIAGGIA

Sito statico responsive, modificabile in Visual Studio Code, senza dipendenze di compilazione. Home a tutto schermo con panoramica lenta, carte viaggio interattive, anteprime del blog animate, giornale di viaggio e schede dettagliate condivisibili, PWA.

## Sito pubblicato e gestione dei link

## Sfondo della home

Fotografia originale delle onde con panoramica lenta di 48 secondi e rispetto della preferenza di riduzione del movimento. Non sono presenti pulsanti di stop nella home. La fotografia è locale e disponibile offline.

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

`legal.html` descrive il funzionamento tecnico attuale; non è un’informativa GDPR definitiva. Mancano identità e recapiti del titolare, dati dell’attività e dettagli verificati del rapporto con Travel Advantage. Google Analytics è predisposto ma disattivato finché la configurazione e l’informativa non sono completate. Nessuna richiesta Google o cookie Analytics viene introdotto senza consenso; i font restano locali. Gli IP possono essere registrati dal fornitore dell’hosting.

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
- `app.js`: menu, collegamenti alla sezione viaggi e link alla piattaforma; riferimento pubblico aggiornato a `app.js?v=20`.
- `trip.js`: condivisione delle schede e contatto WhatsApp con destinazione.
- `sw.js`: cache `click-viaggia-v26` con fotografie, fasce compatte della home, carte viaggio, schede compatte, pannello account e nuovo marchio; le vecchie proposte non sono più precaricate. Aumentare la versione della cache quando si aggiornano risorse per gli utenti offline.

## Logo del sito e dell’app

Il marchio vettoriale originale raffigura una bussola essenziale. La scritta CLICK&VIAGGIA occupa una sola riga. `assets/brand-logo-v3.svg` contiene simbolo e scritta, `assets/brand-mark-v3.svg` il solo simbolo. `brand.css` regola la misura del logo e mantiene la navigazione leggibile su schermi piccoli.

`manifest.webmanifest` usa le icone PNG 192 e 512, più una versione maskable con sfondo pieno; Apple Touch Icon 180 e favicon 32 sono collegate nelle pagine. Tutti gli asset sono locali e modificabili. Le icone precedenti mantengono URL compatibili e mostrano lo stesso marchio. Le app già installate possono richiedere una riapertura o una nuova installazione per mostrare l’icona aggiornata, secondo il browser e il sistema operativo.

Il sito è pubblico all’indirizzo sopra, senza login per le pagine di presentazione e le schede viaggio. `sitemap.xml` elenca le pagine principali; i canonical indicano gli URL pubblici. La presenza nei risultati di ricerca dipende dall’indicizzazione del motore di ricerca.

Per una verifica locale opzionale aprire con un server di VS Code (es. Live Server). La destinazione finale è il sito online.

## Immagine

La fotografia precedente, conservata in assets/ocean.jpg, è di xandro Vandewalle: https://unsplash.com/photos/aerial-photography-of-body-of-water-S2wLuk_Ac2I . Fonte Unsplash. La home attuale usa una grafica procedurale in carbonio. Font di sistema: nessuna richiesta a Google Fonts.

## Diario personale
La home usa lo sfondo procedurale in carbonio descritto sotto. La sezione I miei viaggi si apre in una nuova scheda: mappa con bandiere, descrizioni e salvataggio personale sul browser. Per Google, Apple e sincronizzazione account seguire AUTH-SETUP.md. I provider sono disattivati finché non si configura il progetto reale e si pubblicano le regole Firestore.


## Atlante fotografico
Grafica vettoriale dell'atlante, modalità Bandiere e schede fotografiche per paesi e territori. Testi: data/country-editorial.json. Fotografie e attribuzioni: data/country-photos.json; licenze e fonti descritte in PHOTO-SOURCES.md. La foto viene richiesta quando si apre una scheda e richiede connessione.


## Articoli fotografici

Le pagine `blog-fatima-nazare.html`, `blog-nosy-be.html` e `blog-marsa-alam.html` contengono i racconti completi e possono essere condivise con il proprio URL. La pagina dedicata `blog.html` presenta il racconto di Fátima e Nazaré in evidenza e le altre due storie, con filtri per paese. La home rimanda al diario. I vecchi link `?section=blog` portano alla nuova pagina. Le vecchie tre guide generiche non sono più pubblicate.

I testi editoriali sono conservati anche in `data/blog-articles.json`; le fotografie e le relative attribuzioni in `data/blog-photos.json`. Le pagine HTML sono statiche: modificare testo e metadati in Visual Studio Code, aggiornando anche le anteprime in `blog.html` e `index.html` quando cambia un titolo. `journal.css` e `journal.js` gestiscono la selezione; `blog.css` gestisce la lettura, `article.js` condivisione e copia del link. Le fotografie sono illustrative, con crediti visibili, e non sono immagini dei viaggi personali. Fonti: `BLOG-EDITORIAL-SOURCES.md` e `BLOG-PHOTO-SOURCES.md`. I nuovi articoli e le fotografie sono inclusi nella cache offline v26.


Il diario ha un’impaginazione editoriale con copertine fotografiche. I box delle esperienze di Daniele riportano esclusivamente le due durate fornite dal team e collegano i relativi racconti.


La home usa un titolo diretto, maiuscolo e in grassetto: VIAGGI ORGANIZZATI, su una riga sopra alle carte centrate. Il blog ha un riquadro separato con il pulsante SFOGLIA IL BLOG e una sola anteprima alla volta.


## Il giornale dei viaggi: Daniele racconta

I tre racconti sono impaginati come articoli di giornale in Times New Roman, con titoli in grassetto, occhiello, sommario, firma, fotografie e indice. Daniele racconta in forma di domande e risposte; una breve nota chiarisce che il testo è rielaborato dalle esperienze condivise e non una trascrizione registrata. Il cognome non compare negli articoli, nelle anteprime o nei metadati. Il profilo @daniele_pepi98 resta un semplice link esterno, senza embed o richieste automatiche a Instagram. Le fotografie sono illustrative e conservano i crediti. CSS: blog.css?v=5 e journal.css?v=3; cache offline v26.

## Schede compatte dei viaggi di gruppo

`viaggio-fatima.html` e `viaggio-disney.html` presentano immagini a sinistra e riepilogo, inclusioni, programma e contatto a destra. `trip-compact.css` sostituisce l’impaginazione lunga delle due pagine; su telefoni, finestre basse e zoom elevato lo scorrimento naturale mantiene accessibili tutti i contenuti. Non è presente uno scorrimento interno della scheda. Crediti fotografici e condizioni sono in un dettaglio espandibile sotto la scheda. Gli URL da condividere restano gli stessi.

`data/group-trips.json` contiene due oggetti, `fatima` e `disney`. Compilare `dates` e `duration` con i valori reali, `inclusions` con un elenco di servizi confermati e `programme` con un oggetto per ciascun giorno: `day`, `title`, `description`. `trip.js?v=3` mostra i dati come testo, senza interpretare HTML. Al momento gli elenchi sono vuoti: non sono stati inventati programmi, durate o servizi. Le date del racconto Fátima del settembre 2026 riguardano un viaggio concluso.

Il pulsante “Prenota il tuo posto senza impegno” apre WhatsApp al numero +39 389 296 2059 con la destinazione nel messaggio; non effettua una prenotazione o un pagamento. Il collegamento statico funziona anche senza JavaScript. `data/contact.json` può aggiornare il recapito. L’eventuale `whatsappGroupUrl` nella singola proposta può contenere un link d’invito HTTPS valido su `chat.whatsapp.com`: aggiunge il pulsante distinto “Entra nel gruppo del viaggio”. Nessun gruppo è attualmente configurato e nessun messaggio viene inviato dal sito.

## Accesso facoltativo

`site-account.js` e `site-account.css` aggiungono il pannello facoltativo con X, “Continua senza account” e apertura manuale “Accedi”. La chiusura viene ricordata nella sessione di navigazione. Nessuna pagina del sito richiede un account per la lettura. `account-core.js` condivide la configurazione Firebase con il diario personale; “Resta connesso” riguarda la sessione, mai le password Google o Apple.

La configurazione pubblica `data/auth-config.json` è ancora vuota e disabilitata: i pulsanti Google e Apple mostrano questo stato e non simulano un accesso. Per attivarli servono i dati pubblici dell’app e i provider reali configurati, come indicato in `AUTH-SETUP.md`. La sincronizzazione del diario va verificata sul progetto reale prima del lancio. Nessun SDK esterno viene caricato dal pannello mentre l’accesso è disabilitato.

## Carte dei viaggi nella homepage

`travel-deck.css` e `travel-deck.js` gestiscono le due carte di Fátima e Disneyland Paris nella sezione Viaggi organizzati. La carta più vicina al centro si ingrandisce; il carosello si scorre con le frecce, la tastiera, il trascinamento del mouse o il gesto nativo sul telefono. Non c’è scorrimento automatico. Le dimensioni vengono ricalcolate quando cambia lo spazio disponibile.

Il clic apre un’anteprima in primo piano con fronte fotografico e retro informativo. “Gira la carta” e “Torna alla foto” cambiano lato; i comandi del lato inattivo sono esclusi dalla navigazione. “Maggiori dettagli” apre il relativo URL permanente in una nuova scheda. Escape e il pulsante di chiusura restituiscono il focus al comando iniziale. Con movimento ridotto il cambio di lato è immediato. Senza JavaScript le carte restano collegamenti diretti alle pagine viaggio.

I dati base sono negli attributi delle carte in `index.html`; date, durata ed eventuale stato aggiornato vengono letti da `data/group-trips.json`, senza inventare partenze o servizi. I collegamenti Travel Advantage configurati restano accessibili sotto il carosello. I vecchi URL `?section=viaggi` e i pulsanti della home ora portano alla stessa sezione; la precedente finestra del catalogo è stata sostituita dalle carte. `trip-compact.css?v=3` usa lo sfondo petrolio della home e mantiene l’impaginazione compatta delle due pagine viaggio. Cache offline v26.

## Fasce compatte della homepage

`home-sections.css?v=4` dispone il titolo “VIAGGI ORGANIZZATI” sopra alle carte centrate, senza sottotitoli. Il fronte e il retro delle anteprime conservano le informazioni complete.

Il blog occupa un riquadro più ampio, separato dai viaggi, con un articolo alla volta e una foto grande. `home-blog-strip.js?v=5` alterna le tre storie ogni 8 secondi come un mazzo di carte: la prima scorre lateralmente e la successiva avanza. Il movimento dura circa un secondo, senza dissolvenze o pulsante di stop. Frecce, indicatori e gesto di scorrimento permettono la scelta manuale. Il collegamento “SFOGLIA IL BLOG” apre `blog.html`; la storia visibile apre direttamente il relativo articolo. Solo la carta davanti è accessibile a tastiera e lettori di schermo; le altre rimangono visibili sullo sfondo e inattive. Non ci sono copie dei link.

La rotazione si sospende durante lettura con mouse o tastiera, quando il riquadro è fuori vista o la pagina non è visibile. Con la preferenza di sistema per movimento ridotto parte in pausa e le animazioni sono disattivate. Le fotografie sono locali. Senza JavaScript tutte le storie restano accessibili tramite scorrimento manuale.


Le schede dettagliate dei viaggi hanno una galleria a sinistra e un riepilogo compatto a destra. Date e durata appaiono solo quando configurate; inclusioni e programma in preparazione hanno una sola riga di attesa. Il pulsante WhatsApp apre la richiesta senza confermare prenotazioni. Condizioni e crediti restano nel riquadro richiudibile.

Il testo degli articoli usa Times New Roman a 17 px su desktop e 16 px su mobile, con colonna di lettura da 680 px, domande a 22/20 px e introduzioni a 20/18 px. Le anteprime del giornale hanno descrizioni da 17/16 px.


## Statistiche Google Analytics 4 (predisposte, non attive)

`analytics.js?v=1` e `analytics.css?v=1` sono inclusi nelle dieci pagine pubbliche; il pannello di amministrazione e i vecchi reindirizzamenti sono esclusi. `data/analytics-config.json` contiene solo impostazioni pubbliche: ID reale `G-6LYQJCJEZY`, con `enabled: false` finché l’informativa del titolare non viene completata. Non inserire password, chiavi private o token. Configurazione assente, non valida o non disponibile: nessun caricamento Google e nessun banner di consenso inutile. Il service worker v28 non conserva la configurazione Analytics nella cache.

Account Click&Viaggia creato l’8 ottobre 2026. Termini Analytics e termini per il trattamento dei dati accettati con autorizzazione esplicita dell’utente. Proprietà 558115953, account 411313081, flusso Web 16067899557 per https://danipepi.github.io/click-e-viaggia/, ID G-6LYQJCJEZY, fuso Italia e valuta EUR. Misurazione avanzata automatica del flusso disattivata. Conservazione dei dati utente ed evento impostata a 2 mesi, senza rinnovo a ogni nuova attività; i report aggregati standard seguono le regole di conservazione di Google. Google Signals e raccolta granulare di posizione/dispositivo disattivati; personalizzazione degli annunci non consentita in tutte le 307 regioni. Condivisioni facoltative dell’account e messaggi promozionali deselezionati. Prima dell’attivazione: completare titolare, recapiti, basi giuridiche, destinatari e trasferimenti nell’informativa. Poi portare enabled a true e aggiornare lo stato in legal.html.

Il consenso è facoltativo: accettazione e rifiuto equivalenti, X come rifiuto, scelta ricordata per 180 giorni e riapertura dal footer. La modalità base blocca il tag e qualsiasi richiesta Google fino al consenso. Page view ed eventi usano percorsi e titoli predefiniti; non vengono inviati messaggi WhatsApp, numeri di telefono, ricerche della mappa o credenziali. Gli eventi predisposti sono `page_view`, `whatsapp_contact` e `trip_details`. La revoca blocca nuovi eventi e rimuove i cookie GA accessibili al sito; non elimina i dati precedenti dalla proprietà.

Link per la bio Instagram, utilizzabile anche con Analytics disattivato:
https://danipepi.github.io/click-e-viaggia/?utm_source=instagram&utm_medium=social&utm_campaign=bio#home

La campagna usa solo i valori fissi instagram/social/bio. Gli altri parametri e frammenti arbitrari sono esclusi dalle misurazioni. I visitatori che rifiutano, usano blocchi o navigano offline possono non comparire nelle statistiche; non si tratta di un censimento esatto delle persone.

Riferimenti: https://developers.google.com/tag-platform/security/concepts/consent-mode e https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876 .


## Stile metallico e sfondo in carbonio

Le nove pagine pubbliche di presentazione usano `metallic.css?v=1` con la classe opt-in `metallic-site`: grafite, acciaio satinato, pulsanti con stato hover/pressione/focus. Contenuti, gallerie e carte restano invariati; gli articoli conservano Times New Roman. La pagina I miei viaggi e tutti i file della mappa non sono stati modificati.

`carbon-hero.js?v=1` disegna localmente pieghe in carbonio su canvas, senza dipendenze o richieste esterne. La deformazione segue il puntatore con inerzia; su touch resta un movimento lento. Il disegno si sospende fuori vista, in una scheda nascosta e durante le finestre modali. Con movimento ridotto è statico; senza JavaScript resta il fondo CSS a pieghe. Nessun dato del puntatore è salvato o trasmesso. Il service worker v29 include i nuovi asset.

Il pannello account `site-account.css/js?v=2` è scuro, centrale, largo al massimo 360 px e facoltativo; X, Escape e Continua senza account lo chiudono. L’aspetto non cambia lo stato dei provider: Google/Apple restano disabilitati finché non viene configurato Firebase. Le statistiche restano disattivate in attesa del completamento dell’informativa.


## Galleria fotografica a carte di Fátima

`trip-photo-stack.css/js?v=1` migliora solo la galleria con `data-photo-stack` della pagina Fátima: sei fotografie locali, tre carte sovrapposte, cambio animato ogni 6 secondi e scelta manuale con frecce, miniature, tastiera e gesto sul telefono. La rotazione si sospende durante interazione, finestre modali e fuori vista; con movimento ridotto si sfoglia manualmente. Senza il miglioramento JavaScript rimane la foto iniziale con le miniature. Il programma, i servizi e il contatto WhatsApp conservano lo stesso comportamento. Crediti e licenze: TRIP-GRAPHICS-SOURCES.md e dettaglio espandibile della scheda. Cache offline v30.
