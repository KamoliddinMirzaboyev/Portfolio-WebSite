-- Agar projects schema allaqachon o'rnatilgan bo'lsa — faqat bloglar
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
  using (published = true or auth.role() = 'authenticated');

drop policy if exists "Auth insert blogs" on public.blogs;
create policy "Auth insert blogs"
  on public.blogs for insert
  to authenticated
  with check (true);

drop policy if exists "Auth update blogs" on public.blogs;
create policy "Auth update blogs"
  on public.blogs for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Auth delete blogs" on public.blogs;
create policy "Auth delete blogs"
  on public.blogs for delete
  to authenticated
  using (true);
