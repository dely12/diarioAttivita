alter table "public"."dipendenti" drop constraint "dipendenti_email_key";

alter table "public"."dipendenti" drop constraint "dipendenti_pkey";

drop index if exists "public"."dipendenti_email_key";

drop index if exists "public"."dipendenti_pkey";

alter table "public"."dipendenti" drop column "email";

alter table "public"."dipendenti" alter column "user_id" drop default;

alter table "public"."dipendenti" alter column "user_id" set not null;

CREATE UNIQUE INDEX dipendenti_pkey ON public.dipendenti USING btree (user_id);

alter table "public"."dipendenti" add constraint "dipendenti_pkey" PRIMARY KEY using index "dipendenti_pkey";

alter table "public"."dipendenti" add constraint "dipendenti_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."dipendenti" validate constraint "dipendenti_user_id_fkey";


