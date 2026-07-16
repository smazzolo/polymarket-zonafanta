---
name: zonafanta-polymarket-report
description: >
  Gestisce il reporting e la dashboard delle performance dei post Instagram
  sponsorizzati della collaborazione ZonaFanta × Polymarket Italia. USA QUESTA
  SKILL ogni volta che l'utente: carica uno screenshot insights di un post
  ZonaFanta×Polymarket, chiede di aggiornare i dati delle performance, chiede di
  aggiornare like/commenti/condivisioni, dice "aggiorna la dashboard", "rigenera
  il report", "aggiorna i dati del post", "controlla i numeri live", "fai il
  refresh dei dati pubblici", carica lo screen-cover di un post, o aggiunge un
  nuovo post alla collaborazione. Attivare anche per: dashboard Polymarket,
  report ZonaFanta, reach post sponsorizzati, insights Instagram collab,
  finestre 24h/3g/7g/30g, floor 100K/post e 1.5M aggregato. NON usare per
  contenuti editoriali ZonaFanta o pitch (quella è la skill polymarket-zonafanta).
---

# ZonaFanta × Polymarket — Report & Dashboard

Questa skill mantiene la dashboard performance della collaborazione ZonaFanta × Polymarket.
La **fonte di verità unica** è `assets/dati.json`. La dashboard HTML è solo una vista
generata da quel file. Non si modifica mai l'HTML a mano: si aggiorna il JSON e si rigenera.

## REGOLA D'ORO (non negoziabile)
- **Mai inventare, stimare o proiettare numeri.** Tutti i dati insights (reach, views,
  salvati, dm, sondaggi) arrivano SOLO da screenshot insights caricati dall'utente.
- Valore non disponibile = `null` nel JSON → mostrato come `n/d` in dashboard.
- I contatori pubblici (like, commenti, condivisioni) si possono leggere da Chrome
  aprendo il post: quelli sì, li aggiorno io.
- La **reach** è la metrica primaria. Le 4 finestre temporali (`g1`/`g3`/`g7`/`g30`)
  corrispondono a +24h / +3 giorni / +7 giorni / +30 giorni dalla pubblicazione.

## Accordo corrente — Collab Estiva (floor)
- **12 post totali**, ~1 a settimana, fino al 31/08/2026.
- **Floor singolo: 100.000 views per post** — non compensabile tra post, ogni post deve
  raggiungerlo indipendentemente.
- **Floor aggregato: 1.500.000 views totali** sui 12 post.
- Se a fine ciclo uno dei due floor non è raggiunto → si aggiungono post fino a fine
  agosto per chiudere il gap.
- I 5 post della collab precedente (`collab:"storico"`) restano in dashboard solo come
  riferimento storico: **esclusi** dai calcoli dei floor estiva.

## Regola KPI: dove si leggono (NON CHIEDERE — CERCA NEL FEED)
Per ogni post l'utente gira DUE screen: la **vista insight** (Panoramica) e la **vista
feed/post**. Ogni KPI ha la sua fonte fissa. **Non chiedere mai conferma di un valore che
sta in uno dei due screen: cercalo prima di chiedere.** Chiedere un dato già presente
negli screen è un errore.

Mappa fonte per KPI (memorizzala, è fissa):
- **reach** (Account raggiunti) → vista insight
- **views** (Visualizzazioni) → vista insight
- **commenti** → numero ufficiale dalla barra azioni (vista insight o feed)
- **salvati** (icona segnalibro) → vista insight
- **condivisioni** → **vista FEED**, icona aereo/aeroplanino nella barra azioni del post.
  ⚠️ Sulla vista insight la stessa icona aereo significa "Invii in DM": NON confonderle.
- **dm** (Invii in DM) → **vista INSIGHT**, icona aeroplanino.
  Se mostra **"--", il valore è 0 (zero)**, mai n/d. Mai chiedere conferma.
- **sondaggi** (Risposte ai sondaggi) → **vista FEED**, riga **"Risposte: N · Visualizza"**
  sotto la caption. Quel numero È il valore sondaggi del post. Leggilo da lì.

Regola operativa: condivisioni e sondaggi stanno **sempre nello screen del feed**.
Se un valore sembra mancare, **NON chiedere: rileggi lo screen del feed** (icona aereo per
condivisioni, riga "Risposte: N" per sondaggi). Si chiede SOLO se manca proprio lo screen
del feed, non se manca il numero dentro uno screen che hai già.

## I tre task della skill

### TASK A — Refresh dati pubblici da Chrome (like/commenti/condivisioni)
Quando l'utente chiede di aggiornare i numeri live / pubblici:
1. Apri ogni post con il tool Chrome (`navigate` all'url del post, poi `screenshot`).
   Gli url sono nel campo `url` di ogni post in `dati.json`.
2. Leggi dalla barra azioni del post i tre contatori pubblici: like, commenti, condivisioni.
3. Aggiorna nel JSON, per ogni post, il blocco `pubblici` con i nuovi valori e metti
   `aggiornato` alla data odierna.
4. Rigenera la dashboard (vedi "Rigenerare").
NOTA: questi sono dati PUBBLICI, non insights. In dashboard restano etichettati come tali.

### TASK B — Inserimento insights guidato (da screenshot)
Quando l'utente carica uno screenshot insights di un post:
1. **Identifica il post**: chiedi (o deduci) di QUALE post si tratta. Aiutati con la data,
   il mercato, o il titolo. In `dati.json` ogni post ha `n`, `titolo`, `mercato`, `data`.
2. **Identifica la finestra**: chiedi (o deduci dalla data di pubblicazione vs oggi) se lo
   snapshot è +24h (`g1`), +3g (`g3`), +7g (`g7`) o +30g (`g30`).
   - Se la data dello screen non è chiara, CHIEDI. Non assegnare a caso.
3. **Estrai i KPI usando la mappa fonte fissa** (vedi "Regola KPI: dove si leggono").
   In sintesi: reach/views/salvati/dm dalla vista insight; condivisioni e sondaggi dalla
   vista feed (icona aereo = condivisioni; riga "Risposte: N" = sondaggi). dm "--" = 0.
   **Non chiedere un valore che è in uno dei due screen: cercalo.**
4. **Scrivi tutto ciò che è leggibile dai due screen.** Resta `null` solo ciò che non
   compare in nessuno dei due. Non riempire a stima. Non chiedere conferma di valori già
   presenti negli screen.
5. Aggiorna nel JSON il blocco `insights.<finestra>` del post giusto.
6. Conferma all'utente cosa hai inserito e cosa è rimasto `n/d`, poi rigenera.

### TASK C — Cover reale del post (sostituire il mockup)
Quando l'utente carica lo screen-cover (la copertina/prima slide) di un post:
1. Identifica il post (come Task B).
2. Converti l'immagine in base64 (data URI) e scrivila nel campo `cover_base64` del post.
   Formato: `"data:image/png;base64,XXXX"` (o image/jpeg). Usa lo script
   `scripts/embed_cover.py <dati.json> <n_post> <path_immagine>` se utile.
3. Rigenera. Il template usa `cover_base64` se presente, altrimenti disegna il mockup SVG.

## Aggiungere un nuovo post alla collaborazione
Inserisci un nuovo oggetto nell'array `posts` di `dati.json`, copiando la struttura di un
post esistente. Campi: `n` (numero progressivo), `tipo` (`"media"` o `"shot"`), `data`
(ISO `YYYY-MM-DD`), `titolo`, `mercato`, `url`, `cover_base64` (`null` all'inizio),
`pubblici` (leggi da Chrome), `insights` (tutte e 4 le finestre a `null`).
Aggiorna `meta.ultimo_aggiornamento`. Poi rigenera.

## Rigenerare la dashboard
Dopo OGNI modifica al JSON:
```bash
cd scripts && python build_dashboard.py
```
Genera `assets/dashboard.html` (singolo file standalone, dati embeddati, deployabile su
Vercel). Poi presenta il file all'utente con `present_files`.
**Dopo ogni rigenerazione consegna SEMPRE entrambe le preview, desktop e mobile** (stesso
file, CSS responsive). Mai saltare la preview mobile.

## Struttura del JSON (riferimento)
```
meta: { cliente, referente, publisher, canale, ultimo_aggiornamento,
        floor_post_views(100000), floor_aggregato_views(1500000), n_post_previsti(12),
        scadenza, collab_attiva, nota_metrica_primaria }
posts[]: {
  n, tipo("media"|"shot"), collab("estiva"|"storico"), data(ISO), titolo, mercato, url,
  cover_base64(null|dataURI),
  pubblici: { like, commenti, condivisioni, aggiornato(ISO) },
  insights: { g1|g3|g7|g30: { reach, views, commenti, condivisioni, salvati, dm, sondaggi } }
}
```

## Note importanti
- **Tono cliente**: tutto ciò che finisce in dashboard è per Antonio/Polymarket. Asciutto,
  professionale, niente emoji decorative, niente corporate speak.
- **Calcolo floor**: i floor (100K/post + 1.5M aggregato) si calcolano SOLO sui post
  `collab:"estiva"`. I 5 post `collab:"storico"` restano visibili come riferimento ma
  sono esclusi dai conteggi. Il campo `tipo` ("media"/"shot") è solo descrittivo, non
  cambia il calcolo dei floor.
- **Replicabilità futura**: la struttura è pensata per essere riusata con altri clienti
  cambiando `meta` e `posts`. Non astrarre oltre finché non serve.
- Aggiorna sempre `meta.ultimo_aggiornamento` a ogni intervento.
