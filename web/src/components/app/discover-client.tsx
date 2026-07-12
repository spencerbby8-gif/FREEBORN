"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition, type PointerEvent } from "react";
import type { DiscoveryCandidate, ProfilePhoto } from "@freeborn/shared";
import { DiscoverCard } from "./discover-card";
import { swipeAction, undoPass } from "@/lib/discover/actions";
import { ArrowIcon, HeartIcon, SparkIcon } from "@/components/icons";

type DragState = { x: number; y: number; active: boolean; startX: number; startY: number; pointerId: number | null };

type LastPass = {
  candidate: DiscoveryCandidate;
  index: number;
};

function EmptyDiscover({ exhausted }: { exhausted: boolean }) {
  return (
    <div className="empty-glow luminous-card flex min-h-[680px] flex-col items-center justify-center rounded-[46px] border border-white/10 bg-white/[0.025] p-7 text-center shadow-[var(--shadow-card-lg)] sm:p-10">
      <div className="pulse-glow flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-ember-500)]/20 via-[var(--color-gold-500)]/20 to-[var(--color-violet-500)]/20 text-[var(--color-gold-300)] shadow-[0_0_50px_-10px_rgba(217,167,82,0.4)]">
        <SparkIcon size={30} />
      </div>
      <div className="mt-9">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-sand)]">Finite discovery</div>
        <h2 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3rem)] leading-[0.95] tracking-tight text-[var(--color-pearl)]">
          {exhausted ? "You've seen everyone for now." : "We're finding thoughtful people near you."}
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-[var(--color-mist)]">
          {exhausted
            ? "New profiles arrive regularly. Your preferences and privacy boundaries are still active while Freeborn refreshes the room."
            : "Your active boundaries are set. We are looking for values-aligned profiles that fit your age, distance, photo, and intent preferences."}
        </p>
      </div>
      <div className="mt-10 grid w-full max-w-md gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => window.location.reload()} className="inline-flex h-[56px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 text-sm font-bold text-[var(--color-pearl)] transition hover:bg-white/[0.08] active:scale-95">Refresh discovery</button>
        <Link href="/app/profile/privacy-visibility" className="magic-button inline-flex h-[56px] items-center justify-center rounded-2xl bg-[var(--gradient-ember-warm)] px-6 text-sm font-black text-white shadow-[var(--shadow-ember)] transition hover:-translate-y-px active:scale-95">Tune preferences</Link>
      </div>
    </div>
  );
}

function MatchModal({ name, onClose }: { name: string | null; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-md sm:items-center" role="dialog" aria-modal="true" aria-labelledby="match-title">
      <div className="animate-scale-in magic-border w-full max-w-[460px] rounded-[34px] border border-white/10 bg-[rgba(9,16,28,0.95)] p-7 text-center shadow-[0_44px_120px_rgba(0,0,0,0.72),0_0_80px_-30px_rgba(239,94,94,0.9)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/30 to-amber-400/20 text-[var(--color-gold-300)]"><HeartIcon size={30} /></div>
        <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--color-gold-300)]">It&apos;s a match</p>
        <h2 id="match-title" className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--color-pearl)]">You and {name ?? "someone thoughtful"} liked each other.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--color-mist)]">Start from something specific in their profile. That is where Freeborn works best.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link href="/app/matches" className="magic-button rounded-2xl bg-[var(--gradient-ember-warm)] px-5 py-3 text-sm font-extrabold text-white">Open matches</Link>
          <button type="button" onClick={onClose} className="rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-3 text-sm font-bold text-[var(--color-pearl)] hover:bg-white/[0.08]">Keep discovering</button>
        </div>
      </div>
    </div>
  );
}

function SwipeHint({ direction }: { direction: "like" | "pass" | "spark" | null }) {
  if (!direction) return null;
  const cls = direction === "like" ? "border-[var(--color-ember-500)]/50 text-white bg-[var(--color-ember-500)]/25" : direction === "spark" ? "border-[var(--color-violet-500)]/50 text-[var(--color-violet-100)] bg-[var(--color-violet-500)]/25" : "border-white/30 text-white/85 bg-white/12";
  const label = direction === "like" ? "Like" : direction === "spark" ? "Spark" : "Pass";
  return <div className={`pointer-events-none absolute left-1/2 top-10 z-30 -translate-x-1/2 rounded-full border px-5 py-2 text-[11px] font-black uppercase tracking-[0.28em] backdrop-blur-xl ${cls}`}>{label}</div>;
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
  const [candidates] = useState(initialCandidates);
  const [index, setIndex] = useState(0);
  const [pending, startTransition] = useTransition();
  const [matched, setMatched] = useState<{ name: string | null } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastPass, setLastPass] = useState<LastPass | null>(null);
  const [drag, setDrag] = useState<DragState>({ x: 0, y: 0, active: false, startX: 0, startY: 0, pointerId: null });
  const cardRef = useRef<HTMLDivElement>(null);

  const current = candidates[index];
  const upcoming = candidates.slice(index + 1, index + 3);
  const remaining = Math.max(candidates.length - index - 1, 0);
  const dragDirection = drag.x > 90 ? "like" : drag.x < -90 ? "pass" : drag.y < -110 ? "spark" : null;
  const transform = drag.active ? `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${drag.x / 28}deg)` : "translate3d(0,0,0) rotate(0deg)";

  const currentPhotos = useMemo(() => current ? photosByUser[current.id] ?? [] : [], [current, photosByUser]);

  const handleAction = (action: "like" | "pass" | "superlike") => {
    if (!current || pending) return;
    const id = current.id;
    const name = current.display_name;
    const currentIndex = index;
    setActionError(null);
    setDrag((value) => ({ ...value, active: false, x: 0, y: 0, pointerId: null }));

    startTransition(async () => {
      const formData = new FormData();
      formData.set("liked_id", id);
      formData.set("action", action);
      const result = await swipeAction(formData);

      if (!result?.ok) {
        setActionError(result?.error ?? "That choice did not save. Please try again.");
        return;
      }

      if (action === "pass") setLastPass({ candidate: current, index: currentIndex });
      else setLastPass(null);
      if (result.matched) setMatched({ name });
      setIndex((currentValue) => currentValue + 1);
    });
  };

  const handleUndoPass = () => {
    if (!lastPass || pending) return;
    const undoTarget = lastPass;
    setActionError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("liked_id", undoTarget.candidate.id);
      const result = await undoPass(formData);
      if (!result?.ok) {
        setActionError(result?.error ?? "We could not undo that pass. Please try again.");
        return;
      }
      setIndex(undoTarget.index);
      setLastPass(null);
    });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!current || pending) return;
    cardRef.current?.setPointerCapture(event.pointerId);
    setDrag({ active: true, startX: event.clientX, startY: event.clientY, x: 0, y: 0, pointerId: event.pointerId });
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    setDrag((value) => ({ ...value, x: event.clientX - value.startX, y: event.clientY - value.startY }));
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    cardRef.current?.releasePointerCapture(event.pointerId);
    const direction = dragDirection;
    if (direction === "like") handleAction("like");
    else if (direction === "pass") handleAction("pass");
    else if (direction === "spark") handleAction("superlike");
    else setDrag({ active: false, startX: 0, startY: 0, x: 0, y: 0, pointerId: null });
  };

  if (!current) return <EmptyDiscover exhausted={!emptyState} />;

  return (
    <div className="relative mx-auto w-full max-w-[760px]">
      {matched ? <MatchModal name={matched.name} onClose={() => setMatched(null)} /> : null}

      {actionError ? (
        <div className="mb-4 rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-red-100" role="alert">
          <p className="font-semibold">Discovery needs a refresh.</p>
          <p className="mt-1 text-red-100/80">{actionError}</p>
        </div>
      ) : null}

      <div className="relative min-h-[calc(100svh-210px)] sm:min-h-[760px]">
        {upcoming.map((candidate, depth) => (
          <div key={candidate.id} className="pointer-events-none absolute inset-x-4 top-5 bottom-0 rounded-[46px] border border-white/8 bg-gradient-to-br from-[rgba(239,94,94,0.10)] to-[rgba(138,110,242,0.08)] shadow-[0_30px_70px_-35px_rgba(0,0,0,0.9)]" style={{ transform: `scale(${0.96 - depth * 0.035}) translateY(${28 + depth * 22}px)`, opacity: 0.62 - depth * 0.18, zIndex: depth }} />
        ))}

        <div ref={cardRef} className="relative z-20 touch-pan-y select-none cursor-grab active:cursor-grabbing" style={{ transform, transition: drag.active ? "none" : "transform 420ms cubic-bezier(.2,.8,.2,1)" }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          <SwipeHint direction={dragDirection} />
          <DiscoverCard candidate={current} photos={currentPhotos} onAction={handleAction} pending={pending} />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-[26px] border border-white/8 bg-white/[0.025] p-4 text-xs text-[var(--color-mist)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <span>{remaining} thoughtful profile{remaining === 1 ? "" : "s"} remaining in this set</span>
        <span className="text-[var(--color-stone)]">Drag right to like · left to pass · up to spark</span>
      </div>

      {lastPass ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/[0.035] p-3 text-sm text-[var(--color-mist)]">
          <span>Passed on {lastPass.candidate.display_name ?? "this profile"}.</span>
          <button type="button" onClick={handleUndoPass} disabled={pending} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-xs font-black uppercase tracking-widest text-[var(--color-pearl)] transition hover:bg-white/[0.08] disabled:opacity-50"><ArrowIcon size={14} className="rotate-180" /> Undo</button>
        </div>
      ) : null}
    </div>
  );
}
