import 'server-only';
import { db } from '@/lib/supabase/admin';
import { MAX_ATTEMPTS, type PublicQuestion, type QuestionState, type QuestionType, type QuizPurpose } from '@/lib/types';

export type QuizScope = { purpose: 'module_test'; moduleId: string } | { purpose: 'pre_test' | 'post_test' };

/** Bandingkan jawaban siswa dengan kunci — dijalankan HANYA di server. */
export function gradeAnswer(type: QuestionType, answer: any, key: any): boolean {
  if (answer == null || key == null) return false;
  switch (type) {
    case 'simulation_driven': {
      const v = Number(answer.value);
      if (!Number.isFinite(v)) return false;
      const ranges: [number, number][] = Array.isArray(key.ranges) ? key.ranges : [[Number(key.min), Number(key.max)]];
      return ranges.some(([a, b]) => v >= a && v <= b);
    }
    case 'drag_drop': {
      const m = answer.mapping ?? {};
      const k = key.mapping ?? {};
      const ids = Object.keys(k);
      return ids.length > 0 && ids.length === Object.keys(m).length && ids.every((id) => m[id] === k[id]);
    }
    case 'ordering': {
      const a = answer.order, k = key.order;
      return Array.isArray(a) && Array.isArray(k) && a.length === k.length && a.every((v: string, i: number) => v === k[i]);
    }
    case 'hotspot':
      return answer.hotspotId != null && answer.hotspotId === key.hotspotId;
    case 'scenario': {
      const accepted: string[] = Array.isArray(key.choiceIds) ? key.choiceIds : [key.choiceId];
      return accepted.includes(answer.choiceId);
    }
    case 'multiple_choice': {
      const accepted: string[] = Array.isArray(key.optionIds) ? key.optionIds : [key.optionId];
      return accepted.includes(answer.optionId);
    }
    default:
      return false;
  }
}

/** Skor per soal: makin sedikit percobaan & bantuan, makin tinggi. Pre/Post-test: benar = 100. */
export function scoreForAttempt(purpose: QuizPurpose, correct: boolean, attemptNo: number, hintUsed: boolean): number {
  if (!correct) return 0;
  if (purpose !== 'module_test') return 100;
  const base = attemptNo <= 1 ? 100 : attemptNo === 2 ? 70 : 40;
  return Math.max(0, base - (hintUsed ? 20 : 0));
}

export function toPublic(q: any): PublicQuestion {
  return { id: q.id, type: q.question_type, text: q.question_text, data: q.question_data_json ?? {} };
}

export function questionStateFromAttempts(list: any[], purpose: QuizPurpose): QuestionState {
  const overridden = list.filter((a) => a.is_overridden);
  const best = overridden.length
    ? overridden[overridden.length - 1].score_given
    : list.reduce((m, a) => Math.max(m, a.score_given ?? 0), 0);
  const correct = list.some((a) => a.is_correct);
  const limit = purpose === 'module_test' ? MAX_ATTEMPTS : 1;
  return {
    attempts: list.length,
    correct,
    resolved: correct || overridden.length > 0 || list.length >= limit,
    bestScore: list.length ? best : 0,
  };
}

/** Ambil soal (tanpa kunci) + status pengerjaan siswa untuk satu lingkup kuis. */
export async function loadQuiz(userId: string, scope: QuizScope) {
  const sb = db();
  let q = sb.from('quiz_questions').select('id, question_type, question_text, question_data_json, order_index, created_at').eq('purpose', scope.purpose);
  if (scope.purpose === 'module_test') q = q.eq('module_id', scope.moduleId);
  const { data: qs, error } = await q.order('order_index').order('created_at');
  if (error) throw error;
  const questions = (qs ?? []).map(toPublic);
  const ids = questions.map((x) => x.id);
  const states: Record<string, QuestionState> = {};
  if (ids.length) {
    const { data: atts } = await sb
      .from('quiz_attempts')
      .select('question_id, score_given, is_correct, is_overridden, created_at')
      .eq('user_id', userId)
      .in('question_id', ids)
      .order('created_at');
    const grouped: Record<string, any[]> = {};
    (atts ?? []).forEach((a: any) => (grouped[a.question_id] ??= []).push(a));
    ids.forEach((id) => (states[id] = questionStateFromAttempts(grouped[id] ?? [], scope.purpose)));
  }
  return { questions, states };
}
