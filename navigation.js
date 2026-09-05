const pageMenuButton = document.querySelector('.menu-button');
const pageNavigation = document.querySelector('.main-nav');

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
