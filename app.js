const tabs = document.querySelectorAll('.shape-tab');
const rectangleFields = document.querySelector('#rectangle-fields');
const circleFields = document.querySelector('#circle-fields');
const form = document.querySelector('#volume-form');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-nav');
const feedForm = document.querySelector('#feed-form');
const koiGroups = document.querySelector('#koi-groups');
const addKoiGroupButton = document.querySelector('#add-koi-group');
const treatmentForm = document.querySelector('#treatment-form');
const quarantineShapeTabs = document.querySelectorAll('.quarantine-shape-tab');
const treatmentTabs = document.querySelectorAll('.treatment-tab');
const varietyGrid = document.querySelector('#variety-grid');
const varietySearch = document.querySelector('#variety-search');
const varietyFilters = document.querySelectorAll('.variety-filter');
let activeShape = 'rectangle';
let quarantineShape = 'rectangle';
let treatmentType = 'salt';
let activeVarietyCategory = 'all';

const formatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const doseFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 });

// Sampel kurva panjang-bobot pada referensi pengguna (panjang badan tanpa ekor).
// Bobot di antara titik dihitung dengan interpolasi linear. Catatan 2% pada
// area hijau diperlakukan sebagai panduan feeding rate, bukan penambah bobot.
const koiWeightCurve = [
  [10, 0.01], [15, 0.03], [20, 0.07], [25, 0.15], [30, 0.35],
  [35, 0.80], [40, 1.50], [45, 1.98], [50, 2.28], [55, 2.48],
  [60, 2.61], [65, 2.70], [70, 2.76]
];

const koiVarieties = [
  {
    name: 'Kohaku', japanese: '紅白', category: 'gosanke', group: 'Gosanke', colors: 'Shiroji • Hi',
    image: 'assets/varieties/kohaku.webp',
    pattern: 'radial-gradient(circle at 30% 55%, #c9282d 0 19%, transparent 20%), radial-gradient(circle at 72% 42%, #d43838 0 23%, transparent 24%), #f8fbfa',
    summary: 'Koi nonmetallic dengan dasar putih dan pola merah, tanpa sumi.',
    identify: 'Shiroji putih dengan hi merah yang tersusun seimbang dari kepala hingga mendekati ekor.',
    quality: 'Body, kualitas kulit, hi yang merata, kiwa tegas, sashi rapi, odome, dan keseimbangan pola.',
    confused: 'Kohaku dengan sisik reflektif masuk Gin Rin; Kohaku tanpa sisik penuh disebut Doitsu Kohaku.'
  },
  {
    name: 'Taisho Sanke', japanese: '大正三色', category: 'gosanke', group: 'Gosanke', colors: 'Shiroji • Hi • Sumi',
    image: 'assets/varieties/taisho-sanke.webp',
    pattern: 'radial-gradient(circle at 25% 52%, #d22f35 0 18%, transparent 19%), radial-gradient(circle at 65% 45%, #cf3035 0 22%, transparent 23%), radial-gradient(circle at 80% 35%, #101a22 0 8%, transparent 9%), #f8fbfa',
    summary: 'Koi dasar putih dengan pola merah dan bercak sumi sebagai aksen.',
    identify: 'Sumi umumnya berupa pulau kecil di tubuh dan tidak hadir di kepala; sirip dapat memiliki tejima.',
    quality: 'Kualitas Kohaku sebagai fondasi, shiroji bersih, sumi pekat, dan penempatan tiga warna yang harmonis.',
    confused: 'Berbeda dari Showa yang berkarakter dasar hitam, dapat memiliki sumi di kepala dan motoguro.'
  },
  {
    name: 'Showa Sanshoku', japanese: '昭和三色', category: 'gosanke', group: 'Gosanke', colors: 'Sumi • Hi • Shiroji',
    image: 'assets/varieties/showa-sanshoku.webp',
    pattern: 'linear-gradient(120deg, #101820 0 22%, transparent 23% 40%, #c72f35 41% 63%, transparent 64%), radial-gradient(circle at 75% 30%, #111b24 0 18%, transparent 19%), #f4f7f7',
    summary: 'Koi tiga warna berkarakter dasar hitam dengan hi dan shiroji yang membungkus tubuh.',
    identify: 'Sumi dapat muncul di kepala dan turun melewati garis lateral; motoguro lazim terlihat pada pangkal sirip dada.',
    quality: 'Body kuat, sumi berkualitas, keseimbangan tiga warna, menware di kepala, dan motoguro yang proporsional.',
    confused: 'Sanke umumnya tidak memiliki sumi di kepala dan pola hitamnya terasa sebagai aksen di atas dasar putih.'
  },
  {
    name: 'Ki Utsuri', japanese: '黄写り', category: 'utsurimono', group: 'Utsurimono', colors: 'Sumi • Ki',
    image: 'assets/varieties/ki-utsuri.webp',
    pattern: 'linear-gradient(125deg, #101820 0 28%, #e5ab27 29% 48%, #111a21 49% 66%, #e5ab27 67% 82%, #101820 83%)',
    summary: 'Koi dasar hitam dengan pola kuning yang saling membungkus tubuh.',
    identify: 'Tidak memiliki shiroji atau hi; pola sumi dan ki hadir di kepala serta dapat melewati garis lateral.',
    quality: 'Sumi pekat, ki bersih dan merata, batas warna tegas, pola kepala kuat, serta keseimbangan pola tubuh.',
    confused: 'Ki Bekko berdasar kuning dengan bercak hitam di atas tubuh, bukan pola hitam yang membungkus seperti Utsuri.'
  },
  {
    name: 'Shiro Utsuri', japanese: '白写り', category: 'utsurimono', group: 'Utsurimono', colors: 'Sumi • Shiroji',
    image: 'assets/varieties/shiro-utsuri.webp',
    pattern: 'linear-gradient(125deg, #101820 0 28%, #f5f7f6 29% 48%, #111a21 49% 66%, #f5f7f6 67% 82%, #101820 83%)',
    summary: 'Koi dasar hitam dengan pola putih yang saling membungkus tubuh.',
    identify: 'Sumi hadir di kepala dan dapat memanjang di bawah garis lateral; pangkal sirip sering memiliki motoguro.',
    quality: 'Kontras shiroji dan sumi, pola kepala, keseimbangan pembungkus tubuh, motoguro, dan body.',
    confused: 'Shiro Bekko berdasar putih dengan bercak hitam di atas tubuh dan biasanya tanpa sumi di kepala.'
  },
  {
    name: 'Hi Utsuri', japanese: '緋写り', category: 'utsurimono', group: 'Utsurimono', colors: 'Sumi • Hi',
    image: 'assets/varieties/hi-utsuri.webp',
    pattern: 'linear-gradient(125deg, #111a20 0 27%, #d33a32 28% 47%, #111a20 48% 66%, #d33a32 67% 82%, #111a20 83%)',
    summary: 'Koi hitam dengan pola hi merah atau jingga yang membungkus tubuh.',
    identify: 'Tidak memiliki shiroji; pola sumi dan hi dapat hadir di kepala serta melewati garis lateral.',
    quality: 'Sumi pekat, hi merata, batas warna bersih, pola kepala kuat, dan tidak muncul bercak putih.',
    confused: 'Aka Bekko memiliki dasar merah dengan bercak hitam yang tidak membungkus tubuh seperti Utsuri.'
  },
  {
    name: 'Asagi', japanese: '浅黄', category: 'asagi-shusui', group: 'Asagi–Shusui', colors: 'Biru • Shiroji • Hi',
    image: 'assets/varieties/asagi.webp',
    pattern: 'repeating-linear-gradient(45deg, rgba(25,69,92,.72) 0 3px, transparent 3px 13px), repeating-linear-gradient(-45deg, rgba(25,69,92,.45) 0 3px, transparent 3px 13px), linear-gradient(#9ec4d1 0 65%, #d54a42 66%)',
    summary: 'Koi bersisik biru keabu-abuan dengan pola jaring dan hi pada sisi bawah tubuh.',
    identify: 'Retikulasi teratur di punggung; hi berkembang pada pipi, sisi badan, perut, dan sirip.',
    quality: 'Jaring sisik rapi dan seragam, kepala bersih, warna biru lembut, serta hi tidak naik terlalu tinggi.',
    confused: 'Shusui adalah bentuk Doitsu dari Asagi dengan baris sisik besar di sepanjang punggung.'
  },
  {
    name: 'Shusui', japanese: '秋翠', category: 'asagi-shusui', group: 'Asagi–Shusui', colors: 'Biru • Shiroji • Hi',
    image: 'assets/varieties/shusui.webp',
    pattern: 'linear-gradient(90deg, transparent 0 43%, #274b63 44% 48%, #a9d1db 49% 51%, #274b63 52% 56%, transparent 57%), linear-gradient(#d8edf0 0 66%, #d84a41 67%)',
    summary: 'Asagi Doitsu dengan kulit terang dan baris sisik gelap di sepanjang dorsal.',
    identify: 'Tidak memiliki retikulasi penuh; sisik dorsal besar tersusun rapi dari bahu menuju ekor.',
    quality: 'Baris sisik dorsal simetris, kulit bersih, hi seimbang di sisi, dan tidak ada sisik liar.',
    confused: 'Asagi memiliki sisik penuh dengan pola jaring pada punggung.'
  },
  {
    name: 'Goshiki', japanese: '五色', category: 'koromo', group: 'Koromo–Goshiki', colors: 'Lima warna',
    image: 'assets/varieties/goshiki.webp',
    pattern: 'radial-gradient(circle at 35% 50%, #c93238 0 20%, transparent 21%), radial-gradient(circle at 75% 40%, #d33a3f 0 18%, transparent 19%), repeating-linear-gradient(45deg, rgba(21,42,55,.55) 0 3px, transparent 3px 12px), #9fb4bd',
    summary: 'Koi nonmetallic dengan campuran putih, merah, hitam, biru muda, dan biru gelap.',
    identify: 'Hi menyerupai pola Kohaku di atas dasar atau retikulasi gelap yang memberi kesan lima warna.',
    quality: 'Hi bersih dan tebal, retikulasi tertata, kontras kuat, kulit berkualitas, dan pola seimbang.',
    confused: 'Ai Goromo memiliki sisik biru gelap yang terutama membingkai bagian hi, bukan seluruh dasar tubuh.'
  },
  {
    name: 'Chagoi', japanese: '茶鯉', category: 'kawarimono', group: 'Kawarimono', colors: 'Cokelat • Teh',
    pattern: 'repeating-linear-gradient(45deg, rgba(77,51,31,.16) 0 2px, transparent 2px 12px), linear-gradient(135deg, #9a6b42, #c69868)',
    summary: 'Koi satu warna cokelat atau warna teh yang dikenal mudah jinak dan berpotensi tumbuh besar.',
    identify: 'Warna tubuh relatif seragam dengan pola sisik teratur; tidak memiliki pola warna kontras.',
    quality: 'Body panjang dan bervolume, sisik seragam, warna bersih, fukurin rapi, serta tanpa bercak.',
    confused: 'Soragoi berwarna abu-abu; Karashigoi berwarna kuning mustard.'
  },
  {
    name: 'Soragoi', japanese: '空鯉', category: 'kawarimono', group: 'Kawarimono', colors: 'Abu-abu',
    image: 'assets/varieties/soragoi.webp',
    pattern: 'repeating-linear-gradient(45deg, rgba(27,48,60,.22) 0 2px, transparent 2px 12px), linear-gradient(135deg, #778d97, #b6c4c9)',
    summary: 'Koi satu warna abu-abu dengan pola sisik yang menjadi daya tarik utama.',
    identify: 'Warna abu-abu merata dari kepala ke ekor, tanpa pola warna lain yang dominan.',
    quality: 'Body kuat, skala sisik konsisten, fukurin jelas, warna merata, dan kepala bersih.',
    confused: 'Chagoi cenderung cokelat; Ochiba memiliki pola cokelat di atas dasar abu-abu.'
  },
  {
    name: 'Ochiba Shigure', japanese: '落葉しぐれ', category: 'kawarimono', group: 'Kawarimono', colors: 'Abu-abu • Cokelat',
    image: 'assets/varieties/ochiba-shigure.webp',
    pattern: 'radial-gradient(ellipse at 28% 52%, #a16c40 0 20%, transparent 21%), radial-gradient(ellipse at 70% 42%, #9b6339 0 24%, transparent 25%), repeating-linear-gradient(45deg, rgba(30,51,61,.14) 0 2px, transparent 2px 13px), #98aeb6',
    summary: 'Koi abu-abu dengan pola cokelat yang menyerupai daun gugur di permukaan air.',
    identify: 'Dasar seperti Soragoi dipadukan dengan pola cokelat bergaya Kohaku.',
    quality: 'Body, keseragaman sisik, kontras dua warna, kiwa pola, dan komposisi dari kepala ke ekor.',
    confused: 'Soragoi hanya abu-abu; Chagoi umumnya satu warna cokelat tanpa pola abu-abu.'
  },
  {
    name: 'Karashigoi', japanese: '芥子鯉', category: 'kawarimono', group: 'Kawarimono', colors: 'Kuning mustard',
    image: 'assets/varieties/karashigoi.webp',
    pattern: 'repeating-linear-gradient(45deg, rgba(91,69,22,.13) 0 2px, transparent 2px 13px), linear-gradient(135deg, #d0a936, #ead578)',
    summary: 'Koi satu warna kuning mustard yang terkenal dengan pertumbuhan dan karakter ramah.',
    identify: 'Warna kuning lembut sampai mustard yang merata, dapat hadir dalam tipe sisik berbeda.',
    quality: 'Body jumbo, warna konsisten, kulit bersih, susunan sisik rapi, dan kepala proporsional.',
    confused: 'Yamabuki Ogon memiliki kilau metallic yang jelas; Karashigoi bersifat nonmetallic.'
  },
  {
    name: 'Yamabuki Ogon', japanese: '山吹黄金', category: 'hikari', group: 'Hikarimuji', colors: 'Kuning metallic',
    image: 'assets/varieties/yamabuki-ogon.webp',
    pattern: 'repeating-linear-gradient(45deg, rgba(255,255,255,.28) 0 2px, transparent 2px 13px), linear-gradient(135deg, #d99c0b, #ffe279 48%, #c98a00)',
    summary: 'Koi satu warna kuning keemasan dengan kilau metallic di seluruh tubuh dan sirip.',
    identify: 'Tidak memiliki pola warna lain; kilau hikari harus tampak konsisten termasuk pada kepala dan sirip.',
    quality: 'Lustre kuat, warna merata, sisik dan fukurin rapi, kepala bersih, serta body bervolume.',
    confused: 'Karashigoi berwarna mustard tetapi tidak memiliki kilau metallic.'
  },
  {
    name: 'Platinum Ogon', japanese: 'プラチナ黄金', category: 'hikari', group: 'Hikarimuji', colors: 'Putih metallic',
    image: 'assets/varieties/platinum-ogon.webp',
    pattern: 'repeating-linear-gradient(45deg, rgba(90,122,137,.14) 0 2px, transparent 2px 13px), linear-gradient(135deg, #c7d4d9, #ffffff 48%, #aebfc6)',
    summary: 'Koi satu warna putih-perak metallic tanpa pola warna lain.',
    identify: 'Kilau platinum menutupi tubuh, kepala, dan sirip secara merata.',
    quality: 'Hikari cerah tanpa kusam, kepala bersih, warna seragam, susunan sisik rapi, dan body.',
    confused: 'Shiromuji berwarna putih tetapi nonmetallic.'
  },
  {
    name: 'Shiro Bekko', japanese: '白べっ甲', category: 'bekko', group: 'Bekko', colors: 'Shiroji • Sumi',
    pattern: 'radial-gradient(circle at 35% 45%, #16212a 0 10%, transparent 11%), radial-gradient(circle at 68% 58%, #111b22 0 13%, transparent 14%), #f7faf9',
    summary: 'Koi dasar putih dengan bercak sumi yang berada terutama di bagian punggung.',
    identify: 'Kepala umumnya bersih tanpa sumi; bercak hitam tidak membungkus tubuh dan tidak turun dominan ke perut.',
    quality: 'Shiroji bersih, kepala mulus, sumi pekat dan seimbang, pola bahu kuat, serta sirip yang rapi.',
    confused: 'Shiro Utsuri memiliki karakter dasar hitam, sumi di kepala, pola membungkus tubuh, dan sering memiliki motoguro.'
  },
  {
    name: 'Ai Goromo', japanese: '藍衣', category: 'koromo', group: 'Koromo', colors: 'Shiroji • Hi • Biru indigo',
    pattern: 'radial-gradient(circle at 32% 50%, #c83a3a 0 19%, transparent 20%), radial-gradient(circle at 70% 42%, #bd3439 0 20%, transparent 21%), repeating-linear-gradient(45deg, rgba(28,65,95,.28) 0 2px, transparent 2px 11px), #f6faf9',
    summary: 'Koi bergaya Kohaku dengan sisik berbingkai biru indigo di dalam pola hi.',
    identify: 'Warna biru muncul seperti jaring pada sisik di area merah, sementara shiroji tetap tampak bersih.',
    quality: 'Pola dasar Kohaku yang seimbang, shiroji cerah, hi kuat, dan retikulasi biru yang rapi serta tidak berlebihan.',
    confused: 'Goshiki biasanya memperlihatkan retikulasi lebih luas pada dasar tubuh, bukan hanya pada bagian hi.'
  },
  {
    name: 'Aka Matsuba', japanese: '赤松葉', category: 'kawarimono', group: 'Kawarimono', colors: 'Merah • Retikulasi gelap',
    pattern: 'repeating-linear-gradient(45deg, rgba(48,38,35,.32) 0 2px, transparent 2px 12px), repeating-linear-gradient(-45deg, rgba(48,38,35,.2) 0 2px, transparent 2px 12px), #c95743',
    summary: 'Koi merah nonmetallic dengan bagian tengah sisik lebih gelap menyerupai susunan buah pinus.',
    identify: 'Kepala dan sirip relatif polos, sedangkan punggung menampilkan pola matsuba yang teratur.',
    quality: 'Warna merah merata, kepala bersih, retikulasi konsisten, sisik tersusun rapi, dan body proporsional.',
    confused: 'Kin Matsuba memiliki kilau metallic keemasan, sedangkan Aka Matsuba bersifat nonmetallic.'
  },
  {
    name: 'Gin Matsuba', japanese: '銀松葉', category: 'hikari', group: 'Hikarimuji', colors: 'Platinum • Retikulasi gelap',
    pattern: 'repeating-linear-gradient(45deg, rgba(41,61,73,.3) 0 2px, transparent 2px 12px), repeating-linear-gradient(-45deg, rgba(41,61,73,.18) 0 2px, transparent 2px 12px), linear-gradient(135deg, #b8c8cf, #f9ffff 48%, #9fb1b9)',
    summary: 'Koi platinum metallic dengan pusat sisik gelap yang membentuk pola matsuba.',
    identify: 'Kilau putih-perak menutupi tubuh dan sirip, dipadukan dengan retikulasi gelap yang seragam di punggung.',
    quality: 'Lustre kuat, kepala bersih, pola sisik teratur, retikulasi seragam, dan tidak ada noda warna lain.',
    confused: 'Platinum Ogon sama-sama metallic putih tetapi tidak memiliki pola gelap di tengah sisik.'
  },
  {
    name: 'Kujaku', japanese: '孔雀', category: 'hikari', group: 'Hikarimoyo', colors: 'Platinum • Hi • Matsuba',
    pattern: 'radial-gradient(circle at 30% 50%, #d14a37 0 19%, transparent 20%), radial-gradient(circle at 70% 44%, #ce4735 0 20%, transparent 21%), repeating-linear-gradient(45deg, rgba(37,57,68,.28) 0 2px, transparent 2px 12px), linear-gradient(135deg, #dae5e7, #ffffff)',
    summary: 'Koi metallic berpola merah dengan retikulasi matsuba di atas dasar platinum.',
    identify: 'Memadukan pola menyerupai Kohaku, kilau hikari, dan pusat sisik gelap yang tampak seperti jaring.',
    quality: 'Lustre merata, pola hi seimbang, retikulasi rapi, kepala bersih, dan sisik tidak berantakan.',
    confused: 'Goshiki bersifat nonmetallic; Hariwake metallic tetapi tidak memiliki retikulasi matsuba.'
  },
  {
    name: 'Hariwake', japanese: 'ハリワケ', category: 'hikari', group: 'Hikarimoyo', colors: 'Platinum • Kuning atau jingga',
    pattern: 'radial-gradient(ellipse at 30% 48%, #e0a51c 0 20%, transparent 21%), radial-gradient(ellipse at 72% 44%, #e8b528 0 23%, transparent 24%), linear-gradient(135deg, #dce7e9, #ffffff 48%, #bac9ce)',
    summary: 'Koi metallic dua warna dengan dasar platinum dan pola kuning atau jingga.',
    identify: 'Kilau metallic hadir di seluruh tubuh; pola berwarna terang berdiri di atas dasar putih-perak.',
    quality: 'Hikari cerah, kepala bersih, tepi pola rapi, warna merata, komposisi seimbang, dan body kuat.',
    confused: 'Yamabuki Ogon hanya memiliki satu warna kuning metallic tanpa pola platinum.'
  },
  {
    name: 'Kikusui', japanese: '菊水', category: 'hikari', group: 'Hikarimoyo', colors: 'Platinum • Hi • Doitsu',
    pattern: 'radial-gradient(ellipse at 28% 48%, #d44235 0 18%, transparent 19%), radial-gradient(ellipse at 68% 45%, #d94b39 0 21%, transparent 22%), linear-gradient(135deg, #d7e4e7, #ffffff 48%, #b5c7cd)',
    summary: 'Koi Doitsu metallic dengan dasar platinum dan pola merah atau jingga.',
    identify: 'Permukaan tubuh minim sisik, memiliki kilau hikari dan pola menyerupai Kohaku.',
    quality: 'Kulit bersih, kilau merata, pola hi kuat dan seimbang, garis dorsal rapi, serta bebas sisik liar.',
    confused: 'Doitsu Hariwake biasanya berpola kuning; Kikusui menampilkan pola merah atau jingga yang lebih dekat ke Kohaku.'
  },
  {
    name: 'Kumonryu', japanese: '九紋竜', category: 'kawarimono', group: 'Kawarimono', colors: 'Putih • Sumi • Doitsu',
    pattern: 'linear-gradient(125deg, #eef5f4 0 20%, #172129 21% 39%, #f5f9f8 40% 58%, #111b22 59% 76%, #f5f9f8 77%)',
    summary: 'Koi Doitsu hitam-putih dengan pola sumi yang dapat berubah mengikuti kondisi dan pertumbuhan.',
    identify: 'Tubuh minim sisik dengan pola hitam-putih bergaya awan; sumi dapat muncul atau menghilang seiring waktu.',
    quality: 'Kontras warna, kulit bersih, pola kepala menarik, keseimbangan sumi, body, dan susunan sisik dorsal yang rapi.',
    confused: 'Shiro Utsuri umumnya bersisik penuh dan dinilai sebagai kelompok Utsurimono.'
  },
  {
    name: 'Benigoi', japanese: '紅鯉', category: 'kawarimono', group: 'Kawarimono', colors: 'Merah atau jingga',
    pattern: 'repeating-linear-gradient(45deg, rgba(106,34,25,.11) 0 2px, transparent 2px 13px), linear-gradient(135deg, #c84031, #ed7251)',
    summary: 'Koi nonmetallic satu warna merah atau jingga tanpa pola warna lain.',
    identify: 'Warna tubuh seragam dari kepala sampai ekor dan tidak memiliki dasar putih seperti Kohaku.',
    quality: 'Body bervolume, warna merata, kulit bersih, kepala proporsional, serta sisik dan sirip yang rapi.',
    confused: 'Aka Matsuba memiliki pusat sisik gelap; Kohaku mempunyai pola hi di atas dasar putih.'
  },
  {
    name: 'Kigoi', japanese: '黄鯉', category: 'kawarimono', group: 'Kawarimono', colors: 'Kuning nonmetallic',
    pattern: 'repeating-linear-gradient(45deg, rgba(93,74,22,.1) 0 2px, transparent 2px 13px), linear-gradient(135deg, #e4c23e, #f4dd75)',
    summary: 'Koi satu warna kuning cerah tanpa kilau metallic.',
    identify: 'Warna kuning relatif seragam; sebagian Kigoi memiliki mata merah sebagai karakter albino.',
    quality: 'Kuning bersih dan merata, body kuat, kepala mulus, sisik teratur, serta bebas bercak warna lain.',
    confused: 'Yamabuki Ogon memiliki kilau metallic; Karashigoi cenderung berwarna kuning mustard.'
  },
  {
    name: 'Karasugoi', japanese: '烏鯉', category: 'kawarimono', group: 'Kawarimono', colors: 'Hitam',
    pattern: 'repeating-linear-gradient(45deg, rgba(120,148,158,.09) 0 2px, transparent 2px 13px), linear-gradient(135deg, #10181d, #33424a)',
    summary: 'Koi berwarna hitam pekat yang menjadi induk kelompok beberapa varietas hitam Kawarimono.',
    identify: 'Tubuh didominasi warna hitam tanpa pola putih luas seperti Kumonryu atau Hageshiro.',
    quality: 'Body besar, warna hitam merata dan dalam, kulit sehat, sisik rapi, serta kepala dan sirip bersih.',
    confused: 'Kumonryu menampilkan pola putih yang jelas; Magoi umumnya dipandang sebagai ikan leluhur, bukan varietas hias yang sama.'
  },
  {
    name: 'Yamato Nishiki', japanese: '大和錦', category: 'hikari', group: 'Hikarimoyo', colors: 'Platinum • Hi • Sumi',
    pattern: 'radial-gradient(circle at 28% 50%, #d13e34 0 18%, transparent 19%), radial-gradient(circle at 68% 44%, #ce3b32 0 20%, transparent 21%), radial-gradient(circle at 78% 33%, #182129 0 8%, transparent 9%), linear-gradient(135deg, #d9e5e7, #ffffff)',
    summary: 'Versi metallic bergaya Taisho Sanke dengan dasar putih-perak, hi, dan sumi.',
    identify: 'Pola tiga warna menyerupai Sanke tetapi seluruh kulit dan sirip memperlihatkan kilau hikari.',
    quality: 'Lustre merata, shiroji metallic bersih, hi kuat, sumi pekat, dan keseimbangan pola tiga warna.',
    confused: 'Taisho Sanke memiliki komposisi serupa tetapi bersifat nonmetallic.'
  },
  {
    name: 'Kin Showa', japanese: '金昭和', category: 'hikari', group: 'Hikari Utsurimono', colors: 'Metallic • Hi • Sumi • Shiroji',
    pattern: 'linear-gradient(120deg, #172129 0 22%, transparent 23% 40%, #d24a32 41% 62%, transparent 63%), radial-gradient(circle at 75% 32%, #121b22 0 16%, transparent 17%), linear-gradient(135deg, #d5c391, #fff5ce)',
    summary: 'Showa Sanshoku berkilau metallic dengan pola hitam, merah, dan putih.',
    identify: 'Memiliki karakter pola Showa—termasuk sumi di kepala dan motoguro—dengan kilau hikari di tubuh serta sirip.',
    quality: 'Lustre kuat, sumi pekat, warna hi bersih, keseimbangan tiga warna, pola kepala, motoguro, dan body.',
    confused: 'Showa Sanshoku bersifat nonmetallic; Yamato Nishiki memiliki karakter pola seperti Sanke.'
  },
  {
    name: 'Tancho', japanese: '丹頂', category: 'lainnya', group: 'Pola khusus', colors: 'Tanda hi di kepala',
    image: 'assets/varieties/tancho.webp',
    pattern: 'radial-gradient(circle at 50% 46%, #d43035 0 22%, transparent 23%), #f7faf9',
    summary: 'Sebutan untuk koi dengan satu tanda hi di kepala dan tanpa hi lain pada tubuh.',
    identify: 'Tanda kepala idealnya berdiri sendiri dan tidak menyentuh mata, hidung, bahu, atau sirip.',
    quality: 'Bentuk dan posisi tanda kepala, kualitas warna, body, kulit, serta karakter dasar varietasnya.',
    confused: 'Maruten memiliki tanda hi terpisah di kepala tetapi masih mempunyai pola hi lain pada tubuh.'
  }
];

function renderVarieties() {
  const query = varietySearch.value.trim().toLocaleLowerCase('id-ID');
  const filtered = koiVarieties.filter((item) => {
    const matchesCategory = activeVarietyCategory === 'all' || item.category === activeVarietyCategory;
    const searchable = [item.name, item.japanese, item.group, item.colors, item.summary, item.identify, item.quality, item.confused].join(' ').toLocaleLowerCase('id-ID');
    return matchesCategory && searchable.includes(query);
  });

  varietyGrid.innerHTML = filtered.map((item) => `
    <article class="variety-card">
      <div class="variety-visual${item.image ? ' has-photo' : ''}" style="--pattern:${item.pattern}">
        ${item.image ? `<img class="variety-photo" src="${item.image}" alt="Koi ${item.name} tampak atas" loading="lazy">` : ''}
        <span class="variety-group">${item.group}</span>
      </div>
      <div class="variety-body">
        <h3>${item.name}</h3><span class="variety-japanese">${item.japanese}</span>
        <span class="variety-colors">${item.colors}</span>
        <p class="variety-summary">${item.summary}</p>
        <details>
          <summary>Pelajari cirinya</summary>
          <div class="variety-details">
            <div><strong>Ciri pembeda</strong><span>${item.identify}</span></div>
            <div><strong>Fokus memilih</strong><span>${item.quality}</span></div>
            <div><strong>Sering tertukar</strong><span>${item.confused}</span></div>
          </div>
        </details>
      </div>
    </article>
  `).join('');

  document.querySelector('#variety-count').textContent = filtered.length;
  document.querySelector('#empty-varieties').classList.toggle('hidden', filtered.length > 0);
}

varietySearch.addEventListener('input', renderVarieties);
varietyFilters.forEach((button) => {
  button.addEventListener('click', () => {
    activeVarietyCategory = button.dataset.category;
    varietyFilters.forEach((item) => item.classList.toggle('active', item === button));
    renderVarieties();
  });
});

renderVarieties();

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

quarantineShapeTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    quarantineShape = tab.dataset.qShape;
    quarantineShapeTabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    const isRectangle = quarantineShape === 'rectangle';
    document.querySelector('#q-rectangle-fields').classList.toggle('hidden', !isRectangle);
    document.querySelector('#q-circle-fields').classList.toggle('hidden', isRectangle);
    document.querySelector('#q-length').required = isRectangle;
    document.querySelector('#q-width').required = isRectangle;
    document.querySelector('#q-diameter').required = !isRectangle;
  });
});

treatmentTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    treatmentType = tab.dataset.treatment;
    treatmentTabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
    });

    ['salt', 'powder', 'liquid'].forEach((type) => {
      const active = type === treatmentType;
      document.querySelector(`#${type}-fields`).classList.toggle('hidden', !active);
      document.querySelectorAll(`#${type}-fields input`).forEach((input) => { input.required = active; });
    });
  });
});

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

const getBottomDrainRecommendation = (liters) => {
  if (liters <= 5000) return '1 × 3 inci';
  const drainCount = Math.ceil(liters / 15000);
  return `${drainCount} × 4 inci`;
};

const getAeratorRecommendation = (liters) => ({
  minimum: (liters / 1000) * 7,
  ideal: (liters / 1000) * 10
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const depth = Number(document.querySelector('#depth').value);
  const averageKoiLength = Number(document.querySelector('#average-koi-length').value);
  let liters = 0;
  let baseArea = 0;

  if (activeShape === 'rectangle') {
    const length = Number(document.querySelector('#length').value);
    const width = Number(document.querySelector('#width').value);
    baseArea = length * width;
    liters = (length * width * depth) / 1000;
  } else {
    const diameter = Number(document.querySelector('#diameter').value);
    const radius = diameter / 2;
    baseArea = Math.PI * radius * radius;
    liters = (Math.PI * radius * radius * depth) / 1000;
  }

  if (![liters, baseArea, averageKoiLength].every(Number.isFinite) || liters <= 0 || baseArea <= 0 || averageKoiLength <= 0) return;

  const chamberLiters = liters * 0.3;
  const aerator = getAeratorRecommendation(liters);
  const idealKoiCount = Math.floor(baseArea / 150 / averageKoiLength);

  document.querySelector('#result-liters').textContent = `${formatter.format(liters)} liter`;
  document.querySelector('#result-cubic').textContent = `${formatter.format(liters / 1000)} m³`;
  document.querySelector('#result-pump').textContent = `${formatter.format(liters)} L/jam`;
  document.querySelector('#result-bottom-drain').textContent = getBottomDrainRecommendation(liters);
  document.querySelector('#result-chamber').textContent = `${formatter.format(chamberLiters)} liter`;
  document.querySelector('#result-aerator').textContent = `${formatter.format(aerator.minimum)}–${formatter.format(aerator.ideal)} LPM`;
  document.querySelector('#result-ideal-koi').textContent = `${formatter.format(idealKoiCount)} ekor`;
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

treatmentForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const depth = Number(document.querySelector('#q-depth').value);
  let volume = 0;

  if (quarantineShape === 'rectangle') {
    const length = Number(document.querySelector('#q-length').value);
    const width = Number(document.querySelector('#q-width').value);
    volume = (length * width * depth) / 1000;
  } else {
    const diameter = Number(document.querySelector('#q-diameter').value);
    volume = (Math.PI * Math.pow(diameter / 2, 2) * depth) / 1000;
  }

  if (!Number.isFinite(volume) || volume <= 0) return;

  let doseText = '';
  let kindText = '';
  let noteText = '';

  if (treatmentType === 'salt') {
    const current = Number(document.querySelector('#salt-current').value);
    const target = Number(document.querySelector('#salt-target').value);
    if (target <= current) {
      document.querySelector('#salt-target').setCustomValidity('Kadar target harus lebih tinggi daripada kadar saat ini.');
      document.querySelector('#salt-target').reportValidity();
      return;
    }
    document.querySelector('#salt-target').setCustomValidity('');
    doseText = `${doseFormatter.format(volume * (target - current) / 1000)} kg garam`;
    kindText = 'Garam';
    noteText = 'Larutkan garam terlebih dahulu dan masukkan secara bertahap. Ukur kembali salinitas air.';
  } else if (treatmentType === 'powder') {
    const mgPerLiter = Number(document.querySelector('#powder-dose').value);
    doseText = `${doseFormatter.format(volume * mgPerLiter / 1000)} gram`;
    kindText = 'Obat bubuk';
    noteText = 'Pastikan angka mg/L berasal dari label produk atau referensi yang sesuai untuk bahan tersebut.';
  } else {
    const productDose = Number(document.querySelector('#liquid-dose').value);
    const referenceVolume = Number(document.querySelector('#liquid-reference-volume').value);
    doseText = `${doseFormatter.format(volume * productDose / referenceVolume)} mL`;
    kindText = 'Obat cair';
    noteText = 'Cocokkan kembali konsentrasi produk dan aturan mL per liter pada label sebelum digunakan.';
  }

  document.querySelector('#treatment-dose').textContent = doseText;
  document.querySelector('#treatment-volume').textContent = `${formatter.format(volume)} liter`;
  document.querySelector('#treatment-kind').textContent = kindText;
  document.querySelector('#treatment-note').textContent = noteText;
  document.querySelector('#treatment-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
