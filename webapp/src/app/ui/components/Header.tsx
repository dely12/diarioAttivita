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

  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    let mounted = true;
  const supabase = getSupabaseBrowser();

  async function load() {
    // 1) check locale (no network)
    const { data: sessionData } = await supabase.auth.getSession();
    if (!mounted) return;

    const user = sessionData.session?.user;
    const userEmail = user?.email ?? null;

    setEmail(userEmail);

    // 2) se non loggata, non carico profile
    if (!userEmail) {
      setDisplayName("");
      setLoading(false);
      return;
    }

    // 3) carico profile (protetto da RLS)
    try {
      const profile = await getMyProfile();
      const name = profile?.nomedipendente?.trim();
      setDisplayName(name && name.length > 0 ? name : userEmail);
    } catch {
      // se profile non c'è o RLS blocca, fallback
      setDisplayName(userEmail);
    } finally {
      setLoading(false);
    }
  }

  load();

  // 4) aggiorna se cambia sessione
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    const userEmail = session?.user?.email ?? null;
    setEmail(userEmail);
    setDisplayName(userEmail ?? "");
  });

  return () => {
    mounted = false;
    sub.subscription.unsubscribe();
  };
  },[loading, email, pathname, router]);

async function logout() {
  const supabase = getSupabaseBrowser();
  await supabase.auth.signOut({ scope: "local" });
  router.replace("/login");
}

  // Su /login non mostrare chrome (scelta UX)
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
         {/* LEFT: hamburger */}
        <div className="shrink-0">
          <NavMenu items={defaultNavItems} />
        </div>
         {/* CENTER: app name + email */}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">Diario Attività</div>
          <div className="text-xs text-slate-600 truncate">
            {loading ? "…" : displayName ?? "Non autenticata"}
          </div>
        </div>

        {displayName && (
          <Button
            size="sm"
            variant="secondary"
            onClick={logout}
            title="Logout"
            aria-label="Logout"
            className="px-2 rounded-full"
          >
            <LogOut size={18} />
          </Button>
        )}
      </div>
    </header>
  );
}
