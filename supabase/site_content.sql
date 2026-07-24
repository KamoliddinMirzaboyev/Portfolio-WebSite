-- ============================================================
-- Sayt kontenti (hero, about, experience, skills, education)
-- Supabase → SQL Editor → Run
-- ============================================================

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "Public read site_content" on public.site_content;
create policy "Public read site_content"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "Write site_content" on public.site_content;
create policy "Write site_content"
  on public.site_content for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Update site_content" on public.site_content;
create policy "Update site_content"
  on public.site_content for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Delete site_content" on public.site_content;
create policy "Delete site_content"
  on public.site_content for delete
  to anon, authenticated
  using (true);

-- Custom kategoriyalar uchun projects.category check ni yumshatish
do $$
begin
  alter table public.projects drop constraint if exists projects_category_check;
exception when undefined_table then
  null;
end $$;

alter table public.projects
  drop constraint if exists projects_category_check;
