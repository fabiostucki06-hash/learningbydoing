-- Wiederherstellung der am 2026-09-21 gelöschten Alt-Tabellen (ursprüngliche Struktur).
-- Stellt nur das Schema wieder her, keine Daten und keine Policies.
-- Bewusst NICHT unter supabase/migrations/: wird nur manuell im SQL Editor ausgeführt.

create table if not exists public.customers (
  id         text primary key,
  data       jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id         text primary key,
  data       jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.offerten (
  id   text primary key,
  data jsonb not null
);

create table if not exists public.rechnungen (
  id   text primary key,
  data jsonb not null
);

create table if not exists public.whitelist (
  email      text primary key,
  added_by   text,
  created_at timestamptz default now()
);

create table if not exists public.counters (
  id    text primary key,
  value integer default 0
);

-- RLS war vorher überall aktiv. Ohne Policies ist der API-Zugriff für anon/authenticated gesperrt.
alter table public.customers  enable row level security;
alter table public.orders     enable row level security;
alter table public.offerten   enable row level security;
alter table public.rechnungen enable row level security;
alter table public.whitelist  enable row level security;
alter table public.counters   enable row level security;
