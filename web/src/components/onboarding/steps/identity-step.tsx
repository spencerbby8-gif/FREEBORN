"use client";

import React, { useState } from "react";
import { genderOptions, onboardingPremiumIdentitySchema, onboardingFieldHints } from "@freeborn/shared";
import { OnboardingTextInput } from "../onboarding-field";
import { DateOfBirthField } from "../date-of-birth-field";
import { SelectMenu } from "../select-menu";
import { StepShell } from "../step-shell";

type IdentityData = {
  display_name: string;
  birth_date: string;
  gender: string;
};

type IdentityStepProps = {
  stepIndex: number;
  totalSteps: number;
  initialData: IdentityData;
  onBack: () => void;
  onSave: (data: IdentityData) => void;
  pending?: boolean;
  saveStatus?: string;
};

export function IdentityStep({
  stepIndex,
  totalSteps,
  initialData,
  onBack,
  onSave,
  pending,
  saveStatus,
}: IdentityStepProps) {
  const [displayName, setDisplayName] = useState(initialData.display_name);
  const [birthDate, setBirthDate] = useState(initialData.birth_date);
  const [gender, setGender] = useState(initialData.gender);
  const [errors, setErrors] = useState<Partial<Record<keyof IdentityData, string>>>({});

  const handleContinue = (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload = {
      display_name: displayName.trim(),
      birth_date: birthDate.trim(),
      gender: gender.trim(),
    };
    const parsed = onboardingPremiumIdentitySchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof IdentityData, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof IdentityData;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    onSave(parsed.data);
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Start with who you are."
      subtitle="Add your display name, private age gate, and gender so Freeborn can introduce you clearly."
      onBack={onBack}
      onContinue={handleContinue}
      pending={pending}
      saveStatus={saveStatus}
      footerTip="Your birth date confirms you are 18+ and displays as age only on your profile card."
    >
      <OnboardingTextInput
        label="Display name"
        name="display_name"
        placeholder="How should Freeborn introduce you?"
        value={displayName}
        error={errors.display_name}
        hint={onboardingFieldHints.display_name}
        autoComplete="nickname"
        onChange={(e) => {
          setDisplayName(e.target.value);
          if (errors.display_name) setErrors((prev) => ({ ...prev, display_name: undefined }));
        }}
      />

      <DateOfBirthField
        value={birthDate}
        error={errors.birth_date}
        hint={onboardingFieldHints.birth_date}
        onChange={(val) => {
          setBirthDate(val);
          if (errors.birth_date) setErrors((prev) => ({ ...prev, birth_date: undefined }));
        }}
      />

      <SelectMenu
        label="Gender"
        value={gender}
        onChange={(val) => {
          setGender(val);
          if (errors.gender) setErrors((prev) => ({ ...prev, gender: undefined }));
        }}
        options={genderOptions.map((o) => ({ value: o.value, label: o.label }))}
        placeholder="Choose how you identify"
        error={errors.gender}
        hint={onboardingFieldHints.gender}
      />
    </StepShell>
  );
}
