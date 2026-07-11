"use client";

import { useState } from "react";
import type { DiscoveryCandidate, ProfilePhoto } from "@freeborn/shared";

function initials(name?: string | null) {
  if (!name) return "FB";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function publicPhotoUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function DiscoverCard({
  candidate,
  photos,
  onAction,
  pending,
}: {
  candidate: DiscoveryCandidate;
  photos: ProfilePhoto[];
  onAction: (action: "like" | "pass" | "superlike") => void;
  pending?: boolean;
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const displayPhoto = photos[photoIndex];
  const displayPhotoUrl = publicPhotoUrl(displayPhoto?.storage_path);
  const age = candidate.age ?? "—";
  const location = [candidate.city, candidate.region].filter(Boolean).join(", ");

  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-[rgba(9,16,28,0.85)] shadow-[var(--shadow-glow)] backdrop-blur-sm">
      {/* Photo area */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-rose-400/8 to-sky-400/8 sm:aspect-[3/4]">
        {displayPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayPhotoUrl}
            alt={candidate.display_name ? `${candidate.display_name}'s profile photo` : "Profile photo"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-400/20 to-sky-400/15">
            <span className="font-[family-name:var(--font-display)] text-6xl text-white/80">
              {initials(candidate.display_name)}
            </span>
          </div>
        )}

        {/* Photo progress dots */}
        <div className="absolute inset-x-0 top-4 z-10 flex gap-1.5 px-4">
          {Array.from({ length: Math.max(photos.length || 1, 1) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPhotoIndex(i)}
              className={`h-1 flex-1 rounded-full transition-all ${i === photoIndex ? "bg-white" : "bg-white/30"}`}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>

        {/* Photo navigation */}
        <button
          onClick={() => setPhotoIndex((p) => Math.max(0, p - 1))}
          className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/40 sm:flex"
          aria-label="Previous photo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <button
          onClick={() => setPhotoIndex((p) => Math.min((photos.length || 1) - 1, p + 1))}
          className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/40 sm:flex"
          aria-label="Next photo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>
        </button>

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

        {/* Info overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,4vw,2.8rem)] leading-[0.95] tracking-[-0.04em] text-white">
                {candidate.display_name ?? "Freeborn member"}
                <span className="ml-2 text-xl font-sans font-semibold text-white/80">{age}</span>
              </h2>
              <p className="mt-1.5 text-sm text-white/70">
                {location || "Nearby"}{candidate.occupation ? ` · ${candidate.occupation}` : ""}
              </p>
            </div>
            {candidate.is_verified && (
              <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm">
                Verified
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        <p className="text-base leading-7 text-[var(--color-pearl)]/90">
          {candidate.bio ?? "This member has not added a bio yet. Use their interests and intentions to decide with care."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {(candidate.relationship_goals ?? []).slice(0, 2).map((g) => (
            <span key={g} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold capitalize text-[var(--color-mist)]">
              {g.replace("_", " ")}
            </span>
          ))}
          {(candidate.interests ?? []).slice(0, 5).map((i) => (
            <span key={i} className="rounded-full bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--color-mist)]">
              {i}
            </span>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <button
            disabled={pending}
            onClick={() => onAction("pass")}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] py-4 text-sm font-bold text-[var(--color-mist)] transition hover:bg-white/[0.06] hover:text-[var(--color-pearl)] disabled:opacity-60"
          >
            <span className="block transition-transform group-hover:scale-110">✕</span>
            <span className="block text-xs font-normal mt-1 opacity-70">Pass</span>
          </button>
          <button
            disabled={pending}
            onClick={() => onAction("superlike")}
            className="group rounded-2xl border border-[var(--color-accent-blue)]/20 bg-[var(--color-accent-blue)]/8 py-4 text-sm font-bold text-[var(--color-accent-blue)] transition hover:bg-[var(--color-accent-blue)]/14 disabled:opacity-60"
          >
            <span className="block transition-transform group-hover:scale-110">★</span>
            <span className="block text-xs font-normal mt-1 opacity-70">Spark</span>
          </button>
          <button
            disabled={pending}
            onClick={() => onAction("like")}
            className="group rounded-2xl bg-gradient-to-r from-[var(--color-accent-rose)] to-[var(--color-accent-gold)] py-4 text-sm font-extrabold text-white shadow-lg transition hover:shadow-xl hover:translate-y-[-1px] disabled:opacity-60"
          >
            <span className="block transition-transform group-hover:scale-110">♥</span>
            <span className="block text-xs font-normal mt-1 opacity-80">{pending ? "…" : "Like"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
