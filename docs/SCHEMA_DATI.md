# Schema di `data/posts.json`

`data/posts.json` è l'**unica fonte dati editabile** del progetto. Tutto il resto
(dashboard, `CONTESTO_PROGETTO.md`, `dati.md`) viene generato da
`scripts/build.py` e non si tocca a mano.

Regola d'oro: **un dato che non conosci è `null`, mai `0`.** `0` significa
"misurato: zero". Il build renderizza `null` come `n/d`.
Unica eccezione (da `KPI_RULES.md`): se negli insights l'aeroplanino mostra
`--`, allora `dm` è davvero `0`.

---

## Struttura generale

```json
{
  "meta":  { ... },
  "posts": [ { ... }, { ... } ]
}
```

## Blocco `meta` — dati contrattuali

| campo                   | tipo    | note                                            |
|-------------------------|---------|-------------------------------------------------|
| `cliente`               | stringa | "Polymarket Italia"                             |
| `referente`             | stringa | referente lato cliente                          |
| `publisher`             | stringa | "ZonaFanta"                                     |
| `canale`                | stringa | es. "Instagram - post a feed"                   |
| `logo`                  | stringa | percorso file in `assets/` (mai base64)         |
| `floor_singolo_views`   | intero  | floor per singolo post (100000)                 |
| `floor_aggregato_views` | intero  | floor aggregato collab estiva (1500000)         |
| `post_previsti`         | intero  | n. post della collab estiva (12)                |
| `scadenza`              | data    | `YYYY-MM-DD` — termine per i post di recupero   |

## Ogni elemento di `posts`

```json
{
  "n": 9,
  "titolo": "Il Marocco vince ai rigori, ...",
  "tipo": "carosello",
  "collab": "estiva",
  "data": "2026-06-30",
  "url": "https://www.instagram.com/p/XXXX/",
  "mercato": {
    "nome": "World Cup Winner",
    "url": null,
    "nota": "Marocco 4% · era 2% · vol. $3,5B"
  },
  "slides": ["assets/post-09/01.jpg", "assets/post-09/02.jpg"],
  "insights": {
    "g1":  { "reach": 41588, "views": 105490, "commenti": 28, "condivisioni": 5, "salvati": 16, "dm": 212, "sondaggi": 115 },
    "g3":  { "reach": null, "views": null, "commenti": null, "condivisioni": null, "salvati": null, "dm": null, "sondaggi": null },
    "g7":  { "reach": null, "views": null, "commenti": null, "condivisioni": null, "salvati": null, "dm": null, "sondaggi": null },
    "g30": { "reach": null, "views": null, "commenti": null, "condivisioni": null, "salvati": null, "dm": null, "sondaggi": null }
  },
  "overall": null,
  "pubblici": { "like": 1793, "commenti": 28, "condivisioni": 4, "aggiornato": "2026-07-15" },
  "note": null
}
```

| campo      | tipo             | note                                                                 |
|------------|------------------|----------------------------------------------------------------------|
| `n`        | intero           | ID univoco del post (progressivo, mai riusato)                       |
| `titolo`   | stringa          | titolo/hook del post                                                 |
| `tipo`     | stringa          | formato del post (es. `carosello`, `media`)                          |
| `collab`   | enum             | `"estiva"` oppure `"storico"` — gli `storico` sono esclusi dai floor |
| `data`     | data             | pubblicazione, `YYYY-MM-DD` (serve ad alert e validate)              |
| `url`      | stringa \| null  | link al post Instagram                                               |
| `mercato`  | oggetto          | `nome` (stringa), `url` (link Polymarket \| null), `nota` (testo libero: quote/volume \| null) |
| `slides`   | array di stringhe| percorsi delle slide in `assets/post-NN/`, in ordine; `[]` se mancano |
| `insights` | oggetto          | sempre tutte e 4 le finestre `g1`/`g3`/`g7`/`g30`, ognuna con tutti e 7 i KPI |
| `overall`  | oggetto \| null  | lettura extra "a oggi", fuori dalle finestre: i 7 KPI + `aggiornato` (data lettura, obbligatoria se il blocco esiste). `null` se non c'è. Quando presente, per i calcoli vince sulle finestre |
| `pubblici` | oggetto \| null  | dati visibili pubblicamente sul post: `like`, `commenti`, `condivisioni`, `aggiornato` (data lettura) |
| `note`     | stringa \| null  | annotazioni libere (repost, boost, anomalie note)                    |

### I 7 KPI di ogni finestra

`reach` (metrica primaria), `views`, `commenti`, `condivisioni`, `salvati`,
`dm`, `sondaggi`. Tutti interi o `null`.

---

## Convenzioni che tengono in piedi la baracca

1. **Le 4 finestre sono sempre tutte presenti**, anche se interamente `null`:
   una finestra non ancora loggata è una finestra con tutti i KPI `null`.
   Niente chiavi opzionali → niente logica fragile.
2. **Finestra "loggata"** = almeno un KPI non `null`. Non esiste un flag
   separato: è derivato, quindi non può divergere dai dati.
3. **I cumulativi non calano**: nessun contatore dovrebbe diminuire tra
   finestre successive g1→g3→g7→g30, né tra l'ultima finestra loggata e
   `overall`. `validate.py` **blocca il build** se calano `reach` o `views`
   (impossibile, è per forza un errore di caricamento); per gli altri KPI
   (`salvati`, `condivisioni`, `commenti`, `dm`, `sondaggi`) un calo è solo
   **segnalato come avviso**, perché può essere legittimo (es. un salvataggio
   rimosso dall'utente) — ma va comunque verificato, mai corretto in silenzio.
4. **Niente valori derivati nel file**: totali, floor %, gap, medie, numerazione
   interna alla collab — tutto calcolato da `build.py`. Se non è un dato
   primario, non vive qui.
5. **Niente immagini nel JSON**: solo percorsi verso `assets/`. Le versioni
   compresse per la dashboard le produce il build (Pillow, 480px lato lungo,
   JPEG qualità 60); gli originali restano in `assets/` come fonte.
6. **Date sempre `YYYY-MM-DD`.**
7. **Conteggio finestre (convenzione fissata il 15/7/2026):** il giorno di
   pubblicazione è il **giorno 0**; la finestra `gN` scade a
   `data pubblicazione + N giorni`. Esempio: post pubblicato il 16/6 → g30
   scade il 16/7. `validate.py` e `alert.py` usano identica convenzione.
