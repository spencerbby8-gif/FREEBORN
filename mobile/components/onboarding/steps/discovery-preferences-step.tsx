import { InfoCardStep } from "./info-card-step";
import type { StepProps } from "../shared";

export function DiscoveryPreferencesStep(_props: StepProps) {
  return (
    <InfoCardStep
      title="Discovery boundaries"
      body="Your age range, distance, and visibility settings can be tuned anytime from Settings → Discovery after onboarding."
      tip="Defaults: ages 22–45, 80 km, all genders visible."
    />
  );
}
