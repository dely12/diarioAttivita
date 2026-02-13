"use client";

import Link from "next/link";
import { buildMonthGrid } from "@/lib/calendar/monthGrid";
import { formatMinutesAsHours } from "@/lib/data/util";
import type { DaySummary } from "@/lib/data/days";
import { Lock, SendIcon, Pencil } from "lucide-react";


const WEEKDAYS_IT = ["L", "M", "M", "G", "V", "S", "D"];

export function CalendarGrid({
  monthCursor,
  daysByDate,
  targetMinutes = 480,
}: {
  monthCursor: Date;
  daysByDate: Map<string, DaySummary>;
  targetMinutes?: number;
}) {
  const grid = buildMonthGrid(monthCursor);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-7 gap-2 pb-2">
        {WEEKDAYS_IT.map((w, i) => (
          <div key={i} className="text-center text-xs font-semibold text-slate-500">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {grid.map((cell) => {
          const summary = daysByDate.get(cell.iso);
          const minutes = summary?.total_minutes ?? 0;
          const status = (summary?.status ?? "OPEN").toUpperCase();
          const iconSizeClass = "w-3 h-3 sm:w-2 sm:h-4";
          const iconStroke = 2; // e basta, 2.25 su mobile è troppo

          const { cellClass, minutesClass, dayClass, iconClass } = styleForCell({
            inMonth: cell.inMonth,
            status,
            hasRow: Boolean(summary),
          });


          return (
            <Link
              key={cell.iso}
              href={`/giornata?date=${cell.iso}`}
              className={[
                "block relative rounded-lg transition p-1 sm:p-2 md:p-3",
                "no-underline hover:no-underline focus:no-underline active:no-underline",
                "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-200",
                "cursor-pointer",
                cellClass,
              ].join(" ")}


            >
              <div className="h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className={["text-sm font-semibold leading-tight", dayClass].join(" ")}>
                    {cell.day}
                  </div>


                  {summary && (
                    <div className="shrink-0 flex items-center justify-center">
                      {status === "LOCKED" ? (
                        <Lock className={[iconSizeClass, iconClass].join(" ")} strokeWidth={iconStroke} />
                      ) : status === "SUBMITTED" ? (
                        <SendIcon className={[iconSizeClass, iconClass].join(" ")} strokeWidth={iconStroke} />
                      ) : (
                        <Pencil className={[iconSizeClass, iconClass].join(" ")} strokeWidth={iconStroke} />
                      )}
                    </div>
                  )}


                </div>



                <div className="mt-2">
                  {summary ? (
                    <div className={["text-xs font-semibold tabular-nums leading-tight", minutesClass].join(" ")}>
                      {formatMinutesCompact(minutes)}
                    </div>
                  ) : (
                    <div className={cell.inMonth ? "text-[11px] text-slate-400" : "text-[11px] text-slate-300"}>—</div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
function formatMinutesCompact(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (total === 0) return "0";
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}`;
}

function styleForCell({
  inMonth,
  status,
  hasRow,
}: {
  inMonth: boolean;
  status: string;
  hasRow: boolean;
}) {
  // Base (sempre border-2 per stabilità layout)
  let cellClass = inMonth
    ? "bg-white border-2 border-slate-200 hover:bg-slate-50"
    : "bg-slate-50 border-2 border-slate-100";

  let minutesClass = inMonth ? "text-slate-700" : "text-slate-400";
  let dayClass = inMonth ? "text-slate-900" : "text-slate-400";
  let iconClass = "text-slate-400";

  if (!hasRow) {
    return { cellClass, minutesClass, dayClass, iconClass };
  }

  // LOCKED → grigio deciso, niente hover visivo
  if (status === "LOCKED") {
    cellClass = inMonth
      ? "bg-slate-100 border-2 border-slate-400 hover:bg-slate-100"
      : "bg-slate-100 border-2 border-slate-300";

    minutesClass = "text-slate-700";
    dayClass = "text-slate-700";
    iconClass = "text-slate-600";

    return { cellClass, minutesClass, dayClass, iconClass };
  }

  // SUBMITTED → verde
  if (status === "SUBMITTED") {
    cellClass = inMonth
      ? "bg-green-50/60 border-2 border-green-300 hover:bg-green-50/80"
      : "bg-green-50/30 border-2 border-green-200";

    minutesClass = "text-green-700";
    iconClass = "text-green-700";

    return { cellClass, minutesClass, dayClass, iconClass };
  }

  // OPEN → bluino
  cellClass = inMonth
    ? "bg-blue-50/50 border-2 border-blue-300 hover:bg-blue-50/70"
    : "bg-blue-50/30 border-2 border-blue-200";

  minutesClass = inMonth ? "text-blue-700" : "text-blue-600/60";
  iconClass = "text-blue-600";

  return { cellClass, minutesClass, dayClass, iconClass };
}
