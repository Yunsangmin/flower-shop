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
const EXP_MAX=6;function shopLevel(){for(let n=EXP_MAX;n>0;n--)if(S.up['exp'+n])return n;return 0}
Object.defineProperty(AREAS.shop,'w',{get:()=>18+4*shopLevel()});
const GROW={tulip:3,freesia:3,gyp:2,rose:4,hydrangea:4,sunflower:4,ranunculus:4,peony:5};const SEED_PRICE={tulip:4000,freesia:3500,gyp:2500,rose:6000,hydrangea:5000,sunflower:5000,ranunculus:6500,peony:9000};
const RIVER=[27,33];function walkCol(tx){return (tx>=24&&tx<=26)||(tx>=34&&tx<=36)}function bridgeRow(ty){return (ty>=6&&ty<=12)||(ty>=17&&ty<=18)||(ty>=24&&ty<=25)}

const FL={
  tulip:{name:'튤립',decay:5,price:9000,dot:'#EE8FA7'},
  freesia:{name:'프리지아',decay:4,price:7500,dot:'#F5CF4E'},
  gyp:{name:'안개꽃',decay:3,price:5000,dot:'#FFFFFF'},
  rose:{name:'장미',decay:3.5,price:15000,dot:'#D9435E'},
  hydrangea:{name:'수국',decay:6,price:12000,dot:'#9DB8E8'},
  /* 용품상점 '새 꽃'에서 거래를 시작해야 시장에 나와요(lock) */
  sunflower:{name:'해바라기',decay:4,price:11000,dot:'#F2B731',lock:true},
  ranunculus:{name:'라넌큘러스',decay:4.5,price:14000,dot:'#F29A86',lock:true},
  peony:{name:'작약',decay:5,price:22000,dot:'#F2A9C0',lock:true}
};
const TYPES=['tulip','freesia','gyp','rose','hydrangea','sunflower','ranunculus','peony'];
function flOpen(t){return !FL[t]||!FL[t].lock||!!(S.up&&S.up['fl_'+t])}
function openTypes(){return TYPES.filter(flOpen)}
const LEAVES={tulip:3,freesia:2,gyp:4,rose:3,hydrangea:2,sunflower:3,ranunculus:2,peony:3};
const PAPERS={
  pink:{name:'분홍',c:'#F4B6C4',d:'#E08FA4',l:'#FBDDE4'},
  yellow:{name:'노랑',c:'#F6DC86',d:'#E2BD55',l:'#FBEFC3'},
  cream:{name:'크림',c:'#EFE4D2',d:'#D5C3A8',l:'#FAF4EA'},
  sky:{name:'하늘',c:'#B9D6F0',d:'#8DB6DE',l:'#DDEBF8'},
  lilac:{name:'라일락',c:'#D6C6EC',d:'#B5A0DA',l:'#EAE1F6'},
  mint:{name:'민트',c:'#BFE3D0',d:'#94C9AE',l:'#E1F3EA',extra:true},
  coral:{name:'코랄',c:'#F6B7A0',d:'#E3927A',l:'#FBDCD0',extra:true},
  kraft:{name:'크라프트',c:'#D8B994',d:'#B8956C',l:'#EBD8C0',extra:true},
  /* 파스텔 포장지 세트(papers3) */
  peach:{name:'피치',c:'#F9C9AE',d:'#E8A585',l:'#FDE4D6',set:'papers3'},
  blush:{name:'블러시',c:'#F2C4CE',d:'#D99AA8',l:'#F9E2E7',set:'papers3'},
  sage:{name:'세이지',c:'#C5D3B4',d:'#9FB28A',l:'#E2E9D9',set:'papers3'},
  butter:{name:'버터',c:'#F7E7A8',d:'#E2CB78',l:'#FCF3D3',set:'papers3'},
  peri:{name:'페리윙클',c:'#C3C9EE',d:'#9CA3D8',l:'#E1E4F7',set:'papers3'},
  ivory:{name:'아이보리',c:'#F7F1E3',d:'#DCD2BC',l:'#FFFCF4',set:'papers3'},
  /* 깊은 색 포장지 세트(papers4) */
  burgundy:{name:'버건디',c:'#8E3A4C',d:'#6B2536',l:'#B4606F',set:'papers4'},
  navyp:{name:'네이비',c:'#3E4D78',d:'#2A3557',l:'#6A78A0',set:'papers4'},
  forest:{name:'포레스트',c:'#4F7458',d:'#36553E',l:'#7A9A80',set:'papers4'},
  mustard:{name:'머스터드',c:'#D6A93E',d:'#B0862A',l:'#E8C772',set:'papers4'},
  charcoal:{name:'차콜',c:'#55525A',d:'#3A383F',l:'#807C86',set:'papers4'},
  blackp:{name:'블랙',c:'#2E2B30',d:'#1A181C',l:'#56525A',set:'papers4'},
  /* 특별 포장지 세트(papers5): 은은하게 빛나요 */
  goldp:{name:'골드',c:'#E2C27A',d:'#B8954A',l:'#F5E4B5',set:'papers5',bg:'linear-gradient(135deg,#F5E4B5,#D8B25E 55%,#F2DDA0)'},
  silverp:{name:'실버',c:'#CDD3D9',d:'#9CA5AE',l:'#EEF1F4',set:'papers5',bg:'linear-gradient(135deg,#F2F4F6,#AEB7C0 55%,#E4E8EC)'},
  pearl:{name:'진주빛',c:'#F3EEF2',d:'#D3C8D2',l:'#FFFFFF',set:'papers5',bg:'linear-gradient(135deg,#FFFFFF,#EADFF0 50%,#E2EEF4)'},
  rosegold:{name:'로즈골드',c:'#E7B6A4',d:'#C78E7A',l:'#F6DCD2',set:'papers5',bg:'linear-gradient(135deg,#F6DCD2,#D79A86 55%,#F0C9BA)'}
};
/* 포장지·무늬·리본 세트: extra(예전 세트)는 papers2/patterns2/ribbons2, 새 세트는 set 이름으로 열려요 */
function wrapOpen(o,old){return o.set?!!S.up[o.set]:o.extra?!!S.up[old]:true}
/* 포장지 무늬: 색과 어울리면 손님이 기뻐하고 팁을 조금 더 줘요 */
const PATTERNS={plain:{name:'민무늬'},dot:{name:'물방울'},stripe:{name:'줄무늬'},check:{name:'체크'},lace:{name:'레이스',extra:true},news:{name:'영자신문',extra:true},sheer:{name:'투명 비닐',extra:true},
  heart:{name:'하트',set:'patterns3'},star:{name:'별',set:'patterns3'},daisy:{name:'작은 꽃',set:'patterns3'},gingham:{name:'깅엄',set:'patterns3'},
  leaf:{name:'잎사귀',set:'patterns4'},music:{name:'악보',set:'patterns4'},wave:{name:'물결',set:'patterns4'},grid:{name:'모눈',set:'patterns4'},foil:{name:'금박 테두리',set:'patterns4'}};
const PAT_GOOD={dot:['pink','yellow','mint','sky','peach','butter','navyp'],stripe:['sky','cream','mint','lilac','ivory','navyp'],check:['cream','coral','kraft','yellow','burgundy','mustard'],lace:['pink','lilac','cream','sky','blush','ivory','pearl'],news:['kraft','cream','ivory','charcoal'],sheer:['sky','lilac','mint','pink','cream','pearl','silverp'],
  heart:['pink','blush','coral','burgundy','ivory'],star:['navyp','blackp','sky','peri','butter'],daisy:['sage','mint','yellow','butter','sky'],gingham:['sky','peach','sage','coral','yellow'],
  leaf:['sage','forest','kraft','cream','ivory'],music:['ivory','cream','kraft','charcoal','blackp'],wave:['sky','peri','mint','navyp'],grid:['kraft','ivory','charcoal','silverp'],foil:['blackp','navyp','burgundy','forest','charcoal','pearl']};
const PAT_LINE={dot:['물방울 무늬 너무 귀여워요! 받는 사람도 웃을 것 같아요.','동글동글 무늬가 꽃이랑 잘 어울려요!'],stripe:['줄무늬 포장이 깔끔하고 세련됐네요!','단정한 줄무늬라 선물하기 딱 좋아요.'],check:['체크무늬라 소풍 가는 기분이에요!','포근한 체크 포장, 감각 있으시네요.'],lace:['레이스라니… 너무 로맨틱해요!','레이스 테두리가 꽃을 더 우아하게 만들어 줘요.'],news:['영자신문 포장! 유럽 꽃집 같아요.','빈티지한 느낌이 너무 멋져요.'],sheer:['투명 포장이라 꽃이 반짝반짝 빛나 보여요!','비닐 한 겹이 이렇게 고급스러울 줄이야!'],
  heart:['하트 무늬라니, 마음이 그대로 전해질 것 같아요!','사랑스러운 하트 포장 고마워요.'],star:['별 무늬가 밤하늘 같아요. 너무 낭만적이에요!','반짝반짝 별 포장, 받는 사람이 좋아하겠어요.'],daisy:['작은 꽃무늬까지! 꽃이 두 배로 많아 보여요.','들판 같은 포장이라 기분이 좋아요.'],gingham:['깅엄 체크라 피크닉 가는 느낌이에요!','포근하고 귀여운 포장이네요.'],
  leaf:['잎사귀 무늬가 싱그러워요. 숲속 같아요!','초록 잎 포장이라 꽃이 더 살아 보여요.'],music:['악보 포장이라니, 노래가 들리는 것 같아요!','음악을 좋아하는 친구한테 딱이에요.'],wave:['물결 무늬가 시원하고 산뜻해요.','바다 느낌 포장, 너무 예뻐요!'],grid:['모눈 포장이 깔끔하고 모던해요.','심플한데 세련됐어요!'],foil:['금박 테두리라 정말 고급스러워요!','특별한 날에 딱 맞는 포장이에요.']};
const SHAPES={cone:{name:'기본 V자 포장'},round:{name:'둥근 부케'},cross:{name:'비대칭 크로스 포장'},box:{name:'꽃 상자'},rattan:{name:'라탄 꽃바구니',basket:true},white:{name:'흰색 꽃바구니',basket:true},
  hatbox:{name:'둥근 모자 상자',set:'shapes2',boxy:true},bag:{name:'종이 쇼핑백',set:'shapes2',boxy:true},tin:{name:'양철 버킷',set:'shapes2',basket:true}};
function isBasket(b){return !!(b&&b.shape&&SHAPES[b.shape]&&SHAPES[b.shape].basket)}
function styleScore(b){if(!b||!b.pat||b.pat==='plain')return 0;return (PAT_GOOD[b.pat]||[]).includes(b.paper)?2:1}
const RIBBONS={
  white:{name:'흰색',c:'#FFFFFF',d:'#D6D0C6'},
  pink:{name:'분홍',c:'#EE7F9C',d:'#C65C79'},
  navy:{name:'남색',c:'#3A4C80',d:'#243059'},
  gold:{name:'금색',c:'#E1B656',d:'#B48C33'},
  lavender:{name:'라벤더',c:'#B9A2E0',d:'#8E76C0',extra:true},
  green:{name:'초록',c:'#7FB070',d:'#5C8C50',extra:true},
  peachr:{name:'피치',c:'#F6B49A',d:'#D98C70',set:'ribbons3'},mintr:{name:'민트',c:'#9FD8C4',d:'#72B39C',set:'ribbons3'},skyr:{name:'하늘',c:'#9CC5E8',d:'#6F9CC8',set:'ribbons3'},yellowr:{name:'노랑',c:'#F5D66A',d:'#D2AE3E',set:'ribbons3'},coralr:{name:'코랄',c:'#F29A86',d:'#CF7462',set:'ribbons3'},
  red:{name:'빨강',c:'#D8434E',d:'#A82E38',set:'ribbons4'},burg:{name:'버건디',c:'#8A3346',d:'#61202F',set:'ribbons4'},black:{name:'검정',c:'#2E2B30',d:'#121014',set:'ribbons4'},silver:{name:'은색',c:'#CDD3D9',d:'#949DA6',set:'ribbons4'},twine:{name:'노끈',c:'#CBA978',d:'#9C7C4E',set:'ribbons4'}
};
/* 리본 모양(매듭): 처음엔 3가지, 나머지는 용품상점 '포장재' 칸 세트로 */
const BOWS={classic:{name:'기본 나비'},knot:{name:'한 번 묶기'},tails:{name:'꼬리 긴 리본'},big:{name:'볼륨 나비',set:'bows2'},double:{name:'이중 나비',set:'bows2'},loops:{name:'둥근 고리',set:'bows2'},rosette:{name:'꽃 매듭(로제트)',set:'bows3'},twine:{name:'노끈 감아 묶기',set:'bows3'}};
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
  {title:'감사 인사',text:'선생님께 드려요. 단정하고 예쁘게요.',req:{tulip:3,freesia:2,gyp:3},paper:'lilac',price:37000},
  {title:'해바라기 응원',text:'시험 보는 친구를 응원하고 싶어요. 해바라기로 밝게요!',req:{sunflower:3,gyp:3},paper:'yellow',price:46000},
  {title:'여름 인사',text:'해바라기랑 프리지아로 쨍하게 부탁드려요.',req:{sunflower:2,freesia:3},paper:'sky',price:44000},
  {title:'라넌큘러스 선물',text:'동글동글 라넌큘러스가 너무 좋아요. 사랑스럽게요.',req:{ranunculus:5,gyp:2},paper:'pink',price:58000},
  {title:'봄 소풍',text:'라넌큘러스랑 튤립으로 봄 느낌 가득!',req:{ranunculus:3,tulip:3},paper:'mint',price:56000},
  {title:'작약 꽃다발',text:'결혼식 날 신부에게 줄 거예요. 작약으로 풍성하게요.',req:{peony:3,gyp:4},paper:'cream',price:82000},
  {title:'작약과 장미',text:'아내 생일이에요. 작약이랑 장미로 우아하게 부탁해요.',req:{peony:2,rose:3},paper:'lilac',price:86000}
];
/* 아직 거래하지 않는 꽃이 들어간 주문은 빼고 골라요 */
function tplPool(){return TEMPLATES.filter(t=>Object.keys(t.req).every(flOpen))}
const STYLE_IDS={natural:'우드톤',minimal:'화이트톤'};
const SHOP_CATS=[['equip','설비'],['tool','도구'],['wrap','포장재'],['flower','새 꽃'],['deco','꾸미기'],['furn','가구'],['interior','인테리어'],['front','가게 외관'],['style','옷·치장'],['expand','가게 확장']];
const STYLE={
  tee:{label:'상의',opts:[['#9FD8C4','민트 티셔츠',12000],['#F6B7A0','코랄 티셔츠',12000],['#F1E6D2','크림 티셔츠',12000],['#FFFFFF','흰 티셔츠',10000],['#F7E08A','레몬 티셔츠',12000],['#C9B8E8','라벤더 티셔츠',12000],
    ['#3E4D78','네이비 티셔츠',12000],['#2E2B30','검정 티셔츠',12000],['#8C9A6A','올리브 티셔츠',12000],['#F4B6C4','분홍 티셔츠',12000],
    ['stripe|#F7F4EC|#3E4D78','줄무늬 티 (남색)',16000],['stripe|#FBF3F0|#D8434E','줄무늬 티 (빨강)',16000],
    ['knit|#EADBC0','크림 니트',22000],['knit|#B8C9A8','세이지 니트',22000],['knit|#C98E9C','로즈 니트',22000],['knit|#5E6A8A','네이비 니트',22000],
    ['hood|#B9C3CF','회색 후드티',24000],['hood|#F2C9A0','살구 후드티',24000],['hood|#7F9C6E','초록 후드티',24000]]},
  pants:{label:'하의',opts:[['#5A78A6','청바지',18000],['#8FAED0','연청 바지',18000],['#D8C4A0','베이지 면바지',16000],['#7D7A5A','카키 바지',16000],['#EEEAE0','흰 바지',16000],['#6B4E3D','브라운 코듀로이 바지',20000],
    ['s:#3E4D78','남색 플리츠 스커트',20000],['s:#C9A88A','베이지 롱스커트',20000],['s:#7F9CC0','데님 스커트',20000],['s:#E8B4C0','분홍 스커트',20000]]},
  dress:{label:'셔츠·원피스',opts:[['pink','벚꽃 원피스',22000],['sky','하늘 원피스',22000],['linen','린넨 원피스',24000],['navy','남색 원피스',24000],['stripe','줄무늬 셔츠',18000],['check','체크 셔츠',18000],['denim','데님 셔츠',20000]]},
  apron:{label:'앞치마',opts:[['#F4B6C4','분홍 앞치마',14000],['#A7C7A0','초록 앞치마',14000],['#6F8FB8','데님 앞치마',16000],['#C9B8E8','라벤더 앞치마',14000],['#F1E3C4','크림 린넨 앞치마',15000],['knit','순이 할머니의 꽃무늬 앞치마',0,'gift']]},
  shoes:{label:'신발',opts:[['#2E2B30','검정 구두',18000],['#8A5A3A','갈색 로퍼',20000],['#D8434E','빨간 운동화',16000],['#F2B6C6','분홍 운동화',16000],['#9CC5E8','하늘 운동화',16000],['#F2C230','노란 장화',18000],['#C9B08A','베이지 부츠',22000]]},
  hat:{label:'모자',opts:[['beret','베레모',12000],['sunhat','밀짚모자',15000],['beanie','니트 비니',10000],['cap','야구 모자',10000],['bucket','린넨 버킷햇',14000],
    ['beretN','남색 베레모',12000],['beanieG','회색 비니',10000],['beanieP','분홍 비니',10000],['capB','검정 야구 모자',10000],['capW','흰 야구 모자',10000],['fedora','페도라',20000],['visor','흰 썬캡',12000],['crown','하루의 꽃 화관',0,'gift']]},
  glasses:{label:'안경',opts:[['horn','검은 뿔테 안경',15000],['gold','동그란 금테 안경',18000],['sun','동그란 선글라스',16000],['red','빨간 뿔테 안경',16000],['clear','투명테 안경',16000],['tort','호피 뿔테 안경',18000],['rose','분홍 선글라스',18000],['silver','은테 동그란 안경',18000]]},
  pin:{label:'머리 장식',opts:[['ribbon','리본 핀',6000],['flower','꽃 머리핀',8000],['band','헤어밴드',7000],['yflower','노란 꽃핀',8000],['claw','집게핀',7000],['star','별 머리핀',7000],['scrunchie','곱창 밴드',6000],['bowP','진주 리본핀',9000],['pearl','진주 머리핀',0,'gift']]},
  acc:{label:'액세서리',opts:[['pearlN','진주 목걸이',25000],['goldN','금 목걸이',28000],['bowR','빨간 나비넥타이',12000],['bowN','남색 나비넥타이',12000],['corsP','분홍 코르사주',10000],['corsW','흰 코르사주',10000],['scarfR','빨간 목도리',16000],['scarfC','크림 목도리',16000]]},
  ear:{label:'귀걸이',opts:[['earP','진주 귀걸이',18000],['earG','금 귀걸이',18000],['earD','물방울 귀걸이',20000]]},
  bag:{label:'가방',opts:[['leather','가죽 크로스백',16000],['canvas','캔버스 에코백',12000],['rattan','라탄 가방',20000],['basket','꽃바구니',18000],['pack','미니 백팩',15000],['yellow','노란 숄더백',18000],['blackmini','검정 미니백',20000],['denim','데님 에코백',14000],['bluepack','하늘 백팩',16000],['kkami','민지의 까미 에코백',0,'gift'],['spring','봄 연구실 에코백',0,'gift']]}
};
/* 옷장·상점에 보이는 칸 이름 */
const STYLE_PART={tee:'상의',pants:'하의',dress:'셔츠·원피스',apron:'앞치마',shoes:'신발',hat:'모자',glasses:'안경',pin:'머리 장식',acc:'액세서리',ear:'귀걸이',bag:'가방'};
const HATV={beretN:['beret','#3E4D78'],beanieG:['beanie','#9AA0A8'],beanieP:['beanie','#F2B6C6'],capB:['cap','#2E2B30'],capW:['cap','#EEEAE2']};
const ACCV={pearlN:{neck:'pearl'},goldN:{neck:'gold'},bowR:{bow:'#C0463E'},bowN:{bow:'#3A4C80'},corsP:{corsage:'#F29AB0'},corsW:{corsage:'#FFFFFF'},scarfR:{scarf:'#C65C5C'},scarfC:{scarf:'#EFE4D0'}};
const EARV={earP:'pearl',earG:'gold',earD:'drop'};
/* 머리 스타일(리트헤어): b=기본 모양, 나머지는 덧그림(앞머리·옆머리·컬 등). perm=펌 가격 */
/* 머리 스타일(리트헤어) v2: 머리칼 덩어리로 그려요(game-6-art.js 의 hair2*)
   fr=앞머리(none 넘김·full 일자뱅·see 시스루·side 옆으로·split 가르마·comma 쉼표·crop 짧게·curtain 커튼뱅), sd=옆머리 길이(ear·cheek·chin·chest),
   len=뒷머리(nape·bob·shoulder·long·xlong), tex=결(straight·wave·curl·layer·spiky), vol=정수리 볼륨, x=묶음(pony·sidepony·braids·bun·buns·halfbun), perm=펌 가격 */
const HAIRS={
  m:[['dandy','댄디컷',{fr:'full',sd:'ear',len:'nape',tex:'straight',vol:2}],['comma','쉼표머리',{fr:'comma',sd:'ear',len:'nape',tex:'straight',vol:2}],
     ['gareuma','가르마펌',{fr:'split',sd:'ear',len:'nape',tex:'wave',vol:3,perm:1}],['twoblock','투블럭',{fr:'side',sd:'under',len:'nape',tex:'straight',vol:4}],
     ['leaf','리프컷',{fr:'curtain',sd:'cheek',len:'nape',tex:'straight',vol:2}],['ez','애즈펌',{fr:'split',sd:'ear',len:'nape',tex:'cc',vol:3,perm:1}],
     ['wolf','울프컷',{fr:'see',sd:'cheek',len:'shoulder',tex:'layer',vol:3}],['slick','슬릭백',{fr:'none',sd:'under',len:'nape',tex:'straight',vol:4}],
     ['crop','크롭컷',{fr:'crop',sd:'under',len:'nape',tex:'spiky',vol:1}],['shadow','쉐도우펌',{fr:'full',sd:'ear',len:'nape',tex:'wave',vol:4,perm:1}],
     ['hippiem','히피펌',{fr:'see',sd:'cheek',len:'nape',tex:'curl',vol:5,perm:1}],['longm','장발 레이어드',{fr:'split',sd:'chin',len:'shoulder',tex:'layer',vol:2}]],
  f:[['seethru','시스루뱅 롱',{fr:'see',sd:'chest',len:'long',tex:'straight',vol:2}],['layered','레이어드 C컬',{fr:'curtain',sd:'chest',len:'long',tex:'cc',vol:2}],
     ['hush','허쉬컷',{fr:'see',sd:'chin',len:'shoulder',tex:'layer',vol:3}],['bangbob','뱅 단발',{fr:'full',sd:'bobin',len:'bob',tex:'straight',vol:2}],
     ['tassel','태슬컷',{fr:'side',sd:'chin',len:'shoulder',tex:'straight',vol:1}],['build','빌드펌',{fr:'side',sd:'chest',len:'long',tex:'wave',vol:3,perm:1}],
     ['hippie','히피펌',{fr:'see',sd:'chest',len:'long',tex:'curl',vol:5,perm:1}],['swave','S컬 물결펌',{fr:'curtain',sd:'chest',len:'xlong',tex:'wave',vol:2,perm:1}],
     ['braids','양갈래 땋기',{fr:'full',sd:'wisp',len:'nape',tex:'straight',vol:1,x:'braids'}],['sidepony','사이드 포니테일',{fr:'curtain',sd:'wisp',len:'nape',tex:'wave',vol:2,x:'sidepony'}],
     ['pony','하이 포니테일',{fr:'see',sd:'wisp',len:'nape',tex:'straight',vol:2,x:'pony'}],['bun','똥머리',{fr:'see',sd:'wisp',len:'nape',tex:'straight',vol:1,x:'bun'}],
     ['buns','만두머리',{fr:'full',sd:'wisp',len:'nape',tex:'straight',vol:1,x:'buns'}],['halfup','반묶음',{fr:'curtain',sd:'chest',len:'long',tex:'straight',vol:2,x:'halfbun'}],
     ['hiponyw','하이포니 웨이브',{fr:'curtain',sd:'chest',len:'xlong',tex:'wave',vol:4,x:'hipony',big:1,perm:1,price:70000}],['hime','히메컷',{fr:'full',sd:'hime',len:'long',tex:'straight',vol:1}],['pixie','숏컷',{fr:'side',sd:'ear',len:'nape',tex:'straight',vol:2}]]};
const HAIR_DEFAULT={m:'gareuma',f:'seethru'};
const HAIR_C=[['#221C21','흑발'],['#3B2A22','자연 갈색'],['#5A3A2A','초코 브라운'],['#8A6A50','밀크 브라운'],['#6E6258','애쉬 브라운'],['#8C8C90','애쉬 그레이'],['#6A5E44','카키 브라운'],
  ['#6E2A3A','와인'],['#8A4E4E','로즈 브라운'],['#23263A','블루 블랙'],['#A8783A','골드 브라운'],['#D8B36A','블론드'],['#D88AA0','핑크']];
function hairDef(k){for(const g of ['m','f'])for(const h of HAIRS[g])if(h[0]===k)return h[2];return null}
const DRESS={pink:{c:'#F6C9D3',dress:1},sky:{c:'#BFD9EE',dress:1},linen:{c:'#EFE4D0',dress:1},navy:{c:'#3E4A6E',dress:1},stripe:{c:'#EEF3FA',shirt:'stripe',l:'#4A6A9A'},check:{c:'#F3DCCB',shirt:'check',l:'#B0473E'},denim:{c:'#7F9CC0',shirt:'denim'}};
const BAGS={yellow:{bag:true,bagC:'#E8C25A'},blackmini:{bag:true,bagC:'#2E2B30'},denim:{bag:true,bagC:'#7F9CC0',bagP:'#EFE6D6'},bluepack:{pack:true,packC:'#9CC5E8'},leather:{bag:true,bagC:'#9C6B4C'},canvas:{bag:true,bagC:'#EFE6D6',bagP:'#9DBB88'},rattan:{bag:true,bagC:'#C99A63'},basket:{prop:'basket'},pack:{pack:true,packC:'#E8A0A8'},kkami:{bag:true,bagC:'#F4EEE2',bagP:'#2A2626',bagP2:'#F29AB0'},spring:{bag:true,bagC:'#DDEBD4',bagP:'#F29AB0',bagP2:'#FFFFFF'}};
const SHOP_ITEMS=[
  {id:'fridge',cat:'equip',name:'꽃 냉장고 업그레이드',desc:'냉장고에 넣어둔 꽃과 꽃다발이 절반 속도로 시들어요.',price:120000},
  {id:'bucket3',cat:'equip',name:'물올림 통 추가',desc:'물올림 통이 하나 더 생겨요.',price:30000},
  {id:'bucket4',cat:'equip',name:'물올림 통 하나 더',desc:'물올림 통이 또 하나 생겨요.',price:40000,need:'bucket3'},
  {id:'dryer',cat:'equip',name:'드라이플라워 건조대',desc:'꽃을 걸어두면 한 시간 뒤 드라이플라워가 돼요.',price:90000},
  {id:'pickup',cat:'equip',name:'자동 픽업대',desc:'포장한 예약 꽃다발을 올려두면 손님이 알아서 찾아가요.',price:150000},
  {id:'pickup2',cat:'equip',name:'픽업대 넓히기 (4칸)',desc:'자동 픽업대에 꽃다발을 4개까지 올려둘 수 있어요.',price:120000,need:'pickup'},
  {id:'pickup3',cat:'equip',name:'픽업대 넓히기 (6칸)',desc:'자동 픽업대가 6칸이 돼요.',price:220000,need:'pickup2'},
  {id:'pickup4',cat:'equip',name:'픽업대 넓히기 (8칸)',desc:'자동 픽업대가 8칸이 돼요.',price:380000,need:'pickup3'},
  {id:'fridge2',cat:'equip',name:'냉장고 칸 늘리기 (16칸)',desc:'꽃 냉장고가 16칸이 돼요.',price:90000},
  {id:'fridge3',cat:'equip',name:'냉장고 칸 늘리기 (20칸)',desc:'꽃 냉장고가 20칸이 돼요.',price:180000,need:'fridge2'},
  {id:'fridge4',cat:'equip',name:'냉장고 칸 늘리기 (24칸)',desc:'꽃 냉장고가 24칸이 돼요.',price:320000,need:'fridge3'},
  {id:'xfridge',cat:'equip',name:'꽃 냉장고 더 사기',desc:'냉장고가 하나 더 생겨요(최대 4개 더). 칸 늘리기·천천히 시들기 업그레이드가 모든 냉장고에 똑같이 적용돼요.',price:100000,repeat:true,addSt:'storage',max:4},
  {id:'xbucket',cat:'equip',name:'물올림 통 더 사기',desc:'물올림 통이 하나 더 생겨요. 여러 개 살 수 있고, 가게 밖에도 들고 나가 놓을 수 있어요.',price:40000,repeat:true,addSt:'bucket',max:10},
  {id:'xdisplay',cat:'equip',name:'진열대 더 사기',desc:'진열대가 하나 더 생겨요. 가게 밖 마을에 두면 영업 시간에 지나가는 사람들이 사 가요.',price:70000,repeat:true,addSt:'display',max:6},
  {id:'craft2',cat:'equip',name:'작업대 추가',desc:'둘이 동시에 꽃다발을 만들 수 있어요.',price:80000},
  {id:'sprinkler',cat:'tool',name:'스프링클러',desc:'텃밭 사이 교차로에 설치하면 매일 아침 주변 밭에 물을 줘요. 여러 개 살 수 있어요.',price:45000,repeat:true,bag:true},
  {id:'bag2',cat:'tool',name:'가방 넓히기 (12칸)',desc:'두 사람 가방이 모두 12칸이 돼요.',price:60000},
  {id:'bag3',cat:'tool',name:'가방 넓히기 (16칸)',desc:'두 사람 가방이 모두 16칸이 돼요.',price:150000,need:'bag2'},
  {id:'scissors',cat:'tool',name:'좋은 가위',desc:'사선 자르기 성공 구간이 넓어져요.',price:40000},
  {id:'papers2',cat:'wrap',name:'새 포장지 세트',desc:'민트, 코랄, 크라프트 포장지가 생겨요.',price:25000},
  {id:'ribbons2',cat:'wrap',name:'새 리본 세트',desc:'라벤더, 초록 리본이 생겨요.',price:15000},
  {id:'papers3',cat:'wrap',name:'파스텔 포장지 세트',desc:'피치, 블러시, 세이지, 버터, 페리윙클, 아이보리 포장지가 생겨요.',price:35000},
  {id:'papers4',cat:'wrap',name:'깊은 색 포장지 세트',desc:'버건디, 네이비, 포레스트, 머스터드, 차콜, 블랙 포장지가 생겨요.',price:45000},
  {id:'papers5',cat:'wrap',name:'반짝이는 포장지 세트',desc:'골드, 실버, 진주빛, 로즈골드 포장지가 생겨요.',price:80000},
  {id:'patterns3',cat:'wrap',name:'귀여운 무늬 세트',desc:'하트, 별, 작은 꽃, 깅엄 무늬가 생겨요.',price:30000},
  {id:'patterns4',cat:'wrap',name:'감성 무늬 세트',desc:'잎사귀, 악보, 물결, 모눈, 금박 테두리 무늬가 생겨요.',price:50000},
  {id:'ribbons3',cat:'wrap',name:'파스텔 리본 세트',desc:'피치, 민트, 하늘, 노랑, 코랄 리본이 생겨요.',price:20000},
  {id:'ribbons4',cat:'wrap',name:'고급 리본 세트',desc:'빨강, 버건디, 검정, 은색 리본과 노끈이 생겨요.',price:30000},
  {id:'bows2',cat:'wrap',name:'볼륨 리본 세트',desc:'볼륨 나비, 이중 나비, 둥근 고리 리본 모양이 생겨요.',price:25000},
  {id:'bows3',cat:'wrap',name:'특별 매듭 세트',desc:'꽃 매듭(로제트)과 노끈 감아 묶기 모양이 생겨요.',price:35000},
  {id:'shapes2',cat:'wrap',name:'새 포장 모양 세트',desc:'둥근 모자 상자, 종이 쇼핑백, 양철 버킷 모양이 생겨요. 양철 버킷은 바구니처럼 재료비 5,000원, 판매가 +5,000원이에요.',price:45000},
  {id:'basket',cat:'wrap',name:'꽃바구니 (라탄·흰색)',desc:'꽃다발을 라탄이나 흰색 바구니에 담을 수 있어요. 만들 때 5,000원이 더 들지만 판매가도 5,000원 올라가고, 누구나 좋아해요.',price:30000},
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
  ...Object.entries(STYLE).flatMap(([k,v])=>v.opts.filter(o=>o[3]!=='gift').map(([val,name,price])=>({id:'st_'+k+'_'+val,cat:'style',name,desc:'가게 옷장에서 갈아입을 수 있어요. 둘 다 입을 수 있어요.',price,style:[k,val],part:STYLE_PART[k]}))),
  ...Object.keys(STYLE_IDS).map(k=>({id:'style_'+k,cat:'interior',name:STYLE_IDS[k],desc:'',price:300000,styleSet:k,repeat:true,part:'가게 전체'})),
  {id:'fl_sunflower',cat:'flower',name:'해바라기 거래 시작',desc:'꽃시장에 해바라기 가판대가 생기고, 해바라기 주문 손님이 와요. 모종도 살 수 있어요.',price:150000},
  {id:'fl_ranunculus',cat:'flower',name:'라넌큘러스 거래 시작',desc:'꽃시장에 라넌큘러스 가판대가 생기고, 비싼 라넌큘러스 주문이 들어와요.',price:280000,need:'fl_sunflower'},
  {id:'fl_peony',cat:'flower',name:'작약 거래 시작',desc:'꽃시장에 작약 가판대가 생겨요. 작약 주문은 아주 비싸요.',price:450000,need:'fl_ranunculus'},
  {id:'exp1',cat:'expand',name:'가게 넓히기 1단계',desc:'가게 오른쪽 벽을 터서 바닥이 넓어져요. 넓어진 곳에 가구를 옮겨 놓을 수 있어요.',price:500000},
  {id:'exp2',cat:'expand',name:'가게 넓히기 2단계',desc:'가게가 한 번 더 넓어져요.',price:1200000,need:'exp1'},
  {id:'exp3',cat:'expand',name:'가게 넓히기 3단계',desc:'가게가 한 번 더 넓어져요.',price:2500000,need:'exp2'},
  {id:'exp4',cat:'expand',name:'가게 넓히기 4단계',desc:'가게가 한 번 더 넓어져요.',price:4500000,need:'exp3'},
  {id:'exp5',cat:'expand',name:'가게 넓히기 5단계',desc:'가게가 한 번 더 넓어져요.',price:8000000,need:'exp4'},
  {id:'exp6',cat:'expand',name:'가게 넓히기 6단계',desc:'가게가 가장 넓어져요.',price:15000000,need:'exp5'}
];
/* 가게 외관(상점 '가게 외관' 칸): 차양·벽·문 색은 하나를 골라 바꾸고(fr_awn/fr_wall/fr_door), 소품은 한 번 사면 계속 있어요 */
const FRONT={awn:{label:'차양',def:'pink',opts:{pink:['분홍 줄무늬 차양','#F4B6C4','#D98E8E','#C97A7A'],mint:['민트 줄무늬 차양','#A9D8C4','#7FB8A0','#5F9A82'],navy:['남색 줄무늬 차양','#6A7FA8','#4E6290','#3E4D78'],yellow:['노랑 줄무늬 차양','#F6D978','#E2B84E','#C99A30'],green:['초록 줄무늬 차양','#8FBF7A','#6E9A5A','#557A44']}},
  wall:{label:'벽',def:'pink',opts:{pink:['분홍 벽','#F8E1E4'],cream:['크림 벽','#F6EEDC'],sage:['세이지 벽','#DDE6D2'],sky:['하늘 벽','#DCE8F2'],brick:['붉은 벽돌 벽','#C98A72']}},
  door:{label:'문',def:'wood',opts:{wood:['원목 문','#B98463'],green:['초록 문','#5F8A6A'],navy:['남색 문','#3E4D78'],white:['흰 문','#F2EEE6'],red:['빨간 문','#B8434E']}}};
function frontOf2(k){const F=FRONT[k];const v=(S.up&&S.up['fr_'+k])||F.def;return F.opts[v]||F.opts[F.def]}
/* 인테리어 테마(상점 '인테리어' 칸) · 가구(상점 '가구' 칸) · 벽 장식(상점 '꾸미기' 칸, 가게 뒤 벽에만) */
const THEME_SHOP=[['vintage','빈티지 파리',300000],['pastel','파스텔',300000],['xmas','크리스마스',250000],['spring','벚꽃 봄',250000],['forest','숲속 오두막',350000],['navyc','네이비 클래식',380000],['terra','테라코타',350000],['mono','모노 그레이',320000]];
const FURN=[ // [그림 이름, 상품 이름, 가격, 가로칸, 세로칸, 바닥에 까는 것(밟고 지나감)]
  ['cafetable','카페 테이블 세트',38000,2,1],['flowercart','꽃 수레',52000,2,1],['bike','꽃바구니 자전거',45000,2,1],['bookshelf','원목 책장',34000,1,1],['record','레코드 플레이어',42000,1,1],
  ['catcushion','고양이 방석',20000,1,1],['candles','캔들 선반',16000,1,1],['armchair','벨벳 1인 소파',48000,1,1],['floorlamp','스탠드 조명',26000,1,1],['flowerbench','꽃 벤치',36000,2,1],
  ['cactus','선인장 삼총사',18000,1,1],['fiddle','떡갈고무나무',28000,1,1],['birdcage','새장 화분 스탠드',30000,1,1],['piano','업라이트 피아노',180000,2,1],['xmastree','크리스마스 트리',40000,1,1],
  ['sakura','벚꽃 나무 화분',45000,1,1],['rug_round','파스텔 원형 러그',30000,3,2,1],['rug_check','체크 러그',32000,4,2,1],
  ['picnictable','피크닉 테이블',42000,2,1],['campchair','캠핑 의자',24000,1,1],['picnicmat','피크닉 돗자리',18000,3,2,1],
  ['sofa2','패브릭 2인 소파',58000,2,1],['plantstand','3단 화분 스탠드',28000,1,1],['deskset','원목 책상 세트',46000,2,1],['aquarium','작은 어항',40000,1,1],['hangchair','라탄 행잉 체어',65000,1,1],
  ['showcase','유리 꽃 쇼케이스',70000,1,1],['grandclock','원목 괘종시계',55000,1,1],['bigvase','대형 튤립 화병',16000,1,1],['beanbag','빈백 의자',22000,1,1],['lantern','라탄 플로어 랜턴',20000,1,1],['herbbox','허브 화분 상자',26000,2,1]];
const WALLS=[['w_flowerart','꽃 그림 액자',18000,1],['w_pressed','압화 액자 세트',22000,2],['w_macrame','마크라메 벽걸이',20000,1],['w_garland','드라이플라워 가랜드',16000,2],['w_roundmirror','동그란 벽 거울',24000,1],['w_plantshelf','벽 선반 화분',24000,2],
  ['w_neon','꽃 네온사인',45000,2],['w_tapestry','꽃 태피스트리',26000,2],['w_hat','밀짚모자 걸이',14000,1],['w_botanical','보태니컬 액자 세트',24000,2],['w_eucalyptus','유칼립투스 리스',18000,1],['w_menu','칠판 메뉴판',20000,2]];
SHOP_ITEMS.push(...Object.entries(FRONT).flatMap(([k,F])=>Object.entries(F.opts).map(([v,o])=>({id:'fr'+k[0]+'_'+v,cat:'front',part:F.label,name:o[0]+(v===F.def?' (처음 모습)':''),desc:'',price:v===F.def?10000:k==='wall'?(v==='brick'?90000:60000):k==='awn'?40000:30000,repeat:true,front:[k,v]}))),
  ...[['fr_boxes','창가 꽃상자 가득',35000],['fr_lamps','벽 랜턴 한 쌍',45000],['fr_ivy','담쟁이 넝쿨',30000],['fr_board','가게 앞 입간판',25000],['fr_bike','가게 앞 꽃자전거',50000],['fr_tile','가게 앞 타일 바닥',40000]].map(([id,n,p])=>({id,cat:'front',part:'소품',name:n,desc:'',price:p})));
SHOP_ITEMS.push(...THEME_SHOP.map(([k,n,p])=>({id:'style_'+k,cat:'interior',name:n,desc:'',price:p,styleSet:k,repeat:true,part:'가게 전체'})),
  ...FURN.map(([t,n,p,w,h,flat])=>({id:'f_'+t,cat:'furn',part:n,name:n,desc:'',price:p,repeat:true,floor:flat?{t,w,h,flat:true,walk:true}:{t,w,h}})),
  ...WALLS.map(([t,n,p,w])=>({id:'f_'+t,cat:'deco',part:'벽 · '+n,name:n,desc:'',price:p,repeat:true,floor:{t,w,h:1,wall:true,walk:true}})));
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
  ['st_tulip','stall','market',2,2,3,1],['st_freesia','stall','market',6,2,3,1],['st_gyp','stall','market',10,2,3,1],['st_rose','stall','market',14,2,3,1],['st_hydrangea','stall','market',18,2,3,1],['st_sunflower','stall','market',5,6,3,1,'fl_sunflower'],['st_ranunculus','stall','market',9,6,3,1,'fl_ranunculus'],['st_peony','stall','market',13,6,3,1,'fl_peony'],['seedstall','seedstall','market',15,8,3,1],
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
/* 장소별 장식. 바깥(마을·언덕·캠퍼스·텃밭)은 기본 장식 + 플레이어가 들고 나가 놓은 가구(S.odecor) */
const OUT_AREAS=['town','north','campus','farm'];
let ODEC_V=0;const ODEC_C={};
function withOut(a,B){const O=(S.odecor&&S.odecor[a])||[];if(!O.length)return B;const c=ODEC_C[a];if(c&&c.v===ODEC_V&&c.b===B)return c.arr;const arr=B.concat(O);ODEC_C[a]={v:ODEC_V,b:B,arr};return arr}
function odec(area){S.odecor=S.odecor||{};return S.odecor[area]||(S.odecor[area]=[])}
const DECOR={get north(){return withOut('north',DECOR_BASE.north)},get shop(){return S.decor||DECOR_BASE.shop},get market(){return DECOR_BASE.market},get supply(){return DECOR_BASE.supply},get town(){return withOut('town',DECOR_BASE.town)}};
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
/* 업그레이드로 늘어나는 칸 수 */
function slotN(type){if(type==='pickup')return S.up.pickup4?8:S.up.pickup3?6:S.up.pickup2?4:2;if(type==='storage')return S.up.fridge4?24:S.up.fridge3?20:S.up.fridge2?16:12;return SLOTN[type]}
function resizeSlots(){S.stList.forEach(s=>{if(!s.slots)return;const n=slotN(s.type);while(s.slots.length<n)s.slots.push(null)})}
/* 여러 개 살 수 있는 설비(물올림 통·진열대): S.up.n_bucket / S.up.n_display 개수만큼 'xbucket1'… 'xdisplay1'… 로 만들어요 */
const XST={bucket:{w:1,h:1},display:{w:3,h:1},storage:{w:2,h:1}};
function addXStation(type,n){const id='x'+type+n;if(S.st[id])return S.st[id];const o={id,type,area:'shop',home:'shop',x:2,y:7,w:XST[type].w,h:XST[type].h,item:null,slots:Array(slotN(type)).fill(null)};S.st[id]=o;S.stList.push(o);return o}
const BAGN=8;
function bagSize(){return S.up.bag3?16:S.up.bag2?12:8}
function ensureBags(){const n=bagSize();S.bags.forEach(b=>{while(b.length<n)b.push(null)})}
function owned(s){return !s.need||!!S.up[s.need]}
function makeStations(){
  S.st={};S.stList=[];
  STATION_DEFS.forEach(([id,type,area,x,y,w,h,need])=>{
    const o={id,type,area,x,y,w,h,need,item:null};
    if(type==='stall')o.flower=id.slice(3);
    if(SLOTN[type])o.slots=Array(slotN(type)).fill(null);if(area==='shop')o.home='shop';
    if(type==='plot')o.plot=null;
    if(area==='north'&&id.startsWith('nv')){o.view=true;o.up=true}
    S.st[id]=o;S.stList.push(o);
  });
  for(const t in XST){const n=(S.up&&S.up['n_'+t])||0;for(let k=1;k<=n;k++)addXStation(t,k)}
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
  const O=S.odecor&&S.odecor[area];if(O&&O.length)for(const d of O){if(d.carried||d.walk)continue;if(px>=d.x*TILE&&px<(d.x+d.w)*TILE&&py>=d.y*TILE&&py<(d.y+d.h)*TILE)return true}
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
  if(best||S.edit)return best;
  const seat=seatAt(c);return seat?{type:'seat',deco:seat}:null;
}
/* 앉을 수 있는 가구(의자·소파·벤치) · 누울 수 있는 가구(돗자리) */
const SEATS={campchair:{n:1},armchair:{n:1},flowerbench:{n:2},picnicmat:{n:2,lie:true}};
function seatAt(c){const L=c.area==='shop'?S.decor:DECOR[c.area];if(!L)return null;const [dx,dy]=DIRV[c.dir]||[0,1];const fx=c.x+dx*12,fy=c.y-3+dy*12;let best=null,bd=16;
  for(const d of L){if(!SEATS[d.t]||d.carried)continue;const cx=clamp(fx,d.x*TILE,(d.x+d.w)*TILE),cy=clamp(fy,d.y*TILE,(d.y+d.h)*TILE);const dd=Math.hypot(cx-fx,cy-fy);if(dd<bd){bd=dd;best=d}}return best}

/* ---------- setup ---------- */
function makeChar(i){
  const p=i===0?[6*TILE,3.9*TILE]:[11.5*TILE,3.9*TILE];
  return {i,pal:PAL[i],area:'shop',x:p[0],y:p[1],vx:0,vy:0,dir:'down',ang:0,face:0,anim:0,moving:false,bag:S.bags[i],modal:null,rest:null,carry:null,waterT:0,boostUntil:-1,fade:0,lastAct:0};
}
function palOf(c){const p=palFromOutfit(PAL[c.i],S.outfit[c.i]||{});if(c.rest&&c.rest.lie){p.pose='lie';p.expr='sleepy'}return p}
function palFromOutfit(base,o){const p={...base,glasses:o.glasses||null,hat:o.hat||null,pin:o.pin||null,apron:o.apron||null};
  if(o.apron==='knit'){p.apron='#F6D3DB';p.apronPat='flower'}
  if(o.tee){const [a,b,c]=String(o.tee).split('|');if(b){p.top=a;p.tee=b;p.topL=c;p.num=null}else p.tee=o.tee;p.teeSh=mix(p.tee,'#3B2F3F',.15)}
  if(o.pants){if(String(o.pants).startsWith('s:'))p.skirt=o.pants.slice(2);else p.pants=o.pants}
  if(o.shoes)p.shoe=o.shoes;
  if(o.hat&&HATV[o.hat]){p.hat=HATV[o.hat][0];p.hatC=HATV[o.hat][1]}
  if(o.acc&&ACCV[o.acc])Object.assign(p,ACCV[o.acc]);
  if(o.ear&&EARV[o.ear])p.ear=EARV[o.ear];
  {const g=base.style==='f'?'f':'m',H=(o.hair&&hairDef(o.hair))||hairDef(HAIR_DEFAULT[g]);if(H){p.h2=H;p.hs=H.len==='long'||H.len==='xlong'||H.sd==='chest'?'long':H.len==='bob'||H.len==='shoulder'?'bob':'short';p.perm=false;p.bangs=false;p.hm=null}}
  if(o.hairC){p.hair=o.hairC;p.hairHi=mix(o.hairC,'#FFFFFF',.22)}
  const D=o.dress&&DRESS[o.dress];if(D){p.tee=D.c;p.teeSh=mix(D.c,'#3B2F3F',.15);p.num=null;if(D.dress){p.skirt=D.c;p.dress=1}else{p.shirt=D.shirt;if(D.l)p.shirtL=D.l}}
  const B=o.bag&&BAGS[o.bag];if(B)Object.assign(p,B);
  return p}
function stem(t,price){return {t,f:100,hyd:0,cut:0,trim:false,c:price/5}}
function genOrder(tpl,time,day){return {id:S.nextId++,...tpl,req:{...tpl.req},name:pick(NAMES),time,status:'pending',arrived:false,day}}
function rollPrices(){TYPES.forEach(t=>{S.prices[t]=Math.round(FL[t].price*rnd(.85,1.15)/100)*100})}
function planCalls(){
  S.calls=[100,280,410].map(base=>({t:base+Math.round(rnd(-10,10)),dur:40,state:'wait',offer:{tpl:pick(tplPool()),time:pick(SLOTS),name:pick(NAMES)}}));
  S.offers=[150+Math.round(rnd(-20,20)),340+Math.round(rnd(-20,20))];
}
const HAIRC=['#3B2A22','#6B4A3A','#1F1A1E','#8A5A3C','#B08560','#C9A06A','#5A3A2E','#2E2A3A'];
const TEES=['#F2B5A7','#A7C7A0','#E9D48A','#B8A6D9','#9CC5D8','#F0C3D2','#F6C48E','#C6D8A8','#E8E1D5','#7FA7C9'];
const PANTS=['#5C6A8C','#6E5B4B','#3E3E48','#8C7D6A','#A7C7A0','#D9C3A5','#4A5A70'];
const SKINS=[['#F4D3B7','#E0B597'],['#EBC3A0','#D3A284'],['#F1C9A5','#DBAA86'],['#D9A882','#BF8C68'],['#C99270','#AD7757'],['#FBE0CA','#E8C2A6']];
/* 손님·주민이 주인공(생민·수갱)과 닮지 않게: 닮으면 다시 뽑아요 */
function darkHair(h){const c=parseInt(String(h||'#888888').slice(1),16);return ((c>>16)+((c>>8)&255)+(c&255))/3<82}
function looksLikePlayer(p){if(!p)return false;if(/^#(4C82D4|3A68B3)$/i.test(p.tee||''))return true;
  if(p.style==='f'&&['long','bob'].includes(p.hs)&&darkHair(p.hair))return true; // 수갱: 긴 검은 머리
  if(p.style==='m'&&(p.hs==='short'||p.hs==='curly')&&darkHair(p.hair)&&!p.acc)return true; // 생민: 짧은 어두운 머리
  return false}
function newPal(kind,fem){let p=newPal1(kind,fem);for(let n=0;n<10&&looksLikePlayer(p);n++)p=newPal1(kind,fem);if(looksLikePlayer(p)){p.hair='#8A5A3C';p.hairHi=mix(p.hair,'#FFFFFF',.25)}return p}
function newPal1(kind,fem){
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
