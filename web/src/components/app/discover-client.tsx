"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { DiscoveryCandidate, ProfilePhoto } from "@freeborn/shared";
import { DiscoverCard } from "./discover-card";
import { swipeAction } from "@/lib/discover/actions";

function SparkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
    </svg>
  );
}

export function DiscoverClient({
  initialCandidates,
  photosByUser,
  emptyState,
}: {
  initialCandidates: DiscoveryCandidate[];
  photosByUser: Record<string, ProfilePhoto[]>;
  emptyState?: boolean;
}) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [index, setIndex] = useState(0);
  const [pending, startTransition] = useTransition();
  const [matched, setMatched] = useState<{ name: string | null } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const current = candidates[index];
  const remaining = Math.max(candidates.length - index - 1, 0);

  const handle = (action: "like" | "pass" | "superlike") => {
    if (!current || pending) return;
    const id = current.id;
    const name = current.display_name;
    setActionError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("liked_id", id);
      formData.set("action", action);
      const result = await swipeAction(formData);

      if (!result?.ok) {
        setActionError(result?.error ?? "That choice did not save. Please try again.");
        return;
      }

      if (result.matched) {
        setMatched({ name });
      }
      setIndex((currentIndex) => currentIndex + 1);
    });
  };

  if (!current) {
    return (
      <div className="empty-glow luminous-card flex min-h-[520px] flex-col items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.035] p-8 text-center sm:p-12">
        <div className="pulse-glow flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[rgba(239,94,94,0.28)] via-[rgba(246,215,154,0.20)] to-[rgba(138,110,242,0.18)] text-[var(--color-gold-300)] shadow-[0_0_46px_-20px_rgba(246,215,154,0.95)]">
          <SparkIcon />
        </div>
        <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-stone)]">
          Finite discovery
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.9rem,4vw,2.7rem)] leading-[1] tracking-[-0.045em] text-[var(--color-pearl)]">
          {emptyState ? "We're finding thoughtful people near you" : "You've seen everyone for now"}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--color-mist)]">
          {emptyState
            ? "Your boundaries are still active while the community grows. Tune preferences or check back soon as more values-aligned profiles join."
            : "New profiles arrive regularly. Your preferences and privacy settings keep working quietly in the background."}
        </p>
        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setCandidates(initialCandidates);
              setActionError(null);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-5 py-3 text-sm font-bold text-[var(--color-pearl)] transition hover:border-white/20 hover:bg-white/10"
          >
            Refresh discovery
          </button>
          <Link href="/app/profile#discovery" className="magic-button inline-flex items-center justify-center rounded-full bg-[var(--gradient-ember-warm)] px-5 py-3 text-sm font-extrabold text-white transition hover:translate-y-[-1px]">
            Tune preferences
          </Link>
        </div>
        <p className="mt-6 text-xs leading-5 text-[var(--color-mist)]">
          Private details like email and birth date are never shown in discovery.
        </p>
      </div>
    );
  }

  const photos = photosByUser[current.id] ?? [];

  return (
    <div className="relative mx-auto w-full max-w-[640px]">
      {matched ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-md sm:items-center" role="dialog" aria-modal="true" aria-labelledby="match-title">
          <div className="animate-scale-in magic-border w-full max-w-[460px] rounded-[30px] border border-white/10 bg-[rgba(9,16,28,0.94)] p-7 text-center shadow-[0_44px_120px_rgba(0,0,0,0.72),0_0_80px_-30px_rgba(239,94,94,0.9)] backdrop-blur-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/30 to-amber-400/20 text-[var(--color-gold-300)]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-gold-300)]">It&apos;s a match</p>
            <h2 id="match-title" className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--color-pearl)]">
              You and {matched.name ?? "someone thoughtful"} liked each other.
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-mist)]">
              Start from something specific in their profile. That is where Freeborn works best.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link href="/app/matches" className="magic-button rounded-2xl bg-[var(--gradient-ember-warm)] px-5 py-3 text-sm font-extrabold text-white">
                Open matches
              </Link>
              <button
                type="button"
                onClick={() => setMatched(null)}
                className="rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-3 text-sm font-bold text-[var(--color-pearl)] hover:bg-white/[0.08]"
              >
                Keep discovering
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {actionError ? (
        <div className="mb-4 rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-red-100" role="alert">
          <p className="font-semibold">That choice did not save.</p>
          <p className="mt-1 text-red-100/80">{actionError}</p>
        </div>
      ) : null}

      <DiscoverCard candidate={current} photos={photos} onAction={handle} pending={pending} />

      <div className="mt-4 flex flex-col gap-2 text-xs text-[var(--color-mist)] sm:flex-row sm:items-center sm:justify-between">
        <span>{remaining} thoughtful profile{remaining === 1 ? "" : "s"} remaining in this set</span>
        <span className="text-[var(--color-stone)]">Read values first · decide once · private essentials hidden</span>
      </div>
    </div>
  );
}
