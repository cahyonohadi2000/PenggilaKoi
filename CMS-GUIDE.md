# Panduan Control Panel Penggila Koi

Website menggunakan Pages CMS sebagai panel penyuntingan dan GitHub Pages sebagai penerbit website.

## Membuka panel

1. Kunjungi https://app.pagescms.org
2. Masuk menggunakan akun GitHub yang memiliki akses ke repositori `cahyonohadi2000/PenggilaKoi`.
3. Pilih repositori **PenggilaKoi** dan branch **main**.
4. Pilih menu **Artikel** atau **Koi Farm**.

## Menerbitkan artikel

1. Klik **New Artikel**.
2. Isi judul dan slug. Slug memakai huruf kecil serta tanda hubung, misalnya `cara-memilih-kohaku`.
3. Isi kategori, ringkasan, pengantar, isi artikel, dan deskripsi SEO.
4. Aktifkan **Tampilkan di website** jika sudah siap.
5. Simpan. Pages CMS membuat commit ke GitHub dan GitHub Pages akan membangun ulang website.

## Menambahkan koi farm

1. Klik **New Koi Farm**.
2. Isi identitas, wilayah, alamat, ringkasan, dan profil farm.
3. Masukkan tautan Google Maps, Instagram, WhatsApp admin, dan grup lelang jika tersedia.
4. Unggah logo atau galeri resmi dan tambahkan prestasi yang sudah dikonfirmasi.
5. Pilih status profil, aktifkan **Tampilkan di website**, lalu simpan.

## Alur status

- Nonaktif: tersimpan di repositori tetapi tidak tampil di website.
- Aktif: muncul otomatis setelah proses GitHub Pages selesai.
- Profil awal, Terverifikasi, dan Partner Penggila Koi dipakai sebagai status profil farm.

Jangan menyimpan API key, password, atau credential lain di kolom konten maupun repositori.
