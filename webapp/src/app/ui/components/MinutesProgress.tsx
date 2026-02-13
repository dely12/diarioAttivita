import { Stack } from "@/app/ui/components/Stack";

type Status = "UNDER" | "OK" | "OVER";
export function MinutesProgress({
  totalMinutes,
  targetMinutes = 480,
  isEditable,
}: {
  totalMinutes: number;
  targetMinutes?: number;
  isEditable?: boolean;
}) {
  const delta = totalMinutes - targetMinutes;

const status: Status =
  delta === 0 ? "OK" : delta < 0 ? "UNDER" : "OVER";

const remaining = Math.max(-delta, 0);
const extra = Math.max(delta, 0);
  
  const pct = Math.min((totalMinutes / targetMinutes) * 100, 100);

   

 const barClass =
    status === "OK"
      ? "bg-green-600"
      : status === "UNDER"
        ? "bg-red-600"
        : "bg-orange-500"; 

 // Colore del testo parentesi
 const metaClass =
    status === "OK"
      ? "text-slate-500"
      : status === "UNDER"
        ? "text-red-500"
        : "text-orange-600";

   

  return (
    <Stack gap={2}>
      <div className="flex items-baseline justify-between"> 

        <div className="text-sm text-slate-700">
           <strong>{totalMinutes}</strong> min{" "}
          <span className={`text-sm ${metaClass}`}>
            {status === "OVER"
              ? `(${extra} min extra)`
              : `(${remaining} min restanti)`}
          </span>
        </div>
      </div>

      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>

        {status === "UNDER" && isEditable && (
        <p className="text-sm text-red-700">
          Non hai inserito 8 ore complete.
        </p>
      )}

      {status === "OVER" && isEditable && (
        <p className="text-sm text-orange-700">
          Hai superato le 8 ore. Verifica prima di inviare.
        </p>
      )}
    </Stack>
  );
}
