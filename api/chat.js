const ALLOWED_ORIGINS = new Set([
  'https://cahyonohadi2000.github.io',
  'https://penggilakoi-api.vercel.app'
]);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function buildText(body) {
  const { mode, data = {} } = body || {};
  const lines = Object.entries(data)
    .filter(([, value]) => value !== '' && value !== null && value !== undefined)
    .map(([key, value]) => `${key}: ${value}`);

  return `Jenis konsultasi: ${mode || 'Koi'}\n\nData dari pengguna:\n${lines.join('\n')}`;
}

function extractOutputText(response) {
  if (typeof response.output_text === 'string' && response.output_text.trim()) {
    return response.output_text.trim();
  }

  const chunks = [];
  for (const item of response.output || []) {
    if (item.type !== 'message') continue;
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY belum tersedia di server.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const userText = buildText(body);
    const content = [{ type: 'input_text', text: userText }];

    if (body.imageDataUrl && typeof body.imageDataUrl === 'string' && body.imageDataUrl.startsWith('data:image/')) {
      content.push({ type: 'input_image', image_url: body.imageDataUrl });
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        instructions: `Kamu adalah Asisten Penggila Koi berbahasa Indonesia. Jawab dengan jelas, praktis, dan tidak bertele-tele. Panggil pengguna dengan sebutan “Paman” secara wajar.\n\nUntuk konsultasi kesehatan koi: bedakan antara fakta dari data pengguna, kemungkinan penyebab, dan hal yang belum dapat dipastikan. Jangan menyatakan diagnosis pasti hanya dari satu gejala atau foto. Prioritaskan pemeriksaan kualitas air, perilaku, insang/kulit, dan tindakan awal yang aman. Jangan menyarankan dosis obat spesifik jika volume air, bahan aktif/produk, atau data penting belum cukup. Bila ada tanda keadaan darurat, jelaskan tindakan awal yang paling aman.\n\nUntuk varietas dan kualitas koi: nilai hanya hal yang memang terlihat atau didukung data. Bedakan identifikasi varietas, body, skin quality, warna, pola, dan potensi perkembangan. Jelaskan keterbatasan penilaian dari foto.\n\nStruktur jawaban: (1) Ringkasan analisis, (2) Dasar analisis, (3) Langkah yang disarankan, (4) Data yang masih diperlukan jika ada. Jangan mengarang sumber atau pustaka. Basis pengetahuan khusus Penggila Koi belum dihubungkan pada tahap ini, jadi jangan mengklaim jawaban berasal dari buku internal.`,
        input: [{ role: 'user', content }],
        max_output_tokens: 900
      })
    });

    const payload = await openaiResponse.json();
    if (!openaiResponse.ok) {
      console.error('OpenAI API error', payload);
      return res.status(openaiResponse.status).json({
        error: payload?.error?.message || 'OpenAI API gagal memproses permintaan.'
      });
    }

    const answer = extractOutputText(payload);
    if (!answer) return res.status(502).json({ error: 'AI tidak mengembalikan teks jawaban.' });

    return res.status(200).json({ answer });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat memproses konsultasi.' });
  }
}
