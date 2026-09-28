
'use strict';
/* =========================================================
   우리 둘의 꽃집 — 마을·용품상점·진열 판매·자동 저장 버전
   ========================================================= */
const TILE=16, VW=288, VH=176;
const DAY_LEN=600, REAL_PER_MIN=2.5, URGENT_MIN=260, MARKET_CLOSE=180, CLOSE_OK=540;
const HYDRATE_MIN=30, DRY_MIN=60, WILT=15, REST_MIN=5, BOOST_MIN=60;
const SAVE_KEY='ourflowershop_save_v1';
/* 미리보기 때 쓰던 복사본 저장 정리(진짜 저장은 건드리지 않음) */
try{localStorage.removeItem('ourflowershop_save_v1_beta');localStorage.removeItem('ourflowershop_settings_v1_beta')}catch(e){}
const AREAS={shop:{h:11},market:{w:22,h:11},supply:{w:14,h:10},town:{w:58,h:34},north:{w:58,h:22}};
function shopLevel(){return S.up.exp3?3:S.up.exp2?2:S.up.exp1?1:0}
Object.defineProperty(AREAS.shop,'w',{get:()=>18+4*shopLevel()});
const GROW={tulip:3,freesia:3,gyp:2,rose:4,hydrangea:4};const SEED_PRICE={tulip:4000,freesia:3500,gyp:2500,rose:6000,hydrangea:5000};
const RIVER=[27,33];function walkCol(tx){return (tx>=24&&tx<=26)||(tx>=34&&tx<=36)}function bridgeRow(ty){return (ty>=6&&ty<=12)||(ty>=17&&ty<=18)||(ty>=24&&ty<=25)}

const FL={
  tulip:{name:'튤립',decay:5,price:9000,dot:'#EE8FA7'},
  freesia:{name:'프리지아',decay:4,price:7500,dot:'#F5CF4E'},
  gyp:{name:'안개꽃',decay:3,price:5000,dot:'#FFFFFF'},
  rose:{name:'장미',decay:3.5,price:15000,dot:'#D9435E'},
  hydrangea:{name:'수국',decay:6,price:12000,dot:'#9DB8E8'}
};
const TYPES=['tulip','freesia','gyp','rose','hydrangea'];
const LEAVES={tulip:3,freesia:2,gyp:4,rose:3,hydrangea:2};
const PAPERS={
  pink:{name:'분홍',c:'#F4B6C4',d:'#E08FA4',l:'#FBDDE4'},
  yellow:{name:'노랑',c:'#F6DC86',d:'#E2BD55',l:'#FBEFC3'},
  cream:{name:'크림',c:'#EFE4D2',d:'#D5C3A8',l:'#FAF4EA'},
  sky:{name:'하늘',c:'#B9D6F0',d:'#8DB6DE',l:'#DDEBF8'},
  lilac:{name:'라일락',c:'#D6C6EC',d:'#B5A0DA',l:'#EAE1F6'},
  mint:{name:'민트',c:'#BFE3D0',d:'#94C9AE',l:'#E1F3EA',extra:true},
  coral:{name:'코랄',c:'#F6B7A0',d:'#E3927A',l:'#FBDCD0',extra:true},
  kraft:{name:'크라프트',c:'#D8B994',d:'#B8956C',l:'#EBD8C0',extra:true}
};
const RIBBONS={
  white:{name:'흰색',c:'#FFFFFF',d:'#D6D0C6'},
  pink:{name:'분홍',c:'#EE7F9C',d:'#C65C79'},
  navy:{name:'남색',c:'#3A4C80',d:'#243059'},
  gold:{name:'금색',c:'#E1B656',d:'#B48C33'},
  lavender:{name:'라벤더',c:'#B9A2E0',d:'#8E76C0',extra:true},
  green:{name:'초록',c:'#7FB070',d:'#5C8C50',extra:true}
};
const TEMPLATES=[
  {title:'장미 고백',text:'오늘 고백하려고요. 새빨간 장미로 부탁드려요.',req:{rose:7,gyp:3},paper:'cream',price:62000},
  {title:'수국 한 아름',text:'여름 느낌 나는 수국 꽃다발이요. 시원하게요!',req:{hydrangea:2,gyp:3},paper:'sky',price:44000},
  {title:'결혼기념일',text:'부모님 결혼기념일이에요. 장미랑 프리지아로 우아하게요.',req:{rose:5,freesia:3},paper:'lilac',price:60000},
  {title:'집들이 수국',text:'새 집에 어울리는 수국이랑 튤립이요.',req:{hydrangea:2,tulip:3},paper:'mint',price:48000},
  {title:'기념일 꽃다발',text:'사귄 지 100일이에요. 사랑스러운 분홍빛으로 부탁해요.',req:{tulip:5,gyp:3},paper:'pink',price:38000},
  {title:'졸업 축하 꽃다발',text:'동생 졸업식이에요. 밝고 환하게 해 주세요!',req:{freesia:5,tulip:2,gyp:2},paper:'yellow',price:42000},
  {title:'병문안 꽃다발',text:'친구 병문안 가요. 은은하고 차분하게요.',req:{freesia:3,gyp:4},paper:'cream',price:30000},
  {title:'생신 꽃다발',text:'엄마 생신이에요. 따뜻한 느낌이면 좋겠어요.',req:{tulip:4,freesia:3},paper:'pink',price:40000},
  {title:'첫 출근 축하',text:'산뜻하고 기분 좋은 느낌으로요.',req:{freesia:4,gyp:3},paper:'sky',price:33000},
  {title:'고백 꽃다발',text:'튤립만으로 심플하게, 진심이 보이게요.',req:{tulip:7},paper:'cream',price:36000},
  {title:'집들이 선물',text:'노랗고 풍성하게 부탁드려요.',req:{freesia:6,gyp:4},paper:'yellow',price:41000},
  {title:'감사 인사',text:'선생님께 드려요. 단정하고 예쁘게요.',req:{tulip:3,freesia:2,gyp:3},paper:'lilac',price:37000}
];
const STYLE_IDS={natural:'우드톤',minimal:'화이트톤'};
const SHOP_CATS=[['equip','설비'],['tool','도구'],['wrap','포장재'],['deco','꾸미기'],['interior','인테리어'],['style','옷·치장'],['expand','가게 확장']];
const STYLE={
  glasses:{label:'안경',opts:[['horn','검은 뿔테 안경',15000],['gold','동그란 금테 안경',18000]]},
  hat:{label:'모자',opts:[['beret','베레모',12000],['sunhat','밀짚모자',15000],['beanie','니트 비니',10000],['cap','야구 모자',10000]]},
  pin:{label:'머리핀·리본',opts:[['ribbon','리본 핀',6000],['flower','꽃 머리핀',8000],['band','헤어밴드',7000]]},
  apron:{label:'앞치마',opts:[['#F4B6C4','분홍 앞치마',14000],['#A7C7A0','초록 앞치마',14000],['#6F8FB8','데님 앞치마',16000]]},
  tee:{label:'티셔츠',opts:[['#9FD8C4','민트 티셔츠',12000],['#F6B7A0','코랄 티셔츠',12000],['#F1E6D2','크림 티셔츠',12000]]}
};
const SHOP_ITEMS=[
  {id:'fridge',cat:'equip',name:'꽃 냉장고 업그레이드',desc:'냉장고에 넣어둔 꽃과 꽃다발이 절반 속도로 시들어요.',price:120000},
  {id:'bucket3',cat:'equip',name:'물올림 통 추가',desc:'물올림 통이 하나 더 생겨요.',price:30000},
  {id:'bucket4',cat:'equip',name:'물올림 통 하나 더',desc:'물올림 통이 또 하나 생겨요.',price:40000,need:'bucket3'},
  {id:'dryer',cat:'equip',name:'드라이플라워 건조대',desc:'꽃을 걸어두면 한 시간 뒤 드라이플라워가 돼요.',price:90000},
  {id:'pickup',cat:'equip',name:'자동 픽업대',desc:'포장한 예약 꽃다발을 올려두면 손님이 알아서 찾아가요.',price:150000},
  {id:'craft2',cat:'equip',name:'작업대 추가',desc:'둘이 동시에 꽃다발을 만들 수 있어요.',price:80000},
  {id:'sprinkler',cat:'tool',name:'스프링클러',desc:'텃밭 사이 교차로에 설치하면 매일 아침 주변 밭에 물을 줘요. 여러 개 살 수 있어요.',price:45000,repeat:true,bag:true},
  {id:'bag2',cat:'tool',name:'가방 넓히기 (12칸)',desc:'두 사람 가방이 모두 12칸이 돼요.',price:60000},
  {id:'bag3',cat:'tool',name:'가방 넓히기 (16칸)',desc:'두 사람 가방이 모두 16칸이 돼요.',price:150000,need:'bag2'},
  {id:'scissors',cat:'tool',name:'좋은 가위',desc:'사선 자르기 성공 구간이 넓어져요.',price:40000},
  {id:'papers2',cat:'wrap',name:'새 포장지 세트',desc:'민트, 코랄, 크라프트 포장지가 생겨요.',price:25000},
  {id:'ribbons2',cat:'wrap',name:'새 리본 세트',desc:'라벤더, 초록 리본이 생겨요.',price:15000},
  {id:'d_jute',cat:'deco',part:'바닥',name:'주트 러그',desc:'',price:28000,repeat:true,floor:{t:'rug_jute',w:4,h:2,flat:true,walk:true}},
  {id:'d_pendant',cat:'deco',part:'천장',name:'펜던트 조명',desc:'',price:35000},
  {id:'d_curtain',cat:'deco',part:'창문',name:'린넨 커튼',desc:'',price:22000},
  {id:'d_wreath',cat:'deco',part:'벽',name:'드라이플라워 리스',desc:'',price:18000},
  {id:'d_wallshelf',cat:'deco',part:'벽',name:'벽 선반과 오브제',desc:'',price:20000},
  {id:'d_mirror',cat:'deco',part:'바닥 소품',name:'아치 거울',desc:'',price:26000,repeat:true,floor:{t:'mirror',w:1,h:1}},
  {id:'d_ladder',cat:'deco',part:'바닥 소품',name:'원목 사다리 선반',desc:'',price:32000,repeat:true,floor:{t:'ladder',w:1,h:1}},
  {id:'d_monstera',cat:'deco',part:'바닥 소품',name:'몬스테라 화분',desc:'',price:24000,repeat:true,floor:{t:'monstera',w:1,h:1}},
  {id:'d_olive',cat:'deco',part:'바닥 소품',name:'올리브 나무',desc:'',price:30000,repeat:true,floor:{t:'olive',w:1,h:1}},
  {id:'d_terrarium',cat:'deco',part:'바닥 소품',name:'유리 온실 장식장',desc:'',price:65000,repeat:true,floor:{t:'terrarium',w:2,h:1}},
  {id:'hanging',cat:'deco',part:'천장',name:'행잉 화분',desc:'천장에 초록 화분을 더 매달아요.',price:18000},
  {id:'lights',cat:'deco',part:'천장',name:'전구 조명',desc:'가게에 전구 줄을 달아요. 저녁이면 반짝여요.',price:22000},
  {id:'sign',cat:'deco',part:'가게 앞',name:'새 간판 달기',desc:'우리 꽃집 간판을 꽃으로 꾸미고 이름을 새로 정해요. 언제든 다시 살 수 있어요.',price:30000,repeat:true},
  ...Object.entries(STYLE).flatMap(([k,v])=>v.opts.map(([val,name,price])=>({id:'st_'+k+'_'+val,cat:'style',name,desc:'가게 옷장에서 갈아입을 수 있어요. 둘 다 입을 수 있어요.',price,style:[k,val],part:{glasses:'얼굴',hat:'머리',pin:'머리',apron:'몸',tee:'몸'}[k]}))),
  ...Object.keys(STYLE_IDS).map(k=>({id:'style_'+k,cat:'interior',name:STYLE_IDS[k],desc:'',price:300000,styleSet:k,repeat:true,part:'가게 전체'})),
  {id:'exp1',cat:'expand',name:'가게 넓히기 1단계',desc:'가게 오른쪽 벽을 터서 바닥이 넓어져요. 넓어진 곳에 가구를 옮겨 놓을 수 있어요.',price:500000},
  {id:'exp2',cat:'expand',name:'가게 넓히기 2단계',desc:'가게가 한 번 더 넓어져요.',price:1200000,need:'exp1'},
  {id:'exp3',cat:'expand',name:'가게 넓히기 3단계',desc:'가게가 가장 넓어져요.',price:2500000,need:'exp2'}
];
const NAMES=['서연','도윤','지우','하준','수아','민재','은비','시우','하린','태오','예린','지호','나연','유진','준서','소윤'];
// 예전 저장에 남아 있는 성+이름을 이름만 남기기(저장 형식은 그대로, 불러올 때 글자만 정리)
const OLD_NAMES=['김서연','이도윤','박지우','최하준','정수아','강민재','조은비','윤시우','장하린','임태오','한예린','오지호'];
function dropSurnames(o,depth){if(!o||typeof o!=='object'||depth>6)return;for(const k in o){const v=o[k];if(k==='name'&&typeof v==='string'&&OLD_NAMES.includes(v))o[k]=v.slice(1);else if(v&&typeof v==='object')dropSurnames(v,depth+1)}}
const SLOTS=[120,150,180,240,270,300,360,390,420,450];

/* ---------- utils ---------- */
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
function hex2rgb(h){h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16))}
function mix(a,b,t){t=clamp(t,0,1);const A=hex2rgb(a),B=hex2rgb(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function won(n){return Math.round(n).toLocaleString('ko-KR')+'원'}
function clock(t){const tot=540+Math.floor(t);const h=Math.floor(tot/60),m=tot%60;return `${h<12?'오전':'오후'} ${h>12?h-12:h}:${String(m).padStart(2,'0')}`}
function wither(f){return f>=70?0:clamp((70-f)/60,0,1)}
function seedRand(seed){let s=(seed>>>0)||1;return ()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return (s%10000)/10000}}
function freshColor(f){return f>=70?'#7CC06A':f>=40?'#E8C04A':f>=WILT?'#E89A5A':'#A88A72'}
function freshWord(f){return f>=70?'싱싱':f>=40?'괜찮음':f>=WILT?'시들기 시작':'시듦'}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

/* ---------- state ---------- */
const S={
  phase:'title',mode:'solo',active:0,day:1,t:0,speed:1,paused:false,money:80000,closet:{},outfit:[{},{}],
  orders:[],tomorrow:[],customers:[],calls:[],walkers:[],offers:[],prices:{},
  bags:[[],[]],bench:[],works:{craft:{orderId:null,stems:[]},craft2:{orderId:null,stems:[]}},shopName:'우리 둘의 꽃집',
  up:{},stats:null,chars:[],st:{},stList:[],nextId:1,puffs:[],nextWalkin:60,edit:false,decor:null,drops:[]
};
const PAL=[
  {name:'SM',num:'17',tag:'#3E6FC2',style:'m',hair:'#3B2A22',hairHi:'#5E4536',skin:'#F1C9A5',skinSh:'#DBAA86',tee:'#4C82D4',teeSh:'#3A68B3',pants:'#26262E',shoe:'#F4F2EE'},
  {name:'SK',num:'7',tag:'#E0708C',style:'f',face:'slim',hair:'#221C21',hairHi:'#43393F',skin:'#F4D3B7',skinSh:'#E0B597',tee:'#4C82D4',teeSh:'#3A68B3',pants:'#26262E',shoe:'#F4F2EE'}
];

/* ---------- world layout ---------- */
const STATION_DEFS=[
  ['storage','storage','shop',1,2,2,1],['wardrobe','wardrobe','shop',3,2,2,1],
  ['bucket1','bucket','shop',5,2,1,1],['bucket2','bucket','shop',6,2,1,1],['bucket3','bucket','shop',7,2,1,1,'bucket3'],['bucket4','bucket','shop',8,2,1,1,'bucket4'],
  ['craft','craft','shop',9,2,2,1],['craft2','craft','shop',11,2,2,1,'craft2'],['wrap','wrap','shop',13,2,2,1],['dryer','dryer','shop',15,2,2,1,'dryer'],
  ['trim','trim','shop',1,5,6,1],
  ['board','board','shop',15,4,1,1],['trash','trash','shop',16,4,1,1],
  ['counter','counter','shop',8,5,5,1],['phone','phone','shop',13,5,1,1],['pickup','pickup','shop',14,5,2,1,'pickup'],
  ['display','display','shop',1,7,3,1],
  ['st_tulip','stall','market',2,2,3,1],['st_freesia','stall','market',6,2,3,1],['st_gyp','stall','market',10,2,3,1],['st_rose','stall','market',14,2,3,1],['st_hydrangea','stall','market',18,2,3,1],['seedstall','seedstall','market',15,8,3,1],
  ['keeper','keeper','supply',5,3,4,1],
  ['bench1','bench','town',16,15,2,1],['bench2','bench','town',20,19,2,1],['bench3','bench','town',37,18,2,1],['bench4','bench','town',21,24,2,1],['bench5','bench','town',50,24,2,1],['bench6','bench','town',40,29,2,1],['rb1','bench','town',24,15,2,1],['rb2','bench','town',24,20,2,1],['rb3','bench','town',35,9+11,2,1],
  ...[[6,7],[14,7],[40,7],[48,7],[20,7]].map(([x,y],k)=>['nv'+k,'bench','north',x,y,2,1]),['nb1','bench','north',24,16,2,1],['nb2','bench','north',35,11,2,1],
  ...[41,44,47,50].flatMap((x,a)=>[15,17,19].map((y,b)=>['plot'+a+b,'plot','town',x,y,2,1])),
  ...[43,46,49].flatMap((x,a)=>[16,18].map((y,b)=>['spr'+a+b,'sprspot','town',x,y,1,1]))
];
const DECOR_BASE={
  shop:[{t:'table',x:11,y:8,w:1,h:1},{t:'waitbench',x:14,y:8,w:2,h:1},{t:'bigplant',x:1,y:9,w:1,h:1},{t:'bigplant',x:16,y:9,w:1,h:1},{t:'easel',x:6,y:9,w:1,h:1}],
  market:[{t:'crate',x:2,y:7,w:1,h:1},{t:'crate',x:19,y:7,w:1,h:1},{t:'planterTree',x:1,y:9,w:1,h:1},{t:'planterTree',x:20,y:9,w:1,h:1},{t:'bucketRow',x:2,y:5,w:3,h:1},{t:'bucketRow',x:17,y:5,w:3,h:1},{t:'boxes',x:4,y:8,w:2,h:1}],
  supply:[{t:'tallshelf',x:1,y:2,w:3,h:1},{t:'tallshelf',x:10,y:2,w:3,h:1},{t:'tooltable',x:1,y:6,w:2,h:1},{t:'pottable',x:11,y:6,w:2,h:1},{t:'bigplant',x:12,y:8,w:1,h:1},{t:'fridgeDemo',x:4,y:2,w:1,h:1},{t:'seedRack',x:1,y:4,w:1,h:1},{t:'canRack',x:12,y:4,w:1,h:1}],
  north:[
    ...[[2,9,'maple'],[4,14,'ginkgo'],[9,11,'maple'],[12,17,'ginkgo'],[16,12,'maple'],[19,18,'pine'],[3,19,'ginkgo'],[8,19,'maple'],[21,10,'ginkgo'],[30,17+2,'maple'],[39,15,'ginkgo'],[43,10,'maple'],[46,16,'ginkgo'],[51,12,'maple'],[54,18,'ginkgo'],[49,19,'pine'],[56,9,'maple'],[41,19,'maple'],[14,9,'ginkgo'],[33,9,'birch'].slice(0,3)].filter(t=>!(t[0]>=RIVER[0]&&t[0]<=RIVER[1])).map(([x,y,v])=>({t:'tree',v,x,y,w:1,h:1})),
    ...[[10,10],[22,12],[38,12],[50,10],[18,19],[44,19],[5,16]].map(([x,y])=>({t:'lamp',x,y,w:1,h:1}))
  ],
  town:[
    {t:'pond',x:4,y:15,w:5,h:4,flat:true},
    ...[[2,13,'cherry'],[11,14,'maple'],[23,13,'ginkgo'],[3,21,'pine'],[13,21,'birch'],[23,20,'ginkgo'],[10,22,'bush'],[37,21,'maple'],[38,23,'pine'],[56,15,'ginkgo'],[56,20,'birch'],[37,11+2,'ginkgo'],[1,17,'pine'],[20,13,'bush'],[23,17,'maple'],[18,22,'birch'],
       [1,25,'pine'],[17,25,'birch'],[17,29,'maple'],[1,31,'cherry'],[18,32,'pine'],[55,23,'cherry'],[35,23,'bush'],[46,23,'bush']].map(([x,y,v])=>({t:'tree',v,x,y,w:1,h:1})),
    ...[[5,12],[15,12],[23,12],[37,12],[46,12],[55,12],[20,24],[37,24],[44,24],[54,24],[24,2],[36,2]].map(([x,y])=>({t:'lamp',x,y,w:1,h:1})),
    {t:'clocktower',x:37,y:15,w:2,h:2},
    {t:'fenceH',x:39,y:13,w:6,h:1},{t:'fenceH',x:47,y:13,w:8,h:1},{t:'fenceH',x:39,y:21,w:16,h:1},{t:'fenceV',x:39,y:14,w:1,h:7},{t:'fenceV',x:54,y:14,w:1,h:7},
    {t:'shed',x:52,y:15,w:2,h:2},{t:'mailbox',x:9,y:6,w:1,h:1},{t:'planterBox',x:13,y:6,w:2,h:1},{t:'hoursSign',x:40,y:6,w:1,h:1},
    {t:'school',x:3,y:24,w:12,h:4},{t:'schoolclock',x:8.5,y:28,w:1,h:.1,walk:true},{t:'swing',x:3,y:30,w:4,h:1},{t:'slide',x:14,y:29,w:2,h:1},{t:'sandbox',x:3,y:32,w:3,h:1,flat:true,walk:true},{t:'playmat',x:7,y:32,w:2,h:1,flat:true,walk:true}
  ]
};
const DECOR={get north(){return DECOR_BASE.north},get shop(){return S.decor||DECOR_BASE.shop},get market(){return DECOR_BASE.market},get supply(){return DECOR_BASE.supply},get town(){return DECOR_BASE.town}};
const DOORS=[
  {area:'town',x0:24*TILE,x1:27*TILE,edge:'top',y:.5*TILE,to:'north',sx:25.5*TILE,sy:20.4*TILE,dir:'up'},
  {area:'town',x0:34*TILE,x1:37*TILE,edge:'top',y:.5*TILE,to:'north',sx:35.5*TILE,sy:20.4*TILE,dir:'up'},
  {area:'north',x0:24*TILE,x1:27*TILE,edge:'bottom',y:21.7*TILE,to:'town',sx:25.5*TILE,sy:1.4*TILE,dir:'down'},
  {area:'north',x0:34*TILE,x1:37*TILE,edge:'bottom',y:21.7*TILE,to:'town',sx:35.5*TILE,sy:1.4*TILE,dir:'down'},
  {area:'shop',x0:8*TILE,x1:10*TILE,edge:'bottom',y:10.3*TILE,to:'town',sx:7*TILE,sy:7.2*TILE,dir:'down'},
  {area:'market',x0:8*TILE,x1:10*TILE,edge:'bottom',y:10.3*TILE,to:'town',sx:43*TILE,sy:7.2*TILE,dir:'down'},
  {area:'supply',x0:6*TILE,x1:8*TILE,edge:'bottom',y:9.3*TILE,to:'town',sx:20*TILE,sy:7.2*TILE,dir:'down'},
  {area:'town',x0:6*TILE,x1:8*TILE,edge:'top',y:5.7*TILE,to:'shop',sx:9*TILE,sy:9.3*TILE,dir:'up'},
  {area:'town',x0:19*TILE,x1:21*TILE,edge:'top',y:5.7*TILE,to:'supply',sx:7*TILE,sy:8.3*TILE,dir:'up'},
  {area:'town',x0:42*TILE,x1:44*TILE,edge:'top',y:5.7*TILE,to:'market',sx:9*TILE,sy:9.3*TILE,dir:'up'}
];
const FACADES=[
  {t:'shopFront',x:1,w:11,door:6},{t:'house',x:12,w:4,c:'#F3D7D0'},{t:'supplyFront',x:16,w:8,door:19},
  {t:'marketFront',x:37,w:12,door:42},{t:'house',x:49,w:5,c:'#D9DDF0'},{t:'house',x:54,w:3,c:'#F3D7D0'}
];
const SLOTN={storage:12,shelf:2,bucket:2,dryer:2,pickup:2,display:6,counter:4};
const BAGN=8;
function bagSize(){return S.up.bag3?16:S.up.bag2?12:8}
function ensureBags(){const n=bagSize();S.bags.forEach(b=>{while(b.length<n)b.push(null)})}
function owned(s){return !s.need||!!S.up[s.need]}
function makeStations(){
  S.st={};S.stList=[];
  STATION_DEFS.forEach(([id,type,area,x,y,w,h,need])=>{
    const o={id,type,area,x,y,w,h,need,item:null};
    if(type==='stall')o.flower=id.slice(3);
    if(SLOTN[type])o.slots=Array(SLOTN[type]).fill(null);
    if(type==='plot')o.plot=null;
    if(area==='north'&&id.startsWith('nv')){o.view=true;o.up=true}
    S.st[id]=o;S.stList.push(o);
  });
}
function stationsIn(area){return S.stList.filter(s=>s.area===area&&owned(s)&&!s.carried)}
function doorGap(area,tx,ty){
  const A=AREAS[area];
  if(area==='town')return ty===5&&((tx>=6&&tx<=7)||(tx>=19&&tx<=20)||(tx>=42&&tx<=43));
  if(ty!==A.h-1)return false;
  return area==='supply'?(tx>=6&&tx<=7):(tx>=8&&tx<=9);
}
// 공원 꽃 화단(배경 그림과 같은 자리) — 사람·동물이 밟고 지나가지 않게
const TOWN_BEDS=[[40,214,48],[150,214,52],[300,300,70],[190,346,80],[240,214,60],[40,330,50],[320,230,40],[250,262,36],[160,300,40]];
function solid(area,px,py){
  const A=AREAS[area];const tx=Math.floor(px/TILE),ty=Math.floor(py/TILE);
  if(tx<1||tx>A.w-2||py<0)return true;
  if(area==='town'){if(ty<6&&!doorGap(area,tx,ty)&&!walkCol(tx))return true;if(ty>=A.h-1)return true;if(tx>=RIVER[0]&&tx<=RIVER[1]&&!bridgeRow(ty)&&ty<27)return true;if(ty>=27&&tx>=20&&!(tx>=40&&tx<=42&&ty<=30))return true}
  else if(area==='north'){if(ty<7)return true;if(ty>=A.h-1&&!walkCol(tx))return true;if(py>=A.h*TILE)return true;if(tx>=RIVER[0]&&tx<=RIVER[1]&&!(ty>=13&&ty<=14))return true}
  else if(area!=='north'){if(ty<2)return true;if(ty>=A.h-1&&!doorGap(area,tx,ty))return true;if(ty>=A.h)return true}
  if(area==='town'&&py>=440&&py<=536&&px>=26&&px<=278){if(px<=34&&py>=448)return true;if(px>=269&&py>=448)return true;if(py<=451&&px>=238)return true}
  if(area==='town')for(const [bx,by,bw] of TOWN_BEDS)if(px>=bx-1&&px<bx+bw+1&&py>=by-2&&py<by+10)return true;
  for(const s of S.stList){if(s.area!==area||!owned(s)||s.carried||(s.type==='sprspot'&&!s.on))continue;if(px>=s.x*TILE&&px<(s.x+s.w)*TILE&&py>=s.y*TILE&&py<(s.y+s.h)*TILE)return true}
  for(const d of DECOR[area]){if(d.carried||d.walk)continue;if(px>=d.x*TILE&&px<(d.x+d.w)*TILE&&py>=d.y*TILE&&py<(d.y+d.h)*TILE)return true}
  return false;
}
function blocked(area,x,y){return solid(area,x-5,y-4)||solid(area,x+5,y-4)||solid(area,x-5,y)||solid(area,x+5,y)}
function moveChar(c,dx,dy){
  /* 모서리에 살짝 걸리면 옆으로 미끄러져 지나가게(최대 6칸의 1/16 만큼) */
  const slide=(ax)=>{const d=ax==='x'?dx:dy,sp=Math.abs(d);for(let k=1;k<=6;k++){for(const s of [-1,1]){
    const tx=ax==='x'?c.x+d:c.x+s*k,ty=ax==='x'?c.y+s*k:c.y+d;
    if(!blocked(c.area,tx,ty)){const st=Math.min(sp,k)*s;if(ax==='x'){if(!blocked(c.area,c.x,c.y+st))c.y+=st}else{if(!blocked(c.area,c.x+st,c.y))c.x+=st}return}}}};
  if(dx){if(!blocked(c.area,c.x+dx,c.y))c.x+=dx;else if(Math.abs(dy)<Math.abs(dx)*.5)slide('x')}
  if(dy){if(!blocked(c.area,c.x,c.y+dy))c.y+=dy;else if(Math.abs(dx)<Math.abs(dy)*.5)slide('y')}
}
const Q=Math.SQRT1_2;
const DIRV={down:[0,1],up:[0,-1],left:[-1,0],right:[1,0],dr:[Q,Q],dl:[-Q,Q],ur:[Q,-Q],ul:[-Q,-Q]};
const OCT=['right','dr','down','dl','left','ul','up','ur'];
function targetOf(c){
  const [dx,dy]=DIRV[c.dir];const fx=c.x+dx*12,fy=c.y-3+dy*12;
  if(!S.edit&&c.area==='town'&&S.cat&&Math.hypot(S.cat.x-fx,S.cat.y-2-fy)<12)return {type:'npc',walker:S.cat};
  if(!S.edit){const pool=c.area==='north'?S.walkers.filter(w=>!w.hidden&&w.zone==='north'):c.area==='town'?S.walkers.filter(w=>!w.hidden&&w.zone!=='north').concat(S.customers.filter(k=>k.area==='town')):c.area==='shop'?S.customers.filter(k=>k.area==='shop'&&k.goal!=='out'):[];for(const w of pool){if(Math.hypot(w.x-fx,w.y-3-fy)<12)return {type:'npc',walker:w}}}
  const hasSpr=c.bag.some(it=>it&&it.kind==='sprinkler');const list=stationsIn(c.area).filter(s=>s.type!=='sprspot'||s.on||hasSpr);
  for(const s of list){if(fx>=s.x*TILE-3&&fx<=(s.x+s.w)*TILE+3&&fy>=s.y*TILE-3&&fy<=(s.y+s.h)*TILE+3)return s}
  let best=null,bd=18;
  for(const s of list){const cx=clamp(c.x,s.x*TILE,(s.x+s.w)*TILE),cy=clamp(c.y-3,s.y*TILE,(s.y+s.h)*TILE);const d=Math.hypot(cx-c.x,cy-(c.y-3));if(d<bd){bd=d;best=s}}
  return best;
}

/* ---------- setup ---------- */
function makeChar(i){
  const p=i===0?[6*TILE,3.9*TILE]:[11.5*TILE,3.9*TILE];
  return {i,pal:PAL[i],area:'shop',x:p[0],y:p[1],vx:0,vy:0,dir:'down',ang:0,face:0,anim:0,moving:false,bag:S.bags[i],modal:null,rest:null,carry:null,waterT:0,boostUntil:-1,fade:0,lastAct:0};
}
function palOf(c){const o=S.outfit[c.i]||{};const base=PAL[c.i];const p={...base,glasses:o.glasses||null,hat:o.hat||null,pin:o.pin||null,apron:o.apron||null};if(o.tee){p.tee=o.tee;p.teeSh=mix(o.tee,'#3B2F3F',.15)}return p}
function stem(t,price){return {t,f:100,hyd:0,cut:0,trim:false,c:price/5}}
function genOrder(tpl,time,day){return {id:S.nextId++,...tpl,req:{...tpl.req},name:pick(NAMES),time,status:'pending',arrived:false,day}}
function rollPrices(){TYPES.forEach(t=>{S.prices[t]=Math.round(FL[t].price*rnd(.85,1.15)/100)*100})}
function planCalls(){
  S.calls=[100,280,410].map(base=>({t:base+Math.round(rnd(-10,10)),dur:40,state:'wait',offer:{tpl:pick(TEMPLATES),time:pick(SLOTS),name:pick(NAMES)}}));
  S.offers=[150+Math.round(rnd(-20,20)),340+Math.round(rnd(-20,20))];
}
const HAIRC=['#3B2A22','#6B4A3A','#1F1A1E','#8A5A3C','#B08560','#C9A06A','#5A3A2E','#2E2A3A'];
const TEES=['#F2B5A7','#A7C7A0','#E9D48A','#B8A6D9','#9CC5D8','#F0C3D2','#F6C48E','#C6D8A8','#E8E1D5','#7FA7C9'];
const PANTS=['#5C6A8C','#6E5B4B','#3E3E48','#8C7D6A','#A7C7A0','#D9C3A5','#4A5A70'];
const SKINS=[['#F4D3B7','#E0B597'],['#EBC3A0','#D3A284'],['#F1C9A5','#DBAA86'],['#D9A882','#BF8C68'],['#C99270','#AD7757'],['#FBE0CA','#E8C2A6']];
function newPal(kind){
  kind=kind||pick(['adult','adult','student','elder']);
  const f=Math.random()<.5;const [sk,skS]=pick(SKINS);
  let hs=f?pick(['long','bob','bun','pony','curly','long']):pick(['short','short','curly','short']);
  let hair=pick(HAIRC);if(kind==='elder'){hair=pick(['#A8A8A8','#C9C9C9','#8E8E8E']);if(!f&&Math.random()<.4)hs='bald';if(f)hs=pick(['bun','bob','curly'])}
  let acc=null;const r=Math.random();
  if(kind==='elder')acc=pick(['glasses','sunhat',null,'glasses']);
  else if(kind==='kid')acc=pick(['cap',null,'bow',null]);
  else acc=r<.18?'glasses':r<.28?'cap':r<.36?'beanie':r<.44?'sunhat':null;
  if(kind==='kid'&&f&&acc==='cap')acc='bow';
  return {kind,style:f?'f':'m',hs,acc,expr:pick(['smile','smile','grin','calm','sleepy','wow']),blush:Math.random()<.6,
    hair,hairHi:mix(hair,'#FFFFFF',.25),skin:sk,skinSh:skS,tee:pick(TEES),teeSh:'#00000018',pants:pick(PANTS),shoe:pick(['#F4F2EE','#8C6A55','#3E3E48','#E8A9B4']),num:'',
    sc:kind==='kid'?.72:1,pack:kind==='student'||(kind==='kid'&&Math.random()<.5)};
}
const DOG_NAMES=['뭉치','초코','보리','콩이','두부','망고','설기'];
function park(zone){if(zone==='north')return [pick([rnd(3,23),rnd(37,56)])*TILE,rnd(8.4,20.5)*TILE];if(zone==='yard')return [rnd(3.4,16.4)*TILE,rnd(29,31.8)*TILE];if(zone==='lake')return Math.random()<.25?[rnd(40.3,42.7)*TILE,rnd(26.5,30.6)*TILE]:[rnd(18.5,56)*TILE,rnd(24.3,25.8)*TILE];return zone==='park'?[rnd(10.5,23.4)*TILE,rnd(13.8,22.5)*TILE]:[rnd(34.4,37.8)*TILE,rnd(17.8,22.5)*TILE]}
function mkWalker(kind,zone,extra){const [x,y]=zone==='lane'?[rnd(3,54)*TILE,pick([9.4,10.2,11.1])*TILE]:park(zone);
  const w={kind,zone,x,y,tx:x,ty:y,wait:rnd(0,2),pal:newPal(kind==='dog'||kind==='couple'?'adult':kind),offer:null,walk:0,dir:'down',name:pick(NAMES),...extra};
  if(zone==='lane')w.tx=Math.random()<.5?2*TILE:55*TILE;
  if(kind==='dog')w.dog={x:x-10,y:y,dir:'down',walk:0,col:pick(['#E8D2B4','#8A5A3C','#F4F2EE','#3E3A3A','#D9A36A']),name:pick(DOG_NAMES)};
  return w}
function makeWalkers(){
  const kk=mkWalker('dog','park',{name:'민지'});kk.dog.name='까미';kk.dog.col='#2A2626';kk.kkami=true;
  makeCat();
  const W=[kk,mkWalker('adult','park'),mkWalker('dog','park'),mkWalker('kid','park',{school:true}),mkWalker('elder','park'),mkWalker('student','lane'),mkWalker('adult','lane'),mkWalker('dog','right'),mkWalker('kid','right',{school:true}),mkWalker('kid','park',{school:true}),
    mkWalker('adult','north'),mkWalker('couple','north'),mkWalker('elder','north'),mkWalker('dog','north'),
    mkWalker('adult','lake',{eve:true}),mkWalker('elder','lake',{eve:true}),mkWalker('dog','lake',{eve:true}),mkWalker('student','lake',{eve:true})];
  const lead=mkWalker('couple','park');const mate=mkWalker('couple','park',{follow:lead,name:pick(NAMES)});mate.x=lead.x+12;mate.y=lead.y;lead.mate=mate;mate.pal.style=lead.pal.style==='f'?'m':'f';mate.pal.hs=mate.pal.style==='f'?pick(['long','bob','pony']):'short';
  W.push(lead,mate);S.walkers=W;
}
function newGame(mode){mode='duo';
  S.mode=mode;S.active=0;S.day=1;S.money=80000;S.speed=1;S.nextId=1;S.up={};S.edit=false;
  S.bags=[Array(BAGN).fill(null),Array(BAGN).fill(null)];S.bench=[];S.works={craft:{orderId:null,stems:[]},craft2:{orderId:null,stems:[]}};S.tomorrow=[];S.shopName='우리 둘의 꽃집';
  S.decor=DECOR_BASE.shop.map(d=>({...d}));S.closet={};S.outfit=[{},{}];S.tut=S.tutPending!=null?S.tutPending:-1;S.tutPending=null;S.tutDone=0;
  makeStations();
  const base=TEMPLATES.filter(t=>!t.req.rose&&!t.req.hydrangea);S.orders=[genOrder(base[0],195,1),genOrder(base[1],300,1),genOrder(base[2],420,1)];S.style='natural';
  startDaySetup();
}
function bump(){S.rev=(S.rev||0)+1}
function startDaySetup(){
  S.urgentAt=S.day>=2?[rnd(60,240)].concat(Math.random()<.5?[rnd(280,420)]:[]):[];
  S.t=0;S.customers=[];S.paused=false;S.puffs=[];S.drops=[];S.edit=false;S.nextWalkin=rnd(15,30);S.reserveAt=[rnd(60,200),rnd(250,420)];
  S.chars=[makeChar(0),makeChar(1)];
  S.stats={rev:[],spent:0,invest:0,waste:0,display:0,displayN:0,cancel:[]};
  ensureBags();rollPrices();planCalls();makeWalkers();BG_CACHE={};S._as=0;if(S.day>1)S.tut=-1;
  buildControls();showIntro();
}

/* ---------- save ---------- */
function saveGame(mid){
  try{
    const slots={};S.stList.forEach(s=>{if(s.slots&&s.slots.some(Boolean))slots[s.id]=s.slots});
    const pos={};S.stList.forEach(s=>{if(s.area==='shop')pos[s.id]=[s.x,s.y]});
    const plots={};S.stList.forEach(s=>{if(s.plot)plots[s.id]=s.plot});
    const spr={};S.stList.forEach(s=>{if(s.on)spr[s.id]=1});
    const data={v:SAVE_VER,style:S.style,mid:mid||null,spr,closet:S.closet,outfit:S.outfit,day:S.day,money:S.money,nextId:S.nextId,up:S.up,bags:S.bags,bench:S.bench,works:S.works,slots,pos,plots,decor:S.decor,orders:S.orders,shopName:S.shopName};
    localStorage.setItem(SAVE_KEY,JSON.stringify(data));
  }catch(e){}
}
const SAVE_VER=6;
/* 앞으로 저장 형식이 바뀌면 여기서 예전 저장을 새 형식으로 옮겨요 (v4 → v5 → …) */
const MIGRATE={4:d=>{d.v=5;d.style=d.style||null;if(d.up)delete d.up.rug;return d},5:d=>{d.v=6;if(!d.style||d.style==='vintage')d.style='natural';return d}};
function migrateSave(d){if(!d||typeof d.v!=='number'||d.v<4)return null;while(d.v<SAVE_VER){const f=MIGRATE[d.v];if(!f)return null;d=f(d)}return d}
function loadSave(){try{const d=migrateSave(JSON.parse(localStorage.getItem(SAVE_KEY)||'null'));dropSurnames(d,0);return d}catch(e){return null}}
function continueGame(mode){mode='duo';
  const d=loadSave();if(!d){newGame(mode);return}
  S.mode=mode;S.active=0;S.speed=1;
  Object.assign(S,{style:d.style||null,closet:d.closet||{},outfit:d.outfit||[{},{}],day:d.day,money:d.money,nextId:d.nextId,up:d.up||{},bags:d.bags,bench:d.bench,works:d.works,orders:d.orders,tomorrow:[],shopName:d.shopName||'우리 둘의 꽃집',decor:d.decor||DECOR_BASE.shop.map(x=>({...x}))});
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
  const p=base*2.8*(.35+.65*clamp((f-25)/65,0,1))*(b.wrapped?1.15:1)*(1+.06*(types-1))*(b.card?1.05:1);
  return Math.max(0,Math.round(p/100)*100);
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
  if(S.edit&&c.area==='shop'){if(c.carry)return ['내려놓기',spotOK(c.carry,...placeSpot(c,c.carry))];return furnAt(c)?['가구 들기',true]:['가구 배치 중',false]}
  if(c.rest)return ['일어나기',true];
  const s=targetOf(c);if(!s)return ['행동',false];
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
function placeSpot(c,f){const [dx,dy]=DIRV[c.dir];const cx=c.x+dx*(10+f.w*8),cy=c.y-3+dy*(10+f.h*8);return [Math.round(cx/TILE-f.w/2),Math.round(cy/TILE-f.h/2)]}
function spotOK(f,x,y){
  const W=AREAS.shop.w;if(x<1||x+f.w>W-1||y<2||y+f.h>10)return false;
  if(x<10&&x+f.w>8&&y+f.h>9)return false;
  for(const o of movables()){if(o===f||f.walk||o.walk)continue;if(x<o.x+o.w&&x+f.w>o.x&&y<o.y+o.h&&y+f.h>o.y)return false}
  for(const c of S.chars){if(c.area!=='shop')continue;const tx=c.x/TILE,ty=(c.y-2)/TILE;if(tx>x-.3&&tx<x+f.w+.3&&ty>y&&ty<y+f.h+.2)return false}
  return true;
}
function findSpot(f){const W=AREAS.shop.w;for(const y of [7,6,8,3,9]){for(let x=2;x+f.w<W-1;x++){if(spotOK(f,x,y))return [x,y]}}return null}
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
  if(c.modal){if(c.modal.type==='talk'){if(talkSkip(i))return;closeModal(i);sfx('close')}return}
  const now=performance.now();if(now-(c.lastAct||0)<300)return;c.lastAct=now;sfx('tap');
  if(c.waterT>0)return;
  if(S.edit&&c.area==='shop'){
    if(c.carry){const f=c.carry,[x,y]=placeSpot(c,f);if(!spotOK(f,x,y)){toast(i,'여기에는 놓을 수 없어요');return}f.x=x;f.y=y;f.carried=false;c.carry=null;BG_CACHE={};return}
    const f=furnAt(c);if(!f){toast(i,'옮길 가구 앞에 서 주세요');return}
    if(S.chars.some(o=>o.carry===f))return;
    f.carried=true;c.carry=f;return;
  }
  if(c.rest){standUp(c);return}
  const s=targetOf(c);
  if(!s){toast(i,'가까이에 쓸 수 있는 게 없어요');return}
  switch(s.type){
    case 'npc':{const w=s.walker;w.talking=true;w.dir=faceTo(w,c);
      if(w.offer)openModal(i,{type:'booking',walker:w});
      else if(w.kind==='reserve'&&w.state==='wait'){w.offer=reserveOffer(w);openModal(i,{type:'booking',walker:w})}
      else openModal(i,{type:'talk',walker:w,line:talkLine(w)});return}
    case 'seedstall':
      if(S.t>=MARKET_CLOSE){toast(i,'꽃시장은 정오에 문을 닫았어요');return}
      openModal(i,{type:'seedbuy',flower:'tulip',qty:1});return;
    case 'plot':{
      const P=s.plot;
      if(!P){const ks=c.bag.map((it,k)=>it&&it.kind==='seed'?k:-1).filter(k=>k>=0);
        if(!ks.length){toast(i,'꽃시장 모종 가게에서 모종을 사 오세요');return}
        if(new Set(ks.map(k=>c.bag[k].t)).size>1){openModal(i,{type:'plant',st:s.id});return}
        plantSeed(c,s,ks[0]);return}
      if(plotReady(P)){if(!bagAdd(i,{kind:'bunch',t:P.t,stems:Array.from({length:5},()=>stem(P.t,SEED_PRICE[P.t])),trim:false})){toast(i,'가방이 꽉 찼어요');return}s.plot=null;toast(i,`${FL[P.t].name} 5송이를 수확했어요`);return}
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
      c.rest={bench:s,seat,start:S.t};c.x=(s.x+.5+seat)*TILE;c.y=(s.y+1)*TILE-3;if(s.up){c.dir='up';c.face=c.ang=Math.PI;c.y=(s.y+1)*TILE-1}else{c.dir='down';c.face=c.ang=0}return;
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
function plantSeed(c,s,k){const it=c.bag[k];s.plot={t:it.t,prog:0,watered:false,wetAt:0};if(S.stList.some(sp=>sp.on&&sprCover(sp).includes(s)))s.plot.watered=true;it.n--;if(it.n<=0)c.bag[k]=null;toast(c.i,`${FL[it.t].name} 모종을 심었어요. 물을 주면 빨리 자라요`)}
function waterOne(c,s){sfx('water');s.plot.watered=true;s.plot.wetAt=performance.now()+250;c.waterT=.9;c.vx=c.vy=0}
function sprCover(sp){return S.stList.filter(p=>p.type==='plot'&&p.x<sp.x+2&&p.x+p.w>sp.x-1&&p.y<sp.y+2&&p.y+p.h>sp.y-1)}
function sprinkle(sp){if(S.phase==='play')sfx('water');bump();let n=0;sprCover(sp).forEach(p=>{if(p.plot&&!plotReady(p.plot)){p.plot.watered=true;p.plot.wetAt=performance.now()+300;n++}});sp.sprayAt=performance.now();return n}
function waterAll(c){
  const list=S.stList.filter(s=>s.type==='plot'&&s.plot&&!s.plot.watered&&!plotReady(s.plot)).sort((a,b)=>Math.hypot(a.x*TILE-c.x,a.y*TILE-c.y)-Math.hypot(b.x*TILE-c.x,b.y*TILE-c.y));
  const now=performance.now();list.forEach((s,k)=>{s.plot.watered=true;s.plot.wetAt=now+k*140});
  c.waterT=Math.min(3,1.2+list.length*.14);c.vx=c.vy=0;toast(c.i,`텃밭 ${list.length}칸에 물을 줬어요`);
}
function trimModal(c,k){const t=c.bag[k].t;return {type:'trim',step:'leaf',slot:k,leaves:LEAVES[t]||3,removed:[],angle:10,adir:1}}
function wrapModal(c,k){const b=c.bag[k],o=orderById(b.orderId);return {type:'wrap',step:'edit',slot:k,paper:o?o.paper:'pink',ribbon:'white',card:false}}
function standUp(c){
  const r=c.rest;if(!r)return;const b=r.bench;const mins=S.t-r.start;
  c.rest=null;c.x=(b.x+.5+r.seat)*TILE;c.y=(b.y+1)*TILE+10;
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
  const hyd=.9+.1*avg(b.stems.map(s=>s.hyd)),cut=.95+.05*avg(b.stems.map(s=>s.cut)),wrapF=b.paper===o.paper?1.05:.95;
  const q=clamp(comp*fresh*hyd*cut*wrapF,.2,1.1);
  return {q,stars:q>=.93?3:q>=.72?2:1};
}
function settleOrder(cu,o,b,how){
  const ev=evaluate(b,o);
  const late=Math.max(0,S.t-o.time),disc=o.urgent?0:Math.min(.5,.1*Math.floor(late/30));bump();
  const tip=b.card?Math.round(o.price*.05):0;
  const price=Math.round((o.price*ev.q*(1-disc)+tip)/100)*100;
  S.money+=price;o.status='delivered';sfx('coin');
  const lines=['정말 예뻐요! 꼭 다시 올게요.','마음에 들어요, 고마워요.','음… 생각했던 거랑은 조금 달라요.'];
  const rec={o,price,disc,ev,b,tip,how,line:lines[3-ev.stars]};
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
function newCust(kind,extra){return {kind,area:'shop',x:DOOR_IN[0],y:DOOR_IN[1],state:'move',walk:0,pal:newPal(),dir:'up',name:pick(NAMES),path:[],...extra}}
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
function navGrid(area){let N=NAV[area];const now=performance.now();if(N&&now-N.t<15000)return N;
  const A=AREAS[area],w=A.w,h=A.h,g=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let b=0;for(const oy of [1.5,8,14.5]){for(const ox of [2,8,14])if(solid(area,x*TILE+ox,y*TILE+oy)){b=1;break}if(b)break}g[y*w+x]=b}
  N=NAV[area]={t:now,w,h,g};return N}
function navFree(N,x,y){return x>=0&&y>=0&&x<N.w&&y<N.h&&!N.g[y*N.w+x]}
function navNear(N,x,y){if(navFree(N,x,y))return [x,y];for(let r=1;r<8;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(navFree(N,x+dx,y+dy))return [x+dx,y+dy]}return null}
function navSight(N,x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/5);for(let k=1;k<n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n;for(const [ox,oy] of [[-4,-2],[4,-2],[-4,2],[4,2]])if(!navFree(N,Math.floor((x+ox)/TILE),Math.floor((y+oy)/TILE)))return false}return true}
function navRoute(area,sx,sy,tx,ty){
  const N=navGrid(area);const s=navNear(N,Math.floor(sx/TILE),Math.floor(sy/TILE)),e0=[Math.floor(tx/TILE),Math.floor(ty/TILE)],e=navNear(N,e0[0],e0[1]);if(!s||!e)return null;
  const end=(e[0]===e0[0]&&e[1]===e0[1]&&!solid(area,tx,ty-1)&&!solid(area,tx,ty-4)&&!solid(area,tx-4,ty-2)&&!solid(area,tx+4,ty-2))?[tx,ty]:[(e[0]+.5)*TILE,(e[1]+.5)*TILE];
  if(navSight(N,sx,sy,end[0],end[1]))return {pts:[],end};
  const W=N.w,si=s[1]*W+s[0],ei=e[1]*W+e[0],gs=new Float32Array(W*N.h).fill(1e9),from=new Int32Array(W*N.h).fill(-1),open=[si],inO=new Uint8Array(W*N.h);gs[si]=0;inO[si]=1;
  const hh=i=>{const x=i%W,y=(i/W)|0,dx=Math.abs(x-e[0]),dy=Math.abs(y-e[1]);return Math.max(dx,dy)+.41*Math.min(dx,dy)};let it=0;
  while(open.length&&it++<4000){let bi=0,bf=1e9;for(let j=0;j<open.length;j++){const f=gs[open[j]]+hh(open[j]);if(f<bf){bf=f;bi=j}}const cur=open[bi];open.splice(bi,1);inO[cur]=0;if(cur===ei)break;
    const cx=cur%W,cy=(cur/W)|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;if(!navFree(N,nx,ny))continue;if(dx&&dy&&(!navFree(N,cx+dx,cy)||!navFree(N,cx,cy+dy)))continue;
      const ni=ny*W+nx,ng=gs[cur]+(dx&&dy?1.414:1);if(ng<gs[ni]){gs[ni]=ng;from[ni]=cur;if(!inO[ni]){open.push(ni);inO[ni]=1}}}}
  if(from[ei]<0&&ei!==si)return null;
  const tiles=[];for(let i=ei;i!==si&&i>=0;i=from[i])tiles.push(i);tiles.reverse();
  const raw=tiles.map(i=>[(i%W+.5)*TILE,(((i/W)|0)+.5)*TILE]);raw[raw.length-1]=end;
  const pts=[];let px=sx,py=sy,k=0;while(k<raw.length){let j=raw.length-1;while(j>k&&!navSight(N,px,py,raw[j][0],raw[j][1]))j--;pts.push(raw[j]);[px,py]=raw[j];k=j+1}
  pts.pop();return {pts,end}}
function stepToward(k,dt,spd){
  if(!k.path||!k.path.length)return true;
  if(k._nav){const tg=k.path[0],key=tg[0].toFixed(1)+','+tg[1].toFixed(1);
    if(k._rk!==key){const r=navRoute(k._nav,k.x,k.y,tg[0],tg[1]);if(!r){k.path.shift();return !k.path.length}k._route=r.pts;k.path[0]=r.end;k._rk=r.end[0].toFixed(1)+','+r.end[1].toFixed(1)}
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
  S.offers.forEach((t,n)=>{if(t!==null&&S.t>=t){S.offers[n]=null;const w=S.walkers.find(w=>w.zone!=='lane'&&!w.offer&&!w.follow&&w.kind!=='kid');if(w)w.offer={tpl:pick(TEMPLATES),time:pick(SLOTS),name:w.name,until:S.t+70}}});
  S.walkers.forEach(w=>{
    w._nav=w.follow||w.zone==='yard'?null:(w.zone==='north'?'north':'town');
    if(w._nav&&!w._chk&&!w.hidden){w._chk=1;const N=navGrid(w._nav),tx=Math.floor(w.x/TILE),ty=Math.floor(w.y/TILE);if(!navFree(N,tx,ty)){const q=navNear(N,tx,ty);if(q){w.x=(q[0]+.5)*TILE;w.y=(q[1]+.5)*TILE;w.tx=w.x;w.ty=w.y;if(w.dog){w.dog.x=w.x-8;w.dog.y=w.y}}}}
    const px=w.x,py=w.y,dpx=w.dog?w.dog.x:0,dpy=w.dog?w.dog.y:0;
    walkerStep(w,dt);
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
  if(w.kind==='cat')return pick(CAT_LINES);
  if(w.kkami)return pick(['우리 까미 새까맣죠? 밤에는 눈만 반짝여요.','까미야, 인사해야지! 꼬리 흔드는 거 보여요?','까미는 토토랑 친해요. 가끔 같이 낮잠 자요.','까미는 이 동네 산책 대장이에요.']);
  const tb=S.t<180?'좋은 아침이에요! ':S.t>480?'벌써 해가 지네요. ':'';
  const o0=S.outfit[0]||{},o1=S.outfit[1]||{},extra=[];
  if(o1.glasses)extra.push('안경 쓴 언니 정말 멋있어요!');if(o0.hat)extra.push('모자 쓴 오빠, 잘 어울려요!');if(o1.pin)extra.push('머리핀 예쁘네요. 어디서 샀어요?');
  if(o0.apron||o1.apron)extra.push('앞치마 입으니까 진짜 꽃집 사장님 같아요.');
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
    const sp=99*(S.t<c.boostUntil?1.3:1);
    c.vx=mag>.12?ix/Math.max(mag,1e-6)*mag*sp:0;c.vy=mag>.12?iy/Math.max(mag,1e-6)*mag*sp:0;
    c.moving=Math.hypot(c.vx,c.vy)>6;
    if(mag>.12){c.dir=OCT[((Math.round(Math.atan2(iy,ix)/(Math.PI/4))%8)+8)%8];c.face=Math.atan2(ix,iy)}
    turnToward(c,dtReal);
    moveChar(c,c.vx*dtReal,c.vy*dtReal);
    if(c.moving){c.anim+=dtReal*9;c.stepT=(c.stepT||0)+dtReal;if(c.stepT>.24){c.stepT=0;S.puffs.push({area:c.area,x:c.x+rnd(-2,2),y:c.y,t:0})}}
    for(const d of DOORS){
      if(d.area!==c.area)continue;
      if(c.x>=d.x0&&c.x<=d.x1&&(d.edge==='bottom'?c.y>=d.y:c.y<=d.y)){
        if(c.carry){c.y+=d.edge==='bottom'?-4:4;toast(c.i,'가구를 먼저 내려놓으세요');break}
        const o=S.chars[1-c.i];
        c.area=d.to;sfx('door');c.x=d.sx+(o.area===d.to&&Math.abs(o.x-d.sx)<10&&Math.abs(o.y-d.sy)<10?12:0);c.y=d.sy;c.dir=d.dir;c.face=c.ang=DIR_ANG[d.dir];c.fade=1;c.vx=c.vy=0;break;
      }
    }
  });
  const [a,b]=S.chars;
  if(a.area===b.area&&!a.rest&&!b.rest){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<11){const p=(11-d)/2||.5,nx=d?dx/d:1,ny=d?dy/d:0;moveChar(a,-nx*p,-ny*p);moveChar(b,nx*p,ny*p)}}
  S.puffs.forEach(q=>q.t+=dtReal);S.puffs=S.puffs.filter(q=>q.t<.5);
  updateCustomers(dt);updateWalkers(dt);
  S.calls.forEach(k=>{if(k.state==='wait'&&S.t>=k.t)k.state='ring';if(k.state==='ring'&&S.t>k.t+k.dur)k.state='missed'});
  if(ringingCall()&&performance.now()-AU.lastRing>1600&&S.chars.some(c=>c.area==='shop')){AU.lastRing=performance.now();sfx('ring')}
  if(Math.floor(S.t/30)!==S._as){S._as=Math.floor(S.t/30);saveMid()}
  tutUpdate(dtReal);
  if(S.t>=DAY_LEN)endDay();
}

/* ---------- input ---------- */
const JOY=[{x:0,y:0},{x:0,y:0}];
const KEYS=new Set();
addEventListener('keydown',e=>{
  if(VOLKEYS.includes(e.keyCode))return;
  {const h=bindHit(e.keyCode);if(h){e.preventDefault();const now=performance.now(),rep=e.repeat||(KB_HELD[e.keyCode]&&now-KB_HELD[e.keyCode]<140);KB_HELD[e.keyCode]=now;doBind(h.p,h.fn,rep);return}}
  const actKey=e.keyCode===13||e.keyCode===33||e.keyCode===34;
  {const nav={37:'left',38:'up',39:'right',40:'down'}[e.keyCode];const ctx=navContext(S.active);if(ctx&&(nav||actKey)){e.preventDefault();if(e.repeat&&actKey)return;if(nav)navMove(ctx,nav);else navPress(ctx);return}}
  if((e.keyCode===33||e.keyCode===34)&&S.phase==='play'){e.preventDefault();if(!e.repeat)doAction(S.active);return}
  if(e.keyCode===461||e.key==='Escape'||e.key==='GoBack'||e.key==='BrowserBack'){e.preventDefault();const ctx=navContext(S.active);if(ctx)navBack(ctx);else if(S.phase==='play')togglePause();return}
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
/* ---------- bouquet illustration (SVG) ---------- */
let GID=0;
function bouquetSVG(stems,o={}){
  const P=o.paper?PAPERS[o.paper]:null,RB=o.ribbon?RIBBONS[o.ribbon]:null;
  const id='b'+(++GID);const bx=100,by=o.wrapped?182:172;
  const rr=seedRand(11+stems.length*37+(stems[0]?stems[0].t.length*7:0));
  const defs=[];let back='',stemS='',leaves='',gypS='',heads='',front='',extra='';
  if(!stems.length){
    return `<svg viewBox="0 0 200 236" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="빈 꽃다발"><circle cx="100" cy="104" r="46" fill="none" stroke="#E2D5CC" stroke-dasharray="4 5" stroke-width="1.5"/><text x="100" y="108" text-anchor="middle" font-size="11" fill="#9A8FA8" font-family="inherit">꽃을 더해 보세요</text></svg>`;
  }
  const mains=stems.filter(s=>s.t!=='gyp'),fills=stems.filter(s=>s.t==='gyp');
  const pos=[];const n=mains.length;
  mains.forEach((s,k)=>{
    const r=n===1?0:Math.sqrt((k+.5)/n);const th=k*2.39996+.6;
    pos.push({s,hx:bx+r*46*Math.cos(th)+(rr()-.5)*4,hy:102+r*26*Math.sin(th)-(1-r)*10+(rr()-.5)*4});
  });
  const m=fills.length;
  fills.forEach((s,j)=>{
    const th=(j/Math.max(1,m))*Math.PI*2+.3+rr()*.5;const r=.55+rr()*.45;
    pos.push({s,hx:bx+r*56*Math.cos(th),hy:Math.min(124,98+r*30*Math.sin(th)-6)});
  });
  if(P){
    const gp=id+'p';
    defs.push(`<linearGradient id="${gp}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.l}"/><stop offset="1" stop-color="${P.c}"/></linearGradient>`);
    let top='';for(let i=0;i<=12;i++){const x=16+i*(168/12);const yy=74-34*Math.sin(Math.PI*i/12)+(i%2?7:-3);top+=` L${x.toFixed(1)},${yy.toFixed(1)}`}
    back=`<path d="M${bx},${by+12}${top} Z" fill="url(#${gp})" stroke="${P.d}" stroke-width=".8" stroke-linejoin="round"/>`+
      `<path d="M${bx},${by+10} L58,50 M${bx},${by+10} L142,50 M${bx},${by+10} L100,40" stroke="${P.d}" stroke-width=".6" opacity=".45"/>`;
  }
  pos.forEach(({s,hx,hy},k)=>{
    const w=wither(s.f);const sx=bx+(hx-bx)*.1;
    const col=mix('#6E9A5A','#9C8B62',w);
    const ex=sx+(hx-bx)*.1;
    stemS+=`<path d="M${hx.toFixed(1)},${(hy+3).toFixed(1)} Q${((hx+bx)/2).toFixed(1)},${((hy+by)/2+10).toFixed(1)} ${sx.toFixed(1)},${by} L${ex.toFixed(1)},228" stroke="${col}" stroke-width="${s.t==='gyp'?1.2:2.1}" fill="none" stroke-linecap="round"/>`;
    stemS+=`<ellipse cx="${ex.toFixed(1)}" cy="228.5" rx="1.4" ry=".7" fill="${mix('#B9D39A','#C9B98E',w)}"/>`;
    if(s.t==='tulip'&&k%2===0){
      const dir=hx>=bx?1:-1;const lx=bx+(hx-bx)*.4,ly=by-26;
      leaves+=`<path d="M${lx.toFixed(1)},${ly} Q${(lx+dir*3).toFixed(1)},${ly-20} ${(lx+dir*22).toFixed(1)},${ly-30} Q${(lx+dir*18).toFixed(1)},${ly-8} ${lx.toFixed(1)},${ly}Z" fill="${mix('#88B271','#A8A070',w)}" stroke="${mix('#6E9A5A','#8E7F58',w)}" stroke-width=".6"/>`;
    }
  });
  if(stems.length>=3){const nL=Math.min(9,3+Math.floor(stems.length/2));for(let k=0;k<nL;k++){const th=Math.PI*(1.05+k/(nL-1)*.9)+(rr()-.5)*.2;const lx=bx+Math.cos(th)*50,ly=112+Math.sin(th)*34;const ang=th*180/Math.PI+90;const avgW=wither(avg(stems.map(q=>q.f)));leaves+=`<ellipse cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="5" ry="13" transform="rotate(${ang.toFixed(0)} ${lx.toFixed(1)} ${ly.toFixed(1)})" fill="${mix(k%2?'#8DB874':'#7AA864','#A8A070',avgW)}" stroke="${mix('#6E9A5A','#8E7F58',avgW)}" stroke-width=".5"/>`}}
  pos.sort((a,b)=>a.hy-b.hy).forEach(({s,hx,hy})=>{
    const w=wither(s.f);const dir=hx>=bx?1:-1;
    if(s.t==='gyp')gypS+=gypSVG(hx,hy,w,rr);
    else if(s.t==='tulip')heads+=tulipSVG(hx,hy+w*6,17,(hx-bx)*.35+dir*w*38,w);
    else if(s.t==='rose'||s.t==='hydrangea')heads+=fHeadSVG(s.t,hx,hy+w*6,s.t==='rose'?19:27,w,false);
    else heads+=freesiaSVG(hx,hy,(hx>=bx?-.35:-2.8)+(rr()-.5)*.6,w);
  });
  function tulipSVG(x,y,s,rot,w){
    const base=mix('#E26684','#A88270',w),tip=mix('#FCC9D6','#DCC7AE',w),edge=mix('#C9506F','#8E6D5E',w);
    const gid=id+'t'+(++GID);
    defs.push(`<linearGradient id="${gid}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${base}"/><stop offset="1" stop-color="${tip}"/></linearGradient>`);
    const f=v=>(v*s).toFixed(1);
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})">`+
      `<path d="M${f(-.5)},${f(-.1)} C${f(-.62)},${f(-.9)} ${f(-.15)},${f(-1.2)} 0,${f(-1.02)} C${f(.15)},${f(-1.2)} ${f(.62)},${f(-.9)} ${f(.5)},${f(-.1)} C${f(.35)},${f(.42)} ${f(-.35)},${f(.42)} ${f(-.5)},${f(-.1)}Z" fill="url(#${gid})" stroke="${edge}" stroke-width=".6"/>`+
      `<path d="M${f(-.34)},0 C${f(-.42)},${f(-.75)} ${f(-.05)},${f(-1.05)} ${f(.06)},${f(-.98)} C${f(.3)},${f(-.72)} ${f(.36)},${f(-.2)} ${f(.22)},${f(.25)} C0,${f(.36)} ${f(-.25)},${f(.28)} ${f(-.34)},0Z" fill="url(#${gid})" stroke="${edge}" stroke-width=".5"/>`+
      `<path d="M${f(-.08)},${f(-.2)} C${f(-.1)},${f(-.55)} ${f(-.02)},${f(-.8)} ${f(.05)},${f(-.85)}" stroke="${tip}" stroke-width="1" fill="none" opacity=".75"/></g>`;
  }
  function freesiaSVG(x,y,ang,w){
    const pet=mix('#F7D24E','#C9AE78',w),pet2=mix('#FFF1A6','#E3D2AE',w),thr=mix('#F0A33A','#A98A5E',w),bud=mix('#DCD77E','#B9A77C',w),ln=mix('#D9B23A','#9C8660',w);
    const L=30;const ex=x+Math.cos(ang)*L,ey=y-10+w*14;const cx=x+Math.cos(ang)*L*.45,cy=y-13+w*8;
    let out=`<path d="M${x.toFixed(1)},${(y+3).toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" stroke="${mix('#7FA86A','#A08F66',w)}" stroke-width="1.3" fill="none"/>`;
    [.08,.3,.52,.72,.9].forEach((t,i)=>{
      const px=(1-t)*(1-t)*x+2*(1-t)*t*cx+t*t*ex,py=(1-t)*(1-t)*(y+3)+2*(1-t)*t*cy+t*t*ey;
      if(i<2){
        const sz=i===0?6.6:5.4;let p='';
        for(let k=0;k<6;k++)p+=`<ellipse cx="0" cy="${(-sz*.55).toFixed(1)}" rx="${(sz*.42).toFixed(1)}" ry="${(sz*.62).toFixed(1)}" transform="rotate(${k*60+15})" fill="${k%2?pet:pet2}" stroke="${ln}" stroke-width=".35"/>`;
        out+=`<g transform="translate(${px.toFixed(1)} ${(py-3).toFixed(1)})">${p}<circle r="${(sz*.3).toFixed(1)}" fill="${thr}"/></g>`;
      }else{
        const sz=4.4-(i-2)*.9;const tx=2*(1-t)*(cx-x)+2*t*(ex-cx),ty=2*(1-t)*(cy-y)+2*t*(ey-cy);const a=Math.atan2(ty,tx)*180/Math.PI+90;
        out+=`<ellipse cx="${px.toFixed(1)}" cy="${(py-2).toFixed(1)}" rx="${(sz*.5).toFixed(1)}" ry="${sz.toFixed(1)}" transform="rotate(${a.toFixed(0)} ${px.toFixed(1)} ${(py-2).toFixed(1)})" fill="${bud}" stroke="${ln}" stroke-width=".3"/>`;
      }
    });
    return out;
  }
  function gypSVG(x,y,w,r){
    const flo=mix('#FFFFFF','#E3D6BE',w),st=mix('#E2DCD0','#C7B79A',w),stem=mix('#93B283','#A6966F',w),ctr=mix('#EFE3B8','#CDB88E',w);
    let out='';
    for(let b=0;b<8;b++){
      const a=-Math.PI/2+(r()-.5)*2.8;const L=6+r()*12;const ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L+w*4;
      out+=`<path d="M${x.toFixed(1)},${y.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}" stroke="${stem}" stroke-width=".6"/>`;
      for(let k=0;k<4;k++){
        const dx=(r()-.5)*8,dy=(r()-.5)*7,rad=1.6+r()*1.1,cx=(ex+dx).toFixed(1),cy=(ey+dy).toFixed(1);
        out+=`<circle cx="${cx}" cy="${cy}" r="${rad.toFixed(2)}" fill="${flo}" stroke="${st}" stroke-width=".35"/>`;
        if(r()<.35)out+=`<circle cx="${cx}" cy="${cy}" r=".45" fill="${ctr}"/>`;
      }
    }
    return out;
  }
  if(P){
    const inner=mix(P.l,'#FFFFFF',.3);
    front=`<path d="M52,122 Q100,106 148,122 L104,198 L96,198Z" fill="${inner}" stroke="${P.d}" stroke-width=".6"/>`+
      `<path d="M18,108 Q56,98 82,124 L112,186 L100,208 Z" fill="${P.c}" stroke="${P.d}" stroke-width=".8" stroke-linejoin="round"/>`+
      `<path d="M182,108 Q144,98 118,124 L88,186 L100,208 Z" fill="${mix(P.c,P.d,.28)}" stroke="${P.d}" stroke-width=".8" stroke-linejoin="round"/>`+
      `<path d="M18,108 Q56,98 82,124" stroke="${P.l}" stroke-width="2" fill="none" opacity=".9"/>`+
      `<path d="M182,108 Q144,98 118,124" stroke="${P.l}" stroke-width="2" fill="none" opacity=".7"/>`+
      `<path d="M40,112 L96,196 M160,112 L104,196" stroke="${P.d}" stroke-width=".5" opacity=".4"/>`;
  }
  if(o.wrapped&&RB){
    extra+=`<path d="M100,194 C93,202 89,214 84,224 L90,222 L92,228 C96,214 98,204 101,196Z" fill="${RB.c}" stroke="${RB.d}" stroke-width=".7"/>`+
      `<path d="M100,194 C107,202 111,214 116,224 L110,222 L108,228 C104,214 102,204 99,196Z" fill="${RB.c}" stroke="${RB.d}" stroke-width=".7"/>`+
      `<ellipse cx="88" cy="190" rx="11" ry="6" transform="rotate(-18 88 190)" fill="${RB.c}" stroke="${RB.d}" stroke-width=".8"/>`+
      `<ellipse cx="112" cy="190" rx="11" ry="6" transform="rotate(18 112 190)" fill="${RB.c}" stroke="${RB.d}" stroke-width=".8"/>`+
      `<circle cx="100" cy="192" r="3.8" fill="${RB.d}"/>`;
  }else if(o.tied){
    extra+=`<path d="M${bx-8},${by-1} L${bx+8},${by+1} M${bx-8},${by+3} L${bx+8},${by+5}" stroke="#A8845C" stroke-width="1.8" stroke-linecap="round"/>`+
      `<path d="M${bx+6},${by+2} q7,-5 9,2 q-6,4 -9,-2 q2,8 -3,12" stroke="#A8845C" stroke-width="1.2" fill="none"/>`;
  }
  if(o.card){
    extra+=`<g transform="translate(134 146) rotate(10)"><rect width="24" height="17" rx="1.5" fill="#FFFFFF" stroke="#D8CFC2" stroke-width=".7"/><path d="M12,6.8 c-1.2,-2 -4,-.6 -2.4,1.6 L12,11 L14.4,8.4 c1.6,-2.2 -1.2,-3.6 -2.4,-1.6Z" fill="#EE8FA7"/><path d="M5,14 h14" stroke="#D8CFC2" stroke-width=".6"/></g>`;
  }
  return `<svg viewBox="0 0 200 236" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="꽃다발 그림"><defs>${defs.join('')}</defs>${back}${stemS}${leaves}${gypS}${heads}${front}${extra}</svg>`;
}

function trimSVG(t,m){
  const col=t==='tulip'?'#EE8FA7':t==='freesia'?'#F5CF4E':t==='rose'?'#D9435E':t==='hydrangea'?'#9DB8E8':'#FFFFFF';
  const leaves=[];
  for(let k=0;k<m.leaves;k++){
    if(m.removed.includes(k))continue;
    const side=k%2?1:-1,y=150-k*18;
    if(t==='gyp')leaves.push(`<g data-a="leaf" data-v="${k}" style="cursor:pointer"><rect x="${side>0?100:52}" y="${y-14}" width="48" height="28" fill="transparent"/><path d="M100,${y} L${100+side*34},${y-14}" stroke="#93B283" stroke-width="2"/><circle cx="${100+side*36}" cy="${y-16}" r="3" fill="#fff" stroke="#DDD5C8"/><circle cx="${100+side*31}" cy="${y-19}" r="2.5" fill="#fff" stroke="#DDD5C8"/></g>`);
    else leaves.push(`<g data-a="leaf" data-v="${k}" style="cursor:pointer"><rect x="${side>0?100:50}" y="${y-22}" width="50" height="30" fill="transparent"/><path d="M100,${y} Q${100+side*10},${y-24} ${100+side*44},${y-20} Q${100+side*26},${y-2} 100,${y}Z" fill="#88B271" stroke="#6E9A5A"/></g>`);
  }
  const headSvg=t==='tulip'?`<path d="M86,44 C84,24 96,16 100,20 C104,16 116,24 114,44 C110,54 90,54 86,44Z" fill="${col}" stroke="#C9506F"/>`:
    t==='freesia'?`<circle cx="100" cy="36" r="10" fill="${col}" stroke="#D9B23A"/><circle cx="100" cy="36" r="3" fill="#F0A33A"/><ellipse cx="118" cy="30" rx="4" ry="8" transform="rotate(50 118 30)" fill="#DCD77E"/>`:
    `<g fill="#fff" stroke="#DDD5C8">${[[92,34],[100,28],[108,34],[96,42],[104,42],[88,26],[112,26]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.2"/>`).join('')}</g>`;
  return `<svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="150" width="200" height="30" fill="#EFE2D2"/><path d="M100,48 L100,176" stroke="#6E9A5A" stroke-width="4" stroke-linecap="round"/>${headSvg}${leaves.join('')}</svg>`;
}
function cutSVG(m){
  const z=S.up.scissors?14:8;
  const a=m.cutQ!=null?m.finalA:m.angle;
  const rad=a*Math.PI/180;const x2=100+Math.cos(rad)*60,y2=120-Math.sin(rad)*60,x1=100-Math.cos(rad)*60,y1=120+Math.sin(rad)*60;
  return `<svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" aria-label="자르는 각도">
    <path d="M100,120 L${100+Math.cos((45-z)*Math.PI/180)*70},${120-Math.sin((45-z)*Math.PI/180)*70} A70,70 0 0 1 ${100+Math.cos((45+z)*Math.PI/180)*70},${120-Math.sin((45+z)*Math.PI/180)*70}Z" fill="#CFE8C2" opacity=".9"/>
    <rect x="92" y="10" width="16" height="150" rx="6" fill="#7FA86A"/><rect x="95" y="10" width="4" height="150" fill="#9CC486"/>
    <line id="cutline" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#4A3F5C" stroke-width="2.5" stroke-dasharray="5 4"/>
  </svg>`;
}
function startCutAnim(i){
  const c=S.chars[i],m=c.modal;if(!m||m.step!=='cut')return;
  const tick=()=>{
    if(c.modal!==m||m.step!=='cut')return;
    m.angle+=m.adir*1.6;if(m.angle>80){m.angle=80;m.adir=-1}if(m.angle<10){m.angle=10;m.adir=1}
    const ln=modalEl(i).querySelector('#cutline');
    if(ln){const rad=m.angle*Math.PI/180;ln.setAttribute('x1',100-Math.cos(rad)*60);ln.setAttribute('y1',120+Math.sin(rad)*60);ln.setAttribute('x2',100+Math.cos(rad)*60);ln.setAttribute('y2',120-Math.sin(rad)*60)}
    m.raf=requestAnimationFrame(tick);
  };
  m.raf=requestAnimationFrame(tick);
}


/* ---------- modals ---------- */
function modalEl(i){return $('#modal'+i)}
function openModal(i,m){
  const c=S.chars[i];c.modal=m;c.vx=c.vy=0;
  const el=modalEl(i);el.dataset.t=performance.now();
  el.className='modal open '+(S.mode==='solo'?'center':(i===0?'left':'right'))+(m.type==='talk'?' talk':'');
  renderModal(i);updateControlVisibility();if(m.type!=='talk')sfx('open');
}
function closeModal(i){
  const c=S.chars[i];if(!c)return;const m=c.modal;if(!m)return;
  if(m.type==='phone'&&m.call.state==='talk')m.call.state='missed';
  if(m.type==='booking'||m.type==='talk')m.walker.talking=false;
  if((m.type==='trim'||m.type==='talk')&&m.raf)cancelAnimationFrame(m.raf);
  c.modal=null;const el=modalEl(i);el.className='modal';el.innerHTML='';hideTip();
  updateControlVisibility();
}
function head(i,title,closeLabel){return `<div class="mh"><span class="who p${i}">${PAL[i].name}</span><h2>${title}</h2><button class="btn small" data-a="close">${closeLabel||'닫기'}</button></div><!--B-->`}
function wrapBody(h){const inv=h.indexOf('class="inv"')>=0;const open=`<div class="mbody${inv?' noscroll':' scr'}">`;return (h.indexOf('<!--B-->')>=0?h.replace('<!--B-->',open):open+h)+'</div>'}
function reqCheck(o,stems){
  const cnt={};stems.forEach(s=>cnt[s.t]=(cnt[s.t]||0)+1);
  return `<div class="check">${Object.keys(o.req).map(t=>{const h=cnt[t]||0,r=o.req[t];return `<span class="${h>=r?'ok':''}">${FL[t].name} ${h}/${r}</span>`}).join('')}${Object.keys(cnt).filter(t=>!o.req[t]).map(t=>`<span>${FL[t].name} ${cnt[t]} (요청 외)</span>`).join('')}</div>`;
}
function paperKeys(){return Object.keys(PAPERS).filter(k=>!PAPERS[k].extra||S.up.papers2)}
function ribbonKeys(){return Object.keys(RIBBONS).filter(k=>!RIBBONS[k].extra||S.up.ribbons2)}
function offerHTML(f){
  const t=f.tpl;
  return `<p class="req">“${esc(t.text)}”<br>${esc(t.title)} · ${won(t.price)}</p>${reqCheck({req:t.req},[])}
    <div class="row">${f.today?`<button class="btn primary" data-a="accept" data-v="today">오늘 ${clock(f.today)}에 받기</button>`:''}<button class="btn ${f.today?'soft':'primary'}" data-a="accept" data-v="tmr">내일 ${clock(f.time)}에 받기</button><button class="btn" data-a="decline">정중히 거절</button></div>`;
}
function seedSVG(t){return `<svg viewBox="0 0 40 40"><path d="M11 22h18l-2.5 14h-13z" fill="#6B5A52"/><rect x="10" y="20" width="20" height="4" rx="1.5" fill="#857268"/><path d="M20 21V12" stroke="#6E9A5A" stroke-width="2"/><ellipse cx="15.5" cy="13" rx="5" ry="2.4" fill="#8DBB6A" transform="rotate(-25 15.5 13)"/><ellipse cx="24.5" cy="11" rx="5" ry="2.4" fill="#A6CF8C" transform="rotate(25 24.5 11)"/><circle cx="20" cy="8.5" r="2.6" fill="${FL[t].dot==='#FFFFFF'?'#F1EEE8':FL[t].dot}"/></svg>`}
/* inventory grid */
const ICON_CACHE=new Map();
function itemIcon(it){
  if(it.kind==='seed')return seedSVG(it.t);if(it.kind==='sprinkler')return sprSVG();
  const f=avg(it.stems.map(s=>s.f)),wet=avg(it.stems.map(s=>s.hyd||0))>=.99;
  const key=it.kind+'|'+(it.t||'')+'|'+(it.kind==='bouquet'?it.stems.map(s=>s.t[0]+Math.round(s.f/10)).join(''):it.stems.length+'/'+Math.round(f/10))+'|'+(it.wrapped?it.paper+it.ribbon:'')+(it.trim?'t':'')+(wet?'w':'');
  if(ICON_CACHE.has(key))return ICON_CACHE.get(key);
  const svg=it.kind==='bouquet'?(it.wrapped?bouquetSVG(it.stems,{paper:it.paper,ribbon:it.ribbon,wrapped:true}):bouquetSVG(it.stems,{tied:true})):bunchSVG(it);
  if(ICON_CACHE.size>300)ICON_CACHE.clear();ICON_CACHE.set(key,svg);return svg;
}
function freshWord2(f){return f>=85?'아주 싱싱해요':f>=60?'싱싱해요':f>=35?'조금 시들었어요':f>=WILT?'많이 시들었어요':'시들어 버렸어요'}
function itemLabel(it){
  if(!it)return '빈 칸';
  if(it.kind==='seed')return `${FL[it.t].name} 모종 ${it.n}개`;if(it.kind==='sprinkler')return `스프링클러 ${it.n}개`;
  const f=avg(it.stems.map(s=>s.f)),fw=it.dried?'':' · '+freshWord2(f);
  if(it.kind==='bouquet'){if(wiltedB(it))return '시든 꽃다발 · 휴지통에 버려 주세요';const o=orderById(it.orderId);return `${o?o.name+'님 '+o.title:'자유 꽃다발'}${it.wrapped?'':' (포장 전)'}${fw}${!it.orderId&&it.wrapped?' · 약 '+won(freePrice(it)):''}`}
  const wet=!it.dried&&avg(it.stems.map(s=>s.hyd||0))>=.99;
  return `${wet?'물을 머금은 ':''}${it.dried?'드라이 ':it.trim?'손질된 ':''}${FL[it.t].name} ${it.stems.length}송이${fw}`;
}
function cellHTML(it,act,k,o={}){
  if(!it)return `<button class="cell empty" data-a="${act}" data-v="${k}" data-tip="빈 칸" aria-label="빈 칸"></button>`;
  const lab=esc(itemLabel(it));
  if(it.kind==='seed'||it.kind==='sprinkler')return `<button class="cell${o.sel?' sel':''}${o.dim?' dim':''}" data-a="${act}" data-v="${k}" data-tip="${lab}" aria-label="${lab}">${itemIcon(it)}<span class="cnt">${it.n}</span></button>`;
  const price=o.price&&it.kind==='bouquet'&&!it.orderId&&!wiltedB(it)?`<span class="ptag">${Math.round(freePrice(it)/1000)}천원</span>`:'';
  return `<button class="cell${it.dried?' dried':''}${o.sel?' sel':''}${o.dim?' dim':''}${it.kind==='bouquet'&&wiltedB(it)?' wilted':''}" data-a="${act}" data-v="${k}" data-tip="${lab}" aria-label="${lab}">${itemIcon(it)}${it.kind==='bunch'?`<span class="cnt">${it.stems.length}</span>`:''}${o.prog!=null?`<span class="bar"><b style="width:${Math.round(o.prog*100)}%"></b></span>`:''}${price}</button>`;
}
function returnStem(i,s){const b=S.bags[i].find(x=>x&&x.kind==='bunch'&&x.t===s.t&&x.trim&&!x.dried&&x.stems.length<10);if(b){b.stems.push(s);return}if(!bagAdd(i,{kind:'bunch',t:s.t,stems:[s],trim:true}))S.bench.push(s)}
// 꽃 구성만 비교(송이 수가 정확히 같으면 1)
function compMatch(stems,o){const cnt={};stems.forEach(s=>cnt[s.t]=(cnt[s.t]||0)+1);const ks=new Set([...Object.keys(cnt),...Object.keys(o.req)]);for(const t of ks)if((cnt[t]||0)!==(o.req[t]||0))return 0;return 1}
// 자유 꽃다발로 묶었지만 어떤 예약과 꽃이 똑같으면 그 예약으로 자동 연결(급한 손님 → 이른 시간 순)
function bestOrderFor(stems,taken){const c=S.orders.filter(o=>o.status==='pending'&&!(taken||[]).includes(o.id)&&compMatch(stems,o));c.sort((a,b)=>(b.urgent?1:0)-(a.urgent?1:0)||a.time-b.time);return c[0]||null}
// 예약이 없거나 이미 끝난(취소·전달) 예약의 꽃다발은 자유 꽃다발처럼 쓸 수 있음
function isFreeBq(b){if(!b.orderId)return true;const o=orderById(b.orderId);return !o||o.status==='cancelled'||o.status==='delivered'}
function findGift(i,cu){
  const pools=[S.st.counter.slots,S.bags[i]];
  for(const arr of pools){const k=arr.findIndex(b=>b&&b.kind==='bouquet'&&b.wrapped&&b.orderId===cu.orderId);if(k>=0)return {arr,k,it:arr[k]}}
  const o=orderById(cu.orderId);let best=null,bq=-1;
  for(const arr of pools)arr.forEach((b,k)=>{if(!(b&&b.kind==='bouquet'&&b.wrapped&&isFreeBq(b)&&!wiltedB(b)))return;const q=o?evaluate(b,o).q:0;if(q>bq){bq=q;best={arr,k,it:b}}});
  return best;
}
function drawPreview(i){const cv=$('#wprev'+i);if(!cv)return;const g=cv.getContext('2d');g.clearRect(0,0,220,220);g.save();g.scale(4.2,4.2);const p=palOf(S.chars[i]);drawChar(g,26,48,p,0,0,false,false);g.restore()}
function two(i,bag,right){return `<div class="inv"><div class="invL scr">${bag}</div><div class="invR scr">${right}</div></div>`}
function bagGrid(i,act,dimFn,selK){
  return `<div class="lbl">${PAL[i].name} 가방 (${S.bags[i].length-bagFree(i)}/${S.bags[i].length})</div><div class="grid">${S.bags[i].map((it,k)=>cellHTML(it,act,k,{dim:it&&dimFn?dimFn(it):false,sel:k===selK})).join('')}</div>`;
}
const BOX={counter:['카운터','꽃다발을 보관해요.'],storage:['꽃 냉장고','사 온 꽃을 보관해요. 칸을 누르면 가방으로, 가방 칸을 누르면 냉장고로 옮겨요.'],shelf:['선반','무엇이든 잠깐 올려둘 수 있어요.'],bucket:['물올림 통','다듬은 꽃을 꽂아 두면 물을 머금고 오래가요.'],dryer:['드라이플라워 건조대','한 시간 걸어두면 시들지 않는 드라이플라워가 돼요.'],pickup:['자동 픽업대','포장한 꽃다발을 올려두면 손님이 알아서 찾아가요.'],display:['진열대','진열한 꽃은 지나가던 손님이 사 가요.']};
function boxProg(st,it){if(st.type==='dryer')return it.dried?1:clamp((it.dryT||0)/DRY_MIN,0,1);return null}
function renderModal(i){
  const c=S.chars[i],m=c.modal,el=modalEl(i);if(!m)return;m._rev=S.rev;hideTip();
  let h='';
  if(m.type==='box'){
    const st=S.st[m.st];const [title,desc]=BOX[st.type];
    h=head(i,title)+`<p class="req">${desc}${st.type==='storage'&&S.up.fridge?' 업그레이드 덕분에 천천히 시들어요.':''}</p>
      ${two(i,bagGrid(i,'in',it=>!!accepts(st,it)),`<div class="lbl">${title}</div><div class="grid">${st.slots.map((it,k)=>cellHTML(it,'out',k,{prog:it?boxProg(st,it):null,price:st.type==='display'})).join('')}</div>`)}${st.type==='display'?'<p class="note" style="text-align:left">자유 꽃다발 가격은 신선도에 따라 자동으로 정해져요. 시든 꽃다발은 팔리지 않으니 휴지통에 버려 주세요.</p>':''}`;
  }
  else if(m.type==='buy'){
    const f=FL[m.flower],p=S.prices[m.flower],tot=p*m.qty,free=bagFree(i);
    h=head(i,`${f.name} 사기`)+`<div class="mg"><div class="preview">${bouquetSVG(Array.from({length:5},()=>stem(m.flower,p)),{tied:true})}</div><div>
      <p class="req">오늘 시세는 한 단(5송이)에 <b>${won(p)}</b>이에요. 한 단이 가방 한 칸을 차지해요. (빈 칸 ${free}개)</p>
      <div class="row" style="align-items:center"><button class="btn" data-a="qty" data-v="-1" aria-label="한 단 줄이기">−</button><span class="big">${m.qty}단 (${m.qty*5}송이)</span><button class="btn" data-a="qty" data-v="1" aria-label="한 단 늘리기">+</button></div>
      <div class="stat"><span>합계</span><span>${won(tot)}</span></div><div class="stat"><span>남는 돈</span><span>${won(S.money-tot)}</span></div>
      <div class="row"><button class="btn primary" data-a="buy" ${S.money<tot||free<m.qty?'disabled':''}>${free<m.qty?'가방 칸이 모자라요':m.qty+'단 사기'}</button></div></div></div>`;
  }
  else if(m.type==='supply'){
    const cat=m.cat||'equip',imgOnly=['style','deco','interior'].includes(cat);
    const pit=m.pending&&SHOP_ITEMS.find(x=>x.id===m.pending);
    h=head(i,'용품상점')+(pit?`<div class="confirm"><div class="sart">${itemArt(pit)}</div><div class="grow"><b style="font-weight:normal">${pit.name}</b>${pit.part?` <small>· ${pit.part}</small>`:''}<br>${won(pit.price)}에 살까요?</div><button class="btn primary small" data-a="buyok">살게요</button><button class="btn small" data-a="buyno">아니요</button></div>`:'')+`<p class="req">가진 돈 ${won(S.money)}</p><div class="row tabs">${SHOP_CATS.map(([k,n])=>`<button class="btn small ${k===cat?'soft':''}" data-a="cat" data-v="${k}">${n}</button>`).join('')}</div><div class="shopgrid${imgOnly?' img':''}">`+SHOP_ITEMS.filter(it=>it.cat===cat).map(it=>{
      const cur=it.styleSet&&S.style===it.styleSet,have=cur||((!!S.up[it.id]||!!S.closet[it.id])&&!it.repeat),lock=it.need&&!S.up[it.need];
      return `<div class="scard${have?' own':''}"><div class="sart">${itemArt(it)}</div>${it.part?`<div class="spart">${it.part}</div>`:''}${imgOnly?'':`<div class="sname">${it.name}</div><div class="sdesc">${it.desc}${lock?' (앞 단계를 먼저 사야 해요)':''}</div>`}${have?`<span class="sbad">${cur?'사용 중':'보유'}</span>`:`<button class="btn small soft" data-a="shopbuy" data-v="${it.id}" data-tip="${esc(it.name)} · ${won(it.price)}" aria-label="${esc(it.name)} ${won(it.price)}" ${lock||S.money<it.price?'disabled':''}>${won(it.price)}</button>`}</div>`}).join('')+'</div>';
  }
  else if(m.type==='seedbuy'){
    const t=m.flower,p=SEED_PRICE[t],tot=p*m.qty,has=c.bag.some(it=>it&&it.kind==='seed'&&it.t===t)||bagFree(i)>0;
    h=head(i,'모종 가게')+`<div class="row">${TYPES.map(k=>`<button class="btn small ${k===t?'soft':''}" data-a="sflower" data-v="${k}">${FL[k].name}</button>`).join('')}</div>
      <div class="mg"><div class="preview" style="aspect-ratio:1">${seedSVG(t)}</div><div>
      <p class="req">${FL[t].name} 모종은 하나에 ${won(p)}이에요. 텃밭에 심으면 ${GROW[t]}일 뒤 5송이를 수확해요. 물을 주면 빨리 자라고, 안 주면 아주 천천히 자라요. 수확 전에는 시들지 않아요.</p>
      <div class="row" style="align-items:center"><button class="btn" data-a="qty" data-v="-1" aria-label="하나 줄이기">−</button><span class="big">${m.qty}개</span><button class="btn" data-a="qty" data-v="1" aria-label="하나 늘리기">+</button></div>
      <div class="stat"><span>합계</span><span>${won(tot)}</span></div>
      <div class="row"><button class="btn primary" data-a="sbuy" ${S.money<tot||!has?'disabled':''}>${has?m.qty+'개 사기':'가방 칸이 모자라요'}</button></div></div></div>`;
  }
  else if(m.type==='plant'){
    h=head(i,'모종 심기')+two(i,bagGrid(i,'pl',it=>it.kind!=='seed'),`<p class="req">왼쪽 가방에서 심을 모종을 골라 주세요.</p>`);
  }
  else if(m.type==='talk'){
    const w=m.walker;if(w.kind==='cat'){w.hearts=performance.now()}const who=w.kind==='cat'?'마을 고양이':w.kind==='kid'?'어린이':w.kind==='elder'?'어르신':w.kind==='couple'?'산책 나온 부부':w.kind==='dog'?'강아지와 산책 중':w.kind==='student'?'학생':'';
    const NC={kid:['#F5C451','#D9A631'],student:['#8DBBE8','#6C9CCB'],elder:['#B7A2DA','#9681BE'],cat:['#A9A7B0','#86848D'],dog:['#E5A77A','#C98A5D'],couple:['#F4A6B8','#D8849A']}[w.kind]||['#F4A6B8','#D8849A'];
    if(m.shown==null)m.shown=0;const L=m.line||'';
    h=`<div class="talkbox" data-a="close" role="button" tabindex="0" aria-label="${esc(w.name)}: ${esc(L)}"><span class="talkwho who p${i}">${PAL[i].name}</span><span class="talkname" style="--nc:${NC[0]};--ncd:${NC[1]}">${esc(w.name)}${who?`<small>${who}</small>`:''}</span><div class="talkface"><canvas id="tface${i}" width="160" height="160"></canvas></div><div class="talktext"><span class="tshown">${esc(L.slice(0,m.shown))}</span><span class="ghost">${esc(L.slice(m.shown))}</span></div><span class="talkhint">행동 버튼</span><i class="talknext"${m.shown<L.length?' style="opacity:0"':''}></i></div>`;
  }
  else if(m.type==='wardrobe'){
    const o=S.outfit[i];const cat=m.cat;const C=STYLE[cat];
    const opts=[[null,cat==='tee'?'기본 등번호 티':'없음']].concat(C.opts.filter(([v])=>S.closet['st_'+cat+'_'+v]).map(([v,n])=>[v,n]));
    const locked=C.opts.filter(([v])=>!S.closet['st_'+cat+'_'+v]).length;
    h=head(i,'옷장')+`<div class="row tabs">${Object.entries(STYLE).map(([k,v])=>`<button class="btn small ${k===cat?'soft':''}" data-a="wcat" data-v="${k}">${v.label}</button>`).join('')}</div>
      <div class="mg"><div class="preview" style="aspect-ratio:1"><canvas id="wprev${i}" width="220" height="220" style="width:100%;height:100%"></canvas></div><div>
      <div class="list">${opts.map(([v,n])=>`<div class="li"><span class="grow">${n}</span><button class="btn small ${(o[cat]||null)===v?'primary':''}" data-a="wear" data-v="${v===null?'':v}">${(o[cat]||null)===v?'입는 중':'입기'}</button></div>`).join('')}</div>
      ${locked?`<p class="note" style="text-align:left">용품상점 '옷·치장'에서 ${locked}가지를 더 살 수 있어요.</p>`:''}</div></div>`;
  }
  else if(m.type==='rename'){
    h=head(i,'새 간판','나중에')+`<p class="req">가게 이름을 정해 주세요. (12자까지)</p><div class="row"><input id="nameIn${i}" class="namein" maxlength="12" value="${esc(S.shopName)}" aria-label="가게 이름"></div><div class="row"><button class="btn primary" data-a="setname">간판 달기</button></div>`;
  }
  else if(m.type==='trim'){
    if(m.step==='pick'){h=head(i,'꽃 다듬기')+two(i,bagGrid(i,'tpick',it=>!(it.kind==='bunch'&&!it.trim&&!it.dried)),`<p class="req">왼쪽 가방에서 다듬을 꽃 묶음을 골라 주세요.</p>`)}
    else{const t=c.bag[m.slot].t,name=FL[t].name;
      if(m.step==='leaf'){const label=t==='gyp'?'곁가지 정리':'아랫잎 떼기';h=head(i,`${name} 다듬기`)+`<div class="stage"><p class="req" style="margin:0">${label}: 물에 잠길 ${t==='gyp'?'곁가지를':'잎을'} 떼어 주세요</p>${trimSVG(t,m)}<div class="row" style="justify-content:center"><button class="btn primary" data-a="leafnext">잎 떼기 (${m.removed.length}/${m.leaves})</button></div></div>`}
      else h=head(i,`${name} 다듬기`)+`<p class="req" style="margin:0 0 0.38rem">사선 자르기: 선이 초록 구간에 올 때 그림이나 버튼을 누르세요</p><div class="cutwrap"><div class="cutsvg" data-a="cut">${cutSVG(m)}</div><button class="btn primary cutbtn" data-a="cut">자르기</button></div>`;
    }
  }
  else if(m.type==='craft'){
    const W=S.works[m.st];const taken=Object.entries(S.works).filter(([k])=>k!==m.st).map(([,w])=>w.orderId);
    const pend=S.orders.filter(o=>o.status==='pending'&&!taken.includes(o.id));const o=orderById(W.orderId);
    h=head(i,'꽃다발 만들기','작업대에 두고 닫기')+two(i,bagGrid(i,'cin',it=>!((it.kind==='bunch'&&it.trim&&!it.dried)||(it.kind==='bouquet'&&!it.wrapped)))+`<p class="note" style="text-align:left">손질된 꽃을 누를 때마다 한 송이씩 꽃다발에 들어가요.</p>`,
      `<div class="row"><button class="btn small ${!W.orderId?'soft':''}" data-a="order" data-v="0">자유 꽃다발</button>${pend.map(p=>`<button class="btn small ${p.id===W.orderId?'soft':''}" data-a="order" data-v="${p.id}">${p.urgent?'<b class="utag">급해요</b> ':''}${esc(p.name)}님 ${clock(p.time)} ${reqChips(p.req)}</button>`).join('')}</div>
      <div class="mg"><div class="preview">${bouquetSVG(W.stems,{tied:false})}</div><div>
      ${o?`<p class="req">${esc(o.name)}님: “${esc(o.text)}”<br>포장 희망: ${PAPERS[o.paper].name}</p>${reqCheck(o,W.stems)}`:`<p class="req">마음대로 만들어 진열대에 올려두면 손님이 사 가요.${W.stems.length?` 지금 포장하면 약 ${won(freePrice({kind:'bouquet',stems:W.stems,wrapped:true}))}`:''}</p>`}
      <div class="row"><button class="btn" data-a="undo" ${W.stems.length?'':'disabled'}>한 송이 빼기</button><button class="btn" data-a="clear" ${W.stems.length?'':'disabled'}>모두 빼기</button><button class="btn primary" data-a="tie" ${W.stems.length?'':'disabled'}>끈으로 묶기</button></div>
      <div class="row">${S.bench.length?`<button class="btn small" data-a="benchback">작업대에 남은 꽃 ${S.bench.length}송이 가방에 담기</button>`:''}</div></div></div>`);
  }
  else if(m.type==='wrap'){
    if(m.step==='pick'){h=head(i,'포장대')+two(i,bagGrid(i,'wpick',it=>!(it.kind==='bouquet'&&!it.wrapped)),`<p class="req">왼쪽 가방에서 포장할 꽃다발을 골라 주세요.</p>`)}
    else{const b=c.bag[m.slot],o=orderById(b.orderId);
      if(m.step==='edit'){
        h=head(i,'포장하기')+`<div class="mg"><div class="preview">${bouquetSVG(b.stems,{paper:m.paper,ribbon:m.ribbon,card:m.card,wrapped:true})}</div><div>
          <p class="req">${o?esc(o.name)+'님은 '+PAPERS[o.paper].name+' 포장을 원해요.':''}</p>
          <div class="lbl">포장지</div><div class="row">${paperKeys().map(k=>`<button class="sw ${m.paper===k?'on':''}" style="background:${PAPERS[k].c}" data-a="paper" data-v="${k}" aria-label="${PAPERS[k].name} 포장지"></button>`).join('')}</div>
          <div class="lbl">리본</div><div class="row">${ribbonKeys().map(k=>`<button class="sw ${m.ribbon===k?'on':''}" style="background:${RIBBONS[k].c}" data-a="ribbon" data-v="${k}" aria-label="${RIBBONS[k].name} 리본"></button>`).join('')}</div>
          <div class="row"><button class="btn ${m.card?'soft':''}" data-a="card">${m.card?'메시지 카드 넣음':'메시지 카드 넣기'}</button></div>
          <div class="row"><button class="btn primary" data-a="wrap">포장 완성</button></div></div></div>`;
      }else{
        h=head(i,'완성했어요','확인')+`<div class="mg"><div class="preview">${bouquetSVG(b.stems,{paper:b.paper,ribbon:b.ribbon,card:b.card,wrapped:true})}</div><div>
          <p class="big">${o?esc(o.name)+'님께 드릴 '+esc(o.title):'완성한 꽃다발'}</p><p class="req">${o?clock(o.time)+'에 찾으러 와요. ':''}가방에 넣어 두었어요. 카운터에서 건네주거나${S.up.pickup?' 자동 픽업대에 올려두거나':''} 선반에 잠시 올려둘 수 있어요.</p>
          <button class="btn primary" data-a="close">확인</button></div></div>`;
      }
    }
  }
  else if(m.type==='counter'){
    if(m.rec){const r=m.rec;
      h=head(i,'전달했어요','확인')+`<div class="mg"><div class="preview">${bouquetSVG(r.b.stems,{paper:r.b.paper,ribbon:r.b.ribbon,card:r.b.card,wrapped:true})}</div><div>
        <p class="big">“${r.line}”</p><p class="stars" aria-label="별 ${r.ev.stars}개">${'★'.repeat(r.ev.stars)}${'☆'.repeat(3-r.ev.stars)}</p>
        <div class="stat"><span>기본 가격</span><span>${won(r.o.price)}</span></div><div class="stat"><span>완성도</span><span>${Math.round(r.ev.q*100)}%</span></div>
        ${r.disc?`<div class="stat"><span>늦어서 할인</span><span>−${Math.round(r.disc*100)}%</span></div>`:''}${r.tip?`<div class="stat"><span>카드 감동 팁</span><span>+${won(r.tip)}</span></div>`:''}
        <div class="stat total"><span>받은 돈</span><span>${won(r.price)}</span></div><div class="row"><button class="btn primary" data-a="close">확인</button></div></div></div>`;
    }else{
      const st=S.st.counter;const waiting=S.customers.filter(k=>k.kind==='order'&&k.state==='wait');
      const rsv=S.customers.filter(k=>k.kind==='reserve'&&k.state==='wait');
      const right=`<div class="lbl">카운터 보관함</div><div class="grid">${st.slots.map((it,k)=>cellHTML(it,'out',k,{})).join('')}</div>`+
        (waiting.length?`<div class="lbl">찾으러 온 손님</div><div class="list">${waiting.map(k=>{const o=orderById(k.orderId);const b=findGift(i,k);const mine=b&&b.it.orderId===o.id;const st=b?evaluate(b.it,o).stars:0;
          return `<div class="li${o.urgent?' urg':''}"><span class="grow">${o.urgent?'<b class="utag">급해요</b> ':''}${esc(o.name)}님 · ${clock(o.time)} ${reqChips(o.req)}<br><small>${b?(mine?`${esc(o.name)}님 꽃다발이 준비됐어요`:`예약 꽃다발이 없어 자유 꽃다발을 드려요 · 예상 ${'★'.repeat(st)}${'☆'.repeat(3-st)}`):'이 손님 꽃다발이 아직 없어요'}</small></span><button class="btn small ${mine?'primary':b?'soft':''}" data-a="give" data-v="${S.customers.indexOf(k)}" ${b?'':'disabled'}>${b?'건네기':'꽃다발 없음'}</button></div>`}).join('')}</div>`:'<p class="note" style="text-align:left">아직 찾으러 온 손님이 없어요.</p>')+
        (rsv.length?`<div class="list">${rsv.map(k=>`<div class="li"><span class="grow">${esc(k.name)}님이 예약하고 싶어 해요</span><button class="btn small soft" data-a="rsv" data-v="${S.customers.indexOf(k)}">예약 상담</button></div>`).join('')}</div>`:'');
      h=head(i,'카운터')+two(i,bagGrid(i,'in',null),right)+'<p class="note" style="text-align:left">꽃다발을 카운터에 보관해 두었다가 손님이 오면 바로 건넬 수 있어요.</p>';
    }
  }
  else if(m.type==='trash'){
    const it=c.bag[m.sel];
    h=head(i,'휴지통')+two(i,bagGrid(i,'tsel',null,m.sel),`<p class="req">왼쪽 가방에서 버릴 것을 골라 주세요.</p><div class="row"><button class="btn primary" data-a="throw" ${it?'':'disabled'}>${it?esc(itemName(it))+' 버리기':'버리기'}</button></div>`);
  }
  else if(m.type==='phone'){h=head(i,'내일 예약 문의','끊기')+`<p class="big">따르릉… ${esc(m.call.offer.name)}님의 전화예요.</p>`+offerHTML(m.call.offer)}
  else if(m.type==='booking'){const inShop=m.walker.kind==='reserve';h=head(i,inShop?'현장 예약':'산책하던 손님','인사하고 헤어지기')+`<p class="big">${esc(m.walker.offer.name)}님: ${inShop?'꽃다발 예약하고 싶어요!':'마침 꽃집 가려던 참이었어요!'}</p>`+offerHTML(m.walker.offer)}
  else if(m.type==='board'){
    const st={pending:'준비 전',crafted:'묶음',delivered:'전달 완료',cancelled:'취소'};
    h=head(i,'예약 보드')+`<div class="lbl">오늘</div><div class="list">${S.orders.map(o=>`<div class="li"><span class="t">${clock(o.time)}</span><span class="grow">${esc(o.title)} · ${esc(o.name)}${o.urgent?' <b style="color:#C65C79;font-weight:normal">급해요</b>':''}<br>${reqChips(o.req)} <small>· ${PAPERS[o.paper].name} 포장</small></span><span>${st[o.status]}</span></div>`).join('')}</div>
      <div class="lbl">내일</div>${S.tomorrow.length?`<div class="list">${S.tomorrow.map(o=>`<div class="li"><span class="t">${clock(o.time)}</span><span class="grow">${esc(o.title)} · ${esc(o.name)}<br>${reqChips(o.req)}</span></div>`).join('')}</div>`:'<p class="note">아직 내일 예약이 없어요. 전화를 받거나 공원에서 손님을 만나 보세요.</p>'}`;
  }
  const sy=(el.querySelector('.invR')||{}).scrollTop||0,sl=(el.querySelector('.invL')||{}).scrollTop||0,sm=(el.querySelector('.mbody')||{}).scrollTop||0;
  el.innerHTML=wrapBody(h);
  const r=el.querySelector('.invR'),l=el.querySelector('.invL'),mb=el.querySelector('.mbody');if(r)r.scrollTop=sy;if(l)l.scrollTop=sl;if(mb&&!r)mb.scrollTop=sm;
  gpRefocus(i);
  if(m.type==='trim'&&m.step==='cut')startCutAnim(i);
  if(m.type==='wardrobe')drawPreview(i);
  if(m.type==='talk'){drawTalkFace(i,m.walker);startTalkType(i)}
}
/* 대화창: 얼굴 그림 + 한 글자씩 나오기 + 작은 말소리 */
function drawTalkFace(i,w){const cv=$('#tface'+i);if(!cv)return;const g=cv.getContext('2d');g.clearRect(0,0,160,160);g.save();
  try{if(w.kind==='cat'){g.translate(76,128);g.scale(12,12);drawCat(g,{x:0,y:0,dir:'down',state:'sit',walk:0,mv:false})}
    else if(w.kind==='dog'&&!w.pal){g.translate(80,112);g.scale(8,8);drawDog(g,{x:0,y:0,dir:'down',walk:0,col:w.col||'#E8D2B4'})}
    else if(w.pal){let top=-31;try{const t=document.createElement('canvas');t.width=t.height=80;const q=t.getContext('2d');q.translate(40,70);drawChar(q,0,0,w.pal,0,0,false,false);const d=q.getImageData(0,0,80,80).data;search:for(let y=0;y<80;y++)for(let x=0;x<80;x++)if(d[(y*80+x)*4+3]>60){top=y-70;break search}}catch(e){}
      g.translate(80,22-top*7.6);g.scale(7.6,7.6);drawChar(g,0,0,w.pal,0,0,false,false)}}catch(e){}
  g.restore()}
function talkTypeStep(i,m){const el=modalEl(i);const L=m.line||'';const a=el.querySelector('.tshown'),b=el.querySelector('.talktext .ghost'),n=el.querySelector('.talknext');
  if(a)a.textContent=L.slice(0,m.shown);if(b)b.textContent=L.slice(m.shown);if(n)n.style.opacity=m.shown>=L.length?1:0}
function startTalkType(i){const c=S.chars[i],m=c.modal;if(!m||m.type!=='talk')return;const L=m.line||'';if(m.raf)cancelAnimationFrame(m.raf);if(m.shown>=L.length)return;
  let last=performance.now(),acc=0,k=0;const step=now=>{if(c.modal!==m)return;acc+=(now-last)/1000*34;last=now;
    const add=Math.floor(acc);if(add>0){acc-=add;const was=m.shown;m.shown=Math.min(L.length,m.shown+add);for(let j=was;j<m.shown;j++){if(L[j]!==' '&&(k++%2===0))sfx('blip')}talkTypeStep(i,m)}
    if(m.shown<L.length)m.raf=requestAnimationFrame(step);else m.raf=null};
  m.raf=requestAnimationFrame(step)}
function talkSkip(i){const m=S.chars[i].modal;if(m&&m.type==='talk'&&(m.shown||0)<(m.line||'').length){m.shown=m.line.length;if(m.raf)cancelAnimationFrame(m.raf);m.raf=null;talkTypeStep(i,m);return true}return false}
function onModalClick(i,e){
  const t=e.target.closest('[data-a]');if(!t)return;
  if(performance.now()-(+modalEl(i).dataset.t||0)<450)return;
  const a=t.dataset.a,v=t.dataset.v;const c=S.chars[i],m=c.modal;if(!m)return;const bag=S.bags[i];
  if(a==='close'){if(m.type==='talk'&&talkSkip(i))return;closeModal(i);return}
  if(m.type==='box'){
    const st=S.st[m.st];
    if(a==='out'){const it=st.slots[+v];if(!it)return;if(!bagAdd(i,it)){toast(i,'가방이 꽉 찼어요');return}st.slots[+v]=null;renderModal(i)}
    if(a==='in'){const it=bag[+v];if(!it)return;const why=accepts(st,it);if(why){toast(i,why);return}
      if(st.type==='dryer')it.dryT=0;
      const k=freeIdx(st.slots);if(k<0){toast(i,'빈 칸이 없어요');return}st.slots[k]=it;bag[+v]=null;renderModal(i)}
  }
  else if(m.type==='buy'){
    if(a==='qty'){m.qty=clamp(m.qty+(+v),1,6);renderModal(i)}
    if(a==='buy'){
      if(S.t>=MARKET_CLOSE){toast(i,'꽃시장이 문을 닫았어요');closeModal(i);return}
      const p=S.prices[m.flower],tot=p*m.qty;if(S.money<tot||bagFree(i)<m.qty)return;
      for(let k=0;k<m.qty;k++)bagAdd(i,{kind:'bunch',t:m.flower,stems:Array.from({length:5},()=>stem(m.flower,p)),trim:false});
      S.money-=tot;S.stats.spent+=tot;sfx('buy');toast(i,`${FL[m.flower].name} ${m.qty}단을 가방에 넣었어요`);closeModal(i);
    }
  }
  else if(m.type==='supply'&&a==='cat'){m.cat=v;renderModal(i)}
  else if(m.type==='seedbuy'){
    if(a==='sflower'){m.flower=v;renderModal(i)}
    if(a==='qty'){m.qty=clamp(m.qty+(+v),1,12);renderModal(i)}
    if(a==='sbuy'){if(S.t>=MARKET_CLOSE){toast(i,'꽃시장이 문을 닫았어요');closeModal(i);return}const tot=SEED_PRICE[m.flower]*m.qty;if(S.money<tot)return;
      const ex=c.bag.find(it=>it&&it.kind==='seed'&&it.t===m.flower);if(ex)ex.n+=m.qty;else if(!bagAdd(i,{kind:'seed',t:m.flower,n:m.qty})){toast(i,'가방이 꽉 찼어요');return}
      S.money-=tot;S.stats.spent+=tot;toast(i,`${FL[m.flower].name} 모종 ${m.qty}개를 샀어요`);closeModal(i)}
  }
  else if(m.type==='plant'&&a==='pl'){const it=bag[+v];if(!it||it.kind!=='seed')return;plantSeed(c,S.st[m.st],+v);closeModal(i)}
  else if(m.type==='wardrobe'){if(a==='wcat'){m.cat=v;renderModal(i)}if(a==='wear'){S.outfit[i][m.cat]=v||null;renderModal(i)}}
  else if(m.type==='counter'&&(a==='in'||a==='out')){const st=S.st.counter;
    if(a==='out'){const it=st.slots[+v];if(!it)return;if(!bagAdd(i,it)){toast(i,'가방이 꽉 찼어요');return}st.slots[+v]=null;renderModal(i)}
    else{const it=bag[+v];if(!it)return;const k=freeIdx(st.slots);if(k<0){toast(i,'카운터 보관함이 꽉 찼어요');return}st.slots[k]=it;bag[+v]=null;renderModal(i)}}
  else if(m.type==='supply'&&a==='shopbuy'){m.pending=v;GP.ctxFocus['m'+i]='[data-a="buyok"]';renderModal(i);const mb=modalEl(i).querySelector('.mbody');if(mb)mb.scrollTop=0;return}
  else if(m.type==='supply'&&a==='buyno'){m.pending=null;renderModal(i);return}
  else if(m.type==='supply'&&a==='buyok'){
    const it=SHOP_ITEMS.find(x=>x.id===m.pending);m.pending=null;if(!it||((S.up[it.id]||S.closet[it.id])&&!it.repeat)||S.money<it.price)return;
    if(it.bag){const ex=bag.find(x=>x&&x.kind==='sprinkler');if(ex)ex.n++;else if(!bagAdd(i,{kind:'sprinkler',n:1})){toast(i,'가방이 꽉 찼어요');return}}
    S.money-=it.price;S.stats.invest+=it.price;sfx('buy');
    if(it.styleSet){S.style=it.styleSet;BG_CACHE={};toast(i,`가게를 ${it.name} 스타일로 바꿨어요`);renderModal(i);return}
    if(it.floor){const f={...it.floor};const sp=findSpot(f);if(!sp){S.money+=it.price;S.stats.invest-=it.price;toast(i,'가게에 놓을 자리가 없어요');return}f.x=sp[0];f.y=sp[1];S.decor.push(f);toast(i,`${it.name}을(를) 가게에 놓았어요. 가구 배치로 옮길 수 있어요`);renderModal(i);return}
    if(it.style){S.closet[it.id]=true;toast(i,`${it.name}을(를) 샀어요. 가게 옷장에서 입을 수 있어요`);renderModal(i);return}
    if(!it.bag){S.up[it.id]=true;BG_CACHE={}}
    if(/^bag\d/.test(it.id)){ensureBags();toast(i,`가방이 ${bagSize()}칸이 됐어요`)}if(it.cat==='expand')toast(i,'가게가 넓어졌어요! 메뉴 옆 가구 배치 버튼으로 가구를 옮겨 보세요');
    if(it.id==='sign'){c.modal=null;openModal(i,{type:'rename'});return}
    toast(i,`${it.name}을(를) 샀어요`);renderModal(i);
  }
  else if(m.type==='rename'&&a==='setname'){const val=($('#nameIn'+i).value||'').trim().slice(0,12);if(!val){toast(i,'이름을 적어 주세요');return}S.shopName=val;BG_CACHE={};toast(i,`간판을 “${val}”(으)로 바꿨어요`);closeModal(i)}
  else if(m.type==='trim'){
    if(a==='tpick'){const it=bag[+v];if(!it||!(it.kind==='bunch'&&!it.trim&&!it.dried)){toast(i,'다듬지 않은 꽃 묶음을 골라 주세요');return}c.modal=trimModal(c,+v);modalEl(i).dataset.t=0;renderModal(i)}
    if(a==='leafnext'){const k=[...Array(m.leaves).keys()].find(q=>!m.removed.includes(q));if(k!=null){m.removed.push(k);sfx('snip')}if(m.removed.length>=m.leaves)m.step='cut';renderModal(i)}
    if(a==='leaf'){const k=+v;if(!m.removed.includes(k))m.removed.push(k);if(m.removed.length>=m.leaves)m.step='cut';renderModal(i)}
    if(a==='cut'&&m.step==='cut'){
      sfx('snip');const z=S.up.scissors?14:8;const q=clamp(1-Math.max(0,Math.abs(m.angle-45)-z)/30,0,1);m.step='done';if(m.raf)cancelAnimationFrame(m.raf);
      const b=bag[m.slot];if(b){b.trim=true;b.stems.forEach(s=>{s.trim=true;s.cut=q})}closeModal(i);
      toast(i,q>.9?'완벽한 각도로 잘랐어요':q>.55?'괜찮은 각도로 잘랐어요':'각도가 조금 아쉽지만 다듬었어요');
    }
  }
  else if(m.type==='craft'){
    const W=S.works[m.st];
    if(a==='order'){W.orderId=+v||null;renderModal(i)}
    if(a==='add'){const cand=S.bench.filter(s=>s.t===v&&s.f>=WILT).sort((x,y)=>y.f-x.f)[0];if(cand){S.bench.splice(S.bench.indexOf(cand),1);W.stems.push(cand);renderModal(i)}}
    if(a==='undo'){const s=W.stems.pop();if(s)returnStem(i,s);renderModal(i)}
    if(a==='clear'){W.stems.forEach(s=>returnStem(i,s));W.stems=[];renderModal(i)}
    if(a==='dropwilted'){S.bench.filter(s=>s.f<WILT).forEach(s=>S.stats.waste+=s.c);S.bench=S.bench.filter(s=>s.f>=WILT);renderModal(i)}
    if(a==='benchback'){
      TYPES.forEach(tp=>{let a2=S.bench.filter(s=>s.t===tp);while(a2.length){if(freeIdx(bag)<0)return;const part=a2.splice(0,5);part.forEach(s=>S.bench.splice(S.bench.indexOf(s),1));bagAdd(i,{kind:'bunch',t:tp,stems:part,trim:true})}});
      if(S.bench.length)toast(i,'가방이 꽉 차서 일부만 담았어요');renderModal(i);
    }
    if(a==='cin'){
      const it=bag[+v];if(!it)return;
      if(it.kind==='bunch'&&it.trim&&!it.dried){const s=it.stems.reduce((a,b)=>b.f>a.f?b:a);it.stems.splice(it.stems.indexOf(s),1);W.stems.push(s);if(!it.stems.length)bag[+v]=null;sfx('tap');renderModal(i);return}
      if(it.kind==='bouquet'&&!it.wrapped){if(W.stems.length){toast(i,'이 작업대에 만들던 꽃다발이 이미 있어요');return}S.works[m.st]={orderId:it.orderId,stems:it.stems};const o=orderById(it.orderId);if(o&&o.status==='crafted')o.status='pending';bag[+v]=null;renderModal(i);return}
      toast(i,it.dried?'드라이플라워는 진열대에서 팔 수 있어요':it.kind==='bunch'?'먼저 손질대에서 다듬어 주세요':'포장한 꽃다발은 카운터로 가져가세요');
    }
    if(a==='tie'&&W.stems.length){
      if(freeIdx(bag)<0){toast(i,'가방이 꽉 찼어요');return}
      let o=orderById(W.orderId);if(o&&o.status!=='pending')o=null;let auto=false;
      if(!o){const taken=Object.entries(S.works).filter(([k])=>k!==m.st).map(([,w])=>w.orderId);o=bestOrderFor(W.stems,taken);auto=!!o}
      if(o)o.status='crafted';
      bagAdd(i,{kind:'bouquet',orderId:o?o.id:null,stems:W.stems,wrapped:false});S.works[m.st]={orderId:null,stems:[]};closeModal(i);
      toast(i,auto?`${o.name}님 예약과 꽃이 똑같아서 ${o.name}님 꽃다발로 묶었어요. 포장대로 가져가세요`:o?`${o.name}님 꽃다발을 묶었어요. 포장대로 가져가세요`:'묶었어요. 포장대로 가져가세요');
    }
  }
  else if(m.type==='wrap'){
    if(a==='wpick'){const it=bag[+v];if(!it||!(it.kind==='bouquet'&&!it.wrapped)){toast(i,'포장하지 않은 꽃다발을 골라 주세요');return}c.modal=wrapModal(c,+v);renderModal(i);return}
    if(a==='paper'){m.paper=v;renderModal(i)}
    if(a==='ribbon'){m.ribbon=v;renderModal(i)}
    if(a==='card'){m.card=!m.card;renderModal(i)}
    if(a==='wrap'){const b=bag[m.slot];b.wrapped=true;b.paper=m.paper;b.ribbon=m.ribbon;b.card=m.card;m.step='done';renderModal(i)}
  }
  else if(m.type==='counter'&&a==='rsv'){const k=S.customers[+v];if(!k)return;k.talking=true;k.offer=reserveOffer(k);c.modal=null;openModal(i,{type:'booking',walker:k});return}
  else if(m.type==='counter'&&a==='give'){
    const cu=S.customers[+v];if(!cu||cu.state!=='wait')return;const g=findGift(i,cu);if(!g){toast(i,'건넬 꽃다발이 없어요');return}
    g.arr[g.k]=null;const o=orderById(cu.orderId);m.rec=settleOrder(cu,o,g.it,'hand');modalEl(i).dataset.t=performance.now();renderModal(i);return;
  }
  else if(m.type==='counter'&&a==='give_old'){
    const it=bag[+v];if(!it)return;
    if(!(it.kind==='bouquet'&&it.wrapped)){toast(i,it.kind==='bouquet'?'포장을 먼저 해 주세요':'꽃다발을 건네야 해요');return}
    let cu=S.customers.find(k=>k.kind==='order'&&k.state==='wait'&&k.orderId===it.orderId);if(!cu&&!it.orderId)cu=S.customers.find(k=>k.kind==='order'&&k.state==='wait');const o=orderById(cu?cu.orderId:it.orderId);
    if(!cu){toast(i,o?`${o.name}님은 ${clock(o.time)}에 찾으러 와요`:'찾으러 온 손님이 없어요. 자유 꽃다발은 진열대에 올려 주세요');return}
    bag[+v]=null;m.rec=settleOrder(cu,o,it,'hand');modalEl(i).dataset.t=performance.now();renderModal(i);
  }
  else if(m.type==='trash'){
    if(a==='tsel'){m.sel=bag[+v]?+v:-1;renderModal(i)}
    if(a==='throw'){const it=bag[m.sel];if(!it)return;let loss=0;(it.stems||[]).forEach(x=>loss+=x.c||0);
      if(it.kind==='bouquet'){const o=orderById(it.orderId);if(o&&o.status==='crafted')o.status='pending'}
      S.stats.waste+=loss;bag[m.sel]=null;m.sel=-1;toast(i,loss?`${won(loss)}어치 꽃을 버렸어요`:'버렸어요');renderModal(i)}
  }
  else if(m.type==='phone'||m.type==='booking'){
    const f=m.type==='phone'?m.call.offer:m.walker.offer;
    if(a==='accept'){
      if(v==='today'&&f.today){const o=genOrder(f.tpl,f.today,S.day);o.name=f.name;S.orders.push(o);S.orders.sort((x,y)=>x.time-y.time);hudKey='';toast(i,`오늘 ${clock(f.today)} 예약을 받았어요`)}
      else{const o=genOrder(f.tpl,f.time,S.day+1);o.name=f.name;S.tomorrow.push(o);toast(i,`내일 ${clock(f.time)} 예약을 받았어요`)}}
    if(a==='accept'||a==='decline'){if(m.type==='phone')m.call.state='done';else{m.walker.offer=null;if(m.walker.kind==='reserve'){m.walker.talking=false;leave(m.walker)}}closeModal(i)}
  }
}
[0,1].forEach(i=>modalEl(i).addEventListener('click',e=>{onModalClick(i,e);bump()}));
function dragScroll(el){
  let pid=null,sy=0,st=0,moved=false,box=null;
  el.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||pid!==null)return;if(e.target.closest('input'))return;box=e.target.closest('.scr')||el.querySelector('.scr')||el;pid=e.pointerId;sy=e.clientY;st=box.scrollTop;moved=false});
  el.addEventListener('pointermove',e=>{if(e.pointerId!==pid)return;const dy=e.clientY-sy;if(Math.abs(dy)>6)moved=true;if(moved)box.scrollTop=st-dy});
  const end=e=>{if(e.pointerId===pid){pid=null;if(moved){el._noClick=performance.now()}}};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
  el.addEventListener('click',e=>{if(el._noClick&&performance.now()-el._noClick<250){e.stopPropagation();e.preventDefault()}},true);
}
[0,1].forEach(i=>dragScroll(modalEl(i)));
let boxTick=0;
function refreshLiveModals(dt){S.chars.forEach((c,i)=>{const m=c.modal;if(!m)return;if((['box','counter','craft','trash','plant'].includes(m.type)||m.step==='pick')&&m._rev!==S.rev)renderModal(i)});boxTick+=dt;if(boxTick<2)return;boxTick=0;S.chars.forEach((c,i)=>{if(c.modal&&c.modal.type==='box'&&S.st[c.modal.st].type==='dryer')renderModal(i)})}

/* ---------- screens ---------- */
function showScreen(html){const s=$('#screen');s.innerHTML=html;s.classList.remove('hidden')}
function hideScreen(){$('#screen').classList.add('hidden')}
function showTitle(){
  S.phase='title';$('#hud').style.display='none';updateControlVisibility();$('#orderPop').className='';
  const demo=[...Array(5)].map(()=>({...stem('tulip',0),f:95})).concat([...Array(3)].map(()=>({...stem('freesia',0),f:95})),[...Array(4)].map(()=>({...stem('gyp',0),f:95})));
  const sv=loadSave();
  showScreen(`<div class="sheet"><div class="title-wrap"><div class="title-art">${bouquetSVG(demo,{paper:'pink',ribbon:'white',wrapped:true})}</div><div>
    <h1>우리 둘의 꽃집</h1><p class="sub">아침엔 마을 꽃시장에서 꽃을 사 오고, 낮에는 예약 꽃다발을 만들어요.<br>번 돈으로 용품상점에서 가게를 꾸미고 키워 봐요.</p>
    <div class="opts">${sv?`<button class="btn primary" id="goCont">이어하기 · ${sv.day}일차${sv.mid?' '+clock(sv.mid.t):''}</button>`:''}<button class="btn ${sv?'':'primary'}" id="goNew">새로하기</button><button class="btn soft" id="goSet">설정</button></div>
    <p class="hint">왼쪽 조이콘은 SM, 오른쪽 조이콘은 SK가 가로로 쥐고 조작해요.<br>게임은 자동으로 저장돼요.</p></div></div></div>`);
  $('#goSet').onclick=()=>showSettings('title');
  if(sv)$('#goCont').onclick=()=>continueGame('duo');
  $('#goNew').onclick=()=>{if(sv)confirmNewGame(sv);else askTutorial('duo')};
}
function confirmNewGame(sv){
  showScreen(`<div class="sheet" style="width:min(40.0rem,94vw)"><h1 style="font-size:1.71rem">새로 할까요?</h1>
    <p class="sub">새로 하면 지금까지 저장된 게임(<b style="font-weight:normal">${sv.day}일차 · 가진 돈 ${won(sv.money)}</b>)이 모두 지워져요.<br>가게 꾸밈, 옷, 텃밭, 가방 속 물건도 전부 사라지고 되돌릴 수 없어요.</p>
    <div class="opts"><button class="btn primary" id="newNo" data-back="1">취소</button><button class="btn" id="newYes">지우고 새로하기</button></div></div>`);
  $('#newNo').onclick=showTitle;
  $('#newYes').onclick=()=>{try{localStorage.removeItem(SAVE_KEY)}catch(e){}askTutorial('duo')};
}
function stockLine(){
  const all=[...S.bench];S.stList.forEach(s=>{if(s.slots)s.slots.forEach(it=>{if(it&&it.kind!=='seed')all.push(...it.stems)})});S.bags.forEach(b=>b.forEach(it=>{if(it&&it.kind==='bunch')all.push(...it.stems)}));
  const fresh=all.filter(s=>!s.dried),dried=all.length-fresh.length;if(!all.length)return '';
  const w=fresh.filter(s=>s.f<WILT).length;
  return `<br>남은 꽃: ${fresh.length}송이${w?` (시든 꽃 ${w}송이)`:''}${dried?`, 드라이플라워 ${dried}송이`:''}`;
}
function showStylePick(next){
  S.phase='intro';$('#hud').style.display='none';updateControlVisibility();
  showScreen(`<div class="sheet" style="width:min(51.4rem,96vw)"><h1 style="font-size:1.71rem">가게 인테리어 고르기</h1><p class="sub">문을 열기 전에 우리 가게의 분위기를 골라요. 나중에 용품상점에서 돈을 내고 바꿀 수 있어요.</p>
    <div class="stylepick">${Object.keys(STYLE_IDS).map(k=>`<button class="scard pickst" data-st="${k}" aria-label="${STYLE_IDS[k]}"><div class="sart">${itemArt({styleSet:k})}</div><div class="sname">${STYLE_IDS[k]}</div></button>`).join('')}</div></div>`);
  $('#screen').querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{S.style=b.dataset.st;BG_CACHE={};next()});
}
function showIntro(){
  if(!S.style||S.style==='vintage')S.style='natural';
  S.phase='intro';$('#hud').style.display='none';updateControlVisibility();
  showScreen(`<div class="sheet"><h1 style="font-size:1.86rem">${S.day}일차 아침</h1>
    <p class="sub">오늘 예약은 ${S.orders.length}건이에요. 꽃시장은 마을 오른쪽 끝에 있고 정오에 문을 닫아요. 픽업이 30분 늦을 때마다 10%씩 할인돼요.</p>
    <div class="list">${S.orders.map(o=>`<div class="li"><span class="t">${clock(o.time)}</span><span class="grow">${esc(o.title)} · ${esc(o.name)}<br><small>${Object.keys(o.req).map(t=>FL[t].name+' '+o.req[t]).join(', ')} · ${PAPERS[o.paper].name} 포장</small></span><span>${won(o.price)}</span></div>`).join('')}</div>
    <p class="hint" style="margin-top:0.62rem">오늘 시세 (한 단 5송이): ${TYPES.map(t=>`${FL[t].name} ${won(S.prices[t])}`).join(', ')}<br>가진 돈: ${won(S.money)}${stockLine()}</p>
    <div class="opts"><button class="btn primary" id="goDay">가게 문 열기</button></div></div>`);
  $('#goDay').onclick=()=>{hideScreen();S.phase='play';$('#hud').style.display='flex';buildControls();try{document.documentElement.requestFullscreen?.().catch(()=>{})}catch(_){}};
}
function endDay(){
  if(S.phase!=='play')return;
  [0,1].forEach(closeModal);$('#orderPop').className='';
  S.orders.forEach(o=>{if(o.status==='pending'||o.status==='crafted'){o.status='cancelled';S.stats.cancel.push(o)}});
  S.phase='settle';$('#hud').style.display='none';updateControlVisibility();
  const st=S.stats;const rev=st.rev.reduce((a,r)=>a+r.price,0);const dayNo=S.day;const tmr=S.tomorrow.slice();
  const gallery=st.rev.map(r=>`<figure>${bouquetSVG(r.b.stems,{paper:r.b.paper,ribbon:r.b.ribbon,card:r.b.card,wrapped:true})}<figcaption>${esc(r.o.title)}<br><span class="stars">${'★'.repeat(r.ev.stars)}</span></figcaption></figure>`).join('');
  const cancel=st.cancel.map(o=>esc(o.title)).join(', ');
  prepareNextDay();
  showScreen(`<div class="sheet"><h1 style="font-size:1.86rem">${dayNo}일차 마감</h1><p class="sub">오늘도 수고했어요. 게임이 자동으로 저장됐어요.</p>
    <div class="sum"><div>
      <div class="stat"><span>꽃다발 판매</span><span>+${won(rev)}</span></div>
      ${st.display?`<div class="stat"><span>진열대 판매 (${st.displayN}송이)</span><span>+${won(st.display)}</span></div>`:''}
      <div class="stat"><span>꽃시장 지출</span><span>−${won(st.spent)}</span></div>
      ${st.invest?`<div class="stat"><span>용품 구입</span><span>−${won(st.invest)}</span></div>`:''}
      <div class="stat"><span>버린 꽃</span><span>−${won(st.waste)}</span></div>
      <div class="stat total"><span>오늘 번 돈</span><span>${won(rev+st.display-st.spent-st.invest)}</span></div>
      <div class="stat total"><span>가진 돈</span><span>${won(S.money)}</span></div>
      ${cancel?`<p class="note" style="text-align:left">전달하지 못한 예약: ${cancel}</p>`:''}
      <p class="hint">${stockLine().replace('<br>','')||'남은 꽃이 없어요.'}<br>남은 꽃은 밤새 조금씩 시들어요. 물올림 통에 꽂아 둔 꽃이 가장 오래가요.</p>
    </div><div>
      <div class="lbl" style="margin-top:0">오늘 만든 꽃다발</div>
      ${gallery?`<div class="gallery">${gallery}</div>`:'<p class="note" style="text-align:left">오늘은 전달한 꽃다발이 없어요.</p>'}
      <div class="lbl">내일 예약 ${S.orders.length}건</div>
      <div class="list">${S.orders.map(o=>`<div class="li"><span class="t">${clock(o.time)}</span><span class="grow">${esc(o.title)}${o.regular?' (단골)':''}</span></div>`).join('')}</div>
    </div></div>
    <div class="opts"><button class="btn primary" id="goNext">다음 날 시작</button><button class="btn" id="goTitle">처음 화면</button></div></div>`);
  $('#goNext').onclick=startDaySetup;$('#goTitle').onclick=showTitle;
}
function prepareNextDay(){
  const noBq=arr=>arr.forEach((it,k)=>{if(it&&it.kind==='bouquet'&&it.orderId)arr[k]=null});
  S.stList.forEach(st=>{if(st.slots)noBq(st.slots)});S.bags.forEach(noBq);
  Object.values(S.works).forEach(w=>{w.orderId=null});
  forEachGroup((arr,water,mult)=>{decayStems(arr,14,water,mult);if(water)arr.forEach(s=>s.hyd=1)});
  S.stList.forEach(s=>{if(s.plot){const P=s.plot;if(P.prog<GROW[P.t])P.prog=Math.min(GROW[P.t],P.prog+(P.watered?1:.2));P.watered=false}});
  S.stList.forEach(s=>{if(s.on)sprinkle(s)});
  S.day++;
  const list=S.tomorrow.slice();S.tomorrow=[];
  const used=new Set(list.map(o=>o.time));
  while(list.length<2){const t=SLOTS.find(x=>!used.has(x)&&x>=150)||300;used.add(t);const o=genOrder(pick(TEMPLATES),t,S.day);o.regular=true;list.push(o)}
  list.sort((a,b)=>a.time-b.time);S.orders=list;
  saveGame();
}
function togglePause(){
  if(S.phase!=='play')return;
  S.paused=true;saveMid();togglePauseScreen();
}
function togglePauseScreen(){
  const stt={pending:'준비 전',crafted:'묶음',delivered:'전달 완료',cancelled:'취소'};
  showScreen(`<div class="sheet" style="width:min(51.4rem,96vw)"><h1 style="font-size:1.71rem">잠깐 쉬는 중</h1><p class="sub">${S.day}일차 · ${clock(S.t)} · 가진 돈 ${won(S.money)}</p>
    <div class="lbl">오늘 예약</div><div class="list olist">${S.orders.map(o=>`<div class="li${o.urgent&&(o.status==='pending'||o.status==='crafted')?' urg':''}"><span class="t">${clock(o.time)}</span><span class="grow">${esc(o.name)}님 · ${esc(o.title)}${o.urgent?' · 급해요':''}<br>${reqChips(o.req)} <small>${PAPERS[o.paper].name} 포장</small></span><span>${S.customers.some(k=>k.orderId===o.id&&k.state==='wait')?'손님 도착':stt[o.status]}</span></div>`).join('')}</div>
    ${S.tomorrow.length?`<div class="lbl">내일 예약</div><div class="list">${S.tomorrow.map(o=>`<div class="li"><span class="t">${clock(o.time)}</span><span class="grow">${esc(o.title)}</span></div>`).join('')}</div>`:''}
    <div class="opts"><button class="btn primary" id="goResume" data-back="1">계속하기</button><button class="btn" id="goEnd">오늘 바로 마감</button><button class="btn soft" id="goSet2">설정</button><button class="btn" id="goRestart">처음 화면으로</button></div>
    <p class="hint">게임은 30분(게임 시간)마다, 그리고 메뉴를 열 때 자동으로 저장돼요. 혼자 테스트할 때는 오른쪽 위 배속 버튼으로 시간을 빠르게 돌릴 수 있어요.</p></div>`);
  $('#goResume').onclick=()=>{S.paused=false;hideScreen()};$('#goSet2').onclick=()=>showSettings('pause');
  $('#goEnd').onclick=()=>{S.paused=false;hideScreen();endDay()};
  $('#goRestart').onclick=()=>{S.paused=false;[0,1].forEach(closeModal);showTitle()};
}
$('#bPause').onclick=togglePause;
$('#bSpeed').onclick=()=>{S.speed=S.speed===1?2:S.speed===2?4:1;$('#bSpeed').textContent=S.speed+'배속'};
$('#bClose').onclick=()=>endDay();
$('#bEdit').onclick=()=>toggleEdit();
function showOrderPop(id){
  const o=orderById(id);const el=$('#orderPop');if(!o){el.className='';return}
  const st={pending:'준비 전',crafted:'묶어 둠',delivered:'전달 완료',cancelled:'취소'}[o.status];
  const late=o.status!=='delivered'&&o.status!=='cancelled'?Math.max(0,S.t-o.time):0;const disc=Math.min(50,Math.floor(late/30)*10);
  const here=S.customers.some(k=>k.orderId===o.id&&k.state==='wait');
  el.innerHTML=`<div class="mh"><h2>${esc(o.title)}</h2><button class="btn small" data-close>닫기</button></div>
    <p class="req" style="margin:0 0 0.38rem">${esc(o.name)}님: “${esc(o.text)}”</p>
    <div class="stat"><span>픽업 시간</span><span>${clock(o.time)}</span></div>
    <div class="stat"><span>필요한 꽃</span><span>${Object.keys(o.req).map(t=>FL[t].name+' '+o.req[t]).join(', ')}</span></div>
    <div class="stat"><span>포장 색</span><span>${PAPERS[o.paper].name}</span></div>
    <div class="stat"><span>가격</span><span>${won(o.price)}</span></div>
    <div class="stat"><span>상태</span><span>${st}${here?', 손님이 기다리는 중':''}${disc?` (지금 전달하면 ${disc}% 할인)`:''}</span></div>`;
  el.className='open';el.dataset.id=id;
}
$('#hOrders').addEventListener('click',e=>{const c=e.target.closest('.oc,.chip');if(!c)return;const id=+c.dataset.id;const el=$('#orderPop');if(el.classList.contains('open')&&+el.dataset.id===id){el.className='';return}showOrderPop(id)});
$('#orderPop').addEventListener('click',e=>{if(e.target.closest('[data-close]'))$('#orderPop').className=''});

/* ---------- HUD ---------- */
let hudKey='';
function updateHUD(){
  const hb=$('#hud');const hh=hb.style.display==='none'?44:Math.round(hb.getBoundingClientRect().height);if(hh!==updateHUD.hh){updateHUD.hh=hh;document.documentElement.style.setProperty('--hudH',hh+'px')}
  const late=o=>o.status!=='delivered'&&o.status!=='cancelled'&&S.t>o.time;
  const here=o=>S.customers.some(k=>k.orderId===o.id&&k.state==='wait');
  const shopArea=a=>a==='market'||a==='supply';
  const showM=S.mode==='solo'?shopArea(S.chars[S.active].area):S.chars.some(c=>shopArea(c.area));
  const inShop=S.mode==='solo'?S.chars[S.active].area==='shop':S.chars.some(c=>c.area==='shop');
  $('#bEdit').classList.toggle('hide',!inShop&&!S.edit);$('#bEdit').textContent=S.edit?'배치 끝내기':'가구 배치';$('#bEdit').classList.toggle('soft',S.edit);
  // 항상 보이는 시계 (게임 1분마다 갱신)
  const tm=Math.floor(S.t);if(tm!==updateHUD.tm||S.day!==updateHUD.day){updateHUD.tm=tm;updateHUD.day=S.day;
    const tot=540+tm,hh=Math.floor(tot/60)%12,mm=tot%60;
    $('#hTime').textContent=clock(tm);
    $('#hDay').textContent=`${S.day}일차`;
    $('#hHandH').setAttribute('transform',`rotate(${(hh+mm/60)*30} 20 20)`);$('#hHandM').setAttribute('transform',`rotate(${mm*6} 20 20)`);
    $('#hClock').classList.toggle('eve',S.t>=450)}
  const key=[S.day,Math.floor(S.t/(S.orders.some(o=>o.urgent)?1:5)),S.money,showM,S.edit,S.orders.length,S.rev,S.orders.map(o=>o.status+late(o)+here(o)).join(),S.t>=CLOSE_OK].join('|');
  if(key===hudKey)return;hudKey=key;
  $('#hMoney').classList.toggle('hide',!showM);$('#hMoney').textContent=won(S.money);
  // 포장까지 마친 예약 꽃다발 찾기
  const wrapped=new Set();const scan=arr=>arr&&arr.forEach(b=>{if(b&&b.kind==='bouquet'&&b.wrapped&&b.orderId)wrapped.add(b.orderId)});
  S.bags.forEach(scan);Object.values(S.st).forEach(st=>scan(st.slots));
  const open=S.orders.filter(o=>o.status!=='delivered'&&o.status!=='cancelled'),fin=S.orders.filter(o=>o.status==='delivered'||o.status==='cancelled');
  $('#hOrders').innerHTML=open.concat(fin).map(o=>{
    const P=PAPERS[o.paper]||PAPERS.cream,cs=`--pc:${P.c};--pd:${P.d}`,t=clock(o.time).replace('오전 ','').replace('오후 ','');
    if(o.status==='delivered'||o.status==='cancelled')return `<span class="oc done" style="${cs}" data-id="${o.id}" role="button" tabindex="0"><span class="r1"><span class="nm">${o.status==='delivered'?'✓':'취소'} ${esc(o.name)}</span></span></span>`;
    const st=here(o)?'<span class="st wait">기다려요</span>':wrapped.has(o.id)?'<span class="st ok">포장 완료</span>':o.status==='crafted'?'<span class="st">묶음</span>':'<span class="st">준비 전</span>';
    const pct=o.urgent?clamp((o.deadline-S.t)/URGENT_MIN,0,1)*100:0;
    return `<span class="oc ${o.urgent?'urgent':''} ${late(o)&&!o.urgent?'late':''} ${here(o)?'here':''}" style="${cs}" data-id="${o.id}" role="button" tabindex="0" aria-label="${esc(o.name)}님 ${esc(o.title)}">
      <span class="r1"><span class="tm">${o.urgent?'급해요':t}</span><span class="nm">${esc(o.name)}님</span></span>
      <span class="r2">${Object.keys(o.req).map(k=>`<span class="fr">${flowerMini(k)}<b>${o.req[k]}</b></span>`).join('')}</span>
      <span class="r3"><i></i>${P.name}${o.urgent?` · ${clock(o.deadline).replace('오전 ','').replace('오후 ','')}까지`:' 포장'}${st}</span>
      ${o.urgent?`<span class="tb"><b style="width:${pct.toFixed(0)}%"></b></span>`:''}</span>`}).join('');
  $('#bClose').classList.toggle('hide',S.t<CLOSE_OK);
}

/* =========================================================
   settings · sound · gamepad (Joy-Con) · tutorial · autosave
   ========================================================= */
const SETTINGS_KEY='ourflowershop_settings_v1';
const SET={music:.5,sfx:.7,pads:{},assign:{},gfx:'auto'};
function loadSettings(){try{Object.assign(SET,JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}'))}catch(e){}}
function saveSettings(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(SET))}catch(e){}}
loadSettings();
try{const t=document.createElement('div');t.style.cssText='display:flex;flex-direction:column;row-gap:1px;position:absolute';t.innerHTML='<div></div><div></div>';document.body.appendChild(t);if(t.scrollHeight!==1)document.documentElement.classList.add('oldflex');t.remove()}catch(e){}

/* ---------- sound ---------- */
const AU={ctx:null,music:null,sfx:null,next:0,step:0,timer:null,lastRing:0};
function audioInit(){
  if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  AU.ctx=new C();AU.music=AU.ctx.createGain();AU.sfx=AU.ctx.createGain();
  const comp=AU.ctx.createDynamicsCompressor();AU.music.connect(comp);AU.sfx.connect(comp);comp.connect(AU.ctx.destination);
  applyVolume();AU.next=AU.ctx.currentTime+.2;AU.timer=setInterval(schedMusic,90);
}
function applyVolume(){if(!AU.ctx)return;AU.music.gain.value=SET.music*.35;AU.sfx.gain.value=SET.sfx*.6}
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,audioInit,{passive:true}));
function tone(f,t,d,type,vol,dest,att){
  const c=AU.ctx,o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+(att||.012));g.gain.exponentialRampToValueAtTime(.0005,t+d);
  o.connect(g);g.connect(dest||AU.sfx);o.start(t);o.stop(t+d+.05);return o;
}
const MF=n=>440*Math.pow(2,(n-69)/12);
const PROG=[[48,52,55,60],[45,48,52,57],[41,45,48,53],[43,47,50,55],[48,52,55,60],[45,48,52,57],[41,45,48,53],[43,47,50,55,62]];
const MEL=[72,74,76,79,81,79,76,74];
function schedMusic(){
  if(!AU.ctx||SET.music<=0)return;const c=AU.ctx;const spb=60/78/2;
  while(AU.next<c.currentTime+.4){
    const bar=Math.floor(AU.step/8)%PROG.length,e=AU.step%8,ch=PROG[bar];const t=AU.next;
    const eve=S.phase==='play'&&S.t>480;
    if(e===0)tone(MF(ch[0]-12),t,1.6,'sine',.32,AU.music,.03);
    const arp=[0,1,2,3,2,1,2,3][e];tone(MF(ch[Math.min(arp,ch.length-1)]+(eve?0:12)),t,.7,'triangle',.12,AU.music);
    if((e===0||e===4||(e===6&&Math.random()<.4))&&Math.random()<.7){const n=MEL[(bar*3+e+Math.floor(Math.random()*3))%MEL.length];tone(MF(n-(eve?12:0)),t+.01,1.1,'sine',.1,AU.music,.04)}
    AU.next+=spb;AU.step++;
  }
}
function sfx(name){
  if(!AU.ctx||SET.sfx<=0)return;const t=AU.ctx.currentTime;
  switch(name){
    case 'tap':tone(880,t,.08,'sine',.25);break;
    case 'blip':tone(560+Math.random()*260,t,.045,'sine',.07);break;
    case 'open':tone(660,t,.1,'sine',.22);tone(990,t+.05,.12,'sine',.18);break;
    case 'close':tone(700,t,.08,'sine',.18);tone(520,t+.05,.1,'sine',.15);break;
    case 'coin':[1318,1760].forEach((f,k)=>tone(f,t+k*.08,.25,'triangle',.25));break;
    case 'buy':[784,988,1175].forEach((f,k)=>tone(f,t+k*.06,.18,'triangle',.2));break;
    case 'snip':{const c=AU.ctx,n=c.createBufferSource(),b=c.createBuffer(1,c.sampleRate*.08,c.sampleRate),d=b.getChannelData(0);for(let k=0;k<d.length;k++)d[k]=(Math.random()*2-1)*(1-k/d.length);n.buffer=b;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=2500;const g=c.createGain();g.gain.value=.35;n.connect(f);f.connect(g);g.connect(AU.sfx);n.start(t);break}
    case 'water':{const c=AU.ctx,n=c.createBufferSource(),b=c.createBuffer(1,c.sampleRate*.6,c.sampleRate),d=b.getChannelData(0);for(let k=0;k<d.length;k++)d[k]=(Math.random()*2-1)*Math.sin(Math.PI*k/d.length);n.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1800;f.Q.value=.8;const g=c.createGain();g.gain.value=.3;n.connect(f);f.connect(g);g.connect(AU.sfx);n.start(t);break}
    case 'door':tone(1046,t,.5,'sine',.18);tone(1318,t+.12,.6,'sine',.14);break;
    case 'bell':tone(1568,t,.7,'sine',.14);tone(2093,t+.1,.6,'sine',.1);break;
    case 'ring':[0,.12,.24,.36].forEach(d=>tone(1200,t+d,.08,'square',.06));break;
    case 'no':tone(330,t,.15,'triangle',.2);tone(262,t+.08,.18,'triangle',.18);break;
    case 'nav':tone(1200,t,.04,'sine',.1);break;
  }
}

/* ---------- gamepad ---------- */
const GP={pads:{},calib:null,ctxFocus:{},repeat:{}};
function padKey(gp){return gp.id+'#'+gp.index}
function isJoy(id){return /joy-?con|057e.*200[67]/i.test(id)}
function joySide(id){if(/\(L\)|left|2006/i.test(id)&&!/\(R\)|right|2007/i.test(id))return 'L';if(/\(R\)|right|2007/i.test(id)&&!/\(L\)|left|2006/i.test(id))return 'R';return null}
function autoMap(gp){
  if(gp.mapping==='standard')return {act:[1,3],back:[0],menu:[9,8,16],swap:[2,4,5,6,7]};
  return {act:[0,1,2,3],back:[10,11],menu:[8,9,12,13,16],swap:[4,5,6,7,14,15]};
}
function mapOf(gp){const m=SET.pads[gp.id];if(m)return {cal:m,act:[m.act],back:[m.back],menu:[m.menu],swap:[m.swap]};return autoMap(gp)}
function hatVec(v){if(v>1.05||v<-1.05)return [0,0];const k=Math.round((v+1)/(2/7))%8;const ang=-Math.PI/2+k*Math.PI/4;return [Math.round(Math.cos(ang)*100)/100,Math.round(Math.sin(ang)*100)/100]}
function rotSide(v,side){if(!side)return v;const [x,y]=v;return side==='L'?[y,-x]:[-y,x]}
function padVec(gp,st,sideways){
  const m=mapOf(gp),ax=gp.axes;
  if(m.cal){const c=m.cal;if(c.hat!=null){const v=hatVec(ax[c.hat]);return c.rot?(c.rot>0?[-v[1],v[0]]:[v[1],-v[0]]):v}let x=(ax[c.x.a]||0)*c.x.s,y=(ax[c.y.a]||0)*c.y.s;return Math.hypot(x,y)<.22?[0,0]:[clamp(x,-1,1),clamp(y,-1,1)]}
  if(!st.base){st.base=ax.map(v=>v)}
  let best=[0,0],bm=0;
  for(let a=0;a+1<Math.min(ax.length,4);a+=2){if(Math.abs(st.base[a])>.6||Math.abs(st.base[a+1])>.6)continue;const x=ax[a],y=ax[a+1],mg=Math.hypot(x,y);if(mg>.28&&mg>bm){bm=mg;best=[x,y]}}
  for(let a=0;a<ax.length;a++){if(Math.abs(st.base[a])<1.05)continue;const h=hatVec(ax[a]);if((h[0]||h[1])&&bm<1){bm=1;best=h}}
  const b=k=>gp.buttons[k]&&gp.buttons[k].pressed;
  if(gp.mapping==='standard'&&(b(12)||b(13)||b(14)||b(15))){best=[(b(15)?1:0)-(b(14)?1:0),(b(13)?1:0)-(b(12)?1:0)];bm=1}
  let v=[clamp(best[0],-1,1),clamp(best[1],-1,1)];
  if(sideways&&gp.mapping!=='standard'&&isJoy(gp.id))v=rotSide(v,joySide(gp.id));
  return v;
}
function padsList(){const out=[];const arr=navigator.getGamepads?navigator.getGamepads():[];for(const gp of arr){if(gp&&gp.connected)out.push(gp)}return out}
function slotOf(gp){
  const k=gp.id;if(SET.assign[k]!=null)return SET.assign[k];
  const sd=joySide(k);if(sd==='L')return 0;if(sd==='R')return 1;
  const list=padsList();return list.indexOf(gp)>0?1:0;
}
const PADVEC=[[0,0],[0,0]];let TOUCH_MODE=false;
/* ---- 조이콘 배치: 스틱 방향은 실측값 기준 (가로로 쥔 조이콘) ---- */
function isCombo(id){return /l\s*\+\s*r|200e/i.test(id)}
function stickVec(x,y){const m=Math.hypot(x,y);if(m<.28)return [0,0];const k=Math.min(1,(m-.28)/.62)/m;return [x*k,y*k]}
function sideSlot(side){const sw=!!SET.swapSides;return side==='L'?(sw?1:0):(sw?0:1)}
function padUnits(gp){
  const ax=gp.axes,duo=S.mode==='duo',id=gp.id;
  if(isCombo(id)){
    if(duo)return [
      {side:'L',slot:sideSlot('L'),vec:stickVec(ax[1]||0,-(ax[0]||0)),btn:{act:[12,13,14,15],back:[8,4,6],menu:[10],swap:[]}},
      {side:'R',slot:sideSlot('R'),vec:stickVec(-(ax[3]||0),ax[2]||0),btn:{act:[0,1,2,3],back:[9,5,7],menu:[11],swap:[]}}];
    return [{side:'LR',slot:S.active,vec:stickVec(ax[0]||0,ax[1]||0),btn:{act:[1,3],back:[0],menu:[9,8],swap:[2,4,5]}}];
  }
  const sd=isJoy(id)?joySide(id):null;
  if(sd&&duo)return [{side:sd,slot:sideSlot(sd),vec:sd==='L'?stickVec(ax[1]||0,-(ax[0]||0)):stickVec(-(ax[1]||0),ax[0]||0),btn:{act:[0,1,2,3,12,13,14,15],back:[8,9],menu:[10,11,16],swap:[]}}];
  const m=autoMap(gp);return [{side:'X',slot:duo?slotOf(gp):S.active,vec:stickVec(ax[0]||0,ax[1]||0),btn:{act:m.act,back:m.back,menu:m.menu,swap:m.swap}}];
}
function applyPadBinds(gp,u){
  const p=u.slot,K=SET.keys[S.mode==='duo'?p:(u.side==='R'?1:0)]||{},own={};let any=false;
  for(const [fn] of BFN){const b=K[fn];if(b&&b.t==='p'&&b.id===gp.id){own[fn]=[b.b];any=true}}
  if(!any)return u.btn;const out={act:[],back:[],menu:[],swap:[]};Object.assign(out,own);return out;
}
/* ---------- 토토 (마을 고양이) ---------- */
const CAT_LINES=['냐아~ (꼬리를 살랑살랑 흔들어요)','미야옹? (노란 눈을 동그랗게 떠요)','골골골… (다리에 몸을 비벼요)','냥! (앞발로 신발을 톡톡 건드려요)','먀아아~ (배를 보이며 뒹굴어요)','냥냥. (햇볕 좋은 자리를 알려주려는 것 같아요)','…냐. (하품을 크게 하고 눈을 깜빡여요)','미야~ 냐냐! (오늘 누가 간식을 줬나 봐요. 기분이 아주 좋아요)'];
function makeCat(){if(S.cat&&S.cat.day===S.day)return;S.cat={kind:'cat',name:'토토',x:8.5*TILE,y:7.2*TILE,tx:8.5*TILE,ty:7.2*TILE,dir:'down',walk:0,state:'sit',timer:3,day:S.day,talking:false,hearts:0}}
function catSpot(){for(let n=0;n<30;n++){const x=rnd(2,56)*TILE,y=rnd(6.4,26)*TILE;if(!blocked('town',x,y))return [x,y]}return [8*TILE,7*TILE]}
function updateCat(dt){
  const c=S.cat;if(!c)return;c.mv=false;
  if(c.talking){c.state='sit';return}
  c.timer-=dt;
  if(c.state==='walk'){const dx=c.tx-c.x,dy=c.ty-c.y,d=Math.hypot(dx,dy);if(d<3||c.timer<=0){c.state=pick(['sit','sit','groom','sleep','sit']);c.timer=c.state==='sleep'?rnd(12,25):rnd(4,9);return}
    if(!c.route){const r=navRoute('town',c.x,c.y,c.tx,c.ty);if(!r){c.timer=0;return}c.route=r.pts.concat([r.end]);[c.tx,c.ty]=r.end}
    const [wx,wy]=c.route[0]||[c.tx,c.ty];const ex=wx-c.x,ey=wy-c.y,ed=Math.hypot(ex,ey)||1,sp=22*dt;
    if(ed<=sp){c.x=wx;c.y=wy;c.route.shift();if(!c.route.length){c.route=null;c.tx=c.x;c.ty=c.y}}else{c.x+=ex/ed*sp;c.y+=ey/ed*sp}
    c.mv=true;c.walk+=dt*10;c.dir=Math.abs(ex)>Math.abs(ey)?(ex>0?'right':'left'):(ey>0?'down':'up')}
  else if(c.timer<=0){c.state='walk';const near=S.walkers.filter(w=>!w.hidden&&w.zone!=='north'&&w.zone!=='yard'&&Math.random()<.35);const t=near.length&&Math.random()<.4?pick(near):null;[c.tx,c.ty]=t?[t.x+8,t.y+4]:catSpot();c.route=null;c.timer=rnd(10,20)}
}
function pollPads(dt){
  let list=padsList();PADVEC[0]=[0,0];PADVEC[1]=[0,0];
  if(BIND.on){bindPoll();return}
  if(list.length)audioInit();
  if(list.some(g=>isCombo(g.id)))list=list.filter(g=>isCombo(g.id)||!isJoy(g.id));
  for(const gp of list){
    const key=padKey(gp),st=GP.pads[key]||(GP.pads[key]={prev:[],hold:{},dir:{}});if(!st.dir||typeof st.dir!=='object'){st.dir={};st.hold={}}
    const pressed=k=>gp.buttons[k]&&gp.buttons[k].pressed;
    const any=arr=>arr.some(k=>pressed(k)&&!st.prev[k]);
    if(gp.buttons.some(b=>b.pressed)&&TOUCH_MODE){TOUCH_MODE=false;updateControlVisibility()}
    if(GP.calib&&GP.calib.id===gp.id){calibStep(gp,st);st.prev=gp.buttons.map(b=>b.pressed);continue}
    for(const u of padUnits(gp)){
      const slot=u.slot,v=u.vec,B=applyPadBinds(gp,u),ctx=navContext(slot),dk=u.side;
      if(ctx){
        const d=Math.hypot(v[0],v[1])>.5?(Math.abs(v[0])>Math.abs(v[1])?(v[0]>0?'right':'left'):(v[1]>0?'down':'up')):null;
        if(d&&d!==st.dir[dk]){st.dir[dk]=d;st.hold[dk]=0;navMove(ctx,d)}else if(d){st.hold[dk]=(st.hold[dk]||0)+dt;if(st.hold[dk]>.38){st.hold[dk]=.26;navMove(ctx,d)}}else st.dir[dk]=null;
        if(any(B.act))navPress(ctx);else if(any(B.back))navBack(ctx);else if(any(B.menu))navMenu();
      }else{
        /* 두 조이콘을 함께 움직일 때 신호가 한 순간 0으로 끊기는 경우를 보정(최대 2프레임) */
        let vv=v;const pm=st.lv&&st.lv[dk]?Math.hypot(st.lv[dk][0],st.lv[dk][1]):0;st.lv=st.lv||{};st.hz=st.hz||{};
        if(vv[0]===0&&vv[1]===0&&pm>.6&&(st.hz[dk]||0)<2){st.hz[dk]=(st.hz[dk]||0)+1;vv=st.lv[dk]}else{st.hz[dk]=0;st.lv[dk]=vv}
        PADVEC[slot]=[PADVEC[slot][0]+vv[0],PADVEC[slot][1]+vv[1]];
        if(any(B.act))doAction(slot);
        else if(any(B.menu))togglePause();
        else if(S.mode==='solo'&&any(B.swap))swapChar();
        else if(any(B.back)&&S.chars[slot]&&S.chars[slot].rest)doAction(slot);
      }
    }
    st.prev=gp.buttons.map(b=>b.pressed);
  }
  if($('#diagBox'))diagRender();
}
addEventListener('gamepadconnected',e=>{audioInit();toastAll(`컨트롤러가 연결됐어요 (${shortPad(e.gamepad.id)})`);if(document.querySelector('#setPads'))showSettings(SETTINGS_FROM)});
addEventListener('gamepaddisconnected',e=>{toastAll('컨트롤러 연결이 끊겼어요')});
function shortPad(id){if(/joy-?con\s*l\s*\+\s*r|200e/i.test(id))return '조이콘 L+R 한 쌍';if(/\(L\)|2006/.test(id))return '조이콘 왼쪽';if(/\(R\)|2007/.test(id))return '조이콘 오른쪽';if(/pro controller|2009/i.test(id))return '프로 컨트롤러';return id.replace(/\(.*?\)/g,'').slice(0,24)}

/* menu navigation */
function navContext(i){
  if(!$('#screen').classList.contains('hidden'))return {el:$('#screen'),key:'screen'};
  if($('#orderPop').classList.contains('open'))return {el:$('#orderPop'),key:'pop'};
  const c=S.chars[i];if(S.phase==='play'&&c&&c.modal)return {el:modalEl(i),key:'m'+i,i};
  return null;
}
function navItems(el){return Array.from(el.querySelectorAll('button:not([disabled]),input,.chip')).filter(b=>b.offsetParent!==null&&b.getBoundingClientRect().width>0)}
function focusKey(b){return b.dataset.a?`[data-a="${b.dataset.a}"]${b.dataset.v!=null?`[data-v="${CSS.escape?CSS.escape(b.dataset.v):b.dataset.v}"]`:''}`:(b.id?'#'+b.id:null)}
function setFocus(ctx,b){ctx.el.querySelectorAll('.gfocus').forEach(x=>x.classList.remove('gfocus'));if(!b){hideTip();return}b.classList.add('gfocus');showTip(b);GP.ctxFocus[ctx.key]=focusKey(b);try{b.scrollIntoView({block:'nearest',inline:'nearest'})}catch(e){}}
function curFocus(ctx){let b=ctx.el.querySelector('.gfocus');if(b&&b.offsetParent)return b;const k=GP.ctxFocus[ctx.key];if(k){try{b=ctx.el.querySelector(k)}catch(e){b=null}if(b&&!b.disabled)return b}return null}
function navMove(ctx,dir){
  const items=navItems(ctx.el);if(!items.length)return;let cur=curFocus(ctx);
  if(!cur){setFocus(ctx,items.find(b=>b.dataset.a!=='close')||items[0]);sfx('nav');return}
  const r=cur.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let best=null,bs=1e9;
  for(const b of items){if(b===cur)continue;const q=b.getBoundingClientRect(),x=q.left+q.width/2,y=q.top+q.height/2,dx=x-cx,dy=y-cy;
    let main,off;if(dir==='right'){main=dx;off=Math.abs(dy)}else if(dir==='left'){main=-dx;off=Math.abs(dy)}else if(dir==='down'){main=dy;off=Math.abs(dx)}else{main=-dy;off=Math.abs(dx)}
    if(main<=4)continue;const sc=main+off*2.2;if(sc<bs){bs=sc;best=b}}
  if(best){setFocus(ctx,best);sfx('nav')}
}
function navPress(ctx){if(ctx.key.startsWith('m')&&S.chars[ctx.i].modal&&S.chars[ctx.i].modal.type==='talk'){if(talkSkip(ctx.i))return;closeModal(ctx.i);sfx('close');return}let b=curFocus(ctx);if(!b){b=ctx.el.querySelector('button.primary:not([disabled])');if(!b){navMove(ctx,'down');return}}if(b.tagName==='INPUT'){b.focus();return}b.dispatchEvent(new MouseEvent('click',{bubbles:true}));if(ctx.key.startsWith('m'))modalEl(ctx.i).dataset.t=0}
function navBack(ctx){
  if(ctx.key.startsWith('m')){closeModal(ctx.i);sfx('close');return}
  if(ctx.key==='pop'){$('#orderPop').className='';return}
  const b=$('#screen').querySelector('[data-back]');if(b)b.click();
}
function navMenu(){if(S.phase==='play'){if(S.paused){S.paused=false;hideScreen()}else togglePause()}}
function gpRefocus(i){const ctx={el:modalEl(i),key:'m'+i};const k=GP.ctxFocus[ctx.key];if(!k||!padsList().length)return;let b=null;try{b=ctx.el.querySelector(k)}catch(e){}if(b&&!b.disabled)b.classList.add('gfocus')}
const _origShowScreen=showScreen;
showScreen=function(html){_origShowScreen(html);GP.ctxFocus.screen=null;{const ctx={el:$('#screen'),key:'screen'};const items=navItems(ctx.el);const p=items.find(b=>b.classList.contains('primary'))||items[0];if(p)setFocus(ctx,p)}};

/* calibration */
function startCalib(gp){GP.calib={id:gp.id,step:0,rest:gp.axes.slice(),map:{act:0,back:1,menu:9,swap:3},wait:.4};renderCalib()}
const CALIB_STEPS=['스틱을 오른쪽으로 끝까지 밀었다가 놓아 주세요','스틱을 위로 끝까지 밀었다가 놓아 주세요','"행동"으로 쓸 버튼을 눌러 주세요','"닫기·취소"로 쓸 버튼을 눌러 주세요','"메뉴"로 쓸 버튼을 눌러 주세요','"캐릭터 바꾸기"로 쓸 버튼을 눌러 주세요 (혼자 할 때 사용)'];
function renderCalib(){const c=GP.calib;const el=$('#calibMsg');if(el)el.innerHTML=c?`<b>${c.step+1}/${CALIB_STEPS.length}</b> ${CALIB_STEPS[c.step]}`:''}
function calibStep(gp,st){
  const c=GP.calib;if(c.wait>0){c.wait-=1/60;c.rest=gp.axes.slice();return}
  if(c.step<=1){const st0=st;
    let bi=-1,bd=0;gp.axes.forEach((v,k)=>{const d=v-(c.rest[k]||0);if(Math.abs(d)>bd){bd=Math.abs(d);bi=k}});
    if(bd>.6&&!c.got){
      const isHat=Math.abs(c.rest[bi])>1.05||(gp.axes.length>=10&&bi===9);
      if(isHat){if(c.step===0){const k=Math.round((gp.axes[bi]+1)/(2/7))%8;const off=(k-2+8)%8;c.map.hat=bi;c.map.rot=off===0?0:off===6?1:off===2?-1:0}}
      else if(c.step===0)c.map.x={a:bi,s:Math.sign(gp.axes[bi]-(c.rest[bi]||0))};else c.map.y={a:bi,s:-Math.sign(gp.axes[bi]-(c.rest[bi]||0))};
      c.got=true;
    }
    if(c.got&&bd<.3){c.got=false;if(c.step===1&&c.map.hat!=null){}c.step++;c.wait=.25;sfx('tap');renderCalib()}
    return;
  }
  const k=gp.buttons.findIndex((b,j)=>b.pressed&&!st.prev[j]);if(k<0)return;
  const key=['act','back','menu','swap'][c.step-2];c.map[key]=k;c.step++;sfx('tap');
  if(c.step>=CALIB_STEPS.length){const m=c.map;if(m.hat==null&&!m.x)m.x={a:0,s:1};if(m.hat==null&&!m.y)m.y={a:1,s:1};SET.pads[c.id]=m;saveSettings();GP.calib=null;toastAll('컨트롤러 버튼 설정을 저장했어요');showSettings(SETTINGS_FROM);return}
  renderCalib();
}

/* ---------- controller diagnostics ---------- */
const KEYLOG=[];addEventListener('keydown',e=>{KEYLOG.unshift(`${e.key||'?'} (${e.keyCode})`);if(KEYLOG.length>8)KEYLOG.pop()},true);
const DG={on:false,step:0,res:[],base:null};
const DG_STEPS=['A 버튼','B 버튼','X 버튼','Y 버튼','+ 버튼','− 버튼','L 스틱을 위로','L 스틱을 오른쪽으로','R 스틱을 위로','R 스틱을 오른쪽으로','십자 버튼 위(L의 ↑)','L 버튼','R 버튼','ZL 버튼','ZR 버튼'];
function dgRecord(txt){if(!DG.on)return;DG.res[DG.step]=txt;DG.step++;DG.cool=performance.now();if(DG.step>=DG_STEPS.length)DG.on=false;diagT=0;diagRender()}
function dgPoll(){if(!DG.on||performance.now()-(DG.cool||0)<500)return;const pads=padsList();
  if(!DG.base){DG.base={};pads.forEach(gp=>DG.base[gp.index]={ax:gp.axes.slice(),bt:gp.buttons.map(b=>b.pressed)});return}
  for(const gp of pads){const b=DG.base[gp.index]||{ax:[],bt:[]};const k=gp.buttons.findIndex((x,i)=>x.pressed&&!b.bt[i]);if(k>=0){dgRecord(`패드${gp.index} 버튼 ${k}`);DG.base=null;return}
    const a=gp.axes.findIndex((v,i)=>Math.abs(v-(b.ax[i]||0))>.6);if(a>=0){dgRecord(`패드${gp.index} 축 ${a} → ${gp.axes[a].toFixed(2)}`);DG.base=null;return}}}
addEventListener('keydown',e=>{if(!DG.on)return;e.preventDefault();e.stopImmediatePropagation();if(performance.now()-(DG.cool||0)>=500){dgRecord(`키 ${e.key} (${e.keyCode})`);DG.base=null}},true);
let diagT=0;
function diagRender(){dgPoll();const now=performance.now();if(now-diagT<120)return;diagT=now;const box=$('#diagBox');if(!box)return;
  const guide=`<div class="diag"><b>버튼 하나씩 테스트</b> ${DG.on?`<span style="color:#C65C79">지금 누를 것: ${DG_STEPS[DG.step]} (없으면 건너뛰기)</span>`:(DG.res.length?'완료! 이 화면을 찍어 보내 주세요':'시작 버튼을 눌러 주세요')}<br>${DG_STEPS.map((n,i)=>`${n}: ${DG.res[i]||(DG.on&&i===DG.step?'…':'-')}`).join(' · ')}</div>`;
  const pads=padsList();
  box.innerHTML=guide+(pads.length?pads.map(gp=>{const st=GP.pads[padKey(gp)]||{};const v=[0,0];const us=padUnits(gp);return `<div class="diag"><b>${esc(gp.id)}</b><br>번호 ${gp.index} · 방식 ${gp.mapping||'(없음)'} · 인식 ${esc(shortPad(gp.id))}<br>스틱 값: ${gp.axes.map((a,i)=>`${i}:${a.toFixed(2)}`).join('  ')}<br>눌린 버튼: ${gp.buttons.map((b,i)=>b.pressed?i:null).filter(x=>x!==null).join(', ')||'없음'}<br>게임이 읽은 방향: ${us.map(u=>`${u.side==='L'?'왼쪽 조이콘':u.side==='R'?'오른쪽 조이콘':'컨트롤러'}(${u.slot?'SK':'SM'}) → ${u.vec.map(x=>x.toFixed(2)).join(', ')}`).join(' / ')}${S.mode==='duo'?'':' (혼자 모드 기준)'}</div>`}).join(''):'<p class="note" style="text-align:left">게임패드로 인식된 컨트롤러가 없어요. 조이콘 버튼을 한 번 눌러 보세요.</p>')+
  `<div class="diag"><b>리모컨·키 입력</b><br>${KEYLOG.join(' / ')||'아직 없음'}</div><div class="diag"><small>${esc(navigator.userAgent)}</small></div>`}
function showDiag(){showScreen(`<div class="sheet" style="width:min(54.3rem,96vw)"><h1 style="font-size:1.57rem">컨트롤러 진단</h1><p class="sub">조이콘 버튼을 하나씩 누르고 스틱을 움직여 보세요. 이 화면을 사진으로 찍어 보내 주시면 맞춰 드릴게요.</p><div id="diagBox"></div><div class="opts"><button class="btn primary" id="dgStart">테스트 시작</button><button class="btn" id="dgSkip">건너뛰기</button><button class="btn" id="diagBack" data-back="1">돌아가기</button></div></div>`);
  $('#diagBack').onclick=()=>{DG.on=false;showSettings()};$('#dgStart').onclick=()=>{DG.on=true;DG.step=0;DG.res=[];DG.base=null;DG.cool=performance.now();diagT=0};$('#dgSkip').onclick=()=>{if(DG.on)dgRecord('반응 없음')}}
addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&!TOUCH_MODE){TOUCH_MODE=true;updateControlVisibility()}},{passive:true,capture:true});

/* ---------- settings screen ---------- */
let SETTINGS_FROM='title';
function showSettings(from){
  SETTINGS_FROM=from||SETTINGS_FROM;const pads=padsList();
  const bar=v=>`<span class="meter"><b style="width:${Math.round(v*100)}%"></b></span> ${Math.round(v*10)}`;
  showScreen(`<div class="sheet" style="width:min(44.3rem,96vw)"><h1 style="font-size:1.71rem">설정</h1>
    <div class="setrow"><span class="grow">배경음악</span><button class="btn small" data-set="music" data-d="-1" aria-label="배경음악 줄이기">−</button>${bar(SET.music)}<button class="btn small" data-set="music" data-d="1" aria-label="배경음악 키우기">+</button></div>
    <div class="setrow"><span class="grow">효과음</span><button class="btn small" data-set="sfx" data-d="-1" aria-label="효과음 줄이기">−</button>${bar(SET.sfx)}<button class="btn small" data-set="sfx" data-d="1" aria-label="효과음 키우기">+</button></div>
    <div class="setrow"><span class="grow">그래픽<br><small>${LITE?'가볍게 (빠름)':'보통'}${SET.gfx==='auto'?' · 자동':''}</small></span><button class="btn small ${SET.gfx==='auto'?'primary':''}" data-gfx="auto">자동</button><button class="btn small ${SET.gfx==='high'?'primary':''}" data-gfx="high">보통</button><button class="btn small ${SET.gfx==='lite'?'primary':''}" data-gfx="lite">가볍게</button></div>
    <div class="setrow"><span class="grow">성능 표시<br><small>화면 오른쪽 아래에 초당 프레임·처리 시간·메모리를 보여 줘요</small></span><button class="btn small ${SET.perf?'primary':''}" id="setPerf">${SET.perf?'켜짐':'꺼짐'}</button></div>
    <div class="lbl" id="setPads">조이콘</div>
    ${pads.length?`<div class="setrow"><span class="grow">${padsList().some(g=>isCombo(g.id))||(padsList().some(g=>joySide(g.id)==='L')&&padsList().some(g=>joySide(g.id)==='R'))?'조이콘 두 개가 연결됐어요':'조이콘(컨트롤러)이 연결됐어요'}<br><small>둘이 할 때: 왼쪽 조이콘 → <b style="font-weight:normal">${SET.swapSides?'SK':'SM'}</b>, 오른쪽 조이콘 → <b style="font-weight:normal">${SET.swapSides?'SM':'SK'}</b></small></span><button class="btn small soft" id="swapSides">SM·SK 자리 바꾸기</button></div>`:'<p class="note" style="text-align:left">연결된 조이콘이 없어요. 스탠바이미에 블루투스로 연결한 뒤 아무 버튼이나 눌러 주세요.</p>'}
    <p class="hint">둘이 할 때는 한 사람당 조이콘 1개를 가로로 쥐어요. 스틱을 기울인 방향 그대로, 대각선까지 움직여요. 버튼 역할을 바꾸고 싶으면 "조이콘 키 지정"을 써 주세요.</p>
    <div class="opts"><button class="btn primary" id="goKeys">조이콘 키 지정</button><button class="btn soft" id="goDiag">컨트롤러 진단</button><button class="btn primary" data-back="1" id="setBack">돌아가기</button></div></div>`);
  const sc=$('#screen');sc.querySelectorAll('[data-gfx]').forEach(b=>b.onclick=()=>{SET.gfx=b.dataset.gfx;saveSettings();applyGfx();showSettings()});$('#goDiag').onclick=showDiag;$('#goKeys').onclick=showKeys;
  $('#setPerf').onclick=()=>{SET.perf=!SET.perf;saveSettings();perfShow();showSettings()};
  const swb=$('#swapSides');if(swb)swb.onclick=()=>{SET.swapSides=!SET.swapSides;saveSettings();showSettings()};
  sc.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{const k=b.dataset.set;SET[k]=clamp(Math.round((SET[k]+(+b.dataset.d)*.1)*10)/10,0,1);saveSettings();applyVolume();sfx('tap');showSettings()});
  sc.querySelectorAll('[data-assign]').forEach(b=>b.onclick=()=>{SET.assign[b.dataset.assign]=+b.dataset.slot;saveSettings();showSettings()});
  sc.querySelectorAll('[data-calib]').forEach(b=>b.onclick=()=>{const gp=padsList().find(g=>g.index===+b.dataset.calib);if(gp)startCalib(gp)});
  $('#setBack').onclick=()=>{GP.calib=null;if(SETTINGS_FROM==='pause'){togglePauseScreen()}else showTitle()};
}

/* ---------- tutorial ---------- */
const TUT=[
  ['가게 아래쪽 <b>문</b>으로 걸어 나가 마을로 가 보세요.',()=>S.chars.some(c=>c.area==='town')],
  ['마을 오른쪽, 강 건너 <b>꽃시장</b>에 들어가세요. 정오에 문을 닫아요.',()=>S.chars.some(c=>c.area==='market')],
  ['꽃 가판대 앞에서 행동 버튼으로 <b>꽃을 사세요</b>. 위쪽 예약 그림을 보고 필요한 꽃을 골라요.',()=>S.bags.some(b=>b.some(it=>it&&it.kind==='bunch'))],
  ['가게로 돌아가 왼쪽 <b>꽃 화단</b> 앞에서 꽃을 다듬으세요.',()=>S.bags.some(b=>b.some(it=>it&&it.kind==='bunch'&&it.trim))||S.bench.length>0],
  ['위쪽 <b>작업대</b>에서 예약을 고르고, 꽃을 올려 끈으로 묶으세요.',()=>S.bags.some(b=>b.some(it=>it&&it.kind==='bouquet'))],
  ['<b>포장대</b>에서 포장지와 리본을 골라 포장하세요.',()=>S.bags.concat([S.st.counter.slots]).some(b=>b.some(it=>it&&it.kind==='bouquet'&&it.wrapped))],
  ['<b>카운터</b>에 꽃다발을 보관해 두세요. 손님이 오면 카운터에서 건네요.',()=>S.st.counter.slots.some(it=>it&&it.wrapped)||S.stats.rev.length>0],
  ['잘했어요! 진열대, 텃밭, 공원도 둘러보세요. 하루는 저녁 7시에 끝나요.',()=>S.tutDone>12]
];
function tutUpdate(dt){
  const el=$('#tut');
  if(S.tut==null||S.tut<0||S.phase!=='play'){el.classList.add('hide');return}
  if(S.tut===TUT.length-1)S.tutDone=(S.tutDone||0)+dt;
  if(TUT[S.tut][1]()){S.tut++;sfx('ok');if(S.tut>=TUT.length){S.tut=-1;el.classList.add('hide');return}}
  const key='t'+S.tut;if(el.dataset.k!==key){el.dataset.k=key;el.innerHTML=`<span>💡 ${TUT[S.tut][0]}</span><button class="btn small" id="tutOff">튜토리얼 끄기</button>`;$('#tutOff').onclick=()=>{S.tut=-1;el.classList.add('hide')}}
  el.classList.remove('hide');
}
function askTutorial(mode){
  showScreen(`<div class="sheet" style="width:min(37.1rem,94vw)"><h1 style="font-size:1.71rem">처음 오셨나요?</h1><p class="sub">첫날 할 일을 화면 위쪽에 하나씩 알려주는 튜토리얼이 있어요.</p>
    <div class="opts"><button class="btn primary" id="tutYes">튜토리얼 하기</button><button class="btn" id="tutNo">바로 시작</button><button class="btn small" data-back="1" id="tutBack">돌아가기</button></div></div>`);
  $('#tutYes').onclick=()=>{S.tutPending=0;newGame(mode)};$('#tutNo').onclick=()=>{S.tutPending=-1;newGame(mode)};$('#tutBack').onclick=showTitle;
}

/* ---------- mid-day autosave ---------- */
function saveMid(){
  if(S.phase!=='play')return;
  saveGame({t:S.t,prices:S.prices,tomorrow:S.tomorrow,stats:{...S.stats,rev:S.stats.rev.map(r=>({price:r.price,o:{title:r.o.title},ev:r.ev,b:{stems:r.b.stems,paper:r.b.paper,ribbon:r.b.ribbon,card:r.b.card}}))},calls:S.calls,offers:S.offers,reserveAt:S.reserveAt,chars:S.chars.map(c=>({area:c.area,x:c.x,y:c.y})),tut:S.tut});
}
addEventListener('visibilitychange',()=>{if(document.hidden)saveMid()});
addEventListener('pagehide',()=>saveMid());

/* ---------- item popup ---------- */
function showTip(el){const tip=$('#tip');if(!tip)return;const t=el&&el.dataset&&el.dataset.tip;if(!t||t==='빈 칸'){tip.className='';return}
  tip.textContent=t;tip.className='on';const r=el.getBoundingClientRect(),tw=tip.offsetWidth,th=tip.offsetHeight;
  tip.style.left=clamp(r.left+r.width/2-tw/2,6,innerWidth-tw-6)+'px';tip.style.top=(r.top-th-8<4?r.bottom+8:r.top-th-8)+'px'}
function hideTip(){const t=$('#tip');if(t)t.className=''}
document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse')return;const el=e.target.closest&&e.target.closest('[data-tip]');if(el)showTip(el);else hideTip()});

/* ---------- offline support (GitHub Pages only) ---------- */
try{if('serviceWorker' in navigator&&/github\.io$/.test(location.hostname))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}catch(e){}

/* =========================================================
   조이콘 키 지정 (리모컨 키 / 게임패드 버튼 모두)
   ========================================================= */
const BFN=[['up','위'],['down','아래'],['left','왼쪽'],['right','오른쪽'],['act','행동·확인'],['back','닫기·취소'],['menu','메뉴'],['swap','캐릭터 바꾸기']];
const BFN_UI=BFN.filter(([fn])=>!['up','down','left','right','swap'].includes(fn));
const VOLKEYS=[447,448,449,174,175,173,427,428];
if(!SET.keys)SET.keys={0:{},1:{}};
const KB_HELD={};const BIND={on:false,p:0,fi:0,seq:false,t0:0,msg:''};let bindNavT=[0,0];
function bindLabel(b){if(!b)return '없음';return b.t==='p'?`${b.n||'패드'} 버튼 ${b.b}`:(b.n||('키 '+b.c))}
function keyLabel(e){const m={13:'확인(Enter)',461:'뒤로',27:'Esc',32:'스페이스',33:'PageUp',34:'PageDown',37:'←',38:'↑',39:'→',40:'↓'};return (m[e.keyCode]||e.key||'키')+` (${e.keyCode})`}
function bindHit(code){for(const p of [0,1]){const K=SET.keys[p]||{};for(const [fn] of BFN){const b=K[fn];if(b&&b.t==='k'&&b.c===code)return {p,fn}}}return null}
function hasPadBind(id){for(const p of [0,1]){const K=SET.keys[p]||{};for(const [fn] of BFN){const b=K[fn];if(b&&b.t==='p'&&b.id===id)return true}}return false}
function assignBind(val){
  for(const p of [0,1]){const K=SET.keys[p]||(SET.keys[p]={});for(const [fn] of BFN){const b=K[fn];if(b&&b.t===val.t&&(val.t==='k'?b.c===val.c:(b.id===val.id&&b.b===val.b)))delete K[fn]}}
  (SET.keys[BIND.p]||(SET.keys[BIND.p]={}))[BFN_UI[BIND.fi][0]]=val;saveSettings();sfx('tap');
  if(BIND.seq&&BIND.fi<BFN_UI.length-1){BIND.fi++;BIND.t0=performance.now();BIND.msg=''}else{BIND.on=false;BIND.msg='지정했어요'}
  if($('#keyBox'))renderKeys();
}
addEventListener('keydown',e=>{
  if(!BIND.on)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(performance.now()-BIND.t0<250)return;
  if(VOLKEYS.includes(e.keyCode)){BIND.msg='이 버튼은 스탠바이미가 음량·채널로 써서 지정할 수 없어요. 다른 버튼을 눌러 주세요';renderKeys();return}
  assignBind({t:'k',c:e.keyCode,n:keyLabel(e)});
},true);
const KB_UP={};addEventListener('keyup',e=>{if(BIND.on){e.preventDefault();e.stopImmediatePropagation()}KB_UP[e.keyCode]=1;delete KB_HELD[e.keyCode]},true);
function bindPoll(){
  if(!BIND.on)return;if(performance.now()-BIND.t0>15000){BIND.on=false;BIND.msg='시간이 지나서 취소했어요';renderKeys();return}
  for(const gp of padsList()){const st=GP.pads[padKey(gp)]||(GP.pads[padKey(gp)]={prev:[]});const k=gp.buttons.findIndex((b,i)=>b.pressed&&!st.prev[i]);st.prev=gp.buttons.map(b=>b.pressed);if(k>=0&&performance.now()-BIND.t0>250){assignBind({t:'p',id:gp.id,b:k,n:shortPad(gp.id)});return}}
}
function bindVec(p){
  const K=SET.keys[p]||{},now=performance.now();let x=0,y=0;
  const held=b=>{if(!b)return false;if(b.t==='k')return KB_HELD[b.c]&&now-KB_HELD[b.c]<(KB_UP[b.c]?2500:220);const gp=padsList().find(g=>g.id===b.id);return !!(gp&&gp.buttons[b.b]&&gp.buttons[b.b].pressed)};
  if(held(K.up))y-=1;if(held(K.down))y+=1;if(held(K.left))x-=1;if(held(K.right))x+=1;
  if(x&&y){x*=Math.SQRT1_2;y*=Math.SQRT1_2}return [x,y];
}
function doBind(p,fn,rep){
  const slot=S.mode==='solo'?S.active:p,ctx=navContext(slot);
  if(['up','down','left','right'].includes(fn)){if(ctx){const now=performance.now();if(rep&&now-bindNavT[p]<170)return;bindNavT[p]=now;navMove(ctx,fn)}return}
  if(rep)return;
  if(fn==='act'){if(ctx)navPress(ctx);else if(S.phase==='play')doAction(slot);return}
  if(fn==='back'){if(ctx)navBack(ctx);else if(S.phase==='play'&&S.chars[slot]&&S.chars[slot].rest)doAction(slot);return}
  if(fn==='menu'){if(ctx&&ctx.key==='screen'&&S.phase==='play')navMenu();else if(S.phase==='play')togglePause();return}
  if(fn==='swap'){if(S.mode==='solo'&&!ctx)swapChar();return}
}
function padBindPoll(gp,st){
  let used=false;for(const p of [0,1]){const K=SET.keys[p]||{};for(const [fn] of BFN){const b=K[fn];if(!b||b.t!=='p'||b.id!==gp.id)continue;used=true;const on=gp.buttons[b.b]&&gp.buttons[b.b].pressed;
    if(on&&!st.prev[b.b])doBind(p,fn,false);else if(on&&['up','down','left','right'].includes(fn))doBind(p,fn,true)}}
  return used;
}
function renderKeys(){
  const box=$('#keyBox');if(!box)return;
  const col=p=>`<div><div class="lbl">${p?'SK':'SM'} · ${p===sideSlot('L')?'왼쪽':'오른쪽'} 조이콘</div>${BFN_UI.map(([fn,n],fi)=>{const on=BIND.on&&BIND.p===p&&BIND.fi===fi;return `<div class="setrow"><span class="grow">${n}<br><small>${on?'<b style="color:#C65C79;font-weight:normal">지금 조이콘 버튼을 누르세요…</b>':esc(bindLabel((SET.keys[p]||{})[fn]))}</small></span><button class="btn small ${on?'primary':''}" data-bk="${p}|${fi}">${on?'대기 중':'지정'}</button></div>`}).join('')}
    <div class="row"><button class="btn small soft" data-bseq="${p}">처음부터 차례로 지정</button><button class="btn small" data-bclr="${p}">지우기</button></div></div>`;
  box.innerHTML=`${BIND.msg?`<p class="req" style="color:#C65C79">${esc(BIND.msg)}</p>`:''}<div class="inv" style="height:auto">${col(0)}${col(1)}</div>`;
  box.querySelectorAll('[data-bk]').forEach(b=>b.onclick=()=>{const [p,fi]=b.dataset.bk.split('|').map(Number);Object.assign(BIND,{on:true,p,fi,seq:false,t0:performance.now(),msg:''});renderKeys()});
  box.querySelectorAll('[data-bseq]').forEach(b=>b.onclick=()=>{Object.assign(BIND,{on:true,p:+b.dataset.bseq,fi:0,seq:true,t0:performance.now(),msg:''});renderKeys()});
  box.querySelectorAll('[data-bclr]').forEach(b=>b.onclick=()=>{SET.keys[+b.dataset.bclr]={};saveSettings();BIND.msg='지웠어요';renderKeys()});
}
function showKeys(){
  showScreen(`<div class="sheet" style="width:min(58.6rem,96vw)"><h1 style="font-size:1.57rem">조이콘 키 지정</h1>
    <p class="sub">스틱 이동은 자동이라 지정하지 않아도 돼요. 리모컨 포인터나 화면 터치로 "지정"을 누른 뒤, 그 사람이 쥔 조이콘에서 쓰고 싶은 버튼을 한 번 누르세요. 한 번 지정하면 계속 그 버튼으로 작동해요.</p>
    <div id="keyBox"></div><div class="opts"><button class="btn primary" id="keyBack">돌아가기</button></div></div>`);
  BIND.on=false;BIND.msg='';renderKeys();$('#keyBack').onclick=()=>{BIND.on=false;showSettings()};
}

/* =========================================================
   art: flower icons · inventory bunches · shop item pictures
   ========================================================= */
const STYLES={
  natural:{name:'모던 내추럴',wall:'#EFE8DC',dot:'#E4D8C6',wain:'#D8C9B2',wainL:'#E5D8C3',trim:'#FAF6EE',side:'#E2D7C6',floor:'plank',f1:'#E7D0AF',f2:'#DCC29C',seam:'#CCB08A',frame:'#C9A57E'},
  vintage:{name:'파리 꽃집',wall:'#F4ECDD',dot:'#F4ECDD',wain:'#EADFCB',wainL:'#F2E9D8',trim:'#C9A24A',side:'#E6DBC6',floor:'check',f1:'#F3EFE6',f2:'#4B4A50',seam:'#D8D2C6',frame:'#C9A24A'},
  minimal:{name:'미니멀 화이트',wall:'#FAFAF8',dot:'#FAFAF8',wain:'#F3F3F0',wainL:'#F7F7F4',trim:'#FFFFFF',side:'#EFEFEC',floor:'plain',f1:'#F7F7F5',f2:'#F2F2EF',seam:'#EAEAE6',frame:'#E4E4E0'}
};
function curStyle(){return STYLES[S.style]||STYLES.natural}

/* ---- flower heads (SVG, small) ---- */
function wcol(c,w,to){return mix(c,to||'#B49A7E',w*.85)}
function fHeadSVG(t,x,y,s,w,wet){
  const dr=w*s*.5,rot=w*38*(x<30?-1:1);let o=`<g transform="translate(${x.toFixed(1)} ${(y+dr).toFixed(1)}) rotate(${rot.toFixed(0)})">`;
  if(t==='tulip'){
    const a=wcol('#D9546F',w),b=wcol('#EF8AA3',w),c=wcol('#FAC6D2',w);
    o+=`<path d="M${-.62*s},0 C${-.75*s},${-.9*s} ${-.3*s},${-1.2*s} 0,${-1.05*s} C${.3*s},${-1.2*s} ${.75*s},${-.9*s} ${.62*s},0 C${.4*s},${.5*s} ${-.4*s},${.5*s} ${-.62*s},0Z" fill="${a}"/>`+
       `<path d="M${-.45*s},${.05*s} C${-.55*s},${-.75*s} ${-.12*s},${-1.08*s} ${.05*s},${-1*s} C${.35*s},${-.7*s} ${.38*s},${-.15*s} ${.25*s},${.3*s} C${0},${.42*s} ${-.3*s},${.35*s} ${-.45*s},${.05*s}Z" fill="${b}"/>`+
       `<path d="M${-.05*s},${-.15*s} C${-.08*s},${-.55*s} ${0},${-.8*s} ${.08*s},${-.88*s}" stroke="${c}" stroke-width="${(.12*s).toFixed(2)}" fill="none" stroke-linecap="round"/>`;
  }else if(t==='rose'){
    const a=wcol('#B8263F',w),b=wcol('#D9435E',w),c=wcol('#EE7088',w),d=wcol('#8E1A30',w);
    o+=`<circle r="${.62*s}" fill="${a}"/>`;
    for(let k=0;k<5;k++){const an=k*72+10;o+=`<ellipse cx="0" cy="${-.38*s}" rx="${.34*s}" ry="${.3*s}" transform="rotate(${an})" fill="${k%2?b:a}"/>`}
    o+=`<circle r="${.36*s}" fill="${b}"/><path d="M${-.2*s},0 A${.2*s},${.2*s} 0 1 1 ${.12*s},${.15*s} A${.12*s},${.12*s} 0 1 1 ${-.05*s},${-.08*s}" stroke="${d}" stroke-width="${(.07*s).toFixed(2)}" fill="none"/>`+
       `<path d="M${-.45*s},${-.25*s} Q${-.1*s},${-.62*s} ${.35*s},${-.38*s}" stroke="${c}" stroke-width="${(.08*s).toFixed(2)}" fill="none" opacity=".8"/>`;
  }else if(t==='hydrangea'){
    const cs=[wcol('#8FAEE6',w),wcol('#A9C1F0',w),wcol('#B8A6E3',w),wcol('#C9D8F6',w)];const r=seedRand(Math.round(x*7+y));
    o+=`<circle r="${.95*s}" fill="${wcol('#7C97CC',w)}"/>`;
    for(let k=0;k<16;k++){const an=r()*6.28,rd=Math.sqrt(r())*.8*s,px=Math.cos(an)*rd,py=Math.sin(an)*rd*.9,fs=.19*s,col=cs[k%4];
      o+=`<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${(r()*90).toFixed(0)})"><ellipse cx="0" cy="${-fs}" rx="${fs*.8}" ry="${fs}" fill="${col}"/><ellipse cx="0" cy="${fs}" rx="${fs*.8}" ry="${fs}" fill="${col}"/><ellipse cx="${-fs}" cy="0" rx="${fs}" ry="${fs*.8}" fill="${col}"/><ellipse cx="${fs}" cy="0" rx="${fs}" ry="${fs*.8}" fill="${col}"/><circle r="${fs*.3}" fill="#F3F6FC"/></g>`}
  }else if(t==='freesia'){
    const a=wcol('#F2C53D',w),b=wcol('#FFE68A',w),c=wcol('#E39A2E',w);
    o+=`<path d="M${-.4*s},${.3*s} Q${.4*s},${.2*s} ${.9*s},${-.6*s}" stroke="${wcol('#86B263',w)}" stroke-width="${(.1*s).toFixed(2)}" fill="none"/>`;
    const bl=(bx,by,r)=>{let q='';for(let k=0;k<6;k++)q+=`<ellipse cx="0" cy="${-r*.55}" rx="${r*.38}" ry="${r*.56}" transform="rotate(${k*60+15})" fill="${k%2?a:b}"/>`;return `<g transform="translate(${bx} ${by})">${q}<circle r="${r*.28}" fill="${c}"/></g>`};
    o+=bl(0,0,.62*s)+bl(.45*s,-.25*s,.45*s)+`<ellipse cx="${.8*s}" cy="${-.52*s}" rx="${.12*s}" ry="${.22*s}" fill="${wcol('#D5D68A',w)}" transform="rotate(40 ${.8*s} ${-.52*s})"/>`;
  }else{
    const r=seedRand(Math.round(x*13+y*3));
    for(let k=0;k<11;k++){const px=(r()-.5)*1.5*s,py=(r()-.5)*1.1*s;o+=`<path d="M0,${.6*s} L${px.toFixed(1)},${py.toFixed(1)}" stroke="${wcol('#9DBB88',w)}" stroke-width=".35"/><circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(.14*s+r()*.05*s).toFixed(2)}" fill="${wcol('#FFFFFF',w,'#D9CDB6')}" stroke="#DCD6CC" stroke-width=".25"/>`}
  }
  if(wet&&!w)o+=`<circle cx="${.3*s}" cy="${-.55*s}" r="${.1*s}" fill="#fff" opacity=".9"/><path d="M${-.35*s},${-.2*s} l0,${-.22*s} M${-.46*s},${-.31*s} l${.22*s},0" stroke="#fff" stroke-width=".5" opacity=".9"/>`;
  return o+'</g>';
}
function flowerMini(t){return `<svg viewBox="0 0 24 24" class="fm" aria-hidden="true"><path d="M12 23V14" stroke="#6E9A5A" stroke-width="1.6"/>${fHeadSVG(t,12,t==='tulip'?15:12,t==='hydrangea'?9:t==='gyp'?8:10,0,false)}</svg>`}
function reqChips(req){return Object.keys(req).map(t=>`<span class="fq">${flowerMini(t)}${req[t]}</span>`).join('')}

/* ---- inventory bunch icon ---- */
function bunchSVG(it){
  const st=it.stems,n=Math.min(it.t==='hydrangea'?3:5,st.length),trim=it.trim,f=avg(st.map(s=>s.f)),w=it.dried?0:wither(f),wet=!it.dried&&avg(st.map(s=>s.hyd||0))>=.99;
  const sc=it.t==='hydrangea'?11.5:it.t==='gyp'?7.5:it.t==='rose'?8.5:9;const stemC=wcol('#6E9A5A',w);
  let stems='',heads='',leaves='',extra='';
  for(let k=0;k<n;k++){
    const fx=30+(k-(n-1)/2)*(it.t==='hydrangea'?14:8.5),fy=15+Math.abs(k-(n-1)/2)*3+(k%2)*2;
    const bx=30+(k-(n-1)/2)*1.6,by=trim?49:57+(k%3)*1.5;
    stems+=`<path d="M${fx.toFixed(1)},${fy+2} Q${((fx+bx)/2).toFixed(1)},${(fy+by)/2} ${bx.toFixed(1)},${by}" stroke="${stemC}" stroke-width="1.4" fill="none"/>`;
    if(trim)stems+=`<path d="M${(bx-1.1).toFixed(1)},${by-.8} L${(bx+1.1).toFixed(1)},${by+1}" stroke="${mix(stemC,'#fff',.4)}" stroke-width="1.2"/>`;
    else if(k%2===0){const lx=bx+(k<n/2?-1:1)*2;leaves+=`<ellipse cx="${(lx+(k<n/2?-3:3)).toFixed(1)}" cy="${by-12}" rx="2.2" ry="6" transform="rotate(${k<n/2?-30:30} ${lx.toFixed(1)} ${by-12})" fill="${wcol('#7CA85F',w)}"/>`}
    heads+=fHeadSVG(it.t,fx,fy,sc,w,wet);
  }
  if(!trim)extra+=`<path d="M17,36 L43,36 L38,58 L22,58Z" fill="#D8B994"/><path d="M17,36 L43,36 L41,40 L19,40Z" fill="#E6CDAA"/><path d="M26,40 L25,58 M34,40 L35,58" stroke="#C4A27A" stroke-width=".6"/>`;
  else extra+=`<rect x="25" y="41" width="10" height="3" rx="1.5" fill="#E07A7A"/>`+(wet?`<ellipse cx="22" cy="44" rx="1" ry="1.5" fill="#9CCDF0"/><ellipse cx="38" cy="47" rx=".9" ry="1.4" fill="#9CCDF0"/>`:'');
  return `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">${stems}${leaves}${extra}${heads}${wet?'<circle cx="46" cy="12" r="1.3" fill="#fff"/><path d="M14 20 l0 -4 M12 18 l4 0" stroke="#fff" stroke-width=".8"/>':''}</svg>`;
}
function sprSVG(){return `<svg viewBox="0 0 40 40"><rect x="18" y="14" width="4" height="20" fill="#8E9CA6"/><ellipse cx="20" cy="14" rx="7" ry="3.5" fill="#BCC7CF"/><circle cx="20" cy="13" r="2.4" fill="#6E8FAE"/>${[0,1,2,3,4].map(k=>`<ellipse cx="${8+k*6}" cy="${6+(k%2)*2}" rx="1" ry="1.6" fill="#7FB8E6"/>`).join('')}</svg>`}

/* ---- shop item pictures ---- */
const ART_BG='<rect width="64" height="64" rx="12" fill="#FBF6F0"/>';
function sv(inner){return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${ART_BG}${inner}</svg>`}
function artPerson(extra,tee){return `<ellipse cx="32" cy="58" rx="16" ry="3" fill="#0001"/><rect x="18" y="38" width="28" height="22" rx="9" fill="${tee||'#4C82D4'}"/><rect x="28" y="30" width="8" height="10" rx="3" fill="#E0B597"/><ellipse cx="32" cy="24" rx="13" ry="14" fill="#F4D3B7"/><path d="M19 22 C19 8 45 8 45 22 C41 17 36 16 32 15 C28 16 23 17 19 22Z" fill="#3B2A22"/><ellipse cx="27" cy="25" rx="1.4" ry="1.8" fill="#3A2E3A"/><ellipse cx="37" cy="25" rx="1.4" ry="1.8" fill="#3A2E3A"/><path d="M29.5 31 Q32 33 34.5 31" stroke="#C0707E" stroke-width="1.1" fill="none"/>${extra}`}
function itemArt(it){
  const id=it.id;
  if(it.style){const [k,v]=it.style;
    if(k==='glasses')return sv(artPerson(v==='gold'?'<circle cx="27" cy="25" r="4.4" fill="#dcecf633" stroke="#C9A24A" stroke-width="1.1"/><circle cx="37" cy="25" r="4.4" fill="#dcecf633" stroke="#C9A24A" stroke-width="1.1"/><path d="M31.4 25 L32.6 25" stroke="#C9A24A"/>':'<rect x="21.5" y="20.5" width="11" height="9" rx="3" fill="#dcecf633" stroke="#2A2230" stroke-width="1.8"/><rect x="31.5" y="20.5" width="11" height="9" rx="3" fill="#dcecf633" stroke="#2A2230" stroke-width="1.8"/>'));
    if(k==='hat'){const h={beret:'<ellipse cx="30" cy="11" rx="15" ry="6" fill="#C65C79" transform="rotate(-8 30 11)"/><circle cx="31" cy="5" r="1.5" fill="#A84C66"/>',sunhat:'<ellipse cx="32" cy="14" rx="22" ry="5" fill="#E9D3A4"/><rect x="21" y="3" width="22" height="12" rx="6" fill="#F0DEB4"/><rect x="21" y="11" width="22" height="3" fill="#E07A7A"/>',beanie:'<rect x="18" y="2" width="28" height="17" rx="9" fill="#E3A04A"/><rect x="17" y="14" width="30" height="5" rx="2.5" fill="#F0C27A"/><circle cx="32" cy="2" r="3" fill="#FFF1D6"/>',cap:'<path d="M18 16 C18 2 46 2 46 16Z" fill="#5C7FB8"/><ellipse cx="40" cy="16" rx="12" ry="3" fill="#46679C"/>'}[v];return sv(artPerson(h))}
    if(k==='pin'){const h={ribbon:'<ellipse cx="38" cy="10" rx="4" ry="2.6" fill="#EE7F9C" transform="rotate(-25 38 10)"/><ellipse cx="45" cy="9" rx="4" ry="2.6" fill="#EE7F9C" transform="rotate(25 45 9)"/><circle cx="41.5" cy="9.5" r="1.6" fill="#C65C79"/>',flower:[0,1,2,3,4].map(q=>`<circle cx="${40+Math.cos(q*1.256)*2.6}" cy="${11+Math.sin(q*1.256)*2.6}" r="2" fill="#fff"/>`).join('')+'<circle cx="40" cy="11" r="1.5" fill="#F5CF4E"/>',band:'<path d="M19 20 C19 6 45 6 45 20" stroke="#B9A2E0" stroke-width="3" fill="none"/>'}[v];return sv(artPerson(h))}
    if(k==='apron')return sv(`<path d="M20 14 h24 v10 l6 32 H14 l6-32Z" fill="${v}"/><rect x="26" y="34" width="12" height="9" rx="2" fill="${mix(v,'#000',.15)}"/><path d="M20 14 L14 4 M44 14 L50 4" stroke="${mix(v,'#000',.2)}" stroke-width="2"/>`);
    if(k==='tee')return sv(`<path d="M14 18 L24 10 H40 L50 18 L45 26 L42 24 V54 H22 V24 L19 26Z" fill="${v}"/><path d="M27 10 Q32 15 37 10" stroke="${mix(v,'#000',.15)}" stroke-width="1.5" fill="none"/>`);
  }
  if(it.styleSet){const P=STYLES[it.styleSet];const fl=P.floor==='check'?`<rect x="6" y="36" width="52" height="22" fill="${P.f1}"/>${[0,1,2,3,4,5,6,7,8,9,10,11,12].map(q=>[0,1,2].map(r=>(q+r)%2?`<rect x="${6+q*4}" y="${36+r*7.3}" width="4" height="7.3" fill="${P.f2}"/>`:'').join('')).join('')}`:P.floor==='plain'?`<rect x="6" y="36" width="52" height="22" fill="${P.f1}"/>`:P.floor==='plank'?`<rect x="6" y="36" width="52" height="22" fill="${P.f1}"/>${[0,1,2].map(q=>`<rect x="6" y="${40+q*6}" width="52" height=".8" fill="${P.seam}"/>`).join('')}`:P.floor==='herring'?`<rect x="6" y="36" width="52" height="22" fill="${P.f1}"/>${[0,1,2,3,4,5,6].map(q=>`<path d="M${6+q*8} 58 l8 -8 M${6+q*8} 48 l8 -8" stroke="${P.seam}" stroke-width="1.2"/>`).join('')}`:`<rect x="6" y="36" width="52" height="22" fill="${P.f1}"/>${[0,1,2,3,4,5,6,7,8].map(q=>`<circle cx="${10+(q*13)%48}" cy="${40+(q*7)%16}" r="1.2" fill="${['#C9B8A6','#9FB0A6','#D9A89A'][q%3]}"/>`).join('')}`;
    const lamp=it.styleSet==='natural'?'<path d="M26 8 L38 8 L42 18 L22 18Z" fill="#C9A06A"/><path d="M24 12 H40" stroke="#B08850"/>':it.styleSet==='vintage'?'<path d="M32 2 V10" stroke="#C9A24A"/><path d="M24 18 Q32 6 40 18Z" fill="#C9A24A"/>':'<circle cx="32" cy="14" r="6" fill="#FFFFFF" stroke="#E4E0D8"/>';
    return sv(`<rect x="6" y="6" width="52" height="30" fill="${P.wall}"/><rect x="6" y="27" width="52" height="9" fill="${P.wain}"/>${fl}${lamp}<rect x="42" y="40" width="7" height="10" rx="2" fill="#D98E6C"/><ellipse cx="45.5" cy="38" rx="6" ry="5" fill="#7FAF6C"/><rect x="12" y="20" width="12" height="10" fill="${P.frame}"/><rect x="13.5" y="21.5" width="9" height="7" fill="#FFF8EE"/>`);
  }
  const A={
    fridge:'<rect x="18" y="6" width="28" height="52" rx="4" fill="#8FB3D4"/><rect x="21" y="10" width="22" height="40" rx="2" fill="#E4F3FA"/>'+[18,28,38].map(y=>`<rect x="21" y="${y+8}" width="22" height="1" fill="#BCD3E4"/><circle cx="27" cy="${y+5}" r="3" fill="#EE8FA7"/><circle cx="36" cy="${y+5}" r="3" fill="#F5CF4E"/>`).join(''),
    bucket3:'<path d="M18 26 H46 L42 56 H22Z" fill="#B4C2CC"/><ellipse cx="32" cy="26" rx="14" ry="3.5" fill="#8CC3E6"/>'+[0,1,2].map(k=>`<path d="M${28+k*4} 26 L${24+k*8} 10" stroke="#6E9A5A" stroke-width="1.5"/>`).join('')+'<circle cx="24" cy="10" r="4" fill="#EE8FA7"/><circle cx="32" cy="8" r="4" fill="#D9435E"/><circle cx="40" cy="10" r="4" fill="#F5CF4E"/>',
    dryer:'<rect x="12" y="8" width="3" height="50" fill="#9C6B4C"/><rect x="49" y="8" width="3" height="50" fill="#9C6B4C"/><rect x="10" y="7" width="44" height="4" rx="2" fill="#C99E78"/>'+[20,32,44].map((x,k)=>`<path d="M${x} 11 V18" stroke="#B88A5A"/><path d="M${x} 18 L${x-3} 34 M${x} 18 L${x+3} 34 M${x} 18 V34" stroke="#A89A6E"/><circle cx="${x-3}" cy="36" r="3" fill="${['#C9A07A','#D8B06A','#C98E8E'][k]}"/><circle cx="${x+3}" cy="36" r="3" fill="${['#D8B06A','#C98E8E','#C9A07A'][k]}"/>`).join(''),
    pickup:'<rect x="10" y="36" width="44" height="18" rx="3" fill="#C99873"/><rect x="8" y="32" width="48" height="6" rx="2" fill="#E9D3B6"/><path d="M26 32 L32 12 L38 32Z" fill="#F4B6C4"/><circle cx="29" cy="14" r="3.5" fill="#EE8FA7"/><circle cx="35" cy="15" r="3.5" fill="#F5CF4E"/><rect x="24" y="18" width="16" height="6" rx="3" fill="#fff"/>',
    craft2:'<rect x="8" y="26" width="48" height="8" rx="2" fill="#F6D5DC"/><rect x="8" y="33" width="48" height="5" fill="#C98E9C"/><rect x="12" y="38" width="4" height="18" fill="#9C6B4C"/><rect x="48" y="38" width="4" height="18" fill="#9C6B4C"/><circle cx="40" cy="24" r="4" fill="#D8B994"/><path d="M18 26 L28 16" stroke="#6E9A5A" stroke-width="1.5"/><circle cx="28" cy="15" r="3.5" fill="#EE8FA7"/>',
    scissors:'<path d="M20 44 L46 14" stroke="#AFBAC2" stroke-width="4" stroke-linecap="round"/><path d="M20 14 L46 44" stroke="#C9D2D8" stroke-width="4" stroke-linecap="round"/><circle cx="18" cy="48" r="6" fill="none" stroke="#E1B656" stroke-width="3"/><circle cx="46" cy="48" r="6" fill="none" stroke="#E1B656" stroke-width="3"/>',
    sprinkler:'<rect x="30" y="26" width="4" height="30" fill="#8E9CA6"/><ellipse cx="32" cy="26" rx="10" ry="4" fill="#BCC7CF"/>'+[0,1,2,3,4,5].map(k=>`<ellipse cx="${10+k*9}" cy="${12+(k%2)*5}" rx="1.4" ry="2.3" fill="#7FB8E6"/>`).join(''),
    papers2:[['#BFE3D0',14],['#F6B7A0',28],['#D8B994',42]].map(([c,x])=>`<rect x="${x}" y="10" width="10" height="44" rx="5" fill="${c}"/><ellipse cx="${x+5}" cy="10" rx="5" ry="2" fill="${mix(c,'#fff',.4)}"/>`).join(''),
    ribbons2:[['#B9A2E0',22],['#7FB070',42]].map(([c,x])=>`<circle cx="${x}" cy="30" r="12" fill="${c}"/><circle cx="${x}" cy="30" r="4" fill="#FBF6F0"/><path d="M${x} 42 q-6 10 -2 16 M${x} 42 q6 10 2 16" stroke="${c}" stroke-width="3" fill="none"/>`).join(''),
    d_pendant:'<path d="M32 4 V16" stroke="#8A7B74"/><path d="M20 28 Q32 8 44 28Z" fill="#C9A06A"/><path d="M22 24 H42 M24 20 H40" stroke="#B08850"/><ellipse cx="32" cy="30" rx="6" ry="2.5" fill="#FFE9A8"/>',
    d_curtain:'<rect x="18" y="10" width="28" height="36" fill="#CFE3EE"/><path d="M8 6 H56" stroke="#9C8B7A" stroke-width="2"/><path d="M10 6 C16 20 12 40 18 56 H8 V6Z" fill="#EFE6D6"/><path d="M54 6 C48 20 52 40 46 56 H56 V6Z" fill="#EFE6D6"/>',
    d_wreath:'<circle cx="32" cy="32" r="18" fill="none" stroke="#9DB07F" stroke-width="7"/>'+[0,1,2,3,4,5,6,7].map(k=>`<circle cx="${32+Math.cos(k*.785)*18}" cy="${32+Math.sin(k*.785)*18}" r="3" fill="${['#C9A07A','#E3C9A8','#C98E8E','#EFE6D6'][k%4]}"/>`).join('')+'<path d="M28 50 l4 4 l4 -4" stroke="#C9A07A" stroke-width="2" fill="none"/>',
    d_wallshelf:'<rect x="8" y="34" width="48" height="4" rx="1" fill="#C9A07A"/><rect x="12" y="20" width="8" height="14" rx="3" fill="#E4DCCF"/><circle cx="32" cy="28" r="6" fill="#D98E6C"/><ellipse cx="32" cy="22" rx="6" ry="4" fill="#7FAF6C"/><rect x="42" y="16" width="10" height="18" fill="#F0E4CF"/><path d="M42 18 H52" stroke="#C9A24A"/>',
    d_mirror:'<path d="M20 58 V22 A12 12 0 0 1 44 22 V58Z" fill="#C9A24A"/><path d="M23 56 V23 A9 9 0 0 1 41 23 V56Z" fill="#DDEEF5"/><path d="M27 30 L33 24 M27 38 L37 28" stroke="#fff" stroke-width="1.5" opacity=".8"/>',
    d_ladder:'<path d="M18 58 L24 8 M46 58 L40 8" stroke="#B98A63" stroke-width="3"/>'+[16,28,40,52].map((y,k)=>`<path d="M${19.5+k*0} ${y} H44" stroke="#C9A07A" stroke-width="3"/>`).join('')+'<rect x="26" y="8" width="8" height="8" rx="2" fill="#D98E6C"/><ellipse cx="30" cy="7" rx="5" ry="3" fill="#7FAF6C"/><rect x="34" y="31" width="6" height="9" fill="#EFE6D6"/>',
    d_monstera:'<path d="M24 44 H40 L37 58 H27Z" fill="#E8DCCB"/>'+[[-30,14],[20,18],[-5,12],[40,26],[-50,26]].map(([a,l])=>`<g transform="translate(32 44) rotate(${a})"><path d="M0 0 V${-l}" stroke="#4E7A40" stroke-width="1.5"/><ellipse cx="0" cy="${-l-8}" rx="9" ry="10" fill="#4F8A48"/><path d="M-6 ${-l-8} h4 M2 ${-l-6} h4 M-4 ${-l-12} h3" stroke="#FBF6F0" stroke-width="1.3"/></g>`).join(''),
    d_olive:'<path d="M26 46 H38 L36 58 H28Z" fill="#C98E6C"/><path d="M32 46 V18 M32 30 L24 22 M32 26 L40 18" stroke="#8C7458" stroke-width="2"/>'+[[24,20],[30,12],[38,16],[26,26],[40,24],[34,20],[22,14],[36,10]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="2" fill="#9DAF8A" transform="rotate(${x*7} ${x} ${y})"/>`).join(''),
    d_terrarium:'<rect x="10" y="12" width="44" height="40" rx="3" fill="#C9A24A"/><rect x="13" y="15" width="38" height="34" fill="#DDEEF5" opacity=".9"/><path d="M32 15 V49 M13 32 H51" stroke="#C9A24A" stroke-width="1.5"/><ellipse cx="22" cy="28" rx="5" ry="4" fill="#7FAF6C"/><ellipse cx="42" cy="44" rx="5" ry="4" fill="#9DBB88"/><circle cx="40" cy="26" r="3" fill="#EE8FA7"/><rect x="12" y="52" width="4" height="6" fill="#8C6448"/><rect x="48" y="52" width="4" height="6" fill="#8C6448"/>',
    d_jute:'<ellipse cx="32" cy="36" rx="26" ry="18" fill="#D8C29C"/>'+[0,1,2,3].map(k=>`<ellipse cx="32" cy="36" rx="${22-k*5}" ry="${15-k*3.4}" fill="none" stroke="#C4AA80" stroke-width="1.2"/>`).join(''),
    hanging:'<path d="M32 2 V18" stroke="#A08A7A"/><path d="M22 18 H42 L39 28 H25Z" fill="#E8D2B4"/>'+[0,1,2,3,4].map(k=>`<path d="M${24+k*4} 26 q${(k-2)*2} 14 ${(k-2)*3} 28" stroke="#4E7A40" fill="none"/><ellipse cx="${24+k*4+(k-2)*3}" cy="${52-(k%2)*6}" rx="2.5" ry="1.6" fill="#6FA35E"/>`).join(''),
    lights:'<path d="M4 14 Q16 26 32 14 Q48 26 60 14" stroke="#8A7B74" fill="none"/>'+[10,20,32,44,54].map((x,k)=>`<circle cx="${x}" cy="${[18,22,16,22,18][k]}" r="3.5" fill="#FFE9A8"/><circle cx="${x}" cy="${[18,22,16,22,18][k]}" r="6" fill="#FFE9A8" opacity=".3"/>`).join(''),
    sign:'<rect x="8" y="20" width="48" height="22" rx="4" fill="#FFF8EE" stroke="#E08FA4" stroke-width="2"/>'+[0,1,2,3,4,5,6].map(k=>`<circle cx="${10+k*7.3}" cy="${18-Math.sin(k/6*Math.PI)*6}" r="3" fill="${['#EE8FA7','#F5CF4E','#fff','#D9435E','#9DB8E8'][k%5]}"/>`).join('')+'<path d="M18 31 H46" stroke="#C98E9C" stroke-width="2.5" stroke-linecap="round"/>'
  };
  if(id==='bag2'||id==='bag3'){const n=id==='bag2'?12:16;return sv(`<rect x="16" y="16" width="32" height="40" rx="10" fill="#E3A04A"/><path d="M24 16 V10 a8 8 0 0 1 16 0 V16" stroke="#C98433" stroke-width="3" fill="none"/><rect x="21" y="32" width="22" height="14" rx="4" fill="#F0C27A"/><rect x="21" y="30" width="22" height="3" fill="#C98433"/><text x="32" y="44" font-size="10" text-anchor="middle" fill="#7A4A36">${n}칸</text>`)}
  if(id==='bucket4')return sv(A.bucket3);
  if(/^exp/.test(id)){const n=+id.slice(3);return sv(`<rect x="8" y="16" width="${20+n*4}" height="32" fill="#F0E4CF" stroke="#C9A07A" stroke-width="2"/><rect x="${28+n*4}" y="16" width="${8+n*4}" height="32" fill="#FBE6EA" stroke="#E08FA4" stroke-width="2" stroke-dasharray="3 2"/><path d="M${30+n*4} 32 h${n*4+2} m-4 -4 l4 4 l-4 4" stroke="#E0708C" stroke-width="2" fill="none"/>`)}
  if(id==='fridge')return sv(A.fridge);
  return sv(A[id]||'<circle cx="32" cy="32" r="16" fill="#EEE"/>');
}
/* ---------- time of day ---------- */
const SKY=[[0,'#F7D6C4'],[60,'#BFE0F4'],[330,'#A8D6F3'],[450,'#F4CFA0'],[520,'#F0A98E'],[565,'#C98FA8'],[600,'#4E4F86']];
function lerpKeys(keys,t){for(let k=0;k<keys.length-1;k++){const [t0,c0]=keys[k],[t1,c1]=keys[k+1];if(t<=t1)return mix(c0,c1,(t-t0)/(t1-t0))}return keys[keys.length-1][1]}
function skyAt(t){return lerpKeys(SKY,clamp(t,0,600))}
function ambientAt(t){
  if(t<60)return ['#FFD9C0',.14*(1-t/60)];
  if(t<330)return ['#FFFFFF',0];
  if(t<450)return ['#FFC27A',.12*(t-330)/120];
  if(t<540)return [mix('#FFC27A','#F08C7A',(t-450)/90),.12+.06*(t-450)/90];
  return [mix('#F08C7A','#2E2C5A',(t-540)/60),.18+.24*clamp((t-540)/60,0,1)];
}
function lampAt(t){return clamp((t-480)/100,0,1)}

/* ---------- illustration drawing ---------- */
const CO={wall:'#D5E8DC',wain:'#BFD8C9',wainL:'#CDE2D5',trim:'#F4EFE6',floor:'#E8CFAA',floorL:'#DABD95',floorD:'#CDAE85',
  wood:'#C4906A',woodD:'#9C6B4C',woodL:'#DDB08A',top:'#EBCFAE',metal:'#BCC7CF',metalD:'#8E9CA6',metalL:'#E3E9ED',water:'#9CCBE8',waterL:'#C6E3F4',
  leaf:'#7FAE68',leafD:'#5E8C4D',leafL:'#A6CF8C',pink:'#EE8FA7',pinkD:'#D26B87',pinkL:'#F9C9D5',yellow:'#F5CF4E',yellowD:'#E0A93A',yellowL:'#FFF0A8',
  white:'#FFFFFF',cream:'#FBF5EC',board:'#F1E3CC',skyL:'#E2F1FA',glass:'#DCEFF5',glassD:'#B9D8E3',ink:'#3B2F3F',blush:'#F2A7A6',
  paperP:'#F4B6C4',ribbon:'#E1B656',rim:'#8C6A55',twine:'#A8845C',mouth:'#C8766E',brow:'#5A4034',cork:'#D9B38C',mint:'#A7C9B8',stone:'#DCD4C6',stoneL:'#E8E1D5'};
function rr(g,x,y,w,h,r,fill){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();if(fill){g.fillStyle=fill;g.fill()}}
function el(g,x,y,rx,ry,fill,rot){g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),rot||0,0,Math.PI*2);g.fillStyle=fill;g.fill()}
function poly(g,pts,fill){g.beginPath();g.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)g.lineTo(pts[i],pts[i+1]);g.closePath();g.fillStyle=fill;g.fill()}
function ln(g,x1,y1,x2,y2,c,w){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.stroke()}
const WITHER='#B39A84';

/* flowers */
function tulipV(g,x,y,s,w){
  const c=mix(CO.pink,WITHER,w),d=mix(CO.pinkD,'#957A68',w),l=mix(CO.pinkL,'#D8C8B6',w);
  g.beginPath();g.moveTo(x-s*.56,y-s*.05);g.bezierCurveTo(x-s*.7,y-s*.75,x-s*.42,y-s*1.12,x-s*.18,y-s*1.02);g.lineTo(x,y-s*.7);g.lineTo(x+s*.18,y-s*1.02);g.bezierCurveTo(x+s*.42,y-s*1.12,x+s*.7,y-s*.75,x+s*.56,y-s*.05);g.bezierCurveTo(x+s*.4,y+s*.42,x-s*.4,y+s*.42,x-s*.56,y-s*.05);g.fillStyle=d;g.fill();
  g.beginPath();g.moveTo(x-s*.46,y);g.bezierCurveTo(x-s*.56,y-s*.8,x-s*.2,y-s*1.08,x,y-s*1.02);g.bezierCurveTo(x+s*.2,y-s*1.08,x+s*.56,y-s*.8,x+s*.46,y);g.bezierCurveTo(x+s*.32,y+s*.38,x-s*.32,y+s*.38,x-s*.46,y);g.fillStyle=c;g.fill();
  g.beginPath();g.moveTo(x-s*.24,y+s*.05);g.bezierCurveTo(x-s*.3,y-s*.62,x-s*.02,y-s*.95,x+s*.06,y-s*.9);g.bezierCurveTo(x+s*.26,y-s*.58,x+s*.26,y-s*.08,x+s*.16,y+s*.26);g.bezierCurveTo(x,y+s*.34,x-s*.16,y+s*.26,x-s*.24,y+s*.05);g.fillStyle=l;g.fill();
  if(s>2.5){ln(g,x-s*.34,y-s*.1,x-s*.3,y-s*.62,d,Math.max(.2,s*.05));ln(g,x+s*.02,y-s*.15,x+s*.06,y-s*.72,'rgba(255,255,255,.7)',Math.max(.2,s*.06))}
  el(g,x,y+s*.34,s*.14,s*.08,mix('#6E9A5A','#9C8B62',w));
}
function freesiaV(g,x,y,s,w){
  const a=mix(CO.yellow,WITHER,w),b=mix(CO.yellowL,'#E3D6BE',w),c=mix(CO.yellowD,'#A98A5E',w),gr=mix('#8DBB6A','#A5967A',w);
  g.strokeStyle=gr;g.lineWidth=Math.max(.25,s*.12);g.lineCap='round';g.beginPath();g.moveTo(x-s*.2,y+s*.3);g.quadraticCurveTo(x+s*.9,y+s*.2,x+s*1.5,y-s*.9);g.stroke();
  el(g,x+s*1.55,y-s*1.05,s*.2,s*.36,mix('#C9D98A',WITHER,w),.5);el(g,x+s*1.2,y-s*.45,s*.26,s*.4,mix(CO.yellowL,'#C9D98A',.4),.3);
  const blossom=(bx,by,r)=>{for(let k=0;k<6;k++){g.save();g.translate(bx,by);g.rotate(k*Math.PI/3+.2);el(g,0,-r*.5,r*.36,r*.54,k%2?a:b);g.restore()}el(g,bx,by,r*.28,r*.28,c);if(r>2)el(g,bx-r*.08,by-r*.08,r*.1,r*.1,'#FFF6D0')};
  blossom(x+s*.72,y-s*.08,s*.66);blossom(x,y,s);
}
function gypV(g,x,y,s,w){
  const c=mix(CO.white,'#E3D6BE',w),sh=mix('#E7E2DA','#CFC2AE',w),st=mix('#9DBF86','#A5967A',w);
  const pts=[[0,0,1],[1.3,.6,.8],[-1.2,.7,.8],[.2,-1.1,.75],[-.9,-.7,.6],[1.1,-.8,.6],[-1.7,-.1,.5],[1.8,-.2,.5],[.6,1.2,.5],[-.5,1.2,.45]];
  if(s>1.3)pts.forEach(([dx,dy])=>ln(g,x,y+s*1.6,x+dx*s,y+dy*s,st,Math.max(.15,s*.08)));
  pts.forEach(([dx,dy,r])=>{el(g,x+dx*s+s*.06,y+dy*s+s*.08,s*r*.62,s*r*.62,sh);el(g,x+dx*s,y+dy*s,s*r*.58,s*r*.58,c)});
  if(s>1.3)pts.slice(0,6).forEach(([dx,dy])=>el(g,x+dx*s,y+dy*s,s*.12,s*.12,mix('#E9DFA8',WITHER,w)));
}
function roseV(g,x,y,s,w){
  const a=mix('#B8263F',WITHER,w),b=mix('#D9435E',WITHER,w),c=mix('#F07C92',WITHER,w),d=mix('#8E1A30','#6E5A4E',w);
  el(g,x,y,s*.62,s*.56,a);for(let k=0;k<5;k++){const an=k*1.256+.3;el(g,x+Math.cos(an)*s*.3,y+Math.sin(an)*s*.26,s*.3,s*.26,k%2?b:a)}
  el(g,x,y-s*.05,s*.34,s*.3,b);if(s>2.5){g.strokeStyle=d;g.lineWidth=Math.max(.2,s*.07);g.beginPath();g.arc(x,y-s*.05,s*.17,.4,4.4);g.stroke();ln(g,x-s*.3,y-s*.3,x+s*.25,y-s*.38,c,Math.max(.2,s*.07))}
}
function hydrangeaV(g,x,y,s,w){
  const cs=[mix('#8FAEE6',WITHER,w),mix('#A9C1F0',WITHER,w),mix('#B8A6E3',WITHER,w),mix('#C9D8F6',WITHER,w)];
  el(g,x,y,s*.9,s*.78,mix('#7C97CC',WITHER,w));const r=seedRand(Math.round(x*7+y*3)+1);
  const n=s>3?12:7;for(let k=0;k<n;k++){const an=r()*6.28,rd=Math.sqrt(r())*s*.72;el(g,x+Math.cos(an)*rd,y+Math.sin(an)*rd*.85,s*.2,s*.2,cs[k%4])}
  if(s>3)for(let k=0;k<5;k++)el(g,x+(r()-.5)*s,y+(r()-.5)*s*.8,s*.05,s*.05,'#F3F6FC');
}
function flowerHead(g,t,x,y,s,f,dried){
  const w=dried?.62:wither(f);
  if(w>.25&&!dried){y+=w*s*.55;x+=(x%2?1:-1)*w*s*.3}
  if(t==='tulip')tulipV(g,x,y,s,w);else if(t==='freesia')freesiaV(g,x,y,s*.75,w);else if(t==='rose')roseV(g,x,y,s*.95,w);else if(t==='hydrangea')hydrangeaV(g,x,y,s*1.15,w);else gypV(g,x,y,s*.45,w);
  if(w>.45&&!dried&&s>2.5){el(g,x+s*.3,y+s*.6,s*.12,s*.08,'#9C7A5E')}
}
function wetSparkle(g,x,y,s){if(BAKE&&BAKE.fx){BAKE.fx.push({k:'spk',x:x-BAKE.ax,y:y-BAKE.ay,s});return}const tt=performance.now()/400+x;const a=(Math.sin(tt)+1)/2;g.globalAlpha=.35+.55*a;el(g,x,y,s*.18,s*.18,'#FFFFFF');ln(g,x-s*.35,y,x+s*.35,y,'#FFFFFF',.3);ln(g,x,y-s*.35,x,y+s*.35,'#FFFFFF',.3);g.globalAlpha=1}

/* items */
function drawItemV(g,it,x,y){
  if(it.kind==='bunch'){
    const st=it.stems,n=Math.min(5,st.length),f=avg(st.map(s=>s.f)),w=wither(f),sc=mix('#6E9A5A','#9C8B62',w);
    for(let k=0;k<n;k++){const dx=(k-(n-1)/2)*1.8;ln(g,x+dx*.25,y,x+dx,y-9-(k%2)*1.5,sc,.55)}
    if(!it.trim){el(g,x-2.4,y-4,2,.8,CO.leaf,-.6);el(g,x+2.4,y-5,2,.8,CO.leaf,.6);el(g,x-1,y-2,1.6,.7,CO.leafL,-.3)}
    for(let k=0;k<n;k++){const dx=(k-(n-1)/2)*1.8;flowerHead(g,it.t,x+dx,y-9-(k%2)*1.5,3.4,st[k].f,st[k].dried)}
    if(!it.dried&&avg(st.map(q=>q.hyd||0))>=.99)wetSparkle(g,x+2,y-11,3);
    if(st.some(s=>s.hyd>=.99))el(g,x+4.5,y-3,.8,1.2,'#7FB8E6');
  }else if(it.kind==='bouquet'){
    const st=it.stems;
    if(it.wrapped){const P=PAPERS[it.paper];poly(g,[x-7,y-9,x+7,y-9,x,y+1],P.c);poly(g,[x-7,y-9,x-2,y-8,x,y+1],P.l)}
    else{for(let k=0;k<5;k++)ln(g,x,y,x-3+k*1.5,y-8,CO.leafD,.5);ln(g,x-2,y-3,x+2,y-3,CO.twine,.9)}
    st.slice(0,9).forEach((s,k)=>{const a=k*2.4,r=k?2+ (k%3):0;flowerHead(g,s.t,x+Math.cos(a)*r*1.1,y-10+Math.sin(a)*r*.6,3,s.f)});
    if(it.wrapped){const R=RIBBONS[it.ribbon];el(g,x-1.6,y-3,1.8,1,R.c);el(g,x+1.6,y-3,1.8,1,R.c);el(g,x,y-3,.8,.8,R.d)}
  }
}

/* characters */
const EYE='#2A2230';
function hairStyleOf(p){return p.hs||(p.style==='f'?'long':'short')}
function hairBack(g,p,H,hx,hs,bob){
  if(hs==='long')rr(g,-27+hx,-118-bob,54,66,20,H);
  else if(hs==='bob')rr(g,-27+hx,-117-bob,54,44,18,H);
  else if(hs==='curly'&&p.style==='f'){for(let k=0;k<9;k++){const a=Math.PI*(.95+k*.14);el(g,hx+Math.cos(a)*27,-98-bob-Math.sin(a)*-20,9,9,H)}rr(g,-28+hx,-112-bob,56,44,18,H)}
}
function hairFrontV(g,p,H,HL,hx,t){
  const hs=hairStyleOf(p);g.save();g.translate(hx,0);
  if(hs==='bald'){el(g,-21+t*5,-98,5,9,H);el(g,21,-98,5,9,H);el(g,t*6,-118,10,3,'rgba(255,255,255,.25)');g.restore();return}
  const fem=['long','bob','pony','bun'].includes(hs)||(hs==='curly'&&p.style==='f');
  if(!fem){
    g.beginPath();g.moveTo(-26,-94);g.bezierCurveTo(-30,-126,30,-128,26,-94);g.bezierCurveTo(22,-100,14,-102,6+t*6,-100);
    g.bezierCurveTo(2+t*6,-106,-4+t*6,-108,-6+t*6,-106);g.bezierCurveTo(-12,-96,-20,-100,-26,-92);g.closePath();g.fillStyle=H;g.fill();
    if(hs==='curly')for(let k=0;k<7;k++)el(g,-22+k*7.3,-117+Math.abs(k-3)*2.2,5.5,5.5,H);
    g.strokeStyle=HL;g.lineWidth=2;[[-18,-110,-12,-116,-4,-114],[4,-116,12,-118,18,-110]].forEach(([a,b,c,d,e,h])=>{g.beginPath();g.moveTo(a,b);g.quadraticCurveTo(c,d,e,h);g.stroke()});
  }else{
    const part=1+t*8;
    g.beginPath();g.moveTo(-24,-94);g.bezierCurveTo(-27,-128,27,-128,24,-94);g.lineTo(24,-78);g.lineTo(18,-78);g.lineTo(18,-92);
    g.bezierCurveTo(14,-102,6+t*4,-104,part,-111);g.lineTo(part-2,-111);g.bezierCurveTo(-6+t*4,-104,-14,-102,-18,-92);g.lineTo(-18,-78);g.lineTo(-24,-78);g.closePath();g.fillStyle=H;g.fill();
    if(hs==='bob'||hs==='pony'||hs==='bun'){rr(g,-25,-96,8,22,4,H);rr(g,17,-96,8,22,4,H)}
    if(hs==='bun'){el(g,0,-127,11,10,H);el(g,-3,-130,4,3,HL)}
    if(hs==='curly')for(let k=0;k<7;k++)el(g,-22+k*7.3,-117+Math.abs(k-3)*2.2,5.5,5.5,H);
    g.strokeStyle=HL;g.lineWidth=2;g.beginPath();g.moveTo(-8,-118);g.quadraticCurveTo(-16,-112,-20,-100);g.stroke();g.beginPath();g.moveTo(9,-119);g.quadraticCurveTo(14,-116,17,-110);g.stroke();
  }
  g.restore();
}
function pinV(g,p,hx,t,back){
  const a=p.pin;if(!a)return;
  if(a==='band'){g.strokeStyle='#B9A2E0';g.lineWidth=4;g.beginPath();g.arc(hx,-98,25,Math.PI*1.08,Math.PI*1.92);g.stroke();return}
  const px=back?hx-15:hx+15-t*4,py=-117;
  if(a==='ribbon'){el(g,px-5,py,6,4,'#EE7F9C',-.4);el(g,px+5,py-2,6,4,'#EE7F9C',.4);el(g,px,py-1,2.4,2.4,'#C65C79')}
  else{for(let k=0;k<5;k++){const an=k*Math.PI*2/5;el(g,px+Math.cos(an)*3.6,py+Math.sin(an)*3.6,2.8,2.8,'#FFFFFF')}el(g,px,py,2.2,2.2,'#F5CF4E')}
}
function apronV(g,p,st,hw,t,back,side){
  const c=p.apron;if(!c)return;const d=mix(c,'#3B2F3F',.18);
  if(side){rr(g,6,-72,10,40,3,c);return}
  if(back){ln(g,-hw*.6+st,-76,hw*.5+st,-46,d,2.2);ln(g,hw*.6+st,-76,-hw*.5+st,-46,d,2.2);el(g,st-3,-46,4,2.5,c);el(g,st+3,-46,4,2.5,c);return}
  rr(g,-hw+4+st+t*2,-62,2*hw-8,30,4,c);rr(g,-8+st+t*3,-75,16-t*3,15,3,c);ln(g,-8+st+t*3,-75,-13+st,-80,d,1.6);ln(g,8+st,-75,13+st,-80,d,1.6);
  rr(g,-6+st+t*3,-52,12-t*2,8,2,d);g.fillStyle=c;g.fillRect(-5+st+t*3,-51,10-t*2,6);
}
function slimHead(g,hx,t,col,sh){
  const w=21*(1-.14*t),chinX=hx+t*6;g.beginPath();g.moveTo(hx-w+t*2,-100);g.bezierCurveTo(hx-w,-127,hx+w,-127,hx+w,-100);g.bezierCurveTo(hx+w+1,-87,chinX+11,-77.5,chinX,-75.5);g.bezierCurveTo(chinX-11,-77.5,hx-w+t*2,-87,hx-w+t*2,-100);g.fillStyle=col;g.fill();
  if(t>0){g.strokeStyle=sh;g.globalAlpha=.45;g.lineWidth=1.2;g.beginPath();g.moveTo(hx-w+t*3,-92);g.bezierCurveTo(hx-w+t*4,-86,chinX-8,-79,chinX,-76.5);g.stroke();g.globalAlpha=1}
}
function hatV(g,p,hx,t,back){
  const a=p.hat||(p.acc!=='glasses'&&p.acc);if(!a)return;const hc=p.hat?'#C65C79':mix(p.tee,'#3B2F3F',.15);
  if(a==='beret'){el(g,hx-3,-120,25,9,'#C65C79',-.12);el(g,hx-3,-124,20,6,'#D8738F',-.12);el(g,hx-2,-130,2.2,2.2,'#A84C66');return}
  if(a==='cap'&&p.hat){el(g,hx,-114,26,15,'#5C7FB8');g.fillStyle='#5C7FB8';g.fillRect(hx-26,-114,52,6);if(!back)el(g,hx+t*12,-104,21-t*4,5,'#46679C');return}
  if(a==='beanie'&&p.hat){rr(g,hx-26,-132,52,32,17,'#E3A04A');rr(g,hx-27,-108,54,9,4,'#F0C27A');el(g,hx,-134,6,6,'#FFF1D6');return}
  if(a==='cap'){el(g,hx,-114,26,15,hc);g.fillRect(hx-26,-114,52,6);if(!back)el(g,hx+t*12,-104,21-t*4,5,mix(hc,'#000',.12));el(g,hx,-127,2.5,2,mix(hc,'#fff',.3))}
  else if(a==='sunhat'){el(g,hx,-110,40,9,'#E9D3A4');rr(g,hx-19,-132,38,24,11,'#F0DEB4');g.fillStyle='#E07A7A';g.fillRect(hx-19,-114,38,4);el(g,hx+14,-112,4,3,'#F9C9D5')}
  else if(a==='beanie'){rr(g,hx-26,-132,52,32,17,hc);rr(g,hx-27,-108,54,9,4,mix(hc,'#fff',.25));el(g,hx,-134,6,6,mix(hc,'#fff',.4))}
  else if(a==='bow'&&!back){el(g,hx+14,-118,6,4,'#EE7F9C',-.4);el(g,hx+24,-121,6,4,'#EE7F9C',.4);el(g,hx+19,-119,2.5,2.5,'#C65C79')}
}
function faceV(g,p,glasses,fx,t){
  const ey=-94,f=p.style==='f',ex=p.expr||'smile';
  const eL=-9+fx+t*7,eR=9+fx+t*2,sq=1-.42*t;
  if(p.blush!==false){const bx=p.face==='slim'?11.5:14;g.globalAlpha=.36;if(t<.5)el(g,-bx+fx+t*9,-85,3.2*sq,1.9,CO.blush);el(g,bx+fx-t*3,-85,3.2,1.9,CO.blush);g.globalAlpha=1}
  [[eL,sq],[eR,1]].forEach(([x,s])=>{
    if(ex==='sleepy'){g.strokeStyle=EYE;g.lineWidth=1.8;g.beginPath();g.arc(x,ey+1,3.4*s,Math.PI*1.1,Math.PI*1.9);g.stroke()}
    else{el(g,x,ey,2.8*s,ex==='wow'?4.2:3.6,EYE);el(g,x-.9*s,ey-1.4,1,1,'#fff')}
    if(f&&ex!=='sleepy'){g.strokeStyle=EYE;g.lineWidth=1.3;g.beginPath();g.arc(x,ey-.4,4.2*s,Math.PI*1.1,Math.PI*1.9);g.stroke()}
    if(!f||ex==='wow'){g.strokeStyle=CO.brow;g.lineWidth=1.7;const by=ex==='wow'?-104:-102;g.beginPath();g.moveTo(x-3.5*s,by);g.lineTo(x+3.5*s,by-.6);g.stroke()}
  });
  if(t>0){g.strokeStyle=p.skinSh||'#D3A284';g.globalAlpha=.55;g.lineWidth=1;g.beginPath();g.arc(fx+t*11,-89,1.6,-Math.PI*.3,Math.PI*.4);g.stroke();g.globalAlpha=1}
  if(glasses||p.acc==='glasses'){const gold=glasses==='gold';
    [[eL,sq],[eR,1]].forEach(([x,s])=>{if(gold){g.beginPath();g.ellipse(x,ey,6.5*s,6.5,0,0,7)}else rr(g,x-7.5*s,ey-6,15*s,12,4.5);g.fillStyle='rgba(220,236,246,.2)';g.fill();g.strokeStyle=gold?'#C9A24A':CO.ink;g.lineWidth=gold?1.3:2.2;g.stroke();
      g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.1;g.beginPath();g.moveTo(x-4.5*s,ey-3.5);g.lineTo(x-2*s,ey-4.6);g.stroke()});
    const gc=gold?'#C9A24A':CO.ink;ln(g,eL+7*sq,ey-1,eR-7,ey-1,gc,gold?1.2:2);if(t>0)ln(g,eL-7*sq,ey-2,eL-11,ey-3,gc,1.4);
  }
  const mx=fx+t*6;g.strokeStyle=f?'#D9788A':CO.mouth;g.lineWidth=1.6;
  if(ex==='grin'){g.beginPath();g.moveTo(mx-4,-86);g.quadraticCurveTo(mx,-79,mx+4,-86);g.closePath();g.fillStyle='#B85C62';g.fill();el(g,mx,-82.5,2,1.2,'#F29AA3')}
  else if(ex==='calm'){ln(g,mx-2.5,-85,mx+2.5,-85,g.strokeStyle,1.5)}
  else if(ex==='wow'){el(g,mx,-84,2.2,2.8,'#B85C62')}
  else{g.beginPath();g.arc(mx,-85,3,Math.PI*.15,Math.PI*.85);g.stroke()}
}
function drawChar(g,x,y,p,dir,phase,moving,glasses,work,sit){
  if(BAKE&&BAKE.onChar){BAKE.onChar({x,y,p,dir,phase,moving,glasses,work,sit});return}
  const an=typeof dir==='number'?dir:(DIR_ANG[dir]||0);let q=Math.round(an/(Math.PI/8));if(q<=-8)q=8;if(q>8)q-=16;
  const aq=Math.abs(q),kk=aq<=4?aq:8-aq;const t=kk/4;
  const side=aq===4,back=aq>4,flip=q<0;
  const sw=moving?Math.sin(phase):0,bob=moving?Math.abs(Math.cos(phase))*3.6:(CHT?CHT.bob:Math.sin(performance.now()/600+(x%7))*1.1),hs=moving?Math.sin(phase+1)*2.4:0,wk=work?(CHT?CHT.wk:Math.sin(performance.now()/90)*.18):0;
  const limb=(sx,sy,ua,fa,fs,col,sleeve,hand)=>{
    g.save();g.translate(sx,sy);g.scale(1,fs);g.rotate(ua);
    rr(g,-4.6,-1,9.2,17.5,4.6,col);g.translate(0,15.5);g.rotate(fa);rr(g,-4.1,-1.5,8.2,15,4.1,col);
    el(g,0,15,hand*.95,hand*1.1,col);el(g,hand*.55,13.5,hand*.35,hand*.5,mix(col,'#000',.06));
    g.restore();
    g.save();g.translate(sx,sy);g.scale(1,fs);g.rotate(ua);rr(g,-6.3,-4.5,12.6,13,6,sleeve);g.fillStyle='rgba(0,0,0,.06)';g.fillRect(-6.3,6.5,12.6,2);g.restore();
  };
  const f=p.style==='f',H=p.hair,HL=p.hairHi,teeL=mix(p.tee,'#FFFFFF',.2),dark=mix(p.pants,'#000000',.18),style=hairStyleOf(p);
  const sc=.25*(p.sc||1),slim=p.face==='slim',gl=glasses||p.glasses;
  const headT=(hx)=>{if(slim){g.save();g.translate(hx,-102);g.scale(.92,.92);g.translate(-hx,98)}};const headR=()=>{if(slim)g.restore()};
  g.save();g.translate(x,y);g.scale(sc*(flip?-1:1),sc);
  el(g,0,0,26,6,'rgba(80,55,50,.16)');
  if(side){
    if(style==='long')rr(g,-24-Math.abs(hs),-116-bob-(slim?4:0),28,64,14,H);
    if(style==='pony'){g.save();g.translate(-18,-108-bob);g.rotate(.35+hs*.05);rr(g,-5,0,10,34,5,H);g.restore()}
    const a=sw*8;
    rr(g,-7+a,-40,13,36,5,dark);el(g,3+a,-4,11,5,mix(p.shoe,'#000',.08));
    rr(g,-6-a,-40,13,36,5,p.pants);el(g,4-a,-4,11,5,p.shoe);
    g.translate(0,-bob);
    {const s2=-sw;limb(-1,-71,work?-.7:-s2*.55,work?-.85:-(.12+.3*Math.max(0,s2)),1,p.skinSh,mix(p.tee,'#000',.1),4.6)}
    if(p.pack)rr(g,-26,-74,12,30,5,'#E3A04A');
    poly(g,[-16,-76,14,-76,16,-36,-18,-36],p.tee);g.fillStyle=p.teeSh;g.fillRect(-18,-42,34,6);
    apronV(g,p,0,0,0,false,true);
    if(slim)rr(g,-4,-90,9,18,3,p.skinSh);else rr(g,-5,-84,10,10,3,p.skinSh);
    limb(0,-71,work?-.75+wk:-sw*.55,work?-.85:-(.12+.3*Math.max(0,sw)),1,p.skin,p.tee,4.8);
    headT(2);
    if(slim){el(g,1,-101,20,21,p.skin);g.beginPath();g.moveTo(-14,-94);g.quadraticCurveTo(-2,-76,14,-76.5);g.quadraticCurveTo(23,-77,23,-85);g.quadraticCurveTo(24,-92,21,-100);g.lineTo(0,-106);g.closePath();g.fillStyle=p.skin;g.fill();g.strokeStyle=p.skinSh;g.globalAlpha=.4;g.lineWidth=1.1;g.beginPath();g.moveTo(-6,-86);g.quadraticCurveTo(2,-78,15,-77.3);g.stroke();g.globalAlpha=1;el(g,24,-93,2.6,2.6,p.skin)}
    else{el(g,4,-98,22,24,p.skin);el(g,25,-93,3.2,3,p.skin)}
    if(style==='bald'){el(g,-8,-96,14,12,H);el(g,2,-112,14,8,'rgba(255,255,255,.2)')}
    else{
      el(g,-6,-100,20,24,H);
      g.beginPath();g.moveTo(-22,-96);g.bezierCurveTo(-24,-126,26,-130,24,-102);g.bezierCurveTo(18,-104,10,-101,5,-105);g.bezierCurveTo(1,-98,-6,-94,-7,-82);g.lineTo(-22,-82);g.closePath();g.fillStyle=H;g.fill();
      if(style==='long'||style==='bob')rr(g,-12,-104,12,style==='bob'?30:46,6,H);else el(g,-1,-94,4,5.5,p.skinSh);
      if(style==='bun')el(g,-10,-124,10,9,H);
      if(style==='curly')for(let k=0;k<5;k++)el(g,-16+k*8,-120+Math.abs(k-2)*2,5.5,5.5,H);
      g.strokeStyle=HL;g.lineWidth=2;g.beginPath();g.moveTo(-10,-118);g.quadraticCurveTo(4,-124,16,-114);g.stroke();
    }
    const ex=p.expr||'smile';
    if(ex==='sleepy'){g.strokeStyle=EYE;g.lineWidth=1.6;g.beginPath();g.arc(14,-93,3,Math.PI*1.1,Math.PI*1.9);g.stroke()}else{el(g,14,-94,2.5,3.4,EYE);el(g,13.3,-95.4,.9,.9,'#fff')}
    if(f){g.strokeStyle=EYE;g.lineWidth=1.3;g.beginPath();g.arc(14,-94.4,4,Math.PI*1.2,Math.PI*1.9);g.stroke()}else ln(g,11,-102,17,-102.6,CO.brow,1.8);
    if(p.blush!==false){g.globalAlpha=.38;el(g,12,-85,3,1.8,CO.blush);g.globalAlpha=1}
    g.strokeStyle=f?'#D9788A':CO.mouth;g.lineWidth=1.5;g.beginPath();g.arc(19,-85,2.2,Math.PI*.1,Math.PI*.7);g.stroke();
    if(gl||p.acc==='glasses'){const gold=gl==='gold';if(gold){g.beginPath();g.ellipse(14.5,-94,6,6.5,0,0,7)}else rr(g,7.5,-100,14,12,4.5);g.fillStyle='rgba(220,236,246,.2)';g.fill();g.strokeStyle=gold?'#C9A24A':CO.ink;g.lineWidth=gold?1.3:2.2;g.stroke();ln(g,8,-96,-5,-98,gold?'#C9A24A':CO.ink,gold?1.2:2)}
    if(p.pin==='band'){g.strokeStyle='#B9A2E0';g.lineWidth=4;g.beginPath();g.arc(2,-100,23,Math.PI*1.15,Math.PI*1.75);g.stroke()}else if(p.pin){const px=-6,py=-118;if(p.pin==='ribbon'){el(g,px-4,py,5,3.5,'#EE7F9C',-.4);el(g,px+4,py-1,5,3.5,'#EE7F9C',.4);el(g,px,py,2,2,'#C65C79')}else{for(let k=0;k<5;k++){const an=k*Math.PI*2/5;el(g,px+Math.cos(an)*3.2,py+Math.sin(an)*3.2,2.5,2.5,'#FFFFFF')}el(g,px,py,2,2,'#F5CF4E')}}
    hatV(g,p,2,.9,false);
    headR();
  }else{
    const bw=1-.4*t,st=t*6,hx=st+t*5;
    if(!back){headT(hx);hairBack(g,p,H,hx-t*5+hs*.4,style,bob);headR()}
    const lA=sw>0?sw*7:0,lB=sw<0?-sw*7:0;
    const lX=-9*bw+st,rX=9*bw+st;
    if(sit){rr(g,lX-7,-42,14,back?10:16,5,p.pants);rr(g,rX-7,-42,14,back?10:16,5,p.pants);if(!back){el(g,lX,-26,9,5,p.shoe);el(g,rX,-26,9,5,p.shoe)}}
    else{rr(g,lX-7,-40-lA-t*2,14,36,5,t>0?dark:p.pants);el(g,lX+t*2,-4-lA-t*2,11,5.5,p.shoe,t*.5);rr(g,rX-7,-40-lB,14,36,5,p.pants);el(g,rX+t*3,-4-lB,11,5.5,p.shoe,t*.5)}
    g.translate(0,-bob);
    const hw=21*(1-.34*t);const farBehind=t>=.5;
    const armFB=(sd,s,col,sleeve)=>{
      const sx=sd<0?-hw+.5+st+t*7:hw-.5+st;
      if(work){limb(sx,-71,sd<0?.1:-.1-t*.4,sd<0?-1.25-wk:1.25+wk,.85,col,sleeve,5);return}
      const fwd=Math.max(0,s),bk=Math.max(0,-s);
      const fs=1-.22*fwd-.08*bk,hand=5+1.1*fwd*(back?-.5:1);
      let ua=(sd<0?.08:-.08)-s*.42*t,fa=(sd<0?-1:1)*(.1+.28*fwd)-(t>0?.2*fwd*t:0);
      limb(sx,-71+fwd*1.5,ua,fa,fs,col,sleeve,hand);
    };
    const sL=-sw,sR=sw;
    if(farBehind)armFB(-1,sL,p.skinSh,mix(p.tee,'#000',.1));
    if(back&&p.pack){}
    poly(g,[-hw+st,-76,hw+st,-76,hw+2+st,-36,-hw-2+st,-36],p.tee);
    g.fillStyle=p.teeSh;g.fillRect(-hw-2+st,-42,2*hw+4,6);if(!back){g.fillStyle=teeL;g.fillRect(-hw+4+st+t*4,-72,5,24)}
    if(t>0){g.fillStyle='rgba(0,0,0,.06)';g.fillRect(back?hw-6+st:-hw+st,-76,6,40)}
    apronV(g,p,st,hw,t,back,false);
    if(!farBehind)armFB(-1,sL,back?p.skinSh:p.skin,p.tee);
    armFB(1,sR,back?p.skinSh:p.skin,p.tee);
    if(slim)rr(g,-4.5+st,-90,9,18,3,p.skinSh);else rr(g,-5+st,-84,10,10,3,p.skinSh);
    headT(hx);
    if(back){
      if(p.pack)rr(g,-15+st-t*4,-74,30*(1-.2*t),30,8,'#E3A04A');
      if(t>0){el(g,22+hx,-96,4.5,6,p.skinSh);el(g,16+hx+t*4,-90,3+t*5,8+t*4,p.skin)}else{el(g,-23,-96,4.5,6,p.skinSh);el(g,23,-96,4.5,6,p.skinSh)}
      if(style==='bald'){el(g,hx,-99,25,25,p.skin);el(g,hx,-94,26,12,H);el(g,hx-4,-112,10,5,'rgba(255,255,255,.22)')}
      else{el(g,hx-t*2,-99,26-t*2,26,H);
        if(style==='long')rr(g,-27+hx-t*3+hs,-118,54-t*6,58,20,H);
        if(style==='bob')rr(g,-27+hx-t*3,-116,54-t*6,40,18,H);
        if(style==='pony'){el(g,hx,-110,8,6,mix(H,'#E07A7A',.5));g.save();g.translate(hx-t*3,-108);g.rotate(hs*.04);rr(g,-6,0,12,38,6,H);g.restore()}
        if(style==='bun')el(g,hx,-124,11,10,H);
        if(style==='curly')for(let k=0;k<8;k++){const a=Math.PI*(1.05+k*.12);el(g,hx+Math.cos(a)*24,-99+Math.sin(a)*24,6,6,H)}
        g.strokeStyle=HL;g.lineWidth=2;g.beginPath();g.moveTo(-12+hx,-116);g.quadraticCurveTo(hx,-124,12+hx,-116);g.stroke()}
      pinV(g,p,hx,t,true);hatV(g,p,hx,t,true);
      if(p.num){g.save();if(flip)g.scale(-1,1);const tx=(flip?-1:1)*(st-t*6);g.fillStyle='#FFFFFF';g.textAlign='center';g.textBaseline='alphabetic';
        g.save();g.translate(tx,0);g.scale(1-.3*t,1);
        if(f){g.font="8px 'Jua','Gowun Dodum',sans-serif";g.fillText(p.name,0,-50);g.font="bold 12px 'Jua','Gowun Dodum',sans-serif";g.fillText(p.num,0,-39)}
        else{g.font="9px 'Jua','Gowun Dodum',sans-serif";g.fillText(p.name,0,-60);g.font="bold 17px 'Jua','Gowun Dodum',sans-serif";g.fillText(p.num,0,-44)}
        g.restore();g.restore()}
    }else{
      if(p.pack){ln(g,-12+st,-76,-10+st,-50,'#C98433',3);ln(g,12+st,-76,10+st,-50,'#C98433',3)}
      if(t>0)el(g,-22+hx+t*6,-96,4.5,6,p.skinSh);else{el(g,-(f?22:25),-96,4.5,6,p.skinSh);el(g,f?22:25,-96,4.5,6,p.skinSh)}
      if(slim)slimHead(g,hx,t,p.skin,p.skinSh);else el(g,hx,-98,(f?22:25)*(1-.14*t),f?25:23,p.skin);
      if(t>0){g.fillStyle='rgba(0,0,0,.05)';el(g,hx-14,-96,8,16,'rgba(0,0,0,.04)')}
      hairFrontV(g,p,H,HL,hx,t);
      faceV(g,p,gl,hx+t*7,t);
      pinV(g,p,hx,t,false);hatV(g,p,hx,t,false);
    }
    headR();
  }
  g.restore();
}
function drawCat(g,c){
  const flip=c.dir==='left',side=c.dir==='left'||c.dir==='right',t=performance.now()/1000,gr='#9C9AA0',wh='#F6F4F0',dk='#6E6C72';
  g.save();g.translate(c.x,c.y);if(flip)g.scale(-1,1);el(g,0,0,5.5,1.5,'rgba(80,55,50,.16)');
  const tail=Math.sin(t*3)*.5;
  if(c.state==='sleep'){el(g,0,-3,6,3.6,gr);el(g,-2,-3.5,3,2.2,wh);el(g,4.2,-4,3,2.6,gr);poly(g,[3,-6,4,-8.2,5.2,-6],gr);poly(g,[5.5,-6,6.6,-8,7,-5.5],gr);ln(g,3.3,-4,4.6,-4,'#3B3440',.4);ln(g,5.4,-4,6.6,-4,'#3B3440',.4);g.strokeStyle=gr;g.lineWidth=1.3;g.beginPath();g.arc(0,-3,6.3,.3,1.8);g.stroke();
    g.fillStyle='#8A7F96';g.font='3px sans-serif';g.fillText('z',6+Math.sin(t*2)*1,-10-((t*4)%4));g.restore();return}
  const sit=c.state!=='walk',sw=c.mv?Math.sin(c.walk*1.4):0;
  if(side){
    g.save();g.translate(-4.5,-4);g.rotate(-1+tail*.6);g.strokeStyle=gr;g.lineWidth=1.4;g.lineCap='round';g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-3,-4,-1,-8);g.stroke();g.restore();
    if(!sit)[[-3,sw],[3,-sw]].forEach(([lx,s])=>rr(g,lx-.7+s*.7,-3.4,1.4,3.4,.6,dk));
    el(g,0,sit?-4:-4.4,sit?4:5,sit?3.4:2.7,gr);el(g,.5,sit?-3.4:-3.8,2.8,1.8,wh);
    if(!sit)[[-2,-sw],[2,sw]].forEach(([lx,s])=>rr(g,lx-.7+s*.7,-3.2,1.4,3.2,.6,wh));else{el(g,2.5,-.8,1.2,.8,wh);el(g,-2,-.8,1.4,.8,gr)}
    const hy=sit?-8.5:-7.2;el(g,4,hy,3.2,2.9,gr);el(g,4.8,hy+1,2.2,1.6,wh);poly(g,[2.2,hy-1.8,2.8,hy-4.4,4.2,hy-2.4],gr);poly(g,[4.6,hy-2.4,6,hy-4.3,6.4,hy-1.6],gr);poly(g,[2.8,hy-2,3,hy-3.4,3.8,hy-2.4],'#F2B8C6');
    el(g,5.4,hy-.4,.75,.85,'#F0C33C');el(g,5.5,hy-.4,.28,.6,'#2A2230');el(g,7,hy+.9,.35,.3,'#E88FA0');
  }else{
    const back=c.dir==='up';
    g.save();g.translate(0,-2.5);g.rotate(tail);g.strokeStyle=gr;g.lineWidth=1.4;g.lineCap='round';g.beginPath();g.moveTo(back?0:3,0);g.quadraticCurveTo(back?3:6,-3,back?1:5,-7);g.stroke();g.restore();
    el(g,0,-3.6,3.8,3.6,gr);if(!back)el(g,0,-3,2.4,2.6,wh);
    const hy=-8.3;el(g,0,hy,3.4,3,gr);poly(g,[-3,hy-1,-2.6,hy-4.2,-1,hy-2.2],gr);poly(g,[3,hy-1,2.6,hy-4.2,1,hy-2.2],gr);
    if(!back){el(g,0,hy+1.1,2,1.4,wh);poly(g,[-2.6,hy-1.4,-2.4,hy-3.3,-1.5,hy-2],'#F2B8C6');poly(g,[2.6,hy-1.4,2.4,hy-3.3,1.5,hy-2],'#F2B8C6');
      el(g,-1.3,hy-.2,.8,.9,'#F0C33C');el(g,1.3,hy-.2,.8,.9,'#F0C33C');el(g,-1.3,hy-.2,.3,.65,'#2A2230');el(g,1.3,hy-.2,.3,.65,'#2A2230');el(g,0,hy+.8,.35,.28,'#E88FA0');
      if(c.state==='groom'){el(g,-1.8,hy+2,1,1.3,wh)}}
    else el(g,0,hy-.6,2.2,1.3,'#8A888E');
    if(!sit){rr(g,-2.2+sw*.6,-1.2,1.4,1.6,.6,wh);rr(g,.8-sw*.6,-1.2,1.4,1.6,.6,wh)}else{el(g,-1.3,-.6,1.1,.7,wh);el(g,1.3,-.6,1.1,.7,wh)}
  }
  g.restore();
  const hs=(performance.now()-(c.hearts||0))/1000;if(hs<2.2||c.talking){for(let k=0;k<3;k++){const p=((hs*.8+k/3)%1);g.globalAlpha=1-p;const hx=c.x-3+k*3,hy=c.y-14-p*10;el(g,hx-.6,hy,.8,.8,'#E0708C');el(g,hx+.6,hy,.8,.8,'#E0708C');poly(g,[hx-1.4,hy+.2,hx+1.4,hy+.2,hx,hy+1.8],'#E0708C');g.globalAlpha=1}}
}
function drawDog(g,d){
  const dir=d.dir,flip=dir==='left'||dir==='ul'||dir==='dl',sw=d.mv?Math.sin(d.walk*1.4):0,c=d.col,dk=mix(c,'#3B2F3F',.3);
  g.save();g.translate(d.x,d.y);if(flip)g.scale(-1,1);
  el(g,0,0,5,1.4,'rgba(80,55,50,.16)');
  const side=dir==='left'||dir==='right'||dir==='dl'||dir==='dr'||dir==='ul'||dir==='ur';
  if(side){
    [[-3,sw],[3,-sw]].forEach(([lx,s])=>{rr(g,lx-.7+s*.8,-3.5,1.4,3.5,.6,dk)});
    el(g,0,-4.5,5,2.8,c);el(g,4.5,-7,2.6,2.3,c);el(g,6.4,-6.5,1.2,.9,dk);el(g,3.6,-8.2,1,1.8,dk,.3);el(g,5.2,-7.6,.45,.45,'#2A2230');if(c==='#2A2626'){el(g,5.3,-7.75,.18,.18,'#FFFFFF');el(g,6.4,-6.6,.5,.4,'#4A3F48')}
    g.save();g.translate(-4.6,-5.5);g.rotate(-.6+Math.sin(performance.now()/120)*.35);rr(g,-.5,-3,1,3.2,.5,c);g.restore();
    [[-2,-sw],[2,sw]].forEach(([lx,s])=>{rr(g,lx-.7+s*.8,-3.2,1.4,3.2,.6,c)});
  }else{
    rr(g,-2.2,-3.5,1.4,3.5,.6,dk);rr(g,.8,-3.5,1.4,3.5,.6,dk);el(g,0,-4.8,3.4,3,c);
    if(dir!=='up'){el(g,0,-8,2.7,2.4,c);el(g,-2.2,-8.8,.9,1.8,dk);el(g,2.2,-8.8,.9,1.8,dk);el(g,-.9,-8.2,.45,.45,'#2A2230');el(g,.9,-8.2,.45,.45,'#2A2230');el(g,0,-7,.6,.45,'#2A2230');if(c==='#2A2626'){el(g,-.8,-8.35,.18,.18,'#FFFFFF');el(g,1,-8.35,.18,.18,'#FFFFFF');el(g,0,-7.1,.5,.35,'#4A3F48')}}
    else{el(g,0,-8,2.6,2.3,c);g.save();g.translate(0,-5);g.rotate(Math.sin(performance.now()/120)*.4);rr(g,-.5,-3,1,3,.5,c);g.restore()}
  }
  g.restore();
}
function handPos(c){
  if(c.rest)return [c.x,c.y-12,false];
  const d=c.dir;const sg=(d==='left'||d==='dl'||d==='ul')?-1:1;
  if(d==='up'||d==='ul'||d==='ur')return [c.x+(d==='up'?0:sg*1.5),c.y-13,true];
  if(d==='left'||d==='right')return [c.x+sg*7,c.y-12,false];
  return [c.x+(d==='down'?0:sg*2.5),c.y-11,false];
}



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
function prFullZoom(area){const H=Math.max(1,CH-48);return Math.min(CW/VW,H/VH)*(area==='town'||area==='north'?.85:1)}
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
  if(!e){if(T.exists(key))T.remove(key);const t=T.createCanvas(key,w,h);e={key,w,h,t,g:t.getContext(),used:PR.frame};PR.tex.set(key,e)}
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
/* 그리기 중간에 캔버스를 바꿔 끼우는 대리 객체(점원을 따로 떼어 내기 위함) */
function prProxy(){
  let tgt=null;
  const P=new Proxy({},{get(_,k){const v=tgt[k];return typeof v==='function'?v.bind(tgt):v},set(_,k,v){tgt[k]=v;return true}});
  return {P,get:()=>tgt,set:t=>{if(tgt&&t){t.setTransform(tgt.getTransform());['globalAlpha','fillStyle','strokeStyle','lineWidth','lineCap','lineJoin','font','textAlign','textBaseline','globalCompositeOperation'].forEach(k=>{t[k]=tgt[k]})}tgt=t}};
}

/* ---------- 구울 때의 크기(측정값 + 여유) ---------- */
const PR_STB={storage:[0,-36,0,4.5],wardrobe:[-2,-38.5,0,3.5],bucket:[0,-24,0,1],craft:[-.3,-26,.3,3.3],wrap:[-.3,-23,.3,3.3],dryer:[0,-27,0,2],trim:[0,-14,0,2.5],board:[0,-12,0,2],trash:[0,-4,0,1],counter:[0,-24,0,3.5],phone:[0,-8,0,1],pickup:[0,-24,0,2],display:[0,-24,0,3.5],stall:[-.8,-28,.3,5.3],seedstall:[-.3,-32,.3,5.3],keeper:[0,-29,0,3.5],bench:[0,-3,0,1],plot:[0,-20,0,1],sprspot:[-14,-14,14,8],shelf:[0,-14,0,2]};
const PR_DEB={tree:[-4,-23,4.8,2],lamp:[0,-28,0,0],table:[-6.5,-12,6.5,1.5],waitbench:[0,-4,0,1],bigplant:[-4,-13,4,.8],easel:[0,-9,0,.5],crate:[0,-6,1.5,.8],planterTree:[0,-14,0,.8],bucketRow:[-.3,-10,0,1],boxes:[0,-7,0,1],tallshelf:[0,-26,0,3],tooltable:[-.3,-4,.3,3.3],pottable:[-.3,-3,.3,3.3],fridgeDemo:[0,-20,0,1.8],seedRack:[0,-14,0,.8],canRack:[0,-14,0,.8],clocktower:[0,-80,.8,2],fenceH:[-1,-2,2,2],fenceV:[0,0,0,0],shed:[0,-4,0,2.5],mailbox:[0,-3,0,0],planterBox:[0,-6,0,1],hoursSign:[-.5,-9,.5,.5],school:[-8,-92,32,8],schoolclock:[-4,-126,4,0],playmat:[0,-4,0,0],swing:[0,-16,0,2],slide:[0,-20,1,1],sandbox:[0,0,0,0]};
function prBounds(tab,type,x,y,w,h){const b=tab[type]||[-12,-44,12,8];return [x+Math.min(0,b[0])-8,y+Math.min(0,b[1])-12,w+Math.max(0,b[2])-Math.min(0,b[0])+16,h+Math.max(0,b[3])-Math.min(0,b[1])+18]}

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
function prHideRec(rec){['imgs','cimgs','fimgs'].forEach(k=>(rec[k]||[]).forEach(o=>o.setVisible(false)));if(rec.sub)rec.sub.forEach(prHideRec)}
function prKillRec(rec){for(const k of [...PR.tex.keys()])if(k.startsWith('L|'+rec.id+'|')){PR.sc.textures.remove(k);PR.tex.delete(k)}['imgs','cimgs','fimgs'].forEach(k=>(rec[k]||[]).forEach(o=>o.destroy()));for(let i=0;i<(rec.nl||0);i++){const k=rec.id+'|'+i;if(PR.sc.textures.exists(k))PR.sc.textures.remove(k);PR.tex.delete(k)}if(rec.sub)rec.sub.forEach(prKillRec)}

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
  prPlaceStatic(r,area,depth);
}
function prSyncArea(area){
  const S0=[];
  /* 바닥 러그 등(맨 아래) */
  DECOR[area].forEach((d,k)=>{if(d.flat&&d.walk&&!d.carried&&inView((d.x+d.w/2)*TILE,(d.y+d.h)*TILE,d.w*8+20))
    prSyncStatic('d'+prOid(d),area,-1.5e6+k,()=>prDecSig(d,area),g=>drawDecor(g,d),()=>prBounds(PR_DEB,d.t,d.x*TILE,d.y*TILE,d.w*TILE,d.h*TILE))});
  stationsIn(area).forEach(s=>{if(!inView((s.x+s.w/2)*TILE,(s.y+s.h)*TILE,s.w*8+30))return;
    prSyncStatic('s'+s.id,area,(s.y+s.h)*TILE-(s.type==='bench'?6:2),()=>prStSig(s),g=>drawStationV(g,s),()=>prBounds(PR_STB,s.type,s.x*TILE,s.y*TILE,s.w*TILE,s.h*TILE))});
  DECOR[area].forEach(d=>{if(d.flat||d.carried||!inView((d.x+d.w/2)*TILE,(d.y+d.h)*TILE,d.w*8+(d.t==='school'?120:40)))return;
    prSyncStatic('d'+prOid(d),area,(d.y+d.h)*TILE-2,()=>prDecSig(d,area),g=>drawDecor(g,d),()=>prBounds(PR_DEB,d.t,d.x*TILE,d.y*TILE,d.w*TILE,d.h*TILE))});
}

/* ---------- 배경·조명 ---------- */
function prArea(area){
  let a=PR.areaObj[area];if(a)return a;
  a=PR.areaObj[area]={bg:prW(PR.sc.add.image(AOFF[area],0,'__DEFAULT').setOrigin(0,0).setDepth(-3e6)),bgKey:null,
    amb:prW(PR.sc.add.rectangle(AOFF[area],0,AREAS[area].w*TILE,AREAS[area].h*TILE,0xffffff,0).setOrigin(0,0).setDepth(5e6)),lights:[]};
  return a;
}
function prSyncBg(area){
  const a=prArea(area);const s=prFullZoom(area);const cv=bgCanvas(area,s);
  let key=OIDS.get(cv);if(key==null){key='bg|'+(++OIDN);OIDS.set(cv,key);PR.sc.textures.addCanvas(key,cv)}
  if(a.bgKey!==key){const old=a.bgKey,oc=a.bgCv;a.bg.setTexture(key);a.bgKey=key;a.bgCv=cv;if(old&&PR.sc.textures.exists(old))PR.sc.textures.remove(old);if(oc)OIDS.delete(oc)}
  a.bg.setScale(AREAS[area].w*TILE/cv.width,AREAS[area].h*TILE/cv.height).setVisible(true);
  const [ac,aa]=ambientAt(S.t);const k=area==='town'?1:.7;const [col]=prCol(ac);
  a.amb.width=AREAS[area].w*TILE;a.amb.setFillStyle(col,1).setAlpha(aa*k).setVisible(aa>0);
  const L=lampAt(S.t);const ls=L>0?lightsFor(area):[];const r=(area==='town'||area==='north'?55:80);
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
  Object.keys(PR.areaObj).forEach(a=>{if(!areas[a]){const o=PR.areaObj[a];o.bg.setVisible(false);o.amb.setVisible(false);o.lights.forEach(l=>l.setVisible(false))}});
  for(const a in areas){VIEW=areas[a];RENDER_SCALE=prBakeScale(a);prSyncBg(a);prSyncDyn(a);prSyncArea(a);prSyncChars(a);VIEW=null}
  Object.keys(PR.areaObj).forEach(a=>{if(areas[a])return;const o=PR.areaObj[a];if(o.gu)o.gu.setVisible(false);if(o.gd)o.gd.setVisible(false)});
  for(const r of PR.recs.values()){if(r.seen!==PR.frame){prHideRec(r);if(PR.frame-r.seen>900){prKillRec(r);PR.recs.delete(r.id)}}}
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
  S.walkers.forEach(w=>{if(w.hidden||(w.zone==='north')!==(area==='north')||(area!=='town'&&area!=='north')||!inView(w.x,w.y))return;
    const r=prRec('w'+prOid(w));prBegin(r);prBody(r,area,w.x,w.y+(w.yo||0),w.pal,w.dir,w.walk,!!w.mv&&!w.sit,false,w.throwT>0,!!w.sit,w.y+(w.dz||0));prEnd(r);
    if(w.dog){const d=w.dog,rd=prRec('g'+prOid(d));prBegin(rd);const hx=w.x+(DIRV[w.dir][0]>=0?5:-5),hy=w.y-12;
      const x0=Math.min(hx,d.x-12)-4,y0=Math.min(hy,d.y-16)-4,x1=Math.max(hx,d.x+12)+4,y1=Math.max(hy,d.y+4)+4;
      prLive(rd,'dog',area,[x0,y0,x1-x0,y1-y0],d.y,g=>{g.strokeStyle='#C65C79';g.lineWidth=.45;g.beginPath();g.moveTo(hx,hy);g.quadraticCurveTo((hx+d.x)/2,Math.max(hy,d.y)+2,d.x+(d.dir==='left'?-3:3),d.y-6);g.stroke();drawDog(g,d)},null);prEnd(rd)}});
  /* 운동장 공 */
  if(area==='town'&&S.ball){const [bx,by,bh]=ballPos(S.ball);const r=prRec('ball');prBegin(r);
    prLive(r,'ball',area,[bx-5,by-34,10,38],by+2,g=>{el(g,bx,by+1,2.6*(1-bh/40),1,'rgba(80,55,50,.18)');const yy=by-10-bh;el(g,bx,yy,2.3,2.3,'#F08D8D');g.strokeStyle='#FFFFFF';g.lineWidth=.5;g.beginPath();g.arc(bx,yy,2.3,-.6,1.2);g.stroke();el(g,bx-.8,yy-.8,.6,.6,'rgba(255,255,255,.8)')},null);prEnd(r)}
  PR.npc=false;
  /* 토토 */
  if(area==='town'&&S.cat&&inView(S.cat.x,S.cat.y)){const r=prRec('cat');prBegin(r);const t=S.cat;prLive(r,'cat',area,[t.x-16,t.y-24,32,32],t.y,g=>drawCat(g,t),null);prEnd(r)}
  /* 가구 옮기기 미리보기 */
  if(area==='shop'&&S.edit)S.chars.forEach(c=>{if(!c.carry||c.area!=='shop')return;const f=c.carry,[x,y]=placeSpot(c,f),ok=spotOK(f,x,y);
    const r=prRec('e'+c.i);prBegin(r);const B=f.type?prBounds(PR_STB,f.type,x*TILE,y*TILE,f.w*TILE,f.h*TILE):prBounds(PR_DEB,f.t,x*TILE,y*TILE,f.w*TILE,f.h*TILE);
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

/* ---------- canvas ---------- */
const DARK=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):{matches:false};
const canvas=$('#game');const ctx=canvas.getContext('2d');
let CW=0,CH=0,DPR=1,BG_CACHE={};
let LITE=false,RENDER_SCALE=1,VIEW=null,FRAME=0;
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
  rr(g,50,9,26,2,.8,S.style==='minimal'?'#E8E2D8':CO.wood);[[54,'#D98E6C'],[61,'#E8D2B4'],[68,'#D98E6C']].forEach(([px,c])=>{rr(g,px-2.5,4,5,5,1,S.style==='minimal'?'#F4F1EA':c);leafyBlob(g,px,3.5,2.6,'#7FAF6C','#A6D08F')});
  if(!S.up.d_wallshelf)[[180,6],[194,9]].forEach(([px,py],k)=>{rr(g,px,py,11,9,.8,P.frame);rr(g,px+1,py+1,9,7,.5,'#FFF8EE');k?freesiaV(g,px+5.5,py+4.5,2.2,0):roseV(g,px+5.5,py+4.5,2.6,0)});
  g.fillStyle=P.side;g.fillRect(0,0,16,176);g.fillRect(W-16,0,16,176);g.fillStyle=mix(P.side,'#000',.08);g.fillRect(15,32,1,128);g.fillRect(W-16,32,1,128);
  g.fillStyle=P.side;g.fillRect(0,160,W,16);g.fillStyle=mix(P.side,'#000',.08);g.fillRect(0,160,W,1);
  const segs=[[24,96]];for(let a=168;a+80<=W-24;a+=96)segs.push([a,a+80]);
  segs.forEach(([a,b])=>{g.fillStyle=P.trim;g.fillRect(a,161,b-a,4);for(let x=a+2;x<b-2;x+=4){el(g,x+2,160,1.6,1.6,[CO.pink,'#D9435E',CO.white,'#9DB8E8'][Math.floor(x/4)%4])}});
  g.fillStyle='#EFE2CF';g.fillRect(128,160,32,16);rr(g,130,152,28,8,2,S.style==='vintage'?'#2F2F34':S.style==='minimal'?'#E4E4E0':'#CDBFA8');rr(g,132,153.5,24,5,1.5,S.style==='vintage'?'#44444A':S.style==='minimal'?'#EDEDEA':'#DCCFB9');
  const hang=(S.up.hanging?[40,92,132,228,258]:[92,228]);for(let x=300;x<W-20;x+=64)hang.push(x);
  hang.forEach(hx=>{ln(g,hx,0,hx,7,'#A08A7A',.4);rr(g,hx-3,7,6,4,1.5,S.style==='minimal'?'#F4F1EA':'#E8D2B4');for(let k=0;k<4;k++){const vx=hx-3+k*2;ln(g,vx,9,vx+(k-1.5)*.6,15+k%2*3,CO.leafD,.5);el(g,vx+(k-1.5)*.6,15+k%2*3,1.4,.9,CO.leaf)}el(g,hx,6.5,3.4,2,'#86B96F')});
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
function bgCanvas(area,s){
  let q=Math.min(DPR,1.6);const A0=AREAS[area];const BUD=PR.on?8.5e6:(LITE?3.5e6:9e6);while(A0.w*TILE*s*q*A0.h*TILE*s*q>BUD||(PR.on&&Math.max(A0.w,A0.h)*TILE*s*q>PR.maxTex))q*=.85;const key=area+'|'+s.toFixed(3)+'|'+q.toFixed(3)+'|'+JSON.stringify(S.up)+'|'+S.style;
  if(BG_CACHE[key])return BG_CACHE[key];
  const A=AREAS[area];const cv=document.createElement('canvas');cv.width=Math.ceil(A.w*TILE*s*q);cv.height=Math.ceil(A.h*TILE*s*q);
  const g=cv.getContext('2d');g.setTransform(s*q,0,0,s*q,0,0);
  ({shop:shopStatic,market:marketStatic,supply:supplyStatic,town:townStatic,north:northStatic})[area](g);
  BG_CACHE[key]=cv;return cv;
}

/* ---------- world ---------- */
function inView(x,y,m){if(!VIEW)return true;m=m||40;return x>VIEW[0]-m&&x<VIEW[2]+m&&y>VIEW[1]-m&&y<VIEW[3]+m*1.8}
function drawWorldV(g,area){
  ({shop:shopDynamic,market:marketDynamic,supply:supplyDynamic,town:townDynamic,north:northDynamic})[area](g);
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
  DECOR[area].forEach(d=>{if(d.flat||d.carried||!inView((d.x+d.w/2)*TILE,(d.y+d.h)*TILE,d.w*8+(d.t==='school'?120:40)))return;ents.push({y:(d.y+d.h)*TILE-2,draw:()=>drawDecor(g,d)})});
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
  S.walkers.forEach(w=>{if(w.hidden||(w.zone==='north')!==(area==='north')||(area!=='town'&&area!=='north')||!inView(w.x,w.y))return;ents.push({y:w.y+(w.dz||0),draw:()=>drawChar(g,w.x,w.y+(w.yo||0),w.pal,w.dir,w.walk,!!w.mv&&!w.sit,false,w.throwT>0,!!w.sit)});
    if(w.dog){const d=w.dog;ents.push({y:d.y,draw:()=>{const [hx,hy]=[w.x+(DIRV[w.dir][0]>=0?5:-5),w.y-12];g.strokeStyle='#C65C79';g.lineWidth=.45;g.beginPath();g.moveTo(hx,hy);g.quadraticCurveTo((hx+d.x)/2,Math.max(hy,d.y)+2,d.x+(d.dir==='left'?-3:3),d.y-6);g.stroke();drawDog(g,d)}})}});
  if(area==='town'&&S.cat&&inView(S.cat.x,S.cat.y))ents.push({y:S.cat.y,draw:()=>drawCat(g,S.cat)});
  if(area==='shop'&&S.edit)S.chars.forEach(c=>{if(!c.carry||c.area!=='shop')return;const f=c.carry,[x,y]=placeSpot(c,f),ok=spotOK(f,x,y);ents.push({y:9999,draw:()=>{const ox=f.x,oy=f.y;f.x=x;f.y=y;g.globalAlpha=.6;if(f.type)drawStationV(g,f);else drawDecor(g,f);g.globalAlpha=1;f.x=ox;f.y=oy;rr(g,x*TILE,y*TILE,f.w*TILE,f.h*TILE,2);g.strokeStyle=ok?'rgba(127,192,106,.95)':'rgba(224,112,140,.95)';g.lineWidth=1.4;g.setLineDash([3,2]);g.stroke();g.setLineDash([])}})});
  ents.sort((a,b)=>a.y-b.y).forEach(e=>e.draw());
}

/* ---------- time of day (lights) ---------- */
function lightsFor(area){
  if(area==='shop'){const W=AREAS.shop.w*TILE;const a=[[112,10],[208,10]];for(let x=320;x<W-16;x+=96)a.push([x,10]);if(S.up.lights)for(let x=40;x<W-16;x+=48)a.push([x,7]);return a}
  if(area==='town'||area==='north')return DECOR[area].filter(d=>d.t==='lamp').map(d=>[d.x*TILE+8,d.y*TILE-24]);
  if(area==='market')return [[80,10],[208,10]];
  return [[112,10]];
}

/* ---------- render ---------- */
function viewports(){
  const hud=$('#hud');const top=hud&&hud.style.display!=='none'?Math.max(48,Math.round(hud.getBoundingClientRect().bottom)+4):48,H=CH-top;const [a,b]=S.chars;const full={x:0,y:top,w:CW,h:H};
  if(a.area===b.area){
    const s=Math.min(CW/VW,H/VH)*(a.area==='town'||a.area==='north'?.85:1);const mw=AREAS[a.area].w*TILE;
    if(mw<=CW/s)return [{...full,area:a.area,chars:[0,1]}];
    if(Math.abs(a.x-b.x)<CW/s-70&&Math.abs(a.y-b.y)<H/s-60)return [{...full,area:a.area,chars:[0,1]}];
  }
  return [{area:a.area,x:0,y:top,w:CW/2-2,h:H,chars:[0],split:true},{area:b.area,x:CW/2+2,y:top,w:CW/2-2,h:H,chars:[1],split:true}];
}
function camera(v){
  const A=AREAS[v.area],mw=A.w*TILE,mh=A.h*TILE;const s=Math.min(v.w/VW,v.h/VH)*(v.area==='town'||v.area==='north'?.85:1);const vw=v.w/s,vh=v.h/s;const lead=S.chars[v.chars[0]];const up=v.area==='town'?(lead&&lead.y>22.5*TILE?-26:30):v.area==='north'?36:8;
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
  if(v.area==='town'||v.area==='north'){S.walkers.forEach(w=>{if(!w.offer||(w.zone==='north')!==(v.area==='north'))return;const [x,y]=S2(w.x,w.y-33);if(inV(x,y))pillText('예약하고 싶어요',x,y,'#FBDDE4','#4A3F5C',10)})}
  if(v.area==='market'){
    if(S.t>=MARKET_CLOSE){const [x,y]=S2(144,70);pillText('오늘 꽃시장은 문을 닫았어요',x,y,'rgba(255,253,249,.95)','#4A3F5C',12)}
    else stationsIn('market').forEach(s=>{if(s.type!=='stall')return;const [x,y]=S2((s.x+s.w/2)*TILE,(s.y+s.h)*TILE+12);pillText(won(S.prices[s.flower]),x,y,'rgba(255,253,249,.92)','#4A3F5C',10)});
  }
}

/* ---------- loop ---------- */
let last=performance.now();
/* 게임 계산은 1/60초 간격으로 일정하게, 화면은 그 사이를 부드럽게 이어서 그림 */
const STEP=1/60;let ACC=0;
function prMovers(){const a=S.chars.concat(S.customers||[],S.walkers||[]);(S.walkers||[]).forEach(w=>{if(w.dog)a.push(w.dog)});if(S.cat)a.push(S.cat);return a}
function prSnap(){prMovers().forEach(o=>{o._px=o.x;o._py=o.y;o._pa=o.area})}
function prTick(now){
  const _t0=performance.now();
  let dt=(now-last)/1000;last=now;if(!(dt>0))dt=0;if(dt>.25)dt=.25;
  try{pollPads(dt)}catch(e){}
  const playing=S.phase==='play'&&!S.paused&&innerWidth>=innerHeight;
  if(playing){ACC+=dt;let n=0;while(ACC>=STEP&&n<8){prSnap();update(STEP);ACC-=STEP;n++}if(n>=8)ACC=0;updateActionButtons();updateHUD();refreshLiveModals(dt)}else ACC=0;
  const k=playing?ACC/STEP:1,ms=[];
  if(k<1)prMovers().forEach(o=>{if(o._px==null||o._pa!==o.area)return;const dx=o.x-o._px,dy=o.y-o._py;if(dx*dx+dy*dy>1600||(!dx&&!dy))return;ms.push([o,o.x,o.y]);o.x=o._px+dx*k;o.y=o._py+dy*k});
  try{render()}finally{ms.forEach(([o,x,y])=>{o.x=x;o.y=y})}
  if(PERF.on)PERF.cpu+=performance.now()-_t0;
}
/* ---------- 성능 표시 (설정 → 성능 표시) ----------
   초당 프레임(FPS), 한 프레임 처리 시간 = 게임 계산+그림 준비(JS) + Phaser 그리기 명령 전송, 그림 도장 메모리 추정 */
const PERF={on:false,el:null,frames:0,cpu:0,gpu:0,worst:0,lastT:0,prevF:0,_r:0};
function perfShow(){PERF.on=!!SET.perf;if(PERF.on&&!PERF.el){PERF.el=document.createElement('div');PERF.el.id='perf';document.body.appendChild(PERF.el);PERF.lastT=performance.now()}
  if(PERF.el)PERF.el.style.display=PERF.on?'block':'none'}
function perfFrame(now){if(!PERF.on)return;PERF.frames++;const gap=now-(PERF.prevF||now);PERF.prevF=now;if(gap>PERF.worst)PERF.worst=gap;
  const el=now-PERF.lastT;if(el<1000)return;
  let tex=0,n=0,objs=0;
  try{const L=PR.sc.textures.list;for(const k in L){if(k[0]==='_')continue;const src=L[k].source&&L[k].source[0];if(src&&src.width){tex+=src.width*src.height*4;n++}}}catch(e){}
  try{objs=PR.sc.children.list.filter(o=>o.visible).length}catch(e){}const bg=0;
  const heap=performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576)+'MB':'-';
  const f=PERF.frames*1000/el;
  PERF.el.textContent=`FPS ${f.toFixed(0)}  (가장 느린 프레임 ${PERF.worst.toFixed(0)}ms)\n처리 ${(PERF.cpu/PERF.frames).toFixed(1)}ms + 그리기 ${(PERF.gpu/PERF.frames).toFixed(1)}ms\n도장 ${n}장 약 ${Math.round((tex+bg)/1048576)}MB · 화면 사물 ${objs}\nJS 메모리 ${heap} · 해상도 ${(DPR||1).toFixed(2)}배`;
  PERF.frames=0;PERF.cpu=0;PERF.gpu=0;PERF.worst=0;PERF.lastT=now}
function loop(now){
  if(PR.on)return;
  const dt=Math.min(.05,(now-last)/1000);last=now;
  try{pollPads(dt)}catch(e){}
  if(S.phase==='play'&&!S.paused&&innerWidth>=innerHeight){update(dt);updateActionButtons();updateHUD();refreshLiveModals(dt)}
  FRAME^=1;if(!LITE||FRAME)render();requestAnimationFrame(loop);
}
showTitle();
prBoot();
requestAnimationFrame(loop);
window.__game={PR,S,update,render,doAction,onModalClick,closeModal,endDay,newGame,continueGame,bouquetSVG,targetOf,actionLabel,saveGame,loadSave,spawnUrgent,findGift,bestOrderFor,updateHUD,openModal,renderModal,SET,showSettings,perfShow,drawChar,drawCat,bgCanvas,solid,AREAS,TILE,DECOR};
