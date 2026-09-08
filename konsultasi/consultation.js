const API_ENDPOINT = 'https://penggilakoi-api.vercel.app/api/chat';
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

  const submitButton = form.querySelector('.submit-consultation');
  const originalButtonHtml = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = 'Menganalisis...';

  const data = new FormData(form);
  const mode = form.dataset.form === 'health' ? 'Kesehatan Koi' : 'Varietas & Kualitas';
  const question = String(data.get('question') || '').trim();
  const photo = data.get('photo');

  preparedSummary.innerHTML = `<strong>${mode}</strong><br>${escapeHtml(question)}${photo && photo.size ? '<br>Foto: sedang dianalisis' : '<br>Foto: tidak disertakan'}`;
  resultEmpty.classList.add('hidden');
  resultPending.classList.remove('hidden');
  resultPending.innerHTML = `
    <span class="status-dot"></span>
    <p class="consultation-eyebrow">ANALISIS SEDANG BERJALAN</p>
    <h2>Sedang membaca data konsultasi.</h2>
    <p>AI sedang memeriksa informasi yang Paman kirimkan.</p>
    <div class="prepared-summary" id="prepared-summary">${preparedSummary.innerHTML}</div>
  `;
  document.querySelector('#consultation-result').scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const payloadData = {};
    data.forEach((value, key) => {
      if (value instanceof File) return;
      payloadData[key] = value;
    });

    let imageDataUrl = '';
    if (photo && photo.size) {
      imageDataUrl = await fileToDataUrl(photo);
    }

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, data: payloadData, imageDataUrl })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Permintaan gagal');

    resultPending.innerHTML = `
      <p class="consultation-eyebrow">HASIL KONSULTASI</p>
      <h2>Analisis AI</h2>
      <div class="ai-answer">${formatAnswer(result.answer)}</div>
      <p class="pending-note">Jawaban ini masih menggunakan model AI umum. Basis pengetahuan khusus Penggila Koi akan dihubungkan pada tahap berikutnya.</p>
    `;
  } catch (error) {
    resultPending.innerHTML = `
      <p class="consultation-eyebrow">KONEKSI BERMASALAH</p>
      <h2>Analisis belum berhasil.</h2>
      <p>${escapeHtml(error.message || 'Terjadi kesalahan saat menghubungi AI.')}</p>
      <p class="pending-note">Coba ulang beberapa saat lagi. Jika tetap gagal, periksa deployment Vercel dan konfigurasi API.</p>
    `;
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonHtml;
  }
}));

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatAnswer(value) {
  return escapeHtml(String(value || ''))
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

function escapeHtml(value) {
  return value.replace(/[&<>'\"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '\"':'&quot;' }[character]));
}
