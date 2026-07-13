"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, XIcon } from "@/components/icons";
import { completePremiumOnboarding } from "@/lib/onboarding/actions";
import { StepShell } from "../step-shell";

type DraftSummary = {
  display_name: string;
  birth_date: string;
  gender: string;
  city: string;
  region: string;
  relationship_goals: string[];
  lifestyle_preferences: string[];
  values: string[];
  interests: string[];
  bio: string;
  photo_count: number;
};

type FinishStepProps = {
  stepIndex: number;
  totalSteps: number;
  draft: DraftSummary;
  onBack: () => void;
};

export function FinishStep({ stepIndex, totalSteps, draft, onBack }: FinishStepProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; title: string; body: string } | null>(null);

  const completionItems = [
    { label: "Identity", done: Boolean(draft.display_name && draft.birth_date && draft.gender) },
    { label: "Public city", done: Boolean(draft.city) },
    { label: "Intent", done: draft.relationship_goals.length > 0 },
    { label: "Lifestyle", done: draft.lifestyle_preferences.length > 0 },
    { label: "Values", done: draft.values.length > 0 },
    { label: "Interests", done: draft.interests.length > 0 },
    { label: "Bio", done: draft.bio.length >= 20 },
    { label: "Photos", done: draft.photo_count > 0 },
  ];

  const handleFinish = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setPending(true);
    setNotice(null);
    try {
      const response = await completePremiumOnboarding();
      if (!response.ok) {
        setNotice({
          tone: "error",
          title: "Profile needs attention",
          body: response.error ?? "Review the missing details and try again.",
        });
        return;
      }
      router.push("/app?status=onboarded");
      router.refresh();
    } catch {
      setNotice({
        tone: "error",
        title: "Could not finish onboarding",
        body: "Something went wrong saving your profile state. Please try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Your Freeborn profile is ready."
      subtitle="Review the foundation you built before entering the app. You can update your profile anytime."
      onBack={onBack}
      onContinue={handleFinish}
      continueLabel="Enter Discover"
      pending={pending}
      notice={notice}
      footerTip="Welcome to Freeborn. Your profile foundation is complete."
    >
      <div className="rounded-3xl border border-[var(--color-gold-500)]/20 bg-[radial-gradient(circle_at_20%_0%,rgba(217,167,82,0.15),transparent_40%),rgba(255,255,255,0.025)] p-6 text-center sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gradient-ember)] text-white shadow-lg">
          <CheckIcon size={32} strokeWidth={2.5} />
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.24em] text-[var(--color-gold-300)]">
          Foundation Verified
        </p>
        <h2
          className="mt-2 text-2xl sm:text-3xl font-black text-[var(--color-pearl)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ready to discover with intention.
        </h2>
        <p className="mt-2 max-w-md mx-auto text-xs sm:text-sm leading-6 text-[var(--color-mist)]">
          Your profile has the essentials people need to meet you well: identity, public city, intentions, values, interests, bio, photos, and boundaries.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {completionItems.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-3.5 ${
              item.done
                ? "border-[var(--color-teal-500)]/25 bg-[var(--color-teal-500)]/[0.08]"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-xl ${
                item.done ? "bg-[var(--color-teal-500)]/15 text-[var(--color-teal-300)]" : "bg-white/10 text-[var(--color-ash)]"
              }`}
            >
              {item.done ? <CheckIcon size={14} /> : <XIcon size={14} />}
            </div>
            <p className="mt-2.5 text-xs font-black text-[var(--color-pearl)]">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--color-gold-500)]/15 bg-[var(--color-gold-500)]/[0.04] p-5">
        <p className="text-sm font-black text-[var(--color-pearl)]">What people will see</p>
        <p className="mt-1.5 text-xs leading-5 text-[var(--color-mist)]">
          {draft.display_name || "Your name"}, age, {draft.city || "city"}
          {draft.region ? `, ${draft.region}` : ""}, photos, bio, intentions, values, lifestyle, and interests. They will not see exact GPS coordinates, email address, full birth date, or account provider details.
        </p>
      </div>
    </StepShell>
  );
}
