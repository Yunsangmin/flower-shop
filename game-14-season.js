'use strict';
/* 우리 둘의 꽃집 — game-14-season.js : 계절(겨울·크리스마스)
   · 계절은 game-1-core.js 맨 위의 SEASON / XMAS 두 글자로 정해요(실제 날짜와 상관없음).
     SEASON='winter' → 눈 덮인 마을·겨울꽃·겨울옷·겨울 대사,  XMAS=true → 전구·리스·큰 트리 꾸미기
     나중에 봄·여름으로 돌릴 땐 SEASON='summer', XMAS=false 로 바꾸면 이 파일의 겨울 그림은 전부 꺼져요(세이브는 그대로).
   · 메모리: 눈 덮인 땅은 '원래 바닥 그림의 색만 바꿔' 만들어 추가 메모리가 없어요.
     전구·눈송이는 아주 작은 그림 몇 장(점 하나 크기)을 돌려 쓰고, 화면에 보이는 것만 그려요. */

/* ---------- 0. 공용 ---------- */
const XM_ON=WINTER&&XMAS;
let XF_SKIP=0; /* 마을 바닥을 눈으로 바꾸는 동안엔 건물 앞모습을 잠깐 빼고 그려요(건물은 눈 색으로 안 바뀌게) */
const XBC=['#FF4D5E','#FFC93C','#4FD27A','#55A8FF','#FFF1C2']; // 전구 색: 빨강·노랑·초록·파랑·따뜻한 흰색
function hexA(h,a){const [r,g,b]=hex2rgb(h);return `rgba(${r},${g},${b},${a})`}
function xHash(a,b,c){let h=(a*374761393+b*668265263+c*2147483647)>>>0;h=(h^(h>>>13))*1274126177>>>0;return ((h^(h>>>16))>>>0)/4294967296}
function starPath(g,x,y,R,r,rot){g.beginPath();for(let k=0;k<10;k++){const a=(rot||0)-Math.PI/2+k*Math.PI/5,rr2=k%2?r:R;g.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2)}g.closePath()}

/* ---------- 1. 겨울엔 해가 빨리 져요(낮 시간 앞부분은 같고, 오후부터 1.5배 빨리 어두워짐 → 저녁 5시쯤 깜깜) ---------- */
function wt(t){return WINTER&&t>300?Math.min(600,300+(t-300)*1.5):t}
if(WINTER){
  const _amb=ambientAt,_lamp=lampAt,_sky=skyAt,_sp=sunsetPal;
  ambientAt=t=>{const r=_amb(wt(t));if(wt(t)<330)return ['#DCE8F6',.05];return r}; // 겨울 낮은 살짝 푸르스름
  lampAt=t=>_lamp(wt(t));skyAt=t=>_sky(wt(t));sunsetPal=t=>_sp(wt(t));
  sunsetView=c=>!!(c&&c.rest&&c.rest.bench&&c.rest.bench.view&&wt(S.t)>=420);
}

/* ---------- 2. 눈 덮인 땅: 바닥을 그리는 순간 '풀색 → 눈색, 물색 → 얼음색'으로 바꿔 칠해요
   (다 그린 뒤 픽셀을 하나하나 고치던 방식은 TV에서 캠퍼스 땅 조각마다 멈칫해서, 색을 고를 때 바로 바꾸는 방식으로 바꿨어요 → 추가 시간·메모리 거의 0) */
const SNOWC=new Map();let SNOW_LEAF=false;
function snowRGB(r,gg,b){if((gg>r+8&&gg>b+4)||(SNOW_LEAF&&r-b>115)){const L=r*.3+gg*.59+b*.11,t=L<95?0:L>220?1:(L-95)/125;return [184+t*68|0,198+t*55|0,218+t*37|0]}
  if(b>r+22&&b>=gg-6)return [r*.45+124|0,gg*.45+131|0,b*.45+135|0];return null}
function snowCol(c){if(typeof c!=='string')return c;const key=(SNOW_LEAF?'L':'')+c;let v=SNOWC.get(key);if(v!==undefined)return v;v=c;
  let m=/^#([0-9a-f]{6})$/i.exec(c),r,g,b,a=null;if(m){const n=parseInt(m[1],16);r=n>>16;g=(n>>8)&255;b=n&255}
  else if((m=/^#([0-9a-f]{3})$/i.exec(c))){r=parseInt(m[1][0]+m[1][0],16);g=parseInt(m[1][1]+m[1][1],16);b=parseInt(m[1][2]+m[1][2],16)}
  else if((m=/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(c))){r=+m[1];g=+m[2];b=+m[3];a=m[4]!=null?+m[4]:null}
  if(r!=null){const o=snowRGB(r,g,b);if(o)v=a==null?`rgb(${o[0]},${o[1]},${o[2]})`:`rgba(${o[0]},${o[1]},${o[2]},${a})`}
  if(SNOWC.size>4000)SNOWC.clear();SNOWC.set(key,v);return v}
function withSnowColors(fn,leaves){const P=CanvasRenderingContext2D.prototype,F=Object.getOwnPropertyDescriptor(P,'fillStyle'),St=Object.getOwnPropertyDescriptor(P,'strokeStyle'),LG=P.createLinearGradient,RG=P.createRadialGradient;
  const wrapG=f=>function(...a){const gr=f.apply(this,a),ac=gr.addColorStop;gr.addColorStop=function(o,c){return ac.call(this,o,snowCol(c))};return gr};
  SNOW_LEAF=!!leaves;
  Object.defineProperty(P,'fillStyle',{configurable:true,get:F.get,set(v){F.set.call(this,snowCol(v))}});Object.defineProperty(P,'strokeStyle',{configurable:true,get:St.get,set(v){St.set.call(this,snowCol(v))}});P.createLinearGradient=wrapG(LG);P.createRadialGradient=wrapG(RG);
  try{return fn()}finally{Object.defineProperty(P,'fillStyle',F);Object.defineProperty(P,'strokeStyle',St);P.createLinearGradient=LG;P.createRadialGradient=RG;SNOW_LEAF=false}}
const SNOW_BG={town:1,north:1,farm:1},NORTH_LEAF=new Set(['#E8B84A','#D9674A','#E8905A','#C9A23E','#B8543E']);
if(WINTER){
  const _bg=bgDraw;bgDraw=function(area,s,q){
    if(!SNOW_BG[area])return _bg(area,s,q);
    XF_SKIP=1;const _el=el;if(area==='north')el=function(g,x,y,rx,ry,f,r){if(NORTH_LEAF.has(f))return;_el(g,x,y,rx,ry,f,r)}; /* 북쪽 길의 낙엽은 빼고 그려요 */
    let cv;try{cv=withSnowColors(()=>_bg(area,s,q),area==='north')}finally{XF_SKIP=0;el=_el}
    const g=cv.getContext('2d');g.setTransform(s*q,0,0,s*q,0,0);
    if(area==='town'&&XMAS){g.fillStyle=snowCol('#A9D08F');g.fillRect(296,292,80,18)} // 큰 트리 자리의 꽃밭을 덮어요
    if(area==='town')FACADES.forEach(f=>{if(f.t!=='shopFront')drawFacade(g,f)});
    snowDrifts(g,area);
    return cv};
}
/* 눈 더미(바닥에 살짝 쌓인 눈) */
function snowDrifts(g,area){const W=AREAS[area].w*TILE,H=AREAS[area].h*TILE,q=seedRand(area.length*91+7);
  for(let k=0;k<(area==='town'?70:50);k++){const x=q()*W,y=(area==='town'?210:110)+q()*(H-(area==='town'?230:130)),r=2+q()*4;g.globalAlpha=.55;el(g,x,y,r*1.6,r*.5,'#FFFFFF');g.globalAlpha=1;el(g,x-r*.3,y-r*.15,r*.7,r*.22,'#FFFFFF')}}

/* ---------- 3. 가랜드(초록 잎 줄 + 리본) — 가게 앞·실내 벽에 같이 써요 ---------- */
function garlandPts(x0,x1,y,step,sag){const n=Math.max(1,Math.round((x1-x0)/step)),sw=(x1-x0)/n,hooks=[],bulbs=[];
  for(let k=0;k<=n;k++)hooks.push([x0+k*sw,y]);
  for(let k=0;k<n;k++){const a=x0+k*sw;for(const t of [.2,.5,.8]){const yy=y+sag*4*t*(1-t);bulbs.push([a+sw*t,yy+1.2])}}
  return {hooks,bulbs,sw}}
function drawGarland(g,x0,x1,y,step,sag,opt){const P=garlandPts(x0,x1,y,step,sag),q=seedRand(Math.round(x0*7+y));
  for(let k=0;k+1<P.hooks.length;k++){const [ax]=P.hooks[k],sw=P.sw;
    g.beginPath();g.moveTo(ax,y);g.quadraticCurveTo(ax+sw/2,y+sag*2,ax+sw,y);g.strokeStyle='#2D5A3D';g.lineWidth=3;g.lineCap='round';g.stroke();
    for(let j=0;j<=10;j++){const t=j/10,xx=ax+sw*t,yy=y+sag*4*t*(1-t);el(g,xx+(q()-.5)*1.4,yy-.6+(q()-.5)*1.2,1.5,.9,j%2?'#3F7D55':'#4E9165',q()*3);if(q()<.25)el(g,xx,yy+.4,.6,.6,'#C8303E')}}
  for(const [x2] of P.hooks){bowV(g,x2,y-.5,opt&&opt.bow||'#C8303E')}
  if(!opt||!opt.noDots)for(const [bx,by] of P.bulbs){ln(g,bx,by-1.6,bx,by-.6,'#3A3A3A',.35);el(g,bx,by,.75,.95,XBC[Math.round(bx*.37)%5])}
  return P}
function bowS(g,x,y,k,c){g.save();g.translate(x,y);g.scale(k,k);bowV(g,0,0,c);g.restore()}
function bowV(g,x,y,c){const d=mix(c,'#3A1A20',.3);poly(g,[x,y,x-3.4,y-2,x-3.2,y+1.8],c);poly(g,[x,y,x+3.4,y-2,x+3.2,y+1.8],c);ln(g,x,y,x-1.6,y+3.6,d,.8);ln(g,x,y,x+1.6,y+3.6,d,.8);el(g,x,y,1,1,d)}
function wreathV(g,x,y,r,opt){const q=seedRand(Math.round(x*13+y));for(let k=0;k<16;k++){const a=k/16*Math.PI*2;el(g,x+Math.cos(a)*r,y+Math.sin(a)*r,r*.42,r*.3,k%2?'#3F7D55':'#2F6B48',a+1.2)}
  for(let k=0;k<5;k++){const a=q()*6.28;el(g,x+Math.cos(a)*r,y+Math.sin(a)*r,r*.13,r*.13,'#D8343F')}if(opt&&opt.cotton){const a=q()*6.28;el(g,x+Math.cos(a)*r,y+Math.sin(a)*r,r*.18,r*.16,'#FFFFFF')}
  bowV(g,x,y+r*.95,'#C8303E')}

/* ---------- 4. 건물 앞모습: 지붕 눈 · 가랜드 · 문 리스 ---------- */
function facadeGar(f){const x=f.x*TILE,w=f.w*TILE;
  switch(f.t){case 'shopFront':case 'supplyFront':return [x+3,x+w-3,49.5,24,3.6];
    case 'marketFront':return [x+2,x+w-2,51,24,3.4];
    default:return [x+2,x+w-2,14.5,w>=48?20:w/2,3]}}
function facadeWinter(g,f){
  const x=f.x*TILE,w=f.w*TILE;
  const roof=(L,T,R,y0)=>{poly(g,[L-1,y0+.6,(L+R)/2,T-1.2,R+1,y0+.6,R-1.5,y0+1.8,(L+R)/2,T+2.6,L+1.5,y0+1.8],'#FBFCFF');for(let k=0;k<7;k++){const t=(k+.5)/7;el(g,L+(R-L)*t,y0+1.8,1.4,1.1+(k%3)*.4,'#FBFCFF')}};
  const flat=(y0,x0,x1)=>{rr(g,x0-1,y0-2.4,x1-x0+2,3.2,1.4,'#FBFCFF');const q=seedRand(Math.round(x0));for(let xx=x0;xx<x1;xx+=5+q()*4)el(g,xx,y0+.6,1.3+q(),1+q()*.8,'#FBFCFF');for(let xx=x0+4;xx<x1;xx+=11){ln(g,xx,y0+.8,xx,y0+2.6+q()*2.2,'rgba(220,236,248,.95)',.9)}};
  if(f.t==='house'||f.t==='salonFront')roof(x-2,-2,x+w+2,12);
  else if(f.t==='marketFront')roof(x-4,-4,x+w+4,20);
  else if(f.t==='shopFront'||f.t==='supplyFront'){flat(6,x,x+w);flat(36.5,x,x+w)}
  if(!XMAS)return;
  const [a,b,y,st,sg]=facadeGar(f);drawGarland(g,a,b,y,st,sg);
  /* 문 리스 */
  if(f.t==='shopFront'||f.t==='supplyFront'){const dx=f.door*TILE;wreathV(g,dx+16,70,4.2,{cotton:f.t==='shopFront'})}
  else if(f.t==='marketFront'){const dx=f.door*TILE;wreathV(g,dx+16,52,4.6,{cotton:true})}
  else if(f.t==='salonFront'){const dx=f.door*TILE;wreathV(g,dx+16,58,3.6)}
  else if(f.t==='house'&&w>=48)wreathV(g,x+w/2,72,3.6);
}
if(WINTER){const _df=drawFacade;drawFacade=function(g,f){if(XF_SKIP)return;_df(g,f);facadeWinter(g,f)}}

/* ---------- 5. 나무: 활엽수는 잎 진 가지 + 눈, 소나무·덤불은 눈 모자 ---------- */
function bareBranch(g,x,y,ang,len,w,dep,q,col,snow){
  const x2=x+Math.sin(ang)*len,y2=y-Math.cos(ang)*len;ln(g,x,y,x2,y2,col,w);
  if(snow&&Math.abs(ang)<1.25&&w>.55){ln(g,x-Math.cos(ang)*w*.35,y-Math.sin(ang)*w*.35-w*.35,x2-Math.cos(ang)*w*.3,y2-w*.3,'#FBFCFF',w*.55)}
  if(dep<=0){if(q()<.5)el(g,x2,y2-.3,1,.6,'#FBFCFF');return}
  const n=dep>2?2:2+(q()<.4?1:0);for(let k=0;k<n;k++){const sp=(k-(n-1)/2)*(.55+q()*.25)+(q()-.5)*.2;bareBranch(g,x2,y2,ang+sp,len*(.62+q()*.12),w*.66,dep-1,q,col,snow)}}
function winterTree(g,x,by,v,seed,orig){
  const q=seedRand(seed+3);
  if(v==='bush'){shadow(g,x,by-1,9,2.2);canopy(g,x,by-6,8,['#3F6B45','#4C7A50','#58875A','#4A7650'],seed);el(g,x-.5,by-11.5,6.8,2.6,'#FBFCFF');el(g,x-3.5,by-10,3,1.6,'#FBFCFF');el(g,x+3.5,by-9.5,3.2,1.5,'#FBFCFF');el(g,x,by-.8,9,1.6,'rgba(255,255,255,.8)');return}
  if(v==='pine'){orig(g,x,by,v,seed);[[0,12],[7,10],[13,8],[18,5.5]].forEach(([dy,wd])=>{const ty=by-20-dy,bot=by-8-dy;
      poly(g,[x,ty-.6,x+wd*.42,bot-4.6,x+wd*.15,bot-3.7,x-wd*.1,bot-4.4,x-wd*.5,bot-3.2],'#FBFCFF');el(g,x-wd*.82,bot-.6,1.6,.8,'#FBFCFF');el(g,x+wd*.6,bot-.4,1.4,.7,'#EEF4FA')});el(g,x,by-.6,8,1.6,'rgba(255,255,255,.85)');return}
  if(v==='round'&&seed%3===0){shadow(g,x,by-1,10,2.6);g.fillStyle='#6E5240';g.fillRect(x-1.8,by-16,3.6,16);canopy(g,x,by-22,11,['#3F6B45','#4C7A50','#58875A','#4A7650'],seed);
    el(g,x-1,by-31,8,3,'#FBFCFF');el(g,x-6,by-27,4,2,'#FBFCFF');el(g,x+5.5,by-26.5,4.4,2,'#FBFCFF');el(g,x+1,by-22,3,1.4,'#F4F8FC');return}
  shadow(g,x,by-1,9,2.2);
  const birch=v==='birch',col=birch?'#E9E4DA':'#6B5040';
  if(birch){g.fillStyle='#F2EFE8';g.fillRect(x-1.6,by-20,3.2,20);for(let k=0;k<5;k++){g.fillStyle='#3E3A3A';g.fillRect(x-1.6+(k%2)*1.6,by-18+k*3.6,1.4,.7)}}
  else{poly(g,[x-2.2,by,x+2.2,by,x+1.3,by-15,x-1.3,by-15],col)}
  const top=birch?by-20:by-15;
  bareBranch(g,x,top+1,-.05+(q()-.5)*.15,9,birch?1.6:2,3,q,col,true);bareBranch(g,x,top+5,-.75,7,1.3,2,q,col,true);bareBranch(g,x,top+4,.75,7,1.3,2,q,col,true);
  el(g,x,by-.6,7,1.4,'rgba(255,255,255,.85)');
}
if(WINTER){const _dt=drawTree;drawTree=function(g,x,by,v,seed){winterTree(g,x,by,v,seed,_dt)}}

/* ---------- 6. 가로등: 눈 모자 + 작은 리스 ---------- */
if(WINTER){const _dd=drawDecor;drawDecor=function(g,d){_dd(g,d);if(d.t==='lamp'){const x=d.x*TILE,y=d.y*TILE;el(g,x+8,y-28.6,4.6,1.5,'#FBFCFF');el(g,x+6,y-27.8,1.4,1,'#FBFCFF');if(XMAS){wreathV(g,x+8,y-10,2.6);el(g,x+5.6,y-9,.7,.8,XBC[0]);el(g,x+10.4,y-9.6,.7,.8,XBC[1])}}}}

/* ---------- 7. 꽃시장 겨울 소품: 화분 전나무 ---------- */
DECOR_DRAW.potFir=(g,d,x,y)=>{shadow(g,x+8,y+15,6,1.6);poly(g,[x+3,y+6,x+13,y+6,x+12,y+15,x+4,y+15],'#B8574A');rr(g,x+2.5,y+5,11,2.4,1,'#C96A5C');
  [[0,7],[5,5.6],[9,4]].forEach(([dy,wd],k)=>{poly(g,[x+8-wd,y+5-dy,x+8,y-6-dy,x+8+wd,y+5-dy],k%2?'#2F6B48':'#3A7A52');poly(g,[x+8,y-6-dy,x+8-wd*.5,y+1-dy,x+8+wd*.2,y-.4-dy],'#FBFCFF')});
  starPath(g,x+8,y-17,2.2,1,0);g.fillStyle='#F2C230';g.fill();[[x+5,y+1,'#D8343F'],[x+11,y-1,'#F2C230'],[x+8,y-6,'#55A8FF'],[x+6,y-8,'#D8343F']].forEach(([bx,by,c])=>el(g,bx,by,1,1,c))};
PR_DEB.potFir=[0,-20,0,1];
DECOR_DRAW.snowman=(g,d,x,y)=>{const cx=x+8,v=d.v||0;shadow(g,cx,y+15,7,1.8);el(g,cx,y+10,6.4,5.6,'#F4F8FC');el(g,cx-1.5,y+8.5,3,2.4,'#FFFFFF');el(g,cx,y+1.4,4.6,4.2,'#F7FAFD');el(g,cx,y-5.6,3.6,3.4,'#FBFCFF');
  el(g,cx-1.2,y-6.4,.45,.5,'#2A2626');el(g,cx+1.2,y-6.4,.45,.5,'#2A2626');poly(g,[cx,y-5.4,cx+3.4,y-4.8,cx,y-4.4],'#F08A3C');
  for(const yy of [y-.6,y+2.2,y+5])el(g,cx,yy,.5,.5,'#3A3434');
  const sc=['#C8303E','#3F7D55','#3E6FC2'][v%3];rr(g,cx-4,y-2.8,8,1.8,.8,sc);rr(g,cx+1.6,y-2,1.6,4,.6,sc);
  if(v%2===0){rr(g,cx-3,y-11.4,6,4,1,'#2E2B30');rr(g,cx-4.4,y-8,8.8,1.3,.6,'#2E2B30');rr(g,cx-3,y-8.9,6,.9,.3,'#C8303E')}else{g.beginPath();g.arc(cx,y-8.2,3.4,Math.PI,0);g.fillStyle='#C8303E';g.fill();el(g,cx,y-11.8,1.1,1.1,'#FFFFFF')}
  ln(g,cx-4.5,y+1,cx-9,y-2.6,'#6B5040',.7);ln(g,cx+4.5,y+1,cx+9,y-3,'#6B5040',.7);ln(g,cx-7.6,y-1.4,cx-8.6,y-.2,'#6B5040',.5)};
PR_DEB.snowman=[-.4,-14,.4,1];
/* 눈오리(집게로 찍은 오리 모양 눈덩이) 한 줄 */
DECOR_DRAW.snowducks=(g,d,x,y,w)=>{const n=d.n||Math.max(2,Math.round(w/7));for(let k=0;k<n;k++){const dx=x+4+k*((w-8)/Math.max(1,n-1)),dy=y+12+(k%2)*1.4,f=(k+(d.f||0))%2?1:-1;
  el(g,dx,dy+1.6,3.6,1,'rgba(120,140,170,.18)');el(g,dx,dy,3.3,2.2,'#FBFCFF');el(g,dx-f*2.6,dy-.8,1.4,1.6,'#FFFFFF',f*.6);el(g,dx+f*1.4,dy-2.8,1.8,1.7,'#FBFCFF');
  poly(g,[dx+f*2.8,dy-3.1,dx+f*4.6,dy-2.6,dx+f*2.8,dy-2.1],'#F2A23C');el(g,dx+f*1.8,dy-3.2,.3,.35,'#2A2626');g.strokeStyle='rgba(170,190,215,.6)';g.lineWidth=.3;g.beginPath();g.ellipse(dx,dy,3.3,2.2,0,0,7);g.stroke()}};
PR_DEB.snowducks=[0,-6,0,1];

/* ---------- 8. 반짝이는 작은 전구: 위치 목록만 들고, 화면에 보이는 것만 점 그림 2장(빛·알)으로 그려요 ---------- */
const XB_CACHE={};
function xbList(area){
  if(!XMAS)return [];
  const sig=(area==='town'?xtSig():'')+'|'+XB_VER;const c=XB_CACHE[area];if(c&&c.sig===sig)return c.list;
  const L=[],add=(x,y,dep,sp,gl)=>{const h=xHash(Math.round(x*3),Math.round(y*3),L.length);L.push([x,y,Math.floor(h*5),h*6.28,sp||(1.3+h*2.2),dep,gl||1])};
  if(area==='town'){
    FACADES.forEach(f=>{const [a,b,y,st,sg]=facadeGar(f);garlandPts(a,b,y,st,sg).bulbs.forEach(([bx,by])=>add(bx,by,97.5))});
    DECOR.town.forEach(d=>{if(d.t==='lamp'){const x=d.x*TILE,y=d.y*TILE;add(x+5.6,y-9,(d.y+1)*TILE-1,2.2,.7);add(x+10.4,y-9.6,(d.y+1)*TILE-1,2.6,.7)}});
    xtBulbs().forEach(([bx,by,dep,sp])=>add(bx,by,dep,sp));
  }else if(area==='north'){DECOR.north.forEach(d=>{if(d.t==='lamp'){const x=d.x*TILE,y=d.y*TILE;add(x+5.6,y-9,(d.y+1)*TILE-1,2.2,.7);add(x+10.4,y-9.6,(d.y+1)*TILE-1,2.6,.7)}})}
  else if(XG_IN[area]){const W=AREAS[area].w*TILE;garlandPts(16,W-16,3,XG_IN[area],3.6).bulbs.forEach(([bx,by])=>add(bx,by,-2.39e6,1.6))}
  XB_HOOKS.forEach(f=>{try{f(area,add)}catch(e){console.error(e)}});
  XB_CACHE[area]={sig,list:L};return L}
const XB_HOOKS=[];let XB_VER=0; /* 다른 곳(크리스마스 마켓·마을 장식)이 전구 자리를 더해요 */
const XG_IN={shop:30,market:28,supply:26,salon:26}; // 실내 벽 위 가랜드(갈고리 간격)
function xbTex(area,ci){return prFxT('xbc'+ci,area,[-1.6,-1.6,3.2,3.2],g=>{el(g,0,.1,1.05,1.25,XBC[ci]);el(g,-.35,-.35,.38,.38,'rgba(255,255,255,.85)')})}
function xgTex(area,ci){return prFxT('xbg'+ci,area,[-6,-6,12,12],g=>{const gr=g.createRadialGradient(0,0,0,0,0,6);gr.addColorStop(0,hexA(XBC[ci],.95));gr.addColorStop(.3,hexA(XBC[ci],.4));gr.addColorStop(1,hexA(XBC[ci],0));g.fillStyle=gr;g.fillRect(-6,-6,12,12)})}

/* ---------- 9. 눈 내리는 날: 하루 중 가끔(평균 3일에 1번꼴, 1~3시간씩) ---------- */
function rollSnow(){const W=[];if(Math.random()<.4){const a=rnd(0,430);W.push([a,a+rnd(70,180)]);if(Math.random()<.3){const b=rnd(Math.min(560,a+200),590);W.push([b,b+rnd(50,120)])}}return W}
function snowAmt(){if(!WINTER)return 0;if(!S.snowW)S.snowW=rollSnow();let m=0;for(const [a,b] of S.snowW){if(S.t<a||S.t>b)continue;m=Math.max(m,Math.min(1,(S.t-a)/15,(b-S.t)/15))}return m}
const SNOW_FALL={town:1,north:1,farm:1,campus:1};
function snowfall(area,tt){
  const r=prRec('XS|'+area);prBegin(r);
  const amt=SNOW_FALL[area]?snowAmt():0;
  if(amt>0&&VIEW){const C=140,per=Math.round((prIsTV()?2.2:6.5)*amt+.4),seen=new Set();
    const e1=prFxT('flk1',area,[-1.4,-1.4,2.8,2.8],g=>el(g,0,0,1,1,'rgba(255,255,255,.95)')),e2=prFxT('flk2',area,[-2.4,-2.4,4.8,4.8],g=>{const gr=g.createRadialGradient(0,0,0,0,0,2.3);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.55,'rgba(255,255,255,.8)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(-2.4,-2.4,4.8,4.8)});
    for(const R of (VIEWS&&VIEWS.length?VIEWS:[VIEW])){for(let cy=Math.floor(R[1]/C)-1;cy<=Math.floor(R[3]/C);cy++)for(let cx=Math.floor(R[0]/C);cx<=Math.floor(R[2]/C);cx++){const key=cx+','+cy;if(seen.has(key))continue;seen.add(key);
      for(let k=0;k<per;k++){const h1=xHash(cx,cy,k),h2=xHash(cy,k,cx),h3=xHash(k,cx,cy);const sp=13+h2*12,yy=(h3*C+tt*sp)%C,sx=cx*C+h1*C+Math.sin(tt*(.6+h2)+h3*6)*7,sy=cy*C+yy;
        if(sx<R[0]-4||sx>R[2]+4||sy<R[1]-4||sy>R[3]+4)continue;const a=Math.min(1,yy/14,(C-yy)/14);prFx(r,area,h2<.3?e2:e1,sx,sy,4e6+sy*.001,a*(.65+.35*h1),0,h2<.3?1:.75+h3*.5)}}}}
  prEnd(r);
  if(amt>.5&&!S.snowTold&&S.phase==='play'){S.snowTold=1;toastAll('눈이 펑펑 내리기 시작했어요 ❄')}
  if(amt===0&&S.snowTold&&S.t>0){const any=(S.snowW||[]).some(([a])=>a>S.t);if(any)S.snowTold=0}
}

/* ---------- 10. 매 프레임: 전구·눈·실내 가랜드 (game-7 의 prSyncDyn 끝에서 불러요) ---------- */
function seasonDyn(area,tt){
  if(!WINTER)return;
  if(XMAS&&XG_IN[area]){const W=AREAS[area].w*TILE,rg=prRec('XG|'+area);prBegin(rg);const e=prFxT('garl2|'+area,area,[0,-3,W,18],g=>drawGarland(g,16,W-16,3,XG_IN[area],3.6));prFx(rg,area,e,0,0,-2.4e6);prEnd(rg)}
  const list=xbList(area);const rc=prRec('XC|'+area),ra=prRec('XA|'+area);prBegin(rc);prBegin(ra);
  /* 41차: 전구 알은 바닥·장식 그림에 미리 그려 두고, 지금 가장 밝게 반짝이는 몇 개만 따로 그려요(화면 속 그림 수를 크게 줄여요) */
  if(list.length){const L=lampAt(S.t),tv=prIsTV(),cap=tv?18:50,inside=!!XG_IN[area],glowOn=inside||L>.15,vis=[];
    for(const b of list){if(!inView(b[0],b[1],10))continue;const tw=(Math.sin(tt*b[4]+b[3])+1)/2;if(tw>.55)vis.push([tw,b])}
    if(vis.length>cap){vis.sort((p,q)=>q[0]-p[0]);vis.length=cap}
    for(const [tw,b] of vis){const k=(tw-.55)/.45;prFx(rc,area,xbTex(area,b[2]),b[0],b[1],b[5],.5+.5*k);
      const ga=(.12+.55*k)*(inside?.75:(.3+.7*L))*b[6];if(glowOn&&ga>.05)prFx(ra,area,xgTex(area,b[2]),b[0],b[1],5e6+2,ga).setBlendMode(1)}}
  prEnd(rc);prEnd(ra);
  snowfall(area,tt);
}

/* =====================================================================
   11. 마을 큰 크리스마스 트리 꾸미기
   · 공원(꽃집~학교 사이 강가 쪽 잔디)에 큰 전나무. 다가가서 행동 버튼 → 장식을 사서 원하는 자리에 걸어요.
   · 자리: 꼭대기 별 1 + 몸통 20곳.  몸통 4개마다 1단계(최대 5단계, 5단계는 별까지 달아야 해요)
   · 단계가 오르면: 동네 상인회 감사 선물(돈) · 트리를 구경하러 오는 사람 증가 · 주민 대사 변화 · 선물 상자·반짝이 줄·빛
   · 저장: S.xm = {o:[21칸], st:단계, gift:1}  (SAVE_VER 10)
   ===================================================================== */
const XT_TIERS=[[-10,-42,35,6],[-26,-58,30,5],[-42,-73,25,4],[-57,-87,19,3],[-70,-100,13,2]]; // [아래y, 꼭대기y, 반폭, 자리 수]
const XT_SLOTS=(()=>{const L=[[0,-104]];XT_TIERS.forEach(([b,t,w,n])=>{for(let k=0;k<n;k++){const u=n>1?(k/(n-1))*2-1:0;L.push([Math.round(u*(w-9)*.86*10)/10,b-6-(k%2?5:0)-(n===2?2:0)])}});return L})();
const XORN={
  ballR:{name:'빨간 오너먼트 볼',price:3000},ballG:{name:'금빛 오너먼트 볼',price:3000},ballB:{name:'은청색 오너먼트 볼',price:3000},
  candy:{name:'지팡이 사탕',price:3500},bow:{name:'빨간 리본',price:3500},snowf:{name:'눈꽃 장식',price:4000},bell:{name:'금종',price:4000},
  gift:{name:'작은 선물상자',price:5000},light:{name:'전구 줄',price:8000,desc:'반짝반짝 작은 전구 다섯 알'},
  wreathO:{name:'미니 리스',price:4500},pine:{name:'솔방울',price:2500},sock:{name:'크리스마스 양말',price:4500},icicle:{name:'고드름',price:3000,desc:'투명하게 반짝여요'},
  dSanta:{name:'산타 인형',price:6000},dRudolph:{name:'루돌프 인형',price:6000},dSnow:{name:'눈사람 인형',price:6000},dGinger:{name:'진저브레드 쿠키맨',price:6000},dBear:{name:'곰 인형',price:6000},
  star:{name:'꼭대기 별',price:15000,top:true}};
const XT_REWARD=[0,5000,8000,12000,18000,30000];
const XT_STAGE_MSG=['','트리 1단계! 지나가던 이웃이 걸음을 멈추고 구경해요.','트리 2단계! 트리 아래에 선물 상자가 생겼어요.','트리 3단계! 반짝이 줄이 트리를 감쌌어요. 구경 오는 사람이 늘었어요.','트리 4단계! 눈꽃이 반짝여요. 마을 사람들이 사진을 찍으러 와요.','트리 5단계 완성! 마을 최고의 크리스마스 트리가 됐어요 ✨'];
function xm(){S.xm=S.xm||{};const x=S.xm;if(!Array.isArray(x.o)||x.o.length!==21)x.o=Array(21).fill(null);x.o.forEach((v,k)=>{if(v&&!XORN[v])x.o[k]='pine'});return x} /* 없어진 장식(드라이플라워)은 솔방울로 바꿔 줘요 */
function xtCount(){return xm().o.slice(1).filter(Boolean).length}
function xtStage(){const n=xtCount();let st=Math.min(5,Math.floor(n/4));if(st===5&&xm().o[0]!=='star')st=4;return st}
function xtSig(){if(!XM_ON||!S.xm)return '0';return xm().o.map(v=>v||'-').join(',')}
const XT_POS={x:19,y:21}; // 트리 밑동 칸(2칸 너비)
function xtBase(){return [XT_POS.x*TILE+16,XT_POS.y*TILE+14]}
/* 트리 위 전구(전구 줄 장식 + 3단계 이상 반짝이 줄) */
function xtBulbs(){if(!XM_ON)return [];const [cx,by]=xtBase(),o=xm().o,L=[],dep=(XT_POS.y+1)*TILE-1.5;
  o.forEach((v,k)=>{if(v!=='light'||!k)return;const [dx,dy]=XT_SLOTS[k];for(let j=0;j<5;j++){const t=j/4;L.push([cx+dx-10+t*20,by+dy-1+Math.sin(t*Math.PI)*3.2,dep,1.5+j*.4])}});
  if(xtStage()>=3)XT_TIERS.forEach(([b,t,w],i)=>{const y0=by+b-3;for(let j=0;j<7-i;j++){const u=(j+.5)/(7-i)*2-1;L.push([cx+u*(w-5)*.92,y0-Math.abs(u)*2.5-8+i*.5,dep,2.4])}});
  return L}
/* 장식 그림 하나 */
function xtOrn(g,k,x,y,s){s=s||1;
  switch(k){
    case 'ballR':case 'ballG':case 'ballB':{const c={ballR:'#D32F3E',ballG:'#E3B23C',ballB:'#7FA8D8'}[k];ln(g,x,y-4*s,x,y-2.6*s,'#B8A060',.5*s);rr(g,x-.9*s,y-3.2*s,1.8*s,1.2*s,.3*s,'#C9B070');el(g,x,y,2.6*s,2.6*s,c);el(g,x,y+.6*s,2.6*s,1.8*s,mix(c,'#000000',.12));el(g,x-.9*s,y-.9*s,.8*s,.7*s,'rgba(255,255,255,.75)');return}
    case 'candy':{g.save();g.lineCap='round';g.strokeStyle='#FFFFFF';g.lineWidth=1.5*s;g.beginPath();g.moveTo(x+.8*s,y+3.6*s);g.lineTo(x+.8*s,y-1.6*s);g.arc(x-.4*s,y-1.6*s,1.2*s,0,Math.PI,true);g.stroke();g.setLineDash([.9*s,.9*s]);g.strokeStyle='#D32F3E';g.stroke();g.restore();return}
    case 'bow':bowV(g,x,y,'#D32F3E');return;
    case 'snowf':{for(let j=0;j<3;j++){const a=j*Math.PI/3;ln(g,x-Math.cos(a)*2.8*s,y-Math.sin(a)*2.8*s,x+Math.cos(a)*2.8*s,y+Math.sin(a)*2.8*s,'#FFFFFF',.7*s)}el(g,x,y,.8*s,.8*s,'#DDEBFA');return}
    case 'bell':{poly(g,[x-2.4*s,y+2*s,x-1.6*s,y-1.6*s,x,y-2.6*s,x+1.6*s,y-1.6*s,x+2.4*s,y+2*s],'#E3B23C');rr(g,x-2.6*s,y+1.6*s,5.2*s,1*s,.4*s,'#C99A2E');el(g,x,y+2.8*s,.7*s,.7*s,'#B8862A');bowS(g,x,y-2.8*s,s*.55,'#D32F3E');return}
    case 'gift':{rr(g,x-2.4*s,y-1.6*s,4.8*s,4*s,.5*s,'#4F8FD8');g.fillStyle='#F2C230';g.fillRect(x-.45*s,y-1.6*s,.9*s,4*s);g.fillRect(x-2.4*s,y+.2*s,4.8*s,.8*s);el(g,x-1*s,y-2.1*s,1*s,.7*s,'#F2C230');el(g,x+1*s,y-2.1*s,1*s,.7*s,'#F2C230');return}
    case 'light':{g.strokeStyle='#2A3A2E';g.lineWidth=.5*s;g.beginPath();g.moveTo(x-10*s,y-1*s);g.quadraticCurveTo(x,y+5.4*s,x+10*s,y-1*s);g.stroke();for(let j=0;j<5;j++){const t=j/4;el(g,x-10*s+t*20*s,y-1*s+Math.sin(t*Math.PI)*3.2*s,.8*s,1*s,XBC[j])}return}
    case 'wreathO':{for(let j=0;j<10;j++){const a=j/10*Math.PI*2;el(g,x+Math.cos(a)*2.4*s,y+Math.sin(a)*2.4*s,1.1*s,.75*s,j%2?'#3F7D55':'#2F6B48',a+1.2)}el(g,x+1.6*s,y-1.6*s,.5*s,.5*s,'#D8343F');el(g,x-1.8*s,y-1.2*s,.5*s,.5*s,'#D8343F');bowS(g,x,y+2.4*s,s*.5,'#D32F3E');return}
    case 'pine':{ln(g,x,y-3.4*s,x,y-2.4*s,'#B8A060',.4*s);el(g,x,y,1.8*s,2.6*s,'#7A5236');for(let j=0;j<4;j++){const yy=y-1.6*s+j*1.1*s;g.strokeStyle='#5A3A26';g.lineWidth=.35*s;g.beginPath();g.moveTo(x-1.7*s,yy);g.quadraticCurveTo(x,yy+.8*s,x+1.7*s,yy);g.stroke()}el(g,x-.5*s,y-1.8*s,.8*s,.45*s,'#FBFCFF');return}
    case 'sock':{ln(g,x,y-4*s,x,y-3*s,'#B8A060',.4*s);rr(g,x-1.6*s,y-3*s,3.2*s,4.4*s,.6*s,'#D32F3E');rr(g,x-1.6*s,y+.4*s,4.2*s,2.2*s,1.1*s,'#D32F3E');rr(g,x-1.9*s,y-3.4*s,3.8*s,1.4*s,.6*s,'#FBFCFF');el(g,x+.2*s,y+1.6*s,.6*s,.4*s,'#3F7D55');return}
    case 'icicle':{poly(g,[x-1.3*s,y-3*s,x+1.3*s,y-3*s,x+.15*s,y+4.2*s],'rgba(200,228,250,.95)');poly(g,[x-.6*s,y-3*s,x,y-3*s,x,y+3*s],'rgba(255,255,255,.9)');el(g,x,y-3.1*s,1.5*s,.5*s,'#FBFCFF');return}
    case 'dSanta':{el(g,x,y+1.6*s,2.4*s,2.2*s,'#D32F3E');rr(g,x-2.4*s,y+1.2*s,4.8*s,.7*s,.3*s,'#2E2B30');el(g,x,y-1.4*s,1.8*s,1.8*s,'#F6D2B8');el(g,x,y-.4*s,1.7*s,1.1*s,'#FFFFFF');poly(g,[x-1.9*s,y-2.2*s,x+1.9*s,y-2.2*s,x+1.2*s,y-4.6*s],'#D32F3E');rr(g,x-2*s,y-2.6*s,4*s,.8*s,.4*s,'#FFFFFF');el(g,x+1.2*s,y-4.6*s,.6*s,.6*s,'#FFFFFF');el(g,x-.6*s,y-1.6*s,.25*s,.25*s,'#2A2626');el(g,x+.6*s,y-1.6*s,.25*s,.25*s,'#2A2626');return}
    case 'dRudolph':{ln(g,x-1.2*s,y-1.8*s,x-2.4*s,y-4*s,'#7A5236',.5*s);ln(g,x-2*s,y-3.3*s,x-2.9*s,y-3.4*s,'#7A5236',.4*s);ln(g,x+1.2*s,y-1.8*s,x+2.4*s,y-4*s,'#7A5236',.5*s);ln(g,x+2*s,y-3.3*s,x+2.9*s,y-3.4*s,'#7A5236',.4*s);el(g,x,y+1.8*s,2*s,1.8*s,'#9C6A44');el(g,x,y-.6*s,2*s,2*s,'#A8744A');el(g,x,y+.6*s,1.1*s,.8*s,'#D8B08A');el(g,x,y+.4*s,.6*s,.6*s,'#E8343F');el(g,x-.7*s,y-1*s,.25*s,.28*s,'#2A2626');el(g,x+.7*s,y-1*s,.25*s,.28*s,'#2A2626');return}
    case 'dSnow':{el(g,x,y+1.6*s,2.3*s,2.1*s,'#FBFCFF');el(g,x,y-1.2*s,1.7*s,1.6*s,'#FFFFFF');rr(g,x-1.6*s,y-.4*s,3.2*s,.7*s,.3*s,'#3F7D55');rr(g,x-1.1*s,y-4.2*s,2.2*s,1.8*s,.3*s,'#2E2B30');rr(g,x-1.6*s,y-2.6*s,3.2*s,.5*s,.2*s,'#2E2B30');poly(g,[x,y-1.1*s,x+1.4*s,y-.9*s,x,y-.7*s],'#F08A3C');el(g,x-.5*s,y-1.5*s,.2*s,.2*s,'#2A2626');el(g,x+.5*s,y-1.5*s,.2*s,.2*s,'#2A2626');return}
    case 'dGinger':{const c='#B9773E';el(g,x,y-2*s,1.5*s,1.5*s,c);rr(g,x-1.3*s,y-.8*s,2.6*s,3*s,.8*s,c);ln(g,x-1.2*s,y-.2*s,x-2.6*s,y+.6*s,c,1*s);ln(g,x+1.2*s,y-.2*s,x+2.6*s,y+.6*s,c,1*s);ln(g,x-.6*s,y+2*s,x-1.3*s,y+3.6*s,c,1*s);ln(g,x+.6*s,y+2*s,x+1.3*s,y+3.6*s,c,1*s);
      g.strokeStyle='#FFFFFF';g.lineWidth=.3*s;g.beginPath();g.arc(x,y-1.8*s,.7*s,.3,Math.PI-.3);g.stroke();el(g,x-.5*s,y-2.3*s,.2*s,.2*s,'#FFFFFF');el(g,x+.5*s,y-2.3*s,.2*s,.2*s,'#FFFFFF');el(g,x,y+.2*s,.3*s,.3*s,'#E8343F');el(g,x,y+1.2*s,.3*s,.3*s,'#3F9A5A');return}
    case 'dBear':{const c='#C99A6A';el(g,x-1.4*s,y-2.6*s,.8*s,.8*s,c);el(g,x+1.4*s,y-2.6*s,.8*s,.8*s,c);el(g,x,y+1.8*s,2.1*s,2*s,c);el(g,x,y-1.2*s,1.9*s,1.7*s,c);el(g,x,y-.7*s,.9*s,.65*s,'#EED8BC');el(g,x,y-.9*s,.3*s,.22*s,'#3A2A22');el(g,x-.7*s,y-1.6*s,.22*s,.22*s,'#2A2626');el(g,x+.7*s,y-1.6*s,.22*s,.22*s,'#2A2626');poly(g,[x,y+.4*s,x-1*s,y-.2*s,x-1*s,y+1*s],'#D32F3E');poly(g,[x,y+.4*s,x+1*s,y-.2*s,x+1*s,y+1*s],'#D32F3E');return}
    case 'star':{const gr=g.createRadialGradient(x,y,0,x,y,10*s);gr.addColorStop(0,'rgba(255,236,150,.6)');gr.addColorStop(1,'rgba(255,236,150,0)');g.fillStyle=gr;g.fillRect(x-10*s,y-10*s,20*s,20*s);
      starPath(g,x,y,6.4*s,2.7*s,0);g.fillStyle='#F2C230';g.fill();g.strokeStyle='#D8A020';g.lineWidth=.6*s;g.stroke();starPath(g,x-.6*s,y-.6*s,3*s,1.3*s,0);g.fillStyle='rgba(255,250,210,.8)';g.fill();return}
  }}
/* 트리 전체 그림 (cx,by = 밑동 가운데) — 마을·꾸미기 창 미리보기 같이 써요 */
function drawXTree(g,cx,by,o,opt){opt=opt||{};const st=opt.stage!=null?opt.stage:xtStage(),q=seedRand(77);
  shadow(g,cx,by+1,26,4.2);
  el(g,cx,by-1.2,22,6,'#B8323C');el(g,cx,by-2,20,4.6,'#D03A46');g.save();g.globalAlpha=.9;for(let k=0;k<14;k++){const a=k/14*Math.PI*2;el(g,cx+Math.cos(a)*20,by-1.2+Math.sin(a)*5.2,2.1,1.3,'#F7F4EE')}g.restore();
  rr(g,cx-3,by-13,6,11,1,'#6B4A36');
  XT_TIERS.forEach(([b,t,w],i)=>{const B=by+b,T=by+t,n=9,pts=[];
    for(let k=0;k<=n;k++){const u=k/n*2-1;pts.push([cx+u*w,B+(k%2?-3.2:0)-Math.abs(u)*1.2+(k===0||k===n?-1:0)])}
    g.beginPath();g.moveTo(cx,T);pts.forEach(([x,y])=>g.lineTo(x,y));g.closePath();g.fillStyle='#2E6A49';g.fill();
    g.save();g.clip();poly(g,[cx,T,cx+w+2,B+2,cx+w*.1,B+2],'rgba(10,40,25,.28)');poly(g,[cx,T,cx-w*.55,B-(B-T)*.2,cx-w*.15,B-(B-T)*.35],'rgba(120,190,140,.18)');
    for(let k=0;k<14;k++){const u=q()*1.8-.9,yy=B-2-q()*(B-T)*.8,ww=w*(1-(B-yy)/(B-T));ln(g,cx+u*ww,yy,cx+u*ww+(u<0?-2.4:2.4),yy+1.8,k%2?'#3B7F59':'#245A3D',.6)}g.restore();
    pts.forEach(([x,y],k)=>{if(k%2||k===0||k===n)return;el(g,x,y-.9,w/n*.85,1.25,'#F4F8FC');el(g,x-.6,y-1.4,w/n*.45,.6,'#FFFFFF')});
    el(g,pts[0][0]+2,pts[0][1]-.6,2.2,1,'#F4F8FC');el(g,pts[n][0]-2,pts[n][1]-.6,2,1,'#E6EEF6');
    if(i===4){poly(g,[cx,T-1,cx+w*.36,T+(B-T)*.36,cx+w*.08,T+(B-T)*.3,cx-w*.12,T+(B-T)*.38,cx-w*.4,T+(B-T)*.3],'#F4F8FC')}});
  if(st>=3){g.save();g.strokeStyle='#E8C450';g.lineWidth=.9;g.setLineDash([1.6,1.1]);XT_TIERS.forEach(([b,t,w])=>{g.beginPath();g.moveTo(cx-w*.9,by+b-5);g.quadraticCurveTo(cx,by+b+1,cx+w*.9,by+b-8);g.stroke()});g.restore()}
  if(st>=3)XT_TIERS.forEach(([b,t,w],i)=>{for(let j=0;j<7-i;j++){const u=(j+.5)/(7-i)*2-1;el(g,cx+u*(w-5)*.92,by+b-3-Math.abs(u)*2.5-8+i*.5,.75,.9,XBC[(i+j)%5])}});
  if(st>=4){for(let k=0;k<10;k++){const [b,t,w]=XT_TIERS[k%5],u=q()*1.4-.7;starPath(g,cx+u*w*.7,by+b-4-q()*12,1.6,.5,0);g.fillStyle='rgba(255,255,255,.9)';g.fill()}}
  const o2=o||xm().o;
  o2.forEach((v,k)=>{if(!v||!XT_SLOTS[k])return;const [dx,dy]=XT_SLOTS[k];xtOrn(g,v,cx+dx,by+dy,k===0?1.1:1)});
  if(opt.marks){XT_SLOTS.forEach(([dx,dy],k)=>{if(o2[k])return;g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=.6;g.setLineDash([1,1]);g.beginPath();g.arc(cx+dx,by+dy,2.6,0,7);g.stroke();g.setLineDash([])})}
  if(opt.sel!=null){const [dx,dy]=XT_SLOTS[opt.sel];g.strokeStyle='#FF6FA0';g.lineWidth=1.2;g.beginPath();g.arc(cx+dx,by+dy,4.6,0,7);g.stroke();g.strokeStyle='#FFFFFF';g.lineWidth=.5;g.beginPath();g.arc(cx+dx,by+dy,5.6,0,7);g.stroke()}
  if(st>=2){const G=[[-21,'#D03A46','#F2C230',6,5],[-13,'#4F8FD8','#FFFFFF',5,4.2],[15,'#3F8F5F','#D03A46',6,4.6],[23,'#F2C230','#D03A46',4.4,3.6]].concat(st>=4?[[-27,'#F4F1EA','#D03A46',4.4,3.4],[8,'#B88AD0','#FFFFFF',4.6,3.8]]:[]);
    G.forEach(([dx,c,r,w,h])=>{const x=cx+dx,y=by+1;rr(g,x-w/2,y-h,w,h,.6,c);g.fillStyle=r;g.fillRect(x-.5,y-h,1,h);g.fillRect(x-w/2,y-h*.55,w,.9);el(g,x-1,y-h-.5,1.1,.7,r);el(g,x+1,y-h-.5,1.1,.7,r)})}
}
/* 마을 트리 칸(설비) */
if(XM_ON){
  STATION_DEFS.push(['xtree','xtree','town',XT_POS.x,XT_POS.y,2,1]);
  /* 원래 그 자리의 자작나무·꽃밭·벤치는 옆으로(겨울 동안만) */
  {const k=DECOR_BASE.town.findIndex(d=>d.t==='tree'&&d.x===18&&d.y===22);if(k>=0)DECOR_BASE.town.splice(k,1)}
  {const k=TOWN_BEDS.findIndex(b=>b[0]===300&&b[1]===300);if(k>=0)TOWN_BEDS.splice(k,1)}
  {const b=STATION_DEFS.find(d=>d[0]==='bench2');if(b){b[3]=22;b[4]=21}STATION_DEFS.push(['xb1','bench','town',16,21,2,1])}
  DECOR_BASE.town.push({t:'snowman',x:12,y:31,w:1,h:1,v:0},{t:'snowman',x:41,y:24,w:1,h:1,v:1},{t:'snowducks',x:23,y:22,w:1,h:1,n:2});
}
STATION_DRAW.xtree=(g,s,x,y,w)=>drawXTree(g,x+w/2,y+14);
PR_STB.xtree=[-26,-112,26,6];
OPEN_LABEL.xtree='트리 꾸미기';
{const _sig=prStSig;prStSig=function(s){if(s.type==='xtree')return 'xt|'+xtSig()+'|'+s.x+','+s.y+'|'+prBakeScale(s.area);return _sig(s)}}
STATION_ACT.xtree=i=>{const o=xm().o;let sel=o.findIndex((v,k)=>k>0&&!v);if(sel<0)sel=o[0]?1:0;openModal(i,{type:'xtree',sel,say:pick(XT_SAY[xtStage()])})};
const XT_SAY=[['아직 조금 허전한 트리예요. 하나씩 걸어 볼까요?','전나무 향이 은은하게 나요.'],['장식이 하나둘 늘었어요!','지나가던 아이가 “우와!” 하고 멈췄어요.'],['선물 상자가 쌓이니 진짜 크리스마스 같아요.','동네 사람들이 하나씩 구경하러 와요.'],['반짝이 줄이 감기니 훨씬 화려해졌어요.','밤에 보면 더 예뻐요!'],['사진 찍으러 오는 사람이 많아졌어요.','조금만 더 하면 완성이에요!'],['마을 최고의 트리예요! 두 사람 덕분이에요.','오늘 밤엔 트리 앞이 제일 붐비겠어요.']];
/* 40차: 트리는 '보관함의 오너먼트를 거는 곳'. 오너먼트는 크리스마스 마켓에서 사요.
   자리 옮기기: 조이콘 위쪽 버튼(SL·SR / L·R) 또는 화면의 ◀ ▶ · 방향키로 보관함의 장식을 골라 행동 버튼으로 걸기 · '빼기'는 보관함으로 */
function xtKeyHint(i){const K=(SET.keys&&SET.keys[typeof kOf==='function'?kOf(i):i])||{},L=b=>b?bindLabel(b):null;const a=L(K.tprev),b=L(K.tnext);return a||b?`자리 옮기기: ${a||'-'} / ${b||'-'}`:'조이콘 위쪽 버튼으로도 자리를 옮겨요 (설정 → 조이콘 키 지정에서 바꿀 수 있어요)'}
function xmInv(){const x=xm();return x.inv||(x.inv={})}
MODAL_R.xtree=(i,m)=>{const x=xm(),st=xtStage(),n=xtCount(),sel=m.sel,isTop=sel===0,cur=x.o[sel],inv=xmInv();
  const nextNeed=st>=5?0:st===4&&n>=20?1:(st+1)*4-n,stars='★'.repeat(st)+'☆'.repeat(5-st);
  const keys=Object.keys(XORN).filter(k=>(inv[k]||0)>0&&(isTop?XORN[k].top:!XORN[k].top));
  const list=keys.length?`<div class="shopgrid">${keys.map(k=>`<div class="scard"><div class="sart">${typeof ornArt==='function'?ornArt(k):''}</div><div class="sname">${XORN[k].name}</div><div class="sdesc">보관함 ${inv[k]}개</div><button class="btn small soft" data-a="xeq" data-v="${k}">${cur?'바꿔 걸기':'걸기'}</button></div>`).join('')}</div>`
    :`<p class="req">${isTop?'꼭대기에는 별만 달 수 있어요.':'보관함에 걸 수 있는 장식이 없어요.'} 크리스마스 마켓(북쪽 언덕길)에서 오너먼트를 사 오세요.</p>`;
  return head(i,'크리스마스 트리 꾸미기')+`<p class="req" style="margin:.1rem 0 .3rem">${esc(m.say||'')}</p>
    <div class="row" style="align-items:center;gap:.6rem"><canvas class="sprev4" id="xtp${i}" width="300" height="300" style="max-width:15rem"></canvas>
    <div class="grow" style="min-width:9rem"><p class="req"><b>트리 ${st}단계</b> ${stars}<br>장식 ${n}/20 · 별 ${x.o[0]?'달았어요':'아직'}<br>${st>=5?'완성! 정말 멋져요.':nextNeed>0?`다음 단계까지 장식 ${nextNeed}개`:'꼭대기 별을 달면 완성!'}</p>
    <div class="row"><button class="btn small" data-a="xsel" data-v="-1">◀ 자리</button><button class="btn small" data-a="xsel" data-v="1">자리 ▶</button>${cur?'<button class="btn small" data-a="xoff">빼기</button>':''}</div>
    <p class="req">${isTop?'꼭대기 자리(별)':'몸통 '+sel+'번 자리'} · ${cur?'지금: '+XORN[cur].name:'비어 있어요'}<br><small>${xtKeyHint(i)}</small></p></div></div>
    <div class="sscroll scr">${list}</div>`};
MODAL_AFTER.xtree=(i,m)=>{const cv=$('#xtp'+i);if(!cv)return;const g=cv.getContext('2d');g.clearRect(0,0,300,300);const gr=g.createLinearGradient(0,0,0,300);gr.addColorStop(0,'#2B3560');gr.addColorStop(1,'#56648F');g.fillStyle=gr;g.fillRect(0,0,300,300);
  const q=seedRand(5);for(let k=0;k<40;k++)el(g,q()*300,q()*300,.8+q(),.8+q(),'rgba(255,255,255,.7)');g.fillStyle='#EEF4FA';g.fillRect(0,262,300,38);
  g.save();g.translate(150,268);g.scale(2.35,2.35);drawXTree(g,0,0,null,{sel:m.sel,marks:true});g.restore()};
MODAL_C.xtree=(i,a,v,m)=>{const x=xm(),inv=xmInv();
  if(a==='xsel'){m.sel=(m.sel+(+v)+21)%21;GP.ctxFocus['m'+i]=`[data-a="xsel"][data-v="${v}"]`;renderModal(i);return}
  if(a==='xoff'){const k=x.o[m.sel];if(k){x.o[m.sel]=null;inv[k]=(inv[k]||0)+1;bump();saveMid();toast(i,`${XORN[k]?XORN[k].name:'장식'}을(를) 떼서 보관함에 넣었어요`);renderModal(i)}return}
  if(a==='xeq'){const it=XORN[v];if(!it||!(inv[v]>0))return;if(!!it.top!==(m.sel===0)){toast(i,it.top?'별은 꼭대기에만 달 수 있어요':'꼭대기엔 별을 달아요');return}
    const st0=xtStage(),old=x.o[m.sel];inv[v]--;if(old)inv[old]=(inv[old]||0)+1;x.o[m.sel]=v;sfx('buy');bump();
    const st=xtStage();toast(i,`${it.name}을(를) 걸었어요`);
    if(st>st0){x.st=Math.max(x.st||0,st);if(st>(x.paid||0)){const rw=XT_REWARD[st];for(let k=(x.paid||0)+1;k<=st;k++)S.money+=XT_REWARD[k];x.paid=st;toastAll(XT_STAGE_MSG[st]+(rw?` 동네 상인회가 고맙다며 ${won(rw)}을 보냈어요.`:''));sfx('gift')}xtWatchers();m.say=pick(XT_SAY[st])}
    const nx=x.o.findIndex((w,k)=>k>0&&!w);if(nx>0&&m.sel!==0&&!old)m.sel=nx;
    GP.ctxFocus['m'+i]=inv[v]>0?`[data-a="xeq"][data-v="${v}"]`:'[data-a="xsel"][data-v="1"]';saveMid();renderModal(i)}};
/* 조이콘 위쪽 버튼으로 트리 자리 옮기기 (game-5 의 패드 읽기에서 불러요) */
function xtShoulder(slot,side,combo,fresh,B){const c=S.chars[slot];if(!c||!c.modal||c.modal.type!=='xtree')return false;
  /* 설정 → 조이콘 키 지정에서 '트리 자리 ◀/▶'를 정했으면 그 버튼, 안 정했으면 위쪽 버튼(SL·SR / L·R)이 기본이에요 */
  const M=(B&&(B.tprev||B.tnext))?{p:B.tprev||[],n:B.tnext||[]}:combo?(side==='L'?{p:[6],n:[4]}:{p:[5],n:[7]}):{p:[4,6],n:[5,7]};
  if(M.p.some(fresh)){MODAL_C.xtree(slot,'xsel','-1',c.modal);return true}if(M.n.some(fresh)){MODAL_C.xtree(slot,'xsel','1',c.modal);return true}return false}
addEventListener('keydown',e=>{const k=e.key;const d=(k==='q'||k==='Q'||k==='['||k==='PageUp')?-1:(k==='e'||k==='E'||k===']'||k==='PageDown')?1:0;if(!d||!S.chars)return;
  const i=S.chars.findIndex(c=>c&&c.modal&&c.modal.type==='xtree');if(i<0)return;e.preventDefault();MODAL_C.xtree(i,'xsel',String(d),S.chars[i].modal)});

/* 트리 구경꾼: 단계만큼 늘어요(1~6명) — 마을 엑스트라 두 명을 빼고 대신 넣어서 전체 수는 크게 안 늘어요 */
const XT_SPOTS=[[16.6,22.2,23.4,23.6,3],[15.4,19.6,16.6,22.4,1],[23,19.4,23.6,22.4,1]];
function xtSpot(){for(let n=0;n<20;n++){const r=pickW(XT_SPOTS);const p=[rnd(r[0],r[2])*TILE,rnd(r[1],r[3])*TILE];if(!blocked('town',p[0],p[1]))return p}return [20*TILE,23*TILE]}
function xtWant(){return XM_ON?1+xtStage():0}
function xtWatchers(){if(!XM_ON||!S.walkers)return;const have=S.walkers.filter(w=>w.zone==='xtree'&&!w.follow).length;
  for(let k=have;k<xtWant();k++){const kind=['adult','kid','elder','couple','adult','kid'][k%6];if(kind==='couple'){const f=Math.random()<.5,a=mkWalker('couple','xtree',{fem:f}),b=mkWalker('couple','xtree',{fem:!f,follow:a});b.x=a.x+12;b.y=a.y;a.mate=b;S.walkers.push(a,b)}else S.walkers.push(mkWalker(kind,'xtree'))}}
{const _pk=park;park=function(zone){if(zone==='xtree')return xtSpot();return _pk(zone)}}
{const _ws=walkerStep;walkerStep=function(w,dt){
  if(w.zone!=='xtree'||w.follow||w.talking)return _ws(w,dt);
  if(S.t>=575){w.hidden=1;return}w.hidden=0;
  if(w.wait>0){w.wait-=dt;w.walk=0;w.mv=false;const [cx]=xtBase(),ang=Math.atan2(cx-w.x,(XT_POS.y-2)*TILE-w.y);const D=['down','dr','right','ur','up','ul','left','dl'];w.dir=D[((Math.round(ang/(Math.PI/4))%8)+8)%8];return}
  w.path=[[w.tx,w.ty]];if(stepToward(w,dt,w.kind==='kid'?20:w.kind==='elder'?10:14)){w.wait=rnd(4,11);[w.tx,w.ty]=xtSpot()}}}
const XT_TALK=[['트리가 생겼네요! 아직은 좀 허전하지만요.','장식이 하나도 없어서 트리가 추워 보여요.'],['오, 장식이 생겼어요! 누가 걸었을까요?','저기 반짝이는 거 보이세요? 예쁘다.'],['트리 아래 선물 상자 진짜 같아요!','아이가 트리 보러 가자고 졸라서 나왔어요.'],['반짝이 줄 너무 예뻐요. 밤에 또 올래요.','꽃집 사장님들이 꾸민 거래요. 역시 감각이 달라요.'],['사진 찍으러 일부러 왔어요!','이 트리 동네 단톡방에 벌써 돌았어요.'],['이렇게 예쁜 트리는 처음 봐요. 올해 크리스마스는 여기서 보낼래요.','트리 꼭대기 별 보이세요? 소원 빌었어요.','메리 크리스마스! 두 분 덕분에 동네가 환해졌어요.']];

/* =====================================================================
   12. 주민 겨울옷: 주민·손님 그림을 그릴 때 패딩·코트·목도리·장갑을 입혀요(우리 둘은 옷장 옷 그대로)
       같은 사람은 늘 같은 겨울옷 → 그림 수(메모리)는 그대로예요
   ===================================================================== */
const WPAL=new WeakMap();
const W_PAD=['#2E2B30','#3E4D6E','#F4F1EA','#8A6A55','#5A6B5A','#C9B8A0','#6E5A78','#B8574A'],W_WOOL=['#C9A27A','#3E4D6E','#8E3A4C','#6B6B70','#E8E2D6','#5A4A3E'],W_KID=['#F2C230','#E85A5A','#5FA8E8','#F29AB0','#7FC48A','#B88AD0'],
  W_SC=['#C65C5C','#EFE4D0','#3F6B4E','#8E3A4C','#F2B6C6','#5A6E9A','#E8C46A'],W_MIT=['#C0463E','#F4F1EA','#3F6B4E','#F2B6C6','#5A6E9A'],W_HAT=['#C0463E','#F4F1EA','#3E4D6E','#E8C46A','#7FA88A','#F2B6C6'];
function winterPal(p){let w=WPAL.get(p);if(w)return w;
  const key=(p.hair||'')+(p.tee||'')+(p.skin||'')+(p.hs||'')+(p.pants||'')+(p.shoe||'')+(p.style||'');let h=7;for(let k=0;k<key.length;k++)h=(h*31+key.charCodeAt(k))|0;const q=seedRand((h>>>0)||1),pk=L=>L[Math.floor(q()*L.length)%L.length];
  w={...p,wz:1};const kid=p.kind==='kid'||(p.sc&&p.sc<.8);
  if(p.coat){if(!p.scarf&&!p.neck&&q()<.7)w.scarf=pk(W_SC)}
  else{const r=q();if(kid){w.coat='pad';w.coatC=pk(W_KID)}else if(r<.52){w.coat='pad';w.coatC=pk(W_PAD)}else{w.coat='wool';w.coatC=pk(W_WOOL)}
    if(!p.scarf&&!p.neck&&q()<(kid?.45:.55))w.scarf=pk(W_SC);
    if(q()<(kid?.6:.22))w.mitten=pk(W_MIT)}
  if(!p.hat&&(!p.acc||p.acc==='sunhat')&&q()<(kid?.65:.3)){w.acc='beanie';w.hat='beanie';w.hatC=pk(W_HAT)}
  else if(p.acc==='sunhat'){w.acc=null}
  WPAL.set(p,w);return w}
if(WINTER){
  const _pf=palFromOutfit;palFromOutfit=function(base,o){const p=_pf(base,o);p.pl=1;return p};
  const _d0=drawChar0;drawChar0=function(g,x,y,p,dir,phase,moving,glasses,work,sit){if(p&&!p.pl&&!p.wz&&!p.noW&&!p.jersey&&!(BAKE&&BAKE.onChar)){const po=p.pose;if(!po||po==='lie')p=winterPal(p)}return _d0(g,x,y,p,dir,phase,moving,glasses,work,sit)};
  if(typeof STYLIST!=='undefined')STYLIST.noW=1; // 미용실 디자이너는 실내라 그대로
}

/* ---------- 13. 겨울 선물(한 번): 둘에게 따뜻한 패딩·장갑·목도리 → 바로 갈아입혀요 ---------- */
function winterGift(){if(!WINTER)return;const x=xm();if(x.gift)return;x.gift=1;S.closet=S.closet||{};
  const G=[{outer:'pad|#2E2B30',glove:'#3F6B4E',acc:'scarfC'},{outer:'pad|#F4F1EA',glove:'#C0463E',acc:'scarfR'}];
  [0,1].forEach(i=>{const o=S.outfit[i]||(S.outfit[i]={}),g=G[i];
    S.closet['st_outer_'+g.outer]=true;o.outer=g.outer;S.closet['st_glove_'+g.glove]=true;o.glove=g.glove;
    if(!o.acc){S.closet['st_acc_'+g.acc]=true;o.acc=g.acc}
    if(['sunhat','visor','bucket'].includes(o.hat))delete o.hat});
  S.wgTell=1}
/* 여름 옷은 상점 진열에서 내려요(이미 산 옷은 옷장에 그대로) */
if(WINTER){const OFF=['st_hat_sunhat','st_hat_visor','st_hat_bucket','st_dress_pink','st_dress_sky','st_dress_linen'];for(let k=SHOP_ITEMS.length-1;k>=0;k--)if(OFF.includes(SHOP_ITEMS[k].id))SHOP_ITEMS.splice(k,1)}

/* ---------- 14. 하루 시작: 눈 오는 날 정하기 · 선물 · 트리 구경꾼 ---------- */
if(WINTER){
  const _sd=startDaySetup;startDaySetup=function(){S.snowW=rollSnow();S.snowTold=0;try{xm();winterGift()}catch(e){console.error(e)}return _sd()};
  const _mw=makeWalkers;makeWalkers=function(){_mw();
    [w=>w.kind==='student'&&w.zone==='lane'&&!w.main,w=>w.kind==='dog'&&w.zone==='right'&&!w.main].forEach(f=>{const k=S.walkers.findIndex(f);if(k>=0)S.walkers.splice(k,1)});
    xtWatchers()};
}
/* 첫 화면이 지나고 놀기 시작하면 알림 한 번 */
{const _sdy=seasonDyn;seasonDyn=function(area,tt){_sdy(area,tt);if(S.wgTell&&S.phase==='play'){S.wgTell=0;setTimeout(()=>toastAll('겨울 선물! 따뜻한 패딩·장갑·목도리가 옷장에 들어왔고, 바로 입었어요 🧣'),1200)}}}

/* =====================================================================
   15. 겨울·크리스마스 대사
   ===================================================================== */
const TALK_W={
  lake:['호수 가장자리에 살얼음이 꼈어요. 오리들이 미끄러져요.','겨울 노을은 짧아서 더 예뻐요.','호숫가 바람이 매서워요. 목도리 꼭 하세요.'],
  adult:['토토가 요즘 꽃집 난로 앞에서만 자요.','손이 꽁꽁 얼었어요. 붕어빵 사러 가는 길이에요.','눈 오는 날엔 꽃집 불빛이 더 따뜻해 보여요.','올해 크리스마스엔 꽃다발 선물해 볼까 해요.','해가 진짜 빨리 지죠? 다섯 시면 깜깜해요.','길 미끄러우니 조심하세요!','꽃시장은 정오에 닫으니 오전에 서두르세요. 겨울 아침은 더 바빠요.','현관에 리스 하나 걸고 싶어요. 꽃집에서 만들어 주세요?','연말이라 송년회가 많아요. 꽃다발 들고 가면 인기 최고겠죠?'],
  kid:['눈사람 만들었어요! 당근 코도 달았어요!','눈싸움하다가 장갑 다 젖었어요. 헤헤.','산타 할아버지한테 편지 썼어요!','겨울방학 언제 해요? 빨리 했으면 좋겠어요!','눈오리 집게 갖고 싶어요! 오리 열 마리 만들 거예요.','토토도 추운지 꽃집 앞에서 몸을 동그랗게 말았어요.','크리스마스에 엄마한테 포인세티아 드릴래요!','운동장에 눈사람 있죠? 제가 만든 거예요!'],
  elder:['허허, 첫눈이 오면 옛날 생각이 나는구먼.','겨울엔 동백이 제일이지. 눈 속에서 빨갛게 피거든.','길 미끄러우니 천천히 다니게.','젊을 때 크리스마스엔 우리 할멈한테 빨간 꽃을 줬지.','손 시리지? 따뜻한 차 한 잔 하고 가게.'],
  student:['종강했어요! 드디어 겨울방학이에요!','기말고사 끝! 오늘은 아무것도 안 할 거예요.','방학 동안 꽃꽂이 배워 볼까 해요.','방학이라 늦잠 잤어요. 행복해요.'],
  couple:['저희 크리스마스에 트리 보러 올 거예요!','둘이 커플 목도리 샀어요. 어때요?','연말엔 꽃다발 하나씩 주고받기로 했어요.','첫눈 오는 날 고백받았어요. 헤헤.'],
  walkin:['밖은 추운데 안은 꽃향기 때문에 따뜻해요.','진열대 꽃다발이 참 예뻐요. 크리스마스 느낌!','리스 너무 예쁘다. 우리 집 문에도 걸고 싶어요.','구경만 해도 연말 기분이 나요.']
};
if(WINTER)Object.keys(TALK_W).forEach(k=>{TALK[k]=TALK_W[k]});
const XT_TOWN=[['공원에 큰 전나무가 들어왔대요! 누가 꾸며 주면 좋겠어요.','트리가 아직 맨몸이에요. 장식 하나쯤 걸어 주실래요?'],['공원 트리에 장식이 생겼던데, 혹시 두 분이에요?','트리 보러 일부러 돌아서 왔어요.'],['트리 밑에 선물 상자 봤어요? 진짜 선물인 줄 알았어요.','요즘 공원 트리 구경하는 재미로 산책해요.'],['밤에 트리 반짝이는 거 봤어요? 너무 예뻐요!','동네 사람들이 다 트리 얘기만 해요.'],['트리 앞에서 가족사진 찍었어요!','이웃 마을에서도 트리 보러 온대요.'],['올해 트리는 역대 최고래요. 메리 크리스마스!','트리 꼭대기 별에 소원 빌었어요. 비밀이에요!']];
if(WINTER){const _tl=talkLine;talkLine=function(w){
  if(w.kind==='cat'||w.kind==='order'||w.kkami)return _tl(w);
  if(XM_ON&&w.zone==='xtree')return pick(XT_TALK[xtStage()]);
  if(XM_ON&&w.kind!=='walkin'&&wArea(w)==='town'&&Math.random()<.22)return pick(XT_TOWN[xtStage()]);
  return _tl(w)}}

/* 마을 메인 주민 평소 대화(겨울판): [친해진 정도 0~2][아침·낮·저녁] */
const SMALL_W={
  minji:[[['좋은 아침이에요! 까미가 눈밭에서 뒹굴다 왔어요. 지금 하얀 강아지예요.','아침 눈길엔 발자국 그리는 재미가 있어요.'],['손이 시려서 연필이 자꾸 미끄러져요. 장갑 끼고 그려야겠어요.','오늘 하늘은 회색 물감에 흰색을 살짝 섞은 색이에요.'],['해가 너무 빨리 져요. 그림 그리다 보면 벌써 깜깜해요.','저녁에 꽃집 앞 전구 반짝이는 거, 그림으로 꼭 남길 거예요.']],
    [['{me} 씨 목도리 따뜻해 보여요! 저도 하나 살까 봐요.','까미가 {shop} 앞 리스 냄새를 맡고 한참 서 있었어요.'],['크리스마스 카드 그리는 중이에요. 첫 장은 {shop}이에요.','{other} 씨가 창가에서 포인세티아 다듬는 거 봤어요. 빨간색이 예뻤어요.'],['눈 오는 저녁엔 북쪽 언덕 벤치에 가 봐요. 마을 불빛이 다 보여요.','오늘은 까미 대신 제가 미끄러질 뻔했어요. 헤헤.']],
    [['{me} 씨 얼굴 보니까 마음이 따뜻해져요. 손난로 같아요.','우리 까미가 {me} 씨 발소리를 알아요. 눈길에서도 꼬리 흔들어요.'],['{fav} 그린 크리스마스 카드, 완성되면 제일 먼저 줄게요!','책 나오면 첫 사인은 {me} 씨한테 할게요. 겨울 한정판으로요!'],['오늘 하루도 수고 많았어요. 메리 크리스마스 미리 할게요!','두 분이 트리 앞에 서 있는 모습, 다음 그림책 표지로 하고 싶어요.']]],
  suni:[[['아이고, 이 추운데 부지런도 해라. 장갑은 꼈어요?','겨울 아침 꽃시장은 꽃보다 사람이 먼저 언다우.'],['겨울엔 꽃이 물을 덜 먹어도 찬물은 싫어해요. 미지근하게 줘요.','동백은 눈 맞을 때가 제일 곱다우.'],['해가 금방 지네. 길 미끄러우니 조심히 다녀요.','문 닫기 전에 난로 꼭 끄고 가요.']],
    [['{me} 왔구나. 오늘은 리스 몇 개나 나갔어요?','어제 가게 앞 지나가는데 전나무 향이 골목까지 나더라.'],['포인세티아는 추위를 타니 문가에 두지 말아요. 호호, 잔소리다 생각해요.','{other}는 리스 엮는 손이 참 곱더라. 보기 좋아.'],['오늘도 욕봤어요. 유자차 한 잔 하고 쉬어요.','눈 오는 걸 보니 우리 영감이랑 처음 만난 날 생각이 나네.']],
    [['우리 {me}, 코가 빨개졌네. 따뜻한 거 먹고 다녀요.','{shop} 리스 볼 때마다 내 가게보다 예쁘다 싶어 샘이 난다우. 호호.'],['{me}는 꽃 만질 때 제일 예뻐. 겨울엔 더 그렇고.','손님 많았다며? 크리스마스라고 소문이 내 귀까지 왔어.'],['내년에도 문 열 거지? 그 생각만 해도 든든하다우.','둘이서 사이좋게 연말 보내는 게 제일 큰 복이야.']]],
  doyun:[[['좋은 아침입니다! 연말이라 카드가 산더미예요.','눈길엔 우체부도 엉금엉금이에요. 하하.'],['점심은 붕어빵으로 때웠어요. 팥이 제일이죠.','이 가방, 요즘 크리스마스 카드 때문에 두 배로 무거워요.'],['마지막 배달 끝! 손이 꽁꽁 얼었어요.','저녁엔 전구 켜진 집들 보면서 동네를 한 바퀴 돌아요.']],
    [['{me} 씨! {shop} 앞 리스 보고 한참 서 있었어요.','해솔 씨한테 크리스마스 카드를 쓸까 말까… 아, 아무것도 아니에요.'],['카드 봉투에 꽃 스티커 붙이는 사람이 늘었어요. 꽃집 덕분인가?','{other} 씨가 아까 핫팩 줘서 손이 녹았어요!'],['오늘은 소포가 많아서 어깨가 뻐근하네요. 하하.','퇴근길에 {shop} 전구 불빛 보면 괜히 마음이 놓여요.']],
    [['{me} 씨, 좋은 아침! 오늘은 제가 먼저 인사하려고 눈길을 뛰어왔어요.','해솔 씨가 {shop} 리스를 도서관 문에 걸고 싶대요. 저도 괜히 뿌듯해요.'],['크리스마스에 해솔 씨한테 꽃다발 주고 싶어요. 무슨 꽃이 좋을까요?','올해 받은 카드 중에 두 분 카드가 제일 좋았어요.'],['오늘도 수고 많았어요, 사장님들! 메리 크리스마스!','눈 오는 밤에 가게 앞에 서 있는 두 분, 크리스마스 카드 그림 같아요.']]],
  haru:[[['안녕하세요! 저 학교 가는 길이에요! 눈 밟으면서 왔어요!','아침에 토토 봤어요? 눈 위에 발자국 남기고 갔어요!'],['학교 끝났다! 이제 눈사람 만들 거예요!','오늘 급식에 귤 나왔어요. 최고!'],['해가 벌써 져요. 엄마가 일찍 오라고 했어요.','토토가 꽃집 앞에서 몸을 동그랗게 말고 있어요. 추운가 봐요.']],
    [['사장님! 저 산타 할아버지한테 편지 썼어요!','토토한테 목도리 해 주고 싶은데 싫대요. 헤헤.'],['사장님, 크리스마스에 엄마 줄 꽃은 뭐가 좋아요?','저 오늘 눈싸움에서 이겼어요!'],['집에 가기 전에 트리 보고 가려고요!','내일은 눈오리 만들어서 가져올게요.']],
    [['사장님 최고! 오늘도 힘내세요!','어젯밤 꿈에 산타 할아버지가 꽃집에서 꽃을 샀어요!'],['{other} 사장님이 포인세티아 잎 하나 줬어요. 책에 끼워 놨어요!','방학하면 매일 꽃집 놀러 올게요!'],['내일 또 올게요! 약속!','메리 크리스마스! 오늘 제일 재밌었던 건… 사장님이랑 얘기한 거!']]],
  yuna:[[['아침 실험 걸어 놓고 나왔어요. 학부생들은 종강이라던데… 부럽네요.','캠퍼스가 텅 비었어요. 방학이라 다들 집에 갔대요. 우린 빼고요.'],['점심은 학생회관… 방학이라 메뉴가 하나뿐이에요.','눈 오는 캠퍼스는 예쁜데, 연구실 창문으로만 봐요.'],['해가 네 시 반에 져요. 그래도 실험은 안 끝나요.','학부생들 눈사람 만드는 거 봤어요. 저도 저럴 때가 있었죠.']],
    [['{me} 씨! 대학원생한테 방학이 어딨어요. 커피 수혈하러 나왔어요.','준엽이가 학부생들 방학 공지 보고 한숨 쉬더라고요.'],['{shop} 리스 사진을 연구실 모니터 배경으로 했어요. 크리스마스 기분이라도 내려고요.','병권 교수님이 연말 보고서 마감을 크리스마스이브로 잡았어요… 진짜로요.'],['오늘은 일찍 퇴근… 하는 꿈을 꿨어요. 꿈이었어요.','{other} 씨한테도 메리 크리스마스 전해 줘요.']],
    [['{me} 씨 얼굴 보니까 오늘은 실험이 잘될 것 같아요.','방학 없는 대학원생이지만, 꽃집에 오는 게 저만의 방학이에요.'],['나중에 제 연구실이 생기면 학생들한테 겨울방학 꼭 줄 거예요. 꼭이요.','병권 교수님 앞에서도 이제 할 말은 해요. "교수님, 크리스마스는 쉬겠습니다."'],['오늘은 진짜 일찍 가요. 저 자신이랑 약속했어요.','캠퍼스 눈길 같이 걸을래요? 가로등 켜지면 여기도 꽤 예뻐요.']]],
  junyeop:[[['아, 안녕하세요… 학부생들은 방학인데 저는 출근했어요.','선배가 아침엔 꼭 뭘 먹으라고 해서요. 호빵 먹는 중이에요.'],['점심이요? 방학이라 식당이 한 곳만 열어서 줄이 길어요.','눈사람 만드는 학부생들 보니까 부러워서 눈물이… 아니 눈이 들어갔어요.'],['벌써 깜깜해요. 연구실 불은 오늘도 제가 끌 것 같아요.','방학 공지 메일 왔는데 저랑은 상관없는 메일이었어요.']],
    [['사장님, 오늘 선배 기분 좋아 보였어요. 크리스마스라 그런가요?','커피 두 잔 샀어요. 한 잔은… 그냥 두 잔 사고 싶었어요.'],['선배가 {shop} 리스 사진을 배경으로 해 놨더라고요. 저도 따라 했어요.','민욱이 형은 학부생 시절 겨울방학 얘기만 해요. 슬퍼져요.'],['크리스마스에도 실험실 와야 해요. 그래도 선배가 와요. 아마도요.','눈 오는 밤 캠퍼스는 진짜 예뻐요. 같이 볼 사람이… 아, 아니에요.']],
    [['사장님 보면 힘이 나요. 진짜로요.','선배한테 크리스마스 꽃다발 주면… 이상할까요?'],['연구실 창가 포인세티아, 제가 매주 물 줘요. 선배는 몰라요. 아마도요.','방학은 없지만 크리스마스는 있잖아요. 그거면 돼요.'],['오늘은 용기 내서 선배한테 같이 퇴근하자고 해 볼게요. 아마도요.','메리 크리스마스, 사장님들! 두 분처럼 되고 싶어요.']]]};
if(WINTER)Object.keys(SMALL_W).forEach(k=>{if(SMALL[k])SMALL[k]=SMALL_W[k]});
/* 저장된 하루 중간부터 이어 할 때도 겨울 선물·트리 상태를 챙겨요 */
if(WINTER){const _rm=resumeMid;resumeMid=function(m){try{xm();winterGift()}catch(e){console.error(e)}return _rm(m)}}

/* =====================================================================
   16. 북쪽 언덕 벤치에서 보는 겨울 풍경 (앉아 있는 동안만 그때그때 그려요 → 추가 메모리 없음)
       눈 덮인 먼 산 · 얼어붙은 강과 스케이트 타는 사람 · 건너편 마을 불빛과 작은 트리 · 눈 쌓인 소나무 · 별과 달 · 눈 오는 날엔 함박눈
   ===================================================================== */
const WSKY=[[0,'#9CC2E6','#E4EDF6','#FFFFFF'],[.35,'#9BB2D8','#F5DCC0','#FFF2E4'],[.6,'#7A7FB8','#F0A8A4','#E8B4C4'],[.82,'#3E4580','#B886A8','#8C7AA8'],[1,'#121A3C','#34406E','#3A4268']];
function wSkyPal(k){let a=WSKY[0],b=WSKY[WSKY.length-1];for(let i=0;i<WSKY.length-1;i++)if(k>=WSKY[i][0]&&k<=WSKY[i+1][0]){a=WSKY[i];b=WSKY[i+1];break}const f=(k-a[0])/Math.max(.001,b[0]-a[0]);return {top:mix(a[1],b[1],f),hor:mix(a[2],b[2],f),cloud:mix(a[3],b[3],f)}}
function drawWinterScene(g,X,Y,W,H,who){
  const amt0=snowAmt(),k=sunsetPal(S.t).k,P=wSkyPal(k),tt=performance.now()/1000,HZ=Y+H*.5,L=lampAt(S.t),night=clamp((k-.7)/.3,0,1),dim=c=>mix(c,P.top,.5*k);
  /* 하늘 */
  const sg=g.createLinearGradient(0,Y,0,HZ);sg.addColorStop(0,P.top);sg.addColorStop(.7,mix(P.top,P.hor,.6));sg.addColorStop(1,P.hor);g.fillStyle=sg;g.fillRect(X,Y,W,HZ-Y);
  if(night>0){const q=seedRand(19);g.globalAlpha=night;for(let i=0;i<70;i++){const sx=X+q()*W,sy=Y+q()*(HZ-Y)*.75,tw=(Math.sin(tt*(1.5+q()*2)+i)+1)/2,r=.5+q()*.7+tw*.4;el(g,sx,sy,r,r,'#FFFFFF')}
    const mx=X+W*.2,my=Y+H*.14,mr=Math.min(W,H)*.04;const mg=g.createRadialGradient(mx,my,0,mx,my,mr*5);mg.addColorStop(0,'rgba(220,230,255,.35)');mg.addColorStop(1,'rgba(220,230,255,0)');g.fillStyle=mg;g.fillRect(mx-mr*5,my-mr*5,mr*10,mr*10);
    g.save();g.beginPath();g.rect(mx-mr*2,my-mr*2,mr*4,mr*4);g.arc(mx+mr*.45,my-mr*.2,mr*.86,0,Math.PI*2,true);g.clip();el(g,mx,my,mr,mr,'#F4F2E2');g.restore();g.globalAlpha=1}
  const sunX=X+W*.66,sunY=Y+H*(.16+.4*k),sr=Math.min(W,H)*.05;
  if(k<.95){const gl=g.createRadialGradient(sunX,sunY,0,sunX,sunY,sr*7);gl.addColorStop(0,`rgba(255,232,200,${.8-.5*k})`);gl.addColorStop(1,'rgba(255,200,170,0)');g.fillStyle=gl;g.fillRect(X,Y,W,HZ-Y);
    g.save();g.beginPath();g.rect(X,Y,W,HZ-Y);g.clip();el(g,sunX,sunY,sr,sr,mix('#FFF8E6','#FF8A66',k));g.restore()}
  [[.15,.16,.3],[.48,.08,.24],[.8,.2,.28],[.33,.3,.18]].forEach(([cx,cy,cw],i)=>{const x0=X+((cx*W+tt*3*(1+i%2))%(W*1.3))-W*.15,y0=Y+cy*H,w0=cw*W;g.globalAlpha=.85;for(let j=0;j<6;j++)el(g,x0+(j-2.5)*w0*.15,y0-(j%2)*H*.01,w0*.15,H*.026,P.cloud);g.globalAlpha=1});
  /* 먼 산 두 겹(눈 덮인 봉우리) */
  const ridge=(base,amp,seed,col,cap)=>{const q=seedRand(seed),pts=[];for(let i=0;i<=12;i++){pts.push([X+W*i/12,base-amp*(.35+q()*.65)])}
    g.fillStyle=col;g.beginPath();g.moveTo(X,HZ+2);pts.forEach(([x,y],i)=>{if(i){const [px,py]=pts[i-1];g.lineTo((px+x)/2,Math.max(py,y)+amp*.12);g.lineTo(x,y)}else g.lineTo(x,y)});g.lineTo(X+W,HZ+2);g.closePath();g.fill();
    g.fillStyle=cap;pts.forEach(([x,y],i)=>{if(!i)return;const h=amp*.32;g.beginPath();g.moveTo(x-W/12*.28,y+h);g.lineTo(x,y);g.lineTo(x+W/12*.3,y+h*.9);g.lineTo(x+W/12*.12,y+h*.62);g.lineTo(x-W/12*.06,y+h*.95);g.closePath();g.fill()})};
  ridge(HZ-H*.03,H*.16,11,dim('#A9B8CE'),dim('#F2F6FB'));ridge(HZ+H*.01,H*.1,23,dim('#8396B0'),dim('#E8EFF7'));
  {const q5=seedRand(71);for(let x=X-4;x<X+W+4;x+=W*.012+q5()*W*.01){const h=H*(.025+q5()*.03),by=HZ+H*.012;poly(g,[x-h*.32,by,x,by-h,x+h*.32,by],dim(q5()<.5?'#5E7488':'#6A8296'));poly(g,[x-h*.12,by-h*.62,x,by-h,x+h*.12,by-h*.62],dim('#EEF4FA'))}}
  /* 건너편 마을(눈 지붕 · 저녁 불빛 · 작은 트리) */
  const vy=HZ+H*.035;g.fillStyle=dim('#E6EDF4');g.fillRect(X,HZ,W,H*.05);
  const q=seedRand(31);for(let i=0;i<11;i++){const hx=X+W*(.1+i*.075)+q()*W*.02,hw=W*(.028+q()*.015),hh=H*(.03+q()*.02),c=['#C9A88E','#B8C4D8','#D8B8B0','#A8B898'][i%4];
    g.fillStyle=dim(c);g.fillRect(hx,vy-hh,hw,hh);poly(g,[hx-hw*.12,vy-hh,hx+hw/2,vy-hh-hh*.6,hx+hw*1.12,vy-hh],dim('#F7FAFD'));
    if(L>0){g.fillStyle=`rgba(255,214,140,${.85*L})`;g.fillRect(hx+hw*.2,vy-hh*.62,hw*.22,hh*.3);g.fillRect(hx+hw*.6,vy-hh*.62,hw*.22,hh*.3);const lg=g.createRadialGradient(hx+hw/2,vy-hh/2,0,hx+hw/2,vy-hh/2,hw*1.4);lg.addColorStop(0,`rgba(255,200,120,${.22*L})`);lg.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=lg;g.fillRect(hx-hw,vy-hh*2,hw*3,hh*3)}}
  if(XMAS){const tx=X+W*.47,th=H*.07;poly(g,[tx-th*.35,vy,tx,vy-th,tx+th*.35,vy],dim('#2C5A40'));for(let i=0;i<9;i++){const u=i/8,yy=vy-th*.12-u*th*.75,ww=th*.3*(1-u*.8),xx=tx+Math.sin(i*2.3)*ww;const tw=(Math.sin(tt*2.4+i*1.7)+1)/2;g.globalAlpha=.5+.5*tw;el(g,xx,yy,1.3,1.3,XBC[i%5]);g.globalAlpha=1}
    starPath(g,tx,vy-th-2,3.4,1.4,0);g.fillStyle='#F7D046';g.fill()}
  /* 얼어붙은 강 */
  const RY0=HZ+H*.05,RY1=Y+H*.72;const ig=g.createLinearGradient(0,RY0,0,RY1);ig.addColorStop(0,mix(P.hor,'#DDE9F3',.5));ig.addColorStop(1,mix(P.top,'#AFC6DA',.55));g.fillStyle=ig;g.fillRect(X,RY0,W,RY1-RY0);
  g.globalAlpha=.5;for(let i=0;i<9;i++){const yy=RY0+(RY1-RY0)*(.15+i*.09),xx=X+W*((i*.37)%1);g.fillStyle='#FFFFFF';g.fillRect(xx,yy,W*(.06+(i%3)*.03),1)}g.globalAlpha=1;
  g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=.8;for(let i=0;i<5;i++){const x0=X+W*(.1+i*.2),y0=RY0+(RY1-RY0)*(.3+(i%2)*.3);g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+W*.03,y0+H*.01);g.lineTo(x0+W*.05,y0+H*.004);g.stroke()}
  if(k<.95&&sunY<HZ+sr){for(let i=0;i<12;i++){const yy=RY0+3+i*(H*.014),ww=W*(.02+.005*i);g.globalAlpha=Math.max(0,.55-i*.04);g.fillStyle=mix('#FFE9C0','#FF9A7A',k);g.fillRect(sunX-ww/2+Math.sin(tt+i)*2,yy,ww,1.3);g.globalAlpha=1}}
  /* 밤: 얼음 위에 비친 마을 불빛 · 강가 눈 덮인 바위 */
  if(L>0){const q3=seedRand(31);for(let i=0;i<11;i++){const hx=X+W*(.1+i*.075)+q3()*W*.02,hw=W*(.028+q3()*.015);q3();q3();const rg=g.createLinearGradient(0,RY0,0,RY0+H*.09);rg.addColorStop(0,`rgba(255,210,140,${.32*L})`);rg.addColorStop(1,'rgba(255,210,140,0)');g.fillStyle=rg;g.fillRect(hx+hw*.25,RY0,hw*.5,H*.09)}}
  {const q4=seedRand(57);for(let i=0;i<9;i++){const rx=X+W*(.04+i*.115+q4()*.04),ry=RY1-H*.005,rw=W*(.018+q4()*.02),rh=H*(.012+q4()*.01);el(g,rx,ry,rw,rh,dim('#8E97A6'));el(g,rx-rw*.1,ry-rh*.55,rw*.92,rh*.6,dim('#F7FAFD'))}}
  /* 강 건너 눈 덮인 숲 */
  /* 가까운 눈 언덕 · 울타리 · 눈 쌓인 소나무 */
  const PY=Y+H*.74;const sg2=g.createLinearGradient(0,PY-H*.05,0,Y+H);sg2.addColorStop(0,dim('#F4F8FC'));sg2.addColorStop(1,dim('#D6E2EE'));g.fillStyle=sg2;g.beginPath();g.moveTo(X,Y+H);g.lineTo(X,PY+H*.03);g.quadraticCurveTo(X+W*.5,PY-H*.04,X+W,PY+H*.04);g.lineTo(X+W,Y+H);g.closePath();g.fill();
  const fc=dim('#7A5A44');for(let x=X+W*.02;x<X+W;x+=W/22){const yy=PY+H*.02+Math.pow((x-X-W*.5)/(W*.5),2)*H*.02;g.fillStyle=fc;g.fillRect(x,yy,W*.007,H*.075);el(g,x+W*.0035,yy,W*.007,H*.006,'#FBFCFF')}
  g.fillStyle=fc;g.fillRect(X,PY+H*.045,W,H*.008);g.fillStyle='#FBFCFF';g.fillRect(X,PY+H*.041,W,H*.005);
  const pine=(px,py,hgt,lights)=>{g.fillStyle=dim('#5A4434');g.fillRect(px-hgt*.04,py-hgt*.12,hgt*.08,hgt*.14);for(let i=0;i<5;i++){const yb=py-hgt*.1-i*hgt*.17,w=hgt*(.36-i*.06);poly(g,[px-w,yb,px,yb-hgt*.28,px+w,yb],dim(i%2?'#2E5E44':'#376B4E'));poly(g,[px,yb-hgt*.28,px+w*.5,yb-hgt*.13,px+w*.1,yb-hgt*.1,px-w*.25,yb-hgt*.14,px-w*.6,yb-hgt*.08],dim('#F4F8FC'));el(g,px-w*.8,yb-hgt*.01,w*.18,hgt*.012,dim('#F4F8FC'))}
    if(lights){for(let i=0;i<14;i++){const u=(i*.618)%1,yy=py-hgt*(.12+u*.75),ww=hgt*.32*(1-u*.85),xx=px+Math.sin(i*2.1)*ww;const tw=(Math.sin(tt*2.2+i*1.3)+1)/2;el(g,xx,yy,hgt*.012,hgt*.012,XBC[i%5]);g.globalAlpha=(.25+.45*tw)*(.4+.6*L);const gr=g.createRadialGradient(xx,yy,0,xx,yy,hgt*.05);gr.addColorStop(0,hexA(XBC[i%5],.9));gr.addColorStop(1,hexA(XBC[i%5],0));g.fillStyle=gr;g.fillRect(xx-hgt*.05,yy-hgt*.05,hgt*.1,hgt*.1);g.globalAlpha=1}}};
  pine(X+W*.07,Y+H*.92,H*.42,XMAS);pine(X+W*.95,Y+H*.9,H*.36,false);pine(X+W*.2,Y+H*.84,H*.16,false);
  /* 자작나무 · 가로등 · 발자국 · 눈 반짝임 */
  const birch=(bx,by,h,lean)=>{g.lineCap='round';g.strokeStyle=dim('#8E8780');g.lineWidth=h*.045;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+lean*h,by-h);g.stroke();g.strokeStyle=dim('#F2EEE6');g.lineWidth=h*.032;g.stroke();for(let k=0;k<6;k++){const t=.12+k*.14;g.fillStyle=dim('#4A4446');g.fillRect(bx+lean*h*t-h*.016,by-h*t,h*.022,h*.007)}
    for(let k=0;k<5;k++){const t=.45+k*.11,sx2=bx+lean*h*t,sy2=by-h*t,d=k%2?1:-1;g.strokeStyle=dim('#B9B0A8');g.lineWidth=h*.008;g.beginPath();g.moveTo(sx2,sy2);g.quadraticCurveTo(sx2+d*h*.08,sy2-h*.04,sx2+d*h*.16,sy2-h*.12);g.stroke();el(g,sx2+d*h*.1,sy2-h*.07,h*.03,h*.008,dim('#FBFCFF'))}};
  birch(X+W*.26,Y+H*.8,H*.3,.04);birch(X+W*.29,Y+H*.79,H*.24,-.03);birch(X+W*.79,Y+H*.79,H*.26,.03);
  {const lx=X+W*.86,ly=Y+H*.95,lh=H*.3;if(L>0){const lg=g.createRadialGradient(lx,ly-lh,0,lx,ly-lh,lh*.7);lg.addColorStop(0,`rgba(255,214,150,${.5*L})`);lg.addColorStop(1,'rgba(255,214,150,0)');g.fillStyle=lg;g.fillRect(lx-lh*.7,ly-lh*1.7,lh*1.4,lh*1.4)}
    g.fillStyle=dim('#3E4448');g.fillRect(lx-lh*.018,ly-lh,lh*.036,lh);rr(g,lx-lh*.07,ly-lh*1.12,lh*.14,lh*.13,lh*.02,dim('#3E4448'));rr(g,lx-lh*.05,ly-lh*1.1,lh*.1,lh*.09,lh*.015,mix('#FFF4D6','#FFD98A',L));el(g,lx,ly-lh*1.13,lh*.09,lh*.025,'#FBFCFF');
    if(XMAS)wreathV(g,lx,ly-lh*.55,lh*.045)}
  g.globalAlpha=.35;for(let k=0;k<9;k++){const t=k/8,fx=X+W*(.5+.38*t)+((k%2)?W*.008:-W*.008),fy=Y+H*(.99-.12*t);el(g,fx,fy,W*.005,H*.004,'#9AAAC4')}g.globalAlpha=1;
  {const q6=seedRand(88);for(let i=0;i<34;i++){const sx=X+q6()*W,sy=Y+H*(.78+q6()*.2),tw=Math.max(0,Math.sin(tt*(1.2+q6()*2)+i*2.1));if(tw<.55)continue;const r=H*.004*tw;g.globalAlpha=(tw-.5)*1.8;g.fillStyle=night>0?'#DCE8FF':'#FFFFFF';g.fillRect(sx-r*2.2,sy-r*.25,r*4.4,r*.5);g.fillRect(sx-r*.25,sy-r*2.2,r*.5,r*4.4);g.globalAlpha=1}}
  /* 맑은 날 낮: 햇빛에 반짝이는 공기 속 얼음 알갱이 · 밤: 가끔 별똥별 */
  if(amt0===0&&k<.6){const q7=seedRand(91);for(let i=0;i<16;i++){const sx=X+q7()*W,sy=Y+H*(.25+q7()*.45),tw=Math.max(0,Math.sin(tt*(1.5+q7()*2)+i));if(tw>.7){g.globalAlpha=(tw-.7)*3;el(g,sx,sy,H*.0025,H*.0025,'#FFFFFF');g.globalAlpha=1}}}
  if(night>.5){const cyc=tt%13;if(cyc<1.1){const u=cyc/1.1,sx=X+W*(.2+(Math.floor(tt/13)%3)*.22)+u*W*.18,sy=Y+H*(.08+u*.12);g.strokeStyle=`rgba(255,255,255,${(1-u)*.9})`;g.lineWidth=1.4;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx-W*.05,sy-H*.033);g.stroke()}}
  /* 함박눈 */
  const amt=amt0;if(amt>0){const n=Math.round(70*amt);for(let i=0;i<n;i++){const h1=xHash(i,3,7),h2=xHash(7,i,3),big=h2<.3,sp=(big?.09:.05)*H,yy=(h1*H+tt*sp)%H,xx=X+((h2*W+Math.sin(tt*.7+i)*W*.02)%W+W)%W;g.globalAlpha=big?.95:.75;el(g,xx,Y+yy,big?H*.006:H*.0035,big?H*.006:H*.0035,'#FFFFFF')}g.globalAlpha=1}
  /* 벤치 · 우리 둘(뒷모습) */
  const sc=H/150;
  who.forEach((c,i)=>{const cx=X+W*(who.length>1?(i?.535:.465):.5);g.save();g.translate(cx,Y+H*.9);g.scale(sc*2.1,sc*2.1);drawChar(g,0,0,palOf(c),Math.PI,0,false,false,false,true);g.restore();
});
  rr(g,X+W*.39,Y+H*.8,W*.22,H*.05,3,'#7A5540');rr(g,X+W*.39,Y+H*.795,W*.22,H*.014,2,'#8C6448');el(g,X+W*.395,Y+H*.797,W*.012,H*.008,'#FBFCFF');el(g,X+W*.605,Y+H*.797,W*.012,H*.008,'#FBFCFF');
  g.fillStyle='#5A3E2E';g.fillRect(X+W*.4,Y+H*.85,W*.012,H*.08);g.fillRect(X+W*.588,Y+H*.85,W*.012,H*.08);
  g.fillStyle='rgba(255,255,255,.8)';g.font=`${Math.max(11,H*.035)}px 'Jua','Gowun Dodum',sans-serif`;g.textAlign='center';g.fillText('행동 버튼을 누르면 일어나요',X+W/2,Y+H*.06);
}
if(WINTER){drawSunsetScene=drawWinterScene}
/* 캠퍼스 땅 조각도 그릴 때 바로 눈 덮인 색으로 바꿔요(조각마다 한 번, 추가 메모리 없음) */
if(WINTER&&typeof AREA_CHUNK!=='undefined'&&AREA_CHUNK.campus){const _cg=AREA_CHUNK.campus;AREA_CHUNK.campus=function(g,X0,Y0,W,H){withSnowColors(()=>_cg(g,X0,Y0,W,H))}}

/* =====================================================================
   17. 겨울 꽃시장: 프리지아·수국은 쉬어요(가판대 빠짐). 튤립·안개꽃·장미 세 가판대를 가운데로 고르게.
       남은 프리지아·수국 재고는 그대로 두고, 재고가 있을 때만 그 꽃이 들어간 주문이 가끔 와서 자연스럽게 팔려요.
   ===================================================================== */
if(WINTER){
  const D=id=>STATION_DEFS.find(d=>d[0]===id);
  ['st_freesia','st_hydrangea'].forEach(id=>{const d=D(id);if(d)d[7]='$nowinter'});
  [['st_tulip',4],['st_gyp',10],['st_rose',16]].forEach(([id,x])=>{const d=D(id);if(d)d[3]=x});
}
function stockOf(t){let n=0;const scan=it=>{if(it&&it.stems&&it.kind!=='bouquet')it.stems.forEach(s=>{if(s.t===t&&!s.dried&&wither(s.f)<.6)n++})};
  (S.bags||[]).forEach(b=>(b||[]).forEach(scan));(S.stList||[]).forEach(s=>(s.slots||[]).forEach(scan));return n}
if(WINTER){
  const _tp=tplPool;tplPool=function(){const base=_tp();
    const extra=TEMPLATES.filter(t=>!base.includes(t)&&!/여름|해바라기|봄/.test(t.title+t.text)&&Object.entries(t.req).every(([k,v])=>flOpen(k)||((OFF_SEASON.winter[k])&&stockOf(k)>=v)));
    return extra.length&&Math.random()<.6?base.concat(extra):base};
  /* 이야기 특별 주문처럼 쉬는 꽃이 들어간 주문은, 재고가 모자라면 겨울 꽃으로 바꿔서 받아요 */
  const _go=genOrder;genOrder=function(tpl,time,day){const o=_go(tpl,time,day),ch=[];
    for(const [k,to] of [['freesia','tulip'],['hydrangea','gyp']]){const v=o.req[k];if(!v||stockOf(k)>=v)continue;o.req[to]=(o.req[to]||0)+v;delete o.req[k];ch.push(`${FL[k].name} 대신 ${FL[to].name}`)}
    if(ch.length)o.text=(o.text||'')+` (겨울이라 ${ch.join(', ')}(으)로 부탁해요)`;return o};
}

/* =====================================================================
   18. 마을 크리스마스 장식 더하기 (40차)
   · 시계탑: 시계 둘레 리스 · 지붕 눈과 금별 · 기둥을 감은 가랜드 · 작은 전구
   · 집 지붕선 전구 · 창가 촛불
   · 가로등 사이 전구 줄(길 위로 늘어진 줄 전구)
   · 길가 화분 전나무 · 북쪽 길 입구에 '크리스마스 마켓' 아치
   ===================================================================== */
function clockXmas(g,d){const x=d.x*TILE,w=d.w*TILE,cx=x+w/2,by=(d.y+d.h)*TILE,fy=by-81;
  poly(g,[cx-16.5,by-94,cx,by-112.5,cx+16.5,by-94,cx+14,by-93,cx,by-108.5,cx-14,by-93],'#FBFCFF');
  starPath(g,cx,by-117,4.2,1.8,0);g.fillStyle='#F2C230';g.fill();g.strokeStyle='#D8A020';g.lineWidth=.5;g.stroke();
  for(let k=0;k<20;k++){const a=k/20*Math.PI*2;el(g,cx+Math.cos(a)*12,fy+Math.sin(a)*12,2.3,1.5,k%2?'#3F7D55':'#2F6B48',a+1.2)}
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.3;el(g,cx+Math.cos(a)*12,fy+Math.sin(a)*12,.9,.9,'#D8343F')}
  bowV(g,cx,fy+12.5,'#C8303E');
  for(let k=0;k<3;k++){const y0=by-66+k*17;g.strokeStyle='#2D5A3D';g.lineWidth=2.4;g.beginPath();g.moveTo(cx-10,y0);g.quadraticCurveTo(cx,y0+6,cx+10,y0+2);g.stroke();for(let j=0;j<=6;j++){const t=j/6;el(g,cx-10+20*t,y0+t*2+4*t*(1-t)*2,1.4,.9,j%2?'#3F7D55':'#4E9165',j)}}
  rr(g,cx-14,by-11,28,2.4,1,'#FBFCFF');clockBulbs(d).forEach(([bx,by2],k)=>el(g,bx,by2,.7,.85,XBC[k%5]))}
function clockBulbs(d){const x=d.x*TILE,w=d.w*TILE,cx=x+w/2,by=(d.y+d.h)*TILE,L=[];
  for(let k=0;k<=8;k++){const t=k/8;L.push([cx-15+t*15,by-94-t*16]);L.push([cx+15-t*15,by-94-t*16])}
  for(let k=0;k<3;k++){const y0=by-66+k*17;for(let j=1;j<6;j+=2){const t=j/6;L.push([cx-10+20*t,y0+t*2+4*t*(1-t)*2+1.6])}}return L}
/* 가로등 사이 줄 전구 */
const XSTR_ROWS=[[12,[5,15,23]],[12,[37,46,55]],[24,[37,44,54]]];
function lampHead(x,y){return [x*TILE+8,y*TILE-25]}
function strPts(x0,x1,y,n){const [ax,ay]=lampHead(x0,y),[bx]=lampHead(x1,y),P=[];for(let k=1;k<n;k++){const t=k/n;P.push([ax+(bx-ax)*t,ay+Math.sin(t*Math.PI)*9])}return P}
DECOR_DRAW.xstring=(g,d)=>{const [ax,ay]=lampHead(d.a,d.y),[bx]=lampHead(d.b,d.y);g.strokeStyle='#2E3A30';g.lineWidth=.45;g.beginPath();g.moveTo(ax,ay);g.quadraticCurveTo((ax+bx)/2,ay+18,bx,ay);g.stroke();
  strPts(d.a,d.b,d.y,d.n).forEach(([x,y],k)=>{ln(g,x,y-1.2,x,y-.2,'#2E3A30',.3);el(g,x,y+.5,.75,.95,XBC[k%5])})};
PR_DEB.xstring=d=>[0,-34,0,0];
/* 길가 화분 전나무 · 사탕 지팡이 · 마켓 아치 */
DECOR_DRAW.xfirpot=(g,d,x,y)=>{shadow(g,x+8,y+15,7,1.8);rr(g,x+2,y+6,12,9,1.5,'#B8574A');rr(g,x+1.5,y+5,13,2.4,1,'#C96A5C');rr(g,x+2,y+9,12,1.4,.5,'#E8C450');
  [[0,8],[6,6.6],[11,5],[15,3.4]].forEach(([dy,wd],k)=>{poly(g,[x+8-wd,y+5-dy,x+8,y-6-dy,x+8+wd,y+5-dy],k%2?'#2F6B48':'#3A7A52');poly(g,[x+8,y-6-dy,x+8-wd*.5,y+1-dy,x+8+wd*.2,y-.4-dy],'#FBFCFF')});
  starPath(g,x+8,y-22,2.4,1,0);g.fillStyle='#F2C230';g.fill();bowV(g,x+8,y+9.5,'#C8303E')};
PR_DEB.xfirpot=[0,-26,0,1];
DECOR_DRAW.xcane=(g,d,x,y)=>{const cx=x+8;shadow(g,cx,y+15,3,1);g.save();g.lineCap='round';g.strokeStyle='#FFFFFF';g.lineWidth=2.6;g.beginPath();g.moveTo(cx+2,y+14);g.lineTo(cx+2,y-14);g.arc(cx-1.5,y-14,3.5,0,Math.PI,true);g.stroke();g.setLineDash([2.2,2.2]);g.strokeStyle='#D32F3E';g.stroke();g.restore();bowV(g,cx+2,y-8,'#3F7D55')};
PR_DEB.xcane=[0,-22,0,1];
DECOR_DRAW.xarch=(g,d,x,y,w)=>{const L=x+3,R=x+w-3;[L,R].forEach(px=>{rr(g,px-1.6,y-30,3.2,45,1,'#8C6448');g.save();g.strokeStyle='#C8303E';g.lineWidth=1.2;for(let k=0;k<9;k++){g.beginPath();g.moveTo(px-1.6,y-28+k*5);g.lineTo(px+1.6,y-25+k*5);g.stroke()}g.restore()});
  g.strokeStyle='#2D5A3D';g.lineWidth=3;g.beginPath();g.moveTo(L,y-30);g.quadraticCurveTo((L+R)/2,y-44,R,y-30);g.stroke();for(let k=0;k<=14;k++){const t=k/14,xx=L+(R-L)*t,yy=y-30-Math.sin(t*Math.PI)*10.5;el(g,xx,yy,1.6,1,k%2?'#3F7D55':'#4E9165',k)}
  rr(g,(L+R)/2-17,y-46,34,9,2,'#C8303E');rr(g,(L+R)/2-16,y-45,32,7,1.6,'#FFF8EE');g.fillStyle='#C8303E';g.font="4.4px 'Jua',sans-serif";g.textAlign='center';g.textBaseline='middle';g.fillText('크리스마스 마켓 ↑',(L+R)/2,y-41.3);
  bowV(g,L,y-30,'#C8303E');bowV(g,R,y-30,'#C8303E');archBulbs(d).forEach(([bx,by],k)=>el(g,bx,by,.75,.9,XBC[k%5]));starPath(g,(L+R)/2,y-49,2.6,1.1,0);g.fillStyle='#F2C230';g.fill()};
PR_DEB.xarch=[0,-52,0,1];
function archBulbs(d){const L=d.x*TILE+3,R=(d.x+d.w)*TILE-3,y=d.y*TILE,P=[];for(let k=1;k<14;k+=2){const t=k/14;P.push([L+(R-L)*t,y-30-Math.sin(t*Math.PI)*10.5+1.8])}return P}
/* 집 창가 촛불 */
function roofBulbs(f){if(f.t!=='house'&&f.t!=='salonFront'&&f.t!=='marketFront')return [];const x=f.x*TILE,w=f.w*TILE,o=f.t==='marketFront'?[x-4,20,x+w+4,-4]:[x-2,12.5,x+w+2,-2.5],n=Math.max(4,Math.round(w/7)),P=[];
  for(let k=1;k<n;k++){const t=k/n;P.push([o[0]+(o[2]-o[0])*t,(t<.5?o[1]+(o[3]-o[1])*t*2:o[3]+(o[1]-o[3])*(t-.5)*2)+1.6])}return P}
function houseCandles(g,f){const x=f.x*TILE,w=f.w*TILE;if(f.t!=='house'||w<48)return;[[x+15,44],[x+w-15,44]].forEach(([cx,cy])=>{rr(g,cx-1,cy-4,2,4,.4,'#F4EEDC');el(g,cx,cy-5,.8,1.3,'#FFC94A');el(g,cx,cy-5.2,.35,.6,'#FFF4C2')})}
if(XM_ON){
  DECOR_BASE.town.push(
    ...XSTR_ROWS.flatMap(([y,L])=>L.slice(0,-1).map((a,k)=>({t:'xstring',a,b:L[k+1],n:Math.round((L[k+1]-a)*1.4),x:a,y,w:L[k+1]-a+1,h:1,walk:true,flat:false}))),
    {t:'xfirpot',x:10,y:12,w:1,h:1},{t:'xfirpot',x:19,y:12,w:1,h:1},{t:'xfirpot',x:41,y:12,w:1,h:1},{t:'xfirpot',x:51,y:12,w:1,h:1},
    {t:'xcane',x:13,y:6,w:1,h:1,walk:true},{t:'xcane',x:15,y:6,w:1,h:1,walk:true},
    {t:'xarch',x:24,y:3,w:3,h:1,walk:true},{t:'xarch',x:34,y:3,w:3,h:1,walk:true});
  for(let k=DECOR_BASE.town.length-1;k>=0;k--){const d=DECOR_BASE.town[k];if(d.t==='lamp'&&d.y===2&&(d.x===24||d.x===36))DECOR_BASE.town.splice(k,1)} /* 북쪽 길 입구 가로등 자리에 마켓 아치 */
  {const _dd2=drawDecor;drawDecor=function(g,d){_dd2(g,d);if(d.t==='clocktower')clockXmas(g,d)}}
  {const _fw=facadeWinter;facadeWinter=function(g,f){_fw(g,f);houseCandles(g,f);roofBulbs(f).forEach(([bx,by],k)=>el(g,bx,by,.7,.85,XBC[k%5]))}}
  XB_HOOKS.push((area,add)=>{if(area!=='town')return;
    DECOR.town.forEach(d=>{const dep=(d.y+d.h)*TILE-1;
      if(d.t==='clocktower')clockBulbs(d).forEach(([x,y])=>add(x,y,dep+.5,2));
      else if(d.t==='xstring')strPts(d.a,d.b,d.y,d.n).forEach(([x,y])=>add(x,y+.5,dep+.5,1.6));
      else if(d.t==='xarch')archBulbs(d).forEach(([x,y])=>add(x,y,dep+.5,2.4))});
    FACADES.forEach(f=>roofBulbs(f).forEach(([px,py])=>add(px,py,97.6,1.8)))});
}
