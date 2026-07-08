create table public.seo_meta (
  id uuid primary key default gen_random_uuid(),
  meta_title text,
  meta_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_id uuid references public.media_library (id),
  twitter_card text not null default 'summary_large_image',
  custom_slug_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_seo_meta_updated_at
  before update on public.seo_meta
  for each row execute function public.set_updated_at();

-- Attach optional SEO overrides to the entities that have one natural owner.
alter table public.projects
  add column seo_meta_id uuid references public.seo_meta (id);

alter table public.communications
  add column seo_meta_id uuid references public.seo_meta (id);

alter table public.blog_posts
  add column seo_meta_id uuid references public.seo_meta (id);

-- Static, non-entity-backed routes (home, chi-siamo, progetti, contatti).
create table public.page_seo (
  id uuid primary key default gen_random_uuid(),
  page_path text not null unique,
  seo_meta_id uuid references public.seo_meta (id)
);

alter table public.seo_meta enable row level security;
alter table public.page_seo enable row level security;

create policy "anyone can read seo_meta"
  on public.seo_meta for select
  to anon, authenticated
  using (true);

create policy "editors can manage seo_meta"
  on public.seo_meta for all
  to authenticated
  using (public.has_role(array['super_admin','editor']::app_role[]))
  with check (public.has_role(array['super_admin','editor']::app_role[]));

create policy "anyone can read page_seo"
  on public.page_seo for select
  to anon, authenticated
  using (true);

create policy "editors can manage page_seo"
  on public.page_seo for all
  to authenticated
  using (public.has_role(array['super_admin','editor']::app_role[]))
  with check (public.has_role(array['super_admin','editor']::app_role[]));
