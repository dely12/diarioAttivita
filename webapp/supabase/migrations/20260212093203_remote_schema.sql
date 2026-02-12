


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."attivita" (
    "codattivita" "text" NOT NULL,
    "descrizione" "text" NOT NULL,
    "attiva" boolean DEFAULT true NOT NULL,
    "codcommessacorrispondente" "text"
);


ALTER TABLE "public"."attivita" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."commesse" (
    "codcommessa" "text" NOT NULL,
    "descrizione" "text" NOT NULL,
    "attiva" boolean DEFAULT true
);


ALTER TABLE "public"."commesse" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."days" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "date" "date" NOT NULL,
    "status" "text" DEFAULT 'OPEN'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "days_status_check" CHECK (("status" = ANY (ARRAY['OPEN'::"text", 'SUBMITTED'::"text", 'LOCKED'::"text"])))
);


ALTER TABLE "public"."days" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dipendenti" (
    "email" "text" NOT NULL,
    "nomedipendente" "text",
    "attivo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"()
);


ALTER TABLE "public"."dipendenti" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "day_id" "uuid" NOT NULL,
    "codcommessa" "text" NOT NULL,
    "codattivita" "text" NOT NULL,
    "minutes" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "entries_minutes_check" CHECK (("minutes" > 0))
);


ALTER TABLE "public"."entries" OWNER TO "postgres";


ALTER TABLE ONLY "public"."attivita"
    ADD CONSTRAINT "attivita_pkey" PRIMARY KEY ("codattivita");



ALTER TABLE ONLY "public"."commesse"
    ADD CONSTRAINT "commesse_pkey" PRIMARY KEY ("codcommessa");



ALTER TABLE ONLY "public"."days"
    ADD CONSTRAINT "days_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dipendenti"
    ADD CONSTRAINT "dipendenti_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."dipendenti"
    ADD CONSTRAINT "dipendenti_pkey" PRIMARY KEY ("email");



ALTER TABLE ONLY "public"."entries"
    ADD CONSTRAINT "entries_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "days_unique_user_date" ON "public"."days" USING "btree" ("user_id", "date");



CREATE INDEX "entries_day_id_idx" ON "public"."entries" USING "btree" ("day_id");



CREATE INDEX "entries_user_id_idx" ON "public"."entries" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."entries"
    ADD CONSTRAINT "entries_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "public"."days"("id") ON DELETE CASCADE;



ALTER TABLE "public"."attivita" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."commesse" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."days" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete_own_entries" ON "public"."entries" FOR DELETE USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."dipendenti" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."entries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_own_entries" ON "public"."entries" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."days" "d"
  WHERE (("d"."id" = "entries"."day_id") AND ("d"."user_id" = "auth"."uid"()))))));



CREATE POLICY "onlyMe" ON "public"."dipendenti" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "read attivita" ON "public"."attivita" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "read commesse" ON "public"."commesse" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "select_own_days" ON "public"."days" TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "select_own_entries" ON "public"."entries" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "update_own_entries" ON "public"."entries" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."days" "d"
  WHERE (("d"."id" = "entries"."day_id") AND ("d"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."days" "d"
  WHERE (("d"."id" = "entries"."day_id") AND ("d"."user_id" = "auth"."uid"())))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."attivita" TO "anon";
GRANT ALL ON TABLE "public"."attivita" TO "authenticated";
GRANT ALL ON TABLE "public"."attivita" TO "service_role";



GRANT ALL ON TABLE "public"."commesse" TO "anon";
GRANT ALL ON TABLE "public"."commesse" TO "authenticated";
GRANT ALL ON TABLE "public"."commesse" TO "service_role";



GRANT ALL ON TABLE "public"."days" TO "anon";
GRANT ALL ON TABLE "public"."days" TO "authenticated";
GRANT ALL ON TABLE "public"."days" TO "service_role";



GRANT ALL ON TABLE "public"."dipendenti" TO "anon";
GRANT ALL ON TABLE "public"."dipendenti" TO "authenticated";
GRANT ALL ON TABLE "public"."dipendenti" TO "service_role";



GRANT ALL ON TABLE "public"."entries" TO "anon";
GRANT ALL ON TABLE "public"."entries" TO "authenticated";
GRANT ALL ON TABLE "public"."entries" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


