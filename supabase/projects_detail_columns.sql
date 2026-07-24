-- Loyiha detail sahifasi uchun yangi ustunlar
-- Supabase SQL Editor da BIR MARTA Run

alter table public.projects
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists youtube_url text,
  add column if not exists gallery text[] not null default '{}',
  add column if not exists price text,
  add column if not exists for_sale boolean not null default false;

-- slug unique (bo'sh bo'lmaganlar uchun)
create unique index if not exists projects_slug_unique
  on public.projects (slug)
  where slug is not null and slug <> '';

-- mavjud loyihalarga slug (ixtiyoriy)
update public.projects
set slug = lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null or slug = '';
