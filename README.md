# polymarket-zonafanta

Reporting e dashboard delle performance dei post Instagram sponsorizzati della
collaborazione **ZonaFanta × Polymarket Italia** (collab estiva).

Questa repo è pensata per essere sviluppata con **Claude Code**. Leggi prima
`TODO.md`: contiene la lista dei task in ordine di dipendenza.

---

## Cosa fa questo progetto

ZonaFanta (community fantacalcio, ~176K follower Instagram) pubblica post
sponsorizzati per Polymarket Italia. Ogni post va tracciato su 4 finestre
temporali (g1 / g3 / g7 / g30) e i dati alimentano una dashboard condivisa
internamente **e** con il cliente (Antonio, referente Polymarket).

Il progetto tiene traccia di due floor contrattuali:

- **Floor singolo:** 100.000 views minime per post (non compensabile tra post)
- **Floor aggregato:** 1.500.000 views totali sui 12 post della collab estiva

Se a fine ciclo un floor non è raggiunto, si aggiungono post fino al 2026-08-30.

---

## Principio architetturale (IMPORTANTE)

Il problema storico di questo progetto era avere **più fonti di verità che
divergevano** (dashboard con dati embedded, `CONTESTO_PROGETTO.md`, `dati.md`
mantenuti a mano in parallelo). Questa repo elimina il problema alla radice:

> **`data/posts.json` è l'UNICA fonte dati editabile.**
> Tutto il resto (dashboard, CONTESTO, dati.md, floor, aggregati) è **generato**
> da `posts.json` via `scripts/build.py`. Non si modificano a mano.

Regola d'oro: **non si inventano MAI numeri.** I dati delle performance li
carica l'utente (screenshot insights Instagram). Se un KPI manca, resta `n/d` —
non si stima. Dati pubblici di contesto (es. follower count) si possono
recuperare dal web citando la fonte.

---

## Struttura repo

```
polymarket-zonafanta/
├── README.md                    questo file
├── TODO.md                      lista task per Claude Code (leggi questo)
├── CONTESTO_PROGETTO.md         OUTPUT generato da build (accordi + floor)
├── data/
│   └── posts.json               UNICA fonte dati editabile
├── dashboard/
│   └── index.html               autonomo, dati iniettati al build
├── skills/                      copie di riferimento delle skill (vedi nota sotto)
├── scripts/
│   ├── build.py                 posts.json -> index.html + .md rigenerati
│   ├── validate.py              ricalcola floor, segnala KPI mancanti, blocca se incoerente
│   └── alert.py                 finestre scadute -> messaggio Telegram
├── docs/
│   ├── COME_AGGIORNARE.md       workflow operativo
│   └── KPI_RULES.md             regole di lettura degli insights
└── .github/workflows/
    ├── deploy.yml               validate + build + deploy Vercel su push
    └── alert.yml                cron giornaliero -> alert Telegram
```

---

## Le skill in `skills/`

Le skill `.md` sono **copie di riferimento versionate**, così Claude Code ha il
contesto in casa. La **fonte operativa viva** resta il progetto Claude: se
modifichi una skill lì, ricordati di aggiornare la copia qui (o accetta che
diverga). Skill rilevanti:

- `zonafanta-polymarket-report` — reporting e dashboard (questo progetto)
- `polymarket-zonafanta` — contenuti editoriali e pitch B2B
- `richiesta-mercato-antonio` — richieste di apertura nuovi mercati Polymarket

---

## Workflow operativo (una volta costruita la repo)

1. Arriva uno screenshot insights di un post → si aggiorna `data/posts.json`
   seguendo `docs/KPI_RULES.md`
2. `python scripts/validate.py` — controlla che i numeri siano coerenti
3. `python scripts/build.py` — rigenera `index.html` (autonomo) + i `.md`
4. push su GitHub → CI valida, builda e deploya su Vercel
5. ogni giorno GitHub Actions gira `alert.py` → se una finestra è scaduta e non
   loggata, arriva un messaggio Telegram che ricorda di caricare gli insights

Dettaglio completo in `docs/COME_AGGIORNARE.md`.

---

## Secrets richiesti (GitHub → Settings → Secrets)

Da configurare a mano prima che alert e deploy funzionino:

- `TELEGRAM_BOT_TOKEN` — dal bot creato con @BotFather
- `TELEGRAM_CHAT_ID` — chat_id dove ricevere gli alert
- `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID` — per il deploy automatico
