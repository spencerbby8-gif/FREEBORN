"use client";

import React, { useState } from "react";
import { lifestyleOptions, onboardingLifestyleSchema, onboardingFieldHints } from "@freeborn/shared";
import { ChipSelect } from "../chip-select";
import { StepShell } from "../step-shell";

type LifestyleStepProps = {
  stepIndex: number;
  totalSteps: number;
  initialLifestyle: string[];
  onBack: () => void;
  onSave: (lifestyle: string[]) => void;
  pending?: boolean;
  saveStatus?: string;
};

export function LifestyleStep({
  stepIndex,
  totalSteps,
  initialLifestyle,
  onBack,
  onSave,
  pending,
  saveStatus,
}: LifestyleStepProps) {
  const [selected, setSelected] = useState<string[]>(initialLifestyle);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = (e?: React.FormEvent) => {
    e?.preventDefault();
    const parsed = onboardingLifestyleSchema.safeParse(selected);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Select at least one lifestyle cue.");
      return;
    }
    setError(null);
    onSave(parsed.data);
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Share your everyday rhythm."
      subtitle="Choose lifestyle cues that reveal how you actually live: wellness habits, home rhythm, faith or philosophy, and pace."
      onBack={onBack}
      onContinue={handleContinue}
      pending={pending}
      saveStatus={saveStatus}
      error={error}
      footerTip="Lifestyle cues help others understand your daily rhythm. Choose up to 12."
    >
      <ChipSelect
        label="Lifestyle preferences"
        options={lifestyleOptions}
        value={selected}
        onChange={(next) => {
          setSelected(next);
          if (error) setError(null);
        }}
        max={12}
        hint={onboardingFieldHints.lifestyle_preferences}
      />
    </StepShell>
  );
}
