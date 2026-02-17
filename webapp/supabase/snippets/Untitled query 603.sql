create or replace view public.entriesDesc as
select
  e.id,
  e.day_id,
  e.created_at,
  e.codcommessa,
  c.descrizione as commessa,
  e.codattivita,
  a.descrizione as attivita,
  e.minutes
from public.entries e
left join public.commesse c
  on c.codcommessa = e.codcommessa
left join public.attivita a
  on a.codattivita = e.codattivita;
