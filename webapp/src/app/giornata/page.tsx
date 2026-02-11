"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/app/supabase/browser";
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
import { PageMeta } from "@/app/ui/components/PageMeta";
import { setDayStatus } from "@/lib/data/days";
import { PageBar } from "../ui/components/PageBar";
 


export default function GiornataPage() {
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
        <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
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
  async function submitDay() {
    if (!day) return;
    const updated = await setDayStatus(day.id, "SUBMITTED");
    setDay(updated);
    router.push("/riepilogogiornate");
  }

  async function reopenDay() {
    if (!day) return;
    const updated = await setDayStatus(day.id, "OPEN");
    setDay(updated);
  }

 

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      setAuthChecked(true);

      if (error || !data.user) {
        setUserOk(false);
        router.replace("/login");
        return;
      }

      setUserOk(true);
      setEmail(data.user.email ?? "(no email)");
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

    <Stack gap={6}>
      <FormCard title="Data" actions={
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />

          {status === "SUBMITTED" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={reopenDay}
              title="Riapri la giornata per modificare gli inserimenti"
            >
              Modifica
            </Button>
          )}

          {status === "OPEN" && day && (
            <Button
              size="sm"
              onClick={submitDay}
              disabled={entries.length === 0}
              title="Conferma la giornata"
            >
              Conferma
            </Button>
          )}
        </div>
      }>
        <Field
          label=""
          hint={
            day
              ? "Questa data contiene inserimenti."
              : "Inserire le attività per la giornata."
          }
        >
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </Field>
      </FormCard>


      {isEditable && (
          <div ref={formRef}>  
        <FormCard title="Aggiungi attività" subtitle="Inserisci attività e premi aggiungi." >



          <Field label="Commessa (codice)">
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

          <Field label="Attività (codice)">
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
              )) }

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
      <FormCard title="Totale ore inserite" accent={false}
      >

        <MinutesProgress totalMinutes={totalMinutes} targetMinutes={480} />

      </FormCard>

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


  );
}
