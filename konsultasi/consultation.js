const API_ENDPOINT = '';
const tabs = document.querySelectorAll('.mode-tab');
const forms = document.querySelectorAll('.consultation-form');
const resultEmpty = document.querySelector('#result-empty');
const resultPending = document.querySelector('#result-pending');
const preparedSummary = document.querySelector('#prepared-summary');
const menuButton = document.querySelector('.menu-button');
const mainNav = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

tabs.forEach((tab) => tab.addEventListener('click', () => {
  const selectedMode = tab.dataset.mode;
  tabs.forEach((item) => {
    const selected = item === tab;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-selected', String(selected));
  });
  forms.forEach((form) => form.classList.toggle('hidden', form.dataset.form !== selectedMode));
  resultEmpty.classList.remove('hidden');
  resultPending.classList.add('hidden');
}));

document.querySelectorAll('.photo-input').forEach((input) => {
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    const preview = input.closest('.upload-field').querySelector('.photo-preview');
    if (!file) {
      preview.classList.remove('visible');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      input.value = '';
      preview.classList.remove('visible');
      alert('Ukuran foto maksimal 8 MB.');
      return;
    }
    preview.src = URL.createObjectURL(file);
    preview.classList.add('visible');
  });
});

forms.forEach((form) => form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const mode = form.dataset.form === 'health' ? 'Kesehatan Koi' : 'Varietas & Kualitas';
  const question = String(data.get('question') || '').trim();
  const photo = data.get('photo');
  preparedSummary.innerHTML = `<strong>${mode}</strong><br>${escapeHtml(question)}${photo && photo.size ? '<br>Foto: siap dianalisis' : '<br>Foto: tidak disertakan'}`;

  if (!API_ENDPOINT) {
    resultEmpty.classList.add('hidden');
    resultPending.classList.remove('hidden');
    document.querySelector('#consultation-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  try {
    const response = await fetch(API_ENDPOINT, { method: 'POST', body: data });
    if (!response.ok) throw new Error('Permintaan gagal');
  } catch (error) {
    resultEmpty.classList.add('hidden');
    resultPending.classList.remove('hidden');
  }
}));

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
}
