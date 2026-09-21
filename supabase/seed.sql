-- =====================================================================
--  Astrova — Data Awal (3 modul, bank soal, pre/post-test, pengaturan AstroBot)
--  Jalankan SETELAH schema.sql. Aman dijalankan ulang (modul di-update,
--  soal hanya dimasukkan bila bank soal masih kosong).
-- =====================================================================

-- MODUL ---------------------------------------------------------------
insert into modules (id, title, planet_name, description, learn_content, explore_config, is_published, order_index) values
('keluarga-matahari', 'Keluarga Besar Matahari', 'Matahari',
 'Kenalan dengan Matahari dan 8 planet, lalu bedakan planet dalam dan planet luar.',
 $j$[
  {"emoji":"🚀","title":"Selamat datang, Penjelajah!","body":"Kamu diterima di Akademi Penjelajah Astrova! Hari ini Kapten Nova mengajakmu berkeliling \"kampung halaman\" Bumi, yaitu Tata Surya."},
  {"emoji":"☀️","title":"Matahari, Sang Pusat","body":"Matahari adalah bintang yang menjadi pusat Tata Surya. Ia memberi cahaya dan panas untuk semua planet.","analogy":"Bayangkan Matahari sebesar bola basket. Bumi hanya sebesar biji merica kecil yang diletakkan di dekatnya!"},
  {"emoji":"🪐","title":"8 Planet Bersaudara","body":"Ada 8 planet yang mengelilingi Matahari: Merkurius, Venus, Bumi, Mars, Jupiter, Saturnus, Uranus, dan Neptunus. Gerakan mengelilingi Matahari ini disebut revolusi.","analogy":"Seperti teman-teman yang berlari mengelilingi lapangan, dengan Matahari di tengahnya."},
  {"emoji":"🛰️","title":"Planet Dalam dan Planet Luar","body":"Planet dalam (Merkurius, Venus, Bumi, Mars) berada di dekat Matahari dan bertubuh batuan. Planet luar (Jupiter, Saturnus, Uranus, Neptunus) berada di seberang sabuk asteroid dan bertubuh raksasa."}
 ]$j$::jsonb,
 $j${"type":"planet_viewer","planets":["matahari","merkurius","venus","bumi","mars","jupiter","saturnus","uranus","neptunus"],"min_seconds":20,"instruction":"Geser planet ke kiri, kanan, atas, atau bawah. Ketuk titik bercahaya untuk membaca fakta!"}$j$::jsonb,
 true, 1),

('bumi-rotasi', 'Bumi Berputar: Siang dan Malam', 'Bumi',
 'Temukan mengapa siang dan malam bergantian lewat simulasi jam interaktif.',
 $j$[
  {"emoji":"🌍","title":"Bumi Berputar Seperti Gasing","body":"Bumi berputar pada porosnya. Gerakan berputar ini disebut rotasi.","analogy":"Seperti gasing yang berputar di lantai, Bumi berputar terus tanpa henti."},
  {"emoji":"⏰","title":"Satu Putaran = 24 Jam","body":"Satu kali rotasi Bumi memerlukan waktu sekitar 24 jam, yaitu satu hari satu malam."},
  {"emoji":"🌗","title":"Siang dan Malam","body":"Matahari hanya menyinari separuh Bumi. Bagian yang terkena cahaya mengalami siang, bagian yang gelap mengalami malam. Karena Bumi berotasi, siang dan malam bergantian.","analogy":"Bayangkan bola di kamar gelap dan senter yang menyala. Hanya sisi bola yang disorot senter yang terang."},
  {"emoji":"🌅","title":"Matahari Terbit di Timur","body":"Bumi berotasi dari barat ke timur, sehingga Matahari tampak terbit di timur dan terbenam di barat. Itu sebabnya Indonesia bagian timur (WIT) lebih dulu terang daripada Indonesia bagian barat (WIB)."}
 ]$j$::jsonb,
 $j${"type":"day_night","min_seconds":25,"instruction":"Geser slider jam atau tekan Putar. Perhatikan Rani di Indonesia saat Bumi berputar!"}$j$::jsonb,
 true, 2),

('planet-lain', 'Aku di Planet Lain', 'Mars',
 'Hitung berat dan umurmu di planet lain, lalu bandingkan panas dan dinginnya.',
 $j$[
  {"emoji":"⚖️","title":"Berat Badanmu Bisa Berubah!","body":"Gravitasi adalah gaya tarik planet. Semakin kuat gravitasi sebuah planet, semakin berat timbanganmu terasa di sana."},
  {"emoji":"🔴","title":"Di Mars Kamu Lebih Ringan","body":"Gravitasi Mars hanya sekitar 38% gravitasi Bumi. Kalau timbanganmu di Bumi 40 kg, di Mars hanya sekitar 15 kg. Kamu bisa melompat jauh lebih tinggi!"},
  {"emoji":"📅","title":"Setahun di Planet Lain","body":"Satu tahun adalah waktu satu kali revolusi mengelilingi Matahari. Bumi 365 hari, Merkurius cuma 88 hari, sedangkan Neptunus hampir 165 tahun Bumi!","analogy":"Makin jauh dari Matahari, lintasannya makin panjang, jadi perjalanannya makin lama."},
  {"emoji":"🌡️","title":"Panas dan Dingin","body":"Venus adalah planet terpanas (sekitar 464°C) karena atmosfernya tebal menahan panas, walaupun Merkurius lebih dekat ke Matahari. Neptunus sangat dingin, sekitar minus 200°C."}
 ]$j$::jsonb,
 $j${"type":"space_calculator","min_seconds":25,"instruction":"Masukkan berat badan dan umurmu, lalu lihat angkanya di setiap planet!"}$j$::jsonb,
 true, 3)
on conflict (id) do update set
  title = excluded.title, planet_name = excluded.planet_name, description = excluded.description,
  learn_content = excluded.learn_content, explore_config = excluded.explore_config,
  is_published = excluded.is_published, order_index = excluded.order_index;

-- BANK SOAL -----------------------------------------------------------
do $seed$
begin
if (select count(*) from quiz_questions) = 0 then

-- ===== TEST MODUL: keluarga-matahari =====
insert into quiz_questions (module_id, purpose, question_type, question_text, question_data_json, correct_answer_json, explanation, order_index) values
('keluarga-matahari','module_test','drag_drop',
 'Bantu Kapten Nova! Masukkan setiap planet ke kelompok yang tepat: planet dalam atau planet luar.',
 $j${"items":[{"id":"jupiter","label":"Jupiter","emoji":"🟠"},{"id":"venus","label":"Venus","emoji":"🟡"},{"id":"neptunus","label":"Neptunus","emoji":"🔵"},{"id":"mars","label":"Mars","emoji":"🔴"},{"id":"saturnus","label":"Saturnus","emoji":"🪐"},{"id":"merkurius","label":"Merkurius","emoji":"⚪"}],
   "categories":[{"id":"dalam","label":"Planet Dalam","emoji":"🔥"},{"id":"luar","label":"Planet Luar","emoji":"❄️"}],
   "hint":"Planet dalam ada di antara Matahari dan sabuk asteroid. Coba lihat urutan planet di simulasi!",
   "hint_sim":{"type":"planet_viewer","planets":["merkurius","venus","bumi","mars","jupiter","saturnus","neptunus"]}}$j$::jsonb,
 $j${"mapping":{"jupiter":"luar","venus":"dalam","neptunus":"luar","mars":"dalam","saturnus":"luar","merkurius":"dalam"}}$j$::jsonb,
 'Planet dalam: Merkurius, Venus, Bumi, Mars. Planet luar: Jupiter, Saturnus, Uranus, Neptunus. Keduanya dipisahkan oleh sabuk asteroid.', 1),
('keluarga-matahari','module_test','ordering',
 'Urutkan planet dari yang PALING DEKAT sampai PALING JAUH dari Matahari. Geser kartunya!',
 $j${"items":[{"id":"bumi","label":"Bumi","emoji":"🌍"},{"id":"mars","label":"Mars","emoji":"🔴"},{"id":"merkurius","label":"Merkurius","emoji":"⚪"},{"id":"venus","label":"Venus","emoji":"🟡"}],
   "top_label":"Paling dekat Matahari","bottom_label":"Paling jauh dari Matahari",
   "hint":"Ingat singkatan Me-Ve-Bu-Ma dari planet dalam!",
   "hint_sim":{"type":"planet_viewer","planets":["merkurius","venus","bumi","mars"]}}$j$::jsonb,
 $j${"order":["merkurius","venus","bumi","mars"]}$j$::jsonb,
 'Urutannya Merkurius, Venus, Bumi, lalu Mars. Ingat: Me-Ve-Bu-Ma!', 2),
('keluarga-matahari','module_test','scenario',
 'Pesawat Kapten Nova baru saja melewati sabuk asteroid dari arah Matahari. Planet apa yang PERTAMA akan ia temui setelah sabuk asteroid?',
 $j${"story":"🚀 Kapten Nova terbang menjauhi Matahari. Ia sudah melewati Merkurius, Venus, Bumi, dan Mars, lalu masuk ke sabuk asteroid...",
   "choices":[{"id":"a","text":"Jupiter","emoji":"🟠"},{"id":"b","text":"Venus","emoji":"🟡"},{"id":"c","text":"Neptunus","emoji":"🔵"},{"id":"d","text":"Merkurius","emoji":"⚪"}],
   "hint":"Setelah Mars dan sabuk asteroid, kita masuk ke keluarga planet luar. Siapa yang paling dekat?",
   "hint_sim":{"type":"planet_viewer","planets":["mars","jupiter","saturnus"]}}$j$::jsonb,
 $j${"choiceId":"a"}$j$::jsonb,
 'Setelah Mars dan sabuk asteroid, planet pertama adalah Jupiter, planet luar terdekat dari Matahari.', 3),

-- ===== TEST MODUL: bumi-rotasi =====
('bumi-rotasi','module_test','simulation_driven',
 'Rani tinggal di Indonesia. Geser jam sampai Rani melihat Matahari TEPAT DI ATAS kepalanya (tengah hari)!',
 $j${"sim":"day_night","slider":{"min":0,"max":24,"step":0.5,"initial":6},
   "hint":"Tengah hari terjadi ketika Rani menghadap langsung ke Matahari.",
   "hint_sim":{"type":"day_night"}}$j$::jsonb,
 $j${"ranges":[[11.5,12.5]]}$j$::jsonb,
 'Tengah hari sekitar pukul 12.00, saat bagian Bumi tempat Rani berada menghadap langsung ke Matahari.', 1),
('bumi-rotasi','module_test','simulation_driven',
 'Sekarang geser jam sampai Rani berada di sisi Bumi yang GELAP GULITA. Bintang-bintang bersinar dan Rani tertidur lelap!',
 $j${"sim":"day_night","slider":{"min":0,"max":24,"step":0.5,"initial":12},
   "hint":"Malam terjadi di sisi Bumi yang membelakangi Matahari. Cari saat Rani berada di sisi yang tidak terkena cahaya.",
   "hint_sim":{"type":"day_night"}}$j$::jsonb,
 $j${"ranges":[[21,24],[0,3.5]]}$j$::jsonb,
 'Malam pekat terjadi sekitar pukul 21.00 sampai 03.00, ketika Rani berada di sisi Bumi yang membelakangi Matahari.', 2),
('bumi-rotasi','module_test','scenario',
 'Adit bertanya kepada Rani: "Kenapa Matahari tidak bersinar terus sepanjang hari di tempat kita?" Jawaban Rani yang tepat adalah...',
 $j${"story":"🌏 Rani dan Adit sedang menatap langit senja di halaman rumah.",
   "choices":[{"id":"a","text":"Karena Matahari mengelilingi Bumi setiap hari","emoji":"☀️"},{"id":"b","text":"Karena Bumi berotasi, sehingga bagian yang terkena sinar Matahari terus berganti","emoji":"🌍"},{"id":"c","text":"Karena Matahari dimatikan saat malam","emoji":"🔌"},{"id":"d","text":"Karena Bulan menutupi Matahari setiap malam","emoji":"🌙"}],
   "hint":"Coba putar jamnya di simulasi. Apa yang bergerak: Matahari atau Bumi?",
   "hint_sim":{"type":"day_night"}}$j$::jsonb,
 $j${"choiceId":"b"}$j$::jsonb,
 'Bumi berotasi (berputar pada porosnya) sekali dalam 24 jam, sehingga bagian yang menghadap Matahari terus berganti.', 3),

-- ===== TEST MODUL: planet-lain =====
('planet-lain','module_test','hotspot',
 'Ada SATU fakta yang salah tentang Mars! Ketuk nomor pada planet yang faktanya SALAH.',
 $j${"planet":"mars","hotspots":[
    {"id":"h1","x":36,"y":45,"label":"Warnanya merah karena mengandung karat besi"},
    {"id":"h2","x":50,"y":20,"label":"Kutubnya tertutup es"},
    {"id":"h3","x":62,"y":62,"label":"Gravitasinya lebih besar daripada Bumi"},
    {"id":"h4","x":34,"y":68,"label":"Punya dua bulan kecil: Phobos dan Deimos"}],
   "hint":"Di Mars kamu bisa melompat lebih tinggi daripada di Bumi. Apa artinya untuk gravitasinya?",
   "hint_sim":{"type":"space_calculator","planets":["bumi","mars"]}}$j$::jsonb,
 $j${"hotspotId":"h3"}$j$::jsonb,
 'Gravitasi Mars hanya sekitar 38% gravitasi Bumi, jadi kamu terasa lebih ringan di sana.', 1),
('planet-lain','module_test','ordering',
 'Urutkan dari planet yang PALING PANAS sampai PALING DINGIN!',
 $j${"items":[{"id":"mars","label":"Mars","emoji":"🔴"},{"id":"neptunus","label":"Neptunus","emoji":"🔵"},{"id":"venus","label":"Venus","emoji":"🟡"},{"id":"bumi","label":"Bumi","emoji":"🌍"}],
   "top_label":"Paling panas","bottom_label":"Paling dingin",
   "hint":"Venus tertutup atmosfer tebal yang menahan panas. Makin jauh dari Matahari, makin dingin.",
   "hint_sim":{"type":"planet_viewer","planets":["venus","bumi","mars","neptunus"]}}$j$::jsonb,
 $j${"order":["venus","bumi","mars","neptunus"]}$j$::jsonb,
 'Venus (sekitar 464°C), Bumi (sekitar 15°C), Mars (sekitar -65°C), Neptunus (sekitar -200°C).', 2),
('planet-lain','module_test','scenario',
 'Astronaut Nova beratnya 40 kg di Bumi. Ia ingin melompat SETINGGI MUNGKIN. Ke planet mana ia sebaiknya pergi?',
 $j${"story":"🧑‍🚀 Nova sedang latihan lompat tinggi untuk misi berikutnya.",
   "choices":[{"id":"a","text":"Jupiter","emoji":"🟠"},{"id":"b","text":"Bumi","emoji":"🌍"},{"id":"c","text":"Mars","emoji":"🔴"},{"id":"d","text":"Neptunus","emoji":"🔵"}],
   "hint":"Gravitasi kecil membuat badan terasa ringan. Bandingkan berat Nova di Kalkulator Antariksa!",
   "hint_sim":{"type":"space_calculator","planets":["bumi","mars","jupiter","neptunus"]}}$j$::jsonb,
 $j${"choiceId":"c"}$j$::jsonb,
 'Gravitasi Mars paling kecil di antara pilihan (sekitar 0,38 kali Bumi), jadi Nova terasa paling ringan dan bisa melompat paling tinggi.', 3);

-- ===== PRE-TEST =====
insert into quiz_questions (module_id, purpose, question_type, question_text, question_data_json, correct_answer_json, explanation, order_index) values
(null,'pre_test','multiple_choice','Benda langit yang menjadi pusat Tata Surya adalah...',
 $j${"options":[{"id":"a","text":"Bumi"},{"id":"b","text":"Matahari"},{"id":"c","text":"Bulan"},{"id":"d","text":"Jupiter"}]}$j$::jsonb,$j${"optionId":"b"}$j$::jsonb,null,1),
(null,'pre_test','multiple_choice','Jumlah planet di Tata Surya ada...',
 $j${"options":[{"id":"a","text":"7"},{"id":"b","text":"9"},{"id":"c","text":"8"},{"id":"d","text":"10"}]}$j$::jsonb,$j${"optionId":"c"}$j$::jsonb,null,2),
(null,'pre_test','multiple_choice','Rotasi Bumi menyebabkan terjadinya...',
 $j${"options":[{"id":"a","text":"Pergantian musim"},{"id":"b","text":"Gerhana bulan"},{"id":"c","text":"Bulan purnama"},{"id":"d","text":"Siang dan malam"}]}$j$::jsonb,$j${"optionId":"d"}$j$::jsonb,null,3),
(null,'pre_test','multiple_choice','Planet yang paling dekat dengan Matahari adalah...',
 $j${"options":[{"id":"a","text":"Merkurius"},{"id":"b","text":"Venus"},{"id":"c","text":"Bumi"},{"id":"d","text":"Mars"}]}$j$::jsonb,$j${"optionId":"a"}$j$::jsonb,null,4),
(null,'pre_test','multiple_choice','Satu kali rotasi Bumi memerlukan waktu sekitar...',
 $j${"options":[{"id":"a","text":"12 jam"},{"id":"b","text":"24 jam"},{"id":"c","text":"30 hari"},{"id":"d","text":"365 hari"}]}$j$::jsonb,$j${"optionId":"b"}$j$::jsonb,null,5),
(null,'pre_test','multiple_choice','Berat badanmu di Mars dibandingkan di Bumi akan terasa...',
 $j${"options":[{"id":"a","text":"Lebih berat"},{"id":"b","text":"Sama saja"},{"id":"c","text":"Lebih ringan"},{"id":"d","text":"Menjadi nol"}]}$j$::jsonb,$j${"optionId":"c"}$j$::jsonb,null,6),

-- ===== POST-TEST (bentuk paralel) =====
(null,'post_test','multiple_choice','Bintang yang memancarkan cahaya sendiri dan menjadi pusat Tata Surya adalah...',
 $j${"options":[{"id":"a","text":"Matahari"},{"id":"b","text":"Bulan"},{"id":"c","text":"Mars"},{"id":"d","text":"Bumi"}]}$j$::jsonb,$j${"optionId":"a"}$j$::jsonb,null,1),
(null,'post_test','multiple_choice','Berikut ini yang termasuk planet luar adalah...',
 $j${"options":[{"id":"a","text":"Merkurius"},{"id":"b","text":"Venus"},{"id":"c","text":"Mars"},{"id":"d","text":"Saturnus"}]}$j$::jsonb,$j${"optionId":"d"}$j$::jsonb,null,2),
(null,'post_test','multiple_choice','Gerakan Bumi berputar pada porosnya disebut...',
 $j${"options":[{"id":"a","text":"Revolusi"},{"id":"b","text":"Rotasi"},{"id":"c","text":"Erosi"},{"id":"d","text":"Evolusi"}]}$j$::jsonb,$j${"optionId":"b"}$j$::jsonb,null,3),
(null,'post_test','multiple_choice','Dari Bumi, Matahari tampak terbit di arah...',
 $j${"options":[{"id":"a","text":"Barat"},{"id":"b","text":"Utara"},{"id":"c","text":"Selatan"},{"id":"d","text":"Timur"}]}$j$::jsonb,$j${"optionId":"d"}$j$::jsonb,null,4),
(null,'post_test','multiple_choice','Planet terpanas di Tata Surya adalah...',
 $j${"options":[{"id":"a","text":"Merkurius"},{"id":"b","text":"Venus"},{"id":"c","text":"Jupiter"},{"id":"d","text":"Mars"}]}$j$::jsonb,$j${"optionId":"b"}$j$::jsonb,null,5),
(null,'post_test','multiple_choice','Jika gravitasi sebuah planet lebih besar daripada Bumi, berat badanmu di sana akan terasa...',
 $j${"options":[{"id":"a","text":"Lebih ringan"},{"id":"b","text":"Sama saja"},{"id":"c","text":"Lebih berat"},{"id":"d","text":"Hilang"}]}$j$::jsonb,$j${"optionId":"c"}$j$::jsonb,null,6);

end if;
end
$seed$;

-- PENGATURAN ASTROBOT -------------------------------------------------
insert into app_settings (key, value) values
('astrobot', $j${
  "enabled": true,
  "model": "gemini-2.5-flash",
  "max_output_tokens": 220,
  "daily_message_limit": 30,
  "system_prompt": "Kamu adalah AstroBot, robot antariksa yang ramah dan ceria, maskot website Astrova. Kamu menemani siswa kelas V SD (usia 10-11 tahun) belajar IPAS materi Tata Surya.\n\nAturan wajib:\n1. Gunakan bahasa Indonesia yang santai, hangat, dan mudah dipahami anak SD.\n2. Jawab MAKSIMAL 3 kalimat pendek. Boleh memakai 1 emoji.\n3. Jika siswa meminta jawaban soal kuis atau tes, JANGAN membocorkan jawabannya. Beri petunjuk atau pertanyaan pancingan (scaffolding) agar siswa berpikir sendiri, dan sarankan memakai tombol Intip Simulasi.\n4. Hanya bahas Tata Surya, benda langit, rotasi, revolusi, gravitasi, dan topik IPAS yang terkait. Jika di luar itu, tolak dengan ramah dan ajak kembali belajar.\n5. Jangan meminta atau menyimpan data pribadi. Jangan membuat konten kekerasan atau dewasa.\n6. Jika tidak yakin, katakan jujur bahwa kamu belum tahu dan sarankan bertanya kepada guru."
}$j$::jsonb)
on conflict (key) do nothing;
