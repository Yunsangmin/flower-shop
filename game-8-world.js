'use strict';
/* 우리 둘의 꽃집 — 8-world.js : 장소 그림·가구·장식·반복·시작
   (파일은 index.html 에 적힌 순서대로 불러와요. 앞 파일의 함수·변수를 뒤 파일이 이어서 씀) */
/* ---------- canvas ---------- */
const DARK=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):{matches:false};
const canvas=$('#game');const ctx=canvas.getContext('2d');
let CW=0,CH=0,DPR=1,BG_CACHE={};
let LITE=false,RENDER_SCALE=1,VIEW=null,VIEWS=null,FRAME=0; // VIEWS: 같은 장소를 두 화면이 따로 볼 때 각 화면 범위
function applyGfx(){const tv=/Web0S|webOS|SmartTV|SMART-TV|NetCast|HbbTV/i.test(navigator.userAgent);LITE=SET.gfx==='lite'||(SET.gfx==='auto'&&tv);resize()}
function resize(){CW=innerWidth;CH=innerHeight;const dpr=window.devicePixelRatio||1;DPR=PR.on?prResolution():LITE?Math.min(dpr,1100/Math.max(CW,1)):Math.min(2,dpr);canvas.width=Math.round(CW*DPR);canvas.height=Math.round(CH*DPR);BG_CACHE={};if(PR.on){PR.ovDirty=true;prResize()}}
addEventListener('resize',resize);applyGfx();
// 글꼴(주아)이 늦게 도착하면 글씨가 든 그림(간판·가격표 등)을 새 글꼴로 다시 굽기
function fontRefresh(){BG_CACHE={};try{if(PR.on&&PR.sc){for(const r of PR.recs.values())r.sig=null;prDropTex(k=>k.startsWith('pill|'))}}catch(_){}}
try{if(document.fonts){document.fonts.ready.then(fontRefresh);document.fonts.load("20px 'Jua'").then(fontRefresh).catch(()=>{})}}catch(_){}
function shadow(g,x,y,rx,ry){el(g,x,y,rx,ry,'rgba(90,60,40,.13)')}
function tableV(g,x,y,w,top,front){shadow(g,x+w/2,y+19,w/2,2.2);rr(g,x,y+7,w,6,1.5,front||CO.woodD);rr(g,x,y,w,9,1.8,top||CO.top);g.fillStyle=CO.woodL;g.fillRect(x+1.5,y+.8,w-3,1);g.fillStyle=CO.woodD;g.fillRect(x+2,y+13,2.5,6);g.fillRect(x+w-4.5,y+13,2.5,6)}
function vaseFlowers(g,x,y,sc,types){types.forEach((t,j)=>{const a=(j-(types.length-1)/2)*.35;ln(g,x,y,x+Math.sin(a)*6*sc,y-8*sc,CO.leafD,.5*sc);flowerHead(g,t,x+Math.sin(a)*6*sc,y-8*sc-(j%2)*1.5*sc,3.2*sc,100)})}
function leafyBlob(g,x,y,r,c1,c2){el(g,x,y,r,r*.8,c1);el(g,x-r*.45,y-r*.35,r*.55,r*.45,c2);el(g,x+r*.5,y-r*.1,r*.5,r*.4,c2)}

/* ---------- stations ---------- */
function drawStationV(g,s){
  const x=s.x*TILE,y=s.y*TILE,w=s.w*TILE,h=s.h*TILE,t=S.t;
  switch(s.type){
    case 'storage':{
      shadow(g,x+w/2,y+17,w/2,2.4);
      rr(g,x,y-28,w,46,3,'#8FB3D4');rr(g,x+1.5,y-26.5,w-3,43,2,'#A9C8E2');rr(g,x+3,y-23,w-6,32,1.5,'#E4F3FA');
      g.fillStyle='#FFFFFF';g.fillRect(x+3,y-27.5,w-6,2.2);
      const items=s.slots.filter(Boolean);
      [y-12,y-1.5,y+9].forEach((sy,r)=>{g.fillStyle='#BCD3E4';g.fillRect(x+3,sy,w-6,1.1);
        for(let k=0;k<3;k++){const it=items[r*3+k];const bx=x+7+k*9;if(it){const f=avg(it.stems.map(q=>q.f));for(let j=0;j<3;j++){ln(g,bx-1.5+j*1.5,sy,bx-2+j*2,sy-6-(j%2),CO.leafD,.5);flowerHead(g,it.t,bx-2+j*2,sy-6-(j%2),2.8,f)}}rr(g,bx-3.2,sy-3.5,6.4,3.6,.8,'#C5D6E3')}});
      g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x+4,y-22,1.6,30);g.fillRect(x+7,y-22,.8,30);
      rr(g,x+w-5.5,y-15,1.8,11,.8,'#6E8FAE');rr(g,x+2,y+15,w-4,3,1,'#6E8FAE');
      const cx=x+w/2,cy=y-31.5;el(g,cx,cy,4.4,4.4,'#FFFFFF');for(let k=0;k<3;k++){const a=k*Math.PI/3;ln(g,cx-Math.cos(a)*2.8,cy-Math.sin(a)*2.8,cx+Math.cos(a)*2.8,cy+Math.sin(a)*2.8,'#7FB0D6',.7)}
      if(BAKE&&BAKE.fx)BAKE.fx.push({k:'shim',x,y,w});else{const tt=NOW()/900;g.globalAlpha=.35;el(g,x+6+Math.sin(tt)*2,y+19,3,1.2,'#FFFFFF');el(g,x+w-8+Math.cos(tt)*2,y+19.5,2.5,1,'#FFFFFF');g.globalAlpha=1}
      if(S.up.fridge){g.fillStyle='rgba(160,215,235,.22)';g.fillRect(x+3,y-23,w-6,32);el(g,x+w-4,y-26,1.1,1.1,'#7FD0E8')}
      break;}
    case 'trim':{
      const r=seedRand(21);shadow(g,x+w/2,y+16,w/2,2.4);
      for(let k=0;k<26;k++){const fx=x+3+r()*(w-22),fy=y-2-r()*8;ln(g,fx,y+4,fx+(r()-.5)*2,fy,CO.leafD,.5)}
      for(let k=0;k<12;k++)el(g,x+3+r()*(w-22),y+1-r()*5,3+r()*2,2+r(),r()<.5?CO.leaf:CO.leafL,r()*2);
      for(let k=0;k<18;k++){const tp=['tulip','freesia','gyp','tulip'][k%4];flowerHead(g,tp,x+3+r()*(w-22),y-2-r()*8,3.4,100)}
      rr(g,x,y+3,w,12,2,CO.wood);g.fillStyle=CO.woodL;g.fillRect(x+1,y+3.5,w-2,1.4);for(let k=8;k<w;k+=12){g.fillStyle=CO.woodD;g.fillRect(x+k,y+5,.8,9)}
      for(let k=0;k<5;k++){const vx=x+6+k*16;ln(g,vx,y+4,vx+2,y+11,CO.leafD,.5);el(g,vx+2,y+11,1.6,1,CO.leaf,.5)}
      const mx=x+w-18;rr(g,mx,y-3,16,7,1.5,'#8FC49A');g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=.35;for(let k=3;k<16;k+=3.5){g.beginPath();g.moveTo(mx+k,y-2.8);g.lineTo(mx+k,y+3.8);g.stroke()}
      ln(g,mx+3,y+2.6,mx+12,y-2,'#C9D2D8',1.2);ln(g,mx+3,y-1.8,mx+12,y+2.8,'#AFBAC2',1.2);const hc=S.up.scissors?'#E1B656':'#E8708E';g.strokeStyle=hc;g.lineWidth=1.1;g.beginPath();g.arc(mx+2,y+3.4,1.5,0,7);g.stroke();g.beginPath();g.arc(mx+2,y-2.6,1.5,0,7);g.stroke();
      el(g,mx+14,y+1,1.6,.7,CO.leaf,.4);el(g,mx+8,y+3.6,1.4,.6,CO.leafD,-.3);
      break;}
    case 'wardrobe':{
      shadow(g,x+w/2,y+17,w/2,2.4);rr(g,x+1,y-30,w-2,46,3,'#C9A07A');rr(g,x+2.5,y-28,w-5,42,2,'#E7C9A6');
      g.fillStyle='#C9A07A';g.fillRect(x+w/2-.6,y-28,1.2,42);[x+w/2-3,x+w/2+2].forEach(hx=>rr(g,hx,y-10,1.2,5,.6,'#9C6B4C'));
      [[x+5,y-24],[x+w/2+4,y-24]].forEach(([px,py])=>{g.strokeStyle='#B98A63';g.lineWidth=.6;g.strokeRect(px,py,w/2-9,12);g.strokeRect(px,py+16,w/2-9,10)});
      poly(g,[x+w/2-9,y-36,x+w/2+9,y-36,x+w/2+7,y-30,x+w/2-7,y-30],'#9C6B4C');el(g,x+w/2,y-37,2,1.4,'#E1B656');
      rr(g,x-2,y-22,4,10,1.5,'#F4B6C4');ln(g,x,y-22,x,y-26,'#8A7B74',.5);
      break;}
    case 'sprspot':{
      if(!s.on)break;shadow(g,x+8,y+14,4,1.2);g.fillStyle='#8E9CA6';g.fillRect(x+7,y+2,2,12);el(g,x+8,y+2,3.2,1.8,'#BCC7CF');el(g,x+8,y+1.4,1.4,1.4,'#6E8FAE');
      const since=(NOW()-(s.sprayAt||0))/1000;if(S.t<20||since<3){const tt=NOW()/300;for(let k=0;k<10;k++){const a=tt+k*Math.PI/5,rr2=6+((tt*8+k*3)%18);el(g,x+8+Math.cos(a)*rr2,y+2+Math.sin(a)*rr2*.55-2,.7,1.1,'#7FB8E6')}}
      break;}
    case 'bucket':{
      shadow(g,x+8,y+15,6.5,1.6);const its=s.slots.filter(Boolean);
      its.forEach((it,ii)=>{const n=Math.min(4,it.stems.length),f=avg(it.stems.map(q=>q.f)),sc=mix('#6E9A5A','#9C8B62',wither(f)),ox=ii?4:-2;
        for(let j=0;j<n;j++)ln(g,x+7+ox+j*.8,y+4,x+4.5+ox+j*2.2,y-9-(j%2)*2-ii*2,sc,.6);
        if(it.t==='tulip')ln(g,x+5+ox,y+2,x+2.5+ox,y-4,CO.leaf,1.3);
        for(let j=0;j<n;j++)flowerHead(g,it.t,x+4.5+ox+j*2.2,y-9-(j%2)*2-ii*2,4,it.stems[j].f)});
      poly(g,[x+1,y+3,x+15,y+3,x+13.4,y+15,x+2.6,y+15],'#B4C2CC');g.fillStyle='#98A8B3';g.fillRect(x+1.8,y+7,12.4,1);g.fillRect(x+2.4,y+12,11.2,1);
      g.fillStyle='#E6EDF1';g.fillRect(x+3.2,y+3.5,1.6,11);el(g,x+8,y+3,7,1.5,'#8E9CA6');el(g,x+8,y+3,6,1,'#8CC3E6');el(g,x+6,y+2.8,1.8,.35,'#D6ECF8');
      el(g,x+8,y+9.5,1.6,2,'#7FB8E6');poly(g,[x+6.6,y+9,x+9.4,y+9,x+8,y+6.4],'#7FB8E6');
      if(its.length&&avg(its.map(it=>avg(it.stems.map(q=>q.hyd||0))))>=.99){wetSparkle(g,x+5,y-12,4);wetSparkle(g,x+11,y-8,3)}
      break;}
    case 'craft':{
      tableV(g,x,y-2,w,'#F6D5DC','#C98E9C');g.fillStyle='#FBE6EA';g.fillRect(x+1.5,y-1.2,w-3,1);
      const W=S.works[s.id];
      if(s.id==='craft'){const by={};S.bench.forEach(q=>(by[q.t]=by[q.t]||[]).push(q));let k=0;
        TYPES.forEach(tp=>{const a=by[tp]||[];const n=Math.min(3,Math.ceil(a.length/2));const f=avg(a.map(q=>q.f));
          for(let j=0;j<n;j++){const bx=x+2+k*2.4,byy=y+5-(k%2);ln(g,bx,byy,bx+4,byy-4,CO.leafD,.6);flowerHead(g,tp,bx+4.5,byy-4.5,3,f);k++}})}
      if(W.stems.length){const ws=W.stems;for(let j=0;j<Math.min(7,ws.length);j++)ln(g,x+w-4,y+6,x+w-13+j*1.3,y-3-(j%2),CO.leafD,.5);ws.slice(0,9).forEach((q,j)=>flowerHead(g,q.t,x+w-14+(j%5)*1.8,y-3-Math.floor(j/5)*2.2-(j%2)*.8,3,q.f))}
      else{el(g,x+w-7,y+2.5,4,2.2,'#7FA86A');for(let k=0;k<5;k++)el(g,x+w-9+k*1.1,y+1.8,.35,.35,'#4E7A40')}
      el(g,x+w/2+1,y+3.5,2.6,2.2,CO.twine);el(g,x+w/2+1,y+3.5,1,1,'#7E6040');ln(g,x+w/2+3.5,y+3.5,x+w/2+6,y+5.5,CO.twine,.5);
      break;}
    case 'wrap':{
      const ps=['#F4B6C4','#F6DC86','#EFE4D2','#B9D6F0','#D6C6EC'].concat(S.up.papers2?['#BFE3D0','#F6B7A0','#D8B994']:[]);
      g.fillStyle=CO.woodD;g.fillRect(x+1.5,y-22,1.6,22);g.fillRect(x+w-3.1,y-22,1.6,22);rr(g,x+.5,y-23,w-1,2.2,1,CO.wood);
      ps.forEach((c,k)=>{const px=x+3.5+k*((w-7)/ps.length);rr(g,px,y-21,(w-7)/ps.length-.6,15+(k%2)*2,1.2,c);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(px+.5,y-21,.8,15)});
      poly(g,[x+6,y-6,x+13,y-6,x+14,y-1,x+5,y-1],ps[0]);
      tableV(g,x,y-2,w,'#FBF3E6','#C9A77E');poly(g,[x+4,y+.5,x+15,y-.5,x+17,y+5,x+6,y+6],'#FBDDE4');ln(g,x+5,y+1.5,x+16,y+4.5,'rgba(224,143,164,.5)',.4);
      [[x+22,CO.ribbon],[x+26.5,CO.pink]].concat(S.up.ribbons2?[[x+24,'#B9A2E0']]:[]).forEach(([rx,c])=>{el(g,rx,y+2.5,2.3,2.3,c);el(g,rx,y+2.5,.8,.8,CO.woodD)});
      break;}
    case 'dryer':{
      shadow(g,x+w/2,y+16,w/2,2);
      g.fillStyle=CO.woodD;g.fillRect(x+2,y-26,2,42);g.fillRect(x+w-4,y-26,2,42);rr(g,x+1,y-27,w-2,2.5,1,CO.wood);rr(g,x+1,y+9,w-2,3,1,CO.woodL);
      const hang=(hx,t,dried,n)=>{ln(g,hx,y-25,hx,y-21,CO.twine,.5);el(g,hx,y-21,1.2,.8,CO.twine);for(let j=0;j<n;j++){const dx=(j-(n-1)/2)*1.6;ln(g,hx,y-21,hx+dx,y-11,dried?'#A89A6E':CO.leafD,.5);flowerHead(g,t,hx+dx,y-10,3,dried?50:80,dried)}};
      hang(x+7,'gyp',true,3);
      s.slots.forEach((it,k)=>{if(!it)return;const hx=x+14+k*7;hang(hx,it.t,!!it.dried,Math.min(4,it.stems.length));
        if(!it.dried){const p=clamp((it.dryT||0)/DRY_MIN,0,1);g.lineCap='round';g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.6;g.beginPath();g.arc(hx,y-31,2.6,0,7);g.stroke();g.strokeStyle='#D8B36A';g.lineWidth=1.1;g.beginPath();g.arc(hx,y-31,2.6,-Math.PI/2,-Math.PI/2+Math.PI*2*p);g.stroke()}});
      if(!s.slots.some(Boolean))hang(x+25,'tulip',true,2);
      break;}
    case 'shelf':{
      shadow(g,x+8,y+15,7,1.6);rr(g,x+1,y-8,14,22,1.5,'#B98463');rr(g,x+2.5,y-6.5,11,9,1,'#E9D3B6');rr(g,x+2.5,y+4,11,8,1,'#E9D3B6');
      [y-2,y+9].forEach(by=>{rr(g,x+3.5,by-1,9,4,1.2,'#D6B27A');g.strokeStyle='#B58E57';g.lineWidth=.35;for(let k=0;k<4;k++){g.beginPath();g.moveTo(x+4.5+k*2.2,by-1);g.lineTo(x+4.5+k*2.2,by+3);g.stroke()}});
      s.slots.forEach((it,k)=>{if(it)drawItemV(g,it,x+8,k?y+8:y-3)});
      break;}
    case 'board':{shadow(g,x+8,y+16,6,1.6);g.fillStyle=CO.woodD;g.fillRect(x+3,y+4,1.4,12);g.fillRect(x+11.6,y+4,1.4,12);rr(g,x+1.5,y-10,13,15,1.5,CO.wood);rr(g,x+2.5,y-9,11,13,1,CO.cork);
      [[3.5,-8,4,4,'#FFF8EE'],[8.5,-7.5,4,3.5,CO.pinkL],[4,-2.5,5,3.5,'#FFF1C4'],[10,-2,3,3,'#FFF8EE']].forEach(([a,b,c,d,col])=>{g.fillStyle=col;g.fillRect(x+a,y+b,c,d);el(g,x+a+c/2,y+b+.4,.5,.5,CO.pinkD)});break}
    case 'trash':{shadow(g,x+8,y+15,5,1.4);poly(g,[x+3,y+2,x+13,y+2,x+12,y+15,x+4,y+15],CO.mint);rr(g,x+2,y+1,12,2,1,'#8FB3A2');ln(g,x+6,y+5,x+6.3,y+13,'#94BBA8',.7);ln(g,x+10,y+5,x+9.7,y+13,'#94BBA8',.7);el(g,x+7,y+.5,2,.7,CO.leaf,.4);break}
    case 'counter':{
      shadow(g,x+w/2,y+17,w/2,2.4);
      rr(g,x,y+4,w,12,2,'#D9B48E');for(let k=4;k<w-2;k+=5){g.fillStyle='#C99E78';g.fillRect(x+k,y+6,.8,9)}
      rr(g,x,y-2,w,8,2,'#F0DCC2');g.fillStyle='#FAEBD7';g.fillRect(x+1.5,y-1.2,w-3,1.2);
      rr(g,x+4,y-6,11,7,1.5,CO.metalD);rr(g,x+5.5,y-5,8,3,.8,'#BFE3D0');g.fillStyle=CO.metal;g.fillRect(x+5,y-1.5,9,1.2);
      el(g,x+22,y+1,2.6,1.6,CO.ribbon);el(g,x+22,y-.2,.7,.7,CO.woodD);
      rr(g,x+36,y-4,5,6,1.8,'#FFF8EE');vaseFlowers(g,x+38.5,y-3,.7,['tulip','gyp','tulip']);
      rr(g,x+52,y-5,8,7,1,'#E8D2B4');g.fillStyle='#D2B58F';g.fillRect(x+52,y-5,8,1.2);rr(g,x+62,y-4,7,6,1,'#F4B6C4');
      signBoard(g,x+w/2,y+10.5,S.shopName,{size:5,min:36,pad:8});
      s.slots.forEach((b,k)=>{if(b)drawItemV(g,b,x+w-8-k*8,y-1)});
      break;}
    case 'phone':{
      const ring=ringingCall();const j=ring?Math.sin(NOW()/35)*.8:0;shadow(g,x+8,y+15,5,1.4);
      rr(g,x+3,y+4,10,4,1.5,CO.woodL);g.fillStyle=CO.woodD;g.fillRect(x+7,y+8,2,7);rr(g,x+4.5,y+14,7,1.5,.6,CO.woodD);
      rr(g,x+4+j,y-1,8,5.5,2,'#F2B5C0');rr(g,x+3.5+j,y-3,9,2.4,1.2,'#E68FA5');el(g,x+8+j,y+1.6,1.8,1.8,'#FFF8EE');
      if(ring&&Math.floor(NOW()/300)%2){ln(g,x+14,y-4,x+16,y-6,CO.ink,.7);ln(g,x+14.5,y-1.5,x+17,y-2,CO.ink,.7);ln(g,x+2,y-4,x,y-6,CO.ink,.7)}
      break;}
    case 'pickup':{
      shadow(g,x+w/2,y+16,w/2,2);rr(g,x+1,y-4,w-2,4,1.5,'#E9D3B6');rr(g,x+2,y,w-4,11,1.5,'#C99873');g.fillStyle='#B8845F';g.fillRect(x+w/2-.5,y,1,11);
      rr(g,x+w/2-5,y-10,10,6,1.5,'#FFF8EE');el(g,x+w/2-2,y-7,1.3,1.3,CO.pink);el(g,x+w/2+1.5,y-7,1.3,1.3,CO.pink);poly(g,[x+w/2-3.2,y-6.6,x+w/2+2.7,y-6.6,x+w/2-.2,y-4.2],CO.pink);
      s.slots.forEach((b,k)=>{if(b)drawItemV(g,b,x+8+k*16,y+2)});
      break;}
    case 'display':{
      shadow(g,x+w/2,y+17,w/2,2.4);
      rr(g,x+1,y-8,w-2,6,1.5,CO.woodD);rr(g,x+1,y+2,w-2,7,1.5,CO.wood);g.fillStyle=CO.woodL;g.fillRect(x+2,y-8,w-4,1);g.fillRect(x+2,y+2,w-4,1);
      g.fillStyle=CO.woodD;g.fillRect(x+2,y+9,2,7);g.fillRect(x+w-4,y+9,2,7);
      const groups=s.slots.filter(Boolean).map(b=>({tp:b.t,d:!!b.dried,a:b.stems}));
      const slots=[[x+6,y-8],[x+18,y-8],[x+30,y-8],[x+42,y-8],[x+10,y+2],[x+24,y+2],[x+38,y+2]];
      slots.forEach(([bx,by],k)=>{const gr=groups[k];
        if(gr){const n=Math.min(5,Math.ceil(gr.a.length/1.5));const f=avg(gr.a.map(q=>q.f));for(let j=0;j<n;j++){ln(g,bx-2+j,by,bx-3+j*1.6,by-7-(j%2)*1.5,gr.d?'#A89A6E':CO.leafD,.5);flowerHead(g,gr.tp,bx-3+j*1.6,by-7-(j%2)*1.5,3.4,f,gr.d)}}
        poly(g,[bx-4,by-2,bx+4,by-2,bx+3.3,by+3,bx-3.3,by+3],k%2?CO.metal:'#D98E6C');el(g,bx,by-2,4,.9,k%2?CO.metalD:'#C07A5A');
      });
      break;}
    case 'stall':{
      const closed=t>=MARKET_CLOSE;const aw={tulip:'#F4B6C4',freesia:'#F6DC86',gyp:'#BFE3D0',rose:'#E7A3AE',hydrangea:'#BFD0F0'}[s.flower];
      g.fillStyle=CO.woodD;g.fillRect(x+1,y-24,1.6,26);g.fillRect(x+w-2.6,y-24,1.6,26);
      if(!closed)drawChar(g,x+w/2,y+3,VENDORS[s.flower],'down',0,false,false);
      if(closed){rr(g,x,y-24,w,4,1.5,aw)}else{for(let k=0;k<w;k+=6){g.fillStyle=(k/6)%2?CO.white:aw;g.fillRect(x+k,y-24,6,9);el(g,x+k+3,y-15,3,2,(k/6)%2?CO.white:aw)}}
      tableV(g,x,y,w,CO.woodL,CO.woodD);
      if(closed){rr(g,x+1,y-1,w-2,9,1.5,'#E8DCCB');for(let k=3;k<w-2;k+=5){g.fillStyle='#D9CAB4';g.fillRect(x+k,y,.8,7)}}
      else{for(let k=0;k<4;k++){const bx=x+6+k*11;for(let j=0;j<4;j++){ln(g,bx-1.5+j,y+1,bx-3+j*2,y-4-(j%2)*1.5,CO.leafD,.5);flowerHead(g,s.flower,bx-3+j*2,y-4-(j%2)*1.5,3.4,100)}rr(g,bx-4,y+.5,8,5,1,CO.metal);g.fillStyle=CO.metalD;g.fillRect(bx-4,y+4.5,8,.8)}}
      break;}
    case 'keeper':{
      drawChar(g,x+w/2,y+2,KEEPER,'down',0,false,true);
      shadow(g,x+w/2,y+17,w/2,2.4);rr(g,x,y+4,w,12,2,'#9CC7B3');for(let k=4;k<w-2;k+=6){g.fillStyle='#8AB8A3';g.fillRect(x+k,y+6,.8,9)}
      rr(g,x,y-1,w,7,2,'#E8F3EC');rr(g,x+4,y-6,10,7,1.5,CO.metalD);rr(g,x+5.5,y-5,7,3,.8,'#FFF1C4');
      rr(g,x+w-18,y-6,6,6,1.5,'#D98E6C');leafyBlob(g,x+w-15,y-8,3.5,'#7FAF6C','#A6D08F');
      el(g,x+w-6,y-2,3,2.2,'#9CC5D8');ln(g,x+w-3.5,y-3,x-1+w,y-6,'#9CC5D8',1);
      break;}
    case 'bench':{
      shadow(g,x+w/2,y+15,w/2,2);g.fillStyle=CO.woodD;g.fillRect(x+3,y+8,2,7);g.fillRect(x+w-5,y+8,2,7);
      rr(g,x+1,y-3,w-2,5,1.5,CO.wood);rr(g,x,y+4,w,5,1.5,CO.woodL);g.fillStyle=CO.wood;g.fillRect(x,y+8,w,1);
      break;}
    case 'plot':{
      const P=s.plot;rr(g,x+1,y+1,w-2,h-2,3,P&&P.watered?'#6A4631':'#8C6448');g.fillStyle=P&&P.watered?'#5A3A28':'#7A553B';for(let k=0;k<3;k++)g.fillRect(x+3,y+4+k*3.5,w-6,1);
      if(P&&P.watered){g.fillStyle='rgba(160,210,240,.18)';rr(g,x+1,y+1,w-2,h-2,3,'rgba(160,210,240,.18)')}
      if(P){const k=clamp(P.prog/GROW[P.t],0,1);[6,16,26].forEach((px,j)=>{const bx=x+px,byy=y+12;
        if(k<.34){ln(g,bx,byy,bx,byy-3,CO.leafD,.7);el(g,bx-1.3,byy-3.4,1.4,.7,CO.leafL,-.5);el(g,bx+1.3,byy-3.6,1.4,.7,CO.leaf,.5)}
        else if(k<.67){ln(g,bx,byy,bx,byy-7,CO.leafD,.8);el(g,bx-2,byy-4,2.4,1,CO.leaf,-.6);el(g,bx+2,byy-5.5,2.4,1,CO.leafL,.6);el(g,bx,byy-7.5,1.4,1.6,CO.leafL)}
        else if(k<1){ln(g,bx,byy,bx,byy-9,CO.leafD,.8);el(g,bx-2.2,byy-4,2.6,1,CO.leaf,-.6);el(g,bx+2.2,byy-6,2.6,1,CO.leafL,.6);el(g,bx,byy-10,1.6,2.4,mix(FL[P.t].dot,'#A6CF8C',.45))}
        else{ln(g,bx,byy,bx,byy-9,CO.leafD,.8);el(g,bx-2.2,byy-4,2.6,1,CO.leaf,-.6);flowerHead(g,P.t,bx,byy-10,4,100);if(j===1){const tw=Math.sin(NOW()/250);el(g,bx+5,byy-14+tw,.8,.8,'#FFF6C8')}}
      });
      if(P.wetAt){const d=(NOW()-P.wetAt)/1000;if(d>0&&d<1){for(let k=0;k<7;k++){const dx=x+3+k*4.3,dy=y-8+((d*30+k*5)%16);el(g,dx,dy,.7,1.2,'#7FB8E6')}}}}
      break;}
    case 'seedstall':{
      const closed=t>=MARKET_CLOSE;g.fillStyle=CO.woodD;g.fillRect(x+1,y-20,1.6,22);g.fillRect(x+w-2.6,y-20,1.6,22);
      for(let k=0;k<w;k+=6){g.fillStyle=(k/6)%2?'#FFFFFF':'#A6CF8C';g.fillRect(x+k,y-20,6,7);el(g,x+k+3,y-13,3,2,(k/6)%2?'#FFFFFF':'#A6CF8C')}
      if(!closed)drawChar(g,x+w/2,y+2,SEEDKEEPER,'down',0,false,false);
      tableV(g,x,y,w,'#E3D2B6','#9C7A5A');
      for(let k=0;k<6;k++){const px=x+5+k*7.2;poly(g,[px-2.8,y+.5,px+2.8,y+.5,px+2.2,y+5,px-2.2,y+5],'#5A4A44');ln(g,px,y+.5,px,y-3,CO.leafD,.6);el(g,px-1.5,y-3,1.6,.8,CO.leaf,-.5);el(g,px+1.5,y-3.5,1.6,.8,CO.leafL,.5);el(g,px,y-4.2,.9,.9,FL[TYPES[k%3]].dot==='#FFFFFF'?'#F1EEE8':FL[TYPES[k%3]].dot)}
      signBoard(g,x+w/2,y-24,'모종',{size:4,min:16,pad:6,line:'#7FAE68',fg:'#3F6B3C'});
      break;}
    case 'field':{
      g.fillStyle='#FFFFFF';g.fillRect(x+2,y+2,1.5,12);g.fillRect(x+w-3.5,y+2,1.5,12);
      for(let k=0;k<2;k++){rr(g,x+4+k*12,y+4,11,9,1,'#F7F1E6');g.fillStyle='#E8DCC8';g.fillRect(x+4+k*12,y+8,11,.8)}
      rr(g,x+w/2-5,y-6,10,7,1.5,'#FFF8EE');ln(g,x+w/2,y+1,x+w/2,y-2,CO.leafD,.8);el(g,x+w/2-2,y-3,2,1,CO.leaf,-.5);el(g,x+w/2+2,y-3.5,2,1,CO.leaf,.5);
      break;}
  }
}
const VENDORS={rose:{style:'m',hs:'short',hair:'#2E2A3A',hairHi:'#4A4458',skin:'#F1C9A5',skinSh:'#DBAA86',tee:'#E7A3AE',teeSh:'#C98490',pants:'#3E3E48',shoe:'#fff',num:'',acc:'glasses'},hydrangea:{style:'f',hs:'bob',hair:'#5A3A2E',hairHi:'#7A5A4E',skin:'#EBC3A0',skinSh:'#D3A284',tee:'#BFD0F0',teeSh:'#9CB0D6',pants:'#6E5B4B',shoe:'#fff',num:''},tulip:{style:'f',hair:'#6B4A3A',hairHi:'#8A6553',skin:'#F1C9A5',skinSh:'#DBAA86',tee:'#F4B6C4',teeSh:'#E08FA4',pants:'#5C6A8C',shoe:'#fff',num:''},freesia:{style:'m',hair:'#3B2A22',hairHi:'#5E4536',skin:'#EBC3A0',skinSh:'#D3A284',tee:'#F6DC86',teeSh:'#E2BD55',pants:'#6E5B4B',shoe:'#fff',num:''},gyp:{style:'f',hair:'#8A8A8A',hairHi:'#B0B0B0',skin:'#F4D3B7',skinSh:'#E0B597',tee:'#BFE3D0',teeSh:'#9CCBB4',pants:'#3E3E48',shoe:'#fff',num:''}};
const SEEDKEEPER={style:'f',hs:'bun',acc:'sunhat',expr:'grin',hair:'#6B4A3A',hairHi:'#8A6553',skin:'#EBC3A0',skinSh:'#D3A284',tee:'#C6D8A8',teeSh:'#A9C08A',pants:'#6E5B4B',shoe:'#fff',num:''};
const KEEPER={style:'m',hair:'#8A8A8A',hairHi:'#B5B5B5',skin:'#EBC3A0',skinSh:'#D3A284',tee:'#7FAF8E',teeSh:'#679A78',pants:'#4A4A55',shoe:'#fff',num:''};
function visRect(s){
  const X=s.x*TILE,Y=s.y*TILE,W=s.w*TILE,H=s.h*TILE;
  switch(s.type){
    case 'storage':return [X,Y-28,W,48];case 'dryer':return [X,Y-28,W,46];case 'wrap':return [X,Y-18,W,35];
    case 'bucket':{const has=s.slots.some(Boolean);return [X+.5,Y-(has?22:0),15,(has?22:0)+16]}
    case 'shelf':return [X+.5,Y-9,15,24];case 'board':return [X+1,Y-11,14,28];
    case 'stall':return [X,Y-25,W,44];case 'counter':return [X,Y-9,W,26];case 'trim':return [X,Y-11,W,28];case 'wardrobe':return [X,Y-38,W,56];case 'sprspot':return [X,Y-2,16,18];case 'display':return [X,Y-17,W,34];
    case 'pickup':return [X,Y-11,W,28];case 'keeper':return [X,Y-8,W,25];case 'plot':return [X,Y-12,W,28];case 'seedstall':return [X,Y-26,W,44];case 'bench':return [X,Y-5,W,21];case 'field':return [X,Y-7,W,22];
    default:return [X,Y-3,W,H+3];
  }
}

/* ---------- decor ---------- */
function drawDecor(g,d){
  const x=d.x*TILE,y=d.y*TILE,w=d.w*TILE,h=d.h*TILE;
  if(DECOR_DRAW[d.t]){DECOR_DRAW[d.t](g,d,x,y,w,h);return}
  switch(d.t){
    case 'planter':{
      const r=seedRand(21);shadow(g,x+w/2,y+16,w/2,2.4);
      for(let k=0;k<26;k++){const fx=x+3+r()*(w-6),fy=y-2-r()*8;ln(g,fx,y+4,fx+(r()-.5)*2,fy,CO.leafD,.5)}
      for(let k=0;k<14;k++)el(g,x+3+r()*(w-6),y+1-r()*5,3+r()*2,2+r(),r()<.5?CO.leaf:CO.leafL,r()*2);
      for(let k=0;k<22;k++){const tp=['tulip','freesia','gyp','tulip'][k%4];flowerHead(g,tp,x+3+r()*(w-6),y-2-r()*8,3.4,100)}
      rr(g,x,y+3,w,12,2,CO.wood);g.fillStyle=CO.woodL;g.fillRect(x+1,y+3.5,w-2,1.4);for(let k=8;k<w;k+=12){g.fillStyle=CO.woodD;g.fillRect(x+k,y+5,.8,9)}
      for(let k=0;k<6;k++){const vx=x+6+k*16;ln(g,vx,y+4,vx+2,y+11,CO.leafD,.5);el(g,vx+2,y+11,1.6,1,CO.leaf,.5);el(g,vx+.5,y+8,1.4,.9,CO.leafL,-.4)}
      break;}
    case 'table':{
      shadow(g,x+8,y+15,9,2.4);[[x-3,y+10],[x+19,y+10]].forEach(([sx,sy])=>{g.fillStyle=CO.woodD;g.fillRect(sx-1,sy,2,5);el(g,sx,sy,3.5,1.8,'#F4B6C4')});
      g.fillStyle=CO.woodD;g.fillRect(x+7,y+6,2,9);el(g,x+8,y+15,4,1.2,CO.woodD);el(g,x+8,y+5,9,4.5,CO.woodL);el(g,x+8,y+4.4,8,3.6,'#F4E6D2');
      rr(g,x+5.5,y-2,5,6,2,'#E3EEF5');vaseFlowers(g,x+8,y-1,.8,['tulip','freesia','tulip','gyp']);
      break;}
    case 'waitbench':{shadow(g,x+w/2,y+15,w/2,2);g.fillStyle=CO.woodD;g.fillRect(x+3,y+8,2,7);g.fillRect(x+w-5,y+8,2,7);rr(g,x+1,y-4,w-2,6,2,CO.wood);rr(g,x,y+3,w,6,2,CO.woodL);rr(g,x+2,y+1.5,12,4,2,'#F4B6C4');rr(g,x+w-14,y+1.5,12,4,2,'#BFE3D0');break}
    case 'bigplant':{shadow(g,x+8,y+15,6,1.6);poly(g,[x+3,y+5,x+13,y+5,x+12,y+15,x+4,y+15],'#D98E6C');g.fillStyle='#EAA888';g.fillRect(x+3,y+5,10,1.5);
      [[-.9,11],[-.3,14],[.3,13],[.9,11],[0,15]].forEach(([a,L],k)=>{const ex=x+8+Math.sin(a)*L,ey=y+5-Math.cos(a)*L;ln(g,x+8,y+5,ex,ey,CO.leafD,.7);el(g,ex,ey,4,2.6,k%2?'#6FA35E':'#86B96F',a)});break}
    case 'easel':{shadow(g,x+8,y+15,5,1.4);ln(g,x+4,y+15,x+7,y-8,CO.woodD,1.2);ln(g,x+12,y+15,x+9,y-8,CO.woodD,1.2);rr(g,x+2,y-8,12,11,1,'#3E4A45');g.strokeStyle=CO.woodL;g.lineWidth=.8;g.strokeRect(x+2,y-8,12,11);
      tulipV(g,x+6,y-2,2.4,0);ln(g,x+6,y-2,x+6,y+1.5,'#A6CF8C',.4);g.fillStyle='rgba(255,255,255,.7)';g.fillRect(x+9,y-5,3,.6);g.fillRect(x+9,y-3,3,.6);g.fillRect(x+9,y-1,2,.6);break}
    case 'crate':{shadow(g,x+8,y+15,7,1.6);for(let j=0;j<5;j++){ln(g,x+4+j*2,y+4,x+3+j*2.5,y-2,CO.leafD,.5);flowerHead(g,TYPES[j%3],x+3+j*2.5,y-2,3.2,100)}rr(g,x+1,y+3,14,11,1.5,CO.wood);g.fillStyle=CO.woodL;g.fillRect(x+1,y+3,14,1.2);g.fillStyle=CO.woodD;g.fillRect(x+1,y+8,14,.8);break}
    case 'planterTree':{shadow(g,x+8,y+15,6,1.6);rr(g,x+2,y+6,12,9,1.5,CO.wood);g.fillStyle=CO.woodD;g.fillRect(x+7,y-4,2,10);leafyBlob(g,x+8,y-8,7,'#7FAF6C','#A6D08F');el(g,x+5,y-10,1.2,1.2,CO.paperP);el(g,x+11,y-7,1.2,1.2,CO.yellow);break}
    case 'cart':{shadow(g,x+w/2,y+15,w/2,2);for(let j=0;j<9;j++){ln(g,x+5+j*2.6,y+2,x+4+j*2.8,y-5,CO.leafD,.5);flowerHead(g,TYPES[j%3],x+4+j*2.8,y-5-(j%2),3.4,100)}rr(g,x+2,y+1,w-4,9,2,'#E3A4A8');g.fillStyle='#F2C3C6';g.fillRect(x+3,y+2,w-6,1.5);
      [[x+7,y+13],[x+w-7,y+13]].forEach(([wx,wy])=>{el(g,wx,wy,3,3,CO.woodD);el(g,wx,wy,1.2,1.2,CO.woodL)});ln(g,x+w-2,y+3,x+w+3,y-2,CO.woodD,1);break}
    case 'tallshelf':{shadow(g,x+w/2,y+17,w/2,2);rr(g,x+1,y-26,w-2,42,1.5,CO.wood);
      [y-24,y-12,y].forEach((sy,r)=>{rr(g,x+2.5,sy,w-5,10,1,'#F4E6D2');for(let k=0;k<5;k++){const px=x+6+k*8.5;if(r===0){rr(g,px-2.5,sy+4,5,5,1,'#D98E6C');leafyBlob(g,px,sy+3,3,'#7FAF6C','#A6D08F')}else if(r===1){rr(g,px-2,sy+1,3.5,9,1.4,['#F4B6C4','#F6DC86','#BFE3D0','#D6C6EC','#B9D6F0'][k])}else{el(g,px,sy+6,3,3,['#9CC5D8','#E3A4A8','#F6DC86','#9CC5D8','#A7C7A0'][k]);ln(g,px+2,sy+5,px+4.5,sy+2.5,['#9CC5D8','#E3A4A8','#F6DC86','#9CC5D8','#A7C7A0'][k],1)}}});break}
    case 'tooltable':{tableV(g,x,y-2,w);ln(g,x+5,y+2,x+12,y-1,CO.metalD,1);ln(g,x+5,y+4,x+12,y+1,CO.metalD,1);g.strokeStyle='#7FB070';g.lineWidth=1;g.beginPath();g.arc(x+4,y+2.5,1.5,0,7);g.stroke();el(g,x+22,y+1,4,3,'#9CC5D8');ln(g,x+25,y,x+29,y-3,'#9CC5D8',1.2);break}
    case 'pottable':{tableV(g,x,y-2,w);for(let k=0;k<4;k++){const px=x+5+k*7.5;poly(g,[px-3,y-3,px+3,y-3,px+2.3,y+3,px-2.3,y+3],k%2?'#D98E6C':'#E8D2B4')}break}
    case 'fridgeDemo':{shadow(g,x+8,y+16,6,1.6);rr(g,x+1,y-20,14,36,2,CO.metalL);rr(g,x+2.5,y-17,11,26,1,CO.glass);for(let r=0;r<3;r++){for(let k=0;k<2;k++)flowerHead(g,TYPES[(r+k)%3],x+5+k*5,y-12+r*8,3,100)}break}
    case 'bucketRow':{shadow(g,x+w/2,y+15,w/2,2);for(let k=0;k<4;k++){const bx=x+6+k*11,tp=TYPES[k%3];for(let j=0;j<5;j++){ln(g,bx-2+j,y+4,bx-4+j*2,y-4-(j%2)*1.5,CO.leafD,.5);flowerHead(g,tp,bx-4+j*2,y-4-(j%2)*1.5,3.4,100)}poly(g,[bx-5,y+3,bx+5,y+3,bx+4,y+13,bx-4,y+13],k%2?CO.metal:'#6F9C8A');rr(g,bx-3,y+7,6,3.5,.6,'#FFF8EE');g.fillStyle='#7A4A36';g.fillRect(bx-2,y+8.2,4,.5);g.fillRect(bx-2,y+9.3,2.6,.5)}break}
    case 'boxes':{shadow(g,x+w/2,y+15,w/2,2);rr(g,x+2,y+2,14,12,1,'#D8B994');rr(g,x+15,y+4,14,10,1,'#CFAE86');rr(g,x+5,y-7,12,10,1,'#E2C6A2');[[x+2,y+2,14],[x+15,y+4,14],[x+5,y-7,12]].forEach(([bx,by,bw])=>{g.fillStyle='rgba(0,0,0,.08)';g.fillRect(bx+bw/2-1,by,2,3);el(g,bx+bw/2,by+6,2,1.4,'#E08FA4')});break}
    case 'seedRack':{shadow(g,x+8,y+15,6,1.6);rr(g,x+2,y-14,12,29,1.5,'#B98463');for(let r=0;r<4;r++)for(let k=0;k<2;k++){const px=x+3.5+k*5,py=y-12.5+r*6.5;rr(g,px,py,4.2,5.5,.6,['#F4B6C4','#F6DC86','#BFE3D0','#D6C6EC'][(r+k)%4]);el(g,px+2.1,py+2.5,1,1,['#E07A7A','#E0A93A','#7FAE68','#8E76C0'][(r+k)%4])}break}
    case 'canRack':{shadow(g,x+8,y+15,6,1.6);g.fillStyle=CO.woodD;g.fillRect(x+3,y-10,1.5,25);g.fillRect(x+11.5,y-10,1.5,25);[y-7,y+2,y+11].forEach((sy,k)=>{rr(g,x+2,sy,12,1.5,.5,CO.wood);el(g,x+8,sy-2.5,3.5,2.6,['#9CC5D8','#E3A4A8','#A7C7A0'][k]);ln(g,x+11,sy-3,x+14,sy-6,['#9CC5D8','#E3A4A8','#A7C7A0'][k],1)});break}
    case 'clocktower':{
      const cx=x+w/2,by=y+h;shadow(g,cx,by-1,16,3);
      rr(g,cx-14,by-10,28,10,2,'#C9BBA2');rr(g,cx-10,by-70,20,62,2,'#EEE3D0');g.fillStyle='#DCCDB5';for(let yy=by-66;yy<by-10;yy+=8)g.fillRect(cx-10,yy,20,.8);
      rr(g,cx-4,by-24,8,14,4,'#9C6B4C');
      rr(g,cx-13,by-94,26,26,3,'#F4EADB');poly(g,[cx-16,by-94,cx,by-112,cx+16,by-94],'#C97B6A');el(g,cx,by-113,1.5,1.5,'#E1B656');
      const fy=by-81;el(g,cx,fy,11,11,'#8C6A55');el(g,cx,fy,9.6,9.6,'#FFFDF6');
      for(let k=0;k<12;k++){const a=k*Math.PI/6;ln(g,cx+Math.sin(a)*7.4,fy-Math.cos(a)*7.4,cx+Math.sin(a)*8.6,fy-Math.cos(a)*8.6,'#3B2F3F',k%3?.5:1)}
      const ha=((9+S.t/60)%12)/12*Math.PI*2,ma=(S.t%60)/60*Math.PI*2;ln(g,cx,fy,cx+Math.sin(ha)*4.6,fy-Math.cos(ha)*4.6,'#3B2F3F',1.4);ln(g,cx,fy,cx+Math.sin(ma)*7,fy-Math.cos(ma)*7,'#3B2F3F',.9);el(g,cx,fy,1,1,'#C65C79');
      for(let k=0;k<5;k++)flowerHead(g,TYPES[k%3],cx-12+k*6,by-9,3.4,100);
      break;}
    case 'hoursSign':{const closed=S.t>=MARKET_CLOSE;shadow(g,x+8,y+15,6,1.4);ln(g,x+3,y+15,x+6,y-6,CO.woodD,1.2);ln(g,x+13,y+15,x+10,y-6,CO.woodD,1.2);rr(g,x,y-8,16,15,1.5,'#3E4A45');g.strokeStyle=CO.woodL;g.lineWidth=.8;g.strokeRect(x,y-8,16,15);
      g.fillStyle='#FFFFFF';g.textAlign='center';g.textBaseline='middle';g.font="bold 3.4px 'Jua','Gowun Dodum',sans-serif";g.fillText('꽃시장',x+8,y-4.5);g.font="3px 'Jua','Gowun Dodum',sans-serif";g.fillText('09:00~12:00',x+8,y-.5);
      g.fillStyle=closed?'#F29AA3':'#A6CF8C';g.fillText(closed?'영업 종료':'영업 중',x+8,y+3.6);break}
    case 'tree':drawTreeCached(g,x+8,y+15,d.v||'round',d.x*7+d.y);break;
    case 'rug_jute':{rr(g,x+2,y+2,w-4,h-4,12,'#D8C29C');for(let k=0;k<4;k++){g.strokeStyle='#C4AA80';g.lineWidth=.8;rr(g,x+4+k*4,y+4+k*3,w-8-k*8,h-8-k*6,Math.max(2,10-k*3));g.stroke()}break}
    case 'sandbox':{rr(g,x,y,w,h,3,'#B98A63');rr(g,x+2,y+2,w-4,h-4,2,'#EAD8B0');el(g,x+12,y+8,4,2,'#D9C59A');rr(g,x+30,y+5,5,4,1,'#E07A7A');break}
    case 'mirror':{shadow(g,x+8,y+15,5,1.4);g.fillStyle='#C9A24A';g.beginPath();g.moveTo(x+3,y+14);g.lineTo(x+3,y-14);g.arc(x+8,y-14,5,Math.PI,0);g.lineTo(x+13,y+14);g.closePath();g.fill();g.fillStyle='#DDEEF5';g.beginPath();g.moveTo(x+4.5,y+13);g.lineTo(x+4.5,y-14);g.arc(x+8,y-14,3.5,Math.PI,0);g.lineTo(x+11.5,y+13);g.closePath();g.fill();ln(g,x+5.5,y-8,x+9,y-13,'rgba(255,255,255,.8)',.6);break}
    case 'ladder':{shadow(g,x+8,y+15,6,1.4);ln(g,x+3,y+15,x+5,y-20,'#B98A63',1.2);ln(g,x+13,y+15,x+11,y-20,'#B98A63',1.2);[-14,-5,4,12].forEach((yy,k)=>{ln(g,x+3.5+(12-yy)*.03,y+yy,x+12.5,y+yy,'#C9A07A',1);if(k===0){rr(g,x+5,y+yy-5,4,5,1,'#D98E6C');leafyBlob(g,x+7,y+yy-6,2.5,'#7FAF6C','#A6D08F')}if(k===1){rr(g,x+9,y+yy-4,2.5,4,.5,'#EFE6D6');rr(g,x+5,y+yy-3,3,3,1,'#E4DCCF')}if(k===2){for(let j=0;j<3;j++)flowerHead(g,'gyp',x+6+j*2,y+yy-2,2.5,60,true)}})
      ;break}
    case 'monstera':{shadow(g,x+8,y+15,6,1.6);poly(g,[x+4,y+6,x+12,y+6,x+11,y+15,x+5,y+15],'#E8DCCB');[[-.9,12],[-.35,15],[.3,14],[.85,11]].forEach(([a,L],k)=>{const ex=x+8+Math.sin(a)*L,ey=y+6-Math.cos(a)*L;ln(g,x+8,y+6,ex,ey,'#4E7A40',.6);el(g,ex,ey,5,4,k%2?'#4F8A48':'#5E9A55',a);g.strokeStyle='#E3EFE6';g.lineWidth=.5;g.beginPath();g.moveTo(ex-2,ey);g.lineTo(ex-.5,ey);g.moveTo(ex+.8,ey+1);g.lineTo(ex+2.2,ey+1);g.stroke()});break}
    case 'olive':{shadow(g,x+8,y+15,6,1.6);poly(g,[x+5,y+8,x+11,y+8,x+10,y+15,x+6,y+15],'#C98E6C');ln(g,x+8,y+8,x+8,y-12,'#8C7458',1);ln(g,x+8,y-4,x+4,y-10,'#8C7458',.6);ln(g,x+8,y-6,x+12,y-13,'#8C7458',.6);const r2=seedRand(d.x*5+d.y);for(let k=0;k<16;k++)el(g,x+8+(r2()-.5)*13,y-12+(r2()-.5)*12,2.2,.8,k%2?'#9DAF8A':'#8A9E78',r2()*3);break}
    case 'terrarium':{shadow(g,x+w/2,y+16,w/2,2);rr(g,x+1,y-20,w-2,34,1.5,'#C9A24A');rr(g,x+2.5,y-18.5,w-5,31,1,'rgba(221,238,245,.85)');ln(g,x+w/2,y-18.5,x+w/2,y+12.5,'#C9A24A',.7);ln(g,x+2.5,y-3,x+w-2.5,y-3,'#C9A24A',.7);leafyBlob(g,x+8,y-8,4,'#7FAF6C','#A6D08F');leafyBlob(g,x+23,y+7,4,'#6FA35E','#9DBB88');flowerHead(g,'rose',x+24,y-10,3,100);flowerHead(g,'hydrangea',x+9,y+7,2.6,100);g.fillStyle='#8C6448';g.fillRect(x+3,y+13,2,3);g.fillRect(x+w-5,y+13,2,3);break}
    case 'school':{
      /* 꽃마을 초등학교: 크림색 2층 건물 + 가운데 박공(움직이는 시계) + 테라코타 지붕 + 아치 창문·꽃 화분 */
      const bw=w,by=y+h,cx=x+bw/2,WALL='#FBF1E1',WALL2='#F6DFCB',ROOF='#D98C73',ROOFD='#B96C57',TRIM='#FFFFFF',GLASS='#CFE3EE';
      shadow(g,cx,by+2,bw/2+6,5);
      // 양쪽 날개 벽
      rr(g,x,y-26,bw,h+26,2,WALL);for(let yy=y-22;yy<by-6;yy+=4.5){g.fillStyle='rgba(190,150,115,.09)';g.fillRect(x+1,yy,bw-2,.5)}
      g.fillStyle='#E4D3BC';g.fillRect(x,by-6,bw,6);g.fillStyle='rgba(0,0,0,.06)';g.fillRect(x,by-6,bw,1);
      // 날개 지붕(기와 줄무늬)
      poly(g,[x-5,y-24,x+10,y-42,x+bw-10,y-42,x+bw+5,y-24],ROOF);
      for(let r=0;r<4;r++){const yy=y-40+r*4.4,ix=10-r*3.6;g.strokeStyle='rgba(120,60,45,.22)';g.lineWidth=.55;g.beginPath();for(let xx=x+ix;xx<x+bw-ix;xx+=5){g.moveTo(xx,yy);g.arc(xx+2.5,yy,2.5,Math.PI,0,true)}g.stroke()}
      g.fillStyle=ROOFD;g.fillRect(x-6,y-26,bw+12,3);
      // 가운데 건물(앞으로 조금 나옴)
      const cw=66;rr(g,cx-cw/2,y-40,cw,h+40,2,WALL2);for(let yy=y-36;yy<by-6;yy+=4.5){g.fillStyle='rgba(190,130,100,.08)';g.fillRect(cx-cw/2+1,yy,cw-2,.5)}
      g.fillStyle='#E0C8B0';g.fillRect(cx-cw/2,by-6,cw,6);
      poly(g,[cx-cw/2-5,y-38,cx,y-66,cx+cw/2+5,y-38],ROOF);poly(g,[cx-cw/2+3,y-39,cx,y-61,cx+cw/2-3,y-39],WALL2);g.fillStyle=ROOFD;g.fillRect(cx-cw/2-6,y-40,cw+12,2.6);
      ln(g,cx-cw/2-5,y-38,cx,y-66,ROOFD,1.4);ln(g,cx,y-66,cx+cw/2+5,y-38,ROOFD,1.4);
      // 종탑
      rr(g,cx-5,y-76,10,10,1.5,WALL);poly(g,[cx-7,y-75,cx,y-84,cx+7,y-75],ROOF);el(g,cx,y-70,2,2.4,'#E2B656');ln(g,cx,y-84,cx,y-88,'#8E9CA6',.6);el(g,cx,y-88.5,1,1,'#E2B656');
      el(g,cx,y-49,9.5,9.5,'#E8D6C0');el(g,cx,y-49,8.4,8.4,'#FFFDF6'); // 시계판(바늘은 따로 작은 그림 schoolclock 으로 1분마다)
      // 창문(아치형) + 꽃 화분
      const win=(wx,wy,ww,wh,box)=>{rr(g,wx-1,wy-1,ww+2,wh+2,ww/2,TRIM);rr(g,wx,wy,ww,wh,ww/2-.5,GLASS);g.fillStyle='rgba(255,255,255,.55)';g.fillRect(wx+1.5,wy+ww/2,1.2,wh-ww/2-1.5);
        ln(g,wx+ww/2,wy+1,wx+ww/2,wy+wh,TRIM,.8);ln(g,wx,wy+wh*.55,wx+ww,wy+wh*.55,TRIM,.8);
        if(box){rr(g,wx-1.5,wy+wh+.5,ww+3,3,1,'#B98A63');for(let k=0;k<4;k++)flowerHead(g,TYPES[(k+Math.round(wx))%5],wx+1+k*(ww-2)/3,wy+wh,2.1,100)}};
      [x+9,x+33,bw>150?x+bw-33-12:0,x+bw-9-12].forEach(wx=>{if(!wx)return;win(wx,y-16,12,15,false);win(wx,y+20,12,15,true)});
      win(cx-22,y-24,10,13,false);win(cx+12,y-24,10,13,false);
      // 현관: 차양 + 아치 문 + 계단
      const dy0=by-30;rr(g,cx-13,dy0-1,26,31,12,'#EEDCC6');rr(g,cx-11,dy0+1,22,29,10,'#A7714F');ln(g,cx,dy0+8,cx,by-1,'#8E5C3F',.8);
      rr(g,cx-9,dy0+3,8,8,4,GLASS);rr(g,cx+1,dy0+3,8,8,4,GLASS);el(g,cx-2.5,by-13,.8,.8,'#E2B656');el(g,cx+2.5,by-13,.8,.8,'#E2B656');
      for(let k=0;k<7;k++){g.fillStyle=k%2?'#FFFFFF':'#9CCBAE';poly(g,[cx-17+k*34/7,dy0-6,cx-17+(k+1)*34/7,dy0-6,cx-17+(k+1)*34/7,dy0-1,cx-17+k*34/7,dy0-1],g.fillStyle)}
      for(let k=0;k<7;k++)el(g,cx-17+(k+.5)*34/7,dy0-1,34/14,1.6,k%2?'#FFFFFF':'#9CCBAE');
      rr(g,cx-15,by-2,30,3,1,'#E4D3BC');
      signBoard(g,cx,y+8,'꽃마을 초등학교',{size:6,min:62,line:'#E0708C',fg:'#6A4A3A',bg:'#FFFBF3'});
      // 깃대
      ln(g,x+bw+14,by,x+bw+14,y-58,'#AAB4BC',1);el(g,x+bw+14,y-58.5,1.1,1.1,'#E2B656');
      {const t=1.3;g.beginPath();g.moveTo(x+bw+14.5,y-56);for(let k=0;k<=8;k++)g.lineTo(x+bw+14.5+k*2,y-56+Math.sin(t+k*.7)*1.1);for(let k=8;k>=0;k--)g.lineTo(x+bw+14.5+k*2,y-47+Math.sin(t+k*.7)*1.1);g.closePath();g.fillStyle='#F4A6B8';g.fill();el(g,x+bw+22,y-51.5+Math.sin(t+2.8)*1.1,2,2,'#FFFFFF')}
      // 건물 앞 꽃·작은 덤불
      for(let k=0;k<16;k++){const fx=x+4+k*(bw-8)/15;if(Math.abs(fx-cx)<17)continue;el(g,fx,by+1.5,3.4,2.2,'#8FBF7A');flowerHead(g,TYPES[k%5],fx,by,2.6,100)}
      break;}
    case 'schoolclock':{/* 학교 시계 바늘만 따로(큰 학교 그림을 매분 다시 굽지 않도록) */
      const SD=DECOR_BASE.town.find(q=>q.t==='school');const cx=(SD.x+SD.w/2)*TILE,ccy=SD.y*TILE-49;const tot=540+Math.floor(S.t),hh=(tot/60)%12,mm=tot%60;
      el(g,cx,ccy,8.4,8.4,'#FFFDF6');for(let k=0;k<12;k++){const a=k*Math.PI/6;ln(g,cx+Math.sin(a)*6.6,ccy-Math.cos(a)*6.6,cx+Math.sin(a)*7.6,ccy-Math.cos(a)*7.6,'#B8A48E',k%3?.4:.8)}
      const ah=hh/12*Math.PI*2,am=mm/60*Math.PI*2;ln(g,cx,ccy,cx+Math.sin(ah)*4.2,ccy-Math.cos(ah)*4.2,'#5B4636',1.2);ln(g,cx,ccy,cx+Math.sin(am)*6.4,ccy-Math.cos(am)*6.4,'#5B4636',.7);el(g,cx,ccy,1,1,'#E0708C');break}
    case 'playmat':{/* 소꿉놀이 돗자리 + 찻잔 세트 */
      rr(g,x+1,y+2,w-2,h-4,3,'#F7D9DF');for(let k=0;k<4;k++){g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x+3+k*7.5,y+3,3.5,h-6)}
      el(g,x+w/2,y+h/2,4,2.4,'#FFFFFF');el(g,x+w/2,y+h/2-1.2,2.2,1.4,'#F2C27A');el(g,x+w/2-7,y+h/2+1,1.6,1,'#FFFFFF');el(g,x+w/2+7,y+h/2+1,1.6,1,'#FFFFFF');
      for(let k=0;k<3;k++)flowerHead(g,TYPES[k],x+w/2-3+k*3,y+h/2-4,1.8,100);break}
    case 'swing':{const tN=NOW();ln(g,x+2,y+14,x+8,y-14,'#C9695A',1.2);ln(g,x+14,y+14,x+8,y-14,'#C9695A',1.2);ln(g,x+w-14,y+14,x+w-8,y-14,'#C9695A',1.2);ln(g,x+w-2,y+14,x+w-8,y-14,'#C9695A',1.2);ln(g,x+8,y-14,x+w-8,y-14,'#9C4E4A',1.4);
      [x+w*.3,x+w*.7].forEach((sx,k)=>{const [ex,ey]=swingSeat(d,k,tN);ln(g,sx-2,y-14,ex-2,ey,'#8A7B74',.4);ln(g,sx+2,y-14,ex+2,ey,'#8A7B74',.4);rr(g,ex-3.5,ey-1,7,2,.8,'#F2C27A')});break}
    case 'slide':{shadow(g,x+w/2,y+15,w/2,2);ln(g,x+4,y+14,x+4,y-16,'#E3A04A',1.2);ln(g,x+9,y+14,x+9,y-16,'#E3A04A',1.2);for(let yy=-12;yy<14;yy+=5)ln(g,x+4,y+yy,x+9,y+yy,'#E3A04A',.8);rr(g,x+2,y-18,10,3,1,'#7FA7C9');poly(g,[x+9,y-16,x+13,y-16,x+w,y+12,x+w-5,y+12],'#7FA7C9');break}
    case 'lamp':{shadow(g,x+8,y+15,3,1);g.fillStyle='#4E5A58';g.fillRect(x+7,y-22,2,37);rr(g,x+4,y-28,8,7,2,'#4E5A58');rr(g,x+5,y-27,6,5,1.5,mix('#FFF4D6','#FFD98A',lampAt(S.t)));el(g,x+8,y+14,3,1.2,'#4E5A58');break}
    case 'fenceH':{for(let k=0;k<=d.w;k++){g.fillStyle='#FFFFFF';rr(g,x+k*16-1,y+2,3,12,1,'#FFFFFF')}g.fillStyle='#F4EFE6';g.fillRect(x,y+5,w,1.6);g.fillRect(x,y+10,w,1.6);break}
    case 'fenceV':{g.fillStyle='#F4EFE6';for(let k=0;k<d.h;k++){rr(g,x+6.5,y+k*16,3,14,1,'#FFFFFF')}g.fillRect(x+7.2,y,1.6,h);break}
    case 'shed':{shadow(g,x+w/2,y+h,w/2,2.4);rr(g,x+2,y+6,w-4,h-6,1,'#D9C3A5');poly(g,[x,y+8,x+w/2,y-4,x+w,y+8],'#B97B6A');rr(g,x+w/2-4,y+14,8,h-14,1,'#9C6B4C');break}
    case 'mailbox':{shadow(g,x+8,y+15,3,1);g.fillStyle=CO.woodD;g.fillRect(x+7,y+3,2,12);rr(g,x+3,y-3,10,7,3,'#E07A7A');g.fillStyle='#C45E5E';g.fillRect(x+3,y+2,10,1);break}
    case 'planterBox':{shadow(g,x+w/2,y+15,w/2,1.8);for(let j=0;j<8;j++){ln(g,x+3+j*3.5,y+5,x+3+j*3.5,y-1,CO.leafD,.5);flowerHead(g,TYPES[j%3],x+3+j*3.5,y-1-(j%2),3.2,100)}rr(g,x+1,y+4,w-2,9,1.5,CO.wood);g.fillStyle=CO.woodL;g.fillRect(x+1,y+4,w-2,1.2);break}
  }
}

/* ---------- signs ---------- */
// 그네 의자 위치(그네 그림과 아이 위치가 같은 식을 씀). 사람이 타면 크게, 비어 있으면 살랑
function swingSeat(d,k,tN){const x=d.x*TILE,y=d.y*TILE,occ=S.swingOcc&&S.swingOcc[k],amp=occ?.5:.05,a=Math.sin(tN/(occ?520:900)+(k?1.9:0))*amp,sx=x+d.w*TILE*(k?.7:.3);return [sx+Math.sin(a)*14,y-14+Math.cos(a)*14]}
function signBoard(g,cx,cy,text,o={}){
  g.font=`bold ${o.size||7}px 'Jua','Gowun Dodum',sans-serif`;const tw=g.measureText(text).width;const w=Math.max(o.min||30,tw+(o.pad||14)),h=(o.size||7)+6;
  if(o.hang){ln(g,cx-w/2+4,cy-h/2-5,cx-w/2+4,cy-h/2,'#8A7B74',.6);ln(g,cx+w/2-4,cy-h/2-5,cx+w/2-4,cy-h/2,'#8A7B74',.6)}
  rr(g,cx-w/2,cy-h/2+1,w,h,3,'rgba(0,0,0,.12)');rr(g,cx-w/2,cy-h/2,w,h,3,o.bg||'#FFF8EE');g.strokeStyle=o.line||'#E08FA4';g.lineWidth=.9;rr(g,cx-w/2+1.2,cy-h/2+1.2,w-2.4,h-2.4,2.2);g.stroke();
  g.fillStyle=o.fg||'#6A4A55';g.textAlign='center';g.textBaseline='middle';g.fillText(text,cx,cy+.5);
  return w;
}

/* ---------- sunset ---------- */
const SUNSET_STOPS=[[0,'#8EC3E8','#CFE8F5','#FFFFFF','#FFFFFF'],[.35,'#93B8DE','#FFE0A6','#FFF3E2','#FFD08E'],[.6,'#7C86C0','#FF9C6C','#EBA6B8','#FF8A66'],[.82,'#4B4D8A','#E57078','#9A76A6','#F48A8A'],[1,'#23264D','#5E4574','#3A375A','#6E5580']];
function sunsetPal(t){const k=clamp((t-420)/175,0,1);let a=SUNSET_STOPS[0],b=SUNSET_STOPS[SUNSET_STOPS.length-1];for(let i=0;i<SUNSET_STOPS.length-1;i++){if(k>=SUNSET_STOPS[i][0]&&k<=SUNSET_STOPS[i+1][0]){a=SUNSET_STOPS[i];b=SUNSET_STOPS[i+1];break}}const f=(k-a[0])/Math.max(.001,b[0]-a[0]);return {k,top:mix(a[1],b[1],f),hor:mix(a[2],b[2],f),cloud:mix(a[3],b[3],f),lit:mix(a[4],b[4],f)}}
function sunsetView(c){return c&&c.rest&&c.rest.bench&&c.rest.bench.view&&S.t>=420}
function drawSunsetScene(g,X,Y,W,H,who){
  const P=sunsetPal(S.t),k=P.k,tt=performance.now()/1000,HZ=Y+H*.6;
  const sg=g.createLinearGradient(0,Y,0,HZ);sg.addColorStop(0,P.top);sg.addColorStop(.65,mix(P.top,P.hor,.55));sg.addColorStop(1,P.hor);g.fillStyle=sg;g.fillRect(X,Y,W,HZ-Y);
  if(k>.8){g.globalAlpha=(k-.8)*5;const q=seedRand(9);for(let i=0;i<50;i++){const sx=X+q()*W,sy=Y+q()*(HZ-Y)*.6,tw=(Math.sin(tt*2+i)+1)/2;el(g,sx,sy,.6+tw*.6,.6+tw*.6,'#FFFFFF')}g.globalAlpha=1}
  const sunX=X+W*.62,sunY=Y+H*(.2+.46*k),sr=Math.min(W,H)*.055;
  const gl=g.createRadialGradient(sunX,sunY,0,sunX,sunY,sr*7);gl.addColorStop(0,`rgba(255,236,190,${.9-.3*k})`);gl.addColorStop(1,'rgba(255,190,140,0)');g.fillStyle=gl;g.fillRect(X,Y,W,HZ-Y);
  g.save();g.beginPath();g.rect(X,Y,W,HZ-Y);g.clip();el(g,sunX,sunY,sr,sr,mix('#FFF6D6','#FF7A4A',k));g.restore();
  const clouds=[[.12,.18,.28],[.4,.1,.22],[.78,.16,.3],[.55,.3,.26],[.2,.38,.2],[.88,.36,.18],[.33,.26,.14]];
  clouds.forEach(([cx,cy,cw],i)=>{const x0=X+((cx*W+tt*4*(1+i%3))%(W*1.3))-W*.15,y0=Y+cy*H,w0=cw*W;const near=clamp(1-Math.abs(x0-sunX)/(W*.6),0,1);
    for(let j=0;j<6;j++)el(g,x0+(j-2.5)*w0*.16,y0-(j%2)*H*.012,w0*.16,H*.03,P.cloud);
    g.globalAlpha=.55+.45*near;for(let j=0;j<5;j++)el(g,x0+(j-2)*w0*.17,y0+H*.018,w0*.14,H*.012,mix(P.cloud,P.lit,.5+.5*near));g.globalAlpha=1});
  for(let i=0;i<3;i++){const bx=X+((tt*18+i*120)%(W+60))-30,by=Y+H*(.22+i*.05)+Math.sin(tt+i)*4;g.strokeStyle='rgba(40,35,60,.7)';g.lineWidth=1.3;g.beginPath();g.moveTo(bx-6,by-2);g.quadraticCurveTo(bx-3,by-4,bx,by);g.quadraticCurveTo(bx+3,by-4,bx+6,by-2);g.stroke()}
  const wg=g.createLinearGradient(0,HZ,0,Y+H);wg.addColorStop(0,mix(P.hor,'#5B7FA0',.35));wg.addColorStop(1,mix(P.top,'#1E2A44',.5));g.fillStyle=wg;g.fillRect(X,HZ,W,Y+H-HZ);
  g.fillStyle=mix(P.hor,'#FFFFFF',.35);g.fillRect(X,HZ,W,1.2);
  if(sunY<HZ+sr){for(let i=0;i<26;i++){const yy=HZ+4+i*(H*.016),wv=Math.sin(tt*2.2+i*.9)*W*.01,ww=W*(.02+.006*i);g.globalAlpha=Math.max(0,.75-i*.025);g.fillStyle=mix('#FFE9B0','#FF9A6A',k);g.fillRect(sunX-ww/2+wv,yy,ww,1.4);g.globalAlpha=1}}
  for(let i=0;i<14;i++){const yy=HZ+8+((i*37)%Math.max(1,(Y+H-HZ-20))),xx=X+((i*97+tt*6)%W);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(xx,yy,W*.04,1)}
  const PY=Y+H*.74,dk=mix('#3E4A2E',P.top,.35*k);
  g.fillStyle=mix('#5E7A48',P.top,.4*k);g.beginPath();g.moveTo(X,Y+H);g.lineTo(X,PY+H*.04);g.quadraticCurveTo(X+W*.5,PY-H*.03,X+W,PY+H*.05);g.lineTo(X+W,Y+H);g.closePath();g.fill();
  g.fillStyle='rgba(0,0,0,.15)';g.fillRect(X,PY+H*.1,W,1.2);for(let x=X;x<X+W;x+=W/24){g.fillStyle=dk;g.fillRect(x,PY+H*.03,W*.006,H*.09)}g.fillRect(X,PY+H*.05,W,H*.01);
  const tree=(tx,ty,r,cols)=>{g.fillStyle=dk;g.fillRect(tx-r*.08,ty,r*.16,Y+H-ty);[[0,-r*.2,r],[-r*.5,r*.1,r*.7],[r*.5,r*.15,r*.75],[0,-r*.8,r*.7]].forEach(([dx,dy,rr2],i)=>el(g,tx+dx,ty+dy,rr2,rr2*.85,mix(cols[i%cols.length],P.top,.45*k)))};
  tree(X+W*.06,Y+H*.62,H*.16,['#C4543E','#D9674A','#E8905A']);tree(X+W*.94,Y+H*.58,H*.18,['#D9B03E','#E8C44E','#C9A23E']);tree(X+W*.18,Y+H*.72,H*.09,['#E8905A','#D9674A']);
  for(let i=0;i<14;i++){const lx=X+((i*131+tt*20*(1+i%3))%W),ly=Y+((i*67+tt*30*(1+i%2))%(H*.9));g.save();g.translate(lx,ly);g.rotate(tt*2+i);el(g,0,0,H*.012,H*.006,['#E8B84A','#D9674A','#E8905A'][i%3]);g.restore()}
  const sc=H/150;
  who.forEach((c,i)=>{const cx=X+W*(who.length>1?(i?.535:.465):.5);g.save();g.translate(cx,Y+H*.9);g.scale(sc*2.1,sc*2.1);drawChar(g,0,0,palOf(c),Math.PI,0,false,false,false,true);g.restore()});
  rr(g,X+W*.39,Y+H*.8,W*.22,H*.05,3,'#7A5540');rr(g,X+W*.39,Y+H*.795,W*.22,H*.014,2,'#8C6448');g.fillStyle='#5A3E2E';g.fillRect(X+W*.4,Y+H*.85,W*.012,H*.08);g.fillRect(X+W*.588,Y+H*.85,W*.012,H*.08);
  g.fillStyle='rgba(255,255,255,.75)';g.font=`${Math.max(11,H*.035)}px 'Jua','Gowun Dodum',sans-serif`;g.textAlign='center';g.fillText('행동 버튼을 누르면 일어나요',X+W/2,Y+H*.06);
}

/* ---------- trees & plants ---------- */
function canopy(g,cx,cy,r,cols,seed){const q=seedRand(seed);el(g,cx+r*.15,cy+r*.2,r,r*.82,cols[0]);for(let k=0;k<9;k++){const a=q()*6.28,d=q()*r*.6;el(g,cx+Math.cos(a)*d-r*.1,cy+Math.sin(a)*d*.8-r*.15,r*(.38+q()*.2),r*(.32+q()*.18),cols[1+(k%(cols.length-1))])}el(g,cx-r*.35,cy-r*.45,r*.28,r*.2,'rgba(255,255,255,.16)')}
const SPR={};let SPRN=0;
function drawTreeCached(g,x,by,v,seed){const sc=Math.max(.5,Math.round(RENDER_SCALE*4)/4);const key=v+'|'+seed+'|'+sc;let c=SPR[key];if(!c){if(SPRN>160){for(const k in SPR)delete SPR[k];SPRN=0}c=document.createElement('canvas');c.width=Math.ceil(48*sc);c.height=Math.ceil(66*sc);const gg=c.getContext('2d');gg.setTransform(sc,0,0,sc,0,0);drawTree(gg,24,60,v,seed);SPR[key]=c;SPRN++}g.drawImage(c,x-24,by-60,48,66)}
function drawTree(g,x,by,v,seed){
  const q=seedRand(seed+3);
  if(v==='bush'){shadow(g,x,by-1,9,2.2);canopy(g,x,by-6,8,['#5E8C4E','#6FA35E','#7DB36A','#8CC077'],seed);for(let k=0;k<5;k++)el(g,x-6+q()*12,by-10+q()*6,1.1,1.1,['#F9C9D5','#FFFFFF','#F5CF4E'][k%3]);return}
  shadow(g,x,by-1,10,2.6);
  if(v==='pine'){g.fillStyle='#6B4E3A';g.fillRect(x-1.5,by-8,3,8);[[0,12],[7,10],[13,8],[18,5.5]].forEach(([dy,wd],k)=>{poly(g,[x-wd,by-8-dy,x+wd,by-8-dy,x,by-20-dy],k%2?'#4F7A4A':'#5E8C55');poly(g,[x,by-20-dy,x+wd,by-8-dy,x+wd*.3,by-8-dy],'rgba(0,0,0,.1)')});return}
  if(v==='birch'){g.fillStyle='#F2EFE8';g.fillRect(x-1.6,by-22,3.2,22);for(let k=0;k<5;k++){g.fillStyle='#3E3A3A';g.fillRect(x-1.6+(k%2)*1.6,by-20+k*4,1.4,.7)}ln(g,x,by-16,x+6,by-22,'#E8E4DA',.8);canopy(g,x,by-27,8.5,['#8CB26A','#A6CB82','#B9D78F','#9DC47A'],seed);return}
  g.fillStyle='#7A5A44';g.fillRect(x-1.8,by-16,3.6,16);ln(g,x,by-12,x-5,by-18,'#7A5A44',1);ln(g,x,by-10,x+5,by-17,'#7A5A44',1);
  const C={cherry:['#E8A3B5','#F2B8C6','#F9D5DE','#FBE3EA'],maple:['#C4543E','#D9674A','#E8905A','#F0A868'],ginkgo:['#D9B03E','#E8C44E','#F2D878','#F6E39A'],round:['#6FA35E','#7FAF6C','#9FCB88','#8CC077']}[v]||['#6FA35E','#7FAF6C','#9FCB88','#8CC077'];
  canopy(g,x,by-22,11,C,seed);
  if(v==='cherry')for(let k=0;k<6;k++)el(g,x-12+q()*24,by-2+q()*4,1,.6,'#F9D5DE');
  if(v==='ginkgo'||v==='maple')for(let k=0;k<5;k++)el(g,x-12+q()*24,by-2+q()*4,1.2,.7,C[1],q()*3);
}
function grassTuft(g,x,y,c){ln(g,x,y,x-1.5,y-3,c,.5);ln(g,x,y,x,y-3.6,c,.5);ln(g,x,y,x+1.5,y-3,c,.5)}
function wildflower(g,x,y,c){ln(g,x,y,x,y-3,'#6E9A5A',.4);el(g,x,y-3.3,.9,.9,c);el(g,x,y-3.3,.35,.35,'#F5E08A')}

/* ---------- area backgrounds (cached) ---------- */
function wallpaper(g,x0,x1,y0,y1,base,dot){g.fillStyle=base;g.fillRect(x0,y0,x1-x0,y1-y0);for(let y=y0+3,k=0;y<y1-1;y+=5,k++)for(let x=x0+2+(k%2)*3;x<x1;x+=6){el(g,x,y,.55,.55,dot)}}
function planks(g,x0,y0,x1,y1,c1,c2,seam,seed){const r=seedRand(seed);for(let y=y0;y<y1;y+=8){for(let x=x0;x<x1;){const w=24+Math.floor(r()*3)*12;g.fillStyle=mix(c1,c2,r()*.7);g.fillRect(x,y,Math.min(w,x1-x),8);g.fillStyle=seam;g.fillRect(x,y,.6,8);x+=w}g.fillStyle=seam;g.fillRect(x0,y,x1-x0,.6)}}
function shopStatic(g){
  const W=AREAS.shop.w*TILE,P=curStyle(),r=seedRand(7);
  g.save();g.beginPath();g.rect(16,32,W-32,128);g.clip();
  if(P.floor==='plank')planks(g,16,32,W-16,160,P.f1,P.f2,P.seam,7);
  else if(P.floor==='herring'){g.fillStyle=P.f2;g.fillRect(16,32,W-32,128);for(let y=28,row=0;y<164;y+=6,row++)for(let x=12;x<W;x+=12){const c=mix(P.f1,P.f2,r()*.8);const d=row%2?1:-1;poly(g,[x,y+6,x+6,y,x+12,y,x+6,y+6].map((v,q)=>q%2?v:v+(d>0?0:0)),c);g.strokeStyle=P.seam;g.lineWidth=.4;g.beginPath();g.moveTo(x,y+6);g.lineTo(x+6,y);g.stroke()}}
  else if(P.floor==='check'){for(let y=32,a=0;y<160;y+=8,a++)for(let x=16,b=0;x<W-16;x+=8,b++){g.fillStyle=(a+b)%2?P.f2:P.f1;g.fillRect(x,y,8,8)}}
  else{g.fillStyle=P.f1;g.fillRect(16,32,W-32,128);g.fillStyle=P.seam;for(let x=16;x<W-16;x+=48)g.fillRect(x,32,.35,128);for(let y=32;y<160;y+=48)g.fillRect(16,y,W-32,.35)}
  g.restore();
  wallpaper(g,0,W,0,22,P.wall,P.dot);
  if(S.style==='vintage'){for(let x=12;x<W;x+=48){g.strokeStyle='rgba(201,162,74,.45)';g.lineWidth=.5;g.strokeRect(x,4,36,15)}}
  g.fillStyle=P.trim;g.fillRect(0,0,W,2);g.fillRect(0,21,W,1.5);g.fillStyle=P.wain;g.fillRect(0,22.5,W,8.5);for(let x=2;x<W;x+=S.style==='natural'?5:16){g.fillStyle=P.wainL;g.fillRect(x,24,S.style==='natural'?2.2:13,6)}if(S.style==='vintage'){g.fillStyle='#C9A24A';g.fillRect(0,26.8,W,.5)}g.fillStyle=P.trim;g.fillRect(0,31,W,1.5);
  if(!S.up.wsHide){rr(g,50,9,26,2,.8,S.style==='minimal'?'#E8E2D8':CO.wood);[[54,'#D98E6C'],[61,'#E8D2B4'],[68,'#D98E6C']].forEach(([px,c])=>{rr(g,px-2.5,4,5,5,1,S.style==='minimal'?'#F4F1EA':c);leafyBlob(g,px,3.5,2.6,'#7FAF6C','#A6D08F')})}
  if(!S.up.d_wallshelf&&!S.up.wfHide)[[180,6],[194,9]].forEach(([px,py],k)=>{rr(g,px,py,11,9,.8,P.frame);rr(g,px+1,py+1,9,7,.5,'#FFF8EE');k?freesiaV(g,px+5.5,py+4.5,2.2,0):roseV(g,px+5.5,py+4.5,2.6,0)});
  g.fillStyle=P.side;g.fillRect(0,0,16,176);g.fillRect(W-16,0,16,176);g.fillStyle=mix(P.side,'#000',.08);g.fillRect(15,32,1,128);g.fillRect(W-16,32,1,128);
  g.fillStyle=P.side;g.fillRect(0,160,W,16);g.fillStyle=mix(P.side,'#000',.08);g.fillRect(0,160,W,1);
  const segs=[[24,96]];for(let a=168;a+80<=W-24;a+=96)segs.push([a,a+80]);
  segs.forEach(([a,b])=>{g.fillStyle=P.trim;g.fillRect(a,161,b-a,4);for(let x=a+2;x<b-2;x+=4){el(g,x+2,160,1.6,1.6,[CO.pink,'#D9435E',CO.white,'#9DB8E8'][Math.floor(x/4)%4])}});
  g.fillStyle='#EFE2CF';g.fillRect(128,160,32,16);rr(g,130,152,28,8,2,S.style==='vintage'?'#2F2F34':S.style==='minimal'?'#E4E4E0':'#CDBFA8');rr(g,132,153.5,24,5,1.5,S.style==='vintage'?'#44444A':S.style==='minimal'?'#EDEDEA':'#DCCFB9');
  const hang=(S.up.hanging?[40,92,132,228,258]:[92,228]);for(let x=300;x<W-20;x+=64)hang.push(x);
  hang.forEach(hx=>{ln(g,hx,0,hx,7,'#A08A7A',.4);rr(g,hx-3,7,6,4,1.5,S.style==='minimal'?'#F4F1EA':'#E8D2B4');for(let k=0;k<4;k++){const vx=hx-3+k*2;ln(g,vx,9,vx+(k-1.5)*.6,15+k%2*3,CO.leafD,.5);el(g,vx+(k-1.5)*.6,15+k%2*3,1.4,.9,CO.leaf)}el(g,hx,6.5,3.4,2,'#86B96F')});
  /* 테마 장식(파스텔 줄무늬 벽지·크리스마스 가랜드·벚꽃) */
  {const P=curStyle(),W=AREAS.shop.w*TILE;
  if(P.wp==='stripe'){g.save();g.globalAlpha=.35;for(let x=3;x<W;x+=9){g.fillStyle='#F2C9D5';g.fillRect(x,2,3,19.5)}g.restore()}
  if(P.deco==='xmas'){ // 천장 가랜드 + 빨간 리본 + 방울
    g.strokeStyle='#3E7A4E';g.lineWidth=2.6;g.beginPath();g.moveTo(16,2);for(let x=16;x<=W-16;x+=24)g.quadraticCurveTo(x-12,9,x,2);g.stroke();
    for(let x=16;x<=W-16;x+=24){el(g,x,2.5,2,1.4,'#C0463E',-.5);el(g,x+2.4,2.5,2,1.4,'#C0463E',.5);el(g,x+1.2,2.8,.9,.9,'#9A2F2A')}
    for(let x=28;x<W-16;x+=24){el(g,x,7.6,1.5,1.5,['#E2B656','#C0463E','#FFFFFF'][(x/24|0)%3]);el(g,x-.5,7.1,.45,.45,'rgba(255,255,255,.8)')}}
  if(P.deco==='spring'){ // 벚꽃 가랜드 + 바닥 꽃잎
    g.strokeStyle='#8A6A5A';g.lineWidth=.5;g.beginPath();g.moveTo(16,2);for(let x=16;x<=W-16;x+=20)g.quadraticCurveTo(x-10,8,x,2);g.stroke();
    const r=seedRand(21);for(let x=18;x<W-16;x+=5){const t=((x-16)%20)/20,yy=2+Math.sin(t*Math.PI)*4.2;el(g,x,yy,1.8,1.6,r()<.5?'#F7C3D0':'#FBDDE5');el(g,x,yy,.5,.5,'#E88AA2')}
    for(let k=0;k<60;k++){const px=20+r()*(W-40),py=36+r()*118;if(px>128&&px<160&&py>140)continue;el(g,px,py,1.3,.8,r()<.5?'#F7C3D0':'#FBDDE5',r()*3)}}}
}
function shopDynamic(g){
  const t=S.t,sky=skyAt(t);
  const Wd=AREAS.shop.w*TILE;const wins=[[86,4],[214,4]];for(let x=290;x+34<Wd-16;x+=112)wins.push([x,4]);
  const P=curStyle();wins.forEach(([x,y])=>{rr(g,x,y,34,15,2,P.trim);rr(g,x+2,y+2,30,11,1,sky);g.fillStyle=mix(sky,'#FFFFFF',.4);g.fillRect(x+2,y+2,30,3);g.fillStyle=P.trim;g.fillRect(x+16,y+2,2,11);g.fillRect(x+2,y+7,30,1.1);
    if(S.up.d_curtain){[[x-4,1],[x+34,-1]].forEach(([cx,d])=>{g.fillStyle='#EFE6D6';g.beginPath();g.moveTo(cx,y-2);g.quadraticCurveTo(cx+d*6,y+8,cx+d*2,y+19);g.lineTo(cx-d*2,y+19);g.lineTo(cx-d*2,y-2);g.closePath();g.fill();g.fillStyle='#DCCFB9';g.fillRect(cx+d*1.5-1,y+11,2,1.5)});ln(g,x-6,y-2,x+40,y-2,'#9C8B7A',.8)}});
  if(S.up.d_wreath){for(let k=0;k<18;k++){const a=k*Math.PI/9;el(g,160+Math.cos(a)*11.5,12+Math.sin(a)*11.5,2.3,1.6,k%2?'#9DB07F':'#86A06A',a);if(k%3===0)el(g,160+Math.cos(a)*11.5,12+Math.sin(a)*11.5,1.3,1.3,['#C9A07A','#E3C9A8','#C98E8E'][k%3])}}
  if(S.up.d_wallshelf){rr(g,176,15,32,2,.6,P.frame);rr(g,179,8,5,7,2,'#E4DCCF');el(g,190,12,3,3,'#D98E6C');leafyBlob(g,190,9,3,'#7FAF6C','#A6D08F');rr(g,198,7,7,8,.5,'#F0E4CF');g.fillStyle=P.frame;g.fillRect(198,9,7,.6)}
  const cx=160,cy=12;el(g,cx,cy,9.5,9.5,CO.rim);el(g,cx,cy,8,8,CO.cream);
  for(let k=0;k<12;k++){const a=k*Math.PI/6,r1=k%3?6.6:5.4;ln(g,cx+Math.sin(a)*r1,cy-Math.cos(a)*r1,cx+Math.sin(a)*7,cy-Math.cos(a)*7,CO.ink,k%3?.5:.9)}
  const ha=((9+t/60)%12)/12*Math.PI*2,ma=(t%60)/60*Math.PI*2;
  ln(g,cx,cy,cx+Math.sin(ha)*3.8,cy-Math.cos(ha)*3.8,CO.ink,1.2);ln(g,cx,cy,cx+Math.sin(ma)*5.8,cy-Math.cos(ma)*5.8,CO.ink,.8);el(g,cx,cy,.9,.9,CO.pinkD);
  [[112],[208]].forEach(([x])=>{ln(g,x,0,x,S.up.d_pendant?7:5,CO.rim,.6);
    if(!S.up.d_pendant){poly(g,[x-4,9,x+4,9,x+2,5,x-2,5],'#F4E3B5');el(g,x,9,4,.8,'#E3C98A')}
    else if(S.style==='vintage'){g.fillStyle='#C9A24A';g.beginPath();g.moveTo(x-6,15);g.quadraticCurveTo(x,3,x+6,15);g.closePath();g.fill();el(g,x,15,2.2,1,'#FFE9A8')}
    else if(S.style==='minimal'){el(g,x,12,5,5,'#FFFFFF');el(g,x-1.5,10.5,1.5,1.5,'#FFF8E6')}
    else{poly(g,[x-7,15,x+7,15,x+4,6,x-4,6],'#C9A06A');g.strokeStyle='#B08850';g.lineWidth=.4;for(let yy=8;yy<15;yy+=2){g.beginPath();g.moveTo(x-4-(yy-6)*.35,yy);g.lineTo(x+4+(yy-6)*.35,yy);g.stroke()}el(g,x,15.5,3,.8,'#FFE9A8')}});
  if(S.up.lights){const L=lampAt(t);g.strokeStyle='#8A7B74';g.lineWidth=.4;g.beginPath();g.moveTo(16,3);for(let x=16;x<=Wd-16;x+=16)g.quadraticCurveTo(x-8,8,x,3);g.stroke();
    for(let x=24;x<Wd-16;x+=16)el(g,x,6.5,1.1,1.3,mix(['#FFE9A8','#FBD0D8','#CDEBDC'][(x/16|0)%3],'#FFFFFF',L*.5))}
  /* 크리스마스 테마: 창문에 눈 */
  (()=>{const P=curStyle();if(P.deco!=='xmas')return;const Wd=AREAS.shop.w*TILE;const wins=[[86,4],[214,4]];for(let x=290;x+34<Wd-16;x+=112)wins.push([x,4]);
  wins.forEach(([x,y])=>{rr(g,x-1,y-2,36,3.2,1.6,'#FFFFFF');for(let k=0;k<7;k++)el(g,x+4+k*4.4,y+3+(k*7%9),.6,.6,'rgba(255,255,255,.9)');el(g,x+17,y+14.5,15,1.3,'#FFFFFF')})})();
}
function marketStatic(g){
  const W=AREAS.market.w*TILE;
  g.fillStyle=CO.stone;g.fillRect(0,32,W,128);
  for(let y=34,k=0;y<160;y+=6,k++)for(let x=16+(k%2)*5;x<W-16;x+=10){rr(g,x,y,8.5,4.4,1.8,'#D1C8B8');g.fillStyle=CO.stoneL;g.fillRect(x+1,y+.4,6.5,.8)}
  g.fillStyle='#E9DCC6';g.fillRect(0,0,W,32);for(let x=0;x<W;x+=24){g.fillStyle='#B98463';g.fillRect(x,0,3,32)}g.fillStyle='#9C6B4C';g.fillRect(0,0,W,3);g.fillRect(0,29,W,3);
  g.fillStyle='#CFC6B6';g.fillRect(0,0,16,176);g.fillRect(W-16,0,16,176);g.fillRect(0,160,W,16);g.fillStyle='#B9AF9E';g.fillRect(0,160,W,1);
  g.fillStyle='#E7DFD2';g.fillRect(128,160,32,16);rr(g,130,152,28,8,2,'#C9B79A');
  [40,100,164,230,300].forEach((bx,k)=>{ln(g,bx,3,bx,9,CO.twine,.5);for(let j=0;j<3;j++){ln(g,bx,9,bx-2+j*2,15,'#A89A6E',.4);flowerHead(g,TYPES[(k+j)%5],bx-2+j*2,16,2.6,60,true)}});
  signBoard(g,W/2,5.5,'꽃시장 · 영업 오전 9시 ~ 정오',{size:5,min:60,line:'#C98F6E',fg:'#7A4A36',bg:'#FFF3E0'});
}
function marketDynamic(g){const W=AREAS.market.w*TILE;const L=lampAt(S.t);g.strokeStyle='#8A7B74';g.lineWidth=.4;g.beginPath();g.moveTo(16,6);for(let x=16;x<=W-16;x+=20)g.quadraticCurveTo(x-10,12,x,6);g.stroke();for(let x=26;x<W-16;x+=20)el(g,x,9,1.2,1.4,mix('#FFE9A8','#FFFFFF',L*.5))}
function supplyStatic(g){
  const W=224,H=160;
  for(let y=32;y<H-16;y+=12)for(let x=16;x<W-16;x+=12){g.fillStyle=((x+y)/12)%2?'#EAD9C0':'#E2CDB0';g.fillRect(x,y,12,12)}
  wallpaper(g,0,W,0,22,'#E1EFE8','#FFFFFF');g.fillStyle=CO.trim;g.fillRect(0,21,W,1.5);g.fillStyle='#BFD9CB';g.fillRect(0,22.5,W,9);g.fillStyle=CO.trim;g.fillRect(0,31,W,1.5);
  rr(g,72,4,80,15,1.5,'#D9C3A5');for(let x=76;x<150;x+=6)for(let y=7;y<18;y+=5)el(g,x,y,.5,.5,'#B99F7E');
  [[80,'watering'],[96,'scissors'],[112,'trowel'],[128,'watering'],[142,'scissors']].forEach(([px,k])=>{if(k==='watering'){el(g,px,12,3.5,3,'#9CC5D8');ln(g,px+3,11,px+6,8,'#9CC5D8',1)}else if(k==='scissors'){ln(g,px-2,14,px+2,8,CO.metalD,.9);ln(g,px+2,14,px-2,8,CO.metalD,.9);g.strokeStyle=CO.pink;g.lineWidth=.8;g.beginPath();g.arc(px-2,15,1.2,0,7);g.stroke();g.beginPath();g.arc(px+2,15,1.2,0,7);g.stroke()}else{ln(g,px,7,px,12,CO.woodD,1);poly(g,[px-2,12,px+2,12,px,17],CO.metalD)}});
  g.fillStyle='#C8DCD1';g.fillRect(0,0,16,H);g.fillRect(W-16,0,16,H);g.fillRect(0,H-16,W,16);g.fillStyle='#B0CBBD';g.fillRect(0,H-16,W,1);
  g.fillStyle='#EFE2CF';g.fillRect(96,H-16,32,16);rr(g,98,H-24,28,8,2,'#A7C9B8');
  signBoard(g,40,12,'용품상점',{size:7,min:44,line:'#7FA99A',fg:'#3F6B5C'});
  [[178,0],[200,0],[24,0]].forEach(([hx])=>{ln(g,hx,0,hx,8,'#A08A7A',.4);rr(g,hx-3,8,6,4,1.5,'#D98E6C');for(let k=0;k<4;k++){const vx=hx-3+k*2;ln(g,vx,10,vx+(k-1.5)*.6,15+k%2*3,CO.leafD,.5);el(g,vx+(k-1.5)*.6,15+k%2*3,1.4,.9,CO.leaf)}});
}
function supplyDynamic(g){}
function townStatic(g){
  const W=AREAS.town.w*TILE,H=AREAS.town.h*TILE,RX0=RIVER[0]*TILE,RX1=(RIVER[1]+1)*TILE,LY=27*TILE,LX=20*TILE;
  g.fillStyle='#A9D08F';g.fillRect(0,0,W,H);
  const r=seedRand(5);for(let k=0;k<420;k++){const x=r()*W,y=100+r()*(H-100);el(g,x,y,1.2+r(),.5+r()*.4,r()<.5?'#9CC784':'#B7DA9F')}
  g.fillStyle='#E8E0D2';g.fillRect(0,96,W,32);for(let x=0;x<W;x+=16){g.fillStyle='#DDD3C2';g.fillRect(x,96,.8,32)}g.fillStyle='#DDD3C2';g.fillRect(0,111.5,W,.8);
  g.fillStyle='#D8CDBB';g.fillRect(0,128,W,64);for(let y=130,k=0;y<192;y+=7,k++)for(let x=(k%2)*6;x<W;x+=12){rr(g,x,y,10,5,2,'#CFC2AD');g.fillStyle='#E3D9C9';g.fillRect(x+1.5,y+.5,7,.8)}
  g.fillStyle='#E8E0D2';g.fillRect(0,192,W,16);g.fillStyle='#DDD3C2';g.fillRect(0,192,W,.8);g.fillRect(0,207,W,.8);
  rr(g,24,212,356,152,10,'#9FCB86');
  g.fillStyle='#E9DFC8';g.fillRect(0,368,W,16);g.fillStyle='#DDD3C2';g.fillRect(0,368,W,.8);g.fillRect(0,383,W,.8);
  [[16*13,208,20,176],[16*9,16*17+4,16*19,14],[16*26,16*17+2,32,28]].forEach(([x,y,w,h])=>rr(g,x,y,w,h,6,'#E9DFC8'));
  rr(g,62,238,84,68,30,'#8FC2D8');rr(g,66,242,76,60,26,'#A9D4E6');[[90,258],[118,282],[84,286]].forEach(([x,y])=>{el(g,x,y,5,3,'#7FB070');el(g,x+2,y-1,1.3,1.3,'#F9C9D5')});
  for(let k=0;k<14;k++){const a=k/14*Math.PI*2;ln(g,104+Math.cos(a)*44,272+Math.sin(a)*36,104+Math.cos(a)*46,266+Math.sin(a)*36,'#7FA86A',.8);el(g,104+Math.cos(a)*46,265+Math.sin(a)*36,1.2,2.2,'#8C6448')}
  const beds=[[40,214,48],[150,214,52],[300,300,70],[190,346,80],[240,214,60],[40,330,50],[320,230,40],[250,262,36],[160,300,40]];
  beds.forEach(([x,y,w],b)=>{rr(g,x,y,w,9,4,'#8E6B52');rr(g,x+1,y+1,w-2,3,2,'#7A5A44');for(let k=0;k<w/3.4;k++){const tp=TYPES[(k+b)%5];ln(g,x+2+k*3.4,y+5,x+2+k*3.4,y+1,'#6E9A5A',.4);flowerHead(g,tp,x+2+k*3.4,y+1-(k%2),tp==='hydrangea'?3:3.6,100)}});
  const patch=(x0,y0,w,h,n,seed)=>{const q=seedRand(seed);for(let k=0;k<n;k++){const x=x0+q()*w,y=y0+q()*h;const z=q();if(z<.25)grassTuft(g,x,y,'#86B870');else if(z<.85)wildflower(g,x,y,['#FFFFFF','#F9C9D5','#F5CF4E'][Math.floor(q()*3)]);else el(g,x,y,1.6,1,'#C2BCB0')}};
  patch(28,216,350,146,40,11);patch(868,216,56,150,8,14);
  // river
  g.fillStyle='#8FC2D8';g.fillRect(RX0,0,RX1-RX0,LY);g.fillStyle='#A9D4E6';g.fillRect(RX0+6,0,RX1-RX0-12,LY);
  for(let y=0;y<LY;y+=4){g.fillStyle=(y/4)%2?'rgba(255,255,255,.08)':'rgba(0,0,0,.02)';g.fillRect(RX0+6,y,RX1-RX0-12,2)}
  [[RX0-3],[RX1-3]].forEach(([x])=>{g.fillStyle='#B8A88E';g.fillRect(x,0,6,LY);for(let y=0;y<LY;y+=8){rr(g,x-.5,y,7,7,2,'#C9BBA2')}});
  const q=seedRand(21);for(let k=0;k<30;k++){const side=k%2?RX0-6:RX1+4,y=210+q()*150;ln(g,side,y,side+(q()-.5)*3,y-8,'#6E9A5A',.6);if(k%3===0)el(g,side,y-8,.8,2.2,'#8C6448')}
  [[RX0+10,230],[RX1-14,330],[RX0+14,40]].forEach(([x,y])=>{el(g,x,y,5,3,'#7FB070');el(g,x+1,y-1,1.3,1.3,'#FFFFFF')});
  // riverside walks
  [[24*TILE,0,3*TILE,26*TILE],[34*TILE,0,3*TILE,26*TILE]].forEach(([x,y,w,h])=>{g.fillStyle='#E4DACB';g.fillRect(x,y,w,h);for(let yy=y;yy<y+h;yy+=12){g.fillStyle='#D8CDBB';g.fillRect(x,yy,w,.7)}g.fillStyle='#CFC3AE';g.fillRect(x+(x<RX0?w-2:0),y,2,h)});
  for(let k=0;k<26;k++){const yy=20+k*14;if((yy>90&&yy<212)||(yy>262&&yy<312))continue;[[24*TILE+1],[37*TILE-3]].forEach(([x])=>{el(g,x,yy,2.2,1.6,'#7FAF6C');if(k%3===0)wildflower(g,x,yy-1,['#F5CF4E','#F9C9D5','#FFFFFF'][k%3])})}
  // lake
  const lg=g.createLinearGradient(0,LY,0,H);lg.addColorStop(0,'#A9D4E6');lg.addColorStop(1,'#7FB3CF');g.fillStyle=lg;g.fillRect(LX,LY,W-LX,H-LY);
  g.fillStyle='#8FC2D8';g.fillRect(RX0,LY-4,RX1-RX0,8);
  for(let k=0;k<60;k++){const x=LX+q()*(W-LX),y=LY+6+q()*(H-LY-30);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x,y,4+q()*8,.6)}
  g.fillStyle='#C9BBA2';g.fillRect(LX,LY-3,W-LX,4);for(let x=LX;x<W;x+=8)rr(g,x,LY-4,7,5,2,'#D6C9B2');
  [[340,470],[420,500],[860,455],[780,505]].forEach(([x,y])=>{el(g,x,y,6,3.5,'#7FB070');el(g,x+8,y+2,4,2.4,'#8CBE7A');el(g,x+2,y-1,1.4,1.4,'#F9C9D5')});
  // promenade
  rr(g,LX-2,386,W-LX+2,44,2,'#D9C4A2');for(let x=LX;x<W;x+=10){g.fillStyle='#C9B08A';g.fillRect(x,386,.8,44)}
  // bridges
  rr(g,RX0-10,94,RX1-RX0+20,116,4,'#D6C6AE');for(let y=98;y<208;y+=8){g.fillStyle='#CDBB9F';g.fillRect(RX0-8,y,RX1-RX0+16,.8)}
  [[92],[206]].forEach(([y])=>{rr(g,RX0-12,y,RX1-RX0+24,5,2,'#B8A88E');for(let x=RX0-10;x<RX1+10;x+=8)rr(g,x,y-5,3,6,1,'#C9BBA2')});
  [[268,40],[382,34]].forEach(([y0,hh])=>{rr(g,RX0-10,y0,RX1-RX0+20,hh,3,'#C99E78');for(let x=RX0-8;x<RX1+10;x+=6){g.fillStyle='#B8845F';g.fillRect(x,y0+2,.8,hh-4)}[[y0-2],[y0+hh]].forEach(([y])=>{g.fillStyle='#9C6B4C';g.fillRect(RX0-12,y,RX1-RX0+24,3);for(let x=RX0-10;x<RX1+12;x+=10)g.fillRect(x,y-5,2,6)})});
  // pier
  rr(g,640,430,48,68,2,'#C99E78');for(let y=432;y<496;y+=5){g.fillStyle='#B8845F';g.fillRect(642,y,44,.7)}[[640],[686]].forEach(([x])=>{for(let y=436;y<498;y+=14){rr(g,x-1,y,3,5,1,'#8C6448')}});
  // school yard
  rr(g,32,448,240,84,6,'#E6D6B4');for(let k=0;k<40;k++)el(g,40+q()*224,454+q()*72,.8,.5,'#D9C59A');
  g.strokeStyle='#FFFFFF';g.lineWidth=1;g.beginPath();g.ellipse(176,490,26,15,0,0,7);g.stroke();g.beginPath();g.moveTo(176,475);g.lineTo(176,505);g.stroke();el(g,176,490,2,1.4,'#FFFFFF');
  [[32,448,240,1],[32,448,1,84],[271,448,1,84],[32,531,240,1]].forEach(([x,y,w,h])=>{g.fillStyle='#F4EFE6';g.fillRect(x,y,w,h+1);for(let k=0;k<(w>h?w:h);k+=8){if(w>h)g.fillRect(x+k,y-3,1.4,5);else g.fillRect(x-2,y+k,5,1.4)}});
  g.fillStyle='#E6D6B4';g.fillRect(128,446,36,6);g.fillRect(31,444,18,8);
  // 운동장 입구(왼쪽 위) 작은 아치
  ln(g,33,450,33,428,'#C9A27E',1.6);ln(g,47,450,47,428,'#C9A27E',1.6);g.strokeStyle='#C9A27E';g.lineWidth=1.6;g.beginPath();g.arc(40,430,7,Math.PI,0);g.stroke();
  for(let k=0;k<6;k++)flowerHead(g,TYPES[k%5],34+k*2.6,424+Math.sin(k)*2,2.2,100);
  g.fillStyle='#7FAF6C';g.fillRect(0,H-16,LX,16);for(let x=0;x<LX;x+=10)el(g,x+5,H-15,6,4,'#8FBF7A');
  g.fillStyle='#C9BBA2';g.fillRect(LX,H-18,W-LX,18);for(let x=LX;x<W;x+=8)rr(g,x,H-18,7,6,2,'#D6C9B2');g.fillStyle='#8FBF7A';g.fillRect(LX,H-10,W-LX,10);
  for(let x=LX+4;x<W;x+=14){rr(g,x,H-30,3,14,1,'#FFFFFF')}g.fillStyle='#F4EFE6';g.fillRect(LX,H-27,W-LX,1.6);g.fillRect(LX,H-21,W-LX,1.6);
  for(let k=0;k<30;k++){const x=LX+10+k*20;ln(g,x,H-18,x-2,H-26,'#6E9A5A',.5);ln(g,x+3,H-18,x+4,H-27,'#6E9A5A',.5)}
  g.fillStyle='#8FBF7A';g.fillRect(0,96,16,H-96);
  // plaza + clock ring
  rr(g,576,230,48,70,12,'#E3D9C9');for(let k=0;k<2;k++){g.strokeStyle='#D3C7B3';g.lineWidth=.8;g.beginPath();g.ellipse(608,262,14+k*8,18+k*8,0,0,7);g.stroke()}
  // field soil
  rr(g,630,222,244,130,4,'#B89574');for(let y=230;y<346;y+=10){g.fillStyle='#A5825F';g.fillRect(636,y,232,4)}
  rr(g,720,208,32,16,4,'#E9DFC8');
  FACADES.forEach(f=>drawFacade(g,f));
}
function drawFacade(g,f){
  const x=f.x*TILE,w=f.w*TILE,top=0,base=96;
  const win=(wx,wy,ww,wh,inner)=>{rr(g,wx-1.5,wy-1.5,ww+3,wh+3,2,'#F8F4EC');rr(g,wx,wy,ww,wh,1.5,inner||'#CFE3EE');g.fillStyle='rgba(255,255,255,.4)';g.fillRect(wx+1,wy+1,ww-2,wh*.3)};
  const box=(bx,by,bw)=>{rr(g,bx,by,bw,4,1,CO.wood);for(let k=0;k<bw/3;k++)flowerHead(g,TYPES[k%3],bx+1.5+k*3,by,2.8,100)};
  const door=(dx,col)=>{rr(g,dx+2,58,28,38,3,col);rr(g,dx+5,62,22,16,2,'rgba(207,227,238,.9)');g.fillStyle='rgba(0,0,0,.08)';g.fillRect(dx+15.5,62,1,34);el(g,dx+24,82,1.2,1.2,'#E1B656');rr(g,dx,94,32,3,1,'#CDBFA8')};
  if(f.t==='house'){g.fillStyle=f.c;g.fillRect(x,10,w,86);poly(g,[x-2,12,x+w/2,-2,x+w+2,12],mix(f.c,'#8C5A50',.45));if(w>=48){win(x+8,30,14,16);win(x+w-22,30,14,16);box(x+7,46,16);box(x+w-23,46,16);rr(g,x+w/2-7,64,14,32,2,mix(f.c,'#6B4A3A',.4))}else{win(x+3,30,w-6,16)}return}
  if(f.t==='shopFront'){
    g.fillStyle='#F8E1E4';g.fillRect(x,14,w,82);for(let k=0;k<w;k+=8){el(g,x+k+4,14,4.5,4,'#D98E8E')}g.fillStyle='#C97A7A';g.fillRect(x,6,w,6);
    const dx=f.door*TILE;
    win(x+8,50,dx-x-16,34,'#FBEFE9');win(dx+40,50,x+w-dx-48,34,'#FBEFE9');
    [[x+10,dx-6],[dx+42,x+w-10]].forEach(([a,b])=>{for(let k=0;a+4+k*6<b;k++){const fx=a+4+k*6;ln(g,fx,82,fx,74,CO.leafD,.6);flowerHead(g,TYPES[k%3],fx,74-(k%2)*2,4,100)}rr(g,a,80,b-a,4,1,'#E8D2B4')});
    for(let k=0;k<w;k+=10){g.fillStyle=(k/10)%2?'#FFFFFF':'#F4B6C4';g.fillRect(x+k,36,10,8);el(g,x+k+5,44,5,3,(k/10)%2?'#FFFFFF':'#F4B6C4')}
    door(dx,'#B98463');
    const sw=signBoard(g,dx+16,26,S.shopName,{size:8,min:56,pad:26});tulipV(g,dx+16-sw/2+7,29.5,4.5,0);tulipV(g,dx+16+sw/2-7,29.5,4.5,0);
    if(S.up.sign){for(let k=0;k<15;k++){const a=Math.PI*(k/14);flowerHead(g,TYPES[k%3],dx+16-Math.cos(a)*(sw/2+3),22-Math.sin(a)*7,3.4,100)}ln(g,dx+42,48,dx+52,48,'#8A7B74',.8);rr(g,dx+46,48,12,12,2,'#FFF8EE');tulipV(g,dx+52,57,4,0)}
    [[x+2],[x+w-12]].forEach(([px])=>{rr(g,px,86,10,10,2,'#D98E6C');leafyBlob(g,px+5,84,6,'#7FAF6C','#A6D08F');el(g,px+3,82,1.3,1.3,CO.pink);el(g,px+7,80,1.3,1.3,CO.yellow)});
    return;
  }
  if(f.t==='supplyFront'){
    g.fillStyle='#DCEFE6';g.fillRect(x,14,w,82);g.fillStyle='#7FA99A';g.fillRect(x,6,w,9);
    for(let k=0;k<w;k+=10){g.fillStyle=(k/10)%2?'#FFFFFF':'#9CC7B3';g.fillRect(x+k,36,10,8);el(g,x+k+5,44,5,3,(k/10)%2?'#FFFFFF':'#9CC7B3')}
    const dx=f.door*TILE;win(x+8,50,dx-x-14,32,'#F4EBDD');win(dx+38,50,x+w-dx-44,32,'#F4EBDD');
    for(let k=0;k<3;k++){rr(g,x+12+k*10,72,6,8,1,'#D98E6C');leafyBlob(g,x+15+k*10,70,3.5,'#7FAF6C','#A6D08F')}el(g,dx+50,66,5,4,'#9CC5D8');ln(g,dx+54,65,dx+59,61,'#9CC5D8',1.4);rr(g,dx+62,60,4,20,1.5,'#F4B6C4');rr(g,dx+67,62,4,18,1.5,'#F6DC86');
    door(dx,'#6F9C8A');
    const sw=signBoard(g,dx+16,26,'용품상점',{size:8,min:50,pad:30,line:'#7FA99A',fg:'#3F6B5C'});el(g,dx+16-sw/2+8,27,3,2.4,'#9CC5D8');ln(g,dx+16-sw/2+10.5,26.2,dx+16-sw/2+13,24,'#9CC5D8',1);ln(g,dx+16+sw/2-10,30,dx+16+sw/2-6,23,CO.metalD,.8);ln(g,dx+16+sw/2-6,30,dx+16+sw/2-10,23,CO.metalD,.8);
    ln(g,x+8,20,x+8,30,'#8A7B74',.6);el(g,x+8,33,4,3.5,'#E3A4A8');el(g,x+w-10,33,4,3.5,'#9CC5D8');ln(g,x+w-10,20,x+w-10,30,'#8A7B74',.6);
    return;
  }
  if(f.t==='marketFront'){
    g.fillStyle='#F5E9D6';g.fillRect(x,18,w,78);poly(g,[x-4,20,x+w/2,-4,x+w+4,20],'#C98F6E');g.fillStyle='#B67C5E';g.fillRect(x-4,18,w+8,4);
    const cols=['#F4B6C4','#F6DC86','#BFE3D0','#D6C6EC'];for(let k=0;k<w;k+=10){g.fillStyle=cols[(k/10)%4];g.fillRect(x+k,40,10,9);el(g,x+k+5,49,5,3,cols[(k/10)%4])}
    const dx=f.door*TILE;rr(g,dx-4,56,40,40,14,'#6B5A52');rr(g,dx,62,32,34,10,'#8A776C');for(let k=0;k<4;k++)flowerHead(g,TYPES[k%3],dx+6+k*7,80,4,100);
    const sw=signBoard(g,dx+16,30,'꽃시장',{size:9,min:60,pad:34,line:'#C98F6E',fg:'#7A4A36'});for(let k=0;k<3;k++){flowerHead(g,TYPES[k],dx+16-sw/2+5+k*3.5,30-(k%2),3,100);flowerHead(g,TYPES[2-k],dx+16+sw/2-5-k*3.5,30-(k%2),3,100)}
    for(let k=0;k<5;k++){const bx=x+14+k*((w-28)/4);if(Math.abs(bx-dx-16)<30)continue;ln(g,bx,12,bx,18,'#8A7B74',.5);for(let j=0;j<3;j++)flowerHead(g,TYPES[(k+j)%3],bx-2+j*2,20+j%2,2.6,100)}
    for(let k=0;k<14;k++){const bx=x+8+k*14;if(bx>dx-12&&bx<dx+44)continue;for(let j=0;j<3;j++){ln(g,bx+j*2,90,bx-1+j*3,82,CO.leafD,.5);flowerHead(g,TYPES[(k+j)%3],bx-1+j*3,82-(j%2),3.4,100)}poly(g,[bx-3,88,bx+7,88,bx+6,96,bx-2,96],k%2?CO.metal:'#D98E6C')}
    win(x+10,56,30,20);win(x+w-40,56,30,20);
    signBoard(g,x+25,82,'영업 09:00~12:00',{size:5,min:36,pad:6,line:'#C98F6E',fg:'#7A4A36'});
    return;
  }
}
function northStatic(g){
  const W=AREAS.north.w*TILE,H=AREAS.north.h*TILE,RX0=RIVER[0]*TILE,RX1=(RIVER[1]+1)*TILE,q=seedRand(41);
  g.fillStyle='#B5C98E';g.fillRect(0,96,W,H-96);for(let k=0;k<500;k++){const x=q()*W,y=100+q()*(H-100);el(g,x,y,1.3+q(),.6,q()<.5?'#A9BF82':'#C4D49C')}
  for(let k=0;k<420;k++){const x=q()*W,y=110+q()*(H-110);el(g,x,y,1.2,.8,['#E8B84A','#D9674A','#E8905A','#C9A23E','#B8543E'][k%5],q()*3)}
  const path=(pts,w)=>{g.strokeStyle='#E4D6BC';g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();g.strokeStyle='#D8C8AA';g.lineWidth=.8;g.stroke()};
  path([[25.5*TILE,H],[25.5*TILE,17*TILE],[20*TILE,15*TILE],[12*TILE,16*TILE],[6*TILE,12*TILE],[4*TILE,8.6*TILE]],28);path([[35.5*TILE,H],[35.5*TILE,14*TILE],[42*TILE,12*TILE],[50*TILE,14*TILE],[55*TILE,10*TILE],[56*TILE,8.6*TILE]],28);
  g.fillStyle='#E4D6BC';g.fillRect(0,7*TILE,W,2.2*TILE);for(let x=0;x<W;x+=12){g.fillStyle='#D8C8AA';g.fillRect(x,7*TILE,.7,2.2*TILE)}
  g.fillStyle='#8FC2D8';g.fillRect(RX0,6*TILE,RX1-RX0,H-6*TILE);g.fillStyle='#A9D4E6';g.fillRect(RX0+6,6*TILE,RX1-RX0-12,H-6*TILE);[[RX0-3],[RX1-3]].forEach(([x])=>{g.fillStyle='#B8A88E';g.fillRect(x,6*TILE,6,H-6*TILE);for(let y=6*TILE;y<H;y+=8)rr(g,x-.5,y,7,7,2,'#C9BBA2')});
  rr(g,RX0-10,13*TILE-4,RX1-RX0+20,2*TILE+8,3,'#C99E78');for(let x=RX0-8;x<RX1+10;x+=6){g.fillStyle='#B8845F';g.fillRect(x,13*TILE-2,.8,2*TILE+4)}[[13*TILE-6],[15*TILE+4]].forEach(([y])=>{g.fillStyle='#9C6B4C';g.fillRect(RX0-12,y,RX1-RX0+24,3);for(let x=RX0-10;x<RX1+12;x+=10)g.fillRect(x,y-5,2,6)});
  [[24*TILE,17*TILE],[34*TILE,14*TILE]].forEach(([x,y])=>{g.fillStyle='#E4D6BC';g.fillRect(x,y,3*TILE,H-y)});
  g.fillStyle='#9C6B4C';g.fillRect(0,6.6*TILE,W,3);for(let x=4;x<W;x+=16){g.fillRect(x,6.2*TILE,3,.9*TILE)}g.fillRect(0,6.35*TILE,W,1.5);
  const q2=seedRand(43);for(let k=0;k<40;k++){const side=k%2?RX0-6:RX1+4,y=16*TILE+q2()*5*TILE;ln(g,side,y,side+(q2()-.5)*3,y-8,'#8F9E62',.6);if(k%3===0)el(g,side,y-8,.8,2.2,'#8C6448')}
}
function northDynamic(g){
  const W=AREAS.north.w*TILE,RX0=RIVER[0]*TILE,RX1=(RIVER[1]+1)*TILE,P=sunsetPal(S.t),k=P.k,tt=performance.now()/1000,HZ=5.6*TILE;
  const sg=g.createLinearGradient(0,0,0,HZ);sg.addColorStop(0,P.top);sg.addColorStop(.7,mix(P.top,P.hor,.6));sg.addColorStop(1,P.hor);g.fillStyle=sg;g.fillRect(0,0,W,HZ);
  if(k>.8){g.globalAlpha=(k-.8)*5;const q=seedRand(9);for(let i=0;i<70;i++){const tw=(Math.sin(tt*2+i)+1)/2;el(g,q()*W,q()*HZ*.7,.5+tw*.4,.5+tw*.4,'#FFFFFF')}g.globalAlpha=1}
  const sx=(RX0+RX1)/2,sy=10+k*(HZ-4);const gl=g.createRadialGradient(sx,sy,0,sx,sy,110);gl.addColorStop(0,`rgba(255,232,180,${.7-.2*k})`);gl.addColorStop(1,'rgba(255,190,140,0)');g.fillStyle=gl;g.fillRect(sx-110,0,220,HZ);
  g.save();g.beginPath();g.rect(0,0,W,HZ);g.clip();el(g,sx,sy,10,10,mix('#FFF6D6','#FF7A4A',k));g.restore();
  [[.1,.25,.2],[.28,.12,.16],[.62,.2,.22],[.82,.1,.15],[.45,.35,.12],[.92,.32,.14]].forEach(([cx,cy,cw],i)=>{const x0=((cx*W+tt*3*(1+i%3))%(W*1.2))-W*.1,y0=cy*HZ,w0=cw*W*.5,near=clamp(1-Math.abs(x0-sx)/(W*.35),0,1);for(let j=0;j<6;j++)el(g,x0+(j-2.5)*w0*.16,y0-(j%2)*2,w0*.16,4.5,P.cloud);g.globalAlpha=.5+.5*near;for(let j=0;j<5;j++)el(g,x0+(j-2)*w0*.17,y0+3,w0*.14,1.8,mix(P.cloud,P.lit,.5+.5*near));g.globalAlpha=1});
  g.fillStyle=mix('#6F8F5E',P.top,.35*k);g.beginPath();g.moveTo(0,HZ+2);for(let x=0;x<=W;x+=20)g.lineTo(x,HZ-2-Math.abs(Math.sin(x*.05))*2.5-(x%60<20?2:0));g.lineTo(W,HZ+8);g.lineTo(0,HZ+8);g.closePath();g.fill();
  g.fillStyle='#B5C98E';g.fillRect(0,HZ+6,W,6.2*TILE-HZ);
  if(k>0){g.fillStyle=P.hor;g.globalAlpha=.3*k;g.fillRect(RX0+2,6*TILE,RX1-RX0-4,AREAS.north.h*TILE);g.globalAlpha=1;for(let i=0;i<20;i++){const yy=6.4*TILE+i*9;g.fillStyle=`rgba(255,215,160,${(.5-.02*i)*k})`;g.fillRect(sx-6-i*.6+Math.sin(tt*2+i)*2,yy,12+i*1.2,1.2)}}
  for(let i=0;i<18;i++){const x=((i*83+tt*(8+i%4))%W),y=((i*47+tt*(14+i%5))%(AREAS.north.h*TILE-120))+110;g.save();g.translate(x,y);g.rotate(tt*2+i);el(g,0,0,1.6,.9,['#E8B84A','#D9674A','#E8905A'][i%3]);g.restore()}
}
function townDynamic(g){
  const RX0=RIVER[0]*TILE,RX1=(RIVER[1]+1)*TILE,H=27*TILE,HH=AREAS.town.h*TILE,W=AREAS.town.w*TILE,LY=27*TILE,LX=20*TILE,tt=performance.now()/1000;
  const P=sunsetPal(S.t),k=P.k;
  if(k>0){g.fillStyle=P.hor;g.globalAlpha=.28*k;g.fillRect(LX,LY,W-LX,HH-LY-18);g.fillRect(RX0,0,RX1-RX0,LY);g.globalAlpha=1}
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=.7;for(let k=0;k<10;k++){const x=LX+20+((k*97+tt*9)%(W-LX-40)),y=LY+14+((k*43)%60);g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+4,y-1.5,x+8,y);g.stroke()}
  if(S.t>480){const a=clamp((S.t-480)/40,0,1);for(let k=0;k<24;k++){const bx=[60,200,330,480,600,760,860][k%7]+Math.sin(tt*.7+k*1.7)*18,by=[250,300,420,405,300,410,395][k%7]+Math.cos(tt*.9+k)*12;const tw=(Math.sin(tt*3+k*2)+1)/2;g.globalAlpha=a*(.3+.7*tw);el(g,bx,by,1.1,1.1,'#FFF3A0');g.globalAlpha=a*.25*tw;el(g,bx,by,3.5,3.5,'#FFF3A0');g.globalAlpha=1}}
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=.8;g.lineCap='round';
  for(let k=0;k<16;k++){const y=((k*37+tt*14)%H);if((y>90&&y<212)||(y>262&&y<310)||(y>378&&y<418))continue;const x=RX0+10+((k*13)%(RX1-RX0-22));g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+3,y-1.5,x+6,y);g.stroke()}
  const L=lampAt(S.t);if(L<=0)return;
  g.fillStyle=`rgba(255,214,150,${.45*L})`;
  FACADES.forEach(f=>{const x=f.x*TILE,w=f.w*TILE;if(f.t==='shopFront'){const dx=f.door*TILE;g.fillRect(x+8,50,dx-x-16,34);g.fillRect(dx+40,50,x+w-dx-48,34)}else if(f.t==='supplyFront'){const dx=f.door*TILE;g.fillRect(x+8,50,dx-x-14,32);g.fillRect(dx+38,50,x+w-dx-44,32)}else if(f.t==='house'&&w>=48){g.fillRect(x+8,30,14,16);g.fillRect(x+w-22,30,14,16)}});
}
/* 새 장소가 자기 그림 함수를 등록하는 곳 */
const AREA_STATIC={},AREA_DYNAMIC={},DECOR_DRAW={},AREA_LIGHTS={};
/* ---------- 상점 가구·벽 장식·선물 소품·피크닉 가구 그림 ---------- */
/* 작은 그림 도우미 */
function frameV(g,x,y,w,h,fc,inner){rr(g,x,y,w,h,.8,fc);rr(g,x+1.1,y+1.1,w-2.2,h-2.2,.5,inner||'#FFF8EE');g.fillStyle='rgba(0,0,0,.1)';g.fillRect(x+.6,y+h,w-1.2,.8)}
function tinyFace(g,x,y,hair,skin,fem){el(g,x,y,2.6,2.8,skin);g.beginPath();g.ellipse(x,y-1,2.9,2.2,0,Math.PI,0);g.fillStyle=hair;g.fill();if(fem){rr(g,x-3,y-1.4,1.3,4.6,.6,hair);rr(g,x+1.7,y-1.4,1.3,4.6,.6,hair)}el(g,x-.9,y+.3,.3,.35,'#3A2E3A');el(g,x+.9,y+.3,.3,.35,'#3A2E3A');el(g,x,y+1.4,.7,.3,'#E07A7A')}
const WOOD='#B98A63',WOODD='#8C6448',WOODL='#D8B48C';
Object.assign(DECOR_DRAW,{
  cafetable(g,d,x,y){const cx=x+16;shadow(g,cx,y+15,15,2.4);
    [[x+4,1],[x+28,-1]].forEach(([sx,s])=>{rr(g,sx-4,y+2,8,3,1,'#E8D2B4');ln(g,sx-3,y+5,sx-3,y+14,WOODD,.9);ln(g,sx+3,y+5,sx+3,y+14,WOODD,.9);rr(g,sx-4+(s>0?-1:5),y-8,3,11,1.2,'#D9B991')});
    ln(g,cx,y+2,cx,y+14,WOODD,1.3);el(g,cx,y+14.5,5,1.2,WOODD);el(g,cx,y+1,11,4,'#FBF6EE');el(g,cx,y+.4,11,3.6,'#FFFFFF');
    rr(g,cx-7,y-3,4.2,4,1,'#F4B6C4');el(g,cx-5,y-3,2.1,.8,'#8A5A3C');rr(g,cx+2,y-6,3,6,1.2,'#DDEEF5');flowerHead(g,'tulip',cx+3.5,y-7.5,2.6,100)},
  flowercart(g,d,x,y){shadow(g,x+16,y+15,16,2.4);rr(g,x+2,y-2,28,10,1.5,'#7FA88A');rr(g,x+2,y-2,28,2.4,1,'#9DC3A6');for(let k=0;k<4;k++)g.fillStyle='rgba(0,0,0,.08)',g.fillRect(x+4+k*7,y+1,.6,7);
    ln(g,x+30,y+2,x+34,y-6,WOODD,1.2);el(g,x+8,y+11,3.6,3.6,'#5A5048');el(g,x+8,y+11,1.4,1.4,'#C9BBA2');el(g,x+24,y+11,3.6,3.6,'#5A5048');el(g,x+24,y+11,1.4,1.4,'#C9BBA2');
    for(let k=0;k<4;k++){const bx=x+6+k*7,tp=TYPES[k%TYPES.length];poly(g,[bx-3,y-2,bx+3,y-2,bx+2.4,y+3,bx-2.4,y+3],k%2?'#B4C2CC':'#C9D6DE');for(let j=0;j<4;j++){ln(g,bx-1.5+j,y-2,bx-3+j*2,y-8-(j%2)*2,CO.leafD,.45);flowerHead(g,tp,bx-3+j*2,y-8-(j%2)*2,2.8,100)}}},
  bike(g,d,x,y){shadow(g,x+16,y+15,16,2);const fc='#6F9C8A';[[x+7,y+9],[x+25,y+9]].forEach(([wx,wy])=>{g.strokeStyle='#4A4448';g.lineWidth=1.3;g.beginPath();g.arc(wx,wy,5.4,0,7);g.stroke();g.strokeStyle='rgba(120,110,110,.6)';g.lineWidth=.3;for(let k=0;k<6;k++){const a=k*Math.PI/3;g.beginPath();g.moveTo(wx,wy);g.lineTo(wx+Math.cos(a)*5,wy+Math.sin(a)*5);g.stroke()}});
    ln(g,x+7,y+9,x+14,y+2,fc,1.3);ln(g,x+14,y+2,x+23,y+2,fc,1.3);ln(g,x+23,y+2,x+25,y+9,fc,1.3);ln(g,x+14,y+2,x+16,y+9,fc,1.3);ln(g,x+16,y+9,x+7,y+9,fc,1.1);ln(g,x+13,y+2,x+12,y-2,fc,1);rr(g,x+9.5,y-3.2,5,1.8,.8,'#6A4A3A');
    ln(g,x+23,y+2,x+22,y-4,fc,1);ln(g,x+20,y-4,x+25,y-4.5,'#4A4448',1);rr(g,x+23,y-5,8,6,1.5,'#C99A63');ln(g,x+23.5,y-2.5,x+30.5,y-2.5,'#A87A48',.5);for(let k=0;k<5;k++)flowerHead(g,TYPES[(k+2)%TYPES.length],x+24+k*1.7,y-6-(k%2)*1.5,2.3,100)},
  bookshelf(g,d,x,y){shadow(g,x+8,y+15,7,1.8);rr(g,x+1,y-26,14,41,1.2,WOOD);const C=['#C9546A','#5E7FB0','#E2B656','#7FAF6C','#B98AC9','#E8D2B4','#6A8A7A'];
    [y-24,y-14,y-4,y+6].forEach((sy,r)=>{rr(g,x+2.2,sy,11.6,8,.6,'#6E4E38');let bx=x+2.8;let k=r*2;while(bx<x+12.6){const bw=1.4+((k*7)%3)*.5;rr(g,bx,sy+1.2+((k*5)%3)*.6,bw,6.6-((k*5)%3)*.6,.3,C[k%C.length]);bx+=bw+.25;k++}})},
  record(g,d,x,y){shadow(g,x+8,y+15,7,1.8);rr(g,x+1.5,y-4,13,19,1.2,'#8C6448');rr(g,x+2.5,y-2,5.2,15,.6,'#A67C5A');rr(g,x+8.3,y-2,5.2,15,.6,'#A67C5A');el(g,x+5.1,y+5,.6,.6,'#E2B656');el(g,x+10.9,y+5,.6,.6,'#E2B656');
    rr(g,x+1,y-8,14,4.4,1,'#E8D2B4');el(g,x+7,y-7,5,1.6,'#2A2626');el(g,x+7,y-7,1.6,.6,'#C0463E');ln(g,x+12.5,y-7.8,x+9.5,y-6.4,'#C9BBA2',.6);
    g.fillStyle='#FFFFFF';g.font="4px 'Jua',sans-serif";g.textAlign='center';g.fillText('♪',x+13,y-11)},
  catcushion(g,d,x,y){shadow(g,x+8,y+13,8,2);el(g,x+8,y+10,7.8,4,'#E8A0A8');el(g,x+8,y+9.3,6.6,3.2,'#F4BFC5');
    const cc=d.col||'#E8B77A';el(g,x+8,y+7.5,5.2,3,cc);el(g,x+4,y+6.6,2.6,2.3,cc);poly(g,[x+2.4,y+5.3,x+3,y+3.4,x+4,y+5],cc);poly(g,[x+4.4,y+4.9,x+5.2,y+3.3,x+5.8,y+5.2],cc);
    g.strokeStyle='#3A2E3A';g.lineWidth=.35;g.beginPath();g.arc(x+3.4,y+6.6,.6,.1,Math.PI-.1);g.stroke();g.beginPath();g.arc(x+5,y+6.6,.6,.1,Math.PI-.1);g.stroke();
    g.strokeStyle=mix(cc,'#000',.25);g.lineWidth=1;g.beginPath();g.moveTo(x+12.5,y+8);g.quadraticCurveTo(x+13.5,y+10.5,x+9,y+10.2);g.stroke();for(let k=0;k<3;k++)ln(g,x+7+k*2,y+5.3,x+7.6+k*2,y+7,mix(cc,'#000',.18),.5)},
  candles(g,d,x,y){shadow(g,x+8,y+15,6,1.6);rr(g,x+2,y+4,12,11,1,'#E8D2B4');rr(g,x+2,y+4,12,2,1,'#F4E6D2');ln(g,x+3.5,y+15,x+3.5,y+6,WOODD,.6);
    [[5,-4,'#FBF3E4'],[8.5,-8,'#F4D7C8'],[12,-2,'#FFFFFF']].forEach(([cx,top,c])=>{rr(g,x+cx-1.4,y+top,2.8,4-top,.6,c);el(g,x+cx,y+top-1.5,.7,1.4,'#F5B84E');el(g,x+cx,y+top-1.2,.35,.7,'#FFF2C2');g.save();g.globalAlpha=.18;el(g,x+cx,y+top-1.5,3.5,3.5,'#FFE08A');g.restore()})},
  armchair(g,d,x,y){shadow(g,x+8,y+15,8,2);const c='#D79AA4',cd=mix(c,'#5A2F3A',.25);rr(g,x+1,y-10,14,16,5,cd);rr(g,x+2,y-9,12,13,4.5,c);rr(g,x,y-1,4,10,2,cd);rr(g,x+12,y-1,4,10,2,cd);rr(g,x+3,y+1,10,6,2,mix(c,'#FFFFFF',.12));
    ln(g,x+2,y+9,x+1.6,y+14,WOODD,1);ln(g,x+14,y+9,x+14.4,y+14,WOODD,1);for(const bx of [5,8,11])el(g,x+bx,y-4,.5,.5,cd)},
  floorlamp(g,d,x,y){shadow(g,x+8,y+15,5,1.4);el(g,x+8,y+14,4,1.2,'#8A7B74');ln(g,x+8,y+14,x+8,y-18,'#8A7B74',.9);poly(g,[x+3,y-18,x+13,y-18,x+11,y-27,x+5,y-27],'#F4E6CF');ln(g,x+3,y-18,x+13,y-18,'#E0CDB0',.6);
    const L=typeof lampAt==='function'?lampAt(S.t):0;if(L>.05){g.save();g.globalAlpha=.25*L;el(g,x+8,y-16,8,5,'#FFE9A8');g.restore()}},
  flowerbench(g,d,x,y){shadow(g,x+16,y+15,16,2);rr(g,x+4,y+2,24,3,1,WOODL);rr(g,x+4,y-5,24,2.4,1,WOODL);rr(g,x+4,y-1.6,24,2.4,1,WOODL);ln(g,x+7,y+5,x+7,y+13,WOODD,1);ln(g,x+25,y+5,x+25,y+13,WOODD,1);
    [[x,1],[x+28,-1]].forEach(([px])=>{rr(g,px,y+2,4,12,1,'#C98E6C');for(let k=0;k<3;k++)flowerHead(g,TYPES[(k+(px>x?2:0))%TYPES.length],px+1+k*1.2,y+1-(k%2)*1.6,2.2,100)})},
  cactus(g,d,x,y){shadow(g,x+8,y+15,7,1.6);[[3.6,'#E8D2B4',9,'#6FA35E'],[8,'#D98E6C',13,'#5E9A55'],[12.4,'#EFE6D6',7,'#7FAF6C']].forEach(([cx,pc,hh,cc])=>{rr(g,x+cx-2.6,y+14-hh,5.2,hh,2.4,cc);
    if(hh>10){rr(g,x+cx+1.6,y+14-hh+4,2.2,4,1,cc);rr(g,x+cx-3.8,y+14-hh+6,2.2,3,1,cc)}poly(g,[x+cx-3,y+11,x+cx+3,y+11,x+cx+2.4,y+15,x+cx-2.4,y+15],pc)});flowerHead(g,'rose',x+8,y+14-13,1.6,100)},
  fiddle(g,d,x,y){shadow(g,x+8,y+15,6,1.6);poly(g,[x+4,y+7,x+12,y+7,x+11,y+15,x+5,y+15],'#EFE6D6');ln(g,x+8,y+7,x+8,y-16,'#6E5A44',1);
    [[-1,-16],[1,-13],[-1,-9],[1,-6],[-1,-2],[1,1],[-1,4]].forEach(([s,yy],k)=>{el(g,x+8+s*3.4,y+yy,3.2,2.3,k%2?'#4F8A48':'#5E9A55',s*.5);ln(g,x+8,y+yy+1,x+8+s*3.6,y+yy,'#3E6A38',.3)})},
  birdcage(g,d,x,y){shadow(g,x+8,y+15,5,1.4);ln(g,x+8,y+14,x+8,y-6,'#8A7B74',.8);el(g,x+8,y+14,3.5,1,'#8A7B74');const cy=y-14;g.strokeStyle='#C9A24A';g.lineWidth=.5;
    for(let k=-3;k<=3;k++){g.beginPath();g.moveTo(x+8+k*1.8,cy+7);g.quadraticCurveTo(x+8+k*1.3,cy-7,x+8,cy-8);g.stroke()}rr(g,x+2.2,cy+6.6,11.6,1.4,.6,'#C9A24A');el(g,x+8,cy-8.6,1,1,'#C9A24A');
    leafyBlob(g,x+6,cy+4,2.6,'#7FAF6C','#A6D08F');ln(g,x+10,cy+5,x+11,cy+9,'#6FA35E',.5);flowerHead(g,'gyp',x+10,cy+2,2,100);leafyBlob(g,x+9.5,cy-1,2,'#6FA35E','#9DBB88')},
  piano(g,d,x,y){shadow(g,x+16,y+15,16,2);rr(g,x+1,y-20,30,30,1.4,'#3A2E2A');rr(g,x+2,y-19,28,6,.8,'#4A3C36');rr(g,x+1,y-2,30,4.6,.8,'#2E2420');g.fillStyle='#FBF7EF';g.fillRect(x+2,y-1.3,28,2.8);
    g.fillStyle='#1E1A1A';for(let k=0;k<12;k++)if(k%7!==2&&k%7!==6)g.fillRect(x+3.5+k*2.3,y-1.3,1.1,1.6);ln(g,x+3,y+10,x+3,y+14,'#2E2420',1.2);ln(g,x+29,y+10,x+29,y+14,'#2E2420',1.2);
    rr(g,x+6,y-26,4,6,1.4,'#DDEEF5');flowerHead(g,'rose',x+8,y-27,2.6,100);flowerHead(g,'gyp',x+6.5,y-26,1.8,100);rr(g,x+18,y-24,9,5,.6,'#F6F0E4');ln(g,x+19,y-22.5,x+26,y-22.5,'#8A7B74',.3);ln(g,x+19,y-21,x+25,y-21,'#8A7B74',.3)},
  xmastree(g,d,x,y){shadow(g,x+8,y+15,8,2);rr(g,x+5,y+9,6,6,1,'#C0463E');rr(g,x+5,y+11,6,1.2,.4,'#E2B656');
    [[0,10],[-7,9],[-14,7.5],[-20,6]].forEach(([yy,w],k)=>poly(g,[x+8-w,y+yy+4,x+8+w,y+yy+4,x+8,y+yy-8],k%2?'#3E7A4E':'#4A8A58'));
    const O=[[4,1,'#C0463E'],[11,2,'#E2B656'],[6,-5,'#9CC5D8'],[10,-11,'#C0463E'],[7,-16,'#E2B656'],[13,-4,'#FFFFFF'],[3,-10,'#FFFFFF']];O.forEach(([ox,oy,c])=>{el(g,x+ox,y+oy,1.1,1.1,c)});
    const s=x+8,t=y-29;poly(g,[s,t-3,s+1,t-.8,s+3,t-.6,s+1.5,t+.8,s+2,t+3,s,t+1.6,s-2,t+3,s-1.5,t+.8,s-3,t-.6,s-1,t-.8],'#E2B656')},
  sakura(g,d,x,y){shadow(g,x+8,y+15,6,1.6);poly(g,[x+4,y+8,x+12,y+8,x+11,y+15,x+5,y+15],'#F4EFE6');rr(g,x+4,y+8,8,1.6,.6,'#E8DCCB');ln(g,x+8,y+8,x+8,y-6,'#7A5A4A',1.2);ln(g,x+8,y-3,x+3,y-10,'#7A5A4A',.8);ln(g,x+8,y-5,x+13,y-12,'#7A5A4A',.8);
    const r=seedRand(d.x*3+d.y*7+5);for(let k=0;k<26;k++){const a=r()*Math.PI*2,rad=r()*9;el(g,x+8+Math.cos(a)*rad*1.1,y-14+Math.sin(a)*rad*.8,2.2,1.9,r()<.5?'#F7C3D0':'#FBDDE5')}for(let k=0;k<8;k++)el(g,x+8+(r()-.5)*16,y-14+(r()-.5)*12,.6,.6,'#E88AA2')},
  rug_round(g,d,x,y,w,h){el(g,x+w/2,y+h/2,w/2-2,h/2-2,'#F7DCE5');el(g,x+w/2,y+h/2,w/2-6,h/2-5,'#DDF1EA');el(g,x+w/2,y+h/2,w/2-10,h/2-8,'#FDF1CC');g.strokeStyle='#FFFFFF';g.lineWidth=.6;g.setLineDash([1.5,1.5]);g.beginPath();g.ellipse(x+w/2,y+h/2,w/2-4,h/2-3.5,0,0,7);g.stroke();g.setLineDash([])},
  rug_check(g,d,x,y,w,h){rr(g,x+2,y+2,w-4,h-4,2,'#F4E6D2');g.save();rr(g,x+2,y+2,w-4,h-4,2);g.clip();g.globalAlpha=.45;for(let xx=x+2;xx<x+w;xx+=6)g.fillStyle='#A7C7A0',g.fillRect(xx,y,3,h);for(let yy=y+2;yy<y+h;yy+=6)g.fillStyle='#A7C7A0',g.fillRect(x,yy,w,3);g.restore();
    for(let xx=x+3;xx<x+w-2;xx+=2){ln(g,xx,y+1,xx,y+2.4,'#E8D2B4',.5);ln(g,xx,y+h-2.4,xx,y+h-1,'#E8D2B4',.5)}},
  /* 선물로 받은 소품 */
  picbook(g,d,x,y){shadow(g,x+8,y+15,7,1.8);rr(g,x+1,y-6,14,21,1.2,WOODL);rr(g,x+2,y-5,12,8,.6,'#EAD2B0');rr(g,x+2,y+5,12,8,.6,'#EAD2B0');
    rr(g,x+2.6,y-9,6,8,.6,'#F4B6C4');rr(g,x+3.4,y-8,4.4,4,.4,'#FFF8EE');flowerHead(g,'tulip',x+5.6,y-6.2,1.5,100);rr(g,x+8.8,y-8,4.6,7,.6,'#9DB8E8');rr(g,x+9.4,y-7,3.4,3,.4,'#FFF8EE');el(g,x+11.1,y-5.6,1,1,'#2A2626');
    [['#E2B656',3],['#7FAF6C',5.5],['#C9546A',8],['#B98AC9',10.5]].forEach(([c,bx])=>rr(g,x+bx,y+6,2,6.4,.3,c));g.fillStyle='#8C6448';g.font="2.6px 'Jua',sans-serif";g.textAlign='center';g.fillText('민지',x+8,y+2)},
  readnook(g,d,x,y){shadow(g,x+8,y+15,8,2);const c='#A7C7A0',cd=mix(c,'#2E4A30',.25);rr(g,x+1,y-9,14,15,5,cd);rr(g,x+2,y-8,12,12,4,c);rr(g,x+3,y+1,10,6,2,mix(c,'#FFFFFF',.15));ln(g,x+3,y+8,x+2.5,y+14,WOODD,1);ln(g,x+13,y+8,x+13.5,y+14,WOODD,1);
    rr(g,x+5,y-1,7,2,.5,'#5E7FB0');rr(g,x+5.5,y-2.8,6,1.8,.5,'#E2B656');rr(g,x+6,y-4.4,5,1.6,.5,'#C9546A');ln(g,x+8,y-4.4,x+8.6,y+1.2,'#C9A24A',.5);el(g,x+8.6,y+1.8,.6,.8,'#C9A24A')},
  notedesk(g,d,x,y){shadow(g,x+8,y+15,7,1.8);rr(g,x,y-1,16,3,.8,WOOD);ln(g,x+2,y+2,x+2,y+14,WOODD,1);ln(g,x+14,y+2,x+14,y+14,WOODD,1);rr(g,x+2,y+2,12,3,.6,'#A67C5A');el(g,x+8,y+3.5,.6,.6,'#E2B656');
    rr(g,x+2.5,y-4,5.4,3.2,.4,'#FBF6EA');rr(g,x+8,y-4,5.4,3.2,.4,'#F6F0E2');el(g,x+4.6,y-2.6,1.1,1.1,'#F29AB0');el(g,x+10.5,y-2.5,1.4,.8,'#A6D08F',.5);ln(g,x+13,y-4.5,x+15,y-6.5,'#3A2E2A',.5);rr(g,x+.5,y-8,3.6,4,1,'#DDEEF5');flowerHead(g,'freesia',x+2.3,y-8.5,1.8,100)},
  seapot(g,d,x,y){shadow(g,x+8,y+15,6,1.6);poly(g,[x+3.5,y+6,x+12.5,y+6,x+11,y+15,x+5,y+15],'#6FA3C9');for(let k=0;k<3;k++)ln(g,x+4.5,y+8+k*2.4,x+11.5,y+8+k*2.4,'rgba(255,255,255,.55)',.5);
    for(let k=0;k<9;k++){const a=-Math.PI/2+(k-4)*.22,L=9+(k%3)*2;ln(g,x+8,y+6,x+8+Math.cos(a)*L*.6,y+6+Math.sin(a)*L,CO.leafD,.4);el(g,x+8+Math.cos(a)*L*.6,y+6+Math.sin(a)*L,1.2,1.6,k%2?'#B9A2E0':'#D6C6EC')}
    el(g,x+13.5,y+14,1.8,1.3,'#F6DCC8');ln(g,x+12.5,y+13.4,x+14.5,y+14.6,'#E0B89A',.3)},
  /* 추억 진열장: 선물 받은 작은 추억들이 한 칸씩 채워져요 */
  memocab(g,d,x,y){shadow(g,x+16,y+15,16,2.2);rr(g,x+1,y-32,30,47,1.6,'#A67C5A');rr(g,x+1,y-34,30,4,1.4,'#8C6448');rr(g,x+2.4,y-29.6,27.2,40,1,'#F6EADA');
    const it=d.items||[];for(let k=0;k<9;k++){const r=Math.floor(k/3),c=k%3,sx=x+7+c*9,sy=y-22+r*13;rr(g,x+2.4,sy+5,27.2,1.4,.4,'#C9A07A');const t=it[k];
      if(t&&DECOR_DRAW[t]){g.save();g.translate(sx,sy);g.scale(.52,.52);try{DECOR_DRAW[t](g,{},-8,20,16,16)}catch(e){}g.restore()}}
    g.save();g.globalAlpha=.16;rr(g,x+2.4,y-29.6,13.3,40,1,'#DDEEF5');rr(g,x+16.3,y-29.6,13.3,40,1,'#DDEEF5');g.restore();ln(g,x+16,y-29.6,x+16,y+10.4,'#A67C5A',.8);
    el(g,x+14.6,y-10,.7,.7,'#E2B656');el(g,x+17.4,y-10,.7,.7,'#E2B656');rr(g,x+1,y+10.4,30,4.6,1,'#8C6448');ln(g,x+6,y+3.2,x+26,y+3.2,'rgba(255,255,255,.35)',.4);
    g.fillStyle='#FFF6E6';g.font="3px 'Jua',sans-serif";g.textAlign='center';g.fillText('추억',x+16,y+13.6)},
  portrait_easel(g,d,x,y){shadow(g,x+8,y+15,6,1.6);ln(g,x+3,y+15,x+7,y-12,WOODD,1);ln(g,x+13,y+15,x+9,y-12,WOODD,1);ln(g,x+8,y+15,x+8,y-6,WOODD,.8);ln(g,x+2,y+2,x+14,y+2,WOODD,1);
    g.save();g.translate(x+8,y-12);g.scale(.72,.72);DECOR_DRAW.w_portrait(g,{},-16,21,32,16);g.restore()},
  /* 벽 장식(가게 뒤 벽에만) — y는 벽 줄(2칸) 기준, 위로 그려요 */
  w_flowerart(g,d,x,y){frameV(g,x+2,y-27,12,14,'#C9A57E');rr(g,x+3.5,y-25.5,9,11,.4,'#EEF5F0');ln(g,x+8,y-15,x+8,y-21,CO.leafD,.5);flowerHead(g,'rose',x+8,y-22,2.4,100);el(g,x+6.4,y-18,1.3,.7,'#7FAF6C',-.5)},
  w_pressed(g,d,x,y){[[x+3,'#F29AB0'],[x+13,'#F9D66B'],[x+23,'#B9A2E0']].forEach(([fx,c],k)=>{frameV(g,fx,y-26+(k%2)*2,8,10,'#EFE6D6','#FFFDF6');const cx=fx+4,cy=y-21+(k%2)*2;ln(g,cx,cy+3,cx,cy-1,'#8FB07F',.4);for(let j=0;j<5;j++){const b=j*1.2566;el(g,cx+Math.cos(b)*1.3,cy-1.5+Math.sin(b)*1.3,1,1,c)}})},
  w_macrame(g,d,x,y){ln(g,x+2,y-28,x+14,y-28,WOODD,1.2);for(let k=0;k<6;k++){const sx=x+3.5+k*1.8;ln(g,sx,y-28,sx+(k<3?1:-1)*.8,y-20,'#F1E6D2',.8)}poly(g,[x+4,y-20,x+12,y-20,x+8,y-12],'#F1E6D2');for(let k=0;k<5;k++)ln(g,x+5+k*1.5,y-13,x+5+k*1.5,y-9,'#F1E6D2',.5);el(g,x+8,y-19,1.4,1.4,'#E8D2B4')},
  w_garland(g,d,x,y){g.strokeStyle='#A08A7A';g.lineWidth=.5;g.beginPath();g.moveTo(x+2,y-26);g.quadraticCurveTo(x+16,y-16,x+30,y-26);g.stroke();for(let k=0;k<9;k++){const t=k/8,gx=x+2+28*t,gy=y-26+Math.sin(t*Math.PI)*5;el(g,gx,gy+1.4,1.8,1.3,['#C9A07A','#E3C9A8','#C98E8E','#9DAF8A'][k%4]);el(g,gx+.8,gy+2.6,.9,1.4,'#9DB07F',.4)}},
  w_roundmirror(g,d,x,y){el(g,x+8,y-20,6.4,6.4,'#C9A24A');el(g,x+8,y-20,5.2,5.2,'#DDEEF5');ln(g,x+5.5,y-21,x+8,y-23.5,'rgba(255,255,255,.85)',.7);ln(g,x+8,y-28,x+8,y-26.4,'#C9A24A',.5)},
  w_plantshelf(g,d,x,y){rr(g,x+2,y-15,28,2,.6,WOOD);ln(g,x+5,y-13,x+7,y-10.5,WOODD,.7);ln(g,x+27,y-13,x+25,y-10.5,WOODD,.7);
    [[x+7,'#E8D2B4'],[x+16,'#D98E6C'],[x+25,'#F4F1EA']].forEach(([px,c],k)=>{rr(g,px-2.5,y-20,5,5,1,c);if(k===1){for(let j=0;j<5;j++){const vx=px-2+j;ln(g,vx,y-15,vx+(j-2)*.6,y-10+(j%2)*2,CO.leafD,.4);el(g,vx+(j-2)*.6,y-10+(j%2)*2,1,.7,CO.leaf)}}else leafyBlob(g,px,y-21,2.6,'#7FAF6C','#A6D08F')})},
  w_postcard(g,d,x,y){rr(g,x+1,y-28,14,15,.8,'#C9A07A');rr(g,x+2,y-27,12,13,.4,'#D9B991');rr(g,x+2.8,y-26.2,6.4,4.6,.3,'#9CC5D8');el(g,x+6,y-23.8,1.5,.6,'#FFFFFF');rr(g,x+7,y-21,6,4.2,.3,'#FBF6EA');ln(g,x+8,y-19.6,x+12,y-19.6,'#8A7B74',.3);ln(g,x+8,y-18.4,x+11,y-18.4,'#8A7B74',.3);el(g,x+5.8,y-26.2,.6,.6,'#C0463E');el(g,x+10,y-21,.6,.6,'#E2B656');rr(g,x+3,y-19,3.4,4,.3,'#F4B6C4')},
  w_crayon(g,d,x,y){frameV(g,x+1.5,y-27,13,12,'#F2C230','#FFFFFF');poly(g,[x+4,y-19,x+8,y-23.5,x+12,y-19],'#E8603C');rr(g,x+4.8,y-19,6.4,3,.2,'#FBD0D8');rr(g,x+7.2,y-18,1.6,2,.2,'#8A5A3C');el(g,x+4,y-24.5,1.4,1.4,'#F9D66B');tinyFace(g,x+6,y-17.3,'#3B2A22','#F4D3B7',false);ln(g,x+3.5,y-16.2,x+12.5,y-16.2,'#7FB070',.6)},
  w_pageart(g,d,x,y){frameV(g,x+1.5,y-28,13,14,'#EFE6D6','#FBF6EA');rr(g,x+3,y-26.5,10,6,.3,'#DDEEF5');rr(g,x+5,y-23.5,6,4,.3,'#F4B6C4');poly(g,[x+4.5,y-23.5,x+8,y-26,x+11.5,y-23.5],'#C97B6A');for(let k=0;k<3;k++)ln(g,x+3.5,y-18.5+k*1.3,x+12.5-k*2,y-18.5+k*1.3,'#B0A090',.35)},
  w_portrait(g,d,x,y){frameV(g,x+2,y-29,28,17,'#C9A24A','#FBF1E4');rr(g,x+3.6,y-27.4,24.8,13.8,.5,'#F6E6D2');el(g,x+16,y-20,11,5,'rgba(247,195,208,.35)');
    const P0=PAL[0],P1=PAL[1];tinyFace(g,x+11.5,y-21,P0.hair,P0.skin,false);tinyFace(g,x+20.5,y-21,P1.hair,P1.skin,true);rr(g,x+8.5,y-18,6,4.4,1.8,P0.tee);rr(g,x+17.5,y-18,6,4.4,1.8,P1.tee);flowerHead(g,'rose',x+16,y-16,1.7,100);flowerHead(g,'freesia',x+15,y-15,1.4,100)},
  w_scissors(g,d,x,y){rr(g,x+1.5,y-28,13,14,1.2,'#8C6448');rr(g,x+2.6,y-27,10.8,12,.8,'#F4E6D2');ln(g,x+5,y-19,x+11,y-25.5,'#AFBAC2',1.1);ln(g,x+5,y-25.5,x+11,y-19,'#C9D2D8',1.1);g.strokeStyle='#C9A24A';g.lineWidth=.8;g.beginPath();g.arc(x+4.4,y-18.2,1.4,0,7);g.stroke();g.beginPath();g.arc(x+11.6,y-18.2,1.4,0,7);g.stroke();ln(g,x+8,y-28,x+8,y-29.5,'#8A7B74',.4)},
  w_invite(g,d,x,y){frameV(g,x+2,y-28,12,14,'#E8E2D6','#FFFFFF');g.strokeStyle='#E8C9A8';g.lineWidth=.35;g.strokeRect(x+3.6,y-26.4,8.8,10.8);el(g,x+8,y-23.4,1.8,1.6,'#F29AB0');el(g,x+7,y-24,1.3,1.1,'#F7C3D0');ln(g,x+5,y-19.5,x+11,y-19.5,'#B0A090',.35);ln(g,x+5.6,y-18.2,x+10.4,y-18.2,'#B0A090',.35)},
  w_stamp(g,d,x,y){frameV(g,x+2,y-27,12,12,'#8C6448','#FBF6EA');g.fillStyle='#FFFFFF';g.fillRect(x+4.4,y-24.6,7.2,7.6);g.fillStyle='#F4B6C4';g.fillRect(x+5.2,y-23.8,5.6,6);for(let k=0;k<4;k++){el(g,x+4.4+k*2.4,y-24.6,.45,.45,'#FBF6EA');el(g,x+4.4+k*2.4,y-17,.45,.45,'#FBF6EA')}rr(g,x+6.2,y-22.4,3.6,2.4,.3,'#FFF8EE');poly(g,[x+6,y-22.4,x+8,y-23.8,x+10,y-22.4],'#C97B6A')},
  w_haruphoto(g,d,x,y){rr(g,x+2.5,y-27.5,11,13,.4,'#FFFFFF');rr(g,x+3.4,y-26.6,9.2,8.6,.2,'#CFE3EE');tinyFace(g,x+6.4,y-21.6,'#3B2A22','#F4D3B7',false);rr(g,x+4.4,y-19.2,4,2,.8,'#F5C451');for(let k=0;k<4;k++)flowerHead(g,TYPES[k%TYPES.length],x+9.4+(k%2)*1.4,y-22+(k>>1)*1.4,1.5,100);ln(g,x+4,y-16,x+12,y-16,'#C9BBA2',.3);ln(g,x+8,y-27.5,x+8,y-29,'#E07A7A',.8)},
  w_yunaphoto(g,d,x,y){frameV(g,x+2,y-28,12,14,'#2F2F34','#EEF3F6');rr(g,x+3.4,y-26.6,9.2,11.2,.3,'#DCE8F0');tinyFace(g,x+8,y-22,'#1F1A1E','#F4D3B7',true);poly(g,[x+5,y-18.6,x+11,y-18.6,x+12,y-15.4,x+4,y-15.4],'#3E4A6E');rr(g,x+5,y-26.4,6,1.4,.3,'#1E1E24');ln(g,x+11,y-25.7,x+12,y-23.5,'#E2B656',.35)},
  w_plaque(g,d,x,y){rr(g,x+1.5,y-25,13,9,1,'#8C6448');rr(g,x+2.6,y-24,10.8,7,.6,'#E2C27A');g.fillStyle='#5A3E2A';g.font="2.6px 'Jua',sans-serif";g.textAlign='center';g.fillText('봄 연구실',x+8,y-21.2);g.font="2.1px 'Jua',sans-serif";g.fillText('명예 연구원',x+8,y-18.4);el(g,x+3.4,y-23.2,.4,.4,'#C9A24A');el(g,x+12.6,y-23.2,.4,.4,'#C9A24A')},
  /* 피크닉 가구 */
  picnictable(g,d,x,y){shadow(g,x+16,y+15,16,2.4);const W='#D9B48A',Wd='#B08660';ln(g,x+5,y+2,x+2,y+14,Wd,1.2);ln(g,x+5,y+2,x+9,y+14,Wd,1.2);ln(g,x+27,y+2,x+23,y+14,Wd,1.2);ln(g,x+27,y+2,x+30,y+14,Wd,1.2);
    rr(g,x,y-4,32,6,1.2,W);for(let k=1;k<5;k++)ln(g,x+k*6.4,y-4,x+k*6.4,y+2,Wd,.35);rr(g,x,y+1,32,1.4,.6,Wd);
    rr(g,x+4,y-9,8,5,1.2,'#C99A63');g.strokeStyle='#A87A48';g.lineWidth=.6;g.beginPath();g.arc(x+8,y-9,3.4,Math.PI,0);g.stroke();el(g,x+6,y-9.5,1.6,1.2,'#E8603C');el(g,x+9.5,y-9.6,1.5,1.1,'#F5CF4E');
    rr(g,x+18,y-10,3.4,6,1,'#FBF7EF');rr(g,x+18,y-8,3.4,3,.6,'#F6B7A0');rr(g,x+23,y-7,6,3,.8,'#FFFFFF');el(g,x+26,y-7.2,2.2,.8,'#E9A34A')},
  campchair(g,d,x,y){shadow(g,x+8,y+15,7,1.8);const F='#5E6A6E',C=d.c||'#7F9A6A';ln(g,x+2,y+14,x+13,y+2,F,.9);ln(g,x+14,y+14,x+3,y+2,F,.9);
    rr(g,x+2,y-10,12,12,2,mix(C,'#000',.12));rr(g,x+2.6,y-9.4,10.8,10.8,1.6,C);rr(g,x+1.5,y+1,13,4,1.6,mix(C,'#FFFFFF',.1));ln(g,x+1,y-1,x+1,y+4,F,1);ln(g,x+15,y-1,x+15,y+4,F,1);
    rr(g,x-.4,y-1.6,3,2,.6,F);rr(g,x+13.4,y-1.6,3,2,.6,F);el(g,x+14.9,y-2.2,1.1,.6,'#2A2A33');ln(g,x+4,y-6,x+12,y-6,'rgba(255,255,255,.25)',.6)},
  picnicmat(g,d,x,y,w,h){rr(g,x+2,y+3,w-4,h-6,1.5,'#FFFFFF');g.save();rr(g,x+2,y+3,w-4,h-6,1.5);g.clip();g.globalAlpha=.6;for(let xx=x+2;xx<x+w;xx+=6){g.fillStyle='#E88A8A';g.fillRect(xx,y,3,h)}for(let yy=y+3;yy<y+h;yy+=6){g.fillStyle='#E88A8A';g.fillRect(x,yy,w,3)}g.restore();
    for(let xx=x+3;xx<x+w-2;xx+=2){ln(g,xx,y+2,xx,y+3.4,'#F2D6D6',.5);ln(g,xx,y+h-3.4,xx,y+h-2,'#F2D6D6',.5)}},
  /* 준엽 이야기 마지막 선물 */
  mugtable(g,d,x,y){shadow(g,x+8,y+15,6,1.6);el(g,x+8,y-1,7,2.4,'#D9B48A');el(g,x+8,y-1.6,7,2.2,'#E8CBA5');ln(g,x+8,y,x+8,y+14,'#B08660',1.2);el(g,x+8,y+14,4,1,'#B08660');
  [[x+4.5,'#F5CF4E'],[x+11,'#B9A2E0']].forEach(([mx,c])=>{rr(g,mx-2,y-7,4,5,1,c);g.strokeStyle=c;g.lineWidth=.6;g.beginPath();g.arc(mx+2.3,y-4.6,1.3,-1.4,1.4);g.stroke();el(g,mx,y-7,1.9,.6,mix(c,'#000',.25))});el(g,x+8,y-9.5,1.2,1,'#F29AB0');el(g,x+7.2,y-10,.7,.6,'#F29AB0');el(g,x+8.8,y-10,.7,.6,'#F29AB0')}
});
/* 장소 바닥 그림의 크기(q)와 이름표(key). Phaser로 그릴 때는 화면이 실제로 쓰는 해상도(PR.R)만큼만 그려요
   (TV는 그보다 작게 ×0.7 → 메모리 절약, 바닥은 부드러운 색이라 차이가 적어요) */
function bgSpec(area,s){
  let q=PR.on?PR.R*(prIsTV()?.7:1):Math.min(DPR,1.6);const A0=AREAS[area];const BUD=PR.on?(prIsTV()?4.5e6:8.5e6):(LITE?3.5e6:9e6);
  while(A0.w*TILE*s*q*A0.h*TILE*s*q>BUD||(PR.on&&Math.max(A0.w,A0.h)*TILE*s*q>PR.maxTex))q*=.85;
  // 가게 바닥만 꾸미기·업그레이드에 따라 바뀌어요. 다른 장소는 물건을 사도 다시 그리지 않아요
  return {q,key:area+'|'+s.toFixed(3)+'|'+q.toFixed(3)+(area==='shop'?'|'+JSON.stringify(S.up)+'|'+S.style:'')}}
function bgDraw(area,s,q){
  const A=AREAS[area];const cv=document.createElement('canvas');cv.width=Math.ceil(A.w*TILE*s*q);cv.height=Math.ceil(A.h*TILE*s*q);
  const g=cv.getContext('2d');g.setTransform(s*q,0,0,s*q,0,0);
  (AREA_STATIC[area]||{shop:shopStatic,market:marketStatic,supply:supplyStatic,town:townStatic,north:northStatic}[area])(g);
  return cv}
function bgCanvas(area,s){ // 예전 방식(Phaser를 못 쓸 때) 전용
  const sp=bgSpec(area,s);if(BG_CACHE[sp.key])return BG_CACHE[sp.key];
  const cv=bgDraw(area,s,sp.q);BG_CACHE[sp.key]=cv;return cv;
}

/* ---------- world ---------- */
function inView(x,y,m){if(!VIEW)return true;m=m||40;if(VIEWS&&VIEWS.length>1){for(const R of VIEWS)if(x>R[0]-m&&x<R[2]+m&&y>R[1]-m&&y<R[3]+m*1.8)return true;return false}return x>VIEW[0]-m&&x<VIEW[2]+m&&y>VIEW[1]-m&&y<VIEW[3]+m*1.8}
function drawWorldV(g,area){
  const dyn=AREA_DYNAMIC[area]||{shop:shopDynamic,market:marketDynamic,supply:supplyDynamic,town:townDynamic,north:northDynamic}[area];if(dyn)dyn(g);
  const sts=stationsIn(area);
  S.chars.forEach(c=>{
    if(c.area!==area||c.modal||c.rest||c.waterT>0)return;if(S.mode==='solo'&&c.i!==S.active)return;
    const a=.82+.18*Math.sin(performance.now()/220);
    if(S.edit&&area==='shop'){if(c.carry)return;const f=furnAt(c);if(!f)return;const b=f.type?visRect(f):[f.x*TILE,f.y*TILE-8,f.w*TILE,f.h*TILE+8];rr(g,b[0]-1.5,b[1]-1.5,b[2]+3,b[3]+3,3);g.strokeStyle=`rgba(255,255,255,${a})`;g.lineWidth=1.6;g.stroke();return}
    const s=targetOf(c);if(!s)return;
    if(s.type==='npc'){g.beginPath();g.ellipse(s.walker.x,s.walker.y,8,2.6,0,0,7);g.strokeStyle=`rgba(255,255,255,${a})`;g.lineWidth=1.3;g.stroke();return}
    const b=visRect(s);rr(g,b[0]-1.5,b[1]-1.5,b[2]+3,b[3]+3,3);g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=3.2;g.stroke();g.strokeStyle=`rgba(255,255,255,${a})`;g.lineWidth=1.5;g.stroke();
  });
  S.puffs.forEach(q=>{if(q.area!==area)return;g.globalAlpha=(1-q.t/.5)*.55;el(g,q.x,q.y-1,2+q.t*9,1+q.t*3,'#FFFFFF');g.globalAlpha=1});
  const ents=[];
  sts.forEach(s=>{if(!inView((s.x+s.w/2)*TILE,(s.y+s.h)*TILE,s.w*8+30))return;ents.push({y:(s.y+s.h)*TILE-(s.type==='bench'?6:2),draw:()=>{drawStationV(g,s)}})});
  DECOR[area].forEach(d=>{if(d.flat&&d.walk&&!d.carried&&inView((d.x+d.w/2)*TILE,(d.y+d.h)*TILE,d.w*8+20))drawDecor(g,d)});
  DECOR[area].forEach(d=>{if(d.flat||d.carried||!inView((d.x+d.w/2)*TILE,(d.y+d.h)*TILE,d.w*8+(d.t==='school'?120:40)))return;ents.push({y:d.wall?d.y*TILE-6:(d.y+d.h)*TILE-2,draw:()=>drawDecor(g,d)})});
  S.chars.forEach(c=>{if(c.area!==area)return;ents.push({y:c.y+(c.rest?2:0),draw:()=>{
    if(S.mode==='solo'&&S.active===c.i){g.save();g.beginPath();g.ellipse(c.x,c.y,7.5,2.4,0,0,7);g.strokeStyle=PAL[c.i].tag;g.globalAlpha=.75;g.lineWidth=1;g.stroke();g.restore()}
    const [hx,hy,behind]=handPos(c);
    const H=heldItem(c);if(H&&behind)drawItemV(g,H,hx,hy);
    drawChar(g,c.x,c.y,palOf(c),c.ang,c.anim,c.moving,false,!!(c.modal&&['trim','craft','wrap'].includes(c.modal.type))||c.waterT>0,!!c.rest);
    if(c.waterT>0){const [dx]=DIRV[c.dir];const sx=c.x+(dx>=0?6:-6),sy=c.y-12,tilt=Math.sin(performance.now()/200)*.15;g.save();g.translate(sx,sy);if(dx<0)g.scale(-1,1);g.rotate(.5+tilt);el(g,0,0,4,3.2,'#9CC5D8');ln(g,3,-1,8,-4,'#9CC5D8',1.2);g.strokeStyle='#7FA7C9';g.lineWidth=.7;g.beginPath();g.arc(-1,-3,2.4,Math.PI,0);g.stroke();g.restore();
      const tt=performance.now()/1000;for(let k=0;k<5;k++){const ph=(tt*2.2+k/5)%1;el(g,sx+(dx>=0?1:-1)*(10+ph*6),sy-2+ph*12,.7,1.2,'#7FB8E6')}}
    else if(H&&!behind)drawItemV(g,H,hx,hy);
    if(c.bag.filter(Boolean).length>1){rr(g,c.x+(behind?-7:5),c.y-15,4.5,5,1.2,'#D6B27A');ln(g,c.x+(behind?-6.5:5.5),c.y-15,c.x+(behind?-4.2:8.3),c.y-17,'#B58E57',.5)}
  }})});
  S.customers.forEach(k=>{if((k.area||'shop')!==area||!inView(k.x,k.y))return;ents.push({y:k.y,draw:()=>{drawChar(g,k.x,k.y,k.pal,k.dir,k.walk,k.state==='move'&&!k.talking,false);if(k.bouquet)drawItemV(g,k.bouquet,k.x,k.y-11)}})});
  S.walkers.forEach(w=>{if(w.hidden||wArea(w)!==area||!inView(w.x,w.y))return;ents.push({y:w.y+(w.dz||0),draw:()=>drawChar(g,w.x,w.y+(w.yo||0),w.pal,w.dir,w.walk,!!w.mv&&!w.sit,false,w.throwT>0,!!w.sit)});
    if(w.dog){const d=w.dog;ents.push({y:d.y,draw:()=>{const [hx,hy]=[w.x+(DIRV[w.dir][0]>=0?5:-5),w.y-12];g.strokeStyle='#C65C79';g.lineWidth=.45;g.beginPath();g.moveTo(hx,hy);g.quadraticCurveTo((hx+d.x)/2,Math.max(hy,d.y)+2,d.x+(d.dir==='left'?-3:3),d.y-6);g.stroke();drawDog(g,d);dogHearts(g,d)}})}});
  allCats().forEach(k=>{if(k.area===area&&inView(k.x,k.y))ents.push({y:k.y,draw:()=>drawCat(g,k)})});
  if(area==='shop'&&S.edit)S.chars.forEach(c=>{if(!c.carry||c.area!=='shop')return;const f=c.carry,[x,y]=placeSpot(c,f),ok=spotOK(f,x,y);ents.push({y:9999,draw:()=>{const ox=f.x,oy=f.y;f.x=x;f.y=y;g.globalAlpha=.6;if(f.type)drawStationV(g,f);else drawDecor(g,f);g.globalAlpha=1;f.x=ox;f.y=oy;rr(g,x*TILE,y*TILE,f.w*TILE,f.h*TILE,2);g.strokeStyle=ok?'rgba(127,192,106,.95)':'rgba(224,112,140,.95)';g.lineWidth=1.4;g.setLineDash([3,2]);g.stroke();g.setLineDash([])}})});
  ents.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
}

/* ---------- time of day (lights) ---------- */
function lightsFor(area){
  if(AREA_LIGHTS[area])return AREA_LIGHTS[area]();
  if(area==='shop'){const W=AREAS.shop.w*TILE;const a=[[112,10],[208,10]];for(let x=320;x<W-16;x+=96)a.push([x,10]);if(S.up.lights)for(let x=40;x<W-16;x+=48)a.push([x,7]);return a}
  if(area==='town'||area==='north')return DECOR[area].filter(d=>d.t==='lamp').map(d=>[d.x*TILE+8,d.y*TILE-24]);
  if(area==='market')return [[80,10],[208,10]];
  return [[112,10]];
}

/* ---------- render ---------- */
function viewports(){
  const hud=$('#hud');const top=hud&&hud.style.display!=='none'?Math.max(48,Math.round(hud.getBoundingClientRect().bottom)+4):48,H=CH-top;const [a,b]=S.chars;const full={x:0,y:top,w:CW,h:H};
  if(a.area===b.area){
    const s=Math.min(CW/VW,H/VH)*wideZ(a.area);const mw=AREAS[a.area].w*TILE;
    if(mw<=CW/s)return [{...full,area:a.area,chars:[0,1]}];
    if(Math.abs(a.x-b.x)<CW/s-70&&Math.abs(a.y-b.y)<H/s-60)return [{...full,area:a.area,chars:[0,1]}];
  }
  return [{area:a.area,x:0,y:top,w:CW/2-2,h:H,chars:[0],split:true},{area:b.area,x:CW/2+2,y:top,w:CW/2-2,h:H,chars:[1],split:true}];
}
function camera(v){
  const A=AREAS[v.area],mw=A.w*TILE,mh=A.h*TILE;const s=Math.min(v.w/VW,v.h/VH)*wideZ(v.area);const vw=v.w/s,vh=v.h/s;const lead=S.chars[v.chars[0]];const up=v.area==='town'?(lead&&lead.y>22.5*TILE?-26:30):v.area==='north'?36:8;
  let tx,ty;if(v.chars.length===2){tx=(S.chars[0].x+S.chars[1].x)/2;ty=(S.chars[0].y+S.chars[1].y)/2-up}else{const c=S.chars[v.chars[0]];tx=c.x;ty=c.y-up}
  const cx=mw<=vw?mw/2:clamp(tx,vw/2,mw-vw/2),cy=mh<=vh?mh/2:clamp(ty,vh/2,mh-vh/2);
  return {s,mw,mh,ox:v.x+v.w/2-cx*s,oy:v.y+v.h/2-cy*s-(mh<=vh?4:0)};
}
function render(){if(PR.on){prRender();return}renderLegacy()}
function renderLegacy(){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.fillStyle=DARK.matches&&!document.documentElement.dataset.theme?'#2F3A36':'#E3EFE6';ctx.fillRect(0,0,CW,CH);
  if(!(S.phase==='play'||S.phase==='settle'||S.phase==='intro')||!S.chars.length)return;
  viewports().forEach(v=>{
    const cam=camera(v);Object.assign(v,cam);const {s,ox,oy,mw,mh}=cam;
    const x0=Math.max(v.x,ox),y0=Math.max(v.y,oy),x1=Math.min(v.x+v.w,ox+mw*s),y1=Math.min(v.y+v.h,oy+mh*s);
    const viewers=S.mode==='solo'?[S.chars[S.active]].filter(c=>v.chars.includes(c.i)):v.chars.map(i=>S.chars[i]);
    if(viewers.length&&viewers.every(sunsetView)){ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);roundRect(v.x,v.y,v.w,v.h,14);ctx.clip();drawSunsetScene(ctx,v.x,v.y,v.w,v.h,v.chars.map(i=>S.chars[i]).filter(sunsetView));ctx.restore();return}
    ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);roundRect(x0,y0,x1-x0,y1-y0,14);ctx.clip();
    ctx.drawImage(bgCanvas(v.area,s),ox,oy,mw*s,mh*s);
    RENDER_SCALE=DPR*s;VIEW=[(v.x-ox)/s,(v.y-oy)/s,(v.x+v.w-ox)/s,(v.y+v.h-oy)/s];
    ctx.setTransform(DPR*s,0,0,DPR*s,DPR*ox,DPR*oy);drawWorldV(ctx,v.area);VIEW=null;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    const [ac,aa]=ambientAt(S.t);const k=v.area==='town'?1:.7;if(aa>0){ctx.globalAlpha=aa*k;ctx.fillStyle=ac;ctx.fillRect(x0,y0,x1-x0,y1-y0);ctx.globalAlpha=1}
    const L=lampAt(S.t);
    if(L>0){ctx.globalCompositeOperation='lighter';const LS=lightSprite();ctx.globalAlpha=.32*L;lightsFor(v.area).forEach(([lx,ly])=>{const X=ox+lx*s,Y=oy+ly*s,r=(v.area==='town'||v.area==='north'?55:80)*s;if(X<v.x-r||X>v.x+v.w+r||Y<v.y-r||Y>v.y+v.h+r)return;ctx.drawImage(LS,X-r,Y-r,r*2,r*2)});ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
    const fd=Math.max(...v.chars.map(i=>S.chars[i].fade));if(fd>0){ctx.globalAlpha=fd*.7;ctx.fillStyle='#FFF8EE';ctx.fillRect(x0,y0,x1-x0,y1-y0);ctx.globalAlpha=1}
    ctx.restore();ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.lineWidth=2;ctx.strokeStyle=(v.split&&S.mode==='solo'&&v.chars[0]===S.active)?PAL[S.active].tag:'rgba(74,63,92,.3)';roundRect(x0,y0,x1-x0,y1-y0,14);ctx.stroke();
    overlays(v);
  });
}
let LSPR=null;function lightSprite(){if(LSPR)return LSPR;LSPR=document.createElement('canvas');LSPR.width=LSPR.height=64;const g=LSPR.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,214,150,1)');gr.addColorStop(1,'rgba(255,214,150,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return LSPR}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function pillText(txt,x,y,bg,fg,size){
  if(PR.on){prPill(txt,x,y,bg,fg,size);return}
  size=Math.round((size||11)*Math.max(1.35,Math.min(2.4,CH/330)));ctx.font=`${size}px 'Jua','Gowun Dodum',sans-serif`;const w=ctx.measureText(txt).width+size*1.1,h=size+size*.75;
  ctx.fillStyle=bg;roundRect(x-w/2,y-h,w,h,h/2);ctx.fill();ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,x,y-h/2+1);
}
function overlays(v){
  const S2=(wx,wy)=>[v.ox+wx*v.s,v.oy+wy*v.s];
  const inV=(x,y)=>x>v.x&&x<v.x+v.w&&y>v.y+10&&y<v.y+v.h;
  if(v.area==='shop'){
    S.customers.forEach(k=>{if(k.kind!=='order'||k.state!=='wait')return;const o=orderById(k.orderId);if(!o)return;
      const late=Math.max(0,S.t-o.time),disc=Math.min(50,Math.floor(late/30)*10);const [x,y]=S2(k.x,k.y-32);pillText(`${o.title}${disc?` −${disc}%`:''}`,x,y,'rgba(255,253,249,.96)',disc?'#C65C79':'#4A3F5C')});
    if(ringingCall()){const ph=S.st.phone;const [x,y]=S2((ph.x+.5)*TILE,ph.y*TILE-8);pillText('따르릉',x,y,'#FBDDE4','#4A3F5C')}
  }
  if(v.area==='shop'){S.customers.forEach(k=>{if(k.area!=='shop'||k.kind!=='reserve'||k.state!=='wait'||k.talking)return;const [x,y]=S2(k.x,k.y-32);pillText('예약하고 싶어요',x,y,'#FBDDE4','#4A3F5C',10)});
    S.customers.forEach(k=>{if(k.area==='shop'&&k.say&&k.state==='move'){const [x,y]=S2(k.x,k.y-32);pillText(k.say,x,y,'rgba(255,253,249,.9)','#7A6E86',9)}})}
  /* 이야기가 준비된 메인 주민의 혼잣말 말풍선 → 가서 말을 걸면 이야기가 시작돼요 */
  /* 가까이(캠퍼스 약 8칸, 그 밖 약 6칸) 다가간 사람이 있을 때만 보여요 — 멀리서는 혼잣말을 하지 않아요 */
  S.walkers.forEach(w=>{if(!w.main||!w.mono||w.hidden||w.talking||(w.monoT||0)>6.5||(wArea(w)!==v.area&&w.zone!==v.area))return;const RN=(v.area==='campus'?8:6)*TILE;if(!S.chars.some(c=>c.area===v.area&&Math.hypot(c.x-w.x,c.y-w.y)<RN))return;const [x,y]=S2(w.x,w.y+(w.yo||0)-48*(w.pal&&w.pal.sc||1));if(inV(x,y))pillText(w.mono,x,y,'#FFFFFF','#6A5F7A',10)});
  if(WIDE_AREAS[v.area]){
    S.walkers.forEach(w=>{if(!w.offer||wArea(w)!==v.area)return;const [x,y]=S2(w.x,w.y-33);if(inV(x,y))pillText('예약하고 싶어요',x,y,'#FBDDE4','#4A3F5C',10)})}
  if(v.area==='market'){
    if(S.t>=MARKET_CLOSE){const [x,y]=S2(144,70);pillText('오늘 꽃시장은 문을 닫았어요',x,y,'rgba(255,253,249,.95)','#4A3F5C',12)}
    else stationsIn('market').forEach(s=>{if(s.type!=='stall')return;const [x,y]=S2((s.x+s.w/2)*TILE,(s.y+s.h)*TILE+12);pillText(won(S.prices[s.flower]),x,y,'rgba(255,253,249,.92)','#4A3F5C',10)});
  }
}

/* ---------- loop ---------- */
let last=performance.now();
/* 게임 계산은 1/60초 간격으로 일정하게, 화면은 그 사이를 부드럽게 이어서 그림 */
const STEP=1/60;let ACC=0;
function prMovers(){const a=S.chars.concat(S.customers||[],S.walkers||[]);(S.walkers||[]).forEach(w=>{if(w.dog)a.push(w.dog)});allCats().forEach(k=>a.push(k));return a}
function prSnap(){prMovers().forEach(o=>{o._px=o.x;o._py=o.y;o._pa=o.area})}
function prTick(now){
  const _t0=performance.now();PR.lastTickT=_t0;
  try{prTick0(now,_t0)}catch(e){perfErr(e,'계산')}
}
function prTick0(now,_t0){
  let dt=(now-last)/1000;last=now;if(!(dt>0))dt=0;if(dt>.25)dt=.25;
  try{pollPads(dt)}catch(e){}
  const playing=S.phase==='play'&&!S.paused&&innerWidth>=innerHeight;
  /* 밀린 계산은 한 프레임에 최대 2번만 해요(느린 프레임 → 계산 몰림 → 더 느린 프레임 악순환 방지).
     대신 한 번에 조금 더 긴 시간(최대 1/20초)을 계산해서, TV가 느려도 게임 속 시간·걷는 속도는 그대로예요 */
  let n=0;
  if(playing){ACC+=dt;if(ACC>=STEP){n=Math.min(2,Math.floor(ACC/STEP));const h=Math.min(ACC/n,.05);for(let i=0;i<n;i++){prSnap();update(h)}ACC-=n*h;if(ACC>=STEP)ACC=0}
    updateActionButtons();updateHUD();refreshLiveModals(dt)}else ACC=0;
  const _t1=performance.now();
  const k=playing?ACC/STEP:1,ms=[];
  if(k<1)prMovers().forEach(o=>{if(o._px==null||o._pa!==o.area)return;const dx=o.x-o._px,dy=o.y-o._py;if(dx*dx+dy*dy>1600||(!dx&&!dy))return;ms.push([o,o.x,o.y]);o.x=o._px+dx*k;o.y=o._py+dy*k});
  const b0=PR.bakes,c0=PR.cbakes,g0=PR.bgMs,h0=PR.chunkMs;
  try{render()}catch(e){perfErr(e,'그림')} // 그림 오류가 나도 게임이 멈추지 않게
  finally{ms.forEach(([o,x,y])=>{o.x=x;o.y=y})}
  const _t2=performance.now();
  PERF.cur={upd:_t1-_t0,steps:n,ren:_t2-_t1,bk:PR.bakes-b0,cb:PR.cbakes-c0,bg:PR.bgMs-g0,ch:PR.chunkMs-h0};
  PERF.cpu+=_t1-_t0;PERF.ren+=_t2-_t1;
}
/* ---------- 성능 표시 (설정 → 성능 표시) ----------
   TV에서 사진을 찍어 보내 주면 어디가 무거운지 알 수 있게 자세히 보여 줘요 */
const PERF={on:false,el:null,frames:0,cpu:0,ren:0,gpu:0,worst:0,worstWhy:'',lastT:0,prevF:0,cur:null,errs:0,lastErr:'',min:{ms:0,why:'',t:0},lost:0};
try{PERF.lost=+(localStorage.getItem('ourflowershop_perf_lost')||0);PERF.oldErr=(JSON.parse(localStorage.getItem('ourflowershop_perf_err')||'[]')[0]||'').slice(0,160)}catch(e){}
/* 오류 기록: 화면 오른쪽 아래 성능 표시에 나오고, TV에 최근 3개를 남겨 둬요(다음에 원인을 찾을 수 있게) */
function perfErr(e,where){PERF.errs++;const m=(where?where+': ':'')+String(e&&e.message||e).slice(0,80);PERF.lastErr=m;if(PERF.errs<5)console.error(e);
  const now=performance.now();PERF.errT=(PERF.errT||[]).filter(t=>now-t<5000);PERF.errT.push(now);
  if(PERF.errs<=20){try{const L=JSON.parse(localStorage.getItem('ourflowershop_perf_err')||'[]');const st=String(e&&e.stack||'').split('\n').slice(1,3).map(x=>x.trim().replace(/^at /,'').replace(/https?:\/\/[^ )]*\//g,'')).join(' < ');
    L.unshift(new Date().toLocaleString()+' '+m+(st?' ('+st+')':''));localStorage.setItem('ourflowershop_perf_err',JSON.stringify(L.slice(0,3)))}catch(_){}}
  if(PERF.errT.length>=90&&!PR.lostOnce){try{prContextLost('오류가 계속 나서')}catch(_){}}} // 5초 동안 계속 오류가 나면 저장하고 다시 불러오기
/* 감시: 화면이 켜져 있는데 5초 넘게 그림이 멈춰 있으면(엔진이 멈춤) 저장하고 다시 불러와요 */
let VIS_T=performance.now();document.addEventListener('visibilitychange',()=>{VIS_T=performance.now()});
setInterval(()=>{if(!PR.on||PR.lostOnce||document.hidden||!PR.lastTickT)return;const now=performance.now();if(now-VIS_T<8000)return;
  if(now-PR.lastTickT>5000){try{prContextLost('화면이 멈춰서')}catch(e){}}},1000);
function perfShow(){PERF.on=!!SET.perf;if(PERF.on&&!PERF.el){PERF.el=document.createElement('div');PERF.el.id='perf';PERF.el.style.cssText='font:17px/1.45 "Jua",sans-serif;max-width:46vw;white-space:pre-wrap';document.body.appendChild(PERF.el);PERF.lastT=performance.now()}
  if(PERF.el)PERF.el.style.display=PERF.on?'block':'none'}
function perfWhy(c,gap){if(!c)return '';const p=[];p.push(`계산 ${c.upd.toFixed(0)}ms(${c.steps}번)`);p.push(`그림 준비 ${c.ren.toFixed(0)}ms`);
  if(c.bg>1)p.push(`바닥 그리기 ${c.bg.toFixed(0)}ms`);if(c.ch>1)p.push(`캠퍼스 땅 ${c.ch.toFixed(0)}ms`);if(c.bk)p.push(`가구 굽기 ${c.bk}개`);if(c.cb)p.push(`사람 굽기 ${c.cb}개`);if(c.gpu!=null)p.push(`그리기 명령 ${c.gpu.toFixed(0)}ms`);
  if(gap!=null){const rest=gap-c.upd-c.ren-(c.gpu||0);if(rest>8)p.push(`그 밖(그래픽 칩 대기·메모리 정리 등) ${rest.toFixed(0)}ms`)}return p.join(' · ')}
function perfMem(){const M={c:0,s:0,b:0,h:0,p:0};
  try{for(const [k,e] of PR.tex){const lk=e.lkey||k,b=e.w*e.h*4;if(lk[0]==='c'||lk[0]==='i'||lk.startsWith('L|'))M.c+=b;else if(lk.startsWith('pill|')||lk.startsWith('fx|'))M.p+=b;else M.s+=b}
    for(const q in PR_POOL){const [w,h]=q.split('x').map(Number);M.c+=PR_POOL[q].length*w*h*4}
    for(const a in PR.areaObj){const o=PR.areaObj[a];if(o.bgKey)M.b+=o.bgBytes||0;if(o.ch)for(const c of o.ch.values())M.h+=c.sz*c.sz*4}
    (PR.chunkPool||[]).forEach(q=>M.h+=q.sz*q.sz*4)}catch(e){}
  const f=x=>Math.round(x/1048576);return `그림 메모리: 사람·물건 ${f(M.c)} · 가구·건물 ${f(M.s+M.p)} · 바닥 ${f(M.b)} · 캠퍼스 땅 ${f(M.h)} = ${f(M.c+M.s+M.p+M.b+M.h)}MB`}
function perfFrame(now){if(!PERF.on)return;PERF.frames++;const gap=now-(PERF.prevF||now);PERF.prevF=now;
  if(PERF.cur){PERF.cur.gpu=PERF.lastGpu}
  if(gap>PERF.worst){PERF.worst=gap;PERF.worstWhy=perfWhy(PERF.cur,gap)}
  if(S.phase==='play'&&(gap>PERF.min.ms||now-PERF.min.t>60000)){PERF.min={ms:gap,why:perfWhy(PERF.cur,gap),t:now}} // 아침 준비 화면은 빼고 기록
  const el=now-PERF.lastT;if(el<1000)return;
  const heap=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576)+'MB':'-';
  const f=PERF.frames*1000/el,F=PERF.frames||1;
  const bk=PR.bakes-(PERF.b0||0),cb=PR.cbakes-(PERF.c0||0);PERF.b0=PR.bakes;PERF.c0=PR.cbakes;
  PERF.el.textContent=`FPS ${f.toFixed(0)} · 가장 느린 프레임 ${PERF.worst.toFixed(0)}ms\n  └ ${PERF.worstWhy}\n`+
    `1초 평균: 계산 ${(PERF.cpu/F).toFixed(1)}ms · 그림 준비 ${(PERF.ren/F).toFixed(1)}ms · 그리기 명령 ${(PERF.gpu/F).toFixed(1)}ms\n`+
    `굽기: 가구 ${bk}개/초 · 사람 ${cb}개/초\n${perfMem()}\n`+
    `최근 1분 최악 ${PERF.min.ms.toFixed(0)}ms (${Math.round((now-PERF.min.t)/1000)}초 전)\n  └ ${PERF.min.why}\n`+
    `JS 메모리 ${heap} · 해상도 ${(DPR||1).toFixed(2)}배 · 화면 그림 객체 ${PR.sc?PR.sc.children.list.length:0}개\n자동 다시 불러오기 ${PERF.lost}회 · 오류 ${PERF.errs}${PERF.lastErr?' ('+PERF.lastErr+')':''}${PERF.oldErr?'\n지난 오류: '+PERF.oldErr:''}`;
  PERF.frames=0;PERF.cpu=0;PERF.ren=0;PERF.gpu=0;PERF.worst=0;PERF.lastT=now}
function loop(now){
  if(PR.on)return;
  const dt=Math.min(.05,(now-last)/1000);last=now;
  try{pollPads(dt)}catch(e){}
  if(S.phase==='play'&&!S.paused&&innerWidth>=innerHeight){update(dt);updateActionButtons();updateHUD();refreshLiveModals(dt)}
  FRAME^=1;if(!LITE||FRAME)render();requestAnimationFrame(loop);
}
