"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/supabase/browser";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      router.replace(data.session ? "/giornata" : "/login");
    });
  }, [router]);

  return <main style={{ padding: 24 }}>Redirect...</main>;
}
