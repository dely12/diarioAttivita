
  create table "public"."day_email_log" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "day_date" date not null,
    "event" text not null,
    "created_at" timestamp with time zone not null default now(),
    "result" text not null default 'PENDING'::text,
    "error" text,
    "content_hash" text,
    "sent_at" timestamp with time zone
      );


alter table "public"."day_email_log" enable row level security;

CREATE UNIQUE INDEX day_email_log_pkey ON public.day_email_log USING btree (id);

CREATE UNIQUE INDEX day_email_log_uq2 ON public.day_email_log USING btree (user_id, day_date, event, content_hash);

CREATE UNIQUE INDEX day_email_log_uq_content ON public.day_email_log USING btree (user_id, day_date, event, content_hash);

CREATE INDEX day_email_log_user_date_idx ON public.day_email_log USING btree (user_id, day_date);

CREATE UNIQUE INDEX days_user_date_uq ON public.days USING btree (user_id, date);

alter table "public"."day_email_log" add constraint "day_email_log_pkey" PRIMARY KEY using index "day_email_log_pkey";

alter table "public"."day_email_log" add constraint "day_email_log_event_check" CHECK ((event = 'SUBMITTED'::text)) not valid;

alter table "public"."day_email_log" validate constraint "day_email_log_event_check";

alter table "public"."day_email_log" add constraint "day_email_log_result_check" CHECK ((result = ANY (ARRAY['SENT'::text, 'FAILED'::text, 'SKIPPED'::text, 'PENDING'::text]))) not valid;

alter table "public"."day_email_log" validate constraint "day_email_log_result_check";

alter table "public"."day_email_log" add constraint "day_email_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."day_email_log" validate constraint "day_email_log_user_id_fkey";

grant delete on table "public"."day_email_log" to "anon";

grant insert on table "public"."day_email_log" to "anon";

grant references on table "public"."day_email_log" to "anon";

grant select on table "public"."day_email_log" to "anon";

grant trigger on table "public"."day_email_log" to "anon";

grant truncate on table "public"."day_email_log" to "anon";

grant update on table "public"."day_email_log" to "anon";

grant delete on table "public"."day_email_log" to "authenticated";

grant insert on table "public"."day_email_log" to "authenticated";

grant references on table "public"."day_email_log" to "authenticated";

grant select on table "public"."day_email_log" to "authenticated";

grant trigger on table "public"."day_email_log" to "authenticated";

grant truncate on table "public"."day_email_log" to "authenticated";

grant update on table "public"."day_email_log" to "authenticated";

grant delete on table "public"."day_email_log" to "service_role";

grant insert on table "public"."day_email_log" to "service_role";

grant references on table "public"."day_email_log" to "service_role";

grant select on table "public"."day_email_log" to "service_role";

grant trigger on table "public"."day_email_log" to "service_role";

grant truncate on table "public"."day_email_log" to "service_role";

grant update on table "public"."day_email_log" to "service_role";


