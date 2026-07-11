"use client";

import { useState, useTransition } from "react";
import type { DiscoveryCandidate, ProfilePhoto } from "@freeborn/shared";
import { DiscoverCard } from "./discover-card";
import { swipeAction } from "@/lib/discover/actions";

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

  const current = candidates[index];

  const handle = (action: "like" | "pass" | "superlike") => {
    if (!current) return;
    const id = current.id;
    const name = current.display_name;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("liked_id", id);
      fd.set("action", action);
      const res = await swipeAction(fd);
      if (res?.ok && res.matched) {
        setMatched({ name });
        setTimeout(() => setMatched(null), 3000);
      }
      setIndex((i) => i + 1);
    });
  };

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/8 bg-white/[0.03] p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/20 to-amber-400/10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-accent-gold)]">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>
          </svg>
        </div>
        <h2 className="mt-6 font-[family-name:var(--font-display)] text-2xl text-[var(--color-pearl)]">
          {emptyState ? "We're finding thoughtful people near you" : "You've seen everyone for now"}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--color-mist)]">
          {emptyState
            ? "Freeborn is expanding its community every day. Check back soon as new intentional profiles join."
            : "New profiles arrive regularly. Your preferences are always working quietly in the background."}
        </p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => { setIndex(0); setCandidates(initialCandidates); }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-[var(--color-pearl)] transition hover:bg-white/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
          <a href="/app/profile" className="inline-flex items-center gap-2 rounded-full bg-[var(--color-pearl)] px-5 py-3 text-sm font-bold text-[var(--color-ink)] transition hover:bg-white">
            Improve profile
          </a>
        </div>
      </div>
    );
  }

  const photos = photosByUser[current.id] ?? [];

  return (
    <div className="relative mx-auto max-w-[600px]">
      {/* Match notification */}
      {matched && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="animate-[fadeIn_0.3s_ease-out] rounded-3xl border border-white/10 bg-[rgba(9,16,28,0.92)] px-10 py-8 text-center shadow-[0_40px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/30 to-amber-400/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-accent-gold)]">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-gold)]">It&apos;s a match!</p>
            <p className="mt-2 text-xl font-[family-name:var(--font-display)] text-[var(--color-pearl)]">
              You and {matched.name ?? "someone thoughtful"} liked each other.
            </p>
            <p className="mt-2 text-sm text-[var(--color-mist)]">Start a conversation and see where it goes.</p>
          </div>
        </div>
      )}

      <DiscoverCard candidate={current} photos={photos} onAction={handle} pending={pending} />

      <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-mist)]">
        <span>{candidates.length - index - 1} remaining</span>
        <div className="flex items-center gap-4">
          <span>✕ Pass</span>
          <span>★ Spark</span>
          <span>♥ Like</span>
        </div>
      </div>
    </div>
  );
}
