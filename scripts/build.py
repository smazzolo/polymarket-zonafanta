#!/usr/bin/env python3
"""Build: data/posts.json -> dashboard/index.html + CONTESTO_PROGETTO.md + dati.md

Uso:  python scripts/build.py                 i 3 output standard
      python scripts/build.py --deploy DIR    in più assembla in DIR la
                                              versione per Vercel: index.html
                                              CON il tracker + api/track.js.
                                              (Lo standalone resta zero-fetch:
                                              il tracker vive SOLO nel deploy.)

Prima di tutto esegue validate.py: se trova errori bloccanti il build NON
parte (impossibile pubblicare una dashboard con dati rotti).

Output (mai da modificare a mano):
- dashboard/index.html   file unico autonomo: funziona da file://, zero fetch.
                         Le slide sono ricompresse (480px lato lungo, JPEG q60)
                         e incorporate; gli originali in assets/ restano intatti.
- CONTESTO_PROGETTO.md   accordi + stato floor
- dati.md                dump leggibile di tutti i KPI

Tutti i valori derivati (floor, aggregati, medie) sono calcolati QUI e
iniettati già pronti: il JavaScript della dashboard non fa calcoli di
business, così la logica vive in un posto solo.
"""
import base64
import io
import json
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import validate  # riusa regole, costanti e valore_overall: UNA sola implementazione

ROOT = Path(__file__).resolve().parent.parent
OUT_HTML = ROOT / "dashboard" / "index.html"
SRC = ROOT / "dashboard" / "src"

SLIDE_MAX = 480   # px lato lungo
SLIDE_Q = 60      # qualità JPEG

WINDOWS = validate.WINDOWS
KPIS = validate.KPIS


def comprimi_slide(path):
    """Ricomprime una slide per l'embed: 480px lato lungo, JPEG q60."""
    from PIL import Image
    img = Image.open(ROOT / path)
    img.thumbnail((SLIDE_MAX, SLIDE_MAX))
    if img.mode != "RGB":
        img = img.convert("RGB")
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=SLIDE_Q, optimize=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def logo_datauri(path):
    raw = (ROOT / path).read_bytes()
    ext = Path(path).suffix.lstrip(".").lower()
    mime = {"jpg": "jpeg"}.get(ext, ext)
    return f"data:image/{mime};base64," + base64.b64encode(raw).decode()


def best_post(p):
    """Il "dato più recente" di ogni KPI: overall se presente, poi g30→g7→g3→g1.
    UNICA implementazione (via validate.valore_overall): il JS non la duplica."""
    return {k: validate.valore_overall(p, k) for k in KPIS}


def calcola_derivati(meta, posts):
    floor_agg = meta["floor_aggregato_views"]
    floor_sing = meta["floor_singolo_views"]
    attivi = [p for p in posts if p["collab"] == meta["collab_attiva"]]
    best = {p["n"]: best_post(p) for p in posts}

    # aggregati precalcolati per OGNI selezione UI: sorgenti × finestra × KPI.
    # Il client fa solo lookup: DERIV.selezioni[sel][finestra][kpi]
    gruppi = {
        "estiva": [p for p in posts if p["collab"] == "estiva"],
        "storico": [p for p in posts if p["collab"] == "storico"],
        "estiva+storico": posts,
    }
    selezioni = {}
    for sel, gruppo in gruppi.items():
        selezioni[sel] = {}
        for w in WINDOWS + ["best"]:
            entry = {}
            for k in KPIS:
                vals = [(best[p["n"]][k] if w == "best" else p["insights"][w][k])
                        for p in gruppo]
                vals = [v for v in vals if v is not None]
                tot = sum(vals) if vals else None
                entry[k] = {
                    "total": tot,
                    "media": round(tot / len(vals)) if vals else None,
                    "n": len(vals),
                    "tot": len(gruppo),
                    "pct_floor": (tot / floor_agg) if tot is not None else 0,
                }
            selezioni[sel][w] = entry

    # split statico estiva/storico (card sotto l'hero)
    split = {}
    for sel in ("estiva", "storico"):
        v = selezioni[sel]["best"]["views"]["total"]
        r = selezioni[sel]["best"]["reach"]["total"]
        split[sel] = {
            "views": v, "reach": r, "n": len(gruppi[sel]),
            "pct_floor_100": min(100, v / floor_agg * 100) if v is not None else 0,
        }

    per_post = []
    tot_views = 0
    con_dato = 0
    for p in sorted(attivi, key=lambda x: x["n"]):
        v = best[p["n"]]["views"]
        r = best[p["n"]]["reach"]
        if v is not None:
            tot_views += v
            con_dato += 1
        per_post.append({
            "n": p["n"], "titolo": p["titolo"], "views": v, "reach": r,
            "sopra": (v is not None and v >= floor_sing),
        })

    post_ok = sum(1 for r in per_post if r["sopra"])
    reach_vals = [r["reach"] for r in per_post if r["reach"] is not None]
    return {
        "generato_il": date.today().isoformat(),
        "selezioni": selezioni,
        "split": split,
        "floor": {
            "views_totali": tot_views,
            "pct": tot_views / floor_agg * 100,
            "gap": max(0, floor_agg - tot_views),
            "post_con_dato": con_dato,
            "post_totali": len(attivi),
            "post_ok": post_ok,
            "post_sotto": con_dato - post_ok,
            "pct_singolo": round(post_ok / con_dato * 100) if con_dato else 0,
            "per_post": per_post,
            "reach_media_post": round(sum(reach_vals) / len(reach_vals)) if reach_vals else None,
        },
    }


def build_html(meta, posts, derivati):
    floor_sing = meta["floor_singolo_views"]
    payload_meta = {k: v for k, v in meta.items() if k != "logo"}
    payload_meta["logo_datauri"] = logo_datauri(meta["logo"])
    # logo per lo sfondo interattivo (zfField): asset di design del tema
    payload_meta["logo_field_datauri"] = logo_datauri("dashboard/src/logo-field.png")

    # n_collab (numerazione interna alla collab) è DERIVATO: calcolato qui, mai nel JSON
    n_collab = {}
    for collab in ("estiva", "storico"):
        for i, p in enumerate(sorted([x for x in posts if x["collab"] == collab],
                                     key=lambda x: x["n"]), 1):
            n_collab[p["n"]] = i

    payload_posts = []
    peso_slide = 0
    for p in sorted(posts, key=lambda x: x["n"]):
        q = {k: v for k, v in p.items() if k != "slides"}
        q["slides_datauri"] = [comprimi_slide(s) for s in p["slides"]]
        peso_slide += sum(len(s) for s in q["slides_datauri"])
        q["n_collab"] = n_collab[p["n"]]
        q["best"] = best_post(p)
        v = q["best"]["views"]
        q["floor_ok"] = (v is not None and v >= floor_sing)
        # intensità 0..1 di quanto supera il floor (per la tinta della timeline)
        q["floor_over"] = min(1, max(0, (v / floor_sing - 1) / 2.5)) if q["floor_ok"] else 0
        payload_posts.append(q)

    payload = {"meta": payload_meta, "posts": payload_posts, "derivati": derivati}
    blob = json.dumps(payload, ensure_ascii=False)
    # dentro un <script>: spezza qualsiasi sequenza che chiuderebbe il tag
    blob = blob.replace("</", "<\\/")

    css = (SRC / "styles.css").read_text(encoding="utf-8")
    # Montserrat embedded al posto dell'@import Google Fonts (fetch esterno vietato)
    import_riga = next((r for r in css.splitlines() if "@import" in r), None)
    if import_riga:
        css = css.replace(import_riga, (SRC / "fonts.css").read_text(encoding="utf-8"))

    html = (SRC / "template.html").read_text(encoding="utf-8")
    html = html.replace("/*%CSS%*/", css)
    html = html.replace("/*%DATA%*/", blob)
    html = html.replace("/*%APP%*/", (SRC / "app.js").read_text(encoding="utf-8"))
    OUT_HTML.write_text(html, encoding="utf-8")
    return len(html), peso_slide


def fmtn(v):
    return "n/d" if v is None else f"{v:,}".replace(",", ".")


def build_contesto(meta, posts, derivati):
    f = derivati["floor"]
    attivi = sorted([p for p in posts if p["collab"] == meta["collab_attiva"]], key=lambda x: x["n"])
    righe = "\n".join(
        f"| {p['n']} | {p['titolo'][:60]} | {p['data']} | "
        f"{fmtn(validate.valore_overall(p, 'views'))} | "
        f"{'✓' if (validate.valore_overall(p, 'views') or 0) >= meta['floor_singolo_views'] else '✗'} |"
        for p in attivi)
    (ROOT / "CONTESTO_PROGETTO.md").write_text(f"""<!-- OUTPUT GENERATO da scripts/build.py il {derivati['generato_il']} — NON MODIFICARE A MANO.
     La fonte è data/posts.json. -->

# Contesto progetto — {meta['publisher']} × {meta['cliente']}

## Accordi

- **Cliente:** {meta['cliente']} (referente: {meta['referente']})
- **Publisher:** {meta['publisher']} — {meta['canale']} ({meta['profilo_ig']})
- **Ritmo:** {meta['ritmo']}
- **Post previsti (collab {meta['collab_attiva']}):** {meta['post_previsti']}
- **Floor singolo:** {fmtn(meta['floor_singolo_views'])} views minime per post (non compensabile)
- **Floor aggregato:** {fmtn(meta['floor_aggregato_views'])} views totali sulla collab
- **Recupero:** se un floor non è raggiunto a fine ciclo, si aggiungono post fino al {meta['scadenza']}

## Stato floor (al {derivati['generato_il']})

- **Aggregato:** {fmtn(f['views_totali'])} / {fmtn(meta['floor_aggregato_views'])} views
  (**{f['pct']:.1f}%**, gap {fmtn(f['gap'])}) — {f['post_con_dato']}/{f['post_totali']} post con dato
- **Reach media per post:** {fmtn(f['reach_media_post'])}

| n | titolo | pubblicato | views (overall) | floor 100K |
|---|--------|-----------|-----------------|------------|
{righe}

*I 5 post `storico` (collab precedente) sono tracciati in dashboard ma esclusi dai floor.*
""", encoding="utf-8")


def build_dati_md(meta, posts, derivati):
    out = [f"""<!-- OUTPUT GENERATO da scripts/build.py il {derivati['generato_il']} — NON MODIFICARE A MANO.
     La fonte è data/posts.json. -->

# Dati completi — {meta['publisher']} × {meta['cliente']}

Dato mancante = n/d (mai stimato). Finestre: giorno di pubblicazione = g0.
"""]
    for p in sorted(posts, key=lambda x: x["n"]):
        cols = WINDOWS + (["overall"] if p["overall"] else [])
        head = " | ".join(cols)
        righe = []
        for k in KPIS:
            vals = [p["insights"][w].get(k) for w in WINDOWS]
            if p["overall"]:
                vals.append(p["overall"].get(k))
            righe.append(f"| {k} | " + " | ".join(fmtn(v) for v in vals) + " |")
        ov_note = f" · overall letto il {p['overall']['aggiornato']}" if p["overall"] else ""
        pub = p.get("pubblici")
        pub_line = (f"\nPubblici (al {pub['aggiornato']}): like {fmtn(pub['like'])} · "
                    f"commenti {fmtn(pub['commenti'])} · condivisioni {fmtn(pub['condivisioni'])}"
                    if pub else "")
        out.append(f"""## #{p['n']} — {p['titolo']}

`{p['collab']}` · pubblicato {p['data']} · {p['tipo']} · mercato: {p['mercato']['nome']}{ov_note}
{p['url'] or '(url post n/d)'}

| KPI | {head} |
|-----|{'|'.join(['---'] * len(cols))}|
{chr(10).join(righe)}
{pub_line}
""")
    (ROOT / "dati.md").write_text("\n".join(out), encoding="utf-8")


def build_deploy(deploy_dir):
    """Assembla la versione per Vercel: standalone + tracker client iniettato
    prima di </body>, più le serverless in api/. Lo standalone su disco
    (dashboard/index.html) NON viene toccato."""
    import shutil
    deploy_dir = Path(deploy_dir)
    deploy_dir.mkdir(parents=True, exist_ok=True)

    html = OUT_HTML.read_text(encoding="utf-8")
    tracker = (SRC / "tracker.js").read_text(encoding="utf-8")
    blocco = ("<!-- ===== TRACKER CLIENT (solo versione deploy, mai nello "
              f"standalone) ===== -->\n<script>\n{tracker}\n</script>\n</body>")
    assert html.count("</body>") == 1
    (deploy_dir / "index.html").write_text(html.replace("</body>", blocco),
                                           encoding="utf-8")

    shutil.copytree(ROOT / "api", deploy_dir / "api", dirs_exist_ok=True)
    return deploy_dir


def main(argv):
    deploy_dir = None
    if "--deploy" in argv:
        i = argv.index("--deploy")
        if i + 1 >= len(argv):
            print("ERRORE: --deploy richiede la cartella di destinazione")
            return 1
        deploy_dir = argv[i + 1]

    print("1/4  validazione…")
    if validate.main() != 0:
        print("\nBUILD BLOCCATO: correggi gli errori in data/posts.json e rilancia.")
        return 1

    dati = json.loads((ROOT / "data" / "posts.json").read_text(encoding="utf-8"))
    meta, posts = dati["meta"], dati["posts"]
    derivati = calcola_derivati(meta, posts)

    print("2/4  comprimo le slide e genero dashboard/index.html…")
    tot, peso_slide = build_html(meta, posts, derivati)
    print(f"     index.html: {tot / 1e6:.2f} MB (di cui slide compresse {peso_slide / 1e6:.2f} MB)")

    print("3/4  genero CONTESTO_PROGETTO.md…")
    build_contesto(meta, posts, derivati)
    print("4/4  genero dati.md…")
    build_dati_md(meta, posts, derivati)

    if deploy_dir:
        d = build_deploy(deploy_dir)
        print(f"+    versione deploy (con tracker) assemblata in {d}/")

    print("\nBUILD OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
