const pageMenuButton = document.querySelector('.menu-button');
const pageNavigation = document.querySelector('.main-nav');

if (pageNavigation && !pageNavigation.querySelector('a[href*="auction/"]')) {
  const auctionLink = document.createElement('a');
  auctionLink.href = window.location.pathname.includes('/artikel/') || window.location.pathname.includes('/rekomendasi/') || window.location.pathname.includes('/koi-farm/') || window.location.pathname.includes('/ebook-kohaku/') || window.location.pathname.includes('/konsultasi/') ? '../auction/' : 'auction/';
  auctionLink.textContent = 'Lelang';
  const consultationLink = Array.from(pageNavigation.querySelectorAll('a')).find((link) => link.textContent.trim().toLowerCase().includes('konsultasi'));
  if (consultationLink) {
    pageNavigation.insertBefore(auctionLink, consultationLink);
  } else {
    pageNavigation.appendChild(auctionLink);
  }
}

if (pageMenuButton && pageNavigation) {
  pageMenuButton.addEventListener('click', () => {
    const isOpen = pageNavigation.classList.toggle('open');
    pageMenuButton.setAttribute('aria-expanded', String(isOpen));
  });

  pageNavigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      pageNavigation.classList.remove('open');
      pageMenuButton.setAttribute('aria-expanded', 'false');
    });
  });
}
