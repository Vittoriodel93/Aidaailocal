(()=>{'use strict';
const KEY='aida04_data';const defaults={xp:0,memory:[],proposals:[],skills:[],projects:[],chat:[],backend:'',pc:{url:''},useMemory:false,sync:{on:false,updated:0,hash:''},wake:false,ai:{model:'local',code:''},voice:{auto:true,name:'',pitch:1.1,rate:1}};let data;try{data={...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{data={...defaults}};
const $=id=>document.getElementById(id);const save=()=>{localStorage.setItem(KEY,JSON.stringify(data));render();schedSync()};const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const level=()=>Math.min(100,Math.floor(data.xp/100));const rank=()=>level()<5?'Inizio del percorso':level()<20?'Esploratrice':level()<50?'Apprendista evolutiva':level()<80?'Custode della conoscenza':'AIDA trascendente';
function gain(n,why){let old=level();data.xp=Math.min(10000,data.xp+n);let up=level()>old;save();if(up)toast('AIDA è salita al livello '+level()+'!');}
function toast(t){let el=document.createElement('div');el.className='toast';el.textContent=t;document.body.append(el);setTimeout(()=>el.remove(),2600)}
function render(){let lv=level(),prog=data.xp%100;$('level').textContent=lv;$('bigLevel').textContent=lv;$('rank').textContent=rank();$('rank2').textContent=rank();$('xp').textContent=data.xp+' XP';$('xpText').textContent=prog+' / 100 XP';$('xpnext').textContent=(100-prog)+' XP al prossimo livello';$('xpbar').style.width=prog+'%';$('xpbar2').style.width=prog+'%';$('memoryCount').textContent=data.memory.length;
$('memoryList').innerHTML=data.memory.map((m,i)=>`<div class="item"><div>${esc(m.text)}<small>${new Date(m.date).toLocaleString('it-IT')}</small></div><button data-delmem="${i}">Elimina</button></div>`).join('')||'<p class="muted">La memoria è vuota. Puoi iniziare aggiungendo un appunto.</p>';
$('proposalList').innerHTML=data.proposals.map((p,i)=>`<div class="item"><div><b>${esc(p.title)}</b><small>${esc(p.desc)} · In attesa di sviluppo</small></div><button data-delprop="${i}">×</button></div>`).join('');
$('skillList').innerHTML=data.skills.map((s,i)=>`<div class="item"><div><b>${esc(s.name)}</b><small>Scheda competenza locale · ${new Date(s.date).toLocaleDateString('it-IT')}</small></div><button data-delskill="${i}">×</button></div>`).join('')||'<p class="muted">Ancora nessuna competenza. Crea la prima.</p>';
$('projectList').innerHTML=data.projects.map((p,i)=>`<div class="item"><b>▦ ${esc(p)}</b><button data-delproj="${i}">×</button></div>`).join('')||'<p class="muted">Ancora nessun progetto. Aggiungine uno qui sotto.</p>';$('backendUrl').value=data.backend||'';$('backendState').textContent=data.backend?'Backend salvato: '+data.backend+' (la modalità locale resta disponibile).':'Nessun backend configurato: AIDA funziona comunque in locale.';
$('messages').innerHTML=(data.chat||[]).map(m=>`<div class="bubble ${m.role==='user'?'user':'bot'}">${esc(m.text)}${m.trace?`<details class="trace"><summary>ESECUZIONE · ${m.trace.reduce((s,t)=>s+t.ms,0)} ms</summary><ol>${m.trace.map(t=>`<li><span>${esc(t.n)}</span><b>${t.ms} ms</b></li>`).join('')}</ol></details>`:''}</div>`).join('')||'<div class="bubble bot">Ciao! Sono AIDA. Posso aiutarti anche senza internet. ✨</div>';$('messages').scrollTop=$('messages').scrollHeight;
}
function reply(text){let t=text.toLowerCase();if(/ciao|buongiorno|buonasera|salve/.test(t))return 'Ciao! Sono qui. 😊 Possiamo organizzare un progetto, salvare un promemoria o sviluppare una nuova capacità.';if(/chi sei|cosa sai fare|aiuto/.test(t))return 'Sono AIDA. In modalità locale posso gestire memoria, progetti, competenze, proposte di evoluzione e progressi XP. Per risposte generative avanzate potrai collegare un motore AI in futuro.';if(/livello|xp|esperienza/.test(t))return `Sono al livello ${level()} con ${data.xp} XP. ${100-(data.xp%100)} XP al prossimo livello. Ogni attività completata mi fa avanzare!`;if(/progetto/.test(t))return 'I tuoi progetti sono nella sezione Progetti. Posso aiutarti a tenere traccia delle idee: dimmi cosa vuoi annotare e posso salvarlo nella memoria.';if(/ricorda|memorizza|salva/.test(t)){let note=text.replace(/^(aida[, ]*)?(ricorda|memorizza|salva)( che)?/i,'').trim();if(note.length>2){data.memory.unshift({text:note,date:Date.now()});gain(5);return 'Ho salvato nella memoria locale: “'+note+'”. Puoi ritrovarlo nella sezione Memoria.';}return 'Certo. Scrivimi esattamente cosa vuoi che salvi.';}if(/offline|internet|nas|server|colleg/.test(t))return 'In questo momento sto funzionando in modalità locale: non ho bisogno di NAS, server o internet per usare chat integrata, memoria, progetti e XP. Il collegamento sarà facoltativo.';if(/grazie/.test(t))return 'Con piacere! Ogni piccolo passo costruisce la nostra evoluzione. ✨';return 'Ho registrato il tuo messaggio nella conversazione. In modalità locale posso aiutarti con memoria, progetti e organizzazione; per elaborare liberamente qualsiasi argomento servirà in futuro un modello AI collegato. Vuoi che salvi questa idea nella memoria?';}
function addMessage(role,text,trace){data.chat.push(trace?{role,text,trace}:{role,text});if(data.chat.length>100)data.chat=data.chat.slice(-100);}
$('chatForm').addEventListener('submit',e=>{e.preventDefault();let text=$('messageInput').value.trim();if(!text)return;addMessage('user',text);$('messageInput').value='';save();setState('thinking');unlockTTS();const sk=(window.AIDA_SKILLS||[]).find(s=>{try{return s.test(text)}catch{return false}});if(sk){skillFlow(sk,text);return}if(data.ai.model!=='local'){cloudFlow();return}const t0=performance.now();setTimeout(()=>{const t1=performance.now();let mem=data.memory.length;let answer=reply(text);const t2=performance.now();addMessage('assistant',answer,[{n:'Analisi della richiesta',ms:Math.max(1,Math.round(t1-t0))},{n:'Ricerca in memoria locale ('+mem+' voci)',ms:Math.max(1,Math.round((t2-t1)/2))},{n:'Composizione della risposta',ms:Math.max(1,Math.round(t2-t1))}]);gain(2);save();afterReply(answer)},380);});$('clearChat').onclick=()=>{data.chat=[];save()};$('memoryForm').onsubmit=e=>{e.preventDefault();let text=$('memoryInput').value.trim();if(!text)return;data.memory.unshift({text,date:Date.now()});$('memoryInput').value='';gain(5);save()};$('proposalForm').onsubmit=e=>{e.preventDefault();data.proposals.unshift({title:$('proposalTitle').value.trim(),desc:$('proposalDesc').value.trim(),date:Date.now()});$('proposalTitle').value='';$('proposalDesc').value='';gain(15);save()};$('skillForm').onsubmit=e=>{e.preventDefault();let name=$('skillInput').value.trim();if(!name)return;data.skills.unshift({name,date:Date.now()});$('skillInput').value='';gain(10);save()};$('projectForm').onsubmit=e=>{e.preventDefault();let p=$('projectInput').value.trim();if(!p)return;data.projects.unshift(p);$('projectInput').value='';gain(3);save()};
document.addEventListener('click',e=>{let b=e.target.closest('[data-delmem],[data-delprop],[data-delskill],[data-delproj]');if(!b)return;for(let k of ['delmem','delprop','delskill','delproj'])if(b.dataset[k]!==undefined){let arr={delmem:'memory',delprop:'proposals',delskill:'skills',delproj:'projects'}[k];data[arr].splice(+b.dataset[k],1);save();}});
function show(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===id));$('pageTitle').textContent=({home:'Panoramica',chat:'Assistente',memory:'Memoria',evolution:'Evolution Lab',skills:'Competenze',projects:'Progetti',settings:'Impostazioni'})[id]||'AIDA';$('sidebar').classList.remove('open');}document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>show(b.dataset.goto));$('menu').onclick=()=>$('sidebar').classList.toggle('open');
$('backendForm').onsubmit=e=>{e.preventDefault();data.backend=$('backendUrl').value.trim().replace(/\/$/,'');save();toast(data.backend?'Indirizzo salvato. Modalità locale sempre disponibile.':'Modalità locale attiva.');};$('disconnect').onclick=()=>{data.backend='';save();toast('AIDA resta in modalità locale.');};
function download(){let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='aida-backup.json';a.click();URL.revokeObjectURL(a.href)}$('exportData').onclick=download;$('importBtn').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{try{let obj=JSON.parse(await e.target.files[0].text());data={...defaults,...obj};save();toast('Backup importato.');}catch{toast('File backup non valido.');}};$('resetData').onclick=()=>{if(confirm('Vuoi cancellare tutti i dati locali di AIDA?')){data={...defaults};save();}};
$('voiceBtn').onclick=()=>{let last=[...(data.chat||[])].reverse().find(m=>m.role==='assistant');if(!last){toast('Nessuna risposta da leggere.');return;}speak(last.text);};
if('serviceWorker'in navigator&&location.protocol.startsWith('http')){navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!window.__rl){window.__rl=1;location.reload()}})}
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));render();

/* ===== HUD engine: stati, nucleo, waveform, microfono ===== */
const LABEL={standby:'STANDBY',listening:'ASCOLTO',thinking:'ELABORAZIONE',executing:'ESECUZIONE',muted:'SILENZIOSO'};
let state='standby',stateT=0,analyser=null,micStream=null,freq=null,bump=0;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function setState(s){state=s;stateT=performance.now();document.body.dataset.state=s;$('stateLabel').textContent=LABEL[s];$('coreLabel').textContent='AIDA CORE · '+LABEL[s];$('chatLabel').textContent='CONVERSAZIONE · '+LABEL[s];if(reduce){const v=css('--state');if(/^#/.test(v))curRGB=hex(v);drawCore(cx,core.width);drawCore(cx2,coreChat.width);drawWave()}}
const css=n=>getComputedStyle(document.body).getPropertyValue(n).trim();
const core=$('core'),cx=core.getContext('2d'),coreChat=$('coreChat'),cx2=coreChat.getContext('2d'),wv=$('wave'),wx=wv.getContext('2d');
let col='#ffc857',target=col,ph=0;
function hex(c){c=c.replace('#','');return[0,2,4].map(i=>parseInt(c.substr(i,2),16))}
function mix(a,b,t){return a.map((v,i)=>Math.round(v+(b[i]-v)*t))}
let curRGB=hex('#ffc857');
function energy(){bump*=.92;if(analyser){analyser.getByteFrequencyData(freq);let s=0;for(let i=0;i<freq.length;i++)s+=freq[i];return s/freq.length/160}if(state==='listening')return .2+bump*.6+.08*Math.sin(ph*5);if(state==='thinking')return .55;if(state==='executing')return .35+.15*Math.sin(ph*9);return .12}
function drawCore(cx,W){const c=W/2;cx.clearRect(0,0,W,W);const en=Math.min(1,energy()),spd=state==='thinking'?2.4:state==='executing'?1.6:1;
const rgb=curRGB.join(','),str=a=>`rgba(${rgb},${a})`;
const g=cx.createRadialGradient(c,c,10,c,c,c*.95);g.addColorStop(0,str(.35+en*.3));g.addColorStop(.45,str(.08));g.addColorStop(1,str(0));cx.fillStyle=g;cx.fillRect(0,0,W,W);
for(let r=0;r<3;r++){const R=c*(.46+r*.17),n=[3,2,4][r];cx.lineWidth=2.5-r*.5;cx.strokeStyle=str(.8-r*.2);for(let k=0;k<n;k++){const a0=ph*(r%2?-1:1)*(1+r*.4)+k*Math.PI*2/n,len=Math.PI*2/n*(.55-r*.08);cx.beginPath();cx.arc(c,c,R,a0,a0+len);cx.stroke();}
cx.setLineDash([2,10]);cx.strokeStyle=str(.25);cx.beginPath();cx.arc(c,c,R,0,7);cx.stroke();cx.setLineDash([]);}
const rr=c*.27*(1+en*.22+Math.sin(ph*3)*.02);cx.strokeStyle=str(1);cx.lineWidth=3;cx.shadowColor=`rgb(${rgb})`;cx.shadowBlur=24;cx.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i+Math.PI/6+ph*.15;cx.lineTo(c+rr*Math.cos(a),c+rr*Math.sin(a))}cx.closePath();cx.stroke();cx.shadowBlur=0;
cx.fillStyle=str(.9);cx.font='700 '+c*.22+'px system-ui';cx.textAlign='center';cx.textBaseline='middle';cx.fillText('A',c,c+c*.01);
for(let i=0;i<24;i++){const a=i/24*Math.PI*2-ph*.6,v=analyser?freq[i*2]/255:(.25+.2*Math.sin(ph*4+i)),R0=c*.93,L=(8+v*26)*Math.max(.45,W/680);cx.strokeStyle=str(.5);cx.lineWidth=3;cx.beginPath();cx.moveTo(c+R0*Math.cos(a),c+R0*Math.sin(a));cx.lineTo(c+(R0-L)*Math.cos(a),c+(R0-L)*Math.sin(a));cx.stroke();}}
function drawWave(){const W=wv.width,H=wv.height,n=9,bw=W/(n*2);wx.clearRect(0,0,W,H);wx.fillStyle=`rgb(${curRGB.join(',')})`;for(let i=0;i<n;i++){const v=analyser?freq[Math.floor(i*freq.length/n/1.6)]/255:(.18+.14*Math.sin(ph*5+i*.8)*(state==='standby'?.5:1.4));const h=Math.max(4,Math.min(H,v*H*1.4));wx.fillRect(i*bw*2+bw/2,(H-h)/2,bw,h);}}
function loop(t){const tgt=hex(css('--state')||'#ffc857');curRGB=mix(curRGB,tgt,.08);ph+=.012*(state==='thinking'?2.4:state==='executing'?1.6:1);drawCore(cx,core.width);drawCore(cx2,coreChat.width);drawWave();if(!reduce)requestAnimationFrame(loop)}
if(reduce){drawCore(cx,core.width);drawCore(cx2,coreChat.width);drawWave()}else requestAnimationFrame(loop);
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let voiceChat=false,recActive=false,sr=null,unlocked=false,idle=0,wr=null,wakeActive=false,wakeDelay=400;
function unlockTTS(){if(unlocked||!('speechSynthesis'in window))return;unlocked=true;const u=new SpeechSynthesisUtterance('');u.volume=0;speechSynthesis.speak(u)}
let talking=false,ttsTimer=null;
const status=t=>{const el=$('liveCaption');if(el)el.textContent=t};
function startRec(){if(!voiceChat||recActive||!SR||talking)return;status('Avvio del microfono…');
sr=new SR();sr.lang='it-IT';sr.interimResults=true;sr.continuous=false;
sr.onstart=()=>{recActive=true;setState('listening');status('Ti ascolto… parla pure.')};
sr.onresult=e=>{let t='';for(const r of e.results)t+=r[0].transcript;$('messageInput').value=t;setCap('Tu',t);bump=1};
sr.onerror=e=>{recActive=false;if(e.error==='no-speech')status('Non ho sentito nulla…');else if(e.error!=='aborted')status('Errore microfono: '+e.error);const m={'not-allowed':'Microfono bloccato: consenti l\u2019accesso dalle impostazioni del sito.','service-not-allowed':'Microfono bloccato: consenti l\u2019accesso dalle impostazioni del sito.','network':'Il riconoscimento vocale ha bisogno di internet.','audio-capture':'Nessun microfono trovato.'}[e.error];if(m){toast(m);stopVoice()}};
sr.onend=()=>{recActive=false;if(!voiceChat)return;if($('messageInput').value.trim()){idle=0;$('chatForm').requestSubmit()}else if(++idle>=3){if(!data.wake)toast('Ascolto terminato: tocca il microfono per riprendere.');stopVoice()}else setTimeout(startRec,300)};
try{sr.start()}catch(err){status('Impossibile avviare il microfono: '+err.message);toast('Microfono: '+err.message)}}
async function startVoice(){unlockTTS();stopWake();idle=0;voiceChat=true;$('micBtn').classList.add('on');$('micBtn').setAttribute('aria-pressed','true');
if(!SR){try{micStream=await navigator.mediaDevices.getUserMedia({audio:true});const ac=new (window.AudioContext||window.webkitAudioContext)();analyser=ac.createAnalyser();analyser.fftSize=128;ac.createMediaStreamSource(micStream).connect(analyser);freq=new Uint8Array(analyser.frequencyBinCount);setState('listening');toast('Questo browser non supporta il dettato vocale: usa Chrome per parlare con AIDA.')}catch{toast('Microfono non disponibile: controlla i permessi del browser.');stopVoice()}return}
setState('listening');startRec()}
function stopVoice(){voiceChat=false;recActive=false;try{sr&&sr.abort()}catch{}micStream&&micStream.getTracks().forEach(t=>t.stop());micStream=null;analyser=null;talking=false;clearTimeout(ttsTimer);if('speechSynthesis'in window)speechSynthesis.cancel();$('micBtn').classList.remove('on');$('micBtn').setAttribute('aria-pressed','false');setState('standby');setCap('');startWake()}
const toggleVoice=()=>{try{Promise.resolve(voiceChat?stopVoice():startVoice()).catch(e=>toast('Errore: '+e.message))}catch(e){toast('Errore: '+e.message)}};
window.addEventListener('error',e=>toast('Errore: '+(e.message||'sconosciuto')));
$('micBtn').onclick=toggleVoice;$('coreBtn').onclick=toggleVoice;$('coreHome').onclick=toggleVoice;
function setCap(who,t){const el=$('liveCaption');if(el)el.textContent=t?who+': '+t:'Tocca la A per parlare con AIDA.'}
function afterReply(text){setCap('AIDA',text);if((data.voice.auto||voiceChat)&&'speechSynthesis'in window)speak(text);else{setState('executing');setTimeout(()=>{setState(voiceChat?'listening':'standby');if(voiceChat)startRec()},700)}}
setState('standby');

/* ===== Voce femminile ===== */
const FEM=/elsa|isabella|alice|federica|paola|carla|chiara|lucia|luciana|google italiano|female|donna|cosima|emma/i;
function itVoices(){return 'speechSynthesis'in window?speechSynthesis.getVoices().filter(v=>/^it/i.test(v.lang)):[]}
function pickVoice(){const vs=itVoices();if(data.voice.name){const m=vs.find(v=>v.name===data.voice.name);if(m)return m}return vs.find(v=>FEM.test(v.name))||vs[0]||null}
function speak(text){if(!('speechSynthesis'in window)){toast('Sintesi vocale non supportata da questo browser.');if(voiceChat)setTimeout(startRec,500);return}
const clean=String(text).replace(/[\p{Extended_Pictographic}\u200d\ufe0f*#_`]/gu,'').trim();if(!clean){if(voiceChat)setTimeout(startRec,300);return}
speechSynthesis.cancel();const parts=clean.match(/[^.!?\n]+[.!?]*\s*/g)||[clean],v=pickVoice();let fin=false;talking=true;
const done=()=>{if(fin)return;fin=true;clearTimeout(ttsTimer);talking=false;if(voiceChat)setTimeout(startRec,350);else{setState('standby');startWake()}};
ttsTimer=setTimeout(done,Math.max(5000,clean.length*120+4000));
setTimeout(()=>{parts.forEach((p,i)=>{const u=new SpeechSynthesisUtterance(p);if(v){u.voice=v;u.lang=v.lang}else u.lang='it-IT';u.pitch=data.voice.pitch;u.rate=data.voice.rate;
if(i===0)u.onstart=()=>{setState('executing');stopWake();if(recActive)try{sr.abort()}catch{}};
if(i===parts.length-1){u.onend=done;u.onerror=e=>{if(e.error!=='canceled'&&e.error!=='interrupted')done()}}
speechSynthesis.speak(u)})},60)}
function fillVoices(){const sel=$('voiceSel'),vs=itVoices();sel.innerHTML='<option value="">Automatica (femminile se disponibile)</option>'+vs.map(v=>`<option value="${esc(v.name)}">${esc(v.name)}</option>`).join('');sel.value=data.voice.name;$('voiceHint').textContent=vs.length?vs.length+' voci italiane trovate su questo dispositivo.':'Nessuna voce italiana trovata: installa una voce italiana nelle impostazioni di sintesi vocale del dispositivo.'}
$('voiceAuto').checked=data.voice.auto;$('voicePitch').value=data.voice.pitch;$('voiceRate').value=data.voice.rate;
$('voiceAuto').onchange=e=>{data.voice.auto=e.target.checked;if(!data.voice.auto&&'speechSynthesis'in window)speechSynthesis.cancel();save()};
$('voiceSel').onchange=e=>{data.voice.name=e.target.value;save()};
$('voicePitch').oninput=e=>{data.voice.pitch=+e.target.value;localStorage.setItem(KEY,JSON.stringify(data))};
$('voiceRate').oninput=e=>{data.voice.rate=+e.target.value;localStorage.setItem(KEY,JSON.stringify(data))};
$('voiceTest').onclick=()=>speak('Ciao, sono Aida. Questa è la mia voce.');
if('speechSynthesis'in window){speechSynthesis.onvoiceschanged=fillVoices}fillVoices();

/* ===== Motore AI nel cloud (via funzione Netlify) ===== */
const API='/.netlify/functions/chat';
async function cloudFlow(){const t0=performance.now();let ttft=0;
try{const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','x-aida-code':data.ai.code||''},body:JSON.stringify({model:data.ai.model,context:memCtx(),messages:data.chat.slice(-12).map(m=>({role:m.role==='user'?'user':'assistant',content:m.text}))})});
if(!r.ok){let e='Errore '+r.status;try{e=(await r.json()).error||e}catch{}throw new Error(e)}
const m={role:'assistant',text:''};data.chat.push(m);render();const el=$('messages').lastElementChild;const rd=r.body.getReader(),dec=new TextDecoder();let buf='';
while(true){const{value,done}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});const lines=buf.split('\n');buf=lines.pop();
for(const l of lines){if(!l.startsWith('data:'))continue;const p=l.slice(5).trim();if(!p||p==='[DONE]')continue;try{const d=JSON.parse(p).choices?.[0]?.delta?.content;if(d){if(!ttft){ttft=Math.round(performance.now()-t0);setState('executing')}m.text+=d;el.textContent=m.text;setCap('AIDA',m.text);$('messages').scrollTop=$('messages').scrollHeight}}catch{}}}
if(!m.text.trim())throw new Error('Il modello non ha restituito testo.');
const tot=Math.round(performance.now()-t0);m.trace=[{n:'Invio al motore AI'+(memUsed?' + memoria ('+memUsed+' note)':''),ms:Math.max(1,ttft)},{n:'Risposta in streaming',ms:Math.max(1,tot-ttft)}];gain(2);save();
afterReply(m.text)}
catch(err){setCap('AIDA',err.message);data.chat.push({role:'assistant',text:'⚠ '+err.message+' Puoi passare a «Locale (offline)» dal menu in alto.'});save();setState('standby');if(voiceChat)setTimeout(startRec,800)}}
async function loadModels(){const sel=$('aiSel');try{const r=await fetch(API,{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();
sel.innerHTML='<option value="local">Locale (offline)</option>'+j.models.map(m=>`<option value="${esc(m.id)}">${esc(m.label)}</option>`).join('');
if(!j.models.some(m=>m.id===data.ai.model)&&data.ai.model!=='local'){data.ai.model='local';save()}sel.value=data.ai.model}catch{sel.value='local';if(data.ai.model!=='local'){data.ai.model='local'}}}
$('aiSel').onchange=e=>{data.ai.model=e.target.value;save();toast(e.target.value==='local'?'Motore locale (offline).':'Motore: '+e.target.selectedOptions[0].text)};
loadModels();

/* ===== Attivazione con «Ehi Aida» ===== */
const WAKE=/\b(?:ehi|ehy|hey|ei|ok|ciao)\b[\s,.!]*(?:aida|haida|aída|eida|ayda|ida)\b/i;
function wakeUI(on){$('wakeChip').hidden=!on}
function stopWake(){wakeActive=false;wakeUI(false);if(wr){wr.onend=wr.onerror=wr.onresult=null;try{wr.abort()}catch{}wr=null}}
function startWake(){if(!data.wake||!SR||voiceChat||wr||document.hidden)return;
const w=new SR();wr=w;w.lang='it-IT';w.continuous=true;w.interimResults=false;
w.onstart=()=>{wakeActive=true;wakeUI(true)};
w.onresult=e=>{wakeDelay=400;for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(!r.isFinal)continue;const t=r[0].transcript;if(WAKE.test(t)){onWake(t);return}}};
w.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){data.wake=false;$('voiceWake').checked=false;save();stopWake();toast('Microfono bloccato: «Ehi Aida» disattivato. Consenti il microfono per il sito.')}else if(e.error==='network'){wakeDelay=Math.min(8000,wakeDelay*2)}};
w.onend=()=>{if(wr!==w)return;wr=null;wakeActive=false;wakeUI(false);if(data.wake&&!voiceChat&&!document.hidden)setTimeout(startWake,wakeDelay)};
try{w.start()}catch{wr=null}}
function onWake(t){const m=t.match(WAKE),rest=t.slice(m.index+m[0].length).replace(/^[\s,.!?]+/,'').trim();
stopWake();unlockTTS();voiceChat=true;idle=0;$('micBtn').classList.add('on');$('micBtn').setAttribute('aria-pressed','true');
if(rest.length>2){setCap('Tu',rest);$('messageInput').value=rest;setState('thinking');$('chatForm').requestSubmit()}else{setState('listening');speak('Dimmi')}}
$('voiceWake').checked=data.wake;
$('voiceWake').onchange=e=>{if(e.target.checked&&!SR){e.target.checked=false;toast('Questo browser non supporta il riconoscimento vocale: usa Chrome.');return}
data.wake=e.target.checked;save();unlockTTS();if(data.wake){startWake();toast('Di\u2019 «Ehi Aida» mentre l\u2019app è aperta.')}else stopWake()};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopWake();else startWake()});
document.addEventListener('pointerdown',()=>startWake());
setTimeout(startWake,600);

/* ===== Abilità, installazione, PC ===== */
async function skillFlow(sk,text){const t0=performance.now();let out,ok=true;
try{out=await sk.run(text)}catch(err){ok=false;out={text:'⚠ '+(err.message||'Qualcosa è andato storto.')}}
const ms=Math.max(1,Math.round(performance.now()-t0));
addMessage('assistant',out.text,[{n:'Abilità «'+sk.name+'» · '+(ok?'verificato'+(out.source?' ('+out.source+')':''):'non verificato'),ms}]);
if(ok)gain(2);save();afterReply(out.text)}
window.AIDA_NOTIFY=msg=>{toast(msg);if('speechSynthesis'in window)speak(msg);try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch{}};
let deferredInstall=null;
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installRow').hidden=false});
window.addEventListener('appinstalled',()=>{$('installRow').hidden=true;toast('AIDA installata.')});
$('installBtn').onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();try{await deferredInstall.userChoice}catch{}deferredInstall=null;$('installRow').hidden=true};
(function(){const ua=navigator.userAgent,el=$('installHelp');
el.textContent=standalone?'AIDA è già installata su questo dispositivo.':/iPhone|iPad|iPod/.test(ua)?'iPhone/iPad: apri il sito in Safari, tocca Condividi e poi «Aggiungi alla schermata Home».':/Android/.test(ua)?'Android: in Chrome tocca ⋮ e scegli «Installa app» (se non compare il pulsante qui sopra).':'Computer: in Chrome o Edge clicca l’icona «Installa» nella barra dell’indirizzo, oppure ⋮ → «Installa AIDA».'})();
$('pcUrl').value=data.pc.url||'';
$('pcUrl').onchange=e=>{data.pc.url=e.target.value.trim();save()};
$('pcOpen').onclick=()=>{const u=($('pcUrl').value||'').trim();if(!/^https?:\/\//i.test(u)){toast('Scrivi l’indirizzo di Mark, per esempio http://192.168.1.20:8000');return}window.open(u,'_blank','noopener')};
document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.code==='Space'&&!e.repeat){e.preventDefault();toggleVoice()}});

/* ===== Memoria condivisa con l'AI e sincronizzazione (server Docker) ===== */
var memUsed=0,syncAvail=false,syncBusy=false,syncTimer=null;
function memCtx(){memUsed=0;if(!data.useMemory)return '';let out='';for(const m of data.memory){const line='- '+String(m.text).replace(/\s+/g,' ').slice(0,300)+'\n';if(out.length+line.length>1800)break;out+=line;memUsed++}return out}
window.AIDA_API={memoryAdd:t=>{data.memory.unshift({text:t,date:Date.now()})},memoryList:n=>data.memory.slice(0,n).map(m=>m.text),memoryCount:()=>data.memory.length};
$('useMemory').checked=data.useMemory;
$('useMemory').onchange=e=>{data.useMemory=e.target.checked;save();toast(data.useMemory?'Le tue note saranno inviate al modello AI con ogni messaggio.':'Memoria non condivisa con l’AI.')};
$('accessCode').value=data.ai.code||'';
$('accessCode').onchange=e=>{data.ai.code=e.target.value.trim();save()};
const SYNC_KEYS=['xp','memory','proposals','skills','projects','chat'];
const pickSync=()=>{const o={};for(const k of SYNC_KEYS)o[k]=k==='chat'?data.chat.slice(-200):data[k];return o};
const syncHash=()=>JSON.stringify(pickSync());
const syncHeaders=()=>({'content-type':'application/json','x-aida-code':data.ai.code||''});
const syncMsg=t=>{$('syncStatus').textContent=t};
function schedSync(){if(!syncAvail||!data.sync.on||syncBusy)return;if(syncHash()===data.sync.hash)return;clearTimeout(syncTimer);syncTimer=setTimeout(syncNow,1500)}
function applySync(r){for(const k of SYNC_KEYS)if(r[k]!==undefined)data[k]=r[k]}
function mergeSync(l,r){const o={xp:Math.max(l.xp||0,r.xp||0)};for(const k of ['memory','proposals','skills']){const seen=new Set(),arr=[];for(const x of [...(l[k]||[]),...(r[k]||[])]){const key=JSON.stringify(x);if(!seen.has(key)){seen.add(key);arr.push(x)}}arr.sort((a,b)=>(b.date||0)-(a.date||0));o[k]=arr}o.projects=[...new Set([...(l.projects||[]),...(r.projects||[])])];o.chat=r.chat||l.chat;return o}
async function syncNow(){if(!syncAvail||!data.sync.on||syncBusy)return;syncBusy=true;
try{const g=await fetch('/api/sync',{headers:syncHeaders(),cache:'no-store'});if(g.status===401){syncMsg('Codice di accesso errato.');return}if(!g.ok)throw new Error('http '+g.status);
const s=await g.json(),dirty=syncHash()!==data.sync.hash,remoteNewer=!!s.data&&s.updated>data.sync.updated;let push=dirty;
if(remoteNewer){if(!dirty)applySync(s.data);else{applySync(mergeSync(pickSync(),s.data));push=true}data.sync.updated=s.updated;if(!push)data.sync.hash=syncHash()}
if(push){const now=Math.max(Date.now(),(s.updated||0)+1);const p=await fetch('/api/sync',{method:'PUT',headers:syncHeaders(),body:JSON.stringify({updated:now,data:pickSync()})});
if(p.status===409){syncBusy=false;setTimeout(syncNow,800);return}if(!p.ok)throw new Error('http '+p.status);data.sync.updated=now;data.sync.hash=syncHash()}
localStorage.setItem(KEY,JSON.stringify(data));render();syncMsg('Sincronizzato · '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}))}
catch{syncMsg('Server non raggiungibile: riprovo più tardi.')}finally{syncBusy=false}}
$('syncOn').onchange=e=>{data.sync.on=e.target.checked;if(data.sync.on){data.sync.updated=0;data.sync.hash='';syncMsg('Sincronizzazione in corso…');save();syncNow()}else{syncMsg('');save()}};
fetch('/api/health',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(j=>{if(j&&j.sync){syncAvail=true;$('syncRow').hidden=false;$('syncOn').checked=data.sync.on;if(data.sync.on)syncNow()}}).catch(()=>{});
setInterval(syncNow,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncNow()});
})();
