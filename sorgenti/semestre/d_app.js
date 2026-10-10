/* ================= PIATTAFORMA «SEMESTRE FILTRO»: STATO E SALVATAGGIO =================
   Un solo stato (chiave semestre-v1) con una sezione per esame: exams.fis / exams.chi / exams.bio.
   Ogni esame del registro EXAMS usa lo stesso motore (argomenti, test, esercizi, simulazione). */
const KEY="semestre-v1",OLDKEY="fisica-v1";
const APP_URL="https://f6kd4bp6sr-stack.github.io/mie-app/semestre/";
const EDEF={pt:null,tp:{},qs:{},sims:[],run:null,days:{}};
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pad=n=>("0"+n).slice(-2);
const today=()=>{const d=new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());};
const dOf=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d);};
const iso=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const daysTo=s=>Math.round((dOf(s)-dOf(today()))/864e5);
const fmtD=(s,o)=>dOf(s).toLocaleDateString("it-IT",o||{day:"numeric",month:"short"});
const ename=id=>EXAMS[id].short||EXAMS[id].t;
/* id stabili delle domande: esame + hash del testo */
(function(){const h=s=>{let x=5381;for(let i=0;i<s.length;i++)x=((x<<5)+x+s.charCodeAt(i))|0;return (x>>>0).toString(36);};
  EXORD.forEach(k=>{const E=EXAMS[k],tp=Object.fromEntries(E.topics.map(t=>[t.id,t]));E.qb.forEach(q=>{q.id=k+"-"+h(q.q);q.u=tp[q.t].u;});});})();
function normE(e){const o=JSON.parse(JSON.stringify(EDEF));if(e&&typeof e==="object"){Object.assign(o,e);o.tp=e.tp||{};o.qs=e.qs||{};o.sims=Array.isArray(e.sims)?e.sims:[];o.days=e.days||{};}return o;}
function norm(r){const o={ver:2,savedAt:null,school:null,exams:{},sum:null};if(r&&typeof r==="object"){o.savedAt=r.savedAt||null;o.school=r.school||null;}EXORD.forEach(k=>o.exams[k]=normE(r&&r.exams&&r.exams[k]));return o;}
function migrate(old){/* da «Fisica» (fisica-v1) alla piattaforma */const r=norm(null);r.school=old.school||null;r.exams.fis=normE(old);r.savedAt=old.savedAt||null;return r;}
function load(){let r=null;try{r=JSON.parse(localStorage.getItem(KEY)||"null");}catch(e){}
  if(!r){try{const o=JSON.parse(localStorage.getItem(OLDKEY)||"null");if(o)return migrate(o);}catch(e){}}return norm(r);}
let Rt=load();
const DBN="semestre-filtro";
function kv(name){return new Promise((res,rej)=>{try{const r=indexedDB.open(name||DBN,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("kv"))r.result.createObjectStore("kv");};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}catch(e){rej(e);}});}
function idb(mode,k,v,name){return kv(name).then(db=>new Promise((res,rej)=>{const tx=db.transaction("kv",mode),st=tx.objectStore("kv"),q=mode==="readonly"?st.get(k):st.put(v,k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);}));}
let svT=null;
function save(){Rt.savedAt=new Date().toISOString();Rt.sum=summaryAll();const t=JSON.stringify(Rt);try{localStorage.setItem(KEY,t);}catch(e){}clearTimeout(svT);svT=setTimeout(()=>idb("readwrite","semestre",t).catch(()=>{}),300);paintSaved();}
window.__flush=()=>{try{const t=JSON.stringify(Rt);localStorage.setItem(KEY,t);idb("readwrite","semestre",t).catch(()=>{});}catch(e){}};
function paintSaved(){const e=$("fzSaved");if(e)e.textContent=Rt.savedAt?"💾 Salvato automaticamente alle "+new Date(Rt.savedAt).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})+" su questo dispositivo":"💾 Salvataggio automatico attivo";}
async function oldDb(){/* prima versione: copia nel database condiviso con Pianificazione (solo se esiste già) */
  try{if(!indexedDB.databases)return null;const l=await indexedDB.databases();if(!l.some(x=>x.name==="licenze-marco"))return null;
   const t=await idb("readonly","semestre",null,"licenze-marco");if(t)return JSON.parse(t);const f=await idb("readonly","fisica",null,"licenze-marco");return f?migrate(JSON.parse(f)):null;}catch(e){return null;}}
async function recover(){try{let t=await idb("readonly","semestre");let o=t?JSON.parse(t):null;
  if(!o)o=await oldDb();
  if(o&&(!Rt.savedAt||String(o.savedAt||"")>String(Rt.savedAt))){Rt=norm(o);useExam(EX);try{localStorage.setItem(KEY,JSON.stringify(Rt));}catch(e){}render();toast("Dati recuperati dalla copia del dispositivo");}}catch(e){}}
function toast(m){const e=$("toast");e.textContent=m;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),2200);}

/* ================= MOTORE DI UN ESAME ================= */
let EX="fis",E,UNITS,UN,TOPICS,TP,QB,QI,PT,S;
function useExam(id){EX=id;E=EXAMS[id];UNITS=E.units;UN=Object.fromEntries(UNITS.map(u=>[u.id,u]));TOPICS=E.topics;TP=Object.fromEntries(TOPICS.map(t=>[t.id,t]));QB=E.qb;QI=Object.fromEntries(QB.map(q=>[q.id,q]));PT=E.pt;S=Rt.exams[id];}
function withExam(id,fn){const p=EX;useExam(id);try{return fn();}finally{useExam(p);}}
useExam("fis");
const hasQ=id=>QB.some(q=>q.t===id);
function tScore(id){const s=S.tp[id]||{};if(!hasQ(id)){return Math.max(s.st?30:0,[0,15,50,80][s.self||0]);}
  const n=(s.ok||0)+(s.ko||0),acc=n?(s.ok||0)/n:0,conf=Math.min(1,n/4);return Math.round(100*((s.st?.3:0)+.7*acc*conf));}
function uScore(u){const ts=TOPICS.filter(t=>t.u===u);return Math.round(ts.reduce((a,t)=>a+tScore(t.id),0)/ts.length);}
function overall(){return Math.round(UNITS.reduce((a,u)=>a+uScore(u.id)*u.q,0)/31);}
function stLab(sc){return sc>=80?["Padroneggiato","ok"]:sc>=50?["Quasi","acc"]:sc>0?["In corso","soon"]:["Da iniziare",""];}
function rec(q,ok){const s=S.qs[q.id]||{ok:0,ko:0};ok?s.ok++:s.ko++;s.last=ok?1:0;s.d=today();S.qs[q.id]=s;const t=S.tp[q.t]||{};ok?t.ok=(t.ok||0)+1:t.ko=(t.ko||0)+1;t.d=today();S.tp[q.t]=t;S.days[today()]=(S.days[today()]||0)+1;}
function ptLevel(u){if(!S.pt)return null;const r=S.pt.unit[u];return r?r[0]:null;}
function plan(){const start=dOf(today()),end=dOf("2026-11-30");const D=Math.max(7,Math.round((end-start)/864e5)+1);
  const w=UNITS.map(u=>{const l=ptLevel(u.id);const weak=l==null?.5:1-l/2;return u.cfu*(1+weak)*(1-.6*uScore(u.id)/100);});
  const tot=w.reduce((a,b)=>a+b,0);let d=new Date(start),out=[];
  if(start<=end){UNITS.forEach((u,i)=>{const n=Math.max(2,Math.round(D*w[i]/tot));const a=new Date(d);d.setDate(d.getDate()+n);const b=new Date(d);b.setDate(b.getDate()-1);out.push({u,a:iso(a),b:iso(b)});});
   const last=out[out.length-1];if(dOf(last.b)>end){last.b=iso(end);if(dOf(last.b)<dOf(last.a))last.a=last.b;}}
  const lb=out.length?dOf(out[out.length-1].b).getTime()+864e5:start.getTime();
  out.push({x:"Ripasso, simulazioni a tempo, errori",a:iso(new Date(Math.max(lb,dOf("2026-12-01").getTime()))),b:"2026-12-09"});
  out.push({x:"1° appello nazionale, ore 11",a:EXAM1,b:EXAM1,ex:1});
  out.push({x:"Ripasso mirato sugli errori (se serve o per migliorare il voto)",a:"2026-12-11",b:"2027-01-10"});
  out.push({x:"2° appello nazionale, ore 11",a:EXAM2,b:EXAM2,ex:1});return out;}
function nextTopic(){const t=today(),pl=plan(),cur=pl.find(x=>x.u&&t>=x.a&&t<=x.b);
  const pool=cur?TOPICS.filter(x=>x.u===cur.u.id):TOPICS;const cand=pool.filter(x=>tScore(x.id)<80);
  const list=cand.length?cand:TOPICS.filter(x=>tScore(x.id)<80);if(!list.length)return null;
  return list.sort((a,b)=>tScore(a.id)-tScore(b.id)||TOPICS.indexOf(a)-TOPICS.indexOf(b))[0];}
function summary(){const nt=nextTopic(),ls=S.sims[S.sims.length-1];return{t:ename(EX),ic:E.ic,ready:E.ready,overall:overall(),units:Object.fromEntries(UNITS.map(u=>[u.id,{t:u.t,ic:u.ic,s:uScore(u.id)}])),
  next:nt?{id:nt.id,t:nt.t,u:UN[nt.u].t}:null,pt:S.pt?{score:S.pt.score,n:PT.length,lev:S.pt.lev,date:S.pt.date}:null,sim:ls?{pts:ls.pts,date:ls.date,pass:ls.pts>=18}:null,
  week:Object.entries(S.days).filter(([d])=>daysTo(d)>-7).reduce((a,[,n])=>a+n,0),studied:TOPICS.filter(t=>(S.tp[t.id]||{}).st).length,topics:TOPICS.length};}
function summaryAll(){const o={date:new Date().toISOString(),exams:{}};EXORD.forEach(k=>o.exams[k]=withExam(k,summary));return o;}

/* ================= QUIZ ================= */
const nrm=s=>String(s||"").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g,"").replace(/,/g,".").replace(/−/g,"-");
const cpOK=(q,v)=>q.a.map(nrm).includes(nrm(v));
const L5="ABCDE";
function qHTML(q,i,ctx){const head=`<div class="qh"><span class="qn">${i!=null?i+".":""}</span><div class="qt">${esc(q.q)}</div></div>`;
  if(q.k==="m")return `<div class="q" data-q="${q.id}" data-ctx="${ctx}">${head}<div class="opts">${q.o.map((o,j)=>`<button class="opt" type="button" data-o="${j}"><i>${L5[j]}</i><span>${esc(o)}</span></button>`).join("")}</div><div class="solw"></div></div>`;
  return `<div class="q" data-q="${q.id}" data-ctx="${ctx}">${head}<div class="cpl"><input type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Scrivi una parola" aria-label="Risposta"><button class="btn sm pri" type="button" data-chk>Verifica</button><button class="btn sm" type="button" data-skip>Non so</button></div><div class="solw"></div></div>`;}
function answerImmediate(box,q,val){if(box.dataset.done)return;box.dataset.done=1;let ok;
  if(q.k==="m"){ok=val===q.a;box.querySelectorAll(".opt").forEach((b,j)=>{b.disabled=true;if(j===q.a)b.classList.add("right");else if(j===val)b.classList.add("wrong");});}
  else{const inp=box.querySelector("input");ok=val!=null&&cpOK(q,val);inp.disabled=true;inp.classList.add(ok?"right":"wrong");box.querySelectorAll(".cpl button").forEach(b=>b.disabled=true);}
  box.querySelector(".solw").innerHTML=`<div class="sol">${ok?'<b class="okc">✓ Giusto.</b>':'<b class="koc">✗ '+(val==null?"Saltata.":"Sbagliato.")+'</b> Risposta: <b>'+esc(q.k==="m"?L5[q.a]+") "+q.o[q.a]:q.a[0])+"</b>."} ${esc(q.s||"")}</div>`;
  rec(q,ok);save();return ok;}

/* ================= NAVIGAZIONE ================= */
const PLAT=[["home","🩺","Semestre filtro"],["regole","🎓","Regole e UPO"],["prog","📈","Progressi e copie"],["installa","📲","Installa su un altro iPad"]];
function exSects(){const s=[["","🏠","Percorso"]];if(PT.length)s.push(["test","🧭","Test d'ingresso"]);s.push(["arg","📚",E.ready?"Argomenti":"Programma"]);
  if(QB.length){s.push(["es","✏️","Esercizi"]);s.push(["sim","⏱️","Simulazione"]);}if(TOPICS.some(t=>t.form))s.push(["form","📐","Formulario"]);s.push(["info","📜","Storia e syllabus"]);return s;}
let view="home",curT=null,PR=null,SIMV=null,simTimer=null,PTA=null,argU=null;
function route(){const h=decodeURIComponent((location.hash||"").slice(1));const p=h.split("/");
  if(EXAMS[p[0]]){if(p[0]!==EX){useExam(p[0]);PR=null;SIMV=null;PTA=null;}
    if(p[1]==="t"&&TP[p[2]]){view="arg";curT=p[2];}else{curT=null;view=exSects().some(s=>s[0]===(p[1]||""))?"ex:"+(p[1]||""):"ex:";}}
  else{curT=null;view=PLAT.some(s=>s[0]===h)?h:"home";}render();}
function go(h){if(location.hash!=="#"+h)location.hash=h;else route();}
const exView=()=>view.startsWith("ex:")||view==="arg";
function side(){const inEx=exView();let o=PLAT.map(([k,i,t])=>`<button data-go="${k}" class="${view===k?"on":""}"${view===k?' aria-current="page"':""}><span class="ic">${i}</span>${t}</button>`).join("");
  o+=`<div class="sidel">Esami</div>`+EXORD.map(k=>{const on=inEx&&EX===k;const sc=withExam(k,overall);return `<button data-go="${k}" class="exb${on?" on":""}"><span class="ic">${EXAMS[k].ic}</span>${ename(k)}<span class="pct">${sc}%</span></button>${on?`<div class="subnav">${exSects().map(([s,ic,t])=>{const act=(view==="ex:"+s)||(s==="arg"&&view==="arg");return `<button data-go="${EX}${s?"/"+s:""}" class="${act?"on":""}"><span class="ic">${ic}</span>${t}${s==="test"&&!S.pt?'<span class="n">1°</span>':""}${s==="sim"&&S.run?'<span class="n">⏱</span>':""}</button>`;}).join("")}</div>`:""}`;}).join("");
  $("side").innerHTML=o;}
function render(){RUN.clear();clearInterval(simTimer);side();const m=$("main");const v=view;
  let h;if(v==="home")h=vHub();else if(v==="regole")h=vRegole();else if(v==="prog")h=vProg();else if(v==="installa")h=vInstalla();
  else if(curT)h=vTopic(curT);else h=({"ex:":vHome,"ex:test":vTest,"ex:arg":vArg,"ex:es":vEs,"ex:sim":vSim,"ex:form":vForm,"ex:info":vInfo}[v]||vHome)();
  m.innerHTML=h+'<p class="saved" id="fzSaved"></p>';paintSaved();bind();window.scrollTo(0,0);}
const exHead=()=>`<p class="crumb"><button class="btn sm" data-go="home">‹ Semestre filtro</button> <span class="lbl">${E.ic} ${esc(E.t)}</span></p>`;

/* ----- Piattaforma ----- */
function vHub(){const d1=daysTo(EXAM1),d2=daysTo(EXAM2);
  let o=`<h1>🩺 Semestre filtro</h1><p class="sub">Medicina e Chirurgia UPO (Novara / Alessandria) · a.a. 2026/2027 · tre esami nazionali da 31 domande, stesso giorno e stessa ora in tutta Italia.</p>
  <div class="kpi"><div><b>${d1>=0?d1:"—"}</b><span>giorni al 1° appello · gio 10 dic, ore 11</span></div><div><b>${d2>=0?d2:"—"}</b><span>giorni al 2° appello · lun 11 gen, ore 11</span></div><div><b>3 × 6 CFU</b><span>Fisica · Chimica · Biologia</span></div><div><b>18/30</b><span>soglia per superare ogni esame</span></div></div>`;
  o+=`<div class="grid">`+EXORD.map(k=>{const s=withExam(k,summary),X=EXAMS[k];return `<div class="card excard"><h3><span class="ubadge" style="--uc:var(${X.col})">${X.ic}</span>${esc(X.t)}${X.ready?"":'<span class="pill soon">in costruzione</span>'}</h3>
   <div class="hero"><div class="ring sm" style="--p:${s.overall};--rc:var(${X.col})"><b>${s.overall}%</b></div><div class="lbl">${X.ready?`${s.studied}/${s.topics} argomenti studiati · ${s.week} esercizi in 7 giorni${s.pt?`<br>Test d'ingresso ${s.pt.score}/${s.pt.n} (${s.pt.lev})`:"<br>Test d'ingresso da fare"}${s.sim?`<br>Ultima simulazione: <b>${F2(s.sim.pts,1)}</b>/31`:""}`:`Programma ufficiale con ${s.topics} argomenti e autovalutazione. Spiegazioni, esercizi e simulazioni in arrivo.`}</div></div>
   ${s.next?`<p class="lbl" style="margin:10px 0 0">Prossimo: <b>${esc(s.next.t)}</b></p>`:""}<div class="btns"><button class="btn ${X.ready?"pri":""}" data-go="${k}">Apri ${esc(ename(k))}</button>${X.ready&&!s.pt&&X.pt.length?`<button class="btn" data-go="${k}/test">Test d'ingresso</button>`:""}</div></div>`;}).join("")+`</div>`;
  o+=`<h2>Come si entra</h2><div class="card"><p style="margin-top:0">La graduatoria nazionale ha tre sezioni: prima chi ha superato <b>tutti e tre</b> gli esami, poi chi ne ha superati due, poi chi ne ha superato uno; dentro ogni sezione conta il punteggio totale (massimo 93). Chi è in posizione utile ma ha uno o due esami mancanti li recupera nella sede assegnata prima del 2° semestre.</p>
   <p class="lbl" style="margin:0">Strategia: arrivare a 18 in tutti e tre conta più di un voto altissimo in uno solo. Nel 2025 la Fisica è stata l'ostacolo principale, per questo è la prima materia completa dell'app.</p></div>
   <h2>Settimana tipo</h2><div class="card"><table class="t"><tr><th>Giorno</th><th>Studio</th><th>Verifica</th></tr>
   <tr><td>Lunedì</td><td>Fisica: argomento del piano + Biologia</td><td>10 esercizi</td></tr><tr><td>Martedì</td><td>Chimica + Fisica (esercizi)</td><td>esercizi misti</td></tr><tr><td>Mercoledì</td><td>Biologia + Chimica</td><td>completamenti</td></tr><tr><td>Giovedì</td><td>Fisica: nuovo argomento + animazioni</td><td>10 esercizi</td></tr><tr><td>Venerdì</td><td>Chimica + Biologia</td><td>ripasso errori</td></tr><tr><td>Sabato</td><td>Simulazione a tempo (da novembre: una materia a turno)</td><td>analisi errori</td></tr><tr><td>Domenica</td><td>Ripasso leggero</td><td>piano della settimana</td></tr></table>
   <p class="lbl" style="margin:8px 0 0">Ogni giorno: 10 minuti di richiamo a memoria, studio di un argomento, esercizi senza guardare le soluzioni, correzione. Gli errori si ripetono dopo 1, 3 e 7 giorni.</p></div>`;
  return o;}

/* ----- Percorso dell'esame ----- */
function vHome(){const ov=overall(),nt=nextTopic(),ls=S.sims[S.sims.length-1],t=today(),pl=plan();
  let o=exHead()+`<h1>${E.ic} ${esc(E.t)}</h1><p class="sub">Programma ministeriale 2026/27 (syllabus MUR, 6 CFU) · ${UNITS.length} unità · ${TOPICS.length} argomenti${QB.length?` · ${QB.length} esercizi`:""}.</p>`;
  if(!E.ready)o+=`<div class="note">🚧 <b>In costruzione.</b> Per ora trovi il programma ufficiale completo, diviso in unità e argomenti, con l'autovalutazione (segna quanto conosci ogni argomento) e il piano di studio. Spiegazioni, animazioni, esercizi e simulazioni arriveranno con lo stesso schema di Fisica.</div>`;
  o+=`<div class="kpi"><div><b>${TOPICS.filter(x=>(S.tp[x.id]||{}).st).length}/${TOPICS.length}</b><span>argomenti studiati</span></div><div><b>${ov}%</b><span>preparazione</span></div>${QB.length?`<div><b>${ls?F2(ls.pts,1):"—"}</b><span>ultima simulazione (su 31)</span></div>`:""}</div>`;
  if(PT.length&&!S.pt)o+=`<div class="card" style="border-color:var(--accent)"><h3>🧭 Inizia da qui: test d'ingresso</h3><p class="lead" style="margin:0 0 6px">${PT.length} domande, circa 10 minuti. Serve a capire da quale base parti e a costruire il piano di studio su misura fino al 10 dicembre.</p><div class="btns"><button class="btn pri" data-go="${EX}/test">Fai il test d'ingresso</button></div></div>`;
  o+=`<div class="grid"><div class="card"><h3>📊 Preparazione</h3><div class="hero"><div class="ring" style="--p:${ov}"><b>${ov}%</b></div><div class="lbl">Media pesata delle unità, con il peso che hanno nella prova (31 domande). ${E.ready?"Sale studiando gli argomenti e rispondendo bene agli esercizi.":"Per ora si basa sulla tua autovalutazione."}${S.pt?`<br>Test d'ingresso: <b>${S.pt.score}/${PT.length}</b> · livello <b>${S.pt.lev}</b>.`:""}</div></div></div>`;
  o+=`<div class="card"><h3>🎯 Oggi ti consiglio</h3>${nt?`<div class="row"><span class="ubadge" style="--uc:var(--${nt.u.replace(/^[cb]/,"u")})">${UN[nt.u].ic}</span><div class="grow"><b>${esc(nt.t)}</b><small>${esc(UN[nt.u].t)} · ${stLab(tScore(nt.id))[0]}</small></div></div><div class="btns"><button class="btn pri" data-go="${EX}/t/${nt.id}">${E.ready?"Studia l'argomento":"Apri il programma"}</button>${hasQ(nt.id)?`<button class="btn" data-pr="t:${nt.id}">Solo esercizi</button>`:""}</div>`:`<p class="empty">Tutti gli argomenti sono padroneggiati: fai simulazioni complete.</p>`}</div></div>`;
  o+=`<h2>Unità del programma</h2><div class="card">${UNITS.map(u=>{const sc=uScore(u.id),l=ptLevel(u.id);return `<button class="trow" data-go="${EX}/arg" data-u="${u.id}"><span class="ubadge" style="--uc:var(--${u.id.replace(/^[cb]/,"u")})">${u.ic}</span><div class="grow"><b>${esc(u.t)}</b><small>${u.cfu.toLocaleString("it-IT")} CFU · circa ${u.q} domande su 31${l!=null?` · base: <span class="lvl l${l}">${["da costruire","da rinforzare","buona"][l]}</span>`:""}</small></div><div class="mbar"><div class="bar"><i style="width:${sc}%;background:var(--${u.id.replace(/^[cb]/,"u")})"></i></div></div><b style="width:42px;text-align:right">${sc}%</b></button>`;}).join("")}</div>`;
  o+=`<h2>Piano di studio</h2><div class="card"><div class="plan">${pl.map(x=>{const now=t>=x.a&&t<=x.b;return `<div class="pstep${now?" now":""}"><span class="d">${x.a===x.b?fmtD(x.a,{weekday:"short",day:"numeric",month:"short"}):fmtD(x.a)+" – "+fmtD(x.b)}</span><span>${x.u?`${x.u.ic} <b>${esc(x.u.t)}</b> <span class="lbl">· ${uScore(x.u.id)}%</span>`:x.ex?`<b>🎓 ${x.x}</b>`:`📝 ${x.x}`}${now?' <span class="pill acc">adesso</span>':""}</span></div>`;}).join("")}</div><p class="lbl" style="margin:8px 0 0">${S.pt?"I giorni per unità tengono conto del peso in CFU, del test d'ingresso e dei progressi: il piano si aggiorna da solo.":"Il piano si adatta ai CFU e ai progressi"+(PT.length?"; diventa su misura dopo il test d'ingresso.":".")} Le lezioni UPO da ottobre sono online (Zoom/DIR): segui qui l'argomento della settimana.</p></div>`;
  return o;}

/* ----- Test d'ingresso ----- */
function vTest(){const head=exHead();if(S.pt&&!PTA){const p=S.pt;let o=head+`<h1>🧭 Test d'ingresso · ${esc(ename(EX))}</h1><p class="sub">Fatto il ${fmtD(p.date,{day:"numeric",month:"long"})}.</p><div class="grid"><div class="card"><h3>Risultato</h3><div class="big">${p.score}/${PT.length}</div><p class="lbl">Livello di partenza: <b>${p.lev}</b>${Rt.school?` · scuola: ${esc(Rt.school)}`:""}</p><p>${levText(p.lev)}</p><div class="btns"><button class="btn pri" data-go="${EX}">Vedi il piano</button><button class="btn" id="ptRedo">Rifai il test</button></div></div>`;
  o+=`<div class="card"><h3>Base per unità</h3>${UNITS.map(u=>{const r=p.unit[u.id]||[0,2];return `<div class="row"><span class="ubadge" style="--uc:var(--${u.id})">${u.ic}</span><div class="grow">${esc(u.t)}</div><span class="lvl l${r[0]}">${["Da costruire","Da rinforzare","Buona"][r[0]]}</span></div>`;}).join("")}</div></div>`;return o;}
  PTA=PTA||{a:{},school:Rt.school};
  return head+`<h1>🧭 Test d'ingresso · ${esc(ename(EX))}</h1><p class="sub">${PT.length} domande di livello scuola superiore, 2 per ogni unità. Non conta per il voto: serve a capire da dove partire. Rispondi d'istinto; se non sai, lascia vuoto.</p>
  <div class="card"><h3>Che scuola superiore hai fatto?</h3><div class="segc" id="ptSchool">${SCHOOLS.map(s=>`<button type="button" class="${PTA.school===s?"on":""}">${s}</button>`).join("")}</div></div>
  <div class="card">${PT.map((q,i)=>`<div class="q" data-pt="${i}"><div class="qh"><span class="qn">${i+1}.</span><div class="qt">${esc(q.q)} <span class="pill" style="font-size:11px">${UN[q.u].ic} ${esc(UN[q.u].t)}</span></div></div><div class="opts">${q.o.map((o,j)=>`<button class="opt${PTA.a[i]===j?" sel":""}" type="button" data-o="${j}"><i>${L5[j]}</i><span>${esc(o)}</span></button>`).join("")}</div></div>`).join("")}
  <div class="btns"><button class="btn pri" id="ptDone">Vedi il risultato</button></div></div>`;}
function levText(l){return l==="avanzato"?"Hai basi solide: puoi andare veloce sulle parti note e concentrarti sui fluidi, sulla termodinamica e sulle novità 2026. Allenati presto sui tempi.":l==="intermedio"?"Basi discrete con qualche lacuna: segui il piano unità per unità, guarda le animazioni e fai gli esercizi di ogni argomento prima delle simulazioni.":"Si parte dalle basi: è normale. Segui il piano dall'inizio, usa molto le animazioni e il formulario, e fai pochi esercizi ma tutti i giorni.";}

/* ----- Argomenti / programma ----- */
const SELF=[["Non ancora","Da studiare"],["In parte","Lo conosco in parte"],["Bene","Lo so bene"]];
function vArg(){const fu=argU;let o=exHead()+`<h1>📚 ${E.ready?"Argomenti":"Programma"} · ${esc(ename(EX))}</h1><p class="sub">Il programma ufficiale 2026/27 (syllabus MUR, 6 CFU) diviso nelle ${UNITS.length} unità didattiche. ${E.ready?"Ogni argomento: concetti chiave, formule, animazione, trappole d'esame ed esercizi.":"Per ogni argomento: le voci del syllabus e la tua autovalutazione."} <a href="${E.syl}" target="_blank" rel="noopener">Syllabus ufficiale (PDF)</a></p>`;
  o+=UNITS.map(u=>`<div class="card" id="u-${u.id}"><h3><span class="ubadge" style="--uc:var(--${u.id.replace(/^[cb]/,"u")})">${u.ic}</span>${esc(u.t)} <span class="lbl" style="font-weight:600">· ${u.cfu.toLocaleString("it-IT")} CFU · ${uScore(u.id)}%</span>${QB.some(q=>q.u===u.id)?`<button class="lnk" data-pr="u:${u.id}">Esercizi ›</button>`:""}</h3><div class="tlist">${TOPICS.filter(t=>t.u===u.id).map(t=>{const sc=tScore(t.id),lb=stLab(sc),nq=QB.filter(q=>q.t===t.id).length,s=S.tp[t.id]||{};return `<button class="trow" data-go="${EX}/t/${t.id}"><div class="grow"><b>${esc(t.t)}</b>${t.tag?`<span class="tag26">${esc(t.tag)}</span>`:""}<small>${t.anim?"🎞️ animazione · ":""}${nq?nq+" esercizi":"programma"+(s.self?" · "+SELF[s.self-1][1].toLowerCase():"")}${s.st?" · ✓ studiato":""}</small></div><span class="pill ${lb[1]}">${lb[0]}</span><div class="mbar"><div class="bar"><i style="width:${sc}%;background:var(--${u.id.replace(/^[cb]/,"u")})"></i></div></div></button>`;}).join("")}</div></div>`).join("");
  return o;}
function vTopic(id){const t=TP[id],u=UN[t.u],s=S.tp[id]||{},qs=QB.filter(q=>q.t===id),i=TOPICS.indexOf(t),prev=TOPICS[i-1],next=TOPICS[i+1];
  if(!s.seen){S.tp[id]=Object.assign(s,{seen:today()});save();}
  let o=`<p class="crumb"><button class="btn sm" data-go="${EX}/arg">‹ ${E.ready?"Argomenti":"Programma"}</button> <span class="lbl">${E.ic} ${esc(ename(EX))} · ${u.ic} ${esc(u.t)}</span></p><h1>${esc(t.t)}${t.tag?`<span class="tag26">${esc(t.tag)}</span>`:""}</h1><p class="sub" id="tSub">${stLab(tScore(id))[0]} · ${tScore(id)}%</p>`;
  if(t.breve)o+=`<div class="card"><h3>💡 In breve</h3><ul class="breve">${t.breve.map(b=>`<li>${esc(b)}</li>`).join("")}</ul></div>`;
  if(t.syl)o+=`<div class="card"><h3>📋 Dal syllabus ufficiale</h3><ul class="breve">${t.syl.map(b=>`<li>${esc(b)}</li>`).join("")}</ul><p class="lbl" style="margin:8px 0 0">Spiegazioni, animazioni ed esercizi di questo argomento sono in preparazione.</p></div>`;
  if(t.sp)o+=`<div class="card expl"><h3>📖 Spiegazione</h3>${t.sp.map(p=>`<p>${esc(p)}</p>`).join("")}</div>`;
  if(t.anim)o+=`<div class="card"><h3>🎞️ Prova tu</h3><p class="lbl" style="margin:0">Muovi i cursori e guarda che cosa cambia.</p><div id="animBox"></div></div>`;
  if(t.es&&t.es.length)o+=`<div class="card"><h3>🧮 Esempi svolti</h3>${t.es.map((e,j)=>`<details class="esv"${j?"":" open"}><summary><b>Esempio ${j+1}.</b> ${esc(e.q)}</summary><ol>${e.p.map(x=>`<li>${esc(x)}</li>`).join("")}</ol><p class="esr">➜ ${esc(e.r)}</p></details>`).join("")}<p class="lbl" style="margin:8px 0 0">Prova a risolverli da solo prima di aprire i passaggi.</p></div>`;
  if(t.form)o+=`<div class="card"><h3>📐 Formule</h3>${t.form.map(f=>`<div class="formula">${esc(f[0])}${f[1]?`<small>${esc(f[1])}</small>`:""}</div>`).join("")}${t.trap?`<div class="trap">⚠️ <b>Trappola d'esame:</b> ${esc(t.trap)}</div>`:""}</div>`;
  if(t.med)o+=`<div class="card med"><h3>🩺 In medicina</h3><p style="margin:0">${esc(t.med)}</p></div>`;
  if(!qs.length)o+=`<div class="card"><h3>🙋 Quanto lo conosci?</h3><div class="segc" id="selfEv">${SELF.map((x,j)=>`<button type="button" data-v="${j+1}" class="${s.self===j+1?"on":""}">${x[1]}</button>`).join("")}</div><p class="lbl" style="margin:8px 0 0">La tua risposta aggiorna la percentuale dell'unità e il piano di studio.</p></div>`;
  else o+=`<div class="card"><h3>✏️ Esercizi (${qs.length}) <button class="lnk" data-pr="t:${id}">Allenamento ›</button></h3>${qs.map((q,j)=>qHTML(q,j+1,"tp")).join("")}</div>`;
  o+=`<div class="btns" style="justify-content:space-between"><span>${prev?`<button class="btn" data-go="${EX}/t/${prev.id}">‹ ${esc(prev.t)}</button>`:""}</span><button class="btn ${s.st?"ok":"pri"}" id="tStudied">${s.st?"✓ Studiato":"Segna come studiato"}</button><span>${next?`<button class="btn" data-go="${EX}/t/${next.id}">${esc(next.t)} ›</button>`:""}</span></div>`;
  return o;}

/* ----- Esercizi ----- */
function pick(arr,n){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n);}
function startPR(mode){let list,lab;
  if(mode.startsWith("t:")){const id=mode.slice(2);list=pick(QB.filter(q=>q.t===id),10);lab=TP[id].t;}
  else if(mode.startsWith("u:")){const u=mode.slice(2);list=pick(QB.filter(q=>q.u===u),10);lab=UN[u].t;}
  else if(mode==="err"){list=pick(QB.filter(q=>S.qs[q.id]&&S.qs[q.id].last===0),10);lab="Ripasso degli errori";}
  else if(mode==="weak"){const w=TOPICS.filter(t=>hasQ(t.id)).sort((a,b)=>tScore(a.id)-tScore(b.id)).slice(0,5).map(t=>t.id);list=pick(QB.filter(q=>w.includes(q.t)),10);lab="Punti deboli";}
  else{list=pick(QB,10);lab="Misto";}
  if(!list.length){toast("Nessuna domanda per questa scelta");return;}PR={lab,list,i:0,ok:0};curT=null;view="ex:es";if(location.hash!=="#"+EX+"/es")history.replaceState(null,"","#"+EX+"/es");render();}
function vEs(){const h=exHead();if(PR){const q=PR.list[PR.i];if(!q){const r=PR;PR=null;return h+`<h1>✏️ ${esc(r.lab)}</h1><div class="card"><div class="big">${r.ok}/${r.list.length}</div><p class="lbl">risposte giuste</p><div class="btns"><button class="btn pri" data-pr="weak">Allenati sui punti deboli</button><button class="btn" data-go="${EX}/es">Altri esercizi</button></div></div>`;}
   return h+`<h1>✏️ ${esc(PR.lab)}</h1><p class="sub">Domanda ${PR.i+1} di ${PR.list.length} · ${PR.ok} giuste</p><div class="bar" style="margin-bottom:12px"><i style="width:${PR.i/PR.list.length*100}%"></i></div><div class="card" id="prBox"><p class="lbl" style="margin:0 0 6px">${UN[q.u].ic} ${esc(TP[q.t].t)} · ${q.k==="m"?"risposta multipla":"completamento"}</p>${qHTML(q,null,"pr")}<div class="btns"><button class="btn pri" id="prNext" hidden>Avanti ›</button><button class="btn" id="prStop">Termina</button></div></div>`;}
  const ne=QB.filter(q=>S.qs[q.id]&&S.qs[q.id].last===0).length;
  return h+`<h1>✏️ Esercizi · ${esc(ename(EX))}</h1><p class="sub">Serie da 10 domande con correzione e spiegazione immediata. ${QB.length} domande in stile prova nazionale (numeri semplici, senza calcolatrice).</p>
  <div class="grid"><div class="card"><h3>Scegli come allenarti</h3><div class="btns" style="flex-direction:column;align-items:stretch"><button class="btn pri" data-pr="weak">🎯 Punti deboli</button><button class="btn" data-pr="mix">🔀 Misto su tutto il programma</button><button class="btn" data-pr="err"${ne?"":" disabled"}>🔁 Ripassa gli errori (${ne})</button></div></div>
  <div class="card"><h3>Per unità</h3>${UNITS.map(u=>`<button class="trow" data-pr="u:${u.id}"><span class="ubadge" style="--uc:var(--${u.id})">${u.ic}</span><div class="grow">${esc(u.t)}<small>${QB.filter(q=>q.u===u.id).length} domande</small></div><b>${uScore(u.id)}%</b></button>`).join("")}</div></div>`;}

/* ----- Simulazione ----- */
const SIM_MIN=50;
function buildSim(){let mc=[],cp=[];UNITS.forEach(u=>{const pc=pick(QB.filter(q=>q.u===u.id&&q.k==="c"),u.cp),pm=pick(QB.filter(q=>q.u===u.id&&q.k==="m"),u.q-pc.length);cp=cp.concat(pc);mc=mc.concat(pm);});return mc.concat(cp).map(q=>q.id);}
function simLeft(){return S.run?Math.max(0,S.run.start+SIM_MIN*60e3-Date.now()):0;}
function grade(run){let ok=0,ko=0,om=0;const per={};run.q.forEach((id,i)=>{const q=QI[id],v=run.a[i];if(!q)return;const u=q.u;per[u]=per[u]||[0,0];per[u][1]++;
  if(v==null||v===""){om++;return;}const r=q.k==="m"?v===q.a:cpOK(q,v);if(r){ok++;per[u][0]++;}else ko++;});return{ok,ko,om,pts:Math.round((ok-.1*ko)*10)/10,per};}
function finishSim(auto){const r=S.run;if(!r)return;const g=grade(r);r.q.forEach((id,i)=>{const q=QI[id],v=r.a[i];if(q&&v!=null&&v!=="")rec(q,q.k==="m"?v===q.a:cpOK(q,v));});
  S.sims.push({date:new Date().toISOString(),pts:g.pts,ok:g.ok,ko:g.ko,om:g.om,per:g.per,q:r.q,a:r.a,min:Math.round((Date.now()-r.start)/60e3)});S.run=null;save();SIMV=S.sims.length-1;if(auto)toast("Tempo scaduto: prova consegnata");render();}
function voto(p){return p>30?"30 e lode":p>=18?Math.min(30,Math.round(p))+"/30":"non superato";}
function vSim(){const h=exHead();
  if(S.run){if(simLeft()<=0){setTimeout(()=>finishSim(true),0);return "<p>Consegna…</p>";}const r=S.run;
   return `<div id="player"><div class="timer"><span class="clock" id="clock">--:--</span><div class="grow lbl">${E.ic} ${esc(ename(EX))} · 21 a risposta multipla + 10 a completamento · +1 giusta, −0,1 sbagliata, 0 omessa. Per togliere una risposta toccala di nuovo.</div><button class="btn pri" id="simEnd">Consegna</button></div>
   <div class="card">${r.q.map((id,i)=>{const q=QI[id];if(!q)return"";const v=r.a[i];const sec=i===0?`<h3>Parte 1 · risposta multipla</h3>`:i===21?`<h3 style="margin-top:14px">Parte 2 · completamento (una sola parola, in stampatello)</h3>`:"";
    return sec+(q.k==="m"?`<div class="q" data-si="${i}"><div class="qh"><span class="qn">${i+1}.</span><div class="qt">${esc(q.q)}</div></div><div class="opts">${q.o.map((o,j)=>`<button class="opt${v===j?" sel":""}" type="button" data-o="${j}"><i>${L5[j]}</i><span>${esc(o)}</span></button>`).join("")}</div></div>`
     :`<div class="q" data-si="${i}"><div class="qh"><span class="qn">${i+1}.</span><div class="qt">${esc(q.q)}</div></div><div class="cpl"><input type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${esc(v||"")}" placeholder="Risposta" aria-label="Risposta ${i+1}"></div></div>`);}).join("")}
   <div class="btns"><button class="btn pri" id="simEnd2">Consegna la prova</button></div></div></div>`;}
  if(SIMV!=null&&S.sims[SIMV]){const s=S.sims[SIMV];const pass=s.pts>=18;
   let o=h+`<h1>⏱️ Risultato della simulazione</h1><p class="sub">${new Date(s.date).toLocaleString("it-IT",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})} · ${s.min} minuti</p>
   <div class="kpi"><div><b style="color:var(--${pass?"ok":"warn"})">${F2(s.pts,1)}</b><span>punti su 31 · ${voto(s.pts)}</span></div><div><b>${s.ok}</b><span>giuste (+${s.ok})</span></div><div><b>${s.ko}</b><span>sbagliate (−${F2(s.ko*.1,1)})</span></div><div><b>${s.om}</b><span>omesse (0)</span></div></div>
   <div class="card"><h3>Per unità</h3>${UNITS.map(u=>{const r=s.per[u.id]||[0,0];return `<div class="row"><span class="ubadge" style="--uc:var(--${u.id})">${u.ic}</span><div class="grow">${esc(u.t)}</div><b>${r[0]}/${r[1]}</b></div>`;}).join("")}${s.om?`<div class="note">💡 Con −0,1 per errore e 5 opzioni, anche una risposta a caso vale in media +0,12 punti: <b>nelle domande a risposta multipla conviene non lasciare vuoti.</b></div>`:""}</div>
   <div class="card"><h3>Correzione</h3>${s.q.map((id,i)=>{const q=QI[id];if(!q)return"";const v=s.a[i],om=v==null||v==="",ok=!om&&(q.k==="m"?v===q.a:cpOK(q,v));
    return `<div class="q"><div class="qh"><span class="qn">${i+1}.</span><div class="qt">${esc(q.q)}</div></div><div class="sol">${om?"⚪ Omessa":ok?'<b class="okc">✓ Giusta</b>':'<b class="koc">✗ Sbagliata</b> (hai risposto: '+esc(q.k==="m"?L5[v]+") "+q.o[v]:v)+")"} · Risposta: <b>${esc(q.k==="m"?L5[q.a]+") "+q.o[q.a]:q.a[0])}</b>. ${esc(q.s)} <button class="lnk" data-go="${EX}/t/${q.t}">Ripassa ›</button></div></div>`;}).join("")}</div>
   <div class="btns"><button class="btn pri" id="simStart">Nuova simulazione</button><button class="btn" id="simBack">Indietro</button></div>`;return o;}
  const best=S.sims.reduce((a,s)=>Math.max(a,s.pts),-Infinity);
  return h+`<h1>⏱️ Simulazione · ${esc(ename(EX))}</h1><p class="sub">Stessa struttura della prova nazionale 2026/27: 31 domande (21 a risposta multipla con 5 opzioni + 10 a completamento), 50 minuti, punteggio +1 / −0,1 / 0, sufficienza a 18. Le domande sono distribuite tra le unità in base ai CFU e alle prove 2025.</p>
  <div class="grid"><div class="card"><h3>Pronto?</h3><p>Mettiti in un posto tranquillo, senza calcolatrice né formulario. Il tempo parte quando tocchi il pulsante e continua anche se chiudi l'app: le risposte restano salvate.</p><div class="btns"><button class="btn pri" id="simStart">▶ Inizia la simulazione (50 min)</button></div></div>
  <div class="card"><h3>Le tue simulazioni</h3>${S.sims.length?S.sims.slice().reverse().slice(0,8).map((s,k)=>{const i=S.sims.length-1-k;return `<button class="trow" data-simv="${i}"><div class="grow"><b>${F2(s.pts,1)} punti</b><small>${new Date(s.date).toLocaleDateString("it-IT",{day:"numeric",month:"short"})} · ${s.ok} giuste, ${s.ko} sbagliate, ${s.om} omesse</small></div><span class="pill ${s.pts>=18?"ok":"warn"}">${s.pts>=18?"superata":"sotto 18"}</span></button>`;}).join("")+`<p class="lbl">Migliore: <b>${F2(best,1)}</b></p>`:'<p class="empty">Ancora nessuna. Consiglio: la prima dopo aver visto tutte le unità almeno una volta, poi una a settimana; dal 1° dicembre una ogni due giorni.</p>'}</div></div>`;}
function tickSim(){const e=$("clock");if(!e){clearInterval(simTimer);return;}const l=simLeft();const m=Math.floor(l/60e3),s=Math.floor(l%60e3/1e3);e.textContent=pad(m)+":"+pad(s);e.classList.toggle("low",l<5*60e3);if(l<=0){clearInterval(simTimer);finishSim(true);}}

/* ----- Formulario ----- */
function vForm(){let o=exHead()+`<h1>📐 Formulario · ${esc(ename(EX))}</h1><p class="sub">Tutte le formule del programma, unità per unità. All'esame non si porta: ripassale a voce e fai attenzione alle unità di misura.</p>
  <div class="fgrid">${UNITS.map(u=>`<div class="card"><h3><span class="ubadge" style="--uc:var(--${u.id})">${u.ic}</span>${esc(u.t)}</h3>${TOPICS.filter(t=>t.u===u.id&&t.form).map(t=>t.form.map(f=>`<div class="formula">${esc(f[0])}</div>`).join("")).join("")}</div>`).join("")}</div>`;
  if(EX==="fis")o+=`<div class="card"><h3>🔢 Costanti e valori da sapere</h3><table class="t"><tr><th>Grandezza</th><th>Valore</th></tr>
  <tr><td>Accelerazione di gravità g</td><td>9,8 m/s² (spesso 10 negli esercizi)</td></tr><tr><td>Pressione atmosferica</td><td>1 atm ≈ 1,013·10⁵ Pa ≈ 760 mmHg</td></tr><tr><td>Densità dell'acqua</td><td>1000 kg/m³ = 1 g/cm³</td></tr><tr><td>Calore specifico dell'acqua</td><td>4186 J/(kg·K) ≈ 1 cal/(g·°C)</td></tr><tr><td>Costante dei gas R</td><td>8,31 J/(mol·K)</td></tr><tr><td>Volume molare (0 °C, 1 atm)</td><td>22,4 L</td></tr><tr><td>Velocità del suono in aria</td><td>≈ 340 m/s</td></tr><tr><td>Velocità della luce</td><td>3·10⁸ m/s</td></tr><tr><td>Carica elementare e</td><td>1,6·10⁻¹⁹ C · 1 eV = 1,6·10⁻¹⁹ J</td></tr><tr><td>Costante di Coulomb k</td><td>9·10⁹ N·m²/C²</td></tr><tr><td>Costante di Planck h</td><td>6,6·10⁻³⁴ J·s</td></tr><tr><td>Soglia di udibilità I₀</td><td>10⁻¹² W/m²</td></tr><tr><td>sin 30° · sin 45° · sin 60°</td><td>0,5 · 0,71 · 0,87</td></tr><tr><td>ln 2</td><td>≈ 0,693</td></tr></table></div>`;
  return o;}

/* ----- Storia della prova e syllabus ----- */
const LK=(k,t)=>`<a href="${SRC[k]}" target="_blank" rel="noopener">${t}</a>`;
function vInfo(){let o=exHead()+`<h1>📜 Storia e syllabus · ${esc(ename(EX))}</h1><p class="sub">Che cosa è uscito nel 2025/26 e che cosa chiede il programma 2026/27. La fonte vincolante è il <a href="${E.syl}" target="_blank" rel="noopener">syllabus ufficiale MUR</a>.</p>`;
  o+=`<div class="card"><h3>📊 Risultati 2025/26</h3><p style="margin:0">${esc(E.r25)}</p></div>`;
  if(EX==="fis"){o+=`<div class="card"><h3>📝 Che cosa è uscito nel 2025</h3><ul class="breve"><li><b>1° appello (20 novembre):</b> un esercizio semplice per ogni capitolo. Molla (periodo e costante elastica), lavoro come prodotto scalare, quantità di moto e urto anelastico, moto circolare uniforme; legge di Poiseuille, densità e galleggiamento; gas perfetti, rendimento di Carnot, isocora; V = Q/C, legge di Ohm, resistenze in serie e parallelo, carica in un campo magnetico, indice di rifrazione; λ = v/f, periodo e frequenza, che cosa trasporta un'onda sonora; energia del fotone, campi E e B perpendicolari, lente convergente con immagine reale e ingrandita.</li>
   <li><b>2° appello (10 dicembre):</b> livello medio/medio-difficile. Distribuzione: metodi 5, meccanica 3, fluidi 5, onde 5, termodinamica 6, elettricità e magnetismo 5, radiazioni 2. Usciti: conversioni (velocità, accelerazioni, Pa–atm, litri–dm³–cm³) e grandezze adimensionali; Archimede in tre domande (galleggiamento con carico, frazione immersa), sub a 50 m, numero di Reynolds; decibel e significato di 0 dB, potenza dell'onda al raddoppio della frequenza, Doppler in percentuale, suono nel vuoto; gas reali, energia interna n·c_v·ΔT, capacità termica, entropia, lavoro nell'isobara; equipotenziali di una carica, linee di campo nel condensatore, energia di una carica in una d.d.p., linee di B chiuse; lastra a facce parallele, riflessione totale e fibre ottiche.</li>
   <li>Mai usciti finora: momento angolare, modulo di Young, circuiti RC, legge di Gauss, Biot-Savart, onde stazionarie, leggi di Wien e Stefan-Boltzmann, microscopio.</li></ul><p class="src">Fonti: ${LK("esiti","esiti del 1° appello")} · ${LK("promossi","promossi sui due appelli")} · ${LK("tb2","distribuzione del 2° appello")} · ${LK("tbuddy","argomenti del 2° appello")} · ${LK("tb1","argomenti del 1° appello")} · ${LK("prove","testi delle prove 2025")}</p></div>
   <div class="card"><h3>🔄 Il syllabus 2026/27 (testo ufficiale)</h3><ul class="breve"><li><b>Novità:</b> legge di Lambert-Beer; attività, legge del decadimento radioattivo ed emivita; isotopi e trasformazioni nucleari; distinzione tra radiazioni ionizzanti e non ionizzanti. L'unità 7 si chiama «Fisica delle radiazioni». Ogni unità prevede dal 20 al 30% di esercitazioni.</li>
   <li><b>Attenzione:</b> alcune analisi online danno per tolti argomenti che il testo ufficiale invece contiene: quantità di moto, impulso e conservazione; centro di massa e corpo rigido; oscillatore armonico, sovrapposizione e interferenza; calorimetria; trasformazioni reversibili e irreversibili; condensatori in serie e in parallelo; induzione elettromagnetica (Faraday-Neumann-Lenz); tensione superficiale e capillarità. <b>L'app segue il testo ufficiale.</b></li>
   <li><b>Non più nel testo 2026:</b> derivate e integrali; momento d'inerzia e momento angolare; modulo di Young; teorema di Torricelli sull'efflusso; onde stazionarie; gas reali; legge di Gauss; Biot-Savart; dipolo; carica e scarica del condensatore; effetto fotoelettrico; lenti divergenti e microscopio. Gas reali e numero di Reynolds sono però usciti nel 2025: nell'app sono segnalati come approfondimenti.</li>
   <li>Peso delle unità in CFU: metodi 0,2 · meccanica 1,4 · fluidi 1,2 · onde 0,4 · termodinamica 1 · elettricità e magnetismo 1,2 · radiazioni 0,6.</li></ul></div>`;}
  else{o+=`<div class="card"><h3>🔄 Che cosa cambia nel 2026/27</h3><ul class="breve">${E.n26.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><p class="src">Fonte: ${LK("tbsyl","analisi delle differenze 2025–2026")}</p></div>
   <div class="card"><h3>📐 Peso delle unità</h3><table class="t"><tr><th>Unità</th><th>CFU</th><th>Domande stimate su 31</th></tr>${UNITS.map(u=>`<tr><td>${u.ic} ${esc(u.t)}</td><td>${u.cfu.toLocaleString("it-IT")}</td><td>${u.q}</td></tr>`).join("")}</table></div>`;}
  return o;}

/* ----- Regole e UPO (comuni ai tre esami) ----- */
function vRegole(){return `<h1>🎓 Regole e UPO</h1><p class="sub">Regole 2026/27 uguali per Fisica, Chimica e Biologia e organizzazione all'Università del Piemonte Orientale. Informazioni verificate al 10 ottobre 2026: controlla sempre gli avvisi ufficiali.</p>
 <div class="grid"><div class="card"><h3>📅 Date</h3><div class="row"><div class="grow"><b>1° appello</b><small>esiti entro il 23 dicembre</small></div><b>gio 10 dic 2026, ore 11</b></div><div class="row"><div class="grow"><b>2° appello</b><small>esiti entro il 20 gennaio</small></div><b>lun 11 gen 2027, ore 11</b></div><p class="lbl">Nella stessa giornata si fanno Chimica, Fisica e Biologia, con 30 minuti di pausa tra una prova e l'altra. Basta superare ogni prova in uno dei due appelli; se la fai in entrambi conta il voto migliore (almeno 18). Entro il giorno dopo gli esiti del 2° appello si accetta o rifiuta ogni voto: senza risposta vale come accettato.</p></div>
 <div class="card"><h3>📝 Com'è fatta ogni prova (novità 2026)</h3><div class="row"><div class="grow">Domande</div><b>31: 21 multipla + 10 completamento</b></div><div class="row"><div class="grow">Tempo</div><b>50 minuti (nel 2025: 45)</b></div><div class="row"><div class="grow">Punteggio</div><b>+1 · −0,1 · 0 se omessa</b></div><div class="row"><div class="grow">Per superarla</div><b>almeno 18/30 (31 = 30 e lode)</b></div><p class="lbl">Risposta multipla: 5 opzioni, una sola giusta. Completamento: uno spazio da riempire con una sola parola, in stampatello. Nel 2025 erano 15 + 16. Contenuto identico in tutte le sedi.</p></div></div>
 <div class="card"><h3>🧠 Strategia</h3><ul class="breve"><li><b>Nelle domande a risposta multipla conviene rispondere:</b> con 5 opzioni e −0,1 per errore, anche tirando a caso si guadagnano in media +0,12 punti; se escludi una o due opzioni, ancora meglio.</li><li>Circa 1 minuto e 37 secondi per domanda: primo giro sulle facili, poi torna sulle altre.</li><li>Niente calcolatrice: numeri pensati per conti a mente. Controlla le unità (cm² → m², L → m³, °C → K).</li><li>Nel completamento: una sola parola o un solo numero; attenzione a singolare/plurale, simboli e ortografia.</li><li>Per la prima sezione della graduatoria servono tutti e tre gli esami: la priorità è arrivare a 18 in ciascuno.</li></ul></div>
 <div class="card"><h3>🏛️ All'UPO (Novara e Alessandria)</h3><ul class="breve"><li>Lezioni in presenza dal 1° al 30 settembre al Campus Perrone di Novara; <b>dal 1° ottobre solo online</b> su Zoom, dentro la piattaforma DIR, con registrazioni.</li><li>Frequenza obbligatoria: almeno il <b>51%</b> (presenza in aula, diretta Zoom o visione delle registrazioni su DIR).</li><li>Posti stimati per Medicina: Novara 158 + 13 (extra-UE residenti all'estero), Alessandria 150 + 4.</li><li>Chi è in posizione utile ma ha esami mancanti li recupera nella sede assegnata prima del 2° semestre. Nel 2026 l'UPO ha tenuto corsi di recupero online e tre appelli per materia in ogni sede (Fisica: docenti Ruspa, Arcidiacono, Fava, Sitta).</li><li>Corsi affini all'UPO se non si entra: Scienze biologiche, Biotecnologie, CTF, Farmacia, Infermieristica, Educazione professionale.</li><li>Contatto: <b>semestrefiltro@uniupo.it</b>.</li></ul><p class="src">Fonte: ${LK("upo","pagina UPO sull'accesso a Medicina 2026/27")}</p></div>
 <div class="card"><h3>🆓 Piattaforma ufficiale gratuita</h3><p>CRUI, MUR e CISIA hanno aperto ${LK("crui","semestreaperto-medodovet.it")}: MOOC, esercitazioni per unità che seguono le lezioni e, da novembre, <b>simulazioni ufficiali</b> con lo stesso numero di domande, punteggio e tempo. Usala insieme a questa app. Le prove reali del 2025 sono raccolte ${LK("prove","qui")}.</p></div>
 <div class="card"><h3>📚 Syllabus ufficiali 2026/27</h3>${EXORD.map(k=>`<div class="row"><span class="ubadge" style="--uc:var(${EXAMS[k].col})">${EXAMS[k].ic}</span><div class="grow">${esc(EXAMS[k].t)}</div><a class="btn sm" href="${EXAMS[k].syl}" target="_blank" rel="noopener">PDF</a></div>`).join("")}<p class="src">Pagina MUR: ${LK("mur","syllabus del semestre aperto 2026/27")} · ${LK("date","date e formato delle prove")}</p></div>`;}

/* ----- Progressi e copie ----- */
function vProg(){const days=[];for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(iso(d));}
  const per=days.map(d=>EXORD.map(k=>Rt.exams[k].days[d]||0)),mx=Math.max(1,...per.map(a=>a.reduce((x,y)=>x+y,0)));
  let o=`<h1>📈 Progressi e copie</h1><p class="sub">Tutto viene salvato da solo su questo iPad: una copia al giorno resta sul dispositivo per 30 giorni. Con «Salva copia su File / iCloud» in fondo alla pagina puoi conservarli o passarli a un altro iPad.</p>
  <div class="kpi">${EXORD.map(k=>`<div><b>${withExam(k,overall)}%</b><span>${EXAMS[k].ic} ${esc(ename(k))}</span></div>`).join("")}<div><b>${EXORD.reduce((a,k)=>a+Object.values(Rt.exams[k].qs).reduce((x,s)=>x+s.ok+s.ko,0),0)}</b><span>risposte date in totale</span></div></div>
  <div class="card"><h3>Ultimi 14 giorni (esercizi svolti)</h3><div style="display:flex;gap:4px;align-items:flex-end;height:90px">${days.map((d,i)=>{const n=per[i].reduce((x,y)=>x+y,0);return `<div title="${fmtD(d)}: ${n}" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end"><div style="width:100%;height:${n/mx*70}px;min-height:${n?3:0}px;background:var(--accent);border-radius:4px"></div><span class="lbl" style="font-size:10px">${dOf(d).getDate()}</span></div>`;}).join("")}</div></div>`;
  o+=EXORD.map(k=>withExam(k,()=>`<div class="card"><h3>${E.ic} ${esc(E.t)} <button class="lnk" data-go="${k}/arg">Apri ›</button></h3><table class="t"><tr><th>Argomento</th><th>${QB.length?"Giuste":"Autovalutazione"}</th><th>Stato</th></tr>${TOPICS.map(t=>{const s=S.tp[t.id]||{},sc=tScore(t.id);return `<tr><td>${UN[t.u].ic} <a href="#${k}/t/${t.id}" style="color:inherit">${esc(t.t)}</a>${s.st?" ✓":""}</td><td>${hasQ(t.id)?`${s.ok||0}/${(s.ok||0)+(s.ko||0)}`:(s.self?SELF[s.self-1][0]:"—")}</td><td><span class="pill ${stLab(sc)[1]}">${sc}%</span></td></tr>`;}).join("")}</table></div>`)).join("");
  o+=`<div class="card"><h3>Copie e ripristino</h3><p class="lbl">Il salvataggio è automatico (memoria del browser + database del dispositivo). Per passare i dati su un altro iPad o tenerne una copia, usa «Salva copia su File / iCloud» in fondo alla pagina. Sull'altro iPad, qui, tocca «Ripristina da una copia».</p>
  <div class="btns"><label class="btn" style="cursor:pointer">Ripristina da una copia<input type="file" id="fzImp" accept="application/json,.json" hidden></label><button class="btn danger" id="fzReset">Azzera i progressi del semestre filtro</button></div></div>`;
  return o;}


/* ----- Installa su un altro iPad ----- */
function vInstalla(){return `<h1>📲 Installa su un altro iPad</h1><p class="sub">«Semestre filtro» esiste anche come app a sé, da mettere sulla schermata Home di qualsiasi iPad o iPhone. È gratuita, funziona anche senza internet e si aggiorna da sola.</p>
 <div class="grid"><div class="card"><h3>1 · Apri l'indirizzo sull'altro iPad</h3><p style="margin-top:0">Inquadra il codice con la <b>Fotocamera</b> dell'altro iPad e tocca il link che compare, oppure scrivi l'indirizzo in Safari.</p>
  <div class="qrbox">${window.QR_SVG||""}</div><div class="formula" style="white-space:normal;word-break:break-all">${APP_URL}</div>
  <div class="btns"><button class="btn" id="cpUrl">Copia l'indirizzo</button>${navigator.share?'<button class="btn" id="shUrl">Invia (Messaggi, Mail, AirDrop)</button>':""}</div></div>
 <div class="card"><h3>2 · Aggiungi alla schermata Home</h3><ol class="breve"><li>Usa <b>Safari</b> (con altri browser l'app non si installa bene).</li><li>Tocca il pulsante <b>Condividi</b> (il quadrato con la freccia in su), in alto a destra.</li><li>Scegli <b>«Aggiungi alla schermata Home»</b>, lascia il nome «Semestre filtro» e tocca <b>Aggiungi</b>.</li><li>Da quel momento apri l'app dall'icona blu con il battito: si apre a tutto schermo e si aggiorna da sola quando pubblico novità.</li></ol></div>
 <div class="card"><h3>3 · Se vuoi portare i progressi</h3><ol class="breve"><li>Su questo iPad tocca <b>«💾 Salva copia su File / iCloud»</b> in fondo alla pagina e salva su <b>iCloud Drive</b> (oppure inviala con AirDrop).</li><li>Sull'altro iPad, nell'app: <b>📈 Progressi e copie → Ripristina da una copia</b> e scegli il file.</li></ol><p class="lbl">Ogni iPad tiene i suoi dati: non c'è una sincronizzazione automatica, quindi conviene usare l'app soprattutto su un iPad e fare la copia quando si cambia.</p></div>
 <div class="card"><h3>🔒 Privacy</h3><p style="margin:0">L'indirizzo è pubblico ma contiene solo il programma e gli esercizi: test, risposte, simulazioni e progressi restano solo sul dispositivo (e nelle copie che salvi tu).</p></div></div>`;}
/* ================= EVENTI ================= */
function bind(){if(curT){const t=TP[curT];if(t.anim)mountAnim($("animBox"),t.anim,t.animOpt);const b=$("tStudied");if(b)b.onclick=()=>{const s=S.tp[curT]||{};s.st=!s.st;S.tp[curT]=s;save();render();toast(s.st?"Segnato come studiato":"Tolto il segno");};}
  if(view==="ex:sim"&&S.run){tickSim();simTimer=setInterval(tickSim,1000);}
  if(view==="ex:arg"&&!curT&&argU){const e=$("u-"+argU);if(e)setTimeout(()=>e.scrollIntoView({block:"start"}),30);argU=null;}}
document.addEventListener("click",e=>{
  const g=e.target.closest("[data-go]");if(g){if(g.dataset.u)argU=g.dataset.u;if(g.closest("#side")){PR=null;SIMV=null;}go(g.dataset.go);return;}
  const pr=e.target.closest("[data-pr]");if(pr){startPR(pr.dataset.pr);return;}
  const sv=e.target.closest("[data-simv]");if(sv){SIMV=+sv.dataset.simv;render();return;}
  const se=e.target.closest("#selfEv button");if(se&&curT){const s=S.tp[curT]||{};s.self=+se.dataset.v;S.tp[curT]=s;save();se.parentNode.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b===se));toast("Autovalutazione salvata");side();const ts=$("tSub");if(ts)ts.textContent=stLab(tScore(curT))[0]+" · "+tScore(curT)+"%";return;}
  const ps=e.target.closest("#ptSchool button");if(ps){PTA.school=ps.textContent;ps.parentNode.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b===ps));return;}
  const pq=e.target.closest("[data-pt] .opt");if(pq){const i=+pq.closest("[data-pt]").dataset.pt,j=+pq.dataset.o;PTA.a[i]=PTA.a[i]===j?undefined:j;pq.parentNode.querySelectorAll(".opt").forEach((b,k)=>b.classList.toggle("sel",PTA.a[i]===k));return;}
  if(e.target.closest("#ptDone")){const unit={};let sc=0;PT.forEach((q,i)=>{unit[q.u]=unit[q.u]||[0,2];if(PTA.a[i]===q.a){unit[q.u][0]++;sc++;}});const r=sc/PT.length;
    S.pt={date:today(),score:sc,unit,lev:r>=.78?"avanzato":r>=.43?"intermedio":"base"};if(PTA.school)Rt.school=PTA.school;PTA=null;save();render();toast("Test salvato: piano di studio aggiornato");return;}
  if(e.target.closest("#ptRedo")){PTA={a:{},school:Rt.school};render();return;}
  const op=e.target.closest('.q[data-ctx] .opt');if(op){const box=op.closest(".q"),q=QI[box.dataset.q];const ok=answerImmediate(box,q,+op.dataset.o);afterPR(box,ok);return;}
  const ck=e.target.closest('.q[data-ctx] [data-chk]');if(ck){const box=ck.closest(".q"),v=box.querySelector("input").value.trim();if(!v){toast("Scrivi la risposta o tocca «Non so»");return;}const ok=answerImmediate(box,QI[box.dataset.q],v);afterPR(box,ok);return;}
  const sk=e.target.closest('.q[data-ctx] [data-skip]');if(sk){const box=sk.closest(".q");const ok=answerImmediate(box,QI[box.dataset.q],null);afterPR(box,ok);return;}
  if(e.target.closest("#prNext")){PR.i++;render();return;}
  if(e.target.closest("#prStop")){PR.list=PR.list.slice(0,PR.i+($("prBox").querySelector(".q").dataset.done?1:0));PR.i=PR.list.length;render();return;}
  if(e.target.closest("#simStart")){if(S.run){render();return;}if(QB.length<31){toast("Servono almeno 31 domande");return;}SIMV=null;S.run={start:Date.now(),q:buildSim(),a:{}};save();view="ex:sim";history.replaceState(null,"","#"+EX+"/sim");render();return;}
  if(e.target.closest("#simBack")){SIMV=null;render();return;}
  if(e.target.closest("#cpUrl")){try{navigator.clipboard.writeText(APP_URL).then(()=>toast("Indirizzo copiato"),()=>toast(APP_URL));}catch(_){toast(APP_URL);}return;}
  if(e.target.closest("#shUrl")){navigator.share({title:"Semestre filtro",text:"App per preparare gli esami del semestre filtro di Medicina",url:APP_URL}).catch(()=>{});return;}
  if(e.target.closest("#simEnd")||e.target.closest("#simEnd2")){const n=S.run.q.filter((id,i)=>S.run.a[i]==null||S.run.a[i]==="").length;if(!confirm(n?`Ci sono ${n} risposte vuote. Consegnare comunque?`:"Consegnare la prova?"))return;finishSim(false);return;}
  const so=e.target.closest("[data-si] .opt");if(so&&S.run){const i=+so.closest("[data-si]").dataset.si,j=+so.dataset.o;S.run.a[i]=S.run.a[i]===j?null:j;so.parentNode.querySelectorAll(".opt").forEach((b,k)=>b.classList.toggle("sel",S.run.a[i]===k));save();return;}
  if(e.target.closest("#fzReset")){if(confirm("Cancellare test, esercizi, autovalutazioni e simulazioni di tutti e tre gli esami? L’operazione non si può annullare, salvo ripristinare una copia.")){Rt=norm(null);useExam(EX);save();render();toast("Progressi azzerati");}return;}
});
function afterPR(box,ok){if(box.dataset.ctx!=="pr")return;if(ok)PR.ok++;const n=$("prNext");if(n){n.hidden=false;n.focus();}}
let svT2=null;
document.addEventListener("input",e=>{const i=e.target.closest("[data-si] input");if(i&&S.run){S.run.a[+i.closest("[data-si]").dataset.si]=i.value.trim();clearTimeout(svT2);svT2=setTimeout(save,400);}});
document.addEventListener("keydown",e=>{if(e.key==="Enter"){const i=e.target.closest('.q[data-ctx] input');if(i){e.preventDefault();i.closest(".q").querySelector("[data-chk]").click();}}});
document.addEventListener("change",e=>{if(e.target.id!=="fzImp")return;const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const o=JSON.parse(rd.result);let r=null;
  if(o&&o.semestre)r=norm(o.semestre);else if(o&&o.exams)r=norm(o);else if(o&&o.fisica)r=migrate(o.fisica);else if(o&&o.tp&&o.qs)r=migrate(o);if(!r)throw 0;
  if(!confirm("Sostituire i progressi del semestre filtro con quelli della copia?"))return;Rt=r;useExam(EX);save();render();toast("Progressi ripristinati");}catch(_){toast("Nella copia non ci sono dati del semestre filtro");}};rd.readAsText(f);e.target.value="";});
window.addEventListener("hashchange",route);
window.addEventListener("storage",e=>{if(e.key===KEY&&e.newValue){Rt=norm(JSON.parse(e.newValue));useExam(EX);if(!S.run)render();}});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")window.__flush();else if(S.run&&view==="ex:sim")tickSim();});
route();recover();if(!Rt.sum){Rt.sum=summaryAll();try{localStorage.setItem(KEY,JSON.stringify(Rt));}catch(e){}}
