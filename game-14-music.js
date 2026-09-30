'use strict';
/* 우리 둘의 꽃집 — game-14-music.js : 배경음악을 음악 파일(mp3)로 틀어요
   · music/morning.mp3  : 아침·낮, 가게 안
   · music/outside.mp3  : 캠퍼스·꽃시장·텃밭
   · music/evening.mp3  : 저녁(오후 7시 반쯤부터)
   · 분위기가 바뀌면 3초 동안 부드럽게 넘어가요(크로스페이드). 각 곡은 끝나면 처음부터 다시.
   · 파일이 없거나 인터넷이 끊겨 못 불러오면 그냥 조용히(예전 코드 음악은 쓰지 않아요). 새소리·물소리 같은 자연 소리는 그대로. */
const MUSIC_FILES={morning:'music/morning.mp3',bossa:'music/outside.mp3',evening:'music/evening.mp3'};
const MP={cur:null,tracks:{},failAt:{}};
function mpTrack(k){let t=MP.tracks[k];if(t)return t;const c=AU.ctx;
  const a=new Audio();a.loop=true;a.preload='auto';a.crossOrigin='anonymous';
  t={a,k,src:null,gain:c.createGain(),ok:true};t.gain.gain.value=0;
  try{t.src=c.createMediaElementSource(a);t.src.connect(t.gain);t.gain.connect(AU.music)}catch(e){t.ok=false}
  a.addEventListener('error',()=>{t.bad=true;MP.failAt[k]=performance.now()});
  a.src=MUSIC_FILES[k];MP.tracks[k]=t;return t}
function mpPlay(t){if(!t.a.paused)return;const p=t.a.play();if(p&&p.catch)p.catch(()=>{t.needTap=true})}
schedMusic=function(){
  if(!AU.ctx)return;const c=AU.ctx,now=c.currentTime,on=SET.music>0;
  let want=null;try{want=bgmMood().song}catch(e){want='morning'}
  if(!MUSIC_FILES[want])want='morning';
  // 못 불러온 곡은 1분 뒤에 다시 시도
  const bad=MP.tracks[want]&&MP.tracks[want].bad;if(bad&&performance.now()-(MP.failAt[want]||0)>60000){const t=MP.tracks[want];t.bad=false;t.a.src=MUSIC_FILES[want]+'?r='+Date.now();t.a.load()}
  if(on&&want!==MP.cur){MP.cur=want;const t=mpTrack(want);if(t.ok&&!t.bad){if(t.a.ended||t.a.paused)try{t.a.currentTime=0}catch(e){}mpPlay(t)}}
  for(const k in MP.tracks){const t=MP.tracks[k],act=on&&k===MP.cur&&!t.bad;
    t.gain.gain.setTargetAtTime(act?1:0,now,act?1.2:.9);
    if(act){if(t.a.paused)mpPlay(t)}
    else if(!t.a.paused&&t.gain.gain.value<.01){t.a.pause()}}
  if(!on)MP.cur=null;
};
/* 첫 터치·버튼 전에는 브라우저가 소리를 막아서, 막혔던 곡은 다음 입력 때 다시 틀어요 */
['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,()=>{for(const k in MP.tracks){const t=MP.tracks[k];if(t.needTap&&k===MP.cur){t.needTap=false;mpPlay(t)}}},{passive:true}));
/* 게임패드만 쓸 때도(조이콘) 버튼을 누르면 다시 시도 */
setInterval(()=>{if(!AU.ctx||!MP.cur)return;const t=MP.tracks[MP.cur];if(t&&t.needTap&&navigator.getGamepads){const g=[...navigator.getGamepads()].some(p=>p&&p.buttons.some(b=>b.pressed));if(g){t.needTap=false;mpPlay(t)}}},300);
