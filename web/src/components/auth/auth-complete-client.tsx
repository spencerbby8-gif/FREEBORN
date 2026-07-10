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

function Ring() {
  return (
    <svg width={34} height={34} viewBox="0 0 24 24" fill="none" className="spin" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--color-gold-500)" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="var(--color-gold-500)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function AuthCompleteClient({ intent }: { intent: "verify" | "recovery" }) {
  const supabase = useMemo(
    () => (isWebSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [],
  );
  const router = useRouter();
  const [message, setMessage] = useState(
    intent === "verify" ? "Confirming your email…" : "Preparing your recovery…",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        if (!supabase) throw new Error("service_unavailable");

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

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) throw new Error("session_restore_failed");

        if (!mounted) return;

        router.replace(
          intent === "recovery" || type === "recovery"
            ? "/auth?mode=update-password&status=recovered"
            : `${next}?status=verified`,
        );
        router.refresh();
      } catch (err) {
        if (!mounted) return;
        setError(getAuthErrorMessage(err));
        setMessage("That link could not be completed.");
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [intent, router, supabase]);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        {error ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(255,107,122,0.18)] text-[var(--color-danger)]">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </span>
        ) : (
          <Ring />
        )}
      </div>
      <p className="mt-5 text-lg font-semibold text-[var(--color-pearl)]">{message}</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-mist)]">
        {error ?? "Just a moment while we securely finish setting up your session."}
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
