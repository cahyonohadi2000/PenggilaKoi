const tabs = document.querySelectorAll('.shape-tab');
const rectangleFields = document.querySelector('#rectangle-fields');
const circleFields = document.querySelector('#circle-fields');
const form = document.querySelector('#volume-form');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-nav');
const feedForm = document.querySelector('#feed-form');
const koiGroups = document.querySelector('#koi-groups');
const addKoiGroupButton = document.querySelector('#add-koi-group');
let activeShape = 'rectangle';

const formatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

// Sampel kurva panjang-bobot pada referensi pengguna (panjang badan tanpa ekor).
// Bobot di antara titik dihitung dengan interpolasi linear. Catatan 2% pada
// area hijau diperlakukan sebagai panduan feeding rate, bukan penambah bobot.
const koiWeightCurve = [
  [10, 0.01], [15, 0.03], [20, 0.07], [25, 0.15], [30, 0.35],
  [35, 0.80], [40, 1.50], [45, 1.98], [50, 2.28], [55, 2.48],
  [60, 2.61], [65, 2.70], [70, 2.76]
];

function estimateKoiWeight(length) {
  if (length < 10 || length > 70) return null;
  let baseWeight = koiWeightCurve.at(-1)[1];

  for (let index = 0; index < koiWeightCurve.length - 1; index += 1) {
    const [startLength, startWeight] = koiWeightCurve[index];
    const [endLength, endWeight] = koiWeightCurve[index + 1];
    if (length >= startLength && length <= endLength) {
      const position = (length - startLength) / (endLength - startLength);
      baseWeight = startWeight + position * (endWeight - startWeight);
      break;
    }
  }

  return baseWeight;
}

function wireRemoveButtons() {
  koiGroups.querySelectorAll('.remove-group').forEach((button) => {
    button.disabled = koiGroups.children.length === 1;
    button.onclick = () => {
      if (koiGroups.children.length > 1) button.closest('.koi-group').remove();
      wireRemoveButtons();
    };
  });
}

addKoiGroupButton.addEventListener('click', () => {
  const newGroup = koiGroups.firstElementChild.cloneNode(true);
  newGroup.querySelector('.koi-length').value = '35';
  newGroup.querySelector('.koi-count').value = '1';
  koiGroups.appendChild(newGroup);
  wireRemoveButtons();
});

wireRemoveButtons();

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
  const rate = Number(document.querySelector('#feed-rate').value);
  const frequency = Number(document.querySelector('#feed-frequency').value);
  let biomass = 0;

  for (const group of koiGroups.querySelectorAll('.koi-group')) {
    const length = Number(group.querySelector('.koi-length').value);
    const count = Number(group.querySelector('.koi-count').value);
    const individualWeight = estimateKoiWeight(length);
    if (individualWeight === null || !Number.isFinite(count) || count < 1) return;
    biomass += individualWeight * count;
  }

  const dailyGrams = biomass * 1000 * (rate / 100);

  if (![biomass, rate, frequency, dailyGrams].every(Number.isFinite) || dailyGrams <= 0 || frequency < 1) return;

  document.querySelector('#feed-daily').textContent = `${formatter.format(dailyGrams)} gram/hari`;
  document.querySelector('#feed-biomass').textContent = `${formatter.format(biomass)} kg`;
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
