import { useEffect, useState } from "react";
import { onboardingFieldHints } from "@freeborn/shared";
import { OnboardingInput } from "@/components/onboarding/onboarding-input";
import type { StepProps } from "../shared";

export function LocationStep({ draft, errors, onUpdate }: StepProps) {
  const [localCity, setLocalCity] = useState(draft.city);
  const [localRegion, setLocalRegion] = useState(draft.region);
  const [localCountry, setLocalCountry] = useState(draft.country_code);

  useEffect(() => {
    setLocalCity(draft.city);
    setLocalRegion(draft.region);
    setLocalCountry(draft.country_code);
  }, [draft.city, draft.region, draft.country_code]);

  return (
    <>
      <OnboardingInput
        label="City"
        value={localCity}
        error={errors.city}
        placeholder="Where do you live?"
        onChangeText={(v) => {
          setLocalCity(v);
          onUpdate("city", v);
        }}
        onBlur={() => onUpdate("city", localCity)}
        hint="Only your city is shown publicly — never a street address."
      />
      <OnboardingInput
        label="Region"
        value={localRegion}
        error={errors.region}
        placeholder="State, province, or region"
        onChangeText={(v) => {
          setLocalRegion(v);
          onUpdate("region", v);
        }}
        onBlur={() => onUpdate("region", localRegion)}
        hint={onboardingFieldHints.region}
        optional
      />
      <OnboardingInput
        label="Country code"
        value={localCountry}
        error={errors.country_code}
        placeholder="US"
        onChangeText={(v) => {
          const upper = v.toUpperCase();
          setLocalCountry(upper);
          onUpdate("country_code", upper);
        }}
        onBlur={() => onUpdate("country_code", localCountry)}
        hint={onboardingFieldHints.country_code}
        optional
        maxLength={2}
      />
    </>
  );
}
