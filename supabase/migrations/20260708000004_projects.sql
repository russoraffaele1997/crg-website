create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  location text not null,
  category project_category not null,
  status project_status not null,
  status_label text not null,
  short_description text not null,
  description text not null,
  cover_image_id uuid references public.media_library (id),
  cover_video_id uuid references public.media_library (id),
  total_units int not null default 0,
  is_featured boolean not null default false,
  featured_order int,
  publish_status publish_status not null default 'draft',
  created_by uuid references public.admin_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_status_idx on public.projects (status);
create index projects_featured_idx on public.projects (is_featured, featured_order)
  where is_featured;
create index projects_publish_status_idx on public.projects (publish_status);

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- Gallery ----------------------------------------------------------------------
create table public.project_gallery_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  media_id uuid not null references public.media_library (id) on delete restrict,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index project_gallery_images_project_idx
  on public.project_gallery_images (project_id, order_index);

-- Features: serves both "highlights" and "technicalFeatures" via `kind` -------
create table public.project_features (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  kind text not null check (kind in ('highlight', 'technical')),
  icon text,
  title text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index project_features_project_idx
  on public.project_features (project_id, kind, order_index);

-- Units / apartments -------------------------------------------------------------
create table public.project_units (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  unit_code text not null,
  name text not null,
  typology text not null,
  floor text,
  interno text,
  sqm numeric(8, 2) not null,
  outdoor_sqm numeric(8, 2),
  rooms text,
  destination text,
  price text,
  status unit_status not null default 'available',
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, unit_code)
);

create index project_units_project_idx on public.project_units (project_id, order_index);
create index project_units_status_idx on public.project_units (status);

create trigger trg_project_units_updated_at
  before update on public.project_units
  for each row execute function public.set_updated_at();

create table public.unit_documents (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.project_units (id) on delete cascade,
  media_id uuid not null references public.media_library (id) on delete restrict,
  doc_type text not null default 'floorplan' check (doc_type in ('floorplan', 'document')),
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index unit_documents_unit_idx on public.unit_documents (unit_id, order_index);

-- Timeline / stato lavori -----------------------------------------------------
create table public.project_timeline_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  label text not null,
  date_label text not null,
  sortable_date date,
  description text,
  completed boolean not null default false,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index project_timeline_events_project_idx
  on public.project_timeline_events (project_id, order_index);

create table public.project_timeline_images (
  id uuid primary key default gen_random_uuid(),
  timeline_event_id uuid not null references public.project_timeline_events (id) on delete cascade,
  media_id uuid not null references public.media_library (id) on delete restrict,
  order_index int not null default 0
);

create index project_timeline_images_event_idx
  on public.project_timeline_images (timeline_event_id, order_index);

-- RLS ---------------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.project_gallery_images enable row level security;
alter table public.project_features enable row level security;
alter table public.project_units enable row level security;
alter table public.unit_documents enable row level security;
alter table public.project_timeline_events enable row level security;
alter table public.project_timeline_images enable row level security;

create policy "public can read published projects"
  on public.projects for select
  to anon, authenticated
  using (publish_status = 'published');

create policy "admins can read all projects"
  on public.projects for select
  to authenticated
  using (public.is_admin());

create policy "editors can insert projects"
  on public.projects for insert
  to authenticated
  with check (public.has_role(array['super_admin','editor']::app_role[])
    or (public.has_role(array['collaborator']::app_role[]) and publish_status = 'draft'));

create policy "editors can update projects"
  on public.projects for update
  to authenticated
  using (public.is_admin())
  with check (public.has_role(array['super_admin','editor']::app_role[])
    or (public.has_role(array['collaborator']::app_role[]) and publish_status = 'draft'));

create policy "editors can delete projects"
  on public.projects for delete
  to authenticated
  using (public.has_role(array['super_admin','editor']::app_role[]));

-- Child tables: readable wherever the parent project is publicly readable;
-- writable by any active admin (fine-grained per-role write auditing happens
-- across the whole schema in Phase 6, see plan).
create policy "public can read project gallery of published projects"
  on public.project_gallery_images for select
  to anon, authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and (p.publish_status = 'published' or public.is_admin())
  ));

create policy "admins can manage project gallery"
  on public.project_gallery_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public can read project features of published projects"
  on public.project_features for select
  to anon, authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and (p.publish_status = 'published' or public.is_admin())
  ));

create policy "admins can manage project features"
  on public.project_features for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public can read project units of published projects"
  on public.project_units for select
  to anon, authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and (p.publish_status = 'published' or public.is_admin())
  ));

create policy "admins can manage project units"
  on public.project_units for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public can read unit documents of published projects"
  on public.unit_documents for select
  to anon, authenticated
  using (exists (
    select 1 from public.project_units u
    join public.projects p on p.id = u.project_id
    where u.id = unit_id and (p.publish_status = 'published' or public.is_admin())
  ));

create policy "admins can manage unit documents"
  on public.unit_documents for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public can read timeline of published projects"
  on public.project_timeline_events for select
  to anon, authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and (p.publish_status = 'published' or public.is_admin())
  ));

create policy "admins can manage project timeline"
  on public.project_timeline_events for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public can read timeline images of published projects"
  on public.project_timeline_images for select
  to anon, authenticated
  using (exists (
    select 1 from public.project_timeline_events e
    join public.projects p on p.id = e.project_id
    where e.id = timeline_event_id and (p.publish_status = 'published' or public.is_admin())
  ));

create policy "admins can manage timeline images"
  on public.project_timeline_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
