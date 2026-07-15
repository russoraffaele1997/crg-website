alter table public.projects
  add column is_spotlight boolean not null default false,
  add column spotlight_specs jsonb not null default '[]'::jsonb;

-- Only one project can be the homepage spotlight at a time.
create unique index projects_single_spotlight_idx on public.projects (is_spotlight) where is_spotlight = true;
