const tabs = document.querySelectorAll('.shape-tab');
const rectangleFields = document.querySelector('#rectangle-fields');
const circleFields = document.querySelector('#circle-fields');
const form = document.querySelector('#volume-form');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-nav');
const feedForm = document.querySelector('#feed-form');
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

feedForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const biomass = Number(document.querySelector('#biomass').value);
  const rate = Number(document.querySelector('#feed-rate').value);
  const frequency = Number(document.querySelector('#feed-frequency').value);
  const dailyGrams = biomass * 1000 * (rate / 100);

  if (![biomass, rate, frequency, dailyGrams].every(Number.isFinite) || dailyGrams <= 0 || frequency < 1) return;

  document.querySelector('#feed-daily').textContent = `${formatter.format(dailyGrams)} gram/hari`;
  document.querySelector('#feed-serving').textContent = `${formatter.format(dailyGrams / frequency)} gram`;
  document.querySelector('#feed-monthly').textContent = `${formatter.format((dailyGrams * 30) / 1000)} kg`;
  document.querySelector('#feed-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
