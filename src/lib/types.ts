export type QuestionType =
  | 'simulation_driven'
  | 'drag_drop'
  | 'ordering'
  | 'hotspot'
  | 'scenario'
  | 'multiple_choice';

export type QuizPurpose = 'module_test' | 'pre_test' | 'post_test';

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  simulation_driven: 'Simulasi (geser slider)',
  drag_drop: 'Seret & Letakkan',
  ordering: 'Mengurutkan',
  hotspot: 'Hotspot (cari yang salah)',
  scenario: 'Skenario Cerita',
  multiple_choice: 'Pilihan Ganda (Pre/Post-Test)',
};

export const PURPOSE_LABEL: Record<QuizPurpose, string> = {
  module_test: 'Test Modul',
  pre_test: 'Pre-Test',
  post_test: 'Post-Test',
};

/** Maksimum percobaan per soal di Test modul sebelum penjelasan ditampilkan. */
export const MAX_ATTEMPTS = 3;

export interface LearnCard {
  title: string;
  body: string;
  emoji?: string;
  analogy?: string;
  image_url?: string;
  audio_url?: string;
}

export type ExploreConfig =
  | { type: 'planet_viewer'; planets: string[]; min_seconds?: number; instruction?: string }
  | { type: 'day_night'; min_seconds?: number; instruction?: string }
  | { type: 'space_calculator'; planets?: string[]; min_seconds?: number; instruction?: string }
  | { type: 'moon_phases'; min_seconds?: number; instruction?: string };

export interface ModuleRow {
  id: string;
  title: string;
  planet_name: string | null;
  description: string | null;
  learn_content: LearnCard[] | null;
  explore_config: ExploreConfig | null;
  is_published: boolean;
  order_index: number;
}

export interface ProgressRow {
  module_id: string;
  learn_completed: boolean;
  explore_completed: boolean;
  test_completed: boolean;
  test_score: number;
  time_spent_explore_seconds: number;
}

/** Soal yang dikirim ke browser siswa (TANPA kunci jawaban). */
export interface PublicQuestion {
  id: string;
  type: QuestionType;
  text: string;
  data: Record<string, any>;
}

export interface QuestionState {
  attempts: number;
  resolved: boolean;
  correct: boolean;
  bestScore: number;
}

export interface StudentSession {
  id: string;
  name: string;
  avatar: string;
  className: string | null;
}

export const AVATARS: Record<string, string> = {
  'astro-1': '🧑‍🚀',
  'astro-2': '👩‍🚀',
  'astro-3': '👨‍🚀',
  'astro-4': '🦊',
  'astro-5': '🐱',
  'astro-6': '🐼',
  'astro-7': '🦉',
  'astro-8': '🐙',
};
export const avatarEmoji = (id?: string | null) => AVATARS[id ?? ''] ?? '🧑‍🚀';