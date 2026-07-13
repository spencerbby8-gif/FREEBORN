"use client";

import React, { useState } from "react";
import { interestOptions, onboardingInterestsSchema, onboardingFieldHints } from "@freeborn/shared";
import { ChipSelect } from "../chip-select";
import { StepShell } from "../step-shell";

type InterestsStepProps = {
  stepIndex: number;
  totalSteps: number;
  initialInterests: string[];
  onBack: () => void;
  onSave: (interests: string[]) => void;
  pending?: boolean;
  saveStatus?: string;
};

export function InterestsStep({
  stepIndex,
  totalSteps,
  initialInterests,
  onBack,
  onSave,
  pending,
  saveStatus,
}: InterestsStepProps) {
  const [selected, setSelected] = useState<string[]>(initialInterests);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = (e?: React.FormEvent) => {
    e?.preventDefault();
    const parsed = onboardingInterestsSchema.safeParse(selected);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Select at least one interest.");
      return;
    }
    setError(null);
    onSave(parsed.data);
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Add conversation starters."
      subtitle="Choose interests people can respond to with something specific — from natural health to food, movement, and culture."
      onBack={onBack}
      onContinue={handleContinue}
      pending={pending}
      saveStatus={saveStatus}
      error={error}
      footerTip="Specific interests make starting a conversation much easier. Choose up to 12."
    >
      <ChipSelect
        label="Interests"
        options={interestOptions}
        value={selected}
        onChange={(next) => {
          setSelected(next);
          if (error) setError(null);
        }}
        max={12}
        hint={onboardingFieldHints.interests}
      />
    </StepShell>
  );
}
