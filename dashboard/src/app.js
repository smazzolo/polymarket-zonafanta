
const DATA = JSON.parse(document.getElementById("data").textContent);
// STRATO DATI (Fase 2): ogni valore derivato arriva PRECALCOLATO da scripts/build.py
// (derivati.selezioni / derivati.split / derivati.floor / p.best). Qui solo lookup
// e presentazione: nessuna somma, nessuna regola di business nel client.
const DERIV = DATA.derivati;
// ===== LINGUA IT/EN =====
// bandierina in alto a destra; ?lang=en nel link apre già in inglese; la scelta resta nel browser.
// Restano in italiano i dati dei post (titoli, mercati, note): sono i contenuti originali.
const LANGS=["it","en"];
let LANG=(function(){
  try{const q=new URLSearchParams(location.search).get("lang");if(LANGS.includes(q))return q;}catch(e){}
  try{const s=localStorage.getItem("zfLang");if(LANGS.includes(s))return s;}catch(e){}
  return "it";
})();
const I18N={
  it:{
    nd:"n/d", months:["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"],
    h1:"Performance Feed — Post sponsorizzati Instagram",
    sub:"Reach-first reporting · Publisher: ZonaFanta · Cliente: Polymarket Italia",
    updated:"Aggiornato:", aria_light:"Tema chiaro", title_light:"Chiaro", aria_dark:"Tema scuro", title_dark:"Scuro",
    sel_sources:"Sorgenti · clicca per sommare", sel_window:"Finestra temporale",
    nstar_sub:"Collab estiva · visualizzazioni per finestra temporale (totale e media per post)",
    drop_btn:"Tabella dati compatta", sec_timeline:"Timeline collaborazione — scorri", sec_feed:"Feed post — collab estiva",
    sec_storico:"Collab precedente — blocco storico (chiuso)",
    storico_note:"Post della collaborazione precedente, entrambi i target superati. Esclusi dai calcoli della collab estiva.",
    footer:"Dati popolati esclusivamente da screenshot insights Instagram. Valori non ancora rilevati = <b>n/d</b>. Nessun dato stimato.",
    legend:"Metrica primaria: Reach. Finestre: +24h / +3g / +7g / +30g. I contatori like/commenti/condivisioni sono dati pubblici, non insights.",
    win_g1:"+24h", win_g3:"+3 giorni", win_g7:"+7 giorni", win_g30:"+30 giorni", win_overall:"Overall a oggi", win_best:"Totale", win_best_sub:"dato più recente",
    sl_g1:"+24h", sl_g3:"+3g", sl_g7:"+7g", sl_g30:"+30g", sl_best:"Totale",
    kpi_reach:"Reach (copertura)", kpi_views:"Visualizzazioni", kpi_commenti:"Commenti", kpi_condivisioni:"Condivisioni", kpi_salvati:"Salvati", kpi_dm:"Invii in DM", kpi_sondaggi:"Risposte sondaggi",
    opt_estiva:"Obiettivo attuale", opt_estiva_sub:"collab estiva", opt_storico:"Obiettivo precedente", opt_storico_sub:"collab chiusa",
    src_estiva:"attuale", src_storico:"precedente",
    hero_hit:"✓ Obiettivo aggregato raggiunto", hero_pct:"{0}% del floor {1}M", hero_label:"{0} · finestra {1} · {2} post",
    hero_exact:"{0} visualizzazioni · media {1} / post", hero_reach:"Reach (account raggiunti)",
    win_tot:"Visualizzazioni totali", win_avg:"Views media / post", n_posts:"{0}/{1} post",
    wc_best:"Mostra il dato più recente disponibile per ogni post", wc_win:"Dato presente su <b>{0}/{1}</b> post attivi in finestra {2}",
    dt_head:"Post · finestra {0}", dt_tot:"Totale ({0} post)",
    cs_estiva:"Collab estiva", cs_live:"In corso", cs_prog:"<b>{0}%</b> del floor {1}M · {2}/{3} post",
    cs_views:"Visualizzazioni", cs_reach:"Reach", cs_posts:"Post", cs_storico:"Collab precedente", cs_done:"Chiusa ✓",
    cs_done_lbl:"<b>Completata</b> · {0} post · target superati",
    fa_title:"Floor aggregato — il ciclo raggiunge {0} views?", fa_scope:"Somma views sui {0} post previsti · collab estiva",
    chip_over:"Obiettivo superato ✓", chip_live:"In corso", fa_prog:"Progresso verso il floor",
    fa_over:"<b>+{0}%</b> oltre l'obiettivo · {1} views in più del floor {2}", fa_cur:"{0} views accumulate",
    fa_foot:"{0}/{1} post pubblicati · {2} con insights",
    fs_title:"Floor singolo — ogni post supera {0} views?", fs_scope:"Soglia per post non compensabile · {0} minimo ciascuno",
    chip_under:"{0} sotto soglia", chip_all:"Tutti sopra ✓", chip_wait:"In attesa dati", fs_ok:"Post sopra soglia",
    fs_with:"{0} / {1} con dato", fs_cur:"{0}/{1} post conformi", fs_note:"Su post con insights disponibili", fs_none:"Nessun dato insights ancora rilevato",
    tl_sep:"inizio collab estiva", att_g7:"+7g il {0}", att_coming:"* in arrivo: {0}",
    removed_note:"⚠️ Post rimosso da Instagram il {0} — i dati si fermano all'ultima lettura disponibile",
    removed_btn:"Post non più online (rimosso il {0})", open_ig:"Apri post su Instagram",
    tag_storico:"Storico", tag_estiva:"Collab estiva", handle_estiva:" estiva", handle_storico:" storico",
    pub_like:"Mi piace (pubblico)", pub_comm:"Commenti (pubblico)", pub_share:"Condivisioni (pubblico)", pub_note:"Contatori pubblici · aggiornati {0}",
    market:"Mercato:", ov_read:"letto",
    toast:'🐄 <span class="em">MUUU</span> &nbsp;vaiiii toroooo, spamma sta ZONA 🏟'
  },
  en:{
    nd:"n/a", months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    h1:"Performance Feed — Sponsored Instagram posts",
    sub:"Reach-first reporting · Publisher: ZonaFanta · Client: Polymarket Italia",
    updated:"Updated:", aria_light:"Light theme", title_light:"Light", aria_dark:"Dark theme", title_dark:"Dark",
    sel_sources:"Sources · click to combine", sel_window:"Time window",
    nstar_sub:"Summer collab · views by time window (total and average per post)",
    drop_btn:"Compact data table", sec_timeline:"Collaboration timeline — scroll", sec_feed:"Post feed — summer collab",
    sec_storico:"Previous collab — archive (closed)",
    storico_note:"Posts from the previous collaboration, both targets exceeded. Not counted in the summer collab figures.",
    footer:"Data taken only from Instagram insights screenshots. Values not yet recorded = <b>n/a</b>. No estimated figures.",
    legend:"Primary metric: Reach. Windows: +24h / +3d / +7d / +30d. Like/comment/share counters are public figures, not insights.",
    win_g1:"+24h", win_g3:"+3 days", win_g7:"+7 days", win_g30:"+30 days", win_overall:"Overall to date", win_best:"Total", win_best_sub:"latest data",
    sl_g1:"+24h", sl_g3:"+3d", sl_g7:"+7d", sl_g30:"+30d", sl_best:"Total",
    kpi_reach:"Reach", kpi_views:"Views", kpi_commenti:"Comments", kpi_condivisioni:"Shares", kpi_salvati:"Saves", kpi_dm:"DM sends", kpi_sondaggi:"Poll responses",
    opt_estiva:"Current target", opt_estiva_sub:"summer collab", opt_storico:"Previous target", opt_storico_sub:"closed collab",
    src_estiva:"current", src_storico:"previous",
    hero_hit:"✓ Aggregate target reached", hero_pct:"{0}% of the {1}M floor", hero_label:"{0} · {1} window · {2} posts",
    hero_exact:"{0} views · avg {1} / post", hero_reach:"Reach (accounts reached)",
    win_tot:"Total views", win_avg:"Avg views / post", n_posts:"{0}/{1} posts",
    wc_best:"Shows the latest available data for each post", wc_win:"Data available for <b>{0}/{1}</b> active posts in the {2} window",
    dt_head:"Post · {0} window", dt_tot:"Total ({0} posts)",
    cs_estiva:"Summer collab", cs_live:"Ongoing", cs_prog:"<b>{0}%</b> of the {1}M floor · {2}/{3} posts",
    cs_views:"Views", cs_reach:"Reach", cs_posts:"Posts", cs_storico:"Previous collab", cs_done:"Closed ✓",
    cs_done_lbl:"<b>Completed</b> · {0} posts · targets exceeded",
    fa_title:"Aggregate floor — does the cycle reach {0} views?", fa_scope:"Total views across the {0} planned posts · summer collab",
    chip_over:"Target exceeded ✓", chip_live:"Ongoing", fa_prog:"Progress toward the floor",
    fa_over:"<b>+{0}%</b> above target · {1} views over the {2} floor", fa_cur:"{0} views accumulated",
    fa_foot:"{0}/{1} posts published · {2} with insights",
    fs_title:"Single-post floor — does every post exceed {0} views?", fs_scope:"Per-post threshold, cannot be offset · {0} minimum each",
    chip_under:"{0} below threshold", chip_all:"All above ✓", chip_wait:"Awaiting data", fs_ok:"Posts above threshold",
    fs_with:"{0} / {1} with data", fs_cur:"{0}/{1} posts compliant", fs_note:"Based on posts with insights available", fs_none:"No insights data recorded yet",
    tl_sep:"summer collab starts", att_g7:"+7d on {0}", att_coming:"* coming: {0}",
    removed_note:"⚠️ Post removed from Instagram on {0} — data stops at the last available reading",
    removed_btn:"Post no longer online (removed on {0})", open_ig:"Open post on Instagram",
    tag_storico:"Archive", tag_estiva:"Summer collab", handle_estiva:" summer", handle_storico:" archive",
    pub_like:"Likes (public)", pub_comm:"Comments (public)", pub_share:"Shares (public)", pub_note:"Public counters · updated {0}",
    market:"Market:", ov_read:"read",
    toast:'🐄 <span class="em">MOOO</span> &nbsp;let\'s gooo, spam the ZONA 🏟'
  }
};
function t(k){const d=I18N[LANG]||I18N.it;return d[k]!==undefined?d[k]:I18N.it[k];}
// testo con segnaposto {0},{1}…
function tf(k,...a){return t(k).replace(/\{(\d+)\}/g,(_,i)=>a[i]);}
const LOCALE=()=>LANG==="en"?"en-US":"it-IT";
const dec=x=>LANG==="en"?String(x):String(x).replace(".",",");   // separatore decimale della lingua
// testi fissi del template: data-i18n (testo), data-i18n-html, data-i18n-attr="attr:chiave;attr:chiave"
function applyStatic(){
  document.documentElement.lang=LANG;
  document.querySelectorAll("[data-i18n]").forEach(el=>{el.textContent=t(el.dataset.i18n);});
  document.querySelectorAll("[data-i18n-html]").forEach(el=>{el.innerHTML=t(el.dataset.i18nHtml);});
  document.querySelectorAll("[data-i18n-attr]").forEach(el=>el.dataset.i18nAttr.split(";").forEach(c=>{const [a,k]=c.split(":");el.setAttribute(a,t(k));}));
  const lt=document.getElementById("langToggle");
  if(lt) lt.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.langSet===LANG));
}
const WINDOWS=[["g1","win_g1"],["g3","win_g3"],["g7","win_g7"],["g30","win_g30"],["overall","win_overall"]];
const WIN_BOX=[["g1","win_g1"],["g3","win_g3"],["g7","win_g7"],["g30","win_g30"]];
// "overall" in card = dato più recente disponibile (p.best, calcolato in build.py)
function getKPI(p,w,key){ return w==="overall" ? p.best[key] : p.insights[w][key]; }
const KPIS=[["reach","kpi_reach",true],["views","kpi_views"],["commenti","kpi_commenti"],["condivisioni","kpi_condivisioni"],["salvati","kpi_salvati"],["dm","kpi_dm"],["sondaggi","kpi_sondaggi"]];
const fmt=v=>(v===null||v===undefined)?t("nd"):v.toLocaleString(LOCALE());
const isND=v=>v===null||v===undefined;
const ALL_POSTS=DATA.posts;
// insieme post attivi (collab estiva) e blocco storico
const POSTS=ALL_POSTS.filter(p=>p.collab==="estiva");
const STORICI=ALL_POSTS.filter(p=>p.collab==="storico");

// ===== stato UI =====
const STATE={ collab:new Set(["estiva"]), win:"best" };
const COLLAB_OPTS=[["estiva","opt_estiva","opt_estiva_sub"],["storico","opt_storico","opt_storico_sub"]];
const WIN_OPTS=[["best","win_best","win_best_sub"],["g1","win_g1",""],["g3","win_g3",""],["g7","win_g7",""],["g30","win_g30",""]];
function winLabel(){const o=WIN_OPTS.find(o=>o[0]===STATE.win);return o?t(o[1]):"";}

function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function perfTint(pct){
  // sotto obiettivo: dal grigio-ink verso verde brand; al/oltre obiettivo: verde sempre più intenso
  const dark = document.documentElement.getAttribute("data-theme")==="dark";
  if(pct<=0) return dark?"#9AA1A6":"#626B70";
  if(pct<1){ const t=clamp(pct,0,1);
    // interpola muted -> green-dark
    return mix(dark?[164,172,177]:[98,107,112],[59,122,55],t); }
  // >=1: green-dark -> green-deep (più intenso quanto più supera)
  const over=clamp((pct-1)/0.6,0,1);
  return mix([59,122,55],[28,92,41],over);
}
function mix(a,b,t){const r=Math.round(a[0]+(b[0]-a[0])*t),g=Math.round(a[1]+(b[1]-a[1])*t),bl=Math.round(a[2]+(b[2]-a[2])*t);return `rgb(${r},${g},${bl})`;}
function applyFX(pct){
  const fx=document.getElementById("bgFX"); if(!fx) return;
  const p=clamp(pct,0,1.4);
  // più sopra obiettivo -> più verde intenso e opaco
  const intensity = 0.28 + clamp(p,0,1.2)*0.42;     // 0.28..~0.78
  const opacity   = 0.35 + clamp(p,0,1.2)*0.35;     // 0.35..~0.77
  const color = pct>=1 ? "var(--green-deep)" : "var(--green)";
  fx.style.setProperty("--fx-int", intensity.toFixed(2));
  fx.style.setProperty("--fx-op", opacity.toFixed(2));
  fx.style.setProperty("--fx-color", color);
}


// post attivi = unione delle collab selezionate
function activePosts(){ return ALL_POSTS.filter(p=>STATE.collab.has(p.collab)); }
// chiave della selezione corrente nei derivati precalcolati dal build
function selKey(){ return [...STATE.collab].sort().join("+"); }
// aggregato precalcolato {total, media, n, tot, pct_floor} per (selezione, finestra, kpi)
function selAgg(win,key){ return DERIV.selezioni[selKey()][win][key]; }
// valore di un KPI per un post nella finestra scelta. win="best" = miglior dato disponibile (da build).
function postVal(p,key){
  if(STATE.win==="best") return p.best[key];
  return getKPI(p,STATE.win,key);
}
// somma/conteggio di un KPI sui post attivi nella finestra scelta (precalcolata dal build)
function sumActive(key){ return selAgg(STATE.win,key); }

function fmtDate(iso){if(!iso)return"—";const m=t("months");const d=new Date(iso);if(isNaN(d))return"—";return d.getDate()+" "+m[d.getMonth()]+" "+d.getFullYear();}
function fmtDateShort(iso){if(!iso)return"—";const m=t("months");const d=new Date(iso);if(isNaN(d))return"—";return d.getDate()+" "+m[d.getMonth()];}
function fmtCompact(v){if(isND(v))return t("nd");if(v>=1000000)return dec((v/1000000).toFixed(1))+"M";if(v>=1000)return Math.round(v/1000)+"K";return v.toLocaleString(LOCALE());}
// "best" per post = overall se presente, altrimenti finestra più recente (calcolato in build.py)
function bestViews(p){ return p.best.views; }
function bestReach(p){ return p.best.reach; }
// etichetta mercato: nome + eventuale nota quote/volume (dal campo strutturato)
function mercatoHTML(p){
  const m=p.mercato||{};
  const label=(m.nome||t("nd"))+(m.nota?" ("+m.nota+")":"");
  return m.url?`<a href="${m.url}" target="_blank" rel="noopener">${label}</a>`:label;
}

function coverSVG(p){
  // slide reali del carosello: data URI compressi iniettati dal build (p.slides_datauri)
  const slides = (p.slides_datauri && p.slides_datauri.length) ? p.slides_datauri : [];
  if(slides.length){
    const imgs = slides.map(s=>`<img src="${s}" alt="slide post ${p.n}" loading="lazy">`).join("");
    const dots = slides.length>1 ? `<div class="ig-dots">${slides.map((_,i)=>`<span class="${i===0?'on':''}"></span>`).join("")}</div>` : "";
    const navs = slides.length>1 ? `<button class="ig-nav prev" data-dir="-1">‹</button><button class="ig-nav next" data-dir="1">›</button>` : "";
    return `<div class="ig-carousel" data-n="${slides.length}"><div class="track">${imgs}</div>${navs}${dots}</div>`;
  }
  // fallback: mockup SVG se non ci sono immagini
  const t=p.titolo.toUpperCase();
  const words=t.split(" ");const mid=Math.ceil(words.length/2);
  const l1=words.slice(0,mid).join(" ");const l2=words.slice(mid).join(" ");
  return `<svg class="ig-cover" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.titolo}">
    <rect width="400" height="500" fill="#0c0f0c"/>
    <rect x="0" y="120" width="400" height="240" fill="#161a16"/>
    <text x="200" y="250" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="58" font-weight="800" fill="#1c1f1c">ZF</text>
    <rect x="143" y="300" width="114" height="26" rx="13" fill="#5FB259"/>
    <circle cx="158" cy="313" r="4" fill="#ff2d2d"/>
    <text x="172" y="318" font-family="Montserrat,sans-serif" font-size="13" font-weight="800" fill="#0c0f0c">IN TREND</text>
    <text x="20" y="400" font-family="Montserrat,sans-serif" font-size="22" font-weight="800" fill="#ffffff">${l1.slice(0,26)}</text>
    <text x="20" y="430" font-family="Montserrat,sans-serif" font-size="22" font-weight="800" fill="#5FB259">${l2.slice(0,26)}</text>
    <text x="368" y="34" text-anchor="end" font-family="Montserrat,sans-serif" font-size="15" font-weight="800" fill="#ffffff">ZF</text>
  </svg>`;
}

function renderSelectors(){
  // pill collab (multi-somma)
  const sc=document.getElementById("selCollab");
  if(sc){ sc.innerHTML=COLLAB_OPTS.map(([k,lbl,sub])=>{
      const on=STATE.collab.has(k);
      return `<div class="pill ${on?'on':''}" data-collab="${k}"><span class="pill-check">${on?'✓':'+'}</span>${t(lbl)}<span class="pill-sub">${t(sub)}</span></div>`;}).join("");
    sc.querySelectorAll("[data-collab]").forEach(el=>el.addEventListener("click",()=>{
      const k=el.dataset.collab;
      if(STATE.collab.has(k)){ if(STATE.collab.size>1) STATE.collab.delete(k); } // mai zero sorgenti
      else STATE.collab.add(k);
      renderSelectors(); renderDynamic();
    }));
  }
  // slider finestra temporale (24h -> Totale)
  const SLIDER_ORDER=["g1","g3","g7","g30","best"];
  const SLIDER_LBL=SLIDER_ORDER.map(k=>t("sl_"+k));
  const sl=document.getElementById("winSlider");
  const ticks=document.getElementById("winTicks");
  const idxNow=Math.max(0,SLIDER_ORDER.indexOf(STATE.win));
  if(ticks){ ticks.innerHTML=SLIDER_LBL.map((l,i)=>`<span data-i="${i}" class="${i===idxNow?'on':''}">${l}</span>`).join("");
    ticks.querySelectorAll("span").forEach(s=>s.addEventListener("click",()=>{
      const i=+s.dataset.i; STATE.win=SLIDER_ORDER[i]; renderSelectors(); renderDynamic();
    }));
  }
  if(sl){ sl.value=idxNow;
    sl.style.setProperty("--sl",(idxNow/4*100)+"%");
    sl.oninput=()=>{ const i=+sl.value; STATE.win=SLIDER_ORDER[i];
      sl.style.setProperty("--sl",(i/4*100)+"%");
      // aggiorno solo i tick attivi senza re-render completo (fluido)
      ticks&&ticks.querySelectorAll("span").forEach((s,si)=>s.classList.toggle("on",si===i));
      renderDynamic();
    };
  }
}

function renderDynamic(){
  const set=activePosts();
  const v=sumActive("views"), r=sumActive("reach");
  // etichetta sorgenti selezionate
  const srcLbl=[...STATE.collab].map(c=>t("src_"+c)).join(" + ");
  const winLbl=winLabel();
  // ===== HERO dinamico + intensità reattiva =====
  const th=document.getElementById("totalHero");
  if(th){const tv=v.total,tr=r.total;
    const milioni=tv?dec((tv/1000000).toFixed(2)):null;
    const mediaPost=v.media;
    // riferimento performance: floor aggregato (collab estiva) — pct precalcolata dal build
    const floorAgg=DATA.meta.floor_aggregato_views;
    const pct = isND(tv)?0:v.pct_floor;                      // 0..>1
    const hit = pct>=1;
    const tint = perfTint(pct);                              // colore hero
    applyFX(pct);                                            // sfondo dinamico
    const badge = hit
      ? `<div class="th-badge">${t("hero_hit")}</div>`
      : (tv?`<div class="th-badge" style="background:var(--rail);color:var(--muted);border-color:var(--line-2)">${tf("hero_pct",Math.round(pct*100),dec(floorAgg/1000000))}</div>`:"");
    th.innerHTML=`<div>
        ${badge}
        <div class="th-label">${tf("hero_label",srcLbl,winLbl,set.length)}</div>
        <div class="th-num" style="--hero-col:${tint}">${milioni?`${milioni}<span class="unit">M</span>`:(tv?fmt(tv):'n/d')}</div>
        <div class="th-exact">${tf("hero_exact",fmt(tv),fmt(mediaPost))}</div>
      </div>
      <div class="th-reach">${t("hero_reach")} <b>${fmt(tr)}</b></div>`;}
  // ===== box finestra: ora mostrano i 5 periodi per i post attivi =====
  const winBoxes=WIN_BOX;
  document.getElementById("windows").innerHTML=winBoxes.map(([k,lbl])=>{
    const agg=selAgg(k,"views");
    const tot=agg.total, avg=agg.media, nVals=agg.n;
    const active=STATE.win===k;
    return `<div class="win-card" style="${active?'border-color:var(--green);background:rgba(95,178,89,0.12)':''}"><div class="win-label">${t(lbl)}</div>
      <div class="win-row"><small>${t("win_tot")}</small><span class="v ${isND(tot)?'nd':''}">${fmt(tot)}</span></div>
      <div class="win-sub"><small>${t("win_avg")}</small><span class="v ${isND(avg)?'nd':''}">${fmt(avg)}</span></div>
      <div class="win-att" style="color:#9AA39A">${tf("n_posts",nVals,set.length)}</div></div>`;}).join("");
  // contatore copertura dato nella finestra scelta
  const wc=document.getElementById("winCount");
  if(wc){ if(STATE.win==="best"){ wc.innerHTML=t("wc_best"); }
    else { wc.innerHTML=tf("wc_win",v.n,v.tot,winLbl); } }
  renderDropTable();
}


function renderDropTable(){
  const host=document.getElementById("dropTable"); if(!host) return;
  const set=activePosts();
  const winLbl=winLabel();
  const cols=KPIS;  // reach, views, commenti, condivisioni, salvati, dm, sondaggi
  const head=`<th>${tf("dt_head",winLbl)}</th>`+cols.map(c=>`<th>${t(c[1])}</th>`).join("");
  const rows=set.map(p=>{
    const cls=p.collab==="estiva"?"dt-est":"";
    const tds=cols.map(c=>{const v=postVal(p,c[0]);return `<td class="${isND(v)?'nd':''}">${fmt(v)}</td>`;}).join("");
    return `<tr><td class="${cls}" title="${p.titolo.replace(/"/g,'&quot;')}">${p.n_collab||p.n} · ${p.titolo}</td>${tds}</tr>`;
  }).join("");
  // riga totale (somma per KPI sui post attivi nella finestra)
  const totTds=cols.map(c=>{const v=sumActive(c[0]).total;return `<td class="${isND(v)?'nd':''}">${fmt(v)}</td>`;}).join("");
  const totRow=`<tr class="dt-tot"><td>${tf("dt_tot",set.length)}</td>${totTds}</tr>`;
  host.innerHTML=`<table><thead><tr>${head}</tr></thead><tbody>${rows}${totRow}</tbody></table>`;
}

function render(){
  applyStatic();
  document.getElementById("lastUpdate").textContent=fmtDate(DERIV.generato_il);
  if(DATA.meta.logo_datauri){const bl=document.getElementById("brandLogo");if(bl){bl.className="brand-logo";bl.innerHTML=`<span class="av-inner"><img src="${DATA.meta.logo_datauri}" alt="ZonaFanta"></span>`;}
    const eb=bl?bl.parentElement:null; if(eb){eb.style.display="flex";eb.style.alignItems="center";}}
  // ===== SPLIT estiva / precedente (statico, riferimento collab estiva) =====
  const cs=document.getElementById("collabSplit");
  if(cs){
    const evViews=DERIV.split.estiva.views,evReach=DERIV.split.estiva.reach;
    const stViews=DERIV.split.storico.views,stReach=DERIV.split.storico.reach;
    const floorAggCS=DATA.meta.floor_aggregato_views;
    const evPct=DERIV.split.estiva.pct_floor_100;
    cs.innerHTML=`
      <div class="csplit-card estiva" data-acc>
        <button class="csplit-head" data-acc-btn aria-expanded="false">
          <span class="ct">${t("cs_estiva")}</span>
          <span class="csplit-right"><span class="csplit-badge live">${t("cs_live")}</span><span class="acc-caret">⌄</span></span>
        </button>
        <div class="csplit-prog"><div class="csplit-bar"><span style="width:${evPct}%"></span></div>
          <div class="csplit-prog-lbl">${tf("cs_prog",Math.round(evPct),dec(floorAggCS/1000000),POSTS.length,DATA.meta.post_previsti)}</div></div>
        <div class="csplit-body">
          <div class="csplit-row"><span>${t("cs_views")}</span><span class="v ${isND(evViews)?'nd':''}">${fmt(evViews)}</span></div>
          <div class="csplit-row"><span>${t("cs_reach")}</span><span class="v ${isND(evReach)?'nd':''}">${fmt(evReach)}</span></div>
          <div class="csplit-row"><span>${t("cs_posts")}</span><span class="v">${POSTS.length}/${DATA.meta.post_previsti}</span></div>
        </div>
      </div>
      <div class="csplit-card" data-acc>
        <button class="csplit-head" data-acc-btn aria-expanded="false">
          <span class="ct">${t("cs_storico")}</span>
          <span class="csplit-right"><span class="csplit-badge done">${t("cs_done")}</span><span class="acc-caret">⌄</span></span>
        </button>
        <div class="csplit-prog"><div class="csplit-bar done"><span style="width:100%"></span></div>
          <div class="csplit-prog-lbl">${tf("cs_done_lbl",STORICI.length)}</div></div>
        <div class="csplit-body">
          <div class="csplit-row"><span>${t("cs_views")}</span><span class="v ${isND(stViews)?'nd':''}">${fmt(stViews)}</span></div>
          <div class="csplit-row"><span>${t("cs_reach")}</span><span class="v ${isND(stReach)?'nd':''}">${fmt(stReach)}</span></div>
          <div class="csplit-row"><span>${t("cs_posts")}</span><span class="v">${STORICI.length}</span></div>
        </div>
      </div>`;
    // accordion: collassato su mobile, gestione click
    cs.querySelectorAll("[data-acc-btn]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const card=btn.closest("[data-acc]");
        const open=card.classList.toggle("open");
        btn.setAttribute("aria-expanded", open?"true":"false");
      });
    });}
  renderSelectors();
  renderDynamic();
  const nPrev=DATA.meta.post_previsti;
  const floorPost=DATA.meta.floor_singolo_views;
  const floorAgg=DATA.meta.floor_aggregato_views;
  // Floor: tutto precalcolato da build.py (derivati.floor)
  const F=DERIV.floor;
  const aggCur=F.post_con_dato?F.views_totali:null;
  const aggPct=isND(aggCur)?0:Math.min(100,F.pct);          // barra: piena al 100%
  const aggReal=isND(aggCur)?0:F.pct;                         // valore vero, anche oltre 100%
  const pct1=x=>dec(Math.round(x*10)/10);
  const postiConDato={length:F.post_con_dato};
  const postiOk={length:F.post_ok};
  const postiSotto={length:F.post_sotto};
  const singPct=F.pct_singolo;
  const aggGoalLbl=dec(floorAgg/1000000)+"M";
  const postFloorLbl=(floorPost/1000)+"K";
  document.getElementById("targets").innerHTML=`
    <div class="target">
      <div class="mk-top">
        <div>
          <h3>${tf("fa_title",aggGoalLbl)}</h3>
          <div class="scope">${tf("fa_scope",nPrev)}</div>
        </div>
        <span class="mk-chip ${aggPct>=100?'':'neutral'}">${aggPct>=100?t("chip_over"):t("chip_live")}</span>
      </div>
      <div class="mk-outcome">
        <div class="mk-name">${t("fa_prog")} <small>${fmt(aggCur)} / ${fmt(floorAgg)}</small></div>
        <div class="mk-pct ${isND(aggCur)?'nd':''}">${isND(aggCur)?'n/d':pct1(aggReal)+'%'}</div>
      </div>
      <div class="bar"><span style="width:${aggPct}%"></span></div>
      ${aggReal>100?`<div class="mk-over">${tf("fa_over",pct1(aggReal-100),fmt(aggCur-floorAgg),aggGoalLbl)}</div>`:''}
      <div class="mk-foot"><span class="cur ${isND(aggCur)?'nd':''}">${tf("fa_cur",fmt(aggCur))}</span><span>${tf("fa_foot",POSTS.length,nPrev,postiConDato.length)}</span></div>
    </div>
    <div class="target">
      <div class="mk-top">
        <div>
          <h3>${tf("fs_title",postFloorLbl)}</h3>
          <div class="scope">${tf("fs_scope",postFloorLbl)}</div>
        </div>
        <span class="mk-chip ${postiSotto.length?'warn':(postiConDato.length?'':'neutral')}">${postiConDato.length?(postiSotto.length?tf("chip_under",postiSotto.length):t("chip_all")):t("chip_wait")}</span>
      </div>
      <div class="mk-outcome">
        <div class="mk-name">${t("fs_ok")} <small>${tf("fs_with",postiOk.length,postiConDato.length)}</small></div>
        <div class="mk-pct ${postiConDato.length?'':'nd'}">${postiConDato.length?singPct+'%':'n/d'}</div>
      </div>
      <div class="bar"><span style="width:${singPct}%"></span></div>
      <div class="mk-foot"><span class="cur ${postiConDato.length?'':'nd'}">${tf("fs_cur",postiOk.length,postiConDato.length)}</span><span>${postiConDato.length?t("fs_note"):t("fs_none")}</span></div>
    </div>`;
  // ===== TIMELINE cronologica (storico -> estiva) =====
  const tl=document.getElementById("timeline");
  if(tl){
    // dal più recente al meno recente (richiesta 16/7): l'estiva apre, lo storico chiude
    const ordinati=[...ALL_POSTS].sort((a,b)=>b.data.localeCompare(a.data));
    let html="";let sepMesso=false;
    ordinati.forEach((p,i)=>{
      if(!sepMesso && p.collab==="storico" && i>0){
        html+=`<div class="tl-sep"><span>${t("tl_sep")}</span></div>`;sepMesso=true;
      }
      const v=bestViews(p);
      const isEv=p.collab==="estiva";
      const has=!isND(v)?"has":"";
      const ok = p.floor_ok;                               // ha superato il floor singolo (da build)
      const overPct = ok ? p.floor_over : 0;               // 0..1 quanto lo supera (da build)
      const cardTint = ok ? mix([95,178,89],[28,92,41],overPct) : null;  // verde -> verde intenso
      html+=`<div class="tl-node ${isEv?'estiva':'storico'} ${has} ${ok?'success':''}">
        <span class="dot"></span>
        <div class="tl-card" ${ok?`style="border-color:${cardTint};box-shadow:0 0 0 1px ${cardTint}22, inset 0 0 0 100px ${cardTint}0d"`:''}>
          <div class="tl-n">${ok?'<span class="tl-ok">✓</span> ':''}Post ${p.n_collab||p.n}${isEv?'':' · st'}</div>
          <div class="tl-date">${fmtDateShort(p.data)}</div>
          <div class="tl-views ${isND(v)?'nd':''}" ${ok?`style="color:${cardTint}"`:''}>${fmtCompact(v)}</div>
          <div class="tl-vlabel">views</div>
        </div></div>`;
    });
    tl.innerHTML=html;
    tl.scrollLeft=0; // il più recente è già a sinistra
  }
  const feedOrdered=[...POSTS].sort((a,b)=>b.data.localeCompare(a.data));
  document.getElementById("feed").innerHTML=feedOrdered.map(renderPost).join("");
  // blocco storico separato
  const storicoWrap=document.getElementById("storico");
  if(storicoWrap){
    if(STORICI.length){
      storicoWrap.innerHTML=STORICI.map(renderPost).join("");
      document.getElementById("storicoLabel").style.display="flex";
      document.getElementById("storicoNote").style.display="block";
    }
  }
  attivaCaroselli();
  buildZFField();
  // toggle tabella compatta
  const db=document.getElementById("dropBtn"), dt=document.getElementById("dropTable");
  if(db && dt && !db.dataset.b){ db.dataset.b="1";
    db.addEventListener("click",()=>{ const open=dt.hasAttribute("hidden");
      if(open){ dt.removeAttribute("hidden"); db.classList.add("open"); db.setAttribute("aria-expanded","true"); }
      else { dt.setAttribute("hidden",""); db.classList.remove("open"); db.setAttribute("aria-expanded","false"); }
    });
  }
  window.__rendered=true;
}

const ZF_SVG=`<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g transform="translate(0.000000,240.000000) scale(0.100000,-0.100000)"
 stroke="none"><path d="M1245 1538 c-3 -7 -11 -41 -19 -75 l-14 -63 382 0 383 0 47 70 c25
38 46 72 46 75 0 3 -185 5 -410 5 -320 0 -412 -3 -415 -12z"/><path d="M1133 1148 c-23 -73 -53 -168 -67 -211 l-25 -78 101 3 100 3 38 121
c20 66 40 126 44 132 5 9 73 12 241 12 l234 0 51 75 51 75 -364 0 -363 0 -41
-132z"/></g></svg>`;
function buildZFField(){
  const field=document.getElementById("zfField");
  if(!field || field.dataset.built) return;
  field.dataset.built="1";
  field.innerHTML="";
  const canvas=document.createElement("canvas");
  field.appendChild(canvas);
  const ctx=canvas.getContext("2d");

  const LOGO_SRC=DATA.meta.logo_field_datauri;
  const img=new Image(); let ready=false, AR=320/122;
  img.onload=function(){ ready=true; AR=img.width/img.height; };
  img.src=LOGO_SRC;

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  let DPR,W,H;
  function resize(){
    DPR=Math.min(window.devicePixelRatio||1,2);
    W=window.innerWidth; H=window.innerHeight;
    canvas.width=W*DPR; canvas.height=H*DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize();

  const N=12; let bodies=[];
  function spawn(){
    bodies=[];
    for(let i=0;i<N;i++){
      const w=70+Math.random()*78, h=w/AR, r=Math.max(w,h)/2*0.78;
      bodies.push({
        x:Math.random()*(W-w)+w/2, y:Math.random()*(H-h)+h/2,
        vx:(Math.random()-0.5)*0.45, vy:(Math.random()-0.5)*0.45,
        w:w,h:h,r:r, rot:(Math.random()-0.5)*0.5, vr:(Math.random()-0.5)*0.006
      });
    }
  }
  spawn();
  window.addEventListener("resize",function(){
    resize();
    for(const b of bodies){ b.x=Math.max(b.r,Math.min(W-b.r,b.x)); b.y=Math.max(b.r,Math.min(H-b.r,b.y)); }
  });

  let drag=null,lastX=0,lastY=0,lastT=0,dvx=0,dvy=0,moved=false;
  function pt(e){ const t=(e.touches&&e.touches[0])?e.touches[0]:e; return {x:t.clientX,y:t.clientY}; }
  canvas.addEventListener("pointerdown",function(e){
    const p=pt(e); moved=false;
    for(let i=bodies.length-1;i>=0;i--){
      const b=bodies[i],dx=p.x-b.x,dy=p.y-b.y;
      if(dx*dx+dy*dy<=b.r*b.r){
        drag=b; b.vx=0; b.vy=0; lastX=p.x; lastY=p.y; lastT=performance.now(); dvx=dvy=0;
        canvas.classList.add("grabbing"); bodies.splice(i,1); bodies.push(b);
        canvas.setPointerCapture&&canvas.setPointerCapture(e.pointerId);
        break;
      }
    }
  });
  canvas.addEventListener("pointermove",function(e){
    if(!drag)return;
    const p=pt(e),now=performance.now(),dt=Math.max(16,now-lastT);
    dvx=(p.x-lastX)/dt*16; dvy=(p.y-lastY)/dt*16;
    if(Math.abs(p.x-lastX)+Math.abs(p.y-lastY)>2) moved=true;
    drag.x=p.x; drag.y=p.y; lastX=p.x; lastY=p.y; lastT=now;
  });
  function release(){
    if(drag){ drag.vx=Math.max(-22,Math.min(22,dvx)); drag.vy=Math.max(-22,Math.min(22,dvy)); }
    drag=null; canvas.classList.remove("grabbing");
  }
  canvas.addEventListener("pointerup",release);
  canvas.addEventListener("pointercancel",release);

  function step(){
    for(const b of bodies){
      if(b===drag)continue;
      b.x+=b.vx; b.y+=b.vy; b.rot+=b.vr;
      b.vx*=0.992; b.vy*=0.992;
      if(Math.abs(b.vx)<0.05&&Math.abs(b.vy)<0.05){ b.vx+=(Math.random()-0.5)*0.035; b.vy+=(Math.random()-0.5)*0.035; }
      if(b.x<b.r){b.x=b.r;b.vx=Math.abs(b.vx)*0.7;}
      if(b.x>W-b.r){b.x=W-b.r;b.vx=-Math.abs(b.vx)*0.7;}
      if(b.y<b.r){b.y=b.r;b.vy=Math.abs(b.vy)*0.7;}
      if(b.y>H-b.r){b.y=H-b.r;b.vy=-Math.abs(b.vy)*0.7;}
    }
    for(let a=0;a<bodies.length;a++)for(let c=a+1;c<bodies.length;c++){
      const A=bodies[a],B=bodies[c],dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy),min=A.r+B.r;
      if(d>0&&d<min){
        const nx=dx/d,ny=dy/d,ov=(min-d)/2;
        if(A!==drag){A.x-=nx*ov;A.y-=ny*ov;} if(B!==drag){B.x+=nx*ov;B.y+=ny*ov;}
        const p1=A.vx*nx+A.vy*ny,p2=B.vx*nx+B.vy*ny;
        if(A!==drag){A.vx+=(p2-p1)*nx;A.vy+=(p2-p1)*ny;} if(B!==drag){B.vx+=(p1-p2)*nx;B.vy+=(p1-p2)*ny;}
      }
    }
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    if(!ready)return;
    for(const b of bodies){
      ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.rot);
      ctx.drawImage(img,-b.w/2,-b.h/2,b.w,b.h); ctx.restore();
    }
  }
  function loop(){ if(!reduce) step(); draw(); requestAnimationFrame(loop); }
  loop();

  // se il drag non ha mosso nulla, lascia passare il click all'easter-egg
  canvas.addEventListener("click",function(e){
    if(!moved){
      const ev=new MouseEvent("click",{bubbles:true,cancelable:true,clientX:e.clientX,clientY:e.clientY});
      document.body.dispatchEvent(ev);
    }
  });
}

// ===== easter egg: click a vuoto sul background =====
(function(){
  let n=0, last=0, fast=0, toastEl=null;
  function glyphFor(){
    n++;
    const now=Date.now();
    const quick = (now-last)<450;   // click veloce
    last=now;
    if(quick){ fast++; } else { fast=0; }
    // veloce -> ZF, altrimenti alterna Z / F
    if(fast>=1) return "ZF";
    return (n%2===1)?"Z":"F";
  }
  function pulse(txt){
    const p=document.getElementById("zfPulse"); if(!p) return;
    const g=p.querySelector(".glyph");
    g.classList.remove("go"); void g.offsetWidth; // restart anim
    g.textContent=txt; g.classList.add("go");
  }
  // muggito sintetico WebAudio
  function moo(){
    try{
      const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
      const ctx=new AC();
      const o=ctx.createOscillator(), g=ctx.createGain(), lfo=ctx.createOscillator(), lg=ctx.createGain();
      o.type="sawtooth"; o.frequency.setValueAtTime(150,ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(95,ctx.currentTime+0.5);
      o.frequency.exponentialRampToValueAtTime(120,ctx.currentTime+0.95);
      lfo.frequency.value=11; lg.gain.value=14; lfo.connect(lg); lg.connect(o.frequency); // vibrato "muuu"
      const f=ctx.createBiquadFilter(); f.type="lowpass"; f.frequency.value=900;
      g.gain.setValueAtTime(0.0001,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.5,ctx.currentTime+0.08);
      g.gain.exponentialRampToValueAtTime(0.35,ctx.currentTime+0.6);
      g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+1.1);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(); lfo.start(); o.stop(ctx.currentTime+1.15); lfo.stop(ctx.currentTime+1.15);
      o.onended=()=>ctx.close();
    }catch(e){}
  }
  function toast(msg){
    if(!toastEl){ toastEl=document.createElement("div"); toastEl.className="zf-toast"; document.body.appendChild(toastEl); }
    toastEl.innerHTML=msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t=setTimeout(()=>toastEl.classList.remove("show"),3200);
  }
  function onBgClick(e){
    // solo click "a vuoto": sul field o sul body, non su elementi interattivi
    const t=e.target;
    if(t.closest('a,button,input,.feed-post,.target,.filter-card,.csplit-card,.win-card,.theme-toggle,.pill,table')) return;
    pulse(glyphFor());
    if(n>0 && n%12===0){
      moo();
      toast(t("toast"));
    }
  }
  // delego sul document (cattura i click "vuoti")
  document.addEventListener("click", onBgClick);
})();


function renderPost(p){
    const attese=[];
    if(p.g7_attesa && isND(p.insights.g7.reach)) attese.push(tf("att_g7",fmtDate(p.g7_attesa)));
    const rows=KPIS.map(([key,name,primary])=>`<tr class="${primary?'primary':''}"><td class="kpi-name">${t(name)}</td>
      ${WINDOWS.map(([w])=>{const v=getKPI(p,w,key);
        if(w==="g7" && isND(v) && p.g7_attesa) return `<td class="val nd att">*</td>`;
        if(w==="overall"){
          const s=(p.best_src||{})[key];
          const tag=(!isND(v)&&s)?`<small class="ov-src">${s.w==="overall"?t("ov_read"):s.w} · ${fmtDate(s.data)}</small>`:"";
          return `<td class="val over ${isND(v)?'nd':''}">${fmt(v)}${tag}</td>`;
        }
        return `<td class="val ${isND(v)?'nd':''}">${fmt(v)}</td>`;}).join("")}</tr>`).join("");
    const noteRow = attese.length ? `<div class="g30-note">${tf("att_coming",attese.join(" · "))}</div>` : "";
    const rimossoRow = p.rimosso ? `<div class="removed-note">${tf("removed_note",fmtDate(p.rimosso))}</div>` : "";
    const igBtn = p.rimosso
      ? `<span class="ig-btn removed">${tf("removed_btn",fmtDate(p.rimosso))}</span>`
      : `<a class="ig-btn" data-link="ig-post" data-post="post-${p.n}" href="${p.url}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>${t("open_ig")}</a>`;
    const isStorico = p.collab==="storico";
    const tagLabel = isStorico ? t("tag_storico") : t("tag_estiva");
    const tagClass = isStorico ? "shot" : "media";
    return `<div class="feed-post" data-post="post-${p.n}"><div class="ig-side">
      <div class="ig-topbar"><a class="ig-avatar" data-link="ig-profile" data-post="post-${p.n}" href="${DATA.meta.profilo_ig||'#'}" target="_blank" rel="noopener"><span class="av-inner">${DATA.meta.logo_datauri?`<img src="${DATA.meta.logo_datauri}" alt="ZonaFanta">`:'ZF'}</span></a><div class="ig-handle"><a data-link="ig-profile" data-post="post-${p.n}" href="${DATA.meta.profilo_ig||'#'}" target="_blank" rel="noopener">zonafanta</a><small>Post ${p.n_collab||p.n}${p.collab==='estiva'?t("handle_estiva"):t("handle_storico")} · ${fmtDate(p.data)}</small></div></div>
      ${coverSVG(p)}
      <div class="ig-actions"><span title="${t("pub_like")}">♥ <b>${fmt((p.pubblici||{}).like)}</b></span>
        <span title="${t("pub_comm")}">💬 <b>${fmt((p.pubblici||{}).commenti)}</b></span>
        <span title="${t("pub_share")}">↗ <b>${fmt((p.pubblici||{}).condivisioni)}</b></span></div>
      <div class="ig-pubnote">${tf("pub_note",fmtDate((p.pubblici||{}).aggiornato))}</div></div>
      <div class="ig-data"><div class="data-head"><div>
        <div class="data-title">${p.titolo}</div>
        <div class="data-meta">${fmtDate(p.data)}</div></div>
        <span class="tag ${tagClass}">${tagLabel}</span></div>
      <span class="market">${t("market")} <b>${mercatoHTML(p)}</b></span>
      <div class="kpi-scroll"><table><thead><tr><th>KPI insights</th>${WINDOWS.map(([,l])=>`<th>${t(l)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>
      ${rimossoRow}${noteRow}
      ${igBtn}
      </div></div>`;
}

function attivaCaroselli(){
  document.querySelectorAll(".ig-carousel").forEach(car=>{
    const track=car.querySelector(".track");
    const dots=car.querySelectorAll(".ig-dots span");
    car.querySelectorAll(".ig-nav").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const dir=parseInt(btn.dataset.dir,10);
        track.scrollBy({left:dir*track.clientWidth,behavior:"smooth"});
      });
    });
    if(dots.length){
      track.addEventListener("scroll",()=>{
        const idx=Math.round(track.scrollLeft/track.clientWidth);
        dots.forEach((d,i)=>d.classList.toggle("on",i===idx));
      });
    }
  });
}
// ===== switch tema chiaro/scuro =====
(function(){
  const root=document.documentElement;
  const tg=document.getElementById("themeToggle");
  if(!tg) return;
  function set(mode){
    root.setAttribute("data-theme",mode);
    tg.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.themeSet===mode));
    if(window.__rendered) render();   // ricolora hero/timeline col nuovo tema
  }
  tg.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>set(b.dataset.themeSet)));
})();
// ===== switch lingua IT/EN =====
(function(){
  const lt=document.getElementById("langToggle");
  if(!lt) return;
  lt.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{
    if(b.dataset.langSet===LANG) return;
    LANG=b.dataset.langSet;
    try{localStorage.setItem("zfLang",LANG);}catch(e){}
    try{const u=new URL(location.href);if(LANG==="it")u.searchParams.delete("lang");else u.searchParams.set("lang",LANG);history.replaceState(null,"",u);}catch(e){}
    render();
  }));
})();
render();
