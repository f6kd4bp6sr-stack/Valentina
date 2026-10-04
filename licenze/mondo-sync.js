/* «Il mio mondo» → sezione Progressi: invio automatico e cifrato dei progressi.
   - Si attiva solo dopo il collegamento fatto da un genitore (📊 Progressi → 🔗 Per i genitori).
   - Invia SOLO i contatori dello studio (niente nome, niente testi del diario, niente aspetto o voce),
     cifrati sull'iPad con una chiave che resta nel «codice di collegamento»: chi non ha il codice vede solo dati illeggibili.
   - Invio: all'apertura, quando l'app va in secondo piano e ogni 30 minuti; almeno una volta al giorno anche senza novità. */
(function () {
  "use strict";
  if (window.__mondoSyncLoaded) return; window.__mondoSyncLoaded = true;
  var CFG = "msync-cfg", API = "https://api.github.com", FILE = "mondo.json";
  var KEEP = ["days", "prog", "prog-days", "math-done", "sci-done", "games-done", "tab-best", "simon-best", "clock-level", "cuoca-level", "moves-done", "dragon", "diary", "m-steps", "m-open", "m-frasi", "path-day", "gems", "piggy", "diff-level", "vid-log"];
  var KEEP_PREFIX = ["deck-", "mis-"];

  function cfg() { try { return JSON.parse(localStorage.getItem(CFG) || "null"); } catch (e) { return null; } }
  function setCfg(c) { try { if (c) localStorage.setItem(CFG, JSON.stringify(c)); else localStorage.removeItem(CFG); } catch (e) {} }
  function b64(buf) { var s = "", a = new Uint8Array(buf); for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function unb64(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }

  function collect() {
    var P = "vale2-", data = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i); if (!k || k.indexOf(P) !== 0) continue;
        var n = k.slice(P.length);
        if (KEEP.indexOf(n) < 0 && !KEEP_PREFIX.some(function (p) { return n.indexOf(p) === 0; })) continue;
        try { data[n] = JSON.parse(localStorage.getItem(k)); } catch (e) {}
      }
    } catch (e) {}
    // solo quantità, mai testi: diario → giorni scritti; liste del metodo → quante voci
    if (data.diary && typeof data.diary === "object") { var dd = {}; Object.keys(data.diary).forEach(function (d) { dd[d] = 1; }); data.diary = dd; }
    ["m-steps", "m-open", "m-frasi"].forEach(function (k) { if (Array.isArray(data[k])) data[k] = data[k].map(function () { return 1; }); });
    // percorso: solo il riepilogo per materia (nozioni imparate, consolidate, da ripassare), non le domande
    try {
      var PA = JSON.parse(localStorage.getItem(P + "path") || "null");
      if (PA && PA.srs) {
        var today = new Date(), td = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2), sum = {};
        Object.keys(PA.srs).forEach(function (k) { var r = PA.srs[k] || {}, b = +r.b || 0; if (b <= 0) return; var u = r.u || "?", e = sum[u] || (sum[u] = { l: 0, s: 0, d: 0 }); e.l++; if (b >= 4) e.s++; if (r.d && r.d <= td) e.d++; });
        var U = PA.u || {}, tappe = 0; Object.keys(U).forEach(function (k) { tappe += Object.keys((U[k] && U[k].done) || {}).length; });
        data.path = { sum: sum, tappe: tappe, units: Object.keys(U).length, ref: td };
      }
      var C = JSON.parse(localStorage.getItem(P + "coll") || "null");
      if (C && C.f) { var n = 0; Object.keys(C.f).forEach(function (k) { n += (C.f[k] || []).length; }); data.coll = { figs: n }; }
    } catch (e) {}
    if (data.dragon && typeof data.dragon === "object") data.dragon = { name: data.dragon.name || "", energy: data.dragon.energy || 0 };
    return data;
  }
  /* codice scelto dal genitore (es. mm13105): da lì nascono la chiave di cifratura e l'etichetta per ritrovare i dati */
  function normCode(c) { return String(c || "").trim().toLowerCase().replace(/\s+/g, ""); }
  async function codeKey(c) {
    var base = await crypto.subtle.importKey("raw", new TextEncoder().encode(normCode(c)), "PBKDF2", false, ["deriveBits"]);
    var bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode("mie-app-mondo-v2"), iterations: 310000, hash: "SHA-256" }, base, 256);
    return b64(bits);
  }
  async function codeTag(c) { var h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("tag:mie-app-mondo:" + normCode(c))); return Array.from(new Uint8Array(h)).slice(0, 10).map(function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); }
  window.__mondoCode = { norm: normCode, key: codeKey, tag: codeTag };
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return String(h); }

  async function encrypt(keyStr, obj) {
    var key = await crypto.subtle.importKey("raw", unb64(keyStr), "AES-GCM", false, ["encrypt"]);
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
    return JSON.stringify({ app: "mondo-sync", v: 1, iv: b64(iv), ct: b64(ct) });
  }
  function headers(token) { return { "Authorization": "Bearer " + token, "Accept": "application/vnd.github+json", "Content-Type": "application/json" }; }

  var busy = false;
  async function push(force) {
    var c = cfg(); if (!c || busy) return false;
    if (navigator.onLine === false) return false;
    var data = collect(), js = JSON.stringify(data), h = hash(js), now = Date.now();
    if (!force && c.h === h && now - (c.last || 0) < 12 * 3600e3) return true;   // nessuna novità: almeno un invio ogni 12 ore
    if (!force && now - (c.last || 0) < 60e3) return true;
    busy = true;
    try {
      var body = JSON.stringify({ files: (function () { var f = {}; f[FILE] = { content: "" }; return f; })() });
      var content = await encrypt(c.key, { app: "mondo-valentina", saved: new Date().toISOString(), state: { data: data } });
      var f = {}; f[FILE] = { content: content }; body = JSON.stringify({ files: f });
      var r = await fetch(API + "/gists/" + c.gist, { method: "PATCH", headers: headers(c.token), body: body, keepalive: body.length < 60000, cache: "no-store" });
      c = cfg() || c;
      if (r.ok) { c.last = Date.now(); c.h = h; c.err = ""; setCfg(c); paint(); if (window.onMondoSync) try { window.onMondoSync(); } catch (e) {} return true; }
      c.err = r.status === 401 ? "chiave GitHub non valida o scaduta" : r.status === 404 ? "spazio di collegamento non trovato" : "errore " + r.status;
      setCfg(c); paint(); return false;
    } catch (e) { return false; } finally { busy = false; }
  }

  async function connect(token, myCode) {
    var nc = normCode(myCode);
    if (nc.length < 6) throw new Error("il codice deve avere almeno 6 caratteri");
    var keyStr = await codeKey(nc), tag = await codeTag(nc), desc = "mie-app-mondo " + tag;
    var content = await encrypt(keyStr, { app: "mondo-valentina", saved: new Date().toISOString(), state: { data: collect() } });
    var f = {}; f[FILE] = { content: content };
    // se esiste già uno spazio con lo stesso codice, si riusa
    var id = null;
    try { var l = await fetch(API + "/gists?per_page=100", { headers: headers(token), cache: "no-store" }); if (l.ok) { var arr = await l.json(); var hit = arr.find(function (g) { return g.description === desc; }); if (hit) id = hit.id; } else if (l.status === 401) throw new Error("la chiave GitHub non è valida"); } catch (e) { if (/chiave/.test(e.message)) throw e; }
    var r = id ? await fetch(API + "/gists/" + id, { method: "PATCH", headers: headers(token), body: JSON.stringify({ files: f }) })
               : await fetch(API + "/gists", { method: "POST", headers: headers(token), body: JSON.stringify({ description: desc, public: true, files: f }) });
    if (!r.ok) throw new Error(r.status === 401 ? "la chiave GitHub non è valida" : r.status === 403 || r.status === 404 ? "la chiave non ha il permesso «gist»" : "errore " + r.status);
    var g = await r.json();
    setCfg({ token: token, gist: g.id, key: keyStr, code: nc, owner: (g.owner && g.owner.login) || "", last: Date.now(), h: "", err: "" });
    return code();
  }
  function code() { var c = cfg(); return !c ? "" : c.code ? c.code : "MM1-" + c.gist + "-" + c.key; }

  /* ---------- pannello per i genitori (dentro 📊 Progressi) ---------- */
  var box = null;
  function when(t) { if (!t) return "mai"; var d = new Date(t), o = new Date(); return (d.toDateString() === o.toDateString() ? "oggi" : d.toLocaleDateString("it-IT", { day: "numeric", month: "short" })) + " alle " + d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }); }
  function paint() {
    if (!box) return;
    var c = cfg(), el = box.querySelector(".ms-body");
    if (!c) {
      el.innerHTML = '<p>Collega questi progressi alla sezione <b>🐉 Progressi</b> del genitore: si aggiornerà da sola, almeno una volta al giorno.</p>' +
        '<p style="font-size:14px">Serve una chiave GitHub con il solo permesso <b>gist</b> (istruzioni nella sezione Progressi). Si inserisce una volta sola.</p>' +
        '<input type="password" class="ms-tok" placeholder="Incolla la chiave GitHub" autocomplete="off" style="width:100%;font:inherit;padding:10px;border-radius:12px;border:2px solid #ccc;box-sizing:border-box">' +
        '<p style="font-size:14px;margin:10px 0 4px"><b>Il tuo codice</b> (almeno 6 caratteri, lo stesso da scrivere nella sezione Progressi):</p>' +
        '<input type="text" class="ms-mycode" placeholder="es. il codice che scegli tu" autocomplete="off" autocapitalize="off" spellcheck="false" style="width:100%;font:inherit;padding:10px;border-radius:12px;border:2px solid #ccc;box-sizing:border-box">' +
        '<div class="ms-row"><button type="button" class="btn ms-go">🔗 Collega</button></div><p class="ms-msg" style="font-size:14px"></p>';
      el.querySelector(".ms-go").onclick = async function () {
        var t = el.querySelector(".ms-tok").value.trim(), mc = el.querySelector(".ms-mycode").value, m = el.querySelector(".ms-msg");
        if (!t) { m.textContent = "Incolla prima la chiave."; return; }
        if (normCode(mc).length < 6) { m.textContent = "Scrivi il tuo codice (almeno 6 caratteri)."; return; }
        m.textContent = "Collegamento in corso…";
        try { await connect(t, mc); paint(); } catch (e) { m.textContent = "Non riuscito: " + e.message + "."; }
      };
      return;
    }
    el.innerHTML = '<p><b>' + (c.err ? "⚠️ Ultimo invio non riuscito: " + c.err : "✅ Collegato") + '</b><br>Ultimo invio: ' + when(c.last) + '</p>' +
      '<p style="font-size:14px">' + (c.code ? 'Codice da scrivere nella sezione Progressi (una volta sola):' : 'Codice di collegamento da inserire nella sezione Progressi (una volta sola):') + '</p>' +
      '<textarea readonly class="ms-code" onclick="this.setSelectionRange(0,this.value.length)" style="width:100%;height:84px;font:15px ui-monospace,monospace;border-radius:12px;padding:8px;box-sizing:border-box;-webkit-user-select:text;user-select:text">' + code() + '</textarea>' +
      '<div class="ms-row"><button type="button" class="btn ms-copy">📋 Copia</button><button type="button" class="btn ms-share">📤 Invia</button><button type="button" class="btn ms-now">🔄 Invia ora</button></div>' +
      '<div class="ms-row"><button type="button" class="btn ghost ms-off">Scollega</button></div><p class="ms-msg" style="font-size:14px"></p>';
    var m = el.querySelector(".ms-msg");
    el.querySelector(".ms-copy").onclick = function () {
      /* iPad: prima la copia «classica» (sincrona, dentro il tocco), poi l'API moderna */
      var txt = code(), ok = false;
      try {
        var tmp = document.createElement("textarea"); tmp.value = txt; tmp.setAttribute("readonly", "");
        tmp.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px"; document.body.appendChild(tmp);
        tmp.contentEditable = "true"; tmp.readOnly = false;
        var r = document.createRange(); r.selectNodeContents(tmp); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        tmp.setSelectionRange(0, txt.length); ok = document.execCommand("copy"); tmp.remove();
      } catch (e) {}
      var okMsg = "✅ Codice copiato: ora incollalo nella sezione Progressi.", koMsg = "Non riesco a copiare: usa «📤 Invia» (AirDrop o Messaggi) oppure tieni premuto sul codice.";
      if (ok) m.textContent = okMsg;
      try { navigator.clipboard.writeText(txt).then(function () { m.textContent = okMsg; }, function () { if (!ok) m.textContent = koMsg; }); }
      catch (e) { if (!ok) m.textContent = koMsg; }
      var t = el.querySelector(".ms-code"); try { t.focus(); t.setSelectionRange(0, txt.length); } catch (e) {}
    };
    el.querySelector(".ms-share").onclick = function () { if (navigator.share) navigator.share({ title: "Codice di collegamento", text: code() }).catch(function () {}); else m.textContent = "Usa «Copia»."; };
    el.querySelector(".ms-now").onclick = async function () { m.textContent = "Invio…"; var ok = await push(true); m.textContent = ok ? "Inviato " + when(Date.now()) + "." : "Invio non riuscito: controlla internet."; };
    el.querySelector(".ms-off").onclick = function () { if (el.dataset.sure) { setCfg(null); delete el.dataset.sure; paint(); } else { el.dataset.sure = 1; m.textContent = "Tocca di nuovo «Scollega» per confermare."; } };
  }
  function openPanel() {
    if (!box) {
      box = document.createElement("div");
      box.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px";
      box.innerHTML = '<div style="background:#fff;color:#33304a;border-radius:22px;max-width:520px;width:100%;padding:18px 20px;font:17px/1.45 -apple-system,system-ui,sans-serif;max-height:90vh;overflow:auto">' +
        '<h2 style="margin:0 0 8px">🔗 Per i genitori</h2><div class="ms-body"></div><div class="ms-row"><button type="button" class="btn ghost ms-close">Chiudi</button></div></div>';
      var st = document.createElement("style"); st.textContent = ".ms-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:10px}"; box.appendChild(st);
      box.querySelector(".ms-close").onclick = function () { box.remove(); };
      box.addEventListener("click", function (e) { if (e.target === box) box.remove(); });
    }
    document.body.appendChild(box); paint();
  }
  function addButton() {
    if (window.MONDO_INLINE_LINK) return; // «Il mio mondo» mostra il collegamento in Casa
    var s = document.getElementById("pg-share");
    if (!s || document.getElementById("pg-link")) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "btn ghost"; b.id = "pg-link";
    b.textContent = cfg() ? "🔗 Collegato" : "🔗 Per i genitori"; b.onclick = openPanel;
    s.parentNode.insertBefore(b, s.nextSibling);
  }

  function start() {
    try { new MutationObserver(addButton).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
    addButton();
    setTimeout(function () { push(false); }, 4000);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") push(false); else setTimeout(function () { push(false); }, 2000); });
    window.addEventListener("pagehide", function () { push(false); });
    window.addEventListener("online", function () { push(false); });
    setInterval(function () { push(false); }, 30 * 60e3);
  }
  window.__mondoSyncPush = push;
  window.__mondoSyncOpen = openPanel;
  window.__mondoSyncApi = { cfg: cfg, connect: connect, push: push, code: code, off: function () { setCfg(null); } };
  window.__mondoSyncLinked = function () { return !!cfg(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
