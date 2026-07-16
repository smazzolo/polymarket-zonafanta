# skills/ — copie di riferimento (NON la fonte operativa)

Queste sono **copie versionate** delle skill del progetto Claude, messe qui
perché Claude Code abbia il contesto in casa.

> ⚠️ **La fonte operativa viva resta il progetto Claude (claude.ai).**
> Se una skill viene modificata lì, la copia qui NON si aggiorna da sola:
> va riallineata a mano (ricopiandola), altrimenti diverge silenziosamente.
> Vale anche al contrario: modificare questi file non cambia nulla nel
> comportamento del progetto Claude.

## Skill incluse

| cartella | scopo | copiata il | versione sorgente del |
|---|---|---|---|
| `zonafanta-polymarket-report` | reporting e dashboard performance (questo progetto) | 15/7/2026 | 30/6/2026 |
| `polymarket-zonafanta` | contenuti editoriali e pitch B2B (+ references: glossario, TOV, template) | 15/7/2026 | 4/5/2026 |
| `richiesta-mercato-antonio` | richieste di apertura nuovi mercati Polymarket ad Antonio | 15/7/2026 | 9/6/2026 |

## ⚠️ Nota importante su `zonafanta-polymarket-report`

La copia (30/6) descrive ancora la **vecchia struttura** del progetto:
`assets/dati.json` come fonte, `scripts/embed_cover.py`, generazione di
`assets/dashboard.html`. Da metà luglio 2026 la struttura è quella di questa
repo: **`data/posts.json`** unica fonte, `scripts/validate.py` + `scripts/build.py`,
output `dashboard/index.html` (vedi `docs/COME_AGGIORNARE.md`).

→ La skill nel progetto Claude andrebbe aggiornata al nuovo flusso; quando
succede, riallineare anche questa copia.
