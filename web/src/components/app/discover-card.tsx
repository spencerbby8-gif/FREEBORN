"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { DiscoveryCandidate, ProfilePhoto, PromptAnswer } from "@freeborn/shared";
import { BadgeIcon, CloseIcon, HeartIcon, PinIcon, SparkIcon } from "@/components/icons";

function initials(name?: string | null) {
  if (!name) return "FB";
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function publicPhotoUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function humanize(value?: string | null) {
  return (value ?? "").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "gold" | "teal" | "neutral" }) {
  const cls = tone === "gold"
    ? "border-[var(--color-gold-500)]/25 bg-[var(--color-gold-500)]/10 text-[var(--color-gold-300)]"
    : tone === "teal"
      ? "border-[var(--color-teal-500)]/25 bg-[var(--color-teal-500)]/10 text-[var(--color-teal-300)]"
      : "border-white/12 bg-white/[0.08] text-white/88";
  return <span className={`rounded-full border px-3 py-1.5 text-[11px] font-bold backdrop-blur ${cls}`}>{children}</span>;
}

function CompatibilitySignal({ label, value, tone = "gold" }: { label: string; value: string; tone?: "gold" | "teal" | "neutral" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 backdrop-blur-md">
      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/48">{label}</p>
      <p className={`mt-1 truncate text-[12px] font-black ${tone === "teal" ? "text-[var(--color-teal-300)]" : tone === "gold" ? "text-[var(--color-gold-300)]" : "text-white/80"}`}>{value}</p>
    </div>
  );
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
  const location = [candidate.city, candidate.region].filter(Boolean).join(", ") || "Nearby";
  const goals = candidate.relationship_goals ?? [];
  const values = candidate.values ?? [];
  const interests = candidate.interests ?? [];
  const lifestyle = candidate.lifestyle_preferences ?? [];
  const prompt = useMemo(() => {
    const prompts = Array.isArray(candidate.prompt_answers) ? candidate.prompt_answers as PromptAnswer[] : [];
    return prompts.find((item) => item.prompt && item.answer) ?? null;
  }, [candidate.prompt_answers]);

  const compatibility = [
    goals[0] ? { label: "Intent", value: humanize(goals[0]), tone: "gold" as const } : null,
    values[0] ? { label: "Value", value: values[0], tone: "gold" as const } : null,
    lifestyle[0] ? { label: "Rhythm", value: lifestyle[0], tone: "teal" as const } : null,
  ].filter(Boolean) as Array<{ label: string; value: string; tone: "gold" | "teal" | "neutral" }>;

  return (
    <article className="relative mx-auto flex min-h-[calc(100svh-210px)] w-full max-w-[720px] flex-col overflow-hidden rounded-[46px] border border-white/12 bg-[rgba(9,16,28,0.94)] shadow-[0_50px_140px_-45px_rgba(0,0,0,0.95),0_0_90px_-50px_rgba(239,94,94,0.85)] backdrop-blur-3xl sm:min-h-[760px]">
      <div className="relative min-h-[520px] flex-1 overflow-hidden bg-gradient-to-br from-[rgba(239,94,94,0.15)] via-[rgba(217,167,82,0.08)] to-[rgba(138,110,242,0.12)]">
        {displayPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayPhotoUrl} alt={candidate.display_name ? `${candidate.display_name}'s profile photo` : "Profile photo"} className="h-full w-full object-cover transition duration-700" />
        ) : (
          <div className="flex h-full min-h-[520px] w-full items-center justify-center">
            <div className="text-center">
              <span className="font-[family-name:var(--font-display)] text-8xl tracking-tighter text-white/20">{initials(candidate.display_name)}</span>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-ash)]">Photo pending</p>
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 top-5 z-20 flex gap-1.5 px-5" aria-label="Profile photos">
          {Array.from({ length: Math.max(safePhotos.length, 1) }).map((_, index) => (
            <button key={index} type="button" onClick={() => setPhotoIndex(index)} className={`h-1 flex-1 rounded-full transition-all ${index === photoIndex ? "bg-white shadow-[0_0_14px_white]" : "bg-white/22 hover:bg-white/45"}`} aria-label={`Show photo ${index + 1}`} />
          ))}
        </div>

        {safePhotos.length > 1 ? (
          <div className="absolute inset-0 z-10 grid grid-cols-2">
            <button type="button" aria-label="Previous photo" onClick={() => setPhotoIndex((current) => Math.max(0, current - 1))} disabled={photoIndex === 0} className="h-full disabled:cursor-default" />
            <button type="button" aria-label="Next photo" onClick={() => setPhotoIndex((current) => Math.min(safePhotos.length - 1, current + 1))} disabled={photoIndex >= safePhotos.length - 1} className="h-full disabled:cursor-default" />
          </div>
        ) : null}

        <div className="absolute inset-x-0 top-10 z-20 flex items-center justify-between px-5 pt-3">
          <div className="flex flex-wrap gap-2">
            {candidate.is_verified ? <Chip tone="teal"><span className="inline-flex items-center gap-1.5"><BadgeIcon size={12} /> Verified</span></Chip> : <Chip tone="neutral">Not verified yet</Chip>}
            {photos.length ? <Chip tone="gold">{photos.length} photo{photos.length === 1 ? "" : "s"}</Chip> : null}
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/25 text-[var(--color-gold-300)] backdrop-blur-md"><SparkIcon size={18} /></div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/45 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-7">
          {prompt ? (
            <div className="mb-4 rounded-[24px] border border-white/14 bg-black/35 p-4 backdrop-blur-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.23em] text-white/62">{prompt.prompt}</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.15rem,3vw,1.55rem)] leading-snug text-white">“{prompt.answer}”</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(3rem,8vw,5rem)] leading-[0.86] tracking-[-0.06em] text-white">
                {candidate.display_name ?? "Freeborn Member"}{candidate.age ? <span className="ml-3 text-[0.42em] font-black text-white/65">{candidate.age}</span> : null}
              </h2>
              <p className="mt-3 flex items-center gap-2 truncate text-[13px] font-black uppercase tracking-[0.18em] text-white/72"><PinIcon size={15} /> {location}{candidate.occupation ? ` · ${candidate.occupation}` : ""}</p>
            </div>
            <div className="grid min-w-[240px] grid-cols-3 gap-2">
              {compatibility.map((item) => <CompatibilitySignal key={item.label} {...item} />)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-7">
        <p className="text-[16px] font-medium leading-8 text-[var(--color-pearl)]/92">
          {candidate.bio ?? "This member has not added a bio yet. Use their values, interests, and rhythm to decide with care."}
        </p>

        <div className="flex flex-wrap gap-2">
          {goals.slice(0, 3).map((goal) => <Chip key={goal} tone="gold">{humanize(goal)}</Chip>)}
          {values.slice(0, 4).map((value) => <Chip key={value} tone="gold">{value}</Chip>)}
          {interests.slice(0, 6).map((interest) => <Chip key={interest}>{interest}</Chip>)}
          {lifestyle.slice(0, 3).map((item) => <Chip key={item} tone="teal">{item}</Chip>)}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2" aria-label="Choose how to respond">
          <button type="button" disabled={pending} onClick={() => onAction("pass")} className="group flex min-h-[68px] flex-col items-center justify-center rounded-[26px] border border-white/10 bg-white/[0.025] transition hover:bg-white/[0.065] active:scale-95 disabled:opacity-50">
            <CloseIcon size={20} className="text-[var(--color-ash)] group-hover:text-white" />
            <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)] group-hover:text-[var(--color-sand)]">Pass</span>
          </button>
          <button type="button" disabled={pending} onClick={() => onAction("superlike")} className="group flex min-h-[68px] flex-col items-center justify-center rounded-[26px] border border-[var(--color-violet-500)]/30 bg-[var(--color-violet-500)]/8 transition hover:bg-[var(--color-violet-500)]/15 active:scale-95 disabled:opacity-50">
            <SparkIcon size={21} className="text-[var(--color-violet-300)] transition-transform group-hover:scale-110" />
            <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-violet-300)]">Spark</span>
          </button>
          <button type="button" disabled={pending} onClick={() => onAction("like")} className="magic-button group flex min-h-[68px] flex-col items-center justify-center rounded-[26px] bg-[var(--gradient-ember-warm)] shadow-[0_18px_45px_-14px_rgba(239,94,94,0.75)] transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50">
            <HeartIcon size={21} className="text-white" />
            <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-white/90">{pending ? "Saving" : "Like"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
