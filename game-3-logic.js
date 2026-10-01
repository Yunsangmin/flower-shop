'use strict';
/* 우리 둘의 꽃집 — 3-logic.js : 저장·행동·손님·길찾기·주민 움직임·게임 진행
   (파일은 index.html 에 적힌 순서대로 불러와요. 앞 파일의 함수·변수를 뒤 파일이 이어서 씀) */
/* ---------- save ---------- */
function saveGame(mid){
  try{
    const slots={};S.stList.forEach(s=>{if(s.slots&&s.slots.some(Boolean))slots[s.id]=s.slots});
    const pos={};S.stList.forEach(s=>{if(s.area==='shop')pos[s.id]=[s.x,s.y]});
    const plots={};S.stList.forEach(s=>{if(s.plot)plots[s.id]=s.plot});
    const spr={};S.stList.forEach(s=>{if(s.on)spr[s.id]=1});
    const data={v:SAVE_VER,style:S.style,mid:mid||null,spr,closet:S.closet,outfit:S.outfit,day:S.day,money:S.money,nextId:S.nextId,up:S.up,bags:S.bags,bench:S.bench,works:S.works,slots,pos,plots,decor:S.decor,odecor:S.odecor||{},orders:S.orders,shopName:S.shopName,bonds:S.bonds||{}};
    localStorage.setItem(SAVE_KEY,JSON.stringify(data));
  }catch(e){}
}
const SAVE_VER=8;
/* 앞으로 저장 형식이 바뀌면 여기서 예전 저장을 새 형식으로 옮겨요 (v4 → v5 → …) */
const MIGRATE={7:d=>{d.v=8;d.odecor=d.odecor||{};return d},6:d=>{d.v=7;d.bonds=d.bonds||{};return d},4:d=>{d.v=5;d.style=d.style||null;if(d.up)delete d.up.rug;return d},5:d=>{d.v=6;if(!d.style||d.style==='vintage')d.style='natural';return d}};
function migrateSave(d){if(!d||typeof d.v!=='number'||d.v<4)return null;while(d.v<SAVE_VER){const f=MIGRATE[d.v];if(!f)return null;d=f(d)}return d}
function loadSave(){try{const d=migrateSave(JSON.parse(localStorage.getItem(SAVE_KEY)||'null'));dropSurnames(d,0);return d}catch(e){return null}}
function continueGame(mode){mode='duo';
  const d=loadSave();if(!d){newGame(mode);return}
  S.mode=mode;S.active=0;S.speed=1;
  Object.assign(S,{style:d.style||null,closet:d.closet||{},outfit:d.outfit||[{},{}],day:d.day,money:d.money,nextId:d.nextId,up:d.up||{},bags:d.bags,bench:d.bench,works:d.works,orders:d.orders,tomorrow:[],shopName:d.shopName||'우리 둘의 꽃집',decor:d.decor||DECOR_BASE.shop.map(x=>({...x})),odecor:d.odecor||{},bonds:d.bonds||{}});
  S.decor.forEach(x=>x.carried=false);for(const a in S.odecor)S.odecor[a].forEach(x=>x.carried=false);ODEC_V++;
  makeStations();
  Object.entries(d.slots||{}).forEach(([id,v])=>{const s=S.st[id];if(s&&s.slots)v.forEach((it,k)=>{if(k<s.slots.length)s.slots[k]=it})});
  Object.entries(d.pos||{}).forEach(([id,[x,y]])=>{const s=S.st[id];if(s){s.x=x;s.y=y}});
  Object.entries(d.plots||{}).forEach(([id,v])=>{const s=S.st[id];if(s)s.plot=v});
  Object.keys(d.spr||{}).forEach(id=>{if(S.st[id])S.st[id].on=true});
  if(d.mid)resumeMid(d.mid);else startDaySetup();
}

function resumeMid(m){
  S.t=m.t;S.customers=[];S.paused=false;S.puffs=[];S.drops=[];S.edit=false;S.nextWalkin=S.t+rnd(10,25);S.reserveAt=m.reserveAt||[null,null];
  S.chars=[makeChar(0),makeChar(1)];(m.chars||[]).forEach((p,k)=>Object.assign(S.chars[k],p));
  S.stats=m.stats;S.prices=m.prices;S.tomorrow=m.tomorrow||[];S.calls=(m.calls||[]).map(k=>({...k,state:k.state==='talk'||k.state==='ring'?'missed':k.state}));S.offers=m.offers||[null,null];
  makeWalkers();BG_CACHE={};S.tut=m.tut==null?-1:m.tut;S._as=Math.floor(S.t/30);
  S.orders.forEach(o=>{if(o.arrived&&(o.status==='pending'||o.status==='crafted'))o.arrived=false});
  buildControls();S.phase='intro';$('#hud').style.display='none';updateControlVisibility();
  showScreen(`<div class="sheet" style="width:min(32.9rem,94vw)"><h1 style="font-size:1.71rem">${S.day}일차 · ${clock(S.t)}</h1><p class="sub">저장된 곳부터 이어서 해요.</p><div class="opts"><button class="btn primary" id="goResumeDay">이어서 하기</button></div></div>`);
  $('#goResumeDay').onclick=()=>{hideScreen();S.phase='play';$('#hud').style.display='flex';buildControls()};
  prepGate('#goResumeDay',b=>{if(AUTO_RESUME&&b){AUTO_RESUME=false;b.click()}});
}

/* ---------- freshness ---------- */
function decayStems(arr,hours,water,mult){
  for(const s of arr){
    if(s.dried)continue;
    let r=FL[s.t].decay*(mult||1);
    if(water||s.hyd>=.99)r*=.45;else if(s.trim)r*=1.25;
    if(s.trim)r*=1.15-.3*s.cut;
    s.f=Math.max(0,s.f-r*hours);
  }
}
function forEachGroup(fn){
  fn(S.bench,false,1);
  Object.values(S.works).forEach(w=>fn(w.stems,false,1));
  S.stList.forEach(st=>{if(st.slots)st.slots.forEach(it=>{if(it&&it.stems)fn(it.stems,st.type==='bucket',st.type==='storage'?(S.up.fridge?.35:.7):1)})});
  S.bags.forEach(b=>b.forEach(it=>{if(it&&it.stems)fn(it.stems,false,1)}));
}
function freeIdx(arr){return arr.findIndex(x=>!x)}
function bagFree(i){return S.bags[i].filter(x=>!x).length}
function bagAdd(i,it){const k=freeIdx(S.bags[i]);if(k<0)return false;S.bags[i][k]=it;return true}
function heldItem(c){return c.bag.find(Boolean)||null}
function wiltedB(b){return b.kind==='bouquet'&&avg(b.stems.map(s=>s.f))<25}
function freePrice(b){
  const base=b.stems.reduce((a,s)=>a+FL[s.t].price/5,0),f=avg(b.stems.map(s=>s.f)),types=new Set(b.stems.map(s=>s.t)).size;
  const p=base*2.8*(.35+.65*clamp((f-25)/65,0,1))*(b.wrapped?1.15:1)*(1+.06*(types-1))*(b.card?1.05:1)*(1+.05*styleScore(b));
  return Math.max(0,Math.round(p/100)*100)+(isBasket(b)&&p>0?5000:0);
}
function itemName(it){
  if(!it)return '';
  if(it.kind==='seed')return `${FL[it.t].name} 모종 ${it.n}개`;
  if(it.kind==='sprinkler')return `스프링클러 ${it.n}개`;
  if(it.kind==='bouquet'){if(wiltedB(it))return '시든 꽃다발';const o=orderById(it.orderId);return (o?o.title:'자유 꽃다발')+(it.wrapped?'':' (묶음)')}
  return `${FL[it.t].name} ${it.stems.length}송이${it.dried?' · 드라이':it.trim?' · 다듬음':''}`;
}
function accepts(st,it){
  if((it.kind==='seed'||it.kind==='sprinkler')&&st.type!=='counter')return it.kind==='seed'?'모종은 텃밭에 심어 주세요':'스프링클러는 텃밭에 설치해 주세요';
  switch(st.type){
    case 'storage':return it.dried?'드라이플라워는 냉장고에 넣지 않아도 돼요':'';
    case 'shelf':case 'counter':return '';
    case 'bucket':return it.kind!=='bunch'?'물통에는 꽃 묶음만 꽂아요':it.dried?'드라이플라워는 물에 꽂지 않아요':!it.trim?'먼저 손질대에서 다듬어 주세요':'';
    case 'dryer':return it.kind!=='bunch'?'꽃 묶음만 걸 수 있어요':it.dried?'이미 드라이플라워예요':'';
    case 'pickup':return it.kind==='bouquet'&&it.wrapped&&it.orderId?'':'포장을 마친 예약 꽃다발만 올려둘 수 있어요';
    case 'display':return it.kind==='bouquet'&&!isFreeBq(it)?'예약 꽃다발은 카운터나 픽업대로 가져가세요':wiltedB(it)?'시든 꽃다발은 팔 수 없어요':'';
  }
  return '넣을 수 없어요';
}

/* ---------- action labels ---------- */
function ringingCall(){return S.calls.find(k=>k.state==='ring')}
const OPEN_LABEL={wardrobe:'옷 갈아입기',storage:'냉장고 열기',shelf:'선반 열기',bucket:'물통 열기',dryer:'건조대 열기',pickup:'픽업대 열기',display:'진열대 열기',trim:'꽃 다듬기',craft:'꽃다발 만들기',wrap:'포장하기',counter:'손님 맞기',trash:'버리기',board:'예약 보기',stall:'꽃 사기',seedstall:'모종 사기',keeper:'물건 보기',bench:'앉아 쉬기'};
function plotReady(P){return P&&P.prog>=GROW[P.t]}
function actionLabel(c){
  if(c.waterT>0)return ['물 주는 중',false];
  if(c.carry)return ['내려놓기',carrySpot(c)[2]];
  if(S.edit&&c.area==='shop'){return furnAt(c)?['가구 들기',true]:['가구 배치 중',false]}
  if(c.rest)return ['일어나기',true];
  const s=targetOf(c);if(!s)return furnAny(c)?['길게 눌러 들기',true]:['행동',false];
  if(s.type==='seat')return [SEATS[s.deco.t].lie?'눕기 (길게: 들기)':'앉기 (길게: 들기)',true];
  if(s.type==='npc'){const w=s.walker;return [w.kind==='reserve'&&w.state==='wait'?'예약 상담':'이야기하기',true]}
  if(s.type==='phone')return ringingCall()?['전화 받기',true]:['전화',false];
  if(s.type==='sprspot')return s.on?['스프링클러 걷기',true]:['스프링클러 설치',true];
  if(s.type==='plot'){const P=s.plot;if(!P)return ['모종 심기',c.bag.some(it=>it&&it.kind==='seed')];if(plotReady(P))return ['수확하기',true];if(!P.watered)return ['물 주기',true];return ['자라는 중',false]}
  return [OPEN_LABEL[s.type]||'행동',true];
}
/* ---------- furniture editing ---------- */
function movables(){return [...stationsIn('shop'),...S.decor.filter(d=>!d.carried)]}
function furnAt(c){
  const [dx,dy]=DIRV[c.dir];const fx=c.x+dx*12,fy=c.y-3+dy*12;
  for(const f of movables()){if(fx>=f.x*TILE-3&&fx<=(f.x+f.w)*TILE+3&&fy>=f.y*TILE-3&&fy<=(f.y+f.h)*TILE+3)return f}
  return null;
}
function placeSpot(c,f){const [dx,dy]=DIRV[c.dir]||[0,1];const cx=c.x+dx*(10+f.w*8),cy=c.y-3+dy*(10+f.h*8);return [Math.round(cx/TILE-f.w/2),f.wall?2:Math.round(cy/TILE-f.h/2)]} // 벽 장식은 늘 뒤 벽(2번 줄)
function spotOK(f,x,y){
  const W=AREAS.shop.w;
  if(f.wall){if(y!==2||x<1||x+f.w>W-1)return false;for(const o of S.decor){if(o===f||!o.wall||o.carried)continue;if(x<o.x+o.w&&x+f.w>o.x)return false}return true}
 if(x<1||x+f.w>W-1||y<2||y+f.h>10)return false;
  if(x<10&&x+f.w>8&&y+f.h>9)return false;
  for(const o of movables()){if(o===f||f.walk||o.walk)continue;if(x<o.x+o.w&&x+f.w>o.x&&y<o.y+o.h&&y+f.h>o.y)return false}
  for(const c of S.chars){if(c.area!=='shop')continue;const tx=c.x/TILE,ty=(c.y-2)/TILE;if(tx>x-.3&&tx<x+f.w+.3&&ty>y&&ty<y+f.h+.2)return false}
  return true;
}
function findSpot(f){if(f.wall)return findWallSpot(f);const W=AREAS.shop.w;for(const y of [7,6,8,3,9]){for(let x=2;x+f.w<W-1;x++){if(spotOK(f,x,y))return [x,y]}}return null}
/* 벽 장식 자리: 창문·시계·키 큰 뒤쪽 가구를 피해서 */
function findWallSpot(f){const W=AREAS.shop.w,B=wallBusy();
  const H=movables().filter(o=>!o.wall&&!o.flat&&o.y<=3).map(o=>[o.x*TILE+2,(o.x+o.w)*TILE-2]),hit=(L,x)=>L.some(([a,b])=>x*TILE<b&&(x+f.w)*TILE>a);
  for(const lv of [2,1])for(let x=1;x+f.w<W;x++){if(!spotOK(f,x,2))continue;if(lv>=1&&hit(H,x))continue;if(lv>=2&&hit(B,x))continue;return [x,2]}return null}
function wallBusy(){const W=AREAS.shop.w*TILE,b=[[84,122],[212,250],[146,174]];if(S.up.d_wallshelf)b.push([174,210]);for(let x=290;x+34<W-16;x+=112)b.push([x-2,x+36]);return b}
/* 기본 벽 선반·작은 액자 자리에 벽 장식을 걸면 기본 장식은 치워요(겹쳐 보이지 않게) */
function wallCover(a,b){return S.decor.some(d=>d.wall&&!d.carried&&d.x*TILE<b&&(d.x+d.w)*TILE>a)}
function wallFlags(){if(!S.decor||!S.up)return;const f=wallCover(176,208),s2=wallCover(46,80);
  if(!!S.up.wfHide!==f){if(f)S.up.wfHide=true;else delete S.up.wfHide;BG_CACHE={}}if(!!S.up.wsHide!==s2){if(s2)S.up.wsHide=true;else delete S.up.wsHide;BG_CACHE={}}}
/* ---------- 가구 들고 다니기: 가구 앞에서 행동 버튼 길게 → 들기, 행동 → 내려놓기, 닫기 → 제자리 ----------
   가게 밖(마을·언덕·캠퍼스·텃밭)에도 놓을 수 있어요. 가게 설비와 벽 장식은 가게 안에서만. */
function odecChanged(){ODEC_V++;if(typeof CNAV!=='undefined')CNAV=null;BG_CACHE={};bump()}
function carryList(c){if(c.area==='shop')return movables();if(OUT_AREAS.includes(c.area))return odec(c.area).filter(d=>!d.carried);return []}
function furnAny(c){const [dx,dy]=DIRV[c.dir]||[0,1];const fx=c.x+dx*12,fy=c.y-3+dy*12;
  for(const f of carryList(c)){if(fx>=f.x*TILE-3&&fx<=(f.x+f.w)*TILE+3&&fy>=f.y*TILE-3&&fy<=(f.y+f.h)*TILE+3)return f}return null}
function placeSpotO(c,f){const [dx,dy]=DIRV[c.dir]||[0,1];const cx=c.x+dx*(10+f.w*8),cy=c.y-3+dy*(10+f.h*8);return [Math.round(cx/TILE-f.w/2),Math.round(cy/TILE-f.h/2)]}
function spotOKO(area,f,x,y){const A=AREAS[area];if(x<1||y<1||x+f.w>A.w-1||y+f.h>A.h-1)return false;
  for(let yy=y;yy<y+f.h;yy++)for(let xx=x;xx<x+f.w;xx++)for(const [ox,oy] of [[4,4],[12,4],[4,12],[12,12]])if(solid(area,xx*TILE+ox,yy*TILE+oy))return false;
  for(const o of odec(area)){if(o===f||o.carried||(f.walk&&o.walk))continue;if(!f.walk&&!o.walk&&x<o.x+o.w&&x+f.w>o.x&&y<o.y+o.h&&y+f.h>o.y)return false}
  for(const c of S.chars){if(c.area!==area)continue;const tx=c.x/TILE,ty=(c.y-2)/TILE;if(!f.walk&&tx>x-.3&&tx<x+f.w+.3&&ty>y&&ty<y+f.h+.2)return false}return true}
function carrySpot(c){const f=c.carry;if(c.area==='shop'){const p=placeSpot(c,f);return [p[0],p[1],spotOK(f,p[0],p[1])]}
  if(!OUT_AREAS.includes(c.area)||f.type||f.wall)return [0,0,false];const p=placeSpotO(c,f);return [p[0],p[1],spotOKO(c.area,f,p[0],p[1])]}
function pickUp(c,f){if(!f||S.chars.some(o=>o.carry===f))return;if(S.chars.some(o=>o.rest&&o.rest.deco===f)){toast(c.i,'누군가 앉아 있어요');return}
  f.carried=true;c.carry=f;sfx('lift');if(!S.decor.includes(f))odecChanged();toast(c.i,'들었어요. 놓을 곳에서 행동 버튼, 취소는 닫기 버튼')}
function listOf(f){if(S.decor.includes(f))return S.decor;for(const a of OUT_AREAS){const L=odec(a);if(L.includes(f))return L}return null}
function placeCarry(c){const f=c.carry;const [x,y,ok]=carrySpot(c);
  if(!ok){toast(c.i,f.type&&c.area!=='shop'?'가게 설비는 가게 안에서만 옮길 수 있어요':f.wall&&c.area!=='shop'?'벽 장식은 가게 벽에만 걸 수 있어요':!OUT_AREAS.includes(c.area)&&c.area!=='shop'?'여기에는 놓을 수 없어요':'여기에는 놓을 수 없어요. 조금 옮겨 보세요');return}
  if(!f.type){const from=listOf(f),to=c.area==='shop'?S.decor:odec(c.area);if(from!==to){if(from)from.splice(from.indexOf(f),1);to.push(f)}}
  f.x=x;f.y=y;f.carried=false;c.carry=null;BG_CACHE={};odecChanged();sfx('thud');saveMid&&saveMid()}
function cancelCarry(c){if(!c.carry)return;c.carry.carried=false;c.carry=null;odecChanged();sfx('thud');toast(c.i,'제자리에 두었어요')}
function backAct(slot){const c=S.chars[slot];if(!c)return;if(c.carry&&!(S.edit&&c.area==='shop')){cancelCarry(c);return}if(c.rest)doAction(slot)}
function sitOn(c,d){const S0=SEATS[d.t];const seat=[...Array(S0.n).keys()].find(n=>!S.chars.some(o=>o!==c&&o.rest&&o.rest.deco===d&&o.rest.seat===n));
  if(seat===undefined){toast(c.i,S0.lie?'돗자리가 꽉 찼어요':'자리가 꽉 찼어요');return}
  if(S0.lie){c.rest={bench:{x:d.x+1,y:d.y+1,up:false},seat:0,start:S.t,deco:d,lie:true};c.rest.seat=seat;c.x=(d.x+d.w/2)*TILE+(seat?1:-1);c.y=(d.y+d.h/2)*TILE+(seat?10:0); /* 둘이 나란히(위아래로) 누워요 — 예전엔 좌우로 겹쳐서 한 사람이 가려졌어요 */c.dir='down';c.face=c.ang=0;sfx('sit');toast(c.i,'돗자리에 누웠어요. 움직이면 일어나요');return}
  const off=S0.n>1?(seat?.5:-.5):0;c.rest={bench:{x:d.x+(d.w-1)/2+off,y:d.y,up:false},seat:0,start:S.t,deco:d};c.rest.seat=seat;c.x=(d.x+d.w/2+off)*TILE;c.y=(d.y+1)*TILE-3;c.dir='down';c.face=c.ang=0;sfx('sit')}
function toggleEdit(){
  if(S.phase!=='play')return;
  S.edit=!S.edit;
  if(!S.edit)S.chars.forEach(c=>{if(c.carry){c.carry.carried=false;c.carry=null}});
  [0,1].forEach(i=>closeModal(i));
  toastAll(S.edit?'가구 배치 중이에요. 가구 앞에서 행동 버튼으로 들고, 원하는 곳에서 내려놓으세요':'가구 배치를 마쳤어요');hudKey='';
}

/* ---------- actions ---------- */
function orderById(id){return S.orders.find(o=>o.id===id)}
function doAction(i){
  if(S.phase!=='play'||S.paused)return;
  const c=S.chars[i];
  if(c.modal){if(c.modal.type==='talk'){if(talkSkip(i))return;if(c.modal.choose)return;talkNext(i)}return}
  const now=performance.now();if(now-(c.lastAct||0)<300)return;c.lastAct=now;sfx('tap');
  if(c.waterT>0)return;
  if(c.carry){placeCarry(c);return}
  if(S.edit&&c.area==='shop'){
    const f=furnAt(c);if(!f){toast(i,'옮길 가구 앞에 서 주세요');return}
    if(S.chars.some(o=>o.carry===f))return;
    f.carried=true;c.carry=f;return;
  }
  if(c.rest){standUp(c);return}
  const s=targetOf(c),fa=furnAny(c);
  /* 가구 앞: 짧게 누르면 앉기·눕기, 길게 누르면 들기(손을 뗄 때 결정 — update에서 처리) */
  /* 앉기·눕기는 누르는 순간 바로(손 떼는 순간을 기다리지 않음 → 조이콘에서도 확실하게). 계속 누르고 있으면 일어나서 들기 */
  if(s&&s.type==='seat'){sitOn(c,s.deco);if(fa===s.deco)c.pend={t:now,seat:s.deco,sat:!!c.rest};return}
  if(!s&&fa){c.pend={t:now};return}
  if(!s){toast(i,'가까이에 쓸 수 있는 게 없어요');return}
  switch(s.type){
    case 'npc':{const w=s.walker;w.talking=true;w.dir=faceTo(w,c);
      if(w.offer)openModal(i,{type:'booking',walker:w});
      else if(w.kind==='reserve'&&w.state==='wait'){w.offer=reserveOffer(w);openModal(i,{type:'booking',walker:w})}
      else if(w.main){const T=mainTalk(i,w);if(w.calling)S.callNext=S.t+rnd(60,140);w.calling=0;openModal(i,{type:'talk',walker:w,pages:T.pages,page:0,story:T.story,key:T.k,gained:T.gained})}
      else openModal(i,{type:'talk',walker:w,pages:[talkLine(w)],page:0});return}
    case 'seedstall':
      if(S.t>=MARKET_CLOSE){toast(i,'꽃시장은 정오에 문을 닫았어요');return}
      openModal(i,{type:'seedbuy',flower:'tulip',qty:1});return;
    case 'plot':{
      const P=s.plot;
      if(!P){const ks=c.bag.map((it,k)=>it&&it.kind==='seed'?k:-1).filter(k=>k>=0);
        if(!ks.length){toast(i,'꽃시장 모종 가게에서 모종을 사 오세요');return}
        if(new Set(ks.map(k=>c.bag[k].t)).size>1){openModal(i,{type:'plant',st:s.id});return}
        plantSeed(c,s,ks[0]);return}
      if(plotReady(P)){if(!bagAdd(i,{kind:'bunch',t:P.t,stems:Array.from({length:5},()=>stem(P.t,SEED_PRICE[P.t])),trim:false})){toast(i,'가방이 꽉 찼어요');return}s.plot=null;sfx('harvest');toast(i,`${FL[P.t].name} 5송이를 수확했어요`);return}
      if(!P.watered){waterOne(c,s);return}
      toast(i,'오늘은 물을 흠뻑 줬어요. 내일이면 더 자라 있을 거예요');return;
    }
    case 'stall':
      if(S.t>=MARKET_CLOSE){toast(i,'꽃시장은 정오에 문을 닫았어요');return}
      openModal(i,{type:'buy',flower:s.flower,qty:1});return;
    case 'keeper':openModal(i,{type:'supply'});return;
    case 'bench':{
      const seat=[0,1].find(n=>!S.chars.some(o=>o.rest&&o.rest.bench===s&&o.rest.seat===n));
      if(seat===undefined){toast(i,'벤치가 꽉 찼어요');return}
      c.rest={bench:s,seat,start:S.t};c.x=(s.x+.5+seat)*TILE;c.y=(s.y+1)*TILE-3;if(s.up){c.dir='up';c.face=c.ang=Math.PI;c.y=(s.y+1)*TILE-1}else{c.dir='down';c.face=c.ang=0}sfx('sit');if(s.view&&S.t>=420)setTimeout(()=>{if(c.rest&&c.rest.bench===s)sfx('sunset')},700);return;
    }
    case 'field':toast(i,'나중에 여기서 꽃을 키울 수 있어요');return;
    case 'storage':case 'shelf':case 'bucket':case 'dryer':case 'pickup':case 'display':
      openModal(i,{type:'box',st:s.id});return;
    case 'wardrobe':openModal(i,{type:'wardrobe',cat:'glasses'});return;
    case 'sprspot':{
      if(s.on){const ex=c.bag.find(it=>it&&it.kind==='sprinkler');if(ex)ex.n++;else if(!bagAdd(i,{kind:'sprinkler',n:1})){toast(i,'가방이 꽉 찼어요');return}s.on=false;toast(i,'스프링클러를 걷었어요');return}
      const k=c.bag.findIndex(it=>it&&it.kind==='sprinkler');if(k<0)return;const it=c.bag[k];it.n--;if(it.n<=0)c.bag[k]=null;s.on=true;s.sprayAt=performance.now();
      const n=sprinkle(s);toast(i,`스프링클러를 설치했어요. 매일 아침 주변 밭 ${sprCover(s).length}칸에 물을 줘요`);return;
    }
    case 'counter':openModal(i,{type:'counter'});return;
    case 'trim':{
      if(S.edit)return;
      const ks=c.bag.map((it,k)=>it&&it.kind==='bunch'&&!it.trim&&!it.dried?k:-1).filter(k=>k>=0);
      if(!ks.length){toast(i,'가방에 다듬을 꽃이 없어요. 냉장고에서 꺼내 오세요');return}
      openModal(i,ks.length===1?trimModal(c,ks[0]):{type:'trim',step:'pick'});return;
    }
    case 'craft':{
      const W=S.works[s.id];
      const other=S.chars[1-i];if(other.modal&&other.modal.type==='craft'&&other.modal.st===s.id){toast(i,`${PAL[1-i].name}이(가) 이 작업대를 쓰고 있어요`);return}
      const taken=Object.entries(S.works).filter(([k])=>k!==s.id).map(([,w])=>w.orderId);
      const pend=S.orders.filter(o=>o.status==='pending'&&!taken.includes(o.id));
      if(W.orderId&&!pend.some(o=>o.id===W.orderId))W.orderId=null; // 예전: 말없이 맨 앞 예약(주로 긴급 손님)으로 바뀌던 문제 수정
      openModal(i,{type:'craft',st:s.id});return;
    }
    case 'wrap':{
      const ks=c.bag.map((it,k)=>it&&it.kind==='bouquet'&&!it.wrapped?k:-1).filter(k=>k>=0);
      if(!ks.length){toast(i,'가방에 묶은 꽃다발이 없어요');return}
      openModal(i,ks.length===1?wrapModal(c,ks[0]):{type:'wrap',step:'pick'});return;
    }
    case 'trash':openModal(i,{type:'trash',sel:-1});return;
    case 'phone':{const k=ringingCall();if(!k){toast(i,'조용한 전화기예요');return}k.state='talk';openModal(i,{type:'phone',call:k});return}
    case 'board':openModal(i,{type:'board'});return;
  }
}
function faceTo(w,c){const dx=c.x-w.x,dy=c.y-w.y;return Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')}
function plantSeed(c,s,k){const it=c.bag[k];s.plot={t:it.t,prog:0,watered:false,wetAt:0};if(S.stList.some(sp=>sp.on&&sprCover(sp).includes(s)))s.plot.watered=true;it.n--;if(it.n<=0)c.bag[k]=null;sfx('plant');toast(c.i,`${FL[it.t].name} 모종을 심었어요. 물을 주면 빨리 자라요`)}
function waterOne(c,s){sfx('water');s.plot.watered=true;s.plot.wetAt=performance.now()+250;c.waterT=.9;c.vx=c.vy=0}
function sprCover(sp){return S.stList.filter(p=>p.type==='plot'&&p.x<sp.x+2&&p.x+p.w>sp.x-1&&p.y<sp.y+2&&p.y+p.h>sp.y-1)}
function sprinkle(sp){if(S.phase==='play')sfx('water');bump();let n=0;sprCover(sp).forEach(p=>{if(p.plot&&!plotReady(p.plot)){p.plot.watered=true;p.plot.wetAt=performance.now()+300;n++}});sp.sprayAt=performance.now();return n}
function waterAll(c){
  const list=S.stList.filter(s=>s.type==='plot'&&s.plot&&!s.plot.watered&&!plotReady(s.plot)).sort((a,b)=>Math.hypot(a.x*TILE-c.x,a.y*TILE-c.y)-Math.hypot(b.x*TILE-c.x,b.y*TILE-c.y));
  const now=performance.now();list.forEach((s,k)=>{s.plot.watered=true;s.plot.wetAt=now+k*140});
  c.waterT=Math.min(3,1.2+list.length*.14);c.vx=c.vy=0;toast(c.i,`텃밭 ${list.length}칸에 물을 줬어요`);
}
function trimModal(c,k){const t=c.bag[k].t;return {type:'trim',step:'leaf',slot:k,leaves:LEAVES[t]||3,removed:[],angle:10,adir:1}}
function wrapModal(c,k){const b=c.bag[k],o=orderById(b.orderId);return {type:'wrap',step:'edit',slot:k,paper:o?o.paper:'pink',ribbon:'white',pat:'plain',card:false}}
function standUp(c){
  const r=c.rest;if(!r)return;const b=r.bench;const mins=S.t-r.start;
  c.rest=null;{const bx=(b.x+.5+r.seat)*TILE,cand=b.up?[[bx,(b.y+1)*TILE+10],[bx,b.y*TILE-4],[bx-18,(b.y+.5)*TILE],[bx+18,(b.y+.5)*TILE]]:[[bx,(b.y+1)*TILE+10],[bx,(b.y+1)*TILE+16],[bx-20,(b.y+.8)*TILE],[bx+20,(b.y+.8)*TILE],[bx,b.y*TILE-4]];
    const ok=cand.find(([x,y])=>!blocked(c.area,x,y))||cand[0];c.x=ok[0];c.y=ok[1]}
  if(mins>=1){c.boostUntil=Math.max(c.boostUntil,S.t+Math.min(120,mins*6));toast(c.i,'푹 쉬었더니 몸이 가벼워요')}
}
function evaluate(b,o){
  const cnt={};b.stems.forEach(s=>cnt[s.t]=(cnt[s.t]||0)+1);
  const keys=Object.keys(o.req);
  let comp=avg(keys.map(t=>Math.min(cnt[t]||0,o.req[t])/o.req[t]));
  let extra=0;Object.keys(cnt).forEach(t=>{const r=o.req[t]||0;if(cnt[t]>r)extra+=cnt[t]-r});
  comp*=Math.max(.75,1-.04*extra);
  const f=avg(b.stems.map(s=>s.f));const wilted=b.stems.filter(s=>s.f<WILT).length;
  const fresh=(.55+.45*clamp(f/85,0,1))*Math.max(.5,1-.1*wilted);
  const hyd=.9+.1*avg(b.stems.map(s=>s.hyd)),cut=.95+.05*avg(b.stems.map(s=>s.cut)),wrapF=isBasket(b)||b.paper===o.paper?1.05:.95;
  const q=clamp(comp*fresh*hyd*cut*wrapF,.2,1.1);
  return {q,stars:q>=.93?3:q>=.72?2:1};
}
function settleOrder(cu,o,b,how){
  const ev=evaluate(b,o);
  const late=Math.max(0,S.t-o.time),disc=o.urgent?0:Math.min(.5,.1*Math.floor(late/30));bump();
  const sty=styleScore(b),tip=(b.card?Math.round(o.price*.05):0)+Math.round(o.price*.04*sty);
  const price=Math.round((o.price*ev.q*(1-disc)+tip)/100)*100+(isBasket(b)?5000:0);
  S.money+=price;o.status='delivered';sfx('coin');setTimeout(()=>sfx('star'+ev.stars),320);
  const lines=['정말 예뻐요! 꼭 다시 올게요.','마음에 들어요, 고마워요.','음… 생각했던 거랑은 조금 달라요.'];
  const rec={o,price,disc,ev,b,tip,how,sty,line:isBasket(b)&&ev.stars>=2?pick(['꽃바구니라니! 너무 예뻐요. 두고두고 볼게요.','바구니에 담으니까 꽃이 더 화사해 보여요!','와, 꽃바구니! 받는 사람이 정말 좋아하겠어요.']):sty&&ev.stars>=2&&PAT_LINE[b.pat]?pick(PAT_LINE[b.pat]):lines[3-ev.stars]};
  S.stats.rev.push(rec);
  cu.bouquet=b;leave(cu);
  return rec;
}

/* ---------- customers (shop) ---------- */
const DOOR_IN=[8.95*TILE,10.6*TILE];const AISLE=9.45*TILE;
function frontOf(st,dx){return [(st.x+(dx==null?st.w/2:dx))*TILE,(st.y+st.h+.95)*TILE]}
function counterSlot(n){const c=S.st.counter;return frontOf(c,.5+Math.min(n,c.w-1))}
function routeTo(k,x,y){k.path=[[k.x,AISLE],[x,AISLE],[x,y]];k.state='move'}
function leave(k){k.goal='out';k.path=[[k.x,AISLE],[DOOR_IN[0],AISLE],DOOR_IN.slice(),[DOOR_IN[0],11.4*TILE]];k.state='move'}
function pickupHas(orderId){const p=S.st.pickup;return owned(p)?p.slots.findIndex(b=>b&&b.orderId===orderId):-1}
function browsePoint(){const W=AREAS.shop.w;for(let n=0;n<14;n++){const x=rnd(1.6,W-1.6)*TILE,y=rnd(6.6,9.2)*TILE;if(!solid('shop',x,y)&&!solid('shop',x,y-4))return [x,y]}return [9*TILE,8*TILE]}
function newCust(kind,extra){const fem=extra&&extra.name?isFemName(extra.name):null;const pal=newPal(null,fem);return {kind,area:'shop',x:DOOR_IN[0],y:DOOR_IN[1],state:'move',walk:0,pal,dir:'up',name:nameFor(pal),path:[],...extra}}
function freeCounterSlot(){const used=S.customers.filter(c=>c.slot!=null&&c.state!=='gone'&&c.goal!=='out'&&c.goal!=='gone').map(c=>c.slot);const n=S.st.counter.w;for(let k=0;k<n;k++)if(!used.includes(k))return k;return n-1}
function goCounter(k){k.goal='counter';k.slot=freeCounterSlot();routeTo(k,...counterSlot(k.slot))}
const LANE_YS=[9.5*TILE,10.3*TILE,11.0*TILE];
function viaTown(k){
  k.inPath=k.path;k.inGoal=k.goal;k.area='town';const left=Math.random()<.5;k.ly=pick(LANE_YS);
  k.x=left?1.6*TILE:56.4*TILE;k.y=k.ly;k.path=[[7*TILE,k.ly],[7*TILE,5.9*TILE]];k.goal='enter';k.state='move';
  return k;
}
function spawnOrderCustomer(o){
  const k=newCust('order',{orderId:o.id,name:o.name});k.path=[[DOOR_IN[0],AISLE]];
  if(pickupHas(o.id)>=0){k.goal='pickup';const p=frontOf(S.st.pickup);k.path.push([p[0],AISLE],p)}else{k.slot=freeCounterSlot();k.goal='counter';const p=counterSlot(k.slot);k.path.push([p[0],AISLE],p)}
  S.customers.push(viaTown(k));
}
function spawnUrgent(){
  const o=genOrder(pick(TEMPLATES),Math.round(S.t),S.day);o.urgent=true;o.price*=2;o.deadline=S.t+URGENT_MIN;o.arrived=true;o.text='급해요! '+o.text;
  S.orders.push(o);S.orders.sort((a,b)=>a.time-b.time);spawnOrderCustomer(o);sfx('ring');toastAll('급한 꽃다발 손님이 가게로 오고 있어요! 두 배 가격이에요');hudKey='';bump();
}
function spawnWalkin(){const k=newCust('walkin',{plan:[]});const n=1+Math.floor(Math.random()*3);for(let j=0;j<n;j++)k.plan.push('look');k.plan.push('display');nextGoal(k);S.customers.push(viaTown(k))}
function spawnReserve(){const k=newCust('reserve',{leaveAt:S.t+90});k.path=[[DOOR_IN[0],AISLE]];k.slot=freeCounterSlot();k.goal='counter';const p=counterSlot(k.slot);k.path.push([p[0],AISLE],p);S.customers.push(viaTown(k))}
function nextGoal(k){
  const g=k.plan&&k.plan.shift();
  if(!g){leave(k);return}
  k.goal=g;
  if(g==='look'){const [x,y]=browsePoint();routeTo(k,x,y)}
  else if(g==='display'){const d=S.st.display;routeTo(k,...frontOf(d,rnd(.6,d.w-.6)))}
}
function sellables(){return S.st.display.slots.map((b,j)=>b&&(b.kind==='bouquet'?!wiltedB(b)&&isFreeBq(b):b.stems.some(s=>s.dried||s.f>=WILT))?j:-1).filter(j=>j>=0)}
function sellFromDisplay(k){
  const D=S.st.display.slots;const opts=sellables();if(!opts.length){k.say='오늘은 살 게 없네요';return}
  const bq=opts.filter(j=>D[j].kind==='bouquet');const j=bq.length&&Math.random()<.65?pick(bq):pick(opts),b=D[j];
  let price=0,label='';
  if(b.kind==='bouquet'){price=freePrice(b);D[j]=null;k.bouquet=b;label='꽃다발'}
  else{const ok=b.stems.filter(s=>s.dried||s.f>=WILT);const n=Math.min(ok.length,1+Math.floor(Math.random()*3));const taken=[];
    for(let q=0;q<n;q++){const s=ok[q];b.stems.splice(b.stems.indexOf(s),1);taken.push(s);price+=FL[s.t].price/5*(s.dried?1.4:(1.2+.8*clamp(s.f/100,0,1)))}
    if(!b.stems.length)D[j]=null;price=Math.round(price/100)*100;k.bouquet={kind:'bunch',t:b.t,stems:taken,trim:true,dried:!!b.dried};label=`${FL[b.t].name}${b.dried?'(드라이)':''} ${n}송이`;S.stats.displayN+=n}
  S.money+=price;S.stats.display+=price;sfx('coin');bump();
  toastAll(`진열대에서 ${label}이(가) 팔렸어요 +${won(price)}`);
}
function reserveOffer(k){
  const tpl=pick(TEMPLATES);const t=Math.ceil((S.t+120)/30)*30;
  return {tpl,name:k.name,time:pick(SLOTS),today:t<=510?t:null,until:S.t+999};
}
/* ---------- 길찾기(마을·북쪽 길): 주민·손님·고양이가 화단·물·나무·건물을 돌아서 걸어가게 ----------
   타일 격자(1칸=16)에서 A* 로 길을 찾고, 직선으로 갈 수 있는 구간은 줄여서 자연스럽게 걷게 해요. */
const NAV={};
/* 길찾기 격자는 가구·설비가 바뀔 때만 다시 만들어요(1초마다 가볍게 확인) — 예전엔 15초마다 통째로 다시 만들어서 잠깐씩 멈칫했어요 */
function navSig(area){const A=AREAS[area];let s=A.w*7+A.h;for(const d of DECOR[area]||[]){if(d.walk)continue;s=(s*31+(d.carried?7:d.x*13+d.y*101+d.w*3))|0}
  for(const t of S.stList){if(t.area!==area)continue;s=(s*31+(t.carried?3:t.x*17+t.y*29+(t.on?5:0)+(owned(t)?11:0)))|0}return s}
function navRows(area,g,w,y0,y1){for(let y=y0;y<y1;y++)for(let x=0;x<w;x++){let b=0;for(const oy of [1.5,8,14.5]){for(const ox of [2,8,14])if(solid(area,x*TILE+ox,y*TILE+oy)){b=1;break}if(b)break}g[y*w+x]=b}}
/* 가구가 바뀌면 길 지도를 한 번에 다시 만들지 않고 계산 한 번에 4줄씩 나눠 만들어요(그동안은 예전 지도를 써요) — 한꺼번에 만들면 TV에서 0.1초쯤 멈칫했어요 */
let NAV_TICK=0;
function navGrid(area){let N=NAV[area];const now=performance.now();
  if(N&&N.next){const nx=N.next;if(nx.tick!==NAV_TICK){nx.tick=NAV_TICK;const y1=Math.min(N.h,nx.y+4);navRows(area,nx.g,N.w,nx.y,y1);nx.y=y1;if(nx.y>=N.h){N.g=nx.g;N.sig=nx.sig;N.next=null}}return N}
  if(N){if(now-N.chk<1000)return N;N.chk=now;const sg=navSig(area);if(sg===N.sig)return N;N.next={sig:sg,g:new Uint8Array(N.w*N.h),y:0,tick:-1};return N}
  const A=AREAS[area],w=A.w,h=A.h,g=new Uint8Array(w*h);navRows(area,g,w,0,h);
  N=NAV[area]={chk:now,sig:navSig(area),w,h,g,next:null};return N}
function navFree(N,x,y){return x>=0&&y>=0&&x<N.w&&y<N.h&&!N.g[y*N.w+x]}
function navNear(N,x,y){if(navFree(N,x,y))return [x,y];for(let r=1;r<8;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(navFree(N,x+dx,y+dy))return [x+dx,y+dy]}return null}
function navSight(N,x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/5);for(let k=1;k<n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n;for(const [ox,oy] of [[-4,-2],[4,-2],[-4,2],[4,2]])if(!navFree(N,Math.floor((x+ox)/TILE),Math.floor((y+oy)/TILE)))return false}return true}
function navRoute(area,sx,sy,tx,ty){
  const N=navGrid(area);const s=navNear(N,Math.floor(sx/TILE),Math.floor(sy/TILE)),e0=[Math.floor(tx/TILE),Math.floor(ty/TILE)],e=navNear(N,e0[0],e0[1]);if(!s||!e)return null;
  const end=(e[0]===e0[0]&&e[1]===e0[1]&&!solid(area,tx,ty-1)&&!solid(area,tx,ty-4)&&!solid(area,tx-4,ty-2)&&!solid(area,tx+4,ty-2))?[tx,ty]:[(e[0]+.5)*TILE,(e[1]+.5)*TILE];
  if(navSight(N,sx,sy,end[0],end[1]))return {pts:[],end};
  const W=N.w,si=s[1]*W+s[0],ei=e[1]*W+e[0],B=astarBufs(W*N.h),gen=B.gen,gs=B.g,from=B.from,st=B.stamp,cl=B.closed;
  const hh=i=>{const x=i%W,y=(i/W)|0,dx=Math.abs(x-e[0]),dy=Math.abs(y-e[1]);return Math.max(dx,dy)+.41*Math.min(dx,dy)};
  const HI=B.hi,HF=B.hf;HI.length=0;HF.length=0;
  const push=(i,f)=>{let k=HI.length;HI.push(i);HF.push(f);while(k>0){const p=(k-1)>>1;if(HF[p]<=f)break;HI[k]=HI[p];HF[k]=HF[p];k=p}HI[k]=i;HF[k]=f};
  const pop=()=>{const top=HI[0],li=HI.pop(),lf=HF.pop();const n=HI.length;if(n){let k=0;while(true){let c=2*k+1;if(c>=n)break;if(c+1<n&&HF[c+1]<HF[c])c++;if(HF[c]>=lf)break;HI[k]=HI[c];HF[k]=HF[c];k=c}HI[k]=li;HF[k]=lf}return top};
  gs[si]=0;st[si]=gen;from[si]=-1;push(si,hh(si));let it=0;
  while(HI.length&&it++<8000){const cur=pop();if(cl[cur]===gen)continue;cl[cur]=gen;if(cur===ei)break;
    const cx=cur%W,cy=(cur/W)|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;if(!navFree(N,nx,ny))continue;if(dx&&dy&&(!navFree(N,cx+dx,cy)||!navFree(N,cx,cy+dy)))continue;
      const ni=ny*W+nx;if(cl[ni]===gen)continue;const ng=gs[cur]+(dx&&dy?1.414:1);if(st[ni]!==gen||ng<gs[ni]){gs[ni]=ng;st[ni]=gen;from[ni]=cur;push(ni,ng+hh(ni))}}}
  if(st[ei]!==gen&&ei!==si)return null;
  const tiles=[];for(let i=ei;i!==si&&i>=0;i=from[i])tiles.push(i);tiles.reverse();
  const raw=tiles.map(i=>[(i%W+.5)*TILE,(((i/W)|0)+.5)*TILE]);raw[raw.length-1]=end;
  /* 곧게 갈 수 있는 구간은 줄여요(앞에서부터 보이는 데까지) */
  const pts=[];let px=sx,py=sy,k=0;while(k<raw.length){let j=k;while(j+1<raw.length&&navSight(N,px,py,raw[j+1][0],raw[j+1][1]))j++;pts.push(raw[j]);[px,py]=raw[j];k=j+1}
  pts.pop();return {pts,end}}
/* 길찾기용 배열은 장소 크기별로 한 번만 만들어 다시 써요(매번 새로 만들면 메모리 정리 때문에 끊겨요) */
const ASTAR={};function astarBufs(n){let b=ASTAR[n];if(!b)b=ASTAR[n]={g:new Float32Array(n),from:new Int32Array(n),stamp:new Uint32Array(n),closed:new Uint32Array(n),gen:0,hi:[],hf:[]};
  b.gen++;if(b.gen>4e9){b.stamp.fill(0);b.closed.fill(0);b.gen=1}return b}
/* 한 프레임에 새 길찾기는 몇 번만(여러 명이 한꺼번에 길을 찾을 때 멈칫하지 않게) */
let NAV_BUDGET=4;
function stepToward(k,dt,spd){
  if(!k.path||!k.path.length)return true;
  if(k._nav){const tg=k.path[0],key=tg[0].toFixed(1)+','+tg[1].toFixed(1);
    if(k._rk!==key){if(NAV_BUDGET<=0)return false;NAV_BUDGET--;const r=navRoute(k._nav,k.x,k.y,tg[0],tg[1]);if(!r){k.path.shift();return !k.path.length}k._route=r.pts;k.path[0]=r.end;k._rk=r.end[0].toFixed(1)+','+r.end[1].toFixed(1)}
    if(k._route&&k._route.length){const [wx,wy]=k._route[0];const dx=wx-k.x,dy=wy-k.y,d=Math.hypot(dx,dy),st=spd*dt;
      if(d<=st){k.x=wx;k.y=wy;k._route.shift()}else{k.x+=dx/d*st;k.y+=dy/d*st}
      if(d>.1)k.dir=Math.abs(dx)>Math.abs(dy)*1.8?(dx>0?'right':'left'):Math.abs(dy)>Math.abs(dx)*1.8?(dy>0?'down':'up'):(dy>0?(dx>0?'dr':'dl'):(dx>0?'ur':'ul'));
      k.walk+=dt*9;return false}}
  const [tx,ty]=k.path[0];const dx=tx-k.x,dy=ty-k.y,d=Math.hypot(dx,dy);
  const st=spd*dt;
  if(d<=st){k.x=tx;k.y=ty;k.path.shift()}else{k.x+=dx/d*st;k.y+=dy/d*st}
  if(d>.1)k.dir=Math.abs(dx)>Math.abs(dy)*1.8?(dx>0?'right':'left'):Math.abs(dy)>Math.abs(dx)*1.8?(dy>0?'down':'up'):(dy>0?(dx>0?'dr':'dl'):(dx>0?'ur':'ul'));
  k.walk+=dt*9;
  return !k.path.length;
}
function arrive(k){
  if(k.goal==='enter'){k.area='shop';k.x=DOOR_IN[0];k.y=DOOR_IN[1];k.path=k.inPath;k.goal=k.inGoal;k.state='move';if(S.chars.some(c=>c.area==='shop'))sfx('bell');return}
  if(k.goal==='out'){k.area='town';k.slot=null;k.x=7*TILE;k.y=6.3*TILE;const ly=k.ly||pick(LANE_YS);k.path=[[7*TILE,ly],[Math.random()<.5?1.4*TILE:56.6*TILE,ly]];k.goal='gone';k.state='move';return}
  if(k.goal==='gone'){k.state='gone';return}
  if(k.goal==='pickup'){
    const idx=pickupHas(k.orderId);const o=orderById(k.orderId);
    if(idx>=0&&o){const b=S.st.pickup.slots[idx];S.st.pickup.slots[idx]=null;const rec=settleOrder(k,o,b,'auto');toastAll(`${o.name}님이 자동 픽업대에서 꽃다발을 찾아갔어요 +${won(rec.price)}`)}
    else goCounter(k);return;
  }
  if(k.goal==='counter'){k.state='wait';k.dir='up';return}
  if(k.goal==='look'){k.state='look';k.timer=rnd(2,5);k.dir=pick(['up','ul','ur','left','right']);return}
  if(k.goal==='display'){k.state='look';k.timer=3;k.dir='up';k.atDisplay=true;return}
}
function updateCustomers(dt){
  const dMin=dt/REAL_PER_MIN;
  S.orders.forEach(o=>{if(!o.arrived&&S.t>=o.time-12&&(o.status==='pending'||o.status==='crafted')){o.arrived=true;spawnOrderCustomer(o)}});
  const inShop=S.customers.filter(k=>k.kind!=='order'&&k.goal!=='gone').length;
  if(S.t>=S.nextWalkin){S.nextWalkin=S.t+rnd(20,40);if(S.t<560&&inShop<4)spawnWalkin()}
  S.reserveAt.forEach((t,n)=>{if(t!==null&&S.t>=t){S.reserveAt[n]=null;if(S.t<480)spawnReserve()}});
  (S.urgentAt||[]).forEach((t,n)=>{if(t!==null&&S.t>=t){S.urgentAt[n]=null;spawnUrgent()}});
  S.orders.forEach(o=>{if(o.urgent&&(o.status==='pending'||o.status==='crafted')&&S.t>o.deadline){o.status='cancelled';S.stats.cancel.push(o);const k=S.customers.find(c=>c.orderId===o.id);if(k){k.slot=null;if(k.area==='shop')leave(k);else k.state='gone'}toastAll(`${o.name}님이 기다리다 돌아갔어요`);hudKey=''}});
  S.customers.forEach(k=>{
    if(k.talking){k.walk=0;return}
    k._nav=k.area==='town'?'town':null;
    if(k.state==='move'){if(stepToward(k,dt,46))arrive(k)}
    else if(k.state==='look'){k.timer-=dMin;k.walk=0;if(k.timer<=0){if(k.atDisplay){k.atDisplay=false;sellFromDisplay(k);leave(k)}else nextGoal(k)}}
    else if(k.state==='wait'){
      k.walk=0;
      if(k.kind==='order'&&pickupHas(k.orderId)>=0){k.goal='pickup';const p=frontOf(S.st.pickup);k.path=[[k.x,AISLE],[p[0],AISLE],p];k.state='move'}
      if(k.kind==='reserve'&&S.t>k.leaveAt){k.slot=null;leave(k)}
    }
  });
  S.customers=S.customers.filter(k=>k.state!=='gone');
}

/* ---------- walkers (town) ---------- */
const RECESS=[[100,114],[190,232],[300,314]];
const YARD_PALS=[]; // 운동장 아이들은 매번 같은 아이들(그림 도장 재사용 → 쉬는 시간마다 새로 굽지 않음)
function updateWalkers(dt){
  updateCat(dt);
  const inRec=S.phase==='play'&&RECESS.some(([a,b])=>S.t>=a&&S.t<b),yard=S.walkers.filter(w=>w.zone==='yard');
  if(inRec&&!yard.length){S.swingOcc=[false,false];S.ball=null;const roles=['swing0','swing1','slide','slide','ball','ball','ball','house0','house1'].sort(()=>Math.random()-.5);let bi=0,si=0;
    if(!YARD_PALS.length)for(let k=0;k<9;k++)YARD_PALS.push(newPal('kid'));
    roles.forEach((role,k)=>{const w=mkWalker('kid','yard');w.pal=YARD_PALS[k];w.x=8.5*TILE+rnd(-6,6);w.y=28.7*TILE;w.tx=w.x;w.ty=w.y;w.wait=k*.3;w.role=role;w.st='go';if(role==='ball')w.bi=bi++;if(role==='slide')w.seg=(si++)*3;S.walkers.push(w)})}
  if(!inRec&&yard.length)yard.forEach(w=>{if(!w.goIn){w.goIn=true;w.sit=false;w.dz=0;w.yo=0;w.path=[[8.5*TILE,28.6*TILE]]}});
  if(!inRec&&yard.length){S.swingOcc=[false,false];S.ball=null}
  if(yard.length)updateBall(dt,yard);
  S.offers.forEach((t,n)=>{if(t!==null&&S.t>=t){S.offers[n]=null;const w=S.walkers.find(w=>w.zone!=='lane'&&!w.offer&&!w.follow&&w.kind!=='kid'&&!w.main&&!w.cRole);if(w)w.offer={tpl:pick(TEMPLATES),time:pick(SLOTS),name:w.name,until:S.t+70}}});
  const obs=new Set(S.chars.map(c=>c.area));
  /* 같은 장소여도 두 사람 모두에게서 화면 두 개 넘게 멀리 있는 주민(넓은 캠퍼스)은 가끔만 계산 */
  const farAll=w=>{const a=wArea(w);if(!WIDE_AREAS[a])return false;for(const c of S.chars)if(c.area===a&&Math.abs(c.x-w.x)<30*TILE&&Math.abs(c.y-w.y)<20*TILE)return false;return true};
  S.walkers.forEach(w=>{
    w._nav=w.follow||w.zone==='yard'?null:wArea(w);
    if(w._nav&&!w._chk&&!w.hidden){w._chk=1;const N=navGrid(w._nav),tx=Math.floor(w.x/TILE),ty=Math.floor(w.y/TILE);if(!navFree(N,tx,ty)){const q=navNear(N,tx,ty);if(q){w.x=(q[0]+.5)*TILE;w.y=(q[1]+.5)*TILE;w.tx=w.x;w.ty=w.y;if(w.dog){w.dog.x=w.x-8;w.dog.y=w.y}}}}
    /* 아무도 없는 장소의 주민은 0.1초에 한 번만 몰아서 계산해요(안 보이니 차이 없음, TV 계산량 크게 감소) */
    let wdt=dt;if(!w.follow&&!w.talking&&(!obs.has(wArea(w))||farAll(w))){w._acc=(w._acc||0)+dt;if(w._acc<.1)return;wdt=w._acc;w._acc=0}else if(w._acc){wdt+=w._acc;w._acc=0}
    const px=w.x,py=w.y,dpx=w.dog?w.dog.x:0,dpy=w.dog?w.dog.y:0;
    walkerStep(w,wdt);
    w.mv=Math.hypot(w.x-px,w.y-py)>.02;if(w.dog)w.dog.mv=Math.hypot(w.dog.x-dpx,w.dog.y-dpy)>.02;
  });
  if(S.walkers.some(w=>w.dead))S.walkers=S.walkers.filter(w=>!w.dead);
}
const ERRAND_DOORS=[20*TILE,43*TILE];
/* ---------- 쉬는 시간 운동장 놀이: 그네 · 미끄럼틀 · 공놀이 · 소꿉놀이 ---------- */
function yardDecor(t){return DECOR_BASE.town.find(d=>d.t===t)}
const BALL_SPOTS=[[150,485],[202,485],[176,508]];
function yardKid(w,dt){
  if(w.goIn){if(stepToward(w,dt,34))w.dead=true;return}
  if(w.throwT>0)w.throwT-=dt;
  const r=w.role||'';
  if(r.startsWith('swing')){const k=+r[5],d=yardDecor('swing'),base=[d.x*TILE+d.w*TILE*(k?.7:.3),d.y*TILE+13];
    if(w.st==='ride'){const [ex,ey]=swingSeat(d,k,performance.now());w.x=ex;w.y=ey+3.5;w.sit=true;w.dir='down';w.walk=0;w.dz=8;w.rideT-=dt;
      if(w.rideT<=0){w.st='off';S.swingOcc[k]=false;w.sit=false;w.dz=0;w.x=base[0];w.y=base[1];w.wait=rnd(1.5,3.5)}return}
    if(w.wait>0){w.wait-=dt;w.walk=0;return}
    w.path=[base];if(stepToward(w,dt,30)){w.st='ride';S.swingOcc[k]=true;w.rideT=rnd(9,17)}return}
  if(r==='slide'){const d=yardDecor('slide'),X=d.x*TILE,Y=d.y*TILE,R=X+d.w*TILE;
    const P=[[X+6.5,Y+18,28,0],[X+6.5,Y-11,9,0],[X+10.5,Y-12,12,0],[R-2,Y+14,58,1],[R+2,Y+22,26,0],[X+14,Y+24,26,0]];
    if(w.wait>0){w.wait-=dt;w.walk=0;return}
    const q=P[(w.seg||0)%P.length];w.path=[[q[0],q[1]]];w.sit=!!q[3];w.dz=q[3]?30:((w.seg%P.length)===1||(w.seg%P.length)===2?-6:0);
    const was=w.dir;if(stepToward(w,dt,q[2])){w.seg=((w.seg||0)+1)%P.length;if(w.seg===0)w.wait=rnd(.3,1.2);if(w.seg===4){w.sit=false;w.dz=0}}
    if(q[3]){w.dir='dr';w.walk=0}else if((w.seg%P.length)===1)w.dir='up';return}
  if(r==='ball'){const sp=BALL_SPOTS[(w.bi||0)%3];
    if(w.st!=='ready'){if(w.wait>0){w.wait-=dt;return}w.path=[[sp[0],sp[1]]];if(stepToward(w,dt,30))w.st='ready';return}
    const b=S.ball;if(b){const [bx,by]=ballPos(b);const dx=bx-w.x,dy=by-w.y;if(Math.abs(dx)+Math.abs(dy)>2)w.dir=Math.abs(dx)>Math.abs(dy)*1.8?(dx>0?'right':'left'):Math.abs(dy)>Math.abs(dx)*1.8?(dy>0?'down':'up'):(dy>0?(dx>0?'dr':'dl'):(dx>0?'ur':'ul'))}
    w.walk=0;return}
  if(r.startsWith('house')){const k=+r[5],spot=[7*TILE+(k?26:6),32*TILE+8];
    if(w.st!=='sit'){if(w.wait>0){w.wait-=dt;return}w.path=[spot];if(stepToward(w,dt,26)){w.st='sit';w.sit=true;w.yo=5;w.chat=rnd(2,5)}return}
    w.dir='down';w.walk=0;w.chat-=dt;if(w.chat<0){w.dir=k?'dl':'dr';if(w.chat<-1.6)w.chat=rnd(2.5,6)}return}
  // 역할이 없으면 운동장을 뛰어다님
  if(w.wait>0){w.wait-=dt;return}w.path=[[w.tx,w.ty]];if(stepToward(w,dt,34)){w.wait=rnd(.2,1.1);[w.tx,w.ty]=park('yard')}}
function ballPos(b){const A=b.from,B=b.to||b.from;const t=b.to?clamp(b.t,0,1):0;const x=A.x+(B.x-A.x)*t,y=A.y+(B.y-A.y)*t;return [x,y,b.to?Math.sin(Math.PI*t)*16:0]}
function updateBall(dt,yard){
  const ready=yard.filter(w=>w.role==='ball'&&w.st==='ready'&&!w.goIn&&!w.talking);
  if(!S.ball){if(ready.length>=2)S.ball={from:ready[0],to:null,t:0,hold:.8};return}
  const b=S.ball;if(!yard.includes(b.from)||b.from.goIn){S.ball=null;return}
  if(b.to){b.t+=dt/b.dur;if(b.t>=1){b.from=b.to;b.to=null;b.t=0;b.hold=rnd(.5,1.4)}return}
  b.hold-=dt;if(b.hold<=0){const others=ready.filter(w=>w!==b.from);if(others.length){b.to=pick(others);b.t=0;b.dur=.75+Math.random()*.35;b.from.throwT=.35}else b.hold=.5}}
function walkerStep(w,dt){
    if(w.zone==='yard'&&!w.talking){yardKid(w,dt);return}
    if(w.eve){if(S.t<430){w.hidden=1;return}if(!w.eveOn){w.eveOn=true;w.hidden=0;[w.x,w.y]=park('lake');w.tx=w.x;w.ty=w.y;if(w.dog){w.dog.x=w.x-8;w.dog.y=w.y}}}
    if(w.school){const gx=8.5*TILE,gy=28.6*TILE;
      if(S.t<330){if(w.atSchool){w.hidden=1;return}if(!w.goSchool){w.goSchool=true;w.path=[[w.x,23.5*TILE],[2.3*TILE,23.5*TILE],[2.3*TILE,gy],[gx,gy]]}if(stepToward(w,dt,26)){w.atSchool=true;w.hidden=1}return}
      if(w.atSchool){w.atSchool=false;w.hidden=0;w.goSchool=false;w.x=gx;w.y=gy;w.path=[[2.3*TILE,gy],[2.3*TILE,23.5*TILE],[12*TILE,23.5*TILE]];w.leaving=true}
      if(w.leaving){if(stepToward(w,dt,26)){w.leaving=false;w.zone='park';w.tx=w.x;w.ty=w.y;w.wait=0}return}}
    if(w.offer&&S.t>w.offer.until&&!w.talking)w.offer=null;
    const lead=w.follow;
    if(w.talking||(lead&&lead.talking))return;
    if(w.main&&mainCall(w,dt))return;
    if(w.zone==='lane'&&!lead){
      if(w.hidden>0){w.hidden-=dt;if(w.hidden<=0){w.hidden=0;w.x=w.ex;w.y=6.3*TILE;w.errand='back';w.path=[[w.ex,w.ly]];w.dir='down'}return}
      if(w.errand==='go'){if(stepToward(w,dt,21)){w.hidden=rnd(12,30);w.errand=null}return}
      if(w.errand==='back'){if(stepToward(w,dt,21))w.errand=null;return}
      if(Math.random()<dt*.04){const ahead=ERRAND_DOORS.filter(x=>(w.tx>w.x?x>w.x+8&&x<w.x+60:x<w.x-8&&x>w.x-60));if(ahead.length){w.ex=ahead[0];w.ly=w.y;w.errand='go';w.path=[[w.ex,w.y],[w.ex,5.9*TILE]];return}}
    }
    if(lead){const tx=lead.x+(lead.dir==='left'?12:-12)*(lead.zone==='lane'?1:.8),ty=lead.y+2;w.path=[[tx,ty]];const d=Math.hypot(tx-w.x,ty-w.y);if(d>1.5)stepToward(w,dt,Math.min(40,d*3));else{w.walk=0;w.dir=lead.dir}}
    else if(w.zone==='lane'){w.path=[[w.tx,w.y]];if(stepToward(w,dt,w.kind==='kid'?26:21))w.tx=w.tx>28*TILE?2*TILE:55*TILE}
    else{
      if(w.wait>0){w.wait-=dt;w.walk=0}
      else{w.path=[[w.tx,w.ty]];if(stepToward(w,dt,w.kind==='kid'?24:w.kind==='elder'?11:16)){w.wait=rnd(1.5,4);[w.tx,w.ty]=park(w.zone)}}
    }
    if(w.dog){const d=w.dog,[ox,oy]=DIRV[w.dir]||[0,1];const tx=w.x-ox*10+6,ty=w.y-oy*6+3;const dd=Math.hypot(tx-d.x,ty-d.y);d.path=[[tx,ty]];if(dd>1.5)stepToward(d,dt,Math.min(45,dd*4))}
}
const TALK={
  lake:['노을 보러 나왔어요.','강가 산책로가 제일 좋아요.'],
  adult:['토토 밥은 동네 사람들이 돌아가며 챙겨줘요.','아까 토토가 꽃집 앞에서 햇볕 쬐며 자고 있더라고요.','오늘 날씨 정말 좋죠? 산책하기 딱이에요.','꽃시장은 정오에 문을 닫으니까 오전에 서두르세요.','저녁에 가로등이 켜지면 이 길이 참 예뻐요.','요즘 두 분 가게 앞을 지나가면 꽃향기가 나요.','다리 위에서 보는 강이 제일 좋아요.'],
  kid:['토토 봤어요? 엄청 귀여워요! 쓰다듬으면 골골거려요.','까미랑 달리기 시합했는데 제가 졌어요!','엄마 생신인데 꽃 한 송이 사도 돼요?','강에서 오리 봤어요! 꽥꽥!','튤립은 무슨 색이 제일 예뻐요?','시계탑 종이 울리면 집에 가야 해요.','오늘 학교에서 꽃 그림 그렸어요!','운동장 그네 타러 갈 거예요!'],
  elder:['토토는 이 동네 모든 집의 고양이라오. 허허.','젊을 때 우리 할멈한테 안개꽃을 자주 줬지.','텃밭은 물을 줘야 쑥쑥 자란다오. 안 주면 느릿느릿하지.','시계탑 종소리 듣고 나왔다오.','꽃은 사선으로 잘라야 물을 잘 먹는다네.'],
  student:['시험 끝나면 친구들이랑 꽃 사러 갈게요.','공부하다 머리 식히러 나왔어요.','동아리 발표 날 꽃다발이 필요할 것 같아요.'],
  couple:['저희 오늘 결혼 3주년이에요!','둘이 같이 가게 하시는 거죠? 부러워요.','주말마다 이 공원을 같이 걸어요.'],
  walkin:['향기가 정말 좋네요.','진열대 꽃다발이 참 예뻐요.','여기 분위기가 너무 포근해요.','구경만 해도 기분이 좋아지네요.'],
  reserve:['예약하고 싶은데 잠깐 시간 되세요?']
};
function talkLine(w){
  if(w.kind==='cat')return pick(w.lines||CAT_LINES);
  if(w.kkami)return pick(['우리 까미 새까맣죠? 밤에는 눈만 반짝여요.','까미야, 인사해야지! 꼬리 흔드는 거 보여요?','까미는 토토랑 친해요. 가끔 같이 낮잠 자요.','까미는 이 동네 산책 대장이에요.']);
  const tb=S.t<180?'좋은 아침이에요! ':S.t>480?'벌써 해가 지네요. ':'';
  const o0=S.outfit[0]||{},o1=S.outfit[1]||{},extra=[];
  if(o1.glasses)extra.push('안경 쓴 언니 정말 멋있어요!');if(o0.hat)extra.push('모자 쓴 오빠, 잘 어울려요!');if(o1.pin)extra.push('머리핀 예쁘네요. 어디서 샀어요?');
  if(o0.apron||o1.apron)extra.push('앞치마 입으니까 진짜 꽃집 사장님 같아요.');if(o0.dress||o1.dress)extra.push('옷이 정말 예뻐요. 꽃집이랑 잘 어울려요!');if(o0.bag||o1.bag)extra.push('가방 귀엽다! 어디서 샀어요?');if(o0.hat==='crown'||o1.hat==='crown')extra.push('꽃 화관이다! 동화 속 꽃집 같아요.');
  if(S.t>400)extra.push('강 따라 위쪽 언덕길 벤치에서 보는 노을이 정말 예뻐요.','해 질 녘 강가를 걷는 게 제 낙이에요.');
  if(w.zone==='north')extra.push('은행잎이 노랗게 물들었네요. 가을이 왔어요.','단풍 밟는 소리가 좋아요.','여기 벤치에 앉아 있으면 해가 지는 게 다 보여요.');
  if(w.zone==='lake')extra.push('물결 위로 노을이 번지는 거 보여요?','저녁 바람이 선선해서 좋네요.');
  if(w.kind==='kid'&&S.t>330)extra.push('방금 학교 끝났어요! 이제 놀 거예요.');
  if(extra.length&&Math.random()<.45&&w.kind!=='order')return tb+pick(extra);
  if(w.kind==='order'){const o=orderById(w.orderId);return o?`${o.title} 찾으러 왔어요. 두근두근해요!`:'안녕하세요!'}
  if(w.kind==='dog')return tb+pick([`우리 ${w.dog.name}가 꽃 냄새를 좋아해요.`,`${w.dog.name}야, 인사해야지!`,`${w.dog.name}는 산책을 제일 좋아해요.`]);
  if(w.kind==='walkin'&&!sellables().length&&Math.random()<.5)return '오늘은 진열된 꽃이 별로 없네요. 다음에 또 올게요.';
  return tb+pick(TALK[w.kind]||TALK.adult);
}

/* ---------- facing (16 directions) ---------- */
const DIR_ANG={down:0,dr:Math.PI/4,right:Math.PI/2,ur:3*Math.PI/4,up:Math.PI,ul:-3*Math.PI/4,left:-Math.PI/2,dl:-Math.PI/4};
function angDiff(a,b){let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d}
function turnToward(c,dt){const d=angDiff(c.ang,c.face);const st=26*dt;c.ang+=Math.abs(d)<=st?d:Math.sign(d)*st;if(c.ang>Math.PI)c.ang-=2*Math.PI;if(c.ang<-Math.PI)c.ang+=2*Math.PI}

/* ---------- update ---------- */
function update(dtReal){
  NAV_BUDGET=4;NAV_TICK++;
  const dt=dtReal*S.speed,dMin=dt/REAL_PER_MIN,hours=dMin/60;
  S.t+=dMin;
  forEachGroup((arr,water,mult)=>{decayStems(arr,hours,water,mult);if(water)arr.forEach(s=>s.hyd=Math.min(1,s.hyd+dMin/HYDRATE_MIN))});
  const dr=S.st.dryer;if(owned(dr))dr.slots.forEach(it=>{if(it&&!it.dried){it.dryT=(it.dryT||0)+dMin;if(it.dryT>=DRY_MIN){bump();it.dried=true;it.trim=true;it.stems.forEach(s=>{s.dried=true;s.trim=true})}}});
  S.chars.forEach(c=>{
    c.fade=Math.max(0,c.fade-dtReal*3.5);
    let [ix,iy]=inputFor(c.i);if(c.modal){ix=0;iy=0}
    if(c.waterT>0){c.waterT-=dtReal;ix=0;iy=0}
    if(c.rest){c.moving=false;if(Math.hypot(ix,iy)>.4)standUp(c);else return}
    const mag=Math.min(1,Math.hypot(ix,iy));
    const sp=99*(S.t<c.boostUntil?1.3:1)*(c.area==='campus'?2:1); // 넓은 캠퍼스에서는 2배로 빠르게
    c.vx=mag>.12?ix/Math.max(mag,1e-6)*mag*sp:0;c.vy=mag>.12?iy/Math.max(mag,1e-6)*mag*sp:0;
    c.moving=Math.hypot(c.vx,c.vy)>6;
    if(mag>.12){c.dir=OCT[((Math.round(Math.atan2(iy,ix)/(Math.PI/4))%8)+8)%8];c.face=Math.atan2(ix,iy)}
    turnToward(c,dtReal);
    moveChar(c,c.vx*dtReal,c.vy*dtReal);
    if(c.moving){c.anim+=dtReal*9;c.stepT=(c.stepT||0)+dtReal;if(c.stepT>.24){c.stepT=0;S.puffs.push({area:c.area,x:c.x+rnd(-2,2),y:c.y,t:0})}}
    for(const d of DOORS){
      if(d.area!==c.area)continue;
      const hit=d.edge==='right'?(c.x>=d.x&&c.y>=d.y0&&c.y<=d.y1):d.edge==='left'?(c.x<=d.x&&c.y>=d.y0&&c.y<=d.y1):(c.x>=d.x0&&c.x<=d.x1&&(d.edge==='bottom'?c.y>=d.y:c.y<=d.y));
      if(hit){
        if(c.carry&&(S.edit||c.carry.type||c.carry.wall)){if(d.edge==='right')c.x-=4;else if(d.edge==='left')c.x+=4;else c.y+=d.edge==='bottom'?-4:4;toast(c.i,'가구를 먼저 내려놓으세요');break}
        const o=S.chars[1-c.i];
        c.area=d.to;sfx('door');c.x=d.sx+(o.area===d.to&&Math.abs(o.x-d.sx)<10&&Math.abs(o.y-d.sy)<10?12:0);c.y=d.sy;c.dir=d.dir;c.face=c.ang=DIR_ANG[d.dir];c.fade=1;c.vx=c.vy=0;break;
      }
    }
  });
  const [a,b]=S.chars;
  if(a.area===b.area&&!a.rest&&!b.rest){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<11){const p=(11-d)/2||.5,nx=d?dx/d:1,ny=d?dy/d:0;moveChar(a,-nx*p,-ny*p);moveChar(b,nx*p,ny*p)}}
  S.puffs.forEach(q=>q.t+=dtReal);S.puffs=S.puffs.filter(q=>q.t<.5);
  /* 행동 버튼 길게 누르기 → 가구 들기 / 짧게 → 앉기 */
  S.chars.forEach((c,i)=>{if(!c.pend)return;if(c.modal){c.pend=null;return}
    if(actHeld(i)){if(performance.now()-c.pend.t>=700){const p=c.pend,f=p.sat?p.seat:furnAny(c);c.pend=null;if(p.sat&&c.rest)standUp(c);if(f)pickUp(c,f)}}
    else{const p=c.pend;c.pend=null;if(p.sat)return;if(p.seat)sitOn(c,p.seat);else toast(i,'행동 버튼을 길게 누르면 가구를 들 수 있어요')}});
  S._wf=(S._wf||0)+dtReal;if(S._wf>.5){S._wf=0;wallFlags()}
  S._gc=(S._gc||0)+dtReal;if(S._gc>3){S._gc=0;giftCatchUp()}
  updateCustomers(dt);updateWalkers(dt);
  S.calls.forEach(k=>{if(k.state==='wait'&&S.t>=k.t)k.state='ring';if(k.state==='ring'&&S.t>k.t+k.dur)k.state='missed'});
  if(ringingCall()&&performance.now()-AU.lastRing>1600&&S.chars.some(c=>c.area==='shop')){AU.lastRing=performance.now();sfx('ring')}
  if(Math.floor(S.t/30)!==S._as){S._as=Math.floor(S.t/30);saveMid()}
  tutUpdate(dtReal);
  if(S.t>=DAY_LEN)endDay();
}

/* ---------- input ---------- */
/* 행동 버튼을 누르고 있는지(키보드·조이콘·화면 버튼) — 가구 들기(길게 누르기)에 써요 */
const ACTH=[{kb:false,tch:false},{kb:false,tch:false}];
function actHeld(i){return ACTH[i].kb||ACTH[i].tch||(typeof PADACT!=='undefined'&&PADACT[i])}
function kbSlot(e){const code=e.code,kc=e.keyCode;if(kc===33||kc===34)return S.active;{const h=bindHit(kc);if(h)return h.fn==='act'?(S.mode==='solo'?S.active:h.p):-1}
  for(const p of [0,1]){const b=(SET.keys&&SET.keys[p]||{}).act;if(b&&b.t==='k'&&b.c===code)return S.mode==='solo'?S.active:p}
  if(S.mode==='solo')return ['Space','Enter','KeyE'].includes(code)?S.active:-1;if(code==='Space'||code==='KeyF')return 0;if(code==='Enter'||code==='Slash')return 1;return -1}
addEventListener('keyup',e=>{const s=kbSlot(e);if(s>=0)ACTH[s].kb=false;else if(e.keyCode===33||e.keyCode===34)ACTH[S.active].kb=false});
addEventListener('blur',()=>ACTH.forEach(h=>{h.kb=false;h.tch=false}));
addEventListener('pointerdown',e=>{const b=e.target&&e.target.closest&&e.target.closest('.act');if(b){const s=S.mode==='solo'?S.active:+b.dataset.slot;if(ACTH[s])ACTH[s].tch=true}},true);
['pointerup','pointercancel'].forEach(ev=>addEventListener(ev,()=>ACTH.forEach(h=>h.tch=false),true));
const JOY=[{x:0,y:0},{x:0,y:0}];
const KEYS=new Set();
addEventListener('keydown',e=>{
  if(VOLKEYS.includes(e.keyCode))return;
  {const k=kbSlot(e);if(k>=0)ACTH[k].kb=true}
  {const h=bindHit(e.keyCode);if(h){e.preventDefault();const now=performance.now(),rep=e.repeat||(KB_HELD[e.keyCode]&&now-KB_HELD[e.keyCode]<140);KB_HELD[e.keyCode]=now;doBind(h.p,h.fn,rep);return}}
  const actKey=e.keyCode===13||e.keyCode===33||e.keyCode===34;
  {const nav={37:'left',38:'up',39:'right',40:'down'}[e.keyCode];const ctx=navContext(S.active);if(ctx&&(nav||actKey)){e.preventDefault();if(e.repeat&&actKey)return;if(nav)navMove(ctx,nav);else navPress(ctx);return}}
  if((e.keyCode===33||e.keyCode===34)&&S.phase==='play'){e.preventDefault();if(!e.repeat)doAction(S.active);return}
  if(e.keyCode===461||e.key==='Escape'||e.key==='GoBack'||e.key==='BrowserBack'){e.preventDefault();const cc=S.chars&&S.chars[S.active];if(S.phase==='play'&&cc&&cc.carry&&!cc.modal&&!(S.edit&&cc.area==='shop')){cancelCarry(cc);return}const ctx=navContext(S.active);if(ctx)navBack(ctx);else if(S.phase==='play')togglePause();return}
  if(e.repeat&&['Space','Enter','KeyE','KeyF','Slash'].includes(e.code))return;
  KEYS.add(e.code);
  if(S.phase!=='play')return;
  if(S.mode==='solo'){if(['Space','Enter','KeyE'].includes(e.code))doAction(S.active);if(e.code==='Tab'||e.code==='KeyQ'){e.preventDefault();swapChar()}}
  else{if(e.code==='Space'||e.code==='KeyF')doAction(0);if(e.code==='Enter'||e.code==='Slash')doAction(1)}
});
addEventListener('keyup',e=>KEYS.delete(e.code));
function keyVec(set){
  const m={w:['KeyW'],s:['KeyS'],a:['KeyA'],d:['KeyD']},ar={w:['ArrowUp'],s:['ArrowDown'],a:['ArrowLeft'],d:['ArrowRight']};
  const use=set==='wasd'?m:set==='arrows'?ar:{w:[...m.w,...ar.w],s:[...m.s,...ar.s],a:[...m.a,...ar.a],d:[...m.d,...ar.d]};
  const on=k=>use[k].some(c=>KEYS.has(c));
  return [(on('d')?1:0)-(on('a')?1:0),(on('s')?1:0)-(on('w')?1:0)];
}
function inputFor(i){
  if(S.mode==='solo'){if(i!==S.active)return [0,0];const k=keyVec('both'),b0=bindVec(0),b1=bindVec(1);return [clamp(JOY[0].x+k[0]+PADVEC[0][0]+b0[0]+b1[0],-1,1),clamp(JOY[0].y+k[1]+PADVEC[0][1]+b0[1]+b1[1],-1,1)]}
  const k=keyVec(i===0?'wasd':'arrows'),b=bindVec(i);return [clamp(JOY[i].x+k[0]+PADVEC[i][0]+b[0],-1,1),clamp(JOY[i].y+k[1]+PADVEC[i][1]+b[1],-1,1)];
}
function swapChar(){
  if(S.mode!=='solo')return;
  if(S.chars[S.active].modal){toast(S.active,'열려 있는 창을 먼저 닫아 주세요');return}
  S.active=1-S.active;JOY[0].x=JOY[0].y=0;const k=document.querySelector('.knob');if(k)k.style.transform='';refreshControls();
}
function buildControls(){
  const root=$('#controls');root.innerHTML='';
  const joy=(slot,side)=>{
    const z=document.createElement('div');z.className='joyzone '+side;z.dataset.slot=slot;z.innerHTML='<div class="base"><div class="knob"></div></div>';
    const base=z.querySelector('.base'),knob=z.querySelector('.knob');let pid=null;
    const setV=e=>{const r=base.getBoundingClientRect();const R=r.width/2;let dx=e.clientX-(r.left+R),dy=e.clientY-(r.top+R);const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d}knob.style.transform=`translate(${dx}px,${dy}px)`;JOY[slot].x=dx/R;JOY[slot].y=dy/R};
    z.addEventListener('pointerdown',e=>{if(pid!==null)return;pid=e.pointerId;try{z.setPointerCapture(pid)}catch(_){}setV(e);e.preventDefault()});
    z.addEventListener('pointermove',e=>{if(e.pointerId===pid)setV(e)});
    const end=e=>{if(e.pointerId!==pid)return;pid=null;knob.style.transform='';JOY[slot].x=0;JOY[slot].y=0};
    z.addEventListener('pointerup',end);z.addEventListener('pointercancel',end);return z;
  };
  const act=(slot,pos)=>{const b=document.createElement('button');b.className='act '+pos;b.dataset.slot=slot;b.textContent='행동';b.addEventListener('pointerdown',e=>{e.preventDefault();doAction(S.mode==='solo'?S.active:slot)});return b};
  if(S.mode==='solo'){root.append(joy(0,'left'),act(0,'pos-right'));const sw=document.createElement('button');sw.className='btn swap';sw.id='swapBtn';sw.addEventListener('pointerdown',e=>{e.preventDefault();swapChar()});root.append(sw)}
  else root.append(joy(0,'left'),act(0,'pos-li'),joy(1,'right'),act(1,'pos-ri'));
  refreshControls();
}
function refreshControls(){
  const sw=$('#swapBtn');if(sw){const o=PAL[1-S.active];sw.textContent=`${o.name}로 바꾸기`;sw.style.borderColor=o.tag}
  document.querySelectorAll('.act').forEach(b=>{const p=S.mode==='solo'?S.active:+b.dataset.slot;b.classList.toggle('p0',p===0);b.classList.toggle('p1',p===1)});
  updateControlVisibility();
}
function updateControlVisibility(){
  const root=$('#controls');const touch=(window.matchMedia&&matchMedia('(pointer: coarse)').matches);root.style.display=S.phase==='play'&&(TOUCH_MODE||(touch&&!padsList().length))?'block':'none';
  const bz=m=>!!m&&m.type!=='talk';
  if(S.mode==='solo'){const busy=bz(S.chars[S.active]&&S.chars[S.active].modal);root.querySelectorAll('.joyzone,.act,.swap').forEach(el=>el.classList.toggle('hide',busy))}
  else root.querySelectorAll('[data-slot]').forEach(el=>el.classList.toggle('hide',bz(S.chars[+el.dataset.slot]&&S.chars[+el.dataset.slot].modal)));
}
function updateActionButtons(){
  document.querySelectorAll('.act').forEach(b=>{const p=S.mode==='solo'?S.active:+b.dataset.slot;const c=S.chars[p];if(!c)return;const [txt,ok]=actionLabel(c);const key=txt+ok;if(b.dataset.k!==key){b.dataset.k=key;b.textContent=txt;b.classList.toggle('ready',ok)}});
}

/* ---------- toasts ---------- */
const toastEls={};
function showToast(side,msg){
  let el=toastEls[side];if(!el){el=document.createElement('div');el.className='toast '+side;$('#toasts').append(el);toastEls[side]=el}
  el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2400);
}
function toast(i,msg){showToast(S.mode==='solo'?'tc':'t'+i,(S.mode==='solo'?`${PAL[i].name}: `:'')+msg)}
function toastAll(msg){showToast('tc',msg)}
