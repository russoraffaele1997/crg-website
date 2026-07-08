-- admin_users: 1:1 with Supabase Auth users (auth.users). No separate
-- identity/password handling here — Supabase Auth owns credentials, this
-- table only carries CMS-specific profile/role data.
create table public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role app_role not null default 'collaborator',
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create index admin_users_role_idx on public.admin_users (role);

-- RLS helper functions ---------------------------------------------------------
-- security definer + fixed search_path so these are safe to call from RLS
-- policies without being tricked by a caller-controlled search_path.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and is_active = true
  );
$$;

create or replace function public.has_role(roles app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and is_active = true and role = any(roles)
  );
$$;

alter table public.admin_users enable row level security;

-- Admins can see the full user list; a user can always see their own row
-- (needed so the admin layout can resolve "who am I" right after login).
create policy "admins can read admin_users"
  on public.admin_users for select
  to authenticated
  using (public.is_admin() or id = auth.uid());

-- Only super_admin manages the user list.
create policy "super_admin can insert admin_users"
  on public.admin_users for insert
  to authenticated
  with check (public.has_role(array['super_admin']::app_role[]));

create policy "super_admin can update admin_users"
  on public.admin_users for update
  to authenticated
  using (public.has_role(array['super_admin']::app_role[]))
  with check (public.has_role(array['super_admin']::app_role[]));

create policy "super_admin can delete admin_users"
  on public.admin_users for delete
  to authenticated
  using (public.has_role(array['super_admin']::app_role[]));
