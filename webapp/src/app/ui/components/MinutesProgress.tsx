import { Stack } from "@/app/ui/components/Stack";

export function MinutesProgress({
  totalMinutes,
  targetMinutes = 480,
}: {
  totalMinutes: number;
  targetMinutes?: number;
}) {
  const pct = Math.min((totalMinutes / targetMinutes) * 100, 100);

  let barClass = "bg-slate-300";
  if (totalMinutes === targetMinutes) barClass = "bg-green-600";
  if (totalMinutes > targetMinutes) barClass = "bg-red-600";

  return (
    <Stack gap={2}>
      <div className="flex items-baseline justify-between">
        <h2 className="gf-section-title">Riepilogo</h2>

        <div className="text-sm text-slate-700">
          <strong>{totalMinutes}</strong> min{" "}
          <span className="text-slate-500">
            ({Math.max(targetMinutes - totalMinutes, 0)} min restanti)
          </span>
        </div>
      </div>

      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>

      {totalMinutes > targetMinutes && (
        <p className="text-sm text-red-700">
          Hai superato le 8 ore.
        </p>
      )}
    </Stack>
  );
}
