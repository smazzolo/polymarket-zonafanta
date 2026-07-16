---
name: richiesta-mercato-antonio
description: Skill operativa per trasformare un'intuizione di mercato (giocatore/evento) in una richiesta strutturata ad Antonio (Polymarket) di aprire un nuovo mercato Polymarket da usare come contenuto ZonaFanta. USA QUESTA SKILL quando l'utente arriva con "mi serve un messaggio per Antonio per un nuovo mercato", "chiediamo ad Antonio di aprire un mercato su X", "questo giocatore/evento può diventare un mercato", "fammi la richiesta per un mercato su [giocatore]", "proviamo a far aprire un mercato su [situazione]". Produce: titolo mercato in stile Polymarket, outcome puliti ed esaustivi, regola di risoluzione, aggancio contenuto ZonaFanta, e messaggio WhatsApp pronto per Antonio (TOV cliente, asciutto, 2 messaggi corti). NON usare per spiegare un mercato già esistente, scrivere post editoriali o pitch commerciali (quella è la skill polymarket-zonafanta). NON usare per reporting/dashboard performance.
---

# Skill: Richiesta Mercato ad Antonio

Trasforma un'intuizione grezza (un giocatore svincolato, un esonero in bilico, una corsa scudetto) in una **richiesta pulita ad Antonio** di aprire un nuovo mercato Polymarket, da trasformare poi in contenuto ZonaFanta.

L'attrito da abbattere: il back-and-forth. Antonio deve poter leggere la richiesta e aprire il mercato **senza richiederti niente**.

Imparentata con `polymarket-zonafanta` (stesso cliente, stesso TOV B2B), ma copre un layer che quella non ha: la **proposta di apertura mercato**.

---

## REGOLA D'ORO SUI DATI

Non invento mai lo stato di un giocatore/situazione. Lavoro su ciò che mi passa l'utente.

- Se l'utente afferma un fatto (es. "la Juve non rinnova, è sicuro") → lo tratto come vero e lo uso nel framing.
- Se un fatto è incerto e cambia il mercato (es. è già svincolato? il contratto scade a giugno?) → chiedo all'utente o propongo una verifica web di contesto pubblico, citando la fonte. Mai dedurre.
- Il follower count ZonaFanta o dati pubblici di contesto si possono recuperare dal web citando la fonte, solo se servono.

---

## INPUT MINIMO

Per generare la richiesta mi servono:
1. **Soggetto** — giocatore / evento / situazione (es. "Vlahović svincolato")
2. **Tipo di mercato** — "dove va" / "sì-no" / "over-under" / "chi vince" / altro
3. **Outcome candidati** — le opzioni che l'utente ha già in testa (es. squadre)
4. **(Opzionale) Deadline naturale** — chiusura mercato estivo, fine stagione, data evento

Se manca solo l'outcome o il tipo, lo deduco dal soggetto e lo propongo. Se manca il soggetto, chiedo. Una domanda alla volta, no interrogatori.

---

## OUTPUT (sempre questa struttura)

### 1. Titolo mercato
Secco, in stile Polymarket, in inglese (Polymarket è EN-first).
Es. `Where will Dušan Vlahović play in 2026/27?`

### 2. Outcome
- Puliti, leggibili, **mutuamente esclusivi**
- Sempre una voce jolly: `Another team` (o `No move` / `Stays` se ha senso)
- Escludere gli outcome già dichiarati impossibili dall'utente (non listarli "per completezza")

### 3. Regola di risoluzione
**Obbligatoria.** Un mercato senza criterio di chiusura Polymarket non lo apre.
- **Quando** risolve (data o evento: es. "alla chiusura del mercato estivo / 1 settembre 2026")
- **Come** risolve (fonte che dichiara l'esito: annuncio ufficiale del club, fonti tier-1 tipo Romano/comunicato società)
- Cosa succede se non si verifica nessun outcome listato → risolve su `Another team`

### 4. Aggancio contenuto ZonaFanta
Una riga: perché è postabile, che hook ne esce. Serve a te per decidere se vale il post.

### 5. Messaggio WhatsApp per Antonio
TOV cliente: asciutto, da operatore a operatore. Niente corporate speak, niente emoji superflue, nessuna ridondanza di dati già condivisi.

**Formato: blocco unico** (un solo messaggio, non spezzato), seguito dalla menzione/tag e dalla domanda di fattibilità su riga a parte. Struttura tipo:
- Apertura colloquiale ("Ciaooo, da un brief con il team di ZonaFanta...")
- L'idea + perché è calda adesso (parametro zero, top player, appeal anche per il mercato italiano in generale)
- Outcome **inline** nel testo (non lista puntata): "Outcome: Como, Milan, ... (se servono se ne aggiungono altri)"
- Riga di risoluzione integrata: "Risoluzione a fine mercato sul club con cui firma ufficialmente"
- Tag al referente + domanda secca: "@Antonio Sinatra fammi sapere se si può integrare come mercato!"

La voce jolly e la regola di risoluzione **non si omettono mai** dal messaggio: l'apertura a "se servono se ne aggiungono altri" sostituisce il jolly listato, ma la riga di risoluzione resta sempre, perché è ciò che permette ad Antonio di aprire il mercato senza richiederla dopo.

---

## VALIDAZIONE INTERNA (prima di consegnare)

Controllo che:
- [ ] Gli outcome siano **esaustivi** (c'è sempre il jolly `Another team`)
- [ ] Gli outcome siano **mutuamente esclusivi** (no sovrapposizioni)
- [ ] Ci sia una **regola di risoluzione** con fonte credibile
- [ ] Non ci siano outcome che l'utente ha già escluso
- [ ] La deadline di risoluzione sia plausibile rispetto al tipo di evento

Se uno di questi salta → lo segnalo all'utente **prima** di generare il messaggio, non dopo.

---

## TOV DEL MESSAGGIO AD ANTONIO

Stesso registro del workflow `pitch-b2b` di `polymarket-zonafanta`:
- Professionale ma diretto, da operatore a operatore
- Niente "siamo lieti di", niente entusiasmo finto
- **Blocco unico**, colloquiale ma asciutto, come si scrive davvero su WhatsApp tra operatori che si conoscono ("Ciaooo")
- Outcome inline nel testo, non a lista puntata
- Tag al referente: **@Antonio Sinatra** (il referente è Antonio Sinatra)
- Il titolo mercato si può tenere in inglese (Polymarket è EN-first), ma nel messaggio ad Antonio l'idea si può esprimere anche in italiano tra virgolette ("dove giocherà Vlahović la prossima stagione")
- Mai restate dati o screenshot già condivisi separatamente
- **Rilettura refusi**: il messaggio finisce su WhatsApp del cliente, ricontrolla sempre i typo prima di consegnare

---

## QUANDO MANCA INPUT

- Manca il soggetto → chiedi giocatore/evento
- Manca il tipo di mercato → deducilo dal soggetto e proponilo ("immagino un 'dove va', confermi?")
- Outcome vaghi → proponi tu una lista di partenza, l'utente aggiunge/toglie
- Fatto incerto che cambia il framing → chiedi o proponi verifica web di contesto

---

## COSA NON FARE

- Non inventare lo stato contrattuale/situazione di un giocatore
- Non listare outcome già esclusi dall'utente
- Non dimenticare la regola di risoluzione (è la cosa che fa aprire o no il mercato)
- Non mescolare questo TOV (B2B asciutto) con quello editoriale ZonaFanta
- Non sovrapporti a `polymarket-zonafanta`: questa skill **non** spiega mercati esistenti, **non** scrive post, **non** fa pitch. Fa solo la richiesta di apertura.

---

## ESEMPIO DI RIFERIMENTO (caso Vlahović)

**Input utente:** "Mi serve un messaggio per Antonio per aprire un mercato su Vlahović svincolato, possibili squadre Como/Milan/Barcellona/Bayern/Atlético/Newcastle, la Juve è esclusa perché è sicuro che non rinnova."

**Output:**

*Titolo mercato:* `Where will Dušan Vlahović play in 2026/27?`

*Outcome:* Como · Milan · Barcellona · Bayern Monaco · Atlético Madrid · Newcastle · Another team

*Risoluzione:* a fine mercato sul club con cui firma ufficialmente; se firma con club non listato → Another team.

*Aggancio ZonaFanta:* svincolato a zero, ventaglio dal Como al Bayern → hook da dibattito "dove lo vedi?".

*Messaggio (blocco unico):*
> Ciaooo, da un brief con il team di ZonaFanta ci è venuto in mente un mercato che può funzionare bene sia per il nostro contenuto sia per il mercato italiano in generale: "dove giocherà Vlahović la prossima stagione". È già sicuro che non rinnova con la Juve, quindi va via a parametro zero, ed è uno dei top in circolazione. Outcome: Como, Milan, Barcellona, Bayern, Atlético, Newcastle (se servono se ne aggiungono altri). Risoluzione a fine mercato sul club con cui firma ufficialmente.
>
> @Antonio Sinatra fammi sapere se si può integrare come mercato!
