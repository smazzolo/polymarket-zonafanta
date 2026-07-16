---
name: zonafanta-polymarket-report
description: >
  Gestisce il reporting e la dashboard delle performance dei post Instagram
  sponsorizzati della collaborazione ZonaFanta × Polymarket Italia. USA QUESTA
  SKILL ogni volta che l'utente: carica uno screenshot insights di un post
  ZonaFanta×Polymarket, chiede di aggiornare i dati delle performance, chiede di
  aggiornare like/commenti/condivisioni, dice "aggiorna la dashboard", "rigenera
  il report", "aggiorna posts.json", "fai il deploy della dashboard", "controlla
  i numeri live", "fai il refresh dei dati pubblici", carica le slide di un post,
  o aggiunge un nuovo post alla collaborazione. Attivare anche per: dashboard
  Polymarket, report ZonaFanta, reach post sponsorizzati, insights Instagram
  collab, finestre 24h/3g/7g/30g, floor 100K/post e 1.5M aggregato, alert
  Telegram insights. NON usare per contenuti editoriali ZonaFanta o pitch
  (quella è la skill polymarket-zonafanta).
---

# ZonaFanta × Polymarket — Report & Dashboard

La skill lavora sulla repo **github.com/smazzolo/polymarket-zonafanta**.
La **fonte di verità unica** è **`data/posts.json`**: tutto il resto — la
dashboard, `CONTESTO_PROGETTO.md`, `dati.md` — è **generato** da
`scripts/build.py` e non si modifica MAI a mano (qualsiasi modifica manuale
agli output viene sovrascritta al build successivo).

## REGOLA D'ORO (non negoziabile)
- **Mai inventare, stimare o proiettare numeri.** Tutti i dati insights (reach,
  views, salvati, dm, sondaggi) arrivano SOLO da screenshot insights caricati
  dall'utente.
- Valore non disponibile = `null` nel JSON → mostrato come `n/d` in dashboard.
  Mai `0` se non è un vero zero letto dallo screen.
- I contatori pubblici (like, commenti, condivisioni) si possono leggere da
  Chrome aprendo il post: quelli sì, li aggiorno io.
- La **reach** è la metrica primaria. Le 4 finestre temporali
  (`g1`/`g3`/`g7`/`g30`) = +24h / +3g / +7g / +30g dalla pubblicazione.
  **Convenzione fissa**: il giorno di pubblicazione è il **giorno 0** →
  la finestra gN scade a `data pubblicazione + N giorni`.

## Accordo corrente — Collab Estiva (floor)
- **12 post totali**, ~1 a settimana.
- **Floor singolo: 100.000 views per post** — non compensabile tra post.
- **Floor aggregato: 1.500.000 views totali** sui 12 post.
- Se a fine ciclo un floor non è raggiunto → post aggiuntivi fino al 30/08/2026.
- I 5 post `collab:"storico"` restano in dashboard come riferimento:
  **esclusi** dai calcoli dei floor estiva.

## Architettura e flusso (com'è fatta davvero)

```
data/posts.json ──► scripts/validate.py ──► scripts/build.py ──► 2 output:
 (UNICA fonte        (cancello: se trova       │
  editabile)          errori, il build         ├─ dashboard/index.html  ← STANDALONE
                      NON parte)               │   zero fetch, funziona da file://,
                                               │   SENZA tracker: è il file da
                                               │   inviare ad Antonio così com'è
                                               └─ CONTESTO_PROGETTO.md + dati.md

push su GitHub ──► CI (GitHub Actions):
  · branch `preview` → preview.yml → deploy Vercel di PREVIEW (url temporaneo)
  · branch `main`    → deploy.yml  → validate+build+deploy in PRODUZIONE
                       (build.py --deploy: standalone + tracker + api/ → Vercel)
```

- **Due versioni, un solo build**: lo standalone resta senza tracker e senza
  fetch; la versione deployata su `polymarket-zonafanta.vercel.app` ha in più
  il **tracker Telegram** (client iniettato + serverless `api/track.js`,
  **in JavaScript** — decisione ferma del 16/7/2026, non riscriverlo in Python).
- **Alert Telegram senza stato** (`scripts/alert.py` + `alert.yml`): 3 girate
  al giorno (9/14/20 ora italiana, doppio cron UTC + check Europe/Rome, immune
  al cambio d'ora). Se una finestra è scaduta e ancora tutta `null` manda UN
  messaggio raggruppato; appena `posts.json` viene aggiornato si spegne da
  solo. Nessuna finestra scoperta = nessun messaggio. Credenziali SOLO da env
  (`TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`), util condivisa in
  `scripts/telegram_util.py`.
- L'auto-deploy Git di Vercel è disattivato da `vercel.json`: si deploya SOLO
  via GitHub Actions.
- Docs nella repo: `docs/SCHEMA_DATI.md` (schema campo per campo),
  `docs/KPI_RULES.md`, `docs/COME_AGGIORNARE.md`, `STATO_PROGETTO.md`.

## Regola KPI: dove si leggono (NON CHIEDERE — CERCA NEL FEED)
Per ogni post l'utente gira DUE screen: la **vista insight** (Panoramica) e la
**vista feed/post**. Ogni KPI ha la sua fonte fissa. **Non chiedere mai
conferma di un valore che sta in uno dei due screen: cercalo prima di chiedere.**

Mappa fonte per KPI (memorizzala, è fissa):
- **reach** (Account raggiunti) → vista insight
- **views** (Visualizzazioni) → vista insight
- **commenti** → numero ufficiale dalla barra azioni (vista insight o feed)
- **salvati** (icona segnalibro) → vista insight
- **condivisioni** → **vista FEED**, icona aereo/aeroplanino nella barra azioni.
  ⚠️ Sulla vista insight la stessa icona significa "Invii in DM": NON confonderle.
- **dm** (Invii in DM) → **vista INSIGHT**, icona aeroplanino.
  Se mostra **"--", il valore è 0 (zero)**, mai n/d. Mai chiedere conferma.
- **sondaggi** → **vista FEED**, riga **"Risposte: N · Visualizza"** sotto la caption.

Regola operativa: condivisioni e sondaggi stanno **sempre nello screen del
feed**. Se un valore sembra mancare, **NON chiedere: rileggi lo screen del
feed**. Si chiede SOLO se manca proprio lo screen, non il numero dentro uno
screen che hai già. **dm e sondaggi sono obbligatori per ogni finestra loggata.**

Coerenza: i contatori sono cumulativi, tra g1→g3→g7→g30 (→overall) non devono
scendere. `validate.py` **blocca** se calano reach o views (errore di
caricamento certo: colonne o finestre invertite); un calo sugli altri KPI è un
avviso da verificare sugli screen, mai da "aggiustare" a mente.

## I tre task della skill

### TASK A — Refresh dati pubblici da Chrome (like/commenti/condivisioni)
1. Apri ogni post con il tool Chrome (url nel campo `url` di ogni post in
   `data/posts.json`).
2. Leggi dalla barra azioni i tre contatori pubblici.
3. Aggiorna il blocco `pubblici` di ogni post con i valori e `aggiornato` =
   data odierna.
4. Valida, rigenera, pubblica (vedi sotto).
NOTA: sono dati PUBBLICI, non insights: in dashboard restano etichettati così.

### TASK B — Inserimento insights guidato (da screenshot)
1. **Identifica il post**: deduci (o chiedi) quale — aiutati con data, mercato,
   titolo (`n`, `titolo`, `mercato.nome`, `data` in `posts.json`).
2. **Identifica la finestra**: g1/g3/g7/g30, deducendo dalla data di
   pubblicazione vs data dello screen (ricorda: pubblicazione = giorno 0).
   Se non è chiara, CHIEDI: mai assegnare a caso.
3. **Estrai i KPI con la mappa fonte fissa.** dm "--" = 0.
4. **Scrivi tutto ciò che è leggibile.** Resta `null` solo ciò che non compare
   in nessuno dei due screen.
5. Aggiorna `insights.<finestra>` del post giusto in `data/posts.json`.
6. Conferma cosa hai inserito e cosa resta `n/d`, poi valida-rigenera-pubblica.

### TASK C — Slide del post (carosello)
Le slide sono **normali file immagine** in `assets/post-NN/` (`01.jpg`,
`02.jpg`… nell'ordine del carosello), elencate nel campo `slides` del post.
Niente base64 nel JSON. Vanno bene gli originali: al build vengono compressi
automaticamente (480px, JPEG q60); gli originali restano come fonte.
Se mancano slide, `validate.py` lo segnala.

## Aggiungere un nuovo post
Nuovo oggetto nell'array `posts` di `data/posts.json` (schema completo in
`docs/SCHEMA_DATI.md`): `n` (progressivo, mai riusato), `titolo`, `tipo`
(`"media"`|`"shot"`), `collab:"estiva"`, `data` (ISO), `url`,
`mercato` = **oggetto** `{nome, url, nota}` (url = link al mercato Polymarket;
nota = quote/volume, testo libero), `slides` (file in `assets/post-NN/`),
`insights` con tutte e 4 le finestre a `null`, `overall: null`,
`pubblici` (da Chrome), `note: null`.
NON esiste più `ultimo_aggiornamento` da aggiornare: la data la mette il build.

## Validare, rigenerare, pubblicare
Dopo OGNI modifica a `data/posts.json`:
```bash
python3 scripts/validate.py     # controlla: se ci sono ERRORI, fermati e correggi
python3 scripts/build.py        # rigenera i 2 output (esegue di nuovo validate)
```
- `dashboard/index.html` è lo standalone da mostrare/inviare ad Antonio.
- Per pubblicare online: commit + push. Su `main` la CI valida, builda e
  deploya in produzione. Per modifiche da verificare prima: push sul branch
  `preview` → URL temporaneo di preview, la produzione non si tocca.
- Presenta sempre la dashboard rigenerata all'utente, desktop E mobile.

## Struttura del JSON (riferimento rapido — dettagli in docs/SCHEMA_DATI.md)
```
meta: { cliente, referente, publisher, canale, profilo_ig, logo(path),
        collab_attiva, ritmo, floor_singolo_views(100000),
        floor_aggregato_views(1500000), post_previsti(12), scadenza }
posts[]: {
  n, titolo, tipo("media"|"shot"), collab("estiva"|"storico"), data(ISO), url,
  mercato: { nome, url, nota },
  slides: ["assets/post-NN/01.jpg", ...],
  insights: { g1|g3|g7|g30: { reach, views, commenti, condivisioni, salvati, dm, sondaggi } },
  overall: null | { ...7 KPI..., aggiornato(ISO) },   ← lettura extra "a oggi"; vince sui calcoli
  pubblici: { like, commenti, condivisioni, aggiornato(ISO) },
  note: null | testo
}
```

## Note importanti
- **Tono cliente**: tutto ciò che finisce in dashboard è per Antonio/Polymarket.
  Asciutto, professionale, niente emoji decorative, niente corporate speak.
- **Calcolo floor**: solo sui post `collab:"estiva"`; il valore "overall" di un
  post = blocco `overall` se presente, altrimenti la finestra più recente
  loggata. Tutti i derivati (floor %, gap, aggregati) li calcola `build.py`:
  non scriverli mai nel JSON, non calcolarli mai nel JavaScript della dashboard.
- Il campo `tipo` ("media"/"shot") è solo descrittivo.
- **Mai toccare a mano**: `dashboard/index.html`, `CONTESTO_PROGETTO.md`,
  `dati.md` (output di build) e i file in `dashboard/src/` salvo richieste
  esplicite di modifica grafica.
- Dubbi aperti sui dati storici: `docs/DATI_MANCANTI.md`.
