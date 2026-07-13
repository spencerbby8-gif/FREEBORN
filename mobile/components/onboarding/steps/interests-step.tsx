import { interestOptions, onboardingFieldHints } from "@freeborn/shared";
import { ChipSelect } from "@/components/onboarding/chip-select";
import type { StepProps } from "../shared";

export function InterestsStep({ draft, errors, onUpdate }: StepProps) {
  return (
    <ChipSelect
      label="Interests"
      options={interestOptions as unknown as string[]}
      value={draft.interests}
      onChange={(next) => onUpdate("interests", next)}
      error={errors.interests}
      hint={onboardingFieldHints.interests}
      max={12}
    />
  );
}
