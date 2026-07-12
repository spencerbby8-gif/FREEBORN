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
    <article className="luminous-card magic-border relative overflow-hidden rounded-[40px] border border-white/10 bg-[rgba(9,16,28,0.92)] shadow-[var(--shadow-card-lg)] backdrop-blur-3xl">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-[rgba(239,94,94,0.15)] via-[rgba(217,167,82,0.08)] to-[rgba(138,110,242,0.12)] sm:aspect-[4/4.8]">
        {displayPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayPhotoUrl}
            alt={candidate.display_name ? `${candidate.display_name}'s profile photo` : "Profile photo"}
            className="h-full w-full object-cover transition duration-1000 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="relative text-center">
              <span 
                className="text-8xl tracking-tighter text-white/20"
                style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 500" }}
              >
                {initials(candidate.display_name)}
              </span>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-ash)]">
                Photo Pending
              </p>
            </div>
          </div>
        )}

        {/* Photo Navigation Indicators */}
        <div className="absolute inset-x-0 top-6 z-10 flex gap-1.5 px-6" aria-label="Profile photos">
          {Array.from({ length: Math.max(safePhotos.length, 1) }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPhotoIndex(index)}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                index === photoIndex
                  ? "bg-white shadow-[0_0_15px_white]"
                  : "bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Show photo ${index + 1}`}
            />
          ))}
        </div>

        {/* Floating Navigation Controls */}
        {safePhotos.length > 1 ? (
          <div className="absolute inset-0 z-10 flex items-center justify-between px-4 pointer-events-none">
            <button
              type="button"
              onClick={() => setPhotoIndex((current) => Math.max(0, current - 1))}
              disabled={photoIndex === 0}
              className="pointer-events-auto h-12 w-12 flex items-center justify-center rounded-full bg-black/20 text-white/80 backdrop-blur-md transition-all hover:bg-black/40 hover:text-white disabled:opacity-0"
              aria-label="Previous photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6" /></svg>
            </button>
            <button
              type="button"
              onClick={() => setPhotoIndex((current) => Math.min(safePhotos.length - 1, current + 1))}
              disabled={photoIndex >= safePhotos.length - 1}
              className="pointer-events-auto h-12 w-12 flex items-center justify-center rounded-full bg-black/20 text-white/80 backdrop-blur-md transition-all hover:bg-black/40 hover:text-white disabled:opacity-0"
              aria-label="Next photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6" /></svg>
            </button>
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-10">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 
                className="text-[clamp(2.25rem,6vw,3.5rem)] leading-[0.9] tracking-tight text-white"
                style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 500" }}
              >
                {candidate.display_name ?? "Freeborn Member"}
                {candidate.age ? <span className="ml-3 text-2xl font-bold opacity-60">{candidate.age}</span> : null}
              </h2>
              <p className="mt-3 truncate text-[15px] font-bold text-white/70 uppercase tracking-widest">
                {location || "Nearby"}{candidate.occupation ? ` · ${candidate.occupation}` : ""}
              </p>
            </div>
            {candidate.is_verified ? (
              <div className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-teal-500)]/30 bg-[var(--color-teal-500)]/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-teal-300)] backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal-300)] shadow-[0_0_8px_var(--color-teal-300)]" />
                Verified
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-10">
        <section aria-label="Profile summary">
          <p className="text-[17px] leading-relaxed text-[var(--color-pearl)]/90 font-medium">
            {candidate.bio ?? "This member has not added a bio yet. Use their interests, intentions, and profile context to decide with care."}
          </p>
          {candidate.education ? (
            <p className="mt-4 flex items-center gap-2 text-[13px] font-bold text-[var(--color-ash)] uppercase tracking-wider">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              Studied at {candidate.education}
            </p>
          ) : null}
        </section>

        {goals.length ? (
          <section aria-label="Relationship intentions">
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-ash)]">Intentions</p>
            <div className="flex flex-wrap gap-2.5">
              {goals.slice(0, 3).map((goal) => (
                <span key={goal} className="rounded-full border border-[var(--color-gold-500)]/20 bg-[var(--color-gold-500)]/5 px-4 py-2 text-[12px] font-bold text-[var(--color-gold-300)] shadow-[0_0_15px_rgba(217,167,82,0.1)]">
                  {humanize(goal)}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {(interests.length || lifestyle.length) ? (
          <section aria-label="Interests and lifestyle">
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-[var(--color-ash)]">Conversation starters</p>
            <div className="flex flex-wrap gap-2">
              {interests.slice(0, 8).map((interest) => (
                <span key={interest} className="rounded-full border border-white/5 bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-bold text-[var(--color-sand)] transition-colors hover:bg-white/10">
                  {interest}
                </span>
              ))}
              {lifestyle.slice(0, 4).map((item) => (
                <span key={item} className="rounded-full bg-white/[0.02] px-3.5 py-1.5 text-[12px] font-medium text-[var(--color-ash)]">
                  {item}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-3 gap-4 pt-4" aria-label="Choose how to respond">
          <button
            type="button"
            disabled={pending}
            onClick={() => onAction("pass")}
            className="group flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] py-5 transition-all hover:bg-white/[0.06] hover:border-white/20 active:scale-95 disabled:opacity-50"
          >
            <span className="text-2xl text-[var(--color-ash)] group-hover:text-[var(--color-pearl)] transition-colors">×</span>
            <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)] group-hover:text-[var(--color-sand)]">Pass</span>
          </button>
          
          <button
            type="button"
            disabled={pending}
            onClick={() => onAction("superlike")}
            className="group flex flex-col items-center justify-center rounded-3xl border border-[var(--color-violet-500)]/30 bg-[var(--color-violet-500)]/5 py-5 transition-all hover:bg-[var(--color-violet-500)]/15 hover:border-[var(--color-violet-500)]/60 active:scale-95 disabled:opacity-50 shadow-[0_0_25px_rgba(138,110,242,0.1)] hover:shadow-[0_0_40px_rgba(138,110,242,0.25)]"
          >
            <span className="text-2xl text-[var(--color-violet-300)] transition-transform group-hover:scale-125">★</span>
            <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-violet-300)]/90">Spark</span>
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={() => onAction("like")}
            className="magic-button group flex flex-col items-center justify-center rounded-3xl bg-[var(--gradient-ember-warm)] py-5 shadow-[0_15px_35px_-5px_rgba(239,94,94,0.4)] transition-all hover:-translate-y-px active:scale-95 disabled:opacity-50"
          >
            <span className="text-2xl text-white">♥</span>
            <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-white/90">{pending ? "Saving" : "Like"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
