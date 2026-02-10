import { supabase } from "@/app/supabase/browser";

export type Day = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  status: string;
  created_at: string;
};

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getDayByDate(date: string) {
  const { data, error } = await supabase
    .from("days")
    .select("*")
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  return data; // può essere null
}
export async function createDay(date: string) {
  const { data, error } = await supabase
    .from("days")
    .insert({ date })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

