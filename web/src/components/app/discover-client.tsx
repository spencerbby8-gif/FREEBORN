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
      <div className="empty-glow luminous-card flex min-h-[560px] flex-col items-center justify-center rounded-[40px] border border-white/10 bg-white/[0.02] p-10 text-center shadow-[var(--shadow-card-lg)]">
        <div className="pulse-glow flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-ember-500)]/20 via-[var(--color-gold-500)]/20 to-[var(--color-violet-500)]/20 text-[var(--color-gold-300)] shadow-[0_0_50px_-10px_rgba(217,167,82,0.4)]">
          <SparkIcon />
        </div>
        <div className="mt-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-sand)]">
            Finite Discovery
          </div>
          <h2 
            className="text-[clamp(2rem,5vw,2.75rem)] leading-[0.95] tracking-tight text-[var(--color-pearl)]"
            style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450" }}
          >
            {emptyState ? "Finding more thoughtful people." : "You've seen everyone for now."}
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[16px] leading-relaxed text-[var(--color-mist)]">
            {emptyState
              ? "Your active boundaries are set. We're searching for more values-aligned profiles that fit your preferences. Check back soon."
              : "New profiles arrive regularly. We'll notify you when someone new who matches your standards joins the room."}
          </p>
        </div>
        <div className="mt-12 flex w-full max-w-md flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setCandidates(initialCandidates);
              setActionError(null);
            }}
            className="inline-flex h-[56px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-8 text-[15px] font-bold text-[var(--color-pearl)] transition-all hover:bg-white/[0.08] active:scale-95"
          >
            Refresh Discovery
          </button>
          <Link href="/app/profile#discovery" className="magic-button inline-flex h-[56px] items-center justify-center rounded-2xl bg-[var(--gradient-ember-warm)] px-8 text-[15px] font-black text-white shadow-[var(--shadow-ember)] transition-all hover:-translate-y-px active:scale-95">
            Tune Preferences
          </Link>
        </div>
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
