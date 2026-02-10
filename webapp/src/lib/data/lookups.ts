import { supabase } from "@/app/supabase/browser";

export type LookupOption = { value: string; label: string };

export async function listCommesse(): Promise<LookupOption[]> {
  const { data, error } = await supabase
    .from("commesse")
    .select("codcommessa, descrizione")
    .eq("attiva", true)
    .order("codcommessa", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => ({
    value: r.codcommessa,
    label: `${r.codcommessa} · ${r.descrizione}`,
  }));
}

export async function listAttivita(): Promise<LookupOption[]> {
  const { data, error } = await supabase
    .from("attivita")
    .select("codattivita, descrizione")
    .eq("attiva", true)
    .order("codattivita", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => ({
    value: r.codattivita,
    label: `${r.codattivita} · ${r.descrizione}`,
  }));
}
