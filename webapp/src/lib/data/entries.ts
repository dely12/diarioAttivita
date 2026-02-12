import { getSupabaseBrowser } from "@/app/supabase/browser";

export type Entry = {
  id: string;
  day_id: string;
  user_id: string;
  codcommessa: string;
  codattivita: string; 
  minutes: number;
  created_at: string;
};
export async function updateEntry(
  id: string,
  input: { codcommessa: string; codattivita: string; minutes: number }
  
): Promise<Entry> { 
      const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
  
    .from("entries")
    .update({
      codcommessa: input.codcommessa,
      codattivita: input.codattivita,
      minutes: input.minutes,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as Entry;
}

export async function listEntries(dayId: string): Promise<Entry[]> {
      const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("day_id", dayId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Entry[];
}

export async function addEntry(input: {
  day_id: string;
  codcommessa: string; 
  codattivita: string; 
  minutes: number;
  
}): Promise<Entry> {
      const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from("entries")
    .insert({
      day_id: input.day_id,
      codcommessa: input.codcommessa,
      codattivita: input.codattivita,
      minutes: input.minutes,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Entry;
}

export async function deleteEntry(id: string): Promise<void> {
      const supabase = getSupabaseBrowser();
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) throw error;
}
