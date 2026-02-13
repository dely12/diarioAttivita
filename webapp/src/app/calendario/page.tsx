"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Stack } from "@/app/ui/components/Stack";
import { FormCard } from "@/app/ui/components/FormCard";
import { MonthNavigator } from "@/app/ui/components/MonthNavigator";
import { getSupabaseBrowser } from "@/app/supabase/browser";

import { CalendarGrid } from "@/app/ui/components/CalendarGrid";
import { listDaySummariesRange, DaySummary } from "@/lib/data/days";
import { monthRangeISO } from "@/lib/calendar/monthGrid";

export default function CalendarioPage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [userOk, setUserOk] = useState(false);

  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<DaySummary[]>([]);

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Auth check (uguale alle tue pagine)
  useEffect(() => {
    (async () => {
      const supabase = getSupabaseBrowser();

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setAuthChecked(true);
        setUserOk(false);
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
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

  // Load month
  useEffect(() => {
    if (!userOk) return;

    (async () => {
      setLoading(true);
      try {
        const { fromISO, toISO } = monthRangeISO(monthCursor);
        const rows = await listDaySummariesRange(fromISO, toISO);
        setDays(rows);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userOk, monthCursor]);

  const daysByDate = useMemo(() => {
    const m = new Map<string, DaySummary>();
    for (const d of days) m.set(d.date, d);
    return m;
  }, [days]);

  if (!authChecked) return null;
  if (!userOk) return null;

  return (
    <Stack gap={6}>
      <FormCard title=""  accent>
        <div className="mb-4">
          <MonthNavigator monthCursor={monthCursor} onChange={setMonthCursor} />
        </div>

        {loading ? (
          <p className="gf-help">Caricamento…</p>
        ) : (
          <CalendarGrid monthCursor={monthCursor} daysByDate={daysByDate} />
        )}
      </FormCard>
    </Stack>
  );
}
