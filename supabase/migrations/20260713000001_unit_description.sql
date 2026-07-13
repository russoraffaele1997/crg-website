-- Free-text description shown in the public unit-detail popup
-- (name/typology/sqm alone weren't enough context for a buyer).
alter table public.project_units
  add column description text;
