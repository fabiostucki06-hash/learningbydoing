-- Karteikarten mit Spaced Repetition (Leitner, 5 Boxen): Decks, Karten, Reviews, Lerntage.

create table public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.decks is 'Kartenstapel eines Nutzers.';

create index decks_user_id_created_at_idx on public.decks (user_id, created_at desc);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  front text not null check (char_length(front) between 1 and 2000),
  back text not null check (char_length(back) between 1 and 2000),
  -- Leitner-Box 1..5. Neue Karten starten in Box 1 und sind sofort fällig.
  box smallint not null default 1 check (box between 1 and 5),
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cards is 'Karteikarten inkl. SRS-Zustand (Box und Fälligkeit).';

create index cards_deck_id_idx on public.cards (deck_id);
create index cards_user_id_due_at_idx on public.cards (user_id, due_at);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  known boolean not null,
  box_before smallint not null check (box_before between 1 and 5),
  box_after smallint not null check (box_after between 1 and 5),
  reviewed_at timestamptz not null default now(),
  -- Kalendertag in Schweizer Zeit: Grundlage für Streak und Tagesstatistik.
  reviewed_on date not null default ((now() at time zone 'Europe/Zurich')::date)
);

comment on table public.reviews is 'Einzelne Bewertungen (gewusst / nicht gewusst) für Streak und Statistik.';

create index reviews_user_id_reviewed_on_idx on public.reviews (user_id, reviewed_on);

alter table public.decks enable row level security;
alter table public.cards enable row level security;
alter table public.reviews enable row level security;

-- Decks
create policy "decks_select_own" on public.decks for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "decks_insert_own" on public.decks for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "decks_update_own" on public.decks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "decks_delete_own" on public.decks for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Karten: zusätzlich muss das Deck dem Nutzer gehören, sonst könnte man Karten in fremde Decks schieben.
create policy "cards_select_own" on public.cards for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "cards_insert_own" on public.cards for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.decks d
      where d.id = deck_id and d.user_id = (select auth.uid())
    )
  );
create policy "cards_update_own" on public.cards for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.decks d
      where d.id = deck_id and d.user_id = (select auth.uid())
    )
  );
create policy "cards_delete_own" on public.cards for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Reviews: nur lesen und anlegen (Historie bleibt unverändert). Löschen läuft über ON DELETE CASCADE.
create policy "reviews_select_own" on public.reviews for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "reviews_insert_own" on public.reviews for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.cards c
      where c.id = card_id and c.user_id = (select auth.uid())
    )
  );

-- set_updated_at() kommt aus der profiles-Migration.
create trigger decks_set_updated_at
  before update on public.decks
  for each row execute function public.set_updated_at();

create trigger cards_set_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

-- Lerntage der letzten N Tage (für den Streak). Läuft mit den Rechten des Aufrufers, RLS gilt.
create function public.study_days(days integer default 120)
returns table (day date)
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct r.reviewed_on
  from public.reviews r
  where r.user_id = (select auth.uid())
    and r.reviewed_on >= (now() at time zone 'Europe/Zurich')::date - days
  order by 1 desc
$$;

revoke execute on function public.study_days(integer) from public, anon;
grant execute on function public.study_days(integer) to authenticated;
