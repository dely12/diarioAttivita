export function Stack({
  children,
  gap = 4,
}: {
  children: React.ReactNode;
  gap?: 2 | 3 | 4 | 6;
}) {
  const map = { 2: "gap-2", 3: "gap-3", 4: "gap-4", 6: "gap-6" } as const;
  return <div className={`grid ${map[gap]}`}>{children}</div>;
}
