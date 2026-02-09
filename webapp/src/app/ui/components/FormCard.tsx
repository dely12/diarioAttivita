import { Card } from "@/app/ui/components/Card";
import { Stack } from "@/app/ui/components/Stack";

export function FormCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card title={title} subtitle={subtitle}>
      <Stack gap={4}>{children}</Stack>
    </Card>
  );
}
