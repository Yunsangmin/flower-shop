'use strict';
/* 우리 둘의 꽃집 — game-12-deco.js : 치장·인테리어 대폭 추가 + 이야기 선물이 진짜 아이템이 돼요
   · 새 인테리어 테마: 빈티지 · 파스텔 · 크리스마스 · 벚꽃 봄
   · 새 가구(용품상점 '가구' 칸)와 벽 장식(벽에만 걸 수 있어요)
   · 이야기 선물 → 가게 소품·벽 장식·옷장 아이템·도구 보너스 (지난 이야기에서 받은 선물도 자동으로 채워 줘요) */

/* ---------- 인테리어 테마 ---------- */
STYLES.vintage.name='빈티지 파리';
Object.assign(STYLES,{
  pastel:{name:'파스텔',wall:'#FDF1F4',dot:'#F7DCE5',wain:'#CFEAE1',wainL:'#DDF1EA',trim:'#FFFFFF',side:'#F4E6EC',floor:'check',f1:'#FFF8FA',f2:'#E4F2EC',seam:'#EFE2E6',frame:'#F4B6C4',wp:'stripe'},
  xmas:{name:'크리스마스',wall:'#F5EFE3',dot:'#E9DCC6',wain:'#3F6B4E',wainL:'#4C7A5B',trim:'#FFFDF8',side:'#EAE2D3',floor:'plank',f1:'#C9A27A',f2:'#B8906A',seam:'#9E7A58',frame:'#C0463E',deco:'xmas'},
  spring:{name:'벚꽃 봄',wall:'#FFF5F5',dot:'#F9DDE4',wain:'#F6D8DF',wainL:'#FBE6EB',trim:'#FFFFFF',side:'#F6E7E8',floor:'plank',f1:'#F2E0C9',f2:'#E9D2B6',seam:'#D8BE9E',frame:'#E8A3B4',deco:'spring'}
});
const THEME_SHOP=[['vintage','빈티지 파리',300000],['pastel','파스텔',300000],['xmas','크리스마스',250000],['spring','벚꽃 봄',250000]];
SHOP_ITEMS.push(...THEME_SHOP.map(([k,n,p])=>({id:'style_'+k,cat:'interior',name:n,desc:'',price:p,styleSet:k,repeat:true,part:'가게 전체'})));
{const _st=shopStatic;shopStatic=function(g){_st(g);const P=curStyle(),W=AREAS.shop.w*TILE;
  if(P.wp==='stripe'){g.save();g.globalAlpha=.35;for(let x=3;x<W;x+=9){g.fillStyle='#F2C9D5';g.fillRect(x,2,3,19.5)}g.restore()}
  if(P.deco==='xmas'){ // 천장 가랜드 + 빨간 리본 + 방울
    g.strokeStyle='#3E7A4E';g.lineWidth=2.6;g.beginPath();g.moveTo(16,2);for(let x=16;x<=W-16;x+=24)g.quadraticCurveTo(x-12,9,x,2);g.stroke();
    for(let x=16;x<=W-16;x+=24){el(g,x,2.5,2,1.4,'#C0463E',-.5);el(g,x+2.4,2.5,2,1.4,'#C0463E',.5);el(g,x+1.2,2.8,.9,.9,'#9A2F2A')}
    for(let x=28;x<W-16;x+=24){el(g,x,7.6,1.5,1.5,['#E2B656','#C0463E','#FFFFFF'][(x/24|0)%3]);el(g,x-.5,7.1,.45,.45,'rgba(255,255,255,.8)')}}
  if(P.deco==='spring'){ // 벚꽃 가랜드 + 바닥 꽃잎
    g.strokeStyle='#8A6A5A';g.lineWidth=.5;g.beginPath();g.moveTo(16,2);for(let x=16;x<=W-16;x+=20)g.quadraticCurveTo(x-10,8,x,2);g.stroke();
    const r=seedRand(21);for(let x=18;x<W-16;x+=5){const t=((x-16)%20)/20,yy=2+Math.sin(t*Math.PI)*4.2;el(g,x,yy,1.8,1.6,r()<.5?'#F7C3D0':'#FBDDE5');el(g,x,yy,.5,.5,'#E88AA2')}
    for(let k=0;k<60;k++){const px=20+r()*(W-40),py=36+r()*118;if(px>128&&px<160&&py>140)continue;el(g,px,py,1.3,.8,r()<.5?'#F7C3D0':'#FBDDE5',r()*3)}}
}}
{const _sd=shopDynamic;shopDynamic=function(g){_sd(g);const P=curStyle();if(P.deco!=='xmas')return;const Wd=AREAS.shop.w*TILE;const wins=[[86,4],[214,4]];for(let x=290;x+34<Wd-16;x+=112)wins.push([x,4]);
  wins.forEach(([x,y])=>{rr(g,x-1,y-2,36,3.2,1.6,'#FFFFFF');for(let k=0;k<7;k++)el(g,x+4+k*4.4,y+3+(k*7%9),.6,.6,'rgba(255,255,255,.9)');el(g,x+17,y+14.5,15,1.3,'#FFFFFF')})}}
{const _ia=itemArt;itemArt=function(it){
  if(it&&it.styleSet&&STYLES[it.styleSet]&&STYLES[it.styleSet].deco){let s=_ia(it);const d=STYLES[it.styleSet].deco;
    const add=d==='xmas'?'<path d="M6 8 Q14 14 22 8 Q30 14 38 8 Q46 14 58 8" stroke="#3E7A4E" stroke-width="2.4" fill="none"/>'+[14,30,46].map((x,k)=>`<circle cx="${x}" cy="${12.5}" r="2" fill="${['#C0463E','#E2B656','#C0463E'][k]}"/>`).join('')+'<path d="M45 52 L50 38 L55 52Z" fill="#3E7A4E"/><circle cx="50" cy="37" r="1.6" fill="#E2B656"/>'
      :[10,16,22,28,34,40,46,52].map((x,k)=>`<circle cx="${x}" cy="${9+Math.sin(k)*2}" r="2.6" fill="${k%2?'#F7C3D0':'#FBDDE5'}"/>`).join('')+[[14,44],[36,50],[48,42],[24,54]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="1.8" ry="1.1" fill="#F7C3D0"/>`).join('');
    return s.replace('</svg>',add+'</svg>')}
  return _ia(it)}}

/* ---------- 새 가구 ---------- */
const FURN=[ // [종류, 이름, 가격, 가로칸, 세로칸, 그림 위 여백(PR_DEB)]
  ['cafetable','카페 테이블 세트',38000,2,1,[0,-14,0,1]],['flowercart','꽃 수레',52000,2,1,[-2,-18,2,1]],['bike','꽃바구니 자전거',45000,2,1,[-2,-16,2,1]],
  ['bookshelf','원목 책장',34000,1,1,[0,-28,0,1]],['record','레코드 플레이어',42000,1,1,[0,-20,0,1]],['catcushion','고양이 방석',20000,1,1,[0,-4,0,1]],
  ['candles','캔들 선반',16000,1,1,[0,-16,0,1]],['armchair','벨벳 1인 소파',48000,1,1,[-1,-14,1,1]],['floorlamp','스탠드 조명',26000,1,1,[-1,-30,1,1]],
  ['flowerbench','꽃 벤치',36000,2,1,[-2,-12,2,1]],['cactus','선인장 삼총사',18000,1,1,[0,-10,0,1]],['fiddle','떡갈고무나무',28000,1,1,[-2,-30,2,1]],
  ['birdcage','새장 화분 스탠드',30000,1,1,[-1,-30,1,1]],['piano','업라이트 피아노',180000,2,1,[0,-24,0,1]],['xmastree','크리스마스 트리',40000,1,1,[-4,-36,4,1]],
  ['sakura','벚꽃 나무 화분',45000,1,1,[-6,-32,6,1]],['rug_round','파스텔 원형 러그',30000,3,2,null,true],['rug_check','체크 러그',32000,4,2,null,true]];
const WALLS=[['w_flowerart','꽃 그림 액자',18000,1],['w_pressed','압화 액자 세트',22000,2],['w_macrame','마크라메 벽걸이',20000,1],['w_garland','드라이플라워 가랜드',16000,2],['w_roundmirror','동그란 벽 거울',24000,1],['w_plantshelf','벽 선반 화분',24000,2]];
SHOP_CATS.splice(SHOP_CATS.findIndex(c=>c[0]==='deco')+1,0,['furn','가구']);
SHOP_ITEMS.push(...FURN.map(([t,n,p,w,h,b,flat])=>({id:'f_'+t,cat:'furn',part:n,name:n,desc:'',price:p,repeat:true,floor:flat?{t,w,h,flat:true,walk:true}:{t,w,h}})));
SHOP_ITEMS.push(...WALLS.map(([t,n,p,w])=>({id:'f_'+t,cat:'deco',part:'벽 · '+n,name:n,desc:'',price:p,repeat:true,floor:{t,w,h:1,wall:true,walk:true}})));
FURN.forEach(f=>{if(f[5])PR_DEB[f[0]]=f[5]});
const WALL_DEB=[0,-30,0,-14];
['w_flowerart','w_pressed','w_macrame','w_garland','w_roundmirror','w_plantshelf','w_postcard','w_crayon','w_pageart','w_portrait','w_scissors','w_invite','w_stamp','w_haruphoto','w_yunaphoto','w_plaque'].forEach(t=>PR_DEB[t]=WALL_DEB);
Object.assign(PR_DEB,{memocab:[0,-34,0,1],portrait_easel:[-2,-28,2,1],picbook:[0,-18,0,1],readnook:[-1,-16,1,1],notedesk:[0,-16,0,1],seapot:[-1,-16,1,1]});

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
  w_plaque(g,d,x,y){rr(g,x+1.5,y-25,13,9,1,'#8C6448');rr(g,x+2.6,y-24,10.8,7,.6,'#E2C27A');g.fillStyle='#5A3E2A';g.font="2.6px 'Jua',sans-serif";g.textAlign='center';g.fillText('봄 연구실',x+8,y-21.2);g.font="2.1px 'Jua',sans-serif";g.fillText('명예 연구원',x+8,y-18.4);el(g,x+3.4,y-23.2,.4,.4,'#C9A24A');el(g,x+12.6,y-23.2,.4,.4,'#C9A24A')}
});

/* ---------- 벽 장식 놓기: 뒤 벽(2번 줄)에만, 창문·시계를 피해서 ---------- */
function wallBusy(){const W=AREAS.shop.w*TILE,b=[[84,122],[212,250],[146,174]];if(S.up.d_wallshelf)b.push([174,210]);for(let x=290;x+34<W-16;x+=112)b.push([x-2,x+36]);return b}
/* 기본 벽 선반·작은 액자 자리에 벽 장식을 걸면 기본 장식은 치워요(겹쳐 보이지 않게) */
function wallCover(a,b){return S.decor.some(d=>d.wall&&!d.carried&&d.x*TILE<b&&(d.x+d.w)*TILE>a)}
function wallFlags(){if(!S.decor||!S.up)return;const f=wallCover(176,208),s2=wallCover(46,80);
  if(!!S.up.wfHide!==f){if(f)S.up.wfHide=true;else delete S.up.wfHide;BG_CACHE={}}if(!!S.up.wsHide!==s2){if(s2)S.up.wsHide=true;else delete S.up.wsHide;BG_CACHE={}}}
{const _ok=spotOK;spotOK=function(f,x,y){
  if(f&&f.wall){const W=AREAS.shop.w;if(y!==2||x<1||x+f.w>W-1)return false;for(const o of S.decor){if(o===f||!o.wall||o.carried)continue;if(x<o.x+o.w&&x+f.w>o.x)return false}return true}
  return _ok(f,x,y)}}
{const _ps=placeSpot;placeSpot=function(c,f){const r=_ps(c,f);if(f&&f.wall)return [r[0],2];return r}}
{const _fs=findSpot;findSpot=function(f){if(!f||!f.wall)return _fs(f);const W=AREAS.shop.w,B=wallBusy();
  const H=movables().filter(o=>!o.wall&&!o.flat&&o.y<=3).map(o=>[o.x*TILE+2,(o.x+o.w)*TILE-2]),hit=(L,x)=>L.some(([a,b])=>x*TILE<b&&(x+f.w)*TILE>a);
  for(const lv of [2,1])for(let x=1;x+f.w<W;x++){if(!spotOK(f,x,2))continue;if(lv>=1&&hit(H,x))continue;if(lv>=2&&hit(B,x))continue;return [x,2]}return null}}

/* ---------- 새 옷·치장 그림(옷장·상점 그림은 실제 캐릭터로 그려요) ---------- */
const ART_CACHE={};
function wearArt(cat,val){const key=cat+'|'+val;if(ART_CACHE[key])return ART_CACHE[key];
  const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');
  const o={};o[cat]=val;const p=palFromOutfit(PAL[1],o);const up=['hat','pin','glasses'].includes(cat);
  g.save();if(up){g.translate(64,226);g.scale(6,6)}else if(cat==='bag'){g.translate(56,118);g.scale(2.9,2.9)}else{g.translate(64,122);g.scale(2.8,2.8)}
  try{drawChar(g,0,0,p,cat==='bag'?.5:0,0,false,false,false,false)}catch(e){console.error(e)}g.restore();
  const url=cv.toDataURL();ART_CACHE[key]=`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${ART_BG}<image href="${url}" x="0" y="0" width="64" height="64"/></svg>`;return ART_CACHE[key]}
function decorArt(t,w,h,wall){const key='d|'+t;if(ART_CACHE[key])return ART_CACHE[key];
  const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');const d={t,w,h,x:0,y:0,wall};
  const top=wall?0:(PR_DEB[t]?-PR_DEB[t][1]:2),pw=w*TILE,ph=wall?20:h*TILE+top,sc=Math.min(110/Math.max(pw,1),110/Math.max(ph,1),4.2);
  g.save();g.translate(64-pw*sc/2,wall?64+20*sc:64+ph*sc/2-h*TILE*sc);g.scale(sc,sc);try{DECOR_DRAW[t](g,d,0,0,pw,h*TILE)}catch(e){console.error(e)}g.restore();
  const url=cv.toDataURL();ART_CACHE[key]=`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${ART_BG}${wall?'<rect x="6" y="6" width="52" height="40" rx="6" fill="'+curStyle().wall+'"/>':''}<image href="${url}" x="0" y="0" width="64" height="64"/></svg>`;return ART_CACHE[key]}
{const _ia=itemArt;itemArt=function(it){
  if(it&&it.style){const [k,v]=it.style;const known={glasses:['horn','gold'],hat:['beret','sunhat','beanie','cap'],pin:['ribbon','flower','band']}[k];
    if(k==='dress'||k==='bag'||(known&&!known.includes(v))||v==='knit')return wearArt(k,v)}
  if(it&&it.floor&&DECOR_DRAW[it.floor.t]&&/^f_/.test(it.id||''))return decorArt(it.floor.t,it.floor.w,it.floor.h,!!it.floor.wall);
  return _ia(it)}}

/* ---------- 이야기 선물 → 진짜 아이템 ---------- */
const GIFT_REWARD=[
  ['그림책 「꽃집 사람들」',{id:'picbook',floor:'picbook',name:'민지의 그림책 책장'}],
  ['오래된 꽃가위를 선물',{id:'scissors',up:'g_scissors',name:'순이 할머니의 꽃가위',msg:'사선 자르기가 한결 쉬워져요'}],
  ['엽서',{id:'postcard',memo:'w_postcard',name:'고마움 엽서 보드'}],
  ['크레파스',{id:'crayon',memo:'w_crayon',name:'하루의 크레파스 그림'}],
  ['책갈피',{id:'readnook',floor:'readnook',name:'윤아의 독서 의자'}],
  ['가제본',{id:'pageart',memo:'w_pageart',name:'그림책 원화 액자'}],
  ['초상화',{id:'portrait',floor:'portrait_easel',name:'두 사람 초상화'}],
  ['꽃 공책',{id:'notedesk',floor:'notedesk',name:'순이 할머니의 꽃 공책 책상'}],
  ['오래된 꽃가위를 받았어요',{id:'wscissors',memo:'w_scissors',name:'할머니의 사십 년 꽃가위'}],
  ['꽃무늬 앞치마',{id:'knit',wear:['apron','knit'],name:'순이 할머니의 꽃무늬 앞치마'}],
  ['청첩장',{id:'invite',memo:'w_invite',name:'도윤·해솔 청첩장 액자'}],
  ['바닷가 꽃씨',{id:'seapot',floor:'seapot',name:'바닷가 꽃 화분'}],
  ['우표',{id:'stamp',memo:'w_stamp',name:'꽃집 기념 우표 액자'}],
  ['처음 만든 꽃다발 사진',{id:'haruphoto',memo:'w_haruphoto',name:'하루의 첫 꽃다발 사진'}],
  ['임용 기념 사진',{id:'yunaphoto',memo:'w_yunaphoto',name:'윤아의 임용 기념 사진'}],
  ['명패',{id:'plaque',memo:'w_plaque',name:'봄 연구실 명예 연구원 명패'}],
  ['까미 에코백',{id:'kkamibag',wear:['bag','kkami'],name:'민지의 까미 에코백'}],
  ['꽃 화관',{id:'crown',wear:['hat','crown'],name:'하루의 꽃 화관'}],
  ['진주 머리핀',{id:'pearl',wear:['pin','pearl'],name:'진주 머리핀'}],
  ['봄 연구실 에코백',{id:'springbag',wear:['bag','spring'],name:'봄 연구실 에코백'}]];
/* 옷·치장 선물이 나오는 장면(기존 이야기 끝에 한 장씩 덧붙여요) */
[['minji',42,'민지가 그려 준 까미 에코백을 받았어요'],['haru',28,'하루가 운동회에서 받은 꽃 화관을 씌워 줬어요'],['doyun',38,'도윤과 해솔의 결혼식 답례품, 진주 머리핀을 받았어요'],['yuna',38,'윤아가 봄 연구실 에코백을 나눠 줬어요']].forEach(([k,req,txt])=>{
  const ch=(STORY[k]||[]).find(c=>c.req===req);if(ch&&!ch.pages.some(p=>p&&p.gift))ch.pages.push({gift:txt})});
function jo(w,a,b){const c=w.charCodeAt(w.length-1);return w+((c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28)?a:b)}
function giftOf(text){const e=GIFT_REWARD.find(([m])=>text.includes(m));return e?e[1]:null}
/* 어느 이야기 몇 번째 막에 어떤 선물이 있는지 */
const GIFT_AT=[];for(const k in STORY)(STORY[k]||[]).forEach((c,ci)=>(c.pages||[]).forEach(p=>{if(p&&p.gift){const r=giftOf(p.gift);if(r)GIFT_AT.push({k,ci,r})}}));
function giftDecor(r){if(r.memo)return {t:'memocab',w:2,h:1,items:[]};return {t:r.floor,w:1,h:1,gift:r.id}}
function grantGift(r){const key='gift_'+r.id;if(S.up[key])return null;
  if(r.up){S.up[r.up]=true;S.up[key]=true;BG_CACHE={};return `${r.name}: ${r.msg}`}
  if(r.wear){S.closet['st_'+r.wear[0]+'_'+r.wear[1]]=true;S.up[key]=true;return `${jo(r.name,'이','가')} 옷장에 들어갔어요`}
  if(r.memo){const cab=S.decor.find(d=>d.t==='memocab');if(cab){if(!cab.items.includes(r.memo))cab.items.push(r.memo);S.up[key]=true;delete S.up['gpend_'+r.id];return `${jo(r.name,'을','를')} 추억 진열장에 넣어 두었어요`}}
  const f=giftDecor(r);let sp=null;for(const yy of [8,3,9,7,6]){for(let x=2;x+f.w<AREAS.shop.w-1&&!sp;x++)if(spotOK(f,x,yy))sp=[x,yy];if(sp)break}if(!sp){S.up['gpend_'+r.id]=1;return `${jo(r.name,'은','는')} 가게에 자리가 없어서 보관해 뒀어요. 자리가 나면 놓을게요`}
  f.x=sp[0];f.y=sp[1];if(r.memo)f.items.push(r.memo);S.decor.push(f);S.up[key]=true;delete S.up['gpend_'+r.id];BG_CACHE={};return r.memo?`가게에 '추억 진열장'이 생겼어요. ${jo(r.name,'을','를')} 넣어 두었어요`:`${jo(r.name,'을','를')} 가게에 놓아 두었어요. 가구 배치로 옮길 수 있어요`}
{const _se=storyEffect;storyEffect=function(i,k,e){_se(i,k,e);if(e&&e.gift){const r=giftOf(e.gift);if(r){const m=grantGift(r);if(m)setTimeout(()=>{try{toastAll(m)}catch(er){}},1600);bump();saveMid()}}}}
/* 이미 지난 이야기의 선물(이번 업데이트 전에 받은 것)과 보관해 둔 선물을 채워 줘요 */
function giftCatchUp(){if(!S.bonds||!S.decor||S.phase!=='play')return;let n=0,last=null;
  for(const a of GIFT_AT){const r=a.r;if(S.up['gift_'+r.id]&&!S.up['gpend_'+r.id])continue;if(chOf(a.k)<=a.ci)continue;const m=grantGift(r);if(m&&S.up['gift_'+r.id]){n++;last=r.name}}
  if(n){toastAll(n>1?`지난 이야기에서 받은 선물 ${n}개를 가게와 옷장에 채워 두었어요`:`${jo(last,'을','를')} 채워 두었어요`);bump();saveMid()}}
{const _up=update;let acc=0,acc2=0;update=function(dt){_up(dt);acc+=dt;acc2+=dt;if(acc2>.5){acc2=0;try{wallFlags()}catch(e){}}if(acc>3){acc=0;try{giftCatchUp()}catch(e){console.error(e)}}}}
