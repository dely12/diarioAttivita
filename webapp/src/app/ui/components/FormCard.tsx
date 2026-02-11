import { Card } from "@/app/ui/components/Card";
import { Stack } from "@/app/ui/components/Stack";
import * as React from "react";

type FooterLayout = "none" | "stack" | "row" | "auto";

export function FormCard({
  title,
  subtitle, 
  children,
  accent = true,
  actions,
  footer, 
  footerLayout = "auto",
}: {
  title: React.ReactNode;
  subtitle?: string; 
  children: React.ReactNode;
  accent?: boolean; 
  actions?: React.ReactNode; // ✅ nuovo: pulsanti in testata
  footer?: React.ReactNode;  // ✅ nuovo: area azioni in fondo
   footerLayout?: FooterLayout;
}) {
  const hasFooter = footer !== undefined && footer !== null;
  return (
    <Card title={title} subtitle={subtitle} accent={accent} actions={actions} >
      <Stack gap={4}>{children}</Stack>
       {hasFooter && (
        <div className="mt-4">
          {footerLayout === "none" && footer}

          {footerLayout === "stack" && <Stack gap={2}>{footer}</Stack>}

          {footerLayout === "row" && (
            <div className="flex flex-wrap items-center gap-2">{footer}</div>
          )}

          {footerLayout === "auto" && (
            <FooterAuto>{footer}</FooterAuto>
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * AUTO:
 * - se c'è un solo elemento: lo rende "block w-full" (quindi si estende)
 * - se ce ne sono più: li mette in riga (wrap) con gap
 *
 * Nota: React.Children.count vede i figli diretti del fragment <>...</>.
 */
function FooterAuto({ children }: { children: React.ReactNode }) {
  const count = React.Children.count(children);

  if (count <= 1) {
    // un solo elemento: estendi (tipicamente un Button full-width)
    return <Stack gap={2}>{children}</Stack>;//<div className="w-full">{children}</div>;
    
  }

  // più elementi: affiancati
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}