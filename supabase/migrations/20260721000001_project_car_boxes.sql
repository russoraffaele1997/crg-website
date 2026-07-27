alter table public.projects
  add column car_box_plan_media_id uuid references public.media_library (id) on delete set null;

create table public.project_car_boxes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  sqm numeric(8, 2) not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index project_car_boxes_project_idx
  on public.project_car_boxes (project_id, order_index);

alter table public.project_car_boxes enable row level security;

create policy "public can read car boxes of published projects"
  on public.project_car_boxes for select
  to anon, authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and (p.publish_status = 'published' or public.is_admin())
  ));

create policy "admins can manage project car boxes"
  on public.project_car_boxes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
