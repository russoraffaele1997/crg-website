create table public.communication_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table public.communications (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  excerpt text,
  body text not null,
  cover_image_id uuid references public.media_library (id),
  category_id uuid references public.communication_categories (id),
  is_featured boolean not null default false,
  publish_status publish_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.admin_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index communications_publish_idx on public.communications (publish_status, published_at);
create index communications_category_idx on public.communications (category_id);
create index communications_featured_idx on public.communications (is_featured);

create trigger trg_communications_updated_at
  before update on public.communications
  for each row execute function public.set_updated_at();

create table public.communication_attachments (
  id uuid primary key default gen_random_uuid(),
  communication_id uuid not null references public.communications (id) on delete cascade,
  media_id uuid not null references public.media_library (id) on delete restrict,
  order_index int not null default 0
);

create index communication_attachments_comm_idx
  on public.communication_attachments (communication_id, order_index);

-- RLS ---------------------------------------------------------------------------
alter table public.communication_categories enable row level security;
alter table public.communications enable row level security;
alter table public.communication_attachments enable row level security;

create policy "anyone can read communication categories"
  on public.communication_categories for select
  to anon, authenticated
  using (true);

create policy "admins can manage communication categories"
  on public.communication_categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public can read published communications"
  on public.communications for select
  to anon, authenticated
  using (publish_status = 'published' and (published_at is null or published_at <= now()));

create policy "admins can read all communications"
  on public.communications for select
  to authenticated
  using (public.is_admin());

create policy "editors can insert communications"
  on public.communications for insert
  to authenticated
  with check (public.has_role(array['super_admin','editor']::app_role[])
    or (public.has_role(array['collaborator']::app_role[]) and publish_status = 'draft'));

create policy "editors can update communications"
  on public.communications for update
  to authenticated
  using (public.is_admin())
  with check (public.has_role(array['super_admin','editor']::app_role[])
    or (public.has_role(array['collaborator']::app_role[]) and publish_status = 'draft'));

create policy "editors can delete communications"
  on public.communications for delete
  to authenticated
  using (public.has_role(array['super_admin','editor']::app_role[]));

create policy "public can read attachments of published communications"
  on public.communication_attachments for select
  to anon, authenticated
  using (exists (
    select 1 from public.communications c
    where c.id = communication_id and (c.publish_status = 'published' or public.is_admin())
  ));

create policy "admins can manage communication attachments"
  on public.communication_attachments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
