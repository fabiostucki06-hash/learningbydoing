-- KI-Probeprüfungen: aus einem hochgeladenen PDF erzeugte Multiple-Choice-Fragen, pro Deck abgelegt.

create table public.mock_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  deck_id uuid not null references public.decks (id) on delete cascade,
  -- Quelle. Wird das PDF gelöscht, bleibt die Probeprüfung erhalten.
  document_id uuid references public.documents (id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  -- [{ question, options: [text, ...], correctIndex, explanation }]; wird serverseitig validiert.
  questions jsonb not null check (jsonb_typeof(questions) = 'array'),
  created_at timestamptz not null default now()
);

comment on table public.mock_exams is 'KI-generierte Probeprüfungen (Multiple Choice) zu einem Deck.';

create index mock_exams_deck_id_created_at_idx on public.mock_exams (deck_id, created_at desc);
create index mock_exams_user_id_idx on public.mock_exams (user_id);

alter table public.mock_exams enable row level security;

create policy "mock_exams_select_own" on public.mock_exams for select to authenticated
  using ((select auth.uid()) = user_id);

-- Deck (und Dokument, falls angegeben) müssen dem Nutzer gehören, sonst könnte man Prüfungen in fremde Decks schieben.
create policy "mock_exams_insert_own" on public.mock_exams for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.decks d
      where d.id = deck_id and d.user_id = (select auth.uid())
    )
    and (
      document_id is null
      or exists (
        select 1 from public.documents doc
        where doc.id = document_id and doc.user_id = (select auth.uid())
      )
    )
  );

-- Bewusst keine UPDATE-Policy: generierte Prüfungen werden nur gelöscht oder neu erzeugt.
create policy "mock_exams_delete_own" on public.mock_exams for delete to authenticated
  using ((select auth.uid()) = user_id);
