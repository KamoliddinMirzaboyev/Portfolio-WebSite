-- ============================================================
-- BIR MARTA ishga tushiring: Supabase → SQL Editor → Run
-- projects + blogs + storage + RLS
-- ============================================================

-- PROJECTS
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  info text,
  description text,
  img text,
  gallery text[] not null default '{}',
  category text not null default 'featured'
    check (category in ('featured', 'react', 'api', 'static')),
  tech text[] not null default '{}',
  github text,
  live text,
  youtube_url text,
  price text,
  for_sale boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists projects_category_idx on public.projects (category);
create index if not exists projects_sort_idx on public.projects (sort_order);

alter table public.projects enable row level security;

drop policy if exists "Public read projects" on public.projects;
create policy "Public read projects"
  on public.projects for select
  to anon, authenticated
  using (true);

drop policy if exists "Auth insert projects" on public.projects;
create policy "Auth insert projects"
  on public.projects for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Auth update projects" on public.projects;
create policy "Auth update projects"
  on public.projects for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete projects" on public.projects;
create policy "Auth delete projects"
  on public.projects for delete
  to anon, authenticated
  using (true);

-- BLOGS
create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  img text,
  link text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists blogs_slug_idx on public.blogs (slug);
create index if not exists blogs_published_idx on public.blogs (published);
create index if not exists blogs_sort_idx on public.blogs (sort_order);

alter table public.blogs enable row level security;

drop policy if exists "Public read published blogs" on public.blogs;
create policy "Public read published blogs"
  on public.blogs for select
  to anon, authenticated
  using (true);

drop policy if exists "Auth insert blogs" on public.blogs;
create policy "Auth insert blogs"
  on public.blogs for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Auth update blogs" on public.blogs;
create policy "Auth update blogs"
  on public.blogs for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete blogs" on public.blogs;
create policy "Auth delete blogs"
  on public.blogs for delete
  to anon, authenticated
  using (true);

-- STORAGE
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read project images" on storage.objects;
create policy "Public read project images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-images');

drop policy if exists "Auth upload project images" on storage.objects;
create policy "Auth upload project images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'project-images');

drop policy if exists "Auth update project images" on storage.objects;
create policy "Auth update project images"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'project-images');

drop policy if exists "Auth delete project images" on storage.objects;
create policy "Auth delete project images"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'project-images');
