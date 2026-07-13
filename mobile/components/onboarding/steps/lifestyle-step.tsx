import { lifestyleOptions, onboardingFieldHints } from "@freeborn/shared";
import { ChipSelect } from "@/components/onboarding/chip-select";
import type { StepProps } from "../shared";

export function LifestyleStep({ draft, errors, onUpdate }: StepProps) {
  return (
    <ChipSelect
      label="Lifestyle"
      options={lifestyleOptions as unknown as string[]}
      value={draft.lifestyle_preferences}
      onChange={(next) => onUpdate("lifestyle_preferences", next)}
      error={errors.lifestyle_preferences}
      hint={onboardingFieldHints.lifestyle_preferences}
      max={12}
    />
  );
}
