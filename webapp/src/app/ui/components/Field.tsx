export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <label>{label}</label>
      {children}
      {error ? (
        <p className="gf-error">{error}</p>
      ) : hint ? (
        <p className="gf-help">{hint}</p>
      ) : null}
    </div>
  );
}
