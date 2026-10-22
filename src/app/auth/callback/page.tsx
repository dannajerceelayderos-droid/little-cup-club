"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/config";

/** Supabase redirects magic links here; supabase-js exchanges the ?code for a session. */
export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState("Signing you in…");
  useEffect(() => {
    if (!isSupabaseConfigured) {
      router.replace("/");
      return;
    }
    (async () => {
      const { supabase } = await import("@/lib/store/supabase");
      const code = new URL(window.location.href).searchParams.get("code");
      if (code) {
        const { error } = await supabase().auth.exchangeCodeForSession(code);
        if (error && !(await supabase().auth.getSession()).data.session) {
          setMsg("That sign-in link has expired. Please request a new one.");
          return;
        }
      }
      router.replace("/passport");
    })();
  }, [router]);
  return <p className="px-4 py-24 text-center text-lg font-semibold" role="status">{msg}</p>;
}
