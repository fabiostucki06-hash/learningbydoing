-- PrepPulse Schritt 1: Profile (1:1 zu auth.users) inkl. RLS und Auto-Anlage bei Signup.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Öffentliches Nutzerprofil, 1:1 zu auth.users.';

alter table public.profiles enable row level security;

-- Nutzer sehen und ändern ausschließlich das eigene Profil.
-- (select auth.uid()) statt auth.uid(): wird einmal pro Query statt pro Zeile ausgewertet.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Bewusst keine INSERT/DELETE-Policy: Anlage übernimmt der Trigger unten,
-- Löschung passiert per ON DELETE CASCADE beim Löschen des Auth-Users.

-- updated_at automatisch pflegen
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Profil bei Registrierung automatisch anlegen
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        nullif(split_part(new.email, '@', 1), '')
      ),
      80
    )
  );
  return new;
end;
$$;

-- Trigger-Funktion darf nicht über die API aufrufbar sein.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
