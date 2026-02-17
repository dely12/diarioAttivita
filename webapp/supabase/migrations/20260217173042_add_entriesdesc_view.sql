create or replace view "public"."entriesdesc" as  SELECT e.id,
    e.day_id,
    e.created_at,
    e.codcommessa,
    c.descrizione AS commessa,
    e.codattivita,
    a.descrizione AS attivita,
    e.minutes
   FROM ((public.entries e
     LEFT JOIN public.commesse c ON ((c.codcommessa = e.codcommessa)))
     LEFT JOIN public.attivita a ON ((a.codattivita = e.codattivita)));



