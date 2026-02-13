"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/ui/components/Button";
import { addMonths, monthLabelIT } from "@/lib/calendar/monthGrid";

export function MonthNavigator({
  monthCursor,
  onChange,
}: {
  monthCursor: Date;
  onChange: (d: Date) => void;
}) {
  return (
    <div className="w-full flex items-center justify-between px-1">
      <Button
        variant="secondary"
        size="sm"
        className="px-2"
        onClick={() => onChange(addMonths(monthCursor, -1))}
        title="Mese precedente"
        aria-label="Mese precedente"
        leftIcon={<ChevronLeft className="h-4 w-4" />}
      />
      <div className="text-sm font-semibold text-slate-900 text-center">
        {monthLabelIT(monthCursor)}
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="px-2"
        onClick={() => onChange(addMonths(monthCursor, 1))}
        title="Mese successivo"
        aria-label="Mese successivo"
        leftIcon={<ChevronRight className="h-4 w-4" />}
      />
    </div>
  );
}
