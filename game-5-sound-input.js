'use strict';
/* 우리 둘의 꽃집 — 5-sound-input.js : 배경음악·효과음·조이콘·설정·튜토리얼
   (파일은 index.html 에 적힌 순서대로 불러와요. 앞 파일의 함수·변수를 뒤 파일이 이어서 씀) */
/* ---------- sound ---------- */
const AU={ctx:null,music:null,sfx:null,next:0,step:0,timer:null,lastRing:0};
/* =========================================================
   배경음악 v2 — 코드로 만드는 잔잔한 음악 + 자연 소리
   · 부드러운 피아노(펠트 느낌) + 따뜻한 패드 + 가끔 기타 아르페지오, 방 울림(리버브)
   · 코드 진행과 멜로디는 그때그때 만들어져서 매번 조금씩 달라요
   · 아침/낮/저녁·장소(가게·마을·꽃시장·언덕길)에 따라 분위기가 바뀜
   · 자연 소리: 바람, 새소리(낮), 물소리(강가), 풀벌레(저녁)
   ========================================================= */
const MF=n=>440*Math.pow(2,(n-69)/12);
const BGM={bus:null,wet:null,amb:null,noise:null,wind:null,water:null,next:0,beat:0,bar:0,prog:0,motif:null,birdT:0,crkT:0};
function audioInit(){
  if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  const c=AU.ctx=new C();AU.music=c.createGain();AU.sfx=c.createGain();
  const comp=c.createDynamicsCompressor();AU.music.connect(comp);AU.sfx.connect(comp);comp.connect(c.destination);
  // 음악 버스: 부드럽게 깎고(로우패스) 방 울림을 섞음
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;BGM.bus=c.createGain();BGM.bus.gain.value=1;BGM.bus.connect(lp);lp.connect(AU.music);
  const conv=c.createConvolver();conv.buffer=bgmImpulse(c,2.6);BGM.wet=c.createGain();BGM.wet.gain.value=.32;BGM.bus.connect(conv);conv.connect(BGM.wet);BGM.wet.connect(AU.music);
  // 자연 소리 버스
  BGM.amb=c.createGain();BGM.amb.gain.value=1;BGM.amb.connect(AU.music);
  BGM.noise=bgmNoise(c,4);
  BGM.wind=bgmLoop(c,'lowpass',380,.7);BGM.water=bgmLoop(c,'bandpass',900,1.4);
  applyVolume();BGM.next=c.currentTime+.3;AU.timer=setInterval(schedMusic,100);setInterval(schedAmbience,250);
}
function applyVolume(){if(!AU.ctx)return;AU.music.gain.value=SET.music*.42;AU.sfx.gain.value=SET.sfx*.6}
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,audioInit,{passive:true}));
function tone(f,t,d,type,vol,dest,att){
  const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+(att||.012));g.gain.exponentialRampToValueAtTime(.0005,t+d);
  o.connect(g);g.connect(dest||AU.sfx);o.start(t);o.stop(t+d+.05);return o;
}
function bgmImpulse(c,sec){const n=Math.floor(c.sampleRate*sec),b=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++){const t=i/n;d[i]=(Math.random()*2-1)*Math.pow(1-t,2.6)*(t<.01?t*100:1)}}return b}
function bgmNoise(c,sec){const n=Math.floor(c.sampleRate*sec),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.5}return b}
function bgmLoop(c,type,f,q){const s=c.createBufferSource();s.buffer=BGM.noise;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=c.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(BGM.amb);s.start();return {g,fl}}
/* 악기 */
function pianoNote(n,t,vel,len){const c=AU.ctx,f=MF(n),g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(Math.min(6000,f*6),t);lp.frequency.exponentialRampToValueAtTime(Math.max(400,f*1.6),t+len);
  const o1=c.createOscillator(),o2=c.createOscillator(),o3=c.createOscillator();o1.type='triangle';o2.type='sine';o3.type='sine';o1.frequency.value=f;o2.frequency.value=f*2.001;o3.frequency.value=f*.999;
  const g2=c.createGain();g2.gain.value=.25;o2.connect(g2);g2.connect(lp);o1.connect(lp);o3.connect(lp);lp.connect(g);g.connect(BGM.bus);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+.008);g.gain.exponentialRampToValueAtTime(vel*.35,t+.35);g.gain.exponentialRampToValueAtTime(.0004,t+len);
  [o1,o2,o3].forEach(o=>{o.start(t);o.stop(t+len+.05)})}
function padChord(ns,t,len,vol){const c=AU.ctx,lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.Q.value=.3;const g=c.createGain();lp.connect(g);g.connect(BGM.bus);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+len*.35);g.gain.linearRampToValueAtTime(vol*.8,t+len*.75);g.gain.linearRampToValueAtTime(0,t+len+.6);
  ns.forEach((n,k)=>[-6,6].forEach(dt=>{const o=c.createOscillator();o.type='sawtooth';o.frequency.value=MF(n);o.detune.value=dt;const og=c.createGain();og.gain.value=.12/ns.length;o.connect(og);og.connect(lp);o.start(t);o.stop(t+len+.7)}))}
function pluck(n,t,vel){const c=AU.ctx,f=MF(n),o=c.createOscillator(),bp=c.createBiquadFilter(),g=c.createGain();o.type='triangle';o.frequency.value=f;bp.type='lowpass';bp.frequency.setValueAtTime(f*5,t);bp.frequency.exponentialRampToValueAtTime(f*1.2,t+.4);
  o.connect(bp);bp.connect(g);g.connect(BGM.bus);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel,t+.004);g.gain.exponentialRampToValueAtTime(.0004,t+1.2);o.start(t);o.stop(t+1.3)}
/* 곡 재료: 7화음·9화음 위주의 포근한 진행 */
const PROGS=[
  [[48,55,59,64,67],[45,52,55,60,64],[41,48,52,57,64],[43,50,55,57,62]],   // Cmaj7 Am7 Fmaj7 G6
  [[41,48,52,57,60],[40,47,50,55,59],[38,45,48,53,57],[43,50,53,55,60]],   // Fmaj7 Em7 Dm7 G7sus
  [[48,55,57,62,64],[43,50,55,59,62],[45,52,55,60,64],[41,48,53,57,60]],   // C6/9 G Am7 F
  [[45,52,55,60,64],[41,48,52,57,60],[48,55,59,62,64],[43,50,55,59,62]]    // Am7 Fmaj7 Cmaj9 G
];
const SCALE=[60,62,64,67,69,72,74,76,79,81];
function bgmMood(){ // 장소·시간 분위기
  const area=S.chars&&S.chars[0]?S.chars.map(c=>c.area):['shop'];const t=S.phase==='play'?S.t:120;
  const out=area.some(a=>a!=='shop'&&a!=='supply'),eve=t>=450,morn=t<150,north=area.includes('north'),market=area.includes('market');
  return {out,eve,morn,north,market,tempo:eve?60:morn?72:68}}
function schedMusic(){
  if(!AU.ctx||SET.music<=0)return;const c=AU.ctx;const M=bgmMood();const spb=60/M.tempo/2; // 8분음표
  while(BGM.next<c.currentTime+.5){
    const t=BGM.next,e=BGM.beat%8;
    if(e===0){ // 새 마디
      if(BGM.bar%4===0){BGM.prog=Math.floor(Math.random()*PROGS.length);if(Math.random()<.5||!BGM.motif)BGM.motif=Array.from({length:4},()=>Math.floor(Math.random()*6))}
      const ch=PROGS[BGM.prog][BGM.bar%4],low=M.eve?-12:0;
      pianoNote(ch[0]-12+low,t,.16,3.4);                                 // 베이스
      padChord(ch.slice(1).map(n=>n+(M.eve?-12:0)),t,spb*8,M.eve?.09:M.north?.08:.05);
      if(!M.eve||Math.random()<.5)[1,2,3].forEach((k,j)=>pianoNote(ch[k]+low+12,t+.03+j*.012,.05,2.6)); // 부드러운 화음
    }
    const ch=PROGS[BGM.prog][BGM.bar%4];
    // 아르페지오(아침·시장은 기타, 저녁엔 드물게)
    if(!M.eve&&(M.morn||M.market?true:e%2===0)&&Math.random()<(M.market?.8:.55)){const pat=[1,2,3,4,3,2,3,4][e];pluck(ch[Math.min(pat,ch.length-1)]+12,t,.06)}
    else if(M.eve&&e%4===2&&Math.random()<.5)pianoNote(ch[3]+12,t,.05,2.8);
    // 멜로디: 동기(motif)를 조금씩 바꿔 반복, 쉼표를 넉넉히
    const play=(e===0||e===3||e===4||(e===6&&Math.random()<.5))&&Math.random()<(M.eve?.45:.7);
    if(play){const idx=(BGM.motif[(e>>1)%4]+(BGM.bar%2?Math.floor(Math.random()*2):0))%SCALE.length;let n=SCALE[idx]+(M.eve?-12:0);
      if(Math.random()<.18)n+=2;pianoNote(n,t+(Math.random()*.02),M.eve?.08:.1,M.eve?3.2:2.2)}
    BGM.next+=spb*(1+(e%2?-.04:.04));BGM.beat++;if(BGM.beat%8===0)BGM.bar++;
  }
}
/* 자연 소리 */
function schedAmbience(){
  if(!AU.ctx)return;const c=AU.ctx,now=c.currentTime,M=bgmMood(),on=SET.music>0&&S.phase==='play';
  const area=(S.chars||[]).map(ch=>ch.area);const river=area.includes('town')||area.includes('north');
  const wind=on&&M.out?(M.north?.16:.09)*(.7+.3*Math.sin(now*.23)):on?.02:0;
  BGM.wind.g.gain.setTargetAtTime(wind,now,1.2);BGM.wind.fl.frequency.setTargetAtTime(320+120*Math.sin(now*.17),now,1);
  BGM.water.g.gain.setTargetAtTime(on&&river?.05+.02*Math.sin(now*.5):0,now,1.5);
  // 새소리(낮·바깥)
  if(on&&M.out&&!M.eve&&now>BGM.birdT){BGM.birdT=now+2+Math.random()*6;const base=2600+Math.random()*1800,n=2+Math.floor(Math.random()*4);
    for(let k=0;k<n;k++){const t=now+.05+k*(.09+Math.random()*.06),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(base*(1+Math.random()*.2),t);o.frequency.exponentialRampToValueAtTime(base*(Math.random()<.5?1.35:.8),t+.07);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.025,t+.01);g.gain.exponentialRampToValueAtTime(.0004,t+.09);o.connect(g);g.connect(BGM.amb);o.start(t);o.stop(t+.12)}}
  // 풀벌레(저녁·바깥)
  if(on&&M.out&&M.eve&&now>BGM.crkT){BGM.crkT=now+.8+Math.random()*1.6;const f=4200+Math.random()*600;
    for(let k=0;k<3;k++){const t=now+k*.07,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.012,t+.01);g.gain.exponentialRampToValueAtTime(.0003,t+.05);o.connect(g);g.connect(BGM.amb);o.start(t);o.stop(t+.07)}}
}

function sfx(name){
  if(!AU.ctx||SET.sfx<=0)return;const t=AU.ctx.currentTime;
  switch(name){
    case 'tap':tone(880,t,.08,'sine',.25);break;
    case 'blip':tone(560+Math.random()*260,t,.045,'sine',.07);break;
    case 'open':tone(660,t,.1,'sine',.22);tone(990,t+.05,.12,'sine',.18);break;
    case 'close':tone(700,t,.08,'sine',.18);tone(520,t+.05,.1,'sine',.15);break;
    case 'coin':[1318,1760].forEach((f,k)=>tone(f,t+k*.08,.25,'triangle',.25));break;
    case 'buy':[784,988,1175].forEach((f,k)=>tone(f,t+k*.06,.18,'triangle',.2));break;
    case 'snip':{const c=AU.ctx,n=c.createBufferSource(),b=c.createBuffer(1,c.sampleRate*.08,c.sampleRate),d=b.getChannelData(0);for(let k=0;k<d.length;k++)d[k]=(Math.random()*2-1)*(1-k/d.length);n.buffer=b;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=2500;const g=c.createGain();g.gain.value=.35;n.connect(f);f.connect(g);g.connect(AU.sfx);n.start(t);break}
    case 'water':{const c=AU.ctx,n=c.createBufferSource(),b=c.createBuffer(1,c.sampleRate*.6,c.sampleRate),d=b.getChannelData(0);for(let k=0;k<d.length;k++)d[k]=(Math.random()*2-1)*Math.sin(Math.PI*k/d.length);n.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1800;f.Q.value=.8;const g=c.createGain();g.gain.value=.3;n.connect(f);f.connect(g);g.connect(AU.sfx);n.start(t);break}
    case 'door':tone(1046,t,.5,'sine',.18);tone(1318,t+.12,.6,'sine',.14);break;
    case 'bell':tone(1568,t,.7,'sine',.14);tone(2093,t+.1,.6,'sine',.1);break;
    case 'ring':[0,.12,.24,.36].forEach(d=>tone(1200,t+d,.08,'square',.06));break;
    case 'no':tone(330,t,.15,'triangle',.2);tone(262,t+.08,.18,'triangle',.18);break;
    case 'nav':tone(1200,t,.04,'sine',.1);break;
  }
}

/* ---------- gamepad ---------- */
const GP={pads:{},calib:null,ctxFocus:{},repeat:{}};
function padKey(gp){return gp.id+'#'+gp.index}
function isJoy(id){return /joy-?con|057e.*200[67]/i.test(id)}
function joySide(id){if(/\(L\)|left|2006/i.test(id)&&!/\(R\)|right|2007/i.test(id))return 'L';if(/\(R\)|right|2007/i.test(id)&&!/\(L\)|left|2006/i.test(id))return 'R';return null}
function autoMap(gp){
  if(gp.mapping==='standard')return {act:[1,3],back:[0],menu:[9,8,16],swap:[2,4,5,6,7]};
  return {act:[0,1,2,3],back:[10,11],menu:[8,9,12,13,16],swap:[4,5,6,7,14,15]};
}
function mapOf(gp){const m=SET.pads[gp.id];if(m)return {cal:m,act:[m.act],back:[m.back],menu:[m.menu],swap:[m.swap]};return autoMap(gp)}
function hatVec(v){if(v>1.05||v<-1.05)return [0,0];const k=Math.round((v+1)/(2/7))%8;const ang=-Math.PI/2+k*Math.PI/4;return [Math.round(Math.cos(ang)*100)/100,Math.round(Math.sin(ang)*100)/100]}
function rotSide(v,side){if(!side)return v;const [x,y]=v;return side==='L'?[y,-x]:[-y,x]}
function padVec(gp,st,sideways){
  const m=mapOf(gp),ax=gp.axes;
  if(m.cal){const c=m.cal;if(c.hat!=null){const v=hatVec(ax[c.hat]);return c.rot?(c.rot>0?[-v[1],v[0]]:[v[1],-v[0]]):v}let x=(ax[c.x.a]||0)*c.x.s,y=(ax[c.y.a]||0)*c.y.s;return Math.hypot(x,y)<.22?[0,0]:[clamp(x,-1,1),clamp(y,-1,1)]}
  if(!st.base){st.base=ax.map(v=>v)}
  let best=[0,0],bm=0;
  for(let a=0;a+1<Math.min(ax.length,4);a+=2){if(Math.abs(st.base[a])>.6||Math.abs(st.base[a+1])>.6)continue;const x=ax[a],y=ax[a+1],mg=Math.hypot(x,y);if(mg>.28&&mg>bm){bm=mg;best=[x,y]}}
  for(let a=0;a<ax.length;a++){if(Math.abs(st.base[a])<1.05)continue;const h=hatVec(ax[a]);if((h[0]||h[1])&&bm<1){bm=1;best=h}}
  const b=k=>gp.buttons[k]&&gp.buttons[k].pressed;
  if(gp.mapping==='standard'&&(b(12)||b(13)||b(14)||b(15))){best=[(b(15)?1:0)-(b(14)?1:0),(b(13)?1:0)-(b(12)?1:0)];bm=1}
  let v=[clamp(best[0],-1,1),clamp(best[1],-1,1)];
  if(sideways&&gp.mapping!=='standard'&&isJoy(gp.id))v=rotSide(v,joySide(gp.id));
  return v;
}
function padsList(){const out=[];const arr=navigator.getGamepads?navigator.getGamepads():[];for(const gp of arr){if(gp&&gp.connected)out.push(gp)}return out}
function slotOf(gp){
  const k=gp.id;if(SET.assign[k]!=null)return SET.assign[k];
  const sd=joySide(k);if(sd==='L')return 0;if(sd==='R')return 1;
  const list=padsList();return list.indexOf(gp)>0?1:0;
}
const PADVEC=[[0,0],[0,0]];let TOUCH_MODE=false;
/* ---- 조이콘 배치: 스틱 방향은 실측값 기준 (가로로 쥔 조이콘) ---- */
function isCombo(id){return /l\s*\+\s*r|200e/i.test(id)}
function stickVec(x,y){const m=Math.hypot(x,y);if(m<.28)return [0,0];const k=Math.min(1,(m-.28)/.62)/m;return [x*k,y*k]}
function sideSlot(side){const sw=!!SET.swapSides;return side==='L'?(sw?1:0):(sw?0:1)}
function padUnits(gp){
  const ax=gp.axes,duo=S.mode==='duo',id=gp.id;
  if(isCombo(id)){
    if(duo)return [
      {side:'L',slot:sideSlot('L'),vec:stickVec(ax[1]||0,-(ax[0]||0)),btn:{act:[12,13,14,15],back:[8,4,6],menu:[10],swap:[]}},
      {side:'R',slot:sideSlot('R'),vec:stickVec(-(ax[3]||0),ax[2]||0),btn:{act:[0,1,2,3],back:[9,5,7],menu:[11],swap:[]}}];
    return [{side:'LR',slot:S.active,vec:stickVec(ax[0]||0,ax[1]||0),btn:{act:[1,3],back:[0],menu:[9,8],swap:[2,4,5]}}];
  }
  const sd=isJoy(id)?joySide(id):null;
  if(sd&&duo)return [{side:sd,slot:sideSlot(sd),vec:sd==='L'?stickVec(ax[1]||0,-(ax[0]||0)):stickVec(-(ax[1]||0),ax[0]||0),btn:{act:[0,1,2,3,12,13,14,15],back:[8,9],menu:[10,11,16],swap:[]}}];
  const m=autoMap(gp);return [{side:'X',slot:duo?slotOf(gp):S.active,vec:stickVec(ax[0]||0,ax[1]||0),btn:{act:m.act,back:m.back,menu:m.menu,swap:m.swap}}];
}
function applyPadBinds(gp,u){
  const p=u.slot,K=SET.keys[S.mode==='duo'?p:(u.side==='R'?1:0)]||{},own={};let any=false;
  for(const [fn] of BFN){const b=K[fn];if(b&&b.t==='p'&&b.id===gp.id){own[fn]=[b.b];any=true}}
  if(!any)return u.btn;const out={act:[],back:[],menu:[],swap:[]};Object.assign(out,own);return out;
}
/* ---------- 토토 (마을 고양이) ---------- */
const CAT_LINES=['냐아~ (꼬리를 살랑살랑 흔들어요)','미야옹? (노란 눈을 동그랗게 떠요)','골골골… (다리에 몸을 비벼요)','냥! (앞발로 신발을 톡톡 건드려요)','먀아아~ (배를 보이며 뒹굴어요)','냥냥. (햇볕 좋은 자리를 알려주려는 것 같아요)','…냐. (하품을 크게 하고 눈을 깜빡여요)','미야~ 냐냐! (오늘 누가 간식을 줬나 봐요. 기분이 아주 좋아요)'];
function makeCat(){if(S.cat&&S.cat.day===S.day)return;S.cat={kind:'cat',name:'토토',x:8.5*TILE,y:7.2*TILE,tx:8.5*TILE,ty:7.2*TILE,dir:'down',walk:0,state:'sit',timer:3,day:S.day,talking:false,hearts:0}}
function catSpot(){for(let n=0;n<30;n++){const x=rnd(2,56)*TILE,y=rnd(6.4,26)*TILE;if(!blocked('town',x,y))return [x,y]}return [8*TILE,7*TILE]}
function updateCat(dt){
  const c=S.cat;if(!c)return;c.mv=false;
  if(c.talking){c.state='sit';return}
  c.timer-=dt;
  if(c.state==='walk'){const dx=c.tx-c.x,dy=c.ty-c.y,d=Math.hypot(dx,dy);if(d<3||c.timer<=0){c.state=pick(['sit','sit','groom','sleep','sit']);c.timer=c.state==='sleep'?rnd(12,25):rnd(4,9);return}
    if(!c.route){const r=navRoute('town',c.x,c.y,c.tx,c.ty);if(!r){c.timer=0;return}c.route=r.pts.concat([r.end]);[c.tx,c.ty]=r.end}
    const [wx,wy]=c.route[0]||[c.tx,c.ty];const ex=wx-c.x,ey=wy-c.y,ed=Math.hypot(ex,ey)||1,sp=22*dt;
    if(ed<=sp){c.x=wx;c.y=wy;c.route.shift();if(!c.route.length){c.route=null;c.tx=c.x;c.ty=c.y}}else{c.x+=ex/ed*sp;c.y+=ey/ed*sp}
    c.mv=true;c.walk+=dt*10;c.dir=Math.abs(ex)>Math.abs(ey)?(ex>0?'right':'left'):(ey>0?'down':'up')}
  else if(c.timer<=0){c.state='walk';const near=S.walkers.filter(w=>!w.hidden&&w.zone!=='north'&&w.zone!=='yard'&&Math.random()<.35);const t=near.length&&Math.random()<.4?pick(near):null;[c.tx,c.ty]=t?[t.x+8,t.y+4]:catSpot();c.route=null;c.timer=rnd(10,20)}
}
function pollPads(dt){
  let list=padsList();PADVEC[0]=[0,0];PADVEC[1]=[0,0];
  if(BIND.on){bindPoll();return}
  if(list.length)audioInit();
  if(list.some(g=>isCombo(g.id)))list=list.filter(g=>isCombo(g.id)||!isJoy(g.id));
  for(const gp of list){
    const key=padKey(gp),st=GP.pads[key]||(GP.pads[key]={prev:[],hold:{},dir:{}});if(!st.dir||typeof st.dir!=='object'){st.dir={};st.hold={}}
    const pressed=k=>gp.buttons[k]&&gp.buttons[k].pressed;
    const any=arr=>arr.some(k=>pressed(k)&&!st.prev[k]);
    if(gp.buttons.some(b=>b.pressed)&&TOUCH_MODE){TOUCH_MODE=false;updateControlVisibility()}
    if(GP.calib&&GP.calib.id===gp.id){calibStep(gp,st);st.prev=gp.buttons.map(b=>b.pressed);continue}
    for(const u of padUnits(gp)){
      const slot=u.slot,v=u.vec,B=applyPadBinds(gp,u),ctx=navContext(slot),dk=u.side;
      if(ctx){
        const d=Math.hypot(v[0],v[1])>.5?(Math.abs(v[0])>Math.abs(v[1])?(v[0]>0?'right':'left'):(v[1]>0?'down':'up')):null;
        if(d&&d!==st.dir[dk]){st.dir[dk]=d;st.hold[dk]=0;navMove(ctx,d)}else if(d){st.hold[dk]=(st.hold[dk]||0)+dt;if(st.hold[dk]>.38){st.hold[dk]=.26;navMove(ctx,d)}}else st.dir[dk]=null;
        if(any(B.act))navPress(ctx);else if(any(B.back))navBack(ctx);else if(any(B.menu))navMenu();
      }else{
        /* 두 조이콘을 함께 움직일 때 신호가 한 순간 0으로 끊기는 경우를 보정(최대 2프레임) */
        let vv=v;const pm=st.lv&&st.lv[dk]?Math.hypot(st.lv[dk][0],st.lv[dk][1]):0;st.lv=st.lv||{};st.hz=st.hz||{};
        if(vv[0]===0&&vv[1]===0&&pm>.6&&(st.hz[dk]||0)<2){st.hz[dk]=(st.hz[dk]||0)+1;vv=st.lv[dk]}else{st.hz[dk]=0;st.lv[dk]=vv}
        PADVEC[slot]=[PADVEC[slot][0]+vv[0],PADVEC[slot][1]+vv[1]];
        if(any(B.act))doAction(slot);
        else if(any(B.menu))togglePause();
        else if(S.mode==='solo'&&any(B.swap))swapChar();
        else if(any(B.back)&&S.chars[slot]&&S.chars[slot].rest)doAction(slot);
      }
    }
    st.prev=gp.buttons.map(b=>b.pressed);
  }
  if($('#diagBox'))diagRender();
}
addEventListener('gamepadconnected',e=>{audioInit();toastAll(`컨트롤러가 연결됐어요 (${shortPad(e.gamepad.id)})`);if(document.querySelector('#setPads'))showSettings(SETTINGS_FROM)});
addEventListener('gamepaddisconnected',e=>{toastAll('컨트롤러 연결이 끊겼어요')});
function shortPad(id){if(/joy-?con\s*l\s*\+\s*r|200e/i.test(id))return '조이콘 L+R 한 쌍';if(/\(L\)|2006/.test(id))return '조이콘 왼쪽';if(/\(R\)|2007/.test(id))return '조이콘 오른쪽';if(/pro controller|2009/i.test(id))return '프로 컨트롤러';return id.replace(/\(.*?\)/g,'').slice(0,24)}

/* menu navigation */
function navContext(i){
  if(!$('#screen').classList.contains('hidden'))return {el:$('#screen'),key:'screen'};
  if($('#orderPop').classList.contains('open'))return {el:$('#orderPop'),key:'pop'};
  const c=S.chars[i];if(S.phase==='play'&&c&&c.modal)return {el:modalEl(i),key:'m'+i,i};
  return null;
}
function navItems(el){return Array.from(el.querySelectorAll('button:not([disabled]),input,.chip')).filter(b=>b.offsetParent!==null&&b.getBoundingClientRect().width>0)}
function focusKey(b){return b.dataset.a?`[data-a="${b.dataset.a}"]${b.dataset.v!=null?`[data-v="${CSS.escape?CSS.escape(b.dataset.v):b.dataset.v}"]`:''}`:(b.id?'#'+b.id:null)}
function setFocus(ctx,b){ctx.el.querySelectorAll('.gfocus').forEach(x=>x.classList.remove('gfocus'));if(!b){hideTip();return}b.classList.add('gfocus');showTip(b);GP.ctxFocus[ctx.key]=focusKey(b);try{b.scrollIntoView({block:'nearest',inline:'nearest'})}catch(e){}}
function curFocus(ctx){let b=ctx.el.querySelector('.gfocus');if(b&&b.offsetParent)return b;const k=GP.ctxFocus[ctx.key];if(k){try{b=ctx.el.querySelector(k)}catch(e){b=null}if(b&&!b.disabled)return b}return null}
function navMove(ctx,dir){
  const items=navItems(ctx.el);if(!items.length)return;let cur=curFocus(ctx);
  if(!cur){setFocus(ctx,items.find(b=>b.dataset.a!=='close')||items[0]);sfx('nav');return}
  const r=cur.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let best=null,bs=1e9;
  for(const b of items){if(b===cur)continue;const q=b.getBoundingClientRect(),x=q.left+q.width/2,y=q.top+q.height/2,dx=x-cx,dy=y-cy;
    let main,off;if(dir==='right'){main=dx;off=Math.abs(dy)}else if(dir==='left'){main=-dx;off=Math.abs(dy)}else if(dir==='down'){main=dy;off=Math.abs(dx)}else{main=-dy;off=Math.abs(dx)}
    if(main<=4)continue;const sc=main+off*2.2;if(sc<bs){bs=sc;best=b}}
  if(best){setFocus(ctx,best);sfx('nav')}
}
function navPress(ctx){if(ctx.key.startsWith('m')&&S.chars[ctx.i].modal&&S.chars[ctx.i].modal.type==='talk'&&!S.chars[ctx.i].modal.choose){if(talkSkip(ctx.i))return;talkNext(ctx.i);return}let b=curFocus(ctx);if(!b){b=ctx.el.querySelector('button.primary:not([disabled])');if(!b){navMove(ctx,'down');return}}if(b.tagName==='INPUT'){b.focus();return}b.dispatchEvent(new MouseEvent('click',{bubbles:true}));if(ctx.key.startsWith('m'))modalEl(ctx.i).dataset.t=0}
function navBack(ctx){
  if(ctx.key.startsWith('m')){closeModal(ctx.i);sfx('close');return}
  if(ctx.key==='pop'){$('#orderPop').className='';return}
  const b=$('#screen').querySelector('[data-back]');if(b)b.click();
}
function navMenu(){if(S.phase==='play'){if(S.paused){S.paused=false;hideScreen()}else togglePause()}}
function gpRefocus(i){const ctx={el:modalEl(i),key:'m'+i};const k=GP.ctxFocus[ctx.key];if(!k||!padsList().length)return;let b=null;try{b=ctx.el.querySelector(k)}catch(e){}if(b&&!b.disabled)b.classList.add('gfocus')}
const _origShowScreen=showScreen;
showScreen=function(html){_origShowScreen(html);GP.ctxFocus.screen=null;{const ctx={el:$('#screen'),key:'screen'};const items=navItems(ctx.el);const p=items.find(b=>b.classList.contains('primary'))||items[0];if(p)setFocus(ctx,p)}};

/* calibration */
function startCalib(gp){GP.calib={id:gp.id,step:0,rest:gp.axes.slice(),map:{act:0,back:1,menu:9,swap:3},wait:.4};renderCalib()}
const CALIB_STEPS=['스틱을 오른쪽으로 끝까지 밀었다가 놓아 주세요','스틱을 위로 끝까지 밀었다가 놓아 주세요','"행동"으로 쓸 버튼을 눌러 주세요','"닫기·취소"로 쓸 버튼을 눌러 주세요','"메뉴"로 쓸 버튼을 눌러 주세요','"캐릭터 바꾸기"로 쓸 버튼을 눌러 주세요 (혼자 할 때 사용)'];
function renderCalib(){const c=GP.calib;const el=$('#calibMsg');if(el)el.innerHTML=c?`<b>${c.step+1}/${CALIB_STEPS.length}</b> ${CALIB_STEPS[c.step]}`:''}
function calibStep(gp,st){
  const c=GP.calib;if(c.wait>0){c.wait-=1/60;c.rest=gp.axes.slice();return}
  if(c.step<=1){const st0=st;
    let bi=-1,bd=0;gp.axes.forEach((v,k)=>{const d=v-(c.rest[k]||0);if(Math.abs(d)>bd){bd=Math.abs(d);bi=k}});
    if(bd>.6&&!c.got){
      const isHat=Math.abs(c.rest[bi])>1.05||(gp.axes.length>=10&&bi===9);
      if(isHat){if(c.step===0){const k=Math.round((gp.axes[bi]+1)/(2/7))%8;const off=(k-2+8)%8;c.map.hat=bi;c.map.rot=off===0?0:off===6?1:off===2?-1:0}}
      else if(c.step===0)c.map.x={a:bi,s:Math.sign(gp.axes[bi]-(c.rest[bi]||0))};else c.map.y={a:bi,s:-Math.sign(gp.axes[bi]-(c.rest[bi]||0))};
      c.got=true;
    }
    if(c.got&&bd<.3){c.got=false;if(c.step===1&&c.map.hat!=null){}c.step++;c.wait=.25;sfx('tap');renderCalib()}
    return;
  }
  const k=gp.buttons.findIndex((b,j)=>b.pressed&&!st.prev[j]);if(k<0)return;
  const key=['act','back','menu','swap'][c.step-2];c.map[key]=k;c.step++;sfx('tap');
  if(c.step>=CALIB_STEPS.length){const m=c.map;if(m.hat==null&&!m.x)m.x={a:0,s:1};if(m.hat==null&&!m.y)m.y={a:1,s:1};SET.pads[c.id]=m;saveSettings();GP.calib=null;toastAll('컨트롤러 버튼 설정을 저장했어요');showSettings(SETTINGS_FROM);return}
  renderCalib();
}

/* ---------- controller diagnostics ---------- */
const KEYLOG=[];addEventListener('keydown',e=>{KEYLOG.unshift(`${e.key||'?'} (${e.keyCode})`);if(KEYLOG.length>8)KEYLOG.pop()},true);
const DG={on:false,step:0,res:[],base:null};
const DG_STEPS=['A 버튼','B 버튼','X 버튼','Y 버튼','+ 버튼','− 버튼','L 스틱을 위로','L 스틱을 오른쪽으로','R 스틱을 위로','R 스틱을 오른쪽으로','십자 버튼 위(L의 ↑)','L 버튼','R 버튼','ZL 버튼','ZR 버튼'];
function dgRecord(txt){if(!DG.on)return;DG.res[DG.step]=txt;DG.step++;DG.cool=performance.now();if(DG.step>=DG_STEPS.length)DG.on=false;diagT=0;diagRender()}
function dgPoll(){if(!DG.on||performance.now()-(DG.cool||0)<500)return;const pads=padsList();
  if(!DG.base){DG.base={};pads.forEach(gp=>DG.base[gp.index]={ax:gp.axes.slice(),bt:gp.buttons.map(b=>b.pressed)});return}
  for(const gp of pads){const b=DG.base[gp.index]||{ax:[],bt:[]};const k=gp.buttons.findIndex((x,i)=>x.pressed&&!b.bt[i]);if(k>=0){dgRecord(`패드${gp.index} 버튼 ${k}`);DG.base=null;return}
    const a=gp.axes.findIndex((v,i)=>Math.abs(v-(b.ax[i]||0))>.6);if(a>=0){dgRecord(`패드${gp.index} 축 ${a} → ${gp.axes[a].toFixed(2)}`);DG.base=null;return}}}
addEventListener('keydown',e=>{if(!DG.on)return;e.preventDefault();e.stopImmediatePropagation();if(performance.now()-(DG.cool||0)>=500){dgRecord(`키 ${e.key} (${e.keyCode})`);DG.base=null}},true);
let diagT=0;
function diagRender(){dgPoll();const now=performance.now();if(now-diagT<120)return;diagT=now;const box=$('#diagBox');if(!box)return;
  const guide=`<div class="diag"><b>버튼 하나씩 테스트</b> ${DG.on?`<span style="color:#C65C79">지금 누를 것: ${DG_STEPS[DG.step]} (없으면 건너뛰기)</span>`:(DG.res.length?'완료! 이 화면을 찍어 보내 주세요':'시작 버튼을 눌러 주세요')}<br>${DG_STEPS.map((n,i)=>`${n}: ${DG.res[i]||(DG.on&&i===DG.step?'…':'-')}`).join(' · ')}</div>`;
  const pads=padsList();
  box.innerHTML=guide+(pads.length?pads.map(gp=>{const st=GP.pads[padKey(gp)]||{};const v=[0,0];const us=padUnits(gp);return `<div class="diag"><b>${esc(gp.id)}</b><br>번호 ${gp.index} · 방식 ${gp.mapping||'(없음)'} · 인식 ${esc(shortPad(gp.id))}<br>스틱 값: ${gp.axes.map((a,i)=>`${i}:${a.toFixed(2)}`).join('  ')}<br>눌린 버튼: ${gp.buttons.map((b,i)=>b.pressed?i:null).filter(x=>x!==null).join(', ')||'없음'}<br>게임이 읽은 방향: ${us.map(u=>`${u.side==='L'?'왼쪽 조이콘':u.side==='R'?'오른쪽 조이콘':'컨트롤러'}(${u.slot?'수갱':'생민'}) → ${u.vec.map(x=>x.toFixed(2)).join(', ')}`).join(' / ')}${S.mode==='duo'?'':' (혼자 모드 기준)'}</div>`}).join(''):'<p class="note" style="text-align:left">게임패드로 인식된 컨트롤러가 없어요. 조이콘 버튼을 한 번 눌러 보세요.</p>')+
  `<div class="diag"><b>리모컨·키 입력</b><br>${KEYLOG.join(' / ')||'아직 없음'}</div><div class="diag"><small>${esc(navigator.userAgent)}</small></div>`}
function showDiag(){showScreen(`<div class="sheet" style="width:min(54.3rem,96vw)"><h1 style="font-size:1.57rem">컨트롤러 진단</h1><p class="sub">조이콘 버튼을 하나씩 누르고 스틱을 움직여 보세요. 이 화면을 사진으로 찍어 보내 주시면 맞춰 드릴게요.</p><div id="diagBox"></div><div class="opts"><button class="btn primary" id="dgStart">테스트 시작</button><button class="btn" id="dgSkip">건너뛰기</button><button class="btn" id="diagBack" data-back="1">돌아가기</button></div></div>`);
  $('#diagBack').onclick=()=>{DG.on=false;showSettings()};$('#dgStart').onclick=()=>{DG.on=true;DG.step=0;DG.res=[];DG.base=null;DG.cool=performance.now();diagT=0};$('#dgSkip').onclick=()=>{if(DG.on)dgRecord('반응 없음')}}
addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&!TOUCH_MODE){TOUCH_MODE=true;updateControlVisibility()}},{passive:true,capture:true});

/* ---------- settings screen ---------- */
let SETTINGS_FROM='title';
function showSettings(from){
  SETTINGS_FROM=from||SETTINGS_FROM;const pads=padsList();
  const bar=v=>`<span class="meter"><b style="width:${Math.round(v*100)}%"></b></span> ${Math.round(v*10)}`;
  showScreen(`<div class="sheet" style="width:min(44.3rem,96vw)"><h1 style="font-size:1.71rem">설정</h1>
    <div class="setrow"><span class="grow">배경음악</span><button class="btn small" data-set="music" data-d="-1" aria-label="배경음악 줄이기">−</button>${bar(SET.music)}<button class="btn small" data-set="music" data-d="1" aria-label="배경음악 키우기">+</button></div>
    <div class="setrow"><span class="grow">효과음</span><button class="btn small" data-set="sfx" data-d="-1" aria-label="효과음 줄이기">−</button>${bar(SET.sfx)}<button class="btn small" data-set="sfx" data-d="1" aria-label="효과음 키우기">+</button></div>
    <div class="setrow"><span class="grow">그래픽<br><small>${LITE?'가볍게 (빠름)':'보통'}${SET.gfx==='auto'?' · 자동':''}</small></span><button class="btn small ${SET.gfx==='auto'?'primary':''}" data-gfx="auto">자동</button><button class="btn small ${SET.gfx==='high'?'primary':''}" data-gfx="high">보통</button><button class="btn small ${SET.gfx==='lite'?'primary':''}" data-gfx="lite">가볍게</button></div>
    <div class="setrow"><span class="grow">성능 표시<br><small>화면 오른쪽 아래에 초당 프레임·처리 시간·메모리를 보여 줘요</small></span><button class="btn small ${SET.perf?'primary':''}" id="setPerf">${SET.perf?'켜짐':'꺼짐'}</button></div>
    <div class="lbl" id="setPads">조이콘</div>
    ${pads.length?`<div class="setrow"><span class="grow">${padsList().some(g=>isCombo(g.id))||(padsList().some(g=>joySide(g.id)==='L')&&padsList().some(g=>joySide(g.id)==='R'))?'조이콘 두 개가 연결됐어요':'조이콘(컨트롤러)이 연결됐어요'}<br><small>둘이 할 때: 왼쪽 조이콘 → <b style="font-weight:normal">${SET.swapSides?'수갱':'생민'}</b>, 오른쪽 조이콘 → <b style="font-weight:normal">${SET.swapSides?'생민':'수갱'}</b></small></span><button class="btn small soft" id="swapSides">생민·수갱 자리 바꾸기</button></div>`:'<p class="note" style="text-align:left">연결된 조이콘이 없어요. 스탠바이미에 블루투스로 연결한 뒤 아무 버튼이나 눌러 주세요.</p>'}
    <p class="hint">둘이 할 때는 한 사람당 조이콘 1개를 가로로 쥐어요. 스틱을 기울인 방향 그대로, 대각선까지 움직여요. 버튼 역할을 바꾸고 싶으면 "조이콘 키 지정"을 써 주세요.</p>
    <div class="opts"><button class="btn primary" id="goKeys">조이콘 키 지정</button><button class="btn soft" id="goDiag">컨트롤러 진단</button><button class="btn primary" data-back="1" id="setBack">돌아가기</button></div></div>`);
  const sc=$('#screen');sc.querySelectorAll('[data-gfx]').forEach(b=>b.onclick=()=>{SET.gfx=b.dataset.gfx;saveSettings();applyGfx();showSettings()});$('#goDiag').onclick=showDiag;$('#goKeys').onclick=showKeys;
  $('#setPerf').onclick=()=>{SET.perf=!SET.perf;saveSettings();perfShow();showSettings()};
  const swb=$('#swapSides');if(swb)swb.onclick=()=>{SET.swapSides=!SET.swapSides;saveSettings();showSettings()};
  sc.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{const k=b.dataset.set;SET[k]=clamp(Math.round((SET[k]+(+b.dataset.d)*.1)*10)/10,0,1);saveSettings();applyVolume();sfx('tap');showSettings()});
  sc.querySelectorAll('[data-assign]').forEach(b=>b.onclick=()=>{SET.assign[b.dataset.assign]=+b.dataset.slot;saveSettings();showSettings()});
  sc.querySelectorAll('[data-calib]').forEach(b=>b.onclick=()=>{const gp=padsList().find(g=>g.index===+b.dataset.calib);if(gp)startCalib(gp)});
  $('#setBack').onclick=()=>{GP.calib=null;if(SETTINGS_FROM==='pause'){togglePauseScreen()}else showTitle()};
}

/* ---------- tutorial ---------- */
const TUT=[
  ['가게 아래쪽 <b>문</b>으로 걸어 나가 마을로 가 보세요.',()=>S.chars.some(c=>c.area==='town')],
  ['마을 오른쪽, 강 건너 <b>꽃시장</b>에 들어가세요. 정오에 문을 닫아요.',()=>S.chars.some(c=>c.area==='market')],
  ['꽃 가판대 앞에서 행동 버튼으로 <b>꽃을 사세요</b>. 위쪽 예약 그림을 보고 필요한 꽃을 골라요.',()=>S.bags.some(b=>b.some(it=>it&&it.kind==='bunch'))],
  ['가게로 돌아가 왼쪽 <b>꽃 화단</b> 앞에서 꽃을 다듬으세요.',()=>S.bags.some(b=>b.some(it=>it&&it.kind==='bunch'&&it.trim))||S.bench.length>0],
  ['위쪽 <b>작업대</b>에서 예약을 고르고, 꽃을 올려 끈으로 묶으세요.',()=>S.bags.some(b=>b.some(it=>it&&it.kind==='bouquet'))],
  ['<b>포장대</b>에서 포장지와 리본을 골라 포장하세요.',()=>S.bags.concat([S.st.counter.slots]).some(b=>b.some(it=>it&&it.kind==='bouquet'&&it.wrapped))],
  ['<b>카운터</b>에 꽃다발을 보관해 두세요. 손님이 오면 카운터에서 건네요.',()=>S.st.counter.slots.some(it=>it&&it.wrapped)||S.stats.rev.length>0],
  ['잘했어요! 진열대, 텃밭, 공원도 둘러보세요. 하루는 저녁 7시에 끝나요.',()=>S.tutDone>12]
];
function tutUpdate(dt){
  const el=$('#tut');
  if(S.tut==null||S.tut<0||S.phase!=='play'){el.classList.add('hide');return}
  if(S.tut===TUT.length-1)S.tutDone=(S.tutDone||0)+dt;
  if(TUT[S.tut][1]()){S.tut++;sfx('ok');if(S.tut>=TUT.length){S.tut=-1;el.classList.add('hide');return}}
  const key='t'+S.tut;if(el.dataset.k!==key){el.dataset.k=key;el.innerHTML=`<span>💡 ${TUT[S.tut][0]}</span><button class="btn small" id="tutOff">튜토리얼 끄기</button>`;$('#tutOff').onclick=()=>{S.tut=-1;el.classList.add('hide')}}
  el.classList.remove('hide');
}
function askTutorial(mode){
  showScreen(`<div class="sheet" style="width:min(37.1rem,94vw)"><h1 style="font-size:1.71rem">처음 오셨나요?</h1><p class="sub">첫날 할 일을 화면 위쪽에 하나씩 알려주는 튜토리얼이 있어요.</p>
    <div class="opts"><button class="btn primary" id="tutYes">튜토리얼 하기</button><button class="btn" id="tutNo">바로 시작</button><button class="btn small" data-back="1" id="tutBack">돌아가기</button></div></div>`);
  $('#tutYes').onclick=()=>{S.tutPending=0;newGame(mode)};$('#tutNo').onclick=()=>{S.tutPending=-1;newGame(mode)};$('#tutBack').onclick=showTitle;
}

/* ---------- mid-day autosave ---------- */
function saveMid(){
  if(S.phase!=='play')return;
  saveGame({t:S.t,prices:S.prices,tomorrow:S.tomorrow,stats:{...S.stats,rev:S.stats.rev.map(r=>({price:r.price,o:{title:r.o.title},ev:r.ev,b:{stems:r.b.stems,paper:r.b.paper,ribbon:r.b.ribbon,card:r.b.card}}))},calls:S.calls,offers:S.offers,reserveAt:S.reserveAt,chars:S.chars.map(c=>({area:c.area,x:c.x,y:c.y})),tut:S.tut});
}
addEventListener('visibilitychange',()=>{if(document.hidden)saveMid()});
addEventListener('pagehide',()=>saveMid());

/* ---------- item popup ---------- */
function showTip(el){const tip=$('#tip');if(!tip)return;const t=el&&el.dataset&&el.dataset.tip;if(!t||t==='빈 칸'){tip.className='';return}
  tip.textContent=t;tip.className='on';const r=el.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;
  tip.style.left=clamp(r.left+r.width/2-tw/2,6,innerWidth-tw-6)+'px';tip.style.top=(r.top-th-8<4?r.bottom+8:r.top-th-8)+'px'}
function hideTip(){const t=$('#tip');if(t)t.className=''}
document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const el=e.target.closest&&e.target.closest('[data-tip]');if(el)showTip(el);else hideTip()});

/* ---------- offline support (GitHub Pages only) ---------- */
try{if('serviceWorker' in navigator&&/github\.io$/.test(location.hostname))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}catch(e){}

