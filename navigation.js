const pageMenuButton = document.querySelector('.menu-button');
const pageNavigation = document.querySelector('.main-nav');

const isNestedPage = ['/artikel/', '/rekomendasi/', '/koi-farm/', '/ebook-kohaku/', '/konsultasi/', '/nijikawa/', '/auction/'].some((path) => window.location.pathname.includes(path));
const localPrefix = isNestedPage ? '../' : '';

if (pageNavigation && !pageNavigation.querySelector('a[href*="auction/"]')) {
  const auctionLink = document.createElement('a');
  auctionLink.href = `${localPrefix}auction/`;
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
