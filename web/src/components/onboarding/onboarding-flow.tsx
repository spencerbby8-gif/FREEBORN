"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  dealBreakerOptions,
  detectUnsafeContactDetails,
  explainUnsafeContactDetails,
  getUnsafeContactDetailGuidance,
  discoveryPreferencesSchema,
  genderOptions,
  interestOptions,
  lifestyleOptions,
  onboardingBioSchema,
  onboardingFieldHints,
  onboardingInterestsSchema,
  onboardingLifestyleSchema,
  onboardingLocationSchema,
  onboardingPremiumIdentitySchema,
  onboardingRelationshipGoalsSchema,
  onboardingValuesSchema,
  premiumOnboardingStepMeta,
  premiumOnboardingStepOrder,
  relationshipGoalOptions,
  valueOptions,
  type PremiumOnboardingStep,
  type ProfilePhoto,
} from "@freeborn/shared";
import { uploadProfilePhoto, deleteProfilePhoto, reorderPhotos, setPrimaryPhoto } from "@/lib/photos/actions";
import {
  completePremiumOnboarding,
  savePremiumOnboardingStep,
  type OnboardingActionResponse,
} from "@/lib/onboarding/actions";
import { ArrowIcon, BadgeIcon, CheckIcon, LockIcon, PinIcon, ShieldIcon, SparkIcon, XIcon } from "@/components/icons";
import { ChipSelect } from "./chip-select";
import { DateOfBirthField } from "./date-of-birth-field";
import { OnboardingTextInput, OnboardingTextarea } from "./onboarding-field";
import { OnboardingProgress } from "./onboarding-progress";
import { OptionCardRow } from "./option-card-row";
import { SelectMenu } from "./select-menu";

type Draft = {
  display_name: string;
  birth_date: string;
  gender: string;
  city: string;
  region: string;
  country_code: string;
  location_source: "manual" | "gps";
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
  bio: string;
  relationship_goals: string[];
  values: string[];
  interests: string[];
  lifestyle_preferences: string[];
  deal_breakers: string[];
  occupation: string;
  education: string;
  age_min: number;
  age_max: number;
  distance_km: number;
  show_genders: string[];
  relationship_intents: string[];
  verified_only: boolean;
  photos_required: boolean;
  deal_breaker_strict: boolean;
};

type FieldErrors = Partial<Record<keyof Draft | "location_source", string>>;
type Notice = { tone: "success" | "error"; title: string; body: string };
type SaveState = "idle" | "saving" | "saved" | "blocked" | "error";
type QualityTone = "pass" | "warn" | "fail" | "pending";
type PhotoQualityCheck = { id: string; label: string; tone: QualityTone; body: string };
type PhotoQualityReport = { score: number; blocked: boolean; hash: string | null; checks: PhotoQualityCheck[] };

const steps = [...premiumOnboardingStepOrder];
const TOTAL_STEPS = steps.length;

const stepCopy: Record<PremiumOnboardingStep, { title: string; description: string; tip: string }> = {
  welcome: {
    title: "Welcome to a calmer way to build a profile.",
    description: "Freeborn works best when each screen has one purpose. We’ll shape your identity, location, intentions, lifestyle, values, interests, bio, photos, discovery boundaries, and trust status without rushing you.",
    tip: "Your work autosaves after each safe, valid step. Exact coordinates, email, full birth date, and account details are never shown publicly.",
  },
  identity: {
    title: "Start with who you are.",
    description: "Add your display name, private age gate, and gender so Freeborn can introduce you clearly and respectfully.",
    tip: "Your birth date confirms you are 18+ and becomes age only. It never appears as a full date on public surfaces.",
  },
  location: {
    title: "Choose how location should work.",
    description: "Enter your public city manually or allow GPS for better distance matching. If GPS is allowed, coordinates stay private and only your city is shown.",
    tip: "Exact coordinates live in a private location record used for distance and discovery. Public profiles show city and optional region only.",
  },
  relationship_intent: {
    title: "Name the kind of connection you want.",
    description: "Pick up to three intentions. This keeps the niche balanced, premium, and focused on real relationship direction.",
    tip: "Clarity is attractive. You can be serious without sounding rigid.",
  },
  lifestyle: {
    title: "Share your everyday rhythm.",
    description: "Choose lifestyle cues that reveal how you actually live: wellness habits, home rhythm, faith or philosophy, family direction, and pace.",
    tip: "Lifestyle tags are compatibility signals, not a purity test. Choose what genuinely shapes daily life.",
  },
  values: {
    title: "Choose your strongest values.",
    description: "Select the values that matter most for compatibility while keeping the tone warm and grounded.",
    tip: "Balanced profiles invite conversation. Values should help someone understand you, not feel cross-examined.",
  },
  interests: {
    title: "Add conversation starters.",
    description: "Choose interests people can respond to with something specific — from natural health to music, food, movement, and culture.",
    tip: "Specific interests make first messages easier and help your profile feel like a person, not a checklist.",
  },
  bio: {
    title: "Write the first impression in your own voice.",
    description: "Keep it short, human, and grounded. Safety checks block contact details before anything is saved.",
    tip: "Do not include phone numbers, addresses, emails, social handles, URLs, QR codes, or exact coordinates. Share those only when trust is earned.",
  },
  photos: {
    title: "Add photos that feel recognizable and real.",
    description: "Upload a recent image, crop it for the profile card, reorder your gallery, and select the cover photo.",
    tip: "Best quality: clear face, natural light, no heavy filters, no text overlays, no QR codes, and no contact information in the image.",
  },
  discovery_preferences: {
    title: "Set your discovery boundaries.",
    description: "Tune who appears, practical age and distance ranges, verification filters, and deal-breaker strictness before entering discovery.",
    tip: "Distance uses your private coordinates when available. Other members never see them.",
  },
  verification: {
    title: "Understand your trust status.",
    description: "Verification is a real signal only when earned. Freeborn never implies that an unverified profile is verified.",
    tip: "Your profile can still be active while verification is pending. The public badge appears only after verification is true.",
  },
  finish: {
    title: "Your Freeborn profile is ready to enter the room.",
    description: "Review the foundation you built, then enter the app. You can refine your story and settings anytime.",
    tip: "A thoughtful profile is never frozen. Keep photos current, bio specific, and boundaries honest.",
  },
};

function publicPhotoUrl(path: string) {
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function Spinner() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="spin" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function StepIcon({ step }: { step: PremiumOnboardingStep }) {
  const common = "text-[var(--color-gold-300)]";
  if (step === "location") return <PinIcon size={20} className={common} />;
  if (step === "verification") return <BadgeIcon size={20} className={common} />;
  if (step === "finish") return <CheckIcon size={20} className={common} />;
  if (step === "welcome") return <SparkIcon size={20} className={common} />;
  return <ShieldIcon size={20} className={common} />;
}

function mapIssueLabels(value: string) {
  return detectUnsafeContactDetails(value).map((issue) => issue.type.replace(/_/g, " "));
}

function SafetyPanel({ values }: { values: string[] }) {
  const issues = values.flatMap((value) => detectUnsafeContactDetails(value));
  if (!issues.length) return null;
  const unique = issues.filter((issue, index) => issues.findIndex((item) => item.type === issue.type) === index);
  return (
    <div className="animate-scale-in rounded-[28px] border border-red-400/20 bg-red-500/[0.06] p-5 shadow-[0_20px_50px_-30px_rgba(255,107,122,0.5)]">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-400/10 text-red-200">
          <ShieldIcon size={20} />
        </div>
        <div>
          <p className="text-[15px] font-black text-red-100">Protected before it goes public</p>
          <p className="mt-1 text-sm leading-6 text-red-100/75">{explainUnsafeContactDetails(unique)}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {unique.slice(0, 4).map((issue) => {
          const guidance = getUnsafeContactDetailGuidance(issue);
          return (
            <div key={issue.type} className="rounded-2xl border border-red-100/10 bg-black/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-100/80">{guidance.label}</p>
              <p className="mt-2 text-xs leading-5 text-red-100/70">{guidance.why}</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-[var(--color-pearl)]">Try this: {guidance.rewrite}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function qualityToneClass(tone: QualityTone) {
  if (tone === "pass") return "border-[var(--color-teal-500)]/20 bg-[var(--color-teal-500)]/8 text-[var(--color-teal-300)]";
  if (tone === "warn") return "border-[var(--color-gold-500)]/25 bg-[var(--color-gold-500)]/8 text-[var(--color-gold-300)]";
  if (tone === "fail") return "border-red-400/25 bg-red-500/[0.07] text-red-100";
  return "border-white/10 bg-white/[0.03] text-[var(--color-mist)]";
}

async function cropImageToFile(file: File, crop: { x: number; y: number; zoom: number }): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const targetW = 1080;
    const targetH = 1350;
    const targetAspect = targetW / targetH;
    let sourceW = img.naturalWidth / crop.zoom;
    let sourceH = sourceW / targetAspect;
    if (sourceH > img.naturalHeight / crop.zoom) {
      sourceH = img.naturalHeight / crop.zoom;
      sourceW = sourceH * targetAspect;
    }
    const maxX = Math.max(0, img.naturalWidth - sourceW);
    const maxY = Math.max(0, img.naturalHeight - sourceH);
    const sx = maxX * (crop.x / 100);
    const sy = maxY * (crop.y / 100);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable.");
    ctx.drawImage(img, sx, sy, sourceW, sourceH, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("Could not prepare crop."))), "image/jpeg", 0.9);
    });
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "-freeborn.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function hammingDistance(a: string, b: string) {
  let distance = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) if (a[i] !== b[i]) distance += 1;
  return distance + Math.abs(a.length - b.length);
}

async function analyzeImageFile(file: File, existingHashes: string[]): Promise<PhotoQualityReport> {
  const url = URL.createObjectURL(file);
  const checks: PhotoQualityCheck[] = [];
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    checks.push(
      shortSide < 640 || longSide < 900
        ? { id: "resolution", label: "Resolution", tone: "fail", body: "This image is too small for a premium profile card. Choose a clearer, larger photo." }
        : shortSide < 900 || longSide < 1200
          ? { id: "resolution", label: "Resolution", tone: "warn", body: "Usable, but a larger photo will look sharper in discovery." }
          : { id: "resolution", label: "Resolution", tone: "pass", body: `${width} × ${height}px gives the crop room to breathe.` },
    );

    const sample = document.createElement("canvas");
    sample.width = 64;
    sample.height = 64;
    const ctx = sample.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas unavailable.");
    ctx.drawImage(img, 0, 0, sample.width, sample.height);
    const data = ctx.getImageData(0, 0, sample.width, sample.height).data;
    const lumas: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      lumas.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
    }
    const avg = lumas.reduce((sum, value) => sum + value, 0) / lumas.length;
    checks.push(
      avg < 45
        ? { id: "brightness", label: "Brightness", tone: "fail", body: "This photo is very dark. Pick one with more light so people can recognize you." }
        : avg < 70
          ? { id: "brightness", label: "Brightness", tone: "warn", body: "A brighter photo would feel warmer and more trustworthy." }
          : { id: "brightness", label: "Brightness", tone: "pass", body: "Lighting looks clear enough for a first impression." },
    );

    let edgeEnergy = 0;
    for (let y = 1; y < 63; y += 1) {
      for (let x = 1; x < 63; x += 1) {
        const center = lumas[y * 64 + x] * 4;
        const neighbors = lumas[y * 64 + x - 1] + lumas[y * 64 + x + 1] + lumas[(y - 1) * 64 + x] + lumas[(y + 1) * 64 + x];
        edgeEnergy += Math.abs(center - neighbors);
      }
    }
    const blurScore = edgeEnergy / (62 * 62);
    checks.push(
      blurScore < 14
        ? { id: "sharpness", label: "Sharpness", tone: "fail", body: "This looks blurry. Use a sharper photo with a clear face." }
        : blurScore < 24
          ? { id: "sharpness", label: "Sharpness", tone: "warn", body: "Slightly soft. It may still work, but a sharper image will perform better." }
          : { id: "sharpness", label: "Sharpness", tone: "pass", body: "Sharpness looks strong enough for discovery." },
    );

    const sorted = [...lumas].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? avg;
    const hash = lumas.map((value) => (value >= median ? "1" : "0")).join("");
    const duplicate = existingHashes.some((existing) => hammingDistance(existing, hash) <= 7);
    checks.push(
      duplicate
        ? { id: "duplicate", label: "Duplicate", tone: "fail", body: "This looks nearly identical to a photo already selected in this onboarding session." }
        : { id: "duplicate", label: "Duplicate", tone: "pass", body: "No duplicate detected in this session." },
    );

    const maybeWindow = window as typeof window & {
      FaceDetector?: new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => { detect: (source: CanvasImageSource) => Promise<Array<unknown>> };
    };
    if (maybeWindow.FaceDetector) {
      try {
        const detector = new maybeWindow.FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
        const faces = await detector.detect(img);
        checks.push(
          faces.length > 1
            ? { id: "faces", label: "Faces", tone: "fail", body: "Multiple faces detected. Choose a solo cover photo so people know who they are meeting." }
            : faces.length === 1
              ? { id: "faces", label: "Faces", tone: "pass", body: "One face detected — ideal for a cover photo." }
              : { id: "faces", label: "Faces", tone: "warn", body: "No face was detected. Make sure your cover photo is recognizable." },
        );
      } catch {
        checks.push({ id: "faces", label: "Faces", tone: "pending", body: "Face check was not available in this browser. Use a clear solo photo." });
      }
    } else {
      checks.push({ id: "faces", label: "Faces", tone: "pending", body: "Face check is browser-dependent. Use a clear solo photo for your cover." });
    }

    const score = Math.max(20, Math.round((checks.filter((check) => check.tone === "pass").length / checks.length) * 100));
    return { checks, score, hash, blocked: checks.some((check) => check.tone === "fail") };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function buildFormData(step: PremiumOnboardingStep, draft: Draft, nextStep: PremiumOnboardingStep, advance: boolean) {
  const fd = new FormData();
  fd.set("step", step);
  fd.set("next_step", nextStep);
  fd.set("advance", String(advance));

  if (step === "identity") {
    fd.set("display_name", draft.display_name);
    fd.set("birth_date", draft.birth_date);
    fd.set("gender", draft.gender);
  }
  if (step === "location") {
    fd.set("city", draft.city);
    fd.set("region", draft.region);
    fd.set("country_code", draft.country_code);
    fd.set("location_source", draft.location_source);
    if (draft.latitude != null) fd.set("latitude", String(draft.latitude));
    if (draft.longitude != null) fd.set("longitude", String(draft.longitude));
    if (draft.accuracy_m != null) fd.set("accuracy_m", String(draft.accuracy_m));
  }
  if (step === "relationship_intent") {
    draft.relationship_goals.forEach((goal) => fd.append("relationship_goals", goal));
  }
  if (step === "lifestyle") {
    draft.lifestyle_preferences.forEach((item) => fd.append("lifestyle_preferences", item));
  }
  if (step === "values") {
    draft.values.forEach((item) => fd.append("values", item));
  }
  if (step === "interests") {
    draft.interests.forEach((item) => fd.append("interests", item));
  }
  if (step === "bio") {
    fd.set("bio", draft.bio);
    fd.set("occupation", draft.occupation);
    fd.set("education", draft.education);
    draft.deal_breakers.forEach((item) => fd.append("deal_breakers", item));
  }
  if (step === "discovery_preferences") {
    fd.set("age_min", String(draft.age_min));
    fd.set("age_max", String(draft.age_max));
    fd.set("distance_km", String(draft.distance_km));
    fd.set("verified_only", String(draft.verified_only));
    fd.set("photos_required", String(draft.photos_required));
    fd.set("deal_breaker_strict", String(draft.deal_breaker_strict));
    draft.show_genders.forEach((item) => fd.append("show_genders", item));
    draft.relationship_intents.forEach((item) => fd.append("relationship_intents", item));
  }
  return fd;
}

function validateStep(step: PremiumOnboardingStep, draft: Draft): FieldErrors | null {
  const result = (() => {
    if (step === "identity") return onboardingPremiumIdentitySchema.safeParse({ display_name: draft.display_name, birth_date: draft.birth_date, gender: draft.gender });
    if (step === "location") return onboardingLocationSchema.safeParse({ city: draft.city, region: draft.region, country_code: draft.country_code, location_source: draft.location_source, latitude: draft.latitude, longitude: draft.longitude, accuracy_m: draft.accuracy_m });
    if (step === "relationship_intent") return onboardingRelationshipGoalsSchema.safeParse(draft.relationship_goals);
    if (step === "lifestyle") return onboardingLifestyleSchema.safeParse(draft.lifestyle_preferences);
    if (step === "values") return onboardingValuesSchema.safeParse(draft.values);
    if (step === "interests") return onboardingInterestsSchema.safeParse(draft.interests);
    if (step === "bio") return onboardingBioSchema.safeParse(draft.bio);
    if (step === "discovery_preferences") return discoveryPreferencesSchema.safeParse({
      age_min: draft.age_min,
      age_max: draft.age_max,
      distance_km: draft.distance_km,
      show_genders: draft.show_genders,
      relationship_intents: draft.relationship_intents,
      verified_only: draft.verified_only,
      photos_required: draft.photos_required,
      deal_breaker_strict: draft.deal_breaker_strict,
    });
    return { success: true } as const;
  })();

  if (result.success) return null;
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const rawKey = issue.path[0];
    const key = typeof rawKey === "string" ? rawKey : step === "relationship_intent" ? "relationship_goals" : step;
    if (!(key in errors)) errors[key as keyof FieldErrors] = issue.message;
  }
  if (step === "lifestyle" && !errors.lifestyle_preferences) errors.lifestyle_preferences = result.error.issues[0]?.message;
  if (step === "values" && !errors.values) errors.values = result.error.issues[0]?.message;
  if (step === "interests" && !errors.interests) errors.interests = result.error.issues[0]?.message;
  return errors;
}

function TogglePill({ active, onClick, label, body }: { active: boolean; onClick: () => void; label: string; body: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-3xl border p-5 text-left transition-all active:scale-[0.98] ${
        active
          ? "border-[var(--color-gold-500)] bg-[var(--color-gold-500)]/10 text-[var(--color-pearl)]"
          : "border-white/10 bg-white/[0.03] text-[var(--color-mist)] hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      <span className="flex items-center justify-between gap-4">
        <span className="text-[15px] font-black text-[var(--color-pearl)]">{label}</span>
        <span className={`h-6 w-11 rounded-full p-0.5 transition ${active ? "bg-[var(--color-gold-500)]" : "bg-white/10"}`}>
          <span className={`block h-5 w-5 rounded-full bg-white transition ${active ? "translate-x-5" : ""}`} />
        </span>
      </span>
      <span className="mt-2 block text-[13px] leading-5 text-[var(--color-mist)]">{body}</span>
    </button>
  );
}

function PhotoStep({ photos, setPhotos }: { photos: ProfilePhoto[]; setPhotos: (photos: ProfilePhoto[]) => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 50, y: 50, zoom: 1 });
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photoNotice, setPhotoNotice] = useState<Notice | null>(null);
  const [qualityReport, setQualityReport] = useState<PhotoQualityReport | null>(null);
  const [sessionHashes, setSessionHashes] = useState<string[]>([]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const chooseFile = async (next: File | null) => {
    setFile(next);
    setProgress(0);
    setPhotoNotice(null);
    setQualityReport(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
    if (!next) return;
    setAnalyzing(true);
    try {
      const report = await analyzeImageFile(next, sessionHashes);
      setQualityReport(report);
      if (report.blocked) {
        setPhotoNotice({
          tone: "error",
          title: "Choose a stronger photo",
          body: "We found a quality issue that would make this feel less trustworthy in discovery. Review the notes below and pick a clearer solo image.",
        });
      } else if (report.checks.some((check) => check.tone === "warn" || check.tone === "pending")) {
        setPhotoNotice({
          tone: "success",
          title: "Photo can work",
          body: "A few quality notes are worth reviewing before you upload, but nothing blocks this image.",
        });
      }
    } catch {
      setPhotoNotice({ tone: "error", title: "Could not review photo", body: "Try a different JPG, PNG, or WebP image." });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (qualityReport?.blocked) {
      setPhotoNotice({ tone: "error", title: "Photo needs a fix", body: "Choose a clearer solo photo before uploading. The quality checks explain what to change." });
      return;
    }
    setUploading(true);
    setPhotoNotice(null);
    try {
      setProgress(18);
      const cropped = await cropImageToFile(file, crop);
      setProgress(48);
      const fd = new FormData();
      fd.set("file", cropped);
      setProgress(72);
      const result = await uploadProfilePhoto(fd);
      if (!result.ok) {
        setPhotoNotice({ tone: "error", title: "Photo did not upload", body: result.error ?? "Try a different JPG, PNG, or WebP image." });
        setProgress(0);
        return;
      }
      setProgress(100);
      if (result.photo) setPhotos([...photos, result.photo as ProfilePhoto]);
      if (qualityReport?.hash) setSessionHashes((current) => [...current, qualityReport.hash as string]);
      setPhotoNotice({ tone: "success", title: "Photo added", body: photos.length === 0 ? "Your first photo is used as the cover." : "You can reorder it or make it the cover." });
      setFile(null);
      setQualityReport(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      router.refresh();
    } catch {
      setPhotoNotice({ tone: "error", title: "Photo did not upload", body: "We could not prepare that crop. Try a different image." });
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const movePhoto = async (index: number, direction: -1 | 1) => {
    const next = [...photos];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setPhotos(next.map((photo, position) => ({ ...photo, position })));
    const fd = new FormData();
    fd.set("order", JSON.stringify(next.map((photo) => photo.id)));
    await reorderPhotos(fd);
    router.refresh();
  };

  const makeCover = async (photo: ProfilePhoto) => {
    setPhotos(photos.map((item) => ({ ...item, is_primary: item.id === photo.id })));
    const fd = new FormData();
    fd.set("id", photo.id);
    await setPrimaryPhoto(fd);
    router.refresh();
  };

  const removePhoto = async (photo: ProfilePhoto) => {
    setPhotos(photos.filter((item) => item.id !== photo.id));
    const fd = new FormData();
    fd.set("id", photo.id);
    await deleteProfilePhoto(fd);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.025] p-4 sm:p-5">
          <div className="relative mx-auto aspect-[4/5] max-h-[520px] overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02]">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Crop preview"
                className="h-full w-full object-cover"
                style={{ objectPosition: `${crop.x}% ${crop.y}%`, transform: `scale(${crop.zoom})` }}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-gold-500)]/10 text-3xl text-[var(--color-gold-300)]">＋</div>
                <p className="mt-5 text-lg font-black text-[var(--color-pearl)]">Choose a profile photo</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-mist)]">Crop happens before upload so the image feels intentional in discovery.</p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4 rounded-[32px] border border-white/10 bg-white/[0.025] p-5">
          <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-black uppercase tracking-widest text-[var(--color-pearl)] transition hover:bg-white/[0.08]">
            {file ? "Change photo" : "Upload photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0] ?? null)} />
          </label>

          {file ? (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-sand)]">Crop horizontal</label>
              <input type="range" min={0} max={100} value={crop.x} onChange={(event) => setCrop((c) => ({ ...c, x: Number(event.target.value) }))} className="w-full accent-[var(--color-gold-500)]" />
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-sand)]">Crop vertical</label>
              <input type="range" min={0} max={100} value={crop.y} onChange={(event) => setCrop((c) => ({ ...c, y: Number(event.target.value) }))} className="w-full accent-[var(--color-gold-500)]" />
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-sand)]">Zoom</label>
              <input type="range" min={1} max={2.4} step={0.05} value={crop.zoom} onChange={(event) => setCrop((c) => ({ ...c, zoom: Number(event.target.value) }))} className="w-full accent-[var(--color-gold-500)]" />
              <button type="button" disabled={uploading || analyzing || Boolean(qualityReport?.blocked)} onClick={handleUpload} className="magic-button flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-pearl)] text-sm font-black text-[var(--color-ink)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
                {uploading || analyzing ? <Spinner /> : null}
                {analyzing ? "Checking quality…" : uploading ? "Uploading…" : qualityReport?.blocked ? "Choose a stronger photo" : "Save cropped photo"}
              </button>
              {uploading || progress > 0 ? (
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[var(--gradient-ember)] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              ) : null}
            </div>
          ) : null}

          {qualityReport ? (
            <div className="animate-scale-in rounded-[24px] border border-white/10 bg-black/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--color-sand)]">Media quality</p>
                <span className={`rounded-full px-3 py-1 text-[11px] font-black ${qualityReport.blocked ? "bg-red-400/10 text-red-100" : "bg-[var(--color-teal-500)]/10 text-[var(--color-teal-300)]"}`}>
                  {qualityReport.score}%
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {qualityReport.checks.map((check) => (
                  <div key={check.id} className={`rounded-2xl border p-3 ${qualityToneClass(check.tone)}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px] font-black uppercase tracking-[0.16em]">{check.label}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em]">{check.tone === "pending" ? "Guide" : check.tone}</p>
                    </div>
                    <p className="mt-1 text-xs leading-5 opacity-80">{check.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : analyzing ? (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm font-bold text-[var(--color-mist)]">
              Reviewing blur, brightness, duplicate risk, face count, and resolution…
            </div>
          ) : null}

          <div className="rounded-2xl border border-[var(--color-gold-500)]/15 bg-[var(--color-gold-500)]/5 p-4 text-sm leading-6 text-[var(--color-mist)]">
            <p className="font-bold text-[var(--color-pearl)]">Quality guidance</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5">
              <li>Recent, recognizable, and well lit.</li>
              <li>No contact details, URLs, QR codes, or text overlays.</li>
              <li>Use a clear cover; add variety after.</li>
            </ul>
          </div>
        </div>
      </div>

      {photoNotice ? (
        <NoticePanel notice={photoNotice} />
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => {
          const url = publicPhotoUrl(photo.storage_path);
          return (
            <div key={photo.id} className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.025]">
              <div className="relative aspect-[4/5] bg-white/5">
                {url ? <img src={url} alt={photo.is_primary ? "Cover photo" : `Profile photo ${index + 1}`} className="h-full w-full object-cover" /> : null}
                <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-black/50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur">#{index + 1}</span>
                  {photo.is_primary ? <span className="rounded-full bg-[var(--color-gold-500)] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[var(--color-ink)]">Cover</span> : null}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-2">
                <button type="button" onClick={() => makeCover(photo)} disabled={photo.is_primary} className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-pearl)] disabled:opacity-40">Cover</button>
                <button type="button" onClick={() => removePhoto(photo)} className="rounded-xl border border-red-400/20 bg-red-400/10 px-2 py-2 text-[10px] font-black uppercase tracking-widest text-red-100">Remove</button>
                <button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0} className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-mist)] disabled:opacity-30">Earlier</button>
                <button type="button" onClick={() => movePhoto(index, 1)} disabled={index === photos.length - 1} className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-mist)] disabled:opacity-30">Later</button>
              </div>
            </div>
          );
        })}
        {Array.from({ length: Math.max(0, 6 - photos.length) }).map((_, index) => (
          <div key={index} className="flex aspect-[4/5] items-center justify-center rounded-[26px] border border-dashed border-white/10 bg-white/[0.015] text-center text-[10px] font-black uppercase tracking-widest text-[var(--color-ash)]">
            Open slot
          </div>
        ))}
      </div>
    </div>
  );
}

function NoticePanel({ notice }: { notice: Notice }) {
  return (
    <div
      role={notice.tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-4 rounded-3xl border p-5 ${
        notice.tone === "success"
          ? "border-[rgba(109,211,176,0.2)] bg-[rgba(109,211,176,0.05)]"
          : "border-[rgba(255,107,122,0.2)] bg-[rgba(255,107,122,0.05)]"
      }`}
    >
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${notice.tone === "success" ? "bg-[rgba(109,211,176,0.15)] text-[var(--color-success)]" : "bg-[rgba(255,107,122,0.15)] text-[var(--color-danger)]"}`}>
        {notice.tone === "success" ? <CheckIcon size={18} /> : <span className="text-base font-bold">!</span>}
      </span>
      <div>
        <p className="text-[15px] font-black text-[var(--color-pearl)]">{notice.title}</p>
        <p className="mt-1 text-[14px] font-medium leading-relaxed text-[var(--color-mist)]">{notice.body}</p>
      </div>
    </div>
  );
}

function CompletionRail({
  items,
  score,
  saveLabel,
  saveState,
  stepIndex,
}: {
  items: Array<{ label: string; done: boolean }>;
  score: number;
  saveLabel: string;
  saveState: SaveState;
  stepIndex: number;
}) {
  const remaining = items.filter((item) => !item.done).slice(0, 3);
  return (
    <aside className="space-y-4 lg:sticky lg:top-6">
      <div className="rounded-[34px] border border-white/10 bg-[rgba(9,16,28,0.72)] p-5 shadow-[var(--shadow-raised)] backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-ash)]">Profile readiness</p>
            <p className="mt-2 text-3xl font-black text-[var(--color-pearl)]">{score}%</p>
          </div>
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
            <div className="absolute inset-1 rounded-full" style={{ background: `conic-gradient(var(--color-gold-500) ${score}%, rgba(255,255,255,0.08) 0)` }} />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-night)] text-xs font-black text-[var(--color-pearl)]">{items.filter((item) => item.done).length}/{items.length}</div>
          </div>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-[var(--gradient-ember)] transition-all duration-700" style={{ width: `${score}%` }} />
        </div>
        <div className="mt-5 space-y-2.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-3.5 py-3">
              <span className="text-xs font-bold text-[var(--color-mist)]">{item.label}</span>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${item.done ? "bg-[var(--color-teal-500)]/15 text-[var(--color-teal-300)]" : "bg-white/5 text-[var(--color-ash)]"}`}>
                {item.done ? <CheckIcon size={13} strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--color-sand)]">
          <span className={`h-2 w-2 rounded-full ${saveState === "blocked" || saveState === "error" ? "bg-[var(--color-danger)]" : saveState === "saving" ? "bg-[var(--color-gold-500)]" : "bg-[var(--color-teal-500)]"}`} />
          {saveLabel}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--color-mist)]">
          {remaining.length ? `Still ahead: ${remaining.map((item) => item.label.toLowerCase()).join(", ")}.` : "Everything essential is in place. Finish when you are ready."}
        </p>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-ash)]">Journey step {stepIndex + 1} of {TOTAL_STEPS}</p>
      </div>
    </aside>
  );
}

export function OnboardingFlow({
  initialDraft,
  initialPhotos,
  initialStepIndex,
  isVerified,
}: {
  initialDraft: Draft;
  initialPhotos: ProfilePhoto[];
  initialStepIndex: number;
  maxStepIndex: number;
  isVerified: boolean;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(Math.min(Math.max(initialStepIndex, 0), TOTAL_STEPS - 1));
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [photos, setPhotos] = useState<ProfilePhoto[]>(initialPhotos);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [pending, setPending] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [geoState, setGeoState] = useState<"idle" | "locating" | "granted" | "denied">("idle");
  const [gpsPrimerVisible, setGpsPrimerVisible] = useState(false);
  const dirtyRef = useRef(false);

  const step = steps[stepIndex];
  const nextStep = steps[Math.min(stepIndex + 1, TOTAL_STEPS - 1)];
  const copy = stepCopy[step];

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    dirtyRef.current = true;
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaveState("idle");
  };

  const unsafeBioIssues = useMemo(() => mapIssueLabels(draft.bio), [draft.bio]);
  const unsafeLocationIssues = useMemo(() => [...mapIssueLabels(draft.city), ...mapIssueLabels(draft.region)].filter(Boolean), [draft.city, draft.region]);
  const unsafeIdentityIssues = useMemo(() => mapIssueLabels(draft.display_name), [draft.display_name]);

  useEffect(() => {
    if (!dirtyRef.current) return;
    if (["welcome", "photos", "verification", "finish"].includes(step)) return;
    const stepErrors = validateStep(step, draft);
    if (stepErrors) return;
    const timer = window.setTimeout(async () => {
      setSaveState("saving");
      try {
        const response = await savePremiumOnboardingStep(null, buildFormData(step, draft, step, false));
        if (!response.ok) {
          setSaveState(response.fieldErrors ? "blocked" : "error");
          if (response.fieldErrors) setErrors(response.fieldErrors as FieldErrors);
          return;
        }
        dirtyRef.current = false;
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [draft, step]);

  const requestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("denied");
      setErrors((current) => ({ ...current, location_source: "Location is not available in this browser. Use manual city entry." }));
      return;
    }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        update("location_source", "gps");
        update("latitude", position.coords.latitude);
        update("longitude", position.coords.longitude);
        update("accuracy_m", position.coords.accuracy ?? null);
        setGpsPrimerVisible(false);
        setGeoState("granted");
      },
      () => {
        update("location_source", "manual");
        setGeoState("denied");
        setErrors((current) => ({ ...current, location_source: "Location permission was not granted. Manual city entry still works." }));
      },
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 12000 },
    );
  };

  const goToStep = (index: number) => {
    setErrors({});
    setNotice(null);
    setStepIndex(Math.max(0, Math.min(index, TOTAL_STEPS - 1)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => goToStep(stepIndex - 1);

  const continueFromStep = async (event?: FormEvent) => {
    event?.preventDefault();
    setNotice(null);

    const stepErrors = validateStep(step, draft);
    if (stepErrors) {
      setErrors(stepErrors);
      setSaveState("blocked");
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setPending(true);
    setSaveState("saving");
    try {
      const response: OnboardingActionResponse = await savePremiumOnboardingStep(null, buildFormData(step, draft, nextStep, true));
      if (!response.ok) {
        if (response.fieldErrors) setErrors(response.fieldErrors as FieldErrors);
        setNotice({ tone: "error", title: "We hit a snag", body: response.error ?? "Please review the highlighted fields and try again." });
        setSaveState(response.fieldErrors ? "blocked" : "error");
        return;
      }
      dirtyRef.current = false;
      setSaveState("saved");
      const nextIndex = Math.min(stepIndex + 1, TOTAL_STEPS - 1);
      goToStep(nextIndex);
    } catch {
      setNotice({ tone: "error", title: "We hit a snag", body: "Something went wrong saving your progress. Please try again." });
      setSaveState("error");
    } finally {
      setPending(false);
    }
  };

  const handleFinish = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setNotice(null);
    try {
      const response = await completePremiumOnboarding();
      if (!response.ok) {
        if (response.fieldErrors) setErrors(response.fieldErrors as FieldErrors);
        setNotice({ tone: "error", title: "Your profile needs a little more", body: response.error ?? "Review the highlighted steps and try again." });
        return;
      }
      router.push("/app?status=onboarded");
      router.refresh();
    } catch {
      setNotice({ tone: "error", title: "We couldn't finish that", body: "Something went wrong. Please try again in a moment." });
    } finally {
      setPending(false);
    }
  };

  const saveLabel =
    saveState === "saving" ? "Saving…" : saveState === "saved" ? "Autosaved" : saveState === "blocked" ? "Needs review" : saveState === "error" ? "Save paused" : "Autosave ready";

  const completionItems = [
    { label: "Identity", done: Boolean(draft.display_name && draft.birth_date && draft.gender) },
    { label: "Public city", done: Boolean(draft.city) },
    { label: "Intent", done: draft.relationship_goals.length > 0 },
    { label: "Lifestyle", done: draft.lifestyle_preferences.length > 0 },
    { label: "Values", done: draft.values.length > 0 },
    { label: "Interests", done: draft.interests.length > 0 },
    { label: "Bio", done: draft.bio.length >= 20 && !unsafeBioIssues.length },
    { label: "Photos", done: photos.length > 0 },
  ];
  const completionScore = Math.round((completionItems.filter((item) => item.done).length / completionItems.length) * 100);

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-5 sm:space-y-6">
      <OnboardingProgress currentIndex={stepIndex} total={TOTAL_STEPS} />

      <div className="flex flex-col gap-3 rounded-[28px] border border-white/5 bg-white/[0.02] px-4 py-3 text-xs font-bold text-[var(--color-mist)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${saveState === "blocked" || saveState === "error" ? "bg-[var(--color-danger)]" : saveState === "saving" ? "bg-[var(--color-gold-500)]" : "bg-[var(--color-teal-500)]"}`} />
          {saveLabel}
        </div>
        <div className="flex items-center gap-2 text-[var(--color-ash)]">
          <LockIcon size={14} />
          Full birth date, exact location, and account details stay private.
        </div>
      </div>

      {notice ? <NoticePanel notice={notice} /> : null}

      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start xl:grid-cols-[320px_minmax(0,1fr)]">
        <CompletionRail items={completionItems} score={completionScore} saveLabel={saveLabel} saveState={saveState} stepIndex={stepIndex} />

        <div key={step} className="step-in min-w-0">
          <div className="surface magic-border min-h-[620px] rounded-[34px] p-5 shadow-[var(--shadow-card-lg)] sm:rounded-[44px] sm:p-8 lg:p-10">
          <div className="mb-7 flex items-start gap-4 sm:mb-9">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-gold-500)]/20 bg-[var(--color-gold-500)]/10">
              <StepIcon step={step} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-sand)]">{premiumOnboardingStepMeta[stepIndex]?.label}</p>
              <h1 className="mt-2 text-[clamp(2rem,7vw,3.25rem)] leading-[0.95] tracking-tight text-[var(--color-pearl)]" style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450" }}>
                {copy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--color-mist)] sm:text-[17px]">{copy.description}</p>
            </div>
          </div>

          <form onSubmit={step === "finish" ? handleFinish : continueFromStep} noValidate>
            <div className="space-y-7">
              {step === "welcome" ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ["Private essentials", "Birth date and exact coordinates stay out of public view."],
                    ["Safety checked", "Contact details are blocked from profile text before saving."],
                    ["Photo-first trust", "Upload, crop, reorder, and choose the cover inside onboarding."],
                  ].map(([title, body]) => (
                    <div key={title} className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
                      <CheckIcon size={18} className="text-[var(--color-gold-300)]" />
                      <p className="mt-4 text-base font-black text-[var(--color-pearl)]">{title}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">{body}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {step === "identity" ? (
                <>
                  {unsafeIdentityIssues.length ? <SafetyPanel values={[draft.display_name]} /> : null}
                  <OnboardingTextInput label="Display name" name="display_name" placeholder="How should Freeborn introduce you?" value={draft.display_name} error={errors.display_name} hint={onboardingFieldHints.display_name} autoComplete="nickname" onChange={(event) => update("display_name", event.target.value)} />
                  <DateOfBirthField value={draft.birth_date} error={errors.birth_date} hint={onboardingFieldHints.birth_date} onChange={(value) => update("birth_date", value)} />
                  <SelectMenu label="Gender" value={draft.gender} onChange={(value) => update("gender", value)} options={genderOptions.map((option) => ({ value: option.value, label: option.label }))} placeholder="Choose how you identify" error={errors.gender} hint={onboardingFieldHints.gender} />
                </>
              ) : null}

              {step === "location" ? (
                <>
                  {unsafeLocationIssues.length ? <SafetyPanel values={[draft.city, draft.region]} /> : null}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => { update("location_source", "manual"); setGpsPrimerVisible(false); }} className={`rounded-3xl border p-5 text-left transition ${draft.location_source === "manual" ? "border-[var(--color-gold-500)] bg-[var(--color-gold-500)]/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-base font-black text-[var(--color-pearl)]">Manual city entry</p>
                        <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--color-sand)]">Public city only</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">Type the city you want shown publicly. No coordinates are saved when manual mode is selected.</p>
                    </button>
                    <button type="button" onClick={() => setGpsPrimerVisible(true)} className={`rounded-3xl border p-5 text-left transition ${draft.location_source === "gps" ? "border-[var(--color-teal-500)] bg-[var(--color-teal-500)]/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-base font-black text-[var(--color-pearl)]">Use current location</p>
                        <span className="rounded-full bg-[var(--color-teal-500)]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--color-teal-300)]">Private GPS</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">We ask permission first, use coordinates for distance, and only show city, region, and country publicly.</p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-widest text-[var(--color-teal-300)]">{geoState === "locating" ? "Requesting permission…" : geoState === "granted" ? "Private coordinates ready" : geoState === "denied" ? "Permission not granted" : "See explanation"}</p>
                    </button>
                  </div>
                  {gpsPrimerVisible ? (
                    <div className="step-in rounded-[30px] border border-[var(--color-teal-500)]/20 bg-[var(--color-teal-500)]/[0.06] p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-teal-500)]/12 text-[var(--color-teal-300)]"><PinIcon size={20} /></div>
                        <div className="flex-1">
                          <p className="text-base font-black text-[var(--color-pearl)]">Before you allow GPS</p>
                          <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">Your browser will ask for permission. If you allow it, Freeborn saves latitude and longitude in a private owner-only location record for distance matching. Discovery and profiles still show only the city, region, and country fields below.</p>
                          <div className="mt-4 grid gap-2 sm:grid-cols-3">
                            {[
                              ["Private", "Coordinates are never rendered on public cards."],
                              ["Useful", "Distance filters become more accurate."],
                              ["Optional", "Manual city entry works if you decline."],
                            ].map(([label, body]) => (
                              <div key={label} className="rounded-2xl border border-white/8 bg-black/10 p-3">
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-teal-300)]">{label}</p>
                                <p className="mt-1 text-xs leading-5 text-[var(--color-mist)]">{body}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <button type="button" onClick={requestLocation} disabled={geoState === "locating"} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--color-pearl)] px-5 text-sm font-black text-[var(--color-ink)] transition hover:bg-white disabled:cursor-wait disabled:opacity-60">
                              {geoState === "locating" ? <Spinner /> : null}
                              {geoState === "locating" ? "Waiting for permission…" : "Allow current location"}
                            </button>
                            <button type="button" onClick={() => { update("location_source", "manual"); setGpsPrimerVisible(false); }} className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-[var(--color-pearl)] transition hover:bg-white/[0.08]">Use manual instead</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {draft.location_source === "gps" && draft.latitude != null && draft.longitude != null ? (
                    <div className="rounded-[24px] border border-[var(--color-teal-500)]/20 bg-[var(--color-teal-500)]/8 p-4 text-sm leading-6 text-[var(--color-mist)]">
                      <span className="font-black text-[var(--color-teal-300)]">GPS enabled privately.</span> Public display remains {draft.city || "your city"}{draft.region ? `, ${draft.region}` : ""}{draft.country_code ? `, ${draft.country_code}` : ""}. Exact coordinates are used only for distance.
                    </div>
                  ) : null}
                  {errors.location_source ? <p className="text-sm font-bold text-[var(--color-danger)]">{errors.location_source}</p> : null}
                  <OnboardingTextInput label="Public city" name="city" placeholder="Austin" value={draft.city} error={errors.city} hint="Only this city is shown publicly. Do not enter a street address." autoComplete="address-level2" onChange={(event) => update("city", event.target.value)} />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <OnboardingTextInput label="Region" name="region" placeholder="Texas" value={draft.region} error={errors.region} hint={onboardingFieldHints.region} optional autoComplete="address-level1" onChange={(event) => update("region", event.target.value)} />
                    <OnboardingTextInput label="Country code" name="country_code" placeholder="US" value={draft.country_code} error={errors.country_code} hint={onboardingFieldHints.country_code} optional autoComplete="country" maxLength={2} onChange={(event) => update("country_code", event.target.value.toUpperCase())} />
                  </div>
                </>
              ) : null}

              {step === "relationship_intent" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1"><span className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">Relationship intent</span><span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-ash)]">{draft.relationship_goals.length}/3</span></div>
                  <OptionCardRow options={relationshipGoalOptions.map((option) => ({ value: option.value, label: option.label, caption: option.caption }))} value={draft.relationship_goals} onChange={(next) => update("relationship_goals", next)} max={3} />
                  {errors.relationship_goals ? <p className="text-sm font-bold text-[var(--color-danger)]">{errors.relationship_goals}</p> : null}
                </div>
              ) : null}

              {step === "lifestyle" ? (
                <ChipSelect label="Lifestyle" options={lifestyleOptions} value={draft.lifestyle_preferences} max={12} error={errors.lifestyle_preferences} hint={onboardingFieldHints.lifestyle_preferences} onChange={(next) => update("lifestyle_preferences", next)} />
              ) : null}

              {step === "values" ? (
                <ChipSelect label="Values" options={valueOptions} value={draft.values} max={8} error={errors.values} hint="Choose your clearest compatibility signals. Keep it balanced and human." onChange={(next) => update("values", next)} />
              ) : null}

              {step === "interests" ? (
                <ChipSelect label="Interests" options={interestOptions} value={draft.interests} max={12} error={errors.interests} hint={onboardingFieldHints.interests} onChange={(next) => update("interests", next)} />
              ) : null}

              {step === "bio" ? (
                <>
                  {unsafeBioIssues.length ? <SafetyPanel values={[draft.bio, draft.occupation, draft.education]} /> : null}
                  <OnboardingTextarea label="Short bio" name="bio" placeholder="A grounded intro: what you value, how you spend a good Sunday, and what feels meaningful to you." value={draft.bio} error={errors.bio} hint={onboardingFieldHints.bio} rows={6} maxLength={500} counter={{ value: draft.bio.length, max: 500 }} onChange={(event) => update("bio", event.target.value.slice(0, 500))} />
                  <ChipSelect label="Deal breakers" options={dealBreakerOptions} value={draft.deal_breakers} max={12} optional error={errors.deal_breakers} hint={onboardingFieldHints.deal_breakers} onChange={(next) => update("deal_breakers", next)} />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <OnboardingTextInput label="Occupation" name="occupation" placeholder="What do you do?" value={draft.occupation} error={errors.occupation} hint={onboardingFieldHints.occupation} optional onChange={(event) => update("occupation", event.target.value)} />
                    <OnboardingTextInput label="Education" name="education" placeholder="Field, school, or meaningful learning" value={draft.education} error={errors.education} hint={onboardingFieldHints.education} optional onChange={(event) => update("education", event.target.value)} />
                  </div>
                </>
              ) : null}

              {step === "photos" ? <PhotoStep photos={photos} setPhotos={setPhotos} /> : null}

              {step === "discovery_preferences" ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <OnboardingTextInput label="Min age" type="number" min={18} max={80} value={draft.age_min} error={errors.age_min} onChange={(event) => update("age_min", Number(event.target.value))} />
                    <OnboardingTextInput label="Max age" type="number" min={18} max={99} value={draft.age_max} error={errors.age_max} onChange={(event) => update("age_max", Number(event.target.value))} />
                    <OnboardingTextInput label="Distance km" type="number" min={5} max={500} value={draft.distance_km} error={errors.distance_km} onChange={(event) => update("distance_km", Number(event.target.value))} />
                  </div>
                  <ChipSelect label="Who to show me" options={genderOptions.slice(0, 7).map((item) => item.label)} value={draft.show_genders.map((value) => genderOptions.find((g) => g.value === value)?.label ?? value)} error={errors.show_genders} onChange={(labels) => update("show_genders", labels.map((label) => genderOptions.find((g) => g.label === label)?.value ?? label))} />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1"><span className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-sand)]">Relationship intentions to show</span><span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-ash)]">{draft.relationship_intents.length}/3</span></div>
                    <OptionCardRow options={relationshipGoalOptions.map((option) => ({ value: option.value, label: option.label, caption: option.caption }))} value={draft.relationship_intents} onChange={(next) => update("relationship_intents", next)} max={3} />
                    {errors.relationship_intents ? <p className="text-sm font-bold text-[var(--color-danger)]">{errors.relationship_intents}</p> : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <TogglePill active={draft.verified_only} onClick={() => update("verified_only", !draft.verified_only)} label="Verified only" body="Only show profiles with real verification." />
                    <TogglePill active={draft.photos_required} onClick={() => update("photos_required", !draft.photos_required)} label="Photos required" body="Hide profiles without public photos." />
                    <TogglePill active={draft.deal_breaker_strict} onClick={() => update("deal_breaker_strict", !draft.deal_breaker_strict)} label="Strict boundaries" body="Respect selected deal breakers." />
                  </div>
                </div>
              ) : null}

              {step === "verification" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={`rounded-[30px] border p-6 ${isVerified ? "border-[var(--color-teal-500)]/30 bg-[var(--color-teal-500)]/10" : "border-[var(--color-gold-500)]/25 bg-[var(--color-gold-500)]/8"}`}>
                    <BadgeIcon size={28} className={isVerified ? "text-[var(--color-teal-300)]" : "text-[var(--color-gold-300)]"} />
                    <p className="mt-5 text-xl font-black text-[var(--color-pearl)]">{isVerified ? "Verified" : "Not verified yet"}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">{isVerified ? "Your profile may show a verified badge in discovery." : "No badge appears until verification is actually complete."}</p>
                  </div>
                  <div className="rounded-[30px] border border-white/10 bg-white/[0.025] p-6">
                    <LockIcon size={28} className="text-[var(--color-gold-300)]" />
                    <p className="mt-5 text-xl font-black text-[var(--color-pearl)]">Private by default</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">Email, full birth date, auth provider details, and exact coordinates stay out of discovery and profile previews.</p>
                  </div>
                </div>
              ) : null}

              {step === "finish" ? (
                <div className="space-y-6">
                  <div className="relative overflow-hidden rounded-[36px] border border-[var(--color-gold-500)]/20 bg-[radial-gradient(circle_at_20%_0%,rgba(217,167,82,0.20),transparent_38%),rgba(255,255,255,0.035)] p-7 text-center sm:p-10">
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--color-gold-500)]/15 blur-3xl" />
                    <div className="absolute -bottom-20 left-4 h-48 w-48 rounded-full bg-[var(--color-teal-500)]/10 blur-3xl" />
                    <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--gradient-ember)] text-white shadow-[var(--shadow-ember)]">
                      <CheckIcon size={42} strokeWidth={2.4} />
                    </div>
                    <p className="relative mt-6 text-xs font-black uppercase tracking-[0.28em] text-[var(--color-gold-300)]">Profile foundation complete</p>
                    <h2 className="relative mx-auto mt-3 max-w-xl text-[clamp(2.1rem,7vw,4rem)] leading-[0.92] tracking-tight text-[var(--color-pearl)]" style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 500" }}>
                      You’re ready to discover with intention.
                    </h2>
                    <p className="relative mx-auto mt-4 max-w-lg text-sm leading-7 text-[var(--color-mist)] sm:text-base">Your profile has the essentials people need to meet you well: identity, public city, intentions, values, interests, bio, photos, and boundaries.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {completionItems.map((item) => (
                      <div key={item.label} className={`rounded-2xl border p-4 ${item.done ? "border-[var(--color-teal-500)]/20 bg-[var(--color-teal-500)]/8" : "border-white/10 bg-white/[0.025]"}`}>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${item.done ? "bg-[var(--color-teal-500)]/15 text-[var(--color-teal-300)]" : "bg-white/5 text-[var(--color-ash)]"}`}>{item.done ? <CheckIcon size={16} /> : <XIcon size={16} />}</div>
                        <p className="mt-3 text-sm font-black text-[var(--color-pearl)]">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-[30px] border border-[var(--color-gold-500)]/15 bg-[var(--color-gold-500)]/5 p-6">
                    <p className="text-lg font-black text-[var(--color-pearl)]">What people will see</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-mist)]">{draft.display_name || "Your name"}, age, {draft.city || "city"}{draft.region ? `, ${draft.region}` : ""}, photos, bio, intentions, values, lifestyle, and interests. They will not see exact GPS coordinates, email, full birth date, or private account details.</p>
                    <p className="mt-4 text-sm font-black text-[var(--color-gold-300)]">Next: enter Discover and meet one person at a time.</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-9 flex items-start gap-4 rounded-[24px] border border-white/5 bg-white/[0.02] p-5">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--color-gold-500)]/15 text-[var(--color-gold-300)]"><CheckIcon size={14} /></span>
              <p className="text-[14px] font-medium leading-relaxed text-[var(--color-mist)]">{copy.tip}</p>
            </div>

            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {stepIndex > 0 ? (
                <button type="button" onClick={handleBack} disabled={pending} className="inline-flex h-[56px] items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-7 text-[15px] font-bold text-[var(--color-pearl)] transition hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-50">
                  <ArrowIcon size={18} className="rotate-180" />
                  Back
                </button>
              ) : <span />}
              <button type="submit" disabled={pending} className="btn-shine group relative inline-flex h-[60px] w-full items-center justify-center gap-3 overflow-hidden magic-button rounded-2xl bg-[var(--color-pearl)] px-8 text-[16px] font-black text-[var(--color-ink)] shadow-[0_20px_40px_-12px_rgba(251,247,242,0.2)] transition hover:-translate-y-px hover:bg-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:w-auto">
                {pending ? <Spinner /> : null}
                {pending ? (step === "finish" ? "Opening Discover…" : "Saving…") : step === "finish" ? "Enter Discover" : "Continue"}
                {!pending ? <ArrowIcon size={18} className="transition-transform group-hover:translate-x-1" /> : null}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
}
