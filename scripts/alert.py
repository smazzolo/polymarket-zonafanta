#!/usr/bin/env python3
"""Promemoria Telegram per le finestre insights scadute e non ancora caricate.

Uso:  python3 scripts/alert.py            invia (serve TELEGRAM_BOT_TOKEN/CHAT_ID)
      python3 scripts/alert.py --dry-run  stampa il messaggio senza inviare

Design SENZA STATO (specifica del 15/7/2026):
- la fonte di verità è data/posts.json: nessun file di stato, nessun bot in
  ascolto, nessuna conferma manuale;
- una finestra conta se è SCADUTA (convenzione: pubblicazione = giorno 0,
  gN scade a pubblicazione + N giorni — identica a validate.py) e NON è
  loggata (tutti e 7 i KPI null). Le finestre parziali non fanno alert:
  quelle le elenca validate.py;
- finché resta vuota viene rilanciata a ogni girata; appena posts.json viene
  aggiornato, alla girata dopo non risulta più vuota e l'alert si spegne
  da solo;
- tutto raggruppato in UN messaggio: un post con più finestre vuote compare
  una volta sola con l'elenco (anti-rumore);
- nessuna finestra scaduta-e-vuota → nessun messaggio (mai spam a vuoto).
"""
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import telegram_util
import validate  # convenzione finestre e helper condivisi: UNA implementazione

from datetime import timedelta

ROOT = Path(__file__).resolve().parent.parent


def finestre_scoperte(posts, oggi):
    """Per ogni post: le finestre scadute e completamente vuote."""
    scoperti = []
    for p in sorted(posts, key=lambda x: x["n"]):
        pub = date.fromisoformat(p["data"])
        vuote = []
        for w in validate.WINDOWS:
            scade = pub + timedelta(days=validate.WINDOW_DAYS[w])
            block = p["insights"][w]
            if scade <= oggi and not any(block.get(k) is not None for k in validate.KPIS):
                vuote.append((w, scade))
        if vuote:
            scoperti.append((p, vuote))
    return scoperti


def fmt_data(d):
    return f"{d.day:02d}/{d.month:02d}"


def componi_messaggio(scoperti, oggi):
    righe = ["📊 Report ZonaFanta × Polymarket — insights da caricare\n"]
    for p, vuote in scoperti:
        pub = date.fromisoformat(p["data"])
        giorni = (oggi - pub).days
        lista = " e ".join(
            f"{w} (scaduta il {fmt_data(scade)})" for w, scade in vuote)
        link = f"\n  ↳ {p['url']}" if p.get("url") else ""
        righe.append(
            f"• Sono passati {giorni}g dalla pubblicazione di "
            f"“{p['titolo']}” (pubblicato il {fmt_data(pub)}). "
            f"Servono gli insights della finestra {lista} per aggiornare il report."
            f"{link}"
        )
    righe.append("\nAggiorna data/posts.json e l'alert si spegne da solo.")
    return "\n".join(righe)


def main(argv):
    dry_run = "--dry-run" in argv
    import json
    dati = json.loads((ROOT / "data" / "posts.json").read_text(encoding="utf-8"))
    oggi = date.today()

    scoperti = finestre_scoperte(dati["posts"], oggi)
    if not scoperti:
        print("Nessuna finestra scaduta e vuota: nessun messaggio (come da specifica).")
        return 0

    msg = componi_messaggio(scoperti, oggi)
    n_fin = sum(len(v) for _, v in scoperti)
    print(f"{len(scoperti)} post, {n_fin} finestre scoperte.")
    if dry_run:
        print("--- DRY RUN: messaggio che verrebbe inviato ---")
        print(msg)
        return 0

    try:
        telegram_util.invia_messaggio(msg)
    except telegram_util.ConfigMancante as e:
        print(f"ERRORE: {e}")
        return 1
    print("Promemoria inviato su Telegram.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
