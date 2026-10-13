'use strict';
/* 우리 둘의 꽃집 — 6-art.js : 꽃·사람·동물·물건 그림
   (파일은 index.html 에 적힌 순서대로 불러와요. 앞 파일의 함수·변수를 뒤 파일이 이어서 씀) */
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
/* 키 지정 묶음 k(0·1)는 조이콘 한 짝에 붙어 있어요. '생민·수갱 자리 바꾸기'를 하면 묶음째 상대 캐릭터로 넘어가요(스틱·버튼·키 모두 같이) */
function kOf(p){return (SET.swapSides&&(S.mode!=='solo'||S.phase!=='play'))?1-p:p}
function bindHit(code){for(const k of [0,1]){const K=SET.keys[k]||{};for(const [fn] of BFN){const b=K[fn];if(b&&b.t==='k'&&b.c===code)return {p:kOf(k),fn}}}return null}
function hasPadBind(id){for(const p of [0,1]){const K=SET.keys[p]||{};for(const [fn] of BFN){const b=K[fn];if(b&&b.t==='p'&&b.id===id)return true}}return false}
function assignBind(val){
  for(const p of [0,1]){const K=SET.keys[p]||(SET.keys[p]={});for(const [fn] of BFN){const b=K[fn];if(b&&b.t===val.t&&(val.t==='k'?b.c===val.c:(b.id===val.id&&b.b===val.b)))delete K[fn]}}
  (SET.keys[kOf(BIND.p)]||(SET.keys[kOf(BIND.p)]={}))[BFN_UI[BIND.fi][0]]=val;saveSettings();sfx('tap');
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
  const K=SET.keys[kOf(p)]||{},now=performance.now();let x=0,y=0;
  const held=b=>{if(!b)return false;if(b.t==='k')return KB_HELD[b.c]&&now-KB_HELD[b.c]<(KB_UP[b.c]?2500:220);const gp=padsList().find(g=>g.id===b.id);return !!(gp&&gp.buttons[b.b]&&gp.buttons[b.b].pressed)};
  if(held(K.up))y-=1;if(held(K.down))y+=1;if(held(K.left))x-=1;if(held(K.right))x+=1;
  if(x&&y){x*=Math.SQRT1_2;y*=Math.SQRT1_2}return [x,y];
}
function doBind(p,fn,rep){
  const slot=S.mode==='solo'?S.active:p,ctx=navContext(slot);
  if(['up','down','left','right'].includes(fn)){if(ctx){const now=performance.now();if(rep&&now-bindNavT[p]<170)return;bindNavT[p]=now;navMove(ctx,fn)}return}
  if(rep)return;
  if(fn==='act'){if(ctx)navPress(ctx);else if(S.phase==='play')doAction(slot);return}
  if(fn==='back'){if(ctx)navBack(ctx);else if(S.phase==='play'&&S.chars[slot]&&(S.chars[slot].rest||S.chars[slot].carry))backAct(slot);return}
  if(fn==='menu'){if(ctx&&ctx.key==='screen'&&S.phase==='play')navMenu();else if(S.phase==='play')togglePause();return}
  if(fn==='swap'){if(S.mode==='solo'&&!ctx)swapChar();return}
}
function padBindPoll(gp,st){
  let used=false;for(const k of [0,1]){const K=SET.keys[k]||{},p=kOf(k);for(const [fn] of BFN){const b=K[fn];if(!b||b.t!=='p'||b.id!==gp.id)continue;used=true;const on=gp.buttons[b.b]&&gp.buttons[b.b].pressed;
    if(on&&fn==='act'&&typeof PADACT!=='undefined')PADACT[S.mode==='solo'?S.active:p]=true;
    if(on&&!st.prev[b.b])doBind(p,fn,false);else if(on&&['up','down','left','right'].includes(fn))doBind(p,fn,true)}}
  return used;
}
function renderKeys(){
  const box=$('#keyBox');if(!box)return;
  const col=p=>`<div><div class="lbl">${p?'수갱':'생민'} · ${p===sideSlot('L')?'왼쪽':'오른쪽'} 조이콘</div>${BFN_UI.map(([fn,n],fi)=>{const on=BIND.on&&BIND.p===p&&BIND.fi===fi;return `<div class="setrow"><span class="grow">${n}<br><small>${on?'<b style="color:#C65C79;font-weight:normal">지금 조이콘 버튼을 누르세요…</b>':esc(bindLabel((SET.keys[kOf(p)]||{})[fn]))}</small></span><button class="btn small ${on?'primary':''}" data-bk="${p}|${fi}">${on?'대기 중':'지정'}</button></div>`}).join('')}
    <div class="row"><button class="btn small soft" data-bseq="${p}">처음부터 차례로 지정</button><button class="btn small" data-bclr="${p}">지우기</button></div></div>`;
  box.innerHTML=`${BIND.msg?`<p class="req" style="color:#C65C79">${esc(BIND.msg)}</p>`:''}<div class="inv" style="height:auto">${col(0)}${col(1)}</div>`;
  box.querySelectorAll('[data-bk]').forEach(b=>b.onclick=()=>{const [p,fi]=b.dataset.bk.split('|').map(Number);Object.assign(BIND,{on:true,p,fi,seq:false,t0:performance.now(),msg:''});renderKeys()});
  box.querySelectorAll('[data-bseq]').forEach(b=>b.onclick=()=>{Object.assign(BIND,{on:true,p:+b.dataset.bseq,fi:0,seq:true,t0:performance.now(),msg:''});renderKeys()});
  box.querySelectorAll('[data-bclr]').forEach(b=>b.onclick=()=>{SET.keys[kOf(+b.dataset.bclr)]={};saveSettings();BIND.msg='지웠어요';renderKeys()});
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
  vintage:{name:'빈티지 파리',wall:'#F4ECDD',dot:'#F4ECDD',wain:'#EADFCB',wainL:'#F2E9D8',trim:'#C9A24A',side:'#E6DBC6',floor:'check',f1:'#F3EFE6',f2:'#4B4A50',seam:'#D8D2C6',frame:'#C9A24A'},
  minimal:{name:'미니멀 화이트',wall:'#FAFAF8',dot:'#FAFAF8',wain:'#F3F3F0',wainL:'#F7F7F4',trim:'#FFFFFF',side:'#EFEFEC',floor:'plain',f1:'#F7F7F5',f2:'#F2F2EF',seam:'#EAEAE6',frame:'#E4E4E0'},
  // 상점에서 사는 테마(deco: 벽 장식 추가 그림, wp: 벽지 무늬)

  pastel:{name:'파스텔',wall:'#FDF1F4',dot:'#F7DCE5',wain:'#CFEAE1',wainL:'#DDF1EA',trim:'#FFFFFF',side:'#F4E6EC',floor:'check',f1:'#FFF8FA',f2:'#E4F2EC',seam:'#EFE2E6',frame:'#F4B6C4',wp:'stripe'},
  xmas:{name:'크리스마스',wall:'#F5EFE3',dot:'#E9DCC6',wain:'#3F6B4E',wainL:'#4C7A5B',trim:'#FFFDF8',side:'#EAE2D3',floor:'plank',f1:'#C9A27A',f2:'#B8906A',seam:'#9E7A58',frame:'#C0463E',deco:'xmas'},
  forest:{name:'숲속 오두막',wall:'#EEF0E4',dot:'#DDE3CF',wain:'#6F8A64',wainL:'#7F9A73',trim:'#F6F3EA',side:'#E2E6D6',floor:'herring',f1:'#C9A27A',f2:'#B8906A',seam:'#9E7A58',frame:'#8C6448'},
  navyc:{name:'네이비 클래식',wall:'#F3F1EC',dot:'#E3E1DA',wain:'#3E4D6E',wainL:'#4D5D80',trim:'#FFFFFF',side:'#E6E4DE',floor:'herring',f1:'#D9C2A0',f2:'#C9AE88',seam:'#B0926C',frame:'#C9A24A'},
  terra:{name:'테라코타',wall:'#FBEFE6',dot:'#F2DCCD',wain:'#D9896A',wainL:'#E49A7C',trim:'#FFF8F2',side:'#F1E0D4',floor:'check',f1:'#F7E8DA',f2:'#E8C2A8',seam:'#D9B39A',frame:'#C97B5A'},
  mono:{name:'모노 그레이',wall:'#EDEDEB',dot:'#E2E2DF',wain:'#9A9C9F',wainL:'#A9ABAE',trim:'#FAFAF8',side:'#E3E3E0',floor:'plain',f1:'#DADAD6',f2:'#D2D2CE',seam:'#C6C6C1',frame:'#6E7076'},
  spring:{name:'벚꽃 봄',wall:'#FFF5F5',dot:'#F9DDE4',wain:'#F6D8DF',wainL:'#FBE6EB',trim:'#FFFFFF',side:'#F6E7E8',floor:'plank',f1:'#F2E0C9',f2:'#E9D2B6',seam:'#D8BE9E',frame:'#E8A3B4',deco:'spring'}
};
function curStyle(){return STYLES[S.style]||STYLES.natural}

/* ---- flower heads (SVG, small) ---- */
function wcol(c,w,to){return mix(c,to||'#B49A7E',w*.85)}
const FSVG_R={rose:.62,tulip:.62,hydrangea:.95,freesia:.85,gyp:.8,sunflower:.75,ranunculus:.64,peony:.85};
function imgHead(t,x,y,R,rot,w,seed){const S=R*1.27,u=flowerURL(t,w,seed);return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(rot||0).toFixed(0)})"><image href="${u}" x="${(-S).toFixed(1)}" y="${(-S).toFixed(1)}" width="${(2*S).toFixed(1)}" height="${(2*S).toFixed(1)}"/></g>`}
function fHeadSVG(t,x,y,s,w,wet){
  const dr=w*s*.5,rot=w*38*(x<30?-1:1);let o=imgHead(t,x,y+dr,(FSVG_R[t]||.7)*s,rot,w,t==='hydrangea'||t==='gyp'?(Math.round(x*7+y)&7):0);
  if(wet&&!w)o+=`<g transform="translate(${x.toFixed(1)} ${(y+dr).toFixed(1)})"><circle cx="${.3*s}" cy="${-.55*s}" r="${.1*s}" fill="#fff" opacity=".9"/><path d="M${-.35*s},${-.2*s} l0,${-.22*s} M${-.46*s},${-.31*s} l${.22*s},0" stroke="#fff" stroke-width=".5" opacity=".9"/></g>`;
  return o;
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
/* 옷·치장 상점 그림: 사람에게 입힌 모습 대신 물건 자체를 크게(가벼운 도형 그림이라 메모리도 적어요) */
function styleArt(k,v){const D=c=>mix(c,'#000',.18),Lg=c=>mix(c,'#FFFFFF',.3);
  if(k==='tee'){const [tp,c0,l]=String(v).split('|');const c=c0||tp,top=c0?tp:null;
    const body=`<path d="M12 20 L23 11 H41 L52 20 L46 28 L43 26 V55 H21 V26 L18 28Z" fill="${c}" stroke="${D(c)}" stroke-width="1"/>`;
    const neck=top==='hood'?`<path d="M22 12 Q32 2 42 12 Q32 20 22 12Z" fill="${D(c)}"/><path d="M28 16 v12 M36 16 v12" stroke="${Lg(c)}" stroke-width="1.4"/><rect x="25" y="40" width="14" height="8" rx="2" fill="${D(c)}" opacity=".6"/>`:top==='knit'?`<path d="M26 11 Q32 17 38 11" stroke="${D(c)}" stroke-width="3" fill="none"/>${[25,29,33,37,41].map(x=>`<path d="M${x} 20 V54" stroke="${D(c)}" stroke-width=".8" opacity=".5"/>`).join('')}<rect x="21" y="51" width="22" height="4" fill="${D(c)}"/>`:`<path d="M27 11 Q32 16 37 11" stroke="${D(c)}" stroke-width="1.5" fill="none"/>`;
    const str=top==='stripe'?[22,28,34,40,46,52].map(y=>`<rect x="21" y="${y}" width="22" height="2.6" fill="${l}"/>`).join('')+`<rect x="13" y="21" width="9" height="2.4" fill="${l}" transform="rotate(-38 13 21)"/>`:'';
    return sv(body+str+neck)}
  if(k==='pants'){const sk=String(v).startsWith('s:'),c=sk?v.slice(2):v;
    if(sk){const pleat=/^#3E4D78$/i.test(c);return sv(`<rect x="20" y="10" width="24" height="6" rx="1.5" fill="${D(c)}"/><path d="M20 15 H44 L52 54 H12Z" fill="${c}" stroke="${D(c)}"/>${pleat?[18,24,30,36,42,48].map(x=>`<path d="M${(32+(x-32)*.5).toFixed(1)} 16 L${x} 54" stroke="${D(c)}" stroke-width=".9"/>`).join(''):`<path d="M30 16 L28 54" stroke="${D(c)}" stroke-width=".8" opacity=".6"/>`}`)}
    const jean=/5A78A6|8FAED0/i.test(c),cord=/6B4E3D/i.test(c);return sv(`<path d="M18 8 H46 L48 56 H36 L32 24 L28 56 H16Z" fill="${c}" stroke="${D(c)}"/><rect x="18" y="8" width="28" height="5" fill="${D(c)}"/>${jean?'<path d="M21 14 Q24 20 30 18 M43 14 Q40 20 34 18" stroke="#E2C27A" stroke-width="1" fill="none"/><path d="M32 13 V24" stroke="#E2C27A" stroke-width=".8"/>':''}${cord?[20,23,26,38,41,44].map(x=>`<path d="M${x} 14 L${x+ (x<32?-1.5:1.5)} 54" stroke="${D(c)}" stroke-width=".7"/>`).join(''):''}`)}
  if(k==='dress'){const Dd=DRESS[v]||{c:'#ccc'},c=Dd.c;
    if(Dd.dress)return sv(`<path d="M24 8 H40 L42 22 L54 56 H10 L22 22Z" fill="${c}" stroke="${D(c)}"/><path d="M24 8 L20 4 M40 8 L44 4" stroke="${D(c)}" stroke-width="2"/><rect x="22" y="21" width="20" height="3" fill="${D(c)}" opacity=".6"/>${v==='pink'?[[24,34],[38,40],[30,48],[18,50],[44,52]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2" fill="#FFFFFF"/>`).join(''):''}`);
    const pat=Dd.shirt==='stripe'?[24,29,34,39].map(x=>`<path d="M${x} 14 V55" stroke="${Dd.l}" stroke-width="1.6"/>`).join(''):Dd.shirt==='check'?[20,27,34,41].map(x=>`<path d="M${x} 14 V55" stroke="${Dd.l}" stroke-width="1.6" opacity=".55"/>`).join('')+[22,30,38,46].map(y=>`<path d="M20 ${y} H44" stroke="${Dd.l}" stroke-width="1.6" opacity=".55"/>`).join(''):'';
    return sv(`<path d="M12 20 L23 11 H41 L52 20 L46 28 L43 26 V55 H21 V26 L18 28Z" fill="${c}" stroke="${D(c)}"/>${pat}<path d="M23 11 L32 22 L41 11 L36 10 L32 15 L28 10Z" fill="${Dd.shirt==='denim'?Lg(c):'#FBF8F2'}"/><path d="M32 22 V55" stroke="${D(c)}"/>${[28,36,44,51].map(y=>`<circle cx="33.5" cy="${y}" r="1.1" fill="${Dd.shirt==='denim'?'#E2C27A':'#E8E2D6'}"/>`).join('')}`)}
  if(k==='shoes'){const c=v,boot=/F2C230|C9B08A/i.test(c),dress=/2E2B30|8A5A3A/i.test(c);
    const one=(x)=>boot?`<path d="M${x} 14 h12 v26 l10 4 v8 h-22Z" fill="${c}" stroke="${D(c)}"/><rect x="${x}" y="48" width="22" height="4" fill="${D(c)}"/>`:dress?`<path d="M${x} 36 Q${x} 30 ${x+8} 30 L${x+14} 32 Q${x+24} 36 ${x+24} 44 H${x}Z" fill="${c}" stroke="${D(c)}"/><rect x="${x}" y="44" width="24" height="3" fill="${D(c)}"/><path d="M${x+6} 33 h8" stroke="${Lg(c)}" stroke-width="1.6"/>`:`<path d="M${x} 34 Q${x} 26 ${x+9} 27 L${x+14} 31 Q${x+24} 34 ${x+24} 42 H${x}Z" fill="${c}" stroke="${D(c)}"/><rect x="${x-.5}" y="42" width="25" height="5" rx="2" fill="#F4F2EE" stroke="#D8D2C6"/><path d="M${x+8} 30 l3 4 M${x+11} 29 l3 4" stroke="#FFFFFF" stroke-width="1.2"/>`;
    return sv(one(6)+`<g transform="translate(2 10)">${one(32)}</g>`)}
  if(k==='hat'){const H=HATV[v],kind=H?H[0]:v,c=H?H[1]:null;
    const A={beret:c=>`<ellipse cx="32" cy="34" rx="22" ry="11" fill="${c}"/><ellipse cx="32" cy="30" rx="18" ry="8" fill="${Lg(c)}" opacity=".35"/><circle cx="32" cy="22" r="2.6" fill="${D(c)}"/>`,
      sunhat:()=>'<ellipse cx="32" cy="40" rx="28" ry="9" fill="#E9D3A4"/><rect x="18" y="20" width="28" height="20" rx="10" fill="#F0DEB4"/><rect x="18" y="32" width="28" height="4" fill="#E07A7A"/>',
      beanie:c=>`<path d="M14 42 Q14 14 32 14 Q50 14 50 42Z" fill="${c}"/><rect x="12" y="38" width="40" height="10" rx="4" fill="${Lg(c)}"/>${[18,24,30,36,42,48].map(x=>`<path d="M${x} 39 v8" stroke="${D(c)}" stroke-width="1"/>`).join('')}<circle cx="32" cy="12" r="5" fill="#FFF1D6"/>`,
      cap:c=>`<path d="M14 38 Q14 16 32 16 Q50 16 50 38Z" fill="${c}"/><path d="M32 16 V38" stroke="${D(c)}"/><ellipse cx="44" cy="40" rx="16" ry="5" fill="${D(c)}"/><circle cx="32" cy="16" r="2" fill="${D(c)}"/>`,
      bucket:()=>'<path d="M8 44 Q32 54 56 44 L50 36 H14Z" fill="#E6D6B8"/><path d="M16 38 L20 16 H44 L48 38Z" fill="#F2E7D2"/><rect x="17" y="32" width="30" height="4" fill="#C9A07A"/>',
      fedora:c=>`<ellipse cx="32" cy="42" rx="26" ry="7" fill="${D(c)}"/><path d="M18 42 L20 20 Q32 14 44 20 L46 42Z" fill="${c}"/><path d="M26 18 Q32 24 38 18" stroke="${D(c)}" stroke-width="2" fill="none"/><rect x="19" y="34" width="26" height="5" fill="#2E2B30"/>`,
      visor:c=>`<path d="M12 30 Q32 22 52 30 L52 34 Q32 26 12 34Z" fill="${c}" stroke="#D8D2C6"/><ellipse cx="32" cy="40" rx="22" ry="7" fill="${mix(c,'#000',.08)}" stroke="#D8D2C6"/>`,
      crown:()=>'<ellipse cx="32" cy="36" rx="22" ry="9" fill="none" stroke="#7FAF6C" stroke-width="3"/>'+[...Array(9)].map((_,j)=>{const a=Math.PI*(1+j/8);const x=32+Math.cos(a)*22,y=36+Math.sin(a)*9;return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${['#F7B7C8','#FFFFFF','#F9D66B','#C9B3EA'][j%4]}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.4" fill="#E8A23A"/>`}).join('')};
    const f=A[kind];if(!f)return sv('<circle cx="32" cy="32" r="16" fill="#EEE"/>');return sv(f(c||({beret:'#C65C79',beanie:'#E3A04A',cap:'#5C7FB8',fedora:'#8C6A4E',visor:'#F2F0EA'}[kind])))}
  if(k==='glasses'){const G=glsSpec(v,{}),r=G.round;const lens=(x)=>r?`<circle cx="${x}" cy="32" r="10" fill="${G.lens}" stroke="${G.f}" stroke-width="${G.lw*1.3}"/>`:`<rect x="${x-11}" y="23" width="22" height="18" rx="6" fill="${G.lens}" stroke="${G.f}" stroke-width="${G.lw*1.6}"/>`;
    return sv(`${lens(20)}${lens(44)}<path d="M30 30 Q32 27 34 30" stroke="${G.f}" stroke-width="2.4" fill="none"/><path d="M${r?10:9} 30 L4 26 M${r?54:55} 30 L60 26" stroke="${G.f}" stroke-width="2.4"/><path d="M14 27 l5 -3 M38 27 l5 -3" stroke="#FFFFFF" stroke-width="1.6" opacity=".8"/>`)}
  if(k==='pin'){
    const P={ribbon:'<ellipse cx="22" cy="32" rx="12" ry="8" fill="#EE7F9C" transform="rotate(-20 22 32)"/><ellipse cx="42" cy="32" rx="12" ry="8" fill="#EE7F9C" transform="rotate(20 42 32)"/><circle cx="32" cy="32" r="5" fill="#C65C79"/><path d="M30 36 l-6 14 M34 36 l6 14" stroke="#EE7F9C" stroke-width="4" stroke-linecap="round"/>',
      flower:[0,1,2,3,4].map(q=>`<circle cx="${(32+Math.cos(q*1.2566)*9).toFixed(1)}" cy="${(30+Math.sin(q*1.2566)*9).toFixed(1)}" r="8" fill="#FFFFFF" stroke="#E8E2D6"/>`).join('')+'<circle cx="32" cy="30" r="5" fill="#F5CF4E"/><rect x="18" y="46" width="28" height="3" rx="1.5" fill="#B0A090"/>',
      yflower:[0,1,2,3,4].map(q=>`<circle cx="${(32+Math.cos(q*1.2566)*9).toFixed(1)}" cy="${(30+Math.sin(q*1.2566)*9).toFixed(1)}" r="8" fill="#F9D66B" stroke="#E2B84E"/>`).join('')+'<circle cx="32" cy="30" r="5" fill="#E8A23A"/><rect x="18" y="46" width="28" height="3" rx="1.5" fill="#B0A090"/>',
      band:'<path d="M10 46 Q10 14 32 14 Q54 14 54 46" stroke="#B9A2E0" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M14 40 Q16 20 32 18" stroke="#D9CCF2" stroke-width="2" fill="none"/>',
      claw:'<rect x="14" y="22" width="36" height="20" rx="8" fill="#8A5A36"/>'+[20,26,32,38,44].map(x=>`<path d="M${x} 22 V42" stroke="#C99A6A" stroke-width="2.2"/>`).join('')+'<ellipse cx="24" cy="27" rx="5" ry="2" fill="#FFFFFF" opacity=".35"/>',
      star:'<path d="M32 10 L37 25 L53 25 L40 34 L45 50 L32 40 L19 50 L24 34 L11 25 L27 25Z" fill="#F5CF4E" stroke="#D8A93A"/><rect x="18" y="52" width="28" height="3" rx="1.5" fill="#B0A090"/>',
      scrunchie:[...Array(9)].map((_,j)=>{const a=j*.698;return `<ellipse cx="${(32+Math.cos(a)*14).toFixed(1)}" cy="${(32+Math.sin(a)*14).toFixed(1)}" rx="8" ry="7" fill="${j%2?'#E8A0B4':'#F2B8C8'}"/>`}).join('')+'<circle cx="32" cy="32" r="7" fill="#FBF6F0"/>',
      bowP:'<ellipse cx="22" cy="30" rx="12" ry="8" fill="#FFFFFF" stroke="#E8E2D6" transform="rotate(-20 22 30)"/><ellipse cx="42" cy="30" rx="12" ry="8" fill="#FFFFFF" stroke="#E8E2D6" transform="rotate(20 42 30)"/>'+[14,20,44,50].map(x=>`<circle cx="${x}" cy="${x<32?27:27}" r="1.8" fill="#EDE6DA"/>`).join('')+'<circle cx="32" cy="31" r="4.5" fill="#F1E9DC"/>',
      pearl:[0,1,2].map(j=>`<circle cx="${20+j*12}" cy="${30+j*2}" r="6" fill="#FFFDF8" stroke="#D8CFC4"/><circle cx="${18+j*12}" cy="${28+j*2}" r="2" fill="#FFFFFF"/>`).join('')+'<rect x="12" y="40" width="40" height="3" rx="1.5" fill="#C9A24A"/>'};
    return sv(P[v]||'<circle cx="32" cy="32" r="12" fill="#EEE"/>')}
  if(k==='bag'){const B=BAGS[v]||{};
    if(B.prop==='basket')return sv('<path d="M14 30 C14 8 50 8 50 30" stroke="#A87A48" stroke-width="3" fill="none"/><path d="M10 30 H54 L48 54 H16Z" fill="#C99A63" stroke="#A87A48"/><path d="M12 38 H52 M14 46 H50" stroke="#A87A48"/><circle cx="24" cy="26" r="4" fill="#EE8FA7"/><circle cx="33" cy="25" r="4" fill="#F5CF4E"/><circle cx="41" cy="27" r="4" fill="#FFFFFF"/>');
    if(B.pack){const c=B.packC||'#E3A04A';return sv(`<rect x="16" y="14" width="32" height="40" rx="11" fill="${c}"/><path d="M24 14 Q32 6 40 14" stroke="${D(c)}" stroke-width="3" fill="none"/><rect x="21" y="32" width="22" height="14" rx="4" fill="${Lg(c)}"/><rect x="21" y="30" width="22" height="3" fill="${D(c)}"/>`)}
    const c=B.bagC||'#9C6B4C',tote=!!B.bagP||v==='canvas'||v==='denim';
    if(v==='rattan')return sv('<path d="M20 26 C20 8 44 8 44 26" stroke="#A87A48" stroke-width="3" fill="none"/><ellipse cx="32" cy="40" rx="20" ry="16" fill="#C99A63" stroke="#A87A48"/>'+[28,34,40,46].map(y=>`<path d="M14 ${y} Q32 ${y+4} 50 ${y}" stroke="#A87A48" stroke-width=".9" fill="none"/>`).join(''));
    if(tote)return sv(`<path d="M24 22 C24 6 40 6 40 22" stroke="${D(c)}" stroke-width="3" fill="none"/><path d="M14 22 H50 L47 56 H17Z" fill="${c}" stroke="${D(c)}"/>${B.bagP?`<circle cx="32" cy="38" r="7" fill="${B.bagP}"/>${B.bagP2?`<circle cx="32" cy="38" r="3" fill="${B.bagP2}"/>`:''}`:''}`);
    return sv(`<path d="M10 8 L36 30" stroke="${D(c)}" stroke-width="2.4"/><rect x="22" y="28" width="30" height="24" rx="5" fill="${c}" stroke="${D(c)}"/><path d="M22 34 H52 L48 42 H26Z" fill="${D(c)}" opacity=".5"/><circle cx="37" cy="41" r="2" fill="#E2C27A"/>`)}
  return wearArt(k,v)}
/* 액세서리·귀걸이는 사람 그림에선 작아서, 상점에는 물건 자체를 크게 그려 보여 줘요 */
function accArt(v){
  const pearls=(cx,cy,rx,ry,n,r)=>[...Array(n)].map((_,k)=>{const a=Math.PI*(.08+k*.84/(n-1));const x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry;return `<circle cx="${x.toFixed(1)}" cy="${(y+.6).toFixed(1)}" r="${r}" fill="#C9BFB4"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#FFFDF8"/><circle cx="${(x-1).toFixed(1)}" cy="${(y-1).toFixed(1)}" r="${r*.35}" fill="#fff"/>`}).join('');
  const bow=c=>`<path d="M10 22 L30 32 L10 44Z" fill="${c}"/><path d="M54 22 L34 32 L54 44Z" fill="${c}"/><rect x="27" y="26" width="10" height="12" rx="3" fill="${mix(c,'#000',.28)}"/>`;
  const cors=c=>`<ellipse cx="22" cy="44" rx="10" ry="4" fill="#6FA35E" transform="rotate(30 22 44)"/><ellipse cx="42" cy="44" rx="10" ry="4" fill="#7FB070" transform="rotate(-30 42 44)"/>${[0,1,2,3,4,5].map(k=>`<circle cx="${(32+Math.cos(k*1.047)*9).toFixed(1)}" cy="${(30+Math.sin(k*1.047)*9).toFixed(1)}" r="7.5" fill="${c}" stroke="${c==='#FFFFFF'?'#D8CFC4':mix(c,'#000',.15)}"/>`).join('')}<circle cx="32" cy="30" r="5" fill="#F5CF4E"/>`;
  const scarf=c=>`<path d="M12 18 Q32 30 52 18 L52 28 Q32 40 12 28Z" fill="${c}"/><rect x="36" y="28" width="10" height="26" rx="3" fill="${c}"/><path d="M38 54 v4 M41 54 v4 M44 54 v4" stroke="${mix(c,'#000',.25)}" stroke-width="1.5"/>`;
  const ear=k=>{const one=x=>k==='earP'?`<circle cx="${x}" cy="31" r="7" fill="#C9BFB4"/><circle cx="${x}" cy="30" r="7" fill="#FFFDF8"/><circle cx="${x-2.4}" cy="27.6" r="2.2" fill="#fff"/>`:k==='earG'?`<circle cx="${x}" cy="34" r="9" fill="none" stroke="#D8B04A" stroke-width="3.6"/><path d="M${x-7} 30 a9 9 0 0 1 5 -5" stroke="#FFF0B0" stroke-width="1.4" fill="none"/>`:`<circle cx="${x}" cy="16" r="3" fill="#E2C27A"/><path d="M${x} 18 v6" stroke="#C9A24A" stroke-width="1.5"/><path d="M${x} 22 C${x-8} 32 ${x-6} 42 ${x} 42 C${x+6} 42 ${x+8} 32 ${x} 22Z" fill="#E886A8"/><ellipse cx="${x-2}" cy="33" rx="2" ry="3.4" fill="#FFD6E4"/>`;return `<path d="M${18} 12 v6 M${46} 12 v6" stroke="#C9A24A" stroke-width="1.4"/>`+one(18)+one(46)};
  const vel='<rect x="6" y="6" width="52" height="52" rx="10" fill="#5A4A6E"/>'; /* 흰 진주는 진한 받침 위에 */
  const A={pearlN:vel+pearls(32,14,22,30,13,3.6),goldN:`<path d="M10 16 Q32 52 54 16" stroke="#C9A24A" stroke-width="2.2" fill="none"/><path d="M32 54 C22 46 22 36 32 40 C42 36 42 46 32 54Z" fill="#E8C24E" stroke="#A8822E"/><ellipse cx="28" cy="42" rx="2" ry="1.4" fill="#FFF2B8"/>`,
    bowR:bow('#C0463E'),bowN:bow('#3A4C80'),corsP:cors('#F29AB0'),corsW:cors('#FFFFFF'),scarfR:scarf('#C65C5C'),scarfC:scarf('#EFE4D0')};
  return sv(A[v]||((v==='earP'?vel:'')+ear(v)))}
function itemArt(it){
  const id=it.id;
  if(it.styleSet&&STYLES[it.styleSet]&&STYLES[it.styleSet].deco&&!it._plain)return themeArt(it);
  if(it.floor&&/^f_/.test(id||'')&&DECOR_DRAW[it.floor.t])return decorArt(it.floor.t,it.floor.w,it.floor.h,!!it.floor.wall);
  if(it.style){const [k,v]=it.style;
    if(k==='acc'||k==='ear')return accArt(v);
    if(k==='apron'){const knit=v==='knit',c=knit?'#F6D3DB':v;return sv(`<path d="M20 14 h24 v10 l6 32 H14 l6-32Z" fill="${c}"/><rect x="26" y="34" width="12" height="9" rx="2" fill="${mix(c,'#000',.15)}"/><path d="M20 14 L14 4 M44 14 L50 4" stroke="${mix(c,'#000',.2)}" stroke-width="2"/>${knit?[[24,30],[38,28],[30,48],[20,46],[44,44]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.4" fill="#F29AB0"/><circle cx="${x}" cy="${y}" r="1" fill="#F5CF4E"/>`).join(''):''}`)}
    return styleArt(k,v);
  }

  if(it.styleSet){const P=STYLES[it.styleSet];const fl=P.floor==='check'?`<rect x="6" y="36" width="52" height="22" fill="${P.f1}"/>${[0,1,2,3,4,5,6,7,8,9,10,11,12].map(q=>[0,1,2].map(r=>(q+r)%2?`<rect x="${6+q*4}" y="${36+r*7.3}" width="4" height="7.3" fill="${P.f2}"/>`:'').join('')).join('')}`:P.floor==='plain'?`<rect x="6" y="36" width="52" height="22" fill="${P.f1}"/>`:P.floor==='plank'?`<rect x="6" y="36" width="52" height="22" fill="${P.f1}"/>${[0,1,2].map(q=>`<rect x="6" y="${40+q*6}" width="52" height=".8" fill="${P.seam}"/>`).join('')}`:P.floor==='herring'?`<rect x="6" y="36" width="52" height="22" fill="${P.f1}"/>${[0,1,2,3,4,5,6].map(q=>`<path d="M${6+q*8} 58 l8 -8 M${6+q*8} 48 l8 -8" stroke="${P.seam}" stroke-width="1.2"/>`).join('')}`:`<rect x="6" y="36" width="52" height="22" fill="${P.f1}"/>${[0,1,2,3,4,5,6,7,8].map(q=>`<circle cx="${10+(q*13)%48}" cy="${40+(q*7)%16}" r="1.2" fill="${['#C9B8A6','#9FB0A6','#D9A89A'][q%3]}"/>`).join('')}`;
    const lamp=it.styleSet==='natural'?'<path d="M26 8 L38 8 L42 18 L22 18Z" fill="#C9A06A"/><path d="M24 12 H40" stroke="#B08850"/>':it.styleSet==='vintage'?'<path d="M32 2 V10" stroke="#C9A24A"/><path d="M24 18 Q32 6 40 18Z" fill="#C9A24A"/>':'<circle cx="32" cy="14" r="6" fill="#FFFFFF" stroke="#E4E0D8"/>';
    return sv(`<rect x="6" y="6" width="52" height="30" fill="${P.wall}"/><rect x="6" y="27" width="52" height="9" fill="${P.wain}"/>${fl}${lamp}<rect x="42" y="40" width="7" height="10" rx="2" fill="#D98E6C"/><ellipse cx="45.5" cy="38" rx="6" ry="5" fill="#7FAF6C"/><rect x="12" y="20" width="12" height="10" fill="${P.frame}"/><rect x="13.5" y="21.5" width="9" height="7" fill="#FFF8EE"/>`);
  }
  const A={
    basket:'<path d="M14 32 C14 10 50 10 50 32" stroke="#A87A48" stroke-width="3" fill="none"/><ellipse cx="32" cy="32" rx="20" ry="5" fill="#A87A48"/><circle cx="24" cy="26" r="5" fill="#EE8FA7"/><circle cx="33" cy="26" r="5" fill="#D9435E"/><circle cx="41" cy="29" r="4.5" fill="#F5CF4E"/><path d="M11 32 Q12 54 32 55 Q52 54 53 32 Q32 38 11 32Z" fill="#C99A63" stroke="#A87A48"/><path d="M14 40 Q32 46 50 40 M16 47 Q32 52 48 47" stroke="#A87A48" fill="none"/><path d="M40 44 C40 36 56 36 56 44" stroke="#D2CABB" stroke-width="2" fill="none" opacity="0"/>',
    fridge:'<rect x="18" y="6" width="28" height="52" rx="4" fill="#8FB3D4"/><rect x="21" y="10" width="22" height="40" rx="2" fill="#E4F3FA"/>'+[18,28,38].map(y=>`<rect x="21" y="${y+8}" width="22" height="1" fill="#BCD3E4"/><circle cx="27" cy="${y+5}" r="3" fill="#EE8FA7"/><circle cx="36" cy="${y+5}" r="3" fill="#F5CF4E"/>`).join(''),
    bucket3:'<path d="M18 26 H46 L42 56 H22Z" fill="#B4C2CC"/><ellipse cx="32" cy="26" rx="14" ry="3.5" fill="#8CC3E6"/>'+[0,1,2].map(k=>`<path d="M${28+k*4} 26 L${24+k*8} 10" stroke="#6E9A5A" stroke-width="1.5"/>`).join('')+'<circle cx="24" cy="10" r="4" fill="#EE8FA7"/><circle cx="32" cy="8" r="4" fill="#D9435E"/><circle cx="40" cy="10" r="4" fill="#F5CF4E"/>',
    dryer:'<rect x="12" y="8" width="3" height="50" fill="#9C6B4C"/><rect x="49" y="8" width="3" height="50" fill="#9C6B4C"/><rect x="10" y="7" width="44" height="4" rx="2" fill="#C99E78"/>'+[20,32,44].map((x,k)=>`<path d="M${x} 11 V18" stroke="#B88A5A"/><path d="M${x} 18 L${x-3} 34 M${x} 18 L${x+3} 34 M${x} 18 V34" stroke="#A89A6E"/><circle cx="${x-3}" cy="36" r="3" fill="${['#C9A07A','#D8B06A','#C98E8E'][k]}"/><circle cx="${x+3}" cy="36" r="3" fill="${['#D8B06A','#C98E8E','#C9A07A'][k]}"/>`).join(''),
    pickup:'<rect x="10" y="36" width="44" height="18" rx="3" fill="#C99873"/><rect x="8" y="32" width="48" height="6" rx="2" fill="#E9D3B6"/><path d="M26 32 L32 12 L38 32Z" fill="#F4B6C4"/><circle cx="29" cy="14" r="3.5" fill="#EE8FA7"/><circle cx="35" cy="15" r="3.5" fill="#F5CF4E"/><rect x="24" y="18" width="16" height="6" rx="3" fill="#fff"/>',
    craft2:'<rect x="8" y="26" width="48" height="8" rx="2" fill="#F6D5DC"/><rect x="8" y="33" width="48" height="5" fill="#C98E9C"/><rect x="12" y="38" width="4" height="18" fill="#9C6B4C"/><rect x="48" y="38" width="4" height="18" fill="#9C6B4C"/><circle cx="40" cy="24" r="4" fill="#D8B994"/><path d="M18 26 L28 16" stroke="#6E9A5A" stroke-width="1.5"/><circle cx="28" cy="15" r="3.5" fill="#EE8FA7"/>',
    scissors:'<path d="M20 44 L46 14" stroke="#AFBAC2" stroke-width="4" stroke-linecap="round"/><path d="M20 14 L46 44" stroke="#C9D2D8" stroke-width="4" stroke-linecap="round"/><circle cx="18" cy="48" r="6" fill="none" stroke="#E1B656" stroke-width="3"/><circle cx="46" cy="48" r="6" fill="none" stroke="#E1B656" stroke-width="3"/>',
    sprinkler:'<rect x="30" y="26" width="4" height="30" fill="#8E9CA6"/><ellipse cx="32" cy="26" rx="10" ry="4" fill="#BCC7CF"/>'+[0,1,2,3,4,5].map(k=>`<ellipse cx="${10+k*9}" cy="${12+(k%2)*5}" rx="1.4" ry="2.3" fill="#7FB8E6"/>`).join(''),
    papers2:[['#BFE3D0',14],['#F6B7A0',28],['#D8B994',42]].map(([c,x])=>`<rect x="${x}" y="10" width="10" height="44" rx="5" fill="${c}"/><ellipse cx="${x+5}" cy="10" rx="5" ry="2" fill="${mix(c,'#fff',.4)}"/>`).join(''),
    patterns2:'<rect x="8" y="10" width="14" height="44" rx="4" fill="#F4B6C4"/>'+[16,24,32,40,48].map(y=>`<circle cx="15" cy="${y}" r="3" fill="none" stroke="#fff" stroke-width="1.2"/>`).join('')+'<rect x="25" y="10" width="14" height="44" rx="4" fill="#EFE4D2"/>'+[15,20,25,30,35,40,45].map(y=>`<path d="M27 ${y}h10" stroke="#8A8278" stroke-width="1"/>`).join('')+'<rect x="42" y="10" width="14" height="44" rx="4" fill="#DDEFFA" opacity=".8" stroke="#fff"/><path d="M45 16 L50 30" stroke="#fff" stroke-width="2"/>',
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
  if(/^papers[345]$/.test(id)){const L=Object.values(PAPERS).filter(q=>q.set===id).slice(0,4);return sv(L.map((q,k)=>{const x=8+k*12.5;return `<rect x="${x}" y="10" width="10" height="44" rx="5" fill="${q.c}" stroke="${q.d}" stroke-width=".6"/><ellipse cx="${x+5}" cy="10" rx="5" ry="2" fill="${q.l}"/>`}).join(''))}
  if(/^ribbons[34]$/.test(id)){const L=Object.values(RIBBONS).filter(q=>q.set===id).slice(0,3);return sv(L.map((q,k)=>{const x=16+k*16,y=k%2?36:26;return `<ellipse cx="${x-5}" cy="${y}" rx="6" ry="3.6" fill="${q.c}" stroke="${q.d}" stroke-width=".6"/><ellipse cx="${x+5}" cy="${y}" rx="6" ry="3.6" fill="${q.c}" stroke="${q.d}" stroke-width=".6"/><circle cx="${x}" cy="${y}" r="2.4" fill="${q.d}"/><path d="M${x} ${y+2} q-3 8 -5 12 M${x} ${y+2} q3 8 5 12" stroke="${q.c}" stroke-width="2" fill="none"/>`}).join(''))}
  if(/^patterns[34]$/.test(id)){const L=Object.keys(PATTERNS).filter(k=>PATTERNS[k].set===id).slice(0,3),cols=['#F4B6C4','#B9D6F0','#C5D3B4'];return sv(L.map((k,q)=>{const x=8+q*17,P=PAPERS[['pink','sky','sage'][q]],pid='ia'+id+q;return `<defs>${patDef(k,pid,P)}</defs><rect x="${x}" y="10" width="14" height="44" rx="4" fill="${cols[q]}"/><rect x="${x}" y="10" width="14" height="44" rx="4" fill="url(#${pid})"/>`}).join(''))}
  if(id==='bows2'||id==='bows3'){const L=Object.keys(BOWS).filter(k=>BOWS[k].set===id),R=[RIBBONS.pink,RIBBONS.navy,RIBBONS.gold];return sv(L.map((k,q)=>bowSVG(k,L.length===2?20+q*24:14+q*18,22+(q%2)*14,R[q%3],.55)).join(''))}
  if(id==='shapes2')return sv(`<g transform="translate(2 14) scale(.9)">${shapeSwatch('hatbox','blush').replace(/<svg[^>]*>|<\/svg>/g,'')}</g><g transform="translate(22 30) scale(.9)">${shapeSwatch('bag','kraft').replace(/<svg[^>]*>|<\/svg>/g,'')}</g><g transform="translate(36 6) scale(.9)">${shapeSwatch('tin','pink').replace(/<svg[^>]*>|<\/svg>/g,'')}</g>`);
  if(it.front||/^fr_/.test(id)){const o=it.front?{[it.front[0]]:it.front[1]}:{};const AW=FRONT.awn.opts[o.awn||'pink'],WL=FRONT.wall.opts[o.wall||'pink'][1],DR=FRONT.door.opts[o.door||'wood'][1];
    const ex={fr_boxes:'<rect x="10" y="44" width="14" height="4" fill="#C9A07A"/>'+[0,1,2,3].map(k=>`<circle cx="${12+k*3.4}" cy="42" r="2" fill="${['#EE8FA7','#F5CF4E','#fff','#D9435E'][k]}"/>`).join(''),fr_lamps:'<rect x="24" y="30" width="4" height="7" rx="1" fill="#3E3A40"/><rect x="25" y="31" width="2" height="4" fill="#FFE9A8"/><rect x="42" y="30" width="4" height="7" rx="1" fill="#3E3A40"/><rect x="43" y="31" width="2" height="4" fill="#FFE9A8"/>',
      fr_ivy:[0,1,2,3,4,5].map(k=>`<ellipse cx="${9+Math.sin(k)*2}" cy="${18+k*6}" rx="2.6" ry="1.6" fill="#6E9A5A"/><ellipse cx="${55-Math.sin(k)*2}" cy="${20+k*6}" rx="2.6" ry="1.6" fill="#88B271"/>`).join(''),fr_board:'<rect x="46" y="44" width="12" height="10" rx="1" fill="#3E4A44" stroke="#8C6448"/><text x="52" y="51" font-size="4" text-anchor="middle" fill="#fff">OPEN</text>',
      fr_bike:'<circle cx="14" cy="54" r="3.5" fill="none" stroke="#4A4448"/><circle cx="26" cy="54" r="3.5" fill="none" stroke="#4A4448"/><path d="M14 54 L20 48 L26 54 M20 48 H24" stroke="#6F9C8A" stroke-width="1.4" fill="none"/><rect x="9" y="45" width="7" height="4" fill="#C99A63"/><circle cx="11" cy="44" r="1.6" fill="#EE8FA7"/><circle cx="14" cy="44" r="1.6" fill="#F5CF4E"/>',
      fr_tile:'<rect x="4" y="56" width="56" height="5" fill="#E8DCCB"/>'+[0,1,2,3,4,5,6].map(k=>k%2?`<rect x="${4+k*8}" y="56" width="8" height="5" fill="#D9C8B0"/>`:'').join('')}[id]||'';
    return sv(`<rect x="8" y="12" width="48" height="44" fill="${WL}"/><rect x="8" y="9" width="48" height="4" fill="${AW[3]}"/>${[0,1,2,3,4,5].map(k=>`<rect x="${8+k*8}" y="20" width="8" height="5" fill="${k%2?'#fff':AW[1]}"/>`).join('')}<rect x="12" y="30" width="10" height="12" rx="1" fill="#FBEFE9" stroke="#F8F4EC"/><rect x="42" y="30" width="10" height="12" rx="1" fill="#FBEFE9" stroke="#F8F4EC"/><rect x="27" y="34" width="12" height="22" rx="1.5" fill="${DR}"/><rect x="29" y="36" width="8" height="7" fill="#CFE3EE"/>${ex}`)}
  if(/^fl_/.test(id)){const t=id.slice(3);return sv(`<path d="M32 58 V30" stroke="#6E9A5A" stroke-width="2.4"/><ellipse cx="25" cy="44" rx="6" ry="2.6" fill="#88B271" transform="rotate(-30 25 44)"/><image href="${flowerURL(t,0,3)}" x="6" y="2" width="52" height="52"/>`)}
  if(id==='bucket4'||id==='xbucket')return sv(A.bucket3);
  const numTag=n=>`<circle cx="50" cy="14" r="9" fill="#E0708C"/><text x="50" y="18" font-size="11" text-anchor="middle" fill="#fff" font-family="Jua,sans-serif">${n}</text>`;
  if(/^pickup\d/.test(id))return sv(A.pickup+numTag({pickup2:4,pickup3:6,pickup4:8}[id]));
  if(id==='xfridge')return sv(A.fridge+'<circle cx="50" cy="14" r="9" fill="#7FB070"/><path d="M50 9 v10 M45 14 h10" stroke="#fff" stroke-width="2.4"/>');
  if(/^fridge\d/.test(id))return sv(A.fridge+numTag({fridge2:16,fridge3:20,fridge4:24}[id]));
  if(id==='xdisplay')return sv('<rect x="6" y="22" width="52" height="7" rx="2" fill="#B08560"/><rect x="6" y="36" width="52" height="8" rx="2" fill="#C99E78"/><rect x="9" y="44" width="3" height="14" fill="#9C6B4C"/><rect x="52" y="44" width="3" height="14" fill="#9C6B4C"/>'+[[14,22,'#EE8FA7'],[27,22,'#F5CF4E'],[40,22,'#D9435E'],[20,36,'#9DB8E8'],[34,36,'#fff'],[48,36,'#EE8FA7']].map(([x,y,c])=>`<path d="M${x-4} ${y-2} h8 l-1 6 h-6z" fill="#D98E6C"/><circle cx="${x-2}" cy="${y-7}" r="3" fill="${c}"/><circle cx="${x+2}" cy="${y-8}" r="3" fill="${c}"/>`).join(''));
  if(/^exp/.test(id)){const n=+id.slice(3);return sv(`<rect x="6" y="16" width="${20+n*3}" height="32" fill="#F0E4CF" stroke="#C9A07A" stroke-width="2"/><rect x="${26+n*3}" y="16" width="${8+n*2}" height="32" fill="#FBE6EA" stroke="#E08FA4" stroke-width="2" stroke-dasharray="3 2"/><path d="M${28+n*3} 32 h${n*2+2} m-4 -4 l4 4 l-4 4" stroke="#E0708C" stroke-width="2" fill="none"/>${numTag(n)}`)}
  if(id==='fridge')return sv(A.fridge);
  return sv(A[id]||'<circle cx="32" cy="32" r="16" fill="#EEE"/>');
}
/* 계절 테마 그림: 기본 그림 위에 가랜드·꽃잎을 얹어요 */
function themeArt(it){const s=itemArt({...it,_plain:1});const d=STYLES[it.styleSet].deco;
    const add=d==='xmas'?'<path d="M6 8 Q14 14 22 8 Q30 14 38 8 Q46 14 58 8" stroke="#3E7A4E" stroke-width="2.4" fill="none"/>'+[14,30,46].map((x,k)=>`<circle cx="${x}" cy="${12.5}" r="2" fill="${['#C0463E','#E2B656','#C0463E'][k]}"/>`).join('')+'<path d="M45 52 L50 38 L55 52Z" fill="#3E7A4E"/><circle cx="50" cy="37" r="1.6" fill="#E2B656"/>'
      :[10,16,22,28,34,40,46,52].map((x,k)=>`<circle cx="${x}" cy="${9+Math.sin(k)*2}" r="2.6" fill="${k%2?'#F7C3D0':'#FBDDE5'}"/>`).join('')+[[14,44],[36,50],[48,42],[24,54]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="1.8" ry="1.1" fill="#F7C3D0"/>`).join('');
    return s.replace('</svg>',add+'</svg>')}
/* 새 옷·가구 그림: 실제 캐릭터·가구 그림을 작게 찍어서 써요(한 번 그리면 기억) */
const ART_CACHE={};
/* 상점 그림(옷·가구)은 한 번에 많이 그리면 TV에서 멈칫해요 → 0.05초에 20ms까지만 그리고, 나머지는 잠깐 뒤 창을 다시 그려 이어서 그려요 */
let ART_T0=0,ART_MS=0,ART_LATER=0;
function artBudget(){const n=performance.now();if(n-ART_T0>60){ART_T0=n;ART_MS=0}return ART_MS<20}
/* 기다리는 그림만 제자리에서 바꿔 끼워요(창 전체를 다시 그리지 않음) */
function artLater(){if(ART_LATER)return;ART_LATER=setTimeout(()=>{ART_LATER=0;let more=false;
  document.querySelectorAll('.sart[data-id] svg[data-wait]').forEach(sv0=>{const box=sv0.parentNode,it=SHOP_ITEMS.find(x=>x.id===box.dataset.id);if(!it)return;const a=itemArt(it);if(a===ART_WAIT)more=true;else box.innerHTML=a});
  if(more)artLater()},70)}
const ART_WAIT='<svg data-wait="1" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="12" fill="#FBF6F0"/><circle cx="32" cy="32" r="5" fill="#E8DCCF"/></svg>';
/* 창(HTML)에 넣는 작은 그림은 긴 데이터 글자 대신 짧은 주소(blob:)로 — 상점 창을 다시 그릴 때 글자 수가 수십 분의 1로 줄어 TV에서 빨라져요 */
function artURL(cv){let d='';try{d=cv.toDataURL('image/png')}catch(e){return ''}
  try{const bin=atob(d.slice(d.indexOf(',')+1)),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);const u=URL.createObjectURL(new Blob([a],{type:'image/png'}));cv.width=cv.height=1;return u}catch(e){return d}}
function wearArt(cat,val){const key=cat+'|'+val;if(ART_CACHE[key])return ART_CACHE[key];if(!artBudget()){artLater();return ART_WAIT}const t0=performance.now();try{return wearArt0(cat,val,key)}finally{ART_MS+=performance.now()-t0}}
function wearArt0(cat,val,key){
  const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');
  const o={};o[cat]=val;const p=palFromOutfit(PAL[1],o);const up=['hat','pin','glasses','ear'].includes(cat);
  g.save();if(up){g.translate(64,226);g.scale(6,6)}else if(cat==='shoes'){g.translate(64,104);g.scale(4.4,4.4)}else if(cat==='acc'){g.translate(64,300);g.scale(3.4,3.4)}else if(cat==='bag'){g.translate(56,118);g.scale(2.9,2.9)}else{g.translate(64,122);g.scale(2.8,2.8)}
  try{drawChar(g,0,0,p,cat==='bag'?.5:0,0,false,false,false,false)}catch(e){console.error(e)}g.restore();
  const url=artURL(cv);ART_CACHE[key]=`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${ART_BG}<image href="${url}" x="0" y="0" width="64" height="64"/></svg>`;return ART_CACHE[key]}
function decorArt(t,w,h,wall){const key='d|'+t;if(ART_CACHE[key])return ART_CACHE[key];if(!artBudget()){artLater();return ART_WAIT}const t0=performance.now();try{return decorArt0(t,w,h,wall,key)}finally{ART_MS+=performance.now()-t0}}
function decorArt0(t,w,h,wall,key){
  const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');const d={t,w,h,x:0,y:0,wall};
  const top=wall?0:(PR_DEB[t]?-PR_DEB[t][1]:2),pw=w*TILE,ph=wall?20:h*TILE+top,sc=Math.min(110/Math.max(pw,1),110/Math.max(ph,1),4.2);
  g.save();g.translate(64-pw*sc/2,wall?64+20*sc:64+ph*sc/2-h*TILE*sc);g.scale(sc,sc);try{DECOR_DRAW[t](g,d,0,0,pw,h*TILE)}catch(e){console.error(e)}g.restore();
  const url=artURL(cv);ART_CACHE[key]=`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${ART_BG}${wall?'<rect x="6" y="6" width="52" height="40" rx="6" fill="'+curStyle().wall+'"/>':''}<image href="${url}" x="0" y="0" width="64" height="64"/></svg>`;return ART_CACHE[key]}
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
/* =========================================================
   꽃 그림 v2 (장미·튤립·프리지아·수국·안개꽃) — 게임 속 그림과 창 미리보기가 같은 그림을 씀
   flowerArt(g,t,x,y,s,w,seed): (x,y)=꽃송이 중심, s=크기(반지름 정도), w=시듦 0~1
   ========================================================= */
function wmix(c,w,to){return w>0?mix(c,to||WITHER,w*.85):c}
function fgrad(g,x0,y0,x1,y1,stops){const q=g.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,c])=>q.addColorStop(o,c));return q}
function frad(g,x,y,r,stops){const q=g.createRadialGradient(x,y,0,x,y,r);stops.forEach(([o,c])=>q.addColorStop(o,c));return q}
function fEl(g,x,y,rx,ry,f,r){g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),r||0,0,Math.PI*2);g.fillStyle=f;g.fill()}
/* 장미 */
function roseArt(g,s,w){
  const C={dk:wmix('#5E0719',w,'#6E5646'),md:wmix('#94102A',w,'#8E6E58'),m2:wmix('#B81A35',w),lt:wmix('#D2334B',w),hi:wmix('#EA6477',w,'#D8C8B6'),curl:w>.5?'rgba(170,130,100,.8)':'rgba(255,170,185,.85)'};
  g.save();g.scale(s,s);const cy=-.28,RX=.9,RY=.42;
  for(const a of [-2.6,-.55,-1.57]){g.save();g.rotate(a+Math.PI/2);poly(g,[-.09,.5,0,1.0,.09,.5],wmix('#46723A',w,'#8E7F58'));g.restore()}
  g.beginPath();g.moveTo(-RX-.05,cy);g.bezierCurveTo(-1.02,.35,-.55,.8,0,.8);g.bezierCurveTo(.55,.8,1.02,.35,RX+.05,cy);g.ellipse(0,cy,RX+.05,RY+.06,0,0,Math.PI,true);g.closePath();
  g.fillStyle=fgrad(g,0,cy,0,.8,[[0,C.lt],[.5,C.m2],[1,C.dk]]);g.fill();
  [[Math.PI*1.0,Math.PI*1.4,.16],[Math.PI*1.3,Math.PI*1.72,.22],[Math.PI*1.62,Math.PI*2.0,.16]].forEach(([a0,a1,up])=>{g.beginPath();
    g.moveTo(Math.cos(a0)*RX,cy+Math.sin(a0)*RY);for(let t=0;t<=1.0001;t+=.1){const a=a0+(a1-a0)*t,b=Math.sin(Math.PI*t);g.lineTo(Math.cos(a)*(RX+.06*b),cy+Math.sin(a)*(RY+.02)-up*b)}
    for(let t=1;t>=-.0001;t-=.1){const a=a0+(a1-a0)*t;g.lineTo(Math.cos(a)*RX*.9,cy+Math.sin(a)*RY*.86)}g.closePath();
    g.fillStyle=fgrad(g,0,cy-RY-up,0,cy,[[0,C.hi],[.5,C.lt],[1,C.m2]]);g.fill()});
  fEl(g,0,cy+.01,RX*.88,RY*.84,frad(g,0,cy,RX,[[0,wmix('#3E0410',w,'#4E3A30')],[.7,C.dk],[1,C.md]]));
  [[.8,.37,3.0,6.2,-.06,.02],[.66,.3,5.1,8.4,.08,-.05],[.53,.25,2.7,5.8,-.05,.07],[.4,.19,5.3,8.2,.07,-.04],[.28,.14,2.9,5.7,-.04,.06],[.17,.09,5.0,7.9,.03,0]].forEach(([rx,ry,a0,a1,ox,rot],k)=>{
    g.save();g.translate(ox,cy+.02*k);g.rotate(rot);g.beginPath();g.ellipse(0,0,rx,ry,0,a0,a1);g.ellipse(-ox*.4,ry*.62,rx*.86,ry*.62,0,a1,a0,true);g.closePath();
    g.fillStyle=fgrad(g,0,-ry,0,ry*.9,[[0,k%2?C.hi:C.lt],[.55,C.m2],[1,C.dk]]);g.fill();
    g.beginPath();g.ellipse(0,0,rx,ry,0,a0+(a1-a0)*.25,a1-(a1-a0)*.2);g.strokeStyle=C.curl;g.lineWidth=.022;g.stroke();g.restore()});
  const front=(a0,a1,drop,side)=>{const pts=[];for(let t=0;t<=1.0001;t+=.1){const a=a0+(a1-a0)*t;pts.push([Math.cos(a)*(RX+.02),cy+Math.sin(a)*(RY+.02)+Math.sin(Math.PI*t)*.03])}
    g.beginPath();g.moveTo(pts[0][0],pts[0][1]);pts.forEach(p=>g.lineTo(p[0],p[1]));const [ex,ey]=pts[pts.length-1],[sx,sy]=pts[0];
    g.bezierCurveTo(ex+side*.08,ey+.4,(sx+ex)/2+side*.1,drop,(sx+ex)/2,drop);g.bezierCurveTo((sx+ex)/2-side*.2,drop-.02,sx-side*.05,sy+.4,sx,sy);g.closePath();
    g.fillStyle=fgrad(g,0,cy,0,drop,[[0,C.hi],[.15,C.lt],[.6,C.m2],[1,C.md]]);g.fill();
    g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]-.01):g.moveTo(p[0],p[1]-.01));g.globalAlpha=.6;g.strokeStyle=C.curl;g.lineWidth=.03;g.stroke();g.globalAlpha=1;return pts};
  const pL=front(Math.PI*.98,Math.PI*.42,.72,1),pR=front(Math.PI*.02,Math.PI*.6,.74,-1);front(Math.PI*.72,Math.PI*.3,.8,0);
  for(const [x0,x1] of [[-.6,-.5],[-.35,-.3],[.3,.28],[.55,.48]])ln(g,x0,.05,x1,.55,'rgba(90,0,25,.12)',.02);
  if(w>.45){g.globalAlpha=Math.min(.8,(w-.45)*2);g.strokeStyle='#7A5A40';g.lineWidth=.05;[pL,pR].forEach(p=>{g.beginPath();p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()});g.globalAlpha=1}
  g.restore();
}
/* 튤립: 겹친 컵 모양 꽃잎 3장 + 끝이 살짝 뾰족 */
function tulipArt(g,s,w){
  const A=wmix('#C9406A',w),B=wmix('#EE7FA0',w),L=wmix('#FFD1DD',w,'#E6D8C6'),D=wmix('#9E2A50',w,'#7E6454');
  g.save();g.scale(s,s);
  const petal=(cx,rot,wd,ht,c1,c2,c3)=>{g.save();g.translate(cx,.35);g.rotate(rot);g.beginPath();g.moveTo(0,0);
    g.bezierCurveTo(-wd*.62,-.02,-wd*.78,-ht*.55,-wd*.46,-ht*.92);g.quadraticCurveTo(-wd*.1,-ht*1.02,0,-ht*1.12);g.quadraticCurveTo(wd*.1,-ht*1.02,wd*.46,-ht*.92);g.bezierCurveTo(wd*.78,-ht*.55,wd*.62,-.02,0,0);g.closePath();
    g.fillStyle=fgrad(g,0,0,0,-ht*1.1,[[0,c1],[.55,c2],[1,c3]]);g.fill();
    g.fillStyle=fgrad(g,-wd*.7,0,wd*.7,0,[[0,'rgba(90,10,40,.25)'],[.35,'rgba(90,10,40,0)'],[.65,'rgba(90,10,40,0)'],[1,'rgba(90,10,40,.2)']]);g.fill();
    g.globalAlpha=.25;for(let k=-2;k<=2;k++)ln(g,k*wd*.08,-.05,k*wd*.14,-ht*.9,D,.02);g.globalAlpha=1;
    g.globalAlpha=.55;ln(g,-wd*.05,-ht*.25,-wd*.02,-ht*.9,'#FFFFFF',.05);g.globalAlpha=1;g.restore()};
  petal(0,0,.86,1.5,D,A,B);                     // 뒤 꽃잎
  petal(-.2,-.12,.72,1.4,A,B,L);petal(.22,.13,.72,1.38,A,B,L); // 양쪽
  petal(0,0,.66,1.26,A,B,L);                    // 앞 꽃잎
  fEl(g,0,.36,.2,.1,wmix('#5E8C47',w,'#8E7F58'));
  if(w>.45){g.globalAlpha=Math.min(.7,(w-.45)*2);fEl(g,-.35,-.6,.1,.06,'#7A5A40');fEl(g,.33,-.62,.1,.06,'#7A5A40');g.globalAlpha=1}
  g.restore();
}
/* 프리지아: 휘어진 꽃대에 나팔꽃 모양 송이들(아래는 활짝, 끝은 봉오리) */
function freesiaArt(g,s,w){
  const Y1=wmix('#F6C93F',w),Y2=wmix('#FFE68A',w,'#E6D8C6'),O=wmix('#E8952C',w,'#9E7A50'),GR=wmix('#7FA85A',w,'#9E8E62');
  g.save();g.scale(s,s);
  g.strokeStyle=GR;g.lineWidth=.1;g.lineCap='round';g.beginPath();g.moveTo(-.55,.45);g.quadraticCurveTo(.35,.35,.95,-.7);g.stroke();
  const bud=(x,y,r,a)=>{g.save();g.translate(x,y);g.rotate(a);fEl(g,0,0,r*.45,r,fgrad(g,0,-r,0,r,[[0,wmix('#D8E08A',w)],[1,Y1]]));g.restore()};
  bud(1.02,-.86,.16,.5);bud(.86,-.58,.2,.8);
  const bloom=(x,y,r,a)=>{g.save();g.translate(x,y);g.rotate(a);
    for(let k=0;k<6;k++){g.save();g.rotate(k*Math.PI/3+.25);g.beginPath();g.ellipse(0,-r*.55,r*.4,r*.58,0,0,Math.PI*2);g.fillStyle=fgrad(g,0,0,0,-r*1.1,[[0,Y1],[1,k%2?Y2:Y1]]);g.fill();g.restore()}
    fEl(g,0,0,r*.34,r*.34,frad(g,0,0,r*.34,[[0,O],[1,Y1]]));for(let k=0;k<3;k++){const a2=k*2.1+.4;ln(g,0,0,Math.cos(a2)*r*.28,Math.sin(a2)*r*.28,wmix('#C0701E',w),.03)}
    fEl(g,-r*.15,-r*.2,r*.08,r*.06,'rgba(255,255,255,.8)');g.restore()};
  bloom(.52,-.22,.42,.3);bloom(.08,.12,.52,0);bloom(-.36,.3,.46,-.3);
  g.restore();
}
/* 수국: 작은 네 잎 꽃 수십 개가 모인 둥근 송이(아래쪽 그늘) */
function hydrangeaArt(g,s,w,seed){
  const cs=[wmix('#8FAEE6',w),wmix('#A9C1F0',w),wmix('#B8A6E3',w),wmix('#C9D8F6',w),wmix('#9DB6EE',w)];
  g.save();g.scale(s,s);
  fEl(g,0,0,.98,.9,frad(g,-.2,-.25,1.1,[[0,wmix('#A9C1F0',w)],[.7,wmix('#7C97CC',w)],[1,wmix('#5E78B0',w,'#7E6A58')]]));
  const r=seedRand(seed||7);const pts=[];for(let k=0;k<30;k++){const an=r()*6.283,rd=Math.sqrt(r())*.82;pts.push([Math.cos(an)*rd,Math.sin(an)*rd*.9,r()])}
  pts.sort((a,b)=>a[1]-b[1]).forEach(([px,py,q],k)=>{const fs=.17+q*.04,col=cs[k%5],shade=py>.35?.18:0;
    g.save();g.translate(px,py);g.rotate(q*1.6);
    for(let j=0;j<4;j++){g.save();g.rotate(j*Math.PI/2);g.beginPath();g.ellipse(0,-fs*.62,fs*.5,fs*.62,0,0,Math.PI*2);g.fillStyle=col;g.fill();g.restore()}
    if(shade){fEl(g,0,0,fs*1.05,fs*1.05,'rgba(40,40,90,'+shade+')')}
    fEl(g,0,0,fs*.16,fs*.16,wmix('#F4F0FF',w));fEl(g,-fs*.35,-fs*.45,fs*.12,fs*.08,'rgba(255,255,255,.55)');g.restore()});
  g.restore();
}
/* 안개꽃: 가는 가지 끝에 아주 작은 흰 꽃이 구름처럼 */
function gypArt(g,s,w,seed){
  g.save();g.scale(s,s);const r=seedRand(seed||13);const st=wmix('#8DAF7A',w,'#A8977A');
  const tips=[];for(let k=0;k<16;k++){tips.push([(r()-.5)*1.7,(r()-.5)*1.2-.1])}
  g.strokeStyle=st;g.lineWidth=.035;g.lineCap='round';
  for(const [x,y] of tips){g.beginPath();g.moveTo(0,.75);g.quadraticCurveTo(x*.3,.2,x,y);g.stroke()}
  for(const [x,y] of tips){for(let j=0;j<3;j++){const fx=x+(r()-.5)*.22,fy=y+(r()-.5)*.18,fr=.075+r()*.03;
    for(let p=0;p<5;p++){const a=p*1.2566;fEl(g,fx+Math.cos(a)*fr*.55,fy+Math.sin(a)*fr*.55,fr*.52,fr*.52,wmix('#FFFFFF',w,'#D9CDB6'))}
    fEl(g,fx,fy,fr*.28,fr*.28,wmix('#F1EBC6',w,'#C9B88E'))}}
  g.restore();
}
/* 해바라기: 노란 꽃잎 두 겹 + 갈색 씨앗 가운데 */
function sunflowerArt(g,s,w,seed){
  const Y=wmix('#F6C21F',w),Y2=wmix('#FBD958',w,'#E6D8C6'),O=wmix('#E8A21C',w),C=wmix('#6A3F1E',w,'#5E4A3A'),C2=wmix('#8A5A2C',w,'#6E5A48');
  g.save();g.scale(s,s);
  for(let layer=0;layer<2;layer++){const n=14,R=layer?.78:.9;for(let k=0;k<n;k++){const a=k*Math.PI*2/n+(layer?Math.PI/n:0);g.save();g.rotate(a);g.beginPath();g.ellipse(0,-R*.62,.15,R*.42,0,0,Math.PI*2);g.fillStyle=layer?Y2:(k%2?Y:O);g.fill();g.restore()}}
  fEl(g,0,0,.42,.42,frad(g,-.1,-.1,.45,[[0,C2],[1,C]]));const r=seedRand(seed||5);for(let k=0;k<16;k++){const a=r()*6.283,d=Math.sqrt(r())*.34;fEl(g,Math.cos(a)*d,Math.sin(a)*d,.035,.035,wmix('#3E2410',w))}
  fEl(g,-.13,-.15,.08,.05,'rgba(255,230,160,.35)');g.restore();
}
/* 라넌큘러스: 얇은 꽃잎이 겹겹이 둥글게(공 모양) */
function ranunculusArt(g,s,w){
  const A=wmix('#E8735E',w),B=wmix('#F29A86',w),L=wmix('#FCD2C4',w,'#E6D8C6'),D=wmix('#C2533F',w,'#7E6454');
  g.save();g.scale(s,s);fEl(g,0,.05,.92,.84,frad(g,0,.2,1,[[0,B],[.75,A],[1,D]]));
  for(let k=0;k<5;k++){const r=.8-k*.15;g.beginPath();g.ellipse(0,.04-k*.03,r,r*.86,0,Math.PI*.05,Math.PI*.95);g.strokeStyle=k%2?L:wmix('#FFE4DA',w,'#E6D8C6');g.lineWidth=.05;g.globalAlpha=.85;g.stroke();g.globalAlpha=1}
  for(let k=0;k<4;k++){const r=.62-k*.13;g.beginPath();g.ellipse(0,-.05-k*.02,r,r*.7,0,Math.PI*1.05,Math.PI*1.95);g.strokeStyle=D;g.lineWidth=.035;g.globalAlpha=.55;g.stroke();g.globalAlpha=1}
  fEl(g,0,-.08,.13,.11,wmix('#8DAF5E',w,'#9E8E62'));fEl(g,-.3,-.35,.14,.08,'rgba(255,255,255,.45)');g.restore();
}
/* 작약: 크고 풍성한 분홍 꽃잎(가장자리 물결) */
function peonyArt(g,s,w,seed){
  const A=wmix('#E989A8',w),B=wmix('#F4B3C7',w),L=wmix('#FCE0E8',w,'#E6D8C6'),D=wmix('#C9668A',w,'#7E6454');
  g.save();g.scale(s,s);const r=seedRand(seed||9);
  for(let k=0;k<9;k++){const a=k*Math.PI*2/9+r()*.2;g.save();g.rotate(a);g.beginPath();g.ellipse(0,-.55,.42,.5,0,0,Math.PI*2);g.fillStyle=fgrad(g,0,0,0,-1.05,[[0,D],[.5,A],[1,B]]);g.fill();g.restore()}
  for(let k=0;k<7;k++){const a=k*Math.PI*2/7+.3;g.save();g.rotate(a);g.beginPath();g.ellipse(0,-.32,.34,.38,0,0,Math.PI*2);g.fillStyle=fgrad(g,0,0,0,-.7,[[0,A],[1,L]]);g.fill();g.restore()}
  for(let k=0;k<5;k++){const a=k*1.2566;fEl(g,Math.cos(a)*.12,Math.sin(a)*.1-.04,.2,.17,k%2?L:B)}
  fEl(g,0,-.05,.12,.1,wmix('#F7D46A',w,'#C9B88E'));fEl(g,-.35,-.45,.16,.09,'rgba(255,255,255,.4)');g.restore();
}
function flowerArt(g,t,x,y,s,w,seed){g.save();g.translate(x,y);
  if(t==='sunflower')sunflowerArt(g,s,w,seed);else if(t==='ranunculus')ranunculusArt(g,s,w);else if(t==='peony')peonyArt(g,s,w,seed);else
  if(t==='rose')roseArt(g,s,w);else if(t==='tulip')tulipArt(g,s,w);else if(t==='freesia')freesiaArt(g,s,w);else if(t==='hydrangea')hydrangeaArt(g,s,w,seed);else gypArt(g,s,w,seed);
  g.restore()}
/* 창(HTML) 미리보기용: 같은 그림을 작은 이미지로 구워 두고 재사용 */
const FART_CACHE=new Map();
function flowerURL(t,w,seed){const wb=Math.round(w*6)/6,key=t+'|'+wb+'|'+(seed||0);let u=FART_CACHE.get(key);if(u)return u;
  const cv=document.createElement('canvas');cv.width=cv.height=112;const g=cv.getContext('2d');
  flowerArt(g,t,56,t==='freesia'?60:56,t==='hydrangea'?46:t==='gyp'?50:44,wb,seed);
  u=artURL(cv);FART_CACHE.set(key,u);return u}

const FART_K={rose:.6,tulip:.66,freesia:.62,hydrangea:1.05,gyp:.8,sunflower:.72,ranunculus:.62,peony:.8};
function flowerHead(g,t,x,y,s,f,dried){
  const w=dried?.62:wither(f);
  if(w>.25&&!dried){y+=w*s*.55;x+=(x%2?1:-1)*w*s*.3}
  if(s<1.6){ // 아주 작을 때는 가벼운 그림(점 몇 개)으로 — 굽는 시간 절약
    const c={rose:'#B81A35',tulip:'#EE7FA0',freesia:'#F6C93F',hydrangea:'#9DB6EE',gyp:'#FFFFFF',sunflower:'#F6C21F',ranunculus:'#F29A86',peony:'#F4B3C7'}[t]||'#fff';el(g,x,y,s*.5,s*.45,wmix(c,w));return}
  flowerArt(g,t,x,y,s*(FART_K[t]||.6),w,Math.round(x*7+y*3)&1023);
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
    if(it.wrapped){const sh=it.shape||'cone',P=PAPERS[it.paper]||PAPERS.pink;
      if(sh==='hatbox'){el(g,x,y-7,6.6,1.8,mix(P.c,P.d,.45));rr(g,x-6.6,y-7,13.2,8.5,3,P.c);el(g,x,y-7,6.8,1.3,P.d);el(g,x+5,y-10,4,1.4,mix(P.c,P.d,.3),-.5)}
      else if(sh==='bag'){g.strokeStyle=P.d;g.lineWidth=.6;g.beginPath();g.arc(x-2.5,y-7,2,Math.PI,0);g.arc(x+2.5,y-7,2,Math.PI,0);g.stroke();poly(g,[x-6.5,y-7,x+6.5,y-7,x+6,y+1.5,x-6,y+1.5],P.c);ln(g,x-6.5,y-6.5,x+6.5,y-6.5,P.l,.8)}
      else if(sh==='rattan'||sh==='white'||sh==='tin'){const c=sh==='rattan'?'#C99A63':sh==='tin'?'#C9D1D7':'#F6F3EC',d=sh==='rattan'?'#A87A48':sh==='tin'?'#8F9BA5':'#CFC7B8';g.strokeStyle=d;g.lineWidth=.9;g.beginPath();g.arc(x,y-7,6.4,Math.PI,0);g.stroke();poly(g,[x-7.5,y-7,x+7.5,y-7,x+5.5,y+1.5,x-5.5,y+1.5],c);ln(g,x-6.5,y-4.5,x+6.5,y-4.5,d,.45);ln(g,x-6,y-2,x+6,y-2,d,.45);ln(g,x-7.5,y-7,x+7.5,y-7,d,.9)}
      else if(sh==='box'){el(g,x,y-7,6.6,1.8,mix(P.c,P.d,.45));rr(g,x-6.6,y-7,13.2,8.5,1.6,P.c);el(g,x,y-7,6.6,1.4,P.l)}
      else if(sh==='round'){el(g,x,y-9,8.5,6,P.l);poly(g,[x-6,y-7,x+6,y-7,x+1.5,y+1,x-1.5,y+1],P.c)}
      else if(sh==='cross'){poly(g,[x-8,y-11,x+5,y-9,x+1,y+1],P.l);poly(g,[x-8,y-7,x+7,y-4,x+1,y+1,x-1,y+1],P.c)}
      else{poly(g,[x-7,y-9,x+7,y-9,x,y+1],P.c);poly(g,[x-7,y-9,x-2,y-8,x,y+1],P.l)}}
    else{for(let k=0;k<5;k++)ln(g,x,y,x-3+k*1.5,y-8,CO.leafD,.5);ln(g,x-2,y-3,x+2,y-3,CO.twine,.9)}
    st.slice(0,9).forEach((s,k)=>{const a=k*2.4,r=k?2+ (k%3):0;flowerHead(g,s.t,x+Math.cos(a)*r*1.1,y-10+Math.sin(a)*r*.6,3,s.f)});
    if(it.wrapped){const R=RIBBONS[it.ribbon]||RIBBONS.pink,bw=it.bow||'classic';if(bw==='rosette'){el(g,x,y-3,2.2,2.2,R.c);el(g,x,y-3,1,1,R.d)}else if(bw==='knot'||bw==='twine'){ln(g,x-3,y-3,x+3,y-3,R.c,1.2);el(g,x,y-3,.9,.9,R.d)}else{const k=bw==='big'||bw==='loops'?1.35:1;el(g,x-2*k,y-3.2,2.2*k,1.3*k,R.c,-.3);el(g,x+2*k,y-3.2,2.2*k,1.3*k,R.c,.3);el(g,x,y-3,.9,.9,R.d);if(bw==='tails'){ln(g,x,y-3,x-1.5,y+2,R.c,.7);ln(g,x,y-3,x+1.5,y+2,R.c,.7)}}}
  }
}

/* characters */
const EYE='#2A2230';
/* =========================================================
   사람 그리기 v2 — 16방향 그대로, 디테일 강화
   · 머리카락: 위→아래 그라데이션 + 윤기 띠 + 결
   · 얼굴: 은은한 입체감, 홍채·눈동자·하이라이트 2개, 속눈썹(여자), 쌍꺼풀(p.dbl)
   · 옷: 좌우 음영, 목선, 밑단, 신발 밑창·광택
   · 메인 주민용 옷차림: p.coat(trench/cardigan/uniform), p.scarf, p.skirt, p.bag(satchel), p.prop(sketch/basket/letters),
     p.hat(beret/mailcap/kidhat + p.hatC), p.lines(웃음 주름), p.perm(펌 머리)
   ========================================================= */
/* 안경 종류: 테 색·렌즈·동그란 테 여부 */
const GLS={horn:{},gold:{round:1,f:'#C9A24A'},sun:{lens:'rgba(46,40,54,.88)'},red:{f:'#B8434E'},clear:{f:'#CDBFAF'},tort:{f:'#8A5A36'},rose:{round:1,f:'#C98E8E',lens:'rgba(226,140,160,.5)'},silver:{round:1,f:'#A9B2BA'}};
function glsSpec(gl,p){const q=GLS[gl]||(p&&p.glassesGold?GLS.gold:GLS.horn);return {round:!!q.round,f:q.f||CO.ink,lens:q.lens||'rgba(220,236,246,.2)',lw:q.round?1.3:2.2}}
function hairStyleOf(p){return p.hs||(p.style==='f'?'long':'short')}
function hairGrad(g,p){const q=g.createLinearGradient(0,-134,0,-60);q.addColorStop(0,p.hairHi);q.addColorStop(.32,p.hair);q.addColorStop(1,mix(p.hair,'#000000',.28));return q}
function skinGrad(g,p){const q=g.createLinearGradient(0,-126,0,-74);q.addColorStop(0,mix(p.skin,'#FFFFFF',.18));q.addColorStop(.55,p.skin);q.addColorStop(1,mix(p.skin,p.skinSh,.55));return q}
function clothGrad(g,col,x0,x1){const q=g.createLinearGradient(x0,0,x1,0);const d=mix(col,'#1E1622',.16),l=mix(col,'#FFFFFF',.1);q.addColorStop(0,d);q.addColorStop(.3,l);q.addColorStop(.7,col);q.addColorStop(1,d);return q}
function hairShine(g,hx,y,w,col){g.save();g.globalAlpha=.55;g.strokeStyle=col;g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.arc(hx-2,y+26,w,Math.PI*1.22,Math.PI*1.5);g.stroke();g.lineWidth=1.4;g.beginPath();g.arc(hx+2,y+26,w,Math.PI*1.56,Math.PI*1.68);g.stroke();g.restore()}
/* =========================================================
   머리 스타일 v2 (주인공 둘): 정수리 볼륨 + 가르마에서 흘러내리는 머리칼 덩어리
   · 옆머리는 얼굴선을 따라 가늘어지며 끝이 안쪽으로 모여요(뻣뻣한 구레나룻 X)
   · 정면(hair2Behind→몸 뒤, hair2Front→얼굴 위) / 옆모습(hair2SideBehind, hair2Side) / 뒷모습(hair2Rear)
   · 그림 수는 그대로라 메모리는 늘지 않고, 처음 그릴 때만 조금 더 걸려요
   ========================================================= */
const H2LEN={nape:-84,bob:-72,shoulder:-62,long:-44,xlong:-32,xxlong:-14};
const H2SD={wisp:-84,ear:-92,under:-95,cheek:-82,chin:-74,chest:-54,bobin:-74,hime:-80};
function h2HW(p){return p.style==='f'?22:25}
/* 아래 끝 모양(결): x0→x1, y 기준선 */
function h2Edge(g,tex,x0,x1,y,dir){const n=Math.max(3,Math.round(Math.abs(x1-x0)/7)),dx=(x1-x0)/n;
  for(let k=1;k<=n;k++){const xa=x0+dx*(k-.5),xb=x0+dx*k;
    if(tex==='wave'||tex==='cc')g.quadraticCurveTo(xa,y+(k%2?5:-1),xb,y+(k%2?1:2));
    else if(tex==='curl')g.quadraticCurveTo(xa,y+7,xb,y);
    else if(tex==='layer'||tex==='spiky')g.lineTo(xa,y+(k%2?7:2)),g.lineTo(xb,y-1);
    else g.lineTo(xa,y+3),g.lineTo(xb,y+.5)}}
/* 얼굴 옆 머리칼 한 줄기: 관자놀이(x,y0)에서 yE까지, s=-1 왼쪽/1 오른쪽, w=굵기 */
function h2Lock(g,x,y0,yE,s,w,tex,col){const mid=(y0+yE)/2,cv=tex==='wave'||tex==='curl'?2.4:.8;
  /* 바깥선은 살짝 볼록, 끝은 얼굴 쪽으로 모이고, 안쪽선은 얼굴선을 따라가요 */
  g.beginPath();g.moveTo(x+s*1,y0);g.bezierCurveTo(x+s*(2.5+cv),mid-4,x+s*(1.5-cv),mid+5,x-s*(w*.3),yE);
  g.bezierCurveTo(x-s*(w*.55),yE-5,x-s*(w*.75-cv*.5),mid,x-s*w,y0+3);g.closePath();g.fillStyle=col;g.fill()}
function h2Braid(g,x0,y0,x1,y1,H,D,tie){const n=7;for(let k=0;k<n;k++){const t=k/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t,w=6-t*1.6;el(g,x+(k%2?1.2:-1.2),y,w,4.2,H);ln(g,x-w*.6,y-1,x+w*.6,y+1.5,D,.7)}
  el(g,x1,y1+4,2.6,2,tie);for(let k=0;k<3;k++)ln(g,x1,y1+5,x1-2+k*2,y1+11,H,1.6)}
/* 물결치는 긴 꽁지(웨이브 포니테일): (x,y)에서 아래로 len, 굵기 w, 아래로 갈수록 dx만큼 옆으로 */
function h2WTail(g,x,y,len,w,dx,H,D){const n=12,P=[],Q=[];
  const C=t=>[x+dx*t*t+Math.sin(t*Math.PI*2.5)*2.6*t,y+len*t],HW=t=>w*(.62+.42*Math.sin(Math.min(1,t*1.15)*Math.PI*.85))*(1-.62*t);
  for(let k=0;k<=n;k++){const t=k/n,[cx,cy]=C(t),hw=HW(t);P.push([cx-hw,cy]);Q.push([cx+hw,cy])}
  const smooth=(A)=>{for(let k=1;k<A.length-1;k++){const mx=(A[k][0]+A[k+1][0])/2,my=(A[k][1]+A[k+1][1])/2;g.quadraticCurveTo(A[k][0],A[k][1],mx,my)}g.lineTo(A[A.length-1][0],A[A.length-1][1])};
  g.beginPath();g.moveTo(P[0][0],P[0][1]);smooth(P);const e=C(1);g.quadraticCurveTo(e[0],e[1]+6,Q[n][0],Q[n][1]);smooth(Q.slice().reverse());g.closePath();g.fillStyle=H;g.fill();
  g.save();g.globalAlpha=.3;g.strokeStyle='#FFFFFF';g.lineWidth=1.4;g.beginPath();for(let k=1;k<n;k++){const t=k/n,[cx,cy]=C(t);const xx=cx-.2*HW(t)+Math.sin(t*Math.PI*2.5)*1.2;k>1?g.lineTo(xx,cy):g.moveTo(xx,cy)}g.stroke();g.restore();
  g.save();g.globalAlpha=.25;g.strokeStyle=D;g.lineWidth=.9;for(const f of [-.4,.05,.45]){g.beginPath();for(let k=0;k<=n;k++){const t=k/n,[cx,cy]=C(t);const xx=cx+f*HW(t);k?g.lineTo(xx,cy):g.moveTo(xx,cy+3)}g.stroke()}g.restore()}
/* 물결 결: 머리 덩어리 안에 S자로 굽이치는 머리칼 줄(어두운 줄 + 밝은 윤기 줄) */
function h2WaveLines(g,cx,yt,yb,wt,wb,D,Lc,amp){const per=13,A=amp||3.2,wAt=y=>wt+(wb-wt)*Math.min(1,(y-yt)/Math.max(1,yb-yt)*1.6);
  const strand=(f,ph)=>{g.beginPath();let y=yt+4,k=0;g.moveTo(cx+f*wAt(y),y);while(y<yb-4){const y2=Math.min(yb-3,y+per),ym=(y+y2)/2;g.quadraticCurveTo(cx+f*wAt(ym)+A*((k+ph)%2?1:-1),ym,cx+f*wAt(y2),y2);y=y2;k++}g.stroke()};
  g.save();g.lineCap='round';g.globalAlpha=.3;g.strokeStyle=D;g.lineWidth=1.1;for(const f of [-.82,-.5,-.18,.16,.48,.8])strand(f,0);
  if(Lc){g.globalAlpha=.38;g.strokeStyle=Lc;g.lineWidth=1.6;for(const f of [-.66,-.04,.62])strand(f,1)}g.restore()}
/* 물결치는 옆머리 한 줄기(앞모습) */
function h2WLock(g,x,y0,yE,s,w,col,D){const n=8,P=[],Q=[];for(let k=0;k<=n;k++){const t=k/n,cx=x-s*w*.25*t+Math.sin(t*Math.PI*2.5)*2.2*t,cy=y0+(yE-y0)*t,hw=w*.5*(1-.55*t);P.push([cx-hw,cy]);Q.push([cx+hw,cy])}
  const sm=A=>{for(let k=1;k<A.length-1;k++)g.quadraticCurveTo(A[k][0],A[k][1],(A[k][0]+A[k+1][0])/2,(A[k][1]+A[k+1][1])/2);g.lineTo(A[A.length-1][0],A[A.length-1][1])};
  g.beginPath();g.moveTo(P[0][0],P[0][1]);sm(P);g.quadraticCurveTo(P[n][0]+w*.25,yE+3,Q[n][0],Q[n][1]);sm(Q.slice().reverse());g.closePath();g.fillStyle=col;g.fill();
  g.save();g.globalAlpha=.3;g.strokeStyle=D;g.lineWidth=.9;g.beginPath();for(let k=0;k<=n;k++){const t=k/n,cx=x-s*w*.25*t+Math.sin(t*Math.PI*2.5)*2.2*t,cy=y0+(yE-y0)*t;k?g.lineTo(cx,cy):g.moveTo(cx,cy+2)}g.stroke();g.restore()}
/* 풍성한 물결 머리 덩어리: 가운데 cx, 위 yt(폭 wt) → 아래 yb(폭 wb). 바깥선이 부드럽게 물결쳐요. one=한쪽(옆모습) */
function h2Mass(g,cx,yt,yb,wt,wb,H,D,one,Lc){const n=5,L=one?cx-wb:cx-wb,R=one?cx+wt*.6:cx+wb;
  const sideX=(k,s)=>{const t=k/n;return cx+s*(wt+(wb-wt)*Math.min(1,t*1.6))};
  g.beginPath();g.moveTo(one?cx+wt*.6:cx-wt,yt);
  if(!one){for(let k=1;k<=n;k++){const ya=yt+(yb-yt)*(k-.5)/n,y=yt+(yb-yt)*k/n;g.quadraticCurveTo(sideX(k-.5,-1)-(k%2?5:-1),ya,sideX(k,-1),y)}}
  else{g.quadraticCurveTo(cx-wt*1.2,yt-2,cx-wt,yt+8);for(let k=1;k<=n;k++){const ya=yt+8+(yb-yt-8)*(k-.5)/n,y=yt+8+(yb-yt-8)*k/n;g.quadraticCurveTo(sideX(k-.5,-1)-(k%2?5:-1),ya,sideX(k,-1),y)}}
  h2Edge(g,'wave',one?cx-wb:cx-wb,R,yb);
  if(!one){for(let k=n-1;k>=0;k--){const ya=yt+(yb-yt)*(k+.5)/n,y=yt+(yb-yt)*k/n;g.quadraticCurveTo(sideX(k+.5,1)+((k+1)%2?5:-1),ya,sideX(k,1),y)}}
  else g.bezierCurveTo(cx+wt*.8,yb-20,cx+wt*.4,yt+30,cx+wt*.6,yt);
  g.closePath();g.fillStyle=H;g.fill();
  h2WaveLines(g,cx,yt,yb,wt*.95,wb*.92,D,Lc)}
/* 몸 뒤(정면): 뒷머리·포니테일·반묶음 */
function hair2Behind(g,p,H,hx,t,bob){const m=p.h2,W=h2HW(p),o=hx,yb=H2LEN[m.len]||-84,D=mix(p.hair,'#000',.3);
  if(m.x==='wpony')h2WTail(g,o+W,-118-bob,68,10,8,H,D);
  if(m.x==='pony'){g.beginPath();g.moveTo(o+8,-124-bob);g.bezierCurveTo(o+W+16,-118-bob,o+W+12,-92-bob,o+W+8,-66-bob);g.bezierCurveTo(o+W+2,-80-bob,o+W+2,-104-bob,o+2,-116-bob);g.closePath();g.fillStyle=H;g.fill()}
  if(m.x==='halfbun')el(g,o,-126-bob,7,6,H);
  if(yb>-80){const wb=W+(yb>-50?7:5)+(m.big?5:0);if(m.big||m.tex==='wave'||m.tex==='cc'){h2Mass(g,o,-108-bob,yb-bob,W+3,wb+2,H,D,false,mix(p.hair,'#FFFFFF',.5));}else{g.beginPath();g.moveTo(o-W-3,-106-bob);g.bezierCurveTo(o-W-6,-90-bob,o-wb,yb-10-bob,o-wb,yb-bob);h2Edge(g,m.tex,o-wb,o+wb,yb-bob);g.bezierCurveTo(o+wb,yb-10-bob,o+W+6,-90-bob,o+W+3,-106-bob);g.closePath();g.fillStyle=H;g.fill();
    g.save();g.globalAlpha=.16;for(let k=-3;k<=3;k++)ln(g,o+k*6,-100-bob,o+k*6.8,yb+4-bob,'#000',1);g.restore()}}}
/* 얼굴 위(정면, hx 기준): 정수리·앞머리·옆머리·묶음 */
function hair2Front(g,p,H,HL,hx,t,f){const m=p.h2,W=h2HW(p),o=t*5,D=mix(p.hair,'#000',.32),L=mix(p.hair,'#FFFFFF',.18),v=m.vol||0;
  g.save();g.translate(hx,0);
  const yS=H2SD[m.sd]||-90;
  /* 옆머리(얼굴 양옆) — 앞머리보다 먼저(위에 정수리가 덮어요) */
  const male=p.style!=='f',burn=(xo,xi,yE,col)=>{for(const s of [-1,1]){const X=v=>s*v+o*.6;g.beginPath();g.moveTo(X(xo),-109);g.quadraticCurveTo(X(xo+.6),(yE-109)/2,X(xo-.8),yE+1.5);g.quadraticCurveTo(X((xo+xi)/2+.5),yE+1.5,X(xi+.6),yE-2);g.quadraticCurveTo(X(xi-.4),(yE-109)/2,X(xi-1.5),-109);g.closePath();g.fillStyle=col;g.fill()}};
  /* 남자 구레나룻: 얼굴 옆선을 따라 일자로 떨어져요. 짧으면 귀가 보이고, 길면(볼 옆머리) 귀를 덮어요 */
  const burn2=(xo,xi,yE,col)=>{for(const s of [-1,1]){const X=v=>s*v+o*.6;g.beginPath();g.moveTo(X(xo),-112);g.lineTo(X(xo),yE+.5);g.quadraticCurveTo(X((xo+xi)/2),yE+1.2,X(xi),yE-1.2);g.lineTo(X(xi),-112);g.closePath();g.fillStyle=col;g.fill()}};
  if(male&&m.sd==='ear')burn2(24.4,20.6,-96.5,H);
  else if(male&&m.sd==='under')burn2(24.2,21,-99,mix(p.hair,p.skin,.3));
  else if(male&&(m.sd==='cheek'))for(const s of [-1,1]){const X=v=>s*v+o*.6;g.beginPath();g.moveTo(X(26.5),-112);g.quadraticCurveTo(X(27.6),-97,X(25.2),-88.5);g.quadraticCurveTo(X(22.6),-86.2,X(20.2),-89.5);g.lineTo(X(20.2),-112);g.closePath();g.fillStyle=H;g.fill()}
  else if(m.sd==='under'){const c=mix(p.hair,p.skin,.5);for(const s of [-1,1])rr(g,s<0?-W-2:W-4,-102,6,12,3,c)}
  else if(m.sd==='hime'){for(const s of [-1,1]){g.beginPath();g.moveTo(s*(W+2)+o,-104);g.lineTo(s*(W+2)+o,-80);g.lineTo(s*(W-6)+o,-80);g.lineTo(s*(W-5)+o,-102);g.closePath();g.fillStyle=H;g.fill()}}
  else if(m.sd==='bobin'){for(const s of [-1,1]){g.beginPath();g.moveTo(s*(W+3)+o,-106);g.bezierCurveTo(s*(W+7)+o,-90,s*(W+5)+o,-76,s*(W-3)+o,-72);g.quadraticCurveTo(s*(W-7)+o,-78,s*(W-4)+o,-100);g.closePath();g.fillStyle=H;g.fill()}}
  else if(yS<-91){}
  else if(m.sd==='wisp')for(const s of [-1,1])h2Lock(g,s*(W-1)+o*.6,-104,yS,s,4.5,m.tex,H);
  else if((m.tex==='wave'||m.tex==='cc')&&yS>-80)for(const s of [-1,1]){h2WLock(g,s*(W-2)+o*.6,-106,yS,s,10,H,D);if(yS>-70)h2WLock(g,s*(W-6)+o*.6,-104,yS+6,s,6,mix(p.hair,'#000',.06),D)}
  else for(const s of [-1,1]){h2Lock(g,s*(W+1)+o*.6,-106,yS,s,9,m.tex,H);if(yS>-70)h2Lock(g,s*(W-3)+o*.6,-104,yS+8,s,6,m.tex,mix(p.hair,'#000',.06))}
  /* 정수리 + 앞머리선 */
  const ms=male&&!(m.sd==='cheek'||m.sd==='chin'),yC=ms?-98:-92,cw=ms?W+.8:W+3,ck=ms?W+3:W+6,fr=m.fr;
  g.beginPath();g.moveTo(-cw,yC);g.bezierCurveTo(-ck,-131-v,ck,-131-v,cw,yC);
  /* 남자 앞머리: 머리칼 끝(tip)을 이어 자연스럽게 */
  const tips=(T,gap)=>{for(let k=0;k<T.length;k++){const [x,y]=T[k];if(!k){g.lineTo(x+o*.6,y);continue}const [px,py]=T[k-1];g.quadraticCurveTo((px+x)/2+o*.6+1,Math.min(py,y)-(gap||5),x+o*.6,y)}};
  if(male&&fr==='full'){g.lineTo(W+1,-102);tips([[W-1,-102],[17,-100.5],[9,-99.5],[1,-99.5],[-7,-99.8],[-15,-100.5],[-W+2,-102]],5.5);g.lineTo(-W-1,-102)}
  else if(male&&fr==='comma'){const q=o*.6;g.lineTo(W,-101);g.quadraticCurveTo(W-3+q,-110,10+q,-113);g.bezierCurveTo(5+q,-109,0+q,-106,-5+q,-104.6);g.quadraticCurveTo(-11+q,-104.5,-14.5+q,-103.5);g.quadraticCurveTo(-17.5+q,-102,-16+q,-98.6);g.quadraticCurveTo(-14+q,-96.4,-11.2+q,-98);g.quadraticCurveTo(-12.6+q,-99.2,-12.3+q,-100.8);g.quadraticCurveTo(-16+q,-104.5,-20+q,-103.5);g.quadraticCurveTo(-22.5+q,-103,-W+1,-101);g.lineTo(-W-1,-100)}
  else if(male&&fr==='part8'){g.lineTo(W+1,-102);g.quadraticCurveTo(W-3+o*.6,-109,10+o*.6,-113);g.bezierCurveTo(-3+o*.6,-112,-13+o*.6,-108,-18+o*.6,-101);g.quadraticCurveTo(-21+o*.6,-98,-W+1,-101);g.lineTo(-W-1,-102)}
  else if(male&&fr==='split'){g.lineTo(W+1,-101);g.bezierCurveTo(W-4+o*.6,-104,9+o*.6,-106,2+o*.6,-113);g.lineTo(-1+o*.6,-113);g.bezierCurveTo(-8+o*.6,-106,-W+4+o*.6,-104,-W-1,-101)}
  else if(male&&fr==='side'){g.lineTo(W+1,-102);g.quadraticCurveTo(W-3+o*.6,-110,12+o*.6,-112);tips([[12,-112],[5,-106],[-3,-104],[-11,-103],[-18,-103],[-W+1,-102]],4.5);g.lineTo(-W-1,-102)}
  else if(male&&fr==='crop'){g.lineTo(W+1,-103);tips([[W-1,-104],[17,-106],[10,-105.5],[3,-106],[-4,-105.5],[-11,-106],[-18,-105.5],[-W+1,-104]],2.5);g.lineTo(-W-1,-103)}
  else if(fr==='none'){g.lineTo(W-2,-100);g.quadraticCurveTo(o,-121,-W+2,-100)}
  else if(fr==='crop'){g.lineTo(W-3,-104);for(let k=0;k<=8;k++){const x=W-3-k*(2*W-6)/8;g.lineTo(x+o*.5,k%2?-108:-105.5)}}
  else if(fr==='full'){g.lineTo(W-1,-97);const n=7;for(let k=0;k<=n;k++){const x=W-3-k*(2*W-6)/n;g.lineTo(x+o*.6,k%2?-104.5:-100)}g.lineTo(-W+1,-97)}
  else if(fr==='see'){g.lineTo(W-2,-99);g.quadraticCurveTo(o,-118,-W+2,-99)}
  else if(fr==='side'||fr==='comma'){g.lineTo(W-1,-101);g.quadraticCurveTo(W-6,-114,6+o,-114);g.quadraticCurveTo(-10+o,-110,-W+3,-100);g.lineTo(-W+1,-97)}
  else if(fr==='split'){g.lineTo(W-1,-96);g.quadraticCurveTo(W-8,-108,3+o,-111);g.lineTo(-1+o,-111);g.quadraticCurveTo(-W+8,-108,-W+1,-96)}
  else if(fr==='mush'){g.lineTo(W+1,-93);const n=8;for(let k=0;k<=n;k++){const x=W-1-k*(2*W-2)/n;g.quadraticCurveTo(x+(2*W-2)/n*.5+o*.5,-97-(k%2?0:2.5),x+o*.5,-99.5+Math.abs(k-n/2)*.5)}g.lineTo(-W-1,-93)}
  else if(fr==='curtain'){g.lineTo(W-1,-92);g.bezierCurveTo(W-3,-102,10+o,-104,2+o,-112);g.lineTo(-2+o,-112);g.bezierCurveTo(-10+o,-104,-W+3,-102,-W+1,-92)}
  g.closePath();g.fillStyle=H;g.fill();
  /* 시스루 앞머리: 가는 머리칼 몇 가닥 */
  if(fr==='see'){for(const x of [-13,-6,1,8,14]){const xx=x+o*.6;g.beginPath();g.moveTo(xx-2.5,-115);g.quadraticCurveTo(xx+1,-108,xx+(x<0?-1:1),-100);g.quadraticCurveTo(xx+3,-108,xx+2.5,-115);g.closePath();g.fillStyle=H;g.fill()}}
  if(fr==='mush'){g.beginPath();g.moveTo(1+o*.5,-110);g.quadraticCurveTo(5+o*.5,-102,2+o*.5,-94);g.quadraticCurveTo(7+o*.5,-102,5+o*.5,-110);g.closePath();g.fillStyle=H;g.fill()}
  const hook=(x,y,s,sz,col)=>{const X=v=>x+s*v+o*.6;g.beginPath();g.moveTo(X(-2),y-13*sz);g.bezierCurveTo(X(-9*sz),y-10*sz,X(-12*sz),y-3*sz,X(-8*sz),y+1.5*sz);g.quadraticCurveTo(X(-4*sz),y+3*sz,X(-3*sz),y-1*sz);g.quadraticCurveTo(X(-5.5*sz),y-1.5*sz,X(-5.5*sz),y-4*sz);g.bezierCurveTo(X(-5*sz),y-9*sz,X(-1*sz),y-11*sz,X(3),y-13*sz);g.closePath();g.fillStyle=col;g.fill()};
  if(fr==='comma'&&male){}
  else if(fr==='comma'){g.strokeStyle=H;g.lineWidth=4;g.lineCap='round';g.beginPath();g.arc(-W+8+o*.4,-102,4,-Math.PI*.2,Math.PI*1.05);g.stroke()}
  if(fr==='part8'&&male)hook(-12,-99.5,1,.75,H);
  /* 결: 웨이브·컬·삐침 */
  if(m.tex==='curl'){for(let k=0;k<=14;k++){const a=Math.PI*(1+k/14);el(g,Math.cos(a)*(W+2.5)+o*.5,-101+Math.sin(a)*(20+v),3.9,3.6,H)}for(const s of [-1,1])for(let k=0;k<4;k++)el(g,s*(W+2.5-k*.4)+o*.4,-98+k*5.5,3.4,3.2,H)}
  if(m.tex==='spiky')for(let k=0;k<7;k++){const a=Math.PI*(1.12+k*.127),c=Math.cos(a),sn=Math.sin(a),x=c*(W+1),y=-102+sn*(19+v),nx=-sn,ny=c;poly(g,[x-nx*3,y-ny*3,x+nx*3,y+ny*3,x+c*3.5,y+sn*3.5],H)}
  g.save();g.globalAlpha=.32;g.strokeStyle=D;g.lineWidth=.9;
  const px=(fr==='split'||fr==='curtain')?o:fr==='part8'?10+o:fr==='side'||fr==='comma'?6+o:o;
  const yl=male?-109:-100;for(const [a,b] of [[-15,-20],[-8,-16],[9,16],[15,21]]){g.beginPath();g.moveTo(px+a*.25,-121-v*.5);g.quadraticCurveTo(px+a,-114,b+o*.4,yl);g.stroke()}
  if(m.tex==='wave'||m.tex==='cc'){const pt=fr==='split'||fr==='curtain';for(let k=0;k<5;k++){if(pt&&k===2)continue;g.beginPath();g.arc(-15+k*7.5+o*.5,-121+Math.abs(k-2)*1.6,3,Math.PI*.1,Math.PI*1.1);g.stroke()}}
  g.restore();
  if(fr==='split'||fr==='curtain')ln(g,o,-119-v*.4,o,-112,D,1);if(fr==='part8')ln(g,10+o,-121-v*.4,10+o,-113,D,1);
  /* 묶음(정면) */
  if(m.x==='hipony'){g.beginPath();g.moveTo(o-10,-114-v);g.bezierCurveTo(o-16,-140-v,o+8,-150-v,o+15,-134-v);g.bezierCurveTo(o+18,-126-v,o+12,-118-v,o+9,-114-v);g.closePath();g.fillStyle=p.hair;g.fill();g.save();g.globalAlpha=.3;g.strokeStyle=D;g.lineWidth=.9;g.beginPath();g.moveTo(o-4,-128-v);g.quadraticCurveTo(o,-144-v,o+12,-138-v);g.stroke();g.restore();el(g,o,-121-v,5,2.8,'#E07A7A')}
  if(m.x==='bun'){el(g,o,-129-v,10,9,H);g.strokeStyle=D;g.lineWidth=.9;g.beginPath();g.arc(o,-129-v,5,0,Math.PI*1.5);g.stroke();el(g,o-3,-133-v,3,1.6,L)}
  if(m.x==='buns')for(const s of [-1,1]){el(g,s*14+o,-125,8.5,8,H);g.strokeStyle=D;g.lineWidth=.8;g.beginPath();g.arc(s*14+o,-125,4,0,Math.PI*1.5);g.stroke();el(g,s*14+o,-118,4,1.4,'#E07A7A')}
  if(m.x==='braids')for(const s of [-1,1])h2Braid(g,s*(W+1)+o*.5,-90,s*(W+4)+o*.5,-52,H,D,'#E07A7A');
  if(m.x==='sidepony'){el(g,-W-2+o*.4,-96,4,3.4,'#E07A7A');g.beginPath();g.moveTo(-W-4,-94);g.bezierCurveTo(-W-14,-84,-W-4,-72,-W-10,-58);g.bezierCurveTo(-W-6,-50,-W+2,-56,-W-1,-66);g.bezierCurveTo(-W+3,-76,-W-2,-86,-W+1,-94);g.closePath();g.fillStyle=H;g.fill();
    g.save();g.globalAlpha=.3;g.strokeStyle=D;g.lineWidth=.9;g.beginPath();g.moveTo(-W-4,-90);g.bezierCurveTo(-W-10,-80,-W-2,-70,-W-7,-60);g.stroke();g.restore()}
  if(m.x==='pony'||m.x==='wpony')el(g,W-6+o,-117,4,3,'#E07A7A');
  g.strokeStyle=HL;g.lineWidth=2;g.beginPath();g.moveTo(-10+o*.5,-121-v*.4);g.quadraticCurveTo(-16+o*.5,-116,-19,-108);g.stroke();
  hairShine(g,o*.6,-125-v*.5,14,'#FFFFFF');
  g.restore()}
/* 옆모습(오른쪽을 봄): 몸 뒤에 그리는 긴 머리·포니테일 */
function hair2SideBehind(g,p,H,bob,hs){const m=p.h2,yb=H2LEN[m.len]||-84;
  if(yb>-80&&(m.big||m.tex==='wave'||m.tex==='cc')){h2Mass(g,-11,-112-bob,yb-bob,15,m.big?19:15,H,mix(p.hair,'#000',.3),false,mix(p.hair,'#FFFFFF',.5));return}
  if(yb>-80){g.beginPath();g.moveTo(-6,-116-bob);g.bezierCurveTo(-28-Math.abs(hs),-112-bob,-26,yb-12-bob,-22,yb-bob);h2Edge(g,m.tex,-22,-2,yb-bob);g.bezierCurveTo(-2,yb-20-bob,-4,-96-bob,0,-110-bob);g.closePath();g.fillStyle=H;g.fill()}
  if(m.x==='wpony')h2WTail(g,-20,-120-bob,72,11,-7,H,mix(p.hair,'#000',.3));
  if(m.x==='pony'){g.save();g.translate(-17,-122-bob);g.rotate(.12+Math.max(-.1,Math.min(.1,hs*.02)));g.beginPath();g.moveTo(-3,0);g.bezierCurveTo(-13,10,-9,32,-4,48);g.bezierCurveTo(1,36,6,14,5,0);g.closePath();g.fillStyle=H;g.fill();g.restore()}}
/* 옆모습 머리(얼굴 위) — 원래(21차 이전) 옆모습 모양을 그대로 쓰고, 묶음·길이·결만 더해요
   · 얼굴(볼) 위에 따로 붙이는 옆머리 덩어리는 그리지 않아요 */
function hair2Side(g,p,H,HL,bob,slim){const m=p.h2,D=mix(p.hair,'#000',.3),v=m.vol||0,tied=!!m.x&&m.x!=='halfbun'&&m.x!=='hipony';
  el(g,-6,-100,20,24,H);
  g.beginPath();g.moveTo(-22,-96);g.bezierCurveTo(-24,-126-v*.6,26,-130-v*.6,24,-102);g.bezierCurveTo(18,-104,10,-101,5,-105);g.bezierCurveTo(1,-98,-6,-94,-7,-82);g.lineTo(-22,-82);g.closePath();g.fillStyle=H;g.fill();
  /* 귀 쪽: 짧은 머리·묶은 머리는 귀가 보이고, 기른 머리는 귀를 덮고 내려와요 */
  const SL={chest:46,chin:30,bobin:30,hime:30,cheek:22};const L=tied?(m.x==='braids'?0:15):(SL[m.sd]||0);
  if(L)rr(g,-12,-104,12,L,6,H);else el(g,-1,-94,4,5.5,p.skinSh);
  if(m.tex==='curl')for(let k=0;k<5;k++)el(g,-16+k*8,-120-v*.5+Math.abs(k-2)*2,5.5,5.5,H);
  else if(m.tex==='wave'||m.tex==='cc'){g.save();g.globalAlpha=.3;g.strokeStyle=D;g.lineWidth=1;for(let k=0;k<3;k++){g.beginPath();g.arc(-12+k*8,-116+Math.abs(k-1)*2,3.2,0,Math.PI*1.2);g.stroke()}g.restore()}
  if(m.x==='bun')el(g,-8,-128-v,10,9,H);
  if(m.x==='buns'){el(g,2,-125,6.8,6.4,mix(p.hair,'#000',.1));el(g,-12,-121,8.2,7.8,p.hair);g.strokeStyle=D;g.lineWidth=.8;g.beginPath();g.arc(-12,-121,4,0,Math.PI*1.5);g.stroke()}
  if(m.x==='halfbun')el(g,-16,-118,6.5,5.5,H);
  if(m.x==='hipony'){g.beginPath();const ty=-v*.6;g.moveTo(-17,-112+ty);g.bezierCurveTo(-24,-138+ty,-2,-150+ty,7,-135+ty);g.bezierCurveTo(10,-126+ty,5,-117+ty,2,-113+ty);g.closePath();g.fillStyle=p.hair;g.fill();el(g,-7,-117+ty,4.5,2.8,'#E07A7A',-.3)}
  if(m.x==='braids')h2Braid(g,-6,-90,-6,-54,H,D,'#E07A7A');
  if(m.x==='sidepony'){g.beginPath();g.moveTo(-8,-94);g.bezierCurveTo(-14,-80,-6,-70,-10,-58);g.bezierCurveTo(-4,-54,0,-62,-2,-72);g.bezierCurveTo(0,-82,-2,-90,-2,-94);g.closePath();g.fillStyle=H;g.fill()}
  g.strokeStyle=HL;g.lineWidth=2;g.beginPath();g.moveTo(-10,-118-v*.5);g.quadraticCurveTo(4,-124-v*.5,16,-114);g.stroke();
  hairShine(g,2,-124-v*.5,13,'#FFFFFF')}
/* 뒷모습 */
function hair2Rear(g,p,H,HL,hx,t){const m=p.h2,W=h2HW(p)+3,yb=H2LEN[m.len]||-84,D=mix(p.hair,'#000',.3),v=m.vol||0;
  if(m.sd==='under'){el(g,hx,-99,W,26,mix(p.hair,p.skin,.5));g.beginPath();g.ellipse(hx,-101,W,26+v*.5,0,Math.PI,Math.PI*2);g.lineTo(hx+W-1,-96);g.quadraticCurveTo(hx,-93,hx-W+1,-96);g.closePath();g.fillStyle=H;g.fill()}
  else el(g,hx-t*2,-101,W-t*2,26+v*.4,H);
  if(yb>-80){const wb=W+(yb>-50?4:2)+(m.big?5:0);if(m.big||m.tex==='wave'||m.tex==='cc'){h2Mass(g,hx,-106,yb,W,wb+2,H,D,false,mix(p.hair,'#FFFFFF',.5));}else{g.beginPath();g.moveTo(hx-W,-104);g.bezierCurveTo(hx-W-3,-90,hx-wb,yb-10,hx-wb,yb);h2Edge(g,m.tex,hx-wb,hx+wb,yb);g.bezierCurveTo(hx+wb,yb-10,hx+W+3,-90,hx+W,-104);g.closePath();g.fillStyle=H;g.fill();
    g.save();g.globalAlpha=.16;for(let k=-3;k<=3;k++)ln(g,hx+k*6,-104,hx+k*6.8,yb+3,'#000',1);g.restore()}}
  else{g.beginPath();g.moveTo(hx-W+1,-96);h2Edge(g,m.tex,hx-W+1,hx+W-1,-84);g.lineTo(hx+W-1,-96);g.closePath();g.fillStyle=H;g.fill()}
  if((m.tex==='wave'||m.tex==='cc')&&yb<=-80)h2WaveLines(g,hx,-122-v*.4,-86,W*.55,W*.8,D,mix(p.hair,'#FFFFFF',.5),2.6);
  if(m.tex==='curl')for(let k=0;k<=14;k++){const a=Math.PI*(1+k/14);el(g,hx+Math.cos(a)*(W-.5),-100+Math.sin(a)*(25+v*.4),3.9,3.6,H)}
  if(m.x==='wpony'){h2WTail(g,hx,-116,72,15,3,mix(p.hair,'#000',.06),D);el(g,hx,-117,5.5,3,'#E07A7A')}
  if(m.x==='pony'){g.beginPath();g.moveTo(hx-6,-118);g.bezierCurveTo(hx-12,-96,hx-6,-72,hx+1,-54);g.bezierCurveTo(hx+6,-72,hx+11,-96,hx+6,-118);g.closePath();g.fillStyle=mix(p.hair,'#000',.08);g.fill();g.save();g.globalAlpha=.25;ln(g,hx-2,-110,hx,-62,D,1);ln(g,hx+3,-108,hx+1,-66,D,1);g.restore();el(g,hx,-119,5.5,4,'#E07A7A')}
  if(m.x==='hipony'){g.beginPath();g.moveTo(hx-10,-114-v);g.bezierCurveTo(hx-16,-140-v,hx+8,-150-v,hx+15,-133-v);g.bezierCurveTo(hx+18,-125-v,hx+12,-118-v,hx+9,-114-v);g.closePath();g.fillStyle=p.hair;g.fill();el(g,hx,-121-v,5.5,3,'#E07A7A')}
  if(m.x==='bun')el(g,hx,-126-v,10,9,H);
  if(m.x==='buns')for(const s of [-1,1])el(g,hx+s*14,-123,8.5,8,H);
  if(m.x==='halfbun'){el(g,hx,-114,8,6.5,H);el(g,hx,-108,6,2.2,'#E07A7A')}
  if(m.x==='braids')for(const s of [-1,1])h2Braid(g,hx+s*(W-4),-94,hx+s*(W-2),-56,H,D,'#E07A7A');
  if(m.x==='sidepony'){g.beginPath();g.moveTo(hx+W-6,-96);g.bezierCurveTo(hx+W+6,-84,hx+W-2,-70,hx+W+2,-58);g.bezierCurveTo(hx+W-4,-56,hx+W-8,-64,hx+W-6,-74);g.closePath();g.fillStyle=H;g.fill();el(g,hx+W-5,-96,4,3.2,'#E07A7A')}
  if(m.fr==='split'||m.fr==='curtain')ln(g,hx,-124-v*.4,hx,-112,D,1.1);
  g.strokeStyle=HL;g.lineWidth=2;g.beginPath();g.moveTo(-12+hx,-117-v*.4);g.quadraticCurveTo(hx,-125-v*.4,12+hx,-117-v*.4);g.stroke();hairShine(g,hx,-125-v*.4,13,'#FFFFFF')}

/* ---------- 머리 스타일 덧그림(리트헤어): p.hm = HAIRS의 설정 ---------- */
function hmLen(p){return (p.hm&&p.hm.len)||1}
function hdark(p,a){return mix(p.hair,'#000',a||.3)}
/* 얼굴 뒤(정면)에 그리는 것: 양갈래·물결·층·끝 컬 */
function hairModBehind(g,p,H,hx,hs,bob){const m=p.hm;if(!m)return;const L=hmLen(p);
  if(m.twin){for(const s of [-1,1]){g.save();g.translate(hx+s*30,-104-bob);g.rotate(s*-.12);rr(g,-6,0,12,46,6,H);g.restore();el(g,hx+s*27,-102-bob,4,3,'#E07A7A')}}
  if(m.wave&&hs==='long'){for(const s of [-1,1])for(let k=0;k<5;k++)el(g,hx+s*(25+(k%2?3:-1)),-104-bob+k*12*L,7,7,H)}
  if(m.layer&&hs==='long'){const y=-118-bob+66*L;for(const s of [-1,1]){poly(g,[hx+s*24,y-16,hx+s*33,y-4,hx+s*22,y-6],H);poly(g,[hx+s*16,y-6,hx+s*22,y+4,hx+s*12,y-2],H)}}
  if(m.cc&&hs==='long'){const y=-118-bob+66*L;for(const s of [-1,1]){g.strokeStyle=H;g.lineWidth=7;g.lineCap='round';g.beginPath();g.arc(hx+s*20,y-8,7,s<0?Math.PI*.5:-.2,s<0?Math.PI*1.2:Math.PI*.5);g.stroke()}}}
/* 앞머리·윗머리(정면, hairFrontV 안: 이미 hx로 옮겨진 상태) */
function hairModFront(g,p,H,HL,t){const m=p.hm;if(!m)return;const o=t*5,D=hdark(p);
  if(m.buzz){g.save();g.globalAlpha=.72;g.beginPath();g.ellipse(o,-101,25.5,22,0,Math.PI,Math.PI*2);g.fillStyle=H;g.fill();g.restore();for(let k=0;k<14;k++)el(g,-16+k*2.4+o,-116+Math.abs(k-6.5)*.9,.6,.6,D)}
  if(m.crest){rr(g,-6+o,-144,12,36,6,H);for(let k=0;k<4;k++)poly(g,[-6+o,-140+k*8,o,-150+k*8,6+o,-140+k*8],H);ln(g,o,-142,o,-112,p.hairHi,1.6)}
  if(m.sides){const c=mix(p.hair,p.skin,.55);rr(g,-27,-104,7,15,3,c);rr(g,20,-104,7,15,3,c);el(g,o,-117,18,5,H)}
  if(m.crop){rr(g,-23+o,-124,46,10,5,H);g.save();g.globalAlpha=.3;for(let k=0;k<5;k++)ln(g,-18+k*9+o,-123,-18+k*9+o,-115,D,1);g.restore()}
  if(m.vol)el(g,o,-119,17,5,H);
  if(m.fr==='full'){g.beginPath();g.moveTo(-23+o,-97);g.bezierCurveTo(-22+o,-118,22+o,-118,23+o,-97);[18,13,8,3,-2,-7,-12,-17].forEach((x,k)=>g.lineTo(x+o,k%2?-97:-100.5));g.closePath();g.fillStyle=H;g.fill();g.strokeStyle=D;g.globalAlpha=.35;g.lineWidth=.8;for(const x of [-12,-3,6,14]){g.beginPath();g.moveTo(x+o,-113);g.lineTo(x+o-1,-100);g.stroke()}g.globalAlpha=1}
  if(m.fr==='leaf'){for(const s of [-1,1]){g.beginPath();g.moveTo(o,-117);g.quadraticCurveTo(s*14+o,-114,s*26+o,-92);g.quadraticCurveTo(s*14+o,-101,o+s*2,-104);g.closePath();g.fillStyle=H;g.fill()}}
  if(m.fr==='up'){el(g,o+2,-120,18,7,H);g.strokeStyle=HL;g.lineWidth=1.3;for(const x of [-12,-5,2,9]){g.beginPath();g.moveTo(x+o,-104);g.quadraticCurveTo(x+o-2,-116,x+o+4,-125);g.stroke()}}
  if(m.fr==='part'){g.beginPath();g.moveTo(-4+o,-120);g.quadraticCurveTo(-20+o,-114,-25+o,-94);g.lineTo(-18+o,-98);g.quadraticCurveTo(-12+o,-106,6+o,-108);g.closePath();g.fillStyle=H;g.fill();ln(g,-4+o,-122,-1+o,-110,D,1.1)}
  if(m.fr==='side'){g.beginPath();g.moveTo(20+o,-116);g.quadraticCurveTo(2+o,-114,-21+o,-99);g.lineTo(-15+o,-99);g.quadraticCurveTo(4+o,-105,21+o,-106);g.closePath();g.fillStyle=H;g.fill()}
  if(m.wave){g.strokeStyle=D;g.lineWidth=1.1;g.globalAlpha=.55;for(let k=0;k<4;k++){g.beginPath();g.arc(-13+k*9+o,-108+Math.abs(k-1.5)*1.5,3.6,Math.PI*.1,Math.PI*1.1);g.stroke()}g.globalAlpha=1}
  if(m.swirl){for(let k=0;k<7;k++){const x=-19+k*6.3+o,y=-121+Math.abs(k-3)*2.4;el(g,x,y,4.6,4.4,H);g.strokeStyle=D;g.lineWidth=.9;g.beginPath();g.arc(x,y,2.6,0,Math.PI*1.5);g.stroke()}}
  if(m.side&&hs0(p)==='curly'){for(const s of [-1,1])for(let k=0;k<3;k++)el(g,s*25,-100+k*8,5.5,5.5,H)}
  if(m.bangs==='see'){g.save();g.globalAlpha=.85;g.strokeStyle=H;g.lineWidth=2.4;g.lineCap='round';for(const x of [-12,-6,0,6,12]){g.beginPath();g.moveTo(x*.6+o,-114);g.quadraticCurveTo(x+o,-108,x*1.1+o,-99);g.stroke()}g.restore();for(const s of [-1,1]){g.beginPath();g.moveTo(s*18+o,-104);g.quadraticCurveTo(s*26+o,-92,s*22+o,-80);g.strokeStyle=H;g.lineWidth=3;g.stroke()}}
  if(m.half){el(g,o,-125,7,5,H);el(g,o-3,-127,2.6,1.4,HL);el(g,o,-121,5,1.6,'#E07A7A')}
  if(m.blunt){const y=-74-(hmLen(p)>1?0:4)+((hmLen(p)-1)*20);g.fillStyle=H;g.fillRect(-26,-96,8,y+96);g.fillRect(18,-96,8,y+96)}}
function hs0(p){return hairStyleOf(p)}
/* 뒷모습 */
function hairModBack(g,p,H,HL,hx,t,hs){const m=p.hm;if(!m)return;const D=hdark(p),L=hmLen(p);
  if(m.buzz){g.save();g.globalAlpha=.8;el(g,hx,-104,24,20,H);g.restore()}
  if(m.crest)rr(g,hx-6,-144,12,40,6,H);
  if(m.sides){const c=mix(p.hair,p.skin,.55);rr(g,hx-26,-104,52,12,5,c)}
  if(m.twin){for(const s of [-1,1]){g.save();g.translate(hx+s*28,-106);g.rotate(s*-.1);rr(g,-6,0,12,46,6,H);g.restore();el(g,hx+s*26,-104,4,3,'#E07A7A')}}
  if(m.half){el(g,hx,-114,8,6,H);el(g,hx,-109,6,2.4,'#E07A7A')}
  if(m.wave&&hs==='long')for(const s of [-1,1])for(let k=0;k<5;k++)el(g,hx+s*(26+(k%2?3:-1)),-108+k*11*L,7,7,H);
  if(hs==='long'&&L!==1)rr(g,-27+hx,-118,54,58*L,20,H);
  if(m.layer&&hs==='long'){const y=-118+58*L;for(const s of [-1,1])poly(g,[hx+s*20,y-10,hx+s*30,y+2,hx+s*14,y-2],H)}
  if(m.cc&&hs==='long'){const y=-118+58*L;g.strokeStyle=H;g.lineWidth=6;g.lineCap='round';for(const s of [-1,1]){g.beginPath();g.arc(hx+s*20,y-7,6,s<0?Math.PI*.5:-.3,s<0?Math.PI*1.3:Math.PI*.5);g.stroke()}}
  if(m.blunt&&hs==='bob'){g.fillStyle=H;g.fillRect(hx-27,-100,54,24+(L-1)*20);g.fillStyle=D;g.fillRect(hx-27,-77+(L-1)*20,54,1.4)}
  if(m.swirl||m.wave)for(let k=0;k<5;k++){const a=Math.PI*(1.15+k*.17);g.strokeStyle=D;g.lineWidth=1;g.beginPath();g.arc(hx+Math.cos(a)*18,-102+Math.sin(a)*18,3,0,Math.PI*1.4);g.stroke()}}
/* 옆모습 */
function hairModSide(g,p,H,HL,bob){const m=p.hm;if(!m)return;const D=hdark(p);
  if(m.buzz){g.save();g.globalAlpha=.75;g.beginPath();g.ellipse(3,-100,23,23,0,Math.PI,Math.PI*2);g.fillStyle=H;g.fill();g.restore()}
  if(m.crest)rr(g,-4,-144,11,38,5,H);
  if(m.sides){const c=mix(p.hair,p.skin,.55);rr(g,-20,-104,16,13,4,c)}
  if(m.twin){g.save();g.translate(-20,-106-bob);g.rotate(.3);rr(g,-5,0,10,40,5,H);g.restore()}
  if(m.half)el(g,-15,-118,6,5,H);
  if(m.fr==='full'||m.fr==='side'||m.bangs==='see'){g.beginPath();g.moveTo(10,-114);g.quadraticCurveTo(22,-110,24,-99);g.lineTo(16,-100);g.closePath();g.fillStyle=H;g.fill()}
  if(m.fr==='up')el(g,8,-126,14,6,H);
  if(m.wave||m.swirl)for(let k=0;k<4;k++){g.strokeStyle=D;g.lineWidth=1;g.beginPath();g.arc(-8+k*6,-118+Math.abs(k-1.5)*2,3,0,Math.PI*1.4);g.stroke()}
  if(m.blunt){g.fillStyle=H;g.fillRect(-14,-104,14,24+((m.len||1)-1)*20)}}
function hairBack(g,p,H,hx,hs,bob){
  hairModBehind(g,p,H,hx,hs,bob);
  if(hs==='long'){rr(g,-27+hx,-118-bob,54,66*hmLen(p),20,H);g.save();g.globalAlpha=.18;for(let k=-3;k<=3;k++)ln(g,hx+k*6,-100-bob,hx+k*6.6,-56-bob,'#000',1);g.restore()}
  else if(hs==='bob')rr(g,-27+hx,-117-bob,54,44*hmLen(p),p.hm&&p.hm.blunt?5:18,H);
  else if(hs==='curly'&&p.style==='f'){for(let k=0;k<9;k++){const a=Math.PI*(.95+k*.14);el(g,hx+Math.cos(a)*27,-98-bob-Math.sin(a)*-20,9,9,H)}rr(g,-28+hx,-112-bob,56,44,18,H)}
}
function hairFrontV(g,p,H,HL,hx,t){
  const hs=hairStyleOf(p);g.save();g.translate(hx,0);
  if(hs==='bald'){el(g,-21+t*5,-98,5,9,H);el(g,21,-98,5,9,H);el(g,t*6,-118,10,3,'rgba(255,255,255,.25)');hairModFront(g,p,H,HL,t);g.restore();return}
  const fem=['long','bob','pony','bun'].includes(hs)||(hs==='curly'&&p.style==='f');
  if(!fem){
    g.beginPath();g.moveTo(-26,-94);g.bezierCurveTo(-30,-126,30,-128,26,-94);g.bezierCurveTo(22,-100,14,-102,6+t*6,-100);
    g.bezierCurveTo(2+t*6,-106,-4+t*6,-108,-6+t*6,-106);g.bezierCurveTo(-12,-96,-20,-100,-26,-92);g.closePath();g.fillStyle=H;g.fill();
    if(p.perm){ // 가르마 펌: 윗머리 웨이브 + 가르마
      for(let k=0;k<6;k++)el(g,-20+k*8+t*3,-119+Math.abs(k-2.5)*1.8,5.2,4.6,H);
      g.strokeStyle=mix(p.hair,'#000',.35);g.lineWidth=1.1;g.globalAlpha=.55;for(let k=0;k<5;k++){g.beginPath();g.arc(-18+k*8.5+t*3,-110+Math.abs(k-2)*1.5,4,Math.PI*.9,Math.PI*1.9);g.stroke()}g.globalAlpha=1;
      ln(g,-7+t*5,-125,-3+t*6,-110,mix(p.hair,'#000',.3),1.2);
    }
    if(hs==='curly')for(let k=0;k<7;k++)el(g,-22+k*7.3,-117+Math.abs(k-3)*2.2,5.5,5.5,H);
    g.strokeStyle=HL;g.lineWidth=2;[[-18,-110,-12,-116,-4,-114],[4,-116,12,-118,18,-110]].forEach(([a,b,c,d,e,h])=>{g.beginPath();g.moveTo(a,b);g.quadraticCurveTo(c,d,e,h);g.stroke()});
  }else{
    const part=1+t*8;
    g.beginPath();g.moveTo(-24,-94);g.bezierCurveTo(-27,-128,27,-128,24,-94);g.lineTo(24,-78);g.lineTo(18,-78);g.lineTo(18,-92);
    g.bezierCurveTo(14,-102,6+t*4,-104,part,-111);g.lineTo(part-2,-111);g.bezierCurveTo(-6+t*4,-104,-14,-102,-18,-92);g.lineTo(-18,-78);g.lineTo(-24,-78);g.closePath();g.fillStyle=H;g.fill();
    if(p.bangs){g.beginPath();g.moveTo(-19,-100);g.bezierCurveTo(-16,-114,16,-114,19,-100);g.bezierCurveTo(14,-106,10,-106,7,-101);g.bezierCurveTo(4,-106,-1,-106,-3,-101);g.bezierCurveTo(-7,-107,-12,-106,-19,-100);g.closePath();g.fillStyle=H;g.fill()}
    if(hs==='bob'||hs==='pony'||hs==='bun'){rr(g,-25,-96,8,22,4,H);rr(g,17,-96,8,22,4,H)}
    if(hs==='bun'){el(g,0,-127,11,10,p.hair);el(g,0,-125,9,6,mix(p.hair,'#000',.08));el(g,-3,-131,4,2.5,HL);if(p.hairpin){ln(g,-10,-131,10,-123,'#C9A24A',1.4);el(g,10,-123,1.8,1.8,'#E07A7A')}}
    if(hs==='curly')for(let k=0;k<7;k++)el(g,-22+k*7.3,-117+Math.abs(k-3)*2.2,5.5,5.5,H);
    g.save();g.globalAlpha=.22;g.strokeStyle=mix(p.hair,'#000',.4);g.lineWidth=.9;for(const [a,b] of [[-14,-20],[-8,-19],[9,19],[14,21]]){g.beginPath();g.moveTo(a*.5+part*.3,-110);g.quadraticCurveTo(a,-104,b,-86);g.stroke()}g.restore();
    g.strokeStyle=HL;g.lineWidth=2;g.beginPath();g.moveTo(-8,-118);g.quadraticCurveTo(-16,-112,-20,-100);g.stroke();g.beginPath();g.moveTo(9,-119);g.quadraticCurveTo(14,-116,17,-110);g.stroke();
  }
  hairModFront(g,p,H,HL,t);
  hairShine(g,0,-124,14,'#FFFFFF');
  g.restore();
}
/* 새 머리 장식: 집게핀·별 핀·곱창 밴드·진주 리본 */
const PINX={
  claw:(g,x,y)=>{rr(g,x-6,y-3,12,6,2.5,'#8A5A36');for(let k=0;k<4;k++)ln(g,x-4.5+k*3,y-3,x-4.5+k*3,y+3,'#C99A6A',.8);el(g,x-2,y-1.5,2,1,'rgba(255,255,255,.35)')},
  star:(g,x,y)=>{const P=[];for(let k=0;k<10;k++){const r=k%2?2.2:5,a=-Math.PI/2+k*Math.PI/5;P.push(x+Math.cos(a)*r,y+Math.sin(a)*r)}poly(g,P,'#F5CF4E');el(g,x-1,y-1.5,1.2,.8,'rgba(255,255,255,.6)')},
  scrunchie:(g,x,y)=>{for(let k=0;k<7;k++){const a=k*Math.PI*2/7;el(g,x+Math.cos(a)*4,y+Math.sin(a)*3,3,2.6,k%2?'#E8A0B4':'#F2B8C8')}el(g,x,y,2.2,1.8,'#D88AA0')},
  bowP:(g,x,y)=>{el(g,x-5,y,6,4.2,'#FFFFFF',-.4);el(g,x+5,y-2,6,4.2,'#FFFFFF',.4);for(const k of [-7,-4,4,7])el(g,x+k,y-(k>0?2:0),.9,.9,'#E8E2D6');el(g,x,y-1,2.4,2.4,'#F1E9DC')}
};
function pinV(g,p,hx,t,back){
  const a=p.pin;if(!a)return;
  if(a==='band'){g.strokeStyle='#B9A2E0';g.lineWidth=4;g.beginPath();g.arc(hx,-98,25,Math.PI*1.08,Math.PI*1.92);g.stroke();return}
  const px=back?hx-15:hx+15-t*4,py=-117;
  if(a==='pearl'){for(let k=0;k<3;k++){el(g,px-5+k*5,py+k*.8,2.3,2.3,'#FBF7EF');el(g,px-5.6+k*5,py-.6+k*.8,.8,.8,'#FFFFFF')}return}
  if(a==='ribbon'){el(g,px-5,py,6,4,'#EE7F9C',-.4);el(g,px+5,py-2,6,4,'#EE7F9C',.4);el(g,px,py-1,2.4,2.4,'#C65C79')}
  else if(PINX[a])PINX[a](g,px,py);
  else{const pc=a==='yflower'?'#F9D66B':'#FFFFFF',cc=a==='yflower'?'#E8A23A':'#F5CF4E';for(let k=0;k<5;k++){const an=k*Math.PI*2/5;el(g,px+Math.cos(an)*3.6,py+Math.sin(an)*3.6,2.8,2.8,pc)}el(g,px,py,2.2,2.2,cc)}
}
function apronV(g,p,st,hw,t,back,side){
  const c=p.apron;if(!c)return;const d=mix(c,'#3B2F3F',.18);
  if(side){rr(g,6,-72,10,40,3,c);return}
  if(back){ln(g,-hw*.6+st,-76,hw*.5+st,-46,d,2.2);ln(g,hw*.6+st,-76,-hw*.5+st,-46,d,2.2);el(g,st-3,-46,4,2.5,c);el(g,st+3,-46,4,2.5,c);return}
  rr(g,-hw+4+st+t*2,-62,2*hw-8,30,4,c);rr(g,-8+st+t*3,-75,16-t*3,15,3,c);ln(g,-8+st+t*3,-75,-13+st,-80,d,1.6);ln(g,8+st,-75,13+st,-80,d,1.6);
  rr(g,-6+st+t*3,-52,12-t*2,8,2,d);g.fillStyle=c;g.fillRect(-5+st+t*3,-51,10-t*2,6);
  if(p.apronPat==='flower'){const Q=[[-10,-58],[6,-60],[-3,-40],[11,-44],[-13,-44],[1,-70]];Q.forEach(([qx,qy],k)=>{const fx=qx+st+t*3;if(Math.abs(qx)>hw-6)return;for(let j=0;j<5;j++){const b=j*1.2566;el(g,fx+Math.cos(b)*1.6,qy+Math.sin(b)*1.6,1.3,1.3,k%2?'#FFFFFF':'#F29AB0')}el(g,fx,qy,.8,.8,'#F5CF4E')})}
}
/* 생민 얼굴: 동그란 느낌은 두고 옆선을 덜 둥글게(볼이 덜 넓적하게) */
function maleHead(g,hx,t,col,sh){
  const w=24*(1-.14*t),cx=hx+t*6;g.beginPath();g.moveTo(hx-w+t*2,-100);g.bezierCurveTo(hx-w,-125,hx+w,-125,hx+w,-100);g.bezierCurveTo(hx+w+.4,-89,cx+15,-77,cx,-75.5);g.bezierCurveTo(cx-15,-77,hx-w+t*2+.4,-89,hx-w+t*2,-100);g.fillStyle=col;g.fill();
}
function slimHead(g,hx,t,col,sh){
  const w=21*(1-.14*t),chinX=hx+t*6;g.beginPath();g.moveTo(hx-w+t*2,-100);g.bezierCurveTo(hx-w,-127,hx+w,-127,hx+w,-100);g.bezierCurveTo(hx+w+1,-87,chinX+11,-77.5,chinX,-75.5);g.bezierCurveTo(chinX-11,-77.5,hx-w+t*2,-87,hx-w+t*2,-100);g.fillStyle=col;g.fill();
}
function hatV(g,p,hx,t,back){
  const a=p.hat||(p.acc!=='glasses'&&p.acc);if(!a)return;const hc=p.hatC||(p.hat?'#C65C79':mix(p.tee,'#3B2F3F',.15));
  if(a==='beret'){const c1=p.hatC||'#C65C79',c2=mix(c1,'#FFFFFF',.15);el(g,hx-3,-120,25,9,c1,-.12);el(g,hx-3,-124,20,6,c2,-.12);el(g,hx-2,-130,2.2,2.2,mix(c1,'#000',.2));g.save();g.globalAlpha=.25;el(g,hx-10,-125,8,2,'#FFFFFF',-.2);g.restore();return}
  if(a==='mailcap'){el(g,hx,-116,26,13,'#34507E');g.fillStyle='#34507E';g.fillRect(hx-26,-116,52,7);g.fillStyle='#D8534F';g.fillRect(hx-26,-112,52,3.5);if(!back){el(g,hx+t*12,-104,22-t*4,5,'#26406A');el(g,hx+t*5,-116,4,3.2,'#E2B656')}return}
  if(a==='kidhat'){el(g,hx,-108,31,8,'#F2C230');rr(g,hx-20,-132,40,26,13,'#F7D04A');g.fillStyle='#E8603C';g.fillRect(hx-20,-112,40,3);el(g,hx-8,-126,6,2,'rgba(255,255,255,.35)',-.3);return}
  if(a==='crown'&&p.hat){g.save();g.globalAlpha=.95;g.strokeStyle='#7FAF6C';g.lineWidth=3;g.beginPath();g.ellipse(hx,-114,25,7,0,back?0:Math.PI,back?Math.PI:Math.PI*2);g.stroke();g.restore();
    const FC=['#F7B7C8','#FFFFFF','#F9D66B','#C9B3EA','#F7B7C8','#FFFFFF','#F9D66B'];for(let k=0;k<7;k++){const an=Math.PI*(1.08+k*.14),fx=hx+Math.cos(an)*25,fy=-114+Math.sin(an)*7;for(let j=0;j<5;j++){const b=j*Math.PI*2/5;el(g,fx+Math.cos(b)*2.6,fy+Math.sin(b)*2.6,2.2,2.2,FC[k])}el(g,fx,fy,1.5,1.5,k%2?'#E8A23A':'#F5CF4E')}
    for(const k of [0,2,4,6]){const an=Math.PI*(1.15+k*.14);el(g,hx+Math.cos(an)*25,-111+Math.sin(an)*7,3,1.4,'#6FA35E',an)}return}
  if(a==='bucket'&&p.hat){el(g,hx,-109,34,8,'#E6D6B8');rr(g,hx-21,-133,42,26,12,'#F2E7D2');g.fillStyle='#C9A07A';g.fillRect(hx-21,-114,42,3.5);g.save();g.globalAlpha=.25;for(let k=-2;k<=2;k++)ln(g,hx+k*8,-132,hx+k*9,-112,'#B89C74',.8);g.restore();return}
  if(a==='cap'&&p.hat){const c=p.hatC||'#5C7FB8';el(g,hx,-114,26,15,c);g.fillStyle=c;g.fillRect(hx-26,-114,52,6);if(!back)el(g,hx+t*12,-104,21-t*4,5,mix(c,'#000',.15));return}
  if(a==='beanie'&&p.hat){const c=p.hatC||'#E3A04A';rr(g,hx-26,-132,52,32,17,c);rr(g,hx-27,-108,54,9,4,mix(c,'#FFFFFF',.3));el(g,hx,-134,6,6,'#FFF1D6');return}
  if(a==='fedora'&&p.hat){const c=p.hatC||'#8C6A4E';el(g,hx,-110,34,8,mix(c,'#000',.12));rr(g,hx-20,-134,40,26,9,c);el(g,hx,-133,14,3,mix(c,'#000',.2));g.fillStyle='#2E2B30';g.fillRect(hx-20,-116,40,4);return}
  if(a==='visor'&&p.hat){const c=p.hatC||'#F2F0EA';g.fillStyle=c;g.fillRect(hx-25,-116,50,7);if(!back)el(g,hx+t*12,-106,24-t*4,6,mix(c,'#000',.06));return}
  if(a==='cap'){el(g,hx,-114,26,15,hc);g.fillRect(hx-26,-114,52,6);if(!back)el(g,hx+t*12,-104,21-t*4,5,mix(hc,'#000',.12));el(g,hx,-127,2.5,2,mix(hc,'#fff',.3))}
  else if(a==='sunhat'){el(g,hx,-110,40,9,'#E9D3A4');rr(g,hx-19,-132,38,24,11,'#F0DEB4');g.fillStyle='#E07A7A';g.fillRect(hx-19,-114,38,4);el(g,hx+14,-112,4,3,'#F9C9D5')}
  else if(a==='beanie'){rr(g,hx-26,-132,52,32,17,hc);rr(g,hx-27,-108,54,9,4,mix(hc,'#fff',.25));el(g,hx,-134,6,6,mix(hc,'#fff',.4))}
  else if(a==='bow'&&!back){el(g,hx+14,-118,6,4,'#EE7F9C',-.4);el(g,hx+24,-121,6,4,'#EE7F9C',.4);el(g,hx+19,-119,2.5,2.5,'#C65C79')}
}
/* 눈 하나(정면·3/4): 테두리 → 홍채(그라데이션) → 눈동자 → 하이라이트 2개 */
function eyeV(g,x,ey,s,p,big){
  const ir=p.eyeC||'#6A4632',h=big?4.2:3.7;
  el(g,x,ey,3.05*s,h,EYE);
  const q=g.createLinearGradient(0,ey-h,0,ey+h);q.addColorStop(0,mix(ir,'#000',.35));q.addColorStop(1,mix(ir,'#FFFFFF',.2));
  el(g,x,ey+.55,2.25*s,h-1,q);el(g,x,ey+.5,1.15*s,1.6,'#18110F');
  el(g,x-1*s,ey-1.5,1.15*s,1.2,'#FFFFFF');el(g,x+1.05*s,ey+1.6,.55*s,.55,'rgba(255,255,255,.85)');
}
function faceV(g,p,glasses,fx,t){
  const ey=-94,f=p.style==='f',ex=p.expr||'smile';
  const eL=-9+fx+t*7,eR=9+fx+t*2,sq=1-.42*t;
  if(p.blush!==false){const bx=p.face==='slim'?11.5:14;g.globalAlpha=.36;if(t<.5)el(g,-bx+fx+t*9,-85,3.4*sq,2,CO.blush);el(g,bx+fx-t*3,-85,3.4,2,CO.blush);g.globalAlpha=1;
    g.globalAlpha=.5;if(t<.5)el(g,-bx+fx+t*9-1,-85.6,.5,.4,'#FFFFFF');el(g,bx+fx-t*3-1,-85.6,.5,.4,'#FFFFFF');g.globalAlpha=1}
  [[eL,sq],[eR,1]].forEach(([x,s])=>{
    if(ex==='sleepy'){g.strokeStyle=EYE;g.lineWidth=1.8;g.beginPath();g.arc(x,ey+1,3.4*s,Math.PI*1.1,Math.PI*1.9);g.stroke()}
    else eyeV(g,x,ey,s,p,ex==='wow');
    if(f&&ex!=='sleepy'){g.strokeStyle=EYE;g.lineWidth=1.5;g.beginPath();g.arc(x,ey-.4,4.2*s,Math.PI*1.12,Math.PI*1.9);g.stroke();
      ln(g,x+3.9*s,ey-2.2,x+5.4*s,ey-3.6,EYE,1.1);
      if(p.dbl){g.strokeStyle=mix(p.skinSh,'#000',.2);g.lineWidth=.8;g.globalAlpha=.7;g.beginPath();g.arc(x,ey-1.2,5.4*s,Math.PI*1.2,Math.PI*1.8);g.stroke();g.globalAlpha=1}}
    if(!f||ex==='wow'){g.strokeStyle=p.browC||CO.brow;g.lineWidth=1.8;const by=ex==='wow'?-104:-102;g.beginPath();g.moveTo(x-3.6*s,by+.4);g.quadraticCurveTo(x,by-1.2,x+3.6*s,by-.4);g.stroke()}
    else{g.strokeStyle=mix(p.hair,'#000',.1);g.lineWidth=1.1;g.globalAlpha=.8;g.beginPath();g.moveTo(x-3.2*s,-103.4);g.quadraticCurveTo(x,-104.6,x+3.2*s,-103.6);g.stroke();g.globalAlpha=1}
    if(p.lines&&ex!=='sleepy'){g.strokeStyle=p.skinSh;g.lineWidth=.9;g.beginPath();g.arc(x+(x<fx?-5.5:5.5)*s,ey+1,2,x<fx?Math.PI*.6:-.2,x<fx?Math.PI*1.2:.4);g.stroke()}
  });
  // 코(작은 음영)
  g.globalAlpha=.5;el(g,fx+t*9,-89,1.1,.7,p.skinSh);g.globalAlpha=1;
  if(t>0){g.strokeStyle=p.skinSh||'#D3A284';g.globalAlpha=.55;g.lineWidth=1;g.beginPath();g.arc(fx+t*11,-89,1.6,-Math.PI*.3,Math.PI*.4);g.stroke();g.globalAlpha=1}
  if(glasses||p.acc==='glasses'){const GS=glsSpec(glasses,p),gold=GS.round;
    [[eL,sq],[eR,1]].forEach(([x,s])=>{if(gold){g.beginPath();g.ellipse(x,ey,6.5*s,6.5,0,0,7)}else rr(g,x-7.5*s,ey-6,15*s,12,4.5);g.fillStyle=GS.lens;g.fill();g.strokeStyle=GS.f;g.lineWidth=GS.lw;g.stroke();
      g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1.1;g.beginPath();g.moveTo(x-4.5*s,ey-3.5);g.lineTo(x-2*s,ey-4.6);g.stroke()});
    const gc=gold?'#C9A24A':CO.ink;ln(g,eL+7*sq,ey-1,eR-7,ey-1,gc,gold?1.2:2);if(t>0)ln(g,eL-7*sq,ey-2,eL-11,ey-3,gc,1.4);
  }
  const mx=fx+t*6;g.strokeStyle=f?'#D9788A':CO.mouth;g.lineWidth=1.6;
  if(ex==='grin'){g.beginPath();g.moveTo(mx-4,-86);g.quadraticCurveTo(mx,-79,mx+4,-86);g.closePath();g.fillStyle='#B85C62';g.fill();el(g,mx,-82.5,2,1.2,'#F29AA3')}
  else if(ex==='calm'){ln(g,mx-2.5,-85,mx+2.5,-85,g.strokeStyle,1.5)}
  else if(ex==='wow'){el(g,mx,-84,2.2,2.8,'#B85C62')}
  else{g.beginPath();g.arc(mx,-85,3,Math.PI*.15,Math.PI*.85);g.stroke()}
}
/* 옷 겉옷·목도리·가방·소품 (정면/3/4/뒤) */
function coatBodyV(g,p,st,hw,t,back){
  const c=p.coat;if(!c)return;const col=p.coatC,d=mix(col,'#1E1622',.2),L2=p.coat==='trench'?-26:-34;
  g.beginPath();g.moveTo(-hw-1+st,-76);g.lineTo(hw+1+st,-76);g.lineTo(hw+4+st,L2);g.lineTo(-hw-4+st,L2);g.closePath();g.fillStyle=clothGrad(g,col,-hw-4+st,hw+4+st);g.fill();
  if(back){if(p.coat==='trench'){rr(g,-hw-3+st,-47,2*hw+6,5,2,d);ln(g,st,-44,st,L2,d,1.2)}return}
  const cx=st+t*5;
  if(p.coat==='trench'){P2(g,[-10+cx,-77,-2+cx,-77,-7+cx,-60],mix(col,'#FFFFFF',.25));P2(g,[10+cx,-77,2+cx,-77,7+cx,-60],mix(col,'#FFFFFF',.25));
    ln(g,cx,-70,cx-1,L2+1,d,1.2);for(const yy of [-64,-55])el(g,cx+4,yy,1.6,1.6,'#8A6A4A');
    rr(g,-hw-3+st,-47,2*hw+6,5,2,mix(col,'#8A5A3A',.3));rr(g,cx-4,-48,8,7,1.6,'#9C7A55');rr(g,cx-2.5,-46.5,5,4,1,col)}
  else if(p.coat==='cardigan'){g.fillStyle=p.innerC||'#FFF6E6';g.beginPath();g.moveTo(cx-6,-77);g.lineTo(cx+6,-77);g.lineTo(cx+3,L2);g.lineTo(cx-3,L2);g.closePath();g.fill();
    ln(g,cx-4,-76,cx-2.5,L2,d,1.1);ln(g,cx+4,-76,cx+2.5,L2,d,1.1);for(const yy of [-68,-58,-48,-40])el(g,cx-5,yy,1.3,1.3,'#F4EDE0');
    g.save();g.globalAlpha=.18;for(let yy=-72;yy<L2;yy+=4)ln(g,-hw+st,yy,cx-7,yy,'#FFFFFF',.6);g.restore()}
  else if(p.coat==='uniform'){P2(g,[-8+cx,-77,0+cx,-71,-4+cx,-66],mix(col,'#FFFFFF',.3));P2(g,[8+cx,-77,0+cx,-71,4+cx,-66],mix(col,'#FFFFFF',.3));
    ln(g,cx,-71,cx,L2+1,d,1.1);for(const yy of [-64,-54,-44])el(g,cx+.1,yy,1.2,1.2,'#E2B656');rr(g,cx-hw*.8+3,-66,8,7,1.5,d);ln(g,cx-hw*.8+3,-63,cx-hw*.8+11,-63,mix(col,'#FFFFFF',.2),.8);
    el(g,cx+hw*.6-1,-64,2.6,2.6,'#E2B656')}
}
function P2(g,pts,fill){poly(g,pts,fill)}
/* 상의 종류(니트·후드·줄무늬 티) 덧그림 */
function topV(g,p,st,hw,t,back){const c=p.tee,d=mix(c,'#1E1622',.2),L=mix(c,'#FFFFFF',.3);
  if(p.top==='knit'){g.save();g.globalAlpha=.28;for(let x=-hw+3;x<hw;x+=4)ln(g,x+st,-74,x+st,-40,d,1);g.restore();rr(g,-hw-2+st,-42,2*hw+4,6,2,d);if(!back)rr(g,-8+st+t*5,-80,16,5,2.5,d)}
  else if(p.top==='hood'){if(back){rr(g,-hw*.7+st,-80,hw*1.4,22,9,d);rr(g,-hw*.55+st,-78,hw*1.1,16,7,c)}else{rr(g,-hw*.8+st,-82,hw*1.6,9,4.5,d);const cx=st+t*5;ln(g,cx-4,-76,cx-4.5,-62,L,1.2);ln(g,cx+4,-76,cx+4.5,-62,L,1.2);el(g,cx-4.5,-61,1.2,1.4,L);el(g,cx+4.5,-61,1.2,1.4,L);rr(g,-hw*.55+st+t*4,-56,hw*1.1,10,3,d)}}
  else if(p.top==='stripe'){g.save();g.globalAlpha=.85;for(let y=-72;y<-40;y+=6)rr(g,-hw-1+st,y,2*hw+2,2.6,1,p.topL||'#FFFFFF');g.restore()}}
/* 액세서리: 목걸이·나비넥타이·코르사주(정면/3/4에서만) · 귀걸이는 얼굴 그릴 때 */
function accV(g,p,st,hw,t,back){if(back)return;const cx=st+t*5;
  /* 16차 보완: 작은 화면(TV)에서도 알아볼 수 있게 크고 색이 또렷하게 */
  if(p.neck==='pearl'){for(let k=0;k<11;k++){const a=Math.PI*(.1+k*.08);const x=cx+Math.cos(a)*12,y=-80+Math.sin(a)*10;el(g,x,y+.6,2.9,2.9,'#B9AFA4');el(g,x,y,2.7,2.7,'#FFFDF8');el(g,x-.9,y-.9,.9,.9,'#FFFFFF')}}
  else if(p.neck==='gold'){g.strokeStyle='#C9A24A';g.lineWidth=1.6;g.beginPath();g.arc(cx,-82,11,Math.PI*.12,Math.PI*.88);g.stroke();
    const hx=cx,hy=-66;g.beginPath();g.moveTo(hx,hy+5);g.bezierCurveTo(hx-7,hy,hx-5,hy-6,hx,hy-3);g.bezierCurveTo(hx+5,hy-6,hx+7,hy,hx,hy+5);g.fillStyle='#E8C24E';g.fill();g.strokeStyle='#A8822E';g.lineWidth=.8;g.stroke();el(g,hx-2,hy-2,1,.8,'#FFF2B8')}
  if(p.bow){const c=p.bow,d=mix(c,'#000',.28);poly(g,[cx-13,-84,cx-1,-78,cx-13,-71],c);poly(g,[cx+13,-84,cx+1,-78,cx+13,-71],c);ln(g,cx-10,-80,cx-4,-78,d,1);ln(g,cx+10,-80,cx+4,-78,d,1);rr(g,cx-3,-81.5,6,7,2,d)}
  if(p.corsage){const x=cx-hw*.5,y=-64,c=p.corsage,d=c==='#FFFFFF'?'#D8CFC4':mix(c,'#000',.18);el(g,x+5,y+6,4.5,1.8,'#6FA35E',.6);el(g,x-5,y+6,4.5,1.8,'#7FB070',-.6);
    for(let k=0;k<6;k++){const a=k*1.047;el(g,x+Math.cos(a)*4.2,y+Math.sin(a)*4.2,3.6,3.6,d);el(g,x+Math.cos(a)*4,y+Math.sin(a)*4,3.2,3.2,c)}el(g,x,y,2.4,2.4,'#F5CF4E')}}
/* 귀걸이: 머리카락 위에 그려서 긴 머리여도 보여요(정면은 양쪽, 비스듬하면 보이는 한쪽) */
function earV(g,p,f,hx,t){if(!p.ear)return;const ex=f?22:25,pts=t>0?(t<.8?[[hx-ex+t*6,1]]:[]):[[-ex,1],[ex,1]];
  for(const [x] of pts){const y=-87;
    if(p.ear==='pearl'){el(g,x,y+.7,3.6,3.6,'#B9AFA4');el(g,x,y,3.4,3.4,'#FFFDF8');el(g,x-1.1,y-1.1,1.1,1.1,'#FFFFFF')}
    else if(p.ear==='gold'){g.strokeStyle='#D8B04A';g.lineWidth=2;g.beginPath();g.arc(x,y+2,4,0,Math.PI*2);g.stroke();g.strokeStyle='#FFF0B0';g.lineWidth=.7;g.beginPath();g.arc(x,y+2,4,Math.PI*1.1,Math.PI*1.5);g.stroke()}
    else{el(g,x,y-1,1.8,1.8,'#E2C27A');ln(g,x,y,x,y+4,'#C9A24A',.8);g.beginPath();g.moveTo(x,y+3);g.bezierCurveTo(x-4,y+8,x-3,y+12,x,y+12);g.bezierCurveTo(x+3,y+12,x+4,y+8,x,y+3);g.fillStyle='#E886A8';g.fill();el(g,x-1,y+8,1,1.5,'#FFD6E4')}}}
function scarfV(g,p,st,hw,t,back){if(!p.scarf)return;const c=p.scarf,d=mix(c,'#1E1622',.22);
  rr(g,-hw*.72+st,-80,hw*1.44,9,4.5,c);g.save();g.globalAlpha=.3;for(let k=-3;k<=3;k++)ln(g,st+k*4.5,-79,st+k*4.5+1.5,-72,'#FFFFFF',.9);g.restore();
  if(!back){const tx=st+t*5+5;rr(g,tx,-74,7,17,3,c);for(let k=0;k<3;k++)ln(g,tx+1.2+k*2.3,-57,tx+1.2+k*2.3,-54,d,.9)}}
function bagV(g,p,st,hw,t,back){if(!p.bag)return;const c=p.bagC||'#9C6B4C',d=mix(c,'#000',.2);
  if(back){ln(g,-hw*.7+st,-76,hw*.8+st,-44,d,2.4);return}
  ln(g,-hw*.75+st+t*4,-76,hw*.85+st,-46,d,2.4);rr(g,hw*.45+st,-50,15,13,3,c);rr(g,hw*.45+st,-50,15,5,2.5,d);el(g,hw*.45+st+7.5,-45.5,1.4,1.4,'#E2B656');if(p.bagP){el(g,hw*.45+st+7.5,-41,3.2,2.6,p.bagP);if(p.bagP2)el(g,hw*.45+st+7.5,-41.6,1.4,1.1,p.bagP2)}
  if(p.prop==='letters'){rr(g,hw*.45+st+3,-55,9,6,1,'#FFFFFF');rr(g,hw*.45+st+5,-56.5,8,6,1,'#F7E6C8');ln(g,hw*.45+st+5,-56.5,hw*.45+st+9,-53.5,'#D8534F',.5)}}
function propV(g,p,st,hw,t,back){if(!p.prop||back||p.prop==='letters')return;
  const x=hw+st-2,y=-52;
  if(p.prop==='sketch'){g.save();g.translate(x,y);g.rotate(.12);rr(g,-2,-2,15,19,2,'#F6F0E4');rr(g,-2,-2,15,3.4,1.6,'#E07A7A');for(let k=0;k<4;k++)el(g,1+k*3.5,-.4,.8,.8,'#8A7B74');ln(g,1,7,11,6,'#9DBB88',1);el(g,6.5,11,2.6,2.2,'#F4A6B8');g.restore()}
  else if(p.prop==='basket'){const bx=-hw+st-6;rr(g,bx-9,-46,18,11,4,'#C99A63');ln(g,bx-7,-43,bx+7,-43,'#A87A48',.8);ln(g,bx-7,-39,bx+7,-39,'#A87A48',.8);g.strokeStyle='#A87A48';g.lineWidth=1.6;g.beginPath();g.arc(bx,-46,8,Math.PI,0);g.stroke();
    for(let k=0;k<4;k++)flowerHead(g,TYPES[(k+1)%5],bx-6+k*4,-48-(k%2)*2,3,100)}}
function skirtV(g,p,st,lX,rX,t,back,sit){const c=p.skirt,d=mix(c,'#1E1622',.2);const top=-44,bot=sit?-30:-17;
  g.beginPath();g.moveTo(lX-6,top);g.lineTo(rX+6,top);g.lineTo(rX+11,bot);g.lineTo(lX-11,bot);g.closePath();g.fillStyle=clothGrad(g,c,lX-11,rX+11);g.fill();
  g.save();g.globalAlpha=.25;for(let k=1;k<4;k++){const x0=lX-6+(rX-lX+12)*k/4,x1=lX-11+(rX-lX+22)*k/4;ln(g,x0,top+2,x1,bot,d,1)}g.restore();ln(g,lX-11,bot,rX+11,bot,d,1.2)}
/* 셔츠(줄무늬·체크·데님 칼라)와 원피스 허리 리본 */
function shirtV(g,p,st,hw,t,back){
  g.save();g.beginPath();g.moveTo(-hw+st,-76);g.lineTo(hw+st,-76);g.lineTo(hw+2+st,-36);g.lineTo(-hw-2+st,-36);g.closePath();g.clip();
  const lc=mix(p.tee,p.shirtL||'#4A6A9A',.55);
  if(p.shirt==='stripe'){g.globalAlpha=.55;for(let x=-hw-2;x<hw+4;x+=4.2)ln(g,x+st,-78,x+st+1,-34,lc,1.3)}
  else if(p.shirt==='check'){g.globalAlpha=.35;for(let x=-hw-2;x<hw+4;x+=7)ln(g,x+st,-78,x+st,-34,lc,2.4);for(let y=-74;y<-34;y+=7)ln(g,-hw-3+st,y,hw+3+st,y,lc,2.4)}
  g.restore();
  if(p.dress){rr(g,-hw-1+st,-44.5,2*hw+2,3.2,1.5,mix(p.tee,'#FFFFFF',.35));if(!back){el(g,st+t*5+6,-43,3,2,mix(p.tee,'#8A5A6A',.25),.4);el(g,st+t*5+11,-43,3,2,mix(p.tee,'#8A5A6A',.25),-.4)}}
  if(p.shirt&&!back){const cx=st+t*5,cc=p.shirt==='denim'?mix(p.tee,'#FFFFFF',.25):'#FBF8F2';poly(g,[cx-10,-78,cx-.5,-77,cx-5,-69],cc);poly(g,[cx+10,-78,cx+.5,-77,cx+5,-69],cc);
    for(const yy of [-66,-58,-50,-42])el(g,cx+.2,yy,1.1,1.1,p.shirt==='denim'?'#E2C27A':'#E8E2D6');ln(g,cx,-70,cx,-37,mix(p.tee,'#000',.14),.7)}
}
/* 휴대폰·책 (캠퍼스 사람 동작) */
function poseProp(g,p,x,y,side){
  if(p.pose==='phone'){const px=side?x-2:x+4,py=side?y-10:y-9;rr(g,px-3,py-5,6.2,10,1.4,'#2A2A33');rr(g,px-2.1,py-4,4.4,7.4,.8,'#9CC8F0');el(g,px-.5,py-2,1.2,.6,'rgba(255,255,255,.7)')}
  else if(p.pose==='read'){const c=p.bookC||'#C9546A';if(side){rr(g,x-4,y-7,9,12,1,c);rr(g,x-3,y-6,7,10,.6,'#FBF6EA')}else{rr(g,x-13,y-3,26,12,1.5,c);rr(g,x-12,y-2.5,11.5,10.5,.8,'#FBF6EA');rr(g,x+.5,y-2.5,11.5,10.5,.8,'#F6F0E2');g.strokeStyle='rgba(120,100,90,.35)';g.lineWidth=.6;for(let k=0;k<3;k++){ln(g,x-10,y+.5+k*2.5,x-3,y+.5+k*2.5,'rgba(120,100,90,.35)',.6);ln(g,x+3,y+.5+k*2.5,x+10,y+.5+k*2.5,'rgba(120,100,90,.35)',.6)}}}
}
/* 몸 전체가 움직이는 동작: 스트레칭(옆구리 늘리기)·줄넘기(점프+줄)·눕기(돗자리) */
function drawChar(g,x,y,p,dir,phase,moving,glasses,work,sit){
  const po=p&&p.pose;
  if(!po||(po!=='stretch'&&po!=='rope'&&po!=='lie')||(BAKE&&BAKE.onChar))return drawChar0(g,x,y,p,dir,phase,moving,glasses,work,sit);
  if(po==='lie'){const s=(p.sc||1);g.save();g.translate(x-2,y-6);g.rotate(-Math.PI/2);g.scale(.8,.8);g.translate(-x,-(y-17*s));drawChar0(g,x,y,{...p,pose:null},0,0,false,glasses,false,false);g.restore();return}
  const f=(p.pf||0)&3,s=.25*(p.sc||1);
  if(po==='stretch'){const lean=[0,-.13,0,.13][f];g.save();g.translate(x,y);g.rotate(lean);g.translate(-x,-y);drawChar0(g,x,y,p,dir,phase,moving,glasses,work,sit);g.restore();return}
  const jump=[0,10,15,6][f]*s,hy=y+(-46)*s-jump,lx=x-38*s,rx=x+38*s;
  const rope=(front)=>{const ctl=[y-180*s-jump,2*(y+1.5)-hy,2*(y+1.5)-hy,y-120*s-jump][f];if((f===0||f===1)!==front)return;
    g.strokeStyle='#E8603C';g.lineWidth=.55;g.beginPath();g.moveTo(lx,hy);g.quadraticCurveTo(x,ctl,rx,hy);g.stroke()};
  rope(false);drawChar0(g,x,y-jump,p,dir,phase,moving,glasses,work,sit);rope(true);
  rr(g,lx-.7,hy-1.6,1.4,3.2,.6,'#F4F2EE');rr(g,rx-.7,hy-1.6,1.4,3.2,.6,'#F4F2EE');
  if(jump<1)el(g,x,y+.4,5*s*4,1.1*s*4,'rgba(80,55,50,.08)')}
function drawChar0(g,x,y,p,dir,phase,moving,glasses,work,sit){
  if(BAKE&&BAKE.onChar){BAKE.onChar({x,y,p,dir,phase,moving,glasses,work,sit});return}
  const an=typeof dir==='number'?dir:(DIR_ANG[dir]||0);let q=Math.round(an/(Math.PI/8));if(q<=-8)q=8;if(q>8)q-=16;
  const aq=Math.abs(q),kk=aq<=4?aq:8-aq;const t=kk/4;
  const side=aq===4,back=aq>4,flip=q<0;
  const po=p.pose,jog=po==='jog'&&moving,armUp=po==='stretch',armOut=po==='rope',readA=po==='read',phoneA=po==='phone';
  const sw=moving?Math.sin(phase):0,bob=moving?Math.abs(Math.cos(phase))*3.6*(jog?1.5:1):(CHT?CHT.bob:Math.sin(performance.now()/600+(x%7))*1.1),hs=moving?Math.sin(phase+1)*2.4:0,wk=work?(CHT?CHT.wk:Math.sin(performance.now()/90)*.18):0;
  const longSl=!!p.coat;
  const limb=(sx,sy,ua,fa,fs,col,sleeve,hand,handCol)=>{
    const armCol=longSl?sleeve:col;
    g.save();g.translate(sx,sy);g.scale(1,fs);g.rotate(ua);
    rr(g,-4.6,-1,9.2,17.5,4.6,armCol);g.translate(0,15.5);g.rotate(fa);rr(g,-4.1,-1.5,8.2,15,4.1,armCol);
    if(longSl){rr(g,-4.6,10,9.2,4,2,mix(sleeve,'#000',.12))}
    el(g,0,15,hand*.95,hand*1.1,handCol||col);el(g,hand*.55,13.5,hand*.35,hand*.5,mix(handCol||col,'#000',.06));
    g.restore();
    g.save();g.translate(sx,sy);g.scale(1,fs);g.rotate(ua);rr(g,-6.3,-4.5,12.6,13,6,sleeve);g.fillStyle='rgba(0,0,0,.06)';g.fillRect(-6.3,6.5,12.6,2);g.restore();
  };
  const f=p.style==='f',HL=p.hairHi,teeL=mix(p.tee,'#FFFFFF',.2),dark=mix(p.pants,'#000000',.18),style=hairStyleOf(p);
  const sleeveC=p.coat?p.coatC:p.tee;
  const sc=.25*(p.sc||1),slim=p.face==='slim',gl=glasses||p.glasses;
  const mf=!!p.mface;const headT=(hx)=>{if(slim){g.save();g.translate(hx,-102);g.scale(.92,.92);g.translate(-hx,98)}else if(mf){g.save();g.translate(hx,-77);g.scale(.92,.92);g.translate(-hx,77)}};const headR=()=>{if(slim||mf)g.restore()};
  g.save();g.translate(x,y);g.scale(sc*(flip?-1:1),sc);
  const H=hairGrad(g,p),SKG=skinGrad(g,p);
  el(g,0,0,26,6,'rgba(80,55,50,.16)');
  const shoe=(sx,sy,rot,col)=>{el(g,sx,sy,11,5.5,col,rot);el(g,sx,sy+2.6,11,2.2,mix(col,'#000',.18),rot);el(g,sx-3,sy-2,3.4,1.3,'rgba(255,255,255,.4)',rot)};
  if(side){
    if(p.h2)hair2SideBehind(g,p,H,bob,hs);else if(style==='long')rr(g,-24-Math.abs(hs),-116-bob-(slim?4:0),28,64*hmLen(p),14,H);
    if(!p.h2&&style==='pony'&&!(p.hm&&p.hm.twin)){g.save();g.translate(-18,-108-bob);g.rotate(.35+hs*.05);rr(g,-5,0,10,34,5,H);g.restore()}
    const a=sw*8;
    if(p.skirt){rr(g,-5+a,-22,9,20,4,p.legC||p.skinSh);el(g,3+a,-4,11,5,mix(p.shoe,'#000',.08));rr(g,-4-a,-22,9,20,4,p.legC||p.skin);shoe(4-a,-4,0,p.shoe)}
    else{rr(g,-7+a,-40,13,36,5,dark);el(g,3+a,-4,11,5,mix(p.shoe,'#000',.08));
      rr(g,-6-a,-40,13,36,5,clothGrad(g,p.pants,-6-a,7-a));shoe(4-a,-4,0,p.shoe)}
    g.translate(0,-bob);
    {const s2=-sw;if(jog)limb(-1,-71,-s2*1.05,-1.75,1,p.skinSh,mix(sleeveC,'#000',.1),4.6,p.skinSh);else if(armUp)limb(-1,-71,Math.PI+.12,0,1,p.skinSh,mix(sleeveC,'#000',.1),4.6,p.skinSh);else if(readA)limb(-1,-71,-.7,-.85,1,p.skinSh,mix(sleeveC,'#000',.1),4.6,p.skinSh);else limb(-1,-71,work?-.7:-s2*.55,work?-.85:-(.12+.3*Math.max(0,s2)),1,p.skinSh,mix(sleeveC,'#000',.1),4.6,p.skinSh)}
    if(p.pack)rr(g,-26,-74,12,30,5,p.packC||'#E3A04A');
    if(p.bag){ln(g,-8,-76,6,-46,mix(p.bagC||'#9C6B4C','#000',.2),2.4);rr(g,-2,-50,12,13,3,p.bagC||'#9C6B4C')}
    const tb=p.coat?(p.coat==='trench'?-26:-34):-36;
    poly(g,[-16,-76,14,-76,p.coat?18:16,tb,p.coat?-20:-18,tb],clothGrad(g,p.coat?p.coatC:p.tee,-20,18));g.fillStyle=p.coat?mix(p.coatC,'#000',.12):p.teeSh;g.fillRect(-18,tb-6,34,p.coat?3:6);
    if(p.coat==='trench')rr(g,-20,-47,38,5,2,mix(p.coatC,'#8A5A3A',.3));
    if(p.skirt){g.beginPath();g.moveTo(-16,-40);g.lineTo(14,-40);g.lineTo(18,-17);g.lineTo(-20,-17);g.closePath();g.fillStyle=clothGrad(g,p.skirt,-20,18);g.fill()}
    apronV(g,p,0,0,0,false,true);
    if(p.scarf){rr(g,-14,-80,28,9,4.5,p.scarf);rr(g,-18,-74,7,15,3,p.scarf)}
    if(slim)rr(g,-4,-90,9,18,3,p.skinSh);else rr(g,-5,-84,10,10,3,p.skinSh);
    if(jog)limb(0,-71,-sw*1.05,-1.75,1,p.skin,sleeveC,4.8,p.skin);else if(armUp)limb(0,-71,Math.PI-.12,0,1,p.skin,sleeveC,4.8,p.skin);else if(readA||phoneA)limb(0,-71,-.75,-.85,1,p.skin,sleeveC,4.8,p.skin);else limb(0,-71,work?-.75+wk:-sw*.55,work?-.85:-(.12+.3*Math.max(0,sw)),1,p.skin,sleeveC,4.8,p.skin);
    if(!back&&(phoneA||readA))poseProp(g,p,14,-50,true);
    headT(2);
    if(slim){el(g,1,-101,20,21,SKG);g.beginPath();g.moveTo(-14,-94);g.quadraticCurveTo(-2,-76,14,-76.5);g.quadraticCurveTo(23,-77,23,-85);g.quadraticCurveTo(24,-92,21,-100);g.lineTo(0,-106);g.closePath();g.fillStyle=SKG;g.fill();g.strokeStyle=p.skinSh;g.globalAlpha=.4;g.lineWidth=1.1;g.beginPath();g.moveTo(-6,-86);g.quadraticCurveTo(2,-78,15,-77.3);g.stroke();g.globalAlpha=1;el(g,24,-93,2.6,2.6,p.skin)}
    else{el(g,4,-98,22,24,SKG);el(g,25,-93,3.2,3,p.skin)}
    if(p.h2)hair2Side(g,p,H,HL,bob,slim);
    else if(style==='bald'){el(g,-8,-96,14,12,H);el(g,2,-112,14,8,'rgba(255,255,255,.2)');hairModSide(g,p,H,HL,bob)}
    else{
      el(g,-6,-100,20,24,H);
      g.beginPath();g.moveTo(-22,-96);g.bezierCurveTo(-24,-126,26,-130,24,-102);g.bezierCurveTo(18,-104,10,-101,5,-105);g.bezierCurveTo(1,-98,-6,-94,-7,-82);g.lineTo(-22,-82);g.closePath();g.fillStyle=H;g.fill();
      if(style==='long'||style==='bob')rr(g,-12,-104,12,style==='bob'?30:46,6,H);else el(g,-1,-94,4,5.5,p.skinSh);
      if(style==='bun'){el(g,-10,-124,10,9,p.hair);if(p.hairpin)ln(g,-18,-127,-2,-121,'#C9A24A',1.4)}
      if(style==='curly'||p.perm)for(let k=0;k<5;k++)el(g,-16+k*8,-120+Math.abs(k-2)*2,5.5,5.5,H);
      g.strokeStyle=HL;g.lineWidth=2;g.beginPath();g.moveTo(-10,-118);g.quadraticCurveTo(4,-124,16,-114);g.stroke();
      hairShine(g,2,-124,13,'#FFFFFF');hairModSide(g,p,H,HL,bob);
    }
    const ex=p.expr||'smile';
    if(ex==='sleepy'){g.strokeStyle=EYE;g.lineWidth=1.6;g.beginPath();g.arc(14,-93,3,Math.PI*1.1,Math.PI*1.9);g.stroke()}else eyeV(g,14,-94,.82,p,false);
    if(f){g.strokeStyle=EYE;g.lineWidth=1.4;g.beginPath();g.arc(14,-94.4,4,Math.PI*1.2,Math.PI*1.9);g.stroke();ln(g,17.4,-96.4,19,-97.8,EYE,1)}else ln(g,11,-102,17,-102.6,p.browC||CO.brow,1.8);
    if(p.blush!==false){g.globalAlpha=.38;el(g,12,-85,3,1.8,CO.blush);g.globalAlpha=1}
    g.strokeStyle=f?'#D9788A':CO.mouth;g.lineWidth=1.5;g.beginPath();g.arc(19,-85,2.2,Math.PI*.1,Math.PI*.7);g.stroke();
    if(gl||p.acc==='glasses'){const GS=glsSpec(gl,p),gold=GS.round;if(gold){g.beginPath();g.ellipse(14.5,-94,6,6.5,0,0,7)}else rr(g,7.5,-100,14,12,4.5);g.fillStyle=GS.lens;g.fill();g.strokeStyle=GS.f;g.lineWidth=GS.lw;g.stroke();ln(g,8,-96,-5,-98,GS.f,gold?1.2:2)}
    if(p.pin==='band'){g.strokeStyle='#B9A2E0';g.lineWidth=4;g.beginPath();g.arc(2,-100,23,Math.PI*1.15,Math.PI*1.75);g.stroke()}else if(p.pin){const px=-6,py=-118;if(p.pin==='pearl'){for(let k=0;k<3;k++){el(g,px-4+k*4,py+k*.6,1.9,1.9,'#FBF7EF');el(g,px-4.5+k*4,py-.5+k*.6,.6,.6,'#FFFFFF')}}else if(p.pin==='ribbon'){el(g,px-4,py,5,3.5,'#EE7F9C',-.4);el(g,px+4,py-1,5,3.5,'#EE7F9C',.4);el(g,px,py,2,2,'#C65C79')}else if(PINX[p.pin]){PINX[p.pin](g,px,py)}else{const pc=p.pin==='yflower'?'#F9D66B':'#FFFFFF';for(let k=0;k<5;k++){const an=k*Math.PI*2/5;el(g,px+Math.cos(an)*3.2,py+Math.sin(an)*3.2,2.5,2.5,pc)}el(g,px,py,2,2,'#F5CF4E')}}
    hatV(g,p,2,.9,false);
    headR();
  }else{
    const bw=1-.4*t,st=t*6,hx=st+t*5;
    if(!back){headT(hx);if(p.h2)hair2Behind(g,p,H,hx-t*5+hs*.4,t,bob);else hairBack(g,p,H,hx-t*5+hs*.4,style,bob);headR()}
    const lA=sw>0?sw*7:0,lB=sw<0?-sw*7:0;
    const lX=-9*bw+st,rX=9*bw+st;
    if(p.skirt){
      const legL=p.legC||p.skin;
      if(sit){if(!back){shoe(lX,-26,0,p.shoe);shoe(rX,-26,0,p.shoe)}}
      else{rr(g,lX-4.5,-22-lA-t*2,9,20,4,t>0?mix(legL,'#000',.08):legL);shoe(lX+t*2,-4-lA-t*2,t*.5,p.shoe);rr(g,rX-4.5,-22-lB,9,20,4,legL);shoe(rX+t*3,-4-lB,t*.5,p.shoe)}
    }else if(sit){rr(g,lX-7,-42,14,back?10:16,5,p.pants);rr(g,rX-7,-42,14,back?10:16,5,p.pants);if(!back){shoe(lX,-26,0,p.shoe);shoe(rX,-26,0,p.shoe)}}
    else{rr(g,lX-7,-40-lA-t*2,14,36,5,t>0?dark:clothGrad(g,p.pants,lX-7,lX+7));shoe(lX+t*2,-4-lA-t*2,t*.5,p.shoe);rr(g,rX-7,-40-lB,14,36,5,clothGrad(g,p.pants,rX-7,rX+7));shoe(rX+t*3,-4-lB,t*.5,p.shoe)}
    g.translate(0,-bob);
    const hw=21*(1-.34*t);const farBehind=t>=.5;
    const armFB=(sd,s,col,sleeve,handCol)=>{
      const sx=sd<0?-hw+.5+st+t*7:hw-.5+st;
      if(work||readA||(phoneA&&sd>0)){limb(sx,-71,sd<0?.1:-.1-t*.4,sd<0?-1.25-(readA?0:wk):1.25+(readA?0:wk),.85,col,sleeve,5,handCol);return}
      if(jog){const f2=Math.max(0,sd<0?s:-s);limb(sx,-71+f2*1.5,(sd<0?.32:-.32)-s*.3*t,(sd<0?-1:1)*(1.4+.25*f2),1-.3*f2,col,sleeve,5,handCol);return}
      if(armUp){limb(sx,-71,sd<0?Math.PI-.55:Math.PI+.55,sd<0?.25:-.25,1,col,sleeve,5,handCol);return}
      if(armOut){limb(sx,-71,sd<0?.45:-.45,sd<0?.35:-.35,1,col,sleeve,5,handCol);return}
      const fwd=Math.max(0,s),bk=Math.max(0,-s);
      const fs=1-.22*fwd-.08*bk,hand=5+1.1*fwd*(back?-.5:1);
      let ua=(sd<0?.08:-.08)-s*.42*t,fa=(sd<0?-1:1)*(.1+.28*fwd)-(t>0?.2*fwd*t:0);
      limb(sx,-71+fwd*1.5,ua,fa,fs,col,sleeve,hand,handCol);
    };
    const sL=-sw,sR=sw;
    if(farBehind)armFB(-1,sL,p.skinSh,mix(sleeveC,'#000',.1),p.skinSh);
    if(p.skirt&&!sit)skirtV(g,p,st,lX,rX,t,back,sit);
    poly(g,[-hw+st,-76,hw+st,-76,hw+2+st,-36,-hw-2+st,-36],clothGrad(g,p.tee,-hw-2+st,hw+2+st));
    g.fillStyle=p.teeSh;g.fillRect(-hw-2+st,-42,2*hw+4,6);if(!back){g.fillStyle=teeL;g.fillRect(-hw+4+st+t*4,-72,5,24);
      if(!p.coat&&!p.scarf&&!p.shirt){g.strokeStyle=mix(p.tee,'#000',.22);g.lineWidth=1.3;g.beginPath();g.arc(st+t*5,-78,7-t*2,Math.PI*.15,Math.PI*.85);g.stroke()}}
    if(p.skirt&&sit)skirtV(g,p,st,lX,rX,t,back,sit);
    if(p.shirt||p.dress)shirtV(g,p,st,hw,t,back);else if(p.top)topV(g,p,st,hw,t,back);
    if(t>0){g.fillStyle='rgba(0,0,0,.06)';g.fillRect(back?hw-6+st:-hw+st,-76,6,40)}
    coatBodyV(g,p,st,hw,t,back);
    apronV(g,p,st,hw,t,back,false);
    bagV(g,p,st,hw,t,back);
    if(!farBehind)armFB(-1,sL,back?p.skinSh:p.skin,sleeveC,back?p.skinSh:p.skin);
    armFB(1,sR,back?p.skinSh:p.skin,sleeveC,back?p.skinSh:p.skin);
    propV(g,p,st,hw,t,back);
    if(!back&&(phoneA||readA))poseProp(g,p,st+t*6,-52,false);
    if(slim)rr(g,-4.5+st,-90,9,18,3,p.skinSh);else rr(g,-5+st,-84,10,10,3,p.skinSh);
    scarfV(g,p,st,hw,t,back);accV(g,p,st,hw,t,back);
    headT(hx);
    if(back){
      if(p.pack)rr(g,-15+st-t*4,-74,30*(1-.2*t),30,8,p.packC||'#E3A04A');
      if(p.h3){}else if(t>0){el(g,22+hx,-96,4.5,6,p.skinSh);el(g,16+hx+t*4,-90,3+t*5,8+t*4,p.skin)}else{el(g,-23,-96,4.5,6,p.skinSh);el(g,23,-96,4.5,6,p.skinSh)}
      /* 등 번호는 머리보다 먼저 그려요(긴 머리가 번호를 덮도록) */
      if(p.num&&!p.coat){g.save();if(flip)g.scale(-1,1);const tx=(flip?-1:1)*(st-t*6);g.fillStyle='#FFFFFF';g.textAlign='center';g.textBaseline='alphabetic';
        g.save();g.translate(tx,0);g.scale(1-.3*t,1);
        if(f){g.font="8px 'Jua','Gowun Dodum',sans-serif";g.fillText(p.jersey||p.name,0,-50);g.font="bold 12px 'Jua','Gowun Dodum',sans-serif";g.fillText(p.num,0,-39)}
        else{g.font="9px 'Jua','Gowun Dodum',sans-serif";g.fillText(p.jersey||p.name,0,-60);g.font="bold 17px 'Jua','Gowun Dodum',sans-serif";g.fillText(p.num,0,-44)}
        g.restore();g.restore()}
      if(p.h2)hair2Rear(g,p,H,HL,hx,t);
      else if(style==='bald'){el(g,hx,-99,25,25,p.skin);el(g,hx,-94,26,12,H);el(g,hx-4,-112,10,5,'rgba(255,255,255,.22)')}
      else{el(g,hx-t*2,-99,26-t*2,26,H);
        if(style==='long'){rr(g,-27+hx-t*3+hs,-118,54-t*6,58,20,H);g.save();g.globalAlpha=.16;for(let k=-3;k<=3;k++)ln(g,hx+k*6+hs,-104,hx+k*6.8+hs,-64,'#000',1);g.restore()}
        if(style==='bob')rr(g,-27+hx-t*3,-116,54-t*6,40,18,H);
        if(style==='pony'&&!(p.hm&&p.hm.twin)){el(g,hx,-110,8,6,mix(p.hair,'#E07A7A',.5));g.save();g.translate(hx-t*3,-108);g.rotate(hs*.04);rr(g,-6,0,12,38,6,H);g.restore()}
        if(style==='bun'){el(g,hx,-124,11,10,p.hair);el(g,hx,-122,9,6,mix(p.hair,'#000',.08));if(p.hairpin){ln(g,hx-9,-128,hx+10,-121,'#C9A24A',1.4);el(g,hx+10,-121,1.6,1.6,'#E07A7A')}}
        if(style==='curly')for(let k=0;k<8;k++){const a=Math.PI*(1.05+k*.12);el(g,hx+Math.cos(a)*24,-99+Math.sin(a)*24,6,6,H)}
        if(p.perm)for(let k=0;k<5;k++){const a=Math.PI*(1.2+k*.15);el(g,hx+Math.cos(a)*23,-100+Math.sin(a)*23,4.6,4.2,H)}
        g.strokeStyle=HL;g.lineWidth=2;g.beginPath();g.moveTo(-12+hx,-116);g.quadraticCurveTo(hx,-124,12+hx,-116);g.stroke();hairShine(g,hx,-124,13,'#FFFFFF')}
      if(!p.h2)hairModBack(g,p,H,HL,hx,t,style);
      pinV(g,p,hx,t,true);hatV(g,p,hx,t,true);
    }else{
      if(p.pack){ln(g,-12+st,-76,-10+st,-50,mix(p.packC||'#E3A04A','#000',.15),3);ln(g,12+st,-76,10+st,-50,mix(p.packC||'#E3A04A','#000',.15),3)}
      if(p.h3){}else if(t>0)el(g,-22+hx+t*6,-96,4.5,6,p.skinSh);else{el(g,-(f?22:25),-96,4.5,6,p.skinSh);el(g,f?22:25,-96,4.5,6,p.skinSh);el(g,-(f?22:25),-96,2.2,3.2,mix(p.skinSh,'#CC7777',.2));el(g,f?22:25,-96,2.2,3.2,mix(p.skinSh,'#CC7777',.2))}
      if(slim)slimHead(g,hx,t,SKG,p.skinSh);else if(mf)maleHead(g,hx,t,SKG,p.skinSh);else el(g,hx,-98,(f?22:25)*(1-.14*t),f?25:23,SKG);
      if(p.h2)hair2Front(g,p,H,HL,hx,t,f);else hairFrontV(g,p,H,HL,hx,t);earV(g,p,f,hx,t);
      faceV(g,p,gl,hx+t*7,t);
      pinV(g,p,hx,t,false);hatV(g,p,hx,t,false);
    }
    headR();
  }
  g.restore();
}

/* =========================================================
   토토(고양이)·강아지 그리기 v2 — 윤기·무늬·표정 강화
   내부 설계 크기(키 약 45)로 그리고 0.22배로 줄여서 월드에 맞춤
   ========================================================= */
function lgr(g,x0,y0,x1,y1,a,b){const q=g.createLinearGradient(x0,y0,x1,y1);q.addColorStop(0,a);q.addColorStop(1,b);return q}
function drawCat(g,c){
  const flip=c.dir==='left'||c.dir==='ul'||c.dir==='dl',side=c.dir==='left'||c.dir==='right'||c.dir==='ul'||c.dir==='ur'||c.dir==='dl'||c.dir==='dr',back=c.dir==='up',t=performance.now()/1000;
  const CP=c.pal||{},G1=CP.G1||'#9A98A2',G2=CP.G2||'#B9B7C0',GD=CP.GD||'#6F6D77',W=CP.W||'#FAF8F4',PK='#F2B8C2',NS=CP.stripes===false,PAT=CP.patch||null,COL=CP.collar;
  const patch=(pts)=>{if(!PAT)return;pts.forEach(([x,y,rx,ry],k)=>el(g,x,y,rx,ry,PAT[k%PAT.length]))};
  g.save();g.translate(c.x,c.y);if(flip)g.scale(-1,1);g.scale(.22*(CP.sc||1),.22*(CP.sc||1));
  el(g,0,1,17,4.5,'rgba(80,55,50,.18)');
  const eyes=(ex,ey,happy)=>{if(happy){g.strokeStyle='#3E3A44';g.lineWidth=1.3;g.beginPath();g.arc(ex,ey+.8,2.6,Math.PI*1.1,Math.PI*1.9);g.stroke();return}
    el(g,ex,ey,3.1,3,'#E6AE2C');el(g,ex,ey-.4,2.6,2.3,lgr(g,0,ey-3,0,ey+3,'#FFE58A','#E0A82A'));el(g,ex,ey,.9,2.5,'#1E1A1A');el(g,ex-1,ey-1.2,.9,.9,'#FFFFFF')};
  if(c.state==='sleep'){
    // 동그랗게 말고 자는 모습
    el(g,0,-9,17,10,lgr(g,0,-19,0,1,G2,G1));for(const k of [-8,-2,4])ln(g,k,-17,k+3,-8,GD,1.2);
    el(g,9,-12,8.5,7,G2);P2(g,[3,-16,5,-24,9,-18],G1);P2(g,[10,-18,14,-24,15,-15],G1);P2(g,[4.5,-17.5,5.5,-22,7.8,-18.6],PK);
    el(g,11,-9.5,5,3.4,W);ln(g,7.5,-12.6,10,-12.2,'#3E3A44',1);ln(g,11.6,-12.2,14,-12.8,'#3E3A44',1);P2(g,[11.4,-10.6,12.6,-10.6,12,-9.8],'#E88A9A');
    g.strokeStyle=G1;g.lineWidth=5;g.lineCap='round';g.beginPath();g.arc(0,-8,15,.4,1.9);g.stroke();el(g,-6,-2,4,2.5,W);
    g.restore();g.fillStyle='#8A7F96';g.font="3px 'Jua',sans-serif";g.fillText('z',c.x+2+Math.sin(t*2),c.y-6-((t*4)%4));g.fillText('z',c.x+4+Math.sin(t*2+1),c.y-8-((t*4+2)%4));
    catHearts(g,c);return}
  const sit=c.state!=='walk',sw=c.mv?Math.sin(c.walk*1.4):0,tail=Math.sin(t*2.2);
  if(side){
    // 꼬리
    g.strokeStyle=G1;g.lineWidth=5;g.lineCap='round';g.beginPath();
    if(sit){g.moveTo(-8,-3);g.bezierCurveTo(-18,-2,-18,8,-4+tail,2)}else{g.moveTo(-13,-17);g.bezierCurveTo(-22,-20,-20,-34,-15+tail*2,-38)}g.stroke();
    if(!sit){for(const [lx,s] of [[-9,sw],[7,-sw]])rr(g,lx-2.2+s*2,-12,4.4,12,2.2,GD)}
    // 몸
    if(sit){g.beginPath();g.moveTo(-10,0);g.bezierCurveTo(-13,-16,-6,-26,4,-24);g.bezierCurveTo(10,-22,11,-10,9,0);g.closePath();g.fillStyle=lgr(g,0,-26,0,0,G2,G1);g.fill();
      if(!NS)for(const k of [-6,-2])ln(g,k,-22,k-2,-13,GD,1.2);patch([[-5,-16,4,5],[2,-22,3,3]]);el(g,6,-9,4,8,W);rr(g,3,-7,5,7,2.5,W);el(g,-4,-1,5,2.5,G1)}
    else{el(g,0,-16,15,8,lgr(g,0,-24,0,-8,G2,G1));if(!NS)for(const k of [-8,-3,2])ln(g,k,-23,k+2,-15,GD,1.2);patch([[-6,-18,5,4],[5,-20,4,3]]);el(g,4,-11,8,3.5,W);
      for(const [lx,s] of [[-7,-sw],[9,sw]]){rr(g,lx-2.2+s*2,-12,4.4,12,2.2,G1);el(g,lx+s*2,-.6,2.6,1.5,W)}}
    // 머리
    const hx=sit?8:15,hy=sit?-30:-24;
    el(g,hx,hy,9.5,8.5,lgr(g,0,hy-9,0,hy+8,G2,G1));
    P2(g,[hx-7,hy-4,hx-5,hy-14,hx,hy-7],G1);P2(g,[hx-5.6,hy-6,hx-4.8,hy-11.5,hx-1.8,hy-7],PK);P2(g,[hx+1,hy-7,hx+5,hy-15,hx+7,hy-5],G1);
    for(const k of [-2,1])ln(g,hx+k,hy-8,hx+k*.6,hy-4,GD,1);
    el(g,hx+5,hy+3,5,3.4,W);eyes(hx+3.5,hy-1.5,c.state==='groom');P2(g,[hx+8.4,hy+.6,hx+10,hy+.6,hx+9.4,hy+2],'#E88A9A');
    for(let k=0;k<2;k++)ln(g,hx+7,hy+3+k,hx+15,hy+1+k*2.4,'rgba(255,255,255,.95)',.45);
    if(COL!==null){rr(g,hx-6,hy+5,9,2.2,1.1,COL||'#7FB7D6');el(g,hx-1.5,hy+8,1.7,1.7,'#F2C94C')}
  }else if(back){
    g.strokeStyle=G1;g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(0,-8);g.bezierCurveTo(6,-14,10,-22,6+tail*2,-30);g.stroke();
    g.beginPath();g.moveTo(-12,0);g.bezierCurveTo(-15,-18,-10,-28,0,-28);g.bezierCurveTo(10,-28,15,-18,12,0);g.closePath();g.fillStyle=lgr(g,0,-28,0,0,G2,G1);g.fill();
    for(const k of [-6,-1,4])ln(g,k-1,-24,k+1,-10,GD,1.4);
    el(g,0,-34,11.5,10,lgr(g,0,-44,0,-24,G2,G1));P2(g,[-11,-38,-9,-49,-3,-42],G1);P2(g,[11,-38,9,-49,3,-42],G1);for(const k of [-4,0,4])ln(g,k,-43,k,-36,GD,1.2);
    if(COL!==null)rr(g,-6,-26,12,2.4,1.2,COL||'#7FB7D6');
    if(!sit){rr(g,-7+sw*1.5,-4,5,6,2.5,G1);rr(g,2-sw*1.5,-4,5,6,2.5,G1)}
  }else{
    // 정면(앉기·걷기·그루밍)
    g.strokeStyle=G1;g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(10,-6);g.bezierCurveTo(22,-6,24,-18,20+tail*2,-28);g.stroke();
    for(let k=0;k<3;k++){g.beginPath();g.arc(19+k*.8,-12-k*5.5,2.8,-.3,1.2);g.strokeStyle=GD;g.lineWidth=1.2;g.stroke()}
    g.beginPath();g.moveTo(-12,-2);g.bezierCurveTo(-15,-18,-10,-30,0,-30);g.bezierCurveTo(10,-30,15,-18,12,-2);g.closePath();g.fillStyle=lgr(g,0,-30,0,0,G2,G1);g.fill();
    if(!NS)for(const k of [-7,-2,3]){g.beginPath();g.moveTo(k-3,-24);g.quadraticCurveTo(k,-20,k-2,-15);g.strokeStyle=GD;g.lineWidth=1.3;g.stroke()}
    g.beginPath();g.moveTo(-6,-2);g.bezierCurveTo(-8,-14,-5,-22,0,-23);g.bezierCurveTo(5,-22,8,-14,6,-2);g.closePath();g.fillStyle=W;g.fill();
    patch([[-8,-18,4,5],[8,-12,3.5,4.5],[5,-24,3,2.5]]);
    const lift=c.state==='groom'?Math.max(0,Math.sin(t*5))*6:0;
    if(sit){rr(g,-7,-8-lift,5,8,2.5,W);rr(g,2,-8,5,8,2.5,W)}else{rr(g,-7,-8+sw*2,5,8,2.5,W);rr(g,2,-8-sw*2,5,8,2.5,W)}
    el(g,0,-36,12,10.5,lgr(g,0,-46,0,-26,G2,G1));
    P2(g,[-11,-40,-9,-51,-3,-44],G1);P2(g,[-9.6,-42,-8.6,-48.5,-5,-44],PK);P2(g,[11,-40,9,-51,3,-44],G1);P2(g,[9.6,-42,8.6,-48.5,5,-44],PK);
    if(!NS)for(const k of [-3,0,3])ln(g,k,-45,k*.6,-40.5,GD,1.1);if(PAT){el(g,-6,-41,4,3.2,PAT[0]);el(g,6.5,-40,3.4,3,PAT[1%PAT.length])}
    el(g,-3.4,-31.5,4.6,3.6,W);el(g,3.4,-31.5,4.6,3.6,W);el(g,0,-29,4,2.6,W);
    for(const ex of [-5.6,5.6])eyes(ex,-37,c.state==='groom');
    P2(g,[-1.4,-33.6,1.4,-33.6,0,-32],'#E88A9A');
    g.beginPath();g.moveTo(0,-32);g.quadraticCurveTo(-1.6,-30.4,-3,-31.2);g.moveTo(0,-32);g.quadraticCurveTo(1.6,-30.4,3,-31.2);g.strokeStyle='#6E5A5E';g.lineWidth=.7;g.stroke();
    for(const d of [-1,1])for(let k=0;k<3;k++)ln(g,d*5,-31.5+k,d*(13+k),-33+k*2,'rgba(255,255,255,.95)',.45);
    el(g,-8.5,-33,2,1.1,'rgba(240,130,150,.3)');el(g,8.5,-33,2,1.1,'rgba(240,130,150,.3)');
    if(COL!==null){rr(g,-6,-27,12,2.4,1.2,COL||'#7FB7D6');el(g,0,-24.3,1.8,1.8,'#F2C94C')}
  }
  g.restore();catHearts(g,c);
}
function catHearts(g,c){const hs=(performance.now()-(c.hearts||0))/1000;if(hs<2.2||c.talking){for(let k=0;k<3;k++){const p=((hs*.8+k/3)%1);g.globalAlpha=1-p;const hx=c.x-3+k*3,hy=c.y-14-p*10;el(g,hx-.6,hy,.8,.8,'#E0708C');el(g,hx+.6,hy,.8,.8,'#E0708C');poly(g,[hx-1.4,hy+.2,hx+1.4,hy+.2,hx,hy+1.8],'#E0708C');g.globalAlpha=1}}}
/* 강아지 하트: 말을 걸면 2초쯤 강아지 머리 위로 하트가 뿅뿅 */
function dogHeartOn(d){return d&&d.hearts&&performance.now()-d.hearts<2200}
function dogHearts(g,d){if(!dogHeartOn(d))return;const hs=(performance.now()-d.hearts)/1000;for(let k=0;k<3;k++){const p=((hs*.8+k/3)%1);g.globalAlpha=1-p;const hx=d.x-3+k*3,hy=d.y-10-p*9;el(g,hx-.6,hy,.8,.8,'#E0708C');el(g,hx+.6,hy,.8,.8,'#E0708C');poly(g,[hx-1.4,hy+.2,hx+1.4,hy+.2,hx,hy+1.8],'#E0708C');g.globalAlpha=1}}
function drawDog(g,d){
  const dir=d.dir,flip=dir==='left'||dir==='ul'||dir==='dl',sw=d.mv?Math.sin(d.walk*1.4):0,c=d.col,dk=mix(c,'#1E1622',.28),lt=mix(c,'#FFFFFF',.18),t=performance.now()/1000;
  const black=c==='#2A2626',chest=black?'#F4F1EC':mix(c,'#FFFFFF',.55),collar=d.collar||(black?'#D8534F':'#5E9BD6');
  const side=dir==='left'||dir==='right'||dir==='dl'||dir==='dr'||dir==='ul'||dir==='ur';
  g.save();g.translate(d.x,d.y);if(flip)g.scale(-1,1);g.scale(.22,.22);
  el(g,0,1,17,4.5,'rgba(80,55,50,.18)');
  const shine=(x,y,rx,ry,r)=>{g.save();g.globalAlpha=black?.35:.25;el(g,x,y,rx,ry,'#FFFFFF',r);g.restore()};
  if(side){
    const wag=Math.sin(t*9)*.5;
    g.save();g.translate(-13,-20);g.rotate(-.7+wag);g.strokeStyle=c;g.lineWidth=4;g.lineCap='round';g.beginPath();g.arc(2,-4,5,Math.PI*.9,Math.PI*2.2);g.stroke();g.restore();
    for(const [lx,s] of [[-8,sw],[7,-sw]])rr(g,lx-2.4+s*2.4,-12,4.8,12,2.4,dk);
    el(g,0,-16,14,9,lgr(g,0,-25,0,-7,lt,c));el(g,8,-13,5,6,chest);shine(-3,-21,6,2,-.1);
    for(const [lx,s] of [[-6,-sw],[9,sw]]){rr(g,lx-2.4+s*2.4,-12,4.8,12,2.4,c);el(g,lx+s*2.4,-.5,3,1.6,dk)}
    el(g,14,-26,10,9,lgr(g,0,-35,0,-17,lt,c));
    el(g,21,-24,6.5,4.6,black?'#4A4244':mix(c,'#FFFFFF',.35));el(g,26.5,-25.5,2.4,1.9,'#111');el(g,26,-26.2,.8,.5,'rgba(255,255,255,.8)');
    el(g,17,-29,2.3,2.6,'#0E0B0C');el(g,16.3,-30,1,1,'#FFFFFF');
    g.save();g.translate(9,-31);g.rotate(.5+Math.sin(t*3)*.08);el(g,0,6,4.6,8,dk);g.restore();
    el(g,20,-20.6,1.8,1.4,'#E77C8C');shine(11,-32,4,1.5,-.3);
    rr(g,6,-22,4,8,2,collar);el(g,9,-15,1.8,1.8,'#F2C94C');
  }else if(dir==='up'){
    const wag=Math.sin(t*9)*.5;
    for(const lx of [-7,4])rr(g,lx-.5+sw*1.5,-10,5,10,2.5,dk);
    el(g,0,-14,12,11,lgr(g,0,-25,0,-3,lt,c));
    g.save();g.translate(0,-22);g.rotate(wag);g.strokeStyle=c;g.lineWidth=4;g.lineCap='round';g.beginPath();g.arc(3,-4,5,Math.PI*.9,Math.PI*2.2);g.stroke();g.restore();
    el(g,0,-30,11.5,10,lgr(g,0,-40,0,-20,lt,c));g.save();g.translate(-10,-34);g.rotate(.35);el(g,0,6,4.4,8,dk);g.restore();g.save();g.translate(10,-34);g.rotate(-.35);el(g,0,6,4.4,8,dk);g.restore();
    shine(-3,-36,5,1.8,-.3);rr(g,-8,-22,16,3.4,1.7,collar);
  }else{
    g.save();g.translate(12,-18);g.rotate(Math.sin(t*6)*.25);g.beginPath();g.arc(3,-4,5,Math.PI*.9,Math.PI*2.3);g.strokeStyle=c;g.lineWidth=4;g.lineCap='round';g.stroke();g.restore();
    el(g,0,-14,13,12,lgr(g,0,-26,0,0,lt,c));el(g,0,-12,5.5,6.5,chest);
    rr(g,-10,-9+(d.mv?sw*1.5:0),6,9,3,c);rr(g,4,-9-(d.mv?sw*1.5:0),6,9,3,c);el(g,-7,-.8,3.4,1.8,dk);el(g,7,-.8,3.4,1.8,dk);
    el(g,0,-31,12.5,11,lgr(g,0,-42,0,-20,lt,c));
    g.save();g.translate(-10,-37);g.rotate(.35+Math.sin(t*3)*.05);el(g,0,6,4.6,8,dk);g.restore();
    g.save();g.translate(10,-37);g.rotate(-.35-Math.sin(t*3)*.05);el(g,0,6,4.6,8,dk);g.restore();
    shine(-3,-38,6,2,-.3);shine(-5,-21,5,1.6,-.4);
    el(g,0,-27,6.2,4.6,black?'#4A4244':mix(c,'#FFFFFF',.35));el(g,0,-29.5,2.6,1.9,'#111');el(g,-.8,-30.2,.9,.6,'rgba(255,255,255,.8)');
    g.beginPath();g.moveTo(-2.4,-25.8);g.quadraticCurveTo(0,-24,2.4,-25.8);g.strokeStyle='#111';g.lineWidth=.8;g.stroke();el(g,0,-23.6,1.8,1.6,'#E77C8C');
    for(const ex of [-5.2,5.2]){el(g,ex,-33,2.4,2.7,'#0E0B0C');el(g,ex-.8,-34,1,1.1,'#FFFFFF');el(g,ex+.7,-32.2,.45,.45,'rgba(255,255,255,.8)')}
    el(g,-8,-28.5,2,1.2,'rgba(240,120,140,.28)');el(g,8,-28.5,2,1.2,'rgba(240,120,140,.28)');
    rr(g,-9,-22.5,18,3.6,1.8,collar);for(let k=-7;k<8;k+=3.5)el(g,k,-20.7,.5,.5,'#F7C5A8');el(g,0,-17.2,2.6,2.6,'#F2C94C');el(g,-.6,-17.8,.8,.6,'rgba(255,255,255,.7)');
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



