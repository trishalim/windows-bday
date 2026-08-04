-- Supabase setup for the shared birthday desktop.
-- Run this once in your project's SQL Editor (Dashboard → SQL Editor → New query).

-- 1. Windows table -----------------------------------------------------------
create table if not exists public.desktop_windows (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  kind text not null check (kind in ('paint','txt','word','photo','sticky')),
  title text not null default '',
  x int not null default 0,
  y int not null default 0,
  w int not null default 320,
  z int not null default 10,
  minimized boolean not null default false,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Auto-bump updated_at on every update ------------------------------------
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists desktop_windows_touch on public.desktop_windows;
create trigger desktop_windows_touch
  before update on public.desktop_windows
  for each row execute function public.touch_updated_at();

-- 3. Realtime ----------------------------------------------------------------
alter table public.desktop_windows replica identity full;
alter publication supabase_realtime add table public.desktop_windows;

-- 4. Row Level Security ------------------------------------------------------
-- Public read + write. Ownership is enforced in the client (soft ownership);
-- this is a birthday keepsake board, not authenticated data.
alter table public.desktop_windows enable row level security;

drop policy if exists "public read"   on public.desktop_windows;
drop policy if exists "public insert" on public.desktop_windows;
drop policy if exists "public update" on public.desktop_windows;
drop policy if exists "public delete" on public.desktop_windows;

create policy "public read"   on public.desktop_windows for select using (true);
create policy "public insert" on public.desktop_windows for insert with check (true);
create policy "public update" on public.desktop_windows for update using (true) with check (true);
create policy "public delete" on public.desktop_windows for delete using (true);

-- 5. Storage bucket for paint drawings + photo uploads -----------------------
-- A PUBLIC bucket serves file content via its public URL without any SELECT
-- policy on storage.objects. We deliberately do NOT add a SELECT policy: it
-- would let clients list every file in the bucket, and the app never lists —
-- it only uploads and builds public URLs. So we grant INSERT + UPDATE only.
-- file_size_limit + allowed_mime_types are a server-side backstop: even if a
-- client skips the in-app downscale, nothing oversized or non-image can land.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'desktop-media', 'desktop-media', true,
  10485760, -- 10 MB
  array['image/jpeg','image/png','image/gif','image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Remove the old broad read policy if a previous run created it.
drop policy if exists "media public read"   on storage.objects;
drop policy if exists "media public insert" on storage.objects;
drop policy if exists "media public update" on storage.objects;

create policy "media public insert" on storage.objects for insert with check (bucket_id = 'desktop-media');
create policy "media public update" on storage.objects for update using (bucket_id = 'desktop-media') with check (bucket_id = 'desktop-media');
