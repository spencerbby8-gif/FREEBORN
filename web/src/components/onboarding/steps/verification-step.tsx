"use client";

import React from "react";
import type { ProfilePhoto, UserProfileRow } from "@freeborn/shared";
import { LockIcon, ShieldIcon } from "@/components/icons";
import { VerificationFlow } from "@/components/app/verification-flow";
import { StepShell } from "../step-shell";

type VerificationStepProps = {
  stepIndex: number;
  totalSteps: number;
  profile: UserProfileRow;
  photos: ProfilePhoto[];
  isVerified: boolean;
  onBack: () => void;
  onContinue: () => void;
  pending?: boolean;
  saveStatus?: string;
};

export function VerificationStep({
  stepIndex,
  totalSteps,
  profile,
  photos,
  isVerified,
  onBack,
  onContinue,
  pending,
  saveStatus,
}: VerificationStepProps) {
  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Understand your trust status."
      subtitle="Verification ensures members are real. Freeborn never implies that an unverified profile is verified."
      onBack={onBack}
      onContinue={(e) => {
        e?.preventDefault();
        onContinue();
      }}
      continueLabel="Continue to final check"
      pending={pending}
      saveStatus={saveStatus}
      footerTip="Your profile can still be active while verification is pending. The verified badge appears once approved."
    >
      <VerificationFlow
        profile={profile}
        photos={photos}
        initialState={isVerified ? "approved" : "ready"}
        isOnboarding={true}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <LockIcon size={24} className="text-[var(--color-gold-300)]" />
          <p className="mt-3 text-base font-black text-[var(--color-pearl)]">Private by default</p>
          <p className="mt-1.5 text-xs leading-5 text-[var(--color-mist)]">
            Email, full birth date, exact coordinates, and account details remain hidden from public view.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <ShieldIcon size={24} className="text-[var(--color-teal-300)]" />
          <p className="mt-3 text-base font-black text-[var(--color-pearl)]">Verify anytime</p>
          <p className="mt-1.5 text-xs leading-5 text-[var(--color-mist)]">
            You can complete or update your verification selfie right now or anytime from your Profile Hub.
          </p>
        </div>
      </div>
    </StepShell>
  );
}
