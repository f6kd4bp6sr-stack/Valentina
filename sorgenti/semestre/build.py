"""Costruisce «Semestre filtro» dai file sorgente di questa cartella.

Uscite (due versioni dello stesso programma, stessi dati sul dispositivo):
  1. licenze/semestre.html  → sezione dentro Pianificazione (insieme a Licenze, Tai Chi, Progressi)
  2. semestre/index.html    → app autonoma da installare su qualsiasi iPad
                              https://f6kd4bp6sr-stack.github.io/mie-app/semestre/
Uso:   python3 sorgenti/semestre/build.py        (dalla cartella principale del repository)
Il comando è ripetibile: rilancialo dopo ogni modifica ai sorgenti, poi commit e push.
Le versioni (version.json) cambiano da sole se cambia il contenuto: gli iPad si aggiornano al prossimo avvio."""
import re, hashlib, json, os, subprocess, datetime

SRC = os.path.dirname(os.path.abspath(__file__)) + "/"
ROOT = os.path.abspath(SRC + "../..") + "/"
PIAN = ROOT + "licenze/"
APP = ROOT + "semestre/"
APP_URL = "https://f6kd4bp6sr-stack.github.io/mie-app/semestre/"
BUILD = datetime.datetime.now().astimezone().strftime("%Y-%m-%dT%H:%M%z")
BUILD = BUILD[:-2] + ":" + BUILD[-2:]

def rd(p): return open(p, encoding="utf-8").read()
def wr(p, s): open(p, "w", encoding="utf-8").write(s)
BODY = ["b_data.js", "b2_other.js", "c_anim.js", "d_app.js"]   # ordine di caricamento
head = rd(SRC + "a_head.html")
body = "\n".join(rd(SRC + f) for f in BODY)

# codice QR dell'indirizzo dell'app (libreria qrcode.js già presente in licenze/)
qr = subprocess.run(["node", "-e", rd(PIAN + "qrcode.js") + f'\nconst q=qrcode(0,"M");q.addData("{APP_URL}");q.make();process.stdout.write(q.createSvgTag({{cellSize:4,margin:2,scalable:true}}));'],
                    capture_output=True, text=True, check=True).stdout
QR = "<script>window.QR_SVG=" + json.dumps(qr) + ";</script>\n"
def script(extra=""): return QR + extra + "<script>\n(function(){\n\"use strict\";\n" + body + "\n})();\n</script>\n"

# ===================== 1. Sezione dentro Pianificazione =====================
hub = rd(PIAN + "index.html")
i = hub.index('<script>\n/* ===== Aggiornamento automatico')
barra = hub[i:hub.index('</script>', i) + 9]

def patch_dump(s):
    k = s.find('function dumpAll')
    if 'semestre-v1' in s[k:k + 1600]: return s
    a = 'if(!S&&!n&&!pg&&!pn)return null;'
    assert s.count(a) == 1, "dumpAll guard"
    s = s.replace(a, 'var sf=lsJ("semestre-v1");\n    if(!S&&!n&&!pg&&!pn&&!sf)return null;')
    b = 'if(pn)o.pianifica=pn; o.app="le-mie-app"; return o;'
    assert s.count(b) == 1, "dumpAll out"
    s = s.replace(b, 'if(pn)o.pianifica=pn; if(sf)o.semestre=sf; o.app="le-mie-app"; return o;')
    return s.replace('(Pianificazione + Licenze + Tai Chi + Progressi)', '(Pianificazione + Licenze + Tai Chi + Progressi + Semestre filtro)')

NAVSF = '<a href="semestre.html">🩺 Semestre filtro</a>'
def patch_nav(s):
    if 'semestre.html' in s[:s.index('</nav>')]: return s
    for a in ('<a href="progressi.html">🐉 Progressi</a></nav>', '<a class="on" href="progressi.html" aria-current="page">🐉 Progressi</a></nav>'):
        if a in s: return s.replace(a, a[:-6] + NAVSF + '</nav>', 1)
    raise SystemExit("barra di navigazione non trovata")

wr(PIAN + "semestre.html", head + script() + patch_dump(barra) + "\n</body>\n</html>\n")
wr(PIAN + "fisica.html", '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Semestre filtro</title><script>location.replace("semestre.html"+(location.hash||"#fis"));</script></head><body><p><a href="semestre.html#fis">Fisica è ora dentro «Semestre filtro»</a></p></body></html>\n')

VSEM = rd(SRC + "pianificazione_sezione.js")
if "function vSem(" not in hub:
    a = 'const SECT=[["cal","📆","Calendario"],["scad","📌","Scadenze"],["prat","🗂️","Pratiche"],["conti","💶","Conti"],["ben","🧘","Benessere"],["sic","🔒","Blocco"]];'
    assert hub.count(a) == 1
    hub = hub.replace(a, VSEM + a.replace('["sic","🔒","Blocco"]', '["sem","🩺","Semestre filtro"],["sic","🔒","Blocco"]'))
    a = 'ben:vBen,sic:vSic}[cur]'; assert hub.count(a) == 1; hub = hub.replace(a, 'ben:vBen,sem:vSem,sic:vSic}[cur]')
    a = '  o+=weekCard();\n  return o+"</div>";'; assert hub.count(a) == 1; hub = hub.replace(a, '  o+=semCard();\n' + a)
    hub = hub.replace("Sezioni: Calendario (punto di partenza", "Sezioni: Semestre filtro (riepilogo degli esami di Medicina) · Calendario (punto di partenza")
    hub = hub.replace('window.addEventListener("hashchange",', 'window.addEventListener("storage",e=>{if(e.key==="semestre-v1"&&(cur==="sem"||cur==="cal"))render();});\nwindow.addEventListener("hashchange",', 1)
else:  # sezione già presente: la aggiorno dal sorgente
    a = hub.index("\n/* ---------- Semestre filtro (dati salvati da semestre.html"); b = hub.index("const SECT=[", a)
    hub = hub[:a] + VSEM + hub[b:]
wr(PIAN + "index.html", patch_nav(patch_dump(hub)))

for f in ("licenze.html", "taichi.html", "progressi.html"):
    s = patch_nav(patch_dump(rd(PIAN + f)))
    if f == "licenze.html" and "sfDump" not in s:
        s = s.replace('function pnDump(){', 'function sfDump(){ try{ return JSON.parse(localStorage.getItem("semestre-v1")||"null"); }catch(e){ return null; } }\nfunction sfRestore(sf){ if(!sf||typeof sf!=="object") return; try{ localStorage.setItem("semestre-v1",JSON.stringify(sf)); }catch(e){} idbKV("readwrite","semestre",JSON.stringify(sf)).catch(()=>{}); }\nfunction pnDump(){', 1)
        assert s.count('pianifica:pnDump()}') == 2
        s = s.replace('pianifica:pnDump()}', 'pianifica:pnDump(),semestre:sfDump()}')
        a = 'if(!o||!(o.bal||o.taichi||o.progressi||o.pianifica))throw 0;'; assert s.count(a) == 1
        s = s.replace(a, 'if(!o||!(o.bal||o.taichi||o.progressi||o.pianifica||o.semestre))throw 0;')
        a = 'const pn=o.pianifica; delete o.pianifica; pnRestore(pn);'; assert s.count(a) == 1
        s = s.replace(a, a + ' const sf=o.semestre; delete o.semestre; sfRestore(sf);')
        s = s.replace('toast("Copia ripristinata (Pianificazione, Tai Chi e Progressi)")', 'toast("Copia ripristinata (Pianificazione, Tai Chi, Progressi e Semestre filtro)")')
    wr(PIAN + f, s)

sw = rd(PIAN + "sw.js")
if "semestre.html" not in sw:
    sw = sw.replace("'./progressi.html', './manifest", "'./progressi.html', './semestre.html', './manifest")
    sw = sw.replace("pn.endsWith('progressi.html') ? './progressi.html' :", "pn.endsWith('progressi.html') ? './progressi.html' : pn.endsWith('semestre.html') ? './semestre.html' :")
    assert sw.count("semestre.html") == 3

def stamp(pages, base):
    txt = {p: rd(base + p) for p in pages}
    h = hashlib.sha1()
    for p in pages: h.update(re.sub(r'window\.APP_VERSION="[^"]*";window\.APP_BUILD="[^"]*";', "", txt[p]).replace("/*APPVERSION*/", "").encode())
    V = h.hexdigest()[:10]
    old = json.load(open(base + "version.json"))["v"] if os.path.exists(base + "version.json") else None
    built = BUILD
    if old == V:  # nessuna modifica: lascio data e versione com'erano
        m = re.search(r'window\.APP_BUILD="([^"]*)"', txt[pages[0]]); built = m.group(1) if m else BUILD
    tag = f'<script>window.APP_VERSION="{V}";window.APP_BUILD="{built}";</script>'
    for p in pages:
        s = txt[p]
        s = s.replace("/*APPVERSION*/", tag) if "/*APPVERSION*/" in s else re.sub(r'<script>window\.APP_VERSION="[^"]*";window\.APP_BUILD="[^"]*";</script>', tag, s)
        wr(base + p, s)
    wr(base + "version.json", json.dumps({"v": V}))
    return V

V1 = stamp(["index.html", "licenze.html", "taichi.html", "progressi.html", "semestre.html"], PIAN)
sw = re.sub(r"Versione [0-9a-f]+", "Versione " + V1, sw)
sw = re.sub(r"const CACHE = 'licenze-[0-9a-f]+';", f"const CACHE = 'licenze-{V1}';", sw)
wr(PIAN + "sw.js", sw)

# ===================== 2. App autonoma (cartella semestre/) =====================
h2 = head
for a, b in [('<meta name="apple-mobile-web-app-title" content="Pianificazione">', '<meta name="apple-mobile-web-app-title" content="Semestre filtro">'),
             ('<meta name="theme-color" content="#f3f4f7">', '<meta name="theme-color" content="#f3f4f7" media="(prefers-color-scheme: light)">\n<meta name="theme-color" content="#0f1216" media="(prefers-color-scheme: dark)">\n<meta name="description" content="Preparazione agli esami del semestre filtro di Medicina 2026/27: Fisica, Chimica, Biologia">'),
             ('<link rel="apple-touch-icon" href="icon-180.png">', '<link rel="apple-touch-icon" href="icon-180.png">\n<link rel="icon" href="icon-192.png">')]:
    assert h2.count(a) == 1, a
    h2 = h2.replace(a, b)
nav = re.search(r'<nav class="appsw".*?</nav>\n', h2).group(0)
h2 = h2.replace(nav, "")
os.makedirs(APP, exist_ok=True)
wr(APP + "index.html", h2 + script("<script>window.SF_STANDALONE=true;</script>\n") + "<script>\n" + rd(SRC + "e_barra_sf.js") + "</script>\n</body>\n</html>\n")
wr(APP + "manifest.webmanifest", json.dumps({"name": "Semestre filtro", "short_name": "Semestre filtro", "description": "Esami del semestre filtro di Medicina: Fisica, Chimica, Biologia",
    "start_url": "./", "scope": "./", "display": "standalone", "background_color": "#f3f4f7", "theme_color": "#163054", "lang": "it",
    "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]}, ensure_ascii=False, indent=1))
V2 = stamp(["index.html"], APP)
wr(APP + "sw.js", f"""// Semestre filtro: funziona anche senza internet. Versione {V2}
const CACHE = 'semestre-{V2}';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {{ e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {{ cache: 'reload' }})))).then(() => self.skipWaiting())); }});
self.addEventListener('activate', e => {{ e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('semestre-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); }});
self.addEventListener('fetch', e => {{
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin || !u.pathname.includes('/semestre/')) return; // altri siti e altre app: sempre dalla rete
  if (u.pathname.endsWith('version.json')) return;                                     // sempre dalla rete
  if (e.request.mode === 'navigate') {{ e.respondWith(fetch(e.request, {{ cache: 'no-store' }}).then(r => {{ if (r.ok) {{ const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; }} return caches.match('./index.html').then(h => h || r); }}).catch(() => caches.match('./index.html'))); return; }}
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {{ if (r.ok) {{ const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }} return r; }})));
}});
""")
# l'app «Il mio mondo» (cartella principale) non deve toccare la cartella semestre/
rsw = rd(ROOT + "sw.js")
if "/semestre/" not in rsw:
    a = "  if (new URL(e.request.url).pathname.includes('/licenze/')) return; // app separata (Licenze e presenze): non toccarla"
    assert rsw.count(a) == 1
    rsw = rsw.replace(a, a + "\n  if (new URL(e.request.url).pathname.includes('/semestre/')) return; // app separata (Semestre filtro): non toccarla")
    rsw = rsw.replace("k !== CACHE && !k.startsWith('licenze-')", "k !== CACHE && !k.startsWith('licenze-') && !k.startsWith('semestre-')")
    assert "!k.startsWith('semestre-')" in rsw
    wr(ROOT + "sw.js", rsw)
print("Pianificazione", V1, "· app autonoma", V2, "·", APP_URL)
