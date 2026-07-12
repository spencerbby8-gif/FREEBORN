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
    <svg width={40} height={40} viewBox="0 0 24 24" fill="none" className="spin" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="var(--color-gold-500)" strokeOpacity="0.2" strokeWidth="2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="var(--color-gold-500)" strokeWidth="2" strokeLinecap="round" />
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
    <div className="flex flex-col items-center py-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] shadow-inner">
        {error ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-danger)]/15 text-[var(--color-danger)]">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </span>
        ) : (
          <Ring />
        )}
      </div>
      <h2 className="mt-8 text-2xl font-bold text-[var(--color-pearl)]">{message}</h2>
      <p className="mt-3 max-w-sm text-[15px] font-medium leading-relaxed text-[var(--color-mist)]">
        {error ?? "Just a moment while we securely finish setting up your session."}
      </p>
      {error ? (
        <Link
          href="/auth?mode=sign-in&status=link-invalid"
          className="mt-10 inline-flex h-[56px] items-center justify-center rounded-full bg-[var(--color-pearl)] px-10 text-[15px] font-bold text-[var(--color-ink)] transition-all hover:bg-white active:scale-[0.98]"
        >
          Return to sign in
        </Link>
      ) : null}
    </div>
  );
}
