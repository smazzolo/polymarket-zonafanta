# KPI_RULES — regole di lettura degli insights Instagram

Come si leggono gli screenshot insights e come si trasformano in numeri per
`data/posts.json`. Regole fisse: valgono per ogni post e ogni finestra.
(Lo schema del file e le convenzioni dati sono in `SCHEMA_DATI.md`.)

## La regola zero

**Non si inventano mai numeri.** Ogni valore in `posts.json` deve essere
leggibile su uno screenshot insights (o sul post pubblico, per i contatori
pubblici). Se un KPI non si legge → resta `null` (in dashboard: `n/d`).
`0` si scrive solo quando lo screen mostra davvero zero.

## Reach = metrica primaria (nord stella)

Il reporting è **reach-first**: la reach (account raggiunti) è la metrica
di riferimento del progetto. Views e il resto la accompagnano; i floor
contrattuali però si misurano in **views** (100K per post / 1,5M aggregato).

## Dove si legge ogni KPI

| KPI | dove si legge | note |
|---|---|---|
| `reach` | insights → "Account raggiunti" | metrica primaria |
| `views` | insights → visualizzazioni | base dei floor |
| `commenti` | insights o contatore pubblico del post | |
| `condivisioni` | **icona aeroplanino nella action bar del post** (contatore pubblico) | NON confonderla con gli invii in DM |
| `salvati` | insights → segnalibro | |
| `dm` | insights → aeroplanino (invii in DM) | vedi regola "--" sotto |
| `sondaggi` | riga **"Risposte: N · Visualizza" sotto la caption** del post | |

## La regola del "--" (unica eccezione al n/d)

Se negli insights l'aeroplanino mostra **"--"**, significa zero invii:
si scrive **`dm = 0`**, NON `n/d`. È l'unico caso in cui un trattino
sullo screen diventa uno zero nel file.

## KPI obbligatori

**`dm` e `sondaggi` sono obbligatori per ogni finestra loggata**: quando si
carica una finestra vanno sempre rilevati (con la regola del "--" per i dm).
Gli altri KPI, se non leggibili dagli screen disponibili, restano `n/d` —
`validate.py` li elenca come avvisi finché non vengono recuperati.

## Coerenza tra finestre

I contatori sono cumulativi: tra g1 → g3 → g7 → g30 (→ overall) non
dovrebbero mai scendere. `validate.py` **blocca il build** se calano
`reach` o `views` (impossibile: è un errore di caricamento — controlla di
non aver invertito due colonne o due finestre); un calo sugli altri KPI
genera un avviso da verificare sugli screen, mai da "correggere" a mente.

## Contatori pubblici ≠ insights

Like / commenti / condivisioni visibili sul post sono **dati pubblici**
(blocco `pubblici` con la data di lettura) e in dashboard restano etichettati
come tali. Non si mischiano con gli insights.
