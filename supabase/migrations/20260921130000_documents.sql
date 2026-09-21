-- PrepPulse Schritt 2: Dokumente (PDF-Uploads) inkl. privatem Storage-Bucket und RLS.

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  file_name text not null check (char_length(file_name) between 1 and 255),
  storage_path text not null unique,
  file_size bigint not null check (file_size > 0),
  mime_type text not null default 'application/pdf',
  page_count integer check (page_count is null or page_count > 0),
  -- Fortschritt der späteren KI-Verarbeitung (Karteikarten, Quiz, Zusammenfassung)
  status text not null default 'uploaded'
    check (status in ('uploaded', 'processing', 'ready', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Datei muss im eigenen Ordner liegen: verhindert Verweise auf fremde Storage-Objekte.
  constraint documents_path_in_own_folder check (storage_path like user_id::text || '/%')
);

comment on table public.documents is 'Hochgeladene Lernunterlagen (PDF). Datei liegt im Bucket "documents".';

create index documents_user_id_created_at_idx
  on public.documents (user_id, created_at desc);

alter table public.documents enable row level security;

create policy "documents_select_own"
  on public.documents for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "documents_insert_own"
  on public.documents for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "documents_update_own"
  on public.documents for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "documents_delete_own"
  on public.documents for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- Privater Bucket: nur PDF, max. 20 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 20971520, array['application/pdf'])
on conflict (id) do nothing;

-- Storage-Policies: Zugriff nur auf den eigenen Ordner "{user_id}/...".
-- Bewusst keine UPDATE-Policy: Dateien werden nie überschrieben (kein upsert).
create policy "documents_storage_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "documents_storage_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "documents_storage_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
