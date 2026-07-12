"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ProfilePhoto, UserProfileRow } from "@freeborn/shared";
import { requestVerification, submitVerificationSelfie, type SelfieVerificationState, type VerificationRequestState } from "@/lib/profile/actions";
import { posesForGender, verificationGenderFromProfileGender, type VerificationPose } from "@/lib/verification/poses";
import { ArrowIcon, BadgeIcon, CheckIcon, LockIcon, ShieldIcon, SparkIcon } from "@/components/icons";
import { initials, primaryPhoto, publicPhotoUrl } from "./profile-utils";

type VerificationSurfaceState = "approved" | "pending" | "failed" | "ready";

function statusCopy(state: VerificationSurfaceState) {
  if (state === "approved") {
    return {
      eyebrow: "Verified",
      title: "Your trust badge is active.",
      body: "Your profile can show the Verified signal in Discover and profile surfaces. That badge is only shown because verification is complete.",
      action: "Review profile",
      tone: "teal" as const,
    };
  }
  if (state === "pending") {
    return {
      eyebrow: "Verification sent",
      title: "Check your inbox to finish.",
      body: "Open the secure confirmation link from your email. Once confirmed, Freeborn updates your trust status automatically.",
      action: "Send another link",
      tone: "gold" as const,
    };
  }
  if (state === "failed") {
    return {
      eyebrow: "Needs attention",
      title: "That verification attempt needs a refresh.",
      body: "The link may have expired or could not be completed. Request a fresh verification email and try again.",
      action: "Send fresh link",
      tone: "danger" as const,
    };
  }
  return {
    eyebrow: "Trust & safety",
    title: "Verify the account behind the profile.",
    body: "Verification helps members know they are meeting a real account without exposing private details publicly.",
    action: "Start verification",
    tone: "gold" as const,
  };
}

function SubmitButton({ label, approved }: { label: string; approved: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={approved || pending}
      className="magic-button inline-flex h-[56px] w-full items-center justify-center rounded-2xl bg-[var(--color-pearl)] px-6 text-sm font-black text-[var(--color-ink)] shadow-[0_18px_42px_-18px_rgba(251,247,242,0.38)] transition hover:bg-white disabled:cursor-default disabled:opacity-60 sm:w-auto"
    >
      {approved ? "Already verified" : pending ? "Sending secure link…" : label}
    </button>
  );
}

function TrustStep({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--color-gold-500)]/10 text-xs font-black text-[var(--color-gold-300)] ring-1 ring-[var(--color-gold-500)]/20">{number}</span>
      <h3 className="mt-5 text-lg font-black text-[var(--color-pearl)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">{body}</p>
    </div>
  );
}

function randomPose(poses: VerificationPose[], previousId?: string) {
  if (!poses.length) return null;
  const candidates = poses.filter((pose) => pose.id !== previousId);
  const pool = candidates.length ? candidates : poses;
  return pool[Math.floor(Math.random() * pool.length)] ?? poses[0];
}

function SelfieSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={disabled || pending}
      className="magic-button inline-flex h-[56px] w-full items-center justify-center rounded-2xl bg-[var(--gradient-ember-warm)] px-6 text-sm font-black text-white shadow-[var(--shadow-ember)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Reviewing selfie…" : "Verify selfie"}
    </button>
  );
}

function CheckRow({ label, value }: { label: string; value?: boolean }) {
  if (value === undefined) return null;
  return (
    <div className={`rounded-2xl border p-3 ${value ? "border-[var(--color-teal-500)]/20 bg-[var(--color-teal-500)]/8" : "border-red-400/20 bg-red-500/[0.06]"}`}>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full ${value ? "bg-[var(--color-teal-500)]/15 text-[var(--color-teal-300)]" : "bg-red-400/10 text-red-100"}`}>{value ? "✓" : "!"}</span>
        <span className={value ? "text-[var(--color-teal-300)]" : "text-red-100"}>{label}</span>
      </div>
    </div>
  );
}

function SelfieGuidance({ profile, approved }: { profile: UserProfileRow; approved: boolean }) {
  const gender = verificationGenderFromProfileGender(profile.gender);
  const poses = useMemo(() => posesForGender(gender), [gender]);
  const [pose, setPose] = useState(() => randomPose(poses));
  const [fileName, setFileName] = useState<string | null>(null);
  const [state, action] = useActionState<SelfieVerificationState, FormData>(submitVerificationSelfie, null);

  if (!pose) return null;
  const selfieApproved = state?.status === "approved" || approved;
  const checks = state?.checks ?? {};

  return (
    <section className="luminous-card rounded-[40px] border border-white/10 bg-white/[0.02] p-5 shadow-[var(--shadow-card-lg)] sm:p-8">
      <div className="grid gap-7 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-center">
        <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_30%_0%,rgba(217,167,82,0.12),transparent_42%),rgba(255,255,255,0.025)] p-5">
          <div className="relative mx-auto aspect-square max-w-[280px] overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03]">
            <img src={pose.assetPath} alt={`${pose.title} verification pose illustration`} className="h-full w-full object-contain p-3" />
          </div>
          <div className="mt-5 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Your AI-assisted pose</p>
            <h3 className="mt-2 text-2xl font-black text-[var(--color-pearl)]">{pose.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">{pose.instruction}</p>
            <button
              type="button"
              onClick={() => setPose((current) => randomPose(poses, current?.id) ?? current)}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-xs font-black uppercase tracking-widest text-[var(--color-pearl)] transition hover:bg-white/[0.08]"
            >
              Show another pose
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Selfie check</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.4rem)] leading-[0.94] tracking-[-0.05em] text-[var(--color-pearl)]">Match the illustration with a fresh selfie.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-mist)]">Gemini privately checks that one clear face is visible, lighting is good, the requested pose matches, and the image appears to be a genuine selfie. Your verification selfie is stored in a private Supabase bucket and is never public.</p>

          <form action={action} className="mt-7 space-y-5">
            <input type="hidden" name="pose_id" value={pose.id} />
            <label className="block cursor-pointer rounded-[30px] border-2 border-dashed border-white/12 bg-white/[0.025] p-6 text-center transition hover:border-[var(--color-gold-500)]/35 hover:bg-white/[0.04]">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-gold-500)]/10 text-[var(--color-gold-300)]"><BadgeIcon size={22} /></span>
              <span className="mt-4 block text-base font-black text-[var(--color-pearl)]">{fileName ?? "Upload verification selfie"}</span>
              <span className="mt-2 block text-sm leading-6 text-[var(--color-mist)]">JPG, PNG, or WebP. Use natural light, one face, and the pose shown.</span>
              <input
                type="file"
                name="selfie"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
                required
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SelfieSubmitButton disabled={selfieApproved || !fileName} />
              <p className="text-xs leading-5 text-[var(--color-mist)]">The public badge updates only when the existing verified flag becomes true.</p>
            </div>
          </form>

          {state ? (
            <div className={`mt-6 rounded-[30px] border p-5 ${state.status === "approved" ? "border-[var(--color-teal-500)]/25 bg-[var(--color-teal-500)]/8" : "border-red-400/25 bg-red-500/[0.06]"}`} role={state.status === "approved" ? "status" : "alert"}>
              <p className="text-base font-black text-[var(--color-pearl)]">{state.status === "approved" ? "Selfie approved." : "Let’s try that again."}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">{state.summary ?? state.error ?? "Review the notes below, then retry with a clearer selfie."}</p>
              {state.feedback?.length ? (
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--color-mist)]">
                  {state.feedback.map((item) => <li key={item} className="flex gap-2"><span className="text-[var(--color-gold-300)]">•</span>{item}</li>)}
                </ul>
              ) : null}
              {state.checks ? (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <CheckRow label="One face" value={checks.one_face} />
                  <CheckRow label="Face visible" value={checks.face_clearly_visible} />
                  <CheckRow label="Eyes visible" value={checks.eyes_visible} />
                  <CheckRow label="Good lighting" value={checks.good_lighting} />
                  <CheckRow label="Image quality" value={checks.good_image_quality} />
                  <CheckRow label="Pose match" value={checks.pose_matches_illustration} />
                  <CheckRow label="Hand gesture" value={checks.required_hand_gesture_exists} />
                  <CheckRow label="Genuine selfie" value={checks.genuine_selfie} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StatusPanel({ state, localState }: { state: VerificationSurfaceState; localState: VerificationRequestState }) {
  if (localState?.ok && localState.status === "sent") {
    return (
      <div className="rounded-[28px] border border-[var(--color-teal-500)]/25 bg-[var(--color-teal-500)]/8 p-5 text-sm leading-6 text-[var(--color-teal-300)]" role="status">
        <p className="font-black text-[var(--color-pearl)]">Verification email sent.</p>
        <p className="mt-1 text-[var(--color-teal-300)]/80">Open the link from your inbox. If it does not arrive, check spam or request another link after a moment.</p>
      </div>
    );
  }
  if (localState && !localState.ok) {
    return (
      <div className="rounded-[28px] border border-red-400/25 bg-red-500/[0.07] p-5 text-sm leading-6 text-red-100" role="alert">
        <p className="font-black">We could not send verification.</p>
        <p className="mt-1 text-red-100/75">{localState.error ?? "Try again in a moment."}</p>
      </div>
    );
  }
  if (state === "pending") {
    return (
      <div className="rounded-[28px] border border-[var(--color-gold-500)]/25 bg-[var(--color-gold-500)]/8 p-5 text-sm leading-6 text-[var(--color-mist)]">
        <p className="font-black text-[var(--color-pearl)]">Pending until the secure link is opened.</p>
        <p className="mt-1">Your public profile will continue to show “Not verified yet” until verification is complete.</p>
      </div>
    );
  }
  return null;
}

export function VerificationFlow({
  profile,
  photos,
  initialState,
}: {
  profile: UserProfileRow;
  photos: ProfilePhoto[];
  initialState: VerificationSurfaceState;
}) {
  const [state, action] = useActionState(requestVerification, null);
  const effectiveState: VerificationSurfaceState = profile.is_verified ? "approved" : state?.ok && state.status === "sent" ? "pending" : initialState;
  const copy = statusCopy(effectiveState);
  const cover = primaryPhoto(photos);
  const photoUrl = publicPhotoUrl(cover?.storage_path);
  const approved = effectiveState === "approved";

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/app/profile" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-mist)] transition hover:text-[var(--color-pearl)]"><ArrowIcon size={16} className="rotate-180" /> Profile hub</Link>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Verification</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.25rem,5vw,4rem)] leading-[0.92] tracking-[-0.06em] text-[var(--color-pearl)]">A calm signal of real trust.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-mist)] sm:text-base">Freeborn verification is designed to strengthen accountability without putting private essentials on display.</p>
        </div>
      </header>

      <section className="luminous-card magic-border relative overflow-hidden rounded-[44px] border border-white/10 bg-[rgba(9,16,28,0.92)] p-5 shadow-[var(--shadow-card-lg)] sm:p-8 lg:p-10">
        <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[var(--color-gold-500)]/12 blur-[90px]" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] ${copy.tone === "teal" ? "border-[var(--color-teal-500)]/25 bg-[var(--color-teal-500)]/8 text-[var(--color-teal-300)]" : copy.tone === "danger" ? "border-red-400/25 bg-red-500/8 text-red-100" : "border-[var(--color-gold-500)]/25 bg-[var(--color-gold-500)]/8 text-[var(--color-gold-300)]"}`}>
              <BadgeIcon size={14} /> {copy.eyebrow}
            </div>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.6rem)] leading-[0.94] tracking-[-0.05em] text-[var(--color-pearl)]">{copy.title}</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-mist)]">{copy.body}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)]">Public badge</p><p className="mt-1 text-sm font-black text-[var(--color-pearl)]">{profile.is_verified ? "Shown" : "Hidden"}</p></div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)]">Privacy</p><p className="mt-1 text-sm font-black text-[var(--color-pearl)]">Protected</p></div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)]">Discovery</p><p className="mt-1 text-sm font-black text-[var(--color-pearl)]">Clear signal</p></div>
            </div>

            <form action={action} className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <SubmitButton label={copy.action} approved={approved} />
              <Link href="/app/profile/account-status" className="inline-flex h-[56px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 text-sm font-bold text-[var(--color-pearl)] transition hover:bg-white/[0.08]">Account status</Link>
            </form>
          </div>

          <div className="rounded-[36px] border border-white/10 bg-white/[0.035] p-5 shadow-inner">
            <div className="relative mx-auto h-56 w-full max-w-[260px] overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-rose-500/15 to-amber-500/10">
              {photoUrl ? <img src={photoUrl} alt="Your profile cover" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-6xl text-white/30">{initials(profile.display_name)}</div>}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-white">{profile.display_name ?? "Your profile"}</span>
                  <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${profile.is_verified ? "bg-[var(--color-teal-500)] text-white" : "bg-white/12 text-white/75"}`}>{profile.is_verified ? "Verified" : "Not yet"}</span>
                </div>
              </div>
            </div>
            <p className="mt-5 text-center text-sm leading-6 text-[var(--color-mist)]">This is the kind of trust signal members see. It never reveals your email, full birth date, provider, or exact location.</p>
          </div>
        </div>
      </section>

      <StatusPanel state={effectiveState} localState={state} />

      <SelfieGuidance profile={profile} approved={approved} />

      <section className="grid gap-4 md:grid-cols-3">
        <TrustStep number="01" title="Why it matters" body="Verification gives serious members a simple trust signal before they invest attention in a profile or conversation." />
        <TrustStep number="02" title="What is checked" body="Freeborn uses the account verification available today to confirm account ownership and keep the public badge honest." />
        <TrustStep number="03" title="What stays private" body="Email, full birth date, auth provider, exact coordinates, and private medical details are not shown in discovery or chat." />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[36px] border border-white/10 bg-white/[0.025] p-6 sm:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">What happens next</p>
          <div className="mt-6 space-y-4">
            {[
              ["Request", "Use the button above to send a secure verification email."],
              ["Confirm", "Open the link from your inbox. The link returns you to Freeborn securely."],
              ["Update", "When confirmation is complete, your account status syncs and the Verified badge can appear."],
            ].map(([title, body]) => (
              <div key={title} className="flex gap-4 rounded-3xl border border-white/8 bg-white/[0.02] p-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--color-gold-500)]/10 text-[var(--color-gold-300)]"><CheckIcon size={16} /></span>
                <div><p className="font-black text-[var(--color-pearl)]">{title}</p><p className="mt-1 text-sm leading-6 text-[var(--color-mist)]">{body}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[36px] border border-white/10 bg-white/[0.025] p-6 sm:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Trust promise</p>
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 text-sm leading-6 text-[var(--color-mist)]"><LockIcon size={18} className="mt-1 shrink-0 text-[var(--color-gold-300)]" /> Verification is a public signal, not a public dossier.</div>
            <div className="flex items-start gap-3 text-sm leading-6 text-[var(--color-mist)]"><ShieldIcon size={18} className="mt-1 shrink-0 text-[var(--color-teal-300)]" /> We never imply every profile is verified.</div>
            <div className="flex items-start gap-3 text-sm leading-6 text-[var(--color-mist)]"><SparkIcon size={18} className="mt-1 shrink-0 text-[var(--color-gold-300)]" /> The goal is confidence, not pressure.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
