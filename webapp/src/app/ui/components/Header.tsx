"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/supabase/browser";
import { Button } from "@/app/ui/components/Button";
import { LogOut } from "lucide-react";

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
      setLoading(false);
    }

    load();
    // dopo load auth
      if (!loading && !email && pathname !== "/login") {
        router.replace("/login");
      }

    // opzionale ma utile: se cambia sessione, aggiorna header
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  },[loading, email, pathname, router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  // Su /login non mostrare chrome (scelta UX)
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">Diario Attività</div>
          <div className="text-xs text-slate-600 truncate">
            {loading ? "…" : email ?? "Non autenticata"}
          </div>
        </div>

        {email && (
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
