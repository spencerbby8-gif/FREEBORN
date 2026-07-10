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
        setTimeout(() => setMatched(null), 2400);
      }
      setIndex((i) => i + 1);
    });
  };

  if (!current) {
    return (
      <div className="glass-panel premium-border rounded-[36px] p-10 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-stone)]">All caught up</p>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-[2.2rem] text-[var(--color-pearl)]">
          {emptyState ? "We’re finding thoughtful people near you." : "You’ve seen everyone for now."}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-[var(--color-mist)]">
          Check back soon — Freeborn refreshes discovery as new intentional profiles join, and your preferences are always working quietly in the background.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <a href="/app/profile" className="rounded-full bg-[var(--color-pearl)] px-5 py-3 text-sm font-bold text-[var(--color-ink)]">
            Improve profile
          </a>
          <button
            onClick={() => {
              setIndex(0);
              setCandidates(initialCandidates);
            }}
            className="rounded-full border border-white/14 bg-white/5 px-5 py-3 text-sm font-semibold text-[var(--color-pearl)]"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const photos = photosByUser[current.id] ?? [];

  return (
    <div className="relative">
      {matched ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="glass-panel premium-border rounded-[30px] px-8 py-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-accent-gold)]">It’s a match</p>
            <p className="mt-2 text-2xl font-[family-name:var(--font-display)] text-[var(--color-pearl)]">
              You and {matched.name ?? "someone thoughtful"} liked each other.
            </p>
          </div>
        </div>
      ) : null}
      <DiscoverCard candidate={current} photos={photos} onAction={handle} pending={pending} />
      <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-mist)]">
        <span>{candidates.length - index - 1} remaining</span>
        <div className="flex items-center gap-4">
          <span>← Pass</span>
          <span>Super ↑</span>
          <span>Like →</span>
        </div>
      </div>
    </div>
  );
}
