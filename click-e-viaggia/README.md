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

`legal.html` descrive il funzionamento tecnico attuale; non è una certificazione di conformità. Titolare e contatto privacy sono Daniele Pepi e daniele.pepi98@gmail.com. L’attività commerciale e i programmi dei viaggi restano da definire. Cloudflare Web Analytics conta visite aggregate senza cookie; Google Analytics è disattivato. Firebase continua a gestire l’accesso e il diario secondo l’informativa; i font restano locali. Gli IP possono essere trattati dai fornitori tecnici.

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

La fotografia precedente, conservata in assets/ocean.jpg, è di xandro Vandewalle: https://unsplash.com/photos/aerial-photography-of-body-of-water-S2wLuk_Ac2I . Fonte Unsplash. La home attuale usa un globo metallico procedurale. Font di sistema: nessuna richiesta a Google Fonts.

## Diario personale
La home usa il globo metallico interattivo descritto sotto. I miei viaggi presenta mappa con bandiere, descrizioni e diario personale. Senza account le scelte restano sul browser; con Google il diario usa Firestore e può essere ritrovato sui dispositivi dove si accede allo stesso account. Guest e account rimangono separati, senza importazioni automatiche. Google richiede configurazione pubblica, provider e dominio autorizzato nel progetto reale; Apple resta disabilitato in attesa della configurazione Apple Developer. Procedura e verifiche sono in `AUTH-SETUP.md`.


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

`site-account.js` e `site-account.css` aggiungono il pannello facoltativo con X, “Continua senza account” e apertura manuale “Accedi”. La chiusura viene ricordata nella sessione di navigazione. Nessuna pagina richiede un account per la lettura. `account-core.js?v=2` condivide la configurazione Firebase e la versione degli SDK con il diario personale; “Resta connesso” riguarda la sessione, mai le password Google o Apple. È deselezionato per impostazione iniziale: l'accesso dura nella scheda corrente; selezionandolo può persistere dopo la chiusura del browser ed essere condiviso fra schede dello stesso dominio. I collegamenti del percorso account devono mantenere la scheda corrente.

`data/auth-config.json` contiene soltanto configurazione pubblica: il flag `enabled` e i provider devono corrispondere ai servizi attivati nel progetto reale. Google è il metodo previsto per questa versione; Apple resta disabilitato fino alla configurazione del suo provider. I pulsanti non simulano un account e gli SDK esterni non vengono caricati mentre l'accesso è disabilitato. `map-auth.js` legge e scrive solo `travelDiaries/{uid}`: le modifiche attendono il caricamento, le callback precedenti vengono ignorate anche al nuovo accesso con lo stesso UID e il logout ripristina il diario guest aggiornato. `firestore.rules` limita le scritture a campi esatti, codici paese ammessi e distinti e timestamp server. Le prove con mock non sostituiscono login, sincronizzazione e isolamento verificati sul progetto reale; dettagli in `AUTH-SETUP.md`.

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


## Statistiche aggregate Cloudflare Web Analytics

Cloudflare Web Analytics sostituisce Google Analytics dal 12 ottobre 2026. Configurazione pubblica in data/analytics-config.json: provider cloudflare, hostname danipepi.github.io, token beacon pubblico (non credenziale amministrativa). Il runtime analytics.js?v=2 carica una sola volta il modulo ufficiale soltanto sulle dieci pagine pubbliche e sul dominio configurato; admin, hostname diversi e configurazione non valida restano esclusi. Cache v39; configurazione esclusa dalla cache offline.

Nessun banner di consenso per il nuovo servizio aggregato, nessun cookie o identificatore statistico aggiunto dal sito. Non sono trasmessi campi del diario, UID o credenziali dal codice del sito. Google Analytics non viene caricato, la precedente preferenza statistica e i cookie GA accessibili sul percorso del sito vengono rimossi senza toccare sessione account o diario. I vecchi report Google restano nell’account ma non ricevono nuovi eventi.

Pannello privato: https://dash.cloudflare.com/885eb9bcb5559690de6144965a9414bc/web-analytics/overview?siteTag~in=1b5ab082acf84c72bb167ea4c31051cc&excludeBots=Yes
Visits misura gli ingressi, Page views le pagine; non sono persone uniche e possono mancare browser con blocchi. Nessun recupero delle visite precedenti. Nessun acquisto, cambio DNS o migrazione dell’hosting. La configurazione dei servizi Google Authentication e del diario non cambia.

## Stile metallico e precedente sfondo in carbonio

Le nove pagine pubbliche di presentazione usano `metallic.css?v=1` con la classe opt-in `metallic-site`: grafite, acciaio satinato, pulsanti con stato hover/pressione/focus. Contenuti, gallerie e carte restano invariati; gli articoli conservano Times New Roman. La pagina I miei viaggi e tutti i file della mappa non sono stati modificati.

La precedente home usava `carbon-hero.js?v=1`, che disegna localmente pieghe in carbonio su canvas, senza dipendenze o richieste esterne. I file carbon-hero.css/js sono conservati per il ripristino del modello precedente. La nuova home non li carica.

Il pannello account è scuro, centrale, largo al massimo 360 px e facoltativo; X, Escape e Continua senza account lo chiudono. La disponibilità dei provider deriva dalla configurazione Firebase, con Google come metodo previsto e Apple ancora disabilitato. Le statistiche aggregate Cloudflare mantengono una configurazione separata e non richiedono un pannello di consenso.


## Galleria fotografica a carte di Fátima

`trip-photo-stack.css/js?v=2` migliora solo la galleria con `data-photo-stack` della pagina Fátima: sei fotografie locali, tre carte sovrapposte e cambio automatico ogni 6 secondi. La transizione è morbida, con spostamenti e rotazioni contenuti; la scelta manuale usa frecce, tastiera e gesto sul telefono. Le miniature sono nascoste dopo l’inizializzazione della galleria. La rotazione si sospende durante interazione, finestre modali e fuori vista; con movimento ridotto si sfoglia manualmente. Senza il miglioramento JavaScript rimane la foto iniziale con le miniature. Il programma, i servizi e il contatto WhatsApp conservano lo stesso comportamento. Crediti e licenze: TRIP-GRAPHICS-SOURCES.md e dettaglio espandibile della scheda. Cache offline v31.

## Home con globo metallico

`globe-hero.css?v=4`, `globe-hero.js?v=5` e la classe `globe-home` sulla sola homepage mostrano un globo WebGL locale: oceani grafite, continenti in argento satinato e rotte illustrative. Il globo non ha un bagliore esterno né un pannello di pulsanti. Si ruota tramite trascinamento del mouse, gesto orizzontale sul telefono o frecce della tastiera; Home ripristina la vista. Una breve istruzione compare solo quando il globo riceve il focus da tastiera. La rotazione orizzontale non ha limiti, mentre l’inclinazione si ferma vicino ai poli. Dopo una rotazione manuale la prospettiva scelta rimane attiva; al rilascio l’inerzia rallenta dolcemente. Tenere fermo il puntatore prima del rilascio annulla la velocità residua. Il gesto verticale sul telefono permette lo scorrimento della pagina. Il titolo e i contatti restano elementi HTML leggibili e utilizzabili. Nessun dato del puntatore è registrato o trasmesso e non vengono caricate librerie da servizi esterni. Le animazioni si fermano fuori vista, nelle schede nascoste e durante i dialoghi. Con movimento ridotto sono disattivati i movimenti automatici e l’inerzia; i comandi manuali restano disponibili. Senza WebGL o JavaScript rimane un globo decorativo CSS.

La geometria `data/globe-land.json` è derivata dalla copia Natural Earth già disponibile nel progetto (`work/map-source/world.json`). Fonte e condizioni: https://www.naturalearthdata.com/about/terms-of-use/ . Il builder `work/build-globe-land.cjs` semplifica i contorni per la visualizzazione; questa grafica non è la mappa personale del diario e le rotte non descrivono servizi inclusi nei viaggi.

Le coste dettagliate sono disegnate localmente in una texture da 4096 px sui computer compatibili, 2048 px su telefoni o dispositivi con memoria limitata. Mipmap e filtri smussano i contorni; un lieve rilievo del bordo simula continenti in metallo inciso, senza rappresentare altitudini reali. Luce e riflessi sono morbidi, con oceani grafite e rotte sottili. La versione 4 aggiorna la rotazione a ogni fotogramma disponibile, con smorzamento calcolato sul tempo trascorso. Il buffer del canvas riduce la risoluzione durante il movimento e si adatta alla cadenza del dispositivo; la texture geografica conserva il proprio dettaglio. Se il contesto grafico viene perso appare il globo CSS e, quando disponibile, il renderer viene ricostruito. Cache offline v35.

`home-motion.css/js?v=1` aggiunge inclinazione al mouse alla sola carta viaggio selezionata, movimenti più morbidi alle anteprime del blog e un ingresso leggero delle sezioni. Scala, selezione, gesto, tastiera, link e dettagli dei caroselli restano gestiti dai file esistenti. Gli articoli mantengono Times New Roman; la pagina I miei viaggi conserva il proprio stile. Cache offline v34.

Ripristino: il modello precedente è nel commit `6cbd3d663071d1977054375c669ab0a4be44ab3f`. È stata conservata anche una copia completa fuori dalla cartella pubblica, in `work/rollback-home-before-globe-20261009`, con istruzioni per un ripristino mirato tramite nuovo commit, senza force push.

## Finiture metalliche delle pagine pubbliche

`metal-finish.css/js?v=1` rifinisce le nove pagine con la classe `metallic-site`: testate satinate, bordi incisi, superfici grafite, cornici fotografiche e pulsanti con risposta al passaggio e alla pressione. Le sezioni del team e dei contatti hanno un motivo decorativo a orbite. Gli ingressi animati sono leggeri, eseguiti una sola volta e disattivati con la preferenza movimento ridotto. I contenuti sono leggibili anche senza JavaScript. Le animazioni e i controlli dei caroselli mantengono il loro funzionamento.

La prima versione del globo rimane recuperabile dal commit `317af9cfb21069dbde203583eacdeb65434f44b9` e dalla copia completa in `work/rollback-before-metal-refine-20261009`. Il ripristino avviene con un nuovo commit e una nuova versione della cache; non richiede riscrivere la cronologia Git. Le modifiche grafiche non attivano Firebase o Analytics.

## Interazioni del sito

`site-interactions.css/js?v=1` è incluso nelle nove pagine pubbliche con stile metallico. Le foto degli articoli diventano pulsanti accessibili che aprono un pannello scuro: fotografia locale ingrandita, testo alternativo, didascalia e crediti originali con i relativi link. Frecce, tastiera, X ed Escape consentono di sfogliare o chiudere; la chiusura restituisce il focus alla fotografia iniziale. Senza JavaScript le immagini e i crediti restano nella pagina.

Le fotografie rispondono leggermente al mouse e le orbite decorative di team e contatti seguono il puntatore senza bagliori. Un indicatore sottile mostra il progresso nella pagina; il pulsante Torna all’inizio compare dopo lo scorrimento. I collegamenti alle sezioni nel menu indicano la posizione corrente. Sono effetti locali: nessuna informazione del puntatore o dello scorrimento viene inviata. La preferenza movimento ridotto disattiva profondità e transizioni. I caroselli dei viaggi e del blog mantengono i propri controlli e tempi; gli articoli mantengono Times New Roman e le dimensioni del testo. Mappa personale, amministrazione, accesso e stato Analytics non sono modificati.

La versione immediatamente precedente è nel commit `0f3b46cae06d8fddd7a8de7bec5fb40173df538e` e nel pacchetto completo `work/rollback-before-interactions-20261009/CLICK-e-VIAGGIA-before-interactions.zip`.

## Paesi del diario illuminati nella home

Dal 10 ottobre 2026 Google è configurato sul progetto Firebase `click-e-viaggia` (piano Spark). Il database `(default)` è a Milano (`europe-west8`); Authentication segue le localizzazioni del servizio Google descritte nell’informativa. Apple resta disabilitato. Le regole proprietario e la lista dei paesi sono compilate e pubblicate nella console. I test isolati coprono due utenti, popup, persistenza, errori e ripristino del diario locale; il primo accesso personale va completato da un visitatore nel flusso Google.

Senza account, il globo legge il diario locale già usato da I miei viaggi: `localStorage["click-viaggia-visited-v1"]`, con codici ISO a due lettere minuscole. Le scelte illuminano soltanto le superfici dei paesi, in una tonalità chiara coerente con il metallo; senza scelte il globo conserva la grafica precedente. Aggiunte, rimozioni e azzeramento locali si riflettono nella home tramite l'evento `storage`, il ritorno alla pagina e il ricaricamento. Con Google collegato, `globe-account.js?v=1` seleziona il diario Firestore dello stesso UID e lo aggiorna tramite snapshot. Il caricamento, il cambio account e gli errori svuotano subito la selezione precedente; l'uscita rilegge il diario locale. I due diari non vengono mai uniti o copiati automaticamente. Il globo non scrive dati e il suo rendering resta invariato.

`data/globe-countries.json` deriva dalla topologia Natural Earth già locale. Il builder `work/build-globe-countries.cjs` conserva anelli chiusi, isole, buchi e attraversamenti della linea del cambio di data. Le geometrie identificano 245 dei 250 codici del diario; `bv`, `gi`, `tk`, `tv` e `um` non hanno poligoni alla risoluzione della fonte e non sono illuminati. Nove territori con una voce propria nel diario sono stati separati dalle geometrie dei paesi principali. La costa e la texture del globo originale restano invariate. La maschera delle visite viene aggiornata solo quando cambiano le scelte, senza ricostruire la superficie metallica. Cache offline v37.

Versione precedente: commit `97ed414c24e6ddc7d024d66f03f23a13d65c51bc` e copia completa in `work/rollback-before-visited-globe-20261010/CLICK-e-VIAGGIA-before-visited-globe.zip`.


## Curiosità dal mondo — 12 ottobre 2026
Dieci nuovi articoli giornalistici con fonti primarie, immagini illustrative locali e crediti. Il giornale contiene 13 storie; filtro Curiosità dal mondo, badge Nuovo per 14 giorni, pagine condivisibili e articoli correlati. Impaginazione Times New Roman ereditata dal giornale, senza interviste inventate. Sitemap e cache v41 aggiornate. Le nuove pagine sono incluse nella whitelist Cloudflare, senza banner. Fonti e dati editoriali in data/curiosity-articles.json. Le foto sono illustrative del paese, con caption esatta e licenza; Lalibela documenta il luogo del testo.


## Capitoli del blog
Home e giornale: Luoghi dal mondo (3 racconti) e Curiosità dal mondo (10 approfondimenti). Link capitolo=luoghi/curiosita, compatibilità paese, copertine interattive con movimento ridotto, cache v42.


## Sette capitoli
18 articoli, cinque nuovi approfondimenti con fonti primarie e illustrazioni originali. Carte sovrapposte, ciclo automatico continuo al mouse, trascinamento, frecce, accesso da tastiera, touch, movimento ridotto. Articoli nascosti nel markup fino alla selezione di un capitolo; ritorno ai capitoli e collegamenti condivisibili. Cache v43.
