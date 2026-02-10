"use client"; 
import { useEffect, useMemo, useState } from "react"; 
import { supabase } from "@/app/supabase/browser";
import { useRouter } from "next/navigation";
import { Field } from "@/app/ui/components/Field";
import { Button } from "@/app/ui/components/Button";
import { todayISODate, getDayByDate, createDay } from "@/lib/data/days";
import { Stack } from "@/app/ui/components/Stack";
import { FormCard } from "@/app/ui/components/FormCard";
import { listEntries, addEntry, deleteEntry, Entry, updateEntry } from "@/lib/data/entries";
import { MinutesProgress } from "@/app/ui/components/MinutesProgress";
import { EntryList } from "@/app/ui/components/EntryList";
import { listCommesse, listAttivita, LookupOption } from "@/lib/data/lookups";
 import { MinutesInput } from "@/app/ui/components/MinutesInput";



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
const [selectedDate, setSelectedDate] = useState<string>(todayISODate());
const [commesseOpt, setCommesseOpt] = useState<LookupOption[]>([]);
const [attivitaOpt, setAttivitaOpt] = useState<LookupOption[]>([]);
const [loadingLookups, setLoadingLookups] = useState(true); 
const [editingId, setEditingId] = useState<string | null>(null);

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

function onEdit(id: string) {
   const e = entries.find(x => x.id === id);
   console.log("CLICK EDIT id =", id);
  if (!e) return;

  setCommessa(e.codcommessa);
  setAttivita(e.codattivita);
  setMinutes(e.minutes ?? 30);
  setEditingId(e.id);
}

function cancelEdit() {
  setEditingId(null);
  setCommessa("");
  setAttivita("");
  setMinutes(30);
}


let barClass = "bg-slate-300";
if (totalMinutes === targetMinutes) barClass = "bg-green-600";
if (totalMinutes > targetMinutes) barClass = "bg-red-600";
   
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
  <FormCard title="Aggiungi attività" subtitle="Inserisci una riga e aggiungila.">
  
  <Field label="Data">
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />
    </Field>


    <Field label="Commessa (codice)">
      <select
    value={commessa}
    onChange={(e) => setCommessa(e.target.value)}
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
    disabled={loadingLookups}
  >
    <option value="">{loadingLookups ? "Caricamento..." : "Scegli"}</option>
    {attivitaOpt.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
    </Field>
 
    <Field label="Minuti">
      <MinutesInput value={minutes} onChange={setMinutes} />
    </Field>

    <Button onClick={onAddOrUpdate} disabled={!userOk || !commessa.trim() || !attivita.trim() || minutes <= 0}>
       {editingId ? "Salva modifiche" : "Aggiungi"}
    </Button>

    {editingId && (
  <Button variant="secondary" size="sm" onClick={cancelEdit}>
    Annulla
  </Button>
)}
</FormCard>
<FormCard title="Totale ore inserite" accent={false}>
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
                   />
     )}
  </FormCard>
</Stack>
 

  );
}
