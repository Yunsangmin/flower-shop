'use strict';
/* 우리 둘의 꽃집 — 4-ui.js : 꽃다발 그림(창)·창·화면·HUD
   (파일은 index.html 에 적힌 순서대로 불러와요. 앞 파일의 함수·변수를 뒤 파일이 이어서 씀) */
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
    if(s.t==='gyp')gypS+=imgHead('gyp',hx,hy-2+w*4,15,(rr()-.5)*40,w,Math.floor(rr()*8));
    else if(s.t==='tulip')heads+=imgHead('tulip',hx,hy+w*6,12,(hx-bx)*.35+dir*w*38,w);
    else if(s.t==='rose'||s.t==='hydrangea')heads+=fHeadSVG(s.t,hx,hy+w*6,s.t==='rose'?21:27,w,false);
    else heads+=imgHead('freesia',hx+(hx>=bx?6:-6),hy-6+w*6,17,(hx>=bx?10:-60)+(rr()-.5)*20,w);
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
    talkPrep(i,m);if(m.shown==null)m.shown=0;const L=m.line||'';const M=w.main?MAIN[w.main]:null;const NC2=M?M.nc:NC;const who2=M?M.who:who;
    const hearts=M?`<small class="thearts">${heartsTxt(bondOf(w.main).h)}</small>`:'';
    const pg=m.pages&&m.pages.length>1?`<span class="tpage">${Math.min(m.page+1,m.pages.length)}/${m.pages.length}</span>`:'';
    const ch=m.choose&&m.shown>=L.length?`<div class="tchoices">${m.choose.opts.map((o,k)=>`<button class="btn ${k?'soft':'primary'}" data-a="tchoice" data-v="${k}">${esc(o[0])}</button>`).join('')}</div>`:'';
    h=`<div class="talkbox" data-a="close" role="button" tabindex="0" aria-label="${esc(w.name)}: ${esc(L)}"><span class="talkwho who p${i}">${PAL[i].name}</span><span class="talkname" style="--nc:${NC2[0]};--ncd:${NC2[1]}">${esc(w.name)}${who2?`<small>${who2}</small>`:''}${hearts}</span><div class="talkface"><canvas id="tface${i}" width="160" height="160"></canvas></div><div class="talktext"><span class="tshown">${esc(L.slice(0,m.shown))}</span><span class="ghost">${esc(L.slice(m.shown))}</span>${ch}</div>${pg}<span class="talkhint">${m.choose?'골라 주세요':'행동 버튼'}</span><i class="talknext"${m.shown<L.length||m.choose?' style="opacity:0"':''}></i></div>`;
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
/* 여러 장 대화: 효과(선물·예약)는 건너뛰며 적용, 질문은 선택지 */
function talkPrep(i,m){if(!m.pages)m.pages=[m.line||''];if(m.page==null)m.page=0;
  while(m.page<m.pages.length){const P=m.pages[m.page];if(P&&typeof P==='object'&&(P.gift||P.order)){if(!P._done){P._done=1;storyEffect(i,m.key,P)}m.page++;continue}break}
  const P=m.pages[m.page];if(P==null){m.line='';m.choose=null;return}
  if(typeof P==='object'&&P.ask){m.choose=P;m.line=fillTxt(P.ask,i,m.key)}else{m.choose=null;m.line=fillTxt(String(P),i,m.key)}}
function talkNext(i){const c=S.chars[i],m=c.modal;if(!m||m.type!=='talk')return;if(m.choose)return;
  m.page++;m.shown=0;talkPrep(i,m);if(m.page>=m.pages.length){talkEnd(i);return}renderModal(i)}
function talkEnd(i){const m=S.chars[i].modal;if(!m)return;const w=m.walker;
  if(m.story&&m.key&&!m._fin){m._fin=1;storyDone(i,m.key);toastAll(`${josa(MAIN[m.key].name,'과','와')} 한층 가까워졌어요 ♥`)}
  else if(m.gained&&m.key)toast(i,`${josa(MAIN[m.key].name,'과','와')} 조금 더 친해졌어요 ♥`);
  closeModal(i);sfx('close')}
function talkChoose(i,k){const m=S.chars[i].modal;if(!m||!m.choose)return;const P=m.choose,o=P.opts[+k];if(!o)return;
  if(P.key&&m.key)bondOf(m.key).mem[P.key]=o[0];m.pages.splice(m.page+1,0,...o[1]);m.choose=null;m.page++;m.shown=0;talkPrep(i,m);sfx('tap');renderModal(i)}
function talkTypeStep(i,m){const el=modalEl(i);const L=m.line||'';const a=el.querySelector('.tshown'),b=el.querySelector('.talktext .ghost'),n=el.querySelector('.talknext');
  if(a)a.textContent=L.slice(0,m.shown);if(b)b.textContent=L.slice(m.shown);if(n)n.style.opacity=m.shown>=L.length?1:0}
function startTalkType(i){const c=S.chars[i],m=c.modal;if(!m||m.type!=='talk')return;const L=m.line||'';if(m.raf)cancelAnimationFrame(m.raf);if(m.shown>=L.length)return;
  let last=performance.now(),acc=0,k=0;const step=now=>{if(c.modal!==m)return;acc+=(now-last)/1000*34;last=now;
    const add=Math.floor(acc);if(add>0){acc-=add;const was=m.shown;m.shown=Math.min(L.length,m.shown+add);for(let j=was;j<m.shown;j++){if(L[j]!==' '&&(k++%2===0))sfx('blip')}talkTypeStep(i,m)}
    if(m.shown<L.length)m.raf=requestAnimationFrame(step);else{m.raf=null;if(m.choose)renderModal(i)}};
  m.raf=requestAnimationFrame(step)}
function talkSkip(i){const m=S.chars[i].modal;if(m&&m.type==='talk'&&(m.shown||0)<(m.line||'').length){m.shown=m.line.length;if(m.raf)cancelAnimationFrame(m.raf);m.raf=null;talkTypeStep(i,m);if(m.choose)renderModal(i);return true}return false}
function onModalClick(i,e){
  const t=e.target.closest('[data-a]');if(!t)return;
  if(performance.now()-(+modalEl(i).dataset.t||0)<450)return;
  const a=t.dataset.a,v=t.dataset.v;const c=S.chars[i],m=c.modal;if(!m)return;const bag=S.bags[i];
  if(m.type==='talk'){if(a==='tchoice'){talkChoose(i,v);return}if(a==='close'){if(talkSkip(i))return;if(m.choose)return;talkNext(i);return}}
  if(a==='close'){closeModal(i);return}
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
    <p class="hint">왼쪽 조이콘은 생민, 오른쪽 조이콘은 수갱이 가로로 쥐고 조작해요.<br>게임은 자동으로 저장돼요.</p></div></div></div>`);
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

