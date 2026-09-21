# 🪐 Astrova — Media Pembelajaran Interaktif IPAS (Fase C, Kelas V)

Next.js 16 (App Router, TypeScript strict) · Tailwind CSS 4 · Framer Motion · Zustand · Supabase · Google Gemini (AstroBot)

Model **Tri-Phase: Learn → Explore → Test**, dilengkapi Pre/Post-Test, N-Gain otomatis, Activity Logger, survei usability, AstroBot, dan Panel Admin (CMS, override nilai, ekspor data).

## 1. Menjalankan

```bash
npm install
cp .env.example .env.local      # isi semua nilainya (lihat langkah 2–3)
npm run dev                     # http://localhost:3000
```
Butuh Node.js ≥ 20.9.

## 2. Siapkan Supabase
1. Buat project di supabase.com.
2. **SQL Editor** → jalankan `supabase/schema.sql`, lalu `supabase/seed.sql` (3 modul, 9 soal interaktif, 6 soal pre-test, 6 soal post-test, pengaturan AstroBot).
3. **Project Settings → API**: salin `URL`, `anon key`, `service_role key` ke `.env.local`.
4. Isi `SESSION_SECRET` (`openssl rand -base64 48`) dan `GEMINI_API_KEY` (aistudio.google.com).
5. Buat akun admin:
   ```bash
   npm run create-admin -- guru@sekolah.id "KataSandiKuat123" "Nama Peneliti"
   ```
6. Buka `/admin/login` → menu **Siswa** → tempel daftar nama (`Nama, Kelas` per baris). PIN 4 angka dibuat otomatis; tombol *Cetak daftar PIN* untuk dibagikan.

## 3. Deploy (Vercel + GitHub)
Push ke GitHub → import di Vercel → isi environment variables yang sama dengan `.env.example` → Deploy.

## 4. Alur penelitian (ditegakkan di server)
Pre-Test → (semua modul terbuka) Learn → Explore (≥ `min_seconds`) → Test → semua modul selesai → Post-Test → survei emotikon.
* Pre/Post-Test **tidak** memberi tahu benar/salah dan hanya boleh dijawab sekali (validitas instrumen).
* **Test modul**: maks. 3 percobaan/soal. Skor soal: percobaan ke-1 = 100, ke-2 = 70, ke-3 = 40, minus 20 bila memakai Hint. Setelah 3 kali salah, penjelasan ditampilkan (skor 0). Bintang: ≥85 = 3★, ≥60 = 2★, selain itu 1★.
* **N-Gain** = (post − pre) / (100 − pre); kategori Hake: ≥0,7 tinggi · 0,3–0,7 sedang · <0,3 rendah.
* **Activity Logger**: detik aktif di fase Explore (hanya saat tab terlihat) dikirim tiap 10 detik → `time_spent_explore_seconds`.
* **Kunci jawaban tidak pernah dikirim ke browser**; penilaian 100% di server (`src/lib/quiz.ts`).

## 5. Panel Admin (`/admin`)
| Menu | Fungsi |
|---|---|
| Dashboard | Rata-rata pre/post/N-Gain, performa per kelas, durasi Explore vs skor, matriks N-Gain |
| Siswa | Tambah massal, ubah PIN/kelas/avatar, hapus, reset progres |
| Modul | CRUD modul; editor kartu Learn; JSON parameter Explore; unggah SVG/WebP/MP3 ke Storage |
| Bank Soal | CRUD 5 tipe soal interaktif + pilihan ganda (pre/post); templat JSON per tipe; ubah kunci → **hitung ulang otomatis** |
| Buku Nilai | Override nilai per soal / total modul / pre / post (wajib alasan, tercatat di audit log), cabut override, **reset (re-test)**, **hitung ulang semua** |
| AstroBot | Model, batas token, batas pesan harian, system prompt, log percakapan |
| Ekspor Data | Satu klik `.xlsx` 4 lembar, atau CSV per lembar |

## 6. Membuat konten baru
* **Modul**: Admin → Modul → *Modul baru*. Jenis simulasi Explore: `planet_viewer` (daftar id planet), `day_night`, `space_calculator`.
* **Soal**: Admin → Bank Soal. Tambahkan `hint` dan `hint_sim` di data soal untuk tombol **Intip Simulasi**.
* Planet tersedia: matahari, merkurius, venus, bumi, mars, jupiter, saturnus, uranus, neptunus (`src/lib/planets.ts`).

## 7. Struktur
```
supabase/schema.sql · seed.sql     skema + RLS + fungsi + bucket
scripts/create-admin.mjs           membuat akun admin
src/proxy.ts                       proteksi rute (Next.js 16 menggantikan middleware.ts)
src/lib/                           quiz (penilaian), scoring (N-Gain, recompute), session, planets, research (ekspor)
src/components/PlanetCanvas.tsx    planet 3D-ish yang bisa diputar (canvas 2D + tekstur prosedural)
src/components/explore|quiz|learn  simulasi, 6 tipe soal, kartu cerita + Audio Reader
src/app/(student)                  hub, module/[id], pretest, posttest
src/app/admin                      panel admin + server actions
src/app/api                        auth siswa, progress, quiz/submit, chat (Gemini), survey, export
```

## 8. Perubahan dari master prompt (dan alasannya)
* `TIMESTAMP WITH TIMEZONE` → `TIMESTAMPTZ` (sintaks aslinya tidak valid di PostgreSQL); `uuid_generate_v4()` → `gen_random_uuid()`.
* Kolom tambahan: `profiles.class_name` (dropdown kelas), `quiz_questions.purpose` + tipe `multiple_choice` (bank soal pre/post-test), `quiz_attempts.attempt_no/hint_used`, flag `score_overridden`/`pre_overridden`/`post_overridden`.
* Tabel tambahan: `app_settings`, `chat_logs`, `grade_overrides` (audit).
* Siswa memakai **JWT cookie httpOnly** buatan server (bukan Supabase Auth) sehingga tidak ada akses langsung siswa ke database; RLS hanya mengizinkan admin.

## 9. Catatan keamanan & batasan
* PIN 4 angka disimpan apa adanya agar guru bisa membagikannya. Cocok untuk lingkungan kelas, **bukan** untuk data sensitif. Ada pembatas 5 percobaan salah/menit per siswa (berbasis memori per instance server).
* Pesan siswa dikirim ke Google Gemini; pertimbangkan izin sekolah/orang tua dan hindari mengisi data pribadi. Log obrolan bisa dilihat admin.
* Nama model Gemini bisa diganti di Admin → AstroBot (bawaan `gemini-2.5-flash`).
* Aset ilustrasi memakai tekstur prosedural (tanpa file gambar) sehingga ringan; ganti/unggah gambar sendiri di kartu Learn bila diinginkan.
