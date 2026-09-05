# Penggila Koi Tools

Web aplikasi sederhana untuk membantu koi keeper melakukan perhitungan teknis dengan lebih tepat.

## Fitur MVP 1.0

- Dashboard responsif untuk desktop dan HP
- Kalkulator volume kolam persegi
- Kalkulator volume kolam bulat
- Estimasi kapasitas minimum pompa berdasarkan sirkulasi 1x per jam
- Kalkulator pakan yang mengestimasi biomassa dari panjang dan jumlah koi
- Kurva panjang-bobot 10–70 cm dengan interpolasi antartitik
- Panduan cepat amonia, nitrit, dan nitrat
- Kalkulator volume bak karantina persegi dan bulat
- Kalkulator garam berdasarkan selisih kadar awal dan target
- Kalkulator obat bubuk berdasarkan mg/L
- Kalkulator obat cair berdasarkan aturan mL per volume air
- Katalog 15 varietas/pola koi dengan pencarian dan filter kelompok
- Ciri pembeda, fokus memilih kualitas, dan varietas yang sering tertukar
- Tidak memerlukan login dan tidak mengirim data pengguna ke server

## Menjalankan secara lokal

Buka `index.html` langsung di browser. Untuk pengembangan, proyek juga dapat dijalankan dengan ekstensi Live Server di VS Code.

## Publikasi dengan GitHub Pages

1. Buka **Settings** pada repository.
2. Pilih **Pages**.
3. Pada **Build and deployment**, pilih **Deploy from a branch**.
4. Pilih branch **main** dan folder **/(root)**.
5. Klik **Save**.

Setelah deployment selesai, aplikasi tersedia di:

`https://cahyonohadi2000.github.io/PenggilaKoi/`

## Catatan keamanan

Versi ini tidak memiliki autentikasi, database, atau credential rahasia. Jangan menaruh password, API key, service-role key, maupun token asli di repository. Jika autentikasi ditambahkan nanti, gunakan layanan backend seperti Supabase atau Firebase dan simpan rahasia server di environment variables.
