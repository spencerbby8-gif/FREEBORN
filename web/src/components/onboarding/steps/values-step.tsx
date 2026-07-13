"use client";

import React, { useState } from "react";
import { valueOptions, onboardingValuesSchema } from "@freeborn/shared";
import { ChipSelect } from "../chip-select";
import { StepShell } from "../step-shell";

type ValuesStepProps = {
  stepIndex: number;
  totalSteps: number;
  initialValues: string[];
  onBack: () => void;
  onSave: (values: string[]) => void;
  pending?: boolean;
  saveStatus?: string;
};

export function ValuesStep({
  stepIndex,
  totalSteps,
  initialValues,
  onBack,
  onSave,
  pending,
  saveStatus,
}: ValuesStepProps) {
  const [selected, setSelected] = useState<string[]>(initialValues);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = (e?: React.FormEvent) => {
    e?.preventDefault();
    const parsed = onboardingValuesSchema.safeParse(selected);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Select at least one value.");
      return;
    }
    setError(null);
    onSave(parsed.data);
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Choose your strongest values."
      subtitle="Select the values that matter most for compatibility while keeping your profile warm and inviting."
      onBack={onBack}
      onContinue={handleContinue}
      pending={pending}
      saveStatus={saveStatus}
      error={error}
      footerTip="Balanced values invite genuine connection. Choose up to 8."
    >
      <ChipSelect
        label="Core values"
        options={valueOptions}
        value={selected}
        onChange={(next) => {
          setSelected(next);
          if (error) setError(null);
        }}
        max={8}
        hint="Pick what guides your life choices and relationship goals."
      />
    </StepShell>
  );
}
