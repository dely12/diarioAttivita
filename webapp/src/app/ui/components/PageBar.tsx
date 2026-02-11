export function PageBar({
  left,
  children,
  right,
}: {
  left?: React.ReactNode;
  children?: React.ReactNode; // titolo/data/badge
  right?: React.ReactNode;
}) {
  return (
    <div className="sticky top-[52px] z-40 border-b border-slate-200 bg-slate-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-2">
        <div className="min-w-0 flex items-center gap-3">
          {left && <div className="shrink-0">{left}</div>}
          <div className="min-w-0">{children}</div>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </div>
  );
}
