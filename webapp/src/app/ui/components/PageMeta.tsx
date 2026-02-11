export function PageMeta({
  title,
  date,
  left,
  right,
  size = "h1",
}: {
  title: string;
  date?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  size?: "h1" | "h2";
}) {
  const titleClass = size === "h1" ? "gf-h1" : "text-xl font-semibold text-slate-900";

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {left && <div className="shrink-0">{left}</div>}
        <div className="flex items-baseline gap-3 min-w-0">
          <div className={`${titleClass} truncate`}>{title}</div>
          {date && (
            <span className="text-sm font-medium text-slate-500">{date}</span>
          )}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
