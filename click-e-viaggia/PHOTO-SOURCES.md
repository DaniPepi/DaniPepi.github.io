# Fotografie delle destinazioni

Le schede dell'atlante usano fotografie pubblicate su Wikimedia Commons. Il file `data/country-photos.json` riporta, per ogni paese o territorio, l'URL dell'immagine, la pagina originale, l'autore, la licenza e il relativo collegamento. I crediti sono visibili nella finestra del paese.

Le foto sono mostrate mediante collegamenti HTTPS alle immagini originali: non vengono copiate nel service worker né memorizzate dal sito per l'uso offline. La richiesta omette il referrer. Le immagini possono essere ritagliate nella visualizzazione per adattarsi alla scheda, come indicato nei crediti, e conservano le licenze originali.

I banner panoramici sono stati individuati attraverso Wikivoyage; le fotografie sono scelte per il soggetto geografico e la licenza risulta dai metadati del file originale su Commons. Per alcuni territori sono utilizzate fotografie paesaggistiche o satellitari specifiche.

I testi di `data/country-editorial.json` sono descrizioni editoriali originali. Non sostituiscono informazioni ufficiali aggiornate su accessibilità, ingressi o servizi turistici.

