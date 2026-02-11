"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/supabase/browser";
import { Stack } from "@/app/ui/components/Stack";
import { FormCard } from "@/app/ui/components/FormCard";
import { Plus } from "lucide-react";
import { listDays } from "@/lib/data/days";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui/components/Button";
import { todayISODate  } from "@/lib/data/days";


type DayRow = {
  id: string;
  date: string;   // ISO yyyy-mm-dd
  status: string; // DRAFT / CONFIRMED (o quello che hai)
};

export default function RiepilogoGiornatePage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [userOk, setUserOk] = useState(false);

  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<DayRow[]>([]);

  // auth check (uguale a GiornataPage)
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      setAuthChecked(true);

      if (error || !data.user) {
        setUserOk(false);
        router.replace("/login");
        return;
      }

      setUserOk(true);
    })();
  }, [router]);

  // load days
  useEffect(() => {
    if (!userOk) return;

    (async () => {
      setLoading(true);
      try {
        const rows = await listDays();
        setDays(rows);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userOk]);

  if (!authChecked) return null;
  if (!userOk) return null;

  return (
    <Stack gap={6}>
      <FormCard title="Riepilogo giornate" subtitle="visualizza o conferma le giornate" accent
       actions={
    <Button
        variant="secondary"
      size="sm"
      leftIcon={<Plus className="h-4 w-4" />}
      onClick={() => router.push(`/giornata?date=${todayISODate()}`)}
    >
      Nuova giornata
    </Button>
  }
      >
        {loading ? (
          <p className="gf-help">Caricamento giornate…</p>
        ) : days.length === 0 ? (
          <p className="gf-help">Nessuna giornata trovata.</p>
        ) : (
          <Stack gap={3}>
            {days.map((d) => (

              <Link
                key={d.id ?? d.date}
                href={`/giornata?date=${d.date}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {d.date}
                    </div>

                    <div className="text-sm text-slate-500">
                     <StatusBadge status={d.status} />
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </Link>


            ))}
          </Stack>
        )}
      </FormCard>
    </Stack>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toUpperCase();

  if (s === "SUBMITTED") {
    return (
      <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        Confermata
      </span>
    );
  }

  if (s === "LOCKED") {
    return (
      <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        Inviata
      </span>
    );
  }

  // default = draft
  return (
    <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
      Bozza
    </span>
  );
}
