import { Button } from "@/app/ui/components/Button";
import { Stack } from "@/app/ui/components/Stack";
import { Pencil, Trash2 } from "lucide-react"; 

export type EntryListItem = {
  id: string;
  codcommessa: string;
  codattivita: string; 
  minutes: number;
};
 

export function EntryList({
   
  entries,
  onDelete, 
  resolveCommessa,
  resolveAttivita, 
  onEdit,
  editingId,
  readOnly,
}: { 
  

  entries: EntryListItem[];
  onDelete: (id: string) => void; 
  resolveCommessa?: (code: string) => string;
  resolveAttivita?: (code: string) => string; 
  onEdit?: (id: string) => void;
  editingId?: string | null;
  readOnly?: boolean;

}) {
  return (
    <Stack gap={2}> 

      {entries.length === 0 ? (
        <p className="gf-help">Nessuna riga ancora.</p>
      ) : (
        <Stack gap={2}>          
            
          {entries.map((e) => {
              const isEditing = editingId === e.id;

              const commessaText = resolveCommessa ? resolveCommessa(e.codcommessa) : e.codcommessa;
              const attivitaText = resolveAttivita ? resolveAttivita(e.codattivita) : e.codattivita;

              //const canEdit = !!onEdit && !isEditing; // edit disponibile solo se ho callback e non è già in edit

              const canEdit = !!onEdit && !isEditing && !readOnly;
              const canDelete = !!onDelete && !readOnly;

              const rowClass = [
                "flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors",
                isEditing ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white",
              ].join(" ");

              return (
                <div key={e.id} className={rowClass}>
                  <div className="min-w-0">
                    {isEditing && (
                      <span className="mb-1 inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        In modifica
                      </span>
                    )}

                    <div className="gf-text font-medium">
                      {commessaText}
                    </div>
                    <div className="gf-muted">
                      {attivitaText}
                    </div>
                    <div className="gf-muted">{e.minutes} min</div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEdit!(e.id)}
                        aria-label="Modifica"
                        title="Modifica"
                      >
                        <Pencil size={16} />
                      </Button>
                    )}
                    {canDelete && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onDelete(e.id)}
                      aria-label="Elimina"
                      title="Elimina"
                    >
                      <Trash2 size={16} />
                    </Button>)}
                  </div>
                </div>
              );
            })}

        </Stack>
      )}
    </Stack>
  );
}
