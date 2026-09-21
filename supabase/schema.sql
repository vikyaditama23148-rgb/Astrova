-- =====================================================================
--  Astrova — Skema Database Supabase (PostgreSQL + RLS)
--  Jalankan seluruh file ini di Supabase → SQL Editor (sekali saja).
--  Aman dijalankan ulang (idempotent).
--
--  Perbaikan dari master prompt:
--   * `TIMESTAMP WITH TIMEZONE` → `TIMESTAMPTZ` (sintaks asli tidak valid)
--   * `uuid_generate_v4()` → `gen_random_uuid()` (bawaan Postgres, tanpa ekstensi)
--   * + kolom class_name, hint/attempt_no/purpose, tabel pengaturan, log chat,
--     audit override nilai, dan fungsi atomik untuk log waktu Explore.
-- =====================================================================

-- 1. PROFILES ----------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  full_name   varchar(100) not null,
  class_name  varchar(30),
  pin_code    varchar(10),
  avatar_id   varchar(50) default 'astro-1',
  role        varchar(20) not null default 'student' check (role in ('student','admin')),
  created_at  timestamptz not null default now()
);
create index if not exists profiles_role_idx on profiles(role);

-- 2. MODULES -----------------------------------------------------------
create table if not exists modules (
  id             varchar(50) primary key,          -- contoh: 'bumi-rotasi'
  title          varchar(150) not null,
  planet_name    varchar(50),
  description    text,
  learn_content  jsonb,                            -- array kartu cerita
  explore_config jsonb,                            -- {type: 'planet_viewer' | 'day_night' | 'space_calculator', ...}
  is_published   boolean default true,
  order_index    int default 0,
  created_at     timestamptz not null default now()
);

-- 3. STUDENT MODULE PROGRESS ------------------------------------------
create table if not exists student_module_progress (
  id                         uuid primary key default gen_random_uuid(),
  user_id                    uuid references profiles(id) on delete cascade,
  module_id                  varchar(50) references modules(id) on delete cascade,
  learn_completed            boolean default false,
  explore_completed          boolean default false,
  test_completed             boolean default false,
  test_score                 int default 0,
  score_overridden           boolean default false,   -- true = nilai diubah manual admin
  time_spent_explore_seconds int default 0,
  updated_at                 timestamptz default now(),
  unique (user_id, module_id)
);

-- 4. QUIZ QUESTIONS BANK ----------------------------------------------
create table if not exists quiz_questions (
  id                  uuid primary key default gen_random_uuid(),
  module_id           varchar(50) references modules(id) on delete cascade,  -- NULL untuk pre/post-test
  purpose             varchar(20) not null default 'module_test'
                      check (purpose in ('module_test','pre_test','post_test')),
  question_type       varchar(50) not null
                      check (question_type in ('simulation_driven','drag_drop','ordering','hotspot','scenario','multiple_choice')),
  question_text       text not null,
  question_data_json  jsonb not null,     -- tampil ke siswa (JANGAN taruh kunci jawaban di sini)
  correct_answer_json jsonb not null,     -- kunci jawaban (hanya dibaca server)
  explanation         text,
  order_index         int default 0,
  created_at          timestamptz not null default now(),
  check ((purpose = 'module_test' and module_id is not null) or (purpose <> 'module_test' and module_id is null))
);
create index if not exists quiz_questions_module_idx on quiz_questions(module_id);
create index if not exists quiz_questions_purpose_idx on quiz_questions(purpose);

-- 5. QUIZ ATTEMPTS & SCORE OVERRIDES ----------------------------------
create table if not exists quiz_attempts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references profiles(id) on delete cascade,
  question_id      uuid references quiz_questions(id) on delete cascade,
  user_answer_json jsonb,
  is_correct       boolean default false,
  score_given      int default 0,
  attempt_no       int not null default 1,
  hint_used        boolean not null default false,
  is_overridden    boolean default false,
  overridden_by    uuid references profiles(id),
  override_reason  text,
  created_at       timestamptz not null default now()
);
create index if not exists quiz_attempts_user_idx on quiz_attempts(user_id);
create index if not exists quiz_attempts_question_idx on quiz_attempts(question_id);

-- 6. RESEARCH EVALUATIONS (PRE-TEST, POST-TEST, N-GAIN) ---------------
create table if not exists research_evaluations (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid unique references profiles(id) on delete cascade,
  pre_test_score       int default 0,
  post_test_score      int default 0,
  n_gain_score         numeric(6,2),
  pre_test_done_at     timestamptz,
  post_test_done_at    timestamptz,
  pre_overridden       boolean default false,
  post_overridden      boolean default false,
  completed_at         timestamptz default now()
);

-- 7. USABILITY FEEDBACK -----------------------------------------------
create table if not exists usability_feedback (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid unique references profiles(id) on delete cascade,
  rating_emoji   int check (rating_emoji between 1 and 5),
  feedback_text  text,
  created_at     timestamptz not null default now()
);

-- 8. PENGATURAN APLIKASI (AstroBot, dll) ------------------------------
create table if not exists app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- 9. LOG PERCAKAPAN ASTROBOT ------------------------------------------
create table if not exists chat_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  module_id    varchar(50),
  user_message text not null,
  bot_message  text,
  tokens_used  int default 0,
  created_at   timestamptz not null default now()
);
create index if not exists chat_logs_user_idx on chat_logs(user_id, created_at desc);

-- 10. AUDIT OVERRIDE NILAI --------------------------------------------
create table if not exists grade_overrides (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  target     text not null,               -- 'pre_test' | 'post_test' | 'module:<id>' | 'question:<id>'
  old_score  int,
  new_score  int,
  reason     text,
  admin_id   uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- FUNGSI
-- ---------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Tambah durasi Explore secara atomik (dipanggil server dengan service role)
create or replace function public.increment_explore_time(p_user uuid, p_module varchar, p_seconds int)
returns void language sql security definer set search_path = public as $$
  insert into student_module_progress (user_id, module_id, time_spent_explore_seconds)
  values (p_user, p_module, greatest(p_seconds, 0))
  on conflict (user_id, module_id) do update
    set time_spent_explore_seconds = student_module_progress.time_spent_explore_seconds + greatest(excluded.time_spent_explore_seconds, 0),
        updated_at = now();
$$;
revoke execute on function public.increment_explore_time(uuid, varchar, int) from public, anon, authenticated;
grant  execute on function public.increment_explore_time(uuid, varchar, int) to service_role;

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Siswa TIDAK memakai Supabase Auth → siswa tidak punya akses langsung ke DB.
-- Semua akses siswa lewat Route Handler Next.js (service role + JWT sesi siswa).
-- Admin (Supabase Auth, role='admin') boleh membaca/menulis semuanya.
-- Tanpa policy untuk anon = ditolak.
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','modules','student_module_progress','quiz_questions','quiz_attempts',
    'research_evaluations','usability_feedback','app_settings','chat_logs','grade_overrides'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "admin_all" on %I', t);
    execute format('create policy "admin_all" on %I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- STORAGE: bucket publik untuk aset media (SVG, WebP, MP3)
-- Upload dilakukan dari server admin (service role), baca bebas lewat URL publik.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('tatasurya-media', 'tatasurya-media', true)
on conflict (id) do update set public = true;
