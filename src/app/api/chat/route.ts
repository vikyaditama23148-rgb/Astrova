import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/supabase/admin';
import { getStudentId } from '@/lib/session';
import { getAstroSettings } from '@/lib/astrobot';

const schema = z.object({
  message: z.string().trim().min(1).max(300),
  moduleId: z.string().max(50).optional(),
  phase: z.enum(['learn', 'explore', 'test', 'pretest', 'posttest', 'hub']).optional(),
  history: z.array(z.object({ role: z.enum(['user', 'bot']), text: z.string().max(600) })).max(8).optional(),
});

export async function POST(req: Request) {
  const userId = await getStudentId();
  if (!userId) return NextResponse.json({ error: 'Belum login' }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Pesan kosong atau terlalu panjang (maks. 300 karakter).' }, { status: 400 });
  const { message, moduleId, phase, history = [] } = parsed.data;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ reply: 'AstroBot sedang istirahat. Tanya gurumu dulu ya! 🛰️' });

  const settings = await getAstroSettings();
  if (!settings.enabled) return NextResponse.json({ reply: 'AstroBot sedang istirahat dulu. Kita ketemu lagi nanti ya! 😴' });

  // Batas pesan harian per siswa
  const since = new Date(); since.setHours(0, 0, 0, 0);
  const { count } = await db().from('chat_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', since.toISOString());
  if ((count ?? 0) >= settings.daily_message_limit) {
    return NextResponse.json({ reply: 'Wah, jatah ngobrolmu hari ini sudah habis. Besok kita lanjut ya! 🌙' });
  }

  // Konteks ringan (tanpa kunci soal)
  let context = '';
  if (moduleId) {
    const { data: m } = await db().from('modules').select('title').eq('id', moduleId).maybeSingle();
    if (m) context = `\n\nKonteks: siswa sedang di modul "${m.title}"${phase ? `, fase ${phase.toUpperCase()}` : ''}.`;
  } else if (phase === 'pretest' || phase === 'posttest') {
    context = '\n\nKonteks: siswa sedang mengerjakan tes penilaian. Jangan bantu menjawab soal tes; beri semangat saja.';
  }

  const contents = [
    ...history.map((h) => ({ role: h.role === 'bot' ? 'model' : 'user', parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: message }] },
  ];

  let reply = 'Hmm, sinyal antariksaku putus-putus. Coba tanya lagi ya! 📡';
  let tokens = 0;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: settings.model,
      contents,
      config: {
        systemInstruction: settings.system_prompt + context,
        maxOutputTokens: settings.max_output_tokens,
        temperature: 0.7,
        ...(settings.model.includes('2.5-flash') ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    });
    reply = (res.text ?? '').trim() || reply;
    tokens = res.usageMetadata?.totalTokenCount ?? 0;
  } catch (e) {
    console.error('[AstroBot]', e);
  }

  await db().from('chat_logs').insert({ user_id: userId, module_id: moduleId ?? null, user_message: message, bot_message: reply, tokens_used: tokens });
  return NextResponse.json({ reply });
}
