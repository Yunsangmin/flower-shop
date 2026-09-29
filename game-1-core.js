'use strict';
/* 우리 둘의 꽃집 — 1-core.js : 기본 데이터·상태·맵 배치
   (파일은 index.html 에 적힌 순서대로 불러와요. 앞 파일의 함수·변수를 뒤 파일이 이어서 씀) */
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
/* 포장지 무늬: 색과 어울리면 손님이 기뻐하고 팁을 조금 더 줘요 */
const PATTERNS={plain:{name:'민무늬'},dot:{name:'물방울'},stripe:{name:'줄무늬'},check:{name:'체크'},lace:{name:'레이스',extra:true},news:{name:'영자신문',extra:true},sheer:{name:'투명 비닐',extra:true}};
const PAT_GOOD={dot:['pink','yellow','mint','sky'],stripe:['sky','cream','mint','lilac'],check:['cream','coral','kraft','yellow'],lace:['pink','lilac','cream','sky'],news:['kraft','cream'],sheer:['sky','lilac','mint','pink','cream']};
const PAT_LINE={dot:['물방울 무늬 너무 귀여워요! 받는 사람도 웃을 것 같아요.','동글동글 무늬가 꽃이랑 잘 어울려요!'],stripe:['줄무늬 포장이 깔끔하고 세련됐네요!','단정한 줄무늬라 선물하기 딱 좋아요.'],check:['체크무늬라 소풍 가는 기분이에요!','포근한 체크 포장, 감각 있으시네요.'],lace:['레이스라니… 너무 로맨틱해요!','레이스 테두리가 꽃을 더 우아하게 만들어 줘요.'],news:['영자신문 포장! 유럽 꽃집 같아요.','빈티지한 느낌이 너무 멋져요.'],sheer:['투명 포장이라 꽃이 반짝반짝 빛나 보여요!','비닐 한 겹이 이렇게 고급스러울 줄이야!']};
function styleScore(b){if(!b||!b.pat||b.pat==='plain')return 0;return (PAT_GOOD[b.pat]||[]).includes(b.paper)?2:1}
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
  {id:'patterns2',cat:'wrap',name:'고급 포장 무늬',desc:'레이스, 영자신문, 투명 비닐 포장이 생겨요.',price:18000},
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
const NAMES_F=['서연','지우','수아','은비','하린','예린','나연','유진','소윤','다은','채원','지아','윤서','하은','서아','민서','지유','예은','수빈','가윤','소희','연우'];
const NAMES_M=['하준','민재','시우','태오','지호','준서','건우','현우','서진','우진','지훈','은호','도현','주원','민준','이준','승우','유찬','준혁','시현','동건','태민'];
const NAMES=NAMES_F.concat(NAMES_M); // 메인 주민 이름(민지·순이·도윤·하루)은 엑스트라에 쓰지 않음
function nameFor(pal){return pick(pal&&pal.style==='f'?NAMES_F:NAMES_M)}
function isFemName(n){return NAMES_F.includes(n)}
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
function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)||0)}
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
  {name:'생민',jersey:'SM',num:'17',perm:true,eyeC:'#5A3C2C',tag:'#3E6FC2',style:'m',hair:'#3B2A22',hairHi:'#5E4536',skin:'#F1C9A5',skinSh:'#DBAA86',tee:'#4C82D4',teeSh:'#3A68B3',pants:'#26262E',shoe:'#F4F2EE'},
  {name:'수갱',jersey:'SK',num:'7',dbl:true,eyeC:'#4A3028',tag:'#E0708C',style:'f',face:'slim',hair:'#221C21',hairHi:'#43393F',skin:'#F4D3B7',skinSh:'#E0B597',tee:'#4C82D4',teeSh:'#3A68B3',pants:'#26262E',shoe:'#F4F2EE'}
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
/* 옆 가장자리로 이어지는 길(마을→농막·캠퍼스 등): SIDE_GAPS[area]=[[tx,ty0,ty1],...] */
const SIDE_GAPS={};
const AREA_SOLID={}; // 새 장소는 자기 충돌 규칙을 여기에 등록(undefined를 돌려주면 공통 규칙 계속)
function sideGap(area,tx,ty){const L=SIDE_GAPS[area];return !!L&&L.some(([x,a,b])=>(x<0?tx<1:tx>AREAS[area].w-2)&&ty>=a&&ty<=b)}
/* 넓은 바깥 장소(카메라 0.85배) */
const WIDE_AREAS={town:1,north:1};
function wideZ(a){return WIDE_AREAS[a]?.85:1}
/* 주민이 있는 장소 */
const ZONE_AREA={north:'north'};
function wArea(w){return ZONE_AREA[w.zone]||'town'}
function solid(area,px,py){
  const A=AREAS[area];const tx=Math.floor(px/TILE),ty=Math.floor(py/TILE);
  if((tx<1||tx>A.w-2)&&!sideGap(area,tx,ty))return true;if(py<0||px<0||px>=A.w*TILE)return true;
  if(AREA_SOLID[area]){const r=AREA_SOLID[area](px,py,tx,ty);if(r!==undefined)return r}
  if(area==='town'){if(ty<6&&!doorGap(area,tx,ty)&&!walkCol(tx))return true;if(ty>=A.h-1)return true;if(tx>=RIVER[0]&&tx<=RIVER[1]&&!bridgeRow(ty)&&ty<27)return true;if(ty>=27&&tx>=20&&!(tx>=40&&tx<=42&&ty<=30))return true}
  else if(area==='north'){if(ty<7)return true;if(ty>=A.h-1&&!walkCol(tx))return true;if(py>=A.h*TILE)return true;if(tx>=RIVER[0]&&tx<=RIVER[1]&&!(ty>=13&&ty<=14))return true}
  else if(area!=='north'&&!AREA_SOLID[area]){if(ty<2)return true;if(ty>=A.h-1&&!doorGap(area,tx,ty))return true;if(ty>=A.h)return true}
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
  /* 말 걸기: 바라보는 방향이 아니어도 가까이(약 2칸) 있으면 대화. 여럿이면 가깝고 바라보는 쪽 사람 우선 */
  if(!S.edit){const pool=(c.area==='town'?S.walkers.filter(w=>!w.hidden&&wArea(w)==='town').concat(S.customers.filter(k=>k.area==='town')):WIDE_AREAS[c.area]?S.walkers.filter(w=>!w.hidden&&wArea(w)===c.area):c.area==='shop'?S.customers.filter(k=>k.area==='shop'&&k.goal!=='out'):[]).concat(allCats().filter(k=>k.area===c.area));
    const R=c.area==='shop'?16:c.area==='campus'?34:28;let best=null,bs=1e9;
    for(const w of pool){const ex=w.x-c.x,ey=(w.y+(w.yo||0)*.5)-c.y,d=Math.hypot(ex,ey);if(d>R)continue;const dot=d>0?(ex*dx+ey*dy)/d:1;const sc=d-dot*10;if(sc<bs){bs=sc;best=w}}
    if(best){const front=Math.hypot(best.x-fx,best.y-3-fy)<14;if(!front){if(c.area==='shop'&&Math.hypot(best.x-c.x,best.y-c.y)>14)best=null;else if(stationsIn(c.area).some(s=>fx>=s.x*TILE-3&&fx<=(s.x+s.w)*TILE+3&&fy>=s.y*TILE-3&&fy<=(s.y+s.h)*TILE+3))best=null}if(best)return {type:'npc',walker:best}}}
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
function newPal(kind,fem){
  kind=kind||pick(['adult','adult','student','elder']);
  const f=fem==null?Math.random()<.5:!!fem;const [sk,skS]=pick(SKINS);
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
function park(zone){if(zone==='north')return [pick([rnd(3,23),rnd(37,56)])*TILE,rnd(8.4,20.5)*TILE];if(zone==='yard')return [rnd(3.4,16.4)*TILE,rnd(29,31.8)*TILE];if(zone==='lake')return Math.random()<.25?[rnd(40.3,42.7)*TILE,rnd(26.5,30.6)*TILE]:[rnd(18.5,56)*TILE,rnd(24.3,25.8)*TILE];const R=zone==='park'?TOWN_SPOTS:TOWN_SPOTS_E;for(let n=0;n<20;n++){const r=pickW(R);const p=[rnd(r[0],r[2])*TILE,rnd(r[1],r[3])*TILE];if(typeof blocked!=='function'||!blocked('town',p[0],p[1]))return p}return [rnd(10.5,23.4)*TILE,rnd(13.8,22.5)*TILE]}
/* 주민이 한곳(꽃집~학교 사이 공원)에 몰리지 않게 마을 곳곳으로 나눠 산책 [x0,y0,x1,y1,가중치] */
const TOWN_SPOTS=[[3,13.8,23.4,22.5,3],[2,8.6,23,11,1.5],[37.5,8.6,56,11,1.5],[34.4,17.8,37.8,22.5,1],[38,21.4,56,23.6,2],[18.5,24.3,56,25.8,1]];
const TOWN_SPOTS_E=[[34.4,17.8,37.8,22.5,1],[38,21.4,56,23.6,2],[37.5,8.6,56,11,1.5]];
function pickW(L){let s=0;for(const r of L)s+=r[4];let x=Math.random()*s;for(const r of L){x-=r[4];if(x<=0)return r}return L[0]}
function mkWalker(kind,zone,extra){const [x,y]=zone==='lane'?[rnd(3,54)*TILE,pick([9.4,10.2,11.1])*TILE]:park(zone);
  const pal=newPal(kind==='dog'||kind==='couple'?'adult':kind,extra&&extra.fem);const w={kind,zone,x,y,tx:x,ty:y,wait:rnd(0,2),pal,offer:null,walk:0,dir:'down',name:nameFor(pal),...extra};
  if(zone==='lane')w.tx=Math.random()<.5?2*TILE:55*TILE;
  if(kind==='dog')w.dog={x:x-10,y:y,dir:'down',walk:0,col:pick(['#E8D2B4','#8A5A3C','#F4F2EE','#3E3A3A','#D9A36A']),name:pick(DOG_NAMES)};
  return w}
