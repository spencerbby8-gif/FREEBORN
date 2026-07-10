"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient, isWebSupabaseConfigured } from "@/lib/supabase/browser";
import { getAuthErrorMessage } from "@/lib/auth/messages";
import { safeNextPath } from "@/lib/auth/url";

function parseHashParams() {
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  return new URLSearchParams(hash);
}

export function AuthCompleteClient({ intent }: { intent: "verify" | "recovery" }) {
  const supabase = useMemo(
    () => (isWebSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [],
  );
  const router = useRouter();
  const [message, setMessage] = useState(
    intent === "verify" ? "Verifying your account…" : "Preparing your recovery…",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase is not configured for this environment.");
        }

        const hashParams = parseHashParams();
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        const next = safeNextPath(new URLSearchParams(window.location.search).get("next"));

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("We could not restore your session from this link.");

        if (!mounted) return;

        router.replace(
          intent === "recovery" || type === "recovery"
            ? "/auth?mode=update-password&status=recovered"
            : `${next}?status=verified`,
        );
        router.refresh();
      } catch (error) {
        if (!mounted) return;
        setError(getAuthErrorMessage(error));
        setMessage("That link could not be completed.");
      }
    };

    run();
    return () => { mounted = false; };
  }, [intent, router, supabase]);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/20 to-amber-400/10">
        <div className={`h-6 w-6 rounded-full border-2 border-[var(--color-accent-gold)] ${error ? "" : "animate-pulse"}`} />
      </div>
      <p className="mt-5 text-lg font-semibold text-[var(--color-pearl)]">{message}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">
        {error ?? "Please wait a moment while we secure your session."}
      </p>
      {error ? (
        <Link
          href="/auth?mode=sign-in&status=link-invalid"
          className="mt-6 inline-flex rounded-full bg-[var(--color-pearl)] px-6 py-3 text-sm font-bold text-[var(--color-ink)] transition hover:bg-white"
        >
          Return to sign in
        </Link>
      ) : null}
    </div>
  );
}
