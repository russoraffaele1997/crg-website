-- Replace the generic "document" doc_type with "photo" — units now support
-- an uploaded floorplan plus a small photo gallery shown in the public unit
-- popup, instead of arbitrary attached files.
do $$
declare
  con_name text;
begin
  select conname into con_name
  from pg_constraint
  where conrelid = 'public.unit_documents'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%doc_type%';

  if con_name is not null then
    execute format('alter table public.unit_documents drop constraint %I', con_name);
  end if;
end $$;

alter table public.unit_documents
  add constraint unit_documents_doc_type_check check (doc_type in ('floorplan', 'photo'));
