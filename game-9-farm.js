'use strict';
/* 우리 둘의 꽃집 — game-9-farm.js : 농막(마을 남동쪽)
   · 작은 농막 집, 목공소로 쓰는 비닐하우스, 캠핑 텐트와 모닥불, 텃밭, 코스모스 밭
   · 길냥이 5마리(치즈·고등어·삼색이·턱시도·모찌)
   · 마을 호수 산책로 오른쪽 끝으로 걸어가면 들어와요
   새 장소 추가 방법이 한 파일에 모여 있어요: 크기 → 문 → 충돌 → 배경 → 장식 → 조명 → 동물 */
AREAS.farm={w:40,h:26};
AOFF.farm=20000;
WIDE_AREAS.farm=1;ZONE_AREA.farm='farm';

/* ---------- 오가는 길 ---------- */
SIDE_GAPS.town=(SIDE_GAPS.town||[]).concat([[1,24,26]]);   // 마을 오른쪽 끝(호수 산책로 높이)
SIDE_GAPS.farm=(SIDE_GAPS.farm||[]).concat([[-1,11,13]]);  // 농막 왼쪽 끝
DOORS.push(
  {area:'town',edge:'right',x:56.55*TILE,y0:23.8*TILE,y1:27*TILE,to:'farm',sx:1.9*TILE,sy:12.7*TILE,dir:'right'},
  {area:'farm',edge:'left',x:.95*TILE,y0:10.8*TILE,y1:14*TILE,to:'town',sx:55.5*TILE,sy:25.5*TILE,dir:'left'}
);

/* ---------- 충돌 ---------- */
const FARM_GARDEN=[3,4,6,4],FARM_COSMOS=[30,19,8,5];
AREA_SOLID.farm=(px,py,tx,ty)=>{
  if(ty<3||ty>=AREAS.farm.h-1)return true;
  const inR=(r)=>tx>=r[0]&&tx<r[0]+r[2]&&ty>=r[1]&&ty<r[1]+r[3];
  if(inR(FARM_GARDEN)||inR(FARM_COSMOS))return true;
  return undefined;
};

/* ---------- 장식(건물·텐트 등) ---------- */
DECOR_BASE.farm=[
  {t:'farmhouse',x:10,y:5,w:6,h:3},
  {t:'greenhouse',x:23,y:4,w:11,h:4},
  {t:'woodpile',x:35,y:7,w:2,h:1},
  {t:'tent',x:25,y:15,w:5,h:3},
  {t:'firepit',x:22,y:17,w:1,h:1},
  {t:'lightpole',x:20,y:13,w:1,h:1},{t:'lightpole',x:31,y:13,w:1,h:1},
  {t:'picnic',x:5,y:16,w:3,h:1},
  {t:'cathouse',x:17,y:8,w:2,h:1},
  {t:'catbowls',x:19,y:9,w:1,h:1,flat:true,walk:true},
  {t:'mailbox',x:2,y:9,w:1,h:1},
  {t:'farmsign',x:3,y:10,w:1,h:1},
  ...[[1,3,'pine'],[4,3,'maple'],[7,3,'pine'],[17,3,'ginkgo'],[20,3,'pine'],[36,3,'maple'],[38,4,'pine'],[38,9,'ginkgo'],[38,14,'pine'],[1,17,'maple'],[1,22,'pine'],[12,23,'ginkgo'],[20,23,'birch'],[27,23,'pine']].map(([x,y,v])=>({t:'tree',v,x,y,w:1,h:1}))
];
Object.defineProperty(DECOR,'farm',{get(){return DECOR_BASE.farm},configurable:true});
Object.assign(PR_DEB,{farmhouse:[-8,-78,10,14],greenhouse:[-6,-62,6,8],woodpile:[0,-12,0,2],tent:[-10,-44,14,10],firepit:[-8,-26,8,4],lightpole:[-2,-44,2,1],picnic:[0,-10,0,4],cathouse:[0,-18,0,2],catbowls:[0,0,0,0],farmsign:[-10,-26,10,2]});

/* 캠핑 의자(앉아 쉬기) — 모닥불을 바라보고 앉아요 */
STATION_DEFS.push(['fc1','bench','farm',21,19,2,1],['fc2','bench','farm',24,19,2,1]);
{const _ms=makeStations;makeStations=function(){_ms();['fc1','fc2'].forEach(id=>{const s=S.st[id];if(s){s.up=true;s.camp=true}})}}

/* ---------- 배경(땅·길·텃밭·코스모스 밭) ---------- */
function farmStatic(g){
  const W=AREAS.farm.w*TILE,H=AREAS.farm.h*TILE,q=seedRand(77);
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#9CC47F');gr.addColorStop(1,'#8DBA72');g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let k=0;k<420;k++){const x=q()*W,y=48+q()*(H-48);el(g,x,y,1.4+q()*1.4,.8+q()*.6,q()<.5?'#A9CF8C':'#83B068')}
  for(let k=0;k<70;k++){const x=q()*W,y=56+q()*(H-70);const c=['#FFFFFF','#F7D66B','#F4A6B8'][k%3];el(g,x,y,1.1,1.1,c)}
  // 위쪽 숲 띠
  g.fillStyle='#6E9E5A';g.fillRect(0,0,W,40);for(let x=-8;x<W+16;x+=18){el(g,x,40,14,10,'#79A964');el(g,x+9,34,12,9,'#6A9855')}
  // 흙길: 입구 → 마당 → 텐트
  const path=(pts,w,col)=>{g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke()};
  path([[0,200],[60,200],[120,186],[170,176]],30,'#D9C39E');path([[0,200],[60,200],[120,186],[170,176]],24,'#E6D3B0');
  // 자갈 마당
  rr(g,150,132,380,90,30,'#E3D5BC');for(let k=0;k<260;k++){el(g,158+q()*364,138+q()*80,.9+q()*.8,.7,q()<.5?'#CFBFA2':'#F0E6D4')}
  path([[330,220],[360,250],[380,262]],22,'#E6D3B0');
  // 텃밭(나무 틀 + 채소)
  const [gx,gy,gw,gh]=FARM_GARDEN.map(v=>v*TILE);rr(g,gx-3,gy-3,gw+6,gh+6,4,'#A67C55');rr(g,gx,gy,gw,gh,3,'#7A5A40');
  for(let r=0;r<4;r++)for(let c=0;c<9;c++){const x=gx+8+c*10.4,y=gy+10+r*15;el(g,x,y+2,4.6,2.2,'#5E4430');el(g,x,y,4.4,3.6,r%2?'#8DC06C':'#A7D383');el(g,x-1.5,y-1,1.6,1.2,'#C9E6B0')}
  // 코스모스 밭(울타리)
  const [cx,cy,cw,ch]=FARM_COSMOS.map(v=>v*TILE);rr(g,cx,cy,cw,ch,6,'#7FAE63');
  for(let k=0;k<150;k++){const x=cx+6+q()*(cw-12),y=cy+6+q()*(ch-10);ln(g,x,y+5,x+(q()-.5)*2,y,'#5E8C47',.5);const c=['#F4A6C0','#FFFFFF','#E57AA6','#F9C9DA'][k%4];for(let p=0;p<6;p++){const a=p*1.047;el(g,x+Math.cos(a)*1.6,y+Math.sin(a)*1.6,1.2,.8,c,a)}el(g,x,y,.8,.8,'#F2C230')}
  for(let x=cx-4;x<=cx+cw+4;x+=14){g.fillStyle='#A67C55';g.fillRect(x,cy-6,3,12);g.fillRect(x,cy+ch-6,3,12)}g.fillStyle='#BF946A';g.fillRect(cx-4,cy-3,cw+8,2);g.fillRect(cx-4,cy+ch-3,cw+8,2);
  // 아래·오른쪽 나무 울타리
  for(let x=0;x<W;x+=16){g.fillStyle='#A67C55';g.fillRect(x+6,H-26,3,14)}g.fillStyle='#BF946A';g.fillRect(0,H-22,W,2.4);g.fillRect(0,H-16,W,2.4);
  for(let y=48;y<H-20;y+=16){g.fillStyle='#A67C55';g.fillRect(W-12,y,3,14)}g.fillStyle='#BF946A';g.fillRect(W-14,48,2.4,H-68);
}
AREA_STATIC.farm=farmStatic;
AREA_DYNAMIC.farm=()=>{};
/* 마을 오른쪽 끝: 농막으로 이어지는 산책로 + 이정표 */
{const _ts=townStatic;AREA_STATIC.town=g=>{_ts(g);const X=AREAS.town.w*TILE;g.fillStyle='#D8B98F';g.fillRect(X-18,24*TILE+2,18,3*TILE-4);for(let y=24*TILE+4;y<27*TILE-4;y+=6){g.fillStyle='#C9A77A';g.fillRect(X-18,y,18,1.2)}
  signBoard(g,X-30,23.3*TILE,'농막 →',{size:6,min:34,line:'#8DBA72',fg:'#5B4636'})}}

/* 이정표 자리를 비키도록 마을 오른쪽 벚나무를 한 칸 옮김 */
{const t=DECOR_BASE.town.find(d=>d.t==='tree'&&d.x===55&&d.y===23);if(t){t.x=53;t.y=21}}

/* ---------- 장식 그림 ---------- */
Object.assign(DECOR_DRAW,{
  farmhouse(g,d,x,y,w,h){ // 작은 농막: 나무 외벽 + 한쪽 경사 지붕 + 큰 창 + 데크
    const by=y+h,top=by-50,wood='#C99A6B',woodD='#A87A4F';
    shadow(g,x+w/2,by+10,w/2+8,5);
    rr(g,x-6,by-2,w+12,14,2,'#B98A5E');for(let k=0;k<7;k++){g.fillStyle='#A67C55';g.fillRect(x-6,by+k*2,w+12,.6)}for(const px of [x-4,x+w+2])g.fillRect(px,by+10,2.4,6);
    const wg=g.createLinearGradient(x,0,x+w,0);wg.addColorStop(0,woodD);wg.addColorStop(.25,wood);wg.addColorStop(1,woodD);rr(g,x,top,w,by-top,2,wg);
    for(let yy=top+5;yy<by;yy+=5){g.fillStyle='rgba(90,55,30,.22)';g.fillRect(x,yy,w,.8)}
    poly(g,[x-6,top+2,x+w+6,top-10,x+w+6,top-5,x-6,top+8],'#5E6A70');for(let k=0;k<12;k++){const xx=x-6+k*(w+12)/11;ln(g,xx,top+8-k*1.4,xx,top+2-k*1.1,'#4A5458',.6)}
    rr(g,x+w-22,top-19,12,8,1,'#34506E');ln(g,x+w-22,top-15,x+w-10,top-15,'#6A8EB8',.5);ln(g,x+w-16,top-19,x+w-16,top-11,'#6A8EB8',.5); // 태양광 패널
    rr(g,x+10,top-22,4,14,1,'#7A7F84');el(g,x+12,top-22,2.6,1.2,'#8E9398');
    // 창문 + 커튼 + 화분
    rr(g,x+8,top+12,34,20,2,'#F4EFE6');rr(g,x+10,top+14,30,16,1,'#CFE3EE');g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x+12,top+15,3,14);
    poly(g,[x+10,top+14,x+18,top+14,x+13,top+30,x+10,top+30],'#F4B6C4');poly(g,[x+40,top+14,x+32,top+14,x+37,top+30,x+40,top+30],'#F4B6C4');ln(g,x+25,top+14,x+25,top+30,'#F4EFE6',1);
    rr(g,x+7,top+32,36,5,1.5,'#8E5E3C');for(let k=0;k<6;k++)flowerHead(g,TYPES[k%5],x+10+k*6,top+32,2.6,100);
    // 문 + 등
    rr(g,x+w-30,top+10,20,by-top-10,2,'#8E5E3C');rr(g,x+w-27,top+14,14,9,1.5,'#CFE3EE');el(g,x+w-13,by-18,1.3,1.3,'#E2B656');
    el(g,x+w-6,top+10,2.4,2.4,'#FFF4D6');rr(g,x+w-8,top+5,4,4,1,'#4E5A58');
    // 작은 간판·장화·화분
    signBoard(g,x+w/2-6,top-2,'우리 농막',{size:5,min:36,line:'#A87A4F',fg:'#6A4A3A',bg:'#FFF8EC'});
    rr(g,x+w+2,by-6,4,6,1,'#5E8C47');rr(g,x+w+7,by-6,4,6,1,'#5E8C47');
    rr(g,x-4,by-8,8,8,2,'#C98A5E');for(let k=0;k<3;k++)el(g,x+k*2-2,by-10-k,2.6,2,'#7FAE63');
  },
  greenhouse(g,d,x,y,w,h){ // 목공소 비닐하우스: 반투명 아치 + 안쪽 작업대·목재 실루엣
    const by=y+h,top=by-54;
    shadow(g,x+w/2,by+2,w/2+6,5);
    rr(g,x,by-8,w,8,2,'#8E6B52');
    // 안쪽(비닐 너머 보이는 것)
    g.fillStyle='rgba(120,100,80,.25)';g.fillRect(x+4,top+12,w-8,by-top-18);
    rr(g,x+14,by-24,46,6,1,'#9C7A55');g.fillStyle='#7A5A40';g.fillRect(x+16,by-18,3,10);g.fillRect(x+55,by-18,3,10);
    for(let k=0;k<5;k++)rr(g,x+w-54+k*6,by-44,4,36,1,k%2?'#D8B48A':'#C9A277');
    ln(g,x+26,by-28,x+36,by-34,'#7A7F84',1.2);el(g,x+26,by-28,2,2,'#A0A4A8');rr(g,x+64,by-30,10,8,1,'#E3A04A');
    // 아치형 비닐(반투명) + 뼈대
    g.beginPath();g.moveTo(x,by-8);g.lineTo(x,top+22);g.bezierCurveTo(x,top-4,x+w,top-4,x+w,top+22);g.lineTo(x+w,by-8);g.closePath();
    const vg=g.createLinearGradient(0,top,0,by);vg.addColorStop(0,'rgba(250,252,252,.82)');vg.addColorStop(1,'rgba(225,238,236,.55)');g.fillStyle=vg;g.fill();
    g.strokeStyle='rgba(150,160,165,.9)';g.lineWidth=1;g.stroke();
    for(let k=1;k<10;k++){const xx=x+k*w/10;ln(g,xx,by-8,xx,top+(Math.abs(k-5)*2.2)+3,'rgba(150,160,165,.7)',.8)}
    ln(g,x,top+26,x+w,top+26,'rgba(150,160,165,.6)',.7);ln(g,x,by-24,x+w,by-24,'rgba(150,160,165,.5)',.7);
    g.save();g.globalAlpha=.5;el(g,x+w*.3,top+8,w*.18,3,'#FFFFFF',-.08);g.restore();
    // 문(열린 상태)
    const dx=x+w/2-10;rr(g,dx,by-34,20,26,1,'rgba(90,70,50,.55)');ln(g,dx,by-34,dx,by-8,'#8E9398',1);ln(g,dx+20,by-34,dx+20,by-8,'#8E9398',1);
    signBoard(g,x+w/2,top+16,'목공소',{size:6,min:34,line:'#A87A4F',fg:'#6A4A3A',bg:'#FFF8EC'});
  },
  woodpile(g,d,x,y,w,h){shadow(g,x+w/2,y+h,w/2+2,2);for(let r=0;r<3;r++)for(let k=0;k<4-r;k++){const cx=x+5+k*7+r*3.5,cy=y+h-4-r*5.4;el(g,cx,cy,3.6,3,'#B98A5E');el(g,cx,cy,2.4,2,'#D8B48A');g.strokeStyle='#A87A4F';g.lineWidth=.4;g.beginPath();g.arc(cx,cy,1.2,0,6.3);g.stroke()}
    rr(g,x+w-6,y+h-18,3,16,1,'#8E6B52');poly(g,[x+w-10,y+h-18,x+w,y+h-18,x+w-3,y+h-24],'#9CA3A8')},
  tent(g,d,x,y,w,h){ // 캠핑 텐트 + 앞 그늘막(타프)
    const by=y+h,cx=x+w/2;shadow(g,cx,by+2,w/2+8,5);
    // 타프
    ln(g,x-6,by-28,x-6,by+6,'#6E5A4E',1.2);ln(g,x+w+8,by-28,x+w+8,by+6,'#6E5A4E',1.2);
    poly(g,[x-8,by-30,x+w+10,by-30,x+w+4,by-22,x-2,by-22],'#E6B97A');for(let k=0;k<6;k++){g.fillStyle=k%2?'#E6B97A':'#F2D4A2';poly(g,[x-8+k*(w+18)/6,by-30,x-8+(k+1)*(w+18)/6,by-30,x-2+(k+1)*(w+6)/6,by-22,x-2+k*(w+6)/6,by-22],g.fillStyle)}
    // 텐트 몸
    poly(g,[x+4,by,cx,by-40,x+w-4,by],'#8FA67A');poly(g,[cx,by-40,x+w-4,by,x+w+4,by-4,cx+8,by-40],'#7A9166');
    poly(g,[cx-10,by,cx,by-28,cx+10,by],'#4E5E44');poly(g,[cx-10,by,cx,by-28,cx-4,by],'#A9BE93');
    rr(g,cx-6,by-8,12,6,2,'#E07A7A');ln(g,x+4,by,x-2,by+4,'#C9B79A',.5);ln(g,x+w-4,by,x+w+6,by+4,'#C9B79A',.5);
    ln(g,cx,by-40,cx,by-46,'#6E5A4E',1);poly(g,[cx,by-46,cx+7,by-44,cx,by-42],'#E8603C');
  },
  firepit(g,d,x,y,w,h){ // 모닥불: 저녁(4시 이후)엔 불꽃이 일렁여요
    const cx=x+8,cy=y+10,t=NOW()/1000,eve=S.t>=420;
    for(let k=0;k<9;k++){const a=k*.698;el(g,cx+Math.cos(a)*8,cy+Math.sin(a)*4.4,2.8,2,k%2?'#9CA3A8':'#B7BDC2')}
    el(g,cx,cy,6,3,'#4A3A30');ln(g,cx-6,cy+1,cx+5,cy-2,'#8E5E3C',2);ln(g,cx+6,cy+1,cx-5,cy-2,'#7A4E30',2);
    if(eve){for(let k=0;k<3;k++){const fh=10+Math.sin(t*9+k*2)*2.4,fx=cx-3+k*3;g.beginPath();g.moveTo(fx-3,cy);g.quadraticCurveTo(fx-2,cy-fh*.6,fx+Math.sin(t*7+k)*1.2,cy-fh);g.quadraticCurveTo(fx+2,cy-fh*.5,fx+3,cy);g.closePath();g.fillStyle=k===1?'#FFD36B':'#F29A4A';g.fill()}
      el(g,cx,cy-3,3,3,'rgba(255,240,180,.8)');for(let k=0;k<3;k++){const p=((t*.6+k/3)%1);el(g,cx+Math.sin(t*3+k)*3,cy-12-p*14,.7,.7,'rgba(255,200,120,'+(1-p)+')')}}
    else{for(let k=0;k<2;k++){const p=((t*.25+k/2)%1);el(g,cx+Math.sin(t+k)*2,cy-6-p*14,2+p*3,1.6+p*2,'rgba(220,220,220,'+(.35*(1-p))+')')}}
  },
  lightpole(g,d,x,y,w,h){rr(g,x+7,y-28,2,42,1,'#6E5A4E');el(g,x+8,y+14,3,1,'rgba(90,60,40,.15)')},
  picnic(g,d,x,y,w,h){shadow(g,x+w/2,y+h+2,w/2,3);rr(g,x,y-2,w,8,2,'#C99A6B');for(let k=1;k<4;k++){g.fillStyle='#A87A4F';g.fillRect(x+k*w/4,y-2,.6,8)}
    rr(g,x+2,y+8,w-4,3,1,'#B98A5E');rr(g,x+2,y-7,w-4,3,1,'#B98A5E');g.fillStyle='#8E6B52';g.fillRect(x+6,y+6,2,8);g.fillRect(x+w-8,y+6,2,8);
    rr(g,x+12,y-4,8,5,2,'#FFFFFF');el(g,x+30,y,3,2,'#E07A7A');rr(g,x+34,y-5,3,6,1,'#7FB7D6')},
  cathouse(g,d,x,y,w,h){shadow(g,x+w/2,y+h+1,w/2,2);rr(g,x+2,y-6,w-4,h+6,1,'#D8B48A');poly(g,[x,y-5,x+w/2,y-16,x+w,y-5],'#E07A7A');poly(g,[x+w/2,y-16,x+w,y-5,x+w-3,y-5],'#C45E5E');
    el(g,x+w/2,y+4,5,5,'#5E4430');signBoard(g,x+w/2,y-10,'냥',{size:4,min:10,pad:4,line:'#E07A7A',fg:'#6A4A3A'})},
  catbowls(g,d,x,y,w,h){el(g,x+4,y+10,3.6,1.8,'#7FB7D6');el(g,x+4,y+9.6,2.6,1.1,'#C98A5E');el(g,x+11,y+10,3.6,1.8,'#F4A6B8');el(g,x+11,y+9.6,2.6,1.1,'#CFE3EE')},
  farmsign(g,d,x,y,w,h){rr(g,x+7,y-14,2,26,1,'#8E6B52');signBoard(g,x+8,y-14,'← 마을',{size:5,min:30,line:'#8DBA72',fg:'#5B4636'})}
});
/* 캠핑 의자(벤치 모양 대신) */
{const _dsv=drawStationV;drawStationV=function(g,s){if(s.type==='bench'&&s.camp){const x=s.x*TILE,y=s.y*TILE,w=s.w*TILE;shadow(g,x+w/2,y+14,w/2,2);
  for(const cx of [x+7,x+w-9]){ln(g,cx-4,y+14,cx+4,y+4,'#5E6A70',1);ln(g,cx+4,y+14,cx-4,y+4,'#5E6A70',1);rr(g,cx-6,y+2,12,4,1.5,'#3E6FA0');rr(g,cx-6,y-6,12,8,2,'#4C82B4')}return}
  return _dsv(g,s)}}

/* ---------- 저녁 불빛 ---------- */
AREA_LIGHTS.farm=()=>{const L=[[10*TILE+6*TILE-6,5*TILE+3*TILE-40]];for(let k=0;k<5;k++)L.push([20.5*TILE+k*(10.5*TILE/4),13*TILE-28+Math.sin(k)*3]);if(S.t>=420)L.push([22.5*TILE,17.5*TILE]);return L};
/* 전구줄(두 기둥 사이) — 늘 보이는 장식이라 배경 위 장식으로 */
DECOR_DRAW.lightpole=((base)=>function(g,d,x,y,w,h){base(g,d,x,y,w,h);if(d.x===20){const x1=31*TILE+8;g.strokeStyle='#5E5048';g.lineWidth=.5;g.beginPath();g.moveTo(x+8,y-28);g.quadraticCurveTo((x+8+x1)/2,y-18,x1,y-28);g.stroke();
  for(let k=1;k<12;k++){const t=k/12,bx=(1-t)*(1-t)*(x+8)+2*(1-t)*t*((x+8+x1)/2)+t*t*x1,byy=(1-t)*(1-t)*(y-28)+2*(1-t)*t*(y-18)+t*t*(y-28);el(g,bx,byy+1.4,1.2,1.5,['#FFE08A','#F9C9D5','#CFE8FF'][k%3])}}})(DECOR_DRAW.lightpole);
PR_DEB.lightpole=[-2,-44,182,1];

/* ---------- 길냥이 5마리 ---------- */
const FARM_CATS=[
  {name:'치즈',pal:{G1:'#E8A057',G2:'#F6C48A',GD:'#C2702F',W:'#FFF6EA',collar:null},lines:['냐앙~ (햇볕에 데워진 배를 보여 줘요)','냥! (밥그릇 쪽을 힐끔 봐요)','골골골… (치즈색 꼬리가 살랑살랑)'],spots:[[18.5,10.6],[12,9.6],[26,12]]},
  {name:'고등어',pal:{G1:'#8E8878',G2:'#AEA897',GD:'#57524A',W:'#F4F1EA',collar:null},lines:['…냥. (목공소 나무 냄새를 좋아하나 봐요)','미야? (톱밥 묻은 발을 핥아요)','냐. (장작더미 위가 자기 자리래요)'],spots:[[28,9.4],[36,9.6],[33,9]]},
  {name:'삼색이',pal:{G1:'#F4F0E8',G2:'#FFFFFF',GD:'#D8CFC4',W:'#FFFFFF',stripes:false,patch:['#E39A4F','#3A3434'],collar:null},lines:['먀아~ (코스모스 사이로 폴짝!)','냥냥! (나비를 쫓다가 멈췄어요)','미야옹. (새침하게 고개를 돌려요)'],spots:[[29,18.6],[30.5,24.4],[27,20]]},
  {name:'턱시도',pal:{G1:'#2E2B2E',G2:'#4A464B',GD:'#1C1A1D',W:'#FFFFFF',stripes:false,collar:null},lines:['냥. (텐트 안이 제일 따뜻하대요)','…미야. (모닥불 쪽을 바라봐요)','냥! (의자 위를 먼저 차지했어요)'],spots:[[27.5,18.8],[22.5,19.2],[31,15]]},
  {name:'모찌',pal:{G1:'#F4F2EE',G2:'#FFFFFF',GD:'#D6D2CC',W:'#FFFFFF',stripes:false,patch:['#A9A6AE'],collar:null},lines:['미야~ (말랑한 앞발로 꾹꾹이를 해요)','냐아… (피크닉 테이블 밑이 시원하대요)','냥? (눈을 천천히 깜빡여요. 좋아한다는 뜻이래요)'],spots:[[6.5,18.2],[16,12],[4,12.5]]}
];
function makeFarmCats(){if(S.fcats&&S.fcats.length)return;S.fcats=FARM_CATS.map((C,k)=>{const [sx,sy]=C.spots[0];return {kind:'cat',area:'farm',name:C.name,who:'농막 길냥이',pal:C.pal,lines:C.lines,spots:C.spots,x:sx*TILE,y:sy*TILE,tx:sx*TILE,ty:sy*TILE,dir:'down',walk:0,state:pick(['sit','sleep','groom']),timer:rnd(2,8),talking:false,hearts:0,speed:18+k*2}})}
{const _mw=makeWalkers;makeWalkers=function(){_mw();makeFarmCats()}}
CAT_SPOTS.farm=[3,37,9,22];
