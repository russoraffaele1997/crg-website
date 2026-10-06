-- Redesign della sezione Progetti: avanzamento cantiere, diario, documenti,
-- "chi realizza", prossima azione/avvisi gestibili da admin, gestione richieste.
-- Tutto additivo: il codice precedente continua a funzionare dopo questa migrazione.

-- Projects: consegna prevista, etichetta stato facoltativa, prossima azione, avvisi --
alter table public.projects alter column status_label drop not null;

alter table public.projects
  add column expected_delivery date,
  add column expected_delivery_label text,
  add column next_action_text text,
  add column next_action_expires_on date,
  add column next_action_hidden boolean not null default false,
  add column low_stock_threshold int not null default 2 check (low_stock_threshold >= 0),
  add column auto_alerts_enabled boolean not null default true,
  add column alert_text text,
  add column alert_tone text check (alert_tone in ('info', 'success', 'warning')),
  add column alert_expires_on date;

-- Timeline: peso della fase per il calcolo dell'avanzamento --------------------
alter table public.project_timeline_events
  add column weight int not null default 1 check (weight between 1 and 10);

-- Diario di cantiere ------------------------------------------------------------
create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  published_on date not null default current_date,
  title text not null,
  body text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_updates_project_idx on public.project_updates (project_id, published_on desc);

create trigger trg_project_updates_updated_at
  before update on public.project_updates
  for each row execute function public.set_updated_at();

create table public.project_update_images (
  id uuid primary key default gen_random_uuid(),
  update_id uuid not null references public.project_updates (id) on delete cascade,
  media_id uuid not null references public.media_library (id) on delete restrict,
  order_index int not null default 0
);

create index project_update_images_update_idx on public.project_update_images (update_id, order_index);

-- Documenti del progetto -------------------------------------------------------
create table public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  media_id uuid not null references public.media_library (id) on delete restrict,
  category text not null default 'altro'
    check (category in ('capitolato', 'brochure', 'planimetrie', 'energetica', 'box', 'altro')),
  title text not null,
  requires_contact boolean not null default false,
  is_active boolean not null default true,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index project_documents_project_idx on public.project_documents (project_id, order_index);

-- Chi realizza il progetto -----------------------------------------------------
create table public.project_partners (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  role text not null,
  logo_media_id uuid references public.media_library (id) on delete set null,
  website text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create index project_partners_project_idx on public.project_partners (project_id, order_index);

-- RLS: stessa logica delle altre tabelle figlie dei progetti -------------------
alter table public.project_updates enable row level security;
alter table public.project_update_images enable row level security;
alter table public.project_documents enable row level security;
alter table public.project_partners enable row level security;

create policy "public can read public updates of published projects"
  on public.project_updates for select
  to anon, authenticated
  using (
    public.is_admin()
    or (is_public and exists (
      select 1 from public.projects p where p.id = project_id and p.publish_status = 'published'
    ))
  );

create policy "admins can manage project updates"
  on public.project_updates for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public can read images of public updates"
  on public.project_update_images for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.project_updates u
      join public.projects p on p.id = u.project_id
      where u.id = update_id and u.is_public and p.publish_status = 'published'
    )
  );

create policy "admins can manage update images"
  on public.project_update_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- I documenti "su richiesta" non vanno mai esposti direttamente: la lettura
-- pubblica è limitata a quelli liberi; quelli su richiesta passano dal server.
create policy "public can read free documents of published projects"
  on public.project_documents for select
  to anon, authenticated
  using (
    public.is_admin()
    or (is_active and not requires_contact and exists (
      select 1 from public.projects p where p.id = project_id and p.publish_status = 'published'
    ))
  );

create policy "admins can manage project documents"
  on public.project_documents for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "public can read partners of published projects"
  on public.project_partners for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (select 1 from public.projects p where p.id = project_id and p.publish_status = 'published')
  );

create policy "admins can manage project partners"
  on public.project_partners for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Richieste: nuovi tipi, stato di lavorazione, note, collegamenti --------------
alter table public.lead_submissions drop constraint if exists lead_submissions_type_check;
alter table public.lead_submissions
  add constraint lead_submissions_type_check
  check (type in ('contact', 'appointment', 'notify', 'document'));

alter table public.lead_submissions alter column last_name drop not null;

-- Prima eliminare un progetto o un'unità con richieste collegate falliva:
-- ora la richiesta resta e perde solo il collegamento.
alter table public.lead_submissions drop constraint if exists lead_submissions_project_id_fkey;
alter table public.lead_submissions
  add constraint lead_submissions_project_id_fkey
  foreign key (project_id) references public.projects (id) on delete set null;

alter table public.lead_submissions drop constraint if exists lead_submissions_unit_id_fkey;
alter table public.lead_submissions
  add constraint lead_submissions_unit_id_fkey
  foreign key (unit_id) references public.project_units (id) on delete set null;

alter table public.lead_submissions
  add column car_box_id uuid references public.project_car_boxes (id) on delete set null,
  add column document_id uuid references public.project_documents (id) on delete set null,
  add column status text not null default 'new'
    check (status in ('new', 'contacted', 'visit_scheduled', 'closed')),
  add column notes text,
  add column updated_at timestamptz not null default now();

create index lead_submissions_status_idx on public.lead_submissions (status, created_at desc);

create trigger trg_lead_submissions_updated_at
  before update on public.lead_submissions
  for each row execute function public.set_updated_at();

create policy "admins can update leads"
  on public.lead_submissions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
