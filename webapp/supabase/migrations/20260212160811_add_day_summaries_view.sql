drop view if exists public.day_summaries;

create view public.day_summaries
with (security_invoker = true)
as
select
  d.id,
  d.user_id,
  d.date,
  d.status,
  coalesce(sum(e.minutes), 0)::int as total_minutes,
  count(e.id)::int as entries_count
from public.days d
left join public.entries e
  on e.day_id = d.id
 and e.user_id = d.user_id
group by d.id, d.user_id, d.date, d.status;

grant select on public.day_summaries to authenticated;
