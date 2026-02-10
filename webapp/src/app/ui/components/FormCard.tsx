import { Card } from "@/app/ui/components/Card";
import { Stack } from "@/app/ui/components/Stack";

export function FormCard({
  title,
  subtitle, 
  children,
  accent = true,
}: {
  title: string;
  subtitle?: string; 
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card title={title} subtitle={subtitle} accent={accent}>
      <Stack gap={4}>{children}</Stack>
    </Card>
  );
}
