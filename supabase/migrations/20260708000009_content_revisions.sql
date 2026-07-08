-- Single polymorphic revision-history table used for projects, communications,
-- blog_posts and site_content_blocks alike. Snapshot-on-write: the app layer
-- inserts the pre-update row/JSON here immediately before performing an
-- update, so history is append-only and "restore" is just another audited
-- write, never a destructive rewrite.
create table public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (
    entity_type in ('project', 'communication', 'blog_post', 'site_content_block')
  ),
  entity_id uuid not null,
  snapshot jsonb not null,
  edited_by uuid references public.admin_users (id),
  edited_at timestamptz not null default now(),
  change_note text
);

create index content_revisions_entity_idx
  on public.content_revisions (entity_type, entity_id, edited_at desc);

alter table public.content_revisions enable row level security;

create policy "admins can read revisions"
  on public.content_revisions for select
  to authenticated
  using (public.is_admin());

create policy "admins can insert revisions"
  on public.content_revisions for insert
  to authenticated
  with check (public.is_admin());

-- Revisions are append-only: no update/delete policy is defined, so no role
-- (other than a service-role/admin API call, which bypasses RLS entirely)
-- can modify or remove history through the normal authenticated client.
