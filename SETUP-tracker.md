# Setup tracker — Dashboard ZonaFanta × Polymarket

Due file:
- `api/track.js` → serverless su Vercel (riceve ping/report e li manda al bot Telegram)
- `tracker-client-snippet.html` → blocco `<script>` da incollare in `index.html`

## 1. Bot Telegram nuovo (dedicato)
1. Su Telegram apri **@BotFather** → `/newbot` → dai nome + username → ricevi il **token**.
2. Scrivi un messaggio qualsiasi al tuo nuovo bot (o aggiungilo a un gruppo dedicato e scrivi lì).
3. Ricava il **chat_id**: apri nel browser
   `https://api.telegram.org/bot<IL_TUO_TOKEN>/getUpdates`
   e leggi `chat.id` (per un gruppo è un numero negativo, es. `-100...`).

## 2. Env var su Vercel (progetto polymarket-zonafanta)
Project → Settings → Environment Variables, aggiungi:
- `TELEGRAM_BOT_TOKEN` = token di BotFather
- `TELEGRAM_CHAT_ID` = chat_id ricavato sopra

Poi **Redeploy** (le env var si applicano solo dopo un nuovo deploy).
Il token NON va mai scritto nel codice: resta solo nelle env var.

## 3. Copia i file nel repo
```
polymarket-zonafanta/
├─ index.html
└─ api/
   └─ track.js
```
Requisito: Node 18+ (Vercel lo usa di default; se serve, imposta "Node.js Version" 18/20 nelle settings).

## 4. Marca la dashboard con gli attributi data-*
Nel body di `index.html`:
- Sezioni: `data-sec="aggregato"` (id validi: header, aggregato, floor, finestre, posts, storico, note)
- Scheda post: `data-post="post-8"` (lo slug `post-N` combacia con POST_LABEL in track.js)
- Link IG/profilo/mercato: `data-link="ig-post"` + opzionale `data-post="post-8"`
- Bottone/box mercato Polymarket: `data-market="1" data-post="post-8"`
- Bottoni export: `data-export="export-pdf"` (o export-png / export-csv / export-print)

Senza data-* la pagina funziona lo stesso: traccia apertura, scroll e durata totale.
Poi incolla il blocco `<script>` di `tracker-client-snippet.html` prima di `</body>`.

## 5. Test
Apri `https://<tuo-dominio>.vercel.app/api/track?debug=1`
→ deve arrivare "✅ Test di connessione" sul bot e la pagina mostra
`bot_token: presente`, `chat_id: <numero>`, `node: v18/20`, `fetch: ok`.

## Cosa arriva sul bot
- **Ping live** (in tempo reale): apertura dashboard · vista aggregata · apertura scheda post · click su link IG/profilo · apertura mercato Polymarket · export.
- **Report finale** (all'uscita): durata totale, tempo per sezione, tempo per post, post più guardato, mercati/link/export, scroll massimo, timeline cronologica con orari (fuso Europe/Rome).

## Nota su "condivisa più larga"
La dashboard sarà vista da più persone: ogni sessione = un report separato,
con sid diverso e geo (città·regione da IP, via header Vercel). Se il volume
di ping live diventa troppo, si può alzare la soglia (es. mandare solo il
report finale e non i ping intermedi) — dimmelo e lo taro.
