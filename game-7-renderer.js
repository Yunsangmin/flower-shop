'use strict';
/* 우리 둘의 꽃집 — 7-renderer.js : GPU 렌더러(Phaser)
   (파일은 index.html 에 적힌 순서대로 불러와요. 앞 파일의 함수·변수를 뒤 파일이 이어서 씀) */
/* =====================================================================
   GPU 렌더러 (Phaser 4)
   - 게임 규칙·저장·입력·창(HTML)은 그대로. 그리는 방식만 바뀐다.
   - 기존 그리기 함수(drawStationV, drawDecor, drawChar …)로 "한 번만" 그려서
     텍스처(도장)로 구워 두고, Phaser가 GPU로 찍는다.
   - Phaser를 못 쓰는 환경이면 예전 방식(renderLegacy)으로 자동 복귀.
   ===================================================================== */
let BAKE=null,CHT=null;
function NOW(){if(BAKE)BAKE.timed=true;return performance.now()}
const TAU=Math.PI*2;
const AOFF={shop:0,market:4000,supply:8000,town:12000,north:16000};
const PR={on:false,game:null,sc:null,bgCam:null,cams:[],scr:null,R:1,frame:0,now:0,
  tex:new Map(),recs:new Map(),areaObj:{},pills:[],pillImgs:[],fades:[],g2:null,
  ovDirty:false,lastRev:-1,wf:0,sf:0,maxTex:4096,palIds:new Map()};
const OIDS=new WeakMap();let OIDN=0;
function prOid(o){let v=OIDS.get(o);if(v==null){v=++OIDN;OIDS.set(o,v)}return v}
function prRound(k,v){return typeof v==='number'?(Math.abs(v)>=2?Math.round(v):Math.round(v*20)/20):v}
function prCol(c){
  if(typeof c!=='string')return [0xffffff,1];c=c.trim();
  if(c[0]==='#'){let h=c.slice(1);if(h.length===3)h=h.split('').map(x=>x+x).join('');return [parseInt(h.slice(0,6),16),h.length>=8?parseInt(h.slice(6,8),16)/255:1]}
  const m=c.match(/rgba?\(([^)]+)\)/);if(m){const p=m[1].split(',').map(x=>parseFloat(x));return [((p[0]&255)<<16)|((p[1]&255)<<8)|(p[2]&255),p.length>3?p[3]:1]}
  return [0xffffff,1];
}

/* ---------- 화질(렌더 배율) ---------- */
function prIsTV(){return /Web0S|webOS|SmartTV|SMART-TV|NetCast|HbbTV/i.test(navigator.userAgent)}
function prResolution(){
  const dpr=window.devicePixelRatio||1;
  if(SET.gfx==='lite')return Math.min(dpr,.6);
  if(SET.gfx==='high')return Math.min(2,dpr);
  return prIsTV()?Math.min(dpr,.8):Math.min(2,dpr);
}
function prFullZoom(area){const H=Math.max(1,CH-48);return Math.min(CW/VW,H/VH)*wideZ(area)}
function prBakeScale(area){return Math.max(1,Math.min(7,Math.round(prFullZoom(area)*PR.R*4)/4))}

/* ---------- 시작 ---------- */
function prBoot(){
  if(!window.Phaser||location.search.indexOf('legacy')>=0)return false;
  try{
    PR.R=prResolution();
    const host=document.createElement('div');host.id='phaserHost';
    host.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:0;pointer-events:none';
    canvas.parentNode.insertBefore(host,canvas);
    PR.host=host;
    PR.game=new Phaser.Game({
      type:Phaser.AUTO,parent:host,width:Math.max(2,Math.round(CW*PR.R)),height:Math.max(2,Math.round(CH*PR.R)),
      backgroundColor:prBgColor(),banner:false,
      scale:{mode:Phaser.Scale.NONE},
      canvasStyle:'width:100vw;height:100vh;display:block',
      render:{antialias:true,roundPixels:false,powerPreference:'high-performance',transparent:false},
      fps:{target:60,smoothStep:true},
      audio:{noAudio:true},input:{keyboard:false,mouse:false,touch:false,gamepad:false,wheel:false},
      scene:{key:'w',create(){PR.sc=this;try{prCreate()}catch(e){console.error(e);prFail(e)}},update(t){if(PR.on)prTick(t)}}
    });
    return true;
  }catch(e){console.error('Phaser 시작 실패',e);return false}
}
function prFail(e){PR.on=false;try{PR.game&&PR.game.destroy(true)}catch(_){ }if(PR.host)PR.host.remove();resize();requestAnimationFrame(loop)}
function prBgColor(){return DARK.matches&&!document.documentElement.dataset.theme?'#2F3A36':'#E3EFE6'}
function prCreate(){
  const sc=PR.sc;
  try{let g0=0;PR.game.events.on('prerender',()=>{g0=performance.now()});PR.game.events.on('postrender',()=>{if(PERF.on){PERF.gpu+=performance.now()-g0;perfFrame(performance.now())}})}catch(e){}
  perfShow();
  PR.maxTex=(sc.renderer&&sc.renderer.getMaxTextureSize)?sc.renderer.getMaxTextureSize():4096;
  PR.bgCam=sc.cameras.main;PR.bgCam.setBackgroundColor(prBgColor());
  PR.cams=[sc.cameras.add(0,0,10,10,false,'w0'),sc.cameras.add(0,0,10,10,false,'w1')];
  PR.scr=sc.cameras.add(0,0,sc.scale.width,sc.scale.height,false,'scr');
  PR.cams.forEach(c=>{c.roundPixels=false;c.setVisible(false)});
  PR.wf=PR.bgCam.id|PR.scr.id;PR.sf=PR.bgCam.id|PR.cams[0].id|PR.cams[1].id;
  PR.g2=prS(sc.add.graphics()).setDepth(1e7);
  PR.fades=[0,1].map(()=>prS(sc.add.rectangle(0,0,10,10,0xFFF8EE,1).setOrigin(0,0).setDepth(9e6).setVisible(false)));
  sc.textures.addCanvas('prLight',lightSprite());
  PR.on=true;resize();
}
function prW(o){o.cameraFilter=PR.wf;return o}
function prS(o){o.cameraFilter=PR.sf;return o}
function prResize(){
  if(!PR.on)return;PR.R=prResolution();
  const w=Math.max(2,Math.round(CW*PR.R)),h=Math.max(2,Math.round(CH*PR.R));
  PR.game.scale.resize(w,h);PR.scr.setViewport(0,0,w,h);PR.bgCam.setViewport(0,0,w,h);
  const cv=PR.game.canvas;cv.style.width='100vw';cv.style.height='100vh';
  PR.bgCam.setBackgroundColor(prBgColor());
  // 배율이 바뀌면 구운 그림을 모두 새로
  for(const r of PR.recs.values())r.sig=null;
  prDropTex(k=>k.startsWith('c|')||k.startsWith('i|')||k.startsWith('fx|')||k.startsWith('pill|'));
}
function prDropTex(test){const T=PR.sc.textures;for(const [k,e] of PR.tex){if(test(k)){if(T.exists(k))T.remove(k);PR.tex.delete(k)}}}

/* ---------- 텍스처(도장) 관리 ---------- */
function prTex(key,w,h){
  const T=PR.sc.textures;let e=PR.tex.get(key);
  if(e&&(e.w!==w||e.h!==h)){if(T.exists(key))T.remove(key);PR.tex.delete(key);e=null}
  if(!e){if(T.exists(key))T.remove(key);const t=T.createCanvas(key,w,h);t.imageData=t.data=t.pixels=t.buffer=null;/* Phaser가 만들어 두는 픽셀 복사본은 안 써서 바로 버려요(메모리 절약) */e={key,w,h,t,g:t.getContext(),used:PR.frame};PR.tex.set(key,e)}
  e.used=PR.frame;return e;
}
function prTexLRU(){
  /* 사람·물건 그림은 쓰는 만큼만 보관(약 40MB 넘으면 오래 안 쓴 것부터 정리) */
  if(PR.frame%60)return;let bytes=0;const arr=[];
  for(const e of PR.tex.values())if(e.key[0]==='c'||e.key[0]==='i'||e.key.startsWith('pill|')||e.key.startsWith('fx|cloud')){bytes+=e.w*e.h*4;arr.push(e)}
  const CAP=(prIsTV()?56:80)*1048576;if(bytes<CAP)return;
  // 1차: 10초 넘게 안 쓴 것부터 75%까지 / 2차(그래도 넘치면): 1초 넘게 안 쓴 것만 한도 아래까지 → 걷기 동작처럼 곧 다시 쓸 그림을 지웠다 다시 굽는 일을 줄임
  arr.sort((a,b)=>a.used-b.used);const drop=e=>{PR.sc.textures.remove(e.key);PR.tex.delete(e.key);bytes-=e.w*e.h*4;e.dead=1};
  for(const e of arr){if(bytes<CAP*.75)break;if(e.used>=PR.frame-600)break;drop(e)}
  if(bytes>=CAP)for(const e of arr){if(bytes<CAP)break;if(e.dead||e.used>=PR.frame-60)continue;drop(e)}
}
/* 건물·가구 그림 보관: 한도 안이면 계속 보관(다시 가도 바로 보임), 넘으면 15초 넘게 안 본 것부터 정리 */
function prStaticTrim(){
  if(PR.frame%60)return;let bytes=0;
  for(const e of PR.tex.values())if(!(e.key[0]==='c'||e.key[0]==='i'||e.key.startsWith('pill|')||e.key.startsWith('fx|cloud')))bytes+=e.w*e.h*4;
  const CAP=(prIsTV()?64:160)*1048576;if(bytes<CAP)return;
  const old=[...PR.recs.values()].filter(r=>PR.frame-r.seen>900).sort((a,b)=>a.seen-b.seen);
  for(const r of old){if(bytes<CAP*.85)break;let b=0;(r.layers||[]).forEach(e=>{b+=e.w*e.h*4});prKillRec(r);PR.recs.delete(r.id);bytes-=b}
}
/* 맵 바닥 그림: 여러 맵을 다녀와 한도를 넘으면 30초 넘게 안 간 맵 바닥부터 비움(다시 가면 금방 새로 그림) */
function prBgTrim(){
  if(PR.frame%60!==30)return;let bytes=0;const list=[];
  for(const [a,o] of Object.entries(PR.areaObj)){if(!o.bgKey||!o.bgCv)continue;const b=o.bgCv.width*o.bgCv.height*4;bytes+=b;if(PR.frame-(o.seenF||0)>1800)list.push([a,o,b])}
  const CAP=(prIsTV()?48:120)*1048576;if(bytes<CAP)return;
  list.sort((p,q)=>(p[1].seenF||0)-(q[1].seenF||0));
  for(const [a,o,b] of list){if(bytes<CAP)break;o.bg.setTexture('__DEFAULT').setVisible(false);if(PR.sc.textures.exists(o.bgKey))PR.sc.textures.remove(o.bgKey);OIDS.delete(o.bgCv);
    for(const k in BG_CACHE)if(k.startsWith(a+'|'))delete BG_CACHE[k];o.bgKey=null;o.bgCv=null;bytes-=b}
}
/* 그리기 중간에 캔버스를 바꿔 끼우는 대리 객체(점원을 따로 떼어 내기 위함) */
function prProxy(){
  let tgt=null;
  const P=new Proxy({},{get(_,k){const v=tgt[k];return typeof v==='function'?v.bind(tgt):v},set(_,k,v){tgt[k]=v;return true}});
  return {P,get:()=>tgt,set:t=>{if(tgt&&t){t.setTransform(tgt.getTransform());['globalAlpha','fillStyle','strokeStyle','lineWidth','lineCap','lineJoin','font','textAlign','textBaseline','globalCompositeOperation'].forEach(k=>{t[k]=tgt[k]})}tgt=t}};
}

/* ---------- 구울 때의 크기(측정값 + 여유) ---------- */
const PR_STB={storage:[0,-36,0,4.5],wardrobe:[-2,-38.5,0,3.5],bucket:[0,-24,0,1],craft:[-.3,-26,.3,3.3],wrap:[-.3,-23,.3,3.3],dryer:[0,-27,0,2],trim:[0,-14,0,2.5],board:[0,-12,0,2],trash:[0,-4,0,1],counter:[0,-24,0,3.5],phone:[0,-8,0,1],pickup:[0,-24,0,2],display:[0,-24,0,3.5],stall:[-.8,-28,.3,5.3],seedstall:[-.3,-32,.3,5.3],keeper:[0,-29,0,3.5],bench:[0,-3,0,1],plot:[0,-20,0,1],sprspot:[-14,-14,14,8],shelf:[0,-14,0,2]};
const PR_DEB={tree:[-4,-23,4.8,2],lamp:[0,-28,0,0],table:[-6.5,-12,6.5,1.5],waitbench:[0,-4,0,1],bigplant:[-4,-13,4,.8],easel:[0,-9,0,.5],crate:[0,-6,1.5,.8],planterTree:[0,-14,0,.8],bucketRow:[-.3,-10,0,1],boxes:[0,-7,0,1],tallshelf:[0,-26,0,3],tooltable:[-.3,-4,.3,3.3],pottable:[-.3,-3,.3,3.3],fridgeDemo:[0,-20,0,1.8],seedRack:[0,-14,0,.8],canRack:[0,-14,0,.8],clocktower:[0,-80,.8,2],fenceH:[-1,-2,2,2],fenceV:[0,0,0,0],shed:[0,-4,0,2.5],mailbox:[0,-3,0,0],planterBox:[0,-6,0,1],hoursSign:[-.5,-9,.5,.5],school:[-8,-92,32,8],schoolclock:[-4,-126,4,0],playmat:[0,-4,0,0],swing:[0,-16,0,2],slide:[0,-20,1,1],sandbox:[0,0,0,0]};
function prBounds(tab,type,x,y,w,h,d){let b=tab[type];if(typeof b==='function')b=b(d||{});b=b||[-12,-44,12,8];return [x+Math.min(0,b[0])-8,y+Math.min(0,b[1])-12,w+Math.max(0,b[2])-Math.min(0,b[0])+16,h+Math.max(0,b[3])-Math.min(0,b[1])+18]}

/* ---------- 가구·장식 굽기 ---------- */
function prBakeStatic(rec,area,drawFn,B){
  const sc=prBakeScale(area),W=Math.min(PR.maxTex,Math.ceil(B[2]*sc)+2),H=Math.min(PR.maxTex,Math.ceil(B[3]*sc)+2);
  const px=prProxy();const layers=[];const chars=[];const fx=[];
  const next=()=>{const e=prTex(rec.id+'|'+layers.length,W,H);const g=e.g;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.globalAlpha=1;
    if(!px.get())g.setTransform(sc,0,0,sc,-B[0]*sc+1,-B[1]*sc+1);px.set(g);layers.push(e)};
  next();
  const oldRS=RENDER_SCALE,oldV=VIEW;RENDER_SCALE=sc;VIEW=null;
  BAKE={timed:false,ax:0,ay:0,fx,onChar:(a)=>{chars.push(a);next()}};
  try{drawFn(px.P)}catch(e){console.error(e)}
  const timed=BAKE.timed;BAKE=null;RENDER_SCALE=oldRS;VIEW=oldV;
  layers.forEach(e=>e.t.refresh());
  // 남는 예전 층 정리
  for(let i=layers.length;i<(rec.nl||0);i++){const k=rec.id+'|'+i;if(PR.sc.textures.exists(k))PR.sc.textures.remove(k);PR.tex.delete(k)}
  rec.nl=layers.length;rec.layers=layers;rec.vchars=chars;rec.fx=fx;rec.timed=timed;rec.B=B;rec.sc=sc;rec.bt=PR.now;
}
function prSetTex(im,key){const t=PR.sc.textures.get(key);if(im.texture!==t)im.setTexture(key);return im}
function prImg(key){const im=prW(PR.sc.add.image(0,0,key).setOrigin(0,0));return im}
function prPlaceStatic(rec,area,depth){
  const ox=AOFF[area],sc=rec.sc,B=rec.B;
  rec.imgs=rec.imgs||[];
  rec.layers.forEach((e,i)=>{let im=rec.imgs[i];if(!im){im=rec.imgs[i]=prImg(e.key)}else prSetTex(im,e.key);
    im.setPosition(ox+B[0]-1/sc,B[1]-1/sc).setScale(1/sc).setDepth(depth-.009+i*.002).setVisible(true)});
  for(let i=rec.layers.length;i<rec.imgs.length;i++)rec.imgs[i].setVisible(false);
  // 점원(가판대 안의 사람)
  rec.cimgs=rec.cimgs||[];
  rec.vchars.forEach((a,i)=>{const s=prCharSprite(rec.cimgs,i,area,a.x,a.y,a.p,a.dir,a.phase,a.moving,a.glasses,a.work,a.sit);s.setDepth(depth-.008+i*.002)});
  for(let i=rec.vchars.length;i<rec.cimgs.length;i++)rec.cimgs[i].setVisible(false);
  prPlaceFx(rec,area,0,0,depth+.0005);
}
function prHideRec(rec){['imgs','cimgs','fimgs','himgs'].forEach(k=>(rec[k]||[]).forEach(o=>o.setVisible(false)));if(rec.sub)rec.sub.forEach(prHideRec)}
function prKillRec(rec){for(const k of [...PR.tex.keys()])if(k.startsWith('L|'+rec.id+'|')){PR.sc.textures.remove(k);PR.tex.delete(k)}['imgs','cimgs','fimgs','himgs'].forEach(k=>(rec[k]||[]).forEach(o=>o.destroy()));for(let i=0;i<(rec.nl||0);i++){const k=rec.id+'|'+i;if(PR.sc.textures.exists(k))PR.sc.textures.remove(k);PR.tex.delete(k)}if(rec.sub)rec.sub.forEach(prKillRec)}

/* ---------- 물방울 반짝임·냉장고 물결(따로 움직이는 작은 효과) ---------- */
function prFxTex(kind,s,sc){
  const key='fx|'+kind+'|'+s+'|'+sc;if(PR.tex.has(key)){PR.tex.get(key).used=PR.frame;return PR.tex.get(key)}
  let W,H,draw;
  if(kind==='spk'){W=H=Math.ceil(s*.8*sc)+4;draw=g=>{g.translate(W/2,H/2);g.scale(sc,sc);el(g,0,0,s*.18,s*.18,'#FFFFFF');ln(g,-s*.35,0,s*.35,0,'#FFFFFF',.3);ln(g,0,-s*.35,0,s*.35,'#FFFFFF',.3)}}
  else{W=Math.ceil(6.4*sc)+4;H=Math.ceil(2.8*sc)+4;draw=g=>{g.translate(W/2,H/2);g.scale(sc,sc);el(g,0,0,s,s*.4,'#FFFFFF')}}
  const e=prTex(key,W,H);e.g.setTransform(1,0,0,1,0,0);e.g.clearRect(0,0,W,H);draw(e.g);e.g.setTransform(1,0,0,1,0,0);e.t.refresh();e.cx=W/2;e.cy=H/2;return e;
}
function prPlaceFx(rec,area,ax,ay,depth){
  rec.fimgs=rec.fimgs||[];const ox=AOFF[area],sc=rec.sc||prBakeScale(area);let n=0;
  const put=(key,x,y,a,cx,cy)=>{let im=rec.fimgs[n];if(!im)im=rec.fimgs[n]=prImg(key);else prSetTex(im,key);im.setOrigin(0,0).setPosition(ox+x-cx/sc,y-cy/sc).setScale(1/sc).setAlpha(a).setDepth(depth+n*1e-5).setVisible(true);n++};
  (rec.fx||[]).forEach(f=>{
    if(f.k==='spk'){const e=prFxTex('spk',f.s,sc);const x=ax+f.x,y=ay+f.y;const a=(Math.sin(PR.now/400+x)+1)/2;put(e.key,x,y,(.35+.55*a),e.cx,e.cy)}
    else if(f.k==='shim'){const tt=PR.now/900;const e1=prFxTex('ell',3,sc),e2=prFxTex('ell',2.5,sc);
      put(e1.key,ax+f.x+6+Math.sin(tt)*2,ay+f.y+19,.35,e1.cx,e1.cy);put(e2.key,ax+f.x+f.w-8+Math.cos(tt)*2,ay+f.y+19.5,.35,e2.cx,e2.cy)}
  });
  for(let i=n;i<rec.fimgs.length;i++)rec.fimgs[i].setVisible(false);
}

/* ---------- 사람(16방향 × 걷기 동작) 굽기 ---------- */
function prPalKey(p){let j;try{j=JSON.stringify(p)}catch(e){j=String(prOid(p))}let v=PR.palIds.get(j);if(v==null){v=PR.palIds.size+1;PR.palIds.set(j,v)}return v}
const PR_CB=[-16,-46,32,52];
function prCharTex(area,x,p,dir,phase,moving,glasses,work,sit){
  const sc=PR.npc?Math.max(1,Math.round(prBakeScale(area)*.8*4)/4):prBakeScale(area); // 주민·손님은 도장을 조금 작게(메모리 절약)
  const an=typeof dir==='number'?dir:(DIR_ANG[dir]||0);let q=Math.round(an/(Math.PI/8));if(q<=-8)q=8;if(q>8)q-=16;
  let fk,ph=0,bob=0,wk=0;
  /* 주민·손님(PR.npc)은 걷기 8단계·서 있을 때 숨쉬기 없음 → 도장 수를 크게 줄여 메모리·첫 굽기 부담을 낮춤. SM·SK는 그대로 부드럽게 */
  if(moving){let f=Math.round((((phase%TAU)+TAU)%TAU)/(TAU/16))%16;if(PR.npc)f=(f>>1)<<1;fk='m'+f;ph=f*TAU/16}
  else{const b=PR.npc?0:Math.round(Math.sin(PR.now/600+(sit?0:(x%7)))*4);fk='i'+b;bob=b/4*1.1}
  if(work){const w=Math.round(Math.sin(PR.now/90)*4);fk+='w'+w;wk=w/4*.18}
  const key='c|'+prPalKey(p)+'|'+q+'|'+fk+'|'+(glasses?1:0)+(sit?1:0)+'|'+sc;
  let e=PR.tex.get(key);if(e){e.used=PR.frame;return e}
  const W=Math.ceil(PR_CB[2]*sc)+2,H=Math.ceil(PR_CB[3]*sc)+2;e=prTex(key,W,H);const g=e.g;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.setTransform(sc,0,0,sc,-PR_CB[0]*sc+1,-PR_CB[1]*sc+1);
  CHT={bob,wk};try{drawChar(g,0,0,p,q*Math.PI/8,ph,moving,glasses,work,sit)}catch(err){console.error(err)}CHT=null;
  g.setTransform(1,0,0,1,0,0);e.t.refresh();e.sc=sc;return e;
}
function prCharSprite(arr,i,area,x,y,p,dir,phase,moving,glasses,work,sit){
  const e=prCharTex(area,x,p,dir,phase,moving,glasses,work,sit);let im=arr[i];
  if(!im)im=arr[i]=prImg(e.key);else prSetTex(im,e.key);
  im.setPosition(AOFF[area]+x+PR_CB[0]-1/e.sc,y+PR_CB[1]-1/e.sc).setScale(1/e.sc).setVisible(true);return im;
}

/* ---------- 엔티티(화면에 놓이는 것들) 동기화 ---------- */
function prRec(id){let r=PR.recs.get(id);if(!r){r={id,seen:0,sig:null};PR.recs.set(id,r)}r.seen=PR.frame;return r}
function prStSig(s){
  let x;try{x=JSON.stringify(s,prRound)}catch(e){x=String(PR.frame)}
  switch(s.type){
    case 'craft':x+=JSON.stringify(S.works,prRound)+JSON.stringify(S.bench,prRound);break;
    case 'storage':case 'trim':case 'wrap':x+=JSON.stringify(S.up);break;
    case 'counter':x+=S.shopName;break;
    case 'stall':case 'seedstall':x+=(S.t>=MARKET_CLOSE);break;
    case 'sprspot':x+=(S.t<20);break;
  }
  return x+'|'+prBakeScale(s.area);
}
function prDecSig(d,area){
  let x=d.t+'|'+d.x+'|'+d.y+'|'+d.w+'|'+d.h+'|'+(d.v||'')+'|'+(d.seed||'');
  try{x=JSON.stringify(d,prRound)}catch(e){}
  if(d.t==='clocktower'||d.t==='hoursSign'||d.t==='schoolclock')x+=Math.floor(S.t);
  if(d.t==='swing')x+='|'+(S.swingOcc||[]).join();
  if(d.t==='lamp')x+=Math.round(lampAt(S.t)*40)+'|'+Math.floor(S.t/10);
  return x+'|'+prBakeScale(area);
}
function prSyncStatic(id,area,depth,sigFn,drawFn,boundsFn){
  const r=prRec(id);
  const check=r.sig===null||S.rev!==r.rev||((PR.frame+(r.h||(r.h=(id.length*7)%6)))%6===0);
  if(check){r.rev=S.rev;const sg=sigFn();if(sg!==r.sig){r.sig=sg;prBakeStatic(r,area,drawFn,boundsFn())}}
  if(r.timed&&PR.now-r.bt>83)prBakeStatic(r,area,drawFn,boundsFn());
  prPlaceStatic(r,area,depth);return r;
}
function prSyncArea(area){
  const S0=[];
  /* 바닥 러그 등(맨 아래) */
  DECOR[area].forEach((d,k)=>{if(d.flat&&d.walk&&!d.carried&&inView((d.x+d.w/2)*TILE,(d.y+d.h)*TILE,d.w*8+20))
    prSyncStatic('d'+prOid(d),area,-1.5e6+k,()=>prDecSig(d,area),g=>drawDecor(g,d),()=>prBounds(PR_DEB,d.t,d.x*TILE,d.y*TILE,d.w*TILE,d.h*TILE,d))});
  stationsIn(area).forEach(s=>{if(!inView((s.x+s.w/2)*TILE,(s.y+s.h)*TILE,s.w*8+30))return;
    prSyncStatic('s'+s.id,area,(s.y+s.h)*TILE-(s.type==='bench'?6:2),()=>prStSig(s),g=>drawStationV(g,s),()=>prBounds(PR_STB,s.type,s.x*TILE,s.y*TILE,s.w*TILE,s.h*TILE))});
  DECOR[area].forEach(d=>{if(d.flat||d.carried||!inView((d.x+d.w/2)*TILE,(d.y+d.h)*TILE,d.w*8+(d.vm||(d.t==='school'?120:40))))return;
    const r=d.share?prSyncShared(d,area):prSyncStatic('d'+prOid(d),area,(d.y+d.h)*TILE-2,()=>prDecSig(d,area),g=>drawDecor(g,d),()=>prBounds(PR_DEB,d.t,d.x*TILE,d.y*TILE,d.w*TILE,d.h*TILE,d));prFade(r,d,area)});
}
/* 똑같이 생긴 장식(캠퍼스 나무 등)은 그림 하나를 같이 써요(d.share = 모양 이름) → 수백 그루여도 굽는 양·메모리가 적음 */
function prSyncShared(d,area){
  const sc=prBakeScale(area),tr=prRec('S|'+d.share);
  if(tr.sig!==d.share+'|'+sc||!tr.layers||!tr.layers.length||!PR.sc.textures.exists(tr.layers[0].key)){tr.sig=d.share+'|'+sc;const t={...d,x:0,y:0};prBakeStatic(tr,area,g=>drawDecor(g,t),prBounds(PR_DEB,d.t,0,0,d.w*TILE,d.h*TILE,d))}
  const r=prRec('d'+prOid(d));r.imgs=r.imgs||[];const e=tr.layers[0];let im=r.imgs[0];if(!im)im=r.imgs[0]=prImg(e.key);else prSetTex(im,e.key);
  im.setPosition(AOFF[area]+d.x*TILE+tr.B[0]-1/tr.sc,d.y*TILE+tr.B[1]-1/tr.sc).setScale(1/tr.sc).setDepth((d.y+d.h)*TILE-2-.009).setVisible(true);
  return r}
/* 건물·나무가 캐릭터를 가리면 캐릭터 둘레만 반투명하게(가운데일수록 투명, 바깥으로 갈수록 원래대로)
   · 같은 그림을 잘라(crop) 여러 조각으로 나눠 조각마다 투명도를 다르게 → 새 그림을 굽지 않아 가벼움
   · 새 장소는 d.coverFn(캐릭터들)이 가려진 캐릭터 목록을 돌려주면 더 정확해요 */
function prCover(d,area){
  if(d.nofade)return null;const cs=S.chars.filter(c=>c.area===area&&!c.hidden);if(!cs.length)return null;
  if(d.coverFn){const r=d.coverFn(cs);return r&&r.length?r:null}
  let b=PR_DEB[d.t];if(typeof b==='function')b=b(d);const x0=d.x*TILE,x1=(d.x+d.w)*TILE,y1=(d.y+d.h)*TILE,top=d.y*TILE+(b?Math.min(0,b[1]):-40);
  if(y1-top<26)return null;const out=[];
  for(const c of cs){if(c.y>=y1-1)continue;if(c.x+12<x0||c.x-12>x1)continue;if(c.y+2<top)continue;out.push(c)}
  return out.length?out:null}
const PR_HOLE=[[20,30,.14],[30,42,.38],[42,56,.7]]; // [가로 반폭, 세로 반높이, 투명도] 캐릭터 몸 가운데 기준(세계 좌표)
function prFade(r,d,area){if(!r||PR.noFade)return;const cs=prCover(d,area);
  const k0=r.hk||0;let k=k0+((cs?1:0)-k0)*.22;if(Math.abs(k-(cs?1:0))<.03)k=cs?1:0;r.hk=k;
  if(cs){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const ox=AOFF[area]||0;cs.forEach(c=>{x0=Math.min(x0,c.x+ox);x1=Math.max(x1,c.x+ox);y0=Math.min(y0,c.y-20);y1=Math.max(y1,c.y-20)});r.hc=[x0,y0,x1,y1]}
  prHole(r,k>0?r.hc:null,k)}
function prHole(r,hc,k){
  r.himgs=r.himgs||[];let used=0;
  (r.imgs||[]).forEach((im,li)=>{
    if(!hc||!im.visible){if(im.isCropped)im.setCrop();if(im.alpha!==1)im.setAlpha(1);return}
    const fr=im.frame,W=fr.width,H=fr.height,sx=im.scaleX,X=im.x,Y=im.y;
    const T=(wx,wy)=>[(wx-X)/sx,(wy-Y)/sx];
    const rects=PR_HOLE.map(([hw,hh])=>{const a=T(hc[0]-hw,hc[1]-hh),b=T(hc[2]+hw,hc[3]+hh);return [Math.max(0,Math.min(W,a[0])),Math.max(0,Math.min(H,a[1])),Math.max(0,Math.min(W,b[0])),Math.max(0,Math.min(H,b[1]))]});
    const al=PR_HOLE.map(h=>1-(1-h[2])*k);
    if(rects[2][2]-rects[2][0]<1||rects[2][3]-rects[2][1]<1){if(im.isCropped)im.setCrop();im.setAlpha(1);return}
    const pieces=[[rects[0],al[0]]];
    const ring=(o,n,a)=>{pieces.push([[o[0],o[1],o[2],n[1]],a],[[o[0],n[3],o[2],o[3]],a],[[o[0],n[1],n[0],n[3]],a],[[n[2],n[1],o[2],n[3]],a])};
    ring(rects[1],rects[0],al[1]);ring(rects[2],rects[1],al[2]);ring([0,0,W,H],rects[2],1);
    let first=true;
    for(const [q,a] of pieces){const w=q[2]-q[0],h=q[3]-q[1];if(w<.5||h<.5)continue;
      let o;if(first){o=im;first=false}else{o=r.himgs[used];if(!o){o=r.himgs[used]=prW(PR.sc.add.image(0,0,im.texture.key).setOrigin(0,0))}else if(o.texture!==im.texture)o.setTexture(im.texture.key);used++;
        o.setPosition(X,Y).setScale(sx).setDepth(im.depth).setVisible(true)}
      o.setCrop(q[0],q[1],w,h);o.setAlpha(a)}
  });
  for(let i=used;i<r.himgs.length;i++)r.himgs[i].setVisible(false);
  (r.cimgs||[]).forEach(im=>im.setAlpha(hc?1-(1-PR_HOLE[1][2])*k:1));
}

/* ---------- 배경·조명 ---------- */
function prArea(area){
  let a=PR.areaObj[area];if(a)return a;
  a=PR.areaObj[area]={bg:prW(PR.sc.add.image(AOFF[area],0,'__DEFAULT').setOrigin(0,0).setDepth(-3e6)),bgKey:null,
    amb:prW(PR.sc.add.rectangle(AOFF[area],0,AREAS[area].w*TILE,AREAS[area].h*TILE,0xffffff,0).setOrigin(0,0).setDepth(5e6)),lights:[]};
  return a;
}
/* 아주 큰 장소(캠퍼스)는 바닥을 여러 조각으로 나눠 화면 근처만 그려요(한 장으로 그리면 흐릿해지거나 메모리를 많이 써서) */
const AREA_CHUNK={};
function prSyncChunks(area,a){
  const A=AREAS[area],CS=A.chunk*TILE,V=VIEW||[0,0,A.w*TILE,A.h*TILE],q=Math.min(2.5,Math.max(1,prBakeScale(area)*.65));
  a.ch=a.ch||new Map();a.bg.setVisible(false);
  const nx=Math.ceil(A.w*TILE/CS),ny=Math.ceil(A.h*TILE/CS),m=CS*.35;
  const cx0=Math.max(0,Math.floor((V[0]-m)/CS)),cx1=Math.min(nx-1,Math.floor((V[2]+m)/CS)),cy0=Math.max(0,Math.floor((V[1]-m)/CS)),cy1=Math.min(ny-1,Math.floor((V[3]+m)/CS));
  let made=0;
  for(let cy=cy0;cy<=cy1;cy++)for(let cx=cx0;cx<=cx1;cx++){
    const k=cx+','+cy;let c=a.ch.get(k);const vis=!(cx*CS>V[2]||(cx+1)*CS<V[0]||cy*CS>V[3]||(cy+1)*CS<V[1]);
    if(!c||c.q!==q){if(!vis&&made>=1)continue;
      if(c){if(PR.sc.textures.exists(c.key))PR.sc.textures.remove(c.key);c.img.destroy()}
      const cv=document.createElement('canvas');cv.width=Math.ceil(CS*q);cv.height=Math.ceil(CS*q);const g=cv.getContext('2d');g.setTransform(q,0,0,q,-cx*CS*q,-cy*CS*q);
      try{AREA_CHUNK[area](g,cx*CS,cy*CS,CS,CS)}catch(e){console.error(e)}
      const key='bgc|'+(++OIDN);PR.sc.textures.addImage(key,cv);
      c={key,q,img:prW(PR.sc.add.image(AOFF[area]+cx*CS,cy*CS,key).setOrigin(0,0).setDepth(-3e6).setScale(CS/cv.width+.0005))};a.ch.set(k,c);made++}
    c.used=PR.frame;c.img.setVisible(true)}
  for(const c of a.ch.values())if(c.used!==PR.frame)c.img.setVisible(false);
  const LIM=prIsTV()?16:24;if(a.ch.size>LIM){const old=[...a.ch.entries()].filter(([k,c])=>c.used!==PR.frame).sort((p,q2)=>p[1].used-q2[1].used);
    for(const [k,c] of old){if(a.ch.size<=LIM)break;if(PR.sc.textures.exists(c.key))PR.sc.textures.remove(c.key);c.img.destroy();a.ch.delete(k)}}
}
function prSyncBg(area){
  const a=prArea(area);a.seenF=PR.frame;
  if(AREAS[area].chunk&&AREA_CHUNK[area]){prSyncChunks(area,a);prSyncAmb(area,a);return}
  const s=prFullZoom(area);const cv=bgCanvas(area,s);
  let key=OIDS.get(cv);if(key==null){key='bg|'+(++OIDN);OIDS.set(cv,key);PR.sc.textures.addImage(key,cv)} /* addCanvas는 큰 배경 전체를 한 번 읽어 복사본을 만들어서 느려요 → 그냥 그림으로 등록 */
  if(a.bgKey!==key){const old=a.bgKey,oc=a.bgCv;a.bg.setTexture(key);a.bgKey=key;a.bgCv=cv;if(old&&PR.sc.textures.exists(old))PR.sc.textures.remove(old);if(oc)OIDS.delete(oc)}
  a.bg.setScale(AREAS[area].w*TILE/cv.width,AREAS[area].h*TILE/cv.height).setVisible(true);prSyncAmb(area,a);
}
function prSyncAmb(area,a){
  const [ac,aa]=ambientAt(S.t);const k=area==='town'?1:.7;const [col]=prCol(ac);
  a.amb.width=AREAS[area].w*TILE;a.amb.setFillStyle(col,1).setAlpha(aa*k).setVisible(aa>0);
  const L=lampAt(S.t);const ls=L>0?lightsFor(area):[];const r=(WIDE_AREAS[area]?55:80);
  ls.forEach(([lx,ly],i)=>{let im=a.lights[i];if(!im){im=a.lights[i]=prW(PR.sc.add.image(0,0,'prLight').setBlendMode(Phaser.BlendModes.ADD).setDepth(5e6+1))}
    im.setPosition(AOFF[area]+lx,ly).setDisplaySize(r*2,r*2).setAlpha(.32*L).setVisible(true)});
  for(let i=ls.length;i<a.lights.length;i++)a.lights[i].setVisible(false);
}

/* ---------- 이름표 알약(가격·예약 말풍선 등) ---------- */
function prPill(txt,x,y,bg,fg,size){PR.pills.push([txt,x,y,bg,fg,size,PR.curV])}
function prPillTex(txt,bg,fg,size){
  const R=PR.R;const key='pill|'+txt+'|'+bg+'|'+fg+'|'+size+'|'+CH+'|'+R;let e=PR.tex.get(key);if(e){e.used=PR.frame;return e}
  const sz=Math.round((size||11)*Math.max(1.35,Math.min(2.4,CH/330)));
  const m=document.createElement('canvas').getContext('2d');m.font=`${sz}px 'Jua','Gowun Dodum',sans-serif`;
  const w=m.measureText(txt).width+sz*1.1,h=sz+sz*.75;const W=Math.ceil(w*R)+4,H=Math.ceil(h*R)+4;
  e=prTex(key,W,H);const g=e.g;g.setTransform(R,0,0,R,2,2);g.clearRect(-2,-2,W,H);
  g.fillStyle=bg;g.beginPath();const r=h/2;g.moveTo(r,0);g.arcTo(w,0,w,h,r);g.arcTo(w,h,0,h,r);g.arcTo(0,h,0,0,r);g.arcTo(0,0,w,0,r);g.closePath();g.fill();
  g.fillStyle=fg;g.font=`${sz}px 'Jua','Gowun Dodum',sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,h/2+1);
  g.setTransform(1,0,0,1,0,0);e.t.refresh();e.pw=w;e.ph=h;return e;
}
function prFlushPills(){
  const R=PR.R;PR.pills.forEach(([txt,x,y,bg,fg,size,v],i)=>{const e=prPillTex(txt,bg,fg,size);let im=PR.pillImgs[i];
    if(!im)im=PR.pillImgs[i]=prS(PR.sc.add.image(0,0,e.key).setOrigin(0,0).setDepth(8e6));else prSetTex(im,e.key);
    const px=Math.round((x-e.pw/2)*R)-2,py=Math.round((y-e.ph)*R)-2;im.setPosition(px,py).setVisible(true);
    if(v){const cx0=Math.max(0,v[0]*R-px),cy0=Math.max(0,v[1]*R-py),cx1=Math.min(e.w,v[2]*R-px),cy1=Math.min(e.h,v[3]*R-py);
      if(cx1<=cx0||cy1<=cy0)im.setVisible(false);else if(cx0>0||cy0>0||cx1<e.w||cy1<e.h)im.setCrop(cx0,cy0,cx1-cx0,cy1-cy0);else im.setCrop()}else im.setCrop()});
  for(let i=PR.pills.length;i<PR.pillImgs.length;i++)PR.pillImgs[i].setVisible(false);
  PR.pills.length=0;
}

/* ---------- 화면 모서리·테두리 ---------- */
function prFrame(g,x,y,w,h,r,bgc,stroke){
  const R=PR.R;x*=R;y*=R;w*=R;h*=R;r*=R;const [bc]=prCol(bgc);g.fillStyle(bc,1);
  const corner=(cx,cy,sx,sy)=>{g.beginPath();g.moveTo(cx,cy);for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;g.lineTo(cx+sx*(r-r*Math.cos(a)),cy+sy*(r-r*Math.sin(a)))}g.lineTo(cx,cy);g.closePath();g.fillPath()};
  corner(x,y,1,1);corner(x+w,y,-1,1);corner(x,y+h,1,-1);corner(x+w,y+h,-1,-1);
  const [sc,sa]=prCol(stroke);g.lineStyle(2*R,sc,sa);g.strokeRoundedRect(x,y,w,h,r);
}

/* ---------- 매 프레임 ---------- */
function prRender(){
  PR.frame++;PR.now=performance.now();const R=PR.R;const g2=PR.g2;g2.clear();
  if(PR.ovDirty){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);PR.ovDirty=false}
  PR.sunKeep=false;
  const live=(S.phase==='play'||S.phase==='settle'||S.phase==='intro')&&S.chars.length;
  if(!live){PR.cams.forEach(c=>c.setVisible(false));for(const r of PR.recs.values())prHideRec(r);PR.fades.forEach(f=>f.setVisible(false));prFlushPills();return}
  const vps=viewports();const areas={};
  PR.cams.forEach((c,i)=>{
    const v=vps[i];if(!v){c.setVisible(false);PR.fades[i].setVisible(false);return}
    const cam=camera(v);Object.assign(v,cam);const {s,ox,oy,mw,mh}=cam;
    const x0=Math.max(v.x,ox),y0=Math.max(v.y,oy),x1=Math.min(v.x+v.w,ox+mw*s),y1=Math.min(v.y+v.h,oy+mh*s);
    const viewers=S.mode==='solo'?[S.chars[S.active]].filter(c=>v.chars.includes(c.i)):v.chars.map(i=>S.chars[i]);
    if(viewers.length&&viewers.every(sunsetView)){
      c.setVisible(false);PR.fades[i].setVisible(false);
      PR.sunKeep=true;if(PR.frame%2===0){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(v.x*DPR,v.y*DPR,v.w*DPR,v.h*DPR);ctx.restore();ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);roundRect(v.x,v.y,v.w,v.h,14);ctx.clip();drawSunsetScene(ctx,v.x,v.y,v.w,v.h,v.chars.map(i=>S.chars[i]).filter(sunsetView));ctx.restore()}
      return;
    }
    c.setVisible(true).setViewport(Math.round(x0*R),Math.round(y0*R),Math.max(1,Math.round((x1-x0)*R)),Math.max(1,Math.round((y1-y0)*R)));
    c.setZoom(s*R);c.centerOn(AOFF[v.area]+((x0+x1)/2-ox)/s,((y0+y1)/2-oy)/s);
    const vr=[(v.x-ox)/s,(v.y-oy)/s,(v.x+v.w-ox)/s,(v.y+v.h-oy)/s];
    const A=areas[v.area];areas[v.area]=A?[Math.min(A[0],vr[0]),Math.min(A[1],vr[1]),Math.max(A[2],vr[2]),Math.max(A[3],vr[3])]:vr;
    const fd=Math.max(...v.chars.map(i=>S.chars[i].fade));const F=PR.fades[i];
    if(fd>0)F.setPosition(x0*R,y0*R).setSize((x1-x0)*R,(y1-y0)*R).setAlpha(fd*.7).setVisible(true);else F.setVisible(false);
    prFrame(g2,x0,y0,x1-x0,y1-y0,14,prBgColor(),(v.split&&S.mode==='solo'&&v.chars[0]===S.active)?PAL[S.active].tag:'rgba(74,63,92,.3)');
    PR.curV=[x0,y0,x1,y1];overlays(v);PR.curV=null;
  });
  Object.keys(PR.areaObj).forEach(a=>{if(!areas[a]){const o=PR.areaObj[a];o.bg.setVisible(false);if(o.ch)o.ch.forEach(c=>c.img.setVisible(false));o.amb.setVisible(false);o.lights.forEach(l=>l.setVisible(false))}});
  for(const a in areas){VIEW=areas[a];RENDER_SCALE=prBakeScale(a);prSyncBg(a);prSyncDyn(a);prSyncArea(a);prSyncChars(a);VIEW=null}
  Object.keys(PR.areaObj).forEach(a=>{if(areas[a])return;const o=PR.areaObj[a];if(o.gu)o.gu.setVisible(false);if(o.gd)o.gd.setVisible(false)});
  for(const r of PR.recs.values()){if(r.seen!==PR.frame)prHideRec(r)}
  prStaticTrim();prBgTrim();
  if(PR.sunWas&&!PR.sunKeep){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height)}PR.sunWas=PR.sunKeep;
  prFlushPills();prTexLRU();
}

/* =====================================================================
   2단계: 사람·손님·주민·동물·들고 있는 물건·선택 테두리·발걸음 먼지
   ===================================================================== */
/* 한 엔티티가 여러 장의 그림을 쓸 때: 매 프레임 순서대로 꺼내 쓰고 남는 건 숨김 */
function prBegin(rec){rec.n=0;rec.imgs=rec.imgs||[];rec.sub=rec.sub||[];rec.sn=0}
function prNext(rec,key){let im=rec.imgs[rec.n];if(!im)im=rec.imgs[rec.n]=prImg(key);else prSetTex(im,key);rec.n++;return im.setOrigin(0,0).setAlpha(1).setVisible(true)}
function prEnd(rec){for(let i=rec.n;i<rec.imgs.length;i++)rec.imgs[i].setVisible(false);for(let i=rec.sn;i<rec.sub.length;i++)prHideRec(rec.sub[i])}
function prSub(rec){let s=rec.sub[rec.sn];if(!s)s=rec.sub[rec.sn]={id:rec.id+'~'+rec.sn};rec.sn++;return s}
/* 사람 몸 */
function prBody(rec,area,x,y,p,dir,phase,moving,glasses,work,sit,depth){
  const e=prCharTex(area,x,p,dir,phase,moving,glasses,work,sit);
  prNext(rec,e.key).setPosition(AOFF[area]+x+PR_CB[0]-1/e.sc,y+PR_CB[1]-1/e.sc).setScale(1/e.sc).setDepth(depth);
}
/* 들고 있는 물건(꽃 묶음·꽃다발 등) */
const PR_IB=[-22,-44,44,54];
function prItemTex(area,it){
  const sc=prBakeScale(area);let j;try{j=JSON.stringify(it,prRound)}catch(e){j=String(prOid(it))}
  const key='i|'+j+'|'+sc;let e=PR.tex.get(key);if(e){e.used=PR.frame;return e}
  const W=Math.ceil(PR_IB[2]*sc)+2,H=Math.ceil(PR_IB[3]*sc)+2;e=prTex(key,W,H);const g=e.g;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.setTransform(sc,0,0,sc,-PR_IB[0]*sc+1,-PR_IB[1]*sc+1);
  const fx=[];BAKE={fx,ax:0,ay:0,timed:false};try{drawItemV(g,it,0,0)}catch(err){console.error(err)}BAKE=null;
  g.setTransform(1,0,0,1,0,0);e.t.refresh();e.sc=sc;e.fx=fx;return e;
}
function prItem(rec,area,it,x,y,depth){
  const e=prItemTex(area,it);prNext(rec,e.key).setPosition(AOFF[area]+x+PR_IB[0]-1/e.sc,y+PR_IB[1]-1/e.sc).setScale(1/e.sc).setDepth(depth);
  if(e.fx.length){const h=prSub(rec);h.fx=e.fx;h.sc=e.sc;prPlaceFx(h,area,x,y,depth+.0001)}
}
/* 매 프레임 새로 그리는 작은 그림(강아지·고양이·물뿌리개·가구 옮기기 미리보기) */
function prLive(rec,name,area,B,depth,drawFn,key){
  const sc=prBakeScale(area);
  const bw=Math.ceil(B[2]/16)*16,bh=Math.ceil(B[3]/16)*16;const W=Math.ceil(bw*sc)+2,H=Math.ceil(bh*sc)+2;
  const tk='L|'+rec.id+'|'+name;const e=prTex(tk,W,H);
  if(key==null||e.lk!==key||e.lsc!==sc){const g=e.g;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.setTransform(sc,0,0,sc,-B[0]*sc+1,-B[1]*sc+1);g.globalAlpha=1;
    const oV=VIEW;VIEW=null;try{drawFn(g)}catch(err){console.error(err)}VIEW=oV;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.setLineDash&&g.setLineDash([]);e.t.refresh();e.lk=key;e.lsc=sc}
  prNext(rec,tk).setPosition(AOFF[area]+B[0]-1/sc,B[1]-1/sc).setScale(1/sc).setDepth(depth);
}
function prBagTex(area,behind){
  const sc=prBakeScale(area),key='i|bag|'+behind+'|'+sc;let e=PR.tex.get(key);if(e){e.used=PR.frame;return e}
  const B=[-10,-20,20,10];const W=Math.ceil(B[2]*sc)+2,H=Math.ceil(B[3]*sc)+2;e=prTex(key,W,H);const g=e.g;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.setTransform(sc,0,0,sc,-B[0]*sc+1,-B[1]*sc+1);
  rr(g,(behind?-7:5),-15,4.5,5,1.2,'#D6B27A');ln(g,(behind?-6.5:5.5),-15,(behind?-4.2:8.3),-17,'#B58E57',.5);
  g.setTransform(1,0,0,1,0,0);e.t.refresh();e.sc=sc;e.B=B;return e;
}
function prWaterFx(g,c){
  const [dx]=DIRV[c.dir];const sx=c.x+(dx>=0?6:-6),sy=c.y-12,tilt=Math.sin(performance.now()/200)*.15;g.save();g.translate(sx,sy);if(dx<0)g.scale(-1,1);g.rotate(.5+tilt);el(g,0,0,4,3.2,'#9CC5D8');ln(g,3,-1,8,-4,'#9CC5D8',1.2);g.strokeStyle='#7FA7C9';g.lineWidth=.7;g.beginPath();g.arc(-1,-3,2.4,Math.PI,0);g.stroke();g.restore();
  const tt=performance.now()/1000;for(let k=0;k<5;k++){const ph=(tt*2.2+k/5)%1;el(g,sx+(dx>=0?1:-1)*(10+ph*6),sy-2+ph*12,.7,1.2,'#7FB8E6')}
}
/* 바닥 아래쪽 선(선택 테두리·먼지) — Phaser 도형으로 */
function prUnder(area){const a=prArea(area);if(!a.gu)a.gu=prW(PR.sc.add.graphics().setDepth(-2e6));return a.gu}
function prRRect(G,x,y,w,h,r){G.strokeRoundedRect(x,y,w,h,Math.min(r,w/2,h/2))}
function prSyncChars(area){
  const G=prUnder(area),ox=AOFF[area];G.clear();G.setVisible(true);
  const a=.82+.18*Math.sin(performance.now()/220);
  /* 선택 테두리 */
  S.chars.forEach(c=>{
    if(c.area!==area||c.modal||c.rest||c.waterT>0)return;if(S.mode==='solo'&&c.i!==S.active)return;
    if(S.edit&&area==='shop'){if(c.carry)return;const f=furnAt(c);if(!f)return;const b=f.type?visRect(f):[f.x*TILE,f.y*TILE-8,f.w*TILE,f.h*TILE+8];G.lineStyle(1.6,0xffffff,a);prRRect(G,ox+b[0]-1.5,b[1]-1.5,b[2]+3,b[3]+3,3);return}
    const s=targetOf(c);if(!s)return;
    if(s.type==='npc'){G.lineStyle(1.3,0xffffff,a);G.strokeEllipse(ox+s.walker.x,s.walker.y,16,5.2);return}
    const b=visRect(s);G.lineStyle(3.2,0xffffff,.35);prRRect(G,ox+b[0]-1.5,b[1]-1.5,b[2]+3,b[3]+3,3);G.lineStyle(1.5,0xffffff,a);prRRect(G,ox+b[0]-1.5,b[1]-1.5,b[2]+3,b[3]+3,3);
  });
  /* 발걸음 먼지 */
  S.puffs.forEach(q=>{if(q.area!==area)return;G.fillStyle(0xffffff,(1-q.t/.5)*.55);G.fillEllipse(ox+q.x,q.y-1,2*(2+q.t*9),2*(1+q.t*3))});
  /* SM·SK */
  S.chars.forEach(c=>{
    if(c.area!==area)return;const r=prRec('p'+c.i);prBegin(r);const dep=c.y+(c.rest?2:0);
    if(S.mode==='solo'&&S.active===c.i){const [col]=prCol(PAL[c.i].tag);G.lineStyle(1,col,.75);G.strokeEllipse(ox+c.x,c.y,15,4.8)}
    const [hx,hy,behind]=handPos(c);const H=heldItem(c);
    if(H&&behind)prItem(r,area,H,hx,hy,dep-.003);
    prBody(r,area,c.x,c.y,palOf(c),c.ang,c.anim,c.moving,false,!!(c.modal&&['trim','craft','wrap'].includes(c.modal.type))||c.waterT>0,!!c.rest,dep);
    if(c.waterT>0)prLive(r,'water',area,[c.x-24,c.y-30,48,48],dep+.001,g=>prWaterFx(g,c),null);
    else if(H&&!behind)prItem(r,area,H,hx,hy,dep+.001);
    if(c.bag.filter(Boolean).length>1){const e=prBagTex(area,behind);prNext(r,e.key).setPosition(ox+c.x+e.B[0]-1/e.sc,c.y+e.B[1]-1/e.sc).setScale(1/e.sc).setDepth(dep+.002)}
    prEnd(r);
  });
  /* 손님 */
  PR.npc=true;
  S.customers.forEach(k=>{if((k.area||'shop')!==area||!inView(k.x,k.y))return;const r=prRec('k'+prOid(k));prBegin(r);
    prBody(r,area,k.x,k.y,k.pal,k.dir,k.walk,k.state==='move'&&!k.talking,false,false,false,k.y);
    if(k.bouquet)prItem(r,area,k.bouquet,k.x,k.y-11,k.y+.001);prEnd(r)});
  /* 주민·강아지 */
  S.walkers.forEach(w=>{if(w.hidden||wArea(w)!==area||!inView(w.x,w.y))return;
    const r=prRec('w'+prOid(w));prBegin(r);prBody(r,area,w.x,w.y+(w.yo||0),w.pal,w.dir,w.walk,!!w.mv&&!w.sit,false,w.throwT>0,!!w.sit,w.y+(w.dz||0));prEnd(r);
    if(w.dog){const d=w.dog,rd=prRec('g'+prOid(d));prBegin(rd);const hx=w.x+(DIRV[w.dir][0]>=0?5:-5),hy=w.y-12;
      const x0=Math.min(hx,d.x-12)-4,y0=Math.min(hy,d.y-16)-4,x1=Math.max(hx,d.x+12)+4,y1=Math.max(hy,d.y+4)+4;
      prLive(rd,'dog',area,[x0,y0,x1-x0,y1-y0],d.y,g=>{g.strokeStyle='#C65C79';g.lineWidth=.45;g.beginPath();g.moveTo(hx,hy);g.quadraticCurveTo((hx+d.x)/2,Math.max(hy,d.y)+2,d.x+(d.dir==='left'?-3:3),d.y-6);g.stroke();drawDog(g,d)},null);prEnd(rd)}});
  /* 운동장 공 */
  if(area==='town'&&S.ball){const [bx,by,bh]=ballPos(S.ball);const r=prRec('ball');prBegin(r);
    prLive(r,'ball',area,[bx-5,by-34,10,38],by+2,g=>{el(g,bx,by+1,2.6*(1-bh/40),1,'rgba(80,55,50,.18)');const yy=by-10-bh;el(g,bx,yy,2.3,2.3,'#F08D8D');g.strokeStyle='#FFFFFF';g.lineWidth=.5;g.beginPath();g.arc(bx,yy,2.3,-.6,1.2);g.stroke();el(g,bx-.8,yy-.8,.6,.6,'rgba(255,255,255,.8)')},null);prEnd(r)}
  PR.npc=false;
  /* 토토 */
  allCats().forEach((t,ci)=>{if(t.area!==area||!inView(t.x,t.y))return;const r=prRec('cat'+ci);prBegin(r);prLive(r,'cat',area,[t.x-16,t.y-24,32,32],t.y,g=>drawCat(g,t),null);prEnd(r)});
  /* 가구 옮기기 미리보기 */
  if(area==='shop'&&S.edit)S.chars.forEach(c=>{if(!c.carry||c.area!=='shop')return;const f=c.carry,[x,y]=placeSpot(c,f),ok=spotOK(f,x,y);
    const r=prRec('e'+c.i);prBegin(r);const B=f.type?prBounds(PR_STB,f.type,x*TILE,y*TILE,f.w*TILE,f.h*TILE):prBounds(PR_DEB,f.t,x*TILE,y*TILE,f.w*TILE,f.h*TILE,f);
    prLive(r,'ghost',area,B,9999,g=>{const ox0=f.x,oy0=f.y;f.x=x;f.y=y;g.globalAlpha=.6;try{if(f.type)drawStationV(g,f);else drawDecor(g,f)}finally{g.globalAlpha=1;f.x=ox0;f.y=oy0}rr(g,x*TILE,y*TILE,f.w*TILE,f.h*TILE,2);g.strokeStyle=ok?'rgba(127,192,106,.95)':'rgba(224,112,140,.95)';g.lineWidth=1.4;g.setLineDash([3,2]);g.stroke();g.setLineDash([])},
      [prOid(f),x,y,ok,S.rev].join());prEnd(r)});
}

/* =====================================================================
   3단계: 장소별 움직이는 효과(가게 벽시계·창문·조명 / 시장 전구줄 /
          마을 물결·반딧불이·창문 불빛 / 북쪽 길 하늘·구름·별·낙엽·강 반사)
   ===================================================================== */
/* 작은 효과 도장: B=[x0,y0,w,h](월드), 그림은 (0,0) 기준 */
function prFxT(name,area,B,draw){
  const sc=prBakeScale(area),key='fx|'+name+'|'+sc;let e=PR.tex.get(key);if(e){e.used=PR.frame;return e}
  const W=Math.max(2,Math.ceil(B[2]*sc)+2),H=Math.max(2,Math.ceil(B[3]*sc)+2);e=prTex(key,W,H);const g=e.g;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.setTransform(sc,0,0,sc,-B[0]*sc+1,-B[1]*sc+1);g.globalAlpha=1;
  try{draw(g)}catch(err){console.error(err)}g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;e.t.refresh();
  e.sc=sc;e.ox=(-B[0]*sc+1)/W;e.oy=(-B[1]*sc+1)/H;return e;
}
function prFx(rec,area,e,x,y,depth,alpha,rot,scale){
  const im=prNext(rec,e.key);im.setOrigin(e.ox,e.oy).setPosition(AOFF[area]+x,y).setScale((scale||1)/e.sc).setRotation(rot||0).setAlpha(alpha==null?1:alpha).setDepth(depth);return im;
}
/* 구운 넓은 층(시계·창문·하늘 등): 모양이 바뀔 때만 다시 굽기 */
function prDynLayer(area,name,sig,B,depth,drawFn){
  const r=prRec('D|'+area+'|'+name);
  if(r.sig!==sig||r.B0!==B.join()){r.sig=sig;r.B0=B.join();prBakeStatic(r,area,drawFn,B)}
  prPlaceStatic(r,area,depth);
}
function prDynG(area,depth){const a=prArea(area);if(!a.gd){a.gd=prW(PR.sc.add.graphics())}a.gd.setDepth(depth).setVisible(true);return a.gd}
function prSyncDyn(area){
  const now=PR.now,tt=now/1000,ox=AOFF[area];
  const fr=prRec('F|'+area);prBegin(fr);
  if(area==='shop'){
    const W=AREAS.shop.w*TILE;
    prDynLayer(area,'top',[Math.floor(S.t),S.style,JSON.stringify(S.up),W,prBakeScale(area)].join('|'),[0,-4,W,32],-2.5e6,g=>shopDynamic(g));
  }else if(area==='market'){
    const W=AREAS.market.w*TILE;
    prDynLayer(area,'lights',[Math.round(lampAt(S.t)*40),W,prBakeScale(area)].join('|'),[0,0,W,18],-2.5e6,g=>marketDynamic(g));
  }else if(area==='town'){
    const RX0=RIVER[0]*TILE,RX1=(RIVER[1]+1)*TILE,H=27*TILE,HH=AREAS.town.h*TILE,W=AREAS.town.w*TILE,LY=27*TILE,LX=20*TILE;
    const P=sunsetPal(S.t),k=P.k,G=prDynG(area,-2.6e6);G.clear();
    if(k>0){const [c]=prCol(P.hor);G.fillStyle(c,.28*k);G.fillRect(ox+LX,LY,W-LX,HH-LY-18);G.fillRect(ox+RX0,0,RX1-RX0,LY)}
    const lake=prFxT('rip8',area,[-1,-3,10,4],g=>{g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=.7;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(4,-1.5,8,0);g.stroke()});
    for(let i=0;i<10;i++){const x=LX+20+((i*97+tt*9)%(W-LX-40)),y=LY+14+((i*43)%60);if(inView(x,y,20))prFx(fr,area,lake,x,y,-2.55e6)}
    if(S.t>480){const a=clamp((S.t-480)/40,0,1);const core=prFxT('ffc',area,[-1.5,-1.5,3,3],g=>el(g,0,0,1.1,1.1,'#FFF3A0')),halo=prFxT('ffh',area,[-4,-4,8,8],g=>el(g,0,0,3.5,3.5,'#FFF3A0'));
      for(let i=0;i<24;i++){const bx=[60,200,330,480,600,760,860][i%7]+Math.sin(tt*.7+i*1.7)*18,by=[250,300,420,405,300,410,395][i%7]+Math.cos(tt*.9+i)*12;if(!inView(bx,by,20))continue;const tw=(Math.sin(tt*3+i*2)+1)/2;
        prFx(fr,area,core,bx,by,-2.54e6,a*(.3+.7*tw));prFx(fr,area,halo,bx,by,-2.54e6+.5,a*.25*tw)}}
    const riv=prFxT('rip6',area,[-1,-3,8,4],g=>{g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=.8;g.lineCap='round';g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(3,-1.5,6,0);g.stroke()});
    for(let i=0;i<16;i++){const y=((i*37+tt*14)%H);if((y>90&&y<212)||(y>262&&y<310)||(y>378&&y<418))continue;const x=RX0+10+((i*13)%(RX1-RX0-22));if(inView(x,y,20))prFx(fr,area,riv,x,y,-2.55e6)}
    const L=lampAt(S.t);if(L>0){G.fillStyle(0xFFD696,.45*L);FACADES.forEach(f=>{const x=f.x*TILE,w=f.w*TILE;
      if(f.t==='shopFront'){const dx=f.door*TILE;G.fillRect(ox+x+8,50,dx-x-16,34);G.fillRect(ox+dx+40,50,x+w-dx-48,34)}
      else if(f.t==='supplyFront'){const dx=f.door*TILE;G.fillRect(ox+x+8,50,dx-x-14,32);G.fillRect(ox+dx+38,50,x+w-dx-44,32)}
      else if(f.t==='house'&&w>=48){G.fillRect(ox+x+8,30,14,16);G.fillRect(ox+x+w-22,30,14,16)}})}
  }else if(area==='north'){
    const W=AREAS.north.w*TILE,RX0=RIVER[0]*TILE,RX1=(RIVER[1]+1)*TILE,P=sunsetPal(S.t),k=P.k,HZ=5.6*TILE,sx=(RX0+RX1)/2,sy=10+k*(HZ-4);
    const ks=Math.round(k*120);
    /* 하늘(그라데이션·햇무리·해) */
    prDynLayer(area,'sky',ks+'|'+P.top+P.hor+'|'+prBakeScale(area),[0,0,W,HZ],-2.9e6,g=>{
      const sg=g.createLinearGradient(0,0,0,HZ);sg.addColorStop(0,P.top);sg.addColorStop(.7,mix(P.top,P.hor,.6));sg.addColorStop(1,P.hor);g.fillStyle=sg;g.fillRect(0,0,W,HZ);
      const gl=g.createRadialGradient(sx,sy,0,sx,sy,110);gl.addColorStop(0,`rgba(255,232,180,${.7-.2*k})`);gl.addColorStop(1,'rgba(255,190,140,0)');g.fillStyle=gl;g.fillRect(sx-110,0,220,HZ);
      g.save();g.beginPath();g.rect(0,0,W,HZ);g.clip();el(g,sx,sy,10,10,mix('#FFF6D6','#FF7A4A',k));g.restore()});
    /* 별 */
    if(k>.8){const st=prFxT('star',area,[-1.2,-1.2,2.4,2.4],g=>el(g,0,0,1,1,'#FFFFFF'));const q=seedRand(9);const ga=(k-.8)*5;
      for(let i=0;i<70;i++){const x=q()*W,y=q()*HZ*.7;const tw=(Math.sin(tt*2+i)+1)/2;if(inView(x,y,10))prFx(fr,area,st,x,y,-2.89e6,ga,0,.5+tw*.4)}}
    /* 구름 */
    [[.1,.25,.2],[.28,.12,.16],[.62,.2,.22],[.82,.1,.15],[.45,.35,.12],[.92,.32,.14]].forEach(([cx,cy,cw],i)=>{
      const x0=((cx*W+tt*3*(1+i%3))%(W*1.2))-W*.1,y0=cy*HZ,w0=cw*W*.5,near=clamp(1-Math.abs(x0-sx)/(W*.35),0,1);if(!inView(x0,y0,w0))return;
      const nl=Math.round(near*10)/10;
      const e=prFxT('cloud|'+i+'|'+ks+'|'+nl,area,[-.6*w0-2,-9,1.2*w0+4,16],g=>{for(let j=0;j<6;j++)el(g,(j-2.5)*w0*.16,-(j%2)*2,w0*.16,4.5,P.cloud);g.globalAlpha=.5+.5*nl;for(let j=0;j<5;j++)el(g,(j-2)*w0*.17,3,w0*.14,1.8,mix(P.cloud,P.lit,.5+.5*nl));g.globalAlpha=1});
      prFx(fr,area,e,x0,y0,-2.88e6)});
    /* 언덕·풀밭 */
    prDynLayer(area,'hill',ks+'|'+P.top+'|'+prBakeScale(area),[0,HZ-12,W,6.2*TILE-HZ+14],-2.87e6,g=>{
      g.fillStyle=mix('#6F8F5E',P.top,.35*k);g.beginPath();g.moveTo(0,HZ+2);for(let x=0;x<=W;x+=20)g.lineTo(x,HZ-2-Math.abs(Math.sin(x*.05))*2.5-(x%60<20?2:0));g.lineTo(W,HZ+8);g.lineTo(0,HZ+8);g.closePath();g.fill();
      g.fillStyle='#B5C98E';g.fillRect(0,HZ+6,W,6.2*TILE-HZ)});
    /* 강물에 비친 노을 */
    const G=prDynG(area,-2.86e6);G.clear();
    if(k>0){const [c]=prCol(P.hor);G.fillStyle(c,.3*k);G.fillRect(ox+RX0+2,6*TILE,RX1-RX0-4,AREAS.north.h*TILE);
      for(let i=0;i<20;i++){const yy=6.4*TILE+i*9;G.fillStyle(0xFFD7A0,(.5-.02*i)*k);G.fillRect(ox+sx-6-i*.6+Math.sin(tt*2+i)*2,yy,12+i*1.2,1.2)}}
    /* 낙엽 */
    ['#E8B84A','#D9674A','#E8905A'].forEach((c,ci)=>prFxT('leaf'+ci,area,[-2,-1.5,4,3],g=>el(g,0,0,1.6,.9,c)));
    for(let i=0;i<18;i++){const x=((i*83+tt*(8+i%4))%W),y=((i*47+tt*(14+i%5))%(AREAS.north.h*TILE-120))+110;if(!inView(x,y,10))continue;
      prFx(fr,area,prFxT('leaf'+(i%3),area,[-2,-1.5,4,3],null),x,y,-2.5e6,1,tt*2+i)}
  }
  prEnd(fr);
}

