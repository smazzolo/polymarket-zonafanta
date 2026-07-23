# COME AGGIORNARE — il ciclo operativo completo

Dallo screenshot insights alla dashboard pubblicata, in 4 passi.
Non serve essere tecnici: si edita UN file e si lanciano DUE comandi
(anzi uno: il secondo lancia anche il primo).

```
screen insights → data/posts.json → validate.py → build.py → push → deploy
                  (l'unico file      controlla     rigenera    (automatico)
                   che si tocca)     i numeri      tutto
```

---

## Passo 1 — Arriva uno screenshot insights

Apri `data/posts.json` con un editor di testo qualsiasi. È l'**unico file
che si modifica a mano**: dashboard, `CONTESTO_PROGETTO.md` e `dati.md` si
rigenerano da soli e qualsiasi modifica manuale lì viene sovrascritta.

1. Trova il post (campo `"n"` o `"titolo"`).
2. Individua la finestra giusta: `g1` (+24h), `g3`, `g7`, `g30`.
   Convenzione: il giorno di pubblicazione è il giorno 0 → la finestra g7 di
   un post pubblicato il 1° del mese si legge l'8.
3. Sostituisci i `null` con i numeri letti dallo screen, seguendo
   **`KPI_RULES.md`** (dove si legge ogni KPI, la regola del "--" per i DM,
   dm e sondaggi sempre obbligatori).
4. Quello che non si legge resta `null`. **Mai stimare, mai mettere 0 se
   non è un vero zero.**

Attenzione alle virgole: ogni valore è separato da virgola, l'ultimo di un
blocco non ce l'ha. (Se sbagli non succede niente di grave: il passo 2 ti
blocca e ti dice dov'è l'errore.)

### Se il post è nuovo

- Copia un post esistente dentro l'array `"posts"` e compila i campi:
  `n` nuovo (progressivo, mai riusato), `titolo`, `tipo`, `collab: "estiva"`,
  `data` (YYYY-MM-DD), `url` del post, `mercato` (nome + url Polymarket + nota
  quote), tutte le finestre a `null`, `overall: null`, `note: null`.
- Metti le slide del carosello in una cartella nuova `assets/post-NN/`
  (file `01.jpg`, `02.jpg`, … nell'ordine del carosello) ed elencale nel
  campo `"slides"`. Vanno bene le immagini originali: al build vengono
  compresse automaticamente, gli originali restano lì come fonte.

## Passo 2 — Controllo: `validate.py`

Dal Terminale, nella cartella del progetto:

```
python3 scripts/validate.py
```

- **ERRORI** (❌): qualcosa non torna davvero — virgola saltata, reach che
  scende tra finestre, slide inesistente… Il messaggio dice post e campo
  esatti. Correggi e rilancia. Finché ci sono errori il build si rifiuta
  di partire: è impossibile pubblicare una dashboard rotta.
- **AVVISI** (⚠): promemoria non bloccanti (finestre scadute ancora vuote,
  KPI mancanti, url mercato da aggiungere). Il report floor in fondo mostra
  a che punto siamo con i 100K/post e con 1,5M aggregato.

## Passo 3 — Rigenera: `build.py`

```
python3 scripts/build.py
```

Esegue da solo anche la validazione del passo 2, poi rigenera i **due
output**:

- `dashboard/index.html` — la dashboard completa in un file unico: si apre
  con doppio click, si può inviare ad Antonio così com'è.
- `CONTESTO_PROGETTO.md` + `dati.md` — i riepiloghi testuali.

Aprila e controlla a occhio che i numeri nuovi ci siano.

## Passo 4 — Pubblica

```
git add -A
git commit -m "insights g7 post 13"
git push
```

Col push su GitHub la CI rifà validate + build e deploya su Vercel
(Fase 5; finché non è attiva, il deploy va fatto a mano da Vercel).
Ogni giorno un controllo automatico (Fase 4) manda un promemoria Telegram
diviso in **DA FOTOGRAFARE ORA** (finestre scadute e vuote) e **PROSSIME FOTO**
(quelle future, con il countdown "tra N giorni"): si spegne da solo appena
aggiorni `posts.json`.

### Finestre perse (Instagram non le mostra più)

Quando una finestra scade senza che tu sia riuscito a fotografarla e non è più
recuperabile (Instagram mostra solo il totale corrente, non lo storico gN),
marcala in `meta.irrecuperabili` così l'alert smette di reclamarla:

```json
"irrecuperabili": ["10:g3", "11:g3", "12:g3"]
```

Formato `"n:finestra"`. Quelle voci spariscono da "DA FOTOGRAFARE ORA" e finiscono
in un footer muto ("♻️ Perse"). `validate.py` controlla che la voce punti a un
post esistente e a una finestra **ancora vuota** (se la finestra ha dati, il flag
va tolto).

---

## Errori tipici e come riconoscerli

| sintomo | causa | rimedio |
|---|---|---|
| `non è JSON valido: line X` | virgola/parentesi sbagliata vicino alla riga X | sistema la punteggiatura |
| `reach cala g3→g7` | numeri invertiti tra finestre o colonne | ricontrolla lo screen |
| `slide non trovata su disco` | percorso in `"slides"` che non corrisponde al file | controlla nome cartella/file |
| `campo sconosciuto` | refuso nel nome di un campo | confronta con `SCHEMA_DATI.md` |
| la dashboard non mostra i dati nuovi | build non rilanciato | `python3 scripts/build.py` |

Requisiti macchina (una tantum): Python 3 e la libreria Pillow
(`pip3 install Pillow`) per la compressione immagini.
