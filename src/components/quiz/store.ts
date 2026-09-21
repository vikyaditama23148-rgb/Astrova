import { create } from 'zustand';
import type { QuestionState } from '@/lib/types';

export interface Feedback { correct: boolean; resolved: boolean; explanation: string | null; score: number; attempts: number }

interface QuizStore {
  index: number;
  states: Record<string, QuestionState>;
  answer: Record<string, any> | null;
  hintUsed: boolean;
  feedback: Feedback | null;
  aggregate: { score: number; completed: boolean } | null;
  init: (states: Record<string, QuestionState>, firstIndex: number) => void;
  setAnswer: (a: Record<string, any> | null) => void;
  useHint: () => void;
  setFeedback: (f: Feedback | null) => void;
  setState: (id: string, s: QuestionState) => void;
  setAggregate: (a: { score: number; completed: boolean }) => void;
  next: () => void;
  retry: () => void;
}

/** State lokal interaksi kuis (Zustand). */
export const useQuizStore = create<QuizStore>((set) => ({
  index: 0, states: {}, answer: null, hintUsed: false, feedback: null, aggregate: null,
  init: (states, firstIndex) => set({ states, index: firstIndex, answer: null, hintUsed: false, feedback: null, aggregate: null }),
  setAnswer: (answer) => set({ answer }),
  useHint: () => set({ hintUsed: true }),
  setFeedback: (feedback) => set({ feedback }),
  setState: (id, s) => set((st) => ({ states: { ...st.states, [id]: s } })),
  setAggregate: (aggregate) => set({ aggregate }),
  next: () => set((st) => ({ index: st.index + 1, answer: null, hintUsed: false, feedback: null })),
  retry: () => set({ answer: null, feedback: null }),
}));
