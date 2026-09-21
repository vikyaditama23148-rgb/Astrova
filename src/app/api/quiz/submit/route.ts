import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/supabase/admin';
import { getStudentId } from '@/lib/session';
import { gradeAnswer, questionStateFromAttempts, scoreForAttempt } from '@/lib/quiz';
import { recomputeUser } from '@/lib/scoring';
import { MAX_ATTEMPTS, type QuizPurpose } from '@/lib/types';

const schema = z.object({
  questionId: z.string().uuid(),
  answer: z.record(z.string(), z.any()),
  hintUsed: z.boolean().optional(),
});

export async function POST(req: Request) {
  const userId = await getStudentId();
  if (!userId) return NextResponse.json({ error: 'Belum login' }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
  const { questionId, answer, hintUsed = false } = parsed.data;
  const sb = db();

  const { data: q } = await sb.from('quiz_questions').select('*').eq('id', questionId).maybeSingle();
  if (!q) return NextResponse.json({ error: 'Soal tidak ditemukan' }, { status: 404 });
  const purpose = q.purpose as QuizPurpose;

  // --- Gerbang alur penelitian (server-side) ---
  const { data: ev } = await sb.from('research_evaluations').select('pre_test_done_at').eq('user_id', userId).maybeSingle();
  if (purpose === 'post_test') {
    if (!ev?.pre_test_done_at) return NextResponse.json({ error: 'Selesaikan Pre-Test dulu.' }, { status: 403 });
  }
  if (purpose === 'module_test') {
    if (!ev?.pre_test_done_at) return NextResponse.json({ error: 'Selesaikan Pre-Test dulu.' }, { status: 403 });
    const { data: prog } = await sb.from('student_module_progress').select('explore_completed').eq('user_id', userId).eq('module_id', q.module_id).maybeSingle();
    if (!prog?.explore_completed) return NextResponse.json({ error: 'Selesaikan fase Explore dulu.' }, { status: 403 });
  }

  const { data: prev } = await sb.from('quiz_attempts').select('score_given, is_correct, is_overridden, created_at').eq('user_id', userId).eq('question_id', questionId).order('created_at');
  const state = questionStateFromAttempts(prev ?? [], purpose);
  if (state.resolved) return NextResponse.json({ error: 'Soal ini sudah selesai dikerjakan.' }, { status: 409 });

  const attemptNo = state.attempts + 1;
  const correct = gradeAnswer(q.question_type, answer, q.correct_answer_json);
  const score = scoreForAttempt(purpose, correct, attemptNo, purpose === 'module_test' ? hintUsed : false);

  const { error } = await sb.from('quiz_attempts').insert({
    user_id: userId,
    question_id: questionId,
    user_answer_json: answer,
    is_correct: correct,
    score_given: score,
    attempt_no: attemptNo,
    hint_used: purpose === 'module_test' ? hintUsed : false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const agg = await recomputeUser(userId);
  const limit = purpose === 'module_test' ? MAX_ATTEMPTS : 1;
  const resolved = correct || attemptNo >= limit;
  const aggregate =
    purpose === 'module_test' ? agg.modules[q.module_id] : purpose === 'pre_test' ? agg.pre : agg.post;

  // Pre/Post-Test: tidak membocorkan benar/salah (menjaga validitas instrumen penelitian).
  if (purpose !== 'module_test') {
    return NextResponse.json({ saved: true, resolved: true, aggregate });
  }
  return NextResponse.json({
    correct,
    resolved,
    attempts: attemptNo,
    score,
    explanation: resolved ? q.explanation ?? null : null,
    aggregate,
  });
}
