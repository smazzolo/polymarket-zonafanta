# TODO — sviluppo repo con Claude Code

Lista task in ordine di dipendenza. Fai una fase alla volta e verifica prima di
passare alla successiva. Prima di iniziare, leggi `README.md` (in particolare la
sezione "Principio architetturale": `data/posts.json` è l'unica fonte dati, tutto
il resto è generato).

Vincoli non negoziabili validi per ogni fase:
- Non inventare, stimare o proiettare numeri. Dato mancante = `n/d`.
- La dashboard resta un file autonomo che funziona anche aperto in locale.
- La dashboard deve restare responsive: desktop + mobile.
- I `.md` (`CONTESTO_PROGETTO.md`, `dati.md`) sono OUTPUT del build, non input.

---

## Fase 1 — Fondamenta dati

- [ ] **1.1** Definire lo schema di `data/posts.json`. Per ogni post: numero,
      titolo, data pubblicazione, tag `collab` (`estiva` | `storico`), mercato
      Polymarket di riferimento, url del post. Per ogni finestra temporale
      (`g1`, `g3`, `g7`, `g30`): reach, views, commenti, condivisioni, salvati,
      dm, sondaggi. Includere un blocco `meta` (cliente, referente, publisher,
      canale, floor singolo, floor aggregato, n. post previsti, scadenza).
      Campo assente/non noto = `null` (mai 0 se non è realmente 0).

- [ ] **1.2** Migrare i dati esistenti dentro `data/posts.json`: prendere come
      fonte il JSON embedded nell'`index.html` live e `dati.md`. Se i due
      divergono, segnalarlo e NON scegliere in autonomia: chiedere quale sia
      corretto. I 5 post `storico` vanno importati ma esclusi dai calcoli floor.

- [ ] **1.3** Scrivere `scripts/validate.py`. Deve:
      - ricalcolare il floor aggregato (somma views overall dei post `estiva`,
        dove "overall" = finestra insight più recente disponibile per post)
      - verificare il floor singolo 100K per ogni post `estiva`
      - elencare i KPI `n/d` sulle finestre già scadute (che dovrebbero essere
        loggate ma non lo sono)
      - uscire con exit code ≠ 0 se trova incoerenze bloccanti

- [ ] **1.4** Scrivere `scripts/build.py`. Da `data/posts.json`:
      - calcola valori derivati (floor aggregato %, gap verso 1.5M, aggregati
        reach/views per finestra, reach media per post)
      - inietta i dati in `dashboard/index.html` (vedi Fase 2)
      - rigenera `CONTESTO_PROGETTO.md` e `dati.md` come output

---

## Fase 2 — Dashboard

- [ ] **2.1** Refactor `dashboard/index.html`: rimuovere i dati embedded a mano;
      i dati arrivano dal build (`build.py` li inietta in un blocco
      `<script id="data" type="application/json">`). Il file resta autonomo:
      deve funzionare anche aperto da `file://`, senza fetch esterni.

- [ ] **2.2** Vista aggregata in alto: reach totale + reach media/post
      segmentate per finestra (g1/g3/g7/g30), più progress verso il floor
      (aggregato 1.5M e singolo 100K). Questa è la sezione più importante.

- [ ] **2.3** Scheda per ogni post: tutti i KPI nelle 4 finestre, con mercato
      Polymarket e link al post. Verificare rendering desktop (1440×900) e
      mobile (390×844).

---

## Fase 3 — Skill e documentazione

- [ ] **3.1** Copiare in `skills/` le 3 skill rilevanti
      (`zonafanta-polymarket-report`, `polymarket-zonafanta`,
      `richiesta-mercato-antonio`). Nel README di `skills/` scrivere che sono
      copie di riferimento e che la fonte viva è il progetto Claude.

- [ ] **3.2** Scrivere `docs/KPI_RULES.md` con le regole di lettura insights:
      - Condivisioni = icona aeroplanino nella action bar del post
      - Sondaggi = riga "Risposte: N · Visualizza" sotto la caption
      - Se l'aeroplanino negli insights mostra "--" → DM = 0 (non n/d)
      - KPI non leggibili dagli screen restano n/d; DM e sondaggi sono
        obbligatori per ogni finestra
      - Reach = metrica primaria (nord stella)

- [ ] **3.3** Scrivere `docs/COME_AGGIORNARE.md`: il ciclo completo
      screen insights → posts.json → validate → build → deploy.

---

## Fase 4 — Alert Telegram

- [ ] **4.1** Scrivere `scripts/alert.py`. Per ogni post legge la data di
      pubblicazione, calcola quali finestre (g1/g3/g7/g30) scadono **oggi** e
      non sono ancora loggate in `posts.json`, e invia un messaggio Telegram:
      es. "Sono passati 7g dalla pubblicazione di [titolo]. Servono gli insights
      per aggiornare il report." Token e chat_id da variabili d'ambiente
      (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`), mai hardcoded.
      Nessuna finestra scaduta oggi = nessun messaggio (non spammare).

- [ ] **4.2** `.github/workflows/alert.yml`: cron giornaliero (una volta al
      mattino) che esegue `alert.py` usando i secrets.

---

## Fase 5 — CI/CD

- [ ] **5.1** `.github/workflows/deploy.yml`: su ogni push su `main`, esegue
      `validate.py`; se passa, esegue `build.py` e deploya `dashboard/index.html`
      su Vercel. Se `validate.py` fallisce, il deploy NON parte.

---

## Cose da fare a mano (fuori da Claude Code)

Prima che alert e deploy funzionino, configurare i GitHub Secrets:

- [ ] Creare bot Telegram con @BotFather → `TELEGRAM_BOT_TOKEN`
- [ ] Recuperare il proprio `TELEGRAM_CHAT_ID`
- [ ] Generare `VERCEL_TOKEN` + `VERCEL_PROJECT_ID` + `VERCEL_ORG_ID`
- [ ] Inserire tutti i secrets in GitHub → Settings → Secrets and variables → Actions
