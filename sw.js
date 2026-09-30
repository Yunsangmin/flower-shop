/* 우리 둘의 꽃집 — 오프라인 실행용 (인터넷이 있으면 항상 최신 버전을 받아요)
   - 페이지·게임 파일: 인터넷 먼저(6초), 안 되면 마지막 저장본
   - Phaser 엔진 파일(버전 이름이 붙은 큰 파일): 저장본 먼저
   - 주소마다 따로 보관 → 새 버전 미리보기(beta/)가 본 게임 저장본을 덮어쓰지 않음
   - 배경음악(music/*.mp3): 한 번 받으면 TV에 보관해 두고 바로 틀어요(오프라인에서도 나와요).
     GitHub에서 같은 이름의 새 파일로 바꾸면, 켤 때 작은 확인 요청으로 알아채고 새 파일로 바꿔 보관해요. */
const CACHE='ourflowershop-v1';
const MCACHE='ourflowershop-music-v1';
const BASE=new URL('./',self.location).pathname;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html'])).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
function withTimeout(p,ms){return new Promise((ok,no)=>{const t=setTimeout(()=>no(new Error('timeout')),ms);p.then(v=>{clearTimeout(t);ok(v)},er=>{clearTimeout(t);no(er)})})}
function keyOf(u){let p=u.pathname;if(p.endsWith('/'))p+='index.html';return u.origin+p}
/* ---- 배경음악 보관 ---- */
const MCHECKED=new Set();
function sig(res){return res?(res.headers.get('etag')||'')+'|'+(res.headers.get('last-modified')||'')+'|'+(res.headers.get('content-length')||''):''}
async function musicFetchStore(c,key){const res=await fetch(key,{cache:'no-store'});if(res&&res.ok&&res.status===200){await c.put(key,res.clone());return res}return null}
async function musicCheck(c,key,hit){if(MCHECKED.has(key))return;MCHECKED.add(key);
  try{const h=await fetch(key,{method:'HEAD',cache:'no-store'});if(!h.ok){if(h.status===404)await c.delete(key);return}
    const a=sig(h),b=sig(hit);if(a!=='||'&&a!==b)await musicFetchStore(c,key)}catch(e){}}
async function musicResp(r,key){
  const c=await caches.open(MCACHE);let hit=await c.match(key);
  if(hit){musicCheck(c,key,hit)}else{try{hit=await musicFetchStore(c,key);MCHECKED.add(key)}catch(e){hit=null}if(!hit){try{return await fetch(r)}catch(e){return Response.error()}}}
  const range=r.headers.get('range');if(!range)return hit;
  const blob=await hit.blob(),size=blob.size,m=/bytes=(\d*)-(\d*)/.exec(range);
  let st=m&&m[1]!==''?+m[1]:0,en=m&&m[2]!==''?+m[2]:size-1;if(m&&m[1]===''&&m[2]!==''){st=Math.max(0,size-(+m[2]));en=size-1}
  en=Math.min(en,size-1);if(st>=size||st>en)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
  return new Response(blob.slice(st,en+1),{status:206,headers:{'Content-Type':hit.headers.get('content-type')||'audio/mpeg','Content-Range':`bytes ${st}-${en}/${size}`,'Content-Length':String(en-st+1),'Accept-Ranges':'bytes'}})}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(hit=>{const net=fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>hit);return hit||net})));return;
  }
  if(u.origin!==location.origin||!u.pathname.startsWith(BASE)||u.pathname.endsWith('/sw.js'))return;
  const key=keyOf(u);
  if(/\/music\/[^/]+\.mp3$/i.test(u.pathname)){e.respondWith(musicResp(r,key));return}
  if(/phaser-[\d.]+(\.min)?\.js$/.test(u.pathname)){
    e.respondWith(caches.open(CACHE).then(c=>c.match(key).then(hit=>hit||fetch(r).then(res=>{if(res&&res.ok)c.put(key,res.clone());return res}))));return;
  }
  const isPage=r.mode==='navigate'||u.pathname.endsWith('/')||/\.(html|js)$/.test(u.pathname);
  if(!isPage)return;
  e.respondWith(withTimeout(fetch(r,{cache:'no-store'}),6000).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(key,cp))}return res}).catch(()=>caches.match(key)));
});
