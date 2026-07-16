---
name: polymarket-zonafanta
description: Skill verticale Polymarket × ZonaFanta (solo canale ZonaFanta) per contenuti editoriali e materiale B2B con Antonio (Polymarket). USA QUESTA SKILL per spiegare un mercato Polymarket Serie A in italiano, costruire angoli virali da movimenti su capocannoniere/scudetto/top 4/retrocessione/esonero, scrivere post ZonaFanta che partono da un mercato, o preparare pitch/follow-up/deck/proposte per Antonio. Attivare per "post ZonaFanta su Polymarket", "spiegami questo mercato", "angolo virale dalle odds", "movimento capocannoniere", "il nuovo Bobby", "pitch Polymarket", "follow-up Antonio", "talking points deck Polymarket". NON usare per caption Instagram/TikTok (caption-flipper, caption-pronostici), messaggi Zona1x2 (gm-zona1x2), conversioni cross-canale (style-converter).
---

# Skill: Polymarket × ZonaFanta

Skill verticale per due cose:
1. **Editoriale** — contenuti ZonaFanta che partono da un mercato Polymarket Serie A
2. **B2B** — materiale commerciale per la partnership con Antonio (Polymarket)

Solo canale **ZonaFanta**. Niente Zona1x2, niente Starcks.

---

## LIMITE TECNICO IMPORTANTE

Non ho accesso ai prezzi live di Polymarket. Lavoro **solo sui dati che mi passa l'utente**:
- screenshot del mercato
- prezzo attuale (probabilità implicita o quota)
- movimento % nelle ultime X ore/giorni
- testa-coda (top contender, outsider rilevanti)
- contesto (giornata, infortunio, news)

Se l'utente non passa dati → chiedere prima di scrivere. Mai inventare numeri.

---

## I 4 WORKFLOW

L'utente di solito chiede uno di questi 4. Riconoscili dall'intent e attiva quello giusto.

### 1. `mercato-explainer`
**Trigger:** "spiegami questo mercato", "cos'è il mercato X di Polymarket", "come funziona", "rendilo leggibile per ZonaFanta"

**Output:** spiegazione in italiano del mercato Polymarket per pubblico ZonaFanta. Non da nerd USA, non infantilizzata. Tradotta nei termini fanta/Serie A che la community capisce.

→ Vedi `references/mercati-serie-a.md` per la lista dei mercati che vale la pena spiegare.
→ Vedi `references/polymarket-glossary.md` per terminologia IT/EN.

### 2. `angolo-virale`
**Trigger:** "trova l'angolo", "perché X è il nuovo Bobby", "movimento sul mercato Y", "c'è una storia dietro questo numero?"

**Output:** angolo editoriale virale partendo dal dato. Hook + sviluppo + payoff. Una storia, non un'analisi.

Esempio classico: Malen che sale nel mercato capocannonieri → "Bobby" (riferimento al cult Beto/Bobby/altro fenomeno locale) → angolo che parte dal numero ma diventa narrazione. Il dato è l'innesco, non il contenuto.

→ Vedi `references/angoli-template.md` per i 6 template di angolo virale ricorrenti.

### 3. `post-zonafanta`
**Trigger:** "scrivi il post", "fammi il messaggio Telegram ZonaFanta", "fai la caption del feed", "post Instagram ZonaFanta"

**Output:** post completo in tone of voice ZonaFanta (mai Zona1x2, mai Starcks). Hook → bisogno → utilità → CTA → `Stay in Zona 🏟`.

Struttura sempre: tema/contrasto in apertura → utilità per il fanta → CTA chiara.
La promo Polymarket arriva come **estensione naturale**, mai come marchetta diretta.

→ Vedi `references/tov-zonafanta.md` per il TOV operativo (apertura, lessico, emoji, firma).

### 4. `pitch-b2b`
**Trigger:** "pitch per Antonio", "follow-up Polymarket", "talking points deck", "scrivi il messaggio commerciale", "proposta partnership"

**Output:** materiale commerciale in italiano professionale ma asciutto. Niente corporate speak, niente "siamo lieti di presentare". Linguaggio da operatore a operatore.

Tipologie:
- **email/DM follow-up** ad Antonio dopo una call
- **talking points** per un deck (max 5-7 bullet per slide)
- **proposta partnership** breve (1 pagina)
- **case study format** con metriche ZonaFanta + ipotesi di risultato Polymarket

→ Vedi `references/b2b-template.md` per i template B2B.

---

## REGOLE GLOBALI

**SEMPRE:**
- Lavora solo sui dati passati dall'utente (no prezzi inventati)
- Tono ZonaFanta operativo (vedi `references/tov-zonafanta.md`)
- Quando il post è per Telegram/IG ZonaFanta → output **ready-to-copy** (nessun commento, nessun markdown, nessun placeholder)
- Quando è materiale B2B → tono diverso, professionale ma diretto
- Polymarket è la **leva**, non il messaggio. Il contenuto serve all'utente ZonaFanta prima, alla partnership poi

**MAI:**
- Inventare prezzi, movimenti %, probabilità
- Sovrapposizione con altre skill:
  - **NO** caption Instagram/TikTok → quelle le fa `caption-flipper` / `caption-pronostici`
  - **NO** messaggi Zona1x2 → li fa `gm-zona1x2`
  - **NO** versione Starcks o cross-canale → lo fa `style-converter`
- Mescolare il TOV ZonaFanta con quello Zona1x2/Starcks
- Aprire un post con la promo. Sempre prima il valore, poi il rimando
- Far sembrare un contenuto editoriale una marchetta Polymarket
- Usare termini Polymarket non tradotti nei post (per i post si traduce, nel B2B si può tenere EN)

---

## QUANDO MANCA INPUT

Se l'utente attiva la skill ma non fornisce:
- mercato di riferimento → chiedi quale mercato (capocannonieri / scudetto / top 4 / retrocessione / esonero / altro)
- dati numerici → chiedi prezzo attuale + movimento (anche solo "Malen è passato dal 3% all'8% in 2 giorni")
- canale di destinazione (Telegram vs IG) per workflow `post-zonafanta` → chiedi quale dei due, perché il formato cambia

Una sola domanda alla volta. No interrogatori.

---

## OUTPUT FORMAT

Per workflow editoriali (`post-zonafanta`, `mercato-explainer`, `angolo-virale`):
- Output ready-to-copy
- Nessun preambolo
- Chiusura `Stay in Zona 🏟` solo nei post Telegram/feed completi (non nelle bozze di angolo)

Per workflow B2B (`pitch-b2b`):
- Output con header tipo `📧 EMAIL`, `📋 TALKING POINTS`, `📄 PROPOSTA`
- Subject line separata se è un'email
- Tono pulito, niente emoji se non strettamente necessarie

---

## RIFERIMENTI

- `references/tov-zonafanta.md` — TOV operativo (apertura, lessico, emoji, firma, esempi)
- `references/polymarket-glossary.md` — Glossario IT/EN dei termini prediction market
- `references/mercati-serie-a.md` — Mercati Polymarket Serie A che valgono contenuto
- `references/angoli-template.md` — 6 template di angolo virale ricorrenti
- `references/b2b-template.md` — Template per pitch, follow-up, deck, proposta
