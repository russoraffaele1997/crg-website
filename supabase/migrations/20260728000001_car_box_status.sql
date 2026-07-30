create type car_box_status as enum ('available', 'optioned', 'sold');

alter table public.project_car_boxes
  add column status car_box_status not null default 'available';
