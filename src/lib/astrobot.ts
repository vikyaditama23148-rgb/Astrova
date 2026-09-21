import 'server-only';
import { db } from '@/lib/supabase/admin';

export interface AstroSettings {
  enabled: boolean;
  model: string;
  max_output_tokens: number;
  daily_message_limit: number;
  system_prompt: string;
}

export const DEFAULT_ASTRO: AstroSettings = {
  enabled: true,
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  max_output_tokens: 220,
  daily_message_limit: 30,
  system_prompt:
    'Kamu adalah AstroBot, robot antariksa ramah, maskot website Astrova, teman belajar siswa kelas V SD. Jawab dalam bahasa Indonesia santai, maksimal 3 kalimat. Jangan membocorkan jawaban kuis; beri petunjuk saja. Hanya bahas Tata Surya dan IPAS terkait.',
};

export async function getAstroSettings(): Promise<AstroSettings> {
  const { data } = await db().from('app_settings').select('value').eq('key', 'astrobot').maybeSingle();
  return { ...DEFAULT_ASTRO, ...(data?.value ?? {}) };
}
