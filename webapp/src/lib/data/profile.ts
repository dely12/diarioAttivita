import { getSupabaseBrowser } from "@/app/supabase/browser";

export type Profile = {
  user_id: string;
  nomedipendente: string | null;
};

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = getSupabaseBrowser();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) return null;

  const { data, error } = await supabase
    .from("dipendenti") 
    .select("user_id, nomedipendente")
    .eq("user_id", userRes.user.id)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}
