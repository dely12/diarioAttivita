export function Card({
  children,
  title,
  subtitle,
  actions,
  accent = true,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  accent?: boolean; // default true
}) {
  return (
    <section  className= {`gf-card ${accent ? "gf-card--accent" : ""}`}>
      {(title || subtitle || actions) && (
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
          {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
        </div>
      )}

      {children}
    </section>
  );
}