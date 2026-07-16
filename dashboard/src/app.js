
const DATA = JSON.parse(document.getElementById("data").textContent);
// STRATO DATI (Fase 2): ogni valore derivato arriva PRECALCOLATO da scripts/build.py
// (derivati.selezioni / derivati.split / derivati.floor / p.best). Qui solo lookup
// e presentazione: nessuna somma, nessuna regola di business nel client.
const DERIV = DATA.derivati;
const WINDOWS=[["g1","+24h"],["g3","+3 giorni"],["g7","+7 giorni"],["g30","+30 giorni"],["overall","Overall a oggi"]];
const WIN_BOX=[["g1","+24h"],["g3","+3 giorni"],["g7","+7 giorni"],["g30","+30 giorni"]];
function getKPI(p,w,key){ return w==="overall" ? (p.overall?p.overall[key]:null) : p.insights[w][key]; }
const KPIS=[["reach","Reach (copertura)",true],["views","Visualizzazioni"],["commenti","Commenti"],["condivisioni","Condivisioni"],["salvati","Salvati"],["dm","Invii in DM"],["sondaggi","Risposte sondaggi"]];
const fmt=v=>(v===null||v===undefined)?"n/d":v.toLocaleString("it-IT");
const isND=v=>v===null||v===undefined;
const ALL_POSTS=DATA.posts;
// insieme post attivi (collab estiva) e blocco storico
const POSTS=ALL_POSTS.filter(p=>p.collab==="estiva");
const STORICI=ALL_POSTS.filter(p=>p.collab==="storico");

// ===== stato UI =====
const STATE={ collab:new Set(["estiva"]), win:"best" };
const COLLAB_OPTS=[["estiva","Obiettivo attuale","collab estiva"],["storico","Obiettivo precedente","collab chiusa"]];
const WIN_OPTS=[["best","Totale","dato più recente"],["g1","+24h",""],["g3","+3 giorni",""],["g7","+7 giorni",""],["g30","+30 giorni",""]];

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

function fmtDate(iso){if(!iso)return"—";const m=["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];const d=new Date(iso);if(isNaN(d))return"—";return d.getDate()+" "+m[d.getMonth()]+" "+d.getFullYear();}
function fmtDateShort(iso){if(!iso)return"—";const m=["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];const d=new Date(iso);if(isNaN(d))return"—";return d.getDate()+" "+m[d.getMonth()];}
function fmtCompact(v){if(isND(v))return"n/d";if(v>=1000000)return(v/1000000).toFixed(1).replace(".",",")+"M";if(v>=1000)return Math.round(v/1000)+"K";return v.toLocaleString("it-IT");}
// "best" per post = overall se presente, altrimenti finestra più recente (calcolato in build.py)
function bestViews(p){ return p.best.views; }
function bestReach(p){ return p.best.reach; }
// etichetta mercato: nome + eventuale nota quote/volume (dal campo strutturato)
function mercatoHTML(p){
  const m=p.mercato||{};
  const label=(m.nome||"n/d")+(m.nota?" ("+m.nota+")":"");
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
      return `<div class="pill ${on?'on':''}" data-collab="${k}"><span class="pill-check">${on?'✓':'+'}</span>${lbl}<span class="pill-sub">${sub}</span></div>`;}).join("");
    sc.querySelectorAll("[data-collab]").forEach(el=>el.addEventListener("click",()=>{
      const k=el.dataset.collab;
      if(STATE.collab.has(k)){ if(STATE.collab.size>1) STATE.collab.delete(k); } // mai zero sorgenti
      else STATE.collab.add(k);
      renderSelectors(); renderDynamic();
    }));
  }
  // slider finestra temporale (24h -> Totale)
  const SLIDER_ORDER=["g1","g3","g7","g30","best"];
  const SLIDER_LBL=["+24h","+3g","+7g","+30g","Totale"];
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
  const srcLbl=[...STATE.collab].map(c=>c==="estiva"?"attuale":"precedente").join(" + ");
  const winLbl=(WIN_OPTS.find(o=>o[0]===STATE.win)||["","",""])[1];
  // ===== HERO dinamico + intensità reattiva =====
  const th=document.getElementById("totalHero");
  if(th){const tv=v.total,tr=r.total;
    const milioni=tv?(tv/1000000).toFixed(2).replace(".",","):null;
    const mediaPost=v.media;
    // riferimento performance: floor aggregato (collab estiva) — pct precalcolata dal build
    const floorAgg=DATA.meta.floor_aggregato_views;
    const pct = isND(tv)?0:v.pct_floor;                      // 0..>1
    const hit = pct>=1;
    const tint = perfTint(pct);                              // colore hero
    applyFX(pct);                                            // sfondo dinamico
    const badge = hit
      ? `<div class="th-badge">✓ Obiettivo aggregato raggiunto</div>`
      : (tv?`<div class="th-badge" style="background:var(--rail);color:var(--muted);border-color:var(--line-2)">${Math.round(pct*100)}% del floor ${(floorAgg/1000000).toString().replace(".",",")}M</div>`:"");
    th.innerHTML=`<div>
        ${badge}
        <div class="th-label">${srcLbl} · finestra ${winLbl} · ${set.length} post</div>
        <div class="th-num" style="--hero-col:${tint}">${milioni?`${milioni}<span class="unit">M</span>`:(tv?fmt(tv):'n/d')}</div>
        <div class="th-exact">${fmt(tv)} visualizzazioni · media ${fmt(mediaPost)} / post</div>
      </div>
      <div class="th-reach">Reach (account raggiunti) <b>${fmt(tr)}</b></div>`;}
  // ===== box finestra: ora mostrano i 5 periodi per i post attivi =====
  const winBoxes=[["g1","+24h"],["g3","+3 giorni"],["g7","+7 giorni"],["g30","+30 giorni"]];
  document.getElementById("windows").innerHTML=winBoxes.map(([k,lbl])=>{
    const agg=selAgg(k,"views");
    const tot=agg.total, avg=agg.media, nVals=agg.n;
    const active=STATE.win===k;
    return `<div class="win-card" style="${active?'border-color:var(--green);background:rgba(95,178,89,0.12)':''}"><div class="win-label">${lbl}</div>
      <div class="win-row"><small>Visualizzazioni totali</small><span class="v ${isND(tot)?'nd':''}">${fmt(tot)}</span></div>
      <div class="win-sub"><small>Views media / post</small><span class="v ${isND(avg)?'nd':''}">${fmt(avg)}</span></div>
      <div class="win-att" style="color:#9AA39A">${nVals}/${set.length} post</div></div>`;}).join("");
  // contatore copertura dato nella finestra scelta
  const wc=document.getElementById("winCount");
  if(wc){ if(STATE.win==="best"){ wc.innerHTML=`Mostra il dato più recente disponibile per ogni post`; }
    else { wc.innerHTML=`Dato presente su <b>${v.n}/${v.tot}</b> post attivi in finestra ${winLbl}`; } }
  renderDropTable();
}


function renderDropTable(){
  const host=document.getElementById("dropTable"); if(!host) return;
  const set=activePosts();
  const winLbl=(WIN_OPTS.find(o=>o[0]===STATE.win)||["","",""])[1];
  const cols=KPIS;  // reach, views, commenti, condivisioni, salvati, dm, sondaggi
  const head=`<th>Post · finestra ${winLbl}</th>`+cols.map(c=>`<th>${c[1]}</th>`).join("");
  const rows=set.map(p=>{
    const cls=p.collab==="estiva"?"dt-est":"";
    const tds=cols.map(c=>{const v=postVal(p,c[0]);return `<td class="${isND(v)?'nd':''}">${fmt(v)}</td>`;}).join("");
    return `<tr><td class="${cls}" title="${p.titolo.replace(/"/g,'&quot;')}">${p.n_collab||p.n} · ${p.titolo}</td>${tds}</tr>`;
  }).join("");
  // riga totale (somma per KPI sui post attivi nella finestra)
  const totTds=cols.map(c=>{const v=sumActive(c[0]).total;return `<td class="${isND(v)?'nd':''}">${fmt(v)}</td>`;}).join("");
  const totRow=`<tr class="dt-tot"><td>Totale (${set.length} post)</td>${totTds}</tr>`;
  host.innerHTML=`<table><thead><tr>${head}</tr></thead><tbody>${rows}${totRow}</tbody></table>`;
}

function render(){
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
          <span class="ct">Collab estiva</span>
          <span class="csplit-right"><span class="csplit-badge live">In corso</span><span class="acc-caret">⌄</span></span>
        </button>
        <div class="csplit-prog"><div class="csplit-bar"><span style="width:${evPct}%"></span></div>
          <div class="csplit-prog-lbl"><b>${Math.round(evPct)}%</b> del floor ${(floorAggCS/1000000).toString().replace(".",",")}M · ${POSTS.length}/${DATA.meta.post_previsti} post</div></div>
        <div class="csplit-body">
          <div class="csplit-row"><span>Visualizzazioni</span><span class="v ${isND(evViews)?'nd':''}">${fmt(evViews)}</span></div>
          <div class="csplit-row"><span>Reach</span><span class="v ${isND(evReach)?'nd':''}">${fmt(evReach)}</span></div>
          <div class="csplit-row"><span>Post</span><span class="v">${POSTS.length}/${DATA.meta.post_previsti}</span></div>
        </div>
      </div>
      <div class="csplit-card" data-acc>
        <button class="csplit-head" data-acc-btn aria-expanded="false">
          <span class="ct">Collab precedente</span>
          <span class="csplit-right"><span class="csplit-badge done">Chiusa ✓</span><span class="acc-caret">⌄</span></span>
        </button>
        <div class="csplit-prog"><div class="csplit-bar done"><span style="width:100%"></span></div>
          <div class="csplit-prog-lbl"><b>Completata</b> · ${STORICI.length} post · target superati</div></div>
        <div class="csplit-body">
          <div class="csplit-row"><span>Visualizzazioni</span><span class="v ${isND(stViews)?'nd':''}">${fmt(stViews)}</span></div>
          <div class="csplit-row"><span>Reach</span><span class="v ${isND(stReach)?'nd':''}">${fmt(stReach)}</span></div>
          <div class="csplit-row"><span>Post</span><span class="v">${STORICI.length}</span></div>
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
  const aggPct=isND(aggCur)?0:Math.min(100,F.pct);
  const postiConDato={length:F.post_con_dato};
  const postiOk={length:F.post_ok};
  const postiSotto={length:F.post_sotto};
  const singPct=F.pct_singolo;
  const aggGoalLbl=(floorAgg/1000000).toString().replace(".",",")+"M";
  const postFloorLbl=(floorPost/1000)+"K";
  document.getElementById("targets").innerHTML=`
    <div class="target">
      <div class="mk-top">
        <div>
          <h3>Floor aggregato — il ciclo raggiunge ${aggGoalLbl} views?</h3>
          <div class="scope">Somma views sui ${nPrev} post previsti · collab estiva</div>
        </div>
        <span class="mk-chip ${aggPct>=100?'':'neutral'}">${aggPct>=100?'Risolto SÌ':'In corso'}</span>
      </div>
      <div class="mk-outcome">
        <div class="mk-name">Progresso verso il floor <small>${fmt(aggCur)} / ${fmt(floorAgg)}</small></div>
        <div class="mk-pct ${isND(aggCur)?'nd':''}">${isND(aggCur)?'n/d':Math.round(aggPct)+'%'}</div>
      </div>
      <div class="bar"><span style="width:${aggPct}%"></span></div>
      <div class="mk-foot"><span class="cur ${isND(aggCur)?'nd':''}">${fmt(aggCur)} views accumulate</span><span>${POSTS.length}/${nPrev} post pubblicati · ${postiConDato.length} con insights</span></div>
    </div>
    <div class="target">
      <div class="mk-top">
        <div>
          <h3>Floor singolo — ogni post supera ${postFloorLbl} views?</h3>
          <div class="scope">Soglia per post non compensabile · ${postFloorLbl} minimo ciascuno</div>
        </div>
        <span class="mk-chip ${postiSotto.length?'warn':(postiConDato.length?'':'neutral')}">${postiConDato.length?(postiSotto.length?postiSotto.length+' sotto soglia':'Tutti sopra ✓'):'In attesa dati'}</span>
      </div>
      <div class="mk-outcome">
        <div class="mk-name">Post sopra soglia <small>${postiOk.length} / ${postiConDato.length} con dato</small></div>
        <div class="mk-pct ${postiConDato.length?'':'nd'}">${postiConDato.length?singPct+'%':'n/d'}</div>
      </div>
      <div class="bar"><span style="width:${singPct}%"></span></div>
      <div class="mk-foot"><span class="cur ${postiConDato.length?'':'nd'}">${postiOk.length}/${postiConDato.length} post conformi</span><span>${postiConDato.length?'Su post con insights disponibili':'Nessun dato insights ancora rilevato'}</span></div>
    </div>`;
  // ===== TIMELINE cronologica (storico -> estiva) =====
  const tl=document.getElementById("timeline");
  if(tl){
    // dal più recente al meno recente (richiesta 16/7): l'estiva apre, lo storico chiude
    const ordinati=[...ALL_POSTS].sort((a,b)=>b.data.localeCompare(a.data));
    let html="";let sepMesso=false;
    ordinati.forEach((p,i)=>{
      if(!sepMesso && p.collab==="storico" && i>0){
        html+=`<div class="tl-sep"><span>inizio collab estiva</span></div>`;sepMesso=true;
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
      toast('🐄 <span class="em">MUUU</span> &nbsp;vaiiii toroooo, spamma sta ZONA 🏟');
    }
  }
  // delego sul document (cattura i click "vuoti")
  document.addEventListener("click", onBgClick);
})();


function renderPost(p){
    const attese=[];
    if(p.g7_attesa && isND(p.insights.g7.reach)) attese.push("+7g il "+fmtDate(p.g7_attesa));
    const rows=KPIS.map(([key,name,primary])=>`<tr class="${primary?'primary':''}"><td class="kpi-name">${name}</td>
      ${WINDOWS.map(([w])=>{const v=getKPI(p,w,key);
        if(w==="g7" && isND(v) && p.g7_attesa) return `<td class="val nd att">*</td>`;
        const cls = w==="overall" ? "val over" : "val";
        return `<td class="${cls} ${isND(v)?'nd':''}">${fmt(v)}</td>`;}).join("")}</tr>`).join("");
    const noteRow = attese.length ? `<div class="g30-note">* in arrivo: ${attese.join(" · ")}</div>` : "";
    const isStorico = p.collab==="storico";
    const tagLabel = isStorico ? "Storico" : "Collab estiva";
    const tagClass = isStorico ? "shot" : "media";
    return `<div class="feed-post" data-post="post-${p.n}"><div class="ig-side">
      <div class="ig-topbar"><a class="ig-avatar" data-link="ig-profile" data-post="post-${p.n}" href="${DATA.meta.profilo_ig||'#'}" target="_blank" rel="noopener"><span class="av-inner">${DATA.meta.logo_datauri?`<img src="${DATA.meta.logo_datauri}" alt="ZonaFanta">`:'ZF'}</span></a><div class="ig-handle"><a data-link="ig-profile" data-post="post-${p.n}" href="${DATA.meta.profilo_ig||'#'}" target="_blank" rel="noopener">zonafanta</a><small>Post ${p.n_collab||p.n}${p.collab==='estiva'?' estiva':' storico'} · ${fmtDate(p.data)}</small></div></div>
      ${coverSVG(p)}
      <div class="ig-actions"><span title="Mi piace (pubblico)">♥ <b>${fmt((p.pubblici||{}).like)}</b></span>
        <span title="Commenti (pubblico)">💬 <b>${fmt((p.pubblici||{}).commenti)}</b></span>
        <span title="Condivisioni (pubblico)">↗ <b>${fmt((p.pubblici||{}).condivisioni)}</b></span></div>
      <div class="ig-pubnote">Contatori pubblici · aggiornati ${fmtDate((p.pubblici||{}).aggiornato)}</div></div>
      <div class="ig-data"><div class="data-head"><div>
        <div class="data-title">${p.titolo}</div>
        <div class="data-meta">${fmtDate(p.data)}</div></div>
        <span class="tag ${tagClass}">${tagLabel}</span></div>
      <span class="market">Mercato: <b>${mercatoHTML(p)}</b></span>
      <div class="kpi-scroll"><table><thead><tr><th>KPI insights</th>${WINDOWS.map(([,l])=>`<th>${l}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>
      ${noteRow}
      <a class="ig-btn" data-link="ig-post" data-post="post-${p.n}" href="${p.url}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>Apri post su Instagram</a>
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
render();
