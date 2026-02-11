import { supabase } from "@/app/supabase/browser";

export type Day = {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  status: string;
  created_at: string;
};

export type DayStatus = "OPEN" | "SUBMITTED" | "LOCKED";

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

export async function listDays() {
  const { data, error } = await supabase
    .from("days")
    .select("id,date,status")
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function setDayStatus(dayId: string, status: DayStatus) {
  const { data, error } = await supabase
    .from("days")
    .update({ status })
    .eq("id", dayId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
 