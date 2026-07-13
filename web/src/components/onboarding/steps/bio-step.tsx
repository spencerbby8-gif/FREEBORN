"use client";

import React, { useState, useMemo } from "react";
import {
  dealBreakerOptions,
  detectUnsafeContactDetails,
  explainUnsafeContactDetails,
  getUnsafeContactDetailGuidance,
  onboardingBioSchema,
  onboardingFieldHints,
} from "@freeborn/shared";
import { ShieldIcon } from "@/components/icons";
import { OnboardingTextInput, OnboardingTextarea } from "../onboarding-field";
import { ChipSelect } from "../chip-select";
import { StepShell } from "../step-shell";

export type BioData = {
  bio: string;
  deal_breakers: string[];
  occupation: string;
  education: string;
};

type BioStepProps = {
  stepIndex: number;
  totalSteps: number;
  initialData: BioData;
  onBack: () => void;
  onSave: (data: BioData) => void;
  pending?: boolean;
  saveStatus?: string;
};

function SafetyPanel({ values }: { values: string[] }) {
  const issues = values.flatMap((value) => detectUnsafeContactDetails(value));
  if (!issues.length) return null;
  const unique = issues.filter((issue, index) => issues.findIndex((item) => item.type === issue.type) === index);
  return (
    <div className="animate-scale-in rounded-[24px] border border-red-400/20 bg-red-500/[0.06] p-4 text-sm shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-200">
          <ShieldIcon size={18} />
        </div>
        <div>
          <p className="font-black text-red-100">Contact details protected</p>
          <p className="mt-1 text-xs leading-5 text-red-100/75">{explainUnsafeContactDetails(unique)}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {unique.slice(0, 4).map((issue) => {
          const guidance = getUnsafeContactDetailGuidance(issue);
          return (
            <div key={issue.type} className="rounded-xl border border-red-100/10 bg-black/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-red-100/80">{guidance.label}</p>
              <p className="mt-1 text-xs leading-4 text-red-100/70">{guidance.why}</p>
              <p className="mt-1 text-xs font-semibold text-[var(--color-pearl)]">Try this: {guidance.rewrite}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BioStep({
  stepIndex,
  totalSteps,
  initialData,
  onBack,
  onSave,
  pending,
  saveStatus,
}: BioStepProps) {
  const [bio, setBio] = useState(initialData.bio);
  const [dealBreakers, setDealBreakers] = useState<string[]>(initialData.deal_breakers);
  const [occupation, setOccupation] = useState(initialData.occupation);
  const [education, setEducation] = useState(initialData.education);
  const [errors, setErrors] = useState<Partial<Record<keyof BioData, string>>>({});

  const unsafeIssues = useMemo(() => [bio, occupation, education], [bio, occupation, education]);

  const handleContinue = (e?: React.FormEvent) => {
    e?.preventDefault();
    const parsed = onboardingBioSchema.safeParse(bio.trim());
    if (!parsed.success) {
      setErrors({ bio: parsed.error.issues[0]?.message ?? "Write a short bio to introduce yourself." });
      return;
    }
    setErrors({});
    onSave({
      bio: parsed.data,
      deal_breakers: dealBreakers,
      occupation: occupation.trim(),
      education: education.trim(),
    });
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Write your first impression."
      subtitle="Keep it short, human, and grounded. Share what lights you up and what feels meaningful."
      onBack={onBack}
      onContinue={handleContinue}
      pending={pending}
      saveStatus={saveStatus}
      footerTip="Do not include phone numbers, email addresses, or social handles. Safety checks protect your contact info."
    >
      <SafetyPanel values={unsafeIssues} />

      <OnboardingTextarea
        label="Short bio"
        name="bio"
        placeholder="A grounded intro: what you value, how you spend a good Sunday, and what feels meaningful to you."
        value={bio}
        error={errors.bio}
        hint={onboardingFieldHints.bio}
        rows={6}
        maxLength={500}
        counter={{ value: bio.length, max: 500 }}
        onChange={(e) => {
          setBio(e.target.value.slice(0, 500));
          if (errors.bio) setErrors((prev) => ({ ...prev, bio: undefined }));
        }}
      />

      <ChipSelect
        label="Deal breakers"
        options={dealBreakerOptions}
        value={dealBreakers}
        max={12}
        optional
        hint={onboardingFieldHints.deal_breakers}
        onChange={(next) => setDealBreakers(next)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <OnboardingTextInput
          label="Occupation"
          name="occupation"
          placeholder="e.g. Architect, Farmer, Nurse"
          value={occupation}
          error={errors.occupation}
          hint={onboardingFieldHints.occupation}
          optional
          onChange={(e) => setOccupation(e.target.value)}
        />

        <OnboardingTextInput
          label="Education"
          name="education"
          placeholder="e.g. University, Self-taught"
          value={education}
          error={errors.education}
          hint={onboardingFieldHints.education}
          optional
          onChange={(e) => setEducation(e.target.value)}
        />
      </div>
    </StepShell>
  );
}
