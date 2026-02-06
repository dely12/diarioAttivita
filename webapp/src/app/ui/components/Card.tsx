export function Card({
  children,
  title,
  subtitle,
  meta,
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="gf-card">
      {(title || subtitle || meta || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h1 className="text-xl font-semibold text-slate-900">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
          </div>

          {(meta || actions) && (
            <div className="flex items-center gap-3">
              {meta && (
                <div className="max-w-[220px] truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {meta}
                </div>
              )}
              {actions}
            </div>
          )}
        </div>
      )}

      {children}
    </section>
  );
}
