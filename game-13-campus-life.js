'use strict';
/* 우리 둘의 꽃집 — game-13-campus-life.js : 캠퍼스에서 산책·운동하는 사람들
   · 조깅: 팔을 굽혀 흔들며 달리고, 가끔 멈춰서 스트레칭
   · 스트레칭·줄넘기: 운동장 옆 잔디에서 (낮)
   · 잔디밭 독서: 양반다리로 앉아 책 읽기 (낮)
   · 산책: 강아지 산책, 휴대폰 보며 걷기, 커피 들고 걷기
   · 트랙을 도는 사람도 팔을 굽혀 달려요 */

/* 동작 그림: 스트레칭(옆구리 늘리기)·줄넘기(점프 + 줄) */
{const _dc=drawChar;drawChar=function(g,x,y,p,dir,phase,moving,glasses,work,sit){
  const po=p&&p.pose;if(!po||(po!=='stretch'&&po!=='rope')||(typeof BAKE!=='undefined'&&BAKE&&BAKE.onChar))return _dc(g,x,y,p,dir,phase,moving,glasses,work,sit);
  const f=(p.pf||0)&3,s=.25*(p.sc||1);
  if(po==='stretch'){const lean=[0,-.13,0,.13][f];g.save();g.translate(x,y);g.rotate(lean);g.translate(-x,-y);_dc(g,x,y,p,dir,phase,moving,glasses,work,sit);g.restore();return}
  const jump=[0,10,15,6][f]*s,hy=y+(-46)*s-jump,lx=x-38*s,rx=x+38*s;
  const rope=(front)=>{const ctl=[y-180*s-jump,2*(y+1.5)-hy,2*(y+1.5)-hy,y-120*s-jump][f];if((f===0||f===1)!==front)return;
    g.strokeStyle='#E8603C';g.lineWidth=.55;g.beginPath();g.moveTo(lx,hy);g.quadraticCurveTo(x,ctl,rx,hy);g.stroke()};
  rope(false);_dc(g,x,y-jump,p,dir,phase,moving,glasses,work,sit);rope(true);
  rr(g,lx-.7,hy-1.6,1.4,3.2,.6,'#F4F2EE');rr(g,rx-.7,hy-1.6,1.4,3.2,.6,'#F4F2EE');
  if(jump<1){el(g,x,y+.4,5*s*4,1.1*s*4,'rgba(80,55,50,.08)')}}}

const LIFE_LINE={
  jog:['캠퍼스 한 바퀴 뛰는 중이에요! 숨 차요, 하하.','아침저녁으로 뛰면 머리가 맑아져요.','일월저수지까지 갔다 오는 코스예요!','이 노래 들으면서 뛰면 하나도 안 힘들어요.'],
  jogRest:['스트레칭 중이에요. 다치면 안 되니까요!','잠깐 쉬었다 다시 뛸 거예요. 으쌰!'],
  stretch:['몸 좀 풀고 있어요. 으쌰!','하나, 둘… 옆구리 쭈욱!','운동 전엔 스트레칭 필수예요.'],
  rope:['줄넘기 백 개 도전 중! 아, 걸렸다!','이단 뛰기 연습 중이에요. 아직 한 번밖에 못 해요.','줄넘기 하면 동네 꼬마 된 기분이에요, 하하.'],
  read:['(책에서 눈을 떼며) 아, 안녕하세요. 여기 햇볕이 딱 좋아요.','시험 전에 소설 한 권 읽는 게 제 소확행이에요.','도서관보다 잔디밭이 더 잘 읽혀요.','이 책 결말이 궁금해서 수업 가기 싫어요. 쉿!'],
  dog:['우리 강아지 산책 시간이에요. 캠퍼스가 넓어서 좋아해요.','이 녀석이 잔디밭만 보면 뛰어요.','학생들이 다 예뻐해 줘서 인기 스타예요.'],
  phone:['아, 죄송해요! 폰 보다가… 길 찾는 중이었어요.','(휴대폰을 내리며) 안녕하세요! 여기 GS25가 어디예요?','단톡방이 너무 시끄러워서요, 하하.'],
  coffee:['커피 한 잔 들고 걷는 게 제 휴식이에요.','카페 라떼 맛있어요. 한 모금 드릴까요? 농담이에요.','점심 먹고 한 바퀴 걷는 중이에요.']};

function lifeFrame(){return Math.floor(performance.now()/380)%4}
{const _mw=makeWalkers;makeWalkers=function(){_mw();if(typeof CD==='undefined')return;const T=TILE,W=[];
  const place=(w,cx,cy,r,kinds)=>{for(let n=0;n<6;n++){const p=cSpot(cx,cy,r+n*2,kinds);if(p){w.x=p[0];w.y=p[1];w.tx=w.x;w.ty=w.y;return true}}return false};
  const tc=[(TRK[0]+TRK[2])/2,(TRK[1]+TRK[3])/2];
  // 조깅
  for(let k=0;k<4;k++){const w=cNew('student',k%2===1,Object.assign(SPORTY(),{pose:'jog'}),'jog');w.dept=k<2?'러닝 동아리':'운동하는 학생';w.life='jog';place(w,CD.W/2,CD.H/2,CD.W/2,[1,8,10]);W.push(w)}
  // 스트레칭·줄넘기(운동장 옆 잔디)
  for(let k=0;k<3;k++){const w=cNew('student',k!==1,Object.assign(SPORTY(),{pose:k===2?'rope':'stretch'}),'lifeStill');w.dept='운동하는 학생';w.life=k===2?'rope':'stretch';place(w,tc[0]+(k-1)*9,tc[1]+(k%2?-16:16),6,[2,3]);w.dir=0;w.hdir=0;w.hx=w.x;w.hy=w.y;W.push(w)}
  // 잔디밭 독서
  const LIB=CB.find(G=>/학술정보관|도서관/.test(G.n))||CB[0];const d=cDoor(LIB);
  for(let k=0;k<3;k++){const w=cNew('student',Math.random()<.6,{gsit:true,pose:'read',bookC:pick(['#C9546A','#5E7FB0','#7FAF6C','#E2B656'])},'lifeStill');w.dept=pick(DEPT_GRP.filter(x=>x!=='스포츠과학과'));w.life='read';
    place(w,d[0]/T+(k-1)*6,d[1]/T+5+k*2,5,[2]);w.sit=true;w.yo=5;w.dir=0;w.hdir=0;w.hx=w.x;w.hy=w.y;W.push(w)}
  // 산책(강아지·휴대폰·커피)
  ['dog','dog','phone','coffee'].forEach((kind,k)=>{const w=cNew('adult',k%2===0,kind==='phone'?{pose:'phone'}:kind==='coffee'?{prop:'coffee'}:{},'stroll');w.dept=kind==='dog'?'강아지와 산책 중':'산책 나온 사람';w.life=kind;place(w,CD.W/2,CD.H/2,CD.W/2,[1,6,8]);
    if(kind==='dog')w.dog={x:w.x-10,y:w.y,dir:'down',walk:0,col:pick(['#E8D2B4','#8A5A3C','#F4F2EE','#3E3A3A','#D9A36A']),name:pick(DOG_NAMES)};W.push(w)});
  S.walkers.push(...W);
  // 트랙 달리기는 팔 굽혀 달리기, 혼자 다니는 학생 둘은 휴대폰 보며 걷기
  S.walkers.forEach(w=>{if(w.zone!=='campus')return;if(w.sport==='run')w.pal.pose='jog'});
  S.walkers.filter(w=>w.zone==='campus'&&w.cRole==='nerd').slice(0,2).forEach(w=>{w.pal.pose='phone'})}}

{const _cs=cStep;cStep=function(w,dt){if(!w.life)return _cs(w,dt);const T=TILE;
  if(w.throwT>0)w.throwT-=dt;if(w.bub&&S.t>w.bubT)w.bub=null;const day=S.t<500;
  switch(w.cRole){
    case 'jog':{w.hidden=S.t>=570?1:0;if(w.hidden)return;
      if(w.rest>0){w.rest-=dt;w.walk=0;w.pal.pose='stretch';w.pal.pf=lifeFrame();if(w.rest<=0){w.pal.pose='jog';delete w.pal.pf}return}
      if(cGo(w,dt,34)){if(Math.random()<.3){w.rest=rnd(4,8);if(Math.random()<.4)cBub(w,pick(['후우… 잠깐 쉬어요.','스트레칭!','다리가 뻐근해요.']),2)}
        const p=cSpot(w.x/T,w.y/T,20,[1,8,10]);if(p){w.tx=p[0];w.ty=p[1]}}return}
    case 'lifeStill':{w.hidden=day?0:1;w.x=w.hx;w.y=w.hy;w.walk=0;w.dir=w.hdir;
      if(w.life==='read'){w.pal.pose='read';if(Math.random()<dt*.02)cBub(w,pick(['(책장 넘기는 소리)','흠…','와, 반전이다!']),2);return}
      w.swapT=(w.swapT||rnd(10,20))-dt;if(w.swapT<=0){w.swapT=rnd(12,24);if(w.life==='stretch'&&Math.random()<.35){w.pal.pose=w.pal.pose==='rope'?'stretch':'rope'}}
      w.pal.pf=lifeFrame();if(w.pal.pose==='rope'&&Math.random()<dt*.03)cBub(w,pick(['열여덟, 열아홉…','앗, 걸렸다!','이단 뛰기!']),1.6);return}
    case 'stroll':{w.hidden=S.t>=560?1:0;if(w.hidden)return;
      if(w.dog){const dg=w.dog,[ox,oy]=DIRV[w.dir]||[0,1];const tx=w.x-ox*10+6,ty=w.y-oy*6+3;const dd=Math.hypot(tx-dg.x,ty-dg.y);dg.path=[[tx,ty]];if(dd>1.5)stepToward(dg,dt,Math.min(45,dd*4))}
      if(w.wait>0){w.wait-=dt;w.walk=0;return}
      if(cGo(w,dt,w.life==='phone'?9:12)){w.wait=rnd(1.5,4);const p=cSpot(w.x/T,w.y/T,16,[1,6,8]);if(p){w.tx=p[0];w.ty=p[1]}}return}
  }
  return _cs(w,dt)}}
/* 말 거는 동안에는 동작을 멈추고, 끝나면 다시 */
{const _ws=walkerStep;walkerStep=function(w,dt){if(w.life&&w.talking&&w.pal){if(w.pal.pose==='rope'||w.pal.pose==='stretch'){w._pose=w.pal.pose;w.pal.pose=null}}else if(w.life&&w._pose&&w.pal){w.pal.pose=w._pose;w._pose=null}return _ws(w,dt)}}
{const _tl=talkLine;talkLine=function(w){if(!w.life)return _tl(w);w._tc=(w._tc||0)+1;
  const L=w.life==='jog'&&w.rest>0?LIFE_LINE.jogRest:w.life==='stretch'&&w._pose==='rope'?LIFE_LINE.rope:LIFE_LINE[w.life]||LIFE_LINE.jog;
  return `(${w.dept}) `+L[w._tc%L.length]}}
