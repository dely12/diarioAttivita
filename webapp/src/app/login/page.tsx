"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/supabase/browser";
import { useRouter } from "next/navigation";
import { Card } from "@/app/ui/components/Card";
import { Field } from "@/app/ui/components/Field";
import { Button } from "@/app/ui/components/Button";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState("Controllo sessione...");
  const [loading, setLoading] = useState(false);

  // Se sei già loggata, non ha senso stare qui
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setStatus("Errore: " + error.message);
      else if (data.session) router.replace("/giornata");
      else setStatus("Non loggata");
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setStatus("Errore: " + error.message);
      return;
    }

    router.replace("/giornata");
  }

  return (
    <Card title="Login" subtitle="Accedi con email e password.">
      <form onSubmit={onSubmit} className="grid gap-4">
        <Field label="Email">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
          />
        </Field>

        <Field label="Password">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </Field>

        <Button   disabled={loading} variant="primary">
          {loading ? "Accesso..." : "Entra"}
        </Button >

        {status && <p className="gf-help">{status}</p>}
      </form>
    </Card>
  );
}
