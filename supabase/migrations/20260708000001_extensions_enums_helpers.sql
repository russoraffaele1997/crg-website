-- Extensions ----------------------------------------------------------------
create extension if not exists pgcrypto with schema extensions;

-- Enums -----------------------------------------------------------------------
create type app_role as enum ('super_admin', 'editor', 'collaborator');

create type publish_status as enum ('draft', 'scheduled', 'published', 'archived');

create type project_category as enum ('residential', 'commercial', 'industrial');

create type project_status as enum ('for-sale', 'under-construction', 'coming-soon', 'for-rent');

-- 'reserved' is added alongside the frontend's existing 4 values (available/
-- optioned/sold/rented) to satisfy the CMS requirement of Disponibile /
-- Opzionato / Venduto / Riservato without dropping the 'rented' status used
-- by any existing "for-rent" style project data.
create type unit_status as enum ('available', 'optioned', 'sold', 'rented', 'reserved');

create type media_kind as enum ('image', 'video', 'pdf', 'document');

-- Shared trigger: keep updated_at current on every UPDATE --------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
