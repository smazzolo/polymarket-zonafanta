# Stato progetto — aggiornato al 15 luglio 2026

File di stato mantenuto a mano a fine fase (non è un output del build).
La lista task completa è in `TODO.md`; l'audit dati della migrazione in
`docs/DATI_MANCANTI.md`.

## ✅ Fase 1 — Fondamenta dati (COMPLETA)

- `data/posts.json` = unica fonte editabile (12 post, meta contrattuale,
  schema in `docs/SCHEMA_DATI.md`). Immagini fuori dal JSON, in `assets/`.
- Migrazione dal live + vecchio `dati.json` con audit: correzioni approvate
  applicate (overall storico da letture reali 8/6, overall spuri rimossi,
  inversione dm/condivisioni g7 post 6–7). Punti ancora aperti in
  `docs/DATI_MANCANTI.md` (A2 conferma su screen, A4, A5, A8).
- `scripts/validate.py`: errori bloccanti (schema, reach/views che calano,
  slide mancanti) vs avvisi (finestre scadute non loggate, KPI n/d).
  Convenzione finestre fissata: pubblicazione = giorno 0, gN scade a +N giorni.
- `scripts/build.py`: valida → comprime le slide (Pillow 480px q60) → genera
  i **due output**: `dashboard/index.html` + i `.md` rigenerati
  (`CONTESTO_PROGETTO.md`, `dati.md`). Se validate fallisce, il build non parte.

## ✅ Fase 2 — Dashboard (COMPLETA)

- UI della vecchia dashboard **replicata verbatim** (HTML/CSS estratti dal
  file originale, non ricopiati) sopra il motore nuovo: layout, colori,
  tipografia, sezioni e schede post identici.
- Il JS non calcola nulla: ogni valore (anche per slider e filtri sorgenti)
  è precalcolato da `build.py` e iniettato; il client fa solo lookup.
- Montserrat **incorporato nel file** (variable font, `dashboard/src/fonts.css`):
  eliminato l'@import da Google Fonts — l'artefatto è davvero autonomo
  (funziona da `file://`, zero fetch a runtime).
- QA fatto su Chrome: interazioni (somma sorgenti, slider finestre, tema
  scuro, tabella compatta, caroselli) + confronto fianco a fianco con la
  vecchia su desktop 1440×900 e mobile 390×844. Harness di QA cancellati
  dopo la verifica. Peso: ~1,6 MB vs 3,7 MB della vecchia, con tutte le slide.
- Differenze vs vecchia SOLO numeriche (volute: correzioni dati Fase 1 —
  es. floor 1,44M vs 1,34M perché il vecchio perdeva la g30 del post 6).
- Nota: il tracker Telegram (`api/track.js`) NON è nell'artefatto standalone;
  eventuale reiniezione solo nella versione deployata → da decidere in Fase 5.

## ✅ Fase 3 — Skill e documentazione (COMPLETA)

- `skills/`: copie di riferimento delle 3 skill (report, editoriale, richieste
  mercato) con README che chiarisce che la fonte viva è il progetto Claude.
  ⚠️ la skill report (versione 30/6) descrive ancora la vecchia struttura:
  da aggiornare nel progetto Claude e poi riallineare qui.
- `docs/KPI_RULES.md`: regole di lettura insights (reach nord stella,
  aeroplanino, sondaggi, regola del "--", dm+sondaggi obbligatori).
- `docs/COME_AGGIORNARE.md`: ciclo operativo in 4 passi per non tecnici.

## ✅ Fase 4 — Alert Telegram (COMPLETA)

- `scripts/alert.py`: senza stato — legge `posts.json`, trova le finestre
  scadute (pub = g0, +N giorni, identico a validate) e completamente vuote,
  compone UN messaggio raggruppato (un post = una riga, anche con più
  finestre) e lo manda al bot. Nessuna finestra scoperta = nessun messaggio.
  Si spegne da solo quando i dati vengono caricati. `--dry-run` per test.
- `scripts/telegram_util.py`: util condivisa "manda messaggio Telegram"
  (solo stdlib, credenziali SOLO da env) — pronta per essere riusata da un
  eventuale `api/track.py` in Fase 5.
- `.github/workflows/alert.yml`: 3 girate/giorno alle 9/14/20 ora italiana
  tutto l'anno — il cron copre UTC+1 e UTC+2, uno step controlla l'ora reale
  a Europe/Rome (immune al cambio ora legale/solare). `workflow_dispatch`
  per il test manuale.
- Testato: dry-run sui dati reali (5 finestre scoperte, coerenti con
  l'audit), casi nessun-alert, raggruppamento, util con API mockata,
  fallimento pulito senza env.
- Per attivarlo servono i secrets `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`
  su GitHub (checklist in fondo a TODO.md).

## 🔜 Fase 5 — CI/CD (5.1 fatto, 5.2 decisione utente, 5.3 dopo)

- `.github/workflows/deploy.yml`: su push su main → validate+build (in
  catena: se validate fallisce il deploy NON parte) → assembla la versione
  deploy → `vercel deploy --prod`. Anche `workflow_dispatch` manuale.
- `build.py --deploy DIR`: assembla la versione Vercel = standalone +
  tracker client iniettato + `api/`. Verificato: lo standalone resta
  zero-fetch; la versione deploy pinga `/api/track` senza errori console.
- `dashboard/src/tracker.js`: client tracker estratto dal vecchio index
  come asset sorgente (vive SOLO nella versione deployata).
- ✅ 5.2 DECISO: tracker resta in JS com'è (porting = rischio senza valore;
  credenziali già unificate via env TELEGRAM_*).
- ⏳ 5.3: testo aggiornato skill report per il progetto Claude (dopo Fase 5).
- ⚠️ PRIMO DEPLOY — sequenza in corso (16/7 mattina):
  · secrets GitHub: ✅ tutti e 5 inseriti dall'utente e verificati (nomi)
  · branch `preview` pushato (commit edf0ccd, main NON toccato) con workflow
    preview.yml → PREVIEW DEPLOYATA senza --prod:
    https://polymarket-zonafanta-pj62v9ulf-nicolo-8965s-projects.vercel.app (v2 con timeline dal più recente, commit 5d67698)
  · verifica preview: ✅ numeri nuovi (1,44M · 96% · 7/7 sopra floor),
    ✅ UI completa, ✅ interazioni (pill→2,54M/12 post), ✅ /api/track
    funzionante end-to-end (debug 200, messaggi Telegram arrivati),
    ✅ produzione intatta (3,7MB vecchia)
  · ✅ OK utente ricevuto il 16/7 → merge su main (74e0369) → deploy.yml
    verde → PRODUZIONE LIVE: polymarket-zonafanta.vercel.app serve la
    dashboard nuova (verificato: 1,5MB, dati nuovi, tracker attivo).
    Con main popolato si attiva anche il cron dell'alert (3x/giorno).
  · Post-produzione: fix mobile richiesto dall'utente (tabelle KPI delle
    card ora scorrono in orizzontale con nome KPI sticky) → in preview
    (commit f6d59f7), in attesa di prova su telefono e ok per promuovere.
- Ricognizione del 15/7 sera:
  · GitHub secrets: NESSUNO presente → mancano tutti e 5
    (VERCEL_TOKEN/ORG_ID/PROJECT_ID, TELEGRAM_BOT_TOKEN/CHAT_ID). STOP qui.
  · Env TELEGRAM_* su Vercel: ✅ già configurate e FUNZIONANTI (verificato
    con l'endpoint diagnostico /api/track?debug=1 della produzione attuale).
  · ID per i secrets: VERCEL_ORG_ID = team_9j9AT6JlyzbLmwiTLkqSMIkP,
    VERCEL_PROJECT_ID = prj_294ia5xQRB8YalFWfwndQC7F8NbZ (non sono segreti).
  · ⚠️ Il progetto Vercel ha l'INTEGRAZIONE GIT ATTIVA (auto-deploy su push
    a main, senza cancello validate): aggiunto `vercel.json` con
    github.enabled=false così l'unico canale di deploy resta la GitHub
    Action. La produzione attuale (vecchia dashboard, 3,7 MB) resta com'è
    finché non deployamo noi.
