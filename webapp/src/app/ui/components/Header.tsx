"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/app/supabase/browser";
import { Button } from "@/app/ui/components/Button";
import { LogOut } from "lucide-react";
import { NavMenu, defaultNavItems } from "@/app/ui/components/NavMenu";
import { getMyProfile } from "@/lib/data/profile";


export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const supabase = getSupabaseBrowser();

  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [profileLoading, setProfileLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
const [loggingOut, setLoggingOut] = useState(false);
  const loading = !authReady || profileLoading;

  // 1) Auth bootstrap + subscription (mount-only)
  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!alive) return;

      if (error) console.error("getSession error", error);

      const u = session?.user ?? null;
      setEmail(u?.email ?? null);
      setUserId(u?.id ?? null);
      setAuthReady(true);
    }

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setEmail(u?.email ?? null);
      setUserId(u?.id ?? null);
      setAuthReady(true);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // 2) Profile load when user changes
  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      setProfileLoading(true);
      setDisplayName(null);
      setIsAdmin(false);

      if (!userId) {
        setProfileLoading(false);
        return;
      }

      // Best practice: getMyProfile deve essere client-safe e usare RLS
      const profile = await getMyProfile(supabase);
      if (!alive) return;

      setDisplayName(profile?.nomedipendente ?? null); 
      setProfileLoading(false);
    }

    loadProfile();

    return () => { alive = false; };
  }, [userId, supabase]);

  // 3) Redirect gate
  useEffect(() => {
    if (!authReady) return;

    const isLogin = pathname === "/login";
    const isAuthed = Boolean(userId);

    if (!isAuthed && !isLogin) router.replace("/login");
    if (isAuthed && isLogin){
      router.replace("/giornata");
      setLoggingOut(false);
    } 
  }, [authReady, userId, pathname, router]);

  async function logout() {
     setLoggingOut(true);
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/login");
  }

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
        <div className="shrink-0">
          <NavMenu items={defaultNavItems} />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">Diario Attività</div>
          <div className="text-xs text-slate-600 truncate">
              {(loading || loggingOut) ? "…" : displayName ?? "Non autenticata"}
            </div>
        </div>

        <div className="shrink-0 w-10 flex justify-end">
            {(displayName || loggingOut) ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={logout}
                disabled={loggingOut}
                title="Logout"
                aria-label="Logout"
                className="px-2 rounded-full"
              >
                <LogOut size={18} />
              </Button>
            ) : null}
          </div>

      </div>
    </header>
  );
}
