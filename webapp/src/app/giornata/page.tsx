"use client";
import { Suspense, useEffect, useMemo, useState, useRef } from "react";
import { getSupabaseBrowser } from "@/app/supabase/browser";

import { useRouter, useSearchParams } from "next/navigation";
import { Field } from "@/app/ui/components/Field";
import { Button } from "@/app/ui/components/Button";
import { todayISODate, getDayByDate, createDay } from "@/lib/data/days";
import { Stack } from "@/app/ui/components/Stack";
import { FormCard } from "@/app/ui/components/FormCard";
import { listEntries, addEntry, deleteEntry, Entry, updateEntry } from "@/lib/data/entries";
import { MinutesProgress } from "@/app/ui/components/MinutesProgress";
import { EntryList } from "@/app/ui/components/EntryList";
import { listCommesse, listAttivita, LookupOption, AttivitaOption } from "@/lib/data/lookups";
import { MinutesInput } from "@/app/ui/components/MinutesInput";
import { setDayStatus } from "@/lib/data/days";
import { SendIcon, SquarePen } from "lucide-react";

export const dynamic = "force-dynamic";


function GiornataInner() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("...");
  const [day, setDay] = useState<any>(null);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [commessa, setCommessa] = useState("");
  const [attivita, setAttivita] = useState("");
  const [minutes, setMinutes] = useState(30);
  const totalMinutes = entries.reduce((sum, e) => sum + (e.minutes ?? 0), 0);
  const targetMinutes = 480;
  const [authChecked, setAuthChecked] = useState(false);
  const [userOk, setUserOk] = useState(false);
  //  const [selectedDate, setSelectedDate] = useState<string>(todayISODate());
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [commesseOpt, setCommesseOpt] = useState<LookupOption[]>([]);
  const [attivitaOpt, setAttivitaOpt] = useState<AttivitaOption[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const status = (day?.status as "OPEN" | "SUBMITTED" | "LOCKED") ?? "OPEN";
  const isEditable = status === "OPEN";
  const searchParams = useSearchParams();
  const dateFromQuery = searchParams.get("date");
  const formRef = useRef<HTMLDivElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);


  function getDayHint() {
    if (!day) {
      return "Inserire le attività per la giornata.";
    }

    switch (status) {
      case "OPEN":
        return "Questa data contiene già inserimenti.";
      case "SUBMITTED":
        return "La giornata è confermata e verrà inviata al responsabile.";
      case "LOCKED":
        return "La giornata non è modificabile. Contattare il responsabile per modifiche.";
      default:
        return "";
    }
  }


  function goToDate(date: string) {
    router.push(`/giornata?date=${date}`);
  }
  function StatusBadge({ status }: { status: string }) {
    const s = (status ?? "").toUpperCase();

    if (s === "SUBMITTED") {
      return (
        <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          Confermata
        </span>
      );
    }

    if (s === "LOCKED") {
      return (
        <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
          Inviata
        </span>
      );
    }

    // default = draft
    return (
      <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
        Bozza
      </span>
    );
  }


  const commessaLabelMap = useMemo(() => {
    const m = new Map<string, string>();
    commesseOpt.forEach((o) => m.set(o.value, o.label));
    return m;
  }, [commesseOpt]);

  const attivitaLabelMap = useMemo(() => {
    const m = new Map<string, string>();
    attivitaOpt.forEach((o) => m.set(o.value, o.label));
    return m;
  }, [attivitaOpt]);

  const filteredAttivitaOpt = useMemo(() => {

    const c = commessa.trim();

    if (!c) return attivitaOpt;

    const norm = (s: string) => s.trim().toUpperCase();
    const cc = norm(c);

    // attività specifiche per questa commessa
    const specific = attivitaOpt.filter((a) => {
      const link = a.codcommessacorrispondente;
      return link ? norm(link) === cc : false;
    });


    // se esistono specifiche -> mostra SOLO quelle
    if (specific.length > 0) return specific;

    // altrimenti -> mostra solo le generiche (senza link)
    return attivitaOpt.filter((a) => !a.codcommessacorrispondente);
  }, [attivitaOpt, commessa]);

  function onEdit(id: string) {
    const e = entries.find(x => x.id === id);
    console.log("CLICK EDIT id =", id);

    if (!e) return;
    console.log("  EDIT att =", e.codattivita);
    setCommessa(e.codcommessa);
    setAttivita(e.codattivita);
    setMinutes(e.minutes ?? 30);
    setEditingId(e.id);
    // porta l’utente al form
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  function onCommessaChange(v: string) {
    setCommessa(v);
    setAttivita("");      // reset SEMPRE quando l’utente cambia commessa
  }

  function cancelEdit() {
    setEditingId(null);
    setCommessa("");
    setAttivita("");
    setMinutes(30);
  }
  function decodeJwtPayload(jwt: string) {
  const b64url = jwt.split(".")[1];
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(
    atob(b64)
      .split("")
      .map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
  return JSON.parse(json);
}
  async function submitDay() { 
    if (!day || submitting) {
          console.log("SUBMIT: aborted by guard");
          return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      console.log("SUBMIT: getting session");
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token; 
      if (!token) throw new Error("No session token");
      const payload = token ? decodeJwtPayload(token) : null;
      console.log("JWT", {
        hasToken: !!token,
        iss: payload?.iss,
        aud: payload?.aud,
        exp: payload?.exp,
      });
 
      const res = await fetch("/api/confirm-day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
            
        body: JSON.stringify({ date: day.date }), // NB: nel tuo Body è { date: string }
      }); 
      const json = await res.json().catch(() => ({}));
       
      if (!res.ok) throw new Error((json as any)?.error ?? `confirm-day failed (${res.status})`);

      router.push("/riepilogogiornate");
      return json;
    } finally {
      // non serve se navighi sempre, ma lasciamolo corretto
      //setSubmitting(false);
    }

  }

  async function reopenDay() {
    if (!day) return;
    const updated = await setDayStatus(day.id, "OPEN");
    setDay(updated);
  }


  useEffect(() => {
    (async () => {
      const supabase = getSupabaseBrowser();

      // 1) controllo locale: NON fa chiamate network
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        setAuthChecked(true);
        setUserOk(false);
        router.replace("/login");
        return;
      }

      // 2) controllo “forte” (network). Se token è invalido → 403
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        // IMPORTANTISSIMO: pulisci SOLO locale, anche se il server rifiuta
        await supabase.auth.signOut({ scope: "local" });

        setAuthChecked(true);
        setUserOk(false);
        router.replace("/login");
        return;
      }

      setAuthChecked(true);
      setUserOk(true);
    })();
  }, [router]);

  //per carico dati da db day
  useEffect(() => {
    if (!userOk) return;
    if (!selectedDate) return;


    (async () => {
      setLoadingEntries(true);
      setDay(null);
      setEntries([]);
      setAttivita("");
      setCommessa("");
      try {
        const existingDay = await getDayByDate(selectedDate);
        // console.log("existingDay:", existingDay);

        if (!existingDay) return;

        setDay(existingDay);
        const rows = await listEntries(existingDay.id);
        setEntries(rows);

      } catch (e) {
        console.error(e);
      } finally {
        setLoadingEntries(false);
      }
    })();
  }, [userOk, selectedDate]);

  //per combo
  useEffect(() => {
    if (!userOk) return;

    (async () => {
      setLoadingLookups(true);
      try {
        const [c, a] = await Promise.all([listCommesse(), listAttivita()]);
        setCommesseOpt(c);
        setAttivitaOpt(a);
      } finally {
        setLoadingLookups(false);
      }
    })();
  }, [userOk]);

  useEffect(() => {
    if (!submitting) return;
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [submitting]);


  useEffect(() => {
    if (dateFromQuery) setSelectedDate(dateFromQuery);
    else setSelectedDate(todayISODate());
  }, [dateFromQuery]);


  async function onAddOrUpdate() {

    let d = day;
    if (!d) {
      d = await createDay(selectedDate);
      setDay(d);
    }

    const payload = {
      codcommessa: commessa.trim(),
      codattivita: attivita.trim(),
      minutes: Number(minutes),
    };
    console.log("EDITING?", editingId, "payload", payload);
    if (editingId) {
      const updated = await updateEntry(editingId, payload);
      setEntries((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
      cancelEdit();
      return;
    }

    const created = await addEntry({ day_id: d.id, ...payload });

    setEntries((prev) => [...prev, created]);
    setAttivita("");
    setMinutes(30);
  }

  async function onDelete(id: string) {
    await deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }


  if (!authChecked) return null;        // oppure “Caricamento…”
  if (!userOk) return null;
  return (
    <>

      <Stack gap={2}>

        <FormCard title="Data" actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />

            {status === "SUBMITTED" && (
              <Button
                size="sm"
                variant="secondary"
                onClick={reopenDay}
                title="Riapri la giornata per modificare gli inserimenti"
                leftIcon={<SquarePen size={16} />}
              >
              </Button>
            )}

            {status === "OPEN" && day && (
              <Button
                size="sm"
                onClick={submitDay}
                disabled={submitting || entries.length === 0}
                title="Conferma la giornata"
                rightIcon={<SendIcon size={16} />}
              >
                {submitting ? "Confermo…" : "Conferma"}

              </Button>
            )}
          </div>
        }>
          <Field
            label=""
            hint={getDayHint()}
          >

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const d = e.target.value;
                setSelectedDate(d);
                router.push(`/giornata?date=${d}`);
              }}
            />
          </Field>
        </FormCard>
        <FormCard title="Totale ore inserite" accent={false}
        >

          <MinutesProgress isEditable={isEditable} totalMinutes={totalMinutes} targetMinutes={480} />

        </FormCard>

        {isEditable && (
          <div ref={formRef}>
            <FormCard title="Aggiungi attività" subtitle="Inserisci attività e premi aggiungi." >



              <Field label="Commessa">
                <select
                  value={commessa}
                  onChange={(e) => onCommessaChange(e.target.value)}
                  disabled={loadingLookups}
                >
                  <option value="">{loadingLookups ? "Caricamento..." : "Scegli"}</option>
                  {commesseOpt.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Attività">
                <select
                  value={attivita}
                  onChange={(e) => setAttivita(e.target.value)}
                  disabled={loadingLookups || !commessa.trim()}
                >
                  <option value="">
                    {loadingLookups
                      ? "Caricamento..."
                      : !commessa.trim()
                        ? "Seleziona prima la commessa"
                        : "Scegli"}
                  </option>
                  {filteredAttivitaOpt.map((o) => (

                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}

                </select>
              </Field>

              <Field label="Minuti">
                <MinutesInput value={minutes} onChange={setMinutes} />
              </Field>

              <Button variant="secondary" onClick={onAddOrUpdate} disabled={!userOk || !commessa.trim() || !attivita.trim() || minutes <= 0}>
                {editingId ? "Salva modifiche" : "Aggiungi"}
              </Button>

              {editingId && (
                <Button variant="secondary" size="sm" onClick={cancelEdit}>
                  Annulla
                </Button>
              )}
            </FormCard>
          </div>
        )}


        <FormCard title="Attività inserite" accent={false}>
          {loadingEntries ? (
            <p className="gf-help">Caricamento inserimenti</p>
          ) : (
            <EntryList entries={entries} onDelete={onDelete}
              resolveCommessa={(code) => commessaLabelMap.get(code) ?? code}
              resolveAttivita={(code) => attivitaLabelMap.get(code) ?? code}
              onEdit={onEdit}
              editingId={editingId}
              readOnly={!isEditable}
            />
          )}
        </FormCard>
      </Stack>
      {submitting && (
        <div className="fixed inset-0 z-[100] bg-white/70 backdrop-blur-sm">
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">Conferma in corso…</div>
                  <div className="text-xs text-slate-600">Aggiorno la giornata e invio il riepilogo.</div>
                </div>
              </div>

              {submitError && (
                <p className="mt-3 text-sm text-red-700">{submitError}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );


}


export default function GiornataPage() {
  return (
    <Suspense fallback={null}>
      <GiornataInner />
    </Suspense>
  );
}

