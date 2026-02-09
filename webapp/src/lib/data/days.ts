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

export async function getOrCreateDayByDate(date: string): Promise<Day> {
  const { data: existing, error: selectError } = await supabase
    .from("days")
    .select("*")
    .eq("date", date)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return existing as Day;

  const { data: created, error: insertError } = await supabase
    .from("days")
    .insert({ date })
    .select("*")
    .single();

  if (insertError) throw insertError;
  return created as Day;
}

export async function getOrCreateToday(): Promise<Day> {
  return getOrCreateDayByDate(todayISODate());
}
