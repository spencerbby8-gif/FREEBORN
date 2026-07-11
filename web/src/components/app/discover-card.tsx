"use client";

import { useState } from "react";
import type { DiscoveryCandidate, ProfilePhoto } from "@freeborn/shared";

function initials(name?: string | null) {
  if (!name) return "FB";
  return name
    .split(" ")
    .map((part) => part[0])
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

function humanize(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
  const safePhotos = photos.length ? photos : [];
  const displayPhoto = safePhotos[photoIndex] ?? safePhotos[0];
  const displayPhotoUrl = publicPhotoUrl(displayPhoto?.storage_path);
  const location = [candidate.city, candidate.region].filter(Boolean).join(", ");
  const goals = candidate.relationship_goals ?? [];
  const interests = candidate.interests ?? [];
  const lifestyle = candidate.lifestyle_preferences ?? [];

  return (
    <article className="luminous-card magic-border relative overflow-hidden rounded-[32px] border border-white/10 bg-[rgba(9,16,28,0.88)] shadow-[0_34px_95px_-34px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-[rgba(239,94,94,0.20)] via-[rgba(217,167,82,0.09)] to-[rgba(138,110,242,0.18)] sm:aspect-[4/4.7]">
        {displayPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayPhotoUrl}
            alt={candidate.display_name ? `${candidate.display_name}'s profile photo` : "Profile photo"}
            className="h-full w-full object-cover transition duration-700 hover:scale-[1.025]"
          />
        ) : (
          <div className="empty-glow flex h-full w-full items-center justify-center">
            <div className="relative text-center">
              <span className="font-[family-name:var(--font-display)] text-7xl tracking-[-0.08em] text-white/86">
                {initials(candidate.display_name)}
              </span>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                Photo pending
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 top-4 z-10 flex gap-1.5 px-4" aria-label="Profile photos">
          {Array.from({ length: Math.max(safePhotos.length, 1) }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPhotoIndex(index)}
              className={`h-1.5 flex-1 rounded-full transition ${
                index === photoIndex
                  ? "bg-[var(--color-pearl)] shadow-[0_0_18px_rgba(251,247,242,0.5)]"
                  : "bg-white/28 hover:bg-white/45"
              }`}
              aria-label={`Show photo ${index + 1}`}
            />
          ))}
        </div>

        {safePhotos.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => setPhotoIndex((current) => Math.max(0, current - 1))}
              disabled={photoIndex === 0}
              className="absolute left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/90 backdrop-blur-md transition hover:bg-black/45 disabled:cursor-not-allowed disabled:opacity-35 sm:flex"
              aria-label="Previous photo"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg>
            </button>
            <button
              type="button"
              onClick={() => setPhotoIndex((current) => Math.min(safePhotos.length - 1, current + 1))}
              disabled={photoIndex >= safePhotos.length - 1}
              className="absolute right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/90 backdrop-blur-md transition hover:bg-black/45 disabled:cursor-not-allowed disabled:opacity-35 sm:flex"
              aria-label="Next photo"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6" /></svg>
            </button>
          </>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/82 via-black/38 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.05rem,5vw,3.2rem)] leading-[0.92] tracking-[-0.055em] text-white">
                {candidate.display_name ?? "Freeborn member"}
                {candidate.age ? <span className="ml-2 align-baseline font-sans text-2xl font-semibold tracking-[-0.04em] text-white/78">{candidate.age}</span> : null}
              </h2>
              <p className="mt-2 truncate text-sm font-medium text-white/72">
                {location || "Nearby"}{candidate.occupation ? ` · ${candidate.occupation}` : ""}
              </p>
            </div>
            {candidate.is_verified ? (
              <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[rgba(166,230,220,0.35)] bg-[rgba(79,184,167,0.20)] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-teal-300)] backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal-300)]" />
                Verified
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        <section aria-label="Profile summary">
          <p className="text-[15px] leading-7 text-[var(--color-pearl)]/90 sm:text-base sm:leading-8">
            {candidate.bio ?? "This member has not added a bio yet. Use their interests, intentions, and profile context to decide with care."}
          </p>
          {candidate.education ? (
            <p className="mt-3 text-sm text-[var(--color-mist)]">Studied at {candidate.education}</p>
          ) : null}
        </section>

        {goals.length ? (
          <section aria-label="Relationship intentions">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-stone)]">Intentions</p>
            <div className="flex flex-wrap gap-2">
              {goals.slice(0, 3).map((goal) => (
                <span key={goal} className="rounded-full border border-[rgba(246,215,154,0.25)] bg-[rgba(217,167,82,0.10)] px-3 py-1.5 text-xs font-bold text-[var(--color-pearl)]">
                  {humanize(goal)}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {interests.length || lifestyle.length ? (
          <section aria-label="Interests and lifestyle">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--color-stone)]">Conversation starters</p>
            <div className="flex flex-wrap gap-2">
              {interests.slice(0, 6).map((interest) => (
                <span key={interest} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--color-mist)]">
                  {interest}
                </span>
              ))}
              {lifestyle.slice(0, 3).map((item) => (
                <span key={item} className="rounded-full bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--color-mist)]">
                  {item}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3" aria-label="Choose how to respond">
          <button
            type="button"
            disabled={pending}
            onClick={() => onAction("pass")}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-4 text-center font-bold text-[var(--color-mist)] transition hover:border-white/18 hover:bg-white/[0.07] hover:text-[var(--color-pearl)] disabled:cursor-wait disabled:opacity-60 sm:py-5"
          >
            <span className="block text-xl transition-transform group-hover:scale-110">×</span>
            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.12em]">Pass</span>
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => onAction("superlike")}
            className="group rounded-2xl border border-[var(--color-violet-300)]/25 bg-[var(--color-violet-500)]/10 px-2 py-4 text-center font-bold text-[var(--color-violet-300)] transition hover:border-[var(--color-violet-300)]/40 hover:bg-[var(--color-violet-500)]/16 disabled:cursor-wait disabled:opacity-60 sm:py-5"
          >
            <span className="block text-xl transition-transform group-hover:scale-110">★</span>
            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.12em]">Spark</span>
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => onAction("like")}
            className="magic-button group rounded-2xl bg-[var(--gradient-ember-warm)] px-2 py-4 text-center font-extrabold text-white shadow-[var(--shadow-ember)] transition hover:translate-y-[-2px] disabled:cursor-wait disabled:opacity-60 sm:py-5"
          >
            <span className="block text-xl transition-transform group-hover:scale-110">♥</span>
            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.12em]">{pending ? "Saving" : "Like"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
