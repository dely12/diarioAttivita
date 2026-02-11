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
       <div className="pt-1">{children}</div>
      {error ? (
        <p className="gf-error">{error}</p>
      ) : hint ? (
        <p className="gf-help">{hint}</p>
      ) : null}
    </div>
  );
}
