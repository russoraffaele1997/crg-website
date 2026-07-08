-- Generic structured content blocks. One row per named section, JSON payload
-- shape validated at the application layer (per block_key Zod schema), not
-- in Postgres. Covers homepage sections, about page, footer, nav, contact info.
create table public.site_content_blocks (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  block_key text not null,
  data jsonb not null default '{}'::jsonb,
  publish_status publish_status not null default 'published',
  updated_by uuid references public.admin_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page, block_key)
);

create index site_content_blocks_page_idx on public.site_content_blocks (page);

create trigger trg_site_content_blocks_updated_at
  before update on public.site_content_blocks
  for each row execute function public.set_updated_at();

alter table public.site_content_blocks enable row level security;

create policy "public can read published site content"
  on public.site_content_blocks for select
  to anon, authenticated
  using (publish_status = 'published' or public.is_admin());

create policy "editors can insert site content"
  on public.site_content_blocks for insert
  to authenticated
  with check (public.has_role(array['super_admin','editor']::app_role[]));

create policy "editors can update site content"
  on public.site_content_blocks for update
  to authenticated
  using (public.is_admin())
  with check (public.has_role(array['super_admin','editor']::app_role[]));

create policy "super_admin can delete site content"
  on public.site_content_blocks for delete
  to authenticated
  using (public.has_role(array['super_admin']::app_role[]));
