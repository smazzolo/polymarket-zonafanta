# ZonaFanta × Polymarket Italia — Performance Dashboard

Dashboard delle performance dei post Instagram sponsorizzati della collaborazione
**ZonaFanta × Polymarket Italia**. Vista unica, condivisa internamente e con il cliente.

🔗 **Dashboard live:** _https://polymarket-zonafanta.vercel.app/_

---

## Cosa mostra

- **Performance complessiva ad oggi**: visualizzazioni totali generate (con media per post) e reach aggregata.
- **Visualizzazioni per finestra temporale**: +24h / +3 giorni / +7 giorni / +30 giorni.
- **Feed dei post** in stile Instagram: per ogni post, carosello delle slide, mercato Polymarket di riferimento, link diretto al post e tabella KPI completa (reach, visualizzazioni, commenti, condivisioni, salvati, invii in DM, risposte) su tutte le finestre.

La metrica primaria è la **reach (account raggiunti)**. Il dato di punta comunicato è il **totale visualizzazioni**.

## Struttura del progetto

```
.
├── index.html              # Dashboard pronta (file unico, auto-sufficiente) — è ciò che viene pubblicato
├── assets/
│   ├── dati.json           # FONTE DI VERITÀ: tutti i dati dei post
│   ├── template.html       # Template HTML con placeholder __DATI_JSON__
│   └── dashboard.html      # Output generato (copia di index.html)
├── scripts/
│   ├── build_dashboard.py  # Genera la dashboard embeddando dati.json nel template
│   └── embed_slides.py     # Incorpora le slide (cover/carosello) in base64 nel JSON
└── SKILL.md                # Protocollo di aggiornamento del reporting
```

## Come aggiornare i dati

Tutti i numeri vivono in `assets/dati.json` — **non si modifica mai `index.html` a mano**.

1. Apri `assets/dati.json` e aggiorna i valori del post interessato (vedi struttura sotto).
2. Rigenera la dashboard:
   ```bash
   cd scripts
   python build_dashboard.py
   ```
3. Copia l'output come homepage:
   ```bash
   cp assets/dashboard.html index.html
   ```
4. Commit & push:
   ```bash
   git add -A && git commit -m "Aggiorna dati performance" && git push
   ```

### Regola d'oro
Nessun dato viene mai stimato o inventato. I valori di reach, visualizzazioni, salvati,
invii in DM e risposte arrivano esclusivamente dagli screenshot insights di Instagram.
Un dato non disponibile resta `null` → mostrato come `n/d`.

## Pubblicazione

### GitHub Pages
1. Carica il repository su GitHub.
2. `Settings` → `Pages` → `Source: Deploy from a branch` → branch `main`, cartella `/ (root)`.
3. La dashboard sarà su `https://<utente>.github.io/<repo>/`.

### Vercel (alternativa)
1. Importa il repository su Vercel.
2. Nessun build step necessario: è un sito statico. Output directory = root.
3. Deploy → link pronto da condividere.

## Note tecniche

- `index.html` è un **singolo file autosufficiente**: HTML, CSS, dati JSON e immagini (base64) sono tutti dentro. Nessuna dipendenza esterna, funziona anche aperto in locale.
- Le immagini delle slide sono incorporate in base64, quindi il file è relativamente pesante (~2 MB). È normale e va bene per l'hosting statico.
- Ottimizzato per la lettura da **mobile**.

---

_Ultimo aggiornamento dati: 8 giugno 2026_
