"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

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
    <main style={{ padding: 24 }}>
      <h1>Giornata</h1>
      <p>Utente: {email}</p>
      <button onClick={logout}>Logout</button>
    </main>
  );
}
