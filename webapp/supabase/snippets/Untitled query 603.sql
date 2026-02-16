alter table public.day_email_log
  drop constraint if exists day_email_log_user_id_day_date_event_key;

-- (opzionale) se avevi anche un index manuale vecchio
drop index if exists public.day_email_log_uq;

create unique index if not exists day_email_log_uq_content
on public.day_email_log(user_id, day_date, event, content_hash);
