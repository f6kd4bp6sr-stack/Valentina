/* ================= ANIMAZIONI (canvas, interattive) ================= */
const RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
let C={};
function readColors(){const cs=getComputedStyle(document.documentElement);const g=k=>cs.getPropertyValue(k).trim();
  C={ink:g("--ink"),muted:g("--muted"),line:g("--line"),acc:g("--accent"),ok:g("--ok"),warn:g("--warn"),soon:g("--soon"),card:g("--card"),seg:g("--seg"),fam:g("--fam"),ben:g("--ben"),lp:g("--lp"),u5:g("--u5"),dark:matchMedia("(prefers-color-scheme: dark)").matches};}
readColors(); try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{readColors();RUN.forEach(h=>h.draw(0));});}catch(e){}
const F2=(x,d=2)=>(+x).toLocaleString("it-IT",{maximumFractionDigits:d,minimumFractionDigits:0});
function txt(g,s,x,y,col,size=13,al="left",bold=false){g.fillStyle=col||C.ink;g.font=(bold?"700 ":"")+size+"px -apple-system,BlinkMacSystemFont,sans-serif";g.textAlign=al;g.textBaseline="middle";g.fillText(s,x,y);}
function line(g,x1,y1,x2,y2,col,lw=2,dash){g.strokeStyle=col;g.lineWidth=lw;g.setLineDash(dash||[]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);}
function arrow(g,x1,y1,x2,y2,col,lw=3,lab){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);if(L<2)return;line(g,x1,y1,x2,y2,col,lw);const a=Math.atan2(dy,dx),h=Math.min(11,L*.45);g.fillStyle=col;g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-h*Math.cos(a-.42),y2-h*Math.sin(a-.42));g.lineTo(x2-h*Math.cos(a+.42),y2-h*Math.sin(a+.42));g.closePath();g.fill();if(lab)txt(g,lab,x2+8*Math.cos(a)+(Math.abs(Math.cos(a))<.3?10:0),y2+8*Math.sin(a)-(Math.abs(Math.sin(a))<.3?9:0),col,13,"center",true);}
function circ(g,x,y,r,fill,stroke,lw=2){g.beginPath();g.arc(x,y,r,0,7);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke();}}
function rr(g,x,y,w,h,r,fill,stroke){g.beginPath();g.roundRect?g.roundRect(x,y,w,h,r):g.rect(x,y,w,h);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=2;g.stroke();}}
function alpha(col,a){const c=document.createElement("canvas").getContext("2d");c.fillStyle=col;const v=c.fillStyle;if(v[0]==="#"){const n=parseInt(v.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;}return v.replace(/rgba?\(([^)]+)\)/,(m,p)=>{const q=p.split(",");return `rgba(${q[0]},${q[1]},${q[2]},${a})`;});}
const AC={};function A_(col,a){const k=col+a;return AC[k]||(AC[k]=alpha(col,a));}
function axes(g,x,y,w,h,xl,yl){line(g,x,y+h,x+w,y+h,C.muted,1.5);line(g,x,y,x,y+h,C.muted,1.5);txt(g,xl,x+w,y+h+12,C.muted,12,"right");txt(g,yl,x+4,y-8,C.muted,12,"left");}

const AN={
vettori:{h:300,c:[{k:"a",l:"Modulo di a",min:1,max:5,st:.5,v:3},{k:"b",l:"Modulo di b",min:1,max:5,st:.5,v:4},{k:"ang",l:"Angolo tra a e b",min:0,max:180,st:5,v:90,u:"°"}],
 f(g,p,st,dt,W,H){const s=Math.min(W*.6/10,H*.75/6),O={x:W*.36,y:H*.84},th=p.ang*Math.PI/180;
  const A={x:O.x+p.a*s,y:O.y},B={x:O.x+p.b*s*Math.cos(th),y:O.y-p.b*s*Math.sin(th)},R={x:A.x+B.x-O.x,y:A.y+B.y-O.y};
  const off=(st.t*20)%12;g.lineDashOffset=-off;line(g,A.x,A.y,R.x,R.y,C.muted,1.5,[6,6]);line(g,B.x,B.y,R.x,R.y,C.muted,1.5,[6,6]);g.lineDashOffset=0;
  arrow(g,O.x,O.y,A.x,A.y,C.acc,3.5,"a");arrow(g,O.x,O.y,B.x,B.y,C.ben,3.5,"b");arrow(g,O.x,O.y,R.x,R.y,C.warn,4,"a+b");
  const r=Math.sqrt(p.a*p.a+p.b*p.b+2*p.a*p.b*Math.cos(th));
  return `|a + b| = √(a² + b² + 2ab·cos θ) = <b>${F2(r)}</b>. ${p.ang==0?"Vettori concordi: i moduli si sommano.":p.ang==180?"Vettori opposti: i moduli si sottraggono.":p.ang==90?"Perpendicolari: vale Pitagora.":""}`;}},
mrua:{h:330,c:[{k:"v0",l:"Velocità iniziale v₀",min:0,max:10,st:1,v:0,u:" m/s"},{k:"a",l:"Accelerazione a",min:-2,max:3,st:.5,v:2,u:" m/s²"}],
 f(g,p,st,dt,W,H){const T=6,t=st.t%(T+1.5),tt=Math.min(t,T);const x=v=>p.v0*v+.5*p.a*v*v,vv=v=>p.v0+p.a*v;
  const sx=(W-40)/160,x0=20+40*sx,ry=46;line(g,10,ry+16,W-10,ry+16,C.line,3);for(let m=-40;m<=120;m+=20){const X=x0+m*sx;line(g,X,ry+12,X,ry+20,C.muted,1);txt(g,m+" m",X,ry+30,C.muted,10,"center");}
  const cx=Math.max(8,Math.min(W-30,x0+x(tt)*sx));rr(g,cx-16,ry-6,32,16,5,C.acc);circ(g,cx-9,ry+11,4,C.ink);circ(g,cx+9,ry+11,4,C.ink);
  const gw=(W-60)/2,gh=H-ry-90,gy=ry+62;
  const plot=(ox,fn,lo,hi,col,lab,area)=>{axes(g,ox,gy,gw,gh,"t (s)",lab);const Y=v=>gy+gh-(v-lo)/(hi-lo)*gh,X=v=>ox+v/T*gw;
   if(lo<0&&hi>0)line(g,ox,Y(0),ox+gw,Y(0),C.line,1);
   if(area){g.fillStyle=A_(col,.18);g.beginPath();g.moveTo(X(0),Y(0));for(let v=0;v<=tt;v+=.05)g.lineTo(X(v),Y(fn(v)));g.lineTo(X(tt),Y(0));g.fill();}
   g.strokeStyle=A_(col,.3);g.lineWidth=2;g.beginPath();for(let v=0;v<=T;v+=.05)v?g.lineTo(X(v),Y(fn(v))):g.moveTo(X(v),Y(fn(v)));g.stroke();
   g.strokeStyle=col;g.lineWidth=3;g.beginPath();for(let v=0;v<=tt;v+=.05)v?g.lineTo(X(v),Y(fn(v))):g.moveTo(X(v),Y(fn(v)));g.stroke();circ(g,X(tt),Y(fn(tt)),5,col);};
  plot(20,vv,-12,28,C.warn,"v (m/s)",true);plot(40+gw,x,-40,120,C.acc,"x (m)");
  return `t = <b>${F2(tt,1)} s</b> · v = <b>${F2(vv(tt),1)} m/s</b> · x = <b>${F2(x(tt),1)} m</b>. L'area colorata sotto v(t) è lo spostamento; la pendenza di v(t) è a.`;}},
parabolico:{h:320,c:[{k:"v0",l:"Velocità di lancio v₀",min:5,max:30,st:1,v:20,u:" m/s"},{k:"ang",l:"Angolo di lancio",min:10,max:80,st:5,v:45,u:"°"}],
 f(g,p,st,dt,W,H){const gg=9.8,th=p.ang*Math.PI/180,vx=p.v0*Math.cos(th),vy=p.v0*Math.sin(th),T=2*vy/gg,R=vx*T,Hm=vy*vy/(2*gg);
  const s=Math.min((W-50)/92,(H-50)/46),ox=25,oy=H-22;line(g,10,oy,W-10,oy,C.line,3);
  for(let m=0;m<=90;m+=10){const X=ox+m*s;if(X<W-10){line(g,X,oy,X,oy+5,C.muted,1);if(m%20==0)txt(g,m+" m",X,oy+13,C.muted,10,"center");}}
  g.strokeStyle=A_(C.acc,.45);g.lineWidth=2;g.setLineDash([5,5]);g.beginPath();for(let i=0;i<=60;i++){const t=T*i/60,X=ox+vx*t*s,Y=oy-(vy*t-.5*gg*t*t)*s;i?g.lineTo(X,Y):g.moveTo(X,Y);}g.stroke();g.setLineDash([]);
  const t=Math.min(st.t%(T+1),T),X=ox+vx*t*s,Y=oy-(vy*t-.5*gg*t*t)*s,vyt=vy-gg*t;
  circ(g,X,Y,7,C.warn);arrow(g,X,Y,X+vx*2.2,Y,C.acc,2.5,"vₓ");arrow(g,X,Y,X,Y-vyt*2.2,C.ben,2.5,"v_y");
  line(g,ox+R/2*s,oy,ox+R/2*s,oy-Hm*s,C.muted,1,[3,4]);
  return `Gittata <b>${F2(R,1)} m</b> · altezza massima <b>${F2(Hm,1)} m</b> · tempo di volo <b>${F2(T,2)} s</b>. vₓ resta costante, v_y cambia per effetto di g. Prova 30° e 60°: stessa gittata.`;}},
piano:{h:300,c:[{k:"ang",l:"Inclinazione θ",min:0,max:60,st:1,v:30,u:"°"},{k:"mu",l:"Coefficiente d'attrito µ",min:0,max:.8,st:.05,v:.2}],
 f(g,p,st,dt,W,H){const th=p.ang*Math.PI/180,gg=9.8,a=gg*(Math.sin(th)-p.mu*Math.cos(th));
  const A={x:40,y:H-30},Lp=Math.min((W-120)/Math.max(.2,Math.cos(th)),(H-80)/Math.max(.01,Math.sin(th)),W-120),u={x:Math.cos(th),y:-Math.sin(th)},n={x:-Math.sin(th),y:-Math.cos(th)};
  const B={x:A.x+Lp*u.x,y:A.y+Lp*u.y};g.fillStyle=A_(C.muted,.15);g.beginPath();g.moveTo(A.x,A.y);g.lineTo(B.x,B.y);g.lineTo(B.x,A.y);g.closePath();g.fill();line(g,A.x,A.y,B.x,B.y,C.muted,3);line(g,20,A.y,W-20,A.y,C.line,2);
  let d=40;if(a>0.01){const tt=st.t%3.2;d=Math.min(Lp-30,40+.5*a*tt*tt*18);}
  const P={x:B.x-u.x*d,y:B.y-u.y*d},c={x:P.x+n.x*18,y:P.y+n.y*18};
  g.save();g.translate(c.x,c.y);g.rotate(-th);rr(g,-18,-18,36,36,5,C.acc);g.restore();
  const Lv=70;arrow(g,c.x,c.y,c.x,c.y+Lv,C.ink,3,"P");
  const pp=Lv*Math.sin(th),pn=Lv*Math.cos(th);arrow(g,c.x,c.y,c.x-u.x*pp,c.y-u.y*pp,C.warn,2.5,"P∥");arrow(g,c.x,c.y,c.x-n.x*pn,c.y-n.y*pn,C.muted,2,"P⊥");arrow(g,c.x,c.y,c.x+n.x*pn,c.y+n.y*pn,C.ok,3,"N");
  const fa=Math.min(p.mu*Math.cos(th),Math.sin(th))*Lv;if(fa>2)arrow(g,c.x+u.x*16,c.y+u.y*16,c.x+u.x*(16+fa),c.y+u.y*(16+fa),C.soon,3,"Fa");
  return a>0.01?`Il blocco scivola: a = g(sin θ − µ cos θ) = <b>${F2(a,2)} m/s²</b>.`:`Fermo: l'attrito (fino a µ·N = ${F2(p.mu*Math.cos(th)*gg,2)} N/kg) equilibra P∥ = ${F2(Math.sin(th)*gg,2)} N/kg. Con µ = 0 scivolerebbe con a = g·sin θ = ${F2(gg*Math.sin(th),2)} m/s².`;}},
energia:{h:300,c:[{k:"a0",l:"Ampiezza iniziale",min:10,max:80,st:5,v:45,u:"°"},{k:"att",l:"Attrito con l'aria",seg:["No","Sì"],v:0}],ri:1,
 init(st,p){st.th=p.a0*Math.PI/180;st.w=0;st.lost=0;},
 f(g,p,st,dt,W,H){const L=1.5,gg=9.8,m=1,b=p.att?0.25:0;for(let i=0;i<10;i++){const h=dt/10,al=-(gg/L)*Math.sin(st.th)-b*st.w;st.w+=al*h;st.th+=st.w*h;}
  const E0=m*gg*L*(1-Math.cos(p.a0*Math.PI/180)),Ep=m*gg*L*(1-Math.cos(st.th)),Ec=.5*m*(L*st.w)**2;if(p.att&&Ep+Ec<E0*.01){this.init(st,p);}
  const Lpx=Math.min(H*.7,W*.32),px=W*.3,py=24,bx=px+Lpx*Math.sin(st.th),by=py+Lpx*Math.cos(st.th);
  line(g,px-40,py,px+40,py,C.muted,4);line(g,px,py,px,py+Lpx+14,C.line,1,[4,4]);line(g,px,py,bx,by,C.ink,2);circ(g,bx,by,14,C.acc);
  const bw=36,bh=H-80,x0=W*.62,lab=[["Ec",Ec,C.warn],["Ep",Ep,C.ben],["Totale",Ec+Ep,C.acc]];
  lab.forEach((q,i)=>{const X=x0+i*(bw+18),h=bh*q[1]/E0;rr(g,X,24,bw,bh,6,A_(C.muted,.12));rr(g,X,24+bh-h,bw,h,6,q[2]);txt(g,q[0],X+bw/2,H-36,C.ink,12,"center",true);});
  return `Ec = ½mv² = <b>${F2(Ec,2)} J</b> · Ep = mgh = <b>${F2(Ep,2)} J</b> (massa 1 kg, filo 1,5 m). ${p.att?"Con l'attrito l'energia meccanica diminuisce: diventa calore.":"Senza attrito la somma resta costante: l'energia si trasforma, non si perde."}`;}},
leva:{h:280,c:[{k:"g",l:"Tipo di leva",seg:["3° genere (avambraccio)","1° genere (altalena)"],v:0},{k:"F1",l:"Resistenza (peso)",min:10,max:100,st:5,v:50,u:" N"},{k:"b1",l:"Braccio della resistenza",min:.1,max:.5,st:.01,v:.35,u:" m"},{k:"b2",l:"Braccio della potenza",min:.03,max:.5,st:.01,v:.05,u:" m"}],
 f(g,p,st,dt,W,H){const F2v=p.F1*p.b1/p.b2,sc=(W-80)/1.1,y=H*.55,fx=p.g?W/2:50,g3=!p.g,k=a=>Math.min(110,16+a*.25);
  const wob=RM?0:Math.sin(st.t*2)*1.5;g.save();g.translate(fx,y);g.rotate(wob*Math.PI/180);
  if(!g3){rr(g,-0.55*sc,-6,1.1*sc,12,6,C.muted);}else{rr(g,-8,-6,Math.max(p.b1,p.b2)*sc+30,12,6,C.muted);}
  g.restore();g.fillStyle=C.ink;g.beginPath();g.moveTo(fx,y+6);g.lineTo(fx-14,y+30);g.lineTo(fx+14,y+30);g.closePath();g.fill();txt(g,"fulcro",fx,y+42,C.muted,12,"center");
  if(g3){const xr=fx+p.b1*sc,xp=fx+p.b2*sc;arrow(g,xr,y+8,xr,y+8+k(p.F1),C.warn,3,"");txt(g,"R = "+F2(p.F1,0)+" N (peso in mano)",xr,y+20+k(p.F1),C.warn,13,"center",true);
   arrow(g,xp,y-8,xp,y-8-k(F2v),C.ok,4,"");txt(g,"P = "+F2(F2v,0)+" N (bicipite)",xp+8,y-16-k(F2v),C.ok,13,"left",true);}
  else{const xr=fx-p.b1*sc,xp=fx+p.b2*sc;arrow(g,xr,y-8-k(p.F1),xr,y-8,C.warn,3,"");txt(g,"R = "+F2(p.F1,0)+" N",xr,y-18-k(p.F1),C.warn,13,"center",true);
   arrow(g,xp,y-8-k(F2v),xp,y-8,C.ok,4,"");txt(g,"P = "+F2(F2v,0)+" N",xp,y-18-k(F2v),C.ok,13,"center",true);}
  const v=p.b2/p.b1;return `Equilibrio: P·b_P = R·b_R → P = <b>${F2(F2v,0)} N</b>. ${v<1?"Leva svantaggiosa (P > R): serve più forza, ma il carico si sposta di più e più in fretta.":v>1?"Leva vantaggiosa: P < R.":"Leva indifferente."}`;}},
molla:{h:300,c:[{k:"m",l:"Massa appesa",min:.2,max:2,st:.1,v:.5,u:" kg"},{k:"k",l:"Costante elastica k",min:5,max:50,st:1,v:20,u:" N/m"}],ri:1,init(st){st.h=[];st.t=0;},
 f(g,p,st,dt,W,H){const T=2*Math.PI*Math.sqrt(p.m/p.k),x=Math.cos(2*Math.PI*st.t/T),cx=W*.2,top=16,L0=H*.42,A=H*.2,y=top+L0+A*x,bs=24+p.m*14;
  line(g,cx-50,top,cx+50,top,C.muted,4);g.strokeStyle=C.ink;g.lineWidth=2;g.beginPath();g.moveTo(cx,top);const n=14;for(let i=1;i<n;i++){g.lineTo(cx+(i%2?14:-14),top+(y-top)*i/n);}g.lineTo(cx,y);g.stroke();
  rr(g,cx-bs/2,y,bs,bs,6,C.acc);line(g,cx+60,top+L0,W*.36,top+L0,C.line,1,[4,4]);
  st.h.push([st.t,x]);st.h=st.h.filter(q=>st.t-q[0]<6);const gx=W*.4,gw=W*.56,gy=top+L0+bs/2;line(g,gx,gy,gx+gw,gy,C.line,1);
  g.strokeStyle=C.acc;g.lineWidth=2.5;g.beginPath();st.h.forEach((q,i)=>{const X=gx+gw-(st.t-q[0])/6*gw,Y=gy+A*q[1];i?g.lineTo(X,Y):g.moveTo(X,Y);});g.stroke();circ(g,gx+gw,gy+A*x,5,C.warn);txt(g,"posizione nel tempo",gx,top+8,C.muted,12);
  return `T = 2π√(m/k) = <b>${F2(T,2)} s</b> · f = <b>${F2(1/T,2)} Hz</b> · ω = <b>${F2(2*Math.PI/T,2)} rad/s</b>. Il periodo non dipende dall'ampiezza: massa ×4 → periodo ×2.`;}},
stevino:{h:320,c:[{k:"h",l:"Profondità",min:0,max:50,st:1,v:10,u:" m"},{k:"rho",l:"Liquido",seg:["Acqua dolce (1000 kg/m³)","Acqua di mare (1030)"],v:0}],
 f(g,p,st,dt,W,H){const rho=p.rho?1030:1000,ph=rho*9.8*p.h,pt=101300+ph,top=36,bot=H-16,sy=(bot-top)/50;
  g.fillStyle=A_(C.acc,.08);g.fillRect(0,0,W,top);g.fillStyle=A_(C.acc,.25);g.fillRect(0,top,W*.62,bot-top);line(g,0,top,W*.62,top,C.acc,2);
  for(let m=0;m<=50;m+=10){const Y=top+m*sy;line(g,W*.62,Y,W*.62+8,Y,C.muted,1);txt(g,m+" m · "+(1+m/10*(rho/1000))+" atm",W*.62+12,Y,C.muted,11);}
  const dy=top+p.h*sy;circ(g,W*.3,dy-10,9,C.soon);rr(g,W*.3-7,dy-2,14,26,6,C.soon);
  if(!RM){st.b=st.b||[];if(Math.random()<dt*3)st.b.push({x:W*.3+4,y:dy-16});st.b.forEach(b=>{b.y-=dt*40;b.x+=Math.sin(b.y/9)*.4;});st.b=st.b.filter(b=>b.y>top);st.b.forEach(b=>circ(g,b.x,b.y,3,null,C.acc,1.5));}
  const gx=W*.3+30;rr(g,gx,dy-34,120,26,8,C.card,C.line);txt(g,F2(pt/101300,2)+" atm",gx+60,dy-21,C.ink,14,"center",true);
  return `p = p₀ + ρgh = 101 300 + ${F2(ph,0)} Pa = <b>${F2(pt/1000,1)} kPa ≈ ${F2(pt/101300,2)} atm</b>. Ogni 10 m d'acqua ≈ +1 atm.`;}},
archimede:{h:310,c:[{k:"rc",l:"Densità del corpo",min:100,max:2000,st:50,v:600,u:" kg/m³"},{k:"fl",l:"Liquido",seg:["Acqua (1000)","Olio (900)","Glicerina (1260)"],v:0}],ri:1,
 init(st){st.y=null;st.v=0;},
 f(g,p,st,dt,W,H){const rf=[1000,900,1260][p.fl],fr=p.rc/rf,s=70,lvl=H*.38,bot=H-14,cx=W*.4;
  const target=fr>=1?bot-s:lvl-s+fr*s;if(st.y==null)st.y=lvl-s-30;const k=18,c=3.2;st.v+=(k*(target-st.y)-c*st.v)*dt;st.y+=st.v*dt;if(st.y>bot-s){st.y=bot-s;st.v=0;}
  g.fillStyle=A_(p.fl==1?C.soon:C.acc,.22);g.fillRect(W*.1,lvl,W*.6,bot-lvl);line(g,W*.1,lvl,W*.7,lvl,p.fl==1?C.soon:C.acc,2);line(g,W*.1,30,W*.1,bot,C.muted,2);line(g,W*.7,30,W*.7,bot,C.muted,2);line(g,W*.1,bot,W*.7,bot,C.muted,2);
  rr(g,cx-s/2,st.y,s,s,6,A_(C.lp,.85));const imm=Math.max(0,Math.min(s,st.y+s-lvl));
  const P=40*Math.min(2,fr),S=40*imm/s;arrow(g,cx-12,st.y+s/2,cx-12,st.y+s/2+P,C.ink,3,"P");if(S>2)arrow(g,cx+12,st.y+s/2,cx+12,st.y+s/2-S,C.ok,3,"S");
  return fr>=1?`ρ corpo (${p.rc}) > ρ liquido (${rf}): la spinta massima è minore del peso, il corpo <b>affonda</b>.`:`Galleggia con il <b>${F2(fr*100,0)}%</b> del volume immerso (= ρ corpo / ρ liquido = ${p.rc}/${rf}). All'equilibrio spinta = peso.`;}},
continuita:{h:310,c:[{k:"r",l:"Sezione stretta / sezione larga",min:.25,max:1,st:.05,v:.5},{k:"v1",l:"Velocità nel tratto largo",min:.2,max:2,st:.1,v:1.2,u:" m/s"}],ri:1,
 init(st){st.p=Array.from({length:80},()=>({x:Math.random(),y:Math.random()*2-1}));},
 f(g,p,st,dt,W,H){const cy=H*.66,h1=H*.28,h2=h1*p.r,x1=W*.42,x2=W*.58,hh=x=>x<x1?h1:x>x2?h2:h1+(h2-h1)*(x-x1)/(x2-x1),v2=p.v1/p.r;
  g.fillStyle=A_(C.acc,.18);g.beginPath();g.moveTo(10,cy-h1);g.lineTo(x1,cy-h1);g.lineTo(x2,cy-h2);g.lineTo(W-10,cy-h2);g.lineTo(W-10,cy+h2);g.lineTo(x2,cy+h2);g.lineTo(x1,cy+h1);g.lineTo(10,cy+h1);g.closePath();g.fill();g.strokeStyle=C.muted;g.lineWidth=2;g.stroke();
  st.p.forEach(q=>{const X=10+q.x*(W-20),hx=hh(X);q.x+=dt*(p.v1*(h1/hx))*60/(W-20);if(q.x>1){q.x-=1;}circ(g,10+q.x*(W-20),cy+q.y*hh(10+q.x*(W-20))*.85,3,C.acc);});
  const rho=1000,p1=12000,p2=p1-.5*rho*(v2*v2-p.v1*p.v1),k=(cy-h1-30)/p1;
  [[W*.22,p1,"p₁"],[W*.8,Math.max(0,p2),"p₂"]].forEach(([X,pp,l])=>{const top=cy-hh(X),hgt=pp*k;rr(g,X-7,top-hgt,14,hgt,3,A_(C.acc,.55));line(g,X-9,top-(cy-h1-30),X-9,top,C.line,1);txt(g,l+" "+F2(pp/1000,1)+" kPa",X+14,top-hgt+6,C.ink,12,"left",true);});
  return `Continuità: v₂ = v₁·A₁/A₂ = <b>${F2(v2,2)} m/s</b>. Bernoulli: dove la velocità è maggiore la pressione cala di ½ρ(v₂² − v₁²) = <b>${F2((p1-p2)/1000,2)} kPa</b>${p2<0?" (qui la pressione scenderebbe sotto zero: il modello ideale non basta più)":""}.`;}},
poiseuille:{h:300,c:[{k:"r",l:"Raggio del vaso (relativo)",min:.5,max:1.5,st:.05,v:1},{k:"eta",l:"Fluido",seg:["Acqua","Sangue (≈ 4× più viscoso)"],v:1}],ri:1,
 init(st){st.p=Array.from({length:90},()=>({x:Math.random(),y:Math.random()*2-1}));},
 f(g,p,st,dt,W,H){const cy=H*.45,R=H*.24*p.r,eta=p.eta?4:1,vmax=p.r*p.r/eta,Q=Math.pow(p.r,4)/eta;
  g.fillStyle=A_(C.warn,.12);g.fillRect(10,cy-R,W*.62,2*R);line(g,10,cy-R,W*.62+10,cy-R,C.muted,3);line(g,10,cy+R,W*.62+10,cy+R,C.muted,3);
  for(let i=-4;i<=4;i++){const y=i/4.5,v=vmax*(1-y*y);arrow(g,40,cy+y*R,40+v*110,cy+y*R,C.warn,2);}
  g.strokeStyle=C.warn;g.lineWidth=1.5;g.setLineDash([4,4]);g.beginPath();for(let i=-20;i<=20;i++){const y=i/20;const X=40+vmax*(1-y*y)*110;i==-20?g.moveTo(X,cy+y*R):g.lineTo(X,cy+y*R);}g.stroke();g.setLineDash([]);
  st.p.forEach(q=>{q.x+=dt*vmax*(1-q.y*q.y)*.35;if(q.x>1)q.x-=1;const X=180+q.x*(W*.62-180);if(X<W*.62)circ(g,X,cy+q.y*R*.95,2.6,C.warn);});
  const bx=W*.72,bw=W*.22,bh=H-60,ref=1;rr(g,bx,20,bw,bh,8,A_(C.muted,.12));const qh=Math.min(bh,bh*Q/5.1);rr(g,bx,20+bh-qh,bw,qh,8,C.acc);txt(g,"Portata Q",bx+bw/2,H-26,C.ink,12,"center",true);txt(g,"×"+F2(Q,2),bx+bw/2,20+bh-qh-12,C.acc,14,"center",true);
  return `Q = πr⁴Δp/(8ηl): rispetto al vaso di riferimento (raggio 1, acqua) la portata è <b>×${F2(Q,3)}</b>. Profilo parabolico: massima al centro, nulla sulle pareti. Raggio a metà → portata ÷16.`;}},
onda:{h:280,c:[{k:"lam",l:"Lunghezza d'onda λ",min:.5,max:3,st:.1,v:1.5,u:" m"},{k:"f",l:"Frequenza f",min:.2,max:2,st:.1,v:.5,u:" Hz"},{k:"tipo",l:"Tipo",seg:["Trasversale","Longitudinale"],v:0}],
 f(g,p,st,dt,W,H){const X0=20,Wx=W-40,m=6,cy=H*.5,A=H*.25,ph=x=>2*Math.PI*(x/p.lam-p.f*st.t);
  if(!p.tipo){g.strokeStyle=C.acc;g.lineWidth=3;g.beginPath();for(let i=0;i<=300;i++){const x=i/300*m;const Y=cy-A*Math.sin(ph(x));i?g.lineTo(X0+x/m*Wx,Y):g.moveTo(X0+x/m*Wx,Y);}g.stroke();
   for(let x=0;x<=m;x+=.25)circ(g,X0+x/m*Wx,cy-A*Math.sin(ph(x)),3,C.acc);const xp=1.5;circ(g,X0+xp/m*Wx,cy-A*Math.sin(ph(xp)),8,C.warn);line(g,X0+xp/m*Wx,cy-A-8,X0+xp/m*Wx,cy+A+8,C.warn,1,[3,4]);
   let xc=(0.25+p.f*st.t)*p.lam;xc=((xc%p.lam)+p.lam)%p.lam;if(xc+p.lam<=m){const a=X0+xc/m*Wx,b=X0+(xc+p.lam)/m*Wx;line(g,a,cy-A-18,b,cy-A-18,C.ink,1.5);line(g,a,cy-A-24,a,cy-A-12,C.ink,1.5);line(g,b,cy-A-24,b,cy-A-12,C.ink,1.5);txt(g,"λ",(a+b)/2,cy-A-30,C.ink,14,"center",true);}}
  else{for(let x=0;x<=m;x+=.06){const d=.12*Math.sin(ph(x));const X=X0+(x+d)/m*Wx;line(g,X,cy-A,X,cy+A,x>1.45&&x<1.55?C.warn:A_(C.acc,.75),x>1.45&&x<1.55?3:1.5);}}
  line(g,X0,cy+A+30,X0+Wx,cy+A+30,C.muted,1);for(let i=0;i<=m;i++)txt(g,i+" m",X0+i/m*Wx,cy+A+42,C.muted,10,"center");
  return `v = λ·f = <b>${F2(p.lam*p.f,2)} m/s</b> · periodo T = 1/f = <b>${F2(1/p.f,2)} s</b>. Il punto rosso oscilla sul posto: l'onda trasporta energia, non materia.`;}},
decibel:{h:300,c:[{k:"e",l:"Intensità I = 10^x W/m²: x =",min:-12,max:0,st:.5,v:-6}],
 f(g,p,st,dt,W,H){const L=10*(p.e+12),top=20,bot=H-20,sx=W*.55,yb=v=>bot-(v/130)*(bot-top);
  rr(g,sx,top,28,bot-top,8,A_(C.muted,.15));const col=L>=110?C.warn:L>=80?C.soon:C.ok;rr(g,sx,yb(L),28,bot-yb(L),8,col);
  [[0,"0 dB soglia di udibilità"],[20,"20 fruscio di foglie"],[40,"40 biblioteca"],[60,"60 conversazione"],[80,"80 traffico intenso"],[100,"100 martello pneumatico"],[120,"120 soglia del dolore"]].forEach(([v,s])=>{line(g,sx+30,yb(v),sx+38,yb(v),C.muted,1);txt(g,s,sx+44,yb(v),C.muted,11);});
  const amp=Math.sqrt(Math.pow(10,p.e)/1)*1;const cx=W*.22,cy=H*.5;rr(g,cx-30,cy-18,22,36,4,C.ink);g.fillStyle=C.ink;g.beginPath();g.moveTo(cx-8,cy-18);g.lineTo(cx+12,cy-36);g.lineTo(cx+12,cy+36);g.lineTo(cx-8,cy+18);g.fill();
  const n=3,ph=(st.t*1.2)%1;for(let i=0;i<n;i++){const r=24+((i+ph)/n)*90;g.strokeStyle=A_(col,Math.max(.08,Math.min(1,.15+L/130))*(1-(i+ph)/n));g.lineWidth=2+L/30;g.beginPath();g.arc(cx+12,cy,r,-.7,.7);g.stroke();}
  return `β = 10·log₁₀(I/I₀) = <b>${F2(L,0)} dB</b> con I = 10^${F2(p.e,1)} W/m². Ogni +10 dB l'intensità si moltiplica per 10; +3 dB ≈ intensità doppia.`;}},
doppler:{h:300,c:[{k:"b",l:"Velocità della sorgente (frazione di v suono)",min:0,max:.9,st:.05,v:.4}],ri:1,
 init(st){st.fr=[];st.last=-9;st.x=null;},
 f(g,p,st,dt,W,H){const c=110,f0=1.4,cy=H*.48;if(st.x==null)st.x=W*.2;st.x+=p.b*c*dt;if(st.x>W*.8){st.x=W*.2;st.fr=[];}
  if(st.t-st.last>1/f0){st.fr.push({x:st.x,t:st.t});st.last=st.t;}st.fr=st.fr.filter(q=>(st.t-q.t)*c<W);
  st.fr.forEach(q=>circ(g,q.x,cy,(st.t-q.t)*c,null,A_(C.acc,.7),2));circ(g,st.x,cy,9,C.warn);arrow(g,st.x,cy,st.x+20+p.b*60,cy,C.warn,2.5,"");
  const fa=f0/(1-p.b),fb=f0/(1+p.b);txt(g,"👂 davanti",W-60,cy-40,C.ink,13,"center",true);txt(g,"👂 dietro",50,cy-40,C.ink,13,"center",true);
  return `Davanti alla sorgente le creste si addensano: frequenza percepita <b>×${F2(1/(1-p.b),2)}</b> (più acuta). Dietro si diradano: <b>×${F2(1/(1+p.b),2)}</b> (più grave). La sorgente emette sempre la stessa frequenza.`;}},
riscaldamento:{h:300,c:[],ri:1,init(st){st.q=0;},
 f(g,p,st,dt,W,H){const seg=[[42,-20,0,"ghiaccio"],[334,0,0,"fusione"],[418.6,0,100,"acqua"],[2260,100,100,"ebollizione"],[40.2,100,120,"vapore"]],tot=seg.reduce((a,s)=>a+s[0],0);
  st.q+=dt*tot/9;if(st.q>tot+tot*.08)st.q=0;const q=Math.min(st.q,tot);const ox=46,oy=H-30,w=W-70,h=H-60,X=v=>ox+v/tot*w,Y=T=>oy-(T+30)/160*h;
  axes(g,ox,oy-h,w,h,"calore fornito (kJ)","T (°C)");[0,100].forEach(T=>{line(g,ox,Y(T),ox+w,Y(T),C.line,1,[3,4]);txt(g,T+"°",ox-6,Y(T),C.muted,11,"right");});
  let a=0,T=-20,ph="";g.strokeStyle=A_(C.u5,.3);g.lineWidth=2;g.beginPath();g.moveTo(X(0),Y(-20));seg.forEach(s=>{a+=s[0];g.lineTo(X(a),Y(s[2]));});g.stroke();
  a=0;g.strokeStyle=C.u5;g.lineWidth=3.5;g.beginPath();g.moveTo(X(0),Y(-20));for(const s of seg){if(q<=a+s[0]){T=s[1]+(s[2]-s[1])*(q-a)/s[0];ph=s[3];g.lineTo(X(q),Y(T));break;}a+=s[0];g.lineTo(X(a),Y(s[2]));}g.stroke();circ(g,X(q),Y(T),6,C.u5);
  txt(g,"fusione",X(42+167),Y(0)-12,C.muted,11,"center");txt(g,"ebollizione",X(794.6+1130),Y(100)-12,C.muted,11,"center");
  return `1 kg di ghiaccio da −20 °C a 120 °C. Ora: <b>${ph}</b>, T = <b>${F2(T,0)} °C</b>, calore fornito <b>${F2(q,0)} kJ</b>. Nei tratti piatti la temperatura non cambia: il calore (latente) serve al cambiamento di stato.`;}},
gas:{h:310,c:[{k:"T",l:"Temperatura",min:100,max:600,st:10,v:300,u:" K"},{k:"V",l:"Volume (relativo)",min:.3,max:1,st:.05,v:1}],ri:0,
 init(st){st.p=Array.from({length:46},()=>({x:Math.random(),y:Math.random(),a:Math.random()*6.28}));},
 f(g,p,st,dt,W,H){if(!st.p)this.init(st);const bx=16,by=20,bw0=W*.5,bh=H-40,bw=bw0*p.V,sp=Math.sqrt(p.T/300)*.32;
  rr(g,bx,by,bw0,bh,6,null,C.line);g.fillStyle=A_(C.u5,Math.min(.25,p.T/2400));g.fillRect(bx,by,bw,bh);line(g,bx,by,bx,by+bh,C.muted,3);line(g,bx,by,bx+bw,by,C.muted,3);line(g,bx,by+bh,bx+bw,by+bh,C.muted,3);rr(g,bx+bw-2,by-6,10,bh+12,3,C.ink);rr(g,bx+bw+8,by+bh/2-5,bw0-bw+20,10,3,C.muted);
  st.p.forEach(q=>{q.x+=Math.cos(q.a)*sp*dt/p.V;q.y+=Math.sin(q.a)*sp*dt*(bw0/bh);if(q.x<0){q.x=-q.x;q.a=Math.PI-q.a;}if(q.x>1){q.x=2-q.x;q.a=Math.PI-q.a;}if(q.y<0){q.y=-q.y;q.a=-q.a;}if(q.y>1){q.y=2-q.y;q.a=-q.a;}circ(g,bx+6+q.x*(bw-14),by+6+q.y*(bh-12),4,C.u5);});
  const P=(p.T/300)/p.V,gx=W*.62,gy=26,gw=W*.34,gh=H-70,Xv=v=>gx+(v-.2)/.9*gw,Yp=pp=>gy+gh-pp/7*gh;axes(g,gx,gy,gw,gh,"V","p (atm)");
  [p.T].forEach(T=>{g.strokeStyle=A_(C.u5,.5);g.lineWidth=2;g.beginPath();for(let v=.22;v<=1.1;v+=.02){const pp=(T/300)/v;const Y=Math.max(gy,Yp(pp));v<.23?g.moveTo(Xv(v),Y):g.lineTo(Xv(v),Y);}g.stroke();});circ(g,Xv(p.V),Yp(P),6,C.warn);
  return `pV = nRT → p = <b>${F2(P,2)} atm</b> (1 atm a 300 K e volume 1). Più temperatura = molecole più veloci = urti più forti sulle pareti. La curva è l'isoterma alla temperatura scelta.`;}},
pv:{h:310,c:[{k:"tr",l:"Trasformazione",seg:["Isobara","Isocora","Isoterma","Adiabatica"],v:0},{k:"dir",l:"Verso",seg:["Espansione / riscaldamento","Compressione / raffreddamento"],v:0}],
 f(g,p,st,dt,W,H){const ox=50,oy=H-34,w=W*.58,h=H-60,X=v=>ox+(v-.5)/3*w,Y=pp=>oy-pp/3.4*h;axes(g,ox,oy-h,w,h,"V","p");
  [1.5,3].forEach(k=>{g.strokeStyle=A_(C.muted,.35);g.lineWidth=1;g.beginPath();for(let v=.5;v<=3.5;v+=.05){const Y_=Y(k/v);v==.5?g.moveTo(X(v),Math.max(oy-h,Y_)):g.lineTo(X(v),Math.max(oy-h,Y_));}g.stroke();});
  const path=[s=>[1+2*s,2],s=>[2,1+2*s],s=>[1+2*s,3/(1+2*s)],s=>[1+2*s,3*Math.pow(1+2*s,-5/3)]][p.tr];
  let s=Math.min(1,(st.t%4)/3);if(p.dir)s=1-s;const s0=p.dir?1:0;
  if(p.tr!=1){g.fillStyle=A_(p.dir?C.warn:C.ok,.22);g.beginPath();const a=Math.min(s0,s),b=Math.max(s0,s);g.moveTo(X(path(a)[0]),oy);for(let i=0;i<=40;i++){const q=path(a+(b-a)*i/40);g.lineTo(X(q[0]),Y(q[1]));}g.lineTo(X(path(b)[0]),oy);g.fill();}
  g.strokeStyle=C.acc;g.lineWidth=3;g.beginPath();for(let i=0;i<=40;i++){const q=path(i/40);i?g.lineTo(X(q[0]),Y(q[1])):g.moveTo(X(q[0]),Y(q[1]));}g.stroke();
  const q=path(s),q0=path(s0);circ(g,X(q0[0]),Y(q0[1]),5,C.muted);circ(g,X(q[0]),Y(q[1]),7,C.warn);
  const sg=[["L > 0","ΔU > 0","Q > 0"],["L = 0","ΔU > 0","Q = ΔU > 0"],["L > 0","ΔU = 0","Q = L > 0"],["L > 0","ΔU < 0","Q = 0"]][p.tr].map(x=>p.dir?x.replace(/>/g,"<").replace("Q = 0","Q = 0"):x);
  const tx=W*.66;["Primo principio: ΔU = Q − L",...sg].forEach((s_,i)=>txt(g,s_,tx,40+i*28,i?C.ink:C.muted,i?16:12,"left",!!i));
  const nm=["isobara (p costante)","isocora (V costante)","isoterma (T costante)","adiabatica (Q = 0)"][p.tr];
  return `${nm[0].toUpperCase()+nm.slice(1)}. ${p.tr==1?"Il volume non cambia: nessun lavoro, tutto il calore va in energia interna.":"L'area colorata sotto la curva è il lavoro: "+(p.dir?"in compressione è negativo (lavoro fatto SUL gas).":"in espansione è positivo (lavoro fatto DAL gas).")} ${p.tr==3?(p.dir?"Comprimendo senza scambiare calore il gas si scalda.":"Espandendosi senza ricevere calore il gas si raffredda."):""}`;}},
campo:{h:330,c:[{k:"m",l:"Configurazione",seg:["Carica +","Carica −","Due cariche + e −","Condensatore piano"],v:0}],ri:1,init(st){st.tc=0;},
 f(g,p,st,dt,W,H){const cx=W/2,cy=H/2;
  if(p.m==3){const xa=W*.25,xb=W*.75;for(let i=-4;i<=4;i++){arrow(g,xa+10,cy+i*28,xb-10,cy+i*28,A_(C.acc,.8),1.8);}
   [W*.375,W*.5,W*.625].forEach(x=>line(g,x,cy-130,x,cy+130,C.ok,1.5,[5,5]));rr(g,xa-8,cy-140,10,280,3,C.warn);rr(g,xb-2,cy-140,10,280,3,C.acc);txt(g,"+",xa-3,cy-150,C.warn,18,"center",true);txt(g,"−",xb+3,cy-150,C.acc,18,"center",true);
   const s=(st.t%3)/3,x=xa+12+(xb-xa-24)*s*s;circ(g,x,cy+14,7,C.soon);txt(g,"+",x,cy+14,"#fff",11,"center",true);
   return `Tra le armature il campo è <b>uniforme</b>: E = ΔV/d, stesse linee parallele ed equidistanti. Le equipotenziali (tratteggio verde) sono piani paralleli alle armature. Una carica + accelera verso l'armatura −: guadagna energia q·ΔV.`;}
  const Q=p.m==2?[{x:cx-W*.16,y:cy,q:1},{x:cx+W*.16,y:cy,q:-1}]:[{x:cx,y:cy,q:p.m?-1:1}];
  const V=(x,y)=>Q.reduce((a,c)=>a+100*c.q/Math.max(6,Math.hypot(x-c.x,y-c.y)),0);
  const lv=[.6,.9,1.4,2.3,-.6,-.9,-1.4,-2.3],gs=6;g.fillStyle=A_(C.ok,.9);
  for(let x=0;x<W;x+=gs)for(let y=0;y<H;y+=gs){const v=V(x,y),vr=V(x+gs,y),vd=V(x,y+gs);for(const L of lv){if((v-L)*(vr-L)<0||(v-L)*(vd-L)<0){g.fillRect(x,y,1.6,1.6);break;}}}
  const src=Q.filter(c=>c.q>0).length?Q.filter(c=>c.q>0):Q,sg=src[0].q>0?1:-1;
  for(const s of src)for(let k=0;k<16;k++){let x=s.x+10*Math.cos(k*Math.PI/8),y=s.y+10*Math.sin(k*Math.PI/8);g.strokeStyle=A_(C.acc,.75);g.lineWidth=1.6;g.beginPath();g.moveTo(x,y);let ok=true,mid=null;
    for(let i=0;i<400&&ok;i++){let ex=0,ey=0;for(const c of Q){const dx=x-c.x,dy=y-c.y,r=Math.hypot(dx,dy);ex+=c.q*dx/r**3;ey+=c.q*dy/r**3;}const e=Math.hypot(ex,ey);x+=sg*4*ex/e;y+=sg*4*ey/e;g.lineTo(x,y);if(i==22)mid={x,y,ex:sg*ex/e,ey:sg*ey/e};if(x<0||y<0||x>W||y>H)ok=false;for(const c of Q)if(c!==s&&Math.hypot(x-c.x,y-c.y)<10)ok=false;}
    g.stroke();if(mid){const a=Math.atan2(mid.ey,mid.ex);g.fillStyle=C.acc;g.beginPath();g.moveTo(mid.x+6*Math.cos(a),mid.y+6*Math.sin(a));g.lineTo(mid.x-5*Math.cos(a-.6),mid.y-5*Math.sin(a-.6));g.lineTo(mid.x-5*Math.cos(a+.6),mid.y-5*Math.sin(a+.6));g.fill();}}
  Q.forEach(c=>{circ(g,c.x,c.y,13,c.q>0?C.warn:C.acc);txt(g,c.q>0?"+":"−",c.x,c.y+1,"#fff",18,"center",true);});
  return p.m==2?`Le linee escono dalla carica + ed entrano nella −; non si incrociano mai. I puntini verdi sono le linee equipotenziali, sempre perpendicolari alle linee di campo.`:`Carica ${p.m?"negativa: linee radiali <b>entranti</b>":"positiva: linee radiali <b>uscenti</b>"}. Le equipotenziali (verde) sono circonferenze concentriche (sfere nello spazio): spostarsi lungo una di esse non richiede lavoro.`;}},
circuito:{h:300,c:[{k:"tipo",l:"Collegamento",seg:["Serie","Parallelo"],v:0},{k:"V",l:"Tensione della pila",min:1,max:24,st:1,v:12,u:" V"},{k:"R1",l:"R₁",min:1,max:20,st:1,v:6,u:" Ω"},{k:"R2",l:"R₂",min:1,max:20,st:1,v:6,u:" Ω"}],
 f(g,p,st,dt,W,H){const L=60,T=40,R=W-60,B=H-40,xa=W*.58;st.o=st.o||[0,0,0];
  const ser=!p.tipo,Req=ser?p.R1+p.R2:1/(1/p.R1+1/p.R2),I=p.V/Req,I1=ser?I:p.V/p.R1,I2=ser?I:p.V/p.R2;
  const paths=ser?[[[L,B],[L,T],[R,T],[R,B],[L,B]]]:[[[xa,B],[L,B],[L,T],[xa,T]],[[xa,T],[xa,B]],[[xa,T],[R,T],[R,B],[xa,B]]],cur=ser?[I]:[I,I1,I2];
  const len=pt=>pt.slice(1).reduce((a,q,i)=>a+Math.hypot(q[0]-pt[i][0],q[1]-pt[i][1]),0),at=(pt,s)=>{for(let i=1;i<pt.length;i++){const d=Math.hypot(pt[i][0]-pt[i-1][0],pt[i][1]-pt[i-1][1]);if(s<=d)return[pt[i-1][0]+(pt[i][0]-pt[i-1][0])*s/d,pt[i-1][1]+(pt[i][1]-pt[i-1][1])*s/d];s-=d;}return pt[pt.length-1];};
  paths.forEach(pt=>{g.strokeStyle=C.muted;g.lineWidth=3;g.beginPath();pt.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke();});
  const res=(x,y,vert,lab)=>{g.fillStyle=C.card;vert?g.fillRect(x-10,y-26,20,52):g.fillRect(x-26,y-10,52,20);g.strokeStyle=C.soon;g.lineWidth=3;g.beginPath();for(let i=0;i<=8;i++){const o=(i%2?1:-1)*8*(i&&i<8?1:0);vert?g.lineTo(x+o,y-24+i*6):g.lineTo(x-24+i*6,y+o);}g.stroke();txt(g,lab,vert?x+16:x,vert?y:y-20,C.ink,13,vert?"left":"center",true);};
  if(ser){res((L+R)/2,T,false,"R₁");res(R,(T+B)/2,true,"R₂");}else{res(xa,(T+B)/2,true,"R₁");res(R,(T+B)/2,true,"R₂");}
  g.fillStyle=C.card;g.fillRect(L-16,(T+B)/2-14,32,28);line(g,L-14,(T+B)/2-8,L+14,(T+B)/2-8,C.ink,3);line(g,L-8,(T+B)/2+6,L+8,(T+B)/2+6,C.ink,3);txt(g,"+",L-22,(T+B)/2-8,C.warn,14,"center",true);
  paths.forEach((pt,i)=>{const ln=len(pt);st.o[i]=(st.o[i]+dt*cur[i]*14)%22;for(let s=st.o[i];s<ln;s+=22){const q=at(pt,s);circ(g,q[0],q[1],3.5,C.acc);}});
  return `R_eq = <b>${F2(Req,2)} Ω</b> · I totale = V/R_eq = <b>${F2(I,2)} A</b>${ser?` (uguale in R₁ e R₂) · V₁ = ${F2(I*p.R1,1)} V, V₂ = ${F2(I*p.R2,1)} V`:` · I₁ = ${F2(I1,2)} A, I₂ = ${F2(I2,2)} A (stessa tensione ${p.V} V)`} · potenza P = V·I = <b>${F2(p.V*I,1)} W</b>.`;}},
lorentz:{h:310,c:[{k:"v",l:"Velocità della particella",min:1,max:5,st:.5,v:3},{k:"B",l:"Campo magnetico B",min:.5,max:3,st:.25,v:1.5},{k:"q",l:"Carica",seg:["Positiva","Negativa"],v:0}],ri:1,init(st){st.a=0;},
 f(g,p,st,dt,W,H){for(let x=24;x<W;x+=40)for(let y=20;y<H;y+=40){line(g,x-4,y-4,x+4,y+4,A_(C.muted,.5),1.5);line(g,x+4,y-4,x-4,y+4,A_(C.muted,.5),1.5);}
  const r=Math.min(H*.44,W*.45)*Math.min(1,(p.v/p.B)/4),cx=W/2,cy=H/2,sg=p.q?1:-1,w=(p.v*30)/Math.max(r,4);st.a+=sg*w*dt;
  circ(g,cx,cy,r,null,A_(C.acc,.5),2);const x=cx+r*Math.cos(st.a),y=cy+r*Math.sin(st.a),tx=-Math.sin(st.a)*sg,ty=Math.cos(st.a)*sg;
  arrow(g,x,y,x+tx*42,y+ty*42,C.acc,3,"v");arrow(g,x,y,x-Math.cos(st.a)*36,y-Math.sin(st.a)*36,C.warn,3,"F");circ(g,x,y,9,p.q?C.warn:C.acc);txt(g,p.q?"+":"−",x,y+1,"#fff",13,"center",true);
  txt(g,"B entrante nel foglio (×)",12,H-12,C.muted,12);
  return `F = qvB è sempre perpendicolare a v: la particella gira in cerchio con r = mv/(qB) (qui ∝ v/B = <b>${F2(p.v/p.B,2)}</b>). La forza non compie lavoro: il modulo della velocità non cambia. Cambiando il segno della carica si inverte il verso di rotazione.`;}},
snell:{h:320,c:[{k:"n1",l:"n₁ (sopra)",min:1,max:2,st:.05,v:1},{k:"n2",l:"n₂ (sotto)",min:1,max:2,st:.05,v:1.5},{k:"a",l:"Angolo d'incidenza θ₁",min:0,max:89,st:1,v:40,u:"°"}],
 f(g,p,st,dt,W,H){const cx=W/2,cy=H/2,L=Math.min(W*.42,H*.46),t1=p.a*Math.PI/180,s2=p.n1*Math.sin(t1)/p.n2,tot=s2>1;
  g.fillStyle=A_(C.acc,(p.n1-1)*.35);g.fillRect(0,0,W,cy);g.fillStyle=A_(C.acc,(p.n2-1)*.35);g.fillRect(0,cy,W,H-cy);line(g,0,cy,W,cy,C.muted,2);line(g,cx,10,cx,H-10,C.muted,1,[5,5]);
  txt(g,"n₁ = "+F2(p.n1),12,18,C.ink,13,"left",true);txt(g,"n₂ = "+F2(p.n2),12,H-16,C.ink,13,"left",true);
  const ix=cx-L*Math.sin(t1),iy=cy-L*Math.cos(t1),off=-(st.t*40)%16;g.lineDashOffset=off;
  const ray=(x1,y1,x2,y2,col,a,lw)=>{g.strokeStyle=A_(col,a);g.lineWidth=lw;g.setLineDash([10,6]);g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.setLineDash([]);};
  ray(ix,iy,cx,cy,C.warn,1,4);ray(cx,cy,cx+L*Math.sin(t1),cy-L*Math.cos(t1),C.warn,tot?1:.35,tot?4:2.5);
  if(!tot){const t2=Math.asin(s2);ray(cx,cy,cx+L*Math.sin(t2),cy+L*Math.cos(t2),C.warn,1,4);}g.lineDashOffset=0;
  const lim=p.n1>p.n2?Math.asin(p.n2/p.n1)*180/Math.PI:null;if(tot)txt(g,"RIFLESSIONE TOTALE",cx+20,cy+30,C.warn,15,"left",true);
  return tot?`θ₁ = ${p.a}° supera l'angolo limite (${F2(lim,1)}°): la luce non esce, si riflette tutta. È il principio delle <b>fibre ottiche</b> e dell'endoscopio.`:`n₁ sin θ₁ = n₂ sin θ₂ → θ₂ = <b>${F2(Math.asin(s2)*180/Math.PI,1)}°</b>. ${p.n2>p.n1?"Il raggio entra in un mezzo più rifrangente e si avvicina alla normale.":p.n2<p.n1?"Si allontana dalla normale; angolo limite = "+F2(lim,1)+"°.":"Stesso indice: nessuna deviazione."} In un mezzo con n la luce va a c/n = ${F2(3/p.n2,2)}·10⁸ m/s.`;}},
lente:{h:320,c:[{k:"p",l:"Distanza dell'oggetto (in unità di f)",min:.3,max:4,st:.05,v:2.5}],
 f(g,p,st,dt,W,H){const cx=W/2,cy=H*.55,F=W/10,f=1,pp=p.p,q=Math.abs(pp-f)<.02?null:pp*f/(pp-f),m=q==null?null:-q/pp,ho=55;
  line(g,10,cy,W-10,cy,C.muted,1.5);g.strokeStyle=C.acc;g.lineWidth=3;g.beginPath();g.ellipse(cx,cy,9,H*.42,0,0,7);g.stroke();
  [-2,-1,1,2].forEach(k=>{circ(g,cx+k*F,cy,3.5,C.ink);txt(g,(Math.abs(k)==2?"2F":"F"),cx+k*F,cy+14,C.muted,11,"center");});
  const ox=cx-pp*F;arrow(g,ox,cy,ox,cy-ho,C.ok,4,"");txt(g,"oggetto",ox,cy+28,C.ok,12,"center",true);
  const pulse=RM?1:.6+.4*Math.sin(st.t*3);g.globalAlpha=pulse;
  line(g,ox,cy-ho,cx,cy-ho,C.warn,2);line(g,cx,cy-ho,W,cy-ho+ho*(W-cx)/F,C.warn,2);line(g,ox,cy-ho,W,cy-ho+(W-ox)*ho/(cx-ox),C.soon,2);g.globalAlpha=1;
  if(q!=null){const ix=cx+q*F,iy=cy-m*ho;if(q<0){line(g,cx,cy-ho,ix,iy,C.warn,1.5,[5,5]);line(g,ox,cy-ho,ix,iy,C.soon,1.5,[5,5]);}
   arrow(g,ix,cy,ix,iy,C.fam,4,"");txt(g,q<0?"immagine virtuale":"immagine reale",ix,m<0?cy-12:cy+28,C.fam,12,"center",true);}
  return q==null?`Oggetto nel fuoco: i raggi escono paralleli, <b>nessuna immagine</b> (si forma all'infinito).`:`1/p + 1/q = 1/f → q = <b>${F2(q,2)} f</b>, ingrandimento m = −q/p = <b>${F2(m,2)}</b>: immagine ${q>0?"reale, capovolta":"virtuale, diritta"}, ${Math.abs(m)>1?"ingrandita":"rimpicciolita"}. ${pp>2?"Oggetto oltre 2F.":pp>1?"Oggetto tra F e 2F.":"Oggetto dentro F: lente d'ingrandimento."}`;}},
lambert:{h:310,c:[{k:"c",l:"Concentrazione (relativa)",min:0,max:2,st:.1,v:1},{k:"l",l:"Spessore attraversato",min:.2,max:2,st:.1,v:1,u:" cm"}],ri:1,
 init(st){st.ph=[];},
 f(g,p,st,dt,W,H){const A=.5*p.c*p.l,T=Math.pow(10,-A),y=H*.32,x0=60,xc=W*.3,wc=W*.32*p.l/2,xe=xc+wc;
  rr(g,20,y-22,36,44,8,C.soon);const grd=g.createLinearGradient(x0,0,W-80,0);grd.addColorStop(0,A_(C.soon,.9));grd.addColorStop(Math.min(1,(xc-x0)/(W-140)),A_(C.soon,.9));grd.addColorStop(Math.min(1,(xe-x0)/(W-140)),A_(C.soon,.9*T+.05));grd.addColorStop(1,A_(C.soon,.9*T+.05));g.fillStyle=grd;g.fillRect(x0,y-10,W-140,20);
  rr(g,xc,y-40,wc,80,6,A_(C.fam,Math.min(.75,.12+p.c*.3)),C.muted);rr(g,W-76,y-24,40,48,8,C.card,C.line);txt(g,F2(T*100,0)+"%",W-56,y,C.ink,13,"center",true);
  if(!RM){if(Math.random()<dt*25)st.ph.push({x:x0,y:y+(Math.random()-.5)*14});const k=Math.LN10*.5*p.c/(W*.16);st.ph.forEach(q=>{const nx=q.x+dt*180;if(nx>xc&&q.x<xe&&Math.random()<k*(nx-Math.max(q.x,xc)))q.dead=1;q.x=nx;});st.ph=st.ph.filter(q=>!q.dead&&q.x<W-80);st.ph.forEach(q=>circ(g,q.x,q.y,2.5,C.warn));}
  const gx=60,gy=H*.6,gw=W-120,gh=H*.32;axes(g,gx,gy,gw,gh,"spessore (cm)","I/I₀");g.strokeStyle=C.fam;g.lineWidth=2.5;g.beginPath();for(let i=0;i<=50;i++){const l=2*i/50,v=Math.pow(10,-.5*p.c*l);i?g.lineTo(gx+l/2*gw,gy+gh-v*gh):g.moveTo(gx,gy+gh-v*gh);}g.stroke();circ(g,gx+p.l/2*gw,gy+gh-T*gh,6,C.warn);
  return `A = ε·c·l = <b>${F2(A,2)}</b> → trasmittanza T = 10^(−A) = <b>${F2(T*100,1)}%</b>. L'assorbanza cresce in proporzione a concentrazione e spessore; l'intensità cala in modo esponenziale.`;}},
decadimento:{h:320,c:[{k:"T",l:"Tempo di dimezzamento T½",min:1,max:8,st:.5,v:3,u:" s"}],ri:1,
 init(st){st.n=Array(400).fill(1);st.tt=0;st.hist=[[0,400]];},
 f(g,p,st,dt,W,H){const lam=Math.LN2/p.T;st.tt+=dt;let N=0;for(let i=0;i<400;i++){if(st.n[i]&&Math.random()<lam*dt)st.n[i]=0;N+=st.n[i];}
  if(!st.hist.length||st.tt-st.hist[st.hist.length-1][0]>.1)st.hist.push([st.tt,N]);if(st.tt>p.T*5.5)this.init(st,p);
  const cs=Math.min((W*.42)/20,(H-30)/20);for(let i=0;i<400;i++){const x=14+(i%20)*cs,y=14+Math.floor(i/20)*cs;circ(g,x+cs/2,y+cs/2,cs*.36,st.n[i]?C.warn:A_(C.muted,.25));}
  const gx=W*.5,gy=20,gw=W*.46,gh=H-56,tm=p.T*5.5,X=t=>gx+t/tm*gw,Y=n=>gy+gh-n/400*gh;axes(g,gx,gy,gw,gh,"t (s)","N");
  for(let k=1;k<=5;k++){line(g,X(k*p.T),gy,X(k*p.T),gy+gh,C.line,1,[3,4]);txt(g,k+"T½",X(k*p.T),gy+gh+12,C.muted,10,"center");}
  g.strokeStyle=A_(C.acc,.6);g.lineWidth=2;g.beginPath();for(let t=0;t<=tm;t+=tm/80){const v=400*Math.pow(.5,t/p.T);t?g.lineTo(X(t),Y(v)):g.moveTo(X(t),Y(v));}g.stroke();
  g.strokeStyle=C.warn;g.lineWidth=2.5;g.beginPath();st.hist.forEach((h,i)=>i?g.lineTo(X(h[0]),Y(h[1])):g.moveTo(X(h[0]),Y(h[1])));g.stroke();
  return `t = <b>${F2(st.tt,1)} s</b> · nuclei rimasti <b>${N}</b> su 400 (atteso ${F2(400*Math.pow(.5,st.tt/p.T),0)}). Ogni T½ ne resta la metà; l'attività A = λN cala allo stesso modo. Il decadimento del singolo nucleo è casuale.`;}},
spettro:{h:280,c:[{k:"lf",l:"Frequenza f = 10^x Hz: x =",min:3,max:20,st:.1,v:14.7}],
 f(g,p,st,dt,W,H){const f=Math.pow(10,p.lf),lam=3e8/f,E=4.136e-15*f,x0=20,w=W-40,X=v=>x0+(v-3)/17*w,y=H*.62;
  const reg=[[3,8.5,"radio",C.muted],[8.5,11.5,"microonde",C.ben],[11.5,14.6,"infrarosso",C.warn],[14.6,14.9,"",null],[14.9,16.5,"UV",C.fam],[16.5,19.4,"raggi X",C.acc],[19.4,20,"γ",C.lp]];
  reg.forEach(r=>{if(r[3]){g.fillStyle=A_(r[3],.25);g.fillRect(X(r[0]),y,X(r[1])-X(r[0]),34);txt(g,r[2],(X(r[0])+X(r[1]))/2,y+17,C.ink,12,"center",true);}});
  const gr=g.createLinearGradient(X(14.6),0,X(14.9),0);["#d32f2f","#f57c00","#fbc02d","#388e3c","#1976d2","#7b1fa2"].forEach((c,i)=>gr.addColorStop(i/5,c));g.fillStyle=gr;g.fillRect(X(14.6),y,X(14.9)-X(14.6),34);
  line(g,X(16.4),y+40,X(20),y+40,C.warn,3);txt(g,"radiazioni ionizzanti",X(18.2),y+52,C.warn,11,"center",true);
  const px=X(p.lf);arrow(g,px,y-30,px,y-2,C.ink,3,"");
  const wl=10+(20-p.lf)/17*90;g.strokeStyle=C.acc;g.lineWidth=2.5;g.beginPath();for(let x=0;x<=w;x+=2){const yy=H*.25+18*Math.sin(2*Math.PI*x/wl-st.t*4);x?g.lineTo(x0+x,yy):g.moveTo(x0,yy);}g.stroke();
  const vis=p.lf>=14.6&&p.lf<=14.9;const fmtE=v=>v>=1e6?F2(v/1e6,1)+" MeV":v>=1e3?F2(v/1e3,1)+" keV":v>=1?F2(v,2)+" eV":v.toExponential(1).replace("e","·10^")+" eV";const fmtL=v=>v>=1?F2(v,1)+" m":v>=1e-3?F2(v*1e3,1)+" mm":v>=1e-6?F2(v*1e6,1)+" µm":v>=1e-9?F2(v*1e9,0)+" nm":v.toExponential(1).replace("e","·10^")+" m";
  return `f = 10^${F2(p.lf,1)} Hz · λ = c/f = <b>${fmtL(lam)}</b> · energia del fotone E = hf = <b>${fmtE(E)}</b>${vis?" · <b>luce visibile</b>":""}${E>10?" · <b>ionizzante</b>":""}. Più frequenza = λ più corta = fotoni più energetici.`;}}
};

const RUN=new Set();let lastT=0;
function loop(t){const dt=Math.min(.05,lastT?(t-lastT)/1000:0);lastT=t;RUN.forEach(h=>{if(!h.cv.isConnected){RUN.delete(h);return;}if(h.vis&&h.play)h.step(dt);});requestAnimationFrame(loop);}
requestAnimationFrame(loop);
function mountAnim(box,id,opt){const A=AN[id];if(!A)return;const p={};(A.c||[]).forEach(c=>p[c.k]=(opt&&opt[c.k]!=null)?opt[c.k]:c.v);
  const ctl=(A.c||[]).map(c=>c.seg?`<label>${c.l}<div class="segc" data-k="${c.k}">${c.seg.map((s,i)=>`<button type="button" data-i="${i}" class="${p[c.k]==i?"on":""}">${s}</button>`).join("")}</div></label>`:
    `<label><span>${c.l} <b data-o="${c.k}">${F2(p[c.k])}${c.u||""}</b></span><input type="range" data-k="${c.k}" min="${c.min}" max="${c.max}" step="${c.st}" value="${p[c.k]}" aria-label="${c.l}"></label>`).join("");
  box.innerHTML=`<div class="anim"><canvas aria-label="Animazione interattiva"></canvas>${ctl?`<div class="actl">${ctl}</div>`:""}<div class="ainfo"></div><div class="abtn"><button class="btn sm" data-a="play" type="button">${RM?"▶ Avvia":"⏸ Pausa"}</button><button class="btn sm" data-a="reset" type="button">↺ Ricomincia</button></div></div>`;
  const cv=box.querySelector("canvas"),info=box.querySelector(".ainfo"),Hh=A.h||280,st={t:0};let W=0,last="";if(A.init)A.init(st,p);
  const h={cv,vis:true,play:!RM,step(dt){st.t+=dt;h.draw(dt);},draw(dt){if(!W)size();const g=cv.getContext("2d"),d=devicePixelRatio||1;g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,Hh);let s;try{s=A.f(g,p,st,dt||0,W,Hh);}catch(e){s="";}if(s!==last){info.innerHTML=s;last=s;}}};
  function size(){W=Math.max(280,cv.clientWidth||box.clientWidth||600);const d=devicePixelRatio||1;cv.width=Math.round(W*d);cv.height=Math.round(Hh*d);cv.style.height=Hh+"px";}
  size();h.draw(0);
  try{new ResizeObserver(()=>{size();h.draw(0);}).observe(cv);}catch(e){}
  try{new IntersectionObserver(es=>{h.vis=es[0].isIntersecting;}).observe(cv);}catch(e){}
  box.querySelectorAll("input[type=range]").forEach(r=>r.addEventListener("input",()=>{const k=r.dataset.k,c=A.c.find(x=>x.k===k);p[k]=+r.value;box.querySelector(`[data-o="${k}"]`).textContent=F2(p[k])+(c.u||"");if(A.ri&&A.init)A.init(st,p);if(!h.play)h.draw(0);}));
  box.querySelectorAll(".segc").forEach(sg=>sg.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;p[sg.dataset.k]=+b.dataset.i;sg.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));if(A.init)A.init(st,p);st.t=0;h.draw(0);}));
  box.querySelector('[data-a="play"]').onclick=e=>{h.play=!h.play;e.target.textContent=h.play?"⏸ Pausa":"▶ Avvia";};
  box.querySelector('[data-a="reset"]').onclick=()=>{st.t=0;if(A.init)A.init(st,p);h.draw(0);};
  RUN.add(h);}
