'use strict';
/* 우리 둘의 꽃집 — game-10-campus.js : 성균관대학교 자연과학캠퍼스(마을 동쪽)
   · 보내 준 캠퍼스 조감도의 배치를 위에서 본 지도로 옮김(대략 72×41칸)
   · 가운데 삼성학술정보관: 전체 유리 외벽, 위에서 보면 펼친 책, 은행잎이 겹친 지붕, 원통형 중앙홀, 안쪽 원색(노랑 스터디룸·빨강 계단·파랑·연두)
   · 마을 동쪽 큰길 → 캠퍼스 서쪽 후문으로 들어와요
   · 이번에는 바깥 풍경·걸어 다니기만 (건물 안은 나중에) */
AREAS.campus={w:72,h:41};
AOFF.campus=24000;
WIDE_AREAS.campus=1;ZONE_AREA.campus='campus';

/* ---------- 오가는 길: 마을 오른쪽 큰길 ↔ 캠퍼스 후문(서쪽) ---------- */
SIDE_GAPS.town=(SIDE_GAPS.town||[]).concat([[1,8,11]]);
SIDE_GAPS.campus=(SIDE_GAPS.campus||[]).concat([[-1,18,20]]);
DOORS.push(
  {area:'town',edge:'right',x:56.55*TILE,y0:7.8*TILE,y1:12*TILE,to:'campus',sx:2.1*TILE,sy:19.6*TILE,dir:'right'},
  {area:'campus',edge:'left',x:.95*TILE,y0:17.8*TILE,y1:21*TILE,to:'town',sx:55.5*TILE,sy:10*TILE,dir:'left'}
);

/* ---------- 도로·광장·운동장(배경) 정의 [x,y,w,h] 칸 단위 ---------- */
const CP={
  roads:[[0,18,30,3],[29,4,3,36],[18,8,44,2],[31,22,41,2],[50,4,3,24],[31,31,18,2],[10,35,21,2],[44,26,28,2],[62,4,2,19],[8,24,3,11]],
  plaza:[32,11,16,12],
  lawnL:[7,14,21,4],lawnR:[45,11,16,5],field:[3,25,12,8],court:[12,33,6,4],tennis:[53,24,7,3],
  fieldS:[20,37,8,3],parkS:[33,33,10,6],solar1:[54,28,8,4],solar2:[36,26,6,3]
};
AREA_SOLID.campus=(px,py,tx,ty)=>{if(ty<2||ty>=AREAS.campus.h-1)return true;return undefined};

/* ---------- 건물(장식) ---------- */
// b: 재질(brick 붉은 벽돌 / white 흰 외벽 / glass 유리 / beige), H: 벽 높이(픽셀), label: 확실한 건물만 이름표
DECOR_BASE.campus=[
  {t:'samsunglib',x:36,y:14,w:9,h:4},
  {t:'zigzag',x:18,y:11,w:15,h:2,label:'제1공학관'},
  {t:'cblock',x:33,y:5,w:11,h:3,b:'brick',H:54,label:'제2공학관'},
  {t:'cblock',x:36,y:2,w:5,h:1,b:'brick',H:42,label:'N센터'},
  {t:'cblock',x:20,y:5,w:6,h:2,b:'white',H:30},{t:'cblock',x:27,y:5,w:5,h:2,b:'beige',H:34},
  {t:'cblock',x:4,y:10,w:13,h:3,b:'brick',H:72,glass:true,label:'기숙사'},
  {t:'cblock',x:45,y:8,w:5,h:2,b:'white',H:40},
  {t:'cblock',x:54,y:5,w:8,h:2,b:'white',H:56,label:'종합연구동'},{t:'cblock',x:54,y:9,w:7,h:2,b:'white',H:44},
  {t:'curvedglass',x:64,y:10,w:7,h:8},
  {t:'cblock',x:24,y:20,w:6,h:2,b:'brick',H:44},
  {t:'cblock',x:15,y:21,w:4,h:2,b:'brick',H:34},
  {t:'cblock',x:18,y:26,w:11,h:3,b:'white',H:46,roof:'skylight'},
  {t:'cblock',x:37,y:26,w:9,h:3,b:'glass',H:104,label:'의학관'},
  {t:'cblock',x:33,y:34,w:0,h:0,b:'none',H:0},
  {t:'cblock',x:54,y:17,w:10,h:3,b:'white',H:52,label:'과학관'},{t:'cblock',x:65,y:19,w:5,h:2,b:'beige',H:40},
  {t:'cblock',x:13,y:28,w:0,h:0,b:'none',H:0},
  {t:'cblock',x:14,y:29,w:10,h:3,b:'white',H:40,roof:'blue',label:'체육관'},
  {t:'cblock',x:44,y:29,w:6,h:2,b:'brick',H:30},
  {t:'cgate',x:1,y:17,w:1,h:1,label:'후문'},{t:'cgate',x:1,y:21,w:1,h:1},
  {t:'cgate',x:66,y:26,w:1,h:1,label:'정문'},{t:'cgate',x:66,y:28,w:1,h:1}
].filter(d=>d.w>0);
// 가로수·은행나무(교목) — 도서관 앞은 노란 은행나무 줄
[[33,10],[35,10],[45,10],[47,10],[33,22],[35,22],[45,22],[47,22],[32,13],[32,16],[32,19],[47,13],[47,16],[47,19]].forEach(([x,y])=>DECOR_BASE.campus.push({t:'tree',v:'ginkgo',x,y,w:1,h:1}));
[[8,13],[12,13],[16,13],[20,13],[24,13],[27,15],[27,17],[8,18],[12,18],[16,21],[20,17],[23,17],[46,17],[50,17],[57,16],[60,12],[45,13],[58,20],[4,33],[8,33],[22,33],[26,33],[21,36],[29,36],[32,39],[40,39],[44,34],[60,33],[64,33],[68,33],[70,24],[66,22]].forEach(([x,y],k)=>DECOR_BASE.campus.push({t:'tree',v:['round','maple','pine','birch'][k%4],x,y,w:1,h:1}));
[[52,13,'big']].forEach(([x,y])=>DECOR_BASE.campus.push({t:'bigtree',x,y,w:2,h:1}));
[[17,19],[33,20],[46,20],[31,26],[49,21],[41,31],[26,34],[10,20],[60,25]].forEach(([x,y])=>DECOR_BASE.campus.push({t:'lamp',x,y,w:1,h:1}));
Object.defineProperty(DECOR,'campus',{get(){return DECOR_BASE.campus},configurable:true});
Object.assign(PR_DEB,{samsunglib:[-18,-150,18,22],zigzag:[-6,-60,6,6],cblock:d=>[-6,-((d.H||40)+(d.wing?20:0)+14),10,10],curvedglass:[-6,-70,6,6],cgate:[-6,-40,6,4],bigtree:[-14,-46,14,4]});
STATION_DEFS.push(['cb1','bench','campus',38,21,2,1],['cb2','bench','campus',41,21,2,1],['cb3','bench','campus',12,16,2,1],['cb4','bench','campus',48,13,2,1],['cb5','bench','campus',35,35,2,1]);

/* ---------- 배경 ---------- */
function campusStatic(g){
  const W=AREAS.campus.w*TILE,H=AREAS.campus.h*TILE,q=seedRand(91),T=TILE,R=a=>a.map(v=>v*T);
  g.fillStyle='#A9CC8E';g.fillRect(0,0,W,H);for(let k=0;k<700;k++)el(g,q()*W,q()*H,1.3+q(),.8,q()<.5?'#B7D69E':'#9CC282');
  // 바깥 담장 띠
  g.fillStyle='#8FB878';g.fillRect(0,0,W,30);for(let x=-8;x<W+16;x+=18){el(g,x,30,13,9,'#86B070')}
  // 보도(도로 양옆) + 도로
  CP.roads.forEach(r=>{const [x,y,w,h]=R(r);rr(g,x-4,y-4,w+8,h+8,6,'#E4DDD2')});
  CP.roads.forEach(r=>{const [x,y,w,h]=R(r);rr(g,x,y,w,h,4,'#CFCCC6');g.fillStyle='rgba(255,255,255,.5)';if(w>h)for(let xx=x+6;xx<x+w-6;xx+=18)g.fillRect(xx,y+h/2-.6,8,1.2);else for(let yy=y+6;yy<y+h-6;yy+=18)g.fillRect(x+w/2-.6,yy,1.2,8)});
  // 도서관 광장(화강석 포장 + 둥근 패턴)
  {const [x,y,w,h]=R(CP.plaza);rr(g,x,y,w,h,14,'#EDE6DA');for(let yy=y+8;yy<y+h;yy+=12)for(let xx=x+8;xx<x+w;xx+=12)rr(g,xx-5,yy-5,10,10,1.5,(xx+yy)%24?'#E3DACB':'#F2ECE2');
    g.strokeStyle='rgba(200,185,160,.6)';g.lineWidth=1.2;g.beginPath();g.ellipse(x+w/2,y+h-26,70,14,0,0,7);g.stroke()}
  // 잔디밭(왼쪽 공원: 동그라미 산책길 / 오른쪽 큰 나무 잔디)
  {const [x,y,w,h]=R(CP.lawnL);rr(g,x,y,w,h,12,'#96C57A');g.strokeStyle='#E9E1D2';g.lineWidth=5;[[x+w*.28,y+h*.5,w*.2,h*.36],[x+w*.62,y+h*.5,w*.24,h*.38]].forEach(([cx,cy,rx,ry])=>{g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,7);g.stroke()});g.beginPath();g.moveTo(x+w*.48,y+h*.5);g.lineTo(x+w*.38,y+h*.5);g.stroke()}
  {const [x,y,w,h]=R(CP.lawnR);rr(g,x,y,w,h,10,'#8FC274');for(let k=0;k<60;k++)el(g,x+q()*w,y+q()*h,1.2,.8,'#A6D18B')}
  // 대운동장(흙 축구장)
  const pitch=(r,col,line)=>{const [x,y,w,h]=R(r);rr(g,x,y,w,h,6,col);g.strokeStyle=line;g.lineWidth=1.3;g.strokeRect(x+6,y+6,w-12,h-12);g.beginPath();g.moveTo(x+w/2,y+6);g.lineTo(x+w/2,y+h-6);g.stroke();g.beginPath();g.arc(x+w/2,y+h/2,Math.min(w,h)*.16,0,7);g.stroke();g.strokeRect(x+6,y+h/2-h*.18,w*.1,h*.36);g.strokeRect(x+w-6-w*.1,y+h/2-h*.18,w*.1,h*.36)};
  pitch(CP.field,'#D9C08E','rgba(255,255,255,.85)');pitch(CP.fieldS,'#D9C08E','rgba(255,255,255,.85)');pitch(CP.court,'#5FAF86','rgba(255,255,255,.9)');
  {const [x,y,w,h]=R(CP.tennis);rr(g,x,y,w,h,3,'#6CB592');g.strokeStyle='#FFFFFF';g.lineWidth=1;g.strokeRect(x+4,y+4,w/2-6,h-8);g.strokeRect(x+w/2+2,y+4,w/2-6,h-8);g.fillStyle='#E7EFEA';g.fillRect(x-2,y-2,w+4,2)}
  // 아래쪽 삼각 공원
  {const [x,y,w,h]=R(CP.parkS);g.beginPath();g.moveTo(x,y+h);g.lineTo(x+w*.25,y);g.lineTo(x+w,y+h*.15);g.lineTo(x+w,y+h);g.closePath();g.fillStyle='#6FAF7E';g.fill();g.strokeStyle='#E9E1D2';g.lineWidth=4;g.beginPath();g.arc(x+w*.55,y+h*.9,w*.4,Math.PI,Math.PI*1.8);g.stroke()}
  // 태양광 주차장
  [CP.solar1,CP.solar2].forEach(r=>{const [x,y,w,h]=R(r);rr(g,x,y,w,h,3,'#C2C0BB');for(let yy=y+4;yy<y+h-4;yy+=12)for(let xx=x+4;xx<x+w-6;xx+=16){rr(g,xx,yy,14,9,1,'#5A74A0');ln(g,xx+7,yy,xx+7,yy+9,'#8EA6CC',.5);ln(g,xx,yy+4.5,xx+14,yy+4.5,'#8EA6CC',.5)}});
  // 가장자리 담장
  g.fillStyle='#C9B79A';g.fillRect(0,H-14,W,14);for(let x=4;x<W;x+=14)rr(g,x,H-18,10,6,2,'#D8C9AE');
}
AREA_STATIC.campus=campusStatic;
AREA_DYNAMIC.campus=()=>{};
/* 마을 쪽 이정표 + 큰길 이어짐 */
{const _prev=AREA_STATIC.town||townStatic;AREA_STATIC.town=g=>{_prev(g);const X=AREAS.town.w*TILE;signBoard(g,X-34,7.2*TILE,'성균관대 →',{size:6,min:46,line:'#5E86B8',fg:'#34507E'})}}

/* ---------- 건물 그림 ---------- */
const MAT={brick:{wall:'#B8674B',wallD:'#9C5540',roof:'#CFC7BC',win:'#3E5C7E',frame:'#F2E6D8'},white:{wall:'#EEF0F1',wallD:'#D4D9DD',roof:'#DADCDC',win:'#7E9CBC',frame:'#FFFFFF'},
  beige:{wall:'#E9DCC6',wallD:'#D2C3A9',roof:'#DAD3C6',win:'#6E8AAA',frame:'#FFF8EC'},glass:{wall:'#9CC4DE',wallD:'#7AA6C4',roof:'#D9E2E6',win:'#5E88AE',frame:'#EAF3F8'}};
function cWindows(g,x0,y0,w,h,M,glassWall){
  if(glassWall){const gg=g.createLinearGradient(x0,y0,x0+w,y0+h);gg.addColorStop(0,'#BFDDEF');gg.addColorStop(.5,'#8DB9D8');gg.addColorStop(1,'#6E9CC0');g.fillStyle=gg;g.fillRect(x0,y0,w,h);
    for(let x=x0;x<x0+w;x+=8)ln(g,x,y0,x,y0+h,'rgba(230,240,248,.7)',.6);for(let y=y0;y<y0+h;y+=10)ln(g,x0,y,x0+w,y,'rgba(230,240,248,.8)',.8);
    g.save();g.globalAlpha=.35;for(let k=0;k<3;k++)poly(g,[x0+w*(.1+k*.3),y0,x0+w*(.18+k*.3),y0,x0+w*(.05+k*.3),y0+h,x0+w*(-.03+k*.3),y0+h],'#FFFFFF');g.restore();return}
  for(let y=y0+4;y<y0+h-8;y+=11)for(let x=x0+4;x<x0+w-7;x+=10){rr(g,x,y,7,7,.6,M.frame);rr(g,x+.8,y+.8,5.4,5.4,.4,M.win);el(g,x+2,y+2,.8,1.2,'rgba(255,255,255,.5)')}
}
function cBlock(g,d,x,y,w,h){
  const M=MAT[d.b]||MAT.white,H=d.H||40,by=y+h,fy=by-H,ry=y-H; // 앞면: fy~by, 지붕: ry~fy
  shadow(g,x+w/2,by+3,w/2+6,5);
  // 지붕
  rr(g,x,ry,w,h,1,d.roof==='blue'?'#8FB3D6':M.roof);g.fillStyle='rgba(0,0,0,.06)';g.fillRect(x,fy-3,w,3);
  ln(g,x+1,ry+1.5,x+w-1,ry+1.5,'rgba(255,255,255,.7)',1.2);
  if(d.roof==='skylight')for(let xx=x+8;xx<x+w-10;xx+=16)poly(g,[xx,fy-4,xx+6,ry+4,xx+12,fy-4],'#B9D3E6');
  else for(let k=0;k<Math.max(1,Math.floor(w/40));k++)rr(g,x+10+k*36,ry+4,10,6,1,'#B7B3AD');
  if(d.wing==='L'){rr(g,x+w-40,ry-18,40,20,1,M.roof);rr(g,x+w-40,fy-18,40,18,1,M.wall)}
  // 앞면
  const wg=g.createLinearGradient(x,0,x+w,0);wg.addColorStop(0,M.wallD);wg.addColorStop(.2,M.wall);wg.addColorStop(1,M.wallD);rr(g,x,fy,w,H,1,wg);
  if(d.b==='brick'){g.save();g.globalAlpha=.18;for(let yy=fy+3;yy<by;yy+=3)ln(g,x,yy,x+w,yy,'#6E3A2A',.4);g.restore()}
  cWindows(g,x+2,fy+2,w-4,H-10,M,d.b==='glass'||d.glass&&false);
  if(d.glass){const gx=x+w*.62,gw=w*.3;cWindows(g,gx,fy-6,gw,H-2,M,true)}
  // 현관
  const cx=x+w/2;rr(g,cx-9,by-14,18,14,1,'#5E7890');rr(g,cx-8,by-13,7,12,.5,'#A9C7DE');rr(g,cx+1,by-13,7,12,.5,'#A9C7DE');rr(g,cx-12,by-17,24,3,1,'#8E9398');
  rr(g,x,by-2,w,3,1,'rgba(0,0,0,.12)');
  if(d.label)signBoard(g,cx,fy+H*.18,d.label,{size:6,min:34,line:d.b==='brick'?'#9C5540':'#5E86B8',fg:'#3E3440',bg:'#FFFFFF'});
}
Object.assign(DECOR_DRAW,{
  cblock:(g,d,x,y,w,h)=>cBlock(g,d,x,y,w,h),
  zigzag(g,d,x,y,w,h){ // 제1공학관: 지그재그로 이어진 긴 건물
    const n=5,sw=w/n;for(let k=0;k<n;k++){const off=k%2?-10:6;cBlock(g,{b:'beige',H:44,label:k===2?d.label:null},x+k*sw,y+off,sw+4,h)}},
  curvedglass(g,d,x,y,w,h){ // 오른쪽 끝 곡면 유리 건물
    const by=y+h,H=56;shadow(g,x+w/2,by+3,w/2+4,5);
    g.beginPath();g.moveTo(x,by);g.quadraticCurveTo(x+w*.5,by-24,x+w,by-8);g.lineTo(x+w,by-8-H);g.quadraticCurveTo(x+w*.5,by-24-H-10,x,by-H);g.closePath();
    const gg=g.createLinearGradient(x,0,x+w,0);gg.addColorStop(0,'#7FA9C9');gg.addColorStop(.5,'#B7D6EA');gg.addColorStop(1,'#6E98BA');g.fillStyle=gg;g.fill();
    for(let k=1;k<6;k++){const t=k/6;g.beginPath();g.moveTo(x,by-t*H);g.quadraticCurveTo(x+w*.5,by-24-t*(H+10),x+w,by-8-t*H);g.strokeStyle='rgba(240,248,255,.8)';g.lineWidth=.8;g.stroke()}
    for(let k=1;k<10;k++){const xx=x+k*w/10;ln(g,xx,by-10-Math.sin(Math.PI*k/10)*12,xx,by-10-Math.sin(Math.PI*k/10)*12-H,'rgba(240,248,255,.6)',.5)}
    g.beginPath();g.moveTo(x,by-H);g.quadraticCurveTo(x+w*.5,by-24-H-10,x+w,by-8-H);g.strokeStyle='#E8EEF2';g.lineWidth=3;g.stroke()},
  cgate(g,d,x,y,w,h){ // 교문 기둥(붉은 벽돌)
    shadow(g,x+8,y+15,6,2);rr(g,x+3,y-22,10,37,1,'#A65A42');for(let yy=y-20;yy<y+14;yy+=4)ln(g,x+3,yy,x+13,yy,'rgba(80,30,20,.25)',.4);rr(g,x+1,y-26,14,5,1,'#8E4A36');
    if(d.label)signBoard(g,x+8,y-34,d.label,{size:5,min:26,line:'#9C5540',fg:'#5B2E22',bg:'#FFF8EC'})},
  bigtree(g,d,x,y,w,h){ // 잔디밭의 큰 느티나무
    const cx=x+w/2,by=y+h;shadow(g,cx,by,26,6);rr(g,cx-4,by-26,8,26,3,'#7A5A40');
    for(const [ox,oy,r] of [[-14,-34,14],[12,-36,15],[0,-48,17],[-20,-44,10],[20,-46,11]])el(g,cx+ox,by+oy,r,r*.85,'#4F8A45');
    for(const [ox,oy,r] of [[-8,-50,8],[10,-44,7],[-16,-38,6]])el(g,cx+ox,by+oy,r,r*.7,'#6BA35C')},
  samsunglib:(g,d,x,y,w,h)=>drawSamsungLib(g,x,y,w,h)
});
/* 삼성학술정보관
   · 위에서 보면 펼친 책: 가운데 원통형 중앙홀을 축으로 양쪽 날개가 부채처럼 휘어져 펼쳐짐
   · 외벽 전체 유리(층마다 가로 띠, 세로 멀리언), 7층
   · 지붕은 은행잎 여러 장이 겹친 모양, 가운데 타원 천창
   · 유리 너머로 원색 내부: 노랑 스터디룸, 빨강 계단, 파랑 멀티미디어, 연두 의자 */
function drawSamsungLib(g,x,y,w,h){
  const by=y+h,cx=x+w/2,H=96,top=by-H,floors=7,fh=(H-8)/floors;
  shadow(g,cx,by+6,w/2+16,9);
  // 넓은 계단·기단
  for(let k=0;k<3;k++)rr(g,x-10+k*4,by-2+k*3,w+20-k*8,5,2,k%2?'#E3DACB':'#EDE6DA');
  const wing=(dir,layer)=>{ // 날개(펼친 책장): 가운데 등에서 바깥으로 갈수록 높아지며 휘어짐. layer 0=뒤 책장, 1=앞 책장
    const x0=cx+dir*4,x1=cx+dir*(w/2+18-layer*10),yL=by-6+layer*2,rise=26-layer*8,hh=H-10-layer*18;
    const bot=(u)=>yL-Math.sin(u*Math.PI*.5)*6,tp=(u)=>yL-hh-u*u*rise;
    g.beginPath();g.moveTo(x0,bot(0));for(let u=.1;u<=1.001;u+=.1)g.lineTo(x0+(x1-x0)*u,bot(u));for(let u=1;u>=-.001;u-=.1)g.lineTo(x0+(x1-x0)*u,tp(u));g.closePath();
    const gg=g.createLinearGradient(x0,0,x1,0);gg.addColorStop(0,layer?'#9DC7E2':'#86B4D4');gg.addColorStop(.55,layer?'#B9DAEE':'#9CC6E0');gg.addColorStop(1,layer?'#7EAACC':'#6A9BC0');g.fillStyle=gg;g.fill();
    // 유리 너머 원색 내부(노랑 스터디룸·빨강·파랑·연두)
    const cols=['rgba(247,208,74,.6)','rgba(224,96,80,.45)','rgba(90,140,210,.45)','rgba(170,220,90,.5)'];
    for(let f=0;f<floors;f++)for(let s2=0;s2<6;s2++){if((f*2+s2+layer)%4)continue;const u0=.08+s2*.15,u1=u0+.09;const yA=(u)=>bot(u)-(bot(u)-tp(u))*(f+.15)/floors,yB=(u)=>bot(u)-(bot(u)-tp(u))*(f+.75)/floors;
      g.fillStyle=cols[(f+s2+(dir>0?1:0))%4];g.beginPath();g.moveTo(x0+(x1-x0)*u0,yA(u0));g.lineTo(x0+(x1-x0)*u1,yA(u1));g.lineTo(x0+(x1-x0)*u1,yB(u1));g.lineTo(x0+(x1-x0)*u0,yB(u0));g.closePath();g.fill()}
    // 층 띠 + 세로 멀리언
    for(let f=0;f<=floors;f++){g.beginPath();for(let u=0;u<=1.001;u+=.1){const xx=x0+(x1-x0)*u,yy=bot(u)-(bot(u)-tp(u))*f/floors;u?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.strokeStyle='rgba(240,248,255,.85)';g.lineWidth=f%floors?.7:1.6;g.stroke()}
    for(let k=1;k<14;k++){const u=k/14,xx=x0+(x1-x0)*u;ln(g,xx,bot(u),xx,tp(u),'rgba(235,245,252,.5)',.45)}
    // 하늘 반사
    g.save();g.globalAlpha=.3;const ua=.25,ub=.36;g.beginPath();g.moveTo(x0+(x1-x0)*ua,bot(ua));g.lineTo(x0+(x1-x0)*ub,bot(ub));g.lineTo(x0+(x1-x0)*(ub+.14),tp(ub+.14));g.lineTo(x0+(x1-x0)*(ua+.14),tp(ua+.14));g.closePath();g.fillStyle='#FFFFFF';g.fill();g.restore();
    // 책장 윗모서리(흰 처마)
    g.beginPath();for(let u=0;u<=1.001;u+=.1){const xx=x0+(x1-x0)*u;u?g.lineTo(xx,tp(u)):g.moveTo(xx,tp(u))}g.strokeStyle='#F4F7F9';g.lineWidth=3.2;g.stroke();
    ln(g,x1,tp(1),x1,bot(1),'#E8EEF2',2);
  };
  wing(-1,0);wing(1,0);wing(-1,1);wing(1,1);

  // 지붕: 은행잎 여러 장이 겹친 모양 + 가운데 타원 천창
  const leaf=(lx,ly,s,rot,col)=>{g.save();g.translate(lx,ly);g.rotate(rot);g.beginPath();g.moveTo(0,s*.35);g.bezierCurveTo(-s*.9,-s*.1,-s*.8,-s*.8,-s*.25,-s*.72);g.quadraticCurveTo(0,-s*.55,s*.25,-s*.72);g.bezierCurveTo(s*.8,-s*.8,s*.9,-s*.1,0,s*.35);g.closePath();g.fillStyle=col;g.fill();g.strokeStyle='rgba(160,175,185,.7)';g.lineWidth=.8;g.stroke();g.restore()};
  leaf(cx-30,top+2,34,-.5,'#E6ECEF');leaf(cx+30,top+2,34,.5,'#E6ECEF');leaf(cx-14,top-4,36,-.2,'#EEF2F4');leaf(cx+14,top-4,36,.2,'#EEF2F4');leaf(cx,top-8,38,0,'#F6F8F9');
  el(g,cx,top-14,14,6,'#7FB2DA');el(g,cx,top-14,11,4.2,'#A9D2EE');el(g,cx-4,top-15.5,4,1.2,'rgba(255,255,255,.8)');
  // 가운데 원통형 중앙홀(천장까지 열린 노란 빛)
  const hx=cx-15,hw=30;const cg=g.createLinearGradient(hx,0,hx+hw,0);cg.addColorStop(0,'#E9D27A');cg.addColorStop(.5,'#FFF1B8');cg.addColorStop(1,'#E2C466');
  rr(g,hx,top+4,hw,by-top-8,6,cg);for(let f=1;f<floors;f++){const yy=top+4+f*(by-top-8)/floors;ln(g,hx+2,yy,hx+hw-2,yy,'rgba(200,160,60,.5)',.8)}
  ln(g,hx+hw*.7,top+10,hx+hw*.7,by-10,'#E0604F',1.6);for(let f=0;f<6;f++){const yy=top+14+f*12;ln(g,hx+hw*.7-4,yy,hx+hw*.7+4,yy-4,'#E0604F',1)} // 빨간 계단
  g.save();g.globalAlpha=.4;rr(g,hx+3,top+6,4,by-top-14,2,'#FFFFFF');g.restore();
  // 입구 캐노피 + 유리문 + 간판
  rr(g,cx-24,by-22,48,4,1.5,'#F4F7F9');ln(g,cx-22,by-18,cx-22,by-6,'#B7C3CB',1);ln(g,cx+22,by-18,cx+22,by-6,'#B7C3CB',1);
  rr(g,cx-12,by-18,24,14,1,'#5E7890');rr(g,cx-11,by-17,10,12,.5,'#CFE3EE');rr(g,cx+1,by-17,10,12,.5,'#CFE3EE');
  signBoard(g,cx,by-30,'삼성학술정보관',{size:6,min:62,line:'#5E86B8',fg:'#23324A',bg:'#FFFFFF'});
}
/* ---------- 저녁 불빛: 가로등 + 도서관 창 ---------- */
AREA_LIGHTS.campus=()=>{const L=DECOR.campus.filter(d=>d.t==='lamp').map(d=>[d.x*TILE+8,d.y*TILE-24]);L.push([40.5*TILE,16*TILE],[37*TILE,15*TILE],[44*TILE,15*TILE]);return L};

/* ---------- 산책하는 학생들 ---------- */
{const _pk=park;park=function(zone){if(zone==='campus'){for(let n=0;n<30;n++){const x=rnd(2,70)*TILE,y=rnd(3,39)*TILE;if(!blocked('campus',x,y))return [x,y]}return [30*TILE,20*TILE]}return _pk(zone)}}
{const _mw=makeWalkers;makeWalkers=function(){_mw();for(let k=0;k<9;k++){const w=mkWalker(k%4===3?'adult':'student','campus');[w.x,w.y]=park('campus');w.tx=w.x;w.ty=w.y;S.walkers.push(w)}S.walkers.push(...mkCouple('campus'))}}
// 같은 이름이 두 번 나오지 않게(주요 주민 이름은 그대로 두고 나머지만 다시 뽑아요)
{const _mw2=makeWalkers;makeWalkers=function(){_mw2();const used=new Set(S.walkers.filter(w=>w.main).map(w=>w.name));
 for(const w of S.walkers){if(w.main||!w.name)continue;if(used.has(w.name)){const L=(isFemName(w.name)?NAMES_F:NAMES_M).filter(n=>!used.has(n));if(L.length)w.name=pick(L)}used.add(w.name)}}}
