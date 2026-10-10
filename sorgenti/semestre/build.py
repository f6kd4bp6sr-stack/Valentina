"""Costruisce l'app autonoma «Semestre filtro» dai file sorgente di questa cartella.

Uscita: cartella semestre/ del repository → https://f6kd4bp6sr-stack.github.io/mie-app/semestre/
(si installa su qualsiasi iPad: Safari → Condividi → Aggiungi alla schermata Home).
È un'app separata: non usa né modifica Pianificazione o Il mio mondo, che stanno nello stesso sito.

Uso:   python3 sorgenti/semestre/build.py        (dalla cartella principale del repository)
Ripetibile: rilancialo dopo ogni modifica, poi commit e push. La versione nasce dal contenuto:
se cambia qualcosa gli iPad trovano l'aggiornamento al prossimo avvio."""
import re, hashlib, json, os, subprocess, datetime

SRC = os.path.dirname(os.path.abspath(__file__)) + "/"
ROOT = os.path.abspath(SRC + "../..") + "/"
APP = ROOT + "semestre/"
APP_URL = "https://f6kd4bp6sr-stack.github.io/mie-app/semestre/"
now = datetime.datetime.now().astimezone().strftime("%Y-%m-%dT%H:%M%z")
BUILD = now[:-2] + ":" + now[-2:]
BODY = ["b_data.js", "b3_spiegazioni_fis.js", "b2_other.js", "c_anim.js", "d_app.js"]   # ordine di caricamento

def rd(p): return open(p, encoding="utf-8").read()
def wr(p, s): open(p, "w", encoding="utf-8").write(s)

# codice QR dell'indirizzo (libreria qrcode.js di Kazuhiko Arase, licenza MIT, in questa cartella)
qr = subprocess.run(["node", "-e", rd(SRC + "qrcode.js") + f'\nconst q=qrcode(0,"M");q.addData("{APP_URL}");q.make();process.stdout.write(q.createSvgTag({{cellSize:4,margin:2,scalable:true}}));'],
                    capture_output=True, text=True, check=True).stdout
page = (rd(SRC + "a_head.html")
        + "<script>window.QR_SVG=" + json.dumps(qr) + ";</script>\n"
        + "<script>\n(function(){\n\"use strict\";\n" + "\n".join(rd(SRC + f) for f in BODY) + "\n})();\n</script>\n"
        + "<script>\n" + rd(SRC + "e_barra_sf.js") + "</script>\n</body>\n</html>\n")

os.makedirs(APP, exist_ok=True)
V = hashlib.sha1(page.replace("/*APPVERSION*/", "").encode()).hexdigest()[:10]
old = json.load(open(APP + "version.json"))["v"] if os.path.exists(APP + "version.json") else None
built = BUILD
if old == V and os.path.exists(APP + "index.html"):           # niente di nuovo: tengo la data della versione
    m = re.search(r'window\.APP_BUILD="([^"]*)"', rd(APP + "index.html")); built = m.group(1) if m else BUILD
wr(APP + "index.html", page.replace("/*APPVERSION*/", f'<script>window.APP_VERSION="{V}";window.APP_BUILD="{built}";</script>'))
wr(APP + "version.json", json.dumps({"v": V}))
wr(APP + "manifest.webmanifest", json.dumps({"name": "Semestre filtro", "short_name": "Semestre filtro", "description": "Esami del semestre filtro di Medicina: Fisica, Chimica, Biologia",
    "start_url": "./", "scope": "./", "display": "standalone", "background_color": "#f3f4f7", "theme_color": "#163054", "lang": "it",
    "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]}, ensure_ascii=False, indent=1))
wr(APP + "sw.js", f"""// Semestre filtro: funziona anche senza internet. Versione {V}
const CACHE = 'semestre-{V}';
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
print("Semestre filtro", V, "·", APP_URL)
