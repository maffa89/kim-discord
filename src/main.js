import { DiscordSDK } from '@discord/embedded-app-sdk';
import './style.css';

const CLIENT_ID = '1550179525806264400';
const BASE = import.meta.env.BASE_URL;
const asset = (path) => `${BASE}${path.replace(/^\//, '')}`;

const app = document.querySelector('#app');
app.innerHTML = `
<main class="shell">
  <header><div class="brand"><img src="${asset('icon128.png')}"><div><h1>KIM</h1><p id="clock">Norsk tid</p></div></div><span class="live">● LIVE</span></header>
  <section class="hero">
    <div class="portrait"><img id="kimImage" src="${asset('images/kim-state-1.png')}"><div id="sleep" class="sleep">Zzz</div></div>
    <div class="status"><div class="eyebrow">KIM SIN PROMILLE</div><div class="bac"><span id="bac">0,2</span><small>‰</small></div><div id="label" class="label">Rolig</div><p id="desc"></p></div>
  </section>
  <section class="meter"><div class="meterTop"><span>12:00</span><b id="timeLabel">--:--</b><span>01:30</span></div><div class="track"><div id="fill" class="fill"></div><i id="pin"></i></div></section>
  <section class="cards"><div><span>AIM ACCURACY</span><strong id="aim">95%</strong><div class="aimbar"><i id="aimfill"></i></div></div><div><span>TILSTAND</span><strong id="state">Rolig</strong><small id="sleepWarning"></small></div></section>
  <section class="states"><img src="${asset('images/kim-state-1.png')}"><img src="${asset('images/kim-state-2.png')}"><img src="${asset('images/kim-state-3.png')}"><img src="${asset('images/kim-state-4.png')}"><img src="${asset('images/kim-state-5.png')}"></section>
</main>`;

function osloParts(){
  const parts = new Intl.DateTimeFormat('nb-NO',{timeZone:'Europe/Oslo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
  return Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
}
function minutesInWindow(h,m){ let n=h*60+m; if(n<120) n+=1440; return n; }
function bacAt(min){
  if(min < 720 || min > 1530) return null;
  if(min <= 1080) return .2 + ((min-720)/360)*.6;
  return .8 + ((min-1080)/450)*2.0;
}
function dataFor(bac,min){
  if(min>=1350) return {img:5,label:'Søvnig',desc:'Tydelig sløv og fare for å sovne.',aim:18,state:'Fare for å sovne'};
  if(bac>=2.0) return {img:4,label:'Irritert / sløv',desc:'Mindre smil og tydelig redusert reaksjon.',aim:30,state:'Tydelig påvirket'};
  if(bac>=1.4) return {img:3,label:'Humøret snur',desc:'Smilet blir gradvis mindre og uttrykket mer irritert.',aim:46,state:'Påvirket'};
  if(bac>=.8) return {img:2,label:'Godt humør',desc:'Mer smil og sosialt uttrykk frem mot ca. 1,4 ‰.',aim:66,state:'Sosial'};
  return {img:1,label:'Rolig',desc:'Rolig smil og relativt opplagt uttrykk.',aim:90,state:'Opplagt'};
}
function update(){
  const p=osloParts(), h=+p.hour,m=+p.minute,min=minutesInWindow(h,m), bac=bacAt(min);
  document.querySelector('#clock').textContent=`Norsk tid · ${p.hour}:${p.minute}`;
  document.querySelector('#timeLabel').textContent=`${p.hour}:${p.minute}`;
  if(bac===null){ document.querySelector('#bac').textContent='—'; document.querySelector('#label').textContent='Utenfor tidslinjen'; document.querySelector('#desc').textContent='Visningen er aktiv fra 12:00 til 01:30.'; return; }
  const d=dataFor(bac,min), progress=Math.max(0,Math.min(100,(min-720)/(1530-720)*100));
  document.querySelector('#bac').textContent=bac.toFixed(2).replace('.',',');
  document.querySelector('#kimImage').src=asset(`images/kim-state-${d.img}.png`);
  document.querySelector('#label').textContent=d.label; document.querySelector('#desc').textContent=d.desc;
  document.querySelector('#aim').textContent=`${d.aim}%`; document.querySelector('#aimfill').style.width=`${d.aim}%`;
  document.querySelector('#state').textContent=d.state; document.querySelector('#fill').style.width=`${progress}%`; document.querySelector('#pin').style.left=`${progress}%`;
  const sleepy=min>=1350; document.querySelector('#sleep').classList.toggle('show',sleepy); document.querySelector('#sleepWarning').textContent=sleepy?'Etter 22:30: fare for å sovne':'';
}

update();
setInterval(update,30000);

// The Embedded App SDK is only initialized when KIM is actually embedded in Discord.
// This keeps the normal GitHub Pages URL usable as a standalone preview.
if (window.self !== window.top) {
  try {
    const discordSdk = new DiscordSDK(CLIENT_ID);
    discordSdk.ready().catch((error) => console.info('Discord SDK not ready yet.', error));
  } catch (error) {
    console.info('KIM preview running without Discord SDK.', error);
  }
}
