"use client"; 
import { useEffect, useState } from "react"; 
import { supabase } from "@/app/supabase/browser";
import { useRouter } from "next/navigation";
import { Card } from "@/app/ui/components/Card";
import { Field } from "@/app/ui/components/Field";
import { Button } from "@/app/ui/components/Button";
import { getOrCreateToday } from "@/lib/data/days";
import { Stack } from "@/app/ui/components/Stack";
import { FormCard } from "@/app/ui/components/FormCard";
import { listEntries, addEntry, deleteEntry, Entry } from "@/lib/data/entries";
import { MinutesProgress } from "@/app/ui/components/MinutesProgress";
import { EntryList } from "@/app/ui/components/EntryList";

export default function GiornataPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("...");
  const [day, setDay] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
const [commessa, setCommessa] = useState("");
const [attivita, setAttivita] = useState("");
const [minutes, setMinutes] = useState(30); 
const totalMinutes = entries.reduce((sum, e) => sum + (e.minutes ?? 0), 0);
const targetMinutes = 480; 

let barClass = "bg-slate-300";
if (totalMinutes === targetMinutes) barClass = "bg-green-600";
if (totalMinutes > targetMinutes) barClass = "bg-red-600";
   
 
  useEffect(() => {
     (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return router.replace("/login");

      setEmail(data.user.email ?? "(no email)");

      try {
        const d = await getOrCreateToday();
       
        setLoadingEntries(true);

        const rows = await listEntries(d.id);
        setEntries(rows);
        setDay(d);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingEntries(false);
      }
    })();
  }, [router]);


  async function onAdd() {
  if (!day) return;
  const created = await addEntry({
    day_id: day.id,
    codcommessa: commessa.trim(),
    codattivita: attivita.trim(),
    minutes: Number(minutes),
  });
  setEntries((prev) => [...prev, created]);
  setAttivita("");
  setMinutes(30); 
}

async function onDelete(id: string) {
  await deleteEntry(id);
  setEntries((prev) => prev.filter((e) => e.id !== id));
}


  async function logout() {
   await supabase.auth.signOut();   
   router.replace("/login");
  }

  return (
   <Stack gap={6}>
  <FormCard title="Aggiungi attività" subtitle="Inserisci una riga e aggiungila.">
  

    <Field label="Commessa (codice)">
      <input value={commessa} onChange={(e) => setCommessa(e.target.value)} />
    </Field>

    <Field label="Attività (codice)">
      <input value={attivita} onChange={(e) => setAttivita(e.target.value)} />
    </Field>

    <Field label="Minuti">
      <input
        type="number"
        value={minutes}
        onChange={(e) => setMinutes(Number(e.target.value))}
        min={1}
      />
    </Field>

    <Button onClick={onAdd} disabled={!commessa.trim() || !attivita.trim() || minutes <= 0}>
      Aggiungi
    </Button>
    
<MinutesProgress totalMinutes={totalMinutes} targetMinutes={480} />

  </FormCard>

  <FormCard title="Riepilogo">
    {loadingEntries ? (
    <p className="gf-help">Caricamento riepilogo…</p>
  ) : (
     <EntryList entries={entries} onDelete={onDelete} />
     )}
  </FormCard>
</Stack>
 

  );
}
