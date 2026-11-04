/* AIDA — abilità (ispirate al sistema di skill di Mark LVI, codice originale).
   Ogni abilità si dichiara da sola: id, name, description, test(testo) e run(testo).
   Aggiungerne una = aggiungere un oggetto a questo elenco. run() restituisce {text, source}
   oppure lancia un errore: AIDA dice «verificato» solo se l'abilità ha davvero funzionato. */
(function(){
const pad=n=>String(n).padStart(2,'0');
const WMO={0:'cielo sereno',1:'prevalentemente sereno',2:'parzialmente nuvoloso',3:'coperto',45:'nebbia',48:'nebbia con brina',51:'pioviggine leggera',53:'pioviggine',55:'pioviggine intensa',61:'pioggia debole',63:'pioggia',65:'pioggia forte',71:'neve debole',73:'neve',75:'neve forte',80:'rovesci deboli',81:'rovesci',82:'rovesci violenti',95:'temporale',96:'temporale con grandine',99:'temporale con forte grandine'};
async function getJSON(url){const c=new AbortController(),t=setTimeout(()=>c.abort(),8000);try{const r=await fetch(url,{signal:c.signal});if(!r.ok)throw new Error('http '+r.status);return await r.json()}catch{throw new Error('Non riesco a collegarmi al servizio (serve internet).')}finally{clearTimeout(t)}}
const PCT=/^(\d+(?:\.\d+)?)\s*%\s*di\s*(\d+(?:\.\d+)?)$/;
const calcNorm=t=>t.toLowerCase().replace(/^(quanto fa|calcola|risultato di)\s*/,'').replace(/[x×]/g,'*').replace(/÷/g,'/').replace(/,/g,'.').replace(/\?$/,'').trim();

window.AIDA_SKILLS=[
{id:'ora',name:'Orologio',description:"Dice ora e data dall'orologio del dispositivo.",
 test:t=>/\b(che ore sono|che ora (?:è|e)|ora attuale|che giorno (?:è|e)|data di oggi|che data)\b/i.test(t),
 run:async()=>{const d=new Date();return{text:`Sono le ${pad(d.getHours())}:${pad(d.getMinutes())} di ${d.toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}.`,source:'orologio del dispositivo'}}},

{id:'calcolo',name:'Calcolatrice',description:'Risolve operazioni come «quanto fa 12*7+3» o «15% di 80».',
 test:t=>{const e=calcNorm(t);if(PCT.test(e))return true;return /^[\d\s+\-*/().%]+$/.test(e)&&/\d\s*[+\-*/%]\s*[\d(]/.test(e)&&!/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(e)},
 run:async t=>{const pm=calcNorm(t).match(PCT);if(pm){const r=+(parseFloat(pm[1])*parseFloat(pm[2])/100).toFixed(10);return{text:`${pm[1]}% di ${pm[2]} = ${r}`,source:'calcolo locale'}}const e=calcNorm(t).replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');let v;try{v=Function('"use strict";return ('+e+')')()}catch{throw new Error('Non riesco a calcolare questa espressione.')}
  if(typeof v!=='number'||!isFinite(v))throw new Error('Il risultato non è un numero valido.');return{text:`${calcNorm(t)} = ${+v.toFixed(10)}`,source:'calcolo locale'}}},

{id:'timer',name:'Timer',description:'Avvisa dopo un tempo: «timer 10 minuti», «ricordami di bere tra 2 ore». Suona solo finché AIDA è aperta.',
 test:t=>/\b(timer|avvisami|ricordami|promemoria)\b/i.test(t)&&/\d+(?:[.,]\d+)?\s*(second\w*|sec\b|minut\w*|min\b|or[ae]\b|h\b)/i.test(t),
 run:async t=>{const m=t.match(/(\d+(?:[.,]\d+)?)\s*(second\w*|sec\b|minut\w*|min\b|or[ae]\b|h\b)/i);const n=parseFloat(m[1].replace(',','.')),u=m[2].toLowerCase();
  const sec=n*(u.startsWith('s')?1:u.startsWith('m')?60:3600);if(!(sec>0)||sec>21600)throw new Error('Posso impostare timer da 1 secondo a 6 ore.');
  const lab=(t.match(/ricordami di (.+?)(?:\s+(?:tra|fra|fra)\b|$)/i)||[])[1];const msg=lab?`Promemoria: ${lab}.`:'Il timer è scaduto.';
  setTimeout(()=>window.AIDA_NOTIFY&&window.AIDA_NOTIFY(msg),sec*1000);
  const txt=sec<90?(Math.round(sec)===1?'1 secondo':Math.round(sec)+' secondi'):sec<5400?Math.round(sec/60)+' minuti':(sec/3600).toFixed(1).replace('.0','')+' ore';
  return{text:`Fatto: ti avviso tra ${txt}. Funziona finché AIDA resta aperta.`,source:'timer del dispositivo'}}},

{id:'meteo',name:'Meteo',description:'Meteo attuale e di oggi per una città: «meteo a Roma».',
 test:t=>/\b(meteo|che tempo fa|previsioni|che temperatura|piove|pioverà)\b/i.test(t),
 run:async t=>{const m=t.match(/\b(?:a|ad|di|su|in|per)\s+([\p{L}'’ -]{2,40}?)\s*(?:\b(?:oggi|domani|adesso|ora|stasera|stamattina)\b|[?.!]*$)/iu);
  let city=m?m[1].replace(/^(domani|oggi|stasera)\s+(?:a|ad|in|su)\s+/i,'').trim():'';
  if(!city||/^(oggi|domani|stasera|adesso|ora)$/i.test(city))throw new Error('Di quale città vuoi il meteo? Scrivi per esempio «meteo a Roma».');
  const g=await getJSON('https://geocoding-api.open-meteo.com/v1/search?count=1&language=it&name='+encodeURIComponent(city));
  const p=g.results&&g.results[0];if(!p)throw new Error(`Non trovo la città «${city}».`);
  const w=await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`);
  const c=w.current,d=w.daily;if(!c||!d)throw new Error('Il servizio meteo non ha risposto come previsto.');
  const R=x=>Math.round(x);return{text:`A ${p.name}${p.country?' ('+p.country+')':''} ora ci sono ${R(c.temperature_2m)}° (percepiti ${R(c.apparent_temperature)}°), ${WMO[c.weather_code]||'condizioni variabili'}, vento ${R(c.wind_speed_10m)} km/h. Oggi: minima ${R(d.temperature_2m_min[0])}°, massima ${R(d.temperature_2m_max[0])}°, probabilità di pioggia ${d.precipitation_probability_max[0]??'n.d.'}%.`,source:'Open-Meteo'}}}
,{id:'memoria',name:'Memoria',description:'«Ricorda che…» salva una nota; «cosa ricordi?» le elenca.',
 test:t=>/^\s*(?:aida[,\s]+)?(?:ricorda(?:ti)?|memorizza|segna)(?:\s+(?:che|di))?\s+\S.{2,}/i.test(t)||/\b(cosa ricordi|cosa sai di me|che cosa hai in memoria|mostrami la memoria)\b/i.test(t),
 run:async t=>{const api=window.AIDA_API;if(!api)throw new Error('La memoria non è disponibile.');
  if(/\b(cosa ricordi|cosa sai di me|che cosa hai in memoria|mostrami la memoria)\b/i.test(t)){const l=api.memoryList(5);return l.length?{text:`Ho ${api.memoryCount()} ${api.memoryCount()===1?'nota':'note'}. Le ultime: `+l.map((x,i)=>`${i+1}) ${x}`).join('; ')+'.',source:'memoria locale'}:{text:'La memoria è ancora vuota. Dimmi «ricorda che…» per salvare qualcosa.',source:'memoria locale'}}
  const note=t.replace(/^\s*(?:aida[,\s]+)?(?:ricorda(?:ti)?|memorizza|segna)(?:\s+(?:che|di))?\s+/i,'').trim();api.memoryAdd(note);return{text:`Ho salvato: «${note}».`,source:'memoria locale'}}}
];
})();
