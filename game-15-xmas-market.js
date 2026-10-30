'use strict';
/* 우리 둘의 꽃집 — game-15-xmas-market.js : 크리스마스 마켓 (마을 북쪽 언덕길)
   · XMAS(=game-1-core.js 맨 위) 가 true 일 때만 열려요. 노을 벤치 줄(맨 위)만 남기고 언덕길 양쪽을 마켓 광장으로 써요.
   · 해가 지기 시작하면(오후 3시 반쯤) 노점이 문을 열어요. 그 전엔 '준비 중'.
   · 노점(나무 오두막) 앞에서 행동 버튼 → 상인이 먼저 한마디 → '구경하기'로 물건 보기
   · 파는 것: 트리 오너먼트(보관함으로) · 크리스마스 옷(옷장으로) · 크리스마스 소품(가게에 놓기) · 따뜻한 간식(잠깐 빨라짐)
   · 우리 가판대: 꽃다발·리스·꽃 묶음을 올려두면 마켓 손님이 사 가요. 리스는 아주 비싸게 팔려요.
   · 메모리: 노점 그림은 한 번 굽고 계속 써요(상인도 노점 그림 안에 같이 그려서 움직이는 그림이 없어요).
     구경꾼 수는 메모리 측정 결과로 정했어요(XM_VISITORS). */

const XM_OPEN_T=390; // 이 시각(게임 분)부터 마켓 영업 — 겨울엔 오후 3시 반, 해가 기울기 시작할 때
function xmOpen(){return XM_ON&&S.t>=XM_OPEN_T}

/* ---------- 1. 파는 물건 ---------- */
/* 오너먼트(트리 보관함으로) — 일반 물건의 2배가 넘는 크리스마스 가격 */
const XM_ORN_PRICE={ballR:7000,ballG:7000,ballB:7000,candy:8000,bow:8000,snowf:9000,bell:9000,gift:11000,light:18000,wreathO:10000,pine:6000,sock:10000,icicle:7000,
  dSanta:14000,dRudolph:14000,dSnow:14000,dGinger:14000,dBear:14000,angel:16000,heart:9000,holly:8000,pearl:15000,mitten:9000,photo:12000,star:35000};
/* 새 오너먼트 6종(40차) */
Object.assign(XORN,{angel:{name:'천사 인형'},heart:{name:'유리 하트'},holly:{name:'호랑가시 열매'},pearl:{name:'진주 구슬 줄'},mitten:{name:'미니 벙어리장갑'},photo:{name:'우리 둘 사진 액자'}});
Object.keys(XM_ORN_PRICE).forEach(k=>{if(XORN[k])XORN[k].price=XM_ORN_PRICE[k]});
{const _o=xtOrn;xtOrn=function(g,k,x,y,s){s=s||1;switch(k){
  case 'angel':{poly(g,[x-2.4*s,y+3*s,x+2.4*s,y+3*s,x+1*s,y-1*s,x-1*s,y-1*s],'#FBF6EE');poly(g,[x-1*s,y-.5*s,x-3.6*s,y-2.4*s,x-2.8*s,y+.8*s],'#EAF2FB');poly(g,[x+1*s,y-.5*s,x+3.6*s,y-2.4*s,x+2.8*s,y+.8*s],'#EAF2FB');
    el(g,x,y-2*s,1.2*s,1.2*s,'#F6D2B8');g.strokeStyle='#E8C450';g.lineWidth=.4*s;g.beginPath();g.ellipse(x,y-3.6*s,1.3*s,.45*s,0,0,7);g.stroke();el(g,x,y-2.6*s,1.3*s,.7*s,'#E8C46A');return}
  case 'heart':{ln(g,x,y-3.6*s,x,y-2.4*s,'#B8A060',.4*s);g.beginPath();g.moveTo(x,y+2.6*s);g.bezierCurveTo(x-3.4*s,y,x-2.6*s,y-3.2*s,x,y-1.6*s);g.bezierCurveTo(x+2.6*s,y-3.2*s,x+3.4*s,y,x,y+2.6*s);g.fillStyle='rgba(232,90,120,.9)';g.fill();el(g,x-1.1*s,y-1.4*s,.6*s,.45*s,'rgba(255,255,255,.8)');return}
  case 'holly':{el(g,x-1.6*s,y-.6*s,2*s,.9*s,'#2F6B48',-.5);el(g,x+1.6*s,y-.6*s,2*s,.9*s,'#3A7A52',.5);[[-.6,.6],[.6,.6],[0,-.2]].forEach(([a,b])=>el(g,x+a*s,y+b*s,.8*s,.8*s,'#D32F3E'));el(g,x-.8*s,y+.3*s,.25*s,.25*s,'rgba(255,255,255,.7)');return}
  case 'pearl':{for(let j=0;j<7;j++){const t=j/6;el(g,x-7*s+t*14*s,y-1*s+Math.sin(t*Math.PI)*2.8*s,.75*s,.75*s,j%2?'#F7F2EA':'#EFE6DA')}return}
  case 'mitten':{ln(g,x-1.6*s,y-3.4*s,x+1.6*s,y-3.4*s,'#E8E2D6',.4*s);[[-1.6,'#C0463E'],[1.6,'#3F6B4E']].forEach(([dx,c])=>{rr(g,x+dx*s-1.1*s,y-2.6*s,2.2*s,3.6*s,1*s,c);el(g,x+dx*s+(dx<0?-1:1)*1*s,y-1.2*s,.5*s,.8*s,c);rr(g,x+dx*s-1.2*s,y+.6*s,2.4*s,.8*s,.3*s,'#FBFCFF')});return}
  case 'photo':{ln(g,x,y-4*s,x,y-3*s,'#B8A060',.4*s);rr(g,x-2.4*s,y-3*s,4.8*s,4.4*s,.4*s,'#C9A27A');rr(g,x-1.8*s,y-2.4*s,3.6*s,3.2*s,.2*s,'#EAF2FB');el(g,x-.8*s,y-.9*s,.7*s,.7*s,'#3B2A22');el(g,x+.8*s,y-.9*s,.7*s,.7*s,'#221C21');el(g,x,y+.6*s,.5*s,.4*s,'#E07A8C');return}}
  return _o(g,k,x,y,s)}}
/* 크리스마스 소품(가게에 놓는 장식) — 바닥 소품·벽 장식 */
const XM_GOODS={
  xmusic:{name:'회전목마 오르골',price:98000,w:1,h:1},xglobe:{name:'눈 내리는 스노우볼',price:72000,w:1,h:1},xmbox:{name:'발레리나 오르골',price:88000,w:1,h:1},
  xgingerH:{name:'진저브레드 하우스',price:86000,w:1,h:1},xminitree:{name:'미니 크리스마스 트리',price:128000,w:1,h:1},xsantaD:{name:'대형 산타 인형',price:118000,w:1,h:1},
  xnut:{name:'호두까기 인형',price:96000,w:1,h:1},xcandle:{name:'크리스마스 캔들 세트',price:62000,w:1,h:1},xsled:{name:'선물 가득 썰매',price:168000,w:2,h:1},
  xsnowD:{name:'눈사람 인형',price:82000,w:1,h:1},xdeer:{name:'루돌프 장식',price:104000,w:1,h:1},xgifts:{name:'선물 상자 더미',price:66000,w:1,h:1},
  xpoin:{name:'포인세티아 화분',price:56000,w:1,h:1},xlantern:{name:'촛불 랜턴',price:58000,w:1,h:1},xfire:{name:'벽난로',price:240000,w:2,h:1},
  xpyramid:{name:'크리스마스 피라미드(회전 촛대)',price:136000,w:1,h:1},xrug:{name:'크리스마스 러그',price:142000,w:4,h:2,flat:true},
  xwwreath:{name:'대형 문 리스',price:76000,w:1,h:1,wall:true},xwgarland:{name:'전구 가랜드 벽장식',price:84000,w:2,h:1,wall:true},xwsock:{name:'양말 걸이',price:72000,w:2,h:1,wall:true},
  xwstar:{name:'별 조명',price:66000,w:1,h:1,wall:true},xwframe:{name:'크리스마스 액자',price:60000,w:1,h:1,wall:true},xwbanner:{name:'메리 크리스마스 현수막',price:70000,w:3,h:1,wall:true}};
/* 크리스마스 옷(옷장으로) — 용품상점에서 옮겨 왔어요. 가격도 크리스마스 가격 */
HATV.santaG=['santa','#3F7D55'];HATV.santaW=['santa','#7FA8D8'];
STYLE.hat.opts.push(['santaG','엘프 모자',0],['santaW','하늘빛 산타 모자',0]);
{const _sa=styleArt;styleArt=function(k,v){if(k==='hat'&&HATV[v]&&HATV[v][0]==='santa'){const c=HATV[v][1];return sv(`<path d="M10 44 Q16 10 40 12 Q56 16 58 38 L52 40 Q48 24 38 22 L52 44Z" fill="${c}"/><rect x="8" y="40" width="46" height="10" rx="5" fill="#FBF8F2"/><circle cx="56" cy="40" r="6" fill="#FBF8F2"/>`)}return _sa(k,v)}}
const XM_WEAR=[['hat','santa',25000],['hat','santaG',28000],['hat','santaW',30000],['hat','earmuffP',30000],['hat','earmuffW',30000],['hat','beanieR',25000],
  ['pin','rudolph',25000],['pin','snowpin',20000],['tee','xknit|#C0463E',62000],['tee','xknit|#3F6B4E',62000],['tee','xknit|#F4F1EA',62000]];
function xmWearKey(cat,v){return 'st_'+cat+'_'+v}
/* 간식: 먹으면 잠깐 몸이 따뜻해져서 빨라져요 */
const XM_FOOD={vin:{name:'뱅쇼(무알코올)',price:9000,min:40,c:'#8E2A3A'},choco:{name:'마시멜로 핫초코',price:8000,min:35,c:'#6B4232'},chest:{name:'군밤 한 봉지',price:7000,min:30,c:'#8A5A3A'},
  bung:{name:'붕어빵 세 개',price:6000,min:30,c:'#D9A050'},cookie:{name:'진저브레드 쿠키',price:8000,min:30,c:'#B9773E'},churro:{name:'시나몬 츄러스',price:9000,min:35,c:'#C99050'}};
/* 용품상점에서는 크리스마스 옷을 내려요(마켓으로 이사) */
if(XM_ON){const OFF=new Set(XM_WEAR.map(([c,v])=>xmWearKey(c,v)));for(let k=SHOP_ITEMS.length-1;k>=0;k--)if(OFF.has(SHOP_ITEMS[k].id))SHOP_ITEMS.splice(k,1)}

/* ---------- 2. 노점과 상인 ---------- */
/* p: 상인 모습(노점 그림 안에 같이 그려요) · roof: 지붕색 · sell: 파는 것 · lines: 말 걸면 먼저 하는 말 */
const XMP=(o)=>Object.assign({kind:'adult',expr:'smile',blush:true,skinSh:'#E0B597',teeSh:'#00000018',pants:'#3A3A44',shoe:'#3E3E48',num:'',noW:1},o);
const XM_VENDORS=[
  {id:'xm_orn1',name:'반짝반짝 오너먼트',roof:'#B8323C',x:2,y:11,sell:{orn:['ballR','ballG','ballB','bell','snowf','icicle','star']},p:XMP({style:'f',hs:'bob',hair:'#5A3A2A',hairHi:'#7A5A44',skin:'#F4D3B7',tee:'#C0463E',coat:'pad',coatC:'#C0463E',hat:'santa',acc:'santa',scarf:'#F4F1EA'}),
    lines:['어서 오세요! 트리에 걸면 불빛을 받아서 진짜 반짝반짝해요.','유리 볼은 하나하나 입으로 불어서 만들었대요. 똑같은 게 하나도 없어요.','꼭대기 별은 올해 딱 스무 개만 들어왔어요. 벌써 반이나 나갔답니다!','금빛 볼은 따뜻한 전구랑, 은청색 볼은 흰 눈이랑 잘 어울려요.','고드름 장식은 진짜 얼음 같죠? 녹지는 않으니 걱정 마세요. 호호.','마켓은 해 질 때부터가 진짜예요. 불이 켜지면 오너먼트가 다 살아나요.','꽃집 사장님들 맞죠? 트리도 꽃처럼 예쁘게 꾸미실 것 같아요.','오늘 밤 공기가 딱 크리스마스 냄새예요. 계피랑 전나무 냄새요!']},
  {id:'xm_orn2',name:'산타 인형 공방',roof:'#3F6B4E',x:6,y:11,sell:{orn:['dSanta','dRudolph','dSnow','dGinger','dBear','angel']},p:XMP({style:'m',hs:'short',hair:'#8E8E8E',hairHi:'#B0B0B0',skin:'#EBC2A0',tee:'#3F6B4E',coat:'wool',coatC:'#5A4A3E',acc:'glasses',scarf:'#C65C5C',expr:'calm'}),
    lines:['허허, 어서 오게. 다 내가 손으로 바느질한 인형들이라네.','루돌프 코는 빨간 유리구슬이야. 불빛을 받으면 진짜 빛나지.','천사 인형은 날개 깃털을 하나하나 붙였지. 하루에 두 개밖에 못 만들어.','진저브레드 쿠키맨은 먹는 거 아니야. 허허, 다들 한 번씩 물어보더군.','이 일을 한 지 서른 해가 넘었다네. 크리스마스는 해마다 새로워.','곰 인형은 우리 손녀가 제일 좋아하는 거야. 리본도 그 아이가 골랐지.','트리에 인형이 하나 걸리면 이야기가 생기지. 그게 인형의 힘이야.']},
  {id:'xm_orn3',name:'숲속 장식',roof:'#8A5A3C',x:10,y:11,sell:{orn:['pine','wreathO','holly','light','candy','bow']},p:XMP({style:'f',hs:'long',hair:'#3A2A22',hairHi:'#5A4A3E',skin:'#EBC2A0',tee:'#7FA88A',coat:'wool',coatC:'#7A8F5A',hat:'beanie',acc:'beanie',hatC:'#C65C5C'}),
    lines:['솔방울은 뒷산에서 직접 주워서 말렸어요. 숲 냄새가 나죠?','호랑가시 열매는 행운을 부른대요. 현관에 하나쯤 걸어 두세요.','전구 줄은 작아도 밤엔 제일 눈에 띄어요. 트리가 반짝반짝!','미니 리스는 꽃집 리스랑은 비교도 안 되지만… 그래도 귀엽죠?','지팡이 사탕 장식은 진짜 사탕 아니에요! 아이들이 자꾸 핥아 봐요. 하하.','숲에서 온 것들은 크리스마스가 끝나도 오래 두고 볼 수 있어요.']},
  {id:'xm_orn4',name:'유리와 실 공방',roof:'#5A6E9A',x:14,y:11,sell:{orn:['heart','pearl','sock','mitten','photo','gift']},p:XMP({style:'f',hs:'bun',hair:'#221C21',hairHi:'#43393F',skin:'#F4D3B7',tee:'#F2B6C6',coat:'pad',coatC:'#F2C9D3',acc:'earmuff',hat:'earmuff',hatC:'#F4F1EA'}),
    lines:['유리 하트는 커플 손님들이 제일 많이 사 가요. 두 분도 하나 어때요?','사진 액자 오너먼트에는 두 분 사진을 넣어 드릴 수 있어요!','미니 벙어리장갑은 한 쌍이라 꼭 둘이 함께 걸어야 해요.','진주 구슬 줄은 한 알 한 알 실에 꿰었어요. 사흘 걸렸답니다.','양말 오너먼트 안에는 작은 소원 쪽지를 넣을 수 있어요.','올해만 파는 한정 디자인이에요. 내년엔 또 다른 걸 만들 거예요.']},
  {id:'xm_hat',name:'산타 모자 가게',roof:'#C0463E',x:18,y:11,sell:{wear:[['hat','santa'],['hat','santaG'],['hat','santaW'],['hat','earmuffP'],['hat','earmuffW'],['hat','beanieR']]},p:XMP({style:'m',hs:'short',hair:'#3A2E28',hairHi:'#5A4A40',skin:'#E8BE9C',tee:'#C0463E',coat:'pad',coatC:'#C0463E',hat:'santa',acc:'santa',expr:'grin'}),
    lines:['호호호! 모자 하나면 누구나 산타가 될 수 있어요!','엘프 모자는 올해 처음 만든 거예요. 초록색이 은근히 잘 어울려요.','귀마개는 털이 진짜 복슬복슬해요. 한번 만져 보세요!','두 분이 커플 모자 쓰시면 마켓에서 제일 눈에 띌 거예요.','방울 비니는 바람 불면 방울이 흔들려요. 그게 매력이죠.','저도 산타 모자 쓰고 장사한 지 십 년째예요. 이게 제 유니폼이에요!']},
  {id:'xm_knit',name:'크리스마스 니트',roof:'#3F6B4E',x:2,y:19,sell:{wear:[['tee','xknit|#C0463E'],['tee','xknit|#3F6B4E'],['tee','xknit|#F4F1EA'],['pin','rudolph'],['pin','snowpin']]},p:XMP({style:'f',hs:'long',hair:'#6E2A3A',hairHi:'#8E4A5A',skin:'#F4D3B7',top:'xknit',tee:'#C0463E',teeSh:'#A0363E',pin:'rudolph'}),
    lines:['할머니가 뜨개질하신 니트예요. 눈꽃 무늬 하나하나 손으로 떴어요.','크리스마스 니트는 조금 촌스러워야 예뻐요. 그게 맛이에요!','루돌프 머리띠 쓰면 아이들이 다 따라와요. 진짜예요.','니트는 한 장 뜨는 데 일주일이 걸려요. 그래서 많이는 못 팔아요.','눈꽃 핀은 머리에 꽂으면 눈이 내려앉은 것 같아요.','오늘 손님 중에 두 분이 제일 잘 어울릴 것 같은데요?']},
  {id:'xm_music',name:'오르골 공방',roof:'#8E3A4C',x:6,y:19,sell:{goods:['xmusic','xmbox','xglobe']},p:XMP({style:'m',hs:'short',hair:'#231D20',hairHi:'#3E3436',skin:'#EBC2A0',tee:'#E8E2D6',coat:'wool',coatC:'#3E4D6E',acc:'glasses',expr:'calm'}),
    lines:['태엽을 감아 보세요. …들리세요? “징글벨”이에요.','회전목마 오르골은 말이 하나하나 다 달라요. 제가 다 깎았거든요.','스노우볼은 흔들면 눈이 한참 동안 내려요. 바쁜 날 한 번씩 흔들어 보세요.','오르골 소리는 밤에 들어야 제일 예뻐요. 가게 닫고 들어 보세요.','발레리나는 뚜껑을 열면 춤을 춰요. 올해 마지막 세 개 남았어요.','소리 나는 물건은 마음까지 울린대요. 제 스승님 말씀이에요.']},
  {id:'xm_wood',name:'목각 인형 공방',roof:'#6B4A36',x:10,y:19,sell:{goods:['xnut','xdeer','xpyramid']},p:XMP({style:'m',hs:'short',hair:'#5A4030',hairHi:'#7A6050',skin:'#D9A882',tee:'#8A6A55',coat:'wool',coatC:'#6B4A36',hat:'beanie',acc:'beanie',hatC:'#3F6B4E',expr:'grin'}),
    lines:['호두까기 인형은 제가 직접 깎고 칠했어요. 진짜 호두도 깨져요! …살살요.','크리스마스 피라미드는 촛불 열로 날개가 빙글빙글 돌아요.','루돌프는 소나무로 만들어서 은은한 나무 향이 나요.','나무는 오래될수록 색이 깊어져요. 크리스마스마다 꺼내 보세요.','이건 독일식 장식이에요. 거기선 마켓이 한 달 내내 열린대요.','공방 불이 꺼지지 않는 계절이에요. 밤새 깎았답니다. 하하.']},
  {id:'xm_candle',name:'캔들 & 랜턴',roof:'#B87A3A',x:38,y:11,sell:{goods:['xcandle','xlantern','xwstar']},p:XMP({style:'f',hs:'bob',hair:'#8A5A3A',hairHi:'#AA7A5A',skin:'#F4D3B7',tee:'#E8C46A',coat:'wool',coatC:'#C9A27A',scarf:'#8E3A4C'}),
    lines:['시나몬 캔들 냄새 맡아 보세요. 크리스마스 그 자체죠?','랜턴에 촛불을 켜 두면 가게가 금방 아늑해져요.','별 조명은 벽에 걸면 은하수처럼 반짝여요.','캔들은 밀랍으로 만들어서 그을음이 거의 없어요.','겨울밤엔 큰 조명보다 작은 불빛 여러 개가 더 따뜻해요.','오늘 밤 마켓 불빛, 정말 예쁘지 않아요?']},
  {id:'xm_ginger',name:'진저브레드 하우스',roof:'#B9773E',x:42,y:11,sell:{goods:['xgingerH'],food:['cookie']},p:XMP({style:'f',hs:'bun',hair:'#3A2A22',hairHi:'#5A4A3E',skin:'#EBC2A0',tee:'#F4F1EA',apron:'#E8A0A8',coat:'pad',coatC:'#F4F1EA',hat:'santa',acc:'santa',hatC:'#C0463E'}),
    lines:['진저브레드 하우스는 먹어도 되고 장식해도 돼요. 근데 다들 아까워서 못 먹어요.','쿠키는 오늘 아침에 구웠어요. 아직 따뜻해요!','하우스 지붕 눈은 슈가파우더예요. 반짝이는 건 설탕 구슬이고요.','하우스 하나 만드는 데 꼬박 이틀 걸려요. 창문까지 다 설탕이에요.','생강 냄새 맡으면 크리스마스가 왔구나 싶죠?']},
  {id:'xm_tree',name:'미니 트리 농장',roof:'#3F6B4E',x:50,y:11,sell:{goods:['xminitree','xpoin']},p:XMP({style:'m',hs:'short',hair:'#2B211C',hairHi:'#56463C',skin:'#D9A882',tee:'#7A8F5A',coat:'pad',coatC:'#5A6B5A',hat:'beanie',acc:'beanie',hatC:'#C65C5C'}),
    lines:['꽃집 사장님이시죠? 저희 농장 전나무도 한번 봐 주세요!','미니 트리는 진짜 나무예요. 물 주면 봄까지 싱싱해요.','포인세티아 화분은 따뜻한 데 두세요. 찬바람을 싫어해요.','트리는 작아도 장식 다 달려 있어요. 바로 가게에 두시면 돼요.','올해 전나무가 유난히 향이 좋아요. 눈이 많이 와서 그런가 봐요.']},
  {id:'xm_wall',name:'벽 장식 가게',roof:'#8E3A4C',x:54,y:11,sell:{goods:['xwwreath','xwgarland','xwsock','xwframe','xwbanner']},p:XMP({style:'f',hs:'long',hair:'#5A3A2A',hairHi:'#7A5A44',skin:'#F4D3B7',tee:'#8E3A4C',coat:'wool',coatC:'#8E3A4C',acc:'earmuff',hat:'earmuff',hatC:'#F2B6C6'}),
    lines:['벽만 바꿔도 가게가 완전 크리스마스가 돼요!','양말 걸이는 이름을 수놓아 드려요. 두 분 이름 넣어 드릴까요?','현수막은 손으로 한 글자씩 수놓았어요. 메리 크리스마스!','대형 리스는 문에 걸어도, 벽에 걸어도 다 예뻐요.','전구 가랜드는 밤에 켜 두면 손님들이 사진을 찍고 가요.']},
  {id:'xm_home',name:'홈 데코',roof:'#5A6E9A',x:38,y:19,sell:{goods:['xfire','xrug','xsled','xgifts','xsnowD','xsantaD']},p:XMP({style:'m',hs:'short',hair:'#171314',hairHi:'#3E3436',skin:'#F1C9A5',tee:'#3E4D6E',coat:'wool',coatC:'#3E4D6E',scarf:'#E8C46A',expr:'grin'}),
    lines:['벽난로 하나면 가게가 오두막이 돼요. 불은 진짜가 아니니 안심하세요!','선물 가득 썰매는 포토존으로 인기 최고예요.','크리스마스 러그는 발이 푹신해요. 손님들이 오래 머물다 가실걸요?','대형 산타 인형은 손님들이 꼭 악수하고 가요. 하하.','올해 마켓 최고 인기 상품이 바로 이 벽난로예요. 마지막 두 개!']},
  {id:'xm_wine',name:'뱅쇼 & 핫초코',roof:'#8E2A3A',x:42,y:19,sell:{food:['vin','choco']},p:XMP({style:'f',hs:'bob',hair:'#231D20',hairHi:'#43393F',skin:'#EBC2A0',tee:'#F4F1EA',apron:'#8E2A3A',coat:'pad',coatC:'#2E2B30',hat:'beanie',acc:'beanie',hatC:'#F4F1EA'}),
    lines:['따뜻한 뱅쇼 한 잔 하세요! 알코올은 쏙 뺐어요.','핫초코에 마시멜로 듬뿍! 손이 금방 녹을 거예요.','추운 날 따뜻한 걸 마시면 발걸음도 가벼워져요.','계피, 오렌지, 정향… 냄새만 맡아도 몸이 따뜻해지죠?','컵은 다 마시고 가져다주시면 돼요. 마켓 전용 컵이거든요.']},
  {id:'xm_snack',name:'군밤·붕어빵',roof:'#B87A3A',x:50,y:19,sell:{food:['chest','bung']},p:XMP({style:'m',hs:'short',hair:'#8E8E8E',hairHi:'#B0B0B0',skin:'#D9A882',tee:'#8A6A55',coat:'pad',coatC:'#5A4A3E',hat:'beanie',acc:'beanie',hatC:'#5A6E9A',expr:'grin'}),
    lines:['군밤 사세요, 군밤! 방금 구워서 뜨끈뜨끈해요!','붕어빵은 팥이 꼬리까지 꽉 차 있어요. 자신 있어요!','이 자리에서만 이십 년째예요. 마켓이 생기기 전부터요. 허허.','추울 땐 군밤 한 봉지 품에 넣으면 손난로가 따로 없지.','꽃집 사장님들 오늘도 고생 많았어요. 하나 더 넣어 드릴게.']},
  {id:'xm_churro',name:'시나몬 츄러스',roof:'#C0463E',x:54,y:19,sell:{food:['churro']},p:XMP({style:'f',hs:'long',hair:'#C9A27A',hairHi:'#E0C29A',skin:'#F4D3B7',tee:'#F2C230',coat:'pad',coatC:'#F2C230',hat:'santa',acc:'santa',hatC:'#3F7D55'}),
    lines:['갓 튀긴 츄러스예요! 설탕이랑 시나몬 듬뿍!','길게 늘어진 줄 보이시죠? 다 우리 츄러스 기다리는 거예요. …농담이에요!','따뜻한 초코에 찍어 드시면 최고예요.','엘프 모자 귀엽죠? 산타 할아버지 공장에서 빌려 왔어요.']}];
const XM_CLOSED=['아직 준비 중이에요! 해가 기울면 불 켜고 열게요.','지금 물건 진열하는 중이에요. 이따 해 질 무렵에 와 주세요!','조금만 기다려요! 마켓은 노을이 지기 시작하면 열어요.','오늘 밤 마켓도 기대해 주세요. 불 켜지면 정말 예뻐요.'];
const XM_OURS={x:18,y:19};
const XM_TREE={x:46,y:17};

/* ---------- 3. 크리스마스 소품 그림(가게에 놓는 장식) ---------- */
Object.assign(DECOR_DRAW,{
  xmusic(g,d,x,y){const cx=x+8,b=y+14;shadow(g,cx,b+1,7,1.6);rr(g,cx-6,b-4,12,4,1,'#8E3A4C');rr(g,cx-6.5,b-5,13,1.4,.6,'#E8C450');ln(g,cx,b-5,cx,b-19,'#E8C450',.8);
    poly(g,[cx-7,b-17,cx,b-23,cx+7,b-17],'#C0463E');rr(g,cx-7,b-17.5,14,1.6,.6,'#F4F1EA');for(let k=0;k<4;k++){const a=k*1.57,hx=cx+Math.cos(a)*4.4,hy=b-10+Math.sin(a)*1.4;ln(g,hx,b-17,hx,b-6,'#E8C450',.4);el(g,hx,hy,1.8,1.2,['#FBF6EE','#E8B4C0','#BFE1F6','#F2D27A'][k]);el(g,hx+.9,hy-1,.7,.7,'#FBF6EE')}el(g,cx,b-23.6,.9,.9,'#F2C230')},
  xmbox(g,d,x,y){const cx=x+8,b=y+14;shadow(g,cx,b+1,7,1.6);rr(g,cx-6,b-6,12,6,1,'#3E4D6E');rr(g,cx-6,b-6,12,1.4,.5,'#E8C450');poly(g,[cx-6,b-6,cx+6,b-6,cx+5,b-13,cx-5,b-13],'#556691');rr(g,cx-4.4,b-12,8.8,5,.6,'#BFD6EE');
    ln(g,cx,b-6,cx,b-9,'#E8C450',.5);el(g,cx,b-10.6,1,1.1,'#F4D3B7');poly(g,[cx-2.2,b-8.4,cx+2.2,b-8.4,cx,b-10],'#F2B6C6');ln(g,cx-.5,b-11.4,cx-2,b-13,'#F4D3B7',.4);ln(g,cx+.5,b-11.4,cx+2,b-13,'#F4D3B7',.4)},
  xglobe(g,d,x,y){const cx=x+8,b=y+14;shadow(g,cx,b+1,6,1.4);rr(g,cx-5,b-4,10,4,1,'#8C6448');el(g,cx,b-10,6,6.4,'rgba(214,236,250,.85)');el(g,cx,b-6.4,4.6,1.2,'#FBFCFF');
    poly(g,[cx-2.6,b-6.6,cx,b-12,cx+2.6,b-6.6],'#2F6B48');poly(g,[cx-1.2,b-9.2,cx,b-12,cx+1.2,b-9.2],'#FBFCFF');const q=seedRand(3);for(let k=0;k<9;k++)el(g,cx-4+q()*8,b-15+q()*8,.35,.35,'#FFFFFF');el(g,cx-2.4,b-13,1.4,.8,'rgba(255,255,255,.7)',-.5)},
  xgingerH(g,d,x,y){const cx=x+8,b=y+14;shadow(g,cx,b+1,8,1.8);rr(g,cx-6,b-9,12,9,.6,'#B9773E');poly(g,[cx-8,b-8,cx,b-17,cx+8,b-8],'#9C5E2E');poly(g,[cx-8,b-8,cx,b-17,cx+8,b-8,cx+7,b-6.6,cx,b-15,cx-7,b-6.6],'#FBFCFF');
    rr(g,cx-1.6,b-5,3.2,5,1.4,'#7A4A28');[[-4,-5.6],[4,-5.6]].forEach(([a,c])=>{rr(g,cx+a-1.2,b+c-1,2.4,2.4,.4,'#F2D27A');g.strokeStyle='#FFFFFF';g.lineWidth=.35;g.strokeRect(cx+a-1.2,b+c-1,2.4,2.4)});[-5,-2,1,4].forEach(a=>el(g,cx+a,b-.4,.6,.6,['#D32F3E','#3F9A5A','#F2C230','#4F8FD8'][(a+5)%4]))},
  xminitree(g,d,x,y){const cx=x+8,b=y+14;shadow(g,cx,b+1,7,1.8);rr(g,cx-4.5,b-5,9,5,1,'#B8574A');rr(g,cx-5,b-5.6,10,1.6,.6,'#E8C450');
    [[0,7.6],[5,6.2],[9.5,4.6],[13.5,3]].forEach(([dy,w],k)=>{poly(g,[cx-w,b-5-dy,cx,b-12-dy,cx+w,b-5-dy],k%2?'#2F6B48':'#3A7A52')});starPath(g,cx,b-26.5,2.2,.9,0);g.fillStyle='#F2C230';g.fill();
    [[-4,-8,'#D32F3E'],[3.6,-10,'#F2C230'],[-1.6,-14,'#4F8FD8'],[2,-18,'#D32F3E'],[-2.4,-20.6,'#FFFFFF'],[4.6,-7,'#FFFFFF']].forEach(([a,c,col])=>el(g,cx+a,b+c,.85,.85,col))},
  xsantaD(g,d,x,y){const cx=x+8,b=y+14;shadow(g,cx,b+1,7,1.8);el(g,cx,b-6,6.4,6,'#C8303E');rr(g,cx-6.4,b-7,12.8,1.8,.8,'#2E2B30');rr(g,cx-1.2,b-7.4,2.4,2.4,.4,'#E8C450');rr(g,cx-6,b-1.4,12,1.6,.8,'#FBF8F2');
    el(g,cx,b-15,4.4,4.2,'#F6D2B8');el(g,cx,b-12.6,4.6,3.4,'#FFFFFF');el(g,cx,b-14.4,1.2,.9,'#FFFFFF');poly(g,[cx-4.6,b-17,cx+4.6,b-17,cx+3,b-23],'#C8303E');rr(g,cx-4.8,b-18,9.6,2,1,'#FBF8F2');el(g,cx+3.2,b-23.4,1.2,1.2,'#FBF8F2');el(g,cx-1.4,b-15.6,.4,.4,'#2A2626');el(g,cx+1.4,b-15.6,.4,.4,'#2A2626');el(g,cx,b-14.6,.7,.5,'#E89A8A')},
  xnut(g,d,x,y){const cx=x+8,b=y+14;shadow(g,cx,b+1,5,1.4);rr(g,cx-4,b-2,8,2,.6,'#3A2E2A');rr(g,cx-2.6,b-8,2,6,.4,'#2E2B30');rr(g,cx+.6,b-8,2,6,.4,'#2E2B30');rr(g,cx-3.4,b-16,6.8,8.4,1,'#C8303E');rr(g,cx-3.4,b-11,6.8,1.2,.3,'#E8C450');
    ln(g,cx,b-16,cx,b-8.4,'#E8C450',.5);rr(g,cx-2.8,b-21,5.6,5,1,'#F2D2B4');rr(g,cx-2.6,b-18.2,5.2,2.2,.6,'#FBFCFF');rr(g,cx-3.2,b-27,6.4,6.4,.8,'#2E2B30');rr(g,cx-3.4,b-21.6,6.8,1.2,.3,'#E8C450');el(g,cx,b-27.6,1,1,'#E8C450');el(g,cx-1.1,b-20,.4,.4,'#2A2626');el(g,cx+1.1,b-20,.4,.4,'#2A2626')},
  xcandle(g,d,x,y){const cx=x+8,b=y+14;shadow(g,cx,b+1,7,1.6);el(g,cx,b-1,7,2,'#C9A27A');[[-4,7,'#C0463E'],[0,10,'#F4F1EA'],[4,6,'#3F6B4E']].forEach(([a,h,c])=>{rr(g,cx+a-1.6,b-1-h,3.2,h,.6,c);el(g,cx+a,b-2.4-h,.8,1.3,'#FFC94A');el(g,cx+a,b-2.6-h,.35,.6,'#FFF4C2')});
    for(let k=0;k<6;k++)el(g,cx-6+k*2.4,b-.6,1.4,.8,k%2?'#2F6B48':'#3A7A52');el(g,cx-2,b-.4,.6,.6,'#D32F3E');el(g,cx+3,b-.2,.6,.6,'#D32F3E')},
  xsled(g,d,x,y,w){const b=y+14;shadow(g,x+w/2,b+1,w/2-2,2);g.strokeStyle='#C9A050';g.lineWidth=1.2;g.beginPath();g.moveTo(x+3,b);g.lineTo(x+w-6,b);g.quadraticCurveTo(x+w-1,b,x+w-2,b-5);g.stroke();
    poly(g,[x+5,b-3,x+w-7,b-3,x+w-4,b-10,x+w-6,b-12,x+7,b-12,x+4,b-8],'#C8303E');rr(g,x+6,b-12.4,w-13,1.6,.6,'#E8C450');[[x+9,'#4F8FD8',6,6],[x+15,'#3F8F5F',5,8],[x+20,'#F2C230',6,5],[x+24,'#F4F1EA',4,7]].forEach(([bx,c,ww,hh])=>{rr(g,bx-ww/2,b-12-hh,ww,hh,.6,c);g.fillStyle='#D32F3E';g.fillRect(bx-.4,b-12-hh,.8,hh)})},
  xsnowD(g,d,x,y){DECOR_DRAW.snowman(g,{v:1},x,y)},
  xdeer(g,d,x,y){const cx=x+8,b=y+14;shadow(g,cx,b+1,7,1.6);const c='#A8744A';[[-4,0],[-2,0],[3,0],[5,0]].forEach(([a])=>ln(g,cx+a,b-6,cx+a,b,'#7A5236',1.1));el(g,cx,b-8,6.4,3.4,c);ln(g,cx+5,b-9,cx+6.6,b-15,c,2.2);el(g,cx+7.4,b-16,2.6,2,c);el(g,cx+9.6,b-15.6,1,1,'#E8343F');
    ln(g,cx+6.6,b-17.6,cx+5.4,b-21.6,'#6B4A36',.6);ln(g,cx+5.8,b-20,cx+4.4,b-20.6,'#6B4A36',.5);ln(g,cx+8,b-17.6,cx+9,b-21.6,'#6B4A36',.6);ln(g,cx+8.6,b-20,cx+10,b-20.6,'#6B4A36',.5);rr(g,cx+4.4,b-13.6,3.6,1.6,.6,'#C8303E');el(g,cx+6.2,b-11.6,.8,.8,'#E8C450');el(g,cx-6,b-9,1.4,1,'#FBFCFF')},
  xgifts(g,d,x,y){const b=y+14;shadow(g,x+8,b+1,7,1.6);[[x+5,b,7,6,'#C8303E','#F2C230'],[x+11.5,b,6,5,'#3F8F5F','#FBF8F2'],[x+8,b-6,6,5,'#4F8FD8','#FBF8F2'],[x+12,b-5,4,4,'#F2C230','#C8303E']].forEach(([cx,by,w,h,c,r])=>{rr(g,cx-w/2,by-h,w,h,.6,c);g.fillStyle=r;g.fillRect(cx-.45,by-h,.9,h);g.fillRect(cx-w/2,by-h*.55,w,.9);el(g,cx-.8,by-h-.4,.9,.6,r);el(g,cx+.8,by-h-.4,.9,.6,r)})},
  xpoin(g,d,x,y){const cx=x+8,b=y+14;shadow(g,cx,b+1,6,1.6);poly(g,[cx-5,b-6,cx+5,b-6,cx+4,b,cx-4,b],'#C9A050');rr(g,cx-5.6,b-7,11.2,1.8,.6,'#E8C450');
    for(let k=0;k<7;k++){const a=-Math.PI/2+(k-3)*.42;el(g,cx+Math.cos(a)*4.6,b-11+Math.sin(a)*3.4,2.6,1.2,'#2F6B48',a)}for(let k=0;k<6;k++){const a=k/6*Math.PI*2;el(g,cx+Math.cos(a)*2.6,b-13+Math.sin(a)*2,2.2,1,'#C8262E',a)}el(g,cx,b-13,.8,.8,'#F2C230')},
  xlantern(g,d,x,y){const cx=x+8,b=y+14;shadow(g,cx,b+1,5,1.4);rr(g,cx-4,b-2,8,2,.6,'#2E2B30');rr(g,cx-3.6,b-13,7.2,11,1,'rgba(255,230,170,.55)');g.strokeStyle='#2E2B30';g.lineWidth=.7;g.strokeRect(cx-3.6,b-13,7.2,11);ln(g,cx,b-13,cx,b-2,'#2E2B30',.4);
    poly(g,[cx-4.6,b-13,cx+4.6,b-13,cx,b-17],'#2E2B30');g.strokeStyle='#2E2B30';g.beginPath();g.arc(cx,b-18,1.4,0,7);g.stroke();rr(g,cx-1,b-7,2,4,.4,'#F4EEDC');el(g,cx,b-8,.8,1.3,'#FFC94A');bowV(g,cx,b-13,'#C8303E')},
  xfire(g,d,x,y,w){const b=y+14;shadow(g,x+w/2,b+1,w/2-1,2);rr(g,x+1,b-20,w-2,20,1,'#C9A27A');for(let yy=b-18;yy<b;yy+=3.4)for(let xx=x+2+((yy/3.4|0)%2)*3;xx<x+w-2;xx+=6){g.fillStyle='rgba(120,70,40,.2)';g.fillRect(xx,yy,5.4,.5)}
    rr(g,x-1,b-22,w+2,3,.8,'#8C6448');rr(g,x+7,b-14,w-14,13,4,'#2E2422');const fl=['#FFC94A','#F28A3C','#E8503C'];fl.forEach((c,k)=>poly(g,[x+11+k*2,b-1,x+w/2-1+k*1.4,b-11+k*2.4,x+w-11-k*2,b-1],c));
    for(let k=0;k<2;k++){rr(g,x+6+k*(w-16),b-27,4,5,.6,k?'#3F6B4E':'#C8303E');rr(g,x+5.6+k*(w-16),b-27.6,4.8,1.6,.5,'#FBFCFF')}for(let k=0;k<7;k++)el(g,x+3+k*(w-6)/6,b-22.4,1.6,1,k%2?'#2F6B48':'#3A7A52')},
  xpyramid(g,d,x,y){const cx=x+8,b=y+14;shadow(g,cx,b+1,6,1.4);[[0,6],[6,5],[11,4]].forEach(([dy,w])=>{rr(g,cx-w,b-1-dy,w*2,1.2,.4,'#8C6448');for(let k=-1;k<=1;k++)el(g,cx+k*w*.55,b-3-dy,.9,1.7,['#C8303E','#F4F1EA','#3F6B4E'][k+1])});ln(g,cx,b,cx,b-17,'#6B4A36',.8);
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2;el(g,cx+Math.cos(a)*5.4,b-18+Math.sin(a)*1.2,2.4,.8,'#D8B48C',a)}[-5,0,5].forEach(a=>{rr(g,cx+a-.6,b-.8-2.6,1.2,2.6,.3,'#F4EEDC');el(g,cx+a,b-4,.5,.8,'#FFC94A')})},
  xrug(g,d,x,y,w,h){rr(g,x+2,y+2,w-4,h-4,8,'#B8323C');rr(g,x+5,y+5,w-10,h-10,6,'#C8484E');g.strokeStyle='#F4F1EA';g.lineWidth=1;rr(g,x+7,y+7,w-14,h-14,5);g.stroke();
    for(let k=0;k<5;k++){const cx=x+14+k*((w-28)/4),cy=y+h/2;for(let j=0;j<3;j++){const a=j*Math.PI/3;ln(g,cx-Math.cos(a)*3.4,cy-Math.sin(a)*3.4,cx+Math.cos(a)*3.4,cy+Math.sin(a)*3.4,'#F4F1EA',.7)}}for(let k=0;k<w-8;k+=6){el(g,x+6+k,y+3.6,1.2,.8,'#3F7D55');el(g,x+6+k,y+h-3.6,1.2,.8,'#3F7D55')}},
  xwwreath(g,d,x,y){wreathV(g,x+8,y-20,6.4,{cotton:true});for(let k=0;k<6;k++){const a=k/6*Math.PI*2;el(g,x+8+Math.cos(a)*6.4,y-20+Math.sin(a)*6.4,.9,.9,['#F2C230','#FFFFFF'][k%2])}},
  xwgarland(g,d,x,y,w){drawGarland(g,x+2,x+w-2,y-25,w/2-2,4)},
  xwsock(g,d,x,y,w){rr(g,x+1,y-27,w-2,2,.8,'#8C6448');[[x+6,'#C8303E'],[x+16,'#3F6B4E'],[x+26,'#C8303E']].forEach(([sx,c],k)=>{if(sx>x+w-3)return;ln(g,sx,y-25,sx,y-23,'#E8C450',.5);rr(g,sx-2.4,y-23,4.8,7,1,c);rr(g,sx-2.4,y-17.4,6.4,3,1.4,c);rr(g,sx-2.8,y-23.4,5.6,2.2,.8,'#FBFCFF');el(g,sx+.4,y-19.4,.7,.7,'#F2C230')})},
  xwstar(g,d,x,y){const gr=g.createRadialGradient(x+8,y-21,0,x+8,y-21,9);gr.addColorStop(0,'rgba(255,236,160,.5)');gr.addColorStop(1,'rgba(255,236,160,0)');g.fillStyle=gr;g.fillRect(x-1,y-30,18,18);starPath(g,x+8,y-21,6,2.6,0);g.fillStyle='#F7D046';g.fill();g.strokeStyle='#D8A020';g.lineWidth=.5;g.stroke();
    for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?2.6:6;el(g,x+8+Math.cos(a)*r,y-21+Math.sin(a)*r,.5,.5,'#FFF8D6')}},
  xwframe(g,d,x,y){rr(g,x+2,y-28,12,13,.8,'#C9A27A');rr(g,x+3.4,y-26.6,9.2,10.2,.4,'#1E2A4A');for(let k=0;k<8;k++)el(g,x+4+((k*37)%9),y-26+((k*23)%9),.3,.3,'#FFFFFF');el(g,x+8,y-19,3,1,'#FBFCFF');
    poly(g,[x+6,y-19,x+8,y-24,x+10,y-19],'#2F6B48');el(g,x+8,y-24.2,.5,.5,'#F2C230');bowV(g,x+8,y-28,'#C8303E')},
  xwbanner(g,d,x,y,w){ln(g,x+2,y-28,x+w-2,y-28,'#8C6448',.6);poly(g,[x+3,y-28,x+w-3,y-28,x+w-5,y-20,x+w/2,y-18,x+5,y-20],'#C8303E');g.fillStyle='#FBF8F2';g.font="5px 'Jua',sans-serif";g.textAlign='center';g.textBaseline='middle';g.fillText('Merry Christmas',x+w/2,y-23.6);
    for(let k=0;k<5;k++)el(g,x+5+k*(w-10)/4,y-28,.9,.9,XBC[k%5])}});
Object.assign(PR_DEB,{xmusic:[0,-12,0,1],xmbox:[0,-4,0,1],xglobe:[0,-4,0,1],xgingerH:[0,-6,0,1],xminitree:[0,-16,0,1],xsantaD:[0,-12,0,1],xnut:[0,-16,0,1],xcandle:[0,-4,0,1],xsled:[0,-8,0,1],xsnowD:PR_DEB.snowman,xdeer:[0,-10,0,1],xgifts:[0,-4,0,1],xpoin:[0,-4,0,1],xlantern:[0,-6,0,1],xfire:[0,-16,0,1],xpyramid:[0,-8,0,1],xrug:[0,0,0,0]});

/* ---------- 4. 언덕길을 마켓 광장으로 ---------- */
const XM_VBY={};XM_VENDORS.forEach(v=>XM_VBY[v.id]=v);
const XM_PLAZA=[[8,150,378,352],[586,150,922,352]]; // [x0,y0,x1,y1] 월드 좌표
if(XM_ON){
  DECOR_BASE.north=DECOR_BASE.north.filter(d=>d.t!=='tree'&&d.t!=='lamp');
  DECOR_BASE.north.push(...[[4,15],[17,15],[40,15],[53,15],[1,10],[22,10],[38,10],[56,10]].map(([x,y])=>({t:'lamp',x,y,w:1,h:1})),
    {t:'xmsleigh',x:6,y:14,w:4,h:1},{t:'xmdeer',x:3,y:14,w:1,h:1,v:0},{t:'xmdeer',x:11,y:14,w:1,h:1,v:1},{t:'xgifts',x:12,y:14,w:1,h:1},{t:'xmsign',x:21,y:14,w:1,h:1},{t:'snowman',x:14,y:15,w:1,h:1,v:2},
    {t:'xmtree',x:XM_TREE.x,y:XM_TREE.y,w:2,h:1},{t:'xminitree',x:37,y:16,w:1,h:1},{t:'xminitree',x:56,y:16,w:1,h:1},
    {t:'xmphoto',x:14,y:19,w:3,h:1},);
  ['nb1','nb2'].forEach(id=>{const d=STATION_DEFS.find(q=>q[0]===id);if(d)d[7]='$nowinter'});
  STATION_DEFS.push(['xmb1','bench','north',42,14,2,1],['xmb2','bench','north',50,14,2,1]);
  XM_VENDORS.forEach(v=>STATION_DEFS.push([v.id,'xmstall','north',v.x,v.y,3,1]));
  STATION_DEFS.push(['xmours','xmours','north',XM_OURS.x,XM_OURS.y,3,1]);
  SLOTN.xmours=6;
  const _bg=bgDraw;bgDraw=function(area,s,q){const cv=_bg(area,s,q);if(area==='north'){const g=cv.getContext('2d');g.setTransform(s*q,0,0,s*q,0,0);xmGround(g)}return cv};
}
function xmGround(g){const q=seedRand(404);
  for(const [x0,y0,x1,y1] of XM_PLAZA){rr(g,x0,y0,x1-x0,y1-y0,10,'#D8CDBF');
    for(let y=y0+3,r=0;y<y1-4;y+=7,r++)for(let x=x0+3+(r%2)*5;x<x1-6;x+=10){rr(g,x,y,8.6,5.6,2.2,q()<.5?'#CEC2B2':'#D4C8B8');g.fillStyle='rgba(255,255,255,.28)';g.fillRect(x+1.2,y+.6,6,.7)}
    g.save();g.beginPath();rr(g,x0,y0,x1-x0,y1-y0,10);g.clip();for(let k=0;k<70;k++){const x=x0+q()*(x1-x0),y=y0+q()*(y1-y0),r=2+q()*5;g.globalAlpha=.55+q()*.3;el(g,x,y,r*1.5,r*.5,'#F7FAFD')}g.globalAlpha=1;
    for(let x=x0;x<x1;x+=7){el(g,x+q()*4,y0+1,4+q()*3,2.4,'#FBFCFF');el(g,x+q()*4,y1-1,4+q()*3,2.2,'#FBFCFF')}g.restore()}}

/* ---------- 5. 노점(나무 오두막) 그림 ---------- */
function xmStallBase(g,x,y,w,roof,open,name,sub){
  shadow(g,x+w/2,y+15,w/2+2,2.6);
  rr(g,x+3,y-31,w-6,34,1,'#7A5236');for(let yy=y-29;yy<y+2;yy+=4.2){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x+3,yy,w-6,.5)}
  if(open){const gl=g.createLinearGradient(0,y-31,0,y);gl.addColorStop(0,'rgba(255,214,150,.0)');gl.addColorStop(1,'rgba(255,214,150,.35)');g.fillStyle=gl;g.fillRect(x+4,y-30,w-8,30)}
  return function front(){
    rr(g,x+1,y-3,w-2,16,1.2,'#B98A63');for(let k=1;k<6;k++){g.fillStyle='rgba(90,55,30,.25)';g.fillRect(x+1+k*(w-2)/6,y-2,.6,14)}rr(g,x-1,y-5,w+2,3.6,1,'#D8B48C');rr(g,x-1,y-5,w+2,1,.5,'#FBFCFF');
    [x+1.5,x+w-3.5].forEach(px=>rr(g,px,y-34,2,47,.6,'#6B4A36'));
    poly(g,[x-5,y-31,x+w/2,y-47,x+w+5,y-31,x+w+3,y-29.4,x+w/2,y-44.6,x-3,y-29.4],roof);poly(g,[x-3,y-29.4,x+w/2,y-44.6,x+w+3,y-29.4],mix(roof,'#000000',.18));
    poly(g,[x-5.6,y-30.6,x+w/2,y-48,x+w+5.6,y-30.6,x+w+3,y-31.8,x+w/2,y-45.6,x-3,y-31.8],'#FBFCFF');for(let k=0;k<6;k++)el(g,x-3+k*(w+6)/5,y-30.4,1.6,1,'#FBFCFF');for(let k=0;k<5;k++){const ix=x-1+k*(w+2)/4;poly(g,[ix-.8,y-30,ix+.8,y-30,ix,y-27.4-(k%2)*1.4],'rgba(220,238,250,.95)')}
    drawGarland(g,x-1,x+w+1,y-29,w/3.2,2.6);
    let fs=4.1;g.font=`${fs}px 'Jua',sans-serif`;let tw=g.measureText(name).width;if(tw>w-6){fs*= (w-6)/tw;g.font=`${fs}px 'Jua',sans-serif`;tw=g.measureText(name).width}const sw=Math.max(26,tw+6);
    rr(g,x+w/2-sw/2,y-41,sw,8,1.6,'#FFF8EE');g.strokeStyle=mix(roof,'#000',.1);g.lineWidth=.7;rr(g,x+w/2-sw/2,y-41,sw,8,1.6);g.stroke();g.fillStyle=mix(roof,'#2A1A1A',.35);g.textAlign='center';g.textBaseline='middle';g.fillText(name,x+w/2,y-36.8);
    if(!open){rr(g,x+4,y-28,w-8,23,1,'#9C6B4C');for(let k=0;k<5;k++){g.fillStyle='rgba(0,0,0,.14)';g.fillRect(x+4,y-28+k*4.6,w-8,.6)}rr(g,x+w/2-9,y-20,18,7,1.4,'#FFF8EE');g.fillStyle='#8A5A3C';g.font="3.6px 'Jua',sans-serif";g.fillText(sub||'준비 중',x+w/2,y-16.4)}
  }}
function xmGoodItem(g,k,px,by,sc){const it=XM_GOODS[k];if(!it||!DECOR_DRAW[k])return;g.save();g.translate(px,by);g.scale(sc,sc);
  try{if(it.wall)DECOR_DRAW[k](g,{},-it.w*8,30,it.w*TILE,16);else if(it.flat)DECOR_DRAW[k](g,{},-it.w*8,-it.h*16,it.w*TILE,it.h*TILE);else DECOR_DRAW[k](g,{},-it.w*8,-14,it.w*TILE,TILE)}catch(e){}g.restore()}
/* 노점 안쪽(상인 뒤·위): 오너먼트 줄 · 니트 걸이 · 선반 */
function xmGoodsBack(g,v,x,y,w){const S2=v.sell;
  if(S2.orn){ln(g,x+5,y-26,x+w-5,y-26,'#8C6448',.7);S2.orn.slice(0,6).forEach((k,i)=>{const px=x+8+i*(w-16)/5;ln(g,px,y-26,px,y-22,'#B8A060',.3);xtOrn(g,k,px,y-19,.9)})}
  if(S2.wear&&S2.wear.some(([c])=>c==='tee'))for(let k=0;k<3;k++){const col=['#C0463E','#3F6B4E','#F4F1EA'][k],ox=x+6+k*14;ln(g,ox+4,y-26,ox+4,y-24,'#8C6448',.4);poly(g,[ox,y-24,ox+8,y-24,ox+9,y-20,ox+7,y-20,ox+7,y-12,ox+1,y-12,ox+1,y-20,ox-1,y-20],col);for(let j=0;j<3;j++)el(g,ox+2+j*2,y-17,.4,.4,k===2?'#C0463E':'#FBF8F2')}
  if(S2.goods){rr(g,x+5,y-20,w-10,1.4,.4,'#8C6448');S2.goods.slice(0,5).forEach((k,i,L)=>xmGoodItem(g,k,x+8+i*(w-16)/Math.max(1,L.length-1),y-20,.32))}}
/* 계산대 위 */
function xmGoods(g,v,x,y,w){const S2=v.sell,cy=y-5;
  if(S2.orn)S2.orn.slice(0,4).forEach((k,i)=>xtOrn(g,k,x+11+i*8.6,cy-2.4,.75));
  if(S2.wear){const L=S2.wear.filter(([c])=>c!=='tee');L.forEach(([c,val],i)=>{const px=x+8+i*(w-16)/Math.max(1,L.length-1),H=HATV[val];
    if(c==='hat'){const col=H?H[1]:'#C8262E';if(H&&H[0]==='earmuff'){g.strokeStyle=mix(col,'#000',.2);g.lineWidth=.7;g.beginPath();g.arc(px,cy-2,3,Math.PI,0);g.stroke();el(g,px-3,cy-1.5,1.6,1.8,col);el(g,px+3,cy-1.5,1.6,1.8,col)}
      else if(H&&H[0]==='beanie'){el(g,px,cy-2.6,3.4,2.8,col);rr(g,px-3.6,cy-1.4,7.2,1.6,.6,mix(col,'#fff',.25));el(g,px,cy-5.6,1.2,1.2,'#FBF8F2')}
      else{poly(g,[px-3.4,cy-1.2,px+3.4,cy-1.2,px+2.6,cy-6.4],col);rr(g,px-3.8,cy-1.8,7.6,1.8,.8,'#FBF8F2');el(g,px+2.6,cy-6.6,1,1,'#FBF8F2')}}
    else if(val==='rudolph'){g.strokeStyle='#6B4A36';g.lineWidth=.6;g.beginPath();g.arc(px,cy-1,2.6,Math.PI,0);g.stroke();ln(g,px-2,cy-3,px-3,cy-5.4,'#7A5236',.5);ln(g,px+2,cy-3,px+3,cy-5.4,'#7A5236',.5);el(g,px,cy-1,.7,.7,'#E8343F')}
    else{for(let j=0;j<3;j++){const a2=j*Math.PI/3;ln(g,px-Math.cos(a2)*2,cy-2.4-Math.sin(a2)*2,px+Math.cos(a2)*2,cy-2.4+Math.sin(a2)*2,'#BFE1F6',.5)}}})}
  if(S2.goods){const L=S2.goods.slice(0,3);L.forEach((k,i)=>xmGoodItem(g,k,x+w*(i+.5)/L.length,cy+1,XM_GOODS[k]&&XM_GOODS[k].w>1?.3:.5))}
  if(S2.food)xmFoodDraw(g,S2.food,x,y,w)}
function xmFoodDraw(g,F,x,y,w){const cy=y-5,tt=0;F.forEach((k,i)=>{const px=x+12+i*(w-24)/Math.max(1,F.length-1),f=XM_FOOD[k];
  if(k==='vin'||k==='choco'){rr(g,px-5,cy-6,10,6,1.2,'#5A5A60');el(g,px,cy-6,5,1.4,f.c);for(let j=0;j<3;j++)rr(g,px+6+j*2.4-8,cy+.4,2,2.4,.4,'#F4F1EA');g.globalAlpha=.5;el(g,px-1,cy-10,1.6,2.6,'#FFFFFF');el(g,px+1.6,cy-12,1.2,2,'#FFFFFF');g.globalAlpha=1}
  else if(k==='chest'){el(g,px,cy-2,5.6,2.6,'#2E2B30');for(let j=0;j<6;j++)el(g,px-3.4+j*1.4,cy-3-(j%2)*.8,.9,.8,'#8A5A3A');g.globalAlpha=.45;el(g,px,cy-8,1.6,2.6,'#FFFFFF');g.globalAlpha=1}
  else if(k==='bung'){for(let j=0;j<3;j++){el(g,px-3.6+j*3.6,cy-1.8,1.8,1,'#D9A050');poly(g,[px-2.2+j*3.6,cy-1.8,px-1.4+j*3.6,cy-2.8,px-1.4+j*3.6,cy-.8],'#D9A050')}}
  else if(k==='churro'){for(let j=0;j<5;j++){ln(g,px-3+j*1.5,cy,px-4+j*1.8,cy-8,'#C99050',.9)}rr(g,px-4,cy-2,8,2.6,.6,'#F4F1EA')}
  else if(k==='cookie'){for(let j=0;j<3;j++){const q=px-4+j*4;el(g,q,cy-3,1.1,1.1,'#B9773E');rr(g,q-1,cy-2,2,2.4,.6,'#B9773E')}}})}
STATION_DRAW.xmstall=(g,s,x,y,w)=>{const v=XM_VBY[s.id];if(!v)return;const open=xmOpen();const front=xmStallBase(g,x,y,w,v.roof,open,v.name);
  if(open){xmGoodsBack(g,v,x,y,w);drawChar(g,x+w/2,y+3,v.p,'down',0,false,false,false,false)}front();if(open)xmGoods(g,v,x,y,w)};
PR_STB.xmstall=[-8,-60,8,4];

/* ---------- 6. 마켓 장식(큰 트리 · 썰매 포토존 · 루돌프 · 표지판 · 줄 전구) ---------- */
const XM_TREE_O=['star','ballR','dSanta','light','ballG','candy','bell','light','dRudolph','heart','ballB','wreathO','light','snowf','dGinger','sock','pine','light','angel','gift','holly'];
Object.assign(DECOR_DRAW,{
  xmtree(g,d,x,y,w){g.save();g.translate(x+w/2,y+14);g.scale(1.3,1.3);drawXTree(g,0,0,XM_TREE_O,{stage:5});g.restore();
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2;rr(g,x+w/2+Math.cos(a)*28-1,y+15+Math.sin(a)*6-6,2,6,.6,'#8C6448')}g.strokeStyle='#C8303E';g.lineWidth=.8;g.beginPath();g.ellipse(x+w/2,y+11,28,6,0,0,7);g.stroke()},
  xmsleigh(g,d,x,y,w){const b=y+14;shadow(g,x+w/2,b+1,w/2,2.4);g.strokeStyle='#E8C450';g.lineWidth=1.6;g.beginPath();g.moveTo(x+2,b);g.lineTo(x+w-10,b);g.quadraticCurveTo(x+w-1,b,x+w-2,b-8);g.stroke();
    poly(g,[x+5,b-4,x+w-12,b-4,x+w-6,b-14,x+w-9,b-18,x+9,b-18,x+5,b-11],'#C8303E');poly(g,[x+5,b-11,x+9,b-18,x+16,b-18,x+12,b-11],'#A82838');rr(g,x+8,b-19,w-19,2,.8,'#E8C450');
    for(let k=0;k<6;k++){const bx=x+14+k*6,hh=6+(k%3)*3,c=['#4F8FD8','#3F8F5F','#F2C230','#F4F1EA','#B88AD0','#E85A5A'][k];rr(g,bx-2.6,b-18-hh,5.2,hh,.6,c);g.fillStyle=k%2?'#C8303E':'#FBF8F2';g.fillRect(bx-.4,b-18-hh,.8,hh)}
    rr(g,x+w/2-10,b-34,20,7,1.4,'#FFF8EE');g.fillStyle='#C8303E';g.font="4px 'Jua',sans-serif";g.textAlign='center';g.textBaseline='middle';g.fillText('산타 썰매 포토존',x+w/2,b-30.4)},
  xmdeer(g,d,x,y){g.save();g.translate(x+8,y+15);g.scale(d.v?-1.5:1.5,1.5);DECOR_DRAW.xdeer(g,d,-8,-15);g.restore()},
  xmsign(g,d,x,y){const cx=x+8;shadow(g,cx,y+15,4,1.2);rr(g,cx-1,y-20,2,35,.6,'#8C6448');[['크리스마스 마켓',-18,'#C8303E',-1],['우리 꽃집 가판대 ↓',-10,'#3F6B4E',1]].forEach(([t,yy,c,dir])=>{poly(g,[cx-15,y+yy,cx+13,y+yy,cx+16,y+yy+3.2,cx+13,y+yy+6.4,cx-15,y+yy+6.4],'#FFF8EE');g.fillStyle=c;g.font="2.9px 'Jua',sans-serif";g.textAlign='center';g.textBaseline='middle';g.fillText(t,cx,y+yy+3.4)});el(g,cx,y-20.6,4,1.2,'#FBFCFF')},
  xmphoto(g,d,x,y,w){const b=y+14;shadow(g,x+w/2,b+1,w/2,2);[x+3,x+w-3].forEach(px=>rr(g,px-1.2,b-34,2.4,34,.6,'#8C6448'));rr(g,x+2,b-36,w-4,24,2,'#C8303E');rr(g,x+5,b-33,w-10,18,1.4,'rgba(255,248,238,.15)');
    g.fillStyle='#FBF8F2';g.font="4.6px 'Jua',sans-serif";g.textAlign='center';g.textBaseline='middle';g.fillText('MERRY',x+w/2,b-28);g.fillText('CHRISTMAS',x+w/2,b-22);for(let k=0;k<8;k++)el(g,x+4+k*(w-8)/7,b-36,1,1,XBC[k%5]);drawGarland(g,x+2,x+w-2,b-36,(w-4)/2,2,{noDots:true})},
  xstrmk(g,d){xmStrings(d.side).forEach(P=>{g.strokeStyle='#2E3A30';g.lineWidth=.45;g.beginPath();P.forEach(([x,y],k)=>k?g.lineTo(x,y):g.moveTo(x,y));g.stroke()})}});
Object.assign(PR_DEB,{xmtree:[-34,-158,34,6],xmsleigh:[0,-26,0,1],xmdeer:[-4,-20,4,1],xmsign:[-8,-22,8,1],xmphoto:[0,-38,0,1]});
/* 광장 위로 늘어진 줄 전구: 가로등 머리끼리 이어요 */
function xmStrings(side){const A=side?[[588,190],[40*16+8,215],[53*16+8,215],[920,190]]:[[10,190],[4*16+8,215],[17*16+8,215],[376,190]],L=[];
  for(let k=0;k+1<A.length;k++){const [ax,ay]=A[k],[bx,by]=A[k+1],P=[];for(let j=0;j<=16;j++){const t=j/16;P.push([ax+(bx-ax)*t,ay+(by-ay)*t+Math.sin(t*Math.PI)*12])}L.push(P)}return L}

/* ---------- 7. 우리 가판대 ---------- */
STATION_DRAW.xmours=(g,s,x,y,w)=>{const front=xmStallBase(g,x,y,w,'#E0708C',true,'우리 둘의 꽃집');
  ln(g,x+5,y-26,x+w-5,y-26,'#8C6448',.7);[0,1,2].forEach(k=>{const px=x+10+k*14;wreathV(g,px,y-20,3.6,{cotton:k===1})});front();
  (s.slots||[]).forEach((it,k)=>{if(!it)return;const px=x+5+k*(w-10)/5;g.save();g.translate(px,y-4);g.scale(.8,.8);try{drawItemV(g,it,0,0)}catch(e){}g.restore()});
  rr(g,x+w/2-12,y+4,24,6,1.4,'#FFF8EE');g.fillStyle='#C65C79';g.font="3.4px 'Jua',sans-serif";g.textAlign='center';g.textBaseline='middle';g.fillText(xmOpen()?'리스 · 꽃다발 팔아요':'마켓 열면 팔아요',x+w/2,y+7.2)};
PR_STB.xmours=[-8,-60,8,4];
BOX.xmours=['크리스마스 마켓 가판대','꽃다발·리스·꽃 묶음을 올려두면 마켓이 열려 있는 동안(해 질 무렵부터) 손님이 사 가요. 리스는 마켓에서 인기가 많아 아주 비싸게 팔려요.'];
OPEN_LABEL.xmours='가판대';OPEN_LABEL.xmstall='말 걸기';
{const _ac=accepts;accepts=function(st,it){if(st.type==='xmours'){if(it.kind==='seed'||it.kind==='sprinkler')return '꽃만 올려 주세요';if(it.kind==='bouquet')return !isFreeBq(it)?'예약 꽃다발은 카운터나 픽업대로 가져가세요':wiltedB(it)?'시든 꽃다발은 팔 수 없어요':'';if(it.kind==='bunch')return it.stems.some(s=>s.dried||s.f>=WILT)?'':'시든 꽃은 팔 수 없어요';return '꽃만 올려 주세요'}return _ac(st,it)}}
STATION_ACT.xmours=(i,s)=>openModal(i,{type:'box',st:s.id});
{const _sg=prStSig;prStSig=function(s){if(s.type==='xmstall')return 'xm|'+s.id+'|'+xmOpen()+'|'+prBakeScale(s.area);if(s.type==='xmours'){let j;try{j=JSON.stringify(s.slots,prRound)}catch(e){j=String(PR.frame)}return 'xo|'+xmOpen()+'|'+j+'|'+prBakeScale(s.area)}return _sg(s)}}
/* 마켓 손님이 우리 가판대에서 사 가요(3분에 한 번 살펴봐요). 리스는 3배, 꽃다발·꽃은 1.6배 */
function xmPrice(b){return b.kind==='bouquet'&&typeof isWreath==='function'&&isWreath(b.stems)?3:1.6}
function xmSales(dMin){if(!XM_ON)return;const st=S.st&&S.st.xmours;if(!st||!st.slots)return;
  for(const w of S.walkers){if(!w.xbuy)continue;if(!xmOpen()||w.hidden||wArea(w)!=='north'){w.xbuy=null;continue}if(w.talking)continue;const [fx,fy]=frontOf(st);w.tx=fx;w.ty=fy;
    if(Math.hypot(w.x-fx,w.y-fy)<16){w.xbuy=null;w._buyT=S.t;w.wait=3;w.dir='up';const m0=S.money;sellFromDisplay(w,st,true);const got=S.money-m0;if(got>0){const it=w.bouquet,mul=it?xmPrice(it):1.6,extra=Math.round(got*(mul-1)/100)*100;S.money+=extra;S.stats.display+=extra;
      toastAll(`마켓 가판대에서 ${it&&it.kind==='bouquet'&&isWreath(it.stems)?'리스':it&&it.kind==='bouquet'?'꽃다발':'꽃'}이 팔렸어요! +${won(got+extra)}`)}delete w.bouquet}}
  S._xmT=(S._xmT||0)+dMin;if(S._xmT<2.5)return;S._xmT=0;if(!xmOpen()||S.t>=DAY_LEN-8||!sellables(st).length)return;
  const wreathy=st.slots.some(b=>b&&b.kind==='bouquet'&&isWreath(b.stems));if(Math.random()>(wreathy?.75:.55))return;
  const c=S.walkers.filter(w=>w.zone==='xmkt'&&!w.hidden&&!w.talking&&!w.xbuy&&!w.follow&&!w.role&&(w._buyT==null||S.t-w._buyT>40));if(c.length){const w=pick(c);w.xbuy='xmours';w.wait=0}}
if(XM_ON){const _os=outdoorSales;outdoorSales=function(dMin){_os(dMin);xmSales(dMin)}}

/* ---------- 8. 노점 상인과 이야기 → 구경하기(물건 사기) ---------- */
function ornArt(k){const key='o|'+k;if(ART_CACHE[key])return ART_CACHE[key];const cv=document.createElement('canvas');cv.width=cv.height=96;const g=cv.getContext('2d');g.translate(48,52);const sc=k==='light'||k==='pearl'?3.2:k==='star'?4.4:7;g.scale(sc,sc);try{xtOrn(g,k,0,0,1)}catch(e){}
  return ART_CACHE[key]=`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${ART_BG}<image href="${artURL(cv)}" x="0" y="0" width="64" height="64"/></svg>`}
function goodArt(k){const it=XM_GOODS[k],key='d|'+k;if(ART_CACHE[key])return ART_CACHE[key];return decorArt0(k,it.w,it.h,!!it.wall,key)}
function foodArt(k){const f=XM_FOOD[k];return sv(`<rect x="20" y="24" width="24" height="28" rx="5" fill="#F4F1EA" stroke="#D8CFC2"/><rect x="22" y="28" width="20" height="6" fill="${f.c}"/><path d="M44 30 q8 0 8 8 q0 8 -8 8" fill="none" stroke="#D8CFC2" stroke-width="3"/><path d="M27 18 q-3 -5 0 -10 M34 18 q-3 -5 0 -10" stroke="#C9C2B8" stroke-width="2" fill="none"/>`)}
function xmItems(v){const L=[];const S2=v.sell;
  (S2.orn||[]).forEach(k=>L.push({kind:'orn',k,name:XORN[k].name,price:XORN[k].price,art:()=>ornArt(k),have:(xmInv()[k]||0)}));
  (S2.wear||[]).forEach(([c,val])=>{const o=STYLE[c].opts.find(q=>q[0]===val),pr=(XM_WEAR.find(q=>q[0]===c&&q[1]===val)||[])[2]||30000;L.push({kind:'wear',k:xmWearKey(c,val),c,val,name:o?o[1]:val,price:pr,art:()=>styleArt(c,val),own:!!S.closet[xmWearKey(c,val)]})});
  (S2.goods||[]).forEach(k=>{const it=XM_GOODS[k];L.push({kind:'good',k,name:it.name,price:it.price,art:()=>goodArt(k),part:it.wall?'벽 장식':it.flat?'바닥':'가게 소품'})});
  (S2.food||[]).forEach(k=>{const f=XM_FOOD[k];L.push({kind:'food',k,name:f.name,price:f.price,art:()=>foodArt(k),part:'먹으면 잠깐 빨라져요'})});return L}
/* 말을 걸면 상인이 한마디 하고 바로 상점이 열려요(문 열기 전엔 한마디만) */
STATION_ACT.xmstall=(i,s)=>{const v=XM_VBY[s.id];if(!v)return;const open=xmOpen();openModal(i,{type:'xmshop',st:s.id,step:open?'shop':'hi',say:open?pick(v.lines):null,line:open?null:pick(XM_CLOSED)})};
MODAL_R.xmshop=(i,m)=>{const v=XM_VBY[m.st],open=xmOpen();
  if(m.step==='hi')return head(i,v.name)+`<div class="mg" style="align-items:center"><canvas id="xmv${i}" width="200" height="220" style="width:7.5rem;max-width:30vw;border-radius:1rem;background:linear-gradient(#2B3560,#56648F)"></canvas>
    <div><p class="req" style="font-size:1.05em;line-height:1.55">“${esc(m.line)}”</p>${open?'<div class="row"><button class="btn primary" data-a="xmgo">구경하기</button></div>':''}</div></div>`;
  const L=xmItems(v),pit=m.pending!=null?L[m.pending]:null;
  return head(i,v.name)+(pit?`<div class="confirm"><div class="sart">${pit.art()}</div><div class="grow">${esc(pit.name)}<br>${won(pit.price)}에 살까요?</div><button class="btn primary small" data-a="xmok">살게요</button><button class="btn small" data-a="xmno">아니요</button></div>`:'')+
    `<div class="row" style="align-items:center;gap:.6rem;flex-wrap:nowrap"><canvas id="xmv${i}" width="200" height="220" style="width:4.2rem;flex:none;border-radius:.8rem;background:linear-gradient(#2B3560,#56648F)"></canvas><p class="req" style="margin:0">“${esc(m.say||'천천히 구경하세요!')}”<br><small>가진 돈 ${won(S.money)}</small></p></div><div class="shopgrid">`+L.map((it,k)=>`<div class="scard${it.own?' own':''}"><div class="sart">${it.art()}</div><div class="sname">${esc(it.name)}</div><div class="sdesc">${it.kind==='orn'?'트리 보관함 '+it.have+'개':it.part||''}</div>${it.own?'<span class="sbad">보유</span>':`<button class="btn small soft" data-a="xmbuy" data-v="${k}" ${S.money<it.price?'disabled':''}>${won(it.price)}</button>`}</div>`).join('')+'</div>'};
MODAL_AFTER.xmshop=(i,m)=>{const cv=$('#xmv'+i);if(!cv)return;const g=cv.getContext('2d'),v=XM_VBY[m.st];g.clearRect(0,0,200,220);const q=seedRand(7);for(let k=0;k<30;k++)el(g,q()*200,q()*140,.8+q(),.8+q(),'rgba(255,255,255,.7)');
  g.fillStyle='#7A5236';g.fillRect(0,150,200,70);g.save();g.translate(100,206);g.scale(5.4,5.4);drawChar(g,0,0,v.p,'down',0,false,false,false,false);g.restore();g.fillStyle='#B98A63';g.fillRect(0,190,200,30);g.fillStyle='#D8B48C';g.fillRect(0,186,200,6)};
MODAL_C.xmshop=(i,a,v,m)=>{const V=XM_VBY[m.st];
  if(a==='xmtalk'){const L=xmOpen()?V.lines:XM_CLOSED;let t=pick(L);if(L.length>1)while(t===m.line)t=pick(L);m.line=t;renderModal(i);return}
  if(a==='xmgo'){m.step='shop';m.say=pick(['천천히 구경하세요!','마음에 드는 게 있으면 말씀해 주세요.','오늘 들어온 따끈따끈한 물건들이에요!','하나하나 정성껏 만든 거예요.']);renderModal(i);return}
  if(a==='xmbuy'){m.pending=+v;GP.ctxFocus['m'+i]='[data-a="xmok"]';renderModal(i);return}
  if(a==='xmno'){const k=m.pending;m.pending=null;GP.ctxFocus['m'+i]=`[data-a="xmbuy"][data-v="${k}"]`;renderModal(i);return}
  if(a==='xmok'){const L=xmItems(V),it=L[m.pending];m.pending=null;if(!it||S.money<it.price||it.own)return;
    if(it.kind==='good'){const G=XM_GOODS[it.k],f={t:it.k,w:G.w,h:G.h};if(G.wall){f.wall=true;f.walk=true}if(G.flat){f.flat=true;f.walk=true}const sp=findSpot(f);if(!sp){toast(i,G.wall?'가게 벽에 걸 빈자리가 없어요':'가게에 놓을 자리가 없어요. 가구 배치로 정리해 보세요');renderModal(i);return}f.x=sp[0];f.y=sp[1];S.decor.push(f);BG_CACHE={}}
    S.money-=it.price;S.stats.spent=(S.stats.spent||0)+it.price;sfx('buy');bump();
    if(it.kind==='orn'){const inv=xmInv();inv[it.k]=(inv[it.k]||0)+1;toast(i,`${it.name}을(를) 샀어요. 트리 보관함에 들어갔어요`)}
    else if(it.kind==='wear'){S.closet[it.k]=true;toast(i,`${it.name}을(를) 샀어요. 가게 옷장에서 입을 수 있어요`)}
    else if(it.kind==='good')toast(i,`${it.name}을(를) 가게에 놓았어요. 가구 배치로 옮길 수 있어요`);
    else{const c=S.chars[i],f=XM_FOOD[it.k];c.boostUntil=Math.max(c.boostUntil||0,S.t)+f.min;toast(i,`${it.name} 냠냠! 몸이 따뜻해져서 ${f.min}분 동안 빨라져요`)}
    m.say=pick(['고마워요! 메리 크리스마스!','좋은 선택이에요. 정말 잘 어울릴 거예요!','감사합니다! 또 놀러 오세요!','하나 남은 거였는데, 주인을 찾았네요!','포장은… 꽃집 사장님이 더 잘하시겠죠? 하하.']);
    GP.ctxFocus['m'+i]=`[data-a="xmbuy"][data-v="${L.indexOf(it)}"]`;saveMid();renderModal(i)}};

/* ---------- 9. 마켓 손님(구경꾼) · 산타 · 루돌프 · 엘프 분장 ---------- */
ZONE_AREA.xmkt='north';
const XM_VISITORS=12; // 메모리 측정으로 정한 수(아래 '확인한 것' 참고)
const XM_COSTUME={santa:{coat:'pad',coatC:'#C8303E',hat:'santa',acc:'santa',scarf:'#FBF8F2',mitten:'#2E2B30',noW:1},rudolph:{coat:'pad',coatC:'#8A5A3A',pin:'rudolph',scarf:'#C8303E',noW:1},elf:{coat:'pad',coatC:'#3F7D55',hat:'santa',acc:'santa',hatC:'#3F7D55',scarf:'#C8303E',noW:1},hatonly:{hat:'santa',acc:'santa'}};
const XM_TALK={
  santa:['호호호! 메리 크리스마스! 착한 아이에게는 선물이 있단다.','올해 꽃집 사장님들은 착한 일을 정말 많이 했지. 다 보고 있었단다. 호호!','썰매 포토존에서 사진 한 장 찍고 가렴!','루돌프는 오늘 쉬는 날이라 내가 혼자 나왔지. 쉿!'],
  rudolph:['루돌프 사슴 코는~ 매우 반짝이는 코! (노래를 흥얼거려요)','이 머리띠 마켓에서 샀어요. 귀엽죠?','오늘은 제가 산타 할아버지 썰매 끄는 날이에요!'],
  elf:['산타 할아버지 공장에서 왔어요! 선물 포장은 자신 있어요.','엘프 모자 어때요? 진짜 엘프 같죠?','크리스마스까지 선물을 다 만들어야 해서 바빠요. 히히.'],
  base:['마켓 불빛 너무 예쁘죠? 해마다 오지만 올해가 제일 예뻐요.','뱅쇼 마셔 봤어요? 한 잔이면 손이 다 녹아요.','오르골 사고 싶은데 너무 비싸요… 그래도 크리스마스니까!','꽃집 가판대 리스 봤어요? 진짜 예쁘던데요!','크리스마스 니트 커플로 맞췄어요. 어때요?','큰 트리 앞에서 사진 찍으려고 줄 섰어요.','군밤 냄새 때문에 자꾸 발길이 멈춰요.','눈 오는 날 마켓은 정말 동화 같아요.','친구 선물 고르러 왔는데 제 것만 잔뜩 샀어요. 하하.','올해는 진저브레드 하우스를 꼭 사 갈 거예요.','저기 산타 할아버지 진짜일까요? 수염이 진짜 같던데…']};
const XM_SPOTS=[[1.5,12.2,22.5,13.6,3],[1.5,13.6,22.5,15.4,1],[1.5,20.1,13,20.8,2],[37.5,12.2,56.5,13.6,3],[37.5,13.6,56.5,15.4,1],[37.5,20.1,56.5,20.8,2],[43,15.6,51,16.6,2]];
function xmSpot(side){const L=XM_SPOTS.filter(r=>side==null||(side?r[0]>30:r[0]<30));for(let n=0;n<20;n++){const r=pickW(L);const p=[rnd(r[0],r[2])*TILE,rnd(r[1],r[3])*TILE];if(!blocked('north',p[0],p[1]))return p}return side?[46*TILE,13*TILE]:[12*TILE,13*TILE]}
function xmWalkers(){if(!XM_ON)return [];const W=[];
  const mk=(kind,costume,extra)=>{const w=mkWalker(kind==='couple'?'adult':kind,'xmkt',extra);w.side=Math.random()<.5?0:1;[w.x,w.y]=xmSpot(w.side);w.tx=w.x;w.ty=w.y;w.costume=costume||null;
    if(costume&&XM_COSTUME[costume])w.pal={...w.pal,...XM_COSTUME[costume]};else if(Math.random()<.3)w.pal={...w.pal,...XM_COSTUME.hatonly};return w};
  {const s=mk('adult','santa',{fem:false});s.role='santa';s.name='산타 할아버지';s.pal={...s.pal,hair:'#F4F1EA',hairHi:'#FFFFFF',hs:'short',kind:'elder',expr:'grin'};s.side=1;s.x=48.6*TILE;s.y=17.2*TILE;W.push(s)}
  W.push(mk('adult','santa'),mk('adult','rudolph'),mk('kid','rudolph'),mk('adult','elf'),mk('kid','elf'),mk('kid','elf'));
  const kinds=['adult','adult','kid','elder','adult','student','kid','adult','adult','elder'];for(let k=0;W.length<XM_VISITORS;k++)W.push(mk(kinds[k%kinds.length]));
  return W}
if(XM_ON){
  const _mw=makeWalkers;makeWalkers=function(){_mw();S.walkers=S.walkers.filter(w=>w.zone!=='north'&&!(w.follow&&w.follow.zone==='north'));S.walkers.push(...xmWalkers())}; /* 41차: 겨울 동안 북쪽 길 산책객은 빼요(마켓 구경꾼이 대신해요) */
  const _ws=walkerStep;walkerStep=function(w,dt){if(w.zone!=='xmkt')return _ws(w,dt);if(w.talking)return;
    if(w.role==='santa'){w.hidden=S.t<XM_OPEN_T-60?1:0;w.walk=0;w.mv=false;w.dir='down';w.throwT=(Math.sin(performance.now()/600)>.6)?.3:0;return} // 트리 옆에서 손 흔드는 산타
    const vis=xmOpen()||((w.x*7+w.y*3|0)%3===0); if(!vis){w.hidden=1;return} if(w.hidden){w.hidden=0;[w.x,w.y]=xmSpot(w.side);w.tx=w.x;w.ty=w.y}
    if(w.xbuy)return void(w.path=[[w.tx,w.ty]],stepToward(w,dt,16));
    if(w.wait>0){w.wait-=dt;w.walk=0;w.mv=false;if(w.browse)w.dir='up';return}
    w.path=[[w.tx,w.ty]];if(stepToward(w,dt,w.kind==='kid'?20:w.kind==='elder'?10:14)){w.browse=Math.random()<.65;w.wait=w.browse?rnd(4,10):rnd(1.5,4);[w.tx,w.ty]=xmSpot(w.side)}};
  {const _tl=talkLine;talkLine=function(w){if(w.zone==='xmkt')return pick(XM_TALK[w.costume]||XM_TALK.base);return _tl(w)}}
}
/* ---------- 10. 마켓 전구(노점 처마 · 줄 전구 · 큰 트리) ---------- */
XB_HOOKS.push((area,add)=>{if(area!=='north'||!XM_ON)return;
  const stalls=XM_VENDORS.map(v=>[v.x,v.y]).concat([[XM_OURS.x,XM_OURS.y]]);
  stalls.forEach(([sx,sy])=>{const x=sx*TILE,y=sy*TILE,w=48,dep=(sy+1)*TILE+.5;garlandPts(x-1,x+w+1,y-29,w/3.2,2.6).bulbs.forEach(([bx,by])=>add(bx,by,dep,1.6))});
  [0,1].forEach(side=>xmStrings(side).forEach(P=>P.forEach(([x,y],k)=>{if(k%2)add(x,y+1,16*TILE,1.8)})));
  {const cx=XM_TREE.x*TILE+16,by=XM_TREE.y*TILE+14,dep=(XM_TREE.y+1)*TILE-1;XT_TIERS.forEach(([b,t,w],i)=>{for(let j=0;j<7-i;j++){const u=(j+.5)/(7-i)*2-1;add(cx+u*(w-5)*.92*1.3,by+(b-3-Math.abs(u)*2.5-8+i*.5)*1.3,dep,2.4)}})}});

/* 줄 전구의 전깃줄은 큰 그림으로 굽지 않고 선 몇 개로 그려요(그림 메모리 약 2MB 절약) */
function xmWires(area){if(area!=='north'||!XM_ON)return;const a=prArea(area);if(!a.xmG){a.xmG=prW(PR.sc.add.graphics().setDepth(16*TILE));const G=a.xmG,ox=AOFF.north;G.lineStyle(.5,0x2E3A30,1);
  [0,1].forEach(side=>xmStrings(side).forEach(P=>{G.beginPath();P.forEach(([x,y],k)=>k?G.lineTo(ox+x,y):G.moveTo(ox+x,y));G.strokePath();P.forEach(([x,y],k)=>{if(k%2){G.fillStyle(parseInt(XBC[k%5].slice(1),16),1);G.fillCircle(ox+x,y+1,.8)}})}))}a.xmG.setVisible(true);a.xmSeen=PR.frame}
if(XM_ON){const _sd=seasonDyn;seasonDyn=function(area,tt){_sd(area,tt);xmWires(area)};
  const _pr=prRender;prRender=function(){_pr();const a=PR.areaObj&&PR.areaObj.north;if(a&&a.xmG&&a.xmSeen!==PR.frame)a.xmG.setVisible(false)}}

/* 41차: 마켓을 떠나 20초가 지나면 노점·마켓 장식 그림을 정리해요(다른 장소에 있을 때 메모리 3~4MB 절약, 다시 오면 금방 새로 그려요) */
const XM_DEC_T=new Set(['xmtree','xmsleigh','xmdeer','xmsign','xmphoto','xminitree','xgifts','snowman']);
if(XM_ON){const _st=prStaticTrim;prStaticTrim=function(){_st();if(PR.frame%60)return;const north=PR.areaObj&&PR.areaObj.north;if(north&&PR.frame-(north.seenF||0)<prSec(20))return;
  const ids=new Set(XM_VENDORS.map(v=>'s'+v.id).concat(['sxmours','sxmb1','sxmb2']));DECOR_BASE.north.forEach(d=>{if(XM_DEC_T.has(d.t))ids.add('d'+prOid(d))});
  for(const id of ids){const r=PR.recs.get(id);if(r&&r.layers&&PR.frame-r.seen>prSec(20)){prKillRec(r);PR.recs.delete(id)}}}}
