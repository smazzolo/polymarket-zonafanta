#!/usr/bin/env python3
"""Valida data/posts.json prima del build.

Uso:  python scripts/validate.py

Esce con codice != 0 se trova ERRORI (incoerenze bloccanti: il build non deve
partire). Gli AVVISI non bloccano ma vanno letti: sono i buchi e i dubbi da
sistemare (finestre scadute non loggate, contatori che calano, ecc.).

Regole (vedi docs/SCHEMA_DATI.md e docs/KPI_RULES.md):
- dato mancante = null, mai inventato
- reach/views non possono MAI calare tra finestre successive -> ERRORE
- gli altri KPI che calano -> AVVISO (può essere legittimo, va verificato)
- floor: ricalcolati qui, mai salvati nel JSON
"""
import json
import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "posts.json"

WINDOWS = ["g1", "g3", "g7", "g30"]
WINDOW_DAYS = {"g1": 1, "g3": 3, "g7": 7, "g30": 30}
KPIS = ["reach", "views", "commenti", "condivisioni", "salvati", "dm", "sondaggi"]
KPI_BLOCCANTI = ("reach", "views")  # se calano è per forza un errore di caricamento
COLLAB_VALIDI = {"estiva", "storico"}
TIPI_VALIDI = {"shot", "media"}
META_RICHIESTI = [
    "cliente", "referente", "publisher", "canale", "logo", "collab_attiva",
    "floor_singolo_views", "floor_aggregato_views", "post_previsti", "scadenza",
]
POST_RICHIESTI = [
    "n", "titolo", "tipo", "collab", "data", "url", "mercato", "slides",
    "insights", "overall", "pubblici", "note",
]

errori = []
avvisi = []


def err(msg):
    errori.append(msg)


def warn(msg):
    avvisi.append(msg)


def parse_iso(s):
    try:
        return date.fromisoformat(s)
    except (TypeError, ValueError):
        return None


def check_kpi_block(block, dove):
    """Controlla che un blocco KPI abbia tutte le chiavi e valori int>=0 o null."""
    for k in KPIS:
        if k not in block:
            err(f"{dove}: manca la chiave '{k}'")
        else:
            v = block[k]
            if v is not None and (not isinstance(v, int) or isinstance(v, bool) or v < 0):
                err(f"{dove}.{k}: valore non valido {v!r} (serve intero >= 0 oppure null)")
    for k in block:
        if k not in KPIS and k != "aggiornato":
            err(f"{dove}: chiave sconosciuta '{k}'")


def logged(block):
    return any(block.get(k) is not None for k in KPIS)


def parse_irrecuperabili(meta):
    """Legge meta.irrecuperabili = ["10:g3", ...] → (set di (n, finestra), errori).
    Sono finestre che Instagram non mostra più: l'alert le ignora e non contano
    come buco. Campo opzionale: assente → set vuoto. Condiviso con alert.py."""
    raw = meta.get("irrecuperabili") if isinstance(meta, dict) else None
    coppie, errs = set(), []
    if raw is None:
        return coppie, errs
    if not isinstance(raw, list):
        errs.append('meta.irrecuperabili deve essere una lista di stringhe "n:finestra"')
        return coppie, errs
    for item in raw:
        if not isinstance(item, str) or ":" not in item:
            errs.append(f'meta.irrecuperabili: voce non valida {item!r} (serve "n:finestra", es. "10:g3")')
            continue
        sn, w = (x.strip() for x in item.split(":", 1))
        if not sn.isdigit() or w not in WINDOWS:
            errs.append(f'meta.irrecuperabili: voce non valida {item!r} (n intero, finestra in {WINDOWS})')
            continue
        coppie.add((int(sn), w))
    return coppie, errs


def main():
    oggi = date.today()

    try:
        dati = json.loads(DATA.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"ERRORE: {DATA} non esiste")
        return 1
    except json.JSONDecodeError as e:
        print(f"ERRORE: {DATA} non è JSON valido: {e}")
        print("Controlla virgole e parentesi vicino al punto indicato.")
        return 1

    # ---- meta -------------------------------------------------------------
    meta = dati.get("meta")
    if not isinstance(meta, dict):
        err("manca il blocco 'meta'")
        meta = {}
    for k in META_RICHIESTI:
        if meta.get(k) in (None, ""):
            err(f"meta.{k}: mancante")
    if meta.get("collab_attiva") not in COLLAB_VALIDI:
        err(f"meta.collab_attiva: {meta.get('collab_attiva')!r} non valido {sorted(COLLAB_VALIDI)}")
    if meta.get("scadenza") and not parse_iso(meta["scadenza"]):
        err(f"meta.scadenza: data non valida {meta['scadenza']!r} (serve YYYY-MM-DD)")
    logo = meta.get("logo")
    if logo and not (ROOT / logo).is_file():
        err(f"meta.logo: file non trovato: {logo}")

    irrec, irrec_errs = parse_irrecuperabili(meta)
    for e in irrec_errs:
        err(e)

    posts = dati.get("posts")
    if not isinstance(posts, list) or not posts:
        err("manca la lista 'posts' (o è vuota)")
        posts = []

    # ---- struttura post ----------------------------------------------------
    visti = set()
    for p in posts:
        n = p.get("n")
        dove = f"post n={n}"
        if not isinstance(n, int):
            err(f"{dove}: 'n' mancante o non intero")
            continue
        if n in visti:
            err(f"{dove}: 'n' duplicato")
        visti.add(n)

        for k in POST_RICHIESTI:
            if k not in p:
                err(f"{dove}: manca il campo '{k}'")
        for k in p:
            if k not in POST_RICHIESTI:
                err(f"{dove}: campo sconosciuto '{k}' (refuso?)")

        if p.get("collab") not in COLLAB_VALIDI:
            err(f"{dove}: collab {p.get('collab')!r} non valido {sorted(COLLAB_VALIDI)}")
        if p.get("tipo") not in TIPI_VALIDI:
            err(f"{dove}: tipo {p.get('tipo')!r} non valido {sorted(TIPI_VALIDI)}")
        pub = parse_iso(p.get("data"))
        if not pub:
            err(f"{dove}: data pubblicazione non valida {p.get('data')!r}")
        if not p.get("url"):
            warn(f"{dove}: url del post mancante")

        mercato = p.get("mercato")
        if not isinstance(mercato, dict) or set(mercato) != {"nome", "url", "nota"}:
            err(f"{dove}: mercato deve essere un oggetto {{nome, url, nota}}")
        else:
            if not mercato.get("nome"):
                warn(f"{dove}: mercato.nome mancante")
            if not mercato.get("url"):
                warn(f"{dove}: mercato.url mancante (link Polymarket)")

        slides = p.get("slides")
        if not isinstance(slides, list):
            err(f"{dove}: slides deve essere una lista (anche vuota)")
        else:
            if not slides:
                warn(f"{dove}: nessuna slide")
            for s in slides:
                if not (ROOT / s).is_file():
                    err(f"{dove}: slide non trovata su disco: {s}")

        ins = p.get("insights")
        if not isinstance(ins, dict) or set(ins) != set(WINDOWS):
            err(f"{dove}: insights deve avere esattamente le finestre {WINDOWS}")
            continue
        for w in WINDOWS:
            check_kpi_block(ins[w], f"{dove}.insights.{w}")

        ov = p.get("overall")
        if ov is not None:
            check_kpi_block(ov, f"{dove}.overall")
            agg = parse_iso(ov.get("aggiornato"))
            if not agg:
                err(f"{dove}: overall presente ma senza data 'aggiornato' valida")
            elif pub and agg < pub:
                err(f"{dove}: overall.aggiornato ({agg}) precedente alla pubblicazione ({pub})")

    # ---- irrecuperabili: devono riferirsi a finestre esistenti e VUOTE -------
    by_n = {p.get("n"): p for p in posts if isinstance(p.get("n"), int)}
    for n, w in sorted(irrec):
        p = by_n.get(n)
        if p is None:
            err(f"meta.irrecuperabili: post n={n} inesistente")
        elif isinstance(p.get("insights"), dict) and isinstance(p["insights"].get(w), dict) \
                and logged(p["insights"][w]):
            err(f"meta.irrecuperabili {n}:{w}: la finestra ha dati — togli il flag")

    if errori:
        # struttura rotta: inutile proseguire con i controlli sui valori
        return report(dati)

    # ---- cumulativi ---------------------------------------------------------
    for p in posts:
        n = p["n"]
        seq = [(w, p["insights"][w]) for w in WINDOWS if logged(p["insights"][w])]
        if p["overall"]:
            seq.append(("overall", p["overall"]))
        for k in KPIS:
            prev, prev_w = None, None
            for w, block in seq:
                v = block.get(k)
                if v is None:
                    continue
                if prev is not None and v < prev:
                    msg = f"post n={n}: {k} cala {prev_w}→{w} ({prev} → {v})"
                    if k in KPI_BLOCCANTI:
                        err(msg + " — impossibile per un cumulativo, correggere il dato")
                    else:
                        warn(msg + " — verificare sugli screenshot")
                prev, prev_w = v, w

    # ---- finestre scadute ---------------------------------------------------
    for p in posts:
        n = p["n"]
        pub = date.fromisoformat(p["data"])
        for w in WINDOWS:
            if (n, w) in irrec:
                continue  # finestra persa marcata irrecuperabile: non è un buco
            scade = pub + timedelta(days=WINDOW_DAYS[w])
            block = p["insights"][w]
            mancanti = [k for k in KPIS if block.get(k) is None]
            if scade <= oggi:
                if not logged(block):
                    warn(f"post n={n}: finestra {w} scaduta il {scade} e MAI loggata")
                elif mancanti:
                    warn(f"post n={n}: finestra {w} scaduta ma incompleta, mancano: {', '.join(mancanti)}")
            elif logged(block):
                warn(f"post n={n}: finestra {w} loggata ma scade solo il {scade} (lettura anticipata?)")

    return report(dati)


def fonte_overall(p, kpi):
    """(valore, fonte) del dato 'overall' di un post: fonte è "overall" se
    viene dal blocco overall, altrimenti la finestra loggata più recente."""
    if p["overall"] and p["overall"].get(kpi) is not None:
        return p["overall"][kpi], "overall"
    for w in reversed(WINDOWS):
        v = p["insights"][w].get(kpi)
        if v is not None:
            return v, w
    return None, None


def valore_overall(p, kpi):
    """Il dato 'overall' di un post: blocco overall se c'è, altrimenti la
    finestra loggata più recente. È LA definizione usata per i floor."""
    return fonte_overall(p, kpi)[0]


def report(dati):
    posts = dati.get("posts") or []
    meta = dati.get("meta") or {}

    print("=" * 62)
    print("VALIDAZIONE data/posts.json")
    print("=" * 62)

    if errori:
        print(f"\n❌ ERRORI BLOCCANTI ({len(errori)}) — il build NON deve partire:\n")
        for e in errori:
            print(f"  ✗ {e}")
    else:
        print("\n✓ struttura e coerenza: nessun errore bloccante")

    if avvisi:
        print(f"\n⚠ AVVISI ({len(avvisi)}) — non bloccano, ma vanno sistemati:\n")
        for a in avvisi:
            print(f"  - {a}")

    irrec = parse_irrecuperabili(meta)[0]
    if irrec:
        voci = ", ".join(f"{n}:{w}" for n, w in sorted(irrec))
        print(f"\n♻️  IRRECUPERABILI ({len(irrec)}) — finestre perse, ignorate dall'alert: {voci}")

    # ---- floor (solo se la struttura è sana) --------------------------------
    if not errori and posts:
        floor_s = meta.get("floor_singolo_views") or 0
        floor_a = meta.get("floor_aggregato_views") or 0
        attiva = meta.get("collab_attiva")
        gruppo = [p for p in posts if p["collab"] == attiva]

        print(f"\nFLOOR — collab '{attiva}' ({len(gruppo)} post su {meta.get('post_previsti')} previsti)")
        print("-" * 62)
        totale = 0
        con_dato = 0
        for p in sorted(gruppo, key=lambda x: x["n"]):
            v = valore_overall(p, "views")
            if v is None:
                print(f"  n={p['n']:2d}  views n/d — nessuna finestra loggata")
                continue
            con_dato += 1
            totale += v
            stato = "✓ sopra floor" if v >= floor_s else f"✗ SOTTO floor (-{floor_s - v:,})"
            print(f"  n={p['n']:2d}  views {v:>9,}  {stato}")
        pct = totale / floor_a * 100 if floor_a else 0
        print("-" * 62)
        print(f"  aggregato: {totale:,} / {floor_a:,} views  ({pct:.1f}%)"
              f"  — gap: {max(0, floor_a - totale):,}  [{con_dato}/{len(gruppo)} post con dato]")

    print()
    if errori:
        print(f"ESITO: BLOCCATO — {len(errori)} errori da correggere in data/posts.json")
        return 1
    print(f"ESITO: OK — build consentito ({len(avvisi)} avvisi aperti)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
