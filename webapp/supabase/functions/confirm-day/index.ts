import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = { date: string };

const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

serve(async (req) => {
  // ✅ Debug temporaneo: togli quando sei a posto
  //console.log("ENV CHECK", {
  //  hasUrl: Boolean(Deno.env.get("GMAIL_WEBAPP_URL")),
  //  hasKey: Boolean(Deno.env.get("GMAIL_WEBAPP_KEY")),
  //});
       console.log("ENV CHECK", {
    toOverride:  Deno.env.get("MAIL_TO_OVERRIDE") ,
    bcc:  Deno.env.get("MAIL_BCC") ,
  }); 

  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  // Preflight
  if (req.method === "OPTIONS") {
    if (cors["Access-Control-Allow-Origin"] === "") {
      return new Response("CORS blocked", { status: 403 });
    }
    return new Response(null, { status: 204, headers: cors });
  }
 

  if (req.method !== "POST") {
    return json({ error: "Method Not Allowed" }, 405, cors);
  }

  // Se origin non consentita: blocca anche qui
  if (cors["Access-Control-Allow-Origin"] === "") {
    return new Response("CORS blocked", { status: 403 });
  }

  // 0) Parse body
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const date = (body?.date ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: "Invalid date format (YYYY-MM-DD)" }, 400);
  }
  console.log("STEP 1 - BODY OK", { date });
  // 1) Auth: prendi JWT utente dal client
  const authHeader =  
  req.headers.get("authorization") ??
  req.headers.get("Authorization") ??
  "";
  console.log("AUTH HEADER RAW", authHeader.slice(0, 30));

  const m = authHeader.match(/^Bearer\s+(.+)$/i);
const jwt = m?.[1]?.trim() ?? "";
if (!jwt) return json({ error: "Missing Authorization" }, 401);


  console.log("STEP 2 - JWT", {
  hasAuthHeader: Boolean(req.headers.get("Authorization")),
  jwtLength: jwt.length,
});


  // 2) Setup supabase admin (service role) — bypass RLS per log + letture
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Missing SUPABASE_URL or SERVICE_ROLE key" }, 500);
  }
  const admin = createClient(supabaseUrl, serviceKey);

  // 3) Verifica JWT e ottieni user
  const { data: userRes, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userRes?.user) {
  console.error("STEP 3 - AUTH FAIL", {
    message: userErr?.message,
    status: (userErr as any)?.status,
  });
  return json({ error: "Invalid session" }, 401);
}

console.log("STEP 3 - AUTH OK", {
  userId: userRes.user.id,
  email: userRes.user.email,
});


  const userId = userRes.user.id;
  const userEmail = userRes.user.email ?? "";

  // 4) Carica day dell’utente per quella data
  const { data: day, error: dayErr } = await admin
    .from("days")
    .select("id,user_id,date,status")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (dayErr) return json({ error: "DB error loading day", detail: dayErr.message }, 500);
  if (!day) return json({ error: "Day not found" }, 404);
  console.log("STEP 4 - DAY FOUND", {
  status: day.status,
});

  const currentStatus = String(day.status ?? "OPEN").toUpperCase();

  // ✅ Coerente col tuo workflow: se non è OPEN, l'utente NON può modificare → niente invio
  if (currentStatus !== "OPEN") {
    return json({ ok: true, status: currentStatus, mail: "skipped" }, 200);
  }

  // 5) Carica entries per costruire contenuto e hash (prima di log/mail)
  const { data: entries, error: entErr } = await admin
    .from("entriesdesc")
    .select("codcommessa,commessa,codattivita,attivita,minutes")
    .eq("day_id", day.id)
    .order("created_at", { ascending: true });

  if (entErr) {
    // non blocchiamo la conferma, ma la mail potrebbe essere incompleta
    console.error("entries load failed:", entErr);
  }

  const list = (entries ?? []).map((r) => ({
    codcommessa: String(r.codcommessa ?? ""),
    commessa: String(r.commessa ?? ""),
    codattivita: String(r.codattivita ?? ""),
    attivita: String(r.attivita ?? ""),
    minutes: Number(r.minutes ?? 0),
  }));
  console.log("STEP 5 - STATUS UPDATED");

  const totalMinutes = list.reduce((s, r) => s + (r.minutes ?? 0), 0);

  // 6) Calcola content_hash stabile (anti-spam + reinvio solo se modifiche)
  // Canonical: entries già ordinate per created_at (ma rendiamo robusto ordinando anche qui)
  const canonical = [
    `date=${date}`,
    ...list
      .slice()
      .sort((a, b) =>
        `${a.codcommessa}|${a.codattivita}|${a.minutes}`.localeCompare(
          `${b.codcommessa}|${b.codattivita}|${b.minutes}`
        )
      )
      .map((r) => `e=${r.codcommessa}|${r.codattivita}|${r.minutes}`),
    `total=${totalMinutes}`,
  ].join("\n");

  const contentHash = await sha256Hex(canonical);



  // 7) Conferma: update stato (questa è la parte “importante”)
  const { error: updErr } = await admin
    .from("days")
    .update({ status: "SUBMITTED" })
    .eq("id", day.id)
    .eq("user_id", userId);

  if (updErr) return json({ error: "DB error updating status", detail: updErr.message }, 500);

  // 8) Inserisci log versionato (UNIQUE su user_id, day_date, event, content_hash)
  // Se duplicate → niente invio (stesso contenuto già notificato)
  let logId: string | null = null;

  const { data: logRow, error: logErr } = await admin
    .from("day_email_log")
    .insert({
      user_id: userId,
      day_date: date,
      event: "SUBMITTED",
      result: "PENDING",
      error: null,
      content_hash: contentHash,
      sent_at: null,
    })
    .select("id")
    .maybeSingle();

  if (logErr) {
    const code = (logErr as any).code as string | undefined; // PostgREST error code
    const isDuplicate =
      code === "23505" ||
      (logErr.message ?? "").toLowerCase().includes("duplicate") ||
      (logErr.message ?? "").toLowerCase().includes("unique");

    if (isDuplicate) {
      return json({ ok: true, status: "SUBMITTED", mail: "skipped" }, 200);
    }

    // Qualsiasi altro errore log: non bloccare la conferma.
    console.error("day_email_log insert failed:", logErr);
  } else {
    logId = logRow?.id ?? null;
  }

  // 9) Recupera display name (dipendenti)
  const { data: dep, error: depErr } = await admin
    .from("dipendenti")
    .select("nomedipendente")
    .eq("user_id", userId)
    .maybeSingle();

  if (depErr) console.error("dipendenti load failed:", depErr);

  const displayName = dep?.nomedipendente ?? userEmail ?? "Utente";

  const subject = `Consuntivo ${displayName} - ${date}`;
  const html = buildHtml({ displayName, date, totalMinutes, entries: list });

  // 10) Invio mail best-effort (MAI throw verso l’esterno)
  let mailResult: "sent" | "failed" | "skipped" = "skipped";
  let mailError: string | null = null;

  const mailUrl = Deno.env.get("GMAIL_WEBAPP_URL");
  const mailKey = Deno.env.get("GMAIL_WEBAPP_KEY");

  if (!mailUrl || !mailKey) {
    mailResult = "failed";
    mailError = "Missing mail env (GMAIL_WEBAPP_URL/KEY)";
  } else if (!userEmail) {
    mailResult = "failed";
    mailError = "Missing user email";
  } else {
    try {
      const toOverride = (Deno.env.get("MAIL_TO_OVERRIDE") ?? "").trim();
      const bcc = (Deno.env.get("MAIL_BCC") ?? "").trim();

       console.log("ENV CHECK", {
    toOverride: Boolean(Deno.env.get("MAIL_TO_OVERRIDE")),
    bcc: Boolean(Deno.env.get("MAIL_BCC")),
  });


      // DEV: forza tutte le mail a un indirizzo (tuo), così non spammi utenti reali
      const to = toOverride || userEmail;

        console.log("MAIL ROUTING", { userEmail, toOverride, to });

      // se vuoi anche mettere l’utente in cc quando fai override, puoi farlo così:
      // const cc = toOverride ? userEmail : "";
      const cc = "";
      const bccFinal = bcc;

      const resp = await fetch(`${mailUrl}?key=${encodeURIComponent(mailKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, cc, bcc, subject, html }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        mailResult = "failed";
        mailError = `AppsScript ${resp.status}: ${txt.slice(0, 300)}`;
      } else {
        mailResult = "sent";
      }
    } catch (e) {
      mailResult = "failed";
      mailError = String((e as any)?.message ?? e);
    }
  }

  // 11) Aggiorna log con esito (se abbiamo logId)
  if (logId) {
    const patch: Record<string, unknown> = {
      result: mailResult.toUpperCase(), // SENT/FAILED/SKIPPED
      error: mailError,
    };
    if (mailResult === "sent") patch.sent_at = new Date().toISOString();

    const { error: logUpdErr } = await admin
      .from("day_email_log")
      .update(patch)
      .eq("id", logId);

    if (logUpdErr) console.error("day_email_log update failed:", logUpdErr);
  }

  // 12) Risposta SEMPRE 200 se conferma riuscita
  return json({ ok: true, status: "SUBMITTED", mail: mailResult }, 200);
});

function json(obj: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}


function buildHtml(args: {
  displayName: string;
  date: string;
  totalMinutes: number;
  entries: Array<{ codcommessa: string; commessa: string; codattivita: string; attivita: string; minutes: number }>;
}) {
  const h = Math.floor(args.totalMinutes / 60);
  const m = args.totalMinutes % 60;

  const rows = args.entries
    .map((r) => {
      const mm = r.minutes ?? 0;
      const rh = Math.floor(mm / 60);
      const rm = mm % 60;
      const t = rm === 0 ? `${rh}h` : `${rh}h${String(rm).padStart(2, "0")}`;
      return `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(r.codcommessa ?? "")} - ${esc(r.commessa ?? "")}</td> 
        <td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(r.codattivita ?? "")} - ${esc(r.attivita ?? "")}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${t} ( tot min. ${mm} )</td>
      </tr>`;
    })
    .join("");

  const totalStr =
    m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;

  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">
    <h2>Riepilogo giornata ${args.date}</h2>
    <p><strong>${esc(args.displayName)}</strong></p>
    <p>Totale: <strong>${totalStr}</strong> (tot min. ${args.totalMinutes } )</p>

    <table style="border-collapse:collapse;width:100%;max-width:680px">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #ddd">Commessa</th>
          <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #ddd">Attività</th>
          <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #ddd">Tempo</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="3" style="padding:8px;color:#777">Nessuna riga</td></tr>`}
      </tbody>
    </table>
  </div>`;
}

function esc(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function sha256Hex(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function corsHeaders(origin: string | null) {
  // Dev: se non configuri ALLOWED_ORIGINS, puoi permettere tutto (solo dev)
  const allowAll = allowedOrigins.length === 0;

  const okOrigin =
    allowAll ? "*" :
    (origin && allowedOrigins.includes(origin)) ? origin :
    "";

  return {
    "Access-Control-Allow-Origin": okOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}