# DATI MANCANTI — audit della migrazione (15 luglio 2026)

Fotografia dei buchi e dei dubbi emersi migrando i dati in `data/posts.json`.
È un documento **una tantum**: i controlli meccanici (finestre scadute,
cumulativi che calano, KPI obbligatori) vivono in `scripts/validate.py` e si
rifanno ad ogni build; qui c'è il giudizio umano sulla migrazione.

**Fonti confrontate:**

1. **Primaria:** JSON embedded nell'`index.html` della repo (live, ultimo
   aggiornamento dichiarato 2026-07-15) → 12 post.
2. **Secondaria:** `dati.json` del vecchio progetto
   (`~/Documents/Claude/Dashboard PolyMarket/dati.json`, letture al 2026-06-08)
   → i 5 post `storico`. Confermato dall'utente come seconda fonte corretta e
   più affidabile per gli storico. *(Il `dati.md` del progetto Claude non è
   visibile da qui: se diverge da questo `dati.json`, va segnalato a parte.)*

---

## STATO — decisioni del 15/7/2026

| # | punto | esito |
|---|---|---|
| A1 | overall storico fotocopiati vs letture reali 8/6 | ✅ **RISOLTO** (parz.: n2/n5 aperti, vedi A8) |
| A2 | inversione dm/condivisioni g7 post 6 e 7 | ✅ applicato, ⏳ **da confermare su screen** |
| A3 | overall post 6 spurio | ✅ **RISOLTO**: eliminato |
| A4 | post 5 g1: dm/sondaggi sospetti | ⏳ **APERTO** — verifica su screenshot |
| A5 | cali minori nei contatori | ⏳ **APERTO** — non bloccante, chiude l'utente sugli screen |
| A6 | data letture overall: 8/6 vs 18/6 | ✅ risolto con evidenza, conferma finale all'utente (vedi A7) |
| A7 | g30 post 6 anticipata | ✅ **RISOLTO**: chiude il 15/7, dato buono |

---

## A — Risolto (cosa è stato applicato a `posts.json`)

### A1. Overall dei post storico → adottate le letture reali dell'8/6 (n1, n3, n4)

I blocchi `overall` del live erano copie fotocopiate dell'ultima finestra
loggata. Sostituiti con le letture reali del vecchio `dati.json`:

- **n1**: come g30 + `sondaggi 1637` (il live l'aveva perso). `aggiornato: 2026-06-08`
- **n3**: reach 112648 · views 239146 · salvati 88 (tutti > g7 ✓). `aggiornato: 2026-06-08`
- **n4**: reach 65948 · views 152041 (> g7 ✓). `aggiornato: 2026-06-08`
- **n2, n5**: lettura old NON valida come overall (vedi A8) → `overall: null`
  (rimossa la fotocopia, nessun dato reale perso).

### A2. Post 6 e 7, g7: dm e condivisioni invertiti → corretti (provvisorio)

Applicato: n6 g7 `dm: 859`, `condivisioni: n/d` · n7 g7 `dm: 162`,
`condivisioni: n/d`. Le sequenze dm ora tornano (n6: 747→859→904).
Nessuno screenshot g7 di questi post esiste nella vecchia repo screenshot
(copre solo n1–n5). ⏳ **Da confermare su screen quando disponibili**; se lo
screen mostra le condivisioni vere di g7, inserirle.

### A3. Overall post 6 eliminato

Era un collage (metriche g3 + dm/sondaggi g1), inferiore alla g30 loggata.
La g30 chiude il 15/7 ed è il dato buono. `overall: null`.

### A6→ Data delle letture overall storico: è l'8 giugno

La cartella screenshot del vecchio progetto si chiama **"Overall ad Oggi
(8:06)"** e ogni lettura nel vecchio `dati.json` è timbrata `2026-06-08`:
l'evidenza dice 8/6. Il `data_overall: 2026-06-18` del meta live si riferisce
evidentemente ad altro (o è sbagliato). Applicato `aggiornato: 2026-06-08`.
⏳ *Conferma finale dell'utente richiesta, perché a voce era stato detto 18/6.*

---

## B — DA CHIARIRE (ancora aperto)

### A4. Post 5, finestra g1: `dm = 36` e `sondaggi = 154` sospetti — NON toccati

Coincidono esattamente con la lettura dell'8/6 (giorno 4 dalla pubblicazione)
del vecchio `dati.json`: probabile archiviazione nella finestra sbagliata.
Inoltre g1 ha commenti/condivisioni/salvati `n/d` ma dm/sondaggi valorizzati:
pattern anomalo. **In attesa degli screenshot dall'utente.** I valori restano
in `posts.json` come nel live.

### A5. Cali nei contatori cumulativi — segnalati, non corretti

| post | KPI | calo | possibile spiegazione |
|---|---|---|---|
| n2 | condivisioni | g3→g7: 11 → 10 | riconteggio IG o refuso |
| n2 | salvati | g3→g7: 84 → 82 | salvataggi rimossi dagli utenti (plausibile) o refuso |
| n7 | condivisioni | g1→g3: 9 → 8 | idem |
| n9 | condivisioni | g1→g3: 5 → 4 | idem |
| n9 | sondaggi | g3→g7: 121 → 115 | g1 = 115: il g7 sembra ricopiato da g1 |

Non bloccanti: `validate.py` li segnala come avvisi ad ogni build finché non
vengono chiusi sugli screen.

### A8. Post 2 e 5: la lettura old non può fare da overall — e n2 nasconde un pasticcio

- **n2**: la lettura old è dell'8/6 ma la finestra g30 chiudeva l'11/6 → non è
  "più recente di g30". In più è quasi identica alla g30 live (reach uguale,
  **views 172765 vs 172775**: 10 di differenza, un refuso da qualche parte) —
  il sospetto è che la g30 live SIA la lettura dell'8/6 (giorno 27) archiviata
  come g30. La lettura old ha però `dm 555` e `sondaggi 501` che la g30 live
  non ha. **Da decidere sugli screen:** quale views è giusta, e se dm/sondaggi
  dell'8/6 possono integrare la g30.
- **n5**: lettura old = giorno 4, sotto la g7 → inutilizzabile come overall.
  Collegata ad A4 (è probabilmente la fonte dei dm/sondaggi finiti in g1).

### A9. Post 14 (Como 4% Scudetto, 15/8): prima lettura fuori finestra + repost 6 vs 7

Aggiunto il 17/8/2026 dagli screen in `~/Downloads/post poly 15:08`.

- **Finestra**: pubblicazione 15/8 alle 12:45 (orario decodificato dallo
  shortcode IG, verificato sul post 13). Gli screen sono del 17/8 ~10:57 →
  ~46h dopo, cioè **oltre la g1** (scaduta il 16/8) e prima della g3 (18/8).
  Scelta applicata: lettura messa nel blocco `overall` (aggiornato 17/8),
  `g1` lasciata vuota e marcata `14:g1` in `meta.irrecuperabili`.
  **Da decidere (utente):** se la si vuole considerare "la g1" va spostata da
  `overall` a `insights.g1` e tolto il flag — un minuto di lavoro.
- **Repost (condivisioni)**: nel feed l'icona ↻ segnava **6**, nello screen
  insight (1 minuto dopo) **7**. Tenuto 6 (KPI_RULES: si legge dal post).
  Se al prossimo screen il feed dice ≥7, aggiornare.
- **Etichetta box insight**: entrambi i box del riepilogo erano etichettati
  "Visualizzazioni" (glitch IG). Letto per posizione come in tutti gli screen
  precedenti: sinistra = views 183.977, destra = reach 82.344 (rapporto 2,2×
  coerente con gli altri post). ⚠️ **Rimesso in dubbio il 17/8 pomeriggio**:
  vedi A10 — sugli screen degli altri post lo stesso box NON è la reach.
  **Chiuso il 17/8 sera dall'utente: il box destro È la reach**, 82.344 confermato.
- Slide: in cartella 6 file (`6s_` compreso), i pallini del carosello nello
  screen sono 5 con gli ultimi due rimpiccioliti (= più di 5 slide) → caricate
  tutte e 6.

### A10. Box "Visualizzazioni" di destra negli insight (17/8): è la reach — RISOLTO dall'utente, ma la reach IG cala

Screen del 17/8 ore 16:43–16:46 (`~/Downloads/Nuova cartella con elementi 2`,
IMG_9161–9170) dei post 9, 10, 11, 12, 13. In tutti il riepilogo insight
mostra due box entrambi etichettati "Visualizzazioni" (il 27/7 il box di
destra si chiamava "Account raggiunti"). Il valore di destra confrontato con
l'ultima reach nota:

| post | box destra 17/8 | ultima reach nota | delta |
|---|---|---|---|
| n9 | 20.604 | 47.071 (27/7) | −56% ← impossibile per una reach |
| n10 | 56.210 | 59.173 (g7) | −5% |
| n11 | 74.310 | 76.766 (g7) | −3% |
| n12 | 56.051 | 53.486 (g7) | +5% |
| n13 | 103.173 | 103.845 (g7) | −0,6% |
| n14 (mattina) | 82.344 | — | caricato come reach in A9 |

**Decisione utente (17/8 sera): il box destro è la reach**, come sempre (letto
per posizione, vedi KPI_RULES). Valori caricati in g30 di n9/n10/n11/n12 e
overall di n13; n14 82.344 confermato. Conseguenza: la reach IG **può calare**
nel tempo (ricalcolo lato IG) → `validate.py` non la tratta più come errore
bloccante ma come avviso (solo le views restano bloccanti). Il calo di n9
(−56%) resta anomalo e va tenuto d'occhio al prossimo screen.

---

## C — BUCHI da riempire a mano (dato mancante = `n/d`, mai inventato)

### C1. Finestre scadute e NON loggate (7 KPI tutti n/d)

| post | pub | finestra | scaduta il |
|---|---|---|---|
| n3 | 18/5 | g30 | 17/6 |
| n4 | 25/5 | g30 | 24/6 |
| n5 | 4/6 | g30 | 4/7 |
| n10 | 1/7 | g3 | 4/7 |
| n11 | 6/7 | g3 | 9/7 |

### C2. Finestre scadute ma INCOMPLETE (KPI singoli mancanti)

| post | finestra | KPI mancanti |
|---|---|---|
| n1 | g1, g3 | dm, sondaggi |
| n1 | g30 | sondaggi |
| n2 | g1 | dm, sondaggi |
| n2 | g30 | dm, sondaggi (vedi A8) |
| n4 | g1 | dm, sondaggi |
| n5 | g1 | commenti, condivisioni, salvati (vedi A4) |
| n5 | g3 | dm, sondaggi |
| n5 | g7 | dm |
| n6 | g3 | dm, sondaggi |
| n6 | g7 | condivisioni (vedi A2) |
| n7 | g7 | condivisioni (vedi A2) |
| n10 | g1, g7 | condivisioni |
| n11 | g1, g7 | condivisioni |
| n12 | g1 | condivisioni |

Nota KPI_RULES: `dm` e `sondaggi` sono obbligatori per ogni finestra — i buchi
qui sopra andrebbero recuperati dagli screenshot se esistono ancora.

### C3. URL mercato Polymarket: manca per TUTTI i 12 post

Lo schema nuovo ha `mercato.url`: è `null` ovunque. Il vecchio formato non lo
prevedeva. Da recuperare da Polymarket per (almeno) i post `estiva`.

### C4. Slide probabilmente incomplete

| post | tipo | slide presenti | sospetto |
|---|---|---|---|
| n10 | media | 1 | gli altri `media` hanno 3–9 slide: carosello monco? |
| n11 | media | 1 | idem |
| n12 | media | 1 | idem |

(n1 ha 1 slide ma è `tipo: shot` → plausibile.)

### C5. Dati pubblici (like/commenti/condivisioni) vecchi

`pubblici.aggiornato`: n1–n5 fermi all'**8/6**, n6–n7 al 30/6, n8 all'1/7.
Solo n9–n12 sono freschi (15/7).

### C6. Minori

- **n12** titolo "Semifinaliste Mondiale" — molto più corto degli altri:
  placeholder da completare?

---

## D — Cosa ha fatto la migrazione (trasformazioni meccaniche)

- 12 post migrati dal live in `data/posts.json`, ordinati per `n`.
- 47 slide + logo estratti dal base64 → file in `assets/post-NN/`, `assets/logo.png`.
- `mercato` stringa → oggetto `{nome, url, nota}`: la parte tra parentesi
  (quote/volume) in `nota`, testo invariato.
- `n_collab` eliminato: derivabile al 100% da `n` + `collab`.
- `tipo` mantenuto (`shot` | `media`): non derivabile dalle slide.
- `meta`: tenuti `profilo_ig`, `ritmo`, `collab_attiva`; eliminati
  `ultimo_aggiornamento` (derivato) e `data_overall` (vedi A6).
- Correzioni del 15/7 (sezione A) applicate su decisione dell'utente; tutto il
  resto è rimasto come nel live, anomalie incluse (sezioni B e C).
