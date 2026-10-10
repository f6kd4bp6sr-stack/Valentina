/* ===== App autonoma «Semestre filtro»: aggiornamento automatico, copie e barra in fondo =====
   - all'apertura, al ritorno sull'app e ogni 30 minuti legge version.json (mai dalla cache);
   - se c'è una versione nuova salva i dati e ricarica, ma mai durante una simulazione o mentre si scrive;
   - ogni giorno conserva sul dispositivo una copia dei progressi (ultimi 30 giorni);
   - «Salva copia su File / iCloud» crea un file .json che si ripristina in Progressi e copie. */
(function(){
  "use strict";
  var V=window.APP_VERSION||"", BUILT=window.APP_BUILD||"", KEY="semestre-v1";
  var st={state:"idle",last:null,remote:null,pending:false};
  function lsJ(k){try{return JSON.parse(localStorage.getItem(k)||"null");}catch(e){return null;}}
  function visible(id){var e=document.getElementById(id);return !!(e&&!e.hidden&&getComputedStyle(e).display!=="none");}
  function busy(){var a=document.activeElement;return visible("player")||!!(a&&/INPUT|SELECT|TEXTAREA/.test(a.tagName)&&a.type!=="file");}
  function fmtBuilt(){if(!BUILT)return "";try{return new Date(BUILT).toLocaleString("it-IT",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});}catch(e){return "";}}
  function today(){var d=new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);}
  function when(t){if(!t)return "mai";var d=new Date(t),o=new Date();return d.toDateString()===o.toDateString()?"oggi "+d.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"}):d.toLocaleDateString("it-IT",{day:"numeric",month:"short"});}
  var TXT={idle:"",checking:"controllo in corso…",ok:"è l’ultima versione",new:"nuova versione trovata: aggiorno…",wait:"nuova versione pronta: si installa appena finisci",offline:"senza internet: controllo al prossimo collegamento"};
  function svTxt(){var sn=localStorage.getItem("sf-lastSnap"),bk=localStorage.getItem("sf-lastBackup"),old=!bk||(Date.now()-new Date(bk).getTime())>7*864e5;
    return "💾 Salvataggio automatico attivo · copia del giorno: "+when(sn)+" · copia su File/iCloud: <span"+(old?" style=\"color:#c2410c;font-weight:700\"":"")+">"+when(bk)+"</span>";}
  function paint(){var b=document.querySelector(".updbar");if(!b)return;b.querySelector(".u-sv").innerHTML=svTxt();
    b.querySelector(".u-st").textContent=TXT[st.state]+(st.last&&st.state==="ok"?" (verificato alle "+st.last.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})+")":"");b.dataset.st=st.state;}
  function bar(){if(document.querySelector(".updbar"))return;var css=document.createElement("style");
    css.textContent=".updbar{max-width:1100px;margin:22px auto 8px;padding:10px 16px calc(10px + env(safe-area-inset-bottom));font-size:12.5px;color:#7a8290;display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;justify-content:center;text-align:center}.updbar b{font-variant-numeric:tabular-nums}.updbar button{font:inherit;font-weight:700;border:0;border-radius:999px;padding:6px 12px;background:rgba(127,127,127,.16);color:inherit;cursor:pointer}.updbar[data-st=ok] .u-st{color:#2e8b57}.updbar[data-st=new] .u-st,.updbar[data-st=wait] .u-st{color:#c2410c;font-weight:700}";
    document.head.appendChild(css);var d=document.createElement("div");d.className="updbar";
    d.innerHTML="<span class=\"u-sv\" style=\"flex-basis:100%\"></span><button type=\"button\" class=\"u-bk\">💾 Salva copia su File / iCloud</button><span>Versione <b>"+V+"</b>"+(BUILT?" del "+fmtBuilt():"")+"</span><span class=\"u-st\"></span><button type=\"button\" class=\"u-ck\">Cerca aggiornamenti</button>";
    d.querySelector(".u-bk").addEventListener("click",exportAll);d.querySelector(".u-ck").addEventListener("click",function(){check(true);});document.body.appendChild(d);paint();}
  function kvDb(){return new Promise(function(res,rej){try{var r=indexedDB.open("semestre-filtro",1);r.onupgradeneeded=function(){if(!r.result.objectStoreNames.contains("kv"))r.result.createObjectStore("kv");};r.onsuccess=function(){res(r.result);};r.onerror=function(){rej(r.error);};}catch(e){rej(e);}});}
  var snapBusy=false;
  function snapAll(){if(snapBusy)return;var o=lsJ(KEY);if(!o)return;snapBusy=true;
    kvDb().then(function(db){return new Promise(function(res){var tx=db.transaction("kv","readwrite"),s=tx.objectStore("kv"),k="sf-snap-"+today();s.put(JSON.stringify(o),k);
      var q=s.getAllKeys();q.onsuccess=function(){var ks=q.result.map(String).filter(function(x){return x.indexOf("sf-snap-")===0;});if(ks.indexOf(k)<0)ks.push(k);ks.sort();ks.slice(0,Math.max(0,ks.length-30)).forEach(function(x){s.delete(x);});};
      tx.oncomplete=function(){try{localStorage.setItem("sf-lastSnap",new Date().toISOString());}catch(e){}res();paint();};tx.onerror=function(){res();};});}).catch(function(){}).then(function(){snapBusy=false;});}
  function exportAll(){try{if(typeof window.__flush==="function")window.__flush();}catch(e){}var o=lsJ(KEY);if(!o){alert("Ancora nessun dato da salvare");return;}
    var data=JSON.stringify({app:"semestre-filtro",semestre:o},null,1),fn="semestre-filtro-copia-"+today()+".json";
    var done=function(){try{localStorage.setItem("sf-lastBackup",new Date().toISOString());}catch(e){}paint();};
    try{var f=new File([data],fn,{type:"application/json"});if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:"Copia Semestre filtro"}).then(done,function(){});return;}}catch(e){}
    try{var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type:"application/json"}));a.download=fn;document.body.appendChild(a);a.click();a.remove();done();}catch(e){}}
  function apply(v){try{if(typeof window.__flush==="function")window.__flush();}catch(e){}setTimeout(function(){location.replace(location.pathname+"?v="+encodeURIComponent(v)+location.hash);},350);}
  function check(manual){if(!/^https?:/.test(location.protocol))return;st.state="checking";paint();if(window.__swreg)window.__swreg.update().catch(function(){});
    fetch("version.json?t="+Date.now(),{cache:"no-store"}).then(function(r){return r.json();}).then(function(v){st.last=new Date();st.remote=v&&v.v;
      if(st.remote&&st.remote!==V){if(manual||!busy()){st.state="new";paint();apply(st.remote);}else{st.state="wait";st.pending=true;paint();}}else{st.state="ok";paint();}
    }).catch(function(){st.state="offline";paint();});}
  window.__exportAll=exportAll;window.__snapAll=snapAll;
  if(document.readyState!=="loading")bar();else document.addEventListener("DOMContentLoaded",bar);
  setTimeout(snapAll,3000);document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")snapAll();else paint();});window.addEventListener("pagehide",snapAll);setInterval(snapAll,15*60*1000);
  if(location.search.indexOf("v=")>=0&&history.replaceState){try{history.replaceState(null,"",location.pathname+location.hash);}catch(e){}}
  if(window.claude||window.top!==window)return; // dentro un'anteprima: niente aggiornamento automatico
  setInterval(function(){if(st.pending&&!busy()){st.pending=false;st.state="new";paint();apply(st.remote);}},5000);
  if("serviceWorker" in navigator&&/^https?:/.test(location.protocol)){navigator.serviceWorker.register("sw.js").then(function(reg){window.__swreg=reg;}).catch(function(){});}
  check(false);document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")check(false);});
  window.addEventListener("pageshow",function(e){if(e.persisted)check(false);});setInterval(function(){check(false);},30*60*1000);
})();
