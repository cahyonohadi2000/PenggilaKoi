const AUCTION_KEY='penggilakoi-auction-mvp-v1';
const PROFILE_KEY='penggilakoi-bidder-v1';

const now=Date.now();
const seedAuctions=[
  {id:'PK-001',variety:'Kohaku',breeder:'Sakai Fish Farm',seller:'Demo Seller A',size:'42 cm',gender:'Female',openingBid:1000000,increment:100000,endAt:now+1000*60*47,bids:[]},
  {id:'PK-002',variety:'Showa',breeder:'Dainichi',seller:'Demo Seller B',size:'39 cm',gender:'Unknown',openingBid:750000,increment:50000,endAt:now+1000*60*82,bids:[]},
  {id:'PK-003',variety:'Shiro Utsuri',breeder:'Omosako',seller:'Demo Seller C',size:'45 cm',gender:'Female',openingBid:1500000,increment:100000,endAt:now+1000*60*128,bids:[]}
];

function loadAuctions(){
  try{return JSON.parse(localStorage.getItem(AUCTION_KEY))||seedAuctions}catch{return seedAuctions}
}
function saveAuctions(){localStorage.setItem(AUCTION_KEY,JSON.stringify(auctions))}
function loadProfile(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY))||null}catch{return null}}
function saveProfile(profile){localStorage.setItem(PROFILE_KEY,JSON.stringify(profile))}
function rupiah(n){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)}
function currentBid(a){return a.bids.length?a.bids[0].amount:a.openingBid}
function nextBid(a){return a.bids.length?currentBid(a)+a.increment:a.openingBid}
function maskPhone(phone){return phone?phone.slice(0,4)+'••••'+phone.slice(-2):''}
function remaining(ms){
  if(ms<=0)return 'SELESAI';
  const total=Math.floor(ms/1000),d=Math.floor(total/86400),h=Math.floor(total%86400/3600),m=Math.floor(total%3600/60),s=total%60;
  return d>0?`${d}h ${h}j ${m}m`:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

let auctions=loadAuctions();
let activeId=null;
const liveGrid=document.getElementById('liveGrid');
const detail=document.getElementById('auctionDetail');
const auctionModal=document.getElementById('auctionModal');
const profileModal=document.getElementById('profileModal');
const toast=document.getElementById('toast');

function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2300)}
function openModal(el){el.classList.add('open');el.setAttribute('aria-hidden','false')}
function closeModal(el){el.classList.remove('open');el.setAttribute('aria-hidden','true')}

document.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',()=>closeModal(document.getElementById(el.dataset.close))));
document.getElementById('openProfile').addEventListener('click',()=>{fillProfile();openModal(profileModal)});

function renderCards(){
  liveGrid.innerHTML='';
  const active=auctions.filter(a=>a.endAt>Date.now());
  document.getElementById('liveCount').textContent=`${active.length} koi sedang dilelang`;
  if(!active.length){liveGrid.innerHTML='<div class="empty-state">Semua lelang demo sudah selesai.</div>';return}
  active.forEach(a=>{
    const card=document.createElement('article');card.className='auction-card';
    card.innerHTML=`
      <div class="fish-visual"><span class="lot-badge">LOT ${a.id}</span></div>
      <div class="card-body">
        <div class="card-title-row"><div><h3>${a.variety}</h3><div class="seller">${a.seller}</div></div><div class="countdown" data-countdown="${a.id}">${remaining(a.endAt-Date.now())}</div></div>
        <div class="specs"><div class="spec"><span>Breeder</span><strong>${a.breeder}</strong></div><div class="spec"><span>Size</span><strong>${a.size}</strong></div><div class="spec"><span>Gender</span><strong>${a.gender}</strong></div><div class="spec"><span>KB</span><strong>${rupiah(a.increment)}</strong></div></div>
        <div class="bid-box"><div class="current-bid"><span>${a.bids.length?'Current Bid':'Opening Bid'}</span><strong>${rupiah(currentBid(a))}</strong></div><div class="bid-meta">${a.bids.length} bid<br>Next ${rupiah(nextBid(a))}</div></div>
        <div class="card-actions"><button class="secondary-button" type="button" data-detail="${a.id}">Detail</button><button class="primary-button" type="button" data-bid="${a.id}">Bid Sekarang</button></div>
      </div>`;
    liveGrid.appendChild(card);
  });
  liveGrid.querySelectorAll('[data-detail]').forEach(btn=>btn.addEventListener('click',()=>showDetail(btn.dataset.detail)));
  liveGrid.querySelectorAll('[data-bid]').forEach(btn=>btn.addEventListener('click',()=>showDetail(btn.dataset.bid,true)));
}

function renderFinished(){
  const finished=auctions.filter(a=>a.endAt<=Date.now());
  const el=document.getElementById('finishedState');
  if(!finished.length){el.textContent='Belum ada lelang demo yang selesai.';return}
  el.innerHTML=finished.map(a=>`<div style="padding:8px 0"><strong>${a.variety} · ${a.id}</strong><br>${a.bids.length?`Pemenang: ${a.bids[0].name} — ${rupiah(a.bids[0].amount)}`:'Tidak ada bid'}</div>`).join('');
}

function showDetail(id,focusBid=false){
  const a=auctions.find(x=>x.id===id);if(!a)return;activeId=id;
  const isDone=a.endAt<=Date.now();
  detail.innerHTML=`
    <div class="detail-grid">
      <div class="detail-visual">KOI</div>
      <div class="detail-info">
        <p class="eyebrow">LOT ${a.id}</p><h2 id="detailTitle">${a.variety}</h2><div class="detail-seller">${a.seller}</div>
        <div class="detail-specs"><div class="spec"><span>Breeder</span><strong>${a.breeder}</strong></div><div class="spec"><span>Size</span><strong>${a.size}</strong></div><div class="spec"><span>Gender</span><strong>${a.gender}</strong></div><div class="spec"><span>KB</span><strong>${rupiah(a.increment)}</strong></div></div>
        <div class="bid-panel"><span>${a.bids.length?'Current Bid':'Opening Bid'}</span><div class="amount">${rupiah(currentBid(a))}</div><div class="countdown" data-detail-countdown>${remaining(a.endAt-Date.now())}</div>
          ${isDone?`<p><strong>${a.bids.length?`Pemenang: ${a.bids[0].name}`:'Lelang selesai tanpa bid.'}</strong></p>`:`<form class="bid-form" id="bidForm"><input id="bidAmount" type="number" min="${nextBid(a)}" step="${a.increment}" value="${nextBid(a)}" aria-label="Nominal bid"><button class="primary-button" type="submit">Pasang Bid</button></form><small>Minimum bid berikutnya ${rupiah(nextBid(a))}</small>`}
        </div>
        <div class="history"><h3>Histori Bid</h3><div class="history-list">${a.bids.length?a.bids.map(b=>`<div class="history-item"><span>${b.name}<br><small>${maskPhone(b.phone)} · ${new Date(b.time).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</small></span><strong>${rupiah(b.amount)}</strong></div>`).join(''):'<div class="empty-state">Belum ada bid. Jadilah bidder pertama.</div>'}</div></div>
      </div>
    </div>`;
  openModal(auctionModal);
  const form=document.getElementById('bidForm');if(form)form.addEventListener('submit',handleBid);
  if(focusBid)setTimeout(()=>document.getElementById('bidAmount')?.focus(),100);
}

function handleBid(e){
  e.preventDefault();
  const profile=loadProfile();
  if(!profile){closeModal(auctionModal);fillProfile();openModal(profileModal);showToast('Isi profil bidder terlebih dahulu.');return}
  const a=auctions.find(x=>x.id===activeId);if(!a)return;
  if(a.endAt<=Date.now()){showToast('Lelang sudah selesai.');renderAll();return}
  const amount=Number(document.getElementById('bidAmount').value);
  const minimum=nextBid(a);
  if(!Number.isFinite(amount)||amount<minimum){showToast(`Minimum bid ${rupiah(minimum)}`);return}
  if((amount-a.openingBid)%a.increment!==0){showToast(`Bid harus mengikuti kelipatan ${rupiah(a.increment)}`);return}
  const bidTime=Date.now();
  a.bids.unshift({name:profile.name,phone:profile.phone,amount,time:bidTime});
  if(a.endAt-bidTime<=120000){a.endAt+=120000;showToast('Bid diterima. Anti-sniper aktif: +2 menit.')}else{showToast('Bid berhasil dicatat.')}
  saveAuctions();renderAll();showDetail(a.id);
}

function fillProfile(){const p=loadProfile();document.getElementById('bidderName').value=p?.name||'';document.getElementById('bidderPhone').value=p?.phone||''}
document.getElementById('profileForm').addEventListener('submit',e=>{e.preventDefault();const name=document.getElementById('bidderName').value.trim(),phone=document.getElementById('bidderPhone').value.trim();if(!name||!phone)return;saveProfile({name,phone});closeModal(profileModal);showToast('Profil bidder tersimpan.');if(activeId)showDetail(activeId)});

function renderAll(){renderCards();renderFinished()}
setInterval(()=>{
  document.querySelectorAll('[data-countdown]').forEach(el=>{const a=auctions.find(x=>x.id===el.dataset.countdown);if(a)el.textContent=remaining(a.endAt-Date.now())});
  if(activeId&&auctionModal.classList.contains('open')){const a=auctions.find(x=>x.id===activeId),el=document.querySelector('[data-detail-countdown]');if(a&&el)el.textContent=remaining(a.endAt-Date.now())}
  if(auctions.some(a=>a.endAt<=Date.now()&&!a._finishedRendered)){renderAll()}
},1000);
renderAll();
