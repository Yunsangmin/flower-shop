'use strict';
/* 우리 둘의 꽃집 — 2-residents.js : 메인 주민·이야기·대화 내용
   (파일은 index.html 에 적힌 순서대로 불러와요. 앞 파일의 함수·변수를 뒤 파일이 이어서 씀) */
/* ---------- 메인 주민 4명 (고정된 전용 모습 · 이야기 · 친밀도) ---------- */
const MAIN={
  minji:{name:'민지',who:'그림책 작가',nc:['#F4A6B8','#D8849A'],pal:{kind:'adult',style:'f',hs:'bob',bangs:true,hair:'#5A3A2A',hairHi:'#8E6248',skin:'#F8DCC8',skinSh:'#E6BCA2',eyeC:'#6A4632',tee:'#F4EEE2',teeSh:'#00000014',pants:'#5D6F8F',shoe:'#8A5A44',coat:'trench',coatC:'#E3CCA6',scarf:'#7FA88C',hat:'beret',hatC:'#D9797C',pin:'yflower',prop:'sketch',expr:'smile',blush:true,num:''}},
  suni:{name:'순이 할머니',who:'옛 꽃집 주인',nc:['#B7A2DA','#9681BE'],pal:{kind:'elder',style:'f',hs:'bun',hairpin:true,hair:'#CFCBC6',hairHi:'#F6F4F0',skin:'#F1D2BA',skinSh:'#D9B094',eyeC:'#5A4034',tee:'#FFF6E6',teeSh:'#00000012',coat:'cardigan',coatC:'#B9A2D6',innerC:'#FFF6E6',skirt:'#7C6E90',legC:'#E9D9CC',shoe:'#6E5A4E',glassesGold:true,acc:'glasses',lines:true,prop:'basket',expr:'smile',blush:true,pants:'#7C6E90',num:''}},
  doyun:{name:'도윤',who:'우체부',nc:['#7FA7D6','#5E86B8'],pal:{kind:'adult',style:'m',hs:'short',hair:'#2B211C',hairHi:'#56463C',skin:'#EFC8A6',skinSh:'#D8A986',eyeC:'#4A3226',tee:'#4F6FA3',teeSh:'#00000018',coat:'uniform',coatC:'#4F6FA3',pants:'#343C4E',shoe:'#3A2E2A',hat:'mailcap',bag:'satchel',bagC:'#8E5E3C',prop:'letters',expr:'smile',blush:true,num:''}},
  haru:{name:'하루',who:'꽃마을 초등학생',nc:['#F5C451','#D9A631'],pal:{kind:'kid',style:'m',hs:'short',hair:'#3A2A22',hairHi:'#6A4E3E',skin:'#F6D6BC',skinSh:'#E2B597',eyeC:'#5A3A2A',tee:'#9ED1C0',teeSh:'#00000016',pants:'#E8B04A',shoe:'#E07A7A',hat:'kidhat',pack:true,packC:'#E8603C',expr:'grin',blush:true,sc:.72,num:''}}
};
/* =========================================================
   메인 주민 이야기 · 친밀도 (S.bonds)
   · 하루 첫 대화마다 친밀도 +1 (최대 10), 이야기 한 막을 마치면 +1
   · 조건이 되면 머리 위에 "!" 가 뜨고, 가까이 있으면 먼저 다가와 말을 걸어요
   · {me}=말 거는 사람(생민/수갱), {other}=다른 한 사람, {shop}=가게 이름
   ========================================================= */
const BOND_MAX=10;
function josa(w,a,b){const c=w.charCodeAt(w.length-1)-44032;return w+(c>=0&&c<11172&&c%28?a:b)}
function bondOf(k){S.bonds=S.bonds||{};let b=S.bonds[k];if(!b)b=S.bonds[k]={h:0,day:0,ch:0,chDay:0,mem:{}};if(!b.mem)b.mem={};return b}
function heartsTxt(h){return '♥'.repeat(Math.min(5,Math.ceil(h/2)))+'♡'.repeat(5-Math.min(5,Math.ceil(h/2)))}
const STORY={
  minji:[
    {req:0,pages:[
      '안녕하세요! 새로 문 연 꽃집 주인분들이죠? 저는 민지예요. 이 까만 친구는 까미고요.',
      '저는 동네 도서관 옆 작은 작업실에서 그림책을 그려요. 요즘은… 사실 그림이 잘 안 그려져서 산책만 하고 있지만요. 헤헤.',
      '그런데 {shop} 앞을 지나가면 이상하게 연필을 쥐고 싶어져요. 자주 놀러 가도 돼요?',
      '까미도 벌써 {me} 씨가 좋은가 봐요. 꼬리 흔드는 거 보여요? 앞으로 잘 부탁해요!']},
    {req:2,pages:[
      '{me} 씨, 마침 잘 만났어요! 다음 그림책 주인공을 꽃으로 정해 볼까 고민 중이에요.',
      {ask:'{me} 씨는 어떤 꽃이 제일 좋아요?',key:'fav',opts:[
        ['튤립',['튤립! 동그랗게 오므린 모습이 꼭 비밀을 품은 것 같죠. 주인공이 수줍음 많은 아이면 좋겠다….']],
        ['수국',['수국이요? 작은 꽃이 모여서 하나가 되는 거… 친구 이야기로 그리면 딱이겠어요!']],
        ['장미',['장미! 가시가 있어도 결국 활짝 피잖아요. 씩씩한 주인공으로 해야겠다.']]]},
      '고마워요. 오늘은 오랜만에 스케치북을 끝까지 채울 수 있을 것 같아요.']},
    {req:4,pages:[
      '까미를 어떻게 만났는지 얘기한 적 있던가요?',
      '3년 전 비 오던 날, 공원 벤치 밑에서 까만 털 뭉치가 떨고 있었어요. 처음엔 누가 떨어뜨린 목도리인 줄 알았다니까요.',
      '수건으로 닦아 주는데 제 손가락을 핥더라고요. 그날부터 우리 집 대장이에요.',
      '그래서 저는 비 오는 날이 싫지 않아요. 좋은 일은 가끔 젖은 모습으로 오거든요.',
      '…{me} 씨랑 {other} 씨가 이 동네에 온 것도, 저한텐 좀 그런 느낌이에요.']},
    {req:6,pages:[
      '짜잔! 이거 봐 줄래요? 스케치북 한 장 뜯어 왔어요.',
      '두 사람이 가게 앞에서 꽃을 다듬는 모습이에요. 햇빛이 창문에 비칠 때가 제일 예뻐서요.',
      '{fav}도 그려 넣었어요. {me} 씨가 좋아한다고 했잖아요.',
      '이 그림이 그림책 첫 장이 될 거예요. 제목은 아직 비밀!']},
    {req:8,when:()=>S.t>=360,pages:[
      '{me} 씨! 저 방금 출판사에서 연락 받았어요!',
      '제 그림책이… 정말 책으로 나온대요. 제목은 「꽃집 사람들」로 하기로 했어요.',
      '처음 인사하던 날 제가 그림이 안 그려진다고 했던 거 기억해요? 그때 {shop} 창문을 보면서 다시 연필을 들었거든요.',
      '고마워요. 진짜로요. 까미야, 너도 인사해!']},
    {req:10,pages:[
      '{me} 씨, {other} 씨 몫까지 두 권 가져왔어요. 「꽃집 사람들」 첫 인쇄본이에요!',
      '마지막 장에는 두 사람이 노을을 보는 장면을 넣었어요. 북쪽 언덕길 벤치, 거기 맞죠?',
      '앞으로도 가게 앞을 지나갈 때마다 인사할게요. 까미랑 둘이서, 매일매일.',
      {gift:'민지의 그림책 「꽃집 사람들」을 선물 받았어요'}]}
  ],
  suni:[
    {req:0,pages:[
      '어머나, 이 가게에 다시 불이 켜졌네. 반가워서 한참 서 있었다우.',
      '나는 순이라고 해요. 이 자리에서 삼십 년 동안 꽃집을 했지. 무릎이 아파서 문을 닫은 게 벌써 몇 해 전이네.',
      '젊은 사람들이 꽃을 만지는 모습을 보니까 옛날 생각이 나서 좋다우. 가끔 들러도 되지?']},
    {req:2,pages:[
      '꽃마다 꽃말이 있는 거 알아요? 손님한테 한마디 곁들이면 꽃이 두 배로 예뻐 보인다우.',
      '안개꽃은 "맑은 마음", 튤립은 "사랑의 고백", 프리지아는 "새로운 시작"이지.',
      '우리 영감은 연애할 때 늘 안개꽃만 사 왔어. 돈이 없어서 그랬다는데… 나는 그게 제일 좋았다우. 호호.']},
    {req:4,pages:[
      '옛날엔 새벽 네 시에 일어나서 꽃시장에 갔어. 강바람이 얼마나 차던지.',
      '그래도 문 열자마자 들어오는 첫 손님 얼굴을 보면 피곤한 게 싹 사라졌지.',
      '졸업식 날엔 줄이 가게 밖까지 섰다우. 그날 판 꽃다발로 우리 딸 대학 등록금을 냈지 뭐야.',
      '{me}도 힘든 날이 있을 거예요. 그럴 땐 첫 손님 얼굴을 떠올려 봐요.']},
    {req:6,pages:[
      '가위질하는 거 봤는데, 손이 참 곱더라. 비법 하나 알려 줄까?',
      '줄기는 꼭 사선으로, 물속에서 자르면 더 좋고. 물에 잠기는 잎은 다 떼 줘야 물이 안 썩어요.',
      '그리고 물올림 통에 한참 꽂아 두는 걸 아까워하지 마우. 꽃도 목을 축여야 오래 웃는다우.',
      '이건 우리 꽃집 비밀이었는데, 이제 {shop} 비밀이네. 호호.']},
    {req:8,when:()=>S.t<420,pages:[
      '오늘이 우리 영감이랑 결혼한 날이에요. 벌써 오십 년이 넘었네.',
      '영감 가고 나서는 해마다 수국 한 송이를 샀어. 영감이 좋아하던 꽃이거든.',
      '올해는 {shop}에서 사야겠다 싶어서 나왔는데… 이렇게 얘기부터 하게 되네.',
      '고마워요. 이 동네에 꽃집이 다시 있어서, 나는 올해도 외롭지 않다우.']},
    {req:10,pages:[
      '{me}, 이거 받아 줘요. 내가 삼십 년 쓴 꽃가위야.',
      '날은 몇 번 갈았지만 손잡이는 그대로라우. 이제 내 손보다 젊은 손에 있는 게 맞지.',
      '{me}랑 {other}가 이 가게를 지켜 줘서, 나는 참 복이 많은 할멈이야.',
      {gift:'순이 할머니의 오래된 꽃가위를 선물 받았어요'}]}
  ],
  doyun:[
    {req:0,pages:[
      '안녕하세요! 이 동네 우편 담당 도윤입니다. 꽃집 앞을 지날 때마다 향기가 좋아서 속도가 느려져요. 하하.',
      '혹시 가게로 오는 편지나 소포 있으면 제가 제일 먼저 가져다드릴게요!']},
    {req:2,pages:[
      '오늘 기분 좋은 편지를 배달했어요. 멀리 사는 손녀가 순이 할머니께 보낸 편지였거든요.',
      '할머니가 대문 앞에서 봉투를 뜯자마자 웃으시는데… 이 일을 하길 잘했다 싶더라고요.',
      '편지는 느리지만, 느려서 더 오래 남는 것 같아요. 꽃처럼요.']},
    {req:4,pages:[
      '저… {me} 씨, 비밀 하나 말해도 돼요?',
      '도서관에서 일하는 해솔 씨라고 있거든요. 책 반납하러 갈 때마다 인사를 하는데, 요즘은 그게 하루 중 제일 떨려요.',
      '이런 얘기 처음 해 봐요. 얼굴 빨개졌죠? 모자를 좀 더 눌러 써야겠다.']},
    {req:6,pages:[
      '해솔 씨한테 마음을 전하고 싶은데, 어떻게 해야 할지 모르겠어요.',
      {ask:'{me} 씨라면 어떻게 할 것 같아요?',key:'plan',opts:[
        ['편지를 써요',['역시… 우체부가 편지를 안 쓰면 누가 쓰겠어요. 그런데 손이 떨려서 글씨가 삐뚤어질 것 같아요.']],
        ['꽃을 건네요',['꽃이요! 말로 못 하는 걸 꽃이 대신 해 준다고 순이 할머니가 그러셨어요.']]]},
      '둘 다 해 볼까요? 편지는 제가 쓰고, 꽃은… {shop}에 부탁드려도 될까요?']},
    {req:8,pages:[
      '정식으로 주문하러 왔어요! 내일 오후에 찾으러 올게요.',
      '튤립이요. "사랑의 고백"이라고 들었거든요. 안개꽃도 조금 섞어 주세요. 맑은 마음으로.',
      '포장은 분홍색으로 부탁드려요. 해솔 씨가 분홍 책갈피를 쓰더라고요.',
      {order:'doyun'},
      '내일 예약판에 제 이름 있는 거 확인해 주세요. 으아, 벌써 떨려요.']},
    {req:10,pages:[
      '{me} 씨! 해솔 씨가… 꽃다발을 받고 웃었어요. 그리고 제 편지를 책갈피처럼 꽂아 두겠대요.',
      '이번 주말에 같이 강가 산책하기로 했어요. 제가 이 동네에서 제일 좋아하는 길이에요.',
      '두 분 덕분이에요. 앞으로 {shop}으로 오는 편지는 제가 평생 제일 먼저 배달할게요!',
      {gift:'도윤과 해솔의 고마움이 담긴 엽서를 받았어요'}]}
  ],
  haru:[
    {req:0,pages:[
      '안녕하세요! 저 하루예요. 꽃마을 초등학교 2학년!',
      '저 커서 꽃집 사장님 될 거예요. 그리고 토토랑 매일 같이 살 거예요.',
      '토토가 제 발등에 앉은 적도 있어요. 진짜예요!']},
    {req:2,pages:[
      '비밀인데요, 토토는 저녁마다 시계탑 밑 따뜻한 돌 위에서 자요.',
      '동네 사람들이 토토 간식을 하나씩 챙겨 줘서, 토토 배가 조금 동그래졌어요. 헤헤.',
      '사장님! 사장님도 토토 간식 챙겨 줄 거죠? 약속!']},
    {req:4,pages:[
      '학교 숙제로 "우리 동네 직업 인터뷰"를 해야 돼요. 사장님을 인터뷰해도 돼요?',
      {ask:'꽃집 사장님은 뭐가 제일 좋아요?',key:'job',opts:[
        ['손님이 웃을 때',['우와… 저도 엄마 웃게 하는 거 좋아해요! 받아 적었어요!']],
        ['꽃 향기',['맞아요, 꽃집 앞은 늘 좋은 냄새가 나요! 받아 적었어요!']],
        ['둘이 같이 일해서',['헤헤, 사장님 두 명이라서 좋구나. 받아 적었어요!']]]},
      '숙제 잘해서 선생님한테 칭찬받을게요!']},
    {req:6,pages:[
      '사장님, 다음 주가 우리 엄마 생신이에요. 제가 용돈을 모았거든요….',
      '엄마한테 꽃다발 주고 싶은데, 제 돈으로 될까요? 이만큼밖에 없어요.',
      {order:'haru'},
      '정말요? 예약된 거예요? 내일 학교 끝나고 올게요! 엄마한텐 비밀이에요!']},
    {req:8,pages:[
      '사장님! 엄마가 꽃다발 받고 울었어요. 좋아서 우는 거래요.',
      '그래서 제가 그림 편지 그려 왔어요. 사장님 두 명이랑 저랑 토토예요!',
      {gift:'하루의 크레파스 그림 편지를 받았어요'}]},
    {req:10,pages:[
      '사장님, 저 결심했어요. 커서 꼭 꽃집 차릴 거예요. 이름은 「하루의 꽃집」!',
      '그때는 사장님이랑 경쟁자예요. 헤헤, 농담이에요. 옆집에 차려서 매일 놀러 갈 거예요.',
      '그러니까 그때까지 {shop} 꼭 계속 해 주세요. 약속!']}
  ]
};
/* 특별 예약(이야기와 연결된 주문) */
const STORY_ORDERS={
  doyun:{title:'고백 꽃다발',text:'해솔 씨에게 전할 꽃이에요. 떨리네요!',req:{tulip:5,gyp:3},paper:'pink',price:52000,time:360,name:'도윤'},
  haru:{title:'엄마 생신 꽃다발',text:'엄마한테 비밀이에요! 예쁘게 부탁해요.',req:{tulip:3,freesia:2},paper:'yellow',price:30000,time:390,name:'하루'}
};
/* 평소 대화: [친밀도 단계 0~2][시간대 아침/낮/저녁] */
const SMALL={
  minji:[[['좋은 아침이에요! 까미가 일찍 깨워서 벌써 공원 두 바퀴 돌았어요.','아침 공기엔 연필 냄새가 나는 것 같아요.'],['점심 먹고 나면 꼭 졸려요. 까미는 벌써 제 발 위에서 자요.','오늘 하늘 색 좀 봐요. 그림 물감으로도 못 만드는 색이에요.'],['저녁 산책은 까미가 제일 좋아하는 시간이에요.','해 질 때 가게 창문이 주황빛으로 물드는 거, 알고 있어요?']],
    [['{me} 씨 오늘도 부지런하네요! 저도 힘내서 그려야지.','까미가 {shop} 쪽으로만 가자고 해요. 누굴 닮았나 봐요.'],['어제 그린 그림 망쳐서 지우개를 반 개나 썼어요. 헤헤.','{other} 씨가 아까 창가에서 꽃 다듬는 거 봤어요. 그림 같았어요.'],['노을 볼 거면 북쪽 언덕길 벤치로 가요. 거기가 명당이에요.','오늘은 까미 목줄 대신 제 목도리가 끌려갈 뻔했어요.']],
    [['{me} 씨 얼굴 보니까 오늘 그림 잘 그려질 것 같아요!','우리 까미가 {me} 씨 발소리를 알아요. 멀리서부터 꼬리 흔들어요.'],['{fav} 그리는 연습 중이에요. 이제 눈 감고도 그려요.','책 나오면 첫 사인은 {me} 씨한테 할게요!'],['오늘 하루도 수고 많았어요. 까미 대신 하이파이브!','두 분이 퇴근하는 뒷모습, 다음 그림책에 몰래 그려도 돼요?']]],
  suni:[[['아이고, 부지런하기도 해라. 꽃시장은 정오면 닫으니 서둘러요.','아침 이슬 맺힌 꽃이 제일 싱싱하다우.'],['해가 좋으니 꽃들이 목말라하겠네. 물 챙겨 줘요.','무릎이 쑤시는 거 보니 내일 비가 오려나.'],['저녁 바람이 차네. 옷 따뜻하게 입고 다녀요.','문 닫기 전에 시든 꽃은 꼭 정리하고 가요.']],
    [['{me} 왔구나. 오늘은 무슨 꽃 들어왔나 궁금해서 나왔지.','어제 가게 앞 지나가는데 향기가 골목까지 나더라.'],['사선으로 잘 자르고 있지? 호호, 잔소리다 생각해요.','{other}는 손님한테 참 상냥하더라. 보기 좋아.'],['오늘도 욕봤어요. 따뜻한 차 한 잔 하고 쉬어요.','노을 지는 거 보니 영감 생각이 나네.']],
    [['우리 {me}, 얼굴이 좋아 보이네. 밥은 먹었어요?','{shop} 간판 볼 때마다 내 가게보다 예쁘다 싶어 샘이 난다우. 호호.'],['{me}는 꽃 만질 때 제일 예뻐. 알지?','손님 많았다며? 소문이 내 귀까지 왔어.'],['내일도 문 열 거지? 그 생각만 해도 든든하다우.','둘이서 사이좋게 하는 게 제일 큰 복이야.']]],
  doyun:[[['좋은 아침입니다! 오늘 배달할 편지가 산더미예요.','아침엔 신문, 낮엔 편지, 저녁엔 소포! 바쁘다 바빠.'],['점심은 늘 강가 벤치에서 먹어요. 오리들이 반찬 달래요.','이 가방, 보기보다 무거워요. 편지마다 누군가의 마음이 들어 있어서 그런가 봐요.'],['마지막 배달 끝! 오늘도 무사히 다 전했어요.','저녁엔 가로등 켜지는 순서대로 동네를 한 바퀴 돌아요.']],
    [['{me} 씨! 오늘은 {shop} 앞에서 한 번 더 쉬었다 가요.','해솔 씨가 오늘 도서관 문을 몇 시에 여는지… 아, 아무것도 아니에요.'],['편지 봉투에 꽃 스티커 붙이는 사람이 늘었어요. 꽃집 덕분인가?','{other} 씨가 아까 손 흔들어 줘서 힘이 났어요!'],['오늘은 소포가 많아서 어깨가 뻐근하네요. 하하.','퇴근길에 {shop} 불빛 보면 괜히 마음이 놓여요.']],
    [['{me} 씨, 좋은 아침! 오늘은 제가 먼저 인사하려고 뛰어왔어요.','해솔 씨가 {shop} 꽃 이야기를 자주 해요. 저도 괜히 뿌듯해요.'],['요즘 편지 쓰는 게 재밌어요. 받는 사람 얼굴이 떠올라서요.','주말에 해솔 씨랑 강가 걸으려고요. 두 분 산책 코스 추천해 줄래요?'],['오늘도 수고 많았어요, 사장님들! 내일 아침에 봬요.','노을 질 때 가게 앞에 서 있는 두 분, 엽서 그림 같아요.']]],
  haru:[[['안녕하세요! 저 학교 가는 길이에요!','아침에 토토 봤어요? 저는 벌써 두 번 봤어요!'],['학교 끝났다! 이제 놀 거예요!','오늘 급식에 딸기 나왔어요. 최고!'],['해 지기 전에 집에 가야 해요. 엄마가 기다려요.','토토가 시계탑 쪽으로 갔어요. 이제 잘 시간인가 봐요.']],
    [['사장님! 오늘 학교에서 꽃 그림 그렸어요!','토토한테 인사하고 왔어요. 토토도 사장님한테 안부 전해 달래요. 헤헤.'],['사장님은 무슨 꽃 제일 잘 만들어요?','저 오늘 받아쓰기 백 점 맞았어요!'],['집에 가기 전에 사장님 얼굴 보러 왔어요!','내일은 토토 간식 가져올 거예요.']],
    [['사장님 최고! 오늘도 힘내세요!','저 어제 꿈에서 꽃집 사장님 됐어요. 손님이 토토였어요!'],['{other} 사장님이 저한테 꽃잎 하나 줬어요. 책에 끼워 놨어요!','크면 사장님처럼 꽃다발 예쁘게 만들 거예요.'],['내일 또 올게요! 약속!','오늘 제일 재밌었던 건… 사장님이랑 얘기한 거!']]]
};
const CALL_LINES={minji:['{me} 씨! 잠깐 시간 있어요?','{me} 씨~ 보여 줄 게 있어요!'],suni:['{me}, 잠깐 이리 와 봐요.','아이고, {me} 마침 잘 만났네.'],doyun:['{me} 씨! 잠깐만요!','{me} 씨, 드릴 말씀이 있어요!'],haru:['사장님! 사장님!','사장님, 여기요 여기!']};
function fillTxt(s,i,k){const me=PAL[i].name,other=PAL[1-i].name,b=k?bondOf(k):null;
  return s.replace(/\{me\}/g,me).replace(/\{other\}/g,other).replace(/\{shop\}/g,S.shopName||'우리 둘의 꽃집').replace(/\{fav\}/g,(b&&b.mem.fav)||'꽃')}
function storyReady(k){const b=bondOf(k),ch=STORY[k][b.ch];if(!ch)return null;if(b.h<ch.req)return null;if(b.ch>0&&b.chDay===S.day)return null;if(ch.when&&!ch.when())return null;return ch}
/* 말 걸기: 이야기 한 막 또는 평소 대화 */
function mainTalk(i,w){
  const k=w.main,b=bondOf(k);let pages,story=false;
  const ch=storyReady(k);
  if(ch){pages=ch.pages.slice();story=true}
  else{const tier=b.h>=7?2:b.h>=3?1:0,tb=S.t<180?0:S.t<420?1:2;pages=[pick(SMALL[k][tier][tb])];
    if(b.day===S.day&&Math.random()<.5)pages=[pick(SMALL[k][tier][(tb+1)%3])]}
  let gained=false;if(b.day!==S.day){b.day=S.day;if(b.h<BOND_MAX){b.h++;gained=true}}
  return {pages,story,k,gained}
}
function storyDone(i,k){S.callQuiet=S.t+45;const b=bondOf(k);b.ch++;b.chDay=S.day;if(b.h<BOND_MAX)b.h++;bump();saveMid()}
function storyEffect(i,k,e){
  if(e.gift){toastAll(e.gift+' ♥');sfx('buy');return}
  if(e.order){const T=STORY_ORDERS[e.order];if(!T)return;const o=genOrder({title:T.title,text:T.text,req:{...T.req},paper:T.paper,price:T.price},T.time,S.day+1);o.name=T.name;o.story=e.order;S.tomorrow.push(o);toastAll(`${T.name}의 특별 예약이 내일 ${clock(T.time)}에 잡혔어요`);sfx('ring')}
}
/* 메인 주민이 먼저 다가와 말 걸기 */
function mainCall(w,dt){
  if(!w.main||w.talking||w.hidden)return false;const ch=storyReady(w.main);if(!ch){w.calling=0;return false}
  const area=wArea(w);let best=null,bd=1e9;
  S.chars.forEach((c,i)=>{if(c.area!==area||c.modal||c.rest)return;const d=Math.hypot(c.x-w.x,c.y-w.y);if(d<bd){bd=d;best=c}});
  if(!best||bd>110){w.calling=0;return false}
  if((w.callCool||0)>S.t||(S.callQuiet||0)>S.t)return false;
  if(!w.calling&&S.walkers.some(o=>o!==w&&o.calling))return false; // 한 번에 한 명만 다가와요
  if(!w.calling){w.calling=1;w.callT=0;w.callLine=fillTxt(pick(CALL_LINES[w.main]),best.i,w.main);sfx('bell')}
  w.callT+=dt;if(w.callT>22){w.calling=0;w.callCool=S.t+40;return false}
  if(bd>24){w.path=[[best.x+(w.x<best.x?-16:16),best.y+2]];stepToward(w,dt,26)}else{w.walk=0;w.dir=faceTo(w,best)}
  return true;
}

function mkMain(key,kind,zone,extra){const M=MAIN[key];const w=mkWalker(kind,zone,extra);w.pal={...M.pal};w.name=M.name;w.main=key;return w}
// 산책 나온 부부: 항상 두 사람이 나란히(남녀 한 쌍, 이름도 성별에 맞게)
function mkCouple(zone){const f=Math.random()<.5;const lead=mkWalker('couple',zone,{fem:f});const mate=mkWalker('couple',zone,{fem:!f,follow:lead});mate.x=lead.x+12;mate.y=lead.y;lead.mate=mate;return [lead,mate]}
function makeWalkers(){
  const kk=mkMain('minji','dog','park');kk.dog.name='까미';kk.dog.col='#2A2626';kk.kkami=true;
  makeCat();
  const W=[kk,mkMain('suni','elder','park'),mkMain('doyun','adult','lane'),mkMain('haru','kid','park',{school:true}),mkWalker('adult','park'),mkWalker('dog','park'),mkWalker('kid','park',{school:true}),mkWalker('elder','park'),mkWalker('student','lane'),mkWalker('adult','lane'),mkWalker('dog','right'),mkWalker('kid','right',{school:true}),mkWalker('kid','park',{school:true}),
    mkWalker('adult','north'),mkWalker('elder','north'),mkWalker('dog','north'),
    mkWalker('adult','lake',{eve:true}),mkWalker('elder','lake',{eve:true}),mkWalker('dog','lake',{eve:true}),mkWalker('student','lake',{eve:true})];
  W.push(...mkCouple('park'),...mkCouple('north'));S.walkers=W;
}
function newGame(mode){mode='duo';
  S.bonds={};S.mode=mode;S.active=0;S.day=1;S.money=80000;S.speed=1;S.nextId=1;S.up={};S.edit=false;
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

