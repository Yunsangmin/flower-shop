/* 우리 둘의 꽃집 — 오프라인 실행용 (인터넷이 있으면 항상 최신 버전을 받아요)
   - 페이지·게임 파일: 인터넷 먼저(6초), 안 되면 마지막 저장본
   - Phaser 엔진 파일(버전 이름이 붙은 큰 파일): 저장본 먼저
   - 주소마다 따로 보관 → 새 버전 미리보기(beta/)가 본 게임 저장본을 덮어쓰지 않음 */
const CACHE='ourflowershop-v1';
const BASE=new URL('./',self.location).pathname;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html'])).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
function withTimeout(p,ms){return new Promise((ok,no)=>{const t=setTimeout(()=>no(new Error('timeout')),ms);p.then(v=>{clearTimeout(t);ok(v)},er=>{clearTimeout(t);no(er)})})}
function keyOf(u){let p=u.pathname;if(p.endsWith('/'))p+='index.html';return u.origin+p}
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(hit=>{const net=fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>hit);return hit||net})));return;
  }
  if(u.origin!==location.origin||!u.pathname.startsWith(BASE)||u.pathname.endsWith('/sw.js'))return;
  const key=keyOf(u);
  if(/phaser-[\d.]+(\.min)?\.js$/.test(u.pathname)){
    e.respondWith(caches.open(CACHE).then(c=>c.match(key).then(hit=>hit||fetch(r).then(res=>{if(res&&res.ok)c.put(key,res.clone());return res}))));return;
  }
  const isPage=r.mode==='navigate'||u.pathname.endsWith('/')||/\.(html|js)$/.test(u.pathname);
  if(!isPage)return;
  e.respondWith(withTimeout(fetch(r,{cache:'no-store'}),6000).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(key,cp))}return res}).catch(()=>caches.match(key)));
});
