"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/supabase/browser";
import { useRouter } from "next/navigation";
import { Field } from "@/app/ui/components/Field";
import { Button } from "@/app/ui/components/Button";
import { Stack } from "@/app/ui/components/Stack";
import { FormCard } from "@/app/ui/components/FormCard"; 

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

    router.replace("/riepilogogiornate");
  }

  return (
       <form onSubmit={onSubmit}  > 
   <Stack gap={6}>
  <FormCard title="Login" subtitle="Accedi con mail e password.">
   
   <Field label="Email">
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
    </Field>
    <Field label="Password">
      <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} />
    </Field>
    <Button  disabled={loading} >
      {loading ? "Accesso..." : "Entra"}
    </Button>
 
             {status && <p className="gf-help">{status}</p>}
   
    </FormCard>
  </Stack>

      </form>
  );
}
