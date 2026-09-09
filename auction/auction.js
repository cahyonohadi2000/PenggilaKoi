const SUPABASE_URL='https://gvupoipruealykdywvhu.supabase.co';
const SUPABASE_KEY='sb_publishable_9np4iCroMs3EJgFxQh1vIQ_S3F2rzkJ';
const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

let currentUser=null;
let profile=null;
let lots=[];
let auctionsById={};
let bidsByKoi={};
let activeId=null;

const liveGrid=document.getElementById('liveGrid');
const detail=document.getElementById('auctionDetail');
const auctionModal=document.getElementById('auctionModal');
const profileModal=document.getElementById('profileModal');
const toast=document.getElementById('toast');
const connectionStatus=document.getElementById('connectionStatus');

function rupiah(n){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n||0))}
function remaining(ms){if(ms<=0)return 'SELESAI';const total=Math.floor(ms/1000),d=Math.floor(total/86400),h=Math.floor(total%86400/3600),m=Math.floor(total%3600/60),s=total%60;return d>0?`${d}h ${h}j ${m}m`:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2500)}
function openModal(el){el.classList.add('open');el.setAttribute('aria-hidden','false')}
function closeModal(el){el.classList.remove('open');el.setAttribute('aria-hidden','true')}
function maskName(name){if(!name)return 'Bidder';return name.length<=3?name[0]+'••':name.slice(0,2)+'•••'+name.slice(-1)}
function currentBid(koi){return Number(koi.current_bid||0)||Number(koi.opening_bid||0)}
function nextBid(koi){return Number(koi.current_bid||0)>0?Number(koi.current_bid)+Number(koi.bid_increment):Number(koi.opening_bid)}

function auctionFor(koi){return auctionsById[koi.auction_id]||null}
function isLive(koi){const a=auctionFor(koi);if(!a)return false;const now=Date.now();return a.status==='live'&&new Date(a.start_at).getTime()<=now&&new Date(a.end_at).getTime()>now&&koi.status==='active'}

async function loadSession(){const {data}=await client.auth.getSession();currentUser=data.session?.user||null;await loadProfile();renderAuthState()}
async function loadProfile(){profile=null;if(!currentUser)return;const {data}=await client.from('profiles').select('*').eq('id',currentUser.id).maybeSingle();profile=data||null}

async function loadData(){
  connectionStatus.textContent='Memuat data...';
  const [auctionRes,koiRes,bidRes]=await Promise.all([
    client.from('auctions').select('*').order('start_at',{ascending:true}),
    client.from('koi').select('*').order('lot_number',{ascending:true}),
    client.from('bids').select('id,koi_id,user_id,amount,created_at').order('created_at',{ascending:false}).limit(500)
  ]);
  if(auctionRes.error||koiRes.error||bidRes.error){connectionStatus.textContent='Gagal terhubung';showToast('Gagal memuat data Supabase.');return}
  auctionsById=Object.fromEntries((auctionRes.data||[]).map(a=>[a.id,a]));
  lots=koiRes.data||[];
  bidsByKoi={};
  for(const b of bidRes.data||[]){(bidsByKoi[b.koi_id]??=[]).push(b)}
  connectionStatus.textContent='Realtime aktif';
  renderAll();
}

function renderCards(){
  const active=lots.filter(isLive);
  document.getElementById('liveCount').textContent=`${active.length} koi sedang dilelang`;
  liveGrid.innerHTML='';
  if(!active.length){liveGrid.innerHTML='<div class="empty-state">Belum ada auction live di database.</div>';return}
  active.forEach(koi=>{
    const a=auctionFor(koi);const bids=bidsByKoi[koi.id]||[];
    const card=document.createElement('article');card.className='auction-card';
    card.innerHTML=`<div class="fish-visual" ${koi.image_url?`style="background-image:url('${koi.image_url}');background-size:cover;background-position:center"`:''}><span class="lot-badge">LOT ${koi.lot_number??'-'}</span></div><div class="card-body"><div class="card-title-row"><div><h3>${koi.variety}</h3><div class="seller">${a?.seller_name||'Penggila Koi Auction'}</div></div><div class="countdown" data-countdown="${koi.id}">${remaining(new Date(a.end_at)-Date.now())}</div></div><div class="specs"><div class="spec"><span>Breeder</span><strong>${koi.breeder||'-'}</strong></div><div class="spec"><span>Size</span><strong>${koi.size_cm?`${koi.size_cm} cm`:'-'}</strong></div><div class="spec"><span>Gender</span><strong>${koi.gender||'-'}</strong></div><div class="spec"><span>KB</span><strong>${rupiah(koi.bid_increment)}</strong></div></div><div class="bid-box"><div class="current-bid"><span>${Number(koi.current_bid)>0?'Current Bid':'Opening Bid'}</span><strong>${rupiah(currentBid(koi))}</strong></div><div class="bid-meta">${bids.length} bid<br>Next ${rupiah(nextBid(koi))}</div></div><div class="card-actions"><button class="secondary-button" data-detail="${koi.id}">Detail</button><button class="primary-button" data-bid="${koi.id}">Bid Sekarang</button></div></div>`;
    liveGrid.appendChild(card);
  });
  liveGrid.querySelectorAll('[data-detail]').forEach(btn=>btn.onclick=()=>showDetail(btn.dataset.detail));
  liveGrid.querySelectorAll('[data-bid]').forEach(btn=>btn.onclick=()=>showDetail(btn.dataset.bid,true));
}

function renderFinished(){
  const finishedAuctions=Object.values(auctionsById).filter(a=>a.status==='finished'||new Date(a.end_at).getTime()<=Date.now());
  document.getElementById('upcomingCount').textContent=`${Object.values(auctionsById).filter(a=>a.status==='upcoming').length} event`;
  const el=document.getElementById('finishedState');
  if(!finishedAuctions.length){el.textContent='Belum ada lelang yang selesai.';return}
  el.innerHTML=finishedAuctions.map(a=>`<div style="padding:8px 0"><strong>${a.title}</strong><br><small>${new Date(a.end_at).toLocaleString('id-ID')}</small></div>`).join('');
}

async function showDetail(id,focusBid=false){
  const koi=lots.find(x=>x.id===id);if(!koi)return;activeId=id;
  const a=auctionFor(koi);const bids=bidsByKoi[koi.id]||[];const done=!isLive(koi);
  const userIds=[...new Set(bids.map(b=>b.user_id))];let names={};
  if(userIds.length){const {data}=await client.from('profiles').select('id,full_name').in('id',userIds);for(const p of data||[])names[p.id]=p.full_name}
  detail.innerHTML=`<div class="detail-grid"><div class="detail-visual" ${koi.image_url?`style="background-image:url('${koi.image_url}');background-size:cover;background-position:center"`:''}>${koi.image_url?'':'KOI'}</div><div class="detail-info"><p class="eyebrow">LOT ${koi.lot_number??'-'}</p><h2 id="detailTitle">${koi.variety}</h2><div class="detail-seller">${a?.seller_name||'-'}</div><div class="detail-specs"><div class="spec"><span>Breeder</span><strong>${koi.breeder||'-'}</strong></div><div class="spec"><span>Size</span><strong>${koi.size_cm?`${koi.size_cm} cm`:'-'}</strong></div><div class="spec"><span>Gender</span><strong>${koi.gender||'-'}</strong></div><div class="spec"><span>KB</span><strong>${rupiah(koi.bid_increment)}</strong></div></div><div class="bid-panel"><span>${Number(koi.current_bid)>0?'Current Bid':'Opening Bid'}</span><div class="amount">${rupiah(currentBid(koi))}</div><div class="countdown" data-detail-countdown>${remaining(new Date(a.end_at)-Date.now())}</div>${done?'<p><strong>Lelang tidak sedang aktif.</strong></p>':`<form class="bid-form" id="bidForm"><input id="bidAmount" type="number" min="${nextBid(koi)}" step="${koi.bid_increment}" value="${nextBid(koi)}"><button class="primary-button" type="submit">Pasang Bid</button></form><small>Minimum bid berikutnya ${rupiah(nextBid(koi))}</small>`}</div><div class="history"><h3>Histori Bid</h3><div class="history-list">${bids.length?bids.map(b=>`<div class="history-item"><span>${maskName(names[b.user_id])}<br><small>${new Date(b.created_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</small></span><strong>${rupiah(b.amount)}</strong></div>`).join(''):'<div class="empty-state">Belum ada bid.</div>'}</div></div></div></div>`;
  openModal(auctionModal);
  document.getElementById('bidForm')?.addEventListener('submit',handleBid);
  if(focusBid)setTimeout(()=>document.getElementById('bidAmount')?.focus(),100);
}

async function handleBid(e){
  e.preventDefault();
  if(!currentUser){closeModal(auctionModal);openModal(profileModal);showToast('Login terlebih dahulu.');return}
  if(!profile?.full_name||!profile?.whatsapp){closeModal(auctionModal);openModal(profileModal);showToast('Lengkapi profil bidder terlebih dahulu.');return}
  const amount=Number(document.getElementById('bidAmount').value);
  const {error}=await client.rpc('place_bid',{p_koi_id:activeId,p_amount:amount});
  if(error){const m=error.message||'';if(m.includes('BID_TOO_LOW'))showToast('Bid terlalu rendah. Data mungkin baru berubah.');else if(m.includes('AUCTION_ENDED'))showToast('Lelang sudah selesai.');else showToast('Bid gagal: '+m);await loadData();return}
  showToast('Bid berhasil masuk ke database.');await loadData();await showDetail(activeId);
}

function renderAuthState(){
  const loggedOut=document.getElementById('loggedOutPanel');const loggedIn=document.getElementById('loggedInPanel');
  loggedOut.hidden=!!currentUser;loggedIn.hidden=!currentUser;
  document.getElementById('openProfile').textContent=currentUser?(profile?.full_name||currentUser.email):'Login / Profil Bidder';
  if(currentUser){document.getElementById('currentEmail').textContent=currentUser.email||'';document.getElementById('bidderName').value=profile?.full_name||'';document.getElementById('bidderPhone').value=profile?.whatsapp||'';document.getElementById('bidderCity').value=profile?.city||''}
}

document.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',()=>closeModal(document.getElementById(el.dataset.close))));
document.getElementById('openProfile').onclick=()=>{renderAuthState();openModal(profileModal)};

document.getElementById('authForm').addEventListener('submit',async e=>{e.preventDefault();const email=document.getElementById('authEmail').value.trim();const password=document.getElementById('authPassword').value;const {error}=await client.auth.signInWithPassword({email,password});if(error){showToast('Login gagal: '+error.message);return}await loadSession();closeModal(profileModal);showToast('Login berhasil.')});
document.getElementById('signupButton').addEventListener('click',async()=>{const email=document.getElementById('authEmail').value.trim();const password=document.getElementById('authPassword').value;const full_name=document.getElementById('signupName').value.trim();if(!email||password.length<6){showToast('Isi email dan password minimal 6 karakter.');return}const {data,error}=await client.auth.signUp({email,password,options:{data:{full_name}}});if(error){showToast('Pendaftaran gagal: '+error.message);return}showToast(data.session?'Akun dibuat dan login berhasil.':'Akun dibuat. Cek email untuk verifikasi lalu login.');await loadSession()});
document.getElementById('profileForm').addEventListener('submit',async e=>{e.preventDefault();if(!currentUser)return;const payload={full_name:document.getElementById('bidderName').value.trim(),whatsapp:document.getElementById('bidderPhone').value.trim(),city:document.getElementById('bidderCity').value.trim(),updated_at:new Date().toISOString()};const {error}=await client.from('profiles').update(payload).eq('id',currentUser.id);if(error){showToast('Gagal menyimpan profil: '+error.message);return}await loadProfile();renderAuthState();showToast('Profil bidder tersimpan.')});
document.getElementById('logoutButton').addEventListener('click',async()=>{await client.auth.signOut();currentUser=null;profile=null;renderAuthState();closeModal(profileModal);showToast('Logout berhasil.')});

function subscribeRealtime(){
  client.channel('auction-live')
    .on('postgres_changes',{event:'*',schema:'public',table:'bids'},()=>loadData())
    .on('postgres_changes',{event:'*',schema:'public',table:'koi'},()=>loadData())
    .on('postgres_changes',{event:'*',schema:'public',table:'auctions'},()=>loadData())
    .subscribe(status=>{if(status==='SUBSCRIBED')connectionStatus.textContent='Realtime aktif'});
}

function renderAll(){renderCards();renderFinished()}
setInterval(()=>{
  document.querySelectorAll('[data-countdown]').forEach(el=>{const koi=lots.find(x=>x.id===el.dataset.countdown);const a=koi&&auctionFor(koi);if(a)el.textContent=remaining(new Date(a.end_at)-Date.now())});
  const koi=lots.find(x=>x.id===activeId);const a=koi&&auctionFor(koi);const el=document.querySelector('[data-detail-countdown]');if(a&&el)el.textContent=remaining(new Date(a.end_at)-Date.now())
},1000);

client.auth.onAuthStateChange(async(_event,session)=>{currentUser=session?.user||null;await loadProfile();renderAuthState()});
(async()=>{await loadSession();await loadData();subscribeRealtime()})();
