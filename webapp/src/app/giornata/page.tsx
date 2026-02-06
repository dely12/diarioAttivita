"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/supabase/browser";
import { useRouter } from "next/navigation";
import { Card } from "@/app/ui/components/Card";
import { Field } from "@/app/ui/components/Field";
import { Button } from "@/app/ui/components/Button";

export default function GiornataPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("...");

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) return router.replace("/login");
      setEmail(data.user.email ?? "(no email)");
    });
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
<Card
  title="Inserimento attività"
  subtitle="Compila le attività della giornata e conferma."
  meta={email}
  actions={
    <Button size="sm" variant="secondary" onClick={logout}>
      Logout
    </Button>
  }
>
    <h2 className="mb-1">Giornata</h2>
  <p className="gf-help">Utente: {email}</p>
     
  </Card>
  );
}
