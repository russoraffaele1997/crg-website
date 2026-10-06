-- Indirizzo (o coordinate) del cantiere per la mappa nella pagina del progetto.
-- Additiva: il codice precedente continua a funzionare.
alter table public.projects add column map_address text;
