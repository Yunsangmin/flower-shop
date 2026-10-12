'use strict';
/* 우리 둘의 꽃집 — game-12-salon.js : 미용실 '리트헤어' (디자이너 민지)
   · 마을 꽃시장 오른쪽 하늘색 집을 미용실로 바꿨어요. 문으로 들어가면 작은 실내가 나와요
   · 실내 그림은 들어가 있을 때만 메모리에 올라가고, 나오면 정리돼요(미리 굽지 않음)
   · 가구 그림은 가게 가구(거울·소파·화분·조명)를 그대로 다시 써요
   · 머리 모양·색은 game-1-core.js 의 HAIRS / HAIR_C, 그리기는 game-6-art.js 의 hairMod* */
AREAS.salon={w:14,h:9};
AOFF.salon=30000;

/* ---------- 마을 건물: 하늘색 집(꽃시장 오른쪽) → 리트헤어 ---------- */
{const k=FACADES.findIndex(f=>f.t==='house'&&f.x===49);if(k>=0)FACADES[k]={t:'salonFront',x:49,w:5,door:51};}
FACADE_DRAW.salonFront=(g,f,x,w)=>{
  g.fillStyle='#F6EEF2';g.fillRect(x,10,w,86);poly(g,[x-2,12,x+w/2,-2,x+w+2,12],'#B98A9A');
  g.fillStyle='#E8D6DE';for(let yy=16;yy<92;yy+=6)g.fillRect(x,yy,w,.7);
  /* 줄무늬 차양 + 간판 */
  for(let k=0;k<w;k+=8){g.fillStyle=(k/8)%2?'#FFFFFF':'#C98FA8';g.fillRect(x+k,40,8,7);el(g,x+k+4,47,4,2.6,(k/8)%2?'#FFFFFF':'#C98FA8')}
  signBoard(g,x+w/2,26,'리트헤어',{size:7,min:52,line:'#C98FA8',fg:'#8A4E66'});
  /* 이발소 표시등(빙글빙글 줄무늬 기둥) */
  rr(g,x+3,52,6,24,3,'#FFFFFF');for(let k=0;k<4;k++)poly(g,[x+3,56+k*5,x+9,53+k*5,x+9,55+k*5,x+3,58+k*5],k%2?'#3E6FC2':'#D8434E');el(g,x+6,51,3.4,2.4,'#C9C2B4');el(g,x+6,77,3.4,2.4,'#C9C2B4');
  /* 창문 + 문 */
  rr(g,x+w-22,52,16,20,2,'#F8F4EC');rr(g,x+w-20.5,53.5,13,17,1.5,'#CFE3EE');el(g,x+w-14,61,3,4,'#C98FA8');
  const dx=f.door*TILE;rr(g,dx+2,62,28,34,3,'#8A6A7A');rr(g,dx+5,65,22,14,2,'rgba(207,227,238,.9)');el(g,dx+24,82,1.2,1.2,'#E1B656');rr(g,dx,94,32,3,1,'#CDBFA8');
  rr(g,dx+9,68,14,7,1.5,'#FFF8EE');g.fillStyle='#8A4E66';g.font="4px 'Jua',sans-serif";g.textAlign='center';g.fillText('OPEN',dx+16,73.2)};
/* 문(마을 위쪽 51~52칸 ↔ 미용실 아래 8~9칸) */
{const _dg=doorGap;doorGap=function(area,tx,ty){if(area==='town'&&ty===5&&tx>=51&&tx<=52)return true;return _dg(area,tx,ty)}}
DOORS.push(
  {area:'town',x0:51*TILE,x1:53*TILE,edge:'top',y:5.7*TILE,to:'salon',sx:9*TILE,sy:8.2*TILE,dir:'up'},
  {area:'salon',x0:8*TILE,x1:10*TILE,edge:'bottom',y:8.3*TILE,to:'town',sx:52*TILE,sy:7.2*TILE,dir:'down'});

/* ---------- 실내 ---------- */
AREA_STATIC.salon=g=>{const W=AREAS.salon.w*TILE,H=AREAS.salon.h*TILE;
  for(let y=32;y<H-16;y+=12)for(let x=16;x<W-16;x+=12){g.fillStyle=((x+y)/12)%2?'#F3ECE6':'#E6DCD6';g.fillRect(x,y,12,12)}
  wallpaper(g,0,W,0,22,'#F7E9EF','#FFFFFF');g.fillStyle=CO.trim;g.fillRect(0,21,W,1.5);g.fillStyle='#E3C8D4';g.fillRect(0,22.5,W,9);g.fillStyle=CO.trim;g.fillRect(0,31,W,1.5);
  g.fillStyle='#E8D6DE';g.fillRect(0,0,16,H);g.fillRect(W-16,0,16,H);g.fillRect(0,H-16,W,16);g.fillStyle='#D6C2CC';g.fillRect(0,H-16,W,1);
  g.fillStyle='#F3ECE6';g.fillRect(128,H-16,32,16);rr(g,130,H-24,28,8,2,'#C98FA8');
  signBoard(g,W/2,11,'리트헤어 · 디자이너 민지',{size:6,min:80,line:'#C98FA8',fg:'#8A4E66'});
  /* 벽 선반: 샴푸·드라이기 */
  rr(g,22,8,40,3,1,'#C9A07A');[[28,'#F4B6C4'],[35,'#B9D6F0'],[42,'#F7E08A'],[50,'#C5D3B4']].forEach(([px,c])=>{rr(g,px-2.5,1,5,7,1.5,c);rr(g,px-1,0,2,1.5,.5,'#8A7B74')});
  rr(g,W-58,8,40,3,1,'#C9A07A');el(g,W-48,4,5,3.4,'#9CA5AE');rr(g,W-46,4,8,2.4,1,'#9CA5AE');el(g,W-30,5,4,4,'#E8DCC4')};
AREA_DYNAMIC.salon=()=>{};
AREA_LIGHTS.salon=()=>[[56,10],[168,10]];
DECOR_BASE.salon=[{t:'mirror',x:2,y:2,w:1,h:1},{t:'salonchair',x:2,y:3,w:1,h:1},{t:'mirror',x:5,y:2,w:1,h:1},{t:'salonchair',x:5,y:3,w:1,h:1},
  {t:'sink',x:11,y:2,w:2,h:1},{t:'armchair',x:1,y:6,w:1,h:1},{t:'armchair',x:2,y:6,w:1,h:1},{t:'monstera',x:12,y:6,w:1,h:1},{t:'floorlamp',x:1,y:4,w:1,h:1},{t:'bigplant',x:12,y:4,w:1,h:1}];
Object.defineProperty(DECOR,'salon',{get(){return DECOR_BASE.salon},configurable:true});
Object.assign(DECOR_DRAW,{
  salonchair(g,d,x,y){shadow(g,x+8,y+15,6,1.6);ln(g,x+8,y+8,x+8,y+14,'#8E9CA6',1.6);el(g,x+8,y+14.5,5,1.3,'#8E9CA6');rr(g,x+2,y-8,12,9,3,'#C98FA8');rr(g,x+3,y,10,6,2.5,'#D9A7BC');rr(g,x+1,y-1,3,6,1.4,'#B07A92');rr(g,x+12,y-1,3,6,1.4,'#B07A92')},
  sink(g,d,x,y,w){shadow(g,x+w/2,y+15,w/2,2);rr(g,x+2,y-2,w-4,15,2,'#F4F1EA');el(g,x+w/2,y+1,9,3.6,'#DCE8F0');ln(g,x+w/2,y-8,x+w/2,y-2,'#9CA5AE',1.3);ln(g,x+w/2,y-8,x+w/2+4,y-8,'#9CA5AE',1.3);rr(g,x+4,y+6,w-8,6,1.5,'#E8DCC4')}});
Object.assign(PR_DEB,{salonchair:[0,-10,0,1],sink:[0,-10,0,1]});

/* ---------- 디자이너 민지(마을의 민지와는 다른 사람) ---------- */
const STYLIST={style:'f',hs:'bob',hm:{b:'bob',blunt:1},expr:'grin',hair:'#6E2A3A',hairHi:'#8E4A5A',skin:'#F4D3B7',skinSh:'#E0B597',tee:'#2E2B30',teeSh:'#1E1C20',pants:'#2E2B30',shoe:'#fff',num:'',apron:'#C98FA8',acc:'glasses'};
STATION_DEFS.push(['stylist','stylist','salon',7,4,3,1]);
STATION_DRAW.stylist=(g,s,x,y,w)=>{drawChar(g,x+w/2,y+2,STYLIST,'down',0,false,false);shadow(g,x+w/2,y+16,w/2,2.2);
  rr(g,x+2,y+4,w-4,11,2,'#E8D6DE');rr(g,x+2,y+3,w-4,3,1.5,'#F7E9EF');ln(g,x+10,y+6,x+16,y+2,'#9CA5AE',1);ln(g,x+16,y+6,x+10,y+2,'#9CA5AE',1);rr(g,x+w-14,y-2,6,8,1.5,'#C98FA8');el(g,x+w-11,y-3,3,1.4,'#8A7B74')};
PR_STB.stylist=[0,-40,0,3.5];
OPEN_LABEL.stylist='머리 하기';
STATION_ACT.stylist=(i)=>{const g=PAL[i].style==='f'?'f':'m';openModal(i,{type:'salon',tab:'cut',sel:null,col:null,g})};

/* ---------- 가격: 커트 / 펌(웨이브·컬) / 염색 ---------- */
const SALON_PRICE={cut:15000,perm:45000,dye:30000};
const SALON_LINES=['어서 오세요, 리트헤어예요! 오늘은 어떤 느낌으로 해 볼까요?','요즘은 가볍고 자연스러운 스타일이 인기예요.','꽃집 하시죠? 꽃 냄새가 은은하게 나요.','염색은 밝은 색일수록 꽃이랑 잘 어울려요.'];
function salonTry(i,m){const o={...S.outfit[i]};if(m.sel)o.hair=m.sel;if(m.col)o.hairC=m.col;return palFromOutfit(PAL[i],o)}
function salonCost(m){let c=0;if(m.sel){const H=hairDef(m.sel);c+=H&&H.perm?SALON_PRICE.perm:SALON_PRICE.cut}if(m.col)c+=SALON_PRICE.dye;return c}
MODAL_R.salon=(i,m)=>{const o=S.outfit[i]||{},L=HAIRS[m.g],cost=salonCost(m);m.say=m.say||pick(SALON_LINES);
  const curH=o.hair||'',curC=o.hairC||'';
  const list=m.tab==='color'?`<div class="row">${HAIR_C.map(([c,n])=>`<button class="sw ${m.col===c?'on':''}" style="background:${c}" data-a="hcol" data-v="${c}" aria-label="${n}" title="${n}"></button>`).join('')}</div><p class="req">${m.col?HAIR_C.find(x=>x[0]===m.col)[1]:'색을 골라 보세요'} · 염색 ${won(SALON_PRICE.dye)}</p>`
    :`<div class="list">${L.map(([k,n,H])=>`<div class="li"><span class="grow">${n}${k===curH?' <small>(지금 머리)</small>':''}<br><small>${H.perm?'펌 '+won(SALON_PRICE.perm):'커트 '+won(SALON_PRICE.cut)}</small></span><button class="btn small ${m.sel===k?'primary':''}" data-a="hsel" data-v="${k}">${m.sel===k?'고름':'해 보기'}</button></div>`).join('')}</div>`;
  return head(i,'리트헤어')+`<p class="req">디자이너 민지: “${esc(m.say)}”</p><div class="row tabs"><button class="btn small ${m.tab!=='color'?'soft':''}" data-a="htab" data-v="cut">커트·펌</button><button class="btn small ${m.tab==='color'?'soft':''}" data-a="htab" data-v="color">염색</button></div>
    <div class="mg"><div class="preview" style="aspect-ratio:1"><canvas id="sprev${i}" width="220" height="220" style="width:100%;height:100%"></canvas></div><div>${list}
    <div class="stat"><span>합계</span><span>${won(cost)}</span></div><div class="stat"><span>가진 돈</span><span>${won(S.money)}</span></div>
    <div class="row"><button class="btn primary" data-a="hdo" ${!cost||S.money<cost?'disabled':''}>${cost?'이걸로 해 주세요':'스타일이나 색을 골라 주세요'}</button>${m.sel||m.col?'<button class="btn small" data-a="hreset">고른 것 지우기</button>':''}</div></div></div>`};
MODAL_AFTER.salon=(i,m)=>{const cv=$('#sprev'+i);if(!cv)return;const g=cv.getContext('2d');g.clearRect(0,0,220,220);g.save();g.scale(4.2,4.2);drawChar(g,26,48,salonTry(i,m),0,0,false,false);g.restore()};
MODAL_C.salon=(i,a,v,m)=>{
  if(a==='htab'){m.tab=v;renderModal(i);return}
  if(a==='hsel'){m.sel=m.sel===v?null:v;renderModal(i);return}
  if(a==='hcol'){m.col=m.col===v?null:v;renderModal(i);return}
  if(a==='hreset'){m.sel=null;m.col=null;renderModal(i);return}
  if(a==='hdo'){const cost=salonCost(m);if(!cost||S.money<cost)return;S.money-=cost;S.stats.spent=(S.stats.spent||0)+cost;
    const o=S.outfit[i]||(S.outfit[i]={});if(m.sel)o.hair=m.sel;if(m.col)o.hairC=m.col;m.sel=null;m.col=null;m.say='짜잔! 정말 잘 어울려요. 또 오세요!';sfx('buy');bump();saveMid();toast(i,'머리를 새로 했어요');renderModal(i)}};
