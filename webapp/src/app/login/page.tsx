"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

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
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
    <main style={{ padding: 24, maxWidth: 420 }}>
      <h1>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            style={{ width: "100%" }}
            className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm outline-none focus:border-neutral-600"
          />
        </label>

        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            style={{ width: "100%" }}
             className="h-11 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm outline-none focus:border-neutral-600"
          />
        </label>

        <button disabled={loading} className="h-11 w-full rounded-xl bg-neutral-100 text-sm font-semibold text-neutral-950 disabled:opacity-60"
>
          {loading ? "Accesso..." : "Entra"}
        </button>

        {status && <p>{status}</p>}
      </form>
    </main>
    </div>
  );
}
