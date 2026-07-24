-- Rate limit / session bo'lmasa ham admin CRUD ishlashi uchun
-- Supabase SQL Editor da bir marta ishga tushiring

-- PROJECTS
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

-- Storage upload (rasm)
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
