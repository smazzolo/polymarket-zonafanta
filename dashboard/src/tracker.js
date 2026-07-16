(function () {
  var ENDPOINT = "/api/track";
  var sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
  var device = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
  var ref = document.referrer ? (function(){ try { return new URL(document.referrer).hostname; } catch(e){ return "diretta"; } })() : "diretta";
  var startTs = Date.now();
  var events = [];
  var scrollMax = 0;
  var sentReport = false;

  function logEv(ev){ ev.at = Date.now(); events.push(ev); }
  function send(payload, useBeacon){
    try {
      var body = JSON.stringify(payload);
      if (useBeacon && navigator.sendBeacon){
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      } else {
        fetch(ENDPOINT, { method:"POST", headers:{ "Content-Type":"application/json" }, body: body, keepalive: true });
      }
    } catch(e){}
  }
  function ping(kind, extra){
    var p = { type:"ping", kind:kind, sid:sid, device:device, ref:ref, at: Date.now() };
    if (extra) for (var k in extra) p[k] = extra[k];
    send(p, false);
  }

  // apertura
  logEv({ t:"open" });
  ping("open");

  // dwell per sezione
  var secEnter = {};
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      var id = en.target.getAttribute("data-sec");
      if (!id) return;
      if (en.isIntersecting){
        if (!secEnter[id]){ secEnter[id] = Date.now(); if (id === "aggregato") ping("aggregato"); }
      } else if (secEnter[id]){
        var d = (Date.now() - secEnter[id]) / 1000; secEnter[id] = 0;
        if (d >= 1) logEv({ t:"sec", id:id, d:d });
      }
    });
  }, { threshold: 0.4 }) : null;
  if (io) document.querySelectorAll("[data-sec]").forEach(function(el){ io.observe(el); });

  // dwell per scheda post (il feed è dinamico: ri-osservo dopo i render)
  var postEnter = {};
  var observedPosts = new WeakSet();
  var pio = ("IntersectionObserver" in window) ? new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      var id = en.target.getAttribute("data-post");
      if (!id) return;
      if (en.isIntersecting){
        if (!postEnter[id]){ postEnter[id] = Date.now(); ping("post", { post:id }); }
      } else if (postEnter[id]){
        var d = (Date.now() - postEnter[id]) / 1000; postEnter[id] = 0;
        if (d >= 1) logEv({ t:"post", id:id, d:d });
      }
    });
  }, { threshold: 0.55 }) : null;
  function observePosts(){
    if (!pio) return;
    document.querySelectorAll(".feed-post[data-post]").forEach(function(el){
      if (!observedPosts.has(el)){ observedPosts.add(el); pio.observe(el); }
    });
  }
  observePosts();
  // le card sono generate/rigenerate da render(): ricontrollo periodicamente
  // e osservo le nuove appena compaiono nel DOM.
  var mo = ("MutationObserver" in window) ? new MutationObserver(function(){ observePosts(); }) : null;
  if (mo){
    var feedEl = document.getElementById("feed");
    var storicoEl = document.getElementById("storico");
    if (feedEl) mo.observe(feedEl, { childList:true, subtree:true });
    if (storicoEl) mo.observe(storicoEl, { childList:true, subtree:true });
  }

  // click su link / export (delega globale)
  document.addEventListener("click", function(e){
    var a = e.target.closest ? e.target.closest("[data-link],[data-export]") : null;
    if (!a) return;
    if (a.hasAttribute("data-link")){
      var lid = a.getAttribute("data-link");
      var post = a.getAttribute("data-post") || null;
      logEv({ t:"link", id:lid, post:post });
      ping("link", { link:lid, post:post });
    } else if (a.hasAttribute("data-export")){
      var ex = a.getAttribute("data-export") || "export-print";
      logEv({ t:"export", id:ex });
      ping("export", { id:ex });
    }
  }, true);

  // scroll massimo
  window.addEventListener("scroll", function(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var v = h > 0 ? Math.round((window.scrollY / h) * 100) : 0;
    if (v > scrollMax){ scrollMax = v; }
  }, { passive: true });

  function flushOpenDwell(){
    var nowT = Date.now();
    for (var id in secEnter){ if (secEnter[id]){ var d=(nowT-secEnter[id])/1000; if (d>=1) logEv({t:"sec",id:id,d:d}); secEnter[id]=0; } }
    for (var pid in postEnter){ if (postEnter[pid]){ var dp=(nowT-postEnter[pid])/1000; if (dp>=1) logEv({t:"post",id:pid,d:dp}); postEnter[pid]=0; } }
    if (scrollMax > 0) logEv({ t:"scroll", v:scrollMax });
  }
  function finalReport(){
    if (sentReport) return; sentReport = true;
    flushOpenDwell();
    send({ type:"report", sid:sid, device:device, ref:ref, start:startTs, end:Date.now(), total:(Date.now()-startTs)/1000, events:events }, true);
  }
  document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "hidden") finalReport(); });
  window.addEventListener("pagehide", finalReport);
  window.addEventListener("beforeunload", finalReport);
})();
