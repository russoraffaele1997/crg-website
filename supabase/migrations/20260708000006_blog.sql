create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content_json jsonb not null default '{}'::jsonb,
  cover_image_id uuid references public.media_library (id),
  author_id uuid references public.admin_users (id),
  category_id uuid references public.blog_categories (id),
  publish_status publish_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_publish_idx on public.blog_posts (publish_status, published_at);
create index blog_posts_category_idx on public.blog_posts (category_id);

create trigger trg_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

create table public.blog_post_tags (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  tag_id uuid not null references public.blog_tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

create table public.blog_gallery_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  media_id uuid not null references public.media_library (id) on delete restrict,
  order_index int not null default 0
);

create index blog_gallery_images_post_idx on public.blog_gallery_images (post_id, order_index);

-- Manual "related posts" override; when empty, the app derives related posts
-- dynamically (same category, excluding self) at query time.
create table public.blog_related_posts (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  related_post_id uuid not null references public.blog_posts (id) on delete cascade,
  order_index int not null default 0,
  primary key (post_id, related_post_id)
);

-- RLS ---------------------------------------------------------------------------
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.blog_gallery_images enable row level security;
alter table public.blog_related_posts enable row level security;

create policy "anyone can read blog categories" on public.blog_categories
  for select to anon, authenticated using (true);
create policy "admins can manage blog categories" on public.blog_categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "anyone can read blog tags" on public.blog_tags
  for select to anon, authenticated using (true);
create policy "admins can manage blog tags" on public.blog_tags
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public can read published posts"
  on public.blog_posts for select
  to anon, authenticated
  using (publish_status = 'published' and (published_at is null or published_at <= now()));

create policy "admins can read all posts"
  on public.blog_posts for select
  to authenticated
  using (public.is_admin());

create policy "editors can insert posts"
  on public.blog_posts for insert
  to authenticated
  with check (public.has_role(array['super_admin','editor']::app_role[])
    or (public.has_role(array['collaborator']::app_role[]) and publish_status = 'draft'));

create policy "editors can update posts"
  on public.blog_posts for update
  to authenticated
  using (public.is_admin())
  with check (public.has_role(array['super_admin','editor']::app_role[])
    or (public.has_role(array['collaborator']::app_role[]) and publish_status = 'draft'));

create policy "editors can delete posts"
  on public.blog_posts for delete
  to authenticated
  using (public.has_role(array['super_admin','editor']::app_role[]));

create policy "public can read tags of published posts" on public.blog_post_tags
  for select to anon, authenticated
  using (exists (
    select 1 from public.blog_posts p
    where p.id = post_id and (p.publish_status = 'published' or public.is_admin())
  ));
create policy "admins can manage post tags" on public.blog_post_tags
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public can read gallery of published posts" on public.blog_gallery_images
  for select to anon, authenticated
  using (exists (
    select 1 from public.blog_posts p
    where p.id = post_id and (p.publish_status = 'published' or public.is_admin())
  ));
create policy "admins can manage post gallery" on public.blog_gallery_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public can read related posts links" on public.blog_related_posts
  for select to anon, authenticated using (true);
create policy "admins can manage related posts" on public.blog_related_posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
