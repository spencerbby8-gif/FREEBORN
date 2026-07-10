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
  const age = candidate.age ?? "—";
  const location = [candidate.city, candidate.region].filter(Boolean).join(", ");

  return (
    <article className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[rgba(9,16,28,0.82)] shadow-[var(--shadow-glow)]">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[rgba(255,255,255,0.04)] sm:aspect-[3/4]">
        {displayPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayPhoto.storage_path.startsWith("http")
              ? displayPhoto.storage_path
              : `https://picsum.photos/seed/${candidate.id}/900/1200`}
            alt={candidate.display_name ?? "Profile"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,rgba(255,133,120,0.22),rgba(140,207,255,0.16))]">
            <span className="font-[family-name:var(--font-display)] text-5xl text-white/90">
              {initials(candidate.display_name)}
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 p-4">
          <div className="flex gap-1.5">
            {Array.from({ length: Math.max(photos.length || 1, 1) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPhotoIndex(i)}
                className={`h-1.5 flex-1 rounded-full transition ${i === photoIndex ? "bg-white" : "bg-white/35"}`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => setPhotoIndex((p) => Math.max(0, p - 1))}
          className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/22 text-white backdrop-blur-md sm:flex"
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          onClick={() => setPhotoIndex((p) => Math.min((photos.length || 1) - 1, p + 1))}
          className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/22 text-white backdrop-blur-md sm:flex"
          aria-label="Next"
        >
          ›
        </button>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/32 to-transparent p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3rem)] leading-[0.95] tracking-[-0.04em] text-white">
                {candidate.display_name ?? "Freeborn member"}
                <span className="ml-3 text-[1.3rem] font-sans font-semibold opacity-90">{age}</span>
              </h2>
              <p className="mt-2 text-[15px] text-white/86">
                {location || "Somewhere thoughtful"} • {candidate.occupation ?? "Creative professional"}
              </p>
            </div>
            {candidate.is_verified ? (
              <div className="rounded-full border border-white/28 bg-white/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                Verified
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <p className="text-[16px] leading-7 text-[var(--color-pearl)]/92">
          {candidate.bio ?? "Thoughtful, intentional, and looking for something real."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {(candidate.relationship_goals ?? []).slice(0, 2).map((g) => (
            <span
              key={g}
              className="rounded-full border border-white/14 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold capitalize text-[var(--color-mist)]"
            >
              {g.replace("_", " ")}
            </span>
          ))}
          {(candidate.interests ?? []).slice(0, 5).map((i) => (
            <span
              key={i}
              className="rounded-full bg-white/[0.045] px-3 py-1.5 text-xs text-[var(--color-mist)]"
            >
              {i}
            </span>
          ))}
        </div>

        <div className="mt-7 grid grid-cols-3 gap-3">
          <button
            disabled={pending}
            onClick={() => onAction("pass")}
            className="rounded-[22px] border border-white/14 bg-white/[0.035] py-4 text-sm font-bold text-[var(--color-mist)] transition hover:bg-white/[0.07] disabled:opacity-60"
          >
            Pass
          </button>
          <button
            disabled={pending}
            onClick={() => onAction("superlike")}
            className="rounded-[22px] border border-[var(--color-accent-blue)]/30 bg-[var(--color-accent-blue)]/10 py-4 text-sm font-bold text-[var(--color-accent-blue)] transition hover:bg-[var(--color-accent-blue)]/18 disabled:opacity-60"
          >
            Super
          </button>
          <button
            disabled={pending}
            onClick={() => onAction("like")}
            className="rounded-[22px] bg-[var(--color-pearl)] py-4 text-sm font-extrabold text-[var(--color-ink)] transition hover:bg-white disabled:opacity-60"
          >
            {pending ? "…" : "Like"}
          </button>
        </div>
      </div>
    </article>
  );
}
