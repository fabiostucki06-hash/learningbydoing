-- Prüfungskalender: anstehende Prüfungen mit Fach, Terminzeitpunkt und Themen, inkl. RLS.

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject text not null check (char_length(subject) between 1 and 100),
  -- Optionaler Zusatz, z. B. "Test 3" oder "Semesterprüfung".
  title text check (title is null or char_length(title) between 1 and 100),
  starts_at timestamptz not null,
  topics text[] not null default '{}' check (cardinality(topics) <= 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.exams is 'Prüfungstermine des Nutzers (Kalender, Countdown, Erinnerungen).';

create index exams_user_id_starts_at_idx
  on public.exams (user_id, starts_at);

alter table public.exams enable row level security;

create policy "exams_select_own"
  on public.exams for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "exams_insert_own"
  on public.exams for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "exams_update_own"
  on public.exams for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "exams_delete_own"
  on public.exams for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- set_updated_at() kommt aus der profiles-Migration.
create trigger exams_set_updated_at
  before update on public.exams
  for each row execute function public.set_updated_at();
