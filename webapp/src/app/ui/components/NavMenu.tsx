"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ClipboardList } from "lucide-react";
import { Button } from "@/app/ui/components/Button";

type Item = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export function NavMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // ESC per chiudere
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // click fuori per chiudere
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      const el = panelRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Apri menu"
        title="Menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-2">
            {items.map((it) => {
              const active = pathname === it.href;
              return (
                <button
                  key={it.href}
                  type="button"
                  onClick={() => go(it.href)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition
                    ${active ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <span className="inline-flex items-center gap-2">
                    {it.icon}
                    {it.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// comodo: preset per ora (una voce sola)
export const defaultNavItems: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: "Riepilogo", href: "/riepilogogiornate", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "Vista Calendario", href: "/calendario", icon: <ClipboardList className="h-4 w-4" /> },
];

