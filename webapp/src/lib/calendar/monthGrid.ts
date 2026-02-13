export type MonthCell = {
  iso: string;        // YYYY-MM-DD
  day: number;        // 1..31
  inMonth: boolean;
};

export function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

export function monthLabelIT(d: Date) {
  const s = d.toLocaleString("it-IT", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Monday-start
function startOfWeekMonday(d: Date) {
  const day = d.getDay(); // 0..6 (Sun..Sat)
  const diff = (day + 6) % 7; // Mon->0 ... Sun->6
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - diff);
  return x;
}

function addDays(d: Date, delta: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + delta);
  return x;
}

export function monthRangeISO(monthCursor: Date) {
  const from = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const to = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1);
  return { fromISO: toISODate(from), toISO: toISODate(to) };
}

export function buildMonthGrid(monthCursor: Date): MonthCell[] {
  const y = monthCursor.getFullYear();
  const m = monthCursor.getMonth();

  const first = new Date(y, m, 1);
  const gridStart = startOfWeekMonday(first);

  const out: MonthCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    out.push({
      iso: toISODate(d),
      day: d.getDate(),
      inMonth: d.getMonth() === m,
    });
  }
  return out;
}
