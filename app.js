'use strict';
const K='wohnbudget-v1';
const def=()=>({income:0,buffer:300,green:800,orange:200,sort:'name',exp:[],flats:[],model:'ind',r1:1.5,r2:1.75,l1:65,l2:15,eq:20,years:15,ref:null,bonus:0,tax:0});
let S=load(),view={n:'home'},expF='all';
function load(){try{const s=JSON.parse(localStorage.getItem(K));if(s&&Array.isArray(s.flats)){const m=Object.assign(def(),s);m.exp=(m.exp||[]).map(e=>({...e,on:e.on!==false}));if(!m.flats.some(f=>f.id===m.ref))m.ref=null;return m}}catch(e){}return def()}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){alert('Speichern fehlgeschlagen (Speicher voll oder gesperrt).')}}
const uid=()=>Math.random().toString(36).slice(2,9),$=s=>document.querySelector(s);
const nf=new Intl.NumberFormat('de-CH',{maximumFractionDigits:2});
const chf=v=>'CHF\u00a0'+nf.format(Math.round((v||0)*100)/100);
const num=v=>{const n=parseFloat(String(v).replace(/[’'\s]/g,'').replace(',','.'));return isFinite(n)?n:0};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const act=()=>S.exp.filter(e=>e.on!==false);
const expTotal=()=>act().reduce((a,e)=>a+e.amt,0);
const housing=f=>f.rent+f.nk+f.pc*f.pp;
function calc(f){const h=housing(f),e=expTotal(),rem=S.income-e-h,free=rem-S.buffer;
 const fx=act().filter(x=>x.type!=='var').reduce((t,x)=>t+x.amt,0);return{h,e,rem,nv:S.income-fx-h,ya:rem*12+(S.bonus||0)-(S.tax||0),yn:(S.income-fx-h)*12+(S.bonus||0)-(S.tax||0),free,once:f.once.reduce((a,o)=>a+o.amt,0),used:S.income>0?(e+h)/S.income:1,st:free>=S.green?0:free>=S.orange?1:2}}
//M1
function mort(s=S){const eq=s.eq/100,ind=s.model!=='min';
 const a1=ind?s.l1/100:Math.min(2/3,1-eq),a2=ind?s.l2/100:Math.max(0,1-eq-a1);
 const i1=a1*s.r1/100,i2=a2*s.r2/100,am=a2>0?(s.years>0?a2/s.years:NaN):0,f=i1+i2+am;
 return{a1,a2,i1,i2,am,f,ok:isFinite(f)&&f>0}}
const buy=(rent,s=S)=>{const m=mort(s);return m.ok&&rent>0?rent*12/m.f:null};
//M2
const nf4=new Intl.NumberFormat('de-CH',{maximumFractionDigits:4});
const chfs=v=>v==null?'–':nf.format(Math.round(v))+'\u00a0CHF';
const cs=v=>Math.round(v)>0?'pos':Math.round(v)<0?'neg':'';
const fs=(v,u)=>{const r=Math.round(v);return `<div class="dl ${cs(v)}">${r>0?'+':r<0?'-':''}${nf.format(Math.abs(r))}\u00a0CHF <small>/\u00a0${u}</small></div>`};
function mortHint(){const m=mort(),p=x=>nf4.format(x*100)+'\u00a0%';
 let t=m.ok?`Kostenfaktor ${p(m.f)} p. a. (1. Hyp. ${p(m.i1)} + 2. Hyp. ${p(m.i2)} + Amortisation ${p(m.am)}).`:'Ungültige Angaben: Kaufpreis nicht berechenbar (Amortisationsdauer muss grösser als 0 sein).';
 if(S.model==='min')t+=` Minimum: 1. Hypothek ${p(m.a1)}, 2. Hypothek ${p(m.a2)}, Amortisation auf zwei Drittel des Belehnungswerts.`;
 else if(Math.abs(S.l1+S.l2+S.eq-100)>.001)t+=' Hinweis: 1. + 2. Hypothek + Eigenkapital ergeben nicht 100 %.';
 return t+' Theoretischer Wert nur aus der Nettomiete, ohne Unterhalt, Steuern, Kaufnebenkosten und Tragbarkeit; keine Bewertung oder Finanzierungszusage.'}
const ST=['Entspannt','Machbar','Kritisch'];
const chip=s=>`<span class="chip s${s}">${ST[s]}</span>`;
const bar=(u,s)=>`<div class="bar"><i class="b${s}" style="width:${Math.min(100,Math.max(0,u*100))}%"></i></div><div class="mute">${Math.round(u*100)}% des Einkommens verplant</div>`;
const flat=()=>S.flats.find(f=>f.id===view.id);
const inp=(c,f,v,o={})=>`<input data-c="${c}" data-f="${f}" ${o.id?`data-id="${o.id}"`:''} ${o.max?`data-max="${o.max}"`:''} data-t="${o.t||'n'}" ${o.t==='s'?'':'inputmode="'+(o.int?'numeric':'decimal')+'"'} value="${esc(o.t==='s'?v:(v||''))}" placeholder="${o.ph??'0'}" ${o.aria?`aria-label="${o.aria}"`:''}>`;

function home(){
 const fl=[...S.flats].map(f=>({f,c:calc(f)})),R=fl.find(x=>x.f.id===S.ref);
 const k={name:(a,b)=>a.f.name.localeCompare(b.f.name,'de'),cost:(a,b)=>a.c.h-b.c.h,rest:(a,b)=>b.c.free-a.c.free}[S.sort];fl.sort(k);
 return `<h1>WohnBudget</h1>
 <div class="grid"><div class="card"><div class="mute">Nettoeinkommen</div><div class="mid">${chf(S.income)}</div></div>
 <div class="card"><div class="mute">Allg. Ausgaben</div><div class="mid">${chf(expTotal())}</div></div>
 <div class="card"><div class="mute">Vor Wohnkosten übrig</div><div class="mid">${chf(S.income-expTotal())}</div></div>
 <div class="card"><div class="mute">Sicherheitspuffer</div><div class="mid">${chf(S.buffer)}</div></div></div>
 <div class="top" style="margin-top:20px"><h2 style="margin:0">Wohnungen</h2>
 <select data-c="root" data-f="sort" data-t="s" data-r="1" style="width:auto" aria-label="Sortierung"><option value="name">Name</option><option value="cost">Kosten</option><option value="rest">Restbudget</option></select></div>
 ${fl.length&&!R&&fl.length>1?'<p class="note" style="margin:0 4px 10px">Tipp: Lege in einer Wohnung «Als aktuellen Status festlegen» fest, um Differenzen auf den Karten zu sehen.</p>':''}${fl.length?fl.map(({f,c})=>`<div class="card fl" data-a="go" data-v="flat" data-id="${f.id}"><div class="top" style="margin:0"><b>${f.fav?'★ ':''}${esc(f.name)||'Ohne Name'}</b><span>${S.ref===f.id?'<span class="chip ref">Aktueller Status</span> ':''}${chip(c.st)}</span></div>
 <div class="row"><span class="mute">Wohnkosten / Monat</span><b>${chf(c.h)}</b></div>
 <div class="duo"><div><div class="mute">Restbudget nach allen Ausgaben</div><div class="mid" style="color:var(--${['g','o','r'][c.st]})">${chf(c.rem)}</div></div>
 <div><div class="mute">Restbudget ohne variable Kosten</div><div class="mid">${chf(c.nv)}</div></div></div>
 <div class="duo"><div><div class="mute">Jahresüberschuss nach allen Ausgaben</div>${fs(c.ya,'Jahr')}</div><div><div class="mute">Jahresüberschuss ohne variable Kosten</div>${fs(c.yn,'Jahr')}</div></div>
 ${R&&R.f.id!==f.id?`<div class="diffbox"><div>${fs(c.rem-R.c.rem,'Monat')}<div class="mute">gegenüber aktuell</div></div><div>${fs(c.ya-R.c.ya,'Jahr')}<div class="mute">gegenüber aktuell</div></div></div>`:''}${bar(c.used,c.st)}<div class="row buy"><span class="mute">Geschätzter Kaufpreis (nur Nettomiete)</span><b>${chfs(buy(f.rent))}</b></div></div>`).join(''):'<div class="empty">Noch keine Wohnung.<br>Lege deine erste Wohnung an.</div>'}
 <button class="btn p" data-a="addFlat">+ Neue Wohnung</button>
 <p class="note">Die Einschätzung ist eine Orientierungshilfe und keine Finanzberatung.</p>`}

function flatLive(){const f=flat(),c=calc(f);return `<div class="card"><div class="top" style="margin:0"><span class="mute">Frei verfügbar nach Puffer</span>${chip(c.st)}</div>
 <div class="big" style="color:var(--${['g','o','r'][c.st]})">${chf(c.free)}</div>${bar(c.used,c.st)}</div>
 <div class="card"><div class="row"><span>Nettoeinkommen</span><b>${chf(S.income)}</b></div>
 <div class="row"><span>− Allgemeine Ausgaben</span><span>${chf(c.e)}</span></div>
 <div class="row"><span>− Nettomiete</span><span>${chf(f.rent)}</span></div>
 <div class="row"><span>− Nebenkosten</span><span>${chf(f.nk)}</span></div>
 <div class="row"><span>− Stellplätze (${f.pc} × ${chf(f.pp)})</span><span>${chf(f.pc*f.pp)}</span></div>
 <div class="row"><b>= Verbleibendes Monatsbudget</b><b>${chf(c.rem)}</b></div>
 <div class="row"><span>− Sicherheitspuffer</span><span>${chf(S.buffer)}</span></div>
 <div class="row"><b>= Frei verfügbar</b><b>${chf(c.free)}</b></div></div>
 <div class="card"><div class="row"><span class="mute">Gesamte Wohnkosten / Monat</span><b>${chf(c.h)}</b></div>
 <div class="row"><span class="mute">Einmalige Kosten (Einzug)</span><b>${chf(c.once)}</b></div></div>`}

function flatView(){const f=flat();if(!f){view={n:'home'};return home()}
 return `<div class="top"><button class="ic" data-a="go" data-v="home" aria-label="Zurück">‹ </button><div><button class="ic ${f.fav?'on':''}" data-a="fav" aria-label="Favorit">${f.fav?'★':'☆'}</button><button class="ic" data-a="dup" aria-label="Duplizieren">⧉</button><button class="ic" data-a="delFlat" aria-label="Löschen">🗑</button></div></div>
 <h1>${esc(f.name)||'Wohnung'}</h1>${S.ref===f.id?'<div class="top"><span class="chip ref">Aktueller Status</span><button class="btn" data-a="unref">Markierung entfernen</button></div>':'<button class="btn" style="width:100%;margin-bottom:12px" data-a="ref">Als aktuellen Status festlegen</button>'}<div id="live">${flatLive()}</div>
 <h2>Wohnung</h2><div class="card"><label>Name</label>${inp('flat','name',f.name,{t:'s',ph:'z. B. Zürich Altstetten'})}
 <label>Adresse / Standort (optional)</label>${inp('flat','addr',f.addr,{t:'s',ph:''})}
 <label>Notizen (optional)</label><textarea rows="3" data-c="flat" data-f="notes" data-t="s">${esc(f.notes)}</textarea></div>
 <h2>Monatliche Kosten (CHF)</h2><div class="card"><label>Nettomiete</label>${inp('flat','rent',f.rent)}<label>Nebenkosten</label>${inp('flat','nk',f.nk)}
 <div class="grid" style="gap:8px"><div><label>Anzahl Stellplätze</label>${inp('flat','pc',f.pc,{int:1})}</div><div><label>Kosten pro Stellplatz</label>${inp('flat','pp',f.pp)}</div></div></div>
 <h2>Einmalige Kosten</h2><div class="card">${f.once.map(o=>`<div class="line">${inp('once','name',o.name,{t:'s',id:o.id,ph:'Bezeichnung',aria:'Bezeichnung'})}${inp('once','amt',o.amt,{id:o.id,aria:'Betrag'})}<button class="ic" data-a="delOnce" data-id="${o.id}" aria-label="Löschen">✕</button></div>`).join('')}
 <button class="btn" data-a="addOnce">+ Posten (Kaution, Umzug, Möbel …)</button></div>`}

function budgetLive(){const A=act(),fx=A.filter(e=>e.type!=='var').reduce((a,e)=>a+e.amt,0),t=expTotal(),off=S.exp.filter(e=>e.on===false);
 return `<div class="card"><div class="row"><span>Fixkosten</span><b>${chf(fx)}</b></div><div class="row"><span>Variable Kosten</span><b>${chf(t-fx)}</b></div><div class="row"><b>Total Ausgaben</b><b>${chf(t)}</b></div><div class="row"><b>Übrig vor Wohnkosten</b><b>${chf(S.income-t)}</b></div>${off.length?`<div class="row"><span class="mute">Deaktiviert (nicht eingerechnet, ${off.length})</span><span class="mute">${chf(off.reduce((a,e)=>a+e.amt,0))}</span></div>`:''}</div>`}
function budget(){const list=S.exp.filter(e=>expF==='all'||(expF==='on')===(e.on!==false));return `<h1>Budget</h1><div class="card"><label>Monatliches Nettoeinkommen (CHF)</label>${inp('root','income',S.income)}
 <label>Gewünschter Sicherheitspuffer (CHF / Monat)</label>${inp('root','buffer',S.buffer)}</div>
 <h2>Jährliche Beträge</h2><div class="card"><label>Jahresbonus (CHF, zusätzliche Einnahme)</label>${inp('root','bonus',S.bonus)}<label>Jährliche Steuern (CHF, zusätzliche Ausgabe)</label>${inp('root','tax',S.tax)}<p class="note" style="margin-top:10px">Gelten für alle Wohnungen. Werden nicht auf Monate verteilt und fliessen nur in die Jahreswerte ein, die Monatswerte bleiben unverändert.</p></div>
 <h2>Allgemeine Ausgaben</h2><div class="seg">${[['all','Alle'],['on','Aktiv'],['off','Inaktiv']].map(x=>`<button data-a="filt" data-v="${x[0]}" class="${expF===x[0]?'on':''}">${x[1]}</button>`).join('')}</div><div class="card">${list.map(e=>`<div class="line e ${e.on===false?'off':''}">${inp('exp','name',e.name,{t:'s',id:e.id,ph:'Bezeichnung',aria:'Bezeichnung'})}${inp('exp','amt',e.amt,{id:e.id,aria:'Betrag'})}<button class="ic" data-a="delExp" data-id="${e.id}" aria-label="Löschen">✕</button>
 <select data-c="exp" data-f="type" data-t="s" data-id="${e.id}" data-r="1" style="grid-column:1/3" aria-label="Art"><option value="fix" ${e.type==='fix'?'selected':''}>Fixkosten</option><option value="var" ${e.type==='var'?'selected':''}>Variable Kosten</option></select>
 <label class="sw" title="Aktiv"><input type="checkbox" data-c="exp" data-f="on" data-t="b" data-id="${e.id}" data-r="1" ${e.on!==false?'checked':''} aria-label="Aktiv"><i></i></label></div>`).join('')||`<div class="mute" style="padding:8px 0">${S.exp.length?'Keine Posten in dieser Ansicht.':'Noch keine Ausgaben, z. B. Krankenkasse, Steuern, Lebensmittel.'}</div>`}
 <button class="btn" data-a="addExp">+ Ausgabe hinzufügen</button></div><div id="live">${budgetLive()}</div>
 <h2>Ampel-Grenzen (frei verfügbar nach Puffer)</h2><div class="card"><label>Entspannt ab (CHF)</label>${inp('root','green',S.green)}<label>Machbar ab (CHF), darunter kritisch</label>${inp('root','orange',S.orange)}</div>
 <h2>Immobilien-Kaufvergleich</h2><div class="card"><label>Finanzierungsmodell</label><select data-c="root" data-f="model" data-t="s" data-r="1"><option value="ind" ${S.model!=='min'?'selected':''}>Individuell (Belehnung frei wählbar)</option><option value="min" ${S.model==='min'?'selected':''}>Aufsichtsrechtliches Minimum (2/3 in 15 J.)</option></select>
 <label>Zinssatz 1. Hypothek (%)</label>${inp('root','r1',S.r1,{max:100})}<label>Zinssatz 2. Hypothek (%)</label>${inp('root','r2',S.r2,{max:100})}
 ${S.model==='min'?'':`<label>Belehnung 1. Hypothek (%)</label>${inp('root','l1',S.l1,{max:100})}<label>Belehnung 2. Hypothek (%)</label>${inp('root','l2',S.l2,{max:100})}`}
 <label>Eigenkapital (%)</label>${inp('root','eq',S.eq,{max:100})}<label>Amortisationsdauer (Jahre)</label>${inp('root','years',S.years)}<p class="note" id="mh">${mortHint()}</p></div>
 <h2>Daten</h2><div class="card"><div class="grid" style="gap:8px"><button class="btn" data-a="export">Exportieren</button><button class="btn" data-a="import">Importieren</button></div>
 <input type="file" id="file" accept="application/json,.json" hidden><p class="note">Alle Daten liegen nur auf diesem Gerät. Exportiere regelmässig ein Backup (JSON).</p></div>`}

function tabs(){const t=[['home','⌂','Übersicht'],['budget','CHF','Budget']],a=view.n==='flat'?'home':view.n;
 return `<nav>${t.map(x=>`<button class="${a===x[0]?'on':''}" data-a="go" data-v="${x[0]}"><b>${x[1]}</b>${x[2]}</button>`).join('')}</nav>`}
function render(){const v=view.n;$('#app').innerHTML=({home,flat:flatView,budget})[v]()+tabs();
 const s=$('select[data-f=sort]');if(s)s.value=S.sort}
const refresh=()=>{const mh=$('#mh');if(mh)mh.textContent=mortHint();const l=$('#live');if(l)l.innerHTML=view.n==='flat'?flatLive():budgetLive()};
const mkFlat=()=>({id:uid(),name:'',addr:'',notes:'',fav:false,rent:0,nk:0,pc:0,pp:0,once:[]});

document.addEventListener('input',onEdit);document.addEventListener('change',e=>{if(e.target.id==='file')return doImport(e.target);if(e.target.matches('select,input[type=checkbox]'))onEdit(e)});
function onEdit(e){const el=e.target,c=el.dataset.c;if(!c||(el.type==='checkbox'&&e.type==='input'))return;
 let o=c==='root'?S:c==='flat'?flat():c==='exp'?S.exp.find(x=>x.id===el.dataset.id):flat()?.once.find(x=>x.id===el.dataset.id);if(!o)return;
 let v=el.value;if(el.dataset.t==='b')v=el.checked;if(el.dataset.t==='n'){const n=num(v);el.classList.toggle('bad',n<0||(v.trim()!==''&&!/^[\d’'\s.,-]+$/.test(v)));v=Math.max(0,n);if(el.dataset.max)v=Math.min(v,+el.dataset.max);if(el.inputMode==='numeric')v=Math.floor(v)}
 o[el.dataset.f]=v;save();if(el.dataset.r)render();else refresh()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,f=flat();
 const go=(n,id)=>{view={n,id};render();window.scrollTo(0,0)};
 if(a==='go')go(b.dataset.v,b.dataset.id);
 else if(a==='addFlat'){const n=mkFlat();S.flats.push(n);save();go('flat',n.id)}
 else if(a==='fav'){f.fav=!f.fav;save();render()}
 else if(a==='dup'){const d=JSON.parse(JSON.stringify(f));d.id=uid();d.name=(f.name||'Wohnung')+' (Kopie)';d.fav=false;d.once.forEach(o=>o.id=uid());S.flats.push(d);save();go('flat',d.id)}
 else if(a==='delFlat'){if(confirm('Wohnung wirklich löschen?')){S.flats=S.flats.filter(x=>x!==f);if(S.ref===f.id)S.ref=null;save();go('home')}}
 else if(a==='addOnce'){f.once.push({id:uid(),name:'',amt:0});save();render()}
 else if(a==='delOnce'){f.once=f.once.filter(o=>o.id!==b.dataset.id);save();render()}
 else if(a==='ref'){S.ref=f.id;save();render()}
 else if(a==='unref'){S.ref=null;save();render()}
 else if(a==='filt'){expF=b.dataset.v;render()}
 else if(a==='addExp'){if(expF==='off')expF='all';S.exp.push({id:uid(),name:'',amt:0,type:'fix',on:true});save();render()}
 else if(a==='delExp'){if(confirm('Ausgabe löschen?')){S.exp=S.exp.filter(x=>x.id!==b.dataset.id);save();render()}}
 else if(a==='export'){const u=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'})),l=document.createElement('a');l.href=u;l.download='wohnbudget-'+new Date().toISOString().slice(0,10)+'.json';l.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
 else if(a==='import')$('#file').click()});
function doImport(el){const file=el.files[0];if(!file)return;const r=new FileReader();
 r.onload=()=>{try{const d=JSON.parse(r.result);if(!Array.isArray(d.flats)||!Array.isArray(d.exp))throw 0;
  if(!confirm('Aktuelle Daten durch die importierte Datei ersetzen?'))return;
  const m=Object.assign(def(),d);m.income=Math.max(0,num(m.income));m.buffer=Math.max(0,num(m.buffer));m.bonus=Math.max(0,num(m.bonus));m.tax=Math.max(0,num(m.tax));
  m.flats=m.flats.map(f=>Object.assign(mkFlat(),f,{once:Array.isArray(f.once)?f.once:[]}));m.exp=m.exp.map(e=>Object.assign({id:uid(),name:'',amt:0,type:'fix'},e,{on:e.on!==false}));if(!m.flats.some(f=>f.id===m.ref))m.ref=null;S=m;save();view={n:'home'};render()}catch(x){alert('Ungültige Datei.')}};
 r.readAsText(file);el.value=''}
render();
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
