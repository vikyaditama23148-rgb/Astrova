import 'server-only';
import { GoogleGenAI } from '@google/genai';
import { getAstroSettings } from '@/lib/astrobot';
import { buildEvaluationReport, type EvaluationReport } from '@/lib/report';
import { db } from '@/lib/supabase/admin';

const pct = (x: number) => `${Math.round(x * 100)}%`;

/**
 * Kalimat AstroBot murni dari TEMPLATE (tanpa AI). Ini fallback wajib yang
 * SELALU benar karena isinya hanya menyusun ulang angka dari EvaluationReport
 * — dipakai bila AstroBot nonaktif/API key kosong/panggilan AI gagal, supaya
 * fitur laporan tidak pernah kosong atau salah.
 */
export function templateNarrative(r: EvaluationReport): string {
  const parts: string[] = [];
  const first = r.studentName.split(' ')[0] || r.studentName;
  parts.push(`Halo, ${first}! Aku sudah melihat seluruh perjalanan belajarmu di Astrova. 🚀`);

  if (r.preScore != null && r.postScore != null) {
    const naik = r.postScore - r.preScore;
    if (naik > 0) parts.push(`Nilai Misi Pemanasanmu ${r.preScore}, dan nilai Ujian Akhirmu naik jadi ${r.postScore} — itu peningkatan ${naik} poin dengan kategori N-Gain "${r.nGainCat}"! 🌟`);
    else if (naik === 0) parts.push(`Nilai Misi Pemanasan dan Ujian Akhirmu sama-sama ${r.postScore}. Pemahamanmu sudah stabil sejak awal.`);
    else parts.push(`Nilai Ujian Akhirmu ${r.postScore}, sedikit berbeda dari Misi Pemanasan (${r.preScore}). Tidak apa-apa, yuk pelajari lagi bagian yang masih membingungkan.`);
  }

  if (r.strongModules.length) parts.push(`Kamu paling jago di modul "${r.strongModules[0].title}" dengan skor ${r.strongModules[0].score}! 🏆`);
  if (r.strongestType && r.strongestType.total >= 2) parts.push(`Kamu juga hebat mengerjakan soal tipe "${r.strongestType.label}" (benar ${r.strongestType.correct} dari ${r.strongestType.total} soal, ${pct(r.strongestType.accuracy)}).`);

  if (r.weakModules.length) parts.push(`Yuk pelajari lagi modul "${r.weakModules[0].title}" (skor ${r.weakModules[0].score}) — coba buka lagi bagian Explore-nya sebelum mengulang Test-nya.`);
  else if (r.weakestType && r.weakestType.total >= 2 && r.weakestType.accuracy < 0.7) parts.push(`Soal tipe "${r.weakestType.label}" masih agak menantang untukmu (${pct(r.weakestType.accuracy)} benar). Coba latihan lagi ya!`);
  else parts.push(`Semua modul kamu kerjakan dengan baik — pertahankan terus semangat belajarmu!`);

  parts.push(`Kamu sudah mengumpulkan ${r.totalStars} dari ${r.maxStars} bintang dan ${r.badgesEarned} lencana. Teruslah menjadi penjelajah antariksa yang hebat! 🪐`);
  return parts.join(' ');
}

const GROUNDING_PROMPT = `Kamu adalah AstroBot, robot antariksa ramah di website belajar Astrova untuk siswa kelas V SD.

Tugasmu: menulis SATU paragraf pendek (5-7 kalimat) berisi laporan hasil belajar siswa, berdasarkan DATA yang diberikan.

ATURAN WAJIB — SANGAT PENTING:
1. HANYA boleh menyebut angka, nama modul, dan fakta yang ADA di DATA. DILARANG KERAS mengarang, menambah, atau menebak angka/fakta yang tidak ada di DATA.
2. Jika DATA tidak menyebutkan sesuatu, jangan berkomentar tentang hal itu sama sekali.
3. Sebutkan MINIMAL: (a) peningkatan nilai dari Pre-Test ke Post-Test beserta angkanya, (b) satu kekuatan konkret dengan nama modul atau tipe soal beserta angkanya, (c) satu area yang perlu diperdalam dengan nama modul atau tipe soal beserta angkanya (jika ada; jika tidak ada area lemah, berikan pujian umum sesuai data).
4. Bahasa Indonesia yang hangat, positif, dan memotivasi anak SD kelas V. Boleh pakai 1-2 emoji.
5. Jangan memberi saran atau instruksi teknis di luar konteks belajar Tata Surya di Astrova.
6. Tulis sebagai satu paragraf mengalir, BUKAN daftar poin/bullet.`;

/**
 * Minta AstroBot (Gemini) merangkai fakta di EvaluationReport menjadi kalimat
 * hangat — tapi HANYA dari fakta yang diberikan (grounding ketat di atas).
 * Kalau API key tidak ada, AstroBot nonaktif di admin, atau panggilan gagal,
 * otomatis jatuh ke templateNarrative() yang 100% pasti benar.
 */
export async function buildNarrative(r: EvaluationReport): Promise<{ text: string; source: 'ai' | 'template' }> {
  const fallback = () => ({ text: templateNarrative(r), source: 'template' as const });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback();

  const settings = await getAstroSettings();
  if (!settings.enabled) return fallback();

  const facts = {
    nama: r.studentName,
    pre_test: r.preScore, post_test: r.postScore,
    peningkatan_n_gain: r.nGainValue, kategori_n_gain: r.nGainCat,
    total_bintang: r.totalStars, maksimal_bintang: r.maxStars,
    lencana_diraih: r.badgesEarned, total_lencana: r.badgesTotal,
    menit_eksplorasi_total: r.exploreMinutesTotal,
    modul_terkuat: r.strongModules.slice(0, 2).map((m) => ({ nama: m.title, skor: m.score })),
    modul_perlu_diperdalam: r.weakModules.slice(0, 2).map((m) => ({ nama: m.title, skor: m.score })),
    tipe_soal_terkuat: r.strongestType ? { nama: r.strongestType.label, benar: r.strongestType.correct, total: r.strongestType.total } : null,
    tipe_soal_perlu_dilatih: r.weakestType ? { nama: r.weakestType.label, benar: r.weakestType.correct, total: r.weakestType.total } : null,
  };

  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: settings.model,
      contents: [{ role: 'user', parts: [{ text: `DATA (gunakan HANYA angka/fakta ini, dalam format JSON):\n${JSON.stringify(facts)}` }] }],
      config: { systemInstruction: GROUNDING_PROMPT, maxOutputTokens: 320, temperature: 0.35 },
    });
    const text = (res.text ?? '').trim();
    if (!text || text.length < 20) return fallback();
    return { text, source: 'ai' };
  } catch (e) {
    console.error('[Laporan Belajar] Gagal membuat narasi AI, pakai template:', e);
    return fallback();
  }
}

export interface StoredLearningReport { report: EvaluationReport; narrative: string; source: 'ai' | 'template'; generatedAt: string }

/**
 * Ambil laporan yang SUDAH ada di database (cache), atau hitung + buat baru
 * sekali saja lalu simpan. Ini mencegah AstroBot dipanggil ulang setiap kali
 * siswa membuka halaman laporan — data dan narasinya stabil setelah dibuat.
 * Mengembalikan null jika Post-Test siswa belum selesai.
 */
export async function getOrCreateLearningReport(userId: string): Promise<StoredLearningReport | null> {
  const sb = db();
  const { data: cached } = await sb.from('learning_reports').select('*').eq('user_id', userId).maybeSingle();
  if (cached) return { report: cached.report_json as EvaluationReport, narrative: cached.narrative, source: cached.source, generatedAt: cached.generated_at };

  const report = await buildEvaluationReport(userId);
  if (!report) return null;

  const { text, source } = await buildNarrative(report);
  const generatedAt = new Date().toISOString();
  await sb.from('learning_reports').upsert({ user_id: userId, report_json: report, narrative: text, source, generated_at: generatedAt }, { onConflict: 'user_id' });
  return { report, narrative: text, source, generatedAt };
}