// ============================================================
//  api/track.js — Tracker eventi Dashboard "ZonaFanta × Polymarket"
//  Serverless per Vercel (Node 18+).
//
//  DUE TIPI DI MESSAGGIO SU TELEGRAM:
//   • PING LIVE  → in tempo reale, sui momenti che contano
//     (apertura dashboard · vista aggregata/floor · apertura scheda
//      di un post · click sul link a un post IG · export).
//   • REPORT FINALE → quando il visitatore chiude/esce: resoconto
//     completo con durata totale, tempo per sezione, post più
//     guardato, link cliccati, export, scroll e timeline cronologica
//     con orari.
//
//  CONFIG:  Environment Variables su Vercel (obbligatorio) —
//    TELEGRAM_BOT_TOKEN , TELEGRAM_CHAT_ID  → poi RIDEPLOYA.
//    (Bot NUOVO dedicato a questo progetto: crea il bot con @BotFather,
//     ricava il chat_id scrivendo al bot e leggendo getUpdates.)
//
//  DIAGNOSTICA:  https://<tuo-dominio>.vercel.app/api/track?debug=1
//                 → manda un test e mostra la risposta reale di
//                   Telegram (nessun segreto esposto).
// ============================================================

// Token e chat vivono SOLO nelle env var su Vercel (mai in chiaro qui).
// Dopo averle impostate su Vercel, RIDEPLOYA.
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID   || "";

// Fuso per gli orari nei messaggi
const TZ = "Europe/Rome";

// ------------------------------------------------------------
// Etichette leggibili per le sezioni della DASHBOARD
// (id lato client -> testo umano nei messaggi)
// ------------------------------------------------------------
const SECTION_LABEL = {
  header:      "Intestazione / meta collab",
  aggregato:   "Vista aggregata (reach/views totali)",
  floor:       "Stato floor (100K/post · 1.5M aggregato)",
  finestre:    "Segmentazione finestre (1g/3g/7g/30g)",
  posts:       "Elenco post",
  storico:     "Storico collab precedente",
  note:        "Note / metodo"
};

// ------------------------------------------------------------
// Etichette per i SINGOLI POST della collab estiva.
// La chiave è lo slug che passi dal client (data-post="...").
// Consiglio: usa il numero del post come slug (es. "post-6").
// ------------------------------------------------------------
const POST_LABEL = {
  "post-6":  "#6 · Il Mondiale non è roba per la Serie A",
  "post-7":  "#7 · Dove si trasferirà Dušan Vlahović?",
  "post-8":  "#8 · Messi favorito classifica marcatori",
  "post-9":  "#9 · Marocco/Paraguay ai rigori — non scendiamo dal carro",
  "post-10": "#10 · L'assistman farà gol al Mondiale? (Olise)",
  "post-11": "#11 · Haaland è il Majin Bu di questo Mondiale",
  "post-12": "#12 · Semifinaliste Mondiale",
  // storico (rif.)
  "post-1":  "#1 · La Roma andrà in Champions",
  "post-2":  "#2 · La Lazio vincerà la Coppa Italia?",
  "post-3":  "#3 · Cremonese vs Lecce — l'ultima giornata",
  "post-4":  "#4 · Ve lo avevamo detto — la Roma è in Champions",
  "post-5":  "#5 · Messi, Ronaldo e Neymar — chi vince il Mondiale"
};

// ------------------------------------------------------------
// Etichette per interazioni granulari (deep-dive / click).
// La chiave è l'id che passi dal client (data-dd="...").
// ------------------------------------------------------------
const DEEPDIVE_LABEL = {
  // toggle di finestra temporale nella vista aggregata o in scheda
  "win-1g":  "Finestra 1g",
  "win-3g":  "Finestra 3g",
  "win-7g":  "Finestra 7g",
  "win-30g": "Finestra 30g",
  // apertura/espansione della scheda di un post
  "card-open": "Apertura scheda post",
  // export dashboard
  "export-pdf":   "Export · PDF",
  "export-png":   "Export · immagine",
  "export-csv":   "Export · CSV dati",
  "export-print": "Export · stampa",
  // apertura del mercato Polymarket collegato
  "market-open":  "Apertura mercato Polymarket"
};

// I link "esterni" cliccabili nella dashboard (post IG, profilo, mercato).
// key = id passato dal client (data-link="...").
const LINK_LABEL = {
  "ig-post":    "Link · post Instagram",
  "ig-profile": "Link · profilo @zonafanta",
  "market":     "Link · mercato Polymarket"
};

function secLabel(id){ return SECTION_LABEL[id] || id; }
function postLabel(id){ return POST_LABEL[id] || id; }
function ddLabel(id){ return DEEPDIVE_LABEL[id] || id; }
function linkLabel(id){ return LINK_LABEL[id] || id; }

// ------------------------------------------------------------
// Geo: nomi leggibili per il messaggio Telegram
// ------------------------------------------------------------
// Vercel manda la regione come codice ISO 3166-2 (es. "25" = Lombardia)
const REGIONE_IT = {
  "21":"Piemonte", "23":"Valle d'Aosta", "25":"Lombardia", "32":"Trentino-Alto Adige",
  "34":"Veneto", "36":"Friuli-Venezia Giulia", "42":"Liguria", "45":"Emilia-Romagna",
  "52":"Toscana", "55":"Umbria", "57":"Marche", "62":"Lazio", "65":"Abruzzo",
  "67":"Molise", "72":"Campania", "75":"Puglia", "77":"Basilicata", "78":"Calabria",
  "82":"Sicilia", "88":"Sardegna"
};
const CITTA_IT = {
  "Milan":"Milano", "Rome":"Roma", "Turin":"Torino", "Naples":"Napoli",
  "Florence":"Firenze", "Venice":"Venezia", "Genoa":"Genova", "Padua":"Padova",
  "Syracuse":"Siracusa", "Leghorn":"Livorno"
};

function buildGeo(city, region, country){
  if (country === "IT"){
    const c = CITTA_IT[city] || city;
    const r = REGIONE_IT[region] || region;
    return [c, r].filter(Boolean).join(" · ");        // es. "Milano · Lombardia"
  }
  return [city, region, country].filter(Boolean).join(", ");  // estero: com'era
}

function fmtDur(sec){
  sec = Math.max(0, Math.round(sec || 0));
  if (sec < 60) return sec + "s";
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function clockFromMs(ms){
  try {
    return new Intl.DateTimeFormat("it-IT", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: TZ
    }).format(new Date(ms));
  } catch { return "--:--:--"; }
}

function escapeHtml(s){
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ------------------------------------------------------------
// Composizione dei messaggi
// ------------------------------------------------------------

// PING LIVE: un singolo evento importante, riga breve.
function buildPing(p){
  const sid   = (p.sid || "????").slice(0, 6);
  const dev   = p.device || "?";
  const clock = p.at ? clockFromMs(p.at) : "";
  const geo   = p.geo ? " · 🌍 " + escapeHtml(p.geo) : "";
  const head  = `🟢 <b>LIVE</b> · sess. <code>${escapeHtml(sid)}</code> · ${escapeHtml(dev)}${geo}${clock ? " · " + clock : ""}`;

  let line;
  switch (p.kind) {
    case "open":
      line = `📊 <b>Ha aperto la DASHBOARD</b>${p.ref ? `\n   provenienza: ${escapeHtml(p.ref)}` : "\n   provenienza: diretta"}`;
      break;
    case "aggregato":
      line = `📈 <b>Sta guardando la vista aggregata</b> (reach/views · floor)`;
      break;
    case "post":
      line = `🗂️ Ha aperto la scheda <b>${escapeHtml(postLabel(p.post))}</b>`;
      break;
    case "link":
      line = `🔗 <b>Click su un link</b> — ${escapeHtml(linkLabel(p.link))}${p.post ? ` (${escapeHtml(postLabel(p.post))})` : ""}`;
      break;
    case "market":
      line = `🎯 <b>Ha aperto un mercato Polymarket</b>${p.post ? ` — ${escapeHtml(postLabel(p.post))}` : ""}`;
      break;
    case "export":
      line = `📤 <b>EXPORT</b> — ${escapeHtml(ddLabel(p.id || "export-print"))}`;
      break;
    default:
      line = `• ${escapeHtml(p.kind || "evento")}`;
  }
  return `${head}\n${line}`;
}

// REPORT FINALE: resoconto completo di una visita alla dashboard.
function buildReport(r){
  const sid   = (r.sid || "????").slice(0, 6);
  const dev   = r.device || "?";
  const ref   = r.ref || "diretta";
  const geo   = r.geo || "";
  const start = r.start ? clockFromMs(r.start) : "--:--:--";
  const end   = r.end   ? clockFromMs(r.end)   : "--:--:--";
  const total = fmtDur(r.total);
  const events = Array.isArray(r.events) ? r.events : [];

  // --- aggregazioni ---
  const secTime = {};             // id sezione -> secondi
  const secHits = {};             // id sezione -> visite
  const postTime = {};            // slug post -> secondi
  const postHits = {};            // slug post -> aperture
  const linkClicks = [];          // link cliccati (in ordine)
  const marketOpens = [];         // mercati Polymarket aperti
  const exports = [];             // export effettuati
  let scrollMax = 0;

  for (const e of events){
    if (e.t === "sec" && e.id){
      secTime[e.id] = (secTime[e.id] || 0) + (e.d || 0);
      secHits[e.id] = (secHits[e.id] || 0) + 1;
    }
    if (e.t === "post" && e.id){
      postTime[e.id] = (postTime[e.id] || 0) + (e.d || 0);
      postHits[e.id] = (postHits[e.id] || 0) + 1;
    }
    if (e.t === "link" && e.id) linkClicks.push(e.id);
    if (e.t === "market") marketOpens.push(e.post || e.id || "mercato");
    if (e.t === "export") exports.push(e.id || "export");
    if (e.t === "scroll" && e.v > scrollMax) scrollMax = e.v;
  }

  const rankedSec = Object.keys(secTime)
    .map(id => ({ id, t: secTime[id], hits: secHits[id] || 1 }))
    .sort((a, b) => b.t - a.t);

  const rankedPost = Object.keys(postTime)
    .map(id => ({ id, t: postTime[id], hits: postHits[id] || 1 }))
    .sort((a, b) => b.t - a.t);

  // post "vincente": quello con più tempo di visione
  const postWinner = rankedPost.length ? rankedPost[0] : null;

  // --- costruzione testo ---
  const L = [];
  L.push(`📋 <b>REPORT VISITA</b> — Dashboard ZonaFanta × Polymarket`);
  L.push(`🆔 sess. <code>${escapeHtml(sid)}</code> · ${escapeHtml(dev)}`);
  if (geo) L.push(`🌍 ${escapeHtml(geo)}`);
  L.push(`🕐 ${start} → ${end}  ·  durata <b>${total}</b>`);
  L.push(`🔗 provenienza: ${escapeHtml(ref)}`);
  L.push("");

  // riepilogo chiave
  L.push(`<b>— In sintesi —</b>`);
  L.push(`• Sezioni viste: <b>${rankedSec.length}</b>`);
  L.push(`• Schede post aperte: <b>${rankedPost.length}</b>`);
  L.push(`• Post più guardato: <b>${postWinner ? escapeHtml(postLabel(postWinner.id)) + " (" + fmtDur(postWinner.t) + ")" : "—"}</b>`);
  L.push(`• Mercati Polymarket aperti: <b>${marketOpens.length}</b>`);
  L.push(`• Link cliccati: <b>${linkClicks.length}</b>${linkClicks.length ? ` (${escapeHtml(linkClicks.map(linkLabel).join(", "))})` : ""}`);
  L.push(`• Export: <b>${exports.length}</b>${exports.length ? ` (${escapeHtml(exports.map(ddLabel).join(", "))})` : ""}`);
  L.push(`• Scroll massimo: <b>${scrollMax}%</b>`);
  L.push("");

  // tempo per sezione
  if (rankedSec.length){
    L.push(`<b>— Tempo per sezione —</b>`);
    for (const s of rankedSec){
      const star = (s.id === "aggregato" || s.id === "floor") ? " ⭐" : "";
      L.push(`• ${escapeHtml(secLabel(s.id))}: <b>${fmtDur(s.t)}</b>${s.hits > 1 ? ` (${s.hits} visite)` : ""}${star}`);
    }
    L.push("");
  }

  // tempo per post
  if (rankedPost.length){
    L.push(`<b>— Tempo per post —</b>`);
    for (const s of rankedPost){
      L.push(`• ${escapeHtml(postLabel(s.id))}: <b>${fmtDur(s.t)}</b>${s.hits > 1 ? ` (${s.hits} aperture)` : ""}`);
    }
    L.push("");
  }

  // timeline cronologica azione per azione
  if (events.length){
    L.push(`<b>— Timeline —</b>`);
    for (const e of events){
      const clk = e.at ? clockFromMs(e.at) : "  ·  ";
      let desc = "";
      if (e.t === "open")        desc = `📊 apertura dashboard`;
      else if (e.t === "sec")    desc = `👀 ${secLabel(e.id)} — ${fmtDur(e.d)}`;
      else if (e.t === "post")   desc = `🗂️ ${postLabel(e.id)} — ${fmtDur(e.d)}`;
      else if (e.t === "link")   desc = `🔗 ${linkLabel(e.id)}${e.post ? ` (${postLabel(e.post)})` : ""}`;
      else if (e.t === "market") desc = `🎯 mercato Polymarket${e.post ? ` — ${postLabel(e.post)}` : ""}`;
      else if (e.t === "export") desc = `📤 ${ddLabel(e.id)}`;
      else if (e.t === "dd")     desc = `🔎 ${ddLabel(e.id)}`;
      else if (e.t === "scroll") desc = `📜 scroll ${e.v}%`;
      else continue;
      L.push(`<code>${clk}</code>  ${escapeHtml(desc)}`);
    }
  }

  return L.join("\n");
}

// ------------------------------------------------------------
// Invio a Telegram (ritorna la risposta per diagnostica)
// ------------------------------------------------------------
async function sendToTelegram(text){
  if (typeof fetch !== "function")
    return { ok:false, stage:"runtime", error:"fetch assente: Vercel gira su Node < 18, imposta Node 18+." };
  if (!BOT_TOKEN || !CHAT_ID)
    return { ok:false, stage:"config", error:"TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID non configurati nelle env var Vercel." };
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });
    const data = await r.json().catch(() => ({}));
    return { ok: !!data.ok, stage:"telegram", status: r.status, telegram: data };
  } catch (err) {
    return { ok:false, stage:"network", error:String(err && err.message || err) };
  }
}

// ------------------------------------------------------------
// Handler
// ------------------------------------------------------------
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  // -------- diagnostica --------
  if (req.method === "GET"){
    const url = new URL(req.url, "http://localhost");
    if (url.searchParams.get("debug") !== "1")
      return res.status(200).json({ ok:true, hint:"Aggiungi ?debug=1 all'URL di questa route per testare l'invio al bot." });
    const result = await sendToTelegram("✅ <b>Test di connessione</b> — tracker Dashboard ZonaFanta × Polymarket attivo.");
    return res.status(200).json({
      configured: {
        bot_token: BOT_TOKEN ? "presente" : "MANCANTE",
        chat_id:   CHAT_ID ? String(CHAT_ID) : "MANCANTE",
        node: process.version,
        fetch: typeof fetch === "function" ? "ok" : "assente (Node < 18)"
      },
      result
    });
  }

  if (req.method !== "POST") return res.status(405).json({ ok:false });

  // -------- geo da IP (header Vercel, nessun permesso browser) --------
  function h(name){ try { return req.headers[name] || req.headers[name.toLowerCase()] || ""; } catch { return ""; } }
  function decodeGeo(v){ try { return decodeURIComponent(String(v)); } catch { return String(v || ""); } }
  const geoCity    = decodeGeo(h("x-vercel-ip-city"));
  const geoRegion  = decodeGeo(h("x-vercel-ip-country-region"));
  const geoCountry = decodeGeo(h("x-vercel-ip-country"));
  const geo = buildGeo(geoCity, geoRegion, geoCountry);

  // -------- invio dati dalla dashboard --------
  try {
    let body = req.body;
    if (typeof body === "string"){ try { body = JSON.parse(body); } catch { body = null; } }
    if (!body || !body.type) return res.status(200).json({ ok:false, reason:"empty" });

    if (geo) body.geo = geo;   // reso disponibile a ping e report

    let text;
    if (body.type === "ping")        text = buildPing(body);
    else if (body.type === "report") text = buildReport(body);
    else return res.status(200).json({ ok:false, reason:"unknown-type" });

    // Telegram: limite 4096 caratteri per messaggio
    if (text.length > 4000) text = text.slice(0, 3990) + "\n… (troncato)";

    const result = await sendToTelegram(text);
    return res.status(200).json({ ok: result.ok });
  } catch (err) {
    return res.status(200).json({ ok:false });
  }
};
