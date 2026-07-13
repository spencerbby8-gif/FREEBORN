import { onboardingFieldHints } from "@freeborn/shared";
import { OnboardingInput } from "@/components/onboarding/onboarding-input";
import type { StepProps } from "../shared";

export function LocationStep({ draft, errors, onUpdate }: StepProps) {
  return (
    <>
      <OnboardingInput
        label="City"
        value={draft.city}
        error={errors.city}
        placeholder="Where do you live?"
        onChangeText={(v) => onUpdate("city", v)}
        hint="Only your city is shown publicly — never a street address."
      />
      <OnboardingInput
        label="Region"
        value={draft.region}
        error={errors.region}
        placeholder="State, province, or region"
        onChangeText={(v) => onUpdate("region", v)}
        hint={onboardingFieldHints.region}
        optional
      />
      <OnboardingInput
        label="Country code"
        value={draft.country_code}
        error={errors.country_code}
        placeholder="US"
        onChangeText={(v) => onUpdate("country_code", v.toUpperCase())}
        hint={onboardingFieldHints.country_code}
        optional
        maxLength={2}
      />
    </>
  );
}
