"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { ProfilePhoto, UserProfileRow } from "@freeborn/shared";
import { assignVerificationChallengeAction, requestVerification, submitVerificationSelfie, type SelfieVerificationState } from "@/lib/profile/actions";
import { generateVerificationChallenge, posesForGender, verificationGenderFromProfileGender, type VerificationChallenge, type VerificationPose } from "@/lib/verification/poses";
import { ArrowIcon, BadgeIcon, CameraIcon, CheckIcon, CloseIcon, LockIcon, ShieldIcon, SparkIcon } from "@/components/icons";
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

function CheckRow({ label, value }: { label: string; value?: boolean }) {
  if (value === undefined) return null;
  return (
    <div className={`rounded-2xl border p-3.5 transition-all ${value ? "border-[var(--color-teal-500)]/25 bg-[var(--color-teal-500)]/10" : "border-red-400/25 bg-red-500/[0.08]"}`}>
      <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.16em]">
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${value ? "bg-[var(--color-teal-500)]/20 text-[var(--color-teal-300)]" : "bg-red-400/20 text-red-200"}`}>{value ? "✓" : "!"}</span>
        <span className={value ? "text-[var(--color-teal-300)]" : "text-red-200"}>{label}</span>
      </div>
    </div>
  );
}

function SelfieGuidance({
  profile,
  approved,
  isOnboarding,
}: {
  profile: UserProfileRow;
  approved: boolean;
  isOnboarding?: boolean;
}) {
  const gender = verificationGenderFromProfileGender(profile.gender);
  const poses = useMemo(() => posesForGender(gender), [gender]);
  const [pose, setPose] = useState(() => randomPose(poses));
  const [challenge, setChallenge] = useState<VerificationChallenge | null>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [mode, setMode] = useState<"guide" | "camera" | "preview">("guide");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, action] = useActionState<SelfieVerificationState, FormData>(submitVerificationSelfie, null);

  const selfieApproved = state?.status === "approved" || approved;
  const checks = state?.checks ?? {};
  const displayImage = pose?.photoPath ?? pose?.assetPath ?? "/freeborn-mark.svg";

  useEffect(() => {
    let active = true;
    assignVerificationChallengeAction(pose?.id).then((res) => {
      if (!active) return;
      if (res.ok && res.challenge) {
        setChallenge(res.challenge);
        setChallengeError(null);
        if (res.challenge.pose && res.challenge.pose.id !== pose?.id) {
          setPose(res.challenge.pose);
        }
      } else if (pose) {
        if (res.cooldownUntil) {
          setChallengeError(res.error ?? "Temporary verification cooldown active.");
        } else {
          setChallenge(generateVerificationChallenge(pose));
        }
      }
    }).catch(() => {
      if (!active || !pose) return;
      setChallenge(generateVerificationChallenge(pose));
    });
    return () => { active = false; };
  }, [pose, pose?.id]);

  useEffect(() => {
    if (mode === "camera" && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [mode]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (capturedPreviewUrl) {
        URL.revokeObjectURL(capturedPreviewUrl);
      }
    };
  }, [capturedPreviewUrl]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setCameraReady(false);
    setMode("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraReady(true);
    } catch {
      setCameraError("We couldn't open live video right inside your browser. Tap below to launch your device camera or select from your gallery.");
    }
  };

  const captureLiveFrame = () => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `live-selfie-${Date.now()}.jpg`, { type: "image/jpeg" });
      stopCamera();
      setCapturedFile(file);
      setCapturedPreviewUrl(URL.createObjectURL(blob));
      setMode("preview");
    }, "image/jpeg", 0.92);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    stopCamera();
    setCapturedFile(file);
    if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
    setCapturedPreviewUrl(URL.createObjectURL(file));
    setMode("preview");
  };

  const handleRetry = () => {
    stopCamera();
    const next = randomPose(poses, pose?.id) ?? pose;
    if (next) {
      setPose(next);
      setChallenge(generateVerificationChallenge(next));
    }
    setCapturedFile(null);
    if (capturedPreviewUrl) URL.revokeObjectURL(capturedPreviewUrl);
    setCapturedPreviewUrl(null);
    setCameraError(null);
    setChallengeError(null);
    setMode("guide");
  };

  const handleSubmit = (formData: FormData) => {
    if (!pose) return;
    if (capturedFile) {
      formData.set("selfie", capturedFile);
    }
    formData.set("pose_id", pose.id);
    if (challenge?.challengeToken) {
      formData.set("challenge_token", challenge.challengeToken);
    }
    startTransition(() => {
      action(formData);
    });
  };

  if (!pose) return null;

  return (
    <section className={`luminous-card rounded-[40px] border border-white/10 bg-[rgba(9,16,28,0.95)] p-5 shadow-[var(--shadow-card-lg)] sm:p-8 lg:p-10 ${isOnboarding ? "mx-auto max-w-[1040px]" : ""}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6 mb-8">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold-500)]/25 bg-[var(--color-gold-500)]/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--color-gold-300)]">
            <CameraIcon size={14} /> Live Camera Guided Verification
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(1.75rem,4vw,2.8rem)] leading-[0.94] tracking-[-0.05em] text-[var(--color-pearl)]">
            Verify with a guided live camera selfie.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">
            Follow the posing assistant below, open your camera, and take a fresh live selfie matching the pose.
          </p>
        </div>
        {selfieApproved ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-teal-500)]/30 bg-[var(--color-teal-500)]/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-[var(--color-teal-300)]">
            <BadgeIcon size={16} /> Trust Badge Active
          </span>
        ) : null}
      </div>

      {profile.identity_consistency_status === "mismatch_reverify_required" ? (
        <div className="mb-8 rounded-[34px] border border-[var(--color-gold-500)]/35 bg-[var(--color-gold-500)]/10 p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(217,167,82,0.25)]" role="status">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold-500)]/30 bg-[var(--color-gold-500)]/20 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-[var(--color-gold-300)]">
                ! Photo Confirmation Needed
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-black text-[var(--color-pearl)]">
                We need to confirm your updated photos.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-mist)]">
                Your profile photos changed enough that we need a quick fresh selfie check to confirm your identity and keep your public trust badge active.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {profile.identity_consistency_status === "pending_photos" && !profile.is_verified ? (
        <div className="mb-8 rounded-[34px] border border-[var(--color-gold-500)]/35 bg-[var(--color-gold-500)]/10 p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(217,167,82,0.25)]" role="status">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold-500)]/30 bg-[var(--color-gold-500)]/20 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-[var(--color-gold-300)]">
                ! Public Photo Needed
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-black text-[var(--color-pearl)]">
                Please add a public photo before completing verification.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-mist)]">
                Your verification selfie check is recorded safely. Please add at least one public profile photo so Freeborn can confirm consistency and activate your public trust badge.
              </p>
            </div>
            <Link href="/app/profile/photos" className="magic-button inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--gradient-ember-warm)] px-6 text-xs font-black uppercase tracking-widest text-white shadow-[var(--shadow-ember)] transition hover:-translate-y-0.5">
              Add Public Photo
            </Link>
          </div>
        </div>
      ) : null}

      {profile.identity_consistency_status === "periodic_reverification_due" && !profile.is_verified ? (
        <div className="mb-8 rounded-[34px] border border-[var(--color-gold-500)]/35 bg-[var(--color-gold-500)]/10 p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(217,167,82,0.25)]" role="status">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold-500)]/30 bg-[var(--color-gold-500)]/20 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-[var(--color-gold-300)]">
                ! Periodic Check Due
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-black text-[var(--color-pearl)]">
                Please complete a quick selfie check.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-mist)]">
                To keep Freeborn accounts secure and protect verified trust badges over time, your periodic verification check is now due. Please complete a quick selfie check below.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {state?.status === "cooldown" || challengeError ? (
        <div className="mb-8 rounded-[34px] border border-[var(--color-gold-500)]/35 bg-[var(--color-gold-500)]/10 p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(217,167,82,0.25)]" role="alert">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gold-500)]/30 bg-[var(--color-gold-500)]/20 px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-[var(--color-gold-300)]">
                ! Temporary Cooldown Active
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-black text-[var(--color-pearl)]">
                Verification attempts paused.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-mist)]">
                {state?.error ?? challengeError ?? "To keep accounts secure and protect against automated attempts, verification cooldown is active. Please wait 30 minutes before requesting a new challenge."}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "guide" && (
        <div className="grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-center">
          <div className="rounded-[36px] border border-white/12 bg-[radial-gradient(circle_at_30%_0%,rgba(217,167,82,0.14),transparent_50%),rgba(255,255,255,0.03)] p-6 text-center shadow-inner">
            <div className="relative mx-auto aspect-square max-w-[310px] overflow-hidden rounded-[30px] border border-white/12 bg-[var(--color-ink)] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.65)]">
              <img src={displayImage} alt={`${pose.title} human style reference`} className="h-full w-full object-cover p-2" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                  Assistant Reference Guide
                </span>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Unique Assigned Challenge</p>
              <h3 className="mt-2 text-2xl font-black text-[var(--color-pearl)]">{challenge?.pose.title ?? pose.title}</h3>
              <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-left text-xs leading-5 text-[var(--color-mist)]">
                <p><strong className="text-[var(--color-pearl)]">1. Pose Guide:</strong> {challenge?.pose.instruction ?? pose.instruction}</p>
                <p><strong className="text-[var(--color-pearl)]">2. Hand Gesture:</strong> {challenge?.gesture && challenge.gesture !== "none" ? challenge.gesture : "No hand gesture required"}</p>
                <p><strong className="text-[var(--color-pearl)]">3. Head Turn:</strong> {challenge?.headDirection === "left" ? "Slightly Left" : challenge?.headDirection === "right" ? "Slightly Right" : "Straight Ahead"}</p>
                <p><strong className="text-[var(--color-pearl)]">4. Facial Expression:</strong> {challenge?.expressionCue ?? "Confident neutral expression"}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextPose = randomPose(poses, pose?.id) ?? pose;
                  setPose(nextPose);
                  setChallenge(generateVerificationChallenge(nextPose));
                }}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] px-5 text-xs font-black uppercase tracking-widest text-[var(--color-pearl)] transition hover:bg-white/[0.1] hover:border-white/20"
              >
                Show different pose guide
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.02] p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Primary Action</p>
              <h3 className="mt-2 text-2xl font-black text-[var(--color-pearl)]">Open camera directly</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-mist)]">
                The camera capture flow is Freeborn&apos;s primary trust signal because it confirms a fresh live selfie matching the assigned human reference pose right in the moment.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={selfieApproved || state?.status === "cooldown"}
                  className="magic-button inline-flex h-[56px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--gradient-ember-warm)] px-7 text-base font-black text-white shadow-[var(--shadow-ember)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  <CameraIcon size={20} /> Open Camera
                </button>

                <label className={`inline-flex h-[56px] w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-6 text-sm font-bold text-[var(--color-pearl)] transition hover:bg-white/[0.08] sm:w-auto ${selfieApproved || state?.status === "cooldown" ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                  <span>Or choose from gallery</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="sr-only"
                    disabled={selfieApproved || state?.status === "cooldown"}
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] border border-white/8 bg-white/[0.02] p-5">
                <p className="text-xs font-black uppercase tracking-widest text-[var(--color-sand)]">What Gemini Checks</p>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-[var(--color-mist)]">
                  <li className="flex items-center gap-2"><span className="text-[var(--color-teal-300)]">✓</span> Exactly one face visible</li>
                  <li className="flex items-center gap-2"><span className="text-[var(--color-teal-300)]">✓</span> Clear eye &amp; face visibility</li>
                  <li className="flex items-center gap-2"><span className="text-[var(--color-teal-300)]">✓</span> Good front lighting &amp; quality</li>
                  <li className="flex items-center gap-2"><span className="text-[var(--color-teal-300)]">✓</span> Matches {pose.title} pose</li>
                </ul>
              </div>
              <div className="rounded-[26px] border border-white/8 bg-white/[0.02] p-5">
                <p className="text-xs font-black uppercase tracking-widest text-[var(--color-sand)]">Backend Decision Rule</p>
                <p className="mt-3 text-xs leading-5 text-[var(--color-mist)]">
                  Gemini evaluates the captured selfie only. Freeborn&apos;s backend policy engine is the final judge and alone updates your public <span className="font-bold text-[var(--color-pearl)]">is_verified</span> trust badge.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === "camera" && (
        <div className="space-y-6">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[820px] overflow-hidden rounded-[36px] border border-white/15 bg-black shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover -scale-x-100"
            />

            <div className="absolute left-4 top-4 z-10 flex items-center gap-3 rounded-2xl border border-white/15 bg-black/75 p-3 backdrop-blur-md sm:left-6 sm:top-6">
              <img src={displayImage} alt={pose.title} className="h-14 w-14 rounded-xl border border-white/12 object-cover" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-sand)]">Mirror this pose:</p>
                <p className="text-sm font-black text-white">{pose.title}</p>
                <p className="text-xs text-white/70 max-w-[200px] sm:max-w-[300px] truncate">{pose.instruction}</p>
              </div>
            </div>

            {cameraReady && (
              <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={captureLiveFrame}
                  className="group relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-md transition hover:scale-105 active:scale-95"
                  aria-label="Snap live selfie"
                >
                  <span className="h-14 w-14 rounded-full bg-[var(--gradient-ember-warm)] shadow-[var(--shadow-ember)] transition group-hover:scale-105" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleRetry}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition hover:bg-black/80 sm:right-6 sm:top-6"
              aria-label="Close camera"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          {cameraError && (
            <div className="rounded-[28px] border border-white/12 bg-white/[0.04] p-6 text-center">
              <p className="text-base font-black text-amber-200">{cameraError}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-4">
                <label className="magic-button inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--gradient-ember-warm)] px-6 text-sm font-black text-white shadow-[var(--shadow-ember)]">
                  <CameraIcon size={18} /> Launch Device Camera
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="user"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex h-[52px] items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-6 text-sm font-bold text-[var(--color-pearl)] transition hover:bg-white/[0.08]"
                >
                  Return to guide
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === "preview" && (
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[30px] border border-white/12 bg-black/40 p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-sand)] mb-3">Target Pose Guide</p>
                <div className="aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  <img src={displayImage} alt={pose.title} className="h-full w-full object-cover p-2" />
                </div>
                <p className="mt-3 text-xs font-black text-[var(--color-pearl)]">{pose.title}</p>
              </div>

              <div className="rounded-[30px] border border-[var(--color-teal-500)]/30 bg-[var(--color-teal-500)]/5 p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-teal-300)] mb-3">Your Live Selfie</p>
                <div className="aspect-square w-full overflow-hidden rounded-2xl border border-white/15 bg-black">
                  {capturedPreviewUrl ? (
                    <img src={capturedPreviewUrl} alt="Captured verification selfie" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-white/40">No photo</div>
                  )}
                </div>
                <p className="mt-3 text-xs font-black text-[var(--color-pearl)]">Ready for Gemini Check</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">Selfie Analysis</p>
            <h3 className="mt-2 text-2xl font-black text-[var(--color-pearl)]">Compare and verify</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--color-mist)]">
              Gemini will verify that your selfie shows one clear face with good lighting and matches the <span className="font-bold text-[var(--color-pearl)]">{pose.title}</span> pose.
            </p>

            <form action={handleSubmit} className="mt-7 space-y-5">
              <input type="hidden" name="pose_id" value={pose.id} />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={isPending}
                  className="magic-button inline-flex h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-[var(--gradient-ember-warm)] px-6 text-sm font-black text-white shadow-[var(--shadow-ember)] transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isPending ? "Analyzing live selfie…" : "Submit Selfie for Verification"}
                </button>

                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isPending}
                  className="inline-flex h-[56px] w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-6 text-sm font-bold text-[var(--color-pearl)] transition hover:bg-white/[0.08] sm:w-auto"
                >
                  Retake Selfie
                </button>
              </div>
              <p className="text-xs leading-5 text-[var(--color-mist)]">Only Freeborn&apos;s backend policy engine sets your public verified flag.</p>
            </form>
          </div>
        </div>
      )}

      {state ? (
        <div className={`mt-8 rounded-[34px] border p-6 sm:p-8 transition-all ${state.status === "approved" ? "border-[var(--color-teal-500)]/30 bg-[var(--color-teal-500)]/10 shadow-[0_20px_40px_-15px_rgba(20,184,166,0.2)]" : "border-red-400/30 bg-red-500/[0.08] shadow-[0_20px_40px_-15px_rgba(239,68,68,0.2)]"}`} role={state.status === "approved" ? "status" : "alert"}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${state.status === "approved" ? "bg-[var(--color-teal-500)]/20 text-[var(--color-teal-300)]" : "bg-red-400/20 text-red-200"}`}>
                {state.status === "approved" ? "✓ Verification Successful" : "! Verification Needs Refresh"}
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-black text-[var(--color-pearl)]">
                {state.status === "approved" ? "Trust badge activated." : "Let’s try that again with a fresh pose."}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-mist)]">
                {state.summary ?? state.error ?? "Please check the notes below, then try again with clear front lighting."}
              </p>
            </div>

            {state.status !== "approved" && (
              <button
                type="button"
                onClick={handleRetry}
                className="magic-button inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--gradient-ember-warm)] px-6 text-xs font-black uppercase tracking-widest text-white shadow-[var(--shadow-ember)] transition hover:-translate-y-0.5"
              >
                Retry with Fresh Pose
              </button>
            )}
          </div>

          {state.feedback?.length ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-sand)] mb-3">AI &amp; Backend Observations</p>
              <ul className="space-y-2.5 text-sm leading-6 text-[var(--color-mist)]">
                {state.feedback.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1 text-[var(--color-gold-300)] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CheckRow label="Single face visible" value={checks.face_count_ok ?? checks.face_visible} />
            <CheckRow label="Eyes clearly visible" value={checks.eyes_visible} />
            <CheckRow label="Lighting &amp; Quality" value={checks.lighting_ok ?? checks.quality_ok} />
            <CheckRow label="Pose &amp; Gesture Match" value={checks.pose_match_ok ?? checks.gesture_ok} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function StatusPanel({ state, localState }: { state: VerificationSurfaceState; localState: { ok: boolean; status?: string; error?: string } | null }) {
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
  isOnboarding,
}: {
  profile: UserProfileRow;
  photos: ProfilePhoto[];
  initialState: VerificationSurfaceState;
  isOnboarding?: boolean;
}) {
  const [state, action] = useActionState(requestVerification, null);
  const effectiveState: VerificationSurfaceState = profile.is_verified ? "approved" : state?.ok && state.status === "sent" ? "pending" : initialState;
  const copy = statusCopy(effectiveState);
  const cover = primaryPhoto(photos);
  const photoUrl = publicPhotoUrl(cover?.storage_path);
  const approved = effectiveState === "approved";

  if (isOnboarding) {
    return (
      <div className="w-full space-y-8">
        <SelfieGuidance profile={profile} approved={approved} isOnboarding={true} />
      </div>
    );
  }

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
