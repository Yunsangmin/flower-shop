'use strict';
/* 우리 둘의 꽃집 — game-13-hair.js : 주인공 머리 v3 (미용실 머리 전부)
   · 머리칼을 한 덩어리 윤곽(정수리~앞머리~옆머리)으로 그리고, 그 안에 결(직모/웨이브/컬)을 넣어요
   · 귀는 얼굴과 같은 살색, 구레나룻은 위가 두껍고 아래로 가늘게
   · 그림 수는 그대로(캐릭터마다 한 장)라 메모리는 늘지 않아요
   · 스타일 설계는 아래 H3SPEC 표, 그리는 함수는 hair2* 를 감싸서 끼워 넣어요 */

/* ---------- 색 ---------- */
function h3Cols(g,p){const b=p.hair;const gr=g.createLinearGradient(0,-134,0,-40);gr.addColorStop(0,mix(b,'#FFFFFF',.22));gr.addColorStop(.28,b);gr.addColorStop(1,mix(b,'#000000',.22));
  return {H:gr,B:b,D:mix(b,'#000000',.32),D2:mix(b,'#000000',.16),L:mix(b,'#FFFFFF',.38),T:'#E07A7A'}}

/* ---------- 선 도구 ---------- */
/* 머리칼 끝들을 둥글게 잇기(가로 방향) */
function tipsTo(g,T,gap,round){for(let k=0;k<T.length;k++){const [x,y]=T[k];if(!k){g.lineTo(x,y);continue}const [px,py]=T[k-1],mx=(px+x)/2,my=Math.min(py,y)-gap;
  if(round){g.quadraticCurveTo(px+(mx-px)*.15,py+1.2,mx,my);g.quadraticCurveTo(x-(x-mx)*.15,y+1.2,x,y)}else g.quadraticCurveTo(mx,my,x,y)}}
/* 물결 테두리: (x0,y0)→(x1,y1) 를 n번 볼록하게(out=볼록한 쪽 ±1) */
function wavyTo(g,x0,y0,x1,y1,n,amp,out){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*out,ny=dx/L*out;for(let k=1;k<=n;k++){const tm=(k-.5)/n,t1=k/n,a=amp*(k%2?1:.55);g.quadraticCurveTo(x0+dx*tm+nx*a*2,y0+dy*tm+ny*a*2,x0+dx*t1,y0+dy*t1)}}
/* 층(레이어) 테두리: 세로로 내려가며 살짝 들쭉날쭉 */
function layerTo(g,x0,y0,x1,y1,n,dep,side){for(let k=1;k<=n;k++){const t=k/n,tm=(k-.6)/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t,xm=x0+(x1-x0)*tm+side*dep,ym=y0+(y1-y0)*tm;g.quadraticCurveTo(xm,ym+2,x,y)}}
/* 둥근 볼륨 테두리(컬) */
function arcWavy(g,cx,cy,rx,ry,a0,a1,n,amp){const P=a=>[cx+Math.cos(a)*rx,cy+Math.sin(a)*ry];for(let k=1;k<=n;k++){const am=a0+(a1-a0)*(k-.5)/n,a=a0+(a1-a0)*k/n,[mx,my]=P(am),[x,y]=P(a),f=1+amp*(k%2?1:.6)/Math.min(rx,ry);g.quadraticCurveTo(cx+(mx-cx)*f*1.06,cy+(my-cy)*f*1.06,x,y)}}
/* 세로 가장자리: 결에 따라 곧게/물결/컬/층 */
function edgeTo(g,x0,y0,x1,y1,tex,out){const L=Math.abs(y1-y0);
  if(tex==='wave')wavyTo(g,x0,y0,x1,y1,Math.max(2,Math.round(L/9)),1.4,out);
  else if(tex==='curl')wavyTo(g,x0,y0,x1,y1,Math.max(2,Math.round(L/5.5)),1.6,out);
  else if(tex==='layer')layerTo(g,x0,y0,x1,y1,Math.max(2,Math.round(L/10)),1.6*out*(y1>y0?1:-1),0);
  else g.bezierCurveTo(x0+(x1-x0)*.3+out*.6,y0+(y1-y0)*.33,x0+(x1-x0)*.7+out*.4,y0+(y1-y0)*.66,x1,y1)}
function strands(g,c,list,a){g.save();g.lineCap='round';for(let [x0,y0,x1,y1,b] of list){g.globalAlpha=a||.24;g.strokeStyle=c.D;g.lineWidth=.9;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2+(b||0),(y0+y1)/2,x1,y1);g.stroke()}g.restore()}
function shine(g,x,y,r,a0,a1){g.save();g.globalAlpha=.5;g.strokeStyle='#FFFFFF';g.lineWidth=2.2;g.lineCap='round';g.beginPath();g.arc(x,y,r,Math.PI*a0,Math.PI*a1);g.stroke();g.globalAlpha=.3;g.lineWidth=1.2;g.beginPath();g.arc(x+3,y,r,Math.PI*(a1+.06),Math.PI*(a1+.16));g.stroke();g.restore()}
function fillClip(g,fill,fn){g.fillStyle=fill;g.fill();g.save();g.clip();fn();g.restore()}
/* 직모 결 */
function straightLines(g,c,xs,y0,y1,bend,a){g.save();g.lineCap='round';xs.forEach((x,k)=>{const b=(bend||0)*(x/20);g.globalAlpha=(a||.3)*(k%3===1?.6:1);g.strokeStyle=c.D;g.lineWidth=.8;g.beginPath();g.moveTo(x*.75,y0);g.quadraticCurveTo(x+b,(y0+y1)/2,x*1.04,y1);g.stroke()});
  g.globalAlpha=.28;g.strokeStyle=c.L;g.lineWidth=1.1;xs.filter((_,k)=>k%2).forEach(x=>{g.beginPath();g.moveTo(x*.75+1.2,y0+6);g.quadraticCurveTo(x+1.4,(y0+y1)/2-8,x*1.04+1,(y0+y1)/2+6);g.stroke()});g.restore()}
/* 웨이브 결: 세로로 S자 */
function waveLines(g,c,xs,y0,y1,amp){g.save();g.lineCap='round';xs.forEach((x,k)=>{for(const [col,a,w,dx] of [[c.D,.3,.9,0],[c.L,.3,1.1,1.4]]){if(col===c.L&&k%2)continue;g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=w;g.beginPath();
  for(let y=y0;y<=y1;y+=1.5){const xx=x+dx+Math.sin((y-y0)/14*Math.PI*2+k)*(amp||1.8);y===y0?g.moveTo(xx,y):g.lineTo(xx,y)}g.stroke()}});g.restore()}
/* 곱슬 결: 스프링 컬 */
let H3RING=false;
function ringLines(g,c,x0,x1,y0,y1){if(H3RING)return ringletLines(g,c,x0,x1,y0,y1);g.save();g.lineCap='round';const st=5.8,r=2.2,dy=r*1.85;let k=0;
  for(let x=x0;x<=x1+.1;x+=st,k++){let j=0;for(let y=y0+(k%2)*dy*.5;y<=y1;y+=dy,j++){const sx=x+((j+k)%2?.9:-.9);
    g.globalAlpha=.38;g.strokeStyle=c.D;g.lineWidth=.95;g.beginPath();g.arc(sx,y,r,Math.PI*.15,Math.PI*1.05);g.stroke();
    g.globalAlpha=.34;g.strokeStyle=c.L;g.lineWidth=1.1;g.beginPath();g.arc(sx-.4,y-.5,r*.8,Math.PI*1.15,Math.PI*1.75);g.stroke()}}g.restore()}
/* 단발 펌: 한 올 한 올 꼬불꼬불한 세로 컬(코르크 나사처럼) */
function ringletLines(g,c,x0,x1,y0,y1){g.save();g.lineCap='round';let k=0;for(let x=x0;x<=x1+.1;x+=3.3,k++){const ph=k*1.7,per=5.6+(k%3)*.7;
  for(const [col,a,w,dx] of [[c.D,.45,1,0],[c.L,.42,1.1,1]]){if(col===c.L&&k%2)continue;g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=w;g.beginPath();
    for(let y=y0+(k%2)*2;y<=y1;y+=.8){const xx=x+dx+Math.sin((y-y0)/per*Math.PI*2+ph)*1.9;y===y0+(k%2)*2?g.moveTo(xx,y):g.lineTo(xx,y)}g.stroke()}}g.restore()}
/* 정수리 결: 가르마(px)에서 퍼지는 물결 */
function waveTop(g,c,px,y0,y1,n,amp){g.save();g.lineCap='round';for(let k=0;k<n;k++){const f=(k+.5)/n*2-1,x1=px+f*27;for(const [col,a,w,dx] of [[c.D,.3,.9,0],[c.L,.28,1.1,1.4]]){g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=w;g.beginPath();
  for(let t=0;t<=1.0001;t+=.05){const x=px+dx+(x1-px)*Math.sin(t*Math.PI/2)+Math.sin(t*Math.PI*3+k)*amp*t,y=y0+(y1-y0)*t;t?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}}g.restore()}
/* 정수리에서 앞머리로 흐르는 결(가르마 px) */
function topLines(g,c,px,tips,y0){g.save();g.lineCap='round';for(const [x,y] of tips){g.globalAlpha=.28;g.strokeStyle=c.D;g.lineWidth=.9;g.beginPath();g.moveTo(px+(x-px)*.35,y0);g.quadraticCurveTo(px+(x-px)*.9,(y0+y)/2,x,y-1);g.stroke()}
  g.globalAlpha=.26;g.strokeStyle=c.L;g.lineWidth=1.1;tips.forEach(([x,y],k)=>{if(k%2)return;g.beginPath();g.moveTo(px+(x-px)*.35+1.5,y0+2);g.quadraticCurveTo(px+(x-px)*.9+1.5,(y0+y)/2,x+1.4,(y0+y)/2+5);g.stroke()});g.restore()}

/* ---------- 스타일 표 ----------
   M: short(남자 짧은 머리) | long(얼굴 옆으로 내려오는 머리) | tied(묶은 머리)
   fr: 앞머리  sd: 남자 옆(ear 귀 보임 / under 짧게 친 투블럭)  yL: 뒷머리 끝  yF: 얼굴 옆 머리 끝  tex: str/wave/curl/layer/cc  v: 볼륨  x: 묶음 */
const H3SPEC={
  dandy:{M:'short',fr:'dandy',sd:'ear',v:2},
  comma:{M:'short',fr:'comma',sd:'ear',v:2},
  gareuma:{M:'short',fr:'part8',sd:'ear',tex:'wave',v:3},
  twoblock:{M:'short',fr:'side',sd:'under',v:4},
  leaf:{M:'short',fr:'curtainM',sd:'ear',v:3},
  ez:{M:'short',fr:'split',sd:'ear',tex:'cc',v:3},
  slick:{M:'short',fr:'none',sd:'under',v:4},
  crop:{M:'short',fr:'crop',sd:'under',v:1},
  shadow:{M:'short',fr:'shadow',sd:'ear',tex:'wave',v:4},
  hippiem:{M:'short',fr:'perm',sd:'ear',tex:'curl',v:5},
  natural:{M:'short',fr:'up',sd:'ear',v:4},
  mush:{M:'short',fr:'mush',sd:'ear',v:5},
  volpart:{M:'short',fr:'curtainM',sd:'ear',tex:'wave',v:5},
  seethru:{M:'long',fr:'see',yL:-46,yF:-50,v:2},
  layered:{M:'long',fr:'curtain',yL:-50,yF:-56,tex:'cc',v:2},
  hush:{M:'long',fr:'see',yL:-60,yF:-64,tex:'layer',v:3},
  bangbob:{M:'long',fr:'full',yL:-76,yF:-76,shape:'bob',ears:1,v:2},
  bobperm:{M:'long',fr:'curtain',yL:-64,yF:-66,tex:'curl',ringlet:1,v:5},
  build:{M:'long',fr:'side',yL:-48,yF:-52,tex:'wave',v:3},
  hippie:{M:'long',fr:'curtain',yL:-44,yF:-48,tex:'curl',v:5},
  swave:{M:'long',fr:'curtain',yL:-38,yF:-44,tex:'wave',v:2},
  braids:{M:'tied',fr:'full',x:'braids',v:1},
  sidepony:{M:'tied',fr:'curtain',x:'sidepony',v:2},
  pony:{M:'tied',fr:'see',x:'pony',v:2},
  bun:{M:'tied',fr:'see',x:'bun',v:1},
  buns:{M:'tied',fr:'full',x:'buns',v:1},
  halfup:{M:'long',fr:'curtain',yL:-48,yF:-54,x:'halfbun',v:2},
  hiponyw:{M:'tied',fr:'curtain',x:'hipony',v:3},
  hime:{M:'long',fr:'full',yL:-46,yF:-80,shape:'hime',v:1},
  wpony:{M:'tied',fr:'side',x:'wpony',v:2},
  superlong:{M:'long',fr:'see',yL:-22,yF:-30,v:3}
};

/* ---------- 남자 짧은 머리 ---------- */
/* 한 올 한 올 꼬불거리는 결(남자 펌) */
function h3CurlStrands(g,c,px,y0,y1,W){g.save();g.lineCap='round';for(let k=0;k<11;k++){const f=(k+.5)/11*2-1;for(const [col,a,w,dx] of [[c.D,.38,.9,0],[c.L,.34,1.1,1.1]]){if(col===c.L&&k%2)continue;g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=w;g.beginPath();
  for(let tt=0;tt<=1.0001;tt+=.04){const x=px+dx+f*W*Math.sin(tt*Math.PI/2)+Math.sin(tt*Math.PI*6+k*1.3)*1.5,y=y0+(y1-y0)*tt;tt?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}}g.restore()}
let F_COMMA=null;
/* 앞머리 선: (21.4,-106.4) 에서 시작해 (-21.4,-106.4) 로 끝나요. q=돌아본 만큼 이동 */
function h3MaleFringe(g,fr,q,tex){const Q=(x,y)=>[x+q,y];let px=q,tips=[];
  if(fr==='comma'){g.quadraticCurveTo(18+q,-111,10+q,-114);g.bezierCurveTo(2+q,-112,-6+q,-109.6,-12+q,-107.4);g.quadraticCurveTo(-17+q,-106.6,-21.4,-106.4);px=10+q;tips=[Q(4,-110.5),Q(-3,-108.6),Q(-9,-107.4),Q(16,-108)];F_COMMA=q}
  else if(fr==='part8'){g.quadraticCurveTo(19,-110,13+q,-112);g.lineTo(11+q,-114.4);g.bezierCurveTo(4+q,-115,-8+q,-112,-13.6+q,-106.8);g.quadraticCurveTo(-17.2+q,-104.6,-17.4+q,-102.2);
    g.quadraticCurveTo(-15.8+q,-101,-14.6+q,-102.8);g.quadraticCurveTo(-16+q,-103.4,-15.4+q,-104.6);g.quadraticCurveTo(-18.6+q,-106.8,-21.4,-106.4);px=11+q;tips=[Q(5,-112),Q(-2,-110),Q(-9,-107.5),Q(16,-109)]}
  else if(fr==='split'){g.quadraticCurveTo(15+q,-104.8,8+q,-108.6);g.quadraticCurveTo(3+q,-112,q,-115.4);g.quadraticCurveTo(-3+q,-112,-8+q,-108.6);g.quadraticCurveTo(-15+q,-104.8,-21.4,-106.4);
    tips=[Q(14,-106),Q(7,-109),Q(-7,-109),Q(-14,-106)];
    if(tex==='cc'){/* 앞머리 양 끝 C컬 */}}
  else if(fr==='side'){g.quadraticCurveTo(16+q,-112,8+q,-116);tipsTo(g,[Q(8,-116),Q(1.5,-110.6),Q(-5.5,-107.6),Q(-12.5,-106.2),Q(-18.6,-105.8),[-21.4,-106.4]],1.8,true);px=8+q;tips=[Q(1.5,-110.6),Q(-5.5,-107.6),Q(-12.5,-106.2),Q(-18.6,-105.8),Q(14,-110)]}
  else if(fr==='up'){/* 앞머리를 살짝 들어 올린 업스타일 */g.quadraticCurveTo(18.6+q,-110.6,11+q,-113.2);g.bezierCurveTo(4+q,-116,-6+q,-115.2,-12+q,-112);g.quadraticCurveTo(-18.4+q,-108.8,-21.4,-106.4);px=6+q;tips=[Q(14,-111),Q(6,-113.6),Q(-2,-114),Q(-9,-112.6),Q(-15,-109.6)]}
  else if(fr==='shadow'){/* 결이 살아 있는 웨이브 앞머리(끝 높이가 조금씩 다름) */const T=[[21.4,-106.4],Q(15.4,-104.4),Q(9.4,-106),Q(3.4,-104.2),Q(-2.6,-105.8),Q(-8.6,-104),Q(-14.6,-105.4),[-21.4,-106.4]];tipsTo(g,T,2.4,true);tips=T.slice(1,-1)}
  else if(fr==='curtainM'){/* 가운데 가르마, 양옆으로 커튼처럼 내려오는 앞머리 */g.quadraticCurveTo(17+q,-103.6,9.4+q,-108.6);g.quadraticCurveTo(3+q,-112.8,.6+q,-116.4);g.lineTo(-.6+q,-116.4);g.quadraticCurveTo(-3+q,-112.8,-9.4+q,-108.6);g.quadraticCurveTo(-17+q,-103.6,-21.4,-106.4);tips=[Q(15,-105),Q(8,-109.6),Q(-8,-109.6),Q(-15,-105)]}
  else if(fr==='perm'){/* 곱슬 펌: 동글동글 말린 끝 */const T=[[21.4,-106.4],Q(16,-103.6),Q(10.6,-105.2),Q(5.2,-103.2),Q(-.2,-104.8),Q(-5.6,-103),Q(-11,-104.8),Q(-16.2,-103.4),[-21.4,-106.4]];tipsTo(g,T,3,true);tips=T.slice(1,-1)}
  else if(fr==='none'){g.quadraticCurveTo(19,-113,8+q,-116.6);g.quadraticCurveTo(q,-118.6,-8+q,-116.6);g.quadraticCurveTo(-19,-113,-21.4,-106.4);tips=[]}
  else if(fr==='crop'){tipsTo(g,[[21.4,-106.4],Q(15,-108.4),Q(8,-108.8),Q(1,-108.9),Q(-6,-108.8),Q(-13,-108.4),[-21.4,-106.4]],1,true);tips=[Q(15,-108.4),Q(8,-108.8),Q(1,-108.9),Q(-6,-108.8),Q(-13,-108.4)]}
  else if(fr==='mush'){const T=[[21.6,-105],Q(14.4,-104.6),Q(7.2,-104.4),Q(0,-104.4),Q(-7.2,-104.4),Q(-14.4,-104.6),[-21.6,-105]];tipsTo(g,T,1.1,true);tips=T.slice(1,-1)}
  else{const T=[[21.4,-106.4],Q(14.2,-105.6),Q(7,-105.2),Q(0,-105.2),Q(-7,-105.2),Q(-14.2,-105.6),[-21.4,-106.4]];tipsTo(g,T,1.5,true);tips=T.slice(1,-1)}
  return {px,tips}}
function h3MaleFront(g,p,c,S,o){const q=o*.6,t=o/5,SK=skinGrad(g,p),v=S.v||0;
  const E=[[-1,-23.4+5*t,1],[1,23.4-4*t,1-.5*t]];
  for(const [s,X,f] of E){if(s>0&&t>.35)continue;el(g,X+s*.4,-95.6,3.7*f,5.4,SK)}
  /* 구레나룻: 위가 두껍고 아래로 가늘게, 얼굴선을 따라 */
  const yb=S.sd==='under'?-95.5:-89.4,bc=S.sd==='under'?mix(p.hair,p.skin,.28):c.B;
  for(const [s,X] of E){if(s>0&&t>.35)continue;/* 위는 넓고, 얼굴선을 따라 서서히 가늘어지며 끝은 머리칼 한두 올 */
    g.beginPath();g.moveTo(X+s*1.6,-111);g.quadraticCurveTo(X-s*2,-111.4,X-s*4.9,-108.6);g.bezierCurveTo(X-s*5,-102,X-s*3.9,yb+(-95-yb)*.6,X-s*2.4,yb+.6);
    g.quadraticCurveTo(X-s*1.9,yb+1.2,X-s*1.5,yb);g.bezierCurveTo(X-s*.9,-94,X+s*.5,-99.6,X+s*1.3,-104.4);g.lineTo(X+s*1.6,-111);g.closePath();g.fillStyle=S.sd==='under'?bc:c.H;g.fill();
    if(S.sd!=='under'){g.save();g.lineCap='round';g.strokeStyle=c.B;g.lineWidth=.7;g.globalAlpha=.85;g.beginPath();g.moveTo(X-s*3.4,yb-3);g.quadraticCurveTo(X-s*3,yb+1,X-s*2.8,yb+2.6);g.stroke();g.globalAlpha=.3;g.strokeStyle=c.D;g.lineWidth=.8;g.beginPath();g.moveTo(X-s*1.6,-107);g.quadraticCurveTo(X-s*2.8,-100,X-s*2.3,yb);g.stroke();g.restore()}}
  /* 정수리 + 앞머리 한 덩어리 */
  const top=-133-v*.7,cw=24.4+v*.12;
  g.beginPath();g.moveTo(-cw,-104);if(S.tex==='curl'){g.lineTo(-cw-1.4,-108);arcWavy(g,0,-106,cw+2,-top-106+2,Math.PI*1.06,Math.PI*1.94,10,1.4);g.lineTo(cw,-104)}else g.bezierCurveTo(-cw-4.2,top,cw+4.2,top,cw,-104);g.quadraticCurveTo(23.4,-106,21.4,-106.4);
  F_COMMA=null;const F=h3MaleFringe(g,S.fr,q,S.tex);g.quadraticCurveTo(-23.4,-106,-cw,-104);g.closePath();
  fillClip(g,c.H,()=>{if(S.tex==='curl')h3CurlStrands(g,c,q,-130-v*.6,-104,26);else if(S.tex==='wave')waveTop(g,c,F.px,-128-v*.5,-104,8,1.4);else topLines(g,c,F.px,F.tips,-127-v*.5)});
  if(S.fr==='part8'||S.fr==='side'||S.fr==='comma')ln(g,F.px,-122-v*.4,F.px+.4,-114.4,c.D,.9);
  if(S.fr==='split')ln(g,q,-122-v*.4,q,-115.6,c.D,.9);
  if(S.fr==='comma'){/* 쉼표: 이마 바깥쪽에서 안으로 말린 끝 */g.save();g.strokeStyle=c.B;g.lineWidth=3.2;g.lineCap='round';g.beginPath();g.arc(-16.2+q,-103.6,2.5,-Math.PI*.42,Math.PI*.3,true);g.stroke();g.strokeStyle=c.D;g.globalAlpha=.35;g.lineWidth=.8;g.beginPath();g.arc(-16.2+q,-103.6,2.5,-Math.PI*.42,Math.PI*.3,true);g.stroke();g.restore()}
  shine(g,q-1,-99-v*.3,25,1.27,1.45)}
function h3MaleSide(g,p,c,S){const SK=skinGrad(g,p),v=S.v||0;
  /* 앞머리 옆선(이마 앞) */
  const FP={none:[[19.5,-112.6],[14.5,-111.4],[10.4,-109.6]],crop:[[21.6,-107.6],[16.6,-108],[11.6,-108.2]],mush:[[23.4,-102.4],[18.4,-103],[13,-104]],
    side:[[23,-104.6],[18,-105.4],[12.8,-106]],part8:[[23.4,-104.8],[18,-106.2],[12.6,-106.6]],comma:[[23.4,-103.6],[18,-104.8],[12.6,-105.8]],split:[[22.6,-106.4],[17.6,-107],[12.6,-106.6]]}[S.fr]||[[22.5,-103],[17.5,-104],[12.5,-105.2]];
  const yb=S.sd==='under'?-96:-90.2,top=-134-v*.7;
  g.beginPath();g.moveTo(FP[0][0],FP[0][1]);tipsTo(g,FP,2,true);g.quadraticCurveTo(9.6,-107,9,-104.6);
  g.bezierCurveTo(8.6,-99,7,yb+(-94-yb)*.4,5.4,yb);g.quadraticCurveTo(4.6,yb+.4,4.2,yb-.8);g.bezierCurveTo(3.6,-94,3.2,-97,3,-99.8);
  g.quadraticCurveTo(2.8,-103.4,-1,-103.4);g.bezierCurveTo(-5.2,-103.4,-6.8,-99,-6.2,-94);g.quadraticCurveTo(-5.6,-90.2,-3.4,-89.2);
  /* 목덜미: 목 쪽으로 더 내려오며 두께가 점점 얇아져요 */
  g.bezierCurveTo(-5.4,-85,-7.8,-80.4,-10.8,-76.4);g.bezierCurveTo(-17.6,-77.6,-26,-83.4,-29.2,-94);
  g.bezierCurveTo(-31.8-v*.3,-99,-31.8-v*.3,-118,-17,-127.5);g.bezierCurveTo(-4,top,19,top+2,25,-113);g.quadraticCurveTo(26.3,-107,FP[0][0],FP[0][1]);g.closePath();
  fillClip(g,c.H,()=>{if(S.tex==='curl')h3CurlStrands(g,c,8,-134,-86,30);else if(S.tex==='wave')waveTop(g,c,10,-132-v*.5,-90,7,1.4);
    g.save();g.globalAlpha=.26;g.strokeStyle=c.D;g.lineWidth=.9;for(const [x0,y0,x1,y1,b] of [[14,-128,22,-106,2],[6,-130,14,-107,2],[-2,-130,-10,-100,-4],[-10,-127,-17,-88,-4],[-18,-121,-23,-90,-3],[-24,-112,-27,-94,-1]]){g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2+b,(y0+y1)/2,x1,y1);g.stroke()}g.restore();
    if(S.sd==='under'){g.save();g.globalAlpha=.5;g.fillStyle=mix(p.hair,p.skin,.3);g.beginPath();g.moveTo(-40,-91);g.quadraticCurveTo(-14,-94,6,-94);g.lineTo(6,-60);g.lineTo(-40,-60);g.closePath();g.fill();g.restore()}});
  g.beginPath();g.ellipse(-1,-96,3.7,5.3,.12,0,Math.PI*2);g.fillStyle=SK;g.fill();
  shine(g,0,-102-v*.3,25,1.28,1.52)}
function h3MaleRear(g,p,c,S,hx){g.save();g.translate(hx,0);const SK=skinGrad(g,p),v=S.v||0,top=-135.5-v*.7;
  for(const s of [-1,1])el(g,s*23.4,-95.8,3.7,5.4,SK);
  maleHead(g,0,0,SK,p.skinSh);
  /* 뒤통수를 덮고, 아래 끝은 턱 곡선과 같은 곡률로 살짝 좁아지며 */
  g.beginPath();g.moveTo(-24.6,-103.5);g.bezierCurveTo(-29-v*.2,top,29+v*.2,top,24.6,-103.5);g.quadraticCurveTo(22.2,-102.8,21.2,-99.5);
  g.bezierCurveTo(20.6,-91,13.6,-81,0,-79.6);g.bezierCurveTo(-13.6,-81,-20.6,-91,-21.2,-99.5);g.quadraticCurveTo(-22.2,-102.8,-24.6,-103.5);g.closePath();
  fillClip(g,c.H,()=>{if(S.tex==='curl')h3CurlStrands(g,c,0,-134,-80,26);else if(S.tex==='wave')waveTop(g,c,0,-132,-80,8,1.4);else{g.save();g.globalAlpha=.25;g.strokeStyle=c.D;g.lineWidth=.9;for(const x of [-15,-9,-3,3,9,15]){g.beginPath();g.moveTo(x*.4,-126);g.quadraticCurveTo(x*1.12,-104,x*.8,-86);g.stroke()}g.restore()}
    if(S.sd==='under'){g.save();g.globalAlpha=.5;g.fillStyle=mix(p.hair,p.skin,.3);g.beginPath();g.moveTo(-30,-89);g.quadraticCurveTo(0,-93,30,-89);g.lineTo(30,-70);g.lineTo(-30,-70);g.closePath();g.fill();g.restore()}});
  shine(g,0,-101,22,1.3,1.6);g.restore()}

/* ---------- 얼굴 옆으로 내려오는 머리(여자 대부분 + 남자 장발/리프) ---------- */
function h3Dims(p,S){const m=p.style!=='f',v=S.v||0;return {m,v,inn:m?20.8:18.6,out:(m?28.4:26.6)+v*.3+(S.tex==='curl'?3.2:S.tex==='wave'?1.4:0),yS:m?-101:-99.5,top:-132-v*.7}}
/* 긴 머리 앞머리: (X(1,inn),yS) → (X(-1,inn),yS) */
function h3LongFringe(g,fr,q,R,L,yS,m){
  if(fr==='full'){const T=[R,[13+q,-100.8],[6.5+q,-102.4],[q,-103],[-6.5+q,-102.4],[-13+q,-100.8],L];tipsTo(g,T,1.4,true);return {px:q,tips:T.slice(1,-1)}}
  if(fr==='curtain'){g.bezierCurveTo(16+q,yS-.5,12+q,-104.5,8+q,-105);g.bezierCurveTo(4.5+q,-108.5,2+q,-113,q,-116);g.bezierCurveTo(-2+q,-113,-4.5+q,-108.5,-8+q,-105);g.bezierCurveTo(-12+q,-104.5,-16+q,yS-.5,L[0],L[1]);return {px:q,tips:[[12+q,-102],[7+q,-106],[-7+q,-106],[-12+q,-102]]}}
  if(fr==='split'){g.bezierCurveTo(16+q,yS-1,10+q,-106,5+q,-110.6);g.quadraticCurveTo(1.5+q,-113.6,q,-116);g.quadraticCurveTo(-1.5+q,-113.6,-5+q,-110.6);g.bezierCurveTo(-10+q,-106,-16+q,yS-1,L[0],L[1]);return {px:q,tips:[[13+q,-103],[7+q,-108],[-7+q,-108],[-13+q,-103]]}}
  if(fr==='side'){/* 한쪽 가르마에서 반대쪽 관자놀이로 매끈하게 쓸려 내려오는 앞머리 */g.bezierCurveTo(17+q,yS-3,14+q,-112,9+q,-117);g.bezierCurveTo(3+q,-114.6,-6+q,-108.6,-11.6+q,-104.6);g.quadraticCurveTo(-14.6+q,-102.2,-15.8+q,-100.6);g.quadraticCurveTo(-16.6+q,yS+.6,L[0],L[1]);return {px:9+q,tips:[[3+q,-111],[-3.5+q,-107.4],[-9+q,-104.6],[-14+q,-101.6]]}}
  if(fr==='none'){g.bezierCurveTo(16+q,-112,6+q,-118.5,q,-118.5);g.bezierCurveTo(-6+q,-118.5,-16+q,-112,L[0],L[1]);return {px:q,tips:[]}}
  /* see: 가운데가 조금 짧고 양옆이 길게 */
  const T=[R,[12.4+q,-101],[6.2+q,-103],[q,-103.8],[-6.2+q,-103],[-12.4+q,-101],L];tipsTo(g,T,2.2,true);return {px:q,tips:T.slice(1,-1)}}
function h3LongFront(g,p,c,S,o){const q=o*.6,t=o/5,{m,v,inn,out,yS,top}=h3Dims(p,S),tex=S.tex,yF=S.yF||S.yL;
  const X=(s,x)=>s*x*(s<0?1:1-.12*t)+q*(s<0?.3:1);
  /* 한쪽 옆머리: 안쪽선(얼굴선) 아래로 → 끝 → 바깥선 위로. s=-1 왼쪽(내려감), s=1 오른쪽(올라감) */
  const lockDown=(s)=>{/* (X(s,inn),yS) 에서 끝까지 */
    const ye=yF;g.bezierCurveTo(X(s,inn-.2),-94,X(s,inn-.4),-88,X(s,inn+.2),Math.max(ye,-80));
    if(S.shape==='bob'){g.bezierCurveTo(X(s,inn+.2),-77,X(s,inn-.8),ye+3,X(s,inn-1.6),ye);tipsTo(g,[[X(s,inn-1.6),ye],[X(s,inn+3),ye+1.4],[X(s,inn+7.4),ye+1],[X(s,out-.4),ye-2]],1,true);return}
    if(S.shape==='hime'){g.lineTo(X(s,inn+.2),ye);g.lineTo(X(s,inn+6.4),ye);g.lineTo(X(s,inn+6.4),ye-1);return}
    if(ye<-80){if(tex==='curl'||tex==='wave')edgeTo(g,X(s,inn+.2),-80,X(s,inn+.6),ye+2,tex,s);else g.bezierCurveTo(X(s,inn+.8),-70,X(s,inn),-60,X(s,inn+.6),ye+2)}
    const w=out-inn,T=S.shape==='blunt'?[[X(s,inn+.6),ye],[X(s,inn+w*.5),ye+.6],[X(s,out-.6),ye]]:tex==='layer'?[[X(s,inn+.6),ye+2],[X(s,inn+w*.3),ye+5],[X(s,inn+w*.6),ye],[X(s,out-.8),ye-5]]:
      tex==='cc'?[[X(s,inn+.6),ye+2],[X(s,inn+w*.5),ye+4.6],[X(s,out-.2),ye]]:[[X(s,inn+.6),ye+2],[X(s,inn+w*.3),ye+4.4],[X(s,inn+w*.55),ye+3],[X(s,inn+w*.8),ye+4],[X(s,out-.4),ye+1]];
    tipsTo(g,T,tex==='curl'?2.4:1.4,true)};
  const lockUp=(s,from)=>{/* 끝에서 바깥선 위로 귀 높이(-87)까지 */
    if(S.shape==='hime'){g.lineTo(X(s,inn+6.4),-84);g.quadraticCurveTo(X(s,out-.2),-84,X(s,out-.6),-87);return}
    const y0=from;if(tex==='curl'||tex==='wave')edgeTo(g,X(s,out-.4),y0,X(s,out-.2),-88,tex,-s);
    else if(tex==='layer')layerTo(g,X(s,out-.6),y0,X(s,out-.4),-88,4,-s*2.2,0);
    else if(y0>-76)g.quadraticCurveTo(X(s,out+.4),(y0-87)/2,X(s,out-.6),-87);else g.bezierCurveTo(X(s,out+.6),Math.min(y0-10,-64),X(s,out-1.6),-76,X(s,out-.6),-87)};
  const yEnd=S.shape==='bob'?yF-2:S.shape==='blunt'?yF:tex==='layer'?yF-5:yF+1;
  /* 한쪽은 귀 뒤로 넘긴 머리(왼쪽을 볼 때 보이는 쪽). 정면·대각선도 같은 쪽 귀가 보여요 */
  const TK=(S.yL>=-76&&S.shape!=='hime'&&S.shape!=='bob')?(H3V.flip?-1:1):0;
  if(TK&&!(TK>0&&t>.35)){const SK=skinGrad(g,p);el(g,X(TK,21.8)+TK*.3,-95.4,3.3,5,SK)}
  const tuck=s=>{/* (X(s,inn),yS) → 귀 위를 감싸 → 귀 뒤 → 바깥선(-87) */
    g.bezierCurveTo(X(s,inn+1.6),-103.6,X(s,24.4),-105,X(s,25.8),-99);g.quadraticCurveTo(X(s,26.6),-94,X(s,25.4),-89.4);g.lineTo(X(s,out-.6),-87)};
  const tuckRev=s=>{g.lineTo(X(s,25.4),-89.4);g.quadraticCurveTo(X(s,26.6),-94,X(s,25.8),-99);g.bezierCurveTo(X(s,24.4),-105,X(s,inn+1.6),-103.6,X(s,inn),yS)};
  g.beginPath();g.moveTo(X(-1,inn),yS);
  /* 왼쪽 옆머리(아래로) */
  if(TK===-1)tuck(-1);else{lockDown(-1);lockUp(-1,yEnd)}
  /* 정수리 → 오른쪽 */
  g.bezierCurveTo(X(-1,out+2),-100,X(-1,24),top,q,top);g.bezierCurveTo(X(1,24),top,X(1,out+2),-100,X(1,out-.6),-87);
  /* 오른쪽: 바깥선 아래로 → 끝 → 안쪽선 위로 (왼쪽을 거꾸로) */
  if(TK===1)tuckRev(1);else h3LockReverse(g,S,X,inn,out,yS,yF,tex);
  const F=h3LongFringe(g,S.fr,q,[X(1,inn),yS],[X(-1,inn),yS],yS,m);g.closePath();
  fillClip(g,c.H,()=>{
    if(tex==='curl'){waveTop(g,c,F.px,-130,-96,8,1.6);g.save();g.beginPath();g.rect(-40,-140,80,110);g.ellipse(q,-112,16,22,0,0,Math.PI*2);g.clip('evenodd');ringLines(g,c,-34+q,34+q,-118,Math.max(yF,-90));g.restore()}
    else if(tex==='wave'){waveTop(g,c,F.px,-130,-98,8,1.4);for(const s of [-1,1])waveLines(g,c,[X(s,inn+2),X(s,inn+4.6),X(s,out-2.6)],-104,yF,1.6)}
    else{topLines(g,c,F.px,F.tips.length?F.tips:[[-14+q,-104],[-6+q,-104],[6+q,-104],[14+q,-104]],-128);
      g.save();g.lineCap='round';for(const s of [-1,1])for(const [d,a,col,w] of [[1.2,.3,c.D,.8],[3,.28,c.L,1],[5,.3,c.D,.8],[out-inn-1.4,.24,c.L,1]]){if(inn+d>out-.6)continue;g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(F.px+s*(3+d*1.4),-128);g.quadraticCurveTo(X(s,inn+d+.6),-120,X(s,inn+d-.4),-106);g.bezierCurveTo(X(s,inn+d+1),-96,X(s,inn+d-1.4),-80,X(s,inn+d),Math.max(yF+4,-78));if(yF<-76)g.quadraticCurveTo(X(s,inn+d+.8),(yF-78)/2,X(s,inn+d+.4),yF+3);g.stroke()}g.restore()}});
  if(S.fr==='side')ln(g,F.px,-124,F.px+.3,-117.4,c.D,.9);else if(S.fr==='split'||S.fr==='curtain')ln(g,q,-124,q,-116.4,c.D,.9);
  if(tex==='cc'||tex==='layer')for(const s of [-1,1])if(s!==TK)h3FaceLayer(g,c,S,X,s,inn,out,yS,yF);
  shine(g,q-1,-103-v*.3,23,1.27,1.47)}
/* 얼굴 옆 짧은 층(레이어드): 볼~턱 높이에서 끝나는 앞쪽 층. C컬은 끝이 안으로 말려요 */
function h3FaceLayer(g,c,S,X,s,inn,out,yS,yF){const cc=S.tex==='cc',yT=cc?-80:-82,w=(out-inn)*.62;
  g.beginPath();g.moveTo(X(s,inn),yS);g.bezierCurveTo(X(s,inn-.2),-94,X(s,inn-.3),-88,X(s,inn+.2),yT+2);
  if(cc){g.bezierCurveTo(X(s,inn+.4),yT+6,X(s,inn+w),yT+6.4,X(s,inn+w+.6),yT+1);g.quadraticCurveTo(X(s,inn+w+.4),yT-1.6,X(s,inn+w-1.4),yT-1.4)}
  else tipsTo(g,[[X(s,inn+.2),yT+2],[X(s,inn+w*.45),yT+4.6],[X(s,inn+w),yT-1]],1.6,false);
  g.bezierCurveTo(X(s,inn+w+1.4),-90,X(s,inn+w+.6),-100,X(s,inn+2),-110);g.closePath();g.fillStyle=c.H;g.fill();
  /* 층 경계선 */
  g.save();g.lineCap='round';g.globalAlpha=.55;g.strokeStyle=c.D;g.lineWidth=1.1;g.beginPath();g.moveTo(X(s,inn+w*.7),-100);g.bezierCurveTo(X(s,inn+w+1.2),-92,X(s,inn+w+.8),yT+4,cc?X(s,inn+w*.5):X(s,inn+w),cc?yT+4.8:yT);g.stroke();
  if(cc){/* C자로 말린 끝 */g.lineWidth=1.2;g.globalAlpha=.6;g.beginPath();g.arc(X(s,inn+w*.5),yT+.4,w*.42,Math.PI*.12,Math.PI*.88);g.stroke();g.globalAlpha=.4;g.strokeStyle=c.L;g.lineWidth=1.1;g.beginPath();g.arc(X(s,inn+w*.5),yT-1.4,w*.3,Math.PI*.25,Math.PI*.75);g.stroke();
    /* 긴 쪽 끝도 C컬 */g.globalAlpha=.6;g.strokeStyle=c.D;g.lineWidth=1.2;const wl=out-inn;g.beginPath();g.arc(X(s,inn+wl*.5),yF-.6,wl*.4,Math.PI*.15,Math.PI*.85);g.stroke();g.globalAlpha=.35;g.strokeStyle=c.L;g.lineWidth=1.1;g.beginPath();g.arc(X(s,inn+wl*.5),yF-2.6,wl*.28,Math.PI*.25,Math.PI*.75);g.stroke()}
  else{g.globalAlpha=.32;g.beginPath();g.moveTo(X(s,inn+w*.45),-96);g.quadraticCurveTo(X(s,inn+w*.5),-88,X(s,inn+w*.45),yT+3.6);g.stroke()}
  g.restore()}
/* 오른쪽 옆머리를 바깥→끝→안쪽 순서로 */
function h3LockReverse(g,S,X,inn,out,yS,yF,tex){const s=1,ye=yF,w=out-inn;
  if(S.shape==='hime'){g.quadraticCurveTo(X(s,out-.2),-84,X(s,inn+6.4),-84);g.lineTo(X(s,inn+6.4),ye);g.lineTo(X(s,inn+.2),ye);g.lineTo(X(s,inn+.2),-80);g.bezierCurveTo(X(s,inn-.4),-88,X(s,inn-.2),-94,X(s,inn),yS);return}
  if(S.shape==='bob'){g.bezierCurveTo(X(s,out-1.6),-80,X(s,out+.4),ye-10,X(s,out-.4),ye-2);tipsTo(g,[[X(s,out-.4),ye-2],[X(s,inn+7.4),ye+1],[X(s,inn+3),ye+1.4],[X(s,inn-1.6),ye]],1,true);g.bezierCurveTo(X(s,inn-.8),ye+3,X(s,inn+.2),-77,X(s,inn+.2),-80);g.bezierCurveTo(X(s,inn-.4),-88,X(s,inn-.2),-94,X(s,inn),yS);return}
  const yEnd=S.shape==='blunt'?ye:tex==='layer'?ye-5:ye+1;
  if(tex==='curl'||tex==='wave')edgeTo(g,X(s,out-.2),-88,X(s,out-.4),yEnd,tex,s);else if(tex==='layer')layerTo(g,X(s,out-.4),-88,X(s,out-.6),yEnd,4,s*2.2,0);else if(yEnd>-76)g.quadraticCurveTo(X(s,out+.4),(yEnd-87)/2,X(s,out-.4),yEnd);else g.bezierCurveTo(X(s,out-1.6),-76,X(s,out+.6),Math.min(yEnd-10,-64),X(s,out-.4),yEnd);
  const T=S.shape==='blunt'?[[X(s,out-.6),ye],[X(s,inn+w*.5),ye+.6],[X(s,inn+.6),ye]]:tex==='layer'?[[X(s,out-.8),ye-5],[X(s,inn+w*.6),ye],[X(s,inn+w*.3),ye+5],[X(s,inn+.6),ye+2]]:
    tex==='cc'?[[X(s,out-.2),ye],[X(s,inn+w*.5),ye+4.6],[X(s,inn+.6),ye+2]]:[[X(s,out-.4),ye+1],[X(s,inn+w*.8),ye+4],[X(s,inn+w*.55),ye+3],[X(s,inn+w*.3),ye+4.4],[X(s,inn+.6),ye+2]];
  tipsTo(g,T,tex==='curl'?2.4:1.4,true);
  if(ye<-80){if(tex==='curl'||tex==='wave')edgeTo(g,X(s,inn+.6),ye+2,X(s,inn+.2),-80,tex,s);else g.bezierCurveTo(X(s,inn),-60,X(s,inn+.8),-70,X(s,inn+.2),-80)}
  g.bezierCurveTo(X(s,inn-.4),-88,X(s,inn-.2),-94,X(s,inn),yS)}
/* 몸 뒤(정면): 뒷머리 */
function h3LongBehind(g,p,c,S,hx){const {m,v,out}=h3Dims(p,S),yL=S.yL,tex=S.tex,w=out+(tex==='curl'?3:0);if(yL<-76&&S.shape!=='bob')return;g.save();g.translate(hx,0);
  g.beginPath();g.moveTo(-21,-118);g.bezierCurveTo(-w-1,-108,-w,-90,-w+.4,-86);
  if(tex==='curl'||tex==='wave')edgeTo(g,-w+.4,-86,-w+.6,yL,tex,-1);else g.bezierCurveTo(-w+1,-74,-w+.6,-60,-w+.6,yL);
  const T=[];for(let k=0;k<=8;k++){const x=-w+.6+(2*w-1.2)*k/8;T.push([x,yL+(k%2?1.8:.6)+(tex==='layer'?(k%3)*2:0)])}tipsTo(g,T,tex==='curl'?2.2:1,true);
  if(tex==='curl'||tex==='wave')edgeTo(g,w-.6,yL,w-.4,-86,tex,-1);else g.bezierCurveTo(w-.6,-60,w-1,-74,w-.4,-86);
  g.bezierCurveTo(w,-90,w+1,-108,21,-118);g.closePath();
  fillClip(g,c.H,()=>{if(tex==='curl')ringLines(g,c,-w,w,-110,yL+2);else if(tex==='wave')waveLines(g,c,[-20,-12,-4,4,12,20],-112,yL,1.8);else straightLines(g,c,[-24,-19,-14,-9,-4,1,6,11,16,21,25],-112,yL,1,.28)});
  g.restore()}
/* 옆모습(오른쪽 봄): 얼굴 옆을 덮으며 흘러내리는 머리 */
function h3LongSide(g,p,c,S){const {m,v,top}=h3Dims(p,S),tex=S.tex,yF=S.yF||S.yL;
  const FP={full:[[24,-101],[19,-100.6],[14,-101]],curtain:[[22.6,-104.8],[18,-103.6],[14,-102.6]],split:[[22.6,-105.4],[18,-104],[14,-103]],side:[[23,-102.6],[18.6,-101.8],[14,-101.6]],none:[[19.5,-113],[15,-110],[12.6,-105]]}[S.fr]||[[23,-102.4],[18.4,-101.6],[14,-101.4]];
  const xF=S.shape==='hime'?8.8:9.6;g.beginPath();g.moveTo(25.6,-106);g.quadraticCurveTo(25.2,-104,FP[0][0],FP[0][1]);tipsTo(g,FP,2,true);
  g.quadraticCurveTo(xF,-101,xF,-98);
  if(S.shape==='hime'){const yL=S.yL;g.lineTo(xF,-80);g.lineTo(5.4,-80);g.lineTo(5.4,-84);g.bezierCurveTo(1,-80,-1,-62,-2,yL+2);tipsTo(g,[[-2,yL+2],[-6,yL+4],[-10,yL+2.6],[-14,yL]],1.2,true);g.bezierCurveTo(-16,yL-14,-16,-76,-18,-86)}
  else if(S.shape==='bob'){g.bezierCurveTo(xF+.6,-90,xF+.4,yF+4,xF-3,yF+1);tipsTo(g,[[xF-3,yF+1],[4,yF+2],[-3,yF+1.4],[-10,yF]],1,true);g.bezierCurveTo(-14,yF-4,-18,-84,-20,-88)}
  else if(yF>-80){g.bezierCurveTo(xF+.8,-94,xF+.4,yF-4,xF-1.6,yF+1);tipsTo(g,[[xF-1.6,yF+1],[5.4,yF+3],[.6,yF+2],[-4.4,yF+3],[-9,yF]],tex==='curl'?2:1.2,true);g.quadraticCurveTo(-14,yF-1,-18,-86)}
  else{const ye=yF;
    if(tex==='wave'||tex==='curl'){edgeTo(g,xF,-98,xF-1.4,-76,tex,1);edgeTo(g,xF-1.4,-76,4,ye+2,tex,1)}
    else{g.bezierCurveTo(xF+.6,-88,xF+1.2,-80,xF-2.4,-72);g.bezierCurveTo(6.4,-66,5.6,-60,4,ye+2)}
    tipsTo(g,tex==='layer'?[[4,ye+2],[1,ye-2],[-3,ye+1],[-7,ye-4]]:[[4,ye+2],[1.4,ye+5],[-1.6,ye+3.6],[-4.6,ye+5],[-7.6,ye+1.4]],1.4,true);
    if(tex==='wave'||tex==='curl')edgeTo(g,-7.6,ye+1.4,-18,-86,tex,1);else g.bezierCurveTo(-9.6,ye-12,-12,-76,-18,-86)}
  const Bx=-30-v*.3-(tex==='curl'?2.4:0);g.quadraticCurveTo(Bx+.8,-88,Bx,-96);g.lineTo(Bx,-104);g.bezierCurveTo(Bx-.2,-121,-14,top-2,4,top);g.bezierCurveTo(18,top+1,26.6,-120,25.6,-106);g.closePath();
  fillClip(g,c.H,()=>{
    if(tex==='curl'){waveTop(g,c,8,-132,-100,6,1.4);g.save();g.beginPath();g.rect(-40,-140,80,120);g.ellipse(2,-118,22,16,0,0,Math.PI*2);g.clip('evenodd');ringLines(g,c,-30,14,-120,yF);g.restore()}
    else if(tex==='wave'){waveTop(g,c,10,-132,-100,6,1.2);waveLines(g,c,[9,5,1,-3],-104,yF,1.8)}
    else{g.save();g.lineCap='round';for(const [x,a,col,w] of [[7,.3,c.D,.8],[3.5,.28,c.L,1.1],[0,.3,c.D,.8],[-3.5,.26,c.L,1.1]]){g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x+6,-120);g.bezierCurveTo(x+4,-100,x+3.6,-86,x+.4,-76);g.bezierCurveTo(x-1.4,-68,x+.4,-60,x-1.4,Math.max(yF+2,-80));g.stroke()}
      strands(g,c,[[14,-128,20,-108,2],[-6,-128,-16,-100,-3],[-14,-124,-24,-98,-2]],.26);g.restore()}});
  shine(g,2,-102-v*.3,24,1.3,1.55)}
function h3LongSideBehind(g,p,c,S){const {v}=h3Dims(p,S),yL=S.yL,tex=S.tex;if(yL<-76&&S.shape!=='bob')return;
  /* 뒷머리 가장 불룩한 곳(Bx)에서 일자로, 또는 살짝 바깥(왼쪽)으로 떨어져요 */
  const Bx=-30-v*.3-(tex==='curl'?2.4:0),Be=Bx-(tex==='curl'||tex==='wave'?2:1.2);
  g.beginPath();g.moveTo(-2,-120);g.bezierCurveTo(Bx+6,-121,Bx,-114,Bx,-104);g.lineTo(Bx,-92);
  if(tex==='wave'||tex==='curl')edgeTo(g,Bx,-92,Be,yL,tex,-1);else g.bezierCurveTo(Bx-.3,-80,Be,-64,Be,yL);
  const w=-6-Be;tipsTo(g,[[Be,yL],[Be+w*.2,yL+2.4],[Be+w*.4,yL+1.2],[Be+w*.6,yL+2.6],[Be+w*.8,yL+.8],[-6,yL-2.4]],tex==='curl'?2:1.1,true);g.bezierCurveTo(-1,yL-20,0,-88,1,-104);g.closePath();
  fillClip(g,c.H,()=>{if(tex==='curl')ringLines(g,c,Be,-2,-116,yL);else if(tex==='wave')waveLines(g,c,[Bx+4,Bx+10,Bx+16,Bx+22],-114,yL,1.8);else straightLines(g,c,[-26,-22,-18,-14,-10,-6],-114,yL,-1,.3)})}
function h3LongRear(g,p,c,S,hx){const {v,top}=h3Dims(p,S),yL=S.yL,tex=S.tex,w=26+v*.3+(tex==='curl'?3:0);g.save();g.translate(hx,0);
  g.beginPath();g.moveTo(-25,-102);g.bezierCurveTo(-27-v*.3,top-4,27+v*.3,top-4,25,-102);g.quadraticCurveTo(w+1.6,-100,w+1.2,-93);
  if(tex==='wave'||tex==='curl')edgeTo(g,w+1.2,-93,w+.4,yL,tex,1);else g.bezierCurveTo(w+1,-78,w+1,-62,w+.4,yL);
  const T=[];for(let k=0;k<=10;k++){const x=w+.4-(2*w+.8)*k/10;T.push([x,yL+(k%2?1.8:.6)+(tex==='layer'?((k%3)-1)*2.4:0)])}tipsTo(g,T,tex==='curl'?2.2:1,true);
  if(tex==='wave'||tex==='curl')edgeTo(g,-w-.4,yL,-w-1.2,-93,tex,1);else g.bezierCurveTo(-w-1,-62,-w-1,-78,-w-1.2,-93);
  g.quadraticCurveTo(-w-1.6,-100,-25,-102);g.closePath();
  fillClip(g,c.H,()=>{if(tex==='curl'){waveTop(g,c,0,-132,-100,8,1.6);g.save();g.beginPath();g.rect(-40,-140,80,140);g.ellipse(0,-118,18,16,0,0,Math.PI*2);g.clip('evenodd');ringLines(g,c,-w,w,-122,yL);g.restore()}
    else if(tex==='wave'){waveTop(g,c,0,-132,-104,8,1.4);waveLines(g,c,[-22,-15,-8,-1,6,13,20],-108,yL,1.8)}
    else straightLines(g,c,[-25,-21,-17,-13,-9,-5,-1,3,7,11,15,19,23],-128,yL,1,.3);
    if(tex==='cc')h3CMarks(g,c,-w,w,yL);if(tex==='layer')h3LayerMarks(g,c,w,yL)});
  shine(g,0,-101,21,1.3,1.6);g.restore()}
function h3CMarks(g,c,x0,x1,y){g.save();g.lineCap='round';const n=Math.max(3,Math.round((x1-x0)/9)),d=(x1-x0)/n;for(let k=0;k<n;k++){const x=x0+d*(k+.5);g.globalAlpha=.6;g.strokeStyle=c.D;g.lineWidth=1.2;g.beginPath();g.arc(x,y-1.2,d*.46,Math.PI*.12,Math.PI*.88);g.stroke();g.globalAlpha=.34;g.strokeStyle=c.L;g.lineWidth=1.1;g.beginPath();g.arc(x,y-3.4,d*.32,Math.PI*.25,Math.PI*.75);g.stroke()}g.restore()}
function h3LayerMarks(g,c,w,y){g.save();g.lineCap='round';g.globalAlpha=.36;g.strokeStyle=c.D;g.lineWidth=.9;for(const yy of [y-22,y-10])for(let k=-2;k<=2;k++){const x=k*w*.36;g.beginPath();g.moveTo(x-4,yy-3);g.quadraticCurveTo(x,yy+2,x+4,yy-3);g.stroke()}g.restore()}

/* 옆모습(귀 넘김): 귀가 보이고, 귀 뒤로 넘긴 머리가 목을 따라 내려와 등 쪽으로 넘어가요 */
function h3TuckSide(g,p,c,S){const SK=skinGrad(g,p),v=S.v||0,top=-133-v*.7,tex=S.tex,m=p.style!=='f';
  const FP={full:[[23.6,-101.4],[18.6,-100.6],[13.6,-100.8]],curtain:[[22.6,-104.8],[18,-103.6],[13.4,-103]],split:[[22.6,-105.4],[18,-104],[13.4,-103]],side:[[23,-102.6],[18.4,-101.6],[13.4,-101.6]]}[S.fr]||[[23,-102.4],[18.4,-101.4],[13.4,-101.4]];
  const yE=Math.max(S.yF||S.yL,-74),wv=tex==='wave'||tex==='curl';
  g.beginPath();g.moveTo(FP[0][0],FP[0][1]);tipsTo(g,FP,2,true);g.quadraticCurveTo(9.8,-102,8.6,-100.4);
  /* 관자놀이 잔머리 → 귀 앞 */
  g.bezierCurveTo(8,-96,6.8,-92,5.6,-88.4);g.quadraticCurveTo(4.9,-88,4.5,-89);g.bezierCurveTo(3.8,-93,3.3,-97,3.1,-99.6);
  /* 귀 위를 감싸고 귀 뒤로 */
  g.quadraticCurveTo(2.8,-103.6,-1,-103.6);g.bezierCurveTo(-5.4,-103.4,-6.6,-99,-6,-94);
  /* 귀 뒤 → 목을 따라 → 등 쪽으로 */
  if(wv)edgeTo(g,-6,-94,-6.6,yE+4,tex,-1);else g.bezierCurveTo(-5.2,-88,-5.4,-82,-6.6,yE+4);
  tipsTo(g,[[-6.6,yE+4],[-9.6,yE+6],[-13,yE+3.6],[-16.4,yE+1]],tex==='curl'?2:1.2,true);
  if(wv)edgeTo(g,-16.4,yE+1,-27.6,-95,tex,1);else g.bezierCurveTo(-19.4,-80,-25,-86,-28.4,-95);
  g.bezierCurveTo(-31.4,-102,-31.4,-118,-17,-127.5);g.bezierCurveTo(-4,top,19,top+2,25,-113);g.quadraticCurveTo(26.3,-107,FP[0][0],FP[0][1]);g.closePath();
  fillClip(g,c.H,()=>{g.save();g.lineCap='round';
    for(const [x0,y0,x1,y1,b] of [[18,-112,-14,-124,-3],[14,-107,-20,-114,-3],[8,-104,-24,-104,-1],[-4,-104,-10,yE+2,-4],[-10,-108,-15,yE,-5],[-18,-112,-21,yE-4,-4]]){g.globalAlpha=.28;g.strokeStyle=c.D;g.lineWidth=.9;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2+b,(y0+y1)/2+(y1>y0?0:b),x1,y1);g.stroke()}
    if(tex==='curl')ringLines(g,c,-28,-4,-100,yE);else if(tex==='wave')waveLines(g,c,[-8,-13,-19],-100,yE,1.4);else if(tex==='cc')h3CMarks(g,c,-16,-6,yE+3);
    g.globalAlpha=.3;g.strokeStyle=c.L;g.lineWidth=1.3;g.beginPath();g.moveTo(14,-118);g.quadraticCurveTo(0,-124,-14,-116);g.stroke();g.restore()});
  g.beginPath();g.ellipse(-1,-96,3.5,5.1,.12,0,Math.PI*2);g.fillStyle=SK;g.fill();
  shine(g,0,-104-v*.3,24,1.28,1.52)}
/* ---------- 묶은 머리(여자) ---------- */
/* 잔머리: 관자놀이에서 얼굴선을 따라 한 올 한 올 살랑 */
function h3Wisps(g,c,X,s){g.beginPath();g.moveTo(X(s,18.2),-104.6);g.quadraticCurveTo(X(s,21),-104.4,X(s,23),-101.6);g.quadraticCurveTo(X(s,21.2),-100.6,X(s,19.6),-98.6);g.closePath();g.fillStyle=c.H;g.fill();
  g.save();g.lineCap='round';
  const L=[[19.4,-103,18.2,-97,20.6,-93,19.2,-88.4,1.05],[20.6,-102.4,21.8,-97,19.8,-92.6,20.4,-87,.9],[21.8,-101.6,20.4,-97.4,22.2,-94,21,-90.6,.75],[18.8,-103.4,19.8,-99.6,18,-96.6,18.6,-93.4,.65]];
  for(const [x0,y0,x1,y1,x2,y2,x3,y3,w] of L){g.strokeStyle=c.B;g.globalAlpha=.95;g.lineWidth=w;g.beginPath();g.moveTo(X(s,x0),y0);g.bezierCurveTo(X(s,x1),y1,X(s,x2),y2,X(s,x3),y3);g.stroke()}
  g.restore()}
function h3TiedFront(g,p,c,S,o){const q=o*.6,t=o/5,SK=skinGrad(g,p),v=S.v||0,top=-134-v*.8,x=S.x;
  const X=(s,v)=>s*v*(s<0?1:1-.12*t)+q*(s<0?.3:1),far=s=>s>0&&t>.35;
  /* 귀를 덮고 묶는 쪽: braids=양쪽, sidepony=왼쪽 */
  const gath=s=>x==='sidepony'&&s<0;
  for(const s of [-1,1]){if(far(s)&&!gath(s))continue;el(g,X(s,21.6)+s*.3,-95.4,3.3,5,SK)}
  /* 잔머리(귀가 보이는 쪽) */
  /* 정수리: 볼륨 있게, 옆은 귀 위까지 */
  g.beginPath();g.moveTo(X(-1,23.6),-100.6);g.bezierCurveTo(X(-1,28.2),top,X(1,28.2),top,X(1,23.6),-100.6);g.quadraticCurveTo(X(1,22.4),-100.2,X(1,20.4),-98.8);
  const F=h3LongFringe(g,S.fr,q,[X(1,20.4),-98.8],[X(-1,20.4),-98.8],-98.8,false);g.quadraticCurveTo(X(-1,22.4),-100.2,X(-1,23.6),-100.6);g.closePath();
  /* 묶는 곳 쪽으로 모이는 결 */
  const tie=x==='braids'?null:x==='sidepony'?[X(-1,24),-94]:[q,-131-v];
  fillClip(g,c.H,()=>{g.save();g.lineCap='round';
    if(tie){for(const k of [-3,-2,-1,0,1,2,3]){const bx=q+k*7;g.globalAlpha=.26;g.strokeStyle=c.D;g.lineWidth=.9;g.beginPath();g.moveTo(bx,-102);g.quadraticCurveTo(bx+(tie[0]-bx)*.2,(-102+tie[1])/2,tie[0]+k*1.2,tie[1]);g.stroke()}}
    else for(const s of [-1,1])for(const k of [0,1,2,3]){const x0=q+s*(1+k*.6),x1=X(s,10+k*4);g.globalAlpha=.26;g.strokeStyle=c.D;g.lineWidth=.9;g.beginPath();g.moveTo(x0,-128);g.quadraticCurveTo(x1-s*2,-122,X(s,18+k*2.2),-104);g.stroke()}
    g.globalAlpha=.24;g.strokeStyle=c.L;g.lineWidth=1.2;g.beginPath();g.moveTo(q-12,-112);g.quadraticCurveTo(q-6,-124,q+2,-126);g.stroke();g.restore()});
  if(x==='braids'||S.fr==='curtain')ln(g,q,-126-v*.5,q,-116.4,c.D,.9);else if(S.fr==='side')ln(g,F.px,-124,F.px+.3,-117.4,c.D,.9);
  /* 귀를 덮고 내려와 묶음으로 모이는 머리 */
  for(const s of [-1,1]){if(!gath(s))continue;const a=X(s,18.6),b=X(s,25.4),e0=X(s,20.2),e1=X(s,23.6);
    g.beginPath();g.moveTo(a,-103.6);g.lineTo(b,-102);g.bezierCurveTo(X(s,27),-96,X(s,25.6),-90,e1,-86);g.lineTo(e0,-86);g.bezierCurveTo(X(s,19.6),-90,X(s,18.4),-96,a,-103.6);g.closePath();
    fillClip(g,c.H,()=>{g.save();g.globalAlpha=.28;g.strokeStyle=c.D;g.lineWidth=.9;for(const f of [.25,.55,.8]){g.beginPath();g.moveTo(a+(b-a)*f,-103);g.quadraticCurveTo(a+(b-a)*f+s*1.4,-94,e0+(e1-e0)*f,-86.4);g.stroke()}g.restore()})}
  for(const s of [-1,1]){if(far(s)||gath(s)||S.noWisp)continue;h3Wisps(g,c,X,s)}
  h3Extra(g,p,c,S,'front',q,X);
  shine(g,q-1,-101-v*.3,23,1.27,1.47)}
function h3TiedSide(g,p,c,S){const SK=skinGrad(g,p),v=S.v||0,top=-133-v*.7;
  const FP={full:[[23.6,-101.4],[18.6,-101],[13.6,-101.6]],curtain:[[22.6,-104.8],[18,-103.6],[13.4,-103.4]],side:[[23,-102.6],[18.4,-102],[13.4,-102.4]]}[S.fr]||[[23,-102.4],[18.4,-101.8],[13.4,-102.2]];
  h3Extra(g,p,c,S,'sideB');
  g.beginPath();g.moveTo(FP[0][0],FP[0][1]);tipsTo(g,FP,2,true);g.quadraticCurveTo(9.6,-104,8.4,-102.6);
  g.bezierCurveTo(8,-98,6.6,-92,5.4,-86.6);g.quadraticCurveTo(4.8,-86.2,4.4,-87.2);g.bezierCurveTo(3.6,-93,3.2,-97,3,-99.8);
  g.quadraticCurveTo(2.8,-103.4,-1,-103.4);g.bezierCurveTo(-5.2,-103.4,-6.6,-99,-6,-94);g.quadraticCurveTo(-5.6,-90.4,-3.8,-89.6);
  g.bezierCurveTo(-5.6,-85.6,-7.8,-81.4,-10.6,-78);g.bezierCurveTo(-17,-79.4,-25,-85,-28.4,-95);
  g.bezierCurveTo(-31,-102,-31,-118,-17,-127.5);g.bezierCurveTo(-4,top,19,top+2,25,-113);g.quadraticCurveTo(26.3,-107,FP[0][0],FP[0][1]);g.closePath();
  fillClip(g,c.H,()=>{g.save();g.globalAlpha=.26;g.strokeStyle=c.D;g.lineWidth=.9;for(const [x0,y0,x1,y1,b] of [[18,-112,-14,-124,-3],[16,-106,-18,-116,-3],[10,-104,-22,-108,-2],[4,-104,-24,-100,-1],[-4,-96,-24,-96,0]]){g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2,(y0+y1)/2+b,x1,y1);g.stroke()}g.restore()});
  g.beginPath();g.ellipse(-1,-96,3.4,5,.12,0,Math.PI*2);g.fillStyle=SK;g.fill();
  h3Extra(g,p,c,S,'side');
  shine(g,0,-104-v*.3,24,1.28,1.52)}
function h3TiedRear(g,p,c,S,hx){g.save();g.translate(hx,0);const SK=skinGrad(g,p),v=S.v||0,top=-135-v*.7;
  for(const s of [-1,1])el(g,s*21.4,-95.6,3.3,5,SK);
  slimHead(g,0,0,SK,p.skinSh);
  g.beginPath();g.moveTo(-23,-103);g.bezierCurveTo(-27,top,27,top,23,-103);g.quadraticCurveTo(20.6,-102.4,19.8,-99.4);g.bezierCurveTo(19.2,-90,12.4,-80.2,0,-79.2);g.bezierCurveTo(-12.4,-80.2,-19.2,-90,-19.8,-99.4);g.quadraticCurveTo(-20.6,-102.4,-23,-103);g.closePath();
  const tp=S.x==='bun'||S.x==='hipony'?[0,-128]:S.x==='buns'?[0,-110]:S.x==='braids'?[0,-110]:S.x==='sidepony'?[16,-96]:[0,-116];
  fillClip(g,c.H,()=>{g.save();g.globalAlpha=.24;g.strokeStyle=c.D;g.lineWidth=.9;for(const x of [-18,-11,-4,4,11,18]){g.beginPath();g.moveTo(x*.95,-84);g.quadraticCurveTo(x*1.1,-104,tp[0]+x*.15,tp[1]);g.stroke()}g.restore()});
  if(S.x==='braids'||S.x==='buns')ln(g,0,-128,0,-84,c.D,.9);
  h3Extra(g,p,c,S,'rear');
  shine(g,0,-103,20,1.3,1.6);g.restore()}
/* 묶음 장식들 */
function h3Bun(g,c,x,y,r){el(g,x,y,r,r*.9,c.B);g.save();g.strokeStyle=c.D;g.globalAlpha=.45;g.lineWidth=.9;g.lineCap='round';g.beginPath();g.arc(x,y,r*.55,Math.PI*-.2,Math.PI*1.3);g.stroke();g.beginPath();g.arc(x+r*.1,y+r*.1,r*.28,0,Math.PI*1.4);g.stroke();g.restore();el(g,x-r*.35,y-r*.42,r*.35,r*.16,c.L)}
function h3Tail(g,c,x,y,len,w,dx,wave){g.beginPath();const n=12,P=[],Q=[];const C=t=>[x+dx*t*t+(wave?Math.sin(t*Math.PI*2.5)*2.4*t:0),y+len*t],HW=t=>w*(.62+.42*Math.sin(Math.min(1,t*1.15)*Math.PI*.85))*(1-.62*t);
  for(let k=0;k<=n;k++){const t=k/n,[cx,cy]=C(t),hw=HW(t);P.push([cx-hw,cy]);Q.push([cx+hw,cy])}
  const sm=A=>{for(let k=1;k<A.length-1;k++)g.quadraticCurveTo(A[k][0],A[k][1],(A[k][0]+A[k+1][0])/2,(A[k][1]+A[k+1][1])/2);g.lineTo(A[A.length-1][0],A[A.length-1][1])};
  g.moveTo(P[0][0],P[0][1]);sm(P);const e=C(1);g.quadraticCurveTo(e[0],e[1]+5,Q[n][0],Q[n][1]);sm(Q.slice().reverse());g.closePath();
  fillClip(g,c.H,()=>{g.save();g.lineCap='round';for(const f of [-.45,0,.45]){g.globalAlpha=.3;g.strokeStyle=c.D;g.lineWidth=.9;g.beginPath();for(let k=0;k<=n;k++){const t=k/n,[cx,cy]=C(t);k?g.lineTo(cx+f*HW(t),cy):g.moveTo(cx+f*HW(t),cy+2)}g.stroke()}
    g.globalAlpha=.3;g.strokeStyle=c.L;g.lineWidth=1.3;g.beginPath();for(let k=1;k<n;k++){const t=k/n,[cx,cy]=C(t);k>1?g.lineTo(cx-.25*HW(t),cy):g.moveTo(cx-.25*HW(t),cy)}g.stroke();g.restore()})}
function h3Braid(g,c,x0,y0,x1,y1){const n=8;for(let k=0;k<n;k++){const t=k/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t,w=5.4-t*1.4;el(g,x+(k%2?1:-1),y,w,4,k%2?c.B:mix(c.B,'#000',.08));g.save();g.globalAlpha=.4;ln(g,x-w*.6,y-1,x+w*.6,y+1.4,c.D,.7);g.restore()}
  el(g,x1,y1+4,2.6,2,c.T);for(let k=0;k<3;k++)ln(g,x1,y1+5,x1-2+k*2,y1+10,c.B,1.6)}
function h3Extra(g,p,c,S,view,q,X){q=q||0;X=X||((s,x)=>s*x+q);const x=S.x,v=S.v||0;
  if(view==='behind'){/* 정면에서 몸 뒤로 보이는 것 */
    if(x==='pony')h3Tail(g,c,24,-120,56,8,8,false);
    if(x==='wpony')h3Tail(g,c,24,-118,64,9,8,true);
    if(x==='sidepony')h3Tail(g,c,-23,-90,40,6.6,5,true);
    if(x==='braids')for(const s of [-1,1]){g.beginPath();g.moveTo(s*17,-104);g.quadraticCurveTo(s*25,-103,s*24.6,-92);g.lineTo(s*19.6,-90);g.closePath();g.fillStyle=c.H;g.fill();h3Braid(g,c,s*21.8,-92,s*16.6,-60)}
    if(x==='hipony'){g.beginPath();g.moveTo(-20,-116);g.bezierCurveTo(-33,-104,-34,-60,-28,-42);tipsTo(g,[[-28,-42],[-18,-38],[-6,-40],[6,-38],[18,-40],[28,-42]],2,true);g.bezierCurveTo(34,-60,33,-104,20,-116);g.closePath();fillClip(g,c.H,()=>waveLines(g,c,[-24,-16,-8,0,8,16,24],-112,-42,2))}
    if(x==='halfbun'){}
    return}
  if(view==='front'){
    if(x==='bun')h3Bun(g,c,q,-130-v,10);
    if(x==='buns')for(const s of [-1,1])h3Bun(g,c,s*14.6+q,-125,8.4);
    if(x==='hipony'){g.beginPath();g.moveTo(q-10,-117-v);g.bezierCurveTo(q-17,-143-v,q+9,-152-v,q+16,-135-v);g.bezierCurveTo(q+19,-127-v,q+13,-120-v,q+9,-117-v);g.closePath();fillClip(g,c.B,()=>waveLines(g,c,[q-6,q,q+6],-148-v,-118,1.4));el(g,q,-119-v,5,2.6,c.T)}
    if(x==='sidepony')el(g,X(-1,23.2),-88.6,3.4,2.6,c.T);
    if(x==='pony'||x==='wpony')el(g,19.4+q,-118.6,3.6,2.8,c.T);
    return}
  if(view==='sideB'){/* 옆모습: 머리 뒤쪽으로 처지는 것(머리보다 먼저) */
    if(x==='pony')h3Tail(g,c,-24,-121,58,8,-6,false);
    if(x==='wpony')h3Tail(g,c,-24,-119,64,9,-6,true);
    if(x==='hipony'){/* 정수리 볼륨: 이마 위에서 부풀어 뒤쪽 묶은 곳으로 */g.beginPath();g.moveTo(16,-120);g.bezierCurveTo(10,-142,-12,-146,-18,-129);g.quadraticCurveTo(-4,-124,16,-120);g.closePath();fillClip(g,c.H,()=>waveLines(g,c,[6,-2,-10],-142,-124,.8));}
    if(x==='hipony'){/* 정수리 뒤 묶은 곳에서 위로 솟았다가 뒤로 넘어가는 꽁지 + 등으로 흘러내리는 웨이브 */
      g.beginPath();g.moveTo(-6,-128);g.bezierCurveTo(-34,-124,-37,-76,-31,-42);tipsTo(g,[[-31,-42],[-24,-38],[-17,-40],[-10,-38.6],[-4,-43]],2,true);g.bezierCurveTo(-2,-70,-4,-100,-2,-122);g.closePath();fillClip(g,c.H,()=>waveLines(g,c,[-28,-22,-16,-10],-120,-42,2));
}
    if(x==='bun')h3Bun(g,c,-11,-130-v,10);
    if(x==='buns'){h3Bun(g,c,-7,-133,7.4);h3Bun(g,c,-14,-127,8.4)}
    return}
  if(view==='side'){
    if(x==='hipony')el(g,-15,-128.4,4.4,2.8,c.T,-.6);
    if(x==='pony'||x==='wpony')el(g,-22,-121,3,3.4,c.T);
    if(x==='braids'){g.beginPath();g.moveTo(-9,-100);g.quadraticCurveTo(-4,-98,-4.4,-90);g.lineTo(-9.4,-88);g.quadraticCurveTo(-12,-94,-9,-100);g.fillStyle=c.B;g.fill();h3Braid(g,c,-7,-90,-11,-54)}
    if(x==='sidepony'){g.beginPath();g.moveTo(-9,-100);g.quadraticCurveTo(-4,-98,-4.4,-90);g.lineTo(-9.4,-88);g.quadraticCurveTo(-12,-94,-9,-100);g.fillStyle=c.H;g.fill();h3Tail(g,c,-7.4,-91,42,6.6,-6,true);el(g,-7.2,-90.4,3.6,2.6,c.T)}
    return}
  if(view==='rear'){
    if(x==='bun')h3Bun(g,c,0,-128-v,10.4);
    if(x==='buns')for(const s of [-1,1])h3Bun(g,c,s*14.6,-123,8.6);
    if(x==='pony'){el(g,0,-117,5,3.2,c.T);h3Tail(g,c,0,-115,54,7.4,0,false)}
    if(x==='wpony'){el(g,0,-117,5,3.2,c.T);h3Tail(g,c,0,-115,62,8.4,0,true)}
    if(x==='hipony'){g.beginPath();g.moveTo(-10,-117-v);g.bezierCurveTo(-16,-142-v,10,-150-v,16,-133-v);g.bezierCurveTo(19,-125-v,13,-119-v,9,-117-v);g.closePath();fillClip(g,c.B,()=>waveLines(g,c,[-6,0,6],-148-v,-118,1.4));el(g,0,-120-v,5.4,3,c.T);
      g.beginPath();g.moveTo(-12,-118);g.bezierCurveTo(-30,-100,-31,-60,-26,-40);tipsTo(g,[[-26,-40],[-14,-36],[0,-38],[14,-36],[26,-40]],2,true);g.bezierCurveTo(31,-60,30,-100,12,-118);g.closePath();fillClip(g,c.H,()=>waveLines(g,c,[-20,-12,-4,4,12,20],-114,-40,2))}
    if(x==='braids')for(const s of [-1,1])h3Braid(g,c,s*15,-92,s*17,-56);
    if(x==='sidepony'){el(g,18.6,-96,4,3.2,c.T);h3Tail(g,c,19.6,-94,38,6.4,3,true)}
    return}}
/* 반묶음(긴 머리 위에 작은 묶음) */
function h3HalfBun(g,c,view){if(view==='rear'){h3Bun(g,c,0,-112,7.6);el(g,0,-105.4,4.4,1.6,c.T)}else if(view==='side')h3Bun(g,c,-20,-114,7)}

/* ---------- 끼워 넣기 ---------- */
function h3Spec(p){const S=p.h3&&H3SPEC[p.h3];H3RING=!!(S&&S.ringlet);return S}
{const _b=hair2Behind,_f=hair2Front,_s=hair2Side,_sb=hair2SideBehind,_r=hair2Rear;
 hair2Behind=function(g,p,H,hx,t,bob){const S=h3Spec(p);if(!S)return _b.apply(this,arguments);g.save();g.translate(0,-bob);const c=h3Cols(g,p);
   if(S.M==='long')h3LongBehind(g,p,c,S,hx);else if(S.M==='tied'){g.translate(hx,0);h3Extra(g,p,c,S,'behind')}g.restore()};
 hair2Front=function(g,p,H,HL,hx,t,f){const S=h3Spec(p);if(!S)return _f.apply(this,arguments);g.save();g.translate(hx,0);const c=h3Cols(g,p);
   if(S.M==='short')h3MaleFront(g,p,c,S,t*5);else if(S.M==='tied')h3TiedFront(g,p,c,S,t*5);else if(S.ears)h3TiedFront(g,p,c,{...S,x:null,noWisp:1},t*5);else h3LongFront(g,p,c,S,t*5);g.restore()};
 hair2Side=function(g,p,H,HL,bob,slim){const S=h3Spec(p);if(!S)return _s.apply(this,arguments);const c=h3Cols(g,p);
   if(S.M==='short')h3MaleSide(g,p,c,S);else if(S.M==='tied')h3TiedSide(g,p,c,S);else{if(S.ears||(H3V.flip&&S.yL>=-76))h3TuckSide(g,p,c,S);else h3LongSide(g,p,c,S);if(S.x==='halfbun')h3HalfBun(g,c,'side')}};
 hair2SideBehind=function(g,p,H,bob,hs){const S=h3Spec(p);if(!S)return _sb.apply(this,arguments);g.save();g.translate(0,-bob);const c=h3Cols(g,p);
   if(S.M!=='long'||S.yL>-80)rr(g,-9.4,-90,12.4,20,4,p.skinSh); /* 옆모습 목 */
   if(S.M==='long')h3LongSideBehind(g,p,c,S);g.restore()};
 hair2Rear=function(g,p,H,HL,hx,t){const S=h3Spec(p);if(!S)return _r.apply(this,arguments);const c=h3Cols(g,p);
   if(S.M==='short')h3MaleRear(g,p,c,S,hx);else if(S.M==='tied')h3TiedRear(g,p,c,S,hx);else{h3LongRear(g,p,c,S,hx);if(S.x==='halfbun'){g.save();g.translate(hx,0);h3HalfBun(g,c,'rear');g.restore()}}};}
