create table public.media_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references public.media_folders (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index media_folders_parent_idx on public.media_folders (parent_id);

create table public.media_library (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.media_folders (id) on delete set null,
  storage_path text not null,
  bucket text not null default 'media',
  kind media_kind not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  width int,
  height int,
  alt_text text,
  uploaded_by uuid references public.admin_users (id),
  created_at timestamptz not null default now()
);

create index media_library_folder_idx on public.media_library (folder_id);
create index media_library_kind_idx on public.media_library (kind);
create index media_library_filename_search_idx
  on public.media_library using gin (to_tsvector('simple', original_filename));

alter table public.media_folders enable row level security;
alter table public.media_library enable row level security;

-- Media needs to be readable by anonymous visitors too: public pages resolve
-- image URLs by joining through media_library. Storage bucket itself is
-- public-read (configured via Storage policies once the project exists), this
-- table just needs to be selectable so admin UI and any client-side join can
-- resolve metadata.
create policy "anyone can read media folders"
  on public.media_folders for select
  to anon, authenticated
  using (true);

create policy "admins can manage media folders"
  on public.media_folders for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "anyone can read media library"
  on public.media_library for select
  to anon, authenticated
  using (true);

create policy "admins can insert media"
  on public.media_library for insert
  to authenticated
  with check (public.is_admin());

create policy "admins can update media"
  on public.media_library for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "editors can delete media"
  on public.media_library for delete
  to authenticated
  using (public.has_role(array['super_admin','editor']::app_role[]));
