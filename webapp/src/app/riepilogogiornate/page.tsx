"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/app/supabase/browser";

import { Stack } from "@/app/ui/components/Stack";
import { FormCard } from "@/app/ui/components/FormCard";
import { Plus } from "lucide-react";
import { listDays } from "@/lib/data/days";
import Link from "next/link";
import { ChevronRight, ChevronLeft , CalendarPlus2 } from "lucide-react";
import { Button } from "../ui/components/Button";
import { todayISODate, listDaySummaries, DaySummary, listDaySummariesRange } from "@/lib/data/days";
import { formatMinutesAsHours, toISODate } from "@/lib/data/util";



export default function RiepilogoGiornatePage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [userOk, setUserOk] = useState(false);

  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<DaySummary[]>([]);

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  function monthLabel(d: Date) {
    const s = d.toLocaleString("it-IT", { month: "long", year: "numeric" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function addMonths(d: Date, delta: number) {
    return new Date(d.getFullYear(), d.getMonth() + delta, 1);
  }
  // auth check (uguale a GiornataPage)
  useEffect(() => {
    (async () => {
      const supabase = getSupabaseBrowser();
      // 1) controllo locale: NON fa chiamate network
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        setAuthChecked(true);
        setUserOk(false);
        router.replace("/login");
        return;
      }

      // 2) controllo “forte” (network). Se token è invalido → 403
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        // IMPORTANTISSIMO: pulisci SOLO locale, anche se il server rifiuta
        await supabase.auth.signOut({ scope: "local" });

        setAuthChecked(true);
        setUserOk(false);
        router.replace("/login");
        return;
      }

      setAuthChecked(true);
      setUserOk(true);
    })();
  }, [router]);

  // load days
  useEffect(() => {
    if (!userOk) return;

    (async () => {
      setLoading(true);
      try {
        const fromISO = toISODate(monthCursor);
        const toISO = toISODate(addMonths(monthCursor, 1));
        const rows = await listDaySummariesRange(fromISO, toISO);
        setDays(rows);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userOk, monthCursor]);


  if (!authChecked) return null;
  if (!userOk) return null;

  return (
    <Stack gap={6}>
      <FormCard title="Riepilogo giornate" subtitle="visualizza o conferma le giornate" accent
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/giornata?date=${todayISODate()}`)}
            leftIcon={<CalendarPlus2 className="h-4 w-4" />}
          >
          </Button>
        }
      >
        <div className="w-full flex justify-center mb-4">
          <div className="w-full flex items-center justify-between mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMonthCursor(addMonths(monthCursor, -1))}
              className="px-2"
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            />

            <div className="text-sm font-semibold text-slate-900 text-center">
              {monthLabel(monthCursor)}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMonthCursor(addMonths(monthCursor, 1))}
              className="px-2"
              leftIcon={<ChevronRight className="h-4 w-4" />}
            />
          </div>


        </div>
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
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100 no-underline hover:no-underline focus:no-underline active:no-underline"
              >
                <div className="flex items-center gap-3">
                  {/* Left */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="truncate font-semibold text-slate-900">{d.date}</div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">
                          totale inserito:  {formatMinutesAsHours(d.total_minutes)}
                        </div>
                        <div className="gf-muted text-xs">{d.total_minutes} min</div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <StatusBadge status={d.status} />
                    </div>
                  </div>

                  {/* Right icon */}
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
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
      <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
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
