import { Button } from "@/app/ui/components/Button";
import { Stack } from "@/app/ui/components/Stack";

export type EntryListItem = {
  id: string;
  codcommessa: string;
  codattivita: string;
  minutes: number;
};

export function EntryList({
  entries,
  onDelete, 
}: {
  entries: EntryListItem[];
  onDelete: (id: string) => void; 
}) {
  return (
    <Stack gap={2}> 

      {entries.length === 0 ? (
        <p className="gf-help">Nessuna riga ancora.</p>
      ) : (
        <Stack gap={2}>
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900">
                  {e.codcommessa} · {e.codattivita}
                </div>
                <div className="text-xs text-slate-600">{e.minutes} min</div>
              </div>

              <Button size="sm" variant="secondary" onClick={() => onDelete(e.id)}>
                Elimina
              </Button>
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
