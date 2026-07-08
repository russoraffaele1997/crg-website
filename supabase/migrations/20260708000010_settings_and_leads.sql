create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger trg_settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

alter table public.settings enable row level security;

create policy "admins can read settings"
  on public.settings for select
  to authenticated
  using (public.is_admin());

create policy "super_admin can manage settings"
  on public.settings for all
  to authenticated
  using (public.has_role(array['super_admin']::app_role[]))
  with check (public.has_role(array['super_admin']::app_role[]));

-- Wires up app/api/appointments/route.ts, which currently only console.logs
-- submissions, to real persistence.
create table public.lead_submissions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('contact', 'appointment')),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  project_id uuid references public.projects (id),
  unit_id uuid references public.project_units (id),
  preferred_day date,
  preferred_time text,
  subject text,
  message text,
  privacy_accepted boolean not null,
  created_at timestamptz not null default now()
);

create index lead_submissions_created_idx on public.lead_submissions (created_at desc);
create index lead_submissions_project_idx on public.lead_submissions (project_id);

alter table public.lead_submissions enable row level security;

-- No public select/update/delete policy: the public appointment form writes
-- via the server-side service-role client in the route handler (which
-- bypasses RLS), never via the anon key directly. Only admins can read leads
-- through the authenticated client.
create policy "admins can read leads"
  on public.lead_submissions for select
  to authenticated
  using (public.is_admin());
