const tabs = document.querySelectorAll('.shape-tab');
const rectangleFields = document.querySelector('#rectangle-fields');
const circleFields = document.querySelector('#circle-fields');
const form = document.querySelector('#volume-form');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-nav');
let activeShape = 'rectangle';

const formatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activeShape = tab.dataset.shape;
    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
    });

    const isRectangle = activeShape === 'rectangle';
    rectangleFields.classList.toggle('hidden', !isRectangle);
    circleFields.classList.toggle('hidden', isRectangle);
    document.querySelector('#length').required = isRectangle;
    document.querySelector('#width').required = isRectangle;
    document.querySelector('#diameter').required = !isRectangle;
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const depth = Number(document.querySelector('#depth').value);
  let liters = 0;

  if (activeShape === 'rectangle') {
    const length = Number(document.querySelector('#length').value);
    const width = Number(document.querySelector('#width').value);
    liters = (length * width * depth) / 1000;
  } else {
    const diameter = Number(document.querySelector('#diameter').value);
    const radius = diameter / 2;
    liters = (Math.PI * radius * radius * depth) / 1000;
  }

  if (!Number.isFinite(liters) || liters <= 0) return;

  document.querySelector('#result-liters').textContent = `${formatter.format(liters)} liter`;
  document.querySelector('#result-cubic').textContent = `${formatter.format(liters / 1000)} m³`;
  document.querySelector('#result-pump').textContent = `${formatter.format(liters)} L/jam`;
  document.querySelector('#result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

menuButton.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});
