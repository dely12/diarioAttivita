"use client";

import { Stack } from "@/app/ui/components/Stack";
import { Button } from "@/app/ui/components/Button";

type Props = {
  value: number;
  onChange: (v: number) => void;
  max?: number;   // default 840
  step?: number;  // default 30
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function MinutesInput({
  value,
  onChange,
  max = 720,
  step = 30,
}: Props) {
  const safeValue = clamp(Number.isFinite(value) ? value : 0, 0, max);
    

  function set(v: number) {
    const snapped = Math.round(v / step) * step;
    onChange(clamp(snapped, 0, max));
  }

  function dec() {
    set(safeValue - step);
  }

  function inc() {
    set(safeValue + step);
  } 
  // Riferimenti visivi principali
  const scale = [ 
    { min: 120, label: "2h" },
    { min: 240, label: "4h" },
    { min: 360, label: "6h" },
    { min: 480, label: "8h" },
    { min: 600, label: "10h" }, 
  ];
 

  return (
    <Stack gap={3}>
      {/* Etichetta + valore */}
      <div className="flex items-baseline justify-between">
        <div className="gf-muted"></div>
        <div className="text-sm font-medium text-slate-800">
          {safeValue} min
        </div>
      </div>

      {/* Slider + controlli */}
      <div className="grid gap-3">
        {/* riga controlli */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={dec}
            disabled={safeValue <= 0}
            aria-label={`Diminuisci di ${step} minuti`}
            title={`-${step} min`}
          >
            −
          </Button>

          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={max}
              step={step}
              value={safeValue}
              onChange={(e) => set(Number(e.target.value))}
              className="w-full"
               

            />
          </div>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={inc}
            disabled={safeValue >= max}
            aria-label={`Aumenta di ${step} minuti`}
            title={`+${step} min`}
          >
            +
          </Button>
        </div>

        {/* scala sotto (allineata allo slider, non ai bottoni) */}
        {/* scala sotto (allineata allo slider) */}
            <div className="flex items-center gap-3">
            {/* spacer = bottone - */}
            <div className="w-9 shrink-0" />

            {/* stessa colonna dello slider */}
            <div className="relative h-5 flex-1">
                {scale.map((s) => {
                const left = (s.min / max) * 100;
                const active = safeValue >= s.min;

                return (
                    <div
                    key={s.min}
                    className={`absolute -translate-x-1/2 text-xs ${
                        active ? "text-slate-800" : "text-slate-400"
                    }`}
                    style={{ left: `${left}%` }}
                    >
                    {s.label}
                    </div>
                );
                })}
            </div>

            {/* spacer = bottone + */}
            <div className="w-9 shrink-0" />
            </div>
      </div>
    </Stack>
  );
}
