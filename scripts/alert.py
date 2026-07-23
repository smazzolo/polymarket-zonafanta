#!/usr/bin/env python3
"""Promemoria Telegram per le finestre insights da fotografare.

Uso:  python3 scripts/alert.py            invia (serve TELEGRAM_BOT_TOKEN/CHAT_ID)
      python3 scripts/alert.py --dry-run  stampa il messaggio senza inviare

Design SENZA STATO (specifica del 15/7/2026, esteso il 23/7):
- la fonte di verità è data/posts.json: nessun file di stato, nessun bot in
  ascolto, nessuna conferma manuale;
- una finestra è SCADUTA quando pub + N giorni <= oggi (convenzione identica a
  validate.py) ed è VUOTA quando tutti e 7 i KPI sono null. Le finestre
  parziali non fanno alert: quelle le elenca validate.py;
- il messaggio ha due sezioni:
    · "⚠️ DA FOTOGRAFARE ORA" = finestre scadute e vuote (arretrato), con da
      quanti giorni la foto è attesa;
    · "📸 PROSSIME FOTO" = finestre future ancora da fotografare, con il
      countdown ("tra N giorni"), così si può pianificare;
- finché una finestra resta vuota viene rilanciata a ogni girata; appena
  posts.json viene aggiornato, alla girata dopo non risulta più vuota e sparisce
  da sola;
- ANTI-SPAM: si invia solo se c'è dell'arretrato OPPURE una foto entro
  PREAVVISO_INVIO giorni. Se non c'è niente di scaduto e la prossima foto è
  lontana, nessun messaggio.
"""
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import telegram_util
import validate  # convenzione finestre e helper condivisi: UNA implementazione

ROOT = Path(__file__).resolve().parent.parent

# Quanti giorni prima della scadenza mandare l'heads-up "prossima foto".
# Alza/abbassa per anticipare o ridurre i promemoria in arrivo.
PREAVVISO_INVIO = 3


def _vuota(block):
    return not any(block.get(k) is not None for k in validate.KPIS)


def finestre_scadute(posts, oggi):
    """Per ogni post: (post, [(finestra, scadenza, giorni_ritardo), ...])
    per le finestre scadute e completamente vuote. Ordinati per n."""
    out = []
    for p in sorted(posts, key=lambda x: x["n"]):
        pub = date.fromisoformat(p["data"])
        vuote = []
        for w in validate.WINDOWS:
            scade = pub + timedelta(days=validate.WINDOW_DAYS[w])
            if scade <= oggi and _vuota(p["insights"][w]):
                vuote.append((w, scade, (oggi - scade).days))
        if vuote:
            out.append((p, vuote))
    return out


def finestre_in_arrivo(posts, oggi):
    """Finestre future ancora vuote: [(post, finestra, scadenza, giorni_mancanti)]
    ordinate per data (prima le più vicine)."""
    out = []
    for p in posts:
        pub = date.fromisoformat(p["data"])
        for w in validate.WINDOWS:
            scade = pub + timedelta(days=validate.WINDOW_DAYS[w])
            if scade > oggi and _vuota(p["insights"][w]):
                out.append((p, w, scade, (scade - oggi).days))
    return sorted(out, key=lambda x: x[2])


def fmt_data(d):
    return f"{d.day:02d}/{d.month:02d}"


def giorni(n):
    """'oggi' / '1 giorno' / 'N giorni'."""
    if n == 0:
        return "oggi"
    return "1 giorno" if n == 1 else f"{n} giorni"


def titolo_breve(t, n=46):
    t = " ".join(t.split())
    return t if len(t) <= n else t[: n - 1].rstrip() + "…"


def componi_messaggio(scadute, in_arrivo, oggi):
    R = ["📊 ZonaFanta × Polymarket — promemoria insights", f"🗓 {fmt_data(oggi)}"]

    if scadute:
        n = sum(len(v) for _, v in scadute)
        R += ["", f"⚠️ DA FOTOGRAFARE ORA · {n}"]
        for p, vuote in scadute:
            for w, scade, ritardo in vuote:
                quando = ("scade oggi" if ritardo == 0
                          else f"scaduta il {fmt_data(scade)} · in ritardo di {giorni(ritardo)}")
                R.append(f"• {titolo_breve(p['titolo'])} — {w}")
                R.append(f"   {quando}")
                if p.get("url"):
                    R.append(f"   ↳ {p['url']}")

    if in_arrivo:
        R += ["", "📸 PROSSIME FOTO"]
        for p, w, scade, mancano in in_arrivo:
            R.append(f"• {titolo_breve(p['titolo'])} — {w}")
            R.append(f"   tra {giorni(mancano)} · {fmt_data(scade)}")
            if p.get("url"):
                R.append(f"   ↳ {p['url']}")

    R += ["", "Aggiorna data/posts.json e l'alert si spegne da solo."]
    return "\n".join(R)


def main(argv):
    dry_run = "--dry-run" in argv
    import json
    dati = json.loads((ROOT / "data" / "posts.json").read_text(encoding="utf-8"))
    oggi = date.today()

    scadute = finestre_scadute(dati["posts"], oggi)
    in_arrivo = finestre_in_arrivo(dati["posts"], oggi)
    imminenti = [x for x in in_arrivo if x[3] <= PREAVVISO_INVIO]

    if not scadute and not imminenti:
        prossima = f" (prossima foto tra {giorni(in_arrivo[0][3])})" if in_arrivo else ""
        print(f"Niente di scaduto né di imminente{prossima}: nessun messaggio (come da specifica).")
        return 0

    msg = componi_messaggio(scadute, in_arrivo, oggi)
    n_scad = sum(len(v) for _, v in scadute)
    print(f"{len(scadute)} post con arretrato ({n_scad} finestre), "
          f"{len(in_arrivo)} prossime foto ({len(imminenti)} entro {PREAVVISO_INVIO}g).")
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
